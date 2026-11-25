
/* ============================================================================
 * DEEP FOREST (ป่าลึก) + MINING CAVE (ถ้ำเหมือง 5 ชั้น) — ต่อจาก FOREST RIVER
 * ต่อกับเกมเดิมผ่าน __CEO_CTX + CARDSHOP_SCENE (ตัวกลางเดียวกับ NICECLUB/STATION/FOREST)
 *  - Player Controller / กล้อง / Transition / เงิน (S.money) / Save (S) เดิมทั้งหมด
 *  - แร่เข้ากระเป๋า "ใบเดียวกับปลา" ผ่าน CEOScene.shop.bagAdd (ITEM_DB = ฐานข้อมูลไอเทมสำหรับร้านค้าอนาคต)
 *  - ระบบเลือด/มอนสเตอร์/ขุดแร่/ร้าน MINER MERCHANT เป็นส่วนเพิ่มใหม่ ไม่ไปแตะระบบเดิม
 *  - ข้อมูลเซฟ: S.mine = {hp,mhp,unl,kills,pickBest}  (ไม่มีก็สร้างใหม่ → เซฟเก่าโหลดได้ปกติ)
 * ภาพฉาก/สไปรต์แร่ = ภาพที่ผู้ใช้แนบ (แยก Background ออกจาก Object: แร่วาดเป็นสไปรต์อิสระทับบนพื้น)
 * ========================================================================== */
(function(root){
'use strict';
if(root.DEEP_SCENE)return;
const A=root.DP_ASSETS||{},DD=root.DP_DATA||{};
const X=()=>root.__CEO_CTX;
const SH=()=>{try{return CEOScene.shop}catch(e){return null}};
const IW=A.w||1672,IH=A.h||941,SCL=600/IH,OX=-(IW*SCL-960)/2;
const gx=x=>OX+x*SCL,gy=y=>y*SCL,toS=r=>[gx(r[0]),gy(r[1]),gx(r[2]),gy(r[3])];
const TS=4,GW=240,GH=150;
function mkGrid(D){const gr=new Uint8Array(GW*GH);
 const fill=(r,v)=>{const a=toS(r),x0=Math.max(0,Math.floor(a[0]/TS)),x1=Math.min(GW-1,Math.floor((a[2]-.01)/TS)),y0=Math.max(0,Math.floor(a[1]/TS)),y1=Math.min(GH-1,Math.floor((a[3]-.01)/TS));for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)gr[y*GW+x]=v};
 (D.walk||[]).forEach(r=>fill(r,1));(D.block||[]).forEach(r=>fill(r,0));return gr}
const GR={dpfr:mkGrid(DD.dpfr||{}),cave:mkGrid(DD.cave||{})};
const okG=(pl,x,y)=>x>=0&&y>=0&&x<960&&y<600&&GR[pl][((y/TS)|0)*GW+((x/TS)|0)]===1;
const inR=(r,x,y)=>{const a=toS(r);return x>=a[0]&&x<=a[2]&&y>=a[1]&&y<=a[3]};
const DIRV={0:[0,1],1:[-1,0],2:[0,-1],3:[1,0]};      // 0=ลง 1=ซ้าย 2=ขึ้น 3=ขวา (ตามตัวควบคุมเดิม)
const now=()=>Date.now();

/* ===================== ITEM DATABASE (ใช้กับกระเป๋าเดิม) ===================== */
const IC={};            // cache ไอคอน dataURL
function oreIcon(k){return A.ores&&A.ores[k]||''}
function pickIcon(col,hd){const c=document.createElement('canvas');c.width=c.height=48;const g=c.getContext('2d');drawPick(g,24,24,40,col,hd,-.6);return c.toDataURL()}
const PICKS=[
 {id:'pick_wood',n:'Wooden Pickaxe',th:'พลั่วไม้',tier:1,power:5,cd:.62,price:500,col:'#a8743a',hd:'#c9a063',d:'พลังขุดต่ำ · ขุดหินและแร่เหล็ก'},
 {id:'pick_iron',n:'Iron Pickaxe',th:'พลั่วเหล็ก',tier:2,power:9,cd:.5,price:2000,col:'#7a4a22',hd:'#aab4c0',d:'ขุดเร็วขึ้น · ขุดแร่ระดับกลาง (แร่เงิน)'},
 {id:'pick_silver',n:'Silver Pickaxe',th:'พลั่วเงิน',tier:3,power:14,cd:.42,price:5000,col:'#7a4a22',hd:'#eef2f8',d:'พลังขุดสูง · ขุดแร่ระดับสูง (แร่ทอง)'},
 {id:'pick_gold',n:'Gold Pickaxe',th:'พลั่วทอง',tier:4,power:22,cd:.35,price:10000,col:'#7a4a22',hd:'#ffcc33',d:'พลังขุดสูงมาก · เหมาะกับถ้ำระดับลึก (แร่เพชร)'},
 {id:'pick_diamond',n:'Diamond Pickaxe',th:'พลั่วเพชร',tier:5,power:35,cd:.28,price:25000,col:'#7a4a22',hd:'#52d6ff',d:'พลังขุดสูงสุด · ขุดแร่ได้ทุกชนิด'}
];
const ORES={
 stone:{id:'stone',n:'หิน',item:'stone',hp:20,tough:0,need:1,resp:35,w:62,fx:['#8c8c98','#b8b8c4','#5a5a66']},
 iron:{id:'iron',n:'แร่เหล็ก',item:'iron_ore',hp:40,tough:1,need:1,resp:55,w:64,fx:['#b6bcc8','#6c5a58','#d9a37a']},
 silver:{id:'silver',n:'แร่เงิน',item:'silver_ore',hp:60,tough:2,need:2,resp:80,w:64,fx:['#eef2f8','#b9c2d2','#7e8696']},
 gold:{id:'gold',n:'แร่ทอง',item:'gold_ore',hp:85,tough:3,need:3,resp:110,w:64,fx:['#ffd23c','#ffb21c','#fff2a8']},
 diamond:{id:'diamond',n:'แร่เพชร',item:'diamond_ore',hp:120,tough:4,need:4,resp:160,w:66,fx:['#52d6ff','#bff0ff','#2a8fd6']}
};
const ITEM_DB={
 stone:{id:'stone',n:'หิน',type:'Material',price:3,desc:'ก้อนหินสีเทา',ico:()=>oreIcon('stone')},
 iron_ore:{id:'iron_ore',n:'แร่เหล็ก',type:'Material',price:15,desc:'หินแร่เหล็กสีเทาเข้ม',ico:()=>oreIcon('iron')},
 silver_ore:{id:'silver_ore',n:'แร่เงิน',type:'Material',price:45,desc:'แร่เงินสีขาวประกาย',ico:()=>oreIcon('silver')},
 gold_ore:{id:'gold_ore',n:'แร่ทอง',type:'Material',price:120,desc:'แร่ทองสีเหลืองทอง',ico:()=>oreIcon('gold')},
 diamond_ore:{id:'diamond_ore',n:'แร่เพชร',type:'Material',price:400,desc:'แร่เพชรสีฟ้า',ico:()=>oreIcon('diamond')}
};
PICKS.forEach(p=>{ITEM_DB[p.id]={id:p.id,n:p.n,type:'Tool',price:p.price,desc:p.d,tier:p.tier,power:p.power,ico:()=>IC[p.id]||(IC[p.id]=pickIcon(p.col,p.hd))}});
Object.keys(ITEM_DB).forEach(k=>{const it=ITEM_DB[k];it.icon=it.ico});
root.ITEM_DB=ITEM_DB;                                  // ให้ renderBag/bagPrev ของเกมเดิมใช้วาดไอคอน
const ORE_ITEMS=['stone','iron_ore','silver_ore','gold_ore','diamond_ore'];

/* ===================== STATE / SAVE ===================== */
function ms(){
 const S=getS();if(!S)return {hp:100,mhp:100,unl:1,kills:{}};
 let m=S.mine;if(!m||typeof m!=='object')m=S.mine={};
 if(typeof m.mhp!=='number')m.mhp=100;if(typeof m.hp!=='number')m.hp=m.mhp;if(typeof m.unl!=='number')m.unl=1;if(!m.kills)m.kills={};
 m.hp=Math.max(0,Math.min(m.mhp,m.hp));return m}
const getS=()=>{try{return S}catch(e){return null}};
function persist(){try{window.save(1)}catch(e){}}
function bagArr(){const s=SH();return s?s.bagArr():[]}
function have(id){return bagArr().reduce((a,s)=>a+(s&&s.id===id?s.n:0),0)}
function bagRoom(id){const s=SH();if(!s)return false;const B=s.bagArr();return B.some(x=>!x)||B.some(x=>x&&x.id===id&&x.n<s.BAG_MAX)}
function bestPick(){let b=null;PICKS.forEach(p=>{if(have(p.id)>0&&(!b||p.tier>b.tier))b=p});return b}
function toast(m){try{X().toast(m)}catch(e){}}
function itemAdd(id,n){const s=SH();let k=0;for(let i=0;i<n;i++){if(s&&s.bagAdd(id))k++;else break}
 try{const o=document.getElementById('ceoBag');if(o&&!o.hidden)CEOScene.shop&&0}catch(e){}return k}

/* ===================== AUDIO (AudioContext เดียว · ลิสต์เนอร์เดียว) ===================== */
const AU={ctx:null,m:null,amb:null,kind:'',noise:null,on:0};
const soundOn=()=>{try{return localStorage.getItem('mct_sound')!=='0'}catch(e){return true}};
const volM=()=>{try{const v=localStorage.getItem('mct_vol');return v==null?.8:Math.max(0,Math.min(1,(+v)/100))}catch(e){return .8}};
function ac(){if(!soundOn())return null;try{if(!AU.ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;AU.ctx=new C();AU.m=AU.ctx.createGain();AU.m.gain.value=.5*volM();const cp=AU.ctx.createDynamicsCompressor();AU.m.connect(cp);cp.connect(AU.ctx.destination)}
 if(AU.ctx.state==='suspended')AU.ctx.resume();AU.m.gain.value=.5*volM();return AU.ctx}catch(e){return null}}
function nbuf(c){if(AU.noise)return AU.noise;const n=c.sampleRate*2,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;return AU.noise=b}
function sfx(k){
 const c=ac();if(!c)return;const t=c.currentTime,o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();
 const burst=(fr,q,dur,vol)=>{const s=c.createBufferSource();s.buffer=nbuf(c);const gg=c.createGain(),ff=c.createBiquadFilter();ff.type='bandpass';ff.frequency.value=fr;ff.Q.value=q;gg.gain.setValueAtTime(vol,t);gg.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(ff);ff.connect(gg);gg.connect(AU.m);s.start(t,Math.random());s.stop(t+dur+.05)};
 if(k==='dig'){burst(1800,2,.09,.5);o.type='square';o.frequency.setValueAtTime(260,t);o.frequency.exponentialRampToValueAtTime(90,t+.08);g.gain.setValueAtTime(.18,t);g.gain.exponentialRampToValueAtTime(.001,t+.1)}
 else if(k==='break'){burst(700,.8,.4,.9);burst(2400,1.5,.25,.4);o.type='triangle';o.frequency.setValueAtTime(520,t);o.frequency.exponentialRampToValueAtTime(180,t+.3);g.gain.setValueAtTime(.2,t);g.gain.exponentialRampToValueAtTime(.001,t+.35)}
 else if(k==='hurt'){burst(300,.7,.25,.6);o.type='sawtooth';o.frequency.setValueAtTime(220,t);o.frequency.exponentialRampToValueAtTime(70,t+.25);g.gain.setValueAtTime(.22,t);g.gain.exponentialRampToValueAtTime(.001,t+.28)}
 else if(k==='swing'){burst(900,.6,.12,.25);o.type='sine';o.frequency.value=0;g.gain.value=0}
 else if(k==='hit'){burst(500,1.2,.12,.6);o.type='square';o.frequency.setValueAtTime(180,t);o.frequency.exponentialRampToValueAtTime(60,t+.1);g.gain.setValueAtTime(.18,t);g.gain.exponentialRampToValueAtTime(.001,t+.12)}
 else if(k==='kill'){o.type='square';o.frequency.setValueAtTime(420,t);o.frequency.exponentialRampToValueAtTime(100,t+.3);g.gain.setValueAtTime(.2,t);g.gain.exponentialRampToValueAtTime(.001,t+.32)}
 else if(k==='buy'){o.type='square';o.frequency.setValueAtTime(660,t);o.frequency.setValueAtTime(990,t+.08);g.gain.setValueAtTime(.16,t);g.gain.exponentialRampToValueAtTime(.001,t+.3)}
 else if(k==='deny'){o.type='square';o.frequency.setValueAtTime(160,t);g.gain.setValueAtTime(.14,t);g.gain.exponentialRampToValueAtTime(.001,t+.18)}
 else if(k==='low'){o.type='sine';o.frequency.setValueAtTime(110,t);g.gain.setValueAtTime(.22,t);g.gain.exponentialRampToValueAtTime(.001,t+.25)}
 else if(k==='door'){burst(200,.6,.5,.5);o.type='sine';o.frequency.value=0;g.gain.value=0}
 else{o.type='sine';g.gain.value=0}
 f.type='lowpass';f.frequency.value=4000;o.connect(f);f.connect(g);g.connect(AU.m);o.start(t);o.stop(t+.45)}
// เสียงบรรยากาศ: ป่า = ลม+ใบไม้+จิ้งหรีด/นกสังเคราะห์ · ถ้ำ = ก้องต่ำ+หยดน้ำ  (fade เข้า/ออก)
function ambStart(kind){
 const c=ac();if(!c||(AU.amb&&AU.kind===kind&&!AU.amb.dying))return;ambStop(true);
 const g=c.createGain();g.gain.value=0;g.connect(AU.m);
 const s=c.createBufferSource();s.buffer=nbuf(c);s.loop=true;const f=c.createBiquadFilter();f.type=kind==='cave'?'lowpass':'bandpass';f.frequency.value=kind==='cave'?180:700;f.Q.value=.5;
 const l=c.createOscillator(),lg=c.createGain();l.frequency.value=.13;lg.gain.value=kind==='cave'?40:260;l.connect(lg);lg.connect(f.frequency);
 s.connect(f);f.connect(g);s.start();l.start();
 g.gain.setTargetAtTime(kind==='cave'?.5:.34,c.currentTime,.8);
 AU.amb={g,s,l,t:0};AU.kind=kind;AU.on=1}
function ambStop(fast){const a=AU.amb;if(!a)return;AU.amb=null;AU.kind='';AU.on=0;try{const c=AU.ctx;a.g.gain.cancelScheduledValues(c.currentTime);a.g.gain.setTargetAtTime(0,c.currentTime,fast?.05:.5);setTimeout(()=>{try{a.s.stop();a.l.stop();a.g.disconnect()}catch(e){}},fast?300:2500)}catch(e){}}
function ambTick(pl){
 const c=AU.ctx;if(!c||!AU.amb)return;if(Math.random()<.02){const t=c.currentTime,o=c.createOscillator(),g=c.createGain();
  if(pl==='cave'){o.type='sine';o.frequency.setValueAtTime(1600+Math.random()*500,t);o.frequency.exponentialRampToValueAtTime(700,t+.12);g.gain.setValueAtTime(.05,t);g.gain.exponentialRampToValueAtTime(.001,t+.16)}
  else{o.type='sine';const b=2400+Math.random()*1400;o.frequency.setValueAtTime(b,t);o.frequency.linearRampToValueAtTime(b*1.25,t+.07);o.frequency.linearRampToValueAtTime(b*.9,t+.15);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.04,t+.03);g.gain.exponentialRampToValueAtTime(.0001,t+.2)}
  o.connect(g);g.connect(AU.m);o.start(t);o.stop(t+.3)}}

