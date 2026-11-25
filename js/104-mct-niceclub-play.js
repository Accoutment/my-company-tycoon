
/* ============================================================================
 * NICECLUB — RHYTHM GAMES (ARROW DANCE · PIANO RHYTHM · BEAT CIRCLE · DJ MIX)   [STEP 5 + หน้าผลการเล่น STEP 7]
 * หน้าจอเล่นเต็มจอ (overlay + canvas 960×540 ปรับสเกลอัตโนมัติ) · ใช้ NC_ENGINE ตัวเดียวทุกเกม
 * เวลา = AudioContext clock (getOutputTimestamp) · อินพุตแปลง event.timeStamp → เวลาเพลง
 * PC: ลูกศร / A S D F J K L / เมาส์+Z X C / A S K L + ←→  ·  มือถือ: แตะบนหน้าจอ (หลายนิ้วได้)
 * ========================================================================== */
(function(root){
'use strict';
if(root.NC_PLAY||!root.NC_SONGS||!root.NC_ENGINE||!root.NICECLUB)return;
const NS=root.NC_SONGS,EN=root.NC_ENGINE,NC=root.NICECLUB;
const W=960,H=540,FALL={EASY:1700,NORMAL:1500,HARD:1300,EXPERT:1100},APPR={EASY:1100,NORMAL:950,HARD:800,EXPERT:700};
const COL={arrow:['#ff4fd8','#4aa8ff','#7dffb0','#ffd96b'],piano:['#4aa8ff','#6bc4ff','#8fd8ff','#c2a8ff','#8fd8ff','#6bc4ff','#4aa8ff'],dj:['#ff4fd8','#4aa8ff','#4aa8ff','#ff4fd8']};
const GCOL={perfect:'#7df9ff',great:'#7dffb0',good:'#ffd96b',miss:'#ff5a7a'};
const GTXT={perfect:'PERFECT',great:'GREAT',good:'GOOD',miss:'MISS'};
const KEYS={arrow:{ArrowLeft:0,ArrowDown:1,ArrowUp:2,ArrowRight:3},
 piano:{a:0,s:1,d:2,f:3,j:4,k:5,l:6},
 dj:{a:0,s:1,k:2,l:3,ArrowLeft:0,ArrowRight:3},
 circle:{z:'k',x:'k',c:'k',' ':'k'}};
const PIANO_LBL=['A','S','D','F','J','K','L'];
let G=null;                         // เซสชันที่กำลังเล่น

const rr=(g,x,y,w,h,r)=>{g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function css(){
 if(document.getElementById('ncPlayCss'))return;
 const st=document.createElement('style');st.id='ncPlayCss';
 st.textContent='#ncPlay{position:fixed;inset:0;z-index:99996;background:#06030d;display:flex;align-items:center;justify-content:center;touch-action:none;user-select:none;-webkit-user-select:none;font-family:inherit}'+
 '#ncPlay canvas{display:block;touch-action:none;background:#0b0618}'+
 '#ncPlay .ncPz,#ncPlay .ncRs{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(6,2,16,.86);color:#fff;padding:max(8px,env(safe-area-inset-top)) 8px}'+
 '#ncPlay .ncBox{width:min(520px,100%);max-height:100%;overflow:auto;border:2px solid #ff4fd8;border-radius:14px;background:linear-gradient(160deg,#1a0a34,#0b0418);box-shadow:0 0 28px rgba(255,79,216,.45);padding:14px;text-align:center}'+
 '#ncPlay .ncBox h2{margin:0 0 6px;color:#ff9cf0;text-shadow:0 0 10px #ff4fd8;font-size:20px}'+
 '#ncPlay .ncBox button{min-height:44px;min-width:130px;margin:4px;border:2px solid #ff4fd8;background:#2a0f52;color:#fff;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer}'+
 '#ncPlay .ncRk{font-size:64px;font-weight:900;line-height:1;text-shadow:0 0 18px currentColor}'+
 '#ncPlay .ncGr{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:8px 0;font-size:12px}#ncPlay .ncGr div{background:rgba(40,16,80,.6);border-radius:8px;padding:6px 4px}#ncPlay .ncGr b{display:block;font-size:16px}'+
 '#ncPlay .ncRw{font-size:13px;line-height:1.5;color:#ffe9a8;margin:6px 0}'+
 '@media (max-height:430px){#ncPlay .ncBox{padding:8px}#ncPlay .ncRk{font-size:40px}#ncPlay .ncBox h2{font-size:16px}#ncPlay .ncBox button{min-height:40px}#ncPlay .ncGr b{font-size:14px}}';
 document.head.appendChild(st);
}
const store=()=>NC.state&&NC.state();
function loadOffset(){const n=NS&&store&&store();if(n&&typeof n.offsetMs==='number')EN.setCfg({offsetMs:n.offsetMs})}

/* ---------- เริ่มเล่น ---------- */
function play(gameId,songId,diff,opts){
 opts=opts||{};
 if(G)end(true);
 const song=NS.BYID[songId],gm=NS.GAMES.find(g=>g.id===gameId),map=NS.beatmap(songId,gameId,diff);
 if(!song||!gm||!map)return null;
 css();NC.lock(true);try{NC.amb(0)}catch(e){}
 if(!opts.dev)loadOffset();
 const ov=document.createElement('div');ov.id='ncPlay';
 const cv=document.createElement('canvas');ov.appendChild(cv);document.body.appendChild(ov);
 const g=cv.getContext('2d');
 const S={game:gameId,songId,diff,song,gm,map,ov,cv,g,opts,fx:[],pop:null,paused:false,done:false,raf:0,keys:{},ptr:{},lastLane:[],flash:[0,0,0,0,0,0,0],
  lv:song.lv[NS.DIFFS.indexOf(diff)],started:performance.now(),relock:0,endAt:opts.endAtMs||0};
 G=S;
 S.run=EN.newRun(map,{onJudge:(tg,gr,d,ph)=>judgeFx(S,tg,gr,d,ph)});
 S.sh=NS.startSong(songId,{});
 if(!S.sh){end(true);return null}
 try{S.sh.ctx.resume()}catch(e){}
 S.fit=()=>{const dpr=Math.min(2,root.devicePixelRatio||1),vw=innerWidth,vh=innerHeight,sc=Math.min(vw/W,vh/H);
  cv.style.width=W*sc+'px';cv.style.height=H*sc+'px';cv.width=Math.round(W*sc*dpr);cv.height=Math.round(H*sc*dpr);S.sc=sc;S.dpr=dpr};
 S.fit();addEventListener('resize',S.fit);
 S.songMs=pt=>{const c=S.sh.ctx;let ct=0,ptm=0;
  if(c.getOutputTimestamp){const o=c.getOutputTimestamp();ct=o.contextTime||0;ptm=o.performanceTime||0}
  if(!ct||!ptm){ct=c.currentTime;ptm=performance.now()}
  return(ct+((pt===undefined?performance.now():pt)-ptm)/1000-S.sh.t0)*1000};
 S.kd=e=>onKey(S,e,true);S.ku=e=>onKey(S,e,false);
 document.addEventListener('keydown',S.kd,true);document.addEventListener('keyup',S.ku,true);
 const pd=e=>onPtr(S,e,1),pu=e=>onPtr(S,e,0);
 cv.addEventListener('pointerdown',pd);cv.addEventListener('pointerup',pu);cv.addEventListener('pointercancel',pu);cv.addEventListener('pointerleave',e=>{if(e.buttons===0)pu(e)});
 cv.addEventListener('contextmenu',e=>e.preventDefault());
 S.cleanup=()=>{removeEventListener('resize',S.fit);document.removeEventListener('keydown',S.kd,true);document.removeEventListener('keyup',S.ku,true);cancelAnimationFrame(S.raf);clearInterval(S.relock)};
 S.relock=setInterval(()=>{try{const c=NC.state&&root.__CEO_CTX;if(c&&c.st&&!c.st.talk&&!S.done)NC.lock(true)}catch(e){}},150);
 S.raf=requestAnimationFrame(function loop(){if(G!==S)return;frame(S);S.raf=requestAnimationFrame(loop)});
 return S}

/* ---------- อินพุต ---------- */
function laneFromX(S,x,y){ // x,y พิกัดตรรกะ 960×540
 if(S.game==='arrow'){const i=Math.floor((x-(480-208))/104);return(i>=0&&i<4)?i:-1}
 if(S.game==='piano'){const i=Math.floor((x-158)/92);return(i>=0&&i<7)?i:-1}
 if(S.game==='dj'){const xs=DJX;let b=-1,bd=1e9;xs.forEach((cx,i)=>{const d=Math.abs(x-cx);if(d<bd){bd=d;b=i}});return bd<=86?b:-1}
 return -1}
const DJX=[260,400,560,700];
function press(S,lane,pt){
 if(S.paused||S.done)return;const t=S.songMs(pt),r=S.run.press(lane,t);S.flash[lane]=1;if(r)hitFx(S,lane,r)}
function releaseL(S,lane,pt){if(S.paused||S.done)return;const r=S.run.release(lane,S.songMs(pt));S.flash[lane]=0;if(r&&r.broken)missFx(S,r.tg)}
function onKey(S,e,down){
 if(S.done&&!(down&&(e.key==='Escape')))return;
 const k=e.key.length===1?e.key.toLowerCase():e.key;
 if(k==='Escape'){if(down&&!e.repeat){e.preventDefault();e.stopImmediatePropagation();S.paused?resume(S):pause(S)}else{e.preventDefault();e.stopImmediatePropagation()}return}
 const map=KEYS[S.game];if(!map||!(k in map))return;
 e.preventDefault();e.stopImmediatePropagation();
 if(e.repeat)return;
 if(S.game==='circle'){
  const id='k'+k;
  if(down){if(S.paused)return;S.keys[k]=1;const r=S.run.pressAt(null,null,S.songMs(e.timeStamp),0,id);if(r)hitFx(S,-1,r)}
  else{if(S.keys[k]){delete S.keys[k];const r=S.run.release('P'+id,S.songMs(e.timeStamp));if(r&&r.broken)missFx(S,r.tg)}}
  return}
 const lane=map[k];
 if(down){if(S.keys[k])return;S.keys[k]=1;press(S,lane,e.timeStamp)}
 else{if(S.keys[k]){delete S.keys[k];releaseL(S,lane,e.timeStamp)}}}
const FX0=80,FY0=96,FW=800,FH=340;           // สนามวงกลม (พิกัดตรรกะ)
const cx=n=>FX0+n.x*FW,cy=n=>FY0+n.y*FH;
function onPtr(S,e,down){
 if(S.done)return;
 const b=S.cv.getBoundingClientRect(),x=(e.clientX-b.left)/b.width*W,y=(e.clientY-b.top)/b.height*H;
 if(down&&x>W-70&&y<56){e.preventDefault();S.paused?resume(S):pause(S);return}      // ปุ่มหยุด
 if(S.paused)return;
 e.preventDefault();
 if(S.game==='circle'){
  const id='p'+e.pointerId;
  if(down){try{S.cv.setPointerCapture(e.pointerId)}catch(x){}
   const r=S.run.pressAt(x,y,S.songMs(e.timeStamp),q=>Math.hypot(FX0+q.x*FW-x,FY0+q.y*FH-y)<=64,id);
   if(r){hitFx(S,-1,r);S.ptr[e.pointerId]=1}else S.ptr[e.pointerId]=1}
  else if(S.ptr[e.pointerId]){delete S.ptr[e.pointerId];const r=S.run.release('P'+id,S.songMs(e.timeStamp));if(r&&r.broken)missFx(S,r.tg)}
  return}
 if(down){const lane=laneFromX(S,x,y);if(lane<0)return;try{S.cv.setPointerCapture(e.pointerId)}catch(x){}
  S.ptr[e.pointerId]=lane;
  const n=Object.keys(S.ptr).filter(k=>S.ptr[k]===lane).length;if(n===1||true)press(S,lane,e.timeStamp)}
 else{const lane=S.ptr[e.pointerId];if(lane===undefined)return;delete S.ptr[e.pointerId];
  if(!Object.keys(S.ptr).some(k=>S.ptr[k]===lane))releaseL(S,lane,e.timeStamp)}}

/* ---------- เอฟเฟกต์ตัดสิน ---------- */
function pos(S,tg){
 if(S.game==='circle')return{x:FX0+tg.x*FW,y:FY0+tg.y*FH};
 if(S.game==='arrow')return{x:480+(tg.lane-1.5)*104,y:400};
 if(S.game==='piano')return{x:158+46+tg.lane*92,y:395};
 return{x:DJX[tg.lane],y:410}}
function judgeFx(S,tg,gr,d,ph){
 if(S.game==='dj'||true){const p=pos(S,tg);
  S.pop={g:gr,t:performance.now(),x:p.x,y:p.y-60,d};
  if(gr!=='miss'&&ph!=='head'||ph==='head'){for(let i=0;i<(gr==='perfect'?14:8);i++){const a=Math.random()*6.283,v=60+Math.random()*160;S.fx.push({x:p.x,y:p.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-40,l:.5,m:.5,c:GCOL[gr]||'#fff'})}}}
 if(gr==='miss'||(!ph&&gr)){S.comboPop=performance.now()}}
function hitFx(S,lane,r){}
function missFx(S,tg){}

/* ---------- Pause / Resume / End ---------- */
function pause(S){
 if(S.paused||S.done)return;S.paused=true;
 try{S.sh.ctx.suspend()}catch(e){}
 const d=document.createElement('div');d.className='ncPz';
 d.innerHTML='<div class="ncBox"><h2>⏸ พักเกม</h2><div style="font-size:13px;color:#cdbdf5;margin-bottom:8px">'+S.song.name+' · '+S.diff+'</div><button data-a="r">▶ เล่นต่อ</button><button data-a="t">↻ เริ่มเพลงใหม่</button><button data-a="q">🚪 ออก (ไม่นับผล)</button></div>';
 d.addEventListener('pointerdown',e=>e.stopPropagation());
 d.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.a;if(a==='r')resume(S);else if(a==='t'){const o=S.opts;end(true);play(S.game,S.songId,S.diff,o)}else if(a==='q')end(true,true)});
 S.ov.appendChild(d);S.pz=d}
function resume(S){
 if(!S.paused||S.done)return;S.paused=false;
 if(S.pz){S.pz.remove();S.pz=null}
 try{S.sh.ctx.resume()}catch(e){}
 // ปุ่มที่ค้างระหว่างพัก → ถือว่าปล่อย
 S.keys={};S.ptr={};}
function end(silent,toMenu){
 const S=G;if(!S)return;G=null;
 S.done=true;S.cleanup();try{S.sh&&S.sh.stop()}catch(e){}
 try{S.sh&&S.sh.ctx.state==='suspended'&&S.sh.ctx.resume()}catch(e){}
 try{S.ov.remove()}catch(e){}
 NC.lock(false);
 try{const c=root.__CEO_CTX;if(c&&c.st&&c.st.active&&c.st.place==='ncin')NC.amb(2)}catch(e){}
 if(toMenu&&NC.openSelect&&!S.opts.dev)setTimeout(()=>NC.openSelect(S.game),0);
 if(S.opts.onEnd)try{S.opts.onEnd(S)}catch(e){}}

/* ---------- วนเฟรม ---------- */
function frame(S){
 if(S.paused||S.done){return}
 const now=S.songMs(),R=S.run;
 R.tick(now);
 const fin=now>=(S.endAt||S.song.durMs-800);
 draw(S,now);
 if(fin&&!S.done)finish(S)}
function finish(S){
 S.done=true;R_finish(S);
}
function R_finish(S){
 const R=S.run;R.finish();const res=R.result();
 try{S.sh.stop()}catch(e){}
 S.cleanup();
 const info=S.opts.dev?null:commit(S,res);
 showResults(S,res,info)}
const FMT=n=>(+n).toLocaleString();
function commit(S,res){
 const n=store();if(!n)return null;
 const prev=NS.best(S.songId,S.diff);
 const rw=EN.reward(S.songId,S.diff,res,n.ledger,S.lv,true);
 const rec=NS.recordResult(S.songId,S.diff,Object.assign({},res,{ms:Math.max(0,performance.now()-S.started)}));
 if(rw.money>0){
  try{if(typeof earn==='function')earn(rw.money);else{const G_=S_();G_.money=Math.round((G_.money||0)+rw.money)}}catch(e){}
  n.earned+=rw.money}
 try{save(1)}catch(e){}
 return{rw,rec,prev,newBest:rec&&rec.best,first:!prev}}
const S_=()=>{try{return S}catch(e){return {}}};
function showResults(S,res,info){
 const rc={SSS:'#ff9cf0',SS:'#ffd96b',S:'#ffd96b',A:'#7dffb0',B:'#6db8ff',C:'#c2a8ff',D:'#ff8a8a'}[res.rank];
 const d=document.createElement('div');d.className='ncRs';
 const rw=info&&info.rw;
 let rwHtml='';
 if(S.opts.dev)rwHtml='<div class="ncRw">🛠 โหมดทดสอบ — ไม่บันทึกคะแนนและไม่มีเงินรางวัล</div>';
 else if(rw)rwHtml='<div class="ncRw">💰 เงินรางวัล <b>$'+FMT(rw.money)+'</b>'+(rw.first&&rw.money>0?' (โบนัสเคลียร์ครั้งแรก)':'')+(rw.reason?'<br><span style="font-size:11px;color:#ffcf8a">'+rw.reason+'</span>':'')+'</div>'+(info.newBest?'<div style="color:#7df9ff;font-weight:700">🏆 สถิติใหม่ของเพลงนี้!</div>':'');
 d.innerHTML='<div class="ncBox"><h2>'+S.gm.icon+' '+S.song.name+' · '+S.diff+'</h2><div class="ncRk" style="color:'+rc+'">'+res.rank+'</div>'+
  '<div style="font-size:22px;font-weight:800;margin:4px 0">'+FMT(res.score)+' <small style="font-size:12px;color:#bba8ee">/ '+FMT(res.max)+'</small></div>'+
  '<div style="font-size:13px;color:#cdbdf5">Accuracy '+res.acc+'% · Max Combo '+res.maxCombo+'</div>'+
  '<div class="ncGr"><div style="color:'+GCOL.perfect+'">PERFECT<b>'+res.perfect+'</b></div><div style="color:'+GCOL.great+'">GREAT<b>'+res.great+'</b></div><div style="color:'+GCOL.good+'">GOOD<b>'+res.good+'</b></div><div style="color:'+GCOL.miss+'">MISS<b>'+res.miss+'</b></div></div>'+rwHtml+
  '<div><button data-a="r">↻ เล่นอีกครั้ง</button><button data-a="m">🎵 กลับเลือกเพลง</button></div></div>';
 d.addEventListener('pointerdown',e=>e.stopPropagation());
 d.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const o=S.opts;
  if(b.dataset.a==='r'){end(true);play(S.game,S.songId,S.diff,Object.assign({},o,{endAtMs:o.endAtMs}))}
  else end(true,true)});
 S.ov.appendChild(d);S.rs=d;S.res=res;S.info=info;
 // Esc/Enter บนหน้าผลลัพธ์ = กลับเลือกเพลง
 S.kd2=e=>{if(e.key==='Escape'||e.key==='Enter'){e.preventDefault();e.stopImmediatePropagation();document.removeEventListener('keydown',S.kd2,true);end(true,true)}};
 document.addEventListener('keydown',S.kd2,true);
 const old=S.cleanup;S.cleanup=()=>{old();document.removeEventListener('keydown',S.kd2,true)};
 // ให้ end() เรียกได้ปกติหลังจบ
 G=S;S.done=true}

