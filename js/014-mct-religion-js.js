
window.REL_ASSETS={"monk": {"sheet": "assets/img/ab518b2a7461.png", "card": "assets/img/d7a157550b36.png", "cw": 96, "ch": 128}, "imam": {"sheet": "assets/img/4dcdc4cd124f.png", "card": "assets/img/3f2f82112b70.png", "cw": 96, "ch": 128}, "priest": {"sheet": "assets/img/4247cd019b35.png", "card": "assets/img/5626b91dbbf6.png", "cw": 96, "ch": 128}};

/* =====================================================================
   REL — Religion & Lifestyle System (v109)
   ส่วนที่ 1: ข้อมูล · สถานะเซฟ · หน้าสร้างตัวละคร/เลือกศาสนา · ปฏิทิน · แจ้งเตือน · เดินทาง
   ใช้ระบบเดิม: Game Clock (S.t/S.day), CAL (ปฏิทิน), CEOScene (รถเมล์สาย 77), save() เดิม
   ===================================================================== */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const okS=()=>{try{return typeof S!=='undefined'&&S&&Number.isFinite(S.day)&&Array.isArray(S.emp)}catch(e){return false}};
const Mf=n=>{try{return typeof M==='function'?M(n):'฿'+Math.round(n).toLocaleString()}catch(e){return '฿'+n}};
const fmtT=m=>{m=Math.max(0,Math.floor(m));return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')};
const di=d=>{d=Math.max(1,d|0);const k=Math.floor((d-1)/30);return{k,yr:Math.floor(k/12)+1,mo:k%12+1,dm:(d-1)%30+1,wd:(d-1)%7}};
const dayOf=(k,dm)=>k*30+dm;
const DAYN=['จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์','อาทิตย์'];

/* ---------------------------------------------------------------- ศาสนา */
const SVG={
 buddhism:'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="none" stroke="#f3c25a" stroke-width="4"/><circle cx="32" cy="32" r="6" fill="#f3c25a"/><g stroke="#f3c25a" stroke-width="3.5" stroke-linecap="round"><path d="M32 10v12M32 42v12M10 32h12M42 32h12M16.5 16.5l8.5 8.5M39 39l8.5 8.5M47.5 16.5L39 25M25 39l-8.5 8.5"/></g><circle cx="32" cy="32" r="29" fill="none" stroke="#f3c25a55" stroke-width="2"/></svg>',
 christianity:'<svg viewBox="0 0 64 64"><rect x="27" y="8" width="10" height="48" rx="2" fill="#f4e6c1"/><rect x="14" y="22" width="36" height="10" rx="2" fill="#f4e6c1"/><rect x="29" y="10" width="6" height="44" fill="#d9b46a"/><rect x="16" y="24" width="32" height="6" fill="#d9b46a"/></svg>',
 islam:'<svg viewBox="0 0 64 64"><defs><mask id="cmk"><rect width="64" height="64" fill="#fff"/><circle cx="40" cy="30" r="18" fill="#000"/></mask></defs><circle cx="30" cy="32" r="23" fill="#f4e6c1" mask="url(#cmk)"/><path d="M46 22l2.4 5 5.4.7-4 3.7 1 5.4-4.8-2.7-4.8 2.7 1-5.4-4-3.7 5.4-.7z" fill="#f3c25a"/></svg>',
 none:'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="none" stroke="#9fb6d8" stroke-width="4"/><path d="M10 32h44M32 10c-12 12-12 32 0 44M32 10c12 12 12 32 0 44" fill="none" stroke="#9fb6d8" stroke-width="3"/></svg>'
};
const RDEF={
 buddhism:{id:'buddhism',en:'BUDDHISM',name:'พุทธ',place:'temple',placeName:'วัดประจำเมือง',clergy:'พระ',color:'#f3a640',
  desc:'ใส่บาตรยามเช้า ทำบุญที่วัด และร่วมวันสำคัญทางพุทธศาสนา',
  bullets:['🙏 ใส่บาตรทุกเช้า 06:30–08:00 หน้าบริษัท','🛕 ทำบุญที่วัดในวันพระ (ขึ้น/แรม 8 และ 15 ค่ำ)','🪔 เวียนเทียนวันมาฆะ วิสาขะ อาสาฬหะ เข้าพรรษา ออกพรรษา']},
 christianity:{id:'christianity',en:'CHRISTIANITY',name:'คริสต์',place:'church',placeName:'โบสถ์ประจำเมือง',clergy:'บาทหลวง',color:'#8fb4ff',
  desc:'ร่วมพิธีวันอาทิตย์ พบบาทหลวง และเทศกาลคริสต์มาส/อีสเตอร์',
  bullets:['⛪ พิธีวันอาทิตย์ 09:00–11:00 ที่โบสถ์','🕯️ พบบาทหลวง คุยกับสมาชิกชุมชน','🎄 ช่วยเตรียมงานคริสต์มาส · 🐣 พิธีอีสเตอร์']},
 islam:{id:'islam',en:'ISLAM',name:'อิสลาม',place:'mosque',placeName:'มัสยิดประจำเมือง',clergy:'อิหม่าม',color:'#6fd3a6',
  desc:'ละหมาดวันศุกร์ เดือนรอมฎอน การแบ่งปันอาหาร และวันอีด',
  bullets:['🕌 ละหมาดวันศุกร์ 12:30–13:30 ที่มัสยิด','🌙 รอมฎอน: อิฟตาร์ร่วมกันและแบ่งปันอาหาร','🎉 วันอีดิ้ลฟิตริ · วันอีดิ้ลอัฎฮา']},
 none:{id:'none',en:'NONE',name:'ไม่มีศาสนา',place:null,placeName:'',clergy:'',color:'#9fb6d8',
  desc:'ไม่มีกิจกรรมศาสนาประจำ แต่ยังร่วมกิจกรรมชุมชนทั่วไปได้',
  bullets:['🧹 อาสาชุมชนวันเสาร์ที่ถนนหน้าบริษัท','🤝 พบปะผู้คนและช่วยเหลือเพื่อนบ้าน','📜 ภารกิจทางสังคมเรื่องราวในชุมชน']}
};
const IDS=['buddhism','christianity','islam','none'];
const PLACES={
 temple:{name:'วัดประจำเมือง',rel:'buddhism',icon:'🛕'},
 church:{name:'โบสถ์ประจำเมือง',rel:'christianity',icon:'⛪'},
 mosque:{name:'มัสยิดประจำเมือง',rel:'islam',icon:'🕌'},
 street:{name:'หน้าบริษัท (ถนนคนเดิน)',rel:'*',icon:'🏙️'}
};

/* ---------------------------------------------------------------- สถานะเซฟ (S.rg) */
const FIELDS={religionId:null,religionLocked:false,religionActivities:{},activityHistory:[],notificationHistory:{},questProgress:{},communityRelationships:{},festivalHistory:{},claimedRewards:{},visitedReligiousScenes:{}};
function R(){
 if(!okS())return null;let r=S.rg;if(!r||typeof r!=='object'||Array.isArray(r))r=S.rg={v:1};
 for(const k in FIELDS){const d=FIELDS[k];if(r[k]===undefined||r[k]===null&&d!==null){r[k]=Array.isArray(d)?[]:(d&&typeof d==='object'?{}:d)}
  else if(Array.isArray(d)&&!Array.isArray(r[k]))r[k]=[];
  else if(d&&typeof d==='object'&&!Array.isArray(d)&&(typeof r[k]!=='object'||Array.isArray(r[k])))r[k]={}}
 if(!Array.isArray(r.souvenirs))r.souvenirs=[];
 if(!IDS.includes(r.religionId))r.religionId=null;
 if(r.religionId==null)r.religionLocked=false;
 return r;
}
const rid=()=>{const r=R();return r?r.religionId:null};
const def=()=>RDEF[rid()]||null;
const saveNow=()=>{try{save(1)}catch(e){}};

/* ---------------------------------------------------------------- ตารางกิจกรรม (ผูกกับปฏิทินในเกม 12 เดือน × 30 วัน)
   หมายเหตุ: ปฏิทินของเกมเป็นปฏิทินสมมติ (เดือนละ 30 วัน, 360 วัน/ปี) จึงกำหนดตารางวันสำคัญไว้ตายตัวตามเดือนจริงโดยประมาณ
   ไม่มีการสุ่ม และคำนวณซ้ำได้ทุกปีในเกม */
const WANPHRA=[8,15,23,30];
function easterDay(yr){const k=(yr-1)*12+3,d0=dayOf(k,9);return d0+((6-((d0-1)%7))+7)%7}
const A=(id,t,icon,s,e,place,o)=>Object.assign({id,title:t,icon,start:s,end:e,place,kind:'weekly',cal:true},o||{});
function actsFor(d,r){
 r=r||rid();const x=di(d),out=[];
 if(r==='buddhism'){
  out.push(A('alms','ใส่บาตรยามเช้า','🙏',390,480,'street',{kind:'daily',cal:false,desc:'พระสงฆ์เดินบิณฑบาตผ่านหน้าบริษัท เดินไปหาแล้วกด E เพื่อใส่บาตร'}));
  const F=[[2,15,'makha','วันมาฆบูชา'],[6,15,'visakha','วันวิสาขบูชา'],[8,15,'asalha','วันอาสาฬหบูชา'],[8,16,'phansa','วันเข้าพรรษา'],[11,15,'okphansa','วันออกพรรษา']];
  const f=F.find(z=>z[0]===x.mo&&z[1]===x.dm);
  if(f)out.push(A(f[2],f[3]+' · เวียนเทียน','🪔',1080,1200,'temple',{kind:'festival',festival:f[2],desc:'ร่วมเวียนเทียนรอบเจดีย์ในยามค่ำ แสงเทียนและเสียงสวดมนต์'}));
  if(WANPHRA.includes(x.dm))out.push(A('wanphra','ทำบุญวันพระ','🛕',480,660,'temple',{kind:'weekly',desc:'ไปวัด ไหว้พระ ทำบุญ ถวายอาหาร และพบพระอาจารย์'}));
 }
 if(r==='christianity'){
  const E=easterDay(x.yr);
  if(d===E)out.push(A('easter','พิธีอีสเตอร์','🐣',480,630,'church',{kind:'festival',festival:'easter',desc:'พิธีเช้าวันอีสเตอร์ ร่วมฉลองกับสมาชิกชุมชน'}));
  else if(x.wd===6)out.push(A('service','Church Service · พิธีวันอาทิตย์','⛪',540,660,'church',{kind:'weekly',desc:'ร่วมพิธีวันอาทิตย์ ฟังเทศน์ และพบบาทหลวง'}));
  if(d===E-2)out.push(A('goodfri','พิธีวันศุกร์ประเสริฐ','✝️',900,990,'church',{kind:'festival',festival:'goodfri',desc:'พิธีรำลึกอย่างสงบที่โบสถ์'}));
  if(x.mo===12&&x.dm===24)out.push(A('xmasprep','ช่วยเตรียมงานคริสต์มาส','🎄',780,1020,'church',{kind:'festival',festival:'xmasprep',desc:'ช่วยบาทหลวงตกแต่งต้นคริสต์มาสและเตรียมงาน'}));
  if(x.mo===12&&x.dm===25)out.push(A('christmas','พิธีคริสต์มาส','🎄',1020,1200,'church',{kind:'festival',festival:'christmas',desc:'ฉลองคริสต์มาสร่วมกับชุมชน'}));
 }
 if(r==='islam'){
  if(x.wd===4)out.push(A('jumuah','ละหมาดวันศุกร์','🕌',750,810,'mosque',{kind:'weekly',desc:'ร่วมละหมาดวันศุกร์ที่มัสยิดประจำเมือง'}));
  if(x.mo===9)out.push(A('iftar','อิฟตาร์ · แบ่งปันอาหาร','🌙',1110,1185,'mosque',{kind:'festival',festival:'ramadan',desc:'เดือนรอมฎอน: ร่วมละศีลอดและแบ่งปันอาหารกับชุมชน'}));
  if(x.mo===10&&x.dm===1)out.push(A('eidfitr','วันอีดิ้ลฟิตริ','🎉',420,540,'mosque',{kind:'festival',festival:'eidfitr',desc:'ละหมาดวันอีดและอวยพรกัน'}));
  if(x.mo===12&&x.dm===10)out.push(A('eidadha','วันอีดิ้ลอัฎฮา','🎉',420,600,'mosque',{kind:'festival',festival:'eidadha',desc:'ละหมาดวันอีดและแบ่งปันอาหารแก่ผู้คนในชุมชน'}));
 }
 // กิจกรรมชุมชน: ทุกคนร่วมได้ (ผู้ที่ไม่มีศาสนามีเฉพาะกิจกรรมนี้)
 if(x.wd===5)out.push(A('community','อาสาชุมชน · ช่วยจัดบูธ','🤝',540,660,'street',{kind:'community',desc:'บูธอาสาชุมชนหน้าบริษัท ไปช่วยเพื่อนบ้านจัดของและพูดคุย'}));
 return out;
}
const actKey=(d,a)=>d+':'+a.id;
const hist=()=>R().religionActivities;
function statusOf(d,a){
 const r=R();if(!r)return 'upcoming';const k=actKey(d,a);
 if(r.religionActivities[k]&&r.religionActivities[k].done)return 'completed';
 if(d>S.day)return 'upcoming';
 if(d<S.day)return 'missed';
 if(S.t>a.end)return 'missed';
 if(S.t>=a.start)return 'available';
 return 'upcoming';
}
const STAT={upcoming:['Upcoming','#8fb4ff','กำลังจะมาถึง'],available:['Available','#7fe3a0','เข้าร่วมได้ตอนนี้'],completed:['Completed','#ffd45a','เข้าร่วมแล้ว'],missed:['Missed','#b8c0cc','ผ่านไปแล้ว · ไม่มีบทลงโทษ']};
function todays(){return okS()?actsFor(S.day):[]}
function completeAct(a,d,extra){
 const r=R();if(!r)return null;d=d||S.day;const k=actKey(d,a);
 if(r.religionActivities[k]&&r.religionActivities[k].done)return null;
 r.religionActivities[k]={done:true,day:d,t:Math.floor(S.t),id:a.id};
 r.activityHistory.push({k,id:a.id,day:d,t:Math.floor(S.t),title:a.title});
 if(r.activityHistory.length>300)r.activityHistory.splice(0,r.activityHistory.length-300);
 if(a.festival){r.festivalHistory[a.festival]=r.festivalHistory[a.festival]||[];r.festivalHistory[a.festival].push(d)}
 const rw=reward(k,a.kind);
 saveNow();evt('act',a.id);
 return rw;
}

/* ---------------------------------------------------------------- รางวัล (เท่ากันทุกศาสนา · ไม่มีใครได้เปรียบทางธุรกิจ) */
const RW={daily:{money:150,rel:1},weekly:{money:300,rel:2},community:{money:300,rel:2},festival:{money:800,rel:3,souv:true}};
const SOUV={buddhism:'ดอกบัวที่ระลึก 🪷',christianity:'เทียนจากโบสถ์ 🕯️',islam:'อินทผลัมจากชุมชน 🌴',none:'สมุดบันทึกชุมชน 📒'};
function reward(key,kind){
 const r=R();if(!r||r.claimedRewards[key])return null;const w=RW[kind]||RW.weekly;r.claimedRewards[key]=1;
 S.money+=w.money;try{if(typeof S.rep==='number')S.rep+=kind==='festival'?2:1}catch(e){}
 let souv=null;if(w.souv){souv=(SOUV[r.religionId]||SOUV.none);r.souvenirs.push({n:souv,day:S.day})}
 return{money:w.money,rel:w.rel,souv,rep:kind==='festival'?2:1};
}
function addRel(npc,n){const r=R();if(!r)return 0;r.communityRelationships[npc]=(r.communityRelationships[npc]||0)+n;return r.communityRelationships[npc]}
const relOf=npc=>{const r=R();return r?(r.communityRelationships[npc]||0):0};

/* ---------------------------------------------------------------- เหตุการณ์ → ภารกิจ */
const listeners=[];
function evt(type,arg){try{listeners.forEach(f=>f(type,arg))}catch(e){console.error(e)}}

/* ---------------------------------------------------------------- สไตล์ */
const CSS=`
.rlOv{position:fixed;inset:0;z-index:9700;display:none;align-items:center;justify-content:center;padding:12px;background:radial-gradient(ellipse at 50% 20%,#1c2a52 0,#0a1226 70%);font-family:'Noto Sans Thai','Sarabun',system-ui,sans-serif;color:#f4efe0;overflow:auto}
.rlOv.on{display:flex}
.rlWin{width:min(980px,100%);max-height:100%;overflow:auto;background:linear-gradient(#18233f,#101a33);border:3px solid #c89d4b;border-radius:16px;box-shadow:0 18px 60px #000b,inset 0 0 0 2px #2c3b66;padding:16px 18px}
.rlWin h2{margin:0 0 4px;font-size:22px;color:#ffe39b;text-shadow:0 2px #3b2a0f}
.rlWin .sub{color:#b9c6e4;font-size:13px;margin-bottom:12px}
.rlNm{display:flex;align-items:center;gap:10px;margin:8px 0 12px;flex-wrap:wrap}
.rlNm label{font-size:13px;color:#ffe39b}
.rlNm input{flex:1;min-width:160px;max-width:320px;padding:8px 10px;border-radius:8px;border:2px solid #4a5d93;background:#0b1430;color:#fff;font:600 15px inherit}
.rlNm input:focus{outline:none;border-color:#ffd36e}
.rlGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
@media(max-width:760px){.rlGrid{grid-template-columns:repeat(2,1fr)}}
.rlCard{position:relative;display:flex;flex-direction:column;gap:6px;text-align:left;padding:10px 10px 12px;border-radius:12px;border:2px solid #34456f;background:linear-gradient(#1b2a4f,#121c38);color:#f4efe0;cursor:pointer;font:inherit;min-height:44px;transition:.15s}
.rlCard:hover{border-color:#7a8fc7;transform:translateY(-2px)}
.rlCard.sel{border-color:#ffd36e;box-shadow:0 0 0 3px #ffd36e44,0 8px 22px #0008;background:linear-gradient(#27385f,#16224a)}
.rlCard .ic{width:54px;height:54px;align-self:center;filter:drop-shadow(0 2px 3px #0008)}
.rlCard .nm{font-weight:800;font-size:16px;text-align:center}
.rlCard .en{font-size:10px;letter-spacing:2px;color:#9fb0d6;text-align:center;margin-top:-4px}
.rlCard .ds{font-size:12px;color:#d6def2;line-height:1.45}
.rlCard ul{margin:2px 0 0;padding-left:15px;font-size:11px;color:#b9c6e4;line-height:1.5}
.rlBar{display:flex;gap:10px;justify-content:flex-end;margin-top:14px;flex-wrap:wrap}
.rlBtn{font:inherit;font-weight:800;font-size:15px;min-height:44px;padding:8px 20px;border-radius:10px;border:2px solid #7d8fbf;background:#243459;color:#f4efe0;cursor:pointer}
.rlBtn.go{background:linear-gradient(#f3cf6e,#d19a35);color:#2a1a05;border-color:#ffe9a5}
.rlBtn:disabled{opacity:.45;cursor:default}
.rlNote{font-size:12px;color:#ffcf8a;margin-top:8px}
.rlCf{position:fixed;inset:0;z-index:9800;display:none;align-items:center;justify-content:center;background:#050a18cc;padding:14px}
.rlCf.on{display:flex}
.rlCf .bx{width:min(440px,100%);border:3px solid #ffd36e;border-radius:14px;background:linear-gradient(#1d2b52,#111b38);padding:18px;text-align:center;box-shadow:0 14px 50px #000}
.rlCf .bx svg{width:60px;height:60px}.rlCf .bx h3{margin:6px 0;color:#ffe39b}.rlCf .bx p{font-size:13px;color:#d6def2;line-height:1.6;margin:6px 0}
.rlCf .bar{display:flex;gap:8px;justify-content:center;margin-top:12px;flex-wrap:wrap}
/* ปฏิทิน */
.relCal{position:absolute;right:2px;bottom:1px;font-size:15px;line-height:1;filter:drop-shadow(0 1px 1px #0008)}
.relCal.f{animation:relPulse 1.6s infinite}@keyframes relPulse{50%{transform:scale(1.18)}}
.relEv{margin:6px 0;padding:8px 10px;border:1px solid #c89d4b88;border-radius:9px;background:#fff7e0;color:#3a2a10;font-size:13px;line-height:1.5}
.relEv .hd{display:flex;align-items:center;gap:8px;font-weight:800}
.relEv .hd i{font-style:normal;font-size:20px}
.relEv .st{margin-left:auto;font-size:11px;font-weight:800;padding:2px 8px;border-radius:99px;color:#102;background:#cde}
.relEv .meta{font-size:12px;color:#5a4a30}
.relEv .ac{margin-top:6px;display:flex;gap:6px;flex-wrap:wrap}
.relEv button{font:inherit;font-size:12px;font-weight:800;padding:7px 12px;min-height:36px;border-radius:8px;border:1.5px solid #b98a2e;background:linear-gradient(#ffe9a0,#f2c452);color:#3a2205;cursor:pointer}
.relEv button:disabled{opacity:.5;cursor:default}
.relJb{margin:8px 0 2px}.relJb button{font:inherit;font-size:12px;font-weight:800;padding:7px 12px;min-height:36px;border-radius:8px;border:1.5px solid #8aa;background:#e6f0ff;color:#123;cursor:pointer}
/* แจ้งเตือน */
#relNote{position:fixed;right:12px;top:78px;z-index:9400;max-width:min(330px,calc(100vw - 24px));background:linear-gradient(#1d2b52,#111b38);border:2px solid #ffd36e;border-radius:12px;padding:10px 12px;color:#f4efe0;font-family:'Noto Sans Thai',system-ui,sans-serif;box-shadow:0 8px 28px #0009;animation:relIn .3s}
@keyframes relIn{from{transform:translateX(30px);opacity:0}}
#relNote[hidden]{display:none}#relNote .hd{font-weight:800;color:#ffe39b;margin-bottom:3px}#relNote .tx{font-size:12px;color:#d6def2;line-height:1.5}
#relNote .ac{display:flex;gap:6px;margin-top:8px}#relNote button{font:inherit;font-size:12px;font-weight:800;padding:7px 10px;min-height:36px;border-radius:8px;border:1.5px solid #b98a2e;background:linear-gradient(#ffe9a0,#f2c452);color:#3a2205;cursor:pointer}
#relNote button.x{background:#243459;color:#f4efe0;border-color:#7d8fbf}
/* หน้าต่างทั่วไป */
.rlMod{position:fixed;inset:0;z-index:9750;display:none;align-items:center;justify-content:center;background:#050a18d0;padding:12px;font-family:'Noto Sans Thai','Sarabun',system-ui,sans-serif}
.rlMod.on{display:flex}
.rlMod .bx{width:min(560px,100%);max-height:92vh;overflow:auto;border:3px solid #c89d4b;border-radius:14px;background:linear-gradient(#1d2b52,#111b38);padding:16px;color:#f4efe0;box-shadow:0 14px 50px #000}
.rlMod h3{margin:0 0 6px;color:#ffe39b;font-size:19px}.rlMod .rt{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:8px 0;font-size:13px}
.rlMod .rt span{padding:4px 9px;border-radius:99px;background:#243459;border:1px solid #4a5d93}.rlMod .rt b{color:#ffd36e}
.rlMod .ln{font-size:13px;line-height:1.6;color:#d6def2}.rlMod .ln b{color:#fff}
.rlMod .tab{display:flex;gap:6px;margin-bottom:8px}.rlMod .tab button{flex:1}
.rlMod .it{padding:7px 9px;margin:5px 0;border-radius:8px;background:#16224a;border:1px solid #34456f;font-size:13px;line-height:1.5}
.rlMod .it.done{opacity:.72;border-color:#7fe3a066}.rlMod .it small{color:#9fb0d6}
.rlMod .pg{height:7px;border-radius:5px;background:#0b1430;margin-top:4px;overflow:hidden}.rlMod .pg i{display:block;height:100%;background:linear-gradient(#ffe9a0,#d19a35)}
.rlMod .bar{display:flex;gap:8px;justify-content:flex-end;margin-top:12px;flex-wrap:wrap}
/* บทสนทนา */
#rlDlg{position:fixed;inset:0;z-index:9780;display:none;align-items:flex-end;justify-content:center;padding:10px;background:#050a1855;font-family:'Noto Sans Thai','Sarabun',system-ui,sans-serif}
#rlDlg.on{display:flex}
#rlDlg .bx{width:min(640px,100%);border:2px solid #c89d4b;border-radius:12px;background:linear-gradient(#1f2c52,#111b38);color:#f4efe0;padding:12px 14px;box-shadow:0 10px 40px #000a}
#rlDlg .hd{display:flex;gap:10px;align-items:center;margin-bottom:6px}
#rlDlg .hd img{width:58px;height:70px;border-radius:9px;object-fit:cover;border:2px solid #c89d4b;background:#0b1430}
#rlDlg .nm{font-weight:800;color:#ffe39b}#rlDlg .tg{font-size:11px;color:#9fb0d6}
#rlDlg .sp{min-height:46px;font-size:15px;line-height:1.55;padding:4px 2px;cursor:pointer}
#rlDlg .nx{text-align:right;font-size:11px;color:#9fb0d6}
#rlDlg .ch{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
#rlDlg .ch button{flex:1;min-width:150px;font:inherit;font-size:14px;border-radius:9px;padding:10px 12px;min-height:44px;border:1px solid #4a5d93;background:#243459;color:#f4efe0;cursor:pointer}
#rlDlg .ch button.ok{background:linear-gradient(#f3cf6e,#d19a35);color:#2a1a05;font-weight:800;border-color:#ffe9a5}
`;

/* ---------------------------------------------------------------- UI ช่วย */
let styled=false;
function styles(){if(styled)return;styled=true;const s=document.createElement('style');s.id='relCss';s.textContent=CSS;document.head.appendChild(s)}
function mk(id,cls,html){let e=$(id);if(!e){e=document.createElement('div');e.id=id;if(cls)e.className=cls;document.body.appendChild(e)}if(html!=null)e.innerHTML=html;return e}

/* ---------------------------------------------------------------- บทสนทนา (ใช้ทั้งในฉากศาสนาและฉากถนน) */
const DL={q:null,on:false,i:0,typed:0,tm:null};
function dlg(o){
 // o:{name,tag,img,lines:[..],choices:[{t,ok,fn}],done}
 styles();const el=mk('rlDlg','','');DL.o=o;DL.i=0;DL.on=true;el.classList.add('on');renderDlg();
}
function renderDlg(){
 const o=DL.o,el=$('rlDlg');if(!o||!el)return;const last=DL.i>=o.lines.length-1,ln=o.lines[DL.i]||'';
 el.innerHTML='<div class="bx"><div class="hd">'+(o.img?'<img src="'+esc(o.img)+'" alt="">':'')+'<div><div class="nm">'+esc(o.name||'')+'</div><div class="tg">'+esc(o.tag||'')+'</div></div></div><div class="sp" id="rlSp">'+esc(ln)+'</div>'+
  (last&&o.choices&&o.choices.length?'<div class="ch">'+o.choices.map((c,i)=>'<button class="'+(c.ok?'ok':'')+'" data-i="'+i+'">'+esc(c.t)+'</button>').join('')+'</div>':'<div class="nx">'+(last?'แตะเพื่อปิด ▸':'แตะเพื่อไปต่อ ▸')+'</div>')+'</div>';
 const sp=$('rlSp');if(sp)sp.onclick=()=>dlgNext();
 el.querySelectorAll('.ch button').forEach(b=>b.onclick=e=>{e.stopPropagation();const c=o.choices[+b.dataset.i];closeDlg(true);if(c&&c.fn)c.fn()});
}
function dlgNext(){const o=DL.o;if(!o)return;if(DL.i<o.lines.length-1){DL.i++;renderDlg();return}if(o.choices&&o.choices.length)return;closeDlg(false)}
function closeDlg(chosen){const el=$('rlDlg');if(el)el.classList.remove('on');const o=DL.o;DL.on=false;DL.o=null;if(o&&!chosen&&o.done)try{o.done()}catch(e){console.error(e)}}
window.addEventListener('keydown',e=>{
 if(!DL.on)return;const k=(e.key||'').toLowerCase();
 if(k==='e'||k==='enter'||k===' '){e.preventDefault();e.stopImmediatePropagation();dlgNext()}
 else if(/^[1-4]$/.test(k)&&DL.o&&DL.i>=DL.o.lines.length-1&&DL.o.choices&&DL.o.choices[+k-1]){e.preventDefault();e.stopImmediatePropagation();const c=DL.o.choices[+k-1];closeDlg(true);if(c.fn)c.fn()}
 else if(k==='escape'){e.preventDefault();e.stopImmediatePropagation();if(!(DL.o.choices&&DL.o.choices.length))closeDlg(false)}
},true);

/* ---------------------------------------------------------------- หน้าสร้างตัวละคร / เลือกศาสนา */
const CC={open:false,sel:null,old:false,pp:0};
function lobbyUp(){const lb=$('lobby');return !!(lb&&lb.style.display!=='none'&&getComputedStyle(lb).display!=='none')||document.documentElement.classList.contains('mct-booting')}
function needChoose(){const r=R();return !!(r&&!r.religionId&&!r.religionLocked)}
function blocking(){return CC.open||(okS()&&needChoose())}
function ccHTML(){
 const cards=IDS.map(id=>{const d=RDEF[id];return '<button class="rlCard'+(CC.sel===id?' sel':'')+'" data-r="'+id+'" aria-pressed="'+(CC.sel===id)+'"><div class="ic">'+SVG[id]+'</div><div class="nm">'+d.name+'</div><div class="en">'+d.en+'</div><div class="ds">'+d.desc+'</div><ul>'+d.bullets.map(b=>'<li>'+b+'</li>').join('')+'</ul></button>'}).join('');
 return '<div class="rlWin" role="dialog" aria-label="สร้างตัวละคร"><h2>'+(CC.old?'🕊️ เลือกศาสนาของ CEO':'🧑‍💼 สร้างตัวละคร CEO')+'</h2><div class="sub">'+(CC.old?'เซฟนี้ยังไม่มีข้อมูลศาสนา · เลือกได้ครั้งเดียว และเปลี่ยนภายหลังไม่ได้':'ตั้งชื่อ CEO และเลือกศาสนา · เลือกได้ครั้งเดียวต่อเซฟ เปลี่ยนภายหลังไม่ได้')+' · ศาสนาไม่ให้ข้อได้เปรียบทางธุรกิจ และไม่มีบทลงโทษหากไม่ร่วมกิจกรรม</div>'+
  (CC.old?'':(window.CEOG?CEOG.html():'')+'<div class="rlNm"><label for="rlName">ชื่อ CEO</label><input id="rlName" maxlength="20" placeholder="CEO" value="'+esc((S.ceo&&S.ceo!=='CEO')?S.ceo:'')+'"></div>')+
  '<div class="rlGrid">'+cards+'</div><div class="rlNote" id="rlHint">'+(CC.sel?'เลือก: '+RDEF[CC.sel].name+' · กด “ยืนยัน” เพื่อดำเนินการต่อ':'แตะการ์ดเพื่อเลือกศาสนา')+'</div><div class="rlBar"><button class="rlBtn go" id="rlOk" '+(CC.sel?'':'disabled')+'>ยืนยัน</button></div></div>';
}
function ccDraw(){
 styles();const el=mk('rlCC','rlOv','');el.innerHTML=ccHTML();
 el.querySelectorAll('.rlCard').forEach(b=>b.onclick=()=>{CC.sel=b.dataset.r;const nm=$('rlName'),v=nm?nm.value:null;ccDraw();const n2=$('rlName');if(n2&&v!=null)n2.value=v});
 if(window.CEOG)CEOG.bind(el,()=>{const nm=$('rlName'),v=nm?nm.value:null;ccDraw();const n2=$('rlName');if(n2&&v!=null)n2.value=v});
 const ok=$('rlOk');if(ok)ok.onclick=()=>{if(!CC.sel)return;ccConfirm()};
}
function ccConfirm(){
 const d=RDEF[CC.sel],el=mk('rlCfm','rlCf','');
 el.innerHTML='<div class="bx"><div style="width:60px;height:60px;margin:0 auto">'+SVG[d.id]+'</div><h3>ยืนยันศาสนา: '+d.name+'</h3><p>เมื่อยืนยันแล้ว <b>ศาสนาจะถูกล็อก</b> และเปลี่ยนไม่ได้อีกในเซฟนี้<br>ตัวละคร กิจกรรม และสถานที่ในเกมจะเป็นไปตามศาสนาที่เลือก</p><div class="bar"><button class="rlBtn" id="rlBack">กลับไปเลือก</button><button class="rlBtn go" id="rlGo">ยืนยัน เริ่มเกม</button></div></div>';
 el.classList.add('on');$('rlBack').onclick=()=>el.classList.remove('on');
 $('rlGo').onclick=()=>{el.classList.remove('on');ccFinish()};
}
function ccFinish(){
 const nm=$('rlName');if(nm&&nm.value.trim())S.ceo=nm.value.trim().slice(0,20);
 if(!setReligion(CC.sel))return;
 const el=$('rlCC');if(el)el.classList.remove('on');CC.open=false;S.paused=CC.pp;saveNow();
 try{toast('🕊️ ตั้งค่าศาสนาแล้ว: '+RDEF[CC.sel].name)}catch(e){}
}
function setReligion(id){
 const r=R();if(!r||!IDS.includes(id))return false;
 if(r.religionLocked&&r.religionId&&r.religionId!==id)return false;   // ล็อกแล้ว ห้ามเปลี่ยน
 r.religionId=id;r.religionLocked=true;return true;
}
function openCC(){
 if(CC.open||!okS())return;CC.open=true;CC.sel=null;
 CC.old=!(S.day<=1&&S.t<=500&&(!S.emp||!S.emp.length)&&!(S.tut&&(S.tut.fin||S.tut.idx>0)));
 CC.pp=S.paused||0;S.paused=1;ccDraw();$('rlCC').classList.add('on');
}
function ccTick(){
 if(!okS())return;R();
 if(CC.open){if(S.paused!==1)S.paused=1;return}
 if(!needChoose()||lobbyUp())return;
 try{if(window.CUT&&CUT.on)return}catch(e){}
 openCC();
}

/* ---------------------------------------------------------------- ปฏิทิน (CAL hooks) */
function cellIcon(d){
 const r=rid();if(!r||!okS())return '';
 const L=actsFor(d).filter(a=>a.cal);if(!L.length)return '';
 const a=L.find(z=>z.kind==='festival')||L[0],st=statusOf(d,a);
 return '<span class="relCal'+(a.kind==='festival'?' f':'')+'" title="'+esc(a.title+' '+fmtT(a.start)+'–'+fmtT(a.end))+'" style="'+(st==='completed'?'opacity:.55':'')+'">'+(st==='completed'?'✔':a.icon)+'</span>';
}
function hasDay(d){return rid()?actsFor(d).length>0:false}
function dayHTML(d){
 const r=rid();if(!r||!okS())return '';const L=actsFor(d);let h='';
 L.forEach(a=>{
  const st=statusOf(d,a),S3=STAT[st],pl=PLACES[a.place];
  const canGo=(d===S.day)&&(st==='available'||st==='upcoming');
  h+='<div class="relEv"><div class="hd"><i>'+a.icon+'</i><span>'+esc(DAYN[di(d).wd].toUpperCase())+' · '+esc(a.title)+'</span><span class="st" style="background:'+S3[1]+'">'+S3[0]+'</span></div>'+
   '<div class="meta">เวลา '+fmtT(a.start)+'–'+fmtT(a.end)+' · สถานที่: '+esc(pl?pl.name:'-')+(a.kind==='festival'?' · 🎊 วันสำคัญ':'')+'</div><div class="meta">'+esc(a.desc||'')+' <i>('+S3[2]+')</i></div>'+
   '<div class="ac">'+(a.place==='street'?'<button '+(canGo?'':'disabled')+' onclick="REL.go(\''+actKey(d,a)+'\')">🚪 ออกไปหน้าบริษัท</button>':'<button '+(canGo?'':'disabled')+' onclick="REL.go(\''+actKey(d,a)+'\')">🚌 Travel to '+esc(pl?pl.name:'')+'</button>')+
   (canGo?'':'<small style="color:#7a6a50;align-self:center">'+(d>S.day?'ยังไม่ถึงวัน':st==='completed'?'เข้าร่วมแล้ว':'ไม่อยู่ในช่วงเวลา')+'</small>')+'</div></div>';
 });
 h+='<div class="relJb"><button onclick="REL.journal()">📖 สมุดกิจกรรมชุมชน · ภารกิจ</button></div>';
 return h;
}
function findAct(key){const d=+String(key).split(':')[0],id=String(key).split(':')[1];const a=actsFor(d).find(z=>z.id===id);return a?{a,d}:null}

/* ---------------------------------------------------------------- แจ้งเตือน (ไม่ซ้ำ) */
function notify(a,d,pre){
 const r=R();if(!r)return;const k=actKey(d,a)+(pre?':pre':':now');if(r.notificationHistory[k])return;r.notificationHistory[k]=S.day;
 // จำกัดขนาดประวัติ
 const ks=Object.keys(r.notificationHistory);if(ks.length>400)ks.slice(0,ks.length-300).forEach(x=>delete r.notificationHistory[x]);
 styles();const n=mk('relNote','','');n.hidden=false;
 n.innerHTML='<div class="hd">'+a.icon+' '+(pre?'เร็วๆ นี้':'ถึงเวลาแล้ว')+' · '+esc(a.title)+'</div><div class="tx">เวลา '+fmtT(a.start)+'–'+fmtT(a.end)+' · '+esc(PLACES[a.place].name)+'<br>ไม่เข้าร่วมได้ ไม่มีบทลงโทษ</div><div class="ac"><button onclick="REL.openCal()">📅 เปิดปฏิทิน</button><button class="x" onclick="document.getElementById(\'relNote\').hidden=true">✕</button></div>';
 clearTimeout(notify.tm);notify.tm=setTimeout(()=>{const q=$('relNote');if(q)q.hidden=true},12000);
 try{toast(a.icon+' '+a.title+' · '+fmtT(a.start))}catch(e){}
}
function notifyTick(){
 if(!okS()||!rid()||blocking())return;try{if(window.CUT&&CUT.on)return}catch(e){}
 if(lobbyUp())return;
 actsFor(S.day).forEach(a=>{
  if(statusOf(S.day,a)==='completed')return;
  if(S.t>=a.start-60&&S.t<a.start)notify(a,S.day,true);
  else if(S.t>=a.start&&S.t<a.end-10)notify(a,S.day,false);
 });
}
function openCal(){try{CAL.open()}catch(e){}}

/* ---------------------------------------------------------------- เดินทาง (รถเมล์สาย 77 ของเดิม) */
function tripMin(){try{return Math.max(1,Math.round(22*(1-(window.CARX?CARX.reduction():0))))}catch(e){return 22}}
const TRIP_MIN=22;               // เวลาโดยประมาณต่อเที่ยว (นาทีในเกม) — ไม่ข้ามเวลา เวลาเดินตามนาฬิกาเกมจริง
function tripBlock(){
 try{if(!okS())return 'เกมยังไม่พร้อม';if(S.over)return 'เกมจบแล้ว';if(window.CUT&&CUT.on)return 'กำลังอยู่ในฉากอื่น ปิดฉากนี้ก่อน';if(typeof CEOScene!=='undefined'&&CEOScene.atCompany&&!CEOScene.atCompany())return 'CEO ไม่ได้อยู่ที่บริษัท';
  if(window.GHOST&&GHOST.busy&&GHOST.busy())return '👻 ผีกำลังไล่ตาม ออกจากบริษัทไม่ได้';}catch(e){}
 return '';
}
function go(key){
 const f=findAct(key);if(!f)return;const{a,d}=f;
 if(d!==S.day)return;
 if(a.place==='street'){return goStreet(a)}
 openTravel(a,d);
}
function goStreet(a){
 const why=tripBlock();if(why){try{toast('🚫 '+why)}catch(e){}return}
 try{CAL.close()}catch(e){}
 setTimeout(()=>{try{CEOScene.tryOpen()}catch(e){console.error(e)}},60);
}
function openTravel(a,d){
 styles();const pl=PLACES[a.place],why=tripBlock();
 const arrive=S.t+tripMin(),late=arrive>a.end;
 const m=mk('rlTrip','rlMod','');
 m.innerHTML='<div class="bx"><h3>🚌 เลือกการเดินทาง</h3><div class="ln"><b>'+a.icon+' '+esc(a.title)+'</b><br>เวลา '+fmtT(a.start)+'–'+fmtT(a.end)+' · สถานที่: '+esc(pl.name)+'</div>'+
  '<div class="rt"><span>🏢 บริษัท</span>→<span>🚏 ป้ายรถเมล์</span>→<span>🚌 สาย 77</span>→<span>'+pl.icon+' '+esc(pl.name)+'</span></div>'+
  '<div class="it"><b>🚌 รถเมล์สาย 77</b><br><small>ใช้เวลาโดยประมาณ '+tripMin()+' นาทีในเกมต่อเที่ยว · เที่ยวกลับขึ้นรถที่ป้ายหน้าทางออก · ไม่เสียค่าโดยสาร</small></div>'+
  (late?'<div class="rlNote">⏰ ถึงที่หมายราว '+fmtT(arrive)+' อาจเลยเวลากิจกรรม ('+fmtT(a.end)+') แต่ไม่มีบทลงโทษ</div>':'')+(why?'<div class="rlNote">🚫 '+esc(why)+'</div>':'')+
  '<div class="bar"><button class="rlBtn" id="rlTc">ยกเลิก</button><button class="rlBtn go" id="rlTg" '+(why?'disabled':'')+'>🚌 เริ่มเดินทาง</button></div></div>';
 m.classList.add('on');$('rlTc').onclick=()=>m.classList.remove('on');
 $('rlTg').onclick=()=>{m.classList.remove('on');startTrip(a,d)};
}
function startTrip(a,d){
 const why=tripBlock();if(why){try{toast('🚫 '+why)}catch(e){}return}
 const r=R();r.trip={to:a.place,key:actKey(d,a),from:S.day,at:Math.floor(S.t)};
 try{CAL.close()}catch(e){}
 setTimeout(()=>{
  const ok=CEOScene.rideTo({auto:true,label:PLACES[a.place].name,cb:()=>{try{REL.scene.enter(a.place,{key:actKey(d,a)})}catch(e){console.error(e);toast('เปิดฉากไม่สำเร็จ')}}});
  if(!ok){r.trip=null;try{toast('🚫 ตอนนี้เดินทางไม่ได้')}catch(e){}}
 },60);
}
function backHome(){            // เดินทางกลับบริษัทด้วยรถเมล์เดิม (ไม่วาร์ป) · กลับมาถึงบริษัท เวลาเกม = 13:00 ของวันนั้น (ไม่ย้อนเวลาถอยหลัง)
 const r=R();if(r)r.trip=null;
 const arrive=()=>{try{if(S.t<780)S.t=780;try{hud()}catch(e){}try{save(1)}catch(e){}toast('🏢 ถึงบริษัทแล้ว · เวลา '+fmtT(Math.floor(S.t)))}catch(e){}};
 const ok=CEOScene.rideTo({auto:true,label:'บริษัท',cb:arrive});
 if(!ok){try{window.CUT&&(CUT.on=0);toast('🏢 กลับบริษัท')}catch(e){}}
 return ok;
}

/* ---------------------------------------------------------------- สมุดกิจกรรม / ภารกิจ (หน้าสรุป) */
function journal(tab){
 styles();const m=mk('rlJrn','rlMod','');tab=tab||'quest';const r=R(),d=def();
 let body='';
 if(tab==='quest'){
  const Q=window.REL&&REL.quests?REL.quests.list():[];
  body=Q.length?Q.map(q=>'<div class="it'+(q.done?' done':'')+'"><b>'+q.icon+' '+esc(q.title)+'</b> <small>['+esc(q.catName)+']</small><br>'+esc(q.done?'✔ สำเร็จแล้ว':q.obj)+'<div class="pg"><i style="width:'+Math.round(100*q.prog/q.total)+'%"></i></div></div>').join(''):'<div class="it">ยังไม่มีภารกิจในตอนนี้</div>';
 }else if(tab==='hist'){
  const H=r.activityHistory.slice(-14).reverse();
  body=(H.length?H.map(h=>'<div class="it">วันที่ '+h.day+' · '+esc(h.title)+' <small>'+fmtT(h.t)+'</small></div>').join(''):'<div class="it">ยังไม่มีประวัติกิจกรรม</div>');
  const rl=Object.keys(r.communityRelationships);
  body+='<h3 style="margin-top:12px">🤝 ความสัมพันธ์ในชุมชน</h3>'+(rl.length?rl.map(k=>'<div class="it">'+esc((window.REL&&REL.npcName&&REL.npcName(k))||k)+' · ♥ '+r.communityRelationships[k]+'</div>').join(''):'<div class="it">ยังไม่ได้พูดคุยกับใคร</div>');
  body+='<h3 style="margin-top:12px">🎁 ของที่ระลึก</h3>'+(r.souvenirs.length?r.souvenirs.map(s=>'<div class="it">'+esc(s.n)+' <small>วันที่ '+s.day+'</small></div>').join(''):'<div class="it">ยังไม่มี</div>');
 }
 m.innerHTML='<div class="bx"><h3>📖 สมุดกิจกรรมชุมชน '+(d?'· '+d.name:'')+'</h3><div class="tab"><button class="rlBtn'+(tab==='quest'?' go':'')+'" id="rlJq">ภารกิจ</button><button class="rlBtn'+(tab==='hist'?' go':'')+'" id="rlJh">ประวัติ · ที่ระลึก</button></div>'+body+'<div class="bar"><button class="rlBtn" id="rlJx">ปิด</button></div></div>';
 m.classList.add('on');$('rlJx').onclick=()=>m.classList.remove('on');$('rlJq').onclick=()=>journal('quest');$('rlJh').onclick=()=>journal('hist');
}
function summary(o){   // หน้าสรุปกิจกรรม: o:{title,lines:[],rw}
 styles();const m=mk('rlSum','rlMod','');
 const rw=o.rw;
 m.innerHTML='<div class="bx"><h3>✨ สรุปกิจกรรม</h3><div class="ln"><b>'+esc(o.title)+'</b>'+(o.lines||[]).map(l=>'<br>'+esc(l)).join('')+'</div>'+
  (rw?'<div class="rt"><span>💰 <b>+'+Mf(rw.money)+'</b></span><span>⭐ ชื่อเสียง <b>+'+rw.rep+'</b></span><span>🤝 ความสัมพันธ์ <b>+'+rw.rel+'</b></span>'+(rw.souv?'<span>🎁 <b>'+esc(rw.souv)+'</b></span>':'')+'</div>':'<div class="ln"><small>รับรางวัลของกิจกรรมนี้ไปแล้ว</small></div>')+
  '<div class="bar"><button class="rlBtn go" id="rlSx">ตกลง</button></div></div>';
 m.classList.add('on');$('rlSx').onclick=()=>{m.classList.remove('on');if(o.done)o.done()};
}

/* ---------------------------------------------------------------- เริ่มระบบ */
function tick(){try{ccTick();notifyTick();if(window.REL&&REL.quests)REL.quests.tick()}catch(e){console.error(e)}}
function init(){styles();R();setInterval(tick,900)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else Promise.resolve().then(init);

window.REL={
 IDS,RDEF,PLACES,SVG,actsFor,statusOf,completeAct,reward,addRel,relOf,evt,onEvt:f=>listeners.push(f),
 R,rid,def,okS,esc,di,fmtT,Mf,dlg,closeDlg,summary,journal,notify,
 cellIcon,hasDay,dayHTML,go,openCal,blocking,
 setReligion:id=>{const ok=setReligion(id);if(ok)saveNow();return ok},
 openChoose:openCC,backHome,startTrip,openTravel,tripBlock,findAct,actKey,todays,easterDay,
 npcName:k=>(window.REL&&REL.NPC&&REL.NPC[k]&&REL.NPC[k].name)||k,
 _cc:CC,dlgOn:()=>DL.on,tick
};
})();

