
/* =====================================================================
   YAKUZA ENDING · ภารกิจลับและฉากจบยากูซ่า (โมดูลแยก ต่อยอดจากระบบเดิม ไม่แก้ระบบเดิมนอกจากเพดานความสนิทริวจิ 999 → 1000)
   เชื่อมกับของเดิม:
   - ความสนิทริวจิ        S.yk.cl.r           (โมดูล mct-yakuza-js · ปรับเพดาน 999 → 1000)
   - สมุดภารกิจ           #qJ (ฉีดการ์ดภารกิจลับด้วย MutationObserver)
   - คัตซีน               QCUT.defs / QCUT.play (ระบบคัทซีนเนื้อเรื่องเดิม) + QCUT.state()
   - เปลี่ยนชุด           S.ceoOutfitId='dragon' + WARD.apply() (ตู้เสื้อผ้าเดิม)
   - เงิน/ชื่อเสียง       S.money · S.today.inc · S.tot.earn · S.rep (กฎขอบเขตเดิม ≥ 0) · log()
   - ปฏิทิน/เวลา          S.day (30 วัน/เดือน) · endDay() เดิมทีละวันผ่านระบบเดิมทุกตัว (เงินเดือน บิล หนี้ ค่าจ้างลูกน้อง)
   - เซฟ                  S.yakuzaEnding ไปกับ save() เดิม (localStorage 'mct2')
   - เริ่มเกมใหม่          A.reset(1) เดิม (หลัง gameConfirm เท่านั้น)
   สถานะ: LOCKED · UNLOCKED · OFFERED · DECLINED · ACCEPTED · PREPARATION · EQUIPMENT_CONFIRMED · CINEMATIC_RUNNING
          BAD_END · TRUE_END · TIME_SKIP_PROCESSING · COMPLETED
   ===================================================================== */
