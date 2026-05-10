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

// Page Transition Wrapper
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

// Store Layout Routes (with Header & Footer)
const StoreRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
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
      </Routes>
    </AnimatePresence>
  );
};

// Admin Routes (without Header & Footer - AdminLayout handles it)
const AdminRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/dashboard" element={<PageTransition><AdminDashboard /></PageTransition>} />
        <Route path="/events" element={<PageTransition><AdminEvents /></PageTransition>} />
        <Route path="/merchandise" element={<PageTransition><AdminMerchandise /></PageTransition>} />
        <Route path="/orders" element={<PageTransition><AdminOrders /></PageTransition>} />
        <Route path="/users" element={<PageTransition><AdminUsers /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

// Main App Component
function App() {
  const [authType, setAuthType] = useState(null);

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Admin Routes - Nested under /admin/* */}
            <Route path="/admin/*" element={<AdminRoutes />} />

            {/* Store Routes - Regular layout with Header */}
            <Route
              path="/*"
              element={
                <div className="min-h-screen flex flex-col overflow-x-hidden overflow-y-scroll">
                  <Header onOpenAuth={setAuthType} />

                  <main className="w-full max-w-[1440px] mx-auto px-10 md:px-16 pt-12 flex-1">
                    <StoreRoutes />
                  </main>

                  {authType && (
                    <AuthModal
                      type={authType}
                      onClose={() => setAuthType(null)}
                      switchType={setAuthType}
                    />
                  )}
                </div>
              }
            />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