/* =====================================================================
   REL.art — ฉากพิกเซลอาร์ตวาดด้วยโค้ด (ไม่ใช้ภาพจริง/ภาพนิ่งแปะ)
   หน่วยวาด = 1 "พิกเซลเกม" = 2 พิกเซลจอ (scale 2) · ฉากนอกอาคาร 640×380 (โลก 1280×760) · ฉากในอาคาร 480×300 (โลก 960×600)
   ===================================================================== */
(function(){
'use strict';
const mkC=(w,h)=>{const c=document.createElement('canvas');c.width=Math.ceil(w*2);c.height=Math.ceil(h*2);const g=c.getContext('2d');g.scale(2,2);g.imageSmoothingEnabled=false;return[c,g]};
const px=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
const rng=seed=>{let s=(seed|0)||1;return()=>{s=(s*16807)%2147483647;return s/2147483647}};
function sh(c,a){const n=parseInt(c.slice(1),16),r=Math.max(0,Math.min(255,((n>>16)&255)*a|0)),g=Math.max(0,Math.min(255,((n>>8)&255)*a|0)),b=Math.max(0,Math.min(255,(n&255)*a|0));return'#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1)}
const ell=(g,cx,cy,rx,ry,c)=>{g.fillStyle=c;g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);g.fill()};
const tri=(g,a,b,c,d,e,f,col)=>{g.fillStyle=col;g.beginPath();g.moveTo(a,b);g.lineTo(c,d);g.lineTo(e,f);g.closePath();g.fill()};
const line=(g,x1,y1,x2,y2,c,w)=>{g.strokeStyle=c;g.lineWidth=w||1;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke()};
function grass(g,x,y,w,h,seed,pal){
 pal=pal||['#5f9f48','#6bb04f','#56934a','#79bd58'];const r=rng(seed);px(g,x,y,w,h,pal[0]);
 for(let i=0;i<w*h/22;i++){const a=x+r()*w,b=y+r()*h;px(g,a|0,b|0,2,1,pal[1+((r()*3)|0)])}
 for(let i=0;i<w*h/90;i++){const a=x+r()*w,b=y+r()*h;px(g,a|0,(b|0)-2,1,3,pal[2]);px(g,(a|0)+1,(b|0)-1,1,2,pal[3])}
}
function flowers(g,x,y,w,h,seed,cols,n){const r=rng(seed);for(let i=0;i<n;i++){const a=(x+r()*w)|0,b=(y+r()*h)|0,c=cols[(r()*cols.length)|0];px(g,a,b,2,2,c);px(g,a,b+2,1,2,'#3f7a35');px(g,a,b,1,1,'#fff7')}}
function tiles(g,x,y,w,h,c1,c2,t,seed){const r=rng(seed||7);for(let j=0;j<h;j+=t)for(let i=0;i<w;i+=t){const c=((i/t+j/t)&1)?c1:c2;px(g,x+i,y+j,t,t,r()<.18?sh(c,.94):c)}
 g.fillStyle='rgba(0,0,0,.10)';for(let j=0;j<=h;j+=t)g.fillRect(x,y+j,w,.6);for(let i=0;i<=w;i+=t)g.fillRect(x+i,y,.6,h)}
function stones(g,x,y,w,h,base,seed){const r=rng(seed);px(g,x,y,w,h,sh(base,.86));
 for(let j=0;j<h;j+=6)for(let i=-(j/6%2)*4;i<w;i+=8){const a=Math.max(x,x+i),bw=Math.min(x+w,x+i+7)-a;if(bw<=0)continue;px(g,a,y+j,bw,5,sh(base,.95+r()*.12));px(g,a,y+j,bw,1,sh(base,1.15))}}
function planks(g,x,y,w,h,c,seed,vert){const r=rng(seed);px(g,x,y,w,h,c);if(vert){for(let i=0;i<w;i+=7){px(g,x+i,y,1,h,sh(c,.72));px(g,x+i+3,y,1,h,sh(c,.9));if(r()<.5)px(g,x+i+1,y+r()*h,2,1,sh(c,.8))}}
 else{for(let j=0;j<h;j+=6){px(g,x,y+j,w,1,sh(c,.74));px(g,x,y+j+3,w,1,sh(c,1.08));for(let i=r()*20;i<w;i+=22+r()*30)px(g,x+i,y+j,1,6,sh(c,.74))}}}
function shadow(g,cx,cy,rx,ry,a){g.fillStyle='rgba(20,25,10,'+(a||.22)+')';g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);g.fill()}
function roofRows(g,x,y,w,h,c1,c2,step){step=step||5;for(let j=0;j<h;j+=step){px(g,x,y+j,w,step,(j/step&1)?c1:c2);for(let i=((j/step)&1)*2;i<w;i+=4)px(g,x+i,y+j,1,step,sh(c1,.78));px(g,x,y+j+step-1,w,1,'rgba(0,0,0,.25)')}}
function stained(g,x,y,w,h,seed,arched){const r=rng(seed),C=['#d94a4a','#e8b73c','#3a7fd1','#3fae6b','#8b4fc4','#e07a2f'];
 g.save();g.beginPath();if(arched){g.rect(x,y+w/2,w,h-w/2);g.ellipse(x+w/2,y+w/2,w/2,w/2,0,Math.PI,0)}else g.rect(x,y,w,h);g.clip();
 px(g,x,y,w,h,'#25304f');const n=3;for(let j=0;j<h;j+=n*2)for(let i=0;i<w;i+=n*2)px(g,x+i,y+j,n*2-1,n*2-1,C[(r()*C.length)|0]);
 px(g,x+w/2-.5,y,1,h,'#241a12');px(g,x,y+h*.45,w,1,'#241a12');g.restore();
 g.strokeStyle='#4a3a2c';g.lineWidth=1;g.beginPath();if(arched){g.moveTo(x,y+h);g.lineTo(x,y+w/2);g.ellipse(x+w/2,y+w/2,w/2,w/2,0,Math.PI,0);g.lineTo(x+w,y+h);g.closePath()}else g.rect(x,y,w,h);g.stroke()}
function label(g,x,y,t,c){g.save();g.font='bold 9px "Noto Sans Thai","Sarabun",sans-serif';g.textAlign='center';g.fillStyle=c;g.fillText(t,x,y);g.restore()}
function cross(g,x,y,s,c){px(g,x-s*.15,y,s*.3,s,c);px(g,x-s*.4,y+s*.28,s*.8,s*.26,c)}
function dome(g,cx,by,r,c1,c2){g.save();g.beginPath();g.ellipse(cx,by,r,r*1.05,0,Math.PI,0);g.closePath();g.clip();px(g,cx-r,by-r*1.1,r*2,r*1.2,c1);for(let i=0;i<r*2;i+=3){px(g,cx-r+i,by-r*1.1,1,r*1.2,sh(c1,i%6?0.92:1.1))}
 g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.ellipse(cx-r*.3,by-r*.55,r*.35,r*.5,-.4,0,Math.PI*2);g.fill();g.restore();
 g.strokeStyle=c2;g.lineWidth=1.2;g.beginPath();g.ellipse(cx,by,r,r*1.05,0,Math.PI,0);g.stroke();px(g,cx-1,by-r*1.05-6,2,6,c2);ell(g,cx,by-r*1.05-7,2,2,c2)}
function crescent(g,cx,cy,r,c){const[t,tg]=mkC(r*2+4,r*2+4);tg.fillStyle=c;tg.beginPath();tg.arc(r+2,r+2,r,0,Math.PI*2);tg.fill();tg.globalCompositeOperation='destination-out';tg.beginPath();tg.arc(r+2+r*.45,r+2-r*.12,r*.82,0,Math.PI*2);tg.fill();g.drawImage(t,cx-r-2,cy-r-2,r*2+4,r*2+4)}
function geo(g,x,y,w,h,c1,c2){px(g,x,y,w,h,c1);for(let j=0;j<h;j+=8)for(let i=0;i<w;i+=8){g.strokeStyle=c2;g.lineWidth=.7;g.beginPath();g.moveTo(x+i+4,y+j);g.lineTo(x+i+8,y+j+4);g.lineTo(x+i+4,y+j+8);g.lineTo(x+i,y+j+4);g.closePath();g.stroke();ell(g,x+i+4,y+j+4,1.1,1.1,c2)}}
/* สไปรต์วัตถุ (เรียงลำดับ y กับตัวละคร) */
function sprite(w,h,fn){const[c,g]=mkC(w,h);fn(g,w,h);return c}
function treeSpr(seed,k){ // k: 'leaf' ต้นไม้ใหญ่ | 'bodhi' ต้นโพธิ์ | 'palm' ปาล์ม | 'pine'
 return sprite(70,90,(g,w,h)=>{const r=rng(seed);shadow(g,35,86,24,6,.25);
  if(k==='palm'){px(g,33,34,4,52,'#8c6a3f');for(let j=36;j<84;j+=4)px(g,33,j,4,1,'#6e5230');for(let a=0;a<8;a++){const an=a/8*Math.PI*2,dx=Math.cos(an),dy=Math.sin(an)*.45;g.strokeStyle=a%2?'#3f9a4a':'#2f7d3b';g.lineWidth=4;g.beginPath();g.moveTo(35,34);g.quadraticCurveTo(35+dx*18,24+dy*10-6,35+dx*30,34+dy*12+10);g.stroke()}ell(g,35,36,3,3,'#a07840');return}
  if(k==='pine'){px(g,32,60,6,26,'#6b4a2b');for(let i=0;i<4;i++){const y=14+i*14,wd=14+i*8;tri(g,35,y-10,35-wd,y+16,35+wd,y+16,i%2?'#2f7a47':'#38905a');tri(g,35,y-10,35-wd*.55,y+10,35+wd*.15,y+4,'#46a86a66')}return}
  px(g,31,50,8,36,'#7a5632');px(g,31,50,3,36,'#8f6a3e');px(g,38,56,1,30,'#5a3e20');px(g,27,82,16,4,'#6a4a2a');
  const cols=k==='bodhi'?['#4f9a3c','#5fb04a','#3f8434','#78c25a']:['#3f8e3f','#4fa34a','#337733','#68b85a'];
  for(let i=0;i<9;i++){const a=r()*Math.PI*2,d=r()*18;ell(g,35+Math.cos(a)*d,28+Math.sin(a)*d*.7,15+r()*5,12+r()*4,cols[i%3])}
  for(let i=0;i<22;i++){px(g,(14+r()*42)|0,(10+r()*40)|0,3,2,cols[3])}
  for(let i=0;i<10;i++){px(g,(16+r()*38)|0,(14+r()*36)|0,2,2,sh(cols[2],.8))}
 })}
function lampSpr(c){return sprite(14,46,(g)=>{shadow(g,7,43,5,2,.25);px(g,6,12,2,32,'#40372c');px(g,4,40,6,3,'#2e2820');px(g,3,6,8,8,'#3b3226');px(g,4,7,6,6,c||'#ffd98a');px(g,5,8,4,4,'#fff3c4');g.fillStyle='rgba(255,220,130,.14)';g.beginPath();g.arc(7,10,14,0,Math.PI*2);g.fill()})}
function benchSpr(){return sprite(40,20,(g)=>{shadow(g,20,18,18,3,.2);px(g,2,6,36,4,'#9a6b3f');px(g,2,6,36,1,'#c28b55');px(g,3,10,3,8,'#6e4a2a');px(g,34,10,3,8,'#6e4a2a');px(g,2,1,36,3,'#8a5f36');px(g,3,3,2,5,'#6e4a2a');px(g,35,3,2,5,'#6e4a2a')})}
function potSpr(c){return sprite(16,20,(g)=>{shadow(g,8,18,6,2,.2);px(g,3,10,10,8,'#b5683a');px(g,2,9,12,2,'#c97a46');ell(g,8,7,6,5,'#3f9a4a');for(let i=0;i<4;i++)px(g,4+i*2,3+(i%2)*2,2,2,c||'#ff7aa8')})}
function fenceH(g,x,y,w,c){for(let i=0;i<w;i+=6){px(g,x+i,y,3,12,c);px(g,x+i,y,3,2,sh(c,1.2))}px(g,x,y+3,w,2,sh(c,.9));px(g,x,y+8,w,2,sh(c,.85))}

/* ======================================================================= วัดไทย (640×380) */
function temple(){
 const W=640,Hh=380,[c,g]=mkC(W,Hh),props=[],sol=[];
 grass(g,0,0,W,Hh,11);
 // ลานวัดปูหิน + ทางเดินหิน
 stones(g,196,120,248,106,'#cfc6b0',3);stones(g,300,226,40,154,'#c9bfa8',4);stones(g,60,238,520,22,'#c9bfa8',5);
 g.strokeStyle='#8a806c';g.lineWidth=1;g.strokeRect(196.5,120.5,247,105);g.strokeRect(300.5,226.5,39,153);
 // สระบัว
 ell(g,92,318,56,30,'#6a5a3a');ell(g,92,318,52,27,'#3c88b0');ell(g,86,314,36,17,'#4ea0c4');
 for(let i=0;i<9;i++){const a=60+((i*37)%64),b=304+((i*23)%28);ell(g,a,b,5,2.6,'#3b9a4e');if(i%3==0){px(g,a-1,b-3,3,2,'#ff9ac2');px(g,a,b-4,1,2,'#fff0f6')}}
 // ศาลา (ซ้าย)
 px(g,40,118,114,64,'#00000018');px(g,48,134,98,50,'#c89a62');planks(g,48,150,98,34,'#a67844',5,true);
 for(const x of[52,138])px(g,x,134,6,50,'#7a4f2a');px(g,52,134,2,50,'#9a6a3a');px(g,138,134,2,50,'#9a6a3a');
 tri(g,30,136,97,98,164,136,'#b8452e');roofRows(g,34,128,126,10,'#c24f32','#a93f28',5);tri(g,44,132,97,104,150,132,'#cf5a38');px(g,30,134,134,3,'#7a2c1c');
 tri(g,97,92,92,104,102,104,'#e8b948');
 for(let i=0;i<3;i++){px(g,62+i*28,172,20,4,'#6e4a2a');px(g,63+i*28,176,2,8,'#5a3a1e');px(g,77+i*28,176,2,8,'#5a3a1e')}
 // อุโบสถ (กลาง)
 const ux=224,uy=26,uw=192;
 px(g,ux-8,uy+88,uw+16,34,'#00000020');
 px(g,ux,uy+60,uw,60,'#f3ead2');px(g,ux,uy+60,uw,4,'#d8c9a0');for(let i=0;i<uw;i+=12)px(g,ux+i,uy+64,1,52,'#e0d5b8');
 px(g,ux-6,uy+112,uw+12,8,'#d9cda8');px(g,ux-12,uy+120,uw+24,6,'#c4b48a');
 for(const i of[0,1,2,3,4,5,6]){const x=ux+10+i*25;px(g,x,uy+66,8,50,'#b8332a');px(g,x,uy+66,2,50,'#d4503f');px(g,x,uy+66,8,3,'#e8b948')}
 // ประตู + หน้าต่าง
 px(g,ux+82,uy+78,28,42,'#e8b948');px(g,ux+85,uy+82,22,38,'#7a2c1c');px(g,ux+95,uy+82,2,38,'#e8b948');px(g,ux+88,uy+98,3,3,'#e8b948');px(g,ux+100,uy+98,3,3,'#e8b948');tri(g,ux+80,uy+78,ux+96,uy+68,ux+112,uy+78,'#e8b948');
 for(const x of[ux+34,ux+142]){px(g,x,uy+82,16,22,'#e8b948');px(g,x+2,uy+84,12,18,'#2c3b6a');px(g,x+7,uy+84,2,18,'#e8b948');px(g,x+2,uy+92,12,1,'#e8b948')}
 // หลังคาซ้อน 3 ชั้น
 const tier=(x,y,w,h,a,b)=>{tri(g,x-8,y+h,x+w/2,y,x+w+8,y+h,a);roofRows(g,x-2,y+h*.5,w+4,h*.5,b,a,4);px(g,x-8,y+h-2,w+16,3,'#7a2c1c');px(g,x-8,y+h+1,w+16,2,'#e8b948');tri(g,x+w/2,y-8,x+w/2-4,y+4,x+w/2+4,y+4,'#e8b948')};
 tier(ux-6,uy+26,uw+12,40,'#d2542f','#b8442a');tier(ux+14,uy+4,uw-28,36,'#e0683a','#c4522e');
 px(g,ux+uw/2-1,uy-12,2,12,'#e8b948');tri(g,ux+uw/2,uy-20,ux+uw/2-3,uy-8,ux+uw/2+3,uy-8,'#f3d36a');
 for(const x of[ux-12,ux+uw+4]){tri(g,x,uy+62,x+4,uy+48,x+8,uy+62,'#e8b948')}
 // เจดีย์ทอง (ขวา)
 const cx=520,cb=206;px(g,cx-34,cb-2,68,10,'#00000020');
 px(g,cx-32,cb-12,64,12,'#f3ead2');px(g,cx-32,cb-12,64,2,'#d8c9a0');px(g,cx-26,cb-22,52,10,'#e8d9a8');px(g,cx-20,cb-30,40,8,'#f3d36a');
 g.fillStyle='#e8b948';g.beginPath();g.moveTo(cx-18,cb-30);g.quadraticCurveTo(cx-20,cb-72,cx,cb-90);g.quadraticCurveTo(cx+20,cb-72,cx+18,cb-30);g.closePath();g.fill();
 g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.moveTo(cx-14,cb-34);g.quadraticCurveTo(cx-16,cb-68,cx-2,cb-84);g.quadraticCurveTo(cx-8,cb-60,cx-8,cb-34);g.fill();
 for(let i=0;i<5;i++)px(g,cx-16+i*1.5,cb-40-i*8,32-i*3,2,'#c99a2e');px(g,cx-1,cb-112,2,24,'#f3d36a');for(let i=0;i<4;i++)px(g,cx-4+i,cb-104+i*5,8-i*2,2,'#f3d36a');
 // ต้นไม้/พุ่ม/แปลงดอกไม้
 for(const [x,y,w,h,s] of[[8,40,54,56,21],[580,30,52,60,22],[150,196,50,30,23],[444,290,60,24,24]]){grass(g,x,y,w,h,s,['#4f9a48','#5fae52','#3f8a40','#74bd5b']);flowers(g,x,y,w,h,s+9,['#ff7aa8','#ffd45a','#fff','#ff8f4a'],18)}
 // รั้ววัด
 fenceH(g,0,358,246,'#e8dcc0');fenceH(g,394,358,246,'#e8dcc0');px(g,246,352,6,28,'#d9c9a0');px(g,388,352,6,28,'#d9c9a0');px(g,246,350,6,3,'#e8b948');px(g,388,350,6,3,'#e8b948');
 px(g,254,354,132,3,'#b8332a');
 // ป้ายชื่อวัด
 px(g,120,330,104,16,'#6e4a2a');px(g,122,332,100,12,'#c89a62');label(g,172,341,'วัดประจำเมือง','#3a1f0a');
 const marks={sol:sol,props:props};
 // ของใช้ชั้นพื้น: โต๊ะทำบุญ/ถวายอาหาร
 const table=(x,y,w,items)=>{px(g,x,y,w,14,'#00000022');px(g,x,y-4,w,12,'#a8341f');px(g,x,y-4,w,2,'#d4503f');px(g,x+2,y+8,3,10,'#5a3a1e');px(g,x+w-5,y+8,3,10,'#5a3a1e');items(x,y-4)};
 table(262,156,116,(x,y)=>{for(let i=0;i<4;i++){px(g,x+10+i*12,y-6,3,6,'#ff7aa8');px(g,x+11+i*12,y-9,1,4,'#fff')}for(let i=0;i<3;i++){px(g,x+62+i*14,y-9,2,9,'#f4e0a0');px(g,x+62+i*14,y-11,2,2,'#ff9a30')}ell(g,x+100,y-2,6,3,'#e8b948');px(g,x+96,y-4,8,3,'#c99a2e')});
 table(54,196,64,(x,y)=>{for(let i=0;i<3;i++){ell(g,x+12+i*18,y-2,6,3,'#f1e6c6');ell(g,x+12+i*18,y-3,5,2,'#fff8e0')}});
 // กล่องรับบริจาค + ระฆัง
 px(g,474,236,18,22,'#00000022');px(g,476,222,14,22,'#c24f32');px(g,476,222,14,3,'#e8b948');px(g,479,229,8,2,'#2a160c');
 px(g,420,270,2,38,'#6e4a2a');px(g,436,270,2,38,'#6e4a2a');px(g,420,270,18,2,'#6e4a2a');ell(g,429,282,6,7,'#c99a2e');px(g,426,276,6,2,'#e8d36a');
 // ธูป/กระถาง
 px(g,456,200,14,10,'#00000022');px(g,456,196,14,12,'#8a5a30');px(g,456,196,14,2,'#b8803c');for(let i=0;i<4;i++)px(g,459+i*3,186,1,10,'#c94a2f');
 return{c,w:W,h:Hh,mk:marks};
}

/* ======================================================================= โบสถ์ภายนอก (640×380) */
function church(){
 const W=640,Hh=380,[c,g]=mkC(W,Hh);
 grass(g,0,0,W,Hh,31,['#5aa045','#69b252','#4d9140','#7cc15c']);
 stones(g,272,222,96,158,'#d8cfbc',32);stones(g,150,268,340,22,'#d2c8b2',33);
 g.strokeStyle='#8a806c';g.strokeRect(272.5,222.5,95,157);
 // ตัวโบสถ์
 const bx=200,by=92,bw=240;
 px(g,bx-6,by+98,bw+12,16,'#00000024');
 px(g,bx,by+58,bw,70,'#e6dcc4');for(let j=0;j<70;j+=7)for(let i=((j/7)&1)*8;i<bw;i+=16)px(g,bx+i,by+58+j,15,6,(i+j)%3?'#ddd2b6':'#e9e0ca');
 px(g,bx,by+122,bw,6,'#b8aa88');
 // หลังคาหลัก
 tri(g,bx-14,by+62,bx+bw/2,by-14,bx+bw+14,by+62,'#4a4f66');roofRows(g,bx-8,by+38,bw+16,26,'#566078','#47506a',4);tri(g,bx+bw/2,by-20,bx+bw/2-6,by-6,bx+bw/2+6,by-6,'#2d3146');
 px(g,bx-14,by+60,bw+28,3,'#2d3146');
 // หน้าต่างกุหลาบ + ประตู
 ell(g,bx+bw/2,by+66,20,20,'#3a4160');ell(g,bx+bw/2,by+66,17,17,'#d9a73c');
 for(let a=0;a<8;a++){const an=a/8*Math.PI*2;line(g,bx+bw/2,by+66,bx+bw/2+Math.cos(an)*17,by+66+Math.sin(an)*17,'#3a4160',1.2);ell(g,bx+bw/2+Math.cos(an)*10,by+66+Math.sin(an)*10,4,4,['#d94a4a','#3a7fd1','#3fae6b','#8b4fc4'][a%4])}
 ell(g,bx+bw/2,by+66,4,4,'#fff0b0');
 px(g,bx+bw/2-18,by+88,36,40,'#5a3a22');g.save();g.beginPath();g.rect(bx+bw/2-16,by+98,32,30);g.ellipse(bx+bw/2,by+98,16,12,0,Math.PI,0);g.clip();px(g,bx+bw/2-16,by+84,32,44,'#7a4f2c');px(g,bx+bw/2-1,by+84,2,44,'#4a2f1a');for(let j=0;j<44;j+=6)px(g,bx+bw/2-16,by+86+j,32,1,'#5a3a22');g.restore();
 px(g,bx+bw/2-4,by+110,2,2,'#e8b948');px(g,bx+bw/2+2,by+110,2,2,'#e8b948');
 g.strokeStyle='#8a7a5a';g.lineWidth=2;g.beginPath();g.moveTo(bx+bw/2-18,by+128);g.lineTo(bx+bw/2-18,by+98);g.ellipse(bx+bw/2,by+98,18,14,0,Math.PI,0);g.lineTo(bx+bw/2+18,by+128);g.stroke();
 for(const x of[bx+24,bx+60,bx+148,bx+184])stained(g,x,by+84,14,34,x,true);
 // หอระฆัง
 const tx=bx-48,tw=44;px(g,tx-4,by+98,tw+8,16,'#00000024');
 px(g,tx,by-4,tw,132,'#e0d6bc');for(let j=0;j<132;j+=7)for(let i=((j/7)&1)*8;i<tw;i+=16)px(g,tx+i,by-4+j,15,6,(i+j)%3?'#d6ccb0':'#e6dcc4');px(g,tx,by-4,3,132,'#f0e8d4');px(g,tx+tw-3,by-4,3,132,'#b8aa88');
 px(g,tx,by+42,tw,3,'#b8aa88');px(g,tx,by+90,tw,3,'#b8aa88');
 tri(g,tx-6,by-4,tx+tw/2,by-52,tx+tw+6,by-4,'#4a4f66');roofRows(g,tx,by-28,tw,24,'#566078','#47506a',4);px(g,tx+tw/2-1,by-76,2,26,'#c99a2e');cross(g,tx+tw/2,by-92,18,'#e8c96a');
 px(g,tx+8,by+4,28,34,'#2c3150');g.save();g.beginPath();g.rect(tx+8,by+4,28,34);g.clip();ell(g,tx+22,by+26,9,10,'#c99a2e');px(g,tx+13,by+24,18,2,'#a07a1e');px(g,tx+21,by+34,2,5,'#e8c96a');g.restore();
 px(g,tx+8,by+4,28,3,'#e0d6bc');stained(g,tx+14,by+58,16,28,77,true);
 // รั้วหินเตี้ย + ประตูทางเข้า
 const fence=(x,w)=>{px(g,x,350,w,14,'#cfc4aa');for(let i=0;i<w;i+=8)px(g,x+i,346,5,8,'#d9cfb6');px(g,x,350,w,2,'#ece2c8')};
 fence(0,262);fence(378,262);px(g,262,336,12,34,'#bfb294');px(g,366,336,12,34,'#bfb294');px(g,262,332,12,4,'#d9cfb6');px(g,366,332,12,4,'#d9cfb6');
 // ป้ายชื่อโบสถ์
 px(g,60,322,164,18,'#3a2a1a');px(g,62,324,160,14,'#6b4a2c');px(g,64,326,156,10,'#8a6238');label(g,142,333,'โบสถ์ประจำเมือง','#fff3d0');
 // แปลงดอกไม้
 for(const [x,y,w,h,s] of[[40,176,110,70,41],[490,176,110,70,42],[30,96,100,50,43],[510,96,100,50,44]]){px(g,x-2,y-2,w+4,h+4,'#8a6a46');px(g,x,y,w,h,'#5a3f28');grass(g,x+2,y+2,w-4,h-4,s,['#4d9a45','#5aa84e','#3f8a3f','#6fba58']);flowers(g,x+2,y+2,w-4,h-4,s+5,['#ff5a7a','#ffd45a','#fff','#b77aff','#ff9a3a','#5ab0ff'],46)}
 // สระน้ำพุเล็ก
 ell(g,320,308,24,10,'#9aa0a8');ell(g,320,306,21,8,'#5aa9d6');px(g,318,292,4,14,'#bfc4cc');ell(g,320,292,6,2,'#d5dae0');for(let i=0;i<6;i++)px(g,318+((i*3)%7),284+((i*5)%9),1,2,'#cfe8ff');
 return{c,w:W,h:Hh};
}

/* ======================================================================= โบสถ์ภายใน (480×300) */
function churchIn(){
 const W=480,Hh=300,[c,g]=mkC(W,Hh);
 planks(g,0,0,W,Hh,'#8a5a30',51);px(g,0,0,W,86,'#d9cfb6');
 for(let j=0;j<86;j+=8)for(let i=((j/8)&1)*8;i<W;i+=16)px(g,i,j,15,7,(i+j)%3?'#d2c7ac':'#ddd3bb');
 px(g,0,84,W,4,'#b8aa88');px(g,0,0,W,5,'#6b4a2c');
 // เสา/ซุ้มโค้ง
 for(const x of[52,160,320,428]){px(g,x-9,0,18,90,'#c9bd9f');px(g,x-9,0,4,90,'#e3d9c0');px(g,x+5,0,4,90,'#a89a78');px(g,x-11,86,22,6,'#b8aa88')}
 // หน้าต่างกระจกสี (ผนังบน)
 for(const x of[92,128,352,388])stained(g,x-9,12,18,56,x*3,true);
 for(const x of[216,264])stained(g,x-9,16,18,52,x,true);
 // แท่นบูชา
 px(g,170,76,140,34,'#00000030');px(g,172,66,136,38,'#a8793f');px(g,172,66,136,4,'#d0a060');planks(g,172,70,136,34,'#9a6a36',52,true);
 px(g,214,40,52,38,'#efe6cc');px(g,214,40,52,3,'#d9ceac');px(g,208,36,64,6,'#c99a2e');cross(g,240,10,36,'#e8c96a');px(g,238,38,4,12,'#c99a2e');
 for(const x of[196,274])for(const y of[44])px(g,x,y,5,22,'#e0d09a'),px(g,x+1,y-6,3,6,'#ff9a30'),px(g,x+2,y-9,1,4,'#ffe27a');
 // แท่นอ่านพระคัมภีร์
 px(g,118,76,26,32,'#6b4a2c');px(g,114,70,34,10,'#8a6238');px(g,122,66,18,6,'#efe6cc');px(g,136,62,6,6,'#c94a2f');
 // พรมกลาง
 px(g,208,110,64,190,'#7a1f2a');px(g,210,110,60,190,'#9a2a36');px(g,208,110,3,190,'#e8b948');px(g,269,110,3,190,'#e8b948');for(let j=114;j<300;j+=14){px(g,226,j,28,1,'#c9893a')}
 // เก้าอี้ม้านั่ง
 const pew=(x,y,w)=>{px(g,x,y+13,w,3,'#00000028');px(g,x,y,w,12,'#6b4220');px(g,x,y,w,3,'#a06a38');px(g,x,y+8,w,4,'#58361a');px(g,x,y-8,w,8,'#7a4d26');px(g,x,y-8,w,2,'#b07a44');px(g,x-2,y-8,3,22,'#4a2c14');px(g,x+w-1,y-8,3,22,'#4a2c14')};
 for(let r=0;r<5;r++){pew(60,130+r*30,118);pew(302,130+r*30,118)}
 // แสงจากกระจกสี
 g.save();g.globalCompositeOperation='screen';const cols=['rgba(217,74,74,.18)','rgba(232,183,60,.18)','rgba(58,127,209,.2)','rgba(63,174,107,.18)'];
 [[92,0],[128,1],[352,2],[388,3]].forEach(([x,i])=>{g.fillStyle=cols[i];g.beginPath();g.moveTo(x-7,70);g.lineTo(x+7,70);g.lineTo(x+(x<240?58:-58)+14,220);g.lineTo(x+(x<240?58:-58)-14,220);g.closePath();g.fill()});g.restore();
 // โคมไฟ
 for(const [x,y] of[[100,100],[380,100],[100,200],[380,200]]){line(g,x,0,x,y-8,'#3a2e22',1);ell(g,x,y,5,5,'#ffd98a');g.fillStyle='rgba(255,220,130,.14)';g.beginPath();g.arc(x,y,24,0,Math.PI*2);g.fill()}
 // ประตูด้านล่าง
 px(g,208,286,64,14,'#5a3a22');px(g,212,288,56,12,'#3a2414');px(g,205,284,70,3,'#c99a2e');
 // ระฆังประตู ธูปเทียนข้างผนัง
 for(const x of[30,450]){px(g,x-8,150,16,40,'#a8793f');px(g,x-8,146,16,4,'#d0a060');for(let i=0;i<3;i++){px(g,x-6+i*5,136,2,10,'#efe6cc');px(g,x-6+i*5,132,2,4,'#ff9a30')}}
 return{c,w:W,h:Hh};
}

/* ======================================================================= มัสยิดภายนอก (640×380) */
function mosque(){
 const W=640,Hh=380,[c,g]=mkC(W,Hh);
 px(g,0,0,W,Hh,'#d9c9a0');
 tiles(g,0,0,W,Hh,'#e4d6b0','#dccea6',10,61);
 // สวนด้านบน/ข้าง
 for(const [x,y,w,h,s] of[[0,0,70,160,62],[570,0,70,160,63],[0,230,110,60,64],[530,230,110,60,65]]){grass(g,x,y,w,h,s,['#5a9a4a','#69ab55','#4a8a40','#7bbd60']);flowers(g,x,y,w,h,s+3,['#ff7aa8','#ffd45a','#fff','#c99aff'],16)}
 // พรมทางเดินกลางลาย geometric
 geo(g,296,204,48,176,'#2c6a62','#8fd8c8');px(g,294,204,3,176,'#e8c96a');px(g,343,204,3,176,'#e8c96a');
 // ตัวมัสยิด
 const mx=170,my=76,mw=300;
 px(g,mx-8,my+104,mw+16,16,'#00000026');
 px(g,mx,my+56,mw,70,'#f4efe0');px(g,mx,my+56,mw,3,'#d8cfb4');px(g,mx,my+120,mw,6,'#b8aa88');
 geo(g,mx,my+104,mw,16,'#2c6a62','#8fd8c8');
 // ซุ้มโค้งหน้าต่าง
 for(let i=0;i<6;i++){const x=mx+18+i*46;if(i===3)continue;px(g,x,my+74,20,30,'#2c6a62');g.save();g.beginPath();g.rect(x,my+84,20,20);g.ellipse(x+10,my+84,10,10,0,Math.PI,0);g.clip();px(g,x,my+70,20,36,'#3a8f86');for(let j=0;j<36;j+=4)px(g,x,my+70+j,20,1,'#5ab0a4');g.restore();g.strokeStyle='#e8c96a';g.lineWidth=1.2;g.beginPath();g.moveTo(x,my+104);g.lineTo(x,my+84);g.ellipse(x+10,my+84,10,10,0,Math.PI,0);g.lineTo(x+20,my+104);g.stroke()}
 // ประตูโค้งกลาง
 const dx=mx+mw/2;px(g,dx-24,my+70,48,52,'#e8c96a');g.save();g.beginPath();g.rect(dx-20,my+88,40,36);g.ellipse(dx,my+88,20,22,0,Math.PI,0);g.clip();px(g,dx-20,my+66,40,60,'#2a1f14');px(g,dx-20,my+66,40,60,'#3a2a1a');for(let j=0;j<58;j+=5)px(g,dx-20,my+68+j,40,1,'#5a4026');px(g,dx-1,my+66,2,60,'#e8c96a');g.restore();
 // โดมกลางและโดมข้าง
 px(g,dx-50,my+26,100,40,'#f4efe0');geo(g,dx-50,my+54,100,10,'#2c6a62','#8fd8c8');dome(g,dx,my+30,46,'#2f8f84','#e8c96a');crescent(g,dx,my-34,7,'#f0d36a');
 for(const x of[mx+34,mx+mw-34]){px(g,x-22,my+44,44,18,'#f4efe0');dome(g,x,my+46,22,'#3aa396','#e8c96a');crescent(g,x,my+4,4,'#f0d36a')}
 // หออะซาน
 const nx=mx+mw+22;px(g,nx-12,my+104,40,16,'#00000026');
 px(g,nx,my-30,22,150,'#f4efe0');px(g,nx,my-30,3,150,'#fff');px(g,nx+19,my-30,3,150,'#cfc4aa');
 for(let j=0;j<5;j++){px(g,nx-2,my-10+j*26,26,3,'#2c6a62');px(g,nx+4,my+4+j*26,14,8,'#3a8f86')}
 px(g,nx-4,my-34,30,5,'#2c6a62');dome(g,nx+11,my-34,12,'#2f8f84','#e8c96a');crescent(g,nx+11,my-62,5,'#f0d36a');
 // อ่างอาบน้ำละหมาด (ซ้าย)
 px(g,34,246,86,6,'#00000020');px(g,34,210,86,42,'#e0d4b0');px(g,34,210,86,4,'#2c6a62');px(g,32,206,90,6,'#8a6a46');
 for(let i=0;i<4;i++){px(g,42+i*20,220,4,10,'#9aa0a8');px(g,41+i*20,218,6,3,'#c0c6ce');px(g,43+i*20,230,2,6,'#7ec8f0');px(g,40+i*20,236,8,3,'#6ab8e0')}
 px(g,36,246,82,4,'#6ab8e0');
 // ชั้นวางรองเท้า (ข้างประตู)
 const rack=(x,y)=>{px(g,x,y+14,52,3,'#00000024');px(g,x,y,52,14,'#7a5532');px(g,x,y,52,2,'#a8784a');px(g,x,y+6,52,2,'#5a3a1e');for(let i=0;i<5;i++){px(g,x+3+i*10,y-4,7,4,['#3a4a8a','#8a3a3a','#2a2a2a','#c9a95a','#3a7a5a'][i]);px(g,x+3+i*10,y+3,7,3,['#c9a95a','#2a2a2a','#7a5532','#3a4a8a','#8a3a3a'][i])}};
 rack(206,232);rack(382,232);
 // กำแพง/ประตูทางเข้า
 const wall=(x,w)=>{px(g,x,352,w,14,'#f1e9d2');px(g,x,352,w,2,'#fff');px(g,x,364,w,3,'#c9bc98');geo(g,x,356,w,6,'#2c6a62','#8fd8c8')};
 wall(0,262);wall(378,262);for(const x of[258,372]){px(g,x,326,10,42,'#e8dfc4');px(g,x,326,10,3,'#2c6a62');dome(g,x+5,326,6,'#2f8f84','#e8c96a')}
 px(g,40,320,172,16,'#1f4a44');px(g,42,322,168,12,'#2c6a62');label(g,126,331,'มัสยิดประจำเมือง','#e8f5ef');
 // โต๊ะแบ่งปันอาหาร (รอมฎอน/อีด) — วาดฐานเปล่าไว้ ของบนโต๊ะวาดตอนรันไทม์
 return{c,w:W,h:Hh};
}

/* ======================================================================= มัสยิดภายใน (480×300) */
function mosqueIn(){
 const W=480,Hh=300,[c,g]=mkC(W,Hh);
 px(g,0,0,W,Hh,'#2a6a5e');
 // พรมละหมาด: แถวพรมเล็กหันหา mihrab
 geo(g,0,92,W,208,'#226157','#3f9b8a');px(g,0,92,W,3,'#e8c96a');
 for(let r=0;r<5;r++)for(let i=0;i<9;i++){const x=60+i*40,y=132+r*30;px(g,x,y,30,22,'#7a1f3a');px(g,x+2,y+2,26,18,'#a02a4a');px(g,x+4,y+4,22,14,'#8a2440');tri(g,x+15,y+3,x+9,y+11,x+21,y+11,'#e8c96a');px(g,x,y,30,1,'#e8c96a');px(g,x,y+21,30,1,'#e8c96a')}
 // ผนังบน + ซุ้ม
 px(g,0,0,W,96,'#f1e9d2');geo(g,0,70,W,22,'#2c6a62','#8fd8c8');px(g,0,92,W,4,'#c99a2e');px(g,0,0,W,6,'#c99a2e');
 for(let i=0;i<7;i++){const x=20+i*66;if(i===3)continue;g.save();g.beginPath();g.rect(x,30,32,40);g.ellipse(x+16,30,16,18,0,Math.PI,0);g.clip();px(g,x,8,32,64,'#3a8f86');for(let j=0;j<64;j+=4)px(g,x,8+j,32,1,'#5ab0a4');px(g,x+15,8,2,64,'#e8c96a');px(g,x,38,32,1.4,'#e8c96a');g.restore();g.strokeStyle='#c99a2e';g.lineWidth=1.5;g.beginPath();g.moveTo(x,70);g.lineTo(x,30);g.ellipse(x+16,30,16,18,0,Math.PI,0);g.lineTo(x+32,70);g.stroke()}
 // มิห์รอบ (ช่องกลาง)
 const mx=240;px(g,mx-34,6,68,88,'#c99a2e');g.save();g.beginPath();g.rect(mx-28,36,56,58);g.ellipse(mx,36,28,32,0,Math.PI,0);g.clip();px(g,mx-30,0,60,96,'#17483f');geo(g,mx-30,0,60,96,'#1b5a50','#e8c96a');ell(g,mx,40,18,22,'#0d332c');g.restore();crescent(g,mx,20,6,'#f0d36a');
 // มินบาร์
 px(g,330,40,56,54,'#6b4220');for(let i=0;i<6;i++)px(g,330+i*2,90-i*7,56-i*2,7,i%2?'#8a5a30':'#7a4d26');px(g,340,38,36,4,'#c99a2e');tri(g,340,38,358,16,376,38,'#8a5a30');px(g,355,14,6,3,'#e8c96a');
 // ชั้นหนังสือ/ที่วางอัลกุรอาน
 px(g,70,52,44,42,'#6b4220');for(let j=0;j<3;j++){px(g,72,56+j*12,40,2,'#4a2c14');for(let i=0;i<7;i++)px(g,74+i*5.5,44+j*12+4,4,10,['#1f5a50','#7a1f3a','#c99a2e','#2a3a7a'][(i+j)%4])}
 // เสา
 for(const x of[40,440]){px(g,x-8,96,16,200,'#efe6cc');px(g,x-8,96,3,200,'#fff');px(g,x+5,96,3,200,'#c9bc98');geo(g,x-8,150,16,24,'#2c6a62','#8fd8c8');px(g,x-10,92,20,6,'#c99a2e')}
 // โคมไฟระย้า
 for(const [x,y] of[[130,110],[350,110],[240,190]]){line(g,x,0,x,y-10,'#6a5a3a',1);for(let i=-2;i<=2;i++)ell(g,x+i*7,y+Math.abs(i)*2,3,3,'#ffd98a');px(g,x-12,y-8,24,2,'#c99a2e');g.fillStyle='rgba(255,220,130,.13)';g.beginPath();g.arc(x,y,30,0,Math.PI*2);g.fill()}
 // แสงธรรมชาติจากหน้าต่าง
 g.save();g.globalCompositeOperation='screen';g.fillStyle='rgba(255,236,170,.10)';for(const x of[20,86,152,284,350,416]){g.beginPath();g.moveTo(x,60);g.lineTo(x+32,60);g.lineTo(x+72,230);g.lineTo(x+16,230);g.closePath();g.fill()}g.restore();
 // ประตู + ชั้นวางรองเท้าด้านใน (พื้นที่ใกล้ประตู)
 px(g,208,286,64,14,'#5a3a22');px(g,212,288,56,12,'#3a2414');px(g,205,284,70,3,'#c99a2e');
 return{c,w:W,h:Hh};
}

window.REL=window.REL||{};
REL.art={temple,church,church_in:churchIn,mosque,mosque_in:mosqueIn,sprite,treeSpr,lampSpr,benchSpr,potSpr,px,sh,ell,rng,mkC};
})();

