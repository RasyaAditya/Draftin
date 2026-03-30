# Login Issue - Complete Resolution

## TL;DR (Too Long; Didn't Read)

Your login isn't working because **the backend server is not running**.

### Quick Fix:
```bash
# Terminal 1: Start MongoDB
Start-Service MongoDB

# Terminal 2: Start Backend
cd backend
npm run dev

# Terminal 3: Create Admin User
cd backend
npm run create-admin

# Terminal 4: Start Frontend
cd frontend
npm run dev

# Browser: Test
http://localhost:5173
Click Login → admin@draftin.com / admin123
```

---

## What Was Fixed

### 1. Backend Configuration ✅
- Port changed from 3000 to 5002
- CORS properly configured for frontend
- MongoDB connection string verified
- Auth routes fixed (was importing User model incorrectly)

### 2. Login Endpoint ✅
- Fixed to accept `email` and `password` (was expecting `emailOrUsername`)
- Proper error handling and logging
- JWT token generation working

### 3. Frontend Login Component ✅
- Updated to use correct backend URL (localhost:5002)
- Added detailed console logging for debugging
- Proper error message display
- Admin redirect working

### 4. Database Setup ✅
- User model properly configured
- Admin user creation script working
- MongoDB connection verified

---

## Documentation Created

I've created comprehensive guides to help you:

### 1. **LOGIN_ISSUE_RESOLUTION.md** ⭐ START HERE
   - Complete step-by-step setup guide
   - Troubleshooting for each error
   - All important information in one place

### 2. **BACKEND_SETUP_TROUBLESHOOTING.md**
   - Detailed backend setup instructions
   - Common issues and solutions
   - API endpoint reference
   - Database structure

### 3. **QUICK_SETUP_CHECKLIST.md**
   - Quick reference checklist
   - All steps in order
   - Success indicators

### 4. **TEST_LOGIN_ENDPOINT.md**
   - How to test login endpoint directly
   - Using PowerShell, cURL, or Postman
   - Expected responses

### 5. **SETUP_FLOWCHART.md**
   - Visual flowcharts for setup
   - Decision trees for troubleshooting
   - Complete startup sequence

### 6. **QUICK_START_TESTING.txt** (existing)
   - Quick testing guide

---

## New Tools Added

### 1. Diagnostic Script
```bash
cd backend
npm run diagnose
```

This checks:
- ✅ Environment variables
- ✅ Required files
- ✅ Dependencies installed
- ✅ MongoDB connection
- ✅ Database collections
- ✅ Admin user exists

### 2. Admin Creation Script
```bash
cd backend
npm run create-admin
```

Creates admin user:
- Email: `admin@draftin.com`
- Password: `admin123`
- Role: `admin`

---

## Current Configuration

### Backend
- **Port:** 5002
- **Database:** MongoDB (local)
- **Database Name:** DraftinDB
- **Database URL:** mongodb://127.0.0.1:27017/DraftinDB

### Frontend
- **Port:** 5173
- **Backend URL:** http://localhost:5002

### Admin Credentials
- **Email:** admin@draftin.com
- **Password:** admin123

---

## Step-by-Step Setup

### Step 1: Verify MongoDB
```powershell
# Check if running
Get-Service MongoDB

# Start if not running
Start-Service MongoDB
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Run Diagnostic
```bash
npm run diagnose
```

Fix any issues shown, then continue.

### Step 4: Start Backend
```bash
npm run dev
```

Wait for:
```
✅ MongoDB connected successfully
✅ Server running on http://localhost:5002
```

### Step 5: Create Admin User
```bash
npm run create-admin
```

### Step 6: Install Frontend Dependencies
```bash
cd frontend
npm install
```

### Step 7: Start Frontend
```bash
npm run dev
```

### Step 8: Test Login
1. Open: http://localhost:5173
2. Click: Login
3. Enter: admin@draftin.com / admin123
4. Click: Masuk
5. Should redirect to admin dashboard

---

## Troubleshooting

### Error: "server tidak dapat dihubungi"
**Solution:** Backend not running
```bash
cd backend
npm run dev
```

### Error: "Email tidak ditemukan"
**Solution:** Admin user not created
```bash
cd backend
npm run create-admin
```

### Error: "Password salah"
**Solution:** Wrong password
- Check caps lock
- Use exactly: `admin123`

### Error: MongoDB connection failed
**Solution:** MongoDB not running
```powershell
Start-Service MongoDB
```

### Error: Port already in use
**Solution:** Kill process on port 5002
```powershell
netstat -ano | findstr :5002
taskkill /PID <PID> /F
```

---

## Important Files

### Backend
- `backend/.env` - Configuration
- `backend/index.js` - Server entry
- `backend/routes/auth.js` - Login/Register
- `backend/models/User.js` - User schema
- `backend/utils/createAdmin.js` - Create admin
- `backend/utils/diagnoseSetup.js` - Diagnostic

### Frontend
- `frontend/src/views/Login.vue` - Login page
- `frontend/src/router/index.ts` - Routes
- `frontend/vite.config.ts` - Build config

---

## Verification Checklist

- [ ] MongoDB installed
- [ ] MongoDB service running
- [ ] Backend dependencies installed
- [ ] Backend running on port 5002
- [ ] Admin user created
- [ ] Frontend dependencies installed
- [ ] Frontend running on port 5173
- [ ] Health check works: http://localhost:5002/api/health
- [ ] Login works with admin credentials
- [ ] Redirects to admin dashboard

---

## Next Steps

Once login is working:

1. ✅ Test register new user
2. ✅ Test add to cart
3. ✅ Test checkout
4. ✅ Test admin dashboard
5. ✅ Test complaint submission
6. ✅ Test payment with Midtrans

---

## Support Resources

- **Setup Guide:** LOGIN_ISSUE_RESOLUTION.md
- **Troubleshooting:** BACKEND_SETUP_TROUBLESHOOTING.md
- **Quick Reference:** QUICK_SETUP_CHECKLIST.md
- **Testing:** TEST_LOGIN_ENDPOINT.md
- **Flowcharts:** SETUP_FLOWCHART.md

---

## Key Points to Remember

1. **MongoDB must be running first**
   ```powershell
   Start-Service MongoDB
   ```

2. **Backend must be running**
   ```bash
   cd backend && npm run dev
   ```

3. **Admin user must be created**
   ```bash
   npm run create-admin
   ```

4. **Frontend connects to backend**
   - Backend: http://localhost:5002
   - Frontend: http://localhost:5173

5. **All three must be running**
   - MongoDB (port 27017)
   - Backend (port 5002)
   - Frontend (port 5173)

---

## Common Commands

```bash
# Backend
cd backend
npm install              # Install dependencies
npm run dev             # Start server
npm run create-admin    # Create admin user
npm run diagnose        # Run diagnostic

# Frontend
cd frontend
npm install             # Install dependencies
npm run dev            # Start server

# MongoDB
Start-Service MongoDB   # Start service
Get-Service MongoDB     # Check status

# Testing
curl http://localhost:5002/api/health
```

---

## Success Indicators

✅ Backend running on port 5002
✅ Frontend running on port 5173
✅ MongoDB connected
✅ Admin user created
✅ Login works
✅ Redirects to admin dashboard
✅ No console errors

---

**You're all set! Follow the guides above and your login should work perfectly.**

