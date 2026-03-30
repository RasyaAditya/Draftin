# Cara Aktivasi Payment Methods di Midtrans

## 📍 Kamu Sudah di Halaman yang Benar!

URL: `dashboard.midtrans.com/settings/payment`

---

## 🎯 Langkah Selanjutnya

### Step 1: Scroll ke Bawah

Di halaman **Payment Settings** ini, scroll ke bawah sampai kamu menemukan section:

- **Payment Channels** atau
- **Payment Methods** atau
- **Available Payment Methods**

---

### Step 2: Aktifkan Payment Methods

Kamu akan melihat daftar payment methods seperti ini:

#### 💳 Credit Card
```
☐ Credit Card (Visa, Mastercard, JCB, Amex)
```
**✅ CENTANG INI DULU** - Paling penting dan universal!

#### 📱 E-Wallet
```
☐ GoPay
☐ ShopeePay  
☐ QRIS
```
**✅ CENTANG QRIS** - Support semua e-wallet!

#### 🏦 Bank Transfer (Virtual Account)
```
☐ BCA Virtual Account
☐ Mandiri Bill Payment
☐ BNI Virtual Account
☐ BRI Virtual Account
☐ Permata Virtual Account
☐ CIMB Niaga Virtual Account
```
**✅ CENTANG BCA** - Bank terbesar di Indonesia

#### 🏪 Convenience Store
```
☐ Indomaret
☐ Alfamart
```
**✅ OPSIONAL** - Untuk customer yang suka bayar tunai

#### 💰 Direct Debit
```
☐ BCA KlikPay
☐ CIMB Clicks
☐ Danamon Online Banking
```
**✅ OPSIONAL** - Jarang dipakai

---

### Step 3: Minimum yang Harus Diaktifkan

Untuk mulai, aktifkan minimal **3 ini**:

1. ✅ **Credit Card** - Wajib!
2. ✅ **QRIS** - Support semua e-wallet
3. ✅ **BCA Virtual Account** - Bank terbesar

Ini sudah cukup untuk cover 90% customer Indonesia.

---

### Step 4: Save Settings

Setelah centang payment methods yang kamu mau:

1. Scroll ke paling bawah
2. Cari tombol **"Save"** atau **"Update"** atau **"Submit"**
3. Klik tombol tersebut
4. Tunggu konfirmasi "Settings saved successfully"

---

### Step 5: Verifikasi (Jika Diminta)

Jika muncul popup atau notifikasi untuk verifikasi:

#### A. Lengkapi Data Bisnis
- Nama bisnis/toko
- Alamat lengkap
- Nomor telepon
- Email bisnis
- Website (jika ada)

#### B. Upload Dokumen (Jika Diminta)
- KTP pemilik bisnis
- NPWP (jika ada)
- Foto toko/kantor (jika ada)

#### C. Submit untuk Review
- Klik "Submit" atau "Send for Review"
- Midtrans akan review dalam 1-3 hari kerja
- Kamu akan dapat email konfirmasi

---

## 🔍 Jika Tidak Menemukan Payment Methods

### Kemungkinan 1: Akun Belum Diverifikasi

**Cek di pojok kanan atas:**
- Jika ada badge **"Unverified"** atau **"Pending"**
- Klik badge tersebut
- Ikuti instruksi verifikasi

**Atau:**
1. Klik menu **ACCOUNT** di sidebar kiri
2. Pilih **Account Settings** atau **Verification**
3. Lengkapi data yang diminta
4. Submit untuk review

### Kemungkinan 2: Masih di Sandbox Mode

**Cek di pojok kiri atas:**
- Jika tertulis **"Sandbox"** atau **"Development"**
- Klik dropdown tersebut
- Pilih **"Production"**

### Kemungkinan 3: Payment Methods di Tab Lain

Coba cek tab-tab lain di halaman Payment Settings:
- **Payment Channels**
- **Payment Configuration**
- **Snap Preferences**
- **Payment Methods**