/* =====================================================================
   REL.quests — ภารกิจ/เนื้อเรื่องชุมชน (Daily · Community · Festival · Relationship · Secret)
   ทุกภารกิจเล่นจริง: เดินทาง สำรวจ พูดคุย ช่วยเหลือ NPC ตัดสินใจ เข้าร่วมกิจกรรม
   รางวัลเท่ากันทุกศาสนา · ไม่มีบทลงโทษหากไม่ทำ · ไม่มีภารกิจของศาสนาที่ไม่ได้เลือก
   ===================================================================== */
(function(){
'use strict';
const REL=window.REL;
const CATN={daily:'กิจวัตร',community:'ชุมชน',festival:'เทศกาล',relationship:'ความสัมพันธ์',secret:'ลับ'};
const CATI={daily:'📆',community:'🤝',festival:'🎊',relationship:'💞',secret:'🗝️'};
const RWQ={daily:{money:300,rel:2},community:{money:400,rel:3},festival:{money:600,rel:3},relationship:{money:500,rel:3},secret:{money:800,rel:4,souv:true}};
const FESTIDS=['makha','visakha','asalha','phansa','okphansa','easter','goodfri','xmasprep','christmas','iftar','eidfitr','eidadha'];
const CL={buddhism:'monk',christianity:'priest',islam:'imam'};
const PL={buddhism:'temple',christianity:'church',islam:'mosque'};
const CLN={buddhism:'พระอาจารย์',christianity:'บาทหลวง',islam:'อิหม่าม'};

/* ---------- ข้อมูลภารกิจ ---------- */
const Q=[];
const q=(o)=>Q.push(o);
// ====== พุทธ
q({id:'bd_daily',rel:'buddhism',cat:'daily',title:'บุญประจำสัปดาห์',steps:[{t:'count',obj:'ร่วมกิจกรรมที่วัดหรือใส่บาตรให้ครบ 3 ครั้ง',n:3}]});
q({id:'bd_comm',rel:'buddhism',cat:'community',title:'ช่วยกวาดลานวัด',steps:[
 {t:'talk',who:'monk',obj:'ไปคุยกับพระอาจารย์ที่วัดประจำเมือง',lines:['โยมมาพอดี ลานวัดมีใบไม้ร่วงเต็มไปหมด','ช่วยกวาดให้สัก 3 กองได้ไหม']},
 {t:'use',spot:'sweep',n:3,obj:'กวาดกองใบไม้ในลานวัด'},
 {t:'talk',who:'monk',obj:'กลับไปแจ้งพระอาจารย์',lines:['สะอาดตาขึ้นเยอะเลย อนุโมทนาบุญด้วยนะโยม']}]});
q({id:'bd_fest',rel:'buddhism',cat:'festival',title:'ค่ำคืนแห่งแสงเทียน',steps:[
 {t:'enter',place:'temple',obj:'เดินทางไปวัดในวันสำคัญ'},{t:'act',any:'festival',obj:'เวียนเทียนรอบเจดีย์ (ช่วง 18:00–20:00)'},
 {t:'talk',who:'monk',obj:'พูดคุยกับพระอาจารย์หลังเวียนเทียน',lines:['เสียงสวดและแสงเทียนวันนี้งดงามนัก','ขอให้ใจโยมสว่างเหมือนแสงเทียนนี้']}]});
q({id:'bd_rel',rel:'buddhism',cat:'relationship',title:'ธรรมะข้างทาง',need:{npc:'monk',n:3},steps:[
 {t:'talk',who:'monk',obj:'ขอฟังธรรมะสั้น ๆ จากพระอาจารย์',lines:['โยมเคยรู้สึกเหนื่อยจากการงานบ้างไหม?'],choice:[{t:'เหนื่อยบ่อยเลยครับ',l:['เมื่อใจหนัก ลองวางงานไว้สักครู่ แล้วดูลมหายใจ'],r:2},{t:'ยังสู้ไหวครับ',l:['ดีแล้ว แต่อย่าลืมพักเมื่อควรพัก'],r:2}]},
 {t:'use',spot:'bodhi',obj:'นั่งพักใต้ต้นโพธิ์ครู่หนึ่ง'},
 {t:'talk',who:'monk',obj:'กลับไปคุยกับพระอาจารย์',lines:['ต้นโพธิ์ต้นนี้ผ่านมาหลายร้อยปี ยังยืนหยัดเงียบ ๆ','ความสงบไม่ต้องใช้คำมาก']}]});
q({id:'bd_sec',rel:'buddhism',cat:'secret',title:'บุญเก่าใต้ลานวัด',steps:[
 {t:'use',spot:'secret',obj:'สำรวจมุมสงบของลานวัดด้านขวาล่าง (มีของบางอย่างอยู่)',found:'พบตลับไม้เก่าใต้ต้นไม้ มีกระดาษพับเก็บไว้ ตัวหนังสือจางมาก'},
 {t:'talk',who:'member',obj:'ถามสมาชิกชุมชนที่เดินอยู่ในวัดว่าตลับนี้ของใคร',lines:['ตลับนี้…ของสามีป้าเอง เขาเคยฝากไว้ก่อนเสีย','ขอบใจที่เก็บมาให้นะ ป้าเก็บไว้เป็นที่ระลึกจ้ะ']},
 {t:'talk',who:'monk',obj:'เล่าให้พระอาจารย์ฟัง',lines:['บางสิ่งที่หายไปก็หาทางกลับมาหาเจ้าของเอง','เป็นบุญของโยมแล้ว']}]});
// ====== คริสต์
q({id:'ch_daily',rel:'christianity',cat:'daily',title:'ใจที่มาร่วมพิธี',steps:[{t:'count',obj:'เข้าร่วมพิธีที่โบสถ์ให้ครบ 3 ครั้ง',n:3}]});
q({id:'ch_comm',rel:'christianity',cat:'community',title:'ดอกไม้ประดับโบสถ์',steps:[
 {t:'talk',who:'priest',obj:'ไปคุยกับบาทหลวงที่โบสถ์ประจำเมือง',lines:['ดอกไม้บนแท่นเริ่มเหี่ยวแล้ว','ช่วยเก็บดอกไม้จากสวนหน้าโบสถ์ให้หน่อยได้ไหม?']},
 {t:'use',spot:'garden',n:3,obj:'เก็บดอกไม้จากสวนหน้าโบสถ์'},
 {t:'talk',who:'priest',obj:'นำดอกไม้ไปให้บาทหลวง',lines:['สวยจริง ๆ ขอบคุณมากครับ','ชุมชนของเราอบอุ่นขึ้นเพราะน้ำใจแบบนี้']}]});
q({id:'ch_fest',rel:'christianity',cat:'festival',title:'ฉลองร่วมกับชุมชน',steps:[
 {t:'enter',place:'church',obj:'เดินทางไปโบสถ์ในวันสำคัญ'},{t:'act',any:'festival',obj:'เข้าร่วมพิธีหรือเตรียมงานเทศกาล'},
 {t:'talk',who:'priest',obj:'พูดคุยกับบาทหลวงหลังพิธี',lines:['ขอบคุณที่มาร่วมฉลองวันนี้','สุขสันต์วันสำคัญนะครับ']}]});
q({id:'ch_rel',rel:'christianity',cat:'relationship',title:'บทสนทนาข้างแท่น',need:{npc:'priest',n:3},steps:[
 {t:'talk',who:'priest',obj:'พูดคุยกับบาทหลวงเรื่องการให้อภัย',lines:['คุณเคยมีเรื่องที่ยังให้อภัยตัวเองไม่ได้ไหม?'],choice:[{t:'มีบ้างครับ',l:['ทุกคนมี เริ่มจากให้เวลากับใจก่อน'],r:2},{t:'พยายามเรียนรู้อยู่ครับ',l:['นั่นคือก้าวที่งดงามแล้ว'],r:2}]},
 {t:'use',spot:'altar',obj:'จุดเทียนที่แท่นบูชาภายในโบสถ์'},
 {t:'talk',who:'priest',obj:'กลับไปคุยกับบาทหลวง',lines:['เทียนเล่มเล็กก็ส่องห้องมืดได้ทั้งห้อง']}]});
q({id:'ch_sec',rel:'christianity',cat:'secret',title:'จดหมายใต้ม้านั่งสวน',steps:[
 {t:'use',spot:'secret',obj:'สำรวจพื้นที่ใกล้น้ำพุทางซ้ายล่างของลานโบสถ์',found:'พบซองจดหมายหน้าซีด ใส่อยู่ในกระถางใกล้น้ำพุ ไม่มีชื่อผู้รับ'},
 {t:'talk',who:'member',obj:'ถามสมาชิกชุมชนว่าซองนี้ของใคร',lines:['อ๊ะ นี่ลายมือเด็กในชุมชนที่ย้ายออกไปเมื่อปีก่อน','ฝากไว้ให้บาทหลวงเถอะ เขาน่าจะรู้ว่าจะส่งถึงใคร']},
 {t:'talk',who:'priest',obj:'มอบซองให้บาทหลวง',lines:['ขอบคุณที่ใส่ใจครับ จะส่งต่อให้ถึงมือเจ้าของ','เรื่องเล็ก ๆ แบบนี้แหละที่ทำให้ชุมชนมีชีวิต']}]});
// ====== อิสลาม
q({id:'is_daily',rel:'islam',cat:'daily',title:'ความสงบประจำสัปดาห์',steps:[{t:'count',obj:'ร่วมละหมาดหรือกิจกรรมที่มัสยิดให้ครบ 3 ครั้ง',n:3}]});
q({id:'is_comm',rel:'islam',cat:'community',title:'จัดระเบียบรองเท้า',steps:[
 {t:'talk',who:'imam',obj:'ไปคุยกับอิหม่ามที่มัสยิดประจำเมือง',lines:['ช่วงนี้ผู้คนมาเยอะ ชั้นรองเท้าเริ่มเลอะเทอะ','ช่วยจัดชั้นวางรองเท้าสัก 3 ครั้งได้ไหมครับ?']},
 {t:'use',spot:'shoes',n:3,obj:'จัดรองเท้าที่ชั้นวางหน้ามัสยิด'},
 {t:'talk',who:'imam',obj:'แจ้งอิหม่ามเมื่อจัดเสร็จ',lines:['เรียบร้อยดีครับ ขอบคุณมาก','น้ำใจเล็ก ๆ ช่วยให้ทุกคนเข้ามัสยิดได้อย่างสบายใจ']}]});
q({id:'is_fest',rel:'islam',cat:'festival',title:'สุขสันต์วันสำคัญ',steps:[
 {t:'enter',place:'mosque',obj:'เดินทางไปมัสยิดในวันสำคัญ'},{t:'act',any:'festival',obj:'ร่วมกิจกรรมวันสำคัญ (อิฟตาร์/วันอีด)'},
 {t:'talk',who:'imam',obj:'ทักทายและอวยพรอิหม่าม',lines:['ขอให้วันนี้เป็นวันที่ดีงามสำหรับครอบครัวของท่าน','ขอบคุณที่มาร่วมแบ่งปันนะครับ']}]});
q({id:'is_rel',rel:'islam',cat:'relationship',title:'บทสนทนาในห้องละหมาด',need:{npc:'imam',n:3},steps:[
 {t:'talk',who:'imam',obj:'พูดคุยกับอิหม่ามเรื่องความสงบใจ',lines:['เมื่อมีเรื่องวุ่นวายในใจ คุณทำอย่างไรครับ?'],choice:[{t:'ขอเวลาอยู่เงียบ ๆ ครับ',l:['เวลาเงียบ ๆ เป็นของขวัญที่ดี'],r:2},{t:'คุยกับคนที่ไว้ใจครับ',l:['การมีคนรับฟังคือพรอย่างหนึ่ง'],r:2}]},
 {t:'use',spot:'quran',obj:'อ่านที่ชั้นหนังสือในห้องละหมาด'},
 {t:'talk',who:'imam',obj:'กลับไปคุยกับอิหม่าม',lines:['ความรู้ที่อ่านด้วยใจสงบจะอยู่กับเรานาน']}]});
q({id:'is_sec',rel:'islam',cat:'secret',title:'ถุงอินทผลัมที่ถูกลืม',steps:[
 {t:'use',spot:'secret',obj:'สำรวจมุมลานด้านขวาของมัสยิด ใกล้หออะซาน',found:'พบถุงผ้าใบเล็กวางใกล้ต้นปาล์ม มีอินทผลัมเต็มถุงและโน้ตเขียนว่า “สำหรับผู้ที่หิว”'},
 {t:'talk',who:'member',obj:'ถามสมาชิกชุมชนว่าถุงนี้ของใคร',lines:['อ๋อ คงมีผู้ใจบุญวางไว้ให้ผู้ผ่านทางจ้ะ','เอาไปแบ่งกันเถอะ แบบนี้แหละน้ำใจ']},
 {t:'talk',who:'imam',obj:'มอบอินทผลัมแบ่งปันกับอิหม่าม',lines:['อัลฮัมดุลิลลาห์ ขอบคุณที่แบ่งปันครับ','เรื่องดี ๆ แบบนี้จะเล่าต่อให้เด็ก ๆ ฟัง']}]});
// ====== ชุมชนทั่วไป (ทุกศาสนา · ผู้ที่ไม่มีศาสนามีชุดนี้เป็นหลัก)
q({id:'cm_booth',rel:'*',cat:'community',title:'บูธอาสาหน้าบริษัท',steps:[
 {t:'act',any:'community',obj:'ช่วยบูธอาสาชุมชนหน้าบริษัท (วันเสาร์ 09:00–11:00)'},
 {t:'talk',who:'vol',obj:'คุยกับอาสาสมัครหลังช่วยงาน',lines:['ขอบคุณมากค่ะ ของครบพอดีเลย','เสบียงถึงมือเพื่อนบ้านเรียบร้อยแล้ว']}]});
q({id:'cm_friend',rel:'*',cat:'relationship',title:'เพื่อนบ้านหน้าบริษัท',need:{npc:'vol',n:2},steps:[
 {t:'talk',who:'vol',obj:'คุยกับอาสาสมัครที่บูธ (ครั้งที่ 1)',days:true,lines:['ที่ผ่านมาเพื่อนบ้านลำบากกว่าที่คิดนะคะ'],choice:[{t:'ผมจะช่วยเท่าที่ทำได้',l:['ขอบคุณค่ะ แค่นี้ก็อุ่นใจ'],r:1},{t:'บอกมาได้เลยว่าต้องการอะไร',l:['ไว้เราปรึกษากันค่ะ'],r:1}]},
 {t:'talk',who:'vol',obj:'คุยกับอาสาสมัครอีกครั้งในวันเสาร์ถัดไป',days:true,lines:['คุณมาอีกแล้ว ดีใจจัง!'],choice:[{t:'ผมเริ่มคุ้นกับที่นี่แล้ว',l:['เราก็รู้สึกเหมือนมีเพื่อนเพิ่มค่ะ'],r:1},{t:'วันนี้มีอะไรให้ช่วยไหม',l:['ไว้ครั้งหน้านะคะ'],r:1}]}]});
q({id:'cm_sec',rel:'*',cat:'secret',title:'กล่องของขวัญนิรนาม',need:{npc:'vol',n:3},after:['cm_booth','cm_friend'],steps:[
 {t:'talk',who:'vol',obj:'อาสาสมัครมีเรื่องจะเล่า (วันเสาร์ที่บูธ)',days:true,lines:['เมื่อวานมีคนวางกล่องไว้หน้าบูธ ไม่ระบุชื่อค่ะ','เขียนว่า “ถึงผู้ที่ช่วยเหลือชุมชน”'],choice:[{t:'เปิดดูด้วยกัน',l:['ข้างในเป็นผ้าห่มและโน้ตขอบคุณค่ะ','คนที่ได้รับผลจากน้ำใจของเรา ส่งต่อมาให้อีกที'],r:2},{t:'ให้อาสาสมัครเก็บไว้แจก',l:['ดีค่ะ จะแบ่งให้ครอบครัวที่ต้องการ'],r:2}]}]});

const byId={};Q.forEach(x=>byId[x.id]=x);
const rid=()=>REL.rid();
const R=()=>REL.R();
const prog=id=>{const r=R();if(!r)return null;return r.questProgress[id]=r.questProgress[id]||{i:0,n:0,done:false,days:[]}};
const mine=()=>Q.filter(x=>x.rel==='*'||x.rel===rid());
const clergyOf=()=>CL[rid()]||null;

/* ---------- เงื่อนไขปลดล็อก ---------- */
function festToday(){return REL.actsFor(S.day).find(a=>a.kind==='festival')||null}
function unlocked(x){
 const r=R();if(!r)return false;const p=prog(x.id);if(p.done||p.i>0)return true;
 if(x.cat==='festival'){const f=festToday();return !!(f&&REL.statusOf(S.day,f)!=='missed')}
 if(x.need&&REL.relOf(x.need.npc)<x.need.n)return false;
 if(x.after&&!x.after.every(a=>prog(a).done))return false;
 if(x.cat==='secret'&&x.rel!=='*'){const c=Q.find(z=>z.rel===x.rel&&z.cat==='community'),rr=Q.find(z=>z.rel===x.rel&&z.cat==='relationship');
  if(!(prog(c.id).done&&prog(rr.id).done))return false;if((r.visitedReligiousScenes[PL[x.rel]]||0)<3)return false}
 return true;
}
function curStep(x){const p=prog(x.id);return x.steps[p.i]||null}
function objText(x){
 const p=prog(x.id),s=curStep(x);if(!s)return 'เสร็จสิ้น';
 let t=s.obj||'';
 if(s.t==='use'&&s.n)t+=' ('+(p.n||0)+'/'+s.n+')';
 if(s.t==='count'){t+=' ('+countDone()+'/'+s.n+')'}
 if(x.steps.length>1)t='['+(p.i+1)+'/'+x.steps.length+'] '+t;
 return t;
}
function countDone(){const r=R();return r.activityHistory.filter(h=>{const a=REL.findAct(h.k);return a&&(a.a.kind==='weekly'||a.a.kind==='daily')&&a.a.place!=='street'||(rid()==='buddhism'&&h.id==='alms')}).length}
function list(){
 return mine().filter(unlocked).map(x=>{const p=prog(x.id);return{id:x.id,icon:CATI[x.cat],title:x.title,cat:x.cat,catName:CATN[x.cat],done:!!p.done,obj:objText(x),prog:p.done?x.steps.length:Math.min(p.i,x.steps.length),total:x.steps.length}});
}
function tracker(){
 const L=mine().filter(x=>{const p=prog(x.id);return unlocked(x)&&!p.done&&p.i>=0&&!(x.cat==='daily')}).slice(0,2);
 if(!L.length)return '';
 return L.map(x=>'<b>'+CATI[x.cat]+' '+REL.esc(x.title)+'</b><br>'+REL.esc(objText(x))).join('<hr style="border:0;border-top:1px solid #445;margin:4px 0">');
}

/* ---------- ความคืบหน้า ---------- */
function advance(x,s){
 const p=prog(x.id);p.i++;p.n=0;
 if(p.i>=x.steps.length)finish(x);else{try{REL.save&&REL.save()}catch(e){}}
 try{save(1)}catch(e){}
}
function finish(x){
 const p=prog(x.id);p.done=true;const r=R(),rw=RWQ[x.cat],key='q:'+x.id;
 if(r.claimedRewards[key])return;r.claimedRewards[key]=1;
 S.money+=rw.money;let souv=null;if(rw.souv){souv=({buddhism:'ตลับไม้เก่าจากวัด 🪵',christianity:'ซองจดหมายพิมพ์ลายโบสถ์ ✉️',islam:'ถุงผ้าแบ่งปันอินทผลัม 🌴',none:'กล่องผ้าห่มจากชุมชน 🎁'})[x.rel==='*'?'none':x.rel];r.souvenirs.push({n:souv,day:S.day})}
 const who=x.steps.map(s=>s.who).filter(Boolean).pop();if(who)REL.addRel(who,rw.rel);
 try{S.rep=(S.rep||0)+(x.cat==='secret'?3:2)}catch(e){}
 REL.summary({title:CATI[x.cat]+' ภารกิจสำเร็จ: '+x.title,lines:['หมวด: '+CATN[x.cat]],rw:{money:rw.money,rep:x.cat==='secret'?3:2,rel:rw.rel,souv}});
 REL.evt('qdone',x.id);
}
function step(x,type,arg){return false}
/* talk(npc): ถ้าเควสต์ต้องการให้คุยกับ npc นี้ → เล่นบทสนทนาเควสต์ */
function talk(npc,ctx){
 for(const x of mine()){
  if(!unlocked(x))continue;const p=prog(x.id);if(p.done)continue;const s=curStep(x);
  if(!s||s.t!=='talk'||s.who!==npc)continue;
  if(s.days){p.days=p.days||[];if(p.days.includes(S.day)&&p.i>0)continue}
  if(x.cat==='festival'&&!festToday())continue;
  const done=()=>{if(s.days){p.days=p.days||[];p.days.push(S.day)}advance(x,s)};
  const N=REL.NPC[npc];
  const say=ctx&&ctx.say;if(!say)continue;
  const lines=s.lines.slice();
  if(s.choice){
   say(npc,lines,s.choice.map((c,i)=>({t:c.t,ok:i===0,fn:()=>{say(npc,c.l,null,()=>{REL.addRel(npc,c.r||1);done()})}})));
  }else say(npc,lines,null,done);
  return true;
 }
 return false;
}
function onEvt(type,arg){
 const r=R();if(!r)return;
 for(const x of mine()){
  if(!unlocked(x))continue;const p=prog(x.id);if(p.done)continue;const s=curStep(x);if(!s)continue;
  if(x.cat==='festival'&&!festToday()&&p.i>0){continue}
  if(type==='enter'&&s.t==='enter'&&s.place===arg){advance(x,s)}
  else if(type==='use'&&s.t==='use'&&(s.spot===String(arg).split('#')[0])){p.n=(p.n||0)+1;
   if(s.found&&p.n===1){REL.dlg({name:'🔍 สำรวจ',tag:'พบบางอย่าง',lines:[s.found],done:()=>{}})}
   if(p.n>=(s.n||1))advance(x,s);else{try{toast('✔ '+(p.n)+'/'+s.n+' · '+s.obj)}catch(e){}}}
  else if(type==='act'&&s.t==='act'&&(s.any==='festival'?FESTIDS.includes(arg):s.any==='community'?arg==='community':false))advance(x,s);
 }
 // บุญประจำสัปดาห์ (count)
 if(type==='act'||type==='done'){mine().forEach(x=>{if(x.cat!=='daily')return;const p=prog(x.id);if(p.done)return;const s=x.steps[0];if(countDone()>=s.n){p.i=1;finish(x)}})}
 // ปลดล็อก → แจ้งเตือน
}
REL.onEvt(onEvt);

/* ---------- จุดพิเศษในฉาก ---------- */
const SWP=()=>REL.scene&&REL.scene.SCN.temple.sweeps;
function leafPiles(){
 if(rid()!=='buddhism')return[];const x=byId.bd_comm,p=prog(x.id);if(p.done||p.i!==1)return[];
 const sw=p.sw||[];return SWP().map((pt,i)=>({x:pt[0],y:pt[1],i})).filter(o=>!sw.includes(o.i));
}
const SEC={temple:{x:1010,y:640},church:{x:470,y:600},mosque:{x:990,y:540}};
function extraSpots(place){
 const out=[];
 if(place==='temple')leafPiles().forEach(o=>out.push({id:'sweep#'+o.i,x:o.x,y:o.y+6,r:56,hint:'🧹 กด E เพื่อกวาดกองใบไม้',kind:'sweep',quest:true,si:o.i}));
 const r=rid(),x=Q.find(z=>z.rel===r&&z.cat==='secret');
 if(x&&place===PL[r]){const p=prog(x.id);if(!p.done&&p.i===0&&unlocked(x)){const s=SEC[place];out.push({id:'secret',x:s.x,y:s.y,r:56,hint:'🔍 กด E เพื่อสำรวจจุดที่น่าสงสัย',kind:'secret',quest:true})}}
 return out;
}
function useSpot(s,ctx){
 if(s.kind==='sweep'&&s.quest){const x=byId.bd_comm,p=prog(x.id);p.sw=p.sw||[];if(!p.sw.includes(s.si))p.sw.push(s.si);
  ctx.ST&&REL.scene.seq('🧹 กวาดใบไม้','ใบไม้แห้งกรอบแกรบ',2.4,()=>{REL.evt('use','sweep')});return true}
 if(s.kind==='secret'&&s.quest){ctx.ST&&REL.scene.seq('🔍 สำรวจ','ค้นหาอย่างระมัดระวัง',2.2,()=>REL.evt('use','secret'));return true}
 return false;
}
function spotOn(name){
 if(name==='decor'){const x=byId.ch_fest;return false}
 return false;
}
function decorStep(){try{REL.scene.seq('🎄 ช่วยตกแต่งต้นคริสต์มาส','ประดับไฟและลูกบอล',5,()=>{const a=REL.scene.state().win;if(a&&a.id==='xmasprep'){const rw=REL.completeAct(a);REL.summary({title:a.icon+' '+a.title,lines:['ช่วยบาทหลวงตกแต่งต้นคริสต์มาสหน้าโบสถ์'],rw});REL.evt('done',a.id)}else{try{toast('🎄 ต้นคริสต์มาสสวยขึ้นแล้ว')}catch(e){}}})}catch(e){}}

/* ---------- วนตรวจ ---------- */
let lastDay=0;
function tick(){
 const r=R();if(!r||!rid())return;
 // เควสต์เทศกาลที่ค้างข้ามวัน → รีเซ็ต
 if(lastDay!==S.day){lastDay=S.day;mine().forEach(x=>{if(x.cat==='festival'){const p=prog(x.id);if(!p.done&&p.i>0&&!festToday()){p.i=0;p.n=0}else if(p.done&&festToday()){}}})}
 // เควสต์เทศกาลเสร็จแล้วปีก่อน → เปิดใหม่ได้ (รางวัลซ้ำไม่ได้: claimedRewards กันไว้)
 // แจ้งเตือนภารกิจใหม่ (ไม่ซ้ำ)
 mine().forEach(x=>{const p=prog(x.id);if(p.done||p.i>0)return;if(!unlocked(x))return;const k='q:'+x.id;if(r.notificationHistory[k])return;r.notificationHistory[k]=S.day;
  try{if(!(window.CUT&&CUT.on))toast(CATI[x.cat]+' ภารกิจใหม่: '+x.title+' · เปิดสมุดกิจกรรมในปฏิทิน')}catch(e){}});
}
function onEnter(place){/* hook สำหรับอนาคต */}
REL.quests={list,tracker,talk,useSpot,extraSpots,spotOn,decorStep,leafPiles,tick,onEnter,Q,byId,prog,unlocked,FESTIDS,CATN};
})();

