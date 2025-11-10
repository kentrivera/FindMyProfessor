<?php
class ProfessorsController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function getAll() {
        try {
            $search = $_GET['search'] ?? '';
            $department = $_GET['department'] ?? '';

            $query = "SELECT p.*, 
                      COUNT(DISTINCT s.id) as total_subjects,
                      COUNT(DISTINCT sch.id) as total_schedules
                      FROM professors p
                      LEFT JOIN subjects s ON p.id = s.professor_id
                      LEFT JOIN schedules sch ON p.id = sch.professor_id
                      WHERE 1=1";

            if (!empty($search)) {
                $query .= " AND (p.name LIKE :search OR p.department LIKE :search OR p.email LIKE :search)";
            }

            if (!empty($department)) {
                $query .= " AND p.department = :department";
            }

            $query .= " GROUP BY p.id ORDER BY p.name";

            $stmt = $this->db->prepare($query);

            if (!empty($search)) {
                $search_param = "%{$search}%";
                $stmt->bindParam(':search', $search_param);
            }

            if (!empty($department)) {
                $stmt->bindParam(':department', $department);
            }

            $stmt->execute();
            $professors = $stmt->fetchAll();

            http_response_code(200);
            echo json_encode($professors);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch professors: ' . $e->getMessage()]);
        }
    }

    public function getOne($id) {
        try {
            // Get professor basic info
            $query = "SELECT * FROM professors WHERE id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                $professor = $stmt->fetch();
                
                // Get subjects separately
                $subjects_query = "SELECT id, subject_code, subject_name, credits 
                                  FROM subjects WHERE professor_id = :id";
                $subjects_stmt = $this->db->prepare($subjects_query);
                $subjects_stmt->bindParam(':id', $id);
                $subjects_stmt->execute();
                $professor['subjects'] = $subjects_stmt->fetchAll();
                
                // Get schedules separately
                $schedules_query = "SELECT id, classroom, day, time_start, time_end, subject_id 
                                   FROM schedules WHERE professor_id = :id";
                $schedules_stmt = $this->db->prepare($schedules_query);
                $schedules_stmt->bindParam(':id', $id);
                $schedules_stmt->execute();
                $professor['schedules'] = $schedules_stmt->fetchAll();

                http_response_code(200);
                echo json_encode($professor);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Professor not found']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch professor: ' . $e->getMessage()]);
        }
    }

    public function create() {
        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->name) || empty($data->department)) {
            http_response_code(400);
            echo json_encode(['error' => 'Name and department are required']);
            return;
        }

        try {
            $query = "INSERT INTO professors (name, department, contact, email, bio, office_location, 
                      image, expertise, specialization, education, experience, research_interests, publications)
                      VALUES (:name, :department, :contact, :email, :bio, :office_location,
                      :image, :expertise, :specialization, :education, :experience, :research_interests, :publications)";

            $stmt = $this->db->prepare($query);
            
            $stmt->bindParam(':name', $data->name);
            $stmt->bindParam(':department', $data->department);
            $stmt->bindParam(':contact', $data->contact);
            $stmt->bindParam(':email', $data->email);
            $stmt->bindParam(':bio', $data->bio);
            $stmt->bindParam(':office_location', $data->office_location);
            $stmt->bindParam(':image', $data->image);
            $stmt->bindParam(':expertise', $data->expertise);
            $stmt->bindParam(':specialization', $data->specialization);
            $stmt->bindParam(':education', $data->education);
            $stmt->bindParam(':experience', $data->experience);
            $stmt->bindParam(':research_interests', $data->research_interests);
            $stmt->bindParam(':publications', $data->publications);

            if ($stmt->execute()) {
                $id = $this->db->lastInsertId();
                
                // Log activity (simplified - get admin_id from session/token)
                $this->logActivity(1, 'CREATE', 'professor', $id, "Created professor: {$data->name}");

                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'id' => $id,
                    'message' => 'Professor created successfully'
                ]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create professor: ' . $e->getMessage()]);
        }
    }

    public function update($id) {
        $data = json_decode(file_get_contents("php://input"));

        try {
            $query = "UPDATE professors SET 
                      name = :name,
                      department = :department,
                      contact = :contact,
                      email = :email,
                      bio = :bio,
                      office_location = :office_location,
                      image = :image,
                      expertise = :expertise,
                      specialization = :specialization,
                      education = :education,
                      experience = :experience,
                      research_interests = :research_interests,
                      publications = :publications
                      WHERE id = :id";

            $stmt = $this->db->prepare($query);
            
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':name', $data->name);
            $stmt->bindParam(':department', $data->department);
            $stmt->bindParam(':contact', $data->contact);
            $stmt->bindParam(':email', $data->email);
            $stmt->bindParam(':bio', $data->bio);
            $stmt->bindParam(':office_location', $data->office_location);
            $stmt->bindParam(':image', $data->image);
            $stmt->bindParam(':expertise', $data->expertise);
            $stmt->bindParam(':specialization', $data->specialization);
            $stmt->bindParam(':education', $data->education);
            $stmt->bindParam(':experience', $data->experience);
            $stmt->bindParam(':research_interests', $data->research_interests);
            $stmt->bindParam(':publications', $data->publications);

            if ($stmt->execute()) {
                $this->logActivity(1, 'UPDATE', 'professor', $id, "Updated professor: {$data->name}");

                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'message' => 'Professor updated successfully'
                ]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update professor: ' . $e->getMessage()]);
        }
    }

    public function delete($id) {
        try {
            $query = "DELETE FROM professors WHERE id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id);

            if ($stmt->execute()) {
                $this->logActivity(1, 'DELETE', 'professor', $id, "Deleted professor ID: {$id}");

                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'message' => 'Professor deleted successfully'
                ]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete professor: ' . $e->getMessage()]);
        }
    }

    public function uploadImage($id) {
        if (!isset($_FILES['image'])) {
            http_response_code(400);
            echo json_encode(['error' => 'No image file provided']);
            return;
        }

        $file = $_FILES['image'];
        $allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        $max_size = 5 * 1024 * 1024; // 5MB

        if (!in_array($file['type'], $allowed_types)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid file type. Only JPG, PNG, and GIF are allowed']);
            return;
        }

        if ($file['size'] > $max_size) {
            http_response_code(400);
            echo json_encode(['error' => 'File size too large. Maximum 5MB allowed']);
            return;
        }

        try {
            $upload_dir = __DIR__ . '/../uploads/professors/';
            if (!file_exists($upload_dir)) {
                mkdir($upload_dir, 0777, true);
            }

            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = 'prof_' . $id . '_' . time() . '.' . $extension;
            $filepath = $upload_dir . $filename;

            if (move_uploaded_file($file['tmp_name'], $filepath)) {
                $image_url = '/uploads/professors/' . $filename;

                // Update database
                $query = "UPDATE professors SET image = :image WHERE id = :id";
                $stmt = $this->db->prepare($query);
                $stmt->bindParam(':image', $image_url);
                $stmt->bindParam(':id', $id);
                $stmt->execute();

                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'image_url' => $image_url,
                    'message' => 'Image uploaded successfully'
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to upload image']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Upload error: ' . $e->getMessage()]);
        }
    }

    private function logActivity($admin_id, $action, $entity_type, $entity_id, $details) {
        try {
            $query = "INSERT INTO activity_logs (admin_id, action, entity_type, entity_id, details, ip_address) 
                      VALUES (:admin_id, :action, :entity_type, :entity_id, :details, :ip_address)";
            $stmt = $this->db->prepare($query);
            
            $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
            
            $stmt->bindParam(':admin_id', $admin_id);
            $stmt->bindParam(':action', $action);
            $stmt->bindParam(':entity_type', $entity_type);
            $stmt->bindParam(':entity_id', $entity_id);
            $stmt->bindParam(':details', $details);
            $stmt->bindParam(':ip_address', $ip);
            
            $stmt->execute();
        } catch (PDOException $e) {
            error_log("Failed to log activity: " . $e->getMessage());
        }
    }
}
