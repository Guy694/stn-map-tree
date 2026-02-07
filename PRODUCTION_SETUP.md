# คู่มือติดตั้งระบบ STN บน Production Server

## 📋 ภาพรวมระบบ

- **Server**: Ubuntu Linux
- **IP ภายใน**: 192.168.x.51
- **IP ภายนอก (Public)**: 203.xx.xx.51
- **Domain**: stn.moph.go.th
- **Firewall**: Sophos Firewall
- **Applications**:
  - stn-tree (Next.js) → http://stn.moph.go.th/stn-tree
  - stn-eoc (Next.js) → http://stn.moph.go.th/stn-eoc
- **Database**: MySQL (Docker)

---

## 🔧 ส่วนที่ 1: ติดตั้ง Docker และ Docker Compose

### 1.1 อัพเดท Ubuntu

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.2 ติดตั้ง Docker

```bash
# ติดตั้ง dependencies
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# เพิ่ม Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# เพิ่ม Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# ติดตั้ง Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# เพิ่ม user ปัจจุบันเข้า docker group
sudo usermod -aG docker $USER

# ทดสอบ Docker
sudo systemctl start docker
sudo systemctl enable docker
docker --version
```

### 1.3 ติดตั้ง Docker Compose

```bash
# ดาวน์โหลด Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# ให้สิทธิ์ execute
sudo chmod +x /usr/local/bin/docker-compose

# ทดสอบ
docker-compose --version
```

---

## 🏗️ ส่วนที่ 2: Setup โปรเจค

### 2.1 สร้างโครงสร้างโฟลเดอร์

```bash
# สร้างโฟลเดอร์หลัก
sudo mkdir -p /var/www/stn
cd /var/www/stn

# สร้างโฟลเดอร์สำหรับแต่ละโปรเจค
sudo mkdir -p stn-tree stn-eoc database

# ตั้งค่า ownership
sudo chown -R $USER:$USER /var/www/stn
```

### 2.2 Setup stn-tree Project

```bash
cd /var/www/stn/stn-tree

# คัดลอกโค้ดจากเครื่อง development หรือ git clone
# ตัวอย่าง:
# git clone https://github.com/your-repo/stn-tree.git .

# หรือใช้ rsync/scp ในการอัพโหลด
```

### 2.3 Setup stn-eoc Project

```bash
cd /var/www/stn/stn-eoc

# คัดลอกโค้ด stn-eoc
# git clone หรือ upload ไฟล์

# สำคัญ: แก้ไข docker-compose.yml ให้ port เป็น 3001
```

### 2.4 แก้ไข next.config.js สำหรับ Base Path

**สำหรับ stn-tree** (ที่ `/var/www/stn/stn-tree/next.config.js`):
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/stn-tree',
  assetPrefix: '/stn-tree',
  output: 'standalone',
  // ... config อื่นๆ
}

module.exports = nextConfig
```

**สำหรับ stn-eoc** (ที่ `/var/www/stn/stn-eoc/next.config.js`):
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/stn-eoc',
  assetPrefix: '/stn-eoc',
  output: 'standalone',
  // ... config อื่นๆ
}

module.exports = nextConfig
```

### 2.5 สร้าง .env.production

**สำหรับ stn-tree**:
```bash
cd /var/www/stn/stn-tree
nano .env.production
```

```env
NODE_ENV=production
PORT=3000
DATABASE_HOST=mysql
DATABASE_PORT=3306
DATABASE_NAME=stn_tree
DATABASE_USER=stn_user
DATABASE_PASSWORD=YourSecurePassword123!

# Public URL
NEXT_PUBLIC_BASE_URL=http://stn.moph.go.th/stn-tree
NEXT_PUBLIC_API_URL=http://stn.moph.go.th/stn-tree/api
```

**สำหรับ stn-eoc** (เปลี่ยน port เป็น 3001):
```bash
cd /var/www/stn/stn-eoc
nano .env.production
```

```env
NODE_ENV=production
PORT=3001
DATABASE_HOST=mysql
DATABASE_PORT=3306
DATABASE_NAME=stn_eoc
DATABASE_USER=stn_user
DATABASE_PASSWORD=YourSecurePassword123!

NEXT_PUBLIC_BASE_URL=http://stn.moph.go.th/stn-eoc
NEXT_PUBLIC_API_URL=http://stn.moph.go.th/stn-eoc/api
```

---

## 🐳 ส่วนที่ 3: Docker Setup