/* =====================================================================
   REL.scene — ฉากสถานที่ศาสนาที่เดินได้จริง (วัด · โบสถ์ภายนอก/ภายใน · มัสยิดภายนอก/ภายใน)
   + พระบิณฑบาต/บูธชุมชนบนถนนหน้าบริษัท (เชื่อมกับฉากถนนเดิมของ CEOScene)
   - เวลาเดินตาม Game Clock เดิม (ไม่แตะ S.t / S.speed)
   - NPC ผู้ร่วมกิจกรรมใช้โมเดลเดิมของเกม (วาดจากสไปรต์เดิม ไม่ดึงพนักงานจริงออกจากบริษัท)
   ===================================================================== */
(function(){
'use strict';
const REL=window.REL,ART=REL.art,$=id=>document.getElementById(id),esc=REL.esc;
const VW=960,VH=600,ROW=[0,2,1,3];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const GCI=()=>typeof CHAR_IMAGES!=='undefined'?CHAR_IMAGES:null,GCS=()=>typeof CUSTOMER_SPRITE_IMAGES!=='undefined'?CUSTOMER_SPRITE_IMAGES:null,GCP=()=>typeof CUSTOMER_PORTRAITS!=='undefined'?CUSTOMER_PORTRAITS:null,GCEO=()=>typeof CEOI!=='undefined'?CEOI:null;

/* ----------------------------------------------------------------- สไปรต์ */
const IMG={};
function img(src){if(!src)return null;if(!IMG[src]){const i=new Image();i.src=src;IMG[src]=i}return IMG[src]}
const ok=i=>i&&i.complete&&i.naturalWidth>0;
const CLERIC={monk:'monk',priest:'priest',imam:'imam'};
function cleric(k){const a=window.REL_ASSETS&&REL_ASSETS[k];return a?{sheet:img(a.sheet),card:a.card,cw:a.cw,ch:a.ch}:null}
function drawCleric(g,k,x,y,d,fr){
 const c=cleric(k);if(!c||!ok(c.sheet))return;const s=.7,w=c.cw*s,h=c.ch*s;
 g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
 g.drawImage(c.sheet,fr*c.cw,ROW[d]*c.ch,c.cw,c.ch,x-w/2,y-h+3,w,h);
}
function drawGeneric(g,sp,x,y,d,fr){
 if(sp.kind==='staff'){const pk=GCI()&&GCI()[sp.id],rows=pk&&pk.frames;if(!rows)return;const fs=rows[ROW[d]]||rows[0],im=fs&&(fs[fr%Math.min(4,fs.length)]||fs[0]);
  if(ok(im)){g.imageSmoothingEnabled=false;g.drawImage(im,0,0,64,80,x-30.4,y-81.6,60.8,83.6);g.imageSmoothingEnabled=true}}
 else{const at=GCS()&&GCS()[sp.id];if(ok(at)){const cw=at.naturalWidth/4,ch=at.naturalHeight/4;g.imageSmoothingEnabled=false;g.drawImage(at,(fr%4)*cw,ROW[d]*ch,cw,ch,x-30.4,y-81.6,60.8,83.6);g.imageSmoothingEnabled=true}}
}
function drawCEO(g,x,y,d,fr,mv){
 try{const I=GCEO();if(I&&I.complete&&I.naturalWidth){const col=mv?Math.floor(fr)%4:0,SC=1.9;g.imageSmoothingEnabled=true;g.drawImage(I,col*CEO_CW(),ROW[d]*CEO_CH(),CEO_CW(),CEO_CH(),x-16*SC,y-43*SC,32*SC,44*SC);return}}catch(e){}
 g.fillStyle='#f1c9a5';g.fillRect(x-9,y-66,18,20);g.fillStyle='#f4b400';g.fillRect(x-12,y-44,24,30);
}
const ROSTER=[['cust','mei'],['cust','tee'],['cust','phak'],['cust','ton'],['cust','praw'],['cust','pink'],['cust','goth'],['cust','bun'],['cust','coat'],['cust','leo'],['cust','fur'],['cust','teal'],['cust','chi'],['cust','brd'],['cust','sar'],['cust','shk'],['cust','emi'],['cust','hat'],['staff','mild-casual'],['staff','mild-formal'],['staff','blue-suit-male'],['staff','staff-red']];
function pickRoster(n,seed){const out=[],pool=ROSTER.filter(r=>r[0]==='staff'?(GCI()&&GCI()[r[1]]):(GCS()&&GCS()[r[1]])),a=pool.slice();
 let s=(seed||1)|0;for(let i=a.length-1;i>0;i--){s=(s*16807)%2147483647;const j=s%(i+1);[a[i],a[j]]=[a[j],a[i]]}
 for(let i=0;i<n&&i<a.length;i++)out.push({kind:a[i][0],id:a[i][1]});return out}
function portraitOf(sp){try{if(sp.kind==='staff')return GCI()[sp.id].portrait.src;return(GCP()&&GCP()[sp.id])||''}catch(e){return ''}}

/* ----------------------------------------------------------------- ทะเบียน NPC เฉพาะกิจ */
const NPC={
 monk:{name:'พระอาจารย์ธรรมรักษ์',tag:'พระสงฆ์ · วัดประจำเมือง',card:'monk',cl:'monk',rel:'buddhism'},
 priest:{name:'บาทหลวงมาร์ติน',tag:'บาทหลวง · โบสถ์ประจำเมือง',card:'priest',cl:'priest',rel:'christianity'},
 imam:{name:'อิหม่ามยูซุฟ',tag:'อิหม่าม · มัสยิดประจำเมือง',card:'imam',cl:'imam',rel:'islam'},
 member:{name:'สมาชิกชุมชน',tag:'ชาวชุมชนในพื้นที่'},
 elder:{name:'คุณป้าใจดี',tag:'สมาชิกชุมชน'},
 vol:{name:'อาสาสมัครชุมชน',tag:'บูธอาสาหน้าบริษัท'}
};
REL.NPC=NPC;
const LINES={
 monk:['โยมมาวัดวันนี้ ใจคงสบายขึ้นนะ','ทำงานหนักก็ไม่ลืมพักใจ เป็นสิ่งดีแล้ว','การให้ทานเล็ก ๆ ทุกวัน สะสมเป็นความสุขใหญ่ในวันหนึ่ง','ลมหายใจเข้า-ออก ก็คือวัดที่พกติดตัวได้ทุกที่'],
 priest:['ยินดีต้อนรับสู่โบสถ์เสมอ ไม่ว่าสัปดาห์นี้จะหนักแค่ไหน','ความเมตตาเริ่มจากเรื่องเล็ก ๆ ที่เราทำให้คนตรงหน้า','เชิญนั่งพักได้ตามสบาย ที่นี่ไม่มีใครรีบ','ชุมชนของเราแข็งแรงเพราะทุกคนช่วยกันคนละนิด'],
 imam:['อัสสลามุอะลัยกุม ยินดีต้อนรับ','การแบ่งปันอาหารคือหัวใจของชุมชนเรา','ความสงบเริ่มจากใจที่ขอบคุณ','ขอให้ธุรกิจและครอบครัวของท่านได้รับความสันติสุข'],
 member:['อากาศดีจังนะคะ มาที่นี่แล้วสบายใจ','ทุกคนที่นี่ช่วยกันดูแลสถานที่ค่ะ','เห็นคุณมาบ่อย ๆ ดีใจที่ได้เจอกัน','ที่นี่เงียบสงบ เหมาะกับการพักใจจริง ๆ'],
 elder:['ป้ามาที่นี่ทุกสัปดาห์เลยจ้ะ','เด็กหนุ่มสาวมาช่วยงานแบบนี้ ป้าชื่นใจ','ถ้าว่างก็แวะมาอีกนะ','ชุมชนเราน่าอยู่เพราะน้ำใจ'],
 vol:['สวัสดีค่ะ! บูธอาสาของเรารับบริจาคของใช้ให้เพื่อนบ้าน','ขอบคุณที่แวะมา เล็กน้อยก็ช่วยได้มาก','วันเสาร์หน้ามาอีกนะคะ']
};
const pickLine=(k,n)=>{const L=LINES[k]||LINES.member;return L[Math.abs(n|0)%L.length]};

/* ----------------------------------------------------------------- เสียงบรรยากาศ (เบา ๆ ด้วย WebAudio) */
const AU={ctx:null,on:false,tm:null};
function actx(){try{AU.ctx=AU.ctx||new (window.AudioContext||window.webkitAudioContext)();if(AU.ctx.state==='suspended')AU.ctx.resume();return AU.ctx}catch(e){return null}}
function tone(f,d,v,type,dly){const c=actx();if(!c)return;try{const o=c.createOscillator(),g=c.createGain(),t=c.currentTime+(dly||0);o.type=type||'sine';o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v||.03,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+.05)}catch(e){}}
const SFX={
 bell(){tone(520,1.6,.05,'sine');tone(1040,1.2,.02,'sine');tone(780,1.4,.02,'sine',.02)},
 bird(){const b=1800+Math.random()*900;tone(b,.09,.012,'sine');tone(b*1.25,.08,.01,'sine',.1);tone(b*.9,.1,.01,'sine',.2)},
 chime(){tone(660,.9,.03,'triangle');tone(880,.8,.02,'triangle',.12)},
 soft(){tone(220,2.2,.012,'sine')},
 step(){tone(90,.05,.008,'square')},
 coin(){tone(988,.12,.03,'square');tone(1319,.25,.03,'square',.09)}
};
function ambience(place){
 clearInterval(AU.tm);if(!place)return;
 AU.tm=setInterval(()=>{if(!AU.on)return;
  if(place==='temple'){if(Math.random()<.6)SFX.bird();else if(Math.random()<.2)SFX.bell()}
  else if(place==='church'){if(Math.random()<.5)SFX.bird();else SFX.bell()}
  else if(place==='church_in'||place==='mosque_in'){if(Math.random()<.5)SFX.soft()}
  else if(place==='mosque'){if(Math.random()<.5)SFX.bird();else SFX.chime()}
 },3800);
}

/* ----------------------------------------------------------------- นิยามฉาก */
const R2=(x,y,w,h)=>({x,y,w,h});
const SCN={};
SCN.temple={w:1280,h:760,art:'temple',title:'🛕 วัดประจำเมือง',rel:'buddhism',spawn:{x:640,y:672,d:2},top:150,
 solids:[R2(430,0,420,312),R2(520,302,236,44),R2(976,130,128,300),R2(60,184,270,190),R2(108,384,128,40),R2(70,575,230,120),R2(948,440,36,52),R2(840,560,40,56),R2(912,372,28,44),R2(0,704,492,56),R2(788,704,492,56),R2(1112,622,34,24),R2(244,134,36,22),R2(1190,170,26,18),R2(76,110,36,22),R2(0,0,150,110),R2(1160,0,120,150)],
 exit:R2(500,700,290,60),
 spots:[
  {id:'merit',x:640,y:372,r:70,hint:'🙏 กด E เพื่อไหว้พระและทำบุญ',kind:'merit'},
  {id:'offer',x:170,y:452,r:66,hint:'🍚 กด E เพื่อถวายอาหาร',kind:'offer'},
  {id:'chedi',x:1040,y:470,r:80,hint:'🪔 กด E เพื่อเวียนเทียนรอบเจดีย์',kind:'chedi'},
  {id:'bell',x:860,y:640,r:60,hint:'🔔 กด E เพื่อตีระฆัง',kind:'bell'},
  {id:'bodhi',x:1120,y:690,r:70,hint:'🌳 กด E เพื่อพักใต้ต้นโพธิ์',kind:'bodhi'},
  {id:'incense',x:926,y:430,r:54,hint:'🪔 กด E เพื่อจุดธูป',kind:'incense'},
  {id:'sweep',x:0,y:0,r:46,hint:'🧹 กด E เพื่อกวาดใบไม้',kind:'sweep',quest:true}
 ],
 sweeps:[[400,500],[760,480],[300,610]],
 npcs:[{id:'monk',x:640,y:318,d:0,name:true}],
 props:[{k:'tree',s:21,t:'bodhi',x:1126,y:668},{k:'tree',s:22,t:'leaf',x:92,y:130},{k:'tree',s:23,t:'leaf',x:1204,y:186},{k:'tree',s:24,t:'leaf',x:262,y:150},{k:'bench',x:420,y:618},{k:'bench',x:700,y:618},{k:'lamp',x:440,y:470},{k:'lamp',x:830,y:470},{k:'pot',x:606,y:470,c:'#ffd45a'},{k:'pot',x:676,y:470,c:'#ff7aa8'}],
 seats:null,visitors:7,close:1260};
SCN.church={w:1280,h:760,art:'church',title:'⛪ โบสถ์ประจำเมือง',rel:'christianity',spawn:{x:640,y:672,d:2},top:300,
 solids:[R2(300,60,600,380),R2(80,352,220,140),R2(980,352,220,140),R2(60,192,200,100),R2(1020,192,200,100),R2(592,596,96,44),R2(120,640,330,44),R2(0,692,524,68),R2(756,692,524,68),R2(524,670,24,90),R2(732,670,24,90),R2(0,0,300,60)],
 exit:R2(548,700,184,60),
 spots:[
  {id:'door',x:640,y:468,r:62,hint:'⛪ กด E เพื่อเข้าโบสถ์',kind:'door'},
  {id:'garden',x:190,y:520,r:78,hint:'🌷 กด E เพื่อเก็บดอกไม้ตกแต่งโบสถ์',kind:'garden'},
  {id:'garden2',x:1090,y:520,r:78,hint:'🌷 กด E เพื่อเก็บดอกไม้ตกแต่งโบสถ์',kind:'garden'},
  {id:'fountain',x:640,y:662,r:60,hint:'⛲ กด E เพื่อพักที่น้ำพุ',kind:'fountain'},
  {id:'belltower',x:352,y:470,r:66,hint:'🔔 กด E เพื่อสั่นระฆังโบสถ์',kind:'bell'},
  {id:'decor',x:900,y:480,r:60,hint:'🎄 กด E เพื่อช่วยตกแต่งต้นคริสต์มาส',kind:'decor'}
 ],
 npcs:[{id:'priest',x:760,y:500,d:1,name:true}],
 props:[{k:'tree',s:31,t:'leaf',x:60,y:340},{k:'tree',s:32,t:'leaf',x:1228,y:330},{k:'tree',s:33,t:'pine',x:330,y:620},{k:'tree',s:34,t:'pine',x:950,y:620},{k:'bench',x:420,y:560},{k:'bench',x:860,y:560},{k:'lamp',x:540,y:520},{k:'lamp',x:740,y:520}],
 visitors:5,close:1260};
SCN.church_in={w:960,h:600,art:'church_in',title:'⛪ ภายในโบสถ์',rel:'christianity',spawn:{x:480,y:540,d:2},top:200,inner:true,
 solids:[R2(340,120,280,96),R2(228,124,68,92),R2(44,292,32,88),R2(884,292,32,88),R2(116,244,240,40),R2(116,304,240,40),R2(116,364,240,40),R2(116,424,240,40),R2(116,484,240,40),R2(604,244,240,40),R2(604,304,240,40),R2(604,364,240,40),R2(604,424,240,40),R2(604,484,240,40)],
 exit:R2(408,566,144,34),
 spots:[
  {id:'pew',x:480,y:380,r:100,hint:'🪑 กด E เพื่อนั่งร่วมพิธีในแถวม้านั่ง',kind:'pew'},
  {id:'altar',x:480,y:240,r:70,hint:'🕯️ กด E เพื่อจุดเทียนที่แท่นบูชา',kind:'altar'},
  {id:'lectern',x:262,y:238,r:58,hint:'📖 กด E เพื่ออ่านพระคัมภีร์ที่แท่นอ่าน',kind:'lectern'}
 ],
 npcs:[{id:'priest',x:480,y:236,d:0,name:true}],
 props:[],visitors:0,close:1320};
SCN.mosque={w:1280,h:760,art:'mosque',title:'🕌 มัสยิดประจำเมือง',rel:'islam',spawn:{x:640,y:672,d:2},top:430,
 solids:[R2(340,20,600,392),R2(984,60,44,352),R2(412,464,104,36),R2(764,464,104,36),R2(64,412,180,96),R2(0,0,140,320),R2(1140,0,140,320),R2(0,580,220,100),R2(1060,580,220,100),R2(0,692,524,68),R2(756,692,524,68),R2(524,670,24,90),R2(732,670,24,90)],
 exit:R2(548,700,184,60),
 spots:[
  {id:'door',x:640,y:468,r:62,hint:'🕌 กด E เพื่อเข้ามัสยิด',kind:'door'},
  {id:'shoes1',x:464,y:528,r:64,hint:'👟 กด E เพื่อถอด/สวมรองเท้า (ชั้นวางรองเท้า)',kind:'shoes'},
  {id:'shoes2',x:816,y:528,r:64,hint:'👟 กด E เพื่อถอด/สวมรองเท้า (ชั้นวางรองเท้า)',kind:'shoes'},
  {id:'wudu',x:156,y:548,r:70,hint:'💧 กด E เพื่อชำระล้างก่อนละหมาด (วุฎู)',kind:'wudu'},
  {id:'food1',x:330,y:640,r:64,hint:'🍲 กด E เพื่อแบ่งปันอาหาร',kind:'food',iftar:true},
  {id:'food2',x:950,y:640,r:64,hint:'🍲 กด E เพื่อแบ่งปันอาหาร',kind:'food',iftar:true}
 ],
 npcs:[{id:'imam',x:760,y:560,d:1,name:true}],
 props:[{k:'tree',s:61,t:'palm',x:80,y:340},{k:'tree',s:62,t:'palm',x:1200,y:340},{k:'tree',s:63,t:'palm',x:240,y:690},{k:'tree',s:64,t:'palm',x:1040,y:690},{k:'lamp',x:540,y:520,c:'#ffe9a0'},{k:'lamp',x:740,y:520,c:'#ffe9a0'},{k:'pot',x:560,y:690,c:'#ff7aa8'},{k:'pot',x:720,y:690,c:'#ffd45a'}],
 visitors:5,close:1260};
SCN.mosque_in={w:960,h:600,art:'mosque_in',title:'🕌 ภายในมัสยิด',rel:'islam',spawn:{x:480,y:540,d:2},top:200,inner:true,
 solids:[R2(64,192,32,400),R2(864,192,32,400),R2(140,104,88,84),R2(660,80,112,108)],
 exit:R2(408,566,144,34),
 spots:[
  {id:'prayer',x:480,y:400,r:130,hint:'🕌 กด E เพื่อเข้าร่วมละหมาดแถวหลัง (ต้องวุฎูแล้ว)',kind:'prayer'},
  {id:'quran',x:184,y:214,r:70,hint:'📖 กด E เพื่ออ่านอัลกุรอานที่ชั้นหนังสือ',kind:'quran'}
 ],
 npcs:[{id:'imam',x:480,y:230,d:0,name:true}],
 props:[],visitors:0,close:1320};
const NEXT={church:{door:'church_in'},mosque:{door:'mosque_in'}};

/* ----------------------------------------------------------------- สถานะฉาก */
const ST={on:false,id:null,def:null,bg:null,x:0,y:0,d:2,fr:0,mv:false,keys:{},joy:{x:0,y:0},cam:{x:0,y:0},vis:[],props:[],t:0,last:0,raf:0,spotNow:null,flags:{},actKey:null,busy:false,seq:null,saveCut:0,fade:0,parts:[]};
let built=false;
const BG={};
function bgOf(id){if(!BG[id])BG[id]=ART[SCN[id].art]();return BG[id]}
function mkProp(p){
 let spr;
 if(p.k==='tree')spr=ART.treeSpr(p.s,p.t);else if(p.k==='bench')spr=ART.benchSpr();else if(p.k==='lamp')spr=ART.lampSpr(p.c);else if(p.k==='pot')spr=ART.potSpr(p.c);
 if(!spr)return null;return{spr,x:p.x,y:p.y,w:spr.width,h:spr.height,k:p.k}
}
function blockedAt(def,x,y){
 const r=11,b={x:x-r,y:y-8,w:r*2,h:10};
 if(x<24||x>def.w-24||y<def.top||y>def.h-6)return !(def.exit&&inRect(def.exit,x,y)&&y<=def.h-2&&x>24&&x<def.w-24&&y>def.top);
 for(const s of def.solids)if(b.x<s.x+s.w&&b.x+b.w>s.x&&b.y<s.y+s.h&&b.y+b.h>s.y)return true;
 for(const p of ST.props)if(p.solid&&b.x<p.x+p.sw/2&&b.x+b.w>p.x-p.sw/2&&b.y<p.y&&b.y+b.h>p.y-12)return true;
 return false;
}
const inRect=(r,x,y)=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h;
function placeFree(def,x,y){let tries=0;while(blockedAt(def,x,y)&&tries++<60){y+=6}return[x,y]}

/* ----------------------------------------------------------------- DOM */
let DOM=null;
const CSS=`
#relScn{position:fixed;inset:0;z-index:9600;display:none;flex-direction:column;background:#0a1020;color:#f5f1e8;font-family:'Noto Sans Thai','Sarabun',system-ui,sans-serif;user-select:none;-webkit-user-select:none}
#relScn.on{display:flex}
#relScn .hd{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:#182338;border-bottom:2px solid #c89d4b;gap:8px}
#relScn .hd strong{font-size:16px}#relScn .hd small{color:#c5d1df;display:block}
#relScn .hd button{font:inherit;font-weight:800;font-size:13px;min-height:40px;padding:6px 14px;border-radius:9px;border:2px solid #b98a2e;background:linear-gradient(#ffe9a0,#f2c452);color:#3a2205;cursor:pointer}
#relScn .wr{position:relative;flex:1;min-height:0;background:#0a1020;overflow:hidden;display:flex;align-items:center;justify-content:center}
#relScn canvas{width:100%;height:100%;object-fit:cover;image-rendering:auto;touch-action:none;display:block}
#relHint{position:absolute;left:50%;bottom:92px;transform:translateX(-50%);max-width:min(560px,94%);padding:8px 14px;border:1px solid #c89d4b;border-radius:10px;background:#101827e6;color:#ffe9b0;font-size:14px;text-align:center;pointer-events:none;display:none}
#relHint.on{display:block}
#relTrk{position:absolute;left:8px;top:8px;max-width:min(300px,60%);padding:6px 10px;border:1px solid #66758e;border-radius:9px;background:#101827cc;font-size:12px;color:#fff1c8;pointer-events:none;display:none;line-height:1.45}
#relTrk.on{display:block}
#relSeq{position:absolute;left:50%;top:14%;transform:translateX(-50%);min-width:240px;max-width:min(520px,92%);padding:10px 16px;border:2px solid #ffd36e;border-radius:12px;background:#101827ee;text-align:center;display:none}
#relSeq.on{display:block}#relSeq b{display:block;color:#ffe39b;font-size:15px}#relSeq .pg{height:8px;border-radius:5px;background:#0b1430;margin-top:8px;overflow:hidden}#relSeq .pg i{display:block;height:100%;background:linear-gradient(#ffe9a0,#d19a35)}
#relJoy{position:absolute;left:18px;bottom:16px;width:clamp(110px,30vh,150px);height:clamp(110px,30vh,150px);border-radius:50%;border:2px solid rgba(255,212,90,.55);background:radial-gradient(circle,rgba(22,28,42,.30) 0,rgba(22,28,42,.62) 100%);box-shadow:inset 0 0 0 5px rgba(0,0,0,.18),0 4px 14px #0007;touch-action:none;display:none}
#relJoy u{position:absolute;text-decoration:none;font-size:11px;color:rgba(255,212,90,.65);line-height:1;pointer-events:none}
#relJoy u.u{top:6%;left:50%;transform:translateX(-50%)}#relJoy u.d{bottom:6%;left:50%;transform:translateX(-50%)}#relJoy u.l{left:6%;top:50%;transform:translateY(-50%)}#relJoy u.r{right:6%;top:50%;transform:translateY(-50%)}
#relJoy i{position:absolute;left:50%;top:50%;width:42%;height:42%;margin-left:-21%;margin-top:-21%;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ffe9a8,#e0a82e 60%,#8f6410);border:2px solid #fff3c4;box-shadow:0 3px 8px #000a;pointer-events:none}
#relAct{position:absolute;right:16px;bottom:16px;width:clamp(72px,22vh,98px);height:clamp(72px,22vh,98px);border:0;background:transparent;box-shadow:none;padding:0;display:none;touch-action:manipulation;cursor:pointer}
#relAct img{display:block;width:100%;height:100%;object-fit:contain;pointer-events:none;user-select:none}
#relAct:active img{transform:scale(.94)}
#relBag{position:absolute;right:calc(16px + clamp(72px,22vh,98px) + 8px);bottom:16px;width:clamp(64px,18vh,76px);height:clamp(64px,18vh,76px);border:0;background:transparent;box-shadow:none;padding:0;display:none;touch-action:manipulation;cursor:pointer}
#relBag img{display:block;width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 3px 5px #0009);pointer-events:none}
#relBag i{position:absolute;left:50%;bottom:-5px;transform:translateX(-50%);font-style:normal;font-size:10px;line-height:1.2;white-space:nowrap;padding:2px 7px;border:1px solid #c89d4b;border-radius:7px;background:#111a2bef;color:#ffe9b5;text-shadow:0 1px 2px #000;font-weight:700}
#relBag:active img{transform:scale(.94)}
#relJoy{display:block}#relAct{display:flex}#relBag{display:flex}
`;
function mkDom(){
 if(DOM)return DOM;const s=document.createElement('style');s.id='relScnCss';s.textContent=CSS;document.head.appendChild(s);
 const d=document.createElement('div');d.id='relScn';
 d.innerHTML='<div class="hd"><div><strong id="relTitle">-</strong><small id="relTime">-</small></div><button id="relBack">🚌 กลับบริษัท</button></div><div class="wr"><canvas id="relCv" width="'+VW+'" height="'+VH+'"></canvas><div id="relTrk"></div><div id="relSeq"></div><div id="relHint"></div><div id="relJoy"><u class="u">▲</u><u class="d">▼</u><u class="l">◀</u><u class="r">▶</u><i></i></div><button id="relBag" type="button" aria-label="กระเป๋า"><img alt="" draggable="false" src="'+MCT_ICON.bag+'"><i>กระเป๋า</i></button><button id="relAct" type="button" aria-label="โต้ตอบ"><img alt="โต้ตอบ" draggable="false" src="'+MCT_ICON.hand+'"></button></div>';
 document.body.appendChild(d);DOM={root:d,cv:$('relCv'),g:$('relCv').getContext('2d'),hint:$('relHint'),trk:$('relTrk'),seq:$('relSeq'),title:$('relTitle'),time:$('relTime'),joy:$('relJoy'),act:$('relAct')};
 $('relBack').onclick=()=>askLeave();DOM.act.onclick=()=>interact();
 $('relBag').onclick=()=>{try{const b=document.getElementById('ceoBag');if(b)b.style.zIndex=9650;CEOScene.bag()}catch(e){console.error(e)}};
 let id=null;const knob=DOM.joy.querySelector('i');
 const mv=e=>{const r=DOM.joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=(e.clientX-cx)/(r.width/2),dy=(e.clientY-cy)/(r.height/2);const m=Math.hypot(dx,dy);if(m>1){dx/=m;dy/=m}ST.joy.x=Math.abs(dx)<.15?0:dx;ST.joy.y=Math.abs(dy)<.15?0:dy;knob.style.transform='translate('+dx*34+'px,'+dy*34+'px)'};
 DOM.joy.addEventListener('pointerdown',e=>{id=e.pointerId;DOM.joy.setPointerCapture(id);mv(e);d.classList.add('touch');e.preventDefault()});
 DOM.joy.addEventListener('pointermove',e=>{if(e.pointerId===id)mv(e)});
 const up=e=>{if(e.pointerId===id){id=null;ST.joy.x=ST.joy.y=0;knob.style.transform=''}};DOM.joy.addEventListener('pointerup',up);DOM.joy.addEventListener('pointercancel',up);
 return DOM;
}

/* ----------------------------------------------------------------- เข้า/ออกฉาก */
function nowAct(place){ // กิจกรรมที่เข้าร่วมได้ ณ ตอนนี้ในสถานที่นี้ (ทุกศาสนาร่วมได้ — ใช้ตารางของศาสนาเจ้าของสถานที่)
 const base=place.replace('_in','');
 const relOf={temple:'buddhism',church:'christianity',mosque:'islam'}[base];
 return REL.actsFor(S.day,relOf).find(a=>a.place===base&&REL.statusOf(S.day,a)==='available')||null;
}
function enter(id,o){
 o=o||{};const def=SCN[id];if(!def)return false;
 if(def.rel&&!REL.R())return false;
 mkDom();
 if(!ST.on){ST.saveCut=(window.CUT&&CUT.on)||0}
 try{if(window.CUT)CUT.on=1}catch(e){}
 ST.on=true;ST.id=id;ST.def=def;ST.bg=bgOf(id);ST.keys={};ST.joy={x:0,y:0};ST.busy=false;ST.seq=null;ST.fade=1;ST.t=0;ST.last=0;
 const r=REL.R();if(r){r.visitedReligiousScenes[id]=(r.visitedReligiousScenes[id]||0)+1}
 // จุดเกิด: เข้าจากภายนอก → ประตูเมือง/ทางเข้า · กลับออกจากด้านใน → หน้าประตู
 let sp=def.spawn;if(o.from==='in'){const door=(SCN[id].spots||[]).find(s=>s.id==='door');if(door)sp={x:door.x,y:door.y+34,d:0}}
 ST.x=sp.x;ST.y=sp.y;ST.d=sp.d==null?2:sp.d;ST.fr=0;ST.mv=false;
 ST.props=(def.props||[]).map(mkProp).filter(Boolean);
 ST.props.forEach((p,i)=>{const d0=def.props[i];if(p.k==='tree'){p.solid=true;p.sw=22}if(p.k==='bench'){p.solid=false;p.sw=0}});
 // วัตถุซ่อน: กองใบไม้ (เควส)
 ST.leaf=[];
 // ผู้เข้าร่วม: สุ่มจากโมเดลเดิม
 ST.vis=[];const win=nowAct(id);ST.win=win;
 const seed=S.day*7+id.length*13;const n=def.visitors||0,ros=pickRoster(n,seed);
 ros.forEach((sp2,i)=>{const[x,y]=spawnPoint(def,seed+i*31);ST.vis.push({sp:sp2,x,y,d:0,fr:0,tx:x,ty:y,wait:Math.random()*3,spd:34+Math.random()*22,name:'สมาชิกชุมชน',id:'member',pose:0})});
 // ภายในโบสถ์/มัสยิด: ผู้ร่วมพิธีนั่ง/ยืนเป็นแถว (เมื่อมีกิจกรรม)
 if(def.inner)layoutCongregation(id,win,seed);
 // NPC ศาสนา
 ST.npcs=(def.npcs||[]).filter(n=>!def.rel||!NPC[n.id].rel||def.rel===NPC[n.id].rel).map(n=>Object.assign({},n,{fr:0}));
 ST.flags=ST.flags||{};if(id==='church_in'||id==='mosque_in'||o.fresh){}
 DOM.root.classList.add('on');DOM.title.textContent=def.title;
 camSnap();ST.act=o.key||null;
 cancelAnimationFrame(ST.raf);ST.raf=requestAnimationFrame(loop);
 AU.on=true;actx();ambience(id);
 if(REL.quests)REL.quests.onEnter(id);
 REL.evt('enter',id);
 return true;
}
function spawnPoint(def,seed){let s=seed|0;const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647};for(let i=0;i<40;i++){const x=60+rnd()*(def.w-120),y=def.top+40+rnd()*(def.h-def.top-120);if(!blockedAt(def,x,y)&&!(def.exit&&inRect(R2(def.exit.x-40,def.exit.y-60,def.exit.w+80,def.exit.h+80),x,y)))return[x,y]}return[def.spawn.x+40,def.spawn.y-60]}
function layoutCongregation(id,win,seed){
 ST.vis=[];const ros=pickRoster(8,seed);
 if(id==='church_in'){const n=win?7:2;// นั่งในม้านั่งแถวต่าง ๆ (มองไปทางแท่นบูชา)
  const slots=[[160,264],[230,264],[300,324],[180,384],[250,444],[660,264],[780,324],[700,384],[800,444],[640,504]];
  for(let i=0;i<n;i++)ST.vis.push({sp:ros[i%ros.length],x:slots[i][0],y:slots[i][1]+20,d:2,fr:0,static:true,name:'สมาชิกชุมชน',id:'member',pose:1});
 }
 if(id==='mosque_in'){const n=win?8:2;// ยืนเป็นแถวบนพรมละหมาด หันไปทางมิห์รอบ (ท่านิ่งเรียบร้อย)
  const slots=[[160,300],[240,300],[320,300],[640,300],[720,300],[800,300],[200,360],[760,360]];
  for(let i=0;i<n;i++)ST.vis.push({sp:ros[i%ros.length],x:slots[i][0],y:slots[i][1],d:2,fr:0,static:true,name:'ผู้ร่วมละหมาด',id:'member',pose:1})
 }
}
function camSnap(){const d=ST.def;ST.cam.x=clamp(ST.x-VW/2,0,Math.max(0,d.w-VW));ST.cam.y=clamp(ST.y-VH*.62,0,Math.max(0,d.h-VH))}
function leaveScene(){
 ST.on=false;cancelAnimationFrame(ST.raf);clearInterval(AU.tm);AU.on=false;if(DOM)DOM.root.classList.remove('on');
 ST.keys={};ST.joy={x:0,y:0};
 REL.closeDlg&&REL.closeDlg(true);
}
function goHome(){
 leaveScene();try{if(window.CUT)CUT.on=0}catch(e){}
 if(!REL.backHome())return;
}
function askLeave(){
 if(ST.busy||!ST.on)return;
 if(REL.dlgOn&&REL.dlgOn())return;
 const inner=ST.def.inner;
 const base=ST.id.replace('_in','');
 REL.dlg({name:'🚌 กลับบริษัท',tag:'รถเมล์สาย 77 · ไม่เสียค่าโดยสาร',lines:['ต้องการกลับบริษัทด้วยรถเมล์สาย 77 หรือไม่?'+(inner?' (จะออกจากอาคารก่อน)':'')],
  choices:[{t:'🚌 กลับบริษัท',ok:true,fn:()=>{if(inner){const o=ST.id==='church_in'?'church':'mosque';leaveToExt(o)}else goHome()}},{t:'อยู่ต่อ',fn:()=>{}}]})
}
function leaveToExt(o){enter(o,{from:'in'})}

