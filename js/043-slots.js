
/* ===== v150 · ระบบเซฟหลายช่อง (Save Slots) =====
   ใช้ 'mct2' เป็นไฟล์เล่นปัจจุบันตามเดิม (ทุกโมดูลยังอ่าน/เขียนที่นี่) แล้วสะท้อน (mirror) ลงช่องเซฟของแต่ละบริษัท:
   mct_idx            ดัชนีช่องเซฟ {v,order,meta,active,fresh}
   mct_slot_<id>      ข้อมูลเซฟหลัก      mct_slot_<id>_bak   สำรองล่าสุด
   เขียนแบบปลอดภัย: เขียนไฟล์ชั่วคราว → ตรวจอ่านกลับ → สลับเป็นไฟล์หลัก (ถ้าล้มเหลวไม่แตะของเดิม) */
(function(){
'use strict';
if(window.SLOTS)return;
const IDX='mct_idx',MAIN='mct2',MAXS=30,BAK_GAP=180000;
const $=id=>document.getElementById(id);
const lsG=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
const lsS=(k,v)=>localStorage.setItem(k,v);
const lsR=k=>{try{localStorage.removeItem(k)}catch(e){}};
const P=id=>'mct_slot_'+id,B=id=>'mct_slot_'+id+'_bak';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const newId=()=>'s'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function valid(j){try{const d=typeof j==='string'?JSON.parse(j):j;return !!(d&&typeof d==='object'&&typeof d.money==='number'&&isFinite(d.money)&&typeof d.day==='number'&&Array.isArray(d.emp)&&Array.isArray(d.f))}catch(e){return false}}
function info(d,ts){return{name:String(d.name||'My Company').slice(0,40),money:Math.round(d.money||0),emp:(d.emp||[]).length,day:d.day|0,t:Math.round(d.t||0),lv:d.lv||1,ts:ts||Date.now()}}
function rebuild(){ // ดัชนีเสีย → สแกนหาช่องเซฟจริง
 const x={v:1,order:[],meta:{},active:null,fresh:null};
 try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i),m=/^mct_slot_([a-z0-9]+)$/.exec(k||'');if(!m)continue;
  let j=lsG(k);if(!valid(j))j=lsG(B(m[1]));if(valid(j)){x.meta[m[1]]=info(JSON.parse(j),0);x.order.push(m[1])}}}catch(e){}
 return x}
function rIdx(){
 const raw=lsG(IDX);if(raw==null)return{v:1,order:[],meta:{},active:null,fresh:null};
 try{const x=JSON.parse(raw);if(x&&x.v===1&&Array.isArray(x.order)&&x.meta&&typeof x.meta==='object')return x}catch(e){}
 const x=rebuild();try{lsS(IDX,JSON.stringify(x))}catch(e){}return x}
function wIdx(x){lsS(IDX,JSON.stringify(x))}
// ย้ายเซฟเก่า (mct2 ช่องเดียว) เข้าช่องแรก — ครั้งเดียว ไม่ลบของเดิม
(function migrate(){
 if(lsG(IDX)!=null)return;
 const m=lsG(MAIN);if(!valid(m))return;
 try{const id=newId(),x={v:1,order:[id],meta:{},active:id,fresh:null};x.meta[id]=info(JSON.parse(m),Date.now());lsS(P(id),m);wIdx(x)}catch(e){console.error(e)}
})();

const ready=()=>{try{return typeof S!=='undefined'&&S&&typeof S.money==='number'}catch(e){return false}};
const lobbyUp=()=>{const L=$('lobby');return !!L&&getComputedStyle(L).display!=='none'};
function canWrite(){return lsG(IDX)==null||!!rIdx().active}

