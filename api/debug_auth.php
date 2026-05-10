<?php
/**
 * Debug Authentication Setup
 * Check if JWT_SECRET and Authorization header are properly configured
 * 
 * Access: GET http://localhost:8000/debug_auth.php
 */

header('Content-Type: application/json; charset=utf-8');

// Load config
require_once __DIR__ . '/config/db.php';

// ============================================================================
// INITIALIZE AUTHORIZATION HEADER (same as in index.php)
// ============================================================================
if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
    if (isset($_SERVER['Authorization'])) {
        $_SERVER['HTTP_AUTHORIZATION'] = $_SERVER['Authorization'];
    } elseif (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        if (isset($headers['Authorization'])) {
            $_SERVER['HTTP_AUTHORIZATION'] = $headers['Authorization'];
        }
    } elseif (function_exists('getallheaders')) {
        $headers = getallheaders();
        foreach ($headers as $key => $value) {
            if (strtolower($key) === 'authorization') {
                $_SERVER['HTTP_AUTHORIZATION'] = $value;
                break;
            }
        }
    }
}

// ============================================================================
// COLLECT DEBUG INFORMATION
// ============================================================================

$debug_info = [
    // JWT Configuration
    'jwt_configuration' => [
        'jwt_secret_loaded' => (bool)defined('JWT_SECRET'),
        'jwt_secret_length' => defined('JWT_SECRET') ? strlen(JWT_SECRET) : 0,
        'jwt_secret_first_20_chars' => defined('JWT_SECRET') ? substr(JWT_SECRET, 0, 20) . '...' : 'NOT DEFINED',
        'php_environment' => getenv('PHP_ENV') ?: 'not set',
    ],

    // Authorization Header Status
    'authorization_header' => [
        'http_authorization_present' => isset($_SERVER['HTTP_AUTHORIZATION']),
        'http_authorization_value' => $_SERVER['HTTP_AUTHORIZATION'] ?? '(empty or not set)',
        'http_authorization_length' => isset($_SERVER['HTTP_AUTHORIZATION']) ? strlen($_SERVER['HTTP_AUTHORIZATION']) : 0,
    ],

    // Request Information
    'request_info' => [
        'request_method' => $_SERVER['REQUEST_METHOD'],
        'request_uri' => $_SERVER['REQUEST_URI'],
        'server_protocol' => $_SERVER['SERVER_PROTOCOL'],
        'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'not set',
    ],

    // All Headers (for manual inspection)
    'all_headers_via_getallheaders' => function_exists('getallheaders') ? getallheaders() : 'getallheaders() not available',

    // PHP Server Variables (selected)
    'selected_server_vars' => [
        'HTTP_AUTHORIZATION' => $_SERVER['HTTP_AUTHORIZATION'] ?? 'not set',
        'HTTP_ORIGIN' => $_SERVER['HTTP_ORIGIN'] ?? 'not set',
        'HTTP_HOST' => $_SERVER['HTTP_HOST'] ?? 'not set',
        'REMOTE_ADDR' => $_SERVER['REMOTE_ADDR'] ?? 'not set',
        'REQUEST_METHOD' => $_SERVER['REQUEST_METHOD'] ?? 'not set',
    ],

    // PHP-FPM Information
    'php_info' => [
        'php_version' => phpversion(),
        'php_sapi' => php_sapi_name(),
        'os' => php_uname(),
    ],

    // Nginx Configuration Check
    'nginx_config_check' => [
        'status' => 'Verify nginx.conf has: fastcgi_param HTTP_AUTHORIZATION $http_authorization;',
        'location' => 'Should be in: location ~ \.php$ { ... }',
        'test_command' => 'curl -X GET http://localhost:8000/debug_auth.php -H "Authorization: Bearer test_token"',
    ],
];

// ============================================================================
// VERIFICATION STATUS
// ============================================================================

$status = [
    'jwt_secret_ok' => defined('JWT_SECRET') && !empty(JWT_SECRET),
    'authorization_header_ok' => isset($_SERVER['HTTP_AUTHORIZATION']) && !empty($_SERVER['HTTP_AUTHORIZATION']),
];

$debug_info['verification_status'] = $status;

$debug_info['overall_status'] = ($status['jwt_secret_ok'] && $status['authorization_header_ok']) 
    ? '✅ Configuration OK - Authorization header is being passed correctly'
    : '❌ Configuration Issue - Check details above';

// ============================================================================
// OUTPUT
// ============================================================================

echo json_encode($debug_info, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

// ============================================================================
// CLI INSTRUCTIONS
// ============================================================================

if (php_sapi_name() === 'cli') {
    echo "\n\n=== Test Commands ===\n";
    echo "1. Test without Authorization header:\n";
    echo "   curl -X GET http://localhost:8000/debug_auth.php\n\n";
    
    echo "2. Test with Authorization header:\n";
    echo "   curl -X GET http://localhost:8000/debug_auth.php \\\n";
    echo "     -H 'Authorization: Bearer test_token_12345'\n\n";
    
    echo "3. Test with login endpoint:\n";
    echo "   curl -X POST http://localhost:8000/auth/login \\\n";
    echo "     -H 'Content-Type: application/json' \\\n";
    echo "     -d '{\"email\":\"admin@example.com\",\"password\":\"password123\"}'\n";
}
