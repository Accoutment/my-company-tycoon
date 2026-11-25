
/* ROADCARS — รถวิ่งบนถนนทุกฉากที่มีถนนแต่เดิมไม่มีรถ (ใช้โมเดลรถเดียวกับถนนหน้าออฟฟิศ: CAR_DEF/CAR_EL/carDraw) */
(function(){
 const CFG={
  aqst:{lanes:[{y:556,dir:-1,nt:1},{y:597,dir:1}],x0:-150,x1:1110},
  snkst:{lanes:[{y:424,dir:-1,nt:1},{y:490,dir:1}],x0:-150,x1:1110},
  cardst:{lanes:[{y:458,dir:-1,nt:1},{y:538,dir:1}],x0:-150,x1:1110},
  ncst:{lanes:[{y:460,dir:-1,nt:1},{y:542,dir:1}],x0:-150,x1:1110},
  stst:{lanes:[{y:598,dir:1}],x0:-150,x1:1110}
 };
 const R=(a,b)=>a+Math.random()*(b-a);
 /* ===== TODFX — แสง/สภาพอากาศตามเวลาในเกม (S.t) ให้ทุกฉากภายนอก ===== */
 // a = ความเข้มกลางคืนเต็มที่ (เพิ่มจากการมืดเดิมของฉากนั้น ๆ) · lift = เพิ่มความสว่างตอนกลางวัน (ภาพฉากเป็นกลางคืนตายตัว)
 const TOD={cross:{a:.68},carst:{a:.68},aqst:{a:.68},snkst:{a:.68},cardst:{a:.68},stst:{a:.76},ncst:{a:.7,lift:.34,warm:0},farm:{a:.62},frst:{a:.0}};
 const sm=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v)};
 function nightK(h){ // 0 = กลางวัน · 1 = กลางคืนเต็มที่
  if(h>=6.5&&h<16)return 0;
  if(h>=16&&h<18.5)return .45*sm((h-16)/2.5);
  if(h>=18.5&&h<19.5)return .45+.55*sm(h-18.5);
  if(h>=19.5||h<4.5)return 1;
  return 1-sm((h-4.5)/2); // 04:30–06:30 รุ่งเช้า
 }
 /* ดึก 22:00–05:00 = ไม่มีผู้คนตามท้องถนน เหลือเฉพาะ รปภ./ตำรวจ (ใช้กับการวาด NPC ฉากภายนอก + ตัวสุ่มคนเดินถนน) */
 window.LATE_NIGHT=function(){try{const h=((((typeof S==='object'&&S&&S.t)||0)%1440)+1440)%1440/60;return h>=22||h<5}catch(e){return false}};
 function tod(g,st,ctx){
  const C=TOD[st&&st.place];if(!C)return;
  const h=((((typeof S==='object'&&S&&S.t)||0)%1440)+1440)%1440/60,n=nightK(h),W=960,H=600;
  g.save();
  if(C.lift&&n<1){ // ฉากภาพกลางคืน (NICECLUB) → ปรับให้สว่างตอนกลางวัน
   g.globalCompositeOperation='screen';g.fillStyle='rgba(255,244,222,'+(C.lift*(1-n)).toFixed(3)+')';g.fillRect(0,0,W,H);
   g.globalCompositeOperation='source-over';g.fillStyle='rgba(255,236,200,'+(.10*(1-n)).toFixed(3)+')';g.fillRect(0,0,W,H);
  }
  if(n>0){
   // เย็น: โทนส้ม → ค่ำ: น้ำเงินเข้ม
   if(h>=16&&h<19.5){const w=h<18.5?sm((h-16)/2.5):1-sm(h-18.5);g.fillStyle='rgba(255,140,60,'+(.12*w).toFixed(3)+')';g.fillRect(0,0,W,H)}
   g.fillStyle='rgba(8,14,48,'+(C.a*n).toFixed(3)+')';g.fillRect(0,0,W,H);
   const v=g.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.95);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(2,4,18,'+(.28*n).toFixed(3)+')');g.fillStyle=v;g.fillRect(0,0,W,H);
  }else if(h>=6.5&&h<8.5){g.fillStyle='rgba(255,200,130,'+(.07*(1-sm((h-6.5)/2))).toFixed(3)+')';g.fillRect(0,0,W,H)}
  g.restore();
 }

 let place=null,cars=[],lastT=0,spawn=[0,0];
 function mk(ctx,lane,L,fill){
  const ids=Object.keys(ctx.CAR_DEF).filter(i=>!(L.nt&&(i==='truck'||ctx.CAR_DEF[i].len>130)));let tot=0;ids.forEach(i=>tot+=ctx.CAR_DEF[i].wt);let r=Math.random()*tot,id=ids[0];
  for(const k of ids){r-=ctx.CAR_DEF[k].wt;if(r<=0){id=k;break}}
  const d=ctx.CAR_DEF[id],c={t:id,lane,dir:L.dir,y:L.y,w:d.len,sc:d.len/d.w0,v:R(70,110),x:0,honk:0,honkT:'',fa:Math.random()*60};
  c.x=fill!=null?fill:(L.dir>0?-c.w-20:960+20);return c}
 function ok(c,lane){return !cars.some(o=>o.lane===lane&&Math.abs(o.x-c.x)<Math.max(o.w,c.w)+90)}
 function reset(p,ctx){place=p;cars=[];spawn=[R(.5,3),R(2,6)];const C=CFG[p];
  C.lanes.forEach((L,i)=>{const n=1+Math.floor(Math.random()*2);for(let k=0;k<n;k++){const c=mk(ctx,i,L,R(60,820));if(ok(c,i))cars.push(c)}})}
 function draw(g,t,st,ctx){
  const p=st&&st.place;if(!CFG[p]){place=null;try{tod(g,st,ctx)}catch(e){}return}
  if(p!==place)reset(p,ctx);
  const now=performance.now(),dt=Math.min(.05,Math.max(0,(now-lastT)/1000));lastT=now;const C=CFG[p];
  if(!st.paused||true){
   C.lanes.forEach((L,i)=>{spawn[i]=(spawn[i]||0)-dt;if(spawn[i]<=0){spawn[i]=R(3.5,8);const c=mk(ctx,i,L);if(ok(c,i)&&cars.filter(o=>o.lane===i).length<3)cars.push(c)}});
   cars.forEach(c=>{
    // เว้นระยะจากรถคันหน้าในเลนเดียวกัน
    let lim=c.vmax||(c.vmax=R(75,115));
    cars.forEach(o=>{if(o===c||o.lane!==c.lane)return;const gap=c.dir>0?o.x-(c.x+c.w):c.x-(o.x+o.w);if(((c.dir>0&&o.x>c.x)||(c.dir<0&&o.x<c.x))&&gap<60)lim=Math.min(lim,Math.max(0,o.v-(60-gap)*1.2))});
    c.v+=(lim-c.v)*Math.min(1,dt*3);c.x+=c.dir*c.v*dt;c.fa+=c.v*dt*.9});
   cars=cars.filter(c=>c.x>C.x0-300&&c.x<C.x1+300)}
  cars.slice().sort((a,b)=>a.y-b.y).forEach(c=>ctx.carDraw(g,t,c));
  try{tod(g,st,ctx)}catch(e){console.error('[tod]',e)}
 }
 window.ROADCARS={draw,places:()=>Object.keys(CFG),count:()=>cars.length,nightK,tod:TOD,state:()=>({place,n:cars.length,cars:cars.map(c=>({t:c.t,x:Math.round(c.x),y:c.y,dir:c.dir}))})};
})();

