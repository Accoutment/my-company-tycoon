
/* ============================================================================
 * NICECLUB — RHYTHM ENGINE (Timing + Scoring + Rank + Reward)   [STEP 6 / STEP 7]
 * ตัวกลางตัวเดียวร่วมกันทุกเกม · เวลาทุกอย่างเป็น "ms ตามเวลาเพลง" (ได้จาก AudioContext clock)
 * - หน้าต่างตัดสิน/คะแนน/ค่าถ่วงความแม่น ปรับได้ (cfg) · Audio Offset ปรับได้
 * - กันกดโน้ตเดิมซ้ำ (โน้ต 1 ตัวถูกใช้ครั้งเดียว) · key-repeat/กดซ้ำขณะค้างอยู่ถูกละเว้น
 * - Hold: ตรวจทั้งการเริ่มกด (หัว) และการกดค้างจนจบ (ปล่อยก่อนเวลา = MISS)
 * ไม่มี DOM/เสียงในไฟล์นี้ → ทดสอบแยกได้ (Developer Test Mode ใช้ตัวเดียวกับเกมจริง)
 * ========================================================================== */
(function(root){
'use strict';
if(root.NC_ENGINE)return;
const DEFAULTS={windows:{perfect:30,great:70,good:120},points:{perfect:1000,great:700,good:400,miss:0},acc:{perfect:1,great:.7,good:.4,miss:0},offsetMs:0};
const cfg=JSON.parse(JSON.stringify(DEFAULTS));
function setCfg(o){ // ปรับได้ทีละกลุ่ม · ตรวจค่าให้สมเหตุผล (perfect<=great<=good)
 if(!o)return cfg;
 if(o.windows){const w=Object.assign({},cfg.windows,o.windows);
  if(w.perfect>0&&w.perfect<=w.great&&w.great<=w.good&&w.good<=400)cfg.windows=w}
 if(o.points)cfg.points=Object.assign({},cfg.points,o.points);
 if(o.acc)cfg.acc=Object.assign({},cfg.acc,o.acc);
 if(o.offsetMs!==undefined&&isFinite(+o.offsetMs))cfg.offsetMs=Math.max(-300,Math.min(300,Math.round(+o.offsetMs)));
 return cfg}
const resetCfg=()=>{cfg.windows=Object.assign({},DEFAULTS.windows);cfg.points=Object.assign({},DEFAULTS.points);cfg.acc=Object.assign({},DEFAULTS.acc);cfg.offsetMs=0};
const grade=ad=>ad<=cfg.windows.perfect?'perfect':ad<=cfg.windows.great?'great':ad<=cfg.windows.good?'good':null;

/* ---------- Run: 1 รอบการเล่น ---------- */
function expand(map){
 const T=[];let id=0;
 map.notes.forEach(n=>{
  const base={t:n.t,type:n.type==='hold'?'hold':'tap',dur:n.type==='hold'?(n.dur||0):0,kind:n.type,state:'wait',grade:null,id:0};
  const a=Object.assign({},base,{id:id++});
  if(map.game==='circle'){a.x=n.x;a.y=n.y}else a.lane=n.lane;
  T.push(a);
  if(n.pair!==undefined&&n.pair!==false){
   const b=Object.assign({},base,{id:id++,pairOf:a.id});
   if(map.game==='circle'){b.x=n.px;b.y=n.py}else b.lane=n.pair;
   T.push(b)}});
 T.sort((p,q)=>p.t-q.t||p.id-q.id);return T}
function newRun(map,opts){
 opts=opts||{};
 const R={map,game:map.game,targets:expand(map),onJudge:opts.onJudge||null,
  score:0,combo:0,maxCombo:0,perfect:0,great:0,good:0,miss:0,judged:0,total:0,holding:{},down:{},lastJ:null,presses:0,ignored:0};
 R.total=R.targets.length;R.max=R.total*cfg.points.perfect;
 R.first=0;
 const apply=(tg,g,delta)=>{
  tg.state='done';tg.grade=g;R[g]++;R.judged++;R.score+=cfg.points[g];
  if(g==='miss')R.combo=0;else{R.combo++;if(R.combo>R.maxCombo)R.maxCombo=R.combo}
  R.lastJ={g,delta,id:tg.id,lane:tg.lane};
  if(R.onJudge)try{R.onJudge(tg,g,delta)}catch(e){}};
 R.accuracy=()=>{if(!R.judged)return 100;const w=cfg.acc;return (R.perfect*w.perfect+R.great*w.great+R.good*w.good)/R.judged*100};
 R.finalAccuracy=()=>R.total?(R.perfect*cfg.acc.perfect+R.great*cfg.acc.great+R.good*cfg.acc.good)/R.total*100:0;
 /* หาเป้าหมายของ lane ที่กดได้ตอนนี้ (ตัวที่ยังรออยู่และอยู่ในหน้าต่าง GOOD · เลือกใกล้เวลาที่สุด) */
 const pick=(tp,test)=>{let best=null,bd=1e9;
  for(let i=R.first;i<R.targets.length;i++){const tg=R.targets[i];
   if(tg.t-tp>cfg.windows.good)break;
   if(tg.state!=='wait'||!test(tg))continue;
   const d=Math.abs(tg.t-tp);if(d<=cfg.windows.good&&d<bd){bd=d;best=tg}}
  return best};
 const hit=(tg,tp,key)=>{
  const delta=tp-tg.t,g=grade(Math.abs(delta));if(!g)return null;
  if(tg.type==='hold'){tg.state='holding';tg.headGrade=g;tg.headDelta=delta;tg.key=key;R.holding[key]=tg;
   if(R.onJudge)try{R.onJudge(tg,g,delta,'head')}catch(e){}
   return{g,delta,hold:true,tg}}
  apply(tg,g,delta);return{g,delta,tg}};
 /* กดที่ lane (เกมแบบช่อง) · tMs = เวลาเพลงที่กด (ยังไม่หัก offset) */
 R.press=(lane,tMs)=>{
  const key='L'+lane;if(R.down[key]){R.ignored++;return null}              // กดค้าง/key-repeat → ไม่นับซ้ำ
  R.down[key]=1;R.presses++;
  const tp=tMs-cfg.offsetMs;R.update(tp);
  const tg=pick(tp,x=>x.lane===lane);
  return tg?hit(tg,tp,key):null};
 /* กดแบบวงกลม: (x,y) เป็นพิกัด 0..1 (ใส่ r = รัศมียอมรับ) หรือ null = กดคีย์บอร์ด (เลือกตัวที่ใกล้เวลาสุด) */
 R.pressAt=(x,y,tMs,r,pid)=>{
  const key='P'+pid;if(R.down[key]){R.ignored++;return null}
  R.down[key]=1;R.presses++;
  const tp=tMs-cfg.offsetMs;R.update(tp);
  const tg=pick(tp,q=>x==null?true:(typeof r==='function'?r(q):Math.hypot(q.x-x,q.y-y)<=r));
  return tg?hit(tg,tp,key):null};
 R.release=(laneOrKey,tMs)=>{
  const key=typeof laneOrKey==='number'?'L'+laneOrKey:laneOrKey;delete R.down[key];
  const tg=R.holding[key];if(!tg)return null;
  delete R.holding[key];
  const tp=tMs-cfg.offsetMs,end=tg.t+tg.dur;
  if(tp>=end-cfg.windows.good){apply(tg,tg.headGrade,tg.headDelta);return{g:tg.headGrade,done:true,tg}}   // ถือครบ/ปล่อยใกล้จุดจบ
  apply(tg,'miss',tp-end);return{g:'miss',broken:true,tg}};                                                // ปล่อยก่อนเวลา
 /* เดินเวลา: MISS โน้ตที่เลยหน้าต่าง · Hold ที่ถือถึงปลายแล้ว = สำเร็จ */
 R.update=(nowMs)=>{
  for(let i=R.first;i<R.targets.length;i++){const tg=R.targets[i];
   if(tg.t-nowMs>cfg.windows.good+400)break;
   if(tg.state==='wait'&&nowMs-tg.t>cfg.windows.good)apply(tg,'miss',nowMs-tg.t);
   else if(tg.state==='holding'&&nowMs>=tg.t+tg.dur+cfg.windows.good){delete R.holding[tg.key];apply(tg,tg.headGrade,tg.headDelta)}}
  while(R.first<R.targets.length&&R.targets[R.first].state==='done')R.first++};
 R.tick=(nowMs)=>R.update(nowMs-cfg.offsetMs);
 R.finish=()=>{R.update(1e9);Object.keys(R.holding).forEach(k=>{const tg=R.holding[k];if(tg.state==='holding')apply(tg,'miss',0)});R.holding={}};
 R.result=()=>({score:R.score,max:R.max,acc:+R.finalAccuracy().toFixed(2),maxCombo:R.maxCombo,perfect:R.perfect,great:R.great,good:R.good,miss:R.miss,total:R.total,
  rank:rankOf({acc:R.finalAccuracy(),miss:R.miss,good:R.good,great:R.great,total:R.total})});
 return R}

/* ---------- Rank: SSS / SS / S / A / B / C / D (ตาม Accuracy ถ่วงน้ำหนัก) ---------- */
const RANK_T=[['SSS',99.5],['SS',98],['S',95],['A',88],['B',78],['C',62]];
function rankOf(r){
 if(r.total&&r.miss===0&&r.good===0&&r.great===0)return 'SSS';        // PERFECT ล้วน
 for(const [k,v] of RANK_T){if(k==='SSS')continue;if(r.acc>=v)return k}
 return 'D'}

/* ---------- เงินรางวัล (STEP 7) — มีเพดานกันฟาร์ม ---------- */
const REWARD={base:{EASY:120,NORMAL:240,HARD:420,EXPERT:700},rank:{SSS:2,SS:1.6,S:1.3,A:1,B:.7,C:.4,D:.15},
 perPlayCap:1500,dailyCap:6000,repeat:[1,.5,.25,.1,0],firstClear:.5,levelStep:.04};
/* ledger = {date,total,plays:{chartKey:n},cleared:{chartKey:1}} (ส่งอ้างอิงเข้ามา แล้วฟังก์ชันอัปเดตให้) · วันที่ใช้ปฏิทินจริง */
const todayKey=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function reward(songId,diff,res,ledger,lv,commit){
 const out={money:0,raw:0,capped:false,reason:'',factor:1,first:false};
 if(!res||!res.total||(res.perfect+res.great+res.good)===0){out.reason='ไม่มีโน้ตที่กดโดน';return out}
 if(ledger.date!==todayKey()){ledger.date=todayKey();ledger.total=0;ledger.plays={}}
 if(!ledger.cleared)ledger.cleared={};
 const key=songId+'|'+diff,n=ledger.plays[key]||0;
 let raw=REWARD.base[diff]*REWARD.rank[res.rank]*(res.acc/100)*(1+(lv-1)*REWARD.levelStep);
 out.first=!ledger.cleared[key]&&res.rank!=='D';if(out.first)raw*=1+REWARD.firstClear;
 out.raw=Math.round(raw);
 const f=REWARD.repeat[Math.min(n,REWARD.repeat.length-1)];out.factor=f;
 let m=Math.round(raw*f);
 if(m>REWARD.perPlayCap){m=REWARD.perPlayCap;out.capped=true;out.reason='ถึงเพดานต่อเพลง'}
 const left=Math.max(0,REWARD.dailyCap-(ledger.total||0));
 if(m>left){m=left;out.capped=true;out.reason='ถึงเพดานรางวัลรายวัน'}
 if(f===0&&!out.reason)out.reason='เล่นชาร์ตนี้ซ้ำหลายครั้งวันนี้ ไม่มีรางวัลเพิ่ม';
 else if(f<1&&!out.reason)out.reason='เล่นซ้ำวันนี้ รางวัลลดเหลือ '+Math.round(f*100)+'%';
 out.money=m;
 if(commit){ledger.plays[key]=n+1;ledger.total=(ledger.total||0)+m;if(res.rank!=='D')ledger.cleared[key]=1}
 return out}

root.NC_ENGINE={cfg,DEFAULTS,setCfg,resetCfg,newRun,rankOf,RANK_T,REWARD,reward,todayKey,grade,version:'step6'};
})(typeof window!=='undefined'?window:globalThis);

