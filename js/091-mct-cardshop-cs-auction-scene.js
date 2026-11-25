
/* ============================================================================
 * GRAND LEGENDARY AUCTION — SCENE
 *  · ประตูทางเข้า (วาดบนถนนหน้า CARD SHOP ปลายขวา)   · place 'aucin' = ฮอลล์ประมูล (วาดด้วยโค้ด)
 *  ใช้ st.place / enter() / st.trans / walkTo / setFade ของเกมเดิมผ่าน __CEO_CTX
 * ========================================================================== */
(function(root){
'use strict';
const C=root.CARDSHOP,U=root.CS_UI;
if(!C||!C.AUCTION||!U||!U.openAuction)return;
const A=C.AUCTION,X=()=>root.__CEO_CTX;

const GATE={x:846,y:338,w:62};                 // ประตูบนถนน (จุดวางเท้า)
const AH={x0:40,x1:920,y0:296,y1:500,exitX:480,exitY:498};
const STAGE={x0:292,x1:668,y0:176,y1:282};
const PODIUM={x:372,y:284};
const EMCEE={kind:'staff',id:'manager-white',x:372,y:270,d:0,f:0};
const VIP={kind:'staff',id:'detective-spy',x:812,y:296,d:0,f:0};
const VIPDESK={x:812,y:300};
const ROWS=[352,398,444];
const COLS=[104,170,236,302,658,724,790,856];
const HS=[
 {id:'seat',x:480,y:410,rx:110,ry:60,msg:'🔨 กด E เข้าร่วมงานประมูล GRAND LEGENDARY AUCTION'},
 {id:'emcee',x:372,y:306,rx:50,ry:22,msg:'🎤 กด E คุยกับพิธีกร · ดูประวัติการประมูล'},
 {id:'vip',x:812,y:326,rx:60,ry:24,msg:'💼 กด E คุยกับนักสะสมพิเศษ · ขายการ์ด SPECIAL (ขั้นต่ำ ฿1,000,000)'}
];
const SC={ct:0,imgs:{},seated:null,seatKey:''};

/* ---------- ตัวช่วย ---------- */
function cardImg(id){if(!SC.imgs[id]){const i=new Image();i.src=U.cardImg(id);SC.imgs[id]=i}return SC.imgs[id]}
function todayEv(){try{return A.currentEvent(C.day())}catch(e){return null}}
function noticeNow(){try{return A.notice(C.day())}catch(e){return {kind:'later',day:7,in:7}}}
function solid(x,y){
 if(y<AH.y0)return true;
 if(x>PODIUM.x-24&&x<PODIUM.x+24&&y<PODIUM.y+16)return true;
 if(x>VIPDESK.x-48&&x<VIPDESK.x+48&&y<VIPDESK.y+14)return true;
 if(SC.seated)for(const s of SC.seated)if(Math.abs(x-s.x)<17&&Math.abs(y-s.y)<9)return true;
 return false}
function canStand(x,y){
 const s=X().st;
 if(s.place==='cardst')return x>=42&&x<=918&&y>=306&&y<=384&&!(Math.abs(x-GATE.x+GATE.w/2)<7&&y<GATE.y+2)&&!(Math.abs(x-GATE.x-GATE.w/2)<7&&y<GATE.y+2);
 return x>=AH.x0&&x<=AH.x1&&y>=AH.y0&&y<=AH.y1&&!solid(x,y);
}
function nearGate(){const s=X().st;return s.place==='cardst'&&Math.abs(s.x-GATE.x)<GATE.w*.75&&s.y<GATE.y+34}
function hotspot(){
 const s=X().st;let best=null,bd=1e9;
 for(const h of HS){const dx=Math.abs(s.x-h.x),dy=Math.abs(s.y-h.y);if(dx<h.rx&&dy<h.ry){const d=dx/h.rx+dy/h.ry;if(d<bd){bd=d;best=h}}}
 return best}

/* ---------- ประตูบนถนน ---------- */
function drawGate(g,t){
 const n=noticeNow(),live=n.kind==='today'&&!n.done,k=nearGate()?1:0;
 const x=GATE.x,y=GATE.y,hw=GATE.w/2,h=100;
 g.save();
 // พรมแดง
 g.fillStyle='#7a0f1c';g.fillRect(x-hw+4,y-4,GATE.w-8,40);g.fillStyle='#d0a451';g.fillRect(x-hw+4,y-4,2,40);g.fillRect(x+hw-6,y-4,2,40);
 g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(x,y+1,hw+10,5,0,0,Math.PI*2);g.fill();
 // เสา
 for(const sx of [x-hw,x+hw]){
  const gr=g.createLinearGradient(sx-6,0,sx+6,0);gr.addColorStop(0,'#8a6a1f');gr.addColorStop(.5,'#ffe08a');gr.addColorStop(1,'#8a6a1f');
  g.fillStyle=gr;g.fillRect(sx-6,y-h,12,h);g.fillStyle='#4a350c';g.fillRect(sx-9,y-6,18,8);g.fillRect(sx-9,y-h-4,18,8);
  g.fillStyle='#ffd96b';g.beginPath();g.arc(sx,y-h-8,6,0,Math.PI*2);g.fill()}
 // ผ้าม่านในซุ้ม
 const cg=g.createLinearGradient(0,y-h,0,y);cg.addColorStop(0,'#5a0a16');cg.addColorStop(1,'#2a0610');g.fillStyle=cg;g.fillRect(x-hw+6,y-h+10,GATE.w-12,h-12);
 for(let i=0;i<5;i++){g.fillStyle='rgba(255,255,255,.06)';g.fillRect(x-hw+10+i*12,y-h+12,3,h-16)}
 // แสงจากประตู
 const gl=g.createRadialGradient(x,y-30,4,x,y-30,50);gl.addColorStop(0,'rgba(255,214,120,'+(.42+.2*k)+')');gl.addColorStop(1,'rgba(255,214,120,0)');g.fillStyle=gl;g.fillRect(x-hw,y-h,GATE.w,h);
 // ป้าย
 g.fillStyle='#16101e';g.fillRect(x-hw-14,y-h-30,GATE.w+28,24);g.strokeStyle='#ffd96b';g.lineWidth=2;g.strokeRect(x-hw-14,y-h-30,GATE.w+28,24);
 g.fillStyle='#ffd96b';g.font='bold 8px sans-serif';g.textAlign='center';g.fillText('GRAND LEGENDARY',x,y-h-19);g.fillText('AUCTION  🔨',x,y-h-9);
 // ไฟระยิบ
 for(let i=0;i<9;i++){const on=((t/260|0)+i)%3===0;g.fillStyle=on?'#fff6c2':'#b8881f';g.fillRect(x-hw-12+i*((GATE.w+24)/8)-1,y-h-33,3,3)}
 // ป้ายสถานะ
 const lab=live?'LIVE · วันนี้มีงาน!':n.kind==='tomorrow'?'พรุ่งนี้เปิดงาน':'งานถัดไป วัน '+n.day;
 g.font='bold 9px sans-serif';const w=g.measureText(lab).width+14;
 g.fillStyle=live?'#c4162a':'rgba(10,8,24,.88)';g.fillRect(x-w/2,y-h-48,w,15);g.fillStyle=live?'#fff':'#ffd96b';g.fillText(lab,x,y-h-37);
 if(live){g.globalAlpha=.4+.4*Math.sin(t/200);g.fillStyle='#ff4d4d';g.beginPath();g.arc(x-w/2-6,y-h-40,3,0,Math.PI*2);g.fill()}
 g.restore();
}

/* ---------- ฮอลล์ ---------- */
function chair(g,x,y){g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x-12,y,24,4);g.fillStyle='#5a0a16';g.fillRect(x-11,y-30,22,22);g.fillStyle='#7a1424';g.fillRect(x-11,y-30,22,4);g.fillStyle='#ffd96b';g.fillRect(x-11,y-30,22,1.5);g.fillStyle='#3a0610';g.fillRect(x-12,y-9,24,9);g.fillStyle='#7a1424';g.fillRect(x-12,y-9,24,3)}
function seatPlan(){ // กำหนดที่นั่ง NPC ผู้เข้าร่วมตามงานวันนี้ (คงที่ตามวัน — ไม่ random ใหม่ทุกเฟรม)
 const ev=todayEv(),key=ev?ev.day+':'+ev.parts.map(p=>p.id).join(','):'none';
 if(SC.seatKey===key)return;SC.seatKey=key;SC.seated=[];
 if(!ev)return;
 const all=[];ROWS.forEach((y,ri)=>COLS.forEach((x,ci)=>all.push({x,y,k:(ri*7+ci*3+ev.day)%19})));
 all.sort((a,b)=>a.k-b.k);
 ev.parts.forEach((p,i)=>{const n=A.NPC_BY_ID[p.id],s=all[i];if(n&&s)SC.seated.push({x:s.x,y:s.y,npc:p.id,a:{kind:'customer',id:n.sprite,x:s.x,y:s.y-2,d:2,f:0,mv:0}})});
}
function drawStageCard(g,t,ev){
 const cx=480,cy=214;
 let it=null;if(ev)it=ev.items.find(x=>x.state==='live')||ev.items.find(x=>!x.settled);
 const sp=!!(it&&it.kind==='SPECIAL');
 g.save();
 // แท่นโชว์
 g.fillStyle='#2a1a08';g.fillRect(cx-34,262,68,20);g.fillStyle='#ffd96b';g.fillRect(cx-34,262,68,3);g.fillStyle='#4a350c';g.fillRect(cx-26,252,52,10);
 if(it){
  const c=C.CARD_BY_ID[it.card],im=cardImg(it.card);
  if(im.complete&&im.naturalWidth){
   const h=72,w=c.por?h*300/421:h,bob=Math.sin(t/600)*3,y=cy-h/2+bob;
   const col=sp?'hsl('+((t/12)%360|0)+',100%,70%)':(it.kind==='T6'?C.TIERS[6].color:C.TIERS[5].color);
   const gr=g.createRadialGradient(cx,cy,8,cx,cy,70);gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=.55;g.fillStyle=gr;g.fillRect(cx-80,cy-80,160,160);g.globalAlpha=1;
   g.drawImage(im,cx-w/2,y,w,h);g.strokeStyle=col;g.lineWidth=2;g.strokeRect(cx-w/2-1,y-1,w+2,h+2);
   if(sp){g.globalCompositeOperation='lighter';const sh=((t/14)%(w+60))-30;g.fillStyle='rgba(255,255,255,.35)';g.fillRect(cx-w/2+sh-6,y,10,h);g.globalCompositeOperation='source-over'}}
 }else{ // ไม่มีงาน: ถ้วยรางวัลว่าง
  g.fillStyle='#ffd96b';g.fillRect(cx-14,226,28,6);g.fillRect(cx-4,232,8,16);g.beginPath();g.moveTo(cx-20,196);g.lineTo(cx+20,196);g.lineTo(cx+12,226);g.lineTo(cx-12,226);g.fill()}
 g.restore();
}
function drawBoard(g,t,ev){
 const x=350,y=34,w=260,h=70;
 g.save();g.fillStyle='#0a0814';g.fillRect(x-4,y-4,w+8,h+8);g.strokeStyle='#d0a451';g.lineWidth=3;g.strokeRect(x-4,y-4,w+8,h+8);
 g.fillStyle='#06050e';g.fillRect(x,y,w,h);g.textAlign='center';
 const n=noticeNow();let l1,l2,l3,col='#ffe08a';
 if(ev){const it=ev.items.find(i=>i.state==='live')||ev.items.find(i=>!i.settled);
  if(it){const c=C.CARD_BY_ID[it.card];l1='LOT '+(ev.items.indexOf(it)+1)+'/3 · '+(it.kind==='SPECIAL'?'SPECIAL':it.kind==='T6'?'MYTHIC':'LEGENDARY');l2=c.name;l3=it.state==='live'||it.bids.length?'฿ '+(it.bids.length?it.cur:it.start).toLocaleString():'เริ่มต้น ฿ '+it.start.toLocaleString();if(it.kind==='SPECIAL')col='hsl('+((t/10)%360|0)+',100%,70%)'}
  else{l1='AUCTION ENDED';l2='ขอบคุณทุกท่าน';l3='NEXT : DAY '+A.nextEventDay(C.day()+1)}}
 else{l1='NEXT AUCTION';l2='วันที่ '+n.day;l3='อีก '+(n.day-C.day())+' วัน'}
 g.fillStyle='#8a7a4a';g.font='bold 10px sans-serif';g.fillText(l1,x+w/2,y+16);
 g.fillStyle=col;g.font='bold 15px sans-serif';g.fillText(l2,x+w/2,y+36);g.font='bold 20px "Courier New",monospace';g.shadowColor=col;g.shadowBlur=8;g.fillText(l3,x+w/2,y+60);g.shadowBlur=0;
 g.restore();
}
function drawHall(g,t){
 const x=X(),s=x.st,W=x.W,H=x.H;
 const dt=Math.min(.05,Math.max(0,(t-(SC.ct||t))/1000));SC.ct=t;
 seatPlan();const ev=todayEv();
 const spl=!!(ev&&ev.items.some(i=>i.kind==='SPECIAL'&&!i.settled));
 // ผนัง
 const wg=g.createLinearGradient(0,0,0,300);wg.addColorStop(0,'#1a0f1e');wg.addColorStop(1,'#3a1626');g.fillStyle=wg;g.fillRect(0,0,W,300);
 g.fillStyle='rgba(255,217,107,.12)';for(let i=0;i<W;i+=48)g.fillRect(i,0,2,296);
 g.fillStyle='#ffd96b';g.fillRect(0,288,W,4);
 // ม่านแดงสองข้าง
 for(const [mx,dir] of [[0,1],[W,-1]]){const mg=g.createLinearGradient(mx,0,mx+dir*210,0);mg.addColorStop(0,'#5a0a16');mg.addColorStop(1,'rgba(90,10,22,0)');g.fillStyle=mg;g.fillRect(dir>0?0:W-210,0,210,292);
  for(let i=0;i<7;i++){g.fillStyle='rgba(0,0,0,.18)';g.fillRect(dir>0?i*28:W-i*28-3,0,3,292)}}
 // ฉากหลังเวที
 g.fillStyle='#220d2a';g.fillRect(STAGE.x0,40,STAGE.x1-STAGE.x0,STAGE.y0-40+30);
 g.fillStyle='rgba(255,217,107,.2)';g.fillRect(STAGE.x0,40,STAGE.x1-STAGE.x0,3);
 // เวที
 const sg=g.createLinearGradient(0,STAGE.y0+30,0,STAGE.y1);sg.addColorStop(0,'#6a4a1e');sg.addColorStop(1,'#3a2410');g.fillStyle=sg;g.fillRect(STAGE.x0-18,STAGE.y0+30,STAGE.x1-STAGE.x0+36,STAGE.y1-STAGE.y0-30);
 g.fillStyle='#ffd96b';g.fillRect(STAGE.x0-18,STAGE.y1-4,STAGE.x1-STAGE.x0+36,4);
 drawBoard(g,t,ev);
 // พื้น
 const fg=g.createLinearGradient(0,292,0,H);fg.addColorStop(0,'#2a1a14');fg.addColorStop(1,'#140c10');g.fillStyle=fg;g.fillRect(0,292,W,H-292);
 for(let i=0;i<W;i+=60){g.fillStyle='rgba(255,255,255,.035)';g.fillRect(i,292,2,H)}
 for(let j=300;j<H;j+=46){g.fillStyle='rgba(255,255,255,.03)';g.fillRect(0,j,W,2)}
 // พรมแดงกลางห้อง
 g.fillStyle='#7a0f1c';g.beginPath();g.moveTo(420,292);g.lineTo(540,292);g.lineTo(568,H);g.lineTo(392,H);g.closePath();g.fill();
 g.strokeStyle='#d0a451';g.lineWidth=2;g.beginPath();g.moveTo(420,292);g.lineTo(392,H);g.moveTo(540,292);g.lineTo(568,H);g.stroke();
 // แสงสปอตไลต์
 g.save();g.globalCompositeOperation='lighter';
 [[200,0],[480,1],[760,2]].forEach(([lx,i])=>{
  const col=spl?'hsl('+(((t/14)+i*120)%360|0)+',100%,60%)':'#ffe296';
  const sway=Math.sin(t/1500+i*2)*26;
  g.globalAlpha=spl?.34:.2;
  const lg=g.createLinearGradient(0,0,0,360);lg.addColorStop(0,col);lg.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=lg;g.beginPath();g.moveTo(lx-6,0);g.lineTo(lx+6,0);g.lineTo(lx+sway+(i-1)*-30+90,380);g.lineTo(lx+sway+(i-1)*-30-90,380);g.closePath();g.fill()});
 g.globalAlpha=1;g.restore();
 drawStageCard(g,t,ev);
 // ที่นั่ง + คนในห้อง
 const objs=[];
 ROWS.forEach(y=>COLS.forEach(cx=>objs.push({y:y-1,draw:()=>chair(g,cx,y)})));
 (SC.seated||[]).forEach(o=>objs.push({y:o.y,draw:()=>{x.drawStreetNPC(g,o.a,t);const near=Math.abs(s.x-o.x)<56&&Math.abs(s.y-o.y)<56;if(near){const n=A.NPC_BY_ID[o.npc];g.save();g.font='bold 9px sans-serif';g.textAlign='center';const w=g.measureText(n.name).width+12;g.fillStyle='rgba(10,8,24,.88)';g.fillRect(o.x-w/2,o.y-96,w,14);g.fillStyle=n.color;g.fillRect(o.x-w/2,o.y-96,w,2);g.fillStyle='#fff';g.fillText(n.name,o.x,o.y-86);g.restore()}}}));
 // พิธีกร + โพเดียม
 objs.push({y:EMCEE.y,draw:()=>x.drawStreetNPC(g,EMCEE,t)});
 objs.push({y:PODIUM.y+1,draw:()=>{g.fillStyle='rgba(0,0,0,.3)';g.fillRect(PODIUM.x-26,PODIUM.y,52,5);g.fillStyle='#3a2410';g.fillRect(PODIUM.x-22,PODIUM.y-34,44,34);g.fillStyle='#ffd96b';g.fillRect(PODIUM.x-22,PODIUM.y-34,44,3);g.font='bold 8px sans-serif';g.textAlign='center';g.fillText('🔨',PODIUM.x,PODIUM.y-14);g.fillRect(PODIUM.x+16,PODIUM.y-40,3,8)}});
 // โต๊ะ VIP นักสะสมพิเศษ
 objs.push({y:VIP.y,draw:()=>x.drawStreetNPC(g,VIP,t)});
 objs.push({y:VIPDESK.y+14,draw:()=>{g.fillStyle='rgba(0,0,0,.3)';g.fillRect(VIPDESK.x-50,VIPDESK.y+14,100,5);g.fillStyle='#1a1230';g.fillRect(VIPDESK.x-46,VIPDESK.y-22,92,36);g.fillStyle='#b69cff';g.fillRect(VIPDESK.x-46,VIPDESK.y-22,92,3);g.fillStyle='#ffd96b';g.font='bold 8px sans-serif';g.textAlign='center';g.fillText('SPECIAL COLLECTOR',VIPDESK.x,VIPDESK.y-6);g.fillStyle='#8a7bd0';g.fillText('รับซื้อ ≥ ฿1,000,000',VIPDESK.x,VIPDESK.y+6)}});
 if(!s.hidden)objs.push({y:s.y,draw:()=>x.drawCEO(g)});
 objs.sort((a,b)=>a.y-b.y);objs.forEach(o=>o.draw());
 // ป้าย
 g.save();g.font='bold 9px sans-serif';g.textAlign='center';
 [[PODIUM.x,PODIUM.y-98,'พิธีกร · ประวัติ','#ffd96b'],[VIP.x,VIP.y-98,'SPECIAL COLLECTOR','#b69cff']].forEach(([tx,ty,tt,c])=>{const w=g.measureText(tt).width+12;g.fillStyle='rgba(10,8,24,.85)';g.fillRect(tx-w/2,ty-9,w,14);g.fillStyle=c;g.fillRect(tx-w/2,ty-9,w,1.5);g.fillText(tt,tx,ty+1)});
 g.restore();
 // แสงวิ่งรอบห้องเมื่อ SPECIAL
 if(spl){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.07+.04*Math.sin(t/300);g.fillStyle='hsl('+((t/8)%360|0)+',100%,60%)';g.fillRect(0,0,W,H);g.restore()}
 // ทางออก
 g.fillStyle='rgba(255,217,107,'+(.1+.06*Math.sin(t/400))+')';g.fillRect(AH.exitX-70,H-26,140,26);
 g.fillStyle='#ffd96b';g.font='bold 10px sans-serif';g.textAlign='center';g.fillText('▼ EXIT',AH.exitX,H-8);
}
function draw(g,t){
 const s=X().st;
 if(s.place==='aucin')drawHall(g,t);
}

/* ---------- ฮุกต่าง ๆ ---------- */
function prompt(){
 const x=X(),s=x.st;
 if(s.sleep||s.trans||s.mode!=='scene'||s.talk)return '';
 if(s.place==='cardst'){
  if(nearGate()){const n=noticeNow();return '🔨 กด E / โต้ตอบ เพื่อเข้า GRAND LEGENDARY AUCTION'+(n.kind==='today'&&!n.done?' · วันนี้มีงาน!':' · งานถัดไป วันที่ '+n.day)}
  return '';
 }
 const h=hotspot();
 if(h){if(h.id==='seat'){const n=noticeNow();return n.kind==='today'&&!n.done?'🔨 กด E เข้าร่วมงานประมูล · วันนี้มีงาน!':'🔨 กด E ดูตารางงานประมูล · งานถัดไป วันที่ '+n.day}return h.msg}
 if(s.y>=AH.y1-26&&Math.abs(s.x-AH.exitX)<75)return '🚪 เดินลง / กด E เพื่อออกจากฮอลล์';
 return '';
}
function hud(g){
 const x=X(),W=x.W,H=x.H;const pm=prompt();
 if(pm){g.fillStyle='rgba(16,24,39,.86)';g.fillRect(W/2-300,H-146,600,30);g.fillStyle='#ffd96b';g.fillRect(W/2-300,H-146,600,2);g.fillStyle='#ffe39b';g.font='bold 14px sans-serif';g.textAlign='center';g.fillText(pm,W/2,H-125)}
}
function lock(on){const s=X().st;s.keys={};s.moving=0;try{if(root.JOY){JOY.x=0;JOY.y=0}}catch(e){}
 if(on)s.talk={cs:1,acts:[]};else s.talk=null}
function inBegin(){const x=X(),s=x.st;if(s.place!=='cardst'||!x.transLock())return;s.trans={type:'auIn',t:0,ph:0}}
function outBegin(){const x=X(),s=x.st;if(s.place!=='aucin'||!x.transLock())return;s.trans={type:'auOut',t:0,ph:0}}
function edges(dx,dy){
 const s=X().st;if(s.trans||s.talk)return;
 if(s.place==='cardst'){if(dy<0&&nearGate()&&s.y<=GATE.y+6)inBegin();return}
 if(s.place==='aucin'&&dy>0&&s.y>=AH.y1-6&&Math.abs(s.x-AH.exitX)<75)outBegin();
}
function trans(tr,dt){
 const x=X(),s=x.st;
 if(tr.type==='auIn'){
  if(tr.ph===0){if(x.walkTo(GATE.x,GATE.y+2,130,dt)){tr.ph=1;tr.t=0}}
  else{const k=Math.min(1,tr.t/1.1);s.y=GATE.y+2-k*30;s.dir=2;s.moving=1;s.frame=(s.frame+dt*7)%4;x.setFade(Math.max(0,(k-.45)/.55));
   if(k>=1){s.moving=0;s.trans=null;x.enter('aucin',{from:'cardst'})}}
  return true}
 if(tr.type==='auOut'){
  if(tr.ph===0){if(x.walkTo(AH.exitX,AH.exitY-4,130,dt)){tr.ph=1;tr.t=0}}
  else{const k=Math.min(1,tr.t/.8);s.y=AH.exitY-4+k*30;s.dir=0;s.moving=1;s.frame=(s.frame+dt*7)%4;x.setFade(k);
   if(k>=1){s.moving=0;s.trans=null;x.enter('cardst',{from:'aucin'})}}
  return true}
 return false}
function init(place,from){
 const x=X(),s=x.st;s.hidden=false;SC.seatKey='';
 if(place==='aucin'){s.x=AH.exitX;s.y=AH.exitY+24;s.dir=2;s.trans={type:'arrive',t:0,toX:AH.exitX,toY:462};x.setFade(1)}
 try{U.aucDayCheck&&U.aucDayCheck()}catch(e){}
}
/* เรียกจาก CARDSHOP_SCENE.init เมื่อกลับออกมาถนน (from==='aucin') */
function placeFromHall(s,x){s.x=GATE.x;s.y=GATE.y+2;s.dir=0;s.trans={type:'arrive',t:0,toX:GATE.x,toY:GATE.y+34};x.setFade(1)}
function interact(){
 const x=X(),s=x.st;if(s.trans||s.talk||s.sleep)return;
 if(s.place==='cardst'){if(nearGate()){inBegin();return}return}
 const h=hotspot();
 if(h){
  if(h.id==='seat'){lock(true);U.openAuction();return}
  if(h.id==='emcee'){x.toast('🎤 พิธีกร: “งานประมูลจัดทุก 7 วัน — มี 3 ล็อต Tier 5 / 6 และ SPECIAL ที่มีโอกาส 2% ค่ะ”');lock(true);U.openAuctionHistory(()=>lock(false));return}
  if(h.id==='vip'){lock(true);U.openSpecialBuyer(()=>lock(false));return}
 }
 if(s.y>=AH.y1-26&&Math.abs(s.x-AH.exitX)<75){outBegin();return}
 x.toast('🔨 GRAND LEGENDARY AUCTION · ที่นั่งกลางห้อง=เข้าร่วมประมูล · พิธีกร=ประวัติ · โต๊ะขวา=ขาย SPECIAL');
}
function back(){const s=X().st;if(s.trans||s.talk||s.sleep)return;if(s.place==='aucin')outBegin()}

root.AUCTION_SCENE={GATE,AH,HS,canStand,draw,drawGate,nearGate,hud,prompt,edges,trans,init,interact,back,placeFromHall,SC};
})(typeof window!=='undefined'?window:globalThis);

