
/* รักษาโหมดเต็มจอข้ามการรีโหลด (เริ่มเกมใหม่ใช้ location.reload ซึ่งทำให้เบราว์เซอร์ออกจากเต็มจอ) */
(function(){
 const KEY='mct_keep_fs';let leaving=false;
 const ss=(k,v)=>{try{v==null?sessionStorage.removeItem(k):sessionStorage.setItem(k,v)}catch(e){}};
 const gs=k=>{try{return sessionStorage.getItem(k)}catch(e){return null}};
 const isFs=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
 ['beforeunload','pagehide'].forEach(n=>addEventListener(n,()=>{leaving=true}));
 addEventListener('click',e=>{if(e.target&&e.target.closest&&e.target.closest('#lbNew')&&isFs())ss(KEY,'1')},true);
 if(gs(KEY)==='1'){
  const go=()=>{ss(KEY,null);removeEventListener('pointerdown',go,true);removeEventListener('keydown',go,true);removeEventListener('touchend',go,true);
   const d=document.documentElement;try{Promise.resolve(d.requestFullscreen&&d.requestFullscreen()).catch(()=>{})}catch(e){}};
  try{const d=document.documentElement;Promise.resolve(d.requestFullscreen&&d.requestFullscreen()).then(()=>ss(KEY,null)).catch(()=>{})}catch(e){}
  addEventListener('pointerdown',go,true);addEventListener('keydown',go,true);addEventListener('touchend',go,true);
 }
})();
