
/* ============================================================================
 * CARD SHOP — GACHA (Core): ตู้กาชาปอง 3 ตู้ · แพ็คการ์ด (Card Pool แยกกัน) · อัตราสุ่ม Tier 1–6
 *                          · การ์ดซ้ำ · NPC รับซื้อ (30%) · ประวัติ/Save
 * โหลดต่อจาก cs_core.js — ไม่แก้ระบบเดิม: เพิ่มการ์ด/Tier 6 เข้าฐานข้อมูลกลางเดิม
 * เพิ่มแพ็คใหม่ = เรียก CARDSHOP.GACHA.addPack({...}) โดยไม่ต้องแก้โค้ดระบบกาชาหลัก
 * ========================================================================== */
(function(root){
'use strict';
const C=root.CARDSHOP;if(!C)return;

/* ---------- Tier 6 + ตารางคงที่ ---------- */
C.TIERS[6]={n:6,name:'Mythic',th:'มิทิค',color:'#ff7bf0',glow:'#ff4fd8'};
const PRICE=1000;                                   // ราคาสุ่มต่อครั้ง
const ODDS=[55,25,12,6,1.8,0.2];                    // Tier1..6 = 100%
const VALUE={1:100,2:300,3:600,4:1000,5:10000,6:50000}; // มูลค่าพื้นฐานตาม Tier (Card Database กลาง)
const SELL_RATE=0.30;                               // NPC รับซื้อ 30%
const HIST_MAX=300;

/* ---------- การ์ดคอลเล็กชันใหม่ (6 ชุด × 6 ใบ) — ข้อมูลจากภาพการ์ดจริง ---------- */
// [ชื่อ, ATK, DEF, คำอธิบาย]  ลำดับ = Tier 1..6
const SETS=[
 {id:'rag1',name:'Record of Ragnarok',th:'มหาศึกคนชนเทพ',color:'#e0443c',cards:[
  ['อดัม (มนุษย์)',800,900,'นักสู้แห่งมนุษยชาติ ผู้สามารถลอกเลียนแบบท่วงท่าของเทพ'],
  ['ซาซากิ โคจิโร่ (มนุษย์)',1400,1300,'นักดาบผู้ก้าวข้ามขีดจำกัด ยิ่งต่อสู้ยิ่งเติบโต'],
  ['ธอร์ (เทพ)',2000,1900,'เทพแห่งสายฟ้า ผู้แข็งแกร่งที่สุดในนอร์ส'],
  ['โพไซดอน (เทพ)',2800,2600,'เทพแห่งมหาสมุทร ผู้สมบูรณ์แบบและเย็นชา'],
  ['พระพุทธเจ้า (เทพ)',3600,3400,'ผู้ฝึกกฎของสวรรค์ และเลือกยืนเคียงข้างมนุษย์'],
  ['ซุส (เทพ)',4800,4500,'ราชาแห่งเทพทั้งปวง ผู้เหนือกว่าทุกสิ่งบนสวรรค์']]},
 {id:'rag2',name:'Record of Ragnarok Vol.2',th:'มหาศึกคนชนเทพ Vol.2',color:'#ff8a3d',cards:[
  ['ลิโป้ เฟย (มนุษย์)',900,800,'ขุนศึกแห่งราชอาณาจักร ผู้แข็งแกร่งที่สุดในประวัติศาสตร์จีน'],
  ['แจ็ค เดอะริปเปอร์ (มนุษย์)',1500,1200,'อาชญากรผู้เลื่องชื่อ นักฆ่าแห่งกรุงลอนดอน'],
  ['ฉินสื่อหวง (มนุษย์)',2100,1800,'จักรพรรดิองค์แรกของจีน ผู้ไม่ยอมก้มหัวให้แก่ผู้ใด'],
  ['ฮาจุน (เทพ)',2900,2700,'เทพแห่งการทำลาย ผู้เกิดจากความเกลียดชังของมนุษย์'],
  ['บรุนฮิลด์ (วัลคีรี)',3700,3400,'วัลคีรีนำทางแห่งวาลฮัลลา ผู้จัดศึกคนชนเทพ'],
  ['พระศิวะ (เทพ)',4900,4600,'มหาเทพแห่งการทำลายและสร้างใหม่ เทพสูงสุดแห่งอินเดีย']]},
 {id:'tensei1',name:'Tensei Slime',th:'เกิดใหม่ทั้งทีก็เป็นสไลม์ไปแล้ว',color:'#4ab3ff',cards:[
  ['ชูนะ',800,900,'ฟื้นฟู HP ให้การ์ดฝ่ายเรา 1 ใบ +500'],
  ['ชิออน',1400,1300,'เมื่อโจมตี: มีโอกาส 30% เพิ่ม ATK +500 ในรอบนี้'],
  ['เบนิมารุ',2100,1900,'สร้างความเสียหายเพิ่ม +500 ให้การ์ดฝ่ายตรงข้าม 1 ใบ'],
  ['มิลิม นาวา',2800,2600,'เมื่อเริ่มรอบ: มีโอกาส 50% โจมตีเพิ่มอีก 1 ครั้ง'],
  ['ดียาโบล',3600,3400,'เมื่อคุณลงการ์ด: ลด DEF ฝ่ายตรงข้ามทั้งหมด -500 (1 รอบ)'],
  ['ริมุรุ เทมเพสต์',4800,4500,'ราชาแห่งมอนสเตอร์: เพิ่ม ATK และ DEF ของการ์ดฝ่ายเราทั้งหมด +1,000 จนจบการต่อสู้']]},
 {id:'tensei2',name:'Tensei Slime Vol.2',th:'เทมเพสต์ Vol.2 · กองกำลังเทมเพสต์',color:'#6f86ff',cards:[
  ['โกบุตะ',900,800,'เมื่อวางการ์ด: เพิ่ม ATK ของการ์ดฝ่ายเราอีก 200'],
  ['รังกะ',1500,1300,'เมื่ออยู่บนสนาม: เพิ่ม DEF ของการ์ดฝ่ายเรา +300'],
  ['โซเอ',2100,1900,'เมื่อโจมตี: มีโอกาส 30% ทำให้การ์ดฝ่ายตรงข้าม “มึนงง” ข้าม 1 รอบ'],
  ['ชูล่า',2800,2600,'เมื่อเริ่มรอบ: จั่วการ์ดเพิ่ม 1 ใบ และเพิ่ม ATK +300 ให้การ์ดที่วางใหม่'],
  ['เวลโดร่า เทมเพสต์',3700,3400,'เมื่อวางการ์ด: ทำลายการ์ดฝ่ายตรงข้าม 1 ใบ (ยกเว้น Tier 6)'],
  ['มิลริม นาวา',4800,4500,'เมื่ออยู่บนสนาม: การ์ดฝ่ายเราทั้งหมดได้รับ ATK +1,000 และไม่ถูกทำลายในรอบนี้']]},
 {id:'tumblr1',name:'TUMBLR world',th:'โลกสไลม์แสนสุข',color:'#8fd0ff',cards:[
  ['จูเรียส',800,900,'ฟื้นฟู HP ให้การ์ดฝ่ายเรา 1 ใบ +300'],
  ['สไลม์สีฟ้า (เพื่อนร่วมทาง)',1400,1300,'ฟื้นฟู: เพิ่ม DEF +500 ให้การ์ดฝ่ายเรา 1 ใบ'],
  ['เรน',2100,1900,'นักผจญภัย: เพิ่ม ATK +700 เมื่ออยู่ในสนาม'],
  ['เอลิเซ่',2800,2600,'พรแห่งธรรมชาติ: ฟื้นฟู HP ให้การ์ดฝ่ายเราทั้งหมด +800'],
  ['วูล์ฟเทม (อสูรผู้พิทักษ์)',3600,3400,'ผู้พิทักษ์: ลดความเสียหายที่ได้รับทั้งหมด -30% (1 รอบ)'],
  ['จูเรียส : ผู้เชื่อมโลก',4800,4500,'ผู้เชื่อมโลก: เพิ่ม ATK และ DEF ของการ์ดฝ่ายเราทั้งหมด +1,000 และฟื้นฟู HP +1,000']]},
 {id:'tumblr2',name:'TUMBLR world Version 2',th:'โลกสไลม์แสนสุข เวอร์ชัน 2',color:'#b69cff',cards:[
  ['จูเรียส',800,900,'ฟื้นฟู HP ให้การ์ดฝ่ายเรา 1 ใบ +300'],
  ['สไลม์สีฟ้า (เพื่อนร่วมทาง)',1400,1300,'ฟื้นฟู: เพิ่ม DEF +500 ให้การ์ดฝ่ายเรา 1 ใบ'],
  ['เรน',2100,1900,'นักผจญภัย: เพิ่ม ATK +700 เมื่ออยู่ในสนาม'],
  ['เอลิเซ่',2800,2600,'พรแห่งธรรมชาติ: ฟื้นฟู HP ให้การ์ดฝ่ายเราทั้งหมด +800'],
  ['วูล์ฟเทม (อสูรผู้พิทักษ์)',3600,3400,'ผู้พิทักษ์: ลดความเสียหายที่ได้รับทั้งหมด -30% (1 รอบ)'],
  ['จูเรียส : ผู้เชื่อมโลก',4800,4500,'ผู้เชื่อมโลก: เพิ่ม ATK และ DEF ของการ์ดฝ่ายเราทั้งหมด +1,000 และฟื้นฟู HP +1,000']]}
];
SETS.forEach(S=>{
 if(!C.FAC_BY_ID[S.id]){const f={id:S.id,name:S.name,th:S.th,color:S.color,gacha:true};C.FACTIONS.push(f);C.FAC_BY_ID[S.id]=f}
 S.cards.forEach((r,i)=>{
  const id=S.id+'_'+i;if(C.CARD_BY_ID[id])return;
  const tier=i+1;
  const card={id,fac:S.id,idx:i,name:r[0],grade:Math.min(5,tier-1),power:r[1],atk:r[1],def:r[2],skill:r[3],tier,gacha:true,por:true};
  C.CARDS.push(card);C.CARD_BY_ID[id]=card;
 });
});

/* ---------- Tier ของระบบกาชา (gt) ----------
 * การ์ดคอลเล็กชันใหม่: gt = Tier บนการ์ด (1–6)
 * การ์ดพื้นฐานเดิม 36 ใบ (ใช้ Tier 1–5 กับชั้นวางเดิม): ไม่แตะ card.tier เดิม — เรียงลำดับในเผ่าตาม Grade/พลัง
 * (ต่ำ→สูง) แล้วให้ gt = 1..6 เพื่อให้ทุกแพ็คมีครบ 6 Tier ตามอัตราสุ่มและมูลค่ากลาง (กันแพ็คที่การ์ดทุกใบเป็น Tier สูง = ขายทำกำไรได้) */
C.FACTIONS.filter(f=>!f.gacha).forEach(f=>{
 C.CARDS.filter(c=>c.fac===f.id).sort((a,b)=>a.grade-b.grade||a.power-b.power||b.idx-a.idx).forEach((c,i)=>{c.gt=Math.min(6,i+1)});
});
C.CARDS.forEach(c=>{if(!c.gt)c.gt=c.tier});
const gt=c=>(c&&(c.gt||c.tier))||1;

/* ---------- มูลค่า / ราคารับซื้อ (อ่านจาก Card Database กลาง — ปรับรายใบได้ด้วยฟิลด์ value) ---------- */
function valueOf(card){card=typeof card==='string'?C.CARD_BY_ID[card]:card;if(!card)return 0;return card.value!=null?card.value:(VALUE[gt(card)]||0)}
function buyPrice(card){return Math.round(valueOf(card)*SELL_RATE)}

/* ---------- แพ็ค/ตู้ (Registry — เพิ่มได้โดยไม่แก้ระบบหลัก) ---------- */
const MACHINES=[];const MACH_BY_ID={};
const GPACKS=[];const GP_BY_ID={};
function addMachine(m){if(MACH_BY_ID[m.id])return MACH_BY_ID[m.id];m.packs=m.packs||[];MACHINES.push(m);MACH_BY_ID[m.id]=m;return m}
function addPack(p){
 if(GP_BY_ID[p.id])return GP_BY_ID[p.id];
 p.price=p.price||PRICE;GPACKS.push(p);GP_BY_ID[p.id]=p;
 const m=MACH_BY_ID[p.machine];if(m&&m.packs.indexOf(p.id)<0)m.packs.push(p.id);
 return p;
}
addMachine({id:'lucky',name:'Lucky Star',th:'ตู้นำโชค',color:'#ff5a5a',img:'lucky',desc:'แพ็คการ์ดทั่วไปและคอลเลกชันพิเศษ',knob:[.61,.78],chute:[.36,.88]});
addMachine({id:'celestial',name:'Celestial',th:'ตู้เทพสวรรค์',color:'#5fb4ff',img:'celestial',desc:'แพ็คการ์ดเทพและแฟนตาซี',knob:[.5,.76],chute:[.5,.9]});
addMachine({id:'dragon',name:'Dark Dragon',th:'ตู้มังกรราตรี',color:'#b36bff',img:'dragon',desc:'แพ็คการ์ดระดับสูงและคอลเลกชันพิเศษ',knob:[.52,.76],chute:[.5,.9]});
// pool = รายชื่อ faction ที่เป็น Card Pool ของแพ็คนั้น (สุ่มเฉพาะในนี้ ไม่ข้ามแพ็ค)
addPack({id:'tumblr1',machine:'lucky',name:'TUMBLR WORLD',th:'โลกสไลม์แสนสุข',pool:['tumblr1'],img:'tumblr1',color:'#8fd0ff'});
addPack({id:'tumblr2',machine:'lucky',name:'TUMBLR WORLD VERSION 2',th:'โลกสไลม์แสนสุข เวอร์ชัน 2',pool:['tumblr2'],img:'tumblr2',color:'#b69cff'});
addPack({id:'tensei1',machine:'lucky',name:'TENSEI SLIME',th:'เกิดใหม่ทั้งทีก็เป็นสไลม์ไปแล้ว',pool:['tensei1'],img:'tensei1',color:'#4ab3ff'});
addPack({id:'tensei2',machine:'lucky',name:'TENSEI SLIME VOL.2',th:'กองกำลังเทมเพสต์',pool:['tensei2'],img:'tensei2',color:'#6f86ff'});
addPack({id:'paladin',machine:'lucky',name:'ROYAL PALADIN',th:'รอยัลพาลาดิน',pool:['paladin'],img:null,color:'#5b8cff'});
addPack({id:'wolf',machine:'lucky',name:'WOLF KINGDOM',th:'อาณาจักรหมาป่า',pool:[],img:null,color:'#9fb0c8',soon:true});
addPack({id:'rag1',machine:'celestial',name:'RECORD OF RAGNAROK',th:'มหาศึกคนชนเทพ',pool:['rag1'],img:'rag1',color:'#e0443c'});
addPack({id:'rag2',machine:'celestial',name:'RECORD OF RAGNAROK VOL.2',th:'มหาศึกคนชนเทพ Vol.2',pool:['rag2'],img:null,color:'#ff8a3d'});
addPack({id:'olympus',machine:'celestial',name:'OLYMPUS DIVINITY',th:'คณะเทพสวรรค์',pool:['celestial'],img:null,color:'#ffd86b'});
addPack({id:'isekai',machine:'celestial',name:'ISEKAI LEGEND',th:'ต่างโลก',pool:['isekai'],img:null,color:'#c9b6ff'});
addPack({id:'darklord',machine:'dragon',name:'DARKLORD',th:'ดาร์คอิริกูลาร์ส',pool:['dark'],img:null,color:'#a455ff'});
addPack({id:'dragon',machine:'dragon',name:'DRAGON EMPIRE',th:'เผ่ามังกรเพลิง',pool:['dragon'],img:null,color:'#ff5b3d'});
addPack({id:'ocean',machine:'dragon',name:'OCEAN KINGDOM',th:'อาณาจักรใต้สมุทร',pool:['ocean'],img:null,color:'#3dd6ff'});

function poolOf(p){const set={};(p.pool||[]).forEach(f=>set[f]=1);return C.CARDS.filter(c=>set[c.fac])}
/* อัตราสุ่มของแพ็ค: ใช้อัตราพื้นฐาน 55/25/12/6/1.8/0.2 ตาม Tier; ถ้าแพ็คไม่มีการ์ดใน Tier ไหน จะกระจายอัตราของ Tier นั้นให้ Tier ที่มี (สัดส่วนเดิม) และแสดงให้ผู้เล่นเห็น */
function oddsOf(p){
 const pool=poolOf(p),cnt=[0,0,0,0,0,0,0];pool.forEach(c=>cnt[gt(c)]++);
 let tot=0;for(let t=1;t<=6;t++)if(cnt[t])tot+=ODDS[t-1];
 const rows=[];for(let t=1;t<=6;t++)rows.push({tier:t,base:ODDS[t-1],n:cnt[t],pct:cnt[t]&&tot?ODDS[t-1]/tot*100:0});
 return {rows,total:pool.length,exact:rows.every(r=>r.n>0)};
}
function rollGacha(p,rng){
 rng=rng||C.rnd01;const pool=poolOf(p);if(!pool.length)return null;
 const o=oddsOf(p);let r=rng()*100,acc=0,tier=0;
 for(const row of o.rows){if(!row.n)continue;acc+=row.pct;tier=row.tier;if(r<acc)break}
 const list=pool.filter(c=>gt(c)===tier);
 return list[Math.min(list.length-1,Math.floor(rng()*list.length))];
}

/* ---------- State ---------- */
function G(){
 const c=C.state();if(!c)return null;
 if(!c.gp||typeof c.gp!=='object')c.gp={};
 if(!Array.isArray(c.hist))c.hist=[];
 if(!Array.isArray(c.sales))c.sales=[];
 if(!Array.isArray(c.rare))c.rare=[];
 if(typeof c.sold!=='number')c.sold=0;
 return c;
}
const own=id=>C.own(id);
const now=()=>Date.now();
function saveNow(){try{if(root.save)root.save(1)}catch(e){}}
let lock=false;

/* ซื้อ/สุ่ม: ตรวจเงิน→หักเงิน→สุ่ม→ลง Collection→บันทึก→ตั้ง pending ในขั้นตอนเดียว (ปุ่มกดซ้ำ/โหลดเซฟไม่ทำให้สุ่มซ้ำหรือหักซ้ำ) */
function buy(packId,rng){
 const c=G(),p=GP_BY_ID[packId];
 if(!c||!p)return {ok:false,err:'ไม่พบแพ็คนี้'};
 if(p.soon||!poolOf(p).length)return {ok:false,err:'แพ็คนี้ยังไม่มีการ์ด'};
 if(lock)return {ok:false,err:'กำลังสุ่มอยู่'};
 if(c.pending)return {ok:false,err:'ยังมีการ์ดที่สุ่มได้แต่ยังไม่ได้เลือก KEEP / SELL',pending:true};
 if(c.battle&&c.battle.active)return {ok:false,err:'กำลังอยู่ในการแข่งขัน'};
 if(C.money()<p.price)return {ok:false,err:'เงินไม่พอ (ต้องการ ฿'+p.price.toLocaleString()+')'};
 lock=true;
 try{
  const card=rollGacha(p,rng);if(!card)return {ok:false,err:'ไม่พบการ์ดในแพ็ค'};
  C.addMoney(-p.price);
  const e=c.coll[card.id],isNew=!e;
  if(e){e.n++;e.last=now()}else c.coll[card.id]={n:1,d:(C.day&&C.day())||1,ts:now(),last:now()};
  c.stats.packs++;c.stats.spent+=p.price;
  c.gp[p.id]=(c.gp[p.id]||0)+1;
  c.hist.push({t:now(),pack:p.id,card:card.id,tier:gt(card),price:p.price});if(c.hist.length>HIST_MAX)c.hist.splice(0,c.hist.length-HIST_MAX);
  if(gt(card)>=5)c.rare.push({t:now(),card:card.id,pack:p.id,tier:gt(card)});
  c.pending={card:card.id,pack:p.id,src:'gacha',machine:p.machine,isNew,count:c.coll[card.id].n};
  saveNow();
  return {ok:true,card,isNew,count:c.coll[card.id].n,pack:p};
 }finally{lock=false}
}
function pending(){
 const c=G();if(!c||!c.pending||c.pending.src!=='gacha')return null;
 const card=C.CARD_BY_ID[c.pending.card],pack=GP_BY_ID[c.pending.pack];if(!card)return null;
 const n=own(card.id);
 return {card,pack,isNew:!!c.pending.isNew,count:n,dup:n>=2&&!c.pending.isNew,machine:c.pending.machine||(pack&&pack.machine)};
}
/* ขาย: ต้องเหลือการ์ดอย่างน้อย 1 ใบต่อชนิดเสมอ · อัปเดตเงิน+จำนวนทันที · บันทึกในขั้นตอนเดียว */
function sell(cardId,qty){
 const c=G();if(!c)return {ok:false,err:'ไม่มีข้อมูลเซฟ'};
 const card=C.CARD_BY_ID[cardId],e=c.coll[cardId];
 if(!card||!e)return {ok:false,err:'ไม่มีการ์ดใบนี้'};
 if(card.special)return {ok:false,err:'การ์ด SPECIAL ขายผ่านนักสะสมพิเศษในงานประมูลเท่านั้น'};
 const sellable=e.n-1;if(sellable<1)return {ok:false,err:'ต้องเก็บการ์ดอย่างน้อย 1 ใบไว้ใน Collection'};
 qty=Math.min(Math.max(1,Math.floor(qty||1)),sellable);
 const amt=buyPrice(card)*qty;
 e.n-=qty;
 C.addMoney(amt);
 c.sold+=amt;c.sales.push({t:now(),card:cardId,qty,amt});if(c.sales.length>HIST_MAX)c.sales.splice(0,c.sales.length-HIST_MAX);
 saveNow();
 return {ok:true,card,qty,amt,left:e.n};
}
function dupList(){
 const c=G();if(!c)return [];
 return Object.keys(c.coll).map(id=>{const card=C.CARD_BY_ID[id],n=c.coll[id].n;return card&&!card.special&&n>1?{card,n,sellable:n-1,value:valueOf(card),price:buyPrice(card)}:null}).filter(Boolean)
  .sort((a,b)=>gt(b.card)-gt(a.card)||a.card.id.localeCompare(b.card.id));
}
function sellAll(){
 const list=dupList();if(!list.length)return {ok:false,err:'ไม่มีการ์ดซ้ำให้ขาย'};
 let amt=0,cnt=0;
 list.forEach(d=>{const r=sell(d.card.id,d.sellable);if(r.ok){amt+=r.amt;cnt+=r.qty}});
 return {ok:true,amt,cnt};
}
/* ตัดสินใจกับการ์ดที่เพิ่งสุ่มได้: keep | sell — ล้าง pending ก่อนเสมอ ปุ่มกดซ้ำจึงไม่ขายซ้ำ */
function resolve(action){
 const c=G();if(!c||!c.pending||c.pending.src!=='gacha')return {ok:false,err:'ไม่มีรายการรอเลือก'};
 const cardId=c.pending.card;
 if(action==='sell'){
  if(own(cardId)<2)return {ok:false,err:'การ์ดใบนี้ไม่ซ้ำ ขายไม่ได้'};
  c.pending=null;
  const r=sell(cardId,1);if(!r.ok){saveNow();return r}
  return Object.assign({ok:true,action:'sell'},r);
 }
 c.pending=null;saveNow();return {ok:true,action:'keep'};
}
function summary(){
 const c=G();if(!c)return null;
 return {pulls:Object.values(c.gp).reduce((a,b)=>a+b,0),gp:c.gp,hist:c.hist,sales:c.sales,rare:c.rare,sold:c.sold};
}

C.GACHA={gt,PRICE,ODDS,VALUE,SELL_RATE,SETS,MACHINES,MACH_BY_ID,GPACKS,GP_BY_ID,addPack,addMachine,poolOf,oddsOf,rollGacha,valueOf,buyPrice,
 buy,pending,sell,sellAll,dupList,resolve,summary,state:G};
})(typeof window!=='undefined'?window:globalThis);