/* ===================== IMAGES ===================== */
const IM={dpfr:new Image(),cave:new Image(),ores:{}};let imReq=0;
function loadImgs(){if(imReq)return;imReq=1;IM.dpfr.src=A.dpfr;IM.cave.src=A.cave;Object.keys(A.ores||{}).forEach(k=>{const i=new Image();i.src=A.ores[k];IM.ores[k]=i})}

/* ===================== PARTICLES (pool) ===================== */
const PT=[];for(let i=0;i<160;i++)PT.push({a:0});let ptN=0;
function spawnP(x,y,vx,vy,l,c,sz,g){const p=PT[ptN=(ptN+1)%PT.length];p.a=1;p.x=x;p.y=y;p.vx=vx;p.vy=vy;p.l=l;p.m=l;p.c=c;p.s=sz||2;p.g=g==null?260:g}
function burstP(x,y,cols,n,spd,sz){for(let i=0;i<n;i++){const a=Math.random()*6.283,v=spd*(.4+Math.random()*.8);spawnP(x,y,Math.cos(a)*v,Math.sin(a)*v-spd*.5,.35+Math.random()*.4,cols[i%cols.length],sz||2)}}
function drawP(g,dt){for(const p of PT){if(!p.a)continue;p.l-=dt;if(p.l<=0){p.a=0;continue}p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;g.globalAlpha=Math.min(1,p.l/p.m*1.6);g.fillStyle=p.c;g.fillRect(Math.round(p.x),Math.round(p.y),p.s,p.s)}g.globalAlpha=1}

/* ===================== รันไทม์ต่อ "ฉาก/ชั้น" ===================== */
const LVN=[null,
 {n:'SHALLOW CAVE',th:'ถ้ำชั้น 1',tint:'rgba(0,0,0,0)',dark:.34,kill:5,ores:[['stone',70],['iron',30]],mons:[['slime',4]],hm:1,am:1},
 {n:'IRON DEPTH',th:'ถ้ำชั้น 2',tint:'rgba(150,70,40,.17)',dark:.42,kill:6,ores:[['stone',40],['iron',40],['silver',20]],mons:[['slime',3],['golem',2]],hm:1.2,am:1.1},
 {n:'SILVER DEPTH',th:'ถ้ำชั้น 3',tint:'rgba(40,80,170,.22)',dark:.5,kill:8,ores:[['iron',35],['silver',40],['gold',25]],mons:[['golem',3],['bat',3]],hm:1.5,am:1.3},
 {n:'GOLD DEPTH',th:'ถ้ำชั้น 4',tint:'rgba(190,140,30,.2)',dark:.56,kill:10,ores:[['silver',35],['gold',40],['diamond',25]],mons:[['golem',4],['bat',4]],hm:1.9,am:1.6},
 {n:'CRYSTAL DEPTH',th:'ถ้ำชั้น 5',tint:'rgba(120,50,190,.26)',dark:.6,kill:0,ores:[['stone',10],['iron',15],['silver',20],['gold',25],['diamond',30]],mons:[['golem',5],['bat',5],['slime',2]],hm:2.4,am:2}
];
const MON={
 slime:{n:'CAVE SLIME',hp:30,atk:5,sp:30,r:11,aggro:130,cd:1.1},
 golem:{n:'ROCK GOLEM',hp:100,atk:15,sp:24,r:17,aggro:150,cd:1.6},
 bat:{n:'CAVE BAT',hp:20,atk:8,sp:78,r:8,aggro:190,cd:.9,fly:1}
};
const R={cave:{lv:1,L:{}},dpfr:{mons:[],t:0,lastSp:0}};     // L[lv]={ores:[],mons:[],pool:[],tick}
let SC={ct:0,sw:null,mine:null,shake:0,flash:0,inv:0,regenT:0,defeat:0,hitT:0,ffly:[],spk:null};
const placeOf=()=>{try{return X().st.place}catch(e){return ''}};

function rng(seed){let r=seed;return()=>{r=(r*16807)%2147483647;return r/2147483647}}
function floorPool(lv){   // ตำแหน่งที่จะเกิดแร่ (สุ่มแบบกระจาย ไม่ซ้อน ไม่ขวางทาง)
 const rnd=rng(1000+lv*77),pts=[],D=DD.cave,fl=D.floor[0];
 let guard=0;while(pts.length<30&&guard++<4000){
  const nx=fl[0]+rnd()*(fl[2]-fl[0]),ny=fl[1]+rnd()*(fl[3]-fl[1]),sx=gx(nx),sy=gy(ny);
  if(!okG('cave',sx,sy)||!okG('cave',sx-26,sy)||!okG('cave',sx+26,sy)||!okG('cave',sx,sy-30)||!okG('cave',sx,sy+10))continue;
  if(inR(D.exit,sx,sy)||Math.hypot(sx-gx(D.hatch[0]),sy-gy(D.hatch[1]))<95||sx>gx(1330)&&sy<gy(520))continue;
  if(pts.some(p=>Math.hypot(p.x-sx,p.y-sy)<82))continue;
  pts.push({x:sx,y:sy})}
 return pts}
function pickOre(lv){const tb=LVN[lv].ores,tot=tb.reduce((a,b)=>a+b[1],0);let r=Math.random()*tot;for(const b of tb){r-=b[1];if(r<=0)return b[0]}return tb[0][0]}
function levelRT(lv){
 let L=R.cave.L[lv];if(L)return L;
 L=R.cave.L[lv]={ores:[],mons:[],pool:floorPool(lv),pend:[]};
 const n=lv===5?10:8;
 for(let i=0;i<n;i++)spawnOre(L,lv,true);
 LVN[lv].mons.forEach(([k,c])=>{for(let i=0;i<c;i++)spawnMon(L.mons,'cave',k,lv)});
 return L}
function spawnOre(L,lv,init){
 const free=L.pool.filter(p=>!L.ores.some(o=>o.px===p)&&(init||!nearPlayer(p.x,p.y,110)));
 if(!free.length)return false;const p=free[Math.floor(Math.random()*free.length)],t=pickOre(lv),def=ORES[t];
 L.ores.push({px:p,x:p.x,y:p.y,t,hp:def.hp,mhp:def.hp,hit:0,pop:init?1:0,shk:0});return true}
