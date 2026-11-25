
/* ============================================================================
 * CARD SHOP — GRAND LEGENDARY AUCTION (UI): แค็ตตาล็อก · ห้องประมูลสด · ผลล็อต · ขาย SPECIAL · ประวัติ · ไอคอนแจ้งเตือน
 * ========================================================================== */
(function(root){
'use strict';
const C=root.CARDSHOP,U=root.CS_UI;if(!C||!C.AUCTION||!U)return;
const A=C.AUCTION,G=C.GACHA,fmt=U.fmt,H=()=>U.hooks;

const CSS=`
#csAuc{z-index:99995;background:#07060f;padding:0}
.auWrap{position:relative;width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:radial-gradient(ellipse at 50% 0%,#3a2a12 0,#150f1c 55%,#07060f 100%);color:#f6ecd2}
.auBg{position:absolute;inset:0;pointer-events:none;opacity:.9;background:
 radial-gradient(ellipse 40% 60% at 30% 0,rgba(255,226,140,.28),transparent 70%),radial-gradient(ellipse 40% 60% at 70% 0,rgba(255,226,140,.22),transparent 70%)}
.auWrap.sp .auBg{background:conic-gradient(from 0deg at 50% 38%,#ff4d4d33,#ffd24d33,#4dff8833,#4dc9ff33,#b04dff33,#ff4d4d33);animation:auRot 8s linear infinite;opacity:1}
@keyframes auRot{to{filter:hue-rotate(360deg)}}
.auTop{position:relative;z-index:2;display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:8px 100px 6px 14px;border-bottom:2px solid #d0a451;background:linear-gradient(180deg,#2b1d0a,#16101e)}
.auTop h2{margin:0;font-size:clamp(14px,2.2vw,20px);color:#ffd96b;letter-spacing:1px}
.auTop .csMoney{margin-left:auto}
.auGrid{position:relative;z-index:2;flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);gap:14px;padding:10px 14px;overflow:auto}
.auStage{display:flex;flex-direction:column;align-items:center;gap:8px;min-width:0}
.auCard{position:relative;width:min(100%,46vh,380px);aspect-ratio:1;border-radius:12px;box-shadow:0 0 0 3px var(--tc),0 0 40px var(--tg),0 0 90px var(--tg);overflow:hidden;background:#0a0b16}
.auCard.por{aspect-ratio:300/421;width:min(100%,40vh,300px)}
.auCard img{width:100%;height:100%;object-fit:cover;display:block}
.auWrap.sp .auCard:after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,.55) 45%,rgba(255,120,220,.35) 52%,rgba(120,220,255,.35) 58%,transparent 70%);background-size:250% 100%;mix-blend-mode:screen;animation:auFoil 2.6s linear infinite}
@keyframes auFoil{from{background-position:130% 0}to{background-position:-60% 0}}
.auName{font:900 clamp(16px,2.6vw,24px)/1.2 sans-serif;text-align:center;text-shadow:0 2px 8px #000}
.auEmcee{width:100%;background:#0b0a16cc;border:1px solid #6b5a2c;border-left:4px solid #ffd96b;border-radius:8px;padding:8px 10px;font-size:clamp(12px,1.7vw,14px);line-height:1.45;min-height:3.2em}
.auEmcee b{color:#ffd96b}
.auSide{display:flex;flex-direction:column;gap:8px;min-width:0}
.auBoard{background:linear-gradient(180deg,#0b0a16,#17102a);border:2px solid #d0a451;border-radius:10px;padding:8px 12px;text-align:center;box-shadow:inset 0 0 24px #000}
.auBoard .lab{font-size:11px;color:#b7a77a;letter-spacing:1px}
.auBoard .cur{font:900 clamp(26px,5vw,44px)/1.1 'Courier New',monospace;color:#ffe08a;text-shadow:0 0 14px #ffb300}
.auBoard .cur.flash{animation:auFlash .5s}
@keyframes auFlash{0%{transform:scale(1.14);color:#fff}100%{transform:none}}
.auBoard .top{font-weight:800;font-size:clamp(12px,1.8vw,15px);min-height:1.3em}
.auBoard .mini{font-size:11px;color:#b7a77a;line-height:1.5;margin-top:2px}
.auTimer{position:relative;height:20px;border-radius:99px;background:#0a0b16;border:1px solid #6b5a2c;margin-top:6px;overflow:hidden}
.auTimer i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#3ddc84,#ffd35a,#ff5a4d);transform-origin:left}
.auTimer b{position:absolute;inset:0;text-align:center;font:800 12px/20px sans-serif;text-shadow:0 1px 2px #000}
.auTimer.hot{animation:auHot .5s infinite alternate}
@keyframes auHot{to{box-shadow:0 0 12px #ff4d4d}}
.auBtns{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(120px,46%),1fr));gap:6px}
.auBtns .csBtn{min-height:38px;padding:4px 8px;font-size:clamp(11px,1.6vw,13px)}
.auCustom{display:flex;gap:6px}
.auCustom input{flex:1;min-width:0;background:#0a0b16;border:1px solid #6b5a2c;border-radius:8px;color:#fff;padding:6px 10px;font:700 14px 'Courier New',monospace}
.auLog{background:#0b0a16cc;border:1px solid #3a3050;border-radius:8px;padding:6px 8px;font-size:12px;line-height:1.5;height:clamp(54px,12vh,100px);overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end}
.auLog div{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.auNpcs{display:flex;flex-wrap:wrap;gap:5px}
.auNp{display:flex;align-items:center;gap:4px;background:#120e20;border:1px solid var(--nc);border-radius:999px;padding:2px 8px 2px 4px;font-size:11px}
.auNp.wd{opacity:.4;text-decoration:line-through}.auNp.lead{background:var(--nc);color:#111;font-weight:800}
.auNp i{font-style:normal;font-size:15px}
.auCat{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.auLot{background:#120e20;border:1px solid #6b5a2c;border-radius:10px;padding:8px;text-align:center;font-size:12px;line-height:1.45}
.auLot .csCard{width:min(100%,26vh,200px);margin:0 auto 6px}
.auLot.done{opacity:.8}
.auBanner{position:absolute;inset:0;z-index:6;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:rgba(4,3,12,.86);text-align:center;padding:12px}
.auBanner h1{margin:0;font:900 clamp(26px,6vw,56px)/1.1 sans-serif;color:#ffd96b;text-shadow:0 0 24px #ff9d00,0 3px 0 #000;letter-spacing:2px}
.auBanner.win h1{background:linear-gradient(90deg,#ffd35a,#fff,#ffd35a);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:none;filter:drop-shadow(0 0 16px #ffb300)}
.auBanner.lose h1{color:#ff9a8a;text-shadow:0 0 18px #ff3d3d,0 3px 0 #000}
.auBanner .csCard{width:min(34vw,30vh,230px)}
.auBanner .sub{font-size:clamp(13px,2vw,17px);line-height:1.5;max-width:90vw}
.auAnn{position:absolute;left:0;right:0;top:34%;z-index:5;text-align:center;font:900 clamp(24px,6vw,54px)/1.1 sans-serif;pointer-events:none;opacity:0}
.auAnn.on{animation:auAnn 2.2s ease-out}
@keyframes auAnn{0%{opacity:0;transform:scale(.5)}12%{opacity:1;transform:scale(1.08)}80%{opacity:1}100%{opacity:0;transform:scale(1.15)}}
.auAnn.spA{text-shadow:none;background:linear-gradient(90deg,#ff4d4d,#ffd24d,#4dff88,#4dc9ff,#b04dff,#ff4d4d);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 14px #fff8)}
.spRow{display:flex;gap:10px;align-items:center;background:#120e20;border:1px solid #6b5a2c;border-radius:10px;padding:8px;margin-bottom:8px}
.spRow .csCard{width:clamp(50px,9vw,72px);flex:none}
.spOff{display:flex;gap:8px;align-items:center;justify-content:space-between;background:#0d1022;border:1px solid #3a4170;border-radius:8px;padding:6px 10px;margin-top:6px;font-size:12px;flex-wrap:wrap}
.spOff.used{opacity:.45}
#csAucBadge{position:fixed;left:50%;top:50px;transform:translateX(-50%);z-index:99990;display:none;cursor:pointer;background:linear-gradient(180deg,#3a2a0a,#1a1226);border:2px solid #ffd96b;color:#ffe9a8;border-radius:999px;padding:5px 14px;font:800 13px/1.2 sans-serif;box-shadow:0 0 14px #ffb300aa;max-width:92vw;text-align:center}
#csAucBadge.on{display:block}
#csAucBadge.today{animation:auBadge 1s infinite alternate}
@keyframes auBadge{to{box-shadow:0 0 24px #ffd96b;transform:translateX(-50%) scale(1.05)}}
@media (max-width:760px),(max-height:430px){
 .auGrid{grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:8px;padding:6px 8px}
 .auCard{width:min(100%,38vh,240px)}.auCard.por{width:min(100%,34vh,200px)}
 .auTop{padding:4px 92px 4px 8px}.auBoard{padding:4px 8px}.auBoard .mini{font-size:10px}
 .auLog{height:46px;font-size:11px}.auEmcee{padding:4px 8px;min-height:2.6em}.auName{font-size:14px}
 .auCat{gap:6px}.auLot{font-size:10px;padding:4px}.auLot .csCard{width:min(100%,24vh,130px)}
}
`;
function css(){U.css();if(!document.getElementById('csAuCss')){const s=document.createElement('style');s.id='csAuCss';s.textContent=CSS;document.head.appendChild(s)}}

/* ---------- เสียง ---------- */
let AC=null;
function ac(){try{if(!AC){const K=root.AudioContext||root.webkitAudioContext;if(K)AC=new K()}if(AC&&AC.state==='suspended')AC.resume();return AC}catch(e){return null}}
function tone(f,d,type,t0,v,f2){const a=ac();if(!a)return;try{const o=a.createOscillator(),g=a.createGain(),t=a.currentTime+(t0||0);o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v||.1,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.05)}catch(e){}}
function sfx(k){
 if(k==='gavel'){tone(160,.12,'square',0,.18,60);tone(120,.18,'square',.16,.2,50)}      // เสียงเคาะประมูล
 else if(k==='bid')tone(880,.08,'triangle',0,.08,1200);
 else if(k==='mine')tone(660,.1,'triangle',0,.12,990);
 else if(k==='warn')tone(440,.06,'square',0,.05);
 else if(k==='special'){[523,659,784,1047,1319,1568].forEach((f,i)=>tone(f,.45,'triangle',i*.1,.12));tone(2093,1.2,'sine',.6,.08)}
 else if(k==='win'){[523,659,784,1047].forEach((f,i)=>tone(f,.3,'triangle',i*.12,.14))}
 else if(k==='lose')tone(300,.4,'sawtooth',0,.08,120);
}
const KIND_TH={T5:'Tier 5 · Legendary',T6:'Tier 6 · Mythic',SPECIAL:'SPECIAL COLLECTION'};
const kindColor=k=>k==='SPECIAL'?'#ff9be8':k==='T6'?C.TIERS[6].color:C.TIERS[5].color;
const gCard=(c)=>U.gCard(c,{force:1,nocnt:1});
const esc=s=>String(s).replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));

