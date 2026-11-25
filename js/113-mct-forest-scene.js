
/* ============================================================================
 * FOREST RIVER (ป่าแม่น้ำ) — ฉากใหม่ทางขวาของ NICECLUB
 * ต่อกับเกมเดิมผ่าน window.__CEO_CTX + CARDSHOP_SCENE (ตัวกลางเดียวกับ NICECLUB / STATION)
 *  - ใช้ Player Controller / กล้อง / Transition / กระเป๋า / เงิน / ระบบตกปลา "เดิม" ทั้งหมด
 *  - ระบบตกปลา: CEOScene.fishApi.start() = startFish() ตัวเดิม (รอปลา · ปลากินเบ็ด · มินิเกม · XP · ใส่กระเป๋า)
 *  - เสียง: ไฟล์ mp3 ที่แนบ (แม่น้ำ) ทำ loop แบบ crossfade ไร้รอยต่อ + น้ำตก (ดัดแปลงจากไฟล์เดียวกัน) + เสียงป่าสังเคราะห์
 *           ความดังเปลี่ยนตามระยะผู้เล่นจากแม่น้ำ/น้ำตก (Distance Attenuation + smoothing) · AudioContext ตัวเดียว
 * ภาพฉาก = ภาพที่ผู้ใช้แนบ (วาดคงเดิม) + ชั้นแอนิเมชันที่เขียนด้วยโค้ด
 * ========================================================================== */
