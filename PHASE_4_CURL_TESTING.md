# PHASE 4: QUICK cURL TESTING REFERENCE

## Test Authentication

### Register New User
```bash
curl -X POST http://localhost:80/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane'$(date +%s)'@example.com",
    "password": "password123",
    "phone": "0987654321",
    "address": "456 Elm Street"
  }'
```

### Login as Admin
```bash
curl -X POST http://localhost:80/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@elonmerch.com",
    "password": "password123"
  }' | jq .
```

**Save the token:**
```bash
TOKEN=$(curl -s -X POST http://localhost:80/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@elonmerch.com", "password": "password123"}' | jq -r '.data.token')

echo $TOKEN
```

### Get User Profile (requires token)
```bash
curl -X GET http://localhost:80/auth/profile \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

## Test Events

### Get All Events (with pagination)
```bash
curl -X GET "http://localhost:80/events?page=1&per_page=10&status=upcoming" | jq .
```

### Get Events by Status
```bash
# Upcoming events
curl -X GET "http://localhost:80/events?status=upcoming" | jq .

# Completed events
curl -X GET "http://localhost:80/events?status=completed" | jq .
```

### Get Single Event
```bash
# Event 1: Lệ Chi Viên 2024
curl -X GET http://localhost:80/events/1 | jq .

# Event 2: Soobin Live Concert 2024
curl -X GET http://localhost:80/events/2 | jq .

# Event 3: Workshop Làm nến thơm
curl -X GET http://localhost:80/events/3 | jq .

# Event 4: Thuốc Đắng Dã Tật
curl -X GET http://localhost:80/events/4 | jq .
```

### Get Non-existent Event (404)
```bash
curl -X GET http://localhost:80/events/99999 | jq .
```

---

## Test Products

### Get All Products (with pagination)
```bash
curl -X GET "http://localhost:80/products?page=1&per_page=10&status=available" | jq .
```

### Get Products by Category
```bash
curl -X GET "http://localhost:80/products?category=Áo" | jq .
curl -X GET "http://localhost:80/products?category=Phụ%20kiện" | jq .
curl -X GET "http://localhost:80/products?category=Túi" | jq .
```

### Get Single Product
```bash
# Product 1: Áo Thun Soobin (199k)
curl -X GET http://localhost:80/products/1 | jq .

# Product 2: Lightstick Concert (89k)
curl -X GET http://localhost:80/products/2 | jq .

# Product 3: Khăn Bandana (79k)
curl -X GET http://localhost:80/products/3 | jq .

# Product 4: Tote Bag (149k)
curl -X GET http://localhost:80/products/4 | jq .

# Product 8: Combo VIP (449k)
curl -X GET http://localhost:80/products/8 | jq .
```

---

## Test Error Cases

### Invalid Email on Login
```bash
curl -X POST http://localhost:80/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "wrong@example.com", "password": "password123"}' | jq .
```

### Invalid Password on Login
```bash
curl -X POST http://localhost:80/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@elonmerch.com", "password": "wrongpassword"}' | jq .
```

### Missing Required Fields
```bash
curl -X POST http://localhost:80/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John"}' | jq .
```

### Event Not Found
```bash
curl -X GET http://localhost:80/events/99999 | jq .
```

### Product Not Found
```bash
curl -X GET http://localhost:80/products/99999 | jq .
```

---

## Testing from React Frontend

### Simple Fetch in Browser Console
```javascript
// Test health check
fetch('http://localhost:80/').then(r => r.json()).then(console.log)

// Test login
fetch('http://localhost:80/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({email: 'admin@elonmerch.com', password: 'password123'})
}).then(r => r.json()).then(data => {
  console.log(data)
  localStorage.setItem('token', data.data.token)
})

// Test get events
fetch('http://localhost:80/events').then(r => r.json()).then(console.log)

// Test get products
fetch('http://localhost:80/products').then(r => r.json()).then(console.log)

// Test get user profile with token
const token = localStorage.getItem('token')
fetch('http://localhost:80/auth/profile', {
  headers: {'Authorization': `Bearer ${token}`}
}).then(r => r.json()).then(console.log)
```

### React Hook Example
```javascript
import { useEffect, useState } from 'react';

export function EventsList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:80/events?status=upcoming')
      .then(r => r.json())
      .then(data => {
        setEvents(data.data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {events.map(event => (
        <div key={event.id}>
          <h3>{event.title}</h3>
          <p>{event.date} - {event.location}</p>
          <p>Regular: {event.reg_price}₫ | VIP: {event.vip_price}₫</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Response Structure Reference

### Success Response
```json
{
  "status": "success",
  "message": "Description",
  "data": [...],
  "meta": {
    "timestamp": "2024-05-10T10:30:00Z",
    "endpoint": "/events",
    "http_code": 200
  }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "data": null,
  "meta": {
    "timestamp": "2024-05-10T10:30:00Z",
    "endpoint": "/events",
    "http_code": 400
  }
}
```

### Paginated Response
```json
{
  "status": "success",
  "data": [...],
  "meta": {
    "pagination": {
      "total": 100,
      "per_page": 10,
      "current_page": 1,
      "total_pages": 10,
      "has_next": true,
      "has_previous": false
    }
  }
}
```

---

## Useful Shortcuts

### Pretty print JSON
```bash
curl ... | jq .
```

### Get just data field
```bash
curl ... | jq .data
```

### Check HTTP status
```bash
curl -X GET http://localhost:80/events -w "\nStatus: %{http_code}\n" -s
```

### Save response to file
```bash
curl -X GET http://localhost:80/events > events.json
```

### Test with custom timeout
```bash
curl --max-time 5 http://localhost:80/events
```

---

## Verify Endpoints are Working

All these should return HTTP 200:
```bash
echo "Health check:"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:80/

echo "Events:"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:80/events

echo "Event 1:"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:80/events/1

echo "Products:"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:80/products

echo "Product 1:"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:80/products/1

echo "Login (should be 200):"
curl -s -X POST http://localhost:80/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@elonmerch.com", "password": "password123"}' \
  -o /dev/null -w "%{http_code}\n"
```
