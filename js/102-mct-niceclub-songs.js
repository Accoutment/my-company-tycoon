
/* ============================================================================
 * NICECLUB — SONGS · BEATMAPS · PREVIEW · SCORE STORE   [STEP 4: Rhythm Game Selection]
 * - เพลงทั้งหมดสังเคราะห์ในโค้ด (WebAudio) ไม่มีไฟล์เสียง / ไม่ใช้เพลงมีลิขสิทธิ์
 * - เพลง 1 เพลง = ข้อมูล (bpm, คอร์ด, แพตเทิร์นกลอง, ท่วงทำนอง) → events() สร้างลำดับโน้ตแบบกำหนดได้ (seeded)
 *   ทั้งเสียง Preview และ Beatmap มาจาก events() ชุดเดียวกัน ⇒ โน้ตในเกมตรงกับเสียงที่ได้ยิน (STEP 5-7 ใช้ต่อ)
 * - Beatmap แยกตามเกม (4 ประเภท) × ระดับ (EASY/NORMAL/HARD/EXPERT)
 * - คะแนน/สถิติเก็บที่ S.niceclub.scores / S.niceclub.stats (เกมเดิมเซฟให้เอง)
 * ========================================================================== */
(function(root){
'use strict';
if(root.NC_SONGS)return;
const LEAD_IN=2000;                       // ms ก่อนโน้ตแรก (STEP 6 ใช้เป็น offset เริ่มเพลง)
const DIFFS=['EASY','NORMAL','HARD','EXPERT'];
const GAMES=[
 {id:'arrow',name:'ARROW DANCE',icon:'🏹',desc:'กดลูกศร 4 ทิศตามจังหวะ',color:'#ff4fd8',lanes:4},
 {id:'piano',name:'PIANO RHYTHM',icon:'🎹',desc:'โน้ตเลื่อนลง 7 ช่อง (A S D F J K L) · Tap / Hold',color:'#4aa8ff',lanes:7},
 {id:'circle',name:'BEAT CIRCLE',icon:'⭕',desc:'วงกลมหดเข้าหาจุดกด',color:'#ffd96b',lanes:0},
 {id:'dj',name:'DJ MIX',icon:'🎧',desc:'Scratch · Beat · Hold บนเครื่อง DJ',color:'#7dffb0',lanes:4}];
/* root = โน้ตหลัก (Hz) · sc = สเกล (semitone) · prog = คอร์ดต่อบาร์ (องศาสเกล, วนทุก 4 บาร์)
   drum: k/s/h = 16 สเต็ปต่อบาร์ · lead: ชนิดคลื่น + ความหนาแน่น 0..1 · bars = ความยาวเพลง */
const MINOR=[0,2,3,5,7,8,10],MAJOR=[0,2,4,5,7,9,11],PENT=[0,3,5,7,10];
const SONGS=[
 {id:'ar1',game:'arrow',name:'Neon Steps',artist:'NICE Crew',bpm:128,bars:48,root:55*Math.pow(2,2/12),sc:MINOR,prog:[0,5,3,4],wave:'sawtooth',dens:.55,lv:[2,4,6,8],
  drum:{k:'x...x...x...x...',s:'....x.......x...',h:'..x...x...x...x.'}},
 {id:'ar2',game:'arrow',name:'Sakura Rush',artist:'Mika & The Pixels',bpm:140,bars:52,root:55*Math.pow(2,5/12),sc:MAJOR,prog:[0,4,5,3],wave:'square',dens:.7,lv:[3,5,7,9],
  drum:{k:'x..x..x...x.x...',s:'....x.......x..x',h:'x.x.x.x.x.x.x.x.'}},
 {id:'ar3',game:'arrow',name:'Midnight Sprint',artist:'DJ NOVA',bpm:150,bars:56,root:55*Math.pow(2,0/12),sc:MINOR,prog:[0,0,5,6],wave:'sawtooth',dens:.85,lv:[4,6,8,10],
  drum:{k:'x..x..x.x..x..x.',s:'....x.......x...',h:'xxxxxxxxxxxxxxxx'}},
 {id:'pi1',game:'piano',name:'Moonlit Keys',artist:'Aria Lune',bpm:96,bars:36,root:55*Math.pow(2,7/12),sc:MAJOR,prog:[0,5,3,4],wave:'triangle',dens:.5,lv:[1,3,5,7],
  drum:{k:'x.......x.......',s:'........x.......',h:'..x...x...x...x.'}},
 {id:'pi2',game:'piano',name:'Rain Waltz',artist:'Aria Lune',bpm:112,bars:44,root:55*Math.pow(2,9/12),sc:MINOR,prog:[0,3,5,4],wave:'triangle',dens:.65,lv:[2,4,6,8],
  drum:{k:'x.....x...x.....',s:'....x.......x...',h:'x.x.x.x.x.x.x.x.'}},
 {id:'pi3',game:'piano',name:'Crystal Run',artist:'Sky Arcade',bpm:132,bars:52,root:55*Math.pow(2,4/12),sc:MAJOR,prog:[0,4,5,3],wave:'square',dens:.8,lv:[3,5,8,10],
  drum:{k:'x...x...x..xx...',s:'....x.......x...',h:'x.xxx.xxx.xxx.xx'}},
 {id:'ci1',game:'circle',name:'Pulse Garden',artist:'Bloom Unit',bpm:120,bars:44,root:55*Math.pow(2,3/12),sc:PENT,prog:[0,2,1,3],wave:'triangle',dens:.55,lv:[1,3,5,7],
  drum:{k:'x...x...x...x...',s:'....x.......x...',h:'..x...x...x...x.'}},
 {id:'ci2',game:'circle',name:'Orbit Pop',artist:'Bloom Unit',bpm:136,bars:50,root:55*Math.pow(2,8/12),sc:MAJOR,prog:[0,5,4,3],wave:'square',dens:.7,lv:[2,4,7,9],
  drum:{k:'x..x....x.x.....',s:'....x.......x..x',h:'x.x.x.x.x.x.x.x.'}},
 {id:'ci3',game:'circle',name:'Ring of Fire',artist:'Kuro & Ember',bpm:160,bars:60,root:55*Math.pow(2,10/12),sc:MINOR,prog:[0,6,5,4],wave:'sawtooth',dens:.9,lv:[4,6,9,10],
  drum:{k:'x.x.x.x.x.x.x.xx',s:'....x.......x...',h:'xxxxxxxxxxxxxxxx'}},
 {id:'dj1',game:'dj',name:'Club Overdrive',artist:'DJ NOVA',bpm:126,bars:48,root:55*Math.pow(2,1/12),sc:MINOR,prog:[0,0,5,4],wave:'sawtooth',dens:.6,lv:[2,4,6,8],
  drum:{k:'x...x...x...x...',s:'....x.......x...',h:'..x...x...x...x.'}},
 {id:'dj2',game:'dj',name:'Bass Cathedral',artist:'Kuro & Ember',bpm:140,bars:52,root:55*Math.pow(2,6/12),sc:MINOR,prog:[0,5,3,6],wave:'sawtooth',dens:.75,lv:[3,5,8,9],
  drum:{k:'x..x..x...x..x..',s:'....x.......x...',h:'x.x.x.x.x.x.x.xx'}},
 {id:'dj3',game:'dj',name:'Turntable Heist',artist:'DJ NOVA',bpm:150,bars:56,root:55*Math.pow(2,11/12),sc:PENT,prog:[0,1,3,2],wave:'square',dens:.9,lv:[4,6,9,10],
  drum:{k:'x..x.x..x..x.x..',s:'....x.......x..x',h:'xxxxxxxxxxxxxxxx'}}];
const BYID={};SONGS.forEach(s=>{BYID[s.id]=s;s.stepMs=60000/s.bpm/4;s.durMs=Math.round(s.bars*16*s.stepMs+LEAD_IN+2000)});

/* ---------- RNG (เหมือนกันทุกครั้ง) ---------- */
function hash(str){let h=2166136261>>>0;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)>>>0}return h}
function rng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
const hz=(s,deg,oct)=>{const n=s.sc.length,o=Math.floor(deg/n),d=((deg%n)+n)%n;return s.root*Math.pow(2,(s.sc[d]+12*(o+(oct||0)))/12)};

