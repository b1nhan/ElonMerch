<?php
/**
 * Route Definitions
 * All API endpoints are defined here
 * Controllers will be implemented in Phase 4
 */

return [
    // Health Check
    'health' => [
        'method' => 'GET',
        'path' => '/',
        'controller' => 'HealthController',
        'action' => 'check',
    ],

    // ============================================
    // AUTHENTICATION ROUTES
    // ============================================
    'auth.register' => [
        'method' => 'POST',
        'path' => '/auth/register',
        'controller' => 'AuthController',
        'action' => 'register',
    ],
    'auth.login' => [
        'method' => 'POST',
        'path' => '/auth/login',
        'controller' => 'AuthController',
        'action' => 'login',
    ],
    'auth.logout' => [
        'method' => 'POST',
        'path' => '/auth/logout',
        'controller' => 'AuthController',
        'action' => 'logout',
    ],
    'auth.profile' => [
        'method' => 'GET',
        'path' => '/auth/profile',
        'controller' => 'AuthController',
        'action' => 'profile',
    ],

    // ============================================
    // EVENTS ROUTES
    // ============================================
    'events.list' => [
        'method' => 'GET',
        'path' => '/events',
        'controller' => 'EventController',
        'action' => 'list',
    ],
    'events.show' => [
        'method' => 'GET',
        'path' => '/events/:id',
        'controller' => 'EventController',
        'action' => 'show',
    ],
    'events.create' => [
        'method' => 'POST',
        'path' => '/events',
        'controller' => 'EventController',
        'action' => 'create',
    ],
    'events.update' => [
        'method' => 'PUT',
        'path' => '/events/:id',
        'controller' => 'EventController',
        'action' => 'update',
    ],
    'events.delete' => [
        'method' => 'DELETE',
        'path' => '/events/:id',
        'controller' => 'EventController',
        'action' => 'delete',
    ],

    // ============================================
    // PRODUCTS (MERCHANDISE) ROUTES
    // ============================================
    'products.list' => [
        'method' => 'GET',
        'path' => '/products',
        'controller' => 'ProductController',
        'action' => 'list',
    ],
    'products.show' => [
        'method' => 'GET',
        'path' => '/products/:id',
        'controller' => 'ProductController',
        'action' => 'show',
    ],
    'products.create' => [
        'method' => 'POST',
        'path' => '/products',
        'controller' => 'ProductController',
        'action' => 'create',
    ],
    'products.update' => [
        'method' => 'PUT',
        'path' => '/products/:id',
        'controller' => 'ProductController',
        'action' => 'update',
    ],
    'products.delete' => [
        'method' => 'DELETE',
        'path' => '/products/:id',
        'controller' => 'ProductController',
        'action' => 'delete',
    ],

    // ============================================
    // ORDERS ROUTES
    // ============================================
    'orders.list' => [
        'method' => 'GET',
        'path' => '/orders',
        'controller' => 'OrderController',
        'action' => 'list',
    ],
    'orders.show' => [
        'method' => 'GET',
        'path' => '/orders/:id',
        'controller' => 'OrderController',
        'action' => 'show',
    ],
    'orders.create' => [
        'method' => 'POST',
        'path' => '/orders',
        'controller' => 'OrderController',
        'action' => 'create',
    ],
    'orders.update' => [
        'method' => 'PUT',
        'path' => '/orders/:id',
        'controller' => 'OrderController',
        'action' => 'update',
    ],
    'orders.cancel' => [
        'method' => 'POST',
        'path' => '/orders/:id/cancel',
        'controller' => 'OrderController',
        'action' => 'cancel',
    ],

    // ============================================
    // USERS (ADMIN ONLY) ROUTES
    // ============================================
    'users.list' => [
        'method' => 'GET',
        'path' => '/users',
        'controller' => 'UserController',
        'action' => 'list',
    ],
    'users.show' => [
        'method' => 'GET',
        'path' => '/users/:id',
        'controller' => 'UserController',
        'action' => 'show',
    ],
    'users.create' => [
        'method' => 'POST',
        'path' => '/users',
        'controller' => 'UserController',
        'action' => 'create',
    ],
    'users.update' => [
        'method' => 'PUT',
        'path' => '/users/:id',
        'controller' => 'UserController',
        'action' => 'update',
    ],
    'users.delete' => [
        'method' => 'DELETE',
        'path' => '/users/:id',
        'controller' => 'UserController',
        'action' => 'delete',
    ],

    // ============================================
    // ANALYTICS & REPORTING ROUTES
    // ============================================
    'analytics.dashboard' => [
        'method' => 'GET',
        'path' => '/analytics/dashboard',
        'controller' => 'AnalyticsController',
        'action' => 'dashboard',
    ],
    'analytics.revenue' => [
        'method' => 'GET',
        'path' => '/analytics/revenue',
        'controller' => 'AnalyticsController',
        'action' => 'revenue',
    ],
    'analytics.orders' => [
        'method' => 'GET',
        'path' => '/analytics/orders',
        'controller' => 'AnalyticsController',
        'action' => 'orders',
    ],
];
