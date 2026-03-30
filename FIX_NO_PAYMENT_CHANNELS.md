# Fix "No payment channels available" - Midtrans

## 🔴 Masalah
Error: **"No payment channels available"**
Pesan: "Please contact Draftin to discuss payment procedure."

## 📋 Penyebab
Payment methods belum diaktifkan di dashboard Midtrans Production.

---

## ✅ Solusi (Step-by-Step)

### Step 1: Login ke Dashboard Midtrans

1. Buka: https://dashboard.midtrans.com/
2. Login dengan akun kamu
3. Pastikan kamu di mode **Production** (bukan Sandbox)

---

### Step 2: Aktifkan Payment Methods

#### A. Buka Settings
1. Di dashboard, klik menu **Settings** (⚙️)
2. Pilih **Payment Settings** atau **Configuration**

#### B. Aktifkan Payment Methods yang Kamu Mau

Centang/aktifkan minimal salah satu dari:

**💳 Kartu Kredit/Debit:**
- ✅ Credit Card (Visa, Mastercard, JCB, Amex)
- Ini yang paling umum dan mudah

**📱 E-Wallet:**
- ✅ GoPay
- ✅ ShopeePay
- ✅ QRIS (Universal QR)

**🏦 Bank Transfer (Virtual Account):**
- ✅ BCA Virtual Account
- ✅ Mandiri Bill Payment
- ✅ BNI Virtual Account
- ✅ BRI Virtual Account
- ✅ Permata Virtual Account

**🏪 Convenience Store:**
- ✅ Indomaret
- ✅ Alfamart

**💰 Direct Debit:**
- ✅ BCA KlikPay
- ✅ CIMB Clicks
- ✅ Danamon Online Banking

#### C. Save Settings
1. Scroll ke bawah
2. Klik **"Save"** atau **"Update"**
3. Tunggu konfirmasi

---

### Step 3: Verifikasi Akun (Jika Belum)

Jika payment methods tidak bisa diaktifkan:

1. **Verifikasi Email**
   - Cek email dari Midtrans
   - Klik link verifikasi

2. **Lengkapi Data Bisnis**
   - Nama bisnis
   - Alamat
   - Nomor telepon
   - NPWP (jika ada)

3. **Submit untuk Review**
   - Midtrans akan review akun kamu
   - Biasanya 1-3 hari kerja

---

### Step 4: Test Lagi

Setelah payment methods aktif:

1. **Restart Backend**
   ```bash
   cd backend
   npm run dev
   ```

2. **Clear Browser Cache**
   - Tekan Ctrl + Shift + Delete
   - Clear cache dan cookies
   - Atau buka Incognito/Private window

3. **Test Checkout Lagi**
   - Buka aplikasi
   - Tambah produk ke cart
   - Checkout
   - Popup Midtrans harus muncul dengan payment methods

---

## 🎯 Rekomendasi Payment Methods untuk Mulai

Untuk testing dan go-live awal, aktifkan minimal:

1. ✅ **Credit Card** - Paling universal
2. ✅ **GoPay** - Populer di Indonesia
3. ✅ **QRIS** - Support semua e-wallet
4. ✅ **BCA Virtual Account** - Bank terbesar

Ini sudah cukup untuk cover mayoritas customer.

---

## ⚠️ Troubleshooting

### Error: "Payment method not available"

**Penyebab:**
- Payment method belum aktif di dashboard
- Akun belum diverifikasi

**Solusi:**
1. Login ke dashboard Midtrans
2. Cek Settings → Payment Settings
3. Aktifkan payment methods
4. Verifikasi akun jika diminta

---

### Error: "Merchant not found"

**Penyebab:**
- API keys salah
- Akun belum aktif

**Solusi:**
1. Cek API keys di `.env`
2. Pastikan menggunakan Production keys
3. Verifikasi akun di dashboard

---

### Payment Methods Tidak Bisa Diaktifkan

**Penyebab:**
- Akun belum diverifikasi
- Data bisnis belum lengkap

**Solusi:**
1. Lengkapi data bisnis di dashboard
2. Upload dokumen yang diminta (KTP, NPWP, dll)
3. Submit untuk review
4. Tunggu approval dari Midtrans (1-3 hari)

---

## 📞 Contact Midtrans Support

Jika masih bermasalah:

**Email:** support@midtrans.com
**Phone:** +62 21 2922 0888
**Live Chat:** Di dashboard Midtrans (pojok kanan bawah)

Jelaskan:
- Merchant ID kamu
- Error yang muncul
- Payment methods yang mau diaktifkan

---

## 🔍 Cara Cek Status Akun

1. Login ke dashboard Midtrans
2. Lihat di pojok kanan atas
3. Status akun:
   - **Verified** ✅ - Siap digunakan
   - **Pending Verification** ⏳ - Tunggu review
   - **Unverified** ❌ - Perlu verifikasi

---

## 📝 Checklist

- [ ] Login ke dashboard Midtrans Production
- [ ] Buka Settings → Payment Settings
- [ ] Aktifkan minimal 1 payment method (Credit Card recommended)
- [ ] Save settings
- [ ] Verifikasi akun (jika diminta)
- [ ] Restart backend
- [ ] Clear browser cache
- [ ] Test checkout lagi
- [ ] Payment methods muncul di popup Midtrans

---

## 💡 Tips

1. **Aktifkan Credit Card dulu** - Paling mudah dan universal
2. **QRIS sangat recommended** - Support semua e-wallet
3. **Jangan aktifkan semua sekaligus** - Mulai dengan 2-3 methods dulu
4. **Monitor dashboard** - Lihat payment method mana yang paling banyak dipakai
5. **Tambah payment methods bertahap** - Sesuai kebutuhan customer

---

## ✅ Setelah Fix

Setelah payment methods aktif, popup Midtrans akan menampilkan:

```
✅ Credit Card
✅ GoPay
✅ ShopeePay
✅ QRIS
✅ Bank Transfer (BCA, Mandiri, BNI, dll)
✅ Convenience Store (Indomaret, Alfamart)
```

Customer bisa pilih metode pembayaran yang mereka mau.

---

## 🚀 Next Steps

1. **Aktifkan payment methods** di dashboard
2. **Test dengan nominal kecil** (Rp 1.000 - Rp 10.000)
3. **Monitor transaksi** di dashboard
4. **Siap untuk customer!**

---

**Good luck! 🎉**

