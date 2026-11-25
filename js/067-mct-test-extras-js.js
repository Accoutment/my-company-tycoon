
/* =====================================================================
   TEST MODE EXTRAS · เครื่องมือทดสอบเพิ่มเติม (โมดูลแยก · ต่อท้ายหน้า Developer Test Mode เดิม)
   - 🌀 วาร์ปไปสถานที่: บริษัท · คอนโด · ถนนคนเดิน · ทะเล · วัด · โบสถ์ · มัสยิด (อิสลาม)
   - 🎬 โหมดฉากจบทั้งหมด: ล้มละลาย · Yakuza BAD/TRUE · HORROR ENDING (คัตซีน/หน้าจอแบบพรีวิว ไม่แตะเซฟ)
   - 👻 ตัวนับ HORROR ENDING · 🐉 ภารกิจลับยากูซ่า · 📱 มือถือ · 🛐 วันพิเศษศาสนา · 👔 ตู้เสื้อผ้า
   ===================================================================== */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const T=m=>{try{toast(m)}catch(e){}};
function closeTest(){const m=$('testModal');if(m)m.hidden=true}
function stopScenes(){
 try{if(window.REL&&REL.scene&&REL.scene.isOn&&REL.scene.isOn()){REL.scene.leave()}}catch(e){}
 try{if(CEOScene.dbg().st.active)CEOScene.cancel()}catch(e){}
 try{CUT.on=0}catch(e){}
}
function warp(place){
 closeTest();
 try{if(window.QCUT&&QCUT.on())QCUT.skip()}catch(e){}
 stopScenes();
 setTimeout(()=>{
  try{
   if(place==='office'){try{CEOScene.cancel()}catch(e){}try{S.paused=0}catch(e){}T('🏢 กลับบริษัท');return}
   if(place==='condo'||place==='street'||place==='beach'||place==='hall'||place==='carst'||place==='showroom'||place==='aqst'||place==='aqin'||place==='cardst'||place==='cardin'||place==='aucin'||place==='snkst'||place==='snkin'||place==='ncst'||place==='ncin'||place==='stst'||place==='stin'||place==='frst'||place==='dpfr'||place==='cave'||place==='farm'){
    try{S.paused=0}catch(e){}
    CEOScene.open();CEOScene.enter(place);
    T('🌀 วาร์ปไป '+({condo:'คอนโด',hall:'ทางเดินคอนโด (หน้าห้อง 302)',street:'ถนนคนเดิน',beach:'ทะเล',carst:'ถนนหน้าโชว์รูมรถ',showroom:'ในโชว์รูมรถ',aqst:'ถนนหน้าอควาเรียม',farm:'ไร่ลุงสมศักดิ์',aqin:'ในอควาเรียม'})[place]);return
   }
   if(['temple','church','mosque','church_in','mosque_in'].indexOf(place)>=0){
    const r=REL.R();
    if(!r){T('ระบบศาสนายังไม่พร้อม');return}
    r.trip={to:place.replace('_in',''),key:'test-warp',from:S.day,at:Math.floor(S.t)};
    try{S.paused=0}catch(e){}
    REL.scene.enter(place,{key:'test-warp'});
    T('🌀 วาร์ปไป '+({temple:'วัด',church:'โบสถ์',mosque:'มัสยิด (อิสลาม)',church_in:'ในโบสถ์',mosque_in:'ในมัสยิด'})[place]);
   }
  }catch(e){console.error('[test warp]',e);T('วาร์ปไม่สำเร็จ: '+(e&&e.message||e))}
 },120);
}
const call=(f,msg)=>{try{closeTest();const r=f();if(msg)T(msg);return r}catch(e){console.error(e);T('ผิดพลาด: '+(e&&e.message||e))}};
const act={
 warp,
 badBankrupt(){closeTest();try{A.testBadEnd()}catch(e){console.error(e)}},
 ykCin(k){call(()=>YKE.previewCin(k))},
 ykScr(k){call(()=>YKE.previewScreen(k))},
 ykUnlock(){const r=YKE.testUnlock();T('ตั้งความสนิทริวจิ = 1000 → สถานะภารกิจลับ: '+r)},
 ykOffer(){call(()=>YKE.openOffer())},
 ykReset(){T('รีเซ็ตภารกิจลับยากูซ่า: '+YKE.testReset())},
 hxCin(){call(()=>HXE.previewCin())},
 hxScr(){call(()=>HXE.previewScreen())},
 hxSet(n){const v=HXE.testSet(n);T('ตั้งตัวนับผี = '+v+' / 50');refresh()},
 hxCatch(k){HXE.onCaught(k);const s=HXE.status();T('จำลองถูกจับ ('+k+') → '+s.ghostCaptureCount+' / 50'+(s.unlocked?' · ปลดล็อกแล้ว':''));refresh()},
 hxReal(){closeTest();HXE.testSet(49);HXE.onCaught('classic');T('ตั้ง 49 แล้วจับอีก 1 → ครบ 50 รอคัตซีนเริ่มเมื่อเกมพร้อม')},
 hxGhost(k){closeTest();try{GHOST.testTime(21,59)}catch(e){}try{GHOST.testStart(k)}catch(e){}},
 phone(){try{S.money+=PHN.PRICE;PHN.buy();T('📱 ได้มือถือแล้ว')}catch(e){T('ซื้อมือถือไม่สำเร็จ')}},
 phoneOff(){try{S.phone={owned:false};PHN.refresh();T('📱 ถอนมือถือแล้ว')}catch(e){}},
 day(d,label){try{S.day=d;S.t=540;try{hud()}catch(e){}try{save(1)}catch(e){}T('📅 ตั้งวัน '+label+' (09:00)')}catch(e){}},
 outfitUnlock(){try{YKE.testUnlock();S.yk.st='ALLIED';S.yk.joinDay=S.day;save(1);T('ปลดล็อกชุดยากูซ่า (จำลองเข้าร่วมแก๊ง)')}catch(e){}},
 wardrobe(){closeTest();try{WARD.open()}catch(e){}}
};
window.TESTX=act;
function B(label,call,cls){return '<button class="btn'+(cls?' '+cls:'')+'" onclick="'+call+'">'+label+'</button>'}
function html(){
 let hs='',ys='';
 try{const s=HXE.status();hs='ตัวนับ HORROR ตอนนี้: <b>'+s.ghostCaptureCount+' / 50</b> · สถานะ: '+s.state+' · '+(s.ghostCaptureByType?('ผีเดิม '+s.ghostCaptureByType.ghost1+' · กิโมโน '+s.ghostCaptureByType.kimonoGhost+' · ซอมบี้ '+s.ghostCaptureByType.zombieGhost):'')}catch(e){}
 try{ys='ภารกิจลับยากูซ่า: <b>'+YKE.status().questStatus+'</b>'}catch(e){}
 return '<div id="tx1">'+
 '<h3>🌀 วาร์ปไปสถานที่ (Test)</h3><div class="testGrid">'+
  B('🏢 บริษัท','TESTX.warp(\'office\')')+B('🏠 คอนโด','TESTX.warp(\'condo\')')+B('🏠 ห้อง LV1 (ทะลุเข้า)','CONDOROOM.testWarp(1)')+B('🏠 ห้อง LV2 (ทะลุเข้า)','CONDOROOM.testWarp(2)')+B('🏠 ห้อง LV3 (ทะลุเข้า)','CONDOROOM.testWarp(3)')+B('🔓 ปลดล็อคทุกห้อง','CONDOROOM.unlockAll()')+B('💸 เก็บค่าเช่าตอนนี้','CONDOROOM.chargeNow()')+B('🚪 ทางเดินคอนโด','TESTX.warp(\'hall\')')+B('🏙️ ถนนคนเดิน','TESTX.warp(\'street\')')+B('🚗 ถนนหน้าโชว์รูม','TESTX.warp(\'carst\')')+B('🏎️ ในโชว์รูม','TESTX.warp(\'showroom\')')+B('🐋 หน้าอควาเรียม','TESTX.warp(\'aqst\')')+B('🌾 ไร่ลุงสมศักดิ์','TESTX.warp(\'farm\')')+B('🌾 ไร่: ให้เมล็ด/ปุ๋ย/เงิน','FARM.test.give()')+B('🌾 ไร่: รีเซ็ตข้อมูล','FARM.test.reset()')+B('🐋 ในอควาเรียม','TESTX.warp(\'aqin\')')+B('♻️ รีเซ็ตเควสอควาเรียม','CEOScene.aq.reset()')+B('♥ สนิทหัวหน้าเซลล์ +100','CARBOSS.test.add(100)')+B('♥ สนิท 500 + เปิดเควสประมูล','CARBOSS.test.aff(500)')+B('🔨 เปิดงานประมูลตอนนี้ (23:00)','CARBOSS.test.window()')+B('♻️ รีเซ็ตหัวหน้าเซลล์','CARBOSS.test.reset()')+B('🚫 ถอนรถประมูลที่ได้','CARBOSS.test.loseAll()')+B('🐠 ให้ปลาทดสอบ (ตู้ปลา)','CEOScene.tank.test()')+B('⚔️ ลูกค้า+คู่แข่งเสนอราคา','BIZ.test.bid()')+B('🆘 คู่แข่งวิกฤต (เหตุการณ์)','BIZ.test.rivalCrisis()')+B('⏩ จำลองคู่แข่ง 30 วัน','BIZ.test.days(30)')+B('📑 ให้งานแรกเลยกำหนด','BIZ.test.fail()')+B('♻️ รีเซ็ตข้อมูลธุรกิจ','BIZ.test.reset()')+B('💎 VIP สนิท +100 ทุกคน','VIPX.test.add(100)')+B('💎 VIP สนิท 500 (ได้คอนแท็ค)','VIPX.test.set(500)')+B('💎 VIP สนิท 1000','VIPX.test.set(1000)')+B('💎 ตั้งหนี้ VIP เลยกำหนด','VIPX.test.late()')+B('♻️ รีเซ็ต VIP','VIPX.test.reset()')+B('🚗 ปลดล็อกรถทุกคัน','CARX.testAll()')+B('💰 +20 ล้านบาท','CARX.testMoney()')+B('🚌 ใช้รถเมล์','CARX.use(null)')+B('🚗 ใช้ Hilux (Common)','CARX.testPick(\'hilux\')')+B('🚘 ใช้ M4 (Legends)','CARX.testPick(\'m4\')')+B('🏎️ ใช้ Lambo (Mythic)','CARX.testPick(\'lambo\')')+B('🏎️ ใช้ Ferrari (Mythic)','CARX.testPick(\'ferrari\')')+B('🏖️ ทะเล','TESTX.warp(\'beach\')')+
  B('🛕 วัด (พุทธ)','TESTX.warp(\'temple\')')+B('⛪ โบสถ์ (คริสต์)','TESTX.warp(\'church\')')+B('🕌 มัสยิด (อิสลาม)','TESTX.warp(\'mosque\')')+
  B('⛪ ภายในโบสถ์','TESTX.warp(\'church_in\')')+B('🕌 ภายในมัสยิด','TESTX.warp(\'mosque_in\')')+
 '</div>'+
 '<h3>🎬 โหมดฉากจบทั้งหมด (ENDINGS · Test)</h3><small>คัตซีน/หน้าจอเป็นแบบพรีวิว: ไม่เปลี่ยนเซฟ เงิน ชื่อเสียง หรือสถานะเควส</small><div class="testGrid">'+
  B('💀 ล้มละลาย — BAD ENDING (คัตซีน)','TESTX.badBankrupt()','wide')+
  B('🐉 Yakuza BAD · คัตซีน','TESTX.ykCin(\'BAD\')')+B('🐉 Yakuza BAD · หน้าจอ','TESTX.ykScr(\'BAD\')')+
  B('🐉 Yakuza TRUE · คัตซีน','TESTX.ykCin(\'TRUE\')')+B('🐉 Yakuza TRUE · หน้าจอสรุป','TESTX.ykScr(\'TRUE\')')+
  B('👻 HORROR ENDING · คัตซีน 3 ผี','TESTX.hxCin()')+B('👻 HORROR ENDING · หน้าจอจบ','TESTX.hxScr()')+
 '</div>'+
 '<h3>👻 HORROR ENDING — ตัวนับ</h3><small>'+hs+'</small><div class="testGrid" id="tx1hx">'+
  B('ตั้ง 0','TESTX.hxSet(0)')+B('ตั้ง 25','TESTX.hxSet(25)')+B('ตั้ง 49','TESTX.hxSet(49)')+
  B('+1 ผีเดิม','TESTX.hxCatch(\'classic\')')+B('+1 ผีสาวกิโมโน','TESTX.hxCatch(\'girl\')')+B('+1 ซอมบี้','TESTX.hxCatch(\'zombie\')')+
  B('▶ ครบ 50 → เล่นฉากจบจริงทันที (เก็บสถานะ/เกมจบจริง)','TESTX.hxReal()','wide')+
  B('👻 เรียกผีจริง (ผีเดิม) ให้ไล่จับ','TESTX.hxGhost(\'classic\')')+B('🌸 ผีสาว','TESTX.hxGhost(\'girl\')')+B('🧟 ซอมบี้','TESTX.hxGhost(\'zombie\')')+
 '</div>'+
 '<h3>🐉 YAKUZA ENDING — ภารกิจลับ</h3><small>'+ys+'</small><div class="testGrid">'+
  B('ตั้งความสนิทริวจิ = 1000 (ปลดล็อก)','TESTX.ykUnlock()')+B('เปิดข้อเสนอ/ภารกิจ','TESTX.ykOffer()')+B('รีเซ็ตภารกิจลับ','TESTX.ykReset()')+
 '</div>'+
 '<h3>📱 มือถือ · 🛐 วันพิเศษ · 👔 ชุด</h3><div class="testGrid">'+
  B('📱 ได้มือถือ (ฟรี)','TESTX.phone()')+B('📱 ถอนมือถือ','TESTX.phoneOff()')+
  B('📅 วันอาทิตย์ (โบสถ์)','TESTX.day(7,\'อาทิตย์\')')+B('📅 วันพระ (วัด)','TESTX.day(8,\'วันพระ\')')+B('📅 วันศุกร์ (มัสยิด)','TESTX.day(5,\'ศุกร์\')')+
  B('👔 เปิดตู้เสื้อผ้า','TESTX.wardrobe()')+B('👔 ปลดล็อกชุดยากูซ่า','TESTX.outfitUnlock()')+
 '</div></div>';
}
function refresh(){const el=$('tx1');if(!el)return;const t=document.createElement('div');t.innerHTML=html();el.replaceWith(t.firstChild)}
function inject(){
 const m=$('testModal');if(!m)return;const pn=m.querySelector('.testPanel');if(!pn||$('tx1'))return;
 const g=pn.querySelector('.testGrid');
 const t=document.createElement('div');t.innerHTML=html();
 if(g&&g.parentNode===pn)g.insertAdjacentElement('afterend',t.firstChild);else pn.appendChild(t.firstChild);
}
function wrap(){
 if(wrap.done)return;
 try{if(typeof A!=='object'||!A||typeof A.testOpen!=='function')return}catch(e){return}
 wrap.done=1;
 const o=A.testOpen;
 A.testOpen=function(){const r=o.apply(this,arguments);try{inject()}catch(e){console.error('[test extras]',e)}return r};
}
const iv=setInterval(()=>{wrap();if(wrap.done)clearInterval(iv)},300);
window.TESTX_INJECT=inject;
})();
