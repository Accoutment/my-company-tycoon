
(function(){
 if(window.gameConfirm&&window.gamePrompt)return;
 const style=document.createElement('style');
 style.textContent=`
 #mctGameDialog{position:fixed;inset:0;z-index:2147483000;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(5,8,20,.78);backdrop-filter:blur(3px);font-family:system-ui,sans-serif}
 #mctGameDialog.show{display:flex;animation:mctDlgFade .16s ease-out}
 #mctGameDialog .mct-panel{position:relative;box-sizing:border-box;width:min(760px,96vw);aspect-ratio:1672/941;padding:0;background:transparent url(assets/img/e7530b0e7770.png) center/100% 100% no-repeat;border:0;border-radius:0;box-shadow:none;color:#f8edcf;transform:translateY(8px);animation:mctDlgPop .2s ease-out forwards;overflow:visible}
 #mctGameDialog .mct-panel:before{display:none}
 #mctGameDialog .mct-top{position:absolute;left:16%;right:15%;top:18%;display:flex;align-items:center;gap:10px;margin:0;padding:0;border:0;min-height:8%;z-index:1}
 #mctGameDialog .mct-icon{width:clamp(25px,4vw,38px);height:clamp(25px,4vw,38px);flex:0 0 auto;display:grid;place-items:center;border-radius:9px;background:linear-gradient(#f5c45b,#d98a2c);color:#26345d;font-size:clamp(16px,2.4vw,23px);box-shadow:0 3px 0 #8b541d}
 #mctGameDialog .mct-title{font-size:clamp(14px,2.3vw,19px);font-weight:850;color:#ffda83;text-shadow:0 2px #49301e}
 #mctGameDialog .mct-message{position:absolute;left:17%;right:17%;top:32%;max-height:28%;overflow:auto;font-size:clamp(11px,1.7vw,14px);line-height:1.65;color:#edf1ff;white-space:pre-wrap;margin:0;text-shadow:0 1px 2px #080d2a}
 #mctGameDialog .mct-input{position:absolute;left:20%;width:60%;top:61%;box-sizing:border-box;padding:8px 11px;margin:0;border:2px solid #6577a6;border-radius:8px;background:#0d1530;color:#fff;font:600 14px system-ui;outline:none}
 #mctGameDialog .mct-input:focus{border-color:#ffd36e;box-shadow:0 0 0 3px #ffd36e33}
 #mctGameDialog .mct-actions{position:absolute;left:22%;right:22%;bottom:8%;height:13%;display:flex;justify-content:space-between;align-items:center;gap:5%;z-index:2}
 #mctGameDialog .mct-btn{box-sizing:border-box;flex:1;min-width:0;height:100%;padding:5px 8px;border-radius:10px;border:0;color:#f5f2e8;background:transparent;font-size:clamp(10px,1.5vw,14px);font-weight:850;cursor:pointer;text-shadow:0 1px 2px #07102b;box-shadow:none}
 #mctGameDialog .mct-btn.primary{border:0;color:#34223a;background:transparent;text-shadow:0 1px 1px #fff4c5}
 #mctGameDialog .mct-btn:active{transform:translateY(2px);filter:brightness(.9);box-shadow:none}
 @media(max-width:480px){#mctGameDialog .mct-panel{width:98vw}#mctGameDialog .mct-title{font-size:13px}#mctGameDialog .mct-message{font-size:10px}#mctGameDialog .mct-btn{font-size:10px}#mctGameDialog .mct-input{font-size:11px;padding:6px}}
 @keyframes mctDlgFade{from{opacity:0}to{opacity:1}}
 @keyframes mctDlgPop{to{transform:translateY(0)}}
 @media(max-width:480px){#mctGameDialog .mct-panel{padding:21px 17px 17px}#mctGameDialog .mct-title{font-size:16px}#mctGameDialog .mct-btn{min-width:0;flex:1}}
 `;
 document.head.appendChild(style);
 const root=document.createElement('div');root.id='mctGameDialog';root.innerHTML='<div class="mct-panel" role="dialog" aria-modal="true"><div class="mct-top"><div class="mct-icon" id="mctDlgIcon">?</div><div class="mct-title" id="mctDlgTitle">ยืนยัน</div></div><div class="mct-message" id="mctDlgMessage"></div><input class="mct-input" id="mctDlgInput" style="display:none"><div class="mct-actions"><button class="mct-btn" id="mctDlgCancel">ยกเลิก</button><button class="mct-btn primary" id="mctDlgOK">ยืนยัน</button></div></div>';
 document.body.appendChild(root);
 const $=id=>document.getElementById(id);
 let finish=null;
 function close(value){root.classList.remove('show');root.style.display='none';document.removeEventListener('keydown',keys,true);const f=finish;finish=null;if(f)f(value)}
 function keys(e){if(e.key==='Escape'){e.preventDefault();close(null)}else if(e.key==='Enter'&&$('mctDlgInput').style.display!=='none'){e.preventDefault();close($('mctDlgInput').value)}}
 function open({title='ยืนยัน',message='',icon='?',input=null,ok='ยืนยัน',cancel='ยกเลิก'}){
  return new Promise(resolve=>{
   finish=resolve;$('mctDlgTitle').textContent=title;$('mctDlgMessage').textContent=message;$('mctDlgIcon').textContent=icon;
   const inp=$('mctDlgInput');inp.style.display=input===null?'none':'block';inp.value=input===null?'':input;
   $('mctDlgOK').textContent=ok;$('mctDlgCancel').textContent=cancel;
   $('mctDlgCancel').onclick=()=>close(null);
   $('mctDlgOK').onclick=()=>close(input===null?true:inp.value);
   root.style.display='flex';requestAnimationFrame(()=>root.classList.add('show'));
   document.addEventListener('keydown',keys,true);
   setTimeout(()=>input===null?$('mctDlgOK').focus():inp.focus(),30);
  });
 }
 window.gameConfirm=(message,title='ยืนยันการทำรายการ')=>open({title,message,icon:'?',ok:'ตกลง',cancel:'ยกเลิก'}).then(v=>v===true);
 window.gamePrompt=(message,value='',title='กรอกข้อมูล')=>open({title,message,icon:'✎',input:value,ok:'ตกลง',cancel:'ยกเลิก'});
})();