/* ============================================================================
 * หน้าต่างงานประมูล
 * ========================================================================== */
function openAuction(){
 css();const day=C.day();let ev=A.currentEvent(day);
 const o=U.ov('csAuc');H().lock();
 const close=()=>{stop();A.persist(true);o.hidden=true;H().unlock()};
 let phase='cat',timer=0,it=null,idx=0,busy=false,last=0,logs=[],lastBid=0;
 const stop=()=>{if(timer){clearInterval(timer);timer=0}};
 const card=i=>C.CARD_BY_ID[ev.items[i].card];
 const shell=(inner,cls)=>{o.innerHTML='<div class="auWrap '+(cls||'')+'"><div class="auBg"></div><button class="csBtn sm csClose" data-x style="z-index:9">ออก ✕</button>'+inner+'</div>'};
 const topBar=t=>'<div class="auTop"><h2>🔨 GRAND LEGENDARY AUCTION</h2><span class="csTag" style="color:#ffd96b">'+t+'</span><span class="csMoney" id="auMoney">💰 '+fmt(C.money())+'</span></div>';

 /* ----- ไม่มีงานวันนี้ ----- */
 if(!ev){
  const n=A.notice(day);
  shell(topBar('ยังไม่มีงานประมูล')+'<div class="auGrid" style="grid-template-columns:1fr"><div class="auEmcee" style="font-size:16px"><b>พิธีกร:</b> “งานประมูล GRAND LEGENDARY AUCTION จัดทุก <b>7 วัน</b> ในเกม — งานครั้งต่อไป <b>วันที่ '+n.day+'</b> (อีก '+(n.day-day)+' วัน)<br>มี 3 ล็อต: Tier 5 / Tier 6 และ SPECIAL COLLECTION (โอกาส 2%) · พลาดงานต้องรอรอบถัดไปนะคะ”</div>'+
   '<div class="gaFoot"><button class="csBtn gold" data-sp>💼 ขายการ์ด SPECIAL ให้นักสะสม</button><button class="csBtn" data-hist>📜 ประวัติการประมูล</button><button class="csBtn red" data-x>ออก</button></div></div>','');
  o.hidden=false;bindMisc();return;
 }
 function bindMisc(){
  o.onclick=e=>{const t=e.target.closest('button');if(!t)return;
   if(t.hasAttribute('data-x')){close();return}
   if(t.hasAttribute('data-sp')){o.hidden=true;openSpecialBuyer(()=>{o.hidden=false});return}
   if(t.hasAttribute('data-hist')){o.hidden=true;openHistory(()=>{o.hidden=false});return}}
 }
 const firstOpen=()=>{const i=ev.items.findIndex(x=>!x.settled);return i<0?3:i};

 /* ----- แค็ตตาล็อกก่อนเปิดประมูล ----- */
 function catalog(){
  stop();phase='cat';idx=firstOpen();
  const finished=idx>=3;
  shell(topBar('งานวันที่ '+ev.day)+'<div class="auGrid" style="grid-template-columns:1fr"><div><div class="auEmcee"><b>พิธีกร:</b> “ยินดีต้อนรับสู่งานประมูลสุดยอดการ์ดระดับตำนาน! วันนี้มี <b>3 ล็อต</b> — ผู้เสนอราคาสูงสุดคือผู้ชนะ เงินจะถูกหักเมื่อชนะเท่านั้น ถ้าเสนอราคาในช่วง 10 วินาทีสุดท้าย เวลาจะขยายอีก 10 วินาที”</div><div class="auCat" style="margin-top:10px">'+
   ev.items.map((x,i)=>{const c=card(i);const st=x.settled?(x.result==='player'?'<b style="color:#6be68b">คุณชนะ ฿'+x.final.toLocaleString()+'</b>':x.result==='npc'?'ผู้ชนะ: '+esc(A.NPC_BY_ID[x.winner].name)+' ฿'+x.final.toLocaleString():x.result==='forfeit'?'ชำระเงินไม่ได้':'ไม่มีผู้เสนอราคา'):(i===idx?'<b style="color:#ffd96b">ล็อตถัดไป</b>':'รอ');
    return '<div class="auLot'+(x.settled?' done':'')+'"><div style="color:'+kindColor(x.kind)+';font-weight:800">LOT '+(i+1)+' · '+KIND_TH[x.kind]+'</div>'+gCard(c)+'<b>'+esc(c.name)+'</b><br>ราคาเริ่มต้น <b style="color:#ffe08a">'+fmt(x.start)+'</b><br>มูลค่าประเมิน '+fmt(x.est)+'<br>'+st+'</div>'}).join('')+'</div>'+
   '<div class="csNote" style="margin-top:8px">ผู้เข้าร่วมวันนี้: '+ev.parts.map(p=>{const n=A.NPC_BY_ID[p.id];return n.av+' '+esc(n.name)}).join(' · ')+'</div>'+
   '<div class="gaFoot">'+(finished?'<button class="csBtn gold" data-fin>ดูสรุปงาน</button>':'<button class="csBtn gold" data-go>'+(ev.items.some(x=>x.settled||x.state==='live')?'▶ ประมูลต่อ (ล็อต '+(idx+1)+')':'▶ START AUCTION')+'</button>')+'<button class="csBtn" data-sp>💼 ขาย SPECIAL</button><button class="csBtn" data-hist>📜 ประวัติ</button><button class="csBtn red" data-x>ออก</button></div></div></div>','');
  o.hidden=false;
  o.onclick=e=>{const t=e.target.closest('button');if(!t||busy)return;
   if(t.hasAttribute('data-go')){ev.joined=true;intro();return}
   if(t.hasAttribute('data-fin')){final();return}
   if(t.hasAttribute('data-x')){close();return}
   if(t.hasAttribute('data-sp')){o.hidden=true;openSpecialBuyer(()=>{o.hidden=false});return}
   if(t.hasAttribute('data-hist')){o.hidden=true;openHistory(()=>{o.hidden=false});return}};
 }

 /* ----- ประกาศก่อนเริ่มล็อต ----- */
 async function intro(){
  idx=firstOpen();if(idx>=3){final();return}
  it=ev.items[idx];const c=card(idx),sp=it.kind==='SPECIAL';
  if(it.state==='live'){live(true);return}
  phase='intro';
  const T=C.TIERS[sp?7:it.kind==='T6'?6:5];
  shell(topBar('LOT '+(idx+1)+' / 3')+'<div class="auBanner" id="auIn"><div style="color:'+kindColor(it.kind)+';font-weight:900;letter-spacing:2px">LOT '+(idx+1)+' · '+KIND_TH[it.kind]+'</div>'+gCard(c)+'<h1>'+esc(c.name)+'</h1><div class="sub"><b>พิธีกร:</b> '+(sp?'“เปิดการประมูล <b>SPECIAL COLLECTION</b>! การ์ดสะสมสุดพิเศษ ไม่มี Tier ใช้ Battle ไม่ได้!”':'“ล็อตต่อไปคือ <b>'+esc(c.name)+'</b> ('+KIND_TH[it.kind]+')”')+'<br>ราคาเริ่มต้น <b style="color:#ffe08a">'+fmt(it.start)+'</b> · มูลค่าประเมิน '+fmt(it.est)+'</div><button class="csBtn sm" data-skip>เริ่มเลย ▶</button></div>',sp?'sp':'');
  o.querySelector('.auWrap').style.setProperty('--tc',T.color);o.querySelector('.auWrap').style.setProperty('--tg',T.glow+'aa');
  o.hidden=false;sfx(sp?'special':'gavel');if(sp)U.confetti&&U.confetti(60);
  let go=false;const start=()=>{if(go)return;go=true;live(false)};
  o.onclick=e=>{const t=e.target.closest('button');if(!t)return;if(t.hasAttribute('data-x')){close();return}if(t.hasAttribute('data-skip'))start()};
  setTimeout(()=>{if(phase==='intro'&&!go)start()},sp?4200:2800);
 }

 /* ----- ประมูลสด ----- */
 function live(resumed){
  phase='live';it=ev.items[idx];const c=card(idx),sp=it.kind==='SPECIAL';
  if(it.state==='wait')A.startItem(ev,idx);
  const T=C.TIERS[sp?7:it.kind==='T6'?6:5];
  logs=[];
  const steps=sp?[['+50,000',50000],['+100,000',100000],['+500,000',500000]]:[['+1,000',1000],['+5,000',5000],['+10,000',10000],['+50,000',50000]];
  shell(topBar('LOT '+(idx+1)+' / 3 · '+KIND_TH[it.kind])+'<div class="auAnn" id="auAnn"></div><div class="auGrid"><div class="auStage"><div class="auCard'+(c.por?' por':'')+'" style="--tc:'+T.color+';--tg:'+T.glow+'aa"><img alt="" src="'+U.cardImg(c.id)+'"></div><div class="auName" style="color:'+kindColor(it.kind)+'">'+esc(c.name)+'</div><div class="auEmcee" id="auEm"></div></div>'+
   '<div class="auSide"><div class="auBoard"><div class="lab">ราคาปัจจุบัน</div><div class="cur" id="auCur">—</div><div class="top" id="auTop"></div><div class="mini" id="auMini"></div><div class="auTimer" id="auTm"><i id="auBar"></i><b id="auTime"></b></div></div>'+
   '<div class="auBtns" id="auBtns"><button class="csBtn gold" data-min>BID MIN</button>'+steps.map(s=>'<button class="csBtn gold" data-st="'+s[1]+'">BID '+(s[0]==='MIN'?'+MIN':s[0])+'</button>').join('')+'</div>'+
   '<div class="auCustom"><input id="auCin" inputmode="numeric" placeholder="CUSTOM BID (฿)"><button class="csBtn" data-cu>CUSTOM BID</button></div>'+
   '<div class="auLog" id="auLog"></div><div class="auNpcs" id="auNp"></div></div></div>',sp?'sp':'');
  o.querySelector('.auWrap').style.setProperty('--tc',T.color);o.querySelector('.auWrap').style.setProperty('--tg',T.glow+'aa');
  o.hidden=false;
  const $=id=>o.querySelector('#'+id);
  const em=t=>{$('auEm').innerHTML='<b>พิธีกร:</b> '+t};
  const ann=(t,cls)=>{const a=$('auAnn');a.textContent=t;a.className='auAnn '+(cls||'');void a.offsetWidth;a.classList.add('on');if(!cls)a.style.color=T.color;else a.style.color=''};
  const logAdd=t=>{logs.push(t);if(logs.length>6)logs.shift();$('auLog').innerHTML=logs.map(x=>'<div>'+x+'</div>').join('')};
  em(sp?'“<b>SPECIAL COLLECTION</b> — '+esc(c.name)+'! ราคาเริ่มต้น '+fmt(it.start)+' มีใครให้มากกว่านี้ไหมคะ?”':'“'+esc(c.name)+' ราคาเริ่มต้น '+fmt(it.start)+' เริ่มเสนอราคาได้เลยค่ะ!”');
  if(sp)ann('SPECIAL COLLECTION!','spA');else if(!resumed)ann('LOT '+(idx+1)+' · '+(it.kind==='T6'?'MYTHIC':'LEGENDARY'));
  if(it.bids.length)it.bids.slice(-4).forEach(b=>logAdd(esc(b.who==='player'?'คุณ':A.NPC_BY_ID[b.who].name)+' เสนอ <b>'+fmt(b.amt)+'</b>'));
  last=performance.now();let lastCur=-1,warned=0,saveT=0;
  const render=()=>{
   const req=A.required(it),m=C.money(),left=Math.max(0,it.endClock-it.clock);
   if(it.cur!==lastCur){const cu=$('auCur');cu.textContent=it.bids.length?fmt(it.cur):fmt(it.start);cu.classList.remove('flash');void cu.offsetWidth;cu.classList.add('flash');lastCur=it.cur}
   $('auTop').innerHTML=it.top?(it.top==='player'?'<span style="color:#6be68b">👑 คุณเป็นผู้นำ!</span>':'ผู้เสนอสูงสุด: <span style="color:'+A.NPC_BY_ID[it.top].color+'">'+A.NPC_BY_ID[it.top].av+' '+esc(A.NPC_BY_ID[it.top].name)+'</span>'):'<span style="color:#b7a77a">ยังไม่มีผู้เสนอราคา</span>';
   $('auMini').innerHTML='ราคาเริ่มต้น '+fmt(it.start)+' · มูลค่าประเมิน '+fmt(it.est)+'<br>เสนอขั้นต่ำ <b style="color:#ffe08a">'+fmt(req)+'</b> · เงินของคุณ '+fmt(m);
   $('auMoney').textContent='💰 '+fmt(m);
   const tm=$('auTm');$('auBar').style.width=Math.min(100,left/(A.CFG.DURATION)*100)+'%';$('auTime').textContent=Math.ceil(left/1000)+' วิ'+(it.ext?' · ขยายเวลา ×'+it.ext:'');tm.classList.toggle('hot',left<=A.CFG.EXT_WINDOW);
   const base=it.bids.length?it.cur:it.start;
   o.querySelectorAll('[data-st]').forEach(b=>{const s=+b.dataset.st,amt=s===0?req:base+s;b.disabled=it.state!=='live'||it.top==='player'||amt<req||amt>m;if(s===0)b.textContent='BID +MIN '+(req-base>0?req.toLocaleString():'')});
   const bm=o.querySelector('[data-min]');bm.disabled=it.state!=='live'||it.top==='player'||req>m;bm.textContent='BID MIN · '+fmt(req);
   $('auNp').innerHTML=ev.parts.map(p=>{const n=A.NPC_BY_ID[p.id];return '<span class="auNp'+(it.wd[p.id]?' wd':'')+(it.top===p.id?' lead':'')+'" style="--nc:'+n.color+'" title="'+esc(n.title+' · '+n.persona)+'"><i>'+n.av+'</i>'+esc(n.name)+'</span>'}).join('');
   if(left<=5000&&left>0&&Math.ceil(left/1000)!==warned){warned=Math.ceil(left/1000);sfx('warn');if(left<=3200&&it.top){em('“เหลือ <b>'+warned+'</b>… ราคา '+fmt(it.cur)+' จาก '+esc(it.topName)+'!”')}}
  };
  const place=async amt=>{
   if(busy||it.state!=='live')return;busy=true;
   try{const r=A.playerBid(ev,it,amt);
    if(!r.ok){U.toast(r.err);return}
    sfx('mine');logAdd('<b style="color:#6be68b">คุณ</b> เสนอ <b>'+fmt(amt)+'</b>');em('“<b>คุณ</b> เสนอ '+fmt(amt)+'! มีใครสู้ไหมคะ?”');
    if(r.ext){ann('+10 วินาที!','');}
   }finally{busy=false;render()}
  };
  o.onclick=e=>{const t=e.target.closest('button');if(!t)return;
   if(t.hasAttribute('data-x')){close();return}
   if(t.disabled)return;
   if(t.hasAttribute('data-min')){place(A.required(it));return}
   if(t.dataset.st!=null){const s=+t.dataset.st,base=it.bids.length?it.cur:it.start;place(s===0?A.required(it):base+s);return}
   if(t.hasAttribute('data-cu')){const v=+String($('auCin').value).replace(/[^0-9]/g,'');if(!v){U.toast('กรอกจำนวนเงิน');return}place(v);$('auCin').value=''}};
  o.onkeydown=e=>{if(e.key==='Enter'&&e.target.id==='auCin'){e.preventDefault();o.querySelector('[data-cu]').click()}e.stopPropagation()};
  const handle=e=>{
   if(e.type==='bid'){const n=A.NPC_BY_ID[e.who];sfx('bid');logAdd('<span style="color:'+n.color+'">'+n.av+' '+esc(n.name)+'</span> เสนอ <b>'+fmt(e.amt)+'</b>');em('“<b>'+esc(n.name)+'</b> เสนอ '+fmt(e.amt)+'! '+(sp&&e.amt>it.start*3?'การแข่งขันดุเดือดมาก!':'')+'”')}
   else if(e.type==='withdraw'){const n=A.NPC_BY_ID[e.who];logAdd('<span style="color:'+n.color+'">'+esc(n.name)+'</span> ถอนตัว')}
  };
  const tick=()=>{
   const now=performance.now(),dt=Math.min(300,now-last);last=now;
   if(phase!=='live'||it.state!=='live')return;
   const ext0=it.ext||0;
   A.step(ev,it,dt).forEach(handle);
   if((it.ext||0)>ext0){ann('+10 วินาที!','');em('“มีการเสนอราคาช่วงท้าย — <b>ขยายเวลาอีก 10 วินาที</b>!”')}
   render();
   saveT+=dt;if(saveT>2500){saveT=0;A.persist(false)}
   if(it.state==='closed'){stop();finishItem()}
  };
  render();timer=setInterval(tick,100);
 }

 /* ----- ผลล็อต ----- */
 function finishItem(){
  phase='res';const r=A.settle(ev,it);const c=card(idx),sp=it.kind==='SPECIAL';
  A.persist(true);sfx('gavel');
  const win=r.res==='player',last3=idx>=2;
  const T=C.TIERS[sp?7:it.kind==='T6'?6:5];
  let body;
  if(win){body='<h1>AUCTION WINNER</h1>'+gCard(c)+'<div class="sub"><b>'+esc(c.name)+'</b> เป็นของคุณแล้ว!<br>ราคาปิด <b style="color:#ffe08a">'+fmt(r.final)+'</b> — หักเงินแล้ว · เงินคงเหลือ <b style="color:#6be68b">'+fmt(C.money())+'</b><br><span class="csNote">เพิ่มเข้าสมุดสะสมเรียบร้อย (มี ×'+C.own(c.id)+')</span></div>'}
  else if(r.res==='npc'){const n=A.NPC_BY_ID[it.winner];body='<h1>SOLD!</h1>'+gCard(c)+'<div class="sub">ผู้ชนะ: <b style="color:'+n.color+'">'+n.av+' '+esc(n.name)+'</b><br>ราคาปิด <b style="color:#ffe08a">'+fmt(r.final)+'</b><br>'+(it.bids.some(b=>b.who==='player')?'คุณถูกแซง — ':'')+'<b>ไม่มีการหักเงินจากคุณ</b> · เงินคงเหลือ '+fmt(C.money())+'<br><span class="csNote">NPC นักสะสมได้การ์ดใบนี้ไปแล้ว</span></div>'}
  else if(r.res==='forfeit'){body='<h1>FORFEIT</h1>'+gCard(c)+'<div class="sub">คุณชนะแต่เงินไม่พอชำระ ฿'+r.final.toLocaleString()+' — ล็อตนี้ถือเป็นโมฆะ ไม่หักเงิน</div>'}
  else{body='<h1>NO SALE</h1>'+gCard(c)+'<div class="sub">ไม่มีผู้เสนอราคาในล็อตนี้</div>'}
  const w=o.querySelector('.auWrap');
  const b=document.createElement('div');b.className='auBanner '+(win?'win':'lose');b.innerHTML=body+'<button class="csBtn gold" data-next>'+(last3?'ดูสรุปงาน ▶':'NEXT AUCTION ▶')+'</button>';
  b.style.setProperty('--tc',T.color);b.style.setProperty('--tg',T.glow+'aa');w.appendChild(b);
  if(win){sfx('win');U.confetti&&U.confetti(sp?160:90);U.burst&&U.burst(innerWidth/2,innerHeight*.4,[T.color,'#fff','#ffd35a'],120,520,1.4,160)}else sfx('lose');
  b.onclick=e=>{const t=e.target.closest('button');if(!t)return;if(t.hasAttribute('data-x')){close();return}if(t.hasAttribute('data-next')){b.remove();if(idx>=2)final();else intro()}};
 }

 /* ----- สรุปงาน ----- */
 function final(){
  stop();phase='fin';const n=A.notice(day);
  ev.status=ev.items.every(x=>x.settled)?'done':ev.status;A.persist(true);
  const nx=A.nextEventDay(day+1);
  shell(topBar('สรุปงานวันที่ '+ev.day)+'<div class="auGrid" style="grid-template-columns:1fr"><div><div class="auEmcee"><b>พิธีกร:</b> “จบการประมูลสำหรับวันนี้ ขอบคุณทุกท่าน! งานครั้งต่อไป <b>วันที่ '+nx+'</b>”</div><div class="auCat" style="margin-top:10px">'+
   ev.items.map((x,i)=>{const c=card(i);const st=x.result==='player'?'<b style="color:#6be68b">คุณชนะ '+fmt(x.final)+'</b>':x.result==='npc'?'ผู้ชนะ: '+esc(A.NPC_BY_ID[x.winner].name)+'<br>ราคาปิด '+fmt(x.final):x.result==='forfeit'?'โมฆะ':'ไม่มีผู้เสนอ';
    return '<div class="auLot"><div style="color:'+kindColor(x.kind)+';font-weight:800">LOT '+(i+1)+' · '+KIND_TH[x.kind]+'</div>'+gCard(c)+'<b>'+esc(c.name)+'</b><br>เริ่มต้น '+fmt(x.start)+'<br>'+st+'</div>'}).join('')+'</div>'+
   '<div class="gaFoot"><button class="csBtn" data-sp>💼 ขาย SPECIAL</button><button class="csBtn" data-hist>📜 ประวัติ</button><button class="csBtn" data-col>📖 สมุดสะสม</button><button class="csBtn red" data-x>ออก</button></div></div></div>','');
  o.hidden=false;
  o.onclick=e=>{const t=e.target.closest('button');if(!t)return;
   if(t.hasAttribute('data-x')){close();return}
   if(t.hasAttribute('data-sp')){o.hidden=true;openSpecialBuyer(()=>{o.hidden=false});return}
   if(t.hasAttribute('data-hist')){o.hidden=true;openHistory(()=>{o.hidden=false});return}
   if(t.hasAttribute('data-col')){o.hidden=true;U.openCollection(()=>{o.hidden=false});return}};
 }

 // เริ่มต้น
 if(ev.items.every(x=>x.settled)){final();return}
 if(ev.items.some(x=>x.state==='live')){catalog();return}
 catalog();
}

