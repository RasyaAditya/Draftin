# Database Connection - Summary & Quick Fix

## 🔴 Masalah
Database tidak mau connect ke MongoDB

## ✅ Solusi Cepat (2 Menit)

### Step 1: Start MongoDB Service
```powershell
Start-Service MongoDB
```

### Step 2: Verify Running
```powershell
Get-Service MongoDB
```
Harus muncul: `Status = Running`

### Step 3: Start Backend
```bash
cd backend
npm run dev
```

Harus muncul:
```
✅ MongoDB connected successfully
✅ Server running on http://localhost:5002
```

---

## 📋 Penyebab Umum & Solusi

| Penyebab | Error Message | Solusi |
|----------|---------------|--------|
| MongoDB tidak running | `ECONNREFUSED 127.0.0.1:27017` | `Start-Service MongoDB` |
| MongoDB crashed | `MongoServerError: connect ECONNREFUSED` | `Restart-Service MongoDB` |
| Port conflict | `Port 27017 already in use` | `taskkill /PID <PID> /F` |
| Dependencies missing | `Cannot find module 'mongoose'` | `npm install` |
| .env missing | `MONGO_URL undefined` | Create `backend/.env` |
| MongoDB not installed | `Service not found` | Install MongoDB |

---

## 🚀 Complete Startup Sequence

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

**Terminal 3: Admin User**
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

## 🔧 Diagnostic Commands

```powershell
# Check MongoDB status
Get-Service MongoDB

# Start MongoDB
Start-Service MongoDB

# Restart MongoDB
Restart-Service MongoDB

# Test connection
mongosh

# Check port 27017
netstat -ano | findstr :27017

# Kill process
taskkill /PID <PID> /F

# Install dependencies
npm install

# Run diagnostic
npm run diagnose
```

---

## 📁 Important Files

- **Configuration:** `backend/.env`
- **Backend Entry:** `backend/index.js`
- **Database Models:** `backend/models/User.js`
- **Auth Routes:** `backend/routes/auth.js`

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

## 📚 Documentation Files

1. **MULAI_DARI_SINI.txt** - Step-by-step guide (START HERE!)
2. **FIX_DATABASE_CONNECTION.md** - Detailed troubleshooting
3. **DATABASE_TROUBLESHOOTING.txt** - Problem-solution pairs
4. **MONGODB_QUICK_FIX.md** - Quick reference
5. **fix-mongodb.ps1** - Auto-fix script

---

## 🆘 If Still Not Working

### Option 1: Run Diagnostic
```bash
cd backend
npm run diagnose
```

### Option 2: Check Error Message
Look at console output carefully - it usually tells you the problem.

### Option 3: Restart Everything
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

### Option 4: Use MongoDB Atlas (Cloud)
If local MongoDB doesn't work:
1. Create account: https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `.env`:
   ```
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/DraftinDB
   ```

---

## 💡 Important Notes

✅ **MongoDB MUST be running first** - Before starting backend
✅ **Wait 5 seconds** - After starting MongoDB service
✅ **Don't close terminals** - Keep backend and frontend running
✅ **Check console output** - Error messages are helpful
✅ **Read error carefully** - It usually tells you the solution

---

## 🎯 Next Steps

1. Follow "Solusi Cepat" above
2. Verify all checklist items
3. Start backend: `npm run dev`
4. Test login: http://localhost:5173
5. If error, run diagnostic: `npm run diagnose`

---

## 📞 Quick Reference

**MongoDB Default Settings:**
- Host: 127.0.0.1 (localhost)
- Port: 27017
- Database: DraftinDB

**Backend Settings:**
- Port: 5002
- URL: http://localhost:5002

**Frontend Settings:**
- Port: 5173
- URL: http://localhost:5173

**Admin Credentials:**
- Email: admin@draftin.com
- Password: admin123

---

**Ready? Start with MULAI_DARI_SINI.txt!**

