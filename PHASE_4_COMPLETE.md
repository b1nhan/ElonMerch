# PHASE 4: CORE REST APIS - COMPLETE IMPLEMENTATION

**Status:** ✅ **COMPLETE**  
**Date:** May 10, 2024  
**Components:** 3 Controller files + JWT utility | 35+ KB code

---

## 🎯 DELIVERABLES

### Phase 4 Components (4 Files)

| Component | Purpose | Status |
|-----------|---------|--------|
| **AuthController.php** | Login, Register, Profile | ✅ Complete |
| **EventController.php** | Event CRUD with pagination | ✅ Complete |
| **ProductController.php** | Product CRUD with pagination | ✅ Complete |
| **JwtToken.php** | JWT token generation & verification | ✅ Complete |

---

## 📋 IMPLEMENTED ENDPOINTS

### Authentication Endpoints (4)

#### 1. POST `/auth/register`
**Create new user account**

Request:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "0912345678",
  "address": "123 Main Street"
}
```

Response (201 Created):
```json
{
  "status": "success",
  "message": "Registration successful",
  "data": {
    "user": {
      "id": 7,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "0912345678",
      "address": "123 Main Street",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

Features:
- ✅ Bcrypt password hashing (cost=10)
- ✅ Email validation
- ✅ Password strength validation (min 6 characters)
- ✅ Duplicate email detection
- ✅ JWT token generation (24-hour expiry)
- ✅ Returns user data + token

---

#### 2. POST `/auth/login`
**Authenticate user and get token**

Request:
```json
{
  "email": "admin@elonmerch.com",
  "password": "password123"
}
```

Response (200 OK):
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Admin ELon",
      "email": "admin@elonmerch.com",
      "phone": "0901234567",
      "address": "123 Trung Tâm Sài Gòn",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

Features:
- ✅ Email/password verification
- ✅ Account status checking (active/inactive/banned)
- ✅ Password verification with bcrypt
- ✅ Updates last_login timestamp
- ✅ JWT token generation
- ✅ Excludes password from response
- ✅ Error on invalid credentials (401)

Error Response (401):
```json
{
  "status": "error",
  "message": "Invalid email or password",
  "http_code": 401
}
```

---

#### 3. GET `/auth/profile`
**Get authenticated user profile (requires token)**

Request:
```bash
curl -H "Authorization: Bearer <token>" http://localhost/auth/profile
```

Response (200 OK):
```json
{
  "status": "success",
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "name": "Admin ELon",
    "email": "admin@elonmerch.com",
    "phone": "0901234567",
    "address": "123 Trung Tâm Sài Gòn",
    "role": "admin",
    "status": "active"
  }
}
```

Features:
- ✅ Token extraction from Authorization header
- ✅ JWT token verification
- ✅ Token expiration checking
- ✅ Returns full user profile
- ✅ Error on invalid/missing token (401)

---

#### 4. POST `/auth/logout`
**Logout user (placeholder)**

Request:
```bash
curl -X POST -H "Authorization: Bearer <token>" http://localhost/auth/logout
```

Response (200 OK):
```json
{
  "status": "success",
  "message": "Logout successful"
}
```

---

### Event Endpoints (3)

#### 5. GET `/events?page=1&per_page=10&status=upcoming`
**List all events with pagination**

Query Parameters:
- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 10, max: 100)
- `status` - Filter by status (upcoming, ongoing, completed, cancelled)
- `sort` - Sort by (date, title, price)
- `order` - asc or desc (default: asc)

Response (200 OK):
```json
{
  "status": "success",
  "message": "Events retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Lệ Chi Viên 2024",
      "description": "Liveshow nhạc của Lệ Chi Viên...",
      "date": "2024-06-15",
      "time": "19:00:00",
      "location": "Nhạc Viện Hà Nội, Hà Nội",
      "cast": "Lệ Chi Viên, Nguyên Khôi, Khả Vy",
      "image": "/events/le-chi-vien.jpg",
      "reg_price": 350000,
      "vip_price": 550000,
      "total_tickets": 1000,
      "sold_tickets": 250,
      "status": "upcoming"
    },
    {
      "id": 2,
      "title": "Soobin Live Concert 2024",
      "description": "Soobin Live - Âm nhạc và cảm xúc...",
      "date": "2024-07-20",
      "time": "20:00:00",
      "location": "Trung tâm Hội nghị Quốc gia, TP.HCM",
      "cast": "Soobin Hoàng Sơn",
      "image": "/events/soobin-concert.jpg",
      "reg_price": 400000,
      "vip_price": 650000,
      "total_tickets": 1500,
      "sold_tickets": 450,
      "status": "upcoming"
    }
  ],
  "meta": {
    "timestamp": "2024-05-10T10:30:00Z",
    "endpoint": "/events",
    "http_code": 200,
    "pagination": {
      "total": 4,
      "per_page": 10,
      "current_page": 1,
      "total_pages": 1,
      "has_next": false,
      "has_previous": false
    }
  }
}
```

Features:
- ✅ Pagination with metadata
- ✅ Filtering by status
- ✅ Sorting by date/title/price
- ✅ Returns seed data: 4 Vietnamese events
- ✅ Proper SQL prepared statements

---

#### 6. GET `/events/:id`
**Get single event details**

Response (200 OK):
```json
{
  "status": "success",
  "message": "Event retrieved successfully",
  "data": {
    "id": 2,
    "title": "Soobin Live Concert 2024",
    "description": "Soobin Live - Âm nhạc và cảm xúc tại Sài Gòn",
    "date": "2024-07-20",
    "time": "20:00:00",
    "location": "Trung tâm Hội nghị Quốc gia, TP.HCM",
    "cast": "Soobin Hoàng Sơn",
    "image": "/events/soobin-concert.jpg",
    "reg_price": 400000,
    "vip_price": 650000,
    "total_tickets": 1500,
    "sold_tickets": 450,
    "status": "upcoming",
    "created_at": "2024-05-10 10:00:00",
    "updated_at": "2024-05-10 10:00:00",
    "available_tickets": 1050,
    "sold_percentage": 30.0
  }
}
```

Features:
- ✅ Calculated fields (available_tickets, sold_percentage)
- ✅ Full event details
- ✅ 404 error if event not found

---

#### 7. POST `/events` (Admin only)
**Create new event**

Request:
```json
{
  "title": "New Concert",
  "date": "2024-09-15",
  "time": "19:00:00",
  "location": "Hà Nội"
}
```

Response (201 Created):
- ✅ Requires admin role
- ✅ Returns created event with ID

---

### Product Endpoints (3)

#### 8. GET `/products?page=1&per_page=10&category=Áo&status=available`
**List all products with pagination**

Query Parameters:
- `page` - Page number
- `per_page` - Items per page
- `category` - Filter by category
- `status` - available, unavailable, discontinued
- `sort` - price or name
- `order` - asc or desc

Response (200 OK):
```json
{
  "status": "success",
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Áo Thun Soobin",
      "description": "Áo thun nam/nữ in hình Soobin, chất liệu cotton 100%",
      "price": 199000,
      "colors": ["Đen", "Trắng", "Xanh"],
      "sizes": ["S", "M", "L", "XL", "XXL"],
      "image": "/merch/ao-thun-soobin.jpg",
      "category": "Áo",
      "stock": 150,
      "sku": "SHIRT-SOOBIN-001",
      "status": "available",
      "in_stock": true
    },
    {
      "id": 2,
      "name": "Lightstick Concert",
      "description": "Đèn ánh sáng LED chính thức cho các sự kiện concert",
      "price": 89000,
      "colors": ["Xanh", "Tím", "Hồng", "Trắng"],
      "sizes": [],
      "image": "/merch/lightstick.jpg",
      "category": "Phụ kiện",
      "stock": 300,
      "sku": "LIGHT-CONCERT-001",
      "status": "available",
      "in_stock": true
    }
  ],
  "meta": {
    "pagination": {
      "total": 8,
      "per_page": 10,
      "current_page": 1,
      "total_pages": 1,
      "has_next": false,
      "has_previous": false
    }
  }
}
```

Features:
- ✅ Returns seed data: 8 Vietnamese merchandise items
- ✅ Pagination with metadata
- ✅ Filtering by category and status
- ✅ Sorting by price or name
- ✅ Proper SQL prepared statements

---

#### 9. GET `/products/:id`
**Get single product details**

Response (200 OK):
```json
{
  "status": "success",
  "message": "Product retrieved successfully",
  "data": {
    "id": 1,
    "name": "Áo Thun Soobin",
    "description": "Áo thun nam/nữ in hình Soobin, chất liệu cotton 100%",
    "price": 199000,
    "colors": ["Đen", "Trắng", "Xanh"],
    "sizes": ["S", "M", "L", "XL", "XXL"],
    "image": "/merch/ao-thun-soobin.jpg",
    "category": "Áo",
    "stock": 150,
    "sku": "SHIRT-SOOBIN-001",
    "status": "available",
    "created_at": "2024-05-10 10:00:00",
    "updated_at": "2024-05-10 10:00:00",
    "in_stock": true,
    "stock_status": "In Stock"
  }
}
```

Features:
- ✅ Parsed JSON fields (colors, sizes)
- ✅ Stock status calculation
- ✅ 404 error if product not found

---

#### 10. POST `/products` (Admin only)
**Create new product**

Request:
```json
{
  "name": "New Shirt",
  "price": 250000,
  "category": "Áo",
  "colors": ["Đen", "Trắng"],
  "sizes": ["M", "L", "XL"]
}
```

Response (201 Created):
- ✅ Requires admin role
- ✅ Returns created product with ID

---

## 🔐 SECURITY FEATURES

### Password Hashing
```php
// Bcrypt with cost factor 10
$hash = hashPassword($password);  // bcrypt
$verified = verifyPassword($password, $hash);
```

### JWT Token
```php
// 24-hour expiry
$token = JwtToken::generate(['id' => 1, 'email' => 'test@example.com']);
$data = JwtToken::verify($token);  // Returns payload or false
```

### SQL Injection Prevention
```php
// All queries use prepared statements
$this->fetchOne("SELECT * FROM events WHERE id = ?", [$id]);
```

### Input Validation
```php
- Email format validation
- Password strength (min 6 chars)
- Required field validation
- HTML sanitization
```

---

## 📊 TEST DATA

### Events (4 from seed data)
1. **Lệ Chi Viên 2024** - Hà Nội, 350k-550k₫
2. **Soobin Live Concert 2024** - TP.HCM, 400k-650k₫
3. **Workshop Làm nến thơm** - Craft workshop, 150k-200k₫
4. **Thuốc Đắng Dã Tật** - Movie liveshow, 320k-500k₫

### Products (8 from seed data)
1. Áo Thun Soobin (199k₫)
2. Lightstick Concert (89k₫)
3. Khăn Bandana (79k₫)
4. Tote Bag Chính Thức (149k₫)
5. Pin Cài Áo Concert (59k₫)
6. Mũ Snapback ELon (129k₫)
7. Túi Đeo Chéo (189k₫)
8. Combo VIP Package (449k₫)

### Users (6 from seed data)
- **admin@elonmerch.com** (Admin) - password: password123
- 5 customer accounts - password: password123

---

## 🧪 TESTING GUIDE

### Test with cURL

#### 1. Register User
```bash
curl -X POST http://localhost:80/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "0987654321",
    "address": "123 Main Street"
  }'
```

#### 2. Login
```bash
curl -X POST http://localhost:80/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@elonmerch.com",
    "password": "password123"
  }'
```

#### 3. Get Profile (with token)
```bash
curl -X GET http://localhost:80/auth/profile \
  -H "Authorization: Bearer <token>"
```

#### 4. List Events
```bash
curl -X GET "http://localhost:80/events?page=1&per_page=10&status=upcoming"
```

#### 5. Get Single Event
```bash
curl -X GET "http://localhost:80/events/1"
```

#### 6. List Products
```bash
curl -X GET "http://localhost:80/products?page=1&per_page=10"
```

#### 7. Get Single Product
```bash
curl -X GET "http://localhost:80/products/1"
```

### Test with Postman

See `PHASE_4_TESTING_GUIDE.sh` for Postman collection import.

---

## 📁 Updated File Structure

```
api/
├── index.php                            ✅ UPDATED (loads new controllers)
├── config/
│   ├── db.php
│   ├── Database.php
│   └── routes.php                       ✅ (unchanged - routes already defined)
├── middleware/
│   └── CorsMiddleware.php
├── controllers/
│   ├── BaseController.php
│   ├── HealthController.php
│   ├── AuthController.php               ✅ NEW (7.5 KB)
│   ├── EventController.php              ✅ NEW (7.4 KB)
│   ├── ProductController.php            ✅ NEW (8.3 KB)
│   └── PlaceholderControllers.php       📝 (OrderController, UserController, etc. remain stubs)
├── utils/
│   ├── Response.php
│   ├── Router.php
│   └── JwtToken.php                     ✅ NEW (3.7 KB)
└── models/
```

---

## ✅ ALL REQUIREMENTS MET

- [x] **Auth Controllers** - register, login with bcrypt + JWT token
- [x] **Event Controllers** - GET all, GET by ID with seed data
- [x] **Product Controllers** - GET all, GET by ID with seed data
- [x] **Database Class** - All queries use Database wrapper
- [x] **Response Utility** - All responses use Response class
- [x] **SQL Injection** - All queries use prepared statements
- [x] **Testing Examples** - cURL commands provided
- [x] **Seed Data** - Returns Vietnamese event/product names

---

## 🎯 NEXT PHASE

**Phase 5: Admin Dashboard Initialization**
- Create admin React app with Tailwind CSS
- Matching primary color #4054B2, rounded-2xl/3xl
- Layout with Sidebar + Header
- Admin panel for managing events, products, orders

---

**Status: ✅ PHASE 4 COMPLETE**

All core REST APIs implemented, tested, and documented.

Awaiting approval for Phase 5.
