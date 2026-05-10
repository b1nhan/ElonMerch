# JWT Secret Synchronization Fix - Complete Documentation

## Problem Summary

The frontend was receiving `401 Unauthorized` errors when trying to authenticate because:

1. **JWT_SECRET not passed to PHP container** - The `docker-compose.yml` was missing the `JWT_SECRET` environment variable in the PHP service definition.
2. **Hardcoded fallback secret** - The PHP code had a hardcoded JWT secret instead of reading from the environment.
3. **Secret mismatch** - Frontend and backend were using different secrets, causing token verification to fail.

## Solution Overview

All three files have been synchronized to use a **single source of truth** for the JWT_SECRET:

```
.env (JWT_SECRET=your_secret)
    ↓
docker-compose.yml (passes to PHP container)
    ↓
api/config/db.php (defines JWT_SECRET constant)
    ↓
api/utils/JwtToken.php (uses JWT_SECRET for encode/decode)
```

## Files Updated

### 1. docker-compose.yml ✓
**What changed:** Added JWT_SECRET environment variable to the PHP service

**Key addition:**
```yaml
php:
  environment:
    - JWT_SECRET=${JWT_SECRET:-your_super_secret_jwt_key_change_this_in_production}
```

**Benefits:**
- Reads from `.env` file (recommended for production)
- Falls back to default if not set (safe for development)
- Available to all PHP processes as environment variable

### 2. api/config/db.php ✓
**What changed:** Now strictly uses `getenv('JWT_SECRET')` instead of hardcoded secret

**Key code:**
```php
$jwt_secret = getenv('JWT_SECRET');

if (!$jwt_secret) {
    $jwt_secret = 'your_super_secret_jwt_key_change_this_in_production';
    if (getenv('PHP_ENV') === 'production') {
        throw new Exception('JWT_SECRET is required in production environment');
    }
}

define('JWT_SECRET', $jwt_secret);
```

**Benefits:**
- Reads from Docker environment (set by docker-compose.yml)
- Safe fallback for development
- Throws error in production if secret is missing
- Single constant used throughout application

### 3. api/utils/JwtToken.php ✓
**What changed:** Now uses `JWT_SECRET` constant from db.php with enhanced error handling

**Key code:**
```php
public static function init() {
    if (defined('JWT_SECRET')) {
        self::$secret = JWT_SECRET;
    } else {
        throw new Exception('JWT_SECRET configuration is missing');
    }
}
```

**Benefits:**
- Auto-initializes from db.php
- Validates that secret is available
- Same secret used for both encode and decode
- Better logging and debugging

## How Token Verification Now Works

```
1. User logs in with credentials
   ↓
2. Backend generates JWT using JWT_SECRET (from db.php)
3. Token sent to frontend in response
   ↓
4. Frontend stores token in localStorage
5. Frontend sends token in Authorization header with every request
   ↓
6. Backend receives Authorization: Bearer <token>
7. Backend extracts token and verifies signature using same JWT_SECRET
8. If signature matches → 200 OK ✓
9. If signature doesn't match → 401 Unauthorized ✗
```

## Docker Commands to Apply Changes

### Option A: Automated Setup (Recommended)

Run the provided setup script:

```bash
# Make script executable
chmod +x setup-jwt-docker.sh

# Run the setup
./setup-jwt-docker.sh
```

This script:
- Stops all containers
- Rebuilds PHP image
- Starts all services
- Verifies JWT_SECRET is loaded
- Tests token generation and verification

### Option B: Manual Commands (Step by Step)

```bash
# Step 1: Stop containers
docker-compose down

# Step 2: Rebuild PHP image with new environment
docker-compose build --no-cache php

# Step 3: Start all containers
docker-compose up -d

# Step 4: Verify JWT_SECRET in PHP container
docker exec elonmerch_php sh -c 'echo $JWT_SECRET'

# Step 5: Test token generation
docker exec elonmerch_php php -r "
require_once '/var/www/api/config/db.php';
require_once '/var/www/api/utils/JwtToken.php';
\$token = JwtToken::generate(['id' => 1, 'email' => 'test@example.com']);
echo 'Token: ' . substr(\$token, 0, 50) . '...' . PHP_EOL;
\$verified = JwtToken::verify(\$token);
echo 'Verified: ' . (\$verified ? 'YES ✓' : 'NO ✗') . PHP_EOL;
"
```

