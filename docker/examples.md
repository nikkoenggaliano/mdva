# Contoh Penggunaan Konfigurasi

Berikut adalah contoh-contoh penggunaan script konfigurasi untuk berbagai skenario.

## 🚀 Quick Start

```bash
# Jalankan dengan konfigurasi default
./quick-start.sh
```

## 🔧 Konfigurasi Port

### Port Default
```bash
# Gunakan port default
./configure.sh --show
# Output: 
# FRONTEND_HTTP_PORT=8080
# FRONTEND_HTTPS_PORT=8081
# BACKEND_HTTP_PORT=3001
# BACKEND_HTTPS_PORT=3002
```

### Port Frontend Custom
```bash
# Ubah port frontend HTTP ke 3000
./configure.sh --frontend-http-port 3000

# Ubah port frontend HTTPS ke 3001
./configure.sh --frontend-https-port 3001

# Ubah kedua port frontend sekaligus
./configure.sh --frontend-http-port 3000 --frontend-https-port 3001
```

### Port Backend Custom
```bash
# Ubah port backend HTTP ke 4000
./configure.sh --backend-http-port 4000

# Ubah port backend HTTPS ke 4001
./configure.sh --backend-https-port 4001

# Ubah kedua port backend sekaligus
./configure.sh --backend-http-port 4000 --backend-https-port 4001
```

### Port untuk Development
```bash
# Port yang sering digunakan untuk development
./configure.sh --frontend-http-port 3000 --frontend-https-port 3001
./configure.sh --frontend-http-port 5000 --frontend-https-port 5001
./configure.sh --frontend-http-port 8000 --frontend-https-port 8001
```

### Port untuk Production
```bash
# Port standar untuk production
./configure.sh --frontend-http-port 80 --frontend-https-port 443
./configure.sh --frontend-http-port 8080 --frontend-https-port 8443
```

## 🔒 Konfigurasi SSL

### Tanpa SSL (Default)
```bash
# Disable SSL
./configure.sh --ssl false

# Atau reset ke default
./configure.sh --reset
```

### Dengan SSL
```bash
# Enable SSL
./configure.sh --ssl true

# Pastikan sertifikat tersedia di folder certs/
ls -la certs/
# Harus ada: server.crt dan server.key
```

### Setup SSL Lengkap
```bash
# 1. Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout certs/server.key -out certs/server.crt \
  -subj "/C=ID/ST=Jakarta/L=Jakarta/O=MDVA/OU=IT/CN=localhost"

# 2. Set permission yang benar
chmod 600 certs/server.key
chmod 644 certs/server.crt

# 3. Enable SSL
./configure.sh --ssl true

# 4. Jalankan aplikasi
./run.sh
```

## 🗄️ Konfigurasi Database

### Database Default
```bash
# Gunakan konfigurasi default
./configure.sh --show
# Output: DB_USER=mdva, DB_PASS=root, DB_NAME=mdva
```

### Database Custom
```bash
# Ubah username database
./configure.sh --db-user admin

# Ubah password database
./configure.sh --db-pass mysecretpassword

# Ubah nama database
./configure.sh --db-name myapp

# Ubah semua sekaligus
./configure.sh --db-user admin --db-pass mysecretpassword --db-name myapp
```

### Database Production
```bash
# Konfigurasi untuk production
./configure.sh \
  --db-user production_user \
  --db-pass "StrongPassword123!" \
  --db-name production_db
```

## 🔑 Konfigurasi JWT

```bash
# Generate JWT secret yang aman
JWT_SECRET=$(openssl rand -base64 32)

# Set JWT secret
./configure.sh --jwt-secret "$JWT_SECRET"
```

## 📱 Skenario Penggunaan

### 1. Development Local
```bash
# Port yang tidak konflik dengan service lain
./configure.sh --frontend-http-port 3000 --frontend-https-port 3001 --ssl false
./run.sh
```

### 2. Development dengan SSL
```bash
# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout certs/server.key -out certs/server.crt \
  -subj "/C=ID/ST=Jakarta/L=Jakarta/O=MDVA/OU=IT/CN=localhost"

# Enable SSL
./configure.sh --ssl true --frontend-http-port 3000 --frontend-https-port 3001
./run.sh
```

### 3. Staging Environment
```bash
# Port yang berbeda dari development
./configure.sh \
  --frontend-http-port 8080 \
  --frontend-https-port 8081 \
  --backend-http-port 4000 \
  --backend-https-port 4001 \
  --ssl true \
  --db-user staging_user \
  --db-pass staging_pass \
  --db-name staging_db
./run.sh
```

### 4. Production Environment
```bash
# Port standar production
./configure.sh \
  --frontend-http-port 80 \
  --frontend-https-port 443 \
  --backend-http-port 3001 \
  --backend-https-port 3002 \
  --ssl true \
  --db-user prod_user \
  --db-pass "VeryStrongPassword123!" \
  --db-name production_db \
  --jwt-secret "SuperSecretJWTKey2024!"
./run.sh
```

### 5. Testing Environment
```bash
# Port untuk testing
./configure.sh \
  --frontend-http-port 5000 \
  --frontend-https-port 5001 \
  --backend-http-port 6000 \
  --backend-https-port 6001 \
  --ssl false \
  --db-user test_user \
  --db-pass test_pass \
  --db-name test_db
./run.sh
```

## 🚨 Troubleshooting

### Port Sudah Digunakan
```bash
# Cek port yang sedang digunakan
lsof -i :8080

# Ubah ke port lain
./configure.sh --frontend-http-port 9090
```

### SSL Certificate Error
```bash
# Cek sertifikat
ls -la certs/

# Jika tidak ada, disable SSL
./configure.sh --ssl false

# Atau generate sertifikat baru
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout certs/server.key -out certs/server.crt \
  -subj "/C=ID/ST=Jakarta/L=Jakarta/O=MDVA/OU=IT/CN=localhost"
```

### Reset Semua Konfigurasi
```bash
# Reset ke default
./configure.sh --reset

# Hapus file .env
rm .env

# Jalankan quick start
./quick-start.sh
```

## 📋 Checklist Deployment

### Sebelum Deploy
- [ ] Port tidak konflik dengan service lain
- [ ] SSL certificate valid (jika SSL enabled)
- [ ] Database credentials aman
- [ ] JWT secret unik dan aman

### Setelah Deploy
- [ ] Frontend accessible di port yang dikonfigurasi
- [ ] Backend API berfungsi
- [ ] Database connection berhasil
- [ ] SSL berfungsi (jika enabled)

### Monitoring
- [ ] Check logs: `docker-compose logs -f`
- [ ] Check status: `docker-compose ps`
- [ ] Check ports: `netstat -tlnp | grep :8080`