### 3.1 สร้าง Docker Compose สำหรับทั้งระบบ

สร้างไฟล์ `/var/www/stn/docker-compose.yml`:

```yaml
version: '3.8'

services:
  # MySQL Database (ใช้ร่วมกันทั้ง 2 โปรเจค)
  mysql:
    image: mysql:8.0
    container_name: stn-mysql
    restart: unless-stopped
    environment:
      - MYSQL_ROOT_PASSWORD=RootPassword123!
      - MYSQL_DATABASE=stn_tree
      - MYSQL_USER=stn_user
      - MYSQL_PASSWORD=YourSecurePassword123!
    ports:
      - "3306:3306"
    volumes:
      - ./database/data:/var/lib/mysql
      - ./database/init:/docker-entrypoint-initdb.d
    networks:
      - stn-network

  # STN-Tree Application
  stn-tree:
    build:
      context: ./stn-tree
      dockerfile: Dockerfile
    container_name: stn-tree-app
    restart: unless-stopped
    env_file:
      - ./stn-tree/.env.production
    ports:
      - "3000:3000"
    depends_on:
      - mysql
    networks:
      - stn-network
    volumes:
      - ./stn-tree/uploads:/app/uploads

  # STN-EOC Application
  stn-eoc:
    build:
      context: ./stn-eoc
      dockerfile: Dockerfile
    container_name: stn-eoc-app
    restart: unless-stopped
    env_file:
      - ./stn-eoc/.env.production
    ports:
      - "3001:3001"
    depends_on:
      - mysql
    networks:
      - stn-network
    volumes:
      - ./stn-eoc/uploads:/app/uploads

  # PhpMyAdmin (Optional)
  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    container_name: stn-phpmyadmin
    restart: unless-stopped
    environment:
      - PMA_HOST=mysql
      - PMA_PORT=3306
      - PMA_USER=root
      - PMA_PASSWORD=RootPassword123!
    ports:
      - "8080:80"
    depends_on:
      - mysql
    networks:
      - stn-network

networks:
  stn-network:
    driver: bridge
```

### 3.2 สร้าง Database Init Script

```bash
mkdir -p /var/www/stn/database/init
nano /var/www/stn/database/init/01-create-databases.sql
```

```sql
-- สร้าง database สำหรับ stn-eoc
CREATE DATABASE IF NOT EXISTS stn_eoc;

-- Grant permissions
GRANT ALL PRIVILEGES ON stn_tree.* TO 'stn_user'@'%';
GRANT ALL PRIVILEGES ON stn_eoc.* TO 'stn_user'@'%';
FLUSH PRIVILEGES;
```

### 3.3 Build และ Run Docker Containers

```bash
cd /var/www/stn

# Build images
docker-compose build

# Start containers
docker-compose up -d

# ตรวจสอบสถานะ
docker-compose ps

# ดู logs
docker-compose logs -f
```

---

## 🌐 ส่วนที่ 4: ติดตั้งและ Config Nginx

### 4.1 ติดตั้ง Nginx

```bash
sudo apt install -y nginx
```

### 4.2 สร้าง Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/stn.moph.go.th
```

คัดลอกเนื้อหาจากไฟล์ `nginx.conf` ที่ผมสร้างให้ (แก้ไข IP ให้ตรงกับ public IP จริง)

### 4.3 Enable Site และ Disable Default

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/stn.moph.go.th /etc/nginx/sites-enabled/

# Disable default site
sudo rm /etc/nginx/sites-enabled/default

# ทดสอบ configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Enable nginx on boot
sudo systemctl enable nginx
```

---

## 🔥 ส่วนที่ 5: Config Sophos Firewall

### 5.1 Port Forwarding (NAT Rule)

เข้าไปที่ Sophos Firewall Web Interface:

#### สำหรับ HTTP (Port 80):
1. ไปที่ **Network → NAT**
2. คลิก **Add NAT Rule**
3. ตั้งค่า:
   - **Rule Name**: `STN-HTTP-Inbound`
   - **Type**: DNAT (Destination NAT)
   - **Source**: Any (หรือจำกัดเฉพาะ IP ที่ต้องการ)
   - **Destination**: WAN Interface / Public IP (203.xx.xx.51)
   - **Service**: HTTP (Port 80)
   - **Translated Destination**: 192.168.x.51 (IP ของ server)
   - **Translated Service**: HTTP (Port 80)
4. **Save และ Apply**

