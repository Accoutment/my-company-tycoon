
/* ============================================================================
 * NICECLUB — SCENE  (ncst ถนนหน้าร้าน · ncin ภายใน)   [STEP 3: Entry & Interaction]
 * ต่อกับเกมเดิมผ่าน window.__CEO_CTX + CARDSHOP_SCENE (ตัวกลางเดียวกับ SNOOKER)
 * ใช้ st.place / enter() / st.trans / walkTo / setFade / drawCEO / drawStreetNPC ของเกมเดิม
 * ภาพฉาก = ภาพที่ผู้ใช้แนบ + ชั้นโค้ด: ประตูเปิดได้, นีออน, ไฟเวที, พื้นเต้นรำ, NPC, เสียงบรรยากาศ
 * ไม่มีระบบ Player/Scene/Camera ซ้ำ · เซฟที่ S.niceclub (เกมเดิมเซฟให้เอง)
 * ========================================================================== */
(function(root){
'use strict';
if(root.NICECLUB_SCENE)return;
const A=root.NC_ASSETS||{};
const X=()=>root.__CEO_CTX;
const IMG={ext:new Image(),int:new Image()};IMG.ext.src=A.ext||'';IMG.int.src=A.int||'';
const isNc=p=>p==='ncst'||p==='ncin';
const BPM=124,BEAT=60000/BPM;               // จังหวะเพลงบรรยากาศ (ใช้กับแสง/เสียงในร้าน)

/* ---------- พิกัดฉาก (canvas 960×600) — วัดจากภาพที่ถูกวางจริง ---------- */
const ST={doorX:493,doorY:326,x0:42,x1:918,y0:342,y1:394};            // ถนนหน้าร้าน (ทางเท้า)
const ST_SOL=[[0,300,62,64],[68,374,20,12],[65,322,110,38],[150,352,125,22],[722,352,126,22],
 [339,350,10,22],[670,350,10,22],[180,345,10,22],[801,345,10,22],[857,320,100,40],[812,330,32,22]];   // x,y,w,h (จุดวางเท้าต้องไม่อยู่ในกรอบ)
const IN={exitX:481,exitY:590};                                        // ภายใน
const IN_OK=[[232,258,815,350],[400,350,565,432],[420,432,546,592],[378,238,582,258]];   // พื้นที่เดินได้ x0,y0,x1,y1
const IN_SOL=[[716,318,92,24]];                                        // ตู้ Arcade
const ARC=[{x:740,y:342,c:'#ff4fd8',n:'ARROW'},{x:786,y:342,c:'#4aa8ff',n:'BEAT'}];  // ตู้ Arcade 2 ตู้ (วาดด้วยโค้ด)
const HS=[
 {id:'dj',x:480,y:248,rx:105,ry:14,msg:'🎧 กด E ที่เวที DJ เพื่อเลือกเกมดนตรี'},
 {id:'arcade',x:763,y:346,rx:52,ry:22,msg:'🕹️ กด E ที่ตู้ Arcade เพื่อเลือกเกมดนตรี'},
 {id:'bar',x:240,y:300,rx:40,ry:50,msg:'🍸 กด E คุยกับบาร์เทนเดอร์'}
];
const W_=()=>{try{return X().W}catch(e){return 960}};
const SC={ct:0,door:0,dk:0,ped:[],pedT:0,dancers:null,crew:null,vis:0,visited:false};
const rect=(L,x,y)=>{for(const r of L)if(x>r[0]&&x<r[0]+r[2]&&y>r[1]&&y<r[1]+r[3])return true;return false};
const inOk=(x,y)=>IN_OK.some(r=>x>=r[0]&&x<=r[2]&&y>=r[1]&&y<=r[3]);
function canStand(x,y){
 const s=X().st;
 if(s.place==='ncst')return x>=ST.x0&&x<=ST.x1&&y>=ST.y0&&y<=ST.y1&&!rect(ST_SOL,x,y);
 return inOk(x,y)&&!rect(IN_SOL,x,y);
}
function lock(on){const s=X().st;s.keys={};s.moving=0;try{if(root.JOY){JOY.x=0;JOY.y=0}}catch(e){}s.talk=on?{nc:1,acts:[]}:null}
const toast=m=>{try{X().toast(m)}catch(e){}};
function custIds(){try{return Object.keys(CUSTOMER_SPRITE_IMAGES).filter(k=>{const i=CUSTOMER_SPRITE_IMAGES[k];return i&&i.naturalWidth})}catch(e){return[]}}
function beatPh(t){return (t/BEAT)%1}

/* ---------- ข้อมูลเซฟ (อยู่ใน S.niceclub) ---------- */
function state(){
 let S_=null;try{S_=typeof S!=='undefined'?S:null}catch(e){}
 if(!S_)return null;
 if(!S_.niceclub||typeof S_.niceclub!=='object')S_.niceclub={v:1};
 const n=S_.niceclub;if(typeof n.visits!=='number'||!isFinite(n.visits))n.visits=0;
 return n}
function persist(){try{save(1)}catch(e){}}

/* ---------- เสียงบรรยากาศ NICECLUB (สังเคราะห์ด้วย WebAudio · ไม่มีไฟล์เสียง) ---------- */
const AU={ctx:null,master:null,lp:null,timer:0,mode:0,next:0,beat:0,noise:null,on:0};
function soundOn(){try{return localStorage.getItem('mct_sound')!=='0'}catch(e){return true}}
function vol(){try{const v=localStorage.getItem('mct_vol');return v==null?.8:Math.max(0,Math.min(1,(+v)/100))}catch(e){return .8}}
function ac(force){ // AudioContext ตัวกลางของโมดูล NICECLUB (STEP 5 ใช้ตัวเดียวกัน ไม่สร้างเพิ่ม) · force = เกมต้องใช้นาฬิกาเสียงแม้ปิดเสียง
 if(!force&&!soundOn())return null;
 try{if(!AU.ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;AU.ctx=new C()}
  if(AU.ctx.state==='suspended')AU.ctx.resume();return AU.ctx}catch(e){return null}}
function noiseBuf(c){if(AU.noise)return AU.noise;const n=c.sampleRate*2,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);let p=0;for(let i=0;i<n;i++){p=p*.97+(Math.random()*2-1)*.1;d[i]=p}return AU.noise=b}
function kick(c,t,lv){const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(42,t+.16);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.9*lv,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+.22);o.connect(g);g.connect(AU.lp);o.start(t);o.stop(t+.25)}
function hat(c,t,lv){const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=noiseBuf(c);f.type='highpass';f.frequency.value=6500;
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.16*lv,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+.05);s.connect(f);f.connect(g);g.connect(AU.lp);s.start(t);s.stop(t+.07)}
function bass(c,t,hz,lv){const o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();o.type='sawtooth';o.frequency.value=hz;f.type='lowpass';f.frequency.value=260;
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.34*lv,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+BEAT/1000*.9);o.connect(f);f.connect(g);g.connect(AU.lp);o.start(t);o.stop(t+BEAT/1000)}
function pad(c,t,hz,lv){[1,1.5,2.003].forEach((m,i)=>{const o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.value=hz*m;
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.05*lv,t+.3);g.gain.exponentialRampToValueAtTime(.0001,t+BEAT/1000*4);o.connect(g);g.connect(AU.lp);o.start(t);o.stop(t+BEAT/1000*4+.05)})}
const BASSL=[55,55,82.4,55,65.4,65.4,98,65.4],PADL=[220,220,174.6,196];
function sched(){
 const c=AU.ctx;if(!c||!AU.on)return;
 const lv=AU.mode===2?1:.8;
 while(AU.next<c.currentTime+.35){
  const t=AU.next,b=AU.beat;
  kick(c,t,lv);hat(c,t+BEAT/2000,lv*.8);
  if(b%2===0)bass(c,t,BASSL[(b/2)%BASSL.length|0],lv);
  if(b%8===0)pad(c,t,PADL[(b/8)%PADL.length|0],lv);
  AU.next+=BEAT/1000;AU.beat++}
}
function amb(mode){ // mode 0=ปิด · 1=นอกร้าน (เสียงเบสลอดผนัง) · 2=ในร้าน
 if(!mode){ambOff();return}
 const c=ac();if(!c)return;
 try{
  if(!AU.master){AU.master=c.createGain();AU.lp=c.createBiquadFilter();AU.lp.type='lowpass';AU.lp.connect(AU.master);AU.master.connect(c.destination);AU.master.gain.value=0}
  if(!AU.on){AU.on=1;AU.next=c.currentTime+.08;AU.beat=0;
   const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=noiseBuf(c);s.loop=true;f.type='bandpass';f.frequency.value=520;f.Q.value=.5;g.gain.value=.10;s.connect(f);f.connect(g);g.connect(AU.lp);s.start();AU.crowd={s,g};
   AU.timer=setInterval(sched,90)}
  AU.mode=mode;const t=c.currentTime;
  AU.lp.frequency.setTargetAtTime(mode===2?2600:230,t,.25);
  AU.master.gain.setTargetAtTime((mode===2?.55:.30)*vol(),t,.35);
  if(AU.crowd)AU.crowd.g.gain.setTargetAtTime(mode===2?.12:.015,t,.4);
 }catch(e){}
}
function duck(on){if(!AU.master||!AU.ctx)return;try{AU.master.gain.setTargetAtTime(on?.04*vol():((AU.mode===2?.55:.30)*vol()),AU.ctx.currentTime,.12)}catch(e){}}
function ambOff(){
 if(!AU.on)return;AU.on=0;AU.mode=0;clearInterval(AU.timer);AU.timer=0;
 try{const c=AU.ctx,t=c.currentTime;AU.master.gain.setTargetAtTime(0,t,.15);const cr=AU.crowd;AU.crowd=null;if(cr)setTimeout(()=>{try{cr.s.stop()}catch(e){}},700)}catch(e){}
}
setInterval(()=>{try{const x=X();if(!AU.on)return;if(!x||!x.st||!x.st.active||!isNc(x.st.place))ambOff()}catch(e){}},400);

