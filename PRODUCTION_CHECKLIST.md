# ✅ Production Checklist - Midtrans Live Payment

## 🔴 PENTING: Pembayaran Sekarang Menggunakan Uang Asli!

Konfigurasi Midtrans Anda sekarang dalam **PRODUCTION MODE**. Semua transaksi akan menggunakan uang asli.

---

## 📋 Konfigurasi Saat Ini

```
Environment: PRODUCTION (LIVE)
Server Key: YOUR_MIDTRANS_SERVER_KEY
Client Key: YOUR_MIDTRANS_CLIENT_KEY
```

---

## 🚀 Langkah Selanjutnya

### 1. Restart Backend Server

Setelah update `.env`, restart backend:

```bash
cd backend
npm start
```

Pastikan di console muncul:
```
✅ Server running on http://localhost:5002
```

### 2. Test Transaksi Kecil

Sebelum go-live penuh, lakukan test dengan transaksi kecil:

1. Buat order dengan produk murah (Rp 1.000 - Rp 10.000)
2. Gunakan kartu kredit/debit asli Anda
3. Selesaikan pembayaran
4. Verifikasi:
   - ✅ Pembayaran masuk ke dashboard Midtrans
   - ✅ Status order berubah di aplikasi
   - ✅ Notifikasi diterima (jika ada)

### 3. Setup Webhook (WAJIB untuk Production)

Webhook memastikan status pembayaran update otomatis.

#### A. Untuk Development (Localhost)

Gunakan ngrok untuk expose localhost:

```bash
# Install ngrok (jika belum)
npm install -g ngrok

# Jalankan ngrok
ngrok http 5002

# Copy URL yang diberikan (contoh: https://abc123.ngrok-free.app)
```

#### B. Setup di Dashboard Midtrans

1. Login ke https://dashboard.midtrans.com/
2. Klik **Settings** → **Configuration**
3. Scroll ke **Payment Notification URL**
4. Masukkan URL webhook:
   - **Development**: `https://your-ngrok-url.ngrok-free.app/api/webhook/midtrans`
   - **Production**: `https://your-domain.com/api/webhook/midtrans`
5. Klik **Save**

### 4. Monitor Transaksi

Pantau transaksi di dashboard Midtrans:
- https://dashboard.midtrans.com/transactions

---

## 🔒 Security Checklist

- [x] Production keys sudah di-set
- [x] `MIDTRANS_IS_PRODUCTION=true`
- [ ] Webhook sudah di-setup
- [ ] HTTPS enabled (untuk production domain)
- [ ] File `.env` tidak di-commit ke Git
- [ ] Backup database dilakukan secara berkala

---

## 💳 Metode Pembayaran yang Tersedia

Dengan Production mode, customer bisa bayar dengan:

1. **Kartu Kredit/Debit**
   - Visa
   - Mastercard
   - JCB
   - Amex

2. **E-Wallet**
   - GoPay
   - ShopeePay
   - QRIS

3. **Bank Transfer**
   - BCA
   - Mandiri
   - BNI
   - BRI
   - Permata

4. **Convenience Store**
   - Indomaret
   - Alfamart

---

## 🔄 Kembali ke Sandbox Mode

Jika ingin kembali ke testing mode, update `backend/.env`:

```env
# Ganti ke Sandbox
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_SERVER_KEY=SB-Mid-server-YOUR_SANDBOX_KEY
MIDTRANS_CLIENT_KEY=SB-Mid-client-YOUR_SANDBOX_KEY
```

Lalu restart server.

---

## 📊 Monitoring & Reporting

### Dashboard Midtrans

Monitor transaksi di:
- **Transactions**: Lihat semua transaksi
- **Reports**: Download laporan transaksi
- **Settlement**: Cek settlement ke rekening bank

### Notifikasi Email

Midtrans akan mengirim email untuk:
- Transaksi berhasil
- Transaksi gagal
- Settlement harian

---

## ⚠️ Troubleshooting Production

### Transaksi Gagal

Jika transaksi gagal:
1. Cek dashboard Midtrans untuk error message
2. Cek log backend server
3. Pastikan webhook berfungsi
4. Verifikasi kartu customer valid

### Webhook Tidak Berfungsi

Jika status tidak update otomatis:
1. Cek URL webhook di dashboard Midtrans
2. Test webhook dengan ngrok
3. Cek log di dashboard Midtrans → Settings → Webhook Logs
4. Pastikan endpoint `/api/webhook/midtrans` accessible

### Settlement Delay

Settlement biasanya:
- **Kartu Kredit**: T+2 hari kerja
- **E-Wallet**: T+1 hari kerja
- **Bank Transfer**: T+1 hari kerja

---

## 📞 Support

Jika ada masalah:
- **Email**: support@midtrans.com
- **Phone**: +62 21 2922 0888
- **Docs**: https://docs.midtrans.com/
- **Status**: https://status.midtrans.com/

---

## 🎉 Selamat!

Aplikasi Anda sekarang sudah live dengan Midtrans Production!

**Tips Sukses:**
1. Monitor transaksi secara berkala
2. Respond cepat jika ada customer complaint
3. Backup database secara rutin
4. Update webhook jika ganti domain
5. Jaga kerahasiaan API keys

---

**Last Updated**: ${new Date().toLocaleDateString('id-ID')}
