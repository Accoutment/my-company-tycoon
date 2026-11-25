
/* ===== MY COMPANY TYCOON · Tutorial System (isolated module) =====
   - เก็บความคืบหน้าใน S.tut (ผ่านระบบ save เดิม: localStorage 'mct2')
   - หยุดเวลาด้วย S.speed=0 (ไม่แตะเงิน/วัน/พนักงาน/NPC) และคืนค่าเดิมเมื่อจบ
   - ตรวจจับการกระทำจากสถานะจริงของเกม (หน้าต่าง/แท็บ/ตำแหน่งผู้เล่น/คลิกจริง) ไม่มีปุ่มจำลอง */
(function(){
'use strict';
if(window.TUT)return;
const $=id=>document.getElementById(id);
const PORT='assets/img/11cc08c110a4.jpg';
const NAME='เลขาอลิสา · เลขาส่วนตัวของ CEO';
const GS=()=>{try{return S}catch(e){return null}};
const vis=el=>{if(!el||el.hidden||(el.closest&&el.closest('[hidden]')))return false;const r=el.getBoundingClientRect();if(r.width<2||r.height<2)return false;const cs=getComputedStyle(el);return cs.visibility!=='hidden'&&cs.display!=='none'};
const on=el=>!!el&&!el.hidden&&!(el.closest&&el.closest('[hidden]'));
const q=s=>{const a=document.querySelectorAll(s);for(const e of a)if(vis(e))return e;return null};
const qa=s=>[...document.querySelectorAll(s)].filter(vis);
const txt=(s,t)=>qa(s).find(e=>e.textContent.indexOf(t)>=0)||null;
const TAB=()=>{try{return tab}catch(e){return ''}};
const menuOpen=()=>on($('menu'));
const osOpen=()=>on($('osModal'));
const osApp=()=>{try{return OS.app}catch(e){return ''}};
const inMgr=()=>{try{return OS.inMgr()}catch(e){return false}};
const T32=32;
const HUD=()=>{const h=$('mctHud');return h&&!h.classList.contains('off')&&vis(h)?h:null};

/* ---------- การตรวจจับคลิกจริง ---------- */
let clicks=[],catLog=[];
addEventListener('click',e=>{clicks.push(e.target);if(clicks.length>40)clicks.shift();const b=e.target&&e.target.closest&&e.target.closest('#mCats .mCat');if(b)catLog.push([...b.parentNode.children].indexOf(b))},true);
const clicked=sel=>clicks.some(t=>t&&t.closest&&t.closest(sel));
const catBtn=i=>[...($('mCats')||{children:[]}).children][i]||null;
const catClicked=i=>catLog.indexOf(i)>=0;
const osIcon=n=>qa('#osModal .osIco').find(b=>(b.getAttribute('onclick')||'').indexOf("'"+n+"'")>=0)||null;
const osBack=()=>q('#osModal .osWin .osTitle button');
const osCloseBtn=()=>txt('#osModal .osBar button','ปิดคอม');
const hrTab=i=>qa('#osModal .hrTabs button')[i]||null;
const worldRect=(x,y,w,h)=>{const cv=$('cv');if(!cv)return null;const r=cv.getBoundingClientRect();const sx=r.width/cv.width,sy=r.height/cv.height;return{left:r.left+x*sx,top:r.top+y*sy,width:w*sx,height:h*sy,right:r.left+(x+w)*sx,bottom:r.top+(y+h)*sy}};
const calClose=()=>qa('#calModal button').find(b=>/✕|ปิด/.test(b.textContent))||null;

/* ---------- ตัวสร้างขั้นตอน ---------- */
const I=(t,o)=>Object.assign({t},o||{});
const M=(t,ok,o)=>Object.assign({t,ok},o||{});
const Q=(t,q,o,a,x)=>Object.assign({t,quiz:{q,o,a}},x||{});
const closeMenuStep=()=>M('เมื่อดูครบแล้ว กดปิดเมนูเพื่อกลับสู่หน้าจอหลักค่ะ',()=>!menuOpen(),{hl:()=>menuOpen()?q('#menu .mClose'):null,hint:'กดปุ่ม ✕ ปิดเมนู ที่เรืองแสงอยู่ค่ะ',praise:'เรียบร้อยค่ะ ท่านกลับสู่หน้าจอหลักแล้ว'});
const toCat=(i,tabId,label,say)=>M(say,()=>menuOpen()&&TAB()===tabId&&!$('pn').hidden&&catClicked(i),{hl:()=>menuOpen()?catBtn(i):$('menuBtn'),hint:'กดปุ่มที่เรืองแสงเพื่อไปยังหมวด '+label+' ค่ะ',praise:'ถูกต้องค่ะ! นี่คือหมวด '+label});
const closeComputer=()=>M('เมื่อใช้งานเสร็จ กด "ปิดคอม" เพื่อออกจากคอมพิวเตอร์ค่ะ',()=>!osOpen(),{hl:()=>osOpen()?osCloseBtn():null,hint:'กดปุ่ม "ปิดคอม" ที่เรืองแสงอยู่ค่ะ',praise:'เรียบร้อยค่ะ ท่านออกจากคอมพิวเตอร์แล้ว'});
const toDesktop=say=>M(say,()=>osOpen()&&osApp()==='',{hl:()=>osApp()?osBack():null,hint:'กดปุ่ม ✕ บนหน้าต่างแอปที่เรืองแสงเพื่อกลับหน้าจอหลักของคอมค่ะ',praise:'ถูกต้องค่ะ! นี่คือหน้าจอหลักของคอมพิวเตอร์'});
const openApp=(n,label,say)=>M(say,()=>osOpen()&&osApp()===n,{hl:()=>!osOpen()?$('pcBtn'):(osApp()&&osApp()!==n?osBack():osIcon(n)),hint:'กดปุ่มที่เรืองแสงเพื่อเปิด '+label+' ค่ะ',praise:'ถูกต้องค่ะ! ท่านเปิด '+label+' สำเร็จแล้ว'});

/* ---------- หลักสูตร ---------- */
const CH=[
{n:'การควบคุมเกมและหน้าจอหลัก',s:[
 I('ยินดีต้อนรับค่ะท่าน CEO! ดิฉันเป็นเลขาส่วนตัวของท่าน จะพาท่านเรียนรู้ทุกระบบในบริษัทไปทีละขั้นนะคะ\nทุกบทมีภารกิจให้ลองกดปุ่มจริงในเกม และดิฉันจะคอยแนะนำตลอดค่ะ'),
 I('ระหว่างฝึกอบรม เวลาในเกมจะหยุดไว้ก่อน เงิน พนักงาน และ NPC จะไม่เปลี่ยนแปลง ท่านไม่ต้องกังวลเลยค่ะ ท่านสามารถพักการฝึกและกลับมาเรียนต่อจากจุดเดิมได้ทุกเมื่อ'),
 I('แถบด้านบนคือหน้าจอหลักค่ะ\n• ซ้าย: ชื่อบริษัท และเลเวล CEO\n• ขวา: ความเร็วเกม ปฏิทิน และปุ่มเมนู',{hl:()=>$('top')}),
 I('แผงที่มุมขวาบนแสดงวันที่ เวลา สภาพอากาศ เงินสดของบริษัท และไอคอนฤดูกาลทั้ง 4 ค่ะ ถ้าบังมุมมอง กดปุ่มลูกศรเล็กด้านซ้ายของแผงเพื่อพับเก็บได้',{hl:HUD}),
 M('ลองบังคับ CEO เดินดูค่ะ บนคอมพิวเตอร์ใช้ W A S D หรือปุ่มลูกศร บนมือถือใช้จอยสติ๊กด้านซ้ายล่าง',()=>{const s=GS();return !!s&&Math.hypot(s.pl.x-cur().p0.x,s.pl.y-cur().p0.y)>=24},{move:true,pos:'top',enter(st){const s=GS();st.p0={x:s.pl.x,y:s.pl.y}},hint:'ลองกดปุ่มเดิน (W A S D / ลูกศร) หรือลากจอยสติ๊กดูนะคะ',praise:'เยี่ยมค่ะ! ท่านบังคับ CEO เดินได้แล้ว'}),
 I('ปุ่มด้านขวาล่างบนมือถือ: ปุ่มใหญ่ใช้ "คุย / โต้ตอบ" (บนคอมกด E) กับคนหรือสิ่งของตรงหน้า ปุ่ม "กระเป๋า" (กด B) ใช้เปิดของที่เก็บไว้ ส่วนปุ่มคอมพิวเตอร์จะปรากฏเมื่อท่านอยู่ในห้อง Manager ค่ะ',{hl:()=>vis($('acts'))?$('acts'):null}),
 M('ลองเปิดกระเป๋าดูค่ะ กดปุ่มกระเป๋าที่เรืองแสง (หรือกดปุ่ม B)',()=>on($('ceoBag')),{hl:()=>on($('ceoBag'))?null:(vis($('bagBtn'))?$('bagBtn'):null),hint:'กดปุ่ม "กระเป๋า" ที่เรืองแสง หรือกดแป้น B ค่ะ',praise:'ถูกต้องค่ะ! กระเป๋ามี 24 ช่อง ของชนิดเดียวกันซ้อนได้ช่องละ 64 ชิ้น',keysOk:['b']}),
 M('กดปุ่ม "ปิด" เพื่อปิดกระเป๋าค่ะ',()=>!on($('ceoBag')),{hl:()=>q('#ceoBag .bagHead button'),hint:'กดปุ่ม "ปิด ✕" ที่เรืองแสงค่ะ',praise:'เรียบร้อยค่ะ'})
]},
{n:'การบริหารบริษัท (เมนูและงาน)',s:[
 M('การบริหารบริษัททั้งหมดเริ่มจากปุ่ม "เมนู" ค่ะ ลองกดเปิดเมนูดูนะคะ',()=>menuOpen(),{hl:()=>$('menuBtn'),hint:'กดปุ่ม "☰ เมนู" ที่เรืองแสงด้านขวาบนค่ะ',praise:'ถูกต้องค่ะ! เมนูเปิดแล้ว และเกมจะหยุดชั่วคราวขณะเปิดเมนู'}),
 I('เมนูแบ่งเป็นหมวด: งาน/โปรเจกต์ · ตกแต่งออฟฟิศ · การเงิน · CEO · CEO PROFILE · ระบบ/บันทึก ค่ะ เราจะไล่ดูไปทีละหมวด',{hl:()=>$('mCats')}),
 toCat(0,'proj','งาน / โปรเจกต์','ลองกดหมวด "งาน / โปรเจกต์" ดูค่ะ'),
 I('นี่คือกระดานงานจากลูกค้าค่ะ แต่ละงานบอกรางวัล ระยะเวลา และทักษะที่ต้องใช้ ทีมจะทำตามทักษะของพนักงาน เมื่อส่งงานสำเร็จจะได้เงินและชื่อเสียง (REP) ชื่อเสียงสะสมทำให้บริษัทเลเวลสูงขึ้น และรับงานพร้อมกันได้ 2 + (เลเวลบริษัท ÷ 2) งานค่ะ',{hl:()=>$('pn')}),
 Q('ทดสอบความเข้าใจเล็กน้อยค่ะ','เมื่อส่งโปรเจกต์สำเร็จ ท่านจะได้รับอะไร?',['เงินรางวัลและชื่อเสียง (REP)','พนักงานใหม่ฟรี','เฟอร์นิเจอร์ฟรี'],0,{praise:'ถูกต้องค่ะ! รางวัลเป็นเงิน และชื่อเสียงช่วยเลื่อนเลเวลบริษัท'})
]},
{n:'ตกแต่งออฟฟิศ',s:[
 toCat(1,'build','ตกแต่งออฟฟิศ','ต่อไปดูหมวด "ตกแต่งออฟฟิศ" กันค่ะ กดปุ่มที่เรืองแสงได้เลย'),
 I('ที่นี่เลือกเฟอร์นิเจอร์แล้วแตะช่องว่างบนแผนที่เพื่อวาง จะเสียเงินตามราคาของชิ้นนั้นเมื่อวางจริง ส่วนเครื่องมือ "ย้าย" "หมุน" ใช้จัดตำแหน่งใหม่ และ "ลบ" จะคืนเงิน 50%\nพื้นและผนังเปลี่ยนสีได้ ราคา $200 ค่ะ',{hl:()=>$('pn')}),
 I('การเลือกเฟอร์นิเจอร์ไม่เสียเงินจนกว่าจะแตะวางจริงนะคะ ดังนั้นในการฝึกนี้เราจะดูอย่างเดียว ไม่ซื้อค่ะ'),
 I('ข้อควรรู้ค่ะ: เฟอร์นิเจอร์ชิ้นเดิมจะ "แพงขึ้น" ประมาณ 10% ของราคาตั้งต้นทุกครั้งที่ซื้อซ้ำ (นับสะสม ลบแล้วซื้อใหม่ก็ไม่ถูกลง) และบริษัทมีโต๊ะทำงานได้สูงสุด 10 โต๊ะ วางแผนก่อนซื้อด้วยนะคะ',{hl:()=>$('pn')}),
 closeMenuStep()
]},
{n:'ห้อง Manager · คอมพิวเตอร์ · การรับสมัคร',s:[
 M('พนักงานทุกคนจัดการผ่านคอมพิวเตอร์ในห้อง Manager ค่ะ ห้องอยู่ด้านขวาบนของแผนที่ (ตรงกรอบที่เรืองแสง) ลองเดินเข้าไปนะคะ',()=>inMgr(),{move:true,pos:'bot',hl:()=>worldRect(11*T32,5*T32,4*T32,2*T32),hint:'เดินไปยังห้องที่เรืองแสงด้านขวาบนของแผนที่ค่ะ',praise:'ถูกต้องค่ะ! ท่านอยู่ในห้อง Manager แล้ว ปุ่มคอมพิวเตอร์ปรากฏขึ้นแล้วค่ะ'}),
 M('กดปุ่มคอมพิวเตอร์ที่เรืองแสงเพื่อเปิดคอมค่ะ',()=>osOpen(),{hl:()=>$('pcBtn'),hint:'กดปุ่มรูปคอมพิวเตอร์ที่เรืองแสงด้านขวาล่างค่ะ',praise:'ถูกต้องค่ะ! เกมจะหยุดขณะใช้คอมพิวเตอร์'}),
 openApp('hr','ฝ่ายบุคคล (HR)','เปิดแอป "ฝ่ายบุคคล" เพื่อดูเรื่องพนักงานค่ะ'),
 I('แท็บ "รับสมัครงาน" แสดงผู้สมัคร ผู้สมัครเปลี่ยนทุก 3 วัน แต่ละคนมีทักษะ 5 ด้าน (Programming, Creativity, Communication, Management, Accounting) บุคลิก และเงินเดือน ค่าจ้างแรกเข้าประมาณ 2 ใน 3 ของเงินเดือน และต้องมีโต๊ะว่างค่ะ\nการฝึกนี้จะยังไม่จ้างใครนะคะ เพื่อรักษาเงินของบริษัท',{hl:()=>q('#osModal .hrContent')}),
 M('ลองกดแท็บ "พนักงานปัจจุบัน" เพื่อดูพนักงานในบริษัทค่ะ',()=>osOpen()&&osApp()==='hr'&&OS.hrTab==='staff',{hl:()=>hrTab(1),hint:'กดแท็บ "👥 พนักงานปัจจุบัน" ที่เรืองแสงค่ะ',praise:'ถูกต้องค่ะ! ตอนนี้ท่านตรวจสอบข้อมูลพนักงานของบริษัทได้แล้ว'}),
 I('ในหน้านี้เห็นพนักงานทุกคน พร้อมตำแหน่ง เลเวล EXP เงินเดือน ความหิว พลังงาน ความสุข และปุ่มฝึกทักษะ เลื่อนตำแหน่ง หรือเลิกจ้าง (ใช้เงินหรือมีผลถาวร ควรคิดให้รอบคอบ) ด้านล่างยังมี "ทีมตัวละครพิเศษ" เช่น ลุงชัย ป้าเพ็ญ และ รปภ. ด้วยค่ะ',{hl:()=>q('#osModal .hrContent')})
]},
{n:'ตำแหน่งและหน้าที่พนักงาน',s:[
 I('พนักงานแต่ละคนมีบุคลิก (ขยัน ขี้เกียจ เข้าสังคม เครียดง่าย ใจเย็น) ซึ่งมีผลต่อความเร็วและอารมณ์ และมีทักษะหลักตรงกับงานที่ถนัดค่ะ',{hl:()=>q('#osModal .hrContent')}),
 I('ตำแหน่งที่เลื่อนได้มี 3 แบบ:\n👥 หัวหน้าทีม — ต้อง Lv2 + Management 3 ค่าเลื่อน $3,000\n⭐ ผู้เชี่ยวชาญ — ต้อง Lv3 + ทักษะหลัก 6 ค่าเลื่อน $4,000\n🏢 ผู้จัดการ — เลื่อนจากหัวหน้าทีม ต้อง Lv5 + Management 7 ค่าเลื่อน $10,000\nจำนวนหัวหน้า+ผู้จัดการจำกัดตามจำนวนพนักงานค่ะ',{hl:()=>q('#osModal .hrContent')}),
 Q('ทดสอบค่ะ','ตำแหน่ง "ผู้จัดการ" ต้องเลื่อนมาจากตำแหน่งใด?',['พนักงานทั่วไป','หัวหน้าทีม','ผู้เชี่ยวชาญ'],1,{praise:'ถูกต้องค่ะ! ผู้จัดการต้องเริ่มจากหัวหน้าทีมก่อน'})
]},
{n:'เลเวลพนักงาน',s:[
 I('เลเวลพนักงานคำนวณจาก EXP: ทุก 200 EXP ขึ้น 1 เลเวล (สูงสุด Lv10) พนักงานได้ EXP จากการทำงานที่ได้รับมอบหมายค่ะ',{hl:()=>q('#osModal .hrContent')}),
 I('นอกจากนี้ยังฝึกทักษะได้ด้วยปุ่มฝึกในหน้าพนักงาน ค่าฝึก = $500 × ระดับทักษะปัจจุบัน (ทักษะเต็ม 10) เลเวลและทักษะที่สูงขึ้นทำให้เงินเดือนสูงขึ้นด้วยค่ะ ในการฝึกนี้เราจะยังไม่กดฝึกนะคะ',{hl:()=>q('#osModal .hrContent')}),
 Q('ทดสอบค่ะ','พนักงานต้องมี EXP อย่างน้อยเท่าไรจึงจะถึง Lv3?',['200','400','600'],1,{praise:'ถูกต้องค่ะ! Lv3 เริ่มที่ 400 EXP (200 EXP ต่อเลเวล)'})
]},
{n:'ระบบ Manager และการอัปเกรด',s:[
 I('หัวหน้าทีมและผู้จัดการเพิ่มความเร็วและผลงานให้เพื่อนร่วมทีมทุกคน หัวหน้าทีมเพิ่ม 12% + 4% ต่อแต้ม Management ส่วนผู้จัดการเพิ่ม 18% + 5% ต่อแต้ม Management แต่งานของตัวเองจะช้าลง (หัวหน้า −15%, ผู้จัดการ −30%)',{hl:()=>q('#osModal .hrContent')}),
 I('การอัปเกรด Manager คือเลื่อนหัวหน้าทีมเป็นผู้จัดการ (Lv5 + Management 7, $10,000) ระวังว่าคนเก่งอาจถูกบริษัทคู่แข่งซื้อตัว ท่านต้องเลือกรั้งตัวหรือปล่อยไปค่ะ',{hl:()=>q('#osModal .hrContent')}),
 Q('ทดสอบค่ะ','ผู้จัดการที่มี Management = 5 เพิ่มผลงานทีมเท่าไร? (18% + 5% × 5)',['25%','43%','60%'],1,{praise:'ถูกต้องค่ะ! 18% + 25% = 43%'})
]},
{n:'ค่าน้ำและค่าไฟ',s:[
 openApp('bills','การไฟฟ้าและประปา','ต่อไปคือค่าน้ำค่าไฟ เปิดแอป "ค่าน้ำค่าไฟ" บนหน้าจอคอมค่ะ'),
 I('ค่าน้ำและค่าไฟสะสมทุกวันตามจำนวนพนักงาน (น้ำ 35 + 14×คน ไฟ 90 + 28×คน ต่อวัน) ทุก 7 วันจะออกบิล ครบกำหนดชำระภายใน 2 วันค่ะ',{hl:()=>q('#osModal .osBody')}),
 I('ถ้าไม่ชำระ การไฟฟ้าจะตัดไฟ พนักงานทำงานไม่ได้จนกว่าจะจ่ายบิลหรือจัดการด้วยช่างฉุกเฉิน ปุ่มคอมพิวเตอร์จะมีเครื่องหมายเตือนเมื่อมีบิลค้างค่ะ',{hl:()=>q('#osModal .osBody')}),
 Q('ทดสอบค่ะ','บิลค่าน้ำค่าไฟครบกำหนดกี่วันหลังออกบิล?',['2 วัน','7 วัน','15 วัน'],0,{praise:'ถูกต้องค่ะ! ครบกำหนดภายใน 2 วัน'})
]},
{n:'คอมพิวเตอร์และแอปต่าง ๆ',s:[
 toDesktop('กลับไปหน้าจอหลักของคอมโดยกดปุ่ม ✕ บนหน้าต่างแอปค่ะ'),
 I('หน้าจอหลักของคอมมีแอป: ค่าน้ำค่าไฟ · Stocks · ฝ่ายบุคคล · Slots · ปฏิทิน · Fish Market · Contacts ค่ะ',{hl:()=>q('#osModal .osDesk')}),
 I('Stocks และ Slots เป็นมินิเกมเสี่ยงโชคที่ใช้เงินจริงของบริษัท ถ้าแพ้จะเสียเงินที่ลงทุน จึงควรระวังและไม่ควรลงทุนเกินตัวค่ะ\nFish Market ซื้อขายปลา (ราคาซื้อสูงกว่าราคารับซื้อ 25%) และ Contacts เก็บรายชื่อติดต่อและโทรศัพท์ค่ะ',{hl:()=>q('#osModal .osDesk')}),
 closeComputer()
]},
{n:'CEO และความสามารถ CEO',s:[
 M('ท่าน CEO มีโปรไฟล์ของตัวเองค่ะ กดปุ่ม ⭐ Lv ที่มุมซ้ายบนเพื่อเปิด CEO PROFILE',()=>on($('ceoProf')),{hl:()=>on($('ceoProf'))?null:$('rpChip'),hint:'กดปุ่ม ⭐ Lv ที่เรืองแสงด้านซ้ายบนค่ะ',praise:'ถูกต้องค่ะ! นี่คือโปรไฟล์ CEO'}),
 I('ที่นี่ดูเลเวล CEO และแต้มความสามารถ (SP) ค่ะ ท่านได้ SP เมื่อเลเวลสูงขึ้น มีแท็บ OVERVIEW · SKILL TREE · WORK HISTORY · ACHIEVEMENTS · MASTERY',{hl:()=>q('#rpTabs')}),
 M('ลองกดแท็บ "SKILL TREE" ดูค่ะ',()=>on($('ceoProf'))&&clicked('[data-rp-tab="sk"]'),{hl:()=>q('[data-rp-tab="sk"]'),hint:'กดแท็บ SKILL TREE ที่เรืองแสงค่ะ',praise:'ถูกต้องค่ะ! นี่คือต้นไม้ความสามารถของ CEO'}),
 I('Skill Tree มี 4 สาย: OPERATIONS (ลงมือเร็วขึ้น มินิเกมดีขึ้น) · MANAGEMENT (เพิ่มความเร็วและประสิทธิภาพทีม NPC) · FINANCE (รายได้สูงขึ้น ลดรายจ่าย) · MARKETING (ชื่อเสียงและลูกค้าใหม่) รวม 18 ความสามารถ อัปเกรดได้ 10 Rank ด้วย SP ค่ะ\nCEO ยังลงมือทำงานด้วยตัวเองที่สถานีทำงานในออฟฟิศได้ด้วยนะคะ',{hl:()=>$('rpView')}),
 M('กดปุ่ม ✕ เพื่อปิดโปรไฟล์ค่ะ',()=>!on($('ceoProf')),{hl:()=>q('[data-rp-close]'),hint:'กดปุ่ม ✕ ที่เรืองแสงมุมขวาบนของโปรไฟล์ค่ะ',praise:'เรียบร้อยค่ะ'})
]},
{n:'การเงิน รายรับ และรายจ่าย',s:[
 toCat(2,'fin','การเงิน','ไปดูเรื่องเงินกันค่ะ เปิดเมนูและเข้าหมวด "การเงิน"'),
 I('หน้านี้สรุป เงินสด · รายได้วันนี้ · ค่าอุปกรณ์/อบรมวันนี้ · เงินเดือนรวมต่อเดือน · ชื่อเสียง · งานสำเร็จ และประวัติ 7 วันล่าสุดค่ะ',{hl:()=>$('pn')}),
 I('รายรับหลักมาจากโปรเจกต์ที่ส่งสำเร็จ รายจ่ายคือเงินเดือน (จ่ายทุกวันที่ 16) ค่าเช่า ค่าอุปกรณ์ ค่าอบรม ค่าน้ำค่าไฟ ถ้าเงินต่ำกว่า −$10,000 บริษัทจะล้มละลายค่ะ',{hl:()=>$('pn')}),
 I('ข้อควรระวัง: ปุ่ม "เริ่มเกมใหม่" ในหน้านี้จะล้างข้อมูลทั้งหมด ในการฝึกนี้ดิฉันจะไม่ให้กดค่ะ',{hl:()=>$('pn')}),
 Q('ทดสอบค่ะ','เงินเดือนพนักงานจ่ายทุกวันที่เท่าไรของเดือน?',['วันที่ 1','วันที่ 16','วันที่ 30'],1,{praise:'ถูกต้องค่ะ! จ่ายเงินเดือนทุกวันที่ 16'})
]},
{n:'ระบบอัปเกรดทั้งหมด',s:[
 toCat(1,'build','ตกแต่งออฟฟิศ','มาสรุปเรื่องอัปเกรดกันค่ะ กลับไปที่หมวด "ตกแต่งออฟฟิศ"'),
 I('สิ่งที่อัปเกรดได้ในบริษัท:\n• ฝึกทักษะพนักงาน ($500 × ระดับทักษะ)\n• เลื่อนตำแหน่ง (หัวหน้าทีม ผู้เชี่ยวชาญ ผู้จัดการ)\n• ขยายสำนักงาน ($15,000 ต้องการ Lv2 ค่าเช่า +$120/วัน)\n• เฟอร์นิเจอร์ พื้น ผนัง\n• ความสามารถ CEO ด้วย SP',{hl:()=>$('pn')}),
 Q('ทดสอบค่ะ','การขยายสำนักงานต้องการเลเวลบริษัทอย่างน้อยเท่าไร?',['Lv2','Lv5','Lv10'],0,{praise:'ถูกต้องค่ะ! ต้องการ Lv2'}),
 closeMenuStep()
]},
{n:'ปฏิทินและเวลา',s:[
 M('ลองเปิดปฏิทินค่ะ กดปุ่มปฏิทินด้านขวาบน',()=>on($('calModal')),{hl:()=>on($('calModal'))?null:$('calBtn'),hint:'กดปุ่มปฏิทินที่เรืองแสงด้านขวาบนค่ะ',praise:'ถูกต้องค่ะ! นี่คือปฏิทินของบริษัท'}),
 I('ปฏิทินแสดงวันที่ ปีละ 12 เดือน เดือนละ 30 วัน มีวันเกิดของพนักงานและตัวละครต่าง ๆ ท่านโทรอวยพรเพื่อสร้างความสัมพันธ์ได้ ลูกค้าคนสำคัญมาเยือนทุก 7 วันตั้งแต่วันที่ 5 ค่ะ',{hl:()=>$('calModal')}),
 I('เวลาในเกม: 1 วันเกมเท่ากับ 15 นาทีจริงที่ความเร็ว x1 วันเริ่ม 08:00 ปรับความเร็ว (หยุด x1 x2) ได้ที่เมนู "ระบบ / บันทึก" และเกมจะหยุดเองขณะเปิดเมนูค่ะ',{hl:()=>$('calModal')}),
 M('กดปุ่มปิดปฏิทินค่ะ',()=>!on($('calModal')),{hl:()=>calClose(),hint:'กดปุ่มปิดปฏิทินที่เรืองแสงค่ะ',praise:'เรียบร้อยค่ะ'})
]},
{n:'ฤดูกาลและเหตุการณ์',s:[
 I('เกมมี 4 ฤดู ฤดูละ 30 วัน เรียงตามลำดับ: ใบไม้ผลิ → ร้อน → ใบไม้ร่วง → ฝน ฤดูกาลปัจจุบันดูได้จากแผงมุมขวาบน และเปลี่ยนบรรยากาศนอกหน้าต่างออฟฟิศ ถนน ชายหาด และคอนโดค่ะ',{hl:HUD}),
 I('ตั้งแต่วันที่ 11 จะมีเหตุการณ์สุ่ม เช่น ไฟดับ (เลือกซ่อม $3,500 / เครื่องปั่นไฟ $9,000 / รอ) พนักงานป่วยลาพัก และหัวหน้าถูกซื้อตัว เมื่อเกิดจะมีหน้าต่างให้ท่านเลือกค่ะ ท่านจะได้ตัดสินใจเองเสมอ'),
 Q('ทดสอบค่ะ','ฤดูแรกของเกมคือฤดูอะไร?',['ใบไม้ผลิ','ฤดูร้อน','ฤดูฝน'],0,{praise:'ถูกต้องค่ะ! เริ่มที่ใบไม้ผลิ'}),
 Q('อีกข้อค่ะ','เหตุการณ์สุ่มเริ่มเกิดตั้งแต่วันที่เท่าไร?',['วันที่ 3','วันที่ 11','วันที่ 30'],1,{praise:'ถูกต้องค่ะ! วันที่ 11 เป็นต้นไป'})
]},
{n:'ระบบ NPC และการทำงานของ NPC',s:[
 I('พนักงานในออฟฟิศคือ NPC ที่ทำงานเองค่ะ พวกเขานั่งโต๊ะทำงาน พัก กินข้าว เข้าห้องน้ำ ตามค่าหิว พลังงาน และความสุข ท่านสามารถแตะที่ตัวพนักงานบนแผนที่เพื่อดูสถานะได้',{hl:()=>$('cv')}),
 I('ลูกค้าอย่างคุณเมย์ คุณตี๋ คุณภาค คุณต้น คุณพราว คุณพิงค์ จะเดินมาที่ Reception เพื่อเสนองาน ส่วนลุงชัย ป้าเพ็ญ และ รปภ. เป็นทีมพิเศษที่ไม่ใช้โต๊ะและไม่คิดเงินเดือน ช่วยฟื้นพลังใจทีมและดูแลความปลอดภัยค่ะ',{hl:()=>$('cv')}),
 Q('ทดสอบค่ะ','ลูกค้าที่มาเสนองานจะเดินไปที่ไหนในบริษัท?',['ห้อง Manager','Reception','ห้องน้ำ'],1,{praise:'ถูกต้องค่ะ! ลูกค้าเดินมาที่ Reception'})
]},
{n:'ระบบรักษาความปลอดภัยและ CCTV',s:[
 toCat(1,'build','ตกแต่งออฟฟิศ','ระบบรักษาความปลอดภัยเริ่มจากหมวด "ตกแต่งออฟฟิศ" ค่ะ เปิดเมนูแล้วเข้าหมวดนี้'),
 I('กล้องวงจรปิด (CCTV) อยู่ในรายการเฟอร์นิเจอร์ ราคา $2,500 ส่วน รปภ. จ้างได้จากทีมตัวละครพิเศษในหน้าพนักงานค่ะ',{hl:()=>txt('#pn button','กล้องวงจรปิด')||$('pn')}),
 I('ตั้งแต่วันที่ 11 มีโอกาสโจรเข้าบริษัทเป็นช่วง ๆ ถ้าไม่มี รปภ. + กล้อง จะถูกขโมยของ แต่ถ้ามีครบทั้งคู่ โจรจะถูกจับได้ค่ะ',{hl:()=>$('pn')}),
 Q('ทดสอบค่ะ','ต้องมีอะไรบ้างจึงจะจับโจรได้?',['กล้องอย่างเดียว','รปภ. อย่างเดียว','รปภ. + กล้อง CCTV'],2,{praise:'ถูกต้องค่ะ! ต้องมีทั้งสองอย่างค่ะ'}),
 closeMenuStep()
]},
{n:'ระบบสถานที่และระบบพิเศษ',s:[
 I('นอกจากออฟฟิศ ท่านออกไปยังสถานที่อื่นได้ คือ ถนนคนเดิน ป้ายรถเมล์ สี่แยกใหญ่ ไร่ ชายหาด ท่าเรือ ทะเลกว้าง คอนโดของ CEO และศาสนสถาน (วัด โบสถ์ มัสยิด ตามวันสำคัญ) โดยกด "คุย / โต้ตอบ" (E) หรือปุ่ม "โต้ตอบ" ตรงทางออกค่ะ',{hl:()=>$('cv')}),
 I('ถนนคนเดิน: เดินเล่นพบผู้คน และรอรถเมล์ที่ป้ายได้ค่ะ เมื่อรถมาและขึ้นไปแล้วจะเลือกปลายทางได้ว่าจะไปบริษัทหรือคอนโด และในวันสำคัญทางศาสนาของท่านจะมีปุ่มไปศาสนสถานเพิ่มมาด้วย ทางซ้ายสุดของถนนไปไร่ลุงสมศักดิ์ ส่วนทางขวาสุดไปสี่แยกใหญ่ค่ะ',{hl:()=>$('cv')}),
 I('สี่แยกใหญ่: เป็นจุดเชื่อมทุกฉากค่ะ ซ้าย = ถนนหน้าบริษัท · ขวา = โชว์รูมรถ · บน = อควาเรียม · ล่าง = ทะเล ดูป้ายบอกทางบนพื้นได้เลย และมี "แผนที่ย่อ" บอกว่าท่านอยู่ตรงไหนของเมือง',{hl:()=>$('cv')}),
 I('ชายหาด: จากสี่แยกเดินลงบันไดมาที่ชายหาดค่ะ ตกปลาได้ที่ "วงกลมสีเหลือง" บนท่าเรือไม้ (ขายปลาที่ Fish Market ในคอมหรือขายให้ลุงปลา) โคมไฟและราวกั้นเดินทะลุไม่ได้ กลับสี่แยกโดยเดินขึ้นบันไดมุมซ้ายบน แก๊งเด็ก ๆ ใบบัว มินท์ ภูมิ อยู่เฉพาะบนถนนคนเดินเท่านั้น ส่วนที่ชายหาดจะมีผู้คนสุ่มมาเดินเล่นแค่ 2-3 คนค่ะ',{hl:()=>$('cv')}),
 I('ลุงปลา: พ่อค้าปลาที่ชายหาดมีชีวิตจริงค่ะ ตามเวลาในเกม เช้า = เตรียมแผง จัดปลา เช็ดแผง · กลางวัน = ยืนขาย ตรวจปลา ชั่งปลา · เย็น = เก็บปลา เก็บอุปกรณ์ เตรียมปิดร้าน เมื่อท่านเดินเข้าใกล้ ลุงจะหยุดงาน หันมาโบกมือทักทาย กด E เพื่อ ขายปลา ซื้อปลา หรือฟังเรื่องเล่าปลาหายากของลุงได้ค่ะ',{hl:()=>$('cv')}),
 I('เรือประมง: เดินไปปลายท่าเรือด้านขวาแล้วกด E เพื่อขึ้นเรือออกทะเลค่ะ ระหว่างล่องท่านเดินบนดาดฟ้าได้โดยไม่ตกเรือ กล้องจะตามเรือ เกาะอยู่ไกล ๆ และทะเลเคลื่อนไหวตลอด ถ้าอยากกลับฝั่งให้เดินไปคุยกับกัปตันที่หัวเรือแล้วเลือก "กลับฝั่ง" เรือจะเทียบท่าเดิมให้เองค่ะ',{hl:()=>$('cv')}),
 I('นาฬิกาประจำฉาก: ทุกฉากนอกออฟฟิศจะมีป้ายเวลาในเกม (เวลา · วันที่ · เช้า/กลางวัน/เย็น/กลางคืน) อยู่กลางจอด้านบนค่ะ ส่วนในออฟฟิศทุกชั้นมีโต๊ะ Manager ให้เปิดคอมได้ ประตูทางออกกด E ได้เมื่อเดินเข้าใกล้ และกล้องซูมใกล้ขึ้นให้เห็นตัวละครชัด',{hl:()=>$('cv')}),
 I('เกมนี้เล่นในแนวนอนเท่านั้นค่ะ ถ้าถือมือถือแนวตั้งจะมีหน้าจอให้หมุนเครื่อง หรือกดปุ่ม "เต็มจอ + ล็อกแนวนอน" ได้',{hl:()=>$('cv')}),
 I('คอนโด: ที่พักส่วนตัวของ CEO ค่ะ เดินไปใกล้ "เตียง" แล้วกด E เพื่อ นอนหลับ ข้ามไปเช้า 06:00 น. ของวันถัดไป ส่วนใกล้โต๊ะคอมกด E เพื่อเปิดคอมได้ และมีโซฟากับมุมกาแฟให้พักผ่อน ออกทางประตูด้านล่างเพื่อไปบริษัทค่ะ',{hl:()=>$('cv')}),
 I('ห้องคอนโดมี 3 เลเวลค่ะ: LV1 (ห้องเริ่มต้น) · LV2 ห้องหรู ปลดล็อคด้วยเงิน 45,000 · LV3 ห้องระดับ 10 ดาว วิวทะเลและระเบียงเดินออกไปได้ ปลดล็อค 150,000 เลือกห้องที่ใช้ได้ตอนขึ้นรถเมล์กลับคอนโด (กดที่ป้าย LV1 / LV2 / LV3 ในเมนูปลายทาง)',{hl:()=>$('cv')}),
 I('ค่าเช่าห้องเก็บแยกจากบิลน้ำไฟค่ะ ทุก 30 วัน (วันที่ 31, 61, 91 …): LV1 = 3,500 ต่อเดือน · LV2 = 9,000 ต่อเดือน · LV3 = ไม่มีค่าเช่าอีกถาวร ค่าเช่าจะหักจากเงินบริษัทอัตโนมัติ เตรียมเงินไว้ให้พอด้วยนะคะ',{hl:()=>$('cv')}),
 I('ระวัง "ผีไล่ล่า" ด้วยนะคะ! ผีมีหลายตน (ผีเดิม ผีสาวชุดกิโมโนที่ลอยทะลุผนังได้ และผีชายที่เดินไล่) สุ่มมาคืนละตนค่ะ ตั้งแต่ 21:00 น. ไฟในบริษัทจะกะพริบ และเวลา 22:00 น. ถ้าท่านยังอยู่ในบริษัท ผีจะปรากฏตัวและไล่ตามท่าน ผีมาได้ตั้งแต่คืนแรกของเกมเลยค่ะ',{hl:()=>$('cv')}),
 I('วิธีรับมือ: วิ่งหนีให้ไกล ผีเดินช้ากว่าท่านเสมอ ถ้าถูกจับท่านจะหมดสติและชื่อเสียงบริษัทลด 2 คะแนน ส่วนถ้าท่านออกจากบริษัทก่อน 22:00 น. คืนนั้นผีจะไม่มาค่ะ',{hl:()=>$('cv')}),
 I('นอกจากนี้ยังมีระบบเงินกู้และพันธมิตรพิเศษ ดูรายละเอียดในบทถัด ๆ ไปนะคะ',{hl:()=>$('cv')}),
 Q('ทดสอบค่ะ','ห้องคอนโดระดับไหนที่ไม่ต้องเสียค่าเช่า?',['LV1','LV2','LV3'],2,{praise:'ถูกต้องค่ะ! LV3 ไม่มีค่าเช่าถาวร ส่วน LV1 = 3,500 และ LV2 = 9,000 ต่อ 30 วัน'}),
 Q('ทดสอบค่ะ','ถ้าอยากนอนที่คอนโดต้องทำอย่างไร?',['เดินไปใกล้เตียงแล้วกด E','กดปุ่ม M','รอที่ป้ายรถเมล์'],0,{praise:'ถูกต้องค่ะ! นอนแล้วจะข้ามไปเช้า 06:00 น.'}),
 Q('ทดสอบค่ะ','จะขึ้นเรือประมงออกทะเลได้ที่ไหน?',['ปลายท่าเรือด้านขวาที่ชายหาด','หน้าบริษัท','ที่ป้ายรถเมล์'],0,{praise:'ถูกต้องค่ะ! และสั่งกลับฝั่งได้โดยคุยกับกัปตันที่หัวเรือ'}),
 Q('ทดสอบค่ะ','จากสี่แยกใหญ่ จะไปทะเลต้องไปทางไหน?',['ซ้าย','บน','ล่าง'],2,{praise:'ถูกต้องค่ะ! ล่าง = ทะเล · ซ้าย = ถนนหน้าบริษัท · ขวา = โชว์รูม · บน = อควาเรียม'}),
 Q('ทดสอบค่ะ','ผีไล่ล่าจะปรากฏตัวเวลาใด (ถ้าท่านอยู่ในบริษัท)?',['06:00 น.','22:00 น.','เที่ยงวัน'],1,{praise:'ถูกต้องค่ะ! และไฟจะกะพริบตั้งแต่ 21:00 น.'}),
 Q('ทดสอบค่ะ','ปุ่มคีย์บอร์ดใดใช้ "คุย / โต้ตอบ" กับคนหรือทางออก?',['B','E','M'],1,{praise:'ถูกต้องค่ะ! E คือโต้ตอบ B คือกระเป๋า M คือเมนู'})
]},
{n:'สมุดภารกิจและเนื้อเรื่อง',s:[
 I('นอกจากบริหารบริษัท เกมยังมีเนื้อเรื่องและภารกิจด้วยค่ะ หลังจบบทฝึกอบรมจะมีปุ่มสมุดภารกิจ 📖 ที่มุมขวาบน กดเพื่อเปิดดู ตัวเลขสีแดงบนปุ่มคือเรื่องใหม่ที่ยังไม่ได้อ่าน'),
 I('ในสมุดมีหลายแท็บค่ะ: ภารกิจ (ที่กำลังทำ) · เสร็จแล้ว · เบาะแส · เนื้อเรื่อง · ตัวละคร (ดูความสนิท ♥ ของแต่ละคน) · คัทซีน (ดูย้อนหลัง) ส่วนกล่องเล็กมุมซ้ายบนบอกขั้นตอนถัดไปของภารกิจที่กำลังทำ'),
 I('ภารกิจส่วนใหญ่ให้เดินไปคุยกับ NPC หรือไปสถานที่ตามช่วงเวลาที่กำหนด เมื่อเข้าใกล้จะมีข้อความให้กด E หรือปุ่ม "โต้ตอบ" ค่ะ ภารกิจที่สำเร็จให้ชื่อเสียงหรือเงิน และบางเรื่องมีคัตซีน ถ้าคุยกับใครบ่อย ๆ ความสนิทจะเพิ่มและปลดล็อกเรื่องราวใหม่'),
 I('บางภารกิจเป็น "ภารกิจลับ" ค่ะ จะไม่บอกวิธีปลดล็อก ลองสร้างความสนิทกับคนที่น่าสนใจ แล้วเปิดสมุดภารกิจดูเป็นระยะนะคะ'),
 Q('ทดสอบค่ะ','ปุ่มสมุดภารกิจจะโผล่ให้ใช้เมื่อไร?',['ทันทีที่เริ่มเกม ระหว่างฝึกอบรม','หลังจบบทฝึกอบรม','ต้องซื้อก่อน'],1,{praise:'ถูกต้องค่ะ! หลังจบบทฝึกอบรมปุ่มจะปรากฏที่มุมขวาบน'})
]},
{n:'ศาสนาและศาสนสถาน',s:[
 I('ตอนเริ่มเกมท่านเลือกศาสนาได้ (พุทธ คริสต์ อิสลาม หรือไม่มีศาสนา) ศาสนาที่เลือกจะกำหนดกิจกรรมพิเศษประจำสัปดาห์และเทศกาลค่ะ ดูวันสำคัญได้ที่ปฏิทิน'),
 I('วันสำคัญประจำสัปดาห์: คริสต์ = วันอาทิตย์ไปโบสถ์ · พุทธ = วันพระ (ขึ้น/แรม 8 และ 15 ค่ำ) ไปวัดทำบุญ · อิสลาม = วันศุกร์ละหมาดที่มัสยิด และยังมีเทศกาลใหญ่ เช่น อีสเตอร์ คริสต์มาส วิสาขบูชา รอมฎอน วันอีด ส่วนกิจกรรมอาสาชุมชนหน้าบริษัทร่วมได้ทุกคนค่ะ'),
 I('วิธีไป: เดินออกไปถนนคนเดิน รอรถเมล์ที่ป้าย ขึ้นรถแล้วในเมนูปลายทางจะมีปุ่ม "ไปที่วัด / โบสถ์ / มัสยิด" เพิ่มมา โดยแต่ละศาสนาจะเห็นเฉพาะสถานที่ของตัวเองเท่านั้นค่ะ และปุ่มนี้ขึ้นเฉพาะวันที่มีกิจกรรม'),
 I('ในศาสนสถานเดินสำรวจ คุยกับผู้คน และเข้าร่วมพิธีได้ค่ะ ตอนอยู่ด้านนอกกด E ที่ประตูเพื่อเข้าด้านใน เมื่อเสร็จให้กด "กลับบริษัท" รถเมล์จะพากลับ และเวลาในเกมจะเป็น 13:00 ของวันนั้นเสมอ ดังนั้นควรวางแผนงานก่อนไป'),
 I('ทุกฉาก (ถนน ชายหาด คอนโด ศาสนสถาน) มีปุ่ม "กระเป๋า" และ "โต้ตอบ" ที่หน้าจอ ใช้บนมือถือได้สะดวกค่ะ'),
 Q('ทดสอบค่ะ','ผู้เล่นศาสนาคริสต์ในวันอาทิตย์ จะเห็นปุ่มศาสนสถานใดในเมนูรถเมล์?',['โบสถ์เท่านั้น','วัด โบสถ์ และมัสยิดทั้งหมด','ไม่มีปุ่มใดเลย'],0,{praise:'ถูกต้องค่ะ! แต่ละศาสนาเห็นเฉพาะศาสนสถานของตัวเอง'}),
 Q('ทดสอบค่ะ','กลับจากศาสนสถานแล้วเวลาในเกมจะเป็นเท่าไร?',['เวลาเดิมที่ออกไป','13:00 ของวันนั้น','06:00 ของวันถัดไป'],1,{praise:'ถูกต้องค่ะ! กลับมาจะเป็น 13:00 เสมอ'})
]},
{n:'มือถือ CEO และตู้เสื้อผ้า',s:[
 I('มือถือซื้อได้ในหมวดเฟอร์นิเจอร์ของเมนูตกแต่งออฟฟิศ ราคา $3,500 ค่ะ ซื้อแล้วจะมีปุ่มมือถือ 📱 ให้กดในทุกฉาก ไม่ต้องกลับไปที่คอมพิวเตอร์'),
 I('มือถือมี 3 แอป: HR (ดูพนักงาน) · ค่าน้ำค่าไฟ (ดูบิลและจ่ายได้) · Contact (ติดต่อบุคคลพิเศษ เช่น ธนาคารหรือพันธมิตร) ส่วนฟังก์ชันอื่นยังใช้ที่คอมพิวเตอร์ในห้อง Manager หรือที่คอนโดค่ะ'),
 I('ตู้เสื้อผ้าอยู่ที่คอนโดค่ะ เดินไปใกล้ตู้แล้วกด E เพื่อเปิด เลือกชุดดูตัวอย่างหมุน 4 ทิศก่อนกดยืนยัน ชุดแต่ละชุดมีเงื่อนไขปลดล็อกของตัวเอง เช่น ชุดแจ็กเกตมังกรทองปลดล็อกหลังเข้าร่วมแก๊งยากูซ่า ชุดที่ยังล็อกจะแสดงเงื่อนไขไว้ให้ดู'),
 Q('ทดสอบค่ะ','ชุดแจ็กเกตมังกรทองปลดล็อกเมื่อไร?',['ตั้งแต่เริ่มเกม','หลังเข้าร่วมแก๊งยากูซ่า','เมื่อซื้อมือถือ'],1,{praise:'ถูกต้องค่ะ! ต้องเข้าร่วมแก๊งยากูซ่าก่อน'})
]},
{n:'เงินกู้ ยากูซ่า และเหตุการณ์กลางคืน',s:[
 I('เมื่อบริษัทอยู่มาสักพัก จะมีนายธนาคารและกลุ่มยากูซ่ามาเสนอเงินกู้ค่ะ ทุกข้อเสนอมีดอกเบี้ยและกำหนดชำระ อ่านเงื่อนไขให้ครบก่อนตอบรับ ถ้าผิดนัดจะถูกทวงหนี้ และกระทบชื่อเสียงหรือความปลอดภัยของบริษัท'),
 I('เมื่อสนิทกับริวจิและเก็นจิพอ อาจได้รับข้อเสนอเป็นพันธมิตร: จ่ายค่าธรรมเนียมครั้งเดียว $50,000 และค่าจ้างลูกน้อง $22,000 ต่อเดือน (หักวันที่ 28) ลูกน้องจะเฝ้าถนนหน้าบริษัท ช่วยกันโจรขโมย แต่ถ้าค้างจ่ายการคุ้มครองจะถูกระงับค่ะ'),
 I('คืนไหนไฟกะพริบแล้วผีมา ให้ออกจากบริษัทก่อน 22:00 หรือวิ่งหนีค่ะ ถ้าถูกจับจะหมดสติ ชื่อเสียงลด 2 คะแนน และรู้ไว้ว่าผีแต่ละตนมาไม่เหมือนกัน (ผีสาวลอยทะลุผนังได้) แต่ผีทุกตนเดินช้ากว่าท่านเสมอ'),
 I('ถ้าโจรเข้าขโมยของ จะมีปุ่มแจ้งความในคอมพิวเตอร์ (MY OS) ค่ะ ค่าดำเนินการ $1,500 ตำรวจจะมาถึงเช้าวันถัดไป และทรัพย์สินจะกลับมาภายใน 1–10 วัน (เร็วที่สุดเมื่อมี รปภ. + กล้อง CCTV ครบ) การลงทุนกับ รปภ. และกล้องช่วยป้องกันตั้งแต่ต้นด้วยค่ะ'),
 I('ถ้าเงินสดติดลบเกิน $10,000 บริษัทจะล้มละลายและเกมจบ ควรเก็บเงินสำรองและจ่ายบิลตรงเวลา ท่านเริ่มเกมใหม่ได้จากหน้าจอจบเกมเสมอค่ะ'),
 Q('ทดสอบค่ะ','ค่าธรรมเนียมเข้าร่วมพันธมิตรยากูซ่าคือเท่าไร?',['$5,000','$50,000','$500,000'],1,{praise:'ถูกต้องค่ะ! $50,000 ครั้งเดียว บวกค่าจ้างลูกน้องรายเดือน'}),
 Q('ทดสอบค่ะ','เงินสดติดลบต่ำกว่าเท่าไรบริษัทจะล้มละลาย?',['-$1,000','-$10,000','-$100,000'],1,{praise:'ถูกต้องค่ะ! ต่ำกว่า -$10,000 เกมจบ'})
]},
{n:'บันทึกเกมและตั้งค่าระบบ',s:[
 M('มาดูเมนูสุดท้ายค่ะ เปิดเมนูแล้วเข้าหมวด "ระบบ / บันทึก"',()=>menuOpen()&&!$('sysPane').hidden&&catClicked(5),{hl:()=>menuOpen()?catBtn(5):$('menuBtn'),hint:'กดปุ่มที่เรืองแสงเพื่อไปยังหมวด ระบบ / บันทึก ค่ะ',praise:'ถูกต้องค่ะ!'}),
 I('ที่นี่ปรับความเร็วเกม (หยุด/x1/x2) บันทึกเกม เปิดเต็มจอ เปิดกระเป๋า ดูคัตซีนเปิดเรื่อง และ "กลับหน้าเริ่มต้น" ได้ เกมบันทึกอัตโนมัติทุกวัน และท่านกดบันทึกเองได้เสมอค่ะ',{hl:()=>q('#sysPane .c')}),
 closeMenuStep()
]},
{n:'สำเร็จหลักสูตร',s:[
 I('ยินดีด้วยค่ะท่าน CEO! ท่านผ่านการฝึกอบรมครบทุกหลักสูตรแล้วค่ะ',{end:1}),
 I('ตอนนี้ท่านพร้อมที่จะบริหารบริษัทด้วยตัวเองแล้วค่ะ!',{end:1})
]}
];
const ST=[];CH.forEach((c,ci)=>c.s.forEach((s,si)=>{s.ci=ci;s.si=si;ST.push(s)}));

/* ---------- สถานะ ---------- */
let phase='boot',view=0,sdone=false,lastRect=null,quizPick=-1,msgT=0,msgTimer=0,t0=performance.now();
const cur=()=>ST[view]||null;
const tut=()=>{const s=GS();return s&&s.tut};
let helpMode=false,helpCi=-1;
const rev=()=>helpMode||view<(tut()?tut().idx:0);
const active=()=>phase==='run'||phase==='mode'||phase==='end'||phase==='hmenu';

function persist(){try{if(typeof save==='function')save(1)}catch(e){}}
function freeze(){const s=GS();if(!s)return;if(!s.tut)s.tut={};if(s.speed>0){s.tut.spd=s.speed;s.speed=0}else if(!s.tut.spd)s.tut.spd=1}
function unfreeze(){const s=GS();if(!s||!s.tut)return;if(s.speed===0)s.speed=s.tut.spd||1;delete s.tut.spd}

/* ---------- DOM ---------- */
let R,box,ring,arrow,shs=[],qz,lastEl=null,lastScr=0,forcePos=null;
function build(){
 if($('tutRoot'))return;
 R=document.createElement('div');R.id='tutRoot';R.hidden=true;
 R.innerHTML='<div class="tutSh"></div><div class="tutSh"></div><div class="tutSh"></div><div class="tutSh"></div><div id="tutRing" hidden></div><div id="tutArrow" hidden></div>'+
 '<div id="tutBox" class="bot"><div id="tutHead"><span id="tutCh"></span><div id="tutProg"><div id="tutProgF"></div></div><span id="tutPct"></span></div>'+
 '<div id="tutMain"><img id="tutPort" alt="เลขา" src="'+PORT+'"><div id="tutTxtWrap"><div id="tutName">'+NAME+'</div><div id="tutTxt"></div><div id="tutMsg"></div><div id="tutQz"></div></div></div>'+
 '<div id="tutBtns"><button id="tutIdxBtn" type="button">📚 บทเรียน</button><button id="tutPause" type="button">⏸ พักการฝึก</button><span class="sp"></span><button id="tutSkip" type="button" title="ข้ามการฝึกสอนทั้งหมด">⏭ ข้าม</button><button id="tutBack" type="button">◀ ย้อนกลับ</button><button id="tutNext" type="button">ถัดไป ▶</button></div></div>'+
 '<div id="tutIdx" hidden><div id="tutIdxP"></div></div><div id="tutFull" hidden></div>';
 document.body.appendChild(R);
 box=$('tutBox');ring=$('tutRing');arrow=$('tutArrow');shs=[...R.querySelectorAll('.tutSh')];qz=$('tutQz');
 shs.forEach(s=>s.addEventListener('pointerdown',()=>shieldHit()));
 $('tutNext').onclick=next;$('tutBack').onclick=back;$('tutSkip').onclick=skipTut;
 $('tutIdxBtn').onclick=showIndex;$('tutPause').onclick=()=>helpMode?endHelp():pauseCourse();
}
function msg(kind,t,ms){const m=$('tutMsg');m.className=kind;m.textContent=t;clearTimeout(msgTimer);if(ms)msgTimer=setTimeout(()=>{m.className='';m.textContent=''},ms)}
function shieldHit(){const st=cur();if(!st)return;if(!rev()&&!sdone&&(st.ok||st.quiz))msg('hint',st.hint||'กดที่ปุ่มที่เรืองแสงเท่านั้นนะคะ ดิฉันจะคอยช่วยค่ะ',3500);else msg('hint','กดปุ่ม "ถัดไป" เพื่อไปต่อนะคะ',2500)}

/* ---------- วาดบทเรียน ---------- */
function enterStep(i){
 view=i;lastEl=null;forcePos=null;sdone=false;quizPick=-1;clicks=[];catLog=[];lastRect=null;
 const st=cur();if(!st)return;
 if(st.enter)st.enter(st);
 $('tutTxt').textContent=st.t;$('tutMsg').className='';$('tutMsg').textContent='';
 renderQuiz();
 const ch=CH[st.ci];
 $('tutCh').textContent='บทที่ '+(st.ci+1)+'/'+CH.length;
 $('tutPct').textContent=Math.round(i/ST.length*100)+'%';
 $('tutProgF').style.width=(i/ST.length*100)+'%';
 $('tutName').textContent=NAME+' · '+ch.n;
 if(rev()){sdone=true;if(st.quiz)quizPick=st.quiz.a;renderQuiz()}
 if(helpMode){const f=ST.findIndex(x=>x.ci===st.ci),n=ST.filter(x=>x.ci===st.ci).length;$('tutCh').textContent='ทบทวนบทที่ '+(st.ci+1);$('tutPct').textContent=(i-f+1)+'/'+n;$('tutProgF').style.width=((i-f+1)/n*100)+'%'}
 updateBtns();
}
function renderQuiz(){
 const st=cur();qz.innerHTML='';if(!st||!st.quiz)return;
 const rv=rev();
 const h=document.createElement('div');h.style.cssText='font-weight:700;margin-top:2px';h.textContent=st.quiz.q;qz.appendChild(h);
 st.quiz.o.forEach((o,i)=>{const b=document.createElement('button');b.type='button';b.textContent=String.fromCharCode(65+i)+'. '+o;
  if(sdone&&i===st.quiz.a)b.className='good';else if(quizPick===i&&i!==st.quiz.a)b.className='bad';
  b.onclick=()=>{if(sdone||rv)return;quizPick=i;if(i===st.quiz.a){sdone=true;msg('ok',st.praise||'ถูกต้องค่ะ!');renderQuiz();updateBtns()}else{msg('hint','ยังไม่ถูกต้องค่ะ ลองคิดอีกครั้งนะคะ',3000);renderQuiz()}};
  qz.appendChild(b)});
}
function updateBtns(){
 const st=cur(),t=tut();if(!st||!t)return;
 const needs=!!(st.ok||st.quiz);
 $('tutNext').disabled=(!rev()&&needs&&!sdone);
 const first=helpMode?ST.findIndex(x=>x.ci===st.ci):0;
 $('tutBack').disabled=view<=first;
 const lastH=helpMode&&(view===ST.length-1||ST[view+1].ci!==st.ci);
 $('tutNext').textContent=lastH?'จบการทบทวน ✔':(view===ST.length-1)?'เสร็จสิ้นหลักสูตร ▶':'ถัดไป ▶';
 $('tutPause').textContent=helpMode?'✕ ออก':'⏸ พักการฝึก';
 $('tutIdxBtn').style.display=helpMode?'none':'';
}
function next(){
 const t=tut();if(!t)return;
 if(helpMode){const st=cur();if(view===ST.length-1||ST[view+1].ci!==st.ci){endHelp();return}enterStep(view+1);return}
 if(view<t.idx){enterStep(view+1);return}
 if(!sdone&&(cur().ok||cur().quiz))return;
 const ci=cur().ci;
 t.idx=view+1;
 t.done=CH.map((c,i)=>i).filter(i=>ST.findIndex(s=>s.ci===i&&ST.indexOf(s)>=t.idx)<0);
 persist();
 if(t.idx>=ST.length){showEnd();return}
 enterStep(t.idx);
}
function back(){if(helpMode){if(view>0&&ST[view-1].ci===cur().ci)enterStep(view-1);return}if(view>0)enterStep(view-1)}
function showIndex(){
 const t=tut(),p=$('tutIdxP');
 p.innerHTML='<b style="color:#ffd45a;font-size:16px">📚 สารบัญหลักสูตร (ทบทวนบทที่ผ่านแล้ว)</b>';
 CH.forEach((c,i)=>{const first=ST.findIndex(s=>s.ci===i);const b=document.createElement('button');const ok=first<=t.idx;const done=i<ST[Math.min(t.idx,ST.length-1)].ci||t.idx>=ST.length;
  b.textContent=(done?'✅ ':ok?'▶ ':'🔒 ')+(i+1)+'. '+c.n;b.disabled=!ok;if(ST[view]&&ST[view].ci===i)b.className='cur';
  b.onclick=()=>{$('tutIdx').hidden=true;enterStep(first)};p.appendChild(b)});
 const c=document.createElement('button');c.textContent='✕ ปิด';c.onclick=()=>{$('tutIdx').hidden=true};p.appendChild(c);
 $('tutIdx').hidden=false;
}
function pauseCourse(){
 persist();
 try{UI.returnTitle()}catch(e){}
}

/* ---------- เลย์เอาต์ไฮไลต์/โล่/ลูกศร (วนทุก 100ms) ---------- */
function rectOf(x){if(!x)return null;const r=x.getBoundingClientRect?x.getBoundingClientRect():x;if(!r||(r.width<1&&r.height<1))return null;return{left:r.left,top:r.top,width:r.width,height:r.height,right:r.left+r.width,bottom:r.top+r.height}}
function layout(){
 const st=cur(),t=tut();if(!st||!t||phase!=='run')return;
 const pending=!rev()&&!sdone&&!!(st.ok||st.quiz)&&!st.quiz;
 let el=null;try{el=st.hl?st.hl():null}catch(e){}
 let r=rectOf(el);
 if(el&&el.scrollIntoView&&r&&performance.now()-lastScr>350){
  const off=(r.left<-1||r.right>innerWidth+1||r.top<-1||r.bottom>innerHeight+1);
  let blocked=false;
  if(!off){const hx=Math.min(innerWidth-1,Math.max(0,r.left+r.width/2)),hy=Math.min(innerHeight-1,Math.max(0,r.top+r.height/2));const tp=document.elementFromPoint(hx,hy);
   if(tp&&tp!==el&&!el.contains(tp)&&!(R&&R.contains(tp))&&!tp.contains(el))blocked=true;
   if(tp&&box&&box.contains(tp)&&st.pos!==forcePos)forcePos=(box.className==='top')?'bot':'top'}
  if(off||blocked){lastScr=performance.now();try{el.scrollIntoView({block:off?'nearest':'center',inline:off?'nearest':'center'})}catch(e){}r=rectOf(el)}
 }
 lastEl=el;
 if(!r&&sdone&&lastRect)r=lastRect;
 if(r)lastRect=r;
 const vw=innerWidth,vh=innerHeight;
 const pad=5;
 if(st.move&&!rev()){shs.forEach(s=>s.hidden=true)}
 else if(r){
  const L=Math.max(0,r.left-pad),Tp=Math.max(0,r.top-pad),Rr=Math.min(vw,r.right+pad),B=Math.min(vh,r.bottom+pad);
  const set=(e,l,tp,w,h)=>{e.hidden=w<=0||h<=0;e.style.left=l+'px';e.style.top=tp+'px';e.style.width=Math.max(0,w)+'px';e.style.height=Math.max(0,h)+'px'};
  set(shs[0],0,0,vw,Tp);set(shs[1],0,B,vw,vh-B);set(shs[2],0,Tp,L,B-Tp);set(shs[3],Rr,Tp,vw-Rr,B-Tp);
 }else if(pending&&!st.quiz){shs.forEach(s=>s.hidden=true)}
 else{set0(shs[0],vw,vh);shs.slice(1).forEach(s=>s.hidden=true)}
 function set0(e,w,h){e.hidden=false;e.style.left='0px';e.style.top='0px';e.style.width=w+'px';e.style.height=h+'px'}
 if(r){ring.hidden=false;ring.style.left=(r.left-pad)+'px';ring.style.top=(r.top-pad)+'px';ring.style.width=(r.width+pad*2)+'px';ring.style.height=(r.height+pad*2)+'px';
  const above=(r.top+r.height/2)>vh/2;arrow.hidden=false;arrow.textContent=above?'👇':'👆';
  arrow.style.left=Math.max(4,Math.min(vw-40,r.left+r.width/2-17))+'px';
  arrow.style.top=above?Math.max(2,r.top-pad-44)+'px':Math.min(vh-40,r.bottom+pad+4)+'px'}
 else{ring.hidden=true;arrow.hidden=true}
 /* ตำแหน่งกล่องบทสนทนา: อยู่ฝั่งตรงข้ามกับเป้าหมาย */
 let pos=forcePos||st.pos||(r&&(r.top+r.height/2)>vh*0.5?'top':'bot');
 if(r&&!st.pos){const bh=box.offsetHeight||160;const overlapBot=r.bottom>vh-bh-12,overlapTop=r.top<bh+12;if(pos==='bot'&&overlapBot&&!overlapTop)pos='top'}
 const mini=!!st.move&&!rev()&&!sdone;
 box.className=(mini?'top':pos)+(mini?' mini':'');
 /* ตรวจภารกิจ */
 if(!rev()&&!sdone&&st.ok){let ok=false;try{ok=!!st.ok()}catch(e){}
  if(ok){sdone=true;msg('ok',st.praise||'ถูกต้องค่ะ!');updateBtns()}}
}
/* กันการคลิกนอกเป้าหมายระหว่างขั้นตอนอธิบาย / หลังทำสำเร็จ / ทบทวน */
function guard(e){
 if(!active()||phase!=='run'||!R||R.hidden)return;
 const st=cur(),t=tut();if(!st||!t)return;
 if(e.target instanceof Node&&R.contains(e.target))return;
 const pending=!rev()&&!sdone&&!!st.ok;
 if(pending)return;                       // ภารกิจ: โล่ครอบพื้นที่นอกเป้าหมายอยู่แล้ว
 if(st.move&&!rev())return;
 e.stopPropagation();if(e.cancelable)e.preventDefault();
}
['click','dblclick','mousedown','pointerdown','touchstart','contextmenu'].forEach(n=>addEventListener(n,guard,true));
/* บล็อกคีย์บอร์ดที่อาจเปลี่ยนข้อมูล */
addEventListener('keydown',e=>{
 if(phase==='boot'||phase==='off'||!R||R.hidden)return;
 if(e.target instanceof Node&&R.contains(e.target))return;
 const tg=e.target;if(tg&&/^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName))return;
 const k=(e.key||'').toLowerCase(),st=cur();
 const mv=['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'];
 const act=['e','enter',' ','spacebar'];
 const allowMove=phase==='run'&&st&&st.move&&!rev();
 if(phase==='hmenu'&&k==='escape'){e.preventDefault();e.stopImmediatePropagation();closeHelpMenu();return}
 if((mv.indexOf(k)>=0&&!allowMove)||(act.indexOf(k)>=0)||phase!=='run'&&['m','p','b','escape'].indexOf(k)>=0){
  if(st&&st.keysOk&&st.keysOk.indexOf(k)>=0)return;
  e.preventDefault();e.stopImmediatePropagation()}
},true);

/* ---------- เลือกโหมด / จบหลักสูตร ---------- */
function showMode(){
 phase='mode';freeze();const s=GS();s.tut=Object.assign(s.tut||{},{mode:''});persist();
 R.hidden=false;box.style.display='none';shs.forEach(x=>x.hidden=true);ring.hidden=true;arrow.hidden=true;
 const f=$('tutFull');f.hidden=false;
 f.innerHTML='<div class="tutCard"><img alt="เลขา" src="'+PORT+'"><h2>CEO TRAINING</h2><p>สวัสดีค่ะท่าน CEO! ดิฉันเป็นเลขาส่วนตัวของท่าน<br>ก่อนเริ่ม กรุณาตั้งชื่อตัวละครของท่านก่อนนะคะ (เว้นว่างไว้ = ใช้ชื่อ CEO)</p>'+
  '<input id="tutCeoName" class="tutNameIn" type="text" maxlength="20" autocomplete="off" placeholder="กรุณาตั้งชื่อตัวละคร" value="'+(GS().ceo&&GS().ceo!=='CEO'?String(GS().ceo).replace(/[&<>"]/g,''):'')+'">'+
  '<p>จากนั้นเลือกว่าต้องการให้ดิฉันสอนวิธีบริหารบริษัทก่อนเริ่มเล่นไหมคะ?</p>'+
 '<button class="tutBtn gold" id="tutModeB" type="button">🎓 BEGINNER · สอนการเล่น<small>เรียนครบทุกบท ลงมือทำจริง บันทึกความคืบหน้าได้</small></button>'+
 '<button class="tutBtn" id="tutModeE" type="button">💼 EXPERIENCED · เล่นเป็นแล้ว<small>ข้ามการฝึกทั้งหมดและเข้าเกมทันที</small></button></div>';
 $('tutModeB').onclick=()=>chooseMode('begin');$('tutModeE').onclick=()=>chooseMode('exp');
}
function chooseMode(m){
  {const ni=$('tutCeoName');const v=ni?ni.value.replace(/[<>&"]/g,'').trim().slice(0,20):'';GS().ceo=v||'CEO'}
 const s=GS();const spd=(s.tut&&s.tut.spd)||1;
 if(m==='exp'){s.tut={mode:'exp',idx:0,done:[],fin:1,spd:spd};unfreeze();s.tut.fin=1;persist();closeAll();phase='off';return}
 s.tut={mode:'begin',idx:0,done:[],fin:0,spd:spd,snap:{money:s.money,day:s.day,t:Math.round(s.t*100)/100,emp:s.emp.length}};
 persist();$('tutFull').hidden=true;startRun();
}
function startRun(){
 phase='run';freeze();R.hidden=false;box.style.display='';$('tutFull').hidden=true;
 const t=tut();let i=Math.min(t.idx||0,ST.length-1);enterStep(i);
 if(t.idx>=ST.length)showEnd();
}
function showEnd(){
 phase='end';box.style.display='none';shs.forEach(x=>x.hidden=true);ring.hidden=true;arrow.hidden=true;
 const f=$('tutFull');f.hidden=false;
 f.innerHTML='<div class="tutCard"><img alt="เลขา" src="'+PORT+'"><h2>CEO TRAINING COMPLETED</h2><h3>ALL COURSES COMPLETED</h3><p>ยินดีด้วยค่ะท่าน CEO! ท่านผ่านการฝึกอบรมครบทุกหลักสูตรแล้วค่ะ<br>ตอนนี้ท่านพร้อมที่จะบริหารบริษัทด้วยตัวเองแล้วค่ะ!</p><button class="tutBtn gold" id="tutStart" type="button">START MANAGING COMPANY</button><button class="tutBtn" id="tutRev" type="button">◀ ทบทวนบทเรียน</button></div>';
 $('tutStart').onclick=finish;$('tutRev').onclick=()=>{const t=tut();t.idx=ST.length-1;f.hidden=true;phase='run';box.style.display='';enterStep(ST.length-1)};
}
function finish(){
 const t=tut();if(!t)return;
 t.fin=1;t.idx=ST.length;t.done=CH.map((c,i)=>i);
 unfreeze();persist();closeAll();phase='off';
}
function closeAll(){if(R)R.hidden=true;const f=$('tutFull');if(f)f.hidden=true}
function skipTut(){
 if(!(phase==='run'||phase==='hmenu'))return;
 const wasHelp=helpMode;
 if(wasHelp)endHelp();else finish();
 let m=$('tutSkipMsg');if(m)m.remove();
 m=document.createElement('div');m.id='tutSkipMsg';
 m.style.cssText='position:fixed;inset:0;z-index:100000;background:rgba(4,8,18,.7);display:flex;align-items:center;justify-content:center;padding:10px';
 m.innerHTML='<div style="width:min(460px,100%);background:linear-gradient(180deg,#172036,#0d1424);border:2px solid #ffd45a;border-radius:14px;padding:14px;color:#e8eefc;display:flex;gap:12px;align-items:center"><img alt="" src="'+PORT+'" style="width:84px;height:112px;object-fit:cover;object-position:top;border-radius:10px;border:2px solid #ffd45a;flex:none"><div style="font-size:15px;line-height:1.6"><b style="color:#ffd45a">เลขาอลิสา</b><br>รับทราบค่ะท่าน CEO ข้ามการฝึกสอนแล้ว<br>หากอยากรู้อะไรนอกเหนือจากนี้ เดินมาถามฉันได้นะคะ 💼<br><button type="button" id="tutSkipOk" style="margin-top:8px;min-height:40px;padding:6px 18px;border-radius:10px;border:1px solid #ffe9a0;background:linear-gradient(180deg,#ffd45a,#e0a82e);color:#1a1a22;font:inherit;font-weight:800;cursor:pointer">ตกลง</button></div></div>';
 document.body.appendChild(m);$('tutSkipOk').onclick=()=>m.remove();
}

/* ---------- วงจรหลัก ---------- */
function ready(){
 if(window.REL&&REL.blocking&&REL.blocking())return false;
 const s=GS();if(!s)return false;
 const lb=$('lobby');if(lb&&lb.style.display!=='none'&&getComputedStyle(lb).display!=='none')return false;
 return true;
}
function busy(){try{if(CUT.on)return true}catch(e){}return !!($('teeCut')||$('evModal'))}
function loop(){
 const s=GS();if(!s)return;
 build();
 const lobbyUp=!ready()||(phase!=='boot'&&on($('rotateMsg')));
 if(R&&active())R.hidden=lobbyUp;
 if(lobbyUp)return;
 if(phase==='boot'){
  if(performance.now()-t0<2600||busy())return;
  const t=s.tut;
  if(t&&t.fin){phase='off';if(s.speed===0&&t.spd){s.speed=t.spd;delete t.spd}return}
  if(t&&t.mode==='exp'){phase='off';return}
  if(t&&t.mode==='begin'){startRun();return}
  showMode();return;
 }
 if(phase==='run'||phase==='mode'||phase==='end'||phase==='hmenu'){
  if(s.speed>0){if(!s.tut)s.tut={};s.tut.spd=s.speed;s.speed=0}   // หยุดเวลาตลอดการฝึก
  if(phase==='run')layout();
 }
}
setInterval(loop,100);
addEventListener('pagehide',()=>{if(active())persist()});
/* ====== ห้องเลขา (Secretary Room): คุณอลิสาประจำมุมซ้ายสุดของทางเดิน กดคุยเพื่อให้ทบทวนบทเรียนได้ทุกเมื่อ ====== */
const SRX=1,SRY=8,SRW=3,SRH=2,SR_SOL=[];let AX=48,AY=9*32+16;
const AL=[new Image(),new Image()];AL[0].src='assets/img/54f53152ef92.png';AL[1].src='assets/img/c9b11e411284.png';
/* เลขาอลิสาทำงานตามเวลาบริษัท: มาถึง ~07:40 นั่งประจำโต๊ะ เลิก 17:30 เดินออกจากบริษัทเหมือนพนักงาน · เสาร์-อาทิตย์ไม่มา */
let SR_PATH=[[AX,AY],[144,AY],[144,400],[112,464],[112,520]],SR_KEY='';
const SR_IN=7*60+40,SR_OUT=17*60+30,SR_DUR=12; // นาทีในเกมที่ใช้เดิน
function srSync(){
 try{
  if(!(typeof OX!=='undefined'&&OX.ready()&&window.OFC))return;
  const p=OX.sec(),k=OFC.floor()+':'+p[0]+','+p[1];if(k===SR_KEY)return;SR_KEY=k;
  AX=p[0];AY=p[1];const l=OFC.L(),ex=l.exitPath[l.exitPath.length-1],pa=bfs(AX/32|0,AY/32|0,(x,y)=>x===ex[0]&&y===ex[1])||[];
  SR_PATH=[[AX,AY]].concat(pa.map(q=>[q[0]*32+16,q[1]*32+16]));
  if(SR_PATH.length<2)SR_PATH.push([AX+1,AY+1]);
 }catch(e){}
}
function srPos(){
 srSync();
 const s=GS();if(!s||!Number.isFinite(s.t))return{vis:1,sit:1,x:AX,y:AY,mv:0};
 const wk=((s.day||1)-1)%7<5,t=s.t;
 if(!wk)return{vis:0};
 let k=null,rev=false;
 if(t>=SR_IN&&t<SR_IN+SR_DUR){k=1-(t-SR_IN)/SR_DUR;rev=true}
 else if(t>=SR_IN+SR_DUR&&t<SR_OUT)return{vis:1,sit:1,x:AX,y:AY,mv:0};
 else if(t>=SR_OUT&&t<SR_OUT+SR_DUR)k=(t-SR_OUT)/SR_DUR;
 else return{vis:0};
 // k=0 โต๊ะ → k=1 ประตูออก
 let L=0;const seg=[];for(let i=0;i<SR_PATH.length-1;i++){const a=SR_PATH[i],b=SR_PATH[i+1],l=Math.hypot(b[0]-a[0],b[1]-a[1]);seg.push([a,b,l,L]);L+=l}
 const d=Math.max(0,Math.min(1,k))*L;
 for(const g of seg){if(d<=g[3]+g[2]||g===seg[seg.length-1]){const u=(d-g[3])/g[2];return{vis:1,sit:0,mv:1,x:g[0][0]+(g[1][0]-g[0][0])*u,y:g[0][1]+(g[1][1]-g[0][1])*u,a:k>.9?Math.max(0,(1-k)/.1):1,rev}}}
 return{vis:0}
}
function srNear(){const s=GS(),p=srPos();return !!(s&&s.pl&&p.vis&&p.sit&&Math.hypot(s.pl.x-AX,s.pl.y-AY)<=58)}
function srInstall(){
 if(window.__srInst)return true;
 if(typeof RM==='undefined'||typeof RUG==='undefined'||typeof occ==='undefined'||!window.LOAN||typeof A==='undefined'||typeof reindex!=='function')return false;
 window.__srInst=1;
 RM.unshift([SRX,SRY,SRX+SRW-1,SRY+SRH-1,'#d3bccb']);
 RUG.push([SRX,SRY,SRW,SRH,'#7a4a5a','#ead0da']);
 const ro=reindex;window.reindex=function(){const r=ro.apply(this,arguments);srMark();return r};
 const po=LOAN.pushDraw;LOAN.pushDraw=function(L,g,t){po.apply(LOAN,arguments);try{srDraw(L,g,t)}catch(e){}};
 const to=A.talk;A.talk=function(){if(srNear()&&!active()&&phase==='off'){srTalk();return}return to.apply(this,arguments)};
 const cvp=e=>{try{const cv=$('cv'),r=cv.getBoundingClientRect(),x=((e.clientX-r.left)/r.width*cv.width/32)|0,y=((e.clientY-r.top)/r.height*cv.height/32)|0;if(SR_SOL.some(p=>p[0]===x&&p[1]===y)){e.stopImmediatePropagation();e.preventDefault()}}catch(_){}};
 $('cv').addEventListener('pointerdown',cvp,true);
 return true;
}
function srClear(){
 const s=GS();if(!s||!s.f)return;
 // ย้ายของออกจากห้องเลขาไปไว้ริมผนังทางเดิน ไม่บังหน้าประตู/จุดเกิด
 const PARK=[[1,4],[1,3],[1,5],[9,4],[9,3]]; // มุมห้องทำงาน ไม่อยู่บนเส้นทางเดิน/หน้าประตู
 const park=f=>{for(const p of PARK){if(!occ[p[1]*W+p[0]]&&!s.f.some(q=>q!==f&&q.x===p[0]&&q.y===p[1])){f.x=p[0];f.y=p[1];return true}}return false};
 s.f.forEach(f=>{
  if(SR_SOL.some(p=>p[0]===f.x&&p[1]===f.y))park(f);
  else if(f.t==='plant'&&f.y===8&&(f.x===5||f.x===12)&&!SR_SOL.some(p=>p[0]===f.x&&p[1]===f.y))park(f); // เซฟเก่าที่ถูกย้ายมาบังหน้าประตู
 });
 try{reindex()}catch(e){}
}
function srMark(){SR_SOL.forEach(p=>{const i=p[1]*W+p[0];if(!occ[i])occ[i]={t:'srm',x:p[0],y:p[1],id:-99,r:0,sr:1}})}
function srDraw(L,g,t){
 const px=n=>n*32;
 if(0)L.push([7*32+30,()=>{ // ป้ายชื่อห้องบนผนัง
  g.fillStyle='#2b2f3a';g.fillRect(px(1)+2,7*32+8,3*32-4,17);g.fillStyle='#8a5a74';g.fillRect(px(1)+4,7*32+10,3*32-8,13);
  g.fillStyle='#ffe9f2';g.font='bold 10px sans-serif';g.textAlign='center';g.fillText('SECRETARY',px(1)+48,7*32+21);g.textAlign='start'}]);
 if(0)L.push([8*32+30,()=>{ // โต๊ะเลขา
  const x=px(1),y=8*32;g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x+1,y+27,30,4);
  g.fillStyle='#39291f';g.fillRect(x+1,y+10,30,19);g.fillStyle='#b07a58';g.fillRect(x+3,y+11,26,14);g.fillStyle='#d19c76';g.fillRect(x+4,y+11,24,3);
  g.fillStyle='#242b38';g.fillRect(x+7,y+3,16,11);g.fillStyle='#8fb4d8';g.fillRect(x+9,y+5,12,7);g.fillStyle='#3b4252';g.fillRect(x+10,y+15,10,3);
  g.fillStyle='#fff';g.fillRect(x+22,y+17,5,3);g.fillStyle='#e0657a';g.fillRect(x+4,y+16,3,5)}]);
 if(0)L.push([8*32+30,()=>{ // ต้นไม้
  const x=px(3),y=8*32;g.fillStyle='#6b3d2e';g.fillRect(x+9,y+20,14,10);g.fillStyle='#8a5a44';g.fillRect(x+10,y+20,12,3);
  g.fillStyle='#2f8f4a';g.fillRect(x+10,y+6,12,16);g.fillStyle='#3fb862';g.fillRect(x+6,y+10,8,10);g.fillRect(x+18,y+9,8,11);g.fillStyle='#5fd47f';g.fillRect(x+13,y+3,6,8)}]);
 const sp0=srPos();L.push([(sp0.vis?sp0.y:AY)+10,()=>{ // คุณอลิสา
  const sp=sp0;if(!sp.vis)return;const X=sp.x,Y=sp.y;
  const im=(Math.floor(t*(sp.mv?4:1.2))%2)?AL[1]:AL[0];if(!im.complete||!im.naturalWidth)return;
  const bob=Math.round(Math.sin(t*(sp.mv?9:1.8))*(sp.mv?2:1));
  g.save();if(sp.mv)g.globalAlpha=sp.a;
  g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(X,Y+12,12,4,0,0,6.283);g.fill();
  g.drawImage(im,X-13,Y+12-54+bob,26,54);g.restore();if(!sp.sit)return;
  const s=GS();if(srNear()&&!active()&&phase==='off'&&s){g.fillStyle='rgba(20,24,40,.92)';g.fillRect(AX-34,AY-80,68,16);g.strokeStyle='#ffd45a';g.strokeRect(AX-34,AY-80,68,16);
   g.fillStyle='#ffd45a';g.font='bold 10px sans-serif';g.textAlign='center';g.fillText('💬 ถามเลขา',AX,AY-68);g.textAlign='start'}}]);
}
function srTalk(){
 const s=GS();if(!s||!s.tut||phase!=='off'||!ready())return;
 phase='hmenu';freeze();R.hidden=false;box.style.display='none';shs.forEach(x=>x.hidden=true);ring.hidden=true;arrow.hidden=true;
 const f=$('tutFull');f.hidden=false;
 const lines=['สวัสดีค่ะท่าน CEO! มีอะไรให้ดิฉันช่วยไหมคะ? เลือกหัวข้อที่อยากให้อธิบายซ้ำได้เลยค่ะ','ท่าน CEO สงสัยเรื่องไหน ถามดิฉันได้เสมอค่ะ เลือกหัวข้อด้านล่างได้เลย','ยินดีให้คำแนะนำค่ะ ท่านอยากทบทวนระบบไหนคะ'];
 f.innerHTML='<div class="tutCard"><img alt="เลขา" src="'+PORT+'" style="width:64px;height:113px"><h2 style="font-size:clamp(18px,4.5vw,24px)">เลขาอลิสา</h2><p>'+lines[(s.day||0)%lines.length]+'</p><div class="tutList" id="tutHelpList"></div><button class="tutBtn" id="tutHelpX" type="button">ไม่มีค่ะ ขอบคุณ</button></div>';
 const L=$('tutHelpList');
 CH.forEach((c,i)=>{if(i===CH.length-1)return;const b=document.createElement('button');b.type='button';b.className='tutBtn';b.textContent=(i+1)+'. '+c.n;b.onclick=()=>startHelp(i);L.appendChild(b)});
 $('tutHelpX').onclick=closeHelpMenu;
}
function closeHelpMenu(){if(phase!=='hmenu')return;$('tutFull').hidden=true;R.hidden=true;phase='off';unfreeze()}
function startHelp(ci){
 $('tutFull').hidden=true;helpMode=true;helpCi=ci;phase='run';freeze();R.hidden=false;box.style.display='';
 enterStep(ST.findIndex(x=>x.ci===ci));
}
function endHelp(){helpMode=false;helpCi=-1;phase='off';closeAll();unfreeze();clicks=[]}

setInterval(()=>{try{if(!GS())return;if(srInstall()&&typeof occ!=='undefined'&&GS().f&&SR_SOL.some(p=>!(occ[p[1]*W+p[0]]&&occ[p[1]*W+p[0]].sr))){srClear();srMark()}}catch(e){}},400);
window.TUT={help:startHelp,talk:srTalk,sprite:function(){return AL[0]},portraitSrc:function(){try{if(typeof PORT==='string'&&PORT)return PORT}catch(e){}try{if(!AL[0].complete||!AL[0].naturalWidth)return '';if(!window.__alP){const c=document.createElement('canvas');c.width=64;c.height=66;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(AL[0],0,6,64,66,0,0,64,66);window.__alP=c.toDataURL()}return window.__alP}catch(e){return ''}},srPos:srPos,ST:ST,CH:CH,info:()=>({phase,view,idx:tut()&&tut().idx,mode:tut()&&tut().mode,fin:tut()&&tut().fin,done:sdone,ci:cur()&&cur().ci}),next:next,back:back,finish:finish,
 mode:showMode,choose:chooseMode,run:startRun,end:showEnd,skip:skipTut,
 firstOf:function(ci){return ST.findIndex(function(x){return x.ci===ci})},
 go:function(i){const s=GS();if(!s)return false;i=Math.max(0,Math.min(ST.length-1,i|0));const t=s.tut=Object.assign(s.tut||{},{mode:'begin',fin:0});t.idx=i;t.done=CH.map(function(c,k){return k}).filter(function(k){return ST.findIndex(function(x,j){return x.ci===k&&j>=i})<0});helpMode=false;persist();$('tutFull').hidden=true;startRun();return true},
 pass:function(){if(phase!=='run')return false;sdone=true;try{updateBtns()}catch(e){}next();return true},
 reset:function(){const s=GS();if(!s)return;helpMode=false;delete s.tut;persist();showMode()}};
})();
