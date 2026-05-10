# QUICK START: JWT Secret Fix

## TL;DR - Run These Commands Now

```bash
# 1. Stop containers
docker-compose down

# 2. Rebuild PHP with updated environment
docker-compose build --no-cache php

# 3. Start everything
docker-compose up -d

# 4. Verify JWT_SECRET is loaded
docker exec elonmerch_php sh -c 'echo $JWT_SECRET'
# Should print: your_super_secret_jwt_key_change_this_in_production
```

## What Was Fixed

| File | Issue | Fix |
|------|-------|-----|
| `docker-compose.yml` | JWT_SECRET not passed to PHP | Added `JWT_SECRET=${JWT_SECRET:-...}` to php.environment |
| `api/config/db.php` | Hardcoded secret value | Now reads from `getenv('JWT_SECRET')` |
| `api/utils/JwtToken.php` | Inconsistent secret usage | Now uses JWT_SECRET constant from db.php |

## Before & After

### Before (❌ 401 Unauthorized)
```
Frontend → Backend with token
Backend tries to verify with different secret
Signature mismatch → 401 Unauthorized
```

### After (✓ Works)
```
Frontend → Backend with token
Backend verifies with SAME secret (from docker-compose.yml)
Signature matches → 200 OK
```

## Files Updated

1. ✓ **docker-compose.yml** - Added JWT_SECRET to PHP environment
2. ✓ **api/config/db.php** - Uses getenv('JWT_SECRET') 
3. ✓ **api/utils/JwtToken.php** - Uses JWT_SECRET constant
4. **DOCKER_JWT_SETUP_COMMANDS.md** - Complete reference guide
5. **JWT_SYNCHRONIZATION_COMPLETE.md** - Detailed documentation

## Next Steps

1. Ensure `.env` file exists (copy from `.env.example` if needed)
2. Run the Docker commands above
3. Test login: `curl -X POST http://localhost:8000/auth/login -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"password123"}'`
4. Use token in Admin Dashboard - Add Event should now work without 401 errors

## Troubleshooting

**Still getting 401?**
```bash
# Check JWT_SECRET is in container
docker exec elonmerch_php sh -c 'echo $JWT_SECRET'

# Check if it's accessible to PHP
docker exec elonmerch_php php -r "require_once '/var/www/api/config/db.php'; echo JWT_SECRET;"

# View PHP logs for errors
docker-compose logs php
```

## Key Change Summary

```
Environment Variable Flow:
.env → docker-compose.yml → PHP Container → db.php → JwtToken.php
   ↓                           ↓              ↓           ↓
your_secret_here          -e JWT_SECRET=   getenv()    uses const
```

All three now use the **same secret** - 401 errors are fixed!
