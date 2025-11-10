<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'findmyprofessor');
define('DB_USER', 'root');
define('DB_PASS', '');

// API Configuration
define('API_SECRET_KEY', 'your-secret-key-change-this-in-production');
define('JWT_SECRET', 'your-jwt-secret-key-change-this');

// CORS Settings
define('ALLOWED_ORIGINS', ['http://localhost:3000', 'http://127.0.0.1:3000']);

// File Upload Settings
define('UPLOAD_DIR', __DIR__ . '/uploads/');
define('MAX_FILE_SIZE', 10485760); // 10MB
define('ALLOWED_FILE_TYPES', ['pdf', 'docx', 'doc', 'jpg', 'jpeg', 'png', 'gif']);

// Timezone
date_default_timezone_set('Asia/Manila');
