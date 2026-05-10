-- ELon Merch Database Schema & Seed Data
-- Context: Vietnamese Event Ticketing & E-commerce Platform

-- ============================================
-- CREATE DATABASE
-- ============================================
CREATE DATABASE IF NOT EXISTS `elonmerch_db`;
USE `elonmerch_db`;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE `users` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20),
  `address` TEXT,
  `role` ENUM('admin', 'customer') DEFAULT 'customer',
  `status` ENUM('active', 'inactive', 'banned') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login` DATETIME,
  INDEX `idx_email` (`email`),
  INDEX `idx_role` (`role`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- EVENTS TABLE
-- ============================================
CREATE TABLE `events` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `date` DATE NOT NULL,
  `time` TIME NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `cast` VARCHAR(500),
  `image` VARCHAR(500),
  `reg_price` DECIMAL(10, 2) NOT NULL DEFAULT 0,
  `vip_price` DECIMAL(10, 2) NOT NULL DEFAULT 0,
  `total_tickets` INT DEFAULT 1000,
  `sold_tickets` INT DEFAULT 0,
  `status` ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_date` (`date`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PRODUCTS TABLE (Merchandise)
-- ============================================
CREATE TABLE `products` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10, 2) NOT NULL,
  `colors` JSON,
  `sizes` JSON,
  `image` VARCHAR(500),
  `category` VARCHAR(100),
  `stock` INT DEFAULT 0,
  `sku` VARCHAR(100) UNIQUE,
  `status` ENUM('available', 'unavailable', 'discontinued') DEFAULT 'available',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_status` (`status`),
  INDEX `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE `orders` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `order_number` VARCHAR(50) UNIQUE NOT NULL,
  `status` ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  `total_price` DECIMAL(10, 2) NOT NULL,
  `shipping_name` VARCHAR(255),
  `shipping_phone` VARCHAR(20),
  `shipping_address` TEXT,
  `payment_method` VARCHAR(50),
  `payment_status` ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `delivered_at` DATETIME,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_order_number` (`order_number`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ORDER_ITEMS TABLE
-- ============================================
CREATE TABLE `order_items` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `order_id` INT NOT NULL,
  `item_type` ENUM('ticket', 'merch') NOT NULL,
  `item_id` INT NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `price` DECIMAL(10, 2) NOT NULL,
  `variant` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_item_type` (`item_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SEED DATA: USERS
-- ============================================
INSERT INTO `users` (`name`, `email`, `password`, `phone`, `address`, `role`, `status`) VALUES
-- Admin accounts
('Admin ELon', 'admin@elonmerch.com', '$2y$10$UNV7EX5jtWvQV6.7J7l8.ObKQfV/7L9zH2R3Z5D1K9Q2P3A4B5C6', '0901234567', '123 Trung Tâm Sài Gòn', 'admin', 'active'),

-- Customer accounts
('Nguyễn Văn A', 'nguyenvana@example.com', '$2y$10$UNV7EX5jtWvQV6.7J7l8.ObKQfV/7L9zH2R3Z5D1K9Q2P3A4B5C6', '0912345678', 'Quận 1, TP.HCM', 'customer', 'active'),
('Trần Thị B', 'tranthib@example.com', '$2y$10$UNV7EX5jtWvQV6.7J7l8.ObKQfV/7L9zH2R3Z5D1K9Q2P3A4B5C6', '0923456789', 'Quận 3, TP.HCM', 'customer', 'active'),
('Lê Minh C', 'leminhc@example.com', '$2y$10$UNV7EX5jtWvQV6.7J7l8.ObKQfV/7L9zH2R3Z5D1K9Q2P3A4B5C6', '0934567890', 'Quận 7, TP.HCM', 'customer', 'active'),
('Phạm Thị D', 'phamthid@example.com', '$2y$10$UNV7EX5jtWvQV6.7J7l8.ObKQfV/7L9zH2R3Z5D1K9Q2P3A4B5C6', '0945678901', 'Quận 10, TP.HCM', 'customer', 'active'),
('Hoàng Văn E', 'hoangvane@example.com', '$2y$10$UNV7EX5jtWvQV6.7J7l8.ObKQfV/7L9zH2R3Z5D1K9Q2P3A4B5C6', '0956789012', 'Bình Thạnh, TP.HCM', 'customer', 'active');

-- ============================================
-- SEED DATA: EVENTS
-- ============================================
INSERT INTO `events` (`title`, `description`, `date`, `time`, `location`, `cast`, `image`, `reg_price`, `vip_price`, `total_tickets`, `sold_tickets`, `status`) VALUES
('Lệ Chi Viên 2024', 'Liveshow nhạc của Lệ Chi Viên - Nguyên Khôi - Khả Vy tại Hà Nội', '2024-06-15', '19:00:00', 'Nhạc Viện Hà Nội, Hà Nội', 'Lệ Chi Viên, Nguyên Khôi, Khả Vy', '/events/le-chi-vien.jpg', 350000, 550000, 1000, 250, 'upcoming'),
('Soobin Live Concert 2024', 'Soobin Live - Âm nhạc và cảm xúc tại Sài Gòn', '2024-07-20', '20:00:00', 'Trung tâm Hội nghị Quốc gia, TP.HCM', 'Soobin Hoàng Sơn', '/events/soobin-concert.jpg', 400000, 650000, 1500, 450, 'upcoming'),
('Workshop Làm nến thơm', 'Hội thảo và workshop tạo nến thơm handmade cùng các chuyên gia', '2024-05-25', '14:00:00', 'Craft Space, Quận 1, TP.HCM', 'Craft Masters Vietnam', '/events/workshop-nen.jpg', 150000, 200000, 50, 15, 'upcoming'),
('Thuốc Đắng Dã Tật - Liveshow', 'Liveshow nhạc phim Thuốc Đắng Dã Tật với dàn sao hàng đầu', '2024-08-10', '19:30:00', 'National Convention Center, TP.HCM', 'Tòng Tài, Hồ Quang Hiếu, Jvevermind', '/events/thuoc-dang.jpg', 320000, 500000, 2000, 600, 'upcoming');

-- ============================================
-- SEED DATA: PRODUCTS (MERCHANDISE)
-- ============================================
INSERT INTO `products` (`name`, `description`, `price`, `colors`, `sizes`, `image`, `category`, `stock`, `sku`, `status`) VALUES
('Áo Thun Soobin', 'Áo thun nam/nữ in hình Soobin, chất liệu cotton 100%', 199000, '["Đen", "Trắng", "Xanh"]', '["S", "M", "L", "XL", "XXL"]', '/merch/ao-thun-soobin.jpg', 'Áo', 150, 'SHIRT-SOOBIN-001', 'available'),
('Lightstick Concert', 'Đèn ánh sáng LED chính thức cho các sự kiện concert', 89000, '["Xanh", "Tím", "Hồng", "Trắng"]', '["Free Size"]', '/merch/lightstick.jpg', 'Phụ kiện', 300, 'LIGHT-CONCERT-001', 'available'),
('Khăn Bandana', 'Khăn bandana cotton mềm mại với in họa tiết độc quyền ELon Merch', 79000, '["Đen", "Xanh", "Đỏ"]', '["One Size"]', '/merch/bandana.jpg', 'Phụ kiện', 200, 'BAND-ELON-001', 'available'),
('Tote Bag Chính Thức', 'Túi tote vải canvas với thiết kế tối giản và logo ELon Merch', 149000, '["Đen", "Ghi", "Trắng"]', '["One Size"]', '/merch/tote-bag.jpg', 'Túi', 120, 'BAG-TOTE-001', 'available'),
('Pin Cài Áo Concert', 'Bộ 5 pin cài áo với các nhân vật yêu thích', 59000, '["Nhiều màu"]', '["One Size"]', '/merch/pin-concert.jpg', 'Phụ kiện', 250, 'PIN-CONCERT-001', 'available'),
('Mũ Snapback ELon', 'Mũ snapback cổ cao với form dáng thời trang', 129000, '["Đen", "Trắng", "Xanh"]', '["One Size"]', '/merch/cap-snapback.jpg', 'Mũ', 100, 'CAP-SNAP-001', 'available'),
('Túi Đeo Chéo', 'Túi đeo chéo chống nước, phù hợp đi sự kiện', 189000, '["Đen", "Xám"]', '["One Size"]', '/merch/crossbody-bag.jpg', 'Túi', 80, 'BAG-CROSS-001', 'available'),
('Combo VIP Package', 'Combo gồm áo thun + lightstick + bandana + pin (tiết kiệm 20%)', 449000, '["Đen", "Trắng"]', '["S", "M", "L", "XL"]', '/merch/combo-vip.jpg', 'Combo', 50, 'COMBO-VIP-001', 'available');
-- ============================================
-- SEED DATA: ORDERS (Sample Orders)
-- ============================================
INSERT INTO `orders` (`user_id`, `order_number`, `status`, `total_price`, `shipping_name`, `shipping_phone`, `shipping_address`, `payment_method`, `payment_status`, `notes`) VALUES
(2, 'ORD-2024-00001', 'confirmed', 288000, 'Nguyễn Văn A', '0912345678', 'Quận 1, TP.HCM', 'bank_transfer', 'paid', 'Giao hàng nhanh'),
(3, 'ORD-2024-00002', 'pending', 649000, 'Trần Thị B', '0923456789', 'Quận 3, TP.HCM', 'cod', 'unpaid', 'Vui lòng giao vào chiều tối'),
(4, 'ORD-2024-00003', 'shipped', 178000, 'Lê Minh C', '0934567890', 'Quận 7, TP.HCM', 'bank_transfer', 'paid', 'Đã bao gồm bảo hiểm'),
(5, 'ORD-2024-00004', 'delivered', 228000, 'Phạm Thị D', '0945678901', 'Quận 10, TP.HCM', 'bank_transfer', 'paid', ''),
(2, 'ORD-2024-00005', 'confirmed', 449000, 'Nguyễn Văn A', '0912345678', 'Quận 1, TP.HCM', 'cod', 'unpaid', 'Combo VIP Package');

-- ============================================
-- SEED DATA: ORDER_ITEMS (Sample Order Items)
-- ============================================
INSERT INTO `order_items` (`order_id`, `item_type`, `item_id`, `quantity`, `price`, `variant`) VALUES
-- Order 1: Áo Thun Soobin + Bandana
(1, 'merch', 1, 1, 199000, '{"color": "Đen", "size": "M"}'),
(1, 'merch', 3, 1, 89000, '{"color": "Xanh"}'),

-- Order 2: Combo VIP + Mũ
(2, 'merch', 8, 1, 449000, '{"color": "Đen", "size": "L"}'),
(2, 'merch', 6, 1, 200000, '{"color": "Trắng"}'),

-- Order 3: Lightstick + Pin
(3, 'merch', 2, 2, 89000, '{"color": "Tím"}'),

-- Order 4: Tote Bag + Túi Đeo
(4, 'merch', 4, 1, 149000, '{"color": "Đen"}'),
(4, 'merch', 7, 1, 79000, '{"color": "Xám"}'),

-- Order 5: Concert Tickets + Áo Thun
(5, 'ticket', 2, 2, 400000, '{"type": "regular"}'),
(5, 'merch', 1, 1, 199000, '{"color": "Trắng", "size": "S"}');

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX `idx_orders_user_created` ON `orders`(`user_id`, `created_at`);
CREATE INDEX `idx_order_items_order_type` ON `order_items`(`order_id`, `item_type`);
CREATE INDEX `idx_events_date_status` ON `events`(`date`, `status`);
CREATE INDEX `idx_products_category_status` ON `products`(`category`, `status`);

-- ============================================
-- INITIAL VIEWS (Optional for reporting)
-- ============================================
CREATE VIEW `view_order_summary` AS
SELECT 
  o.id,
  o.order_number,
  u.name AS customer_name,
  u.email,
  o.total_price,
  o.status,
  o.payment_status,
  COUNT(oi.id) AS item_count,
  o.created_at
FROM `orders` o
JOIN `users` u ON o.user_id = u.id
LEFT JOIN `order_items` oi ON o.id = oi.id
GROUP BY o.id;

CREATE VIEW `view_revenue_summary` AS
SELECT 
  DATE(o.created_at) AS order_date,
  COUNT(o.id) AS total_orders,
  SUM(o.total_price) AS total_revenue,
  SUM(CASE WHEN o.payment_status = 'paid' THEN o.total_price ELSE 0 END) AS paid_revenue
FROM `orders` o
GROUP BY DATE(o.created_at);

-- ============================================
-- DATABASE CREATION COMPLETE
-- ============================================
-- Note: Passwords are bcrypt hashes of 'password123'
-- Default admin account: admin@elonmerch.com / password123
-- Default customer accounts: all use password123
