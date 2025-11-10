<?php
/**
 * Database Setup Script
 * Run this file once to create the database and load sample data
 */

// Database credentials
$host = 'localhost';
$username = 'root';
$password = '';
$database = 'findmyprofessor';

echo "==============================================\n";
echo "FindMyProfessor - Database Setup\n";
echo "==============================================\n\n";

try {
    // Connect to MySQL server (without database)
    echo "[1/4] Connecting to MySQL server...\n";
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✓ Connected to MySQL server\n\n";

    // Create database
    echo "[2/4] Creating database...\n";
    $pdo->exec("CREATE DATABASE IF NOT EXISTS $database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "✓ Database '$database' created/verified\n\n";

    // Connect to the database
    echo "[3/4] Connecting to database...\n";
    $pdo->exec("USE $database");
    echo "✓ Connected to database '$database'\n\n";

    // Create tables
    echo "[4/4] Creating tables and loading data...\n";
    
    // Drop existing tables
    $pdo->exec("DROP VIEW IF EXISTS vw_schedule_details");
    $pdo->exec("DROP VIEW IF EXISTS vw_professor_details");
    $pdo->exec("DROP PROCEDURE IF EXISTS sp_search_professors");
    $pdo->exec("DROP PROCEDURE IF EXISTS sp_get_professor_schedule");
    $pdo->exec("DROP TABLE IF EXISTS activity_logs");
    $pdo->exec("DROP TABLE IF EXISTS attachments");
    $pdo->exec("DROP TABLE IF EXISTS schedules");
    $pdo->exec("DROP TABLE IF EXISTS subjects");
    $pdo->exec("DROP TABLE IF EXISTS professors");
    $pdo->exec("DROP TABLE IF EXISTS admins");

    // Create admins table
    $pdo->exec("
        CREATE TABLE admins (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            full_name VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP NULL,
            INDEX idx_username (username)
        ) ENGINE=InnoDB
    ");
    echo "  ✓ Created 'admins' table\n";

    // Create professors table
    $pdo->exec("
        CREATE TABLE professors (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            department VARCHAR(100) NOT NULL,
            contact VARCHAR(50),
            email VARCHAR(100),
            bio TEXT,
            office_location VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_name (name),
            INDEX idx_department (department)
        ) ENGINE=InnoDB
    ");
    echo "  ✓ Created 'professors' table\n";

    // Create subjects table
    $pdo->exec("
        CREATE TABLE subjects (
            id INT AUTO_INCREMENT PRIMARY KEY,
            subject_code VARCHAR(20) NOT NULL,
            subject_name VARCHAR(150) NOT NULL,
            professor_id INT NOT NULL,
            description TEXT,
            credits INT DEFAULT 3,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (professor_id) REFERENCES professors(id) ON DELETE CASCADE,
            INDEX idx_subject_code (subject_code),
            INDEX idx_professor (professor_id)
        ) ENGINE=InnoDB
    ");
    echo "  ✓ Created 'subjects' table\n";

    // Create schedules table
    $pdo->exec("
        CREATE TABLE schedules (
            id INT AUTO_INCREMENT PRIMARY KEY,
            professor_id INT NOT NULL,
            subject_id INT NOT NULL,
            classroom VARCHAR(50) NOT NULL,
            day VARCHAR(20) NOT NULL,
            time_start TIME NOT NULL,
            time_end TIME NOT NULL,
            semester VARCHAR(20),
            academic_year VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (professor_id) REFERENCES professors(id) ON DELETE CASCADE,
            FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
            INDEX idx_professor (professor_id),
            INDEX idx_subject (subject_id),
            INDEX idx_day (day)
        ) ENGINE=InnoDB
    ");
    echo "  ✓ Created 'schedules' table\n";

    // Create attachments table
    $pdo->exec("
        CREATE TABLE attachments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            schedule_id INT NOT NULL,
            file_name VARCHAR(255) NOT NULL,
            file_path VARCHAR(500) NOT NULL,
            file_type VARCHAR(50),
            file_size INT,
            description TEXT,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
            INDEX idx_schedule (schedule_id)
        ) ENGINE=InnoDB
    ");
    echo "  ✓ Created 'attachments' table\n";

    // Create activity_logs table
    $pdo->exec("
        CREATE TABLE activity_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            admin_id INT NOT NULL,
            action VARCHAR(100) NOT NULL,
            entity_type VARCHAR(50),
            entity_id INT,
            details TEXT,
            ip_address VARCHAR(45),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
            INDEX idx_admin (admin_id),
            INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB
    ");
    echo "  ✓ Created 'activity_logs' table\n";

    // Insert sample data
    echo "\n  Loading sample data...\n";

    // Insert admin (password: admin123)
    $pdo->exec("
        INSERT INTO admins (username, password_hash, email, full_name) VALUES
        ('admin', '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@findmyprof.com', 'System Administrator')
    ");
    echo "  ✓ Added admin user (username: admin, password: admin123)\n";

    // Insert professors
    $pdo->exec("
        INSERT INTO professors (name, department, contact, email, bio, office_location) VALUES
        ('Dr. Maria Santos', 'Computer Science', '09171234567', 'maria.santos@university.edu', 'PhD in Computer Science, specializing in AI and Machine Learning', 'Room 301, Science Building'),
        ('Prof. Juan Dela Cruz', 'Mathematics', '09187654321', 'juan.delacruz@university.edu', 'Master in Mathematics, focus on Applied Mathematics', 'Room 205, Math Building'),
        ('Dr. Anna Reyes', 'Computer Science', '09191112233', 'anna.reyes@university.edu', 'PhD in Software Engineering, expert in Database Systems', 'Room 305, Science Building'),
        ('Prof. Pedro Garcia', 'Information Technology', '09181234567', 'pedro.garcia@university.edu', 'Certified Network Engineer, specializing in Cybersecurity', 'Room 401, IT Building'),
        ('Dr. Linda Tan', 'Computer Science', '09177654321', 'linda.tan@university.edu', 'PhD in Data Science, research in Big Data Analytics', 'Room 307, Science Building')
    ");
    echo "  ✓ Added 5 professors\n";

    // Insert subjects
    $pdo->exec("
        INSERT INTO subjects (subject_code, subject_name, professor_id, description, credits) VALUES
        ('CS101', 'Introduction to Programming', 1, 'Basic programming concepts using Python', 3),
        ('CS201', 'Data Structures and Algorithms', 1, 'Advanced data structures and algorithm design', 4),
        ('MATH101', 'Calculus I', 2, 'Differential and integral calculus', 3),
        ('CS301', 'Database Systems', 3, 'Relational databases, SQL, and database design', 3),
        ('IT201', 'Network Security', 4, 'Fundamentals of cybersecurity and network protection', 3),
        ('CS401', 'Machine Learning', 1, 'Introduction to ML algorithms and applications', 4),
        ('CS302', 'Web Development', 3, 'Full-stack web development with modern frameworks', 3),
        ('MATH201', 'Linear Algebra', 2, 'Vector spaces, matrices, and linear transformations', 3),
        ('CS402', 'Data Mining', 5, 'Techniques for extracting knowledge from large datasets', 3)
    ");
    echo "  ✓ Added 9 subjects\n";

    // Insert schedules
    $pdo->exec("
        INSERT INTO schedules (professor_id, subject_id, classroom, day, time_start, time_end, semester, academic_year) VALUES
        (1, 1, 'Room 101', 'Monday', '08:00:00', '10:00:00', '1st Semester', '2024-2025'),
        (1, 1, 'Room 101', 'Wednesday', '08:00:00', '10:00:00', '1st Semester', '2024-2025'),
        (1, 2, 'Room 102', 'Tuesday', '10:00:00', '12:00:00', '1st Semester', '2024-2025'),
        (1, 2, 'Room 102', 'Thursday', '10:00:00', '12:00:00', '1st Semester', '2024-2025'),
        (2, 3, 'Room 201', 'Monday', '13:00:00', '15:00:00', '1st Semester', '2024-2025'),
        (2, 3, 'Room 201', 'Friday', '13:00:00', '15:00:00', '1st Semester', '2024-2025'),
        (3, 4, 'Lab 301', 'Wednesday', '13:00:00', '16:00:00', '1st Semester', '2024-2025'),
        (3, 4, 'Lab 301', 'Friday', '13:00:00', '16:00:00', '1st Semester', '2024-2025'),
        (4, 5, 'Lab 401', 'Tuesday', '15:00:00', '18:00:00', '1st Semester', '2024-2025'),
        (1, 6, 'Room 102', 'Monday', '15:00:00', '18:00:00', '1st Semester', '2024-2025'),
        (3, 7, 'Lab 302', 'Thursday', '13:00:00', '16:00:00', '1st Semester', '2024-2025'),
        (2, 8, 'Room 202', 'Tuesday', '08:00:00', '10:00:00', '1st Semester', '2024-2025'),
        (5, 9, 'Lab 303', 'Friday', '10:00:00', '13:00:00', '1st Semester', '2024-2025')
    ");
    echo "  ✓ Added 13 schedules\n";

    // Create views
    $pdo->exec("
        CREATE VIEW vw_professor_details AS
        SELECT 
            p.id,
            p.name,
            p.department,
            p.contact,
            p.email,
            p.bio,
            p.office_location,
            COUNT(DISTINCT s.id) as total_subjects,
            COUNT(DISTINCT sch.id) as total_schedules
        FROM professors p
        LEFT JOIN subjects s ON p.id = s.professor_id
        LEFT JOIN schedules sch ON p.id = sch.professor_id
        GROUP BY p.id
    ");
    echo "  ✓ Created view 'vw_professor_details'\n";

    $pdo->exec("
        CREATE VIEW vw_schedule_details AS
        SELECT 
            sch.id,
            p.name as professor_name,
            p.department,
            sub.subject_code,
            sub.subject_name,
            sch.classroom,
            sch.day,
            sch.time_start,
            sch.time_end,
            sch.semester,
            sch.academic_year,
            GROUP_CONCAT(a.file_name) as attachments
        FROM schedules sch
        JOIN professors p ON sch.professor_id = p.id
        JOIN subjects sub ON sch.subject_id = sub.id
        LEFT JOIN attachments a ON sch.id = a.schedule_id
        GROUP BY sch.id
    ");
    echo "  ✓ Created view 'vw_schedule_details'\n";

    echo "\n==============================================\n";
    echo "✓ DATABASE SETUP COMPLETE!\n";
    echo "==============================================\n\n";
    echo "You can now access the application:\n";
    echo "  • Frontend: http://localhost:3000\n";
    echo "  • Admin login: admin / admin123\n\n";
    echo "Sample Data Loaded:\n";
    echo "  • 1 Admin user\n";
    echo "  • 5 Professors\n";
    echo "  • 9 Subjects\n";
    echo "  • 13 Schedules\n\n";

} catch (PDOException $e) {
    echo "\n❌ ERROR: " . $e->getMessage() . "\n\n";
    echo "Please make sure:\n";
    echo "  1. MySQL/XAMPP is running\n";
    echo "  2. MySQL credentials are correct in config.php\n";
    echo "  3. MySQL user has CREATE DATABASE permission\n\n";
    exit(1);
}