/* ---------- ลำดับเหตุการณ์ของเพลง (กำหนดได้) ---------- */
const evCache={};
function section(s,bar){ // intro 4 · verse · chorus ทุก 8 บาร์ · outro 4
 if(bar<4)return 0;if(bar>=s.bars-4)return 3;return(Math.floor((bar-4)/8)%2===1)?2:1}
function events(s){
 if(evCache[s.id])return evCache[s.id];
 const R=rng(hash(s.id)),out=[];let lastDeg=4;
 const tpl=[ // แม่แบบจังหวะทำนอง (สเต็ปที่ 0..15)
  [0,3,6,8,10,12],[0,2,4,6,8,10,12,14],[0,4,6,8,12,14],[0,3,4,8,11,12],[0,2,3,6,8,10,11,14],[0,6,8,10,12],[0,1,4,6,7,10,12,15]];
 for(let bar=0;bar<s.bars;bar++){
  const sec=section(s,bar),ch=s.prog[bar%4],base=bar*16;
  const drums=sec>0&&!(sec===3&&bar>=s.bars-2);
  for(let i=0;i<16;i++){
   if(drums){
    if(s.drum.k[i]==='x')out.push({st:base+i,k:'kick'});
    if(s.drum.s[i]==='x')out.push({st:base+i,k:'snare'});
    if(s.drum.h[i]==='x'&&(sec>=1))out.push({st:base+i,k:'hat'});
    if(i%2===0&&sec>=1)out.push({st:base+i,k:'bass',deg:ch,oct:-2});
   }}
  if(sec!==3||bar<s.bars-2){if(bar%2===0)out.push({st:base,k:'chord',deg:ch,len:32})}
  // ทำนองหลัก (verse/chorus/intro เบา)
  if(sec>=1||(sec===0&&bar>=2)){
   const t=tpl[Math.floor(R()*tpl.length)];
   const keep=sec===2?1:sec===1?s.dens:.4;
   t.forEach((p,j)=>{if(R()>keep&&p!==0)return;
    let step=Math.round((R()-.5)*3);if(R()<.28)step=0;
    lastDeg=Math.max(0,Math.min(s.sc.length*2,lastDeg+step+((p===0)?(ch-(lastDeg%s.sc.length)>3?-1:0):0)));
    out.push({st:base+p,k:'lead',deg:lastDeg+(sec===2?s.sc.length:0),oct:0,len:(t[j+1]!==undefined?t[j+1]-p:16-p)})})}
 }
 evCache[s.id]=out;return out}

