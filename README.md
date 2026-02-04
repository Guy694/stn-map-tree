# 🌳 ระบบแผนที่และบันทึกข้อมูลต้นไม้ จังหวัดสตูล

ระบบแผนที่แสดงขอบเขตการปกครองจังหวัดสตูล พร้อมระบบบันทึกข้อมูลการปลูกต้นไม้

## ✨ คุณสมบัติ

- 🗺️ **แผนที่ 3 ชั้น Polygon**: แสดงขอบเขตอำเภอ ตำบล และหมู่บ้าน
- 🔐 **ระบบ Login**: เข้าสู่ระบบด้วย Username/Password
- 🌳 **บันทึกข้อมูลต้นไม้**: บันทึกตำแหน่ง ชื่อต้นไม้ จำนวน และข้อมูลการปลูก
- 📍 **ระบุตำแหน่งอัตโนมัติ**: คลิก Polygon บนแผนที่เพื่อกรอกข้อมูลที่ตั้งอัตโนมัติ
- 👥 **จัดการผู้ใช้**: ระบบสมัครสมาชิกและจดจำข้อมูลผู้บันทึก

## 🚀 การติดตั้ง

### ข้อกำหนด

- Node.js 18+
- Docker (MySQL container running on localhost:3306)
- ฐานข้อมูล MySQL: `stn_tree`

### ขั้นตอนการติดตั้ง

1. **ติดตั้ง Dependencies**

```bash
npm install
```

2. **ตั้งค่า Environment Variables**

ไฟล์ `.env` มีการตั้งค่าดังนี้:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=123456
DB_NAME=stn_tree
DB_PORT=3306
```

3. **Import ฐานข้อมูล**

รัน script นี้เพื่อสร้างตารางและ import ข้อมูล polygon:

```bash
./import_database.sh
```

Script จะทำการ:
- สร้างฐานข้อมูล `stn_tree`
- สร้างตาราง users, trees, และ polygon tables
- Import ข้อมูลอำเภอ ตำบล และหมู่บ้านของจังหวัดสตูล
- สร้าง Admin account เริ่มต้น

**บัญชี Admin เริ่มต้น:**
- Username: `admin`
- Password: `admin123`

4. **รันเซิร์ฟเวอร์**

```bash
npm run dev
```

5. **เปิดใช้งาน**

เปิดเบราว์เซอร์และไปที่: [http://localhost:3000](http://localhost:3000)

## 📖 การใช้งาน

### 1. เข้าสู่ระบบ

- คลิกปุ่ม "เข้าสู่ระบบ" ที่มุมบนขวา
- ใช้บัญชี admin หรือสมัครสมาชิกใหม่

### 2. บันทึกข้อมูลต้นไม้

1. คลิกปุ่ม "🌳 บันทึกต้นไม้"
2. คลิกบนแผนที่หรือคลิกที่ Polygon เพื่อเลือกตำแหน่ง
3. กรอกข้อมูล:
   - ชื่อต้นไม้
   - จำนวน
   - ที่ตั้ง (หมู่บ้าน ตำบล อำเภอ) - จะถูกกรอกอัตโนมัติถ้าคลิก Polygon
   - รายละเอียดเพิ่มเติม
4. คลิก "💾 บันทึก"

### 3. ดูข้อมูลต้นไม้

- คลิกที่ marker 🌳 บนแผนที่เพื่อดูรายละเอียด
- จำนวนต้นไม้ทั้งหมดจะแสดงที่มุมบนขวา

### 4. จัดการชั้นข้อมูล Polygon

ใช้ Legend ที่มุมล่างซ้ายเพื่อ:
- ✅ เปิด/ปิดการแสดงอำเภอ (สีน้ำเงิน)
- ✅ เปิด/ปิดการแสดงตำบล (สีเขียว)
- ✅ เปิด/ปิดการแสดงหมู่บ้าน (สีส้ม)

## 🗄️ โครงสร้างฐานข้อมูล

### ตาราง `users`
- บันทึกข้อมูลผู้ใช้งาน
- เก็บ username, password (hashed), ชื่อ-นามสกุล, role

### ตาราง `trees`
- บันทึกข้อมูลต้นไม้ที่ปลูก
- เก็บ user_id, ชื่อต้นไม้, จำนวน, ตำแหน่ง (lat/lng), ข้อมูลที่ตั้ง

### ตาราง `districts_polygon`
- ข้อมูล Polygon ขอบเขตอำเภอ

### ตาราง `tambons_polygon`
- ข้อมูล Polygon ขอบเขตตำบล

### ตาราง `villages_polygon`
- ข้อมูล Polygon ขอบเขตหมู่บ้าน

## 🛠️ เทคโนโลยีที่ใช้

- **Frontend**: Next.js 16, React 19
- **Map**: Leaflet, React-Leaflet
- **Database**: MySQL 8.0
- **Authentication**: bcryptjs + Session cookies
- **Styling**: Tailwind CSS 4

## 📁 โครงสร้างโปรเจกต์

```
stn-map-tree/
├── app/
│   ├── api/
│   │   ├── auth/         # API routes สำหรับ authentication
│   │   ├── polygons/     # API routes สำหรับดึงข้อมูล polygon
│   │   └── trees/        # API routes สำหรับจัดการข้อมูลต้นไม้
│   ├── components/
│   │   ├── MapComponent.js    # แผนที่พร้อม layers
│   │   ├── Legend.js          # ตัวควบคุมแสดง/ซ่อน layers
│   │   ├── RecordModal.js     # ฟอร์มบันทึกข้อมูลต้นไม้
│   │   └── LoginModal.js      # ฟอร์ม login/register
│   ├── page.js           # หน้าหลัก
│   └── layout.js
├── lib/
│   └── db.js            # Database connection utility
├── database_schema.sql  # Schema ฐานข้อมูล
├── import_database.sh   # Script import ฐานข้อมูล
└── .env                # Configuration

```

## 🔒 ความปลอดภัย

- รหัสผ่านถูก hash ด้วย bcrypt
- Session ใช้ httpOnly cookies
- API routes มีการตรวจสอบ authentication
- ใช้ prepared statements ป้องกัน SQL injection

## 🐛 การแก้ไขปัญหา

### ไม่สามารถเชื่อมต่อฐานข้อมูล

1. ตรวจสอบว่า Docker MySQL container ทำงานอยู่
2. ตรวจสอบ credentials ใน `.env`
3. ลอง connect ผ่าน MySQL client:
   ```bash
   mysql -h localhost -u root -p123456
   ```

### Polygon ไม่แสดงบนแผนที่

1. ตรวจสอบว่า import database สำเร็จ
2. เปิด Browser Console ดู error
3. ตรวจสอบ API responses: `/api/polygons/districts`, `/api/polygons/tambons`, `/api/polygons/villages`

### ไม่สามารถบันทึกข้อมูลได้

1. ต้อง login ก่อนบันทึกข้อมูล
2. ตรวจสอบ Browser Console
3. ตรวจสอบ Network tab ใน DevTools

## 📝 License

MIT

## 👨‍💻 ผู้พัฒนา

Satun EOC Team
