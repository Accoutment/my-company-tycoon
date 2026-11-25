
const WD_ASSETS={wsuSheet:window.__CEO_ART.atlas,wsuCard:window.__CEO_ART.wsuit,dragonSheet:window.__CEO_ART.atlas,dragonCard:window.__CEO_ART.dragon};

/* =====================================================================
   CEO WARDROBE SYSTEM · ตู้เสื้อผ้า CEO (โมดูลแยก)
   - สถานะกลาง: S.ceoOutfitId  ('suit' = ชุดเริ่มต้น · 'dragon' = แจ็กเกตมังกรทอง)
   - เปลี่ยนชุดโดยสลับ "แผ่นสไปรต์ CEO" ตัวกลาง (CEOI) และภาพโปรไฟล์ (CEOP)
     ทุกฉากที่วาด CEO (บริษัท/ถนน/คอนโด/ชายหาด/คัทซีน) อ่านจากตัวแปรเดียวกันจึงเปลี่ยนพร้อมกัน
   - เซฟ: เก็บใน S.ceoOutfitId ไปกับ Save เดิม (เซฟเก่าที่ไม่มีค่า → ชุดเริ่มต้น)
   ===================================================================== */
(function(){
'use strict';
const OUT=[
 {id:'suit',name:'สูทดำผู้บริหาร',desc:'ชุดเริ่มต้นของ CEO — เรียบ ขรึม น่าเชื่อถือ',cell:[32,44]},
 {id:'dragon',name:'แจ็กเกตมังกรทอง',desc:'แจ็กเกตดำปักลายมังกรทองด้านหลัง เสื้อเชิ้ตแดงเข้ม สร้อยทอง',req:'yakuza',reqTxt:'ปลดล็อกหลังเข้าร่วมแก๊งยากูซ่า',cell:[64,88]},
 {id:'wsuit',name:'สูทขาวทองไฮโซ',desc:'สูทขาวปักลายทอง เนคไทสีทอง เสื้อเชิ้ตดำ — ชุดของคนที่ VIP ยอมรับ',req:'vip',reqTxt:'ความสัมพันธ์กับ VIP คนใดคนหนึ่งถึง 500',cell:[128,176]}
];
const UNLOCK={
 vip:()=>{try{return !!(window.VIPX&&VIPX.IDS.some(i=>VIPX.aff(i)>=VIPX.CONTACT))}catch(e){return false}},
 yakuza:()=>{try{return !!((S.yk&&(S.yk.st==='ALLIED'||S.yk.joinDay))||(S.codeUnlocks&&S.codeUnlocks.dragon))}catch(e){return false}}
};
const isOpen=o=>!o.req||(UNLOCK[o.req]?UNLOCK[o.req]():true);
const IMG={};      // id → {sheet:Image, card:string}
let orig=null,applied=null,sel=null,ov=null,pv=null,raf=0,tmr=0,inited=false;
const $=id=>document.getElementById(id);
const okS=()=>{try{return typeof S==='object'&&S&&typeof CEOI!=='undefined'}catch(e){return false}};

function boot(){
 if(inited||!okS())return;
 inited=true;
 orig={sheetSrc:CEOI.src,card:CEOP,img:CEOI};
 IMG.suit={get sheet(){return CEOG.sheet()},get card(){return CEOG.card('suit')}};
 IMG.dragon={get sheet(){return CEOG.sheet()},get card(){return CEOG.card('dragon')}};
 IMG.wsuit={get sheet(){return CEOG.sheet()},get card(){return CEOG.card('wsuit')}};
 applied='suit';
 tmr=setInterval(sync,250);
 sync();
}
function wanted(){try{const id=S.ceoOutfitId;const o=OUT.find(x=>x.id===id);return IMG[id]&&o&&isOpen(o)?id:'suit'}catch(e){return 'suit'}}
function sync(){
 if(!okS())return;
 const w=wanted();
 if(w===applied)return;
 const o=IMG[w];if(!o||!o.sheet.complete||!o.sheet.naturalWidth)return;   // รอโหลดก่อน ไม่ให้เกิดเฟรมว่าง
 CEOI=o.sheet;CEOP=o.card;applied=w;
}
function cur(){try{return wanted()}catch(e){return 'suit'}}

/* ---------------------------------------------------------------- UI */
const CSS=`#wdOv{position:fixed;inset:0;z-index:9640;background:rgba(5,8,18,.84);display:none;align-items:center;justify-content:center;padding:10px;font-family:'Noto Sans Thai','Sarabun',system-ui,sans-serif}
#wdOv.on{display:flex}
#wdOv .bx{width:min(640px,100%);max-height:100%;overflow:auto;background:linear-gradient(#18244a,#0f1a33);border:2px solid #c89d4b;border-radius:12px;color:#f5f1e8;padding:12px 14px;box-shadow:0 10px 40px #000a;position:relative}
#wdOv h3{margin:0 0 2px;color:#ffe9a8;font-size:18px}
#wdOv .sub{color:#9aa7c7;font-size:12px;margin-bottom:8px}
#wdOv .x{position:absolute;right:8px;top:8px;width:34px;height:34px;border-radius:8px;border:1px solid #3a4f8f;background:#1d2d5c;color:#ffe9a8;font-size:18px;cursor:pointer}
#wdOv .row{display:flex;gap:12px;align-items:stretch}
#wdOv .pv{flex:0 0 190px;background:radial-gradient(#2a3a6e,#101a36);border:1px solid #3a4f8f;border-radius:10px;padding:8px;text-align:center}
#wdOv canvas#wdPv{width:170px;height:230px;image-rendering:auto;display:block;margin:0 auto}
#wdOv .pn{margin-top:4px;color:#ffe9a8;font-weight:700;font-size:14px}
#wdOv .pd{color:#b9c6e6;font-size:11px;min-height:30px}
#wdOv .ls{flex:1;display:flex;flex-direction:column;gap:6px;min-width:0}
#wdOv .it{display:flex;align-items:center;gap:8px;text-align:left;font:inherit;background:#1d2d5c;color:#f5f1e8;border:2px solid #3a4f8f;border-radius:10px;padding:6px 8px;cursor:pointer;min-height:64px}
#wdOv .it.lk{opacity:.6}
#wdOv .it.lk canvas{filter:brightness(.35) grayscale(.6)}
#wdOv .it.sel{border-color:#ffd45a;background:#2a3d78;box-shadow:0 0 0 2px #ffd45a55 inset}
#wdOv .it canvas{width:44px;height:60px;flex:0 0 44px;background:#0e1730;border-radius:6px}
#wdOv .it b{display:block;font-size:14px}
#wdOv .it small{color:#a7b5da;font-size:11px;line-height:1.25;display:block}
#wdOv .it .tg{display:inline-block;margin-top:2px;font-size:10px;padding:1px 6px;border-radius:8px;background:#2f8f5f;color:#fff}
#wdOv .bt{display:flex;gap:8px;margin-top:10px;justify-content:flex-end;flex-wrap:wrap}
#wdOv .bt button{font:inherit;font-size:14px;border-radius:9px;padding:9px 16px;cursor:pointer;min-height:42px;border:1px solid #3a4f8f;background:#1d2d5c;color:#f5f1e8}
#wdOv .bt button.ok{background:linear-gradient(#e0b04a,#b9882c);color:#2a1a05;font-weight:700;border-color:#ffe08a}
#wdOv .bt button:disabled{opacity:.45;cursor:default}
@media(max-width:520px){#wdOv .row{flex-direction:column}#wdOv .pv{flex:none}#wdOv canvas#wdPv{width:130px;height:176px}#wdOv .bt button{flex:1}}`;

function ensureDom(){
 if(ov)return;
 const st=document.createElement('style');st.id='wdCss';st.textContent=CSS;document.head.appendChild(st);
 ov=document.createElement('div');ov.id='wdOv';ov.setAttribute('role','dialog');ov.setAttribute('aria-label','ตู้เสื้อผ้า CEO');
 ov.innerHTML='<div class="bx"><button class="x" type="button" id="wdX" aria-label="ปิด">✕</button><h3>👔 ตู้เสื้อผ้า CEO</h3><div class="sub">เลือกชุดเพื่อดูตัวอย่างบนโมเดล CEO · กด "ยืนยัน" จึงจะเปลี่ยนชุดจริง</div>'+
  '<div class="row"><div class="pv"><canvas id="wdPv" width="220" height="300"></canvas><div class="pn" id="wdPn"></div><div class="pd" id="wdPd"></div></div><div class="ls" id="wdLs"></div></div>'+
  '<div class="bt"><button type="button" id="wdCancel">ยกเลิก</button><button type="button" class="ok" id="wdOk">ยืนยันเปลี่ยนชุด</button></div></div>';
 document.body.appendChild(ov);
 pv=$('wdPv');
 $('wdX').onclick=close;$('wdCancel').onclick=cancel;$('wdOk').onclick=confirm;
 ov.addEventListener('click',e=>{if(e.target===ov)close()});
 ['keydown','keyup'].forEach(t=>window.addEventListener(t,kb,true));
}
function kb(e){
 if(!isOn())return;
 const k=e.key;
 if(e.type==='keydown'){
  if(k==='Escape'){close()}
  else if(k==='ArrowLeft'||k==='ArrowUp')step(-1);
  else if(k==='ArrowRight'||k==='ArrowDown')step(1);
  else if(k==='Enter'&&document.activeElement&&document.activeElement.tagName==='BUTTON'){return}
  else if(k==='Enter')confirm();
  else return;
 }
 e.preventDefault();e.stopImmediatePropagation();
}
function step(d){const i=OUT.findIndex(o=>o.id===sel);select(OUT[(i+d+OUT.length)%OUT.length].id)}
const isOn=()=>!!(ov&&ov.classList.contains('on'));

function thumb(id,cv){
 const o=OUT.find(x=>x.id===id),im=IMG[id]&&IMG[id].sheet;if(!im||!im.naturalWidth)return;
 const c=cv.getContext('2d'),cw=im.naturalWidth/16,ch=im.naturalHeight/4;
 c.clearRect(0,0,cv.width,cv.height);c.imageSmoothingEnabled=cw>40;c.imageSmoothingQuality='high';
 const s=Math.min(cv.width/cw,cv.height/ch);c.drawImage(im,0,0,cw,ch,(cv.width-cw*s)/2,cv.height-ch*s,cw*s,ch*s);
}
function renderList(){
 const ls=$('wdLs');ls.innerHTML='';
 OUT.forEach(o=>{
  const b=document.createElement('button');b.type='button';b.className='it'+(o.id===sel?' sel':'');b.dataset.id=o.id;
  const lk=!isOpen(o);if(lk)b.classList.add('lk');
  b.innerHTML='<canvas width="88" height="120"></canvas><div><b>'+(lk?'🔒 ':'')+o.name+'</b><small>'+o.desc+'</small>'+(lk?'<span class="tg" style="background:#8f2f3f">🔒 '+o.reqTxt+'</span>':o.id===cur()?'<span class="tg">กำลังสวมอยู่</span>':'')+'</div>';
  b.onclick=()=>select(o.id);ls.appendChild(b);thumb(o.id,b.querySelector('canvas'));
 });
 const o=OUT.find(x=>x.id===sel),lk=!isOpen(o);$('wdPn').textContent=o.name;$('wdPd').textContent=lk?'🔒 '+o.reqTxt:o.desc;
 $('wdOk').disabled=lk||sel===cur();
 $('wdOk').textContent=lk?'🔒 ยังไม่ปลดล็อก':sel===cur()?'สวมชุดนี้อยู่แล้ว':'ยืนยันเปลี่ยนชุด';
}
function select(id){if(!OUT.some(o=>o.id===id))return false;sel=id;renderList();return true}

/* ตัวอย่างโมเดล: หมุนทีละทิศ เดินวนเฟรม (แถว 0 หน้า · 3 ขวา · 1 หลัง · 2 ซ้าย ตามแผ่นสไปรต์ของเกม) */
const ROWS=[0,3,1,2];
function loop(ts){
 if(!isOn()){raf=0;return}
 const im=IMG[sel]&&IMG[sel].sheet;
 if(im&&im.naturalWidth){
  const c=pv.getContext('2d'),cw=im.naturalWidth/16,ch=im.naturalHeight/4,t=ts/1000;
  c.clearRect(0,0,pv.width,pv.height);
  c.fillStyle='rgba(0,0,0,.28)';c.beginPath();c.ellipse(pv.width/2,pv.height-14,52,9,0,0,6.283);c.fill();
  const dir=Math.floor(t/1.7)%4,fr=Math.floor(t*24)%16,s=Math.min((pv.width-20)/cw,(pv.height-24)/ch);
  c.imageSmoothingEnabled=cw>40;c.imageSmoothingQuality='high';
  c.drawImage(im,fr*cw,ROWS[dir]*ch,cw,ch,(pv.width-cw*s)/2,pv.height-14-ch*s+4,cw*s,ch*s);
 }
 raf=requestAnimationFrame(loop);
}

function open(){
 if(!okS())return false;
 boot();ensureDom();
 if(isOn())return true;
 sel=cur();
 try{const sc=CEOScene.dbg().st;if(sc)sc.keys={}}catch(e){}
 try{if(window.JOY){JOY.x=0;JOY.y=0}}catch(e){}
 renderList();ov.classList.add('on');
 if(!raf)raf=requestAnimationFrame(loop);
 return true;
}
function close(){if(!ov)return false;ov.classList.remove('on');sel=cur();return true}
function cancel(){sel=cur();return close()}   // ยกเลิก = กลับไปใช้ชุดเดิม (ไม่แตะชุดจริง)
function confirm(){
 if(!isOn()||!sel||sel===cur())return false;
 if(!isOpen(OUT.find(o=>o.id===sel)))return false;
 S.ceoOutfitId=sel;
 sync();
 try{save(1)}catch(e){}
 try{toast('👔 เปลี่ยนเป็น "'+OUT.find(o=>o.id===sel).name+'" แล้ว')}catch(e){}
 close();return true;
}

window.WARD={open,close,cancel,confirm,select,
 outfits:()=>OUT.map(o=>({id:o.id,name:o.name,unlocked:isOpen(o)})),
 status:()=>({cur:okS()?cur():null,applied,sel,on:isOn(),sheet:okS()?[CEOI.naturalWidth,CEOI.naturalHeight]:null}),
 apply:sync};
const bt=setInterval(()=>{if(okS()){boot();clearInterval(bt)}},200);
})();
