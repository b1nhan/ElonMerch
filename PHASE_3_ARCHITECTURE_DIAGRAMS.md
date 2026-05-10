# Phase 3 Architecture Diagrams

## Request/Response Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React @ localhost:5173)              │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           │ fetch('http://localhost/events')
                           │
                           ▼
                  ┌────────────────┐
                  │  Nginx Proxy   │
                  │  (Port 80)     │
                  └────────┬───────┘
                           │
                           ▼
              ┌────────────────────────────┐
              │  api/index.php             │
              │  (Entry Point)             │
              └────────┬───────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────┐
        │  CorsMiddleware.apply()          │
        │  1. Check origin                 │
        │  2. Set CORS headers             │
        │  3. Handle OPTIONS preflight     │
        └────────┬─────────────────────────┘
                 │
                 ▼
        ┌──────────────────────────────────┐
        │  Router.dispatch()               │
        │  1. Parse URL path               │
        │  2. Match against routes         │
        │  3. Extract parameters (:id)    │
        └────────┬─────────────────────────┘
                 │
                 ▼
        ┌──────────────────────────────────┐
        │  EventController.list()          │
        │  (or appropriate controller)     │
        │  Extends BaseController          │
        └────────┬─────────────────────────┘
                 │
                 ├─→ getInput()
                 ├─→ validate()
                 ├─→ fetchAll()
                 │   │
                 │   ▼
                 │  ┌──────────────────────┐
                 │  │  Database.query()    │
                 │  │  Prepared statement  │
                 │  │  with parameters     │
                 │  └──────────┬───────────┘
                 │             │
                 │             ▼
                 │  ┌──────────────────────┐
                 │  │  MySQL Database      │
                 │  │  (elonmerch_db)      │
                 │  └──────────┬───────────┘
                 │             │
                 │             ▼ Returns rows
                 │  ┌──────────────────────┐
                 │  │  Database.fetchAll() │
                 │  │  Returns associative │
                 │  │  array of results    │
                 │  └──────────┬───────────┘
                 │             │
                 ▼             │
        ┌──────────────────────┼──────────┐
        │  Response.success()  │          │
        │  1. Format JSON      │ Returns  │
        │  2. Set HTTP code    │ JSON     │
        │  3. Add metadata     │          │
        │  4. Send to browser  │          │
        └──────────┬───────────┼──────────┘
                   │           │
                   │ ◄─────────┘
                   │
                   ▼
        ┌──────────────────────────────────┐
        │  Browser receives JSON response  │
        │  {                               │
        │    "status": "success",          │
        │    "data": [...],                │
        │    "meta": {...}                 │
        │  }                               │
        └──────────┬─────────────────────────┘
                   │
                   ▼
        ┌──────────────────────────────────┐
        │  React Component updates state   │
        │  and re-renders UI               │
        └──────────────────────────────────┘
```

---

## CORS Preflight Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Browser at http://localhost:5173 makes fetch request        │
│ to http://localhost:80/events                               │
└─────────────────────────────────┬───────────────────────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │ Is cross-origin request? │ YES
                    │ (different domain/port)  │
                    └───────────┬──────────────┘
                                │
                    ┌───────────▼───────────┐
                    │  Send preflight       │
                    │  OPTIONS request      │
                    │  with Origin header   │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────────┐
                    │  api/index.php receives  │
                    │  OPTIONS request         │
                    └───────────┬───────────────┘
                                │
                                ▼
                    ┌───────────────────────────┐
                    │  CorsMiddleware.apply()  │
                    │  • Check origin allowed? │
                    │  • Set CORS headers      │
                    │  • Exit with 200 OK      │
                    └───────────┬───────────────┘
                                │
                    ┌───────────▼───────────┐
                    │ Browser receives:     │
                    │ 200 OK + CORS headers │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │ Browser validates     │
                    │ Access-Control-Allow- │
                    │ Origin header         │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │ Origin matches?       │ YES
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │ Send ACTUAL request   │
                    │ (GET, POST, etc.)     │
                    │ with all headers      │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────────┐
                    │  api/index.php processes │
                    │  actual request          │
                    │  (routing, etc.)         │
                    └───────────┬───────────────┘
                                │
                                ▼
                    ┌───────────────────────────┐
                    │  Controller handles       │
                    │  request and returns      │
                    │  JSON response           │
                    └───────────┬───────────────┘
                                │
                                ▼
                    ┌───────────────────────────┐
                    │  Browser receives JSON    │
                    │  in React component       │
                    │  SUCCESS! ✓               │
                    └───────────────────────────┘

If Origin NOT allowed:
                    │
                    ▼
        Browser blocks response (CORS error in console)
        Request still reaches server but response discarded
```

---

## Routing & Parameter Extraction

```
URL: /events/123/reviews
Route Pattern: /events/:id/reviews
Regex Generated: #^/events/(?P<id>[a-zA-Z0-9_-]+)/reviews$#

                    ┌──────────────────────┐
                    │  Extract Parameters  │
                    └──────────┬───────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
    id=123              slug=abc             type=pending
  (numeric)         (alphanumeric)        (from ?type=pending)

        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  In Controller:      │
                    │  $id = getParam(     │
                    │    'id'              │
                    │  ); // returns "123" │
                    └──────────────────────┘
```

---

## Database Query Flow with Prepared Statements