/* ----------------------------------------------------------------- เกมลูป */
function dirOf(dx,dy){return Math.abs(dx)>Math.abs(dy)?(dx<0?1:3):(dy<0?2:0)}
const KM={w:'up',a:'left',s:'down',d:'right',arrowup:'up',arrowleft:'left',arrowdown:'down',arrowright:'right'};
function inputVec(){
 let dx=(ST.keys.right?1:0)-(ST.keys.left?1:0),dy=(ST.keys.down?1:0)-(ST.keys.up?1:0);
 if(!dx&&!dy&&(ST.joy.x||ST.joy.y)){dx=ST.joy.x;dy=ST.joy.y}
 const m=Math.hypot(dx,dy);if(m>1){dx/=m;dy/=m}return[dx,dy];
}
function loop(ts){
 if(!ST.on)return;ST.raf=requestAnimationFrame(loop);
 const dt=Math.min(.05,((ts-(ST.last||ts))/1000));ST.last=ts;ST.t+=dt;
 try{update(dt);draw()}catch(e){console.error('REL scene',e)}
}
function update(dt){
 const def=ST.def;ST.fade=Math.max(0,ST.fade-dt*2.2);
 const locked=ST.busy||(REL.dlgOn&&REL.dlgOn())||!!ST.seq;
 // เวลาปิดสถานที่
 if(S.t>=def.close&&!ST.closing&&!locked){ST.closing=true;try{toast('🌙 ค่ำแล้ว · ถึงเวลากลับบริษัท')}catch(e){}
  REL.dlg({name:'🌙 ถึงเวลากลับ',tag:'สถานที่กำลังปิด',lines:['ดึกแล้ว ควรกลับบริษัทด้วยรถเมล์สาย 77']
   ,choices:[{t:'🚌 กลับบริษัท',ok:true,fn:()=>{ST.closing=false;if(def.inner)leaveToExt(ST.id==='church_in'?'church':'mosque');goHomeSoon()}}]})}
 if(!locked){
  const[dx,dy]=inputVec();ST.mv=!!(dx||dy);
  if(ST.mv){const sp=150*dt;let nx=ST.x+dx*sp,ny=ST.y+dy*sp;
   if(!blockedAt(def,nx,ST.y))ST.x=nx;if(!blockedAt(def,ST.x,ny))ST.y=ny;ST.d=dirOf(dx,dy);ST.fr+=dt*8;
   if(Math.floor(ST.fr)%4===0&&Math.random()<.04)SFX.step()}
  else ST.fr=0;
 }else ST.mv=false;
 // ผู้เข้าร่วมเดินเล่น
 ST.vis.forEach(v=>{if(v.static)return;
  if(v.wait>0){v.wait-=dt;v.fr=0;if(v.wait<=0){const[x,y]=spawnPoint(def,Math.floor(Math.random()*1e6));v.tx=x;v.ty=y}return}
  const ddx=v.tx-v.x,ddy=v.ty-v.y,m=Math.hypot(ddx,ddy);
  if(m<4){v.wait=2+Math.random()*5;v.fr=0;return}
  const sp=v.spd*dt,nx=v.x+ddx/m*sp,ny=v.y+ddy/m*sp;
  if(!blockedAt(def,nx,v.y))v.x=nx;else v.wait=.4;if(!blockedAt(def,v.x,ny))v.y=ny;else v.wait=.4;
  v.d=dirOf(ddx,ddy);v.fr+=dt*7});
 // กล้อง
 const tx=clamp(ST.x-VW/2,0,Math.max(0,def.w-VW)),ty=clamp(ST.y-VH*.62,0,Math.max(0,def.h-VH));ST.cam.x+=(tx-ST.cam.x)*Math.min(1,dt*7);ST.cam.y+=(ty-ST.cam.y)*Math.min(1,dt*7);
 // อนุภาค (กลีบดอกไม้/ฝุ่นแสง)
 if(ST.parts.length<26&&Math.random()<.12)ST.parts.push({x:Math.random()*def.w,y:-10,vx:6+Math.random()*10,vy:14+Math.random()*16,a:Math.random()*6,k:ST.id==='temple'?'petal':ST.id==='church_in'?'dust':ST.id==='mosque'||ST.id==='church'?'leaf':'dust'});
 ST.parts.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.a+=dt*2});ST.parts=ST.parts.filter(p=>p.y<def.h+10&&p.x<def.w+10);
 // จุดโต้ตอบใกล้ตัว
 if(!locked){ST.spotNow=nearSpot()}else ST.spotNow=null;
 hud();
}
function goHomeSoon(){setTimeout(()=>{if(ST.on&&!SCN[ST.id].inner)goHome()},120)}
function spotsNow(){
 const def=ST.def,out=[];
 for(const s of def.spots){
  if(s.kind==='sweep')continue;
  if(s.kind==='decor'&&!(REL.quests&&REL.quests.spotOn&&REL.quests.spotOn('decor'))&&!ST.win)continue;
  if(s.kind==='food'&&!(ST.win&&ST.win.id&&/iftar|eid/.test(ST.win.id)))continue;
  out.push(s)}
 if(REL.quests&&REL.quests.extraSpots)REL.quests.extraSpots(ST.id).forEach(s=>out.push(s));
 // NPC
 ST.npcs.forEach(n=>out.push({id:'npc:'+n.id,x:n.x,y:n.y+16,r:62,hint:'💬 กด E เพื่อคุยกับ'+NPC[n.id].name,kind:'npc',npc:n.id}));
 ST.vis.forEach((v,i)=>{if(v.static)return;out.push({id:'vis:'+i,x:v.x,y:v.y,r:52,hint:'💬 กด E เพื่อพูดคุยกับ'+(v.name||'สมาชิกชุมชน'),kind:'visitor',vi:i})});
 if(ST.def.exit)out.push({id:'exit',x:ST.def.exit.x+ST.def.exit.w/2,y:ST.def.exit.y+20,r:Math.max(70,ST.def.exit.w/2),hint:ST.def.inner?'🚪 กด E เพื่อออกจากอาคาร':'🚌 กด E เพื่อกลับบริษัท (รถเมล์สาย 77)',kind:'exit'});
 return out;
}
function nearSpot(){let best=null,bd=1e9;for(const s of spotsNow()){const d=Math.hypot(s.x-ST.x,(s.y-ST.y)*1.15);if(d<s.r&&d<bd){best=s;bd=d}}return best}
function hud(){
 const s=ST.spotNow;let h=s?s.hint:'';
 if(s&&s.kind==='door'&&ST.id==='mosque'&&!ST.flags.shoesOff)h='🕌 ประตูมัสยิด · ถอดรองเท้าที่ชั้นวางก่อนเข้า';
 DOM.hint.textContent=h;DOM.hint.classList.toggle('on',!!h&&!ST.busy&&!ST.seq);
 DOM.time.textContent='เวลาในเกม '+REL.fmtT(S.t)+' น.'+(ST.win?' · '+ST.win.icon+' '+ST.win.title+' ('+REL.fmtT(ST.win.start)+'–'+REL.fmtT(ST.win.end)+')':'')+(ST.id==='mosque'?(ST.flags.shoesOff?' · 👟 ถอดรองเท้าแล้ว':'')+(ST.flags.wudu?' · 💧 วุฎูแล้ว':''):'');
 const tk=REL.quests&&REL.quests.tracker?REL.quests.tracker():'';DOM.trk.innerHTML=tk;DOM.trk.classList.toggle('on',!!tk);
}