/* ============================================================================
 * ขาย SPECIAL ให้นักสะสมพิเศษ (ขั้นต่ำ ฿1,000,000)
 * ========================================================================== */
function openSpecialBuyer(onClose){
 css();const o=U.ov('csSp');const day=C.day();let sel=null;
 const owned=()=>A.specialCards().filter(c=>C.own(c.id)>0);
 const close=()=>{o.hidden=true;if(onClose)onClose();else H().unlock()};
 if(!onClose)H().lock();
 const draw=()=>{
  const own=owned();let h='<div class="csPanel"><button class="csBtn sm csClose" data-x>EXIT ✕</button><div class="gaHead"><h2>💼 SPECIAL COLLECTOR · รับซื้อการ์ด SPECIAL</h2><span class="csMoney">💰 '+fmt(C.money())+'</span></div>'+
   '<div class="bbSum"><b style="color:#ff9be8">นักสะสมพิเศษ:</b> “ผมรับซื้อการ์ด SPECIAL ราคาไม่ต่ำกว่า <b>฿1,000,000</b> ต่อใบ — แต่ละท่านเสนอราคาไม่เท่ากัน เลือกข้อเสนอที่ถูกใจได้เลย (ข้อเสนอรีเฟรชทุกวัน)”</div>';
  if(!own.length)h+='<div class="csNote" style="padding:18px;text-align:center;font-size:14px">คุณยังไม่มีการ์ด SPECIAL<br>SPECIAL มีโอกาสปรากฏในงานประมูลเพียง 2% ต่อหนึ่งงาน</div>';
  else if(!sel)h+=own.map(c=>'<div class="spRow">'+gCard(c)+'<div style="flex:1;min-width:0"><b>'+esc(c.name)+'</b><br><span class="csTag" style="color:#ff9be8">SPECIAL</span><br><span class="csNote">มีอยู่ ×'+C.own(c.id)+' · ราคาประเมิน '+fmt(c.value)+'</span></div><button class="csBtn gold" data-pick="'+c.id+'">ดูข้อเสนอ</button></div>').join('');
  else{
   const c=C.CARD_BY_ID[sel],offs=A.offersFor(sel,day),n=C.own(sel);
   h+='<button class="csBtn sm" data-back>← เลือกการ์ดอื่น</button><div class="spRow" style="margin-top:8px">'+gCard(c)+'<div><b style="font-size:16px">'+esc(c.name)+'</b><br>มีอยู่ <b>×'+n+'</b> · ราคาประเมิน <b style="color:#ffe08a">'+fmt(c.value)+'</b><br><span class="csNote">ราคารับซื้อขั้นต่ำ '+fmt(Math.max(c.sellMin,1000000))+'</span>'+(n===1?'<br><b style="color:#ff9a8a">⚠ นี่คือการ์ดใบสุดท้ายของคุณ — ขายแล้วจะหายไปจากสมุดสะสม</b>':'')+'</div></div>';
   h+=offs.map((f,i)=>{const b=A.NPC_BY_ID[f.npc];return '<div class="spOff'+(f.used?' used':'')+'"><span>'+b.av+' <b style="color:'+b.color+'">'+esc(b.name)+'</b> <span class="csNote">'+esc(b.title)+'</span><br>เสนอซื้อ <b style="color:#6be68b;font-size:15px">'+fmt(f.price)+'</b></span><span>'+(f.used?'<span class="csNote">ขายไปแล้ว</span>':'<button class="csBtn gold sm" data-acc="'+i+'">ACCEPT</button> <button class="csBtn sm" data-dec="'+i+'">DECLINE</button>')+'</span></div>'}).join('');
  }
  o.innerHTML=h+'<div class="gaFoot"><button class="csBtn red" data-x>EXIT</button></div></div>';
 };
 draw();o.hidden=false;let busy=false;
 o.onclick=async e=>{const t=e.target.closest('button');if(!t||busy)return;
  if(t.hasAttribute('data-x')){close();return}
  if(t.dataset.pick){sel=t.dataset.pick;draw();return}
  if(t.hasAttribute('data-back')){sel=null;draw();return}
  if(t.dataset.dec!=null){U.toast('ปฏิเสธข้อเสนอแล้ว');return}
  if(t.dataset.acc!=null){
   busy=true;
   try{
    const i=+t.dataset.acc,c=C.CARD_BY_ID[sel],f=A.offersFor(sel,day)[i],n=C.own(sel),b=A.NPC_BY_ID[f.npc];
    const yes=await U.confirmBox('ขาย <b>'+esc(c.name)+'</b> ให้ '+esc(b.name)+'<br>ราคา <b style="color:#6be68b">'+fmt(f.price)+'</b>'+(n===1?'<br><b style="color:#ff9a8a">นี่คือการ์ดใบสุดท้าย! ขายแล้วจะไม่เหลือใน Collection</b>':'<br><span class="csNote">คุณจะเหลือ ×'+(n-1)+'</span>'),n===1?'ยืนยันขายใบสุดท้าย':'ขายเลย');
    if(!yes)return;
    const r=A.acceptOffer(sel,day,i,n===1);H().save();
    U.toast(r.ok?'ขายแล้ว +'+fmt(r.price)+' · เหลือ ×'+r.left:r.err);
    if(r.ok&&!C.own(sel))sel=null;
   }finally{busy=false;draw()}}
 };
}

