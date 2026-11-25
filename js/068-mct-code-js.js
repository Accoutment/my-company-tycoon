
/* =====================================================================
   CODE SYSTEM · โค้ดรับไอเท็มพิเศษ (โมดูลแยก — แทนปุ่ม Co-op เดิม)
   - เพิ่ม/แก้โค้ดที่ตาราง CODES ด้านล่างเท่านั้น (ตัวพิมพ์ใหญ่ ไม่มีเว้นวรรค)
   - ใส่โค้ดที่หน้าแรก → ระบบเก็บเข้าคิว → มอบของเมื่อเข้าเกม (1 โค้ด / 1 เซฟ รับได้ครั้งเดียว)
   - ผลการใช้โค้ดเก็บใน S.codes.used ไปกับ Save เดิม
   ===================================================================== */
(function(){
'use strict';
const QKEY='mct_code_queue';
const CODES={
 // ตารางโค้ด (ว่างไว้ให้เพิ่มเอง) — รูปแบบ:
 // MYCODE:{name:'ชื่อโค้ด',give:{money:1000,rep:5,fish:{mgold:1},outfit:'dragon'}},
 // give รองรับ: money, rep, fish:{รหัสปลา:จำนวน}, outfit:'dragon'
};
const norm=c=>String(c||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const ls={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const queue=()=>{try{const q=JSON.parse(ls.get(QKEY)||'[]');return Array.isArray(q)?q:[]}catch(e){return[]}};
const setQueue=q=>ls.set(QKEY,JSON.stringify(q));
function usedInSave(code){try{const d=JSON.parse(ls.get('mct2')||'null');return !!(d&&d.codes&&d.codes.used&&d.codes.used[code])}catch(e){return false}}
function submit(raw){
 if(norm(raw)==='SUSHI1530'&&window.REI)return REI.unlockSkin();
 if(norm(raw)==='AUMMARIN'){const was=window.DEVLOCK&&DEVLOCK.ok();if(window.DEVLOCK)DEVLOCK.unlock();return{ok:true,msg:was?'🔓 ปลดล็อกระบบนักพัฒนาไว้แล้ว':'🎉 ยินดีด้วย! ปลดล็อคระบบนักพัฒนาแล้ว'}}
 const c=norm(raw);
 if(!c)return{ok:false,msg:'กรุณาใส่โค้ด'};
 if(!CODES[c])return{ok:false,msg:'❌ โค้ดไม่ถูกต้อง'};
 if(usedInSave(c))return{ok:false,msg:'ℹ️ เซฟปัจจุบันใช้โค้ดนี้ไปแล้ว'};
 const q=queue();if(q.includes(c))return{ok:false,msg:'ℹ️ โค้ดนี้อยู่ในคิวแล้ว — เริ่ม/เล่นต่อเพื่อรับของ'};
 q.push(c);setQueue(q);
 return{ok:true,msg:'✅ รับโค้ด "'+CODES[c].name+'" แล้ว! กด เริ่มเล่น / เล่นต่อ เพื่อรับของ'};
}
function giveText(g){
 const t=[];
 if(g.money)t.push('เงิน +'+g.money.toLocaleString());
 if(g.rep)t.push('ชื่อเสียง +'+g.rep);
 if(g.fish)Object.keys(g.fish).forEach(id=>{try{const f=CEOScene.fishList().find(x=>x.id===id);t.push((f?f.n:id)+' ×'+g.fish[id])}catch(e){t.push(id)}});
 if(g.outfit)t.push('ปลดล็อกชุดมังกรทอง');
 return t.join(' · ');
}
function apply(c){
 const d=CODES[c];if(!d)return null;
 if(!S.codes||typeof S.codes!=='object')S.codes={};if(!S.codes.used)S.codes.used={};
 if(S.codes.used[c])return'ℹ️ โค้ด '+c+' ใช้ไปแล้วในเซฟนี้';
 const g=d.give;let note='';
 if(g.money)S.money+=g.money;
 if(g.rep&&typeof S.rep==='number')S.rep+=g.rep;
 if(g.outfit){S.codeUnlocks=S.codeUnlocks||{};S.codeUnlocks[g.outfit]=1}
 if(g.fish){let miss=0;Object.keys(g.fish).forEach(id=>{const a=CEOScene.testGive(id,g.fish[id]);miss+=g.fish[id]-a});if(miss)note=' (กระเป๋าเต็ม ใส่ไม่ได้ '+miss+' ชิ้น — เคลียร์กระเป๋าแล้วใช้โค้ดใหม่ได้)'}
 if(note){return'⚠️ โค้ด '+c+': กระเป๋าเต็ม ยังไม่ได้รับของครบ — เคลียร์ช่องว่างแล้วกรอกโค้ดอีกครั้ง'}
 S.codes.used[c]=Date.now();
 try{hud()}catch(e){}try{save(1)}catch(e){}
 return'🎁 '+d.name+' — '+giveText(g);
}
function tick(){
 try{
  const q=queue();if(!q.length)return;
  if(typeof S!=='object'||!S||!Array.isArray(S.emp)||typeof CEOScene==='undefined')return;
  const lb=document.getElementById('lobby');if(lb&&lb.style.display!=='none')return;
  let rest=[];const msgs=[];
  q.forEach(c=>{const m=apply(c);if(m)msgs.push(m);if(m&&m.indexOf('⚠️')===0)rest.push(c)});
  setQueue(rest);
  msgs.forEach((m,i)=>setTimeout(()=>{try{toast(m)}catch(e){}},1200+i*1800));
 }catch(e){console.error('[code]',e)}
}
setInterval(tick,1000);
window.CODE={submit,apply,CODES,queue,list:()=>Object.keys(CODES)};
})();