/* ---------- NPC ---------- */
const CREW=[
 {key:'dj',kind:'staff',id:'strategy-blond',x:482,y:190,d:0,f:0,clip:178,npc:{name:'DJ NOVA',title:'DJ ประจำร้าน',lines:['“คืนนี้ฟลอร์ร้อนแน่ เดินไปที่เวทีแล้วเลือกเกมได้เลย”','“จังหวะสำคัญกว่าความเร็ว ฟังบีตให้ดีนะ”']}},
 {key:'bar',kind:'staff',id:'staff-red',x:150,y:214,d:0,f:0,npc:{name:'MIKA',title:'บาร์เทนเดอร์',lines:['“รับอะไรดี? วันนี้ม็อกเทลมะนาวขายดีสุด”','“ถ้าอยากเล่นเกมดนตรี ไปที่เวทีหรือตู้ Arcade ได้เลยค่ะ”']}},
 {key:'guard',kind:'staff',id:'security-guard',x:561,y:458,d:0,f:0,npc:{name:'BOUNCER',title:'รปภ. ประจำร้าน',lines:['“ยินดีต้อนรับ เปิดให้เข้าทั้งคืน ทั้งวัน”','“โซนวีไอพียังไม่เปิดให้เข้านะครับ”']}}
];
function ensureCrew(){
 if(SC.crew)return;
 SC.crew=CREW.map(c=>Object.assign({},c));
 const ids=custIds(),nm=['ฟ้า','บีม','มิน','โอม','พิม','เจ'];
 SC.dancers=ids.length?[0,1,2,3].map(i=>({kind:'customer',id:ids[(i*2+1)%ids.length],hx:[360,430,520,590][i],hy:[286,310,292,314][i],x:0,y:0,d:0,f:0,mv:1,ph:i*1.7,
  npc:{name:'นักเต้น '+nm[i],title:'แขกในร้าน',lines:['“บีตวันนี้ได้ใจมาก!”','“มาเต้นด้วยกันสิ”','“เพลงนี้ชอบสุดๆ”']}})):[];
}
function nearNpc(){
 const s=X().st;if(s.place!=='ncin'||!SC.crew)return null;let b=null,bd=38;
 for(const a of SC.crew.concat(SC.dancers||[])){const d=Math.hypot(a.x-s.x,a.y-s.y);if(d<bd){bd=d;b=a}}return b}
