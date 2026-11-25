
/* ============================================================================
 * CARD SHOP — GRAND LEGENDARY AUCTION (Core)
 * งานประมูลทุก 7 วันในเกม · 3 ล็อต (Tier 5 / Tier 6 / SPECIAL 2%) · NPC นักประมูลแข่งกันจริง · ขยายเวลา · Save · ขาย SPECIAL ≥ 1,000,000
 * ไม่แตะ DOM — เวลาเป็น “เวลาเสมือน” (ms) จึงจำลองเร็ว/ทดสอบใน Node ได้ และ Save/Load ต่อเวลาที่เหลือได้ตรงตัว
 * ========================================================================== */
(function(root){
'use strict';
const C=root.CARDSHOP;if(!C||!C.GACHA)return;
const G=C.GACHA;

/* ---------- SPECIAL COLLECTION (การ์ดสะสมเท่านั้น ไม่มี Tier ใช้ Battle ไม่ได้) ---------- */
C.TIERS[7]={n:7,name:'SPECIAL',th:'การ์ดสะสมพิเศษ',color:'#ff9be8',glow:'#ff5fd0'};
// [ชื่อ, ราคาเริ่มต้นต่ำสุด, สูงสุด, ราคาขายขั้นต่ำให้ NPC, มูลค่าประเมิน, คำอธิบาย]
const SPECIALS=[
 ['คิทสึเนะน้อย',50000,100000,1000000,1100000,'จิ้งจอกน้อยแห่งศาลเจ้าซากุระ นำโชคให้ผู้พบเห็น'],
 ['สไลม์ราชาน้อย',80000,150000,1000000,1150000,'สไลม์ผู้สวมมงกุฎคริสตัลแห่งสายรุ้ง'],
 ['กระต่ายนางฟ้า',100000,200000,1200000,1300000,'กระต่ายมีปีกผู้ถือไม้กายสิทธิ์ดวงดาว'],
 ['มังกรคริสตัล',150000,300000,1500000,1650000,'มังกรน้อยผู้เฝ้าสมบัติผลึกคริสตัล'],
 ['แมวแห่งโชคลาภ',200000,350000,2000000,2200000,'แมวสามสีผู้นำโชคลาภใต้ต้นซากุระ'],
 ['ภูติกระดิ่งดอกไม้',300000,500000,3000000,3300000,'ภูติแห่งสวนดอกไม้ผู้ถือกระดิ่งนำโชค'],
 ['สุริยะราชัน',250000,450000,2500000,2700000,'หัวใจแห่งระบบสุริยะ'],
 ['จันทราเวหา',200000,400000,2000000,2200000,'ผู้พิทักษ์ราตรี'],
 ['เทอร่า มารดาโลก',250000,450000,2400000,2600000,'ชีวิตแห่งปฐพี'],
 ['ดาวหางอารูกะ',120000,250000,1300000,1450000,'ผู้เดินทางแห่งห้วงจักรวาล'],
 ['แซทเทรีย',180000,320000,1800000,2000000,'ผู้ครองวงแหวน'],
 ['เลวาธานดารา',300000,500000,3000000,3300000,'วาฬแห่งกาแลกซี']];
if(!C.FAC_BY_ID.special){const f={id:'special',name:'SPECIAL COLLECTION',th:'การ์ดสะสมพิเศษ',color:'#ff9be8',gacha:true,special:true};C.FACTIONS.push(f);C.FAC_BY_ID.special=f}
SPECIALS.forEach((r,i)=>{
 const id='special_'+i;if(C.CARD_BY_ID[id])return;
 const card={id,fac:'special',idx:i,name:r[0],grade:5,power:0,skill:r[5],tier:7,gt:7,gacha:true,special:true,por:false,
  startMin:r[1],startMax:r[2],sellMin:r[3],value:r[4]};
 C.CARDS.push(card);C.CARD_BY_ID[id]=card;
});
const specialCards=()=>C.CARDS.filter(c=>c.special);

/* ---------- ค่าคงที่ ---------- */
const CFG={PERIOD:7,SPECIAL_CHANCE:0.02,DURATION:30000,EXT_WINDOW:10000,EXT:10000,
 START:{5:[10000,20000],6:[21000,46000]},EST:{5:25000,6:100000},T6_SHARE:.4,
 // ช่วง “ส่วนเพิ่มเหนือราคาเริ่มต้น” ที่ NPC ยอมจ่ายสูงสุด (เป้าหมายออกแบบ AI ไม่ใช่การล็อกผล)
 UP:{5:[.12,1.1],6:[.35,2.6],7:[1.4,9]},HIST_MAX:300,SELL_MIN:1000000};
const roundTo=(v,u)=>Math.round(v/u)*u;
const rnd=()=>C.rnd01();
const ri=(a,b,r)=>a+Math.floor((r||rnd)()*(b-a+1));
const rr=(a,b,r)=>a+(r||rnd)()*(b-a);

/* ---------- NPC นักประมูล ---------- */
// type: 1 ทั่วไป · 2 ระดับสูง · 3 เศรษฐีเมือง · 4 มหาเศรษฐี · 5 ปริศนา · like = ความชอบต่อ Tier5/Tier6/SPECIAL
const ROSTER=[
 {id:'n_pen',name:'คุณป้าเพ็ญ',title:'นักสะสมทั่วไป',type:1,sprite:'bun',av:'👵',color:'#9bd17f',funds:[100000,300000],like:[1.0,.45,.15],aggr:.35,persona:'ใจดี ชอบการ์ดตำนาน เสนอราคาสุภาพ'},
 {id:'n_chai',name:'ลุงชัย',title:'นักสะสมทั่วไป',type:1,sprite:'coat',av:'👴',color:'#8fc3ff',funds:[120000,300000],like:[1.0,.5,.1],aggr:.5,persona:'ประหยัด เสนอทีละนิด แต่ไม่ยอมแพ้ง่าย'},
 {id:'n_mint',name:'น้องมิ้นท์',title:'แฟนการ์ดรุ่นใหม่',type:1,sprite:'pink',av:'👧',color:'#ff9fd0',funds:[100000,260000],like:[1.1,.6,.2],aggr:.7,persona:'ตื่นเต้นง่าย ชอบกดสู้ตอนท้าย'},
 {id:'n_wirat',name:'คุณวิรัช',title:'นักสะสมระดับสูง',type:2,sprite:'leo',av:'🧐',color:'#ffd35a',funds:[300000,1000000],like:[.8,1.0,.45],aggr:.6,persona:'เจ้าของแกลเลอรี พร้อมแข่งราคา'},
 {id:'n_phat',name:'ดร.ภัทร',title:'นักสะสมระดับสูง',type:2,sprite:'teal',av:'🎓',color:'#6fd6c8',funds:[350000,1000000],like:[.7,1.05,.5],aggr:.5,persona:'คำนวณมูลค่าแม่นยำ ถอนตัวเมื่อเกินประเมิน'},
 {id:'n_thana',name:'เจ้าสัวธนา',title:'เศรษฐีประจำเมือง',type:3,sprite:'fur',av:'🤵',color:'#ffb347',funds:[1000000,5000000],like:[.35,1.0,1.1],aggr:.8,persona:'ชอบ Mythic และ SPECIAL จริงจังเสมอ'},
 {id:'n_mani',name:'เศรษฐินีมณี',title:'เศรษฐีประจำเมือง',type:3,sprite:'chi',av:'💎',color:'#e58cff',funds:[1200000,4500000],like:[.3,.95,1.15],aggr:.75,persona:'เสนอราคากระโดดสูง ชอบข่มคู่แข่ง'},
 {id:'n_ekkarat',name:'มหาเศรษฐีเอกราช',title:'มหาเศรษฐีนักสะสม',type:4,sprite:'goth',av:'👑',color:'#ff5f5f',funds:[5000000,20000000],like:[.2,.6,1.4],aggr:.9,persona:'ต้องการ SPECIAL เป็นพิเศษ เสนอราคาสูงมาก'},
 {id:'n_mask',name:'ชายหน้ากากปริศนา',title:'นักสะสมปริศนา',type:5,sprite:'mei',av:'🎭',color:'#b69cff',funds:[2000000,9000000],like:[.15,.7,1.6],aggr:.85,persona:'ปรากฏตัวไม่แน่นอน ชอบ SPECIAL เหนือสิ่งอื่นใด'}];
const NPC_BY_ID={};ROSTER.forEach(n=>NPC_BY_ID[n.id]=n);
const BUYERS=['n_thana','n_ekkarat','n_mask','n_mani']; // นักสะสมที่เสนอซื้อ SPECIAL

/* ---------- State / Save ---------- */
function ST(){
 const c=G.state();if(!c)return null;
 if(!c.auction||typeof c.auction!=='object')c.auction={v:1};
 const a=c.auction;
 if(!a.events)a.events={};if(!Array.isArray(a.hist))a.hist=[];if(!a.collectors)a.collectors={};if(!a.offers)a.offers={};
 if(typeof a.lastDay!=='number')a.lastDay=0;if(!Array.isArray(a.notes))a.notes=[];
 return a;
}
let lastSave=0;
function persist(force){const t=Date.now();if(!force&&t-lastSave<1500)return;lastSave=t;try{if(root.save)root.save(1)}catch(e){}}
const money=()=>C.money();

/* ---------- ปฏิทิน ---------- */
const isEventDay=d=>d>0&&d%CFG.PERIOD===0;
const nextEventDay=d=>d%CFG.PERIOD===0&&d>0?d:(Math.floor(d/CFG.PERIOD)+1)*CFG.PERIOD;
function notice(day){
 if(isEventDay(day)){const ev=ST().events[day];return {kind:'today',day,done:!!(ev&&ev.status!=='open')}}
 if(isEventDay(day+1))return {kind:'tomorrow',day:day+1};
 return {kind:'later',day:nextEventDay(day),in:nextEventDay(day)-day};
}

/* ---------- สร้างรายการประมูล (สุ่มครั้งเดียว แล้วบันทึก — โหลดเซฟไม่สุ่มใหม่) ---------- */
function pickNpcs(hasSpecial,r){
 const by=t=>ROSTER.filter(n=>n.type===t);const pick=(arr,n)=>{const a=arr.slice(),o=[];while(a.length&&o.length<n)o.push(a.splice(Math.floor(r()*a.length),1)[0]);return o};
 let list=[...pick(by(1),2),...pick(by(2),r()<.6?2:1)];
 if(r()<(hasSpecial?.95:.6))list.push(...pick(by(3),hasSpecial&&r()<.6?2:1));
 if(r()<(hasSpecial?.95:.25))list.push(...pick(by(4),1));
 if(r()<(hasSpecial?.8:.3))list.push(...pick(by(5),1));
 return list.map(n=>({id:n.id,funds0:roundTo(rr(n.funds[0],n.funds[1],r),1000),funds:0})).map(p=>(p.funds=p.funds0,p));
}
function incFor(kind,cur){return kind==='SPECIAL'?Math.max(10000,Math.ceil(cur*.05/1000)*1000):1000}
function makeItem(card,kind,r){
 let start;
 if(kind==='SPECIAL'){start=roundTo(rr(card.startMin,card.startMax,r),1000);start=Math.min(card.startMax,Math.max(card.startMin,start))}
 else{const [lo,hi]=CFG.START[kind==='T5'?5:6];start=Math.min(hi,Math.max(lo,roundTo(rr(lo,hi,r),500)))}
 const est=kind==='SPECIAL'?card.value:CFG.EST[kind==='T5'?5:6];
 return {card:card.id,kind,start,est,minInc:incFor(kind,start),state:'wait',cur:0,top:null,topName:null,bids:[],clock:0,endClock:0,sched:{},res:{},wd:{},winner:null,final:0,result:null,settled:false};
}
function createEvent(day,rng){
 const r=rng||rnd;
 const sp=r()<CFG.SPECIAL_CHANCE,spSlot=sp?Math.floor(r()*3):-1;
 const used=new Set(),items=[];
 for(let slot=0;slot<3;slot++){
  let card,kind;
  if(slot===spSlot){const cs=specialCards();card=cs[Math.floor(r()*cs.length)];kind='SPECIAL'}
  else{
   for(let g=0;g<50;g++){
    const t=r()<CFG.T6_SHARE?6:5;
    const pool=C.CARDS.filter(c=>!c.special&&G.gt(c)===t&&!used.has(c.id));
    if(pool.length){card=pool[Math.floor(r()*pool.length)];kind=t===5?'T5':'T6';break}
   }
  }
  used.add(card.id);items.push(makeItem(card,kind,r));
 }
 const parts=pickNpcs(sp,r);
 // ความตั้งใจจ่ายสูงสุด (reservation) ของ NPC แต่ละคนต่อแต่ละล็อต — บันทึกไว้ในรายการ
 items.forEach(it=>{
  const tier=it.kind==='SPECIAL'?7:it.kind==='T5'?5:6,[lo,hi]=CFG.UP[tier];
  parts.forEach(p=>{
   const n=NPC_BY_ID[p.id],like=n.like[tier===5?0:tier===6?1:2];
   const f=.35+.65*like;                       // ชอบมาก → ยอมจ่ายมากขึ้น
   const u=lo+(hi-lo)*Math.pow(r(),1.6)*Math.min(1.25,f)+ (like>=1?.12*(hi-lo)*r():0);
   let res=it.start*(1+Math.max(0,u*(.7+.3*f)));
   res=roundTo(res,it.kind==='SPECIAL'?5000:500);
   if(like<.25&&tier<7)res=Math.min(res,it.start*1.1);  // ไม่สนใจ → แทบไม่สู้
   it.res[p.id]=Math.max(0,Math.min(res,p.funds0));     // ไม่เกินเงินทุนจริง
  });
 });
 return {day,status:'open',specialRolled:sp,specialSlot:spSlot,items,parts,joined:false,idx:0,created:Date.now()};
}
function ensureEvent(day,rng){
 if(!isEventDay(day))return null;const a=ST();if(!a)return null;
 if(!a.events[day]){a.events[day]=createEvent(day,rng);persist(true)}
 return a.events[day];
}
function currentEvent(day){const a=ST();return a&&isEventDay(day)?a.events[day]||null:null}

/* ---------- ดำเนินการประมูล (เวลาเสมือน) ---------- */
function required(it){return it.bids.length?it.cur+incFor(it.kind,it.cur):it.start}
function partOf(ev,id){return ev.parts.find(p=>p.id===id)}
function startItem(ev,i,rng){
 const r=rng||rnd,it=ev.items[i];if(!it||it.state!=='wait')return it;
 it.state='live';it.clock=0;it.endClock=CFG.DURATION;
 ev.parts.forEach(p=>{const n=NPC_BY_ID[p.id];it.sched[p.id]=Math.round(rr(900,6500,r)*(1.4-n.aggr*.6));
  if(r()<.28*n.aggr&&n.aggr>.6)it.sched[p.id]=Math.round(CFG.DURATION-rr(4000,9000,r))}); // นักล่าจังหวะท้าย
 return it;
}
function npcReact(n,r){return Math.round(rr(1300,4600,r)*(1.35-n.aggr*.65))}
function addBid(ev,it,who,amt){
 const t=it.clock;
 it.bids.push({who,amt,t});if(it.bids.length>60)it.bids.splice(0,it.bids.length-60);
 it.cur=amt;it.top=who;it.topName=who==='player'?'คุณ':NPC_BY_ID[who].name;
 if(it.endClock-t<=CFG.EXT_WINDOW){it.endClock+=CFG.EXT;it.ext=(it.ext||0)+1;it.extNow=true}
}
function npcAct(ev,it,p,r){
 const n=NPC_BY_ID[p.id],t=it.clock;
 if(it.wd[p.id]||it.top===p.id){it.sched[p.id]=t+npcReact(n,r);return null}
 const req=required(it),res=it.res[p.id]||0,limit=Math.min(res,p.funds);
 if(req>limit){it.wd[p.id]=1;it.sched[p.id]=1e12;return {type:'withdraw',who:p.id}}
 // เลือกขนาดการเพิ่ม: ปกติขั้นต่ำ บางครั้งกระโดด (ตามความดุของ NPC และความอยากได้)
 const inc=incFor(it.kind,it.cur||it.start),hot=Math.min(1,(limit-req)/Math.max(1,limit))*n.aggr;
 let k=1;const z=r();
 if(z<.18+.35*hot)k=2;if(z<.08+.2*hot)k=3+Math.floor(r()*3);if(z<.02+.07*n.aggr)k=6+Math.floor(r()*8);
 const unit=it.kind==='SPECIAL'?(req>=500000?10000:5000):500;
 let amt=roundTo(req+(k-1)*inc*(.7+.6*r()),unit);amt=Math.max(req,amt);
 if(amt>limit)amt=req;                       // ดันจนสุดงบ: เสนอขั้นต่ำเท่าที่ยังไหว
 if(amt>limit){it.wd[p.id]=1;it.sched[p.id]=1e12;return {type:'withdraw',who:p.id}}
 addBid(ev,it,p.id,amt);
 // นักประมูลคนอื่นรีบตอบโต้ → เกิดการสู้ราคากันต่อเนื่อง
 ev.parts.forEach(o=>{if(o.id!==p.id&&!it.wd[o.id]){const on=NPC_BY_ID[o.id];it.sched[o.id]=Math.min(it.sched[o.id]||1e12,t+Math.round(rr(500,2600,r)*(1.3-on.aggr*.5)))}});
 it.sched[p.id]=t+npcReact(n,r);
 return {type:'bid',who:p.id,amt};
}
/* เดินเวลาไป dtMs — คืนรายการเหตุการณ์ (bid/withdraw/end) สำหรับ UI */
function step(ev,it,dtMs,rng){
 const r=rng||rnd,evs=[];if(!it||it.state!=='live')return evs;
 const target=it.clock+dtMs;
 for(let guard=0;guard<500;guard++){
  let best=null,bt=1e13;
  ev.parts.forEach(p=>{const s=it.sched[p.id];if(s!=null&&s<bt&&!it.wd[p.id]){bt=s;best=p}});
  const horizon=Math.min(target,it.endClock);
  if(!best||bt>horizon)break;
  it.clock=Math.max(it.clock,bt);
  const e=npcAct(ev,it,best,r);if(e)evs.push(e);
 }
 it.clock=Math.min(target,Math.max(it.clock,Math.min(target,it.endClock)));
 if(it.clock>=it.endClock&&it.state==='live'){close(it);evs.push({type:'end'})}
 return evs;
}
function close(it){
 it.state='closed';
 if(it.top){it.winner=it.top;it.final=it.cur}else{it.winner=null;it.final=0}
}
/* ผู้เล่นเสนอราคา — ตรวจเงินจริง · ไม่หักเงินจนกว่าจะชนะ · กันกดซ้ำ */
function playerBid(ev,it,amount){
 if(!ev||!it||it.state!=='live'||it.clock>=it.endClock)return {ok:false,err:'หมดเวลาเสนอราคาแล้ว'};
 amount=Math.floor(+amount);if(!isFinite(amount)||amount<=0)return {ok:false,err:'จำนวนเงินไม่ถูกต้อง'};
 if(it.top==='player')return {ok:false,err:'คุณเป็นผู้เสนอราคาสูงสุดอยู่แล้ว'};
 const req=required(it);if(amount<req)return {ok:false,err:'ต้องเสนออย่างน้อย ฿'+req.toLocaleString()};
 if(amount>money())return {ok:false,err:'เงินไม่พอ (มี ฿'+Math.floor(money()).toLocaleString()+')'};
 ev.joined=true;addBid(ev,it,'player',amount);
 ev.parts.forEach(p=>{if(!it.wd[p.id]){const n=NPC_BY_ID[p.id];it.sched[p.id]=Math.min(it.sched[p.id]||1e12,it.clock+Math.round(rr(500,2400)*(1.3-n.aggr*.5)))}});
 persist(true);
 return {ok:true,amount,ext:!!it.extNow};
}
/* สรุปผลล็อต: ชำระเงิน/แจกการ์ด/ประวัติ ในธุรกรรมเดียว — เรียกซ้ำไม่ทำอะไร (it.settled) */
function settle(ev,it){
 if(!it||it.settled)return {ok:false,err:'สรุปผลไปแล้ว'};
 if(it.state==='live')return {ok:false,err:'ยังไม่จบ'};
 const a=ST(),card=C.CARD_BY_ID[it.card];
 it.settled=true;it.state='done';
 let res='unsold',winnerName=null,player=false;
 if(it.winner==='player'){
  if(money()>=it.final){
   C.addMoney(-it.final);
   const c=G.state(),e=c.coll[card.id];
   if(e){e.n++;e.last=Date.now()}else c.coll[card.id]={n:1,d:C.day(),ts:Date.now(),last:Date.now()};
   res='player';winnerName='คุณ';player=true;
  }else{res='forfeit';winnerName='คุณ (เงินไม่พอชำระ)'}
 }else if(it.winner){
  const p=partOf(ev,it.winner);p.funds=Math.max(0,p.funds-it.final);
  const col=a.collectors[it.winner]||(a.collectors[it.winner]={cards:[],spent:0});
  col.cards.push({card:card.id,final:it.final,day:ev.day,t:Date.now()});col.spent+=it.final;
  res='npc';winnerName=NPC_BY_ID[it.winner].name;
 }
 it.result=res;
 a.hist.push({day:ev.day,slot:ev.items.indexOf(it),card:card.id,kind:it.kind,start:it.start,final:res==='unsold'?0:it.final,winner:res==='unsold'?null:(res==='player'?'player':it.winner),winnerName,res,t:Date.now()});
 if(a.hist.length>CFG.HIST_MAX)a.hist.splice(0,a.hist.length-CFG.HIST_MAX);
 if(ev.items.every(x=>x.settled)){ev.status='done'}
 persist(true);
 return {ok:true,res,winnerName,final:it.final,player,card};
}
/* จำลองล็อตที่เหลือแบบไม่มีผู้เล่น (งานที่พลาด) */
function autoResolve(ev,rng){
 ev.items.forEach((it,i)=>{
  if(it.settled)return;
  if(it.state==='wait')startItem(ev,i,rng);
  let g=0;while(it.state==='live'&&g++<4000)step(ev,it,250,rng);
  if(it.state==='live')close(it);
  settle(ev,it);
 });
 ev.status='done';
}
/* เปลี่ยนวัน: สร้างงานวันงาน · งานที่ผ่านไปแล้วและผู้เล่นไม่ได้เข้า = พลาด (รอรอบถัดไป) */
function onDay(day,rng){
 const a=ST();if(!a)return null;
 Object.keys(a.events).forEach(k=>{const ev=a.events[k];
  if(ev.day<day&&ev.status==='open'){const hadJoin=ev.joined;autoResolve(ev,rng);ev.status='done';ev.missed=!hadJoin;
   a.notes.push({day,kind:ev.missed?'missed':'closed',eventDay:ev.day});if(a.notes.length>30)a.notes.shift()}});
 let ev=null;if(isEventDay(day))ev=ensureEvent(day,rng);
 const prev=a.lastDay;a.lastDay=day;
 persist(true);
 return {day,ev,notice:notice(day),changed:prev!==day};
}

/* ---------- ขาย SPECIAL ให้นักสะสม (ขั้นต่ำ 1,000,000 ต่อใบ) ---------- */
function offersFor(cardId,day){
 const a=ST(),card=C.CARD_BY_ID[cardId];if(!a||!card||!card.special)return [];
 const key=day+':'+cardId;
 if(!a.offers[key]){
  a.offers[key]=BUYERS.slice().sort(()=>rnd()-.5).slice(0,3).map(id=>{
   const n=NPC_BY_ID[id],fac=id==='n_mask'?rr(.95,1.45):id==='n_ekkarat'?rr(1.05,1.3):rr(.98,1.18);
   return {npc:id,price:Math.max(card.sellMin,CFG.SELL_MIN,roundTo(card.value*fac,10000)),used:false};
  });
  persist(false);
 }
 return a.offers[key];
}
function acceptOffer(cardId,day,idx,confirmLast){
 const a=ST(),c=G.state(),card=C.CARD_BY_ID[cardId],e=c&&c.coll[cardId];
 if(!card||!card.special)return {ok:false,err:'ไม่ใช่การ์ด SPECIAL'};
 if(!e||e.n<1)return {ok:false,err:'ไม่มีการ์ดใบนี้'};
 const offs=offersFor(cardId,day),o=offs[idx];if(!o)return {ok:false,err:'ไม่พบข้อเสนอ'};
 if(o.used)return {ok:false,err:'ข้อเสนอนี้ถูกใช้ไปแล้ว'};
 if(e.n===1&&!confirmLast)return {ok:false,err:'นี่คือการ์ดใบสุดท้ายของคุณ ต้องยืนยันก่อนขาย',needConfirm:true};
 o.used=true;e.n--;if(e.n<=0)delete c.coll[cardId];
 C.addMoney(o.price);
 a.hist.push({day,kind:'SELL',card:cardId,final:o.price,winner:'player',winnerName:'คุณ',buyer:o.npc,res:'sold',t:Date.now()});
 persist(true);
 return {ok:true,price:o.price,buyer:NPC_BY_ID[o.npc],left:e.n>0?e.n:0};
}

C.AUCTION={CFG,SPECIALS,ROSTER,NPC_BY_ID,BUYERS,isEventDay,nextEventDay,notice,ensureEvent,currentEvent,createEvent,startItem,step,required,incFor,
 playerBid,settle,autoResolve,onDay,offersFor,acceptOffer,state:ST,persist,specialCards};
})(typeof window!=='undefined'?window:globalThis);

