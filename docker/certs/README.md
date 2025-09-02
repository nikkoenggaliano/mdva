# SSL Certificates

Folder ini berisi sertifikat SSL untuk aplikasi MDVA.

## File yang Diperlukan

- `server.crt` - Sertifikat SSL (public key)
- `server.key` - Private key SSL

## Cara Setup SSL

### 1. Self-Signed Certificate (Development)

```bash
# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout server.key -out server.crt \
  -subj "/C=ID/ST=Jakarta/L=Jakarta/O=MDVA/OU=IT/CN=localhost"
```

### 2. Let's Encrypt (Production)

```bash
# Install certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./server.crt
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./server.key
```

### 3. Commercial Certificate

Jika menggunakan sertifikat dari provider SSL, copy file `.crt` dan `.key` ke folder ini.

## Enable SSL

Setelah sertifikat tersedia, enable SSL:

```bash
# Enable SSL
./configure.sh --ssl true

# Restart services
./run.sh
```

## Disable SSL

```bash
# Disable SSL
./configure.sh --ssl false

# Restart services
./run.sh
```

## Troubleshooting

### Certificate not found
```
Error: SSL is enabled but certificates are missing!
```
**Solution:** Pastikan file `server.crt` dan `server.key` ada di folder ini.

### Invalid certificate
```
SSL certificate error
```
**Solution:** Pastikan sertifikat valid dan tidak expired.

### Permission denied
```
Permission denied reading certificate
```
**Solution:** Pastikan file memiliki permission yang benar (600 untuk .key, 644 untuk .crt).
