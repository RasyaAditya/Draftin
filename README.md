# Draftin

Website e-commerce untuk penjualan jasa arsitek & konstruksi. Dibangun dengan
Nuxt 4 (Vue 3 + TypeScript), Tailwind CSS v4, Prisma + PostgreSQL, dan
integrasi pembayaran Midtrans Snap.

> **Status:** Fase 1 — setup project, design token, dan schema database.
> Landing page, auth, katalog, checkout, dan panel admin menyusul di fase
> berikutnya.

## Tech stack

| Layer      | Teknologi                                              |
| ---------- | ------------------------------------------------------- |
| Frontend   | Nuxt 4, Vue 3 `<script setup>`, TypeScript               |
| Styling    | Tailwind CSS v4 (CSS-first config, design token via CSS variable) |
| State      | Pinia                                                    |
| Database   | PostgreSQL + Prisma ORM                                  |
| Auth       | JWT httpOnly cookie, role `GUEST` / `CLIENT` / `ADMIN`, hash Argon2 |
| Animasi    | GSAP + ScrollTrigger, motion-v, Lenis                    |
| Form       | VeeValidate + Zod (Standard Schema, tanpa `@vee-validate/zod`) |
| Payment    | Midtrans Snap (sandbox)                                  |
| Email      | Nodemailer (dev: console transport)                      |

## Menjalankan dari nol

### 1. Prasyarat

- Node.js ≥ 20
- PostgreSQL ≥ 14 berjalan secara lokal (atau lewat Docker)

### 2. Install dependency

```bash
npm install
```

### 3. Siapkan environment variable

```bash
cp .env.example .env
```

Isi `DATABASE_URL` sesuai koneksi PostgreSQL kamu, contoh:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/draftin?schema=public"
```

Buat database-nya jika belum ada:

```bash
createdb draftin
# atau: psql -U postgres -c "CREATE DATABASE draftin;"
```

### 4. Migrasi & seed database

```bash
npm run db:migrate   # menjalankan migration Prisma
npm run db:seed      # mengisi data dummy (paket jasa, portofolio, user)
```

Akun dummy hasil seed:

| Role   | Email                     | Password      |
| ------ | -------------------------- | ------------- |
| Admin  | admin@draftin.id           | Admin123!     |
| Admin (arsitek) | arsitek@draftin.id | Arsitek123!   |
| Client | budi.santoso@gmail.com     | Client123!    |
| Client | siti.rahma@gmail.com       | Client123!    |
| Client | rayhan.putra@gmail.com     | Client123!    |

### 5. Jalankan development server

```bash
npm run dev
```

Buka http://localhost:3000.

### 6. Perintah lain yang berguna

```bash
npm run db:studio   # Prisma Studio, browse data lewat browser
npm run typecheck    # cek tipe TypeScript
npm run build        # build production
```

## Struktur folder

```
app/            # kode frontend (Nuxt 4: pages, layouts, components, stores, dst.)
server/         # Nuxt server routes (API + webhook Midtrans)
prisma/         # schema.prisma, migration, seed.ts
shared/         # tipe TypeScript yang dipakai bareng frontend & server
public/         # aset statis
```

## Testing webhook Midtrans di lokal (menyusul di Fase 5)

Panduan lengkap ngrok + daftar test card sandbox akan ditambahkan begitu
integrasi Midtrans (Fase 5) selesai dikerjakan.

## Roadmap fase

1. ✅ Setup project, Tailwind + design token, schema Prisma + seed
2. ⬜ Auth (register, login, logout, role guard) + layout user & admin
3. ⬜ Katalog & detail jasa + landing page (+ animasi)
4. ⬜ Cart, checkout, order, quote request
5. ⬜ Integrasi Midtrans + webhook + invoice PDF
6. ⬜ Panel admin lengkap
7. ⬜ Polish animasi, dark mode, aksesibilitas, SEO
