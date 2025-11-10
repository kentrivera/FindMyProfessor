<?php
$host = 'localhost';
$username = 'root';
$password = '';
$database = 'findmyprofessor';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "==============================================\n";
    echo "Database Status Check\n";
    echo "==============================================\n\n";
    
    // Check users table
    echo "Checking USERS table:\n";
    $stmt = $pdo->query("SELECT username, role, is_active, email FROM users ORDER BY role DESC");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($users) > 0) {
        foreach ($users as $user) {
            echo "\nUsername: {$user['username']}\n";
            echo "Role: {$user['role']}\n";
            echo "Active: {$user['is_active']}\n";
            echo "Email: {$user['email']}\n";
            echo "Password: " . ($user['role'] === 'admin' ? 'admin123' : 'user123') . "\n";
            echo "---";
        }
        echo "\n\n✓ Total users: " . count($users) . "\n";
    } else {
        echo "❌ No users found!\n";
    }
    
    // Test password verification
    echo "\n==============================================\n";
    echo "Testing Password Verification\n";
    echo "==============================================\n\n";
    
    $stmt = $pdo->query("SELECT username, password_hash FROM users WHERE username = 'admin'");
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($admin) {
        $testPassword = 'admin123';
        $isValid = password_verify($testPassword, $admin['password_hash']);
        
        echo "Admin username: {$admin['username']}\n";
        echo "Password hash: " . substr($admin['password_hash'], 0, 30) . "...\n";
        echo "Test password: $testPassword\n";
        echo "Verification: " . ($isValid ? "✓ PASS" : "❌ FAIL") . "\n";
    } else {
        echo "❌ Admin user not found!\n";
    }
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