function mirror(j){
 try{
  const d=JSON.parse(j);if(!valid(d))return false;
  const x=rIdx(),had=lsG(IDX)!=null;
  if(!x.active){if(had)return true;x.active=newId()}
  const id=x.active,now=Date.now(),tmp=P(id)+'_new';
  lsS(tmp,j);if(lsG(tmp)!==j){lsR(tmp);return false}
  const old=lsG(P(id)),m=x.meta[id]||{};
  if(old&&valid(old)&&(!lsG(B(id))||now-(m.bakTs||0)>BAK_GAP)){lsS(B(id),old);m.bakTs=now}
  lsS(P(id),j);lsR(tmp);
  x.meta[id]=Object.assign(m,info(d,now));
  if(!x.order.includes(id))x.order.push(id);
  if(x.fresh===id)x.fresh=null;
  wIdx(x);return true;
 }catch(e){console.error('slot save failed',e);return false}
}
function verify(){const x=rIdx();return !!x.active&&lsG(P(x.active))===lsG(MAIN)&&valid(lsG(MAIN))}

/* ---------- สถานะบันทึก ---------- */
let stEl=null;
function chip(t,cls,ms,click){
 if(!stEl){stEl=document.createElement('div');stEl.id='slStat';document.body.appendChild(stEl)}
 stEl.textContent=t;stEl.className='show '+(cls||'');stEl.onclick=click||null;clearTimeout(chip.t);if(ms)chip.t=setTimeout(()=>{stEl.className=''},ms);
}
function auto(why){
 if(!ready()||lobbyUp()||!canWrite())return true;
 chip('💾 กำลังบันทึก…','',0);
 let ok=false;try{ok=save(1)!==false}catch(e){ok=false}
 if(ok)chip('✓ บันทึกแล้ว','ok',1400);
 else chip('⚠ บันทึกไม่สำเร็จ · แตะเพื่อลองใหม่','bad',8000,()=>auto('retry'));
 return ok;
}
setInterval(()=>auto('timer'),60000);
let lastDay=null,lastPlace=null;
setInterval(()=>{
 if(!ready()||lobbyUp())return;
 if(lastDay!==null&&S.day!==lastDay)auto('day');lastDay=S.day;
 try{const q=CEOScene.dbg().st;if(lastPlace!==null&&q.place!==lastPlace)auto('scene');lastPlace=q.place}catch(e){}
},1500);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&ready()&&!lobbyUp()&&canWrite()){try{save(1)}catch(e){}}});
addEventListener('pagehide',()=>{if(ready()&&!lobbyUp()&&canWrite()){try{save(1)}catch(e){}}});
{const x=rIdx();if(x.fresh&&x.fresh===x.active)setTimeout(()=>{if(ready()&&canWrite()){try{save(1)}catch(e){}}},1500)}