/* ----------------------------------------------------------------- วาด */
function draw(){
 const g=DOM.g,def=ST.def;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,VW,VH);
 const cx=Math.round(ST.cam.x),cy=Math.round(ST.cam.y);
 g.imageSmoothingEnabled=false;g.drawImage(ST.bg.c,-cx,-cy,def.w,def.h);g.imageSmoothingEnabled=true;
 g.save();g.translate(-cx,-cy);
 const items=[];
 ST.props.forEach(p=>items.push({y:p.y,d:()=>{g.imageSmoothingEnabled=false;const sx=p.k==='tree'?2:2;g.drawImage(p.spr,p.x-p.w/2,p.y-p.h+(p.k==='tree'?4:2),p.w,p.h);g.imageSmoothingEnabled=true}}));
 items.push(...dyn(g));
 ST.vis.forEach(v=>items.push({y:v.y,d:()=>{shadowAt(g,v.x,v.y);drawGeneric(g,v.sp,v.x,v.y,v.d,v.static?0:Math.floor(v.fr)%4)}}));
 ST.npcs.forEach(n=>{const spd=0;items.push({y:n.y,d:()=>{shadowAt(g,n.x,n.y);drawCleric(g,NPC[n.id].cl,n.x,n.y,n.d,0);tag(g,n.x,n.y-92,NPC[n.id].name,REL.def()?REL.def().color:'#ffd45a')}})});
 items.push({y:ST.y,d:()=>{shadowAt(g,ST.x,ST.y);const bob=0;drawCEO(g,ST.x,ST.y,ST.d,ST.fr,ST.mv)}});
 items.sort((a,b)=>a.y-b.y).forEach(o=>o.d());
 // ชั้นเหนือหัว: อนุภาค/แสง
 ST.parts.forEach(p=>{g.save();g.globalAlpha=.7;if(p.k==='petal'){g.fillStyle='#ff9ac2';g.translate(p.x,p.y);g.rotate(p.a);g.fillRect(-2,-1,4,2)}else if(p.k==='leaf'){g.fillStyle='#8fbf5a';g.translate(p.x,p.y);g.rotate(p.a);g.fillRect(-2,-1,4,2)}else{g.fillStyle='rgba(255,236,170,.5)';g.beginPath();g.arc(p.x,p.y,1.6,0,6.3);g.fill()}g.restore()});
 g.restore();
 ambientTint(g);
 if(ST.fade>0){g.fillStyle='rgba(5,8,20,'+ST.fade+')';g.fillRect(0,0,VW,VH)}
}
function shadowAt(g,x,y){g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(x,y-1,19,6,0,0,Math.PI*2);g.fill()}
function tag(g,x,y,t,c){g.save();g.font='bold 11px "Noto Sans Thai","Sarabun",sans-serif';g.textAlign='center';const w=g.measureText(t).width+12;g.fillStyle='rgba(12,18,40,.86)';g.fillRect(x-w/2,y-12,w,16);g.strokeStyle=c||'#ffd45a';g.lineWidth=1;g.strokeRect(x-w/2+.5,y-11.5,w-1,15);g.fillStyle='#fff';g.fillText(t,x,y);g.restore()}
function dyn(g){ // วัตถุที่เปลี่ยนตามสถานะ (เปลวเทียน อาหาร ป้ายสถานะ ฯลฯ)
 const o=[],t=ST.t;
 if(ST.id==='temple'){o.push({y:350,d:()=>{for(let i=0;i<3;i++){const fx=524+(62+i*14)*2+2,fy=304-9*2-12;g.fillStyle='rgba(255,170,60,'+(.75+Math.sin(t*9+i)*.2)+')';g.beginPath();g.ellipse(fx,fy,3,5,0,0,6.3);g.fill();g.fillStyle='rgba(255,200,100,.16)';g.beginPath();g.arc(fx,fy,18,0,6.3);g.fill()}}});
  if(REL.quests&&REL.quests.leafPiles)REL.quests.leafPiles().forEach(p=>o.push({y:p.y,d:()=>{g.fillStyle='#c98a3a';g.beginPath();g.ellipse(p.x,p.y-4,16,8,0,0,6.3);g.fill();g.fillStyle='#e0a84a';g.beginPath();g.ellipse(p.x-3,p.y-7,9,5,0,0,6.3);g.fill();g.fillStyle='#a56a28';g.fillRect(p.x+4,p.y-8,5,3)}}))}
 if(ST.id==='church_in'){o.push({y:80,d:()=>{[[392,92],[548,92]].forEach(([x,y],i)=>{g.fillStyle='rgba(255,180,60,'+(.8+Math.sin(t*8+i)*.15)+')';g.beginPath();g.ellipse(x,y,3,5,0,0,6.3);g.fill();g.fillStyle='rgba(255,200,100,.18)';g.beginPath();g.arc(x,y,22,0,6.3);g.fill()})}})}
 if(ST.id==='mosque'&&ST.win&&/iftar|eid/.test(ST.win.id)){
  [[230,600,200],[850,600,200]].forEach(([x,y,w])=>o.push({y:y+40,d:()=>{g.fillStyle='rgba(0,0,0,.2)';g.fillRect(x,y+34,w,8);g.fillStyle='#e9e0c8';g.fillRect(x,y,w,34);g.fillStyle='#c9bc98';g.fillRect(x,y,w,4);g.fillStyle='#8a6a46';g.fillRect(x+6,y+34,5,16);g.fillRect(x+w-11,y+34,5,16);
   for(let i=0;i<5;i++){g.fillStyle=['#c9552a','#e8b948','#3a8f5a','#b8332a','#f3ead2'][i];g.beginPath();g.ellipse(x+22+i*38,y+16,13,7,0,0,6.3);g.fill();g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.ellipse(x+19+i*38,y+13,6,3,0,0,6.3);g.fill()}}}))}
 if(ST.id==='church'&&(ST.win&&/xmas/.test(ST.win.id)||(REL.quests&&REL.quests.spotOn&&REL.quests.spotOn('decor')))){o.push({y:560,d:()=>{const x=900,y=520;g.fillStyle='#00000030';g.beginPath();g.ellipse(x,y+4,26,7,0,0,6.3);g.fill();g.fillStyle='#2f7a47';[[0,-54,22,22],[0,-36,30,22],[0,-18,38,22]].forEach(([dx,dy,w,h])=>{g.beginPath();g.moveTo(x+dx,y+dy-h/2);g.lineTo(x+dx-w,y+dy+h/2);g.lineTo(x+dx+w,y+dy+h/2);g.closePath();g.fill()});g.fillStyle='#6b4a2b';g.fillRect(x-4,y-8,8,12);
  for(let i=0;i<9;i++){g.fillStyle=['#ff4a4a','#ffd45a','#5ab0ff','#fff'][i%4];g.globalAlpha=.6+.4*Math.sin(t*4+i);g.beginPath();g.arc(x-18+(i%3)*18+Math.sin(i)*4,y-50+Math.floor(i/3)*16,2.4,0,6.3);g.fill();g.globalAlpha=1}g.fillStyle='#ffe27a';g.fillRect(x-3,y-70,6,6)}})}
 // ป้ายยืนยันเมื่อมีกิจกรรมในฉาก
 return o;
}
function ambientTint(g){
 const h=S.t/60,def=ST.def;let n=0;if(h>=18)n=clamp((h-18)/2.2,0,1);else if(h<6)n=clamp((6-h)/1.2,0,1)*.8+.2;
 const k=def.inner?.45:1;
 if(n>0){g.fillStyle='rgba(10,16,52,'+(.5*n*k).toFixed(3)+')';g.fillRect(0,0,VW,VH);
  g.save();g.globalCompositeOperation='screen';const lights=ST.id==='temple'?[[880,470],[440,470]]:ST.id==='church'?[[1090,500],[1480,520]]:[];
  g.restore()}
 else if(h<9&&!def.inner){g.fillStyle='rgba(255,196,120,'+(.10*(1-(h-6)/3)).toFixed(3)+')';g.fillRect(0,0,VW,VH)}
 // แสงอุ่นยามเช้า/ลำแสง
 if(ST.id==='church_in'||ST.id==='mosque_in'){g.fillStyle='rgba(255,232,170,.04)';g.fillRect(0,0,VW,VH)}
}

