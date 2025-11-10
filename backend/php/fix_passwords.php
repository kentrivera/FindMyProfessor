<?php
$host = 'localhost';
$username = 'root';
$password = '';
$database = 'findmyprofessor';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "==============================================\n";
    echo "Fixing Password Hashes\n";
    echo "==============================================\n\n";
    
    // Generate correct password hashes
    $adminPassword = password_hash('admin123', PASSWORD_BCRYPT);
    $userPassword = password_hash('user123', PASSWORD_BCRYPT);
    
    echo "Generating new password hashes...\n\n";
    
    // Update admin password
    $stmt = $pdo->prepare("UPDATE users SET password_hash = :hash WHERE username = 'admin'");
    $stmt->execute(['hash' => $adminPassword]);
    echo "✓ Updated admin password hash\n";
    
    // Update all student passwords
    $stmt = $pdo->prepare("UPDATE users SET password_hash = :hash WHERE role = 'student'");
    $stmt->execute(['hash' => $userPassword]);
    echo "✓ Updated all student password hashes\n";
    
    // Verify the fix
    echo "\n==============================================\n";
    echo "Verification Test\n";
    echo "==============================================\n\n";
    
    // Test admin login
    $stmt = $pdo->query("SELECT password_hash FROM users WHERE username = 'admin'");
    $admin = $stmt->fetch();
    $adminValid = password_verify('admin123', $admin['password_hash']);
    echo "Admin (admin123): " . ($adminValid ? "✓ PASS" : "❌ FAIL") . "\n";
    
    // Test student login
    $stmt = $pdo->query("SELECT password_hash FROM users WHERE username = 'user'");
    $user = $stmt->fetch();
    $userValid = password_verify('user123', $user['password_hash']);
    echo "Student (user123): " . ($userValid ? "✓ PASS" : "❌ FAIL") . "\n";
    
    if ($adminValid && $userValid) {
        echo "\n✅ All password hashes fixed successfully!\n";
        echo "\nYou can now login with:\n";
        echo "  Admin: admin / admin123\n";
        echo "  Student: user / user123\n\n";
    } else {
        echo "\n❌ Password verification still failing!\n";
    }
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
