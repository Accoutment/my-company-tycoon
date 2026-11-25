
/* ============================================================================
 * TRAIN STATION — SCENE  (stst หน้าสถานี · stin ชานชาลา)   [STEP 9–11]
 * ต่อกับเกมเดิมผ่าน window.__CEO_CTX + CARDSHOP_SCENE (ตัวกลางเดียวกับ SNOOKER / NICECLUB)
 * ภาพฉาก = ภาพที่ผู้ใช้แนบ (หน้าสถานี · ชานชาลา · sprite รถไฟ) + ชั้นโค้ด: ประตูกระจกเลื่อน, รถไฟจอดนิ่ง+ไฟหน้า,
 * NPC (พนักงาน/ช่าง/นักท่องเที่ยว), อุปกรณ์งานปรับปรุง, ฝุ่น, ถ่ายภาพ
 * โหมดปัจจุบัน: STATION_STATUS = UNDER_RENOVATION (เปิดให้เข้าชมเท่านั้น)
 * ไม่มีระบบ Player/Scene/Camera ซ้ำ · เซฟที่ S.station
 * ========================================================================== */
(function(root){
'use strict';
if(root.STATION_SCENE)return;
const A=root.ST_ASSETS||{};
const X=()=>root.__CEO_CTX;
const IMG={ext:new Image(),int:new Image(),train:new Image()};IMG.ext.src=A.ext||'';IMG.int.src=A.int||'';IMG.train.src=A.train||'';
const isSt=p=>p==='stst'||p==='stin';

/* ---------- STEP 11 · สถานะสถานี (รองรับอนาคต 3 สถานะ · ตอนนี้เปิดใช้ได้เฉพาะ UNDER_RENOVATION) ---------- */
const STATUS_DEFS={
 UNDER_RENOVATION:{label:'สถานีกำลังปรับปรุง',signs:['สถานีกำลังปรับปรุง','ขณะนี้เปิดให้เข้าชมเท่านั้น','บริการรถไฟยังไม่เปิดให้บริการ'],
  can:{visit:true,explore:true,viewTrain:true,talk:true,photo:true,ticket:false,destination:false,board:false,travel:false,trainDoor:false},
  msg:{train:'รถไฟกำลังอยู่ระหว่างการตรวจสอบ',board:'ขออภัย รถไฟยังไม่เปิดให้บริการ',ticket:'ขณะนี้ยังไม่เปิดจำหน่ายตั๋วโดยสาร'}},
 OPEN_FOR_VISIT:{label:'เปิดให้เข้าชม',signs:['สถานีเปิดให้เข้าชม','ยินดีต้อนรับ','บริการรถไฟยังไม่เปิดให้บริการ'],
  can:{visit:true,explore:true,viewTrain:true,talk:true,photo:true,ticket:false,destination:false,board:false,travel:false,trainDoor:false},
  msg:{train:'รถไฟจอดให้เข้าชม',board:'ขออภัย รถไฟยังไม่เปิดให้บริการ',ticket:'ขณะนี้ยังไม่เปิดจำหน่ายตั๋วโดยสาร'}},
 OPEN_FOR_SERVICE:{label:'เปิดให้บริการ',signs:['สถานีเปิดให้บริการ','','' ],
  can:{visit:true,explore:true,viewTrain:true,talk:true,photo:true,ticket:true,destination:true,board:true,travel:true,trainDoor:true},
  msg:{train:'',board:'',ticket:''}}
};
const ENABLED=['UNDER_RENOVATION'];                  // สถานะที่เปิดใช้งานจริงในเวอร์ชันนี้
let CUR='UNDER_RENOVATION';
const STATION_STATUS=Object.freeze({UNDER_RENOVATION:'UNDER_RENOVATION',OPEN_FOR_VISIT:'OPEN_FOR_VISIT',OPEN_FOR_SERVICE:'OPEN_FOR_SERVICE'});
const def=()=>STATUS_DEFS[CUR];
const can=k=>!!def().can[k];
function setStatus(s){if(!STATUS_DEFS[s]||ENABLED.indexOf(s)<0)return false;CUR=s;return true}

/* ---------- พิกัดฉาก (canvas 960×600) ---------- */
// หน้าสถานี: ภาพวาง (-53,0,1067,600)
const EX={x0:58,x1:912,y0:466,y1:522,doorX:480,doorY:444,dx0:392,dx1:568,dy0:436};
const EX_SOL=[[46,476,18,20],[223,476,16,20],[736,476,16,20],[340,490,12,12],[610,490,12,12],[120,506,98,14],[708,506,98,14],[158,490,26,13],[826,486,50,28],[292,490,18,14]];
// ชานชาลา: ภาพวาง (0,0,960,600)
const IN={x0:128,x1:915,y0:344,y1:378,exitX:722,exitY:350};
const TR={x:190,k:.40,base:462,sw:1485,sh:202};TR.w=TR.sw*TR.k;TR.h=TR.sh*TR.k;TR.y=TR.base-TR.h;
const IN_SOL=[[727,332,64,18],[614,338,52,14],[172,358,40,18],[408,364,26,12],[236,362,9,9],[548,368,9,9],[802,366,9,9],[TR.x,TR.y+2,TR.w,TR.h+12]];
const HS=[
 {id:'exit',x:IN.exitX,y:350,rx:26,ry:16,msg:'🚪 กด E / ปุ่มโต้ตอบ เพื่อออกจากสถานี'},
 {id:'clock',x:688,y:352,rx:16,ry:14,msg:'🕒 กด E ดูนาฬิกาสถานี'},
 {id:'ticket',x:759,y:360,rx:42,ry:12,msg:'🎫 ห้องจำหน่ายตั๋ว · ขณะนี้ยังไม่เปิดจำหน่ายตั๋วโดยสาร'},
 {id:'gate',x:640,y:358,rx:24,ry:12,msg:'🚧 ประตูตรวจบัตรปิดอยู่ · บริการรถไฟยังไม่เปิดให้บริการ'},
 {id:'vend',x:869,y:352,rx:32,ry:14,msg:'🥤 เครื่องจำหน่ายสินค้า · กด E ดู'},
 {id:'board',x:470,y:352,rx:40,ry:14,msg:'🕒 ป้ายบอกเวลา · กด E ดู'},
 {id:'map',x:585,y:352,rx:26,ry:14,msg:'🗺️ แผนผังสถานี · กด E ดู'},
 {id:'notice',x:188,y:354,rx:24,ry:14,msg:'⚠️ ป้ายแจ้งงานปรับปรุง · กด E อ่าน'},
 {id:'stairs',x:140,y:352,rx:16,ry:14,msg:'🪜 บันไดสะพานลอย · ปิดซ่อมแซม'},
 {id:'light',x:TR.x+34,y:372,rx:34,ry:8,msg:'💡 กด E เปิด/ปิดไฟหน้ารถไฟ'}
];
const SC={ct:0,door:0,dk:0,ped:[],pedT:0,crew:null,tour:null,dust:[],light:true,ret:null,shot:null,flash:0,seen:0,nav:0};
const rect=(L,x,y)=>{for(const r of L)if(x>r[0]&&x<r[0]+r[2]&&y>r[1]&&y<r[1]+r[3])return true;return false};
function canStand(x,y){
 const s=X().st;
 if(s.place==='stst'){
  if(x<EX.x0||x>EX.x1||y>EX.y1)return false;
  if(y<EX.y0&&!(x>=EX.dx0&&x<=EX.dx1&&y>=EX.dy0))return false;
  return !rect(EX_SOL,x,y)}
 return x>=IN.x0&&x<=IN.x1&&y>=IN.y0&&y<=IN.y1&&!rect(IN_SOL,x,y)&&!(root.WIZARD_NPC&&root.WIZARD_NPC.blocks(x,y))}
function lock(on){const s=X().st;s.keys={};s.moving=0;try{if(root.JOY){JOY.x=0;JOY.y=0}}catch(e){}s.talk=on?{st:1,acts:[]}:null}
const toast=m=>{try{X().toast(m)}catch(e){}};
function custIds(){try{return Object.keys(CUSTOMER_SPRITE_IMAGES).filter(k=>{const i=CUSTOMER_SPRITE_IMAGES[k];return i&&i.naturalWidth})}catch(e){return[]}}

/* ---------- ข้อมูลเซฟ (S.station) ---------- */
function state(){
 let S_=null;try{S_=typeof S!=='undefined'?S:null}catch(e){}
 if(!S_)return null;
 if(!S_.station||typeof S_.station!=='object')S_.station={v:1};
 const n=S_.station;['visits','photos','talks','trainChecks'].forEach(k=>{if(typeof n[k]!=='number'||!isFinite(n[k]))n[k]=0});
 return n}
function persist(){try{save(1)}catch(e){}}

/* ---------- NPC ---------- */
const CREW=[
 {key:'staff',kind:'staff',id:'security-guard',x:812,y:356,d:2,name:'สมหมาย',title:'พนักงานสถานี (เคาน์เตอร์)',lines:['“ขออภัยครับ ขณะนี้ยังไม่เปิดจำหน่ายตั๋วโดยสาร”','“สถานีเปิดให้เข้าชมเท่านั้นครับ เดินดูรถไฟได้ตามสบาย”','“ช่วงนี้กำลังปรับปรุง ระวังกรวยกับแผงกั้นด้วยนะครับ”']},
 {key:'w1',kind:'staff',id:'uncle-chai',x:322,y:358,d:0,name:'ช่างชัย',title:'ช่างซ่อมบำรุง',work:1,lines:['“กำลังซ่อมพื้นชานชาลา อย่าเดินเลยเส้นสีเหลืองนะครับ”','“รถไฟขบวนนี้อยู่ระหว่างการตรวจสอบ ยังขึ้นไม่ได้ครับ”']},
 {key:'w2',kind:'staff',id:'mild-casual',x:560,y:362,d:3,name:'ช่างกิม',title:'ช่างซ่อมบำรุง',patrol:[520,640],lines:['“ไฟหน้ารถผมเพิ่งเช็กเสร็จ ติดสวยเลยใช่ไหมครับ”','“อีกไม่นานคงเปิดให้บริการ ตอนนี้ขอแค่เดินชมก่อนครับ”']}
];
const TOUR=[{x:260,y:352,min:136,max:520,v:20,name:'น้องฟ้า',line:'“รถไฟสวยมากเลย ขอถ่ายรูปหน่อย!”'},{x:700,y:360,min:560,max:900,v:16,name:'คุณบีม',line:'“เสียดายยังขึ้นรถไฟไม่ได้ แต่บรรยากาศดีจัง”'},{x:420,y:356,min:200,max:780,v:14,name:'คุณพิม',line:'“ชานชาลานี้ถ่ายรูปสวยทุกมุมเลยค่ะ”'}];
function ensureCrew(){
 if(SC.crew)return;
 SC.crew=CREW.map(c=>Object.assign({f:0,wait:1,pd:1},c));
 const ids=custIds();
 SC.tour=ids.length?TOUR.map((t,i)=>Object.assign({kind:'customer',id:ids[(i*3+2)%ids.length],d:i%2?1:3,f:0,mv:1,dirx:i%2?-1:1,wait:0,pause:0},t)):[];
}
/* ช่าง/พนักงานซ่อมบำรุงเลิกงาน: ตั้งแต่ 20:00 ถึง 06:00 ไม่มีช่างในสถานี */
function offShift(){let h=12;try{h=X().hour()}catch(e){}return h>=20||h<6}
function crewNow(){return SC.crew?(offShift()?SC.crew.filter(c=>c.title!=='ช่างซ่อมบำรุง'):SC.crew):[]}
function npcs(){return SC.crew?crewNow().concat(SC.tour||[]):[]}
function nearNpc(){
 const s=X().st;if(s.place!=='stin')return null;let b=null,bd=40;
 for(const a of npcs()){const d=Math.hypot(a.x-s.x,(a.y-s.y)*1.2);if(d<bd){bd=d;b=a}}return b}
function hotspot(){
 const s=X().st;if(s.place!=='stin')return null;let best=null,bd=1e9;
 for(const h of HS){const dx=Math.abs(s.x-h.x),dy=Math.abs(s.y-h.y);if(dx<h.rx&&dy<h.ry){const d=dx/h.rx+dy/h.ry;if(d<bd){bd=d;best=h}}}
 return best}
const nearTrain=()=>{const s=X().st;return s.place==='stin'&&s.x>TR.x-20&&s.x<TR.x+TR.w+20&&s.y>=IN.y1-22};
function updNpc(dt){
 if(!SC.crew)return;
 SC.crew.forEach(a=>{
  if(a.patrol){const sp=22;if(a.pause>0){a.pause-=dt;a.wait=1}else{a.wait=0;const nx=a.x+(a.pd||1)*sp*dt;
    if(nx>a.patrol[1]||nx<a.patrol[0]||!canStand(nx,a.y)){a.pd=-(a.pd||1);a.pause=2+Math.random()*2}else{a.x=nx;a.d=a.pd>0?3:1;a.f+=dt*5}}}
  else if(a.work){a.f=0;a.wait=1}});
 SC.tour.forEach(a=>{
  if(a.pause>0){a.pause-=dt;a.wait=1;a.f=0;return}
  a.wait=0;const nx=a.x+a.dirx*a.v*dt;
  if(nx<a.min||nx>a.max||!canStand(nx,a.y)){a.dirx=-a.dirx;a.d=a.dirx>0?3:1;a.pause=1.5+Math.random()*3;return}
  a.x=nx;a.d=a.dirx>0?3:1;a.f+=dt*5;
  if(Math.random()<dt*.05)a.pause=1+Math.random()*2})
}

/* ---------- พรอมต์ / HUD ---------- */
function prompt(){
 const x=X(),s=x.st;if(s.sleep||s.trans||s.mode!=='scene'||s.talk)return'';
 if(s.place==='stst'){
  if(Math.abs(s.x-EX.doorX)<95&&s.y<=500)return'🚪 กด E / ปุ่ม “เข้าสถานี” เพื่อเข้าสถานี (เปิดให้เข้าชม)';
  if(s.x>=EX.x1-70)return'➡ เดินต่อไปทางขวาสุดเพื่อไปไร่ลุงสมศักดิ์';
  if(Math.abs(s.x-790)<46&&s.y<=500)return'🎫 '+def().msg.ticket;
  if(Math.abs(s.x-165)<44&&s.y<=500)return'🗺️ แผนที่ในเมือง · กด E ดู';
  return''}
 const h=hotspot();if(h&&h.id==='exit')return h.msg;          // ทางออกมาก่อน NPC เสมอ (กันคนยืนบังประตู)
 const wz=root.WIZARD_NPC&&root.WIZARD_NPC.near();if(wz)return'🔮 กด E / ปุ่ม “พูดคุย” เพื่อคุยกับพ่อมดปริศนา';
 const n=nearNpc();if(n)return'💬 กด E คุยกับ '+n.name+' · '+n.title;
 if(h)return h.msg;
 if(nearTrain())return'🚆 '+def().msg.train;
 return''}
function hud(g){
 const x=X(),W=x.W,H=x.H,s=x.st,pm=prompt();
 if(pm){g.fillStyle='rgba(30,22,10,.9)';g.fillRect(W/2-300,H-146,600,30);g.fillStyle='#ffc933';g.fillRect(W/2-300,H-146,600,2);g.fillStyle='#fff3d0';g.font='bold 15px sans-serif';g.textAlign='center';g.fillText(pm,W/2,H-125)}
 g.save();g.font='bold 11px sans-serif';g.textAlign='left';const t='🚧 '+def().label+' · เปิดให้เข้าชมเท่านั้น';const w=g.measureText(t).width+14;
 g.fillStyle='rgba(30,22,10,.82)';g.fillRect(8,8,w,20);g.fillStyle='#ffc933';g.fillRect(8,26,w,2);g.fillStyle='#fff3d0';g.fillText(t,15,22);g.restore();
 if(SC.flash>0){g.save();g.globalAlpha=Math.min(1,SC.flash*2.5);g.fillStyle='#fff';g.fillRect(0,0,W,H);g.restore()}
}

/* ---------- init ตอน enter() ---------- */
function init(place,from){
 const x=X(),s=x.st;s.hidden=false;SC.door=0;SC.dk=0;SC.ct=0;SC.dust=[];SC.ped=[];SC.pedT=2;SC.shot=null;SC.flash=0;
 ensureCrew();
 if(place==='stst'){
  if(from==='farm'){s.x=x.W+26;s.y=496;s.dir=1;s.trans={type:'arrive',t:0,toX:890,toY:496};x.setFade(1)}
  else if(from==='stin'){const r=SC.ret||{x:EX.doorX,y:490};s.x=EX.doorX;s.y=EX.doorY;s.dir=0;s.trans={type:'arrive',t:0,toX:r.x,toY:r.y};x.setFade(1);SC.door=1}
  else{s.x=EX.doorX;s.y=490;s.dir=2}
 }else{
  s.x=IN.exitX;s.y=IN.exitY-14;s.dir=0;s.trans={type:'arrive',t:0,toX:IN.exitX,toY:360};x.setFade(1);
  if(root.WIZARD_NPC)root.WIZARD_NPC.enter();
  const n=state();if(n&&from==='stst'){n.visits++;persist()}
  if(n&&from==='stst'&&n.visits===1)setTimeout(()=>{try{const c=X().st;if(c.place==='stin')toast('🚧 '+def().signs[0]+' · '+def().signs[1])}catch(e){}},1800);
 }
}
function reset(){SC.ret=null;SC.shot=null;SC.flash=0;if(root.WIZARD_NPC)root.WIZARD_NPC.leave()}

/* ---------- ฝุ่นงานซ่อม ---------- */
function dustUpd(dt,box,srcs){
 while(SC.dust.length<26)SC.dust.push(newDust(box,srcs));
 for(const p of SC.dust){p.l-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy-=3*dt}
 SC.dust=SC.dust.filter(p=>p.l>0)}
function newDust(box,srcs){const sr=srcs[Math.floor(Math.random()*srcs.length)];return{x:sr[0]+(Math.random()*30-15),y:sr[1]+(Math.random()*8-4),vx:Math.random()*14-4,vy:-6-Math.random()*10,l:1.6+Math.random()*2,m:3.2,r:1+Math.random()*2.4}}
function dustDraw(g){g.save();for(const p of SC.dust){g.globalAlpha=Math.max(0,Math.min(.38,p.l/p.m*.45));g.fillStyle='#d9cdb4';g.beginPath();g.arc(p.x,p.y,p.r,0,7);g.fill()}g.restore()}
function glow(g,x,y,r,col,a){const gr=g.createRadialGradient(x,y,1,x,y,r);gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=a;g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);g.globalAlpha=1}

/* ---------- อุปกรณ์งานปรับปรุง (วาดด้วยโค้ด พิกเซลอาร์ต) ---------- */
function shadow(g,x,y,w){g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(x,y+1,w,w*.28,0,0,7);g.fill()}
function cone(g,x,y){shadow(g,x,y,7);g.fillStyle='#1d1d1d';g.fillRect(x-7,y-2,14,3);g.fillStyle='#ff6a1c';g.fillRect(x-4,y-14,8,12);g.fillRect(x-2,y-18,4,5);g.fillStyle='#fff';g.fillRect(x-4,y-10,8,2);g.fillRect(x-3,y-6,6,2)}
function barrier(g,x,y,w){ // แผงกั้นก่อสร้างลายเหลือง-ดำ
 shadow(g,x+w/2,y,w/2);g.fillStyle='#555';g.fillRect(x+4,y-4,3,6);g.fillRect(x+w-7,y-4,3,6);
 g.fillStyle='#f5f5f0';g.fillRect(x,y-22,w,15);g.save();g.beginPath();g.rect(x,y-22,w,15);g.clip();g.fillStyle='#e23c1c';
 for(let i=-20;i<w+20;i+=14){g.beginPath();g.moveTo(x+i,y-7);g.lineTo(x+i+7,y-7);g.lineTo(x+i+14,y-22);g.lineTo(x+i+7,y-22);g.closePath();g.fill()}g.restore();
 g.strokeStyle='#333';g.lineWidth=1;g.strokeRect(x+.5,y-21.5,w-1,14)}
function aframe(g,x,y){ // ป้ายเตือนสีเหลือง (A-frame)
 shadow(g,x,y,9);g.fillStyle='#e8b800';g.beginPath();g.moveTo(x,y-26);g.lineTo(x+10,y);g.lineTo(x-10,y);g.closePath();g.fill();
 g.strokeStyle='#111';g.lineWidth=1.5;g.stroke();g.fillStyle='#111';g.fillRect(x-1,y-18,2,8);g.fillRect(x-1,y-8,2,2)}
function toolbox(g,x,y){shadow(g,x,y,12);g.fillStyle='#b32828';g.fillRect(x-11,y-10,22,10);g.fillStyle='#7d1717';g.fillRect(x-11,y-10,22,3);g.fillStyle='#d9d9d9';g.fillRect(x-3,y-13,6,3);g.fillStyle='#ffd34a';g.fillRect(x-9,y-6,3,2)}
function materials(g,x,y,w){ // กองวัสดุ: พาเลท+ถุงปูน+ท่อ
 shadow(g,x+w/2,y,w/2);g.fillStyle='#8a6a3a';g.fillRect(x,y-4,w,4);g.fillStyle='#6d5128';for(let i=0;i<w;i+=10)g.fillRect(x+i,y-4,3,4);
 g.fillStyle='#b8b0a0';g.fillRect(x+2,y-14,w*.5,10);g.fillStyle='#9b9486';g.fillRect(x+2,y-14,w*.5,2);
 g.fillStyle='#6e7b86';for(let i=0;i<3;i++)g.fillRect(x+w*.52,y-8-i*3,w*.44,3);
 g.fillStyle='#d6a73a';g.fillRect(x+w*.1,y-18,w*.3,4)}
function tape(g,x0,x1,y,t){g.save();g.beginPath();g.rect(x0,y-3,x1-x0,6);g.clip();g.fillStyle='#ffc933';g.fillRect(x0,y-3,x1-x0,6);g.fillStyle='#161616';for(let i=-12;i<x1-x0+12;i+=12){g.beginPath();g.moveTo(x0+i,y+3);g.lineTo(x0+i+6,y+3);g.lineTo(x0+i+12,y-3);g.lineTo(x0+i+6,y-3);g.closePath();g.fill()}g.restore()}
function banner(g,x,y,w,h,lines,t){ // ป้ายเหลือง-ดำบนผนัง
 g.fillStyle='#161616';g.fillRect(x-2,y-2,w+4,h+4);g.fillStyle='#ffc933';g.fillRect(x,y,w,h);
 g.fillStyle='#161616';for(let i=0;i<w;i+=10){g.fillRect(x+i,y,5,3);g.fillRect(x+i+5,y+h-3,5,3)}
 g.textAlign='center';g.fillStyle='#161616';g.font='bold 10px sans-serif';
 lines.forEach((l,i)=>g.fillText(l,x+w/2,y+13+i*11))}

/* ---------- รถไฟ (sprite ที่ผู้ใช้แนบ + โบกี้/ล้อวาดด้วยโค้ด) ---------- */
function drawTrain(g,t){
 const k=TR.k,im=IMG.train;
 if(im.complete&&im.naturalWidth){g.imageSmoothingEnabled=false;g.drawImage(im,TR.x,TR.y,TR.w,TR.h)}
 else{g.fillStyle='#8a2b2b';g.fillRect(TR.x,TR.y,TR.w,TR.h)}
 // โบกี้ + ล้อ (sprite ตัดล้อออก) ต่อ 3 ตู้: (0..596) (613..1073) (1089..1485)
 [[0,596],[613,1073],[1089,1485]].forEach(c=>{const L=c[1]-c[0];[.17,.83].forEach(f=>{const cx=TR.x+(c[0]+L*f)*k;
  g.fillStyle='#202428';g.fillRect(cx-19,TR.base-22,38,6);g.fillStyle='#34393f';g.fillRect(cx-19,TR.base-22,38,2);
  [-11,11].forEach(o=>{g.fillStyle='#14171a';g.beginPath();g.arc(cx+o,TR.base-16,5.5,0,7);g.fill();g.fillStyle='#8c949c';g.beginPath();g.arc(cx+o,TR.base-16,2,0,7);g.fill()})})});
 // ตัวต่อระหว่างตู้
 [[596,613],[1073,1089]].forEach(c=>{g.fillStyle='#16191c';g.fillRect(TR.x+c[0]*k-1,TR.base-34,(c[1]-c[0])*k+2,24)});
}
function trainFx(g,t){
 const on=SC.light,fl=.88+.12*Math.sin(t/230)+(Math.sin(t/61)>.995?-.25:0);
 const hx=TR.x+63*TR.k,hy=TR.y+94*TR.k;
 g.save();g.globalCompositeOperation='lighter';
 if(on){
  glow(g,hx,hy,46,'rgba(255,244,190,1)',.62*fl);glow(g,hx,hy,16,'rgba(255,255,255,1)',.9*fl);
  const gr=g.createLinearGradient(hx,0,hx-120,0);gr.addColorStop(0,'rgba(255,240,170,'+(.28*fl).toFixed(3)+')');gr.addColorStop(1,'rgba(255,240,170,0)');
  g.fillStyle=gr;g.beginPath();g.moveTo(hx-2,hy-3);g.lineTo(hx-122,hy-24);g.lineTo(hx-122,hy+22);g.lineTo(hx-2,hy+4);g.closePath();g.fill()}
 // ไฟสัญญาณท้ายขบวน กะพริบช้า
 if(Math.sin(t/520)>0)glow(g,TR.x+TR.w-8,TR.y+TR.h*.42,18,'rgba(255,50,40,1)',.55);
 // แสงหน้าต่างขบวนไหวเบา ๆ
 g.globalAlpha=.05+.03*Math.sin(t/700);g.fillStyle='#ffe9a8';g.fillRect(TR.x+110*TR.k,TR.y+TR.h*.30,TR.w-220*TR.k,TR.h*.22);g.globalAlpha=1;
 g.restore()}

/* ---------- วาดฉากหน้าสถานี ---------- */
function npcDraw(g,a,t){X().drawStreetNPC(g,a,t)}
function drawGlassDoor(g,k){ // ประตูกระจกเลื่อนอัตโนมัติ: ปิด→เปิดเมื่อเข้าใกล้ / ตอนเข้าสถานี
 const x0=403,x1=558,y0=272,y1=438,mid=(x0+x1)/2,hw=(x1-x0)/2,open=Math.max(0,Math.min(1,k)),w=hw*(1-open*.94);
 if(w<2)return;
 g.save();
 [[x0,0],[x1-w,1]].forEach(([lx,r])=>{
  const gr=g.createLinearGradient(lx,y0,lx+w,y1);gr.addColorStop(0,'rgba(140,190,230,.55)');gr.addColorStop(1,'rgba(60,110,170,.72)');
  g.fillStyle=gr;g.fillRect(lx,y0,w,y1-y0);g.strokeStyle='#c99a45';g.lineWidth=3;g.strokeRect(lx+1.5,y0+1.5,w-3,y1-y0-3);
  g.strokeStyle='rgba(201,154,69,.8)';g.lineWidth=2;g.beginPath();g.moveTo(lx+w/2,y0);g.lineTo(lx+w/2,y1);g.moveTo(lx,(y0+y1)/2-30);g.lineTo(lx+w,(y0+y1)/2-30);g.stroke();
  g.fillStyle='rgba(255,255,255,.22)';g.fillRect(lx+5,y0+8,Math.max(0,w*.18),y1-y0-16);
  g.fillStyle='#e0b455';g.fillRect(r?lx+3:lx+w-6,(y0+y1)/2-6,3,26)});
 g.restore()}
function drawExt(g,t,dt){
 const x=X(),s=x.st,W=x.W,H=x.H;
 g.fillStyle='#1a2a3d';g.fillRect(0,0,W,H);
 if(IMG.ext.complete&&IMG.ext.naturalWidth)g.drawImage(IMG.ext,-53,0,1067,600);
 // ป้ายเตือนบนผนัง
 banner(g,84,268,138,38,['⚠ '+def().signs[0],def().signs[1]],t);
 g.fillStyle='#161616';g.fillRect(711,325,136,14);g.fillStyle='#ffc933';g.fillRect(713,327,132,10);g.fillStyle='#161616';g.font='bold 9px sans-serif';g.textAlign='center';g.fillText('ยังไม่เปิดจำหน่ายตั๋ว',779,335);
 // คนเดินถนน (นักท่องเที่ยวผ่านไปมา)
 SC.pedT-=dt;const ids=custIds();
 if(window.LATE_NIGHT&&LATE_NIGHT())SC.ped=[];
 if(SC.pedT<=0&&SC.ped.length<3&&ids.length&&!(window.LATE_NIGHT&&LATE_NIGHT())){SC.pedT=4+Math.random()*7;const dir=Math.random()<.5?1:-1;
  SC.ped.push({kind:'customer',id:ids[Math.floor(Math.random()*ids.length)],x:dir>0?EX.x0-20:EX.x1+20,y:[474,490,506][Math.floor(Math.random()*3)],d:dir>0?3:1,f:0,mv:1,v:28+Math.random()*12,dirx:dir})}
 for(const a of SC.ped){a.f+=dt*5;a.x+=a.dirx*a.v*dt;if(a.x<EX.x0-40||a.x>EX.x1+40)a.dead=true}
 SC.ped=SC.ped.filter(a=>!a.dead);
 // ประตู
 const near=Math.abs(s.x-EX.doorX)<115&&!s.hidden&&s.y<=520;
 SC.dk+=((near?.8:0)-SC.dk)*Math.min(1,dt*6);SC.door=Math.max(0,SC.door-dt*1.2);
 let k=Math.max(SC.dk,SC.door);const tr=s.trans;if(tr&&tr.type==='stIn'&&tr.ph===1)k=1;
 drawGlassDoor(g,k);
 if(k>.05){g.save();g.globalCompositeOperation='lighter';glow(g,EX.doorX,EX.doorY+10,110,'rgba(255,210,130,1)',.3*k);g.restore()}
 // วัตถุเรียงตามแกน y
 const objs=[];
 SC.ped.forEach(a=>objs.push({y:a.y,draw:()=>npcDraw(g,a,t)}));
 objs.push({y:500,draw:()=>npcDraw(g,{kind:'staff',id:'mild-casual',x:186,y:508,d:3,f:0,wait:1},t)});
 [[345,500],[615,500],[262,500],[300,504]].forEach((c,i)=>{if(i<2)objs.push({y:c[1],draw:()=>cone(g,c[0],c[1])})});
 objs.push({y:512,draw:()=>barrier(g,120,520,98)});objs.push({y:512,draw:()=>barrier(g,708,520,98)});
 objs.push({y:504,draw:()=>aframe(g,300,504)});objs.push({y:500,draw:()=>toolbox(g,171,503)});objs.push({y:512,draw:()=>materials(g,826,514,50)});
 if(!s.hidden)objs.push({y:s.y,draw:()=>x.drawCEO(g)});
 objs.sort((a,b)=>a.y-b.y);objs.forEach(o=>o.draw());
 tape(g,222,338,496,t);
 dustUpd(dt,null,[[190,500],[840,500],[345,498],[615,498]]);dustDraw(g);
 g.save();g.globalCompositeOperation='lighter';
 glow(g,EX.doorX,300,170,'rgba(255,200,120,1)',.07+.03*Math.sin(t/700));
 [[300,250],[660,250],[53,200],[907,200]].forEach((p,i)=>glow(g,p[0],p[1],44,'rgba(255,200,110,1)',.22+.06*Math.sin(t/320+i)));
 g.restore();
}

/* ---------- วาดฉากชานชาลา ---------- */
function drawIn(g,t,dt){
 const x=X(),s=x.st,W=x.W,H=x.H;
 g.fillStyle='#16283c';g.fillRect(0,0,W,H);
 if(IMG.int.complete&&IMG.int.naturalWidth)g.drawImage(IMG.int,0,0,960,600);
 ensureCrew();updNpc(dt);
 // ป้ายบอกเวลา: แผงสีเข้ม + ข้อความวิ่ง
 g.save();g.beginPath();g.rect(440,264,66,32);g.clip();g.fillStyle='#0b0f14';g.fillRect(440,264,66,32);
 g.fillStyle='#ffb000';g.font='bold 8px sans-serif';g.textAlign='left';g.fillText('ปิดปรับปรุง · ไม่มีตารางเดินรถ · ',440-((t/40)%170)+66,277);g.fillText('ปิดปรับปรุง · ไม่มีตารางเดินรถ · ',440-((t/40)%170)+66+170,277);
 g.fillStyle='#ff5040';g.fillText('— : —',446,291);g.fillStyle='#7fe08a';g.fillRect(494,285,6,6);g.restore();
 // ป้ายขาว: ประกาศปรับปรุง
 g.fillStyle='#fffdf2';g.fillRect(163,274,52,29);g.fillStyle='#161616';g.font='bold 7px sans-serif';g.textAlign='center';g.fillText('สถานีกำลัง',189,285);g.fillText('ปรับปรุง',189,294);g.fillStyle='#ffc933';g.fillRect(163,297,52,5);
 // ป้ายทางออก (เขียว) เหนือประตูห้องรอ
 g.fillStyle='#0b3a1d';g.fillRect(703,268,38,12);g.fillStyle='#38d06a';g.fillRect(704,269,36,10);g.fillStyle='#052010';g.font='bold 8px sans-serif';g.textAlign='center';g.fillText('ทางออก',722,278);
 // ป้ายห้องจำหน่ายตั๋ว + ปิดชั่วคราว
 g.fillStyle='#161616';g.fillRect(736,266,48,10);g.fillStyle='#ffc933';g.fillRect(737,267,46,8);g.fillStyle='#161616';g.font='bold 7px sans-serif';g.fillText('จำหน่ายตั๋ว (ปิด)',760,274);
 // ประตูตรวจบัตร 3 ช่อง (ปิดอยู่)
 [622,640,658].forEach(gx=>{shadow(g,gx,352,8);g.fillStyle='#3d4650';g.fillRect(gx-7,338,5,14);g.fillRect(gx+2,338,5,14);g.fillStyle='#d94a3a';g.fillRect(gx-7,339,14,2);g.fillStyle='#1a1f24';g.fillRect(gx-8,350,16,2)});
 // เคาน์เตอร์ห้องตั๋ว
 g.fillStyle='rgba(0,0,0,.25)';g.fillRect(727,349,64,3);g.fillStyle='#6b4a28';g.fillRect(727,334,64,16);g.fillStyle='#8c6236';g.fillRect(727,334,64,4);g.fillStyle='#d8c9a0';g.fillRect(740,337,18,8);g.fillStyle='#2a2a2a';g.fillRect(766,337,10,8);
 // รถไฟ
 const objs=[];
 objs.push({y:TR.base,draw:()=>{drawTrain(g,t);trainFx(g,t)}});
 // อุปกรณ์งานปรับปรุง
 [[236,371],[548,377],[802,375]].forEach(c=>objs.push({y:c[1],draw:()=>cone(g,c[0]+4,c[1])}));
 objs.push({y:376,draw:()=>materials(g,172,376,40)});objs.push({y:376,draw:()=>toolbox(g,421,376)});
 objs.push({y:372,draw:()=>aframe(g,300,373)});objs.push({y:372,draw:()=>aframe(g,884,374)});
 // แผงกั้น + เทปที่บันได (ปิดซ่อม)
 g.fillStyle='rgba(0,0,0,.18)';g.fillRect(40,340,88,40);
 objs.push({y:380,draw:()=>{barrier(g,54,378,34);barrier(g,92,378,34);tape(g,40,128,356,t)}});
 // NPC
 crewNow().concat(SC.tour||[]).forEach(a=>objs.push({y:a.y,draw:()=>{
  if(a.work){const sw=Math.floor(t/380)%2;g.save();g.translate(0,sw?-1:0);npcDraw(g,a,t);g.restore();
   if(sw&&Math.floor(t/380)%6===1){g.save();g.globalCompositeOperation='lighter';glow(g,a.x+12,a.y-6,10,'rgba(255,220,120,1)',.8);g.restore()}}
  else npcDraw(g,a,t)}}));
 const WZ=root.WIZARD_NPC;if(WZ){WZ.update(dt);if(WZ.visible())objs.push(WZ.obj(g,t))}
 if(!s.hidden)objs.push({y:s.y,draw:()=>x.drawCEO(g)});
 objs.sort((a,b)=>a.y-b.y);objs.forEach(o=>o.draw());
 dustUpd(dt,null,[[190,372],[322,368],[560,372],[100,366]]);dustDraw(g);
 // ชื่อ NPC ที่อยู่ใกล้
 const nn=nearNpc();if(nn&&!s.talk){g.save();g.font='bold 11px sans-serif';g.textAlign='center';const w=g.measureText(nn.name).width+14;g.fillStyle='rgba(30,22,10,.88)';g.fillRect(nn.x-w/2,nn.y-92,w,16);g.fillStyle='#ffc933';g.fillRect(nn.x-w/2,nn.y-92,w,2);g.fillStyle='#fff3d0';g.fillText(nn.name,nn.x,nn.y-80);g.restore()}
 // แสงโคมไฟ + วิกเน็ตต์เบา ๆ
 g.save();g.globalCompositeOperation='lighter';
 [[28,262],[940,262],[383,266],[583,262],[820,262]].forEach((p,i)=>glow(g,p[0],p[1],48,'rgba(255,200,110,1)',.14+.05*Math.sin(t/330+i)));g.restore();
 const vg=g.createRadialGradient(480,300,260,480,300,640);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(6,10,24,.28)');g.fillStyle=vg;g.fillRect(0,0,W,H);
 if(WZ)WZ.atmo(g,t,dt);
}
function draw(g,t){
 const x=X(),dt=Math.min(.05,Math.max(0,(t-(SC.ct||t))/1000));SC.ct=t;
 if(SC.flash>0)SC.flash=Math.max(0,SC.flash-dt);
 if(x.st.place==='stst')drawExt(g,t,dt);else drawIn(g,t,dt);
 if(SC.shot){SC.shot.n=(SC.shot.n||0)+1;if(SC.shot.n>=2){const sh=SC.shot;SC.shot=null;shotDone(sh)}}   // เก็บภาพก่อนวาด HUD ทับ
}

/* ---------- ถ่ายภาพ ---------- */
function css(){
 if(document.getElementById('stCss'))return;
 const st=document.createElement('style');st.id='stCss';
 st.textContent='#stBtns{position:fixed;left:50%;transform:translateX(-50%);top:44px;z-index:195;display:none;flex-direction:row;gap:6px}#stBtns.on{display:flex}'+
 '#stBtns button{cursor:pointer;background:#1e160aE6;color:#ffe3a0;border:1px solid #d0a451;border-radius:8px;padding:6px 10px;font:700 12px sans-serif;min-height:34px;white-space:nowrap}#stBtns button[hidden]{display:none}'+
 '#stShot{position:fixed;right:10px;top:84px;z-index:196;background:#1e160a;border:2px solid #d0a451;border-radius:10px;padding:6px;display:flex;flex-direction:column;gap:5px;max-width:200px}@media (max-height:480px){#stShot{max-width:150px;top:70px}}#stShot img{width:100%;border-radius:6px;display:block}'+
 '#stShot button{cursor:pointer;background:#2c200e;color:#ffe3a0;border:1px solid #d0a451;border-radius:6px;padding:5px;font:700 12px sans-serif;min-height:32px}';
 document.head.appendChild(st)}
let shotT=0,lastShot='';
function photo(){const x=X(),s=x.st;if(!isSt(s.place)||s.trans||s.sleep||SC.shot)return false;if(!can('photo'))return false;SC.shot={n:0};return true}
function shotDone(){
 const cv=document.getElementById('ceoSceneCanvas');let url='';
 try{url=cv.toDataURL('image/jpeg',.9)}catch(e){}
 SC.flash=.35;const n=state();if(n){n.photos++;persist()}
 lastShot=url;toast('📸 ถ่ายภาพแล้ว'+(url?' · กด “บันทึกรูป” ถ้าต้องการเก็บไว้':''));
 if(!url)return;
 css();let c=document.getElementById('stShot');if(c)c.remove();
 c=document.createElement('div');c.id='stShot';c.innerHTML='<img alt="photo" src="'+url+'"><button data-save type="button">⬇ บันทึกรูป</button><button data-x type="button">ปิด ✕</button>';
 c.addEventListener('pointerdown',e=>e.stopPropagation());
 c.onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-save'))savePhoto();else c.remove()};
 document.body.appendChild(c);clearTimeout(shotT);shotT=setTimeout(()=>{const q=document.getElementById('stShot');if(q)q.remove()},9000)}
function savePhoto(){if(!lastShot)return;const a=document.createElement('a');a.href=lastShot;a.download='train_station_'+Date.now()+'.jpg';document.body.appendChild(a);a.click();a.remove()}
function btns(){
 css();let d=document.getElementById('stBtns');
 if(!d){d=document.createElement('div');d.id='stBtns';d.innerHTML='<button data-go type="button" hidden>🚪 เข้าสถานี</button><button data-wz type="button" hidden>🔮 พูดคุย</button><button data-ph type="button">📷 ถ่ายภาพ</button>';document.body.appendChild(d);
  d.addEventListener('pointerdown',e=>e.stopPropagation());
  d.onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-wz')){if(root.WIZARD_NPC)root.WIZARD_NPC.talk()}else if(b.hasAttribute('data-ph'))photo();else if(b.hasAttribute('data-go')){const s=X().st;if(s.place==='stst')inBegin();else if(s.place==='stin')outBegin()}}}
 return d}
setInterval(()=>{try{
 const d=document.getElementById('stBtns');const x=X();const on=x&&x.st&&x.st.active&&isSt(x.st.place)&&!x.st.trans&&!x.st.sleep&&x.st.mode==='scene';
 if(!on){if(d)d.classList.remove('on');const sh=document.getElementById('stShot');if(sh&&!(x&&x.st&&x.st.active&&isSt(x.st.place)))sh.remove();return}
 const b=btns();b.classList.add('on');const g=b.querySelector('[data-go]'),s=x.st;
 const nearIn=s.place==='stst'&&Math.abs(s.x-EX.doorX)<95&&s.y<=500,nearOut=s.place==='stin'&&(hotspot()||{}).id==='exit';
 const wzb=b.querySelector('[data-wz]');if(wzb)wzb.hidden=!(root.WIZARD_NPC&&s.place==='stin'&&!s.talk&&root.WIZARD_NPC.near());
 g.hidden=!(nearIn||nearOut);g.textContent=nearOut?'🚪 ออกจากสถานี':'🚪 เข้าสถานี'}catch(e){}},200);
document.addEventListener('keydown',e=>{try{if((e.key||'').toLowerCase()!=='p'||e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;const x=X();if(x&&x.st&&x.st.active&&isSt(x.st.place)&&!x.st.talk)photo()}catch(_){}});

/* ---------- ขอบฉาก ---------- */
function edges(dx,dy){
 const s=X().st;if(s.trans||s.talk)return;
 if(s.place==='stst'){if(dx>0&&s.x>=EX.x1-6)leaveRight();return}
 if(s.place==='stin'&&dy>0&&s.y>=IN.y1-1&&!nearTrain())return;
}
function leaveRight(){const x=X(),s=x.st;if(s.place!=='stst'||!x.transLock())return;s.trans={type:'stLeaveR',t:0};x.toast('➡ เดินต่อไป ไร่ลุงสมศักดิ์ 🌾')}
function inBegin(){const x=X(),s=x.st;if(s.place!=='stst'||!x.transLock())return;SC.ret={x:Math.max(EX.x0+4,Math.min(EX.x1-4,s.x)),y:Math.max(EX.y0+4,Math.min(EX.y1-4,s.y))};s.trans={type:'stIn',t:0,ph:0}}
function outBegin(){const x=X(),s=x.st;if(s.place!=='stin'||!x.transLock())return;s.trans={type:'stOut',t:0,ph:0}}

/* ---------- Transition ---------- */
function trans(tr,dt){
 const x=X(),s=x.st;
 if(tr.type==='stIn'){
  if(tr.ph===0){if(x.walkTo(EX.doorX,EX.doorY+8,130,dt)){tr.ph=1;tr.t=0}}
  else{const k=Math.min(1,tr.t/1.2);s.y=EX.doorY+8-k*34;s.dir=2;s.moving=1;s.frame=(s.frame+dt*7)%4;x.setFade(Math.max(0,(k-.45)/.55));
   if(k>=1){s.moving=0;s.trans=null;x.enter('stin',{from:'stst'})}}
  return true}
 if(tr.type==='stOut'){
  if(tr.ph===0){if(x.walkTo(IN.exitX,IN.exitY,130,dt)){tr.ph=1;tr.t=0}}
  else{const k=Math.min(1,tr.t/.8);s.y=IN.exitY-k*22;s.dir=2;s.moving=1;s.frame=(s.frame+dt*7)%4;x.setFade(k);
   if(k>=1){s.moving=0;s.trans=null;x.enter('stst',{from:'stin'})}}
  return true}
 if(tr.type==='stLeaveR'){
  s.x+=135*dt;s.dir=3;s.moving=1;s.frame=(s.frame+135*dt/15)%4;x.setFade(Math.min(1,Math.max(0,(tr.t-.1)/.6)));
  if(tr.t>=.8){s.moving=0;s.trans=null;x.enter('farm',{from:'stst'})}
  return true}
 return false}

/* ---------- โต้ตอบ ---------- */
function interact(){
 const x=X(),s=x.st;if(s.trans||s.talk||s.sleep)return;
 const n0=state();
 if(s.place==='stst'){
  if(Math.abs(s.x-EX.doorX)<95&&s.y<=500){inBegin();return}
  if(Math.abs(s.x-790)<46&&s.y<=500){toast('🎫 '+def().msg.ticket);return}
  if(Math.abs(s.x-165)<44&&s.y<=500){toast('🗺️ แผนที่ในเมือง: สถานีอยู่ทางซ้ายของไร่ลุงสมศักดิ์ · ปัจจุบันเปิดให้เข้าชมเท่านั้น');return}
  if(s.x>=EX.x1-70){toast('➡ เดินชิดขอบขวาสุดเพื่อไปไร่ลุงสมศักดิ์');return}
  toast('🚉 สถานีรถไฟ · เดินไปที่ประตูกลางอาคารแล้วกด E เพื่อเข้าชม ('+def().label+')');return}
 const hx=hotspot();if(hx&&hx.id==='exit'){outBegin();return}
 if(root.WIZARD_NPC&&root.WIZARD_NPC.near()){root.WIZARD_NPC.talk();return}
 const n=nearNpc();
 if(n){const L=n.lines||[n.line];const m=L[Math.floor(Math.random()*L.length)];if(n0){n0.talks++;persist()}
  toast((n.name||'')+': '+m);
  if(n.key==='staff')setTimeout(()=>toast('🎫 '+def().msg.ticket),1600);return}
 const h=hotspot();
 if(h){
  if(h.id==='exit'){outBegin();return}
  if(h.id==='clock'){const d=new Date();toast('🕒 นาฬิกาสถานี: '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+' น. · นาฬิกายังเดินปกติ แม้สถานีจะปรับปรุง');return}
  if(h.id==='ticket'){toast('🎫 '+def().msg.ticket);return}
  if(h.id==='gate'){toast('🚧 ประตูตรวจบัตรปิดอยู่ · '+def().signs[2]);return}
  if(h.id==='vend'){toast('🥤 เครื่องจำหน่ายสินค้าปิดให้บริการชั่วคราวระหว่างปรับปรุง');return}
  if(h.id==='board'){toast('🕒 ป้ายบอกเวลา: ยังไม่มีตารางเดินรถ · '+def().signs[2]);return}
  if(h.id==='map'){toast('🗺️ แผนผังสถานี: ชานชาลา 1 · ห้องจำหน่ายตั๋ว · ประตูตรวจบัตร · ทางออก (บางส่วนปิดปรับปรุง)');return}
  if(h.id==='notice'){toast('⚠️ '+def().signs.join(' · '));return}
  if(h.id==='stairs'){toast('🪜 บันไดสะพานลอยปิดซ่อมแซม ห้ามเข้า');return}
  if(h.id==='light'){SC.light=!SC.light;toast(SC.light?'💡 เปิดไฟหน้ารถไฟแล้ว':'💡 ปิดไฟหน้ารถไฟแล้ว');return}
 }
 if(nearTrain()){
  if(n0){n0.trainChecks++}
  if(can('board'))toast('🚆 ขึ้นรถไฟ');else toast('🚆 '+def().msg.board);return}
 toast('🚉 เดินสำรวจชานชาลา · คุยกับพนักงาน/ช่าง · ถ่ายภาพได้ที่ปุ่ม 📷 (หรือกด P) · ทางออกอยู่ที่ประตูห้องรอ')
}
function back(){const x=X(),s=x.st;if(s.trans||s.talk||s.sleep)return;
 if(s.place==='stst'){leaveRight();return}
 outBegin()}

root.STATION_SCENE={lock,canStand,draw,hud,edges,trans,interact,back,init,prompt,reset,SC,EX,IN,TR,HS,EX_SOL,IN_SOL,hotspot,nearNpc,nearTrain,state,photo,
 status:()=>CUR,statusInfo:()=>JSON.parse(JSON.stringify(Object.assign({status:CUR,enabled:ENABLED.slice()},def()))),setStatus,testStatus:function(s){if(!STATUS_DEFS[s])return false;CUR=s;return true},can,npcs,STATUS_DEFS:STATUS_DEFS};
root.STATION_STATUS=STATION_STATUS;
})(typeof window!=='undefined'?window:globalThis);

