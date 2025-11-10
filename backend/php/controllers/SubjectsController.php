<?php
class SubjectsController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function getAll() {
        try {
            $professor_id = $_GET['professor_id'] ?? '';

            $query = "SELECT s.*, p.name as professor_name, p.department
                      FROM subjects s
                      JOIN professors p ON s.professor_id = p.id
                      WHERE 1=1";

            if (!empty($professor_id)) {
                $query .= " AND s.professor_id = :professor_id";
            }

            $query .= " ORDER BY s.subject_code";

            $stmt = $this->db->prepare($query);

            if (!empty($professor_id)) {
                $stmt->bindParam(':professor_id', $professor_id);
            }

            $stmt->execute();
            $subjects = $stmt->fetchAll();

            http_response_code(200);
            echo json_encode($subjects);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch subjects: ' . $e->getMessage()]);
        }
    }

    public function getOne($id) {
        try {
            $query = "SELECT s.*, p.name as professor_name, p.department
                      FROM subjects s
                      JOIN professors p ON s.professor_id = p.id
                      WHERE s.id = :id";

            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                http_response_code(200);
                echo json_encode($stmt->fetch());
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Subject not found']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch subject: ' . $e->getMessage()]);
        }
    }

    public function create() {
        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->subject_code) || empty($data->subject_name) || empty($data->professor_id)) {
            http_response_code(400);
            echo json_encode(['error' => 'Subject code, name, and professor are required']);
            return;
        }

        try {
            $query = "INSERT INTO subjects (subject_code, subject_name, professor_id, description, credits)
                      VALUES (:subject_code, :subject_name, :professor_id, :description, :credits)";

            $stmt = $this->db->prepare($query);
            
            $credits = $data->credits ?? 3;
            
            $stmt->bindParam(':subject_code', $data->subject_code);
            $stmt->bindParam(':subject_name', $data->subject_name);
            $stmt->bindParam(':professor_id', $data->professor_id);
            $stmt->bindParam(':description', $data->description);
            $stmt->bindParam(':credits', $credits);

            if ($stmt->execute()) {
                $id = $this->db->lastInsertId();
                $this->logActivity(1, 'CREATE', 'subject', $id, "Created subject: {$data->subject_code}");

                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'id' => $id,
                    'message' => 'Subject created successfully'
                ]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create subject: ' . $e->getMessage()]);
        }
    }

    public function update($id) {
        $data = json_decode(file_get_contents("php://input"));

        try {
            $query = "UPDATE subjects SET 
                      subject_code = :subject_code,
                      subject_name = :subject_name,
                      professor_id = :professor_id,
                      description = :description,
                      credits = :credits
                      WHERE id = :id";

            $stmt = $this->db->prepare($query);
            
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':subject_code', $data->subject_code);
            $stmt->bindParam(':subject_name', $data->subject_name);
            $stmt->bindParam(':professor_id', $data->professor_id);
            $stmt->bindParam(':description', $data->description);
            $stmt->bindParam(':credits', $data->credits);

            if ($stmt->execute()) {
                $this->logActivity(1, 'UPDATE', 'subject', $id, "Updated subject: {$data->subject_code}");

                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'message' => 'Subject updated successfully'
                ]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update subject: ' . $e->getMessage()]);
        }
    }

    public function delete($id) {
        try {
            $query = "DELETE FROM subjects WHERE id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id);

            if ($stmt->execute()) {
                $this->logActivity(1, 'DELETE', 'subject', $id, "Deleted subject ID: {$id}");

                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'message' => 'Subject deleted successfully'
                ]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete subject: ' . $e->getMessage()]);
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
