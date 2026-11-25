
/* =====================================================================
   v23 — UI layer: จอยสติ๊ก · ปุ่มกด · เมนูเดียว · หมุนจอ
   (ไม่แตะ logic เกมนอกจาก movePl / ฉากคอนโด-ทะเล ที่อ่านค่า JOY)
   ===================================================================== */
var JOY={x:0,y:0};            // ค่าแอนะล็อก -1..1 อ่านโดย movePl() และ CEOScene
var UI=(function(){
 const $=id=>document.getElementById(id);
 const GROUPS=[
  {id:'work',ic:'📋',n:'งาน / โปรเจกต์',tabs:[['proj','งาน / โปรเจกต์']]},
  {id:'office',ic:'🏗️',n:'ตกแต่งออฟฟิศ',tabs:[['build','ตกแต่งออฟฟิศ'],['office','สำนักงาน / ชั้น'],['wsl','Workstation']]},
  {id:'money',ic:'💰',n:'การเงิน',tabs:[['fin','การเงิน']]},
  {id:'ceo',ic:'👔',n:'CEO',tabs:[['ceo','CEO']]},
  {id:'prof',ic:'🌟',n:'CEO PROFILE'},
  {id:'sys',ic:'⚙️',n:'ระบบ / บันทึก'}
 ];
 const holds={menu:0,rot:0};let pp=0,cur='work',skipRotate=false,lastW=0,lastH=0;
 const ready=()=>typeof S!=='undefined'&&S;
 const sceneOn=()=>$('ceoScene').classList.contains('show');
 const groupOf=t=>(GROUPS.find(g=>g.tabs&&g.tabs.some(x=>x[0]===t))||GROUPS[0]).id;

 /* ---------- หยุดเกมอัตโนมัติขณะเปิดเมนู / จอตั้ง ---------- */
 function hold(k,on){
  const was=holds.menu||holds.rot;holds[k]=on?1:0;const now=holds.menu||holds.rot;
  if(!ready())return;
  if(!was&&now){pp=S.paused?1:0;S.paused=1}
  else if(was&&!now){if(!$('evModal')&&!(typeof OS!=='undefined'&&OS.on))S.paused=pp}
 }
 function speed(n){if(n===0)pp=1;else{S.speed=Math.min(2,n);pp=0}rs()}
 function rs(){document.querySelectorAll('[data-sp]').forEach(b=>{const n=+b.dataset.sp;b.classList.toggle('on',n?(!pp&&S.speed==n):!!pp)})}

 /* ---------- เมนู ---------- */
 function cats(){$('mCats').innerHTML=GROUPS.filter(g=>!(sceneOn()&&g.id==='office')).map(g=>'<button class="btn mCat'+(g.id===cur?' on':'')+'" onclick="UI.cat(\''+g.id+'\')"><span class="mIc">'+g.ic+'</span>'+g.n+'</button>').join('')}
 function subs(){
  const g=GROUPS.find(x=>x.id===cur);
  $('mSub').innerHTML='<b>'+g.ic+' '+g.n+'</b>'+((g.tabs&&g.tabs.length>1)?g.tabs.map(t=>'<button class="btn'+(tab===t[0]?' on':'')+'" onclick="go(\''+t[0]+'\');UI.subs()">'+t[1]+'</button>').join(''):'');
 }
 function pane(){$('pn').hidden=false;$('sysPane').hidden=true}
 function sys(){cur='sys';$('pn').hidden=true;$('sysPane').hidden=false;cats();subs();rs()}
 function cat(id){
  if(id==='prof'){menu(0);if(window.CEORPG)CEORPG.open();return}
  if(id==='sys'){sys();return}
  if(sceneOn()&&id==='office')id='work';
  cur=id;const g=GROUPS.find(x=>x.id===id);
  go(g.tabs.some(t=>t[0]===tab)?tab:g.tabs[0][0]);cats();subs();
 }
 function menu(v){
  const m=$('menu'),want=(v===undefined)?m.hidden:!!v;
  if(want===!m.hidden)return;
  if(want&&blocked(true))return;
  m.hidden=!want;hold('menu',want);
  if(want){cur=groupOf(tab);if(sceneOn()&&cur==='office'){cur='work';try{go('proj')}catch(e){}}pane();show();cats();subs();$('mPause').hidden=false}
 }
 function returnTitle(){
  // Close the category menu, then reveal the existing title screen without reloading or touching the save.
  menu(0);
  const lobby=$('lobby');
  if(lobby){
   const ov=$('lbOv');if(ov)ov.style.display='none';
   const fade=$('lbFade');if(fade)fade.style.opacity=0;
   lobby.style.display='block';
   const cont=$('lbCont');if(cont)cont.disabled=!localStorage.getItem('mct2');
   if(ready())S.paused=1;
  }
 }
 function blocked(ignoreMenu){
  if(!ready())return true;
  const ids=['clientModal','loanModal','osModal','testModal','ceoBag','ceoProf','ceoWork'];
  if(ids.some(i=>$(i)&&!$(i).hidden))return true;
  if($('evModal')||$('teeCut'))return true;
  if(typeof CUT!=='undefined'&&CUT.on&&!sceneOn())return true;
  return false;
 }
 function endTool(){tool='';mvF=null;show()}

 /* ---------- จอยสติ๊กวงกลม ---------- */
 function initJoy(){
  const z=$('joy'),base=$('joyBase'),knob=$('joyKnob');let id=null;
  base.insertAdjacentHTML('beforeend','<i class="ja u">▲</i><i class="ja d">▼</i><i class="ja l">◀</i><i class="ja r">▶</i>');
  function upd(e){
   const r=base.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,R=r.width*.29;
   const dx=e.clientX-cx,dy=e.clientY-cy,d=Math.hypot(dx,dy),c=Math.min(d,R);
   const ux=d?dx/d:0,uy=d?dy/d:0;
   knob.style.transform='translate('+(ux*c)+'px,'+(uy*c)+'px)';
   let m=c/R;m=m<.12?0:(m-.12)/.88;          // dead-zone เล็กน้อย
   JOY.x=ux*m;JOY.y=uy*m;
  }
  function reset(){id=null;JOY.x=0;JOY.y=0;knob.style.transform='';z.classList.remove('on')}
  z.addEventListener('pointerdown',e=>{if(id!==null)return;id=e.pointerId;try{z.setPointerCapture(id)}catch(_){}z.classList.add('on');upd(e);e.preventDefault()});
  z.addEventListener('pointermove',e=>{if(e.pointerId===id){upd(e);e.preventDefault()}});
  ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>z.addEventListener(ev,e=>{if(e.pointerId===id)reset()}));
  z.addEventListener('contextmenu',e=>e.preventDefault());
  UI._joyReset=reset;
 }

 /* ---------- ปุ่มกดหลัก: ออฟฟิศ = คุย · ฉากคอนโด/ทะเล = โต้ตอบ (ส่งปุ่ม E) ---------- */
 function key(type,k){window.dispatchEvent(new KeyboardEvent(type,{key:k,bubbles:true,cancelable:true}))}
 function initActs(){
  const am=$('actMain');let kd=false;
  am.addEventListener('pointerdown',e=>{e.preventDefault();am.classList.add('dn');if(sceneOn()){kd=true;key('keydown','e')}else if(ready())A.talk()});
  ['pointerup','pointercancel','pointerleave'].forEach(ev=>am.addEventListener(ev,()=>{am.classList.remove('dn');if(kd){kd=false;key('keyup','e')}}));
  [$('bagBtn'),$('pcBtn')].forEach(b=>b.addEventListener('pointerdown',e=>e.stopPropagation()));
 }

 /* ---------- เกมเต็มจอ: ขยายแคนวาสให้คลุมทั้งจอ แล้วกล้องตามตัวละคร ---------- */
 let sc=1,cx=0,cy=0,snap=true;
 function fit(){
  const cv=$('cv');if(!cv.width)return;
  const mg=(window.OFC&&OFC.margin&&S&&S.ofc)?OFC.margin():[0,0,0,0];
  sc=Math.max(innerWidth/(cv.width-mg[0]-mg[2]),innerHeight/(cv.height-mg[1]-mg[3]))*((window.OFC&&OFC.zoom&&S&&S.ofc)?OFC.zoom():1);
  cv.style.width=Math.ceil(cv.width*sc)+'px';cv.style.height=Math.ceil(cv.height*sc)+'px';
  lastW=cv.width;lastH=cv.height;snap=true;
 }
 function cam(){
  requestAnimationFrame(cam);
  if(!ready())return;
  const cv=$('cv'),W=innerWidth,H=innerHeight,cw=cv.width*sc,ch=cv.height*sc;
  const mg=(window.OFC&&OFC.margin&&S&&S.ofc)?OFC.margin():[0,0,0,0],mk=mg.join();if(mk!==window.__mgK){window.__mgK=mk;fit();return}
  let fpx=S.pl.x,fpy=S.pl.y;try{const pf=window.POLICE&&POLICE.camFocus&&POLICE.camFocus();if(pf){fpx=pf.x;fpy=pf.y}}catch(e){}
   let tx=W/2-fpx*sc,ty=H/2-fpy*sc;
  {const x0=-mg[0]*sc,x1=W-(cv.width-mg[2])*sc,y0=-mg[1]*sc,y1=H-(cv.height-mg[3])*sc;
   tx=x1>=x0?(x0+x1)/2:Math.min(x0,Math.max(x1,tx));
   ty=y1>=y0?(y0+y1)/2:Math.min(y0,Math.max(y1,ty));}
  if(snap){cx=tx;cy=ty;snap=false;window.__camT=performance.now()}else{const nt=performance.now(),dc=Math.min(.05,Math.max(.001,(nt-(window.__camT||nt))/1000));window.__camT=nt;const kk=1-Math.exp(-dc*8.5);cx+=(tx-cx)*kk;cy+=(ty-cy)*kk}
  cv.style.transform='translate('+cx.toFixed(1)+'px,'+cy.toFixed(1)+'px)';
 }

 /* ---------- หมุนจอ / เต็มจอ ---------- */
 function full(){
  const d=document.documentElement;
  Promise.resolve(d.requestFullscreen?d.requestFullscreen():0)
   .then(()=>screen.orientation&&screen.orientation.lock?screen.orientation.lock('landscape'):0)
   .catch(()=>{if(typeof toast==='function')toast('เบราว์เซอร์ไม่อนุญาต — หมุนจอเองได้เลย')});
 }
 function skipRot(){tick()}

 /* ---------- วนเช็คสถานะ UI ---------- */
 function tick(){
  const portrait=innerHeight>innerWidth;
  if($('rotateMsg').hidden===portrait)$('rotateMsg').hidden=!portrait;
  if(!ready())return;
  const scene=sceneOn(),choices=scene&&!$('ceoSceneChoices').hidden,open=!$('menu').hidden;
  const hide=open||choices||S.over||blocked();
  document.body.classList.toggle('noctl',!!hide);document.body.classList.toggle('inScene',scene);
  if(hide&&(JOY.x||JOY.y)&&UI._joyReset)UI._joyReset();
  // ฉลากปุ่มหลัก
  $('actMain').classList.toggle('interactBadge',scene);
  $('actIco').innerHTML=scene?'<img alt="โต้ตอบ" draggable="false" src="assets/img/49d7b07cab26.png">':'💬';
  $('actTxt').textContent=scene?'โต้ตอบ':'คุย';
  // สถานะความเร็ว
  const paused=(holds.menu||holds.rot)?pp:S.paused;
  $('spdTag').textContent=(typeof DEV_TEST_MODE!=='undefined'&&DEV_TEST_MODE)?'🧪 x'+DEV_TEST_SPEED:(paused?'⏸ หยุด':(S.speed>1?'⏩ x'+S.speed:'▶ x1'));
  // ชิปโหมดสร้าง
  const chip=$('toolChip');
  if(tool&&!open&&!scene&&!hide){chip.hidden=false;$('toolTxt').textContent='🏗️ โหมดสร้าง: '+(F[tool]?F[tool].n:({move:'ย้าย',rot:'หมุน',del:'ลบ'}[tool]||tool))+' · แตะช่องบนแผนที่'}else chip.hidden=true;
  const cv=$('cv');if(cv.width!==lastW||cv.height!==lastH)fit();
 }

 function init(){
  initJoy();initActs();
  // เลือกอุปกรณ์/เครื่องมือในโหมดสร้างแล้ว → ปิดเมนูอัตโนมัติ เพื่อแตะวางบนแผนที่
  $('pn').addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button');if(b&&tab==='build'&&tool&&/tool=/.test(b.getAttribute('onclick')||''))setTimeout(()=>menu(0),60)});
  // ทางลัดคีย์บอร์ด (เดสก์ท็อป): M / Tab = เมนู · Esc = ปิดเมนู · E / Space = คุย
  addEventListener('keydown',e=>{
   if(/^(INPUT|SELECT|TEXTAREA)$/.test((e.target||{}).tagName||'')||e.ctrlKey||e.metaKey||e.altKey)return;
   if(!ready()||sceneOn())return;
   const k=(e.key||'').toLowerCase(),open=!$('menu').hidden;
   if(open){if(k==='escape'||k==='m'||k==='tab'){e.preventDefault();menu(0)}return}
   if(blocked())return;
   if(k==='m'||k==='tab'){e.preventDefault();menu(1)}
   else if(k==='e'||k===' '){e.preventDefault();A.talk()}
  });
  addEventListener('resize',()=>{fit();tick()});addEventListener('orientationchange',()=>setTimeout(()=>{fit();tick()},200));
  setInterval(tick,120);tick();fit();requestAnimationFrame(cam);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else Promise.resolve().then(init);
 return {menu,cat,subs,pane,sys,speed,endTool,full,skipRot,fit,tick,returnTitle,_joyReset:null};
})();

