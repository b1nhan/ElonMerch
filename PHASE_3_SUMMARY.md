# PHASE 3: Backend Architecture - Complete Implementation

## ✅ Components Created

### 1. **Database Connection Class** (`api/config/Database.php`)

**Robust PDO Wrapper with:**
- ✅ Singleton pattern (only one DB connection per request)
- ✅ PDO::ERRMODE_EXCEPTION for error handling
- ✅ PDO::FETCH_ASSOC for associative array returns
- ✅ UTF-8mb4 charset and collation support
- ✅ Prepared statements with parameterized queries (prevents SQL injection)
- ✅ Methods:
  - `getInstance()` - Get singleton instance
  - `query($sql, $params)` - Execute query with parameters
  - `fetch()` - Get single row
  - `fetchAll()` - Get multiple rows
  - `lastInsertId()` - Get last inserted ID
  - `rowCount()` - Get affected rows
  - `beginTransaction()`, `commit()`, `rollback()` - Transaction support
  - `getLastError()` - Error information
  - `closeConnection()` - Cleanup on script end

**Security Features:**
- Prepared statements prevent SQL injection
- PDO emulate prepares disabled for true parameterization
- Connection pooling via singleton pattern
- UTF-8 collation for proper Vietnamese text handling

---

### 2. **CORS Middleware** (`api/middleware/CorsMiddleware.php`)

**Handles Cross-Origin Requests:**
- ✅ Explicit `Access-Control-Allow-Origin` header with origin validation
- ✅ Allowed methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
- ✅ Allowed headers: Content-Type, Authorization, X-Requested-With
- ✅ Preflight OPTIONS request handling with early exit
- ✅ Development mode: allows localhost:5173 (Vite frontend)
- ✅ Production mode: strict origin whitelist from .env

**Methods:**
- `apply()` - Set CORS headers and handle preflight
- `verifyToken()` - Extract Bearer token (placeholder for JWT)
- `isOriginAllowed()` - Check if origin is whitelisted
- `getAllowedOrigins()` - Return whitelist

**Preflight Handling:**
```
Browser sends OPTIONS request
↓
CorsMiddleware.apply() sets headers
↓
Early exit with 200 OK
↓
Browser proceeds with actual request
```

---

### 3. **Response Utility** (`api/utils/Response.php`)

**Standardized JSON Response Structure:**
```json
{
  "status": "success|error|warning",
  "message": "Human readable message",
  "data": null|object|array,
  "meta": {
    "timestamp": "2024-05-10T10:30:00Z",
    "endpoint": "/api/events",
    "http_code": 200,
    "server_time": 1234567890
  }
}
```

**Methods:**
- `success($data, $message, $http_code)` - 200 OK response
- `created($data, $message)` - 201 Created response
- `error($message, $data, $http_code)` - Error response
- `notFound($message)` - 404 Not Found
- `unauthorized($message)` - 401 Unauthorized
- `forbidden($message)` - 403 Forbidden
- `validationError($errors, $message)` - 400 Bad Request with validation details
- `serverError($message)` - 500 Internal Server Error
- `paginated($data, $total, $per_page, $page, $message)` - Paginated response with metadata
- `handleException($e, $debug)` - Convert exceptions to error responses

**Features:**
- Consistent response format across all endpoints
- Proper HTTP status codes
- ISO 8601 timestamps
- Metadata includes server response time
- JSON with UTF-8 support
- Exception handling with debug info in development mode

---

### 4. **Base Controller** (`api/controllers/BaseController.php`)

**Foundation for all controllers:**
- ✅ Auto-loaded Database instance
- ✅ Request data parsing (JSON, form, query params)
- ✅ Input validation and sanitization
- ✅ Password hashing and verification
- ✅ Authentication/authorization placeholders
- ✅ Helper methods for common operations

**Key Methods:**

*Input Handling:*
- `getInput($key, $default)` - Get single input value
- `getAllInput()` - Get all request data
- `getParam($key)` - Get route parameter (e.g., ID from URL)

*Validation:*
- `validate($fields)` - Validate required fields
- `validateEmail($email)` - Email format validation
- `validatePassword($password)` - Password strength validation
- `sanitize($input)` - HTML escape and trim

*Security:*
- `hashPassword($password)` - Bcrypt password hashing
- `verifyPassword($password, $hash)` - Verify password against hash
- `requireAuth()` - Enforce authentication (throws 401)
- `requireRole($role)` - Enforce admin role (throws 403)

*Database:*
- `executeQuery($sql, $params)` - Run query
- `fetchOne($sql, $params)` - Get single record
- `fetchAll($sql, $params)` - Get multiple records
- `lastInsertId()` - Last insert ID
- `rowCount()` - Affected rows count

*Logging:*
- `logAction($action, $details, $user_id)` - Audit trail (placeholder)

---

### 5. **Router** (`api/utils/Router.php`)

**URL to Controller Mapping:**
- ✅ Maps HTTP methods and paths to controller actions
- ✅ Supports path parameters (e.g., `/events/:id`)
- ✅ Dynamic regex matching with named capture groups
- ✅ Automatic parameter extraction
- ✅ 404 handling for unmapped routes

