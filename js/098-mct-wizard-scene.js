
/* ============================================================================
 * THE MIDNIGHT WIZARD — NPC พ่อมดเที่ยงคืน (อยู่ในฉากชานชาลา stin ของสถานีรถไฟเดิม)   [PHASE 1]
 * - ปรากฏ 00:00 ถึงก่อน 01:00 (เวลาในเกม S.t) ทุกคืน ไม่สุ่ม ไม่จำกัดจำนวนคืน จนกว่าจะกดรับเควสต์
 * - รับเควสต์แล้ว (flag S.q.fl.wiz_acc) → ไม่ปรากฏอีกถาวร
 * - บทสนทนาใช้ระบบบทสนทนาของ Quest Engine เดิม (QUEST.openDlg) · เควสต์ใช้สมุดภารกิจเดิม (QD.Q)
 * - เซฟที่ S.wizard (WizardQuestAccepted / Completed / CurrentStep / Progress / RewardsClaimed) + S.q (ของเดิม)
 * ========================================================================== */
(function(root){
'use strict';
if(root.WIZARD_NPC)return;
const A=root.WZ_ASSETS||{},M=A.meta||{};
const IMG=new Image();IMG.src=A.atlas||'';
const X=()=>root.__CEO_CTX;
const POS={x:902,y:362};            // ปลายชานชาลา ใต้เสาไฟด้านขวา
const K=.58;                        // สเกลสไปรต์ให้พอดีกับ NPC ตัวอื่น
const NM='พ่อมดเที่ยงคืน';
const W={ph:'gone',t:0,delay:0,parts:[],talking:0,mid:0,snd:null,ctx:null,talkedAt:0,magic:0,acc:0};
const rnd=Math.random;

/* ---------- เวลา / เงื่อนไขปรากฏ (เวลาเกมเท่านั้น · ไม่สุ่ม) ---------- */
const SS=()=>{try{return typeof S!=='undefined'?S:null}catch(e){return null}};
function minNow(){const s=SS();return s&&Number.isFinite(s.t)?((s.t%1440)+1440)%1440:-1}
const inWindow=()=>{const m=minNow();return m>=0&&m<60};            // 00:00 – 00:59
function accepted(){const s=SS();return !!(s&&((s.q&&s.q.fl&&s.q.fl.wiz_acc)||(s.wizard&&s.wizard.WizardQuestAccepted)))}
const shouldSpawn=()=>!accepted()&&inWindow();
function data(){
 const s=SS();if(!s)return null;
 let w=s.wizard;if(!w||typeof w!=='object')w=s.wizard={v:1};
 if(typeof w.WizardQuestAccepted!=='boolean')w.WizardQuestAccepted=false;
 if(typeof w.WizardQuestCompleted!=='boolean')w.WizardQuestCompleted=false;
 if(typeof w.WizardQuestCurrentStep!=='number')w.WizardQuestCurrentStep=0;
 if(!w.WizardQuestProgress||typeof w.WizardQuestProgress!=='object')w.WizardQuestProgress={};
 if(!w.WizardQuestRewardsClaimed||typeof w.WizardQuestRewardsClaimed!=='object')w.WizardQuestRewardsClaimed={};
 if(typeof w.met!=='number')w.met=0;if(typeof w.declined!=='number')w.declined=0;
 return w}
const persist=()=>{try{save(1)}catch(e){}};
const toast=m=>{try{X().toast(m)}catch(e){}};

/* ---------- ซิงก์ความคืบหน้า (เควสต์จริงอยู่ที่ S.q ของ Quest Engine · ที่นี่เป็นสำเนาตามข้อกำหนดเซฟ) ---------- */
const QIDS=['WZ1','WZ2','WZ3','WZ4'];
function sync(){
 const s=SS();if(!s)return;const w=data();if(!w)return;
 if(s.q&&s.q.fl&&s.q.fl.wiz_acc)w.WizardQuestAccepted=true;
 if(!w.WizardQuestAccepted)return;
 const st=(s.q&&s.q.st)||{};let cur=0,done=0;
 QIDS.forEach((id,i)=>{const x=st[id];if(!x)return;w.WizardQuestProgress[id]={state:x.s,step:x.i||0};
  if(x.s==='d'){done++;w.WizardQuestRewardsClaimed[id]=true}else if(!cur)cur=i+1});
 w.WizardQuestCurrentStep=done>=QIDS.length?QIDS.length:(cur||done+1);
 w.items={MysticCrystal:(s.q.fl&&s.q.fl.wiz_crystal)?1:0,AncientResearchDocument:(s.q.fl&&s.q.fl.wiz_doc)?1:0};w.SpecialCustomer=!!(s.q.fl&&s.q.fl.wiz_special);w.SupernaturalJobsUnlocked=!!(s.q.fl&&s.q.fl.wiz_jobs);
 w.WizardQuestCompleted=done>=QIDS.length}
setInterval(()=>{try{sync()}catch(e){}},500);

/* ---------- เสียงลึกลับ (สังเคราะห์ด้วย WebAudio) ---------- */
function soundOn(){try{return localStorage.getItem('mct_sound')!=='0'}catch(e){return true}}
function vol(){try{const v=localStorage.getItem('mct_vol');return v==null?.8:Math.max(0,Math.min(1,(+v)/100))}catch(e){return .8}}
function ac(){
 if(!soundOn())return null;
 try{if(!W.ctx){const C=root.AudioContext||root.webkitAudioContext;if(!C)return null;W.ctx=new C()}
  if(W.ctx.state==='suspended')W.ctx.resume();return W.ctx}catch(e){return null}}
function tone(c,t,f,d,type,g,dest){const o=c.createOscillator(),v=c.createGain();o.type=type;o.frequency.value=f;
 v.gain.setValueAtTime(.0001,t);v.gain.exponentialRampToValueAtTime(g,t+.03);v.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(v);v.connect(dest);o.start(t);o.stop(t+d+.05)}
function sfx(kind){
 const c=ac();if(!c)return;
 try{
  const t=c.currentTime,out=c.createGain();out.gain.value=.5*vol();out.connect(c.destination);
  if(kind==='appear'){
   [55,55.8].forEach(f=>{const o=c.createOscillator(),g=c.createGain(),lp=c.createBiquadFilter();o.type='sawtooth';o.frequency.value=f;lp.type='lowpass';lp.frequency.value=220;
    g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.16,t+1.2);g.gain.linearRampToValueAtTime(.0001,t+3.2);o.connect(lp);lp.connect(g);g.connect(out);o.start(t);o.stop(t+3.3)});
   [392,466,587,698,784,932].forEach((f,i)=>tone(c,t+.5+i*.22,f,1.1,'sine',.07,out));
  }else if(kind==='vanish'){
   const o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.setValueAtTime(700,t);o.frequency.exponentialRampToValueAtTime(70,t+.95);
   g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.14,t+.05);g.gain.exponentialRampToValueAtTime(.0001,t+1);o.connect(g);g.connect(out);o.start(t);o.stop(t+1.05);
   [880,660,495].forEach((f,i)=>tone(c,t+i*.12,f,.5,'sine',.05,out));
  }else if(kind==='talk'){tone(c,t,330,.25,'sine',.05,out);tone(c,t+.08,495,.3,'sine',.04,out)}
 }catch(e){}}

