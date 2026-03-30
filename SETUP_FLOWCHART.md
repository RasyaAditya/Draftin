# Setup Flowchart & Decision Tree

## Quick Decision Tree

```
┌─────────────────────────────────────────────────────────────┐
│ Can you login to the app?                                   │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
              YES                      NO
                │                       │
                ▼                       ▼
         ✅ SUCCESS!          ┌──────────────────────┐
                              │ Error message?       │
                              └──────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
            "server tidak      "Email tidak      "Password
             dapat dihubungi"   ditemukan"         salah"
                    │                 │                 │
                    ▼                 ▼                 ▼
            ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
            │ Backend not  │  │ User doesn't │  │ Wrong        │
            │ running or   │  │ exist in DB  │  │ password     │
            │ MongoDB down │  │              │  │              │
            └──────────────┘  └──────────────┘  └──────────────┘
                    │                 │                 │
                    ▼                 ▼                 ▼
            See "Backend       Run:              Check:
            Startup" below    npm run           - Password
                              create-admin      - Caps lock
                                                - Correct email
```

---

## Backend Startup Flowchart

```
START
  │
  ▼
┌─────────────────────────────────────┐
│ Is MongoDB installed?               │
└─────────────────────────────────────┘
  │
  ├─ NO ──► Install MongoDB Community Edition
  │         https://www.mongodb.com/try/download/community
  │         Then continue
  │
  └─ YES ──┐
           ▼
┌─────────────────────────────────────┐
│ Is MongoDB service running?         │
│ (Get-Service MongoDB)               │
└─────────────────────────────────────┘
  │
  ├─ NO ──► Start-Service MongoDB
  │         Wait 5 seconds
  │         Then continue
  │
  └─ YES ──┐
           ▼
┌─────────────────────────────────────┐
│ cd backend                          │
│ npm install                         │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ npm run diagnose                    │
│ (Check everything)                  │
└─────────────────────────────────────┘
  │
  ├─ ERRORS ──► Fix issues shown
  │             Then run diagnose again
  │
  └─ ALL OK ──┐
             ▼
┌─────────────────────────────────────┐
│ npm run dev                         │
│ (Start backend)                     │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ See "✅ Server running on           │
│ http://localhost:5002"?             │
└─────────────────────────────────────┘
  │
  ├─ NO ──► Check error messages
  │         Fix issues
  │         Try again
  │
  └─ YES ──┐
           ▼
┌─────────────────────────────────────┐
│ npm run create-admin                │
│ (Create admin user)                 │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ See "✅ Admin user created"?        │
└─────────────────────────────────────┘
  │
  ├─ NO ──► Check error messages
  │         Fix issues
  │         Try again
  │
  └─ YES ──┐
           ▼
        ✅ BACKEND READY!
```

---

## Frontend Startup Flowchart

```
START
  │
  ▼
┌─────────────────────────────────────┐
│ cd frontend                         │
│ npm install                         │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ npm run dev                         │
│ (Start frontend)                    │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ See "Local: http://localhost:5173"? │
└─────────────────────────────────────┘
  │
  ├─ NO ──► Check error messages
  │         Fix issues
  │         Try again
  │
  └─ YES ──┐
           ▼
┌─────────────────────────────────────┐
│ Open browser:                       │
│ http://localhost:5173               │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ See home page?                      │
└─────────────────────────────────────┘
  │
  ├─ NO ──► Check browser console (F12)
  │         Look for errors
  │         Fix issues
  │
  └─ YES ──┐
           ▼
        ✅ FRONTEND READY!
```

---

## Login Test Flowchart

```
START
  │
  ▼
┌─────────────────────────────────────┐
│ Click "Login" button                │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ Enter credentials:                  │
│ Email: admin@draftin.com            │
│ Password: admin123                  │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ Click "Masuk"                       │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ Error message appears?              │
└─────────────────────────────────────┘
  │
  ├─ "server tidak dapat dihubungi"
  │  │
  │  ├─ Backend not running?
  │  │  └─ Run: npm run dev
  │  │
  │  ├─ MongoDB not running?
  │  │  └─ Run: Start-Service MongoDB
  │  │
  │  └─ Port 5002 in use?
  │     └─ Kill process: taskkill /PID <PID> /F
  │
  ├─ "Email tidak ditemukan"
  │  │
  │  └─ Admin user not created?
  │     └─ Run: npm run create-admin
  │
  ├─ "Password salah"
  │  │
  │  └─ Wrong password?
  │     └─ Check caps lock
  │        Try: admin123
  │
  └─ NO ERROR ──┐
               ▼
        ┌──────────────────────┐
        │ Redirects to admin   │
        │ dashboard?           │
        └──────────────────────┘
               │
               ├─ NO ──► Check browser console (F12)
               │         Look for errors
               │
               └─ YES ──┐
                        ▼
                    ✅ LOGIN SUCCESS!
```

