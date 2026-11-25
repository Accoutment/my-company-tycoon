
/* =====================================================================
   HORROR ENDING · THE THREE GHOSTS (โมดูลแยก ต่อยอดจากระบบผีเดิม ไม่แก้กติกาการจับ)
   เชื่อมกับของเดิม:
   - จุดนับการจับสำเร็จ  GHOST: beginCaught() (เรียกครั้งเดียวต่อการเปลี่ยนเฟส chase→caught) → HXE.onCaught(G.kind)
   - ชนิดผี              G.kind: classic | girl (กิโมโน) | zombie
   - เสียง               GHOST.audio (actx/osc/noise/vol ของระบบเสียงผีเดิม · เคารพ mct_sound/mct_vol)
   - คัตซีน              QCUT.defs / QCUT.play(...,{force:1}) + C.ghost (สไปรต์ผีเดิม) + C.npc('ceo')
   - เซฟ                 S.horrorEnding ไปกับ save() เดิม (localStorage 'mct2')
   - เริ่มเกมใหม่          A.reset(1) เดิม หลัง gameConfirm เท่านั้น
   สถานะ: LOCKED → COUNTING → UNLOCKED → PENDING_CINEMATIC → CINEMATIC_RUNNING → ENDING_SCREEN → GAME_OVER
   ===================================================================== */
