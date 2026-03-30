# 🧪 Panduan Testing Pembayaran Midtrans Production

## ✅ Konfigurasi Saat Ini

```
Mode: PRODUCTION (LIVE) - Menggunakan uang asli!
Server Key: YOUR_MIDTRANS_SERVER_KEY
Client Key: YOUR_MIDTRANS_CLIENT_KEY
Webhook: SKIP (Manual check)
```

---

## 🚀 Langkah Testing

### 1. Restart Backend Server

Buka terminal di folder backend:

```bash
cd backend
npm start
```

Pastikan muncul:
```
✅ MongoDB connected successfully
✅ Server running on http://localhost:5002
```

### 2. Jalankan Frontend

Buka terminal baru di folder frontend:

```bash
cd frontend
npm run dev
```

Pastikan muncul:
```
  ➜  Local:   http://localhost:5173/
```

### 3. Buka Aplikasi

Buka browser, akses: **http://localhost:5173/**

---

## 🛒 Test Flow Pembayaran

### A. Login sebagai Customer

1. Buka aplikasi di browser
2. Login dengan akun customer (bukan admin)
3. Atau register akun baru

### B. Tambah Produk ke Cart

1. Browse produk yang tersedia
2. Klik produk yang mau dibeli
3. Klik "Add to Cart" atau "Tambah ke Keranjang"
4. Ulangi untuk produk lain jika mau

### C. Checkout

1. Klik icon Cart (keranjang) di header
2. Review produk di cart
3. Klik "Checkout" atau "Bayar"
4. Akan muncul popup Midtrans Snap

### D. Pilih Metode Pembayaran

Di popup Midtrans, pilih salah satu:

**💳 Kartu Kredit/Debit:**
- Masukkan nomor kartu asli Anda
- Masukkan CVV dan tanggal expired
- Klik "Pay"

**📱 E-Wallet (GoPay/ShopeePay):**
- Pilih GoPay atau ShopeePay
- Scan QR code dengan aplikasi
- Selesaikan pembayaran

**🏦 Bank Transfer:**
- Pilih bank (BCA, Mandiri, BNI, dll)
- Akan dapat nomor VA (Virtual Account)
- Transfer dari mobile banking

**🏪 Convenience Store:**
- Pilih Indomaret atau Alfamart
- Akan dapat kode pembayaran
- Bayar di kasir

### E. Selesaikan Pembayaran

1. Ikuti instruksi pembayaran
2. Selesaikan transaksi
3. **PENTING**: Catat Order ID atau Transaction ID

---

## 🔍 Cek Status Pembayaran

### Cara 1: Dashboard Midtrans (Paling Akurat)

1. Buka https://dashboard.midtrans.com/
2. Login dengan akun Anda
3. Klik menu **"Transactions"**
4. Cari transaksi berdasarkan Order ID atau waktu
5. Lihat status:
   - **Settlement** = Berhasil ✅
   - **Pending** = Menunggu pembayaran ⏳
   - **Expire** = Kadaluarsa ❌
   - **Deny** = Ditolak ❌

### Cara 2: Di Aplikasi (Manual Refresh)

1. Buka halaman "My Orders" atau "Pesanan Saya"
2. **Refresh halaman** (F5 atau Ctrl+R)
3. Status akan update sesuai dengan Midtrans

### Cara 3: Admin Dashboard

1. Login sebagai admin
2. Buka menu "Pesanan" atau "Orders"
3. Lihat daftar order
4. Status akan update setelah refresh

---

## 📊 Status Order yang Mungkin Muncul

| Status | Arti | Aksi |
|--------|------|------|
| **pending** | Menunggu pembayaran | Tunggu customer bayar |
| **paid** | Sudah dibayar | Proses pesanan |
| **processing** | Sedang diproses | - |
| **shipped** | Sudah dikirim | - |
| **completed** | Selesai | - |
| **cancelled** | Dibatalkan | - |

---

