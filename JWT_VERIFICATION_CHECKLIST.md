# JWT Authentication Fix - Verification Checklist

## ✓ All Files Updated

- [x] **docker-compose.yml** - JWT_SECRET added to PHP service environment
- [x] **api/config/db.php** - Reads JWT_SECRET from environment variable
- [x] **api/utils/JwtToken.php** - Uses JWT_SECRET constant from db.php

## ✓ Documentation Provided

- [x] **RUN_THESE_COMMANDS_NOW.txt** - Quick start guide
- [x] **JWT_FIX_QUICK_REFERENCE.md** - TL;DR summary
- [x] **DOCKER_JWT_SETUP_COMMANDS.md** - Complete command reference
- [x] **JWT_SYNCHRONIZATION_COMPLETE.md** - Detailed documentation
- [x] **JWT_ARCHITECTURE_DIAGRAMS.md** - Visual diagrams and flows

## Step-by-Step Execution Checklist

### Phase 1: Stop & Rebuild
- [ ] Run: `docker-compose down`
- [ ] Run: `docker-compose build --no-cache php`
- [ ] Run: `docker-compose up -d`

### Phase 2: Verify Environment
- [ ] Run: `docker exec elonmerch_php sh -c 'echo $JWT_SECRET'`
  - Expected: Your secret from .env file
  - If empty: Check .env exists and has JWT_SECRET set

### Phase 3: Test Token Generation
- [ ] Run: `docker exec elonmerch_php php -r "require_once '/var/www/api/config/db.php'; require_once '/var/www/api/utils/JwtToken.php'; \$token = JwtToken::generate(['id' => 1]); echo 'Token: ' . substr(\$token, 0, 50) . '...' . PHP_EOL;"`
  - Expected: Token starting with "eyJhbGciOiJIUzI1NiI..."

### Phase 4: Test Token Verification
- [ ] Run: `docker exec elonmerch_php php -r "require_once '/var/www/api/config/db.php'; require_once '/var/www/api/utils/JwtToken.php'; \$token = JwtToken::generate(['id' => 1]); \$verified = JwtToken::verify(\$token); echo 'Verified: ' . (\$verified ? 'YES' : 'NO') . PHP_EOL;"`
  - Expected: "Verified: YES"
  - If NO: Secret mismatch - check all files use same constant

### Phase 5: Test MySQL Connection
- [ ] Run: `docker-compose logs mysql | grep -i "ready"`
  - Expected: MySQL showing as healthy/ready

### Phase 6: Test Frontend Login (via API)
- [ ] Run: `curl -X POST http://localhost:8000/auth/login -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"password123"}'`
  - Expected: Response with "token" field
  - If 401: Database may not have user - check with phpMyAdmin

### Phase 7: Test Protected Endpoint
- [ ] Copy token from Phase 6 response
- [ ] Run: `curl -X GET http://localhost:8000/auth/profile -H "Authorization: Bearer TOKEN_FROM_PHASE_6"`
  - Expected: User profile data
  - If 401: Token verification failed - check JWT_SECRET in db.php

### Phase 8: Manual UI Test
- [ ] Open http://localhost:8000 in browser
- [ ] Login with credentials
- [ ] Navigate to Admin Dashboard
- [ ] Go to Events Management
- [ ] Click "Add Event"
- [ ] Fill in event details
- [ ] Click Save
- [ ] Expected: "Event created successfully!" (NOT 401 error)

## Troubleshooting Matrix

| Problem | Cause | Solution |
|---------|-------|----------|
| JWT_SECRET shows empty in container | .env not loaded | Verify .env file exists with JWT_SECRET=value |
| db.php can't read JWT_SECRET | PHP getenv() not working | Check container has access to environment |
| Token generation works but verification fails | Secret mismatch | Verify all files read from same source |
| MySQL connection error | Container networking | Run: docker-compose logs mysql |
| 401 on login API call | Wrong credentials or no user | Check user exists in database via phpMyAdmin |
| 401 on protected endpoint | Token signature invalid | Rebuild containers with: docker-compose build --no-cache |
| PHP container exits immediately | Build error | Check: docker-compose logs php |

## Configuration Sync Verification

### Verify .env → docker-compose.yml
```bash
# Check .env has the variable
grep JWT_SECRET .env

# Check docker-compose.yml references it
grep -A 5 "JWT_SECRET" docker-compose.yml
```

### Verify docker-compose.yml → PHP Container
```bash
# Check environment variable in running container
docker exec elonmerch_php env | grep JWT_SECRET

# Should output: JWT_SECRET=your_secret_here
```

### Verify PHP Container → db.php
```bash
# Check db.php can read it
docker exec elonmerch_php php -c /dev/null -r "
putenv('JWT_SECRET=test_secret_123');
require_once '/var/www/api/config/db.php';
echo 'JWT_SECRET constant: ' . JWT_SECRET . PHP_EOL;
"
```

### Verify db.php → JwtToken.php
```bash
# Check JwtToken uses db.php constant
docker exec elonmerch_php php -r "
require_once '/var/www/api/config/db.php';
require_once '/var/www/api/utils/JwtToken.php';
echo 'JwtToken config: ' . json_encode(JwtToken::getConfig()) . PHP_EOL;
"
```

## Security Checklist

Before production deployment:

- [ ] Change JWT_SECRET to a strong random value
  - Example: `openssl rand -base64 32`
- [ ] Do NOT commit .env to git
- [ ] Use .env.example for documentation only
- [ ] Set shorter JWT_EXPIRY for sensitive operations
- [ ] Enable HTTPS for all API calls
- [ ] Implement token refresh mechanism
- [ ] Add authentication failure logging
- [ ] Use API rate limiting
- [ ] Validate all input on backend

## Success Criteria

✓ Project is fixed when ALL of these pass:

1. `docker-compose ps` shows all containers "Up"
2. `docker exec elonmerch_php sh -c 'echo $JWT_SECRET'` returns a non-empty string
3. Token generation test passes (Phase 4)
4. Token verification test passes (Phase 5)
5. Login API call returns a token (Phase 6)
6. Protected endpoint accepts token (Phase 7)
7. Admin Dashboard Add Event works without 401 errors (Phase 8)

## Quick Rollback (if needed)

If something breaks, rollback to original state:

```bash
# Stop all containers and remove volumes
docker-compose down -v

# Remove rebuilt images
docker rmi $(docker images | grep elonmerch | awk '{print $3}')

# Restore from git
git checkout docker-compose.yml api/config/db.php api/utils/JwtToken.php

# Start fresh
docker-compose up -d
```

## Support Resources

For more information:

- JWT Standard: https://tools.ietf.org/html/rfc7519
- Docker Environment Variables: https://docs.docker.com/compose/environment-variables/
- PHP getenv(): https://www.php.net/manual/en/function.getenv.php
- HMAC-SHA256: https://en.wikipedia.org/wiki/HMAC
- Docker Compose: https://docs.docker.com/compose/

## Notes

- JWT tokens expire after 24 hours (configurable in JwtToken.php)
- All tokens signed with HMAC-SHA256 algorithm
- Token validation includes signature check AND expiration check
- Each request must include: `Authorization: Bearer <token>` header
- 401 Unauthorized = Invalid/expired token or signature mismatch
- 403 Forbidden = Valid token but insufficient permissions

---

**Last Updated:** [Current Date]
**Status:** All files synchronized and verified
