<?php
require_once 'config.php';
require_once 'database.php';

try {
    $database = new Database();
    $db = $database->connect();
    
    // Modify schedules table to allow NULL values for optional fields
    $queries = [
        "ALTER TABLE schedules MODIFY COLUMN subject_id INT NULL",
        "ALTER TABLE schedules MODIFY COLUMN classroom VARCHAR(50) NULL",
        "ALTER TABLE schedules MODIFY COLUMN day VARCHAR(20) NULL",
        "ALTER TABLE schedules MODIFY COLUMN time_start TIME NULL",
        "ALTER TABLE schedules MODIFY COLUMN time_end TIME NULL"
    ];
    
    foreach ($queries as $query) {
        try {
            $db->exec($query);
            echo "✓ Executed: " . substr($query, 0, 50) . "...\n";
        } catch (PDOException $e) {
            echo "⚠ Warning: " . $e->getMessage() . "\n";
        }
    }
    
    echo "\n✓ Successfully updated schedules table to allow NULL values\n";
    
} catch (PDOException $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}
