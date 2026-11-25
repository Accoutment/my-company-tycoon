
/* v100 · Responsive helpers — เฉพาะ layout/viewport ไม่แตะระบบเกม (เงิน/พนักงาน/เวลา/เซฟ) */
(function(){
 'use strict';
 var root=document.documentElement,vv=window.visualViewport,raf=0;
 function setVars(){
  raf=0;
  var h=vv?vv.height:window.innerHeight,t=vv?vv.offsetTop:0;
  root.style.setProperty('--vvh',Math.round(h)+'px');
  root.style.setProperty('--vvt',Math.round(t)+'px');
  var kb=(window.innerHeight-h)>120&&/input|textarea|select/i.test((document.activeElement||{}).tagName||'');
  root.classList.toggle('kbOpen',!!kb);
  var w=window.innerWidth,hh=window.innerHeight;
  root.setAttribute('data-orient',w>hh?'landscape':'portrait');
  var m=Math.min(w,hh);
  root.setAttribute('data-dev',m<=380?'small':(m<=640||(w>hh&&hh<=560))?'mobile':(w<=1024?'tablet':'desktop'));
 }
 function sched(){if(!raf)raf=requestAnimationFrame(setVars)}
 setVars();
 window.addEventListener('resize',sched,{passive:true});
 window.addEventListener('orientationchange',function(){setTimeout(sched,120);setTimeout(sched,450)},{passive:true});
 if(vv){vv.addEventListener('resize',sched,{passive:true});vv.addEventListener('scroll',sched,{passive:true})}
 document.addEventListener('focusin',function(e){
  sched();
  var t=e.target;if(t&&/input|textarea|select/i.test(t.tagName)){
   setTimeout(function(){try{t.scrollIntoView({block:'center',inline:'nearest',behavior:'smooth'})}catch(_){}},320)}
 });
 document.addEventListener('focusout',function(){setTimeout(sched,200)});
 /* กัน pinch-zoom บน iOS Safari (viewport meta ถูกเมินในบางเวอร์ชัน) · double-tap ใช้ touch-action:manipulation แทน เพื่อไม่กลืนการแตะรัว */
 ['gesturestart','gesturechange','gestureend'].forEach(function(ev){document.addEventListener(ev,function(e){e.preventDefault()},{passive:false})});

 /* แถบหมวดเมนูบนมือถือแนวตั้งเลื่อนแนวนอนได้ → แสดงเงาจางบอกว่ายังมีอีก + เลื่อนหมวดที่เลือกให้อยู่ในจอ */
 function catHint(){
  var c=document.getElementById('mCats');if(!c)return;
  var more=c.scrollWidth-c.clientWidth-c.scrollLeft>4,left=c.scrollLeft>4;
  c.classList.toggle('mMoreR',more);c.classList.toggle('mMoreL',left);
 }
 function catFocus(){
  var c=document.getElementById('mCats');if(!c)return;var on=c.querySelector('.on');
  if(on&&c.scrollWidth>c.clientWidth){var l=on.offsetLeft-(c.clientWidth-on.offsetWidth)/2;c.scrollLeft=Math.max(0,l)}
  catHint();
 }
 function bindCats(){
  var c=document.getElementById('mCats');if(!c||c._mctBound)return;c._mctBound=1;
  c.addEventListener('scroll',catHint,{passive:true});window.addEventListener('resize',catHint,{passive:true});
  if(window.MutationObserver){new MutationObserver(function(recs){for(var i=0;i<recs.length;i++){if(recs[i].target!==c){setTimeout(catFocus,30);return}}}).observe(c,{childList:true,subtree:true,attributes:true,attributeFilter:['class']})}
  catFocus();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindCats);else bindCats();
 var mnu=document.getElementById('menu');if(mnu&&window.MutationObserver){new MutationObserver(function(){setTimeout(catFocus,60)}).observe(mnu,{attributes:true,attributeFilter:['hidden']})}
})();

