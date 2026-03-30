# 🚀 Deploy ke Hostinger Paket Biasa (Tanpa Node.js Support)

## 🎯 Solusi: Hybrid Deployment (GRATIS!)

Karena Hostinger paket biasa tidak support Node.js, kita akan split deployment:

- **Frontend** → Hostinger (paket biasa kamu)
- **Backend** → Railway/Render (GRATIS!)
- **Database** → MongoDB Atlas (GRATIS!)

**Total Biaya: Rp 0 (GRATIS!)** untuk backend & database! 🎉

---

## 📋 Arsitektur Deployment

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Customer Browser                                           │
│                                                             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (Hostinger Shared Hosting)                        │
│  - HTML, CSS, JavaScript                                    │
│  - Vue.js (compiled to static files)                        │
│  - Domain: https://domainmu.com                             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ API Calls
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND (Railway.app - GRATIS!)                            │
│  - Node.js + Express                                        │
│  - API Endpoints                                            │
│  - URL: https://draftin-backend.up.railway.app              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ Database Queries
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  DATABASE (MongoDB Atlas - GRATIS!)                         │
│  - MongoDB Cloud                                            │
│  - 512MB Storage                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 PART 1: Deploy Backend ke Railway (GRATIS!)

### Step 1: Buat Akun Railway

1. Buka: https://railway.app/
2. Klik **"Start a New Project"** atau **"Login"**
3. Login dengan **GitHub** (recommended)
4. Authorize Railway untuk akses GitHub

### Step 2: Deploy Backend

1. **Klik "New Project"**
2. Pilih **"Deploy from GitHub repo"**
3. Pilih repository: **Backend-Draftin** atau **Backend-Draftin-Clean**
4. Klik **"Deploy Now"**

Railway akan otomatis:
- Detect Node.js
- Install dependencies
- Start aplikasi

### Step 3: Setup Environment Variables

1. **Klik project yang baru dibuat**
2. Klik tab **"Variables"**
3. Tambahkan environment variables:

```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/DraftinDB
JWT_SECRET=rahasia_super_aman
MIDTRANS_IS_PRODUCTION=true
MIDTRANS_SERVER_KEY=YOUR_MIDTRANS_SERVER_KEY
MIDTRANS_CLIENT_KEY=YOUR_MIDTRANS_CLIENT_KEY
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
PORT=5002
```

4. Klik **"Add"** untuk setiap variable

### Step 4: Get Backend URL

1. Klik tab **"Settings"**
2. Scroll ke **"Domains"**
3. Klik **"Generate Domain"**
4. Copy URL yang muncul, contoh:
   ```
   https://draftin-backend-production.up.railway.app
   ```
5. **SIMPAN URL INI!** Akan dipakai di frontend

### Step 5: Test Backend

Buka di browser:
```
https://draftin-backend-production.up.railway.app/api/health
```

Harus muncul response JSON.

---

## 💾 PART 2: Setup MongoDB Atlas (GRATIS!)

### Step 1: Buat Akun MongoDB Atlas

1. Buka: https://www.mongodb.com/cloud/atlas/register
2. Daftar dengan email atau Google
3. Pilih **"Free"** tier

### Step 2: Buat Cluster

1. Klik **"Build a Database"**
2. Pilih **"FREE"** (M0 Sandbox)
3. Pilih region: **Singapore** atau **Jakarta** (terdekat)
4. Cluster Name: `Cluster0` (default)
5. Klik **"Create"**

### Step 3: Setup Database User

1. Akan muncul popup **"Security Quickstart"**
2. **Username**: `draftin_user`
3. **Password**: Klik **"Autogenerate Secure Password"**
4. **COPY PASSWORD INI!** Simpan di notepad
5. Klik **"Create User"**

### Step 4: Setup Network Access

1. Di popup yang sama, bagian **"Where would you like to connect from?"**
2. Pilih **"My Local Environment"**
3. Klik **"Add My Current IP Address"**
4. **PENTING:** Tambahkan juga `0.0.0.0/0` untuk allow dari mana saja:
   - Klik **"Add IP Address"**
   - IP Address: `0.0.0.0/0`
   - Description: `Allow from anywhere`
   - Klik **"Add Entry"**
