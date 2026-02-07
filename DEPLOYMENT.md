# การติดตั้งระบบ stn-map-tree บน Server

## ขั้นตอนการ Deploy

### 1. ติดตั้ง Dependencies

```bash
# ติดตั้ง Node.js และ npm (ถ้ายังไม่มี)
# สำหรับ Ubuntu/Debian:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# ติดตั้ง dependencies ของโปรเจค
cd /path/to/stn-map-tree
npm install
```

### 2. Build โปรเจค

```bash
npm run build
```

### 3. ตั้งค่า PM2 (Process Manager)

```bash
# ติดตั้ง PM2
sudo npm install -g pm2

# Start Next.js ด้วย PM2
pm2 start npm --name "stn-map-tree" -- start

# Save PM2 configuration
pm2 save

# ตั้งค่าให้ PM2 เริ่มต้นอัตโนมัติเมื่อ reboot
pm2 startup
```

### 4. ตั้งค่า Nginx

**สำหรับ Linux (Ubuntu/Debian):**

```bash
# ติดตั้ง nginx
sudo apt-get install nginx

# คัดลอกไฟล์ config
sudo cp nginx.conf /etc/nginx/sites-available/stn-map-tree

# แก้ไข server_name ใน config file
sudo nano /etc/nginx/sites-available/stn-map-tree
# เปลี่ยน "localhost" เป็น IP address หรือ domain name ของคุณ
# เช่น: server_name 192.168.1.100;

# สร้าง symbolic link
sudo ln -s /etc/nginx/sites-available/stn-map-tree /etc/nginx/sites-enabled/

# ลบ default site (ถ้ามี)
sudo rm /etc/nginx/sites-enabled/default

# ทดสอบ nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

**สำหรับ Windows:**

1. ดาวน์โหลด nginx สำหรับ Windows จาก http://nginx.org/en/download.html
2. แตกไฟล์ไปยังโฟลเดอร์ เช่น `C:\nginx`
3. คัดลอกเนื้อหาจากไฟล์ `nginx.conf` ในโปรเจคนี้
4. แก้ไขไฟล์ `C:\nginx\conf\nginx.conf`:
   - เปลี่ยน `server_name` เป็น IP address ของ server
   - ตรวจสอบว่า proxy_pass ชี้ไปที่ `http://localhost:3000`
5. เปิด Command Prompt ในโหมด Administrator
6. รัน nginx:
```cmd
cd C:\nginx
nginx.exe
```

### 5. ตั้งค่า Firewall

**Ubuntu/Debian:**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 3000/tcp
sudo ufw reload
```

**Windows:**
```powershell
# เปิด Windows Firewall
# ไปที่ Control Panel > Windows Defender Firewall > Advanced Settings
# สร้าง Inbound Rule สำหรับ port 80
```

## การแก้ไขปัญหา

### ปัญหา: เข้าจากภายนอกแสดงหน้า nginx default

**สาเหตุ:** nginx ไม่ได้ใช้ config ที่ถูกต้อง

**วิธีแก้:**

1. ตรวจสอบว่า Next.js app รันอยู่:
```bash
pm2 list
# หรือ
curl http://localhost:3000
```

2. ตรวจสอบ nginx config:
```bash
sudo nginx -t
```

3. ตรวจสอบว่าใช้ config ที่ถูกต้อง:
```bash
# ดูว่ามี symbolic link ไหม
ls -la /etc/nginx/sites-enabled/

# ดู nginx error log
sudo tail -f /var/log/nginx/error.log
```

4. **สำคัญ:** ลบ default site:
```bash
sudo rm /etc/nginx/sites-enabled/default
sudo systemctl reload nginx
```

### ปัญหา: เข้าจากภายในได้ แต่ภายนอกไม่ได้

**ตรวจสอบ:**

1. Firewall ต้องเปิด port 80:
```bash
sudo ufw status
```

2. ตรวจสอบว่า nginx listen ที่ 0.0.0.0 (ทุก IP):
```bash
sudo netstat -tlnp | grep nginx
# ควรเห็น: 0.0.0.0:80
```

3. ตรวจสอบ server_name ใน nginx config:
```nginx
server_name _;  # ใช้ _ เพื่อรับทุก request
# หรือ
server_name 192.168.1.100;  # ใส่ IP ของ server
```

### ปัญหา: 502 Bad Gateway

**สาเหตุ:** Next.js app ไม่รัน

**วิธีแก้:**
```bash
# ตรวจสอบ Next.js
pm2 logs stn-map-tree

# Restart Next.js
pm2 restart stn-map-tree
```

## การทดสอบ

1. **ทดสอบจากภายใน:**
```bash
curl http://localhost
```

2. **ทดสอบจากภายนอก:**
- เปิดเบราว์เซอร์
- พิมพ์ URL: `http://YOUR_SERVER_IP`

## Environment Variables (ถ้ามี)

สร้างไฟล์ `.env.local`:
```bash
DATABASE_URL=mysql://user:password@localhost:3306/database
NEXT_PUBLIC_API_URL=http://your-server-ip
```

จากนั้น restart PM2:
```bash
pm2 restart stn-map-tree --update-env
```

## Port Configuration

ถ้าต้องการเปลี่ยน port ของ Next.js:

1. แก้ไข `package.json`:
```json
{
  "scripts": {
    "start": "next start -p 3001"
  }
}
```

2. แก้ไข nginx.conf:
```nginx
proxy_pass http://localhost:3001;
```

3. Restart ทั้งคู่:
```bash
pm2 restart stn-map-tree
sudo systemctl reload nginx
```

## การ Monitor

```bash
# ดู logs ของ Next.js
pm2 logs stn-map-tree

# ดู nginx access log
sudo tail -f /var/log/nginx/stn-map-tree-access.log

# ดู nginx error log
sudo tail -f /var/log/nginx/stn-map-tree-error.log

# ดูสถานะ PM2
pm2 status
```