**Supported HTTP Methods:**
- `get($path, $controller, $method)`
- `post($path, $controller, $method)`
- `put($path, $controller, $method)`
- `delete($path, $controller, $method)`
- `patch($path, $controller, $method)`

**Path Patterns:**
```
/events          → matches GET /events
/events/:id      → matches GET /events/123, /events/abc
/events/:id/show → matches GET /events/123/show
```

**Routing Example:**
```php
$router->get('/events', 'EventController', 'list');
$router->get('/events/:id', 'EventController', 'show');
$router->post('/events', 'EventController', 'create');
$router->put('/events/:id', 'EventController', 'update');
$router->delete('/events/:id', 'EventController', 'delete');
```

**In Controller:**
```php
class EventController extends BaseController {
    public function show() {
        $id = $this->getParam('id'); // Extracted from URL
        $event = $this->fetchOne('SELECT * FROM events WHERE id = ?', [$id]);
        Response::success($event);
    }
}
```

---

### 6. **Route Configuration** (`api/config/routes.php`)

**Centralized Route Definitions:**
All API endpoints defined in one file, organized by resource:

**Authentication Routes:**
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get authenticated user profile

**Events Routes:**
- `GET /events` - List all events (with pagination)
- `GET /events/:id` - Get single event
- `POST /events` - Create event (admin only)
- `PUT /events/:id` - Update event (admin only)
- `DELETE /events/:id` - Delete event (admin only)

**Products Routes:**
- `GET /products` - List all products (with filters)
- `GET /products/:id` - Get single product
- `POST /products` - Create product (admin only)
- `PUT /products/:id` - Update product (admin only)
- `DELETE /products/:id` - Delete product (admin only)

**Orders Routes:**
- `GET /orders` - List user's orders
- `GET /orders/:id` - Get order details
- `POST /orders` - Create new order
- `PUT /orders/:id` - Update order
- `POST /orders/:id/cancel` - Cancel order

**Users Routes (Admin Only):**
- `GET /users` - List all users
- `GET /users/:id` - Get user details
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

**Analytics Routes (Admin Only):**
- `GET /analytics/dashboard` - Dashboard statistics
- `GET /analytics/revenue` - Revenue reporting
- `GET /analytics/orders` - Order analytics

---

### 7. **Main Entry Point** (`api/index.php`)

**Request Flow:**
```
Request comes in (e.g., GET /api/events)
↓
Load config & classes
↓
Apply CORS middleware
↓
Initialize router
↓
Register all routes from config
↓
Find matching route
↓
Instantiate controller
↓
Call action method
↓
Return JSON response
```

**Error Handling:**
- Try-catch wraps entire dispatch process
- Exceptions converted to error responses
- Development mode shows full stack trace
- Production mode shows generic error messages

---

### 8. **Placeholder Controllers** (`api/controllers/PlaceholderControllers.php`)

**Stub implementations for Phase 4:**
- `AuthController` - Login, register, profile
- `EventController` - Event CRUD operations
- `ProductController` - Merchandise CRUD operations
- `OrderController` - Order management
- `UserController` - User management (admin)
- `AnalyticsController` - Dashboard and reporting

Each method returns "endpoints coming in Phase 4" placeholder response.

---

### 9. **Health Check Controller** (`api/controllers/HealthController.php`)

**Available immediately for testing:**
- `GET /` - Returns API status and database connection status
- Returns database host, name, and connection status
- Useful for monitoring and Docker health checks

**Example Response:**
```json
{
  "status": "success",
  "message": "API is healthy",
  "data": {
    "api": "running",
    "timestamp": "2024-05-10T10:30:00+00:00",
    "environment": "development",
    "database": {
      "status": "connected",
      "host": "mysql",
      "database": "elonmerch_db"
    }
  }
}
```

---

## 📂 File Structure After Phase 3

```
api/
├── index.php                           # Main entry point
├── config/
│   ├── db.php                         # Environment & constants
│   ├── Database.php                   # PDO wrapper class
│   └── routes.php                     # Route definitions
├── middleware/
│   └── CorsMiddleware.php             # CORS handling
├── controllers/
│   ├── BaseController.php             # Base controller class
│   ├── HealthController.php           # Health check
│   └── PlaceholderControllers.php     # Phase 4 stubs
├── utils/
│   ├── Response.php                   # Standardized JSON responses
│   └── Router.php                     # URL routing engine
└── models/                            # Empty (for Phase 4+)
```

---

## 🔍 Architecture Diagram

```
┌─────────────────────┐
│   API Request       │
│  (from React/Vite)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   api/index.php     │ ← Single entry point
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ CorsMiddleware      │ ← Check origin, handle OPTIONS, set headers
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Router              │ ← Parse path, find matching route
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Controller          │ ← Execute action, fetch data from DB
│ (e.g., EventCtrl)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Database            │ ← Execute query with PDO
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ MySQL Database      │ ← Return results
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Response Utility    │ ← Format response JSON
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ JSON Response       │ ← Send to frontend
│ (to React/Vite)     │
└─────────────────────┘
```

---