/* ---------- Beatmap ---------- */
const mapCache={};
const MIN_GAP={EASY:4,NORMAL:2,HARD:1,EXPERT:1};     // สเต็ป (16th)
const GRID={EASY:4,NORMAL:2,HARD:1,EXPERT:1};
const KINDS={EASY:['kick','snare','lead'],NORMAL:['kick','snare','lead'],HARD:['kick','snare','lead'],EXPERT:['kick','snare','lead','hat']};
const KEEP={EASY:.55,NORMAL:.75,HARD:.9,EXPERT:1};
function beatmap(songId,gameId,diff){
 const key=songId+'|'+gameId+'|'+diff;if(mapCache[key])return mapCache[key];
 const s=BYID[songId];if(!s||DIFFS.indexOf(diff)<0)return null;
 const R=rng(hash(key)),evs=events(s),G=GRID[diff],gap=MIN_GAP[diff],kinds=KINDS[diff];
 const cand=[];const seen={};
 evs.forEach(e=>{if(kinds.indexOf(e.k)<0||e.st%G!==0)return;
  if(e.k==='hat'&&!(e.st%4===2&&R()<.5))return;                    // hat ใช้เฉพาะ EXPERT แบบเว้นจังหวะ
  if(seen[e.st]){if(e.k==='lead')seen[e.st].k='lead',seen[e.st].deg=e.deg;return}
  seen[e.st]={st:e.st,k:e.k,deg:e.deg===undefined?0:e.deg,len:e.len||2};cand.push(seen[e.st])});
 cand.sort((a,b)=>a.st-b.st);
 const notes=[];let last=-99,lane=0,prevDeg=0,sameRun=0,k=0;
 const L=(GAMES.find(g=>g.id===gameId)||{}).lanes||4;
 cand.forEach((c,i)=>{
  if(c.st-last<gap)return;
  if(c.st%4!==0&&R()>KEEP[diff])return;                                   // เว้นบางโน้ตที่ไม่ตรงจังหวะหลัก
  const nxt=cand.slice(i+1).find(x=>x.st>c.st);const room=nxt?nxt.st-c.st:8;
  const n={t:Math.round(LEAD_IN+c.st*s.stepMs),st:c.st,type:'tap',src:c.k};
  const up=c.deg>prevDeg,dn=c.deg<prevDeg;prevDeg=c.deg;
  if(gameId==='circle'){ // ตำแหน่งวงกลม (0..1) เคลื่อนต่อเนื่อง ไม่กระโดดไกลเกินไป
   k+=.9+R()*1.1;const x=.5+.38*Math.sin(k*.9+c.deg*.15),y=.5+.34*Math.sin(k*.6+1.2+c.st*.01);
   n.x=+x.toFixed(3);n.y=+y.toFixed(3);
   if((diff==='HARD'||diff==='EXPERT')&&room>=8&&c.k==='lead'&&R()<(diff==='EXPERT'?.35:.2)){n.type='hold';n.dur=Math.round((room-1)*s.stepMs)}
   else if((diff==='HARD'||diff==='EXPERT')&&c.st%8===0&&c.k!=='hat'&&R()<(diff==='EXPERT'?.3:.12)){n.px=+(1-n.x).toFixed(3);n.py=+(1-n.y).toFixed(3);n.pair=true}}
  else if(gameId==='dj'){
   n.lane=c.k==='kick'?1:c.k==='snare'?2:(k++%2?3:0);n.type=(c.k==='lead'&&room>=8&&diff!=='EASY')?'hold':(n.lane===0||n.lane===3)?'scratch':'tap'}
  else if(gameId==='piano'){
   const reg=Math.max(0,Math.min(L-1,Math.floor(((c.deg%14)/14)*L)));lane=c.k==='lead'?reg:(c.k==='kick'?3:c.k==='snare'?((k++%2)?1:5):lane);n.lane=lane}
  else{ // arrow: 0=← 1=↓ 2=↑ 3=→ (ตามทิศทำนอง)
   lane=up?2:dn?1:(R()<.5?0:3);if(lane===n.lane)lane=(lane+1)%4;n.lane=lane;
   if(sameRun>=2&&last>=0&&notes.length&&notes[notes.length-1].lane===lane){lane=(lane+2)%4;n.lane=lane;sameRun=0}
   sameRun=(notes.length&&notes[notes.length-1].lane===lane)?sameRun+1:0}
  // โน้ตยาว (Hold)
  if((gameId==='arrow'||gameId==='piano')&&(diff==='HARD'||diff==='EXPERT')&&room>=8&&c.k==='lead'&&R()<(diff==='EXPERT'?.4:.22)){
   n.type='hold';n.dur=Math.round((room-1)*s.stepMs)}
  if(n.type==='hold'&&gameId==='dj')n.dur=Math.round(Math.min(room-1,12)*s.stepMs);
  // โน้ตคู่ (กดพร้อมกัน) — HARD/EXPERT บนจังหวะแรงของบาร์
  if((gameId==='arrow'||gameId==='piano'||gameId==='dj')&&n.type==='tap'&&(diff==='HARD'||diff==='EXPERT')&&c.st%8===0&&c.k!=='hat'&&R()<(diff==='EXPERT'?.35:.12)){
   n.pair=((n.lane||0)+(gameId==='arrow'?(R()<.5?3:1):gameId==='piano'?3:2))%L}
  notes.push(n);last=c.st});
 const total=notes.reduce((a,n)=>a+1+(n.pair!==undefined?1:0),0);
 const m={songId,game:gameId,diff,bpm:s.bpm,leadIn:LEAD_IN,durMs:s.durMs,count:total,notes};
 mapCache[key]=m;return m}
