
/* ============================================================================
 * CARD SHOP — UI (A): CSS · ร้านค้า/เคาน์เตอร์ · อนิเมชันเปิดซอง · Collection · ตู้โชว์
 * ========================================================================== */
(function(root){
'use strict';
const C=root.CARDSHOP;if(!C)return;
const A=root.CS_ASSETS||{cards:{}};
const $=(s,r)=>(r||document).querySelector(s);
const fmt=n=>'฿'+Math.round(n).toLocaleString('en-US');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const U={hooks:{lock:()=>{},unlock:()=>{},save:()=>{}}};

/* ---------- CSS ---------- */
const CSS=`
#csRoot,#csRoot *{box-sizing:border-box}
.csOv{position:fixed;inset:0;z-index:99994;background:rgba(6,8,20,.82);display:flex;align-items:center;justify-content:center;font-family:inherit;color:#f4efe2;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
.csOv[hidden]{display:none}
.csPanel{width:min(980px,96vw);max-height:94vh;max-height:94dvh;overflow:auto;background:linear-gradient(180deg,#171a30,#0f1122);border:2px solid #d0a451;border-radius:12px;box-shadow:0 0 0 3px #090a16,0 10px 40px rgba(0,0,0,.7);padding:12px 14px;position:relative}
.csHead{padding-right:84px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px}
.csHead h2{margin:0;font-size:clamp(15px,2.4vw,20px);color:#ffd96b;letter-spacing:.3px}
.csMoney{background:#0a0c18;border:1px solid #4a4f78;border-radius:999px;padding:4px 12px;font-weight:700;color:#ffe08a;font-size:clamp(12px,1.8vw,15px);white-space:nowrap}
.csBtn{cursor:pointer;background:linear-gradient(180deg,#3a4a7a,#26335a);color:#fff;border:1px solid #6f82bd;border-radius:8px;padding:8px 14px;min-height:40px;font:inherit;font-weight:700;font-size:clamp(12px,1.7vw,14px)}
.csBtn:hover:not(:disabled){filter:brightness(1.15)}
.csBtn:disabled{opacity:.42;cursor:not-allowed;filter:grayscale(.6)}
.csBtn.gold{background:linear-gradient(180deg,#e8b640,#b57d12);border-color:#ffe08a;color:#2a1a00}
.csBtn.red{background:linear-gradient(180deg,#c8473d,#8e2a24);border-color:#ff9a8f}
.csBtn.sm{min-height:32px;padding:4px 10px;font-size:12px}
.csClose{position:absolute;top:8px;right:10px}
.csGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(160px,44%),1fr));gap:10px}
.csNote{font-size:12px;color:#aab3d6;line-height:1.5}
/* ซอง */
.csPackCard{background:#0d1022;border:1px solid #3a4170;border-radius:10px;padding:10px;display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center}
.csPackCard b{font-size:clamp(12px,1.8vw,14px)}
.csPackCard .odds{font-size:11px;color:#a8b1d6;line-height:1.4}
.csPack{position:relative;width:78px;height:112px;border-radius:7px 7px 6px 6px;background:linear-gradient(160deg,var(--pc),#10122a 85%);border:2px solid rgba(255,255,255,.55);box-shadow:0 0 14px var(--pc),inset 0 0 14px rgba(0,0,0,.5);overflow:hidden;display:flex;align-items:center;justify-content:center;flex:none}
.csPack:before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(255,255,255,.14) 0 3px,transparent 3px 8px);opacity:.5}
.csPack:after{content:"";position:absolute;left:0;right:0;top:9%;height:5px;background:repeating-linear-gradient(90deg,rgba(255,255,255,.65) 0 3px,transparent 3px 6px)}
.csPack img{width:62%;height:auto;object-fit:contain;filter:drop-shadow(0 0 4px #000);position:relative;z-index:1;border-radius:4px}
.csPack i{position:absolute;bottom:5px;left:0;right:0;text-align:center;font:700 9px/1 sans-serif;color:#fff;text-shadow:0 1px 2px #000;z-index:2;letter-spacing:.5px;font-style:normal}
.csPack.big{width:min(180px,34vw);height:min(258px,48vh)}
.csPack.big i{font-size:14px;bottom:10px}
/* การ์ด */
.csCard{position:relative;border-radius:7%;overflow:hidden;background:#0a0b16;aspect-ratio:1/1;box-shadow:0 0 0 2px var(--tc,#555),0 0 10px var(--tg,transparent)}
.csCard img{width:100%;height:100%;display:block;object-fit:cover}
.csCard.por{aspect-ratio:300/421;border-radius:5%}
.csCard.sil img{filter:brightness(0) contrast(1.2);opacity:.9}
.csCard.sil:after{content:"???";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:900 clamp(18px,4vw,34px)/1 sans-serif;color:#b58cff;text-shadow:0 0 10px #8a3cff,0 0 2px #000;letter-spacing:2px}
.csCard.sil{box-shadow:0 0 0 2px #3a2a66,0 0 10px rgba(138,60,255,.35)}
.csCard .cnt{position:absolute;top:4px;right:4px;background:#0b0c1ae6;border:1px solid #ffd96b;color:#ffd96b;border-radius:999px;font:700 11px/1 sans-serif;padding:3px 6px}
.csTag{display:inline-block;border-radius:999px;padding:2px 8px;font-size:11px;font-weight:700;border:1px solid currentColor;margin:1px 2px;white-space:nowrap}
/* collection */
.csTabs{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0 10px}
.csTab{cursor:pointer;border:1px solid #3a4170;background:#0d1022;color:#cfd6f3;border-radius:999px;padding:6px 12px;font:inherit;font-size:12px;font-weight:700;min-height:34px}
.csTab.on{background:var(--fc,#4a63c8);color:#0b0e22;border-color:#fff;font-weight:800}
.csBar{height:12px;border-radius:99px;background:#0a0c18;border:1px solid #3a4170;overflow:hidden}
.csBar>i{display:block;height:100%;background:linear-gradient(90deg,#3dd6ff,#a455ff,#ffd35a);transition:width .6s}
.csColCard{cursor:pointer;display:flex;flex-direction:column;gap:3px;font-size:11px;text-align:center}
.csColCard .nm{font-weight:700;line-height:1.25;min-height:2.5em;display:flex;align-items:center;justify-content:center}
.csDetail{display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start}
.csDetail .csCard{width:min(320px,80vw);flex:none}
.csDetail dl{margin:0;display:grid;grid-template-columns:auto 1fr;gap:5px 10px;font-size:13px;flex:1;min-width:200px}
.csDetail dt{color:#9ba6d6}
/* เปิดซอง */
#csOpen{z-index:99997;background:radial-gradient(ellipse at center,#1b1d3d 0,#05060f 75%);flex-direction:column;gap:12px;overflow:hidden}
#csOpen .stage{position:relative;width:min(560px,94vw);height:min(62vh,520px);display:flex;align-items:center;justify-content:center;perspective:1100px}
#csOpen .rays{position:absolute;left:50%;top:50%;width:150vmax;height:150vmax;margin:-75vmax 0 0 -75vmax;background:repeating-conic-gradient(from 0deg,var(--rc,#ffd35a) 0 6deg,transparent 6deg 18deg);opacity:0;mask-image:radial-gradient(circle,#000 0,transparent 55%);-webkit-mask-image:radial-gradient(circle,#000 0,transparent 55%);pointer-events:none}
#csOpen.go .rays{animation:csSpin 7s linear infinite,csFade .8s forwards}
@keyframes csSpin{to{transform:rotate(360deg)}}
@keyframes csFade{to{opacity:.42}}
#csOpen .packWrap{position:absolute;display:flex;align-items:center;justify-content:center;transition:transform .3s}
#csOpen .packWrap.bob{animation:csBob 1.6s ease-in-out infinite}
@keyframes csBob{50%{transform:translateY(-12px) rotate(1.5deg)}}
#csOpen .packWrap.shake{animation:csShake .09s linear infinite}
@keyframes csShake{0%{transform:translate(-4px,2px) rotate(-3deg)}50%{transform:translate(4px,-2px) rotate(3deg)}100%{transform:translate(-3px,-3px) rotate(-2deg)}}
#csOpen .packWrap.burst{animation:csBurst .5s ease-out forwards}
@keyframes csBurst{to{transform:scale(2.4);opacity:0;filter:brightness(4)}}
#csOpen .flash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none}
#csOpen .flash.on{animation:csFlash .7s ease-out}
@keyframes csFlash{0%{opacity:.95}100%{opacity:0}}
#csOpen.t5 .flash.on{animation:csFlash5 1.5s ease-out}
@keyframes csFlash5{0%{opacity:1;background:#fff}25%{opacity:1;background:#ffd35a}100%{opacity:0;background:#ff9d1a}}
#csOpen .ring{position:absolute;left:50%;top:41%;width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;border:4px solid var(--rc,#ffd35a);opacity:0;pointer-events:none}
#csOpen .ring.on{animation:csRing 1.1s ease-out forwards}
@keyframes csRing{0%{opacity:.95;transform:scale(1)}100%{opacity:0;transform:scale(22)}}
#csOpen .flip{position:absolute;width:min(320px,70vw);aspect-ratio:1/1;transform-style:preserve-3d;transform:rotateY(180deg) scale(.55);opacity:0;transition:transform 1s cubic-bezier(.2,.9,.2,1.15),opacity .3s}
#csOpen .flip.show{opacity:1;transform:rotateY(0) scale(1)}
#csOpen .flip .face,#csOpen .flip .back{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:7%;overflow:hidden}
#csOpen .flip .face img,#csOpen .flip .back img{width:100%;height:100%;object-fit:cover}
#csOpen .flip .face{box-shadow:0 0 0 3px var(--tc),0 0 40px 8px var(--tg)}
#csOpen .flip .back{transform:rotateY(180deg);background:#0a0b16}
#csOpen .info{text-align:center;opacity:0;transform:translateY(12px);transition:.6s;min-height:84px;max-width:94vw}
#csOpen .info.show{opacity:1;transform:none}
#csOpen .info h3{margin:0 0 4px;font-size:clamp(15px,3.4vw,22px);color:#fff;text-shadow:0 0 10px var(--tc)}
#csOpen .banner{position:absolute;top:8%;left:0;right:0;text-align:center;font:900 clamp(26px,7vw,64px)/1 sans-serif;letter-spacing:.1em;color:var(--tc);text-shadow:0 0 18px var(--tg),0 0 40px var(--tg),0 3px 0 #000;opacity:0;pointer-events:none}
#csOpen .banner.on{animation:csBanner 2.6s ease-out forwards}
@keyframes csBanner{0%{opacity:0;transform:scale(2.2)}15%{opacity:1;transform:scale(1)}80%{opacity:1}100%{opacity:0;transform:scale(1.05)}}
#csOpen.shk{animation:csScreenShake .5s}
@keyframes csScreenShake{20%{transform:translate(-8px,4px)}40%{transform:translate(7px,-5px)}60%{transform:translate(-5px,-3px)}80%{transform:translate(4px,5px)}}
#csFx,#csRoot canvas{border:0!important;border-radius:0!important;background:transparent!important;aspect-ratio:auto!important;box-shadow:none!important}
#csFx{position:fixed;left:0;top:0;width:100vw!important;height:100vh!important;z-index:99999;pointer-events:none}
.csNew{display:inline-block;background:#ff3d6e;color:#fff;font:900 12px/1 sans-serif;padding:4px 8px;border-radius:5px;margin-right:6px;animation:csBob 1s infinite}
.csToast{position:fixed;left:50%;bottom:14%;transform:translateX(-50%);background:#101426f2;border:1px solid #d0a451;color:#ffe9a8;padding:8px 16px;border-radius:8px;z-index:100000;font-size:14px;pointer-events:none;max-width:92vw;text-align:center}
.csOdds{width:100%;border-collapse:collapse;font-size:12px}
.csOdds td,.csOdds th{border-bottom:1px solid #2a3058;padding:3px 6px;text-align:left}
.csShelfLab{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.csCase{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(150px,44%),1fr));gap:12px;padding:12px;background:linear-gradient(180deg,rgba(150,200,255,.10),rgba(30,40,80,.35));border:2px solid #7fa7d8;border-radius:10px;box-shadow:inset 0 0 30px rgba(130,180,255,.25)}
@media (max-height:430px){.csPanel{padding:8px 10px}.csPack{width:56px;height:80px}.csBtn{min-height:34px;padding:5px 10px}}
`;
function css(){if(document.getElementById('csCss'))return;const s=document.createElement('style');s.id='csCss';s.textContent=CSS;document.head.appendChild(s);
 if(!document.getElementById('csRoot')){const r=document.createElement('div');r.id='csRoot';document.body.appendChild(r)}}
function ov(id,cls){css();let o=document.getElementById(id);if(!o){o=document.createElement('div');o.id=id;o.className='csOv'+(cls?' '+cls:'');o.hidden=true;document.getElementById('csRoot').appendChild(o)}return o}
function toast(m){css();const d=document.createElement('div');d.className='csToast';d.textContent=m;document.body.appendChild(d);setTimeout(()=>d.remove(),2600)}

/* ---------- ชิ้นส่วนภาพ ---------- */
function cardImg(id){return (A.cards&&A.cards[id])||''}
function tierStyle(t){const T=C.TIERS[t];return '--tc:'+T.color+';--tg:'+T.glow+'aa'}
function cardEl(c,o){o=o||{};const n=C.own(c.id),sil=o.force==null?!n:!o.force;
 return '<div class="csCard'+(sil?' sil':'')+(c.por?' por':'')+(c.tier===6?' t6':'')+'" style="'+tierStyle(c.tier)+'"><img alt="" src="'+cardImg(c.id)+'">'+(!sil&&n>1?'<span class="cnt">×'+n+'</span>':'')+'</div>'}
function packEl(p,big){return '<div class="csPack'+(big?' big':'')+'" style="--pc:'+p.color+'"><img alt="" src="'+(A.back||'')+'"><i>'+p.en.replace(' Pack','').toUpperCase()+'</i></div>'}
function tierTag(t){const T=C.TIERS[t];if(t===7)return '<span class="csTag" style="color:'+T.color+'">SPECIAL</span>';return '<span class="csTag" style="color:'+T.color+'">Tier '+t+' · '+T.name+'</span>'}
function oddsTxt(p){return p.odds.map((o,i)=>o?('T'+(i+1)+' '+o+'%'):'').filter(Boolean).join(' · ')}
function dateTxt(e){if(!e)return '-';const d=new Date(e.ts||0);return 'วันที่ในเกม '+(e.d||'-')+' · '+(e.ts?d.toLocaleDateString('th-TH'):'')}

/* ---------- เคาน์เตอร์ / ชั้นวาง ---------- */
function shopHTML(focus){
 const ps=focus&&focus!=='all'?C.PACKS.filter(p=>p.id===focus):C.PACKS;
 let h='<button class="csBtn sm csClose" data-x>ปิด ✕</button><div class="csHead"><h2>'+(focus&&focus!=='all'?'🗄️ ชั้นวาง · '+C.PACK_BY_ID[focus].name:'🛒 เคาน์เตอร์ CARD SHOP')+'</h2><span class="csMoney">💰 '+fmt(C.money())+'</span></div>';
 h+='<div class="csNote" style="margin-bottom:8px">1 ซอง = 1 ใบ สุ่มจากฐานข้อมูลการ์ดจริง 36 ใบ · การ์ดที่ได้เป็น “การ์ดสะสม” เท่านั้น (ใช้ใน Card Battle ไม่ได้) · ได้ซ้ำจะเพิ่มจำนวนในสมุดสะสม</div>';
 h+='<div class="csGrid">'+ps.map(p=>{const can=C.money()>=p.price;
  return '<div class="csPackCard">'+packEl(p)+'<b>'+p.name+'</b><div class="odds">'+oddsTxt(p)+'<br>'+p.desc+'</div><button class="csBtn gold" data-buy="'+p.id+'" '+(can?'':'disabled')+'>ซื้อ '+fmt(p.price)+'</button></div>'}).join('')+'</div>';
 h+='<hr style="border:0;border-top:1px solid #2a3058;margin:12px 0"><div class="csHead"><b style="font-size:13px">อัตราสุ่มพื้นฐาน (ซองทั่วไป)</b></div><table class="csOdds"><tr>'+C.TIERS.slice(1,6).map((T,i)=>'<th style="color:'+T.color+'">T'+T.n+' '+T.name+'<br>'+C.BASE_ODDS[i]+'%</th>').join('')+'</tr></table>';
 h+='<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap"><button class="csBtn" data-col>📖 สมุดสะสม ('+C.completion().pct+'%)</button><button class="csBtn" data-dsp>🏆 ตู้โชว์การ์ดหายาก</button></div>';
 return h;
}
function openShop(focus){
 css();const o=ov('csShop');U.hooks.lock();
 const draw=()=>{o.innerHTML='<div class="csPanel">'+shopHTML(focus)+'</div>'};draw();o.hidden=false;
 const pend=C.pendingReveal();if(pend){toast('มีซองที่ซื้อไว้แต่ยังไม่ได้เปิด — เปิดให้เลย');setTimeout(()=>runOpen(pend,focus),300)}
 o.onclick=async e=>{
  const t=e.target.closest('button,[data-x]');if(!t)return;
  if(t.hasAttribute('data-x')||t.matches('[data-x]')){closeShop();return}
  if(t.dataset.buy){
   if(t.disabled||o.dataset.busy)return;o.dataset.busy='1';
   const r=C.buyPack(t.dataset.buy);
   if(!r.ok){toast(r.err);delete o.dataset.busy;draw();return}
   U.hooks.save();
   try{await runOpen({card:r.card,pack:r.pack,isNew:r.isNew,count:r.count},focus)}finally{delete o.dataset.busy}
   return}
  if(t.hasAttribute('data-col')){o.hidden=true;openCollection(()=>{o.hidden=false;draw()});return}
  if(t.hasAttribute('data-dsp')){o.hidden=true;openDisplay(()=>{o.hidden=false;draw()});return}
 };
 o.dataset.focus=focus||'all';o._redraw=draw;
}
function closeShop(){const o=document.getElementById('csShop');if(o)o.hidden=true;U.hooks.unlock()}

/* ---------- Particles (Canvas) ---------- */
let fx=null,fxP=[],fxRaf=0;
function fxCanvas(){if(fx)return fx;fx=document.createElement('canvas');fx.id='csFx';document.body.appendChild(fx);const rs=()=>{fx.width=innerWidth;fx.height=innerHeight};rs();addEventListener('resize',rs);return fx}
function burst(x,y,color,n,sp,life,grav){fxCanvas();for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=(.3+Math.random())*sp;fxP.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-sp*.2,l:life*(.6+Math.random()*.7),t:0,c:Array.isArray(color)?color[i%color.length]:color,s:2+Math.random()*4,g:grav==null?220:grav})}if(!fxRaf)fxRaf=requestAnimationFrame(fxLoop)}
function confetti(n){fxCanvas();const cols=['#ffd35a','#ff6b57','#6be68b','#5fb4ff','#c67bff','#fff'];for(let i=0;i<n;i++)fxP.push({x:Math.random()*innerWidth,y:-20-Math.random()*200,vx:(Math.random()-.5)*120,vy:60+Math.random()*180,l:3+Math.random()*2,t:0,c:cols[i%cols.length],s:4+Math.random()*5,g:90});if(!fxRaf)fxRaf=requestAnimationFrame(fxLoop)}
let fxLast=0;
function fxLoop(t){const dt=Math.min(.05,(t-(fxLast||t))/1000);fxLast=t;const g=fx.getContext('2d');g.clearRect(0,0,fx.width,fx.height);
 fxP=fxP.filter(p=>(p.t+=dt)<p.l);fxP.forEach(p=>{p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;g.globalAlpha=Math.max(0,1-p.t/p.l);g.fillStyle=p.c;g.fillRect(p.x,p.y,p.s,p.s)});g.globalAlpha=1;
 if(fxP.length)fxRaf=requestAnimationFrame(fxLoop);else{fxRaf=0;fxLast=0;g.clearRect(0,0,fx.width,fx.height)}}

