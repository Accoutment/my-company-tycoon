/* ===== ชุดการ์ดใหม่ 3 แพ็ค (18 ใบ): Sailor Moon / Miraculous Ladybug / Sailor Moon × Miraculous =====
 * เพิ่มอย่างเดียว ใช้ Registry เดิม (FACTIONS/CARDS/addPack) เหมือน 080 — ไม่ซ้ำ: id มีแล้วจะข้าม
 * แต่ละแถว: [ชื่อ, Tier(1–6), ความสามารถ] ลำดับในอาร์เรย์ = No.01–06 ตรงกับภาพ (คีย์ภาพ <fac>_<ลำดับ>)
 * UR=Tier6, SSR=Tier5/4, SR=Tier3/2, R=Tier1 · ภาพอยู่ใน 119-mct-cardshop-assets-moon.js (โหลดก่อนไฟล์นี้) */
(function(){
const C=window.CARDSHOP;if(!C||!C.GACHA)return;const G=C.GACHA;
const AT=[0,900,1500,2300,3200,4300,5600],DF=[0,800,1400,2100,3000,4000,5200];
const NEW=[
 {id:'smoon',name:'Sailor Moon',th:'เซเลอร์มูน',color:'#ff6fd0',machine:'celestial',cards:[
  ['เซเลอร์มูน',6,'พลังแห่งความรักและความยุติธรรม: ATK/DEF ทีม +1,100 และฟื้นฟู HP ทีม +300'],
  ['เซเลอร์เมอร์คิวรี',5,'สติปัญญาและการวิเคราะห์: ศัตรู ATK -300 และ DEF +600 ให้ตัวเอง'],
  ['เซเลอร์มาร์ส',4,'ไฟแห่งจิตวิญญาณ: ATK +900 โจมตีต่อเนื่อง'],
  ['เซเลอร์จูปิเตอร์',3,'ความแข็งแกร่งช่วยปกป้องทุกคน: DEF +500 ให้การ์ดฝ่ายเรา'],
  ['เซเลอร์วีนัส',2,'พลังแห่งความรัก: ATK +400 และฟื้นฟู HP ตัวเอง +200'],
  ['เซเลอร์จิบิมูน และลูน่า',1,'แม้จะตัวเล็กแต่ก็มีหัวใจที่กล้าหาญ: DEF +250']]},
 {id:'mira',name:'Miraculous Ladybug',th:'ปาฏิหาริย์เลดี้บัค',color:'#e8344a',machine:'lucky',cards:[
  ['เลดี้บัค',6,'พลังแห่งความกล้าหาญ: ATK +1,300 และฟื้นฟู HP ทีม +400'],
  ['แคทนัวร์',5,'พลังแห่งแมวดำ: ATK +900 และหลบการโจมตีแรก'],
  ['สองพลังฮีโร่',4,'เต่าทองและแมวดำรวมพลัง: ATK/DEF ทีม +700'],
  ['มารีเนตต์',3,'เด็กสาวธรรมดาที่มีหัวใจสุดพิเศษ: DEF +500 ให้ทีม'],
  ['อาเดรียน',2,'หนุ่มหล่อผู้มีความฝัน: ATK +350 และฟื้นฟู HP ตัวเอง +200'],
  ['ทิกกี้ & ปลาก์',1,'ผู้มอบพลังแห่งเต่าทองและแมวดำ: DEF +250']]},
 {id:'smmira',name:'Sailor Moon × Miraculous',th:'เซเลอร์มูน × ปาฏิหาริย์เลดี้บัค (คอลแล็บพิเศษ)',color:'#c04fff',machine:'dragon',cards:[
  ['เซเลอร์มูน',5,'พลังแห่งดวงจันทร์เพื่อความยุติธรรม: ATK +900 และฟื้นฟู HP ทีม +300'],
  ['เลดี้บัค',4,'ปกป้องเมืองด้วยพลังแห่งความกล้าหาญ: DEF +600 ให้ทีม'],
  ['พลังสองโลก',6,'แสงจันทร์และเต่าทองรวมพลัง: ATK/DEF ทีม +1,400'],
  ['แคทนัวร์',3,'โชคดีนะ เลดี้บั๊ก: ATK +600 โจมตีก่อน'],
  ['เซเลอร์เมอร์คิวรี',2,'สติปัญญาคือพลังของฉัน: ศัตรู ATK -150 และ DEF +300'],
  ['ทิกกี้ & ปลาก์',1,'คู่หูตัวน้อยที่เป็นกำลังใจเสมอ: ฟื้นฟู HP ทีม +250']]}
];
NEW.forEach(S=>{
 if(!C.FAC_BY_ID[S.id]){const f={id:S.id,name:S.name,th:S.th,color:S.color,gacha:true};C.FACTIONS.push(f);C.FAC_BY_ID[S.id]=f}
 S.cards.forEach((r,i)=>{
  const id=S.id+'_'+i;if(C.CARD_BY_ID[id])return;
  const t=r[1];
  const card={id,fac:S.id,idx:i,no:i+1,name:r[0],grade:Math.min(5,t-1),power:AT[t],atk:AT[t],def:DF[t],skill:r[2],tier:t,gt:t,gacha:true,por:true,type:'Character'};
  C.CARDS.push(card);C.CARD_BY_ID[id]=card;
 });
 if(!G.GP_BY_ID[S.id])G.addPack({id:S.id,machine:S.machine,name:S.name.toUpperCase(),th:S.th,pool:[S.id],img:S.id,color:S.color});
});
})();
