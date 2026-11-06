# วิธีทำงานร่วมกันบน GitHub

สมาชิกแต่ละคนสร้าง branch ของตัวเองจาก `main` เช่น `feature/menu`, `feature/orders` แล้ว commit และ push งานขึ้น GitHub

เมื่อพร้อมรวมงาน ให้เปิด Pull Request ไปที่ `main` อธิบายสิ่งที่ทำและวิธีทดสอบ จากนั้นให้เพื่อนอย่างน้อยหนึ่งคนตรวจโค้ดก่อน merge

หลัง merge Jenkins จะตรวจ commit ใหม่และรัน Build → Test → Deploy อัตโนมัติภายในประมาณ 2 นาที

ภาพประวัติ Pull Request และ Jenkins Stage View สามารถใช้ประกอบการนำเสนอได้