/* ---------- ตำแหน่ง / การชน ---------- */
const blocks=(x,y)=>W.ph!=='gone'&&Math.hypot(x-POS.x,(y-POS.y)*1.5)<16;
function talkable(){return shouldSpawn()&&(W.ph==='here'||(W.ph==='in'&&W.t>1.4))}
function near(){const c=X();if(!c||c.st.place!=='stin'||!talkable())return null;const s=c.st;
 return Math.hypot(s.x-POS.x,(s.y-POS.y)*1.2)<46?{wiz:1,name:'พ่อมดปริศนา',title:'ผู้ลึกลับ',x:POS.x,y:POS.y}:null}

/* ---------- บทสนทนา (Quest Engine เดิม) ---------- */
const L=(t)=>NM+'|'+t;
function menu(){
 return{ask:'จะตอบพ่อมดว่าอย่างไร?',opts:[
  {t:'ท่านเป็นใคร?',get say(){return [L('ข้าไม่มีชื่อที่เจ้าเคยได้ยินหรอก คนบนชานชาลานี้เรียกข้าว่า “พ่อมดเที่ยงคืน” เพราะข้ามาเมื่อนาฬิกาเดินข้ามวันเท่านั้น'),L('คนส่วนใหญ่เดินผ่านข้าไปโดยไม่เห็นอะไรเลย… แต่เจ้าไม่ใช่คนส่วนใหญ่'),menu()]}},
  {t:'ท่านต้องการให้ข้าช่วยอะไร?',get say(){return [L('ข้ามีงานค้างอยู่สี่เรื่อง เรียงต่อกันเป็นลำดับ ทำเรื่องแรกสำเร็จจึงจะได้รู้เรื่องถัดไป'),L('เริ่มจากพัสดุที่ไม่มีชื่อผู้ส่ง… และจบที่ “ลูกค้าคนสุดท้าย”'),menu()]}},
  {t:'ข้าสนใจงานนี้',say:[L('ดี… ฟังให้ดี นี่คืองานทั้งสี่ของข้า'),
    '*|ภารกิจที่ 1 · พัสดุที่ไม่มีชื่อผู้ส่ง (ยาก) — ตามหาพัสดุลึกลับ 5 กล่องทั่วเมือง แล้วนำกลับมาส่งที่บริษัทให้ครบก่อนเวลา 00:00 · รางวัล 30,000 Coins และข้อมูลลูกค้าลึกลับ',
    '*|ภารกิจที่ 2 · วัตถุดิบจากป่าลึกลับ (ยากมาก) — เก็บเห็ดเรืองแสง 10 ชิ้น แร่ประหลาด 5 ชิ้น และค้นหาต้นไม้โบราณ 3 ต้น · รางวัล 50,000 Coins และ Mystic Crystal ×1',
    '*|ภารกิจที่ 3 · ห้องทดลองใต้ดิน (ยากมาก) — หาทางเข้าห้องทดลองลับ ซ่อมเครื่องจักร ค้นหาเอกสาร ไขรหัสประตู และปิดระบบพลังงานก่อนที่เครื่องจักรจะระเบิด · รางวัล 80,000 Coins และ Ancient Research Document ×1',
    '*|ภารกิจที่ 4 · ลูกค้าคนสุดท้าย (ระดับตำนาน) — รวบรวมหลักฐาน เดินทางไปยังสถานที่นัดหมาย ค้นหาอาคารร้าง ไขรหัส เปิดประตูลับ และพบลูกค้าตัวจริง · รางวัล 150,000 Coins และปลดล็อกพ่อมดเป็นลูกค้าพิเศษ',
    {ask:'ตัดสินใจอย่างไร?',opts:[
     {t:'[รับเควสต์]',set:{wiz_acc:1},say:[L('ดี… ข้าจะรอข่าวจากเจ้า ภารกิจแรกเริ่มแล้ว'),'*|(พ่อมดค่อย ๆ จางหายไปในหมอกสีม่วง)']},
     {t:'[ปฏิเสธ]',cancel:true,say:[L('เข้าใจ… ข้าจะอยู่ตรงนี้ทุกเที่ยงคืน หากเจ้าเปลี่ยนใจ')]}]}]}
 ]}}