(function(root){
'use strict';
if(root.FOREST_SCENE)return;
const A=root.FR_ASSETS||{},D=root.FR_DATA||{};
const X=()=>root.__CEO_CTX;
const FA=()=>{try{return CEOScene.fishApi}catch(e){return null}};      // ระบบตกปลาเดิมของ CEOScene
const IMG=new Image();let imgReq=0;
function loadImg(){if(!imgReq&&A.img){imgReq=1;IMG.src=A.img}}
const IW=A.w||1672,IH=A.h||941,SCL=600/IH,OX=-(IW*SCL-960)/2;      // ภาพ native → พิกัดฉาก 960×600 (cover)
const gx=x=>OX+x*SCL,gy=y=>y*SCL;                                    // native → scene
const TS=4,GW=240,GH=150,grid=new Uint8Array(GW*GH);
const toS=r=>[gx(r[0]),gy(r[1]),gx(r[2]),gy(r[3])];
function fill(r,v){const a=toS(r),x0=Math.max(0,Math.floor(a[0]/TS)),x1=Math.min(GW-1,Math.floor((a[2]-.01)/TS)),y0=Math.max(0,Math.floor(a[1]/TS)),y1=Math.min(GH-1,Math.floor((a[3]-.01)/TS));for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)grid[y*GW+x]=v}
(D.walk||[]).forEach(r=>fill(r,1));(D.block||[]).forEach(r=>fill(r,0));
const ok1=(x,y)=>x>=0&&y>=0&&x<960&&y<600&&grid[((y/TS)|0)*GW+((x/TS)|0)]===1;
function canStand(x,y){return ok1(x,y)&&ok1(x-5,y)&&ok1(x+5,y)}
const DECK=D.deck?toS(D.deck):[0,0,0,0];
const onDeck=(x,y)=>x>=DECK[0]&&x<=DECK[2]&&y>=DECK[1]&&y<=DECK[3];
const WET=(D.wet||[]).map(toS),FALL={x:gx((D.fall||[1330,300])[0]),y:gy((D.fall||[1330,300])[1])};
const ENT={x:-26,y:472,toX:48};
const SC={ct:0,leaves:[],fire:[],spark:null,rip:null,streak:null,foam:[],msgT:0};

/* ---------- ระยะ/โซนตกปลา ---------- */
function distRect(x,y,r){const dx=Math.max(r[0]-x,0,x-r[2]),dy=Math.max(r[1]-y,0,y-r[3]);return Math.hypot(dx,dy)}
function nearWater(x,y){let b=1e9,bp=null;for(const r of WET){const px=Math.max(r[0],Math.min(r[2],x)),py=Math.max(r[1],Math.min(r[3],y)),d=Math.hypot(px-x,py-y);if(d<b){b=d;bp={x:px,y:py}}}return {d:b,p:bp}}
const FISH_R=30;                                                    // ระยะจากริมน้ำ (พิกเซลฉาก)
function fishSpot(){
 const s=X().st;if(onDeck(s.x,s.y))return{ok:0,why:'bridge'};
 const w=nearWater(s.x,s.y);if(w.d>FISH_R)return{ok:0,why:'far'};
 const up=w.p.y<s.y;                                                // น้ำอยู่เหนือผู้เล่น (ฝั่งใต้) หรือใต้ผู้เล่น (ฝั่งเหนือ)
 const face=Math.abs(w.p.y-s.y)>=Math.abs(w.p.x-s.x)*.6;
 if(face&&((up&&s.dir!==2)||(!up&&s.dir!==0)))return{ok:0,why:'face',w};
 return{ok:1,w};
}

/* ---------- เวลาเกม ---------- */
function nightK(){
 let h=12;try{h=X().hour()}catch(e){}
 try{if(root.ROADCARS&&ROADCARS.nightK)return ROADCARS.nightK(h)}catch(e){}
 if(h>=6.5&&h<16)return 0;if(h>=16&&h<18.5)return(h-16)/2.5*.45;if(h>=18.5&&h<19.5)return .45+(h-18.5)*.55;if(h>=19.5||h<4.5)return 1;if(h<6.5)return 1-(h-4.5)/2;return 0;
}

/* =====================  AUDIO  ===================== */
const AU={ctx:null,master:null,on:0,buf:null,loading:0,L:null,timer:0,stopT:0,noise:null,birdT:0,nodes:null};
const soundOn=()=>{try{return localStorage.getItem('mct_sound')!=='0'}catch(e){return true}};
const volM=()=>{try{const v=localStorage.getItem('mct_vol');return v==null?.8:Math.max(0,Math.min(1,(+v)/100))}catch(e){return .8}};
const volA=()=>{try{const e=document.getElementById('vAmb');if(!e)return 1;return Math.max(0,Math.min(2,(+e.value)/7))}catch(e){return 1}};   // ตัวเลื่อน "บรรยากาศฉาก" ของเกมเดิม (ค่าเริ่มต้น 7% = 1.0)
function ac(){
 if(!soundOn())return null;
 try{if(!AU.ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;AU.ctx=new C()}
  if(AU.ctx.state==='suspended')AU.ctx.resume();return AU.ctx}catch(e){return null}}
function b64buf(u){const b=atob(u.split(',')[1]),n=b.length,a=new Uint8Array(n);for(let i=0;i<n;i++)a[i]=b.charCodeAt(i);return a.buffer}
function loadBuf(c,cb){
 if(AU.buf){cb(AU.buf);return}if(AU.loading)return;AU.loading=1;
 try{const p=c.decodeAudioData(b64buf(A.river),b=>{AU.buf=b;AU.loading=0;cb(b)},()=>{AU.loading=0});if(p&&p.catch)p.catch(()=>{AU.loading=0})}catch(e){AU.loading=0}
}
function noiseBuf(c){if(AU.noise)return AU.noise;const n=c.sampleRate*3,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);let p=0;for(let i=0;i<n;i++){p=p*.96+(Math.random()*2-1)*.12;d[i]=p}
 const f=Math.floor(c.sampleRate*.25);for(let i=0;i<f;i++){const k=i/f;d[i]=d[i]*k+d[n-f+i]*(1-k)*0}   // กันคลิกตรงรอยต่อ
 return AU.noise=b}
// Looper: เล่นซ้ำด้วย crossfade (equal-power) → ไม่มีช่องว่าง/สะดุดตอน loop
function Looper(c,buf,out,rate,xf){
 const D_=buf.duration/rate,n=96,fin=new Float32Array(n),fout=new Float32Array(n);
 for(let i=0;i<n;i++){const k=i/(n-1);fin[i]=Math.sin(k*Math.PI/2);fout[i]=Math.cos(k*Math.PI/2)}
 const L={next:c.currentTime+.05,srcs:[]};
 function spawn(when){
  const s=c.createBufferSource(),g=c.createGain();s.buffer=buf;s.playbackRate.value=rate;s.connect(g);g.connect(out);
  g.gain.setValueAtTime(0,when);g.gain.setValueCurveAtTime(fin,when,xf);g.gain.setValueCurveAtTime(fout,when+D_-xf,xf);
  s.start(when);s.stop(when+D_+.1);L.srcs.push(s);s.onended=()=>{const i=L.srcs.indexOf(s);if(i>=0)L.srcs.splice(i,1);try{g.disconnect()}catch(e){}}}
 L.tick=()=>{while(L.next<c.currentTime+3){spawn(L.next);L.next+=D_-xf}};
 L.stop=()=>{L.srcs.slice().forEach(s=>{try{s.stop()}catch(e){}})};
 return L}