function hotspot(){
 const s=X().st;let best=null,bd=1e9;
 for(const h of HS){const dx=Math.abs(s.x-h.x),dy=Math.abs(s.y-h.y);if(dx<h.rx&&dy<h.ry){const d=dx/h.rx+dy/h.ry;if(d<bd){bd=d;best=h}}}
 return best}

/* ---------- พรอมต์ / HUD ---------- */
function prompt(){
 const x=X(),s=x.st;if(s.sleep||s.trans||s.mode!=='scene'||s.talk)return'';
 if(s.place==='ncst'){
  if(Math.abs(s.x-ST.doorX)<92)return'🚪 กด E / ปุ่มโต้ตอบ เพื่อเข้า NICECLUB (เปิด 24 ชม.)';
  if(s.x<=150)return'⬅ เดินต่อไปทางซ้ายสุดเพื่อกลับไป CARD SHOP';
  if(s.x>=ST.x1-120&&s.y>=360)return'➡ เดินต่อไปทางขวาสุดเพื่อไป FOREST RIVER (ป่าแม่น้ำ)';
  return''}
 const n=nearNpc();if(n)return'💬 กด E คุยกับ '+n.npc.name+' · '+n.npc.title;
 const h=hotspot();if(h)return h.msg;
 if(s.y>=IN.exitY-22&&Math.abs(s.x-IN.exitX)<75)return'🚪 เดินลง / กด E เพื่อออกจากร้าน';
 return''}
function hud(g){
 const x=X(),W=x.W,H=x.H,s=x.st,pm=prompt();
 if(pm){g.fillStyle='rgba(16,10,32,.88)';g.fillRect(W/2-290,H-146,580,30);g.fillStyle='#ff4fd8';g.fillRect(W/2-290,H-146,580,2);g.fillStyle='#ffe9ff';g.font='bold 15px sans-serif';g.textAlign='center';g.fillText(pm,W/2,H-125)}
 if(s.place==='ncin'){g.save();g.font='bold 11px sans-serif';g.textAlign='left';const t='🎶 NICECLUB · เปิดตลอด 24 ชม.';const w=g.measureText(t).width+14;g.fillStyle='rgba(16,10,32,.78)';g.fillRect(8,8,w,20);g.fillStyle='#ff4fd8';g.fillRect(8,8,w,2);g.fillStyle='#ffe9ff';g.fillText(t,15,22);g.restore()}
}

/* ---------- init ตอน enter() ---------- */
function init(place,from){
 const x=X(),s=x.st;s.hidden=false;SC.door=0;SC.dk=0;SC.ct=0;
 ensureCrew();
 if(place==='ncst'){
  SC.ped=[];SC.pedT=1;
  if(from==='cardst'){s.x=-26;s.y=366;s.dir=3;s.trans={type:'arrive',t:0,toX:96,toY:366};x.setFade(1)}
  else if(from==='frst'){s.x=W_()+26;s.y=372;s.dir=1;s.trans={type:'arrive',t:0,toX:ST.x1-30,toY:372};x.setFade(1)}
  else if(from==='ncin'){s.x=ST.doorX;s.y=ST.doorY+2;s.dir=0;s.trans={type:'arrive',t:0,toX:ST.doorX,toY:364};x.setFade(1);SC.door=1}
  else{s.x=ST.doorX;s.y=372;s.dir=2}
  amb(1);
 }else{
  s.x=IN.exitX;s.y=IN.exitY+22;s.dir=2;s.trans={type:'arrive',t:0,toX:IN.exitX,toY:556};x.setFade(1);
  const n=state();if(n&&from==='ncst'){n.visits++;persist()}
  amb(2);
 }
}
function reset(){}