5. Klik **"Finish and Close"**

### Step 5: Get Connection String

1. Klik **"Connect"** pada cluster
2. Pilih **"Connect your application"**
3. Driver: **Node.js**
4. Version: **4.1 or later**
5. Copy connection string:
   ```
   mongodb+srv://draftin_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Ganti `<password>`** dengan password yang tadi di-copy
7. **Tambahkan `/DraftinDB`** sebelum `?`:
   ```
   mongodb+srv://draftin_user:PASSWORD123@cluster0.xxxxx.mongodb.net/DraftinDB?retryWrites=true&w=majority
   ```
8. **SIMPAN CONNECTION STRING INI!**

### Step 6: Update Railway Environment

1. Kembali ke Railway dashboard
2. Klik project backend
3. Klik tab **"Variables"**
4. Edit variable **`MONGO_URL`**
5. Paste connection string MongoDB Atlas
6. Klik **"Save"**
7. Railway akan auto-restart backend

---

## 🎨 PART 3: Deploy Frontend ke Hostinger

### Step 1: Update API URL di Frontend

1. **Buka project frontend di VS Code**

2. **Cari semua file yang pakai API URL**
   - Tekan Ctrl + Shift + F
   - Search: `http://localhost:5002`
   - Akan muncul semua file yang pakai localhost

3. **Ganti dengan Railway URL**
   
   Contoh di `frontend/src/views/Login.vue`:
   ```javascript
   // SEBELUM:
   const response = await fetch('http://localhost:5002/api/auth/login', {
   
   // SESUDAH:
   const response = await fetch('https://draftin-backend-production.up.railway.app/api/auth/login', {
   ```

4. **Atau buat environment variable (RECOMMENDED)**
   
   Buat file `frontend/.env.production`:
   ```env
   VITE_API_URL=https://draftin-backend-production.up.railway.app
   ```
   
   Lalu di code:
   ```javascript
   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002'
   
   const response = await fetch(`${API_URL}/api/auth/login`, {
   ```

### Step 2: Build Frontend

1. **Buka terminal di folder frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Tunggu proses build selesai**
   - Akan muncul folder `dist/`
   - Folder ini berisi file static (HTML, CSS, JS)

### Step 3: Upload ke Hostinger

#### Opsi A: Via File Manager (Mudah)

1. **Login ke hPanel Hostinger**
   - Buka: https://hpanel.hostinger.com
   - Login dengan akun kamu

2. **Buka File Manager**
   - Klik website/domain kamu
   - Klik **"File Manager"**

3. **Navigate ke public_html**
   - Klik folder `public_html`
   - Ini adalah root folder website kamu

4. **Hapus file default (jika ada)**
   - Hapus `index.html` default dari Hostinger
   - Hapus file lain yang tidak perlu

5. **Upload file dari folder dist**
   - Klik **"Upload Files"**
   - Pilih **SEMUA FILE** dari folder `frontend/dist/`
   - **JANGAN upload folder dist-nya, tapi isi folder dist!**
   - Upload semua file dan folder di dalam dist

6. **Struktur akhir di public_html:**
   ```
   public_html/
   ├── index.html
   ├── assets/
   │   ├── index-xxx.js
   │   ├── index-xxx.css
   │   └── ...
   ├── favicon.ico
   └── ...
   ```

#### Opsi B: Via FTP (Lebih Cepat)

1. **Get FTP Credentials**
   - Di hPanel, cari **"FTP Accounts"**
   - Copy hostname, username, password

2. **Download FileZilla**
   - https://filezilla-project.org/

3. **Connect via FTP**
   - Host: `ftp.domainmu.com`
   - Username: dari hPanel
   - Password: dari hPanel
   - Port: 21

4. **Upload folder dist**
   - Navigate ke `public_html`
   - Drag & drop semua file dari `frontend/dist/`

### Step 4: Setup .htaccess untuk Vue Router

