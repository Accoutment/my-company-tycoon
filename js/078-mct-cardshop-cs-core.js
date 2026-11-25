
/* ============================================================================
 * MY COMPANY TYCOON · CARD SHOP — CORE (ข้อมูล · สุ่มซอง · Collection · Save · กติกา Battle · AI)
 * ไม่ยุ่งกับ DOM/Canvas — ทดสอบแยกได้ · ใช้ได้ทั้งในเกมและใน Node
 * ========================================================================== */
(function(root){
'use strict';

/* ---------- ข้อมูลพื้นฐาน ---------- */
const FACTIONS=[
 {id:'paladin',name:'Royal Paladin',th:'รอยัลพาลาดิน',color:'#5b8cff'},
 {id:'dark',name:'Dark Irregulars',th:'ดาร์คอิริกูลาร์ส',color:'#a455ff'},
 {id:'celestial',name:'Celestial Divinity',th:'คณะเทพสวรรค์',color:'#ffd86b'},
 {id:'dragon',name:'Dragon Empire',th:'เผ่ามังกรเพลิง',color:'#ff5b3d'},
 {id:'ocean',name:'Ocean Kingdom',th:'อาณาจักรใต้สมุทร',color:'#3dd6ff'},
 {id:'isekai',name:'Isekai Legend',th:'ต่างโลก',color:'#c9b6ff'}
];
const TIERS=[null,
 {n:1,name:'Common',th:'ทั่วไป',color:'#c3cad6',glow:'#8a93a6'},
 {n:2,name:'Uncommon',th:'ไม่ธรรมดา',color:'#7be07b',glow:'#3fae3f'},
 {n:3,name:'Rare',th:'หายาก',color:'#5fb4ff',glow:'#2f7fe0'},
 {n:4,name:'Epic',th:'เอปิก',color:'#c67bff',glow:'#8e3fe0'},
 {n:5,name:'Legendary',th:'ตำนาน',color:'#ffd35a',glow:'#ff9d1a'}];
const BASE_ODDS=[60,25,10,4,1]; // Tier1..5 = 100%

// [ชื่อ, grade, power, skill สั้น] — เรียงตามภาพชีต (ซ้าย→ขวา, บน→ล่าง)
const RAW={
 isekai:[
  ['จอมราชันย์ต่างโลก อัลเทอเรียส',5,15000,'ยูนิตต่างโลกทุกใบได้พลัง +10000 และครีติคอล +1'],
  ['เทพธิดาแห่งต่างโลก ลูมิเนีย',5,15000,'ลงสนามแล้วฟื้นฟูแต้มเสียหาย 1 ใบ จั่วการ์ด 2 ใบ'],
  ['มังกรจักรวาล ต่างโลก ออร์พาโนม',5,15000,'ยูนิตนี้ได้พลัง +10000 · เรียกยูนิตเกรด 3 ลงสนาม'],
  ['จอมมารแห่งต่างโลก เวลสการ์เล็ต',5,15000,'เมื่อโจมตี เลือกการ์ดจากโซนดรอป 2 ใบน่าขึ้นมือ'],
  ['นักปราชญ์ข้ามมิติ โครนอส',5,15000,'ทุกครั้งที่จั่วการ์ด ยูนิตได้พลัง +5000 จนจบเทิร์น'],
  ['เทพอสูรศักดิ์สิทธิ์ เอเรออน',5,15000,'หยุดยูนิตของคู่แข่งทั้งหมด · โจมตี Vanguard ได้แม้ถูกหยุด']],
 dragon:[
  ['มังกรจักรพรรดิ์เพลิง ดราโกนีอัส',3,13000,'ยูนิตเกรด 3 ได้พลัง +5000 · จ่าย 1 ได้ครีติคอล +1'],
  ['มังกรเพลิงพิทักษ์ บลาซวิง',2,10000,'เมื่อโจมตี ถ้า Vanguard เกรด 3+ ได้พลัง +5000'],
  ['มังกรเพลิงผู้สื่อสาร ฟลาร์',1,8000,'ถูกเรียกลงสนามจากมือ จั่วการ์ด 1 ใบแล้วทิ้ง 1 ใบ'],
  ['มังกรเพลิงรุ่นเยาว์ อิกนิส',0,4000,'(Critical Trigger) ครีติคอล +1'],
  ['มังกรศักดิ์สิทธิ์ ฮีลเลีย',0,4000,'(Heal Trigger) ฟื้นฟูแต้มเสียหาย 1 ใบ'],
  ['มังกรนำโชค เรดเมล',0,4000,'(Draw Trigger) จั่วการ์ด 1 ใบ']],
 celestial:[
  ['มหาเทพสุริยัน อาโพโลเนียส',3,13000,'ยูนิตเกรด 3 ขึ้นไปได้พลัง +5000 · จ่าย 1 ได้ครีติคอล +1'],
  ['เทวทูตแห่งแสง เซราฟีล',2,10000,'ลงสนามจากมือ เลือกยูนิต 1 ใบ ได้พลัง +5000'],
  ['นักบวชแห่งสวรรค์ อีรีออน',1,8000,'ถูกเรียกลงสนาม ดูการ์ดบนสุดของเด็ค 1 ใบ'],
  ['กริฟฟอนเทพศักดิ์สิทธิ์ ไลออน',0,4000,'(Critical Trigger) ครีติคอล +1'],
  ['เทพธิดาแห่งการเยียวยา มิราเอล',0,4000,'(Heal Trigger) ฟื้นฟูแต้มเสียหาย 1 ใบ'],
  ['นกสื่อสารแห่งทวยเทพ ลูเมน',0,4000,'(Draw Trigger) จั่วการ์ด 1 ใบ']],
 paladin:[
  ['อัศวินมังกรศักดิ์สิทธิ์ อัลเดรอส',3,13000,'ยูนิตหน้าแถวได้พลัง +5000 · จ่าย 1 ได้ครีติคอล +1'],
  ['อัศวินโล่ศักดิ์สิทธิ์ เลน่า',2,10000,'ลงสนามจากมือ เลือกยูนิต 1 ใบ ได้พลัง +5000'],
  ['นักปราชญ์ศักดิ์สิทธิ์ เฟลิกซ์',1,8000,'เมื่อสนับสนุน (Boost) ยูนิตที่ถูกสนับสนุนได้พลัง +5000'],
  ['มังกรศักดิ์สิทธิ์ รุ่นเยาว์',0,4000,'(Trigger Unit) ครีติคอล +1'],
  ['นางฟ้าบรรเทา อาเรีย',0,4000,'(Heal Trigger) ฟื้นฟูแต้มเสียหาย 1 ใบ'],
  ['ฮูกส่งสารศักดิ์สิทธิ์ นีโอ',0,4000,'(Draw Trigger) จั่วการ์ด 1 ใบ']],
 ocean:[
  ['ราชาแห่งมหาสมุทร โพไซตอนเทียส',4,14000,'ได้พลัง +5000 ต่อ "ยูนิตใต้น้ำ" ในสนาม (สูงสุด +20000)'],
  ['องค์หญิงเงือกแห่งวารี เซเรเมีย',4,13000,'ลงสนาม เลือกยูนิตใต้น้ำ 2 ใบ น่าขึ้นมือ 1 ใบ'],
  ['อัศวินวาฬผู้พิทักษ์ อควารีส',4,12000,'เมื่อโจมตี Vanguard ถ้ามียูนิตใต้น้ำ 3 ใบ ได้ครีติคอล +1'],
  ['มังกรทะเลลึก สีวาเทียส',4,13000,'ยูนิตใต้น้ำทั้งหมดได้พลัง +5000 ในเทิร์นของคุณ'],
  ['นักบวชแมงกะพรุนแห่งแสงลึก ออเรเลีย',4,12000,'ลงสนามแล้วฟื้นฟูแต้มเสียหาย 1 ใบ'],
  ['วาฬโบราณแห่งมหาสมุทร เอไลออน',4,14000,'ถูกเรียกลงสนามจากมือ จั่ว 1 ใบ ให้ยูนิตได้พลัง +10000']],
 dark:[
  ['จอมปีศาจแห่งราตรี วาเลนธอร์น',3,13000,'ยูนิตหน้าแถวได้พลัง +5000 · จ่าย 1 ได้ครีติคอล +1'],
  ['แม่มดปีศาจ ลิเลีย',2,10000,'เมื่อโจมตี ถ้าโซลมี 5 ใบขึ้นไป ได้พลัง +5000'],
  ['พ่อบ้านปีศาจ เซลอส',1,8000,'ถูกเรียกลงสนาม เลือกการ์ดจากโซล 1 ใบ น่าขึ้นมือ'],
  ['สุนัขยมโลก เฮลฮาวด์',0,4000,'(Critical Trigger) ครีติคอล +1'],
  ['ซัคคิวบัสแห่งมายา เอลิเซ่',0,4000,'(Heal Trigger) ฟื้นฟูแต้มเสียหาย 1 ใบ'],
  ['วิญญาณหลงทาง เรเวน',0,4000,'(Draw Trigger) จั่วการ์ด 1 ใบ']]
};
// Tier ต่อใบ (ตามลำดับ RAW) — Grade0=Common · G1=Uncommon · G2=Rare · G3 และ Ocean ค่าพลัง ≤13000=Epic · Ocean 14000 และ Isekai G5=Legendary
function tierOf(fac,i,g,pw){
 if(g===0)return 1; if(g===1)return 2; if(g===2)return 3; if(g===3)return 4;
 if(g===4)return pw>=14000?5:4; return 5;
}
const CARDS=[];
FACTIONS.forEach(f=>RAW[f.id].forEach((r,i)=>{
 CARDS.push({id:f.id+'_'+i,fac:f.id,idx:i,name:r[0],grade:r[1],power:r[2],skill:r[3],tier:tierOf(f.id,i,r[1],r[2])});
}));
const CARD_BY_ID={};CARDS.forEach(c=>CARD_BY_ID[c.id]=c);
const FAC_BY_ID={};FACTIONS.forEach(f=>FAC_BY_ID[f.id]=f);

/* ---------- ซองการ์ด ---------- */
const PACKS=[
 {id:'std',name:'ซองการ์ดทั่วไป',en:'Standard Pack',price:500,odds:[60,25,10,4,1],color:'#8fa3c4',desc:'โอกาสพื้นฐาน Tier 1–5'},
 {id:'rare',name:'ซองการ์ด Rare',en:'Rare Pack',price:1500,odds:[0,0,70,24,6],color:'#4aa3ff',desc:'การันตี Tier 3 ขึ้นไป'},
 {id:'epic',name:'ซองการ์ด Epic',en:'Epic Pack',price:4000,odds:[0,0,0,85,15],color:'#b968ff',desc:'การันตี Tier 4 ขึ้นไป'},
 {id:'legend',name:'ซองการ์ด Legendary',en:'Legendary Pack',price:10000,odds:[0,0,0,55,45],color:'#ffc93d',desc:'การันตี Tier 4 · โอกาส Tier 5 สูง'},
 {id:'mythic',name:'ซองการ์ด Mythic',en:'Mythic Pack',price:30000,odds:[0,0,0,0,100],color:'#ff4fd8',desc:'การันตี Tier 5 เฉพาะ Grade 5 (Isekai Legend)',gradeOnly:5}
];
const PACK_BY_ID={};PACKS.forEach(p=>PACK_BY_ID[p.id]=p);

function rnd01(){ // crypto ถ้ามี
 try{if(root.crypto&&root.crypto.getRandomValues){const a=new Uint32Array(1);root.crypto.getRandomValues(a);return a[0]/4294967296}}catch(e){}
 return Math.random();
}
function pickTier(odds,r){let s=0;const tot=odds.reduce((a,b)=>a+b,0);r*=tot;for(let i=0;i<odds.length;i++){s+=odds[i];if(r<s&&odds[i]>0)return i+1}for(let i=odds.length-1;i>=0;i--)if(odds[i]>0)return i+1;return 1}
function rollCard(packId,rng){
 rng=rng||rnd01;const p=PACK_BY_ID[packId]||PACK_BY_ID.std;
 const tier=pickTier(p.odds,rng());
 let pool=CARDS.filter(c=>c.tier===tier&&!c.gacha); /* [GACHA] ชั้นวางเดิมสุ่มเฉพาะ 36 ใบพื้นฐาน */
 if(p.gradeOnly)pool=pool.filter(c=>c.grade===p.gradeOnly);
 if(!pool.length)pool=CARDS.filter(c=>c.tier===tier&&!c.gacha); // กันพลาด: ต้องเป็นการ์ดในฐานข้อมูลเสมอ
 return pool[Math.min(pool.length-1,Math.floor(rng()*pool.length))];
}

/* ---------- Save / State ---------- */
const NPCS=[
 {id:'n1',name:'Shadow Novice',th:'เงาผู้เริ่มต้น',diff:'beginner',label:'Beginner',winTarget:40,maxBet:1000,tau:3.2,extra:-1,rp:10,color:'#8b6cff'},
 {id:'n2',name:'Shadow Duelist',th:'เงานักดวล',diff:'normal',label:'Normal',winTarget:50,maxBet:5000,tau:1.2,extra:0,rp:18,color:'#a45cff'},
 {id:'n3',name:'Shadow Tactician',th:'เงานักวางแผน',diff:'advanced',label:'Advanced',winTarget:60,maxBet:10000,tau:1.2,extra:1,blunder:.3,rp:28,color:'#c24bff'},
 {id:'n4',name:'Shadow Sovereign',th:'เงาจอมราชัน',diff:'expert',label:'Expert',winTarget:70,maxBet:10000,tau:.3,extra:2,rp:40,color:'#ff3dd8'}
];
const BETS=[500,1000,5000,10000];
const RANKS=[[0,'Bronze'],[60,'Silver'],[180,'Gold'],[400,'Platinum'],[800,'Diamond'],[1500,'Master']];
function rankName(rp){let r=RANKS[0][1];for(const x of RANKS)if(rp>=x[0])r=x[1];return r}
function rankNext(rp){for(const x of RANKS)if(rp<x[0])return x;return null}

let ENV={getS:()=>root.S,save:()=>{try{root.save&&root.save(1)}catch(e){}},now:()=>Date.now(),day:()=>{try{return root.S&&root.S.day||1}catch(e){return 1}}};
function setEnv(e){Object.assign(ENV,e||{})}
function CS(){
 const S=ENV.getS();if(!S)return null;
 let c=S.cardshop;
 if(!c||typeof c!=='object'){c=S.cardshop={v:1}}
 if(!c.coll||typeof c.coll!=='object')c.coll={};
 if(!c.stats||typeof c.stats!=='object')c.stats={};
 const st=c.stats;['games','w','l','d','streak','best','net','packs','spent'].forEach(k=>{if(typeof st[k]!=='number'||!isFinite(st[k]))st[k]=0});
 if(typeof c.rp!=='number')c.rp=0;
 if(typeof c.v!=='number')c.v=1;
 if(c.pending&&!CARD_BY_ID[c.pending.card])c.pending=null;
 // ล้างการ์ดที่ไม่มีใน Database (กันข้อมูลเสีย)
 Object.keys(c.coll).forEach(k=>{if(!CARD_BY_ID[k]||!(c.coll[k].n>0))delete c.coll[k]});
 return c;
}
const own=id=>{const c=CS();return c&&c.coll[id]?c.coll[id].n:0};
function completion(){const c=CS();if(!c)return {have:0,total:CARDS.length,pct:0};const have=Object.keys(c.coll).length;return {have,total:CARDS.length,pct:Math.floor(have/CARDS.length*1000)/10}}
function money(){const S=ENV.getS();return S&&typeof S.money==='number'?S.money:0}
function addMoney(v){const S=ENV.getS();S.money=Math.round((S.money||0)+v)}

let packLock=false;
/* ซื้อซอง: หักเงิน + สุ่ม + บันทึกลง Collection + Save ในขั้นตอนเดียว (atomic) — อนิเมชันเปิดซองแค่ “แสดงผล” ที่สุ่มไว้แล้ว */
function buyPack(packId,rng){
 const c=CS(),p=PACK_BY_ID[packId];
 if(!c||!p)return {ok:false,err:'ไม่พบซองนี้'};
 if(packLock)return {ok:false,err:'กำลังเปิดซองอยู่'};
 if(c.pending)return {ok:false,err:'ยังมีซองที่ยังไม่ได้เปิด',pending:true};
 if(c.battle&&c.battle.active)return {ok:false,err:'กำลังอยู่ในการแข่งขัน'};
 if(money()<p.price)return {ok:false,err:'เงินไม่พอ (ต้องการ '+p.price.toLocaleString()+')'};
 packLock=true;
 try{
  addMoney(-p.price);
  const card=rollCard(packId,rng);
  const e=c.coll[card.id];const isNew=!e;
  if(e){e.n++;e.last=ENV.now()}else c.coll[card.id]={n:1,d:ENV.day(),ts:ENV.now(),last:ENV.now()};
  c.stats.packs++;c.stats.spent+=p.price;
  c.pending={card:card.id,pack:packId,isNew,count:c.coll[card.id].n};
  ENV.save();
  return {ok:true,card,isNew,count:c.coll[card.id].n,pack:p};
 }finally{packLock=false}
}
function pendingReveal(){const c=CS();return c&&c.pending&&c.pending.src!=='gacha'?{card:CARD_BY_ID[c.pending.card],pack:PACK_BY_ID[c.pending.pack]||PACKS[0],isNew:!!c.pending.isNew,count:c.pending.count||own(c.pending.card)}:null}
function clearPending(){const c=CS();if(c&&c.pending){c.pending=null;ENV.save()}}

/* ---------- BATTLE ENGINE ---------- */
// ประเภท: atk โจมตี · def ป้องกัน · sup สนับสนุน · spc พิเศษ
const BTYPES={atk:{name:'Attack',th:'โจมตี',icon:'⚔️',color:'#ff6b57'},def:{name:'Defense',th:'ป้องกัน',icon:'🛡️',color:'#4aa3ff'},sup:{name:'Support',th:'สนับสนุน',icon:'✨',color:'#6be68b'},spc:{name:'Special',th:'พิเศษ',icon:'🌀',color:'#d36bff'}};
const SPECIALS={
 mirror:{name:'Mirror',th:'กระจกเงา',p:6,txt:'คะแนน = คะแนนฐานของการ์ดคู่แข่ง (สูงสุด 9)'},
 nullify:{name:'Nullify',th:'ลบล้าง',p:5,txt:'ยกเลิกโบนัสช่องข้างเคียงและการป้องกันของคู่แข่งรอบนี้'},
 steal:{name:'Steal',th:'ขโมยพลัง',p:4,txt:'ขโมย 2 คะแนนจากคู่แข่ง (ตัวเรา +2 · เขา −2)'},
 surge:{name:'Surge',th:'พลังพลิกเกม',p:7,txt:'ฐาน 3 · ถ้าชนะรอบน้อยกว่าคู่แข่ง +6 (ไม่งั้น +1)'}
};
function deckList(){
 const d=[];let n=0;
 [10,9,8,7,6,5,4].forEach(p=>d.push({id:'A'+p,type:'atk',p,name:'Strike '+p}));
 [9,7,6,5,3].forEach(p=>d.push({id:'D'+p,type:'def',p,name:'Guard '+p}));
 [8,6,5,3].forEach(p=>d.push({id:'S'+p,type:'sup',p,name:'Aid '+p}));
 Object.keys(SPECIALS).forEach(k=>d.push({id:'X'+k,type:'spc',sp:k,p:SPECIALS[k].p,name:SPECIALS[k].name}));
 return d; // 20 ใบ
}
function shuffle(a,rng){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const isSpc=c=>c&&c.type==='spc';

// ตรวจว่าที่เหลือในมือ “เล่นได้ครบทุกรอบ” ไหม (Special: เริ่มรอบ 2 · ห้ามต่อกัน) — กันทางตัน
function schedulable(hand,nextRound,lastSpc,total){
 total=total||5;const specials=hand.filter(isSpc).length;const others=hand.length-specials;
 // DFS ตามรอบ
 function go(r,ns,no,last){
  if(r>total)return ns===0&&no===0;
  if(no>0&&go(r+1,ns,no-1,last))return true;
  if(ns>0&&r>=2&&last!==r-1&&go(r+1,ns-1,no,r))return true;
  return false;
 }
 return go(nextRound,specials,others,lastSpc);
}
function dealHand(deck,extra,rng){
 if(extra<0)return dealWeak(deck,-extra,rng);
 // เด็ค 20 ใบ: ไม่ให้มือเริ่มต้นมี Special เกิน 2 ใบ · NPC ระดับสูงจั่วเพิ่มแล้วเลือก 5 ใบที่ดีที่สุด
 const d=shuffle(deck,rng);let hand=[],pile=[];
 const take=5+(extra||0);
 for(const c of d){if(hand.length<take&&!(isSpc(c)&&hand.filter(isSpc).length>=2))hand.push(c);else pile.push(c)}
 if(extra>0){
  const val=c=>c.type==='atk'?c.p:c.type==='def'?c.p*.9:c.type==='sup'?c.p*.85:6.2;
  hand.sort((a,b)=>val(b)-val(a));
  const keep=[];for(const c of hand){if(keep.length<5&&!(isSpc(c)&&keep.filter(isSpc).length>=2))keep.push(c);else pile.push(c)}
  hand=keep;
 }
 while(hand.length<5){const c=pile.shift();hand.push(c)}
 return {hand,pile:shuffle(pile,rng)};
}
function dealWeak(deck,n,rng){ // NPC มือใหม่: จั่ว 5+n ใบ แล้วต้องเก็บใบที่อ่อนที่สุด 5 ใบ
 const d=shuffle(deck,rng);let pool=[],pile=[];
 for(const c of d){if(pool.length<5+n&&!(isSpc(c)&&pool.filter(isSpc).length>=2))pool.push(c);else pile.push(c)}
 const val=c=>c.type==='atk'?c.p:c.type==='def'?c.p*.9:c.type==='sup'?c.p*.85:6.2;
 pool.sort((a,b)=>val(a)-val(b));
 const keep=[];for(const c of pool){if(keep.length<5)keep.push(c);else pile.push(c)}
 return {hand:keep,pile:shuffle(pile,rng)};
}
function newBattle(opts){
 opts=opts||{};const rng=opts.rng||rnd01;const npc=opts.npc||NPCS[0];
 const dp=dealHand(deckList(),0,rng),dn=dealHand(deckList(),npc.extra||0,rng);
 return {
  active:true,round:1,phase:'pick',npc,bet:opts.bet||0,
  hand:{p:dp.hand,n:dn.hand},pile:{p:dp.pile,n:dn.pile},
  board:{p:[null,null,null,null,null],n:[null,null,null,null,null]},
  wins:{p:0,n:0},pts:{p:0,n:0},rounds:[],lastSpc:{p:-9,n:-9},
  drawn:null,placed:null,sd:null,result:null,seq:0
 };
}
function legalMoves(b,side){
 const out=[];const empties=[];b.board[side].forEach((x,i)=>{if(!x)empties.push(i)});
 b.hand[side].forEach((c,ci)=>{
  if(!canPlayCard(b,side,ci))return;
  empties.forEach(s=>out.push({ci,slot:s}));
 });
 return out;
}
function canPlayCard(b,side,ci){
 const c=b.hand[side][ci];if(!c)return false;
 const rest=b.hand[side].filter((_,i)=>i!==ci);
 if(isSpc(c)){
  if(b.round<2)return false;
  if(b.lastSpc[side]===b.round-1)return false;
  return schedulable(rest,b.round+1,b.round);
 }
 return schedulable(rest,b.round+1,b.lastSpc[side]);
}
function whyCant(b,side,ci){
 const c=b.hand[side][ci];if(!c)return '';
 if(isSpc(c)){if(b.round<2)return 'Special ใช้ไม่ได้ในรอบที่ 1';if(b.lastSpc[side]===b.round-1)return 'Special ใช้ติดกันสองรอบไม่ได้'}
 return 'ใช้ตอนนี้จะทำให้เล่นไพ่ที่เหลือไม่ครบ 5 รอบ (ข้อจำกัด Special)';
}

function adj(i){const a=[];if(i>0)a.push(i-1);if(i<4)a.push(i+1);return a}
function auraAt(board,slot){let s=0;adj(slot).forEach(j=>{const c=board[j];if(c&&c.type==='sup')s+=Math.ceil(c.p/3)});return s}
function baseOf(c){return c.type==='atk'?c.p:c.type==='def'?Math.floor(c.p/2):c.type==='sup'?Math.max(1,Math.floor(c.p/2)):c.sp==='surge'?3:c.sp==='steal'?4:c.sp==='nullify'?5:0}
/* คำนวณคะแนนรอบ: พลังการ์ด + โบนัสสกิล − ผลลดพลังจากคู่แข่ง */
function scoreRound(pc,pa,nc,na,ctx){
 ctx=ctx||{};const bp=baseOf(pc),bn=baseOf(nc);
 const A={card:pc,base:bp,aura:pa,red:0,steal:0,notes:[]},B={card:nc,base:bn,aura:na,red:0,steal:0,notes:[]};
 // special ที่อ้างอิงฐานของอีกฝ่าย
 if(pc.sp==='mirror'){A.base=bn;if(nc.sp==='mirror')A.base=3;A.base=Math.min(9,A.base);A.notes.push('คัดลอกคะแนนฐานคู่แข่ง')}
 if(nc.sp==='mirror'){B.base=bp;if(pc.sp==='mirror')B.base=3;B.base=Math.min(9,B.base);B.notes.push('คัดลอกคะแนนฐานคู่แข่ง')}
 if(pc.sp==='surge'){const bonus=(ctx.behindP?6:1);A.base=3+bonus;A.notes.push(ctx.behindP?'พลิกเกม +6':'+1')}
 if(nc.sp==='surge'){const bonus=(ctx.behindN?6:1);B.base=3+bonus;B.notes.push(ctx.behindN?'พลิกเกม +6':'+1')}
 // nullify
 if(pc.sp==='nullify'){B.aura=0;B.nulled=1;A.notes.push('ลบล้างโบนัสคู่แข่ง')}
 if(nc.sp==='nullify'){A.aura=0;A.nulled=1;B.notes.push('ลบล้างโบนัสคู่แข่ง')}
 // defense ลดคะแนนฝั่งตรงข้าม (ถูก nullify แล้วไม่ทำงาน)
 if(pc.type==='def'&&!A.nulled){B.red+=Math.floor(pc.p/2);A.notes.push('ป้องกัน −'+Math.floor(pc.p/2))}
 if(nc.type==='def'&&!B.nulled){A.red+=Math.floor(nc.p/2);B.notes.push('ป้องกัน −'+Math.floor(nc.p/2))}
 if(pc.sp==='steal'){A.steal+=2;B.red+=2;A.notes.push('ขโมย 2')}
 if(nc.sp==='steal'){B.steal+=2;A.red+=2;B.notes.push('ขโมย 2')}
 const fin=X=>Math.max(0,Math.min(14,X.base+X.aura+X.steal-X.red));
 A.final=fin(A);B.final=fin(B);
 return {p:A,n:B,winner:A.final>B.final?'p':B.final>A.final?'n':'t'};
}
/* วางการ์ดจากมือลงช่อง (ยังไม่เปิดเผยของ NPC) */
function place(b,side,ci,slot){
 if(!b.active||b.result)return {ok:false,err:'การแข่งขันจบแล้ว'};
 if(b.placed&&b.placed[side])return {ok:false,err:'วางการ์ดรอบนี้ไปแล้ว'};
 if(slot<0||slot>4||b.board[side][slot])return {ok:false,err:'ช่องไม่ว่าง'};
 if(!canPlayCard(b,side,ci))return {ok:false,err:whyCant(b,side,ci)};
 const c=b.hand[side].splice(ci,1)[0];
 b.board[side][slot]=c;
 b.placed=b.placed||{};b.placed[side]={card:c,slot};
 if(isSpc(c))b.lastSpc[side]=b.round;
 return {ok:true,card:c};
}
function resolve(b){
 const P=b.placed.p,N=b.placed.n;
 const pa=auraAt(b.board.p,P.slot),na=auraAt(b.board.n,N.slot);
 const r=scoreRound(P.card,pa,N.card,na,{behindP:b.wins.p<b.wins.n,behindN:b.wins.n<b.wins.p});
 b.pts.p+=r.p.final;b.pts.n+=r.n.final;
 if(r.winner==='p')b.wins.p++;else if(r.winner==='n')b.wins.n++;
 r.round=b.round;r.slots={p:P.slot,n:N.slot};
 b.rounds.push(r);b.placed=null;b.drawn=null;b.last=r;
 return r;
}
function nextRound(b){
 if(b.round<5){b.round++;b.phase='pick';return 'next'}
 if(b.wins.p!==b.wins.n){return finish(b)}
 return 'tie';
}
/* รอบตัดสิน: จั่วการ์ดบนสุดจากกองจั่ว ลงช่องกลาง · เทียบคะแนนรอบ ถ้ายังเสมอ → เทียบคะแนนรวม → ยังเสมอ = เสมอจริง */
function suddenDeath(b){
 const pc=b.pile.p.shift()||deckList()[0],nc=b.pile.n.shift()||deckList()[0];
 const r=scoreRound(pc,0,nc,0,{behindP:false,behindN:false});
 b.pts.p+=r.p.final;b.pts.n+=r.n.final;
 b.sd={pc,nc,r};
 if(r.winner==='p')b.wins.p++;else if(r.winner==='n')b.wins.n++;
 return finish(b);
}
function finish(b){
 let w=b.wins.p>b.wins.n?'p':b.wins.n>b.wins.p?'n':(b.pts.p>b.pts.n?'p':b.pts.n>b.pts.p?'n':'d');
 b.result=w;b.active=false;b.phase='done';return w;
}

/* ---------- AI ---------- */
function sideCards(b,side){const out=[];b.board[side].forEach(c=>{if(c)out.push(c)});return out}
// การ์ดที่คู่แข่งอาจวางต่อไป (เด็คเดียวกัน ลบที่เปิดเผยแล้ว)
function unseenFor(b,side,hiddenOk){
 const seen={};b.board[side].forEach(c=>{if(c)seen[c.id]=1});
 return deckList().filter(c=>!seen[c.id]);
}
function evalMove(b,side,ci,slot,opts){
 const opp=side==='p'?'n':'p';const c=b.hand[side][ci];
 const myAura=auraAt(b.board[side],slot);
 const pool=unseenFor(b,opp);
 // คะแนนคู่แข่งแบบคาดการณ์: เฉลี่ยทุกใบที่เป็นไปได้ (ไม่แอบดูการ์ดที่เขาวางอยู่)
 let sum=0,win=0,k=0;
 const behindMe=b.wins[side]<b.wins[opp],behindOpp=b.wins[opp]<b.wins[side];
 const emptyOpp=[];b.board[opp].forEach((x,i)=>{if(!x)emptyOpp.push(i)});
 pool.forEach(oc=>{
  // ถ้าคู่แข่งยังวางไม่ได้ (Special ต้นเกม) ข้าม
  if(isSpc(oc)&&b.round<2)return;
  // ค่าเฉลี่ยโบนัสช่องข้างเคียงของคู่แข่ง ≈ ค่าเฉลี่ยจากช่องว่าง
  let oa=0;if(emptyOpp.length){emptyOpp.forEach(s=>oa+=auraAt(b.board[opp],s));oa/=emptyOpp.length}
  const r=side==='p'?scoreRound(c,myAura,oc,Math.round(oa),{behindP:behindMe,behindN:behindOpp}):scoreRound(oc,Math.round(oa),c,myAura,{behindP:behindOpp,behindN:behindMe});
  const me=side==='p'?r.p.final:r.n.final,th=side==='p'?r.n.final:r.p.final;
  sum+=me-th;win+=me>th?1:me===th?.5:0;k++;
 });
 let v=k?(win/k*10+sum/k*.35):0;
 // มูลค่าอนาคตของ Support/Special
 const left=5-b.round;
 if(c.type==='sup'){const free=adj(slot).filter(j=>!b.board[side][j]).length;v+=free*Math.ceil(c.p/3)*left*.28}
 if(c.type!=='sup'&&left>0){v+=auraAt(b.board[side],slot)*.15}
 if(isSpc(c)){const behind=b.wins[side]<b.wins[opp];if(c.sp==='surge')v+=behind?2.5:-2.5;}
 // ประหยัดการ์ดแรงไว้รอบท้าย เมื่อนำอยู่
 if(b.wins[side]>b.wins[opp]&&c.type==='atk'&&c.p>=8&&left>1)v-=.6;
 // ตำแหน่ง: ช่องกลางมีเพื่อนบ้าน 2 ด้านเหมาะกับตัวรับโบนัส
 if(c.type!=='sup')v+=adj(slot).filter(j=>b.board[side][j]&&b.board[side][j].type==='sup').length*.2;
 return v;
}
function aiChoose(b,side,rng){
 rng=rng||rnd01;const npc=side==='n'?b.npc:(b.npcP||NPCS[1]);
 const moves=legalMoves(b,side);if(!moves.length)return null;
 const vals=moves.map(m=>evalMove(b,side,m.ci,m.slot));
 const tau=(side==='n'?npc.tau:(b.pTau||1.2));
 const bl=side==='n'?(npc.blunder||0):0;
 if(bl&&rng()<bl){const idx=vals.map((v,i)=>i).sort((x,y)=>vals[x]-vals[y]);return moves[idx[Math.floor(rng()*Math.max(1,Math.ceil(idx.length/2)))]]}
 const mx=Math.max(...vals);const w=vals.map(v=>Math.exp((v-mx)/Math.max(.05,tau)));
 const tot=w.reduce((a,x)=>a+x,0);let r=rng()*tot;
 for(let i=0;i<moves.length;i++){r-=w[i];if(r<=0)return moves[i]}
 return moves[moves.length-1];
}

/* ---------- เดิมพัน / รางวัล ---------- */
function maxBetFor(npc){return npc.maxBet}
function betOptions(npc){return BETS.filter(x=>x<=npc.maxBet)}
let battleLock=false;
/* เริ่มแมตช์: ตรวจเงิน/ขีดจำกัด · หักเงินทันที · บันทึกสถานะ active ลงเซฟ (กันออกเกมแล้วเงินกลับ) */
function startBattle(npcId,bet,rng){
 const c=CS();const npc=NPCS.find(n=>n.id===npcId);
 if(!c||!npc)return {ok:false,err:'ไม่พบคู่แข่ง'};
 if(battleLock||(c.battle&&c.battle.active))return {ok:false,err:'กำลังแข่งขันอยู่'};
 if(c.pending)return {ok:false,err:'ต้องเปิดซองที่ค้างอยู่ก่อน'};
 if(BETS.indexOf(bet)<0)return {ok:false,err:'จำนวนเดิมพันไม่ถูกต้อง'};
 if(bet>npc.maxBet)return {ok:false,err:'คู่แข่งนี้รับเดิมพันสูงสุด '+npc.maxBet.toLocaleString()};
 if(money()<bet)return {ok:false,err:'เงินไม่พอสำหรับเดิมพัน'};
 battleLock=true;
 try{
  addMoney(-bet);
  const b=newBattle({npc,bet,rng});
  c.battle={active:true,npc:npc.id,bet,t:ENV.now()};
  ENV.save();
  return {ok:true,battle:b};
 }finally{battleLock=false}
}
/* จบแมตช์: จ่ายเงิน/บันทึกสถิติ — เรียกได้ครั้งเดียวต่อแมตช์ */
function settleBattle(b,forfeit){
 const c=CS();if(!c||!b||b.settled)return null;
 b.settled=true;
 const npc=b.npc,bet=b.bet;let res=forfeit?'n':b.result||'d',payout=0,bonus=0,rpDelta=0;
 const st=c.stats;st.games++;
 if(res==='p'){
  payout=bet*2;
  if(rnd01()<.25){bonus=Math.max(50,Math.round(bet*.1/50)*50)}
  addMoney(payout+bonus);st.w++;st.streak++;st.best=Math.max(st.best,st.streak);st.net+=bet+bonus;
  rpDelta=npc.rp+Math.min(10,st.streak-1)*2;c.rp+=rpDelta;
 }else if(res==='n'){
  st.l++;st.streak=0;st.net-=bet;rpDelta=-Math.min(c.rp,Math.round(npc.rp/3));c.rp+=rpDelta;
 }else{
  payout=bet;addMoney(bet);st.d++;
 }
 c.battle=null;ENV.save();
 return {res,payout,bonus,net:res==='p'?bet+bonus:res==='n'?-bet:0,rpDelta,rp:c.rp,rank:rankName(c.rp),forfeit:!!forfeit};
}
/* ตรวจสถานะแมตช์ค้างหลังโหลดเซฟ: ถือว่าแพ้ (เงินเดิมพันถูกหักไปแล้ว) */
function recoverBattle(){
 const c=CS();if(!c||!c.battle||!c.battle.active)return null;
 const npc=NPCS.find(n=>n.id===c.battle.npc)||NPCS[0];
 return settleBattle({npc,bet:c.battle.bet||0,result:'n'},true);
}

const API={FACTIONS,TIERS,BASE_ODDS,CARDS,CARD_BY_ID,FAC_BY_ID,PACKS,PACK_BY_ID,NPCS,BETS,BTYPES,SPECIALS,
 setEnv,state:CS,own,completion,money,rollCard,buyPack,pendingReveal,clearPending,rankName,rankNext,RANKS,
 deckList,newBattle,legalMoves,canPlayCard,whyCant,place,resolve,nextRound,suddenDeath,finish,scoreRound,auraAt,baseOf,adj,schedulable,
 aiChoose,startBattle,settleBattle,recoverBattle,betOptions,maxBetFor,shuffle,rnd01,isSpc,tierOf,addMoney,day:()=>ENV.day()};
if(typeof module!=='undefined'&&module.exports)module.exports=API;
root.CARDSHOP=Object.assign(root.CARDSHOP||{},API);
})(typeof window!=='undefined'?window:globalThis);