function interp(T,d){if(d<=T[0][0])return T[0][1];for(let i=1;i<T.length;i++){if(d<=T[i][0]){const a=T[i-1],b=T[i],k=(d-a[0])/(b[0]-a[0]);return a[1]+(b[1]-a[1])*(k*k*(3-2*k))}}return T[T.length-1][1]}
// ตารางระยะ (พิกเซลฉาก) → ความดัง  ·  แก้ตัวเลขตรงนี้เพื่อปรับ Audio Distance
const RIVER_T=[[0,.75],[45,.75],[140,.45],[300,.20],[560,.04],[900,0]];
const FALL_T=[[0,1],[110,1],[230,.75],[400,.45],[650,.20],[950,.03]];
function audStart(){
 const c=ac();if(!c)return;AU.stopT=0;
 if(AU.on){AU.master.gain.setTargetAtTime(1,c.currentTime,.6);return}
 loadImg();
 loadBuf(c,buf=>{
  if(!X()||!X().st.active||X().st.place!=='frst')return;if(AU.on)return;
  try{
   const m=c.createGain(),cp=c.createDynamicsCompressor();m.gain.value=0;cp.threshold.value=-14;cp.ratio.value=6;cp.attack.value=.02;cp.release.value=.3;m.connect(cp);cp.connect(c.destination);
   const lay=(name)=>{const g=c.createGain();g.gain.value=0;return g};
   const gR=lay(),gF=lay(),gW=lay(),pF=c.createStereoPanner?c.createStereoPanner():null;
   // แม่น้ำ = ไฟล์ที่แนบ (ตรง ๆ)
   gR.connect(m);const LR=Looper(c,buf,gR,1,3);LR.tick();
   // น้ำตก = ไฟล์เดียวกัน ปรับเป็นเสียงห้อมต่ำ/ทุ้มกว่า (ช้าลง+กรองความถี่) + pan ตามตำแหน่ง
   const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=70;const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2600;
   hp.connect(lp);lp.connect(gF);if(pF){gF.connect(pF);pF.connect(m)}else gF.connect(m);
   const LF=Looper(c,buf,hp,.8,3);LF.tick();
   // ป่า: ลม + ใบไม้ (noise กรอง + LFO) · นก/จิ้งหรีดสุ่มตามเวลาเกม
   const nb=noiseBuf(c);
   const wind=c.createBufferSource();wind.buffer=nb;wind.loop=true;const wf=c.createBiquadFilter();wf.type='bandpass';wf.frequency.value=420;wf.Q.value=.6;const wg=c.createGain();wg.gain.value=.05;
   const lfo=c.createOscillator();lfo.frequency.value=.07;const ld=c.createGain();ld.gain.value=.035;lfo.connect(ld);ld.connect(wg.gain);lfo.start();
   wind.connect(wf);wf.connect(wg);wg.connect(gW);wind.start();
   const lv=c.createBufferSource();lv.buffer=nb;lv.loop=true;lv.loopStart=.3;lv.loopEnd=2.6;const lf=c.createBiquadFilter();lf.type='highpass';lf.frequency.value=3200;const lg=c.createGain();lg.gain.value=.02;
   const l2=c.createOscillator();l2.frequency.value=.23;const l2d=c.createGain();l2d.gain.value=.015;l2.connect(l2d);l2d.connect(lg.gain);l2.start();
   lv.connect(lf);lf.connect(lg);lg.connect(gW);lv.start(0,.3);
   gW.connect(m);
   AU.master=m;AU.nodes={gR,gF,gW,pF,LR,LF,wind,lv,lfo,l2};AU.on=1;AU.birdT=c.currentTime+2;
   m.gain.setTargetAtTime(1,c.currentTime,.7);                               // Fade In
   AU.timer=setInterval(audTick,110);
  }catch(e){console.error('forest audio',e)}
 });
}
function bird(c,night){
 const t=c.currentTime,g=c.createGain(),o=c.createOscillator();o.type='sine';
 if(night){// จิ้งหรีด: พัลส์ความถี่สูง
  o.frequency.value=4300+Math.random()*500;const tr=c.createGain();tr.gain.value=0;g.gain.value=.012;o.connect(tr);tr.connect(g);
  for(let i=0;i<6;i++){tr.gain.setValueAtTime(1,t+i*.09);tr.gain.setValueAtTime(0,t+i*.09+.045)}o.start(t);o.stop(t+.6)}
 else{const f0=2300+Math.random()*1800;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f0*(1.25+Math.random()*.4),t+.09);o.frequency.exponentialRampToValueAtTime(f0*.9,t+.17);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.022,t+.02);g.gain.exponentialRampToValueAtTime(.0008,t+.2);o.connect(g);o.start(t);o.stop(t+.25)}
 g.connect(AU.nodes.gW);}
