
/* ============================================================================
 * CARD SHOP — UI (B): โต๊ะ Battle · ล็อบบี้/เดิมพัน · หน้าจอแข่ง · สรุปผล · Shadow NPC
 * ========================================================================== */
(function(root){
'use strict';
const C=root.CARDSHOP,U=root.CS_UI;if(!C||!U)return;
const A=root.CS_ASSETS||{};
const {fmt,sleep,toast,burst,confetti}=U;
const BT=C.BTYPES;

const CSS=`
#csLobby{z-index:99995}
.csNpcGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(190px,46%),1fr));gap:10px}
.csNpc{cursor:pointer;background:#0d1022;border:2px solid #3a4170;border-radius:10px;padding:8px;text-align:center;font-size:12px;color:#d6dcf5;position:relative}
.csNpc.on{border-color:#ffd96b;box-shadow:0 0 14px rgba(255,217,107,.5)}
.csNpc canvas{width:72px;height:72px;display:block;margin:0 auto 4px}
.csNpc b{display:block;font-size:13px;color:#fff}
.csChips{display:flex;gap:8px;flex-wrap:wrap;margin:6px 0}
.csChip{cursor:pointer;min-width:84px;min-height:44px;border-radius:999px;border:2px solid #d0a451;background:#14172c;color:#ffe08a;font:700 14px inherit;padding:6px 14px}
.csChip.on{background:linear-gradient(180deg,#e8b640,#b57d12);color:#2a1a00}
.csChip:disabled{opacity:.35;cursor:not-allowed;border-color:#555}
/* battle */
#csBat{z-index:99996;background:#05060d;display:flex;flex-direction:column;align-items:stretch;justify-content:flex-start;padding:0;
 --cw0:min(calc((100vw - 28px)/5.5),calc((100vh - 130px)/3.9*.9));--ch0:calc(var(--cw0)/.9);--cw:var(--cw0);--ch:var(--ch0)}
@supports (height:100dvh){#csBat{--cw0:min(calc((100vw - 28px)/5.5),calc((100dvh - 130px)/3.9*.9))}}
.bFx .stage{--cw:calc(var(--cw0)*.82);--ch:calc(var(--ch0)*.82)}
.bTable{position:absolute;inset:0;background:
 radial-gradient(ellipse at 50% 18%,rgba(120,70,220,.28),transparent 55%),
 radial-gradient(ellipse at 50% 85%,rgba(255,200,110,.10),transparent 60%),
 repeating-linear-gradient(90deg,#2a1b12 0 38px,#24160e 38px 40px),
 #1d120b}
.bTable:after{content:"";position:absolute;inset:7% 3% 3%;border:3px solid rgba(208,164,81,.38);border-radius:18px;background:linear-gradient(180deg,rgba(18,14,40,.72),rgba(14,10,28,.82) 50%,rgba(24,16,10,.5));box-shadow:inset 0 0 60px rgba(0,0,0,.6)}
.bWrap{position:relative;z-index:2;display:flex;flex-direction:column;height:100%;padding:6px 10px 8px;gap:4px;min-height:0}
.bHead{display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:nowrap;font-size:clamp(10px,1.7vw,14px);color:#f4efe2}
.bHead .box{background:#0a0c18d9;border:1px solid #4a4f78;border-radius:8px;padding:3px 8px;white-space:nowrap}
.bHead .sc b{font-size:1.25em;color:#ffd96b}
.bRow{display:flex;justify-content:center;align-items:center;gap:calc(var(--cw)*.08)}
.bNpcRow{flex:none;position:relative}
.bShadow{image-rendering:auto!important;position:absolute;left:50%;top:-6%;transform:translateX(-50%);height:calc(var(--ch)*1.5);width:calc(var(--ch)*1.9);pointer-events:none;z-index:0;opacity:.95}
.bSlot{width:var(--cw);height:var(--ch);border:2px dashed rgba(208,164,81,.55);border-radius:8px;background:rgba(10,8,26,.55);display:flex;align-items:center;justify-content:center;position:relative;flex:none;color:rgba(208,164,81,.55);font:700 12px sans-serif;z-index:1}
.bSlot.hot{border-color:#ffd96b;background:rgba(255,217,107,.14);box-shadow:0 0 14px rgba(255,217,107,.5);animation:bPulse .9s infinite}
.bSlot.tgt{border-style:solid;border-color:#6be68b;box-shadow:0 0 16px #6be68b}
@keyframes bPulse{50%{box-shadow:0 0 22px rgba(255,217,107,.9)}}
.bMid{flex:1 1 auto;min-height:0;display:flex;align-items:center;justify-content:center;gap:calc(var(--cw)*.2);position:relative;z-index:1}
.bPile{width:calc(var(--cw)*.8);height:calc(var(--ch)*.8);position:relative;flex:none}
.bPile img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:6px;border:2px solid #d0a451;box-shadow:2px 3px 0 #0008,4px 6px 0 #0006}
.bPile span{position:absolute;bottom:-14px;left:0;right:0;text-align:center;font:700 11px sans-serif;color:#cdd3ee}
.bFx{flex:1;max-width:min(56vw,520px);min-height:calc(var(--ch)*.9);display:flex;align-items:center;justify-content:center;gap:10px;text-align:center;font-size:clamp(11px,1.8vw,14px);color:#e6e9ff;background:rgba(8,6,22,.55);border:1px solid rgba(160,120,255,.4);border-radius:12px;padding:6px 10px;position:relative;overflow:hidden}
.bFx .msg{line-height:1.45}
.bFx .big{font:900 clamp(16px,3.6vw,30px)/1.1 sans-serif;color:#ffd96b;text-shadow:0 0 12px #ff9d1a}
.bFx .stage{flex:none}
.bFx .info{text-align:left;font-size:clamp(10px,1.6vw,13px);line-height:1.45}
.bFx .vs{display:flex;gap:12px;align-items:center;justify-content:center;font:900 clamp(18px,4vw,34px) sans-serif}
.bFx .vs small{display:block;font:600 10px/1.3 sans-serif;color:#aab3d6}
.bYouRow{flex:none}
.bHandRow{flex:none;display:flex;justify-content:center;gap:calc(var(--cw)*.07);min-height:var(--ch);position:relative;z-index:3}
.bBtns{flex:none;display:flex;justify-content:center;gap:10px;position:relative;z-index:3;padding-top:2px}
.bBtns .csBtn{min-width:clamp(84px,18vw,150px);min-height:clamp(38px,8vh,48px)}
/* ใบการ์ด Battle */
.bc{width:var(--cw);height:var(--ch);border-radius:8px;position:relative;flex:none;overflow:hidden;cursor:pointer;
 background:linear-gradient(160deg,var(--c1),#0d0f22 78%);border:2px solid var(--c1);box-shadow:0 2px 8px #000a, inset 0 0 14px rgba(255,255,255,.12);color:#fff;font-family:inherit;user-select:none;-webkit-user-select:none}
.bc .bp{position:absolute;left:5px;top:3px;font:900 calc(var(--ch)*.3)/1 sans-serif;color:#fff;text-shadow:0 2px 0 #000,0 0 8px var(--c1)}
.bc .bi{position:absolute;right:4px;top:4px;font-size:calc(var(--ch)*.18);line-height:1}
.bc .bart{position:absolute;left:0;right:0;top:34%;text-align:center;font-size:calc(var(--ch)*.3);line-height:1;opacity:.9;filter:drop-shadow(0 0 6px var(--c1))}
.bc .bn{position:absolute;left:3px;right:3px;bottom:calc(var(--ch)*.15);text-align:center;font:700 calc(var(--ch)*.1)/1.1 sans-serif;text-shadow:0 1px 2px #000}
.bc .bt{position:absolute;left:0;right:0;bottom:0;text-align:center;font:700 calc(var(--ch)*.085)/1.5 sans-serif;background:rgba(0,0,0,.55);color:var(--c1)}
.bc.t-atk{--c1:#ff6b57}.bc.t-def{--c1:#4aa3ff}.bc.t-sup{--c1:#6be68b}.bc.t-spc{--c1:#d36bff}
.bc.down{background:#0a0b16;border-color:#d0a451}
.bc.down img{width:100%;height:100%;object-fit:cover;display:block}
.bc.sel{transform:translateY(calc(var(--ch)*-.14));box-shadow:0 0 16px 3px #ffd96b;z-index:4}
.bc.dis{filter:grayscale(.85) brightness(.6);cursor:not-allowed}
.bc.deal{animation:bDeal .55s cubic-bezier(.2,.8,.3,1) both}
@keyframes bDeal{from{transform:translate(40vw,-30vh) rotate(25deg) scale(.4);opacity:0}to{transform:none;opacity:1}}
.bc.flipin{animation:bFlip .55s ease-out}
@keyframes bFlip{0%{transform:rotateY(90deg) scale(.9)}100%{transform:none}}
.bc.drawn{animation:bDraw .5s ease-out}
@keyframes bDraw{0%{transform:rotateY(180deg) translateY(30px) scale(.7);opacity:0}100%{transform:none;opacity:1}}
.bc.hit{animation:bHit .7s ease-out}
@keyframes bHit{0%{filter:brightness(3)}30%{transform:translateY(calc(var(--ch)*.12)) scale(1.1);box-shadow:0 0 30px 6px #ff5b3d}100%{transform:none}}
.bc.lose{animation:bShake .5s}
@keyframes bShake{20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
.bc.skill:after,.bSlot.skill:after{content:"";position:absolute;inset:-6px;border-radius:50%;border:3px solid var(--c1,#fff);animation:bRing .8s ease-out forwards;pointer-events:none}
@keyframes bRing{from{transform:scale(.4);opacity:1}to{transform:scale(1.8);opacity:0}}
.bSlot,[data-stage],.bHandRow{touch-action:none}
.bHandRow{touch-action:manipulation}
.bc.drag{position:fixed;z-index:99999;pointer-events:none;transition:none;transform:scale(1.1) rotate(-3deg);box-shadow:0 12px 28px #000c}
.bFloat{position:absolute;z-index:6;font:900 clamp(16px,3vw,26px) sans-serif;color:#fff;text-shadow:0 0 8px #000,0 2px 0 #000;animation:bFloat 1.3s ease-out forwards;pointer-events:none}
@keyframes bFloat{from{transform:translateY(0);opacity:1}to{transform:translateY(-40px);opacity:0}}
.bMark{display:inline-flex;gap:3px;margin-left:4px}.bMark i{width:9px;height:9px;border-radius:50%;background:#2a2f55;border:1px solid #6a74b5}.bMark i.w{background:#ffd96b;border-color:#fff}
/* ผลลัพธ์ */
#csRes{z-index:99998;background:rgba(5,6,16,.88)}
#csRes .csPanel{text-align:center;width:min(480px,94vw)}
#csRes .rtitle{font:900 clamp(38px,11vw,76px)/1 sans-serif;letter-spacing:.08em;margin:2px 0 6px}
#csRes.win .rtitle{color:#ffd35a;text-shadow:0 0 24px #ff9d1a,0 4px 0 #6a3d00}
#csRes.lose .rtitle{color:#ff6b6b;text-shadow:0 0 24px #a01010,0 4px 0 #400}
#csRes.draw .rtitle{color:#cfd6f3;text-shadow:0 0 18px #5a6aa5}
#csRes table{width:100%;border-collapse:collapse;margin:8px 0 12px;font-size:14px}
#csRes td{padding:5px 8px;border-bottom:1px solid #2a3058;text-align:left}#csRes td:last-child{text-align:right;font-weight:700}
#csSitHud{position:fixed;right:10px;top:64px;z-index:190;display:none}
#csSceneBtns{position:fixed;left:50%;transform:translateX(-50%);top:8px;z-index:195;display:none;flex-direction:row;gap:6px}
#csSceneBtns.on{display:flex}
#csSceneBtns button{cursor:pointer;background:#101426e6;color:#ffe9a8;border:1px solid #d0a451;border-radius:8px;padding:6px 10px;font:700 12px inherit;min-height:34px;white-space:nowrap}
@media (max-width:760px){.bHead{gap:4px;font-size:10px}.bHead .box{padding:2px 5px}.bHead .box small,.bMark{display:none}.bHead .csBtn.sm{min-height:26px;padding:2px 6px;font-size:10px}}
@media (max-height:430px){.bFx{min-height:calc(var(--ch)*.7)}.bBtns .csBtn{min-height:32px;padding:3px 8px;font-size:12px}}
`;
function css(){if(document.getElementById('csCssB'))return;U.css();const s=document.createElement('style');s.id='csCssB';s.textContent=CSS;document.head.appendChild(s)}

/* ---------- Shadow NPC (วาดด้วยโค้ด: เงาดำ + ออร่าม่วง + Idle) ---------- */
function drawShadow(g,w,h,t,col){
 col=col||'#a45cff';g.clearRect(0,0,w,h);
 const cx=w/2,sw=Math.sin(t*.0018),sw2=Math.sin(t*.0031+1.3);
 // ออร่า
 for(let i=0;i<3;i++){const r=h*(.62+i*.12)+sw*h*.02*(i+1);const gr=g.createRadialGradient(cx,h*.58,h*.1,cx,h*.58,r);gr.addColorStop(0,'rgba(150,80,255,'+(.34-i*.08)+')');gr.addColorStop(.65,'rgba(120,50,230,'+(.16-i*.04)+')');gr.addColorStop(1,'rgba(80,20,160,0)');g.fillStyle=gr;g.fillRect(0,0,w,h)}
 // ลำตัว (ฮู้ดเงา)
 g.save();g.translate(cx,h*.55+sw*h*.006);g.shadowColor=col;g.shadowBlur=h*.09+sw2*h*.015;
 const body=()=>{g.beginPath();g.moveTo(-h*.3,h*.46);g.bezierCurveTo(-h*.32,h*.12,-h*.16,h*.03,-h*.13,-h*.1);g.bezierCurveTo(-h*.16,-h*.34,h*.16,-h*.34,h*.13,-h*.1);g.bezierCurveTo(h*.16,h*.03,h*.32,h*.12,h*.3,h*.46);g.closePath()};
 body();g.strokeStyle=col;g.lineWidth=h*.035;g.stroke();g.fillStyle='#05020c';g.fill();
 g.shadowBlur=0;
 // เส้นขอบออร่าสว่างบาง ๆ
 body();g.strokeStyle='rgba(220,180,255,.55)';g.lineWidth=h*.008;g.stroke();
 // ใบหน้าเงาเว้า + ดวงตาจาง ๆ
 g.fillStyle='rgba(190,120,255,'+(.55+.35*Math.sin(t*.004))+')';g.beginPath();g.ellipse(-h*.045,-h*.09,h*.02,h*.011,0,0,7);g.ellipse(h*.045,-h*.09,h*.02,h*.011,0,0,7);g.fill();
 g.restore();
 // ประกายออร่า
 for(let i=0;i<7;i++){const a=t*.0006+i*.9,r=h*(.3+.1*Math.sin(t*.002+i)),x=cx+Math.cos(a)*r*1.3,y=h*.55+Math.sin(a*1.3)*r*.8;g.fillStyle='rgba(200,150,255,'+(.25+.25*Math.sin(t*.005+i))+')';g.fillRect(x,y,3,3)}
}
function shadowLoop(cv,col){let on=true;const g=cv.getContext('2d');const f=t=>{if(!on||!cv.isConnected)return;drawShadow(g,cv.width,cv.height,t,col);requestAnimationFrame(f)};requestAnimationFrame(f);return()=>{on=false}}

/* ---------- ล็อบบี้ + เดิมพัน ---------- */
let LB=null;
function openLobby(opts){
 opts=opts||{};css();const o=U.ov('csLobby');
 const st=C.state(),stat=st.stats;
 let sel=opts.npc||(LB&&LB.npc)||'n1',bet=opts.bet||0;
 const draw=()=>{
  const npc=C.NPCS.find(n=>n.id===sel),opts2=C.betOptions(npc);
  if(!opts2.includes(bet))bet=0;
  const rk=C.rankNext(st.rp);
  o.innerHTML='<div class="csPanel"><button class="csBtn sm csClose" data-leave>ลุกจากโต๊ะ ✕</button><div class="csHead"><h2>🃏 CARD BATTLE · เลือกคู่แข่งและเดิมพัน</h2><span class="csMoney">💰 '+fmt(C.money())+'</span></div>'+
   '<div class="csNote" style="margin-bottom:6px">กติกา: 5 รอบ · วางการ์ด Battle 1 ใบ/รอบ ลงช่อง 5 ช่อง · ชนะรอบมากกว่าชนะเกม (เสมอ = รอบตัดสิน) · การ์ดสะสมใช้ไม่ได้ ใช้ “Battle Deck” แยก</div>'+
   '<div class="csNpcGrid">'+C.NPCS.map(n=>'<div class="csNpc'+(n.id===sel?' on':'')+'" data-n="'+n.id+'"><canvas width="144" height="144" data-sh="'+n.color+'"></canvas><b>'+n.name+'</b>'+n.th+'<br><span class="csTag" style="color:'+n.color+'">'+n.label+'</span><br>เป้าหมายชนะ ≈'+n.winTarget+'% · เดิมพันสูงสุด '+fmt(n.maxBet)+'</div>').join('')+'</div>'+
   '<div style="margin-top:10px"><b style="font-size:13px">จำนวนเดิมพัน</b><div class="csChips">'+C.BETS.map(b=>{const ok=b<=npc.maxBet&&C.money()>=b;return '<button class="csChip'+(b===bet?' on':'')+'" data-b="'+b+'" '+(ok?'':'disabled')+' title="'+(b>npc.maxBet?'เกินขีดจำกัดของคู่แข่งนี้':C.money()<b?'เงินไม่พอ':'')+'">'+fmt(b)+'</button>'}).join('')+'</div>'+
   '<div class="csNote">ชนะ: ได้เงินเดิมพันรวม 2 ฝ่าย (+โอกาสโบนัสเล็กน้อย) · แพ้: เสียเดิมพัน · เสมอ: คืนเงินทั้งสองฝ่าย</div></div>'+
   '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:10px"><button class="csBtn gold" data-start '+(bet?'':'disabled')+'>⚔️ เริ่มการแข่งขัน</button>'+
   '<span class="csNote">สถิติ: ชนะ '+stat.w+' · แพ้ '+stat.l+' · เสมอ '+stat.d+' · สตรีค '+stat.streak+' · Ranking <b style="color:#ffd96b">'+C.rankName(st.rp)+' ('+st.rp+' RP)</b>'+(rk?' · อีก '+(rk[0]-st.rp)+' RP → '+rk[1]:'')+'</span></div></div>';
  o.querySelectorAll('canvas[data-sh]').forEach(cv=>{const g=cv.getContext('2d');drawShadow(g,cv.width,cv.height,0,cv.dataset.sh);const stop=shadowLoop(cv,cv.dataset.sh);cv._stop=stop});
 };
 LB={npc:sel};draw();o.hidden=false;
 o.onclick=async e=>{
  const t=e.target.closest('[data-leave],[data-n],[data-b],[data-start]');if(!t)return;
  if(t.hasAttribute('data-leave')){o.hidden=true;if(U.hooks.standUp)U.hooks.standUp();return}
  if(t.dataset.n){sel=t.dataset.n;LB.npc=sel;draw();return}
  if(t.dataset.b){bet=+t.dataset.b;draw();return}
  if(t.hasAttribute('data-start')){
   if(t.disabled||o.dataset.busy||!bet)return;o.dataset.busy='1';
   const r=C.startBattle(sel,bet);
   if(!r.ok){toast(r.err);delete o.dataset.busy;draw();return}
   o.hidden=true;delete o.dataset.busy;
   startBattleUI(r.battle);
  }};
}

/* ---------- หน้าจอ Battle ---------- */
let B=null;
function bcHTML(c,o){o=o||{};
 if(o.down)return '<div class="bc down"><img alt="" src="'+(A.back||'')+'"></div>';
 const T=BT[c.type];
 const txt=c.type==='spc'?'พิเศษ':c.type==='atk'?'โจมตี':c.type==='def'?'ป้องกัน −'+Math.floor(c.p/2):'หนุนข้าง +'+Math.ceil(c.p/3);
 return '<div class="bc t-'+c.type+(o.cls?' '+o.cls:'')+'" '+(o.attr||'')+'><div class="bp">'+c.p+'</div><div class="bi">'+T.icon+'</div><div class="bart">'+T.icon+'</div><div class="bn">'+(c.type==='spc'?C.SPECIALS[c.sp].name:c.name)+'</div><div class="bt">'+txt+'</div></div>'}
function cardInfo(c){
 const T=BT[c.type];let s='<b style="color:'+T.color+'">'+T.icon+' '+T.name+' ('+T.th+') · พลัง '+c.p+'</b><br>';
 if(c.type==='atk')s+='คะแนนรอบ = '+c.p+' (+โบนัสช่องข้าง)';
 else if(c.type==='def')s+='คะแนนตัวเอง '+Math.floor(c.p/2)+' และลดคะแนนคู่แข่ง '+Math.floor(c.p/2);
 else if(c.type==='sup')s+='คะแนนตัวเอง '+Math.max(1,Math.floor(c.p/2))+' · ให้โบนัส +'+Math.ceil(c.p/3)+' กับการ์ดที่วางช่องข้างเคียง';
 else s+='<span style="color:#e9b7ff">'+C.SPECIALS[c.sp].txt+'</span><br><small>ข้อจำกัด: ห้ามใช้รอบ 1 · ห้ามติดกัน 2 รอบ</small>';
 return s;
}
function startBattleUI(b){
 css();U.hooks.lock();
 const npc=b.npc;
 let o=document.getElementById('csBat');if(o)o.remove();
 o=document.createElement('div');o.id='csBat';o.className='csOv';document.getElementById('csRoot').appendChild(o);
 B={b,o,sel:null,tgt:null,phase:'dealing',lock:true,drawnCi:null,fxStop:null,fgConfirm:0,done:false};
 o.innerHTML='<div class="bTable"></div><div class="bWrap">'+
  '<div class="bHead"><div class="box"><b style="color:'+npc.color+'">'+npc.name+'</b> <small>('+npc.label+')</small></div>'+
  '<div class="box" data-rd>รอบ 1/5</div>'+
  '<div class="box sc" data-sc></div>'+
  '<div class="box" data-bet></div>'+
  '<button class="csBtn sm red" data-fg>ยอมแพ้</button></div>'+
  '<div class="bRow bNpcRow" data-nrow></div>'+
  '<div class="bMid"><div class="bPile" data-pn><img alt="" src="'+(A.back||'')+'"><span>กองจั่ว NPC</span></div><div class="bFx" data-fx></div><div class="bPile" data-pp><img alt="" src="'+(A.back||'')+'"><span data-pc></span></div></div>'+
  '<div class="bRow bYouRow" data-prow></div>'+
  '<div class="bHandRow" data-hand></div>'+
  '<div class="bBtns"><button class="csBtn" data-draw>🃏 DRAW</button><button class="csBtn gold" data-place>📥 PLACE CARD</button><button class="csBtn red" data-end>⏭ END TURN</button></div></div>';
 o.hidden=false;
 // เงา NPC (อยู่ด้านบน ออร่าม่วง Idle)
 const nrow=o.querySelector('[data-nrow]');
 const sh=document.createElement('canvas');sh.className='bShadow';sh.width=380;sh.height=300;nrow.appendChild(sh);B.fxStop=shadowLoop(sh,npc.color);
 render(true);
 setFx('<div class="msg"><div class="big">'+npc.th+' ตอบรับการแข่งขัน!</div>เดิมพัน '+fmt(b.bet)+' · รวมเงินรางวัล '+fmt(b.bet*2)+'</div>');
 o.onclick=onClick;bindDrag();
 // แจกการ์ด
 setTimeout(()=>{B.phase='pick';B.lock=false;render();setFx('<div class="msg"><div class="big">ROUND 1</div>เลือกการ์ด 1 ใบจากมือ แล้วกด <b>DRAW</b></div>')},1200);
}
function $q(s){return B.o.querySelector(s)}
function setFx(html){const f=$q('[data-fx]');if(f)f.innerHTML=html}
function render(deal){
 if(!B)return;const b=B.b;
 $q('[data-rd]').textContent=(b.sd?'รอบตัดสิน':'รอบ '+Math.min(5,b.round)+'/5');
 const mark=(w)=>'<span class="bMark">'+[0,1,2,3,4].map(i=>'<i class="'+(i<w?'w':'')+'"></i>').join('')+'</span>';
 $q('[data-sc]').innerHTML='YOU <b>'+b.wins.p+'</b>'+mark(b.wins.p)+' · '+b.pts.p+' แต้ม &nbsp;|&nbsp; NPC <b>'+b.wins.n+'</b>'+mark(b.wins.n)+' · '+b.pts.n+' แต้ม';
 $q('[data-bet]').innerHTML='💰 เดิมพัน '+fmt(b.bet)+' <small style="display:inline">· เงินคุณ '+fmt(C.money())+'</small>';
 $q('[data-pc]').textContent='กองจั่ว '+b.pile.p.length;
 const slotHTML=(side,i)=>{
  const c=b.board[side][i],pl=b.placed&&b.placed[side]&&b.placed[side].slot===i;
  let inner='';
  if(c){
   const hide=side==='n'&&b.placed&&b.placed.n&&b.placed.n.slot===i&&!B.revealed;
   inner=bcHTML(c,{down:hide,cls:(B.flipSlot===side+i?'flipin ':'')+(B.hitSlot&&B.hitSlot[side+i]?B.hitSlot[side+i]:'')});
  }else inner='<span>'+(i+1)+'</span>';
  const hot=side==='p'&&B.phase==='drawn'&&!c;
  return '<div class="bSlot'+(hot?' hot':'')+(side==='p'&&B.tgt===i?' tgt':'')+'" data-slot="'+side+i+'" data-side="'+side+'" data-i="'+i+'">'+inner+'</div>'};
 const nrow=$q('[data-nrow]'),keep=nrow.querySelector('canvas');
 nrow.innerHTML=[0,1,2,3,4].map(i=>slotHTML('n',i)).join('');if(keep)nrow.insertBefore(keep,nrow.firstChild);
 $q('[data-prow]').innerHTML=[0,1,2,3,4].map(i=>slotHTML('p',i)).join('');
 // มือ
 const hand=$q('[data-hand]');
 hand.innerHTML=b.hand.p.map((c,i)=>{
  if(B.phase==='drawn'&&B.drawnCi===i)return '<div class="bc" style="visibility:hidden"></div>';
  const can=C.canPlayCard(b,'p',i),on=B.sel===i&&B.phase==='pick';
  return bcHTML(c,{cls:(on?'sel ':'')+(can?'':'dis ')+(deal?'deal':''),attr:'data-h="'+i+'" style="'+(deal?'animation-delay:'+(i*130)+'ms':'')+'" title="'+(can?'':C.whyCant(b,'p',i))+'"'});
 }).join('');
 sync();
}
function sync(){
 const b=B.b;
 $q('[data-draw]').disabled=!(B.phase==='pick'&&B.sel!=null&&!B.lock&&C.canPlayCard(b,'p',B.sel));
 $q('[data-place]').disabled=!(B.phase==='drawn'&&B.tgt!=null&&!B.lock);
 $q('[data-end]').disabled=!(B.phase==='placed'&&!B.lock);
 const fg=$q('[data-fg]');fg.disabled=B.done||B.fgBusy;fg.textContent=B.fgConfirm?'ยืนยันยอมแพ้?':'ยอมแพ้';
}
function onClick(e){
 if(!B||B.done)return;const t=e.target.closest('button,[data-h],[data-slot]');if(!t)return;
 const b=B.b;
 if(t.hasAttribute('data-fg')){
  if(!B.fgConfirm){B.fgConfirm=1;sync();setTimeout(()=>{if(B){B.fgConfirm=0;sync()}},3000);return}
  forfeit();return}
 if(B.lock)return;
 if(t.dataset.h!=null){
  if(B.phase!=='pick')return;const i=+t.dataset.h;
  if(!C.canPlayCard(b,'p',i)){toast(C.whyCant(b,'p',i));return}
  B.sel=(B.sel===i?null:i);render();
  if(B.sel!=null)setFx('<div class="stage">'+bcHTML(b.hand.p[B.sel],{cls:''})+'</div><div class="info">'+cardInfo(b.hand.p[B.sel])+'<br><small>กด DRAW เพื่อดึงการ์ดใบนี้ออกมาวาง</small></div>');
  else setFx('<div class="msg">เลือกการ์ด 1 ใบจากมือ</div>');
  return}
 if(t.dataset.slot){
  const s=t.dataset.slot;if(s[0]!=='p'||B.phase!=='drawn')return;const i=+s[1];if(b.board.p[i])return;
  B.tgt=i;render();setFx('<div class="stage">'+bcHTML(b.hand.p[B.drawnCi])+'</div><div class="info">เลือกช่อง '+(i+1)+' แล้ว · กด <b>PLACE CARD</b> หรือลากการ์ดไปวาง</div>');return}
 if(t.hasAttribute('data-draw'))doDraw();
 else if(t.hasAttribute('data-place'))doPlace(B.tgt);
 else if(t.hasAttribute('data-end'))doEnd();
}
function doDraw(){
 const b=B.b;if(B.lock||B.phase!=='pick'||B.sel==null||!C.canPlayCard(b,'p',B.sel))return;
 B.lock=true;B.drawnCi=B.sel;B.phase='drawn';B.tgt=null;const c=b.hand.p[B.drawnCi];
 render();
 setFx('<div class="stage" data-stg>'+bcHTML(c,{cls:'drawn',attr:'data-stage="1"'})+'</div><div class="info">'+cardInfo(c)+'<br><small>ลากการ์ดไปวางที่ช่องของคุณ หรือแตะช่องแล้วกด PLACE CARD</small></div>');
 B.lock=false;sync();
}
async function doPlace(slot){
 const b=B.b;if(B.lock||B.phase!=='drawn'||slot==null||b.board.p[slot])return;
 B.lock=true;sync();
 const from=B.o.querySelector('[data-stage]');const fr=from?from.getBoundingClientRect():null;
 const c=b.hand.p[B.drawnCi];
 const r=C.place(b,'p',B.drawnCi,slot);
 if(!r.ok){toast(r.err);B.lock=false;B.phase='pick';B.sel=null;B.drawnCi=null;render();return}
 B.phase='placed';B.drawnCi=null;B.tgt=null;B.sel=null;
 B.flipSlot=null;
 render();
 const to=B.o.querySelector('[data-slot="p'+slot+'"] .bc');
 if(fr&&to){const tr=to.getBoundingClientRect();to.style.visibility='hidden';
  const cl=document.createElement('div');cl.className='bc drag t-'+c.type;cl.style.cssText='left:'+fr.left+'px;top:'+fr.top+'px;width:'+fr.width+'px;height:'+fr.height+'px;transform:none';
  cl.innerHTML=to.innerHTML;document.body.appendChild(cl);
  const an=cl.animate([{left:fr.left+'px',top:fr.top+'px',width:fr.width+'px',height:fr.height+'px'},{left:tr.left+'px',top:tr.top+'px',width:tr.width+'px',height:tr.height+'px'}],{duration:380,easing:'ease-out'});
  await an.finished.catch(()=>{});cl.remove();to.style.visibility='';}
 const sl=B.o.querySelector('[data-slot="p'+slot+'"]');if(sl&&(c.type==='sup'||c.type==='spc')){sl.classList.add('skill');setTimeout(()=>sl.classList.remove('skill'),900)}
 setFx('<div class="msg"><div class="big">วางการ์ดแล้ว</div>กด <b>END TURN</b> เพื่อให้ '+b.npc.th+' เลือกการ์ดและเปิดผลรอบ</div>');
 B.lock=false;sync();
}
async function doEnd(){
 const b=B.b;if(B.lock||B.phase!=='placed'||!b.placed||!b.placed.p)return;
 B.lock=true;B.phase='resolving';sync();
 setFx('<div class="msg">⏳ '+b.npc.th+' กำลังเลือกการ์ด…</div>');
 await sleep(700);
 const mv=C.aiChoose(b,'n');const rn=C.place(b,'n',mv.ci,mv.slot);
 if(!rn.ok){console.error('npc place',rn.err);}
 B.revealed=false;render();
 const dest=B.o.querySelector('[data-slot="n'+mv.slot+'"]');
 if(dest){const pn=B.o.querySelector('[data-pn]').getBoundingClientRect(),tr=dest.getBoundingClientRect();
  const cl=document.createElement('div');cl.className='bc drag down';cl.style.cssText='left:'+pn.left+'px;top:'+pn.top+'px;width:'+tr.width+'px;height:'+tr.height+'px;transform:none';cl.innerHTML='<img alt="" src="'+(A.back||'')+'" style="width:100%;height:100%;object-fit:cover">';document.body.appendChild(cl);
  const inner=dest.querySelector('.bc');if(inner)inner.style.visibility='hidden';
  await cl.animate([{left:pn.left+'px',top:pn.top+'px'},{left:tr.left+'px',top:tr.top+'px'}],{duration:420,easing:'ease-out'}).finished.catch(()=>{});cl.remove();if(inner)inner.style.visibility=''}
 await sleep(350);
 // พลิกการ์ด + คำนวณ
 B.revealed=true;B.flipSlot='n'+mv.slot;render();
 const r=C.resolve(b);B.flipSlot=null;
 B.hitSlot={};B.hitSlot['p'+r.slots.p]=r.winner==='p'?'hit':r.winner==='n'?'lose':'';B.hitSlot['n'+r.slots.n]=r.winner==='n'?'hit':r.winner==='p'?'lose':'';
 await sleep(500);render();
 showRound(r);
 floatNum('p'+r.slots.p,r.p.final,r.winner==='p');floatNum('n'+r.slots.n,r.n.final,r.winner==='n');
 if(r.winner!=='t'){const w=B.o.querySelector('[data-slot="'+(r.winner+r.slots[r.winner])+'"]');if(w){const rc=w.getBoundingClientRect();burst(rc.left+rc.width/2,rc.top+rc.height/2,r.winner==='p'?['#ffd35a','#fff']:['#ff6b57','#a455ff'],26,260,.9,120)}}
 [['p',r.p],['n',r.n]].forEach(([sd,x])=>{if(x.card.type==='sup'||x.card.type==='spc'||x.card.type==='def'){const sl=B.o.querySelector('[data-slot="'+sd+r.slots[sd]+'"]');if(sl){sl.classList.add('skill');setTimeout(()=>sl.classList.remove('skill'),900)}}});
 await sleep(2200);
 B.hitSlot=null;
 const nx=C.nextRound(b);
 if(nx==='next'){B.phase='pick';B.sel=null;B.lock=false;render();setFx('<div class="msg"><div class="big">ROUND '+b.round+'</div>เลือกการ์ด 1 ใบจากมือ แล้วกด <b>DRAW</b></div>');return}
 if(nx==='tie'){await suddenDeath();return}
 await endBattle();
}
function showRound(r){
 const nt=x=>x.notes.length?'<small>'+x.notes.join(' · ')+'</small>':'<small>&nbsp;</small>';
 const bd=x=>x.base+(x.aura?' +'+x.aura+'โบนัส':'')+(x.steal?' +'+x.steal:'')+(x.red?' −'+x.red:'');
 setFx('<div class="msg"><div class="vs"><div>YOU<br>'+r.p.final+'<small>'+bd(r.p)+'</small>'+nt(r.p)+'</div><div style="font-size:.6em;color:#aab3d6">VS</div><div>NPC<br>'+r.n.final+'<small>'+bd(r.n)+'</small>'+nt(r.n)+'</div></div><div class="big" style="margin-top:4px">'+(r.winner==='p'?'🏆 คุณชนะรอบนี้ +1':r.winner==='n'?'💀 NPC ชนะรอบนี้ +1':'🤝 เสมอรอบนี้')+'</div></div>');
}
function floatNum(slot,v,win){const sl=B.o.querySelector('[data-slot="'+slot+'"]');if(!sl)return;const f=document.createElement('div');f.className='bFloat';f.textContent=v;f.style.color=win?'#ffd35a':'#cfd6f3';f.style.left='38%';f.style.top='8%';sl.appendChild(f);setTimeout(()=>f.remove(),1300)}
async function suddenDeath(){
 const b=B.b;b.phase='sd';
 setFx('<div class="msg"><div class="big">⚡ รอบตัดสินพิเศษ!</div>เสมอรอบ — ทั้งสองฝ่ายจั่วการ์ดบนสุดจากกองจั่วมาเทียบกัน<br><small>ถ้ายังเสมอ ตัดสินด้วยคะแนนรวม · ถ้าเท่ากันอีก = เสมอคืนเงิน</small></div>');
 render();await sleep(1800);
 C.suddenDeath(b);
 const sd=b.sd;
 setFx('<div class="stage">'+bcHTML(sd.pc,{cls:'flipin'})+'</div><div class="vs" style="font-size:20px">VS</div><div class="stage">'+bcHTML(sd.nc,{cls:'flipin'})+'</div>');
 render();await sleep(2200);
 const r=sd.r;showRound(r);await sleep(1800);
 await endBattle();
}
async function endBattle(){
 const b=B.b;B.done=true;B.lock=true;render();
 await sleep(300);
 const s=C.settleBattle(b);
 showResult(s);
}
async function forfeit(){
 const b=B.b;if(B.done)return;B.done=true;B.fgBusy=true;
 const s=C.settleBattle(b,true);showResult(s);
}
function showResult(s){
 const b=B.b,cls=s.res==='p'?'win':s.res==='n'?'lose':'draw';
 const o=U.ov('csRes');o.className='csOv '+cls;
 const title=s.res==='p'?'WIN!':s.res==='n'?'LOSE':'DRAW';
 const money=s.res==='p'?'+'+fmt(s.net):s.res==='n'?'−'+fmt(b.bet):'คืนเงิน '+fmt(b.bet);
 o.innerHTML='<div class="csPanel"><div class="rtitle">'+title+'</div>'+(s.forfeit?'<div class="csNote">คุณยอมแพ้ — เสียเงินเดิมพัน</div>':'')+
  '<table><tr><td>เงินที่ได้รับ/เสีย</td><td style="color:'+(s.res==='p'?'#6be68b':s.res==='n'?'#ff7b7b':'#cfd6f3')+'">'+money+(s.bonus?' (รวมโบนัส '+fmt(s.bonus)+')':'')+'</td></tr>'+
  '<tr><td>เงินเดิมพัน / เงินรางวัลรวม</td><td>'+fmt(b.bet)+' / '+fmt(b.bet*2)+'</td></tr>'+
  '<tr><td>คะแนนรวม</td><td>YOU '+b.pts.p+' : '+b.pts.n+' NPC</td></tr>'+
  '<tr><td>จำนวนรอบที่ชนะ</td><td>YOU '+b.wins.p+' : '+b.wins.n+' NPC</td></tr>'+
  '<tr><td>Ranking</td><td>'+s.rank+' · '+s.rp+' RP '+(s.rpDelta?'('+(s.rpDelta>0?'+':'')+s.rpDelta+')':'')+'</td></tr>'+
  '<tr><td>เงินคงเหลือ</td><td>'+fmt(C.money())+'</td></tr></table>'+
  '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><button class="csBtn gold" data-again '+(C.money()<500?'disabled':'')+'>🔁 PLAY AGAIN</button><button class="csBtn" data-exit>🚪 EXIT</button></div></div>';
 o.hidden=false;
 if(s.res==='p'){confetti(160);U.burst(innerWidth/2,innerHeight*.3,['#ffd35a','#fff','#ff9d1a'],120,520,1.6,160)}
 else if(s.res==='n'){U.burst(innerWidth/2,innerHeight*.3,['#a01010','#3a0a3a','#ff6b6b'],70,260,1.4,260)}
 o.onclick=e=>{const t=e.target.closest('[data-again],[data-exit]');if(!t||t.disabled)return;
  o.hidden=true;closeBattle();
  if(t.hasAttribute('data-again'))openLobby({npc:b.npc.id});
  else if(U.hooks.standUp)U.hooks.standUp();};
}
function closeBattle(){if(B){if(B.fxStop)B.fxStop();if(B.o)B.o.remove();B=null}}

/* ---------- ลากการ์ด (เมาส์/สัมผัส) ---------- */
function bindDrag(){
 const o=B.o;let drag=null;
 o.addEventListener('pointerdown',e=>{
  if(!B||B.phase!=='drawn'||B.lock)return;
  const st=e.target.closest('[data-stage]');if(!st)return;
  e.preventDefault();const r=st.getBoundingClientRect();
  const cl=st.cloneNode(true);cl.removeAttribute('data-stage');cl.classList.add('drag');cl.style.cssText='left:'+r.left+'px;top:'+r.top+'px;width:'+r.width+'px;height:'+r.height+'px';document.body.appendChild(cl);
  st.style.opacity='.25';drag={cl,st,dx:e.clientX-r.left,dy:e.clientY-r.top,pid:e.pointerId};
  try{o.setPointerCapture(e.pointerId)}catch(_){}
 });
 const mv=e=>{if(!drag)return;drag.cl.style.left=(e.clientX-drag.dx)+'px';drag.cl.style.top=(e.clientY-drag.dy)+'px';
  const el=document.elementFromPoint(e.clientX,e.clientY),sl=el&&el.closest&&el.closest('[data-slot^="p"]');
  o.querySelectorAll('.bSlot.tgt').forEach(x=>x.classList.remove('tgt'));if(sl&&!B.b.board.p[+sl.dataset.i])sl.classList.add('tgt')};
 const up=e=>{if(!drag)return;const d=drag;drag=null;d.cl.remove();d.st.style.opacity='';
  const el=document.elementFromPoint(e.clientX,e.clientY),sl=el&&el.closest&&el.closest('[data-slot^="p"]');
  try{o.releasePointerCapture(d.pid)}catch(_){}
  if(sl&&B&&B.phase==='drawn'&&!B.b.board.p[+sl.dataset.i]){B.tgt=+sl.dataset.i;doPlace(B.tgt)}else if(B){o.querySelectorAll('.bSlot.tgt').forEach(x=>x.classList.remove('tgt'))}};
 o.addEventListener('pointermove',mv);o.addEventListener('pointerup',up);o.addEventListener('pointercancel',up);
}

U.openLobby=openLobby;U.drawShadow=drawShadow;U.shadowLoop=shadowLoop;
U.battleActive=()=>!!B;
U.battleState=()=>B?{phase:B.phase,lock:B.lock,done:B.done,round:B.b.round,sd:!!B.b.sd}:null;
U.forceCloseBattle=()=>{if(B&&!B.done){B.done=true;C.settleBattle(B.b,true)}closeBattle();const r=document.getElementById('csRes');if(r)r.hidden=true;const l=document.getElementById('csLobby');if(l)l.hidden=true};
})(typeof window!=='undefined'?window:globalThis);

