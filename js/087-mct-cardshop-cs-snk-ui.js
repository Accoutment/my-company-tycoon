
/* ============================================================================
 * SNOOKER CLUB — UI: เลือกคู่แข่ง · หน้าจอแข่งขัน (canvas) · ไม้คิว/เล็ง/Power/Spin · ผลแข่ง · สถิติ · เสียง
 * ========================================================================== */
(function(root){
'use strict';
const SN=root.SNOOKER,U=root.CS_UI;
if(!SN||!U)return;
const K=SN.K,AS=root.SNK_ASSETS||{};
const fmt=n=>'฿'+Math.round(n).toLocaleString();
const esc=s=>String(s).replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
const H=()=>U.hooks;const FAST=()=>!!U._fast; /* โหมดทดสอบอัตโนมัติ: ข้ามเวลารอของแอนิเมชัน (ฟิสิกส์/กติกายังคำนวณเหมือนเดิม) */
const toast=m=>U.toast(m);

const CSS=`
#snkClub,#snkM{z-index:99996}
.skP{position:relative;width:min(1100px,98vw);max-height:96vh;overflow:auto;margin:auto;background:linear-gradient(180deg,#1c1109,#120b08);border:2px solid #d0a451;border-radius:12px;padding:12px 14px;color:#f5e6c8}
.skP h2{margin:0;font-size:clamp(15px,2.4vw,22px);color:#ffd96b}
.skHead{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding-right:92px;margin-bottom:8px}
.skHead .csMoney{margin-left:auto}
.skTabs{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}
.skTab{padding:5px 12px;border-radius:99px;border:1px solid #6b5a2c;background:#201510;color:#d9c89a;font-weight:700;font-size:12px;cursor:pointer}
.skTab.on{background:#d0a451;color:#1a1008}
.skGrid{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:12px}
.skList{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;align-content:start}
.skNpc{background:#1b130d;border:2px solid #4a3a20;border-radius:10px;padding:8px;cursor:pointer;font-size:12px;line-height:1.4;position:relative;text-align:left;color:#f5e6c8}
.skNpc.on{border-color:var(--nc,#ffd96b);box-shadow:0 0 12px var(--nc,#ffd96b)}
.skNpc .av{font-size:26px}.skNpc .lv{position:absolute;right:6px;top:6px;background:var(--nc);color:#111;border-radius:99px;padding:1px 7px;font-weight:900;font-size:10px}
.skBox{background:#16100b;border:1px solid #4a3a20;border-radius:10px;padding:10px;font-size:13px;line-height:1.55}
.skRow{display:flex;justify-content:space-between;gap:8px;padding:2px 0;border-bottom:1px dashed #3a2c18}
.skRow b{color:#ffe08a}.skRow.tot{border-bottom:0;border-top:2px solid #d0a451;font-weight:900;margin-top:3px;padding-top:5px}
.skOpts{display:flex;gap:6px;flex-wrap:wrap;margin:4px 0}
.skOpt{padding:5px 11px;border-radius:8px;border:1px solid #6b5a2c;background:#241810;color:#e8d8a8;font-weight:800;cursor:pointer;font-size:12px}
.skOpt.on{background:#2a6b3a;border-color:#7be39a;color:#fff}
.skTbl{width:100%;border-collapse:collapse;font-size:12px}.skTbl td,.skTbl th{padding:3px 6px;border-bottom:1px solid #3a2c18;text-align:left}
.skTbl th{color:#b7a77a}
/* match */
#snkM{background:#0c0806;padding:0}
.smW{position:relative;width:100%;height:100%;display:flex;flex-direction:column;background:radial-gradient(ellipse at 50% 30%,#3a2412 0,#120a06 75%);overflow:hidden;color:#f5e6c8;user-select:none;touch-action:none}
.smTop{display:flex;align-items:stretch;gap:8px;padding:5px 96px 4px 8px;background:linear-gradient(180deg,#2a1a0c,#160e08);border-bottom:2px solid #d0a451;flex:none}
.smP{flex:1;min-width:0;background:#120b07;border:2px solid #4a3a20;border-radius:8px;padding:3px 8px;display:flex;align-items:center;gap:8px}
.smP.turn{border-color:#7be39a;box-shadow:0 0 12px #3ddc84}
.smP .nm{font-weight:900;font-size:clamp(11px,1.6vw,15px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.smP .sc{font:900 clamp(20px,3.4vw,32px)/1 'Courier New',monospace;color:#ffe08a;margin-left:auto}
.smP .sub{font-size:10px;color:#b7a77a}
.smMid{flex:none;text-align:center;font-size:11px;line-height:1.35;min-width:110px;display:flex;flex-direction:column;justify-content:center}
.smMid b{color:#ffe08a;font-size:13px}
.smCv{position:relative;flex:1;min-height:0}
.smCv canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.smBar{display:flex;align-items:center;gap:8px;padding:5px 8px;background:linear-gradient(0deg,#2a1a0c,#160e08);border-top:2px solid #d0a451;flex:none;flex-wrap:wrap}
.smBar .csBtn{min-height:34px;padding:3px 10px;font-size:12px}
.smPow{position:relative;flex:1;min-width:140px;max-width:420px;height:30px;border-radius:99px;background:#0a0705;border:2px solid #6b5a2c;touch-action:none;cursor:ew-resize}
.smPow i{position:absolute;left:0;top:0;bottom:0;border-radius:99px;background:linear-gradient(90deg,#3ddc84,#ffd35a 60%,#ff5a4d)}
.smPow b{position:absolute;top:-4px;bottom:-4px;width:12px;margin-left:-6px;border-radius:5px;background:#fff;border:2px solid #222;box-shadow:0 0 6px #000}
.smPow span{position:absolute;inset:0;text-align:center;font:900 12px/26px sans-serif;text-shadow:0 1px 2px #000;pointer-events:none}
.smSpin{width:70px;height:70px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#cfcfcf 70%);border:3px solid #6b5a2c;position:relative;cursor:crosshair;flex:none;touch-action:none}
.smSpin i{position:absolute;width:12px;height:12px;border-radius:50%;background:#d11;border:2px solid #600;margin:-6px 0 0 -6px;pointer-events:none}
.smSpin:before,.smSpin:after{content:"";position:absolute;background:#0003}.smSpin:before{left:50%;top:6px;bottom:6px;width:1px}.smSpin:after{top:50%;left:6px;right:6px;height:1px}
.smBanner{position:absolute;left:50%;top:10%;transform:translateX(-50%);max-width:88%;padding:8px 18px;border-radius:10px;background:rgba(10,6,4,.9);border:2px solid #ffd96b;font:800 clamp(13px,2.2vw,20px)/1.3 sans-serif;text-align:center;pointer-events:none;opacity:0;transition:opacity .25s;z-index:3}
.smBanner.on{opacity:1}.smBanner.bad{border-color:#ff5a4d;color:#ffb0a8}.smBanner.good{border-color:#7be39a;color:#bfffd0}
.smRes{position:absolute;inset:0;z-index:6;background:rgba(6,4,2,.9);display:flex;align-items:center;justify-content:center;padding:10px;overflow:auto}
.smRes .skBox{width:min(520px,96vw);text-align:center}
.smRes h1{margin:0 0 6px;font:900 clamp(22px,5vw,40px)/1.1 sans-serif;color:#ffd96b;text-shadow:0 0 16px #ff9d00}
.smRes.lose h1{color:#ff9a8a;text-shadow:0 0 16px #ff3d3d}
.smOn{display:inline-flex;align-items:center;gap:4px}
.smOn i{width:12px;height:12px;border-radius:50%;display:inline-block;border:1px solid #000}
@media (max-width:760px),(max-height:430px){
 .skGrid{grid-template-columns:1fr}.smTop{padding:3px 86px 3px 4px;gap:4px}.smP{padding:2px 5px}.smMid{min-width:70px;font-size:9px}
 .smSpin{width:52px;height:52px}.smBar{gap:5px;padding:3px 5px}.smBar .csBtn{min-height:30px;font-size:11px;padding:2px 7px}.smPow{height:24px;min-width:100px}.smPow span{line-height:20px}
}`;
function css(){U.css();if(!document.getElementById('skCss')){const s=document.createElement('style');s.id='skCss';s.textContent=CSS;document.head.appendChild(s)}}

/* ---------- เสียง (สังเคราะห์ด้วย WebAudio) ---------- */
let AC=null,AMB=null;
function ac(){try{if(!AC){const Kc=root.AudioContext||root.webkitAudioContext;if(Kc)AC=new Kc()}if(AC&&AC.state==='suspended')AC.resume();return AC}catch(e){return null}}
function noise(d,f0,f1,v,t0){const a=ac();if(!a)return;try{const n=Math.floor(a.sampleRate*d),b=a.createBuffer(1,n,a.sampleRate),c=b.getChannelData(0);for(let i=0;i<n;i++)c[i]=(Math.random()*2-1)*Math.pow(1-i/n,2);
 const s=a.createBufferSource(),fl=a.createBiquadFilter(),g=a.createGain(),t=a.currentTime+(t0||0);s.buffer=b;fl.type='bandpass';fl.frequency.setValueAtTime(f0,t);fl.frequency.exponentialRampToValueAtTime(Math.max(40,f1),t+d);fl.Q.value=1.2;g.gain.setValueAtTime(v,t);s.connect(fl);fl.connect(g);g.connect(a.destination);s.start(t)}catch(e){}}
function tone(f,d,type,v,t0,f2){const a=ac();if(!a)return;try{const o=a.createOscillator(),g=a.createGain(),t=a.currentTime+(t0||0);o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v||.1,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.05)}catch(e){}}
const SND={
 cue(p){noise(.05,2400,900,.35*(0.4+p));tone(180,.07,'triangle',.18*(0.5+p),0,90)},   // ไม้คิวกระทบลูก
 hit(v){const q=Math.min(1,v/2500);tone(1700+Math.random()*300,.05,'sine',.05+.16*q,0,900);noise(.025,3500,1800,.05+.12*q)}, // ลูกชนกัน
 cush(v){const q=Math.min(1,v/2500);tone(110,.09,'triangle',.06+.15*q,0,70);noise(.04,500,200,.05+.1*q)},      // ลูกชนขอบ
 pot(){tone(150,.28,'sine',.2,0,60);noise(.22,700,150,.14,.02);tone(95,.18,'triangle',.12,.08,60)},                // ลูกตกหลุม
 foul(){tone(220,.22,'sawtooth',.1,0,130);tone(165,.3,'sawtooth',.1,.18,100)},
 good(){[523,659,784].forEach((f,i)=>tone(f,.2,'triangle',.11,i*.09))},
 win(){[523,659,784,1047,1319].forEach((f,i)=>tone(f,.32,'triangle',.13,i*.11))},
 lose(){tone(330,.5,'sawtooth',.09,0,110)},
 bell(){tone(1200,.5,'sine',.1,0,1190);tone(1800,.4,'sine',.05,0,1790)}};
function ambience(on){ // เสียงบรรยากาศในร้าน: ลมหายใจเสียงคนคุย + แก้วกระทบเบา ๆ
 const a=ac();if(!a)return;
 if(!on){if(AMB){try{AMB.stop()}catch(e){}AMB=null}return}
 if(AMB)return;
 try{const n=a.sampleRate*3,b=a.createBuffer(1,n,a.sampleRate),c=b.getChannelData(0);let p=0;for(let i=0;i<n;i++){p=p*0.985+(Math.random()*2-1)*0.06;c[i]=p}
  const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=b;s.loop=true;f.type='lowpass';f.frequency.value=700;g.gain.value=0.35;s.connect(f);f.connect(g);g.connect(a.destination);s.start();AMB={stop(){s.stop()}};
  const clink=()=>{if(!AMB)return;tone(2200+Math.random()*900,.12,'sine',.015);setTimeout(clink,4000+Math.random()*7000)};setTimeout(clink,3000)}catch(e){}}

/* ---------- ภาพ ---------- */
const IM={};
function img(k,src){if(!IM[k]){const i=new Image();i.src=src||'';IM[k]=i}return IM[k]}
function skinKey(b){return b.type==='red'?'R':b.type==='cue'?'W':b.id}
function ballImg(b){const sk=SN.SKIN&&SN.SKIN.ballSprite(skinKey(b));if(sk)return sk;return img('b_'+b.id,AS.balls&&AS.balls[b.type==='red'?'red':b.type==='cue'?'white':({Y:'yellow',G:'green',N:'brown',B:'blue',P:'pink',K:'black'})[b.id]])}
const TBL={w:1478,h:887,fx:110,fy:100,fw:1259,fh:627,sc:1259/K.L};
const BALL_COL={W:'#fff',Y:'#ffd23d',G:'#1faa4a',N:'#9a5a22',B:'#2a62ff',P:'#ff6fb0',K:'#111',R:'#e11'};
const ONCOL={red:'#e11',colour:'#ffd96b'};

/* ============================================================================
 * หน้าต่าง SNOOKER CLUB (เลือกคู่แข่ง/โต๊ะ/เฟรม · สถิติ · ประวัติ)
 * ========================================================================== */
function openClub(pre,onClose,tbl){
 css();const o=U.ov('snkClub');if(!onClose)H().lock();
 const s=SN.state();let sel=pre&&SN.NPC_BY_ID[pre]?pre:'s_chai',tab='npc',bestOf=3,table=tbl||1,lvf=0;
 const close=()=>{o.hidden=true;if(onClose)onClose();else H().unlock()};
 let busy=false;
 const draw=()=>{
  const m=s.match&&!s.match.settled?s.match:null,open=SN.isOpen(),money=SN.money();
  let h='<div class="skP"><button class="csBtn sm csClose" data-x>EXIT ✕</button><div class="skHead"><h2>🎱 SNOOKER CLUB</h2><span class="csTag" style="color:'+(open?'#7be39a':'#ff8a7a')+'">'+(open?'เปิดให้บริการ 10:00–24:00':'ปิดแล้ว (เปิด 10:00–24:00)')+'</span><span class="csMoney">💰 '+fmt(money)+'</span></div>';
  h+='<div class="skTabs">'+[['npc','🎯 ท้าประลอง'],['stat','📊 สถิติของฉัน'],['hist','📜 ประวัติแข่ง'],['rank','🏆 สถิติ NPC'],['skin','🎨 สกินลูก']].map(t=>'<button class="skTab'+(tab===t[0]?' on':'')+'" data-tab="'+t[0]+'">'+t[1]+'</button>').join('')+'</div>';
  if(m){const nn=SN.NPC_BY_ID[m.npc];h+='<div class="skBox" style="border-color:#7be39a;margin-bottom:8px"><b style="color:#7be39a">มีแมตช์ค้างอยู่</b> · vs '+esc(nn.name)+' (Lv.'+m.level+') · เฟรม '+m.frames[0]+'–'+m.frames[1]+' (Best of '+m.bestOf+') · ชำระเงินแล้ว<br><button class="csBtn gold sm" data-resume>▶ เล่นต่อ</button> <button class="csBtn red sm" data-forfeit>ยอมแพ้ทั้งแมตช์ (เสียเดิมพัน)</button></div>'}
  if(tab==='npc'){
   const list=SN.NPCS.slice().sort((a,b)=>a.level-b.level).filter(n=>!lvf||n.level===lvf);
   const n=SN.NPC_BY_ID[sel]||list[0],f=SN.fees(n,bestOf),total=f.table+f.stake,nr=s.npcs[n.id],LV=SN.LEVELS[n.level];
   h+='<div class="skOpts"><span class="csNote">ระดับ:</span><button class="skOpt'+(!lvf?' on':'')+'" data-lvf="0">ทั้งหมด</button>'+[1,2,3,4,5,6,7].map(l=>'<button class="skOpt'+(lvf===l?' on':'')+'" data-lvf="'+l+'">Lv.'+l+'</button>').join('')+'</div>';
   h+='<div class="skGrid"><div class="skList">'+list.map(x=>{const r=s.npcs[x.id];return '<button class="skNpc'+(x.id===n.id?' on':'')+'" data-npc="'+x.id+'" style="--nc:'+x.color+'"><span class="lv">Lv.'+x.level+'</span><div class="av">'+x.av+'</div><b>'+esc(x.name)+'</b><br><span class="csNote">'+esc(SN.LEVELS[x.level].name)+' · '+esc(SN.LEVELS[x.level].th)+'</span><br><span class="csNote">ชนะคุณ '+r.won+' · แพ้ '+r.lost+'</span></button>'}).join('')+'</div>';
   h+='<div><div class="skBox" style="--nc:'+n.color+'"><b style="font-size:16px;color:'+n.color+'">'+n.av+' '+esc(n.name)+'</b> <span class="csTag" style="color:'+n.color+'">Lv.'+n.level+' '+esc(LV.name)+'</span><br>'+esc(n.title)+'<br><span class="csNote">บุคลิก: '+esc(n.persona)+'</span><br><span class="csNote">ประวัติเจอคุณ: เล่น '+nr.played+' · ชนะ '+nr.won+' · แพ้ '+nr.lost+' · Break สูงสุด '+nr.high+' · ฝีมือ Lv.'+nr.skill+'</span></div>';
   h+='<div class="skBox" style="margin-top:8px"><b>โต๊ะ</b><div class="skOpts">'+[1,2,3,4].map(t=>'<button class="skOpt'+(table===t?' on':'')+'" data-tbl="'+t+'">โต๊ะ '+t+'</button>').join('')+'</div><b>จำนวนเฟรม (Best of)</b><div class="skOpts">'+[1,3,5].map(t=>'<button class="skOpt'+(bestOf===t?' on':'')+'" data-bo="'+t+'">'+t+' เฟรม</button>').join('')+'</div>';
   h+='<div class="skRow"><span>ค่าเข้าเล่น (ค่าโต๊ะ)</span><b>'+fmt(f.table)+'</b></div><div class="skRow"><span>ค่าท้าประลอง (เดิมพัน)</span><b>'+fmt(f.stake)+'</b></div><div class="skRow"><span>เงินรางวัลถ้าชนะ</span><b style="color:#7be39a">'+fmt(f.prize)+'</b></div><div class="skRow tot"><span>ต้องจ่ายตอนนี้</span><b>'+fmt(total)+'</b></div>';
   h+='<button class="csBtn gold" style="width:100%;margin-top:8px" data-start '+((m||!open||money<total)?'disabled':'')+'>🎱 เริ่มแข่งกับ '+esc(n.name)+'</button>'+(m?'<div class="csNote">จบแมตช์ที่ค้างก่อนจึงเริ่มใหม่ได้</div>':!open?'<div class="csNote">ร้านปิดอยู่</div>':money<total?'<div class="csNote" style="color:#ff9a8a">เงินไม่พอ</div>':'')+'</div></div></div>';
  }else if(tab==='stat'){
   const st=s.stats;h+='<div class="skBox"><table class="skTbl"><tr><th>รายการ</th><th>ค่า</th></tr>'+[['จำนวนครั้งที่เล่น',st.games],['ชนะ',st.wins],['แพ้',st.losses],['เฟรมที่ชนะ / แพ้',st.fw+' / '+st.fl],['Highest Break',st.highBrk],['Total Break (สะสม)',st.totalBrk],['ลูกที่ลงหลุมทั้งหมด',st.potted],['จำนวนฟาวล์',st.fouls],['ค่าเข้าเล่นที่จ่ายสะสม',fmt(st.tableFees)],['เงินที่เสียไป (ค่าโต๊ะ+เดิมพัน)',fmt(st.spent)],['เงินรางวัลที่ได้รับ',fmt(st.won)],['เครื่องดื่มที่ซื้อ',st.drinks]].map(r=>'<tr><td>'+r[0]+'</td><td><b>'+r[1]+'</b></td></tr>').join('')+'</table></div>';
  }else if(tab==='hist'){
   const hs=s.hist.slice(-40).reverse();h+='<div class="skBox">'+(hs.length?'<table class="skTbl"><tr><th>วัน</th><th>คู่แข่ง</th><th>ผล</th><th>เฟรม</th><th>เงิน</th></tr>'+hs.map(r=>'<tr><td>'+r.day+'</td><td>'+esc(r.name)+' (Lv.'+r.level+')</td><td style="color:'+(r.res==='win'?'#7be39a':'#ff9a8a')+'">'+(r.res==='win'?'ชนะ':'แพ้')+'</td><td>'+r.frames[0]+'–'+r.frames[1]+' / Bo'+r.bestOf+'</td><td style="color:'+(r.net>=0?'#7be39a':'#ff9a8a')+'">'+(r.net>=0?'+':'')+fmt(r.net)+'</td></tr>').join('')+'</table>':'<div class="csNote" style="text-align:center;padding:14px">ยังไม่มีประวัติการแข่งขัน</div>')+'</div>';
  }else{
   h+='<div class="skBox"><table class="skTbl"><tr><th>NPC</th><th>ระดับ</th><th>เจอคุณ</th><th>ชนะ</th><th>แพ้</th><th>Break สูงสุด</th></tr>'+SN.NPCS.slice().sort((a,b)=>b.level-a.level).map(n=>{const r=s.npcs[n.id];return '<tr><td>'+n.av+' '+esc(n.name)+'</td><td>Lv.'+r.skill+' '+esc(SN.LEVELS[n.level].name)+'</td><td>'+r.played+'</td><td>'+r.won+'</td><td>'+r.lost+'</td><td>'+r.high+'</td></tr>'}).join('')+'</table></div>';
  }
  o.innerHTML=h+'</div>';
 };
 draw();o.hidden=false;
 o.onclick=async e=>{const t=e.target.closest('button');if(!t||busy)return;
  if(t.hasAttribute('data-x')){close();return}
  if(t.dataset.tab==='skin'){o.hidden=true;U.openSkinShop({onClose:()=>{o.hidden=false;draw()}});return}
  if(t.dataset.tab){tab=t.dataset.tab;draw();return}
  if(t.dataset.npc){sel=t.dataset.npc;draw();return}
  if(t.dataset.lvf!=null){lvf=+t.dataset.lvf;const f=SN.NPCS.filter(n=>!lvf||n.level===lvf);if(!f.some(n=>n.id===sel))sel=f[0].id;draw();return}
  if(t.dataset.bo){bestOf=+t.dataset.bo;draw();return}
  if(t.dataset.tbl){table=+t.dataset.tbl;draw();return}
  if(t.hasAttribute('data-resume')){o.hidden=true;openMatch(()=>{o.hidden=false;draw()},true);return}
  if(t.hasAttribute('data-forfeit')){busy=true;try{const ok=await U.confirmBox('ยอมแพ้ทั้งแมตช์? จะเสียเงินเดิมพันและค่าโต๊ะที่จ่ายไปแล้ว','ยอมแพ้');if(ok){const m=s.match;m.frames=[m.frames[0],Math.max(m.frames[1],Math.ceil(m.bestOf/2))];SN.settleMatch('loss');toast('ยอมแพ้แมตช์แล้ว');}}finally{busy=false;draw()}return}
  if(t.hasAttribute('data-start')){
   busy=true;const r=SN.startMatch(sel,bestOf,table);
   if(!r.ok){toast(r.err);busy=false;return}
   H().save();o.hidden=true;busy=false;openMatch(()=>{o.hidden=false;draw()},false)}
 };
}

/* ============================================================================
 * หน้าจอแข่งขัน
 * ========================================================================== */
function openMatch(onExit,resumed){
 css();const s=SN.state(),M=s&&s.match;if(!M||M.settled){return}
 const npc=SN.NPC_BY_ID[M.npc],LV=SN.LEVELS[M.level];
 const o=U.ov('snkM');H().lock();ambience(true);
 const pName=(typeof S!=='undefined'&&S&&S.ceo&&S.ceo!=='CEO')?S.ceo:'คุณ';
 o.innerHTML='<div class="smW"><button class="csBtn sm csClose" data-exit style="z-index:9">ออก ✕</button>'+
  '<div class="smTop"><div class="smP" id="smP0"><div><div class="nm">'+esc(pName)+' (คุณ)</div><div class="sub" id="smB0">Break 0</div></div><div class="sc" id="smS0">0</div></div>'+
  '<div class="smMid"><b id="smFr"></b><span id="smRed"></span><span id="smOn"></span></div>'+
  '<div class="smP" id="smP1"><div class="sc" id="smS1" style="margin:0">0</div><div style="text-align:right;margin-left:auto"><div class="nm">'+npc.av+' '+esc(npc.name)+'</div><div class="sub">Lv.'+M.level+' '+esc(LV.name)+' · <span id="smB1">Break 0</span></div></div></div></div>'+
  '<div class="smCv"><canvas id="snkCv"></canvas><div class="smBanner" id="smBn"></div></div>'+
  '<div class="smBar"><span class="csNote" style="min-width:34px">POWER</span><div class="smPow" id="smPow"><i></i><b></b><span>50%</span></div>'+
  '<div class="smSpin" id="smSpin"><i></i></div><div style="display:flex;flex-direction:column;gap:3px"><span class="csNote" id="smSpinT">Spin: ปกติ</span><div style="display:flex;gap:3px"><button class="csBtn sm" data-sp="0,.8" title="Follow">⬆</button><button class="csBtn sm" data-sp="0,-.8" title="Backspin">⬇</button><button class="csBtn sm" data-sp="-.7,0" title="Side ซ้าย">◀</button><button class="csBtn sm" data-sp="0,0" title="ปกติ">●</button><button class="csBtn sm" data-sp=".7,0" title="Side ขวา">▶</button></div></div>'+
  '<button class="csBtn" data-aimL title="หมุนเล็งซ้าย">⟲</button><button class="csBtn" data-aimR title="หมุนเล็งขวา">⟳</button>'+
  '<button class="csBtn gold" data-shoot style="min-width:96px;font-weight:900">🎱 SHOOT</button><button class="csBtn" data-ff title="เร่งความเร็ว">⏩</button>'+
  '<button class="csBtn red" data-concede style="margin-left:auto">🏳 ยอมแพ้เฟรม</button></div></div>';
 const cv=o.querySelector('#snkCv'),g=cv.getContext('2d');
 const $=id=>o.querySelector('#'+id);
 let W=JSON.parse(JSON.stringify(M.F||SN.newFrame(0)));
 let phase='init',aim=0,power=.5,ox=0,oy=0,alive=true,rng=SN.mkRng(M.seed+M.frameNo*977+(W.shots||0)*131),pull=0,cueShow=true,ff=false,busy=false;
 let sim=null,anim=null,sounds=0,tNow=0,fig={p:{pose:'idle',t:0},n:{pose:'idle',t:0}},bannerT=0,lastBrk=0;
 let L={x:0,y:0,k:1,s:1,ox:0,oy:0,w:0,h:0,dpr:1};
 const cue=()=>SN.byId(W.balls,'W');
 const mm2s=(x,y)=>[L.ox+(TBL.fx+x*TBL.sc)*L.k,L.oy+(TBL.fy+(K.WD-y)*TBL.sc)*L.k];
 const s2mm=(sx,sy)=>[((sx-L.ox)/L.k-TBL.fx)/TBL.sc,K.WD-((sy-L.oy)/L.k-TBL.fy)/TBL.sc];
 function resize(){
  const r=cv.getBoundingClientRect();L.dpr=Math.min(2,window.devicePixelRatio||1);cv.width=Math.max(10,Math.round(r.width*L.dpr));cv.height=Math.max(10,Math.round(r.height*L.dpr));
  L.w=r.width;L.h=r.height;const side=L.w>=900?0:0;
  L.k=Math.min(L.w*0.985/TBL.w,L.h*0.985/TBL.h);L.ox=(L.w-TBL.w*L.k)/2;L.oy=(L.h-TBL.h*L.k)/2;L.s=TBL.sc*L.k}
 /* ----- HUD ----- */
 function hud(){
  const reds=W.balls.filter(b=>b.type==='red'&&!b.out).length,cols=W.balls.filter(b=>b.type==='colour'&&!b.out).length;
  $('smS0').textContent=W.scores[0];$('smS1').textContent=W.scores[1];
  $('smB0').textContent='Break '+(W.turn===0?W.brk:0)+' · สูงสุด '+W.highBrk[0];$('smB1').textContent='Break '+(W.turn===1?W.brk:0);
  $('smP0').classList.toggle('turn',W.turn===0&&!W.over);$('smP1').classList.toggle('turn',W.turn===1&&!W.over);
  $('smFr').textContent='FRAME '+M.frameNo+' · '+M.frames[0]+'–'+M.frames[1]+' (Bo'+M.bestOf+')';
  $('smRed').textContent='ลูกแดงเหลือ '+reds+' · สีเหลือ '+cols;
  const on=W.on;let t='';
  if(!W.over&&on){t='เป้า: '+(on==='red'?'<span class="smOn"><i style="background:#e11"></i>แดง</span>':on==='colour'?'<span class="smOn"><i style="background:linear-gradient(90deg,#ffd23d,#2a62ff,#ff6fb0)"></i>สีใดก็ได้</span>':'<span class="smOn"><i style="background:'+BALL_COL[on]+'"></i>'+SN.nameOf({type:'colour',id:on})+'</span>');if(W.freeBall)t+=' · <b style="color:#7be39a">FREE BALL</b>'}
  $('smOn').innerHTML=t;
 }
 function banner(txt,cls,ms){const b=$('smBn');b.textContent=txt;b.className='smBanner on '+(cls||'');bannerT=performance.now()+(ms||2600);setTimeout(()=>{if(performance.now()>=bannerT-30)b.classList.remove('on')},(ms||2600)+40)}
 function setPow(p){power=Math.max(.03,Math.min(1,p));const r=$('smPow');r.querySelector('i').style.width=power*100+'%';r.querySelector('b').style.left=power*100+'%';r.querySelector('span').textContent=Math.round(power*100)+'%'}
 function setSpin(x,y){const m=Math.hypot(x,y);if(m>1){x/=m;y/=m}ox=x;oy=y;const e=$('smSpin').querySelector('i');e.style.left=(50+x*42)+'%';e.style.top=(50-y*42)+'%';
  const T=m<.12?'ปกติ':(Math.abs(y)>=Math.abs(x)?(y>0?'Follow (ท็อปสปิน)':'Backspin (ดึงกลับ)'):(x>0?'Side Spin ขวา':'Side Spin ซ้าย'));$('smSpinT').textContent='Spin: '+T+(m>=.12?' ('+Math.round(m*100)+'%)':'')}
 setPow(.5);setSpin(0,0);
 /* ----- วาด ----- */
 function drawTable(){
  const tb=img('tbl',AS.table);
  g.fillStyle='#0c0806';g.fillRect(0,0,L.w,L.h);
  if(tb.complete&&tb.naturalWidth)g.drawImage(tb,L.ox,L.oy,TBL.w*L.k,TBL.h*L.k);
  // เส้น baulk / D / จุดสปอต (เพื่ออ่านกติกา)
  g.save();g.strokeStyle='rgba(255,255,255,.22)';g.lineWidth=1.2;
  let [bx,by0]=mm2s(K.BAULK,0),[,by1]=mm2s(K.BAULK,K.WD);g.beginPath();g.moveTo(bx,by0);g.lineTo(bx,by1);g.stroke();
  g.beginPath();g.arc(bx,mm2s(0,K.MID)[1],K.DR*L.s,-Math.PI/2,Math.PI/2,true);g.stroke();
  g.fillStyle='rgba(255,255,255,.28)';for(const k of Object.keys(K.SPOT)){const [x,y]=mm2s(K.SPOT[k][0],K.SPOT[k][1]);g.beginPath();g.arc(x,y,2,0,7);g.fill()}
  g.restore()}
 function drawBall(b){
  if(b.out)return;const [x,y]=mm2s(b.x,b.y),r=K.R*L.s,im=ballImg(b),d=(SN.SKIN&&SN.SKIN.equippedId())?r*2.06:r*2.25; /* ภาพเท่านั้น — ฟิสิกส์ใช้ K.R เดิมเสมอ */
  g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x+r*.25,y+r*.5,r*.95,r*.7,0,0,7);g.fill();
  if(im.complete&&im.naturalWidth){g.imageSmoothingEnabled=false;g.drawImage(im,x-d/2,y-d/2,d,d);g.imageSmoothingEnabled=true}
  else{g.fillStyle=BALL_COL[b.type==='red'?'R':b.id];g.beginPath();g.arc(x,y,r,0,7);g.fill()}}
 function drawGuide(){
  if(phase!=='aim'||W.turn!==0||!cueShow)return;const c=cue();if(!c||c.out)return;
  const P=SN.predict(W.balls,aim);if(!P)return;
  g.save();g.lineCap='round';
  g.setLineDash([7,6]);g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=1.6;
  g.beginPath();P.path.forEach((p,i)=>{const [x,y]=mm2s(p[0],p[1]);i?g.lineTo(x,y):g.moveTo(x,y)});g.stroke();g.setLineDash([]);
  if(P.ghost){const [gx,gy]=mm2s(P.ghost[0],P.ghost[1]);g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=1.4;g.beginPath();g.arc(gx,gy,K.R*L.s,0,7);g.stroke();
   if(P.obj){g.strokeStyle='rgba(255,214,90,.95)';g.lineWidth=1.6;g.beginPath();const a=mm2s(P.obj[0][0],P.obj[0][1]),b=mm2s(P.obj[1][0],P.obj[1][1]);g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke()}
   if(P.cue2){g.strokeStyle='rgba(180,220,255,.8)';g.lineWidth=1.2;g.beginPath();const a=mm2s(P.cue2[0][0],P.cue2[0][1]),b=mm2s(P.cue2[1][0],P.cue2[1][1]);g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke()}}
  if(P.bounce){g.setLineDash([4,5]);g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=1.2;g.beginPath();const a=mm2s(P.bounce[0][0],P.bounce[0][1]),b=mm2s(P.bounce[1][0],P.bounce[1][1]);g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke()}
  g.restore()}
 function drawCue(){
  const c=cue();if(!c||c.out||!cueShow)return;if(phase!=='aim'&&phase!=='npc'&&phase!=='strike')return;
  if(phase==='aim'&&W.turn!==0)return;
  const im=img('cue',AS.cue);if(!(im.complete&&im.naturalWidth))return;
  const ang=aim,gap=K.R*1.15+pull;
  const tipx=c.x-Math.cos(ang)*gap,tipy=c.y-Math.sin(ang)*gap;
  const [sx,sy]=mm2s(tipx,tipy),len=1550*L.s,hh=len*im.naturalHeight/im.naturalWidth*1.8;
  g.save();g.translate(sx,sy);g.rotate(Math.PI-ang);g.imageSmoothingEnabled=true;
  g.fillStyle='rgba(0,0,0,.22)';g.fillRect(3,-hh/2+4,len,hh*.5);
  g.drawImage(im,0,-hh/2,len,hh);g.restore()}
 /* ----- ตัวละครข้างโต๊ะ (ท่าเล็ง/แทง/ดีใจ/ผิดหวัง) ----- */
 function drawFig(who,t){
  const X=root.__CEO_CTX;if(!X)return;const f=fig[who],right=who==='n';
  const baseX=right?L.w-Math.max(34,L.w*0.045):Math.max(34,L.w*0.045),baseY=L.h*(right?0.34:0.7);
  let dx=0,dy=0,sc=1,rot=0,al=1;
  const el=(t-f.t)/1000;
  if(f.pose==='aim'){dx=right?-6:6;dy=Math.sin(t/240)*1.5}
  else if(f.pose==='strike'){dx=(right?-1:1)*Math.min(14,el*160)}
  else if(f.pose==='win'){dy=-Math.abs(Math.sin(t/140))*14}
  else if(f.pose==='lose'){dy=6;rot=(right?1:-1)*0.1;al=.85}
  else{dy=Math.sin(t/700+(right?1:0))*1.4}
  const h=Math.min(86,L.h*0.16);if(L.w<560)return;
  g.save();g.translate(baseX+dx,baseY+dy);g.rotate(rot);g.globalAlpha=al;const k=h/83.6;g.scale(k,k);
  try{
   if(right){const n=SN.NPC_BY_ID[M.npc];X.drawStreetNPC(g,{kind:'customer',id:n.sprite,x:0,y:0,d:f.pose==='idle'?0:3,f:(f.pose==='win'?(t/120):0)|0,mv:f.pose==='win'?1:0},t)}
   else{const st=X.st,sv={x:st.x,y:st.y,dir:st.dir,moving:st.moving,frame:st.frame,hidden:st.hidden};st.x=0;st.y=0;st.dir=f.pose==='idle'?0:1;st.moving=f.pose==='win'?1:0;st.frame=f.pose==='win'?((t/120)|0)%4:0;st.hidden=false;try{X.drawCEO(g)}finally{Object.assign(st,sv)}}
  }catch(e){g.fillStyle='#fff';g.font='36px sans-serif';g.fillText(right?npc.av:'🧑‍💼',-18,0)}
  g.restore()}
 function frame(t){
  if(!alive)return;tNow=t;
  g.setTransform(L.dpr,0,0,L.dpr,0,0);
  drawTable();
  if(SN.SKIN){const k=L.k,fdt=Math.min(.05,(t-(L.ft||t))/1000);L.ft=t;SN.SKIN.ambient(g,fdt,{tx:L.ox+22*k,ty:L.oy+22*k,tw:(TBL.w-44)*k,th:(TBL.h-44)*k,bw:56*k})} /* เอฟเฟกต์สกิน: บนขอบไม้/ที่หลุม ไม่ทับพื้นเล่น */
  // วงเลือกวางลูกขาว (D)
  if(phase==='place'){g.save();g.fillStyle='rgba(120,255,160,.12)';const [bx]=mm2s(K.BAULK,0),cy=mm2s(0,K.MID)[1];g.beginPath();g.arc(bx,cy,K.DR*L.s,Math.PI/2,-Math.PI/2);g.closePath();g.fill();g.restore()}
  for(const b of W.balls)if(b.type!=='cue')drawBall(b);
  const c=cue();if(c&&!c.out)drawBall(c);
  drawGuide();drawCue();
  drawFig('p',t);drawFig('n',t);
  requestAnimationFrame(frame)}
 /* ----- ฟิสิกส์เรียลไทม์ ----- */
 let last=performance.now();
 function physTick(){
  if(!alive)return;const now=performance.now(),dtms=Math.min(50,now-last);last=now;
  if(sim){
   const done=SN.run(sim,FAST()?3:dtms/1000*(ff?5:2.3));
   const q=sim.ev.snd.splice(0);
   let n=0;for(const e of q){if(n++>6)break;if(e.t==='hit')SND.hit(e.v);else if(e.t==='cush')SND.cush(e.v);else if(e.t==='pot'){SND.pot();if(SN.SKIN&&e.x!=null){const q=mm2s(e.x,e.y);SN.SKIN.potBurst(q[0],q[1])}}}
   if(done&&!SN.moving(W.balls)){const sm=sim;sim=null;endShot(sm)}}
  setTimeout(physTick,16)}
 /* ----- เทิร์น ----- */
 function commit(){M.F=JSON.parse(JSON.stringify(W));SN.save()}
 function setPhase(p){phase=p;hud()}
 function startTurn(){
  commit();hud();if(!alive)return;
  if(W.over)return frameEnd();
  const npcT=W.turn===1;fig.p.pose=npcT?'idle':'aim';fig.n.pose=npcT?'aim':'idle';fig.p.t=fig.n.t=performance.now();
  if(W.inHand){
   const c=cue();
   if(npcT){setPhase('npc');banner(npc.name+' กำลังวางลูกขาว…','',1300);setTimeout(()=>{if(!alive)return;const p=SN.aiPlace(W,M.level,rng);SN.placeCue(W,p.x,p.y);hud();setTimeout(npcShot,FAST()?5:500)},FAST()?10:800)}
   else{
    if(c.out||c.x<-1000){c.out=false;c.x=K.BAULK-K.DR*.5;c.y=K.MID;c.vx=c.vy=0}
    if(!SN.dOk(W,c.x,c.y)){for(let x=K.BAULK-30;x>40;x-=20)for(let y=K.MID;y<K.MID+K.DR;y+=24){if(SN.dOk(W,x,y)){c.x=x;c.y=y;x=-1;break}}}
    setPhase('place');banner('วางลูกขาวใน D ด้วยการลาก แล้วกด SHOOT/Enter เพื่อเริ่มเล็ง','',3500);aim=0;fig.p.pose='aim'}
  }else if(npcT){setPhase('npc');npcShot()}
  else{setPhase('aim');const c=cue();if(c){const tg=SN.onBalls(W);const t0=(W.freeBall?W.balls.filter(b=>!b.out&&b.type!=='cue'):tg).sort((a,b)=>Math.hypot(a.x-c.x,a.y-c.y)-Math.hypot(b.x-c.x,b.y-c.y))[0];if(t0)aim=Math.atan2(t0.y-c.y,t0.x-c.x)}
   if(W.freeBall)banner('FREE BALL! ถูกบัง — แทงลูกใดก็ได้ ลูกที่โดนก่อนจะนับเป็นลูกเป้า','good',3800);
   else if(W.lastFoul&&W.lastFoul.by===1)banner('ฟาวล์ '+W.lastFoul.pts+' แต้มให้คุณ — '+W.lastFoul.reason,'good',3200);
   else banner('ตาของคุณ','good',1100)}
 }
 function npcShot(){
  if(!alive)return;setPhase('npc');
  if(SN.aiConcede(W,1)){banner(npc.name+' ยอมแพ้เฟรมนี้','good',1800);W.over=true;W.winner=0;setTimeout(()=>{if(alive)frameEnd()},FAST()?20:1500);return}
  const think=FAST()?10:550+Math.min(900,(M.level)*120);
  setTimeout(()=>{if(!alive)return;
   let sh;try{sh=SN.ai(W,M.level,rng)}catch(e){console.error(e);sh={ang:0,power:.3,ox:0,oy:0}}
   // หมุนไม้คิวไปทิศเป้า (แอนิเมชันเล็ง)
   const c=cue(),a0=aim,da=((sh.ang-a0+Math.PI*3)%(Math.PI*2))-Math.PI,t0=performance.now(),dur=FAST()?20:650;
   fig.n.pose='aim';fig.n.t=t0;setPow(sh.power);setSpin(sh.ox||0,sh.oy||0);
   const step=()=>{if(!alive)return;const k=Math.min(1,(performance.now()-t0)/dur);aim=a0+da*(k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2);if(k<1)requestAnimationFrame(step);else setTimeout(()=>shoot(sh.ang,sh.power,sh.ox,sh.oy,true),FAST()?5:260)};step()
  },think)}
 function shoot(ang,pw,sx,sy,byNpc){
  if(busy||!alive)return;if(!(phase==='aim'||phase==='npc'||phase==='place'))return;
  const c=cue();if(!c||c.out)return;busy=true;
  if(W.inHand){W.inHand=false}
  aim=ang;phase='strike';const t0=performance.now(),back=FAST()?8:130+pw*320,fwd=FAST()?8:90;
  fig[byNpc?'n':'p'].pose='strike';fig[byNpc?'n':'p'].t=t0;
  const mmBack=60+pw*380;
  const anim_=()=>{if(!alive)return;const e=performance.now()-t0;
   if(e<back){pull=mmBack*(e/back)*(e/back*0.4+0.6);requestAnimationFrame(anim_)}
   else if(e<back+fwd){pull=mmBack*(1-(e-back)/fwd);requestAnimationFrame(anim_)}
   else{pull=0;SND.cue(pw);sim=SN.newSim(W.balls);const sv=W.shots;M._pre={brk:W.brk,sh:W.turn};SN.strike(sim,ang,pw,sx||0,sy||0);last=performance.now();cueShow=false;setPhase('roll');busy=false}};
  anim_()}
 function endShot(sm){
  const who=W.turn,pre=W.brk;cueShow=true;
  const r=SN.judge(W,sm.ev);
  if(who===0){M.pot=(M.pot||0)+sm.ev.potted.filter(i=>i!=='W').length;if(r.foul)M.fouls=(M.fouls||0)+1}
  if(W.brk>M.hi[who])M.hi[who]=W.brk;
  if(who===0&&(W.turn!==0||r.foul||!r.pts)){M.totBrk=(M.totBrk||0)+(pre+(r.foul?0:r.pts))}
  hud();
  if(r.foul){SND.foul();banner('ฟาวล์! '+r.reason+' · ให้ '+(who===0?npc.name:'คุณ')+' '+r.fv+' แต้ม'+(W.inHand?' · ลูกขาวในมือ':''),'bad',3000)}
  else if(r.pts>0){SND.good();banner((who===0?'คุณ':npc.name)+' ลงหลุม +'+r.pts+(W.brk>r.pts?' · Break '+W.brk:''),'good',1700)}
  else banner('ไม่ลงหลุม — เปลี่ยนตา','',1300);
  setTimeout(()=>{if(alive)startTurn()},FAST()?20:r.foul?2300:r.pts>0?1100:900)}
 /* ----- จบเฟรม / แมตช์ ----- */
 function frameEnd(){
  setPhase('over');const w=W.winner;M.frames[w]++;M.fr.push({s:W.scores.slice(),w});
  M.hi[0]=Math.max(M.hi[0],W.highBrk[0]);M.hi[1]=Math.max(M.hi[1],W.highBrk[1]);
  fig.p.pose=w===0?'win':'lose';fig.n.pose=w===1?'win':'lose';fig.p.t=fig.n.t=performance.now();
  SND.bell();hud();
  const need=Math.ceil(M.bestOf/2);
  if(M.frames[0]>=need||M.frames[1]>=need){setTimeout(()=>{if(alive)matchEnd(M.frames[0]>=need)},FAST()?30:1200);return}
  const res=document.createElement('div');res.className='smRes';
  res.innerHTML='<div class="skBox"><h1>'+(w===0?'FRAME WIN!':'FRAME LOST')+'</h1><div style="font-size:18px">'+W.scores[0]+' – '+W.scores[1]+'</div><div class="csNote">เฟรม '+M.frames[0]+'–'+M.frames[1]+' · Break สูงสุดเฟรมนี้ '+W.highBrk[0]+'</div><br><button class="csBtn gold" data-nextframe>▶ เฟรมถัดไป</button></div>';
  o.querySelector('.smW').appendChild(res);
  commitMatchOnly();
  res.onclick=e=>{if(e.target.closest('[data-nextframe]')){res.remove();M.frameNo++;const starter=(M.frameNo-1)%2;W=SN.newFrame(starter);rng=SN.mkRng(M.seed+M.frameNo*977);fig.p.pose=fig.n.pose='idle';startTurn()}}}
 function commitMatchOnly(){SN.save()}
 function matchEnd(win){
  setPhase('over');const rec=SN.settleMatch(win?'win':'loss');H().save();
  if(win)SND.win();else SND.lose();
  const res=document.createElement('div');res.className='smRes'+(win?'':' lose');
  const f=rec||{fee:M.fee,stake:M.stake,prize:0,net:-(M.fee+M.stake)};
  res.innerHTML='<div class="skBox"><h1>'+(win?'🏆 YOU WIN!':'MATCH LOST')+'</h1><div style="font-size:16px">'+esc(pName)+' '+M.frames[0]+' – '+M.frames[1]+' '+esc(npc.name)+'</div><div class="csNote">Break สูงสุดของคุณ '+M.hi[0]+'</div>'+
   '<div style="text-align:left;margin:10px 0"><div class="skRow"><span>ค่าเข้าเล่น (ค่าโต๊ะ)</span><b>-'+fmt(f.fee)+'</b></div><div class="skRow"><span>ค่าท้าประลอง</span><b>-'+fmt(f.stake)+'</b></div><div class="skRow"><span>เงินรางวัล</span><b style="color:#7be39a">'+(win?'+'+fmt(f.prize):fmt(0))+'</b></div><div class="skRow"><span>เงินที่ได้รับ</span><b style="color:#7be39a">'+fmt(f.prize||0)+'</b></div><div class="skRow"><span>เงินที่เสียไป</span><b style="color:#ff9a8a">'+fmt(f.fee+f.stake)+'</b></div><div class="skRow tot"><span>สุทธิ</span><b style="color:'+(f.net>=0?'#7be39a':'#ff9a8a')+'">'+(f.net>=0?'+':'')+fmt(f.net)+'</b></div><div class="skRow"><span>เงินคงเหลือ</span><b>'+fmt(SN.money())+'</b></div></div><button class="csBtn gold" data-done>ตกลง</button></div>';
  o.querySelector('.smW').appendChild(res);if(win&&U.confetti)U.confetti(100);
  res.onclick=e=>{if(e.target.closest('[data-done]')){cleanup();o.hidden=true;if(onExit)onExit();else H().unlock()}}}
 /* ----- อินพุต ----- */
 function pt(e){const r=cv.getBoundingClientRect();const p=e.touches?e.touches[0]:e;return [p.clientX-r.left,p.clientY-r.top]}
 let dragPlace=false;
 cv.addEventListener('pointerdown',e=>{
  const [x,y]=pt(e);const [mx,my]=s2mm(x,y);
  if(phase==='place'){const c=cue();if(Math.hypot(mx-c.x,my-c.y)<K.R*3.2){dragPlace=true;cv.setPointerCapture(e.pointerId);return}}
  if(phase==='aim'&&W.turn===0){const c=cue();aim=Math.atan2(my-c.y,mx-c.x)}});
 cv.addEventListener('pointermove',e=>{
  const [x,y]=pt(e);const [mx,my]=s2mm(x,y);
  if(dragPlace&&phase==='place'){const c=cue();let nx=Math.min(K.BAULK,Math.max(K.R,mx)),ny=my;const d=Math.hypot(nx-K.BAULK,ny-K.MID);if(d>K.DR){nx=K.BAULK+(nx-K.BAULK)*K.DR/d;ny=K.MID+(ny-K.MID)*K.DR/d;nx=Math.min(K.BAULK,nx)}
   ny=Math.min(K.WD-K.R,Math.max(K.R,ny));if(SN.dOk(W,nx,ny)){c.x=nx;c.y=ny}return}
  if(phase==='aim'&&W.turn===0&&(e.buttons||e.pointerType==='mouse')){const c=cue();aim=Math.atan2(my-c.y,mx-c.x)}});
 cv.addEventListener('pointerup',()=>{dragPlace=false});
 cv.addEventListener('wheel',e=>{if(phase==='aim'&&W.turn===0){e.preventDefault();setPow(power+(e.deltaY>0?.03:-.03))}},{passive:false});
 const powEl=$('smPow');let dragPow=false;
 const powSet=e=>{const r=powEl.getBoundingClientRect();const p=e.touches?e.touches[0]:e;setPow((p.clientX-r.left)/r.width)};
 powEl.addEventListener('pointerdown',e=>{dragPow=true;powEl.setPointerCapture(e.pointerId);powSet(e)});powEl.addEventListener('pointermove',e=>{if(dragPow)powSet(e)});powEl.addEventListener('pointerup',()=>{dragPow=false});
 const spEl=$('smSpin');let dragSp=false;
 const spSet=e=>{const r=spEl.getBoundingClientRect(),p=e.touches?e.touches[0]:e;setSpin(((p.clientX-r.left)/r.width-.5)*2.1,-((p.clientY-r.top)/r.height-.5)*2.1)};
 spEl.addEventListener('pointerdown',e=>{dragSp=true;spEl.setPointerCapture(e.pointerId);spSet(e)});spEl.addEventListener('pointermove',e=>{if(dragSp)spSet(e)});spEl.addEventListener('pointerup',()=>{dragSp=false});
 let holdT=0;
 const rot=d=>{if(phase==='aim'&&W.turn===0)aim+=d};
 function doShoot(){
  if(phase==='place'&&W.turn===0){const c=cue();if(!SN.dOk(W,c.x,c.y)){toast('ตำแหน่งลูกขาวไม่ถูกต้อง');return}W.inHand=false;const t0=SN.onBalls(W);const t=(W.freeBall?W.balls.filter(b=>!b.out&&b.type!=='cue'):t0).sort((a,b)=>Math.hypot(a.x-c.x,a.y-c.y)-Math.hypot(b.x-c.x,b.y-c.y))[0];if(t)aim=Math.atan2(t.y-c.y,t.x-c.x);setPhase('aim');banner('เล็งด้วยเมาส์/ลากบนโต๊ะ · ลากแถบ POWER · เลือก Spin แล้วกด SHOOT','',2600);return}
  if(phase!=='aim'||W.turn!==0||busy)return;shoot(aim,power,ox,oy,false)}
 o.onclick=async e=>{const t=e.target.closest('button');if(!t)return;
  if(t.hasAttribute('data-shoot')){doShoot();return}
  if(t.hasAttribute('data-ff')){ff=!ff;t.style.background=ff?'#2a6b3a':'';return}
  if(t.dataset.sp!=null){const [x,y]=t.dataset.sp.split(',').map(Number);setSpin(x,y);return}
  if(t.hasAttribute('data-exit')){
   if(busy)return;const ok=await U.confirmBox('ออกจากหน้าจอแข่งขัน? ระบบจะพักแมตช์ไว้ (เงินเดิมพันที่จ่ายแล้วยังอยู่) เล่นต่อได้ที่เคาน์เตอร์สโมสร','พักแมตช์');
   if(ok){commit();cleanup();o.hidden=true;if(onExit)onExit();else H().unlock()}return}
  if(t.hasAttribute('data-concede')){
   if(busy||phase==='roll'||phase==='over'||phase==='strike')return;
   const ok=await U.confirmBox('ยอมแพ้เฟรมนี้? คู่แข่งจะได้เฟรมไป','ยอมแพ้เฟรม');
   if(ok&&(phase==='aim'||phase==='place'||phase==='npc')){W.over=true;W.winner=1;frameEnd()}return}};
 const keyH=e=>{if(!alive)return;
  if(e.key==='Enter'||e.key===' '){e.preventDefault();doShoot()}
  else if(e.key==='ArrowLeft'||e.key==='a'){rot(e.shiftKey?.0009:.006)}
  else if(e.key==='ArrowRight'||e.key==='d'){rot(e.shiftKey?-.0009:-.006)}
  else if(e.key==='ArrowUp'||e.key==='w'){setPow(power+.02)}
  else if(e.key==='ArrowDown'||e.key==='s'){setPow(power-.02)}
  e.stopPropagation()};
 document.addEventListener('keydown',keyH,true);
 function holdRot(sel,d){const b=o.querySelector(sel);let iv=0;const go=()=>{rot(d)};b.addEventListener('pointerdown',e=>{e.preventDefault();go();iv=setInterval(go,40)});['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,()=>{clearInterval(iv)}))}
 holdRot('[data-aimL]',.004);holdRot('[data-aimR]',-.004);
 function cleanup(){alive=false;document.removeEventListener('keydown',keyH,true);window.removeEventListener('resize',resize);ambience(false)}
 /* ปุ่ม/ออกอื่น ๆ ที่ปิดโดยระบบ (ฉากถูกยกเลิก) */
 const guard=setInterval(()=>{if(!alive){clearInterval(guard);return}if(o.hidden){cleanup();clearInterval(guard)}},400);
 window.addEventListener('resize',resize);
 o.hidden=false;resize();setTimeout(resize,60);
 requestAnimationFrame(frame);physTick();
 if(resumed)banner('ต่อแมตช์ — เฟรม '+M.frameNo+' · '+W.scores[0]+'–'+W.scores[1],'',1800);
 else banner('เริ่มแข่งกับ '+npc.name+' · Lv.'+M.level+' '+LV.name,'',2000);
 setTimeout(()=>{if(alive)startTurn()},500);
 U._match={get W(){return W},get phase(){return phase},get M(){return M},shoot:doShoot,get aim(){return aim},set aim(v){aim=v},setPow,setSpin,get busy(){return busy},get sim(){return sim}};
}

/* ซื้อเครื่องดื่มที่บาร์ (ใช้ระบบเงินเดิม) */
function drink(){
 const price=80,s=SN.state();if(SN.money()<price){toast('เงินไม่พอซื้อเครื่องดื่ม');return false}
 SN.addMoney(-price);s.stats.drinks++;s.stats.spent+=price;SN.save();toast('🥤 ซื้อเครื่องดื่ม -฿'+price+' · สดชื่น!');return true}
function openStats(onClose){openClub(null,onClose,1);setTimeout(()=>{const t=document.querySelector('#snkClub [data-tab="stat"]');if(t)t.click()},0)}
U.openSnookerClub=openClub;U.openSnookerMatch=openMatch;U.snookerDrink=drink;U.snookerStats=openStats;U.snookerAmbience=ambience;
root.CS_UI=Object.assign(root.CS_UI||{},U);
})(typeof window!=='undefined'?window:globalThis);