function audTick(){
 const x=X(),c=AU.ctx;if(!AU.on||!c||!x)return;
 const s=x.st;
 if(!s.active||s.place!=='frst'){if(!AU.stopT)audStop();return}
 const nk=nightK(),w=nearWater(s.x,s.y),dR=w.d,dF=Math.hypot(s.x-FALL.x,(s.y-FALL.y)*1.1);
 const k=soundOn()?volM()*volA():0,t=c.currentTime;
 const gr=interp(RIVER_T,dR),gf=interp(FALL_T,dF);
 AU.nodes.gR.gain.setTargetAtTime(gr*.8*k,t,.35);                   // Smooth Volume Interpolation
 AU.nodes.gF.gain.setTargetAtTime(gf*.85*k,t,.35);
 AU.nodes.gW.gain.setTargetAtTime((.5+.5*(1-gr))*k*(nk>.6?.7:1),t,.5);
 if(AU.nodes.pF)AU.nodes.pF.pan.setTargetAtTime(Math.max(-.9,Math.min(.9,(FALL.x-s.x)/520)),t,.3);
 if(AU.master)AU.master.gain.setTargetAtTime(soundOn()?1:0,t,.3);
 AU.nodes.LR.tick();AU.nodes.LF.tick();
 if(t>AU.birdT){bird(c,nk>.55);AU.birdT=t+(nk>.55?1.5+Math.random()*3:3+Math.random()*6)}
 if(root.__FR_ND===undefined)root.__FR_ND=0;
}
function audStop(){
 const c=AU.ctx;if(!c||!AU.on)return;AU.stopT=1;
 try{AU.master.gain.setTargetAtTime(0,c.currentTime,.45)}catch(e){}                 // Fade Out
 const N=AU.nodes;
 setTimeout(()=>{
  if(AU.stopT!==1)return;
  try{clearInterval(AU.timer);AU.timer=0;N.LR.stop();N.LF.stop();N.wind.stop();N.lv.stop();N.lfo.stop();N.l2.stop();AU.master.disconnect()}catch(e){}
  AU.on=0;AU.nodes=null;AU.master=null;AU.stopT=0;
 },2200);
}
setInterval(()=>{try{const x=X();if(!x)return;const s=x.st;
 if(AU.on&&!AU.stopT&&(!s.active||s.place!=='frst'))audStop();
 else if(AU.on&&AU.stopT&&s.active&&s.place==='frst'&&AU.master){AU.stopT=0;AU.master.gain.setTargetAtTime(1,AU.ctx.currentTime,.5)}}catch(e){}},300);