(function(){
'use strict';
const NEED=1000,REWARD=1500000,REP_LOSS=200,SKIP_DAYS=90;
/* คำตอบที่ถูกต้อง แยกเก็บจาก UI (UI ไม่แสดงคำตอบ) */
const CFG={answers:{outfit:'SHADOW',missionKit:'KIT C',specialItem:'ITEM B'}};
const CAT=[
 {key:'outfit',title:'OUTFIT',th:'ชุดปฏิบัติการ',hint:'“คืนนั้นฉันไม่อยากให้ใครจำหน้าคุณได้ แม้แต่กล้องบนเพดาน… ให้คุณกลายเป็นเงาของที่นั่น”',opts:[
  {id:'SHADOW',d:'ชุดดำเรียบสนิท ไร้ลวดลาย ไม่สะท้อนแสง'},{id:'FORMAL',d:'สูทเต็มยศ ภูมิฐาน สง่างามสะดุดตา'},{id:'CASUAL',d:'ชุดลำลองสบาย ๆ ดูเป็นคนทั่วไปในเมือง'}]},
 {key:'missionKit',title:'MISSION KIT',th:'ชุดอุปกรณ์ภารกิจ',hint:'“ไปให้พร้อม แต่อย่าแบกจนก้าวไม่ออก ฉันเคยเห็นคนล้มเพราะกระเป๋าหนักเกินตัว… และคนที่ไปมือเปล่าก็กลับมาไม่ครบเหมือนกัน”',opts:[
  {id:'KIT A',d:'เน้นความเร็วและความคล่องตัว'},{id:'KIT B',d:'เน้นความครบมือทุกสถานการณ์'},{id:'KIT C',d:'เน้นความพอดี ไม่ขาดไม่เกิน'}]},
 {key:'specialItem',title:'SPECIAL ITEM',th:'ไอเทมพิเศษ',hint:'“คนที่พลาดมักไม่ได้พลาดเพราะฝีมือ แต่เพราะไม่มีใครบอกอีกฝั่งว่าเกิดอะไรขึ้น… ฉันจะนั่งฟังอยู่ข้างนอกตลอดเวลา”',opts:[
  {id:'ITEM A',d:'นาฬิกาพกจับเวลา'},{id:'ITEM B',d:'วิทยุสื่อสารพกพา'},{id:'ITEM C',d:'แผนผังตึกฉบับย่อ'}]}
];
const OFFER=[
 'ริวจิ|…มาตรงเวลาพอดี ฉันชอบคนที่รักษาเวลา',
 'ริวจิ|นั่งลงเถอะ ฉันสังเกตคุณมานาน ตั้งแต่วันที่คุณมองตาฉันแล้วบอกว่าจะคืนเงินให้ครบ… และคุณก็คืนจริง ๆ',
 'ริวจิ|คนในย่านนี้ที่ฉันไว้ใจได้ มีไม่ถึงนิ้วมือข้างเดียว วันนี้ฉันนับคุณเป็นหนึ่งในนั้น',
 'ริวจิ|ฉันมีงานหนึ่งชิ้น… ร้านเพชรกลางเมือง คืนเดียว ไม่มีใครรู้ ถ้าสำเร็จ เงินก้อนนั้นจะทำให้บริษัทของคุณไม่ต้องสะดุ้งกับตัวเลขอีกเลย',
 'ริวจิ|แต่จำไว้ ถ้าพลาด ไม่มีใครมาช่วยคุณ และฉันจะไม่รู้จักคุณ',
 'ริวจิ|งานแบบนี้ชนะกันที่การเตรียมตัว ก่อนไป ฉันให้คุณเลือกของสามอย่าง… ฟังคำแนะนำของฉันให้ดี',
 'ริวจิ|'+CAT[0].hint.replace(/[“”]/g,''),
 'ริวจิ|'+CAT[1].hint.replace(/[“”]/g,''),
 'ริวจิ|'+CAT[2].hint.replace(/[“”]/g,''),
 'ริวจิ|ฉันไม่บังคับ คุณเดินออกจากห้องนี้ตอนนี้ได้ แล้วเราจะทำเหมือนไม่เคยคุยกัน… ตอบมา'
];
const $=id=>document.getElementById(id);
const okS=()=>{try{return typeof S==='object'&&S&&Array.isArray(S.emp)&&typeof QCUT!=='undefined'&&typeof LOAN_PORT!=='undefined'}catch(e){return false}};
const fm=n=>{try{return M(n)}catch(e){return '฿'+Math.round(n).toLocaleString('en-US')}};
const TH=n=>Number(n).toLocaleString('en-US');
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------------------------------------------------------------- state */
function ye(){
 if(!S.yakuzaEnding||typeof S.yakuzaEnding!=='object')S.yakuzaEnding={};
 const y=S.yakuzaEnding;
 if(!y.questStatus)y.questStatus='LOCKED';
 if(typeof y.unlocked!=='boolean')y.unlocked=false;
 if(typeof y.accepted!=='boolean')y.accepted=false;
 if(!y.selectedEquipment||typeof y.selectedEquipment!=='object')y.selectedEquipment={outfit:null,missionKit:null,specialItem:null};
 ['outfit','missionKit','specialItem'].forEach(k=>{if(y.selectedEquipment[k]===undefined)y.selectedEquipment[k]=null});
 ['equipmentConfirmed','rewardClaimed','reputationApplied','timeSkipCompleted','endingCompleted'].forEach(k=>{if(typeof y[k]!=='boolean')y[k]=false});
 if(y.endingResult===undefined)y.endingResult=null;
 return y;
}
function setSt(s){const y=ye();y.questStatus=s;try{save(1)}catch(e){}}
let prevPaused=null;
function hold(){if(prevPaused===null){prevPaused=S.paused||0}S.paused=1}
function release(){if(prevPaused!==null){S.paused=prevPaused;prevPaused=null}}
function busyNow(){
 try{if(S.over)return 'เกมจบแล้ว'}catch(e){}
 try{if(window.CUT&&CUT.on)return 'กำลังอยู่ในฉากอื่น'}catch(e){}
 try{if(QCUT.on())return 'กำลังอยู่ในคัตซีน'}catch(e){}
 try{if(window.TUT&&TUT.info&&TUT.info().phase&&TUT.info().phase!=='off')return 'กำลังอยู่ในช่วงฝึกสอน'}catch(e){}
 try{if(window.GHOST){const p=GHOST.status().phase;if(p&&p!=='idle'&&p!=='done')return 'ผีกำลังไล่ตาม';if(GHOST.streetBusy&&GHOST.streetBusy())return 'ผีกำลังไล่ตาม'}}catch(e){}
 try{if(document.body.classList.contains('ykBusy'))return 'กำลังดำเนินภารกิจอยู่'}catch(e){}
 return '';
}

/* ---------------------------------------------------------------- unlock (ครั้งเดียว) */
function checkUnlock(){
 if(!okS())return;
 const y=ye();
 if(y.questStatus!=='LOCKED'||y.unlocked)return;
 if(((S.yk&&S.yk.cl&&S.yk.cl.r)||0)>=NEED){
  y.unlocked=true;y.questStatus='UNLOCKED';y.unlockedDay=S.day;
  try{log('🔴 ภารกิจลับถูกปลดล็อก: [ลึกลับ] — ริวจิมีเรื่องสำคัญต้องการคุยกับคุณ (ดูในสมุดภารกิจ)')}catch(e){}
  try{toast('🔴 SECRET QUEST ปลดล็อกแล้ว! ดูที่สมุดภารกิจ')}catch(e){}
  try{save(1)}catch(e){}
 }
}

/* ---------------------------------------------------------------- DOM */
let dlg,prep,endEl,fadeEl,dom=false;
function ensureDom(){
 if(dom)return;dom=true;
 dlg=document.createElement('div');dlg.id='ykDlg';dlg.setAttribute('role','dialog');dlg.setAttribute('aria-label','ริวจิ');
 dlg.innerHTML='<div class="ykBox"><span class="ykTag">SECRET QUEST</span><img class="ykPor" id="ykPor" alt="ริวจิ"><div class="ykMain"><div class="ykNm" id="ykNm"></div><div class="ykTx" id="ykTx"></div><div class="ykCh" id="ykCh"></div></div><span class="ykNx" id="ykNx">▼ แตะ/Enter</span></div>';
 document.body.appendChild(dlg);
 prep=document.createElement('div');prep.id='ykPrep';prep.setAttribute('role','dialog');prep.setAttribute('aria-label','เตรียมภารกิจ');document.body.appendChild(prep);
 endEl=document.createElement('div');endEl.id='ykEnd';document.body.appendChild(endEl);
 fadeEl=document.createElement('div');fadeEl.id='ykFade';fadeEl.innerHTML='<div><div class="ykTs" id="ykTs"></div><div class="ykDt" id="ykDt"></div></div>';document.body.appendChild(fadeEl);
 dlg.addEventListener('pointerdown',e=>{if(e.target.closest('.ykCh'))return;e.preventDefault();dlgTap()});
}
window.addEventListener('keydown',e=>{
 if(!dlg||!dlg.classList.contains('on'))return;
 if(e.key===' '||e.key==='Enter'||e.key==='e'||e.key==='E'){if(e.target&&e.target.closest&&e.target.closest('.ykCh'))return;e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)dlgTap();return}
 e.stopImmediatePropagation();
},true);

/* ---------------------------------------------------------------- บทสนทนาหัวหน้าแก๊ง */
let D={on:false,lines:[],i:0,full:'',typed:0,tm:0,choices:false};
function porSrc(){try{return LOAN_PORT.boss}catch(e){return ''}}
function openOffer(){
 ensureDom();
 const y=ye();
 setSt('OFFERED');
 document.body.classList.add('ykBusy');hold();
 D={on:true,lines:OFFER.slice(),i:0,full:'',typed:0,tm:0,choices:false,final:false};
 $('ykPor').src=porSrc();
 dlg.classList.add('on');$('ykCh').innerHTML='';
 showLine();
 clearInterval(D.tm);D.tm=setInterval(typeTick,28);
}
function showLine(){
 const raw=D.lines[D.i]||'';const k=raw.indexOf('|');
 $('ykNm').textContent=k>0?raw.slice(0,k):'';D.full=k>0?raw.slice(k+1):raw;D.typed=0;$('ykTx').textContent='';$('ykNx').style.visibility='hidden';
}
function typeTick(){
 if(!D.on)return;
 if(D.typed<D.full.length){D.typed=Math.min(D.full.length,D.typed+1);$('ykTx').textContent=D.full.slice(0,D.typed);if(D.typed>=D.full.length)lineDone()}
}
function lineDone(){
 if(D.final)return;
 if(D.i>=D.lines.length-1&&!D.choices){D.choices=true;showChoices()}
 else $('ykNx').style.visibility='visible';
}
function dlgTap(){
 if(!D.on||D.choices&&D.i>=D.lines.length-1&&D.typed>=D.full.length)return;
 if(D.typed<D.full.length){D.typed=D.full.length;$('ykTx').textContent=D.full;lineDone();return}
 if(D.i<D.lines.length-1){D.i++;showLine()}
}
function showChoices(){
 $('ykNx').style.visibility='hidden';
 const c=$('ykCh');c.innerHTML='<button type="button" class="ykBtn" id="ykYes">ตอบรับข้อเสนอ</button><button type="button" class="ykBtn ykNo" id="ykNo">ปฏิเสธข้อเสนอ</button>';
 $('ykYes').onclick=accept;$('ykNo').onclick=decline;
 try{$('ykYes').focus()}catch(e){}
}
function closeDlg(){D.on=false;clearInterval(D.tm);dlg.classList.remove('on');$('ykCh').innerHTML=''}
function decline(){
 if(!D.on)return;
 const y=ye();
 if(y.questStatus!=='OFFERED')return;
 // ปฏิเสธ: ไม่หักเงิน ไม่ลดชื่อเสียง ไม่เปลี่ยนเวลา — กลับไปเล่นปกติ
 D.choices=true;D.final=1;
 $('ykCh').innerHTML='';
 D.lines=['ริวจิ|…ฉลาด หรือขี้ขลาด เวลาจะบอกเอง ประตูห้องนี้ยังเปิดอยู่เสมอ'];D.i=0;showLine();
 D.after=function(){closeDlg();setSt('DECLINED');document.body.classList.remove('ykBusy');release();try{toast('คุณปฏิเสธข้อเสนอของริวจิ — กลับมาคุยใหม่ได้จากสมุดภารกิจ')}catch(e){}};
 const wait=setInterval(()=>{if(D.typed>=D.full.length){clearInterval(wait);setTimeout(()=>{if(D.after){const f=D.after;D.after=null;f()}},1600)}},60);
}
function accept(){
 if(!D.on)return;
 const y=ye();
 if(y.questStatus!=='OFFERED')return;
 closeDlg();
 y.accepted=true;setSt('ACCEPTED');setSt('PREPARATION');
 openPrep();
}

/* ---------------------------------------------------------------- เลือกอุปกรณ์ */
function openPrep(){
 ensureDom();document.body.classList.add('ykBusy');hold();
 renderPrep();prep.classList.add('on');
}
function renderPrep(){
 const y=ye(),sel=y.selectedEquipment,lock=y.equipmentConfirmed;
 const done=sel.outfit&&sel.missionKit&&sel.specialItem;
 prep.classList.toggle('lock',!!lock);
 prep.innerHTML='<div class="ykWin"><h2>MISSION PREPARATION</h2><div class="ykSub">YAKUZA ENDING · เลือกให้ครบทั้ง 3 หมวด · หมวดละ 1 รายการ · เมื่อยืนยันแล้วจะเปลี่ยนไม่ได้</div>'+
  CAT.map(c=>'<div class="ykCat"><h4>'+esc(c.title)+' · '+esc(c.th)+'</h4><p class="ykHint">ริวจิ: '+esc(c.hint)+'</p><div class="ykOpts">'+
   c.opts.map(o=>'<button type="button" class="ykOpt'+(sel[c.key]===o.id?' sel':'')+'" data-k="'+c.key+'" data-v="'+esc(o.id)+'" '+(lock?'disabled':'')+'><b>'+esc(o.id)+'</b>'+esc(o.d)+'</button>').join('')+'</div></div>').join('')+
  '<div class="ykFt"><button type="button" class="ykBtn ykNo" id="ykBack" '+(lock?'disabled':'')+'>← ย้อนกลับ</button><button type="button" class="ykBtn" id="ykOk" '+(done&&!lock?'':'disabled')+'>ยืนยันภารกิจ</button></div></div>';
 prep.querySelectorAll('.ykOpt').forEach(b=>b.onclick=()=>{
  if(ye().equipmentConfirmed)return;
  ye().selectedEquipment[b.dataset.k]=b.dataset.v;try{save(1)}catch(e){}renderPrep();
 });
 $('ykBack').onclick=()=>{if(ye().equipmentConfirmed)return;prep.classList.remove('on');document.body.classList.remove('ykBusy');release();try{toast('ภารกิจยังรออยู่ในสมุดภารกิจ — เลือกอุปกรณ์ต่อได้เมื่อพร้อม')}catch(e){}};
 $('ykOk').onclick=confirmEquip;
}
function evaluate(){
 const s=ye().selectedEquipment,a=CFG.answers;
 return s.outfit===a.outfit&&s.missionKit===a.missionKit&&s.specialItem===a.specialItem;
}
const MAX_WRONG=3;   // เลือกผิดได้ 2 ครั้งแรกแล้วริวจิถามย้ำ · ผิดครั้งที่ 3 → ล็อกคำตอบ
function say(line,after){   // ริวจิพูดหนึ่งประโยคในกล่องบทสนทนาเดิม (เหนือหน้าต่างเตรียมภารกิจ)
 ensureDom();
 clearInterval(D.tm);
 D={on:true,lines:[line],i:0,full:'',typed:0,tm:0,choices:true,final:1,after:after||null};
 $('ykPor').src=porSrc();$('ykCh').innerHTML='';
 dlg.classList.add('top');dlg.classList.add('on');
 showLine();D.tm=setInterval(typeTick,28);
 const wait=setInterval(()=>{
  if(!D.on||D.lines[0]!==line){clearInterval(wait);return}
  if(D.typed>=D.full.length){clearInterval(wait);setTimeout(()=>{
   if(!D.on||D.lines[0]!==line)return;
   const f=D.after;D.after=null;closeDlg();dlg.classList.remove('top');if(f)f();
  },1500)}
 },60);
}
function lockAndGo(result,line){
 const y=ye();
 y.equipmentConfirmed=true;
 y.endingResult=result;                    // ล็อกผลทันที ก่อนเริ่มคัตซีน (โหลดเซฟใหม่ก็เปลี่ยนไม่ได้)
 y.prevOutfit=S.ceoOutfitId||'suit';
 y.questStatus='EQUIPMENT_CONFIRMED';
 try{save(1)}catch(e){}
 renderPrep();
 say(line,()=>{prep.classList.remove('on');startCinematic()});
}
function confirmEquip(){
 const y=ye(),s=y.selectedEquipment;
 if(y.equipmentConfirmed||!(s.outfit&&s.missionKit&&s.specialItem))return;
 if(y.questStatus!=='PREPARATION')return;
 if(D.on)return;                           // ริวจิกำลังพูดอยู่
 if(evaluate()){lockAndGo('TRUE','ริวจิ|ไปลุยกันเลย');return}
 y.wrongTries=(y.wrongTries||0)+1;
 try{save(1)}catch(e){}
 if(y.wrongTries>=MAX_WRONG){lockAndGo('BAD','ริวจิ|งั้น… แล้วแต่นาย');return}
 say('ริวจิ|จะเลือกแบบนี้จริง ๆ หรอ?',()=>{try{const b=$('ykOk');if(b)b.focus()}catch(e){}});
}

/* ---------------------------------------------------------------- คัตซีน (ผ่านระบบคัตซีนเดิม QCUT) */
let hbw=null;
function bang(){try{if(localStorage.getItem('mct_sound')==='0')return;const A=window.AudioContext||window.webkitAudioContext;if(!A)return;hbw=hbw||new A();if(hbw.state==='suspended')hbw.resume();const t=hbw.currentTime,n=hbw.sampleRate*.5,b=hbw.createBuffer(1,n,hbw.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,3);const s=hbw.createBufferSource();s.buffer=b;const g=hbw.createGain();g.gain.value=.5;s.connect(g);g.connect(hbw.destination);s.start(t)}catch(e){}}
let porImg=null;
function boss(){if(!porImg){porImg=new Image();porImg.src=porSrc()}return porImg.complete&&porImg.naturalWidth?porImg:null}
let ryImg=null;
function ryuji(g,x,y,h){ // ริวจิตัวละครจริง (สไปรต์เดิมของ LOAN) หันซ้าย ยืนหายใจเบา ๆ
 try{if(!ryImg){ryImg=new Image();ryImg.src=LOAN_SPR.boss}}catch(e){return false}
 if(!ryImg.complete||!ryImg.naturalWidth)return false;
 const w=h*64/96,bob=Math.sin(tNow()*2.2)*1.6;
 g.save();g.fillStyle='rgba(0,0,0,.32)';g.beginPath();g.ellipse(x,y+2,h*.2,h*.045,0,0,Math.PI*2);g.fill();
 g.imageSmoothingEnabled=false;g.drawImage(ryImg,0,2*96,64,96,Math.round(x-w/2),Math.round(y-h*.97+bob),Math.round(w),Math.round(h));g.restore();return true}
const WW=640,HH=360;
let shotFlags={};
const ST=()=>{try{return QCUT.state()}catch(e){return null}};
const tNow=()=>{const s=ST();return s?s.t:0};
const U=d=>Math.min(1,tNow()/d);
function office(C){const g=C.g();C.wall(214,'#1c1626');C.floor(214,'#2c2030','#271c2b');C.win(60,50,120,90,['#0a0620','#2a1245']);C.stars(14,3);C.lamp(330,40,true);C.desk(120,208,170,'#4a2f33')}
function street(C,o){o=o||{};const g=C.g();C.sky('night');C.stars(36,2);C.moon(520,52,14);C.city(236,o.seed||9,['#0d0a1c','#140d24','#0a0814'],'#ff9ad0');g.fillStyle='#07060d';g.fillRect(0,236,WW,HH-236);g.fillStyle='rgba(255,40,90,.10)';g.fillRect(0,236,WW,6);
 for(let i=0;i<7;i++){const x=40+i*96,a=.5+.5*Math.sin(tNow()*3+i*1.7);g.globalAlpha=.35+.35*a;g.fillStyle=i%2?'#ff2a6a':'#22d8ff';g.fillRect(x,150+(i%3)*14,26,6);g.globalAlpha=1}
 if(o.rain)C.rain(110,.45)}
function shop(C,glow){const g=C.g();const x=190,y=120,w=260,h=130;g.fillStyle='#120a1a';g.fillRect(x,y,w,h);g.fillStyle='#0a0610';g.fillRect(x+16,y+44,w-32,h-44);
 g.fillStyle='rgba(120,200,255,'+(.15+.1*Math.sin(tNow()*2))+')';g.fillRect(x+20,y+50,w-40,h-52);
 const a=.65+.35*Math.sin(tNow()*5);g.save();g.shadowColor='#ff2a6a';g.shadowBlur=14;g.fillStyle='rgba(255,60,120,'+a+')';g.font='bold 22px sans-serif';g.textAlign='center';g.fillText('DIAMOND',x+w/2,y+30);g.restore();
 // เครื่องเพชรแบบสมมติ (ไอคอนเรืองแสง)
 for(let i=0;i<5;i++){const gx=x+50+i*40,gy=y+82;g.save();g.translate(gx,gy);g.rotate(Math.PI/4);g.globalAlpha=glow?(.7+.3*Math.sin(tNow()*4+i)):.35;g.fillStyle=glow?'#bff2ff':'#7aa';g.fillRect(-7,-7,14,14);g.restore()}}
function shotsCommon(){return[
 {d:1.3,cap:'',fn:C=>{const g=C.g();g.fillStyle='#000';g.fillRect(-WW,-HH,WW*3,HH*3)}},   // ตัดเป็นฉากดำก่อน ไม่ให้เห็นผู้เล่นแว็บเดียวก่อนคัตซีนเริ่ม
 {d:3.8,cap:'*|ห้องทำงานของ CEO ยามดึก… ชุดสีดำถูกวางไว้บนโต๊ะ ราวกับรอเจ้าของมานาน',cam:[1,1.12,320,170,330,190],fn:C=>{office(C);const t=tNow();C.npc('ceo',330,320,230);
  if(t>1.9&&!shotFlags.out){shotFlags.out=1;try{S.ceoOutfitId='dragon';WARD.apply()}catch(e){}}
  const f=Math.max(0,1-Math.abs(t-1.9)/.35);C.flash(f*.9);C.vig(.55)}},
 {d:3.4,cap:'*|ชุดยากูซ่าถูกสวมทับตัวตนของ CEO… จากนี้ไม่มีทางย้อนกลับ',cam:[1.05,1.35,320,200,326,170],fn:C=>{office(C);try{WARD.apply()}catch(e){}C.npc('ceo',330,330,260);C.aura(330,200,120,'rgba(255,40,70,.28)');C.vig(.7)}}
]}
function drive(C){street(C,{rain:false});const t=tNow();C.car(-120+Math.min(1,t/3.4)*520,300,1.7,0);C.vig(.5)}
function frontShop(C,glow){street(C,{seed:5});shop(C,glow);const t=tNow(),k=Math.min(1,t/3.4);C.npc('ceo',90+k*140,330,170,{dir:1});C.vig(.55)}
function DEF_BAD(){return[
 ...shotsCommon(),
 {d:3.6,cap:'*|รถสีดำเลื่อนออกจากตึก มุ่งหน้าสู่ใจกลางเมืองยามค่ำคืน',fn:drive},
 {d:3.8,cap:'*|ป้ายนีออนของร้านเพชรสะท้อนบนถนนเปียก… ความเงียบก่อนพายุ',cam:[1,1.15,320,190,320,180],fn:C=>frontShop(C,false)},
 {d:3.6,cap:'ริวจิ|(เสียงในวิทยุ) …ผิดแผน! ออกมาเดี๋ยวนี้!',fn:C=>{const g=C.g();street(C,{seed:5});shop(C,false);const t=tNow(),a=.35+.35*Math.abs(Math.sin(t*7));g.fillStyle='rgba(255,0,30,'+a*.5+')';g.fillRect(0,0,WW,HH);C.npc('ceo',320,330,200);C.vig(.7)}},
 {d:3.2,cap:'*|สัญญาณเตือนดังลั่น ทุกอย่างเกิดขึ้นในพริบตา…',cam:[1,1.3,320,190,320,200],fn:C=>{const g=C.g();street(C,{seed:5});shop(C,false);const t=tNow(),s=Math.sin(t*38)*3*U(3.2);g.save();g.translate(s,-s);const a=Math.sin(t*9)>0?.55:.2;g.fillStyle='rgba(255,0,30,'+a+')';g.fillRect(-5,-5,WW+10,HH+10);g.restore();C.npc('ceo',320+s,330,210);C.vig(.8)}},
 {d:3.2,cap:'*|เสียงปืนนัดเดียวดังก้องไปทั่วซอย…',fn:C=>{const g=C.g();street(C,{seed:5});const t=tNow();if(t>.8&&!shotFlags.bang){shotFlags.bang=1;bang()}
  const fall=Math.max(0,Math.min(1,(t-.9)/1.1));g.save();g.translate(320,330);g.rotate(fall*Math.PI/2*.95);g.translate(-320,-330);C.npc('ceo',320,330,210,{a:1-fall*.3});g.restore();C.flash(Math.max(0,1-Math.abs(t-.85)/.14)*.95);C.vig(.9)}},
 {d:4.2,cap:'*|CEO ล้มลง… ภาพค่อย ๆ มืดสนิท',fn:C=>{const g=C.g();street(C,{seed:5});g.save();g.translate(320,338);g.rotate(Math.PI/2*.95);g.translate(-320,-338);C.npc('ceo',320,338,210,{a:.7});g.restore();g.globalAlpha=Math.min(1,U(4.2)*1.15);g.fillStyle='#000';g.fillRect(0,0,WW,HH);g.globalAlpha=1}}
]}
function DEF_TRUE(){return[
 ...shotsCommon(),
 {d:3.6,cap:'*|รถสีดำเลื่อนออกจากตึก มุ่งหน้าสู่ใจกลางเมืองยามค่ำคืน',fn:drive},
 {d:3.8,cap:'*|ป้ายนีออนของร้านเพชรเรืองแสงอยู่เหนือถนนเงียบ… ทุกอย่างเป็นไปตามจังหวะ',cam:[1,1.15,320,190,320,180],fn:C=>frontShop(C,true)},
 {d:3.8,cap:'ริวจิ|(เสียงในวิทยุ) …นิ่งมาก ไปต่อได้ ทุกอย่างเรียบร้อย',fn:C=>{const g=C.g();street(C,{seed:5});shop(C,true);C.aura(320,200,170,'rgba(150,230,255,.25)');C.npc('ceo',320,330,210);C.vig(.6)}},
 {d:3.4,cap:'*|MISSION COMPLETE — ภารกิจสำเร็จ',fn:C=>{const g=C.g();C.sky('night');g.fillStyle='#000';g.fillRect(0,0,WW,HH);const t=tNow(),k=Math.min(1,t/1.2);g.save();g.globalAlpha=k;g.shadowColor='#ffd45a';g.shadowBlur=22;g.fillStyle='#ffd45a';g.font='bold 40px sans-serif';g.textAlign='center';g.fillText('MISSION COMPLETE',WW/2,HH/2);g.restore();C.aura(WW/2,HH/2,260,'rgba(255,200,60,.18)')}},
 {d:3.8,cap:'*|ก่อนเสียงไซเรนแรกจะดังขึ้น… CEO หายเข้าไปในสายฝนและแสงนีออน',fn:C=>{street(C,{rain:true,seed:7});const t=tNow();C.car(-140+Math.min(1,t/3.2)*820,305,1.9,0);C.vig(.6)}},
 {d:3.6,cap:'ริวจิ|ฮ่า… ฉันไม่ได้เลือกคนผิดจริง ๆ',fn:C=>{const g=C.g();C.wall(214,'#20141a');C.floor(214,'#2d1d22','#28191e');g.fillStyle='rgba(255,40,70,.08)';g.fillRect(0,0,WW,HH);C.npc('ceo',200,330,230,{flip:0});C.aura(470,220,110,'rgba(255,60,80,.16)');if(!ryuji(g,470,330,236))C.sil(470,330,230,'#0a0610');C.vig(.6)}},
 {d:3.6,cap:'ริวจิ|ของคุณ… ครบตามที่สัญญา นับดูก็ได้',fn:C=>{const g=C.g();C.wall(214,'#20141a');C.floor(214,'#2d1d22','#28191e');C.npc('ceo',200,330,230);if(!ryuji(g,480,330,236))C.sil(480,330,230,'#0a0610');
  const k=Math.min(1,tNow()/1.3);g.fillStyle='#2a1a0a';g.fillRect(290,260-k*10,110,56);g.strokeStyle='#d9a441';g.strokeRect(290,260-k*10,110,56);g.save();g.shadowColor='#ffd45a';g.shadowBlur=14;g.fillStyle='#ffd45a';g.font='bold 18px sans-serif';g.textAlign='center';g.fillText('฿ 1,500,000',345,294-k*10);g.restore();C.aura(345,280,90,'rgba(255,200,60,.25)');C.vig(.55)}},
 {d:3.8,cap:'*|เงินก้อนโตถูกส่งถึงมือ… แต่บางสิ่งที่เสียไป ก็ไม่อาจซื้อคืนได้',fn:C=>{const g=C.g();street(C,{seed:3});C.npc('ceo',320,338,220);g.globalAlpha=Math.max(0,(U(3.8)-.55)/.45);g.fillStyle='#000';g.fillRect(0,0,WW,HH);g.globalAlpha=1;C.vig(.7)}}
]}
function registerDefs(){
 try{
  QCUT.defs.yk_bad={id:'yk_bad',title:'YAKUZA ENDING · BAD END',shots:DEF_BAD(),end:1};
  QCUT.defs.yk_true={id:'yk_true',title:'YAKUZA ENDING · TRUE END',shots:DEF_TRUE(),end:1};
 }catch(e){console.error('[yakuza-ending] defs',e)}
}
function startCinematic(){
 const y=ye();
 if(y.questStatus!=='EQUIPMENT_CONFIRMED'&&y.questStatus!=='CINEMATIC_RUNNING')return;
 y.questStatus='CINEMATIC_RUNNING';try{save(1)}catch(e){}
 document.body.classList.add('ykBusy');
 registerDefs();shotFlags={};
 const id=y.endingResult==='TRUE'?'yk_true':'yk_bad';
 let started=false;
 try{started=QCUT.play(id,()=>afterCinematic(),{force:1})}catch(e){console.error(e)}
 if(!started)setTimeout(afterCinematic,50);
 // ซ่อนฟองปัญหา: ระบบคัตซีนเดิมเซ็ต S.paused เอง และคืนค่าเองเมื่อจบ
}
function afterCinematic(){
 const y=ye();
 if(y.questStatus!=='CINEMATIC_RUNNING')return;
 try{S.ceoOutfitId='dragon';WARD.apply()}catch(e){}
 if(y.endingResult==='TRUE'){y.questStatus='TRUE_END';try{save(1)}catch(e){}trueEnd()}
 else{y.questStatus='BAD_END';badEnd()}
}

/* ---------------------------------------------------------------- BAD ENDING */
function badEnd(){
 const y=ye();
 // ไม่มีรางวัล · ไม่เข้า TRUE ENDING · เล่นต่อไม่ได้ (S.over) · ไม่ลบเซฟเดิมอัตโนมัติ
 y.questStatus='BAD_END';y.endingResult='BAD';
 S.over=1;S.badSeen=1;
 try{save(1)}catch(e){}
 showBad();
}
function showBad(){
 ensureDom();document.body.classList.add('ykOver');document.body.classList.remove('ykBusy');
 hold();
 endEl.className='on bad';
 endEl.innerHTML='<div class="ykIn"><div class="ykKicker">YAKUZA ENDING</div><h1>BAD END</h1><div class="ykNeon"></div><div class="ykQ">“ความโลภมีราคาที่ต้องจ่าย”</div><div class="ykGo">GAME OVER</div><button type="button" class="ykBtn" id="ykNew">NEW GAME</button></div>';
 $('ykNew').onclick=async()=>{
  let ok=false;try{ok=await window.gameConfirm('เริ่มเกมใหม่? เซฟเดิมจะถูกแทนที่','เริ่มเกมใหม่')}catch(e){ok=confirm('เริ่มเกมใหม่? เซฟเดิมจะถูกแทนที่')}
  if(ok){try{A.reset(1)}catch(e){location.reload()}}
 };
}

/* ---------------------------------------------------------------- TRUE ENDING */
function applyRewards(){
 const y=ye();
 if(!y.rewardClaimed){
  y.rewardClaimed=true;       // ตั้งธงก่อน แล้วเซฟพร้อมกันในก้อนเดียว → โหลดเซฟแล้วไม่ซ้ำ
  S.money+=REWARD;try{S.today.inc+=REWARD;S.tot.earn+=REWARD}catch(e){}
  try{log('💰 [YAKUZA ENDING] ได้รับเงินตอบแทนจากริวจิ +'+fm(REWARD))}catch(e){}
  y.rewardAmount=REWARD;
  try{save(1)}catch(e){}
 }
 if(!y.reputationApplied){
  y.reputationApplied=true;
  const before=S.rep||0;S.rep=Math.max(0,before-REP_LOSS);y.repDelta=S.rep-before;   // เคารพขอบเขตล่างเดิมของเกม (ไม่ต่ำกว่า 0)
  try{log('📉 [YAKUZA ENDING] ชื่อเสียงบริษัท '+y.repDelta+' คะแนน')}catch(e){}
  try{save(1)}catch(e){}
 }
}
function trueEnd(){
 const y=ye();
 applyRewards();
 if(!y.timeSkipCompleted){
  if(!y.startDay){y.startDay=S.day;y.startT=S.t;y.targetDay=S.day+SKIP_DAYS}
  y.questStatus='TIME_SKIP_PROCESSING';try{save(1)}catch(e){}
  timeSkip();
 }else summary();
}
const dateTxt=d=>{const k=Math.floor((d-1)/30);return 'ปีที่ '+(Math.floor(k/12)+1)+' · เดือน '+(k%12+1)+' · วันที่ '+(((d-1)%30)+1)+' (วันเกมที่ '+d+')'};
function fadeTo(on,cb,ms){fadeEl.classList.add('on');requestAnimationFrame(()=>requestAnimationFrame(()=>{fadeEl.classList.toggle('show',on)}));setTimeout(()=>{if(!on)fadeEl.classList.remove('on');if(cb)cb()},ms||1700)}
function timeSkip(){
 ensureDom();document.body.classList.add('ykBusy');hold();
 const y=ye();
 $('ykTs').textContent='สามเดือนผ่านไป...';$('ykDt').textContent=dateTxt(S.day);
 fadeTo(true,()=>runSkip(),1700);
}
function runSkip(){
 const y=ye();
 const _toast=window.toast;let stub=false;
 try{window.toast=function(){};stub=true}catch(e){}
 const evKeep=S.evNext;
 function finish(){
  if(stub)try{window.toast=_toast}catch(e){}
  S.evNext=Math.max(S.day+3,y.targetDay+3);   // ไม่ให้เหตุการณ์สุ่มเกิดย้อนหลัง/ซ้อนทันทีหลังข้ามเวลา
  S.t=(y.startT!=null?y.startT:360);S.paused=1;
  y.timeSkipCompleted=true;
  try{save(1)}catch(e){}
  try{hud()}catch(e){}try{show()}catch(e){}
  $('ykDt').textContent=dateTxt(S.day);
  setTimeout(()=>fadeTo(false,summary,1700),900);
 }
 function pump(){
  let n=0;
  try{
   while(S.day<y.targetDay&&!S.over&&n++<4){
    S.evNext=y.targetDay+5;
    S.t=1440;
    endDay();             // ระบบสิ้นวันเดิม: เงินเดือน ค่าน้ำไฟ(accrue) หนี้/ดอกเบี้ย ค่าจ้างลูกน้อง ฯลฯ
    try{ // ชำระบิลค่าน้ำค่าไฟที่ครบกำหนดตามกฎเดิม (ถ้าเงินพอ) แทนการเปิดหน้าต่างให้ผู้เล่นกด
     const u=S.utilities;if(u&&u.bill&&!u.bill.paid&&S.money>=u.bill.amount&&typeof utilityPay==='function')utilityPay();
    }catch(e){}
   }
  }catch(e){console.error('[yakuza-ending] skip',e)}
  $('ykDt').textContent=dateTxt(S.day);
  if(S.day<y.targetDay&&!S.over)setTimeout(pump,30);
  else finish();
 }
 pump();
}
function summary(){
 ensureDom();
 const y=ye();
 endEl.className='on true';
 const repTxt=(y.repDelta!=null&&y.repDelta!==-REP_LOSS)?(y.repDelta+' คะแนน (ถึงขีดต่ำสุดของระบบชื่อเสียงเดิม)'):('-'+REP_LOSS+' คะแนน');
 endEl.innerHTML='<div class="ykIn"><div class="ykKicker">YAKUZA ENDING</div><h1>TRUE ENDING</h1><div class="ykNeon"></div><div class="ykBig">ภารกิจสำเร็จ</div>'+
  '<div class="ykRs"><div><span>เงินตอบแทน</span><b>+'+TH(y.rewardAmount||REWARD)+' บาท</b></div><div><span>ชื่อเสียงบริษัท</span><b class="neg">'+esc(repTxt)+'</b></div><div><span>เวลาผ่านไป</span><b>3 เดือน (90 วัน)</b></div><div><span>วันที่ปัจจุบัน</span><b>'+esc(dateTxt(S.day))+'</b></div></div>'+
  '<button type="button" class="ykBtn" id="ykCont">CONTINUE</button></div>';
 $('ykCont').onclick=()=>{
  const y2=ye();
  y2.endingCompleted=true;y2.questStatus='COMPLETED';
  try{if(y2.prevOutfit){S.ceoOutfitId=y2.prevOutfit;WARD.apply()}}catch(e){}
  endEl.className='';endEl.innerHTML='';
  document.body.classList.remove('ykBusy');
  prevPaused=prevPaused===null?0:prevPaused;release();if(S.paused===1)S.paused=0;
  try{save(1)}catch(e){}
 };
}

/* ---------------------------------------------------------------- สมุดภารกิจ (การ์ดภารกิจลับ) */
let mySel=false,injecting=false;
function cardHtml(on){
 const y=ye();
 const st=y.questStatus;
 const sub=st==='COMPLETED'?'COMPLETED':st==='PREPARATION'?'PREPARATION · เตรียมภารกิจ':st==='DECLINED'?'DECLINED · ยังเปลี่ยนใจได้':st==='UNLOCKED'||st==='OFFERED'?'SECRET QUEST · มีข้อเสนอรออยู่':st;
 return '<button type="button" class="ykQIt'+(on?' on':'')+'" id="ykQCard"><span class="ykSym">☠</span><span class="ykT">[ลึกลับ]</span><span class="ykBadge">SECRET QUEST</span><small>'+esc(sub)+'</small></button>';
}
function detailHtml(){
 const y=ye(),st=y.questStatus;
 let act='';
 if(st==='UNLOCKED'||st==='OFFERED'||st==='DECLINED')act='<button type="button" class="ykBtn" id="ykQOpen">เปิดภารกิจ</button>';
 else if(st==='PREPARATION')act='<button type="button" class="ykBtn" id="ykQOpen">เปิดหน้าต่างเตรียมภารกิจ</button>';
 else if(st==='COMPLETED')act='<p style="color:#ffd45a!important">✔ ภารกิจเสร็จสิ้นแล้ว</p>';
 else act='<p style="color:#ff6a78!important">ภารกิจกำลังดำเนินอยู่…</p>';
 return '<div class="ykQDt"><h3>☠ [ลึกลับ] <span class="ykBadge">SECRET QUEST</span></h3><p>หัวหน้าแก๊งมีเรื่องสำคัญที่ต้องการพูดคุยกับ CEO เป็นข้อเสนอที่อาจเปลี่ยนชีวิตของคุณไปตลอดกาล</p><p style="color:#c9707a!important;font-size:12px">ผู้ให้ภารกิจ: ริวจิ · หัวหน้าแก๊งยากูซ่า</p>'+act+'</div>';
}
function inject(){
 if(injecting||!okS())return;
 const box=$('qJ');if(!box)return;
 const y=ye();
 if(!y.unlocked||y.questStatus==='LOCKED')return;
 const tabOn=box.querySelector('.qTabs button.on');
 const tab=tabOn&&tabOn.dataset.tab;
 const show=(tab==='q'&&y.questStatus!=='COMPLETED'&&y.questStatus!=='BAD_END')||(tab==='d'&&y.questStatus==='COMPLETED');
 if(!show)return;
 const ls=box.querySelector('.qLs');if(!ls)return;
 if(ls.querySelector('#ykQCard'))return;
 injecting=true;
 try{
  const wrap=document.createElement('div');wrap.innerHTML=cardHtml(mySel);
  ls.insertBefore(wrap.firstChild,ls.firstChild);
  const dt=box.querySelector('.qDt');
  if(mySel&&dt)dt.innerHTML=detailHtml();
  bindCard(box);
 }finally{injecting=false}
}
function bindCard(box){
 const c=box.querySelector('#ykQCard');
 if(c)c.onclick=e=>{e.stopPropagation();mySel=true;box.querySelectorAll('.qIt.on').forEach(x=>x.classList.remove('on'));c.classList.add('on');const dt=box.querySelector('.qDt');if(dt)dt.innerHTML=detailHtml();bindOpen(box)};
 bindOpen(box);
}
function bindOpen(box){
 const b=box.querySelector('#ykQOpen');
 if(b)b.onclick=e=>{e.stopPropagation();openQuest()};
}
function openQuest(){
 const why=busyNow();
 if(why){try{toast('ตอนนี้เริ่มภารกิจลับไม่ได้: '+why)}catch(e){}return}
 const y=ye();
 // ปิดสมุดภารกิจเดิม แล้วเริ่มบทสนทนา
 try{const x=document.querySelector('#qJ .qX');if(x)x.click()}catch(e){}
 mySel=false;
 if(y.questStatus==='PREPARATION'&&y.accepted){openPrep();return}
 if(y.questStatus==='UNLOCKED'||y.questStatus==='OFFERED'||y.questStatus==='DECLINED')openOffer();
}
function watchJournal(){
 const box=$('qJ');if(!box||watchJournal.on)return;watchJournal.on=1;
 box.addEventListener('click',e=>{const it=e.target.closest&&e.target.closest('.qIt');if(it)mySel=false},true);
 new MutationObserver(()=>inject()).observe(box,{childList:true,subtree:false});
}

/* ---------------------------------------------------------------- loop / resume */
function tick(){
 if(!okS())return;
 try{watchJournal()}catch(e){}
 checkUnlock();
 const y=ye();
 if(tick.init)return;
 tick.init=1;   // กู้สถานะเพียงครั้งเดียวหลังโหลดเซฟ (ไม่เริ่มคัตซีนซ้ำ ไม่ให้รางวัลซ้ำ ไม่ข้ามเวลาซ้ำ)
 const q=y.questStatus;
 if(q==='BAD_END'){ensureDom();S.over=1;S.badSeen=1;showBad();return}
 if(q==='CINEMATIC_RUNNING'||q==='EQUIPMENT_CONFIRMED'){ensureDom();y.questStatus='CINEMATIC_RUNNING';document.body.classList.add('ykBusy');setTimeout(afterCinematic,100);return}
 if(q==='TRUE_END'){ensureDom();trueEnd();return}
 if(q==='TIME_SKIP_PROCESSING'){ensureDom();applyRewards();if(!y.timeSkipCompleted){if(!y.startDay){y.startDay=S.day;y.startT=S.t;y.targetDay=S.day+SKIP_DAYS}timeSkip()}else{hold();document.body.classList.add('ykBusy');summary()}return}
}
/* ---- โหมดทดสอบ (พรีวิว ไม่แตะสถานะเควส/เงิน/เซฟ) ---- */
function previewCin(kind){
 registerDefs();shotFlags={};
 const prev=S.ceoOutfitId;
 const id=kind==='TRUE'?'yk_true':'yk_bad';
 try{return QCUT.play(id,()=>{try{S.ceoOutfitId=prev;WARD.apply()}catch(e){}},{force:1})}catch(e){console.error(e);return false}
}
function previewScreen(kind){
 ensureDom();
 const close='<button type="button" class="ykBtn" id="ykPvX" style="margin-top:12px">ปิดตัวอย่าง (Test)</button>';
 if(kind==='TRUE'){
  endEl.className='on true';
  endEl.innerHTML='<div class="ykIn"><div class="ykKicker">YAKUZA ENDING</div><h1>TRUE ENDING</h1><div class="ykNeon"></div><div class="ykBig">ภารกิจสำเร็จ</div>'+
   '<div class="ykRs"><div><span>เงินตอบแทน</span><b>+'+TH(REWARD)+' บาท</b></div><div><span>ชื่อเสียงบริษัท</span><b class="neg">-'+REP_LOSS+' คะแนน</b></div><div><span>เวลาผ่านไป</span><b>3 เดือน (90 วัน)</b></div><div><span>วันที่ปัจจุบัน</span><b>'+esc(dateTxt(S.day))+'</b></div></div>'+close+'</div>';
 }else{
  endEl.className='on bad';
  endEl.innerHTML='<div class="ykIn"><div class="ykKicker">YAKUZA ENDING</div><h1>BAD END</h1><div class="ykNeon"></div><div class="ykQ">“ความโลภมีราคาที่ต้องจ่าย”</div><div class="ykGo">GAME OVER</div>'+close+'</div>';
 }
 $('ykPvX').onclick=()=>{endEl.className='';endEl.innerHTML=''};
 return true;
}
function testUnlock(){try{YZ.setCl(NEED)}catch(e){if(S.yk&&S.yk.cl){S.yk.cl.r=NEED;S.yk.cl.g=NEED}}try{save(1)}catch(e){}checkUnlock();return ye().questStatus}
function testReset(){const y=ye();Object.keys(y).forEach(k=>delete y[k]);ye();try{document.body.classList.remove('ykBusy','ykOver')}catch(e){}try{save(1)}catch(e){}return ye().questStatus}
window.YKE={
 previewCin,previewScreen,testUnlock,testReset,
 status:()=>JSON.parse(JSON.stringify(ye())),
 cfgHas:()=>Object.keys(CFG.answers),
 tick,openQuest,openOffer,openPrep,accept,decline,
 select:(k,v)=>{const y=ye();if(y.equipmentConfirmed)return false;if(!(k in y.selectedEquipment))return false;y.selectedEquipment[k]=v;try{save(1)}catch(e){}if(prep&&prep.classList.contains('on'))renderPrep();return true},
 confirm:confirmEquip,
 skipLines:()=>{ if(!D.on)return; D.i=D.lines.length-1; showLine(); D.typed=D.full.length; $('ykTx').textContent=D.full; lineDone() },
 rewardsNow:applyRewards,
 dateTxt,
 _defs:()=>{registerDefs();return Object.keys(QCUT.defs).filter(k=>k.startsWith('yk_'))}
};
setInterval(tick,500);
})();