const info=(songId,gameId,diff)=>{const m=beatmap(songId,gameId,diff);return m?{count:m.count,holds:m.notes.filter(n=>n.type==='hold').length,maxCombo:m.count}:null};

/* ---------- Synth: Preview / เสียงเพลง (AudioContext ตัวกลางของ NICECLUB) ---------- */
let PV={on:0,songId:null,nodes:[],out:null,timer:0,t0:0,until:0};
function stopPreview(){
 if(!PV.on)return;PV.on=0;clearTimeout(PV.timer);
 try{const c=PV.ctx,o=PV.out;if(o){o.gain.cancelScheduledValues(c.currentTime);o.gain.setTargetAtTime(0,c.currentTime,.06);setTimeout(()=>{try{o.disconnect()}catch(e){}},400)}}catch(e){}
 PV.nodes.forEach(n=>{try{n.stop()}catch(e){}});PV.nodes=[];PV.out=null;
 try{root.NICECLUB&&NICECLUB.duck&&NICECLUB.duck(false)}catch(e){}
 const e=PV.onEnd;PV.onEnd=null;try{e&&e()}catch(x){}}
function noiseBuf(c){const n=c.sampleRate,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);let q=0;for(let i=0;i<n;i++){q=q*.9+(Math.random()*2-1)*.2;d[i]=q}return b}
function voice(c,out,e,s,t,lv,P){
 P=P||PV;
 const sp=60/s.bpm/4,track=P.nodes;const add=n=>track.push(n);
 const env=(g,pk,a,d)=>{g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,pk*lv),t+a);g.gain.exponentialRampToValueAtTime(.0001,t+d)};
 if(e.k==='kick'){const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(44,t+.15);env(g,.85,.006,.24);o.connect(g);g.connect(out);o.start(t);o.stop(t+.26);add(o)}
 else if(e.k==='snare'){const b=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();b.buffer=P.nb||(P.nb=noiseBuf(c));f.type='bandpass';f.frequency.value=1900;f.Q.value=.7;env(g,.4,.004,.17);b.connect(f);f.connect(g);g.connect(out);b.start(t);b.stop(t+.2);add(b);
  const o=c.createOscillator(),g2=c.createGain();o.type='triangle';o.frequency.value=190;env(g2,.2,.003,.1);o.connect(g2);g2.connect(out);o.start(t);o.stop(t+.12);add(o)}
 else if(e.k==='hat'){const b=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();b.buffer=P.nb||(P.nb=noiseBuf(c));f.type='highpass';f.frequency.value=7000;env(g,.14,.003,.045);b.connect(f);f.connect(g);g.connect(out);b.start(t);b.stop(t+.06);add(b)}
 else if(e.k==='bass'){const o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();o.type='sawtooth';o.frequency.value=hz(s,e.deg,e.oct||-2);f.type='lowpass';f.frequency.value=320;env(g,.3,.012,sp*1.9);o.connect(f);f.connect(g);g.connect(out);o.start(t);o.stop(t+sp*2);add(o)}
 else if(e.k==='chord'){[0,2,4].forEach(d=>{const o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.value=hz(s,e.deg+d,0)/2;env(g,.07,.18,sp*e.len*.95);o.connect(g);g.connect(out);o.start(t);o.stop(t+sp*e.len);add(o)})}
 else if(e.k==='lead'){const o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();o.type=s.wave;o.frequency.value=hz(s,e.deg,1);f.type='lowpass';f.frequency.value=3200;
  const d=Math.max(.12,Math.min(sp*e.len*.9,.7));env(g,.17,.01,d);o.connect(f);f.connect(g);g.connect(out);o.start(t);o.stop(t+d+.05);add(o)}}
