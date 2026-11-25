/* MY COMPANY TYCOON — Co-op config
   ที่อยู่เซิร์ฟเวอร์ Co-op (ใช้เมื่อเปิดเกมจาก GitHub Pages หรือเปิดไฟล์ตรง ๆ)
   - ถ้าเปิดเกมจากเซิร์ฟเวอร์ตัวเอง (node server/server.js หรือ Render) ไม่ต้องตั้งค่า เกมจะใช้โดเมนเดียวกันเอง
   - หลังขึ้น Render แล้ว ให้แก้ลิงก์ด้านล่างให้ตรงกับ URL ของ service (เปลี่ยน https:// เป็น wss:// และต่อท้าย /ws)
   ผู้เล่นแก้เองในเกมได้ที่ Co-op > "ตั้งค่าเซิร์ฟเวอร์ (ขั้นสูง)" */
window.MCT_COOP_SERVER = 'wss://my-company-tycoon.onrender.com/ws';
