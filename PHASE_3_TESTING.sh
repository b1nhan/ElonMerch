#!/bin/bash

# PHASE 3 TESTING GUIDE

echo "========================================"
echo "PHASE 3: Backend Architecture"
echo "Testing & Verification"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Starting Docker containers...${NC}"
echo "Run: docker-compose up -d"
echo ""

echo -e "${BLUE}2. Testing API Health Check${NC}"
echo "Command: curl -X GET http://localhost:80"
echo "Expected: { \"status\": \"success\", \"data\": { \"api\": \"running\", \"database\": { \"status\": \"connected\" } } }"
echo ""

echo -e "${BLUE}3. Testing CORS Preflight${NC}"
echo "Command: curl -X OPTIONS http://localhost:80 \\"
echo "  -H \"Origin: http://localhost:5173\" \\"
echo "  -H \"Access-Control-Request-Method: POST\" \\"
echo "  -v"
echo ""
echo "Expected Headers:"
echo "  - Access-Control-Allow-Origin: http://localhost:5173"
echo "  - Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH"
echo "  - Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With"
echo ""

echo -e "${BLUE}4. Testing From React Frontend${NC}"
echo "JavaScript code:"
cat << 'EOF'

fetch('http://localhost:80/events')
  .then(response => response.json())
  .then(data => {
    console.log('Success!', data);
    // data.status should be "success" or error message
    // NO CORS errors should occur
  })
  .catch(error => console.error('Error:', error));

EOF
echo ""

echo -e "${BLUE}5. Testing Database Connection${NC}"
echo "Command: docker-compose exec mysql mysql -u elonmerch_user -prootpassword elonmerch_db -e \"SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema='elonmerch_db';\""
echo "Expected: table_count = 5 (users, events, products, orders, order_items)"
echo ""

echo -e "${BLUE}6. Checking File Structure${NC}"
echo "api/"
echo "├── index.php"
echo "├── config/"
echo "│   ├── db.php"
echo "│   ├── Database.php"
echo "│   └── routes.php"
echo "├── middleware/"
echo "│   └── CorsMiddleware.php"
echo "├── controllers/"
echo "│   ├── BaseController.php"
echo "│   ├── HealthController.php"
echo "│   └── PlaceholderControllers.php"
echo "├── utils/"
echo "│   ├── Response.php"
echo "│   └── Router.php"
echo "└── models/"
echo ""

echo -e "${BLUE}7. Viewing Logs${NC}"
echo "PHP Errors: docker-compose logs php"
echo "Nginx: docker-compose logs nginx"
echo "MySQL: docker-compose logs mysql"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}PHASE 3 COMPONENTS:${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "✅ Database.php - PDO wrapper with exception handling"
echo "✅ CorsMiddleware.php - CORS headers + preflight"
echo "✅ Response.php - Standardized JSON responses"
echo "✅ Router.php - URL to controller routing"
echo "✅ BaseController.php - Base for all controllers"
echo "✅ routes.php - Route definitions"
echo "✅ HealthController.php - Health check"
echo "✅ PlaceholderControllers.php - Phase 4 stubs"
echo ""

echo -e "${YELLOW}CORS FLOW:${NC}"
echo "Browser OPTIONS → CorsMiddleware.apply() → Exit with headers → Browser validates → Sends actual request"
echo ""

echo -e "${YELLOW}REQUEST FLOW:${NC}"
echo "Request → index.php → CORS → Router → Controller → Database → Response → JSON"
echo ""

echo -e "${GREEN}Phase 3 Complete!${NC}"
echo "Ready for Phase 4: Core REST APIs (Events, Products, Auth, Orders)"
echo ""
