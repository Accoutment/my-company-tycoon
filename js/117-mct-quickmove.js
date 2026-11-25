
/* =====================================================================
 * QUICK MOVE — ลดเวลาเดินทางในฉาก CEO
 *   1) วิ่ง (Sprint): ถือ Shift (PC) หรือแตะปุ่ม 🏃 (มือถือ) → เดินเร็วขึ้น ×1.6
 *   2) เร่งเฟด/เดินข้ามพื้นที่ ×1.7 เฉพาะ transition ย้ายพื้นที่ (ไม่แตะคัตซีน/บันได/ขึ้นบัส)
 *   3) วาร์ปด่วน: ปุ่ม 🗺 วาร์ป → ไปพื้นที่ที่ "เคยไปแล้ว" (ปลดล็อกตอนเข้าครั้งแรก · เก็บใน S.qm.v)
 *  ไม่เปลี่ยนโครงสร้างเซฟเดิม: เพิ่มเฉพาะ S.qm = {v:{place:1}} (เซฟเก่าไม่มี → สร้างเอง)
 * ===================================================================== */
(function(root){
'use strict';
if(root.QM)return;
const CS=()=>{try{return CEOScene.dbg().st}catch(e){return null}};
const CTX=()=>root.__CEO_CTX;
const LS=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}};
const toast=m=>{try{CTX().toast(m)}catch(e){}};
const MULT=1.6,TK=1.7;

/* ---------- 1) วิ่ง ---------- */
let runOn=LS('mct_run')==='1',shift=false;
function spd(){return(shift||runOn)?MULT:1}
addEventListener('keydown',e=>{if(e.key==='Shift')shift=true},true);
addEventListener('keyup',e=>{if(e.key==='Shift')shift=false},true);
addEventListener('blur',()=>{shift=false});
function setRun(v){runOn=!!v;LS('mct_run',runOn?'1':'0');paintRun()}

/* ---------- 2) เร่ง transition ย้ายพื้นที่ ---------- */
const FAST=new Set(['arrive','walkPath','farmLeave','farmEnter','crossLeave','carstLeave','aqstLeave','beachLeave','csLeaveR','farmLeaveL',
 'dpEnter','dpLeaveF','dpToForest','dpExitCave','dpLv','frBack','frLeaveL','frUp','ncLeaveL','ncLeaveR','stLeaveR']);
function tk(type){return FAST.has(type)?TK:1}

/* ---------- 3) วาร์ปด่วน ---------- */
const PLACES=[['street','🏢','ถนนหน้าบริษัท'],['beach','🏖️','ชายหาด / ท่าเรือ'],['cross','🚦','สี่แยก'],['farm','🌾','ไร่'],
 ['carst','🚗','ถนนโชว์รูม'],['aqst','🐠','ถนนอควาเรียม'],['cardst','🃏','ถนนร้านการ์ด'],['snkst','🎱','ถนนสนุกเกอร์'],
 ['ncst','🎶','NICECLUB'],['stst','🚉','สถานีรถไฟ'],['frst','🌲','ป่าแม่น้ำ'],['dpfr','🌲','ป่าลึก'],['cave','⛏','ถ้ำเหมือง']];
const getS=()=>{try{return S}catch(e){return null}};
function qs(){const s=getS();if(!s)return {v:{street:1}};if(!s.qm||typeof s.qm!=='object')s.qm={};if(!s.qm.v||typeof s.qm.v!=='object')s.qm.v={};s.qm.v.street=1;return s.qm}
function visit(place){
 try{const q=qs();if(!q.v[place]){q.v[place]=1;if(PLACES.some(p=>p[0]===place))try{root.save&&root.save(1)}catch(e){}}}catch(e){}}