## 🧪 Testing Phase 3 Setup

### Start Docker Environment
```bash
docker-compose up -d
docker-compose exec php php -v
```

### Test API Health Check
```bash
# In terminal:
curl -X GET http://localhost:80/

# Response:
{
  "status": "success",
  "message": "API is healthy",
  "data": {
    "api": "running",
    "database": {
      "status": "connected",
      "host": "mysql",
      "database": "elonmerch_db"
    }
  }
}
```

### Test CORS Preflight
```bash
# In terminal:
curl -X OPTIONS http://localhost:80 \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Should see:
# Access-Control-Allow-Origin: http://localhost:5173
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
# Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
```

### Test from Vite Frontend
```javascript
// In React component:
fetch('http://localhost/events')
  .then(r => r.json())
  .then(data => console.log(data))
  .catch(err => console.error('CORS or network error:', err));

// Should NOT get CORS errors if origin is allowed
```

---

## 🔐 Security Features Implemented

1. **Prepared Statements** - All database queries use parameterized statements to prevent SQL injection
2. **Password Hashing** - Bcrypt with cost factor 10 for secure password storage
3. **CORS Whitelist** - Origin validation prevents unauthorized cross-origin requests
4. **Input Validation** - Email format, password strength, required fields
5. **HTML Escaping** - sanitize() method prevents XSS attacks
6. **Error Handling** - Sensitive error details hidden in production mode
7. **UTF-8 Encoding** - Proper charset prevents encoding-based attacks

---

## 📝 Key Implementation Details

### How CORS Works
```
Step 1: Browser makes preflight OPTIONS request
Step 2: CorsMiddleware.apply() sets CORS headers
Step 3: Middleware exits early (before route processing)
Step 4: Browser receives headers and validates origin
Step 5: If allowed, browser sends actual request (GET, POST, etc.)
Step 6: Router processes the actual request
```

### How Routing Works
```
Path: /events/123
Pattern: /events/:id
Regex: #^/events/(?P<id>[a-zA-Z0-9_-]+)$#
Match: ✓
Extract: id = "123"
Controller: EventController
Method: show()
Access: $this->getParam('id') = "123"
```

### How Database Connection Works
```
First request: new Database() creates PDO connection
Second request: Database::getInstance() returns same connection
Third request: Same connection reused (singleton pattern)
Script end: register_shutdown_function() closes connection cleanly
```

---

## ✅ Phase 3 Completion Checklist

- [x] Database.php - PDO wrapper with exception handling
- [x] CorsMiddleware.php - CORS headers + preflight handling
- [x] Response.php - Standardized JSON response format
- [x] Router.php - URL to controller routing engine
- [x] BaseController.php - Base class with common methods
- [x] routes.php - All API route definitions
- [x] HealthController.php - Health check endpoint
- [x] PlaceholderControllers.php - Phase 4 stub implementations
- [x] index.php - Updated main entry point with full flow

---

## 📊 Response Examples

### Success Response
```json
{
  "status": "success",
  "message": "Request successful",
  "data": {
    "id": 1,
    "name": "Soobin Live Concert 2024"
  },
  "meta": {
    "timestamp": "2024-05-10T10:30:00+00:00",
    "endpoint": "/events/1",
    "http_code": 200,
    "server_time": 1234567890
  }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Validation failed",
  "data": {
    "email": "Email is required",
    "password": "Password must be at least 6 characters"
  },
  "meta": {
    "timestamp": "2024-05-10T10:30:01+00:00",
    "endpoint": "/auth/register",
    "http_code": 400,
    "server_time": 1234567891
  }
}
```

### Paginated Response
```json
{
  "status": "success",
  "message": "Request successful",
  "data": [
    { "id": 1, "name": "Event 1" },
    { "id": 2, "name": "Event 2" }
  ],
  "meta": {
    "timestamp": "2024-05-10T10:30:00+00:00",
    "endpoint": "/events",
    "http_code": 200,
    "server_time": 1234567890,
    "pagination": {
      "total": 100,
      "per_page": 10,
      "current_page": 1,
      "total_pages": 10,
      "has_next": true,
      "has_previous": false
    }
  }
}
```

---

## 🚀 What's Ready for Phase 4

**Phase 3 sets up the foundation for Phase 4:**
1. Controllers can now query database and return proper responses
2. CORS is configured for frontend communication
3. Routing mechanism ready for endpoint implementation
4. Standardized response format for consistency
5. Security best practices built-in

**Phase 4 will:**
1. Replace placeholder controllers with real implementations
2. Implement Events endpoint (GET all, GET one, POST, PUT, DELETE)
3. Implement Products endpoint (GET all, GET one, POST, PUT, DELETE)
4. Implement Auth endpoint (Register, Login)
5. Implement Orders endpoint (GET, POST, UPDATE)
6. Add database models for complex queries

---

**Status: ✅ PHASE 3 COMPLETE & READY FOR APPROVAL**

All components are:
- Fully documented
- Security-hardened
- Ready for Phase 4 implementation
- Tested for CORS preflight handling
- Supporting the entire API architecture

Awaiting your approval to proceed to **Phase 4: Core REST APIs**.