function nearPlayer(x,y,r){try{const s=X().st;return Math.hypot(s.x-x,s.y-y)<r}catch(e){return false}}
function monPos(pl,lv){
 for(let i=0;i<80;i++){let x,y;
  if(pl==='cave'){const fl=DD.cave.floor[0];x=gx(fl[0]+Math.random()*(fl[2]-fl[0]));y=gy(fl[1]+Math.random()*(fl[3]-fl[1]))}
  else{const sp=DD.dpfr;x=gx(200+Math.random()*820);y=gy(450+Math.random()*320)}
  if(!monOk(pl,x,y,MON.golem.r))continue;if(nearPlayer(x,y,170))continue;if(pl==='cave'&&inR(DD.cave.exit,x,y))continue;return[x,y]}
 return null}
function monOk(pl,x,y,r){
 if(!okG(pl,x-r*.6,y)||!okG(pl,x+r*.6,y)||!okG(pl,x,y+2))return false;
 if(pl==='dpfr'&&inR(DD.dpfr.safe,x,y))return false;return true}
function spawnMon(arr,pl,k,lv){
 const p=monPos(pl,lv);if(!p)return;const d=MON[k],m=(LVN[lv]||LVN[1]);
 arr.push({k,x:p[0],y:p[1],hp:Math.round(d.hp*(pl==='cave'?m.hm:1)),mhp:Math.round(d.hp*(pl==='cave'?m.hm:1)),atk:Math.round(d.atk*(pl==='cave'?m.am:1)),vx:0,vy:0,ph:Math.random()*6.28,cd:1,fl:0,wt:0,dir:1,wind:0,dead:0,kb:[0,0],lv})}

/* ===================== COLLISION (กริด + วัตถุ) ===================== */
function npcPos(){const n=DD.dpfr.npc;return{x:gx(n[0]),y:gy(n[1])}}
function canStand(x,y){
 const pl=placeOf();if(pl!=='dpfr'&&pl!=='cave')return false;
 if(!(okG(pl,x,y)&&okG(pl,x-5,y)&&okG(pl,x+5,y)))return false;
 if(pl==='cave'){const L=levelRT(R.cave.lv);for(const o of L.ores)if(Math.hypot(x-o.x,(y-o.y)*1.3)<19)return false}
 else{const n=npcPos();if(Math.hypot(x-n.x,(y-n.y)*1.3)<15)return false}
 return true}

/* ===================== ขุดแร่ / โจมตี ===================== */
function facingTarget(){
 const s=X().st,L=levelRT(R.cave.lv),dv=DIRV[s.dir]||[0,1];let best=null,bd=1e9;
 for(const o of L.ores){const dx=o.x-s.x,dy=o.y-s.y,d=Math.hypot(dx,dy);if(d>62)continue;
  const dot=(dx*dv[0]+dy*dv[1])/(d||1);if(dot<.35&&d>30)continue;if(d<bd){bd=d;best=o}}
 return best}
function nearestAny(){const s=X().st,L=levelRT(R.cave.lv);let b=null,bd=1e9;for(const o of L.ores){const d=Math.hypot(o.x-s.x,o.y-s.y);if(d<bd){bd=d;b=o}}return {o:b,d:bd}}
function interactCave(){
 const x=X(),s=x.st;
 if(SC.mine){toast('⛏ กำลังขุดอยู่ · กด Esc เพื่อยกเลิก');return}
 const hx=gx(DD.cave.hatch[0]),hy=gy(DD.cave.hatch[1]);
 if(Math.hypot(s.x-hx,s.y-hy)<60&&s.y<=hy+52){goDown();return}
 const o=facingTarget();
 if(o){startMine(o);return}
 const t=performance.now();if(t-(SC.hintAt||0)>2500){SC.hintAt=t;toast('⚔ ตีมอนสเตอร์ใช้ปุ่มดาบ (F) · ปุ่ม E ใช้ขุดแร่')}}
function startMine(o){
 const def=ORES[o.t],pk=bestPick();
 if(!pk){toast('⛏ ต้องมี Pickaxe ก่อน · ซื้อที่ MINER MERCHANT หน้าถ้ำ (ป่าลึก)');sfx('deny');return}
 if(pk.tier<def.need){const need=PICKS.find(p=>p.tier>=def.need);toast('⛏ '+def.n+'ต้องใช้ '+need.n+' ขึ้นไป (ตอนนี้ใช้ '+pk.n+')');sfx('deny');return}
 if(!bagRoom(def.item)){toast('🎒 กระเป๋าเต็ม — ขุดไม่ได้');sfx('deny');return}
 SC.mine={o,cd:0,pk,sw:0}}
function cancelMine(m){if(SC.mine){SC.mine=null;SC.sw=null;if(m)toast(m)}}
function swing(){          // ตีมอนสเตอร์ด้วย Pickaxe (ปุ่มดาบ / กด F)
 if(SC.sw)return;const pk=bestPick();SC.sw={t:0,hit:0,pk,mine:0};sfx('swing')}
function mineTick(dt){
 const x=X(),s=x.st,m=SC.mine;if(!m)return;
 const o=m.o,L=levelRT(R.cave.lv);
 if(!L.ores.includes(o)||s.moving||Math.hypot(o.x-s.x,o.y-s.y)>66){cancelMine(L.ores.includes(o)?'⛏ หยุดขุดแล้ว':null);return}
 const dv=DIRV[s.dir]||[0,1],dx=o.x-s.x,dy=o.y-s.y,d=Math.hypot(dx,dy);
 if(d>30&&(dx*dv[0]+dy*dv[1])/d<.2){cancelMine('⛏ ต้องหันหน้าเข้าหาแร่');return}
 m.cd-=dt;if(!SC.sw&&m.cd<=0){m.cd=m.pk.cd;SC.sw={t:0,hit:0,pk:m.pk,mine:1,o}}}
function digHit(o,pk){
 const def=ORES[o.t],dmg=Math.max(1,pk.power-def.tough);o.hp-=dmg;o.shk=.18;SC.shake=1.6;
 burstP(o.x,o.y-14,def.fx.concat(['#ffe9a0']),9,110,2);sfx('dig');
 for(let i=0;i<3;i++)spawnP(o.x+(Math.random()-.5)*14,o.y-18,(Math.random()-.5)*60,-80-Math.random()*60,.4,'#ffd24a',2,0);
 if(o.hp<=0)breakOre(o)}
function breakOre(o){
 const def=ORES[o.t],L=levelRT(R.cave.lv),i=L.ores.indexOf(o);if(i>=0)L.ores.splice(i,1);
 burstP(o.x,o.y-12,def.fx,26,170,3);burstP(o.x,o.y-12,['#fff'],8,120,2);sfx('break');SC.shake=3;
 let q=1;if(o.t==='stone')q=1+(Math.random()<.5?1:0);
 const k=itemAdd(def.item,q);
 if(k<1){toast('🎒 กระเป๋าเต็ม — แร่หาย!')}
 else toast('⛏ ได้ '+ITEM_DB[def.item].n+' ×'+k);
 L.pend.push({at:now()+def.resp*1000});SC.mine=null;
 try{const bg=document.getElementById('ceoBag');if(bg&&!bg.hidden)toast('')}catch(e){}
 persist()}
function swingTick(dt){
 const sw=SC.sw;if(!sw)return;const x=X(),s=x.st;sw.t+=dt;const dur=sw.mine&&sw.pk?Math.min(.34,sw.pk.cd*.7):.32;
 if(!sw.hit&&sw.t>=dur*.55){sw.hit=1;
  if(sw.mine&&sw.o)digHit(sw.o,sw.pk);
  else atkArc(sw.pk)}
 if(sw.t>=dur)SC.sw=null}
function atkArc(pk){
 const s=X().st,pl=placeOf(),mons=pl==='cave'?levelRT(R.cave.lv).mons:R.dpfr.mons,dv=DIRV[s.dir]||[0,1],pw=pk?pk.power:3;let hit=0;
 for(const m of mons){if(m.dead)continue;const dx=m.x-s.x,dy=m.y-s.y,d=Math.hypot(dx,dy),r=MON[m.k].r;
  if(d>48+r)continue;if((dx*dv[0]+dy*dv[1])/(d||1)<.15&&d>r+10)continue;
  m.hp-=pw;m.fl=.18;m.kb=[dx/(d||1)*150,dy/(d||1)*150];hit++;burstP(m.x,m.y-8,['#fff','#ffe066','#ff9a4a'],8,100,2);SC.shake=2;
  if(m.hp<=0)killMon(m,pl)}
 sfx(hit?'hit':'swing')}
function killMon(m,pl){
 m.dead=1;sfx('kill');burstP(m.x,m.y-6,m.k==='slime'?['#6fe06a','#b8ff9a']:m.k==='bat'?['#6a4a8a','#b49ad0']:['#8c8c98','#b8b8c4','#5a5a66'],20,150,3);
 if(pl==='cave'){const lv=R.cave.lv,M=ms();M.kills[lv]=(M.kills[lv]||0)+1;const K=LVN[lv].kill;
  if(K&&M.kills[lv]>=K&&M.unl<=lv){M.unl=lv+1;toast('🔓 ปลดล็อก '+LVN[lv+1].th+': '+LVN[lv+1].n+' · ไปที่ทางลง ▼');sfx('buy')}
  else if(K&&M.kills[lv]<=K)toast('👾 กำจัด '+M.kills[lv]+'/'+K);
  levelRT(lv).pend.push({m:m.k,at:now()+22000});persist()}
 else R.dpfr.pend=(R.dpfr.pend||[]).concat([{m:m.k,at:now()+18000}])}

/* ===================== มอนสเตอร์: AI ===================== */
function monTick(dt,pl,arr){
 const s=X().st;
 for(let i=arr.length-1;i>=0;i--){const m=arr[i];if(m.dead){arr.splice(i,1);continue}
  const d=MON[m.k];m.fl=Math.max(0,m.fl-dt);m.cd-=dt;m.ph+=dt*(m.k==='bat'?14:4);
  const dx=s.x-m.x,dy=s.y-m.y,dist=Math.hypot(dx,dy)||1;
  let sx=0,sy=0;
  if(Math.abs(m.kb[0])+Math.abs(m.kb[1])>8){sx=m.kb[0];sy=m.kb[1];m.kb[0]*=Math.pow(.02,dt);m.kb[1]*=Math.pow(.02,dt)}
  else if(m.wind>0){m.wind-=dt;if(m.wind<=0)golemSlam(m)}
  else if(dist<d.aggro&&!SC.defeat){const sp=d.sp*(m.k==='bat'?1+Math.sin(m.ph*.5)*.35:1);sx=dx/dist*sp;sy=dy/dist*sp;if(m.k==='bat'){sx+=Math.cos(m.ph*.7)*20;sy+=Math.sin(m.ph*.9)*20}
   if(dist<d.r+11&&m.cd<=0&&!SC.defeat){if(m.k==='golem'){m.wind=.55;m.cd=d.cd+.55;sx=sy=0}else{hurtPlayer(m.atk,m.x,m.y);m.cd=d.cd}}}
  else{m.wt-=dt;if(m.wt<=0){m.wt=1+Math.random()*2.5;const a=Math.random()*6.28;m.vx=Math.cos(a)*d.sp*.5;m.vy=Math.sin(a)*d.sp*.5;if(Math.random()<.35)m.vx=m.vy=0}sx=m.vx;sy=m.vy}
  if(sx>1)m.dir=1;else if(sx<-1)m.dir=-1;
  const nx=m.x+sx*dt,ny=m.y+sy*dt;
  if(d.fly){if(nx>10&&nx<950&&ny>(pl==='cave'?gy(370):gy(450))&&ny<(pl==='cave'?gy(820):gy(800))&&!(pl==='dpfr'&&inR(DD.dpfr.safe,nx,ny))){m.x=nx;m.y=ny}else{m.vx=-m.vx;m.vy=-m.vy}}
  else{if(monOk(pl,nx,m.y,d.r))m.x=nx;else m.vx=-m.vx;if(monOk(pl,m.x,ny,d.r))m.y=ny;else m.vy=-m.vy}
 }
 if(arr===R.dpfr.mons)return}