/* ---------- วาดเอฟเฟกต์ ---------- */
function glow(g,x,y,r,col,a){const gr=g.createRadialGradient(x,y,1,x,y,r);gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=a;g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);g.globalAlpha=1}
function npcDraw(g,a,t){X().drawStreetNPC(g,a,t)}
const BULBS=[312,343,373,406,434,464,494,524,553,583,613,645,675];
function drawDoor(g,k){ // ประตูกระจกคู่: เปิดออกด้านข้าง (หดความกว้างเข้าหาบานพับ) + แสงจากในร้าน
 if(k<.02)return;
 const x0=441,x1=548,y0=203,y1=322,mid=(x0+x1)/2,w=(x1-x0)/2;
 g.save();
 const gr=g.createLinearGradient(0,y0,0,y1);gr.addColorStop(0,'#ffb35a');gr.addColorStop(.45,'#ff4fd8');gr.addColorStop(1,'#6a1fd0');
 g.globalAlpha=Math.min(1,k*1.6);g.fillStyle=gr;g.fillRect(x0,y0,x1-x0,y1-y0);
 // เงาคนในร้าน
 g.globalAlpha=.55*k;g.fillStyle='#1a0830';[[462,262],[492,258],[522,264]].forEach(p=>{g.fillRect(p[0]-5,p[1],10,y1-p[1]);g.beginPath();g.arc(p[0],p[1]-2,5,0,7);g.fill()});
 g.globalAlpha=1;
 const lw=w*(1-.88*k);
 [[x0,lw,0],[x1,lw,1]].forEach(([hx,ww,r])=>{const lx=r?hx-ww:hx;g.fillStyle='rgba(34,14,64,.94)';g.fillRect(lx,y0,ww,y1-y0);g.strokeStyle='#e0b455';g.lineWidth=2;g.strokeRect(lx+1,y0+1,ww-2,y1-y0-2);
  g.fillStyle='rgba(180,140,255,.22)';g.fillRect(lx+3,y0+4,Math.max(0,ww*.4),y1-y0-8)});
 glow(g,mid,y1+6,70,'rgba(255,120,230,.9)',.5*k);
 g.restore();
}
function drawExt(g,t){
 const x=X(),s=x.st,W=x.W,H=x.H;
 const dt=Math.min(.05,Math.max(0,(t-(SC.ct||t))/1000));SC.ct=t;
 g.fillStyle='#1a0f2b';g.fillRect(0,0,W,H);
 if(IMG.ext.complete&&IMG.ext.naturalWidth)g.drawImage(IMG.ext,-120,0,1200,600);
 // ---- คนเดินถนน / รปภ.หน้าร้าน
 SC.pedT-=dt;const ids=custIds();
 if(window.LATE_NIGHT&&LATE_NIGHT()){SC.ped=[]}
 if(SC.pedT<=0&&SC.ped.length<4&&ids.length&&!(window.LATE_NIGHT&&LATE_NIGHT())){SC.pedT=3+Math.random()*6;const dir=Math.random()<.5?1:-1;
  SC.ped.push({kind:'customer',id:ids[Math.floor(Math.random()*ids.length)],x:dir>0?-30:W+30,y:[356,368,380][Math.floor(Math.random()*3)],d:dir>0?3:1,f:0,mv:1,v:34+Math.random()*14,dirx:dir})}
 for(const a of SC.ped){a.f+=dt*5;a.x+=a.dirx*a.v*dt;if(a.x<-50||a.x>W+50)a.dead=true}
 SC.ped=SC.ped.filter(a=>!a.dead);
 const objs=[];
 SC.ped.forEach(a=>objs.push({y:a.y,draw:()=>npcDraw(g,a,t)}));
 const gd=SC.crew&&SC.crew[2];if(gd)objs.push({y:338,draw:()=>npcDraw(g,{kind:'staff',id:gd.id,x:571,y:338,d:0,f:0},t)});
 if(!s.hidden)objs.push({y:s.y,draw:()=>x.drawCEO(g)});
 objs.sort((a,b)=>a.y-b.y);objs.forEach(o=>o.draw());
 // ---- เอฟเฟกต์นีออน (additive)
 const ph=t/BEAT,pulse=.5+.5*Math.sin(t/340),flick=(Math.sin(t/57)>.985||Math.sin(t/131+2)>.992)?.55:1;
 g.save();g.globalCompositeOperation='lighter';
 glow(g,500,88,150,'rgba(160,70,255,.9)',(.12+.08*pulse)*flick);
 glow(g,500,88,90,'rgba(255,90,230,.9)',(.08+.06*Math.sin(t/230))*flick);
 glow(g,590,92,38,'rgba(255,110,190,.9)',.10+.08*pulse);                    // แก้วค็อกเทลนีออน
 glow(g,834,150,70,'rgba(190,90,255,.9)',.10+.06*Math.sin(t/410+1));         // ป้ายโปสเตอร์ขวา
 glow(g,30,300,46,'rgba(255,120,240,.9)',.10+.06*Math.sin(t/390));           // ตู้โฆษณาป้ายรถเมล์
 glow(g,77,186,60,'rgba(255,200,110,.9)',.16+.04*Math.sin(t/250));           // โคมไฟซ้าย
 BULBS.forEach((bx,i)=>{const v=.5+.5*Math.sin(ph*Math.PI*2-i*.7);glow(g,bx,166,12,'rgba(255,210,120,.95)',.15+.5*v)});   // ไฟมาร์คีวิ่ง
 g.restore();
 // ---- ประตู (ขยับเปิดเมื่อเข้าใกล้ / ตอนเข้าร้าน)
 const tr=s.trans,near=Math.abs(s.x-ST.doorX)<115&&!s.hidden;
 SC.dk+=((near?.45:0)-SC.dk)*Math.min(1,dt*6);SC.door=Math.max(0,SC.door-dt*1.2);
 let k=Math.max(SC.dk,SC.door);
 if(tr&&tr.type==='ncIn'&&tr.ph===1)k=Math.max(k,Math.min(1,tr.t/.45));
 drawDoor(g,k);
 // ผู้เล่นที่เดินเข้าประตูถูกวาดทับด้านบนแล้ว (อยู่ใน objs) — ทางเข้าสว่างเมื่อกำลังเข้า
 if(tr&&tr.type==='ncIn'&&tr.ph===1){g.save();g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,110,230,'+(.18*Math.min(1,tr.t)).toFixed(3)+')';g.fillRect(430,196,128,136);g.restore()}
 if(!tr&&!s.hidden)ncGuide(g,t,W-46,350,'ป่าแม่น้ำ');
}
function ncGuide(g,t,sx,sy,txt){      // ลูกศรชี้ขวา → ทางไป FOREST RIVER
 const b=Math.round(Math.sin(t/230)*5),ax=sx+b,ay=sy;
 g.save();g.translate(ax,ay);g.rotate(-Math.PI/2);
 g.fillStyle='rgba(0,0,0,.55)';g.beginPath();g.moveTo(-13,-9);g.lineTo(13,-9);g.lineTo(0,15);g.closePath();g.fill();
 g.fillStyle='#ffe066';g.beginPath();g.moveTo(-11,-7);g.lineTo(11,-7);g.lineTo(0,12);g.closePath();g.fill();
 g.fillStyle='#fff6bd';g.fillRect(-4,-7,8,2);g.restore();
 g.save();g.font='bold 12px sans-serif';g.textAlign='center';const w=g.measureText(txt).width+14,cx=Math.min(956-w/2,ax-6),ty=ay+34;
 g.fillStyle='rgba(20,10,40,.85)';g.fillRect(Math.round(cx-w/2),ty-13,Math.round(w),18);g.fillStyle='#ffe066';g.fillRect(Math.round(cx-w/2),ty-13,Math.round(w),2);
 g.fillStyle='#fff';g.fillText(txt,Math.round(cx),ty);g.restore()}