const OPEN=[L('ในที่สุด... ก็มีคนมองเห็นข้า'),L('ข้ารอใครสักคนที่สามารถช่วยงานของข้าได้มานานแล้ว'),L('ข้ามีภารกิจบางอย่างที่ต้องการให้เจ้าช่วย'),L('หากเจ้าทำสำเร็จ สิ่งตอบแทนที่เจ้าจะได้รับนั้นคุ้มค่าอย่างแน่นอน')];
function talk(){
 const c=X();if(!c||c.st.place!=='stin'||c.st.trans||c.st.talk||W.talking)return false;
 if(!talkable())return false;
 const Q_=root.QUEST;if(!Q_||!Q_.openDlg||Q_.dlgOpen()){toast('ตอนนี้ยังคุยไม่ได้');return false}
 const w=data(),s=SS();if(w)w.met++;try{if(s.q&&s.q.met&&!s.q.met.wizard)s.q.met.wizard=s.day}catch(e){}
 const ST=root.STATION_SCENE;ST&&ST.lock&&ST.lock(true);W.talking=1;W.talkedAt=performance.now();sfx('talk');
 Q_.openDlg(OPEN.concat([menu()]),ok=>{
  W.talking=0;ST&&ST.lock&&ST.lock(false);
  if(accepted())onAccept();else{const d=data();if(d)d.declined++}   // ปฏิเสธ → ไม่เปลี่ยนสถานะเควสต์ · พ่อมดยังมาทุกคืน
 });
 return true}
