# Backend DELETE Fix - Exact Docker Commands & Verification

## Deployment Commands

### Step 1: Verify PHP Code Was Updated

```bash
# Check EventController.php has the fix
docker-compose exec php grep -n "rowCount()" /var/www/api/controllers/EventController.php

# Expected output:
# Line with rowCount() checks should appear (means fix is in place)
```

### Step 2: Restart PHP Container

```bash
# Option A: Just restart PHP (quickest)
docker-compose restart php

# Verify it started
sleep 2
docker-compose ps | grep php
# Should show "Up"

# Option B: Full restart (safest)
docker-compose down
docker-compose up -d
sleep 5
docker-compose ps
```

### Step 3: Verify Containers Are Healthy

```bash
# Check all containers running
docker-compose ps

# Expected:
# NAME                    COMMAND                   STATUS
# elonmerch_php          docker-php-entrypo...    Up
# elonmerch_mysql        docker-entrypoint...    Up (healthy)
# elonmerch_nginx        nginx -g daemon off     Up

# If mysql not healthy:
docker-compose logs mysql | tail -20
# Check for connection errors
```

---

## Manual Verification Tests

### Test 1: Create & Delete with Logging

```bash
#!/bin/bash

# Get token
TOKEN=$(curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}' | jq -r '.data.token')

echo "Token: $TOKEN"

# Create event
RESPONSE=$(curl -s -X POST http://localhost:8000/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Test Delete Event",
    "date":"2025-01-20",
    "time":"19:00",
    "location":"Test Hall",
    "reg_price":500000,
    "vip_price":750000,
    "total_tickets":1000
  }')

EVENT_ID=$(echo $RESPONSE | jq -r '.data.id')
echo "Created event: $EVENT_ID"

# Verify it exists
echo "Verifying event exists..."
curl -s -X GET http://localhost:8000/events/$EVENT_ID \
  -H "Authorization: Bearer $TOKEN" | jq '.data | {id, title}'

# Delete it
echo "Deleting event..."
DELETE_RESPONSE=$(curl -s -X DELETE http://localhost:8000/events/$EVENT_ID \
  -H "Authorization: Bearer $TOKEN")

echo "Delete response: $DELETE_RESPONSE" | jq .

# Try to fetch it (should 404)
echo "Verifying event is deleted..."
curl -s -X GET http://localhost:8000/events/$EVENT_ID \
  -H "Authorization: Bearer $TOKEN" | jq .

# Check logs
echo ""
echo "=== PHP Logs (should show delete verification) ==="
docker-compose logs php | grep -A5 "EVENT_DELETE" | tail -20
```

### Test 2: Database Verification

```bash
# Login to MySQL
docker-compose exec mysql mysql -u root -p'password' elonmerch_db

# In MySQL console:

-- List all events
SELECT id, title FROM events ORDER BY id DESC LIMIT 10;

-- Create a test event manually (to verify DELETE works)
INSERT INTO events (title, date, time, location, reg_price, vip_price, total_tickets) 
VALUES ('Test Event', '2025-01-20', '19:00', 'Test', 500000, 750000, 1000);

-- Get the ID of the event we just created
SELECT LAST_INSERT_ID();

-- Try to delete it
DELETE FROM events WHERE id = LAST_INSERT_ID();

-- Check affected rows (should be 1)
SELECT ROW_COUNT();

-- Verify it's gone
SELECT * FROM events WHERE id = LAST_INSERT_ID();
-- Should return: Empty set (0 rows)

-- Exit MySQL
exit;
```

### Test 3: Check Permissions

```bash
# Check if PHP user has DELETE permission
docker-compose exec mysql mysql -u root -p'password' -e "
SHOW GRANTS FOR 'elonmerch_user'@'%';
"

# Expected output should include:
# GRANT SELECT, INSERT, UPDATE, DELETE ...

# If DELETE is missing, grant it:
docker-compose exec mysql mysql -u root -p'password' -e "
GRANT DELETE ON elonmerch_db.* TO 'elonmerch_user'@'%';
FLUSH PRIVILEGES;
"

# Verify again
docker-compose exec mysql mysql -u root -p'password' -e "
SHOW GRANTS FOR 'elonmerch_user'@'%';
"
```

### Test 4: Check PHP Error Logs

```bash
# View PHP error log
docker-compose logs php

# Filter for DELETE operations
docker-compose logs php | grep EVENT_DELETE

# Filter for all errors
docker-compose logs php | grep -i error

# Follow logs in real-time (useful while testing)
docker-compose logs -f php &
# Then run delete operations
# Press Ctrl+C to stop
```

---

## Curl Testing Commands

### Complete Delete Test Flow