/* ---------- วาด ---------- */
function bg(S,g,now,col){
 const ph=((now/ (60000/S.song.bpm))%1+1)%1,p=1-ph;
 const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#10062a');gr.addColorStop(1,'#050210');g.fillStyle=gr;g.fillRect(0,0,W,H);
 g.save();g.globalCompositeOperation='lighter';
 for(let i=0;i<6;i++){const x=60+i*168,a=.05+.10*p*(i%2?1:.6);const rg=g.createRadialGradient(x,0,4,x,0,260);rg.addColorStop(0,col+Math.round(a*255).toString(16).padStart(2,'0'));rg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=rg;g.fillRect(x-260,0,520,300)}
 g.restore();
 g.strokeStyle=col;g.globalAlpha=.25+.45*p;g.lineWidth=3;g.strokeRect(6,6,W-12,H-12);g.globalAlpha=1}
function hud(S,g,now){
 const R=S.run;
 g.fillStyle='rgba(8,2,20,.75)';g.fillRect(0,0,W,44);
 g.fillStyle=S.gm.color;g.fillRect(0,44,clamp(now/S.song.durMs,0,1)*W,3);
 g.font='bold 15px sans-serif';g.textAlign='left';g.fillStyle='#fff';g.fillText(S.gm.icon+' '+S.song.name+' · '+S.diff+' · '+S.song.bpm+' BPM',14,28);
 g.textAlign='center';g.font='bold 22px sans-serif';g.fillStyle='#fff';g.fillText(String(R.score).padStart(7,'0'),W/2,30);
 g.textAlign='right';g.font='bold 15px sans-serif';g.fillStyle='#bba8ee';g.fillText('ACC '+R.accuracy().toFixed(1)+'%',W-84,28);
 // ปุ่มหยุด
 rr(g,W-66,6,56,32,8);g.fillStyle='rgba(255,255,255,.14)';g.fill();g.fillStyle='#fff';g.fillRect(W-46,14,6,16);g.fillRect(W-34,14,6,16);
 if(S.opts.dev){g.fillStyle='#ffd96b';g.font='bold 11px sans-serif';g.textAlign='left';g.fillText('🛠 TEST MODE — ไม่บันทึกผล',14,62)}
 // คอมโบ
 if(R.combo>=2){const k=1+.18*Math.max(0,1-(performance.now()-(S.comboPop||0))/160);g.save();g.translate(W/2,S.game==='circle'?H-56:200);g.scale(k,k);g.textAlign='center';g.font='900 46px sans-serif';g.fillStyle='rgba(255,255,255,.92)';g.shadowColor=S.gm.color;g.shadowBlur=14;g.fillText(R.combo,0,0);g.shadowBlur=0;g.font='bold 13px sans-serif';g.fillStyle=S.gm.color;g.fillText('COMBO',0,20);g.restore()}
 // ป้ายตัดสิน
 const p=S.pop;if(p){const a=1-(performance.now()-p.t)/650;if(a>0){g.save();g.globalAlpha=a;g.textAlign='center';g.font='900 '+(22+(p.g==='perfect'?4:0))+'px sans-serif';g.fillStyle=GCOL[p.g];g.shadowColor=GCOL[p.g];g.shadowBlur=10;
  g.fillText(GTXT[p.g],clamp(p.x,100,W-100),p.y-(1-a)*18);if(p.g!=='miss'&&p.g!=='perfect'){g.font='bold 11px sans-serif';g.shadowBlur=0;g.fillStyle='#fff';g.fillText((p.d>0?'LATE ':'EARLY ')+Math.abs(Math.round(p.d))+'ms',clamp(p.x,100,W-100),p.y+14-(1-a)*18)}g.restore()}}
 // READY
 if(now<2000){g.save();g.textAlign='center';g.fillStyle='#fff';g.globalAlpha=clamp((2000-now)/600,0,1);g.font='900 40px sans-serif';g.fillText(now<-0?'READY':(now<1000?'READY':'GO!'),W/2,H/2-30);g.restore()}
 // ปุ่มเสียง/สถานะ
 // อนุภาค
 for(const f of S.fx){const a=f.l/f.m;g.globalAlpha=a;g.fillStyle=f.c;g.fillRect(f.x-2,f.y-2,4,4)}g.globalAlpha=1}