function golemSlam(m){const s=X().st;burstP(m.x,m.y+4,['#8c8c98','#5a5a66','#b8b8c4'],14,130,3);SC.shake=2.5;if(Math.hypot(s.x-m.x,s.y-m.y)<46&&!SC.defeat)hurtPlayer(m.atk,m.x,m.y)}
function hurtPlayer(dmg,fx,fy){
 if(SC.inv>0||SC.defeat)return;const M=ms(),s=X().st;
 M.hp=Math.max(0,M.hp-dmg);SC.inv=1.05;SC.flash=.35;SC.shake=4;sfx('hurt');cancelMine(null);
 const dx=s.x-fx,dy=s.y-fy,d=Math.hypot(dx,dy)||1,nx=s.x+dx/d*16,ny=s.y+dy/d*16;if(canStand(nx,ny)){s.x=nx;s.y=ny}
 burstP(s.x,s.y-18,['#ff4040','#ff8a8a'],8,110,2);toast('💥 -'+dmg+' HP');
 if(M.hp<=0)defeat();else persist()}
function defeat(){
 SC.defeat=1;const x=X(),s=x.st;s.talk={boss:1,acts:[]};s.moving=0;s.keys={};cancelMine(null);SC.sw=null;
 let d=document.getElementById('dpDef');if(!d){dpCss();d=document.createElement('div');d.id='dpDef';document.body.appendChild(d)}
 d.innerHTML='<div class="dpDP"><h2>💀 พ่ายแพ้!</h2><p>คุณหมดแรงในถ้ำ · ไอเทมและเงินไม่หาย</p><button id="dpDefB">กลับไปยังจุดปลอดภัย</button></div>';d.hidden=false;
 document.getElementById('dpDefB').onclick=()=>{d.hidden=true;const M=ms();M.hp=Math.max(30,Math.round(M.mhp*.5));SC.defeat=0;s.talk=null;SC.inv=1.5;persist();
  if(placeOf()==='cave'){goForest()}else{const n=DD.dpfr.npc;s.x=gx(n[0])-40;s.y=gy(n[1])+40}}}

/* ===================== ชั้นถ้ำ ===================== */
function goDown(){
 const x=X(),M=ms(),lv=R.cave.lv;if(lv>=5){toast('💎 นี่คือชั้นลึกที่สุด · CRYSTAL DEPTH');return}
 if(M.unl<=lv){const K=LVN[lv].kill;toast('🔒 ทางลงถูกปิด · กำจัด Monster ให้ครบ '+(M.kills[lv]||0)+'/'+K+' ก่อน');sfx('deny');return}
 changeLevel(lv+1)}
function resetRun(){       // ขึ้นจากชั้นลึก = ไม่เซฟความคืบหน้า: กลับชั้น 1 · ล็อกทางลง · ต้องกำจัด Monster ใหม่
 const M=ms();M.unl=1;M.kills={};Object.keys(R.cave.L).forEach(k=>{if(+k>1)delete R.cave.L[k]});persist()}
function goUp(){const lv=R.cave.lv;if(lv<=1)goForest();else changeLevel(1,true)}
function changeLevel(n,reset){
 const x=X(),s=x.st;if(!x.transLock||!x.transLock())return;cancelMine(null);s.trans={type:'dpLv',t:0,to:n,reset:!!reset};sfx('door')}
function goForest(){const x=X(),s=x.st;if(s.trans&&s.trans.type!=='dpLv')return;cancelMine(null);s.trans={type:'dpToForest',t:0}}

/* ===================== วาด: ฉากพื้น/แสง ===================== */
function mkFly(){SC.ffly=[];for(let i=0;i<26;i++)SC.ffly.push({x:Math.random()*960,y:120+Math.random()*440,ph:Math.random()*6.28,sp:.4+Math.random()*.6})}
function nightK(){let h=12;try{h=X().hour()}catch(e){}try{if(root.ROADCARS&&ROADCARS.nightK)return ROADCARS.nightK(h)}catch(e){}return 0}
function drawFlies(g,t,k){
 g.save();g.globalCompositeOperation='lighter';
 SC.ffly.forEach(f=>{const a=.5+.5*Math.sin(t/(380/f.sp)+f.ph),x=f.x+Math.sin(t/1700*f.sp+f.ph)*26,y=f.y+Math.cos(t/2100*f.sp+f.ph)*16;
  g.fillStyle='rgba(255,246,150,'+(.14*a*(.5+k)).toFixed(3)+')';g.beginPath();g.arc(x,y,6,0,7);g.fill();
  g.fillStyle='rgba(255,252,190,'+((.35+.55*k)*a).toFixed(3)+')';g.fillRect(Math.round(x),Math.round(y),2,2)});g.restore()}
function drawForestBG(g,t){
 if(!IM.dpfr.complete||!IM.dpfr.naturalWidth){g.fillStyle='#0f2a18';g.fillRect(0,0,960,600);return}
 g.imageSmoothingEnabled=true;try{g.imageSmoothingQuality='high'}catch(e){}
 g.drawImage(IM.dpfr,OX,0,IW*SCL,600);
 const bands=[[0,300,0,1100],[0,300,1450,IW],[800,IH,0,IW]];                       // ใบไม้/เรือนยอดไหวตามลม
 bands.forEach(b=>{for(let y=b[0];y<b[1];y+=10){const off=Math.sin(t/980+y*.05)*1.1+Math.sin(t/440+y*.09)*.3;g.drawImage(IM.dpfr,b[2],y,b[3]-b[2],10,gx(b[2])+off,gy(y),(b[3]-b[2])*SCL,10*SCL+.4)}});
 // ลำธาร: ระยิบ/ระลอก + น้ำตกเล็ก
 g.save();g.beginPath();(DD.dpfr.wet||[]).forEach(r=>{const a=toS(r);g.rect(a[0],a[1],a[2]-a[0],a[3]-a[1])});g.clip();
 SC.spk.forEach(p=>{const a=Math.sin(t/(280*p.sp)+p.ph);if(a<.75)return;g.fillStyle='rgba(255,255,255,'+((a-.75)*3.5).toFixed(2)+')';g.fillRect(Math.round(gx(p.x)),Math.round(gy(p.y)),2,2)});
 SC.spk.forEach(p=>{if(p.r){const x=((p.x-t*.02*p.sp*3)%1672+1672)%1672;g.fillStyle='rgba(225,246,255,'+(.15+.2*Math.sin(t/700+p.ph)).toFixed(2)+')';g.fillRect(Math.round(gx(x)),Math.round(gy(p.y)),Math.round(9*SCL),1)}});
 g.restore();
 g.save();g.beginPath();const fa=toS([1100,340,1235,430]);g.rect(fa[0],fa[1],fa[2]-fa[0],fa[3]-fa[1]);g.clip();
 for(let i=0;i<14;i++){const y=((t*.0005*(1+i%3*.3)+i*.37)%1)*110+330;g.fillStyle=i%3?'rgba(255,255,255,.5)':'rgba(60,140,210,.35)';g.fillRect(Math.round(gx(1105+i*9)),Math.round(gy(y)),2,Math.round(24*SCL))}g.restore();
 // แสงลอดใบไม้
 g.save();g.globalCompositeOperation='lighter';const ra=.05+.03*Math.sin(t/2600);g.fillStyle='rgba(255,246,170,'+ra.toFixed(3)+')';
 g.beginPath();g.moveTo(gx(1090),0);g.lineTo(gx(1210),0);g.lineTo(gx(840),gy(520));g.lineTo(gx(760),gy(520));g.fill();g.restore();
}
function drawCaveBG(g,t,lv){
 if(!IM.cave.complete||!IM.cave.naturalWidth){g.fillStyle='#1a1224';g.fillRect(0,0,960,600);return}
 g.imageSmoothingEnabled=true;try{g.imageSmoothingQuality='high'}catch(e){}
 g.drawImage(IM.cave,OX,0,IW*SCL,600);
 const L=LVN[lv];g.fillStyle=L.tint;g.fillRect(0,0,960,600);
 // คริสตัล/ตะเกียงเรืองแสง (กะพริบ)
 g.save();g.globalCompositeOperation='lighter';
 [[155,190,'255,190,90',.16],[1315,195,'255,190,90',.16]].forEach(([nx,ny,c,a],i)=>{const fl=.8+.2*Math.sin(t/190+i*2)+.05*Math.sin(t/57+i);g.fillStyle='rgba('+c+','+(a*fl).toFixed(3)+')';g.beginPath();g.arc(gx(nx),gy(ny),70*fl,0,7);g.fill()});
 const cr=[[410,270,'170,90,255'],[950,215,'170,90,255'],[1305,355,'80,160,255'],[75,470,'80,160,255'],[225,800,'170,90,255'],[1580,640,'170,90,255']];
 cr.forEach(([nx,ny,c],i)=>{const p=.6+.4*Math.sin(t/700+i*1.7);g.fillStyle='rgba('+c+','+(.13*p*(lv===5?1.9:1)).toFixed(3)+')';g.beginPath();g.arc(gx(nx),gy(ny),44*(lv===5?1.5:1),0,7);g.fill()});
 g.restore();
}
function drawHatch(g,t,lv,unl){
 const hx=gx(DD.cave.hatch[0]),hy=gy(DD.cave.hatch[1]),M=ms();
 if(lv>=5)return;const open=M.unl>lv;
 g.fillStyle='#07050c';g.beginPath();g.ellipse(hx,hy,26,10,0,0,7);g.fill();
 g.strokeStyle=open?'#8a5a2a':'#4a4a56';g.lineWidth=3;g.beginPath();g.ellipse(hx,hy,26,10,0,0,7);g.stroke();
 if(open){g.fillStyle='#b98240';for(let i=0;i<4;i++)g.fillRect(Math.round(hx-14+i*9),Math.round(hy-4),3,10);g.fillStyle='#d6a45c';g.fillRect(Math.round(hx-16),Math.round(hy-1),32,2);g.fillRect(Math.round(hx-16),Math.round(hy+4),32,2)}
 else{g.fillStyle='#5a5a66';g.fillRect(hx-18,hy-6,36,10);g.fillStyle='#8c8c98';g.fillRect(hx-14,hy-9,12,6);g.fillRect(hx+3,hy-8,12,6);g.fillStyle='#ff6a6a';g.font='bold 14px sans-serif';g.textAlign='center';g.fillText('🔒',hx,hy-14)}
 g.fillStyle=open?'rgba(120,255,160,'+(.55+.35*Math.sin(t/300)).toFixed(2)+')':'rgba(255,170,120,.9)';g.font='bold 11px sans-serif';g.textAlign='center';g.fillText(open?'▼ ลงไปชั้น '+(lv+1):'ปิดอยู่ ('+(M.kills[lv]||0)+'/'+LVN[lv].kill+')',hx,hy-24)}
