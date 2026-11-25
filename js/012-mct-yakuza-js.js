
/* =====================================================================
   YAKUZA ALLIANCE SYSTEM · พันธมิตรยากูซ่า (โมดูลแยก)
   ใช้ตัวละคร ริวจิ (boss) / เก็นจิ (guard) และระบบเดินของ NPC จาก LOAN เดิม (LOAN._x)
   สถานะ: NONE · OFFER (กำลังเสนอ) · EXPIRED · DECLINED · ALLIED   (เก็บใน S.yk ไปกับเซฟเดิม)
   - ข้อเสนอ: ความสนิทริวจิ >= 500 และเก็นจิ >= 500 → มาที่บริษัทครั้งเดียว
   - ค่าธรรมเนียม 50,000 · ค่าจ้างลูกน้อง 2 × 11,000 = 22,000/เดือน (หักวันที่ 28 ของเดือนตามปฏิทินเดิม)
   - ลูกน้อง 2 คนเฝ้าถนนหน้าบริษัท 06:00–19:00 (สถานะคำนวณจากเวลาเกม ไม่ค้างเมื่อเปลี่ยนฉาก)
   - ระบบคุ้มครองบล็อกการสุ่มโจรกรรม (THIEF) ขณะ ALLIED และไม่ถูกระงับ
   ===================================================================== */
