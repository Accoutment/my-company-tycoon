MY COMPANY TYCOON — Co-op ออนไลน์: วิธีขึ้นเว็บให้เพื่อนเล่น

A) ทดสอบในเครื่อง (ต้องมี Node.js)
   เปิดหน้าต่างคำสั่งในโฟลเดอร์เกม แล้วพิมพ์:  node server/server.js
   เปิด http://localhost:3000  → กดปุ่ม "Co-op เล่นกับเพื่อน"

B) ขึ้น GitHub
   1. สร้าง repo ว่างบน GitHub ชื่อ  my-company-tycoon  (บัญชี Accoutment)
   2. ดับเบิลคลิก push_github.bat  (ล็อกอิน GitHub ถ้ามีหน้าต่างขึ้น)

C) ขึ้น Render (ให้เพื่อนเล่นออนไลน์ — ต้องทำ เพราะ GitHub Pages รันเซิร์ฟเวอร์ไม่ได้)
   1. render.com → New → Blueprint → เลือก repo my-company-tycoon → Apply
   2. ได้ลิงก์ เช่น https://my-company-tycoon.onrender.com  ← ส่งลิงก์นี้ให้เพื่อนเล่นได้เลย
   3. (ถ้าอยากเปิดเกมจาก GitHub Pages ด้วย) แก้ js/122-mct-coop-config.js ให้เป็น
      wss://<ชื่อ-service>.onrender.com/ws  แล้วรัน push_github.bat อีกครั้ง

หมายเหตุ: Render แบบฟรีจะหลับเมื่อไม่มีคนใช้ ~15 นาที คนแรกที่เข้าต้องรอปลุก 30–60 วินาที และห้องที่เปิดไว้จะหายไป