/* เล่น Preview: จากบาร์ fromBar ยาว secs วินาที (ค่าเริ่ม = ท่อนฮุคแรก) */
function preview(songId,opts){
 opts=opts||{};stopPreview();
 const s=BYID[songId];if(!s)return false;
 const c=root.NICECLUB&&NICECLUB.ac&&NICECLUB.ac();if(!c)return false;
 const fromBar=opts.fromBar!==undefined?opts.fromBar:Math.min(s.bars-8,12),secs=opts.secs||14;
 const vol=(()=>{try{const v=localStorage.getItem('mct_vol');return v==null?.8:Math.max(0,Math.min(1,(+v)/100))}catch(e){return .8}})();
 PV={on:1,songId,nodes:[],ctx:c,out:c.createGain(),timer:0,onEnd:opts.onEnd||null};
 PV.out.gain.value=0;PV.out.gain.setTargetAtTime(.9*vol,c.currentTime,.05);PV.out.connect(c.destination);
 try{root.NICECLUB&&NICECLUB.duck&&NICECLUB.duck(true)}catch(e){}
 const sp=60/s.bpm/4,t0=c.currentTime+.08,evs=events(s),a=fromBar*16,b=a+Math.ceil(secs/sp);
 let n=0;evs.forEach(e=>{if(e.st<a||e.st>=b)return;voice(c,PV.out,e,s,t0+(e.st-a)*sp,1);n++});
 PV.t0=t0;PV.until=t0+(b-a)*sp;
 PV.timer=setTimeout(()=>{if(PV.on&&PV.songId===songId)stopPreview()},(secs+.3)*1000);
 return {notes:n,secs}}
