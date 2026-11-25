
/* ============================================================================
 * REI · พนักงานลับ SECRET (R&D / Tech Lead) + เนื้อเรื่อง + สกินตัวละครผู้เล่น (โค้ด SUSHI1530)
 * เสียบเข้าระบบเดิมผ่านแพตช์: refill (สุ่ม 1%) · A.hire · A.talk · ai() · drawEmployee · doneChk ·
 * ความคืบหน้าโปรเจกต์ · salf · CEOG (สกิน 'r') · CODE.submit · V.hire/V.staff/V.ceo
 * ข้อมูลทั้งหมดอยู่ใน S.rei (ไปกับ Save เดิม) — เซฟเก่าที่ไม่มี S.rei ใช้งานได้ปกติ
 * ========================================================================== */
(function(root){
'use strict';
if(root.REI)return;
const ART=root.REI_ART||{};
const TIERS=['First Meeting','Getting Closer','Shared Dream','Special Bond','True Trust','Dream Partner'];
const TIER_TH=[0,20,40,60,80,100];
const EVNAME={greet:'เรย์เดินเข้ามาทัก CEO',overtime:'เรย์ทำงานล่วงเวลา',rest:'เรย์นั่งพักผ่อน',code:'เรย์กำลังเขียนโปรแกรม',sleep:'เรย์แอบหลับที่โต๊ะ',gamechat:'เรย์ชวน CEO คุยเรื่องเกม',cheer:'เรย์ให้กำลังใจ CEO',celebrate:'เรย์ฉลองความสำเร็จของบริษัท',birthday:'เรย์จัดกิจกรรมวันเกิด',cityview:'เรย์มองวิวเมืองตอนกลางคืน'};

/* ---------------- ลงทะเบียนสไปรต์ให้ระบบพนักงาน/NPC เดิม (64x80 · 4 ทิศ x 4 เฟรม) ---------------- */
function register(){
 try{
  if(typeof CHAR_ASSETS==='undefined'||!ART.frames||CHAR_ASSETS.rei)return;
  const rows=[0,1,2,3].map(r=>ART.frames.slice(r*4,r*4+4));
  CHAR_ASSETS.rei={gender:0,frames:rows,portrait:ART.portrait2};
  const p=new Image();p.src=ART.portrait2;
  CHAR_IMAGES.rei={portrait:p,frames:rows.map(r=>r.map(s=>{const i=new Image();i.src=s;return i}))};
 }catch(e){console.error('[rei register]',e)}
}
register();
root.REI_META={cw:192,ch:192,ax:[96,96,96,96],ay:[176,176,176,176],h:[153,153,153,153],k:.78};

/* ---------------- สถานะ (S.rei) ---------------- */
function fresh(){return{v:1,rolls:0,appeared:0,hired:false,hireDay:0,f:0,fc:{day:0,talk:0,ev:0,proj:0},hist:[],seen:{},done:{},occ:{},ev:null,evlast:{},evAt:-9999,
 ch:{m:0,p:0,day:{}},seen1:0,bday:0,bdayDone:{},title:'',stats:{talk:0,proj:0,q:0,qMoney:0,gifts:0},otUntil:0}}
function D(){if(typeof S!=='object'||!S)return fresh();if(!S.rei||typeof S.rei!=='object'||S.rei.v!==1)S.rei=Object.assign(fresh(),S.rei||{});return S.rei}
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pickA=a=>a[Math.floor(Math.random()*a.length)];
const nowM=()=>S.day*1440+Math.floor(S.t);
const hourNow=()=>S.t/60;
const yearDay=()=>((S.day-1)%120)+1;
const rei=()=>{try{return (S.emp||[]).find(e=>e.charId==='rei')||null}catch(e){return null}};
const onFloor=e=>{try{return !(window.OFC&&OFC.floor&&S.ofc)||OFC.here(e)}catch(x){return true}};
const tierOf=f=>f>=100?5:f>=80?4:f>=60?3:f>=40?2:f>=20?1:0;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function money(n){try{return M(n)}catch(e){return '$'+n}}
function say(msg,ms){try{toast(msg)}catch(e){}}
function banner(a,b){try{root.QUEST&&QUEST.notify(a,b||'')}catch(e){}}

/* ---------------- สมัครงาน: สุ่ม 1% ต่อการรีเฟรชรายชื่อ ---------------- */
function candidate(){
 const e=mk();
 Object.assign(e,{charId:'rei',name:'เรย์ (Rei)',g:0,role:'นักพัฒนาอัจฉริยะ (R&D / Tech Lead) · ★5 SECRET',personality:'สุภาพ ขี้อาย ฉลาด ฝันใหญ่',
  ability:'Dev Speed +40% · ลดข้อผิดพลาด −30% · คุณภาพโปรเจกต์ +35% · ทำงานร่วมกับ CEO ได้ดีเยี่ยม',pe:4,secret:1,
  sk:{P:10,C:9,M:6,G:8,A:7},exp:0});
 e.sal=20000;
 return e;
}
function announce(){
 say('✨ มีผู้สมัครพิเศษปรากฏตัว!');
 setTimeout(()=>say('🔒 พบพนักงานระดับ SECRET: Rei'),1700);
 banner('✨ มีผู้สมัครพิเศษปรากฏตัว!','พบพนักงานระดับ SECRET: Rei · ดูที่คอมพิวเตอร์ HR → รับสมัครงาน');
 try{log('✨ พบพนักงานระดับ SECRET: Rei ในรายชื่อรับสมัคร')}catch(e){}
}
function roll(r){
 const d=D();
 if(d.hired||rei()||(S.cands||[]).some(c=>c.charId==='rei'))return false;   // รับแล้ว/มีอยู่แล้ว → ไม่สุ่มซ้ำ
 d.rolls++;
 const x=(r!=null)?r:Math.random();
 if(x<.01){if(!Array.isArray(S.cands))S.cands=[];S.cands.push(candidate());d.appeared++;announce();return true}
 return false;
}
function onHired(){
 const d=D();d.hired=true;d.hireDay=S.day;d.bday=rnd(1,120);d.ch.m=Math.max(d.ch.m,1);d.ch.day[1]=S.day;
 d.f=Math.max(d.f,5);
 banner('📖 บทที่ 1 · การพบกันครั้งแรก','เรย์เข้าร่วมบริษัทแล้ว — ไปคุยกับเขาที่ออฟฟิศ');
 say('🎉 เรย์เข้าร่วมบริษัท · ค่าจ้าง 20,000/เดือน');
}
function installHooks(){
 if(typeof A==='undefined'||!A||A.__rei)return;
 const oh=A.hire;
 A.hire=function(i){const c=Array.isArray(S.cands)?S.cands[i]:null,was=c&&c.charId==='rei',n=(S.emp||[]).length;const r=oh.apply(this,arguments);try{if(was&&(S.emp||[]).length>n&&rei())onHired()}catch(e){console.error('[rei hire]',e)}return r};
 A.__rei=1;
}
installHooks();

/* ---------------- ความสัมพันธ์ ---------------- */
function dayCap(){const d=D();if(d.fc.day!==S.day)d.fc={day:S.day,talk:0,ev:0,proj:0};return d.fc}
const CAPS={talk:3,ev:4,proj:3};
function gain(n,kind,quiet){
 const d=D(),fc=dayCap();let a=n;
 if(kind&&CAPS[kind]!=null){const room=CAPS[kind]-fc[kind];a=Math.max(0,Math.min(n,room));fc[kind]+=a}
 if(a<=0)return 0;
 const t0=tierOf(d.f);d.f=Math.min(100,d.f+a);const t1=tierOf(d.f);
 if(!quiet)say('💙 ความสนิทกับเรย์ +'+a+' ('+d.f+'/100)');
 if(t1>t0)setTimeout(()=>banner('💙 ความสัมพันธ์ระดับ '+TIERS[t1],'ปลดล็อกบทสนทนาและเหตุการณ์ใหม่ของเรย์'),900);
 return a;
}

/* ---------------- ความสามารถ S-rank (เชื่อมสูตรโปรเจกต์เดิม) ---------------- */
function prodOf(e){try{return typeof prod==='function'?prod(e):.3+.7*((e.en+100-e.hu+e.ha+100-e.sr)/400)}catch(x){return .7}}
function collab(){const t=tierOf(D().f);return t>=4?.10:t>=3?.07:t>=1?.04:.02}   // เพิ่มประสิทธิภาพทีมเมื่อทำงานร่วมกับ CEO
function mul(e,p,k){
 try{
  const d=D();if(!d.hired)return 1;const R=rei();if(!R||R.st!=='work')return e===R?1:1;
  if(e===R){const pr=prodOf(e),loss=1-pr,fixed=1-loss*.7;       // ลดข้อผิดพลาด/ผลเสียจากความล้า 30%
   return 1.4*Math.max(.3,fixed)/Math.max(.3,pr)}              // Dev speed +40%
  if(e&&e.charId!=='security-guard')return 1+collab();          // ผลักดันเพื่อนร่วมทีม
 }catch(x){console.error('[rei mul]',x)}
 return 1;
}
function after(e,p,k,delta){try{if(e&&e.charId==='rei'&&delta>0)p.reiW=(p.reiW||0)+delta}catch(x){}}
function quality(p){
 try{
  const d=D();if(!d.hired)return;
  const tot=Object.keys(p.need||{}).reduce((a,k)=>a+p.need[k],0)||1;
  const rate=(p.reiW||0)/tot;
  if(rate>=.25){const add=Math.round(p.reward*.35);p.reward+=add;d.stats.q++;d.stats.qMoney+=add;setTimeout(()=>say('✨ เรย์เพิ่มคุณภาพโปรเจกต์ +35% (+'+money(add)+')'),600)}
  if(rate>=.12)d.stats.proj++;
  gain(2,'proj',false);
  setTimeout(()=>{try{startEvent('celebrate')}catch(e){}},900);
  setTimeout(chapterCheck,1500);
 }catch(x){console.error('[rei quality]',x)}
}

/* ---------------- บทสนทนา (35 บท · 10 หมวด) ---------------- */
const M_='เรย์|',C_='ME|';
const DL=[
 // A ทักทาย
 {id:'a1',cat:'A',h:[5,11],t:'อรุณสวัสดิ์',lines:[M_+'อรุณสวัสดิ์ครับ CEO! วันนี้ผมชงกาแฟมาเผื่อด้วยนะครับ',M_+'ถ้าคุณไม่ดื่ม ผมจะดื่มเองครับ (ยิ้มเขิน)']},
 {id:'a2',cat:'A',h:[11,16],t:'ทักทายตอนบ่าย',lines:[M_+'เอ่อ... สวัสดีครับ CEO ผมกำลังดีบั๊กอยู่พอดีเลยครับ',M_+'ถ้าเห็นผมพึมพำคนเดียว อย่าตกใจนะครับ ผมแค่คุยกับโค้ดอยู่']},
 {id:'a3',cat:'A',h:[16,24],t:'ทักทายตอนเย็น',lines:[M_+'เย็นแล้วเหมือนกันนะครับ CEO วันนี้เหนื่อยไหมครับ?',M_+'ผมพอมีเวลาอีกนิดหน่อย ถ้าอยากคุยอะไรบอกได้เลยครับ']},
 {id:'a4',cat:'A',min:20,t:'ดีใจที่ได้เจอ',lines:[M_+'CEO ครับ! ดีใจจังที่แวะมาหา',M_+'ผมกำลังคิดอยู่พอดีว่าอยากเล่าอะไรให้คุณฟัง']},
 // B การทำงาน
 {id:'b1',cat:'B',t:'วันนี้งานเป็นยังไงบ้าง',lines:[C_+'วันนี้งานเป็นยังไงบ้าง?',M_+'วันนี้ผมกำลังพัฒนาระบบใหม่อยู่ครับ',M_+'ถ้าสำเร็จ บริษัทเราจะมีอะไรสนุก ๆ เพิ่มขึ้นอีกเยอะเลยครับ!']},
 {id:'b2',cat:'B',t:'เหนื่อยไหม',lines:[C_+'เหนื่อยไหม?',M_+'นิดหน่อยครับ',M_+'แต่ถ้าได้เห็นสิ่งที่เราสร้างเติบโตขึ้นทุกวัน',M_+'ผมก็รู้สึกว่ามันคุ้มค่าครับ']},
 {id:'b3',cat:'B',t:'เรื่องบั๊ก',lines:[C_+'เจอบั๊กหนักไหม?',M_+'เมื่อกี้เจอบั๊กที่หายไปแล้วโผล่กลับมาครับ... เหมือนมันรู้ว่าผมกำลังจะเลิกงาน',M_+'แต่ผมจับได้แล้วครับ! (ชูกำปั้นเล็ก ๆ)']},
 {id:'b4',cat:'B',t:'ทำงานกับทีม',lines:[C_+'ทำงานกับคนอื่นในทีมเป็นยังไง?',M_+'ทุกคนใจดีมากครับ ผมไม่ค่อยกล้าพูด แต่รู้สึกอุ่นใจเวลามีเสียงคีย์บอร์ดดังเป็นจังหวะรอบ ๆ',M_+'มันเหมือนวงดนตรีเล็ก ๆ ที่เล่นเพลงเดียวกันอยู่ครับ']},
 // C การพัฒนาเกม
 {id:'c1',cat:'C',t:'ไอเดียเกมใหม่',lines:[C_+'มีไอเดียเกมใหม่ไหม?',M_+'มีครับ! เกมที่ผู้เล่นได้สร้างบริษัทเล็ก ๆ จากศูนย์... (หยุดคิด) เอ๊ะ นี่มันเหมือนที่เรากำลังทำอยู่เลยนะครับ',M_+'งั้นเรียกว่า "เกมที่เราใช้ชีวิตอยู่ข้างใน" ก็แล้วกันครับ']},
 {id:'c2',cat:'C',t:'แนวเกมที่ชอบ',lines:[M_+'ผมชอบเกมที่มีโลกให้เดินเล่นครับ แล้วมีมุมเล็ก ๆ ให้ค้นพบ',M_+'เวลาเจอห้องลับในเกม ผมจะยิ้มคนเดียวทุกที']},
 {id:'c3',cat:'C',t:'พิกเซลอาร์ต',lines:[M_+'พิกเซลอาร์ตวิเศษมากครับ แค่ไม่กี่จุดก็ทำให้ตัวละครมีชีวิตได้',M_+'เหมือนกิ๊บกระต่ายของผมครับ ชิ้นเล็ก ๆ แต่เป็นตัวตนของผมเลย']},
 {id:'c4',cat:'C',min:20,t:'เกมที่อยากสร้างที่สุด',lines:[C_+'อยากสร้างเกมแบบไหนที่สุด?',M_+'เกมที่คนเล่นแล้วอยากโทรหาเพื่อน... "เฮ้ มาลองสิ เกมนี้สนุกมาก"',M_+'ถ้าเกมทำให้คนอยากแบ่งปันความสุข ผมว่านั่นคือเกมที่สำเร็จแล้วครับ']},
 // D ความฝัน
 {id:'d1',cat:'D',t:'ทำไมถึงมาที่นี่',lines:[C_+'ทำไมถึงเลือกมาทำงานที่นี่?',M_+'เพราะผมเห็นอะไรบางอย่างในบริษัทนี้ครับ',M_+'ผมเห็นความฝันที่ยังไม่ยอมแพ้',M_+'และผมอยากเป็นส่วนหนึ่งของความฝันนั้นครับ']},
 {id:'d2',cat:'D',t:'เรื่องวัยเด็ก',lines:[M_+'ตั้งแต่เด็กผมชอบเกม ชอบวาด ชอบสร้างโลกในจินตนาการครับ',M_+'แต่ความฝันมันดูไกลเกินไป ผมเลยเลือกเส้นทางที่ "ใกล้ที่สุด" คือการเป็นนักพัฒนา']},
 {id:'d3',cat:'D',min:40,t:'ความฝันที่เหมือนกัน',lines:[M_+'พอได้คุยกับคุณ ผมรู้สึกว่าคุณก็มีความฝันเดียวกันใช่ไหมครับ?',M_+'การสร้าง "บริษัทเกมของเราเอง" สร้างเกมที่คนเล่นแล้วมีความสุขจริง ๆ']},
 {id:'d4',cat:'D',min:60,t:'สตูดิโอแห่งอนาคต',lines:[M_+'สักวัน... ผมอยากให้บริษัทของเรากลายเป็นสตูดิโอเกมที่ทุกคนรู้จักครับ',M_+'มีเกมที่คนเล่นทั่วโลกพูดถึง',M_+'และในวันนั้น ผมอยากให้คุณมองย้อนกลับมา แล้วพูดว่า "เราทำสำเร็จแล้วนะ" ด้วยกันครับ!']},
 // E ให้กำลังใจ CEO
 {id:'e1',cat:'E',t:'พักบ้างนะ',lines:[C_+'เหนื่อยก็พักบ้างนะ',M_+'ครับ! CEO ก็เหมือนกันนะครับ',M_+'ถ้าเหนื่อยเมื่อไหร่ มานั่งดูผมเขียนโค้ดก็ได้ เสียงคีย์บอร์ดช่วยให้ใจเย็นลงครับ']},
 {id:'e2',cat:'E',t:'ขอบใจที่ทำงานหนัก',lines:[C_+'ขอบใจนะที่ทำงานหนัก',M_+'ผมต่างหากที่ต้องขอบคุณครับ ที่ให้โอกาสผมได้ทำสิ่งที่รัก',M_+'พอคุณพูดแบบนี้ ผมมีแรงเขียนโค้ดต่ออีกสิบชั่วโมงเลยครับ... (หยุด) แต่ผมจะพักด้วยนะครับ สัญญา']},
 {id:'e3',cat:'E',min:20,t:'ขอบคุณที่อยู่ด้วยกัน',lines:[M_+'ขอบคุณนะครับ ที่ยังอยู่ข้าง ๆ กัน',M_+'ไม่ว่าวันนี้จะเป็นยังไง ผมรู้ว่าเรายังมีกันและกันครับ']},
 // F ตอนกลางคืน
 {id:'f1',cat:'F',night:1,t:'ออฟฟิศตอนค่ำ',lines:[M_+'ยังไม่กลับบ้านเหรอครับ? ออฟฟิศตอนค่ำเงียบดีนะ เหมือนทั้งตึกกำลังหลับ',M_+'ผมชอบเสียงพัดลมคอมพิวเตอร์ตอนนี้ครับ เหมือนเพลงกล่อมเด็ก']},
 {id:'f2',cat:'F',night:1,t:'ไฟเมือง',lines:[M_+'ลองมองออกไปนอกหน้าต่างสิครับ ไฟเมืองเหมือนพิกเซลเรืองแสงเลย',M_+'ผมเคยคิดว่าถ้าวันหนึ่งเกมของเราสว่างได้เท่านี้ ก็คงดีครับ']},
 {id:'f3',cat:'F',night:1,t:'ง่วงตอนดึก',lines:[M_+'(หาว) ขอโทษครับ ตอนดึกสมองผมจะเริ่มเขียนโค้ดเป็นฝัน',M_+'เมื่อคืนผมฝันว่าบั๊กเป็นกระต่ายตัวเล็ก ๆ วิ่งหนีไปทั่วโปรเจกต์ครับ']},
 // G ขาดทุน
 {id:'g1',cat:'G',loss:1,t:'ตัวเลขไม่สวย',lines:[M_+'CEO ครับ ตัวเลขไม่ค่อยสวยใช่ไหมครับ? ผมเห็นสีหน้าคุณแล้ว',M_+'แต่ผมเชื่อว่าบริษัทที่ล้มแล้วลุกได้ จะแข็งแรงกว่าเดิมเสมอครับ']},
 {id:'g2',cat:'G',loss:1,t:'อย่ายอมแพ้',lines:[M_+'ผมเคยเห็นโปรเจกต์ที่ทุกคนบอกว่าไม่รอด แต่พอเราไม่ยอมแพ้ มันก็รอดมาได้',M_+'เหมือนเกมที่ทุกคนบอกว่ายากเกินไป แล้วมีคนผ่านได้ในที่สุดครับ']},
 {id:'g3',cat:'G',loss:1,min:40,t:'ผมจะช่วยเอง',lines:[M_+'ผมจะรับงานเพิ่มครับ ถ้าต้องเขียนโค้ดทั้งคืนเพื่อให้เราผ่านเดือนนี้ไปได้ ผมยินดี',M_+'(รีบเสริม) แต่ไม่ใช่เพราะค่าจ้างนะครับ ผมแค่ไม่อยากเห็นความฝันของเราสะดุดครับ']},
 // H ประสบความสำเร็จ
 {id:'h1',cat:'H',win:1,t:'ฉลองเล็ก ๆ',lines:[M_+'บริษัทไปได้สวยเลยนะครับ! ผมแอบแช่น้ำอัดลมไว้ในตู้เย็นแล้วครับ (กระซิบ) อย่าบอกใครนะ',M_+'ฉลองเล็ก ๆ ก็เป็นพลังใจได้ครับ']},
 {id:'h2',cat:'H',win:1,t:'ไม่แปลกใจเลย',lines:[M_+'ผมไม่แปลกใจเลยครับ คุณตัดสินใจเก่งตลอด',M_+'ผมแค่เขียนโค้ดตามหลังความกล้าของคุณเท่านั้นเองครับ']},
 {id:'h3',cat:'H',win:1,min:20,t:'เกมระดับโลก',lines:[M_+'ถ้าเรายังเติบโตแบบนี้ ผมว่าอีกไม่นานเราทำเกมระดับโลกได้จริงครับ',M_+'ตอนนี้ผมเริ่มวางโครงเกมแรกของสตูดิโอเราไว้ในสมุดแล้วนะครับ (หน้าแดง)']},
 // I ตามฤดูกาล
 {id:'i1',cat:'I',season:'summer',t:'ฤดูร้อน',lines:[M_+'ฤดูร้อนทีไร จอคอมก็ร้อนตามครับ... แต่แอร์ในออฟฟิศนี้คือสวรรค์เลย',M_+'ผมชอบเกมฉากทะเลช่วงนี้ที่สุดครับ มีกลิ่นแดดอยู่ในพิกเซลเลย']},
 {id:'i2',cat:'I',season:'rainy',t:'ฤดูฝน',lines:[M_+'ฝนตกแล้ว... เสียงฝนกับเสียงคีย์บอร์ดเข้ากันมากครับ',M_+'ผมเดาว่าเกมที่ดีที่สุดมักถูกคิดขึ้นในวันที่ฝนตกครับ']},
 {id:'i3',cat:'I',season:'autumn',t:'ฤดูใบไม้ร่วง',lines:[M_+'ใบไม้เริ่มร่วงแล้ว ผมชอบสีส้มของฤดูนี้ครับ เหมือนจานสีของเกมผจญภัย',M_+'ลมเย็นแบบนี้ เหมาะกับโค้ดยาว ๆ มากเลยครับ']},
 {id:'i4',cat:'I',season:'spring',t:'ฤดูใบไม้ผลิ',lines:[M_+'ฤดูใบไม้ผลิ ดอกไม้บานเต็มถนนเลยครับ เหมือนตอนเริ่มเกมใหม่ที่ทุกอย่างยังเป็นไปได้',M_+'ผมแอบสเก็ตช์ฉากดอกซากุระไว้ด้วยครับ ยังไม่กล้าให้ใครดู']},
 // J วันเกิด
 {id:'j1',cat:'J',bd:'today',t:'วันเกิดของเรย์',lines:[M_+'CEO ครับ... วันนี้เป็นวันเกิดผมเอง ผมไม่ได้บอกใครเลย ไม่รู้ว่าใครจะจำได้',M_+'(เขิน) ขอบคุณที่มาคุยกับผมวันนี้นะครับ นี่แหละของขวัญที่ดีที่สุดแล้ว']},
 {id:'j2',cat:'J',bd:'before',t:'ใกล้วันเกิด',lines:[M_+'อีกไม่กี่วันจะถึงวันเกิดผมแล้วครับ... เอ่อ ผมไม่ได้เตือนนะครับ ผมแค่พูดเฉย ๆ',M_+'(ยิ้มแห้ง) ถ้ามีเค้กสักชิ้นก็ดีนะครับ']},
 {id:'j3',cat:'J',bd:'after',t:'หลังวันเกิด',lines:[M_+'เมื่อวันก่อนขอบคุณมากนะครับ ผมเก็บเทียนไว้เป็นของที่ระลึกแล้ว',M_+'ปีนี้เป็นวันเกิดที่ผมจะจำไปอีกนานเลยครับ']}
];
const CATN={A:'ทักทาย',B:'เรื่องการทำงาน',C:'เรื่องการพัฒนาเกม',D:'เรื่องความฝัน',E:'ให้กำลังใจ CEO',F:'ช่วงกลางคืน',G:'บริษัทกำลังขาดทุน',H:'บริษัทประสบความสำเร็จ',I:'ตามฤดูกาล',J:'วันเกิด'};

function inTrouble(){try{if(S.money<5000)return true;const h=(S.hist||[]);const l=h[h.length-1];return !!(l&&l.d>=S.day-1&&l.i<l.e)}catch(e){return false}}
function inSuccess(){try{if(S.money>=60000)return true;const h=(S.hist||[]);const l=h[h.length-1];return !!(l&&l.d>=S.day-1&&l.i-l.e>=3000)}catch(e){return false}}
function bdState(){const d=D();if(!d.bday)return null;const diff=(yearDay()-d.bday+120)%120;if(diff===0)return 'today';if(diff>=1&&diff<=5)return 'after';if(((d.bday-yearDay()+120)%120)<=5)return 'before';return null}
function okDlg(x,cat){
 const d=D(),h=hourNow();
 if(cat&&x.cat!==cat)return false;
 if(x.min&&d.f<x.min)return false;
 if(x.h&&!(h>=x.h[0]&&h<x.h[1]))return false;
 if(x.night&&!(h>=17||h<6))return false;
 if(x.loss&&!inTrouble())return false;
 if(x.win&&!inSuccess())return false;
 if(x.season){let se='';try{se=currentSeason()}catch(e){}if(se!==x.season)return false}
 if(x.bd&&bdState()!==x.bd)return false;
 return true;
}
// เลือกบทสนทนา: กรองตามเงื่อนไข · เลี่ยง 6 บทล่าสุด · เลือกบทที่เคยฟังน้อยที่สุดก่อน
function pickDlg(cat){
 const d=D();let c=DL.filter(x=>okDlg(x,cat));if(!c.length)return null;
 const recent=d.hist.slice(-6).map(x=>x.id);
 let f=c.filter(x=>!recent.includes(x.id));if(!f.length){const last=d.hist.length?d.hist[d.hist.length-1].id:null;f=c.filter(x=>x.id!==last);if(!f.length)f=c}
 const mn=Math.min.apply(null,f.map(x=>d.seen[x.id]||0));
 return pickA(f.filter(x=>(d.seen[x.id]||0)===mn));
}
function mark(x){const d=D();d.seen[x.id]=(d.seen[x.id]||0)+1;d.hist.push({id:x.id,day:S.day,t:x.t});if(d.hist.length>40)d.hist.splice(0,d.hist.length-40)}

/* ---------------- เนื้อเรื่องหลัก 6 บท ---------------- */
function trouble4(){const d=D();return inTrouble()||(d.ch.day[3]&&S.day>=d.ch.day[3]+60)}
const CH=[
 {n:1,t:'การพบกันครั้งแรก',cond:()=>D().hired,need:'รับเรย์เข้าทำงาน',prog:()=>D().hired?'✔':'ยังไม่ได้รับ',reward:'ความสนิท +5 · ปลดล็อกการพูดคุย',auto:1,
  lines:['*|เรย์ในเสื้อเชิ้ตขาวและแว่นตากลม เดินมาที่โต๊ะอย่างเงียบ ๆ… กิ๊บกระต่ายสีขาวบนผมแกว่งเล็กน้อย',M_+'อะ... คุณ CEO ใช่ไหมครับ?',M_+'ขอบคุณที่เลือกผมครับ... จริง ๆ ไม่คิดเลยว่าจะมีใครเห็นคุณค่าในสิ่งที่ผมอยากทำ...',C_+'ยินดีต้อนรับสู่บริษัทนะ เรย์',M_+'ครับ! ผมจะทำให้เต็มที่เลยครับ'],fx:()=>{}},
 {n:2,t:'จุดเริ่มต้นของความฝัน',cond:()=>{const d=D();return d.ch.m>=1&&d.f>=10&&S.day>=d.hireDay+1},need:'ความสนิท 10 · ผ่านไป 1 วันหลังรับเข้า',prog:()=>'ความสนิท '+Math.min(10,D().f)+'/10',reward:'ความสนิท +5 · เงินสนับสนุน $1,000',
  lines:['*|หลังเลิกงาน เรย์ยังนั่งอยู่หน้าจอ ที่ข้าง ๆ มีสมุดสเก็ตช์ตัวละครเล่มเล็ก',M_+'ผมชื่อ "เรย์" ครับ... ตั้งแต่เด็กผมชอบเกม ชอบวาด ชอบสร้างโลกในจินตนาการ...',M_+'แต่ความฝันมันดูไกลเกินไป... ผมเลยเลือกเส้นทางที่ "ใกล้ที่สุด" คือการเป็นนักพัฒนา...',C_+'ความฝันไม่ได้ไกลเกินไปหรอก ถ้ามีคนเดินไปด้วยกัน',M_+'(หยุดไปครู่หนึ่ง) ...ครับ'],fx:()=>{S.money+=1000;gain(5,null,true)}},
 {n:3,t:'ความฝันที่เหมือนกัน',cond:()=>{const d=D();return d.ch.m>=2&&d.f>=25&&d.stats.proj>=1},need:'ความสนิท 25 · ทำโปรเจกต์ร่วมกับเรย์สำเร็จ 1 งาน',prog:()=>'ความสนิท '+Math.min(25,D().f)+'/25 · โปรเจกต์ '+Math.min(1,D().stats.proj)+'/1',reward:'ความสนิท +6 · ชื่อเสียง +2',
  lines:['*|โปรเจกต์ล่าสุดเพิ่งส่งมอบ เรย์เงยหน้าจากจอและยิ้มกว้างอย่างที่ไม่เคยเห็นมาก่อน',M_+'แต่พอได้คุยกับคุณ... ผมรู้สึกว่าคุณก็มีความฝันเดียวกันใช่ไหมครับ?',M_+'การสร้าง "บริษัทเกมของเราเอง" สร้างเกมที่คนเล่นแล้วมีความสุขจริง ๆ...',M_+'นั่นแหละครับ เหตุผลที่ผมเลือกบริษัทนี้ ไม่ใช่เพราะค่าจ้าง แต่เพราะผมเห็นความฝันแบบเดียวกันในตัวคุณ',C_+'งั้นเรามาทำให้มันเป็นจริงด้วยกัน'],fx:()=>{S.rep+=2;gain(6,null,true)}},
 {n:4,t:'วันที่บริษัทกำลังลำบาก',cond:()=>{const d=D();return d.ch.m>=3&&d.f>=35&&trouble4()},need:'ความสนิท 35 · บริษัทขาดทุน/เงินสดต่ำกว่า $5,000 (หรือผ่านไป 60 วันหลังบทที่ 3)',prog:()=>'ความสนิท '+Math.min(35,D().f)+'/35 · '+(trouble4()?'เงื่อนไขเหตุการณ์: พร้อม':'รอให้บริษัทลำบาก'),reward:'ความสนิท +8 · เรย์ช่วยเร่งโปรเจกต์ที่ค้างอยู่ (+30% ของส่วนที่เหลือ)',
  lines:['*|ออฟฟิศเงียบผิดปกติ ตัวเลขในบัญชีทำให้ทุกคนไม่กล้าพูดอะไร',M_+'CEO ครับ ผมได้ยินเรื่องตัวเลขของบริษัทแล้ว... ผมอยู่ตรงนี้นะครับ',M_+'ผมนั่งดูโปรเจกต์ทั้งหมดแล้ว ถ้าปรับลำดับงานและตัดส่วนที่ไม่จำเป็นออก เราเร่งได้อีกเยอะเลยครับ',C_+'แต่นายต้องอดหลับอดนอนนะ',M_+'ไม่เป็นไรครับ ผมสัญญาว่าจะไม่ยอมให้ความฝันของเราหยุดแค่นี้','*|เรย์รีแฟกเตอร์งานทั้งคืน โปรเจกต์ที่ค้างอยู่คืบหน้าอย่างเห็นได้ชัด'],
  fx:()=>{boostProject(.3);gain(8,null,true)}},
 {n:5,t:'ความผูกพัน',cond:()=>{const d=D();return d.ch.m>=4&&d.f>=60&&S.day>=(d.ch.day[4]||0)+3},need:'ความสนิท 60 · ผ่านบทที่ 4 แล้ว 3 วัน',prog:()=>'ความสนิท '+Math.min(60,D().f)+'/60',reward:'ความสนิท +8 · พลังร่วมทีมของเรย์เพิ่มขึ้น',
  lines:['*|ค่ำวันหนึ่ง เรย์วางแก้วชาไว้บนโต๊ะ CEO แล้วนั่งลงข้าง ๆ โดยไม่พูดอะไรสักพัก',M_+'ผมดีใจนะครับ ที่ได้เป็นส่วนหนึ่งของความฝันต่อไป',M_+'ที่นี่ไม่ใช่แค่ที่ทำงานแล้วครับ... มันเหมือนบ้านอีกหลังหนึ่งของผม',M_+'ไม่ใช่แค่งานนี้ แต่ผมอยากเป็น "เพื่อนร่วมฝัน" ของคุณด้วย มาสร้างสิ่งที่ยิ่งใหญ่ไปด้วยกันนะครับ... CEO'],fx:()=>{gain(8,null,true)}},
 {n:6,t:'Dream Partner',cond:()=>{const d=D();return d.ch.m>=5&&d.f>=100},need:'ความสนิท 100 · ผ่านบทที่ 1–5 ทั้งหมด',prog:()=>'ความสนิท '+D().f+'/100 · บทที่ผ่านแล้ว '+Math.min(5,D().ch.m)+'/5',reward:'ฉากจบพิเศษ · ฉายา DREAM PARTNER – คู่หูแห่งความฝัน · ชื่อเสียง +5 · $5,000',
  lines:[],ending:1,fx:()=>{const d=D();d.title='DREAM PARTNER – คู่หูแห่งความฝัน';S.rep+=5;S.money+=5000}}
];
const ENDING=[ '*|คืนนั้น ออฟฟิศเหลือเพียงแสงจากเมืองที่ส่องผ่านหน้าต่างบานใหญ่… CEO กับเรย์ยืนเคียงข้างกัน',
 M_+'CEO ครับ... ผมดีใจนะครับที่ได้มาอยู่ที่นี่',M_+'ตอนแรกผมคิดว่าผมเข้ามาเพื่อสร้างเกม',M_+'แต่ตอนนี้ผมรู้แล้วครับว่าผมอยากสร้างอะไร',M_+'ผมอยากสร้างความฝันนี้ไปพร้อมกับคุณครับ',
 '*|✨ ปลดล็อกฉายา: DREAM PARTNER – คู่หูแห่งความฝัน'];
function boostProject(frac){
 try{
  let best=null,left=0;
  (S.projects||[]).forEach(p=>{const l=Object.keys(p.need).reduce((a,k)=>a+Math.max(0,p.need[k]-p.done[k]),0);if(l>left){left=l;best=p}});
  if(best){Object.keys(best.need).forEach(k=>{const l=Math.max(0,best.need[k]-best.done[k]);best.done[k]=Math.min(best.need[k],best.done[k]+l*frac)});say('⚡ โปรเจกต์ "'+best.n+'" คืบหน้าเพิ่มขึ้นจากการช่วยของเรย์');best.reiW=(best.reiW||0)+left*frac}
  else{S.money+=2000;say('💰 ไม่มีโปรเจกต์ค้าง เรย์หารายได้เสริมให้ $2,000')}
 }catch(e){}
}
function chapterCheck(){
 try{
  const d=D();if(!d.hired||d.ch.p)return;
  const n=d.ch.m+1;if(n>6)return;const c=CH[n-1];
  if(c.cond()){d.ch.p=n;banner('📖 บทที่ '+n+' · '+c.t,'พร้อมแล้ว — ไปคุยกับเรย์ที่ออฟฟิศ')}
 }catch(e){console.error('[rei chapter]',e)}
}
function finishChapter(n){
 const d=D(),c=CH[n-1];d.ch.m=Math.max(d.ch.m,n);d.ch.p=0;d.ch.day[n]=S.day;
 try{c.fx()}catch(e){}
 say('📖 จบบทที่ '+n+' · '+c.t+' — '+c.reward);
 try{save(1)}catch(e){}
 setTimeout(chapterCheck,1000);
}

/* ---------------- เหตุการณ์สุ่ม 10 แบบ ---------------- */
function inOffice(){try{const st=CEOScene.dbg().st;return !(st&&st.active)}catch(e){return true}}
function planPath(R,pred){try{const a=R.x/T|0,b=R.y/T|0;return bfs(a,b,pred)}catch(e){return null}}
function toPlayer(R){const p=S.pl;if(!p)return false;const tx=p.x/T|0,ty=p.y/T|0;const path=planPath(R,(x,y)=>Math.abs(x-tx)+Math.abs(y-ty)===1);if(path&&path.length){R.path=path;R.st='go';R.ty='reiCeo';return true}return false}
function toSofa(R){try{const a=R.x/T|0,b=R.y/T|0;const fs=S.f.filter(f=>f.t==='sofa'||f.t==='table').sort((p,q)=>Math.abs(p.x-a)+Math.abs(p.y-b)-Math.abs(q.x-a)-Math.abs(q.y-b));for(const f of fs){const p=bfs(a,b,(x,y)=>Math.abs(x-f.x)+Math.abs(y-f.y)===1);if(p&&p.length){R.path=p;R.st='go';R.ty=f.t;return true}}}catch(e){}return false}
const atDesk=R=>R&&R.st==='work';
const EV={
 greet:{min:0,cd:1,w:3,dur:70,cond:(R,c)=>atDesk(R)&&c.h>=9&&c.h<16&&c.near,start:R=>{toPlayer(R)},
  lines:c=>{const x=pickDlg('A');if(x)mark(x);return ['*|เรย์ลุกจากโต๊ะ เดินมาทักอย่างเกร็ง ๆ',M_+'CEO ครับ! ขอรบกวนแป๊บนึงนะครับ'].concat(x?x.lines:[M_+'ผมแค่อยากทักทายครับ'])},fx:()=>{gain(1,'ev')}},
 overtime:{min:10,cd:3,w:2,dur:120,cond:(R,c)=>atDesk(R)&&c.wk&&c.h>=16.3&&c.h<17.4&&(S.projects||[]).length>0,start:R=>{D().otUntil=S.day*1440+19*60+30},
  lines:c=>['*|ไฟหน้าจอของเรย์ยังสว่างอยู่ ทั้งที่คนอื่นเริ่มทยอยกลับกันแล้ว',C_+'ยังไม่กลับอีกเหรอ?',M_+'อีกนิดเดียวครับ ผมเหลือฟังก์ชันสุดท้ายที่อยากเสร็จวันนี้',M_+'ถ้าพรุ่งนี้เราส่งงานได้ไวขึ้น ผมว่ามันคุ้มครับ (ยิ้มเหนื่อย ๆ)'],fx:()=>{gain(1,'ev');const R=rei();if(R){R.en=Math.max(0,R.en-8)}}},
 rest:{min:0,cd:1,w:2,dur:45,cond:(R,c)=>atDesk(R)&&c.h>=10&&c.h<16&&R.en<75&&S.f.some(f=>f.t==='sofa'||f.t==='table'),start:R=>{toSofa(R)},
  lines:c=>['*|เรย์นั่งพักสายตาอยู่บนโซฟา มือถือแก้วกาแฟอุ่น ๆ',C_+'พักอยู่เหรอ?',M_+'ครับ แบบนี้แหละ ผมเรียกว่า "โหลดแบตเตอรี่" ครับ',M_+'พักห้านาที แล้วสมองจะเขียนโค้ดดีขึ้นสิบชั่วโมงเลย... (กระซิบ) อันนี้ผมคิดเองนะครับ'],fx:()=>{gain(1,'ev');const R=rei();if(R){R.en=Math.min(100,R.en+10);R.sr=Math.max(0,R.sr-8)}}},
 code:{min:0,cd:1,w:3,dur:80,cond:(R,c)=>atDesk(R)&&c.h>=9&&c.h<17&&(S.projects||[]).length>0,start:R=>{},
  lines:c=>['*|เรย์พิมพ์โค้ดด้วยความเร็วที่ตามแทบไม่ทัน บนจอมีตัวอักษรสีเขียววิ่งเป็นสาย',C_+'กำลังเขียนอะไรอยู่?',M_+'ส่วนที่จะทำให้ระบบเร็วขึ้นสองเท่าครับ... (พิมพ์ต่ออีกครู่) เสร็จแล้ว!',M_+'ผมลองรันทดสอบให้ดูนะครับ... ผ่านทั้งหมดเลย!'],fx:()=>{gain(1,'ev');boostProject(.05)}},
 sleep:{min:0,cd:2,w:2,dur:60,cond:(R,c)=>atDesk(R)&&c.wk&&c.h>=13&&c.h<15.5&&R.en<90,start:R=>{},
  lines:c=>['*|เรย์ฟุบหน้าอยู่บนโต๊ะ มีกิ๊บกระต่ายสั่นเบา ๆ ตามจังหวะหายใจ',M_+'...อึก... เผลอหลับไปอีกแล้ว...',M_+'ช่วงนี้งานเยอะไปหน่อย... แต่สนุกครับ เพราะมันคือโปรเจกต์ในฝันของเรา...',M_+'(รีบเงยหน้า หน้าแดง) ขอโทษครับ CEO! ผมจะตั้งใจทำงานต่อ!'],fx:()=>{gain(2,'ev');const R=rei();if(R){R.en=Math.min(100,R.en+18)}}},
 gamechat:{min:10,cd:3,w:2,dur:70,cond:(R,c)=>atDesk(R)&&c.h>=10&&c.h<16&&c.near,start:R=>{toPlayer(R)},
  lines:c=>['*|เรย์เดินมาพร้อมกระดาษสเก็ตช์แผ่นเล็ก ดวงตาเป็นประกาย',M_+'CEO ครับ! ผมมีไอเดียเกมใหม่ อยากเล่าให้ฟังหน่อยได้ไหมครับ?',{ask:'คุณอยากให้เกมของเราเป็นแนวไหน?',opts:[
    {t:'RPG ผจญภัยโลกกว้าง',say:[M_+'โอ้ ผมชอบมากครับ! โลกกว้าง ๆ แล้วมีเรื่องเล่าซ่อนอยู่ทุกมุม',M_+'งั้นผมจะร่างแผนที่ให้ก่อนเลยครับ']},
    {t:'พัซเซิลน่ารัก ๆ',say:[M_+'พัซเซิลก็ดีครับ ผู้เล่นจะได้ยิ้มระหว่างคิด',M_+'ผมจะวาดตัวละครกระต่ายเป็นพระเอกเลยครับ (หัวเราะเบา ๆ)']},
    {t:'เกมจำลองบริษัทของเราเอง',say:[M_+'เอ๊ะ... นั่นมันเกมที่เรากำลังอยู่ข้างในเลยนะครับ!',M_+'ผมว่านั่นแหละคือเกมที่ดีที่สุดครับ']}]}],fx:()=>{gain(2,'ev');S.rep+=1;boostProject(.03)}},
 cheer:{min:20,cd:3,w:3,dur:70,cond:(R,c)=>atDesk(R)&&c.near&&(inTrouble()||(S.emp||[]).some(e=>e.sr>75)),start:R=>{toPlayer(R)},
  lines:c=>['*|เรย์เดินมาหยุดตรงหน้า พร้อมถือแก้วชาร้อนที่ชงไว้ให้',M_+'CEO ครับ... ผมเห็นว่าช่วงนี้คุณดูตึงเครียด',M_+'ไม่ว่าอะไรจะเกิดขึ้น ผมเชื่อในตัวคุณเสมอครับ',M_+'ดื่มชาก่อนนะครับ แล้วเราค่อยช่วยกันคิดไปทีละอย่าง'],fx:()=>{gain(2,'ev');(S.emp||[]).forEach(e=>{e.ha=Math.min(100,e.ha+3);e.sr=Math.max(0,e.sr-4)})}},
 celebrate:{min:0,cd:0,w:0,dur:50,cond:()=>false,start:R=>{},
  lines:c=>['*|เรย์ชูกำปั้นขึ้นเหนือหัวพร้อมโปรยกระดาษสีเล็ก ๆ จากลิ้นชัก',M_+'โปรเจกต์ผ่านแล้วครับ CEO! เราทำสำเร็จแล้ว!',M_+'ฉลองกันหน่อยนะครับ ผมแอบซื้อขนมมาแจกทุกคนด้วย (ยิ้มกว้าง)'],fx:()=>{gain(1,'ev');(S.emp||[]).forEach(e=>{e.ha=Math.min(100,e.ha+4)})}},
 birthday:{min:0,cd:100,w:0,dur:90,cond:()=>false,start:R=>{},
  lines:c=>['*|โต๊ะของเรย์มีเทียนเล่มเล็กปักบนขนมชิ้นหนึ่ง… ที่ข้าง ๆ มีลูกโป่งกระต่ายสีขาว',M_+'CEO ครับ... วันนี้เป็นวันเกิดของผมเอง',{ask:'คุณจะฉลองวันเกิดให้เรย์อย่างไร?',opts:[
    {t:'ซื้อเค้กฉลอง (-$500)',need:{money:500},get say(){const ok=S.money>=500;if(ok){S.money-=500;D().stats.gifts++;gain(6,null,true);(S.emp||[]).forEach(e=>e.ha=Math.min(100,e.ha+5))}return ok?[M_+'เค้ก...?! ขอบคุณครับ CEO! นี่เป็นวันเกิดที่ดีที่สุดเลยครับ','*|ทั้งออฟฟิศร่วมร้องเพลงอวยพร ทุกคนมีความสุข']:[M_+'ไม่เป็นไรครับ แค่คุณจำได้ก็พอแล้ว']}},
    {t:'อวยพรด้วยคำพูด',get say(){D().stats.gifts++;gain(3,null,true);return [M_+'ขอบคุณครับ... แค่นี้ผมก็ดีใจที่สุดแล้ว','เรย์|ขอให้ปีหน้า เกมของเราสำเร็จนะครับ']}}]}],fx:()=>{D().bdayDone[Math.floor((S.day-1)/120)]=1}},
 cityview:{min:25,cd:3,w:0,dur:60,cond:()=>false,start:R=>{},
  lines:c=>['*|เรย์ยืนมองไฟเมืองสะท้อนบนจอมอนิเตอร์ที่ปิดแล้ว',C_+'ดูอะไรอยู่?',M_+'ไฟเมืองครับ... เหมือนพิกเซลเรืองแสงเป็นพัน ๆ ดวง',M_+'ผมเคยคิดว่าสักวันเกมของเราจะสว่างเท่านี้ — ตอนนี้ผมเริ่มเชื่อแล้วครับ'],fx:()=>{gain(2,'ev')}}
};
function ctxNow(){
 const R=rei(),p=S.pl;
 return{h:hourNow(),wk:(S.day-1)%7<5,near:!!(R&&p&&Math.hypot(R.x-p.x,R.y-p.y)<260)};
}
function startEvent(id,force){
 const d=D(),R=rei(),ev=EV[id];if(!R||!ev||!onFloor(R))return false;
 if(d.ev&&!force)return false;
 if(!force&&nowM()-d.evAt<150)return false;
 d.ev={id,start:nowM(),until:nowM()+ev.dur,hit:0};d.evAt=nowM();d.evlast[id]=S.day;d.occ[id]=(d.occ[id]||0)+1;
 try{ev.start(R)}catch(e){}
 return true;
}
function endEvent(done){
 const d=D();if(!d.ev)return;
 if(done)d.done[d.ev.id]=(d.done[d.ev.id]||0)+1;
 d.ev=null;
}
function tick(){
 try{
  if(typeof S!=='object'||!S||!Array.isArray(S.emp))return;
  const lb=document.getElementById('lobby');if(lb&&lb.style.display!=='none'&&getComputedStyle(lb).display!=='none')return;
  const d=D(),R=rei();
  if(!d.hired||!R)return;
  if(S.paused||S.over)return;
  const m=nowM();
  if(d.ev&&m>d.ev.until)endEvent(false);
  chapterCheck();
  // วันเกิด
  const yi=Math.floor((S.day-1)/120);
  if(!d.ev&&d.bday&&yearDay()===d.bday&&!d.bdayDone[yi]&&R.st==='work'&&onFloor(R)&&hourNow()>=9&&hourNow()<16&&(S.day-1)%7<5)startEvent('birthday',true);
  // กลางคืน/ล่วงเวลา: ชมวิวเมือง
  if(!d.ev&&d.otUntil&&m<d.otUntil&&hourNow()>=18&&hourNow()<19.4&&R.st==='work'&&d.f>=EV.cityview.min&&(d.evlast.cityview||-9)<S.day)startEvent('cityview',true);
  if(d.otUntil&&m>=d.otUntil)d.otUntil=0;
  // พักผ่อนตามธรรมชาติ (ระบบเดิมส่งเรย์ไปโซฟา)
  if(!d.ev&&R.st==='use'&&(R.ty==='sofa'||R.ty==='table')&&(d.evlast.rest||-9)<S.day){d.ev={id:'rest',start:m,until:m+EV.rest.dur,hit:0};d.evAt=m;d.evlast.rest=S.day;d.occ.rest=(d.occ.rest||0)+1}
  // สุ่มเหตุการณ์
  if(!d.ev&&inOffice()&&onFloor(R)&&m-d.evAt>=150&&Math.random()<.06){
   const c=ctxNow(),tier=d.f;
   const opts=Object.keys(EV).filter(k=>{const e=EV[k];return e.w>0&&d.f>=e.min&&(d.evlast[k]||-9)+e.cd<=S.day&&e.cond(R,c)});
   if(opts.length){const bag=[];opts.forEach(k=>{for(let i=0;i<EV[k].w;i++)bag.push(k)});startEvent(pickA(bag))}
  }
 }catch(e){console.error('[rei tick]',e)}
}
setInterval(tick,700);

/* ---------------- การสนทนา ---------------- */
const TALK={on:0};
function busy(){return !!(TALK.on||PNL.on||END.on)}
function nearRei(){const R=rei(),p=S.pl;if(!R||!p||!onFloor(R)||R.st==='home'||R.st==='errandWait')return null;return Math.hypot(R.x-p.x,R.y-p.y)<=72?R:null}
function bestCtx(){
 const h=hourNow();
 if(bdState()==='today')return 'J';
 if(inTrouble())return 'G';
 if(inSuccess())return 'H';
 if(h>=17||h<6)return 'F';
 return 'I';
}
function menu(){
 const d=D(),ctx=bestCtx();
 const T_=(cat)=>({t:null,cat});
 const topic=(label,cat)=>({t:label,get say(){
   const x=pickDlg(cat);
   if(!x)return [M_+'ตอนนี้ผมยังไม่มีเรื่องใหม่ให้เล่าครับ ไว้คุยกันอีกทีนะครับ',menu()];
   mark(x);const fc=dayCap();
   let note=[];
   if(fc.talk<CAPS.talk){gain(1,'talk')}else if(!d.fc.warn){d.fc.warn=1;note=['*|(วันนี้คุยกันเยอะแล้ว ความสนิทที่ได้จากการพูดคุยเต็มโควตารายวัน — พรุ่งนี้ค่อยคุยต่อ)']}
   d.stats.talk++;
   return x.lines.concat(note,[menu()]);
 }});
 const ctxLabel={J:'🎂 เรื่องวันเกิด',G:'💬 ปรึกษาเรื่องบริษัทที่กำลังลำบาก',H:'🎉 คุยเรื่องความสำเร็จของบริษัท',F:'🌙 คุยตอนกลางคืน',I:'🍃 คุยเรื่องอากาศ/ฤดูกาล'}[ctx];
 const opts=[topic('งานเป็นยังไงบ้าง?','B'),topic('มีไอเดียเกมใหม่ไหม?','C'),topic('ทำไมถึงเลือกมาที่นี่? / เรื่องความฝัน','D'),topic('พักบ้างนะ / ขอบใจที่อยู่ด้วยกัน','E'),topic(ctxLabel,ctx),
  {t:'📋 ดูโปรไฟล์ / เนื้อเรื่อง',get say(){setTimeout(()=>panel(),250);return [M_+'ครับ เชิญดูได้เลยครับ']}},
  {t:'[ไว้คุยทีหลังนะ]',cancel:true,say:[M_+'ครับ! ไว้คุยกันใหม่นะครับ CEO']}];
 return {ask:'คุณอยากคุยเรื่องอะไรกับเรย์?',opts};
}
function session(R){
 const d=D();
 if(!root.QUEST||!QUEST.openDlg||(QUEST.dlgOpen&&QUEST.dlgOpen()))return;
 TALK.on=1;R.bub=0;R.path=R.path||[];
 let lines=[],after=null;
 if(!d.seen1){d.seen1=1;lines=lines.concat(CH[0].lines);gain(0,null,true);}
 else if(d.ch.p){const n=d.ch.p,c=CH[n-1];if(c.ending){endingScene();TALK.on=0;return}lines=lines.concat(c.lines);after=()=>finishChapter(n)}
 else if(d.ev&&EV[d.ev.id]&&nowM()<=d.ev.until){const id=d.ev.id;lines=lines.concat(EV[id].lines(ctxNow()));after=()=>{const dd=D();if(dd.ev&&dd.ev.id===id){endEvent(true)}try{EV[id].fx()}catch(e){console.error(e)}}}
 else{const g=pickDlg('A');if(g){mark(g);lines=lines.concat(g.lines)}else lines.push(M_+'ครับ CEO?')}
 lines.push(menu());
 QUEST.openDlg(lines,()=>{TALK.on=0;try{if(after)after()}catch(e){console.error('[rei after]',e)}try{save(1)}catch(e){}});
}
function talk(){
 try{
  if(typeof S!=='object'||!S||!D().hired||busy())return false;
  const R=nearRei();if(!R)return false;
  session(R);return true;
 }catch(e){console.error('[rei talk]',e);return false}
}
function hold(e){
 try{const d=D();if(TALK.on&&e.st==='work')return true;if(d.ev&&e.st==='work'&&(d.ev.id==='sleep'||d.ev.id==='birthday'||d.ev.id==='celebrate'))return true}catch(x){}
 return false;
}
function leaveH(e){try{const d=D();return d.otUntil&&nowM()<d.otUntil?19.5:17.5}catch(x){return 17.5}}

/* ---------------- ภาพซ้อนทับในออฟฟิศ (อนิเมชันเหตุการณ์ + ชื่อ + สัญลักษณ์พูดคุย) ---------------- */
function over(g,e,t){
 const d=D(),x=Math.round(e.x),y=Math.round(e.y),tt=performance.now(),work=e.st==='work';
 const top=work?y-45:y-52;
 g.save();g.textAlign='center';
 const ev=d.ev&&nowM()<=d.ev.until?d.ev.id:null;
 // ชื่อ + สัญลักษณ์พูดคุยเมื่อผู้เล่นเข้าใกล้
 const p=S.pl,dist=p?Math.hypot(e.x-p.x,e.y-p.y):999;
 if(dist<=110||ev||d.ch.p){
  g.font='bold 10px "Noto Sans Thai",sans-serif';const nm='Rei ★';const w=g.measureText(nm).width+10;
  g.fillStyle='rgba(15,26,51,.9)';g.fillRect(x-w/2,top-16,w,13);g.strokeStyle='#c89d4b';g.lineWidth=1;g.strokeRect(x-w/2,top-16,w,13);
  g.fillStyle='#ffe9a8';g.fillText(nm,x,top-6);
  if(dist<=72||ev||d.ch.p){g.font='14px sans-serif';g.fillText(d.ch.p?'❗':'💬',x+(g.measureText?20:0),top-6+Math.sin(tt*.006)*2)}
 }
 if(TALK.on){g.fillStyle='#fff';g.fillRect(x-9,top-32,18,10);g.fillStyle='#333';for(let i=0;i<3;i++)if((Math.floor(tt/260)+i)%3)g.fillRect(x-6+i*5,top-28,2,2)}
 if(ev==='sleep'){g.fillStyle='rgba(20,30,60,.35)';g.fillRect(x-17,y-43,34,26);g.fillStyle='#bcd8ff';g.font='bold 13px sans-serif';for(let i=0;i<3;i++){const a=((tt/700)+i/3)%1;g.globalAlpha=1-a;g.fillText('z',x+12+i*5,y-46-a*18)}g.globalAlpha=1}
 else if(ev==='code'||(work&&!ev&&Math.floor(tt/3000)%2===0&&(S.projects||[]).length)){g.fillStyle='rgba(80,255,150,.85)';g.font='9px monospace';const k=Math.floor(tt/140);const s=['</>','{ }','01','fn','=>','()'][k%6];g.fillText(s,x+16,y-34-(k%4)*3);g.fillStyle='rgba(80,255,150,.25)';g.fillRect(x-7,y-17,14,3)}
 else if(ev==='overtime'||ev==='cityview'){g.fillStyle='rgba(255,220,140,.25)';g.beginPath();g.arc(x,y-26,26,0,7);g.fill();g.font='13px sans-serif';g.fillStyle='#ffe9a8';g.fillText(ev==='cityview'?'🌃':'🌙',x+18,y-44+Math.sin(tt*.004)*2)}
 else if(ev==='rest'){g.font='13px sans-serif';g.fillText('☕',x+14,y-44+Math.sin(tt*.004)*2)}
 else if(ev==='greet'||ev==='gamechat'||ev==='cheer'){g.font='13px sans-serif';g.fillText(ev==='gamechat'?'🎮':ev==='cheer'?'💙':'👋',x-18,y-52+Math.sin(tt*.006)*2)}
 else if(ev==='celebrate'||ev==='birthday'){
  const cols=['#ff7aa8','#ffd45a','#7ad0ff','#9be37a','#c79bff'];
  for(let i=0;i<14;i++){const a=((tt/900)+i*.37)%1,px=x+Math.sin(i*2.3+tt*.002)*22,py=y-62+a*54;g.fillStyle=cols[i%5];g.globalAlpha=1-a*.6;g.fillRect(px,py,3,3)}
  g.globalAlpha=1;g.font='13px sans-serif';g.fillText(ev==='birthday'?'🎂':'🎉',x+16,y-48+Math.sin(tt*.005)*2);
 }
 g.restore();
}

/* ---------------- UI: โปรไฟล์ / เนื้อเรื่อง / ความสัมพันธ์ / บันทึก ---------------- */
const PNL={on:0,tab:'p'};
function css(){
 if(document.getElementById('reiCss'))return;
 const s=document.createElement('style');s.id='reiCss';
 s.textContent=`#reiPanel{position:fixed;inset:0;z-index:9400;background:rgba(5,8,18,.86);display:none;align-items:center;justify-content:center;padding:10px;font-family:'Noto Sans Thai','Sarabun',system-ui,sans-serif;color:#e8ebf2}
#reiPanel.on{display:flex}
.rpBox{width:min(880px,100%);max-height:94vh;display:flex;flex-direction:column;background:linear-gradient(#1b2130,#121722);border:2px solid #e0a82e;border-radius:10px;box-shadow:0 10px 40px rgba(0,0,0,.7);overflow:hidden}
.rpHd{display:flex;gap:12px;align-items:center;padding:10px 14px;background:linear-gradient(#2a2250,#1b1838);border-bottom:2px solid #e0a82e}
.rpHd img{width:70px;height:86px;object-fit:cover;object-position:top;border-radius:8px;border:2px solid #c79bff;background:#2a2250;image-rendering:pixelated}
.rpHd .nm{font-size:20px;font-weight:700}.rpHd .tg{color:#ffd45a;font-size:12px;letter-spacing:2px}.rpHd small{color:#b8bfd1;display:block}
.rpX{margin-left:auto;align-self:flex-start;font:inherit;background:#2a3246;color:#fff;border:1px solid #46506a;border-radius:6px;padding:4px 10px;cursor:pointer}
.rpTabs{display:flex;gap:4px;padding:6px 10px;background:#10141c;overflow-x:auto}
.rpTabs button{flex:none;font:inherit;background:#222a3a;color:#e8ebf2;border:1px solid #3a4560;border-radius:6px;padding:6px 12px;cursor:pointer}
.rpTabs button.on{background:#e0a82e;color:#1a1a22;border-color:#ffd45a;font-weight:700}
.rpBd{padding:12px 14px;overflow:auto;flex:1}
.rpC{background:linear-gradient(#1b2130,#151a25);border-left:3px solid #e0a82e;border-radius:6px;padding:9px 11px;margin:0 0 8px}
.rpC b{color:#ffe9a8}.rpC small,.rpS{color:#9aa3b2;font-size:12px}
.rpBar{height:12px;background:#0b0e14;border:1px solid #2d3548;border-radius:6px;overflow:hidden;margin:4px 0}
.rpBar u{display:block;height:100%;background:linear-gradient(90deg,#c79bff,#ffd45a)}
.rpG{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px}
.rpOk{color:#7be0a1}.rpLk{color:#8e98ac}.rpNow{color:#ffd45a}
.rpTier{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}.rpTier span{padding:3px 8px;border-radius:12px;border:1px solid #3a4560;font-size:12px;background:#171c27}.rpTier span.on{background:#e0a82e;color:#1a1a22;border-color:#ffd45a;font-weight:700}
.rpBtn{font:inherit;background:#2a3246;color:#fff;border:1px solid #46506a;border-radius:6px;padding:4px 10px;cursor:pointer;margin-top:4px}
.reiTag{color:#ffd45a;font-weight:700;font-size:12px;letter-spacing:1px}
.reiSkin{display:flex;gap:8px;flex-wrap:wrap;margin:6px 0}.reiSkin button{font:inherit;background:#222a3a;color:#fff;border:2px solid #3a4560;border-radius:8px;padding:4px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;width:84px}
.reiSkin button.on{border-color:#ffd45a;background:#2d3a57}.reiSkin img{width:64px;height:100px;object-fit:cover;object-position:top;border-radius:4px}`;
 document.head.appendChild(s);
}
function skillLines(R){
 const e=R||rei();const pr=e?prodOf(e):.7;const boosted=e?1.4*(1-(1-pr)*.7)/pr:1.4;
 return [
  ['⚡ Development Speed +40%','ทำงานโปรเจกต์เร็วขึ้น ×'+(e?boosted.toFixed(2):'1.40')+' (รวมผลลดข้อผิดพลาด) — ใช้จริงทุกช่วงเวลาทำงาน'],
  ['🛡 ลดข้อผิดพลาดการพัฒนา −30%','ตัดผลเสียจากความเหนื่อย/เครียด/หิวที่ทำให้ผลงานลดลง ('+Math.round((1-pr)*100)+'% → '+Math.round((1-pr)*70)+'%)'],
  ['⭐ เพิ่มคุณภาพโปรเจกต์ +35%','โปรเจกต์ที่เรย์ทำ ≥25% ของงานทั้งหมด จะได้รางวัล +35% · สำเร็จแล้ว '+D().stats.q+' งาน (+'+money(D().stats.qMoney)+')'],
  ['🤝 ทำงานร่วมกับ CEO','เพื่อนร่วมทีมทุกคนทำงานเร็วขึ้น +'+Math.round(collab()*100)+'% ขณะเรย์ทำงานอยู่ (สูงขึ้นตามระดับความสนิท)']
 ];
}
function pTab(){
 const d=D(),R=rei();
 let h='<div class="rpC"><b>พนักงานระดับ SECRET · ★★★★★</b><br>ตำแหน่ง: นักพัฒนาอัจฉริยะ (R&D / Tech Lead)<br>ความหายาก: พิเศษ (1%) · ค่าจ้าง: <b>20,000 บาท / เดือน</b>'+(d.title?'<br>ฉายา: <b class="rpNow">'+d.title+'</b>':'')+(d.bday?'<br>วันเกิด: วันที่ '+d.bday+' ของปี (ปีละ 120 วันในเกม)':'')+'</div>';
 h+='<div class="rpC"><b>ความสามารถระดับ S</b>'+skillLines(R).map(x=>'<div style="margin-top:5px"><span class="rpOk">'+x[0]+'</span><br><small>'+esc(x[1])+'</small></div>').join('')+'</div>';
 if(R)h+='<div class="rpC"><b>ทักษะ</b><div class="rpG">'+KS.map(k=>'<div>'+KN[k]+' '+R.sk[k]+'/10<div class="rpBar"><u style="width:'+R.sk[k]*10+'%"></u></div></div>').join('')+'</div></div>';
 h+='<div class="rpC"><b>"ถ้ามีชีวิตที่ได้สร้างเกมในแบบที่ฝัน... แล้วมีคนที่เชื่อในความฝันนั้นเหมือนกัน ผมคิดว่ามันคงพิเศษมากเลยครับ..."</b></div>';
 return h;
}
function sTab(){
 const d=D();let h='';
 CH.forEach(c=>{
  const done=d.ch.m>=c.n,cur=d.ch.m+1===c.n,pending=d.ch.p===c.n;
  const st=done?'<span class="rpOk">✔ จบแล้ว'+(d.ch.day[c.n]?' · วันที่ '+d.ch.day[c.n]:'')+'</span>':pending?'<span class="rpNow">❗ พร้อมแล้ว — ไปคุยกับเรย์</span>':cur?'<span class="rpNow">▶ กำลังดำเนินเรื่อง</span>':'<span class="rpLk">🔒 ยังล็อก</span>';
  h+='<div class="rpC"><b>บทที่ '+c.n+' · '+c.t+'</b><br>'+st+'<br><small>เงื่อนไข: '+esc(c.need)+'</small><br><small>ความคืบหน้า: '+esc(done?'สำเร็จ':c.prog())+'</small><br><small>รางวัล: '+esc(c.reward)+'</small>'+(done&&c.lines.length?'<br><button class="rpBtn" onclick="REI.readChapter('+c.n+')">📖 อ่านบันทึกเนื้อเรื่อง</button>':'')+(done&&c.ending?'<br><button class="rpBtn" onclick="REI.replayEnding()">🌃 ดูฉากจบอีกครั้ง</button>':'')+'</div>';
 });
 return h;
}
function fTab(){
 const d=D(),t=tierOf(d.f),nx=TIER_TH[t+1];
 let h='<div class="rpC"><b>ความสัมพันธ์: '+TIERS[t]+'</b> · '+d.f+'/100<div class="rpBar"><u style="width:'+d.f+'%"></u></div><small>'+(nx!=null?'อีก '+(nx-d.f)+' แต้มถึงระดับ '+TIERS[t+1]:'สูงสุดแล้ว — Dream Partner')+'</small><div class="rpTier">'+TIERS.map((n,i)=>'<span class="'+(i<=t?'on':'')+'">'+TIER_TH[i]+'+ '+n+'</span>').join('')+'</div>'
  +'<small>วิธีเพิ่ม: พูดคุย (สูงสุด '+CAPS.talk+' แต้ม/วัน) · เหตุการณ์ของเรย์ (สูงสุด '+CAPS.ev+'/วัน) · โปรเจกต์สำเร็จ ('+CAPS.proj+'/วัน) · เควสต์เนื้อเรื่อง · วันเกิด</small></div>';
 const un=DL.filter(x=>!x.min||d.f>=x.min).length;
 h+='<div class="rpC"><b>บทสนทนาที่ปลดล็อก</b> '+un+'/'+DL.length+'<br><small>'+Object.keys(CATN).map(k=>CATN[k]+' '+DL.filter(x=>x.cat===k&&(!x.min||d.f>=x.min)).length+'/'+DL.filter(x=>x.cat===k).length).join(' · ')+'</small></div>';
 h+='<div class="rpC"><b>เหตุการณ์พิเศษ</b>'+Object.keys(EV).map(k=>{const e=EV[k],lk=d.f<e.min;return '<div style="margin-top:4px">'+(lk?'<span class="rpLk">🔒 '+EVNAME[k]+' (ต้องความสนิท '+e.min+')</span>':'<span class="rpOk">✔ '+EVNAME[k]+'</span> <small>เกิดขึ้น '+(d.occ[k]||0)+' · ร่วมกัน '+(d.done[k]||0)+' ครั้ง</small>')+'</div>'}).join('')+'</div>';
 return h;
}
function lTab(){
 const d=D();
 return '<div class="rpC"><b>ประวัติการสนทนาล่าสุด</b> <small>(รวมพูดคุย '+d.stats.talk+' ครั้ง)</small>'+(d.hist.length?d.hist.slice().reverse().slice(0,20).map(x=>'<div class="rpS">วันที่ '+x.day+' · '+esc(x.t)+'</div>').join(''):'<div class="rpS">ยังไม่มีบทสนทนา</div>')+'</div>';
}
function renderPanel(){
 const el=document.getElementById('reiPanel');if(!el)return;
 const d=D(),t=tierOf(d.f);
 const tabs=[['p','โปรไฟล์'],['s','เนื้อเรื่อง ('+Math.min(6,d.ch.m)+'/6)'],['f','ความสัมพันธ์'],['l','บันทึกสนทนา']];
 el.innerHTML='<div class="rpBox"><div class="rpHd"><img src="'+(ART.portrait2||'')+'" alt="Rei"><div><div class="tg">★★★★★ SECRET</div><div class="nm">เรย์ (Rei)</div><small>R&D / Tech Lead · '+TIERS[t]+' · 💙 '+d.f+'/100</small></div><button class="rpX" onclick="REI.closePanel()">✕ ปิด</button></div>'
  +'<div class="rpTabs">'+tabs.map(x=>'<button class="'+(PNL.tab===x[0]?'on':'')+'" onclick="REI.tab(\''+x[0]+'\')">'+x[1]+'</button>').join('')+'</div><div class="rpBd">'+({p:pTab,s:sTab,f:fTab,l:lTab}[PNL.tab]||pTab)()+'</div></div>';
}
function panel(tab){
 css();
 let el=document.getElementById('reiPanel');if(!el){el=document.createElement('div');el.id='reiPanel';document.body.appendChild(el);el.addEventListener('pointerdown',e=>{if(e.target===el)closePanel()})}
 if(tab)PNL.tab=tab;PNL.on=1;S.paused=1;renderPanel();el.classList.add('on');
}
function closePanel(){const el=document.getElementById('reiPanel');if(el)el.classList.remove('on');if(PNL.on){PNL.on=0;if(S.paused===1)S.paused=0}}
function readChapter(n){closePanel();const c=CH[n-1];if(!c||!c.lines.length)return;setTimeout(()=>{if(root.QUEST&&QUEST.openDlg&&!QUEST.dlgOpen())QUEST.openDlg(c.lines.slice(),()=>{})},150)}
function staffHtml(e){const d=D(),t=tierOf(d.f);return '<div class="rpC" style="margin:6px 0"><span class="reiTag">★★★★★ SECRET</span> · 💙 '+TIERS[t]+' ('+d.f+'/100)<div class="rpBar"><u style="width:'+d.f+'%"></u></div><button class="rpBtn" onclick="REI.panel()">📖 โปรไฟล์ · เนื้อเรื่อง · ความสัมพันธ์</button></div>'}

/* ---------------- ฉากจบ: Dream Partner ---------------- */
const END={on:0,cv:null,raf:0,t0:0};
let reiAtlas=null;
function drawNight(g,w,h,t){
 const k=Math.min(1,t/1.2);
 const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#0a0820');gr.addColorStop(.55,'#2a1a55');gr.addColorStop(1,'#6b3a78');g.fillStyle=gr;g.fillRect(0,0,w,h);
 for(let i=0;i<90;i++){const x=(i*137+31)%w,y=(i*59+17)%(h*.5),a=.35+.5*Math.sin(t*1.6+i*2.1);g.fillStyle='rgba(235,240,255,'+Math.max(.1,a)+')';g.fillRect(x,y,i%7===0?3:2,i%7===0?3:2)}
 g.fillStyle='#f6edc8';g.beginPath();g.arc(w*.78,h*.2,34,0,7);g.fill();g.fillStyle='rgba(255,240,190,.12)';g.beginPath();g.arc(w*.78,h*.2,70,0,7);g.fill();
 const base=h*.78;
 for(let layer=0;layer<3;layer++){
  const col=['#241a4a','#1a1238','#120c2a'][layer];let x=-20;let s=layer*977+13;
  while(x<w){s=(s*9301+49297)%233280;const bw=46+(s%60),bh=60+layer*34+(s%120);g.fillStyle=col;g.fillRect(x,base-bh+layer*10,bw,bh+200);
   for(let yy=base-bh+layer*10+10;yy<base;yy+=14)for(let xx=x+6;xx<x+bw-6;xx+=12){s=(s*9301+49297)%233280;if(s%5<2){const tw=.5+.5*Math.sin(t*1.3+xx*.7+yy);g.fillStyle=(s%3?'rgba(255,225,140,':'rgba(160,220,255,')+(.45+.4*tw)+')';g.fillRect(xx,yy,5,7)}}
   x+=bw+3}
 }
 g.fillStyle='rgba(255,170,120,.10)';g.fillRect(0,base-40,w,80);
 // กรอบหน้าต่าง
 g.fillStyle='#0b0a1a';g.fillRect(0,0,w,26);g.fillRect(0,h-110,w,110);g.fillRect(0,0,26,h);g.fillRect(w-26,0,26,h);
 g.fillRect(w*.5-6,26,12,h-136);g.fillStyle='rgba(180,200,255,.07)';g.fillRect(26,26,w-52,h-136);
 g.fillStyle='#17142e';g.fillRect(0,h-110,w,6);
 // ตัวละคร (หันหลัง มองเมือง)
 const sc=2.5,cw=96,ch=120,by=h-150;
 const cx1=w*.5-70,cx2=w*.5+70;
 g.imageSmoothingEnabled=false;
 try{if(reiAtlas&&reiAtlas.complete)g.drawImage(reiAtlas,0,ch*1,cw,ch,cx1-cw*sc/2,by-ch*sc,cw*sc,ch*sc)}catch(e){}
 try{if(typeof CEOI!=='undefined'&&CEOI.complete&&CEOI.naturalWidth){const cwc=CEOI.naturalWidth/16,chc=CEOI.naturalHeight/4;g.drawImage(CEOI,0,chc*1,cwc,chc,cx2-cwc*sc/2,by-chc*sc,cwc*sc,chc*sc)}}catch(e){}
 g.imageSmoothingEnabled=true;
 g.fillStyle='rgba(8,6,20,'+(1-k)+')';g.fillRect(0,0,w,h);
}
function endingScene(){
 if(END.on)return;END.on=1;css();
 reiAtlas=new Image();reiAtlas.src=ART.atlas;
 const cv=document.createElement('canvas');cv.id='reiEnd';cv.style.cssText='position:fixed;inset:0;width:100vw;height:100vh;z-index:9000;background:#000;image-rendering:pixelated';
 const w=cv.width=Math.min(1280,innerWidth),h=cv.height=Math.round(w*innerHeight/innerWidth);document.body.appendChild(cv);END.cv=cv;END.t0=performance.now();
 const g=cv.getContext('2d');
 const loop=()=>{if(!END.on)return;drawNight(g,w,h,(performance.now()-END.t0)/1000);END.raf=requestAnimationFrame(loop)};loop();
 setTimeout(()=>{
  QUEST.openDlg(ENDING.slice(),()=>{
   END.on=0;cancelAnimationFrame(END.raf);cv.remove();END.cv=null;
   const d=D();if(d.ch.p===6){finishChapter(6);setTimeout(()=>banner('🏆 ปลดล็อกฉายา DREAM PARTNER','คู่หูแห่งความฝัน — ดูได้ที่แท็บ CEO และโปรไฟล์เรย์'),600)}
   try{save(1)}catch(e){}
  });
 },900);
}
function replayEnding(){closePanel();setTimeout(()=>{if(END.on||(QUEST.dlgOpen&&QUEST.dlgOpen()))return;endingScene()},200)}

/* ---------------- สกินตัวละครผู้เล่น "เรย์" (โค้ด SUSHI1530) ---------------- */
const LSK='mct_rei_skin';
function skinOk(){try{if(localStorage.getItem(LSK)==='1')return true}catch(e){}try{return !!(S&&S.codeUnlocks&&S.codeUnlocks.rei)}catch(e){return false}}
function unlockSkin(){
 const was=skinOk();
 try{localStorage.setItem(LSK,'1')}catch(e){}
 try{if(typeof S==='object'&&S){S.codeUnlocks=S.codeUnlocks||{};S.codeUnlocks.rei=1;save(1)}}catch(e){}
 return {ok:true,msg:was?'🔓 ปลดล็อกตัวละคร "เรย์" ไว้แล้ว — เลือกได้ตอนสร้างตัวละครหรือที่แท็บ CEO':'🎉 ปลดล็อกตัวละคร "เรย์" แล้ว! เลือกได้ตอนสร้างตัวละครใหม่ หรือที่แท็บ CEO ในเกม'};
}
function setSkin(g){
 try{if(g==='r'&&!skinOk())return;S.ceoGender=g==='f'?'f':g==='r'?'r':'m';if(window.CEOG)CEOG.apply(true);try{save(1)}catch(e){}try{show()}catch(e){}}catch(e){console.error('[rei skin]',e)}
}
function skinHtml(){
 css();
 let cur='m';try{cur=CEOG.gender()}catch(e){}
 const art=(k)=>{try{return k==='r'?ART.suit:k==='f'?window.__CEO_ART.f.suit:window.__CEO_ART.suit}catch(e){return ''}};
 const b=(k,l)=>'<button class="'+(cur===k?'on':'')+'" onclick="REI.setSkin(\''+k+'\')"><img alt="" src="'+art(k)+'"><span>'+l+'</span></button>';
 const d=D();
 return '<div class="c"><b>🎭 ตัวละคร CEO</b>'+(d.title?'<br><small>ฉายา: <b class="rpNow">'+esc(d.title)+'</b></small>':'')+'<div class="reiSkin">'+b('m','ผู้ชาย')+b('f','ผู้หญิง')+(skinOk()?b('r','เรย์'):'')+'</div>'+(skinOk()?'':'<small>มีตัวละครลับ — กรอกโค้ดที่หน้าแรกเพื่อปลดล็อก</small>')+'</div>';
}

/* ---------------- ตัวช่วยทดสอบ (ไม่ถูกเรียกเองระหว่างเล่นปกติ) ---------------- */
root.REI={roll,candidate,mul,after,quality,talk,hold,leaveH,over,busy,panel,closePanel,tab:t=>{PNL.tab=t;renderPanel()},readChapter,replayEnding,staffHtml,skinOk,unlockSkin,setSkin,skinHtml,
 state:D,rei,gain,tierOf,startEvent,endEvent,tick,chapterCheck,finishChapter,onHired,pickDlg,mark,DL,CH,EV,TIERS,CAPS,collab,inTrouble,inSuccess,bdState,boostProject,endingScene,session,
 ready:()=>true};
})(window);