/* =====================  วาดฉาก  ===================== */
function seed(){
 if(SC.spark)return;
 let r=12345;const rnd=()=>{r=(r*16807)%2147483647;return r/2147483647};
 const inR=(L)=>{const q=L[Math.floor(rnd()*L.length)];return [q[0]+rnd()*(q[2]-q[0]),q[1]+rnd()*(q[3]-q[1])]};
 const skip=(x,y)=>(D.skip||[]).some(q=>x>q[0]&&x<q[2]&&y>q[1]&&y<q[3]);
 SC.rip=[];while(SC.rip.length<150){const p=inR(D.wetDraw);if(skip(p[0],p[1]))continue;SC.rip.push({x:p[0],y:p[1],v:6+rnd()*10,ph:rnd()*6.28,w:7+rnd()*9})}
 SC.spark=[];while(SC.spark.length<70){const p=inR(D.wetDraw);if(skip(p[0],p[1]))continue;SC.spark.push({x:p[0],y:p[1],ph:rnd()*6.28,sp:1.5+rnd()*2.5})}
 SC.streak=[];for(let i=0;i<46;i++)SC.streak.push({x:1245+rnd()*158,ph:rnd(),sp:.55+rnd()*.5,h:20+rnd()*34,tone:rnd()<.3?1:0});
 SC.foam=[];for(let i=0;i<22;i++)SC.foam.push({x:1235+rnd()*185,ph:rnd(),sp:.5+rnd()*.5,r:6+rnd()*10});
 SC.fire=[];for(let i=0;i<12;i++)SC.fire.push({x:80+rnd()*1400,y:220+rnd()*360,ph:rnd()*6.28,sp:.4+rnd()*.6});
 for(let i=0;i<16;i++)SC.leaves.push(newLeaf(rnd,1));
}
function newLeaf(rnd,init){return{x:(rnd||Math.random)()*960,y:init?(rnd||Math.random)()*300:-6,vx:6+((rnd||Math.random)()*8),vy:10+((rnd||Math.random)()*12),ph:(rnd||Math.random)()*6.28,c:((rnd||Math.random)()<.35)?'#d9e36a':'#58b83a'}}
function drawWorld(g,t){
 if(!IMG.complete||!IMG.naturalWidth){g.fillStyle='#173a1d';g.fillRect(0,0,960,600);return}
 g.imageSmoothingEnabled=true;try{g.imageSmoothingQuality='high'}catch(e){}
 g.drawImage(IMG,OX,0,IW*SCL,600);
 // ใบไม้/พุ่มไม้ขยับตามลม: เลื่อนแถบแนวนอนของเรือนยอด (บน) และพุ่มไม้หน้า (ล่าง) เล็กน้อย
 const bands=[[0,250,0,1040],[0,250,1440,IW],[776,IH,0,IW]];
 bands.forEach(b=>{for(let y=b[0];y<b[1];y+=10){const off=Math.sin(t/950+y*.045)*1.1+Math.sin(t/430+y*.09)*.35;g.drawImage(IMG,b[2],y,b[3]-b[2],10,gx(b[2])+off,gy(y),(b[3]-b[2])*SCL,10*SCL+.4)}});
}
function rectPath(g,L){g.beginPath();L.forEach(r=>{const a=toS(r);g.rect(a[0],a[1],a[2]-a[0],a[3]-a[1])})}
function drawWater(g,t){
 g.save();rectPath(g,D.wetDraw);g.clip();
 SC.rip.forEach(r=>{
  const w=D.wetDraw[0]; const span=1672; let x=((r.x-t*.001*r.v*8)%span+span)%span;                  // น้ำไหลไปทางซ้าย (จากน้ำตก)
  const a=.18+.3*(.5+.5*Math.sin(t/700+r.ph));if(a<.24)return;
  g.fillStyle='rgba(225,246,255,'+a.toFixed(2)+')';g.fillRect(Math.round(gx(x)),Math.round(gy(r.y)),Math.round(r.w*SCL),Math.max(1,Math.round(1.7*SCL)));
  g.fillRect(Math.round(gx(x)+r.w*SCL*.3),Math.round(gy(r.y)+2),Math.round(r.w*SCL*.5),1);
 });
 SC.spark.forEach(s=>{const a=Math.sin(t/(300*s.sp)+s.ph);if(a<.8)return;g.fillStyle='rgba(255,255,255,'+((a-.8)*4).toFixed(2)+')';g.fillRect(Math.round(gx(s.x)),Math.round(gy(s.y)),2,2)});
 g.restore();
 // น้ำตก: เส้นน้ำไหลลง (clip เฉพาะตัวน้ำตก)
 g.save();g.beginPath();const fa=toS([1243,48,1402,300]);g.rect(fa[0],fa[1],fa[2]-fa[0],fa[3]-fa[1]);g.clip();
 SC.streak.forEach(s=>{const H=300-48+s.h,y=((t*.0004*s.sp*H+s.ph*H)%H)+48-s.h;g.fillStyle=s.tone?'rgba(40,120,200,.35)':'rgba(255,255,255,.55)';g.fillRect(Math.round(gx(s.x)),Math.round(gy(y)),2,Math.round(s.h*SCL))});
 g.restore();
 // ฟองน้ำ/ไอน้ำที่ฐานน้ำตก
 SC.foam.forEach(f=>{const k=((t*.0006*f.sp+f.ph)%1),a=(1-k)*.55;g.fillStyle='rgba(255,255,255,'+a.toFixed(2)+')';const rr=f.r*SCL*(.6+k*.8);g.fillRect(Math.round(gx(f.x)-rr/2),Math.round(gy(300-k*28)-rr/2),Math.round(rr),Math.round(rr*.7))});
}
function drawLeaves(g,t,dt){
 SC.leaves.forEach((l,i)=>{l.y+=l.vy*dt;l.x+=(l.vx+Math.sin(t/700+l.ph)*10)*dt;if(l.y>600||l.x>980){SC.leaves[i]=newLeaf(null,0);SC.leaves[i].x=Math.random()*900-40}
  g.fillStyle=l.c;g.fillRect(Math.round(l.x),Math.round(l.y),3,2);g.fillRect(Math.round(l.x)+1,Math.round(l.y)+1,2,1)});
}
function drawBobber(g,t){
 const x=X(),s=x.st,f=s.fish;if(!f||(f.ph!=='wait'&&f.ph!=='bite'&&f.ph!=='game'))return;
 const w=nearWater(s.x,s.y);if(!w.p)return;
 const bx=Math.round(s.x+(s.dir===1?-26:26)),by=Math.round(w.p.y+(w.p.y<s.y?-10:10));
 const k=(t/900)%1,bob=Math.round(Math.sin(t/260)*(f.ph==='bite'?3:1));
 g.strokeStyle='rgba(235,250,255,'+(.6*(1-k)).toFixed(2)+')';g.lineWidth=1;g.beginPath();g.ellipse(bx,by+3,4+k*14,2+k*5,0,0,7);g.stroke();
 g.fillStyle='#e8352e';g.fillRect(bx-2,by-3+bob,4,4);g.fillStyle='#fff';g.fillRect(bx-2,by-3+bob,4,2);
}
function drawTint(g,t,nk){
 if(nk<=.01)return;
 const warm=Math.max(0,Math.min(1,4*nk*(1-nk)));
 g.fillStyle='rgba(12,22,64,'+(.5*nk).toFixed(3)+')';g.fillRect(0,0,960,600);
 if(warm>.02){g.fillStyle='rgba(255,130,50,'+(.12*warm).toFixed(3)+')';g.fillRect(0,0,960,600)}
 if(nk>.5){g.save();g.globalCompositeOperation='lighter';SC.fire.forEach(f=>{const a=Math.sin(t/(500/f.sp)+f.ph);if(a<.1)return;const x=gx(f.x)+Math.sin(t/1500+f.ph)*10,y=gy(f.y)+Math.cos(t/1900+f.ph)*8;
  g.fillStyle='rgba(255,240,120,'+(.18*a*(nk-.4)).toFixed(3)+')';g.beginPath();g.arc(x,y,5,0,7);g.fill();g.fillStyle='rgba(255,250,170,'+(.8*a*(nk-.4)).toFixed(3)+')';g.fillRect(Math.round(x)-1,Math.round(y)-1,2,2)});g.restore()}
}
function draw(g,t){
 loadImg();seed();
 const x=X(),s=x.st,dt=Math.min(.05,Math.max(0,(t-(SC.ct||t))/1000));SC.ct=t;
 // กำลังตกปลา แต่ออกนอกจุด/ขึ้นสะพาน → ยกเลิก
 if(s.fish&&!s.trans){const sp=fishSpot();if(!sp.ok&&sp.why!=='face'){try{FA().end('ออกจากจุดตกปลา · เก็บเบ็ดแล้ว')}catch(e){s.fish=null}}}
 drawWorld(g,t);drawWater(g,t);
 if(!s.hidden){if(s.fish)FA().draw(g,t);else x.drawCEO(g)}
 drawBobber(g,t);drawLeaves(g,t,dt);drawTint(g,t,nightK());
 if(!s.trans&&!s.fish){guide(g,t,gx(525),gy(292),'ป่าลึก (ข้ามสะพาน)',2);guide(g,t,52,440,'NICECLUB',1)}
}
/* ลูกศรนำทางกะพริบ (dir 0=ลง 1=ซ้าย 2=ขึ้น 3=ขวา) วาดทับความมืด เห็นชัดทั้งกลางวัน/กลางคืน */
function guide(g,t,sx,sy,txt,dir){
 const b=Math.round(Math.sin(t/230)*5),dv=[[0,1],[-1,0],[0,-1],[1,0]][dir],ax=Math.round(sx+dv[0]*b),ay=Math.round(sy+dv[1]*b);
 g.save();g.translate(ax,ay);g.rotate([0,Math.PI/2,Math.PI,-Math.PI/2][dir]);
 g.fillStyle='rgba(0,0,0,.55)';g.beginPath();g.moveTo(-13,-9);g.lineTo(13,-9);g.lineTo(0,15);g.closePath();g.fill();
 g.fillStyle='#ffe066';g.beginPath();g.moveTo(-11,-7);g.lineTo(11,-7);g.lineTo(0,12);g.closePath();g.fill();
 g.fillStyle='#fff6bd';g.fillRect(-4,-7,8,2);g.restore();
 g.save();g.font='bold 12px sans-serif';g.textAlign='center';const w=g.measureText(txt).width+14,cx=Math.max(w/2+4,Math.min(956-w/2,ax)),ty=ay+(dir===2?-30:34);
 g.fillStyle='rgba(10,24,12,.82)';g.fillRect(Math.round(cx-w/2),Math.round(ty-13),Math.round(w),18);g.fillStyle='#ffe066';g.fillRect(Math.round(cx-w/2),Math.round(ty-13),Math.round(w),2);
 g.fillStyle='#fff';g.fillText(txt,Math.round(cx),Math.round(ty));g.restore()}

