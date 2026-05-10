#!/bin/bash

# PHASE 4: TESTING GUIDE
# All endpoints with cURL and expected responses

API_URL="http://localhost:80"
CONTENT_TYPE="Content-Type: application/json"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          PHASE 4: CORE REST APIS - TESTING GUIDE               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# ============================================
# HEALTH CHECK
# ============================================
echo "1. HEALTH CHECK ENDPOINT"
echo "───────────────────────────────────────────────────────────────"
echo "Request:"
echo "  curl -X GET ${API_URL}/"
echo ""
echo "Expected Response:"
echo "  HTTP 200 OK"
echo "  {\"status\": \"success\", \"message\": \"API is healthy\", \"data\": {...}}"
echo ""
echo "Test it:"
curl -X GET ${API_URL}/ 2>/dev/null | jq '.' || echo "Error"
echo ""
echo ""

# ============================================
# AUTHENTICATION ENDPOINTS
# ============================================
echo "2. USER REGISTRATION"
echo "───────────────────────────────────────────────────────────────"
echo "Request:"
echo "  curl -X POST ${API_URL}/auth/register \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"name\": \"John Doe\", \"email\": \"john@example.com\", \"password\": \"password123\", \"phone\": \"0987654321\", \"address\": \"123 Main St\"}'"
echo ""
echo "Expected Response:"
echo "  HTTP 201 Created"
echo "  {\"status\": \"success\", \"message\": \"Registration successful\", \"data\": {\"user\": {...}, \"token\": \"eyJ...\"}}"
echo ""
echo "Test it:"
REGISTER_RESPONSE=$(curl -s -X POST ${API_URL}/auth/register \
  -H "${CONTENT_TYPE}" \
  -d '{
    "name": "Test User",
    "email": "testuser'$(date +%s)'@example.com",
    "password": "password123",
    "phone": "0987654321",
    "address": "123 Test Street"
  }')
echo "$REGISTER_RESPONSE" | jq '.' || echo "$REGISTER_RESPONSE"
# Extract token for later use
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.token' 2>/dev/null)
echo "Token extracted: $TOKEN"
echo ""
echo ""

# ============================================
# LOGIN
# ============================================
echo "3. USER LOGIN"
echo "───────────────────────────────────────────────────────────────"
echo "Request:"
echo "  curl -X POST ${API_URL}/auth/login \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"email\": \"admin@elonmerch.com\", \"password\": \"password123\"}'"
echo ""
echo "Expected Response:"
echo "  HTTP 200 OK"
echo "  {\"status\": \"success\", \"message\": \"Login successful\", \"data\": {\"user\": {\"id\": 1, \"name\": \"Admin ELon\", \"email\": \"admin@elonmerch.com\", \"role\": \"admin\"}, \"token\": \"eyJ...\"}}"
echo ""
echo "Test it:"
LOGIN_RESPONSE=$(curl -s -X POST ${API_URL}/auth/login \
  -H "${CONTENT_TYPE}" \
  -d '{
    "email": "admin@elonmerch.com",
    "password": "password123"
  }')
echo "$LOGIN_RESPONSE" | jq '.' || echo "$LOGIN_RESPONSE"
# Extract admin token
ADMIN_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token' 2>/dev/null)
echo "Admin Token extracted: $ADMIN_TOKEN"
echo ""
echo ""

# ============================================
# GET USER PROFILE
# ============================================
echo "4. GET USER PROFILE"
echo "───────────────────────────────────────────────────────────────"
echo "Request (requires Authorization header with token):"
echo "  curl -X GET ${API_URL}/auth/profile \\"
echo "    -H 'Authorization: Bearer <token>'"
echo ""
echo "Expected Response:"
echo "  HTTP 200 OK"
echo "  {\"status\": \"success\", \"message\": \"Profile retrieved successfully\", \"data\": {\"id\": 1, \"name\": \"Admin ELon\", \"email\": \"admin@elonmerch.com\", \"role\": \"admin\"}}"
echo ""
if [ ! -z "$ADMIN_TOKEN" ] && [ "$ADMIN_TOKEN" != "null" ]; then
  echo "Test it:"
  curl -s -X GET ${API_URL}/auth/profile \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" | jq '.' || echo "Error"
else
  echo "Skipped (no token)"
fi
echo ""
echo ""

