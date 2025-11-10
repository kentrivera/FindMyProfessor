<?php
class SchedulesController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function getAll() {
        try {
            $professor_id = $_GET['professor_id'] ?? '';
            $subject_id = $_GET['subject_id'] ?? '';
            $day = $_GET['day'] ?? '';

            $query = "SELECT sch.*, 
                      p.name as professor_name,
                      p.department,
                      s.subject_code,
                      s.subject_name,
                      (SELECT COUNT(*) FROM attachments a WHERE a.schedule_id = sch.id) as attachment_count
                      FROM schedules sch
                      LEFT JOIN professors p ON sch.professor_id = p.id
                      LEFT JOIN subjects s ON sch.subject_id = s.id
                      WHERE 1=1";

            if (!empty($professor_id)) {
                $query .= " AND sch.professor_id = :professor_id";
            }

            if (!empty($subject_id)) {
                $query .= " AND sch.subject_id = :subject_id";
            }

            if (!empty($day)) {
                $query .= " AND sch.day = :day";
            }

            $query .= " ORDER BY sch.id DESC";

            $stmt = $this->db->prepare($query);

            if (!empty($professor_id)) {
                $stmt->bindParam(':professor_id', $professor_id);
            }

            if (!empty($subject_id)) {
                $stmt->bindParam(':subject_id', $subject_id);
            }

            if (!empty($day)) {
                $stmt->bindParam(':day', $day);
            }

            $stmt->execute();
            $schedules = $stmt->fetchAll();

            http_response_code(200);
            echo json_encode($schedules);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch schedules: ' . $e->getMessage()]);
        }
    }

    public function getOne($id) {
        try {
            $query = "SELECT sch.*, 
                      p.name as professor_name,
                      p.department,
                      s.subject_code,
                      s.subject_name,
                      (SELECT JSON_ARRAYAGG(
                          JSON_OBJECT(
                              'id', a.id,
                              'file_name', a.file_name,
                              'file_path', a.file_path,
                              'file_type', a.file_type,
                              'description', a.description
                          )
                      ) FROM attachments a WHERE a.schedule_id = sch.id) as attachments
                      FROM schedules sch
                      LEFT JOIN professors p ON sch.professor_id = p.id
                      LEFT JOIN subjects s ON sch.subject_id = s.id
                      WHERE sch.id = :id";

            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                $schedule = $stmt->fetch();
                $schedule['attachments'] = json_decode($schedule['attachments'] ?? '[]');

                http_response_code(200);
                echo json_encode($schedule);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Schedule not found']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch schedule: ' . $e->getMessage()]);
        }
    }

    public function create() {
        // Check if this is a file upload (multipart/form-data)
        $hasFile = isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK;
        
        if ($hasFile) {
            // Handle multipart form data
            $data = (object) $_POST;
        } else {
            // Handle JSON data
            $data = json_decode(file_get_contents("php://input"));
        }

        if (empty($data->professor_id)) {
            http_response_code(400);
            echo json_encode(['error' => 'Professor is required']);
            return;
        }

        try {
            $this->db->beginTransaction();

            // Insert schedule
            $query = "INSERT INTO schedules (professor_id, subject_id, classroom, day, time_start, time_end, semester, academic_year, description)
                      VALUES (:professor_id, :subject_id, :classroom, :day, :time_start, :time_end, :semester, :academic_year, :description)";

            $stmt = $this->db->prepare($query);
            
            // Convert empty strings to NULL for proper handling
            $subject_id = !empty($data->subject_id) ? $data->subject_id : null;
            $classroom = !empty($data->classroom) ? $data->classroom : null;
            $day = !empty($data->day) ? $data->day : null;
            $time_start = !empty($data->time_start) ? $data->time_start : null;
            $time_end = !empty($data->time_end) ? $data->time_end : null;
            $semester = $data->semester ?? '';
            $academic_year = $data->academic_year ?? '';
            $description = $data->description ?? '';
            
            $stmt->bindParam(':professor_id', $data->professor_id);
            $stmt->bindParam(':subject_id', $subject_id, PDO::PARAM_INT);
            $stmt->bindParam(':classroom', $classroom);
            $stmt->bindParam(':day', $day);
            $stmt->bindParam(':time_start', $time_start);
            $stmt->bindParam(':time_end', $time_end);
            $stmt->bindParam(':semester', $semester);
            $stmt->bindParam(':academic_year', $academic_year);
            $stmt->bindParam(':description', $description);

            if ($stmt->execute()) {
                $schedule_id = $this->db->lastInsertId();
                
                // Handle file upload if present
                $file_path = null;
                if ($hasFile) {
                    $file = $_FILES['file'];
                    
                    // Validate file size
                    if ($file['size'] > MAX_FILE_SIZE) {
                        $this->db->rollBack();
                        http_response_code(400);
                        echo json_encode(['error' => 'File size exceeds maximum limit']);
                        return;
                    }

                    // Validate file type (images only)
                    $file_extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
                    $allowed_image_types = ['jpg', 'jpeg', 'png', 'gif'];
                    if (!in_array($file_extension, $allowed_image_types)) {
                        $this->db->rollBack();
                        http_response_code(400);
                        echo json_encode(['error' => 'Only image files (JPG, PNG, GIF) are allowed']);
                        return;
                    }

                    // Create schedules upload directory if not exists
                    $schedules_dir = UPLOAD_DIR . 'schedules/';
                    if (!file_exists($schedules_dir)) {
                        mkdir($schedules_dir, 0777, true);
                    }

                    // Generate unique filename
                    $unique_filename = uniqid() . '_' . time() . '.' . $file_extension;
                    $file_path = $schedules_dir . $unique_filename;

                    // Move uploaded file
                    if (move_uploaded_file($file['tmp_name'], $file_path)) {
                        // Save to attachments table
                        $att_query = "INSERT INTO attachments (schedule_id, file_name, file_path, file_type, file_size, description)
                                      VALUES (:schedule_id, :file_name, :file_path, :file_type, :file_size, :description)";

                        $att_stmt = $this->db->prepare($att_query);
                        
                        $relative_path = 'schedules/' . $unique_filename;
                        
                        $att_stmt->bindParam(':schedule_id', $schedule_id, PDO::PARAM_INT);
                        $att_stmt->bindParam(':file_name', $file['name']);
                        $att_stmt->bindParam(':file_path', $relative_path);
                        $att_stmt->bindParam(':file_type', $file_extension);
                        $att_stmt->bindParam(':file_size', $file['size'], PDO::PARAM_INT);
                        $att_stmt->bindParam(':description', $description);

                        if (!$att_stmt->execute()) {
                            error_log("Failed to insert attachment: " . print_r($att_stmt->errorInfo(), true));
                            $this->db->rollBack();
                            http_response_code(500);
                            echo json_encode(['error' => 'Failed to save attachment to database']);
                            return;
                        }
                    } else {
                        error_log("Failed to move uploaded file from {$file['tmp_name']} to {$file_path}");
                        $this->db->rollBack();
                        http_response_code(500);
                        echo json_encode(['error' => 'Failed to save uploaded file']);
                        return;
                    }
                }

                $this->db->commit();
                $this->logActivity(1, 'CREATE', 'schedule', $schedule_id, "Created schedule for {$data->classroom}");

                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'id' => $schedule_id,
                    'message' => 'Schedule created successfully',
                    'has_attachment' => $hasFile
                ]);
            }
        } catch (PDOException $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create schedule: ' . $e->getMessage()]);
        }
    }

    public function update($id) {
        // Check if this is a file upload (multipart/form-data)
        $hasFile = isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK;
        
        if ($hasFile) {
            // Handle multipart form data
            $data = (object) $_POST;
        } else {
            // Handle JSON data
            $data = json_decode(file_get_contents("php://input"));
        }

        try {
            $this->db->beginTransaction();

            // Update schedule
            $query = "UPDATE schedules SET 
                      professor_id = :professor_id,
                      subject_id = :subject_id,
                      classroom = :classroom,
                      day = :day,
                      time_start = :time_start,
                      time_end = :time_end,
                      semester = :semester,
                      academic_year = :academic_year,
                      description = :description
                      WHERE id = :id";

            $stmt = $this->db->prepare($query);
            
            // Convert empty strings to NULL for proper handling
            $subject_id = !empty($data->subject_id) ? $data->subject_id : null;
            $classroom = !empty($data->classroom) ? $data->classroom : null;
            $day = !empty($data->day) ? $data->day : null;
            $time_start = !empty($data->time_start) ? $data->time_start : null;
            $time_end = !empty($data->time_end) ? $data->time_end : null;
            $semester = $data->semester ?? '';
            $academic_year = $data->academic_year ?? '';
            $description = $data->description ?? '';
            
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':professor_id', $data->professor_id);
            $stmt->bindParam(':subject_id', $subject_id, PDO::PARAM_INT);
            $stmt->bindParam(':classroom', $classroom);
            $stmt->bindParam(':day', $day);
            $stmt->bindParam(':time_start', $time_start);
            $stmt->bindParam(':time_end', $time_end);
            $stmt->bindParam(':semester', $semester);
            $stmt->bindParam(':academic_year', $academic_year);
            $stmt->bindParam(':description', $description);

            if ($stmt->execute()) {
                // Handle file upload if present
                if ($hasFile) {
                    $file = $_FILES['file'];
                    
                    // Validate file size
                    if ($file['size'] > MAX_FILE_SIZE) {
                        $this->db->rollBack();
                        http_response_code(400);
                        echo json_encode(['error' => 'File size exceeds maximum limit']);
                        return;
                    }

                    // Validate file type (images only)
                    $file_extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
                    $allowed_image_types = ['jpg', 'jpeg', 'png', 'gif'];
                    if (!in_array($file_extension, $allowed_image_types)) {
                        $this->db->rollBack();
                        http_response_code(400);
                        echo json_encode(['error' => 'Only image files (JPG, PNG, GIF) are allowed']);
                        return;
                    }

                    // Create schedules upload directory if not exists
                    $schedules_dir = UPLOAD_DIR . 'schedules/';
                    if (!file_exists($schedules_dir)) {
                        mkdir($schedules_dir, 0777, true);
                    }

                    // Generate unique filename
                    $unique_filename = uniqid() . '_' . time() . '.' . $file_extension;
                    $file_path = $schedules_dir . $unique_filename;

                    // Move uploaded file
                    if (move_uploaded_file($file['tmp_name'], $file_path)) {
                        // Save to attachments table
                        $att_query = "INSERT INTO attachments (schedule_id, file_name, file_path, file_type, file_size, description)
                                      VALUES (:schedule_id, :file_name, :file_path, :file_type, :file_size, :description)";

                        $att_stmt = $this->db->prepare($att_query);
                        
                        $relative_path = 'schedules/' . $unique_filename;
                        
                        $att_stmt->bindParam(':schedule_id', $id, PDO::PARAM_INT);
                        $att_stmt->bindParam(':file_name', $file['name']);
                        $att_stmt->bindParam(':file_path', $relative_path);
                        $att_stmt->bindParam(':file_type', $file_extension);
                        $att_stmt->bindParam(':file_size', $file['size'], PDO::PARAM_INT);
                        $att_stmt->bindParam(':description', $description);

                        if (!$att_stmt->execute()) {
                            error_log("Failed to insert attachment: " . print_r($att_stmt->errorInfo(), true));
                            $this->db->rollBack();
                            http_response_code(500);
                            echo json_encode(['error' => 'Failed to save attachment to database']);
                            return;
                        }
                    } else {
                        error_log("Failed to move uploaded file from {$file['tmp_name']} to {$file_path}");
                        $this->db->rollBack();
                        http_response_code(500);
                        echo json_encode(['error' => 'Failed to save uploaded file']);
                        return;
                    }
                }

                $this->db->commit();
                $this->logActivity(1, 'UPDATE', 'schedule', $id, "Updated schedule ID: {$id}");

                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'message' => 'Schedule updated successfully'
                ]);
            }
        } catch (PDOException $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update schedule: ' . $e->getMessage()]);
        }
    }

    public function delete($id) {
        try {
            $query = "DELETE FROM schedules WHERE id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id);

            if ($stmt->execute()) {
                $this->logActivity(1, 'DELETE', 'schedule', $id, "Deleted schedule ID: {$id}");

                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'message' => 'Schedule deleted successfully'
                ]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete schedule: ' . $e->getMessage()]);
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
