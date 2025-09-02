# MDVA Docker Configuration

Konfigurasi Docker yang mudah untuk **Backend + MySQL** pada aplikasi MDVA.

## Fitur

- ✅ **Backend + MySQL Only** - Tidak ada nginx/frontend
- ✅ Konfigurasi port backend yang mudah
- ✅ Environment variables untuk semua konfigurasi
- ✅ Script untuk mengubah konfigurasi dengan mudah
- ✅ Ultimate runner dengan semua fitur fix dan clean

## File Konfigurasi

### 1. `env.template` (Template)
File template yang berisi semua konfigurasi default. Copy file ini menjadi `.env` untuk mengubah konfigurasi.

### 2. `.env` (Konfigurasi Aktif)
File yang berisi konfigurasi yang sedang digunakan. File ini akan dibuat otomatis saat menjalankan script.

## Variabel Konfigurasi

| Variabel | Default | Deskripsi |
|----------|---------|-----------|
| `BACKEND_HTTP_PORT` | `3001` | Port untuk backend API |
| `DB_USER` | `mdva` | Username database |
| `DB_PASS` | `root` | Password database |
| `DB_NAME` | `mdva` | Nama database |
| `JWT_SECRET` | `mdva_prod_secret_2024` | Secret untuk JWT |

## Cara Penggunaan

### 1. Konfigurasi Cepat

```bash
# Copy template konfigurasi
cp env.template .env

# Edit file .env sesuai kebutuhan
nano .env
```

### 2. Menggunakan Script Konfigurasi

```bash
# Lihat konfigurasi saat ini
./configure.sh --show

# Ubah port backend
./configure.sh --backend-http-port 4000

# Ubah database credentials
./configure.sh --db-user admin --db-pass mypassword

# Reset ke default
./configure.sh --reset

# Lihat bantuan
./configure.sh --help
```

### 3. Menjalankan Aplikasi dengan Ultimate Runner

```bash
# Jalankan normal
./run.sh

# Fix backend issues
./run.sh --fix

# Clean dan rebuild
./run.sh --clean

# Super clean (MDVA containers/images only)
./run.sh --super-clean

# Lihat bantuan
./run.sh --help
```

## Ultimate Runner Options

### **Normal Run**
```bash
./run.sh
```
- Jalankan dengan konfigurasi saat ini
- Start backend dan MySQL
- Port backend sesuai konfigurasi

### **Fix Mode**
```bash
./run.sh --fix
```
- Fix masalah backend
- Rebuild backend container
- Restart backend service

### **Clean Mode**
```bash
./run.sh --clean
```
- Stop semua MDVA container
- Hapus MDVA images
- Rebuild dari awal

### **Super Clean Mode**
```bash
./run.sh --super-clean
```
- Hapus MDVA containers dan images saja
- **TIDAK menghapus container lain yang tidak berhubungan**
- Cleanup total untuk MDVA
- Build ulang dari nol

## Contoh Konfigurasi

### Default Configuration
```bash
BACKEND_HTTP_PORT=3001
DB_USER=mdva
DB_PASS=root
DB_NAME=mdva
JWT_SECRET=mdva_prod_secret_2024
```

### Custom Configuration
```bash
BACKEND_HTTP_PORT=4000
DB_USER=admin
DB_PASS=mypassword123
DB_NAME=myapp
JWT_SECRET=mysecretkey2024
```

## Struktur Folder

```
docker/
├── .env                    # Konfigurasi aktif (akan dibuat otomatis)
├── env.template           # Template konfigurasi
├── docker-compose.yml     # Docker compose file (backend + MySQL only)
├── configure.sh           # Script untuk mengubah konfigurasi
├── run.sh                 # Ultimate runner dengan semua fitur
├── debug.sh               # Script untuk debugging
├── backend.Dockerfile     # Backend image
└── database/              # Database scripts
    ├── schema.sql
    └── seed.sql
```

## Troubleshooting

### Port sudah digunakan
```bash
# Cek port yang sedang digunakan
lsof -i :3001

# Ubah port
./configure.sh --backend-http-port 4000
```

### Backend tidak start
```bash
# Fix backend issues
./run.sh --fix

# Atau clean rebuild
./run.sh --clean
```

### Container tidak start
```bash
# Debug masalah
./debug.sh

# Fix backend
./run.sh --fix

# Super clean jika masih bermasalah
./run.sh --super-clean
```

### Reset semua konfigurasi
```bash
./configure.sh --reset
```

## Script Utilitas

### Debug Tool
```bash
# Cek status semua komponen
./debug.sh
```

## Perintah Docker

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild dan start
docker-compose up -d --build

# Check status
docker-compose ps
```

## Keamanan

- Jangan commit file `.env` ke repository
- Gunakan password yang kuat untuk database
- JWT secret harus unik dan aman

## ⚠️ Penting: Super Clean Scope

**`./run.sh --super-clean` hanya akan menghapus:**
- ✅ Container MDVA: `mdva-backend`, `mdva-db`
- ✅ Image MDVA: `docker_backend`
- ✅ Volume MDVA yang terkait

**TIDAK akan menghapus:**
- ❌ Container lain yang tidak berhubungan dengan MDVA
- ❌ Image lain yang tidak berhubungan dengan MDVA
- ❌ Volume lain yang tidak berhubungan dengan MDVA

**Aman untuk server yang punya container lain!** 🛡️

## 🎯 Koneksi Backend + MySQL

**Backend akan terkoneksi ke MySQL melalui:**
- **Host**: `db` (nama service di docker-compose)
- **Port**: `3306` (internal)
- **Database**: Sesuai konfigurasi di `.env`
- **Username/Password**: Sesuai konfigurasi di `.env`

**Backend accessible dari host:**
- **URL**: `http://localhost:BACKEND_HTTP_PORT`
- **Default**: `http://localhost:3001`
- **API**: `http://localhost:3001/api`