# ============================================
# GET ALL EVENTS
# ============================================
echo "5. GET ALL EVENTS (with pagination)"
echo "───────────────────────────────────────────────────────────────"
echo "Request:"
echo "  curl -X GET '${API_URL}/events?page=1&per_page=10&status=upcoming'"
echo ""
echo "Expected Response:"
echo "  HTTP 200 OK"
echo "  {\"status\": \"success\", \"data\": [{\"id\": 1, \"title\": \"Lệ Chi Viên 2024\", \"date\": \"2024-06-15\", ...}], \"meta\": {\"pagination\": {...}}}"
echo ""
echo "Test it:"
curl -s -X GET "${API_URL}/events?page=1&per_page=10&status=upcoming" | jq '.' || echo "Error"
echo ""
echo ""

# ============================================
# GET SINGLE EVENT
# ============================================
echo "6. GET SINGLE EVENT BY ID"
echo "───────────────────────────────────────────────────────────────"
echo "Request:"
echo "  curl -X GET ${API_URL}/events/1"
echo ""
echo "Expected Response:"
echo "  HTTP 200 OK"
echo "  {\"status\": \"success\", \"message\": \"Event retrieved successfully\", \"data\": {\"id\": 1, \"title\": \"Lệ Chi Viên 2024\", \"reg_price\": 350000, \"vip_price\": 550000, ...}}"
echo ""
echo "Test it:"
curl -s -X GET "${API_URL}/events/1" | jq '.' || echo "Error"
echo ""
echo ""

# ============================================
# GET ALL PRODUCTS
# ============================================
echo "7. GET ALL PRODUCTS (with pagination)"
echo "───────────────────────────────────────────────────────────────"
echo "Request:"
echo "  curl -X GET '${API_URL}/products?page=1&per_page=10&status=available'"
echo ""
echo "Expected Response:"
echo "  HTTP 200 OK"
echo "  {\"status\": \"success\", \"data\": [{\"id\": 1, \"name\": \"Áo Thun Soobin\", \"price\": 199000, \"colors\": [\"Đen\", \"Trắng\", \"Xanh\"], ...}], \"meta\": {\"pagination\": {...}}}"
echo ""
echo "Test it:"
curl -s -X GET "${API_URL}/products?page=1&per_page=10&status=available" | jq '.' || echo "Error"
echo ""
echo ""

# ============================================
# GET SINGLE PRODUCT
# ============================================
echo "8. GET SINGLE PRODUCT BY ID"
echo "───────────────────────────────────────────────────────────────"
echo "Request:"
echo "  curl -X GET ${API_URL}/products/1"
echo ""
echo "Expected Response:"
echo "  HTTP 200 OK"
echo "  {\"status\": \"success\", \"message\": \"Product retrieved successfully\", \"data\": {\"id\": 1, \"name\": \"Áo Thun Soobin\", \"price\": 199000, \"stock\": 150, \"colors\": [...], \"sizes\": [...]}}"
echo ""
echo "Test it:"
curl -s -X GET "${API_URL}/products/1" | jq '.' || echo "Error"
echo ""
echo ""

# ============================================
# ERROR CASES
# ============================================
echo "9. ERROR RESPONSES"
echo "───────────────────────────────────────────────────────────────"
echo ""
echo "A) Invalid Login:"
echo "  curl -X POST ${API_URL}/auth/login \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"email\": \"wrong@example.com\", \"password\": \"wrong\"}'"
echo ""
echo "Expected: HTTP 401 Unauthorized"
curl -s -X POST ${API_URL}/auth/login \
  -H "${CONTENT_TYPE}" \
  -d '{"email": "wrong@example.com", "password": "wrong"}' | jq '.' || echo "Error"
echo ""

echo "B) Event Not Found:"
echo "  curl -X GET ${API_URL}/events/99999"
echo ""
echo "Expected: HTTP 404 Not Found"
curl -s -X GET "${API_URL}/events/99999" | jq '.' || echo "Error"
echo ""

echo "C) Missing Required Fields:"
echo "  curl -X POST ${API_URL}/auth/register \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"name\": \"John\"}'"
echo ""
echo "Expected: HTTP 400 Bad Request with validation errors"
curl -s -X POST ${API_URL}/auth/register \
  -H "${CONTENT_TYPE}" \
  -d '{"name": "John"}' | jq '.' || echo "Error"
