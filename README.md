# UmamiUnit Backend — งานที่มอบหมายครั้งที่ 2

เว็บ UmamiUnit เดิม (งานที่ 1) + เชื่อมต่อฐานข้อมูล MongoDB ผ่าน Node.js/Express API

## โครงสร้างฐานข้อมูล (2 ตาราง มีความสัมพันธ์)

- **Category** (`models/Category.js`) — หมวดหมู่สินค้า: `key`, `name`, `icon`
- **Product** (`models/Product.js`) — สินค้า: มีฟิลด์ `category` เป็น `ObjectId` อ้างอิงไปยัง `Category`
  (ความสัมพันธ์แบบ **1 หมวดหมู่ : หลายสินค้า**)

## โครงสร้างโปรเจกต์

```
umamiunit-backend/
├── server.js              # จุดเริ่มต้นของ Express server
├── config/db.js           # เชื่อมต่อ MongoDB
├── models/
│   ├── Category.js
│   └── Product.js
├── routes/
│   ├── categoryRoutes.js  # CRUD: GET/POST/PUT/DELETE /api/categories
│   └── productRoutes.js   # CRUD: GET/POST/PUT/DELETE /api/products
├── seed.js                 # สคริปต์ใส่ข้อมูลตัวอย่าง (30 สินค้า, 7 หมวดหมู่)
├── public/                 # หน้าเว็บ (frontend)
│   ├── index.html          # หน้าร้านเดิม (ดึงข้อมูลจาก API แทน array hardcode)
│   ├── app.js               # แก้ไขให้ fetch('/api/categories'), fetch('/api/products')
│   ├── admin.html / admin.js # หน้า Admin เพิ่ม/ลบ/แก้ไขข้อมูลทั้ง 2 ตาราง (ไม่ต้องล็อกอิน)
│   └── output.css
└── .env.example
```

## วิธีติดตั้งและรัน (ทำในเครื่องของคุณ)

### 1) ติดตั้ง MongoDB
เลือกวิธีใดวิธีหนึ่ง:
- **ลงในเครื่อง**: ติดตั้ง MongoDB Community Server แล้วรัน `mongod` ให้ทำงานที่ `localhost:27017`
- **ใช้ MongoDB Atlas (แนะนำ ง่ายกว่า)**: สมัครฟรีที่ https://www.mongodb.com/cloud/atlas แล้วสร้าง cluster, เอา connection string มาใส่ใน `.env`

### 2) ติดตั้ง dependencies
```bash
cd umamiunit-backend
npm install
```

### 3) ตั้งค่าไฟล์ .env
```bash
cp .env.example .env
# แล้วแก้ MONGODB_URI ให้ตรงกับฐานข้อมูลของคุณ
```

### 4) ใส่ข้อมูลตัวอย่างลงฐานข้อมูล (สำคัญ ต้องรันก่อนครั้งแรก)
```bash
npm run seed
```

### 5) รันเซิร์ฟเวอร์
```bash
npm start
```
แล้วเปิดเบราว์เซอร์ไปที่ **http://localhost:5000**
- หน้าร้าน: `http://localhost:5000/index.html`
- หน้า Admin (เพิ่ม/ลบ/แก้ไข): `http://localhost:5000/admin.html`

## API Endpoints

| Method | Endpoint              | ใช้ทำอะไร               |
|--------|------------------------|--------------------------|
| GET    | /api/categories        | ดูหมวดหมู่ทั้งหมด        |
| GET    | /api/categories/:id    | ดูหมวดหมู่เดียว          |
| POST   | /api/categories        | เพิ่มหมวดหมู่            |
| PUT    | /api/categories/:id    | แก้ไขหมวดหมู่            |
| DELETE | /api/categories/:id    | ลบหมวดหมู่ (ลบไม่ได้ถ้ามีสินค้าผูกอยู่) |
| GET    | /api/products          | ดูสินค้าทั้งหมด (รองรับ `?category=<key>`) |
| GET    | /api/products/:id      | ดูสินค้าชิ้นเดียว         |
| POST   | /api/products          | เพิ่มสินค้า              |
| PUT    | /api/products/:id      | แก้ไขสินค้า              |
| DELETE | /api/products/:id      | ลบสินค้า                |

## แนวทางเขียนรายงาน (1 คะแนน)

รายงานควรมี:
1. **โครงสร้างฐานข้อมูล** — สกรีนช็อต Category/Product schema พร้อมอธิบายความสัมพันธ์ (ObjectId reference)
2. **โค้ด API** — แปะโค้ด routes + อธิบายว่าแต่ละ route ทำอะไร (พร้อมสกรีนช็อตผลลัพธ์จาก Postman)
3. **หน้าเว็บที่เชื่อมต่อฐานข้อมูลจริง** — สกรีนช็อตหน้าร้าน (index.html) ที่แสดงสินค้าจาก MongoDB และหน้า admin.html ที่เพิ่ม/ลบ/แก้ไขได้จริง
4. **อธิบายความซับซ้อนที่เพิ่มเข้ามา** เช่น
   - ป้องกันการลบหมวดหมู่ที่ยังมีสินค้าผูกอยู่ (data integrity)
   - ใช้ `.populate()` ดึงข้อมูลจากตารางที่สัมพันธ์กันมาแสดงในคำตอบเดียว
   - รองรับการกรองสินค้าตามหมวดหมู่ผ่าน query string (`?category=`)
   - แยกหน้า Admin ออกจากหน้าร้าน โดยไม่ใช้ระบบสมาชิก/ล็อกอิน

## หมายเหตุ
- โปรเจกต์นี้สร้างโค้ดให้ครบแล้ว แต่ **ยังไม่ได้รันจริง** เพราะเครื่องมือของผมไม่มีการเชื่อมต่ออินเทอร์เน็ต/MongoDB ให้ทดสอบ — กรุณา `npm install` และรันตามขั้นตอนด้านบนในเครื่องของคุณเอง แล้วลองทดสอบทุกฟังก์ชันก่อนส่งงาน
- โฟลเดอร์ `images/` ยังไม่มีรูปสินค้าจริง ถ้าไม่มีรูป ระบบจะ fallback เป็นอีโมจิไอคอนแทนอัตโนมัติ (โค้ด `onerror` ในการ์ดสินค้า)
