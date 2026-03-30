# Quick Setup Checklist

## Before You Start
- [ ] MongoDB installed and running
- [ ] Node.js installed (v14+)
- [ ] npm installed

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```
- [ ] No errors during installation

### 2. Verify .env File
```bash
# backend/.env should contain:
PORT=5002
MONGO_URL=mongodb://127.0.0.1:27017/DraftinDB
JWT_SECRET=rahasia_super_aman
```
- [ ] .env file exists
- [ ] PORT is 5002
- [ ] MONGO_URL is correct

### 3. Start Backend
```bash
npm run dev
```
- [ ] See "✅ MongoDB connected successfully"
- [ ] See "✅ Server running on http://localhost:5002"
- [ ] No error messages

### 4. Test Health Check
Open browser: `http://localhost:5002/api/health`
- [ ] See JSON response with status

### 5. Create Admin User
```bash
npm run create-admin
```
- [ ] See "✅ Admin user created successfully"
- [ ] Email: admin@draftin.com
- [ ] Password: admin123

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```
- [ ] No errors during installation

### 2. Start Frontend
```bash
npm run dev
```
- [ ] See "Local: http://localhost:5173/"
- [ ] No error messages

### 3. Open in Browser
Go to: `http://localhost:5173`
- [ ] See home page
- [ ] No console errors

## Test Login

### 1. Click Login Button
- [ ] Login page appears

### 2. Enter Credentials
- Email: `admin@draftin.com`
- Password: `admin123`
- [ ] Fields accept input

### 3. Click Login
- [ ] No error message
- [ ] Redirects to admin dashboard
- [ ] See admin statistics

## If Login Fails

### Check 1: Backend Running?
```bash
# In browser, go to:
http://localhost:5002/api/health
```
- [ ] See JSON response
- [ ] If not, start backend: `npm run dev`

### Check 2: MongoDB Running?
```powershell
# In PowerShell:
Get-Service MongoDB
```
- [ ] Status shows "Running"
- [ ] If not: `Start-Service MongoDB`

### Check 3: Admin User Exists?
```bash
# In backend folder:
npm run create-admin
```
- [ ] See success message
- [ ] Try login again

### Check 4: Browser Console
- [ ] Press F12 to open DevTools
- [ ] Go to Console tab
- [ ] Look for error messages
- [ ] Check Network tab for failed requests

## Success Indicators

✅ Backend running on port 5002
✅ Frontend running on port 5173
✅ MongoDB connected
✅ Admin user created
✅ Login works
✅ Redirects to admin dashboard

## Troubleshooting Commands

```bash
# Check MongoDB status
Get-Service MongoDB

# Start MongoDB
Start-Service MongoDB

# Check if port 5002 is in use
netstat -ano | findstr :5002

# Kill process on port 5002
taskkill /PID <PID> /F

# Check if port 5173 is in use
netstat -ano | findstr :5173

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -r node_modules package-lock.json
npm install
```

## File Locations

- Backend: `./backend/`
- Frontend: `./frontend/`
- Backend Config: `./backend/.env`
- Backend Entry: `./backend/index.js`
- Frontend Entry: `./frontend/src/main.ts`
- Login Component: `./frontend/src/views/Login.vue`

## Important Ports

- Backend: 5002
- Frontend: 5173
- MongoDB: 27017

## Important Credentials

- Admin Email: `admin@draftin.com`
- Admin Password: `admin123`
- Database: `DraftinDB`

---

**If everything is checked, your app should be working!**

