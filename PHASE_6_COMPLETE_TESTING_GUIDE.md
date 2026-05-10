# PHASE 6: CRUD IMPLEMENTATION - COMPLETE TESTING GUIDE

## 📦 What's Been Implemented

### 1. API Utility (`src/utils/api.js`)
- `apiCall()` - Main fetch wrapper with JWT auth
- `apiGet()` - GET request with query params
- `apiPost()` - POST request with body
- `apiPut()` - PUT request for updates
- `apiDelete()` - DELETE request
- Automatically includes `Authorization: Bearer <token>` header

### 2. Custom Hook (`src/hooks/useApi.js`)
- `useApi()` - Manages loading, error, and request states
- Returns: `{ loading, error, request, clearError }`

### 3. Admin Components
- **DeleteConfirmationModal.jsx** - Confirmation dialog for delete operations
- **AddEventModal.jsx** - Form for creating/editing events
- **AddProductModal.jsx** - Form for creating/editing products
- **Notification.jsx** - Success/error toast notifications

### 4. Fully Implemented Pages
- **AdminEvents.jsx** - Complete CRUD for events
  - List events in a beautiful table
  - Add new event
  - Edit existing event
  - Delete event with confirmation
  - Real-time updates

- **AdminMerchandise.jsx** - Complete CRUD for products
  - List products in a responsive grid
  - Add new product
  - Edit existing product
  - Delete product with confirmation
  - Stock status badges

---

## 🚀 COMPLETE TESTING GUIDE

### Prerequisites
1. Backend running: `docker-compose up -d`
2. Frontend running: `npm run dev`
3. Have admin token in localStorage (login first)

### Test Flow

#### STEP 1: Login to Admin

1. Open `http://localhost:5173`
2. Click "Login" or "Sign up"
3. Use credentials:
   - **Email:** `admin@elonmerch.com`
   - **Password:** `password123`
4. After login, you should see admin sidebar

#### STEP 2: Navigate to Events

1. Click "Events" in sidebar
2. You should see a table with 4 existing events:
   - Lệ Chi Viên 2024
   - Soobin Live Concert 2024
   - Workshop Làm nến thơm
   - Thuốc Đắng Dã Tật

#### STEP 3: Test READ (View Events)

✅ **Expected:**
- Table displays all events
- Shows: Title, Date, Location, Prices, Status
- Status badges appear (blue for "Upcoming")
- Vietnamese currency formatting (₫)

#### STEP 4: Test CREATE (Add Event)

1. Click **"+ Add Event"** button
2. Fill out form:
   - **Title:** "Test Concert 2024"
   - **Date:** Pick tomorrow's date
   - **Time:** "20:00"
   - **Location:** "Test Venue, City"
   - **Regular Price:** "350000"
   - **VIP Price:** "550000"
   - **Total Tickets:** "1000"

3. Click **"Add Event"** button
4. You should see:
   - Loading spinner while saving
   - Success notification: "Event created successfully!"
   - Modal closes automatically
   - New event appears at top of table

#### STEP 5: Test UPDATE (Edit Event)

1. In the events table, click **Edit** (pencil icon) on any event
2. Modal opens with pre-filled data
3. Change the title to "Updated Concert Name"
4. Click **"Update Event"** button
5. You should see:
   - Loading spinner
   - Success notification: "Event updated successfully!"
   - Modal closes
   - Table updates with new title

#### STEP 6: Test DELETE (Delete Event)

1. Click **Delete** (trash icon) on the "Test Concert 2024" event
2. Confirmation modal appears:
   - Title: "Delete Event"
   - Message about confirmation
3. Click **"Delete"** button
4. You should see:
   - Red loading spinner
   - Success notification: "Event deleted successfully!"
   - Modal closes
   - Event disappears from table

#### STEP 7: Test Merchandise CREATE

1. Click **"Merchandise"** in sidebar
2. Click **"+ Add Product"** button
3. Fill out form:
   - **Name:** "Test T-Shirt"
   - **Category:** "Áo"
   - **Price:** "199000"
   - **Stock:** "100"
   - **Colors:** `["Đen", "Trắng"]` (JSON)
   - **Sizes:** `["M", "L", "XL"]` (JSON)

4. Click **"Add Product"** button
5. You should see:
   - Product card appears in grid
   - "In Stock" badge in green
   - Success notification

#### STEP 8: Test Merchandise READ

1. Grid displays all 8 existing products:
   - Áo Thun Soobin
   - Lightstick Concert
   - Khăn Bandana
   - Tote Bag
   - Pin Cài Áo
   - Mũ Snapback
   - Túi Đeo Chéo
   - Combo VIP Package

2. Each card shows:
   - Product name & category
   - Price in VND
   - Stock status (Green/Yellow/Red)
   - Color tags
   - Edit & Delete buttons

#### STEP 9: Test Merchandise UPDATE

1. Click **Edit** on "Test T-Shirt"
2. Change name to "Updated T-Shirt"
3. Click **"Update Product"**
4. Card updates with new name
5. Success notification appears

#### STEP 10: Test Merchandise DELETE

1. Click **Delete** on "Updated T-Shirt"
2. Confirmation modal appears
3. Click **"Delete"**
4. Product card disappears
5. Success notification appears

---

## 🧪 TEST SCENARIOS

### Scenario 1: Network Error
**What to test:** What happens if backend is down

1. Stop backend: `docker-compose down`
2. Try to add an event
3. **Expected:** Error notification appears: "Network error"
4. Start backend again: `docker-compose up -d`

### Scenario 2: Validation Errors
**What to test:** Form validation

1. Click "Add Event"
2. Leave "Title" empty
3. Click "Add Event"
4. **Expected:** Red error message appears: "Title is required"