---

## Complete Startup Sequence

```
┌─────────────────────────────────────────────────────────────┐
│ TERMINAL 1: Start MongoDB                                   │
├─────────────────────────────────────────────────────────────┤
│ $ Start-Service MongoDB                                     │
│ $ Get-Service MongoDB                                       │
│ Status : Running                                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ (Wait 2 seconds)
┌─────────────────────────────────────────────────────────────┐
│ TERMINAL 2: Start Backend                                   │
├─────────────────────────────────────────────────────────────┤
│ $ cd backend                                                │
│ $ npm run dev                                               │
│ ✅ MongoDB connected successfully                           │
│ ✅ Server running on http://localhost:5002                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ (Wait 2 seconds)
┌─────────────────────────────────────────────────────────────┐
│ TERMINAL 3: Create Admin User                               │
├─────────────────────────────────────────────────────────────┤
│ $ cd backend                                                │
│ $ npm run create-admin                                      │
│ ✅ Admin user created successfully                          │
│ Email: admin@draftin.com                                    │
│ Password: admin123                                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ (Wait 1 second)
┌─────────────────────────────────────────────────────────────┐
│ TERMINAL 4: Start Frontend                                  │
├─────────────────────────────────────────────────────────────┤
│ $ cd frontend                                               │
│ $ npm run dev                                               │
│ ➜  Local:   http://localhost:5173/                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ (Wait 2 seconds)
┌─────────────────────────────────────────────────────────────┐
│ BROWSER: Test Application                                   │
├─────────────────────────────────────────────────────────────┤
│ 1. Open: http://localhost:5173                             │
│ 2. Click: Login                                             │
│ 3. Enter: admin@draftin.com / admin123                     │
│ 4. Click: Masuk                                             │
│ 5. Result: Redirects to admin dashboard                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ✅ ALL SYSTEMS GO!
```

---

## Troubleshooting Decision Tree

```
┌─────────────────────────────────────────────────────────────┐
│ What's the problem?                                         │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
    Backend            Frontend            Login
    Issues             Issues              Issues
        │                   │                   │
        ▼                   ▼                   ▼
    ┌─────────┐         ┌─────────┐       ┌─────────┐
    │ Run:    │         │ Run:    │       │ Run:    │
    │ npm run │         │ npm run │       │ npm run │
    │ diagnose│         │ dev     │       │ diagnose│
    └─────────┘         └─────────┘       └─────────┘
        │                   │                   │
        ▼                   ▼                   ▼
    Check:              Check:              Check:
    - MongoDB           - Port 5173         - Backend
    - Port 5002         - Console (F12)     - MongoDB
    - Dependencies      - Network tab       - Admin user
    - .env file         - Error messages    - Credentials
```

---

## File Structure Reference

```
project/
├── backend/
│   ├── .env                    ← Configuration
│   ├── index.js                ← Server entry
│   ├── package.json            ← Dependencies
│   ├── routes/
│   │   └── auth.js             ← Login/Register
│   ├── models/
│   │   └── User.js             ← User schema
│   ├── middleware/
│   │   └── authMiddleware.js   ← Auth check
│   └── utils/
│       ├── createAdmin.js      ← Create admin
│       └── diagnoseSetup.js    ← Diagnostic
│
├── frontend/
│   ├── package.json            ← Dependencies
│   ├── src/
│   │   ├── main.ts             ← Entry point
│   │   ├── views/
│   │   │   └── Login.vue        ← Login page
│   │   └── router/
│   │       └── index.ts         ← Routes
│   └── vite.config.ts           ← Build config
│
└── Documentation/
    ├── LOGIN_ISSUE_RESOLUTION.md
    ├── BACKEND_SETUP_TROUBLESHOOTING.md
    ├── QUICK_SETUP_CHECKLIST.md
    ├── TEST_LOGIN_ENDPOINT.md
    └── SETUP_FLOWCHART.md (this file)
```

---

## Key Takeaways

1. **MongoDB must be running first** - It's the foundation
2. **Backend must be running** - It handles all API requests
3. **Frontend connects to backend** - It sends login requests
4. **Admin user must exist** - Created by `npm run create-admin`
5. **All three must be running** - MongoDB, Backend, Frontend

---

## Emergency Commands

```bash
# If everything is broken, start fresh:

# 1. Kill all Node processes
taskkill /F /IM node.exe

# 2. Stop MongoDB
Stop-Service MongoDB

# 3. Start MongoDB
Start-Service MongoDB

# 4. Clear npm cache
npm cache clean --force

# 5. Reinstall backend
cd backend
rm -r node_modules package-lock.json
npm install

# 6. Reinstall frontend
cd frontend
rm -r node_modules package-lock.json
npm install

# 7. Run diagnostic
cd backend
npm run diagnose

# 8. Start fresh
npm run dev (in backend)
npm run dev (in frontend)
```

