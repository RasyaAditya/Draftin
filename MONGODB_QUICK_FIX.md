# MongoDB Quick Fix - Solusi Cepat

## ⚡ Langkah 1: Start MongoDB Service (PALING PENTING!)

```powershell
# Buka PowerShell sebagai Administrator
# Kemudian jalankan:

Start-Service MongoDB
```

Tunggu 3-5 detik sampai service fully started.

## ⚡ Langkah 2: Verify MongoDB Running

```powershell
Get-Service MongoDB
```

Harus muncul:
```
Status   Name
------   ----
Running  MongoDB
```

Jika masih "Stopped", coba:
```powershell
# Restart service
Restart-Service MongoDB

# Tunggu 5 detik
Start-Sleep -Seconds 5

# Check lagi
Get-Service MongoDB
```

## ⚡ Langkah 3: Test MongoDB Connection

```bash
mongosh
```

Jika berhasil, akan muncul prompt `>`. Ketik `exit` untuk keluar.

Jika error "connection refused", berarti MongoDB belum fully started. Tunggu 10 detik dan coba lagi.

## ⚡ Langkah 4: Start Backend

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

## 🔴 Jika Masih Error

### Error: "connect ECONNREFUSED"
```powershell
# MongoDB tidak running
Start-Service MongoDB
Start-Sleep -Seconds 5

# Verify
Get-Service MongoDB
```

### Error: "MongoServerError"
```powershell
# Restart MongoDB
Stop-Service MongoDB
Start-Sleep -Seconds 3
Start-Service MongoDB
Start-Sleep -Seconds 5

# Test
mongosh
```

### Error: "Port 27017 already in use"
```powershell
# Check port
netstat -ano | findstr :27017

# Kill process (ganti <PID> dengan nomor yang muncul)
taskkill /PID <PID> /F

# Restart MongoDB
Restart-Service MongoDB
```

---

## 📋 Checklist

- [ ] MongoDB service running: `Get-Service MongoDB` → Status: Running
- [ ] Can connect: `mongosh` → Prompt `>`
- [ ] Port 27017 listening: `netstat -ano | findstr :27017`
- [ ] Backend starts: `npm run dev` → "✅ MongoDB connected"
- [ ] Health check: `http://localhost:5002/api/health` → JSON response

---

## 🚀 Complete Startup (Copy-Paste)

**Terminal 1:**
```powershell
Start-Service MongoDB
Get-Service MongoDB
```

**Terminal 2:**
```bash
cd backend
npm run dev
```

**Terminal 3:**
```bash
cd backend
npm run create-admin
```

**Terminal 4:**
```bash
cd frontend
npm run dev
```

**Browser:**
```
http://localhost:5173
Login: admin@draftin.com / admin123
```

---

## 💡 Tips

1. **Jangan close terminal** - Biarkan backend dan frontend running
2. **MongoDB harus running dulu** - Sebelum start backend
3. **Tunggu 5 detik** - Setelah start MongoDB service
4. **Check console output** - Lihat error message dengan detail

---

## 🆘 Jika Masih Tidak Bisa

Jalankan diagnostic:
```bash
cd backend
npm run diagnose
```

Ini akan check:
- ✅ Environment variables
- ✅ MongoDB connection
- ✅ Database collections
- ✅ Admin user
- ✅ Dependencies

Lihat output dan report error-nya.