function stepFx(S,dt){S.fx.forEach(f=>{f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=260*dt;f.l-=dt});S.fx=S.fx.filter(f=>f.l>0)}
function ya(S,t,now,hit,top){return hit-(t-now)/FALL[S.diff]*(hit-top)}
function draw(S,now){
 const g=S.g;g.setTransform(S.cv.width/W,0,0,S.cv.height/H,0,0);
 const dt=Math.min(.05,Math.max(0,(performance.now()-(S.lt||performance.now()))/1000));S.lt=performance.now();stepFx(S,dt);
 for(let i=0;i<S.flash.length;i++)S.flash[i]=Math.max(0,S.flash[i]-dt*5);
 ({arrow:dArrow,piano:dPiano,circle:dCircle,dj:dDj}[S.game])(S,g,now);
 hud(S,g,now)}
const T=(S)=>S.run.targets;
/* --- ARROW DANCE --- */
function arrowPath(g,s){g.beginPath();g.moveTo(s,0);g.lineTo(-s*.15,-s*.95);g.lineTo(-s*.15,-s*.45);g.lineTo(-s*.9,-s*.45);g.lineTo(-s*.9,s*.45);g.lineTo(-s*.15,s*.45);g.lineTo(-s*.15,s*.95);g.closePath()}
const AROT=[Math.PI,Math.PI/2,-Math.PI/2,0];
function drawArrow(g,x,y,lane,s,a,fill){g.save();g.translate(x,y);g.rotate(AROT[lane]);g.globalAlpha=a;arrowPath(g,s);if(fill){g.fillStyle=fill;g.fill()}g.lineWidth=3;g.strokeStyle=fill?'#fff':COL.arrow[lane];g.stroke();g.restore()}
function dArrow(S,g,now){
 bg(S,g,now,'#ff4fd8');
 const hitY=400,top=60,xs=[0,1,2,3].map(i=>480+(i-1.5)*104);
 g.fillStyle='rgba(255,255,255,.05)';g.fillRect(xs[0]-52,top,416,hitY-top+100);
 xs.forEach((x,i)=>{g.strokeStyle='rgba(255,255,255,.15)';g.lineWidth=1;g.beginPath();g.moveTo(x-52,top);g.lineTo(x-52,H);g.stroke()});
 g.beginPath();g.moveTo(xs[0]-52,top);g.lineTo(xs[3]+52,top);g.stroke();
 g.strokeStyle='#fff';g.globalAlpha=.7;g.lineWidth=3;g.beginPath();g.moveTo(xs[0]-52,hitY);g.lineTo(xs[3]+52,hitY);g.stroke();g.globalAlpha=1;       // Timing Line
 xs.forEach((x,i)=>{const f=S.flash[i];if(f>0){g.fillStyle=COL.arrow[i];g.globalAlpha=f*.35;g.fillRect(x-52,top,104,hitY-top);g.globalAlpha=1}
  drawArrow(g,x,hitY,i,34,.9,f>0?COL.arrow[i]:null)});
 // ปุ่มสัมผัสด้านล่าง
 xs.forEach((x,i)=>{rr(g,x-48,442,96,86,12);g.fillStyle=S.flash[i]>0?COL.arrow[i]:'rgba(255,255,255,.10)';g.globalAlpha=S.flash[i]>0?.8:1;g.fill();g.globalAlpha=1;g.strokeStyle=COL.arrow[i];g.lineWidth=2;g.stroke();drawArrow(g,x,485,i,24,1,COL.arrow[i])});
 const tg=T(S);
 for(let i=tg.length-1;i>=0;i--){const n=tg[i];if(n.state==='done'&&n.grade!=='miss'||n.t-now>FALL[S.diff]+80)continue;
  const miss=n.state==='done';if(miss&&now-n.t>600)continue;
  const x=xs[n.lane],y=ya(S,n.t,now,hitY,top);if(y>H+40)continue;
  if(n.type==='hold'){const y2=ya(S,n.t+n.dur,now,hitY,top);const yy=n.state==='holding'?hitY:y;
   g.fillStyle=COL.arrow[n.lane];g.globalAlpha=miss?.2:.45;rr(g,x-20,Math.min(y2,yy),40,Math.abs(yy-y2),10);g.fill();g.globalAlpha=1}
  const yy=(n.type==='hold'&&n.state==='holding')?hitY:y;
  drawArrow(g,x,yy,n.lane,30,miss?.3:1,COL.arrow[n.lane])}}
