<?php
require_once 'config.php';
require_once 'database.php';

echo "Adding new fields to professors table...\n\n";

try {
    $database = new Database();
    $db = $database->connect();

    // Add new columns to professors table
    $queries = [
        "ALTER TABLE professors ADD COLUMN IF NOT EXISTS image VARCHAR(255) DEFAULT NULL AFTER office_location",
        "ALTER TABLE professors ADD COLUMN IF NOT EXISTS expertise TEXT DEFAULT NULL AFTER image",
        "ALTER TABLE professors ADD COLUMN IF NOT EXISTS specialization VARCHAR(255) DEFAULT NULL AFTER expertise",
        "ALTER TABLE professors ADD COLUMN IF NOT EXISTS education TEXT DEFAULT NULL AFTER specialization",
        "ALTER TABLE professors ADD COLUMN IF NOT EXISTS experience TEXT DEFAULT NULL AFTER education",
        "ALTER TABLE professors ADD COLUMN IF NOT EXISTS research_interests TEXT DEFAULT NULL AFTER experience",
        "ALTER TABLE professors ADD COLUMN IF NOT EXISTS publications TEXT DEFAULT NULL AFTER research_interests"
    ];

    foreach ($queries as $query) {
        try {
            $db->exec($query);
            echo "✓ Executed: " . substr($query, 0, 60) . "...\n";
        } catch (PDOException $e) {
            // Column might already exist
            if (strpos($e->getMessage(), 'Duplicate column') !== false) {
                echo "  (Column already exists, skipping)\n";
            } else {
                throw $e;
            }
        }
    }

    echo "\n✅ Successfully added new fields to professors table!\n";
    echo "\nNew fields added:\n";
    echo "  • image (VARCHAR 255) - Profile image path\n";
    echo "  • expertise (TEXT) - Areas of expertise (comma-separated)\n";
    echo "  • specialization (VARCHAR 255) - Primary specialization\n";
    echo "  • education (TEXT) - Educational background\n";
    echo "  • experience (TEXT) - Work experience\n";
    echo "  • research_interests (TEXT) - Research areas\n";
    echo "  • publications (TEXT) - Published works\n";

} catch (PDOException $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
