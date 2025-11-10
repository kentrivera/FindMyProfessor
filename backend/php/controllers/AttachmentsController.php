<?php
class AttachmentsController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function getAll() {
        try {
            $schedule_id = $_GET['schedule_id'] ?? '';

            $query = "SELECT a.*, 
                      sch.classroom,
                      sch.day,
                      sch.time_start,
                      sch.time_end,
                      p.name as professor_name,
                      s.subject_code,
                      s.subject_name
                      FROM attachments a
                      LEFT JOIN schedules sch ON a.schedule_id = sch.id
                      LEFT JOIN subjects s ON sch.subject_id = s.id
                      LEFT JOIN professors p ON sch.professor_id = p.id
                      WHERE 1=1";

            if (!empty($schedule_id)) {
                $query .= " AND a.schedule_id = :schedule_id";
            }

            $query .= " ORDER BY a.uploaded_at DESC";

            $stmt = $this->db->prepare($query);

            if (!empty($schedule_id)) {
                $stmt->bindParam(':schedule_id', $schedule_id);
            }

            $stmt->execute();
            $attachments = $stmt->fetchAll();

            http_response_code(200);
            echo json_encode($attachments);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch attachments: ' . $e->getMessage()]);
        }
    }

    public function getOne($id) {
        try {
            $query = "SELECT a.*, 
                      sch.classroom,
                      sch.day,
                      sch.time_start,
                      sch.time_end,
                      p.name as professor_name,
                      s.subject_code,
                      s.subject_name
                      FROM attachments a
                      LEFT JOIN schedules sch ON a.schedule_id = sch.id
                      LEFT JOIN subjects s ON sch.subject_id = s.id
                      LEFT JOIN professors p ON sch.professor_id = p.id
                      WHERE a.id = :id";

            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                http_response_code(200);
                echo json_encode($stmt->fetch());
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Attachment not found']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch attachment: ' . $e->getMessage()]);
        }
    }

    public function upload() {
        if (!isset($_FILES['file']) || !isset($_POST['professor_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'File and professor_id are required']);
            return;
        }

        $file = $_FILES['file'];
        $professor_id = $_POST['professor_id'];
        $description = $_POST['description'] ?? '';

        // Validate file size
        if ($file['size'] > MAX_FILE_SIZE) {
            http_response_code(400);
            echo json_encode(['error' => 'File size exceeds maximum limit']);
            return;
        }

        // Validate file type
        $file_extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($file_extension, ALLOWED_FILE_TYPES)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid file type']);
            return;
        }

        try {
            $this->db->beginTransaction();

            // Create a schedule entry for this attachment
            $sched_query = "INSERT INTO schedules (professor_id, description) VALUES (:professor_id, :description)";
            $sched_stmt = $this->db->prepare($sched_query);
            $sched_stmt->bindParam(':professor_id', $professor_id, PDO::PARAM_INT);
            $sched_stmt->bindParam(':description', $description);
            $sched_stmt->execute();
            
            $schedule_id = $this->db->lastInsertId();

            // Create upload directory if not exists
            if (!file_exists(UPLOAD_DIR)) {
                mkdir(UPLOAD_DIR, 0777, true);
            }

            // Generate unique filename
            $unique_filename = uniqid() . '_' . time() . '.' . $file_extension;
            $file_path = UPLOAD_DIR . $unique_filename;

            // Move uploaded file
            if (move_uploaded_file($file['tmp_name'], $file_path)) {
                // Save to database
                $query = "INSERT INTO attachments (schedule_id, file_name, file_path, file_type, file_size, description)
                          VALUES (:schedule_id, :file_name, :file_path, :file_type, :file_size, :description)";

                $stmt = $this->db->prepare($query);
                
                $stmt->bindParam(':schedule_id', $schedule_id, PDO::PARAM_INT);
                $stmt->bindParam(':file_name', $file['name']);
                $stmt->bindParam(':file_path', $unique_filename);
                $stmt->bindParam(':file_type', $file_extension);
                $stmt->bindParam(':file_size', $file['size'], PDO::PARAM_INT);
                $stmt->bindParam(':description', $description);

                if ($stmt->execute()) {
                    $id = $this->db->lastInsertId();
                    $this->db->commit();
                    $this->logActivity(1, 'CREATE', 'attachment', $id, "Uploaded file: {$file['name']}");

                    http_response_code(201);
                    echo json_encode([
                        'success' => true,
                        'id' => $id,
                        'message' => 'File uploaded successfully',
                        'file_path' => $unique_filename
                    ]);
                } else {
                    $this->db->rollBack();
                    http_response_code(500);
                    echo json_encode(['error' => 'Failed to save attachment to database']);
                }
            } else {
                $this->db->rollBack();
                http_response_code(500);
                echo json_encode(['error' => 'Failed to upload file']);
            }
        } catch (PDOException $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save attachment: ' . $e->getMessage()]);
        }
    }

    public function delete($id) {
        try {
            // Get file path first
            $query = "SELECT file_path FROM attachments WHERE id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                $row = $stmt->fetch();
                $file_path = UPLOAD_DIR . $row['file_path'];

                // Delete from database
                $delete_query = "DELETE FROM attachments WHERE id = :id";
                $delete_stmt = $this->db->prepare($delete_query);
                $delete_stmt->bindParam(':id', $id);

                if ($delete_stmt->execute()) {
                    // Delete physical file
                    if (file_exists($file_path)) {
                        unlink($file_path);
                    }

                    $this->logActivity(1, 'DELETE', 'attachment', $id, "Deleted attachment ID: {$id}");

                    http_response_code(200);
                    echo json_encode([
                        'success' => true,
                        'message' => 'Attachment deleted successfully'
                    ]);
                }
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Attachment not found']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete attachment: ' . $e->getMessage()]);
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
