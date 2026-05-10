<?php
/**
 * Base Controller
 * All controllers extend this class for consistent behavior
 * Provides common methods for database access, validation, and response handling
 */

class BaseController {
    protected $db;
    protected $request_method;
    protected $request_data;
    protected $route_params = [];

    /**
     * Constructor - Initialize controller
     */
    public function __construct() {
        $this->db = Database::getInstance();
        $this->request_method = $_SERVER['REQUEST_METHOD'];
        
        // Parse request data
        $this->parseRequestData();
    }

    /**
     * Parse incoming request data (JSON, form data, query parameters)
     */
    private function parseRequestData() {
        // Parse JSON body
        if ($this->request_method === 'POST' || $this->request_method === 'PUT') {
            $content_type = $_SERVER['CONTENT_TYPE'] ?? '';
            
            if (strpos($content_type, 'application/json') !== false) {
                $raw_data = file_get_contents('php://input');
                $this->request_data = json_decode($raw_data, true) ?? [];
            } else {
                $this->request_data = $_POST ?? [];
            }
        }

        // Parse query parameters
        if ($this->request_method === 'GET') {
            $this->request_data = $_GET ?? [];
        }
    }

    /**
     * Get request data value
     * 
     * @param string $key Key to retrieve
     * @param mixed $default Default value if not found
     * @return mixed
     */
    protected function getInput($key, $default = null) {
        return $this->request_data[$key] ?? $default;
    }

    /**
     * Get all request data
     * 
     * @return array
     */
    protected function getAllInput() {
        return $this->request_data;
    }

    /**
     * Set route parameters (typically from router)
     * 
     * @param array $params Route parameters
     */
    public function setRouteParams($params) {
        $this->route_params = $params;
    }

    /**
     * Get route parameter
     * 
     * @param string $key Parameter key
     * @param mixed $default Default value
     * @return mixed
     */
    protected function getParam($key, $default = null) {
        return $this->route_params[$key] ?? $default;
    }

    /**
     * Validate required fields
     * 
     * @param array $fields Required field names
     * @return array|null Validation errors or null if valid
     */
    protected function validate($fields) {
        $errors = [];

        foreach ($fields as $field) {
            if (empty($this->request_data[$field])) {
                $errors[$field] = ucfirst($field) . ' is required';
            }
        }

        return empty($errors) ? null : $errors;
    }

    /**
     * Validate email format
     * 
     * @param string $email Email to validate
     * @return bool
     */
    protected function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    /**
     * Validate password strength
     * 
     * @param string $password Password to validate
     * @return bool
     */
    protected function validatePassword($password) {
        // Minimum 6 characters
        return strlen($password) >= 6;
    }

    /**
     * Hash a password securely
     * 
     * @param string $password Plain password
     * @return string Hashed password
     */
    protected function hashPassword($password) {
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);
    }

    /**
     * Verify a password against a hash
     * 
     * @param string $password Plain password
     * @param string $hash Password hash
     * @return bool
     */
    protected function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }

    /**
     * Sanitize string input
     * 
     * @param string $input Input to sanitize
     * @return string
     */
    protected function sanitize($input) {
        return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
    }

    /**
     * Check if user is authenticated
     * (Placeholder for JWT verification in Phase 4+)
     * 
     * @return bool|array User data or false
     */
    protected function getAuthenticatedUser() {
        // Placeholder - will implement JWT verification in Phase 4
        return false;
    }

    /**
     * Require authentication
     * 
     * @return array|false User data if authenticated
     */
    protected function requireAuth() {
        $user = $this->getAuthenticatedUser();
        
        if (!$user) {
            Response::unauthorized('Authentication required');
        }

        return $user;
    }

    /**
     * Require specific role
     * 
     * @param string $role Required role
     * @return array User data if authorized
     */
    protected function requireRole($role) {
        $user = $this->requireAuth();

        if ($user['role'] !== $role) {
            Response::forbidden('This action requires ' . $role . ' role');
        }

        return $user;
    }

    /**
     * Execute database query
     * 
     * @param string $sql SQL query
     * @param array $params Query parameters
     * @return bool
     */
    protected function executeQuery($sql, $params = []) {
        return $this->db->query($sql, $params);
    }

    /**
     * Fetch single record
     * 
     * @param string $sql SQL query
     * @param array $params Query parameters
     * @return array|null
     */
    protected function fetchOne($sql, $params = []) {
        $this->db->query($sql, $params);
        return $this->db->fetch();
    }

    /**
     * Fetch multiple records
     * 
     * @param string $sql SQL query
     * @param array $params Query parameters
     * @return array
     */
    protected function fetchAll($sql, $params = []) {
        $this->db->query($sql, $params);
        return $this->db->fetchAll();
    }

    /**
     * Get last insert ID
     * 
     * @return string
     */
    protected function lastInsertId() {
        return $this->db->lastInsertId();
    }

    /**
     * Get row count from last query
     * 
     * @return int
     */
    protected function rowCount() {
        return $this->db->rowCount();
    }

    /**
     * Log action (for audit trail)
     * 
     * @param string $action Action performed
     * @param string $details Additional details
     * @param int $user_id User ID (optional)
     */
    protected function logAction($action, $details = '', $user_id = null) {
        // Placeholder for audit logging
        // Implement in Phase 4+ if needed
        if (is_dev()) {
            error_log("[ACTION] {$action}: {$details}");
        }
    }
}
