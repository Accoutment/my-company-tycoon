
(function(){
const L=document.getElementById('lobby'),$=id=>document.getElementById(id),KEY='mct2';
const has=()=>!!localStorage.getItem(KEY);
let prevPause=0;
function pause(on){try{if(on){prevPause=S.paused||0;S.paused=1}else S.paused=prevPause}catch(e){}}
// ---- settings ----
let snd=localStorage.getItem('mct_sound')!=='0',vol=+(localStorage.getItem('mct_vol')??80);
function applySnd(){try{window.__mctAudio.refresh()}catch(e){}}
setInterval(applySnd,400);
/* v159 · MASTER AUDIO: ระดับเสียง 0 / ปิดเสียง = เงียบจริงทั้ง <audio> ที่ไม่ได้อยู่ใน DOM (เพลงพื้นหลัง) และ Web Audio ทั้งหมด */
(function(){
 const MP=HTMLMediaElement.prototype,vd=Object.getOwnPropertyDescriptor(MP,'volume'),md=Object.getOwnPropertyDescriptor(MP,'muted'),tr=new Set(),ctxs=new Set();
 const mf=()=>snd?Math.max(0,vol)/80:0;                       // 80 (ค่าเริ่มต้น) = ตามที่ออกแบบไว้ · 0 = เงียบสนิท
 const eff=a=>{try{vd.set.call(a,Math.min(1,(a.__rv==null?1:a.__rv)*mf()))}catch(e){}};
 Object.defineProperty(MP,'volume',{configurable:true,get(){return this.__rv==null?vd.get.call(this):this.__rv},set(v){v=Math.max(0,Math.min(1,+v||0));this.__rv=v;tr.add(this);eff(this)}});
 const _pl=MP.play;MP.play=function(){tr.add(this);try{md.set.call(this,!snd)}catch(e){}eff(this);return _pl.apply(this,arguments)};
 try{const oc=AudioNode.prototype.connect;AudioNode.prototype.connect=function(d){
   try{if(typeof AudioDestinationNode!=='undefined'&&d instanceof AudioDestinationNode){const c=d.context;let m=c.__mg;if(!m){m=c.__mg=c.createGain();oc.call(m,d);ctxs.add(c);m.gain.value=mf()>0?1:0}if(this!==m){arguments[0]=m}}}catch(e){}
   return oc.apply(this,arguments)}}catch(e){}
 window.__mctAudio={refresh(){
   document.querySelectorAll('audio,video').forEach(a=>tr.add(a));
   if(tr.size>300)tr.forEach(a=>{if(a.paused&&!a.isConnected)tr.delete(a)});
   tr.forEach(a=>{try{md.set.call(a,!snd)}catch(e){}eff(a)});
   ctxs.forEach(c=>{try{c.__mg.gain.value=mf()>0?1:0}catch(e){}});
 },master:mf};
})();
$('lbSnd').checked=snd;$('lbSnd').onchange=e=>{snd=e.target.checked;localStorage.setItem('mct_sound',snd?'1':'0');applySnd()};
$('lbVol').value=vol;$('lbVol').oninput=e=>{vol=+e.target.value;localStorage.setItem('mct_vol',vol);applySnd()};
// ล็อกขนาด UI ไว้ที่ 100% และล้างค่าปรับขนาดจอเดิม
localStorage.setItem('mct_res','1');document.body.style.zoom='1';L.style.zoom='1';
$('lbFs').onchange=e=>{try{e.target.checked?document.documentElement.requestFullscreen():document.exitFullscreen()}catch(_){}};
// ---- click sound ----
let ac;function blip(f){if(!snd)return;try{ac=ac||new AudioContext();const o=ac.createOscillator(),g=ac.createGain();o.type='square';o.frequency.value=f;g.gain.value=.05*vol/100;o.connect(g);g.connect(ac.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+.12);o.stop(ac.currentTime+.13)}catch(_){}}
L.querySelectorAll('.lb,.hb').forEach(b=>{b.addEventListener('mouseenter',()=>blip(660));b.addEventListener('click',()=>blip(990))});
// ---- navigation ----
const P={set:'lbSetP',code:'lbCodeP',exit:'lbExitP'};
function view(p){$('lbOv').style.display=p?'flex':'none';for(const k in P)$(P[k]).style.display=p==k?'block':'none'}
function press(b,fn){b.classList.add('pressed');setTimeout(()=>{b.classList.remove('pressed');fn()},140)}
function fadeOut(fn){$('lbFade').style.opacity=1;setTimeout(fn,500)}
function close(){fadeOut(()=>{L.style.display='none';pause(false)})}
$('lbSet').onclick=e=>press(e.currentTarget,()=>view('set'));
$('lbCode').onclick=e=>press(e.currentTarget,()=>{view('code');$('lbCodeMsg').textContent='ของจะถูกมอบเมื่อเข้าเกม';setTimeout(()=>{try{$('lbCodeIn').focus()}catch(_){}},60)});
const doCode=()=>{const r=window.CODE?CODE.submit($('lbCodeIn').value):{ok:false,msg:'ระบบโค้ดยังไม่พร้อม'};$('lbCodeMsg').textContent=r.msg;if(r.ok)$('lbCodeIn').value=''};
$('lbCodeB').onclick=doCode;$('lbCodeIn').onkeydown=e=>{if(e.key==='Enter')doCode()};
$('lbExit').onclick=e=>press(e.currentTarget,()=>view('exit'));$('lbExitY').onclick=()=>{try{if(window.AndroidApp&&typeof AndroidApp.exit==='function'){try{save(1)}catch(_){}AndroidApp.exit();return}}catch(_){}try{window.top.close()}catch(_){}setTimeout(()=>{$('lbExitMsg').textContent='ขอบคุณที่เล่น! ปิดแท็บนี้ได้เลย'},200)};
L.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>view(null));
$('lbCont').onclick=e=>press(e.currentTarget,close);
$('lbNew').onclick=e=>press(e.currentTarget,()=>{
 const start=()=>fadeOut(()=>{window.__resetting=1;localStorage.removeItem(KEY);sessionStorage.setItem('mct_skip_lobby','1');location.reload()});
 if(has())window.gameConfirm('เริ่มเกมใหม่? เซฟเดิมจะถูกแทนที่','เริ่มเกมใหม่').then(ok=>{if(ok)start()});
 else start();
});
$('lbDel').onclick=()=>{window.gameConfirm('ลบเซฟทั้งหมด? การกระทำนี้ไม่สามารถย้อนกลับได้','ลบข้อมูลเซฟ').then(ok=>{if(ok){localStorage.removeItem(KEY);location.reload()}})};
if(sessionStorage.getItem('mct_skip_lobby')){sessionStorage.removeItem('mct_skip_lobby');L.style.display='none'}
else{$('lbCont').disabled=!has();pause(true)}
$('lbOv').onclick=e=>{if(e.target.id=='lbOv')view(null)};L.addEventListener('keydown',e=>{e.stopPropagation();if(e.key=='Escape')view(null)},true);
})();
