# Deployment Guide untuk Hostinger (Non-Node.js)

## Solusi: Hybrid Deployment

Karena Hostinger tidak support Node.js, kita akan:
- **Frontend** → Deploy ke Hostinger (static files)
- **Backend** → Deploy ke Railway/Render (free tier)
- **Database** → MongoDB Atlas (cloud)

---

## STEP 1: Setup MongoDB Atlas (Cloud Database)

### 1.1 Buat Account MongoDB Atlas
1. Buka https://www.mongodb.com/cloud/atlas
2. Klik "Sign Up"
3. Daftar dengan email Anda
4. Verify email

### 1.2 Buat Cluster
1. Klik "Create" → "Build a Cluster"
2. Pilih "Free" tier
3. Pilih region terdekat (Singapore atau Asia)
4. Klik "Create Cluster"
5. Tunggu ~5 menit sampai cluster siap

### 1.3 Setup Database User
1. Di sidebar, klik "Database Access"
2. Klik "Add New Database User"
3. Username: `draftin_user`
4. Password: `GenerateSecurePassword123!`
5. Klik "Add User"

### 1.4 Setup Network Access
1. Di sidebar, klik "Network Access"
2. Klik "Add IP Address"
3. Pilih "Allow Access from Anywhere" (0.0.0.0/0)
4. Klik "Confirm"

### 1.5 Get Connection String
1. Klik "Clusters" → "Connect"
2. Pilih "Connect your application"
3. Copy connection string
4. Replace `<password>` dengan password yang dibuat
5. Replace `myFirstDatabase` dengan `DraftinDB`

**Connection String Format:**
```
mongodb+srv://draftin_user:GenerateSecurePassword123!@cluster0.xxxxx.mongodb.net/DraftinDB?retryWrites=true&w=majority
```

---

## STEP 2: Deploy Backend ke Railway

### 2.1 Persiapan Backend

**Update backend/.env:**
```env
PORT=3000
MONGO_URL=mongodb+srv://draftin_user:GenerateSecurePassword123!@cluster0.xxxxx.mongodb.net/DraftinDB?retryWrites=true&w=majority
JWT_SECRET=rahasia_super_aman_production
NODE_ENV=production
```

**Update backend/index.js CORS:**
```javascript
app.use(cors({
  origin: ['https://yourdomain.com', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 2.2 Deploy ke Railway

1. **Buat Account Railway**
   - Buka https://railway.app
   - Klik "Start Project"
   - Login dengan GitHub

2. **Connect Repository**
   - Klik "Deploy from GitHub"
   - Authorize Railway
   - Pilih repository Anda

3. **Setup Environment Variables**
   - Di Railway dashboard, klik project
   - Klik "Variables"
   - Tambahkan:
     - `MONGO_URL`: (dari MongoDB Atlas)
     - `JWT_SECRET`: (secure password)
     - `NODE_ENV`: `production`

4. **Deploy**
   - Railway akan auto-deploy
   - Tunggu sampai "Deployment Successful"
   - Copy domain yang diberikan (misal: `https://draftin-api.railway.app`)

### 2.3 Test Backend
```bash
curl https://draftin-api.railway.app/api/health
```

Expected response:
```json
{"status": "Server is running"}
```

---

## STEP 3: Build Frontend untuk Production

### 3.1 Build Frontend
```bash
cd frontend
npm run build
```

Output akan di folder `frontend/dist/`

### 3.2 Update API URL

**Edit frontend/.env.production:**
```
VITE_API_URL=https://draftin-api.railway.app
```

**Update frontend/src/views/Login.vue:**
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'https://draftin-api.railway.app'

const handleLogin = async () => {
  // ...
  const response = await fetch(`${API_URL}/api/auth/login`, {
    // ...
  })
}
```

Lakukan untuk semua file yang menggunakan fetch ke backend.

### 3.3 Build Ulang
```bash
npm run build
```

---

## STEP 4: Upload Frontend ke Hostinger

### 4.1 Login ke Hostinger
1. Buka https://hpanel.hostinger.com
2. Login dengan akun Anda

### 4.2 Upload Files
1. Klik "File Manager"
2. Buka folder `public_html`
3. Delete semua file yang ada
4. Upload semua file dari `frontend/dist/`

**Cara Upload:**
- Klik "Upload"
- Pilih semua file dari `dist/`
- Atau gunakan FTP client (FileZilla)

### 4.3 Setup .htaccess (untuk Vue Router)

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

### 4.4 Test Website
Buka https://yourdomain.com

---

## STEP 5: Update CORS di Backend

Setelah frontend di-deploy, update CORS di backend:

**backend/index.js:**
```javascript
app.use(cors({
  origin: [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

Push ke GitHub, Railway akan auto-deploy.

---

## STEP 6: Create Admin User

Buka terminal dan jalankan:
```bash
cd backend
npm run create-admin
```

Atau gunakan MongoDB Atlas UI untuk insert user manual.

---

## Testing Production

### Test Login
1. Buka https://yourdomain.com/login
2. Login dengan:
   - Email: `admin@draftin.com`
   - Password: `admin123`

### Test API
```bash
curl -X POST https://draftin-api.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@draftin.com",
    "password": "admin123"
  }'
```

---

## Troubleshooting

### CORS Error
- Update CORS di backend dengan domain Hostinger
- Push ke GitHub
- Railway akan auto-deploy

### Database Connection Error
- Verify MongoDB Atlas connection string
- Check IP whitelist di MongoDB Atlas
- Ensure credentials are correct

### Frontend Not Loading
- Check if files uploaded correctly
- Verify .htaccess is in public_html
- Check browser console for errors

### API Not Responding
- Check Railway deployment status
- Verify environment variables
- Check backend logs di Railway dashboard

---

## Cost Summary

| Service | Cost | Notes |
|---------|------|-------|
| Hostinger | Paid | Frontend hosting |
| Railway | Free | Backend (up to 5GB/month) |
| MongoDB Atlas | Free | Database (up to 512MB) |
| **Total** | **Paid** | Only Hostinger cost |

---

## Alternative Backend Hosting (Free)

Jika Railway tidak cocok, bisa gunakan:

### Render.com
1. Buka https://render.com
2. Klik "New +" → "Web Service"
3. Connect GitHub
4. Deploy

### Vercel
1. Buka https://vercel.com
2. Import project
3. Deploy

### Heroku (Paid, tapi bisa trial)
1. Buka https://heroku.com
2. Create app
3. Deploy

---

## Production Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Network access configured
- [ ] Backend deployed to Railway
- [ ] Environment variables set
- [ ] Frontend built for production
- [ ] Frontend uploaded to Hostinger
- [ ] .htaccess configured
- [ ] CORS updated with production domain
- [ ] Admin user created
- [ ] Login tested
- [ ] API endpoints tested
- [ ] Domain SSL certificate active

---

## Next Steps

1. Setup Midtrans for payment
2. Configure email notifications
3. Setup monitoring/alerts
4. Backup database regularly
5. Monitor API usage
6. Optimize frontend performance
