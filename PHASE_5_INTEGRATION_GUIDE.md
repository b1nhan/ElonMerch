# PHASE 5: ADMIN DASHBOARD - SETUP INSTRUCTIONS

## 📁 Files Created

### Components
- `src/admin/components/AdminLayout.jsx` - Main layout wrapper
- `src/admin/components/Sidebar.jsx` - Navigation sidebar
- `src/admin/components/AdminHeader.jsx` - Top header with user menu
- `src/admin/components/StatCard.jsx` - Statistics card component

### Pages
- `src/admin/pages/AdminDashboard.jsx` - Main dashboard page
- `src/admin/pages/AdminEvents.jsx` - Events management stub
- `src/admin/pages/AdminMerchandise.jsx` - Merchandise management stub
- `src/admin/pages/AdminOrders.jsx` - Orders management stub
- `src/admin/pages/AdminUsers.jsx` - Users management stub

---

## 🔧 Integration Steps

### Step 1: Update Your App.jsx

Add these imports at the top of your `src/App.jsx`:

```javascript
// Admin Pages
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminEvents from './admin/pages/AdminEvents';
import AdminMerchandise from './admin/pages/AdminMerchandise';
import AdminOrders from './admin/pages/AdminOrders';
import AdminUsers from './admin/pages/AdminUsers';
```

### Step 2: Add Admin Routes

Add the following routes inside your `<Routes>` component in App.jsx:

```javascript
{/* Admin Routes - Protected */}
<Route path="/admin/dashboard" element={<PageTransition><AdminDashboard /></PageTransition>} />
<Route path="/admin/events" element={<PageTransition><AdminEvents /></PageTransition>} />
<Route path="/admin/merchandise" element={<PageTransition><AdminMerchandise /></PageTransition>} />
<Route path="/admin/orders" element={<PageTransition><AdminOrders /></PageTransition>} />
<Route path="/admin/users" element={<PageTransition><AdminUsers /></PageTransition>} />
```

---

## 📝 Complete Updated App.jsx

Here's how your complete `App.jsx` should look:

```javascript
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Import Context
import { AuthProvider } from './context/AuthContext'; 
import { CartProvider } from './context/CartContext';

// Import Components
import Header from './components/Header';
import AuthModal from './components/AuthModal';

// Import Pages - Store
import Home from './pages/home';
import MerchPage from './pages/MerchPage';
import MerchDetailPage from './pages/MerchDetailPage';
import TicketPage from './pages/TicketPage';
import TicketBookingPage from './pages/TicketBookingPage';
import CreatorsPage from './pages/CreatorsPage';
import AboutPage from './pages/AboutPage';
import CartPage from './pages/CartPage';
import SettingsPage from './pages/SettingsPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import EventDetailPage from './pages/EventDetailPage';

// Import Pages - Admin
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminEvents from './admin/pages/AdminEvents';
import AdminMerchandise from './admin/pages/AdminMerchandise';
import AdminOrders from './admin/pages/AdminOrders';
import AdminUsers from './admin/pages/AdminUsers';

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Store Routes */}
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/cart" element={<PageTransition><CartPage /></PageTransition>} />
        <Route path="/event-detail/:id" element={<PageTransition><EventDetailPage /></PageTransition>} />
        <Route path="/book-ticket/:id" element={<PageTransition><TicketBookingPage /></PageTransition>} />
        <Route path="/merch-detail/:id" element={<PageTransition><MerchDetailPage /></PageTransition>} />
        <Route path="/merch" element={<PageTransition><MerchPage /></PageTransition>} />
        <Route path="/tickets" element={<PageTransition><TicketPage /></PageTransition>} />
        <Route path="/creators" element={<PageTransition><CreatorsPage /></PageTransition>} />
        <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
        <Route path="/settings" element={<PageTransition><SettingsPage /></PageTransition>} />
        <Route path="/order-details/:id" element={<PageTransition><OrderDetailsPage /></PageTransition>} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<PageTransition><AdminDashboard /></PageTransition>} />
        <Route path="/admin/events" element={<PageTransition><AdminEvents /></PageTransition>} />
        <Route path="/admin/merchandise" element={<PageTransition><AdminMerchandise /></PageTransition>} />
        <Route path="/admin/orders" element={<PageTransition><AdminOrders /></PageTransition>} />
        <Route path="/admin/users" element={<PageTransition><AdminUsers /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [authType, setAuthType] = useState(null);

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen flex flex-col overflow-x-hidden overflow-y-scroll">
            <Header onOpenAuth={setAuthType} />

            <main className="w-full max-w-[1440px] mx-auto px-10 md:px-16 pt-12 flex-1">
              <AnimatedRoutes />
            </main>

            {authType && (
              <AuthModal
                type={authType}
                onClose={() => setAuthType(null)}
                switchType={setAuthType}
              />
            )}
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
```

---

## 🎨 Design System Reference

