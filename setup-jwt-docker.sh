#!/bin/bash
# ============================================================================
# Docker Setup Script: JWT_SECRET Synchronization & Container Rebuild
# ============================================================================
# This script rebuilds and restarts all containers with the updated
# JWT_SECRET configuration from docker-compose.yml and .env
# 
# Prerequisites:
#   - .env file exists with JWT_SECRET set
#   - docker and docker-compose installed
# ============================================================================

set -e  # Exit on error

echo "=========================================="
echo "Docker JWT_SECRET Synchronization"
echo "=========================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ ERROR: .env file not found!"
    echo "Please create .env from .env.example:"
    echo "  cp .env.example .env"
    echo ""
    exit 1
fi

# Extract JWT_SECRET from .env for display
JWT_SECRET=$(grep '^JWT_SECRET=' .env | cut -d '=' -f 2- | tr -d '"')

if [ -z "$JWT_SECRET" ]; then
    echo "⚠️  WARNING: JWT_SECRET not found in .env"
    echo "Using default fallback secret (NOT RECOMMENDED FOR PRODUCTION)"
    echo ""
else
    echo "✓ JWT_SECRET loaded from .env"
    echo "  Secret length: ${#JWT_SECRET} characters"
    echo ""
fi

# Step 1: Stop running containers
echo "Step 1: Stopping running containers..."
docker-compose down
echo "✓ Containers stopped"
echo ""

# Step 2: Remove PHP container image to force rebuild
echo "Step 2: Removing PHP image to force rebuild..."
docker-compose build --no-cache php
echo "✓ PHP image rebuilt with updated configuration"
echo ""

# Step 3: Start all containers with new environment variables
echo "Step 3: Starting containers with updated environment..."
docker-compose up -d
echo "✓ All containers started"
echo ""

# Step 4: Wait for services to be ready
echo "Step 4: Waiting for services to be healthy..."
sleep 5

# Step 5: Verify containers are running
echo "Step 5: Verifying container status..."
docker-compose ps
echo ""

# Step 6: Check PHP container environment
echo "Step 6: Verifying JWT_SECRET in PHP container..."
JWT_IN_CONTAINER=$(docker exec elonmerch_php sh -c 'echo $JWT_SECRET' 2>/dev/null || echo "NOT_FOUND")

if [ "$JWT_IN_CONTAINER" = "NOT_FOUND" ] || [ -z "$JWT_IN_CONTAINER" ]; then
    echo "⚠️  WARNING: JWT_SECRET not detected in PHP container"
    echo "   Checking if it's in PHP via getenv()..."
    docker exec elonmerch_php php -r "
    require_once '/var/www/api/config/db.php';
    if (defined('JWT_SECRET')) {
        echo '✓ JWT_SECRET is accessible in PHP (length: ' . strlen(JWT_SECRET) . ')' . PHP_EOL;
    } else {
        echo '❌ JWT_SECRET is NOT accessible in PHP' . PHP_EOL;
        exit(1);
    }
    " || echo "⚠️  Could not verify JWT_SECRET in PHP"
else
    echo "✓ JWT_SECRET found in PHP container (length: ${#JWT_IN_CONTAINER})"
fi
echo ""

# Step 7: Check MySQL connectivity
echo "Step 7: Verifying MySQL connectivity..."
docker exec elonmerch_php php -r "
require_once '/var/www/api/config/db.php';
try {
    \$conn = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT);
    if (\$conn->connect_error) {
        echo '❌ MySQL connection failed: ' . \$conn->connect_error . PHP_EOL;
        exit(1);
    }
    echo '✓ MySQL connected successfully' . PHP_EOL;
    \$conn->close();
} catch (Exception \$e) {
    echo '❌ MySQL error: ' . \$e->getMessage() . PHP_EOL;
    exit(1);
}
" || echo "⚠️  Could not verify MySQL connection"
echo ""

# Step 8: Verify JWT_SECRET synchronization between files
echo "Step 8: Checking JWT_SECRET consistency..."
docker exec elonmerch_php php -r "
require_once '/var/www/api/config/db.php';
require_once '/var/www/api/utils/JwtToken.php';

\$db_secret = JWT_SECRET;
\$env_secret = getenv('JWT_SECRET');

if (\$db_secret === \$env_secret) {
    echo '✓ JWT_SECRET matches between environment and PHP' . PHP_EOL;
    echo '  Secret: ' . substr(\$db_secret, 0, 20) . '...' . PHP_EOL;
} else {
    echo '❌ JWT_SECRET MISMATCH!' . PHP_EOL;
    echo '  Environment: ' . substr(\$env_secret ?: 'NOT SET', 0, 20) . PHP_EOL;
    echo '  PHP Constant: ' . substr(\$db_secret ?: 'NOT SET', 0, 20) . PHP_EOL;
    exit(1);
}
" || echo "❌ JWT_SECRET verification failed"
echo ""

echo "=========================================="
echo "✓ Setup Complete!"
echo "=========================================="
echo ""
echo "Next Steps:"
echo "  1. Test token generation:"
echo "     curl -X POST http://localhost:8000/auth/login \\"
echo "       -H 'Content-Type: application/json' \\"
echo "       -d '{\"email\": \"user@example.com\", \"password\": \"password123\"}'"
echo ""
echo "  2. Test token verification:"
echo "     curl -X GET http://localhost:8000/auth/profile \\"
echo "       -H 'Authorization: Bearer YOUR_TOKEN_HERE'"
echo ""
echo "  3. View logs:"
echo "     docker-compose logs -f php"
echo ""