function drawArcade(g,a,t,near){
 const w=34,h=56,x=a.x-w/2,y=a.y-h;g.save();g.imageSmoothingEnabled=false;
 g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(a.x,a.y+1,w*.62,5,0,0,7);g.fill();
 g.fillStyle='#1b1030';g.fillRect(x,y+6,w,h-6);g.fillRect(x+3,y,w-6,8);                       // ตัวตู้
 g.fillStyle=a.c;g.fillRect(x,y+6,2,h-6);g.fillRect(x+w-2,y+6,2,h-6);g.fillRect(x+3,y,w-6,2);  // ขอบนีออน
 g.fillStyle='#07040f';g.fillRect(x+5,y+12,w-10,22);                                           // จอ
 const fl=.55+.45*Math.sin(t/180+a.x);g.fillStyle=a.c;g.globalAlpha=.35+.35*fl;g.fillRect(x+7,y+14,w-14,18);g.globalAlpha=1;
 g.fillStyle='#fff';g.globalAlpha=.8;g.fillRect(x+9+((t/90+a.x)%(w-20)|0),y+20,3,3);g.globalAlpha=1;
 g.fillStyle='#2b1a4d';g.fillRect(x+4,y+36,w-8,8);g.fillStyle='#ffd96b';g.fillRect(x+9,y+38,4,4);g.fillStyle='#ff4f6a';g.fillRect(x+w-14,y+38,4,4);g.fillRect(x+w-20,y+38,4,4); // ปุ่ม
 g.font='bold 7px sans-serif';g.textAlign='center';g.fillStyle=a.c;g.fillText(a.n,a.x,y+4);
 g.restore();
 g.save();g.globalCompositeOperation='lighter';glow(g,a.x,a.y-30,46,a.c,(.12+.08*Math.sin(t/260+a.x))+(near?.18:0));g.restore();
}
function drawIn(g,t){
 const x=X(),s=x.st,W=x.W,H=x.H;
 const dt=Math.min(.05,Math.max(0,(t-(SC.ct||t))/1000));SC.ct=t;
 g.fillStyle='#120820';g.fillRect(0,0,W,H);
 if(IMG.int.complete&&IMG.int.naturalWidth)g.drawImage(IMG.int,-54,0,1068,600);
 ensureCrew();
 const ph=beatPh(t),bn=t/BEAT;
 // ---- แสงเวที / พื้นเต้นรำ / อีควอไลเซอร์ (additive)
 g.save();g.globalCompositeOperation='lighter';
 const hue=(i)=>'hsla('+((t/18+i*47)%360).toFixed(0)+',95%,60%,';
 // พื้นเต้นรำ: ตาราง 8×3 ตามมุมมอง (TL 320,257 · TR 645,257 · BR 700,345 · BL 260,345)
 for(let r=0;r<3;r++)for(let c=0;c<8;c++){
  const lx=(v)=>320+(260-320)*v, rx=(v)=>645+(700-645)*v, y=(v)=>257+(345-257)*v;
  const v0=r/3,v1=(r+1)/3,u0=c/8,u1=(c+1)/8;
  const P=(u,v)=>[lx(v)+(rx(v)-lx(v))*u,y(v)];
  const a=P(u0,v0),b=P(u1,v0),cc=P(u1,v1),d=P(u0,v1);
  const on=(Math.sin(bn*Math.PI+(c*1.3+r*2.1))>.2)?1:0.25;
  g.fillStyle=hue(c+r*3)+(.10+.20*on*(.5+.5*Math.sin(ph*Math.PI*2)))+')';
  g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.lineTo(cc[0],cc[1]);g.lineTo(d[0],d[1]);g.closePath();g.fill()}
 // ลำแสงสปอตไลต์จากโครงเวที
 [332,380,442,520,580,628].forEach((sx,i)=>{const sw=Math.sin(t/900+i*1.3)*70,tx=sx+(i<3?1:-1)*20+sw;
  const gr=g.createLinearGradient(sx,40,tx,320);gr.addColorStop(0,hue(i)+'.34)');gr.addColorStop(1,hue(i)+'0)');g.fillStyle=gr;
  g.beginPath();g.moveTo(sx-4,40);g.lineTo(sx+4,40);g.lineTo(tx+34,320);g.lineTo(tx-34,320);g.closePath();g.fill()});
 // อีควอไลเซอร์หลังบูธ DJ
 for(let i=0;i<8;i++){[[340,i*5],[552,i*5]].forEach((q,j)=>{const hgt=8+Math.abs(Math.sin(t/(130+i*17)+i+j))*44*(.6+.4*(1-ph));g.fillStyle=hue(i+j*4)+'.55)';g.fillRect(q[0]+q[1],165-hgt,4,hgt)})}
 glow(g,483,85,120,'rgba(170,80,255,.9)',.10+.08*Math.sin(t/300));                       // ป้ายนีออน Niceclub บนเวที
 glow(g,227,125,50,'rgba(255,100,220,.9)',.10+.07*Math.sin(t/410));                      // ป้ายค็อกเทลฝั่งบาร์
 g.restore();
 // ---- NPC
 const objs=[];
 SC.dancers.forEach(a=>{a.x=a.hx+Math.sin(t/1700+a.ph)*16;a.y=a.hy+Math.sin(t/2300+a.ph*2)*5;a.f=bn*2+a.ph;a.d=[0,1,0,3][(Math.floor(bn/2)+Math.floor(a.ph))%4];
  objs.push({y:a.y,draw:()=>{const dy=-Math.abs(Math.sin(ph*Math.PI))*3;g.save();g.translate(0,dy);npcDraw(g,a,t);g.restore()}})});
 SC.crew.forEach(a=>{a.f=0;
  if(a.key==='dj'){objs.push({y:a.y,draw:()=>{g.save();g.beginPath();g.rect(0,0,960,a.clip);g.clip();const bob=-Math.abs(Math.sin(ph*Math.PI))*2;g.translate(0,bob);npcDraw(g,a,t);g.restore()}})}
  else objs.push({y:a.y,draw:()=>npcDraw(g,a,t)})});
 const near=hotspot(),nearArc=near&&near.id==='arcade';
 ARC.forEach(a=>objs.push({y:a.y,draw:()=>drawArcade(g,a,t,nearArc)}));
 if(!s.hidden)objs.push({y:s.y,draw:()=>x.drawCEO(g)});
 objs.sort((a,b)=>a.y-b.y);objs.forEach(o=>o.draw());
 // ป้ายชื่อ NPC เมื่ออยู่ใกล้
 const nn=nearNpc();if(nn&&!s.talk){g.save();g.font='bold 11px sans-serif';g.textAlign='center';const w=g.measureText(nn.npc.name).width+14;g.fillStyle='rgba(16,10,32,.88)';g.fillRect(nn.x-w/2,nn.y-92,w,16);g.fillStyle='#ff4fd8';g.fillRect(nn.x-w/2,nn.y-92,w,2);g.fillStyle='#fff';g.fillText(nn.npc.name,nn.x,nn.y-80);g.restore()}
 // ชีพจรไฟรวม (strobe เบา ๆ ตามบีต) + วิกเน็ตต์
 const vg=g.createRadialGradient(480,300,200,480,300,560);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(8,2,20,.38)');g.fillStyle=vg;g.fillRect(0,0,W,H);
 if(ph<.08){g.save();g.globalCompositeOperation='lighter';g.fillStyle='rgba(170,90,255,'+(.05*(1-ph/.08)).toFixed(3)+')';g.fillRect(0,0,W,H);g.restore()}
}
function draw(g,t){const s=X().st;if(s.place==='ncst')drawExt(g,t);else drawIn(g,t)}

