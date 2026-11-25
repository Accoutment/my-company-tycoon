
const LOAN_SPR={"banker": "assets/img/57f521c85811.png", "boss": "assets/img/4a3629e6244e.png", "guard": "assets/img/2b53e77d0c1a.png"};
const LOAN_PORT={"banker": "assets/img/7606defa84a1.jpg", "boss": "assets/img/ca5d6c576f55.jpg", "guard": "assets/img/6fd62654fc70.jpg"};
/* =====================================================================
   LOAN SYSTEM · ระบบกู้เงิน
   - นายธนาคาร: มาวันที่ 12 ของทุกเดือน (เริ่มเดือนที่ 1) ถ้าเงินสด >= 30,000
   - ยากูซ่า (เจ้านาย + ลูกน้อง มาด้วยกันเสมอ): เงินสด <= 10,000 สุ่ม 40% ต่อเดือน
     มาเสนอเงินก้อนใหญ่ ดอกเบี้ยโหด และมาทวงต่อหน้าเมื่อครบกำหนด
   ===================================================================== */
const LOAN=(function(){
'use strict';
const MIN_BANK=30000,MAFIA_MAX=10000,MAFIA_CHANCE=.4,LATE_PCT=.1,WAIT_SECS=20,SEP=34;
const SPR={};['banker','boss','guard'].forEach(function(k){var i=new Image();i.src=LOAN_SPR[k];SPR[k]=i});
const WHO={
 banker:{name:'คุณธนากร',tag:'นายธนาคาร · ผู้จัดการสินเชื่อ',role:'ธนาคารเพื่อธุรกิจ'},
 boss:{name:'ริวจิ',tag:'ยากูซ่า · หัวหน้าแก๊ง',role:'เจ้าพ่อแห่งย่านกลางคืน'},
 guard:{name:'เก็นจิ',tag:'ยากูซ่า · ลูกน้องคนสนิท',role:'มือขวาของริวจิ'}
};
const CAND=[[4,12],[3,12],[4,13],[3,13],[2,12],[2,13],[1,12],[1,13],[4,11],[2,11],[1,11]];
const FX=[];let tw=null;
const esc=function(s){return String(s).replace(/[&<>"]/g,'')};
const month=function(){return Math.floor((S.day-1)/30)};
const dateTxt=function(d){return 'เดือน '+(Math.floor(((d-1)%YEAR_DAYS)/30)+1)+' วันที่ '+(((d-1)%30)+1)+(d>YEAR_DAYS?' (ปี '+(Math.floor((d-1)/YEAR_DAYS)+1)+')':'')};
const now=function(){return performance.now()/1000};

function ens(){
 if(!S.loan||typeof S.loan!=='object')S.loan={};
 const L=S.loan;
 if(!Array.isArray(L.loans))L.loans=[];
 if(!Array.isArray(L.actors))L.actors=[];
 if(typeof L.bankMonth!=='number')L.bankMonth=-1;
 if(typeof L.mafiaMonth!=='number')L.mafiaMonth=-1;
 if(typeof L.collectDay!=='number')L.collectDay=0;
 if(typeof L.nid!=='number')L.nid=1;
 if(L.visit===undefined)L.visit=null;
 if(typeof L.contact!=='boolean')L.contact=false;
 if(typeof L.callCooldownUntil!=='number')L.callCooldownUntil=0;
 return L;
}
const mafiaLoan=function(){return ens().loans.find(function(l){return l.src==='mafia'})};
const bankLoans=function(){return ens().loans.filter(function(l){return l.src==='bank'})};
const calcTotal=function(P,r,days){return Math.round(P*(1+r/100*(days/30))/10)*10};

/* ---------- ข้อเสนอ ---------- */
function bankOffer(){
 const lv=lvl();
 let P=Math.round((S.money*.8+lv*15000)/5000)*5000;P=Math.max(25000,Math.min(200000,P));
 const months=P<=50000?1:P<=100000?2:3,term=months*30;
 let r=Math.round((4-lv*.25-Math.min(1,(S.rep||0)/500))*2)/2;r=Math.max(2,Math.min(4,r));
 return {principal:P,rate:r,term:term,total:calcTotal(P,r,term)};
}
function mafiaOffer(){
 const P=pick([50000,80000,100000,150000]),rate=pick([30,35,40,45,50,55,60]),term=rnd(12,20);
 return {principal:P,rate:rate,term:term,total:Math.round(P*(1+rate/100)/10)*10};
}

/* ---------- ตัวละคร ---------- */
function targets(n){
 const out=[],cu=S.customer&&S.customer.active&&S.customer.active.state!=='gone'?tile(S.customer.active):null;
 for(let i=0;i<CAND.length&&out.length<n;i++){
  const x=CAND[i][0],y=CAND[i][1];
  if(cu&&cu[0]===x&&cu[1]===y)continue;
  if(blk(x,y))continue;
  const p=bfs(OX.ent()[0],OX.ent()[1],function(a,b){return a===x&&b===y});
  if(!p||!p.length)continue;
  out.push({x:x,y:y,path:p});
 }
 while(out.length<n)out.push({x:4,y:13,path:[]});
 return out;
}
function mkActor(role,tg,delay){
 const L=ens();
 const a={id:'L'+(L.nid++),role:role,x:OX.entXY()[0],y:OX.entXY()[1],d:2,f:0,anim:0,state:'entering',
  path:tg.path.map(function(p){return p.slice()}),tx:tg.x,ty:tg.y,walkDelay:delay||0,seed:Math.random()*6,look:0};
 if(!a.path.length){a.state='waiting';a.x=tg.x*T+16;a.y=tg.y*T+16;a.d=0}
 return a;
}
/* ---- กันเดินทับกัน: ตัวที่อยู่ "หลัง" ในเส้นทางจะหยุดรอจนกว่าตัวหน้าจะเดินห่างพอ ---- */
function mvScore(a){
  if(a.state==='leavingEdge')return 1e6+a.x;
  const p=a.path&&a.path[0],d=p?Math.hypot(p[0]*T+16-a.x,p[1]*T+16-a.y):0;
  return -((a.path?a.path.length:0)*100+d);
}
function yields(a){
  const L=ens(),sa=mvScore(a),ia=L.actors.indexOf(a);
  for(let i=0;i<L.actors.length;i++){
   const b=L.actors[i];if(b===a)continue;
   if(b.state!=='entering'&&b.state!=='leaving'&&b.state!=='leavingEdge')continue;
   if(Math.hypot(b.x-a.x,b.y-a.y)>=SEP)continue;
   const sb=mvScore(b);
   if(sb>sa||(sb===sa&&i<ia))return true;
  }
  return false;
}
function stepActor(a,dr){
  const moving=a.state==='entering'||a.state==='leaving'||a.state==='leavingEdge';
  if(moving&&!(a.walkDelay>0)&&yields(a)){a.f=0;return}
  if(a.state==='entering'){
   a.anim=(a.anim||0)+dr*10;
   if(mvE(a,dr)){a.state='waiting';a.x=a.tx*T+16;a.y=a.ty*T+16;a.f=0;a.arrive=now()}
  }else if(a.state==='leaving'){
   a.anim=(a.anim||0)+dr*10;
   if(!a.path||!a.path.length){const p=tile(a);a.path=pathToRoadEnd(p[0],p[1])||[]}
   if(a.path.length){if(mvE(a,dr)){a.state='leavingEdge';a.exitEdgeX=vw()*T+24}}
   else{a.state='leavingEdge';a.exitEdgeX=vw()*T+24}
  }else if(a.state==='leavingEdge'){
   const ex=a.exitEdgeX||vw()*T+24;
   a.x=Math.min(ex,a.x+32*dr);a.d=3;a.f=(a.f||0)+dr*7;
   if(a.x>=ex)a.state='gone';
  }
}
function leaveAll(){
 ens().actors.forEach(function(a,i){
  if(a.state==='gone'||a.state==='leaving'||a.state==='leavingEdge')return;
  const p=tile(a);a.state='leaving';a.path=pathToRoadEnd(p[0],p[1])||[];a.walkDelay=i*.9;
 });
}
function shake(){
 const c=$('cv');if(!c)return;c.classList.remove('loanShake');void c.offsetWidth;c.classList.add('loanShake');
 setTimeout(function(){c.classList.remove('loanShake')},800);
}

/* ---------- เริ่ม / จบ การมาเยือน ---------- */
function startVisit(kind,mode,loan){
 const L=ens();
 const v={kind:kind,mode:mode,page:0,neg:0,more:0,stage:'talk',loanId:loan?loan.id:0,day:S.day,say:'',result:null};
 if(mode==='offer')v.offer=kind==='bank'?bankOffer():mafiaOffer();
 L.visit=v;
 if(kind==='bank'){
  const tg=targets(1);L.actors=[mkActor('banker',tg[0],0)];L.bankMonth=month();
  log('🏦 '+WHO.banker.name+' (นายธนาคาร) มาเยี่ยมบริษัท');
 }else{
  const tg=targets(2);L.actors=[mkActor('boss',tg[0],0),mkActor('guard',tg[1],1.1)];
  if(mode==='offer')L.mafiaMonth=month();else L.collectDay=S.day;
  shake();
  log(mode==='offer'?'🚨 ยากูซ่าสองคนเดินเข้ามาในออฟฟิศ...':'🚨 ยากูซ่ามาทวงเงินกู้ที่ออฟฟิศ!');
 }
}
function closeModal(){clearInterval(tw);tw=null;const m=$('loanModal');if(m)m.hidden=true}
function forceLeave(msg,stage){
 const L=ens(),v=L.visit;if(!v||v.stage==='done')return;
 closeModal();if(msg)log(msg);leaveAll();v.stage='done';
}

/* ---------- ยากูซ่าหมดความอดทน: โวยวาย + ตัดไฟ ---------- */
function fxShout(a,txt,color,delay){FX.push({k:'txt',x:a.x,y:a.y-56,t0:now()+(delay||0),txt:txt,color:color||'#ff6b6b',big:1,life:2.6})}
function guardOnDuty(){return (S.kitchenStaff||[]).some(function(e){return e.charId==='security-guard'&&['working','wanderWait','wandering'].indexOf(e.state)>=0})}
function cutPower(){
  let dur=rnd(300,480);const b=S.blk,gd=guardOnDuty();if(gd){dur=Math.round(dur/2);log('🛡️ รปภ. ช่วยควบคุมสถานการณ์ ไฟดับสั้นลงครึ่งหนึ่ง')}
  powerOutageOn('mafia');
  if(b&&b.on){b.left=Math.max(b.left,dur);b.mafia=1;b.backup=0;powerGridState().backup=false}
  else S.blk={day:S.day,at:S.t,left:dur,on:0,mafia:1,backup:0};
  shake();
  log('🔌 ลูกน้องยากูซ่าตัดสายไฟของบริษัท! สถานะไฟฟ้ากลางถูกอัปเดตแล้ว');
  save(1);
}
function walkOut(){
  const L=ens(),v=L.visit;if(!v||v.stage==='done')return;
  closeModal();
  const boss=L.actors.find(function(a){return a.role==='boss'})||L.actors[0],guard=L.actors.find(function(a){return a.role==='guard'})||boss;
  if(boss)fxShout(boss,'ไม่คืนใช่ไหม!! ได้...','#ff6b6b',0);
  if(guard)fxShout(guard,'ตัดไฟมันเลย!!','#ffb04a',.9);
  if(boss)fxShout(boss,'จำไว้ ฉันจะกลับมาอีก!','#ff6b6b',1.7);
  shake();setTimeout(shake,900);
  log('😡 ยากูซ่ารอจนหมดความอดทน โวยวายลั่นออฟฟิศแล้วเดินออกไป!');
  toast('😡 ยากูซ่าอาละวาด! เตรียมโดนตัดไฟ...');
  L.cut=1;L.cutT=2.0;
  leaveAll();
  L.actors.forEach(function(x){x.walkDelay=(x.walkDelay||0)+2.2}); // ยืนโวยวายก่อนแล้วค่อยเดินออก
  v.stage='done';v.wait=null;
}

/* ---------- tick ---------- */
function tick(dm,dr){
  const L=ens(),h=S.t/60;
  if(L.cut){L.cutT-=dr;if(L.cutT<=0){L.cut=0;cutPower()}}
  L.actors.forEach(function(a){stepActor(a,dr)});
  L.actors=L.actors.filter(function(a){return a.state!=='gone'});
  let v=L.visit;
  if(v&&v.yz){try{window.YZ&&YZ.visitTick(v,dr,h)}catch(e){console.error(e)}return}
  if(v&&v.phone){const pm=$('loanModal');if(pm&&!pm.hidden)return;L.visit=null;v=null} // สายโทรศัพท์: ปิดหน้าต่างแล้วถือว่าวางสาย
  if(v&&!L.actors.length){L.visit=null;v=null;closeModal()}
  if(v){
   const m=$('loanModal');
   if(m&&!m.hidden&&!L.actors.some(function(a){return a.state==='waiting'}))closeModal();
   if(v.mode==='collect'&&v.stage==='talk'){
    if(v.seen&&v.wait==null&&m&&m.hidden)v.wait=0; // ปิดหน้าต่างด้วยวิธีใดก็ตาม = ยังไม่คืน เริ่มนับเวลา
    if(v.wait!=null&&L.actors.some(function(a){return a.state==='waiting'})){
     v.wait+=dr;
     if(v.wait>=WAIT_SECS){walkOut();return}
    }
   }
   if(h>=17&&v.stage!=='done'){
    forceLeave(v.kind==='bank'?'นายธนาคารกลับไปแล้ว เนื่องจากหมดเวลาทำการ':v.mode==='collect'?'ยากูซ่ากลับไปด้วยความโกรธ... พรุ่งนี้จะมาทวงใหม่ พร้อมค่าปรับ':'ยากูซ่าหมดความอดทนและกลับไปแล้ว');
   }
   return;
  }
  if(S.over||(typeof CUT!=='undefined'&&CUT.on))return;
  try{if(window.YZ&&YZ.maybeStart(h))return}catch(e){console.error(e)}
  const mi=month(),dim=((S.day-1)%30)+1,ml=mafiaLoan();
  if(ml&&S.day>=ml.due&&h>=10&&h<16&&L.collectDay!==S.day){startVisit('mafia','collect',ml);return}
  if(dim===12&&h>=9.5&&h<16&&S.money>=MIN_BANK&&!bankLoans().length&&L.bankMonth!==mi){startVisit('bank','offer');return}
  // มีคอนแท็คแล้ว: ยากูซ่าจะไม่มาเสนอเงินกู้เองอีก (มาเฉพาะตอนทวงหนี้)
  if(!ml&&!L.contact&&S.money<=MAFIA_MAX&&S.money>-10000&&h>=9.5&&h<15.5&&L.mafiaMonth!==mi){
   L.mafiaMonth=mi; // ทอยลูกเต๋าได้เดือนละครั้งเดียว
   if(Math.random()<MAFIA_CHANCE)startVisit('mafia','offer');
  }
}

/* ---------- ข้ามวัน ---------- */
function daily(){
 const L=ens();let changed=false;
 closeModal();
 L.loans.filter(function(l){return l.src==='bank'&&S.day>=l.due}).forEach(function(l){
  S.money-=l.total;L.loans=L.loans.filter(function(x){return x!==l});changed=true;
  log('🏦 ธนาคารหักบัญชีชำระเงินกู้ '+M(l.total)+(S.money<0?' (เงินสดติดลบ!)':''));
 });
 const ml=mafiaLoan();
 if(ml&&S.day>ml.due){
  const pen=Math.round(ml.principal*LATE_PCT/10)*10;ml.total+=pen;ml.late=(ml.late||0)+1;
  S.rep=Math.max(0,(S.rep||0)-3);changed=true;
  log('😠 เลยกำหนดคืนยากูซ่า '+ml.late+' วัน ยอดหนี้เพิ่มเป็น '+M(ml.total));
 }
 if(changed){save(1);show()}
}

/* ---------- เส้นทางการสนทนา ---------- */
function lines(v){
 if(v.stage==='result')return [v.result];
 const nm=esc(S.ceo||'CEO'),co=esc(S.name||'บริษัท');
 if(v.kind==='bank')return [
  {who:'banker',t:'สวัสดีครับ คุณ'+nm+' ผมธนากร จากฝ่ายสินเชื่อธุรกิจครับ ช่วงนี้ผมเห็นสภาพคล่องของ '+co+' แข็งแรงดีมากเลยนะครับ'},
  {who:'banker',t:'ทางธนาคารอยากสนับสนุนให้บริษัทเติบโตต่อครับ ผมเลยเตรียมข้อเสนอสินเชื่อที่เหมาะกับสถานะของบริษัทมาให้ เชิญดูรายละเอียดได้เลยครับ'}];
 if(v.phone)return [
   {who:'boss',t:'...ฮัลโหล? อ๋อ เจ้าของบริษัทนั่นเอง โทรมาหาผมเองเลยเหรอ ผมรู้อยู่แล้วว่าเดี๋ยวคุณก็ต้องโทรมา'},
   {who:'boss',t:'ผมมีเงินให้ยืมเหมือนเดิม ไม่ต้องมีเอกสารยุ่งยาก ดูเงื่อนไขแล้วตัดสินใจเลย แต่อย่าลืมวันครบกำหนดล่ะ ผมจะไปรับด้วยตัวเอง'}];
 if(v.mode==='offer')return [
  {who:'boss',t:'หึ... ได้ยินว่าบริษัทนี้เงินเหลือแค่หยิบมือ ผมมีเงินให้ยืม ไม่ต้องมีเอกสารยุ่งยากด้วย'},
  {who:'guard',t:'รับไปเถอะครับ... แต่ระวังเรื่องวันคืนไว้ให้ดี เจ้านายผมไม่ชอบรอใคร'}];
 const ml=ens().loans.find(function(l){return l.id===v.loanId})||{};
 return [
  {who:'boss',t:'ครบกำหนดแล้ว เจ้าของบริษัท ผมมารับเงินด้วยตัวเอง เหมือนที่ตกลงกันไว้'+(ml.late?' ... และคุณเลยกำหนดมา '+ml.late+' วันแล้วนะ':'')},
  {who:'guard',t:'เงินต้องส่งต่อหน้าเท่านั้นครับ ไม่รับโอน ไม่รับคำแก้ตัว'}];
}
function contract(v){
 const o=v.offer,rows=function(a){return a.map(function(r){return '<span>'+r[0]+'</span><b'+(r[2]?' style="color:'+r[2]+'"':'')+'>'+r[1]+'</b>'}).join('')};
 if(v.mode==='offer'&&v.kind==='bank'){
  const more='<b>เงื่อนไขของธนาคาร</b><ul><li>คิดดอกเบี้ยแบบคงที่ ไม่ทบต้น</li><li>ธนาคารหักบัญชีอัตโนมัติในวันครบกำหนด ถ้าเงินสดไม่พอ ยอดจะติดลบ</li><li>ชำระก่อนกำหนดได้ที่แท็บ "การเงิน" (คิดดอกเบี้ยตามเดือนที่ใช้จริง)</li></ul>';
  return '<div class="clientContract"><b>🏦 ข้อเสนอสินเชื่อธุรกิจ</b><h3>'+M(o.principal)+' · ดอกเบี้ย '+o.rate+'%/เดือน</h3><div class="clientGrid">'+rows([
   ['เงินต้น',M(o.principal)],['ดอกเบี้ย',o.rate+'% ต่อเดือน'],['ระยะเวลา',o.term+' วัน'],['ยอดชำระรวม',M(o.total),'#ffd45a'],['ครบกำหนด',dateTxt(S.day+o.term)],['วิธีชำระ','หักบัญชีอัตโนมัติ']])+'</div><div class="clientMore">'+(v.more?more:'')+'</div></div>';
 }
 if(v.mode==='offer'){
  const more='<b>เงื่อนไข (ไม่มีสัญญาเป็นลายลักษณ์อักษร)</b><ul><li>ต้องคืนต่อหน้าเท่านั้น: ถึงวันครบกำหนดพวกเขาจะมาที่ออฟฟิศเอง</li><li>เลยกำหนดบวกค่าปรับ '+Math.round(LATE_PCT*100)+'% ของเงินต้นต่อวัน และชื่อเสียงตก</li><li>เงินสดไม่พอ ก็ถูกหักจนยอดคงเหลือติดลบ</li></ul>';
  return '<div class="clientContract" style="border-color:#8e2a35"><b>🐉 ข้อเสนอเงินกู้นอกระบบ</b><h3 style="color:#ff9aa5">'+M(o.principal)+' · ดอกเบี้ย '+o.rate+'% ต่อ '+o.term+' วัน</h3><div class="clientGrid">'+rows([
   ['เงินต้น (รับทันที)',M(o.principal)],['ดอกเบี้ย',o.rate+'% ต่อ '+o.term+' วัน','#ff6b6b'],['ยอดที่ต้องคืน',M(o.total),'#ff6b6b'],['ครบกำหนด',dateTxt(S.day+o.term)],['วิธีชำระ','คืนต่อหน้าเท่านั้น'],['เลยกำหนด','+'+Math.round(LATE_PCT*100)+'% ของต้น/วัน']])+'</div><div class="clientMore">'+(v.more?more:'')+'</div></div>';
 }
 const ml=ens().loans.find(function(l){return l.id===v.loanId});if(!ml)return '';
 const after=S.money-ml.total;
 return '<div class="clientContract" style="border-color:#8e2a35"><b>🐉 ใบทวงหนี้</b><h3 style="color:#ff9aa5">ต้องคืน '+M(ml.total)+'</h3><div class="clientGrid">'+rows([
  ['เงินต้น',M(ml.principal)],['ยอดที่ต้องคืน',M(ml.total),'#ff6b6b'],['เลยกำหนด',(ml.late||0)+' วัน'],['เงินสดตอนนี้',M(S.money)],['หลังชำระ',M(after),after<0?'#ff6b6b':'#71e6a5'],['ครบกำหนดเดิม',dateTxt(ml.due)]])+'</div>'+(after<0?'<div class="clientMore" style="color:#ffb3ba">⚠ เงินสดไม่พอ ถ้าชำระตอนนี้ยอดเงินจะติดลบ '+M(after)+'</div>':'')+'</div>';
}
function typeIn(){
 clearInterval(tw);tw=null;
 const el=$('loanSpeechTxt'),sp=$('loanSpeech');if(!el)return;
 const full=el.getAttribute('data-full')||'',arr=Array.from(full);let i=0;el.textContent='';
 tw=setInterval(function(){i+=2;el.textContent=arr.slice(0,i).join('');if(i>=arr.length){clearInterval(tw);tw=null}},24);
 if(sp)sp.onclick=function(){clearInterval(tw);tw=null;el.textContent=full};
}
function render(){
 const L=ens(),v=L.visit,m=$('loanModal');if(!v||!m)return;
 const ls=lines(v),idx=Math.min(v.page,ls.length-1),ln=ls[idx],last=v.stage==='result'||idx>=ls.length-1;
 const W=WHO[ln.who],mafia=v.kind==='mafia';
  v.seen=1; // เปิด/ปิดหน้าต่างคุยไม่รีเซ็ตเวลารอของยากูซ่า
 const say=(v.say&&last&&v.stage==='talk')?v.say:ln.t;
 const body=(v.stage==='talk'&&last)?contract(v):'';
 let acts='';
 if(v.stage==='result')acts='<button class="btn clientAccept" style="grid-column:1/-1" onclick="LOAN.finish()">ตกลง</button>';
 else if(!last)acts='<button class="btn clientAccept" style="grid-column:1/-1" onclick="LOAN.next()">ถัดไป ▶</button>';
 else if(v.mode==='offer'){
  acts='<button class="btn clientAccept" onclick="LOAN.accept()">'+(mafia?'💴 ยืมเงิน':'✓ รับเงินกู้')+'</button>'+
   '<button class="btn clientNegotiate" onclick="LOAN.negotiate()">'+(v.neg?'ต่อรองแล้ว':'💬 ต่อรองดอกเบี้ย')+'</button>'+
   '<button class="btn" onclick="LOAN.more()">ⓘ '+(v.more?'ซ่อนเงื่อนไข':'ดูเงื่อนไข')+'</button>'+
   '<button class="btn clientReject" onclick="LOAN.reject()">✕ ปฏิเสธ</button>';
 }else{
  const ml=L.loans.find(function(l){return l.id===v.loanId});
  acts='<button class="btn clientAccept" onclick="LOAN.pay()">💴 คืนเงิน '+(ml?M(ml.total):'')+'</button><button class="btn clientReject" onclick="LOAN.closeKeep()">ยังไม่คืน (ปิด)</button>';
 }
 const thumbs=mafia&&!v.phone?['boss','guard'].filter(function(k){return k!==ln.who}).map(function(k){return '<img class="loanThumb" src="'+LOAN_PORT[k]+'" alt="">'}).join(''):'';
 m.innerHTML='<div class="clientDialog loanDlg'+(mafia?' mafia':'')+'"><div class="clientHead"><img class="loanPortImg" src="'+LOAN_PORT[ln.who]+'" alt=""><div><div class="clientTag" style="'+(mafia?'background:#5a1822;color:#ffc9cf':'background:#1f4d6b;color:#d8f0ff')+'">'+W.tag+'</div><h2>'+W.name+'</h2><small>'+W.role+'</small><div class="clientStars">'+(v.phone?'📞 กำลังโทรศัพท์':mafia?'⚠ อันตราย ★★★★★':'💼 พันธมิตรการเงิน')+'</div></div><div class="loanThumbs">'+thumbs+'</div><button class="btn clientClose" onclick="LOAN.close()">✕</button></div>'+
  '<div class="clientSpeech loanSpeech'+(mafia?' mafia':'')+'" id="loanSpeech">“<span id="loanSpeechTxt" data-full="'+esc(say)+'">'+esc(say)+'</span>”</div>'+body+'<div class="clientActions">'+acts+'</div></div>';
 m.hidden=false;typeIn();
}

/* ---------- เอฟเฟกต์เงิน ---------- */
function fxMoney(txt,color){
 const a=ens().actors[0],x=a?a.x:S.pl.x,y=a?a.y-40:S.pl.y-40,t0=now();
 FX.push({k:'txt',x:x,y:y,t0:t0,txt:txt,color:color});
 if(color!=='#ff6b6b')for(let i=0;i<14;i++)FX.push({k:'coin',x:x,y:y+10,t0:t0,vx:(Math.random()-.5)*90,vy:-60-Math.random()*70});
}

/* ---------- ปุ่มต่าง ๆ ในบทสนทนา ---------- */
function next(){const v=ens().visit;if(!v)return;v.page++;render()}
function more(){const v=ens().visit;if(!v||v.mode!=='offer')return;v.more=v.more?0:1;render()}
function close(){const v=ens().visit;if(v&&v.stage==='result'){finish();return}closeKeep()}
function closeKeep(){
  const v=ens().visit;closeModal();
  if(v&&v.mode==='collect'&&v.stage==='talk'&&v.wait==null){v.wait=0;toast('ยากูซ่ายังยืนรออยู่... ถ้าไม่คืนภายใน '+WAIT_SECS+' วินาที พวกเขาจะอาละวาดและตัดไฟ!')}
}
function finish(){const L=ens(),v=L.visit;closeModal();if(!v)return;if(v.phone){L.visit=null;save(1);hud();show();return}leaveAll();v.stage='done';save(1);hud();show()}
function toResult(who,t){const v=ens().visit;v.stage='result';v.result={who:who,t:t};render()}
function accept(){
 const L=ens(),v=L.visit;if(!v||v.mode!=='offer'||v.stage!=='talk')return;
 const o=v.offer,bank=v.kind==='bank';
 if(!bank&&mafiaLoan())return toast('ยังมีหนี้ยากูซ่าค้างอยู่');
 S.money+=o.principal;
 L.loans.push({id:L.nid++,src:v.kind==='bank'?'bank':'mafia',principal:o.principal,rate:o.rate,term:o.term,total:o.total,taken:S.day,due:S.day+o.term,late:0});
 fxMoney('+'+M(o.principal),'#71e6a5');
 log(bank?'🏦 กู้เงินธนาคาร +'+M(o.principal)+' · คืน '+M(o.total)+' ภายใน '+o.term+' วัน':'🐉 ยืมเงินยากูซ่า +'+M(o.principal)+' · ต้องคืน '+M(o.total)+' ต่อหน้า '+dateTxt(S.day+o.term));
 toResult(bank?'banker':'boss',bank?
  'ขอบคุณที่ไว้วางใจครับ ผมโอนเงิน '+M(o.principal)+' เข้าบัญชีบริษัทเรียบร้อยแล้ว ถึง'+dateTxt(S.day+o.term)+' ทางธนาคารจะหักบัญชี '+M(o.total)+' อัตโนมัติครับ':
  'ดีมาก ผมชอบคนตัดสินใจเร็ว ถึง'+dateTxt(S.day+o.term)+' ผมจะมารับ '+M(o.total)+' ด้วยตัวเอง ต่อหน้า... จำไว้ ห้ามหนี');
 save(1);hud();show();
}
function negotiate(){
 const v=ens().visit;if(!v||v.mode!=='offer'||v.neg||v.stage!=='talk')return;
 v.neg=1;const o=v.offer,r=Math.random();
 if(v.kind==='bank'){
  if(r<.55){o.rate=Math.max(1.5,o.rate-.5);o.total=calcTotal(o.principal,o.rate,o.term);v.say='ได้ครับ... ผมขออนุมัติพิเศษให้ ลดดอกเบี้ยเหลือ '+o.rate+'% ต่อเดือน ถือว่าเป็นลูกค้าชั้นดีครับ';toast('ต่อรองสำเร็จ: ดอกเบี้ย '+o.rate+'%/เดือน')}
  else{v.say='ขออภัยครับ อัตรานี้เป็นเพดานต่ำสุดที่ระบบอนุมัติให้บริษัทได้แล้วจริง ๆ ครับ';toast('ต่อรองไม่สำเร็จ')}
  render();return;
 }
 if(r<.35){o.rate=Math.max(15,o.rate-5);o.total=Math.round(o.principal*(1+o.rate/100)/10)*10;v.say='...ฮึ กล้าต่อรองกับผมเหรอ ก็ได้ วันนี้อารมณ์ดี ลดให้ '+'5% ไม่มีครั้งหน้า';toast('ต่อรองสำเร็จ: ดอกเบี้ย '+o.rate+'%');render()}
 else if(r<.5){toast('ยากูซ่าโมโห ยกเลิกข้อเสนอ!');shake();toResult('boss','ฉันไม่ต่อรองกับใครทั้งนั้น ข้อเสนอนี้ยกเลิก! ...อย่าให้ฉันต้องมาอีกทีก็แล้วกัน')}
 else{v.say='ไม่มีต่อรอง ผมให้ราคาเดียว จะเอาก็เอา ไม่เอาก็บอกมา';toast('ต่อรองไม่สำเร็จ');render()}
}
function reject(){
 const L=ens(),v=L.visit;if(!v||v.mode!=='offer'||v.stage!=='talk')return;
 if(v.kind==='bank')toResult('banker','เข้าใจครับ ไว้ถ้าบริษัทสนใจ ผมจะกลับมาเสนอใหม่เดือนหน้านะครับ ขอบคุณที่สละเวลาครับ');
 else if(v.phone){
  L.callCooldownUntil=Date.now()+20000;
  toResult('boss','ฮึ... โทรมารบกวนเวลาผม แล้วยังปฏิเสธอีกเหรอ? อย่าโทรมากวนบ่อยนักล่ะ! รอให้ผมหายหงุดหงิดก่อน อีก 20 วินาทีค่อยโทรมาใหม่');
  save(1);
 }else toResult('boss','ฮึ... ก็ตามใจ แต่เมื่อไหร่ที่หมดตัวจริง ๆ คุณรู้แล้วว่าต้องไปหาใคร');
}
function pay(){
  const L=ens(),v=L.visit;if(!v||v.mode!=='collect'||v.stage!=='talk')return;
  const ml=L.loans.find(function(l){return l.id===v.loanId});if(!ml)return;
  const wasLate=ml.late||0,first=!L.contact;
  S.money-=ml.total;L.loans=L.loans.filter(function(x){return x!==ml});
  L.contact=true;v.wait=null;
  fxMoney('-'+M(ml.total),'#ff6b6b');
  log('🐉 คืนเงินยากูซ่า '+M(ml.total)+(S.money<0?' · เงินสดติดลบ '+M(S.money):''));
  let txt=wasLate?'ถึงจะช้าไปหน่อย แต่จ่ายครบก็ถือว่าจบเรื่อง... คราวหน้าอย่าให้ผมต้องรอ ผมชอบคนตรงต่อเวลา':'คืนเงินแล้วดี ผมชอบคนตรงต่อเวลา';
  if(first)txt+=' ผมส่งคอนแท็คให้ไว้แล้ว ถ้าเดือดร้อนเรื่องเงินก็โทรหาผมเองได้เลย จากนี้ผมจะไม่มาเสนอเงินกู้เอง จะมาก็ต่อเมื่อถึงวันทวงเท่านั้น';
  else txt+=' เบอร์ผมยังอยู่ในเครื่องคุณ จะยืมใหม่ก็โทรมา';
  if(S.money<0)txt+=' (แต่ยอดเงินคุณติดลบ '+M(S.money)+' นะ จัดการให้ดีล่ะ)';
  if(first){toast('📞 ได้รับคอนแท็คยากูซ่า! เปิดดูได้ที่คอมพิวเตอร์ห้อง Manager');log('📞 ริวจิส่งคอนแท็คให้ — โทรขอยืมเงินได้จากคอมพิวเตอร์ห้อง Manager (ยากูซ่าจะไม่มาเสนอเงินกู้เองอีก)')}
  toResult('boss',txt);
  save(1);hud();show();
}
/* ---------- โทรหายากูซ่า (จากคอมพิวเตอร์) ---------- */
function call(){
  const L=ens();
  if(!L.contact)return toast('ยังไม่มีคอนแท็คยากูซ่า');
  if(S.over)return;
  if(L.visit||L.actors.length)return toast('ตอนนี้มีแขกอยู่ในออฟฟิศ โทรไม่ได้');
  if(mafiaLoan())return toast('ยังมีหนี้ยากูซ่าค้างอยู่ ต้องคืนก่อนถึงจะยืมใหม่ได้');
  const cooldown=Math.ceil((L.callCooldownUntil-Date.now())/1000);
  if(cooldown>0)return toast('ริวจิยังไม่อยากรับสาย รออีก '+cooldown+' วินาที');
  L.visit={kind:'mafia',mode:'offer',page:0,neg:0,more:0,stage:'talk',loanId:0,day:S.day,say:'',result:null,phone:1,offer:mafiaOffer()};
  log('📞 โทรหาริวจิ (ยากูซ่า) เพื่อขอยืมเงิน');
  render();
}
function contactApp(){
  const L=ens(),ml=mafiaLoan(),busy=L.visit||L.actors.length,cooldown=Math.max(0,Math.ceil((L.callCooldownUntil-Date.now())/1000));
  if(!L.contact)return '<div class="m">ยังไม่มีรายชื่อติดต่อ</div>';
  return '<div style="padding:4px 0"><div style="display:flex;align-items:center;gap:10px;padding:8px;border:1px solid #6a86b8;border-radius:8px;background:#222c40"><img src="'+LOAN_PORT.boss+'" style="width:52px;height:52px;border-radius:10px;object-fit:cover" alt=""><div style="flex:1"><b>ริวจิ</b><br><small>ยากูซ่า · เงินกู้นอกระบบ</small></div></div>'+
   '<div style="margin-top:8px"><button class="btn osAct" style="background:#8e2a35;color:#fff;width:100%" '+(ml||busy||cooldown?'disabled':'')+' onclick="OS.close();LOAN.call()">📞 โทรหาริวจิ ขอยืมเงิน</button></div>'+
   '<small style="display:block;margin-top:6px;color:#b7c0d2">'+(ml?'⚠ ยังมีหนี้ค้างอยู่ ต้องคืนก่อนถึงจะยืมใหม่ได้ (ครบกำหนด '+dateTxt(ml.due)+')':busy?'ตอนนี้มีแขกอยู่ในออฟฟิศ โทรไม่ได้':cooldown?'ริวจิไม่พอใจที่โทรมาปฏิเสธ รออีก '+cooldown+' วินาทีก่อนโทรใหม่':'ไม่ต้องมีเอกสาร ได้เงินทันที ดอกเบี้ยสูง · ถึงวันครบกำหนดยากูซ่าจะมาทวงที่ออฟฟิศเอง')+'</small></div>';
}
function repayBank(id){
 const L=ens(),l=L.loans.find(function(x){return x.id===id&&x.src==='bank'});if(!l)return;
 const m=Math.min(l.term/30,Math.max(1,Math.ceil((S.day-l.taken)/30))),amt=calcTotal(l.principal,l.rate,m*30);
 if(S.money<amt)return toast('เงินสดไม่พอ ต้องใช้ '+M(amt));
 S.money-=amt;L.loans=L.loans.filter(function(x){return x!==l});
 log('🏦 ชำระเงินกู้ธนาคารก่อนกำหนด '+M(amt));save(1);hud();show();
}

/* ---------- ปุ่มคุย ---------- */
function talk(){
 const L=ens(),v=L.visit;if(!v||v.stage==='done')return false;
 const lead=L.actors[0];if(!lead||lead.state!=='waiting')return false;
 const p=S.pl,near=L.actors.some(function(a){return a.state==='waiting'&&Math.hypot(a.x-p.x,a.y-p.y)<=86});
 if(near){if(v.yz&&window.YZ){YZ.talkVisit(v);return true}const m=$('loanModal');if(m&&m.hidden)render();return true}
 const c=S.customer&&S.customer.active;if(c&&c.state==='waiting')return false;
 toast('เดินไปคุยกับ '+(v.kind==='bank'?WHO.banker.name:'ยากูซ่า'));return true;
}
function label(){
 const L=S.loan,v=L&&L.visit;if(!v||v.stage==='done')return '';
 const lead=L.actors&&L.actors[0];if(!lead||lead.state!=='waiting')return '';
 return v.kind==='bank'?'คุยกับนายธนาคาร':'คุยกับยากูซ่า';
}

/* ---------- วาด ---------- */
function drawActor(g,a,t){
 if(a.state==='gone')return;
 const img=SPR[a.role];if(!img||!img.complete||!img.naturalWidth)return;
 const walking=a.state==='entering'||a.state==='leaving'||a.state==='leavingEdge';
 let d=a.d||0;
 if(a.state==='waiting'){
  const dx=S.pl.x-a.x,dy=S.pl.y-a.y;
  if(Math.hypot(dx,dy)<150){const w=Math.abs(dx)>=Math.abs(dy)?(dx<0?1:3):(dy<0?2:0);if(w!==a.look&&(a.lookAt==null||a.lookAt>t||t-a.lookAt>.35)){a.look=w;a.lookAt=t}d=a.look}
  else d=0;
 }
 const row=[0,2,1,3][d],fr=walking?Math.floor(a.f||0)%4:0;
 const x=Math.round(a.x),y=Math.round(a.y),k=.56,w=64*k,hh=96*k;
 const bob=walking?0:Math.sin(t*2.2+(a.seed||0))*.9;
 const ad=a.arrive?t-a.arrive:-1,grow=(ad>=0&&ad<.5)?1+.08*Math.sin(ad*Math.PI/.5):1;
 g.save();g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
 g.translate(x,y+9);g.scale(grow,grow);
 g.drawImage(img,fr*64,row*96,64,96,-w/2,-93*k+bob,w,hh);
 g.restore();g.imageSmoothingEnabled=false;
 if(a.state==='waiting'){
  const pulse=1+.12*Math.sin(t*5+(a.seed||0)),by=y-50;
  const mafia=a.role!=='banker',vv=S.loan&&S.loan.visit,tm=(mafia&&vv&&vv.mode==='collect'&&vv.stage==='talk'&&vv.wait!=null)?Math.max(0,Math.ceil(WAIT_SECS-vv.wait)):-1,bw=tm>=0?14:9;
  g.save();g.translate(x,by);g.scale(pulse,pulse);
  g.fillStyle=mafia?'rgba(60,8,16,.94)':'rgba(12,16,26,.92)';g.fillRect(-bw,-8,bw*2,15);
  g.strokeStyle=mafia?'#ff5b6b':'#ffd45a';g.lineWidth=1;g.strokeRect(-bw+.5,-7.5,bw*2-1,14);
  g.fillStyle=mafia?'#ff7a88':'#ffd45a';g.font='bold 12px sans-serif';g.textAlign='center';
  g.fillText(tm>=0?String(tm):(mafia?'!!':'$'),0,4);g.restore();
 }
}
function pushDraw(list,g,t){
 const L=S.loan;if(!L||!L.actors)return;
 L.actors.forEach(function(a){list.push([a.y+12,function(){drawActor(g,a,t)}])});
}
function drawFx(g,w,t){
 const L=S.loan,h=H*T;
 if(L&&L.visit&&L.visit.kind==='mafia'&&L.actors&&L.actors.some(function(a){return a.state==='waiting'||a.state==='entering'})){
  const p=.5+.5*Math.sin(t*2.4),gr=g.createRadialGradient(w/2,h/2,h*.3,w/2,h/2,w*.62);
  gr.addColorStop(0,'rgba(120,0,20,0)');gr.addColorStop(1,'rgba(120,0,20,'+(.22+.12*p).toFixed(3)+')');
  g.fillStyle=gr;g.fillRect(0,0,w,h);
 }
 const n=now();
 for(let i=FX.length-1;i>=0;i--){
  const f=FX[i],dt=n-f.t0;
  if(dt<0)continue;if(dt>(f.life||2)){FX.splice(i,1);continue}
  if(f.k==='coin'){
   const x=f.x+f.vx*dt,y=f.y+f.vy*dt+260*dt*dt;
   g.globalAlpha=Math.max(0,1-dt/1.6);g.fillStyle='#e0a82e';g.beginPath();g.arc(x,y,3.2,0,7);g.fill();
   g.fillStyle='#ffd45a';g.fillRect(x-1.5,y-1.5,2,2);g.globalAlpha=1;
  }else{
   g.globalAlpha=Math.max(0,1-dt/((f.life||2)-.2));g.font='bold '+(f.big?17:15)+'px sans-serif';g.textAlign='center';
   g.lineWidth=3;g.strokeStyle='#000';g.strokeText(f.txt,f.x,f.y-dt*28);g.fillStyle=f.color;g.fillText(f.txt,f.x,f.y-dt*28);
   g.globalAlpha=1;g.textAlign='left';
  }
 }
}

/* ---------- การ์ดหนี้สินในแท็บการเงิน ---------- */
function finCard(){
 const L=ens();
 if(!L.loans.length)return '<div class="c"><b>💳 หนี้สิน</b><div class="m">ไม่มีหนี้ค้างชำระ · นายธนาคารจะมาเสนอสินเชื่อทุกวันที่ 12 ของเดือน เมื่อมีเงินสดอย่างน้อย '+M(MIN_BANK)+(L.contact?'<br>📞 มีคอนแท็คยากูซ่า: โทรขอยืมเงินได้จากคอมพิวเตอร์ห้อง Manager':'')+'</div></div>';
 return '<div class="c"><b>💳 หนี้สิน</b>'+L.loans.map(function(l){
  const left=l.due-S.day;
  if(l.src==='bank'){
   const m=Math.min(l.term/30,Math.max(1,Math.ceil((S.day-l.taken)/30))),amt=calcTotal(l.principal,l.rate,m*30);
   return '<div class="m" style="margin:6px 0">🏦 <b>เงินกู้ธนาคาร</b> · เงินต้น '+M(l.principal)+' · ดอกเบี้ย '+l.rate+'%/เดือน<br>ตัดบัญชี '+M(l.total)+' ใน '+dateTxt(l.due)+' (อีก '+Math.max(0,left)+' วัน) <button class="btn" style="margin-top:4px" onclick="LOAN.repayBank('+l.id+')">ชำระก่อนกำหนด '+M(amt)+'</button></div>';
  }
  return '<div class="m" style="margin:6px 0;color:#ff9aa5">🐉 <b>เงินกู้ยากูซ่า</b> · เงินต้น '+M(l.principal)+' · ต้องคืน <b>'+M(l.total)+'</b><br>ต้องคืนต่อหน้าที่ออฟฟิศ '+dateTxt(l.due)+(left>=0?' (อีก '+left+' วัน)':' · <b>เลยกำหนด '+(l.late||0)+' วัน!</b>')+'</div>';
 }).join('')+'</div>';
}

/* ---------- เครื่องมือทดสอบ ---------- */
function testStart(kind,mode){
 const L=ens();
 if(L.visit&&L.visit.stage!=='done'){forceLeave('')}
 L.actors=[];L.visit=null;closeModal();
 let loan=null;
 if(mode==='collect'){
  loan=mafiaLoan();
  if(!loan){const o={principal:80000,rate:45,term:15};loan={id:L.nid++,src:'mafia',principal:o.principal,rate:o.rate,term:o.term,total:Math.round(o.principal*1.45/10)*10,taken:S.day-15,due:S.day,late:0};L.loans.push(loan)}
 }
 startVisit(kind,mode,loan);
 if(S.t<9*60||S.t>=16*60)S.t=10*60;
 hud();show();toast('เรียก'+(kind==='bank'?'นายธนาคาร':mode==='collect'?'ยากูซ่ามาทวงหนี้':'ยากูซ่า (เสนอเงินกู้)')+'แล้ว');
}
function testContact(){const L=ens();L.contact=!L.contact;save(1);hud();show();toast(L.contact?'เปิดคอนแท็คยากูซ่าแล้ว (ดูในคอมพิวเตอร์ห้อง Manager)':'ลบคอนแท็คยากูซ่าแล้ว')}
function testReset(){
 const L=ens();closeModal();L.actors=[];L.visit=null;L.loans=[];L.bankMonth=-1;L.mafiaMonth=-1;L.collectDay=0;L.contact=false;L.cut=0;
 save(1);hud();show();toast('รีเซ็ตระบบกู้เงินแล้ว');
}

A.cutPower=cutPower;
return {tick:tick,daily:daily,talk:talk,label:label,pushDraw:pushDraw,drawFx:drawFx,finCard:finCard,
 next:next,more:more,close:close,closeKeep:closeKeep,finish:finish,accept:accept,negotiate:negotiate,reject:reject,pay:pay,repayBank:repayBank,
 call:call,contactApp:contactApp,testContact:testContact,testStart:testStart,testReset:testReset,_ens:ens,_render:render,_x:{ens:ens,targets:targets,mkActor:mkActor,leaveAll:leaveAll,shake:shake,mafiaLoan:mafiaLoan,closeModal:closeModal,WHO:WHO}};
})();
window.LOAN=LOAN;
(function(){
 var _e=endDay;
 endDay=function(){var r=_e.apply(this,arguments);try{LOAN.daily()}catch(e){console.error('LOAN.daily',e)}return r};
 A.testBanker=function(){LOAN.testStart('bank','offer')};
 A.testMafiaOffer=function(){LOAN.testStart('mafia','offer')};
 A.testMafiaCollect=function(){LOAN.testStart('mafia','collect')};
 A.testLoanReset=function(){LOAN.testReset()};
  A.testMafiaContact=function(){LOAN.testContact()};
})();

