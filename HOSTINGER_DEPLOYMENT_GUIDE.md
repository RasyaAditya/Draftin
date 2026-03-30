# 🚀 Panduan Deploy Backend DRAFTin ke Hostinger

## Persiapan Sebelum Deploy

### 1. Pastikan Backend Sudah di GitHub
✅ Backend sudah di-push ke: https://github.com/RasyaAditya/Backend-Draftin

### 2. Siapkan Akun Hostinger
- Login ke https://hostinger.com
- Pastikan paket hosting mendukung Node.js (Business/Cloud hosting)
- Jika belum punya, upgrade ke paket yang support Node.js

---

## 📋 Langkah-Langkah Deploy

### Step 1: Setup Node.js di Hostinger

1. **Login ke hPanel Hostinger**
   - Buka https://hpanel.hostinger.com
   - Login dengan akun kamu

2. **Pilih Website yang Akan Digunakan**
   - Klik website/domain yang ingin digunakan
   - Atau buat subdomain baru (misalnya: `api.domainmu.com`)

3. **Aktifkan Node.js**
   - Di hPanel, cari menu **"Advanced"** atau **"Website"**
   - Pilih **"Node.js"** atau **"Application Manager"**
   - Klik **"Create Application"**

### Step 2: Konfigurasi Node.js Application

1. **Isi Form Aplikasi:**
   ```
   Application Name: draftin-backend
   Node.js Version: 18.x atau 20.x (pilih yang terbaru)
   Application Mode: Production
   Application Root: /
   Application URL: api.domainmu.com (atau subdomain pilihan)
   Application Startup File: index.js
   ```

2. **Klik "Create"**

### Step 3: Upload Backend ke Hostinger

**Opsi A: Menggunakan Git (RECOMMENDED)**

1. **Akses SSH/Terminal di Hostinger**
   - Di hPanel, cari menu **"Advanced"** → **"SSH Access"**
   - Enable SSH jika belum aktif
   - Copy SSH credentials

2. **Connect via SSH**
   ```bash
   ssh u123456789@yourdomain.com
   # Ganti dengan SSH credentials dari Hostinger
   ```

3. **Clone Repository**
   ```bash
   cd domains/api.domainmu.com/public_html
   # atau cd ke folder aplikasi Node.js yang dibuat
   
   git clone https://github.com/RasyaAditya/Backend-Draftin.git .
   ```

4. **Install Dependencies**
   ```bash
   npm install
   ```

**Opsi B: Menggunakan File Manager**

1. **Download Backend dari GitHub**
   - Buka https://github.com/RasyaAditya/Backend-Draftin
   - Klik "Code" → "Download ZIP"
   - Extract file ZIP

2. **Upload via File Manager**
   - Di hPanel, buka **"File Manager"**
   - Navigate ke folder aplikasi Node.js
   - Upload semua file backend (kecuali node_modules)
   - Atau gunakan FTP client seperti FileZilla

3. **Install Dependencies via SSH**
   ```bash
   ssh u123456789@yourdomain.com
   cd domains/api.domainmu.com/public_html
   npm install
   ```

### Step 4: Setup Environment Variables

1. **Buat File .env di Server**
   ```bash
   nano .env
   # atau gunakan File Manager di hPanel
   ```

2. **Isi Environment Variables:**
   ```env
   # Database MongoDB
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/draftin?retryWrites=true&w=majority

   # JWT Secret
   JWT_SECRET=your_super_secret_jwt_key_here_change_this

   # Midtrans Payment Gateway
   MIDTRANS_SERVER_KEY=YOUR_MIDTRANS_SERVER_KEY
   MIDTRANS_CLIENT_KEY=YOUR_MIDTRANS_CLIENT_KEY
   MIDTRANS_IS_PRODUCTION=true

   # Server Port (Hostinger biasanya assign otomatis)
   PORT=5002
   ```

3. **Save file** (Ctrl+X, Y, Enter jika pakai nano)

### Step 5: Setup MongoDB Atlas (Database)

Karena Hostinger tidak menyediakan MongoDB, gunakan MongoDB Atlas (GRATIS):

1. **Buat Akun MongoDB Atlas**
   - Buka https://www.mongodb.com/cloud/atlas/register
   - Daftar gratis

2. **Buat Cluster**
   - Pilih "Create a Free Cluster"
   - Pilih region terdekat (Singapore/Jakarta)
   - Klik "Create Cluster"

3. **Setup Database Access**
   - Klik "Database Access" di sidebar
   - Klik "Add New Database User"
   - Username: `draftin_user`
   - Password: Generate secure password (SIMPAN!)
   - Database User Privileges: "Read and write to any database"
   - Klik "Add User"

4. **Setup Network Access**
   - Klik "Network Access" di sidebar
   - Klik "Add IP Address"
   - Pilih "Allow Access from Anywhere" (0.0.0.0/0)
   - Klik "Confirm"

5. **Get Connection String**
   - Klik "Database" di sidebar
   - Klik "Connect" pada cluster kamu
   - Pilih "Connect your application"
   - Copy connection string:
   ```
   mongodb+srv://draftin_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - Ganti `<password>` dengan password yang tadi dibuat
   - Tambahkan nama database: `/draftin` sebelum `?`
   - Hasil akhir:
   ```
   mongodb+srv://draftin_user:password123@cluster0.xxxxx.mongodb.net/draftin?retryWrites=true&w=majority
   ```

6. **Update .env di Hostinger**
   - Paste connection string ke `MONGODB_URI` di file `.env`

### Step 6: Start Aplikasi

1. **Via Node.js Manager di hPanel**
   - Kembali ke Node.js Application Manager
   - Klik aplikasi "draftin-backend"
   - Klik "Start" atau "Restart"

2. **Via SSH (Alternative)**
   ```bash
   npm start
   # atau
   node index.js
   ```

3. **Cek Status**
   - Aplikasi harus running
   - Cek di browser: `https://api.domainmu.com`
   - Seharusnya muncul response dari API