```bash
#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "=== Testing DELETE Verification Fix ==="
echo ""

# Step 1: Login
echo "Step 1: Logging in..."
LOGIN=$(curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}')

TOKEN=$(echo $LOGIN | jq -r '.data.token')
if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo -e "${RED}✗ Login failed${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Login successful${NC}"
echo "Token: $TOKEN"
echo ""

# Step 2: Create event
echo "Step 2: Creating event..."
CREATE=$(curl -s -X POST http://localhost:8000/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Test Delete Event",
    "date":"2025-01-20",
    "time":"19:00",
    "location":"Test Hall",
    "reg_price":500000,
    "vip_price":750000,
    "total_tickets":1000
  }')

EVENT_ID=$(echo $CREATE | jq -r '.data.id')
if [ -z "$EVENT_ID" ] || [ "$EVENT_ID" == "null" ]; then
  echo -e "${RED}✗ Event creation failed${NC}"
  echo $CREATE | jq .
  exit 1
fi
echo -e "${GREEN}✓ Event created: $EVENT_ID${NC}"
echo ""

# Step 3: Verify it exists
echo "Step 3: Verifying event exists..."
GET=$(curl -s -X GET http://localhost:8000/events/$EVENT_ID \
  -H "Authorization: Bearer $TOKEN")

EVENT_TITLE=$(echo $GET | jq -r '.data.title')
if [ -z "$EVENT_TITLE" ] || [ "$EVENT_TITLE" == "null" ]; then
  echo -e "${RED}✗ Event not found${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Event found: $EVENT_TITLE${NC}"
echo ""

# Step 4: Delete event
echo "Step 4: Deleting event..."
DELETE=$(curl -s -X DELETE http://localhost:8000/events/$EVENT_ID \
  -H "Authorization: Bearer $TOKEN")

DELETE_STATUS=$(echo $DELETE | jq -r '.status')
if [ "$DELETE_STATUS" != "success" ]; then
  echo -e "${RED}✗ Delete failed${NC}"
  echo $DELETE | jq .
  exit 1
fi
echo -e "${GREEN}✓ Delete returned success${NC}"
echo ""

# Step 5: Verify event is deleted
echo "Step 5: Verifying event is deleted..."
VERIFY=$(curl -s -w "\n%{http_code}" -X GET http://localhost:8000/events/$EVENT_ID \
  -H "Authorization: Bearer $TOKEN")

HTTP_CODE=$(echo "$VERIFY" | tail -n1)
if [ "$HTTP_CODE" == "404" ]; then
  echo -e "${GREEN}✓ Event is deleted (404 response)${NC}"
elif [ "$HTTP_CODE" == "200" ]; then
  echo -e "${RED}✗ Event still exists (200 response)${NC}"
  echo "$VERIFY" | jq .
  exit 1
else
  echo -e "${RED}✗ Unexpected HTTP code: $HTTP_CODE${NC}"
  exit 1
fi
echo ""

# Step 6: Check database directly
echo "Step 6: Checking database directly..."
DB_CHECK=$(docker-compose exec mysql mysql -u root -p'password' elonmerch_db -e \
  "SELECT COUNT(*) as count FROM events WHERE id = $EVENT_ID;")

echo "$DB_CHECK"

echo ""
echo -e "${GREEN}=== All Tests Passed ✓ ===${NC}"
```

### Quick Delete Test

```bash
# Simple delete test
EVENT_ID=1  # Change to an existing event ID

TOKEN=$(curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}' | jq -r '.data.token')

# Delete
curl -X DELETE http://localhost:8000/events/$EVENT_ID \
  -H "Authorization: Bearer $TOKEN" | jq .

# Verify it's gone
curl -X GET http://localhost:8000/events/$EVENT_ID \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

## Log Analysis Commands

### View DELETE Logs

```bash
# Show all DELETE operations
docker-compose logs php | grep EVENT_DELETE

# Show last 50 lines of DELETE logs
docker-compose logs php | grep EVENT_DELETE | tail -50

# Show DELETE logs with timestamps
docker-compose logs php | grep EVENT_DELETE | grep -E "ERROR|✓"
```

### Real-time Log Following

```bash
# Follow logs in real-time
docker-compose logs -f php

# Follow specific service logs
docker-compose logs -f php nginx

# Follow with grep filtering
docker-compose logs -f php | grep "EVENT"
```

### Analysis: Check for Errors

```bash
# Find all errors in logs
docker-compose logs | grep -i "error"

# Find database errors
docker-compose logs mysql | grep -i "error"

# Find DELETE errors
docker-compose logs php | grep "EVENT_DELETE.*ERROR"

