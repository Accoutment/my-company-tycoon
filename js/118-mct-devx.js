
/* =====================================================================
   MY COMPANY TYCOON · DEVX — ส่วนขยาย Developer Test Mode (v194)
   เพิ่มแท็บ: 🎓 สอนเล่น · 💵 ผู้เล่น/ไอเทม · 🚗 รถ/คอนโด/ขนส่ง · 🏙️ ร้าน/ฉากใหม่ · 🧙 เควส/ตัวละคร · 💾 เซฟ/ตรวจระบบ
   ทุกปุ่มต้องเปิด Test Mode ก่อน (ยกเว้นปุ่มดูสถานะ/ตรวจระบบ) · ไม่แก้ระบบเดิม แค่เรียก API ที่มีอยู่
   ===================================================================== */
(function(){
 if(window.DEVX)return;
 const gS=()=>{try{return S}catch(e){return null}};
 const on=()=>{try{return !!DEV_TEST_MODE}catch(e){return false}};
 const T=m=>{try{toast(m)}catch(e){console.log(m)}};
 const G=()=>{if(!on()){T('กรุณาเปิด Test Mode ก่อน (แท็บ ⚙️ ระบบ/เวลา)');return false}return true};
 const sv=()=>{try{save(1)}catch(e){}};
 const hu=()=>{try{hud()}catch(e){}};
 const closeM=()=>{try{$('testModal').hidden=true}catch(e){}};
 const has=n=>{try{return typeof eval(n)!=='undefined'&&eval(n)!==null}catch(e){return false}};
 const B=(f,t,w)=>'<button class="btn'+(w?' wide':'')+'" onclick="'+f+'">'+t+'</button>';
 const D=(id)=>'<div class="wide" id="'+id+'" style="padding:8px;background:#111a2a;border:1px solid #52627a;border-radius:8px;font-size:12px;line-height:1.5;white-space:pre-wrap"></div>';
 const H=(t,s)=>'<h3>'+t+'</h3>'+(s?'<small>'+s+'</small>':'');
 const grid=x=>'<div class="testGrid">'+x+'</div>';
 const set=(id,t)=>{const e=document.getElementById(id);if(e)e.textContent=t};
 const errs=[];
 window.addEventListener('error',e=>{errs.push((e.message||'')+' @'+(e.filename||'').split('/').pop()+':'+(e.lineno||''));if(errs.length>30)errs.shift()});
 window.addEventListener('unhandledrejection',e=>{errs.push('promise: '+(e.reason&&e.reason.message||e.reason));if(errs.length>30)errs.shift()});
 const safe=(f,label)=>{try{return f()}catch(e){console.error('[DEVX '+label+']',e);T('เกิดข้อผิดพลาด: '+label+' (ดู console)');return null}};

 /* ================= 🎓 สอนเล่น ================= */
 const tutInfo=()=>{
  if(!has('TUT'))return 'ไม่พบโมดูลสอนเล่น';
  const i=TUT.info(),s=gS(),t=s&&s.tut;
  const ch=(i.ci!=null&&TUT.CH[i.ci])?TUT.CH[i.ci].n:'-';
  return '🎓 สถานะสอนเล่น\nโหมด: '+(t?(t.mode||'(ยังไม่เลือก)'):'(ไม่มีข้อมูล)')+' · จบหลักสูตร: '+(t&&t.fin?'ใช่ ✅':'ยัง')+'\nความคืบหน้า: ขั้น '+(t?t.idx:0)+'/'+TUT.ST.length+' · บทที่เรียนจบ '+(t&&t.done?t.done.length:0)+'/'+TUT.CH.length+'\nตอนนี้: เฟส '+i.phase+(i.phase&&i.phase!=='off'?' · ขั้นที่ '+i.view+' · '+ch:'')+(i.phase==='run'?' · ทำภารกิจขั้นนี้แล้ว: '+(i.done?'ใช่':'ยัง'):'');
 };
 function tutPane(){
  let h=H('🎓 โหมดสอนเล่น (CEO TRAINING)','แนะนำให้อยู่ในหน้าออฟฟิศ · ปุ่มจะปิดหน้าต่างนี้แล้วเปิดสอนเล่นทันที · เกมจะหยุดเวลาระหว่างฝึก')+grid(D('dxTut')+
   B("DEVX.tut('menu')",'🧭 เปิดหน้าเลือกโหมด (ตั้งชื่อ + BEGINNER/EXPERIENCED)',1)+
   B("DEVX.tut('begin')",'🎓 เริ่ม BEGINNER ทันที')+B("DEVX.tut('exp')",'💼 ตั้งเป็น EXPERIENCED (ข้าม)')+
   B("DEVX.tut('reset')",'♻️ รีเซ็ตสอนเล่น (ล้างความคืบหน้า + เปิดหน้าเลือกโหมด)',1)+
   B("DEVX.tut('talk')",'👩‍💼 เปิดเมนูเลขาอลิสา (ทบทวนบท)',1));
  h+=H('ควบคุมระหว่างสอน')+grid(B("DEVX.tut('prev')",'◀ ย้อนกลับ')+B("DEVX.tut('next')",'ถัดไป ▶')+B("DEVX.tut('pass')",'⏭ ผ่านภารกิจขั้นนี้ + ถัดไป',1)+
   B("DEVX.tut('end')",'🏁 แสดงหน้าจบหลักสูตร')+B("DEVX.tut('finish')",'✅ จบหลักสูตรทันที')+B("DEVX.tut('skip')",'⏩ ข้ามการฝึก (แสดงข้อความเลขา)',1)+B("DEVX.tut('info')",'🔎 อัปเดตสถานะ',1));
  if(has('TUT')){
   h+=H('เริ่มสอนที่บทที่ต้องการ','ปุ่ม "เริ่ม" = ตั้งความคืบหน้าไปที่ต้นบทนั้นแล้วเรียนต่อ · "ทบทวน" = เปิดดูเฉพาะบท (ไม่เปลี่ยนความคืบหน้า)')+'<div class="testGrid">';
   TUT.CH.forEach((c,i)=>{h+=B("DEVX.tut('go',"+i+")",'เริ่มบท '+(i+1)+' · '+c.n)+B("DEVX.tut('help',"+i+")",'👁 ทบทวนบท '+(i+1))});
   h+='</div>';
  }
  return h;
 }
 function tut(a,n){
  if(!has('TUT')){T('ไม่พบโมดูลสอนเล่น');return}
  if(a==='info'){set('dxTut',tutInfo());return}
  if(!G())return;
  safe(()=>{
   const need=['mode','choose','go','pass','reset','end'];
   if(need.some(k=>!TUT[k])){T('เวอร์ชันนี้ไม่มี API สอนเล่นสำหรับ Test');return}
   if(a==='menu'){closeM();TUT.mode()}
   else if(a==='begin'){closeM();TUT.choose('begin')}
   else if(a==='exp'){TUT.choose('exp');T('ตั้งเป็น EXPERIENCED แล้ว')}
   else if(a==='reset'){closeM();TUT.reset()}
   else if(a==='talk'){closeM();TUT.talk()}
   else if(a==='prev'){TUT.back()}
   else if(a==='next'){TUT.next()}
   else if(a==='pass'){if(!TUT.pass())T('ต้องอยู่ระหว่างฝึก (เฟส run) ก่อน')}
   else if(a==='end'){closeM();TUT.end()}
   else if(a==='finish'){TUT.finish();T('จบหลักสูตรแล้ว')}
   else if(a==='skip'){closeM();if(TUT.skip)TUT.skip()}
   else if(a==='go'){closeM();const i=TUT.firstOf(n);if(i<0){T('ไม่พบบทนี้');return}TUT.go(i)}
   else if(a==='help'){closeM();TUT.help(n)}
  },'tut.'+a);
  setTimeout(()=>set('dxTut',tutInfo()),50);
 }

 /* ================= 💵 ผู้เล่น/ไอเทม ================= */
 const LVREP=[0,60,180,450,1000,2200];
 function plrInfo(){
  const s=gS();if(!s)return '-';
  let r='';try{r=CEORPG.R();r='\nCEO RPG: Lv '+r.level+' · XP '+r.xp+' · SP '+r.sp+' · MP '+r.mp}catch(e){}
  return '💵 เงิน '+Math.round(s.money).toLocaleString('en-US')+' · ชื่อเสียง '+(s.rep||0)+' · เลเวลบริษัท '+(s.lv||1)+'\nวัน '+s.day+' · พนักงาน '+(s.emp||[]).length+' คน'+r;
 }
 function plrPane(){
  let h=H('💵 เงิน / ชื่อเสียง / เลเวล')+grid(D('dxPlr')+
   B("DEVX.money(100000)",'+฿100,000')+B("DEVX.money(1000000)",'+฿1,000,000')+B("DEVX.money(100000000)",'+฿100,000,000')+
   B("DEVX.money(-100000)",'−฿100,000')+B("DEVX.moneySet(30000)",'ตั้งเงิน = 30,000 (เริ่มเกม)')+B("DEVX.moneySet(0)",'ตั้งเงิน = 0')+
   B("DEVX.rep(10)",'ชื่อเสียง +10')+B("DEVX.rep(100)",'+100')+B("DEVX.rep(1000)",'+1,000')+
   '<small class="wide">เลเวลบริษัทคำนวณจากชื่อเสียง · ปุ่มนี้ตั้งชื่อเสียงให้พอดีเลเวลที่เลือก</small>');
  for(let l=1;l<=6;l++)h+=B("DEVX.compLv("+l+")",'บริษัท Lv '+l);
  h+='</div>'+H('👔 CEO RPG (สกิล / เลเวล CEO)')+grid(B("DEVX.rpg('xp',500)",'XP +500')+B("DEVX.rpg('xp',5000)",'XP +5,000')+B("DEVX.rpg('sp',10)",'แต้มสกิล SP +10')+B("DEVX.rpg('mp',10)",'แต้ม MP +10')+B("DEVX.rpg('reset')",'♻️ รีเซ็ต CEO RPG',1));
  h+=H('👥 พนักงาน')+grid(B("DEVX.emp('happy')",'😊 ความสุขพนักงานทุกคน = เต็ม')+B("DEVX.emp('hp')",'⚡ เติมพลัง/ลดความเครียด')+B("DEVX.emp('clear')",'🧹 ล้างผู้สมัครที่รออยู่'));
  h+=H('🎒 ไอเทมในกระเป๋า (กระเป๋า 24 ช่อง)','ให้ของทีละชุด · ถ้ากระเป๋าเต็มจะใส่ได้เท่าที่มีที่')+'<div class="testGrid">';
  [['stone','หิน'],['iron_ore','แร่เหล็ก'],['silver_ore','แร่เงิน'],['gold_ore','แร่ทอง'],['diamond_ore','แร่เพชร'],['pick_wood','พลั่วไม้'],['pick_iron','พลั่วเหล็ก'],['pick_silver','พลั่วเงิน'],['pick_gold','พลั่วทอง'],['pick_diamond','พลั่วเพชร']].forEach(it=>{h+=B("DEVX.give('"+it[0]+"',"+(/^pick/.test(it[0])?1:20)+")",'+ '+it[1]+(/^pick/.test(it[0])?' ×1':' ×20'))});
  h+=B("DEVX.giveAll()",'🎁 ให้พลั่วครบชุด + แร่ครบ',1)+B("DEVX.clearBag()",'🗑 ล้างกระเป๋า',1)+'</div>';
  h+=H('🎣 เลเวลการตกปลา')+grid([1,2,3,5,8,10].map(l=>B("DEVX.fishLv("+l+")",'ตกปลา Lv '+l)).join(''));
  return h;
 }
 const api={};
 api.money=n=>{if(!G())return;const s=gS();s.money=Math.max(0,Math.round(s.money+n));hu();sv();T('เงิน '+(n>=0?'+':'')+n.toLocaleString('en-US'));api.upd()};
 api.moneySet=n=>{if(!G())return;gS().money=n;hu();sv();T('ตั้งเงิน = '+n.toLocaleString('en-US'));api.upd()};
 api.rep=n=>{if(!G())return;const s=gS();s.rep=(s.rep||0)+n;try{chk()}catch(e){}hu();sv();T('ชื่อเสียง +'+n);api.upd()};
 api.compLv=l=>{if(!G())return;const s=gS();s.rep=LVREP[l-1];try{chk()}catch(e){s.lv=l}hu();sv();T('ตั้งเลเวลบริษัท = '+l);api.upd()};
 api.rpg=(k,n)=>{if(!G())return;safe(()=>{
  if(k==='xp'){CEORPG.addXP(n);}
  else if(k==='reset'){delete gS().ceoRPG;CEORPG.R()}
  else{const r=CEORPG.R();r[k]=(r[k]||0)+n}
  sv();T('CEO RPG อัปเดตแล้ว');api.upd()},'rpg')};
 api.emp=k=>{if(!G())return;const s=gS();
  if(k==='happy'){(s.emp||[]).forEach(e=>{if('ha' in e)e.ha=100});T('ความสุขพนักงานเต็ม')}
  else if(k==='hp'){(s.emp||[]).forEach(e=>{['en','energy','st','stress'].forEach(f=>{if(f in e)e[f]=/^st/.test(f)?0:100})});T('เติมพลังพนักงานแล้ว')}
  else if(k==='clear'){s.cands=[];T('ล้างผู้สมัครแล้ว')}
  hu();sv()};
 api.give=(id,n)=>{if(!G())return;safe(()=>{const a=CEOScene.testGive(id,n);T('ใส่ '+id+' ได้ '+a+' ชิ้น')},'give')};
 api.giveAll=()=>{if(!G())return;safe(()=>{['pick_wood','pick_iron','pick_silver','pick_gold','pick_diamond'].forEach(i=>CEOScene.testGive(i,1));['stone','iron_ore','silver_ore','gold_ore','diamond_ore'].forEach(i=>CEOScene.testGive(i,10));T('ใส่พลั่วและแร่แล้ว')},'giveAll')};
 api.clearBag=()=>{if(!G())return;safe(()=>{CEOScene.testClear();T('ล้างกระเป๋าแล้ว')},'clearBag')};
 api.fishLv=l=>{if(!G())return;safe(()=>{CEOScene.testLv(l);T('ตั้งเลเวลตกปลา '+l)},'fishLv')};

 /* ================= 🚗 รถ / คอนโด / ขนส่ง ================= */
 function vehInfo(){
  let r='';
  try{const c=CARX.cur();const o=gS().car;r+='🚗 รถที่ใช้: '+(c?c.name:'(ไม่มี → ใช้รถเมล์)')+' · ครอบครอง '+(o&&o.owned?Object.keys(o.owned).length:0)+'/'+CARX.CARS.length+' คัน\n'}catch(e){}
  try{const c=CONDOROOM.state();r+='🏙️ คอนโด: ห้องเลเวล '+c.lv+' · มีห้อง '+Object.keys(c.own||{}).join(',')+'\n'}catch(e){}
  try{const v=QM.visited();r+='🗺 วาร์ปที่ปลดแล้ว: '+Object.keys(v).length+'/'+QM.PLACES.length+' ที่'}catch(e){}
  return r;
 }
 function vehPane(){
  let h=H('🚗 รถของผู้เล่น')+grid(D('dxVeh')+B("DEVX.run('CARX.testAll()')",'🔓 ปลดล็อกรถทุกคัน',1)+B("DEVX.run('CARX.testMoney()')",'💰 +฿20,000,000 (ไว้ซื้อรถ)',1));
  try{CARX.CARS.forEach(c=>{h+=B("DEVX.car('"+c.id+"')",'ใช้ '+c.name+(c.auction?' (ประมูล)':''))})}catch(e){}
  h+=B("DEVX.car(null)",'🚌 ถอดรถ (ทดสอบรถเมล์รับ)')+B("DEVX.run('CARBOSS.test.loseAll()')",'ถอนรถประมูลทั้งหมด')+'</div>';
  h+=H('🏙️ คอนโด')+grid(B("DEVX.condo(1)",'ไปห้อง Lv1')+B("DEVX.condo(2)",'ไปห้อง Lv2')+B("DEVX.condo(3)",'ไปห้อง Lv3')+B("DEVX.run('CONDOROOM.unlockAll()')",'🔓 ปลดล็อกห้องทุกเลเวล')+B("DEVX.run('CONDOROOM.chargeNow()')",'💸 เก็บค่าเช่าทันที')+B("DEVX.condo(0)",'ไปคอนโด (ห้องปัจจุบัน)'));
  h+=H('🗺️ วาร์ปด่วน / รถมารับ','"วาร์ปแบบรถรับ" = เล่นแอนิเมชันรถ/รถเมล์ รับไปส่ง · "ทันที" = ข้ามแอนิเมชัน · ต้องเปิดหน้าต่างนี้ตอนอยู่ในฉากหรือออฟฟิศ (ระบบจะปิดหน้าต่างให้)')+grid(B("DEVX.qmAll()",'🔓 ปลดล็อกจุดวาร์ปทุกที่',1)+B("DEVX.qmReset()",'♻️ ล้างจุดวาร์ปที่ปลด (เหลือถนน)')+B("DEVX.run('QM.setRun(true)')",'🏃 เปิดวิ่งเร็ว')+B("DEVX.run('QM.setRun(false)')",'🚶 ปิดวิ่งเร็ว')+B("DEVX.qmOpen()",'📋 เปิดเมนูวาร์ป',1));
  h+='<div class="testGrid">';
  try{QM.PLACES.forEach(p=>{h+=B("DEVX.qmGo('"+p[0]+"',0)",p[1]+' '+p[2]+' · รถรับ')+B("DEVX.qmGo('"+p[0]+"',1)",'⚡ ทันที')})}catch(e){}
  h+='</div>'+H('🚌 รถเมล์ / ท่าเรือ')+grid(B("DEVX.bus()",'🚌 เรียกรถเมล์มาที่ป้าย (ต้องอยู่บนถนน)')+B("DEVX.rideTest()",'🚗 ทดสอบนั่งรถไปชายหาด (ฉากถนนต้องเปิดอยู่)'));
  return h;
 }
 api.car=id=>{if(!G())return;safe(()=>{if(id)CARX.testPick(id);else{const c=gS().car;if(c)c.sel=null;sv();T('ถอดรถแล้ว → วาร์ปจะใช้รถเมล์')}api.upd()},'car')};
 api.condo=n=>{if(!G())return;closeM();safe(()=>{if(n)CONDOROOM.testWarp(n);else{const s=CEOScene.dbg().st;if(!s.active)CEOScene.open();CEOScene.enter('condo',{from:'office'})}},'condo')};
 api.qmAll=()=>{if(!G())return;safe(()=>{QM.PLACES.forEach(p=>QM.visit(p[0]));sv();T('ปลดล็อกจุดวาร์ปครบ '+QM.PLACES.length+' ที่');api.upd()},'qmAll')};
 api.qmReset=()=>{if(!G())return;safe(()=>{const q=gS().qm;if(q)q.v={street:1};sv();T('ล้างจุดวาร์ปแล้ว');api.upd()},'qmReset')};
 api.qmOpen=()=>{if(!G())return;closeM();safe(()=>{const s=CEOScene.dbg().st;if(!s.active)CEOScene.open();setTimeout(()=>QM.open(),400)},'qmOpen')};
 api.qmGo=(pl,inst)=>{if(!G())return;closeM();safe(()=>{
  const s=CEOScene.dbg().st;if(!s.active){CEOScene.open();CEOScene.enter('street',{from:'office'})}
  setTimeout(()=>QM.warp(pl,!!inst),500)},'qmGo')};
 api.bus=()=>{if(!G())return;closeM();safe(()=>CEOScene.armBus(.5),'bus')};
 api.rideTest=()=>{if(!G())return;closeM();safe(()=>{
  const s=CEOScene.dbg().st;if(!s.active){CEOScene.open();CEOScene.enter('street',{from:'office'})}
  setTimeout(()=>CEOScene.startRide({auto:true,fast:true,to:'beach',label:'ชายหาด'}),500)},'rideTest')};

 /* ================= 🏙️ ร้าน / ฉากใหม่ ================= */
 function plcInfo(){
  let r='';
  try{const c=gS().cardshop;r+='🃏 การ์ด: สะสม '+Object.keys(c.coll||{}).length+'/'+CARDSHOP.CARDS.length+' แบบ · RP '+(c.rp||0)+' · แข่ง '+(c.stats&&c.stats.games||0)+' เกม\n'}catch(e){}
  try{const b=gS().carboss;r+='🔨 หัวหน้าฝ่ายขาย: ความสนิท '+(b?b.aff:0)+'\n'}catch(e){}
  try{const v=gS().vip;r+='💎 VIP: ความสนิทเฉลี่ย '+(v?Math.round(Object.values(v.aff||{}).reduce((a,b)=>a+b,0)/Math.max(1,VIPX.IDS.length)):0)+' · หนี้ '+((v&&v.loans||[]).length)+'\n'}catch(e){}
  try{r+='🚉 สถานี: '+STATION_SCENE.status()+'\n'}catch(e){}
  try{const d=DEEP_SCENE.state();r+='⛏ ถ้ำ: ปลดชั้นถึง '+d.mine.unl+' · HP '+d.mine.hp+'/'+d.mine.mhp}catch(e){}
  return r;
 }
 function plcPane(){
  let h=H('🃏 CARD SHOP / การ์ด')+grid(D('dxPlc')+
   B("DEVX.card('money',100000)",'+฿100,000 (เงินเกมหลัก)')+B("DEVX.card('all',1)",'🎴 ให้การ์ดทุกใบ ×1')+B("DEVX.card('all',3)",'🎴 ให้ครบ ×3')+
   B("DEVX.card('rp',500)",'RP +500')+B("DEVX.card('clear')",'🗑 ล้างคอลเลกชัน')+B("DEVX.card('reset')",'♻️ รีเซ็ตร้านการ์ดทั้งหมด',1));
  h+=H('🔨 ประมูลรถ / หัวหน้าฝ่ายขาย (CARBOSS)')+grid(B("DEVX.run('CARBOSS.test.aff(100)')",'ความสนิท = MAX')+B("DEVX.run('CARBOSS.test.add(10)')",'ความสนิท +10')+B("DEVX.run('CARBOSS.test.window()')",'🔨 เปิดรอบประมูลทันที')+B("DEVX.run('CARBOSS.test.reset()')",'♻️ รีเซ็ต'));
  h+=H('💎 VIP ลูกค้า (VIPX)')+grid(B("DEVX.run('VIPX.test.add(20)')",'ความสนิททุกคน +20')+B("DEVX.run('VIPX.test.set(100)')",'ความสนิท = MAX (ได้คอนแท็ค)')+B("DEVX.run('VIPX.test.late()')",'หนี้ VIP เลยกำหนด')+B("DEVX.run('VIPX.test.reset()')",'♻️ รีเซ็ต VIP'));
  h+=H('🚉 สถานีรถไฟ')+grid(B("DEVX.station('UNDER_RENOVATION')",'🚧 กำลังปรับปรุง')+B("DEVX.station('OPEN_FOR_VISIT')",'👀 เปิดให้เข้าชม')+B("DEVX.station('OPEN_FOR_SERVICE')",'🚆 เปิดให้บริการ'));
  h+=H('⛏ ถ้ำเหมือง (MINING CAVE)','ให้ไอเทมได้ที่แท็บ 💵 · ไปถ้ำด้วยปุ่มวาร์ป')+grid(B("DEVX.mine('unl')",'🔓 ปลดทางลงทุกชั้น')+B("DEVX.mine('heal')",'❤️ เติม HP เต็ม')+B("DEVX.mine('reset')",'♻️ รีเซ็ตความคืบหน้าถ้ำ')+B("DEVX.mine('kit')",'🎁 ชุดเริ่มต้นขุดแร่ (พลั่ว+เงิน)')+B("DEVX.warpTo('cave')",'→ ไปถ้ำเหมือง')+B("DEVX.warpTo('dpfr')",'→ ป่าลึก')+B("DEVX.warpTo('frst')",'→ ป่าแม่น้ำ'));
  h+=H('🎶 NICECLUB / 🎱 สนุกเกอร์ / 🐠 อควาเรียม')+grid(B("DEVX.warpTo('ncin')",'🎶 เข้า NICECLUB')+B("DEVX.warpTo('snkin')",'🎱 เข้าสนุกเกอร์')+B("DEVX.warpTo('aqin')",'🐠 เข้าอควาเรียม')+B("DEVX.warpTo('cardin')",'🃏 เข้าร้านการ์ด')+B("DEVX.warpTo('aucin')",'🔨 ฮอลล์ประมูล')+B("DEVX.warpTo('showroom')",'🏎 โชว์รูม'));
  return h;
 }
 api.warpTo=pl=>{if(!G())return;closeM();safe(()=>{const s=CEOScene.dbg().st;if(!s.active)CEOScene.open();CEOScene.enter(pl,{from:'office'})},'warpTo')};
 api.card=(k,n)=>{if(!G())return;safe(()=>{
  const s=gS();s.cardshop=s.cardshop||{v:1};const c=s.cardshop;c.coll=c.coll||{};
  if(k==='money'){s.money+=n;hu()}
  else if(k==='all'){CARDSHOP.CARDS.forEach(d=>{c.coll[d.id]={n:n}});T('ให้การ์ด '+CARDSHOP.CARDS.length+' แบบ ×'+n)}
  else if(k==='rp'){c.rp=(c.rp||0)+n}
  else if(k==='clear'){c.coll={};T('ล้างคอลเลกชันแล้ว')}
  else if(k==='reset'){delete s.cardshop;T('รีเซ็ตร้านการ์ดแล้ว')}
  sv();api.upd()},'card')};
 api.station=st=>{if(!G())return;safe(()=>{const ok=(STATION_SCENE.testStatus||STATION_SCENE.setStatus)(st);T(ok?'สถานะสถานี: '+st+(st==='UNDER_RENOVATION'?'':' (พรีวิวเพื่อทดสอบ · เวอร์ชันจริงยังเปิดแค่ปรับปรุง)'):'ตั้งสถานะนี้ไม่ได้');api.upd()},'station')};
 api.mine=k=>{if(!G())return;safe(()=>{
  const m=DEEP_SCENE.state().mine;const s=gS();s.mine=s.mine||m;const M=s.mine;
  if(k==='unl'){M.unl=5;T('ปลดทางลงทุกชั้นแล้ว')}
  else if(k==='heal'){M.hp=M.mhp||100;T('เติม HP เต็ม')}
  else if(k==='reset'){delete s.mine;T('รีเซ็ตถ้ำแล้ว')}
  else if(k==='kit'){CEOScene.testGive('pick_iron',1);CEOScene.testGive('stone',5);T('ให้พลั่วเหล็ก + หิน')}
  sv();api.upd()},'mine')};

 /* ================= 🧙 เควส / ตัวละคร ================= */
 function qstInfo(){
  let r='';
  try{const q=QUEST.state();const st=Object.values(q.st||{});r+='📜 เควสหลัก: เริ่ม '+st.length+' · เสร็จ '+st.filter(x=>x.s==='d').length+' · ธง '+Object.keys(q.fl||{}).length+'\n'}catch(e){}
  try{const w=gS().wizard;r+='🧙 พ่อมดเที่ยงคืน: รับเควส '+(w&&w.WizardQuestAccepted?'ใช่':'ยัง')+' · สำเร็จ '+(w&&w.WizardQuestCompleted?'ใช่':'ยัง')+' · ขั้น '+(w&&w.WizardQuestCurrentStep||0)+'\n'}catch(e){}
  try{const d=REI.state();r+='👨‍💻 เรย์: จ้างแล้ว '+(d.hired?'ใช่':'ยัง')+' · ความสนิท '+d.f+' · สุ่มแล้ว '+d.rolls+' รอบ'}catch(e){}
  return r;
 }
 function qstPane(){
  let h=H('📜 ระบบเควส (QUEST ENGINE)','เลือกเควสจากรายการ แล้วกดปุ่ม · "จบเควส" จะเดินเนื้อเรื่องจนเสร็จและให้รางวัลตามที่ระบบกำหนด')+'<div class="testGrid">'+D('dxQst');
  let opts='';
  let ropts='';
  try{opts=(QUEST.defs.Q||[]).filter(d=>d&&d.id).map(d=>'<option value="'+d.id+'">'+d.id+' · '+String(d.title||'').replace(/</g,'')+'</option>').join('');
   ropts=(QUEST.defs.RND||[]).filter(d=>d&&d.id).map(d=>'<option value="'+d.id+'">'+d.id+' · '+String(d.title||'').replace(/</g,'')+'</option>').join('')}catch(e){}
  h+='<select id="dxQid" class="wide" style="padding:6px;background:#111a2a;color:#e8eefc;border:1px solid #52627a;border-radius:6px">'+opts+'</select>'+
   B("DEVX.quest('complete')",'✅ จบเควสที่เลือก')+B("DEVX.quest('reset1')",'↩️ รีเซ็ตเควสที่เลือก')+B("DEVX.quest('show')",'🔎 ดูสถานะเควสที่เลือก',1)+
   B("DEVX.quest('flags')",'🚩 ดูธง (flags) ทั้งหมด',1)+
   '<select id="dxRid" class="wide" style="padding:6px;background:#111a2a;color:#e8eefc;border:1px solid #52627a;border-radius:6px">'+ropts+'</select>'+B("DEVX.quest('spawn')",'✨ ปล่อยเควสสุ่ม (RND) ที่เลือกบนแผนที่ปัจจุบัน',1)+B("DEVX.quest('resetAll')",'♻️ รีเซ็ตระบบเควสทั้งหมด (S.q)',1)+'</div>';
  h+=H('🧙 พ่อมดเที่ยงคืน (Midnight Wizard)','สถานะดูได้ในกล่องด้านบน')+grid(B("DEVX.wiz('reset')",'♻️ รีเซ็ตเควสพ่อมด')+B("DEVX.wiz('flag')",'🚩 เปิดธง wiz_acc (ปลดเควส WZ1)')+B("DEVX.wiz('show')",'🔎 ดูข้อมูลดิบ'));
  h+=H('👨‍💻 เรย์ (REI · ตัวละครลับ ★5)')+grid(B("DEVX.run('REI.roll(0)')",'🎲 บังคับสุ่มเจอ (เข้าสมัคร)')+B("DEVX.rei('hire')",'🤝 จ้างเข้าบริษัททันที')+B("DEVX.rei('f50')",'ความสนิท = 50')+B("DEVX.rei('f100')",'ความสนิท = 100')+B("DEVX.rei('reset')",'♻️ รีเซ็ตเรย์',1));
  h+=H('🏝️ เนื้อเรื่องเกาะ / ริมุรุ / ผี')+'<small>ปุ่มอยู่ในแท็บ 🌴 เนื้อเรื่องใหม่ และ 👻 เมือง/ผี</small>';
  return h;
 }
 api.quest=(k)=>{
  const id=(document.getElementById('dxQid')||{}).value;
  if(k==='show'||k==='flags'){safe(()=>{const q=QUEST.state();set('dxQst',k==='show'?(id+' → '+JSON.stringify(q.st[id]||'ยังไม่เริ่ม')):'ธง: '+JSON.stringify(q.fl))},'quest');return}
  if(!G())return;
  safe(()=>{
   if(k==='complete'){if(!id)return;const ok=QUEST.complete(id);T(ok?'จบเควส '+id+' แล้ว':'จบเควสไม่สำเร็จ (เควสไม่พร้อม?)')}
   else if(k==='spawn'){const rid=(document.getElementById('dxRid')||{}).value;closeM();T(QUEST.spawnRnd(rid)?'ปล่อยเควสสุ่ม '+rid+' แล้ว (ไปดูที่ถนน/ชายหาด)':'ปล่อยไม่สำเร็จ')}
   else if(k==='reset1'){const q=QUEST.state();delete q.st[id];T('รีเซ็ต '+id)}
   else if(k==='resetAll'){delete gS().q;QUEST.state();T('รีเซ็ตระบบเควสแล้ว')}
   sv();api.upd()},'quest');
 };
 api.wiz=k=>{
  if(k==='show'){const w=gS().wizard;set('dxQst',JSON.stringify(w||'(ไม่มีข้อมูล)'));return}
  if(!G())return;
  safe(()=>{const s=gS();
   if(k==='reset'){delete s.wizard;T('รีเซ็ตเควสพ่อมดแล้ว (โหลดเกมใหม่เพื่อสร้างค่าเริ่มต้น)')}
   else if(k==='flag'){const q=QUEST.state();q.fl.wiz_acc=1;T('เปิดธง wiz_acc แล้ว')}
   sv();api.upd()},'wiz');
 };
 api.rei=k=>{if(!G())return;safe(()=>{
  const d=REI.state();
  if(k==='hire'){if(!d.hired){REI.roll(0);const i=(gS().cands||[]).findIndex(c=>c.charId==='rei');if(i>=0){A.hire(i)}else if(!d.hired){T('จ้างไม่ได้ (อาจมีเรย์อยู่แล้ว)')}}}
  else if(k==='f50'){d.f=50}
  else if(k==='f100'){d.f=100}
  else if(k==='reset'){delete gS().rei;T('รีเซ็ตเรย์แล้ว (พนักงานเรย์ที่จ้างแล้วไม่ถูกลบ)')}
  sv();api.upd()},'rei')};

 /* ================= 💾 เซฟ / ตรวจระบบ ================= */
 function savPane(){
  return H('💾 เซฟเกม')+grid(D('dxSav')+B("DEVX.sav('save')",'💾 บันทึกเดี๋ยวนี้')+B("DEVX.sav('size')",'📏 ดูขนาดเซฟ')+B("DEVX.sav('dl')",'⬇ ดาวน์โหลดเซฟ (JSON)',1))+
   H('🔍 ตรวจระบบอัตโนมัติ (Self-check)','ตรวจว่าโมดูล/ฟังก์ชันสำคัญโหลดครบ ไม่แก้ข้อมูลเกม · ใช้ได้โดยไม่ต้องเปิด Test Mode')+grid(B("DEVX.check()",'▶ ตรวจโมดูลทั้งหมด',1)+D('dxChk')+B("DEVX.sav('errs')",'🐞 ดูข้อผิดพลาด JS ล่าสุด',1)+B("DEVX.sav('clrerr')",'ล้างรายการข้อผิดพลาด'));
 }
 api.sav=k=>{
  const s=gS();
  if(k==='errs'){set('dxSav',errs.length?errs.slice(-12).join('\n'):'ไม่พบข้อผิดพลาด JS ตั้งแต่เปิดเกม ✅');return}
  if(k==='clrerr'){errs.length=0;set('dxSav','ล้างแล้ว');return}
  if(k==='size'){const j=JSON.stringify(s);const top=Object.keys(s).map(x=>[x,JSON.stringify(s[x]||0).length]).sort((a,b)=>b[1]-a[1]).slice(0,6);set('dxSav','ขนาดเซฟ ≈ '+(j.length/1024).toFixed(1)+' KB\nใหญ่สุด: '+top.map(t=>t[0]+' '+(t[1]/1024).toFixed(1)+'KB').join(' · '));return}
  if(!G())return;
  if(k==='save'){sv();set('dxSav','บันทึกแล้ว '+new Date().toLocaleTimeString())}
  else if(k==='dl'){safe(()=>{const b=new Blob([JSON.stringify(s)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='mct_save_day'+s.day+'.json';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);T('ดาวน์โหลดเซฟแล้ว')},'dl')}
 };
 api.check=()=>{
  const L=[
   ['เกมหลัก S/A','S,A,save,toast,hud'],['สอนเล่น','TUT,TUT.ST,TUT.CH,TUT.mode,TUT.choose,TUT.go,TUT.pass,TUT.reset'],['ฉาก 2D','CEOScene,CEOScene.enter,CEOScene.startRide,CEOScene.testGive,CEOScene.armBus'],
   ['วาร์ปด่วน','QM,QM.warp,QM.PLACES,QM.visit,QM.skipRide'],['รถ','CARX,CARX.CARS,CARX.testAll,CARX.testPick'],['คอนโด','CONDOROOM,CONDOROOM.testWarp'],
   ['การ์ด','CARDSHOP,CARDSHOP_SCENE'],['ประมูล/CARBOSS','CARBOSS,CARBOSS.test'],['VIP','VIPX,VIPX.test'],['NICECLUB','NICECLUB,NICECLUB_SCENE'],['สนุกเกอร์','SNOOKER_SCENE'],
   ['สถานีรถไฟ','STATION_SCENE,STATION_SCENE.setStatus'],['ป่า','FOREST_SCENE'],['ถ้ำเหมือง','DEEP_SCENE,DEEP_SCENE.rt'],['เควส','QUEST,QUEST.complete,QUEST.state'],
   ['เรย์','REI,REI.roll,REI.state'],['เกาะ/ริมุรุ','LOST,RIM'],['ผี','GHOST,GHOST.testTime'],['CEO RPG','CEORPG,CEORPG.addXP'],['คัตซีน','QCUT,QCUT.play'],['ตู้เสื้อผ้า','WARD'],['ถนน/รถวิ่ง','ROADCARS']];
  const out=[];let bad=0;
  L.forEach(r=>{const miss=r[1].split(',').filter(n=>!has(n));if(miss.length){bad++;out.push('❌ '+r[0]+' → ขาด: '+miss.join(', '))}else out.push('✅ '+r[0])});
  out.push('\nสรุป: ผ่าน '+(L.length-bad)+'/'+L.length+' หมวด'+(bad?' · มีปัญหา '+bad:' · ครบทุกหมวด 🎉'));
  set('dxChk',out.join('\n'));
 };

 const pane={tut:tutPane,plr:plrPane,veh:vehPane,plc:plcPane,qst:qstPane,sav:savPane};
 api.run=code=>{if(!G())return;safe(()=>{eval(code);api.upd()},code)};
 api.upd=()=>{set('dxTut',tutInfo());set('dxPlr',plrInfo());set('dxVeh',vehInfo());set('dxPlc',plcInfo());set('dxQst',qstInfo())};
 api.tut=tut;api.pane=pane;api.errs=errs;
 window.DEVX=api;
})();

