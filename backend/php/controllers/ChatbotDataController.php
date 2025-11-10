<?php
class ChatbotDataController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function getAllData() {
        try {
            // Get all professors with their subjects and schedules
            $query = "SELECT 
                p.id as professor_id,
                p.name as professor_name,
                p.department,
                p.contact,
                p.email,
                p.office_location,
                s.id as subject_id,
                s.subject_code,
                s.subject_name,
                sch.id as schedule_id,
                sch.classroom,
                sch.day,
                sch.time_start,
                sch.time_end,
                sch.semester,
                sch.academic_year
            FROM professors p
            LEFT JOIN subjects s ON p.id = s.professor_id
            LEFT JOIN schedules sch ON p.id = sch.professor_id AND s.id = sch.subject_id
            ORDER BY p.name, s.subject_code, sch.day, sch.time_start";

            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $results = $stmt->fetchAll();

            // Transform data for chatbot
            $professors_data = [];
            
            foreach ($results as $row) {
                $prof_id = $row['professor_id'];
                
                if (!isset($professors_data[$prof_id])) {
                    $professors_data[$prof_id] = [
                        'id' => $row['professor_id'],
                        'name' => $row['professor_name'],
                        'department' => $row['department'],
                        'contact' => $row['contact'],
                        'email' => $row['email'],
                        'office_location' => $row['office_location'],
                        'subjects' => [],
                        'schedules' => []
                    ];
                }

                // Add subject if not already added
                if ($row['subject_id'] && !in_array($row['subject_id'], array_column($professors_data[$prof_id]['subjects'], 'id'))) {
                    $professors_data[$prof_id]['subjects'][] = [
                        'id' => $row['subject_id'],
                        'code' => $row['subject_code'],
                        'name' => $row['subject_name']
                    ];
                }

                // Add schedule if exists
                if ($row['schedule_id']) {
                    $professors_data[$prof_id]['schedules'][] = [
                        'id' => $row['schedule_id'],
                        'subject_code' => $row['subject_code'],
                        'subject_name' => $row['subject_name'],
                        'classroom' => $row['classroom'],
                        'day' => $row['day'],
                        'time_start' => $row['time_start'],
                        'time_end' => $row['time_end'],
                        'semester' => $row['semester'],
                        'academic_year' => $row['academic_year']
                    ];
                }
            }

            http_response_code(200);
            echo json_encode([
                'professors' => array_values($professors_data),
                'last_updated' => date('Y-m-d H:i:s')
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch chatbot data: ' . $e->getMessage()]);
        }
    }
}