/* --- PIANO RHYTHM --- */
function dPiano(S,g,now){
 bg(S,g,now,'#4aa8ff');
 const hitY=395,top=60,x0=158,w=92;
 g.fillStyle='rgba(255,255,255,.04)';g.fillRect(x0,top,w*7,hitY-top);
 for(let i=0;i<=7;i++){g.strokeStyle='rgba(255,255,255,.14)';g.beginPath();g.moveTo(x0+i*w,top);g.lineTo(x0+i*w,H);g.stroke()}
 g.strokeStyle='#fff';g.globalAlpha=.75;g.lineWidth=3;g.beginPath();g.moveTo(x0,hitY);g.lineTo(x0+w*7,hitY);g.stroke();g.globalAlpha=1;
 for(let i=0;i<7;i++){const x=x0+i*w,f=S.flash[i];
  rr(g,x+3,422,w-6,106,8);g.fillStyle=f>0?COL.piano[i]:'#e9eefc';g.fill();g.strokeStyle='#8aa0d8';g.lineWidth=2;g.stroke();
  g.fillStyle=f>0?'#06122a':'#33406a';g.font='bold 22px sans-serif';g.textAlign='center';g.fillText(PIANO_LBL[i],x+w/2,500);
  if(f>0){g.fillStyle=COL.piano[i];g.globalAlpha=f*.30;g.fillRect(x,top,w,hitY-top);g.globalAlpha=1}}
 const tg=T(S);
 for(let i=tg.length-1;i>=0;i--){const n=tg[i];if(n.state==='done'&&n.grade!=='miss'||n.t-now>FALL[S.diff]+80)continue;
  const miss=n.state==='done';if(miss&&now-n.t>600)continue;
  const x=x0+n.lane*w+4,y=ya(S,n.t,now,hitY,top);
  if(n.type==='hold'){const y2=ya(S,n.t+n.dur,now,hitY,top),yy=n.state==='holding'?hitY:y;
   g.fillStyle=COL.piano[n.lane];g.globalAlpha=miss?.2:.5;rr(g,x+10,Math.min(y2,yy),w-28,Math.abs(yy-y2),8);g.fill();g.globalAlpha=1}
  const yy=(n.type==='hold'&&n.state==='holding')?hitY:y;
  rr(g,x,yy-13,w-8,26,7);g.fillStyle=COL.piano[n.lane];g.globalAlpha=miss?.3:1;g.fill();g.strokeStyle='#fff';g.lineWidth=2;g.stroke();g.globalAlpha=1}}
