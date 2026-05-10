<?php
/**
 * Database Connection Configuration
 * Centralized environment variable management for PHP backend
 */

// ============================================================================
// DATABASE CONFIGURATION
// ============================================================================
$db_host = getenv('DB_HOST') ?: 'localhost';
$db_port = getenv('DB_PORT') ?: '3306';
$db_user = getenv('DB_USER') ?: 'elonmerch_user';
$db_password = getenv('DB_PASSWORD') ?: 'rootpassword';
$db_name = getenv('DB_NAME') ?: 'elonmerch_db';

define('DB_HOST', $db_host);
define('DB_PORT', $db_port);
define('DB_USER', $db_user);
define('DB_PASSWORD', $db_password);
define('DB_NAME', $db_name);

// ============================================================================
// JWT CONFIGURATION (CRITICAL FOR AUTH)
// ============================================================================
// MUST match the JWT_SECRET environment variable from docker-compose.yml
// This is the same secret used by the frontend for token verification
$jwt_secret = getenv('JWT_SECRET');

if (!$jwt_secret) {
    // Fallback for development (NEVER use in production)
    $jwt_secret = 'your_super_secret_jwt_key_change_this_in_production';
    
    if (getenv('PHP_ENV') === 'production') {
        error_log('CRITICAL: JWT_SECRET not set in environment variables!');
        throw new Exception('JWT_SECRET is required in production environment');
    }
}

define('JWT_SECRET', $jwt_secret);

// ============================================================================
// API CONFIGURATION
// ============================================================================
define('API_ENV', getenv('PHP_ENV') ?: 'development');
define('API_URL', getenv('API_URL') ?: 'http://localhost');
define('CORS_ORIGIN', getenv('CORS_ORIGIN') ?: 'http://localhost,http://localhost:5173');

// ============================================================================
// DEVELOPMENT & DEBUG HELPERS
// ============================================================================

/**
 * Check if running in development mode
 */
function is_dev() {
    return API_ENV === 'development';
}

/**
 * Set CORS headers based on configuration
 */
function set_cors_headers() {
    $allowed_origins = explode(',', CORS_ORIGIN);
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $origin = trim($origin);
    
    if (in_array($origin, array_map('trim', $allowed_origins))) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
    }
}

set_cors_headers();

// ============================================================================
// VALIDATION: Verify JWT_SECRET is properly loaded
// ============================================================================
if (is_dev()) {
    error_log('[JWT Config] Loaded JWT_SECRET: ' . (strlen(JWT_SECRET) > 0 ? '✓ Set' : '✗ Not Set'));
}
