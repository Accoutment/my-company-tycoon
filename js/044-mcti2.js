
/* ===== v152 · ฉากเปิดเกม (Animated Logo Reveal) — ทำงานด้วย canvas จริง ไม่ใช่วิดีโอ =====
   ใช้ภาพฉากเมือง + โลโก้ที่แนบมา (โลโก้ตัดแยกชั้นจากภาพเดิม รูปทรง/สี/สัดส่วนเดิม ไม่วาดใหม่)
   เวลารวม ~6.8 วิ: 0-1 เฟดจากดำ · 1-2 แสงอาทิตย์/เมฆ/ใบไม้ · 2-4 โลโก้ซูมเข้ามากลางจอ ·
   4-5 ประกายแสง · 5-6.8 ค่อย ๆ จางเข้าหน้าหลัก (ไม่กระพริบ) · SKIP มุมขวาบน / Esc */
(function(){
'use strict';
const root=document.getElementById('mctI2');
if(!root)return;
const lobby=document.getElementById('lobby');
const lsG=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
const lsS=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
// เปิด/ปิดจาก Settings
(function(){const cb=document.getElementById('lbIntro');if(!cb)return;cb.checked=lsG('mct_intro')!=='0';cb.onchange=()=>lsS('mct_intro',cb.checked?'1':'0')})();
// ไม่เล่นเมื่อเข้าเกมต่อจากเซฟ/เริ่มเกมใหม่ (รีโหลดภายในเกม) หรือผู้เล่นปิดไว้
if((lobby&&lobby.style.display==='none')||lsG('mct_intro')==='0'){root.remove();return}
window.__mctI2=1;
const A=window.MCT_INTRO_ASSETS||{};
const cv=root.querySelector('canvas'),g=cv.getContext('2d');
const IW=1672,IH=941,LG={w:1102,h:559};
let W=0,H=0,DPR=1,done=false,raf=0,t0=0,ending=0,ac=null,master=null;
function resize(){DPR=Math.min(window.devicePixelRatio||1,1.5);W=innerWidth;H=innerHeight;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);cv.style.width=W+'px';cv.style.height=H+'px'}
resize();addEventListener('resize',resize);
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const ease=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
const easeOut=x=>1-Math.pow(1-clamp(x,0,1),3);
const rnd=(a,b)=>a+Math.random()*(b-a);

/* ---------- เสียง (สังเคราะห์เอง ไม่มีลิขสิทธิ์ · เคารพ Mute/ระดับเสียงเดิม) ---------- */
function audioOn(){return lsG('mct_sound')!=='0'}
function vol(){const v=lsG('mct_vol');if(v==null)return .8;const n=+v;return clamp(n>1?n/100:n,0,1)}
let rev=null;
function audioInit(){
 if(!audioOn()||ac)return;
 try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;ac=new C();
  master=ac.createGain();master.gain.value=.5*vol();
  const comp=ac.createDynamicsCompressor();comp.threshold.value=-20;comp.knee.value=18;comp.ratio.value=3.2;comp.attack.value=.01;comp.release.value=.3;
  master.connect(comp);comp.connect(ac.destination);
  // รีเวิร์บห้องโถงสังเคราะห์ (ให้เสียงก้องหรูหรา)
  rev=ac.createConvolver();const len=ac.sampleRate*2.8|0,ib=ac.createBuffer(2,len,ac.sampleRate);
  for(let c=0;c<2;c++){const d=ib.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6)}
  rev.buffer=ib;const wet=ac.createGain();wet.gain.value=.6;rev.connect(wet);wet.connect(master);
  if(ac.state==='suspended')ac.resume().catch(()=>{})}catch(e){ac=null}
}
function bus(n,send){n.connect(master);if(rev&&send){const s=ac.createGain();s.gain.value=send;n.connect(s);s.connect(rev)}}
function tone(f,t,d,type,v,o){if(!ac)return;o=o||{};try{
 const T=ac.currentTime+t,gn=ac.createGain();let last=gn;
 const mk=(det)=>{const x=ac.createOscillator();x.type=type||'triangle';x.frequency.value=f;if(det)x.detune.value=det;x.connect(gn);x.start(T);x.stop(T+d+.1)};
 mk(0);if(o.det){mk(o.det);mk(-o.det)}
 if(o.lp){const lp=ac.createBiquadFilter();lp.type='lowpass';lp.Q.value=.7;lp.frequency.setValueAtTime(o.lp[0],T);lp.frequency.linearRampToValueAtTime(o.lp[1],T+d*.45);lp.frequency.linearRampToValueAtTime(o.lp[2]||o.lp[0],T+d);gn.connect(lp);last=lp}
 const a=o.a||.02,pk=v||.2;gn.gain.setValueAtTime(.0001,T);gn.gain.exponentialRampToValueAtTime(pk,T+a);gn.gain.exponentialRampToValueAtTime(.0001,T+d);
 bus(last,o.send==null?.35:o.send)}catch(e){}}