const visited=()=>Object.assign({},qs().v);
function canWarp(){
 const s=CS();if(!s||!s.active||s.mode!=='scene')return false;
 if(s.place==='condo'||s.place==='ride')return false;   // คอนโด: ไม่มีปุ่มวาร์ป (ใช้โทรเรียกรถในห้องแทน)
 if(s.trans||s.talk||s.sleep||s.fish||s.ride||s.pickTarget)return false;
 try{if(typeof OS!=='undefined'&&OS&&OS.on)return false}catch(e){}
 const hid=id=>{const e=document.getElementById(id);return !e||e.hidden||getComputedStyle(e).display==='none'};
 return hid('ceoBag')&&hid('dpShop')&&hid('dpDef')&&hid('menu')&&hid('ceoSceneChoices');
}
let panelOpen=false,froze=false;
function css(){if(document.getElementById('qmCss'))return;const c=document.createElement('style');c.id='qmCss';
 c.textContent='#qmSkip{position:fixed;z-index:191;right:14px;bottom:18px;font:700 14px inherit;border-radius:20px;border:2px solid #ffd45a;color:#ffe9a0;background:rgba(24,30,46,.88);padding:8px 16px;cursor:pointer;touch-action:manipulation}#qmSkip[hidden]{display:none}'+
 '#qmRun,#qmWarpBtn{position:fixed;z-index:191;font:700 13px inherit;border-radius:8px;border:2px solid #ffd45a;color:#1a1a22;background:#e0a82e;cursor:pointer;padding:0 10px;min-height:34px;touch-action:manipulation;white-space:nowrap}'+
 '#qmRun{border-radius:22px;min-width:64px;min-height:40px;background:rgba(24,30,46,.88);color:#ffe9a0;box-shadow:0 3px 8px #0008}#qmRun.on{background:#e0a82e;color:#1a1a22}#qmRun[hidden],#qmWarpBtn[hidden]{display:none}'+
 '#qmPanel{position:fixed;inset:0;z-index:99990;background:rgba(6,8,18,.74);display:flex;align-items:center;justify-content:center;font-family:inherit}#qmPanel[hidden]{display:none}'+
 '.qmP{width:min(560px,96vw);max-height:92vh;overflow:auto;background:#1d1a2c;border:2px solid #f2b632;border-radius:12px;padding:12px;color:#f3efe2;box-shadow:0 10px 40px #000a}'+
 '.qmH{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}.qmH h3{margin:0;font-size:17px;color:#ffd978}.qmH button{background:#3a3558;color:#fff;border:1px solid #6a6490;border-radius:7px;padding:5px 10px;cursor:pointer;font-size:13px}'+
 '.qmN{font-size:12px;color:#aab;margin:0 0 8px}.qmG{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}'+
 '.qmB{display:flex;align-items:center;gap:8px;background:#2a2640;border:1px solid #4a4470;border-radius:8px;padding:9px 10px;color:#fff;cursor:pointer;font-size:14px;text-align:left;min-height:44px}.qmB b{font-weight:700}.qmB small{display:block;color:#9aa;font-size:11px}'+
 '.qmB:hover:not([disabled]){border-color:#f2b632;background:#35305a}.qmB[disabled]{opacity:.5;cursor:not-allowed}.qmB.here{border-color:#7fe08a;opacity:1}.qmB.here small{color:#7fe08a}.qmE{font-size:22px;width:28px;text-align:center}'+
 '#qmFade{position:fixed;inset:0;z-index:99999;background:#000;opacity:0;pointer-events:none;transition:opacity .16s linear}';
 document.head.appendChild(c)}
