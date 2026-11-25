
/* v154 · วางปุ่มสมุดภารกิจ + มือถือ ไว้ซ้ายของปุ่มกระเป๋า (ไม่ทับปุ่มโต้ตอบ) บนมือถือ/จอเตี้ย */
(function(){
 const R=document.documentElement;
 function tick(){
  try{
   const bag=document.getElementById('bagBtn'),acts=document.getElementById('acts');
   const small=innerHeight<=560||(window.matchMedia&&matchMedia('(pointer:coarse)').matches);
   let on=false;
   if(small&&bag&&acts&&!document.body.classList.contains('noctl')&&getComputedStyle(acts).display!=='none'){
    const r=bag.getBoundingClientRect();
    if(r.width>10&&r.height>10){
     const S=Math.round(Math.max(34,Math.min(48,r.height*.8)));
     R.style.setProperty('--dkS',S+'px');
     R.style.setProperty('--dkB',Math.round(innerHeight-r.bottom+(r.height-S)/2)+'px');
     R.style.setProperty('--dkR1',Math.round(innerWidth-r.left+8)+'px');
     R.style.setProperty('--dkR2',Math.round(innerWidth-r.left+8+S+14)+'px');
     on=true;
    }
   }
   document.body.classList.toggle('mctDock',on);
  }catch(e){}
 }
 setInterval(tick,250);addEventListener('resize',tick);addEventListener('orientationchange',tick);tick();
})();