function onAccept(){
 const w=data();if(!w)return;
 w.WizardQuestAccepted=true;if(!w.WizardQuestCurrentStep)w.WizardQuestCurrentStep=1;
 try{root.QUEST.tick()}catch(e){}            // เริ่มภารกิจแรกในสมุดภารกิจเดิมทันที
 sync();persist();
 if(W.ph==='in'||W.ph==='here'){W.ph='out';W.t=0;burst(30);sfx('vanish')}}

/* ---------- วาด ---------- */
function ease(x){x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)}
function burst(n){for(let i=0;i<n;i++)W.parts.push({x:POS.x+(rnd()*34-17),y:POS.y-10-rnd()*60,vx:rnd()*30-15,vy:-12-rnd()*34,l:1.2+rnd()*1.3,m:2.5,s:1+rnd()*2,c:rnd()<.3?'#e3c8ff':'#b06aff'})}
function frameName(t){
 if(W.talking)return'front'+(Math.floor(t/170)%4);
 if(W.magic>0){const k=1.8-W.magic;return'staff'+Math.min(3,Math.floor(k/.45))}
 return'front'+((Math.floor(t/520)%2)?1:0)}
function glow(g,x,y,r,col,a){const gr=g.createRadialGradient(x,y,1,x,y,r);gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=a;g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);g.globalAlpha=1}
let lt=0,magicClock=4;
function update(dt){
 const c=X();if(!c||c.st.place!=='stin')return;
 const want=shouldSpawn();
 if(want){
  if(W.ph==='gone'||W.ph==='out'){if(W.ph==='gone'){W.delay+=dt;if(W.delay<.7)return}W.ph='in';W.t=0;W.delay=0;burst(26);sfx('appear')}
 }else{
  W.delay=0;
  if(W.ph==='in'||W.ph==='here'){W.ph='out';W.t=0;burst(20);sfx('vanish')}
 }
 W.t+=dt;
 if(W.ph==='in'&&W.t>=2.4){W.ph='here';W.t=0}
 if(W.ph==='out'&&W.t>=1)W.ph='gone';
 if(W.ph==='here'||W.ph==='in'){
  if(W.magic>0)W.magic-=dt;else{magicClock-=dt;if(magicClock<=0&&!W.talking){W.magic=1.8;magicClock=5+rnd()*3}}
  if(rnd()<dt*14){const hx=POS.x-12;W.parts.push({x:hx+rnd()*8-4,y:POS.y-52-rnd()*30,vx:rnd()*10-5,vy:-10-rnd()*16,l:1+rnd()*1.2,m:2.2,s:1+rnd()*1.8,c:rnd()<.4?'#e3c8ff':'#a35cff'})}
 }
 for(const p of W.parts){p.l-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt}
 W.parts=W.parts.filter(p=>p.l>0)}
function visible(){return W.ph!=='gone'}
function obj(g,t){
 return{y:POS.y,draw:()=>{
  const k=W.ph==='in'?ease(W.t/2.2):W.ph==='out'?1-ease(W.t/.9):1;
  if(k<=0)return;
  const fr=M[frameName(t)],sx=1+.012*Math.sin(t/700);if(!fr||!IMG.complete||!IMG.naturalWidth)return;
  const dw=fr[2]*K,dh=fr[3]*K*sx,x=POS.x-fr[4]*K,y=POS.y-dh;
  g.save();
  g.fillStyle='rgba(10,0,25,'+(.32*k).toFixed(3)+')';g.beginPath();g.ellipse(POS.x-30,POS.y+1,44,5.5,0,0,7);g.fill();   // เงาทอดไปทางซ้าย
  g.beginPath();g.rect(x-30,y+dh*(1-k)-2,dw+60,dh*k+4);g.clip();               // ปรากฏจากเท้าขึ้นหัว / หายจากหัวลงเท้า
  g.globalAlpha=Math.min(1,.35+k);g.imageSmoothingEnabled=false;
  const bob=W.talking?-Math.abs(Math.sin(t/120))*1.4:0;
  g.drawImage(IMG,fr[0],fr[1],fr[2],fr[3],x,y+bob,dw,dh);
  g.restore();
  g.save();g.globalCompositeOperation='lighter';
  if(k<1){const ey=y+dh*(1-k);g.fillStyle='rgba(190,120,255,.55)';g.fillRect(x-4,ey-1,dw+8,3);glow(g,POS.x,ey,40,'rgba(180,100,255,1)',.5)}
  glow(g,POS.x-12,POS.y-48,26,'rgba(190,110,255,1)',(.22+.1*Math.sin(t/260))*k);       // แสงเวทที่มือ/ไม้เท้า
  if(W.magic>0)glow(g,POS.x-12,POS.y-66,54,'rgba(200,130,255,1)',.5*k);
  g.restore()}}}