/* ============================================================================
 * ประวัติการประมูล
 * ========================================================================== */
function openHistory(onClose){
 css();const o=U.ov('csAh');const a=A.state();if(!onClose)H().lock();
 const hist=a.hist.slice(-40).reverse();
 const cols=Object.keys(a.collectors).map(id=>({n:A.NPC_BY_ID[id],c:a.collectors[id]})).filter(x=>x.n);
 o.innerHTML='<div class="csPanel"><button class="csBtn sm csClose" data-x>ปิด ✕</button><div class="gaHead"><h2>📜 ประวัติการประมูล / การซื้อขาย</h2></div>'+
  (hist.length?'<div class="bbList">'+hist.map(h=>{const c=C.CARD_BY_ID[h.card];if(!c)return '';const sell=h.kind==='SELL';
   return '<div class="bbRow">'+gCard(c)+'<div class="bbMid"><b>'+esc(c.name)+'</b> <span class="csTag" style="color:'+(sell?'#6be68b':kindColor(h.kind))+'">'+(sell?'ขายให้นักสะสม':KIND_TH[h.kind])+'</span><br>วันที่ '+h.day+' · '+(sell?'ผู้ซื้อ: '+esc((A.NPC_BY_ID[h.buyer]||{}).name||'-')+' · ได้รับ <b style="color:#6be68b">'+fmt(h.final)+'</b>':(h.res==='unsold'?'ไม่มีผู้เสนอราคา':'ผู้ชนะ: <b>'+esc(h.winnerName||'-')+'</b> · ราคาปิด '+fmt(h.final)+' (เริ่ม '+fmt(h.start)+')'+(h.res==='player'?' · <b style="color:#6be68b">คุณได้การ์ด</b>':'')))+'</div></div>'}).join('')+'</div>':'<div class="csNote" style="padding:16px;text-align:center">ยังไม่มีประวัติ</div>')+
  (cols.length?'<div class="bbSum" style="margin-top:8px"><b>ฐานข้อมูลนักสะสม NPC:</b><br>'+cols.map(x=>x.n.av+' '+esc(x.n.name)+' — '+x.c.cards.length+' ใบ (ใช้ไป '+fmt(x.c.spent)+')').join('<br>')+'</div>':'')+'<div class="gaFoot"><button class="csBtn red" data-x>ปิด</button></div></div>';
 o.hidden=false;o.onclick=e=>{if(e.target.closest('[data-x]')){o.hidden=true;if(onClose)onClose();else H().unlock()}};
}

