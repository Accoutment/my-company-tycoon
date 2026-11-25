
(function(){
'use strict';
if(window.DAYSUM)return;
const fm=n=>(n<0?'−':'')+'$'+Math.abs(Math.round(n||0)).toLocaleString('en-US');
const th=n=>Math.round(n||0).toLocaleString('en-US');
let pend=null,prevPaused=0,open=false;
function css(){if(document.getElementById('dsCss'))return;const c=document.createElement('style');c.id='dsCss';c.textContent=
'#daySum{position:fixed;inset:0;z-index:99990;background:rgba(4,8,18,.78);display:flex;align-items:center;justify-content:center;padding:10px}#daySum[hidden]{display:none}'+
'#daySum .dsP{width:min(520px,100%);max-height:calc(100dvh - 20px);overflow:auto;background:linear-gradient(180deg,#172036,#0d1424);border:2px solid #d4a94f;border-radius:14px;color:#e8eefc;padding:14px 16px;box-shadow:0 14px 50px rgba(0,0,0,.6)}'+
'#daySum h2{margin:0;font-size:19px;color:#ffd45a}#daySum .dsS{font-size:12px;color:#9fb0cc;margin:2px 0 10px}'+
'#daySum .dsBig{display:flex;gap:8px;margin-bottom:10px}#daySum .dsBig div{flex:1;background:#0e1522;border:1px solid #33415f;border-radius:10px;padding:8px;text-align:center}#daySum .dsBig small{display:block;color:#9fb0cc;font-size:11px}#daySum .dsBig b{font-size:18px}'+
'#daySum .dsR{display:flex;justify-content:space-between;padding:5px 2px;border-bottom:1px dashed #2b3856;font-size:14px}#daySum .dsR span:last-child{font-weight:700}'+
'#daySum .pos{color:#7fe3a0}#daySum .neg{color:#ff8a8a}#daySum .dsH{margin:10px 0 2px;font-size:12px;color:#d4a94f;font-weight:700;letter-spacing:.04em}'+
'#daySum .dsNote{font-size:13px;line-height:1.55;color:#cfdaf3;margin-top:4px}'+
'#daySum button.dsOk{margin-top:12px;width:100%;min-height:44px;border-radius:10px;border:1px solid #ffe9a0;background:linear-gradient(180deg,#ffd45a,#e0a82e);color:#1a1a22;font:inherit;font-weight:800;font-size:15px;cursor:pointer}';
 document.head.appendChild(c)}
function snap(){const t=S.today||{};return{day:S.day,money:S.money,inc:t.inc||0,eq:t.eq||0,tr:t.tr||0,yz:t.yz||0,done:(S.tot&&S.tot.done)||0,rep:S.rep||0,emp:S.emp.length,proj:S.projects.length,lv:(typeof lvl==='function'?lvl():1),names:S.emp.map(e=>e.name)}}
function build(a,b,hist){
 const sl=hist?hist.s:0,rt=hist?hist.r:0;
 const out=a.eq+a.tr+a.yz+sl+rt,net=a.inc-out;
 const left=S.projects.length?Math.min.apply(null,S.projects.map(p=>p.left)):null;
 const quit=a.names.filter(n=>!S.emp.some(e=>e.name===n));
 const row=(l,v,c)=>'<div class="dsR"><span>'+l+'</span><span class="'+(c||'')+'">'+v+'</span></div>';
 let h='<div class="dsP"><h2>📊 สรุปผลประกอบการ · วันที่ '+a.day+'</h2><div class="dsS">ปิดบัญชีประจำวัน · '+(S.name||'บริษัทของคุณ')+'</div>'+
  '<div class="dsBig"><div><small>กำไรสุทธิวันนี้</small><b class="'+(net>=0?'pos':'neg')+'">'+(net>=0?'+':'')+fm(net)+'</b></div><div><small>เงินสดคงเหลือ</small><b>'+fm(S.money)+'</b></div></div>'+
  '<div class="dsH">รายรับ</div>'+row('รายได้จากงาน/ลูกค้า','+'+fm(a.inc),'pos')+
  '<div class="dsH">รายจ่าย</div>'+row('เงินเดือนพนักงาน','−'+fm(sl),'neg')+row('ค่าเช่า/ค่าดำเนินการ','−'+fm(rt),'neg')+
  ((a.eq)?row('อุปกรณ์/ฝึกอบรม/ค่าปรับ','−'+fm(a.eq),'neg'):'')+((a.tr)?row('ค่าเดินทาง/อื่นๆ','−'+fm(a.tr),'neg'):'')+((a.yz)?row('ค่าใช้จ่ายพิเศษ','−'+fm(a.yz),'neg'):'')+
  '<div class="dsH">ความคืบหน้า</div>'+row('งานที่ส่งสำเร็จวันนี้',th(b.done-a.done)+' งาน')+row('ชื่อเสียง',th(b.rep)+(b.rep!==a.rep?' ('+(b.rep>a.rep?'+':'')+th(b.rep-a.rep)+')':''),b.rep>a.rep?'pos':(b.rep<a.rep?'neg':''))+row('พนักงาน',th(b.emp)+' คน'+(quit.length?' · ลาออก '+quit.join(', '):''),quit.length?'neg':'')+
  '<div class="dsH">พรุ่งนี้</div><div class="dsNote">'+(S.projects.length?'งานที่ค้างอยู่ '+S.projects.length+' งาน'+(left!=null?' · ใกล้ส่งสุดอีก '+Math.max(0,left)+' วันทำงาน':''):'ยังไม่มีงานค้าง · ไปรับงานจากกระดานงานได้เลย')+
  (net<0?'<br>⚠ วันนี้ขาดทุน ลองรับงานเพิ่มหรือลดค่าใช้จ่าย':'')+(S.money<0?'<br>⚠ เงินสดติดลบ ระวังล้มละลาย':'')+'</div>'+
  '<button class="dsOk" onclick="DAYSUM.close()">☀️ เริ่มวันใหม่</button></div>';
 return h}
function show(html){css();let m=document.getElementById('daySum');if(!m){m=document.createElement('div');m.id='daySum';m.hidden=true;document.body.appendChild(m)}
 m.innerHTML=html;if(!open){prevPaused=S.paused||0;S.paused=1}open=true;m.hidden=false}
function close(){const m=document.getElementById('daySum');if(m)m.hidden=true;if(open){S.paused=prevPaused;open=false}try{clearPlayerInput()}catch(e){}}
function install(){
 if(typeof endDay!=='function'||endDay.__ds)return false;
 const orig=endDay;
 endDay=function(){let a=null;try{if(!S.over)a=snap()}catch(e){}
  const r=orig.apply(this,arguments);
  try{if(a&&S.day>a.day&&!S.over){const hist=(S.hist||[]).slice(-1)[0];const b=snap();show(build(a,b,hist&&hist.d===a.day?hist:null))}}catch(e){console.error('[DAYSUM]',e)}
  return r};
 endDay.__ds=1;return true}
addEventListener('keydown',e=>{if(open&&(e.key==='Enter'||e.key==='Escape')){e.stopPropagation();e.preventDefault();close()}},true);
let n=0;const iv=setInterval(()=>{if(install()||++n>200)clearInterval(iv)},100);
window.DAYSUM={close,test(){const a=snap();show(build(a,snap(),(S.hist||[]).slice(-1)[0]||null))},isOpen:()=>open};
})();