/* ----------------------------------------------------------------- โต้ตอบ */
function interact(){
 if(!ST.on||ST.busy||ST.seq)return;if(REL.dlgOn&&REL.dlgOn())return;
 const s=ST.spotNow;if(!s){try{toast('เดินเข้าใกล้จุดที่มีไอคอนแล้วกด E')}catch(e){}return}
 actSpot(s);
}
function say(npc,lines,choices,done){const N=NPC[npc]||NPC.member;const c=N.card&&REL_ASSETS[N.card]?REL_ASSETS[N.card].card:'';REL.dlg({name:N.name,tag:N.tag,img:c,lines,choices,done})}
function actSpot(s){
 const k=s.kind,win=ST.win;
 // เควส: จุดพิเศษ
 if(REL.quests&&REL.quests.useSpot&&REL.quests.useSpot(s,{place:ST.id,say,ST})){return}
 if(k==='exit'){if(ST.def.inner){leaveToExt(ST.id==='church_in'?'church':'mosque')}else askLeave();return}
 if(k==='door'){
  if(ST.id==='mosque'&&!ST.flags.shoesOff){say('imam',['กรุณาถอดรองเท้าที่ชั้นวางข้างประตูก่อนเข้าห้องละหมาดนะครับ'],null);return}
  enter(NEXT[ST.id].door,{});return}
 if(k==='shoes'){REL.evt('use','shoes');ST.flags.shoesOff=!ST.flags.shoesOff;try{toast(ST.flags.shoesOff?'👟 ถอดรองเท้าวางบนชั้นแล้ว':'👟 สวมรองเท้าแล้ว')}catch(e){}return}
 if(k==='wudu'){seq('💧 ชำระล้างก่อนละหมาด (วุฎู)','น้ำใสเย็น ใช้เวลาไม่นาน',3.2,()=>{ST.flags.wudu=true;try{toast('💧 วุฎูเรียบร้อย พร้อมเข้าร่วมละหมาด')}catch(e){}REL.evt('use','wudu')});return}
 if(k==='bell'){SFX.bell();try{toast('🔔 เสียงระฆังดังก้องไกล')}catch(e){}REL.evt('use',s.id);return}
 if(k==='fountain'||k==='bodhi'){SFX.chime();try{toast(k==='bodhi'?'🌳 นั่งพักใต้ต้นโพธิ์ ลมเย็นสบาย':'⛲ เสียงน้ำพุเบา ๆ ทำให้ใจสงบ')}catch(e){}REL.evt('use',s.id);return}
 if(k==='incense'){seq('🪔 จุดธูปบูชา','ควันบาง ๆ ลอยขึ้นอย่างสงบ',2.4,()=>{REL.evt('use','incense')});return}
 if(k==='quran'){say('imam',['เชิญอ่านได้ตามสะดวกครับ ที่นี่เปิดให้ทุกคนที่มาอย่างสงบ'],null,()=>REL.evt('use','quran'));return}
 if(k==='lectern'){say('priest',['บทเรียนวันนี้พูดถึงความเมตตาและการให้อภัยครับ'],null,()=>REL.evt('use','lectern'));return}
 if(k==='altar'){seq('🕯️ จุดเทียนที่แท่นบูชา','เปลวเทียนสั่นไหวเบา ๆ',2.6,()=>REL.evt('use','altar'));return}
 if(k==='garden'){REL.evt('use','garden');try{toast('🌷 เด็ดดอกไม้ที่โบสถ์อนุญาตให้ไว้ตกแต่ง')}catch(e){}return}
 if(k==='decor'){if(REL.quests&&REL.quests.decorStep)REL.quests.decorStep();return}
 if(k==='npc'){talkNpc(s.npc);return}
 if(k==='visitor'){talkVisitor(s.vi);return}
 // กิจกรรมหลักของสถานที่
 if(k==='merit'||k==='offer'||k==='chedi'||k==='pew'||k==='prayer'||k==='food'){mainActivity(s);return}
}
function seq(title,sub,secs,done){
 ST.seq={t:0,d:secs,title,sub,done};DOM.seq.innerHTML='<b>'+esc(title)+'</b><span>'+esc(sub||'')+'</span><div class="pg"><i style="width:0"></i></div>';DOM.seq.classList.add('on');ST.busy=false;
 const iv=setInterval(()=>{if(!ST.seq||!ST.on){clearInterval(iv);DOM.seq.classList.remove('on');return}
  ST.seq.t+=.1;const bar=DOM.seq.querySelector('i');if(bar)bar.style.width=Math.min(100,ST.seq.t/ST.seq.d*100)+'%';
  if(ST.seq.t>=ST.seq.d){clearInterval(iv);const f=ST.seq.done;ST.seq=null;DOM.seq.classList.remove('on');try{f&&f()}catch(e){console.error(e)}}},100);
}
function finishAct(a,title,lines){
 const rw=REL.completeAct(a);REL.summary({title:a.icon+' '+a.title+(title?' · '+title:''),lines,rw});
 if(rw)SFX.coin();REL.evt('done',a.id);
}
function mainActivity(s){
 const win=ST.win&&REL.statusOf(S.day,ST.win)==='available'?ST.win:nowAct(ST.id);ST.win=win;
 const k=s.kind,id=win&&win.id,rl=REL.rid();
 const free=txt=>{try{toast(txt)}catch(e){}};
 if(k==='merit'){
  if(win&&win.id==='wanphra')return seq('🙏 ไหว้พระและทำบุญวันพระ','จุดธูปเทียน วางดอกไม้ บูชาพระ',5,()=>finishAct(win,'',['ไหว้พระ จุดธูปเทียน ถวายดอกไม้','พระอาจารย์ให้พรเบา ๆ']));
  return seq('🙏 ไหว้พระ','ทำบุญตามกำลังใจ',3,()=>{free('🙏 ขอบคุณที่แวะมา วันนี้ไม่มีกิจกรรมพิเศษ แต่บุญเล็ก ๆ ก็สำคัญ');REL.evt('use','merit')})}
 if(k==='offer'){
  return seq('🍚 ถวายอาหาร','จัดอาหารใส่ภาชนะอย่างเรียบร้อย',4,()=>{if(win&&win.id==='wanphra'&&!ST.flags.offered){ST.flags.offered=true}free('🍚 ถวายอาหารแล้ว ขอให้เป็นบุญกุศล');REL.evt('use','offer')})}
 if(k==='chedi'){
  if(win&&win.festival&&(ST.def&&ST.def.rel)==='buddhism')return seq('🪔 เวียนเทียนรอบเจดีย์','เดินประทักษิณ 3 รอบ ด้วยจิตสงบ',7,()=>finishAct(win,'',['เวียนเทียนครบ 3 รอบ','แสงเทียนสะท้อนเจดีย์ทองยามค่ำ']));
  return seq('🛕 ชมเจดีย์','ทองสะท้อนแสง',2.4,()=>REL.evt('use','chedi'))}
 if(k==='pew'){
  if(win&&(id==='service'||id==='easter'||id==='christmas'||id==='goodfri'))
   return startService(win);
  say('priest',['ตอนนี้ไม่ใช่เวลาพิธีครับ แต่เชิญนั่งพักและสวดภาวนาเงียบ ๆ ได้ตามสบาย'],null);return}
 if(k==='prayer'){
  if(!ST.flags.wudu){say('imam',['กรุณาวุฎู (ชำระล้าง) ที่ลานด้านนอกก่อนเข้าร่วมละหมาดนะครับ'],null);return}
  if(win&&(id==='jumuah'||id==='eidfitr'||id==='eidadha'))return startPrayer(win);
  say('imam',['ตอนนี้ไม่ใช่เวลาละหมาดรวม เชิญนั่งพักในห้องละหมาดอย่างสงบได้ครับ'],null);return}
 if(k==='food'){
  if(win&&(id==='iftar'||id==='eidadha'||id==='eidfitr')&&!ST.flags['food'+s.id]){
   return seq('🍲 แบ่งปันอาหาร','จัดอาหารและเสิร์ฟให้ผู้ร่วมงาน',4,()=>{ST.flags['food'+s.id]=true;const both=ST.flags.foodfood1&&ST.flags.foodfood2;
    if(id==='iftar'){if(both)finishAct(win,'',['จัดอาหารละศีลอดให้ชุมชนครบทั้งสองโต๊ะ','นั่งรับประทานร่วมกันอย่างอบอุ่น']);else{try{toast('🍲 โต๊ะนี้เสร็จแล้ว · ไปช่วยอีกโต๊ะ')}catch(e){}}}
    else if(win.id==='eidadha'||win.id==='eidfitr'){try{toast('🍲 แบ่งปันอาหารให้ผู้คนแล้ว')}catch(e){}REL.evt('use','food')}})}
  try{toast('🍲 โต๊ะนี้จัดเรียบร้อยแล้ว')}catch(e){}return}
}
function startService(a){
 const pr=NPC.priest;REL.dlg({name:pr.name,tag:a.title,img:REL_ASSETS.priest.card,lines:['เชิญนั่งตามสบายครับ พิธีกำลังจะเริ่ม'],choices:[{t:'🪑 นั่งร่วมพิธี',ok:true,fn:()=>{
  ST.x=640;ST.y=404;ST.d=2;ST.mv=false;SFX.bell();
  seq('⛪ '+a.title,'ฟังบทเทศน์ร่วมกับสมาชิกชุมชน · เสียงออร์แกนเบา ๆ',9,()=>{
   REL.dlg({name:pr.name,tag:a.title,img:REL_ASSETS.priest.card,lines:['ขอบคุณที่มาร่วมพิธีวันนี้ ขอให้สัปดาห์นี้เป็นสัปดาห์ที่ดีของคุณและครอบครัว'],done:()=>{REL.addRel('priest',2);finishAct(a,'',['ฟังเทศน์และร่วมสวดภาวนา','พบบาทหลวงหลังพิธี'])}})})}},{t:'ยังก่อน',fn:()=>{}}]})
}
function startPrayer(a){
 const im=NPC.imam;REL.dlg({name:im.name,tag:a.title,img:REL_ASSETS.imam.card,lines:['เชิญเข้าแถวด้านหลังได้เลยครับ'],choices:[{t:'🕌 เข้าร่วมละหมาด',ok:true,fn:()=>{
  ST.x=720;ST.y=420;ST.d=2;ST.mv=false;SFX.soft();
  seq('🕌 '+a.title,'ยืนเข้าแถวหลังสุด · อิหม่ามนำละหมาด (แสดงอย่างสงบ ไม่มีภาพเคลื่อนไหวประกอบละหมาด)',9,()=>{REL.addRel('imam',2);finishAct(a,'',['ร่วมละหมาดอย่างสงบ','ทักทายอิหม่ามและผู้ร่วมละหมาด'])})}},{t:'ยังก่อน',fn:()=>{}}]})
}
function talkNpc(id){
 const N=NPC[id];if(!N)return;const nth=REL.relOf(id);
 const q=REL.quests&&REL.quests.talk?REL.quests.talk(id,{say}):null;if(q)return;
 REL.addRel(id,0);const n=(ST.flags['t_'+id]=(ST.flags['t_'+id]||0)+1);
 const win=ST.win;let lines=[pickLine(id,n+S.day)];
 if(win&&ST.win.place===(NPC[id].rel==='buddhism'?'temple':NPC[id].rel==='christianity'?'church':'mosque'))lines.unshift('วันนี้เป็น'+win.title+' ขอบคุณที่มาร่วมกัน');
 say(id,lines,null,()=>{if(!ST.flags['rt_'+id+S.day]){ST.flags['rt_'+id+S.day]=1;REL.addRel(id,1)}REL.evt('talk',id)});
}
function talkVisitor(i){
 const v=ST.vis[i];if(!v)return;const q=REL.quests&&REL.quests.talk?REL.quests.talk('member',{say,v,fromVisitor:true}):null;if(q)return;
 const n=(ST.flags['tv'+i]||0)+1;ST.flags['tv'+i]=n;
 REL.dlg({name:'สมาชิกชุมชน',tag:'พบที่'+(ST.def.title||''),img:portraitOf(v.sp),lines:[pickLine('member',i+n+S.day)],done:()=>{if(!ST.flags['rtv'+i]){ST.flags['rtv'+i]=1;REL.addRel('member',1)}REL.evt('talk','member')}});
}