/* ---------- พรอมต์ / HUD ---------- */
function prompt(){
 const x=X(),s=x.st;if(s.sleep||s.trans||s.mode!=='scene'||s.talk||s.fish)return'';
 if(s.x<=150&&s.y>=400&&s.y<=520)return'⬅ เดินต่อไปทางซ้ายสุดเพื่อกลับ NICECLUB';
 if(s.y<=gy(300)&&s.x>=gx(450)&&s.x<=gx(600)&&!onDeck(s.x,s.y))return'⬆ เดินต่อไปทางเหนือตามทางเดินเพื่อเข้า DEEP FOREST (ป่าลึก)';
 const sp=fishSpot();
 if(sp.ok)return'🎣 กด E / ปุ่มโต้ตอบ เพื่อตกปลา (ริมแม่น้ำ)';
 if(sp.why==='face')return'🎣 หันหน้าไปทางแม่น้ำ แล้วกด E เพื่อตกปลา';
 if(sp.why==='bridge')return'🌉 สะพานไม้ · ตกปลาบนสะพานไม่ได้ (ลงไปริมน้ำ)';
 return'';
}
function hud(g){
 const x=X(),W=x.W,H=x.H,s=x.st,pm=prompt();
 if(pm){g.fillStyle='rgba(10,30,16,.88)';g.fillRect(W/2-250,H-146,500,30);g.fillStyle='#6fe08a';g.fillRect(W/2-250,H-146,500,2);g.fillStyle='#eaffee';g.font='bold 15px sans-serif';g.textAlign='center';g.fillText(pm,W/2,H-125)}
 try{const f=FA();if(f)f.lv(g)}catch(e){}
}
function toast(m){try{X().toast(m)}catch(e){}}

