
/* =====================================================================
   v93 · CEO LEVEL (Infinite) + SKILL TREE + ACTIVE WORK + PROCESS CONTRIBUTION
   - ข้อมูลทั้งหมดอยู่ใน S.ceoRPG  → ถูกบันทึกไปกับ Save เดิม (JSON ของ S) โดยอัตโนมัติ
   - Save เก่าที่ไม่มี S.ceoRPG จะถูกสร้างค่าเริ่มต้น (Lv1 / EXP 0 / SP 0) ตอนเรียก R() ครั้งแรก
   - ไม่มี Game Loop ใหม่: ใช้ CEORPG.tick() ที่ถูกเรียกจาก frame() เดิมเท่านั้น
   - Event Listener ทุกตัวถูกผูกครั้งเดียว (event delegation)
   ===================================================================== */
const CEORPG=(function(){
'use strict';
const $=id=>document.getElementById(id);
const MAXN=1e15, MAXRANK=10;
const num=(v,d,lo,hi)=>{v=+v;if(!isFinite(v))return d;return Math.min(hi==null?MAXN:hi,Math.max(lo==null?0:lo,v))};

/* ------------------------------ Skill definitions ------------------------------ */
// key = ชนิดโบนัส · per = ค่าต่อ 1 Rank · c0 = ค่า SP พื้นฐาน · gate = เลเวลขั้นต่ำเพิ่มเติมของสกิลนี้
const BR=[
 {id:'ops', n:'OPERATIONS', th:'การปฏิบัติการ', ic:'⚡', col:'#ffd45a', skills:[
  {id:'o1',n:'ลงมือไว',ic:'⚡',key:'ceoSpd',per:.04,c0:1,gate:0,d:'เพิ่มความเร็วการทำงานของ CEO (Process ที่ CEO ลงมือสร้าง)',u:'%'},
  {id:'o2',n:'นักมินิเกม',ic:'🎯',key:'mini',per:.03,c0:1,gate:0,d:'เพิ่มโบนัสจากผลมินิเกม (คูณกับ Normal/Good/Perfect)',u:'%'},
  {id:'o3',n:'บริหารเวลา',ic:'⏱️',key:'cdCut',per:.04,c0:1,gate:2,d:'ลดระยะเวลาพักของสถานีทำงาน',u:'%'},
  {id:'o4',n:'ช่วยโปรเจกต์',ic:'🤝',key:'assist',per:.03,c0:2,gate:4,d:'เพิ่มประสิทธิภาพเวลา CEO ช่วยทำโปรเจกต์',u:'%'},
  {id:'o5',n:'งานพิเศษ',ic:'⭐',key:'special',per:.06,c0:2,gate:6,d:'ปลดล็อก “งานพิเศษ” (ยากขึ้น · EXP/Process สูงขึ้น) และเพิ่มรางวัลงานพิเศษ',u:'%'}]},
 {id:'mgmt', n:'MANAGEMENT', th:'การจัดการ', ic:'💼', col:'#7aa2ff', skills:[
  {id:'m1',n:'ผู้นำทีม',ic:'👥',key:'npcSpd',per:.02,c0:1,gate:0,d:'เพิ่มความเร็วการทำงานของ NPC ทุกคน',u:'%'},
  {id:'m2',n:'ทีมเวิร์ก',ic:'🧩',key:'team',per:.015,c0:1,gate:0,d:'เมื่อมี NPC ทำงานตั้งแต่ 2 คน ประสิทธิภาพทีมเพิ่มขึ้น',u:'%'},
  {id:'m3',n:'ไม่มีเวลาว่าง',ic:'📈',key:'idle',per:.05,c0:1,gate:2,d:'NPC ที่ไม่มีงานเหลือให้ทำจะได้ EXP ฝึกงานเพิ่ม',u:'%'},
  {id:'m4',n:'งานร่วมกัน',ic:'🔗',key:'collab',per:.03,c0:2,gate:4,d:'หลัง CEO ช่วยงาน NPC จะทำงานเร็วขึ้นชั่วคราว (60 นาทีในเกม)',u:'%'},
  {id:'m5',n:'บริหารแผนก',ic:'🏢',key:'dept',per:.015,c0:2,gate:6,d:'เมื่อมีพนักงานตั้งแต่ 3 คน ประสิทธิภาพแผนกเพิ่มขึ้น',u:'%'}]},
 {id:'fin', n:'FINANCE', th:'การเงิน', ic:'💰', col:'#6ee7a0', skills:[
  {id:'f1',n:'โบนัสโปรเจกต์',ic:'💵',key:'projInc',per:.02,c0:1,gate:0,d:'เพิ่มรายได้จากโปรเจกต์ที่ส่งมอบ',u:'%'},
  {id:'f2',n:'ประหยัดค่าใช้จ่าย',ic:'🧾',key:'cost',per:.01,c0:1,gate:2,d:'ลดรายจ่ายรายวัน (เงินเดือน + ค่าเช่า)',u:'%'},
  {id:'f3',n:'บริหารเงินสด',ic:'🏦',key:'fin',per:.0004,c0:2,gate:4,d:'ดอกผลเงินสดรายวัน (สูงสุดวันละ 300)',u:'%',dec:2},
  {id:'f4',n:'ผลตอบแทนธุรกิจ',ic:'📊',key:'ret',per:.015,c0:2,gate:6,d:'ส่งงานก่อนกำหนด (เหลือ ≥ 2 วัน) รับโบนัสรายได้เพิ่ม',u:'%'}]},
 {id:'mkt', n:'MARKETING', th:'การตลาด', ic:'📣', col:'#ff8fc7', skills:[
  {id:'k1',n:'ภาพลักษณ์องค์กร',ic:'🌟',key:'rep',per:.03,c0:1,gate:0,d:'เพิ่มชื่อเสียงที่ได้รับจากการส่งงาน',u:'%'},
  {id:'k2',n:'ลูกค้าใหม่',ic:'🧲',key:'newCl',per:.02,c0:1,gate:2,d:'เพิ่มโอกาสมีงานใหม่บนกระดานทุกวัน',u:'%'},
  {id:'k3',n:'นักการตลาด',ic:'📢',key:'mktEff',per:.04,c0:2,gate:4,d:'เพิ่มประสิทธิภาพงานการตลาดของ CEO',u:'%'},
  {id:'k4',n:'แคมเปญทอง',ic:'🏆',key:'mktBon',per:.02,c0:2,gate:6,d:'โปรเจกต์ที่ต้องใช้งานการตลาดจ่ายเพิ่ม',u:'%'}]}
];
const SK={};BR.forEach(b=>b.skills.forEach(s=>{s.br=b.id;SK[s.id]=s}));
const SKN=Object.keys(SK).length;                                 // 18 สกิล × 10 Rank
const GATE=[0,1,3,5,8,11,15,19,24,30];                              // เลเวลขั้นต่ำเพิ่มตาม Rank
const skCost=(s,r)=>Math.ceil(s.c0*(1+(r-1)*.25));                  // SP ของ Rank r (1..10)
const skMinLv=(s,r)=>Math.max(1,s.gate+GATE[r-1]);

// Mastery (หลังปลดล็อกสกิลครบทุกตัว) : ผลลัพธ์ลดหลั่น  v = cap × (1 − 0.92^rank)  จึงมีเพดานแน่นอน
const MS=[
 {id:'ma',n:'Mastery · Operations',ic:'⚡',key:'ceoSpd',cap:.30,d:'ความเร็วทำงาน CEO'},
 {id:'mb',n:'Mastery · Management',ic:'💼',key:'npcSpd',cap:.18,d:'ความเร็วทำงาน NPC'},
 {id:'mc',n:'Mastery · Finance',ic:'💰',key:'projInc',cap:.15,d:'รายได้โปรเจกต์'},
 {id:'md',n:'Mastery · Marketing',ic:'📣',key:'rep',cap:.25,d:'ชื่อเสียงจากการส่งงาน'},
 {id:'me',n:'Mastery · EXP',ic:'🧠',key:'xpB',cap:.35,d:'EXP ที่ได้รับ'}
];
const MSK={};MS.forEach(m=>MSK[m.id]=m);
const msVal=(m,r)=>m.cap*(1-Math.pow(.92,r));
const msCost=r=>2+Math.floor(r/8);

/* ------------------------------ Level formula ------------------------------ */
// EXP Required = 100 + 35 × Level^1.35
const reqXP=L=>{L=Math.max(1,Math.floor(num(L,1,1,1e9)));return Math.round(100+35*Math.pow(L,1.35))};

/* ------------------------------ Level rewards ------------------------------ */
const RW=[
 [5,'⚡','เพิ่มความเร็ว CEO','ความเร็วทำงาน CEO +5%'],
 [10,'🧩','ปลดล็อกมินิเกมใหม่','PROJECT MANAGEMENT (โต๊ะประชุม) + รางวัลพิเศษ'],
 [15,'🤝','โบนัสการช่วย NPC','ประสิทธิภาพช่วยโปรเจกต์ +5%'],
 [20,'💼','ปลดล็อกความสามารถบริหาร','ความเร็วทำงาน NPC +3%'],
 [30,'📈','โบนัส Process เพิ่มเติม','ความเร็วทำงาน CEO +5% (ถาวร)'],
 [40,'✨','ปลดล็อกความสามารถพิเศษ','เวลามินิเกม +2 วินาที · โบนัสมินิเกม +5%'],
 [50,'👑','รางวัล CEO ระดับสูง','เงินรางวัลใหญ่ + ชื่อเสียง +10']
];
function lvlMoney(L){return Math.min(25000,800*Math.round(Math.sqrt(L)))}   // โตแบบ √L และมีเพดาน ไม่ทำให้เศรษฐกิจพัง
function lvlEff(L,k){
 let v=0;
 if(k==='ceoSpd'){if(L>=5)v+=.05;if(L>=30)v+=.05;if(L>50)v+=Math.min(.10,Math.floor((L-50)/25)*.01)}
 else if(k==='assist'){if(L>=15)v+=.05}
 else if(k==='npcSpd'){if(L>=20)v+=.03}
 else if(k==='mini'){if(L>=40)v+=.05}
 return v;
}

/* ------------------------------ State (S.ceoRPG) ------------------------------ */
function blank(){return{v:1,level:1,xp:0,total:0,sp:0,mp:0,skills:{},mastery:{},unlocked:[],hist:[],ach:{},rw:{},cd:{},
 st:{works:0,perfect:0,good:0,assist:0,mktJobs:0,bestStreak:0,streak:0,special:0,xpDay:0},dayN:{d:0,n:0},collabUntil:0,repFrac:0,unlockedMini:{pm:false}}}
function R(){
 if(typeof S==='undefined'||!S)return blank();
 let r=S.ceoRPG;
 if(!r||typeof r!=='object'||r.v!==1){r=S.ceoRPG=blank();return r}
 if(r._ok)return r;
 // ตรวจ/ซ่อมค่าจาก Save (ป้องกันค่าเสียหรือล้น)
 const b=blank();
 r.level=Math.floor(num(r.level,1,1,1e9));r.xp=num(r.xp,0);r.total=num(r.total,0);r.sp=Math.floor(num(r.sp,0));r.mp=Math.floor(num(r.mp,0));
 ['skills','mastery','ach','rw','cd','st','dayN','unlockedMini'].forEach(k=>{if(!r[k]||typeof r[k]!=='object')r[k]=b[k]});
 ['unlocked','hist'].forEach(k=>{if(!Array.isArray(r[k]))r[k]=[]});
 for(const k in b.st)r.st[k]=num(r.st[k],0);
 for(const id in r.skills){if(!SK[id])delete r.skills[id];else r.skills[id]=Math.floor(num(r.skills[id],0,0,MAXRANK))}
 for(const id in r.mastery){if(!MSK[id])delete r.mastery[id];else r.mastery[id]=Math.floor(num(r.mastery[id],0,0,1e6))}
 r.collabUntil=num(r.collabUntil,0);r.repFrac=num(r.repFrac,0,0,1);
 if(r.xp>=reqXP(r.level)){r.xp=0}   // ค่า xp ไม่สอดคล้อง (ไม่ควรเกิดขึ้น)
 if(r.hist.length>60)r.hist=r.hist.slice(-60);
 try{Object.defineProperty(r,'_ok',{value:1,enumerable:false,configurable:true,writable:true})}catch(e){}
 return r;
}
const rank=id=>R().skills[id]||0;
const allMaxed=()=>{const r=R();return BR.every(b=>b.skills.every(s=>(r.skills[s.id]||0)>=MAXRANK))};
const maxedCount=()=>{const r=R();let n=0;BR.forEach(b=>b.skills.forEach(s=>{if((r.skills[s.id]||0)>=MAXRANK)n++}));return n};

/* ------------------------------ Bonus calculation ------------------------------ */
const CAP={ceoSpd:1.6,mini:.9,cdCut:.6,assist:.8,special:.9,npcSpd:.5,team:.3,idle:.8,collab:.4,dept:.3,projInc:.6,cost:.25,fin:.01,ret:.3,rep:.6,newCl:.5,mktEff:.7,mktBon:.4,xpB:.5};
function bonus(key){
 const r=R(),L=r.level;let v=lvlEff(L,key);
 BR.forEach(b=>b.skills.forEach(s=>{if(s.key===key)v+=s.per*(r.skills[s.id]||0)}));
 MS.forEach(m=>{if(m.key===key)v+=msVal(m,r.mastery[m.id]||0)});
 return Math.min(CAP[key]==null?9:CAP[key],v);
}
let npcCache={t:-1,v:1};
function npcMulCalc(){
 let n=0,all=0;try{S.emp.forEach(e=>{if(e.st!=='home'&&e.st!=='out'&&e.st!=='errandWait'){all++;if(e.st==='work')n++}})}catch(e){}
 let b=bonus('npcSpd');
 if(n>=2)b+=bonus('team');
 if(all>=3)b+=bonus('dept');
 try{if(R().collabUntil>S.day*1440+S.t)b+=bonus('collab')}catch(e){}
 return 1+Math.min(.8,b);
}
function npcMul(){return npcCache.v}

/* ------------------------------ Stations ------------------------------ */
const STN={
 desk:{ic:'💻',n:'โต๊ะคอมพิวเตอร์',games:['entry','design','market']},
 cab:{ic:'📁',n:'ตู้เอกสาร',games:['review']},
 table:{ic:'📋',n:'โต๊ะประชุมวางแผน',games:['pm']}
};
const GAME={
 entry:{n:'DATA ENTRY',ic:'⌨️',sk:'P',t:10,pose:'💻',th:'กรอกข้อมูลตามลำดับ'},
 review:{n:'DOCUMENT REVIEW',ic:'🧾',sk:'A',t:12,pose:'📄',th:'ตรวจเอกสาร'},
 design:{n:'DESIGN TASK',ic:'🎨',sk:'D',t:12,pose:'🖌️',th:'จัดองค์ประกอบ'},
 market:{n:'MARKETING TASK',ic:'📣',sk:'M',t:9,pose:'📣',th:'วางแผนแคมเปญ'},
 pm:{n:'PROJECT MANAGEMENT',ic:'🗂️',sk:'G',t:10,pose:'📋',th:'จัดลำดับความสำคัญ'}
};
const SKN_TH={P:'โปรแกรมมิ่ง',D:'ครีเอทีฟ',M:'สื่อสาร/การตลาด',G:'การจัดการ',A:'บัญชี'};
const GRADE={fail:{n:'MISS',th:'พลาด',m:.35,col:'#ff7b7b'},normal:{n:'NORMAL',th:'ปกติ',m:1,col:'#cfd6ea'},good:{n:'GOOD',th:'ดี',m:1.25,col:'#6ee7a0'},perfect:{n:'PERFECT',th:'สมบูรณ์แบบ',m:1.5,col:'#ffd45a'}};
const CD_MIN=90;                                                   // นาทีในเกมที่สถานีต้องพักหลังทำเสร็จ (ก่อนหักสกิล)
const STATION_R=54;                                                // ระยะที่ต้องเข้าใกล้สถานี (px)
const nowT=()=>S.day*1440+S.t;
const fmtN=n=>Math.floor(n).toLocaleString('en-US');
function stationOf(f){return f&&STN[f.t]?STN[f.t]:null}
function nearStation(){
 if(typeof S==='undefined'||!S||!S.pl||!S.f)return null;
 const p=S.pl;let best=null,bd=1e9;
 for(const f of S.f){
  if(!STN[f.t])continue;
  const cx=f.x*32+16,cy=f.y*32+16,d=Math.hypot(cx-p.x,cy-p.y);   // (T=32)
  if(d<=STATION_R&&d<bd){bd=d;best=f}
 }
 return best;
}
function cdLeft(f){const r=R(),u=r.cd[f.id]||0;return Math.max(0,u-nowT())}
function openNeeds(sk){            // โปรเจกต์ที่ยังต้องการสกิลนี้
 const out=[];try{S.projects.forEach(p=>{if(p.need&&p.need[sk]&&p.done[sk]<p.need[sk]-.01)out.push(p)})}catch(e){}
 return out;
}
function gameLocked(g){if(g==='pm'&&R().level<10)return'ต้องการ CEO Lv.10';return''}
function eligible(f){                // เกมที่เล่นได้จริง ณ ตอนนี้ (มีโปรเจกต์ต้องการ + ปลดล็อกแล้ว)
 const st=STN[f.t];if(!st)return[];
 return st.games.filter(g=>!gameLocked(g)&&openNeeds(GAME[g].sk).length);
}
function ccCap(k){try{return S.emp.some(e=>e&&e.charId!=='security-guard'&&e.sk&&e.sk[k]>0)?.6:1}catch(e){return .6}}
function ccRoom(p,k){return Math.max(0,p.need[k]*ccCap(k)-((p.cc&&p.cc[k])||0))}
function pickProj(sk){            // เลือกโปรเจกต์ที่ยังขาดมากที่สุด (ข้ามโปรเจกต์ที่ CEO ช่วยจนชนเพดานแล้ว ถ้ามีโปรเจกต์อื่น)
 let a=openNeeds(sk);if(!a.length)return null;
 const b=a.filter(p=>ccRoom(p,sk)>.05);if(b.length)a=b;
 a.sort((x,y)=>(y.need[sk]-y.done[sk])/y.need[sk]-(x.need[sk]-x.done[sk])/x.need[sk]);return a[0];
}
const pct=(p,k)=>Math.min(100,Math.round(p.done[k]/p.need[k]*100));

/* ------------------------------ XP / Level ------------------------------ */
let lvlQueue=null;
function awardPoints(n){const r=R();if(allMaxed())r.mp=Math.min(MAXN,r.mp+n);else r.sp=Math.min(MAXN,r.sp+n);return allMaxed()?'MP':'SP'}
function grantLevel(L,sum){
 const r=R();
 const pts=1+(L%5===0?1:0);
 const kind=awardPoints(pts);
 sum.pts[kind]=(sum.pts[kind]||0)+pts;
 if(L%10===0||L===5||L===15){
  const key=String(L);
  if(!r.rw[key]){                 // กันรับรางวัลซ้ำ
   r.rw[key]=1;
   if(L%10===0){
    const mny=lvlMoney(L)*(L===50?2:1),rep=Math.min(20,1+Math.floor(L/20))+(L===50?10:0);
    S.money+=mny;S.rep=(S.rep||0)+rep;
    sum.lines.push('💰 +$'+fmtN(mny)+' · ⭐ ชื่อเสียง +'+rep);
   }
  }
 }
 const m=RW.find(x=>x[0]===L);if(m)sum.lines.push(m[1]+' '+m[2]+' — '+m[3]);
 if(L===10)r.unlockedMini.pm=true;
 if(L>50&&L%25===0)sum.lines.push('🔥 โบนัสความเร็ว CEO ถาวรเพิ่มขึ้น');
}
function addXP(amount,src){
 const r=R();amount=num(amount,0,0,1e12);if(amount<=0)return{gained:0,levels:0};
 const sum={from:r.level,pts:{},lines:[]};
 r.total=Math.min(MAXN,r.total+amount);r.xp+=amount;
 let guard=0;
 while(guard++<5000){
  const need=reqXP(r.level);
  if(r.xp<need)break;
  r.xp-=need;               // ส่วนเกินสะสมต่อ ไม่รีเซ็ต
  r.level=Math.min(1e9,r.level+1);
  grantLevel(r.level,sum);
 }
 if(r.xp>=reqXP(r.level)&&guard>=5000)r.xp=reqXP(r.level)-1;   // กัน loop ค้างเมื่อรับ EXP มหาศาล
 if(!isFinite(r.xp))r.xp=0;
 sum.levels=r.level-sum.from;sum.gained=amount;
 if(sum.levels>0){levelUpFx(sum);checkAch();try{save(1)}catch(e){}}
 if(profOpen())renderProf();
 chip();
 return sum;
}
function chip(){const c=$('rpChip');if(c){const r=R();c.textContent='⭐ Lv.'+r.level;c.title='CEO PROFILE · EXP '+fmtN(r.xp)+'/'+fmtN(reqXP(r.level))}}

/* ------------------------------ Skill purchase ------------------------------ */
function buy(id){
 const r=R(),s=SK[id];
 if(!s)return{ok:0,msg:'ไม่พบสกิล'};
 const cur=r.skills[id]||0;
 if(cur>=MAXRANK)return{ok:0,msg:'สกิลนี้ MAX แล้ว'};
 const nx=cur+1,need=skMinLv(s,nx),cost=skCost(s,nx);
 if(r.level<need)return{ok:0,msg:'ต้องการ CEO Lv.'+need};
 if(r.sp<cost)return{ok:0,msg:'Skill Point ไม่พอ (ต้องการ '+cost+')'};
 r.sp-=cost;r.skills[id]=nx;                    // หักแต้มเฉพาะเมื่อผ่านเงื่อนไขทั้งหมด
 if(nx===1&&!r.unlocked.includes(id))r.unlocked.push(id);
 if(allMaxed()){const was=r.unlockedMini.mastery;r.unlockedMini.mastery=true;if(!was)toastX('🌟 ปลดล็อก Skill Tree ครบทุกสาย! แต้มต่อไปจะเป็น Mastery Point')}
 checkAch();try{save(1)}catch(e){}
 return{ok:1,msg:s.n+' → Rank '+nx};
}
function buyMastery(id){
 const r=R(),m=MSK[id];
 if(!m)return{ok:0,msg:'ไม่พบ'};
 if(!allMaxed())return{ok:0,msg:'ต้องปลดล็อก Skill Tree ให้ครบก่อน'};
 const cur=r.mastery[id]||0,cost=msCost(cur);
 if(r.mp<cost)return{ok:0,msg:'Mastery Point ไม่พอ (ต้องการ '+cost+')'};
 if(cur>=1e5)return{ok:0,msg:'สูงสุดแล้ว'};
 r.mp-=cost;r.mastery[id]=cur+1;checkAch();try{save(1)}catch(e){}
 return{ok:1,msg:m.n+' → Rank '+(cur+1)};
}

/* ------------------------------ Achievements ------------------------------ */
const ACH=[
 ['first','🔰','งานแรก','ทำงานกับสถานีสำเร็จ 1 ครั้ง',r=>r.st.works>=1],
 ['w10','🛠️','มือทำงาน','ทำงานครบ 10 ครั้ง',r=>r.st.works>=10],
 ['w50','🏗️','ขยันสุด ๆ','ทำงานครบ 50 ครั้ง',r=>r.st.works>=50],
 ['p3','🎯','มือโปร','ได้ PERFECT 3 ครั้ง',r=>r.st.perfect>=3],
 ['p15','💎','ไร้ที่ติ','ได้ PERFECT 15 ครั้ง',r=>r.st.perfect>=15],
 ['l5','⭐','เริ่มเก่ง','ถึง CEO Lv.5',r=>r.level>=5],
 ['l10','🌟','ผู้บริหารมือใหม่','ถึง CEO Lv.10',r=>r.level>=10],
 ['l25','🏅','ผู้บริหารอาวุโส','ถึง CEO Lv.25',r=>r.level>=25],
 ['l50','👑','CEO ระดับสูง','ถึง CEO Lv.50',r=>r.level>=50],
 ['sk1','🌱','ฝึกสกิลแรก','อัปเกรดสกิลแรก',r=>Object.keys(r.skills).some(k=>r.skills[k]>0)],
 ['as5','🤝','ผู้ช่วยตัวยง','ส่งมอบโปรเจกต์ที่ CEO ช่วยทำ 5 งาน',r=>r.st.assist>=5],
 ['str5','🔥','ต่อเนื่อง','ได้ GOOD ขึ้นไปติดกัน 5 ครั้ง',r=>r.st.bestStreak>=5],
 ['mst','🧠','Mastery','ปลดล็อก Skill Tree ครบทั้งหมด',r=>BR.every(b=>b.skills.every(s=>(r.skills[s.id]||0)>=MAXRANK))]
];
function checkAch(){
 const r=R();
 ACH.forEach(a=>{if(!r.ach[a[0]]&&a[4](r)){r.ach[a[0]]=nowSafe();toastX('🏆 ความสำเร็จ: '+a[2])}});
}
const nowSafe=()=>{try{return nowT()}catch(e){return 1}};
function toastX(m){try{toast(m)}catch(e){}}

/* ------------------------------ Station prompt (DOM) ------------------------------ */
let promptKey='',working=null,fx=[],lastNear=null;
function blockers(){
 try{
  if(typeof S==='undefined'||!S||S.over)return true;
  if(typeof CUT!=='undefined'&&CUT.on)return true;
  if(typeof CEOScene!=='undefined'&&CEOScene.dbg&&CEOScene.dbg().st.active)return true;
  if($('evModal')||$('teeCut'))return true;
  if(window.GHOST&&GHOST.freezePlayer&&GHOST.freezePlayer())return true;
  const ids=['clientModal','loanModal','osModal','testModal','menu','ceoBag','ceoProf','policeModal','spyModal'];
  for(const id of ids){const el=$(id);if(el&&el.hidden===false)return true}
 }catch(e){return true}
 return false;
}
function promptState(){
 const f=nearStation();if(!f)return null;
 const st=STN[f.t],cl=cdLeft(f);
 const el=eligible(f);
 let status,can=false,proj='';
 const gs=st.games;
 if(cl>0){status='⏳ พักอยู่ · เหลือ '+Math.ceil(cl)+' นาทีในเกม'}
 else if(!el.length){
  const lk=gs.map(gameLocked).find(x=>x);
  status=lk?('🔒 '+lk):'ยังไม่มีโปรเจกต์ที่ต้องใช้งานประเภทนี้';
 }else{can=true;status='พร้อมทำงาน'}
 // สถานะโปรเจกต์ที่เกี่ยวข้อง
 const parts=[];
 gs.forEach(g=>{const sk=GAME[g].sk,p=pickProj(sk);if(p)parts.push('<b>'+esc(p.n)+'</b> · '+sk+' '+pct(p,sk)+'%'+((p.cc&&p.cc[sk])?' <span style="color:#ffd45a">(CEO '+Math.round(p.cc[sk]/p.need[sk]*100)+'%'+(ccRoom(p,sk)<=.05?' · เต็มเพดาน CEO ช่วยได้สูงสุด '+Math.round(ccCap(sk)*100)+'% ที่เหลือให้พนักงานทำ':'')+')</span>':''))});
 proj=parts.length?parts.slice(0,2).join('<br>'):'ไม่มีโปรเจกต์ที่กำลังดำเนินการสำหรับงานนี้';
 const sp=bonus('special')>0||R().skills.o5>0;
 return{f,st,can,status,proj,special:sp&&can,cl};
}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function updPrompt(){
 const box=$('rpPrompt');if(!box)return;
 if(working||blockers()||(S&&S.paused)){box.hidden=true;promptKey='';return}
 const ps=promptState();
 if(!ps){box.hidden=true;promptKey='';return}
 const k=ps.f.id+'|'+ps.status+'|'+ps.proj+'|'+ps.can+'|'+ps.special;
 if(k!==promptKey){
  promptKey=k;
  box.innerHTML='<div class="rpPT"><span class="rpPI">'+ps.st.ic+'</span><div><b>'+ps.st.n+'</b><small>'+ps.status+'</small></div></div><div class="rpPP">'+ps.proj+'</div><div class="rpPB"><button class="rpGo" data-rp="go"'+(ps.can?'':' disabled')+'>INTERACT<i>E</i></button>'+(ps.special?'<button class="rpGo sp" data-rp="spec">⭐ งานพิเศษ</button>':'')+'</div>';
 }
 box.hidden=false;
}

/* ------------------------------ Active work ------------------------------ */
function interact(force){
 // ถูกเรียกจาก A.talk() (ปุ่ม E / ปุ่มโต้ตอบ) — คืน true ถ้าใช้ปุ่มนี้ไปแล้ว
 if(working)return true;
 if(typeof S==='undefined'||!S||blockers())return false;
 const ps=promptState();if(!ps)return false;
 if(!force){                                 // ถ้าพนักงานอยู่ชิดตัวมากกว่า ให้ปุ่ม E เป็น “คุย” ตามเดิม
  const p=S.pl;let emp=false;try{emp=S.emp.some(e=>e.st!=='home'&&Math.hypot(e.x-p.x,e.y-p.y)<34)}catch(e){}
  if(emp)return false;
 }
 startWork(ps,false);return true;
}
function startWork(ps,special){
 const r=R();
 if(working)return;
 if(S.paused){toastX('เกมหยุดชั่วคราว');return}
 if(!ps.can){toastX(ps.status);return}
 if(special&&!(r.skills.o5>0)){toastX('ต้องปลดล็อกสกิล “งานพิเศษ” ก่อน');return}
 const gl=eligible(ps.f);if(!gl.length){toastX('ยังไม่มีโปรเจกต์ที่ต้องใช้งานประเภทนี้');return}
 const g=gl[Math.floor(Math.random()*gl.length)],sk=GAME[g].sk,proj=pickProj(sk);
 if(!proj){toastX('ไม่มีโปรเจกต์ที่ต้องการงานประเภทนี้');return}
 const p=S.pl,cx=ps.f.x*32+16,cy=ps.f.y*32+16,dx=cx-p.x,dy=cy-p.y;
 p.mv=false;try{clearPlayerInput()}catch(e){}
 p.d=Math.abs(dx)>=Math.abs(dy)?(dx<0?1:3):(dy<0?2:0);       // หันหน้าเข้าหาสถานี (ไม่แตะระบบเดินเดิม)
 working={ph:'intro',t:0,f:ps.f,fid:ps.f.id,g,sk,projId:proj.id,special:!!special,diff:diffOf(proj)+(special?1:0),
  pose:GAME[g].pose,len:GAME[g].t-(special?0:0)+(r.level>=40?2:0)-(special?2:0),left:0,res:null,gs:null};
 working.left=Math.max(5,working.len);
 $('rpPrompt').hidden=true;
}
function diffOf(p){const rw=p.reward||0;return rw<1500?1:rw<5000?2:rw<15000?3:4}
function endWorkUI(){const m=$('ceoWork');if(m)m.hidden=true;working=null;promptKey=''}
function abortWork(msg){if(!working)return;if(msg)toastX(msg);endWorkUI()}

/* ---- mini-game engine (DOM) ---- */
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const HEX='0123456789ABCDEF'.split('');
function mgBegin(){
 const w=working,m=$('ceoWork'),gm=GAME[w.g],proj=S.projects.find(p=>p.id===w.projId);
 w.ph='play';m.hidden=false;
 $('rwHead').innerHTML='<span class="rwIc">'+gm.ic+'</span><div><b>'+gm.n+(w.special?' · ⭐ SPECIAL':'')+'</b><small>'+gm.th+' · '+(proj?esc(proj.n)+' ('+w.sk+' '+pct(proj,w.sk)+'%)':'')+'</small></div>';
 $('rwFoot').innerHTML='<small>กด Esc เพื่อยกเลิก (ไม่ได้รางวัล)</small>';
 $('rwRes').hidden=true;$('rwBody').hidden=false;$('rwBar').hidden=false;
 const G={};w.gs=G;G.miss=0;
 const body=$('rwBody');
 if(w.g==='entry'){
  const n=w.special?8:6;G.seq=Array.from({length:n},()=>HEX[rnd(0,15)]);G.i=0;
  entryRender();
 }else if(w.g==='review'){
  const n=6;G.docs=[];const want=rnd(2,4);const flags=shuffle(Array.from({length:n},(_,i)=>i<want));
  for(let i=0;i<n;i++){const a=rnd(2,9),b=rnd(2,9),ok=flags[i];let c=a*b;if(!ok){c+=([-10,-1,1,2,10,-2][rnd(0,5)]);if(c===a*b)c+=3}G.docs.push({a,b,c,ok,pick:false})}
  reviewRender();
 }else if(w.g==='design'){
  const cols=['🟥','🟦','🟩','🟨','🟪','🟧'].slice(0,w.special?6:5);G.target=shuffle(cols);G.cur=shuffle(cols);
  let tries=0;while(G.cur.every((c,i)=>c===G.target[i])&&tries++<20)G.cur=shuffle(cols);G.sel=-1;G.swaps=0;designRender();
 }else if(w.g==='market'){
  const SC=[
   {p:'แอปออกกำลังกายสำหรับวัยรุ่น',c:['วัยรุ่น','ผู้สูงอายุ','นักบัญชี','ผู้บริหาร'],ci:0,h:['TikTok','LinkedIn','จดหมายราชการ','วิทยุ AM'],hi:0},
   {p:'ซอฟต์แวร์บัญชีสำหรับองค์กร',c:['เด็กประถม','เจ้าของธุรกิจ SME','แฟนคลับศิลปิน','นักท่องเที่ยว'],ci:1,h:['LinkedIn','เกมมือถือ','ป้ายโฆษณาริมทะเล','สติกเกอร์ไลน์'],hi:0},
   {p:'คอร์สออนไลน์เรียนภาษา',c:['นักศึกษา/คนทำงาน','ผู้ป่วยในโรงพยาบาล','ชาวประมง','เด็กอนุบาล'],ci:0,h:['Facebook / YouTube','ใบปลิวใต้ประตู','โทรทัศน์ยุค 90','หนังสือพิมพ์เก่า'],hi:0},
   {p:'เครื่องเล่นเกมรุ่นใหม่',c:['นักเล่นเกม','คุณยายวัย 80','เจ้าหน้าที่บัญชี','ครูใหญ่'],ci:0,h:['Twitch / Discord','งานประจำปีชุมชน','รายการเพลงลูกทุ่ง','ป้ายหน้าธนาคาร'],hi:0},
   {p:'บริการทำความสะอาดคอนโด',c:['คนทำงานในเมือง','ชาวสวน','นักเรียนอนุบาล','ผู้เกษียณอายุ'],ci:0,h:['Line OA / Facebook','ประกาศเสียงตามสาย','โปสเตอร์งานชุมชน','วิทยุชุมชน'],hi:0}];
  const s=SC[rnd(0,SC.length-1)];G.s=s;G.cus=shuffle(s.c.map((t,i)=>({t,ok:i===s.ci})));G.ch=shuffle(s.h.map((t,i)=>({t,ok:i===s.hi})));G.step=0;G.ok=0;marketRender();
 }else if(w.g==='pm'){
  const names=['แก้ระบบล่ม','ส่งงานลูกค้า VIP','ประชุมทีม','จัดโต๊ะทำงาน','ตอบอีเมลทั่วไป','เตรียมสไลด์','ทำบัญชีรายเดือน','อัปเดตเว็บไซต์'];
  const dls=shuffle([1,2,3,4,5]).slice(0,w.special?5:4),nm=shuffle(names);
  G.tasks=dls.map((d,i)=>({n:nm[i],dl:d,v:rnd(1,3)*500,done:0}));G.order=G.tasks.slice().sort((a,b)=>a.dl-b.dl||b.v-a.v);G.i=0;pmRender();
 }
}
function entryRender(){
 const G=working.gs;
 $('rwBody').innerHTML='<p class="rwP">กดตัวอักษรให้ตรงลำดับ (คีย์บอร์ดหรือแตะปุ่ม)</p><div class="rwSeq">'+G.seq.map((c,i)=>'<span class="'+(i<G.i?'ok':i===G.i?'cur':'')+'">'+c+'</span>').join('')+'</div><div class="rwPad">'+HEX.map(c=>'<button data-g="k" data-v="'+c+'">'+c+'</button>').join('')+'</div>';
}
function entryKey(c){
 const G=working.gs;c=c.toUpperCase();if(!HEX.includes(c))return;
 if(c===G.seq[G.i]){G.i++;if(G.i>=G.seq.length){mgEnd(1,G.miss)}else entryRender()}
 else{G.miss++;const s=$('rwBody').querySelector('.cur');if(s){s.classList.add('bad');setTimeout(()=>s.classList.remove('bad'),180)}}
}
function reviewRender(){
 const G=working.gs;
 $('rwBody').innerHTML='<p class="rwP">แตะเอกสารที่ <b>ตัวเลขถูกต้อง</b> แล้วกด “ยืนยัน”</p><div class="rwDocs">'+G.docs.map((d,i)=>'<button class="rwDoc'+(d.pick?' pick':'')+'" data-g="d" data-v="'+i+'"><small>ใบแจ้งหนี้ #'+(100+i)+'</small><b>'+d.a+' × '+d.b+' = '+d.c+'</b></button>').join('')+'</div><div class="rwAct"><button class="rwBtn" data-g="rv">ยืนยัน ✔</button></div>';
}
function reviewDone(){
 const G=working.gs;let tp=0,fp=0,fn=0,okN=0;
 G.docs.forEach(d=>{if(d.ok)okN++;if(d.ok&&d.pick)tp++;else if(!d.ok&&d.pick)fp++;else if(d.ok&&!d.pick)fn++});
 mgEnd(Math.max(0,(tp-fp)/okN),fp+fn);
}
function designRender(){
 const G=working.gs;
 $('rwBody').innerHTML='<p class="rwP">สลับตำแหน่งให้ตรงกับ “ตัวอย่าง” (แตะ 2 ช่องเพื่อสลับ)</p><div class="rwRowL">ตัวอย่าง</div><div class="rwTiles tgt">'+G.target.map(c=>'<span>'+c+'</span>').join('')+'</div><div class="rwRowL">ของคุณ</div><div class="rwTiles">'+G.cur.map((c,i)=>'<button data-g="t" data-v="'+i+'" class="'+(i===G.sel?'sel':(c===G.target[i]?'ok':''))+'">'+c+'</button>').join('')+'</div>';
}
function designClick(i){
 const G=working.gs;
 if(G.sel<0){G.sel=i}else if(G.sel===i){G.sel=-1}
 else{const a=G.sel;[G.cur[a],G.cur[i]]=[G.cur[i],G.cur[a]];G.sel=-1;G.swaps++;
  if(G.cur.every((c,k)=>c===G.target[k])){designRender();return mgEnd(1,Math.max(0,G.swaps-(G.cur.length-1)))}}
 designRender();
}
function marketRender(){
 const G=working.gs;
 if(G.step===0)$('rwBody').innerHTML='<p class="rwP">สินค้า: <b>'+esc(G.s.p)+'</b></p><div class="rwRowL">① เลือกกลุ่มลูกค้าเป้าหมาย</div><div class="rwOpts">'+G.cus.map((o,i)=>'<button data-g="m0" data-v="'+i+'">'+esc(o.t)+'</button>').join('')+'</div>';
 else $('rwBody').innerHTML='<p class="rwP">สินค้า: <b>'+esc(G.s.p)+'</b></p><div class="rwRowL">② เลือกช่องทางแคมเปญ</div><div class="rwOpts">'+G.ch.map((o,i)=>'<button data-g="m1" data-v="'+i+'">'+esc(o.t)+'</button>').join('')+'</div>';
}
function pmRender(){
 const G=working.gs;
 $('rwBody').innerHTML='<p class="rwP">แตะงานตามลำดับความสำคัญ: <b>กำหนดส่งใกล้สุดก่อน</b> (เท่ากัน → มูลค่าสูงกว่าก่อน)</p><div class="rwTasks">'+G.tasks.map((t,i)=>'<button class="'+(t.done?'dn':'')+'" data-g="p" data-v="'+i+'"><b>'+(t.done?'#'+t.done:'')+'</b><span>'+esc(t.n)+'</span><small>เหลือ '+t.dl+' วัน · $'+t.v+'</small></button>').join('')+'</div>';
}
function mgClick(kind,v){
 const w=working;if(!w||w.ph!=='play')return;const G=w.gs;
 if(kind==='k')entryKey(v);
 else if(kind==='d'){const d=G.docs[+v];if(d){d.pick=!d.pick;reviewRender()}}
 else if(kind==='rv')reviewDone();
 else if(kind==='t')designClick(+v);
 else if(kind==='m0'){G.ok+=G.cus[+v].ok?1:0;if(!G.cus[+v].ok)G.miss++;G.step=1;marketRender()}
 else if(kind==='m1'){G.ok+=G.ch[+v].ok?1:0;if(!G.ch[+v].ok)G.miss++;mgEnd(G.ok/2,G.miss)}
 else if(kind==='p'){const t=G.tasks[+v];if(!t||t.done)return;
  if(t===G.order[G.i]){G.i++;t.done=G.i;if(G.i>=G.order.length){pmRender();mgEnd(1,G.miss)}else pmRender()}else G.miss++}
}
function gradeOf(score,miss,timeFrac){
 if(score>=.999){if(miss<=1&&timeFrac>=.3)return'perfect';if(miss<=3)return'good';return'normal'}
 if(score>=.5)return'normal';return'fail';
}
function mgEnd(score,miss){
 const w=working;if(!w||w.ph!=='play')return;
 const tf=Math.max(0,w.left/w.len);
 w.ph='res';w.res=reward(gradeOf(score,miss,tf),score,miss);
}

/* ---- reward + Process contribution ---- */
function reward(gr,score,miss){
 const r=R(),w=working,G=GRADE[gr];
 const proj=S.projects.find(p=>p.id===w.projId)||pickProj(w.sk);     // ถ้าโปรเจกต์เดิมหายไปแล้ว เลือกโปรเจกต์อื่นที่ต้องใช้สกิลเดียวกัน
 // โบนัสสกิล (บวกรวมกัน แล้วคูณกับ Contribution ของ CEO เท่านั้น ไม่คูณทั้งบริษัท)
 let sb=bonus('ceoSpd')+bonus('assist');
 if(w.sk==='M')sb+=bonus('mktEff');
 let gm=G.m*(1+bonus('mini'));if(gr==='fail')gm=G.m;
 if(w.special)gm*=1+bonus('special');
 const base=(2.5+1.5*w.diff);                                        // หน่วย Process พื้นฐาน (≈ งาน NPC 25–60 นาที)
 let units=base*gm*(1+sb);
 // ป้องกันซ้ำซ้อน/เกิน 100% และไม่ให้ CEO แย่งงานจน NPC ไร้บทบาท
 let add=0,share=0,projName='';
 if(proj&&proj.need[w.sk]){
  const k=w.sk,need=proj.need[k],left=need-proj.done[k];
  proj.cc=proj.cc||{};const cur=proj.cc[k]||0,capShare=Math.max(0,need*ccCap(k)-cur);
  add=Math.max(0,Math.min(units,left,capShare));
  if(add>0){proj.done[k]=Math.min(need,proj.done[k]+add);proj.cc[k]=cur+add}
  share=Math.round(add/need*1000)/10;projName=proj.n;
  r.collabUntil=Math.max(r.collabUntil,nowT()+60);
 }
 // EXP
 const d=r.dayN;if(d.d!==S.day){d.d=S.day;d.n=0}
 const dayF=d.n<8?1:d.n<14?.5:.2;d.n++;                              // ยิ่งทำซ้ำในวันเดียวกันยิ่งได้ EXP น้อยลง (กันฟาร์ม)
 let xp=(16+12*w.diff)*G.m*(1+bonus('xpB'))*dayF;
 if(w.special)xp*=1.25+bonus('special')*.5;
 xp=Math.max(1,Math.round(xp));
 const cdm=Math.round(CD_MIN*(1-bonus('cdCut')));
 r.cd[w.fid]=nowT()+cdm;
 // สถิติ
 r.st.works++;try{window.RIM&&RIM.onWork()}catch(_e){}if(gr==='perfect')r.st.perfect++;if(gr==='good')r.st.good++;if(w.special)r.st.special++;if(w.sk==='M')r.st.mktJobs++;
 if(gr==='perfect'||gr==='good'){r.st.streak++;r.st.bestStreak=Math.max(r.st.bestStreak,r.st.streak)}else r.st.streak=0;
 r.hist.push({d:S.day,t:Math.floor(S.t),g:w.g,gr,xp,u:Math.round(add*10)/10,p:projName,sp:w.special?1:0});
 if(r.hist.length>60)r.hist=r.hist.slice(-60);
 const lv=addXP(xp,'work');
 checkAch();
 fx.push({x:S.pl.x,y:S.pl.y-52,txt:'+'+xp+' EXP',t:0,col:'#ffd45a'});
 if(add>0)fx.push({x:S.pl.x+22,y:S.pl.y-34,txt:'+'+(Math.round(add*10)/10)+' '+w.sk,t:-.25,col:'#7fe3ff'});
 try{save(1)}catch(e){}
 return{gr,xp,add:Math.round(add*10)/10,share,projName,sb,lv,score,miss,cd:cdm,sk:w.sk,dayF};
}
function showResult(){
 const w=working,res=w.res,G=GRADE[res.gr];
 $('rwBody').hidden=true;$('rwBar').hidden=true;
 const lv=res.lv&&res.lv.levels>0?'<div class="rwLv">⬆ LEVEL UP! Lv.'+res.lv.from+' → Lv.'+R().level+'</div>':'';
 $('rwRes').innerHTML='<div class="rwGrade" style="color:'+G.col+'">'+G.n+'</div><div class="rwGth">'+G.th+' · โบนัส '+Math.round(G.m*100)+'%</div>'+
  '<div class="rwRows"><div><span>EXP</span><b>+'+res.xp+'</b></div><div><span>Process ('+res.sk+')</span><b>'+(res.add>0?'+'+res.add+' หน่วย ('+res.share+'% ของโปรเจกต์)':'— CEO ช่วยโปรเจกต์นี้ได้สูงสุด '+Math.round(ccCap(res.sk)*100)+'% ที่เหลือให้พนักงานทำ')+'</b></div>'+
  '<div><span>โบนัสสกิล CEO</span><b>+'+Math.round(res.sb*100)+'%</b></div><div><span>พักสถานี</span><b>'+res.cd+' นาทีเกม</b></div></div>'+
  (res.projName?'<small>โปรเจกต์: '+esc(res.projName)+' · NPC ยังทำงานต่อตามปกติ</small>':'')+lv+
  '<div class="rwAct"><button class="rwBtn" data-g="close">ตกลง</button></div>';
 $('rwRes').hidden=false;$('rwFoot').innerHTML='';
}

/* ------------------------------ Level-up banner ------------------------------ */
function levelUpFx(sum){
 const b=$('rpLvl');if(!b)return;
 const r=R();
 const pts=Object.keys(sum.pts).map(k=>'+'+sum.pts[k]+' '+(k==='SP'?'Skill Point':'Mastery Point')).join(' · ');
 b.innerHTML='<div class="rpLvT">LEVEL UP!</div><div class="rpLvN">Lv.'+(sum.levels>1?sum.from+' → '+r.level:r.level)+'</div><div class="rpLvP">'+pts+'</div>'+sum.lines.slice(0,4).map(l=>'<div class="rpLvL">'+esc(l)+'</div>').join('');
 b.hidden=false;b.classList.remove('go');void b.offsetWidth;b.classList.add('go');
 clearTimeout(levelUpFx.t);levelUpFx.t=setTimeout(()=>{b.hidden=true},3200);
 fx.push({x:S.pl.x,y:S.pl.y-64,txt:'LEVEL UP!',t:0,col:'#fff1a8',big:1});
}

/* ------------------------------ World-space effects (canvas) ------------------------------ */
function drawFx(g,t){
 try{
  if(typeof S==='undefined'||!S||!S.pl)return;
  const p=S.pl;
  if(working){
   const bob=Math.sin(t*6)*2,ic=working.pose;
   g.save();g.font='15px sans-serif';g.textAlign='center';g.textBaseline='middle';
   g.fillStyle='rgba(20,18,40,.85)';g.beginPath();g.arc(p.x,p.y-60+bob,11,0,7);g.fill();g.strokeStyle='#ffd45a';g.lineWidth=1.5;g.stroke();
   g.fillStyle='#fff';g.fillText(ic,p.x,p.y-59+bob);
   if(working.ph==='play'||working.ph==='intro'){for(let i=0;i<3;i++){const a=(t*3+i*2.1)%6.28;g.fillStyle='rgba(255,230,120,'+(.5+.4*Math.sin(a))+')';g.fillRect(p.x-12+i*12+Math.sin(a)*2,p.y-76-((t*18+i*6)%10),2,2)}}
   g.restore();
  }
  if(fx.length){
   g.save();g.textAlign='center';g.textBaseline='middle';
   for(let i=fx.length-1;i>=0;i--){
    const f=fx[i];if(f.t<0)continue;const k=f.t/(f.big?2.2:1.6);if(k>=1){fx.splice(i,1);continue}
    g.globalAlpha=Math.min(1,(1-k)*2);g.font=(f.big?'bold 15px':'bold 11px')+' monospace';
    const y=f.y-k*(f.big?26:20);g.lineWidth=3;g.strokeStyle='#1a1330';g.strokeText(f.txt,f.x,y);g.fillStyle=f.col;g.fillText(f.txt,f.x,y);
   }
   g.restore();
  }
 }catch(e){}
}

/* ------------------------------ Per-frame tick (เรียกจาก frame() เดิม) ------------------------------ */
let fc=0,lastUp=0;
function tick(d0,dm){
 try{
  if(typeof S==='undefined'||!S)return;
  fc++;
  for(const f of fx)f.t+=d0;
  if(fc%12===1){npcCache.v=npcMulCalc()}
  // m3: NPC ที่ไม่มีงานค้างได้ EXP ฝึกงานเพิ่ม
  if(dm>0&&!S.over){const idl=bonus('idle');if(idl>0&&S.projects&&!S.projects.some(p=>Object.keys(p.need).some(k=>p.done[k]<p.need[k]-.01))){S.emp.forEach(e=>{if(e.st==='work'&&!e.tr&&isFinite(e.exp))e.exp+=dm*.05*idl})}}
  if(working){
   const w=working;
   if($('evModal')||S.over||(typeof CUT!=='undefined'&&CUT.on)||(window.GHOST&&GHOST.freezePlayer&&GHOST.freezePlayer())){abortWork('งานถูกยกเลิก');return}
   w.t+=d0;
   if(w.ph==='intro'){if(w.t>=.7){w.t=0;mgBegin()}}
   else if(w.ph==='play'){
    w.left-=d0;const bar=$('rwBarFill');if(bar)bar.style.width=Math.max(0,w.left/w.len*100)+'%';
    const tl=$('rwTime');if(tl)tl.textContent=Math.max(0,w.left).toFixed(1)+'s';
    if(w.left<=0){
     const G=w.gs;
     if(w.g==='entry')mgEnd(G.i/G.seq.length,G.miss);
     else if(w.g==='review')reviewDone();
     else if(w.g==='design'){let ok=0;G.cur.forEach((c,i)=>{if(c===G.target[i])ok++});mgEnd(ok/G.cur.length,G.miss+Math.max(0,G.swaps-(G.cur.length-1)))}
     else if(w.g==='market')mgEnd(G.ok/2,G.miss+(G.step===0?1:0));
     else if(w.g==='pm')mgEnd(G.i/G.order.length,G.miss);
    }
   }else if(w.ph==='res'){if(!w.shown){w.shown=1;showResult()}}
  }
  if(fc%4===0)updPrompt();
 }catch(e){console.error('[ceorpg] tick',e)}
}

/* ------------------------------ Hooks เข้าระบบเดิม ------------------------------ */
function onDone(p){            // เรียกจาก doneChk() ตอนโปรเจกต์เสร็จ (คืนเงิน/ชื่อเสียงเพิ่มเฉพาะส่วนโบนัส)
 try{
  const r=R();let pc=bonus('projInc');
  if(p.need&&p.need.M)pc+=bonus('mktBon');
  if(p.left>=2)pc+=bonus('ret');
  pc=Math.min(.9,pc);
  const extra=Math.round((p.reward||0)*pc);
  if(extra>0){S.money+=extra;S.today.inc+=extra;S.tot.earn+=extra;log('โบนัส CEO จาก '+p.n+' +$'+extra)}
  const baseRep=3+(typeof lvl==='function'?lvl():1)*2,rb=bonus('rep');
  if(rb>0){r.repFrac+=baseRep*rb;const add=Math.floor(r.repFrac);if(add>0){r.repFrac-=add;S.rep+=add}}
  if(p.cc&&Object.keys(p.cc).some(k=>p.cc[k]>0)){          // CEO ช่วยทำโปรเจกต์นี้
   r.st.assist++;
   const xp=Math.round(10+Math.sqrt(p.reward||0)/3*(1+bonus('xpB')));
   addXP(xp,'deliver');toastX('🤝 ส่งมอบโปรเจกต์ที่ CEO ช่วยทำ · +'+xp+' EXP');
   r.hist.push({d:S.day,t:Math.floor(S.t),g:'deliver',gr:'normal',xp,u:0,p:p.n,sp:0});if(r.hist.length>60)r.hist=r.hist.slice(-60);
   checkAch();
  }
 }catch(e){console.error('[ceorpg] onDone',e)}
}
function endDay(sl,rt){
 try{
  const r=R();
  const c=bonus('cost');if(c>0)S.money+=Math.round((sl+rt)*c);
  const f=bonus('fin');if(f>0&&S.money>0)S.money+=Math.min(300,Math.round(S.money*f));
  const n=bonus('newCl');
  if(n>0&&Math.random()<n&&S.board&&S.board.length<8&&typeof gen==='function')S.board.push(gen());
  r.dayN.d=S.day+1;r.dayN.n=0;                                       // วันใหม่ รีเซ็ตเพดาน EXP รายวัน
 }catch(e){console.error('[ceorpg] endDay',e)}
}

/* ------------------------------ CEO PROFILE UI ------------------------------ */
let tabId='ov',brId='ops',pp=0;
const profOpen=()=>{const m=$('ceoProf');return !!m&&!m.hidden};
function open(t){
 if(typeof S==='undefined'||!S)return;
 const m=$('ceoProf');if(!m)return;
 if(working)return;
 try{if(typeof UI!=='undefined'&&!$('menu').hidden)UI.menu(0)}catch(e){}
 if(t)tabId=t;
 if(m.hidden){pp=S.paused?1:0;S.paused=1;try{clearPlayerInput()}catch(e){}}
 m.hidden=false;renderProf();
}
function close(){
 const m=$('ceoProf');if(!m||m.hidden)return;
 m.hidden=true;
 if(!$('evModal')&&!(typeof OS!=='undefined'&&OS.on))S.paused=pp;
}
function portrait(){
 const c=$('rpPort');if(!c||c.tagName==='IMG')return;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,c.width,c.height);
 try{if(CEOI.complete&&CEOI.naturalWidth){{const _a=CEO_CW()/CEO_CH(),_h=c.height,_w=_h*_a;CEOIMG(g,0,0,(c.width-_w)/2,0,_w,_h)}}}catch(e){}
}
function effRows(){
 const r=R(),rows=[];
 const P=(k,l,ic)=>rows.push([ic,l,'+'+(bonus(k)*100).toFixed(k==='fin'?2:0)+'%']);
 P('ceoSpd','ความเร็วทำงาน CEO','⚡');P('assist','ช่วยโปรเจกต์','🤝');P('mini','โบนัสมินิเกม','🎯');
 rows.push(['⏱️','ลดเวลาพักสถานี','−'+Math.round(bonus('cdCut')*100)+'%']);
 P('npcSpd','ความเร็ว NPC','👥');P('team','ทีมเวิร์ก (≥2 คน)','🧩');P('dept','บริหารแผนก (≥3 คน)','🏢');P('collab','งานร่วมกัน (ชั่วคราว)','🔗');
 P('projInc','รายได้โปรเจกต์','💵');rows.push(['🧾','ลดรายจ่ายรายวัน','−'+(bonus('cost')*100).toFixed(0)+'%']);P('ret','ส่งงานก่อนกำหนด','📊');
 P('rep','ชื่อเสียงจากงาน','🌟');P('newCl','โอกาสงานใหม่','🧲');P('mktEff','งานการตลาด CEO','📢');P('mktBon','โปรเจกต์การตลาด','🏆');
 if(bonus('xpB')>0)P('xpB','EXP ที่ได้รับ','🧠');
 return rows;
}
function sideHTML(){
 const r=R(),need=reqXP(r.level),p=Math.min(100,r.xp/need*100);
 return '<img id="rpPort" alt="CEO" src="'+CEOP+'" style="object-fit:cover;object-position:top"><div class="rpName">'+String(S.ceo||'CEO').replace(/[&<>"]/g,'')+' (คุณ)</div><div class="rpLv">Lv. '+fmtN(r.level)+'</div>'+
  '<div class="rpXB"><i style="width:'+p.toFixed(1)+'%"></i></div><div class="rpXT">EXP '+fmtN(r.xp)+' / '+fmtN(need)+'</div>'+
  '<div class="rpPts"><span title="Skill Points">💠 SP <b>'+fmtN(r.sp)+'</b></span><span title="Mastery Points">🔷 MP <b>'+fmtN(r.mp)+'</b></span></div>';
}
function renderProf(){
 const m=$('ceoProf');if(!m||m.hidden)return;
 const r=R();
 $('rpSide').innerHTML=sideHTML();portrait();
 $('rpSP').textContent=fmtN(r.sp);$('rpSPl').textContent=allMaxed()?'MP':'SP';
 if(allMaxed())$('rpSP').textContent=fmtN(r.mp);
 document.querySelectorAll('#rpTabs [data-rp-tab]').forEach(b=>b.classList.toggle('on',b.dataset.rpTab===tabId));
 const v=$('rpView');
 if(tabId==='ov')v.innerHTML=ovHTML();
 else if(tabId==='sk')v.innerHTML=skHTML();
 else if(tabId==='wh')v.innerHTML=whHTML();
 else if(tabId==='ac')v.innerHTML=acHTML();
 else v.innerHTML=msHTML();
}
function ovHTML(){
 const r=R(),need=reqXP(r.level);
 let h='<div class="rpGrid2"><div class="rpBox"><h4>📊 ค่าสถานะ CEO / โบนัสจาก Skill Tree</h4><div class="rpStat">'+effRows().map(x=>'<div><span>'+x[0]+' '+x[1]+'</span><b>'+x[2]+'</b></div>').join('')+'</div></div>';
 h+='<div class="rpBox"><h4>🎁 รางวัลระดับ</h4><div class="rpRw">'+RW.map(x=>'<div class="'+(r.level>=x[0]?'got':'')+'"><b>Lv.'+x[0]+'</b> '+x[1]+' '+x[2]+'<small>'+x[3]+'</small></div>').join('')+'<div class="'+(r.level>=60?'got':'')+'"><b>ทุก 10 เลเวล</b> 🎁 เงิน+ชื่อเสียง (โตแบบ √Lv มีเพดาน)<small>หลัง Lv.50: ทุก 25 เลเวล ได้ความเร็ว CEO ถาวร +1% (สูงสุด +10%)</small></div></div>'+
  '<h4 style="margin-top:8px">📈 สถิติ</h4><div class="rpStat"><div><span>EXP รวม</span><b>'+fmtN(r.total)+'</b></div><div><span>งานที่ทำ</span><b>'+r.st.works+'</b></div><div><span>PERFECT</span><b>'+r.st.perfect+'</b></div><div><span>ส่งมอบที่ CEO ช่วย</span><b>'+r.st.assist+'</b></div><div><span>สกิลที่ MAX</span><b>'+maxedCount()+'/'+SKN+'</b></div></div></div></div>';
 return h;
}
function skHTML(){
 const r=R(),br=BR.find(b=>b.id===brId)||BR[0];
 let h='<div class="rpBr">'+BR.map(b=>'<button data-rp-br="'+b.id+'" class="'+(b.id===brId?'on':'')+'" style="--bc:'+b.col+'"><span>'+b.ic+'</span>'+b.n+'</button>').join('')+'</div><div class="rpSkills">';
 br.skills.forEach(s=>{
  const cur=r.skills[s.id]||0,max=cur>=MAXRANK,nx=cur+1;
  const need=max?0:skMinLv(s,nx),cost=max?0:skCost(s,nx);
  const lvOk=r.level>=need,spOk=r.sp>=cost;
  const fmt=v=>(v*100).toFixed(s.dec||0)+'%';
  const now=s.per*cur,after=s.per*nx;
  let btn,why='';
  if(max)btn='<button class="rpUp max" disabled>MAX</button>';
  else if(allMaxed())btn='<button class="rpUp" disabled>—</button>';
  else if(!lvOk){btn='<button class="rpUp lock" disabled>🔒 Lv.'+need+'</button>';why='ต้องการ CEO Lv.'+need+' เพื่ออัปเกรด Rank '+nx}
  else if(!spOk){btn='<button class="rpUp" disabled>อัปเกรด</button>';why='Skill Point ไม่พอ'}
  else btn='<button class="rpUp" data-rp-buy="'+s.id+'">อัปเกรด</button>';
  const eff=s.key==='special'?(cur?'ปลดล็อกงานพิเศษแล้ว · รางวัลงานพิเศษ +'+fmt(now):'ยังไม่ปลดล็อกงานพิเศษ'):('ตอนนี้ +'+fmt(now));
  const effN=max?'':(s.key==='special'?'Rank '+nx+': รางวัลงานพิเศษ +'+fmt(after):'อัปเกรดแล้ว: +'+fmt(after)+' (+'+fmt(s.per)+')');
  h+='<div class="rpSk'+(!lvOk&&!max?' locked':'')+'" style="--bc:'+br.col+'"><div class="rpSkI"><span>'+(lvOk||max?s.ic:'🔒')+'</span><i>Lv. '+cur+' / '+MAXRANK+'</i></div>'+
   '<div class="rpSkM"><b>'+s.n+'</b><p>'+s.d+'</p><p class="eff">'+eff+(effN?' · <em>'+effN+'</em>':'')+'</p><div class="pips">'+Array.from({length:MAXRANK},(_,i)=>'<u class="'+(i<cur?'on':'')+'"></u>').join('')+'</div>'+(why?'<small class="why">'+why+'</small>':'')+'</div>'+
   '<div class="rpSkR"><span class="cost">'+(max?'':'💠 SP '+cost)+'</span>'+btn+'</div></div>';
 });
 h+='</div>';
 if(allMaxed())h+='<p class="rpNote">🌟 Skill Tree ครบทั้งหมดแล้ว — แต้มใหม่จะเป็น Mastery Point (แท็บ MASTERY)</p>';
 return h;
}
function whHTML(){
 const r=R();
 if(!r.hist.length)return '<div class="rpBox"><p class="rpEmpty">ยังไม่มีประวัติการทำงาน · เดินไปที่โต๊ะคอม ตู้เอกสาร หรือโต๊ะประชุม แล้วกด INTERACT</p></div>';
 return '<div class="rpBox"><h4>📜 งานล่าสุด ('+r.hist.length+' รายการ · เก็บสูงสุด 60)</h4><div class="rpHist">'+r.hist.slice().reverse().map(h=>{
  const g=GAME[h.g],gr=GRADE[h.gr]||GRADE.normal;
  return '<div><span>วัน '+h.d+' · '+String(Math.floor(h.t/60)).padStart(2,'0')+':'+String(h.t%60).padStart(2,'0')+'</span><b>'+(g?g.ic+' '+g.n:'🤝 ส่งมอบโปรเจกต์')+(h.sp?' ⭐':'')+'</b><em style="color:'+gr.col+'">'+(g?gr.n:'DELIVERED')+'</em><span>'+esc(h.p||'-')+'</span><b>+'+h.xp+' EXP'+(h.u?' · +'+h.u+' P':'')+'</b></div>';
 }).join('')+'</div></div>';
}
function acHTML(){
 const r=R();let n=0;ACH.forEach(a=>{if(r.ach[a[0]])n++});
 return '<div class="rpBox"><h4>🏆 ความสำเร็จ '+n+' / '+ACH.length+'</h4><div class="rpAch">'+ACH.map(a=>{const ok=!!r.ach[a[0]];return '<div class="'+(ok?'got':'')+'"><span>'+(ok?a[1]:'🔒')+'</span><b>'+a[2]+'</b><small>'+a[3]+'</small></div>'}).join('')+'</div></div>';
}
function msHTML(){
 const r=R(),ok=allMaxed();
 let h='';
 if(!ok){h+='<div class="rpBox"><h4>🔷 MASTERY (ปลดล็อกเมื่อ Skill Tree ครบ)</h4><p class="rpEmpty">ความคืบหน้า: สกิลที่ MAX แล้ว '+maxedCount()+' / '+SKN+'<br>เมื่อครบทุกสกิล แต้มที่ได้ต่อจากนั้นจะกลายเป็น Mastery Point สำหรับอัปเกรดต่อเนื่อง ผลตอบแทนลดหลั่นและมีเพดานโบนัส</p><div class="rpXB big"><i style="width:'+(maxedCount()/SKN*100).toFixed(1)+'%"></i></div></div>';return h}
 h+='<p class="rpNote">🔷 Mastery Point: <b>'+fmtN(r.mp)+'</b> · ผลลัพธ์ = เพดาน × (1 − 0.92^Rank) ยิ่งสูงยิ่งได้เพิ่มน้อยลง</p><div class="rpSkills">';
 MS.forEach(m=>{
  const cur=r.mastery[m.id]||0,cost=msCost(cur),can=r.mp>=cost;
  const now=msVal(m,cur),nx=msVal(m,cur+1);
  h+='<div class="rpSk" style="--bc:#7aa2ff"><div class="rpSkI"><span>'+m.ic+'</span><i>Rank '+cur+'</i></div><div class="rpSkM"><b>'+m.n+'</b><p>'+m.d+'</p><p class="eff">ตอนนี้ +'+(now*100).toFixed(1)+'% · เพดาน +'+(m.cap*100).toFixed(0)+'% · <em>ถัดไป +'+(nx*100).toFixed(1)+'%</em></p><div class="rpXB"><i style="width:'+(now/m.cap*100).toFixed(1)+'%"></i></div></div><div class="rpSkR"><span class="cost">🔷 MP '+cost+'</span><button class="rpUp" '+(can?'data-rp-ms="'+m.id+'"':'disabled')+'>อัปเกรด</button></div></div>';
 });
 return h+'</div>';
}

/* ------------------------------ Events (ผูกครั้งเดียว) ------------------------------ */
let bound=false;
function bind(){
 if(bound)return;bound=true;
 // Delegated click: ทั้งโปรไฟล์, พรอมต์สถานี และมินิเกม
 document.addEventListener('click',e=>{
  const t=e.target.closest&&e.target.closest('[data-rp],[data-rp-tab],[data-rp-br],[data-rp-buy],[data-rp-ms],[data-g],[data-rp-close]');
  if(!t)return;
  if(t.dataset.rp==='go'){e.preventDefault();const ps=promptState();if(ps)startWork(ps,false);return}
  if(t.dataset.rp==='spec'){e.preventDefault();const ps=promptState();if(ps)startWork(ps,true);return}
  if(t.dataset.rpTab){tabId=t.dataset.rpTab;renderProf();return}
  if(t.dataset.rpBr){brId=t.dataset.rpBr;renderProf();return}
  if(t.dataset.rpBuy){const x=buy(t.dataset.rpBuy);toastX(x.ok?'✅ '+x.msg:'❌ '+x.msg);renderProf();chip();return}
  if(t.dataset.rpMs){const x=buyMastery(t.dataset.rpMs);toastX(x.ok?'✅ '+x.msg:'❌ '+x.msg);renderProf();return}
  if(t.dataset.rpClose!==undefined){close();return}
  if(t.dataset.g){
   if(t.dataset.g==='close'){endWorkUI();return}
   mgClick(t.dataset.g,t.dataset.v);return
  }
 });
 // คีย์บอร์ด: capture เพื่อกันปุ่มซ้อนกับเกมเดิม (เช่น B = เปิดกระเป๋า) ขณะมินิเกมเปิดอยู่
 window.addEventListener('keydown',e=>{
  const k=(e.key||'');
  if(working&&(working.ph==='play'||working.ph==='res'||working.ph==='intro')){
   e.preventDefault();e.stopImmediatePropagation();
   if(k==='Escape'){if(working.ph==='res')endWorkUI();else abortWork('ยกเลิกงาน');return}
   if(working.ph==='res'){if(k==='Enter'||k===' '||k.toLowerCase()==='e')endWorkUI();return}
   if(working.ph==='play'){
    if(working.g==='entry'&&k.length===1)entryKey(k);
    else if(working.g==='review'&&(k==='Enter'||k===' '))reviewDone();
   }
   return;
  }
  if(profOpen()){
   if(k==='Escape'){e.preventDefault();e.stopImmediatePropagation();close()}
  }
 },true);
 // เปิด/ปิดด้วยปุ่ม P (นอกมินิเกม/ฉากอื่น)
 window.addEventListener('keydown',e=>{
  if(e.ctrlKey||e.altKey||e.metaKey)return;
  if(/^(INPUT|SELECT|TEXTAREA)$/.test((e.target||{}).tagName||''))return;
  if((e.key||'').toLowerCase()!=='p')return;
  if(working)return;
  if(profOpen()){close();return}
  if(!blockers()&&!(S&&S.paused))open();
 });
 chip();
}

function dev(){return{R,reqXP,addXP,buy,buyMastery,bonus,allMaxed,SK,BR,MS,GAME,nearStation,promptState,interact,startWork,mgClick,tick,
 get working(){return working},eligible,pickProj,npcMul,npcMulCalc,msVal,msCost,skCost,skMinLv,close,open,gradeOf,
 setLevel(L){const r=R();r.level=Math.max(1,Math.floor(L));r.xp=0;chip()},giveSP(n){R().sp+=n},giveMP(n){R().mp+=n},maxAll(){const r=R();BR.forEach(b=>b.skills.forEach(s=>r.skills[s.id]=MAXRANK))},fx:()=>fx.length,cdLeft}}
return{R,tick,drawFx,npcMul,onDone,endDay,interact,open,close,bind,addXP,reqXP,buy,dev,chip,_t:{ccCap,ccRoom,pickProj}};
})();

window.CEORPG=CEORPG;CEORPG.bind();
