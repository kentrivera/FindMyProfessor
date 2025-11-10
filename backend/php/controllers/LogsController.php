<?php
class LogsController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function getAll() {
        try {
            $limit = $_GET['limit'] ?? 100;
            $offset = $_GET['offset'] ?? 0;
            $action = $_GET['action'] ?? '';
            $entity_type = $_GET['entity_type'] ?? '';

            $query = "SELECT l.*, u.username, u.full_name
                      FROM activity_logs l
                      LEFT JOIN users u ON l.admin_id = u.id
                      WHERE 1=1";

            if (!empty($action)) {
                $query .= " AND l.action = :action";
            }

            if (!empty($entity_type)) {
                $query .= " AND l.entity_type = :entity_type";
            }

            $query .= " ORDER BY l.created_at DESC LIMIT :limit OFFSET :offset";

            $stmt = $this->db->prepare($query);

            if (!empty($action)) {
                $stmt->bindParam(':action', $action);
            }

            if (!empty($entity_type)) {
                $stmt->bindParam(':entity_type', $entity_type);
            }

            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);

            $stmt->execute();
            $logs = $stmt->fetchAll();

            // Get total count
            $count_query = "SELECT COUNT(*) as total FROM activity_logs WHERE 1=1";
            
            if (!empty($action)) {
                $count_query .= " AND action = :action";
            }

            if (!empty($entity_type)) {
                $count_query .= " AND entity_type = :entity_type";
            }

            $count_stmt = $this->db->prepare($count_query);

            if (!empty($action)) {
                $count_stmt->bindParam(':action', $action);
            }

            if (!empty($entity_type)) {
                $count_stmt->bindParam(':entity_type', $entity_type);
            }

            $count_stmt->execute();
            $total = $count_stmt->fetch()['total'];

            http_response_code(200);
            echo json_encode([
                'logs' => $logs,
                'total' => $total,
                'limit' => $limit,
                'offset' => $offset
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch logs: ' . $e->getMessage()]);
        }
    }
}
