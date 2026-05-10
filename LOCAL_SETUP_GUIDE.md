# 🛍️ ELon Merch - Full-Stack Application Setup Guide

> A complete event ticketing and e-commerce platform built with React, PHP, MySQL, and Docker.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Architecture](#project-architecture)
3. [Backend & Database Setup](#backend--database-setup)
4. [Frontend Setup](#frontend-setup)
5. [Application Access](#application-access)
6. [Test Credentials](#test-credentials)
7. [Troubleshooting](#troubleshooting)
8. [Project Structure](#project-structure)

---

## ✅ Prerequisites

Before you begin, ensure you have the following installed on your machine:

### Required Software

| Software | Version | Download |
|----------|---------|----------|
| **Docker Desktop** | Latest | [docker.com](https://www.docker.com/products/docker-desktop) |
| **Node.js** | 16+ or 18+ | [nodejs.org](https://nodejs.org/) |
| **npm** | 8+ (comes with Node.js) | Included with Node.js |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |

### System Requirements

- **RAM:** Minimum 4GB (8GB+ recommended)
- **Disk Space:** At least 5GB free
- **OS:** Windows 10+, macOS 10.14+, or Ubuntu 18.04+

### Verify Installation

```bash
# Check Docker
docker --version
docker-compose --version

# Check Node.js
node --version
npm --version
```

All commands should return version numbers without errors.

---

## 🏗️ Project Architecture

```
ELon Merch (Full-Stack Application)
│
├── 🎨 Frontend (React + Vite + Tailwind CSS)
│   ├── Store pages (Home, Cart, Events, Merchandise)
│   ├── Customer authentication
│   └── Admin Dashboard (Events, Products, Orders, Users management)
│
├── 🔌 Backend (PHP 8.2 + PDO + RESTful API)
│   ├── Authentication (JWT tokens)
│   ├── Event management APIs
│   ├── Product/Merchandise APIs
│   ├── Order management APIs
│   └── User management APIs
│
├── 🗄️ Database (MySQL 8.0)
│   ├── Users table
│   ├── Events table
│   ├── Products table
│   ├── Orders table
│   └── Order Items table
│
└── 🐳 Docker Infrastructure
    ├── Nginx (Reverse proxy)
    ├── PHP-FPM (Application server)
    ├── MySQL (Database)
    └── phpMyAdmin (Database management UI)
```

---

## 🚀 Backend & Database Setup

### Step 1: Open Terminal in Project Root

```bash
# Navigate to the project directory
cd /path/to/elonmerch
```

### Step 2: Clean Previous Docker Setup (If Needed)

⚠️ **Warning:** This will delete all existing containers and volumes. Only run if you have an old setup.

```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v
```

### Step 3: Start Docker Containers

```bash
# Build Docker images and start all services
docker-compose up -d --build
```

**Expected Output:**
```
Creating elonmerch_mysql ... done
Creating elonmerch_php ... done
Creating elonmerch_nginx ... done
Creating elonmerch_phpmyadmin ... done
```

### Step 4: ⏳ Wait for MySQL Initialization

⚠️ **IMPORTANT:** MySQL needs 15-20 seconds to fully initialize before the app can connect to it.

```bash
# Monitor the initialization
docker-compose logs -f mysql
```

**Wait for this message to appear:**
```
[System] ready for connections.
```

Once you see this message, MySQL is ready. Press `Ctrl+C` to exit the logs.

### Step 5: Verify All Services Are Running

```bash
# Check container status
docker-compose ps
```

**You should see all 4 containers with status "Up":**
```
NAME                  STATUS
elonmerch_nginx       Up (healthy)
elonmerch_php         Up
elonmerch_mysql       Up (healthy)
elonmerch_phpmyadmin  Up
```

### Step 6: Verify Backend is Responding

```bash
# Test the API is working
curl http://localhost:8080/

# Expected response:
# {"status":"success","message":"ELon Merch API Server is running!"...}
```

---

## 💻 Frontend Setup

### Step 1: Open New Terminal Window

Keep your first terminal running the Docker containers. Open a **new terminal** for the frontend.

```bash
# Navigate to project root
cd /path/to/elonmerch
```

### Step 2: Install Node Dependencies

```bash
# Install all npm packages
npm install
```

**Wait for installation to complete** (takes 1-2 minutes the first time).

### Step 3: Start Development Server

```bash
# Start Vite development server
npm run dev
```

**Expected Output:**
```
  VITE v8.0.4  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

✅ **Frontend is now running!** Leave this terminal open while developing.

---

## 🌐 Application Access

### Store Application

**URL:** [http://localhost:5173](http://localhost:5173)

**Available Pages:**
- 🏠 Home page
- 🎫 Events/Tickets page
- 🛍️ Merchandise page
- 🛒 Shopping cart
- 👤 User profile

### Admin Dashboard

**URL:** [http://localhost:5173/admin/dashboard](http://localhost:5173/admin/dashboard)

**Admin Features:**
- 📊 Dashboard overview with statistics
- 🎤 Events management (Create, Read, Update, Delete)
- 👕 Merchandise management (Create, Read, Update, Delete)
- 📦 Orders management (View, Update status)
- 👥 Users management (View, Ban users)

**Note:** Admin dashboard requires login with admin credentials (see below).

### Database Management

**URL:** [http://localhost:8080](http://localhost:8080)

**Purpose:** Visual database management interface (phpMyAdmin)

**Credentials:**
- Username: `elonmerch_user` or `root`
- Password: `rootpassword` (from docker-compose.yml)

### Backend API

**Base URL:** `http://localhost:8080`

**Example API Calls:**
```bash
# Get all events
curl http://localhost:8080/events

# Get all products
curl http://localhost:8080/products
```

---

## 🔐 Test Credentials

### Admin Account

Use this account to access the **Admin Dashboard**:

```
📧 Email:    admin@elonmerch.com
🔑 Password: password123
```

**Role:** Admin (full access to dashboard)

### Customer Accounts

You can also create new customer accounts by clicking "Sign Up" on the login modal.

**Available Test Customers** (pre-created):

| Email | Password | Role |
|-------|----------|------|
| nguyenvana@example.com | password123 | Customer |
| tranthib@example.com | password123 | Customer |
| leminhc@example.com | password123 | Customer |
| phamthid@example.com | password123 | Customer |
| hoangvane@example.com | password123 | Customer |

---

## 🧪 Quick Test Workflow

### 1. Login as Admin

```
1. Go to http://localhost:5173
2. Click "Login"
3. Enter: admin@elonmerch.com / password123
4. Click "Login"
```

### 2. Access Admin Dashboard

```
1. Navigate to http://localhost:5173/admin/dashboard
2. You should see:
   ✅ Admin sidebar on the left
   ✅ Statistics cards (Revenue, Tickets Sold, Orders, Users)
   ✅ Recent orders table
```

### 3. Manage Events

```
1. Click "Events" in sidebar
2. You should see 4 events:
   • Lệ Chi Viên 2024
   • Soobin Live Concert 2024
   • Workshop Làm nến thơm
   • Thuốc Đắng Dã Tật
3. Click "+ Add Event" to create a new event
4. Fill form and submit
5. Event appears in table immediately
```

### 4. Manage Merchandise

```
1. Click "Merchandise" in sidebar
2. You should see 8 products in a grid
3. Click "+ Add Product" to add a new product
4. Fill form (colors and sizes as JSON arrays)
5. Product appears in grid immediately
```

### 5. Test Store as Customer

```
1. Logout from admin
2. Click "Sign Up" to create customer account
3. Browse store pages:
   • Home page
   • Events/Tickets
   • Merchandise
4. Add items to cart
```

---

## ❓ Troubleshooting

### Issue: "Failed to fetch" errors on Admin Dashboard

**Cause:** Database not fully initialized yet.

**Solution:**
1. Wait an additional 10-15 seconds
2. Refresh the page (F5 or Cmd+R)
3. Check Docker logs: `docker-compose logs mysql`

**If still failing:**
```bash
# Restart the MySQL container
docker-compose restart mysql
# Wait 15 seconds, then refresh browser
```

---

### Issue: "Cannot GET /admin/dashboard" or blank page

**Cause:** Frontend not properly routing to admin pages.

**Solution:**
1. Clear browser cache and storage:
   - Open F12 (DevTools)
   - Application tab → Local Storage → Clear All
   - Close and reopen browser
2. Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
3. Verify you're logged in as admin account
4. Check browser console (F12 → Console) for errors

---

### Issue: "Address already in use" error

**Cause:** Port 8080 or 5173 already in use by another application.

**Solution:**

**For Port 8080 (Backend):**
```bash
# Windows: Find and kill process using port 8080
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Mac/Linux: Find and kill process
lsof -i :8080
kill -9 <PID>
```

**For Port 5173 (Frontend):**
```bash
# The dev server will automatically try 5174, 5175, etc.
# Or kill process on port 5173:

# Windows
netstat -ano | findstr :5173

# Mac/Linux
lsof -i :5173
```

---

### Issue: Docker containers not starting

**Symptoms:** `docker-compose up -d` shows errors.

**Solution:**
```bash
# Check Docker is running
docker --version

# If Docker Desktop is installed but not running:
# Windows: Start Docker Desktop from Start Menu
# Mac: Start Docker Desktop from Applications
# Linux: sudo systemctl start docker

# Try again
docker-compose up -d --build
```

---

### Issue: "Connection refused" when accessing localhost:8080 or localhost:5173

**Cause:** Services not running or not enough time for startup.

**Solution:**
1. Verify containers are running:
   ```bash
   docker-compose ps
   ```
2. Wait 30 seconds for services to fully initialize
3. Check logs for errors:
   ```bash
   docker-compose logs php
   docker-compose logs nginx
   ```

---

### Issue: Database connection error in browser console

**Cause:** Backend can't connect to MySQL.

**Solution:**
1. Verify MySQL is ready:
   ```bash
   docker-compose logs mysql
   ```
2. Look for: `[System] ready for connections.`
3. If not there, wait 10 more seconds
4. If error persists:
   ```bash
   docker-compose down -v
   docker-compose up -d --build
   # Wait 20 seconds
   ```

---

### Issue: npm install fails

**Cause:** Node.js or npm issues.

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules folder
rm -rf node_modules

# Delete package-lock.json
rm package-lock.json

# Try installing again
npm install
```

---

### Issue: Webpack/Vite build errors

**Cause:** Outdated dependencies or conflicting packages.

**Solution:**
```bash
# Make sure you're in the project root
cd /path/to/elonmerch

# Delete all node dependencies
rm -rf node_modules package-lock.json

# Reinstall fresh
npm install

# Start dev server
npm run dev
```

---

## 📁 Project Structure

```
elonmerch/
├── 📄 docker-compose.yml          # Docker orchestration
├── 📄 Dockerfile.php               # PHP container image
├── 📄 nginx.conf                   # Web server configuration
├── 📄 php.ini                      # PHP configuration
├── 📄 init.sql                     # Database schema & seed data
│
├── 🎨 src/                         # React Frontend (Vite)
│   ├── App.jsx                     # Main app with routing
│   ├── components/                 # Reusable components
│   │   ├── Header.jsx
│   │   ├── AuthModal.jsx
│   │   └── ...
│   ├── pages/                      # Store pages
│   │   ├── home.jsx
│   │   ├── MerchPage.jsx
│   │   └── ...
│   ├── admin/                      # Admin Dashboard
│   │   ├── components/             # Admin components
│   │   └── pages/                  # Admin pages
│   ├── context/                    # React Context
│   │   └── AuthContext.jsx
│   ├── utils/                      # Utilities
│   │   └── api.js                  # API helper
│   └── index.css
│
├── 🔌 api/                         # PHP Backend
│   ├── index.php                   # API entry point
│   ├── config/                     # Configuration
│   │   ├── db.php
│   │   ├── Database.php
│   │   └── routes.php
│   ├── controllers/                # API controllers
│   │   ├── AuthController.php
│   │   ├── EventController.php
│   │   └── ...
│   ├── middleware/                 # Middleware
│   │   └── CorsMiddleware.php
│   └── utils/                      # Utilities
│       ├── Response.php
│       └── Router.php
│
├── 📦 package.json                 # Frontend dependencies
├── 📄 .env.example                 # Environment template
└── 📄 README.md                    # This file
```

---

## 🔧 Common Commands Reference

### Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f php
docker-compose logs -f mysql

# Rebuild images
docker-compose build --no-cache

# Execute command in container
docker-compose exec php php -v
docker-compose exec mysql mysql -u root -p
```

### npm Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm build

# Clear cache
npm cache clean --force
```

### Database Access

```bash
# Access MySQL container directly
docker-compose exec mysql mysql -u elonmerch_user -prootpassword elonmerch_db

# Run SQL query
docker-compose exec mysql mysql -u root -prootpassword elonmerch_db -e "SELECT * FROM users;"
```

---

## 📊 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19, Vite, Tailwind CSS | UI/UX, store pages, admin dashboard |
| **Backend** | PHP 8.2, RESTful APIs, JWT | Business logic, authentication |
| **Database** | MySQL 8.0 | Data persistence |
| **Web Server** | Nginx | Reverse proxy, static file serving |
| **Containerization** | Docker, Docker Compose | Environment orchestration |
| **Icons** | Lucide React | UI icons |
| **State Management** | React Context API | Authentication state |

---

## 📞 Support & Resources

### Documentation Files

- `FIXES_APPLIED.md` - Port configuration and routing fixes
- `AUTH_SYSTEM_FIX_GUIDE.md` - Authentication system testing
- `PHASE_6_COMPLETE_TESTING_GUIDE.md` - Comprehensive feature testing guide
- `PHASE_6_FINAL_COMPLETION.md` - Project completion summary

### Backend API Documentation

The backend API uses RESTful conventions with JWT authentication:

```
GET    /events              - List all events
GET    /events/:id          - Get single event
POST   /events              - Create event (admin only)
PUT    /events/:id          - Update event (admin only)
DELETE /events/:id          - Delete event (admin only)

GET    /products            - List all products
GET    /products/:id        - Get single product
POST   /products            - Create product (admin only)
PUT    /products/:id        - Update product (admin only)
DELETE /products/:id        - Delete product (admin only)

POST   /auth/login          - User login
POST   /auth/register       - User registration
GET    /auth/profile        - Get authenticated user profile

GET    /orders              - List orders
PUT    /orders/:id          - Update order status

GET    /users               - List all users (admin only)
DELETE /users/:id           - Ban user (admin only)
```

All requests require JWT token in header: `Authorization: Bearer <token>`

---

## ✅ Final Checklist

Before demonstrating to professors:

- [ ] Docker Desktop is installed and running
- [ ] Node.js 16+ is installed
- [ ] `docker-compose up -d --build` completes successfully
- [ ] MySQL shows "ready for connections" in logs
- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts without errors
- [ ] Store loads at http://localhost:5173
- [ ] Admin login works with admin@elonmerch.com / password123
- [ ] Admin dashboard displays correctly
- [ ] Can create/edit/delete events and products
- [ ] phpMyAdmin loads at http://localhost:8080
- [ ] No console errors (F12 → Console tab)
- [ ] Responsive design works on mobile view

---

## 🎓 Evaluation Notes for Professors

This project demonstrates:

✅ **Full-Stack Development:** React frontend + PHP backend
✅ **Database Design:** Normalized schema with proper relationships
✅ **API Architecture:** RESTful endpoints with JWT authentication
✅ **DevOps:** Docker containerization and orchestration
✅ **Frontend Engineering:** Modern React patterns, Tailwind CSS
✅ **Backend Engineering:** Clean architecture, CORS, input validation
✅ **Security:** Password hashing (bcrypt), JWT tokens, SQL injection prevention
✅ **UI/UX:** Responsive design, consistent design system (#4054B2 primary)
✅ **CRUD Operations:** Full implementations across all modules
✅ **State Management:** React Context API for authentication
✅ **Error Handling:** User-friendly error messages and notifications

---

## 📝 License & Credits

**ELon Merch** - A comprehensive full-stack web application project built with modern technologies.

**Built with:** React, Vite, Tailwind CSS, PHP, MySQL, Docker

---

**Last Updated:** May 10, 2024
**Version:** 1.0.0

For questions or issues, refer to the troubleshooting section above or check the detailed phase documentation files.