const previewing=()=>PV.on?PV.songId:null;

/* ---------- เล่นทั้งเพลง (ใช้โดย NC_PLAY) — เวลาเพลง = AudioContext clock ---------- */
function startSong(songId,opts){
 opts=opts||{};stopPreview();
 const s=BYID[songId];if(!s)return null;
 const c=root.NICECLUB&&NICECLUB.ac&&NICECLUB.ac(true);if(!c)return null;
 const muted=(()=>{try{return localStorage.getItem('mct_sound')==='0'}catch(e){return false}})();
 const vol=(()=>{try{const v=localStorage.getItem('mct_vol');return v==null?.8:Math.max(0,Math.min(1,(+v)/100))}catch(e){return .8}})();
 const P={nodes:[],nb:null},out=c.createGain();out.gain.value=muted?0:.9*vol*(opts.gain===undefined?1:opts.gain);out.connect(c.destination);
 const t0=c.currentTime+.25,sp=s.stepMs/1000,evs=events(s);let i=0,stopped=false,tm=0;
 const pump=()=>{if(stopped)return;const lim=c.currentTime+2.2;
  while(i<evs.length){const e=evs[i],tt=t0+LEAD_IN/1000+e.st*sp;if(tt>lim)break;if(tt>=c.currentTime-.05)voice(c,out,e,s,tt,1,P);i++}
  if(P.nodes.length>600)P.nodes.splice(0,P.nodes.length-300);
  if(i<evs.length)tm=setTimeout(pump,350)};
 pump();
 const H={t0,ctx:c,song:s,out,
  stop(){if(stopped)return;stopped=true;clearTimeout(tm);try{out.gain.setTargetAtTime(0,c.currentTime,.05)}catch(e){}P.nodes.forEach(n=>{try{n.stop()}catch(e){}});P.nodes=[];setTimeout(()=>{try{out.disconnect()}catch(e){}},300)},
  resumePump(){if(!stopped){clearTimeout(tm);pump()}}};
 return H}