function drawExitMark(g,t,lv){
 const a=toS(DD.cave.exit),pl=.5+.5*Math.sin(t/260);
 g.fillStyle='rgba(255,226,140,'+(.07+.1*pl).toFixed(2)+')';g.fillRect(a[0],a[1]-10,a[2]-a[0]+60,a[3]-a[1]+20);
 g.fillStyle='rgba(255,235,170,'+(.5+.4*pl).toFixed(2)+')';g.font='bold 11px sans-serif';g.textAlign='center';g.fillText(lv===1?'ออกสู่ป่าลึก ➡':'ขึ้นไปชั้น 1 ➡',a[0]+30,a[1]-16);
 for(let i=0;i<3;i++){g.fillStyle='rgba(255,233,173,'+(.25+.55*(.5+.5*Math.sin(t/160-i*.9))).toFixed(2)+')';g.font='bold 16px sans-serif';g.textAlign='left';g.fillText('▶',a[0]+i*14,a[3]+14)}}

/* ===================== วาด: สไปรต์ ===================== */
function drawOre(g,o,t){
 const def=ORES[o.t],im=IM.ores[o.t];if(!im||!im.complete||!im.naturalWidth)return;
 const w=def.w,h=w*im.naturalHeight/im.naturalWidth,sh=o.shk>0?Math.sin(t/22)*2.2:0;
 const pop=o.pop<1?Math.min(1,o.pop):1;
 g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(o.x,o.y+1,w*.42,5,0,0,7);g.fill();
 g.save();g.translate(Math.round(o.x+sh),Math.round(o.y+2));g.scale(pop,pop);
 g.imageSmoothingEnabled=false;g.drawImage(im,-w/2,-h+4,w,h);
 const k=1-o.hp/o.mhp;                                                      // รอยร้าวตามความเสียหาย
 if(k>.01){g.strokeStyle='rgba(20,12,16,'+Math.min(.85,k*1.2).toFixed(2)+')';g.lineWidth=1.5;g.beginPath();const n=1+Math.floor(k*4);
  for(let i=0;i<n;i++){const bx=-w*.3+i*w*.2,by=-h*.8+(i%2)*8;g.moveTo(bx,by);g.lineTo(bx+5,by+9);g.lineTo(bx-2,by+17)}g.stroke()}
 if(o.hit>0){g.globalAlpha=Math.min(.5,o.hit*2);g.fillStyle='#fff';g.fillRect(-w/2,-h+4,w,h);g.globalAlpha=1}
 if(o.t==='gold'||o.t==='diamond'){const a=Math.max(0,Math.sin(t/340+o.x));g.fillStyle='rgba(255,255,255,'+a.toFixed(2)+')';g.fillRect(-w*.25+Math.sin(t/900)*10,-h*.7,3,3)}
 g.restore();
 if(o.hp<o.mhp){const bw=34,f=o.hp/o.mhp;g.fillStyle='rgba(0,0,0,.65)';g.fillRect(Math.round(o.x-bw/2)-1,Math.round(o.y-h-6),bw+2,6);g.fillStyle=f>.5?'#7fe06a':f>.25?'#ffc84a':'#ff5a4a';g.fillRect(Math.round(o.x-bw/2),Math.round(o.y-h-5),Math.round(bw*f),4)}}
function drawMon(g,m,t){
 const d=MON[m.k],x=Math.round(m.x),y=Math.round(m.y),b=Math.sin(m.ph)*(m.k==='slime'?2.5:m.k==='bat'?3:1.2);
 g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x,y+(m.k==='bat'?10:2),d.r*.9,3,0,0,7);g.fill();
 const fl=m.fl>0;g.save();g.translate(x,y+(m.k==='bat'?-14+b:0));if(m.dir<0)g.scale(-1,1);
 const P=(c,a,bb,w,h)=>{g.fillStyle=fl?'#fff':c;g.fillRect(a,bb,w,h)};
 if(m.k==='slime'){const sq=1+Math.sin(m.ph)*.12;g.scale(1/sq,sq);
  P('#2d7a3a',-13,-14,26,14);P('#4fc45a',-11,-18,22,16);P('#7be88a',-8,-20,14,8);P('#b8ffc0',-6,-18,4,3);P('#2d7a3a',-14,-6,28,6);
  P('#14301a',-6,-12,3,4);P('#14301a',3,-12,3,4);P('#fff',-5,-12,1,1);P('#fff',4,-12,1,1);P('#14301a',-3,-6,6,2)}
 else if(m.k==='golem'){const w=m.wind>0?-4:0;g.translate(0,Math.sin(m.ph)*.8);
  P('#4a4a56',-15,-10,12,10);P('#4a4a56',3,-10,12,10);P('#6c6c7a',-17,-26,34,20);P('#8c8c98',-14,-30,28,10);P('#a8a8b6',-9,-34,12,6);
  P('#6c6c7a',-24,-26+w,8,16);P('#6c6c7a',16,-26+w,8,16);P('#8c8c98',-26,-12+w,10,8);P('#8c8c98',16,-12+w,10,8);
  P(m.wind>0?'#ff5a3a':'#ffb84a',-8,-24,5,4);P(m.wind>0?'#ff5a3a':'#ffb84a',3,-24,5,4);P('#2a2a32',-6,-16,12,3);
  if(m.wind>0){g.fillStyle='rgba(255,90,60,.35)';g.beginPath();g.arc(0,-8,46,0,7);g.fill()}}
 else{const w=Math.sin(m.ph*1.6)*8;
  P('#5a3a7a',-4,-6,8,10);P('#7a52a0',-3,-8,6,6);
  g.fillStyle=fl?'#fff':'#46286a';g.beginPath();g.moveTo(-3,-4);g.lineTo(-22,-8-w);g.lineTo(-14,2);g.lineTo(-9,-2);g.lineTo(-3,4);g.fill();
  g.beginPath();g.moveTo(3,-4);g.lineTo(22,-8-w);g.lineTo(14,2);g.lineTo(9,-2);g.lineTo(3,4);g.fill();
  P('#ff5a5a',-3,-6,2,2);P('#ff5a5a',1,-6,2,2);P('#fff',-2,-1,1,2);P('#fff',1,-1,1,2)}
 g.restore();
 if(m.hp<m.mhp){const bw=28,f=Math.max(0,m.hp/m.mhp),yy=y-d.r*(m.k==='golem'?2.4:m.k==='bat'?3.2:1.9);g.fillStyle='rgba(0,0,0,.65)';g.fillRect(x-bw/2-1,yy-1,bw+2,6);g.fillStyle='#ff5a5a';g.fillRect(x-bw/2,yy,Math.round(bw*f),4)}}
/* MINER MERCHANT — พิกเซลอาร์ต 16×21 (idle: หายใจ/กะพริบตา/ไฟหมวกเรือง) */
const MAP=['....kkkkkkkk....','...kyyyyyyyyk...','..kyyyyLLyyyyk..','..kyyyyLLyyyyk..','.kooooooooooook.','.kkkkkkkkkkkkkk.','..kssssssssssk..','..ksesssssseSk..','..ksssssSssssk..','..kggggggggggk..','..kgGggggggGgk..','...kgggggggggk..','....kkggggkk....','...ktttttttttk..','..kBBttttttBBk..','..kBBBBBBBBBBk..','..kBbBBBBBBbBk..','..kBBBkkkkBBBk..','..kBBBk..kBBBk..','..knnnk..knnnk..','...kkk....kkk...'];
const PAL={k:'#2a1a12',y:'#f2b632',o:'#c98a1c',L:'#fff6b0',s:'#e2a878',S:'#c58a5c',e:'#2a1a12',g:'#b9b9c2',G:'#8e8e99',t:'#b5683a',B:'#3f6fb5',b:'#2d4f86',n:'#3a2a20'};
function drawMapTo(g,x0,y0,k,rows,blink){rows.forEach((row,j)=>{for(let i=0;i<row.length;i++){let c=row[i];if(c==='.')continue;if(blink&&c==='e')c='s';g.fillStyle=PAL[c]||'#f0f';g.fillRect(x0+i*k,y0+j*k,k,k)}})}
function drawPick(g,x,y,sz,col,hd,ang){
 g.save();g.translate(x,y);g.rotate(ang);g.fillStyle=col;g.fillRect(-1.5,-sz*.1,3,sz*.55);g.fillStyle=hd;g.fillRect(-sz*.36,-sz*.18,sz*.72,sz*.1);g.fillRect(-sz*.4,-sz*.12,sz*.08,sz*.1);g.fillRect(sz*.32,-sz*.12,sz*.08,sz*.1);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(-sz*.3,-sz*.17,sz*.4,2);g.restore()}
function drawNPC(g,t){
 const n=npcPos(),b=Math.round(Math.sin(t/520)*1),blink=(t%3200)<130;
 g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(n.x,n.y+1,13,4,0,0,7);g.fill();
 const k=2;drawMapTo(g,Math.round(n.x-16),Math.round(n.y-42+b),k,MAP,blink);
 g.save();g.globalCompositeOperation='lighter';const fl=.75+.25*Math.sin(t/230);g.fillStyle='rgba(255,236,150,'+(.2*fl).toFixed(3)+')';g.beginPath();g.arc(n.x,n.y-34+b,34*fl,0,7);g.fill();g.restore();
 drawPick(g,n.x+17,n.y-14,24,'#7a4a22','#aab4c0',.35);
 const near=Math.hypot(X().st.x-n.x,X().st.y-n.y)<82;
 g.font='bold 10px sans-serif';g.textAlign='center';g.fillStyle='rgba(0,0,0,.6)';g.fillRect(n.x-42,n.y-62+b,84,14);g.fillStyle=near?'#ffe9a0':'#fff';g.fillText('MINER MERCHANT',n.x,n.y-52+b)}
function portraitURL(){if(IC.por)return IC.por;const c=document.createElement('canvas');c.width=c.height=96;const g=c.getContext('2d');g.fillStyle='#3a2a44';g.fillRect(0,0,96,96);g.fillStyle='#4a3858';g.fillRect(0,60,96,36);
 drawMapTo(g,-8,-4,6,MAP.slice(0,13),false);return IC.por=c.toDataURL()}

