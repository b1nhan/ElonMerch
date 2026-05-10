## PHASE 2 SUMMARY: Database Schema & Seeding

✅ **Completed:**

### 1. **Database Tables Created**

#### `users` (User Management)
- `id` - Primary key
- `name`, `email` (unique), `password` (bcrypt hash)
- `phone`, `address` - Shipping information
- `role` - admin or customer
- `status` - active, inactive, banned
- `created_at`, `updated_at`, `last_login` - Timestamps
- Indexes: email, role, status for fast queries

#### `events` (Concert/Event Ticketing)
- `id`, `title`, `description`, `date`, `time`, `location`
- `cast` - Artist/performer names
- `image` - Event poster URL
- `reg_price`, `vip_price` - Ticket pricing tiers
- `total_tickets`, `sold_tickets` - Inventory tracking
- `status` - upcoming, ongoing, completed, cancelled
- Indexes: date, status for filtering by date and status

#### `products` (Merchandise)
- `id`, `name`, `description`, `price`
- `colors`, `sizes` - JSON arrays for variants
- `image` - Product image URL
- `category` - Merchandise category (Áo, Phụ kiện, etc.)
- `stock` - Available quantity
- `sku` - Unique product identifier
- `status` - available, unavailable, discontinued
- Indexes: status, category

#### `orders` (Order Management)
- `id`, `order_number` (unique) - Order identification
- `user_id` - Foreign key to users
- `status` - pending, confirmed, shipped, delivered, cancelled
- `total_price` - Order total
- `shipping_*` - Delivery information
- `payment_method`, `payment_status` - Payment tracking
- `notes` - Special instructions
- `created_at`, `updated_at`, `delivered_at` - Timestamps
- Indexes: user_id, status, order_number, created_at

#### `order_items` (Line Items)
- `id`, `order_id` - Foreign key to orders (CASCADE delete)
- `item_type` - 'ticket' or 'merch'
- `item_id` - References event.id or product.id
- `quantity`, `price` - Item details
- `variant` - JSON object (color, size, type, etc.)
- Indexes: order_id, item_type

### 2. **Foreign Key Relationships**

- `orders.user_id` → `users.id` (RESTRICT delete, CASCADE update)
- `order_items.order_id` → `orders.id` (CASCADE delete/update)

This ensures:
- Users cannot be deleted if they have orders (data integrity)
- When an order is deleted, all order items are automatically deleted

### 3. **Seed Data - ELon Merch Context**

#### Users (6 accounts)
1. **Admin Account**: admin@elonmerch.com (for admin dashboard)
2. **Customer Accounts** (5): Nguyễn Văn A, Trần Thị B, Lê Minh C, Phạm Thị D, Hoàng Văn E
   - All test accounts use password: `password123` (bcrypt hashed)
   - Includes realistic Vietnamese names and addresses

#### Events (4 Vietnamese Events)
1. **Lệ Chi Viên 2024** - Liveshow with Nguyên Khôi, Khả Vy
   - Date: 2024-06-15, Nhạc Viện Hà Nội
   - Regular: 350,000₫ | VIP: 550,000₫
   - 1000 tickets, 250 sold

2. **Soobin Live Concert 2024** - Soobin Hoàng Sơn
   - Date: 2024-07-20, TTVN Convention Center, TP.HCM
   - Regular: 400,000₫ | VIP: 650,000₫
   - 1500 tickets, 450 sold

3. **Workshop Làm nến thơm** - Craft workshop
   - Date: 2024-05-25, Craft Space, Quận 1
   - Regular: 150,000₫ | VIP: 200,000₫
   - 50 tickets, 15 sold

4. **Thuốc Đắng Dã Tật - Liveshow** - Movie soundtrack live
   - Date: 2024-08-10, National Convention Center
   - Regular: 320,000₫ | VIP: 500,000₫
   - 2000 tickets, 600 sold

#### Products (8 Merchandise Items)
1. **Áo Thun Soobin** - T-shirt (199,000₫)
   - Colors: Đen, Trắng, Xanh | Sizes: S-XXL | Stock: 150

2. **Lightstick Concert** - LED light stick (89,000₫)
   - Colors: Xanh, Tím, Hồng, Trắng | Stock: 300

3. **Khăn Bandana** - Bandana (79,000₫)
   - Colors: Đen, Xanh, Đỏ | Stock: 200

