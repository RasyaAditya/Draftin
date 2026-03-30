# Fix Database Connection Issue

## Masalah
Database tidak mau connect ke MongoDB

## Penyebab Umum

### 1. MongoDB Service Tidak Running ⚠️ (PALING SERING)
```powershell
# Check status MongoDB
Get-Service MongoDB

# Jika status: Stopped, jalankan:
Start-Service MongoDB

# Verify sudah running
Get-Service MongoDB | Select-Object Status
```

### 2. MongoDB Belum Terinstall
```powershell
# Check apakah MongoDB terinstall
Get-Command mongosh
# atau
Get-Command mongo
```

Jika tidak ada, install dari: https://www.mongodb.com/try/download/community

### 3. Port MongoDB Sudah Dipakai
```powershell
# Check port 27017
netstat -ano | findstr :27017

# Jika ada, kill process:
taskkill /PID <PID> /F

# Restart MongoDB
Stop-Service MongoDB
Start-Service MongoDB
```

### 4. MongoDB Data Corrupt
```powershell
# Stop MongoDB
Stop-Service MongoDB

# Hapus data lama (HATI-HATI!)
# Windows: C:\Program Files\MongoDB\Server\<version>\data

# Restart MongoDB
Start-Service MongoDB
```

---

## Solusi Cepat (Langkah demi Langkah)

### Step 1: Cek MongoDB Status
```powershell
Get-Service MongoDB
```

**Jika Status = Stopped:**
```powershell
Start-Service MongoDB
```

**Jika Status = Running:**
Lanjut ke Step 2

### Step 2: Cek Koneksi MongoDB
```bash
mongosh
# atau
mongo
```

Jika berhasil, akan muncul prompt `>`. Ketik `exit` untuk keluar.

**Jika error "connection refused":**
- MongoDB service tidak running
- Kembali ke Step 1

### Step 3: Cek .env File
```
backend/.env harus berisi:
MONGO_URL=mongodb://127.0.0.1:27017/DraftinDB
```

### Step 4: Jalankan Backend
```bash
cd backend
npm run dev
```

**Jika berhasil:**
```
✅ MongoDB connected successfully
✅ Server running on http://localhost:5002
```

**Jika error:**
Lihat error message dan lanjut ke troubleshooting

---

## Troubleshooting Berdasarkan Error Message

### Error: "connect ECONNREFUSED 127.0.0.1:27017"
**Penyebab:** MongoDB tidak running

**Solusi:**
```powershell
Start-Service MongoDB
```

### Error: "MongoServerError: connect ECONNREFUSED"
**Penyebab:** MongoDB service tidak berjalan

**Solusi:**
```powershell
# Check status
Get-Service MongoDB

# Start jika stopped
Start-Service MongoDB

# Verify
Get-Service MongoDB | Select-Object Status
```

### Error: "getaddrinfo ENOTFOUND 127.0.0.1"
**Penyebab:** Network issue atau MongoDB tidak accessible

**Solusi:**
```powershell
# Restart MongoDB
Stop-Service MongoDB
Start-Service MongoDB

# Test koneksi
mongosh
```

### Error: "MongoNetworkError: failed to connect to server"
**Penyebab:** MongoDB service crashed atau port conflict

**Solusi:**
```powershell
# Check port 27017
netstat -ano | findstr :27017

# Jika ada process lain, kill:
taskkill /PID <PID> /F

# Restart MongoDB
Stop-Service MongoDB
Start-Service MongoDB
```

---

## Diagnostic Commands

### Check 1: MongoDB Service Status
```powershell
Get-Service MongoDB | Select-Object Name, Status, StartType
```

Expected output:
```
Name    Status StartType
----    ------ ---------
MongoDB Running Automatic
```

### Check 2: MongoDB Connection
```bash
mongosh
```

Expected output:
```
Current Mongosh Log ID: ...
Connecting to: mongodb://127.0.0.1:27017/?directConnection=true
MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

Jika error, MongoDB tidak running.

### Check 3: Port 27017
```powershell
netstat -ano | findstr :27017
```

Expected output:
```
TCP    127.0.0.1:27017        0.0.0.0:0              LISTENING       <PID>
```

### Check 4: Backend Connection
```bash
cd backend
npm run diagnose
```

Akan check semua konfigurasi dan koneksi.

---

## Complete Fix Procedure

### Jika Semua Gagal, Ikuti Ini:

**Step 1: Kill Semua Process**
```powershell
# Kill semua Node process
taskkill /F /IM node.exe

# Stop MongoDB
Stop-Service MongoDB
```

**Step 2: Wait 5 Seconds**
```powershell
Start-Sleep -Seconds 5
```

**Step 3: Start MongoDB**
```powershell
Start-Service MongoDB

# Verify
Get-Service MongoDB | Select-Object Status
```

**Step 4: Test Koneksi**
```bash
mongosh
```

Jika berhasil, ketik `exit`

**Step 5: Start Backend**
```bash
cd backend
npm run dev
```

**Step 6: Check Output**
Harus muncul:
```
✅ MongoDB connected successfully
✅ Server running on http://localhost:5002
```

---

## Jika Masih Tidak Bisa

### Option 1: Reinstall MongoDB
1. Uninstall MongoDB dari Control Panel
2. Download dari: https://www.mongodb.com/try/download/community
3. Install ulang
4. Restart komputer
5. Start MongoDB service

### Option 2: Use MongoDB Atlas (Cloud)
Jika local MongoDB bermasalah, gunakan cloud:

1. Buat akun di: https://www.mongodb.com/cloud/atlas
2. Buat cluster gratis
3. Dapatkan connection string
4. Update `.env`:
```
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/DraftinDB
```
5. Restart backend

### Option 3: Use Docker
Jika tidak mau install MongoDB:

```bash
# Install Docker dari: https://www.docker.com/products/docker-desktop

# Run MongoDB di Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Verify
docker ps
```

---

## Verification Checklist

- [ ] MongoDB service running: `Get-Service MongoDB`
- [ ] Can connect to MongoDB: `mongosh`
- [ ] Port 27017 listening: `netstat -ano | findstr :27017`
- [ ] .env file correct: `MONGO_URL=mongodb://127.0.0.1:27017/DraftinDB`
- [ ] Backend starts: `npm run dev`
- [ ] See "✅ MongoDB connected successfully"
- [ ] Health check works: `http://localhost:5002/api/health`

---

## Quick Commands

```powershell
# Check MongoDB status
Get-Service MongoDB

# Start MongoDB
Start-Service MongoDB

# Stop MongoDB
Stop-Service MongoDB

# Restart MongoDB
Restart-Service MongoDB

# Check port 27017
netstat -ano | findstr :27017

# Test MongoDB connection
mongosh

# Run diagnostic
npm run diagnose
```

---

## Important Information

- **MongoDB Default Port:** 27017
- **MongoDB Default Host:** 127.0.0.1 (localhost)
- **Database Name:** DraftinDB
- **Connection String:** mongodb://127.0.0.1:27017/DraftinDB

---

## Next Steps

1. Follow "Complete Fix Procedure" di atas
2. Verify semua checklist
3. Start backend: `npm run dev`
4. Test login: http://localhost:5173