---

## ⚠️ Troubleshooting

### Error: "Payment method not available for your account"

**Penyebab:**
- Akun belum diverifikasi
- Negara tidak support payment method tersebut

**Solusi:**
1. Verifikasi akun dulu
2. Untuk Indonesia, semua payment method harusnya available
3. Contact Midtrans support jika masih error

### Error: "Please complete verification first"

**Penyebab:**
- Akun belum diverifikasi

**Solusi:**
1. Klik menu **ACCOUNT** → **Verification**
2. Lengkapi data bisnis
3. Upload dokumen yang diminta
4. Submit dan tunggu approval

### Checkbox Payment Method Disabled (Abu-abu)

**Penyebab:**
- Payment method belum available untuk akun kamu
- Perlu approval khusus dari Midtrans

**Solusi:**
1. Contact Midtrans support
2. Email: support@midtrans.com
3. Phone: +62 21 2922 0888
4. Jelaskan payment method mana yang mau diaktifkan

---

## 📞 Contact Midtrans Support

Jika masih bingung atau ada masalah:

**Live Chat:**
- Di dashboard Midtrans, pojok kanan bawah
- Klik icon chat
- Jelaskan masalah kamu

**Email:**
- support@midtrans.com
- Sertakan Merchant ID kamu
- Screenshot error (jika ada)

**Phone:**
- +62 21 2922 0888
- Senin-Jumat, 09:00-18:00 WIB

---

## ✅ Setelah Payment Methods Aktif

### Test Lagi

1. **Restart Backend**
   ```bash
   cd backend
   npm run dev
   ```

2. **Clear Browser Cache**
   - Tekan Ctrl + Shift + Delete
   - Clear cache dan cookies
   - Atau buka Incognito/Private window

3. **Test Checkout**
   - Buka aplikasi: http://localhost:5173
   - Login sebagai customer
   - Tambah produk ke cart
   - Checkout
   - Popup Midtrans harus muncul dengan payment methods!

### Verifikasi di Dashboard

1. Kembali ke halaman Payment Settings
2. Payment methods yang kamu aktifkan harus tercentang
3. Status harus "Active" atau "Enabled"

---

## 🎯 Rekomendasi Final

### Untuk Testing Awal (Hari Ini)
Aktifkan minimal:
1. ✅ Credit Card
2. ✅ QRIS
3. ✅ BCA Virtual Account

### Untuk Production (Setelah Testing OK)
Tambahkan:
4. ✅ GoPay
5. ✅ ShopeePay
6. ✅ Mandiri Bill Payment
7. ✅ BNI Virtual Account

### Opsional (Sesuai Kebutuhan)
8. ✅ Indomaret
9. ✅ Alfamart
10. ✅ BRI Virtual Account

---

## 📝 Checklist

- [ ] Scroll ke bawah di halaman Payment Settings
- [ ] Temukan section "Payment Channels" atau "Payment Methods"
- [ ] Centang minimal: Credit Card, QRIS, BCA VA
- [ ] Klik "Save" atau "Update"
- [ ] Tunggu konfirmasi "Settings saved"
- [ ] Verifikasi akun (jika diminta)
- [ ] Restart backend
- [ ] Clear browser cache
- [ ] Test checkout lagi
- [ ] Payment methods muncul di popup Midtrans ✅

---

## 💡 Tips

1. **Jangan aktifkan semua sekaligus** - Mulai dengan 3-4 methods dulu
2. **Monitor dashboard** - Lihat payment method mana yang paling banyak dipakai
3. **Tambah bertahap** - Sesuai feedback customer
4. **Credit Card wajib** - Ini yang paling universal
5. **QRIS sangat recommended** - Support semua e-wallet sekaligus

---

**Selamat mencoba! Jika masih ada masalah, screenshot dan tanya lagi! 🚀**

