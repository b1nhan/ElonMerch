# AUTH SYSTEM FIX - COMPLETE TESTING GUIDE

## ✅ 3 FILES UPDATED

### 1. **src/context/AuthContext.jsx** (NEW - Complete rewrite)
- Uses real backend API (`/auth/login` and `/auth/register`)
- Stores JWT token in localStorage
- Stores user data (including role) in localStorage
- Provides `isAdmin` computed property
- Methods: `login()`, `register()`, `logout()`, `getProfile()`

### 2. **src/components/AuthModal.jsx** (UPDATED)
- Connected to real AuthContext functions
- Form validation
- Handles login and registration
- Calls `login()` or `register()` from context
- Shows test credentials (admin account)

### 3. **src/admin/components/AdminLayout.jsx** (UPDATED)
- Uses `useAuth()` hook
- Checks `isAuthenticated` - redirects to auth if false
- Checks `isAdmin` - shows access denied if false
- Shows loading state while checking auth
- Shows meaningful error messages

---

## 🧪 COMPLETE TESTING FLOW

### Prerequisites
```bash
# Terminal 1: Backend running
docker-compose up -d

# Terminal 2: Frontend running
npm run dev
```

### Test 1: Customer Registration

**Steps:**
1. Go to http://localhost:5173
2. Click "Sign Up" button
3. Fill out form:
   - Name: "Test Customer"
   - Email: "testcustomer@example.com"
   - Password: "password123"
   - Confirm Password: "password123"
   - Phone: "0987654321" (optional)
   - Address: "123 Test Street" (optional)
4. Click "Sign Up" button

**Expected Results:**
- ✅ Loading spinner appears
- ✅ Success message appears (after ~1 second)
- ✅ Modal closes automatically
- ✅ User is logged in (stored in localStorage)
- ✅ Try to access /admin/dashboard → shows "Access Denied" (role is 'customer')

**Verification:**
```javascript
// In browser console:
localStorage.getItem('token')       // Should return JWT token
JSON.parse(localStorage.getItem('user'))  // Should show { id, name, email, role: 'customer', ... }
```

---

### Test 2: Customer Login

**Steps:**
1. Go to http://localhost:5173
2. Click "Login" button
3. Fill out form:
   - Email: "testcustomer@example.com"
   - Password: "password123"
4. Click "Login" button

**Expected Results:**
- ✅ Loading spinner appears
- ✅ Success message appears
- ✅ Modal closes
- ✅ User logged in
- ✅ Cannot access admin dashboard

---

### Test 3: Admin Login (THE KEY TEST)

**Steps:**
1. Logout first (or clear localStorage)
2. Go to http://localhost:5173
3. Click "Login" button
4. Use test credentials shown in modal:
   - Email: `admin@elonmerch.com`
   - Password: `password123`
5. Click "Login" button

**Expected Results:**
- ✅ Loading spinner appears during login
- ✅ Success message: "Login successful!"
- ✅ Modal closes
- ✅ User state updated with role: "admin"
- ✅ localStorage shows admin token and user

**Verification (in console):**
```javascript
localStorage.getItem('token')       // JWT token present
const user = JSON.parse(localStorage.getItem('user'))
console.log(user.role)              // Should print "admin"
console.log(user.email)             // Should print "admin@elonmerch.com"
```

---

### Test 4: Access Admin Dashboard

**Steps:**
1. After admin login, navigate to http://localhost:5173/admin/dashboard

**Expected Results:**
- ✅ AdminLayout loads (NO store Header visible)
- ✅ Admin sidebar visible on left
- ✅ Admin header visible on top
- ✅ Dashboard stats cards appear
- ✅ Recent orders table visible

**If Access Denied appears:**
- ✅ Check localStorage: `JSON.parse(localStorage.getItem('user')).role`
- If role is NOT "admin", login failed
- Try logging in again

---

### Test 5: Admin Navigation

**Steps:**
1. Click each sidebar item:
   - Dashboard
   - Events
   - Merchandise
   - Orders
   - Users

**Expected Results:**
- ✅ Each page loads without redirect
- ✅ No store Header visible
- ✅ Admin layout consistent
- ✅ Data tables/cards display
- ✅ CRUD buttons work

---

### Test 6: Non-Admin Access Attempt

**Steps:**
1. Login as customer (from Test 1)
2. Try to access http://localhost:5173/admin/dashboard directly

**Expected Results:**
- ✅ AdminLayout shows "Access Denied" message
- ✅ Message shows: "You don't have permission to access the admin panel"
- ✅ Shows current role: "customer"
- ✅ "Go to Home" button visible and clickable

---

### Test 7: Logout & Re-login

**Steps:**
1. Click user dropdown menu in admin header
2. Click "Logout"
3. Should be redirected to home page
4. Try to access /admin/dashboard
5. Should be redirected to home (unauthenticated)
6. Login again as admin
7. Can access dashboard again

**Expected Results:**
- ✅ localStorage cleared on logout
- ✅ Cannot access admin pages when logged out
- ✅ Can re-login and access admin again

---

## 🔍 BROWSER DEVELOPER TOOLS VERIFICATION

### F12 → Application Tab → Local Storage