/* ---------- ข้อมูลคะแนน / สถิติ (S.niceclub) ---------- */
const RANKS=['SSS','SS','S','A','B','C','D'];
function store(){
 const n=root.NICECLUB&&NICECLUB.state&&NICECLUB.state();if(!n)return null;
 if(!n.scores||typeof n.scores!=='object')n.scores={};
 if(!n.stats||typeof n.stats!=='object')n.stats={};
 if(!n.ledger||typeof n.ledger!=='object')n.ledger={date:'',total:0,plays:{},cleared:{}};
 if(!Array.isArray(n.history))n.history=[];
 if(typeof n.offsetMs!=='number'||!isFinite(n.offsetMs))n.offsetMs=0;
 if(typeof n.earned!=='number'||!isFinite(n.earned))n.earned=0;
 const t=n.stats;['plays','playMs','notes','perfect','great','good','miss'].forEach(k=>{if(typeof t[k]!=='number'||!isFinite(t[k]))t[k]=0});
 if(!t.byGame||typeof t.byGame!=='object')t.byGame={};
 return n}
const clampN=(v,lo,hi)=>Math.max(lo,Math.min(hi,Math.round(+v||0)));
function best(songId,diff){const n=store();const o=n&&n.scores[songId]&&n.scores[songId][diff];return o||null}
/* r = {score,acc,maxCombo,perfect,great,good,miss,rank,ms} — STEP 7 เรียกใช้เมื่อจบเพลง */
function recordResult(songId,diff,r){
 const s=BYID[songId],n=store();if(!s||!n||DIFFS.indexOf(diff)<0||!r)return null;
 const x={score:clampN(r.score,0,1e8),acc:Math.max(0,Math.min(100,+(+r.acc||0).toFixed(2))),maxCombo:clampN(r.maxCombo,0,1e5),
  perfect:clampN(r.perfect,0,1e5),great:clampN(r.great,0,1e5),good:clampN(r.good,0,1e5),miss:clampN(r.miss,0,1e5),
  rank:RANKS.indexOf(r.rank)>=0?r.rank:'D'};
 const o=n.scores[songId]=n.scores[songId]||{};const cur=o[diff];
 const isBest=!cur||x.score>cur.score;
 o[diff]=isBest?Object.assign({},x,{plays:(cur?cur.plays:0)+1,at:Date.now()}):Object.assign({},cur,{plays:cur.plays+1});
 n.history.push({id:songId,game:s.game,diff,score:x.score,acc:x.acc,combo:x.maxCombo,rank:x.rank,at:Date.now()});if(n.history.length>80)n.history.splice(0,n.history.length-80);
 const t=n.stats;t.plays++;t.playMs+=clampN(r.ms,0,36e5);t.notes+=x.perfect+x.great+x.good+x.miss;
 t.perfect+=x.perfect;t.great+=x.great;t.good+=x.good;t.miss+=x.miss;
 t.byGame[s.game]=(t.byGame[s.game]||0)+1;
 try{save(1)}catch(e){}
 return {best:isBest,entry:o[diff]}}
function summary(){
 const n=store();if(!n)return null;const t=n.stats;
 let cleared=0;Object.keys(n.scores).forEach(id=>Object.keys(n.scores[id]).forEach(()=>cleared++));
 const hit=t.perfect+t.great+t.good;
 return{plays:t.plays,playMs:t.playMs,notes:t.notes,perfect:t.perfect,great:t.great,good:t.good,miss:t.miss,cleared,total:SONGS.length*DIFFS.length,
  acc:t.notes?+((t.perfect+t.great*.7+t.good*.4)/t.notes*100).toFixed(1):0,hitRate:t.notes?+(hit/t.notes*100).toFixed(1):0,byGame:t.byGame,visits:n.visits||0}}

root.NC_SONGS={LEAD_IN,DIFFS,GAMES,SONGS,BYID,events,beatmap,info,preview,stopPreview,previewing,startSong,best,recordResult,summary,RANKS,
 forGame:g=>SONGS.filter(s=>s.game===g),version:'step5'};
})(typeof window!=='undefined'?window:globalThis);

