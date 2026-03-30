# 🚀 Cara Menggunakan Midtrans Production (LIVE)

## ✅ Status Saat Ini

Kamu sudah setup Midtrans Production dengan benar:

```
✅ Mode: PRODUCTION (LIVE) - Menggunakan uang asli!
✅ Server Key: YOUR_MIDTRANS_SERVER_KEY
✅ Client Key: YOUR_MIDTRANS_CLIENT_KEY
✅ Backend: Sudah dikonfigurasi
✅ Webhook: Tersedia di /api/webhook/midtrans
```

---

## 🎯 Cara Menggunakan (Step-by-Step)

### Step 1: Start Backend & Frontend

**Terminal 1: Backend**
```bash
cd backend
npm run dev
```

Harus muncul:
```
✅ MongoDB connected successfully
✅ Server running on http://localhost:5002
```

**Terminal 2: Frontend**
```bash
cd frontend
npm run dev
```

Harus muncul:
```
➜  Local:   http://localhost:5173/
```

---

### Step 2: Login sebagai Customer

1. Buka browser: `http://localhost:5173`
2. Klik tombol **"Login"**
3. Login dengan akun customer (bukan admin)
4. Atau klik **"Daftar"** untuk register akun baru

---

### Step 3: Browse & Tambah Produk ke Cart

1. Browse produk yang tersedia di halaman **Shop**
2. Klik produk yang mau dibeli
3. Pilih quantity (jumlah)
4. Klik **"Add to Cart"** atau **"Tambah ke Keranjang"**
5. Ulangi untuk produk lain jika mau

---

### Step 4: Checkout

1. Klik icon **Cart** (keranjang) di header
2. Review produk di cart:
   - Nama produk
   - Harga
   - Quantity
   - Subtotal
3. Klik **"Checkout"** atau **"Bayar"**
4. Isi form pengiriman (nama, alamat, no HP)
5. Klik **"Lanjut ke Pembayaran"**

---

### Step 5: Pilih Metode Pembayaran

Akan muncul **popup Midtrans Snap** dengan pilihan:

#### 💳 Kartu Kredit/Debit
- Masukkan nomor kartu asli kamu
- Masukkan CVV (3 digit di belakang kartu)
- Masukkan tanggal expired (MM/YY)
- Klik **"Pay"**
- Masukkan OTP jika diminta

#### 📱 E-Wallet (GoPay/ShopeePay/QRIS)
- **GoPay**: Scan QR code dengan app GoPay
- **ShopeePay**: Scan QR code dengan app ShopeePay
- **QRIS**: Scan dengan app bank apapun yang support QRIS
- Selesaikan pembayaran di app

#### 🏦 Bank Transfer (Virtual Account)
- Pilih bank (BCA, Mandiri, BNI, BRI, Permata, dll)
- Akan dapat nomor VA (Virtual Account)
- Transfer dari mobile banking atau ATM
- Gunakan nomor VA sebagai tujuan transfer

#### 🏪 Convenience Store (Indomaret/Alfamart)
- Pilih Indomaret atau Alfamart
- Akan dapat kode pembayaran
- Tunjukkan kode ke kasir
- Bayar tunai

---

### Step 6: Selesaikan Pembayaran

1. Ikuti instruksi pembayaran sesuai metode yang dipilih
2. Selesaikan transaksi
3. **PENTING**: Catat **Order ID** atau **Transaction ID**

---

### Step 7: Cek Status Pembayaran

#### Cara 1: Dashboard Midtrans (Paling Akurat)

1. Buka: https://dashboard.midtrans.com/
2. Login dengan akun Midtrans kamu
3. Klik menu **"Transactions"**
4. Cari transaksi berdasarkan:
   - Order ID
   - Waktu transaksi
   - Nominal
5. Lihat status:
   - **Settlement** = Berhasil ✅ (Uang sudah masuk)
   - **Pending** = Menunggu pembayaran ⏳
   - **Expire** = Kadaluarsa ❌
   - **Deny** = Ditolak ❌
   - **Cancel** = Dibatalkan ❌

#### Cara 2: Di Aplikasi

1. Buka halaman **"My Orders"** atau **"Pesanan Saya"**
2. **Refresh halaman** (F5 atau Ctrl+R)
3. Status akan update sesuai dengan Midtrans
4. Klik order untuk lihat detail

#### Cara 3: Admin Dashboard

1. Login sebagai admin
2. Buka menu **"Pesanan"** atau **"Orders"**
3. Lihat daftar order
4. Status akan update setelah refresh

---

## 💰 Metode Pembayaran yang Tersedia

### 1. Kartu Kredit/Debit

**Bank yang Support:**
- Visa
- Mastercard
- JCB
- Amex

**Cara Bayar:**
1. Masukkan nomor kartu
2. Masukkan CVV
3. Masukkan expired date
4. Klik Pay
5. Masukkan OTP dari bank

**Waktu Proses:** Instant (langsung)

---

### 2. E-Wallet

**Pilihan:**
- GoPay
- ShopeePay
- QRIS (semua e-wallet)

**Cara Bayar:**
1. Scan QR code
2. Konfirmasi di app
3. Selesai