### Colors Used
- **Primary Blue:** `#4054B2` - Active states, accents, buttons
- **Background:** `#F8FAFF` - Main admin background
- **Card Background:** `white` - Content containers
- **Text Primary:** `text-slate-900` - Headings and main text
- **Text Secondary:** `text-slate-500` - Descriptions and labels

### Border Radius
- **Large Cards:** `rounded-3xl` (24px)
- **Buttons & Small Elements:** `rounded-2xl` (16px)
- **Icons:** `rounded-lg` (8px)

### Shadows
- **Subtle:** `shadow-sm` - Minimal depth
- **Medium:** `shadow-md` - Standard cards
- **Strong:** `shadow-xl` - Modals, emphasized elements

---

## 🔐 Authentication Check

The `AdminLayout` component automatically:
1. Checks for authentication token in localStorage
2. Redirects to home page if not authenticated
3. Shows user info from localStorage

When a user logs in (from your API), make sure to save the token:

```javascript
// In your login function
const response = await fetch('http://localhost:80/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({email, password})
});

const data = await response.json();

if (data.status === 'success') {
  localStorage.setItem('token', data.data.token);
  localStorage.setItem('user', JSON.stringify(data.data.user));
  
  // Redirect to admin
  window.location.href = '/admin/dashboard';
}
```

---

## 🧭 Navigation Structure

### Sidebar Menu Items
1. **Dashboard** - Overview with stats
2. **Events** - Event management
3. **Merchandise** - Product management
4. **Orders** - Order tracking
5. **Users** - User management

### Footer Actions
- **Back to Store** - Returns to main store
- **Logout** - Clears token and redirects

---

## 📱 Responsive Features

### Desktop (lg and up)
- Fixed sidebar (272px)
- Sidebar always visible
- Full layout

### Tablet & Mobile
- Collapsible sidebar (hidden by default)
- Menu toggle button in header
- Hamburger icon on mobile

---

## 🚀 Testing the Admin Panel

1. **Start your backend:**
   ```bash
   docker-compose up -d
   ```

2. **Start your Vite frontend:**
   ```bash
   npm run dev
   ```

3. **Test login as admin:**
   - Go to http://localhost:5173
   - Open the login modal
   - Email: `admin@elonmerch.com`
   - Password: `password123`

4. **Access admin panel:**
   - After login, you'll see the admin sidebar
   - Navigate to http://localhost:5173/admin/dashboard
   - You should see the dashboard with stats and recent orders

---

## 📊 Dashboard Features

### Statistics Cards (4)
- **Total Revenue** - Sum of all orders
- **Tickets Sold** - Count of ticket purchases
- **Total Orders** - All orders count
- **Active Users** - Number of registered users

### Recent Orders Table
- Order ID with link capability
- Customer name
- Order amount (formatted as VND)
- Status badge (Completed, Pending, Shipped)
- Order date
- View action button

### Quick Actions
- Add New Event button
- Add New Product button
- View Analytics button

---

## 🔗 Component Hierarchy

```
App.jsx
├── Router
└── Routes
    ├── Store Routes (existing)
    └── Admin Routes
        └── AdminDashboard
            └── AdminLayout
                ├── Sidebar
                │   ├── Logo/Brand
                │   ├── Navigation Menu
                │   └── Bottom Actions
                ├── AdminHeader
                │   ├── Menu Toggle
                │   ├── Notifications
                │   └── User Dropdown
                └── Main Content
                    ├── Page Header
                    ├── Statistics Cards
                    ├── Recent Orders Table
                    └── Placeholder Sections
```

---

## 💡 Tips for Development

### Adding New Admin Pages
1. Create new file in `src/admin/pages/`
2. Import `AdminLayout` component
3. Wrap your content with `<AdminLayout>{ content }</AdminLayout>`
4. Import and add route in `App.jsx`
5. Add menu item in `Sidebar.jsx`

### Styling Consistency
- Use `rounded-3xl` for large cards
- Use `rounded-2xl` for buttons
- Use `shadow-sm` for subtle depth
- Use `#4054B2` for primary actions
- Use `#F8FAFF` as background

### API Integration
Replace mock data in `AdminDashboard.jsx` with API calls:

```javascript
useEffect(() => {
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:80/analytics/dashboard', {
        headers: {'Authorization': `Bearer ${token}`}
      });
      const data = await response.json();
      setStats(data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  
  fetchStats();
}, []);
```

---

## ✅ Verification Checklist

- [ ] Routes added to App.jsx
- [ ] Admin pages imported in App.jsx
- [ ] AdminLayout wraps all admin pages
- [ ] Sidebar shows navigation menu
- [ ] Header displays user info
- [ ] Dashboard displays stat cards
- [ ] Recent orders table appears
- [ ] Responsive design works on mobile
- [ ] Logout button works
- [ ] Back to Store button works
- [ ] Authentication check prevents unauthorized access

---

## 📝 Next Phase (Phase 6)

Phase 6 will implement:
- Events CRUD operations (Create, Read, Update, Delete)
- Merchandise CRUD operations
- Orders management
- Users management
- API integration for all operations

Each page will connect to the backend API created in Phase 4.
