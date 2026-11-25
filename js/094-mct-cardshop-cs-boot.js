
/* CARD SHOP — bootstrap: ผูกฐานข้อมูล/เซฟของเกมเดิมเข้ากับโมดูล */
(function(root){
 const C=root.CARDSHOP;if(!C)return;
 C.setEnv({
  getS:()=>{try{return typeof S!=='undefined'?S:null}catch(e){return null}},
  save:()=>{try{save(1)}catch(e){}},
  day:()=>{try{return S.day||1}catch(e){return 1}},
  now:()=>Date.now()
 });
 // เปิดแอปมาแล้วมีแมตช์ค้าง (ปิดเกมกลางแมตช์) → ตัดสินเป็นแพ้ครั้งเดียว ไม่สุ่ม/จ่ายซ้ำ
 const poll=setInterval(()=>{try{
  if(typeof S==='undefined'||!S)return;clearInterval(poll);
  const c=C.state();if(c&&c.battle&&c.battle.active&&!(root.CS_UI&&root.CS_UI.battleActive&&root.CS_UI.battleActive())){/* จะถูกตัดสินตอนเข้าฉากร้าน */}
 }catch(e){}},1500);
 // ซ่อนปุ่มลอยเมื่อไม่ได้อยู่ในฉากร้าน
 setInterval(()=>{try{const b=document.getElementById('csSceneBtns');if(!b)return;const x=root.__CEO_CTX;const on=x&&x.st&&x.st.active&&x.st.place==='cardin'&&!x.st.trans;if(!on)b.classList.remove('on');
  if(!x||!x.st||!x.st.active||(x.st.place!=='cardin'&&x.st.place!=='cardst')){const s=root.CARDSHOP_SCENE;if(s&&s.SC&&s.SC.sitting){s.reset()}}
 // ฉากถูกปิดจากระบบอื่นของเกม (เช่น เหตุการณ์บังคับกลับบริษัท) → ปิดหน้าต่างของร้าน/ตัดสินแมตช์ค้างกันเงินหาย
  const cx=root.__CEO_CTX;if(cx&&cx.st&&!cx.st.active){const U=root.CS_UI;if(U){if(U.battleActive&&U.battleActive())U.forceCloseBattle();['csShop','csCol','csDsp','csOpen','csLobby','csRes','csGa','csGr','csBb','csCf','csAuc','csSp','csAh'].forEach(id=>{const e=document.getElementById(id);if(e&&!e.hidden){e.hidden=true;if(id==='csOpen'){try{C.clearPending()}catch(_){}}}})}}
 }catch(e){}},400);
})(window);

