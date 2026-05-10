<?php
/**
 * JWT Token Utility Class
 * Implements JWT (JSON Web Token) for authentication
 * 
 * CRITICAL: Uses JWT_SECRET defined in api/config/db.php
 * Must be initialized after db.php is included
 * 
 * Usage:
 *   require_once 'config/db.php';
 *   $token = JwtToken::generate(['id' => 1, 'email' => 'user@example.com']);
 *   $data = JwtToken::verify($token);
 */

class JwtToken {
    // Static secret key loaded from environment via db.php
    private static $secret = '';
    private static $algorithm = 'HS256';
    private static $expiry = 86400; // 24 hours

    /**
     * Initialize JWT with secret key from db.php
     * Call this after including db.php
     */
    public static function init() {
        // Load secret from JWT_SECRET constant defined in db.php
        if (defined('JWT_SECRET')) {
            self::$secret = JWT_SECRET;
        } else {
            error_log('[JwtToken] WARNING: JWT_SECRET constant not defined. Using fallback.');
            self::$secret = 'your_super_secret_jwt_key_change_this_in_production';
        }

        if (empty(self::$secret)) {
            error_log('[JwtToken] ERROR: JWT_SECRET is empty!');
            throw new Exception('JWT_SECRET configuration is missing or empty');
        }
    }

    /**
     * Set custom expiry time (in seconds)
     * Default: 86400 seconds (24 hours)
     * 
     * @param int $expiry Expiry time in seconds
     */
    public static function setExpiry($expiry) {
        self::$expiry = (int)$expiry;
    }

    /**
     * Generate JWT token
     * Encodes payload with header and signature using HS256
     * 
     * @param array $payload User data to encode (id, email, role, etc.)
     * @return string Complete JWT token
     * @throws Exception if secret is not initialized
     */
    public static function generate($payload) {
        // Ensure secret is loaded
        if (empty(self::$secret)) {
            self::init();
        }

        if (empty(self::$secret)) {
            throw new Exception('JWT_SECRET is not configured');
        }

        // Build JWT header
        $header = [
            'alg' => self::$algorithm,
            'typ' => 'JWT',
        ];

        // Add timestamp claims to payload
        $payload['iat'] = time();              // Issued at
        $payload['exp'] = time() + self::$expiry;  // Expires at

        // Encode header and payload as Base64URL
        $header_encoded = self::base64UrlEncode(json_encode($header));
        $payload_encoded = self::base64UrlEncode(json_encode($payload));

        // Create signature using HMAC-SHA256
        $signature_input = $header_encoded . '.' . $payload_encoded;
        $signature = self::base64UrlEncode(
            hash_hmac('sha256', $signature_input, self::$secret, true)
        );

        // Return complete JWT: header.payload.signature
        return $signature_input . '.' . $signature;
    }

    /**
     * Verify JWT token and extract payload
     * Validates signature and expiration time
     * 
     * @param string $token JWT token from Authorization header
     * @return array|false Decoded payload array on success, false on failure
     */
    public static function verify($token) {
        // Ensure secret is loaded
        if (empty(self::$secret)) {
            self::init();
        }

        if (empty(self::$secret)) {
            error_log('[JwtToken] ERROR: Cannot verify - JWT_SECRET not configured');
            return false;
        }

        try {
            // Split token into 3 parts: header.payload.signature
            $parts = explode('.', $token);
            
            if (count($parts) !== 3) {
                error_log('[JwtToken] ERROR: Invalid token format (expected 3 parts)');
                return false;
            }

            list($header_encoded, $payload_encoded, $signature_provided) = $parts;

            // CRITICAL: Verify signature using same secret and algorithm
            $signature_calculated = self::base64UrlEncode(
                hash_hmac('sha256', $header_encoded . '.' . $payload_encoded, self::$secret, true)
            );

            // Signature mismatch = token tampering or wrong secret
            if ($signature_provided !== $signature_calculated) {
                error_log('[JwtToken] ERROR: Signature verification failed - token invalid or secret mismatch');
                return false;
            }

            // Decode payload
            $payload_json = self::base64UrlDecode($payload_encoded);
            $payload = json_decode($payload_json, true);

            if (!is_array($payload)) {
                error_log('[JwtToken] ERROR: Invalid payload JSON');
                return false;
            }

            // Verify expiration time
            if (isset($payload['exp']) && $payload['exp'] < time()) {
                error_log('[JwtToken] ERROR: Token expired (exp: ' . $payload['exp'] . ', now: ' . time() . ')');
                return false;
            }

            // Token is valid
            return $payload;

        } catch (Exception $e) {
            error_log('[JwtToken] ERROR: Exception during verification - ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Base64 URL encode (RFC 4648)
     * Converts base64 to URL-safe format by replacing +/ with -_
     * 
     * @param string $data Data to encode
     * @return string URL-safe base64 encoded string
     */
    private static function base64UrlEncode($data) {
        $base64 = base64_encode($data);
        // Convert + to -, / to _, and remove padding =
        return rtrim(strtr($base64, '+/', '-_'), '=');
    }

    /**
     * Base64 URL decode (RFC 4648)
     * Converts URL-safe base64 back to standard format
     * 
     * @param string $data URL-safe base64 string to decode
     * @return string Decoded data
     */
    private static function base64UrlDecode($data) {
        // Convert - to +, _ to /
        $base64 = strtr($data, '-_', '+/');
        // Add padding if needed
        $base64 .= str_repeat('=', 4 - strlen($base64) % 4);
        return base64_decode($base64);
    }

    /**
     * Extract JWT token from Authorization header
     * Expects format: "Bearer <token>"
     * 
     * @return string|null Token string on success, null if not found
     */
    public static function getFromHeader() {
        $auth_header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

        // Match "Bearer <token>" pattern
        if (preg_match('/Bearer\s+(.+)/i', $auth_header, $matches)) {
            return trim($matches[1]);
        }

        return null;
    }

    /**
     * Get current JWT configuration for debugging
     * 
     * @return array Configuration info
     */
    public static function getConfig() {
        return [
            'algorithm' => self::$algorithm,
            'expiry_seconds' => self::$expiry,
            'expiry_hours' => self::$expiry / 3600,
            'secret_loaded' => !empty(self::$secret),
            'secret_length' => strlen(self::$secret),
        ];
    }
}

// Auto-initialize JWT with secret from db.php
// db.php must be included BEFORE this line
if (!function_exists('__JWT_INIT_CHECK__')) {
    if (defined('JWT_SECRET')) {
        JwtToken::init();
    }
    function __JWT_INIT_CHECK__() { return true; }
}
