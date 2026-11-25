
/* ============================================================================
 * NICECLUB — GAME SELECTION UI   [STEP 4]
 * หน้าต่างเลือกเกมดนตรี 4 ประเภท · รายการเพลง · ระดับความยาก · BPM · Preview · คะแนนแยกเพลง · สถิติ
 * ต่อเข้ากับ niceclub-scene.js ผ่าน NICECLUB.renderSelect(overlay,hint,close)
 * ปุ่ม "เริ่มเล่น" จะใช้งานได้เมื่อมี NICECLUB.play(gameId,songId,diff) (STEP 5) — ตอนนี้ปิดอยู่ ไม่หลอกว่าเล่นได้
 * ========================================================================== */
(function(root){
'use strict';
if(!root.NICECLUB||!root.NC_SONGS)return;
const NS=root.NC_SONGS,NC=root.NICECLUB;
const DC={EASY:'#6ee7a0',NORMAL:'#6db8ff',HARD:'#ffb04a',EXPERT:'#ff5a7a'};
const fmt=ms=>{const s=Math.round(ms/1000);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
const fmtT=ms=>{const m=Math.round(ms/60000);return m>=60?Math.floor(m/60)+' ชม. '+(m%60)+' นาที':m+' นาที'};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function css(){
 if(document.getElementById('ncSelCss'))return;
 const st=document.createElement('style');st.id='ncSelCss';
 st.textContent=
 '#ncSel .ncP.ncW{width:min(900px,100%);display:flex;flex-direction:column;gap:8px}'+
 '#ncSel .ncHd{display:flex;align-items:center;justify-content:space-between;gap:8px}#ncSel .ncHd h2{margin:0;font-size:19px}'+
 '#ncSel .ncTabs{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}'+
 '#ncSel .ncT{min-height:44px;border:2px solid #4a2b86;background:rgba(30,12,60,.8);color:#e8dcff;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;padding:4px 6px;line-height:1.15}'+
 '#ncSel .ncT.on{background:#2a0f52;color:#fff}#ncSel .ncT small{display:block;font-weight:400;font-size:10px;color:#bba8ee}'+
 '#ncSel .ncBd{display:grid;grid-template-columns:minmax(220px,300px) 1fr;gap:10px;min-height:0}'+
 '#ncSel .ncL{display:flex;flex-direction:column;gap:6px}'+
 '#ncSel .ncS{border:1px solid #5a34a8;background:rgba(40,16,80,.55);color:#fff;border-radius:10px;padding:8px 10px;text-align:left;cursor:pointer;min-height:48px;font-size:13px}'+
 '#ncSel .ncS.on{background:rgba(70,30,130,.85);box-shadow:0 0 0 2px var(--gc,#ff4fd8) inset}#ncSel .ncS b{display:block;font-size:14px}#ncSel .ncS i{font-style:normal;font-size:11px;color:#cdbdf5}'+
 '#ncSel .ncD{border:1px solid #5a34a8;background:rgba(24,8,52,.7);border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:8px;min-width:0}'+
 '#ncSel .ncD h3{margin:0;font-size:18px}#ncSel .ncM{display:flex;flex-wrap:wrap;gap:6px;font-size:12px}'+
 '#ncSel .ncM span{border:1px solid #6a3fd0;border-radius:99px;padding:2px 9px;color:#e7dcff}'+
 '#ncSel .ncPv{display:flex;align-items:center;gap:8px}#ncSel .ncPb{flex:1;height:8px;border-radius:5px;background:#2b1a4d;overflow:hidden}#ncSel .ncPb u{display:block;height:100%;width:0;background:var(--gc,#ff4fd8);text-decoration:none}'+
 '#ncSel .ncBtn{min-height:44px;min-width:44px;border:2px solid var(--gc,#ff4fd8);background:#2a0f52;color:#fff;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;padding:4px 12px}'+
 '#ncSel .ncBtn[disabled]{opacity:.55;cursor:not-allowed;border-color:#6a3fd0}'+
 '#ncSel .ncDf{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}'+
 '#ncSel .ncF{min-height:52px;border:2px solid #4a2b86;background:rgba(30,12,60,.8);color:#fff;border-radius:10px;cursor:pointer;font-size:12px;padding:4px}#ncSel .ncF b{display:block;font-size:13px}'+
 '#ncSel .ncF.on{background:#2a0f52;border-color:var(--dc)}#ncSel .ncF b{color:var(--dc)}'+
 '#ncSel .ncSt{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;font-size:12px}#ncSel .ncSt div{background:rgba(40,16,80,.5);border-radius:8px;padding:5px 7px}#ncSel .ncSt em{display:block;font-style:normal;color:#bba8ee;font-size:10px}#ncSel .ncSt strong{font-size:14px}'+
 '#ncSel .ncFt{font-size:11px;color:#c7b3ff;display:flex;flex-wrap:wrap;gap:4px 14px;border-top:1px solid #3c2270;padding-top:6px}'+
 '#ncSel .ncNote{font-size:11px;color:#ffd96b}'+
 '#ncSel .ncBd{flex:1 1 auto;overflow:auto}#ncSel .ncD h3{margin:0}#ncSel table td{padding:3px 4px}#ncSel .ncFt,#ncSel .ncHd,#ncSel .ncTabs{flex:0 0 auto}#ncSel .ncP.ncW{overflow:hidden}'+
 '@media (max-width:700px){#ncSel .ncBd{grid-template-columns:1fr}}'+
 '@media (max-height:430px){#ncSel .ncP.ncW{gap:5px;padding:8px}#ncSel .ncHd h2{font-size:15px}#ncSel .ncT{min-height:38px;font-size:11px}#ncSel .ncT small{display:none}#ncSel .ncS{min-height:40px;padding:5px 8px}#ncSel .ncD{padding:7px;gap:5px}#ncSel .ncD h3{font-size:15px}#ncSel .ncBd{grid-template-columns:200px 1fr}#ncSel .ncF{min-height:42px}#ncSel .ncSt strong{font-size:12px}#ncSel .ncBtn,#ncSel .ncHd .ncX{min-height:40px}#ncSel .ncHd .ncX{min-width:90px}}';
 document.head.appendChild(st);
}
const HINT={dj:'dj',arrow:'arrow',beat:'circle',piano:'piano',circle:'circle',lb:'arrow',dev:'arrow'};
function render(o,hint,close){
 css();
 const U={g:HINT[hint]||'arrow',song:null,diff:'NORMAL',raf:0,view:'main'};
 const gm=()=>NS.GAMES.find(g=>g.id===U.g);
 const songs=()=>NS.forGame(U.g);
 U.song=songs()[0].id;
 o.innerHTML='<div class="ncP ncW"><div class="ncHd"><h2>🎶 NICECLUB · เลือกเกมดนตรี</h2><span style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end"><button class="ncX" type="button" data-lb style="min-width:60px">🏆</button><button class="ncX" type="button" data-dv style="min-width:60px">🛠</button><button class="ncX" type="button" data-x>ปิด ✕</button></span></div>'+
  '<div class="ncTabs" data-tabs></div><div class="ncBd"><div class="ncL" data-list></div><div class="ncD" data-det></div></div><div class="ncFt" data-ft></div></div>';
 const $=s=>o.querySelector(s);
 function stopPv(){NS.stopPreview();cancelAnimationFrame(U.raf);const b=o.querySelector('[data-pb]');if(b)b.style.width='0';const p=o.querySelector('[data-pv]');if(p)p.textContent='▶ ฟังตัวอย่าง'}
 function tabs(){$('[data-tabs]').innerHTML=NS.GAMES.map(g=>'<button type="button" class="ncT'+(g.id===U.g?' on':'')+'" data-g="'+g.id+'" style="'+(g.id===U.g?'border-color:'+g.color+';--gc:'+g.color:'')+'">'+g.icon+' '+g.name+'<small>'+esc(g.desc)+'</small></button>').join('')}
 function list(){
  const c=gm().color;$('[data-list]').style.setProperty('--gc',c);
  $('[data-list]').innerHTML=songs().map(s=>'<button type="button" class="ncS'+(s.id===U.song?' on':'')+'" data-s="'+s.id+'"><b>'+esc(s.name)+'</b><i>'+esc(s.artist)+' · '+s.bpm+' BPM · '+fmt(s.durMs)+'</i></button>').join('')}
 function det(){
  const s=NS.BYID[U.song],g=gm(),c=g.color;if(!s)return;
  const inf=NS.info(s.id,g.id,U.diff),b=NS.best(s.id,U.diff);
  const dfs=NS.DIFFS.map((d,i)=>{const n=NS.info(s.id,g.id,d);return '<button type="button" class="ncF'+(d===U.diff?' on':'')+'" data-d="'+d+'" style="--dc:'+DC[d]+'"><b>'+d+'</b>Lv.'+s.lv[i]+' · '+n.count+' โน้ต</button>'}).join('');
  const playable=typeof NC.play==='function';
  $('[data-det]').style.setProperty('--gc',c);
  $('[data-det]').innerHTML='<h3 style="color:'+c+'">'+g.icon+' '+esc(s.name)+'</h3>'+
   '<div class="ncM"><span>🎤 '+esc(s.artist)+'</span><span>♩ '+s.bpm+' BPM</span><span>⏱ '+fmt(s.durMs)+'</span><span>🎼 ลำดับ Beatmap '+inf.count+' โน้ต'+(inf.holds?' (Hold '+inf.holds+')':'')+'</span></div>'+
   '<div class="ncPv"><button type="button" class="ncBtn" data-pv>'+(NS.previewing()===s.id?'■ หยุด':'▶ ฟังตัวอย่าง')+'</button><div class="ncPb"><u data-pb></u></div></div>'+
   '<div class="ncDf">'+dfs+'</div>'+
   '<div class="ncSt"><div><em>คะแนนสูงสุด</em><strong>'+(b?b.score.toLocaleString():'—')+'</strong></div><div><em>RANK</em><strong>'+(b?b.rank:'—')+'</strong></div><div><em>ACCURACY</em><strong>'+(b?b.acc+'%':'—')+'</strong></div><div><em>MAX COMBO</em><strong>'+(b?b.maxCombo:'—')+'</strong></div></div>'+
   '<div class="ncNote">'+(b?'เล่นไปแล้ว '+b.plays+' ครั้ง ('+U.diff+')':'ยังไม่เคยเล่นเพลงนี้ที่ระดับ '+U.diff)+'</div>'+
   '<div><button type="button" class="ncBtn" data-play'+(playable?'':' disabled')+'>'+(playable?'▶ เริ่มเล่น':'🔒 ยังเล่นไม่ได้')+'</button></div>'}
 function foot(){
  const m=NS.summary();if(!m){$('[data-ft]').textContent='';return}
  const off=(root.NC_ENGINE?NC_ENGINE.cfg.offsetMs:0);
  $('[data-ft]').innerHTML='<span>📊 เล่นทั้งหมด '+m.plays+' ครั้ง</span><span>⏱ '+fmtT(m.playMs)+'</span><span>🏆 เคลียร์ '+m.cleared+'/'+m.total+' ชาร์ต</span><span>🎯 Accuracy รวม '+(m.notes?m.acc+'%':'—')+'</span><span>🚪 เข้าร้าน '+m.visits+' ครั้ง</span><span>⏱ Offset <button type="button" data-om class="ncX" style="min-width:30px;min-height:26px;font-size:12px">−</button> '+off+' ms <button type="button" data-op class="ncX" style="min-width:30px;min-height:26px;font-size:12px">+</button></span>'}
 function all(){$('.ncBd').innerHTML='<div class="ncL" data-list></div><div class="ncD" data-det></div>';tabs();list();det();foot()}
 function leaderboard(){
  const n=NC.state(),sc=(n&&n.scores)||{},rows=[];
  Object.keys(sc).forEach(id=>Object.keys(sc[id]).forEach(d=>{const s=NS.BYID[id];if(s)rows.push(Object.assign({id,d,name:s.name,game:s.game},sc[id][d]))}));
  const tot=rows.reduce((a,r)=>a+r.score,0),sum=NS.summary();
  const tbl=(title,list,cols)=>'<div class="ncD"><h3 style="font-size:14px;margin:0">'+title+'</h3>'+(list.length?'<table style="width:100%;font-size:11px;border-collapse:collapse">'+list.map((r,i)=>'<tr style="border-top:1px solid #3c2270"><td style="width:22px;color:#ffd96b">'+(i+1)+'</td>'+cols(r)+'</tr>').join('')+'</table>':'<div class="ncNote">ยังไม่มีข้อมูล — เล่นเพลงให้จบก่อน</div>')+'</div>';
  const nm=r=>'<td>'+esc(r.name)+' <small style="color:#bba8ee">'+r.d+'</small></td>';
  const top=(k,n_)=>rows.slice().sort((a,b)=>b[k]-a[k]).slice(0,n_||8);
  const byD=NS.DIFFS.map(d=>{const L=rows.filter(r=>r.d===d).sort((a,b)=>b.score-a.score);return L[0]?Object.assign({},L[0],{cnt:L.length}):null}).filter(Boolean);
  const hist=(n&&n.history||[]).slice(-8).reverse();
  $('.ncBd').innerHTML='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:8px;width:100%;grid-column:1/-1">'+
   '<div class="ncD"><h3 style="font-size:14px;margin:0">📊 สถิติส่วนตัว</h3><div style="font-size:12px;line-height:1.7">คะแนนสูงสุดรวม (ผลรวมสถิติทุกชาร์ต): <b>'+tot.toLocaleString()+'</b><br>เคลียร์ '+(sum?sum.cleared:0)+'/'+(sum?sum.total:0)+' ชาร์ต · เล่น '+(sum?sum.plays:0)+' ครั้ง · '+(sum&&sum.notes?'Accuracy รวม '+sum.acc+'%':'—')+'<br>เงินรางวัลสะสม $'+((n&&n.earned)||0).toLocaleString()+'<br>แยกตามเกม: '+NS.GAMES.map(g=>g.icon+' '+(((sum&&sum.byGame)||{})[g.id]||0)).join(' · ')+'</div></div>'+
   tbl('🥇 คะแนนสูงสุดแยกตามเพลง',top('score'),r=>nm(r)+'<td style="text-align:right"><b>'+r.score.toLocaleString()+'</b> '+r.rank+'</td>')+
   tbl('🎚 แยกตาม Difficulty (ที่ดีที่สุดของแต่ละระดับ)',byD,r=>'<td>'+r.d+'</td><td>'+esc(r.name)+'</td><td style="text-align:right">'+r.score.toLocaleString()+'</td>')+
   tbl('🔥 Max Combo สูงสุด',top('maxCombo',5),r=>nm(r)+'<td style="text-align:right"><b>'+r.maxCombo+'</b></td>')+
   tbl('🎯 Accuracy สูงสุด',top('acc',5),r=>nm(r)+'<td style="text-align:right"><b>'+r.acc+'%</b></td>')+
   tbl('🕘 การเล่นล่าสุด',hist,r=>{const s=NS.BYID[r.id];return '<td>'+esc(s?s.name:r.id)+' <small style="color:#bba8ee">'+r.diff+'</small></td><td style="text-align:right">'+r.score.toLocaleString()+' · '+r.rank+'</td>'})+
   '</div><div style="grid-column:1/-1;text-align:center"><button class="ncBtn" type="button" data-lbb>← กลับเลือกเพลง</button></div>';
  $('[data-tabs]').style.display='none'}
 function loop(){const c=NC.ac&&NC.ac(),st=NS.previewing();if(!st||!c)return;
  const pb=o.querySelector('[data-pb]');if(!pb)return;const k=(c.currentTime-(root.__ncPvT0||0));
  pb.style.width=Math.max(0,Math.min(100,k/14*100))+'%';U.raf=requestAnimationFrame(loop)}
 o.addEventListener('click',e=>{
  const t=e.target.closest('button');if(!t)return;
  if(t.hasAttribute('data-x')){stopPv();close();return}
  if(t.hasAttribute('data-om')||t.hasAttribute('data-op')){const E=root.NC_ENGINE;if(E){E.setCfg({offsetMs:E.cfg.offsetMs+(t.hasAttribute('data-op')?10:-10)});const n=NC.state();if(n){n.offsetMs=E.cfg.offsetMs;try{save(1)}catch(x){}}foot()}return}
  if(t.hasAttribute('data-lb')){stopPv();U.view='lb';leaderboard();return}
  if(t.hasAttribute('data-dv')){stopPv();U.view='dev';if(root.NC_DEV){const bd=$('[data-tabs]');bd.style.display='none';$('.ncBd').innerHTML='';NC_DEV.render($('.ncBd'),()=>{bd.style.display='';U.view='main';all()})}return}
  if(t.hasAttribute('data-lbb')){U.view='main';$('[data-tabs]').style.display='';all();return}
  if(t.dataset.g){stopPv();U.g=t.dataset.g;U.song=songs()[0].id;all();return}
  if(t.dataset.s){stopPv();U.song=t.dataset.s;list();det();return}
  if(t.dataset.d){U.diff=t.dataset.d;det();return}
  if(t.hasAttribute('data-pv')){
   if(NS.previewing()===U.song){stopPv();det();return}
   const r=NS.preview(U.song,{onEnd:()=>{try{const p=o.querySelector('[data-pv]');if(p)p.textContent='▶ ฟังตัวอย่าง';const b=o.querySelector('[data-pb]');if(b)b.style.width='0'}catch(x){}}});
   if(!r){const n=o.querySelector('.ncNote');if(n)n.textContent='🔇 เสียงปิดอยู่ หรือเบราว์เซอร์ยังไม่อนุญาตเสียง — เปิดเสียงเกมแล้วลองอีกครั้ง';return}
   root.__ncPvT0=NC.ac().currentTime+.08;t.textContent='■ หยุด';cancelAnimationFrame(U.raf);loop();return}
  if(t.hasAttribute('data-play')&&typeof NC.play==='function'){stopPv();const f=NC.play;close();f(U.g,U.song,U.diff)}
 });
 // คีย์ลัด: ←/→ เปลี่ยนเกม · ↑/↓ เปลี่ยนเพลง · 1-4 ระดับ · Space = Preview
 const KH=e=>{
  if(!document.body.contains(o)){document.removeEventListener('keydown',KH,true);return}
  const k=e.key;let h=1;
  if(k==='ArrowLeft'||k==='ArrowRight'){const a=NS.GAMES.map(g=>g.id),i=(a.indexOf(U.g)+(k==='ArrowRight'?1:3))%4;stopPv();U.g=a[i];U.song=songs()[0].id;all()}
  else if(k==='ArrowUp'||k==='ArrowDown'){const a=songs().map(s=>s.id),i=(a.indexOf(U.song)+(k==='ArrowDown'?1:2))%a.length;stopPv();U.song=a[i];list();det()}
  else if(k>='1'&&k<='4'){U.diff=NS.DIFFS[+k-1];det()}
  else h=0;
  if(h){e.preventDefault();e.stopPropagation()}};
 document.addEventListener('keydown',KH,true);
 o.tabIndex=-1;try{o.focus({preventScroll:true})}catch(e){}
 all();
 if(hint==='lb')setTimeout(()=>{const b=o.querySelector('[data-lb]');b&&b.click()},0);
 if(hint==='dev')setTimeout(()=>{const b=o.querySelector('[data-dv]');b&&b.click()},0);
 return{state:U,stop:stopPv,refresh:all}}
NC.renderSelect=render;
})(typeof window!=='undefined'?window:globalThis);