/* ---------- อนิเมชันเปิดซอง ---------- */
function runOpen(res,focus){
 return new Promise(resolve=>{
  css();const card=res.card,T=C.TIERS[card.tier],pack=res.pack||C.PACKS[0];
  const o=ov('csOpen');o.className='csOv';o.classList.toggle('t5',card.tier===5);o.style.setProperty('--tc',T.color);o.style.setProperty('--tg',T.glow);o.style.setProperty('--rc',T.color);
  o.innerHTML='<div class="stage"><div class="rays"></div><div class="packWrap bob">'+packEl(pack,true)+'</div>'+
   '<div class="flip"><div class="face" style="--tc:'+T.color+';--tg:'+T.glow+'aa"><img alt="" src="'+cardImg(card.id)+'"></div><div class="back"><img alt="" src="'+(A.back||'')+'"></div></div></div>'+
   '<div class="banner"></div><div class="info"></div><div class="ctl"><button class="csBtn gold" data-op>🎁 เปิดซอง</button></div><div class="flash"></div><span class="ring"></span>';
  o.hidden=false;let state=0;
  const ctl=o.querySelector('.ctl'),info=o.querySelector('.info'),flip=o.querySelector('.flip'),pw=o.querySelector('.packWrap'),flash=o.querySelector('.flash'),ring=o.querySelector('.ring'),banner=o.querySelector('.banner');
  const cx=()=>innerWidth/2,cy=()=>innerHeight*.42;
  const finish=again=>{C.clearPending();U.hooks.save();o.hidden=true;fxP.length=0;resolve(again);const so=document.getElementById('csShop');if(so&&!so.hidden&&so._redraw)so._redraw();
   if(again)setTimeout(()=>{const b=so&&so.querySelector('[data-buy="'+pack.id+'"]');if(b&&!b.disabled)b.click();else toast('เงินไม่พอสำหรับซองนี้')},120)};
  ctl.onclick=async e=>{
   const t=e.target.closest('button');if(!t)return;
   if(t.hasAttribute('data-op')){ // ผู้เล่นกดเปิดซอง (ล็อกกันกดซ้ำ)
    if(state)return;state=1;t.disabled=true;ctl.innerHTML='';
    pw.classList.remove('bob');pw.classList.add('shake');
    await sleep(card.tier===5?1800:card.tier===4?1100:700);
    if(card.tier>=4){o.classList.add('go');burst(cx(),cy(),[T.color,'#fff'],40,300,1.2,60)}
    pw.classList.remove('shake');pw.classList.add('burst');flash.classList.add('on');ring.classList.add('on');
    if(card.tier>=4){o.classList.add('shk');setTimeout(()=>o.classList.remove('shk'),600)}
    burst(cx(),cy(),[T.color,'#fff',T.glow],card.tier===5?150:card.tier===4?90:40,card.tier===5?520:360,1.4,200);
    if(card.tier===5){setTimeout(()=>{ring.classList.remove('on');void ring.offsetWidth;ring.classList.add('on');burst(cx(),cy(),['#ffd35a','#fff','#ff9d1a'],120,600,1.8,120)},500);setTimeout(()=>confetti(120),700)}
    await sleep(card.tier===5?900:500);
    if(card.tier>=4){banner.textContent=card.tier===5?'★ LEGENDARY ★':'EPIC !';banner.classList.add('on')}
    flip.classList.add('show');
    await sleep(900);
    info.innerHTML='<h3>'+(res.isNew?'<span class="csNew">NEW!</span>':'')+card.name+'</h3>'+
     '<div><span class="csTag" style="color:#fff">Grade '+card.grade+'</span>'+tierTag(card.tier)+'<span class="csTag" style="color:'+T.color+'">'+T.th+'</span><span class="csTag" style="color:'+C.FAC_BY_ID[card.fac].color+'">'+C.FAC_BY_ID[card.fac].name+'</span></div>'+
     '<div class="csNote" style="margin-top:5px">'+(res.isNew?'เพิ่มเข้าสมุดสะสมแล้ว':'ได้การ์ดซ้ำ — จำนวนที่ครอบครองเพิ่มเป็น ×'+res.count)+' · พลัง '+card.power.toLocaleString()+'</div>';
    info.classList.add('show');
    ctl.innerHTML='<button class="csBtn gold" data-ok>✔ เก็บเข้า Collection</button> <button class="csBtn" data-again>🔁 ซื้อซองนี้อีก ('+fmt(pack.price)+')</button>';
    const ag=ctl.querySelector('[data-again]');if(C.money()<pack.price)ag.disabled=true;
    state=2;return}
   if(state!==2)return;
   if(t.hasAttribute('data-ok')){state=3;finish(false)}
   else if(t.hasAttribute('data-again')){state=3;finish(true)}
  };
 });
}

