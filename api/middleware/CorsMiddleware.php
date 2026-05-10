<?php
/**
 * CORS Middleware
 * Handles Cross-Origin Resource Sharing for React frontend
 * 
 * This middleware:
 * - Sets appropriate CORS headers
 * - Handles preflight OPTIONS requests
 * - Validates origin against whitelist
 * - Ensures Authorization header is properly exposed
 * - Exits early on preflight requests
 */

class CorsMiddleware {
    private $allowed_origins = [];
    private $allowed_methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'];
    // CRITICAL: Authorization MUST be in allowed_headers for preflight to work
    private $allowed_headers = ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'];
    // CRITICAL: Authorization MUST be in expose_headers so frontend can read it
    private $expose_headers = ['Content-Length', 'X-Total-Count', 'Authorization'];
    private $allow_credentials = true;
    private $max_age = 86400; // 24 hours

    /**
     * Constructor - Parse and whitelist allowed origins
     */
    public function __construct() {
        $cors_origins = CORS_ORIGIN;
        $this->allowed_origins = array_map('trim', explode(',', $cors_origins));
        
        // Always allow localhost variations for development
        if (API_ENV === 'development') {
            $this->allowed_origins[] = 'http://localhost';
            $this->allowed_origins[] = 'http://localhost:5173';
            $this->allowed_origins[] = 'http://localhost:3000';
            $this->allowed_origins[] = 'http://api.localhost';
        }
        
        // Remove duplicates
        $this->allowed_origins = array_unique($this->allowed_origins);
    }

    /**
     * Check if origin is allowed
     * 
     * @param string $origin Origin to check
     * @return bool
     */
    private function isOriginAllowed($origin) {
        // Allow localhost in development
        if (API_ENV === 'development') {
            return true;
        }

        // Check whitelist in production
        return in_array($origin, $this->allowed_origins);
    }

    /**
     * Apply CORS headers to response
     * 
     * CRITICAL: This must be called AFTER HTTP_AUTHORIZATION is initialized
     * in index.php, but BEFORE any output is sent.
     */
    public function apply() {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        // ====================================================================
        // SET ORIGIN HEADER
        // ====================================================================
        if ($this->isOriginAllowed($origin)) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Access-Control-Allow-Credentials: ' . ($this->allow_credentials ? 'true' : 'false'));
        }

        // ====================================================================
        // SET METHODS HEADER
        // ====================================================================
        header('Access-Control-Allow-Methods: ' . implode(', ', $this->allowed_methods));

        // ====================================================================
        // SET REQUEST HEADERS (What client can send)
        // CRITICAL: Authorization MUST be included here
        // ====================================================================
        header('Access-Control-Allow-Headers: ' . implode(', ', $this->allowed_headers));

        // ====================================================================
        // SET EXPOSE HEADERS (What client can read from response)
        // CRITICAL: Authorization must be here if returning tokens in response
        // ====================================================================
        header('Access-Control-Expose-Headers: ' . implode(', ', $this->expose_headers));

        // ====================================================================
        // SET CACHE TIME FOR PREFLIGHT
        // ====================================================================
        header('Access-Control-Max-Age: ' . $this->max_age);

        // ====================================================================
        // HANDLE PREFLIGHT OPTIONS REQUEST
        // ====================================================================
        // Browser sends OPTIONS preflight before actual request
        // If we respond to OPTIONS correctly, browser will send actual request
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }

        // ====================================================================
        // If we reach here, it's an actual request (GET, POST, PUT, DELETE)
        // Authorization header should be accessible in subsequent code
        // ====================================================================
    }

    /**
     * Verify token from Authorization header
     * (Placeholder for JWT validation in future)
     * 
     * @return bool|array Token data or false if invalid
     */
    public function verifyToken() {
        $auth_header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

        if (empty($auth_header)) {
            return false;
        }

        // Extract token from "Bearer <token>" format
        if (preg_match('/Bearer\s+(.+)/i', $auth_header, $matches)) {
            $token = $matches[1];
            
            return [
                'token' => $token,
                'valid' => true,
            ];
        }

        return false;
    }

    /**
     * Get all allowed origins
     * 
     * @return array
     */
    public function getAllowedOrigins() {
        return $this->allowed_origins;
    }

    /**
     * Get current CORS configuration for debugging
     * 
     * @return array Configuration info
     */
    public function getConfig() {
        return [
            'allowed_origins' => $this->allowed_origins,
            'allowed_methods' => $this->allowed_methods,
            'allowed_headers' => $this->allowed_headers,
            'expose_headers' => $this->expose_headers,
            'allow_credentials' => $this->allow_credentials,
            'max_age' => $this->max_age,
            'request_method' => $_SERVER['REQUEST_METHOD'],
            'request_origin' => $_SERVER['HTTP_ORIGIN'] ?? 'not set',
            'http_authorization_header' => isset($_SERVER['HTTP_AUTHORIZATION']) ? 'present' : 'missing',
        ];
    }
}