/* ---------- หน้าต่าง ---------- */
let ov=null,dlgEl=null,view=null; // view={mode,sel,manage}
function mk(){
 if(ov)return;
 ov=document.createElement('div');ov.id='slOv';
 ov.innerHTML='<div class="slWin"><img class="slCrest" alt="" src="'+(window.SLOT_CREST||'')+'"><div class="slTitle"><b id="slT"></b></div><div class="slBody" id="slBody"></div><div class="slFoot" id="slFoot"></div><div class="slHint" id="slHint"></div></div>';
 document.body.appendChild(ov);
 dlgEl=document.createElement('div');dlgEl.id='slDlg';document.body.appendChild(dlgEl);
 document.addEventListener('keydown',e=>{
  if(e.key!=='Escape')return;
  if(dlgEl.classList.contains('show')){e.preventDefault();e.stopImmediatePropagation();dlgEl._res&&dlgEl._res(0);return}
  if(ov.classList.contains('show')){e.preventDefault();e.stopImmediatePropagation();closeOv()}
 },true);
}
function closeOv(){if(ov)ov.classList.remove('show');view=null}
function dlg(title,msg,btns){
 mk();
 return new Promise(res=>{
  dlgEl.innerHTML='<div class="slDbox"><h3>'+esc(title)+'</h3><p>'+esc(msg)+'</p><div class="slFoot">'+btns.map((b,i)=>'<button class="slBtn '+(b.c||'')+'" data-i="'+i+'">'+esc(b.t)+'</button>').join('')+'</div></div>';
  const done=v=>{dlgEl.classList.remove('show');dlgEl._res=null;res(v)};
  dlgEl._res=done;
  dlgEl.querySelectorAll('button').forEach(b=>b.onclick=()=>done(btns[+b.dataset.i].v));
  dlgEl.classList.add('show');
 });
}
function fmtTs(ts){if(!ts)return '—';try{return new Date(ts).toLocaleString('th-TH',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}catch(e){return new Date(ts).toISOString().slice(0,16).replace('T',' ')}}
function dateTxt(day){const Y=typeof YEAR_DAYS==='number'?YEAR_DAYS:360;return 'วันที่ '+(((day-1)%30)+1)+' · เดือน '+(Math.floor(((day-1)%Y)/30)+1)+' · ปี '+(Math.floor((day-1)/Y)+1)}
function timeTxt(t){const h=Math.floor(t/60)%24,m=Math.floor(t%60);return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')}
const money=n=>'$'+Number(n||0).toLocaleString('en-US');
function avatar(){try{return CHAR_ASSETS['mild-formal'].frames[0][0]}catch(e){return ''}}
function slotState(id){
 const x=rIdx(),m=x.meta[id]||{},mainOk=valid(lsG(P(id))),bakOk=valid(lsG(B(id)));
 let d=null;try{if(mainOk)d=JSON.parse(lsG(P(id)));else if(bakOk)d=JSON.parse(lsG(B(id)))}catch(e){}
 const f=d?info(d,m.ts):m;
 return{id,mainOk,bakOk,f,active:x.active===id,usable:mainOk||bakOk,has:!!(d||m.name)};
}
function list(){const x=rIdx();return x.order.filter(id=>x.meta[id]||lsG(P(id))!=null).map(slotState).sort((a,b)=>(b.f.ts||0)-(a.f.ts||0))}

function rowHtml(s,i){
 const f=s.f||{};
 let bd='<span class="slBd ok">✔ ปกติ</span>',cls='';
 if(s.active)bd='<span class="slBd">▶ เซฟล่าสุดที่เล่น</span>';
 if(!s.mainOk&&s.bakOk){bd='<span class="slBd warn">⚠ ไฟล์เสีย · มีข้อมูลสำรอง</span>';cls=' bad'}
 if(!s.usable){bd='<span class="slBd bad">✖ ไฟล์เสียหาย</span>';cls=' bad'}
 return '<div class="slRow'+cls+'" data-id="'+s.id+'"><div class="slAv">'+(avatar()?'<img alt="" src="'+avatar()+'">':'<i>CEO</i>')+'</div>'+
  '<div class="slTx"><div class="slNm">🏢 '+esc(f.name||'My Company')+'</div><div class="slMt"><span>📅 '+dateTxt(f.day||1)+' · '+timeTxt(f.t||0)+'</span><span>💰 <b>'+money(f.money)+'</b></span><span>👥 <b>'+(f.emp|0)+'</b> พนักงาน</span></div></div>'+
  '<div class="slSt"><span class="slTs">บันทึกล่าสุด<br>'+fmtTs(f.ts)+'</span>'+bd+'</div></div>';
}
const emptyRow='<div class="slRow empty"><div class="slAv"><i>＋</i></div><div class="slEmptyT">EMPTY SLOT</div></div>';

function openList(mode,manage){
 mk();view={mode,sel:null,manage:!!manage};renderList();ov.classList.add('show');
}
function renderList(){
 const s=list(),body=$('slBody'),foot=$('slFoot'),over=view.mode==='over';
 $('slT').textContent=over?'เลือกช่องที่จะเขียนทับ':'เล่นต่อ · SAVE SLOTS';
 $('slHint').textContent='';
 if(!s.length){
  body.innerHTML='<div class="slNone" style="width:100%">📭 ยังไม่มีข้อมูลการเล่น<br><small style="font-weight:700">กด "เริ่มเกมใหม่" เพื่อเริ่มสร้างบริษัทของคุณ</small></div>';
  foot.innerHTML='<button class="slBtn gray" id="slBack">⬅ กลับ</button>';$('slBack').onclick=closeOv;return;
 }
 let rows=s.map(rowHtml).join('');
 for(let i=s.length;i<3;i++)rows+=emptyRow;
 body.innerHTML='<div class="slList" id="slList">'+rows+'</div><div class="slBar"><button id="slUp">▲</button><div class="slTrack" id="slTrack"><div class="slThumb" id="slThumb"></div></div><button id="slDn">▼</button></div>';
 const L=$('slList');
 L.querySelectorAll('.slRow:not(.empty)').forEach(r=>r.onclick=()=>{view.sel=r.dataset.id;sync()});
 L.addEventListener('scroll',thumb);addEventListener('resize',thumb);
 $('slUp').onclick=()=>L.scrollBy({top:-90,behavior:'smooth'});$('slDn').onclick=()=>L.scrollBy({top:90,behavior:'smooth'});
 const tr=$('slTrack');
 tr.onpointerdown=e=>{const mv=ev=>{const r=tr.getBoundingClientRect(),k=Math.max(0,Math.min(1,(ev.clientY-r.top)/r.height));L.scrollTop=k*(L.scrollHeight-L.clientHeight)};mv(e);tr.setPointerCapture(e.pointerId);tr.onpointermove=mv;tr.onpointerup=()=>{tr.onpointermove=null}};
 sync();setTimeout(thumb,30);
}
function thumb(){
 const L=$('slList'),T=$('slThumb'),tr=$('slTrack');if(!L||!T||!tr)return;
 const h=tr.clientHeight-6,ratio=Math.min(1,L.clientHeight/Math.max(1,L.scrollHeight)),th=Math.max(22,h*ratio);
 T.style.height=th+'px';const mx=L.scrollHeight-L.clientHeight;T.style.top=(mx>0?(L.scrollTop/mx)*(h-th):0)+'px';
}
function sync(){
 const L=$('slList'),foot=$('slFoot'),over=view.mode==='over';
 if(L)L.querySelectorAll('.slRow').forEach(r=>r.classList.toggle('sel',r.dataset.id===view.sel));
 const s=view.sel?slotState(view.sel):null;
 let h='';
 if(over)h+='<button class="slBtn red" id="slGo"'+(s?'':' disabled')+'>♻ เขียนทับ</button>';
 else{
  h+='<button class="slBtn" id="slGo"'+(s&&s.usable?'':' disabled')+'>▶ LOAD</button>';
  if(s&&!s.mainOk&&s.bakOk)h+='<button class="slBtn gold" id="slRes">♻ กู้คืนจากสำรอง</button>';
  h+='<button class="slBtn red" id="slDel"'+(s?'':' disabled')+'>🗑 DELETE</button>';
 }
 h+='<button class="slBtn gray" id="slBack">⬅ กลับ</button>';
 foot.innerHTML=h;
 $('slHint').textContent=s?'เลือก: '+(s.f.name||'My Company'):'แตะเลือกช่องเซฟที่ต้องการ';
 $('slBack').onclick=()=>{if(view.manage||view.mode==='cont')closeOv();else openNew()};
 const go=$('slGo');if(go)go.onclick=()=>over?doOverwrite(view.sel):doLoad(view.sel);
 const dl=$('slDel');if(dl)dl.onclick=()=>doDelete(view.sel);
 const rs=$('slRes');if(rs)rs.onclick=()=>doRestore(view.sel);
}
function go(){ // เข้าเกมด้วยการรีโหลด (ให้ทุกระบบโหลดสถานะเดียวกันและไม่เกิด NPC ซ้ำ)
 try{sessionStorage.setItem('mct_skip_lobby','1')}catch(e){}
 const f=$('lbFade');if(f)f.style.opacity=1;
 setTimeout(()=>{try{location.reload()}catch(e){}},420);
}
async function doLoad(id){
 const x=rIdx(),s=slotState(id);if(!s.usable){await dlg('โหลดไม่ได้','ไฟล์เซฟนี้เสียหายและไม่มีข้อมูลสำรอง',[{t:'ตกลง',v:1}]);return}
 let j=lsG(P(id));
 if(!valid(j)){
  const ok=await dlg('ไฟล์เซฟหลักเสียหาย','พบข้อมูลสำรองของ “'+(s.f.name||'')+'”\n('+dateTxt(s.f.day||1)+' · '+money(s.f.money)+')\nต้องการโหลดจากข้อมูลสำรองหรือไม่?',[{t:'โหลดจากข้อมูลสำรอง',v:1,c:'green'},{t:'ยกเลิก',v:0,c:'gray'}]);
  if(!ok)return;j=lsG(B(id));try{lsS(P(id),j)}catch(e){}
 }
 try{lsS(MAIN,j);x.active=id;x.fresh=null;wIdx(x)}catch(e){await dlg('โหลดไม่สำเร็จ','เขียนข้อมูลลงที่เก็บไม่ได้ (พื้นที่เต็มหรือถูกจำกัด)',[{t:'ตกลง',v:1}]);return}
 chip('กำลังโหลด…','',0);go();
}
async function doRestore(id){
 const s=slotState(id);if(!s.bakOk)return;
 const ok=await dlg('กู้คืนจากข้อมูลสำรอง','กู้คืน “'+(s.f.name||'')+'” จากข้อมูลสำรอง?\n'+dateTxt(s.f.day||1)+' · '+money(s.f.money)+' · '+(s.f.emp|0)+' พนักงาน',[{t:'กู้คืน',v:1,c:'green'},{t:'ยกเลิก',v:0,c:'gray'}]);
 if(!ok)return;
 try{lsS(P(id),lsG(B(id)));const x=rIdx();x.meta[id]=Object.assign(x.meta[id]||{},info(JSON.parse(lsG(P(id))),Date.now()));wIdx(x)}catch(e){await dlg('กู้คืนไม่สำเร็จ','ลองใหม่อีกครั้ง',[{t:'ตกลง',v:1}])}
 renderList();
}
async function doDelete(id){
 const s=slotState(id);
 const ok=await dlg('ลบเซฟ','ต้องการลบเซฟของบริษัท “'+(s.f.name||'My Company')+'” ใช่หรือไม่?\n'+dateTxt(s.f.day||1)+' · '+money(s.f.money)+' · '+(s.f.emp|0)+' พนักงาน\n\nการลบนี้ไม่สามารถย้อนกลับได้ และจะไม่กระทบเซฟช่องอื่น',[{t:'ลบเซฟนี้',v:1,c:'red'},{t:'ยกเลิก',v:0,c:'gray'}]);
 if(!ok)return;
 try{const x=rIdx();lsR(P(id));lsR(B(id));lsR(P(id)+'_new');delete x.meta[id];x.order=x.order.filter(q=>q!==id);if(x.active===id){x.active=null;x.fresh=null;lsR(MAIN)}wIdx(x)}catch(e){console.error(e)}
 view.sel=null;renderList();chip('🗑 ลบเซฟแล้ว','ok',1600);
 const c=$('lbCont');if(c)c.disabled=false;
}
function openNew(){
 mk();view={mode:'new',sel:null};
 const n=list().length;
 $('slT').textContent='เริ่มเกมใหม่';$('slHint').textContent='';
 $('slBody').innerHTML='<div class="slChoice"><div class="slCard" id="slNewA"><b>🆕 สร้างเซฟใหม่</b><span>เริ่มบริษัทใหม่ในช่องเซฟใหม่<br>ไม่แตะเซฟเดิม · มีหลายบริษัทได้'+(n>=MAXS?'<br>(ช่องเต็ม '+MAXS+' ช่องแล้ว)':'')+'</span></div><div class="slCard'+(n?'':' off')+'" id="slNewB"><b>♻ เริ่มใหม่ทับเซฟเดิม</b><span>เลือกช่องที่ต้องการเขียนทับ<br>มีหน้าต่างยืนยันก่อนลบข้อมูลเดิม</span></div></div>';
 $('slFoot').innerHTML='<button class="slBtn gray" id="slBack">⬅ กลับ</button>';
 $('slBack').onclick=closeOv;
 $('slNewA').onclick=()=>{if(n>=MAXS){dlg('ช่องเซฟเต็ม','มีเซฟครบ '+MAXS+' ช่องแล้ว กรุณาลบเซฟที่ไม่ใช้ หรือเลือกเขียนทับ',[{t:'ตกลง',v:1}]);return}startNew(null)};
 $('slNewB').onclick=()=>openList('over');
 ov.classList.add('show');
}
function startNew(overId){
 try{
  const x=rIdx(),id=overId||newId();
  if(overId){lsR(P(id));lsR(B(id));lsR(P(id)+'_new');delete x.meta[id];x.order=x.order.filter(q=>q!==id)}
  x.active=id;x.fresh=id;wIdx(x);lsR(MAIN);
 }catch(e){dlg('เริ่มเกมใหม่ไม่ได้','เขียนข้อมูลลงที่เก็บไม่ได้ (พื้นที่เต็มหรือถูกจำกัด)',[{t:'ตกลง',v:1}]);return}
 chip('กำลังเริ่มเกมใหม่…','',0);go();
}
async function doOverwrite(id){
 const s=slotState(id);
 const ok=await dlg('เริ่มเกมใหม่ทับข้อมูลเดิม','คุณต้องการเริ่มเกมใหม่ทับข้อมูลการเล่นนี้หรือไม่?\n\n🏢 '+(s.f.name||'My Company')+'\n'+dateTxt(s.f.day||1)+' · '+money(s.f.money)+' · '+(s.f.emp|0)+' พนักงาน\n\n⚠ ข้อมูลเดิมของช่องนี้จะถูกลบทั้งหมดและกู้คืนไม่ได้ (ช่องอื่นไม่ถูกกระทบ)',[{t:'ยืนยันการเขียนทับ',v:1,c:'red'},{t:'ยกเลิก',v:0,c:'gray'}]);
 if(ok)startNew(id);
}
/* กลับหน้าหลักจากเมนูหยุดเกม: ยืนยัน → บันทึก → ตรวจผล → กลับ */
async function exitToMenu(){
 mk();
 const yes=await dlg('กลับหน้าหลัก','ต้องการกลับสู่หน้าหลักหรือไม่?\nเกมจะบันทึกข้อมูลปัจจุบันก่อนออก',[{t:'กลับหน้าหลัก',v:1,c:'green'},{t:'ยกเลิก',v:0,c:'gray'}]);
 if(!yes)return;
 for(;;){
  if(!canWrite())break; // ไม่ผูกกับช่องเซฟแล้ว (เช่นเพิ่งลบ) → ไม่มีอะไรให้บันทึก
  chip('💾 กำลังบันทึก…','',0);await sleep(300);
  let ok=false;try{ok=save(1)!==false&&verify()}catch(e){ok=false}
  if(ok){chip('✓ บันทึกสำเร็จ','ok',1500);break}
  chip('⚠ บันทึกไม่สำเร็จ','bad',0);
  const again=await dlg('บันทึกไม่สำเร็จ','ยังไม่สามารถบันทึกเกมได้ (ที่เก็บข้อมูลอาจเต็ม) ข้อมูลเดิมยังไม่ถูกแตะต้อง\nต้องการลองบันทึกอีกครั้งหรือไม่?',[{t:'ลองบันทึกอีกครั้ง',v:1,c:'gold'},{t:'อยู่ในเกมต่อ',v:0,c:'gray'}]);
  if(!again){chip('','',1);return}
 }
 try{UI.returnTitle()}catch(e){}
 const c=$('lbCont');if(c)c.disabled=false;
}

// ---- ต่อเข้ากับหน้าหลักเดิม (ปุ่ม เริ่มเล่น / เล่นต่อ / ลบเซฟ) ----
function wire(){
 const c=$('lbCont'),n=$('lbNew'),d=$('lbDel');if(!c||!n)return;
 c.disabled=false;
 const press=(b,fn)=>e=>{b.classList.add('pressed');setTimeout(()=>{b.classList.remove('pressed');fn()},140)};
 c.onclick=press(c,()=>openList('cont'));
 n.onclick=press(n,()=>openNew());
 if(d)d.onclick=()=>openList('cont',true);
 if(window.UI&&UI.returnTitle&&!UI.returnTitle.__sl){const o=UI.returnTitle;UI.returnTitle=function(){const r=o.apply(this,arguments);const cc=$('lbCont');if(cc)cc.disabled=false;return r};UI.returnTitle.__sl=1}
}
wire();
window.SLOTS={mirror,canWrite,verify,exit:exitToMenu,auto,list:()=>list(),idx:rIdx,openList,openNew,valid};
})();