4. **Tote Bag Chính Thức** - Canvas tote (149,000₫)
   - Colors: Đen, Ghi, Trắng | Stock: 120

5. **Pin Cài Áo Concert** - Enamel pins 5-pack (59,000₫)
   - Stock: 250

6. **Mũ Snapback ELon** - Snapback cap (129,000₫)
   - Colors: Đen, Trắng, Xanh | Stock: 100

7. **Túi Đeo Chéo** - Crossbody bag (189,000₫)
   - Colors: Đen, Xám | Stock: 80

8. **Combo VIP Package** - Bundle (449,000₫ - saves 20%)
   - Includes: Áo Thun + Lightstick + Bandana + Pin
   - Stock: 50

#### Orders & Order Items (5 Sample Orders)
- **ORD-2024-00001**: Nguyễn Văn A - 288,000₫ (Áo Thun + Lightstick) - Confirmed
- **ORD-2024-00002**: Trần Thị B - 649,000₫ (Combo + Mũ) - Pending
- **ORD-2024-00003**: Lê Minh C - 178,000₫ (Lightstick x2) - Shipped
- **ORD-2024-00004**: Phạm Thị D - 228,000₫ (Tote Bag + Túi Đeo) - Delivered
- **ORD-2024-00005**: Nguyễn Văn A - 449,000₫ (Concert Tickets + Áo Thun) - Confirmed

### 4. **Performance Features**

#### Indexes Created
- `users`: email, role, status
- `events`: date, status
- `products`: status, category
- `orders`: user_id, status, order_number, created_at
- `order_items`: order_id, item_type
- Composite indexes for common query patterns

#### Views Created
- `view_order_summary` - Order details with customer info and item count
- `view_revenue_summary` - Daily revenue reporting

### 5. **Character Set & Collation**

- **Charset**: utf8mb4 (supports Vietnamese characters and emojis)
- **Collation**: utf8mb4_unicode_ci (case-insensitive Vietnamese)

This ensures proper display and sorting of Vietnamese text.

### 6. **Data Integrity Features**

- Foreign key constraints prevent orphaned records
- Unique constraints on email and SKU
- Check constraints on status enums
- Cascade delete on order_items (clean up when order deleted)
- Restrict delete on users with orders (data integrity)

---

## HOW TO INITIALIZE DATABASE

The `init.sql` file is automatically executed when MySQL container starts:

```bash
# Start containers (will run init.sql automatically)
docker-compose up -d

# Wait ~10 seconds for MySQL to initialize

# Verify tables were created
docker-compose exec mysql mysql -u elonmerch_user -prootpassword elonmerch_db -e "SHOW TABLES;"

# View seed data
docker-compose exec mysql mysql -u elonmerch_user -prootpassword elonmerch_db -e "SELECT * FROM users; SELECT * FROM events; SELECT * FROM products;"
```

## ACCESS DATA via phpMyAdmin

1. Open http://localhost:8080
2. Login:
   - Username: `elonmerch_user` or `root`
   - Password: `rootpassword` (from .env)
3. Select `elonmerch_db` database
4. Browse all tables and views

---

## TEST ACCOUNTS FOR PHASE 3+

| Email | Password | Role |
|-------|----------|------|
| admin@elonmerch.com | password123 | Admin |
| nguyenvana@example.com | password123 | Customer |
| tranthib@example.com | password123 | Customer |
| leminhc@example.com | password123 | Customer |
| phamthid@example.com | password123 | Customer |
| hoangvane@example.com | password123 | Customer |

---

## SCHEMA DIAGRAM

```
users (1) ──────→ (N) orders
                    │
                    ├─→ order_items (N)
                    │
                    └─→ (item_id)
                        ├─→ events (ticket type)
                        └─→ products (merch type)
```

---

## ✅ PHASE 2 STATUS: COMPLETE

- [x] All 5 tables created with proper structure
- [x] Foreign key relationships established
- [x] Performance indexes added
- [x] Seed data in ELon Merch Vietnamese context
- [x] Sample orders with order items
- [x] Views for reporting
- [x] UTF-8 support for Vietnamese text

---

**Next Phase: PHASE 3 - Backend Architecture**

Ready to create:
- Database connection class (PDO wrapper)
- Helper/utility classes
- Middleware for CORS
- Base controller for consistent responses

Awaiting your approval to proceed to Phase 3.