/* ---------- Collection ---------- */
function openCollection(onClose){
 css();const o=ov('csCol');U.hooks.lock();let fac='all';
 const draw=()=>{
  const cp=C.completion();
  const list=(fac==='all'?C.CARDS:C.CARDS.filter(c=>c.fac===fac));
  let h='<button class="csBtn sm csClose" data-x>ปิด ✕</button><div class="csHead"><h2>📖 สมุดสะสมการ์ด</h2><span class="csMoney">สะสมแล้ว '+cp.have+'/'+cp.total+' ('+cp.pct+'%)</span></div>';
  h+='<div class="csBar"><i style="width:'+cp.pct+'%"></i></div>';
  h+='<div class="csTabs"><button class="csTab'+(fac==='all'?' on':'')+'" data-f="all">ทั้งหมด</button>'+C.FACTIONS.map(f=>{const have=C.CARDS.filter(c=>c.fac===f.id&&C.own(c.id)).length,tot=C.CARDS.filter(c=>c.fac===f.id).length;return '<button class="csTab'+(fac===f.id?' on':'')+'" style="--fc:'+f.color+'" data-f="'+f.id+'">'+f.name+' '+have+'/'+tot+'</button>'}).join('')+'</div>';
  h+='<div class="csGrid">'+list.map(c=>{const n=C.own(c.id);return '<div class="csColCard" data-c="'+c.id+'">'+cardEl(c)+'<div class="nm">'+(n?c.name:'??? ยังไม่เคยได้รับ')+'</div><div>'+(n?(c.special?'<span style="color:'+C.TIERS[7].color+'">SPECIAL</span>':'<span style="color:'+C.TIERS[c.tier].color+'">T'+c.tier+' '+C.TIERS[c.tier].name+'</span> · G'+c.grade):'<span style="color:#7a6aa8">— ? —</span>')+'</div></div>'}).join('')+'</div>';
  h+='<div class="csNote" style="margin-top:8px">แตะการ์ดเพื่อดูรายละเอียด · การ์ดสะสมใช้ลงสนาม Card Battle ไม่ได้</div>';
  o.innerHTML='<div class="csPanel">'+h+'</div>';
 };
 const detail=id=>{
  const c=C.CARD_BY_ID[id],n=C.own(id),e=C.state().coll[id],F=C.FAC_BY_ID[c.fac];
  if(!n){o.innerHTML='<div class="csPanel"><button class="csBtn sm csClose" data-back>← กลับ</button><div class="csHead"><h2>??? ยังไม่เคยได้รับ</h2></div><div class="csDetail">'+cardEl(c)+'<dl><dt>เผ่า</dt><dd>'+F.name+'</dd><dt>Tier</dt><dd>'+tierTag(c.tier)+'</dd><dt>ข้อมูลอื่น</dt><dd>ซื้อซองการ์ดเพื่อค้นพบใบนี้</dd></dl></div></div>';return}
  o.innerHTML='<div class="csPanel"><button class="csBtn sm csClose" data-back>← กลับ</button><div class="csHead"><h2>'+c.name+'</h2></div><div class="csDetail">'+cardEl(c)+'<dl><dt>เผ่า</dt><dd style="color:'+F.color+'">'+F.name+' ('+F.th+')</dd><dt>Grade</dt><dd>'+c.grade+'</dd><dt>Tier</dt><dd>'+(c.special?'<span class="csTag" style="color:'+C.TIERS[7].color+'">SPECIAL</span> ไม่มี Tier · ใช้ Battle ไม่ได้':tierTag(c.tier)+' '+C.TIERS[c.tier].th)+'</dd>'+(c.special?'<dt>ราคาประเมิน</dt><dd>฿'+c.value.toLocaleString()+' · ขายได้ที่นักสะสม SPECIAL (≥ ฿1,000,000)</dd>':C.GACHA?'<dt>Tier ตู้กาชา</dt><dd>'+tierTag(C.GACHA.gt(c))+'</dd><dt>มูลค่า</dt><dd>฿'+C.GACHA.valueOf(c).toLocaleString()+' · NPC รับซื้อ ฿'+C.GACHA.buyPrice(c).toLocaleString()+'</dd>':'')+(c.special?'':'<dt>พลัง</dt><dd>'+c.power.toLocaleString()+'</dd>')+'<dt>จำนวนที่ครอบครอง</dt><dd>×'+n+'</dd><dt>วันที่ได้รับ</dt><dd>'+dateTxt(e)+'</dd><dt>สกิล</dt><dd>'+c.skill+'</dd></dl></div></div>'};
 draw();o.hidden=false;
 o.onclick=e=>{const t=e.target.closest('[data-x],[data-f],[data-c],[data-back]');if(!t)return;
  if(t.hasAttribute('data-x')){o.hidden=true;if(onClose)onClose();else U.hooks.unlock();return}
  if(t.dataset.f){fac=t.dataset.f;draw();return}
  if(t.dataset.c){detail(t.dataset.c);return}
  if(t.hasAttribute('data-back'))draw()};
}