function bell(f,t,d,v){[[1,1,1],[2.01,.42,.7],[2.76,.3,.5],[4.07,.16,.35],[5.4,.09,.25]].forEach(p=>tone(f*p[0],t,d*p[2],'sine',(v||.1)*p[1],{send:.55,a:.004}))}
function pluck(f,t,v){tone(f,t,.9,'triangle',v||.09,{a:.004,lp:[3600,1500,900],send:.55});tone(f*2,t,.5,'sine',(v||.09)*.35,{a:.004,send:.5})}
function noise(t,d,type,f0,f1,v,peak,send){if(!ac)return;try{const n=ac.sampleRate*d|0,b=ac.createBuffer(1,n,ac.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=Math.random()*2-1;
 const s=ac.createBufferSource();s.buffer=b;const f=ac.createBiquadFilter();f.type=type;f.Q.value=type==='bandpass'?2.2:.7;const T=ac.currentTime+t;
 f.frequency.setValueAtTime(f0,T);f.frequency.exponentialRampToValueAtTime(f1,T+d);const gn=ac.createGain();gn.gain.setValueAtTime(.0001,T);
 if(peak==='rise'){gn.gain.exponentialRampToValueAtTime(v,T+d*.92);gn.gain.exponentialRampToValueAtTime(.0001,T+d)}else{gn.gain.exponentialRampToValueAtTime(v,T+.015);gn.gain.exponentialRampToValueAtTime(.0001,T+d)}
 s.connect(f);f.connect(gn);bus(gn,send==null?.4:send);s.start(T)}catch(e){}}
function boom(t){if(!ac)return;try{const T=ac.currentTime+t,o=ac.createOscillator(),gn=ac.createGain();o.type='sine';o.frequency.setValueAtTime(120,T);o.frequency.exponentialRampToValueAtTime(38,T+1.1);
 gn.gain.setValueAtTime(.0001,T);gn.gain.exponentialRampToValueAtTime(.55,T+.02);gn.gain.exponentialRampToValueAtTime(.0001,T+2.0);o.connect(gn);bus(gn,.25);o.start(T);o.stop(T+2.1)}catch(e){}
 noise(t,.5,'lowpass',900,120,.22,'hit',.3)}
function brass(fs,t,d,v){fs.forEach(f=>tone(f,t,d,'sawtooth',v||.04,{a:.14,det:7,lp:[500,2600,1100],send:.45}))}
let sfxDone={};
const PENTA=[523.3,587.3,659.3,784,880,1046.5,1174.7,1318.5,1568,1760,2093];
function sfx(t){
 if(!ac)return;
 // 0.1 · ซับเบสโอบอุ่น + เครื่องสายนุ่ม ๆ เปิดฉากแบบโรงภาพยนตร์
 if(t>.1&&!sfxDone.pad){sfxDone.pad=1;
  tone(55,0,4.4,'sine',.07,{a:1.2,send:.1});tone(82.4,0,4.4,'sine',.04,{a:1.4,send:.1});
  [130.8,196,261.6,329.6,392,493.9].forEach((f,i)=>tone(f,i*.04,4.6,'sawtooth',.016,{a:1.5,det:6,lp:[420,1500,700],send:.6}));}
 // 1.0 · ฮาร์ปไล่เสียงขึ้น + ประกายเบา ๆ
 if(t>1.0&&!sfxDone.harp){sfxDone.harp=1;PENTA.forEach((f,i)=>pluck(f,i*.1,.08))}
 // 1.95 · เสียงกวาดขึ้น (reverse cymbal) ก่อนโลโก้โผล่
 if(t>1.95&&!sfxDone.ris){sfxDone.ris=1;noise(0,1.85,'bandpass',350,7500,.3,'rise',.5);tone(196,0,1.85,'sawtooth',.03,{a:1.6,det:8,lp:[300,3000,3000],send:.5})}
 // 3.75 · โลโก้กระแทกเข้าที่: บูมลึก + เครื่องทองเหลือง + ระฆังคริสตัล + ฉาบ
 if(t>3.75&&!sfxDone.hit){sfxDone.hit=1;
  boom(0);brass([130.8,196,261.6,329.6,392],0,2.8,.05);brass([523.3,659.3,784],.04,2.4,.03);
  [1046.5,1318.5,1568,2093].forEach((f,i)=>bell(f,.05+i*.085,2.4,.075));
  noise(0,1.6,'highpass',5500,3200,.12,'hit',.55)}
 // 4.2+ · ประกายระยิบระยับเมื่อแสงวิ่งผ่านโลโก้
 [4.2,4.4,4.6,4.8,5.0,5.2].forEach((x,i)=>{if(t>x&&!sfxDone['k'+i]){sfxDone['k'+i]=1;const f=[3136,3951,2637,3520,4186,3136][i];bell(f,0,.9,.035);if(i%2===0)pluck(f/2,0,.05)}});
 // 5.0 · คอร์ดปิดแบบ "ติ๊ง" หรู ๆ
 if(t>5.0&&!sfxDone.end){sfxDone.end=1;[1046.5,1568,2093,2637].forEach((f,i)=>bell(f,i*.07,1.6,.06))}
}

/* ---------- ภาพ ---------- */
const IMG={};
function load(k,src){return new Promise(res=>{if(!src)return res(false);const im=new Image();im.onload=()=>{IMG[k]=im;res(true)};im.onerror=()=>res(false);im.src=src})}

/* ---------- องค์ประกอบเคลื่อนไหว ---------- */
function mkCloud(w,rows){ // เมฆพิกเซลเล็ก ๆ (หน่วยละ 6px ของภาพ)
 const c=document.createElement('canvas');c.width=w;c.height=rows.length+2;const x=c.getContext('2d');
 rows.forEach((r,j)=>{x.fillStyle=j>=rows.length-2?'#cfe3f7':'#ffffff';x.fillRect(r[0],j,r[1]-r[0],1)});
 return c;
}
const CLOUDS=[
 mkCloud(34,[[10,22],[6,28],[3,32],[1,34],[0,34],[2,33],[6,30]]),
 mkCloud(26,[[7,17],[4,22],[1,25],[0,26],[1,25],[4,22]]),
 mkCloud(42,[[12,28],[7,34],[3,38],[1,41],[0,42],[0,42],[3,40],[8,34]])
];
const cl=[{c:0,x:120,y:40,v:5,a:.85},{c:1,x:780,y:120,v:3.4,a:.8},{c:2,x:1350,y:230,v:4.2,a:.8},{c:1,x:-80,y:300,v:6,a:.75}];
const petals=Array.from({length:18},()=>({x:rnd(40,640),y:rnd(40,380),vx:rnd(10,26),vy:rnd(16,38),r:rnd(0,6.28),vr:rnd(-2.2,2.2),s:rnd(.8,1.5),ph:rnd(0,6.28)}));
function respawn(p){p.x=rnd(60,620);p.y=rnd(60,300);p.vx=rnd(10,26);p.vy=rnd(16,38);p.ph=rnd(0,6.28)}
const birds=[];let nextBird=2.3,birdsMade=0;
function spawnBird(){const n=2+(Math.random()<.5?1:0),y=rnd(60,190),x0=IW+80;for(let i=0;i<n;i++)birds.push({x:x0+i*46+rnd(0,20),y:y+i*14+rnd(-6,6),v:rnd(78,98),ph:rnd(0,6)})}
const SPK=Array.from({length:16},(_,i)=>{const a=i/16*6.283+rnd(-.15,.15),r=.5+rnd(0,.08);return{ax:Math.cos(a)*r,ay:Math.sin(a)*r*.82,ph:rnd(0,6.28),s:rnd(.7,1.3),f:rnd(2.2,3.6)}});

/* ---------- วาด ---------- */
let lgCv=null,lgX=null;
function logoRect(k){ // ขนาด/ตำแหน่งโลโก้บนจอ (ไม่ถูกตัดขอบ รักษาสัดส่วนเดิม)
 const asp=LG.w/LG.h;let w=Math.min(W*.72,H*.66*asp,LG.w*Math.max(W/IW,H/IH)*1.1);const h=w/asp,cx=W/2,cy=H*.41;
 return{cx,cy,w:w*k,h:h*k,bw:w,bh:h};
}
function star(x,y,r,a){g.globalAlpha=a;g.fillStyle='#fff7d0';const u=Math.max(1,Math.round(r/4));g.fillRect(x-r,y-u/2,r*2,u);g.fillRect(x-u/2,y-r,u,r*2);g.fillStyle='#ffffff';g.fillRect(x-u,y-u,u*2,u*2);g.globalAlpha=1}
function frame(now){
 if(done)return;
 if(!t0)t0=now;
 let t=(now-t0)/1000;
 const END=5.6,DISS=1.2;
 if(t>=END&&!ending){ending=1;root.style.transition='opacity '+DISS+'s ease-in-out';root.style.opacity='0';}
 if(t>=END+DISS+.1){return finish()}
 sfx(t);
 g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);
 // ----- ฉากเมือง (cover) + ซูมช้า ๆ -----
 const s0=Math.max(W/IW,H/IH),zoom=1.045-.045*ease(clamp(t/6,0,1)),s=s0*zoom;
 const ox=W/2-IW/2*s,oy=H/2-IH/2*s;
 g.setTransform(DPR*s,0,0,DPR*s,DPR*ox,DPR*oy);
 g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
 g.drawImage(IMG.bg,0,0);
 // เมฆลอย
 const cloudA=clamp((t-.8)/1.2,0,1);
 if(cloudA>0)cl.forEach(c=>{const sp=CLOUDS[c.c],px=((c.x+c.v*t)%(IW+300))-150;g.globalAlpha=c.a*cloudA*.92;g.drawImage(sp,px,c.y,sp.width*6,sp.height*6)});
 g.globalAlpha=1;
 // ใบไม้/กิ่งไม้/พุ่มไม้ไหวตามลม (ชั้นแยกจากภาพเดิม)
 const sway=(im,x,y,A,sp,ph,piv)=>{if(!im)return;g.save();g.translate(x,y);g.translate(piv[0],piv[1]);g.rotate(Math.sin(t*sp+ph)*A);g.translate(-piv[0],-piv[1]);g.drawImage(im,0,0);g.restore()};
 sway(IMG.tree,0,0,.0055,1.15,0,[0,-60]);
 sway(IMG.bush,0,590,.007,1.5,1.7,[170,230]);
 sway(IMG.plant,1540,640,.01,1.35,.6,[70,170]);
 // นก
 if(t>nextBird&&birdsMade<3){spawnBird();birdsMade++;nextBird+=2.1}
 birds.forEach(b=>{b.x-=b.v*(1/60);b.ph+=.2;const up=Math.sin(b.ph)>0;g.fillStyle='#2b3350';const x=Math.round(b.x),y=Math.round(b.y);g.fillRect(x,y,6,6);if(up){g.fillRect(x-9,y-6,9,3);g.fillRect(x+6,y-6,9,3);g.fillRect(x-15,y-12,6,3);g.fillRect(x+15,y-12,6,3)}else{g.fillRect(x-9,y+3,9,3);g.fillRect(x+6,y+3,9,3);g.fillRect(x-15,y+9,6,3);g.fillRect(x+15,y+9,6,3)}});
 // กลีบซากุระร่วง
 const petalA=clamp((t-.6)/1.0,0,1);
 if(petalA>0)petals.forEach(p=>{const dt=1/60;p.x+=(p.vx+Math.sin(t*1.6+p.ph)*10)*dt;p.y+=p.vy*dt;p.r+=p.vr*dt;if(p.y>IH+10||p.x>IW+10)respawn(p);g.save();g.translate(p.x,p.y);g.rotate(p.r);g.globalAlpha=.9*petalA;g.fillStyle='#ffb8d4';g.fillRect(-4*p.s,-2.5*p.s,8*p.s,5*p.s);g.fillStyle='#f48bb6';g.fillRect(0,-2.5*p.s,4*p.s,2.5*p.s);g.restore()});
 g.globalAlpha=1;
 // ----- ชั้นหน้าจอ (screen space) -----
 g.setTransform(DPR,0,0,DPR,0,0);
 const kScale=t<2?.3:t<4?.3+.7*easeOut((t-2)/2):1;
 const settle=t>4&&t<5.4?Math.sin((t-4)*7.5)*Math.exp(-(t-4)*2.6)*.012:0;
 const bump=ending?(t-END)/DISS*.03:0;
 const L=logoRect(kScale*(1+settle+bump));
 // แสงอาทิตย์ + รัศมีด้านหลังโลโก้
 const glow=clamp((t-1)/1.0,0,1)*(.55+.2*Math.sin(t*1.7))*(t>4?1.15:1);
 g.globalCompositeOperation='lighter';
 if(glow>0){
  const R=Math.max(W,H)*.62,gr=g.createRadialGradient(L.cx,L.cy,10,L.cx,L.cy,R);gr.addColorStop(0,'rgba(255,238,180,'+(.5*glow).toFixed(3)+')');gr.addColorStop(.45,'rgba(255,214,140,'+(.14*glow).toFixed(3)+')');gr.addColorStop(1,'rgba(255,200,120,0)');g.fillStyle=gr;g.fillRect(0,0,W,H);
  const rays=clamp((t-1.2)/1.2,0,1)*(t>4?1.4:1),n=14,a0=t*.045;
  g.fillStyle='rgba(255,244,200,'+(.07*rays).toFixed(3)+')';
  for(let i=0;i<n;i++){const a=a0+i/n*6.2832,w=.075;g.beginPath();g.moveTo(L.cx,L.cy);g.lineTo(L.cx+Math.cos(a-w)*R*1.6,L.cy+Math.sin(a-w)*R*1.6);g.lineTo(L.cx+Math.cos(a+w)*R*1.6,L.cy+Math.sin(a+w)*R*1.6);g.fill()}
 }
 g.globalCompositeOperation='source-over';
 // โลโก้ (ซูมจากไกล → กลางจอ)
 const la=clamp((t-2)/.8,0,1);
 if(la>0&&IMG.logo){
  g.save();g.globalAlpha=la;g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
  g.shadowColor='rgba(255,236,170,'+(.85*la*(t>3.6?1:.6)).toFixed(2)+')';g.shadowBlur=Math.max(4,18*L.w/L.bw);
  g.drawImage(IMG.logo,L.cx-L.w/2,L.cy-L.h/2,L.w,L.h);
  g.restore();
  // แสงสะท้อนวิ่งผ่านโลโก้ (เฉพาะพิกเซลของโลโก้)
  const sh=(t-3.6)/1.3;
  if(sh>0&&sh<1){
   const w=Math.ceil(L.w),h=Math.ceil(L.h);
   if(!lgCv){lgCv=document.createElement('canvas');lgX=lgCv.getContext('2d')}
   if(lgCv.width!==w||lgCv.height!==h){lgCv.width=w;lgCv.height=h}
   lgX.globalCompositeOperation='source-over';lgX.clearRect(0,0,w,h);lgX.imageSmoothingQuality='high';lgX.drawImage(IMG.logo,0,0,w,h);
   lgX.globalCompositeOperation='source-atop';
   const px=-w*.3+sh*w*1.6,gr=lgX.createLinearGradient(px-w*.12,0,px+w*.12,h*.4);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.5,'rgba(255,255,255,.62)');gr.addColorStop(1,'rgba(255,255,255,0)');
   lgX.fillStyle=gr;lgX.fillRect(0,0,w,h);
   g.drawImage(lgCv,L.cx-L.w/2,L.cy-L.h/2);
  }
 }
 // ประกายแสงรอบโลโก้
 if(t>3.9){const sa=clamp((t-3.9)/.8,0,1)*(ending?1-(t-END)/DISS:1);SPK.forEach(p=>{const tw=Math.max(0,Math.sin(t*p.f+p.ph));const a=tw*tw*sa;if(a>.04)star(Math.round(L.cx+p.ax*L.bw*1.04),Math.round(L.cy+p.ay*L.bh*1.15),Math.round(5*p.s+tw*6),a)})}
 // เฟดจากดำ (0–1 วิ)
 if(t<1.05){g.fillStyle='rgba(0,0,0,'+(1-ease(clamp(t/1,0,1))).toFixed(3)+')';g.fillRect(0,0,W,H)}
 raf=requestAnimationFrame(frame);
}
function finish(fast){
 if(done)return;done=true;cancelAnimationFrame(raf);
 if(ac){try{master.gain.cancelScheduledValues(ac.currentTime);master.gain.setTargetAtTime(0,ac.currentTime,.22);const c=ac;setTimeout(()=>{try{c.close()}catch(e){}},1400)}catch(e){}ac=null}
 removeEventListener('keydown',onKey,true);removeEventListener('resize',resize);
 if(fast){root.style.transition='opacity .35s ease-out';root.style.opacity='0';setTimeout(()=>root.remove(),380)}
 else root.remove();
}
function onKey(e){if(e.key==='Escape'&&!done){e.preventDefault();e.stopImmediatePropagation();finish(true)}}
addEventListener('keydown',onKey,true);
const sk=root.querySelector('button');
if(sk){sk.onclick=e=>{e.preventDefault();e.stopPropagation();finish(true)}}
root.addEventListener('pointerdown',()=>{if(ac&&ac.state==='suspended')ac.resume().catch(()=>{})},{once:true});
// ข้อมูลภาพ → เริ่มเมื่อโหลดครบ (ถ้านานเกิน 3 วิ ข้ามไปหน้าหลักเลย ไม่ให้ค้าง)
const guard=setTimeout(()=>{if(!t0)finish(true)},3500);
Promise.all([load('bg',A.bg),load('logo',A.logo),load('tree',A.tree),load('bush',A.bush),load('plant',A.plant)]).then(()=>{
 clearTimeout(guard);if(done)return;
 if(!IMG.bg||!IMG.logo){finish(true);return}
 audioInit();raf=requestAnimationFrame(frame);
}).catch(()=>finish(true));
})();

