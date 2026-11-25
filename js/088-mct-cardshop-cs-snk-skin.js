
/* ============================================================================
 * SNOOKER SKIN SHOP — ทะเบียนสกิน (registry) · ซื้อ/ติดตั้ง/บันทึก · Preview · My Skin Collection · เอฟเฟกต์
 *  - เพิ่มสกินใหม่: SNOOKER.SKIN.register({...}) บรรทัดเดียว (ระบบร้าน/ซื้อ/คอลเลกชัน/เซฟใช้ร่วมกันหมด)
 *  - ภาพ (sprite) แยกจากฟิสิกส์ 100%: โมดูลนี้ไม่แตะ K.R / มวล / แรงเสียดทาน / ความเร็ว
 *  - ใช้เงินเดิม (SNOOKER.money/addMoney) และเซฟเดิม (SNOOKER.save → save(1))
 * ========================================================================== */
(function(root){
'use strict';
const SN=root.SNOOKER,U=root.CS_UI;
if(!SN||!U)return;
const fmt=n=>'฿'+Math.round(n).toLocaleString();
const esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const SPR=root.SNK_SKINS||{};
const KEYS=['W','R','Y','G','N','B','P','K'];
const BALLINFO={W:['ลูกขาว (Cue Ball)','ลูกที่ใช้แทง — ไม่มีคะแนน',1],R:['ลูกแดง','1 คะแนน · 15 ลูก',15],Y:['ลูกเหลือง','2 คะแนน',1],G:['ลูกเขียว','3 คะแนน',1],N:['ลูกน้ำตาล','4 คะแนน',1],B:['ลูกน้ำเงิน','5 คะแนน',1],P:['ลูกชมพู','6 คะแนน',1],K:['ลูกดำ','7 คะแนน',1]};
const PRICE=4000;

/* ---------- ทะเบียนสกิน ---------- */
const REG=[];
function register(d){
 if(!d||!d.id||REG.some(x=>x.id===d.id))return false;
 const def=Object.assign({price:PRICE,available:true,category:'Standard',desc:'',effects:{kind:'none',colors:['#fff']},sprites:null,preview:'W'},d);
 def.hasSprites=!!(def.sprites&&KEYS.every(k=>def.sprites[k]));
 if(!def.hasSprites)def.available=false;   // ไม่มี sprite ครบ 22 ลูก (8 แบบ) = ยังไม่เปิดขาย
 REG.push(def);return true}
const get=id=>REG.find(x=>x.id===id)||null;
const spr=(id)=>{const m=SPR[id];return m?Object.fromEntries(KEYS.map(k=>[k,m[k]])):null};
register({id:'celestial',name:'Celestial Collection',category:'Celestial',th:'พระอาทิตย์และดวงจันทร์',
 desc:'ลวดลายทองบนผิวลูกแบบเทพนิยาย — ลูกเหลืองคือดวงอาทิตย์ ลูกน้ำเงินคือจันทร์เสี้ยวเหนือเมฆ ลูกดำคือสุริยุปราคา ส่วนลูกแดงทั้ง 15 ลูกมีตราอาทิตย์-จันทร์ทอง',
 sprites:spr('celestial'),preview:'Y',effects:{kind:'celestial',colors:['#ffd96b','#fff4c2','#bcd4ff'],label:'ประกายแสงสีทอง · แสงจันทร์และละอองดาว'}});
register({id:'anime',name:'Anime Collection',category:'Anime',th:'ตัวละครอนิเมะ',
 desc:'ตัวละครอนิเมะตัวเอกประจำสีของแต่ละลูก — คู่รักสุริยะ-จันทรา บนลูกขาว หนุ่มผมทองบนลูกเหลือง สาวผมเขียว หนุ่มผมเงิน สาวผมน้ำเงิน สาวผมชมพู และนักรบสุริยุปราคาบนลูกดำ',
 sprites:spr('anime'),preview:'P',effects:{kind:'anime',colors:['#ff9bd6','#9bd0ff','#ffe08a'],label:'ออร่าพลังงานรอบลูก'}});
register({id:'dragon',name:'Dragon Soul Collection',category:'Dragon',th:'มังกร',
 desc:'วิญญาณมังกรทั้งเจ็ดสี ขดตัวอยู่ในลูก — มังกรขาวแห่งแสง มังกรทอง มังกรเขียวหยก มังกรน้ำตาลภูผา มังกรน้ำแห่งคลื่น มังกรซากุระ และมังกรดำสุริยุปราคา ส่วนลูกแดงคือมังกรเพลิงเหนือพระจันทร์',
 sprites:spr('dragon'),preview:'B',effects:{kind:'dragon',colors:['#ff7a2a','#ffd36b','#ff3d1f'],label:'เปลวไฟและเกล็ดมังกร'}});
register({id:'future',name:'Future Collection',category:'Future',th:'คอลเลกชันใหม่ ๆ ในอนาคต',desc:'ช่องว่างสำหรับสกินชุดใหม่ — นักพัฒนาเพิ่มได้ด้วย SNOOKER.SKIN.register() โดยไม่ต้องแก้ระบบร้านค้า',sprites:null,available:false});

/* ---------- ข้อมูล/เซฟ (อยู่ใน S.snooker.skins) ---------- */
function sig(id,day,price){let h=2166136261;const s=id+'|'+day+'|'+price+'|snk-skin-v1';for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36)}
function data(){
 const s=SN.state();if(!s)return {owned:{},equipped:null,log:[]};
 if(!s.skins||typeof s.skins!=='object')s.skins={owned:{},equipped:null,log:[]};
 const k=s.skins;if(!k.owned||typeof k.owned!=='object')k.owned={};if(!Array.isArray(k.log))k.log=[];
 // ป้องกันแก้เซฟเพื่อรับสกินฟรี: เจ้าของต้องมีลายเซ็นของธุรกรรมซื้อที่ตรงกัน ไม่งั้นถูกเพิกถอน
 for(const id of Object.keys(k.owned)){const o=k.owned[id];if(!o||!get(id)||o.sig!==sig(id,o.day,o.price)){delete k.owned[id]}}
 if(k.equipped&&(!k.owned[k.equipped]||!get(k.equipped)))k.equipped=null;
 return k}
const owned=id=>!!data().owned[id];
const equippedId=()=>data().equipped;
const equipped=()=>{const id=equippedId();return id?get(id):null};
let buying=false;
function buy(id){
 const d=get(id);if(!d)return {ok:false,err:'ไม่พบสกินนี้'};
 if(!d.available)return {ok:false,err:'สกินนี้ยังไม่เปิดขาย'};
 if(buying)return {ok:false,err:'กำลังดำเนินการ'};
 buying=true;
 try{
  const k=data();
  if(k.owned[id])return {ok:false,err:'คุณเป็นเจ้าของสกินนี้แล้ว'};
  if(SN.money()<d.price)return {ok:false,err:'เงินไม่พอ (ต้องมี '+fmt(d.price)+')'};
  SN.addMoney(-d.price);
  const day=SN.day();k.owned[id]={day,price:d.price,ts:Date.now(),sig:sig(id,day,d.price)};
  k.log.push({id,name:d.name,price:d.price,day,ts:Date.now()});
  SN.save();return {ok:true,def:d}
 }finally{buying=false}}
function equip(id){
 const k=data();
 if(id===null||id==='standard'){k.equipped=null;SN.save();return {ok:true}}
 if(!k.owned[id])return {ok:false,err:'ยังไม่ได้เป็นเจ้าของสกินนี้'};
 k.equipped=id;SN.save();return {ok:true}}
/* sprite (Image) ที่ตารางใช้ — undefined = สกินมาตรฐาน */
const IMGS={};
function ballSprite(key){
 const d=equipped();if(!d||!d.sprites)return null;
 const u=d.sprites[key];if(!u)return null;const ik=d.id+key;
 if(!IMGS[ik]){const i=new Image();i.src=u;IMGS[ik]=i}return IMGS[ik]}
function imgOf(d,key){const ik=d.id+key;if(!IMGS[ik]){const i=new Image();i.src=d.sprites[key];IMGS[ik]=i}return IMGS[ik]}

/* ---------- เอฟเฟกต์ (ภาพล้วน ๆ ไม่ส่งผลฟิสิกส์ ไม่บังลูก) ---------- */
const FX={P:[],t:0,acc:0};
function spawn(kind,x,y,o){
 o=o||{};const c=(U._skCol||['#fff']);
 const rnd=Math.random,col=o.cols||c;
 FX.P.push(Object.assign({x,y,vx:(rnd()-.5)*30,vy:-10-rnd()*24,life:0,max:1+rnd()*1.2,s:2+rnd()*3,col:col[(rnd()*col.length)|0],shape:'spark',rot:rnd()*6,vr:(rnd()-.5)*4},o))}
function emitFor(kind,cols,x,y,w,h,strength){
 // สร้างอนุภาครอบบริเวณ (x,y,w,h)
 const rnd=Math.random,px=x+rnd()*w,py=y+rnd()*h;
 if(kind==='celestial'){if(rnd()<.5)spawn(kind,px,py,{cols,shape:'star',vx:(rnd()-.5)*10,vy:-4-rnd()*10,s:3+rnd()*4,max:1.6+rnd()});else spawn(kind,px,py,{cols:['#bcd4ff','#e8f0ff'],shape:'dust',vx:(rnd()-.5)*8,vy:-3-rnd()*6,s:1.4+rnd()*2,max:2.2})}
 else if(kind==='anime'){spawn(kind,px,py,{cols,shape:'aura',vx:(rnd()-.5)*14,vy:-8-rnd()*14,s:5+rnd()*9,max:1.4+rnd()*.8})}
 else if(kind==='dragon'){if(rnd()<.62)spawn(kind,px,py,{cols,shape:'ember',vx:(rnd()-.5)*18,vy:-22-rnd()*30,s:2+rnd()*3.2,max:1.2+rnd()*1.1});else spawn(kind,px,py,{cols:['#ffd36b','#ffe9a8'],shape:'scale',vx:(rnd()-.5)*12,vy:-6-rnd()*10,s:3+rnd()*3,max:1.6+rnd()})}
}
function fxStep(dt){
 for(const p of FX.P){p.life+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;if(p.grav)p.vy+=p.grav*dt}
 FX.P=FX.P.filter(p=>p.life<p.max);if(FX.P.length>420)FX.P.splice(0,FX.P.length-420)}
function fxDraw(g,alpha){
 g.save();g.globalCompositeOperation='lighter';
 for(const p of FX.P){const k=p.life/p.max,a=(k<.2?k/.2:1-(k-.2)/.8)*(alpha==null?1:alpha);if(a<=0)continue;g.globalAlpha=Math.min(1,a*.85);g.fillStyle=p.col;g.strokeStyle=p.col;
  if(p.shape==='star'){g.save();g.translate(p.x,p.y);g.rotate(p.rot);g.beginPath();for(let i=0;i<4;i++){g.rotate(Math.PI/2);g.moveTo(0,0);g.lineTo(p.s*1.7,0);g.lineTo(p.s*.3,p.s*.3)}g.fill();g.restore()}
  else if(p.shape==='aura'){const gr=g.createRadialGradient(p.x,p.y,0,p.x,p.y,p.s*1.6);gr.addColorStop(0,p.col);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.beginPath();g.arc(p.x,p.y,p.s*1.6,0,7);g.fill()}
  else if(p.shape==='ember'){g.beginPath();g.ellipse(p.x,p.y,p.s*.7,p.s*1.2,0,0,7);g.fill()}
  else if(p.shape==='scale'){g.save();g.translate(p.x,p.y);g.rotate(p.rot);g.beginPath();g.moveTo(0,-p.s);g.lineTo(p.s*.8,0);g.lineTo(0,p.s);g.lineTo(-p.s*.8,0);g.closePath();g.fill();g.restore()}
  else if(p.shape==='ring'){g.lineWidth=2;g.beginPath();g.arc(p.x,p.y,p.s+k*p.grow,0,7);g.stroke()}
  else{g.beginPath();g.arc(p.x,p.y,p.s*.5,0,7);g.fill()}}
 g.restore()}
/* ระเบิดเล็ก ๆ ที่หลุม เมื่อลูกลงหลุม (ธีมตามสกินที่ติดตั้ง) */
function potBurst(x,y){
 const d=equipped();if(!d||!d.effects||d.effects.kind==='none')return;const cols=d.effects.colors,k=d.effects.kind;
 for(let i=0;i<16;i++){const a=Math.random()*6.283,sp=26+Math.random()*60;
  spawn(k,x,y,{cols,shape:k==='celestial'?(i%2?'star':'dust'):k==='anime'?'aura':(i%3?'ember':'scale'),vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-10,s:k==='anime'?4+Math.random()*6:2+Math.random()*3,max:.7+Math.random()*.7,grav:k==='dragon'?-20:20})}
 FX.P.push({x,y,vx:0,vy:0,life:0,max:.7,s:6,grow:34,col:cols[0],shape:'ring'})}
/* พื้นหลังบางเบาบนขอบไม้ของโต๊ะ — ไม่วาดทับพื้นสักหลาด (จึงไม่บังลูก/เส้นเล็ง) */
function ambient(g,dt,L){
 const d=equipped();FX.t+=dt;
 if(d&&d.effects&&d.effects.kind!=='none'&&L){FX.acc+=dt*6;while(FX.acc>1){FX.acc-=1;
   const side=(Math.random()*4)|0,rx=L.tx,ry=L.ty,rw=L.tw,rh=L.th,b=Math.max(6,L.bw);
   const R=side===0?[rx,ry,rw,b]:side===1?[rx,ry+rh-b,rw,b]:side===2?[rx,ry,b,rh]:[rx+rw-b,ry,b,rh];
   emitFor(d.effects.kind,d.effects.colors,R[0],R[1],R[2],R[3])}}
 fxStep(dt);fxDraw(g,.7)}

/* ============================================================================
 * UI
 * ========================================================================== */
const CSS=`
#snkSkin{z-index:99997}
.ssP{position:relative;width:min(1180px,98vw);max-height:96vh;overflow:auto;margin:auto;background:linear-gradient(180deg,#1a1230,#0d0a18);border:2px solid #c9a24a;border-radius:14px;padding:12px 14px;color:#f3e9d0}
.ssP h2{margin:0;font-size:clamp(15px,2.4vw,22px);color:#ffd96b;letter-spacing:.5px}
.ssHead{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding-right:92px;margin-bottom:6px}.ssHead .csMoney{margin-left:auto}
.ssTabs{display:flex;gap:6px;margin:6px 0 10px;flex-wrap:wrap}
.ssTab{padding:6px 14px;border-radius:99px;border:1px solid #6b5a2c;background:#1c1530;color:#d9c89a;font-weight:800;font-size:12px;cursor:pointer}.ssTab.on{background:#c9a24a;color:#1a1008}
.ssGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:12px}
.ssCard{position:relative;background:linear-gradient(180deg,#241a40,#140f26);border:2px solid #4a3a70;border-radius:14px;padding:10px;display:flex;flex-direction:column;gap:7px;overflow:hidden}
.ssCard.own{border-color:#3ddc84}.ssCard.eq{border-color:#ffd96b;box-shadow:0 0 18px #ffd96b66}.ssCard.off{opacity:.78;border-style:dashed}
.ssCard:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 0,var(--sc,#fff2) 0,transparent 62%);opacity:.35;pointer-events:none}
.ssHero{position:relative;height:118px;display:flex;align-items:center;justify-content:center;gap:0}
.ssHero img{width:92px;height:92px;object-fit:contain;filter:drop-shadow(0 6px 8px #000a);margin:0 -10px;transition:transform .25s}
.ssCard:hover .ssHero img{transform:translateY(-4px) rotate(-3deg)}.ssHero img:nth-child(2){z-index:2;width:108px;height:108px}
.ssName{font:900 16px/1.2 sans-serif;color:#fff}.ssTh{font-size:12px;color:#d9c89a}
.ssDesc{font-size:12px;line-height:1.45;color:#cdbfe6;min-height:70px}
.ssStrip{display:flex;gap:2px;justify-content:center}.ssStrip img{width:28px;height:28px;object-fit:contain}
.ssFx{font-size:11px;color:#9fe3ff}
.ssPrice{font:900 18px/1 'Courier New',monospace;color:#ffd96b}
.ssBadge{position:absolute;right:8px;top:8px;z-index:3;padding:2px 9px;border-radius:99px;font:900 10px sans-serif;background:#222;color:#bbb}
.ssBadge.own{background:#1f8a4a;color:#fff}.ssBadge.eq{background:#ffd96b;color:#2a1a00}.ssBadge.off{background:#555;color:#ddd}
.ssBtns{display:flex;gap:6px;flex-wrap:wrap}.ssBtns .csBtn{flex:1;min-width:92px;min-height:34px;font-size:12px}
.ssBox{background:#120d22;border:1px solid #4a3a70;border-radius:10px;padding:10px;font-size:13px}
.ssTbl{width:100%;border-collapse:collapse;font-size:12px}.ssTbl td,.ssTbl th{padding:4px 6px;border-bottom:1px solid #35295a;text-align:left}.ssTbl th{color:#b7a77a}
.ssCount{font:900 20px/1 sans-serif;color:#ffd96b}
/* preview */
.ssPv{display:grid;grid-template-columns:minmax(0,1fr) 260px;gap:10px}
.ssCv{position:relative;height:min(62vh,520px);min-height:260px;border-radius:12px;background:radial-gradient(ellipse at 50% 40%,#2a5c36,#0f2a19 80%);border:2px solid #6b4a1c;overflow:hidden;touch-action:none;cursor:grab}
.ssCv canvas{position:absolute;inset:0;width:100%;height:100%}
.ssInfo{display:flex;flex-direction:column;gap:8px}
.ssInfo .big{width:150px;height:150px;margin:0 auto;display:block;object-fit:contain;filter:drop-shadow(0 8px 10px #000a)}
.ssCtl{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:6px}.ssCtl input[type=range]{flex:1;min-width:100px}
.ssTry{position:absolute;left:8px;top:8px;z-index:3;padding:3px 10px;border-radius:8px;background:#000a;border:1px solid #ffd96b;color:#ffe9a8;font:800 11px sans-serif;pointer-events:none}
@media (max-width:760px),(max-height:430px){.ssPv{grid-template-columns:1fr}.ssGrid{grid-template-columns:1fr 1fr}.ssDesc{min-height:0;font-size:11px}.ssHero{height:92px}.ssHero img{width:68px;height:68px}.ssHero img:nth-child(2){width:80px;height:80px}.ssCv{height:46vh}}
@media (max-width:520px){.ssGrid{grid-template-columns:1fr}}`;
function css(){U.css();if(!document.getElementById('ssCss')){const s=document.createElement('style');s.id='ssCss';s.textContent=CSS;document.head.appendChild(s)}}

function cardHtml(d,mode){
 const k=data(),isO=!!k.owned[d.id],isE=k.equipped===d.id;
 const cls='ssCard'+(isE?' eq':isO?' own':'')+(d.available?'':' off');
 const col=d.effects&&d.effects.colors?d.effects.colors[0]:'#9a8cc8';
 let hero='',strip='';
 if(d.hasSprites){const im=key=>'<img src="'+d.sprites[key]+'" alt="">';hero=im('W')+im(d.preview)+im('K');strip=['W','R','Y','G','N','B','P','K'].map(im).join('')}
 else hero='<div style="font-size:54px;opacity:.5">🔒</div>';
 const badge=isE?'<span class="ssBadge eq">กำลังติดตั้ง</span>':isO?'<span class="ssBadge own">เป็นเจ้าของแล้ว</span>':d.available?'':'<span class="ssBadge off">เร็ว ๆ นี้</span>';
 let btns='';
 if(!d.available)btns='<button class="csBtn" disabled>เร็ว ๆ นี้</button>';
 else{
  btns='<button class="csBtn" data-prev="'+d.id+'">👁 ทดลองดู</button>';
  if(!isO)btns+='<button class="csBtn gold" data-buy="'+d.id+'">🛒 ซื้อ '+fmt(d.price)+'</button>';
  else btns+=isE?'<button class="csBtn" data-unequip="1">↩ ถอดสกิน</button>':'<button class="csBtn gold" data-equip="'+d.id+'">✔ ติดตั้ง</button>';
 }
 return '<div class="'+cls+'" style="--sc:'+col+'">'+badge+'<div class="ssHero">'+hero+'</div><div><div class="ssName">'+esc(d.name)+'</div><div class="ssTh">ธีม: '+esc(d.th||'')+' · '+esc(d.category)+'</div></div>'+
  '<div class="ssDesc">'+esc(d.desc)+'</div>'+(d.hasSprites?'<div class="ssStrip">'+strip+'</div>':'')+(d.effects&&d.effects.label?'<div class="ssFx">✨ เอฟเฟกต์: '+esc(d.effects.label)+'</div>':'')+
  '<div style="display:flex;align-items:center;justify-content:space-between"><span class="ssPrice">'+(d.available?fmt(d.price):'—')+'</span><span class="csNote">'+(isO?'ซื้อแล้ว ถาวร':d.available?'22 ลูกครบชุด':'')+'</span></div><div class="ssBtns">'+btns+'</div></div>'}

function openSkin(opts){
 opts=opts||{};css();const o=U.ov('snkSkin');if(!opts.onClose)U.hooks.lock();
 let tab=opts.tab||'shop',busy=false;
 const close=()=>{o.hidden=true;if(opts.onClose)opts.onClose();else U.hooks.unlock()};
 const draw=()=>{
  const k=data(),avail=REG.filter(d=>d.available),own=avail.filter(d=>k.owned[d.id]).length,eq=equipped();
  let h='<div class="ssP"><button class="csBtn sm csClose" data-x>EXIT ✕</button><div class="ssHead"><h2>🎨 SNOOKER SKIN SHOP</h2><span class="csTag">Premium · '+fmt(PRICE)+' ต่อชุด · เป็นเจ้าของถาวร</span><span class="csMoney">💰 '+fmt(SN.money())+'</span></div>';
  h+='<div class="ssTabs"><button class="ssTab'+(tab==='shop'?' on':'')+'" data-tab="shop">🛍 ร้านค้า</button><button class="ssTab'+(tab==='mine'?' on':'')+'" data-tab="mine">📚 My Skin Collection ('+own+'/'+avail.length+')</button></div>';
  if(tab==='shop'){h+='<div class="ssGrid">'+REG.map(d=>cardHtml(d)).join('')+'</div>'}
  else{
   h+='<div class="ssBox" style="margin-bottom:10px"><div class="ssCount">'+own+' / '+avail.length+' Collections Owned</div><div class="csNote">กำลังติดตั้ง: <b style="color:#ffd96b">'+(eq?esc(eq.name):'สกินมาตรฐาน')+'</b> · ใช้กับทุกโต๊ะ ทั้งแข่งกับ NPC และเล่นปกติ</div>'+
    '<div class="ssBtns" style="margin-top:8px"><button class="csBtn'+(eq?'':' gold')+'" data-unequip="1" '+(eq?'':'disabled')+'>'+(eq?'↩ กลับไปใช้สกินมาตรฐาน':'✔ ใช้สกินมาตรฐานอยู่')+'</button></div></div>';
   h+='<div class="ssGrid">'+REG.map(d=>cardHtml(d)).join('')+'</div>';
   h+='<div class="ssBox" style="margin-top:10px"><b>ประวัติการซื้อ</b>'+(k.log.length?'<table class="ssTbl"><tr><th>วัน</th><th>สกิน</th><th>ราคา</th></tr>'+k.log.slice().reverse().map(r=>'<tr><td>วันที่ '+r.day+'</td><td>'+esc(r.name)+'</td><td>'+fmt(r.price)+'</td></tr>').join('')+'</table>':'<div class="csNote" style="padding:8px">ยังไม่เคยซื้อสกิน</div>')+'</div>';
  }
  o.innerHTML=h+'</div>'};
 draw();o.hidden=false;
 o.onclick=async e=>{const t=e.target.closest('button');if(!t||busy)return;
  if(t.hasAttribute('data-x')){close();return}
  if(t.dataset.tab){tab=t.dataset.tab;draw();return}
  if(t.dataset.prev){o.hidden=true;openPreview(t.dataset.prev,()=>{o.hidden=false;draw()});return}
  if(t.dataset.equip){const r=equip(t.dataset.equip);U.toast(r.ok?'ติดตั้งสกิน '+get(t.dataset.equip).name+' แล้ว':r.err);draw();return}
  if(t.hasAttribute('data-unequip')){equip(null);U.toast('กลับไปใช้สกินมาตรฐานแล้ว');draw();return}
  if(t.dataset.buy){
   const d=get(t.dataset.buy);if(!d)return;busy=true;
   try{
    if(owned(d.id)){U.toast('คุณเป็นเจ้าของสกินนี้แล้ว');return}
    if(SN.money()<d.price){U.toast('เงินไม่พอ — ต้องมี '+fmt(d.price)+' (มี '+fmt(SN.money())+')');return}
    const ok=await U.confirmBox('ซื้อสกิน <b>'+esc(d.name)+'</b><br>ราคา <b style="color:#ffd96b">'+fmt(d.price)+'</b> · เป็นเจ้าของถาวร<br><span class="csNote">เงินคงเหลือหลังซื้อ '+fmt(SN.money()-d.price)+'</span>','ยืนยันซื้อ');
    if(!ok)return;
    const r=buy(d.id);   // ตรวจเงิน/ความเป็นเจ้าของซ้ำอีกครั้งภายใน buy() และมีตัวกันกดซ้ำ
    U.toast(r.ok?'🎉 ซื้อสำเร็จ! '+d.name+' (-'+fmt(d.price)+')':r.err);
    if(r.ok&&U.confetti)U.confetti(60);
   }finally{busy=false;draw()}}
 }}

/* ---------- Preview: 22 ลูก · หมุน · ซูม · รายละเอียด · เอฟเฟกต์ ---------- */
function openPreview(id,onBack){
 const d=get(id);if(!d||!d.hasSprites)return;css();
 const o=U.ov('snkSkinPv');o.style.zIndex=99998;
 const col=k=>BALLINFO[k];
 o.innerHTML='<div class="ssP"><button class="csBtn sm csClose" data-x>← กลับ</button><div class="ssHead"><h2>👁 Preview — '+esc(d.name)+'</h2><span class="csTag" style="color:#ffd96b">ทดลองดูเท่านั้น · ยังไม่ได้เป็นเจ้าของ</span></div>'+
  '<div class="ssPv"><div class="ssCv" id="ssCv"><canvas></canvas><div class="ssTry">ลากเพื่อหมุน · ล้อเมาส์/ปุ่มเพื่อซูม · แตะลูกเพื่อดูรายละเอียด</div></div>'+
  '<div class="ssInfo"><div class="ssBox" id="ssInfoBox"></div><div class="ssBox"><b>ควบคุม</b><div class="ssCtl"><button class="csBtn sm" data-z="-1">➖</button><input type="range" id="ssZ" min="60" max="260" value="100"><button class="csBtn sm" data-z="1">➕</button></div>'+
  '<div class="ssCtl"><button class="csBtn sm" id="ssAuto">⟳ หมุนอัตโนมัติ: เปิด</button><button class="csBtn sm" id="ssFx">✨ เอฟเฟกต์: เปิด</button></div></div>'+
  '<div class="ssBtns">'+(owned(id)?(equippedId()===id?'<button class="csBtn" disabled>กำลังติดตั้งอยู่</button>':'<button class="csBtn gold" data-eq="'+id+'">✔ ติดตั้ง</button>'):'<button class="csBtn gold" data-buy="'+id+'">🛒 ซื้อ '+fmt(d.price)+'</button>')+'</div></div></div></div>';
 o.hidden=false;
 const cv=o.querySelector('canvas'),g=cv.getContext('2d'),box=o.querySelector('#ssCv');
 let alive=true,rot=0,vr=.35,auto=true,fxOn=true,zoom=1,sel='R',dragX=null,W=0,H=0,dpr=1,t0=performance.now(),last=t0,hit=[];
 const info=()=>{const b=col(sel);o.querySelector('#ssInfoBox').innerHTML='<img class="big" src="'+d.sprites[sel]+'" alt=""><div style="text-align:center"><b style="font-size:15px">'+b[0]+'</b><br><span class="csNote">'+b[1]+' · จำนวน '+(sel==='R'?'15':'1')+' ลูก</span></div><div class="csNote" style="margin-top:6px">สกิน: '+esc(d.name)+'<br>ขนาดลูก/น้ำหนัก/แรงเสียดทานเท่ากับสกินมาตรฐาน — ต่างกันเฉพาะลวดลาย</div>'};
 info();
 U._skCol=d.effects.colors;
 function resize(){const r=box.getBoundingClientRect();dpr=Math.min(2,devicePixelRatio||1);W=r.width;H=r.height;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr)}
 resize();const rz=()=>resize();window.addEventListener('resize',rz);
 // ผังลูก 22 ลูก: สามเหลี่ยมแดง 15 + สี 6 + ขาว 1 (ตำแหน่งแบบ unit)
 function layout(){
  const P=[];const R=1;const dx=2*R*.866,dy=2*R;
  for(let c=0;c<5;c++)for(let r=0;r<=c;r++)P.push({k:'R',x:4.2+c*dx,y:(r-c/2)*dy});
  P.push({k:'P',x:2.7,y:0},{k:'B',x:-.4,y:0},{k:'N',x:-4.2,y:0},{k:'G',x:-4.2,y:-3},{k:'Y',x:-4.2,y:3},{k:'K',x:14.2,y:0},{k:'W',x:-7.2,y:0});
  return P}
 const LAY=layout();
 let tick=0;
 function frame(t){
  if(!alive)return;const dt=Math.min(.05,(t-last)/1000);last=t;
  if(auto&&dragX==null)rot+=vr*dt;
  g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,W,H);
  const base=Math.min(W/25,H/9.5)*zoom;const cx=W/2-3.5*base,cy=H/2;
  hit=[];
  // เอฟเฟกต์ด้านหลังลูก (บางเบา ไม่ทับลูก)
  if(fxOn){tick+=dt*(d.effects.kind==='anime'?14:10);while(tick>1){tick--;emitFor(d.effects.kind,d.effects.colors,cx-12*base,cy-4.4*base,26*base,8.8*base)}
   if(d.effects.kind==='anime'){g.save();g.globalCompositeOperation='lighter';for(const p of LAY){if(p.k==='R'&&p.x>4.3&&p.x<7)continue;}g.restore()}
   fxStep(dt);fxDraw(g,.55)}
  for(const p of LAY){
   const x=cx+p.x*base,y=cy+p.y*base,r=base*1.0;
   if(fxOn&&d.effects.kind==='anime'){const gr=g.createRadialGradient(x,y,r*.8,x,y,r*1.55);const a=.28+.12*Math.sin(t/300+p.x);gr.addColorStop(0,d.effects.colors[Math.abs(Math.round(p.x*3))%3]);gr.addColorStop(1,'rgba(0,0,0,0)');g.save();g.globalAlpha=a;g.fillStyle=gr;g.beginPath();g.arc(x,y,r*1.55,0,7);g.fill();g.restore()}
   g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(x+r*.2,y+r*.55,r*.95,r*.7,0,0,7);g.fill();
   const im=imgOf(d,p.k);
   g.save();g.translate(x,y);g.rotate(rot+(p.x+p.y)*.25);if(im.complete&&im.naturalWidth)g.drawImage(im,-r*1.03,-r*1.03,r*2.06,r*2.06);g.restore();
   if(sel===p.k){g.strokeStyle='#ffd96b';g.lineWidth=2;g.beginPath();g.arc(x,y,r*1.12,0,7);g.stroke()}
   hit.push({k:p.k,x,y,r})}
  requestAnimationFrame(frame)}
 requestAnimationFrame(frame);
 const pt=e=>{const r=cv.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top]};
 let moved=0;
 cv.addEventListener('pointerdown',e=>{dragX=pt(e)[0];moved=0;cv.setPointerCapture(e.pointerId);box.style.cursor='grabbing'});
 cv.addEventListener('pointermove',e=>{if(dragX==null)return;const x=pt(e)[0];rot+=(x-dragX)*.012;moved+=Math.abs(x-dragX);dragX=x});
 cv.addEventListener('pointerup',e=>{box.style.cursor='grab';if(moved<5){const [x,y]=pt(e);for(let i=hit.length-1;i>=0;i--){const h=hit[i];if(Math.hypot(x-h.x,y-h.y)<=h.r){sel=h.k;info();break}}}dragX=null});
 cv.addEventListener('wheel',e=>{e.preventDefault();setZ(zoom*(e.deltaY>0?.92:1.08))},{passive:false});
 const zr=o.querySelector('#ssZ');function setZ(z){zoom=Math.max(.6,Math.min(2.6,z));zr.value=Math.round(zoom*100)}
 zr.oninput=()=>{zoom=zr.value/100};
 const end=()=>{alive=false;window.removeEventListener('resize',rz);FX.P.length=0;o.hidden=true;U._skCol=null};
 o.onclick=async e=>{const t=e.target.closest('button');if(!t)return;
  if(t.hasAttribute('data-x')){end();onBack&&onBack();return}
  if(t.dataset.z){setZ(zoom*(t.dataset.z>0?1.2:.83));return}
  if(t.id==='ssAuto'){auto=!auto;t.textContent='⟳ หมุนอัตโนมัติ: '+(auto?'เปิด':'ปิด');return}
  if(t.id==='ssFx'){fxOn=!fxOn;if(!fxOn)FX.P.length=0;t.textContent='✨ เอฟเฟกต์: '+(fxOn?'เปิด':'ปิด');return}
  if(t.dataset.eq){const r=equip(t.dataset.eq);U.toast(r.ok?'ติดตั้งสกินแล้ว':r.err);end();onBack&&onBack();return}
  if(t.dataset.buy){
   if(owned(id))return;if(SN.money()<d.price){U.toast('เงินไม่พอ — ต้องมี '+fmt(d.price));return}
   const ok=await U.confirmBox('ซื้อสกิน <b>'+esc(d.name)+'</b><br>ราคา <b style="color:#ffd96b">'+fmt(d.price)+'</b> · เป็นเจ้าของถาวร','ยืนยันซื้อ');if(!ok)return;
   const r=buy(id);U.toast(r.ok?'🎉 ซื้อสำเร็จ! '+d.name:r.err);if(r.ok){end();onBack&&onBack()}}};
}

SN.SKIN={register,get,list:()=>REG.slice(),owned,equippedId,equipped,buy,equip,data,ballSprite,potBurst,ambient,PRICE,KEYS,sig,fx:FX};
U.openSkinShop=openSkin;U.openSkinPreview=openPreview;
})(typeof window!=='undefined'?window:globalThis);

