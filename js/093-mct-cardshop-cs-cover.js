
/* ภาพปกเกม: ไอคอนแท็บ + ตราปกที่หน้าล็อบบี้ (ไม่แตะระบบเกม) */
(function(){
 const A=window.COVER_ASSETS;if(!A)return;
 try{const l=document.createElement('link');l.rel='icon';l.type='image/png';l.href=A.fav;document.head.appendChild(l);
 const a=document.createElement('link');a.rel='apple-touch-icon';a.href=A.icon;document.head.appendChild(a)}catch(e){}
 /* v177: ตราปกเกมที่หน้าล็อบบี้ถูกเอาออก */
})();