function ui(){
 if(document.getElementById('qmWarpBtn'))return;css();
 const w=document.createElement('button');w.id='qmWarpBtn';w.type='button';w.hidden=true;w.textContent='🗺 วาร์ป';w.title='วาร์ปด่วนไปที่ที่เคยไปแล้ว';
 w.addEventListener('click',e=>{e.stopPropagation();open()});w.addEventListener('pointerdown',e=>e.stopPropagation());document.body.appendChild(w);
 const r=document.createElement('button');r.id='qmRun';r.type='button';r.hidden=true;r.title='วิ่ง (ถือ Shift ก็ได้)';
 r.addEventListener('click',e=>{e.stopPropagation();setRun(!runOn)});r.addEventListener('pointerdown',e=>e.stopPropagation());document.body.appendChild(r);paintRun();
 const k=document.createElement('button');k.id='qmSkip';k.type='button';k.hidden=true;k.textContent='ข้าม ⏭';k.addEventListener('click',e=>{e.stopPropagation();skipRide()});k.addEventListener('pointerdown',e=>e.stopPropagation());document.body.appendChild(k);
 const p=document.createElement('div');p.id='qmPanel';p.hidden=true;p.addEventListener('pointerdown',e=>{if(e.target===p)close()});document.body.appendChild(p);
 const f=document.createElement('div');f.id='qmFade';document.body.appendChild(f)}
function paintRun(){const r=document.getElementById('qmRun');if(!r)return;r.textContent=runOn?'🏃 วิ่ง: เปิด':'🏃 วิ่ง';r.classList.toggle('on',runOn)}
function render(){
 const p=document.getElementById('qmPanel');if(!p)return;const v=visited(),cur=(CS()||{}).place;
 let h='<div class="qmP"><div class="qmH"><h3>🗺 วาร์ปด่วน</h3><button onclick="QM.close()">ปิด ✕</button></div><p class="qmN">ไปพื้นที่ที่เคยไปแล้ว · พื้นที่ใหม่จะปลดล็อกเมื่อเดินไปถึงครั้งแรก</p><div class="qmG">';
 PLACES.forEach(pl=>{const ok=!!v[pl[0]],here=pl[0]===cur;
  h+='<button class="qmB'+(here?' here':'')+'" '+((ok&&!here)?'':'disabled')+' onclick="QM.warp(\''+pl[0]+'\')"><span class="qmE">'+(ok?pl[1]:'🔒')+'</span><span><b>'+pl[2]+'</b><small>'+(here?'📍 อยู่ที่นี่':ok?'แตะเพื่อวาร์ป':'ยังไม่เคยไป')+'</small></span></button>'});
 p.innerHTML=h+'</div></div>'}
function open(){
 if(panelOpen||!canWarp())return;ui();const s=CS();s.keys={};s.moving=0;try{if(root.JOY){JOY.x=0;JOY.y=0}}catch(e){}
 froze=!s.talk;if(froze)s.talk={boss:1,acts:[],qm:1};panelOpen=true;render();document.getElementById('qmPanel').hidden=false}
function close(){
 const p=document.getElementById('qmPanel');if(p)p.hidden=true;panelOpen=false;
 const s=CS();if(froze&&s&&s.talk&&s.talk.qm)s.talk=null;froze=false}