/* ===================== วาดผู้เล่นเสริม: Pickaxe swing + กะพริบตอนอมตะ ===================== */
function drawPlayer(g,t){
 const x=X(),s=x.st;if(s.hidden)return;
 const blink=SC.inv>0&&Math.floor(t/70)%2===0;const sw=SC.sw;
 let oy=0;if(sw){const k=Math.min(1,sw.t/.3);oy=Math.sin(k*Math.PI)*-2}
 g.save();if(blink)g.globalAlpha=.4;g.translate(0,oy);x.drawCEO(g);g.restore();
 // pickaxe
 const pk=sw?sw.pk:(SC.mine?SC.mine.pk:null);
 if(sw){const k=Math.min(1,sw.t/.3),dv=DIRV[s.dir]||[0,1],ang=(-1.1+k*2.3),f=pk?pk:{col:'#7a4a22',hd:'#777'};
  const hx=s.x+(dv[0]*14)+(dv[0]===0?6:0),hy=s.y-22+(dv[1]*8);
  g.save();g.translate(hx,hy);if(dv[0]<0)g.scale(-1,1);drawPick(g,0,0,pk?30:20,f.col,f.hd,dv[1]!==0?(dv[1]<0?Math.PI*.1+ang*.4:ang):ang);g.restore();
  if(k>.35&&k<.75){g.strokeStyle='rgba(255,255,255,'+(.7-Math.abs(k-.55)*3).toFixed(2)+')';g.lineWidth=2;g.beginPath();g.arc(s.x+dv[0]*22,s.y-20+dv[1]*14,15,-1,1.4);g.stroke()}}
}

/* ===================== HUD ===================== */
function hud(g){
 const x=X(),s=x.st,pl=placeOf(),W=x.W,H=x.H,M=ms(),pm=prompt();
 // HP ซ้ายบน
 const px=10,py=34,w=190,f=M.hp/M.mhp,low=f<=.3,pul=low?.5+.5*Math.sin(Date.now()/160):0;
 g.fillStyle='rgba(8,10,22,.78)';g.fillRect(px,py,w+58,36);g.fillStyle=low?'rgba(255,70,70,'+(.5+.5*pul)+')':'#7a8cff';g.fillRect(px,py,w+58,2);
 g.font='16px sans-serif';g.textAlign='left';g.fillStyle=low?'#ff6a6a':'#ff7a9a';g.fillText(low&&pul>.5?'💔':'❤',px+6,py+24);
 g.fillStyle='#2a1a22';g.fillRect(px+30,py+9,w-12,12);g.fillStyle=low?'#ff3a3a':f>.6?'#5ae06a':'#ffc84a';g.fillRect(px+31,py+10,Math.round((w-14)*f),10);g.fillStyle='rgba(255,255,255,.3)';g.fillRect(px+31,py+10,Math.round((w-14)*f),3);
 g.font='bold 11px sans-serif';g.fillStyle='#fff';g.fillText('HP: '+Math.ceil(M.hp)+' / '+M.mhp,px+36,py+31);
 const pk=bestPick();g.font='10px sans-serif';g.fillStyle='#cbd3ff';g.fillText('⛏ '+(pk?pk.th:'ยังไม่มี Pickaxe'),px+w+6,py+31);
 if(pl==='cave'){const lv=R.cave.lv,L=LVN[lv];g.fillStyle='rgba(8,10,22,.78)';g.fillRect(W-250,34,240,36);g.fillStyle='#b48aff';g.fillRect(W-250,34,240,2);g.textAlign='right';g.font='bold 12px sans-serif';g.fillStyle='#e6d6ff';g.fillText('LV'+lv+' '+L.n,W-16,52);
  g.font='10px sans-serif';g.fillStyle='#b9b2d6';g.fillText(L.kill?(M.unl>lv?'🔓 ปลดล็อกชั้นถัดไปแล้ว':'👾 '+(M.kills[lv]||0)+'/'+L.kill+' ปลดล็อกทางลง'):'ชั้นลึกที่สุด',W-16,65)}
 if(SC.flash>0){g.fillStyle='rgba(255,40,40,'+(Math.min(.4,SC.flash)).toFixed(2)+')';g.fillRect(0,0,W,H)}
 if(low){const gg=g.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.85);gg.addColorStop(0,'rgba(255,0,0,0)');gg.addColorStop(1,'rgba(255,0,0,'+(.18+.22*pul).toFixed(2)+')');g.fillStyle=gg;g.fillRect(0,0,W,H)}
 if(SC.mine){const o=SC.mine.o,f=1-o.hp/o.mhp,bx=W/2-80,by=H-176;g.fillStyle='rgba(8,10,22,.85)';g.fillRect(bx,by,160,26);g.fillStyle='#ffd24a';g.font='bold 11px sans-serif';g.textAlign='center';g.fillText('⛏ กำลังขุด '+ORES[o.t].n+' · Esc ยกเลิก',W/2,by+12);g.fillStyle='#2a2230';g.fillRect(bx+6,by+16,148,6);g.fillStyle='#ffd24a';g.fillRect(bx+6,by+16,Math.round(148*f),6)}
 if(pm){g.fillStyle='rgba(30,22,10,.9)';g.fillRect(W/2-260,H-146,520,30);g.fillStyle='#ffc84a';g.fillRect(W/2-260,H-146,520,2);g.fillStyle='#fff6df';g.font='bold 15px sans-serif';g.textAlign='center';g.fillText(pm,W/2,H-125)}
}
function prompt(){
 const x=X(),s=x.st,pl=placeOf();if(!x||s.sleep||s.trans||s.mode!=='scene'||s.talk||SC.defeat)return'';
 if(pl==='dpfr'){
  const n=npcPos();if(Math.hypot(s.x-n.x,s.y-n.y)<82)return'💬 กด E เพื่อคุยกับ MINER MERCHANT (ซื้อ Pickaxe)';
  if(inR(DD.dpfr.cave,s.x,s.y)||s.y<=gy(335)&&s.x>=gx(1390)&&s.x<=gx(1500))return'⛏ เดินต่อไปทางเหนือเพื่อเข้า MINING CAVE';
  if(inR(DD.dpfr.safe,s.x,s.y))return'';
  if(s.y>=gy(880))return'⬇ เดินต่อไปทางใต้เพื่อกลับป่าแม่น้ำ';return''}
 if(pl==='cave'){
  const hx=gx(DD.cave.hatch[0]),hy=gy(DD.cave.hatch[1]);
  if(SC.mine)return'';
  if(Math.hypot(s.x-hx,s.y-hy)<60&&R.cave.lv<5)return ms().unl>R.cave.lv?'▼ กด E เพื่อลงไปชั้น '+(R.cave.lv+1):'🔒 ทางลงปิดอยู่ · กำจัด Monster '+(ms().kills[R.cave.lv]||0)+'/'+LVN[R.cave.lv].kill;
  const o=facingTarget();
  if(o){const d=ORES[o.t],pk=bestPick();return pk?(pk.tier>=d.need?'⛏ กด E เพื่อขุด '+d.n:'⛏ '+d.n+'ต้องใช้พลั่วที่ดีกว่านี้'):'⛏ ต้องมี Pickaxe (ซื้อที่ MINER MERCHANT)'}
  if(s.x>=gx(1450)&&s.y<=gy(520))return R.cave.lv===1?'➡ เดินต่อไปทางขวาเพื่อออกจากถ้ำ':'➡ เดินต่อไปทางขวาเพื่อขึ้นไปชั้น 1 (ไม่เซฟ · ทางลงจะล็อกใหม่)';
  return'⚔ กดปุ่มดาบ (F) เพื่อโจมตี Monster · ขุดแร่กด E'}
 return''}

/* ===================== ร้าน MINER MERCHANT (DOM) ===================== */
function dpCss(){if(document.getElementById('dpCss'))return;const c=document.createElement('style');c.id='dpCss';
 c.textContent='#dpShop,#dpDef{position:fixed;inset:0;z-index:99991;background:rgba(6,8,18,.74);display:flex;align-items:center;justify-content:center;font-family:inherit}#dpShop[hidden],#dpDef[hidden]{display:none}'+
 '.dpP{width:min(660px,96vw);max-height:92vh;overflow:auto;background:#1d1a2c;border:2px solid #f2b632;border-radius:12px;padding:12px;color:#f3efe2;box-shadow:0 10px 40px #000a}.dpH{display:flex;gap:12px;align-items:center;margin-bottom:8px}.dpH img{width:78px;height:78px;border:2px solid #f2b632;border-radius:8px;image-rendering:pixelated;background:#3a2a44}.dpH h3{margin:0;font-size:17px;color:#ffd978}.dpH p{margin:4px 0 0;font-size:13px;color:#cfc8e6}'+
 '.dpW{display:flex;justify-content:space-between;align-items:center;margin:6px 0;font-size:14px}.dpW b{color:#7fe08a}.dpL{display:grid;gap:7px}.dpI{display:grid;grid-template-columns:54px 1fr auto;gap:10px;align-items:center;background:#2a2640;border:1px solid #4a4470;border-radius:8px;padding:7px}.dpI.own{opacity:.75}.dpI.eq{border-color:#7fe08a}.dpI img{width:48px;height:48px;image-rendering:pixelated;background:#14121f;border-radius:6px}.dpI b{font-size:14px}.dpI small{display:block;color:#b8b2d4;font-size:11.5px}.dpI button,.dpX{background:#f2b632;color:#2a1a12;border:0;border-radius:6px;padding:8px 12px;font-weight:700;cursor:pointer;font-size:13px}.dpI button:disabled{background:#5a5470;color:#aaa;cursor:not-allowed}.dpX{background:#3a3456;color:#fff}'+
 '.dpDP{background:#2a1420;border:2px solid #ff5a5a;border-radius:12px;padding:22px 28px;text-align:center;color:#fff}.dpDP h2{margin:0 0 8px;color:#ff7a7a}.dpDP button{background:#f2b632;border:0;border-radius:8px;padding:10px 18px;font-weight:700;cursor:pointer;margin-top:10px;font-size:14px}';
 document.head.appendChild(c)}
let shopOpen=0,shopFroze=false,shopMsg='',shopAt=0;
function shopRender(){
 const m=document.getElementById('dpShop');if(!m)return;const pk=bestPick(),S=getS();
 let h='<div class="dpP"><div class="dpH"><img src="'+portraitURL()+'"><div><h3>MINER MERCHANT</h3><p>'+(shopMsg||'ยินดีต้อนรับ! พลั่วดี ๆ ขุดแร่ได้เร็ว ถ้ำข้างหลังข้านี่มีของดีเพียบ แต่ระวังสัตว์ประหลาดด้วยนะ')+'</p></div></div>'+
 '<div class="dpW"><span>💵 เงินของคุณ <b>'+Math.floor(S.money).toLocaleString()+'</b></span><span>🎒 '+bagArr().filter(x=>x).length+'/24 ช่อง</span><button class="dpX" onclick="DEEP_SCENE.shop.close()">ปิด ✕</button></div><div class="dpL">';
 PICKS.forEach(p=>{const own=have(p.id)>0,eq=pk&&pk.id===p.id,can=S.money>=p.price;
  h+='<div class="dpI'+(own?' own':'')+(eq?' eq':'')+'"><img src="'+ITEM_DB[p.id].icon()+'"><div><b>'+p.n+' <span style="color:#9aa">('+p.th+')</span></b><small>'+p.d+' · พลังขุด '+p.power+'</small><small style="color:#ffd978">💰 '+p.price.toLocaleString()+'</small></div>'+
  (own?'<span style="color:#7fe08a;font-size:13px">'+(eq?'✔ ใช้อยู่':'มีแล้ว')+'</span>':'<button '+(can?'':'disabled')+' onclick="DEEP_SCENE.shop.buy(\''+p.id+'\')">'+(can?'ซื้อ':'เงินไม่พอ')+'</button>')+'</div>'});
 m.innerHTML=h+'</div></div>'}
