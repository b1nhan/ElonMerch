<?php
/**
 * Standardized JSON Response Handler
 * Ensures all API responses follow a consistent structure
 * 
 * Response Structure:
 * {
 *   "status": "success|error|warning",
 *   "message": "Human readable message",
 *   "data": null|object|array,
 *   "meta": {
 *     "timestamp": "2024-05-10T10:30:00Z",
 *     "endpoint": "/api/events",
 *     "http_code": 200
 *   }
 * }
 */

class Response {
    const STATUS_SUCCESS = 'success';
    const STATUS_ERROR = 'error';
    const STATUS_WARNING = 'warning';

    private static $http_codes = [
        'success' => 200,
        'created' => 201,
        'bad_request' => 400,
        'unauthorized' => 401,
        'forbidden' => 403,
        'not_found' => 404,
        'conflict' => 409,
        'server_error' => 500,
    ];

    /**
     * Send success response
     * 
     * @param mixed $data Response data (array, object, or null)
     * @param string $message Success message
     * @param int $http_code HTTP status code
     * @param array $meta Additional metadata
     */
    public static function success($data = null, $message = 'Request successful', $http_code = 200, $meta = []) {
        self::send(self::STATUS_SUCCESS, $message, $data, $http_code, $meta);
    }

    /**
     * Send created response (201)
     * 
     * @param mixed $data Created resource data
     * @param string $message Creation message
     * @param array $meta Additional metadata
     */
    public static function created($data = null, $message = 'Resource created successfully', $meta = []) {
        self::send(self::STATUS_SUCCESS, $message, $data, 201, $meta);
    }

    /**
     * Send error response
     * 
     * @param string $message Error message
     * @param mixed $data Error details or null
     * @param int $http_code HTTP status code
     * @param array $meta Additional metadata
     */
    public static function error($message = 'An error occurred', $data = null, $http_code = 400, $meta = []) {
        self::send(self::STATUS_ERROR, $message, $data, $http_code, $meta);
    }

    /**
     * Send not found response (404)
     * 
     * @param string $message Not found message
     * @param array $meta Additional metadata
     */
    public static function notFound($message = 'Resource not found', $meta = []) {
        self::send(self::STATUS_ERROR, $message, null, 404, $meta);
    }

    /**
     * Send unauthorized response (401)
     * 
     * @param string $message Unauthorized message
     * @param array $meta Additional metadata
     */
    public static function unauthorized($message = 'Unauthorized - Please login', $meta = []) {
        self::send(self::STATUS_ERROR, $message, null, 401, $meta);
    }

    /**
     * Send forbidden response (403)
     * 
     * @param string $message Forbidden message
     * @param array $meta Additional metadata
     */
    public static function forbidden($message = 'Forbidden - Access denied', $meta = []) {
        self::send(self::STATUS_ERROR, $message, null, 403, $meta);
    }

    /**
     * Send validation error response
     * 
     * @param array $errors Validation errors
     * @param string $message Validation error message
     * @param array $meta Additional metadata
     */
    public static function validationError($errors = [], $message = 'Validation failed', $meta = []) {
        self::send(self::STATUS_ERROR, $message, $errors, 400, $meta);
    }

    /**
     * Send server error response (500)
     * 
     * @param string $message Error message
     * @param array $meta Additional metadata
     */
    public static function serverError($message = 'Internal server error', $meta = []) {
        self::send(self::STATUS_ERROR, $message, null, 500, $meta);
    }

    /**
     * Core response sender
     * 
     * @param string $status Status type
     * @param string $message Message
     * @param mixed $data Data payload
     * @param int $http_code HTTP status code
     * @param array $meta Metadata
     */
    private static function send($status, $message, $data = null, $http_code = 200, $meta = []) {
        // Set HTTP status code
        http_response_code($http_code);

        // Set content type header
        header('Content-Type: application/json; charset=utf-8');

        // Build response structure
        $response = [
            'status' => $status,
            'message' => $message,
            'data' => $data,
            'meta' => array_merge([
                'timestamp' => date('c'), // ISO 8601 format
                'endpoint' => $_SERVER['REQUEST_URI'] ?? '',
                'http_code' => $http_code,
                'server_time' => round(microtime(true) * 1000), // Milliseconds
            ], $meta),
        ];

        // Encode and output JSON
        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

        // Exit to prevent further output
        exit();
    }

    /**
     * Paginated response helper
     * 
     * @param array $data Data items
     * @param int $total Total count
     * @param int $per_page Items per page
     * @param int $current_page Current page number
     * @param string $message Success message
     */
    public static function paginated($data, $total, $per_page = 10, $current_page = 1, $message = 'Request successful') {
        $total_pages = ceil($total / $per_page);
        
        $meta = [
            'pagination' => [
                'total' => $total,
                'per_page' => $per_page,
                'current_page' => $current_page,
                'total_pages' => $total_pages,
                'has_next' => $current_page < $total_pages,
                'has_previous' => $current_page > 1,
            ],
        ];

        self::send(self::STATUS_SUCCESS, $message, $data, 200, $meta);
    }

    /**
     * Handle exceptions and convert to error response
     * 
     * @param Exception $e The exception
     * @param bool $debug Show detailed error in development
     */
    public static function handleException($e, $debug = false) {
        $message = 'An error occurred';
        $data = null;
        $http_code = 500;

        if ($debug || is_dev()) {
            $message = $e->getMessage();
            $data = [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => explode("\n", $e->getTraceAsString()),
            ];
        }

        self::error($message, $data, $http_code);
    }
}