/* ============================================================================
 * ไอคอนแจ้งเตือน (UI) + การเปลี่ยนวัน
 * ========================================================================== */
function badge(){let b=document.getElementById('csAucBadge');if(!b){css();b=document.createElement('div');b.id='csAucBadge';document.body.appendChild(b);b.onclick=()=>{const n=A.notice(C.day());
 U.toast(n.kind==='today'?'🔨 วันนี้มีงาน GRAND LEGENDARY AUCTION — ไปที่ฮอลล์ปลายถนนหน้าร้าน CARD SHOP (ขวาสุด) แล้วนั่งที่ที่นั่งผู้เข้าร่วม':n.kind==='tomorrow'?'🔔 พรุ่งนี้ (วันที่ '+n.day+') มีงาน GRAND LEGENDARY AUCTION':'งานประมูลครั้งต่อไป วันที่ '+n.day+' (อีก '+n.in+' วัน)')}}return b}
let lastDayNotified=-1;
function refreshBadge(){
 const b=badge(),x=root.__CEO_CTX,S_=C.state&&C.state();
 let n;try{n=A.notice(C.day())}catch(e){b.classList.remove('on');return}
 const act=x&&x.st&&x.st.active&&x.st.mode==='scene'&&!x.st.sleep;
 const show=act&&x.st.place!=='aucin'&&(n.kind==='today'||n.kind==='tomorrow');
 b.classList.toggle('on',!!show);b.classList.toggle('today',n.kind==='today'&&!n.done);
 if(show)b.textContent=n.kind==='today'?(n.done?'🔨 งานประมูลวันนี้จบแล้ว':'🔨 วันนี้มีงานประมูล! GRAND LEGENDARY AUCTION'):'🔔 พรุ่งนี้มีงานประมูล GRAND LEGENDARY AUCTION';
}
function dayCheck(){
 try{
  if(typeof S==='undefined'||!S||!S.day)return;
  const a=A.state();if(!a)return;
  if(a.lastDay!==S.day){
   const r=A.onDay(S.day);
   const n=A.notice(S.day);
   if(n.kind==='today'&&!n.done)setTimeout(()=>U.toast('🔨 วันนี้มีงาน GRAND LEGENDARY AUCTION! เปิดงานแล้ว'),600);
   else if(n.kind==='tomorrow')setTimeout(()=>U.toast('🔔 พรุ่งนี้มีงาน GRAND LEGENDARY AUCTION'),600);
   const miss=a.notes&&a.notes.length&&a.notes[a.notes.length-1];
   if(miss&&miss.day===S.day&&miss.kind==='missed')setTimeout(()=>U.toast('คุณพลาดงานประมูลวันที่ '+miss.eventDay+' — รอรอบถัดไป'),1800);
  }
  refreshBadge();
 }catch(e){}
}
setInterval(dayCheck,1000);

U.openAuction=openAuction;U.openSpecialBuyer=openSpecialBuyer;U.openAuctionHistory=openHistory;U.refreshAucBadge=refreshBadge;U.aucDayCheck=dayCheck;
root.CS_UI=Object.assign(root.CS_UI||{},U);
})(typeof window!=='undefined'?window:globalThis);

