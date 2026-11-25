
/* =====================================================================
   PHONE · มือถือ CEO (โมดูลแยก) — ซื้อจากเมนูเฟอร์นิเจอร์ (หมวดสร้าง) ครั้งเดียว · S.phone.owned
   หลังซื้อ จะมีปุ่ม 📱 บนหน้าจอทุกฉาก · เปิดหน้าต่าง MY OS เดิมในโหมดมือถือ: เฉพาะ HR · ค่าน้ำไฟ · Contact
   ===================================================================== */
(function(){
'use strict';
const PRICE=3500,APPS=['bills','hr','contact'];
const $=id=>document.getElementById(id);
const okS=()=>{try{return typeof S==='object'&&S&&Array.isArray(S.emp)&&typeof OS==='object'}catch(e){return false}};
const owned=()=>{try{return !!(S.phone&&S.phone.owned)}catch(e){return false}};
let btn=null;
function shopCard(){
 const o=owned();
 return '<div class="c"><b>📱 มือถือ</b><br><small>โทรศัพท์พกพา ใช้ได้ทุกฉาก · มีแอป HR · ค่าน้ำไฟ · Contact เท่านั้น · ซื้อได้ครั้งเดียว</small><br><button class="btn" '+(o?'disabled':'')+' onclick="PHN.buy()">'+(o?'ซื้อแล้ว ✔':'ซื้อ '+(typeof M==='function'?M(PRICE):'$'+PRICE))+'</button></div>';
}
function buy(){
 if(!okS()||owned())return;
 if(S.money<PRICE)return toast('เงินไม่พอซื้อมือถือ');
 S.money-=PRICE;try{S.today.eq=(S.today.eq||0)+PRICE}catch(e){}
 S.phone={owned:true,day:S.day};
 try{log('📱 ซื้อมือถือ '+(typeof M==='function'?M(PRICE):PRICE))}catch(e){}
 try{save(1)}catch(e){}
 try{hud()}catch(e){}try{show()}catch(e){}
 toast('📱 ซื้อมือถือแล้ว · ปุ่มมือถืออยู่บนหน้าจอทุกฉาก');
 refresh();
}
function ensureBtn(){
 if(btn)return;
 btn=document.createElement('button');btn.id='phnBtn';btn.type='button';btn.title='มือถือ';
 btn.innerHTML='<img alt="" draggable="false" src="assets/img/246fd28da912.png"><i>!</i><small>มือถือ</small>';
 btn.onclick=e=>{e.stopPropagation();open()};
 document.body.appendChild(btn);
}
function blocked(){
 try{if(S.over)return true}catch(e){}
 try{if(window.QCUT&&QCUT.on())return true}catch(e){}
 try{if(document.body.classList.contains('ykBusy')||document.body.classList.contains('ykOver'))return true}catch(e){}
 try{const l=$('lobby');if(l&&getComputedStyle(l).display!=='none')return true}catch(e){}
 try{if(window.TUT&&TUT.info&&TUT.info().phase&&TUT.info().phase!=='off')return true}catch(e){}
 try{if(OS.on&&!OS.phoneMode)return true}catch(e){}
 try{const bg=$('ceoBag');if(bg&&!bg.hidden)return true}catch(e){}   // ซ่อนปุ่มมือถือตอนเปิดกระเป๋า ไม่ให้ทับหน้าต่าง
 return false;
}
function place(){
 // วางปุ่มมือถือฝั่งขวา ใต้แผงเวลา/ปุ่มสมุดภารกิจ และเหนือปุ่มกระเป๋า/โต้ตอบ — ถ้าที่ไม่พอ ให้ขยับไปซ้ายของแถบขวา
 try{
  const vis=e=>{if(!e)return null;const r=e.getBoundingClientRect();const cs=getComputedStyle(e);return(r.width>4&&r.height>4&&cs.display!=='none'&&cs.visibility!=='hidden')?r:null};
  const hud=vis($('mctHud')),fab=vis($('qFab'));
  let y=10;if(hud)y=Math.max(y,hud.bottom+10);if(fab)y=Math.max(y,fab.bottom+12);
  const limit=window.innerHeight-150,h=btn.offsetHeight||48;
  if(y+h>limit){btn.style.right=(fab?Math.round(window.innerWidth-fab.left+10):76)+'px';btn.style.top=Math.max(8,fab?fab.top:10)+'px'}
  else{btn.style.right=(fab?Math.round(window.innerWidth-fab.right):14)+'px';btn.style.top=Math.round(y)+'px'}
  btn.style.bottom='auto';btn.style.left='auto';
 }catch(e){}
}
function refresh(){
 if(!okS())return;
 ensureBtn();
 const on=owned()&&!blocked();
 btn.classList.toggle('on',on);
 if(on)place();
 try{const u=S.utilities;btn.classList.toggle('bill',!!(u&&u.bill&&!u.bill.paid))}catch(e){}
}
function open(){
 if(!okS()||!owned()||OS.on)return;
 OS.phoneMode=true;OS.on=1;OS.pp=S.paused;S.paused=1;
 try{K={}}catch(e){}try{if(window.JOY){JOY.x=0;JOY.y=0}}catch(e){}
 OS.app='';
 const m=$('osModal');m.classList.add('phone');
 OS.render();m.hidden=false;refresh();
}
function decorate(){
 if(!OS.phoneMode)return;
 const m=$('osModal');if(!m)return;
 m.classList.add('phone');
 m.querySelectorAll('.osIco').forEach(b=>{const o=b.getAttribute('onclick')||'';if(!APPS.some(a=>o.indexOf("'"+a+"'")>=0))b.remove()});
 const lg=m.querySelector('.osLogo');if(lg)lg.textContent='📱 PHONE';
 m.querySelectorAll('.osBar button').forEach(b=>{if(/ปิดคอม/.test(b.textContent))b.textContent='ปิดมือถือ'});
}
function wrap(){
 if(wrap.done||!okS())return;wrap.done=1;
 const r0=OS.render,c0=OS.close;
 OS.render=function(){const r=r0.apply(this,arguments);try{decorate()}catch(e){}return r};
 OS.close=function(){const r=c0.apply(this,arguments);OS.phoneMode=false;try{$('osModal').classList.remove('phone')}catch(e){}try{refresh()}catch(e){}return r};
}
window.PHN={shopCard,buy,open,owned,refresh,PRICE};
setInterval(()=>{try{wrap();refresh()}catch(e){}},400);
})();
