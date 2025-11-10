<?php
/**
 * Check existing accounts in database
 */

$host = 'localhost';
$username = 'root';
$password = '';
$database = 'findmyprofessor';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "==============================================\n";
    echo "FindMyProfessor - Account List\n";
    echo "==============================================\n\n";
    
    // Check admins table
    echo "=== ADMIN ACCOUNTS ===\n";
    $stmt = $pdo->query("SELECT id, username, email, full_name FROM admins");
    $admins = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($admins) > 0) {
        foreach ($admins as $admin) {
            echo "ID: {$admin['id']}\n";
            echo "Username: {$admin['username']}\n";
            echo "Password: admin123\n";
            echo "Email: {$admin['email']}\n";
            echo "Full Name: {$admin['full_name']}\n";
            echo "---\n";
        }
    } else {
        echo "No admin accounts found.\n";
    }
    
    // Check users table
    echo "\n=== USER ACCOUNTS ===\n";
    try {
        $stmt = $pdo->query("SELECT id, username, email, full_name FROM users");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (count($users) > 0) {
            foreach ($users as $user) {
                echo "ID: {$user['id']}\n";
                echo "Username: {$user['username']}\n";
                echo "Password: user123\n";
                echo "Email: {$user['email']}\n";
                echo "Full Name: {$user['full_name']}\n";
                echo "---\n";
            }
        } else {
            echo "No user accounts found.\n";
        }
    } catch (PDOException $e) {
        echo "Users table does not exist. Creating it now...\n\n";
        
        // Create users table
        $pdo->exec("
            CREATE TABLE users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                full_name VARCHAR(100) NOT NULL,
                student_id VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP NULL,
                INDEX idx_username (username)
            ) ENGINE=InnoDB
        ");
        echo "✓ Created 'users' table\n";
        
        // Insert sample users (password: user123)
        $pdo->exec("
            INSERT INTO users (username, password_hash, email, full_name, student_id) VALUES
            ('user', '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user@student.edu', 'John Student', '2024-001'),
            ('alice', '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'alice@student.edu', 'Alice Johnson', '2024-002'),
            ('bob', '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'bob@student.edu', 'Bob Martinez', '2024-003')
        ");
        echo "✓ Added 3 student users\n\n";
        
        echo "=== NEW USER ACCOUNTS ===\n";
        echo "Username: user | Password: user123\n";
        echo "Username: alice | Password: user123\n";
        echo "Username: bob | Password: user123\n";
    }
    
    echo "\n==============================================\n";
    echo "Total Admin Accounts: " . count($admins) . "\n";
    echo "==============================================\n";
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
