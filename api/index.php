<?php
/**
 * API Entry Point - Main Router
 * 
 * Request flow:
 * 1. Nginx routes all requests to this file
 * 2. CORS middleware processes headers (but allows Authorization to pass)
 * 3. Routes are registered
 * 4. Router dispatches to appropriate controller
 */

error_reporting(E_ALL);
date_default_timezone_set('UTC');

// ============================================================================
// STEP 1: INITIALIZE AUTHORIZATION HEADER
// ============================================================================
// CRITICAL: PHP-FPM doesn't automatically convert 'Authorization' header
// to HTTP_AUTHORIZATION unless we explicitly set it.
// This must be done BEFORE any other header processing.
// ============================================================================

if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
    // Method 1: Check if Authorization header exists (most common)
    if (isset($_SERVER['Authorization'])) {
        $_SERVER['HTTP_AUTHORIZATION'] = $_SERVER['Authorization'];
    }
    // Method 2: Check apache_request_headers (for some configurations)
    elseif (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        if (isset($headers['Authorization'])) {
            $_SERVER['HTTP_AUTHORIZATION'] = $headers['Authorization'];
        }
    }
    // Method 3: Parse from getallheaders() (another fallback)
    elseif (function_exists('getallheaders')) {
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            $_SERVER['HTTP_AUTHORIZATION'] = $headers['Authorization'];
        }
        // Case-insensitive search
        foreach ($headers as $key => $value) {
            if (strtolower($key) === 'authorization') {
                $_SERVER['HTTP_AUTHORIZATION'] = $value;
                break;
            }
        }
    }
}

// ============================================================================
// STEP 2: LOAD ALL REQUIRED FILES
// ============================================================================
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/middleware/CorsMiddleware.php';
require_once __DIR__ . '/utils/Response.php';
require_once __DIR__ . '/utils/Router.php';
require_once __DIR__ . '/utils/JwtToken.php';
require_once __DIR__ . '/controllers/BaseController.php';
require_once __DIR__ . '/controllers/HealthController.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/EventController.php';
require_once __DIR__ . '/controllers/ProductController.php';
require_once __DIR__ . '/controllers/PlaceholderControllers.php';

// ============================================================================
// STEP 3: PROCESS CORS (BEFORE setting Content-Type header)
// ============================================================================
// IMPORTANT: CORS middleware must run AFTER HTTP_AUTHORIZATION is set
// but BEFORE we set Content-Type, so browsers see correct CORS headers
// on preflight OPTIONS requests.
// ============================================================================
$cors = new CorsMiddleware();
$cors->apply();

// If we reach here, it was not an OPTIONS preflight request
// Now safe to set Content-Type for actual requests

// ============================================================================
// STEP 4: SET JSON CONTENT TYPE
// ============================================================================
header('Content-Type: application/json; charset=utf-8');

// ============================================================================
// STEP 5: INITIALIZE ROUTER & REGISTER ROUTES
// ============================================================================
$router = new Router();
$routes = require_once __DIR__ . '/config/routes.php';

foreach ($routes as $route_name => $route_config) {
    $method = strtolower($route_config['method']);
    $router->$method(
        $route_config['path'],
        $route_config['controller'],
        $route_config['action']
    );
}

// ============================================================================
// STEP 6: DISPATCH REQUEST TO APPROPRIATE CONTROLLER
// ============================================================================
try {
    $router->dispatch();
} catch (Exception $e) {
    Response::handleException($e, is_dev());
}