function shopBuy(id){
 const p=PICKS.find(x=>x.id===id),S=getS();if(!p||!S)return false;
 if(have(id)>0){shopMsg='ท่านมีอันนี้แล้วนี่นา!';shopRender();return false}
 if(S.money<p.price){shopMsg='เงินไม่พอนะ! ไปหาเงินมาเพิ่มก่อน';toast('💵 เงินไม่เพียงพอ (ต้องการ '+p.price.toLocaleString()+')');sfx('deny');shopRender();return false}
 if(!bagRoom(id)){shopMsg='กระเป๋าท่านเต็มแล้ว เก็บของก่อนนะ';toast('🎒 กระเป๋าเต็ม');sfx('deny');shopRender();return false}
 try{spend(p.price)}catch(e){S.money-=p.price}
 SH().bagAdd(id);shopMsg='ขอบใจที่อุดหนุน! '+p.th+'ใช้งานได้ทันที';sfx('buy');toast('⛏ ซื้อ '+p.n+' แล้ว (−'+p.price.toLocaleString()+')');
 try{log('ซื้อ '+p.n+' −'+p.price)}catch(e){}try{OS.upd()}catch(e){}persist();shopRender();
 try{const b=document.getElementById('ceoBag');if(b&&!b.hidden&&CEOScene.renderBag)CEOScene.renderBag()}catch(e){}return true}
function shopOpenF(){
 const x=X(),s=x.st;dpCss();let m=document.getElementById('dpShop');if(!m){m=document.createElement('div');m.id='dpShop';m.hidden=true;document.body.appendChild(m)}
 s.keys={};s.moving=0;shopFroze=true;s.talk={boss:1,acts:[]};shopMsg='';m.hidden=false;shopOpen=1;shopAt=performance.now();shopRender()}
function shopClose(){const m=document.getElementById('dpShop');if(m)m.hidden=true;shopOpen=0;if(shopFroze){try{X().st.talk=null}catch(e){}}shopFroze=false;persist()}
addEventListener('keydown',e=>{
 if(shopOpen&&performance.now()-shopAt<300&&(e.key||'').toLowerCase()==='e')return;
 if(shopOpen&&(e.key==='Escape'||(e.key||'').toLowerCase()==='e')){e.stopPropagation();e.preventDefault();shopClose();return}
 if(e.key==='Escape'&&SC.mine&&(placeOf()==='cave')){e.stopPropagation();cancelMine('⛏ ยกเลิกการขุดแล้ว')}},true);

/* ===================== ปุ่มดาบ (ฟันมอนสเตอร์) — แยกจากปุ่มโต้ตอบ E ===================== */
const SW={held:false,url:''};
function swordIcon(){if(SW.url)return SW.url;
 const M=['.............bb.','............bwb.','...........bwwb.','..........bwwb..','.........bwwb...','..b.....bwwb....','..bb...bwwb.....','...bb.bwwb......','....bbwwb.......','....bkwb........','.....kkb........','....gkkg........','...gk..gk.......','..gk....g.......','.gg.............','................'];
 const P={b:'#3b4358',w:'#e9f1ff',k:'#9b6a2f',g:'#f2b632'},c=document.createElement('canvas');c.width=c.height=16;const g=c.getContext('2d');
 M.forEach((r,y)=>{for(let x=0;x<16;x++){const ch=r[x];if(ch!=='.'&&P[ch]){g.fillStyle=P[ch];g.fillRect(x,y,1,1)}}});
 const d=document.createElement('canvas');d.width=d.height=64;const h=d.getContext('2d');h.imageSmoothingEnabled=false;h.drawImage(c,0,0,64,64);SW.url=d.toDataURL();return SW.url}
function swordCss(){if(document.getElementById('dpSwCss'))return;const c=document.createElement('style');c.id='dpSwCss';
 c.textContent='#dpSword{position:fixed;z-index:9000;width:52px;height:52px;border-radius:50%;border:2px solid #ffd45a;background:radial-gradient(circle at 35% 30%,#5a3a3a,#2a1218);box-shadow:0 3px 8px #000a;padding:0;display:flex;flex-direction:column;align-items:center;justify-content:center;touch-action:none;cursor:pointer;user-select:none;-webkit-user-select:none;font:inherit;color:#fff}'+
 '#dpSword[hidden]{display:none}#dpSword img{width:28px;height:28px;image-rendering:pixelated;pointer-events:none}#dpSword i{font-style:normal;font-size:9px;font-weight:700;line-height:1;margin-top:1px;pointer-events:none;color:#ffd978}#dpSword.on{transform:scale(.92);background:radial-gradient(circle at 35% 30%,#a04a4a,#4a1822)}';
 document.head.appendChild(c)}
function swordOK(){const x=X();if(!x)return false;const s=x.st;if(!s||!s.active||s.mode!=='scene')return false;const pl=s.place;
 if(pl!=='dpfr'&&pl!=='cave')return false;if(s.trans||s.talk||s.sleep||s.fish||SC.defeat||shopOpen)return false;
 try{const bg=document.getElementById('ceoBag');if(bg&&!bg.hidden)return false}catch(e){}return true}
