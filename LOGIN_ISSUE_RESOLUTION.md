# Login Issue Resolution Guide

## Problem Summary
User reports: "masih error ga bisa login padahal di database ada" (Still error, can't login even though data is in database)

Error message: "server tidak dapat dihubungi" (server cannot be reached)

---

## Root Cause Analysis

The login error occurs because:

1. **Backend server is not running** - The most common cause
2. **MongoDB is not running** - Database connection fails
3. **Port conflict** - Another process using port 5002
4. **Incorrect configuration** - .env file not set up properly

---

## Solution: Complete Setup Guide

### Phase 1: Verify Prerequisites

#### Check 1: MongoDB Installation
```powershell
# Check if MongoDB is installed
Get-Command mongosh
# or
Get-Command mongo
```

If not found, install MongoDB Community Edition from: https://www.mongodb.com/try/download/community

#### Check 2: Node.js Installation
```powershell
node --version
npm --version
```

Should show v14+ for Node.js

---

### Phase 2: Backend Setup

#### Step 1: Install Dependencies
```bash
cd backend
npm install
```

This installs:
- express (web server)
- mongoose (MongoDB driver)
- bcrypt (password hashing)
- jsonwebtoken (JWT tokens)
- cors (cross-origin requests)
- And other required packages

#### Step 2: Verify Configuration
Check `backend/.env`:
```
PORT=5002
MONGO_URL=mongodb://127.0.0.1:27017/DraftinDB
JWT_SECRET=rahasia_super_aman
MIDTRANS_IS_PRODUCTION=true
MIDTRANS_SERVER_KEY=YOUR_MIDTRANS_SERVER_KEY
MIDTRANS_CLIENT_KEY=YOUR_MIDTRANS_CLIENT_KEY
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
```

#### Step 3: Run Diagnostic
```bash
npm run diagnose
```

This checks:
- ✅ Environment variables set
- ✅ Required files exist
- ✅ Dependencies installed
- ✅ MongoDB connection works
- ✅ Admin user exists

---

### Phase 3: Start Services

#### Terminal 1: Start MongoDB
```powershell
# Check if running
Get-Service MongoDB

# Start if not running
Start-Service MongoDB

# Verify it's running
Get-Service MongoDB | Select-Object Status
```

Expected output: `Status : Running`

#### Terminal 2: Start Backend
```bash
cd backend
npm run dev
```

Expected output:
```
✅ MongoDB connected successfully
📍 Database: mongodb://127.0.0.1:27017/DraftinDB
✅ Server running on http://localhost:5002
🔗 CORS enabled for: http://localhost:5173
📊 Health check: http://localhost:5002/api/health
```

**IMPORTANT:** Keep this terminal open while using the app!

#### Terminal 3: Create Admin User
```bash
cd backend
npm run create-admin
```

Expected output:
```
✅ Admin user created successfully
Email: admin@draftin.com
Password: admin123
```

#### Terminal 4: Start Frontend
```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v... ready in ... ms
➜  Local:   http://localhost:5173/
```

---

### Phase 4: Test Login

#### Test 1: Health Check
Open browser: `http://localhost:5002/api/health`

Should see:
```json
{
  "status": "Server is running",
  "timestamp": "2024-02-21T10:30:00.000Z"
}
```

#### Test 2: Frontend Access
Open browser: `http://localhost:5173`

Should see home page with no errors

#### Test 3: Login
1. Click "Login" button
2. Enter credentials:
   - Email: `admin@draftin.com`
   - Password: `admin123`
3. Click "Masuk"

Expected result:
- ✅ No error message
- ✅ Redirects to admin dashboard
- ✅ See admin statistics

---

## Troubleshooting

### Symptom: "server tidak dapat dihubungi"

**Check 1: Is backend running?**
```bash
# In browser, go to:
http://localhost:5002/api/health
```
- If error: Backend not running
- Solution: Run `npm run dev` in backend folder

**Check 2: Is MongoDB running?**
```powershell
Get-Service MongoDB
```
- If not running: `Start-Service MongoDB`

**Check 3: Is port 5002 in use?**
```powershell
netstat -ano | findstr :5002
```
- If shows a PID: Kill it with `taskkill /PID <PID> /F`

**Check 4: Browser console errors?**
- Press F12 to open DevTools
- Go to Console tab
- Look for error messages
- Check Network tab for failed requests

---

### Symptom: "Email tidak ditemukan" (Email not found)

**Solution:**
1. Create admin user:
   ```bash
   npm run create-admin
   ```
2. Or register new user first
3. Try login again

---

### Symptom: "Password salah" (Wrong password)

**Solution:**
1. Check password is correct (case-sensitive)
2. For admin: use exactly `admin123`
3. If forgotten, create new admin:
   ```bash
   npm run create-admin
   ```

---

### Symptom: MongoDB connection error

**Solution:**
1. Start MongoDB:
   ```powershell
   Start-Service MongoDB
   ```
2. Verify connection:
   ```bash
   mongosh
   ```
3. Check .env has correct MONGO_URL:
   ```
   MONGO_URL=mongodb://127.0.0.1:27017/DraftinDB
   ```

---

### Symptom: CORS error in browser

**Solution:**
1. Verify backend running on 5002
2. Verify frontend running on 5173
3. Check .env PORT=5002
4. Restart both servers

---

## Complete Startup Checklist

- [ ] MongoDB installed
- [ ] Node.js installed
- [ ] Backend dependencies installed: `npm install` in backend folder
- [ ] .env file configured correctly
- [ ] MongoDB service running: `Start-Service MongoDB`
- [ ] Backend running: `npm run dev` in backend folder
- [ ] Admin user created: `npm run create-admin`
- [ ] Frontend running: `npm run dev` in frontend folder
- [ ] Health check works: `http://localhost:5002/api/health`
- [ ] Frontend loads: `http://localhost:5173`
- [ ] Login works with admin@draftin.com / admin123

---

## Important Information

### Ports
- Backend: 5002
- Frontend: 5173
- MongoDB: 27017

### Credentials
- Admin Email: `admin@draftin.com`
- Admin Password: `admin123`

### Database
- Name: `DraftinDB`
- Location: `mongodb://127.0.0.1:27017/DraftinDB`

### Files to Check
- Backend config: `backend/.env`
- Backend entry: `backend/index.js`
- Auth routes: `backend/routes/auth.js`
- User model: `backend/models/User.js`
- Login component: `frontend/src/views/Login.vue`

---

## Quick Commands Reference

```bash
# Backend
cd backend
npm install              # Install dependencies
npm run dev             # Start development server
npm run create-admin    # Create admin user
npm run diagnose        # Run diagnostic

# Frontend
cd frontend
npm install             # Install dependencies
npm run dev            # Start development server

# MongoDB
Start-Service MongoDB   # Start MongoDB service
Get-Service MongoDB     # Check MongoDB status

# Testing
# Health check
curl http://localhost:5002/api/health

# Login test
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@draftin.com\",\"password\":\"admin123\"}"
```

---

## Next Steps After Login Works

1. ✅ Test register new user
2. ✅ Test add to cart
3. ✅ Test checkout
4. ✅ Test admin dashboard
5. ✅ Test complaint submission
6. ✅ Test payment with Midtrans

---

## Support

If you still have issues after following this guide:

1. Run diagnostic: `npm run diagnose`
2. Check console output for specific errors
3. Verify all services running (MongoDB, Backend, Frontend)
4. Check browser DevTools (F12) for network errors
5. Review error messages carefully

