# ============================================================================
# EXACT DOCKER COMMANDS FOR JWT_SECRET SYNCHRONIZATION
# ============================================================================
# 
# Copy and paste these commands in order to rebuild containers with the
# updated JWT_SECRET configuration.
# 
# Prerequisites:
#   - .env file exists with JWT_SECRET=your_secret_here
#   - You are in the project root directory
# ============================================================================

# ============================================================================
# STEP 1: STOP ALL RUNNING CONTAINERS
# ============================================================================
# This stops all services managed by docker-compose
docker-compose down

# Expected output:
# Stopping elonmerch_phpmyadmin ... done
# Stopping elonmerch_nginx ... done
# Stopping elonmerch_php ... done
# Stopping elonmerch_mysql ... done
# Removing network elonmerch_network


# ============================================================================
# STEP 2: REBUILD PHP IMAGE WITH UPDATED ENVIRONMENT
# ============================================================================
# This forces a complete rebuild of the PHP image, ensuring the Dockerfile
# picks up the latest environment variables from docker-compose.yml
docker-compose build --no-cache php

# Expected output:
# [+] Building 45.2s (14/14) FINISHED
# ...
# => naming to docker.io/library/dockerfile.php:latest


# ============================================================================
# STEP 3: START ALL CONTAINERS WITH NEW ENVIRONMENT VARIABLES
# ============================================================================
# This brings up all services with the updated JWT_SECRET in the PHP container
docker-compose up -d

# Expected output:
# Creating elonmerch_mysql ... done
# Creating elonmerch_php ... done
# Creating elonmerch_nginx ... done
# Creating elonmerch_phpmyadmin ... done


# ============================================================================
# STEP 4: VERIFY CONTAINERS ARE RUNNING
# ============================================================================
# Check the status of all containers
docker-compose ps

# Expected output:
# NAME               COMMAND                  SERVICE   STATUS      PORTS
# elonmerch_mysql    "docker-entrypoint..."   mysql     Up (healthy)   3306/tcp, 33060/tcp
# elonmerch_php      "docker-php-entrypo..."  php       Up              9000/tcp
# elonmerch_nginx    "nginx -g daemon off"    nginx     Up              0.0.0.0:8000->80/tcp
# elonmerch_phpmyadmin   "docker-php-entrypo..." phpmyadmin Up          0.0.0.0:8080->80/tcp


# ============================================================================
# STEP 5: VERIFY JWT_SECRET IN PHP CONTAINER
# ============================================================================
# This confirms the JWT_SECRET environment variable is accessible in the PHP container
docker exec elonmerch_php sh -c 'echo $JWT_SECRET'

# Expected output:
# your_super_secret_jwt_key_change_this_in_production
# (or whatever you set in .env)


# ============================================================================
# STEP 6: VERIFY JWT_SECRET IS LOADED IN PHP CODE
# ============================================================================
# This tests that api/config/db.php can read the JWT_SECRET constant
docker exec elonmerch_php php -r "
require_once '/var/www/api/config/db.php';
if (defined('JWT_SECRET')) {
    echo 'JWT_SECRET loaded: ' . substr(JWT_SECRET, 0, 20) . '...' . PHP_EOL;
} else {
    echo 'ERROR: JWT_SECRET not loaded' . PHP_EOL;
    exit(1);
}
"

# Expected output:
# JWT_SECRET loaded: your_super_secret_j...


# ============================================================================
# STEP 7: VERIFY JWT TOKEN GENERATION & VERIFICATION
# ============================================================================
# This tests that JwtToken can generate and verify tokens with the secret
docker exec elonmerch_php php -r "
require_once '/var/www/api/config/db.php';
require_once '/var/www/api/utils/JwtToken.php';

// Generate a test token
\$payload = ['id' => 1, 'email' => 'test@example.com', 'role' => 'admin'];
\$token = JwtToken::generate(\$payload);
echo 'Token generated: ' . substr(\$token, 0, 50) . '...' . PHP_EOL;

// Verify the token
\$verified = JwtToken::verify(\$token);
if (\$verified) {
    echo 'Token verified: ✓' . PHP_EOL;
    echo 'Payload: ' . json_encode(\$verified) . PHP_EOL;
} else {
    echo 'Token verification FAILED' . PHP_EOL;
    exit(1);
}
"

# Expected output:
# Token generated: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW...
# Token verified: ✓
# Payload: {"id":1,"email":"test@example.com","role":"admin","iat":1234567890,"exp":1234654290}


# ============================================================================
# STEP 8: VERIFY DATABASE CONNECTION
# ============================================================================
# This confirms MySQL is accessible from the PHP container
docker exec elonmerch_php php -r "
require_once '/var/www/api/config/db.php';
\$conn = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT);
if (\$conn->connect_error) {
    echo 'MySQL Connection FAILED: ' . \$conn->connect_error . PHP_EOL;
    exit(1);
}
echo 'MySQL Connection: ✓' . PHP_EOL;
\$conn->close();
"

# Expected output:
# MySQL Connection: ✓


# ============================================================================
# STEP 9: CHECK PHP CONTAINER LOGS
# ============================================================================
# View recent logs from the PHP container (shows any errors)
docker-compose logs php

# If you want to follow logs in real-time:
docker-compose logs -f php

# Press Ctrl+C to stop following logs


# ============================================================================
# STEP 10: TEST JWT AUTH WITH YOUR FRONTEND
# ============================================================================
# 
# 1. Login to get a token:
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Expected response:
# {
#   "status": "success",
#   "data": {
#     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#     "user": {...}
#   }
# }

# 2. Copy the token and test protected endpoint:
curl -X GET http://localhost:8000/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_FROM_STEP_1"

# Expected response:
# {
#   "status": "success",
#   "data": {
#     "id": 1,
#     "email": "admin@example.com",
#     ...
#   }
# }

# 3. Test with Admin Dashboard:
# - Navigate to http://localhost:8000 in your browser
# - Click "Add Event" in the Admin Dashboard
# - Verify the request includes the Authorization header
# - Check DevTools → Network → POST request → Headers tab


# ============================================================================
# TROUBLESHOOTING
# ============================================================================

# If you get 401 Unauthorized errors:
# 
# 1. Verify JWT_SECRET is set in .env:
grep JWT_SECRET .env

# 2. Verify it's in the container:
docker exec elonmerch_php sh -c 'echo $JWT_SECRET'

# 3. Check if db.php is reading it:
docker exec elonmerch_php php -r "require_once '/var/www/api/config/db.php'; var_dump(JWT_SECRET);"

# 4. Check PHP error logs:
docker exec elonmerch_php tail -f /var/log/php-fpm.log

# 5. Rebuild everything from scratch:
docker-compose down
docker-compose build --no-cache
docker-compose up -d


# ============================================================================
# CLEANUP: Remove everything and start fresh (if needed)
# ============================================================================

# Stop all containers:
docker-compose down

# Remove all containers and volumes:
docker-compose down -v

# Remove dangling images:
docker image prune -f

# Remove all containers:
docker rm -f $(docker ps -aq)

# Remove all networks:
docker network prune -f
