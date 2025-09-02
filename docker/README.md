# MDVA Docker Configuration

Konfigurasi Docker yang mudah untuk mengatur SSL dan port pada aplikasi MDVA.

## Fitur

- ✅ Konfigurasi SSL yang mudah (enable/disable)
- ✅ Konfigurasi port frontend dan backend yang terpisah
- ✅ Environment variables untuk semua konfigurasi
- ✅ Script otomatis untuk generate nginx config
- ✅ Script untuk mengubah konfigurasi dengan mudah
- ✅ Script debugging dan troubleshooting

## File Konfigurasi

### 1. `env.template` (Template)
File template yang berisi semua konfigurasi default. Copy file ini menjadi `.env` untuk mengubah konfigurasi.

### 2. `.env` (Konfigurasi Aktif)
File yang berisi konfigurasi yang sedang digunakan. File ini akan dibuat otomatis saat menjalankan script.

## Variabel Konfigurasi

| Variabel | Default | Deskripsi |
|----------|---------|-----------|
| `SSL_ENABLED` | `false` | Enable/disable SSL |
| `FRONTEND_HTTP_PORT` | `8080` | Port untuk frontend HTTP |
| `FRONTEND_HTTPS_PORT` | `8081` | Port untuk frontend HTTPS |
| `BACKEND_HTTP_PORT` | `3001` | Port untuk backend HTTP |
| `BACKEND_HTTPS_PORT` | `3002` | Port untuk backend HTTPS |
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

# Enable SSL dan ubah port
./configure.sh --ssl true --frontend-http-port 3000 --frontend-https-port 3001

# Hanya ubah port frontend HTTP
./configure.sh --frontend-http-port 9090

# Reset ke default
./configure.sh --reset

# Lihat bantuan
./configure.sh --help
```

### 3. Menjalankan Aplikasi

```bash
# Jalankan dengan konfigurasi saat ini
./run.sh

# Atau jalankan manual
docker-compose up -d
```

## Contoh Konfigurasi

### Tanpa SSL (Default)
```bash
SSL_ENABLED=false
FRONTEND_HTTP_PORT=8080
FRONTEND_HTTPS_PORT=8081
BACKEND_HTTP_PORT=3001
BACKEND_HTTPS_PORT=3002
```

### Dengan SSL
```bash
SSL_ENABLED=true
FRONTEND_HTTP_PORT=8080
FRONTEND_HTTPS_PORT=8081
BACKEND_HTTP_PORT=3001
BACKEND_HTTPS_PORT=3002
```

**Note:** Jika SSL dienable, pastikan file sertifikat ada di folder `certs/`:
- `certs/server.crt` - Sertifikat SSL
- `certs/server.key` - Private key SSL

## Struktur Folder

```
docker/
├── .env                    # Konfigurasi aktif (akan dibuat otomatis)
├── env.template           # Template konfigurasi
├── docker-compose.yml     # Docker compose file
├── configure.sh           # Script untuk mengubah konfigurasi
├── generate-nginx-config.sh # Script untuk generate nginx config
├── run.sh                 # Script untuk menjalankan aplikasi
├── quick-start.sh         # Script untuk quick start
├── debug.sh               # Script untuk debugging
├── restart.sh             # Script untuk restart dan cleanup
├── nginx/                 # Folder nginx config (akan dibuat otomatis)
│   └── site.conf         # Config nginx (akan dibuat otomatis)
└── certs/                 # Folder untuk SSL certificates (opsional)
    ├── server.crt
    └── server.key
```

## Troubleshooting

### Port sudah digunakan
```bash
# Cek port yang sedang digunakan
lsof -i :8080

# Ubah port
./configure.sh --frontend-http-port 9090
```

### SSL tidak berfungsi
```bash
# Pastikan sertifikat ada
ls -la certs/

# Atau disable SSL
./configure.sh --ssl false
```

### Nginx config error
```bash
# Generate ulang nginx config
./generate-nginx-config.sh

# Atau restart dengan cleanup
./restart.sh --clean
```

### Container tidak start
```bash
# Debug masalah
./debug.sh

# Restart semua service
./restart.sh

# Lihat logs
docker-compose logs -f
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

### Restart Tool
```bash
# Restart normal
./restart.sh

# Restart dengan cleanup total
./restart.sh --clean
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
- SSL certificates harus valid dan aman
