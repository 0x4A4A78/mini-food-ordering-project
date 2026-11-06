# ครัวบ้านเรา — Mini Project ระบบสั่งอาหารบุฟเฟต์ที่โต๊ะ

เว็บจำลองการสั่งอาหารบุฟเฟต์จากโต๊ะสำหรับสาธิตงานกลุ่ม 3–4 คน ภายใน 2 สัปดาห์ มีเมนู 16 รายการ เลือกอาหารเป็นรอบ ติดตามสถานะ และหน้าครัวจัดการออเดอร์

## รันบนเครื่อง

ต้องมี Node.js 20 ขึ้นไป ไม่ต้องติดตั้งแพ็กเกจเพิ่มเติม

```powershell
npm run build
npm test
npm start
```

เปิด http://localhost:3000 ข้อมูลออเดอร์จะเก็บใน `data/orders.json` (ไม่ขึ้น Git)

## วิธีสาธิต

1. เปิด `http://localhost:3000/?table=4` เพื่อจำลองลิงก์ QR ประจำโต๊ะ 4 หรือเลือกโต๊ะในหน้าต่างเริ่มต้น
2. เลือกหมวดอาหาร เพิ่มจำนวน แล้วกด **ส่งรายการเข้าครัว**
3. เปิด **รายการที่สั่ง** เพื่อดูออเดอร์รอบที่ 1
4. กลับไปหน้าเมนู สั่งเพิ่มรอบที่ 2
5. เปิด **หน้าครัว** เปลี่ยนสถานะจาก ส่งเข้าครัวแล้ว → กำลังเตรียม → เสิร์ฟแล้ว
6. กลับไป **รายการที่สั่ง** แล้วกดอัปเดตสถานะ

> เป็นระบบจำลองเพื่อการเรียน ลิงก์โต๊ะเป็นตัวอย่างการสแกน QR ยังไม่มีการสร้าง QR จริง หน้าครัวยังไม่มีการยืนยันตัวตนและการชำระเงินจริง

## GitHub และ Jenkins (Windows)

1. สร้าง GitHub repository แล้วเพิ่มเพื่อนร่วมทีมเป็น collaborator
2. ตั้ง branch หลักชื่อ `main`; สมาชิกสร้าง branch งานของตน, commit, push และเปิด Pull Request เพื่อรวมโค้ด
3. ติดตั้ง Jenkins บนเครื่อง Windows ที่มี Node.js 20+ และ Git; ให้ Jenkins service account มีสิทธิ์เขียนในโฟลเดอร์ผู้ใช้
4. สร้าง Jenkins **Pipeline** แบบ Pipeline script from SCM ชี้ไปที่ branch `main` และ `Jenkinsfile`; repository นี้เป็น private จึงใช้ read-only deploy key ของ GitHub เป็น Jenkins SSH credential
5. กด Build Now ครั้งแรก จากนั้น `pollSCM` ใน `Jenkinsfile` จะตรวจ GitHub ทุกประมาณ 2 นาทีและรันเมื่อมี commit ใหม่ (เหมาะกับ Jenkins บนเครื่อง localhost)
6. Pipeline ทำ Checkout → Build (`npm run build`) → Test (`npm test`) → Deploy เฉพาะ branch `main`
7. Deploy คัดลอกไฟล์ไปยังโฟลเดอร์ผู้ใช้ของ Jenkins service, เปิดแอปเป็น Windows Scheduled Task ชื่อ `MiniProjectFoodOrdering` ที่ http://localhost:3001 และตรวจ `/api/health`

ถ้า Jenkins เครื่องนี้เป็น macOS/Linux ต้องเปลี่ยน `bat` และ `deploy.ps1` ให้ตรงระบบปฏิบัติการก่อนใช้งาน

## สิ่งที่ต้องส่ง

- ลิงก์ GitHub repository ที่มีประวัติ commit/PR ของสมาชิก
- ภาพหน้าจอ Jenkins ที่เห็น Build, Test, Deploy ผ่าน และ Console Output
- ไฟล์นำเสนอ `presentation.html` (เปิดในเบราว์เซอร์และกดลูกศรซ้าย/ขวา)
- พรอมป์สร้างสไลด์ Canva AI ใน `CANVA_PROMPT.md`

ภาพหลักฐานอยู่ใน `evidence/`: `jenkins-stage-view.png`, `jenkins-console-success.png`, `jenkins-auto-trigger.png`, `food-ordering-deployed.png`, `order-management.png`

## แผน 2 สัปดาห์

| ช่วง | งาน |
|---|---|
| วันที่ 1–2 | ตกลงขอบเขตและแบ่งงาน, ตั้ง GitHub/Jenkins |
| วันที่ 3–6 | ทำหน้าเว็บ, API, ตะกร้า, ออเดอร์ |
| วันที่ 7–9 | รวมโค้ดผ่าน PR, เขียนและรันทดสอบ |
| วันที่ 10–12 | ทำ Jenkins Build/Test/Deploy, แก้ปัญหา |
| วันที่ 13–14 | ซ้อมสาธิต, เก็บภาพ Jenkins, ปรับสไลด์ |

## แบ่งงาน

- คนที่ 1: หน้าเมนูและตะกร้า
- คนที่ 2: API และข้อมูลออเดอร์
- คนที่ 3: หน้าร้านและการทดสอบ
- คนที่ 4 (ถ้ามี): GitHub/Jenkins, เอกสารและสไลด์

ทุกคนควรมี commit และมีส่วนในการนำเสนอ