echo ""
echo ""

# ============================================
# POSTMAN COLLECTION JSON
# ============================================
echo "10. POSTMAN COLLECTION (import this)"
echo "───────────────────────────────────────────────────────────────"
cat > /tmp/ELonMerch-API.postman_collection.json << 'POSTMAN_EOF'
{
  "info": {
    "name": "ELon Merch API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\"name\": \"John Doe\", \"email\": \"john@example.com\", \"password\": \"password123\", \"phone\": \"0987654321\", \"address\": \"123 Main St\"}"
            },
            "url": {"raw": "http://localhost:80/auth/register", "protocol": "http", "host": ["localhost"], "port": "80", "path": ["auth", "register"]}
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\"email\": \"admin@elonmerch.com\", \"password\": \"password123\"}"
            },
            "url": {"raw": "http://localhost:80/auth/login", "protocol": "http", "host": ["localhost"], "port": "80", "path": ["auth", "login"]}
          }
        },
        {
          "name": "Get Profile",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
            "url": {"raw": "http://localhost:80/auth/profile", "protocol": "http", "host": ["localhost"], "port": "80", "path": ["auth", "profile"]}
          }
        }
      ]
    },
    {
      "name": "Events",
      "item": [
        {
          "name": "List Events",
          "request": {
            "method": "GET",
            "url": {"raw": "http://localhost:80/events?page=1&per_page=10&status=upcoming", "protocol": "http", "host": ["localhost"], "port": "80", "path": ["events"], "query": [{"key": "page", "value": "1"}, {"key": "per_page", "value": "10"}, {"key": "status", "value": "upcoming"}]}
          }
        },
        {
          "name": "Get Event",
          "request": {
            "method": "GET",
            "url": {"raw": "http://localhost:80/events/1", "protocol": "http", "host": ["localhost"], "port": "80", "path": ["events", "1"]}
          }
        }
      ]
    },
    {
      "name": "Products",
      "item": [
        {
          "name": "List Products",
          "request": {
            "method": "GET",
            "url": {"raw": "http://localhost:80/products?page=1&per_page=10&status=available", "protocol": "http", "host": ["localhost"], "port": "80", "path": ["products"], "query": [{"key": "page", "value": "1"}, {"key": "per_page", "value": "10"}, {"key": "status", "value": "available"}]}
          }
        },
        {
          "name": "Get Product",
          "request": {
            "method": "GET",
            "url": {"raw": "http://localhost:80/products/1", "protocol": "http", "host": ["localhost"], "port": "80", "path": ["products", "1"]}
          }
        }
      ]
    }
  ]
}
POSTMAN_EOF

echo "✅ Postman collection saved to: /tmp/ELonMerch-API.postman_collection.json"
echo "📥 Import this file in Postman:"
echo "   1. Open Postman"
echo "   2. Click 'Import' button"
echo "   3. Select '/tmp/ELonMerch-API.postman_collection.json'"
echo ""
echo ""

# ============================================
# SUMMARY
# ============================================
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                      TESTING SUMMARY                           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ Endpoints Implemented:"
echo "   • POST   /auth/register       - User registration"
echo "   • POST   /auth/login          - User login (returns JWT token)"
echo "   • GET    /auth/profile        - Get authenticated user profile"
echo "   • GET    /events              - List all events (paginated)"
echo "   • GET    /events/:id          - Get single event"
echo "   • GET    /products            - List all products (paginated)"
echo "   • GET    /products/:id        - Get single product"
echo ""
echo "✅ Features:"
echo "   • Bcrypt password hashing"
echo "   • JWT token generation (24-hour expiry)"
echo "   • Pagination with metadata"
echo "   • Filtering & sorting"
echo "   • Proper error handling"
echo "   • CORS support"
echo ""
echo "✅ Test Data Available:"
echo "   • Events: Lệ Chi Viên, Soobin Live Concert, Workshop Làm nến thơm, Thuốc Đắng"
echo "   • Products: Áo Thun Soobin, Lightstick, Bandana, Tote Bag, Pins, Mũ, Túi, Combo VIP"
echo "   • Users: admin@elonmerch.com + 5 customer accounts (password: password123)"
echo ""
echo "═══════════════════════════════════════════════════════════════════"
