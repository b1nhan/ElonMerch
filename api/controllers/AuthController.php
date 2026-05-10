<?php
/**
 * Auth Controller
 * Handles user registration and login
 */

class AuthController extends BaseController {

    /**
     * Register a new user
     * Endpoint: POST /auth/register
     * 
     * Request:
     * {
     *   "name": "John Doe",
     *   "email": "john@example.com",
     *   "password": "password123",
     *   "phone": "0912345678",
     *   "address": "123 Main Street"
     * }
     */
    public function register() {
        try {
            // Validate required fields
            $errors = $this->validate(['name', 'email', 'password']);
            if ($errors) {
                Response::validationError($errors);
            }

            $name = $this->sanitize($this->getInput('name'));
            $email = $this->sanitize($this->getInput('email'));
            $password = $this->getInput('password');
            $phone = $this->sanitize($this->getInput('phone', ''));
            $address = $this->sanitize($this->getInput('address', ''));

            // Validate email format
            if (!$this->validateEmail($email)) {
                Response::validationError(['email' => 'Invalid email format']);
            }

            // Validate password strength
            if (!$this->validatePassword($password)) {
                Response::validationError(['password' => 'Password must be at least 6 characters']);
            }

            // Check if user already exists
            $existing = $this->fetchOne(
                "SELECT id FROM users WHERE email = ?",
                [$email]
            );

            if ($existing) {
                Response::error('Email already registered', null, 409);
            }

            // Hash password
            $password_hash = $this->hashPassword($password);

            // Insert user
            $this->executeQuery(
                "INSERT INTO users (name, email, password, phone, address, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [$name, $email, $password_hash, $phone, $address, 'customer', 'active']
            );

            $user_id = $this->lastInsertId();

            // Get created user
            $user = $this->fetchOne(
                "SELECT id, name, email, phone, address, role FROM users WHERE id = ?",
                [$user_id]
            );

            // Generate token
            $token = JwtToken::generate([
                'id' => $user['id'],
                'email' => $user['email'],
                'role' => $user['role'],
            ]);

            // Log action
            $this->logAction('USER_REGISTERED', "User: {$email}", $user_id);

            Response::created([
                'user' => $user,
                'token' => $token,
            ], 'Registration successful');

        } catch (Exception $e) {
            Response::handleException($e, is_dev());
        }
    }

    /**
     * Login user
     * Endpoint: POST /auth/login
     * 
     * Request:
     * {
     *   "email": "john@example.com",
     *   "password": "password123"
     * }
     * 
     * Response:
     * {
     *   "status": "success",
     *   "data": {
     *     "user": {
     *       "id": 1,
     *       "name": "John Doe",
     *       "email": "john@example.com",
     *       "phone": "0912345678",
     *       "address": "123 Main Street",
     *       "role": "customer"
     *     },
     *     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     *   }
     * }
     */
    public function login() {
        try {
            // Validate required fields
            $errors = $this->validate(['email', 'password']);
            if ($errors) {
                Response::validationError($errors);
            }

            $email = $this->sanitize($this->getInput('email'));
            $password = $this->getInput('password');

            // Find user by email
            $user = $this->fetchOne(
                "SELECT id, name, email, phone, address, password, role, status FROM users WHERE email = ?",
                [$email]
            );

            // Check if user exists
            if (!$user) {
                Response::error('Invalid email or password', null, 401);
            }

            // Check if account is active
            if ($user['status'] !== 'active') {
                Response::error('Account is inactive. Please contact support.', null, 403);
            }

            // Verify password
            if (!$this->verifyPassword($password, $user['password'])) {
                Response::error('Invalid email or password', null, 401);
            }

            // Update last login time
            $this->executeQuery(
                "UPDATE users SET last_login = NOW() WHERE id = ?",
                [$user['id']]
            );

            // Prepare user data (exclude password)
            $user_data = [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'phone' => $user['phone'],
                'address' => $user['address'],
                'role' => $user['role'],
            ];

            // Generate token
            $token = JwtToken::generate([
                'id' => $user['id'],
                'email' => $user['email'],
                'role' => $user['role'],
            ]);

            // Log action
            $this->logAction('USER_LOGIN', "User: {$email}", $user['id']);

            Response::success([
                'user' => $user_data,
                'token' => $token,
            ], 'Login successful');

        } catch (Exception $e) {
            Response::handleException($e, is_dev());
        }
    }

    /**
     * Get authenticated user profile
     * Endpoint: GET /auth/profile
     * 
     * Headers:
     * Authorization: Bearer <token>
     */
    public function profile() {
        try {
            // Extract token from header
            $token = JwtToken::getFromHeader();

            if (!$token) {
                Response::unauthorized('No token provided');
            }

            // Verify token
            $token_data = JwtToken::verify($token);

            if (!$token_data) {
                Response::unauthorized('Invalid or expired token');
            }

            // Get user details
            $user = $this->fetchOne(
                "SELECT id, name, email, phone, address, role, status FROM users WHERE id = ?",
                [$token_data['id']]
            );

            if (!$user) {
                Response::notFound('User not found');
            }

            Response::success($user, 'Profile retrieved successfully');

        } catch (Exception $e) {
            Response::handleException($e, is_dev());
        }
    }

    /**
     * Logout user (token invalidation placeholder)
     * Endpoint: POST /auth/logout
     */
    public function logout() {
        try {
            // Extract token from header
            $token = JwtToken::getFromHeader();

            if (!$token) {
                Response::error('No token provided', null, 400);
            }

            // In a production app, you would:
            // 1. Store token in a blacklist
            // 2. Check blacklist on every protected request
            // For now, just return success (client deletes token)

            Response::success(null, 'Logout successful');

        } catch (Exception $e) {
            Response::handleException($e, is_dev());
        }
    }
}