#### สำหรับ HTTPS (Port 443) - ถ้ามี SSL:
- ทำเหมือนข้างบนแต่เปลี่ยนเป็น Port 443

### 5.2 Firewall Rule

1. ไปที่ **Protect → Firewall Rules**
2. คลิก **Add Firewall Rule**
3. ตั้งค่า:
   - **Rule Name**: `Allow-STN-HTTP-Inbound`
   - **Source**: Any (หรือจำกัด IP range)
   - **Destination**: 192.168.x.51
   - **Service**: HTTP, HTTPS
   - **Action**: Accept
4. **Save และ Apply**

### 5.3 ตรวจสอบ NAT และ Firewall

```bash
# จากเครื่อง server ทดสอบว่า nginx ทำงาน
curl http://localhost

# ทดสอบจากภายนอก (ใช้เครื่องอื่นที่อยู่นอก network)
curl http://203.xx.xx.51
curl http://stn.moph.go.th/stn-tree
```

---

## 🌍 ส่วนที่ 6: ตั้งค่า DNS

### 6.1 A Record

ติดต่อผู้ดูแล DNS ของ moph.go.th เพื่อเพิ่ม A Record:

```
stn.moph.go.th → 203.xx.xx.51
```

### 6.2 ทดสอบ DNS

```bash
# ทดสอบว่า DNS ทำงานแล้ว
nslookup stn.moph.go.th
dig stn.moph.go.th

# ทดสอบเข้าเว็บ
curl http://stn.moph.go.th/stn-tree
curl http://stn.moph.go.th/stn-eoc
```

---

## 🔒 ส่วนที่ 7: ติดตั้ง SSL Certificate (Optional แต่แนะนำ)

### 7.1 ใช้ Let's Encrypt (ฟรี)

```bash
# ติดตั้ง Certbot
sudo apt install -y certbot python3-certbot-nginx

# สร้าง certificate
sudo certbot --nginx -d stn.moph.go.th

# ตอบคำถาม:
# - Email: your-email@moph.go.th
# - Agree to terms: Yes
# - Redirect HTTP to HTTPS: Yes

# Certificate จะ auto-renew
# ทดสอบ renewal
sudo certbot renew --dry-run
```

### 7.2 หรือใช้ Certificate ที่มีอยู่แล้ว

```bash
# คัดลอก certificate files
sudo cp your-cert.crt /etc/nginx/ssl/stn.moph.go.th.crt
sudo cp your-cert.key /etc/nginx/ssl/stn.moph.go.th.key

# ตั้งค่า permissions
sudo chmod 600 /etc/nginx/ssl/*

# Uncomment HTTPS section ใน nginx config
sudo nano /etc/nginx/sites-available/stn.moph.go.th

# Reload nginx
sudo systemctl reload nginx
```

---

## 📊 ส่วนที่ 8: Testing และ Monitoring

### 8.1 ทดสอบระบบ

```bash
# 1. ทดสอบ Docker containers
docker-compose ps

# 2. ทดสอบ MySQL connection
docker exec -it stn-mysql mysql -u stn_user -p

# 3. ทดสอบ Next.js apps
curl http://localhost:3000
curl http://localhost:3001

# 4. ทดสอบผ่าน Nginx
curl http://localhost/stn-tree
curl http://localhost/stn-eoc

# 5. ทดสอบจากภายนอก
curl http://stn.moph.go.th/stn-tree
curl http://stn.moph.go.th/stn-eoc
```

### 8.2 ดู Logs

```bash
# Docker logs
docker-compose logs -f stn-tree
docker-compose logs -f stn-eoc
docker-compose logs -f mysql

# Nginx logs
sudo tail -f /var/log/nginx/stn-access.log
sudo tail -f /var/log/nginx/stn-error.log

# System logs
sudo journalctl -u nginx -f
```

### 8.3 ติดตั้ง Monitoring Tools (Optional)

```bash
# ติดตั้ง htop
sudo apt install -y htop

# ติดตั้ง netdata (real-time monitoring)
bash <(curl -Ss https://my-netdata.io/kickstart.sh)

# เข้าดู monitoring ที่
http://192.168.x.51:19999
```

---

## 🔄 ส่วนที่ 9: การอัพเดทระบบ

### 9.1 อัพเดทโค้ด

```bash
cd /var/www/stn/stn-tree

# Pull โค้ดใหม่
git pull origin main

# Rebuild และ restart
docker-compose up -d --build stn-tree
```

