# ครัวบ้านเรา — Mini Project ระบบสั่งอาหาร

เว็บสั่งอาหารร้านเดียวสำหรับสาธิตงานกลุ่ม 3–4 คน ภายใน 2 สัปดาห์ มีเมนู ตะกร้า บันทึกออเดอร์ ติดตามสถานะ และหน้าร้านจัดการออเดอร์

## รันบนเครื่อง

ต้องมี Node.js 20 ขึ้นไป ไม่ต้องติดตั้งแพ็กเกจเพิ่มเติม

```powershell
npm run build
npm test
npm start
```

เปิด http://localhost:3000 ข้อมูลออเดอร์จะเก็บใน `data/orders.json` (ไม่ขึ้น Git)

## วิธีสาธิต

1. เปิดแท็บ **สั่งอาหาร** เลือกเมนูและใส่ชื่อผู้สั่ง
2. กด **ยืนยันคำสั่งซื้อ**
3. เปิดแท็บ **สถานะออเดอร์** เพื่อดูออเดอร์ของเบราว์เซอร์นี้
4. เปิดแท็บ **หน้าร้าน** เปลี่ยนสถานะจาก รอรับออเดอร์ → กำลังทำ → เสร็จแล้ว
5. กลับไปแท็บสถานะออเดอร์แล้วกดรีเฟรช

> เป็นระบบจำลองเพื่อการเรียน หน้าร้านยังไม่มีการยืนยันตัวตนและการชำระเงินจริง

## GitHub และ Jenkins (Windows)

1. สร้าง GitHub repository แล้วเพิ่มเพื่อนร่วมทีมเป็น collaborator
2. ตั้ง branch หลักชื่อ `main`; สมาชิกสร้าง branch งานของตน, commit, push และเปิด Pull Request เพื่อรวมโค้ด
3. ติดตั้ง Jenkins บนเครื่อง Windows ที่มี Node.js 20+ และ Git; ให้ Jenkins service account มีสิทธิ์เขียนในโฟลเดอร์ผู้ใช้
4. สร้าง Jenkins **Multibranch Pipeline** เชื่อม GitHub repository; Jenkins จะอ่าน `Jenkinsfile` จากแต่ละ branch
5. กด Scan Repository Now / Build Now เพื่อเริ่มต้น; ถ้าต้องการให้รันทุก push ให้ตั้ง GitHub webhook ไปยัง `https://<jenkins-host>/github-webhook/` (Jenkins ต้องเข้าถึงได้จาก GitHub)
6. Pipeline ทำ Checkout → Build (`npm run build`) → Test (`npm test`) → Deploy เฉพาะ branch `main`
7. Deploy คัดลอกไฟล์ไปยังโฟลเดอร์ผู้ใช้ของ Jenkins service, เปิดแอปเป็น Windows Scheduled Task ชื่อ `MiniProjectFoodOrdering` ที่ http://localhost:3001 และตรวจ `/api/health`

ถ้า Jenkins เครื่องนี้เป็น macOS/Linux ต้องเปลี่ยน `bat` และ `deploy.ps1` ให้ตรงระบบปฏิบัติการก่อนใช้งาน

## สิ่งที่ต้องส่ง

- ลิงก์ GitHub repository ที่มีประวัติ commit/PR ของสมาชิก
- ภาพหน้าจอ Jenkins ที่เห็น Build, Test, Deploy ผ่าน และ Console Output
- ไฟล์นำเสนอ `presentation.html` (เปิดในเบราว์เซอร์และกดลูกศรซ้าย/ขวา)

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