(function(){
'use strict';
const NEED=50;
const KEY={classic:'ghost1',girl:'kimonoGhost',zombie:'zombieGhost'};
const KEYS=['ghost1','kimonoGhost','zombieGhost'];
const $=id=>document.getElementById(id);
const okS=()=>{try{return typeof S==='object'&&S&&Array.isArray(S.emp)&&typeof QCUT!=='undefined'&&typeof GHOST!=='undefined'}catch(e){return false}};

/* ---------------------------------------------------------------- state */
function H(){
 if(!S.horrorEnding||typeof S.horrorEnding!=='object')S.horrorEnding={};
 const h=S.horrorEnding;
 if(!h.ghostCaptureByType||typeof h.ghostCaptureByType!=='object')h.ghostCaptureByType={};
 KEYS.forEach(k=>{h.ghostCaptureByType[k]=Math.max(0,Math.floor(+h.ghostCaptureByType[k]||0))});
 ['unlocked','pendingStart','cinematicPlayed','endingCompleted'].forEach(k=>{if(typeof h[k]!=='boolean')h[k]=false});
 // ตรวจสอบความสอดคล้อง: ยอดรวม = ผลรวมรายตัว (ไม่เพิ่มเกินจริง · ไม่เกิน 50)
 const sum=KEYS.reduce((a,k)=>a+h.ghostCaptureByType[k],0);
 let c=Math.floor(+h.ghostCaptureCount||0);
 if(sum>0||c===0)c=sum;
 h.ghostCaptureCount=Math.max(0,Math.min(NEED,c));
 if(h.ghostCaptureCount>=NEED&&!h.unlocked&&!h.endingCompleted){h.unlocked=true;h.pendingStart=!h.cinematicPlayed}
 if(!h.state)h.state=h.ghostCaptureCount>0?'COUNTING':'LOCKED';
 return h;
}
const sv=()=>{try{save(1)}catch(e){}};

/* ---------------------------------------------------------------- นับการจับ (เรียกจาก GHOST.beginCaught ครั้งเดียวต่อเหตุการณ์) */
function onCaught(kind){
 if(!okS())return false;
 const h=H();
 if(h.unlocked||h.endingCompleted||h.cinematicPlayed)return false;     // ครบแล้ว → หยุดนับ ไม่ปลดล็อกซ้ำ
 const k=KEY[kind]||'ghost1';
 h.ghostCaptureByType[k]++;
 h.ghostCaptureCount=Math.min(NEED,KEYS.reduce((a,x)=>a+h.ghostCaptureByType[x],0));
 h.state='COUNTING';
 if(h.ghostCaptureCount>=NEED){h.unlocked=true;h.pendingStart=true;h.state='UNLOCKED';h.state='PENDING_CINEMATIC'}
 sv();refreshCounter();
 return true;
}

/* ---------------------------------------------------------------- พร้อมเล่นคัตซีนหรือยัง */
function busyNow(){
 try{if(S.over)return 'over'}catch(e){}
 try{if(S.paused)return 'paused'}catch(e){}
 try{if(typeof CUT!=='undefined'&&CUT.on)return 'cut'}catch(e){}
 try{if(QCUT.on())return 'qcut'}catch(e){}
 try{if(window.TUT&&TUT.busy&&TUT.busy())return 'tut'}catch(e){}
 try{if(typeof playerMovementBlocked==='function'&&playerMovementBlocked())return 'ui'}catch(e){}
 try{const p=GHOST.status().phase;if(p&&p!=='idle'&&p!=='done')return 'ghost';if(GHOST.streetBusy&&GHOST.streetBusy())return 'ghostStreet'}catch(e){}
 try{const b=document.body.classList;if(b.contains('ykBusy')||b.contains('ykOver'))return 'yk'}catch(e){}
 try{const w=$('wdOv');if(w&&w.classList.contains('on'))return 'ward'}catch(e){}
 try{const d=$('ykDlg');if(d&&d.classList.contains('on'))return 'ykdlg'}catch(e){}
 try{const s=CEOScene.dbg().st;if(s&&s.active&&(s.trans||s.ride||s.sleep||s.talk||s.pickTarget))return 'sceneChange';
  if(s&&s.active&&s.s&&s.s.phase&&['pick','ride','board','bus'].indexOf(s.s.phase)>=0)return 'sceneChange'}catch(e){}
 try{if(window.REL&&REL.scene&&REL.scene.isOn&&REL.scene.isOn()&&REL.scene.state&&REL.scene.state().busy)return 'rel'}catch(e){}
 try{if($('evModal'))return 'ev'}catch(e){}
 return '';
}

/* ---------------------------------------------------------------- เสียง (ระบบเสียงผีเดิม) */
const AU=()=>{try{return GHOST.audio}catch(e){return null}};
function sfx(name){
 const a=AU();if(!a)return;
 try{
  if(name==='silence'){a.ambStop();return}
  if(name==='wind')return a.wind();
  if(name==='buzz')return a.buzz();
  if(name==='creak')return a.creak();
  if(name==='appear')return a.appear();
  if(name==='scare')return a.scare();
  const c=a.actx();if(!c)return;const t=c.currentTime,v=a.vol();
  if(name==='heart'){a.osc(c,t,.14,'sine',72,38,.22*v,220);a.osc(c,t+.2,.16,'sine',66,34,.18*v,220)}
  if(name==='laugh'){[[430,0],[240,.06],[150,.12]].forEach(z=>{for(let i=0;i<7;i++)a.osc(c,t+z[1]+i*.27,.2,'sawtooth',z[0]*(1.08-i*.025),z[0]*.62,.04*v,1100)});a.noise(c,t,2.2,.03*v,'bandpass',900,300,2)}
 }catch(e){}
}

/* ---------------------------------------------------------------- คัตซีน THE THREE GHOSTS */
const W=640,HGT=360;
let flags={};
const ST=()=>{try{return QCUT.state()}catch(e){return null}};
const tNow=()=>{const s=ST();return s?s.t:0};
const U=d=>Math.min(1,tNow()/d);
const ease=k=>1-Math.pow(1-Math.max(0,Math.min(1,k)),2);
function once(n,f){const s=ST();const k=(s?s.i:-1)+':'+n;if(flags[k])return;flags[k]=1;f()}
function room(C,flick){
 const g=C.g();C.wall(214,'#150c14');C.floor(214,'#221320','#1c0f1b');C.win(60,50,120,90,['#050208','#1a0a1a']);C.lamp(330,40,flick>.3);C.desk(120,208,170,'#2e1a22');
 C.tint('#2a0008',.16);
}
function flickLevel(t){ // 0..1 (1 = สว่าง) กะพริบเร็วขึ้นเรื่อย ๆ
 if(t<1.2)return 1-t*.1;
 const k=Math.sin(t*(18+t*8))+Math.sin(t*41.3);return k>.2?.85:(k>-.7?.25:.05);
}
const CEOX=320,CEOY=330,CEOH=230;
function ghosts(C,o){ // o: {a1,a2,a3,x2,x3,y1,h}
 const g=C.g();
 if(o.a1>0){C.aura(320,230,120,'rgba(200,10,30,'+(.25*o.a1)+')');C.ghost(320,o.y1||300,215,'classic',o.a1)}
 return g;
}
function DEF(){return[
 // ตัดเป็นฉากดำก่อน ไม่ให้เห็นผู้เล่นแว็บเดียวก่อนคัตซีนเริ่ม (เสียงบรรยากาศเริ่มค่อย ๆ หาย)
 {d:1.4,cap:'',fn:C=>{const g=C.g();once('sil0',()=>sfx('silence'));g.fillStyle='#000';g.fillRect(-W,-HGT,W*3,HGT*3)}},
 // SCENE 1 · THE SILENCE
 {d:5.2,cap:'*|…เสียงรอบตัวค่อย ๆ หายไป ความเงียบกดทับห้องทั้งห้อง',cam:[1,1.55,320,190,320,235],fn:C=>{
   const t=tNow(),f=flickLevel(t);once('sil',()=>sfx('silence'));once('w1',()=>sfx('wind'));
   if(t>1.3)once('b1',()=>sfx('buzz'));if(t>2.6)once('b2',()=>sfx('buzz'));if(t>3.9)once('b3',()=>sfx('buzz'));if(t>3.4)once('h',()=>sfx('heart'));if(t>4.3)once('h2',()=>sfx('heart'));
   room(C,f);const tr=t>2.4?Math.sin(t*50)*1.6:0;C.npc('ceo',CEOX+tr,CEOY,CEOH);
   C.tint('#000',.28+.55*(1-f));C.vig(.6+.2*U(5.2))}},
 // SCENE 2 · FIRST GHOST (กล้องตัดไปที่ตำแหน่งผี)
 {d:3.8,cap:'*|…มีบางอย่างยืนอยู่ด้านหลังคุณ',cam:[1.35,1.6,330,215,320,205],fn:C=>{
   const t=tNow(),f=flickLevel(t+3);once('sc',()=>sfx('scare'));once('ap',()=>sfx('appear'));
   room(C,f);const a=Math.min(1,t/.6);C.aura(320,230,130,'rgba(220,10,30,'+(.28*a)+')');C.ghost(320,302,225,'classic',a*.92);
   C.npc('ceo',CEOX-8,CEOY,CEOH);C.flash(Math.max(0,1-t/.22)*.9);C.tint('#000',.35);C.vig(.8)}},
 // SCENE 3 · SECOND GHOST (ผีสาวกิโมโนเคลื่อนเข้าหา)
 {d:4.2,cap:'*|หญิงสาวในกิโมโนค่อย ๆ ลอยเข้ามา…',cam:[1.1,1.25,150,215,250,215],fn:C=>{
   const t=tNow(),k=ease(t/3.6);once('ap',()=>sfx('appear'));once('wd',()=>sfx('wind'));if(t>2.6)once('h',()=>sfx('heart'));
   room(C,.5);C.aura(320,230,120,'rgba(200,10,30,.2)');C.ghost(320,302,215,'classic',.85);
   const x=60+k*180;C.aura(x,230,100,'rgba(255,60,120,.25)');C.ghost(x,CEOY,222,'girl',Math.min(.9,t/.7));
   C.npc('ceo',CEOX,CEOY,CEOH);C.tint('#000',.32);C.vig(.8)}},
 // SCENE 4 · THIRD GHOST (ผีซอมบี้เดินเข้ามาช้า ๆ · กล้องเห็นทั้งสาม)
 {d:4.4,cap:'*|เสียงฝีเท้าลากพื้นดังขึ้น… ผีทั้งสามอยู่ในห้องเดียวกันแล้ว',cam:[1.28,1,330,200,320,185],fn:C=>{
   const t=tNow(),k=ease(t/3.8);once('ap',()=>sfx('appear'));once('c',()=>sfx('creak'));once('h',()=>sfx('heart'));if(t>2.2)once('h2',()=>sfx('heart'));
   room(C,.45);C.aura(320,230,120,'rgba(200,10,30,.22)');C.ghost(320,302,215,'classic',.85);
   C.aura(240,230,90,'rgba(255,60,120,.2)');C.ghost(240,CEOY,222,'girl',.9);
   const x=600-k*200;C.aura(x,230,90,'rgba(120,230,120,.2)');C.ghost(x,CEOY,226,'zombie',Math.min(.92,t/.7));
   C.npc('ceo',CEOX,CEOY,CEOH);C.tint('#000',.3-.06*k);C.tint('#6a0010',.1+.14*k);C.vig(.8)}},
 // SCENE 5 · THE LAST MOMENT (ล้อม → ถอยไม่พ้น → ประชิด → ภาพมืด → หายไป)
 {d:7.4,cap:'*|ไม่มีทางหนีอีกแล้ว…',cam:[1.0,1.7,320,190,320,235],fn:C=>{
   const t=tNow(),k=ease(t/4.2),g=C.g();if(t>.2)once('h',()=>sfx('heart'));if(t>1.2)once('h2',()=>sfx('heart'));if(t>2.2)once('h3',()=>sfx('heart'));if(t>3.2)once('h4',()=>sfx('heart'));
   const gone=t>5.0;
   room(C,.4);C.tint('#6a0010',.2);
   const xl=240+k*34,xr=400-k*34,yc=302+k*8;
   if(!gone){C.aura(320,230,150,'rgba(220,10,30,'+(.25+.2*k)+')');
    C.ghost(320,yc,215+k*10,'classic',.9);C.ghost(xl,CEOY,222,'girl',.92);C.ghost(xr,CEOY,226,'zombie',.92);
    // CEO พยายามถอยหนี แต่ติดขอบวง
    const jit=Math.sin(t*14)*3*(1-Math.abs(.5-k)*0);const cx=CEOX+(t<3.6?Math.sin(t*3.1)*6:jit),sc=1-k*.045;
    const fade=t>4.1?Math.max(0,1-(t-4.1)/.9):1;C.npc('ceo',cx,CEOY+k*3,CEOH*sc,{a:fade});
   }
   // ภาพมืด: ค่อย ๆ ดำลงตอนประชิด แล้วมืดวาบก่อนหาย
   const dk=t<3.6?0:Math.min(1,(t-3.6)/1.4);C.tint('#000',dk*.85);
   if(t>4.8&&t<5.15)C.tint('#000',1);
   if(t>5.0)once('gone',()=>{});
   if(t>5.2){const a2=Math.max(0,.55-(t-5.2)*.2);C.tint('#000',.55);C.aura(320,250,90,'rgba(150,10,25,'+a2+')')}
   C.vig(.85)}},
 // กล้องค้างที่ที่ CEO เคยยืน · เสียงหัวเราะ · ภาพมืดสนิท
 {d:5.6,cap:'*|…ฮะ ฮะ ฮะ ฮะ…',cam:[1.75,1.75,320,250,320,250],fn:C=>{
   const t=tNow(),g=C.g();once('l',()=>sfx('laugh'));
   room(C,.12);C.tint('#000',.6);C.aura(320,262,80+Math.sin(t*4)*10,'rgba(140,8,22,'+Math.max(0,.4-t*.07)+')');
   g.save();g.globalAlpha=Math.max(0,.5-t*.12);g.fillStyle='#000';g.beginPath();g.ellipse(320,CEOY+2,60,10,0,0,Math.PI*2);g.fill();g.restore();
   const f=Math.max(0,Math.min(1,(t-2.4)/2.8));g.globalAlpha=f;g.fillStyle='#000';g.fillRect(-W,-HGT,W*3,HGT*3);g.globalAlpha=1}},
 // SCENE 6 · END (เงียบสนิท)
 {d:2.4,cap:'',fn:C=>{const g=C.g();g.fillStyle='#000';g.fillRect(-W,-HGT,W*3,HGT*3)}}
]}
function registerDefs(){try{QCUT.defs.hx_ending={id:'hx_ending',title:'HORROR ENDING · THE THREE GHOSTS',shots:DEF(),end:1}}catch(e){console.error('[horror] defs',e)}}

/* ---------------------------------------------------------------- ลำดับสถานะ */
function setSt(s){const h=H();h.state=s;sv()}
let watch=0,readyN=0,running=false;
function tryStart(){
 const h=H();
 if(!h.unlocked||!h.pendingStart||h.cinematicPlayed||h.endingCompleted||running)return;
 if(busyNow()){readyN=0;return}
 if(++readyN<6)return;                       // ต้องพร้อมต่อเนื่อง ~1.5 วิ ก่อนตัดเข้า
 readyN=0;startCinematic();
}
function startCinematic(){
 const h=H();
 h.pendingStart=false;h.cinematicPlayed=true;h.state='CINEMATIC_RUNNING';sv();   // ตั้งธงก่อน → โหลดเซฟกลางคัตซีนจะไม่เล่นซ้ำ
 running=true;flags={};registerDefs();
 document.body.classList.add('hxBusy');
 let ok=false;try{ok=QCUT.play('hx_ending',()=>afterCinematic(),{force:1})}catch(e){console.error('[horror]',e)}
 if(!ok)setTimeout(afterCinematic,60);
}
function afterCinematic(){
 const h=H();
 if(h.state!=='CINEMATIC_RUNNING')return;
 running=false;
 try{GHOST.audio.ambStop()}catch(e){}
 h.state='ENDING_SCREEN';h.endingCompleted=true;
 S.over=1;S.badSeen=1;                       // กันเกมเดิมเล่น BAD/เกมโอเวอร์ซ้อน
 sv();showEnding();
}

/* ---------------------------------------------------------------- หน้าจอ HORROR ENDING */
let endEl=null,raf=0;
function drawGhosts(){
 const cv=$('hxCv');if(!cv)return;const g=cv.getContext('2d'),T=performance.now()/1000;
 g.clearRect(0,0,cv.width,cv.height);g.imageSmoothingEnabled=false;
 let ks;try{ks=GHOST.kinds()}catch(e){ks=null}
 const spots=[['girl',.22,.9,1],['classic',.5,1,1.12],['zombie',.78,.9,1]];
 spots.forEach(z=>{const K=ks&&ks[z[0]];if(!K||!K.spr||!K.spr.complete||!K.spr.naturalWidth)return;
  const row=K.rows[0]||0,dh=cv.height*.9*z[3],dw=dh*K.cw/K.ch,bob=Math.sin(T*1.3+z[1]*9)*6,x=cv.width*z[1];
  const off=document.createElement('canvas');off.width=Math.ceil(dw);off.height=Math.ceil(dh);const o=off.getContext('2d');o.imageSmoothingEnabled=true;
  o.drawImage(K.spr,0,row*K.ch,K.cw,K.ch,0,0,off.width,off.height);
  o.globalCompositeOperation='source-in';o.fillStyle='#14000a';o.fillRect(0,0,off.width,off.height);   // เงาดำอมแดง
  g.save();g.shadowColor='rgba(190,10,26,.9)';g.shadowBlur=26;g.globalAlpha=.78+.18*Math.sin(T*2+z[1]*7);
  g.drawImage(off,x-dw/2,cv.height-dh+bob+6);g.restore();
 });
 raf=requestAnimationFrame(drawGhosts);
}
function showEnding(preview){
 if(!endEl){
  endEl=document.createElement('div');endEl.id='hxEnd';endEl.setAttribute('role','dialog');endEl.setAttribute('aria-label','HORROR ENDING');
  endEl.innerHTML='<div class="hxFog"></div><div class="hxFog b"></div><canvas id="hxCv" width="520" height="300"></canvas>'+
   '<div class="hxIn"><div class="hxK">HORROR ENDING</div><div class="hxS">THE THREE GHOSTS</div>'+
   '<div class="hxQ">“คุณหนีไม่พ้นอีกต่อไป”</div>'+
   '<div class="hxT">เสียงฝีเท้าสามคู่ดังขึ้นในความมืด... และไม่มีใครได้พบ CEO อีกเลย</div>'+
   '<div class="hxG">GAME OVER</div>'+
   '<div class="hxB"><button type="button" class="hxBtn" id="hxNew">NEW GAME</button> <button type="button" class="hxBtn" id="hxPvX" style="display:none;margin-left:10px">ปิดตัวอย่าง (Test)</button></div></div>';
  document.body.appendChild(endEl);
  $('hxNew').onclick=newGame;
  $('hxPvX').onclick=()=>{endEl.classList.remove('on');endEl.style.display='none'};
 }
 if(preview===true){endEl.style.display='';endEl.classList.remove('on');void endEl.offsetWidth;endEl.classList.add('on');$('hxPvX').style.display='';$('hxNew').style.display='none';if(!raf)raf=requestAnimationFrame(drawGhosts);return true}
 endEl.style.display='';$('hxPvX').style.display='none';$('hxNew').style.display='';
 document.body.classList.remove('hxBusy');document.body.classList.add('hxOver');
 try{S.paused=1}catch(e){}
 endEl.classList.add('on');
 if(!raf)raf=requestAnimationFrame(drawGhosts);
 const h=H();if(h.state!=='GAME_OVER'){h.state='GAME_OVER';sv()}
}
async function newGame(){
 const msg='เริ่มเกมใหม่?\nระบบจะเปิดหน้าสร้างตัวละครใหม่ตั้งแต่ต้น (ตัวนับและฉากจบของเซฟนี้จะเริ่มจาก 0) และเซฟปัจจุบันจะถูกแทนที่';
 let ok=false;try{ok=await window.gameConfirm(msg,'เริ่มเกมใหม่')}catch(e){ok=confirm(msg)}
 if(!ok)return false;
 try{A.reset(1)}catch(e){location.reload()}
 return true;
}

/* ---------------------------------------------------------------- ตัวนับลับ ??? / 50 (หน้า CEO PROFILE) */
function counterHTML(){const n=Math.max(0,Math.min(NEED,H().ghostCaptureCount));return '<div class="hxCnt" aria-hidden="true">☠ <b>'+String(n).padStart(2,'0')+'</b> / '+NEED+'</div>'}
function refreshCounter(){
 try{const side=$('rpSide');if(!side)return;
  const old=side.querySelector('.hxCnt');
  if(!okS())return;
  const html=counterHTML();
  if(old){if(old.outerHTML!==html)old.outerHTML=html}else side.insertAdjacentHTML('beforeend',html)}catch(e){}
}
function watchProfile(){
 const side=$('rpSide');if(!side||watchProfile.done)return;watchProfile.done=1;
 new MutationObserver(()=>{if(!side.querySelector('.hxCnt'))refreshCounter()}).observe(side,{childList:true});
}

/* ---------------------------------------------------------------- วงจรหลัก */
function tick(){
 if(!okS())return;
 try{watchProfile()}catch(e){}
 const h=H();
 if(!tick.init){
  tick.init=1;   // กู้สถานะครั้งเดียวหลังโหลดเซฟ — ไม่เริ่มคัตซีนซ้ำ
  if(h.state==='CINEMATIC_RUNNING'||h.state==='ENDING_SCREEN'||h.state==='GAME_OVER'||h.endingCompleted){h.cinematicPlayed=true;h.endingCompleted=true;h.pendingStart=false;S.over=1;S.badSeen=1;showEnding();return}
  if(h.unlocked&&!h.cinematicPlayed){h.pendingStart=true;h.state='PENDING_CINEMATIC'}
 }
 refreshCounter();
 tryStart();
}
function previewCin(){registerDefs();flags={};try{return QCUT.play('hx_ending',()=>{},{force:1})}catch(e){console.error(e);return false}}
function testSet(n){const h=H();const t=Math.max(0,Math.min(NEED-1,Math.floor(n)||0));
 const per=Math.floor(t/3),rem=t%3;h.ghostCaptureByType={ghost1:per+(rem>0?1:0),kimonoGhost:per+(rem>1?1:0),zombieGhost:per};
 h.ghostCaptureCount=t;h.unlocked=false;h.pendingStart=false;h.cinematicPlayed=false;h.endingCompleted=false;h.state=t>0?'COUNTING':'LOCKED';
 try{if(S.over&&!(S.money<-10000))S.over=0}catch(e){}
 running=false;try{document.body.classList.remove('hxOver','hxBusy')}catch(e){}if(endEl){endEl.classList.remove('on');endEl.style.display='none'}
 sv();refreshCounter();return h.ghostCaptureCount}
window.HXE={
 previewCin,previewScreen:()=>showEnding(true),testSet,
 status:()=>JSON.parse(JSON.stringify(H())),
 onCaught,tick,busyNow,showEnding,newGame,
 counterText:()=>{const e=document.querySelector('#rpSide .hxCnt');return e?e.textContent:null},
 _defs:()=>{registerDefs();return QCUT.defs.hx_ending.shots.length}
};
setInterval(tick,250);
})();