```
Controller Code:
┌─────────────────────────────────────────┐
│ $event = $this->fetchOne(               │
│   "SELECT * FROM events WHERE id = ?",  │
│   [123]                                 │
│ );                                      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│  Database.query($sql, $params)                   │
│  1. Prepare statement: $stmt = pdo->prepare()   │
│  2. Execute with params: $stmt->execute([123])  │
└──────────┬───────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│  SQL Sent to MySQL:                              │
│  Prepared: SELECT * FROM events WHERE id = ?     │
│  (Parameter placeholder, not concatenated!)      │
│  Param: [123]                                    │
└──────────┬───────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│  MySQL Executes:                                 │
│  SELECT * FROM events WHERE id = 123             │
│  (Treats 123 as number, not code)                │
│  SAFE from SQL injection! ✓                      │
└──────────┬───────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│  MySQL Returns Results                           │
│  (raw data from database)                        │
└──────────┬───────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│  Database.fetch()                                │
│  PDO converts to associative array:              │
│  [                                               │
│    'id' => 1,                                    │
│    'title' => 'Soobin Live Concert',             │
│    'date' => '2024-07-20',                       │
│    ...                                           │
│  ]                                               │
└──────────┬───────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│  Controller receives array, uses it              │
│  Response.success($event);                       │
└──────────────────────────────────────────────────┘
```

---

## Response Formatting

```
Controller Returns Data:
┌──────────────────────────┐
│ [                        │
│   'id' => 1,            │
│   'name' => 'Event 1',  │
│   ...                   │
│ ]                       │
└──────────┬───────────────┘
           │
           ▼
Response::success($data, "Message");
│
├─→ Set HTTP status code: 200
├─→ Set content-type: application/json
├─→ Build response array:
│   ├─→ status: "success"
│   ├─→ message: "Message"
│   ├─→ data: $data
│   ├─→ meta:
│   │   ├─→ timestamp: ISO 8601
│   │   ├─→ endpoint: /events/1
│   │   ├─→ http_code: 200
│   │   └─→ server_time: 45ms
│   │
├─→ json_encode() with UTF-8 support
│
└─→ Output JSON:

┌────────────────────────────────────────────────┐
│ {                                              │
│   "status": "success",                         │
│   "message": "Message",                        │
│   "data": {                                    │
│     "id": 1,                                   │
│     "name": "Event 1"                          │
│   },                                           │
│   "meta": {                                    │
│     "timestamp": "2024-05-10T10:30:00Z",       │
│     "endpoint": "/events/1",                   │
│     "http_code": 200,                          │
│     "server_time": 45                          │
│   }                                            │
│ }                                              │
└────────────────────────────────────────────────┘
```

---

## Error Handling Flow

```
Try Block:
┌──────────────────────────┐
│ Router.dispatch()        │
│ Controller.action()      │
│ Database.query()         │
└──────────┬───────────────┘
           │
    ┌──────▼──────┐
    │  Exception? │
    └──────┬──────┘
           │ YES
           ▼
Catch Block:
┌─────────────────────────────────────┐
│ Response.handleException($e)        │
│                                     │
│ Is development mode?                │
│   YES → Show full stack trace       │
│   NO  → Show generic error message  │
└──────────┬────────────────────────────┘
           │
           ▼
Response::error(
  "Database error",
  [file, line, trace],  // Dev only
  500
);
           │
           ▼
┌────────────────────────────────────────────────┐
│ {                                              │
│   "status": "error",                           │
│   "message": "Database error",                 │
│   "data": {  // Only in development!          │
│     "file": "/api/config/Database.php",       │
│     "line": 45,                               │
│     "trace": [...]                            │
│   },                                           │
│   "meta": {                                    │
│     "timestamp": "...",                        │
│     "http_code": 500                          │
│   }                                            │
│ }                                              │
└────────────────────────────────────────────────┘
```

---

## Class Hierarchy

```
BaseController
├── AuthController
│   ├── register()
│   ├── login()
│   ├── logout()
│   └── profile()
│
├── EventController
│   ├── list()
│   ├── show()
│   ├── create()
│   ├── update()
│   └── delete()
│
├── ProductController
│   ├── list()
│   ├── show()
│   ├── create()
│   ├── update()
│   └── delete()
│
├── OrderController
│   ├── list()
│   ├── show()
│   ├── create()
│   ├── update()
│   └── cancel()
│
├── UserController
│   ├── list()
│   ├── show()
│   ├── create()
│   ├── update()
│   └── delete()
│
├── AnalyticsController
│   ├── dashboard()
│   ├── revenue()
│   └── orders()
│
└── HealthController
    └── check()

BaseController extends:
├── Database (singleton)
├── Request parsing
├── Validation helpers
├── Security helpers
├── Query helpers
└── Response helpers
```

---

## Middleware Stack

```
Request
   │
   ▼
┌─────────────────────────────┐
│ Load Configuration          │ (db.php)
│ Load Classes                │ (Database, Router, etc.)
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ CorsMiddleware.apply()              │
│ • Check origin                      │
│ • Set Access-Control-* headers      │
│ • Handle OPTIONS preflight          │
│ • Exit if OPTIONS request           │
└──────────┬────────────────────────────┘
           │
           ▼ (if not OPTIONS)
┌─────────────────────────────┐
│ Set Content-Type JSON       │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Initialize Router           │
│ Register routes from config │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Router.dispatch()           │
│ • Parse URL                 │
│ • Match route pattern       │
│ • Extract parameters        │
│ • Call controller action    │
└──────────┬──────────────────┘
           │
           ▼
           Response
```

---

## Singleton Pattern (Database Connection)

```
First Request:
Database::getInstance()
    │
    ├─→ $instance === null? YES
    │   │
    │   └─→ Create new PDO connection
    │       $instance = new Database()
    │       return $instance
    │
    └─→ Reuse connection


Second Request:
Database::getInstance()
    │
    ├─→ $instance === null? NO
    │
    └─→ Return existing $instance
        (no new connection!)


Script End:
register_shutdown_function():
    │
    └─→ Database::getInstance()->closeConnection()
        Close PDO connection cleanly
```

---

These diagrams show the complete flow through all Phase 3 components working together.