# Count DELETE operations
docker-compose logs php | grep -c "EVENT_DELETE"
```

---

## Database Direct Testing

### Test via MySQL Console

```bash
# Enter MySQL console
docker-compose exec mysql mysql -u root -p'password' elonmerch_db

# List events (so you know what to delete)
SELECT id, title FROM events ORDER BY created_at DESC LIMIT 10\G

# Get total event count before delete
SELECT COUNT(*) as total FROM events;

# Delete a specific event
DELETE FROM events WHERE id = 1;

# Check how many rows were deleted
SELECT ROW_COUNT();

# Verify it's deleted
SELECT * FROM events WHERE id = 1;

# Get total event count after delete
SELECT COUNT(*) as total FROM events;

# Exit
exit
```

### Verify Table Structure

```bash
# Check table structure
docker-compose exec mysql mysql -u root -p'password' elonmerch_db \
  -e "DESCRIBE events;"

# Check primary key
docker-compose exec mysql mysql -u root -p'password' elonmerch_db \
  -e "SHOW KEYS FROM events WHERE Key_name = 'PRIMARY';"

# Check if there are any triggers
docker-compose exec mysql mysql -u root -p'password' elonmerch_db \
  -e "SHOW TRIGGERS;"
```

---

## Quick Deployment Checklist

```bash
# 1. Verify code update
docker-compose exec php grep -c "rowCount()" /var/www/api/controllers/EventController.php
# Expected: Output > 0 (means fix is present)

# 2. Restart PHP
docker-compose restart php
sleep 2

# 3. Verify running
docker-compose ps | grep php
# Expected: Should show "Up"

# 4. Test basic functionality
docker-compose exec php php -r "echo 'PHP working';"
# Expected: "PHP working"

# 5. Test database connection
docker-compose exec php php -r "
require_once '/var/www/api/config/db.php';
require_once '/var/www/api/config/Database.php';
\$db = Database::getInstance();
\$db->query('SELECT 1');
echo 'Database OK';
"
# Expected: "Database OK"

# 6. Run delete test
# (Use curl test script from above)

# 7. Verify in logs
docker-compose logs php | grep "EVENT_DELETE" | head -5
# Expected: Should show delete operations
```

---

## Troubleshooting Commands

### If Delete Still Not Working

```bash
# Check 1: Verify update was deployed
docker-compose exec php grep -A10 "function delete" /var/www/api/controllers/EventController.php | grep "rowCount"
# Should find rowCount() usage

# Check 2: Restart everything
docker-compose down -v
docker-compose build --no-cache php
docker-compose up -d
sleep 10
docker-compose ps

# Check 3: Test connection
docker-compose exec php php -r "
require_once '/var/www/api/config/Database.php';
try {
    \$db = Database::getInstance();
    \$db->query('DELETE FROM events WHERE id = 0');
    echo 'DELETE works: ' . \$db->rowCount() . ' rows';
} catch (Exception \$e) {
    echo 'Error: ' . \$e->getMessage();
}
"

# Check 4: Manual MySQL test
docker-compose exec mysql mysql -u root -p'password' elonmerch_db -e "
INSERT INTO events (title, date, time, location, reg_price, vip_price, total_tickets) 
VALUES ('test', '2025-01-20', '19:00', 'test', 1, 1, 1);
SELECT LAST_INSERT_ID() INTO @test_id;
DELETE FROM events WHERE id = @test_id;
SELECT ROW_COUNT();
"

# Check 5: View all logs
docker-compose logs
```

### If Permissions Denied

```bash
# Grant all privileges
docker-compose exec mysql mysql -u root -p'password' -e "
GRANT ALL PRIVILEGES ON elonmerch_db.* TO 'elonmerch_user'@'%';
FLUSH PRIVILEGES;
"

# Verify
docker-compose exec mysql mysql -u root -p'password' -e "
SHOW GRANTS FOR 'elonmerch_user'@'%';
"
```

### If Connection Failed

```bash
# Check MySQL is running
docker-compose ps | grep mysql

# If not running:
docker-compose restart mysql
sleep 10
docker-compose ps

# Test connection
docker-compose exec mysql mysql -u root -p'password' -e "SELECT 1;"
```

---

## Summary

**Deploy the fix:**
```bash
# Replace file with fixed version
docker-compose restart php
sleep 2

# Test it
docker-compose logs php | grep EVENT_DELETE
```

**Verify it worked:**
```bash
# Try to delete an event
# Check logs for: "✓ Event successfully deleted"
# Check database: Event should be gone

# If it fails, check:
docker-compose logs php | grep "ERROR"
docker-compose logs mysql | grep "ERROR"
```

**Result:**
✅ UI shows "Event deleted successfully"
✅ Event is actually deleted from database
✅ No fake success messages