/* ---------- ตู้โชว์ Grade 4/5 ---------- */
function openDisplay(onClose){
 css();const o=ov('csDsp');U.hooks.lock();
 const cs=C.CARDS.filter(c=>c.grade>=4);
 o.innerHTML='<div class="csPanel"><button class="csBtn sm csClose" data-x>ปิด ✕</button><div class="csHead"><h2>🏆 ตู้กระจกจัดแสดงการ์ดหายาก (Grade 4–5)</h2></div><div class="csNote" style="margin-bottom:8px">การ์ดจัดแสดงของร้าน — ใบที่คุณมีแล้วจะมีป้าย ✔ OWNED</div><div class="csCase">'+
  cs.map(c=>'<div class="csColCard">'+cardEl(c,{force:true})+'<div class="nm">'+c.name+'</div><div>'+(c.special?'<span style="color:'+C.TIERS[7].color+'">SPECIAL</span>':'<span style="color:'+C.TIERS[c.tier].color+'">T'+c.tier+' '+C.TIERS[c.tier].name+'</span> · G'+c.grade)+(C.own(c.id)?' · <b style="color:#6be68b">✔ OWNED ×'+C.own(c.id)+'</b>':'')+'</div></div>').join('')+'</div></div>';
 o.hidden=false;
 o.onclick=e=>{if(e.target.closest('[data-x]')){o.hidden=true;if(onClose)onClose();else U.hooks.unlock()}};
}

U.openShop=openShop;U.closeShop=closeShop;U.openCollection=openCollection;U.openDisplay=openDisplay;U.runOpen=runOpen;
U.css=css;U.ov=ov;U.toast=toast;U.fmt=fmt;U.sleep=sleep;U.burst=burst;U.confetti=confetti;U.cardEl=cardEl;U.cardImg=cardImg;U.tierTag=tierTag;U.packEl=packEl;U.fxCanvas=fxCanvas;
root.CS_UI=Object.assign(root.CS_UI||{},U);
})(typeof window!=='undefined'?window:globalThis);

