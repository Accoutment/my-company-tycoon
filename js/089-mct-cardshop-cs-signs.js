
/* ===== ป้ายบอกทาง (แทนมินิแมพ) — วาดในโลกของฉากถนน ไม่มีระบบใหม่ ไม่เก็บเซฟ =====
 * ลำดับถนน: บริษัท/สี่แยก ◀ โชว์รูมรถ ◀▶ SNOOKER CLUB ◀▶ อควาเรียม ◀▶ CARD SHOP */
(function(){
const SG={
 carst:{y:440,L:[['สี่แยก · บริษัท','◀','#4aa3ff']],R:[['SNOOKER CLUB','▶','#2fbf71']]},
 snkst:{y:342,L:[['โชว์รูมรถ','◀','#e25555']],R:[['อควาเรียม','▶','#2bb8c9']]},
 aqst:{y:432,L:[['SNOOKER CLUB','◀','#2fbf71']],R:[['CARD SHOP · ประมูล','▶','#b36bff']]},
 cardst:{y:342,L:[['อควาเรียม','◀','#2bb8c9']],R:[['NICECLUB','▶','#ff4fd8']]},
 ncst:{y:342,L:[['CARD SHOP · ประมูล','◀','#b36bff']],R:[['FOREST RIVER','▶','#3fbf6a']]}
};
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function post(g,x,base,items,side){
 const ph=34+items.length*26;
 g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(x,base+2,14,5,0,0,7);g.fill();
 g.fillStyle='#4b4f58';g.fillRect(x-3,base-ph,6,ph);g.fillStyle='#2c2f36';g.fillRect(x+1,base-ph,2,ph);
 g.fillStyle='#ffd445';g.fillRect(x-5,base-ph-3,10,4);
 g.font='bold 13px sans-serif';g.textBaseline='middle';
 items.forEach((it,i)=>{
  const t=it[0],ar=it[1],w=Math.ceil(g.measureText(t).width)+44,h=22,y=base-ph+8+i*26;
  const left=side<0; // ป้ายชี้ไปทางซ้าย/ขวา: ยื่นออกจากเสาไปทางทิศที่ชี้
  const x0=left?x-6:x-w+6; // ป้ายยื่นเข้าหาจอ (ไม่หลุดขอบ) ลูกศรอยู่ด้านที่ชี้
  g.fillStyle='rgba(0,0,0,.3)';rr(g,x0+2,y+2,w,h,5);g.fill();
  g.fillStyle=it[2];rr(g,x0,y,w,h,5);g.fill();g.strokeStyle='#fff';g.lineWidth=2;rr(g,x0+2,y+2,w-4,h-4,4);g.stroke();
  g.fillStyle='#fff';g.textAlign='center';
  g.fillText(ar,left?x0+14:x0+w-14,y+h/2+1);g.fillText(t,left?x0+w/2+8:x0+w/2-8,y+h/2+1);
 });
}
function draw(g,t,st,W,H){
 const d=SG[st.place];if(!d)return;
 g.save();
 if(d.L.length)post(g,70,d.y,d.L,-1);
 if(d.R.length)post(g,W-70,d.y,d.R,1);
 g.restore();
}
window.SIGNS={draw,DATA:SG};
})();