/* ---------- ขอบฉาก ---------- */
function edges(dx,dy){
 const s=X().st;if(s.trans||s.talk)return;
 if(s.place==='ncst'){if(dx<0&&s.x<=ST.x0+6)leaveLeft();if(dx>0&&s.x>=ST.x1-6)leaveRight();return}
 if(s.place==='ncin'&&dy>0&&s.y>=IN.exitY-6&&Math.abs(s.x-IN.exitX)<75)outBegin();
}
function leaveRight(){const x=X(),s=x.st;if(s.place!=='ncst'||!x.transLock())return;s.trans={type:'ncLeaveR',t:0};x.toast('➡ เดินต่อไป FOREST RIVER · ป่าแม่น้ำ')}
function leaveLeft(){const x=X(),s=x.st;if(s.place!=='ncst'||!x.transLock())return;s.trans={type:'ncLeaveL',t:0};x.toast('⬅ เดินกลับไป CARD SHOP')}
function inBegin(){const x=X(),s=x.st;if(s.place!=='ncst'||!x.transLock())return;s.trans={type:'ncIn',t:0,ph:0}}
function outBegin(){const x=X(),s=x.st;if(s.place!=='ncin'||!x.transLock())return;s.trans={type:'ncOut',t:0,ph:0}}

/* ---------- Transition ---------- */
function trans(tr,dt){
 const x=X(),s=x.st;
 if(tr.type==='ncIn'){
  if(tr.ph===0){if(x.walkTo(ST.doorX,ST.doorY+4,130,dt)){tr.ph=1;tr.t=0}}
  else{const k=Math.min(1,tr.t/1.2);s.y=ST.doorY+4-k*30;s.dir=2;s.moving=1;s.frame=(s.frame+dt*7)%4;x.setFade(Math.max(0,(k-.45)/.55));
   if(k>=1){s.moving=0;s.trans=null;x.enter('ncin',{from:'ncst'})}}
  return true}
 if(tr.type==='ncOut'){
  if(tr.ph===0){if(x.walkTo(IN.exitX,IN.exitY-6,130,dt)){tr.ph=1;tr.t=0}}
  else{const k=Math.min(1,tr.t/.8);s.y=IN.exitY-6+k*30;s.dir=0;s.moving=1;s.frame=(s.frame+dt*7)%4;x.setFade(k);
   if(k>=1){s.moving=0;s.trans=null;x.enter('ncst',{from:'ncin'})}}
  return true}
 if(tr.type==='ncLeaveR'){
  s.x+=135*dt;s.dir=3;s.moving=1;s.frame=(s.frame+135*dt/15)%4;x.setFade(Math.min(1,Math.max(0,(tr.t-.1)/.6)));
  if(tr.t>=.8){s.moving=0;s.trans=null;x.enter('frst',{from:'ncst'})}
  return true}
 if(tr.type==='ncLeaveL'){
  s.x-=135*dt;s.dir=1;s.moving=1;s.frame=(s.frame+135*dt/15)%4;x.setFade(Math.min(1,Math.max(0,(tr.t-.1)/.6)));
  if(tr.t>=.8){s.moving=0;s.trans=null;x.enter('cardst',{from:'ncst'})}
  return true}
 return false}

