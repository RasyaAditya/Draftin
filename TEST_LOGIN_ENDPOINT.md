# Test Login Endpoint

## Quick Test Using PowerShell

### Step 1: Make Sure Backend is Running
```bash
cd backend
npm run dev
```

Wait for:
```
✅ MongoDB connected successfully
✅ Server running on http://localhost:5002
```

### Step 2: Test Health Check
```powershell
Invoke-WebRequest -Uri "http://localhost:5002/api/health" -Method GET
```

Expected response:
```
StatusCode        : 200
StatusDescription : OK
Content           : {"status":"Server is running","timestamp":"2024-02-21T..."}
```

### Step 3: Create Admin User (if not exists)
```bash
npm run create-admin
```

### Step 4: Test Login Endpoint

#### Using PowerShell:
```powershell
$body = @{
    email = "admin@draftin.com"
    password = "admin123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5002/api/auth/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

#### Using cURL (if installed):
```bash
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@draftin.com\",\"password\":\"admin123\"}"
```

#### Using Postman:
1. Open Postman
2. Create new POST request
3. URL: `http://localhost:5002/api/auth/login`
4. Headers: `Content-Type: application/json`
5. Body (raw JSON):
```json
{
  "email": "admin@draftin.com",
  "password": "admin123"
}
```
6. Click Send

### Expected Response (Success):
```json
{
  "message": "Login berhasil",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "admin",
    "email": "admin@draftin.com",
    "phone": null,
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcwODUwMDAwMCwiZXhwIjoxNzA4NTg2NDAwfQ...."
}
```

### Expected Response (Error - Wrong Password):
```json
{
  "message": "Password salah"
}
```

### Expected Response (Error - Email Not Found):
```json
{
  "message": "Email tidak ditemukan"
}
```

---

## Test Register Endpoint

### Using PowerShell:
```powershell
$body = @{
    username = "testuser"
    email = "test@example.com"
    password = "password123"
    phone = "08123456789"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5002/api/auth/register" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

### Expected Response (Success):
```json
{
  "message": "Registrasi berhasil",
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "username": "testuser",
    "email": "test@example.com",
    "role": "customer"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Diagnostic Script

Run the diagnostic script to check everything:
```bash
cd backend
npm run diagnose
```

This will check:
- ✅ Environment variables
- ✅ Required files
- ✅ Dependencies installed
- ✅ MongoDB connection
- ✅ Database collections
- ✅ Admin user exists

---

## Common Issues & Solutions

### Issue: "Cannot POST /api/auth/login"
**Cause:** Backend not running or wrong URL
**Solution:** 
1. Make sure backend is running: `npm run dev`
2. Check URL is exactly: `http://localhost:5002/api/auth/login`

### Issue: "ECONNREFUSED"
**Cause:** Backend not running
**Solution:** Start backend with `npm run dev`

### Issue: "Email tidak ditemukan"
**Cause:** User doesn't exist
**Solution:** 
1. Create admin: `npm run create-admin`
2. Or register new user first

### Issue: "Password salah"
**Cause:** Wrong password
**Solution:** Check password is correct (case-sensitive)

### Issue: "MongoDB connection error"
**Cause:** MongoDB not running
**Solution:** Start MongoDB: `Start-Service MongoDB`

---

## Next Steps

Once login works:

1. ✅ Test in frontend by going to `http://localhost:5173`
2. ✅ Click Login button
3. ✅ Enter admin credentials
4. ✅ Should redirect to admin dashboard

