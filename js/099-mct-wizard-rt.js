
/* ============================================================================
 * THE MIDNIGHT WIZARD — ระบบเควสต์รันไทม์ (จุดเก็บ/ซ่อม/ไขรหัส/นับถอยหลัง/ล้มเหลวของ Q1)
 * เสียบเข้า Quest Engine ผ่าน hook: WZ_VARS · WZ_CANDS · WZ_ACT · WZ_MARKS · WZ_FX · WZ_FXON
 * ไม่มี UI สมุดภารกิจใหม่ — ใช้สมุดภารกิจ/แบนเนอร์/บทสนทนาเดิมทั้งหมด (เพิ่มเพียงแป้นตัวเลขสำหรับไขรหัส)
 * ========================================================================== */
(function(root){
'use strict';
if(root.WZQ)return;
const Q=()=>S.q,QE=()=>root.QUEST;
const stOf=id=>{const x=Q()&&Q().st&&Q().st[id];return x||null};
const act=id=>{const x=stOf(id);return !!(x&&x.s==='a')};
const stepI=id=>{const x=stOf(id);return x?(x.i||0):-1};
function W(){return root.WIZARD_NPC.data()}
function V(){const w=W();if(!w.v||typeof w.v!=='object')w.v={};const v=w.v;
 if(!v.sp)v.sp={};if(!v.code)v.code=null;if(typeof v.cd!=='number')v.cd=-1;if(!v.fail)v.fail=0;return v}
const FL=()=>Q().fl;
/* ---------------- จุดในโลก ---------------- */
const SP=[];
const add=(o)=>SP.push(o);
[['street',700,550],['street',300,262],['beach',200,420],['stst',300,492],['farm',300,440]].forEach((p,i)=>add({id:'b'+(i+1),q:'WZ1',kind:'box',place:p[0],x:p[1],y:p[2]}));
for(let i=0;i<10;i++)add({id:'m'+(i+1),q:'WZ2',kind:'mush',place:'farm',x:90+i*80,y:340+((i*47)%100)});
[160,330,500,670,820].forEach((x,i)=>add({id:'o'+(i+1),q:'WZ2',kind:'ore',place:'farm',x:x,y:420+((i*29)%30)}));
[[240,370],[520,345],[790,380]].forEach((p,i)=>add({id:'t'+(i+1),q:'WZ2',kind:'tree',place:'farm',x:p[0],y:p[1]}));
[[260,358],[470,358],[700,358]].forEach((p,i)=>add({id:'mc'+(i+1),q:'WZ3',kind:'mach',place:'stin',x:p[0],y:p[1]}));
add({id:'doc',q:'WZ3',kind:'doc',place:'stin',x:350,y:350});
add({id:'ldoor',q:'WZ3',kind:'ldoor',place:'stin',x:560,y:350});
add({id:'pwr',q:'WZ3',kind:'pwr',place:'stin',x:790,y:352});
[[200,356],[500,372],[850,358]].forEach((p,i)=>add({id:'vl'+(i+1),q:'WZ3',kind:'valve',place:'stin',x:p[0],y:p[1]}));
add({id:'ev',q:'WZ4',kind:'ev',place:'office',x:400,y:208});
add({id:'bld',q:'WZ4',kind:'bld',place:'farm',x:850,y:372});
add({id:'bkey',q:'WZ4',kind:'bkey',place:'farm',x:850,y:372});
add({id:'sdoor',q:'WZ4',kind:'sdoor',place:'farm',x:850,y:372});
add({id:'client',q:'WZ4',kind:'client',place:'farm',x:850,y:372});
const KIND_N={box:'box',mush:'mush',ore:'ore',tree:'tree',mach:'mach',doc:'doc',ldoor:'ldoor',pwr:'pwr',valve:'valve',ev:'ev',bld:'bld',bkey:'bkey',sdoor:'sdoor',client:'client'};
const got=id=>!!V().sp[id];
/* ตัวแปรสำหรับ step 'own' ของเควสต์ */
function n(k){
 if(k==='evc'){const c=Q().cl||{};return ['wz_ev1','wz_ev2','wz_ev3'].filter(x=>c[x]).length}
 if(k==='cdl')return Math.max(0,Math.ceil(V().cd));
 let c=0;SP.forEach(s=>{if(s.kind===k&&got(s.id))c++});return c}
function vars(){const o={};['box','mush','ore','tree','mach','doc','ldoor','pwr','valve','ev','bld','bkey','sdoor','client'].forEach(k=>o['wz_'+k]=n(k));return o}
/* ---------------- รหัส ---------------- */
function code(){const v=V();if(!v.code){v.code=[0,0,0,0].map(()=>Math.floor(Math.random()*10)).join('');try{save(1)}catch(e){}}return v.code}
function code2(){const c=code().split('').map(Number);return [0,1,2,3].map(i=>(c[i]+c[(i+1)%4])%10).join('')}
const dig=k=>code()[k-1];
/* ---------------- เงื่อนไขเปิดใช้งานของจุด ---------------- */
function live(s){
 if(got(s.id)&&s.kind!=='mach')return false;
 const i=stepI(s.q);if(!act(s.q))return false;
 switch(s.kind){
  case 'box':return i===0;
  case 'mush':case 'ore':case 'tree':return i>=1&&i<=3;
  case 'mach':return i===1&&!got(s.id);
  case 'doc':return i===2;
  case 'ldoor':return i===3;
  case 'pwr':return i===4;
  case 'valve':return i===5&&V().cd>0;
  case 'ev':return i===0&&n('evc')>=3;
  case 'bld':return i===2;
  case 'bkey':return i===3;
  case 'sdoor':return i===4;
  case 'client':return i===5;
 }return false}
const LAB=['ซ่อมเครื่องจักร','อ่านเอกสาร'];
function label(s){return {box:'📦 เก็บพัสดุลึกลับ',mush:'🍄 เก็บเห็ดเรืองแสง',ore:'💎 เก็บแร่ประหลาด',tree:'🌳 สำรวจต้นไม้โบราณ',mach:'🔧 ซ่อมเครื่องจักร',doc:'📄 หยิบเอกสารการทดลอง',ldoor:'🔐 ใส่รหัสประตูห้องทดลอง',pwr:'⚡ ปิดระบบพลังงาน',valve:'🛞 ปิดวาล์วระบายความร้อน',ev:'🗂️ วางเรียงหลักฐาน',bld:'🏚️ สำรวจอาคารร้าง',bkey:'🔐 ใส่รหัสประตูลับ',sdoor:'🚪 เปิดประตูลับ',client:'🌙 เข้าไปพบลูกค้า'}[s.kind]||'โต้ตอบ'}
/* ---------------- Hook: candidates / markers / act ---------------- */
root.WZ_VARS=vars;
root.WZ_CANDS=function(c){
 const o=[];if(!c||!c.place)return o;
 for(const s of SP){if(s.place!==c.place||!live(s))continue;const d=Math.hypot(c.x-s.x,c.y-s.y);if(d<=64)o.push({k:'wzs',sp:s,lab:label(s),dist:d-6})}
 return o};
root.WZ_MARKS=function(c){
 const o=[];if(!c||!c.place)return o;
 for(const s of SP){if(s.place!==c.place)continue;
  const lv=live(s),i3=stepI('WZ3'),i2=stepI('WZ2'),i4=stepI('WZ4');let show=lv;
  if(s.kind==='mach')show=act('WZ3')&&i3>=1&&i3<=5;
  else if(s.kind==='tree')show=act('WZ2')&&i2>=1&&i2<=3;
  else if(s.kind==='bld')show=act('WZ4')&&i4>=2&&i4<=5;
  if(!show)continue;
  o.push({k:'wzx',x:s.x,y:s.y,draw:(g,P,t)=>drawSp(g,P,t,s,lv)})}
 return o};
function bump(k,txt){
 const tot={box:5,mush:10,ore:5,tree:3,mach:3,valve:3}[k];
 try{QE().notify(txt+(tot?' '+n(k)+'/'+tot:''),'')}catch(e){}
 try{QE().tick()}catch(e){}
 try{save(1)}catch(e){}}
root.WZ_ACT=function(cd){
 const s=cd.sp;if(!s||!live(s))return false;const v=V();
 const L=(t)=>'*|'+t;
 switch(s.kind){
  case 'box':{
   v.sp[s.id]=1;const idx=n('box');const cl=Q().cl;cl['wz_box'+idx]=S.day;
   QE().openDlg([L('กล่องไม้ปิดผนึกตราสีม่วง ไม่มีชื่อผู้ส่ง… คุณเก็บมันอย่างระวัง (ห้ามให้เสียหาย)')],()=>bump('box','📦 ได้พัสดุลึกลับ'));return true}
  case 'mush':v.sp[s.id]=1;bump('mush','🍄 เก็บเห็ดเรืองแสง');return true;
  case 'ore':v.sp[s.id]=1;bump('ore','💎 เก็บแร่ประหลาด');return true;
  case 'tree':v.sp[s.id]=1;QE().openDlg([L('อักษรโบราณเรืองแสงบนลำต้น… ต้นไม้ต้นนี้มีอายุหลายร้อยปี')],()=>bump('tree','🌳 พบต้นไม้โบราณ'));return true;
  case 'mach':return repair(s);
  case 'doc':v.sp[s.id]=1;Q().cl.wz_exdoc=S.day;QE().openDlg([L('คุณพบเอกสารการทดลองที่สูญหายใต้ซากโต๊ะทดลอง'),L('หน้าสุดท้ายมีตัวเลขและหมายเหตุ — บันทึกลงแท็บเบาะแสแล้ว')],()=>{try{QE().notify('🧩 ได้เบาะแส: เอกสารการทดลอง','อ่านรหัสในแท็บเบาะแส')}catch(e){}QE().tick();save(1)});return true;
  case 'ldoor':return keypad('รหัสประตูห้องทดลอง',code(),()=>{v.sp.ldoor=1;QE().openDlg([L('ประตูเหล็กเลื่อนเปิด — ระบบควบคุมพลังงานอยู่ด้านใน')],()=>QE().tick())});
  case 'pwr':return power();
  case 'valve':v.sp[s.id]=1;bump('valve','🛞 ปิดวาล์วระบายความร้อน');if(n('valve')>=3){v.cd=-1;try{QE().notify('✅ หยุดเครื่องจักรได้ทัน','ระบบเย็นลงแล้ว')}catch(e){}}return true;
  case 'ev':v.sp.ev=1;QE().openDlg([L('คุณวางตราผนึก เศษผลึก และบันทึกห้องทดลองเรียงบนโต๊ะ Manager'),L('ทั้งสามชิ้นมีลายเซ็นสีม่วงเดียวกัน… ลูกค้าคนสุดท้ายอยู่ที่ท่าเรือชายหาดในยามค่ำ')],()=>{QE().tick();save(1)});return true;
  case 'bld':v.sp.bld=1;Q().cl.wz_bldclue=S.day;QE().openDlg([L('โรงนาร้างริมไร่ ผนังผุพัง… แต่ประตูเหล็กบานหนึ่งดูใหม่ผิดที่ มีแผงรหัสติดอยู่')],()=>{QE().tick();save(1)});return true;
  case 'bkey':return keypad('รหัสประตูลับ',code2(),()=>{v.sp.bkey=1;QE().openDlg([L('แผงรหัสส่งเสียงปี๊บเขียว — กลไกล็อกปลดออก')],()=>QE().tick())});
  case 'sdoor':v.sp.sdoor=1;QE().openDlg([L('ประตูเหล็กบานหนักค่อย ๆ เลื่อนเปิด เผยห้องลับที่มีแสงเทียนสีม่วง')],()=>{QE().tick();save(1)});return true;
  case 'client':return client();
 }return false};
/* ---------------- ซ่อมเครื่องจักร (ตัวเลือกจริง) ---------------- */
const PARTS=[['คอยล์ทองแดงที่ไหม้','เฟืองเหล็กที่สึก','ท่อระบายความร้อนที่รั่ว',0],['วงจรควบคุมที่ลัดวงจร','ลูกสูบที่ติดขัด','แบตเตอรี่ที่บวม',0],['วาล์วนิรภัยที่ค้าง','สายพานที่ขาด','เซนเซอร์ที่หลุด',1]];
function repair(s){
 const k=+s.id.slice(2)-1,P=PARTS[k],v=V();
 if(got(s.id)){QE().openDlg(['*|เครื่องจักรเครื่องนี้ซ่อมแล้ว — จอแสดงเลข '+dig(k+1)]);return true}
 const mk=()=>({ask:'เครื่องจักรเครื่องที่ '+(k+1)+' ขัดข้อง — จะเปลี่ยนชิ้นส่วนไหน?',opts:[0,1,2].map(j=>({t:P[j],get say(){return j===P[3]?['*|ชิ้นส่วนใหม่เข้าที่พอดี เครื่องจักรสั่นแล้วเดินเรียบ จอแสดงเลข '+dig(k+1)]:['*|เครื่องจักรสั่นและพ่นประกายไฟ… ผิดชิ้นแล้ว',mk()]},fx:j===P[3]?undefined:undefined,set:j===P[3]?{['wz_rep'+k]:1}:undefined})).concat([{t:'ถอยออกมา',cancel:true,say:['*|คุณถอยห่างจากเครื่องจักร']}])});
 QE().openDlg(['*|เครื่องจักรเครื่องที่ '+(k+1)+' ส่งเสียงครางและมีควันออกมา',mk()],()=>{
  if(FL()['wz_rep'+k]&&!got(s.id)){v.sp[s.id]=1;Q().cl['wz_dg'+(k+1)]=S.day;bump('mach','🔧 ซ่อมเครื่องจักรสำเร็จ')}});
 return true}
/* ---------------- ปิดระบบพลังงาน → เริ่มนับถอยหลังระเบิด ---------------- */
function power(){
 const v=V();
 QE().openDlg(['*|แผงควบคุมพลังงานส่งเสียงหึ่ง ไฟแดงกะพริบรัว…',
  {ask:'จะทำอย่างไรกับระบบพลังงาน?',opts:[{t:'ดึงคันโยกปิดระบบพลังงานหลัก',set:{wz_pwroff:1},say:['*|คันโยกลงล็อก ไฟทั้งห้องดับวูบ แล้วเสียงเครื่องจักรเร่งสูงขึ้น — แรงดันสะสมเริ่มล้น!','*|"วาล์วระบายความร้อน 3 ตัว ต้องปิดก่อนที่จะระเบิด!"']},{t:'ถอยออกมา',cancel:true}]}],
  ()=>{if(FL().wz_pwroff&&!got('pwr')){v.sp.pwr=1;v.cd=80;v.valves=0;QE().tick();try{QE().notify('⚠ เครื่องจักรจะระเบิดใน 80 วินาที','ปิดวาล์ว 3 ตัวบนชานชาลา')}catch(e){}save(1)}});
 return true}
function cdTick(dt){
 const v=V();if(!act('WZ3')||stepI('WZ3')!==5){return}
 if(v.cd<0)v.cd=80;if(S.paused)return;
 if(v.cd>0){v.cd-=dt;if(n('valve')>=3){v.cd=-1;return}
  if(v.cd<=0){
   // ระเบิด: รีเซ็ตวาล์วแล้วเริ่มใหม่ (ไม่ล้มเหลวทั้งเควสต์)
   v.cd=80;SP.forEach(s=>{if(s.kind==='valve')delete v.sp[s.id]});v.boom=(v.boom||0)+1;
   try{QE().notify('💥 เครื่องจักรระเบิด!','ระบบรีเซ็ต — ลองปิดวาล์วใหม่ภายใน 80 วินาที')}catch(e){}
   try{const x=root.__CEO_CTX;x&&x.toast('💥 เครื่องจักรระเบิด! นับถอยหลังใหม่')}catch(e){}
   expl=1;}}}
let expl=0;
const cdText=()=>{const v=V();return act('WZ3')&&stepI('WZ3')===5&&v.cd>0?'⏱ เหลือ '+Math.ceil(v.cd)+' วินาที':''};
/* ---------------- ลูกค้าตัวจริง ---------------- */
function client(){
 const v=V(),Lw=t=>'พ่อมดเที่ยงคืน|'+t;
 QE().openDlg(['*|ในห้องลับ… เก้าอี้ตัวหนึ่งหันหลังให้คุณ มีเทียนสีม่วงลุกอยู่บนโต๊ะ',
  'ลูกค้าตัวจริง|ในที่สุด… เจ้าก็มาถึงห้องนี้ ข้ารอมานานแล้ว',
  'ลูกค้าตัวจริง|พัสดุ ป่า ห้องทดลอง ทั้งหมดคือการทดสอบว่าเจ้าเชื่อใจได้หรือไม่ ข้าไม่ได้มาในนามพ่อมดแต่ผู้เดียว',
  'ลูกค้าตัวจริง|ตั้งแต่นี้ พ่อมดเที่ยงคืนคือลูกค้าพิเศษของบริษัทเจ้า และงานเหนือธรรมชาติทั้งหลายจะมาหาเจ้าเอง',
  '*|เก้าอี้หมุนกลับมา — ลูกค้าตัวจริงคือเงาของพ่อมดผู้ส่งเขามาตั้งแต่แรก ก่อนจะค่อย ๆ จางไปในแสงเทียน'],
  ()=>{v.sp.client=1;QE().tick();save(1)});
 return true}
/* ---------------- แป้นตัวเลข (ไขรหัส) ---------------- */
function keypad(title,answer,onOk){
 if(document.getElementById('wzKp'))return true;
 const prev=S.paused||0;S.paused=1;try{root.__CEO_CTX.st.keys={}}catch(e){}
 const d=document.createElement('div');d.id='wzKp';
 d.style.cssText='position:fixed;inset:0;z-index:9600;background:rgba(5,8,18,.55);display:flex;align-items:center;justify-content:center;font-family:"Noto Sans Thai","Sarabun",sans-serif';
 d.innerHTML='<div style="background:#101a39;border:2px solid #8a6cff;border-radius:12px;padding:14px;width:min(300px,92vw);color:#f5f1e8;text-align:center"><div style="font-weight:700;margin-bottom:8px">🔐 '+title+'</div><div id="wzKd" style="font:700 30px monospace;letter-spacing:.3em;background:#0a1020;border:1px solid #4b5f93;border-radius:8px;padding:6px;min-height:46px">----</div><div id="wzKm" style="min-height:20px;font-size:13px;color:#ffb0a0;margin:4px 0"></div><div id="wzKg" style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px"></div></div>';
 document.body.appendChild(d);
 let cur='';const disp=d.querySelector('#wzKd'),msg=d.querySelector('#wzKm'),gr=d.querySelector('#wzKg');
 const upd=()=>{disp.textContent=(cur+'----').slice(0,answer.length)};
 const close=()=>{document.removeEventListener('keydown',kh,true);d.remove();if(S.paused===1)S.paused=prev};
 const enter=()=>{if(cur===answer){close();onOk()}else{msg.textContent='รหัสไม่ถูกต้อง';cur='';upd()}};
 const press=k=>{msg.textContent='';if(k==='x'){cur=cur.slice(0,-1)}else if(k==='ok'){enter();return}else if(k==='c'){close();return}else if(cur.length<answer.length){cur+=k;if(cur.length===answer.length){upd();setTimeout(enter,120);return}}upd()};
 ['1','2','3','4','5','6','7','8','9','x','0','ok'].forEach(k=>{const b=document.createElement('button');b.type='button';b.textContent=k==='x'?'⌫':k==='ok'?'ตกลง':k;b.style.cssText='font:700 18px sans-serif;padding:10px;border-radius:8px;border:1px solid #5b73b8;background:#1c2d5a;color:#f5f1e8;cursor:pointer';b.onclick=()=>press(k);gr.appendChild(b)});
 const cb=document.createElement('button');cb.type='button';cb.textContent='ยกเลิก';cb.style.cssText='margin-top:8px;padding:8px 14px;border-radius:8px;border:1px solid #888;background:#222;color:#ddd;cursor:pointer';cb.onclick=()=>press('c');d.firstChild.appendChild(cb);
 const kh=e=>{if(/^[0-9]$/.test(e.key)){press(e.key);e.preventDefault();e.stopPropagation()}else if(e.key==='Backspace'){press('x');e.preventDefault();e.stopPropagation()}else if(e.key==='Enter'){press('ok');e.preventDefault();e.stopPropagation()}else if(e.key==='Escape'){press('c');e.preventDefault();e.stopPropagation()}};
 document.addEventListener('keydown',kh,true);
 root.WZ_KP={press,answer:()=>answer};
 return true}
/* ---------------- Q1: ล้มเหลว (หมดเวลา 00:00 / กล่องเสียหาย) → เริ่มใหม่ ---------------- */
function failQ1(why){
 const q=Q(),v=V();
 q.st.WZ1={s:'a',i:0,d0:S.day};
 SP.forEach(s=>{if(s.q==='WZ1')delete v.sp[s.id]});for(let i=1;i<=5;i++)delete q.cl['wz_box'+i];
 v.fail=(v.fail||0)+1;
 try{QE().notify('❌ ภารกิจล้มเหลว: THE PACKAGE WITHOUT A NAME',why+' — เริ่มภารกิจใหม่ ต้องรวบรวมพัสดุ 5 กล่องอีกครั้ง')}catch(e){}
 try{root.__CEO_CTX.toast('❌ '+why+' · เริ่มภารกิจพัสดุใหม่')}catch(e){}
 try{QE().tick()}catch(e){}try{save(1)}catch(e){}}
let lastGh='idle',lastDay=null;
function watch(){
 try{
  if(!S||!S.q||!S.q.st)return;
  const x=stOf('WZ1');
  if(x&&x.s==='a'&&(x.i||0)<=1){
   if(S.day>(x.d0||S.day)&&(x.d0||0)>0)failQ1('หมดเวลา — เลยเที่ยงคืนก่อนส่งพัสดุครบ');
   else{let ph='idle';try{ph=GHOST.status().phase}catch(e){}
    if(ph==='caught'&&lastGh!=='caught'&&n('box')>0&&(x.i||0)===0)failQ1('ผีจับคุณขณะถือพัสดุ กล่องเสียหาย');
    lastGh=ph}}
 }catch(e){}}
let lt=0;
setInterval(()=>{const t=performance.now(),dt=Math.min(1,(t-(lt||t))/1000);lt=t;try{if(!root.WIZARD_NPC||typeof S==='undefined'||!S.q)return;watch();cdTick(dt)}catch(e){}},250);
/* ---------------- วาดจุด/ฉาก ---------------- */
const fogP=[];for(let i=0;i<14;i++)fogP.push({x:Math.random(),y:Math.random(),r:.08+Math.random()*.1,v:.01+Math.random()*.02,p:Math.random()*6});
function gl(g,x,y,r,c,a){const gr=g.createRadialGradient(x,y,1,x,y,r);gr.addColorStop(0,c);gr.addColorStop(1,'rgba(0,0,0,0)');g.save();g.globalCompositeOperation='lighter';g.globalAlpha=a;g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,7);g.fill();g.restore()}
function drawSp(g,P,t,s,lv){
 const k=P.k,x=P.x,y=P.y,pu=.5+.5*Math.sin(t*3+s.x);
 g.save();g.textAlign='center';
 const sh=()=>{g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x,y+2*k,16*k,5*k,0,0,7);g.fill()};
 switch(s.kind){
  case 'box':sh();g.fillStyle='#7a5230';g.fillRect(x-13*k,y-20*k,26*k,20*k);g.fillStyle='#9a6a3c';g.fillRect(x-13*k,y-20*k,26*k,5*k);g.fillStyle='#8a4cff';g.beginPath();g.arc(x,y-9*k,5*k,0,7);g.fill();gl(g,x,y-10*k,26*k,'rgba(170,100,255,1)',.35+.25*pu);break;
  case 'mush':sh();[[-7,0,1],[5,-2,.8],[0,3,.6]].forEach(m=>{g.fillStyle='#e9f6ff';g.fillRect(x+(m[0]-1.5)*k,y-(10*m[2]-m[1])*k,3*k,10*m[2]*k);g.fillStyle='#5ee6ff';g.beginPath();g.ellipse(x+m[0]*k,y-(10*m[2]-m[1])*k,8*m[2]*k,5*m[2]*k,0,Math.PI,0);g.fill()});gl(g,x,y-8*k,28*k,'rgba(90,230,255,1)',.45+.3*pu);break;
  case 'ore':sh();g.fillStyle='#4b3bb0';g.beginPath();g.moveTo(x-12*k,y);g.lineTo(x-6*k,y-18*k);g.lineTo(x+2*k,y-9*k);g.lineTo(x+8*k,y-22*k);g.lineTo(x+13*k,y);g.closePath();g.fill();g.fillStyle='#9ab0ff';g.fillRect(x+6*k,y-20*k,3*k,10*k);gl(g,x,y-12*k,28*k,'rgba(130,140,255,1)',.45+.3*pu);break;
  case 'tree':{const done=got(s.id);g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x,y+3*k,34*k,8*k,0,0,7);g.fill();g.fillStyle='#2a1c2f';g.beginPath();g.moveTo(x-18*k,y);g.quadraticCurveTo(x-10*k,y-60*k,x-14*k,y-100*k);g.lineTo(x+14*k,y-100*k);g.quadraticCurveTo(x+10*k,y-60*k,x+18*k,y);g.closePath();g.fill();
   g.fillStyle='#1d3a3a';g.beginPath();g.arc(x,y-112*k,46*k,0,7);g.fill();g.fillStyle='#244a48';g.beginPath();g.arc(x-26*k,y-98*k,28*k,0,7);g.arc(x+28*k,y-100*k,26*k,0,7);g.fill();
   g.fillStyle=done?'#b7ffc7':'#c9a8ff';g.font='bold '+(13*k)+'px sans-serif';g.fillText('ᚠ ᚱ ᛟ',x,y-52*k);gl(g,x,y-60*k,(done?30:48)*k,done?'rgba(120,255,160,1)':'rgba(180,120,255,1)',.3+.25*pu);
   if(lv){g.fillStyle='#fff3c0';g.font='bold '+(14*k)+'px sans-serif';g.fillText('✦',x,y-118*k)}break}
  case 'mach':{const ok=got(s.id);sh();g.fillStyle='#46505c';g.fillRect(x-20*k,y-38*k,40*k,38*k);g.fillStyle='#2a323c';g.fillRect(x-16*k,y-34*k,32*k,14*k);g.fillStyle=ok?'#5dff9a':'#ff4a4a';g.fillRect(x-4*k,y-30*k,8*k,6*k);
   if(ok){g.fillStyle='#bfffd8';g.font='bold '+(11*k)+'px monospace';g.fillText(dig(+s.id.slice(2)),x,y-12*k)}else{g.fillStyle='rgba(200,200,200,.5)';for(let i=0;i<3;i++){g.beginPath();g.arc(x-6*k+i*6*k+Math.sin(t*2+i)*2*k,y-42*k-((t*14+i*9)%26)*k,3*k,0,7);g.fill()}}
   gl(g,x,y-30*k,22*k,ok?'rgba(90,255,150,1)':'rgba(255,60,60,1)',.35+.25*pu);break}
  case 'doc':g.fillStyle='#f5efd8';g.fillRect(x-9*k,y-12*k,18*k,13*k);g.fillStyle='#8a7a5a';for(let i=0;i<3;i++)g.fillRect(x-7*k,y-10*k+i*3.5*k,14*k,1.3*k);gl(g,x,y-8*k,26*k,'rgba(255,235,150,1)',.5+.3*pu);break;
  case 'ldoor':case 'sdoor':case 'bkey':g.fillStyle='#2c323a';g.fillRect(x-17*k,y-52*k,34*k,52*k);g.fillStyle='#454d59';g.fillRect(x-14*k,y-49*k,28*k,46*k);g.fillStyle='#0b1228';g.fillRect(x+6*k,y-30*k,8*k,12*k);g.fillStyle=s.kind==='sdoor'?'#ffd45a':'#7fe08a';g.fillRect(x+8*k,y-27*k,4*k,3*k);gl(g,x+10*k,y-26*k,16*k,'rgba(120,255,160,1)',.4*pu+.2);break;
  case 'pwr':g.fillStyle='#38414c';g.fillRect(x-14*k,y-40*k,28*k,40*k);g.fillStyle='#ffd45a';g.fillRect(x-3*k,y-34*k,6*k,20*k);g.fillStyle='#ff3030';g.beginPath();g.arc(x,y-8*k,4*k,0,7);g.fill();gl(g,x,y-12*k,26*k,'rgba(255,60,60,1)',.3+.3*pu);break;
  case 'valve':sh();g.strokeStyle='#d33';g.lineWidth=3*k;g.beginPath();g.arc(x,y-16*k,11*k,0,7);g.moveTo(x-11*k,y-16*k);g.lineTo(x+11*k,y-16*k);g.moveTo(x,y-27*k);g.lineTo(x,y-5*k);g.stroke();g.fillStyle='#555';g.fillRect(x-3*k,y-6*k,6*k,6*k);gl(g,x,y-16*k,24*k,'rgba(255,80,60,1)',.4+.3*pu);break;
  case 'ev':g.fillStyle='#7a5230';g.fillRect(x-14*k,y-8*k,28*k,8*k);gl(g,x,y-10*k,26*k,'rgba(190,120,255,1)',.45+.3*pu);g.font=(14*k)+'px sans-serif';g.fillText('🔏🔮📓',x,y-12*k);break;
  case 'bld':case 'bkey2':{g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x,y+3*k,60*k,9*k,0,0,7);g.fill();g.fillStyle='#4a3a30';g.fillRect(x-52*k,y-70*k,104*k,70*k);g.fillStyle='#5a3a2a';g.beginPath();g.moveTo(x-58*k,y-70*k);g.lineTo(x,y-104*k);g.lineTo(x+58*k,y-70*k);g.closePath();g.fill();g.fillStyle='#14100e';g.fillRect(x-30*k,y-52*k,16*k,18*k);g.fillRect(x+16*k,y-52*k,16*k,18*k);g.fillStyle='#303842';g.fillRect(x-9*k,y-40*k,18*k,40*k);gl(g,x,y-40*k,70*k,'rgba(170,110,255,1)',.2+.12*pu);break}
  case 'client':{const A=root.WZ_ASSETS||{},m=(A.meta||{}).front0;if(!window.__wzim){window.__wzim=new Image();window.__wzim.src=A.atlas||''}const im=window.__wzim;if(m&&im.complete&&im.naturalWidth){g.imageSmoothingEnabled=false;g.drawImage(im,m[0],m[1],m[2],m[3],x-m[4]*.58*k*1.1,y-m[3]*.58*k*1.1,m[2]*.58*k*1.1,m[3]*.58*k*1.1)}gl(g,x,y-30*k,48*k,'rgba(190,110,255,1)',.5+.2*pu);break}
 }
 if(lv&&s.kind!=='tree'&&s.kind!=='bld'){g.fillStyle='#fff3c0';g.font='bold '+(13*k)+'px sans-serif';g.fillText('✦',x,y-(s.kind==='box'||s.kind==='mush'||s.kind==='ore'?26:56)*k+Math.sin(t*4)*2*k)}
 g.restore()}