Karena Vue pakai client-side routing, perlu setup .htaccess:

1. **Buat file `.htaccess` di public_html**
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

2. **Save file**

### Step 5: Update CORS di Backend

Backend perlu allow request dari domain Hostinger:

1. **Buka Railway dashboard**
2. **Klik project backend**
3. **Klik tab "Variables"**
4. **Tambah variable baru:**
   ```
   FRONTEND_URL=https://domainmu.com
   ```

5. **Update code backend** (jika belum):
   
   Di `backend/index.js`:
   ```javascript
   app.use(cors({
     origin: [
       process.env.FRONTEND_URL,
       'http://localhost:5173', // untuk development
       'https://domainmu.com',
       'https://www.domainmu.com'
     ],
     credentials: true
   }));
   ```

6. **Commit & push ke GitHub**
   ```bash
   git add .
   git commit -m "Update CORS for production"
   git push
   ```

7. **Railway akan auto-deploy ulang**

---

## ✅ PART 4: Testing

### Test 1: Backend

```
https://draftin-backend-production.up.railway.app/api/health
```
Harus return JSON.

### Test 2: Frontend

```
https://domainmu.com
```
Harus muncul website.

### Test 3: Login

1. Buka website
2. Klik Login
3. Masukkan credentials
4. Harus bisa login

### Test 4: Checkout

1. Tambah produk ke cart
2. Checkout
3. Popup Midtrans harus muncul
4. Test pembayaran

---

## 💰 Biaya Total

| Service | Biaya | Limit |
|---------|-------|-------|
| **Hostinger Shared** | ~Rp 20.000/bulan | Yang kamu sudah punya |
| **Railway** | **GRATIS** | 500 jam/bulan, 512MB RAM |
| **MongoDB Atlas** | **GRATIS** | 512MB storage |
| **SSL Certificate** | **GRATIS** | Auto dari Hostinger & Railway |

**Total: Rp 20.000/bulan** (hanya Hostinger yang kamu sudah bayar!)

---

## 🔧 Troubleshooting

### Frontend tidak bisa connect ke backend

**Cek:**
1. API URL di frontend sudah benar?
2. CORS di backend sudah allow domain frontend?
3. Railway backend masih running?

**Solusi:**
- Buka browser console (F12)
- Lihat error message
- Fix sesuai error

### Railway backend crash

**Cek:**
1. Railway dashboard → Logs
2. Lihat error message
3. Biasanya karena environment variable salah

**Solusi:**
- Fix environment variables
- Redeploy

### MongoDB connection error

**Cek:**
1. Connection string benar?
2. Password benar?
3. IP whitelist `0.0.0.0/0` sudah ditambah?

**Solusi:**
- Cek MongoDB Atlas dashboard
- Test connection string

---

## 📝 Checklist Deployment

- [ ] Backend di-push ke GitHub
- [ ] Railway account dibuat
- [ ] Backend di-deploy ke Railway
- [ ] Environment variables di-set di Railway
- [ ] Railway backend URL di-copy
- [ ] MongoDB Atlas cluster dibuat
- [ ] MongoDB connection string di-copy
- [ ] MongoDB connection string di-set di Railway
- [ ] Frontend API URL di-update
- [ ] Frontend di-build: `npm run build`
- [ ] Folder `dist` di-upload ke Hostinger public_html
- [ ] File `.htaccess` dibuat
- [ ] CORS di backend di-update
- [ ] Test backend URL
- [ ] Test frontend URL
- [ ] Test login
- [ ] Test checkout

---

## 🎯 Next Steps

Setelah semua jalan:

1. ✅ Monitor Railway dashboard untuk usage
2. ✅ Monitor MongoDB Atlas untuk storage
3. ✅ Backup database secara berkala
4. ✅ Update code via GitHub (Railway auto-deploy)
5. ✅ Monitor Midtrans dashboard untuk transaksi

---

**Selamat! Website kamu sudah LIVE! 🎉**

Dengan setup ini, kamu bisa hosting full-stack app tanpa upgrade paket Hostinger!

