# 🔐 Panduan Setup Midtrans untuk Project DRAFTin

## 📋 Daftar Isi
1. [Dapatkan API Keys dari Midtrans](#1-dapatkan-api-keys-dari-midtrans)
2. [Konfigurasi Backend](#2-konfigurasi-backend)
3. [Testing dengan Sandbox](#3-testing-dengan-sandbox)
4. [Deploy ke Production](#4-deploy-ke-production)
5. [Setup Webhook (Opsional)](#5-setup-webhook-opsional)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Dapatkan API Keys dari Midtrans

### A. Login ke Dashboard Midtrans
1. Buka https://dashboard.midtrans.com/
2. Login dengan akun yang sudah Anda buat
3. Verifikasi email jika belum

### B. Dapatkan Sandbox Keys (untuk Testing)
1. Di dashboard, klik menu **Settings** → **Access Keys**
2. Pilih tab **Sandbox**
3. Copy kedua keys ini:
   ```
   Server Key: SB-Mid-server-xxxxxxxxxxxxxxxxx
   Client Key: SB-Mid-client-xxxxxxxxxxxxxxxxx
   ```

### C. Dapatkan Production Keys (untuk Live)
1. Di dashboard, klik menu **Settings** → **Access Keys**
2. Pilih tab **Production**
3. **PENTING**: Production keys hanya muncul setelah akun Anda diverifikasi oleh Midtrans
4. Copy kedua keys ini:
   ```
   Server Key: Mid-server-xxxxxxxxxxxxxxxxx
   Client Key: Mid-client-xxxxxxxxxxxxxxxxx
   ```

---

## 2. Konfigurasi Backend

### A. Update File `.env`

Buka file `backend/.env` dan update dengan keys Anda:

**Untuk Testing (Sandbox):**
```env
# Midtrans Configuration
MIDTRANS_IS_PRODUCTION=false

# Sandbox Keys
MIDTRANS_SERVER_KEY=SB-Mid-server-YOUR_SANDBOX_SERVER_KEY
MIDTRANS_CLIENT_KEY=SB-Mid-client-YOUR_SANDBOX_CLIENT_KEY
```

**Untuk Production (Live):**
```env
# Midtrans Configuration
MIDTRANS_IS_PRODUCTION=true

# Production Keys
MIDTRANS_SERVER_KEY=Mid-server-YOUR_PRODUCTION_SERVER_KEY
MIDTRANS_CLIENT_KEY=Mid-client-YOUR_PRODUCTION_CLIENT_KEY
```

### B. Restart Backend Server

Setelah update `.env`, restart backend server:
```bash
cd backend
npm start
```

---

## 3. Testing dengan Sandbox

### A. Test Cards untuk Sandbox

Midtrans menyediakan test cards untuk testing di Sandbox:

**✅ Successful Payment:**
- Card Number: `4811 1111 1111 1114`
- CVV: `123`
- Exp Date: `01/25` (atau bulan/tahun di masa depan)

**❌ Failed Payment:**
- Card Number: `4911 1111 1111 1113`
- CVV: `123`
- Exp Date: `01/25`

**⏳ Pending Payment:**
- Card Number: `4611 1111 1111 1112`
- CVV: `123`
- Exp Date: `01/25`

### B. Test E-Wallets (Sandbox)

Untuk testing e-wallet di Sandbox:
- **GoPay**: Akan muncul simulasi pembayaran
- **ShopeePay**: Akan muncul simulasi pembayaran
- **QRIS**: Akan generate QR code simulasi

### C. Cara Testing

1. Buat order di aplikasi Anda
2. Pilih metode pembayaran
3. Gunakan test card di atas
4. Cek status pembayaran di dashboard Midtrans Sandbox

---

## 4. Deploy ke Production

### A. Persiapan

Sebelum deploy ke production, pastikan:

1. ✅ Akun Midtrans sudah diverifikasi
2. ✅ Sudah testing lengkap di Sandbox
3. ✅ Sudah setup webhook (lihat bagian 5)
4. ✅ Sudah backup database

### B. Update Konfigurasi

1. Update `backend/.env`:
   ```env
   MIDTRANS_IS_PRODUCTION=true
   MIDTRANS_SERVER_KEY=Mid-server-YOUR_PRODUCTION_SERVER_KEY
   MIDTRANS_CLIENT_KEY=Mid-client-YOUR_PRODUCTION_CLIENT_KEY
   ```

2. Restart server:
   ```bash
   cd backend
   npm start
   ```

### C. Testing Production

1. Lakukan transaksi kecil dengan kartu kredit asli
2. Verifikasi pembayaran masuk ke dashboard Midtrans Production
3. Cek status order di aplikasi Anda

---

## 5. Setup Webhook (Opsional tapi Direkomendasikan)

Webhook memungkinkan Midtrans memberitahu server Anda secara otomatis saat status pembayaran berubah.

### A. Setup di Dashboard Midtrans

1. Login ke dashboard Midtrans
2. Klik **Settings** → **Configuration**
3. Scroll ke bagian **Payment Notification URL**
4. Masukkan URL webhook Anda:
   ```
   https://your-domain.com/api/webhook/midtrans
   ```
   
   **Untuk development lokal**, gunakan ngrok:
   ```bash
   # Install ngrok
   npm install -g ngrok
   
   # Jalankan ngrok
   ngrok http 5002
   
   # Copy URL yang diberikan (contoh: https://abc123.ngrok.io)
   # Masukkan ke Midtrans: https://abc123.ngrok.io/api/webhook/midtrans
   ```

5. Klik **Save**

### B. Webhook Sudah Tersedia di Code

Webhook endpoint sudah tersedia di `backend/index.js`:
```javascript
app.post('/api/webhook/midtrans', async (req, res) => {
  // Handle payment notification
});
```

---

## 6. Troubleshooting

### ❌ Error: "Unauthorized"

**Penyebab**: Server Key atau Client Key salah

**Solusi**:
1. Cek kembali keys di `.env`
2. Pastikan tidak ada spasi di awal/akhir keys
3. Pastikan menggunakan Sandbox keys untuk testing, Production keys untuk live

### ❌ Error: "Transaction not found"

**Penyebab**: Order ID tidak ditemukan di Midtrans

**Solusi**:
1. Cek apakah order berhasil dibuat
2. Cek log di console backend
3. Cek dashboard Midtrans untuk melihat transaksi

### ❌ Payment tidak update otomatis

**Penyebab**: Webhook belum di-setup atau tidak berfungsi

**Solusi**:
1. Setup webhook di dashboard Midtrans
2. Test webhook dengan ngrok untuk development
3. Cek log webhook di dashboard Midtrans

### ❌ Error: "isProduction is not defined"

**Penyebab**: Environment variable `MIDTRANS_IS_PRODUCTION` tidak di-set

**Solusi**:
1. Tambahkan `MIDTRANS_IS_PRODUCTION=false` di `.env`
2. Restart backend server

---

## 📞 Support

Jika ada masalah:
1. Cek dokumentasi Midtrans: https://docs.midtrans.com/
2. Contact support Midtrans: support@midtrans.com
3. Cek status Midtrans: https://status.midtrans.com/

---

## 🔒 Security Tips

1. ❌ **JANGAN** commit file `.env` ke Git
2. ✅ Simpan Production keys dengan aman
3. ✅ Gunakan HTTPS untuk production
4. ✅ Validasi webhook signature (sudah ada di code)
5. ✅ Monitor transaksi secara berkala

---

## 📝 Checklist Setup

- [ ] Dapatkan Sandbox keys dari Midtrans
- [ ] Update `backend/.env` dengan Sandbox keys
- [ ] Set `MIDTRANS_IS_PRODUCTION=false`
- [ ] Restart backend server
- [ ] Test payment dengan test card
- [ ] Verifikasi transaksi di dashboard Midtrans Sandbox
- [ ] Setup webhook (opsional untuk development)
- [ ] Dapatkan Production keys (setelah verifikasi)
- [ ] Update `.env` dengan Production keys
- [ ] Set `MIDTRANS_IS_PRODUCTION=true`
- [ ] Test payment dengan kartu asli
- [ ] Setup webhook untuk production
- [ ] Monitor transaksi

---

**Selamat! Project Anda sudah terhubung dengan Midtran