/* --- BEAT CIRCLE --- */
function dCircle(S,g,now){
 bg(S,g,now,'#ffd96b');
 g.strokeStyle='rgba(255,255,255,.06)';g.lineWidth=1;g.strokeRect(FX0-30,FY0-30,FW+60,FH+60);
 const A=APPR[S.diff],tg=T(S),vis=[];
 for(let i=0;i<tg.length;i++){const n=tg[i];if(n.t-now>A)break;if(n.state==='done'&&now-n.t>450)continue;if(n.state==='done'&&n.grade!=='miss'&&now-n.t>250)continue;vis.push(n)}
 for(let i=vis.length-1;i>=0;i--){const n=vis[i],x=cx(n),y=cy(n),dt=n.t-now,done=n.state==='done';
  const a=done?clamp(1-(now-n.t)/300,0,1)*(n.grade==='miss'?.5:1):clamp((A-dt)/260,0,1);
  const r=38;g.save();g.globalAlpha=a;
  g.beginPath();g.arc(x,y,r,0,7);g.fillStyle=n.type==='hold'?'rgba(125,255,176,.22)':'rgba(255,217,107,.18)';g.fill();g.lineWidth=4;g.strokeStyle=n.type==='hold'?'#7dffb0':'#ffd96b';g.stroke();
  if(!done&&dt>0){const ar=r*(1+2.4*dt/A);g.beginPath();g.arc(x,y,ar,0,7);g.lineWidth=3;g.strokeStyle='#fff';g.globalAlpha=a*.85;g.stroke()}
  if(n.type==='hold'){g.globalAlpha=a;g.fillStyle='#7dffb0';g.font='bold 14px sans-serif';g.textAlign='center';g.fillText('HOLD',x,y+5);
   if(n.state==='holding'){const k=clamp((now-n.t)/n.dur,0,1);g.beginPath();g.arc(x,y,r+8,-Math.PI/2,-Math.PI/2+6.283*k);g.lineWidth=6;g.strokeStyle='#fff';g.stroke()}}
  g.restore()}
 g.fillStyle='rgba(255,255,255,.55)';g.font='12px sans-serif';g.textAlign='center';g.fillText('แตะ/คลิกที่วงกลมตอนวงแหวนมาถึง · คีย์บอร์ด: Z X C หรือ Space',W/2,H-16)}
