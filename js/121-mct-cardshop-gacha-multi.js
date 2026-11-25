
/* ===== CARD SHOP — สุ่มรวม ×3 / ×10 (เพิ่มอย่างเดียว) =====
 * - G.buyMulti(packId,n): หักเงิน = ราคา × n ในขั้นตอนเดียว → สุ่ม n ใบ → ลง Collection → บันทึก (ไม่มี pending จึงไม่ค้าง/ไม่หักซ้ำ)
 * - ใช้อัตราสุ่มเดิมของแพ็คทุกประการ (ไม่มีส่วนลด/ไม่มีการันตี) การ์ดซ้ำ "เก็บไว้" เป็นค่าเริ่มต้น กดขายใบซ้ำของรอบนี้ได้จากหน้าสรุป
 * - CS_UI.showMulti(res,{machine}): หน้าเปิดการ์ดรวม + สรุป · ปุ่มเรียกจาก 084 (data-multi="3"/"10")
 * ต้องโหลดต่อจาก 084 (ใส่ท้ายสุดใน index.html) */
(function(root){
'use strict';
const C=root.CARDSHOP,U=root.CS_UI;if(!C||!C.GACHA||!U)return;
const G=C.GACHA,fmt=U.fmt;
const MAX_N=10,HIST_MAX=300;
const gt=c=>G.gt(c);
let lock=false;

function buyMulti(packId,n,rng){
 n=Math.floor(+n);if(!(n>=1&&n<=MAX_N))return {ok:false,err:'จำนวนครั้งไม่ถูกต้อง'};
 const c=G.state(),p=G.GP_BY_ID[packId];
 if(!c||!p)return {ok:false,err:'ไม่พบแพ็คนี้'};
 if(p.soon||!G.poolOf(p).length)return {ok:false,err:'แพ็คนี้ยังไม่มีการ์ด'};
 if(lock)return {ok:false,err:'กำลังสุ่มอยู่'};
 if(c.pending)return {ok:false,err:'ยังมีการ์ดที่สุ่มได้แต่ยังไม่ได้เลือก KEEP / SELL',pending:true};
 if(c.battle&&c.battle.active)return {ok:false,err:'กำลังอยู่ในการแข่งขัน'};
 const total=p.price*n;
 if(C.money()<total)return {ok:false,err:'เงินไม่พอ (ต้องการ ฿'+total.toLocaleString()+')'};
 lock=true;
 try{
  const cards=[];
  for(let i=0;i<n;i++){const card=G.rollGacha(p,rng);if(!card)return {ok:false,err:'ไม่พบการ์ดในแพ็ค'};cards.push(card)}
  C.addMoney(-total);
  const t=Date.now(),items=[],extra={};
  cards.forEach(card=>{
   const e=c.coll[card.id],isNew=!e;
   if(e){e.n++;e.last=t}else c.coll[card.id]={n:1,d:(C.day&&C.day())||1,ts:t,last:t};
   if(!isNew)extra[card.id]=(extra[card.id]||0)+1;
   items.push({card,isNew});
   c.hist.push({t,pack:p.id,card:card.id,tier:gt(card),price:p.price});
   if(gt(card)>=5)c.rare.push({t,card:card.id,pack:p.id,tier:gt(card)});
  });
  if(c.hist.length>HIST_MAX)c.hist.splice(0,c.hist.length-HIST_MAX);
  c.stats.packs+=n;c.stats.spent+=total;
  c.gp[p.id]=(c.gp[p.id]||0)+n;
  try{if(root.save)root.save(1)}catch(e){}
  return {ok:true,pack:p,n,total,items,extra,sold:false};
 }finally{lock=false}
}
/* ขายใบซ้ำที่ได้จากรอบนี้ (คงไว้ ≥1 ใบต่อชนิดเสมอ) — กดซ้ำไม่ขายซ้ำ */
function extraValue(res){let v=0;Object.keys(res.extra).forEach(id=>{const card=C.CARD_BY_ID[id];if(card)v+=G.buyPrice(card)*res.extra[id]});return v}
function sellMulti(res){
 if(!res||res.sold)return {ok:false,err:'ขายไปแล้ว'};
 res.sold=true;let amt=0,cnt=0;
 Object.keys(res.extra).forEach(id=>{const r=G.sell(id,res.extra[id]);if(r&&r.ok){amt+=r.amt;cnt+=r.qty}});
 return cnt?{ok:true,amt,cnt}:{ok:false,err:'ไม่มีใบซ้ำให้ขาย'};
}
G.buyMulti=buyMulti;G.sellMulti=sellMulti;G.multiExtraValue=extraValue;

/* ---------- UI ---------- */
const CSS=`
#csGm{flex-direction:column;gap:8px;padding:8px;overflow:auto}
#csGm .gmTop{text-align:center;color:#ffd96b;font-weight:800;font-size:clamp(14px,2.4vw,20px)}
#csGm .gmTop small{display:block;color:#b9c2e6;font-weight:600;font-size:12px}
#csGm .gmGrid{display:grid;gap:clamp(4px,1vw,10px);width:100%;margin:0 auto}
#csGm .gmC{position:relative;opacity:0;transform:translateY(12px) scale(.6) rotateY(90deg);transition:transform .45s cubic-bezier(.2,.9,.2,1.2),opacity .25s}
#csGm .gmC.on{opacity:1;transform:none}
#csGm .gmC .csCard{width:100%}
#csGm .gmC .cnt{display:none}
#csGm .gmC .gmB{position:absolute;left:50%;bottom:-7px;transform:translateX(-50%);font-size:10px;font-weight:800;padding:1px 7px;border-radius:9px;white-space:nowrap;z-index:2;box-shadow:0 1px 4px #000a}
#csGm .gmC .gmB.n{background:#ffd96b;color:#3a2a00}#csGm .gmC .gmB.d{background:#39406b;color:#dfe5ff}
#csGm .gmC.hi{z-index:3}
#csGm .gmSum{display:none;flex-direction:column;align-items:center;gap:6px;text-align:center;font-size:13px;color:#e6e9ff}
#csGm .gmSum.on{display:flex}
#csGm .gmTier{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}
#csGm .gmBtns{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
@media (max-height:430px){#csGm{gap:4px;padding:4px}#csGm .gmSum{font-size:11px;gap:3px}}
`;
function css(){U.css();if(!document.getElementById('csGmCss')){const s=document.createElement('style');s.id='csGmCss';s.textContent=CSS;document.head.appendChild(s)}}

function showMulti(res,o){
 css();o=o||{};
 return new Promise(resolve=>{
  const ov=U.ov('csGm');
  const n=res.n,cols=n<=5?n:5,rows=Math.ceil(n/cols);
  const best=res.items.reduce((a,b)=>gt(b.card)>gt(a.card)?b:a,res.items[0]);
  const bt=gt(best.card),BT=C.TIERS[bt];
  const newN=res.items.filter(x=>x.isNew).length;
  const tc={};res.items.forEach(x=>{const t=gt(x.card);tc[t]=(tc[t]||0)+1});
  /* กว้างสูงสุดให้พอดีความสูงจอ: การ์ดแนวตั้ง สูง≈1.4×กว้าง */
  const maxW='min(96vw,calc((100vh - 150px)/'+rows+'/1.42*'+cols+'),'+(cols*150)+'px)';
  ov.hidden=false;
  ov.innerHTML='<div class="gmTop">🎰 '+res.pack.name+' · สุ่ม ×'+n+'<small>ใช้เงิน ฿'+fmt(res.total)+'</small></div>'+
   '<div class="gmGrid" id="gmGrid" style="grid-template-columns:repeat('+cols+',1fr);max-width:'+maxW+'">'+
   res.items.map((x,i)=>'<div class="gmC" data-i="'+i+'">'+U.cardEl(x.card,{force:true})+'<span class="gmB '+(x.isNew?'n':'d')+'">'+(x.isNew?'NEW':'ซ้ำ')+'</span></div>').join('')+'</div>'+
   '<div class="gmSum" id="gmSum"><div class="gmTier">'+Object.keys(tc).sort((a,b)=>b-a).map(t=>'<span class="csTag" style="color:'+C.TIERS[t].color+'">T'+t+' ×'+tc[t]+'</span>').join('')+'</div>'+
   '<div>การ์ดใหม่ <b style="color:#ffd96b">'+newN+'</b> ใบ · ใบซ้ำ <b>'+(n-newN)+'</b> ใบ (เก็บไว้ในสมุดแล้ว)</div>'+
   '<div class="gmBtns"><button class="csBtn gold" data-k>เก็บทั้งหมด ✔</button><button class="csBtn red" data-s hidden></button></div></div>'+
   '<button class="csBtn sm" id="gmSk" style="align-self:center">ข้าม ⏭</button>';
  const cells=[].slice.call(ov.querySelectorAll('.gmC')),sum=ov.querySelector('#gmSum'),sk=ov.querySelector('#gmSk'),sb=ov.querySelector('[data-s]');
  const ev=extraValue(res);
  if(ev>0){sb.hidden=false;sb.textContent='ขายใบซ้ำทั้งหมด +'+fmt(ev)}
  let skipped=false,done=false;
  const fin=()=>{if(done)return;done=true;sk.style.display='none';sum.classList.add('on')};
  const fx=(el,t)=>{try{const r=el.getBoundingClientRect(),T=C.TIERS[t];
   U.burst(r.left+r.width/2,r.top+r.height/2,t===6?['#ff4d4d','#ffd24d','#4dff88','#4dc9ff','#b04dff','#fff']:[T.color,'#fff',T.glow],t===6?160:t===5?110:60,t>=5?520:380,1.2,160);
   if(t===6)U.confetti&&U.confetti(60);else if(t===5)U.confetti&&U.confetti(30)}catch(e){}};
  sk.onclick=()=>{skipped=true};
  (async()=>{
   for(let i=0;i<cells.length;i++){
    const t=gt(res.items[i].card);
    cells[i].classList.add('on');if(t>=4)cells[i].classList.add('hi');
    if(!skipped&&t>=4)fx(cells[i],t);
    if(!skipped)await U.sleep(t>=5?420:t>=4?300:170);
   }
   fin();
  })();
  ov.onclick=e=>{
   const b=e.target.closest('[data-k],[data-s]');if(!b)return;
   if(b.hasAttribute('data-s')){
    b.disabled=true;const r=sellMulti(res);
    try{if(root.save)root.save(1)}catch(_){}
    U.toast(r.ok?'ขายใบซ้ำ '+r.cnt+' ใบ ได้ +'+fmt(r.amt):(r.err||'ขายไม่สำเร็จ'));
    if(r.ok){sb.hidden=true}return;
   }
   ov.hidden=true;resolve(res);
  };
 });
}
U.showMulti=showMulti;U.MULTI_OPTIONS=[3,10];
})(window);
