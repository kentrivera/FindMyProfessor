-- FindMyProfessor Database Schema
-- Created: 2025-10-29

CREATE DATABASE IF NOT EXISTS findmyprofessor CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE findmyprofessor;

-- Admins Table
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_username (username)
) ENGINE=InnoDB;

-- Professors Table
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
) ENGINE=InnoDB;

-- Subjects Table
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
) ENGINE=InnoDB;

-- Schedules Table
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
) ENGINE=InnoDB;

-- Attachments Table
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
) ENGINE=InnoDB;

-- Activity Logs Table
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
) ENGINE=InnoDB;

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert Default Admin (password: admin123)
INSERT INTO admins (username, password_hash, email, full_name) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@findmyprof.com', 'System Administrator');

-- Insert Sample Professors
INSERT INTO professors (name, department, contact, email, bio, office_location) VALUES
('Dr. Maria Santos', 'Computer Science', '09171234567', 'maria.santos@university.edu', 'PhD in Computer Science, specializing in AI and Machine Learning', 'Room 301, Science Building'),
('Prof. Juan Dela Cruz', 'Mathematics', '09187654321', 'juan.delacruz@university.edu', 'Master in Mathematics, focus on Applied Mathematics', 'Room 205, Math Building'),
('Dr. Anna Reyes', 'Computer Science', '09191112233', 'anna.reyes@university.edu', 'PhD in Software Engineering, expert in Database Systems', 'Room 305, Science Building'),
('Prof. Pedro Garcia', 'Information Technology', '09181234567', 'pedro.garcia@university.edu', 'Certified Network Engineer, specializing in Cybersecurity', 'Room 401, IT Building'),
('Dr. Linda Tan', 'Computer Science', '09177654321', 'linda.tan@university.edu', 'PhD in Data Science, research in Big Data Analytics', 'Room 307, Science Building');

-- Insert Sample Subjects
INSERT INTO subjects (subject_code, subject_name, professor_id, description, credits) VALUES
('CS101', 'Introduction to Programming', 1, 'Basic programming concepts using Python', 3),
('CS201', 'Data Structures and Algorithms', 1, 'Advanced data structures and algorithm design', 4),
('MATH101', 'Calculus I', 2, 'Differential and integral calculus', 3),
('CS301', 'Database Systems', 3, 'Relational databases, SQL, and database design', 3),
('IT201', 'Network Security', 4, 'Fundamentals of cybersecurity and network protection', 3),
('CS401', 'Machine Learning', 1, 'Introduction to ML algorithms and applications', 4),
('CS302', 'Web Development', 3, 'Full-stack web development with modern frameworks', 3),
('MATH201', 'Linear Algebra', 2, 'Vector spaces, matrices, and linear transformations', 3),
('CS402', 'Data Mining', 5, 'Techniques for extracting knowledge from large datasets', 3);

-- Insert Sample Schedules
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
(5, 9, 'Lab 303', 'Friday', '10:00:00', '13:00:00', '1st Semester', '2024-2025');

-- Insert Sample Activity Log
INSERT INTO activity_logs (admin_id, action, entity_type, entity_id, details) VALUES
(1, 'CREATE', 'professor', 1, 'Created professor: Dr. Maria Santos'),
(1, 'CREATE', 'subject', 1, 'Created subject: CS101 - Introduction to Programming'),
(1, 'CREATE', 'schedule', 1, 'Created schedule for CS101 on Monday 08:00-10:00');

-- ============================================
-- VIEWS FOR CHATBOT QUERIES
-- ============================================

-- View for complete professor information
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
GROUP BY p.id;

-- View for schedule with all details
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
GROUP BY sch.id;

-- ============================================
-- STORED PROCEDURES
-- ============================================

DELIMITER //

-- Search professors by name (fuzzy matching)
CREATE PROCEDURE sp_search_professors(IN search_term VARCHAR(100))
BEGIN
    SELECT 
        p.*,
        COUNT(DISTINCT s.id) as total_subjects
    FROM professors p
    LEFT JOIN subjects s ON p.id = s.professor_id
    WHERE p.name LIKE CONCAT('%', search_term, '%')
       OR p.department LIKE CONCAT('%', search_term, '%')
    GROUP BY p.id;
END //

-- Get professor schedule by name
CREATE PROCEDURE sp_get_professor_schedule(IN prof_name VARCHAR(100))
BEGIN
    SELECT 
        sch.*,
        p.name as professor_name,
        sub.subject_code,
        sub.subject_name
    FROM schedules sch
    JOIN professors p ON sch.professor_id = p.id
    JOIN subjects sub ON sch.subject_id = sub.id
    WHERE p.name LIKE CONCAT('%', prof_name, '%')
    ORDER BY 
        FIELD(sch.day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
        sch.time_start;
END //

DELIMITER ;