## ⚠️ Troubleshooting

### Popup Midtrans Tidak Muncul

**Penyebab:**
- API keys salah
- Backend tidak jalan
- CORS error

**Solusi:**
1. Cek console browser (F12) untuk error
2. Pastikan backend jalan
3. Cek file `.env` API keys benar

### Status Tidak Update

**Penyebab:**
- Webhook tidak aktif (normal, kita skip)
- Belum refresh halaman

**Solusi:**
1. Refresh halaman (F5)
2. Atau cek manual di dashboard Midtrans
3. Atau logout-login lagi

### Pembayaran Gagal

**Penyebab:**
- Kartu ditolak bank
- Saldo tidak cukup
- Kartu expired

**Solusi:**
1. Coba kartu lain
2. Coba metode pembayaran lain
3. Cek dengan bank Anda

### Order Tidak Muncul

**Penyebab:**
- Database error
- Backend error

**Solusi:**
1. Cek console backend untuk error
2. Cek MongoDB jalan
3. Cek log di terminal backend

---

## 💰 Tips Testing dengan Uang Asli

### 1. Mulai dengan Nominal Kecil

Test dengan produk murah dulu (Rp 1.000 - Rp 10.000) untuk memastikan sistem berjalan.

### 2. Gunakan Kartu Debit

Lebih aman daripada kartu kredit untuk testing.

### 3. Catat Semua Transaksi

Buat spreadsheet untuk tracking:
- Order ID
- Tanggal
- Nominal
- Status
- Catatan

### 4. Test Berbagai Metode Pembayaran

Test minimal:
- 1x Kartu Kredit/Debit
- 1x E-Wallet (GoPay/ShopeePay)
- 1x Bank Transfer

### 5. Monitor Dashboard Midtrans

Selalu cek dashboard Midtrans untuk memastikan pembayaran masuk.

---

## 📝 Checklist Testing

- [ ] Backend server jalan
- [ ] Frontend jalan
- [ ] Bisa login sebagai customer
- [ ] Bisa tambah produk ke cart
- [ ] Bisa checkout
- [ ] Popup Midtrans muncul
- [ ] Bisa pilih metode pembayaran
- [ ] Pembayaran berhasil
- [ ] Transaksi muncul di dashboard Midtrans
- [ ] Status "Settlement" di Midtrans
- [ ] Order muncul di aplikasi
- [ ] Status order update setelah refresh
- [ ] Admin bisa lihat order

---

## 🎯 Skenario Testing yang Disarankan

### Test 1: Pembayaran Berhasil (Happy Path)

1. Login customer
2. Tambah 1 produk murah ke cart
3. Checkout
4. Bayar dengan kartu debit
5. Selesaikan pembayaran
6. Cek status di Midtrans → harus "Settlement"
7. Refresh halaman order → status harus "paid"

### Test 2: Pembayaran Pending

1. Login customer
2. Tambah produk ke cart
3. Checkout
4. Pilih Bank Transfer
5. **JANGAN bayar dulu**
6. Cek status di Midtrans → harus "Pending"
7. Cek di aplikasi → status "pending"

### Test 3: Multiple Products

1. Login customer
2. Tambah 3-5 produk ke cart
3. Checkout
4. Bayar
5. Verifikasi total harga benar
6. Verifikasi semua produk tercatat

---

## 📞 Support

Jika ada masalah:
- **Midtrans Support**: support@midtrans.com
- **Phone**: +62 21 2922 0888
- **Dashboard**: https://dashboard.midtrans.com/

---

## ✅ Setelah Testing Berhasil

Jika semua test berhasil:

1. ✅ Sistem pembayaran sudah berfungsi
2. ✅ Siap untuk soft launch
3. ✅ Monitor transaksi secara berkala
4. ✅ Siapkan customer support

**Selamat! Sistem pembayaran Anda sudah LIVE! 🎉**

---

**Last Updated**: ${new Date().toLocaleDateString('id-ID')}
