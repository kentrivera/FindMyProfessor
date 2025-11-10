<?php
require_once 'config.php';
require_once 'database.php';

try {
    $database = new Database();
    $db = $database->connect();
    
    // Add description column to schedules table
    $query = "ALTER TABLE schedules ADD COLUMN description TEXT AFTER academic_year";
    $db->exec($query);
    
    echo "✓ Successfully added description column to schedules table\n";
    
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo "ℹ Description column already exists\n";
    } else {
        echo "✗ Error: " . $e->getMessage() . "\n";
    }
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}
