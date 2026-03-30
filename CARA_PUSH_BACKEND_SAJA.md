# Cara Push Backend Saja ke Git

Panduan ini menjelaskan cara push hanya folder backend ke repository tanpa menyertakan frontend atau file lainnya.

## Opsi 1: Push Backend Folder yang Sudah Ada

Jika Anda ingin push folder `backend` atau `Backend-Draftin-Clean` yang sudah ada:

### Langkah 1: Cek Status Git
```bash
git status
```

### Langkah 2: Add Folder Backend Saja
```bash
# Untuk folder backend
git add backend/

# ATAU untuk Backend-Draftin-Clean
git add Backend-Draftin-Clean/
```

### Langkah 3: Commit Perubahan
```bash
git commit -m "Update backend code"
```

### Langkah 4: Push ke Repository
```bash
git push origin main
```

## Opsi 2: Push Backend ke Repository Terpisah

Jika Anda ingin membuat repository khusus untuk backend saja:

### Langkah 1: Masuk ke Folder Backend
```bash
cd backend
# ATAU
cd Backend-Draftin-Clean
```

### Langkah 2: Inisialisasi Git (jika belum ada)
```bash
git init
```

### Langkah 3: Add Semua File Backend
```bash
git add .
```

### Langkah 4: Commit
```bash
git commit -m "Initial backend commit"
```

### Langkah 5: Tambahkan Remote Repository
```bash
git remote add origin <URL_REPOSITORY_BACKEND>
```

### Langkah 6: Push ke Repository
```bash
git push -u origin main
```

## Opsi 3: Push Backend dari Root Project (Selective)

Jika Anda di root project dan hanya ingin push perubahan backend:

### Langkah 1: Add Hanya File Backend yang Berubah
```bash
# Lihat file yang berubah
git status

# Add hanya file backend yang berubah
git add backend/controllers/
git add backend/models/
git add backend/routes/
# dst...
```

### Langkah 2: Commit dan Push
```bash
git commit -m "Update backend: [deskripsi perubahan]"
git push origin main
```

## Tips Penting

### Setup .gitignore (SUDAH DIBUAT!)
File `.gitignore` sudah dibuat di:
- Root project: `.gitignore`
- Folder backend: `backend/.gitignore`
- Folder Backend-Draftin-Clean: `Backend-Draftin-Clean/.gitignore` (sudah ada)

File yang dikecualikan:
```
node_modules/
.env
uploads/
*.log
```

### Verifikasi .gitignore Bekerja
```bash
# Cek apakah .env dan node_modules tidak muncul di git status
git status

# Jika masih muncul, hapus dari cache git:
git rm -r --cached backend/node_modules
git rm --cached backend/.env
git rm -r --cached backend/uploads
```

### Cek Remote Repository
```bash
git remote -v
```

### Jika Ada Konflik
```bash
# Pull dulu sebelum push
git pull origin main

# Resolve konflik jika ada
# Lalu commit dan push
git add .
git commit -m "Resolve conflicts"
git push origin main
```

## Struktur Backend yang Akan Di-Push

Folder backend Anda berisi:
- `controllers/` - Logic untuk handle request
- `models/` - Schema database MongoDB
- `routes/` - Endpoint API
- `middleware/` - Auth dan role middleware
- `utils/` - Helper functions
- `tests/` - Unit tests
- `index.js` - Entry point server
- `package.json` - Dependencies

## Catatan Keamanan

**JANGAN PUSH FILE SENSITIF:**
- `.env` file (berisi API keys, database credentials)
- `node_modules/` (terlalu besar, install ulang dengan npm install)
- `uploads/` (file user, sebaiknya di server/cloud storage)

Pastikan file-file ini ada di `.gitignore` sebelum push!