/* ---------- หน้าต่างเลือกเกม (กรอบกลาง — เนื้อหา 4 เกมจริงทำใน STEP 4) ---------- */
function css(){
 if(document.getElementById('ncCss'))return;
 const st=document.createElement('style');st.id='ncCss';
 st.textContent='#ncSel{position:fixed;inset:0;z-index:99990;display:flex;align-items:center;justify-content:center;padding:max(8px,env(safe-area-inset-top)) max(8px,env(safe-area-inset-right)) max(8px,env(safe-area-inset-bottom)) max(8px,env(safe-area-inset-left));background:rgba(8,2,20,.82);font-family:"Noto Sans Thai",sans-serif}'+
 '#ncSel .ncP{width:min(760px,100%);max-height:100%;overflow:auto;background:linear-gradient(160deg,#1a0a34,#0b0418);border:2px solid #ff4fd8;border-radius:14px;box-shadow:0 0 28px rgba(255,79,216,.45),inset 0 0 30px rgba(120,50,255,.25);padding:14px 16px;color:#fff}'+
 '#ncSel h2{margin:0 0 4px;font-size:20px;color:#ff9cf0;text-shadow:0 0 10px #ff4fd8;letter-spacing:1px}#ncSel small{color:#c7b3ff}'+
 '#ncSel .ncG{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:12px 0}'+
 '#ncSel .ncC{border:1px solid #6a3fd0;border-radius:10px;padding:10px;background:rgba(40,16,80,.6)}#ncSel .ncC b{display:block;font-size:15px;margin-bottom:3px}'+
 '#ncSel .ncC i{font-style:normal;font-size:12px;color:#d9c9ff;display:block;min-height:32px}#ncSel .ncC span{display:inline-block;margin-top:6px;font-size:11px;color:#ffd96b;border:1px solid #a98a2a;border-radius:99px;padding:2px 8px}'+
 '#ncSel .ncX{min-height:44px;min-width:120px;border:2px solid #ff4fd8;background:#2a0f52;color:#fff;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer}'+
 '@media (max-width:560px){#ncSel .ncG{grid-template-columns:1fr}}';
 document.head.appendChild(st);
}
let selKeyH=null,selPoll=0;
function closeSelect(){
 if(selPoll){clearInterval(selPoll);selPoll=0}
 try{root.NC_SONGS&&NC_SONGS.stopPreview()}catch(e){}
 const o=document.getElementById('ncSel');if(o)o.remove();
 if(selKeyH){document.removeEventListener('keydown',selKeyH,true);selKeyH=null}
 lock(false)}