**Waktu Proses:** Instant (langsung)

---

### 3. Bank Transfer (Virtual Account)

**Bank yang Support:**
- BCA
- Mandiri
- BNI
- BRI
- Permata
- CIMB Niaga
- Dan lainnya

**Cara Bayar:**
1. Dapat nomor VA
2. Transfer dari mobile banking/ATM
3. Gunakan nomor VA sebagai tujuan
4. Selesai

**Waktu Proses:** 5-15 menit setelah transfer

---

### 4. Convenience Store

**Pilihan:**
- Indomaret
- Alfamart

**Cara Bayar:**
1. Dapat kode pembayaran
2. Pergi ke kasir
3. Tunjukkan kode
4. Bayar tunai
5. Selesai

**Waktu Proses:** Instant setelah bayar

---

## 📊 Status Order

| Status | Arti | Aksi Customer | Aksi Admin |
|--------|------|---------------|------------|
| **pending** | Menunggu pembayaran | Bayar sesuai instruksi | Tunggu |
| **paid** | Sudah dibayar | Tunggu diproses | Proses pesanan |
| **processing** | Sedang diproses | Tunggu | Siapkan barang |
| **shipped** | Sudah dikirim | Tunggu barang | Update resi |
| **completed** | Selesai | - | - |
| **cancelled** | Dibatalkan | - | - |

---

## ⚠️ Troubleshooting

### Popup Midtrans Tidak Muncul

**Penyebab:**
- Backend tidak jalan
- API keys salah
- CORS error

**Solusi:**
1. Pastikan backend jalan: `npm run dev`
2. Cek console browser (F12) untuk error
3. Cek file `.env` API keys benar
4. Restart backend

---

### Status Tidak Update

**Penyebab:**
- Belum refresh halaman
- Webhook belum aktif (normal)

**Solusi:**
1. **Refresh halaman** (F5)
2. Cek manual di dashboard Midtrans
3. Tunggu 1-2 menit lalu refresh lagi

---

### Pembayaran Gagal

**Penyebab:**
- Kartu ditolak bank
- Saldo tidak cukup
- Kartu expired
- Limit transaksi terlampaui

**Solusi:**
1. Coba kartu lain
2. Coba metode pembayaran lain
3. Hubungi bank kamu
4. Cek saldo/limit kartu

---

### Order Tidak Muncul

**Penyebab:**
- Database error
- Backend error

**Solusi:**
1. Cek console backend untuk error
2. Pastikan MongoDB jalan
3. Cek log di terminal backend
4. Restart backend

---

## 💡 Tips Penting

### 1. Untuk Testing Awal

- Mulai dengan nominal kecil (Rp 1.000 - Rp 10.000)
- Test dengan kartu debit dulu (lebih aman)
- Catat semua transaksi

### 2. Untuk Production

- Monitor dashboard Midtrans secara berkala
- Cek transaksi setiap hari
- Backup data order secara rutin
- Siapkan customer support

### 3. Keamanan

- Jangan share API keys ke siapapun
- Jangan commit file `.env` ke Git
- Gunakan HTTPS untuk production
- Monitor transaksi mencurigakan

---

## 📝 Checklist Sebelum Go Live

- [ ] Backend jalan dengan baik
- [ ] Frontend jalan dengan baik
- [ ] MongoDB terkoneksi
- [ ] Midtrans Production keys sudah di-set
- [ ] Test pembayaran berhasil
- [ ] Status order update dengan benar
- [ ] Admin bisa lihat order
- [ ] Customer bisa lihat order history
- [ ] Email notification (jika ada)
- [ ] Customer support siap

---

## 🎯 Flow Lengkap (Ringkasan)

```
Customer Login
    ↓
Browse Produk
    ↓
Add to Cart
    ↓
Checkout
    ↓
Isi Form Pengiriman
    ↓
Pilih Metode Pembayaran (Midtrans Popup)
    ↓
Bayar
    ↓
Status: Pending → Paid
    ↓
Admin Proses Order
    ↓
Status: Processing → Shipped
    ↓
Customer Terima Barang
    ↓
Status: Completed
```

---

## 📞 Support

### Midtrans Support
- Email: support@midtrans.com
- Phone: +62 21 2922 0888
- Dashboard: https://dashboard.midtrans.com/
- Docs: https://docs.midtrans.com/

### Cek Status Midtrans
- https://status.midtrans.com/

---

## 🔒 Security Checklist

- [ ] API keys aman (tidak di-commit ke Git)
- [ ] File `.env` di `.gitignore`
- [ ] HTTPS untuk production
- [ ] Webhook signature validation (sudah ada di code)
- [ ] Monitor transaksi mencurigakan
- [ ] Backup database rutin

---

## ✅ Kesimpulan

Midtrans Production kamu sudah siap digunakan! 

**Yang perlu kamu lakukan:**
1. Start backend: `npm run dev`
2. Start frontend: `npm run dev`
3. Test pembayaran dengan nominal kecil
4. Monitor dashboard Midtrans
5. Siap untuk customer!

**Selamat! Sistem pembayaran kamu sudah LIVE! 🎉**

---

**Last Updated:** ${new Date().toLocaleDateString('id-ID')}