addEventListener('keydown',e=>{if(panelOpen&&e.key==='Escape'){e.stopPropagation();e.preventDefault();close()}},true);
let pendFrom=null;
function arrive(pl){   // เรียกจาก finishRide() ตอนรถถึงที่หมาย
 const s=CS(),from=pendFrom;pendFrom=null;
 try{
  if(from==='cave'){const rt=root.DEEP_SCENE&&DEEP_SCENE.rt;if(rt&&rt.R.cave.lv>1)rt.resetRun();if(rt)rt.R.cave.lv=1}
  if(pl==='cave'&&root.DEEP_SCENE)DEEP_SCENE.rt.R.cave.lv=1;
  CEOScene.enter(pl,{from:'warp'});
  const n=PLACES.find(p=>p[0]===pl);toast('🗺 ถึง '+(n?n[2]:pl)+' แล้ว');
 }catch(e){console.error(e);toast('วาร์ปไม่สำเร็จ')}
}
function warp(pl,instant){
 if(!PLACES.some(p=>p[0]===pl)||!visited()[pl]){toast('🔒 ยังไม่เคยไปที่นั่น');return false}
 const s=CS();if(!s||s.place===pl)return false;
 if(panelOpen)close();
 if(!canWarp())return false;
 const go=()=>{try{
   if(s.place==='cave'){const rt=root.DEEP_SCENE&&DEEP_SCENE.rt;if(rt&&rt.R.cave.lv>1)rt.resetRun();if(rt)rt.R.cave.lv=1}   // ออกจากชั้นลึก = ไม่เซฟเหมือนขึ้นบันได
   if(pl==='cave'&&root.DEEP_SCENE)DEEP_SCENE.rt.R.cave.lv=1;
   CEOScene.enter(pl,{from:'warp'});
  }catch(e){console.error(e);toast('วาร์ปไม่สำเร็จ')}};
 if(instant){go();return true}
 // วาร์ปจริง: รถ (รถที่ผู้เล่นมี หรือรถเมล์) มารับ → ขับไป → ส่งที่หมาย
 try{
  if(typeof CEOScene!=='undefined'&&CEOScene.startRide){
   const c=root.CARX&&CARX.cur&&CARX.cur(),n=PLACES.find(p=>p[0]===pl);
   pendFrom=s.place;
   CEOScene.startRide({auto:true,fast:true,to:'qm:'+pl,label:(n?n[2]:pl)});
   const r=s.ride;if(r)r.qm=1;return true}
 }catch(e){console.error(e)}
 ui();const f=document.getElementById('qmFade');f.style.opacity='1';
 setTimeout(()=>{go();setTimeout(()=>{f.style.opacity='0'},120)},170);return true}
function skipRide(){const s=CS(),r=s&&s.ride;if(r&&r.qm&&r.phase==='drive')r.t=1e3}

/* ---------- วางปุ่ม ---------- */
function place(){
 const w=document.getElementById('qmWarpBtn'),r=document.getElementById('qmRun');if(!w||!r)return;
 const s=CS(),sceneOn=!!(s&&s.active&&s.mode==='scene'&&!s.sleep),ok=sceneOn&&canWarp()&&!panelOpen;
 const mb=document.getElementById('sceneMenuBtn'),bb=document.getElementById('ceoSceneBackBtn');
 let ref=mb&&getComputedStyle(mb).display!=='none'?mb:bb,q=ref&&ref.getBoundingClientRect();
 if(ok&&q&&q.width>0){w.hidden=false;w.style.left=Math.round(q.right+8)+'px';w.style.top=Math.round(q.top)+'px';w.style.height=Math.round(q.height||44)+'px'}else w.hidden=true;
 {const k=document.getElementById('qmSkip');if(k)k.hidden=!(s&&s.ride&&s.ride.qm&&s.ride.phase==='drive')}
 const show=sceneOn&&!s.trans&&!panelOpen&&!(s.talk)&&!s.fish;
 const joy=document.getElementById('joy'),jr=joy&&joy.getBoundingClientRect();
 if(show){r.hidden=false;if(jr&&jr.width>0){r.style.left=Math.round(jr.left+4)+'px';r.style.top=Math.round(jr.top-48)+'px';r.style.bottom='auto'}else{r.style.left='14px';r.style.top='auto';r.style.bottom='160px'}}
 else r.hidden=true;
 if(show&&canWarp()&&!LS('mct_run_hint')){LS('mct_run_hint','1');toast('🏃 ถือ Shift หรือแตะปุ่ม "วิ่ง" เพื่อเดินเร็วขึ้น · 🗺 วาร์ป = ไปที่ที่เคยไปแล้ว')}
}
setInterval(()=>{try{ui();place()}catch(e){}},150);

root.QM={spd,tk,visit,visited,warp,arrive,skipRide,open,close,setRun,PLACES,canWarp,state:()=>({run:runOn,shift,open:panelOpen,v:visited()})};
})(typeof window!=='undefined'?window:globalThis);