function particles(g){
 g.save();g.globalCompositeOperation='lighter';
 for(const p of W.parts){g.globalAlpha=Math.max(0,Math.min(1,p.l/p.m*1.6));g.fillStyle=p.c;g.fillRect(Math.round(p.x),Math.round(p.y),p.s,p.s)}
 g.restore();g.globalAlpha=1}

/* ---------- บรรยากาศชานชาลา 00:00–01:00 (เฉพาะฉาก stin) ---------- */
const FOG=[];for(let i=0;i<9;i++)FOG.push({x:rnd()*960,y:318+rnd()*70,r:70+rnd()*60,v:6+rnd()*10,p:rnd()*6});
function atmo(g,t,dt){
 const c=X(),Wd=c.W,H=c.H;
 W.mid+=((inWindow()?1:0)-W.mid)*Math.min(1,dt*2.2);
 // กลางคืนทั่วไป: โทนเดียวกับฉากกลางแจ้งอื่น (ไร่) เพื่อให้ภาพกลางวันไม่ขัดกับเวลา
 let dl=1;try{dl=c.sceneDaylight()}catch(e){}
 const a=(1-dl)*.34+W.mid*.22;if(a>.004){g.fillStyle='rgba(6,10,38,'+a.toFixed(3)+')';g.fillRect(0,0,Wd,H)}
 if(W.mid<.02)return;
 const m=W.mid;
 g.save();g.globalCompositeOperation='lighter';
 // แสงจันทร์: ลำแสงเฉียงจากมุมขวาบน + ดวงจันทร์
 const gr=g.createLinearGradient(800,0,520,420);gr.addColorStop(0,'rgba(170,200,255,'+(.2*m).toFixed(3)+')');gr.addColorStop(1,'rgba(170,200,255,0)');
 g.fillStyle=gr;g.beginPath();g.moveTo(760,0);g.lineTo(900,0);g.lineTo(560,420);g.lineTo(380,420);g.closePath();g.fill();
 glow(g,830,62,70,'rgba(200,220,255,1)',.5*m);g.globalAlpha=.9*m;g.fillStyle='#eef3ff';g.beginPath();g.arc(830,62,15,0,7);g.fill();g.globalCompositeOperation='destination-out';g.beginPath();g.arc(838,58,13,0,7);g.fill();g.globalCompositeOperation='lighter';g.globalAlpha=1;
 // หมอกบาง ๆ ไหลเลื้อยบนชานชาลา
 FOG.forEach(f=>{f.x+=f.v*dt;if(f.x>1040)f.x=-80;const yy=f.y+Math.sin(t/2400+f.p)*5;glow(g,f.x,yy,f.r,'rgba(190,170,255,1)',(.10+.03*Math.sin(t/1900+f.p))*m)});
 if(visible())glow(g,POS.x,POS.y-6,88,'rgba(170,80,255,1)',.28*m);
 // แสงเสาไฟกะพริบ
 const fl=(Math.sin(t/53)*Math.sin(t/97+1)>.55)?.25:1;
 [[28,262],[940,262],[383,266],[583,262],[820,262]].forEach((p,i)=>glow(g,p[0],p[1],54,'rgba(255,214,140,1)',(.16+.1*Math.sin(t/310+i))*m*fl));
 g.restore();
 if(fl<1){g.fillStyle='rgba(4,6,24,'+(.16*m).toFixed(3)+')';g.fillRect(0,0,Wd,H)}   // ไฟตก
 particles(g)}

function enter(){W.ph='gone';W.t=0;W.delay=0;W.parts=[];W.talking=0;W.magic=0;magicClock=4;W.mid=inWindow()?1:0}
function leave(){W.ph='gone';W.parts=[];W.talking=0}
root.WIZARD_NPC={POS,update,obj,visible,atmo,near,talk,talkable,blocks,enter,leave,data,sync,shouldSpawn,accepted,inWindow,
 phase:()=>W.ph,state:()=>({ph:W.ph,t:W.t,talking:W.talking,mid:W.mid,parts:W.parts.length,magic:W.magic}),QIDS};
})(typeof window!=='undefined'?window:globalThis);