### 9.2 Backup Database

```bash
# สร้าง backup script
nano /var/www/stn/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/www/stn/database/backups"
mkdir -p $BACKUP_DIR

# Backup stn_tree
docker exec stn-mysql mysqldump -u root -pRootPassword123! stn_tree > $BACKUP_DIR/stn_tree_$DATE.sql

# Backup stn_eoc
docker exec stn-mysql mysqldump -u root -pRootPassword123! stn_eoc > $BACKUP_DIR/stn_eoc_$DATE.sql

# ลบ backup เก่าที่เกิน 30 วัน
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $DATE"
```

```bash
# ให้สิทธิ์ execute
chmod +x /var/www/stn/backup-db.sh

# ตั้งค่า cron job (backup ทุกวันเวลา 2:00 AM)
crontab -e

# เพิ่มบรรทัด:
0 2 * * * /var/www/stn/backup-db.sh >> /var/www/stn/backup.log 2>&1
```

---

## ⚠️ ส่วนที่ 10: Troubleshooting

### ปัญหาที่พบบ่อย:

#### 1. เข้าจากภายนอกไม่ได้ (แสดง nginx default)

**แก้ไข:**
```bash
# ตรวจสอบว่า nginx ใช้ config ที่ถูกต้อง
sudo nginx -t

# ลบ default site
sudo rm /etc/nginx/sites-enabled/default

# Reload nginx
sudo systemctl reload nginx
```

#### 2. 502 Bad Gateway

**สาเหตุ:** Docker containers ไม่รัน

**แก้ไข:**
```bash
# ตรวจสอบ containers
docker-compose ps

# Restart containers
docker-compose restart stn-tree stn-eoc

# ดู logs
docker-compose logs stn-tree
```

#### 3. CSS/JS ไม่โหลด (404)

**สาเหตุ:** basePath ใน next.config.js ไม่ถูกต้อง

**แก้ไข:**
- ตรวจสอบ `basePath` และ `assetPrefix` ใน next.config.js
- Rebuild Docker image: `docker-compose up -d --build`

#### 4. Database connection error

**แก้ไข:**
```bash
# ตรวจสอบ MySQL container
docker-compose logs mysql

# ทดสอบ connection
docker exec -it stn-mysql mysql -u stn_user -pstn_password

# Restart MySQL
docker-compose restart mysql
```

#### 5. Sophos Firewall ไม่ forward traffic

**แก้ไข:**
- ตรวจสอบ NAT Rule ว่าใช้ Public IP และ Internal IP ถูกต้อง
- ตรวจสอบ Firewall Rule ว่า Allow traffic
- ดู Live Log ใน Sophos เพื่อดูว่า packet ถูก block ไหม

---

## 📝 Checklist การติดตั้ง

- [ ] ติดตั้ง Docker และ Docker Compose
- [ ] สร้างโครงสร้างโฟลเดอร์ /var/www/stn
- [ ] Upload โค้ด stn-tree และ stn-eoc
- [ ] แก้ไข next.config.js ให้มี basePath
- [ ] สร้าง .env.production สำหรับทั้ง 2 โปรเจค
- [ ] สร้าง docker-compose.yml
- [ ] Build และ run Docker containers
- [ ] ติดตั้ง Nginx
- [ ] สร้าง nginx config file
- [ ] Enable site และ disable default
- [ ] Config Sophos Firewall (NAT + Firewall Rule)
- [ ] ตั้งค่า DNS A Record
- [ ] ทดสอบเข้าจากภายนอก
- [ ] ติดตั้ง SSL Certificate (ถ้าต้องการ HTTPS)
- [ ] Setup backup script
- [ ] ติดตั้ง monitoring tools

---

## 🎯 สรุป

หลังจากติดตั้งเสร็จแล้ว ผู้ใช้สามารถเข้าถึงระบบได้ดังนี้:

- **STN-Tree**: http://stn.moph.go.th/stn-tree
- **STN-EOC**: http://stn.moph.go.th/stn-eoc
- **phpMyAdmin**: http://192.168.x.51:8080 (เฉพาะภายใน)

การ traffic flow:
```
Internet → Public IP (203.xx.xx.51) 
  → Sophos Firewall (NAT) 
  → Internal IP (192.168.x.51) 
  → Nginx (Reverse Proxy)
  → Docker Containers (stn-tree:3000, stn-eoc:3001)
```