/* ---------- ขอบฉาก / Transition ---------- */
function edges(dx,dy){
 const x=X(),s=x.st;if(s.trans||s.talk||s.fish)return;
 if(dx<0&&s.x<=12&&s.y>=400&&s.y<=520)leaveLeft();
 if(dy<0&&s.y<=gy(222)&&s.x>=gx(470)&&s.x<=gx(580))leaveUp();
}
function leaveUp(){const x=X(),s=x.st;if(s.place!=='frst'||!x.transLock())return;s.trans={type:'frUp',t:0};toast('⬆ เข้าสู่ DEEP FOREST (ป่าลึก)')}
function leaveLeft(){const x=X(),s=x.st;if(s.place!=='frst'||!x.transLock())return;s.trans={type:'frLeaveL',t:0};toast('⬅ กลับ NICECLUB')}
function trans(tr,dt){
 const x=X(),s=x.st;
 if(tr.type==='frLeaveL'){
  s.x-=135*dt;s.dir=1;s.moving=1;s.frame=(s.frame+135*dt/15)%4;x.setFade(Math.min(1,Math.max(0,(tr.t-.1)/.6)));
  if(tr.t>=.8){s.moving=0;s.trans=null;x.enter('ncst',{from:'frst'})}
  return true}
 if(tr.type==='frUp'){
  s.y-=96*dt;s.dir=2;s.moving=1;s.frame=(s.frame+96*dt/15)%4;x.setFade(Math.min(1,Math.max(0,(tr.t-.1)/.6)));
  if(tr.t>=.8){s.moving=0;s.trans=null;x.enter('dpfr',{from:'frst'})}
  return true}
 if(tr.type==='frBack'){
  if(tr.ph===0){if(x.walkTo(24,(s.y>=400&&s.y<=520)?s.y:472,130,dt)){tr.ph=1}}else{s.trans={type:'frLeaveL',t:0}}
  return true}
 return false}

