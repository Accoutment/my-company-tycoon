
/* ============================================================================
 * CARD SHOP — GACHA (UI): หน้าต่างตู้กาชา · เลือกแพ็ค · อนิเมชันแคปซูล · KEEP/SELL · CARD BUYBACK SHOP
 * ========================================================================== */
(function(root){
'use strict';
const C=root.CARDSHOP,U=root.CS_UI;if(!C||!C.GACHA||!U)return;
const G=C.GACHA;
const A=root.CS_ASSETS||{};
const fmt=U.fmt,sleep=U.sleep;
const H=()=>U.hooks;

const CSS=`
.gaHead{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px;padding-right:84px}
.gaHead h2{margin:0;font-size:clamp(15px,2.4vw,20px);color:#ffd96b}
.gaBody{display:flex;gap:14px;align-items:flex-start}
.gaMach{flex:0 0 clamp(120px,22vw,210px);display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center}
.gaMach img{width:100%;height:auto;image-rendering:pixelated;filter:drop-shadow(0 0 16px var(--mc));animation:gaFloat 3s ease-in-out infinite}
.gaMach .gaD{font-size:12px;color:#b9c2e6;line-height:1.4}
@keyframes gaFloat{50%{transform:translateY(-4px)}}
.gaPacks{flex:1;min-width:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(min(150px,44%),1fr));gap:10px}
.gaPk{background:#0d1022;border:1px solid #3a4170;border-radius:10px;padding:8px;display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center}
.gaPk b{font-size:clamp(11px,1.6vw,13px);line-height:1.25;min-height:2.5em;display:flex;align-items:center}
.gaPk .gaS{font-size:11px;color:#a8b1d6;line-height:1.35}
.gaPk.soon{opacity:.55}
.gaPack{position:relative;width:clamp(70px,12vw,96px);aspect-ratio:240/545;border-radius:6px;overflow:hidden;box-shadow:0 0 12px var(--pc,#555);background:#10122a}
.gaPack img{width:100%;height:100%;object-fit:cover;display:block}
.gaPack.gen{border:2px solid rgba(255,255,255,.6);background:linear-gradient(165deg,var(--pc),#0c0e22 80%);display:flex;flex-direction:column;align-items:center;padding:6% 5%;gap:4%}
.gaPack.gen:before{content:"";position:absolute;left:0;right:0;top:3%;height:4px;background:repeating-linear-gradient(90deg,rgba(255,255,255,.7) 0 3px,transparent 3px 6px)}
.gaPack.gen:after{content:"";position:absolute;left:0;right:0;bottom:3%;height:4px;background:repeating-linear-gradient(90deg,rgba(255,255,255,.7) 0 3px,transparent 3px 6px)}
.gaPack.gen .gaFan{position:relative;width:100%;flex:1 1 60%;margin-top:8%}
.gaPack.gen .gaFan img{position:absolute;width:70%;height:auto;aspect-ratio:1;object-fit:cover;border:1.5px solid #fff;border-radius:3px;box-shadow:0 2px 6px #000a}
.gaPack.gen .gaFan img:nth-child(1){left:-2%;top:30%;transform:rotate(-10deg)}
.gaPack.gen .gaFan img:nth-child(2){right:-2%;top:30%;transform:rotate(10deg)}
.gaPack.gen .gaFan img:nth-child(3){left:15%;top:14%;z-index:2}
.gaPack.gen .gaTtl{font:900 clamp(7px,1.2vw,10px)/1.15 sans-serif;color:#fff;text-shadow:0 1px 3px #000,0 0 6px var(--pc);text-align:center;padding:3px 2px;background:#0008;border-radius:3px;width:100%;margin-bottom:5%}
.gaPack.big{width:min(190px,34vw)}
.gaPack.big.gen .gaTtl{font-size:clamp(10px,1.6vw,14px)}
.gaDet{display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start}
.gaDet .gaInf{flex:1;min-width:210px;display:flex;flex-direction:column;gap:8px}
.gaPrice{font:900 clamp(20px,3.4vw,28px)/1 sans-serif;color:#ffe08a}
.gaOdds{width:100%;border-collapse:collapse;font-size:12px}
.gaOdds th{color:#8e98c4;font-weight:700;text-align:left}
.gaOdds td,.gaOdds th{border-bottom:1px solid #2a3058;padding:3px 6px}
.gaOdds td:nth-child(n+3){text-align:right;white-space:nowrap}
.gaRow{display:flex;gap:6px;flex-wrap:wrap}
.gaThumb{width:clamp(42px,8vw,60px);text-align:center;font-size:9px;line-height:1.2}
.gaThumb .csCard{width:100%}
.gaThumb .csCard.sil:after,.bbRow .csCard.sil:after{font-size:13px;letter-spacing:0}
.gaFoot{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;align-items:center}
/* reveal */
#csGr{z-index:99997;background:radial-gradient(ellipse at 50% 40%,rgba(30,34,70,.96),rgba(4,5,14,.98));overflow:hidden}
.gaStage{position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:center}
.gaRays{position:absolute;inset:-30%;opacity:0;pointer-events:none;background:repeating-conic-gradient(from 0deg,var(--tc) 0 6deg,transparent 6deg 18deg);mask-image:radial-gradient(circle,#000 0,transparent 62%);-webkit-mask-image:radial-gradient(circle,#000 0,transparent 62%);animation:gaSpin 14s linear infinite}
.gaRays.on{opacity:.55;transition:opacity .5s}
.t6 .gaRays{background:repeating-conic-gradient(from 0deg,#ff4d4d 0 6deg,#ffd24d 6deg 12deg,#4dff88 12deg 18deg,#4dc9ff 18deg 24deg,#b04dff 24deg 30deg,transparent 30deg 36deg)}
@keyframes gaSpin{to{transform:rotate(360deg)}}
.gaMw{position:absolute;left:50%;top:50%;height:min(78vh,430px);transform:translate(-50%,-50%);transition:opacity .5s,filter .5s,transform .5s}
.gaMw img{height:100%;width:auto;display:block;image-rendering:pixelated;filter:drop-shadow(0 0 20px var(--mc))}
.gaMw.dim{opacity:0;transform:translate(-50%,-46%) scale(.9)}
.gaKnob{position:absolute;width:24%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff7c4,#e8b640 55%,#8a5a00);border:3px solid #fff;box-shadow:0 0 14px #ffd35a,0 0 0 3px #0006;transform:translate(-50%,-50%)}
.gaKnob:after{content:"";position:absolute;left:46%;top:8%;width:8%;height:46%;background:#5a3a00;border-radius:2px}
.gaKnob.spin{animation:gaKnob 1s cubic-bezier(.5,.1,.3,1)}
@keyframes gaKnob{to{transform:translate(-50%,-50%) rotate(720deg)}}
.gaCap{position:absolute;left:50%;top:50%;width:clamp(44px,9vh,70px);aspect-ratio:1;z-index:5;transform:translate(-50%,-50%);opacity:0}
.gaCap span{position:absolute;left:0;right:0;height:50%;display:block;transition:transform .5s cubic-bezier(.2,.8,.3,1),opacity .4s}
.gaCap .cpA{top:0;border-radius:999px 999px 0 0;background:linear-gradient(180deg,var(--c1),var(--c2));border:2px solid #fff9;border-bottom:0}
.gaCap .cpB{bottom:0;border-radius:0 0 999px 999px;background:linear-gradient(180deg,#f4f4f8,#b9bccb);border:2px solid #fff9;border-top:0}
.gaCap.open .cpA{transform:translate(-40%,-120%) rotate(-30deg);opacity:0}
.gaCap.open .cpB{transform:translate(40%,120%) rotate(30deg);opacity:0}
.t6 .gaCap .cpA{background:conic-gradient(#ff4d4d,#ffd24d,#4dff88,#4dc9ff,#b04dff,#ff4d4d)}
.gaCap.drop{animation:gaDrop .75s cubic-bezier(.45,0,.9,.6) forwards}
@keyframes gaDrop{0%{opacity:1;transform:translate(-50%,-330%)}55%{transform:translate(-50%,-50%)}68%{transform:translate(-50%,-130%)}82%{transform:translate(-50%,-50%)}91%{transform:translate(-50%,-80%)}100%{opacity:1;transform:translate(-50%,-50%)}}
.gaCap.center{opacity:1;transition:transform .55s cubic-bezier(.2,.8,.3,1);transform:translate(-50%,-50%) scale(2.4)}
.gaCap.shake{animation:gaShake .12s linear 6}
@keyframes gaShake{25%{transform:translate(-52%,-50%) scale(2.4) rotate(-6deg)}75%{transform:translate(-48%,-50%) scale(2.4) rotate(6deg)}}
.gaFlash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none}
.gaFlash.on{animation:gaFl .7s ease-out}
@keyframes gaFl{0%{opacity:.95}100%{opacity:0}}
.gaCw{position:absolute;left:50%;top:44%;transform:translate(-50%,-50%) scale(.2);opacity:0;transition:transform .55s cubic-bezier(.2,1.3,.4,1),opacity .35s}
.gaCw.on{opacity:1;transform:translate(-50%,-50%) scale(1)}
.gaCw .csCard{height:min(54vh,400px);aspect-ratio:300/421;width:auto;box-shadow:0 0 0 3px var(--tc),0 0 36px var(--tg),0 0 90px var(--tg)}
.gaCw .csCard:not(.por){aspect-ratio:1;height:auto;width:min(44vh,320px)}
.gaCw.t5 .csCard{animation:gaGlow 1.2s ease-in-out infinite alternate}
@keyframes gaGlow{to{box-shadow:0 0 0 3px var(--tc),0 0 56px var(--tg),0 0 140px var(--tg)}}
.gaBanner{position:absolute;left:0;right:0;top:7%;text-align:center;font:900 clamp(20px,5vw,44px)/1.1 sans-serif;color:var(--tc);text-shadow:0 0 18px var(--tg),0 3px 0 #000;letter-spacing:2px;opacity:0;transform:scale(.6);transition:.4s}
.gaBanner.on{opacity:1;transform:scale(1)}
.t6 .gaBanner{background:linear-gradient(90deg,#ff4d4d,#ffd24d,#4dff88,#4dc9ff,#b04dff,#ff4d4d);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:none;filter:drop-shadow(0 0 14px #fff8)}
.gaInfo{position:absolute;left:0;right:0;bottom:2.5%;display:flex;flex-direction:column;align-items:center;gap:6px;opacity:0;transform:translateY(12px);transition:.4s;padding:0 12px;text-align:center}
.gaInfo.on{opacity:1;transform:none}
.gaInfo .nm{font:800 clamp(14px,2.6vw,22px)/1.2 sans-serif;text-shadow:0 2px 6px #000}
.gaNew{display:inline-block;background:#2fbf63;color:#fff;font:900 12px/1 sans-serif;padding:4px 9px;border-radius:5px;animation:csBob 1s infinite}
.gaDup{display:inline-block;background:#e08a1e;color:#fff;font:900 12px/1 sans-serif;padding:4px 9px;border-radius:5px}
.gaSkip{position:absolute;right:12px;top:10px;z-index:9}
.gaStage.shk{animation:gaScreen .5s linear 2}
@keyframes gaScreen{20%{transform:translate(-6px,3px)}40%{transform:translate(5px,-4px)}60%{transform:translate(-4px,-3px)}80%{transform:translate(4px,4px)}}
/* buyback */
.bbSum{background:#0a0c18;border:1px solid #3a4170;border-radius:8px;padding:8px 10px;font-size:12px;color:#c4cbee;line-height:1.5;margin-bottom:8px}
.bbList{display:flex;flex-direction:column;gap:6px}
.bbRow{display:flex;gap:10px;align-items:center;background:#0d1022;border:1px solid #3a4170;border-radius:8px;padding:6px 8px}
.bbRow .csCard{width:clamp(40px,8vw,56px);flex:none}
.bbRow .bbMid{flex:1;min-width:0;font-size:12px;line-height:1.4}
.bbRow .bbMid b{font-size:clamp(12px,1.8vw,14px)}
.bbRow .bbBtns{display:flex;flex-direction:column;gap:4px}
.bbTbl{width:100%;border-collapse:collapse;font-size:11px;margin-top:8px}
.bbTbl td,.bbTbl th{border-bottom:1px solid #2a3058;padding:2px 6px;text-align:right}
.bbTbl td:first-child,.bbTbl th:first-child{text-align:left}
#csCf{z-index:99999}
#csCf .csPanel{width:min(420px,92vw);text-align:center}
#csCf p{font-size:15px;line-height:1.5;margin:8px 0 14px}
@media (max-width:640px){.gaBody{flex-direction:column;align-items:stretch}.gaMach{flex-direction:row;flex:none;width:100%;gap:10px;text-align:left}.gaMach img{width:72px}}
@media (max-height:430px){.gaPack.big{width:84px}.gaPack{width:62px}.gaThumb{width:38px}.gaDet{gap:10px;flex-wrap:nowrap}.gaDet .gaInf{min-width:0;gap:5px}.gaPrice{font-size:18px}.gaOdds td,.gaOdds th{padding:1px 6px}.gaFoot.stk{position:sticky;bottom:-10px;background:linear-gradient(180deg,rgba(15,17,34,0),#0f1122 30%);padding:6px 0 2px;z-index:3}.gaMach img{width:60px}.gaCw .csCard{height:min(50vh,300px)}.gaMw{height:70vh}.gaInfo{gap:3px}.gaInfo .nm{font-size:14px}.gaBanner{top:3%}}
`;
function css(){U.css();if(!document.getElementById('csGaCss')){const s=document.createElement('style');s.id='csGaCss';s.textContent=CSS;document.head.appendChild(s)}}

/* ---------- เสียง (WebAudio สังเคราะห์ ไม่ต้องใช้ไฟล์) ---------- */
let AC=null;
function ac(){try{if(!AC){const K=root.AudioContext||root.webkitAudioContext;if(K)AC=new K()}if(AC&&AC.state==='suspended')AC.resume();return AC}catch(e){return null}}
function tone(f,d,type,t0,v,f2){const a=ac();if(!a)return;try{const o=a.createOscillator(),g=a.createGain(),t=a.currentTime+(t0||0);o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v||.12,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.05)}catch(e){}}
function sfx(k,tier){
 if(k==='crank'){for(let i=0;i<5;i++)tone(180+i*30,.07,'square',i*.15,.05)}
 else if(k==='plink'){tone(900,.09,'triangle',0,.1,500);tone(700,.07,'triangle',.18,.07,420);tone(600,.06,'triangle',.3,.05,380)}
 else if(k==='open'){
  if(tier<=2)tone(520,.18,'triangle',0,.1,780);
  else if(tier<=4){[660,880,1100].forEach((f,i)=>tone(f,.22,'sine',i*.07,.1));tone(1500,.3,'triangle',.2,.05)}
  else if(tier===5){[523,659,784,1047,1319].forEach((f,i)=>tone(f,.4,'triangle',i*.1,.13));tone(1568,.9,'sine',.5,.09);tone(130,.9,'sawtooth',0,.05)}
  else{tone(80,1.2,'sawtooth',0,.12,40);[392,523,659,784,1047,1319,1568].forEach((f,i)=>tone(f,.6,'triangle',.15+i*.09,.12));tone(2093,1.3,'sine',.8,.1);tone(300,1.4,'square',.2,.04,1200)}
 }
}

/* ---------- ชิ้นส่วน ---------- */
const gt=c=>G.gt(c);
function gStyle(c){const T=C.TIERS[gt(c)];return '--tc:'+T.color+';--tg:'+T.glow+'aa'}
function gCard(c,o){o=o||{};const n=C.own(c.id),sil=o.force?false:!n;
 return '<div class="csCard'+(sil?' sil':'')+(c.por?' por':'')+(gt(c)===6?' t6':'')+'" style="'+gStyle(c)+'"><img alt="" src="'+U.cardImg(c.id)+'">'+(!sil&&n>1&&!o.nocnt?'<span class="cnt">×'+n+'</span>':'')+'</div>'}
function gTag(t){const T=C.TIERS[t];return '<span class="csTag" style="color:'+T.color+'">Tier '+t+' · '+T.name+'</span>'}
function packEl(p,big){
 const img=(p.img&&A.packs&&A.packs[p.img])||window.REI_PACKCOVER||'';
 if(img)return '<div class="gaPack'+(big?' big':'')+'" style="--pc:'+p.color+'"><img alt="" src="'+img+'"></div>';
 const cs=G.poolOf(p).slice().sort((a,b)=>gt(b)-gt(a)).slice(0,3);
 return '<div class="gaPack gen'+(big?' big':'')+'" style="--pc:'+p.color+'"><div class="gaFan">'+cs.map(c=>'<img alt="" src="'+U.cardImg(c.id)+'">').join('')+'</div><div class="gaTtl">'+p.name+'</div></div>';
}
function machImg(m){return (A.machines&&A.machines[m.img])||''}
function ownedIn(p){const pool=G.poolOf(p);return {have:pool.filter(c=>C.own(c.id)).length,total:pool.length}}
function confirmBox(msg,okTxt){
 css();return new Promise(res=>{
  const o=U.ov('csCf');o.innerHTML='<div class="csPanel"><p>'+msg+'</p><div style="display:flex;gap:10px;justify-content:center"><button class="csBtn gold" data-y>'+(okTxt||'ยืนยัน')+'</button><button class="csBtn" data-n>ยกเลิก</button></div></div>';o.hidden=false;
  let done=false;const fin=v=>{if(done)return;done=true;o.hidden=true;res(v)};
  o.onclick=e=>{const t=e.target.closest('[data-y],[data-n]');if(t)fin(t.hasAttribute('data-y'))};
 });
}

/* ============================================================================
 * หน้าต่างตู้กาชา
 * ========================================================================== */
function openMachine(machineId,opts){
 css();opts=opts||{};
 const m=G.MACH_BY_ID[machineId]||G.MACHINES[0];
 const o=U.ov('csGa');H().lock();
 let view='list',sel=null,busy=false;
 const close=()=>{o.hidden=true;H().unlock()};
 const head=(title,back)=>'<button class="csBtn sm csClose" data-x>EXIT ✕</button>'+(back?'<button class="csBtn sm" data-back style="position:absolute;top:8px;left:10px">← กลับ</button>':'')+'<div class="gaHead" style="'+(back?'padding-left:70px':'')+'"><h2>'+title+'</h2><span class="csMoney">💰 '+fmt(C.money())+'</span></div>';
 const list=()=>{
  const packs=m.packs.map(id=>G.GP_BY_ID[id]);
  return head('🎰 '+m.name+' · '+m.th)+
  '<div class="gaBody"><div class="gaMach" style="--mc:'+m.color+'"><img alt="'+m.name+'" src="'+machImg(m)+'"><div><b style="color:'+m.color+'">'+m.name+'</b><div class="gaD">'+m.desc+'<br>สุ่มครั้งละ <b style="color:#ffe08a">'+fmt(G.PRICE)+'</b></div></div></div>'+
  '<div class="gaPacks">'+packs.map(p=>{const n=G.poolOf(p).length,ow=ownedIn(p);
   if(p.soon)return '<div class="gaPk soon">'+packEl(p)+'<b>'+p.name+'</b><div class="gaS">COMING SOON<br>ยังไม่มีการ์ดในแพ็ค จึงยังสุ่มไม่ได้</div></div>';
   return '<div class="gaPk" data-pk="'+p.id+'">'+packEl(p)+'<b>'+p.name+'</b><div class="gaS">การ์ดในแพ็ค '+n+' ใบ · มีแล้ว '+ow.have+'/'+ow.total+'<br>Tier 1–6 · '+fmt(p.price)+'</div><button class="csBtn gold sm" data-sel="'+p.id+'">SELECT PACK</button></div>'}).join('')+'</div></div>'+
  '<div class="gaFoot"><button class="csBtn" data-col>📖 สมุดสะสม ('+C.completion().pct+'%)</button><button class="csBtn red" data-x>EXIT</button></div>';
 };
 const detail=()=>{
  const p=G.GP_BY_ID[sel],od=G.oddsOf(p),ow=ownedIn(p),pool=G.poolOf(p).slice().sort((a,b)=>gt(a)-gt(b));
  const can=C.money()>=p.price;
  return head('🎰 '+p.name,1)+
  '<div class="gaDet">'+packEl(p,1)+'<div class="gaInf"><div><b style="font-size:clamp(14px,2.2vw,18px)">'+p.name+'</b><div class="csNote">'+p.th+' · ตู้ '+m.name+'</div></div>'+
  '<div><span class="gaPrice">'+fmt(p.price)+'</span> <span class="csNote">/ การสุ่ม 1 ครั้ง = การ์ด 1 ใบ</span></div>'+
  '<div class="csNote">การ์ดในแพ็คนี้ <b>'+od.total+'</b> ใบ (มีแล้ว '+ow.have+'/'+ow.total+') · สุ่มเฉพาะการ์ดในแพ็คนี้ ไม่ข้ามแพ็ค · ไม่มีระบบการันตี Tier สูง</div>'+
  '<table class="gaOdds"><tr><th>Tier</th><th>ความหายาก</th><th>อัตราสุ่ม</th><th>การ์ด</th></tr>'+od.rows.map(r=>{const T=C.TIERS[r.tier];return '<tr><td style="color:'+T.color+';font-weight:800">T'+r.tier+'</td><td style="color:'+T.color+'">'+T.name+'</td><td>'+(+r.pct.toFixed(2))+'%</td><td>'+r.n+' ใบ</td></tr>'}).join('')+'</table>'+
  '<div class="gaRow">'+pool.map(c=>'<div class="gaThumb">'+gCard(c,{nocnt:1})+'<div>'+(C.own(c.id)?'T'+gt(c)+' ×'+C.own(c.id):'T'+gt(c)+' ???')+'</div></div>').join('')+'</div>'+
  (can?'':'<div style="color:#ff8a8a;font-weight:700;font-size:13px">เงินไม่พอ — ต้องใช้ '+fmt(p.price)+'</div>')+
  '<div class="gaFoot stk"><button class="csBtn gold" data-go '+(can?'':'disabled')+'>CONFIRM · สุ่ม '+fmt(p.price)+'</button>'+
  (G.buyMulti&&U.showMulti?(U.MULTI_OPTIONS||[3,10]).map(n=>'<button class="csBtn gold" data-multi="'+n+'" '+(C.money()>=p.price*n?'':'disabled')+'>สุ่ม ×'+n+' · '+fmt(p.price*n)+'</button>').join(''):'')+'<button class="csBtn" data-back>← เลือกแพ็คอื่น</button><button class="csBtn red" data-x>EXIT</button></div></div></div>';
 };
 const draw=()=>{o.innerHTML='<div class="csPanel">'+(view==='list'?list():detail())+'</div>'};
 draw();o.hidden=false;
 o._redraw=draw;
 o.onclick=async e=>{
  const t=e.target.closest('button,[data-pk]');if(!t||busy)return;
  if(t.hasAttribute('data-x')){close();return}
  if(t.hasAttribute('data-back')){view='list';draw();return}
  if(t.hasAttribute('data-col')){o.hidden=true;U.openCollection(()=>{o.hidden=false;draw()});return}
  if(t.dataset.sel){sel=t.dataset.sel;view='detail';draw();return}
  if(t.dataset.multi){
   if(t.disabled||!G.buyMulti||!U.showMulti)return;busy=true;t.disabled=true;
   try{
    const r=G.buyMulti(sel,+t.dataset.multi);
    if(!r.ok){U.toast(r.err);if(r.pending){const pd=G.pending();if(pd)await reveal(pd,{machine:m});}draw();return}
    H().save();
    draw();await U.showMulti(r,{machine:m});
   }finally{busy=false;if(!o.hidden)draw()}
   return;
  }
  if(t.hasAttribute('data-go')){
   if(t.disabled)return;busy=true;t.disabled=true;
   try{
    const r=G.buy(sel);
    if(!r.ok){U.toast(r.err);if(r.pending){const pd=G.pending();if(pd)await reveal(pd,{machine:m});}draw();return}
    H().save();
    draw();await reveal({card:r.card,pack:r.pack,isNew:r.isNew,count:r.count,dup:!r.isNew,machine:m.id},{machine:m,anim:true});
   }finally{busy=false;if(!o.hidden)draw()}
  }
 };
 // มีการ์ดที่สุ่มค้างจากรอบก่อน (ปิดเกม/โหลดเซฟกลางคัน) → เปิดให้เลือก KEEP/SELL ต่อ
 const pd=G.pending();if(pd&&!opts.noResume){busy=true;reveal(pd,{machine:G.MACH_BY_ID[pd.machine]||m}).finally(()=>{busy=false;if(!o.hidden)draw()})}
}

/* ============================================================================
 * อนิเมชันแคปซูล + หน้าแสดงการ์ด + KEEP / SELL DUPLICATE
 * ========================================================================== */
let curReveal=null;
function reveal(res,o){
 if(curReveal)return curReveal;
 curReveal=reveal0(res,o);const clr=()=>{curReveal=null};curReveal.then(clr,clr);return curReveal;
}
function reveal0(res,o){
 css();o=o||{};
 const m=o.machine||G.MACH_BY_ID[res.machine]||G.MACHINES[0];
 const card=res.card,tier=gt(card),T=C.TIERS[tier];
 return new Promise(resolve=>{
  const ov=U.ov('csGr');ov.className='csOv t'+tier;ov.style.setProperty('--tc',T.color);ov.style.setProperty('--tg',T.glow);ov.style.setProperty('--mc',m.color);
  const k=m.knob||[.55,.72];
  ov.innerHTML='<div class="gaStage" id="gaSt"><div class="gaRays"></div>'+
   '<div class="gaMw" id="gaMw"><img alt="" src="'+machImg(m)+'"><div class="gaKnob" id="gaKn" style="left:'+k[0]*100+'%;top:'+k[1]*100+'%"></div></div>'+
   '<div class="gaCap" id="gaCap" style="--c1:'+T.color+';--c2:'+T.glow+'"><span class="cpA"></span><span class="cpB"></span></div>'+
   '<div class="gaCw t'+tier+'" id="gaCw">'+gCard(card,{force:1,nocnt:1})+'</div>'+
   '<div class="gaBanner" id="gaBn"></div><div class="gaFlash" id="gaFl"></div>'+
   '<div class="gaInfo" id="gaIn"></div>'+(o.anim?'<button class="csBtn sm gaSkip" id="gaSk">ข้าม ⏭</button>':'')+'</div>';
  ov.hidden=false;
  const $=id=>ov.querySelector('#'+id);
  const st=$('gaSt'),cap=$('gaCap'),cw=$('gaCw'),bn=$('gaBn'),fl=$('gaFl'),inf=$('gaIn'),mw=$('gaMw'),kn=$('gaKn'),rays=ov.querySelector('.gaRays');
  const cx=()=>innerWidth/2,cy=()=>innerHeight*.44;
  let skipped=false,shown=false,decided=false;
  const wait=ms=>new Promise(r=>{const t0=Date.now();const iv=setInterval(()=>{if(skipped||Date.now()-t0>=ms){clearInterval(iv);r()}},30)});
  const show=(fx)=>{
   if(shown)return;shown=true;
   mw.classList.add('dim');cap.style.display='none';cw.classList.add('on');rays.classList.add('on');
   if(tier>=5){bn.textContent=tier===6?'MYTHIC DISCOVERED!':'★ LEGENDARY ★';bn.classList.add('on')}
   else if(tier>=3){bn.textContent=tier===4?'EPIC!':'RARE!';bn.classList.add('on')}
   if(fx){
    fl.classList.remove('on');void fl.offsetWidth;fl.style.background=tier===6?'#fff':tier===5?'#ffe9a0':'#cfe2ff';fl.classList.add('on');
    const cols=[T.color,'#fff',T.glow];
    U.burst(cx(),cy(),tier===6?['#ff4d4d','#ffd24d','#4dff88','#4dc9ff','#b04dff','#fff']:cols,tier===6?220:tier===5?150:tier>=3?80:34,tier>=5?560:360,1.4,200);
    if(tier>=5)setTimeout(()=>U.burst(cx(),cy(),['#ffd35a','#fff','#ff9d1a'],120,620,1.6,160),260);
    if(tier===6){st.classList.add('shk');setTimeout(()=>st.classList.remove('shk'),1100);U.confetti(90)}
    else if(tier===5)U.confetti(50);
    sfx('open',tier);
   }
   const dup=res.dup||(!res.isNew&&C.own(card.id)>=2),n=C.own(card.id),pr=G.buyPrice(card);
   inf.innerHTML='<div class="nm">'+card.name+'</div><div>'+gTag(tier)+'<span class="csTag" style="color:#cfd6f3">'+(res.pack?res.pack.name:'')+'</span>'+(dup?'<span class="gaDup">DUPLICATE CARD</span>':'<span class="gaNew">NEW CARD!</span>')+'</div>'+
    '<div class="csNote" style="color:#e6e9ff">'+(dup?card.name+' <b style="color:#ffd96b">×'+n+'</b> · การ์ดใบแรกยังอยู่ในสมุดสะสม · ใบซ้ำเก็บไว้หรือขายได้ (รับซื้อ 30% = '+fmt(pr)+')':'เพิ่มเข้าสมุดสะสมแล้ว · มีอยู่ ×'+n)+'</div>'+
    '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">'+(dup?'<button class="csBtn gold" data-k>KEEP · เก็บไว้</button><button class="csBtn red" data-s>SELL DUPLICATE · ขาย +'+fmt(pr)+'</button>':'<button class="csBtn gold" data-k>COLLECT ✔ เก็บเข้าสมุด</button>')+'</div>';
   inf.classList.add('on');
   const sk=ov.querySelector('#gaSk');if(sk)sk.style.display='none';
  };
  inf.onclick=e=>{
   const b=e.target.closest('[data-k],[data-s]');if(!b||decided)return;decided=true;
   inf.querySelectorAll('button').forEach(x=>x.disabled=true);
   const r=G.resolve(b.hasAttribute('data-s')?'sell':'keep');
   H().save();
   if(!r.ok){U.toast(r.err||'ทำรายการไม่สำเร็จ')}
   else if(r.action==='sell')U.toast('ขาย '+card.name+' ได้ +'+fmt(r.amt)+' · เหลือ ×'+r.left);
   else U.toast('เก็บ '+card.name+' ไว้แล้ว');
   ov.hidden=true;U.fxCanvas&&0;resolve(r);
  };
  const sk=ov.querySelector('#gaSk');if(sk)sk.onclick=()=>{skipped=true};
  (async()=>{
   if(!o.anim){show(false);return}
   // 1) ลูกบิดหมุน
   sfx('crank');kn.classList.add('spin');await wait(1050);if(skipped)return show(true);
   // 2) แคปซูลตกลงช่องรับ + เด้ง
   cap.style.left=(50+0)+'%';cap.style.top='50%';
   const mr=mw.getBoundingClientRect(),ch=m.chute||[.5,.86];cap.style.left=(mr.left+mr.width*ch[0])+'px';cap.style.top=(mr.top+mr.height*ch[1])+'px';cap.style.transform='';
   cap.classList.add('drop');sfx('plink');await wait(800);if(skipped)return show(true);
   // 3) แคปซูลมาอยู่กลางจอ สั่นเล็กน้อย
   cap.style.left='50%';cap.style.top='46%';cap.classList.remove('drop');cap.classList.add('center');mw.classList.add('dim');await wait(620);if(skipped)return show(true);
   cap.classList.add('shake');await wait(tier>=5?900:tier>=3?550:300);if(skipped)return show(true);
   // 4) เปิดแคปซูล → การ์ดปรากฏ (เอฟเฟกต์ตาม Tier)
   cap.classList.add('open');await wait(220);show(true);
  })();
  // skip ก่อนที่ animation จะจบ: show(true) ถูกเรียกในลำดับ async ด้านบน
 });
}

/* เรียกตอนเข้าฉาก: มีการ์ดกาชาที่สุ่มค้างอยู่ → ให้เลือก KEEP/SELL ต่อ (ไม่สุ่ม/ไม่หักเงินซ้ำ) */
function resume(){
 const pd=G.pending();if(!pd)return false;
 H().lock();
 reveal(pd,{machine:G.MACH_BY_ID[pd.machine]}).then(()=>{H().unlock()});
 return true;
}

/* ============================================================================
 * CARD BUYBACK SHOP (NPC CARD COLLECTOR)
 * ========================================================================== */
function openBuyback(){
 css();const o=U.ov('csBb');H().lock();
 let busy=false;
 const draw=()=>{
  const L=G.dupList(),tot=L.reduce((a,d)=>a+d.price*d.sellable,0),cnt=L.reduce((a,d)=>a+d.sellable,0);
  o.innerHTML='<div class="csPanel"><button class="csBtn sm csClose" data-x>EXIT ✕</button><div class="gaHead"><h2>💼 CARD BUYBACK SHOP</h2><span class="csMoney">💰 '+fmt(C.money())+'</span></div>'+
  '<div class="bbSum"><b style="color:#ffd96b">CARD COLLECTOR:</b> “ผมรับซื้อเฉพาะ <b>การ์ดซ้ำ</b> ในราคา <b>30%</b> ของมูลค่า — ใบสุดท้ายของแต่ละชนิดต้องเก็บไว้ใน Collection นะ”<br>'+
  'การ์ดซ้ำที่ขายได้ <b>'+cnt+'</b> ใบ ('+L.length+' ชนิด) · รวมราคารับซื้อ <b style="color:#ffe08a">'+fmt(tot)+'</b></div>'+
  (L.length?'<div class="bbList">'+L.map(d=>'<div class="bbRow">'+gCard(d.card,{force:1,nocnt:1})+'<div class="bbMid"><b>'+d.card.name+'</b><br>'+gTag(gt(d.card))+'<br>มีอยู่ <b>×'+d.n+'</b> · ขายได้ '+d.sellable+' ใบ<br>มูลค่า '+fmt(d.value)+' → รับซื้อ <b style="color:#6be68b">'+fmt(d.price)+'</b>/ใบ</div><div class="bbBtns"><button class="csBtn gold sm" data-sell="'+d.card.id+'" data-q="1">SELL 1</button>'+(d.sellable>1?'<button class="csBtn sm" data-sell="'+d.card.id+'" data-q="'+d.sellable+'">SELL ×'+d.sellable+'</button>':'')+'</div></div>').join('')+'</div>'
   :'<div class="csNote" style="padding:18px;text-align:center;font-size:14px">ยังไม่มีการ์ดซ้ำให้ขาย<br>สุ่มการ์ดจากตู้กาชาเพื่อให้ได้การ์ดซ้ำ</div>')+
  '<table class="bbTbl"><tr><th>Tier</th>'+[1,2,3,4,5,6].map(t=>'<th style="color:'+C.TIERS[t].color+'">T'+t+'</th>').join('')+'</tr><tr><td>มูลค่า</td>'+[1,2,3,4,5,6].map(t=>'<td>'+G.VALUE[t].toLocaleString()+'</td>').join('')+'</tr><tr><td>รับซื้อ 30%</td>'+[1,2,3,4,5,6].map(t=>'<td style="color:#6be68b">'+Math.round(G.VALUE[t]*G.SELL_RATE).toLocaleString()+'</td>').join('')+'</tr></table>'+
  '<div class="gaFoot"><button class="csBtn gold" data-all '+(L.length?'':'disabled')+'>SELL ALL DUPLICATES · '+fmt(tot)+'</button><button class="csBtn red" data-x>EXIT</button></div></div>';
 };
 draw();o.hidden=false;o._redraw=draw;
 o.onclick=async e=>{
  const t=e.target.closest('button');if(!t||busy)return;
  if(t.hasAttribute('data-x')){o.hidden=true;H().unlock();return}
  if(t.dataset.sell){
   const id=t.dataset.sell,q=+t.dataset.q,card=C.CARD_BY_ID[id],pr=G.buyPrice(card)*q;
   busy=true;
   try{
    const yes=await confirmBox('ขาย <b>'+card.name+'</b> ×'+q+'<br>รับเงิน <b style="color:#6be68b">'+fmt(pr)+'</b> (30% ของมูลค่า)<br><span class="csNote">เก็บการ์ดอย่างน้อย 1 ใบไว้ใน Collection เสมอ</span>','ขายเลย');
    if(!yes)return;
    const r=G.sell(id,q);H().save();
    U.toast(r.ok?'ขายแล้ว +'+fmt(r.amt)+' · เหลือ ×'+r.left:r.err);
   }finally{busy=false;draw()}
   return}
  if(t.hasAttribute('data-all')){
   if(t.disabled)return;
   const L=G.dupList(),tot=L.reduce((a,d)=>a+d.price*d.sellable,0),cnt=L.reduce((a,d)=>a+d.sellable,0);
   busy=true;
   try{
    const yes=await confirmBox('ขายการ์ดซ้ำทั้งหมด <b>'+cnt+'</b> ใบ ('+L.length+' ชนิด)<br>รับเงินรวม <b style="color:#6be68b">'+fmt(tot)+'</b><br><span class="csNote">เหลือการ์ดชนิดละ 1 ใบเสมอ</span>','ขายทั้งหมด');
    if(!yes)return;
    const r=G.sellAll();H().save();
    U.toast(r.ok?'ขายการ์ดซ้ำ '+r.cnt+' ใบ +'+fmt(r.amt):r.err);
   }finally{busy=false;draw()}
  }
 };
}

U.openMachine=openMachine;U.openBuyback=openBuyback;U.resumeGacha=resume;U.gachaReveal=reveal;U.gCard=gCard;U.gTag=gTag;U.gPackEl=packEl;U.confirmBox=confirmBox;
root.CS_UI=Object.assign(root.CS_UI||{},U);
})(typeof window!=='undefined'?window:globalThis);