function forestOn(c){return c.place==='farm'&&act('WZ2')&&stepI('WZ2')>=1||(c.place==='farm'&&act('WZ4')&&stepI('WZ4')>=2&&stepI('WZ4')<=5)}
function labOn(c){return c.place==='stin'&&act('WZ3')&&stepI('WZ3')>=1}
root.WZ_FARMER_AWAY=()=>{try{return !!forestOn({place:'farm'})}catch(e){return false}}; // ชาวสวนธรรมดากลับบ้านระหว่างอีเวนต์ป่า/โรงนา
root.WZ_FXON=c=>!!(c&&(forestOn(c)||labOn(c)));
root.WZ_FX=function(g,c,w,h,t){
 const fo=forestOn(c),lb=labOn(c);if(!fo&&!lb)return;
 g.save();
 const vg=g.createRadialGradient(w/2,h/2,Math.min(w,h)*.3,w/2,h/2,Math.max(w,h)*.75);
 vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,fo?'rgba(20,10,50,.5)':'rgba(0,25,40,.55)');g.fillStyle=vg;g.fillRect(0,0,w,h);
 g.fillStyle=fo?'rgba(30,14,80,.30)':'rgba(6,40,64,.30)';g.fillRect(0,0,w,h);
 fogP.forEach(f=>{f.x=(f.x+f.v/60)%1.2;gl(g,(f.x-.1)*w,f.y*h+Math.sin(t+f.p)*8,f.r*w,fo?'rgba(150,120,255,1)':'rgba(120,220,255,1)',.06)});
 if(lb&&V().cd>0&&act('WZ3')&&stepI('WZ3')===5){const a=.14+.12*Math.abs(Math.sin(t*5));g.fillStyle='rgba(255,30,30,'+a.toFixed(3)+')';g.fillRect(0,0,w,h);
  g.fillStyle='rgba(20,0,0,.75)';g.fillRect(w/2-170,70,340,34);g.fillStyle='#ff7060';g.font='bold 18px "Noto Sans Thai",sans-serif';g.textAlign='center';g.fillText('⚠ เครื่องจักรจะระเบิดใน '+Math.ceil(V().cd)+' วิ · วาล์ว '+n('valve')+'/3',w/2,93)}
 if(expl){expl=0;V().flash=1}
 if(V().flash>0){g.fillStyle='rgba(255,220,150,'+Math.min(.8,V().flash*.8).toFixed(2)+')';g.fillRect(0,0,w,h);V().flash=Math.max(0,V().flash-.04)}
 g.restore()};
root.WZQ={n,dig,code,code2,cdText,SP,live,vars,failQ1,keypad,V,stepI,act};
})(typeof window!=='undefined'?window:globalThis);