/* --- DJ MIX --- */
function dDj(S,g,now){
 bg(S,g,now,'#ff4fd8');
 const hitY=410,top=60,ph=((now/(60000/S.song.bpm))%1+1)%1,pulse=1-ph;
 // แผงเครื่อง DJ
 rr(g,150,top,660,H-top-10,16);g.fillStyle='rgba(20,8,44,.7)';g.fill();g.strokeStyle='rgba(255,79,216,'+(.3+.5*pulse)+')';g.lineWidth=3;g.stroke();
 DJX.forEach((x,i)=>{g.fillStyle='rgba(255,255,255,.05)';g.fillRect(x-62,top,124,hitY-top);g.strokeStyle='rgba(255,255,255,.12)';g.strokeRect(x-62,top,124,hitY-top);
  if(S.flash[i]>0){g.fillStyle=COL.dj[i];g.globalAlpha=S.flash[i]*.3;g.fillRect(x-62,top,124,hitY-top);g.globalAlpha=1}});
 g.strokeStyle='#fff';g.globalAlpha=.75;g.lineWidth=3;g.beginPath();g.moveTo(198,hitY);g.lineTo(762,hitY);g.stroke();g.globalAlpha=1;
 // จานหมุน (scratch) + แพด (beat)
 [0,3].forEach(i=>{const x=DJX[i],y=468,r=52;g.save();g.translate(x,y);g.rotate(now/380*(i?1:-1)+S.flash[i]*1.2);
  g.beginPath();g.arc(0,0,r,0,7);g.fillStyle='#14091f';g.fill();g.lineWidth=4;g.strokeStyle=S.flash[i]>0?'#fff':'#ff4fd8';g.stroke();
  g.strokeStyle='rgba(255,255,255,.2)';g.lineWidth=2;for(let k=1;k<4;k++){g.beginPath();g.arc(0,0,r-k*11,0,7);g.stroke()}
  g.fillStyle='#ff4fd8';g.fillRect(-4,-r+6,8,18);g.beginPath();g.arc(0,0,8,0,7);g.fillStyle='#ffd96b';g.fill();g.restore();
  g.fillStyle='#fff';g.font='bold 11px sans-serif';g.textAlign='center';g.fillText(i?'SCRATCH R  [L / →]':'SCRATCH L  [A / ←]',x,H-6)});
 [1,2].forEach(i=>{const x=DJX[i];rr(g,x-58,436,116,66,12);g.fillStyle=S.flash[i]>0?'#4aa8ff':'rgba(74,168,255,.18)';g.fill();g.strokeStyle='#4aa8ff';g.lineWidth=3;g.stroke();
  g.fillStyle='#fff';g.font='bold 18px sans-serif';g.textAlign='center';g.fillText(i===1?'BEAT [S]':'BEAT [K]',x,476)});
 // นีออนกระพริบตามบีต
 g.save();g.globalCompositeOperation='lighter';[[60,300],[900,300]].forEach(p=>{const rg=g.createRadialGradient(p[0],p[1],4,p[0],p[1],160);rg.addColorStop(0,'rgba(255,79,216,'+(.12+.35*pulse)+')');rg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=rg;g.fillRect(p[0]-160,p[1]-160,320,320)});g.restore();
 const tg=T(S);
 for(let i=tg.length-1;i>=0;i--){const n=tg[i];if(n.state==='done'&&n.grade!=='miss'||n.t-now>FALL[S.diff]+80)continue;
  const miss=n.state==='done';if(miss&&now-n.t>600)continue;
  const x=DJX[n.lane],y=ya(S,n.t,now,hitY,top),sc=n.lane===0||n.lane===3;
  if(n.type==='hold'){const y2=ya(S,n.t+n.dur,now,hitY,top),yy=n.state==='holding'?hitY:y;g.fillStyle=COL.dj[n.lane];g.globalAlpha=miss?.2:.45;rr(g,x-22,Math.min(y2,yy),44,Math.abs(yy-y2),10);g.fill();g.globalAlpha=1}
  const yy=(n.type==='hold'&&n.state==='holding')?hitY:y;g.save();g.globalAlpha=miss?.3:1;
  if(sc){g.translate(x,yy);g.rotate(now/200);g.beginPath();g.arc(0,0,26,0,7);g.fillStyle='#2b0f3a';g.fill();g.lineWidth=4;g.strokeStyle='#ff4fd8';g.stroke();g.fillStyle='#ff4fd8';g.fillRect(-3,-22,6,14);g.fillRect(-3,8,6,14)}
  else{rr(g,x-50,yy-14,100,28,8);g.fillStyle='#4aa8ff';g.fill();g.lineWidth=2;g.strokeStyle='#fff';g.stroke()}
  g.restore()}}

/* ---------- API ---------- */
NC.play=play;
root.NC_PLAY={play,end:()=>end(false),session:()=>G,pause:()=>G&&pause(G),resume:()=>G&&resume(G),version:'step5'};
})(typeof window!=='undefined'?window:globalThis);

