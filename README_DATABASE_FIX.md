# Database Connection Fix - Complete Solution

## 🎯 Problem
Database tidak mau connect ke MongoDB

## ✅ Solution
MongoDB service tidak running. Ikuti langkah-langkah di bawah.

---

## ⚡ Quick Fix (2 Minutes)

### Step 1: Start MongoDB
```powershell
Start-Service MongoDB
```

### Step 2: Verify
```powershell
Get-Service MongoDB
```
Should show: `Status = Running`

### Step 3: Start Backend
```bash
cd backend
npm run dev
```

Should show:
```
✅ MongoDB connected successfully
✅ Server running on http://localhost:5002
```

---

## 📚 Documentation Files Created

| File | Time | Purpose |
|------|------|---------|
| **MULAI_DARI_SINI.txt** | 5 min | ⭐ START HERE - Simple step-by-step |
| **VISUAL_DATABASE_FIX.txt** | 10 min | Visual guide with example output |
| **DATABASE_CONNECTION_SUMMARY.md** | 10 min | Complete reference |
| **FIX_DATABASE_CONNECTION.md** | 20 min | Detailed troubleshooting |
| **DATABASE_TROUBLESHOOTING.txt** | 15 min | Problem-solution pairs |
| **MONGODB_QUICK_FIX.md** | 5 min | Quick commands |
| **DATABASE_FIX_INDEX.md** | - | Navigation guide |
| **DATABASE_PROBLEM_SOLVED.txt** | - | Summary |

---

## 🔧 Tools Created

- **backend/utils/diagnoseSetup.js** - Diagnostic script
  - Run: `npm run diagnose`
  - Checks everything and reports issues

- **fix-mongodb.ps1** - Auto-fix script
  - Run: `.\fix-mongodb.ps1`
  - Automatically diagnoses and fixes

---

## 🚀 Complete Startup

**Terminal 1: MongoDB**
```powershell
Start-Service MongoDB
Get-Service MongoDB  # Verify
```

**Terminal 2: Backend**
```bash
cd backend
npm run dev
```

**Terminal 3: Admin**
```bash
cd backend
npm run create-admin
```

**Terminal 4: Frontend**
```bash
cd frontend
npm run dev
```

**Browser: Test**
```
http://localhost:5173
Login: admin@draftin.com / admin123
```

---

## 🔴 Common Errors & Quick Fix

| Error | Solution |
|-------|----------|
| `ECONNREFUSED 127.0.0.1:27017` | `Start-Service MongoDB` |
| `MongoServerError: connect ECONNREFUSED` | `Restart-Service MongoDB` |
| `Port 27017 already in use` | `taskkill /PID <PID> /F` |
| `Cannot find module 'mongoose'` | `npm install` |
| `MONGO_URL undefined` | Check `backend/.env` |
| `Service not found` | Install MongoDB |

---

## ✅ Verification Checklist

- [ ] MongoDB service running: `Get-Service MongoDB` → Running
- [ ] Can connect: `mongosh` → Prompt `>`
- [ ] Port 27017 listening: `netstat -ano | findstr :27017`
- [ ] .env configured: `MONGO_URL=mongodb://127.0.0.1:27017/DraftinDB`
- [ ] Backend starts: `npm run dev` → "✅ MongoDB connected"
- [ ] Health check: `http://localhost:5002/api/health` → JSON
- [ ] Admin created: `npm run create-admin` → Success
- [ ] Login works: `http://localhost:5173` → Login successful

---

## 📖 Which File to Read?

### I want quick fix (5 min)
👉 **MULAI_DARI_SINI.txt**

### I want visual guide (10 min)
👉 **VISUAL_DATABASE_FIX.txt**

### I want complete reference (15 min)
👉 **DATABASE_CONNECTION_SUMMARY.md**

### I have an error (10 min)
👉 **DATABASE_TROUBLESHOOTING.txt**

### I want detailed troubleshooting (20 min)
👉 **FIX_DATABASE_CONNECTION.md**

### I want navigation help
👉 **DATABASE_FIX_INDEX.md**

---

## 💡 Important Notes

✅ **MongoDB MUST be running first** - Before starting backend
✅ **Wait 5 seconds** - After starting MongoDB service
✅ **Don't close terminals** - Keep backend and frontend running
✅ **Check console output** - Error messages are helpful
✅ **Read error carefully** - It usually tells you the solution

---

## 🆘 If Still Not Working

### Run Diagnostic
```bash
cd backend
npm run diagnose
```

This checks:
- Environment variables
- Required files
- Dependencies
- MongoDB connection
- Database collections
- Admin user

### Check Error Message
Look at console output carefully - it usually tells you the problem.

### Restart Everything
```powershell
# Kill all Node processes
taskkill /F /IM node.exe

# Stop MongoDB
Stop-Service MongoDB

# Wait 5 seconds
Start-Sleep -Seconds 5

# Start MongoDB
Start-Service MongoDB

# Start backend
cd backend && npm run dev
```

---

## 📞 Quick Reference

**MongoDB:**
- Host: 127.0.0.1
- Port: 27017
- Database: DraftinDB

**Backend:**
- Port: 5002
- URL: http://localhost:5002

**Frontend:**
- Port: 5173
- URL: http://localhost:5173

**Admin:**
- Email: admin@draftin.com
- Password: admin123

---

## 🎯 Next Steps

1. **Choose a file** from "Which File to Read?" above
2. **Follow the guide** step-by-step
3. **Verify checklist** items
4. **Test login** at http://localhost:5173
5. **Done!** ✅

---

## 📝 Summary

✅ Problem identified: MongoDB service not running
✅ Solution provided: Start-Service MongoDB
✅ Documentation created: 8 files + 1 script
✅ Diagnostic tools: npm run diagnose
✅ Quick fix: 2 minutes
✅ Complete setup: 15 minutes

---

**Ready? Start with MULAI_DARI_SINI.txt! 🚀**

