<?php
class AuthController {
    private $db;
    private $jwt_secret = 'your_secret_key_change_in_production_2024!@#$%';
    private $jwt_expiry = 86400; // 24 hours

    public function __construct($db) {
        $this->db = $db;
        
        // Start session with secure settings
        if (session_status() === PHP_SESSION_NONE) {
            ini_set('session.cookie_httponly', 1);
            ini_set('session.cookie_secure', 0); // Set to 1 if using HTTPS
            ini_set('session.use_strict_mode', 1);
            session_start();
        }
    }

    /**
     * Generate JWT token
     */
    private function generateJWT($userId, $username, $role) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode([
            'user_id' => $userId,
            'username' => $username,
            'role' => $role,
            'iat' => time(),
            'exp' => time() + $this->jwt_expiry
        ]);

        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $this->jwt_secret, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    /**
     * Verify JWT token
     */
    public function verifyJWT($token) {
        if (!$token) return false;

        $tokenParts = explode('.', $token);
        if (count($tokenParts) !== 3) return false;

        $header = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[0]));
        $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[1]));
        $signatureProvided = $tokenParts[2];

        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $this->jwt_secret, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        if ($base64UrlSignature !== $signatureProvided) return false;

        $payloadData = json_decode($payload, true);
        if (!isset($payloadData['exp']) || $payloadData['exp'] < time()) return false;

        return $payloadData;
    }

    public function login() {
        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->username) || empty($data->password)) {
            http_response_code(400);
            echo json_encode(['error' => 'Username and password are required']);
            return;
        }

        try {
            // Query from unified users table - role is auto-detected
            $query = "SELECT id, username, password_hash, email, full_name, role, student_id, is_active 
                      FROM users WHERE username = :username";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':username', $data->username);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                $row = $stmt->fetch();

                // Check if account is active
                if (!$row['is_active']) {
                    http_response_code(403);
                    echo json_encode(['error' => 'Account is disabled. Please contact administrator.']);
                    return;
                }

                if (password_verify($data->password, $row['password_hash'])) {
                    // Update last login
                    $update_query = "UPDATE users SET last_login = NOW() WHERE id = :id";
                    $update_stmt = $this->db->prepare($update_query);
                    $update_stmt->bindParam(':id', $row['id']);
                    $update_stmt->execute();

                    // Log activity for all users (especially admins)
                    $this->logActivity($row['id'], 'LOGIN', 'user', $row['id'], 
                        ucfirst($row['role']) . ' logged in successfully');

                    // Generate JWT token
                    $token = $this->generateJWT($row['id'], $row['username'], $row['role']);

                    // Store session data
                    $_SESSION['user_id'] = $row['id'];
                    $_SESSION['username'] = $row['username'];
                    $_SESSION['role'] = $row['role'];
                    $_SESSION['login_time'] = time();
                    $_SESSION['ip_address'] = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
                    session_regenerate_id(true); // Prevent session fixation

                    $userData = [
                        'id' => $row['id'],
                        'username' => $row['username'],
                        'email' => $row['email'],
                        'full_name' => $row['full_name'],
                        'role' => $row['role']
                    ];

                    if ($row['role'] === 'student' && isset($row['student_id'])) {
                        $userData['student_id'] = $row['student_id'];
                    }

                    http_response_code(200);
                    echo json_encode([
                        'success' => true,
                        'token' => $token,
                        'user' => $userData,
                        'expires_at' => time() + $this->jwt_expiry
                    ]);
                } else {
                    http_response_code(401);
                    echo json_encode(['error' => 'Invalid credentials']);
                }
            } else {
                http_response_code(401);
                echo json_encode(['error' => 'Invalid credentials']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Login failed: ' . $e->getMessage()]);
        }
    }

    public function register() {
        $data = json_decode(file_get_contents("php://input"));

        // Validate required fields
        if (empty($data->username) || empty($data->password) || empty($data->email) || empty($data->full_name)) {
            http_response_code(400);
            echo json_encode(['error' => 'All fields are required']);
            return;
        }

        // Validate email format
        if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid email format']);
            return;
        }

        // Validate password length
        if (strlen($data->password) < 6) {
            http_response_code(400);
            echo json_encode(['error' => 'Password must be at least 6 characters']);
            return;
        }

        try {
            // Check if username already exists
            $check_query = "SELECT id FROM users WHERE username = :username";
            $check_stmt = $this->db->prepare($check_query);
            $check_stmt->bindParam(':username', $data->username);
            $check_stmt->execute();

            if ($check_stmt->rowCount() > 0) {
                http_response_code(409);
                echo json_encode(['error' => 'Username already exists']);
                return;
            }

            // Check if email already exists
            $check_email = "SELECT id FROM users WHERE email = :email";
            $check_email_stmt = $this->db->prepare($check_email);
            $check_email_stmt->bindParam(':email', $data->email);
            $check_email_stmt->execute();

            if ($check_email_stmt->rowCount() > 0) {
                http_response_code(409);
                echo json_encode(['error' => 'Email already exists']);
                return;
            }

            // All registrations are student accounts
            $role = 'student';
            
            // Hash password
            $password_hash = password_hash($data->password, PASSWORD_BCRYPT);

            // Insert new user
            $query = "INSERT INTO users (username, password_hash, email, full_name, role, is_active, created_at) 
                      VALUES (:username, :password_hash, :email, :full_name, :role, 1, NOW())";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':username', $data->username);
            $stmt->bindParam(':password_hash', $password_hash);
            $stmt->bindParam(':email', $data->email);
            $stmt->bindParam(':full_name', $data->full_name);
            $stmt->bindParam(':role', $role);
            
            if ($stmt->execute()) {
                $userId = $this->db->lastInsertId();
                
                // Log the registration
                $this->logActivity($userId, 'REGISTER', 'user', $userId, 
                    "New {$role} account registered: {$data->username}");

                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'message' => 'Registration successful',
                    'user' => [
                        'id' => $userId,
                        'username' => $data->username,
                        'email' => $data->email,
                        'full_name' => $data->full_name,
                        'role' => $role
                    ]
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Registration failed']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Registration failed: ' . $e->getMessage()]);
        }
    }

    public function logout() {
        // Clear session data
        $_SESSION = array();
        
        // Destroy session cookie
        if (isset($_COOKIE[session_name()])) {
            setcookie(session_name(), '', time() - 3600, '/');
        }
        
        // Destroy session
        session_destroy();
        
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
    }

    public function getCurrentUser() {
        // Get token from Authorization header
        $headers = getallheaders();
        $token = null;
        
        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
            if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                $token = $matches[1];
            }
        }
        
        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return;
        }
        
        // Verify JWT token
        $payload = $this->verifyJWT($token);
        if (!$payload) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }
        
        // Check session validity
        if (!isset($_SESSION['user_id']) || $_SESSION['user_id'] !== $payload['user_id']) {
            http_response_code(401);
            echo json_encode(['error' => 'Session expired']);
            return;
        }
        
        // Verify IP address (optional security check)
        $currentIP = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        if (isset($_SESSION['ip_address']) && $_SESSION['ip_address'] !== $currentIP) {
            http_response_code(401);
            echo json_encode(['error' => 'Session hijacking detected']);
            return;
        }
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $payload['user_id'],
                'username' => $payload['username'],
                'role' => $payload['role']
            ]
        ]);
    }

    /**
     * Middleware to verify authentication
     */
    public function requireAuth($requiredRole = null) {
        $headers = getallheaders();
        $token = null;
        
        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
            if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                $token = $matches[1];
            }
        }
        
        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'Authentication required']);
            exit;
        }
        
        $payload = $this->verifyJWT($token);
        if (!$payload) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            exit;
        }
        
        if ($requiredRole && $payload['role'] !== $requiredRole) {
            http_response_code(403);
            echo json_encode(['error' => 'Insufficient permissions']);
            exit;
        }
        
        return $payload;
    }

    private function logActivity($user_id, $action, $entity_type, $entity_id, $details) {
        try {
            $query = "INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address) 
                      VALUES (:user_id, :action, :entity_type, :entity_id, :details, :ip_address)";
            $stmt = $this->db->prepare($query);
            
            $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
            
            $stmt->bindParam(':user_id', $user_id);
            $stmt->bindParam(':action', $action);
            $stmt->bindParam(':entity_type', $entity_type);
            $stmt->bindParam(':entity_id', $entity_id);
            $stmt->bindParam(':details', $details);
            $stmt->bindParam(':ip_address', $ip);
            
            $stmt->execute();
        } catch (PDOException $e) {
            error_log("Failed to log activity: " . $e->getMessage());
        }
    }
}
