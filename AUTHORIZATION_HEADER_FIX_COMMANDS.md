# Authorization Header Fix - Exact Docker Commands

## Problem Fixed
Authorization header was arriving as EMPTY ("") at PHP, even though frontend was sending it correctly. This was due to:
1. nginx.conf not properly passing HTTP_AUTHORIZATION to PHP-FPM
2. api/index.php not initializing $_SERVER['HTTP_AUTHORIZATION'] before CORS processing
3. CorsMiddleware not properly exposing Authorization in CORS headers

## Files Updated
✅ nginx.conf - Added explicit fastcgi_param HTTP_AUTHORIZATION $http_authorization
✅ api/index.php - Added Authorization header initialization at top of file
✅ api/middleware/CorsMiddleware.php - Added Authorization to allowed_headers and expose_headers
✅ api/debug_auth.php - Enhanced with better diagnostic output

---

## OPTION A: Quick Restart (Fastest)
Use this if you only modified PHP files (index.php, CorsMiddleware.php)

```bash
# Restart PHP-FPM container only (no nginx rebuild needed if you didn't change nginx.conf)
docker-compose restart php

# Verify the changes took effect
sleep 2
docker exec elonmerch_php php /var/www/api/debug_auth.php
```

Expected output: `"http_authorization_present": true` when you send the header

---

## OPTION B: Full Rebuild (Recommended for Safety)
Use this if you modified nginx.conf OR any PHP files

### Step 1: Stop all containers
```bash
docker-compose down
```

Expected output:
```
Stopping elonmerch_phpmyadmin ... done
Stopping elonmerch_nginx ... done
Stopping elonmerch_php ... done
Stopping elonmerch_mysql ... done
Removing elonmerch_nginx ... done
...
```

### Step 2: Remove nginx image to force rebuild
```bash
docker rmi nginx:1.25-alpine
```

### Step 3: Rebuild all containers with new configuration
```bash
docker-compose build --no-cache
```

Expected output:
```
[+] Building 45.2s (14/14) FINISHED
...
=> naming to docker.io/library/...
```

### Step 4: Start all containers
```bash
docker-compose up -d
```

Expected output:
```
Creating elonmerch_mysql ... done
Creating elonmerch_php ... done
Creating elonmerch_nginx ... done
Creating elonmerch_phpmyadmin ... done
```

### Step 5: Verify containers are running
```bash
docker-compose ps
```

Expected output:
```
NAME               COMMAND                  SERVICE   STATUS      PORTS
elonmerch_nginx    "nginx -g daemon off"    nginx     Up          0.0.0.0:8000->80/tcp
elonmerch_php      "docker-php-entrypo..."  php       Up          9000/tcp
elonmerch_mysql    "docker-entrypoint..."   mysql     Up (healthy) 3306/tcp
elonmerch_phpmyadmin  "docker-php-entrypo..." phpmyadmin Up         0.0.0.0:8080->80/tcp
```

---

## OPTION C: Clear Cache and Restart (If Still Getting Issues)

### Step 1: Stop containers and remove volumes
```bash
docker-compose down -v
```

### Step 2: Remove all images
```bash
docker image prune -f
```

### Step 3: Rebuild from scratch
```bash
docker-compose build --no-cache --pull
```

### Step 4: Start fresh
```bash
docker-compose up -d
```

### Step 5: Wait for MySQL to be healthy
```bash
docker-compose ps
# Wait until "elonmerch_mysql" shows "healthy"
```

---

## Immediate Verification Steps

### Test 1: Check nginx configuration
```bash
docker exec elonmerch_nginx nginx -t
```

Expected output:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration will be executed successfully
```

### Test 2: Check Authorization header initialization
```bash
curl -X GET http://localhost:8000/debug_auth.php \
  -H "Authorization: Bearer test_token_12345"
```

Expected output (should show "http_authorization_present": true):
```json
{
  "authorization_header": {
    "http_authorization_present": true,
    "http_authorization_value": "Bearer test_token_12345",
    "http_authorization_length": 25
  },
  "overall_status": "✅ Configuration OK - Authorization header is being passed correctly"
}
```

### Test 3: Check without Authorization header (for comparison)
```bash
curl -X GET http://localhost:8000/debug_auth.php
```

Expected output (should show "http_authorization_present": false):
```json
{
  "authorization_header": {
    "http_authorization_present": false,
    "http_authorization_value": "(empty or not set)",
    "http_authorization_length": 0
  }
}
```

### Test 4: Check PHP and nginx logs
```bash
# View PHP logs
docker-compose logs php | tail -20

# View nginx logs
docker-compose logs nginx | tail -20

# View MySQL logs (if needed)
docker-compose logs mysql | tail -10
```

---

## Full Test Sequence (Verify Everything)

### 1. Verify JWT_SECRET
```bash
docker exec elonmerch_php php -r "require_once '/var/www/api/config/db.php'; echo 'JWT_SECRET: ' . substr(JWT_SECRET, 0, 20) . '...' . PHP_EOL;"
```

Expected: JWT_SECRET value

### 2. Verify Authorization header is passed
```bash
curl -X GET http://localhost:8000/debug_auth.php \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test"
```

Expected: `"http_authorization_present": true`

### 3. Test token generation
```bash
docker exec elonmerch_php php -r "
require_once '/var/www/api/config/db.php';
require_once '/var/www/api/utils/JwtToken.php';
\$token = JwtToken::generate(['id' => 1, 'email' => 'test@example.com']);
echo 'Token: ' . \$token . PHP_EOL;
"
```

Expected: JWT token starting with `eyJhbGciOiJIUzI1NiI...`

### 4. Test login endpoint
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

Expected: Response with "token" field

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 5. Test protected endpoint with token
```bash
# Get token from step 4, then:
RESPONSE=$(curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}')

TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

curl -X GET http://localhost:8000/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

Expected: User profile data (NOT 401 Unauthorized)

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    ...
  }
}
```

### 6. Test Admin Dashboard
1. Open http://localhost:8000 in browser
2. Login with credentials
3. Go to Admin → Events Management
4. Click "Add Event"
5. Fill form and submit

Expected: "Event created successfully!" (NOT 401 Unauthorized)

---

## Troubleshooting

### Still Getting 401 on /auth/profile?

**Check 1: Is authorization header reaching PHP?**
```bash
curl -X GET http://localhost:8000/debug_auth.php \
  -H "Authorization: Bearer test123"
```

If `http_authorization_present` is false, see "Fix nginx.conf" below

**Check 2: Is nginx.conf updated?**
```bash
docker exec elonmerch_nginx grep -n "HTTP_AUTHORIZATION" /etc/nginx/nginx.conf
```

Should output a line with: `fastcgi_param HTTP_AUTHORIZATION $http_authorization;`

If not found:
```bash
# Update nginx.conf file on your machine
# Then restart nginx
docker-compose restart nginx
```

**Check 3: Did you rebuild after changing nginx.conf?**
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**Check 4: Is JWT token valid?**
```bash
# Login first
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Copy token, then verify it's being sent correctly
curl -v -X GET http://localhost:8000/auth/profile \
  -H "Authorization: Bearer <your_token_here>"

# -v flag shows all headers including what was sent
```

**Check 5: Check if CORS headers are present**
```bash
curl -i http://localhost:8000/auth/profile \
  -H "Authorization: Bearer test123"

# Look for these headers:
# Access-Control-Allow-Headers: Content-Type, Authorization, ...
# Access-Control-Expose-Headers: Content-Length, X-Total-Count, Authorization
```

---

## Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| nginx: [emerg] unknown directive "fastcgi_param" | Typo in nginx.conf | Check syntax: `fastcgi_param HTTP_AUTHORIZATION $http_authorization;` |
| HTTP_AUTHORIZATION still empty | nginx.conf not updated | Rebuild containers: `docker-compose build --no-cache` |
| PHP container won't start | Syntax error in index.php | Check error logs: `docker-compose logs php` |
| 401 on login | Wrong credentials or JWT_SECRET mismatch | Verify JWT_SECRET is loaded: `docker exec elonmerch_php php -r "require_once '/var/www/api/config/db.php'; echo JWT_SECRET;"` |
| CORS preflight failing | CorsMiddleware issue | Check: `curl -i -X OPTIONS http://localhost:8000/auth/profile -H "Origin: http://localhost:5173"` |

---

## Nuclear Option (If Everything Fails)

```bash
# Stop and remove everything
docker-compose down -v

# Remove all docker images
docker image prune -a --force

# Restart from scratch
docker-compose build --no-cache
docker-compose up -d

# Wait for MySQL to be healthy
sleep 10
docker-compose ps

# Test
curl -X GET http://localhost:8000/debug_auth.php \
  -H "Authorization: Bearer test123"
```

---

## Summary of Changes

What was changed and why:

1. **nginx.conf**
   - Added `fastcgi_param HTTP_AUTHORIZATION $http_authorization;`
   - This converts the Authorization request header to HTTP_AUTHORIZATION server variable
   - Added buffer and timeout settings for better reliability

2. **api/index.php**
   - Added Authorization header initialization at the TOP of file
   - This handles cases where nginx doesn't automatically convert the header
   - Uses multiple fallback methods to ensure header is always available

3. **api/middleware/CorsMiddleware.php**
   - Added 'Authorization' to `allowed_headers` (what client can send)
   - Added 'Authorization' to `expose_headers` (what client can read)
   - These are required for browser CORS preflight to pass Authorization header

4. **api/debug_auth.php**
   - Enhanced with better diagnostic information
   - Shows jwt_secret status, header status, and verification results
   - Helps troubleshoot future auth issues

---

## Expected Result

After applying these fixes and running the commands above:

✅ Authorization header no longer arrives as empty string
✅ Frontend can send tokens to backend
✅ Backend can read Authorization: Bearer <token> from requests
✅ Protected endpoints work without 401 errors
✅ Admin Dashboard Add Event works
✅ CORS preflight requests succeed with Authorization header

---

## Verification Checklist

- [ ] Ran `docker-compose down`
- [ ] Ran `docker-compose build --no-cache`
- [ ] Ran `docker-compose up -d`
- [ ] Ran verification test: `curl http://localhost:8000/debug_auth.php -H "Authorization: Bearer test"`
- [ ] Got "http_authorization_present": true in response
- [ ] Tested login endpoint - got token
- [ ] Tested protected endpoint with token - got 200 OK (not 401)
- [ ] Tested Admin Dashboard - Add Event works
- [ ] No 401 Unauthorized errors anywhere

All checks passed? ✅ Authorization header fix is complete!
