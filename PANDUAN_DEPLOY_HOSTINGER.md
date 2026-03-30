# Panduan Deploy Web ke Hostinger - Step by Step

Panduan lengkap untuk deploy aplikasi Draftin ke Hostinger dengan mudah.

## Persiapan Sebelum Deploy

### 1. Pastikan Web Berjalan di Local

```bash
# Terminal 1: Start MongoDB
Start-Service MongoDB

# Terminal 2: Start Backend
cd backend
npm run dev

# Terminal 3: Start Frontend  
cd frontend
npm run dev
```

Buka http://localhost:5173 dan pastikan login berfungsi.

### 2. Commit Semua Perubahan ke Git

```bash
git status
git add .
git commit -m "Ready for deployment"
git push origin main
```

## Bagian 1: Deploy Backend ke Railway (Gratis)

Railway adalah platform hosting backend yang gratis dan mudah digunakan.

### Step 1: Daftar Railway

1. Buka https://railway.app
2. Klik "Start a New Project"
3. Login dengan GitHub

### Step 2: Deploy Backend

1. Klik "New Project"
2. Pilih "Deploy from GitHub repo"
3. Pilih repository Draftin Anda
4. Railway akan otomatis detect Node.js project

### Step 3: Setup Environment Variables

Di Railway dashboard, klik tab "Variables" dan tambahkan:

```
PORT=5002
MONGO_URL=<URL_MONGODB_ANDA>
JWT_SECRET=<SECRET_KEY_ANDA>
MIDTRANS_SERVER_KEY=<MIDTRANS_KEY>
MIDTRANS_CLIENT_KEY=<MIDTRANS_CLIENT_KEY>
MIDTRANS_IS_PRODUCTION=false
```

**Untuk MongoDB**, Anda punya 2 pilihan:

**Opsi A: MongoDB Atlas (Gratis, Recommended)**
1. Buka https://www.mongodb.com/cloud/atlas
2. Daftar akun gratis
3. Buat cluster baru (pilih Free tier)
4. Klik "Connect" → "Connect your application"
5. Copy connection string
6. Ganti `<password>` dengan password Anda
7. Ganti `myFirstDatabase` dengan `DraftinDB`

**Opsi B: Railway MongoDB (Gratis)**
1. Di Railway, klik "New" → "Database" → "Add MongoDB"
2. Copy `MONGO_URL` dari Variables tab
3. Paste ke environment variables backend

### Step 4: Deploy

1. Railway akan otomatis deploy setelah Anda push ke GitHub
2. Tunggu sampai status "Deployed"
3. Copy URL backend (contoh: `https://draftin-backend.up.railway.app`)

### Step 5: Test Backend

Buka di browser:
```
https://your-backend-url.railway.app/api/health
```

Harus muncul: `{"status":"ok"}`

## Bagian 2: Deploy Frontend ke Hostinger

### Step 1: Build Frontend untuk Production

```bash
cd frontend
npm run build
```

Ini akan create folder `dist/` dengan file production-ready.

### Step 2: Update Backend URL di Frontend

Edit `frontend/src/main.ts` atau file konfigurasi API:

```javascript
// Ganti localhost dengan Railway URL
const API_URL = 'https://your-backend-url.railway.app';
```

Build ulang:
```bash
npm run build
```

### Step 3: Upload ke Hostinger

1. Login ke Hostinger control panel
2. Pilih hosting Anda
3. Klik "File Manager"
4. Masuk ke folder `public_html/`
5. Hapus semua file default di dalamnya
6. Upload semua file dari folder `frontend/dist/`
7. Pastikan struktur seperti ini:
   ```
   public_html/
   ├── index.html
   ├── assets/
   │   ├── index-xxx.js
   │   └── index-xxx.css
   └── vite.svg
   ```

### Step 4: Setup .htaccess untuk Vue Router

Buat file `.htaccess` di `public_html/`:

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

## Bagian 3: Testing Production

### Test 1: Buka Website

Buka domain Hostinger Anda (contoh: `https://yourdomain.com`)

### Test 2: Test Login

1. Klik tombol Login
2. Masukkan:
   - Email: admin@draftin.com
   - Password: admin123
3. Harus berhasil login dan redirect ke dashboard

### Test 3: Test Payment (Midtrans)

1. Tambah produk ke cart
2. Checkout
3. Pilih metode pembayaran
4. Test dengan kartu test Midtrans:
   - Card Number: 4811 1111 1111 1114
   - CVV: 123
   - Exp: 01/25

## Troubleshooting

### Error: "Cannot connect to backend"

**Solusi:**
1. Cek Railway backend masih running
2. Cek URL backend di frontend sudah benar
3. Cek CORS settings di backend:
   ```javascript
   // backend/index.js
   app.use(cors({
     origin: ['https://yourdomain.com', 'http://localhost:5173'],
     credentials: true
   }));
   ```

### Error: "MongoDB connection failed"

**Solusi:**
1. Cek MongoDB Atlas/Railway masih running
2. Cek MONGO_URL di Railway environment variables
3. Pastikan IP Railway sudah di-whitelist di MongoDB Atlas:
   - MongoDB Atlas → Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)

### Error: "Payment not working"

**Solusi:**
1. Cek Midtrans keys di Railway environment variables
2. Pastikan `MIDTRANS_IS_PRODUCTION=false` untuk testing
3. Cek Midtrans dashboard untuk error logs

### Frontend tidak load CSS/JS

**Solusi:**
1. Cek file `index.html` di Hostinger
2. Pastikan path ke assets benar (relative path)
3. Edit `vite.config.ts`:
   ```typescript
   export default defineConfig({
     base: '/', // Pastikan ini '/' bukan '/subfolder/'
   })
   ```
4. Build ulang dan upload lagi

## Maintenance

### Update Backend

```bash
git add .
git commit -m "Update backend"
git push origin main
```

Railway akan otomatis deploy ulang.

### Update Frontend

```bash
cd frontend
npm run build
```

Upload file dari `dist/` ke Hostinger via File Manager.

### Backup Database

**MongoDB Atlas:**
1. Dashboard → Clusters → ... → Create Backup
2. Download backup file

**Railway MongoDB:**
1. Install MongoDB Compass
2. Connect dengan Railway MONGO_URL
3. Export database

## Checklist Deploy

- [ ] Backend running di Railway
- [ ] MongoDB connected (Atlas atau Railway)
- [ ] Environment variables configured
- [ ] Backend health check OK
- [ ] Frontend built dengan production URL
- [ ] Frontend uploaded ke Hostinger
- [ ] .htaccess configured
- [ ] Website accessible
- [ ] Login working
- [ ] Payment working (test mode)
- [ ] All features tested

## Biaya

- **Railway Backend**: Gratis (500 jam/bulan)
- **MongoDB Atlas**: Gratis (512MB storage)
- **Hostinger**: Sesuai paket hosting Anda

## Support

Jika ada masalah:
1. Cek Railway logs: Dashboard → Deployments → View Logs
2. Cek browser console (F12) untuk frontend errors
3. Cek Hostinger error logs: Control Panel → Error Logs

---

**Selamat! Web Anda sudah live di production! 🎉**