/* ----------------------------------------------------------------- อินพุตคีย์บอร์ด */
window.addEventListener('keydown',e=>{
 if(!ST.on)return;if(/^(INPUT|SELECT|TEXTAREA)$/.test((e.target||{}).tagName||''))return;
 if(REL.dlgOn&&REL.dlgOn())return;                       // กล่องสนทนาจัดการเอง
 const k=(e.key||'').toLowerCase(),m=KM[k];
 if(m){ST.keys[m]=1;e.preventDefault();e.stopImmediatePropagation();return}
 if(k==='e'||k==='enter'||k===' '){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)interact();return}
 if(k==='escape'){e.preventDefault();e.stopImmediatePropagation();askLeave()}
 else e.stopImmediatePropagation();
},true);
window.addEventListener('keyup',e=>{if(!ST.on)return;const m=KM[(e.key||'').toLowerCase()];if(m){ST.keys[m]=0;e.stopImmediatePropagation()}},true);
window.addEventListener('blur',()=>{ST.keys={}});

/* ================================================================== ฉากถนน: พระบิณฑบาต + บูธอาสาชุมชน */
const SG={drawn:false};

const ALMS_STOP={x:330,y:276},EDGE_R=1020,EDGE_L=-60;
function almsState(){ // ตำแหน่งพระ ตามเวลาในเกม (S.t) — ไม่สุ่ม ไม่ใช้ตัวจับเวลาแยก
 const r=REL.R();if(!r||REL.rid()!=='buddhism')return null;
 let a=r.alms;if(!a||a.day!==S.day){a=r.alms={day:S.day,done:false,leaveAt:null}}
 const t=S.t,IN0=390,IN1=405,OUT=480;
 if(t<IN0||t>=OUT+16&&!a.done)return null;
 if(a.done){const L=a.leaveAt||t;if(t>=L+16)return null;const q=clamp((t-L)/16,0,1);return{x:ALMS_STOP.x+(EDGE_L-ALMS_STOP.x)*q,y:ALMS_STOP.y,d:1,mv:q<1,state:'LEAVING',a}}
 if(t<IN1){const q=(t-IN0)/(IN1-IN0);return{x:EDGE_R+(ALMS_STOP.x-EDGE_R)*q,y:ALMS_STOP.y,d:1,mv:true,state:'ARRIVING',a}}
 if(t<OUT)return{x:ALMS_STOP.x,y:ALMS_STOP.y,d:0,mv:false,state:'WAITING',a};
 const q=clamp((t-OUT)/16,0,1);return{x:ALMS_STOP.x+(EDGE_L-ALMS_STOP.x)*q,y:ALMS_STOP.y,d:1,mv:q<1,state:'LEAVING',a};
}
const STALL={x:560,y:272};
function stallOn(){const a=REL.actsFor(S.day).find(z=>z.id==='community');return a&&S.t>=a.start-10&&S.t<=a.end+20?a:null}
REL.streetObjs=function(g,t){
 const out=[];
 try{
  const am=almsState();
  if(am&&am.x>-70&&am.x<1030)out.push({y:am.y,draw:()=>{g.save();shadowAt(g,am.x,am.y);drawCleric(g,'monk',am.x,am.y,am.d,am.mv?Math.floor(t*.008)%4:0);
   if(am.state==='WAITING'){g.font='bold 10px "Noto Sans Thai",sans-serif';g.textAlign='center';const nm='พระสงฆ์ (บิณฑบาต)',w=g.measureText(nm).width+10;g.fillStyle='rgba(60,32,8,.88)';g.fillRect(am.x-w/2,am.y-104,w,14);g.strokeStyle='#f3a640';g.strokeRect(am.x-w/2+.5,am.y-103.5,w-1,13);g.fillStyle='#ffe3b0';g.fillText(nm,am.x,am.y-94)}
   g.restore()}});
  const st=stallOn();
  if(st){out.push({y:STALL.y+10,draw:()=>{g.save();g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(STALL.x,STALL.y+8,52,8,0,0,6.3);g.fill();
   g.fillStyle='#8a5a30';g.fillRect(STALL.x-46,STALL.y-18,92,22);g.fillStyle='#d0a060';g.fillRect(STALL.x-46,STALL.y-18,92,4);g.fillStyle='#e9e0c8';g.fillRect(STALL.x-42,STALL.y-30,84,12);
   for(let i=0;i<4;i++){g.fillStyle=['#3a8f5a','#e8b948','#c9552a','#5ab0ff'][i];g.fillRect(STALL.x-38+i*20,STALL.y-38,14,10)}
   g.fillStyle='#2c6a62';g.fillRect(STALL.x-50,STALL.y-70,100,16);g.fillStyle='#f0e8d0';g.font='bold 11px "Noto Sans Thai",sans-serif';g.textAlign='center';g.fillText('🤝 บูธอาสาชุมชน',STALL.x,STALL.y-58);
   g.fillStyle='#6b4a2b';g.fillRect(STALL.x-48,STALL.y-70,3,60);g.fillRect(STALL.x+45,STALL.y-70,3,60);g.restore()}});
   out.push({y:STALL.y+16,draw:()=>{const sp={kind:'cust',id:'phak'};shadowAt(g,STALL.x+64,STALL.y+16);drawGeneric(g,sp,STALL.x+64,STALL.y+16,1,0);tag(g,STALL.x+64,STALL.y-76,'อาสาสมัครชุมชน','#5ab0ff')}})}
 }catch(e){}
 return out;
};
function nearAlms(st){const am=almsState();return(am&&am.state==='WAITING'&&Math.hypot(am.x-st.x,(am.y-st.y)*1.2)<88)?am:null}
function nearStall(st){return stallOn()&&Math.hypot((STALL.x+30)-st.x,(STALL.y+16-st.y)*1.2)<110}
REL.streetPrompt=function(st){
 if(REL.dlgOn&&REL.dlgOn())return '';
 if(nearAlms(st)){const a=REL.actsFor(S.day).find(z=>z.id==='alms');return(a&&REL.statusOf(S.day,a)==='completed')?'':'🙏 กด E เพื่อใส่บาตรพระสงฆ์'}
 if(nearStall(st)){const a=stallOn();return a&&REL.statusOf(S.day,a)==='completed'?'🤝 กด E เพื่อคุยกับอาสาสมัคร':'🤝 กด E เพื่อช่วยบูธอาสาชุมชน'}
 return '';
};
REL.streetInteract=function(st){
 const am=nearAlms(st);
 if(am){const a=REL.actsFor(S.day).find(z=>z.id==='alms');
  if(!a)return false;
  if(REL.statusOf(S.day,a)==='completed'){say('monk',['โยมใส่บาตรแล้วนะ ขอให้เจริญในธรรม'],null);return true}
  REL.dlg({name:NPC.monk.name,tag:'พระสงฆ์ · บิณฑบาตหน้าบริษัท',img:REL_ASSETS.monk.card,lines:['อาตมามาบิณฑบาต เชิญโยมได้ตามกำลังใจ'],choices:[
   {t:'🍚 ใส่ข้าวสวยและกับข้าว',ok:true,fn:()=>doAlms(a,am)},{t:'ไว้ก่อน',fn:()=>{}}]});
  return true}
 if(nearStall(st)){const a=stallOn();
  if(a&&REL.statusOf(S.day,a)==='available'){
   const q=REL.quests&&REL.quests.talk?REL.quests.talk('vol',{say:(n,l,c,d)=>REL.dlg({name:NPC.vol.name,tag:NPC.vol.tag,img:portraitOf({kind:'cust',id:'phak'}),lines:l,choices:c,done:d})}):null;if(q)return true;
   REL.dlg({name:NPC.vol.name,tag:NPC.vol.tag,img:portraitOf({kind:'cust',id:'phak'}),lines:['สวัสดีค่ะ! วันนี้เรากำลังจัดของให้เพื่อนบ้าน ช่วยกันหน่อยได้ไหมคะ?'],choices:[{t:'🤝 ช่วยจัดของ',ok:true,fn:()=>{REL.addRel('vol',1);const rw=REL.completeAct(a);REL.summary({title:a.icon+' '+a.title,lines:['ช่วยจัดของและแจกเสบียงให้เพื่อนบ้าน'],rw});if(rw)SFX.coin();REL.evt('talk','vol')}},{t:'ไว้ก่อน',fn:()=>{}}]})
  }else{REL.dlg({name:NPC.vol.name,tag:NPC.vol.tag,img:portraitOf({kind:'cust',id:'phak'}),lines:[pickLine('vol',S.day)],done:()=>REL.evt('talk','vol')})}
  return true}
 return false;
};
function doAlms(a,am){
 const r=REL.R();r.alms=r.alms||{};r.alms.done=true;r.alms.leaveAt=Math.floor(S.t);
 const rw=REL.completeAct(a);REL.addRel('monk',1);
 REL.dlg({name:NPC.monk.name,tag:'ขอให้โยมเจริญด้วยอายุ วรรณะ สุขะ พละ',img:REL_ASSETS.monk.card,lines:['อนุโมทนา ขอให้โยมมีความสุขความเจริญ','พระสงฆ์ให้พรแล้วเดินต่อไปบิณฑบาตที่อื่น'],done:()=>{REL.summary({title:a.icon+' '+a.title,lines:['ใส่บาตรหน้าบริษัท พระสงฆ์ให้พรแล้วเดินต่อ'],rw});if(rw)SFX.coin();REL.evt('done','alms')}});
}
// สถานะสำหรับเทสต์/ดีบัก
REL.alms=almsState;

REL.scene={enter,leave:leaveScene,goHome,interact,state:()=>ST,SCN,nowAct,spotsNow,almsState,say,seq,NPC,SFX,ambience,isOn:()=>ST.on};
})();