### Step 7: Test API

Test beberapa endpoint:

```bash
# Test health check
curl https://api.domainmu.com

# Test products endpoint
curl https://api.domainmu.com/api/products

# Test auth endpoint
curl -X POST https://api.domainmu.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 🔧 Konfigurasi Tambahan

### Setup PM2 (Process Manager) - RECOMMENDED

PM2 menjaga aplikasi tetap running dan auto-restart jika crash:

1. **Install PM2**
   ```bash
   npm install -g pm2
   ```

2. **Start dengan PM2**
   ```bash
   pm2 start index.js --name draftin-backend
   pm2 save
   pm2 startup
   ```

3. **Monitoring**
   ```bash
   pm2 status
   pm2 logs draftin-backend
   pm2 restart draftin-backend
   ```

### Setup SSL Certificate (HTTPS)

1. **Di hPanel**
   - Cari menu **"SSL"** atau **"Security"**
   - Pilih domain/subdomain API
   - Klik **"Install SSL"**
   - Pilih **"Let's Encrypt"** (GRATIS)
   - Tunggu proses instalasi

2. **Force HTTPS**
   - Aktifkan "Force HTTPS" di pengaturan SSL

### Setup CORS untuk Frontend

Pastikan backend mengizinkan request dari frontend:

```javascript
// Di index.js, tambahkan:
const cors = require('cors');

app.use(cors({
  origin: [
    'https://domainmu.com',
    'https://www.domainmu.com',
    'http://localhost:5173' // untuk development
  ],
  credentials: true
}));
```

---

## 📱 Update Frontend untuk Connect ke Backend

Setelah backend live, update frontend:

1. **Update API URL di Frontend**
   ```javascript
   // Di frontend/src/views/*.vue
   // Ganti semua:
   const API_URL = 'http://localhost:5002'
   
   // Menjadi:
   const API_URL = 'https://api.domainmu.com'
   ```

2. **Atau Buat Environment Variable**
   ```javascript
   // frontend/.env.production
   VITE_API_URL=https://api.domainmu.com
   
   // Di code:
   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002'
   ```

3. **Build Ulang Frontend**
   ```bash
   cd frontend
   npm run build
   ```

4. **Deploy Frontend**
   - Upload folder `dist` ke Hostinger
   - Atau gunakan Vercel/Netlify (GRATIS & MUDAH)

---

## 🐛 Troubleshooting

### Error: "Cannot connect to MongoDB"
- Cek connection string di `.env`
- Pastikan IP Hostinger sudah di-whitelist di MongoDB Atlas
- Cek username/password MongoDB

### Error: "Port already in use"
- Hostinger assign port otomatis
- Hapus `PORT=5002` dari `.env` atau ganti dengan port yang tersedia

### Error: "Module not found"
- Jalankan `npm install` lagi
- Cek `package.json` dan `package-lock.json` sudah ter-upload

### Aplikasi Crash/Restart Terus
- Cek logs: `pm2 logs draftin-backend`
- Cek error di hPanel → Node.js Manager → Logs
- Pastikan semua environment variables sudah benar

### CORS Error di Frontend
- Tambahkan domain frontend ke CORS whitelist
- Pastikan SSL sudah aktif (HTTPS)

---

## 📊 Monitoring & Maintenance

### Cek Logs
```bash
# Via PM2
pm2 logs draftin-backend

# Via SSH
tail -f /path/to/logs/error.log
```

### Update Backend
```bash
# Via SSH
cd /path/to/backend
git pull origin main
npm install
pm2 restart draftin-backend
```

### Backup Database
- MongoDB Atlas otomatis backup
- Download backup via Atlas dashboard jika perlu

---

## 💰 Estimasi Biaya

- **Hostinger Business Hosting**: ~Rp 40.000/bulan
- **MongoDB Atlas Free Tier**: GRATIS (512MB storage)
- **SSL Certificate**: GRATIS (Let's Encrypt)
- **Domain**: ~Rp 150.000/tahun (opsional, bisa pakai subdomain)

**Total: ~Rp 40.000/bulan** 🎉

---

## 🎯 Checklist Deploy

- [ ] Backend di-push ke GitHub
- [ ] Akun Hostinger siap (paket Business/Cloud)
- [ ] Node.js application dibuat di hPanel
- [ ] Backend di-clone/upload ke Hostinger
- [ ] Dependencies di-install (`npm install`)
- [ ] MongoDB Atlas cluster dibuat
- [ ] Database user & network access di-setup
- [ ] File `.env` dibuat dengan credentials yang benar
- [ ] Aplikasi di-start via hPanel atau PM2
- [ ] SSL certificate di-install
- [ ] API di-test dan berfungsi
- [ ] Frontend di-update dengan URL backend baru
- [ ] CORS di-konfigurasi dengan benar

---

## 📞 Bantuan Lebih Lanjut

Jika ada masalah:
1. Cek dokumentasi Hostinger: https://support.hostinger.com
2. Cek logs aplikasi
3. Test endpoint satu per satu
4. Pastikan semua environment variables benar

---

**Good luck dengan deployment! 🚀**

Jika ada error atau pertanyaan, tunjukkan error message-nya dan saya akan bantu troubleshoot!
