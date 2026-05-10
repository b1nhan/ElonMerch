<?php
/**
 * API Router
 * Simple routing mechanism to map URLs to controllers and methods
 * Handles GET, POST, PUT, DELETE, PATCH requests
 */

class Router {
    private $routes = [];
    private $method;
    private $path;
    private $params = [];

    /**
     * Constructor
     */
    public function __construct() {
        $this->method = $_SERVER['REQUEST_METHOD'];
        $this->path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        // Remove /api prefix if present
        $this->path = preg_replace('#^/api#', '', $this->path);
        // Remove trailing slash unless it's root
        if ($this->path !== '/' && substr($this->path, -1) === '/') {
            $this->path = rtrim($this->path, '/');
        }
    }

    /**
     * Register GET route
     * 
     * @param string $path Route path (e.g., '/events' or '/events/:id')
     * @param string $controller Controller class name
     * @param string $method Controller method name
     */
    public function get($path, $controller, $method) {
        $this->registerRoute('GET', $path, $controller, $method);
    }

    /**
     * Register POST route
     * 
     * @param string $path Route path
     * @param string $controller Controller class name
     * @param string $method Controller method name
     */
    public function post($path, $controller, $method) {
        $this->registerRoute('POST', $path, $controller, $method);
    }

    /**
     * Register PUT route
     * 
     * @param string $path Route path
     * @param string $controller Controller class name
     * @param string $method Controller method name
     */
    public function put($path, $controller, $method) {
        $this->registerRoute('PUT', $path, $controller, $method);
    }

    /**
     * Register DELETE route
     * 
     * @param string $path Route path
     * @param string $controller Controller class name
     * @param string $method Controller method name
     */
    public function delete($path, $controller, $method) {
        $this->registerRoute('DELETE', $path, $controller, $method);
    }

    /**
     * Register PATCH route
     * 
     * @param string $path Route path
     * @param string $controller Controller class name
     * @param string $method Controller method name
     */
    public function patch($path, $controller, $method) {
        $this->registerRoute('PATCH', $path, $controller, $method);
    }

    /**
     * Internal method to register a route
     * 
     * @param string $http_method HTTP method
     * @param string $path Route path
     * @param string $controller Controller class
     * @param string $method Controller method
     */
    private function registerRoute($http_method, $path, $controller, $method) {
        $this->routes[] = [
            'method' => $http_method,
            'path' => $path,
            'controller' => $controller,
            'action' => $method,
        ];
    }

    /**
     * Dispatch the request to the appropriate controller
     */
    public function dispatch() {
        // Try to find a matching route
        foreach ($this->routes as $route) {
            if ($this->routeMatches($route)) {
                return $this->executeRoute($route);
            }
        }

        // No route found
        Response::notFound('Endpoint not found: ' . $this->method . ' ' . $this->path);
    }

    /**
     * Check if a route matches the current request
     * 
     * @param array $route Route definition
     * @return bool
     */
    private function routeMatches($route) {
        // Check HTTP method
        if ($route['method'] !== $this->method) {
            return false;
        }

        // Convert route path to regex (e.g., /events/:id -> /events/(\d+))
        $pattern = $this->pathToRegex($route['path']);

        // Check if path matches pattern
        if (preg_match($pattern, $this->path, $matches)) {
            // Extract parameters
            $this->extractParams($route['path'], $matches);
            return true;
        }

        return false;
    }

    /**
     * Convert path pattern to regex
     * e.g., '/events/:id' -> '#^/events/([^/]+)$#'
     * 
     * @param string $path Path pattern
     * @return string Regex pattern
     */
    private function pathToRegex($path) {
        $pattern = preg_replace_callback('/:(\w+)/', function($matches) {
            // Allow digits for numeric IDs, alphanumeric for slugs
            return '(?P<' . $matches[1] . '>[a-zA-Z0-9_-]+)';
        }, $path);

        return '#^' . $pattern . '$#';
    }

    /**
     * Extract route parameters from matched path
     * 
     * @param string $path Route path pattern
     * @param array $matches Regex matches
     */
    private function extractParams($path, $matches) {
        // Get parameter names from path
        if (preg_match_all('/:(\w+)/', $path, $param_names)) {
            foreach ($param_names[1] as $param_name) {
                if (isset($matches[$param_name])) {
                    $this->params[$param_name] = $matches[$param_name];
                }
            }
        }
    }

    /**
     * Execute a matched route
     * 
     * @param array $route Route definition
     */
    private function executeRoute($route) {
        try {
            // Get controller class and method
            $controller_class = $route['controller'];
            $action_method = $route['action'];

            // Check if controller class exists
            if (!class_exists($controller_class)) {
                throw new Exception("Controller '{$controller_class}' not found");
            }

            // Instantiate controller
            $controller = new $controller_class();

            // Check if action method exists
            if (!method_exists($controller, $action_method)) {
                throw new Exception("Action '{$action_method}' not found in controller '{$controller_class}'");
            }

            // Set route parameters if controller extends BaseController
            if (method_exists($controller, 'setRouteParams')) {
                $controller->setRouteParams($this->params);
            }

            // Call the action method
            $controller->$action_method();

        } catch (Exception $e) {
            Response::handleException($e, is_dev());
        }
    }

    /**
     * Get current HTTP method
     * 
     * @return string
     */
    public function getMethod() {
        return $this->method;
    }

    /**
     * Get current path
     * 
     * @return string
     */
    public function getPath() {
        return $this->path;
    }

    /**
     * Get route parameters
     * 
     * @return array
     */
    public function getParams() {
        return $this->params;
    }
}