**After Admin Login, should see:**
```
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

user: {
  "id": 1,
  "name": "Admin ELon",
  "email": "admin@elonmerch.com",
  "phone": "0901234567",
  "address": "123 Trung Tâm Sài Gòn",
  "role": "admin"
}
```

### F12 → Console Tab

**Test these commands:**

```javascript
// Check authentication state
const user = JSON.parse(localStorage.getItem('user'));
console.log('User:', user);
console.log('Is Admin:', user?.role === 'admin');
console.log('Token exists:', !!localStorage.getItem('token'));

// Simulate auth check (what AdminLayout does)
if (localStorage.getItem('token') && user?.role === 'admin') {
  console.log('✅ Can access admin dashboard');
} else {
  console.log('❌ Cannot access admin dashboard');
}
```

---

## 📊 API CALLS VERIFICATION

### F12 → Network Tab

**After Admin Login, should see:**

1. **POST /auth/login**
   - Request body: `{email: "admin@elonmerch.com", password: "password123"}`
   - Response: `{status: "success", data: {user: {...}, token: "..."}}`
   - Status: 200 OK

2. **After accessing /admin/dashboard, should see:**
   - Multiple GET requests to `/events`, `/products`, `/orders`, `/users`
   - All requests include header: `Authorization: Bearer <token>`
   - Status: 200 OK

---

## ✅ COMPLETE VERIFICATION CHECKLIST

- [ ] Can register as customer
- [ ] Can login as customer
- [ ] Customer cannot access admin dashboard (shows "Access Denied")
- [ ] Can login as admin@elonmerch.com
- [ ] Admin login shows success message
- [ ] After admin login, token in localStorage
- [ ] After admin login, user.role = "admin" in localStorage
- [ ] Can access /admin/dashboard without redirect
- [ ] Admin sidebar visible on dashboard
- [ ] Admin header visible on dashboard
- [ ] Can click sidebar items to navigate
- [ ] Cannot access /admin/* routes when logged out
- [ ] Logout clears localStorage
- [ ] Can re-login after logout
- [ ] Network tab shows requests with Authorization header
- [ ] Network tab shows 200 status codes (no 401/403)
- [ ] No console errors
- [ ] Responsive design works on mobile

---

## 🐛 TROUBLESHOOTING

### Issue: Still shows blank admin page after login

**Solution:**
1. Open F12 console
2. Check localStorage: `localStorage.getItem('user')`
3. If returns null, login didn't work
4. Try logging in again
5. Check Network tab for 200 status on /auth/login
6. If status is 401, credentials wrong
7. If status is 400, email/password missing

### Issue: "Access Denied" on admin dashboard

**Solution:**
1. Check localStorage user object: `JSON.parse(localStorage.getItem('user')).role`
2. If role is NOT "admin", account is not admin
3. Login with admin@elonmerch.com / password123
4. If still not working, check backend: `docker-compose logs php`

### Issue: Cannot see test credentials in modal

**Solution:**
1. Make sure you're on Login tab (not Sign Up)
2. Test credentials show at bottom of login form in blue box
3. Email: admin@elonmerch.com
4. Password: password123

### Issue: API requests returning 401 Unauthorized

**Solution:**
1. Token not being sent correctly
2. Check Network tab, look for Authorization header
3. Should be: `Authorization: Bearer <token>`
4. If missing, issue is in api.js
5. Verify src/utils/api.js has token extraction code

### Issue: Registration fails with "Email already registered"

**Solution:**
- Try with different email (add timestamp): `test-{Date.now()}@example.com`
- Or reset database: `docker-compose down -v && docker-compose up -d`

### Issue: Getting CORS errors

**Solution:**
1. Verify backend is running: `docker-compose ps`
2. Check API URL in src/utils/api.js is http://localhost:8080
3. Verify CORS headers set in backend
4. Check Network tab for 401/403 vs 0 status (0 = CORS blocked)

---

## 📝 QUICK REFERENCE

### Auth Flow:
```
User clicks Login
  ↓
AuthModal captures email/password
  ↓
Calls AuthContext.login(email, password)
  ↓
login() calls apiPost('/auth/login', {email, password})
  ↓
Backend returns {status: 'success', data: {user, token}}
  ↓
AuthContext stores token & user in state and localStorage
  ↓
User redirected to /admin/dashboard (if admin)
  ↓
AdminLayout checks isAdmin, allows access
```

### Admin Access Check:
```javascript
const { user, isAuthenticated, isAdmin } = useAuth();

if (!isAuthenticated) {
  // Show loading or redirect to login
}

if (!isAdmin) {
  // Show "Access Denied"
}

// If both true, render admin content
```

---

## 🎯 SUCCESS INDICATORS

After all fixes, you should see:
1. ✅ Customer login works (but cannot access admin)
2. ✅ Admin login works (can access admin)
3. ✅ Admin dashboard displays with sidebar
4. ✅ Can navigate between admin pages
5. ✅ CRUD operations work (add/edit/delete events, products)
6. ✅ Notifications appear on success/error
7. ✅ Logout clears everything
8. ✅ Re-login works smoothly

**If all checkmarks pass, authentication system is working correctly!**

