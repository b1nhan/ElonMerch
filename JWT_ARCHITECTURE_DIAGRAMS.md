# JWT Secret Synchronization: Architecture & Flow Diagrams

## 1. Configuration Flow (How JWT_SECRET Reaches PHP Code)

```
┌─────────────────────────────────────────────────────────────────┐
│ .env File (Your Secret)                                         │
│ JWT_SECRET=your_super_secret_jwt_key_change_this_in_production │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ Docker reads .env
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ docker-compose.yml (Pass to Container)                          │
│ environment:                                                    │
│   - JWT_SECRET=${JWT_SECRET:-fallback}                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ Docker sets env var in container
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ PHP Container Process                                           │
│ $JWT_SECRET = your_super_secret_jwt_key_change_this_in_prod... │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ PHP reads via getenv()
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ api/config/db.php                                               │
│ $jwt_secret = getenv('JWT_SECRET');                            │
│ define('JWT_SECRET', $jwt_secret);                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ Other files use constant
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ api/utils/JwtToken.php                                          │
│ self::$secret = JWT_SECRET;  // Uses same constant             │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Token Lifecycle (Request/Response Flow)

```
FRONTEND                              BACKEND
   │                                     │
   │ 1. User enters credentials          │
   ├─────────────────────────────────────►
   │    POST /auth/login                 │
   │    {email, password}                │
   │                                     │
   │                      2. Verify credentials
   │                                     │
   │                      3. Generate JWT token
   │                         using JWT_SECRET constant
   │                         (from db.php)
   │                                     │
   │◄─────────────────────────────────────
   │ 4. Return token in response         │
   │    {token, user}                    │
   │                                     │
   5. Store token in localStorage        │
   │    localStorage.setItem('token', token)
   │                                     │
   6. Make API request with token        │
   ├─────────────────────────────────────►
   │ Authorization: Bearer <token>       │
   │ POST /events                        │
   │                                     │
   │                      7. Extract token from header
   │                         JwtToken::getFromHeader()
   │                                     │
   │                      8. Verify token signature
   │                         Using SAME JWT_SECRET constant
   │                         hash_hmac('sha256', ...)
   │                                     │
   │                      9. Check if signature matches
   │                         Signature OK? ✓ → Continue
   │                         Signature fails? ✗ → 401
   │                                     │
   │◄─────────────────────────────────────
   10. Return response (200 OK or 401)  │
```

## 3. Signature Verification: Why Secrets Must Match

```
TOKEN GENERATION (Login)                  TOKEN VERIFICATION (Protected Request)
═══════════════════════════════          ════════════════════════════════════

Input Payload:                            Received Token from Frontend:
{id: 1, email: user@test.com}            eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
                                          .eyJpZCI6MSwiZW1haWwiOiJ1c2VyQHRlc...
                                          .NXJRa0VrTElQUTBBRVJVdDkyOUppcEd1RGc5Y0Q4

│                                         │
│ Create Header.Payload                   │ Split into parts:
│ header_encoded.payload_encoded          │ [header, payload, signature]
│                                         │
│ Calculate Signature:                    │ Extract header and payload
│ hash_hmac('sha256',                     │
│   'header.payload',                     │ Recalculate signature:
│   JWT_SECRET ← ⚠️  SAME SECRET NEEDED  │ hash_hmac('sha256',
│ )                                       │   'header.payload',
│                                         │   JWT_SECRET ← ⚠️  SAME SECRET
│ Encoded as Base64URL:                   │ )
│ NXJRa0VrTElQUTBBRVJVdDkyOUppcEd1RGc5Y... │
│                                         │ Encoded as Base64URL
│ Final Token:                            │ Compare signatures:
│ header.payload.signature                │ Signature from token ==
│                                         │ Recalculated signature?
│                                         │
│                                         │ YES ✓ → Token valid
│                                         │ NO  ✗ → 401 Unauthorized
```

## 4. Before vs After Fix

### BEFORE (❌ 401 Error)

```
Frontend Token Generation:
Token signed with secret: "your_super_secret_jwt_key"

Backend Token Verification:
Trying to verify with secret: "elonmerch_secret_key_2026"
                                  ↓
                          Secrets don't match!
                                  ↓
                          Signature verification FAILS
                                  ↓
                                401 Unauthorized
```

### AFTER (✓ Works)

```
Frontend Token Generation:
Token signed with secret: "your_super_secret_jwt_key"