### Scenario 3: Loading States
**What to test:** Spinners during operations

1. Add event
2. **Expected:** Spinner appears in button while saving
3. Modal stays open during loading
4. Button is disabled

### Scenario 4: Modal Close
**What to test:** Clearing form when closing

1. Click "Add Event"
2. Fill some data
3. Click "X" button or Cancel
4. Modal closes
5. Click "Add Event" again
6. **Expected:** Form is empty (new event form)

### Scenario 5: Error Handling
**What to test:** Invalid JSON for colors/sizes

1. Click "Add Product"
2. In "Colors" field, type: `invalid json`
3. Click "Add Product"
4. **Expected:** Error message: "Invalid JSON format for colors/sizes"

---

## 📊 cURL Testing Commands

### Test API Directly

#### Get All Events
```bash
curl -X GET http://localhost:80/events?page=1&per_page=100 \
  -H "Authorization: Bearer $TOKEN"
```

#### Create Event
```bash
curl -X POST http://localhost:80/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Test Event",
    "date": "2024-05-25",
    "time": "19:00:00",
    "location": "Test Location",
    "reg_price": 350000,
    "vip_price": 550000
  }'
```

#### Update Event
```bash
curl -X PUT http://localhost:80/events/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title": "Updated Title"}'
```

#### Delete Event
```bash
curl -X DELETE http://localhost:80/events/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔍 Browser Dev Tools Testing

### Check Network Tab
1. Open Developer Tools (F12)
2. Go to Network tab
3. Perform an action (add/edit/delete)
4. **Expected API calls:**
   - POST to `/events` (create)
   - PUT to `/events/1` (update)
   - DELETE to `/events/1` (delete)
   - GET to `/events` (refresh list)

### Check Headers
1. Click on request
2. Go to "Headers" tab
3. **Expected:**
   - `Authorization: Bearer <token>`
   - `Content-Type: application/json`

### Check Response
1. Click on request
2. Go to "Response" tab
3. **Expected:**
   - `{"status": "success", "data": {...}, "meta": {...}}`

---

## ✅ Verification Checklist

### Events Page
- [ ] Can see list of 4 events
- [ ] Table displays: Title, Date, Location, Prices, Status
- [ ] Status badges are colored (blue for upcoming)
- [ ] Can click "Add Event" button
- [ ] Can add new event successfully
- [ ] Success notification appears
- [ ] New event appears in table
- [ ] Can click Edit on any event
- [ ] Edit modal opens with data pre-filled
- [ ] Can update event
- [ ] Can click Delete on any event
- [ ] Confirmation modal appears
- [ ] Can confirm delete
- [ ] Event is deleted from table
- [ ] Error handling works (network error shows notification)

### Merchandise Page
- [ ] Can see grid of 8 products
- [ ] Each card shows: Name, Category, Price, Stock Status
- [ ] Stock status badges are colored (Green/Yellow/Red)
- [ ] Can click "Add Product" button
- [ ] Can add new product successfully
- [ ] Product card appears in grid
- [ ] Can click Edit on any product
- [ ] Edit modal opens with data pre-filled
- [ ] Can update product
- [ ] Can click Delete on any product
- [ ] Confirmation modal appears
- [ ] Can confirm delete
- [ ] Product is deleted from grid

### General
- [ ] Notifications appear after actions
- [ ] Loading spinners appear during requests
- [ ] Modal closes after successful save
- [ ] Form clears when creating new item
- [ ] JWT token included in all requests
- [ ] Responsive design works on mobile/tablet

---

## 🐛 Common Issues & Solutions

### Issue: 401 Unauthorized
**Solution:** 
- Check if logged in
- Check if token exists in localStorage
- Try logging out and back in

### Issue: CORS Error
**Solution:**
- Ensure backend is running
- Check if API URL is `http://localhost:80` (not :5173)
- Verify CORS headers in backend

### Issue: Modal doesn't close after save
**Solution:**
- Check browser console for errors
- Check network tab for failed requests
- Verify form validation passed

### Issue: Table doesn't update after action
**Solution:**
- Check if API response includes `"status": "success"`
- Check if fetchEvents() is being called after save
- Clear browser cache

---

## 📱 Responsive Testing

### Desktop (1920px+)
- [ ] Sidebar always visible
- [ ] Events: 1 full-width table
- [ ] Products: 3-column grid

### Laptop (1024px - 1920px)
- [ ] Sidebar fixed
- [ ] Events: 1 table with horizontal scroll
- [ ] Products: 3-column grid

### Tablet (768px - 1023px)
- [ ] Sidebar hidden (toggle with menu button)
- [ ] Events: Table with horizontal scroll
- [ ] Products: 2-column grid

### Mobile (< 768px)
- [ ] Sidebar as overlay
- [ ] Events: Horizontal scroll table
- [ ] Products: 1-column stack
- [ ] Buttons are touch-friendly

---

## 🎯 Success Indicators

After completing all tests, you should have:

✅ Fully functional Events management (CRUD)
✅ Fully functional Products management (CRUD)
✅ Real-time table/grid updates
✅ Error handling and notifications
✅ Loading states on buttons
✅ Modal forms with validation
✅ Delete confirmation dialogs
✅ JWT authentication working
✅ Responsive design on all screens

---

## 📝 Next Steps

After verification:
1. Test with real event/product data
2. Test concurrent operations (multiple users)
3. Test with edge cases (very long names, special characters)
4. Implement AdminOrders.jsx and AdminUsers.jsx
5. Add filters/search to tables
6. Add pagination for large datasets

---

## 📞 Support

If you encounter issues:
1. Check browser console for error messages
2. Check backend logs: `docker-compose logs php`
3. Verify token is in localStorage
4. Try hard refresh: Ctrl+Shift+R
5. Clear browser cache

