<?php
/**
 * Add Users Table Script
 * Run this to add student/user login functionality
 */

$host = 'localhost';
$username = 'root';
$password = '';
$database = 'findmyprofessor';

echo "==============================================\n";
echo "Adding Users Table\n";
echo "==============================================\n\n";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create users table
    echo "[1/2] Creating users table...\n";
    $pdo->exec("DROP TABLE IF EXISTS users");
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
            INDEX idx_username (username),
            INDEX idx_student_id (student_id)
        ) ENGINE=InnoDB
    ");
    echo "✓ Created 'users' table\n\n";

    // Insert sample users
    echo "[2/2] Adding sample users...\n";
    $pdo->exec("
        INSERT INTO users (username, password_hash, email, full_name, student_id) VALUES
        ('user', '\$2y\$10\$/0DJtBzuEFtvlLbsnnvLS.jOOu4cNVf0uE/eV8Z6gvIL8HarLD.GO', 'user@student.edu', 'John Student', '2021-00001'),
        ('student1', '\$2y\$10\$/0DJtBzuEFtvlLbsnnvLS.jOOu4cNVf0uE/eV8Z6gvIL8HarLD.GO', 'student1@student.edu', 'Alice Johnson', '2021-00002'),
        ('student2', '\$2y\$10\$/0DJtBzuEFtvlLbsnnvLS.jOOu4cNVf0uE/eV8Z6gvIL8HarLD.GO', 'student2@student.edu', 'Bob Martinez', '2021-00003')
    ");
    echo "✓ Added 3 users (password: user123 for all)\n\n";

    echo "==============================================\n";
    echo "✓ USERS TABLE ADDED!\n";
    echo "==============================================\n\n";
    echo "Test Users:\n";
    echo "  Username: user      | Password: user123\n";
    echo "  Username: student1  | Password: user123\n";
    echo "  Username: student2  | Password: user123\n\n";

} catch (PDOException $e) {
    echo "\n❌ ERROR: " . $e->getMessage() . "\n\n";
    exit(1);
}
