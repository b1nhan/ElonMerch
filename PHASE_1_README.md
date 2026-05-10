# ELon Merch - Docker Setup

## Project Structure

```
elonmerch/
├── api/                      # PHP Backend (REST APIs)
│   ├── index.php
│   ├── config/
│   │   └── db.php
│   ├── models/
│   ├── controllers/
│   └── middleware/
├── frontend/                 # React Vite Frontend
│   └── dist/                 # Built frontend (served by Nginx)
├── admin/                    # Admin Dashboard (React)
├── docker-compose.yml
├── Dockerfile.php
├── nginx.conf
├── php.ini
├── init.sql                  # Database initialization
├── .env.example
└── start-docker.sh
```

## Services

### 1. **Nginx** (Port 80, 443)
   - Reverse proxy for PHP backend
   - Serves static React frontend
   - Handles API routing

### 2. **PHP-FPM** (Port 9000)
   - PHP 8.2 with PDO, MySQL, GD, Zip extensions
   - Connected to Nginx via Unix socket
   - Environment variables injected via docker-compose

### 3. **MySQL 8.0** (Port 3306)
   - Database server
   - Auto-initializes with `init.sql`
   - Volume: `mysql_data` (persists data)
   - Healthcheck included

### 4. **phpMyAdmin** (Port 8080)
   - Web-based database management
   - Auto-configured with MySQL credentials

## Quick Start

### Prerequisites
- Docker & Docker Compose installed
- Git (to clone/manage project)

### Step 1: Create `.env` file
```bash
cp .env.example .env
# Edit .env if needed (default credentials are for local dev only)
```

### Step 2: Start containers
```bash
chmod +x start-docker.sh
./start-docker.sh
```

Or manually:
```bash
docker-compose build
docker-compose up -d
```

### Step 3: Verify services
```bash
docker-compose ps
```

### Step 4: Access services
- **Backend API**: http://api.localhost (or http://localhost:80)
- **Frontend**: http://localhost
- **phpMyAdmin**: http://localhost:8080
  - Username: `elonmerch_user` (or `root`)
  - Password: from `.env` file

## Common Commands

```bash
# View logs
docker-compose logs -f php
docker-compose logs -f mysql
docker-compose logs -f nginx

# Stop containers
docker-compose down

# Stop and remove volumes (WARNING: deletes database)
docker-compose down -v

# Rebuild images
docker-compose build --no-cache

# Execute commands in running container
docker-compose exec php php -v
docker-compose exec mysql mysql -u root -p elonmerch_db

# View container details
docker-compose ps
docker-compose top php
```

## Environment Variables

Key variables in `.env`:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - MySQL configuration
- `PHP_ENV` - Set to `development` for debugging, `production` for live
- `CORS_ORIGIN` - Comma-separated list of allowed origins for API requests
- `JWT_SECRET` - For JWT token-based authentication (if implemented)

## Network

All services connected via `elonmerch_network` bridge network. Services can reference each other by container name:
- `php` → MySQL as `mysql`
- `nginx` → PHP-FPM as `php`

## Volumes

- `mysql_data` - Persists MySQL database between container restarts
- Bind mounts for code directories allow live editing

## Troubleshooting

### MySQL won't start
```bash
# Check healthcheck
docker-compose logs mysql
# May need to wait longer for first start
docker-compose restart mysql
```

### PHP-FPM connection refused
```bash
# Ensure PHP container is running and MySQL is healthy
docker-compose ps
docker-compose logs php
```

### Port already in use
```bash
# Find process using port (e.g., 3306)
lsof -i :3306
# Or change ports in docker-compose.yml
```

### Database not initialized
```bash
# Check if init.sql exists and is valid
# Restart MySQL with volume
docker-compose down -v
docker-compose up -d
```

## Next Steps (After Phase 1 Approval)

1. **Phase 2**: Create `init.sql` with complete database schema
2. **Phase 3**: Build PHP backend structure and database connection class
3. **Phase 4**: Implement REST API endpoints
4. **Phase 5**: Set up Admin Dashboard scaffolding
5. **Phase 6**: Implement Admin CRUD operations

---

✅ Phase 1 complete. Ready to proceed to Phase 2: Database Schema & Seeding.
