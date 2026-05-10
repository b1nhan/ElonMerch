<?php
/**
 * Health Check Controller
 * Returns API and database status
 * Available immediately for testing
 */

class HealthController extends BaseController {
    /**
     * Check API and database health
     * Endpoint: GET /
     */
    public function check() {
        $health_status = [
            'api' => 'running',
            'timestamp' => date('c'),
            'environment' => API_ENV,
            'database' => $this->checkDatabase(),
        ];

        Response::success($health_status, 'API is healthy');
    }

    /**
     * Check database connection
     * 
     * @return array Database status
     */
    private function checkDatabase() {
        try {
            $this->db->query('SELECT 1');
            return [
                'status' => 'connected',
                'host' => DB_HOST,
                'database' => DB_NAME,
            ];
        } catch (Exception $e) {
            return [
                'status' => 'disconnected',
                'error' => $e->getMessage(),
            ];
        }
    }
}