/* ---------- init / interact / back ---------- */
function init(place,from){
 const x=X(),s=x.st;s.hidden=false;SC.ct=0;seed();loadImg();
 if(from==='ncst'){s.x=ENT.x;s.y=ENT.y;s.dir=3;s.trans={type:'arrive',t:0,toX:ENT.toX,toY:ENT.y};x.setFade(1)}
 else if(from==='dpfr'){s.x=gx(525);s.y=gy(205);s.dir=0;s.trans={type:'arrive',t:0,toX:gx(525),toY:gy(270)};x.setFade(1)}
 else{s.x=470;s.y=500;s.dir=0}
 audStart();
}
function interact(){
 const x=X(),s=x.st;if(s.trans||s.talk||s.sleep||s.fish)return;
 const sp=fishSpot();
 if(sp.ok){try{FA().start()}catch(e){console.error(e)}return}
 if(sp.why==='bridge'){toast('🌉 ตกปลาบนสะพานไม่ได้ · เดินลงไปริมน้ำก่อน');return}
 if(sp.why==='face'){toast('🎣 หันหน้าไปทางแม่น้ำก่อน (กดทิศทางไปทางน้ำ) แล้วกด E');return}
 toast('🌲 เดินไปริมแม่น้ำเพื่อตกปลา · น้ำตกอยู่ทางขวาบน');
}
function back(){const x=X(),s=x.st;if(s.trans||s.talk||s.sleep)return;if(s.fish){try{FA().end('เก็บอุปกรณ์ตกปลาแล้ว')}catch(e){s.fish=null}}
 // ปุ่ม "กลับ" = ออกไป NICECLUB ทันที (ไม่ต้องเดินไปที่ขอบซ้ายก่อน)
 s.trans={type:'frLeaveL',t:0};toast('⬅ กลับ NICECLUB');}
function reset(){}

root.FOREST_SCENE={canStand,draw,hud,edges,trans,interact,back,init,prompt,reset,SC,fishSpot,nearWater,grid,onDeck,
 audio:{state:()=>({on:AU.on,stopT:AU.stopT,ctx:AU.ctx?AU.ctx.state:null,buf:!!AU.buf,gains:AU.nodes?{r:AU.nodes.gR.gain.value,f:AU.nodes.gF.gain.value,w:AU.nodes.gW.gain.value,m:AU.master.gain.value}:null}),RIVER_T,FALL_T,interp},
 geom:{OX,SCL,gx,gy,FALL,WET,DECK}};
})(typeof window!=='undefined'?window:globalThis);