function defaultSelect(hint){
 css();closeSelect();lock(true);
 const o=document.createElement('div');o.id='ncSel';
 const G=[['🏹 ARROW DANCE','กดลูกศร 4 ทิศตามจังหวะ'],['🎹 PIANO RHYTHM','โน้ตเลื่อนลงหลายช่อง · Tap/Hold'],['⭕ BEAT CIRCLE','วงกลมเคลื่อนเข้าหาจุดกด'],['🎧 DJ MIX','Scratch · Beat · Hold บนเครื่อง DJ']];
 o.innerHTML='<div class="ncP"><h2>🎶 NICECLUB · เลือกเกมดนตรี</h2><small>ตัวเกมทั้ง 4 ประเภทจะเปิดให้เล่นใน STEP ถัดไป · หน้าต่างนี้คือจุดเชื่อมจากเวที DJ / ตู้ Arcade</small><div class="ncG">'+
  G.map(g=>'<div class="ncC"><b>'+g[0]+'</b><i>'+g[1]+'</i><span>ยังไม่เปิดให้เล่น</span></div>').join('')+'</div><div style="text-align:center"><button class="ncX" type="button">ปิด ✕</button></div></div>';
 document.body.appendChild(o);
 const RS=root.NICECLUB&&root.NICECLUB.renderSelect;
 if(RS){o.innerHTML='';RS(o,hint,closeSelect)}
 else o.querySelector('.ncX').onclick=closeSelect;o.addEventListener('pointerdown',e=>{e.stopPropagation()});
 const born=performance.now();   // ตัวฟังที่ผูกระหว่าง keydown เดิมจะถูกยิงด้วยเหตุการณ์เดียวกัน → ละเว้นเหตุการณ์ก่อนเปิด/ปุ่มค้าง
 selKeyH=e=>{const k=(e.key||'').toLowerCase();if(k!=='escape'&&(RS||(k!=='e'&&k!=='enter')))return;e.preventDefault();e.stopImmediatePropagation();
  if(e.repeat||e.timeStamp<=born+120)return;closeSelect()};
 document.addEventListener('keydown',selKeyH,true);
 // กันค้าง: ถ้าระบบหลักปลดล็อกผู้เล่น (เช่น Escape ถูกจัดการที่อื่น) หรือออกจากฉาก → ปิดหน้าต่างเอง
 selPoll=setInterval(()=>{const c=X();if(!c||!c.st||!c.st.talk||!c.st.active||(c.st.place!=='ncin'&&c.st.place!=='ncst'))closeSelect()},120);
}
function openSelect(hint){(root.NICECLUB&&root.NICECLUB.selectUI?root.NICECLUB.selectUI:defaultSelect)(hint)}

/* ---------- โต้ตอบ ---------- */
function interact(){
 const x=X(),s=x.st;if(s.trans||s.talk||s.sleep)return;
 if(s.place==='ncst'){
  if(Math.abs(s.x-ST.doorX)<92){inBegin();return}
  x.toast('🎶 NICECLUB อยู่ตรงหน้า · เดินไปที่ประตูกลางร้านแล้วกด E');return}
 const n=nearNpc();
 if(n){const L=n.npc.lines;x.toast(n.npc.name+': '+L[Math.floor(Math.random()*L.length)]);return}
 const h=hotspot();
 if(h){
  if(h.id==='dj'){openSelect('dj');return}
  if(h.id==='arcade'){const a=ARC.reduce((m,c)=>Math.abs(c.x-s.x)<Math.abs(m.x-s.x)?c:m);openSelect(a.n==='BEAT'?'circle':'arrow');return}
  if(h.id==='bar'){const b=SC.crew&&SC.crew[1];x.toast('🍸 '+(b?b.npc.name:'บาร์เทนเดอร์')+': “ยินดีต้อนรับค่ะ วันนี้เปิดทั้งคืน ไปเต้นก่อนก็ได้นะคะ”');return}}
 if(s.y>=IN.exitY-22&&Math.abs(s.x-IN.exitX)<75){outBegin();return}
 x.toast('🎶 NICECLUB · เวที DJ / ตู้ Arcade = เลือกเกมดนตรี · บาร์ = คุยกับบาร์เทนเดอร์ · ทางออกอยู่บนพรมแดงด้านล่าง')}
function back(){const x=X(),s=x.st;if(s.trans||s.talk||s.sleep)return;
 if(s.place==='ncst'){leaveLeft();return}
 outBegin()}

root.NICECLUB_SCENE={canStand,draw,hud,edges,trans,interact,back,init,prompt,reset,SC,ST,IN,HS,IN_OK,IN_SOL,ST_SOL,ARC,hotspot,nearNpc,state,amb,ac};
const audioState=()=>({on:AU.on,mode:AU.mode,ctx:AU.ctx?AU.ctx.state:null,beat:AU.beat,timer:!!AU.timer});
root.NICECLUB=Object.assign(root.NICECLUB||{},{ac,amb,state,openSelect,closeSelect,duck,lock,audioState,BPM,version:'step5'});
})(typeof window!=='undefined'?window:globalThis);