Backend Token Verification:
Trying to verify with secret: "your_super_secret_jwt_key"
                                  ↓
                          Secrets MATCH!
                                  ↓
                          Signature verification PASSES
                                  ↓
                                200 OK
```

## 5. File Relationship Diagram

```
┌──────────────────┐
│   .env File      │
│ JWT_SECRET=...   │
└────────┬─────────┘
         │ (read by docker-compose)
         ▼
┌──────────────────────────────┐
│  docker-compose.yml          │
│  - JWT_SECRET=${JWT_SECRET}  │
└────────┬─────────────────────┘
         │ (sets container env var)
         ▼
┌──────────────────────────────────────────┐
│  PHP Container Process Environment       │
│  JWT_SECRET=your_super_secret_jwt_key... │
└────────┬─────────────────────────────────┘
         │ (read by PHP getenv())
         ▼
┌────────────────────────────────────────────┐
│  api/config/db.php                         │
│  $secret = getenv('JWT_SECRET');           │
│  define('JWT_SECRET', $secret);            │
└────────┬───────────────────────────────────┘
         │ (constant defined here)
         ▼
    ┌────┴────┐
    │          │
    ▼          ▼
┌─────────────────────────────┐  ┌──────────────────────┐
│ api/utils/JwtToken.php      │  │ Other API Files      │
│ Uses JWT_SECRET constant    │  │ Uses JWT_SECRET      │
│                             │  │                      │
│ Generate: hash_hmac with    │  │ (/auth/login, etc)   │
│ JWT_SECRET                  │  │                      │
│                             │  │                      │
│ Verify: hash_hmac with      │  │                      │
│ JWT_SECRET                  │  │                      │
└─────────────────────────────┘  └──────────────────────┘
```

## 6. Environment Variable Resolution Flow

```
Step 1: Docker Start
┌─────────────────────────────────────────┐
│ docker-compose.yml reads .env           │
│ Finds: JWT_SECRET=my_secret_key         │
└──────────────┬──────────────────────────┘

Step 2: Container Launch
│ PHP container starts with env vars:
│ JWT_SECRET=my_secret_key
└──────────────┬──────────────────────────┘

Step 3: PHP Process
│ api/config/db.php runs:
│ getenv('JWT_SECRET') → returns 'my_secret_key'
│ define('JWT_SECRET', 'my_secret_key')
└──────────────┬──────────────────────────┘

Step 4: Token Operations
│ JwtToken::init()
│ self::$secret = JWT_SECRET = 'my_secret_key'
└──────────────┬──────────────────────────┘

Step 5: Request Handling
│ User login:
│   JwtToken::generate() uses $secret
│   Creates token with signature using 'my_secret_key'
│
│ Protected request:
│   JwtToken::verify() uses $secret
│   Verifies token signature using 'my_secret_key'
│   Signatures match ✓ → 200 OK
└─────────────────────────────────────────┘
```

## 7. Common Mistakes to Avoid

```
❌ WRONG - Hardcoded different secrets:
   db.php:       define('JWT_SECRET', 'secret1');
   JwtToken.php: self::$secret = 'secret2';
   Result: Signatures won't match → 401

✓ CORRECT - Same secret via environment:
   .env:        JWT_SECRET=my_secret
   db.php:      define('JWT_SECRET', getenv('JWT_SECRET'));
   JwtToken.php: self::$secret = JWT_SECRET;
   Result: Signatures match → 200 OK

❌ WRONG - Not passing env var to container:
   .env has JWT_SECRET=my_secret
   docker-compose.yml doesn't pass it
   Result: Container can't access the secret

✓ CORRECT - Pass env var through docker-compose:
   docker-compose.yml:
   environment:
     - JWT_SECRET=${JWT_SECRET:-fallback}
   Result: Secret available in container
```

## 8. Docker Build Process

```
docker-compose build --no-cache php

1. Read Dockerfile.php
   │
2. Read docker-compose.yml environment section
   │
3. Set environment variables for build context:
   JWT_SECRET=${JWT_SECRET:-fallback}
   │
4. Build image with these variables available
   │
5. When container starts, PHP can access:
   getenv('JWT_SECRET')
   │
6. Later PHP requests can use constant:
   define('JWT_SECRET', getenv('JWT_SECRET'))
```

This ensures that every running container has the same JWT_SECRET from your .env file!
