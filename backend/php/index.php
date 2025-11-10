<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';
require_once 'database.php';

// Autoload controllers
spl_autoload_register(function ($class_name) {
    $file = __DIR__ . '/controllers/' . $class_name . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});

// Router
$request_uri = $_SERVER['REQUEST_URI'];
$request_method = $_SERVER['REQUEST_METHOD'];

// Remove query string and get path
$path = parse_url($request_uri, PHP_URL_PATH);
// Remove /api prefix if present
$path = preg_replace('#^/api#', '', $path);
$path = trim($path, '/');

// Handle empty path
if (empty($path)) {
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'FindMyProfessor API is running',
        'version' => '1.0.0'
    ]);
    exit();
}

$segments = explode('/', $path);

// Handle file uploads serving
if ($segments[0] === 'uploads' && $request_method === 'GET') {
    // Reconstruct the file path
    array_shift($segments); // Remove 'uploads'
    $file_path = __DIR__ . '/uploads/' . implode('/', $segments);
    
    if (file_exists($file_path) && is_file($file_path)) {
        // Get file info
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime_type = finfo_file($finfo, $file_path);
        finfo_close($finfo);
        
        // Set appropriate headers
        header('Content-Type: ' . $mime_type);
        header('Content-Length: ' . filesize($file_path));
        header('Cache-Control: public, max-age=31536000');
        
        // Output file
        readfile($file_path);
        exit();
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'File not found']);
        exit();
    }
}

// Route handling
try {
    $database = new Database();
    $db = $database->connect();

    // Authentication routes
    if ($segments[0] === 'auth') {
        $controller = new AuthController($db);
        
        if ($segments[1] === 'login' && $request_method === 'POST') {
            $controller->login();
        } elseif ($segments[1] === 'register' && $request_method === 'POST') {
            $controller->register();
        } elseif ($segments[1] === 'logout' && $request_method === 'POST') {
            $controller->logout();
        } elseif ($segments[1] === 'me' && $request_method === 'GET') {
            $controller->getCurrentUser();
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
        }
    }
    
    // Professors routes
    elseif ($segments[0] === 'professors') {
        $controller = new ProfessorsController($db);
        
        if ($request_method === 'GET' && empty($segments[1])) {
            $controller->getAll();
        } elseif ($request_method === 'GET' && !empty($segments[1])) {
            $controller->getOne($segments[1]);
        } elseif ($request_method === 'POST' && empty($segments[1])) {
            $controller->create();
        } elseif ($request_method === 'POST' && !empty($segments[1]) && $segments[2] === 'upload-image') {
            $controller->uploadImage($segments[1]);
        } elseif ($request_method === 'PUT' && !empty($segments[1])) {
            $controller->update($segments[1]);
        } elseif ($request_method === 'DELETE' && !empty($segments[1])) {
            $controller->delete($segments[1]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
        }
    }
    
    // Subjects routes
    elseif ($segments[0] === 'subjects') {
        $controller = new SubjectsController($db);
        
        if ($request_method === 'GET' && empty($segments[1])) {
            $controller->getAll();
        } elseif ($request_method === 'GET' && !empty($segments[1])) {
            $controller->getOne($segments[1]);
        } elseif ($request_method === 'POST') {
            $controller->create();
        } elseif ($request_method === 'PUT' && !empty($segments[1])) {
            $controller->update($segments[1]);
        } elseif ($request_method === 'DELETE' && !empty($segments[1])) {
            $controller->delete($segments[1]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
        }
    }
    
    // Schedules routes
    elseif ($segments[0] === 'schedules') {
        $controller = new SchedulesController($db);
        
        if ($request_method === 'GET' && empty($segments[1])) {
            $controller->getAll();
        } elseif ($request_method === 'GET' && !empty($segments[1])) {
            $controller->getOne($segments[1]);
        } elseif ($request_method === 'POST') {
            $controller->create();
        } elseif ($request_method === 'PUT' && !empty($segments[1])) {
            $controller->update($segments[1]);
        } elseif ($request_method === 'DELETE' && !empty($segments[1])) {
            $controller->delete($segments[1]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
        }
    }
    
    // Attachments routes
    elseif ($segments[0] === 'attachments') {
        $controller = new AttachmentsController($db);
        
        if ($request_method === 'GET' && empty($segments[1])) {
            $controller->getAll();
        } elseif ($request_method === 'GET' && !empty($segments[1])) {
            $controller->getOne($segments[1]);
        } elseif ($request_method === 'POST') {
            $controller->upload();
        } elseif ($request_method === 'DELETE' && !empty($segments[1])) {
            $controller->delete($segments[1]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
        }
    }
    
    // Activity logs routes
    elseif ($segments[0] === 'logs') {
        $controller = new LogsController($db);
        
        if ($request_method === 'GET') {
            $controller->getAll();
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
        }
    }
    
    // Chatbot data endpoint
    elseif ($segments[0] === 'chatbot-data') {
        $controller = new ChatbotDataController($db);
        
        if ($request_method === 'GET') {
            $controller->getAllData();
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
        }
    }
    
    else {
        http_response_code(404);
        echo json_encode([
            'error' => 'Route not found',
            'path' => $path,
            'method' => $request_method,
            'segments' => $segments
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}
