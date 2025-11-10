<?php
/**
 * Migrate to single users table with role-based access
 */

$host = 'localhost';
$username = 'root';
$password = '';
$database = 'findmyprofessor';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "==============================================\n";
    echo "Migrating to Single Users Table\n";
    echo "==============================================\n\n";
    
    // Drop old users table if exists
    $pdo->exec("DROP TABLE IF EXISTS users_old");
    
    // Rename current users table to backup
    try {
        $pdo->exec("RENAME TABLE users TO users_old");
        echo "✓ Backed up old users table\n";
    } catch (PDOException $e) {
        echo "! No existing users table to backup\n";
    }
    
    // Create new unified users table
    $pdo->exec("
        CREATE TABLE users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            full_name VARCHAR(100) NOT NULL,
            role ENUM('admin', 'student') NOT NULL DEFAULT 'student',
            student_id VARCHAR(50) NULL,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP NULL,
            INDEX idx_username (username),
            INDEX idx_role (role),
            INDEX idx_email (email)
        ) ENGINE=InnoDB
    ");
    echo "✓ Created new unified users table\n";
    
    // Migrate data from admins table
    echo "\nMigrating existing data...\n";
    
    try {
        $stmt = $pdo->query("SELECT id, username, password_hash, email, full_name FROM admins");
        $admins = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($admins as $admin) {
            $pdo->exec("
                INSERT INTO users (username, password_hash, email, full_name, role) 
                VALUES (
                    '{$admin['username']}', 
                    '{$admin['password_hash']}', 
                    '{$admin['email']}', 
                    '{$admin['full_name']}', 
                    'admin'
                )
            ");
        }
        echo "  ✓ Migrated " . count($admins) . " admin(s)\n";
    } catch (PDOException $e) {
        echo "  ! No admins to migrate\n";
    }
    
    // Migrate data from old users table
    try {
        $stmt = $pdo->query("SELECT id, username, password_hash, email, full_name, student_id FROM users_old");
        $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($students as $student) {
            $studentId = $student['student_id'] ?? null;
            $studentIdValue = $studentId ? "'$studentId'" : "NULL";
            
            $pdo->exec("
                INSERT INTO users (username, password_hash, email, full_name, role, student_id) 
                VALUES (
                    '{$student['username']}', 
                    '{$student['password_hash']}', 
                    '{$student['email']}', 
                    '{$student['full_name']}', 
                    'student',
                    $studentIdValue
                )
            ");
        }
        echo "  ✓ Migrated " . count($students) . " student(s)\n";
    } catch (PDOException $e) {
        echo "  ! No students to migrate\n";
    }
    
    // Add sample data if no users exist
    $count = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    
    if ($count == 0) {
        echo "\nNo existing users found. Adding sample data...\n";
        
        // Password: admin123 and user123 (both use same hash for demo)
        $passwordHash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
        
        $pdo->exec("
            INSERT INTO users (username, password_hash, email, full_name, role, student_id) VALUES
            ('admin', '$passwordHash', 'admin@findmyprof.com', 'System Administrator', 'admin', NULL),
            ('user', '$passwordHash', 'user@student.edu', 'John Student', 'student', '2024-001'),
            ('alice', '$passwordHash', 'alice@student.edu', 'Alice Johnson', 'student', '2024-002'),
            ('bob', '$passwordHash', 'bob@student.edu', 'Bob Martinez', 'student', '2024-003')
        ");
        echo "  ✓ Added 1 admin and 3 students\n";
    }
    
    // Update activity_logs foreign key to point to new users table
    echo "\nUpdating foreign keys...\n";
    
    try {
        // Drop old foreign key
        $pdo->exec("ALTER TABLE activity_logs DROP FOREIGN KEY activity_logs_ibfk_1");
    } catch (PDOException $e) {
        // Foreign key might not exist
    }
    
    // Add new foreign key with cascade
    try {
        $pdo->exec("
            ALTER TABLE activity_logs 
            ADD COLUMN user_id INT AFTER admin_id,
            ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ");
        
        // Copy admin_id to user_id
        $pdo->exec("UPDATE activity_logs SET user_id = admin_id WHERE admin_id IS NOT NULL");
        
        echo "  ✓ Updated activity_logs foreign key\n";
    } catch (PDOException $e) {
        echo "  ! activity_logs already updated\n";
    }
    
    // Drop old admins table (backup first)
    echo "\nCleaning up old tables...\n";
    try {
        $pdo->exec("DROP TABLE IF EXISTS admins_backup");
        $pdo->exec("RENAME TABLE admins TO admins_backup");
        echo "  ✓ Backed up admins table (admins_backup)\n";
    } catch (PDOException $e) {
        echo "  ! No admins table to backup\n";
    }
    
    // Show final users
    echo "\n==============================================\n";
    echo "Migration Complete! Current Users:\n";
    echo "==============================================\n\n";
    
    $stmt = $pdo->query("SELECT username, email, full_name, role, student_id FROM users ORDER BY role DESC, id");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($users as $user) {
        echo "Username: {$user['username']}\n";
        echo "Role: " . strtoupper($user['role']) . "\n";
        echo "Full Name: {$user['full_name']}\n";
        echo "Email: {$user['email']}\n";
        if ($user['student_id']) {
            echo "Student ID: {$user['student_id']}\n";
        }
        echo "Password: " . ($user['role'] === 'admin' ? 'admin123' : 'user123') . "\n";
        echo "---\n";
    }
    
    echo "\n✅ All users are now in a single table!\n";
    echo "Role is automatically detected during login.\n\n";
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
