
/* ============================================================================
 * CARD SHOP — SCENE (cardst ถนนหน้าร้าน · cardin ภายในร้าน)
 * เชื่อมกับ CEOScene ผ่าน window.__CEO_CTX (ฝั่งเกมเดิมส่งมาให้) · ใช้ st.place / enter() / st.trans ตัวเดิมของเกม
 * ========================================================================== */
(function(root){
'use strict';
const C=root.CARDSHOP,U=root.CS_UI,A=root.CS_ASSETS||{};
if(!C||!U)return;
const X=()=>root.__CEO_CTX;
const IMG={ext:new Image(),int:new Image()};
IMG.ext.src=A.exterior||'';IMG.int.src=A.interior||'';

/* ---------- พิกัดฉาก (พิกัด canvas 960×600) ---------- */
const CD={doorX:480,doorY:292,y0:306,y1:384,x0:42,x1:918};         // ถนนหน้าร้าน
const IN={x0:40,x1:925,y0:217,y1:480,exitX:440,exitY:476};           // ในร้าน
const SOL=[[0,0,960,214],[10,268,150,172],[180,236,130,148],[353,300,180,138],[556,236,120,148],
 [731,196,113,62],[753,258,119,69],[775,324,125,71],[885,130,75,232]];  // วัตถุทึบ (x,y,w,h)
const SEAT={px:318,py:446,nx:168,ny:446};                               // เก้าอี้ผู้เล่น / เงา NPC
const TABLE={x:190,y:398,w:106,h:44};
const CLERK={kind:'staff',id:'emp-rin',x:432,y:188,d:0,f:0};
const HS=[ // จุดโต้ตอบในร้าน
 {id:'collector',x:524,y:238,rx:44,ry:26,msg:'💬 กด E คุยกับ CARD COLLECTOR · รับซื้อการ์ดซ้ำ',buy:1},
 {id:'counter',x:435,y:238,rx:140,ry:26,msg:'💬 กด E คุยกับพนักงาน · เคาน์เตอร์ซื้อซองการ์ด',pack:'all'},
 {id:'std',x:220,y:238,rx:64,ry:24,msg:'🗄️ กด E ดูชั้นซองการ์ดทั่วไป',pack:'std'},
 {id:'rare',x:331,y:352,rx:26,ry:62,msg:'🗄️ กด E ดูชั้นซองการ์ด Rare',pack:'rare'},
 {id:'epic',x:443,y:456,rx:84,ry:20,msg:'🗄️ กด E ดูชั้นซองการ์ด Epic',pack:'epic'},
 {id:'legend',x:616,y:400,rx:58,ry:24,msg:'🗄️ กด E ดูชั้นซองการ์ด Legendary',pack:'legend'},
 {id:'mythic',x:668,y:233,rx:36,ry:20,msg:'🗄️ กด E ดูตู้ซองการ์ด Mythic',pack:'mythic'},
 {id:'dspL',x:92,y:458,rx:84,ry:20,msg:'🏆 กด E ดูตู้กระจกจัดแสดงการ์ดหายาก',dsp:1},
 {id:'dspR',x:906,y:412,rx:40,ry:44,msg:'🏆 กด E ดูตู้กระจกจัดแสดงการ์ดหายาก',dsp:1},
 {id:'battle',x:326,y:462,rx:46,ry:18,msg:'🪑 [INTERACT] SIT TO PLAY · นั่งเล่น CARD BATTLE',sit:1}
];
const SHELF_TAGS=[ // ป้ายชั้นวาง (วาดทับภาพ)
 {x:220,y:62,t:'ซองทั่วไป',c:'#8fa3c4'},{x:245,y:229,t:'RARE',c:'#4aa3ff'},{x:443,y:271,t:'EPIC',c:'#b968ff'},{x:616,y:229,t:'LEGENDARY',c:'#ffc93d'},{x:668,y:84,t:'MYTHIC',c:'#ff4fd8'},{x:243,y:386,t:'CARD BATTLE',c:'#c58cff'},{x:524,y:100,t:'CARD COLLECTOR · รับซื้อ',c:'#6be68b'}];

/* [GACHA] ตู้กาชาปอง 3 ตู้หน้าร้าน (ขวาประตู ไม่บังทางเข้า) — x,y = จุดวางเท้าของตู้บนทางเท้า */
const MACH=[{id:'lucky',x:612,y:336},{id:'celestial',x:690,y:336},{id:'dragon',x:768,y:336}];
const MH=104; // ความสูงตู้ในฉาก (px โลก)
const IMGM={};
function mimg(id){if(!IMGM[id]){const i=new Image();i.src=(A.machines&&A.machines[id])||'';IMGM[id]=i}return IMGM[id]}
const COLLECTOR={kind:'staff',id:'blue-suit-male',x:524,y:188,d:0,f:0};   // [GACHA] CARD COLLECTOR NPC รับซื้อการ์ด
const SC={mt:0,ct:0,ped:null,vis:null,dk:0,door:0,sit:0,sitting:false,clerkT:0,shc:null,btns:null};
const $=id=>document.getElementById(id);
const AS=()=>root.AUCTION_SCENE;
const SKS=()=>root.SNOOKER_SCENE;const isSk=p=>p==='snkst'||p==='snkin';
const NCS=()=>{const p=X().st.place;return(p==='stst'||p==='stin')?root.STATION_SCENE:(p==='frst'?root.FOREST_SCENE:(p==='dpfr'||p==='cave')?root.DEEP_SCENE:root.NICECLUB_SCENE)};const isNc=p=>p==='ncst'||p==='ncin'||p==='stst'||p==='stin'||p==='frst'||p==='dpfr'||p==='cave';   // [NICECLUB + STATION: ตัวกลางเลือกฉากตาม place]   // [SNOOKER] ฉากสนุกเกอร์ใช้จุดเชื่อมเดียวกัน


/* ---------- ตัวช่วย ---------- */
function solid(x,y){for(const r of SOL)if(x>r[0]&&x<r[0]+r[2]&&y>r[1]&&y<r[1]+r[3])return true;
 // โต๊ะ Battle
 if(x>TABLE.x-6&&x<TABLE.x+TABLE.w+6&&y>TABLE.y-4&&y<TABLE.y+TABLE.h+8)return true;
 return false}
function canStand(x,y){
 const s=X().st;
 if(isNc(s.place))return NCS()?NCS().canStand(x,y):false;
 if(isSk(s.place))return SKS()?SKS().canStand(x,y):false;
 if(s.place==='aucin')return AS()?AS().canStand(x,y):false;
 if(s.place==='cardst')return (!AS()||AS().canStand(x,y))&& x>=CD.x0&&x<=CD.x1&&y>=CD.y0&&y<=CD.y1&&!MACH.some(m=>Math.abs(x-m.x)<22&&y>m.y-16&&y<m.y+3);
 if(SC.sitting)return false;
 return x>=IN.x0&&x<=IN.x1&&y>=IN.y0&&y<=IN.y1&&!solid(x,y);
}
function nearMach(){const s=X().st;if(s.place!=='cardst')return null;let b=null,bd=1e9;for(const m of MACH){const dx=Math.abs(s.x-m.x),dy=s.y-m.y;if(dx<40&&dy>-30&&dy<52&&dx<bd){bd=dx;b=m}}return b}
function hotspot(){
 const s=X().st;let best=null,bd=1e9;
 for(const h of HS){const dx=Math.abs(s.x-h.x),dy=Math.abs(s.y-h.y);if(dx<h.rx&&dy<h.ry){const d=dx/h.rx+dy/h.ry;if(d<bd){bd=d;best=h}}}
 return best;
}
function lock(on){const s=X().st;s.keys={};s.moving=0;try{if(root.JOY){JOY.x=0;JOY.y=0}}catch(e){}
 if(on)s.talk={cs:1,acts:[]};else if(!SC.sitting)s.talk=null}
U.hooks.lock=()=>lock(true);
U.hooks.unlock=()=>lock(false);
U.hooks.save=()=>{try{save(1)}catch(e){}};
U.hooks.standUp=()=>standUp();

function prompt(){
 const x=X(),s=x.st;
 if(s.sleep||s.trans||s.mode!=='scene'||s.talk)return '';
 if(isNc(s.place))return NCS()?NCS().prompt():'';
 if(isSk(s.place))return SKS()?SKS().prompt():'';
 if(s.place==='aucin')return AS()?AS().prompt():'';
 if(s.place==='cardst'){
  if(AS()&&AS().nearGate())return AS().prompt();
  const nm=nearMach();if(nm){const M=C.GACHA.MACH_BY_ID[nm.id];return '🎰 INTERACT / กดเพื่อสุ่มการ์ด · ตู้ '+M.name}
  if(Math.abs(s.x-CD.doorX)<95&&s.y<CD.y0+60)return '🚪 กด E / ปุ่มโต้ตอบ เพื่อเข้าร้าน CARD SHOP';
  if(s.x<=150)return '⬅ เดินต่อไปทางซ้ายสุดเพื่อกลับไปอควาเรียม';
  if(s.x>=x.W-60)return '➡ เดินต่อไปทางขวาสุดเพื่อไป NICECLUB';
  return '';
 }
 if(SC.sitting)return '';
 const h=hotspot();if(h)return h.msg;
 if(s.y>=IN.y1-26&&Math.abs(s.x-IN.exitX)<75)return '🚪 เดินลง / กด E เพื่อออกจากร้าน';
 return '';
}
function hud(g){
 const x=X(),W=x.W,H=x.H,s=x.st;
 if(isNc(s.place)){if(NCS())NCS().hud(g);return}
 if(isSk(s.place)){if(SKS())SKS().hud(g);return}
 if(s.place==='aucin'){if(AS())AS().hud(g);return}
 const pm=prompt();
 if(pm){g.fillStyle='rgba(16,24,39,.86)';g.fillRect(W/2-290,H-146,580,30);g.fillStyle='#b98cff';g.fillRect(W/2-290,H-146,580,2);g.fillStyle='#ffe39b';g.font='bold 15px sans-serif';g.textAlign='center';g.fillText(pm,W/2,H-125)}
}
/* ปุ่มลอย (Collection / ตู้โชว์) — เห็นเฉพาะตอนอยู่ในฉากร้าน */
function ensureBtns(){
 if(SC.btns)return SC.btns;
 U.css();const d=document.createElement('div');d.id='csSceneBtns';
 d.innerHTML='<button data-c>📖 สมุดสะสม</button><button data-s>🛒 ซื้อซองการ์ด</button>';
 document.body.appendChild(d);
 d.onclick=e=>{const t=e.target.closest('button');if(!t)return;const s=X().st;if(s.trans||s.talk)return;
  if(t.hasAttribute('data-c')){lock(true);U.openCollection(()=>lock(false))}
  else if(t.hasAttribute('data-s')){if(s.place==='cardin'){lock(true);U.openShop('all')}else U.toast('ซื้อซองการ์ดได้ที่เคาน์เตอร์ในร้าน')}};
 SC.btns=d;return d;
}
function showBtns(on){const b=ensureBtns();b.classList.toggle('on',!!on)}

/* ---------- init ตอน enter() ---------- */
function init(place,from){
 if(isNc(place)){if(NCS())NCS().init(place,from);return}
 if(isSk(place)){if(SKS())SKS().init(place,from);return}
 if(place==='aucin'){if(AS())AS().init(place,from);return}
 const x=X(),s=x.st;s.hidden=false;SC.sitting=false;SC.sit=0;SC.door=0;
 try{const r=C.recoverBattle();if(r)setTimeout(()=>U.toast('การแข่งขันค้างจากครั้งก่อน — นับเป็นแพ้ (เสียเดิมพัน '+U.fmt(r.net<0?-r.net:0)+')'),900)}catch(e){console.error(e)}
 if(place==='cardst'){
  SC.ped=null;SC.ct=0;
  if(C.GACHA.pending())setTimeout(()=>{if(X().st.place==='cardst'&&!X().st.talk){U.resumeGacha()}},1600);
  if(from==='aqst'){s.x=-26;s.y=345;s.dir=3;s.trans={type:'arrive',t:0,toX:96,toY:345};x.setFade(1)}
  else if(from==='ncst'){s.x=x.W+26;s.y=352;s.dir=1;s.trans={type:'arrive',t:0,toX:902,toY:352};x.setFade(1)}
  else if(from==='aucin'&&AS()){AS().placeFromHall(s,x)}
  else if(from==='cardin'){s.x=CD.doorX;s.y=CD.doorY+2;s.dir=0;s.trans={type:'arrive',t:0,toX:CD.doorX,toY:336};x.setFade(1);SC.door=1}
  else{s.x=CD.doorX;s.y=350;s.dir=2}
 }else{
  SC.vis=null;SC.ct=0;
  s.x=IN.exitX;s.y=IN.exitY+24;s.dir=2;s.trans={type:'arrive',t:0,toX:IN.exitX,toY:452};x.setFade(1);
  if(C.GACHA.pending())setTimeout(()=>{if(X().st.place==='cardin'&&!X().st.talk){U.resumeGacha()}},1600);
  const p=C.pendingReveal();if(p)setTimeout(()=>{if(X().st.place==='cardin'){lock(true);U.openShop('all')}},1400);
 }
}

/* ---------- วาด: ถนนหน้าร้าน ---------- */
function npcDraw(g,a,t){X().drawStreetNPC(g,a,t)}
function drawMach(g,m,t){
 const im=mimg(m.id);if(!im.complete||!im.naturalWidth)return;
 const M=C.GACHA.MACH_BY_ID[m.id],near=nearMach()===m;
 m.k=(m.k||0)+(((near?1:0)-(m.k||0))*.18);
 const h=MH,w=h*im.naturalWidth/im.naturalHeight,bob=Math.sin(t/700+m.x)*.8;
 g.save();
 // เงาใต้ตู้
 g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(m.x,m.y+1,w*.5,4,0,0,Math.PI*2);g.fill();
 // แสงเรืองเมื่อผู้เล่นเข้าใกล้
 if(m.k>.02){const gr=g.createRadialGradient(m.x,m.y-h*.5,6,m.x,m.y-h*.5,h*.8);gr.addColorStop(0,M.color+'66');gr.addColorStop(1,M.color+'00');g.globalAlpha=m.k;g.fillStyle=gr;g.fillRect(m.x-h,m.y-h*1.4,h*2,h*1.7);g.globalAlpha=1}
 g.imageSmoothingEnabled=false;g.drawImage(im,m.x-w/2,m.y-h+bob*0,w,h);g.imageSmoothingEnabled=true;
 // ประกายเล็ก ๆ
 const tw=(Math.sin(t/260+m.x*.3)+1)/2;g.globalAlpha=.25+.6*tw*(.4+m.k);g.fillStyle='#fff';const sx=m.x-w*.3+((t/40+m.x)%(w*.6)),sy=m.y-h*.62-Math.sin(t/300+m.x)*6;g.fillRect(sx-1,sy-3,2,6);g.fillRect(sx-3,sy-1,6,2);
 g.restore();
 // ป้ายชื่อเมื่อเข้าใกล้
 if(m.k>.15){g.save();g.globalAlpha=Math.min(1,m.k*1.2);g.font='bold 10px sans-serif';g.textAlign='center';const tw2=g.measureText(M.name).width+14;g.fillStyle='rgba(10,8,24,.85)';g.fillRect(m.x-tw2/2,m.y-h-14,tw2,15);g.fillStyle=M.color;g.fillRect(m.x-tw2/2,m.y-h-14,tw2,2);g.fillStyle='#fff';g.fillText(M.name,m.x,m.y-h-3);g.restore()}
}
function drawExt(g,t){
 const x=X(),s=x.st,W=x.W,H=x.H;
 const dt=Math.min(.05,Math.max(0,(t-(SC.ct||t))/1000));SC.ct=t;
 g.fillStyle='#262a33';g.fillRect(0,0,W,H);
 if(IMG.ext.complete&&IMG.ext.naturalWidth)g.drawImage(IMG.ext,-203,0,1200,600);
 // คนเดินถนน
 if(!SC.ped){const ids=['mei','leo','goth','coat','chi','teal','fur','bun','praw','pink'].filter(id=>{try{return CUSTOMER_SPRITE_IMAGES[id]}catch(e){return false}});
  SC.ped=[0,1,2].map(i=>({kind:'customer',id:ids[(i*3+1)%Math.max(1,ids.length)]||'mei',x:140+i*300,y:352+i*14,d:i%2?1:3,f:i,v:30+i*6}))}
 const objs=[];
 SC.ped.forEach(a=>{a.x+=(a.d===3?1:-1)*a.v*dt;a.f+=dt*5;if(a.x>W+50)a.d=1;if(a.x<-50)a.d=3;objs.push({y:a.y,draw:()=>npcDraw(g,a,t)})});
 MACH.forEach(m=>objs.push({y:m.y,draw:()=>drawMach(g,m,t)}));
 if(AS())objs.push({y:AS().GATE.y,draw:()=>AS().drawGate(g,t)});
 if(!s.hidden)objs.push({y:s.y,draw:()=>x.drawCEO(g)});
 objs.sort((a,b)=>a.y-b.y);objs.forEach(o=>o.draw());
 // แสงเปิดประตู
 const tr=s.trans,near=Math.abs(s.x-CD.doorX)<120&&s.y<CD.y0+70||(tr&&tr.type==='csIn');
 SC.dk+=((near?1:0)-SC.dk)*Math.min(1,dt*6);
 const k=Math.max(SC.dk,SC.door);
 if(k>.02){const gr=g.createLinearGradient(0,200,0,300);gr.addColorStop(0,'rgba(255,236,170,'+(.12*k)+')');gr.addColorStop(1,'rgba(255,214,120,'+(.34*k)+')');g.fillStyle=gr;g.fillRect(CD.doorX-72,180,144,118)}
 if(tr&&tr.type==='csIn'&&tr.ph===1){g.fillStyle='rgba(255,224,150,'+(.25+.25*Math.min(1,tr.t))+')';g.fillRect(CD.doorX-60,200,120,96)}
 const dl=x.sceneDaylight();if(dl<1){g.fillStyle='rgba(6,10,34,'+((1-dl)*.26).toFixed(3)+')';g.fillRect(0,0,W,H)}
}

/* ---------- วาด: ภายในร้าน ---------- */
function drawTable(g,t){ // โต๊ะ Battle (พิกเซลอาร์ต)
 const T=TABLE;g.save();g.imageSmoothingEnabled=false;
 const fx=Math.round,x0=T.x,y0=T.y,w=T.w,h=T.h;
 g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(x0+w/2,y0+h+10,w*.62,9,0,0,Math.PI*2);g.fill();
 // ขาโต๊ะ
 g.fillStyle='#2a170b';g.fillRect(x0+5,y0+h-6,9,20);g.fillRect(x0+w-14,y0+h-6,9,20);g.fillRect(x0+14,y0+h-22,6,12);g.fillRect(x0+w-20,y0+h-22,6,12);
 // ผ้าคลุมหน้าโต๊ะ
 g.fillStyle='#4a2a12';g.fillRect(x0-2,y0+h-14,w+4,16);g.fillStyle='#d0a451';g.fillRect(x0-2,y0+h-14,w+4,2);g.fillRect(x0-2,y0+h+0,w+4,2);
 // แผ่นหน้าโต๊ะ (สี่เหลี่ยมคางหมู)
 g.fillStyle='#a56a31';g.beginPath();g.moveTo(x0+12,y0);g.lineTo(x0+w-12,y0);g.lineTo(x0+w+2,y0+h-14);g.lineTo(x0-2,y0+h-14);g.closePath();g.fill();
 g.fillStyle='#c98c4a';g.fillRect(x0+12,y0,w-24,2);
 // เสื่อเล่นการ์ด
 g.fillStyle='#14173a';g.beginPath();g.moveTo(x0+20,y0+5);g.lineTo(x0+w-20,y0+5);g.lineTo(x0+w-8,y0+h-19);g.lineTo(x0+8,y0+h-19);g.closePath();g.fill();
 g.strokeStyle='#d0a451';g.lineWidth=1;g.stroke();
 // มงกุฎ
 const cx=x0+w/2,cy=y0+h/2-9;g.fillStyle='#ffd96b';g.fillRect(cx-7,cy,14,4);g.fillRect(cx-7,cy-4,3,4);g.fillRect(cx-1,cy-7,3,7);g.fillRect(cx+5,cy-4,3,4);
 // กองเด็คสองฝั่ง
 g.fillStyle='#0b0c1a';g.fillRect(x0+22,y0+10,8,11);g.fillRect(x0+w-30,y0+10,8,11);g.fillStyle='#d0a451';g.fillRect(x0+22,y0+10,8,1);g.fillRect(x0+w-30,y0+10,8,1);
 g.restore();
}
function drawChair(g,x,y,face){ // เก้าอี้: พนักพิงอยู่ด้านนอก (face>0 = พนักอยู่ขวา)
 g.save();g.imageSmoothingEnabled=false;
 g.fillStyle='rgba(0,0,0,.28)';g.fillRect(x-15,y+1,30,5);
 g.fillStyle='#24160d';g.fillRect(face>0?x+9:x-15,y-40,7,34);g.fillStyle='#4a2c18';g.fillRect(face>0?x+9:x-15,y-40,7,3);   // พนักพิง
 g.fillStyle='#2f1c0f';g.fillRect(x-13,y-10,26,10);g.fillStyle='#4a2c18';g.fillRect(x-13,y-10,26,3);                       // ที่นั่ง
 g.fillStyle='#24160d';g.fillRect(x-11,y,4,8);g.fillRect(x+7,y,4,8);
 g.restore();
}
function drawShadowNpc(g,t){
 if(!SC.shc){SC.shc=document.createElement('canvas');SC.shc.width=170;SC.shc.height=150}
 const c=SC.shc,gg=c.getContext('2d');U.drawShadow(gg,c.width,c.height,t,'#a45cff');
 g.save();g.globalAlpha=.97;g.drawImage(c,SEAT.nx-40,SEAT.ny-86,96,85);g.restore();
}
function drawIn(g,t){
 const x=X(),s=x.st,W=x.W,H=x.H;
 const dt=Math.min(.05,Math.max(0,(t-(SC.ct||t))/1000));SC.ct=t;
 g.fillStyle='#1a1022';g.fillRect(0,0,W,H);
 if(IMG.int.complete&&IMG.int.naturalWidth)g.drawImage(IMG.int,0,-20,960,640);
 // ป้ายชื่อชั้นวาง
 SHELF_TAGS.forEach(tg=>{g.save();g.font='bold 9px sans-serif';g.textAlign='center';const w=g.measureText(tg.t).width+12;g.fillStyle='rgba(10,8,24,.82)';g.fillRect(tg.x-w/2,tg.y-9,w,14);g.fillStyle=tg.c;g.fillRect(tg.x-w/2,tg.y-9,w,1.5);g.fillText(tg.t,tg.x,tg.y+1);g.restore()});
 // พนักงานหลังเคาน์เตอร์ (วาดแล้ววาดเคาน์เตอร์ทับบริเวณขา)
 npcDraw(g,CLERK,t);
 npcDraw(g,COLLECTOR.id&&(()=>{try{return CHAR_IMAGES[COLLECTOR.id]?COLLECTOR:Object.assign(COLLECTOR,{id:'emp-rin'})}catch(e){return COLLECTOR}})(),t);
 if(IMG.int.complete&&IMG.int.naturalWidth)g.drawImage(IMG.int,480,296,430,82,300,165,268.75,51.25);
 // ผู้เข้าชมในร้าน
 if(!SC.vis){const ids=['leo','goth','coat','teal','fur','bun','pink','chi'].filter(id=>{try{return CUSTOMER_SPRITE_IMAGES[id]}catch(e){return false}});
  SC.vis=[0,1].map(i=>({kind:'customer',id:ids[(i*3+2)%Math.max(1,ids.length)]||'leo',x:[560,660][i],y:[462,458][i],d:i?1:3,f:0,tx:[560,660][i],ty:[462,458][i],wait:1+i*2,v:26}))}
 const PTS=[[130,462],[230,462],[330,464],[443,466],[560,462],[650,458]];
 SC.vis.forEach(a=>{
  if(a.wait>0){a.wait-=dt;a.mv=0}else{const dx=a.tx-a.x,dy=a.ty-a.y,d=Math.hypot(dx,dy);
   if(d<3){a.wait=3+Math.random()*5;const p=PTS[Math.floor(Math.random()*PTS.length)];a.tx=p[0];a.ty=p[1];a.mv=0}
   else{a.x+=dx/d*a.v*dt;a.y+=dy/d*a.v*dt;a.d=Math.abs(dx)>Math.abs(dy)?(dx<0?1:3):(dy<0?2:0);a.f+=dt*5;a.mv=1}}});
 drawChair(g,SEAT.nx,SEAT.ny,-1);drawShadowNpc(g,t);drawTable(g,t);drawChair(g,SEAT.px,SEAT.py,1);
 const objs=[];
 SC.vis.forEach(a=>objs.push({y:a.y,draw:()=>npcDraw(g,a,t)}));
 // ผู้เล่น (ปกติ / นั่ง)
 if(!s.hidden){
  if(SC.sitting||SC.sit>0){objs.push({y:SEAT.py+3,draw:()=>drawSeated(g)})}
  else objs.push({y:s.y,draw:()=>x.drawCEO(g)});
 }
 objs.sort((a,b)=>a.y-b.y);objs.forEach(o=>o.draw());
 // ประตูหน้าร้านเรืองแสงเมื่อเข้าใกล้
 // ชั้นหน้าสุด: ราวกั้นหน้าร้านถูกวาดในภาพอยู่แล้ว
}
function drawSeated(g){
 const x=X(),s=x.st;const k=Math.min(1,SC.sit);
 const ox=s.x,oy=s.y,od=s.dir;
 s.dir=1;s.x=SEAT.px-2;s.y=SEAT.py+2+k*8;s.moving=0;s.frame=0;
 g.save();g.beginPath();g.rect(0,0,960,SEAT.py+4+k*4);g.clip();   // ซ่อนขาใต้ที่นั่ง
 x.drawCEO(g);g.restore();
 s.x=ox;s.y=oy;s.dir=od;
 // ที่นั่งทับช่วงขา
 g.save();g.imageSmoothingEnabled=false;g.fillStyle='#2f1c0f';g.fillRect(SEAT.px-13,SEAT.py-8,26,8);g.fillStyle='#4a2c18';g.fillRect(SEAT.px-13,SEAT.py-8,26,2);g.restore();
}
function draw(g,t){
 const x=X(),s=x.st;
 if(isNc(s.place)){showBtns(false);if(NCS())NCS().draw(g,t);return}
 if(isSk(s.place)){showBtns(false);if(SKS())SKS().draw(g,t);return}
 if(s.place==='aucin'){showBtns(false);if(AS())AS().draw(g,t);return}
 showBtns(s.place==='cardin'&&!s.trans);
 if(s.place==='cardst')drawExt(g,t);else drawIn(g,t);
}

/* ---------- ขอบฉาก / อินพุต ---------- */
function edges(dx,dy){
 const s=X().st;if(s.trans||s.talk)return;
 if(isNc(s.place)){if(NCS())NCS().edges(dx,dy);return}
 if(isSk(s.place)){if(SKS())SKS().edges(dx,dy);return}
 if(s.place==='aucin'){if(AS())AS().edges(dx,dy);return}
 if(s.place==='cardst'){if(AS())AS().edges(dx,dy);if(dx<0&&s.x<=CD.x0+6)leaveLeft();if(dx>0&&s.x>=CD.x1-6)leaveRight();return}
 if(s.place==='cardin'&&!SC.sitting&&dy>0&&s.y>=IN.y1-6&&Math.abs(s.x-IN.exitX)<75)outBegin();
}
function leaveRight(){const x=X(),s=x.st;if(s.place!=='cardst'||!x.transLock())return;s.trans={type:'csLeaveR',t:0};x.toast('➡ เดินต่อไป NICECLUB')}
function leaveLeft(){const x=X(),s=x.st;if(s.place!=='cardst'||!x.transLock())return;s.trans={type:'csLeaveL',t:0};x.toast('⬅ เดินกลับไปอควาเรียม')}
function inBegin(){const x=X(),s=x.st;if(s.place!=='cardst'||!x.transLock())return;s.trans={type:'csIn',t:0,ph:0}}
function outBegin(){const x=X(),s=x.st;if(s.place!=='cardin'||SC.sitting||!x.transLock())return;s.trans={type:'csOut',t:0,ph:0}}
function sitBegin(){const x=X(),s=x.st;if(s.place!=='cardin'||SC.sitting||!x.transLock())return;
 if(C.pendingReveal()){x.toast('มีซองที่ยังไม่ได้เปิด — คุยกับพนักงานที่เคาน์เตอร์ก่อน');return}
 s.trans={type:'csSit',t:0,ph:0}}
function standUp(){const x=X(),s=x.st;if(!SC.sitting||s.trans)return;s.talk=null;s.trans={type:'csStand',t:0,ph:0}}

/* ---------- Transition (เดิน→ประตู→เฟด→โหลดฉาก) ---------- */
function trans(tr,dt){
 const x=X(),s=x.st;
 if(NCS()&&NCS().trans(tr,dt))return true;
 if(SKS()&&SKS().trans(tr,dt))return true;
 if(AS()&&AS().trans(tr,dt))return true;
 if(tr.type==='csIn'){
  if(tr.ph===0){if(x.walkTo(CD.doorX,CD.doorY+4,130,dt)){tr.ph=1;tr.t=0}}
  else{const k=Math.min(1,tr.t/1.1);s.y=CD.doorY+4-k*30;s.dir=2;s.moving=1;s.frame=(s.frame+dt*7)%4;x.setFade(Math.max(0,(k-.45)/.55));
   if(k>=1){s.moving=0;s.trans=null;x.enter('cardin',{from:'cardst'})}}
  return true}
 if(tr.type==='csOut'){
  if(tr.ph===0){if(x.walkTo(IN.exitX,IN.exitY-4,130,dt)){tr.ph=1;tr.t=0}}
  else{const k=Math.min(1,tr.t/.8);s.y=IN.exitY-4+k*30;s.dir=0;s.moving=1;s.frame=(s.frame+dt*7)%4;x.setFade(k);
   if(k>=1){s.moving=0;s.trans=null;x.enter('cardst',{from:'cardin'})}}
  return true}
 if(tr.type==='csLeaveL'){
  s.x-=135*dt;s.dir=1;s.moving=1;s.frame=(s.frame+135*dt/15)%4;x.setFade(Math.min(1,Math.max(0,(tr.t-.1)/.6)));
  if(tr.t>=.8){s.moving=0;s.trans=null;x.enter('aqst',{from:'cardst'})}
  return true}
 if(tr.type==='csLeaveR'){
  s.x+=135*dt;s.dir=3;s.moving=1;s.frame=(s.frame+135*dt/15)%4;x.setFade(Math.min(1,Math.max(0,(tr.t-.1)/.6)));
  if(tr.t>=.8){s.moving=0;s.trans=null;x.enter('ncst',{from:'cardst'})}
  return true}
 if(tr.type==='csSit'){
  if(tr.ph===0){ // เดินไปที่เก้าอี้ (ทางด้านขวา/ล่างของเก้าอี้)
   if(tr.sub==null)tr.sub=0;
   const tgt=tr.sub===0?[SEAT.px+20,SEAT.py+16]:[SEAT.px,SEAT.py+2];
   if(x.walkTo(tgt[0],tgt[1],110,dt)){if(tr.sub===0)tr.sub=1;else{tr.ph=1;tr.t=0;s.dir=1;s.moving=0}}}
  else{SC.sitting=true;SC.sit=Math.min(1,tr.t/.55);s.moving=0;s.dir=1;
   if(tr.t>=.7){s.trans=null;SC.sit=1;lock(true);U.openLobby()}}
  return true}
 if(tr.type==='csStand'){
  SC.sit=Math.max(0,1-tr.t/.5);
  if(tr.t>=.6){SC.sitting=false;SC.sit=0;s.x=SEAT.px+22;s.y=SEAT.py+18;s.dir=3;s.moving=0;s.trans=null;lock(false)}
  return true}
 return false;
}

/* ---------- Interact (กด E) ---------- */
function interact(){
 const x=X(),s=x.st;if(s.trans||s.talk||s.sleep)return;
 if(isNc(s.place)){if(NCS())NCS().interact();return}
 if(isSk(s.place)){if(SKS())SKS().interact();return}
 if(s.place==='aucin'){if(AS())AS().interact();return}
 if(s.place==='cardst'){
  if(AS()&&AS().nearGate()){AS().interact();return}
  const nm=nearMach();if(nm){lock(true);U.openMachine(nm.id);return}
  if(Math.abs(s.x-CD.doorX)<95&&s.y<CD.y0+60){inBegin();return}
  x.toast('🃏 CARD SHOP อยู่ตรงหน้า · เดินไปที่ประตูกลางร้านแล้วกด E');return}
 if(SC.sitting)return;
 const h=hotspot();
 if(h){
  if(h.sit){sitBegin();return}
  if(h.dsp){lock(true);U.openDisplay();return}
  if(h.buy){collectorTalk();lock(true);U.openBuyback();return}
  if(h.id==='counter'){clerkTalk();lock(true);U.openShop('all');return}
  lock(true);U.openShop(h.pack);return}
 if(s.y>=IN.y1-26&&Math.abs(s.x-IN.exitX)<75){outBegin();return}
 x.toast('🃏 CARD SHOP · เคาน์เตอร์=ซื้อซอง · ชั้นวาง 5 ระดับ · ตู้กระจก=ของหายาก · โต๊ะซ้ายล่าง=Card Battle');
}
function collectorTalk(){try{X().toast('💼 CARD COLLECTOR: “การ์ดซ้ำเอามาขายได้เลย ผมให้ 30% ของมูลค่า”')}catch(e){}}
function clerkTalk(){const L=['“ยินดีต้อนรับค่ะ! ซองไหนก็สุ่มจากการ์ดจริงทั้ง 36 ใบนะคะ”','“Tier ยิ่งสูงยิ่งยาก — Legendary แค่ 1% ในซองทั่วไปเลยค่ะ”','“ซองระดับสูงการันตี Tier ขั้นต่ำให้ด้วยนะคะ”','“อยากแข่งการ์ด? โต๊ะ Battle อยู่ทางซ้ายล่างค่ะ มี Shadow รออยู่!”'];U.toast('👩‍💼 พนักงาน: '+L[Math.floor(Math.random()*L.length)])}
function back(){ // ปุ่ม “กลับ” บนหัวฉาก
 const x=X(),s=x.st;if(s.trans||s.talk||s.sleep)return;
 if(isNc(s.place)){if(NCS())NCS().back();return}
 if(isSk(s.place)){if(SKS())SKS().back();return}
 if(s.place==='aucin'){if(AS())AS().back();return}
 if(s.place==='cardst'){leaveLeft();return}
 if(SC.sitting){standUp();return}
 outBegin();
}
function reset(){SC.sitting=false;SC.sit=0;showBtns(false);try{if(SKS())SKS().reset()}catch(e){}try{if(root.NICECLUB_SCENE)root.NICECLUB_SCENE.reset();if(root.STATION_SCENE)root.STATION_SCENE.reset();if(root.FOREST_SCENE)root.FOREST_SCENE.reset()}catch(e){}}

root.CARDSHOP_SCENE={MACH,nearMach,canStand,draw,hud,edges,trans,interact,back,init,prompt,reset,showBtns,SC,HS,SOL,SEAT,TABLE,CD,IN,standUp};
})(typeof window!=='undefined'?window:globalThis);