function doSword(){if(!swordOK())return false;if(SC.mine)cancelMine(null);if(!SC.sw)swing();return true}
function swordUI(){if(document.getElementById('dpSword'))return;swordCss();
 const b=document.createElement('button');b.id='dpSword';b.type='button';b.hidden=true;b.title='ฟันดาบ (F)';b.innerHTML='<img src="'+swordIcon()+'"><i>ฟัน</i>';
 const down=e=>{e.preventDefault();e.stopPropagation();SW.held=true;b.classList.add('on');doSword()},up=()=>{SW.held=false;b.classList.remove('on')};
 b.addEventListener('pointerdown',down);['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,up));
 b.addEventListener('contextmenu',e=>e.preventDefault());document.body.appendChild(b)}
function swordPlace(){const b=document.getElementById('dpSword');if(!b)return;const show=swordOK();
 if(b.hidden===show)b.hidden=!show;if(!show){SW.held=false;b.classList.remove('on');return}
 const a=document.getElementById('actMain'),r=a&&a.getBoundingClientRect();
 if(!r||r.width<=0){b.style.left='auto';b.style.top='auto';b.style.right='16px';b.style.bottom='140px';return}
 const sz=Math.max(40,Math.min(54,Math.round(r.width*.6)));b.style.width=b.style.height=sz+'px';
 const avoid=['actMain','bagBtn','pcBtn','joy'].map(i=>document.getElementById(i)).filter(e=>e&&e.offsetParent!==null||e&&getComputedStyle(e).position==='fixed').map(e=>e.getBoundingClientRect()).filter(q=>q.width>0);
 const hit=(L,T)=>avoid.some(q=>!(L+sz<=q.left-4||L>=q.right+4||T+sz<=q.top-4||T>=q.bottom+4));
 const gap=8,cand=[[r.left+(r.width-sz)/2,r.top-sz-gap],[r.right-sz,r.top-sz-gap],[r.left-sz-gap,r.top-sz-gap],[r.left-sz-gap,r.top+(r.height-sz)/2],[r.left+(r.width-sz)/2,r.top-2*sz-2*gap]];
 let pick=cand.find(c=>c[1]>=50&&c[0]>=2&&c[0]+sz<=innerWidth-2&&c[1]+sz<=innerHeight-2&&!hit(c[0],c[1]))||cand[0];
 b.style.left=Math.max(2,Math.min(innerWidth-sz-2,Math.round(pick[0])))+'px';b.style.top=Math.max(2,Math.round(pick[1]))+'px';b.style.right='auto';b.style.bottom='auto'}
setInterval(()=>{try{swordUI();swordPlace()}catch(e){}},120);
addEventListener('keydown',e=>{
 if((e.key||'').toLowerCase()!=='f'||e.ctrlKey||e.metaKey||e.altKey)return;
 const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;
 if(doSword())e.preventDefault()},true);
addEventListener('blur',()=>{SW.held=false});

/* ===================== ขอบฉาก / Transition / init ===================== */
function edges(dx,dy){
 const x=X(),s=x.st,pl=placeOf();if(s.trans||s.talk||s.fish||SC.defeat)return;
 if(pl==='dpfr'){
  if(dy<0&&s.y<=gy(335)&&s.x>=gx(1390)&&s.x<=gx(1500))enterCave();
  else if(dy>0&&s.y>=gy(925)&&s.x>=gx(430)&&s.x<=gx(720))leaveToForest()}
 else if(pl==='cave'){if(dx>0&&s.x>=gx(1500)&&s.y<=gy(480))goUp()}
}
function enterCave(){const x=X(),s=x.st;if(!x.transLock())return;ambStop();s.trans={type:'dpEnter',t:0};toast('⛏ เข้าสู่ MINING CAVE')}
function leaveToForest(){const x=X(),s=x.st;if(!x.transLock())return;s.trans={type:'dpLeaveF',t:0};toast('⬇ กลับป่าแม่น้ำ')}
function trans(tr,dt){
 const x=X(),s=x.st;
 if(tr.type==='dpEnter'){s.y-=96*dt;s.dir=2;s.moving=1;s.frame=(s.frame+96*dt/15)%4;x.setFade(Math.min(1,Math.max(0,(tr.t-.1)/.6)));
  if(tr.t>=.8){s.moving=0;s.trans=null;R.cave.lv=1;if(R.cave.wipe){R.cave.wipe=0;Object.keys(R.cave.L).forEach(k=>{if(+k>1)delete R.cave.L[k]})}x.enter('cave',{from:'dpfr'})}return true}
 if(tr.type==='dpToForest'||tr.type==='dpExitCave'){s.x+=110*dt;s.dir=3;s.moving=1;s.frame=(s.frame+110*dt/15)%4;x.setFade(Math.min(1,Math.max(0,(tr.t-.1)/.6)));
  if(tr.t>=.8){s.moving=0;s.trans=null;x.enter('dpfr',{from:'cave'})}return true}
 if(tr.type==='dpLeaveF'){s.y+=100*dt;s.dir=0;s.moving=1;s.frame=(s.frame+100*dt/15)%4;x.setFade(Math.min(1,Math.max(0,(tr.t-.1)/.6)));
  if(tr.t>=.8){s.moving=0;s.trans=null;x.enter('frst',{from:'dpfr'})}return true}
 if(tr.type==='dpLv'){x.setFade(tr.t<.5?Math.min(1,tr.t/.45):Math.max(0,1-(tr.t-.5)/.45));
  if(!tr.sw&&tr.t>=.5){tr.sw=1;const up=tr.to<R.cave.lv;R.cave.lv=tr.to;if(tr.reset)resetRun();const L=LVN[tr.to];
   if(up){s.x=gx(DD.cave.hatch[0]);s.y=gy(DD.cave.hatch[1])+44}else{s.x=gx(1360);s.y=gy(430)}s.dir=0;SC.mine=null;SC.sw=null;
   toast(tr.reset?'⬆ ขึ้นมาที่ LV1 · ทางลงถูกล็อกอีกครั้ง ต้องกำจัด Monster ใหม่':'⛏ LV'+tr.to+' · '+L.n+' ('+L.th+')');levelRT(tr.to);ambStart('cave')}
  if(tr.t>=1){s.trans=null;x.setFade(0)}return true}
 return false}
function init(place,from){
 const x=X(),s=x.st;s.hidden=false;loadImgs();seedFX();SC.ct=0;SC.sw=null;SC.mine=null;SC.inv=0;SC.defeat=0;
 if(!SC.hintSw){SC.hintSw=1;setTimeout(()=>toast('⚔ ปุ่มดาบ (F) = ฟันมอนสเตอร์ · ปุ่ม E = ขุดแร่/คุย'),1400)}
 if(place==='dpfr'){
  R.dpfr.t=0;
  if(from==='frst'){s.x=gx(545);s.y=gy(960);s.dir=2;s.trans={type:'arrive',t:0,toX:gx(545),toY:gy(880)};x.setFade(1)}
  else if(from==='cave'){const n=DD.dpfr.cave;s.x=gx(1450);s.y=gy(345);s.dir=0;s.trans={type:'arrive',t:0,toX:gx(1450),toY:gy(410)};x.setFade(1)}
  else{s.x=gx(1000);s.y=gy(550);s.dir=0}
  ambStart('forest');fillForestMons()}
 else{
  const lv=R.cave.lv=(from==='warp')?1:(R.cave.lv||1);levelRT(lv);
  if(from==='dpfr'){s.x=gx(1560);s.y=gy(410);s.dir=1;s.trans={type:'arrive',t:0,toX:gx(1400),toY:gy(430)};x.setFade(1)}
  else{s.x=gx(1360);s.y=gy(430);s.dir=1}
  ambStart('cave')}
}
function fillForestMons(){
 const a=R.dpfr.mons;if(a.length)return;a.length=0;const n=3;for(let i=0;i<n;i++)spawnMon(a,'dpfr',i===2?'bat':'slime',1)}
function seedFX(){if(SC.spk)return;let r=rng(777);SC.spk=[];for(let i=0;i<110;i++)SC.spk.push({x:1000+r()*672,y:350+r()*590,ph:r()*6.28,sp:1.5+r()*2.5,r:r()<.4});mkFly()}
function interact(){
 const x=X(),s=x.st,pl=placeOf();if(s.trans||s.talk||s.sleep||s.fish||SC.defeat)return;
 if(pl==='dpfr'){const n=npcPos();if(Math.hypot(s.x-n.x,s.y-n.y)<82){shopOpenF();return}
  return}
 interactCave()}
function back(){
 const x=X(),s=x.st;if(s.trans||s.talk||s.sleep)return;cancelMine(null);
 if(placeOf()==='cave'){if(R.cave.lv>1)ms().unl=1,ms().kills={},R.cave.wipe=1,persist();s.trans={type:'dpToForest',t:0};return}
 leaveToForest()}
function reset(){}

/* ===================== draw / tick ===================== */
function spawnPending(arr,pl,lv){}
function guide(g,t,sx,sy,txt,dir){
 const b=Math.round(Math.sin(t/230)*5),ax=sx,ay=sy+(dir===2?-b:b),k=dir===2?-1:1;
 g.save();g.translate(Math.round(ax),Math.round(ay));
 g.fillStyle='rgba(0,0,0,.55)';g.beginPath();g.moveTo(-13,-k*8-1);g.lineTo(13,-k*8-1);g.lineTo(0,k*14+1);g.closePath();g.fill();
 g.fillStyle='#ffe066';g.beginPath();g.moveTo(-11,-k*7);g.lineTo(11,-k*7);g.lineTo(0,k*12);g.closePath();g.fill();
 g.restore();
 g.save();g.font='bold 12px sans-serif';g.textAlign='center';const w=g.measureText(txt).width+14,ty=ay+(dir===2?-30:34);
 g.fillStyle='rgba(10,24,12,.82)';g.fillRect(Math.round(ax-w/2),Math.round(ty-13),Math.round(w),18);g.fillStyle='#ffe066';g.fillRect(Math.round(ax-w/2),Math.round(ty-13),Math.round(w),2);
 g.fillStyle='#fff';g.fillText(txt,Math.round(ax),Math.round(ty));g.restore()}
function drawFX(g,t,dt){drawP(g,dt)}
function draw(g,t){
 loadImgs();seedFX();
 const x=X(),s=x.st,pl=placeOf(),dt=Math.min(.05,Math.max(0,(t-(SC.ct||t))/1000));SC.ct=t;
 const act=!s.trans||s.trans.type==='arrive';
 if(SW.held&&!SC.sw)doSword();
 SC.inv=Math.max(0,SC.inv-dt);SC.flash=Math.max(0,SC.flash-dt);SC.shake=Math.max(0,SC.shake-dt*10);
 const shk=SC.shake>0?[(Math.random()-.5)*SC.shake*1.5,(Math.random()-.5)*SC.shake*1.5]:[0,0];
 g.save();g.translate(shk[0],shk[1]);
 if(pl==='dpfr'){
  drawForestBG(g,t);
  if(!shopOpen&&!SC.defeat){swingTick(dt);monTick(dt,'dpfr',R.dpfr.mons);const M=ms();
   if(inR(DD.dpfr.safe,s.x,s.y)&&M.hp<M.mhp){SC.regenT+=dt;if(SC.regenT>=1){SC.regenT=0;M.hp=Math.min(M.mhp,M.hp+3)}}}
  const pend=R.dpfr.pend||[];for(let i=pend.length-1;i>=0;i--)if(now()>=pend[i].at&&R.dpfr.mons.length<4){spawnMon(R.dpfr.mons,'dpfr',Math.random()<.35?'bat':'slime',1);pend.splice(i,1)}
  const objs=[];R.dpfr.mons.forEach(m=>objs.push([m.y,()=>drawMon(g,m,t)]));objs.push([npcPos().y,()=>drawNPC(g,t)]);objs.push([s.y,()=>drawPlayer(g,t)]);
  objs.sort((a,b)=>a[0]-b[0]).forEach(o=>o[1]());
  drawFlies(g,t,Math.max(.25,nightK()));
  const nk=nightK();if(nk>.01){g.fillStyle='rgba(12,22,64,'+(.46*nk).toFixed(3)+')';g.fillRect(0,0,960,600)}
  // ป้ายเขตปลอดภัย
  if(inR(DD.dpfr.safe,s.x,s.y)){g.fillStyle='rgba(120,255,160,.9)';g.font='bold 10px sans-serif';g.textAlign='center';g.fillText('🛡 เขตปลอดภัย',gx(1430),gy(300))}
  if(!s.trans){guide(g,t,gx(575),gy(890),'กลับป่าแม่น้ำ',0);guide(g,t,gx(1450),gy(392),'ถ้ำเหมือง ⛏',2)}
  if(ambTick)ambTick('dpfr')}
 else{
  const lv=R.cave.lv,L=levelRT(lv);
  drawCaveBG(g,t,lv);drawHatch(g,t,lv);drawExitMark(g,t,lv);
  if(!SC.defeat&&act){mineTick(dt);swingTick(dt);monTick(dt,'cave',L.mons)}
  // respawn แร่/มอนสเตอร์
  for(let i=L.pend.length-1;i>=0;i--){const p=L.pend[i];if(now()<p.at)continue;
   if(p.m){if(L.mons.length<12){spawnMon(L.mons,'cave',p.m,lv);L.pend.splice(i,1)}}
   else if(spawnOre(L,lv,false))L.pend.splice(i,1)}
  L.ores.forEach(o=>{o.hit=Math.max(0,o.hit-dt);o.shk=Math.max(0,o.shk-dt);o.pop=Math.min(1,o.pop+dt*4)});
  const objs=[];L.ores.forEach(o=>objs.push([o.y,()=>drawOre(g,o,t)]));L.mons.forEach(m=>objs.push([m.y,()=>drawMon(g,m,t)]));objs.push([s.y,()=>drawPlayer(g,t)]);
  objs.sort((a,b)=>a[0]-b[0]).forEach(o=>o[1]());
  // แสงรอบตะเกียงผู้เล่น (ถ้ำมืด) — ชั้นลึกมืดกว่า
  const dk=LVN[lv].dark,fl=.96+.04*Math.sin(t/140);
  const gr=g.createRadialGradient(s.x,s.y-20,60*fl,s.x,s.y-20,330*fl);gr.addColorStop(0,'rgba(4,2,12,0)');gr.addColorStop(1,'rgba(4,2,12,'+dk.toFixed(2)+')');g.fillStyle=gr;g.fillRect(0,0,960,600);
  if(lv===5){g.save();g.globalCompositeOperation='lighter';for(let i=0;i<10;i++){const a=Math.sin(t/600+i*2.1);if(a<.4)continue;g.fillStyle='rgba(200,150,255,'+((a-.4)*.9).toFixed(2)+')';g.fillRect(Math.round(80+i*85+Math.sin(t/2000+i)*20),Math.round(90+((i*53+t*.01)%420)),2,2)}g.restore()}
  ambTick('cave')}
 drawFX(g,t,dt);
 g.restore();
 // เก็บเสียงเมื่อออกฉาก (watchdog อยู่ด้านล่างด้วย)
 if(!s.active)ambStop();
 if(ms().hp<=ms().mhp*.3&&!SC.defeat&&(SC.lowT=(SC.lowT||0)+dt)>1.6){SC.lowT=0;sfx('low')}
}
setInterval(()=>{try{const x=X();if(!x)return;const s=x.st;if(AU.on&&(!s.active||(s.place!=='dpfr'&&s.place!=='cave')))ambStop()}catch(e){}},300);

root.DEEP_SCENE={canStand,draw,hud,edges,trans,interact,back,init,prompt,reset,ITEMS:ITEM_DB,PICKS,ORES,LVN,MON,
 shop:{open:shopOpenF,close:shopClose,buy:shopBuy},
 state:()=>({mine:ms(),lv:R.cave.lv,sw:!!SC.sw,mining:!!SC.mine,defeat:SC.defeat,inv:SC.inv,ores:(R.cave.L[R.cave.lv]||{ores:[]}).ores.length,mons:(placeOf()==='cave'?(levelRT(R.cave.lv).mons):R.dpfr.mons).length}),
 rt:{R,SC,resetRun,levelRT,spawnMon,hurtPlayer,killMon,bestPick,facingTarget,startMine,have,goDown,changeLevel,ORES_ARR:()=>levelRT(R.cave.lv).ores,mons:()=>placeOf()==='cave'?levelRT(R.cave.lv).mons:R.dpfr.mons},
 geom:{OX,SCL,gx,gy,toS},grid:GR};
})(typeof window!=='undefined'?window:globalThis);

