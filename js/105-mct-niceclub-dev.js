
/* ============================================================================
 * NICECLUB — DEVELOPER TEST MODE  [STEP 8]
 * แยกจากโหมดเล่นปกติ: ไม่บันทึกคะแนน ไม่ให้เงิน ไม่แตะสถิติ · เปิดจากปุ่ม 🛠 ในหน้าเลือกเกม
 * ทุกชุดทดสอบใช้ NC_ENGINE / NC_SONGS / AudioContext ตัวจริง (ไม่มีผลลัพธ์ปลอม)
 * ========================================================================== */
(function(root){
'use strict';
if(root.NC_DEV||!root.NC_ENGINE||!root.NC_SONGS||!root.NICECLUB)return;
const EN=root.NC_ENGINE,NS=root.NC_SONGS,NC=root.NICECLUB;
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const mk=(notes,game)=>({game:game||'arrow',notes});
const snapCfg=()=>JSON.parse(JSON.stringify(EN.cfg));
function withCfg(fn){const c=snapCfg();try{EN.resetCfg();return fn()}finally{EN.setCfg({windows:c.windows,points:c.points,acc:c.acc,offsetMs:c.offsetMs})}}
const R=(name,ok,info)=>({name,ok:ok===null?null:!!ok,info:info||''});

/* ---------- ชุดทดสอบอัตโนมัติ (ไม่ต้องใช้มือ) ---------- */
const AUTO={
 'Beatmap Test':()=>{
  const out=[];let n=0,bad=0,worst='';
  NS.SONGS.forEach(s=>NS.GAMES.forEach(g=>NS.DIFFS.forEach(d=>{n++;
   const m=NS.beatmap(s.id,g.id,d);let ok=!!m&&m.count>0,why='';
   if(m){let last=-1;for(const x of m.notes){
     if(x.t<last){ok=false;why='เรียงเวลาผิด'}last=x.t;
     if(x.t<NS.LEAD_IN||x.t>m.durMs){ok=false;why='เวลานอกช่วงเพลง'}
     const off=(x.t-NS.LEAD_IN)/s.stepMs;if(Math.abs(off-Math.round(off))*s.stepMs>1.01){ok=false;why='ไม่ตรงกริดจังหวะ'}
     if(g.id==='circle'){if(!(x.x>=0&&x.x<=1&&x.y>=0&&x.y<=1)){ok=false;why='พิกัดวงกลมนอกช่วง'}}else if(!(x.lane>=0&&x.lane<g.lanes)){ok=false;why='lane นอกช่วง'}
     if(x.type==='hold'&&!(x.dur>0)){ok=false;why='Hold ไม่มีความยาว'}}}
   if(!ok){bad++;worst=worst||(s.id+'/'+g.id+'/'+d+': '+why)}})));
  out.push(R('ตรวจ Beatmap ทั้งหมด '+n+' ชาร์ต (12 เพลง × 4 เกม × 4 ระดับ)',bad===0,bad?bad+' ชาร์ตผิด · '+worst:'เรียงเวลา/อยู่ในช่วงเพลง/ตรงกริดจังหวะ/lane ถูกต้อง'));
  const c=NS.DIFFS.map(d=>NS.info('ar1','arrow',d).count);out.push(R('ความหนาแน่นเพิ่มตามระดับ (ar1: '+c.join(' < ')+')',c[0]<c[1]&&c[1]<c[2]&&c[2]<c[3]));
  return out},
 'BPM Test':()=>{
  const out=[];
  NS.SONGS.forEach(s=>{const sp=60000/s.bpm/4;const dev=Math.abs(s.stepMs-sp);out.push(R(s.name+' · '+s.bpm+' BPM → 16th = '+sp.toFixed(2)+' ms',dev<1e-6&&s.durMs>60000,'ความยาว '+(s.durMs/1000).toFixed(1)+' s'))});
  return out},
 'Multi-Note Test':()=>withCfg(()=>{
  const out=[];
  let r=EN.newRun(mk([{t:1000,lane:0,pair:2},{t:2000,lane:1,pair:3}]));
  r.press(0,1000);r.press(2,1010);r.press(1,2000);r.press(3,2020);r.finish();
  out.push(R('กดพร้อมกัน 2 ปุ่ม × 2 ครั้ง → ตัดสินครบ 4 ตัว (PERFECT 4)',r.result().perfect===4,JSON.stringify(r.result())));
  r=EN.newRun(mk([{t:1000,lane:0},{t:1000,lane:1},{t:1000,lane:2},{t:1000,lane:3}]));[0,1,2,3].forEach(l=>r.press(l,1000));r.finish();
  out.push(R('กด 4 ปุ่มพร้อมกัน (ลูกศร 4 ทิศ)',r.result().perfect===4&&r.result().maxCombo===4));
  r=EN.newRun(mk(Array.from({length:7},(_,i)=>({t:1000,lane:i})),'piano'));for(let i=0;i<7;i++)r.press(i,1005);r.finish();
  out.push(R('Piano 7 ช่องพร้อมกัน',r.result().perfect===7));
  r=EN.newRun({game:'circle',notes:[{t:1000,x:.2,y:.3,pair:true,px:.8,py:.7}]});
  r.pressAt(.2,.3,1000,.1,'a');r.pressAt(.8,.7,1010,.1,'b');r.finish();out.push(R('Beat Circle 2 วงพร้อมกัน',r.result().perfect===2));
  const pairs=NS.SONGS.reduce((a,s)=>a+NS.beatmap(s.id,'arrow','EXPERT').notes.filter(n=>n.pair!==undefined).length,0);
  out.push(R('Beatmap มีโน้ตคู่จริง (ARROW EXPERT ทุกเพลงรวม '+pairs+' คู่)',pairs>0));
  return out}),
 'Hold Note Test':()=>withCfg(()=>{
  const out=[];const H=[{t:1000,lane:0,type:'hold',dur:1000}];
  let r=EN.newRun(mk(H));r.press(0,1000);r.release(0,2000);r.finish();out.push(R('ถือครบ → สำเร็จ 1 ตัดสิน (PERFECT)',r.result().perfect===1&&r.result().total===1));
  r=EN.newRun(mk(H));r.press(0,1000);r.release(0,1500);r.finish();out.push(R('ปล่อยก่อนจบ 500ms → MISS (ตรวจการกดค้าง)',r.result().miss===1&&r.result().score===0));
  r=EN.newRun(mk(H));r.press(0,1000);r.tick(2300);r.finish();out.push(R('ไม่ปล่อยจนเลยปลาย → สำเร็จอัตโนมัติ',r.result().perfect===1));
  r=EN.newRun(mk(H));r.tick(1500);r.press(0,1500);r.finish();out.push(R('เริ่มกดช้าเกิน → MISS (ตรวจการเริ่มกด)',r.result().miss===1));
  r=EN.newRun(mk(H));r.press(0,1090);r.release(0,1990);r.finish();out.push(R('หัวโน้ต GOOD (+90ms) คงเกรดไว้ = 400',r.result().good===1&&r.result().score===400));
  const holds=NS.SONGS.reduce((a,s)=>a+NS.info(s.id,'arrow','EXPERT').holds+NS.info(s.id,'piano','EXPERT').holds+NS.info(s.id,'dj','EXPERT').holds+NS.info(s.id,'circle','EXPERT').holds,0);
  out.push(R('Beatmap EXPERT มี Hold จริง (รวม '+holds+' ตัว)',holds>0));
  return out}),
 'Score Test':()=>withCfg(()=>{
  const out=[];const notes=Array.from({length:10},(_,i)=>({t:1000+i*400,lane:i%4}));
  const d=[0,20,40,60,80,100,119,130,-20,0];  // PERFECT,PERFECT,GREAT,GREAT,GOOD,GOOD,GOOD,MISS,PERFECT,PERFECT
  const r=EN.newRun(mk(notes));notes.forEach((n,i)=>{r.press(n.lane,n.t+d[i]);r.release(n.lane,n.t+d[i]+40)});r.finish();const x=r.result();
  const exp=4*1000+2*700+3*400;
  out.push(R('คะแนน = 4×1000 + 2×700 + 3×400 = '+exp,x.score===exp,'ได้ '+x.score));
  out.push(R('Accuracy = (4+2×0.7+3×0.4)/10 = 66%',Math.abs(x.acc-66)<.01,'ได้ '+x.acc+'%'));
  out.push(R('MISS 1 · Max Combo ตัดตามลำดับ',x.miss===1&&x.maxCombo===7,'maxCombo '+x.maxCombo));
  out.push(R('Rank ตามเกณฑ์ (66% → C)',x.rank==='C',x.rank));
  EN.setCfg({points:{perfect:2000,great:1000,good:500}});
  const r2=EN.newRun(mk([{t:1000,lane:0},{t:1500,lane:1}]));r2.press(0,1000);r2.press(1,1550);r2.finish();
  out.push(R('ค่าคะแนนปรับได้ (2000/1000)',r2.result().score===3000));
  EN.resetCfg();EN.setCfg({windows:{perfect:60,great:100,good:150}});
  const r3=EN.newRun(mk([{t:1000,lane:0}]));r3.press(0,1055);r3.finish();out.push(R('หน้าต่างเวลาปรับได้ (PERFECT ±60)',r3.result().perfect===1));
  return out}),
};
/* ---------- ชุดที่ต้องวัดกับนาฬิกาจริง (async) ---------- */
function ctxOrNull(){return NC.ac&&NC.ac(true)}
async function audioSync(){
 const c=ctxOrNull();if(!c)return[R('AudioContext',false,'สร้างไม่ได้')];
 try{await c.resume()}catch(e){}
 const out=[];
 out.push(R('AudioContext state = running',c.state==='running',c.state));
 out.push(R('sampleRate',null,c.sampleRate+' Hz'));
 out.push(R('baseLatency / outputLatency',null,((c.baseLatency||0)*1000).toFixed(1)+' ms / '+((c.outputLatency||0)*1000).toFixed(1)+' ms'));
 const t0=c.currentTime,p0=performance.now();await new Promise(r=>setTimeout(r,2000));
 const dc=(c.currentTime-t0)*1000,dp=performance.now()-p0,drift=dc-dp;
 out.push(R('นาฬิกาเสียงเทียบนาฬิการะบบ 2 วินาที: ต่างกัน '+drift.toFixed(2)+' ms',c.state==='running'&&Math.abs(drift)<20,'audio '+dc.toFixed(1)+' ms · perf '+dp.toFixed(1)+' ms'));
 // ตรวจ mapping event.timeStamp → ctx
 const o=c.getOutputTimestamp?c.getOutputTimestamp():null;
 out.push(R('getOutputTimestamp รองรับ (ใช้แปลงเวลาปุ่มกด → เวลาเพลง)',!!o&&o.contextTime>0,o?('contextTime '+o.contextTime.toFixed(3)):'ไม่รองรับ → ใช้ currentTime แทน'));
 // เล่น click ตามเวลาที่ตั้งไว้ แล้ววัดเวลาที่ส่งจริงด้วย ScriptProcessor/AudioWorklet ไม่ได้ในทุกเบราว์เซอร์ → วัดผ่าน scheduling ahead
 const g=c.createGain();g.gain.value=.0001;g.connect(c.destination);const osc=c.createOscillator();osc.connect(g);const when=c.currentTime+.2;osc.start(when);osc.stop(when+.05);
 await new Promise(r=>setTimeout(r,320));out.push(R('ตั้งเวลาเสียงล่วงหน้า 200 ms สำเร็จ (ไม่มี error)',true));
 return out}
async function animSync(){
 const out=[];const c=ctxOrNull();if(!c)return[R('AudioContext',false,'สร้างไม่ได้')];
 try{await c.resume()}catch(e){}
 const t0c=c.currentTime,t0p=performance.now(),fr=[];let last=t0p,maxD=0,sum=0,n=0;
 await new Promise(res=>{const f=()=>{const now=performance.now();fr.push(now-last);last=now;
  const a=(c.currentTime-t0c)*1000,p=now-t0p,d=Math.abs(a-p);   // ตำแหน่งแอนิเมชันจากนาฬิกาเสียง vs นาฬิการะบบ
  if(n>5){maxD=Math.max(maxD,d);sum+=d}n++;
  if(now-t0p<3000)requestAnimationFrame(f);else res()};requestAnimationFrame(f)});
 const s=fr.slice(2).sort((a,b)=>a-b),avg=s.reduce((a,b)=>a+b,0)/s.length,p95=s[Math.floor(s.length*.95)],drop=s.filter(x=>x>25).length;
 out.push(R('เฟรมเฉลี่ย '+avg.toFixed(1)+' ms (~'+Math.round(1000/avg)+' FPS) · p95 '+p95.toFixed(1)+' ms · เฟรมช้า >25ms: '+drop+'/'+s.length,avg<34,'ตัวเลขนี้ขึ้นกับเครื่อง'));
 out.push(R('ตำแหน่งแอนิเมชัน (นาฬิกาเสียง) vs นาฬิการะบบ: ต่างสูงสุด '+maxD.toFixed(1)+' ms',maxD<25,'เฉลี่ย '+(sum/Math.max(1,n-6)).toFixed(2)+' ms'));
 return out}

/* ---------- UI ---------- */
function css(){
 if(document.getElementById('ncDevCss'))return;
 const st=document.createElement('style');st.id='ncDevCss';
 st.textContent='#ncSel .ncDv{display:flex;flex-direction:column;gap:8px;font-size:12px}#ncSel .ncDv h3{margin:0;font-size:16px;color:#ffd96b}'+
 '#ncSel .ncDv .wb{border:1px solid #a98a2a;background:rgba(80,60,0,.2);border-radius:8px;padding:6px 8px;color:#ffe9a8}'+
 '#ncSel .ncDt{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:6px}#ncSel .ncDt button{min-height:42px;border:1px solid #6a3fd0;background:#2a0f52;color:#fff;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;padding:4px 6px}'+
 '#ncSel .ncDo{background:rgba(0,0,0,.35);border-radius:8px;padding:6px 8px;max-height:200px;overflow:auto;font-family:monospace;font-size:11px;line-height:1.55}'+
 '#ncSel .ncDo .p{color:#7dffb0}#ncSel .ncDo .f{color:#ff7a96}#ncSel .ncDo .i{color:#9fb8ff}'+
 '#ncSel .ncDr{display:flex;flex-wrap:wrap;gap:6px;align-items:center}#ncSel .ncDr select,#ncSel .ncDr input{background:#1a0a34;color:#fff;border:1px solid #6a3fd0;border-radius:6px;padding:5px;min-height:34px}';
 document.head.appendChild(st);
}
function renderDev(host,back){
 css();
 let tapT=[],tapBeat=0,ofTimer=0;
 host.innerHTML='<div class="ncDv"><div style="display:flex;justify-content:space-between;align-items:center"><h3>🛠 Developer Test Mode</h3><button class="ncX" data-b type="button" style="min-width:90px">← กลับ</button></div>'+
  '<div class="wb">โหมดนี้แยกจากการเล่นปกติ: <b>ไม่บันทึกคะแนน · ไม่ให้เงินรางวัล · ไม่นับสถิติ</b> · เหมาะสำหรับตรวจระบบและปรับ Offset</div>'+
  '<div class="ncDt" data-t></div>'+
  '<div class="ncDr"><b>เล่นในโหมดทดสอบ:</b><select data-g>'+NS.GAMES.map(g=>'<option value="'+g.id+'">'+g.name+'</option>').join('')+'</select><select data-s></select><select data-d>'+NS.DIFFS.map(d=>'<option>'+d+'</option>').join('')+'</select><button class="ncBtn" data-go type="button">▶ เล่น (TEST)</button></div>'+
  '<div class="ncDr"><b>Timing Offset:</b><button class="ncBtn" data-dom type="button" style="min-width:44px">−10</button><span data-ov style="min-width:70px;text-align:center"></span><button class="ncBtn" data-dop type="button" style="min-width:44px">+10</button><button class="ncBtn" data-ot type="button">🎯 วัด Offset (แตะตามจังหวะ)</button><button class="ncBtn" data-bt type="button">♩ BPM Tap</button></div>'+
  '<div class="ncDo" data-o>ผลการทดสอบจะแสดงที่นี่</div></div>';
 const $=s=>host.querySelector(s),out=$('[data-o]');
 const show=(title,rows)=>{out.innerHTML='<div class="i">▶ '+esc(title)+'</div>'+rows.map(r=>'<div class="'+(r.ok===null?'i':r.ok?'p':'f')+'">'+(r.ok===null?'ℹ ':r.ok?'✔ PASS ':'✘ FAIL ')+esc(r.name)+(r.info?' — '+esc(r.info):'')+'</div>').join('')+'<div class="i">สรุป: '+rows.filter(r=>r.ok===true).length+' ผ่าน · '+rows.filter(r=>r.ok===false).length+' ไม่ผ่าน</div>'};
 const names=['BPM Test','Timing Offset Test','Beatmap Test','Multi-Note Test','Hold Note Test','Score Test','Audio Sync Test','Animation Sync Test'];
 $('[data-t]').innerHTML=names.map(n=>'<button type="button" data-n="'+n+'">'+n+'</button>').join('');
 const fillS=()=>{$('[data-s]').innerHTML=NS.forGame($('[data-g]').value).map(s=>'<option value="'+s.id+'">'+esc(s.name)+'</option>').join('')};fillS();$('[data-g]').onchange=fillS;
 const offTxt=()=>{$('[data-ov]').textContent=EN.cfg.offsetMs+' ms'};offTxt();
 const setOff=v=>{EN.setCfg({offsetMs:v});const n=NC.state&&NC.state();if(n){n.offsetMs=EN.cfg.offsetMs;try{save(1)}catch(e){}}offTxt()};
 $('[data-dom]').onclick=()=>setOff(EN.cfg.offsetMs-10);$('[data-dop]').onclick=()=>setOff(EN.cfg.offsetMs+10);
 host.addEventListener('click',async e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-b')){stopMetro();back();return}
  if(b.hasAttribute('data-go')){stopMetro();const f=NC.play;if(f){const g=$('[data-g]').value,s=$('[data-s]').value,d=$('[data-d]').value;NC.closeSelect();f(g,s,d,{dev:true,onEnd:()=>NC.openSelect&&setTimeout(()=>NC.openSelect('dev'),0)})}return}
  if(b.hasAttribute('data-ot')){offsetTest();return}
  if(b.hasAttribute('data-bt')){bpmTap();return}
  const n=b.dataset.n;if(!n)return;
  if(AUTO[n]){show(n,AUTO[n]())}
  else if(n==='Audio Sync Test'){out.textContent='กำลังวัด… (2 วินาที)';show(n,await audioSync())}
  else if(n==='Animation Sync Test'){out.textContent='กำลังวัด… (3 วินาที)';show(n,await animSync())}
  else if(n==='Timing Offset Test'){offsetTest()}});
 /* --- Metronome + วัด Offset (แตะ/กดปุ่มใดก็ได้ตามจังหวะ 8 ครั้ง) --- */
 function stopMetro(){clearInterval(ofTimer);ofTimer=0;if(host._kh){document.removeEventListener('keydown',host._kh,true);host._kh=null}}
 function offsetTest(){
  stopMetro();const c=ctxOrNull();if(!c){out.textContent='AudioContext ไม่พร้อม';return}
  try{c.resume()}catch(e){}
  const BPM=100,per=60/BPM,start=c.currentTime+1.2,N=10,taps=[];
  const g=c.createGain();g.gain.value=NC.state&&localStorage.getItem('mct_sound')==='0'?0:.4;g.connect(c.destination);
  for(let i=0;i<N;i++){const o=c.createOscillator(),e2=c.createGain();o.frequency.value=i%4===0?1320:880;e2.gain.setValueAtTime(.0001,start+i*per);e2.gain.exponentialRampToValueAtTime(.8,start+i*per+.005);e2.gain.exponentialRampToValueAtTime(.0001,start+i*per+.08);o.connect(e2);e2.connect(g);o.start(start+i*per);o.stop(start+i*per+.1)}
  out.innerHTML='<div class="i">แตะ/กดปุ่มใดก็ได้ตามเสียงเมโทรนอม '+N+' ครั้ง (เริ่มใน ~1 วินาที) — ครั้งแรกๆ ใช้ทำความคุ้นเคย</div><div class="i" data-m>…</div>';
  const mapT=ts=>{const o=c.getOutputTimestamp?c.getOutputTimestamp():null;let ct=o&&o.contextTime,pt=o&&o.performanceTime;if(!ct||!pt){ct=c.currentTime;pt=performance.now()}return ct+(ts-pt)/1000};
  const rec=(ts)=>{const tc=mapT(ts);const k=Math.round((tc-start)/per);if(k<0||k>=N)return;const d=(tc-(start+k*per))*1000;taps.push(d);
   const m=out.querySelector('[data-m]');if(m)m.textContent='แตะแล้ว '+taps.length+' ครั้ง · ล่าสุด '+(d>0?'+':'')+d.toFixed(0)+' ms'};
  host._kh=e=>{if(e.repeat)return;if(e.key==='Escape')return;e.preventDefault();e.stopPropagation();rec(e.timeStamp)};document.addEventListener('keydown',host._kh,true);
  host._pd=e=>{if(!e.target.closest('[data-n],[data-go],[data-b],[data-dom],[data-dop]'))rec(e.timeStamp)};
  out.onpointerdown=e=>rec(e.timeStamp);
  ofTimer=setTimeout(()=>{stopMetro();
   const use=taps.slice(2);if(use.length<4){show('Timing Offset Test',[R('แตะน้อยเกินไป ('+taps.length+' ครั้ง)',false,'ต้องการอย่างน้อย 6 ครั้ง')]);return}
   const mean=use.reduce((a,b)=>a+b,0)/use.length,sd=Math.sqrt(use.reduce((a,b)=>a+(b-mean)*(b-mean),0)/use.length);
   show('Timing Offset Test',[R('แตะ '+use.length+' ครั้ง: เฉลี่ย '+(mean>0?'+':'')+mean.toFixed(1)+' ms · SD '+sd.toFixed(1)+' ms',null,'+ = ช้ากว่าเสียง'),R('ค่า Offset ที่แนะนำ = '+Math.round(mean)+' ms (กด + / − เพื่อใช้ค่านี้)',sd<60,sd<60?'':'ผลแกว่งมาก ลองวัดใหม่')])},(1.2+N*per+.6)*1000)}
 function bpmTap(){
  stopMetro();tapT=[];out.innerHTML='<div class="i">แตะ/กดปุ่มใดก็ได้ตามจังหวะที่ต้องการวัด BPM อย่างน้อย 6 ครั้ง</div><div class="i" data-m>…</div>';
  const f=ts=>{tapT.push(ts);if(tapT.length>12)tapT.shift();if(tapT.length>=3){const dts=[];for(let i=1;i<tapT.length;i++)dts.push(tapT[i]-tapT[i-1]);const avg=dts.reduce((a,b)=>a+b,0)/dts.length;
   const m=out.querySelector('[data-m]');if(m)m.textContent='BPM ≈ '+(60000/avg).toFixed(1)+' (จาก '+tapT.length+' ครั้ง)'}};
  host._kh=e=>{if(e.repeat||e.key==='Escape')return;e.preventDefault();e.stopPropagation();f(e.timeStamp)};document.addEventListener('keydown',host._kh,true);out.onpointerdown=e=>f(e.timeStamp)}
 return{stop:stopMetro}}
root.NC_DEV={AUTO,audioSync,animSync,render:renderDev,version:'step8'};
})(typeof window!=='undefined'?window:globalThis);