(function(){
'use strict';
const FEE=50000,WAGE_EACH=11000,WAGE=WAGE_EACH*2,NEED=500,WAIT=20,DUE_DIM=28,DUTY0=6,DUTY1=19,WALK_REAL=14,MIN_JOIN_DAYS=10;
const $=id=>document.getElementById(id);
const okS=()=>{try{return typeof S==='object'&&S&&Array.isArray(S.emp)&&window.LOAN&&LOAN._x&&typeof LOAN_PORT!=='undefined'}catch(e){return false}};
const fm=n=>{try{return M(n)}catch(e){return '$'+Math.round(n).toLocaleString()}};
const esc=s=>String(s).replace(/[&<>"]/g,'');

/* ---------------------------------------------------------------- state */
function yk(){
 if(!S.yk||typeof S.yk!=='object')S.yk={};
 const y=S.yk;
 if(!y.st)y.st='NONE';
 if(!y.cl||typeof y.cl!=='object')y.cl={r:0,g:0};
 if(!y.talk||typeof y.talk!=='object')y.talk={r:0,g:0};
 if(typeof y.cl.r!=='number')y.cl.r=0;if(typeof y.cl.g!=='number')y.cl.g=0;
 if(typeof y.joinDay!=='number')y.joinDay=0;
 if(!y.arr||typeof y.arr!=='object')y.arr={n:0,amt:0};
 if(!Array.isArray(y.hist))y.hist=[];
 if(!Array.isArray(y.g)||y.g.length!==2)y.g=[{st:'ABSENT',t0:0},{st:'ABSENT',t0:0}];
 ['susp','warnPend','warnDay','collectDay','suspDay','passDay'].forEach(k=>{if(typeof y[k]!=='number')y[k]=0});
 if(typeof y.dueKey!=='number')y.dueKey=-1;
 return y;
}
const X=()=>LOAN._x;
const abs=()=>(S.day-1)*1440+S.t;
const mKey=()=>Math.floor((S.day-1)/30);
const dim=()=>((S.day-1)%30)+1;
const protectOn=()=>{const y=yk();return y.st==='ALLIED'&&!y.susp};
const walkMin=()=>WALK_REAL*1440/(S.dl||900);
function addHist(kind,amt,note){const y=yk();y.hist.push({d:S.day,k:kind,a:amt,n:note||''});if(y.hist.length>24)y.hist=y.hist.slice(-24)}
function spend(amt){S.money-=amt;S.today=S.today||{};S.today.yz=(S.today.yz||0)+amt}
function gain(who,n){const y=yk(),k=who==='r'?'r':'g';y.cl[k]=Math.min(1000,(y.cl[k]||0)+n)}
const dateTxt=d=>'เดือน '+(Math.floor(((d-1)%360)/30)+1)+' วันที่ '+(((d-1)%30)+1);
function nextDue(){ // วันที่ 28 ถัดไปที่จะถูกเก็บ
 const y=yk();let d=S.day;for(let i=0;i<70;i++,d++){if(((d-1)%30)+1===DUE_DIM&&d-y.joinDay>=MIN_JOIN_DAYS&&d>=S.day)return d}return null}

/* ---------------------------------------------------------------- ความสนิท */
function wrapLoan(){
 if(wrapLoan.done||!okS())return;wrapLoan.done=1;
 const oa=LOAN.accept,op=LOAN.pay;
 if(typeof oa==='function')LOAN.accept=function(){const L=X().ens(),had=!!X().mafiaLoan();const r=oa.apply(this,arguments);try{if(!had&&X().mafiaLoan()){gain('r',30);gain('g',20)}}catch(e){}return r};
 if(typeof op==='function')LOAN.pay=function(){const ml=X().mafiaLoan(),late=ml?(ml.late||0):0,m0=S.money;const r=op.apply(this,arguments);try{if(ml&&!X().mafiaLoan()&&S.money<m0){if(late){gain('r',25);gain('g',15)}else{gain('r',60);gain('g',40)}}}catch(e){}return r};
 try{const og=OS.go;if(!og._yz){OS.go=function(a){if(a==='yakuza'){tab='home';msg=''}return og.apply(this,arguments)};OS.go._yz=1}}catch(e){}
 const oc=LOAN.contactApp;
 if(typeof oc==='function'){
  const w=function(){return oc.apply(this,arguments)+contactExtra()};w._yz=1;LOAN.contactApp=w;
 }
}
function bar(v){const p=Math.max(0,Math.min(1,v/NEED));return '<div style="height:7px;background:#1b2440;border-radius:4px;overflow:hidden;margin:2px 0 6px"><div style="height:100%;width:'+(p*100).toFixed(0)+'%;background:linear-gradient(90deg,#c0392b,#e0b04a)"></div></div>'}
function contactExtra(){
 const y=yk(),L=X().ens();if(!L.contact)return '';
 const busy=L.visit||L.actors.length;
 const tr=y.talk.r===S.day,tg=y.talk.g===S.day;
 return '<div style="margin-top:10px;padding:8px;border:1px solid #6a86b8;border-radius:8px;background:#222c40;color:#e8eefc"><b>🐉 ความสนิทกับแก๊งยากูซ่า</b>'+
  '<div style="font-size:12px;margin-top:4px">ริวจิ: <b>'+Math.floor(y.cl.r)+'</b> / '+NEED+bar(y.cl.r)+'เก็นจิ: <b>'+Math.floor(y.cl.g)+'</b> / '+NEED+bar(y.cl.g)+'</div>'+
  '<div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn osAct" style="flex:1;background:#8e2a35;color:#fff" '+(tr||busy?'disabled':'')+' onclick="YZ.chat(\'r\')">☕ ชวนริวจิคุย'+(tr?' (วันนี้คุยแล้ว)':'')+'</button>'+
  '<button class="btn osAct" style="flex:1;background:#8e2a35;color:#fff" '+(tg||busy?'disabled':'')+' onclick="YZ.chat(\'g\')">☕ ชวนเก็นจิคุย'+(tg?' (วันนี้คุยแล้ว)':'')+'</button></div>'+
  '<small style="display:block;margin-top:5px;color:#b7c0d2">ความสนิทเพิ่มจาก: ยืม/คืนเงินตรงเวลา · ชวนคุยวันละครั้ง · เมื่อสนิทครบ 500 ทั้งคู่ จะมีข้อเสนอพิเศษ</small></div>';
}
const CHAT={
 r:['ผมไม่ค่อยคุยกับใครนานๆ... แต่คุณนี่ก็น่าสนใจดี','ย่านกลางคืนนี้ผมดูแลมาสิบกว่าปี คนที่ซื่อตรงกับผมมีไม่กี่คน','ว่างๆ ก็แวะมาดื่มชาที่สำนักงานผมได้นะ'],
 g:['หัวหน้าไม่ได้ดุอย่างที่คุณคิดหรอกครับ แค่ไม่ชอบรอ','ผมอยู่กับท่านมาตั้งแต่เด็ก... ท่านเป็นคนที่ไว้ใจได้','ถ้ามีเรื่องเดือดร้อน บอกผมได้เสมอครับ']
};
function chat(who){
 if(!okS())return;
 const y=yk(),L=X().ens();
 if(!L.contact)return toast('ยังไม่มีคอนแท็คยากูซ่า');
 if(L.visit||L.actors.length)return toast('ตอนนี้มีแขกอยู่ในออฟฟิศ โทรไม่ได้');
 const k=who==='r'?'r':'g';
 if(y.talk[k]===S.day)return toast('วันนี้คุยกับเขาไปแล้ว พรุ่งนี้ค่อยโทรใหม่นะ');
 y.talk[k]=S.day;gain(k,15);
 try{save(1)}catch(e){}
 try{if(window.OS&&OS.on)OS.close()}catch(e){}
 const nm=k==='r'?'ริวจิ':'เก็นจิ',who2=k==='r'?'boss':'guard',arr=CHAT[k];
 open([{who:who2,t:'(โทรศัพท์) '+arr[Math.floor(Math.random()*arr.length)]},{who:who2,t:'...ความสนิทกับ'+nm+'เพิ่มขึ้น +15 (ตอนนี้ '+Math.floor(y.cl[k])+'/'+NEED+')'}]);
 log('📞 โทรคุยกับ'+nm+' · ความสนิท +15');
}

/* ---------------------------------------------------------------- ข้อเสนอ (เหตุการณ์ในบริษัท) */
function canStartVisit(){
 if(!okS())return false;
 if(S.over||S.paused||(typeof CUT!=='undefined'&&CUT.on))return false;
 try{if(CEOScene.dbg().st.active)return false}catch(e){}
 try{if(window.QCUT&&QCUT.on())return false}catch(e){}
 try{if(window.TUT&&TUT.busy&&TUT.busy())return false}catch(e){}
 if($('evModal')||(($('loanModal'))&&!$('loanModal').hidden))return false;
 const L=X().ens();
 if(L.visit||L.actors.length)return false;
 if(S.customer&&S.customer.active&&S.customer.active.state!=='gone'&&S.customer.active.state!=='off')return false;
 if(S.day<2)return false;
 return true;
}
function startVisit(mode){
 const x=X(),L=x.ens(),y=yk();
 const roles=mode==='ally-warn'?['guard']:['boss','guard'];
 const tg=x.targets(roles.length);
 L.actors=roles.map((r,i)=>x.mkActor(r,tg[i],i*1.1));
 L.visit={yz:1,kind:'mafia',mode:mode,stage:'talk',page:0,day:S.day,wait:null,seen:0,say:'',result:null,loanId:0,cd:0};
 if(mode==='ally'){y.st='OFFER';y.offerDay=S.day}
 x.shake();
 log(mode==='ally'?'🐉 ริวจิและเก็นจิเดินเข้ามาที่บริษัท... ดูเหมือนมีเรื่องจะคุยด้วย':mode==='ally-warn'?'🐉 เก็นจิมาพบ เรื่องค่าจ้างลูกน้องที่ค้างชำระ':'🐉 ริวจิมาทวงค่าจ้างลูกน้องที่ค้างชำระ');
 try{toast(mode==='ally'?'🐉 มีแขกพิเศษมาที่บริษัท · เดินไปคุยแล้วกด E':'🐉 ยากูซ่ามาที่บริษัท · เดินไปคุยแล้วกด E')}catch(e){}
 try{save(1)}catch(e){}
 return true;
}
function maybeStart(h){
 if(!okS())return false;
 const y=yk();
 if(h<10||h>=16)return false;
 if(y.st==='NONE'&&y.cl.r>=NEED&&y.cl.g>=NEED&&!X().mafiaLoan()){
  if(!canStartVisit())return false;
  return startVisit('ally');
 }
 if(y.st==='ALLIED'&&y.arr.n===1&&y.warnPend&&canStartVisit()){y.warnPend=0;y.warnDay=S.day;return startVisit('ally-warn')}
 if(y.st==='ALLIED'&&y.susp&&y.arr.n>=2&&S.day-y.collectDay>=3&&S.day>y.suspDay&&canStartVisit()){y.collectDay=S.day;return startVisit('ally-collect')}
 return false;
}
function leave(v,why){
 const x=X(),L=x.ens();
 if(v)v.stage='done';
 closeDlg();hideCd();
 if(why)log(why);
 x.leaveAll();
 try{save(1)}catch(e){}
}
function expire(v,why){const y=yk();if(y.st==='OFFER')y.st='EXPIRED';leave(v,why||'🐉 ริวจิรอไม่ไหวจึงเดินออกไป · ยังติดต่อเจรจาได้ที่คอมพิวเตอร์ CEO (ติดต่อพันธมิตรยากูซ่า)');}
function visitTick(v,dr,h){
 const x=X(),L=x.ens(),y=yk();
 if(v.stage==='done'){ // รออัปเดตจนทุกคนเดินออกแล้วเคลียร์ visit
  if(!L.actors.length){L.visit=null;closeDlg();hideCd()}
  return;
 }
 if(!L.actors.length){ // ไม่มีตัวละครแล้ว (เช่นโหลดเซฟ) → จบ
  if(v.mode==='ally'&&y.st==='OFFER')y.st='EXPIRED';
  L.visit=null;closeDlg();hideCd();return;
 }
 if(v.day!==S.day||h>=17||h<6){
  if(v.mode==='ally')expire(v,'🐉 ริวจิกลับไปก่อนเพราะหมดเวลาทำการ · ยังเจรจาได้ที่คอมพิวเตอร์ CEO');
  else leave(v,'🐉 ยากูซ่ากลับไปแล้ว เพราะหมดเวลาทำการ');
  return;
 }
 if(v.mode==='ally'&&v.stage==='count'){
  v.cd-=dr;
  showCd(Math.max(0,Math.ceil(v.cd)));
  if(v.cd<=0)expire(v);
 }
}

/* ---------------------------------------------------------------- สร้างบทสนทนา */
function offerCard(){
 return '<div class="yzCard"><b>🐉 ข้อเสนอพันธมิตรยากูซ่า</b><div class="yzG"><span>ค่าธรรมเนียมเข้าร่วม</span><b style="color:#ffd45a">'+fm(FEE)+'</b><span>ค่าจ้างลูกน้อง 2 คน</span><b>'+fm(WAGE)+' / เดือน</b><span>สิ่งที่ได้</span><b>ลูกน้องเฝ้าหน้าบริษัท 06:00–19:00 · ปกป้องจากโจรกรรม</b></div><small>ค่าจ้างหักวันที่ '+DUE_DIM+' ของทุกเดือน · ค้างชำระ 2 เดือนจะถูกระงับการคุ้มครอง</small></div>';
}
function money(){return Math.floor(S.money)}
function joinNow(){
 const y=yk();
 if(y.st==='ALLIED')return false;
 if(S.money<FEE)return false;
 spend(FEE);y.st='ALLIED';y.joinDay=S.day;y.susp=0;y.arr={n:0,amt:0};y.warnPend=0;y.dueKey=-1;
 y.g.forEach(g=>{g.st='ABSENT';g.t0=0});
 addHist('fee',FEE,'ค่าธรรมเนียมเข้าร่วมแก๊ง');
 log('🐉 เข้าร่วมเป็นพันธมิตรยากูซ่า! จ่ายค่าธรรมเนียม '+fm(FEE)+' · ลูกน้อง 2 คนจะเริ่มเฝ้าบริษัท');
 try{toast('🐉 เข้าร่วมแก๊งสำเร็จ! ลูกน้องจะมาเฝ้าหน้าบริษัท')}catch(e){}
 try{save(1);hud();show()}catch(e){}
 guardTick();
 return true;
}
function talkVisit(v){
 if(v.stage==='done')return;
 const y=yk();
 if(v.mode==='ally'){
  const pages=[
   {who:'boss',t:'ดูเหมือนช่วงนี้แกจะเริ่มไปได้สวยนะ บริษัทก็เติบโตขึ้นเยอะ'},
   {who:'guard',t:'หัวหน้า ผมว่าเราน่าจะชวนเขามาอยู่ฝั่งเดียวกับเรานะครับ'},
   {who:'boss',t:'ฉันมีข้อเสนอให้แก... สนใจจะเป็นพันธมิตรกับพวกเราไหม?',card:offerCard(),choices:[
     {t:'🤝 สนใจข้อเสนอ',cls:'ok',fn:()=>interested(v)},
     {t:'✋ ปฏิเสธข้อเสนอ',fn:()=>decline(v)}]}];
  if(v.stage==='count')pages.splice(0,2);
  open(pages);return;
 }
 if(v.mode==='ally-warn'){
  const owe=y.arr.amt;
  open([{who:'guard',t:'คุณ CEO ครับ... ค่าจ้างลูกน้องเดือนนี้ '+fm(WAGE)+' ยังไม่ได้รับ ผมแวะมาเตือนก่อนนะครับ'},
   {who:'guard',t:'ยังอยู่ในช่วงผ่อนผัน ลูกน้องยังเฝ้าบริษัทตามปกติ แต่ถ้าค้างถึงเดือนหน้า หัวหน้าจะระงับการคุ้มครองครับ',card:owedCard(),choices:payChoices(v,'guard')}]);
  return;
 }
 if(v.mode==='ally-collect'){
  open([{who:'boss',t:'ค้างค่าจ้างลูกน้องมาสองเดือนแล้วนะ เจ้าของบริษัท... การคุ้มครองถูกระงับไปแล้ว'},
   {who:'boss',t:'จ่ายยอดค้างให้ครบ ผมจะส่งคนกลับไปเฝ้าเหมือนเดิม',card:owedCard(),choices:payChoices(v,'boss')}]);
 }
}
function owedCard(){const y=yk();return '<div class="yzCard"><b>💴 ยอดค้างชำระ</b><div class="yzG"><span>ค้างอยู่</span><b style="color:#ff8a8a">'+y.arr.n+' เดือน</b><span>ยอดที่ต้องจ่าย</span><b style="color:#ffd45a">'+fm(y.arr.amt)+'</b><span>เงินสดตอนนี้</span><b>'+fm(Math.max(0,S.money))+'</b></div></div>'}
function payChoices(v,who){
 const y=yk(),owe=y.arr.amt,enough=S.money>=owe;
 return [
  {t:enough?'💴 ชำระตอนนี้ ('+fm(owe)+')':'💴 เงินไม่พอ (ขาด '+fm(owe-Math.max(0,S.money))+')',cls:'ok',dis:!enough,fn:()=>{if(settle('visit')){open([{who:who,t:'ได้รับครบแล้ว ผมจะส่งลูกน้องกลับไปเฝ้าตามเดิมครับ',done:()=>leave(v,'🐉 ชำระยอดค้างครบ · การคุ้มครองกลับมาทำงาน')}])}}},
  {t:'🙏 ขอเวลาก่อน',fn:()=>{open([{who:who,t:v.mode==='ally-collect'?'อย่าให้ผมต้องมารอนานนัก... รีบเคลียร์ล่ะ':'รับทราบครับ แต่อย่าลืมนะครับ',done:()=>leave(v)}])}}];
}
function interested(v){
 const y=yk();
 if(S.money>=FEE){
  const ok=joinNow();
  open([{who:'boss',t:ok?'ดีมาก... ตั้งแต่วันนี้แกคือพวกเดียวกับเรา ลูกน้องของผมจะไปเฝ้าหน้าบริษัทให้ตั้งแต่พรุ่งนี้เช้า':'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง',done:()=>leave(v,'🐉 ริวจิและเก็นจิเดินออกจากบริษัท')}]);
  return;
 }
 const lack=FEE-Math.max(0,Math.floor(S.money));
 v.stage='count';v.cd=WAIT;
 try{toast('💴 เงินยังไม่เพียงพอ ขาดอีก '+fm(lack))}catch(e){}
 open([{who:'guard',t:'เงินสดของคุณตอนนี้ไม่พอครับ... ยังขาดอีก '+fm(lack)+' หัวหน้าให้เวลา '+WAIT+' วินาที'},
  {who:'boss',t:'หาเงินมาให้ทัน ไม่งั้นฉันไม่รอนะ',done:()=>{}}]);
 showCd(WAIT);
 try{save(1)}catch(e){}
}
function decline(v){
 const y=yk();
 y.st='DECLINED';
 open([{who:'boss',t:'ฮึ... ก็ตามใจ แต่ข้อเสนอนี้ไม่มีครั้งที่สอง จำไว้',done:()=>leave(v,'🐉 ปฏิเสธข้อเสนอพันธมิตร · ริวจิและเก็นจิเดินออกไป')}]);
 try{save(1)}catch(e){}
}

/* ---------------------------------------------------------------- ค่าจ้างลูกน้อง / ค้างชำระ */
function runDue(force){
 const y=yk();
 if(y.st!=='ALLIED')return 0;
 const key=mKey();
 if(!force){
  if(dim()!==DUE_DIM||S.day-y.joinDay<MIN_JOIN_DAYS||y.dueKey===key)return 0;
 }
 y.dueKey=key;
 if(y.arr.n===0&&S.money>=WAGE){
  spend(WAGE);addHist('wage',WAGE,'ค่าจ้างลูกน้อง 2 คน (11,000 × 2)');
  log('🐉 จ่ายค่าจ้างลูกน้องยากูซ่า '+fm(WAGE)+' (คนละ '+fm(WAGE_EACH)+')');
  return WAGE;
 }
 // ค้างชำระ (ไม่หักเงินจนติดลบ)
 y.arr.n++;y.arr.amt+=WAGE;addHist('arrears',0,'ค้างค่าจ้างเดือนที่ '+y.arr.n+' (ยอดค้าง '+y.arr.amt+')');
 if(y.arr.n===1){
  y.warnPend=1;
  log('⚠️ เงินสดไม่พอจ่ายค่าจ้างลูกน้องยากูซ่า '+fm(WAGE)+' — ค้างชำระเดือนแรก (ยังอยู่ในช่วงผ่อนผัน) เก็นจิจะมาเตือน');
  try{toast('⚠️ ค้างค่าจ้างลูกน้องยากูซ่า เดือนแรก · เก็นจิจะมาเตือน')}catch(e){}
 }else{
  if(!y.susp){y.susp=1;y.suspDay=S.day;y.warnPend=0}
  log('🚫 ค้างค่าจ้างลูกน้องยากูซ่า '+y.arr.n+' เดือน ('+fm(y.arr.amt)+') — ระงับระบบคุ้มครองแล้ว ลูกน้องออกจากพื้นที่ ระบบโจรกรรมกลับมาทำงาน');
  try{toast('🚫 ระบบคุ้มครองถูกระงับ! ชำระยอดค้างเพื่อให้ลูกน้องกลับมา')}catch(e){}
 }
 return 0;
}
function endDay(){if(!okS())return;try{runDue(false)}catch(e){console.error(e)}
 const y=yk();const L=X().ens();
 if(L.contact&&!X().mafiaLoan()&&y.passDay!==S.day){y.passDay=S.day;if(y.st==='NONE'){gain('r',2);gain('g',2)}}
}
function settle(src){
 const y=yk();
 if(y.st!=='ALLIED'||y.arr.n<=0)return false;
 const owe=y.arr.amt;
 if(S.money<owe)return false;
 spend(owe);addHist('arrears-pay',owe,'ชำระยอดค้าง '+y.arr.n+' เดือน');
 log('🐉 ชำระยอดค้างค่าจ้างลูกน้อง '+fm(owe)+' ครบแล้ว · การคุ้มครองกลับมา');
 y.arr={n:0,amt:0};y.susp=0;y.warnPend=0;y.suspDay=0;
 try{toast('✅ ชำระยอดค้างครบ · ลูกน้องกลับมาเฝ้าบริษัท')}catch(e){}
 try{save(1);hud();show()}catch(e){}
 guardTick();
 return true;
}

/* ---------------------------------------------------------------- ลูกน้องเฝ้าถนนหน้าบริษัท */
const LANES=[{y:296,px:246},{y:242,px:104}];
const EDGE_X=1030;
function gProg(g){const W=walkMin();return Math.max(0,Math.min(1,(abs()-g.t0)/W))}
function guardTick(){
 if(!okS())return;
 const y=yk(),A=abs(),h=S.t/60,on=protectOn(),win=h>=DUTY0&&h<DUTY1,W=walkMin();
 y.g.forEach((g,i)=>{
  if(g.st==='ABSENT'){if(on&&win){g.st='RETURNING';g.t0=A+i*W*.12}}
  else if(g.st==='RETURNING'){
   if(!on||!win){const p=gProg(g);g.st='LEAVING';g.t0=A-(1-p)*W}
   else if(A-g.t0>=W)g.st='GUARDING';
  }else if(g.st==='GUARDING'){
   if(!on||!win){g.st='LEAVING';g.t0=A+i*W*.12}
  }else if(g.st==='LEAVING'){
   if(A-g.t0>=W)g.st='ABSENT';
  }
  if(!['ABSENT','RETURNING','GUARDING','LEAVING'].includes(g.st))g.st='ABSENT';
 });
}
function gPos(i,g){
 const ln=LANES[i],P={x:ln.px,y:ln.y};let p=0,dir=0,mv=false;
 if(g.st==='GUARDING')return{x:P.x,y:P.y,d:0,mv:false,p:1};
 const q=gProg(g);
 const len=EDGE_X-P.x;
 if(g.st==='RETURNING'){const x=EDGE_X-len*q;return{x:x,y:P.y,d:1,mv:q>0&&q<1,p:q}}
 if(g.st==='LEAVING'){const x=P.x+len*q;return{x:x,y:P.y,d:3,mv:q>0&&q<1,p:q}}
 return null;
}
/* สไปรต์ลูกน้อง: ใช้แผ่นสไปรต์ยากูซ่าเดิม (64×96) ย้อมสีต่างกันเพื่อแยกจากเก็นจิ */
const TINT=['#2b4aa8','#9a1f2d'];let SPR=null;
function sprites(){
 if(SPR)return SPR;
 try{
  if(!SPR){SPR={src:new Image(),c:[null,null]};SPR.src.src=LOAN_SPR.guard}
 }catch(e){return null}
 return SPR;
}
function tinted(i){
 const s=sprites();if(!s||!s.src.complete||!s.src.naturalWidth)return null;
 if(s.c[i])return s.c[i];
 const c=document.createElement('canvas');c.width=s.src.naturalWidth;c.height=s.src.naturalHeight;
 const g=c.getContext('2d');g.drawImage(s.src,0,0);g.globalCompositeOperation='source-atop';g.globalAlpha=.30;g.fillStyle=TINT[i];g.fillRect(0,0,c.width,c.height);
 g.globalAlpha=1;g.globalCompositeOperation='source-over';s.c[i]=c;return c;
}
function streetObjs(g,t){
 if(!okS())return [];
 const y=yk(),out=[];
 y.g.forEach((gd,i)=>{
  const pos=gPos(i,gd);if(!pos||pos.x>1000||pos.x<-40)return;
  out.push({y:pos.y,draw:()=>drawGuard(g,t,i,pos)});
 });
 return out;
}
function drawGuard(g,t,i,pos){
 const img=tinted(i);if(!img)return;
 const k=.86,w=64*k,h=96*k,x=Math.round(pos.x),yy=Math.round(pos.y);
 const row=[0,2,1,3][pos.d]||0,fr=pos.mv?Math.floor(t*.008+i)%4:0,bob=pos.mv?0:Math.sin(t*.002+i*2)*.8;
 g.save();
 g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x,yy-1,15,4.5,0,0,Math.PI*2);g.fill();
 g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
 g.drawImage(img,fr*64,row*96,64,96,x-w/2,yy-h*.97+bob,w,h);
 g.font='bold 10px "Noto Sans Thai",sans-serif';g.textAlign='center';
 const nm='ลูกน้องยากูซ่า',tw=g.measureText(nm).width+10;
 g.fillStyle='rgba(60,8,16,.88)';g.fillRect(x-tw/2,yy-h-12,tw,14);g.strokeStyle='#c0392b';g.lineWidth=1;g.strokeRect(x-tw/2+.5,yy-h-11.5,tw-1,13);
 g.fillStyle='#ffd2d2';g.fillText(nm,x,yy-h-2);
 g.restore();
}

/* ---------------------------------------------------------------- UI: กล่องสนทนา */
const CSS=`#yzDlg{position:fixed;inset:0;z-index:9660;background:rgba(5,8,18,.55);display:none;align-items:flex-end;justify-content:center;padding:10px;font-family:'Noto Sans Thai','Sarabun',system-ui,sans-serif}
#yzDlg.on{display:flex}
#yzDlg .bx{width:min(620px,100%);background:linear-gradient(#2a1620,#160d16);border:2px solid #c0392b;border-radius:12px;color:#fff1f1;padding:12px 14px;box-shadow:0 10px 40px #000a}
#yzDlg .hd{display:flex;gap:10px;align-items:center;margin-bottom:6px}
#yzDlg .hd img{width:58px;height:58px;border-radius:10px;object-fit:cover;border:2px solid #c89d4b}
#yzDlg .nm{font-weight:700;color:#ffd2d2}#yzDlg .tg{font-size:11px;color:#c9a0a8}
#yzDlg .sp{min-height:44px;font-size:15px;line-height:1.45;cursor:pointer;padding:4px 2px}
#yzDlg .nx{text-align:right;font-size:11px;color:#c9a0a8}
#yzDlg .ch{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
#yzDlg .ch button{flex:1;min-width:150px;font:inherit;font-size:14px;border-radius:9px;padding:10px 12px;cursor:pointer;min-height:44px;border:1px solid #7d3a45;background:#3a1c26;color:#fff1f1}
#yzDlg .ch button.ok{background:linear-gradient(#e0b04a,#b9882c);color:#2a1a05;font-weight:700;border-color:#ffe08a}
#yzDlg .ch button:disabled{opacity:.45;cursor:default}
.yzCard{margin-top:8px;padding:8px 10px;border:1px solid #8e2a35;border-radius:8px;background:#1d0f17;color:#ffe9e9;font-size:13px}
.yzG{display:grid;grid-template-columns:auto 1fr;gap:3px 12px;margin:4px 0}.yzG span{color:#c9a0a8}.yzG b{text-align:right}
#yzCd{position:fixed;left:50%;top:64px;transform:translateX(-50%);z-index:9000;display:none;background:rgba(60,8,16,.92);border:2px solid #ff5b6b;border-radius:12px;padding:7px 16px;color:#fff;font-weight:700;font-family:'Noto Sans Thai',sans-serif;text-align:center;box-shadow:0 4px 20px #000a}
#yzCd.on{display:block}#yzCd b{font-size:26px;color:#ffd45a;display:block;line-height:1.1}#yzCd small{font-weight:400;color:#ffc9cf;font-size:11px}
.yzApp{padding:8px;color:#eef3ff}.yzApp h3{margin:2px 0 6px}.yzApp .yzMenu{display:grid;gap:6px;margin-top:8px}
.yzApp button.yzB{font:inherit;text-align:left;border-radius:8px;border:1px solid #7d3a45;background:#3a1c26;color:#fff1f1;padding:10px 12px;cursor:pointer}
.yzApp button.yzB:disabled{opacity:.5;cursor:default}.yzApp button.yzB small{display:block;color:#c9a0a8;font-size:11px;margin-top:2px}
.yzApp .yzBadge{display:inline-block;padding:2px 10px;border-radius:10px;font-size:12px;font-weight:700}
.yzApp table{width:100%;border-collapse:collapse;font-size:12px}.yzApp td,.yzApp th{padding:3px 5px;border-bottom:1px solid #2c3858;text-align:left}`;
let dlg=null,pages=null,pi=0,tw=null,fullTxt='',typed=true;
function ensureDom(){
 if(dlg)return;
 const st=document.createElement('style');st.id='yzCss';st.textContent=CSS;document.head.appendChild(st);
 dlg=document.createElement('div');dlg.id='yzDlg';dlg.setAttribute('role','dialog');dlg.setAttribute('aria-label','สนทนากับยากูซ่า');
 dlg.innerHTML='<div class="bx"><div class="hd"><img id="yzPt" alt=""><div><div class="nm" id="yzNm"></div><div class="tg" id="yzTg"></div></div></div><div class="sp" id="yzSp"></div><div id="yzCard"></div><div class="nx" id="yzNx">แตะ / E เพื่อไปต่อ ▼</div><div class="ch" id="yzCh"></div></div>';
 document.body.appendChild(dlg);
 const cd=document.createElement('div');cd.id='yzCd';cd.innerHTML='<small>🐉 ริวจิรอคำตอบ</small><b id="yzCdN">20</b><small>ไปหาเงินให้ครบแล้วคุยกับริวจิอีกครั้ง (กด E)</small>';document.body.appendChild(cd);
 $('yzSp').onclick=advance;
 ['keydown','keyup'].forEach(t=>window.addEventListener(t,kb,true));
}
const isOn=()=>!!(dlg&&dlg.classList.contains('on'));
function kb(e){
 if(!isOn())return;
 const k=e.key;
 if(e.type==='keydown'){
  const chs=[...document.querySelectorAll('#yzCh button')];
  if(k==='Enter'||k===' '||k==='e'||k==='E'){if(!chs.length||!typed)advance();else if(chs.length===1&&k!=='Enter')chs[0].click()}
  else if(/^[1-9]$/.test(k)&&chs[+k-1]&&!chs[+k-1].disabled)chs[+k-1].click();
  else if(k==='Escape'&&!chs.length)advance();
 }
 e.preventDefault();e.stopImmediatePropagation();
}
function open(pg){
 ensureDom();
 pages=pg;pi=0;
 try{K={}}catch(e){}try{if(window.JOY){JOY.x=0;JOY.y=0}}catch(e){}
 dlg.classList.add('on');show1();
}
function closeDlg(){if(dlg){dlg.classList.remove('on')}clearInterval(tw);tw=null;pages=null}
function show1(){
 const p=pages[pi];if(!p)return closeDlg();
 const W=X().WHO[p.who]||{name:'',tag:''};
 $('yzPt').src=LOAN_PORT[p.who]||'';$('yzNm').textContent=W.name;$('yzTg').textContent=W.tag;
 $('yzCard').innerHTML=p.card||'';
 const ch=$('yzCh');ch.innerHTML='';
 fullTxt=p.t;typed=false;
 const el=$('yzSp');el.textContent='';const arr=Array.from(fullTxt);let i=0;clearInterval(tw);
 const fin=()=>{typed=true;el.textContent=fullTxt;$('yzNx').style.display=p.choices?'none':'';if(p.choices)renderChoices(p)};
 tw=setInterval(()=>{i+=2;el.textContent=arr.slice(0,i).join('');if(i>=arr.length){clearInterval(tw);tw=null;fin()}},22);
 $('yzNx').style.display='';
}
function renderChoices(p){
 const ch=$('yzCh');ch.innerHTML='';
 p.choices.forEach((c,i)=>{const b=document.createElement('button');b.type='button';b.className=c.cls||'';b.textContent=(i+1)+'. '+c.t;if(c.dis)b.disabled=true;
  b.onclick=()=>{if(b.disabled)return;closeDlgKeep();try{c.fn()}catch(e){console.error(e)}};ch.appendChild(b)});
}
function closeDlgKeep(){if(dlg)dlg.classList.remove('on');clearInterval(tw);tw=null}
function advance(){
 if(!pages)return;
 const p=pages[pi];
 if(!typed){clearInterval(tw);tw=null;typed=true;$('yzSp').textContent=fullTxt;$('yzNx').style.display=p.choices?'none':'';if(p.choices)renderChoices(p);return}
 if(p.choices)return;
 if(pi>=pages.length-1){const d=p.done;closeDlgKeep();pages=null;if(d)try{d()}catch(e){console.error(e)};return}
 pi++;show1();
}
function showCd(n){ensureDom();const c=$('yzCd'),b=$('yzCdN');if(c&&b){b.textContent=n;c.classList.add('on')}}
function hideCd(){const c=$('yzCd');if(c)c.classList.remove('on')}

/* ---------------------------------------------------------------- UI: คอมพิวเตอร์ CEO */
let tab='home',msg='';
const BADGE={NONE:['ยังไม่ปลดล็อก','#555'],OFFER:['กำลังรอคำตอบ','#b9882c'],EXPIRED:['ข้อเสนอหมดเวลา (ยังเจรจาได้)','#b9882c'],DECLINED:['ปฏิเสธข้อเสนอแล้ว','#8e2a35'],ALLIED:['พันธมิตร (ALLIED)','#2f8f5f']};
function iconOn(){try{return okS()&&yk().st!=='NONE'}catch(e){return false}}
function iconSvg(){return '<img alt="ยากูซ่า" src="data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#3a0f18"/><rect x="3" y="3" width="58" height="58" rx="10" fill="none" stroke="#e0b04a" stroke-width="2"/><text x="32" y="45" font-size="38" text-anchor="middle" fill="#e0b04a" font-family="serif">龍</text></svg>')+'" style="width:100%;height:100%;object-fit:contain">'}
function status(){
 const y=yk();
 return{st:y.st,cl:{r:y.cl.r,g:y.cl.g},joinDay:y.joinDay,susp:!!y.susp,arrears:{n:y.arr.n,amt:y.arr.amt},protect:protectOn(),guards:y.g.map(g=>g.st),fee:FEE,wage:WAGE,hist:y.hist.slice()};
}
function osApp(){
 if(!okS())return '';
 const y=yk(),b=BADGE[y.st]||BADGE.NONE;
 const hd='<div style="display:flex;gap:10px;align-items:center"><img src="'+LOAN_PORT.boss+'" style="width:56px;height:56px;border-radius:10px;object-fit:cover;border:2px solid #c89d4b" alt=""><div><h3 style="margin:0">🐉 ติดต่อพันธมิตรยากูซ่า</h3><span class="yzBadge" style="background:'+b[1]+';color:#fff">'+b[0]+'</span></div></div>';
 const back=tab!=='home'?'<button class="btn" style="margin:8px 0" onclick="YZ.act(\'tab\',\'home\')">← กลับเมนู</button>':'';
 let body='';
 const m=msg?'<div class="yzCard" style="border-color:#ffd45a">'+msg+'</div>':'';
 if(tab==='home'){
  const L=X().ens(),busy=!!(L.visit||L.actors.length);
  const canNego=(y.st==='EXPIRED')&&!busy;
  const negoNote=y.st==='ALLIED'?'เข้าร่วมแล้ว — ไม่ต้องชำระค่าธรรมเนียมซ้ำ':y.st==='DECLINED'?'คุณปฏิเสธข้อเสนอแล้ว — ริวจิไม่รับสมัครอีก':y.st==='OFFER'?'ริวจิอยู่ที่ออฟฟิศ — เดินไปคุยด้วยตัวเอง':'ค่าธรรมเนียม '+fm(FEE)+(busy?' · ตอนนี้มีแขกอยู่ในออฟฟิศ':'');
  body='<div class="yzMenu">'+
   '<button class="yzB" '+(busy?'disabled':'')+' onclick="YZ.act(\'callR\')">📞 ติดต่อริวจิ<small>'+(busy?'ตอนนี้มีแขกอยู่ในออฟฟิศ':'โทรหาริวจิ (คุยวันละครั้ง เพิ่มความสนิท)')+'</small></button>'+
   '<button class="yzB" '+(canNego?'':'disabled')+' onclick="YZ.act(\'nego\')">🤝 เจรจาเข้าร่วมแก๊ง<small>'+negoNote+'</small></button>'+
   '<button class="yzB" onclick="YZ.act(\'tab\',\'status\')">📋 ตรวจสอบสถานะพันธมิตร</button>'+
   '<button class="yzB" onclick="YZ.act(\'tab\',\'wage\')">💴 ตรวจสอบค่าจ้างลูกน้อง<small>'+(y.st==='ALLIED'?'หัก '+fm(WAGE)+' / เดือน':'ใช้ได้หลังเข้าร่วมแก๊ง')+'</small></button>'+
   '<button class="yzB" onclick="YZ.act(\'tab\',\'prot\')">🛡️ ตรวจสอบสถานะการคุ้มครองบริษัท</button></div>';
 }else if(tab==='status'){
  body='<div class="yzCard"><b>สถานะพันธมิตร</b><div class="yzG"><span>สถานะ</span><b>'+b[0]+'</b><span>ความสนิทริวจิ</span><b>'+Math.floor(y.cl.r)+' / '+NEED+'</b><span>ความสนิทเก็นจิ</span><b>'+Math.floor(y.cl.g)+' / '+NEED+'</b>'+
   (y.st==='ALLIED'?'<span>เข้าร่วมเมื่อ</span><b>'+dateTxt(y.joinDay)+'</b><span>ค่าธรรมเนียมที่จ่ายแล้ว</span><b>'+fm(FEE)+'</b>':'')+
   (y.st==='EXPIRED'?'<span>หมายเหตุ</span><b>ข้อเสนอหมดเวลา · เจรจาใหม่ได้</b>':'')+(y.st==='DECLINED'?'<span>หมายเหตุ</span><b>ปฏิเสธแล้ว · สมัครไม่ได้</b>':'')+'</div></div>';
 }else if(tab==='wage'){
  const nd=nextDue(),canPay=y.st==='ALLIED'&&y.arr.n>0;
  body='<div class="yzCard"><b>ค่าจ้างลูกน้อง</b><div class="yzG"><span>ลูกน้องคนที่ 1</span><b>'+fm(WAGE_EACH)+'</b><span>ลูกน้องคนที่ 2</span><b>'+fm(WAGE_EACH)+'</b><span>รวมต่อเดือน</span><b style="color:#ffd45a">'+fm(WAGE)+'</b>'+
   (y.st==='ALLIED'?'<span>หักครั้งถัดไป</span><b>'+(nd?dateTxt(nd):'-')+'</b><span>ยอดค้างชำระ</span><b style="color:'+(y.arr.n?'#ff8a8a':'#8cffb4')+'">'+(y.arr.n?fm(y.arr.amt)+' ('+y.arr.n+' เดือน)':'ไม่มี')+'</b>':'')+'</div><small>หักวันที่ '+DUE_DIM+' ของทุกเดือน · ถ้าเข้าร่วมน้อยกว่า '+MIN_JOIN_DAYS+' วันก่อนวันหัก จะเริ่มเก็บเดือนถัดไป</small></div>'+
   (canPay?'<button class="btn osAct" style="width:100%;margin:6px 0;background:#2f8f5f;color:#fff" '+(S.money>=y.arr.amt?'':'disabled')+' onclick="YZ.act(\'settle\')">💴 ชำระยอดค้าง '+fm(y.arr.amt)+(S.money>=y.arr.amt?'':' (เงินไม่พอ ขาด '+fm(y.arr.amt-Math.max(0,S.money))+')')+'</button>':'')+
   '<div class="yzCard"><b>ประวัติการชำระ</b>'+(y.hist.length?'<table><tr><th>วันที่</th><th>รายการ</th><th style="text-align:right">จำนวน</th></tr>'+y.hist.slice().reverse().slice(0,10).map(h=>'<tr><td>'+dateTxt(h.d)+'</td><td>'+esc(h.n||h.k)+'</td><td style="text-align:right">'+(h.a?fm(h.a):'—')+'</td></tr>').join('')+'</table>':'<div style="color:#c9a0a8;font-size:12px">ยังไม่มีประวัติ</div>')+'</div>';
 }else if(tab==='prot'){
  const on=protectOn(),gs=y.g.map(g=>g.st);
  const GN={ABSENT:'ไม่ได้มาปฏิบัติหน้าที่',RETURNING:'กำลังเดินมาปฏิบัติหน้าที่',GUARDING:'กำลังเฝ้าบริษัท',LEAVING:'กำลังเดินออกจากพื้นที่'};
  body='<div class="yzCard"><b>สถานะการคุ้มครอง</b><div class="yzG"><span>ระบบคุ้มครอง</span><b style="color:'+(on?'#8cffb4':'#ff8a8a')+'">'+(y.st!=='ALLIED'?'ยังไม่ได้เข้าร่วม':y.susp?'ถูกระงับ (ค้างชำระ)':'ทำงาน')+'</b>'+
   '<span>ป้องกันโจรกรรม</span><b>'+(on?'เปิดอยู่ — โจรจะไม่เริ่มเหตุการณ์':'ปิด — ระบบโจรกรรมเดิมทำงานปกติ')+'</b>'+
   '<span>ลูกน้องคนที่ 1</span><b>'+GN[gs[0]]+'</b><span>ลูกน้องคนที่ 2</span><b>'+GN[gs[1]]+'</b><span>ตารางเฝ้า</span><b>'+String(DUTY0).padStart(2,'0')+':00 – '+DUTY1+':00 ทุกวัน</b></div></div>';
 }
 return '<div class="yzApp">'+hd+m+back+body+'</div>';
}
function act(a,v){
 if(!okS())return;
 const y=yk();msg='';
 if(a==='tab'){tab=v}
 else if(a==='callR'){const L=X().ens();if(L.visit||L.actors.length){msg='ตอนนี้มีแขกอยู่ในออฟฟิศ โทรไม่ได้'}else{callRyuji();return}}
 else if(a==='nego'){
  if(y.st==='ALLIED')msg='เข้าร่วมแล้ว ไม่ต้องจ่ายค่าธรรมเนียมซ้ำ';
  else if(y.st==='DECLINED')msg='คุณปฏิเสธข้อเสนอไปแล้ว ริวจิไม่รับสมัครอีก';
  else if(y.st!=='EXPIRED')msg='ยังเจรจาไม่ได้ในตอนนี้';
  else if(S.money<FEE)msg='💴 เงินสดยังไม่พอ ต้องมี '+fm(FEE)+' ยังขาดอีก <b>'+fm(FEE-Math.max(0,S.money))+'</b>';
  else{negotiate();return}
 }
 else if(a==='settle'){if(!settle('os'))msg='เงินไม่พอสำหรับชำระยอดค้าง'; else msg='✅ ชำระยอดค้างครบแล้ว'}
 try{OS.render()}catch(e){}
}
function callRyuji(){
 try{OS.close()}catch(e){}
 const y=yk(),k='r';
 let gained='';
 if(y.talk.r!==S.day){y.talk.r=S.day;gain('r',15);gained='...ความสนิทกับริวจิเพิ่มขึ้น +15 (ตอนนี้ '+Math.floor(y.cl.r)+'/'+NEED+')';try{save(1)}catch(e){}}
 const base=y.st==='ALLIED'?'อ้อ หุ้นส่วนของเรา... ลูกน้องเฝ้างานเป็นยังไงบ้าง? มีปัญหาอะไรก็บอกมา':y.st==='EXPIRED'?'มาตามที่ผมเคยเสนอไว้ใช่ไหม? ข้อเสนอยังอยู่ ถ้าพร้อมก็เลือก "เจรจาเข้าร่วมแก๊ง"':y.st==='DECLINED'?'ฮึ... ข้อเสนอพันธมิตรหมดไปแล้ว แต่ถ้าแค่โทรมาคุยก็ไม่ว่า':'โทรมาหาผมเองเลยเหรอ? ว่ามา';
 open([{who:'boss',t:'(โทรศัพท์) '+base}].concat(gained?[{who:'boss',t:gained}]:[]));
}
function negotiate(){
 try{OS.close()}catch(e){}
 const y=yk();
 if(y.st!=='EXPIRED'||S.money<FEE)return;
 open([
  {who:'boss',t:'(โทรศัพท์) ในที่สุดก็เปลี่ยนใจสินะ... ผมชอบคนที่ตัดสินใจเด็ดขาด'},
  {who:'guard',t:'ถ้าเข้าร่วมแล้ว ลูกน้องของเราสองคนจะไปเฝ้าหน้าบริษัทให้ทุกเช้าจนถึง 19:00 น. ครับ ค่าจ้างเดือนละ '+fm(WAGE)},
  {who:'boss',t:'พร้อมจ่ายค่าธรรมเนียมแล้วใช่ไหม? ยืนยันมาเลย',card:offerCard(),choices:[
    {t:'✅ ยืนยัน จ่าย '+fm(FEE),cls:'ok',fn:()=>{
      const yy=yk();
      if(yy.st==='ALLIED'){open([{who:'boss',t:'เข้าร่วมไปแล้วนี่ ไม่ต้องจ่ายซ้ำ'}]);return}
      if(joinNow())open([{who:'boss',t:'ดีมาก... ตั้งแต่วันนี้แกคือพวกเดียวกับเรา ลูกน้องจะไปเฝ้าหน้าบริษัทให้ตั้งแต่พรุ่งนี้เช้า'}]);
      else open([{who:'boss',t:'เงินคุณไม่พอแล้วนี่... ค่อยโทรมาใหม่'}])}},
    {t:'ยกเลิก',fn:()=>{open([{who:'boss',t:'ได้... แต่อย่ารอนานนัก ข้อเสนอไม่ได้อยู่ตลอดไป'}])}}]}]);
}

/* ---------------------------------------------------------------- รายงานการเงิน */
function finCard(){
 try{
  const y=yk();if(y.st!=='ALLIED')return '';
  const nd=nextDue();
  return '<div class="c"><b>🐉 พันธมิตรยากูซ่า</b><div class="m">ค่าจ้างลูกน้อง '+fm(WAGE)+'/เดือน · หักครั้งถัดไป '+(nd?dateTxt(nd):'-')+'</div><div class="m">การคุ้มครอง: <b style="color:'+(protectOn()?'#1f9d55':'#d64545')+'">'+(y.susp?'ถูกระงับ':'ทำงาน')+'</b>'+(y.arr.n?' · ค้างชำระ <b style="color:#d64545">'+fm(y.arr.amt)+'</b> ('+y.arr.n+' เดือน)':'')+'</div>'+
   (y.hist.length?'<div class="m">ชำระล่าสุด: '+y.hist.slice(-3).reverse().map(h=>'วัน '+h.d+' '+(h.a?fm(h.a):'ค้างชำระ')).join(' · ')+'</div>':'')+'</div>';
 }catch(e){return ''}
}

/* ---------------------------------------------------------------- Test */
function setCl(n){const y=yk();y.cl.r=n;y.cl.g=n;try{save(1)}catch(e){}return status()}
function forceOffer(){
 const y=yk();if(!okS())return false;
 y.st='NONE';y.cl.r=Math.max(y.cl.r,NEED);y.cl.g=Math.max(y.cl.g,NEED);
 const L=X().ens();if(L.visit||L.actors.length){toast('ตอนนี้มีแขกอยู่ในออฟฟิศ');return false}
 if(CEOScene.dbg().st.active){toast('กลับมาที่บริษัทก่อน');return false}
 return startVisit('ally');
}
function reset(){
 const y=yk();y.st='NONE';y.susp=0;y.arr={n:0,amt:0};y.warnPend=0;y.joinDay=0;y.dueKey=-1;y.hist=[];y.g.forEach(g=>{g.st='ABSENT';g.t0=0});
 try{const x=X(),L=x.ens();if(L.visit&&L.visit.yz){L.visit=null;x.leaveAll()}}catch(e){}
 hideCd();closeDlg();try{save(1)}catch(e){}return status();
}
function testBox(){
 const b=$('yzTestBox');if(!b||b.dataset.f)return;b.dataset.f=1;
 const mk=(t,f)=>'<button class="btn" onclick="'+f+'">'+t+'</button>';
 b.innerHTML='<h3 style="margin:6px 0">🐉 พันธมิตรยากูซ่า (Test)</h3><div class="testGrid">'+
  mk('ตั้งความสนิทริวจิ+เก็นจิ = 500','YZ.setCl(500);toast(\'ตั้งความสนิท = 500 ทั้งคู่\')')+
  mk('เรียกข้อเสนอพันธมิตรทันที','YZ.forceOffer()')+
  mk('จำลองวันหักค่าจ้างลูกน้อง','YZ.testDue()')+
  mk('เติมเงิน +100,000','S.money+=100000;hud();show();toast(\'+100,000\')')+
  mk('รีเซ็ตสถานะพันธมิตร (ไม่แตะเงิน)','YZ.reset();toast(\'รีเซ็ตสถานะพันธมิตรแล้ว\')')+'</div>';
}
function testDue(){const y=yk();if(y.st!=='ALLIED'){toast('ยังไม่ได้เข้าร่วมแก๊ง');return 0}const r=runDue(true);try{save(1);hud();show()}catch(e){}return r}

/* ---------------------------------------------------------------- boot */
window.YZ={
 maybeStart,visitTick,talkVisit,endDay,streetObjs,protects:()=>{try{return okS()&&protectOn()}catch(e){return false}},
 iconOn,iconSvg,osApp,act,chat,finCard,status,setCl,forceOffer,reset,testDue,settle,joinNow,
 guardTick,gPos:i=>{const y=yk();return gPos(i,y.g[i])},dialogOn:isOn,
 _yk:yk,_open:open
};
const bt=setInterval(()=>{
 if(!okS())return;
 wrapLoan();
 try{guardTick()}catch(e){}
 testBox();
 // กันค้าง: สถานะ OFFER แต่ไม่มี visit (เช่นโหลดเซฟ) → หมดเวลา
 try{const y=yk(),L=X().ens();if(y.st==='OFFER'&&!(L.visit&&L.visit.yz&&L.visit.mode==='ally'))y.st='EXPIRED'}catch(e){}
 try{const L=X().ens(),v=L.visit;if(!(v&&v.yz&&v.stage==='count'))hideCd()}catch(e){}
},300);
})();