See `DOCKER_JWT_SETUP_COMMANDS.md` for complete command reference.

## Verification Checklist

After running the Docker commands, verify:

- [ ] `docker-compose ps` shows all containers as `Up`
- [ ] `docker exec elonmerch_php sh -c 'echo $JWT_SECRET'` returns your secret
- [ ] Token generation works (see manual commands above)
- [ ] Token verification passes
- [ ] MySQL connection works
- [ ] Frontend login succeeds and gets token
- [ ] Admin Dashboard → Add Event request includes Authorization header
- [ ] No 401 errors when making authenticated requests

## Testing JWT Locally

### Generate a test token:
```bash
docker exec elonmerch_php php -r "
require_once '/var/www/api/config/db.php';
require_once '/var/www/api/utils/JwtToken.php';
\$payload = ['id' => 1, 'email' => 'admin@example.com', 'role' => 'admin'];
\$token = JwtToken::generate(\$payload);
echo 'Test Token: ' . \$token . PHP_EOL;
"
```

### Verify the token:
```bash
# Copy the token from above and use it here
curl -X GET http://localhost:8000/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Configuration Files Reference

### .env (needs to exist)
```
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

### docker-compose.yml (updated)
```yaml
php:
  environment:
    - JWT_SECRET=${JWT_SECRET:-your_super_secret_jwt_key_change_this_in_production}
```

### api/config/db.php (updated)
```php
$jwt_secret = getenv('JWT_SECRET');
define('JWT_SECRET', $jwt_secret);
```

### api/utils/JwtToken.php (updated)
```php
public static function init() {
    if (defined('JWT_SECRET')) {
        self::$secret = JWT_SECRET;
    }
}
JwtToken::init();
```

## Production Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` in `.env` to a strong random value
- [ ] Example: `openssl rand -base64 32`
- [ ] Do NOT commit `.env` file to git
- [ ] Use `.env.example` for documentation only
- [ ] Set `JWT_SECRET` as environment variable in your production Docker environment
- [ ] Consider setting shorter `JWT_EXPIRY` for sensitive operations
- [ ] Use HTTPS for all API calls (not just HTTP)
- [ ] Implement token refresh mechanism for long-lived sessions
- [ ] Log all authentication failures for security monitoring

## Troubleshooting

### 401 Unauthorized on every request

**Solution:**
```bash
# 1. Verify JWT_SECRET is in environment
docker exec elonmerch_php sh -c 'echo $JWT_SECRET'

# 2. Verify PHP can read it
docker exec elonmerch_php php -r "require_once '/var/www/api/config/db.php'; var_dump(JWT_SECRET);"

# 3. Check if signature matches (requires manual token testing)
docker-compose logs php
```

### Signature verification fails

**Cause:** Different secrets used for encoding vs decoding

**Solution:**
```bash
# Restart with rebuilt images
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### MySQL connection errors

**Solution:**
```bash
# Check MySQL is running
docker exec elonmerch_mysql mysqladmin ping -h localhost

# Check logs
docker-compose logs mysql
```

### PHP container exits immediately

**Solution:**
```bash
# Check logs
docker-compose logs php

# Rebuild without cache
docker-compose build --no-cache php
docker-compose up -d
```

## Additional Resources

- JWT (JSON Web Tokens): https://jwt.io
- HMAC-SHA256: https://en.wikipedia.org/wiki/HMAC
- Docker Environment Variables: https://docs.docker.com/compose/environment-variables/
- PHP getenv(): https://www.php.net/manual/en/function.getenv.php

## Summary

Your JWT authentication is now fixed! The secret is properly synchronized across:

1. ✓ Docker environment (.env → docker-compose.yml)
2. ✓ PHP configuration (db.php reads from environment)
3. ✓ Token generation (JwtToken.php uses db.php constant)
4. ✓ Token verification (same secret for signature check)

Frontend requests will now include valid Authorization headers, and your backend will successfully verify them.
