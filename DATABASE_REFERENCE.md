# Database Schema Reference - ELon Merch

## Quick Overview

### Core Tables
```
users (6 records)
├── id: 1-6
├── name, email, phone, address
├── role: admin / customer
└── password: bcrypt hashed

events (4 records) - Vietnamese concert/events
├── Lệ Chi Viên 2024 (HN Concert)
├── Soobin Live Concert 2024 (SGN Concert)
├── Workshop Làm nến thơm (Craft Workshop)
└── Thuốc Đắng Dã Tật - Liveshow (Movie Soundtrack)

products (8 records) - Vietnamese merchandise
├── Áo Thun Soobin
├── Lightstick Concert
├── Khăn Bandana
├── Tote Bag
├── Pin Cài Áo Concert
├── Mũ Snapback ELon
├── Túi Đeo Chéo
└── Combo VIP Package

orders (5 records)
├── ORD-2024-00001: 288,000₫ (Confirmed)
├── ORD-2024-00002: 649,000₫ (Pending)
├── ORD-2024-00003: 178,000₫ (Shipped)
├── ORD-2024-00004: 228,000₫ (Delivered)
└── ORD-2024-00005: 449,000₫ (Confirmed)

order_items (11 records)
└── Line items for each order with variants
```

## VIP Test Data

### Admin Account
- Email: `admin@elonmerch.com`
- Password: `password123`
- Role: `admin`

### Test Customers
```
1. Nguyễn Văn A (nguyenvana@example.com)
2. Trần Thị B (tranthib@example.com)
3. Lê Minh C (leminhc@example.com)
4. Phạm Thị D (phamthid@example.com)
5. Hoàng Văn E (hoangvane@example.com)
```
All passwords: `password123`

## Price Points (Vietnamese Market)

### Events
- Workshop: 150k-200k₫
- Regular Concerts: 320k-400k₫
- VIP Concerts: 500k-650k₫

### Merchandise
- Pins/Bandana: 59k-79k₫
- Cap/Bag: 129k-189k₫
- T-Shirt: 199k₫
- Combo Package: 449k₫ (20% discount)

## Inventory Status

| Product | Stock | Status |
|---------|-------|--------|
| Áo Thun Soobin | 150 | In Stock |
| Lightstick Concert | 300 | High Stock |
| Khăn Bandana | 200 | In Stock |
| Tote Bag | 120 | In Stock |
| Pin Cài | 250 | In Stock |
| Mũ Snapback | 100 | In Stock |
| Túi Đeo Chéo | 80 | Low Stock |
| Combo VIP | 50 | Limited |

## Events Inventory

| Event | Total | Sold | Available |
|-------|-------|------|-----------|
| Lệ Chi Viên | 1000 | 250 | 750 |
| Soobin Concert | 1500 | 450 | 1050 |
| Workshop Nến | 50 | 15 | 35 |
| Thuốc Đắng | 2000 | 600 | 1400 |

## Database Statistics

- Total Users: 6 (1 admin, 5 customers)
- Total Events: 4
- Total Products: 8
- Total Orders: 5
- Total Order Items: 11
- Database Size: ~500KB (with sample data)

---

Generated: May 10, 2024
Database Version: MySQL 8.0
Charset: utf8mb4 (Vietnamese support)
