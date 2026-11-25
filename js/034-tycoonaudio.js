
/* ===== v29 AUDIO DIRECTOR: explicit unlock + separate scene/cutscene soundtracks ===== */
(function(){
 'use strict';
 var unlocked=false, music=null, ambience=null, cut=null, foot=null;
 var activeScene='', activeCut='', lastStep=0, lastPos=null, lastAmb='';
 var musicVol=.25, ambVol=.07, cutVol=.18, footVol=.12;
 var $=function(id){return document.getElementById(id)};
 function audio(src,loop){
  var a=new Audio(src);a.preload='auto';a.loop=!!loop;a.volume=0;a.setAttribute('playsinline','');return a;
 }
 music=audio('assets/audio/7b5c9cdb17fa.mp3',true);
 foot=audio('assets/audio/569feb00b4f1.mp3',false);
 var ambientFiles={office:'assets/audio/2f1e2b73f507.mp3',beach:'assets/audio/3142b48045b2.mp3',condo:'assets/audio/b0d93e026c66.mp3'};
 var cutFiles={intro:'assets/audio/bd1acc5dac38.mp3',arrival:'assets/audio/92f29ef55370.mp3',mystery:'assets/audio/a08d10a90937.mp3',badending:'assets/audio/855026fe4195.mp3'};
 function playSafe(a){
  if(!a||!unlocked)return;
  var p=a.play();
  if(p&&p.then)p.then(function(){var b=$('audioUnlock');if(b){b.classList.add('ready');b.textContent='🔊 เปิดเสียงแล้ว';b.style.display='none'}}).catch(function(){setStatus('⚠️ เสียงถูกเบราว์เซอร์บล็อก · แตะหน้าจอหนึ่งครั้งเพื่อเปิดเสียง')});
 }
 function setStatus(t){var b=$('audioUnlock');if(b)b.textContent=t}
 function pause(a){if(a){try{a.pause()}catch(e){}}}
 function setLoop(which,src,vol){
  if(!unlocked)return;
  if(!which||which.dataset.src!==src){
   if(which){pause(which);which.removeAttribute('src');which.load()}
   which=audio(src,true);which.dataset.src=src;
   if(src.indexOf('ambience_')===0){ambience=which}else{music=which}
  }
  which.volume=vol;playSafe(which);
  return which;
 }
 function playMusic(){
  if(!unlocked||!music)return;
  music.volume=activeCut?musicVol*.22:musicVol;
  playSafe(music);
 }
 function sceneName(){
  var sc=$('ceoScene');
  if(sc&&sc.classList.contains('show')){
   var title=$('ceoSceneTitle');
   if(title&&/ทะเล|ชายหาด|beach/i.test(title.textContent))return 'beach';
   if(title&&/คอนโด|condo/i.test(title.textContent))return 'condo';
   if(title&&/NICECLUB|FOREST RIVER|DEEP FOREST|MINING CAVE/.test(title.textContent))return 'club';   // [NICECLUB] ใช้เสียงสังเคราะห์ของร้านเอง
   if($('ceoSceneChoices')&&!$('ceoSceneChoices').hidden)return 'condo';
  }
  return 'office';
 }
 function updateScene(){
  if(!unlocked||activeCut)return;
  var name=sceneName();
  if(name==='club'){activeScene=name;if(ambience){pause(ambience);ambience=null}if(music)music.volume=musicVol*.12;return}
  if(activeScene==='club'&&music){music.volume=musicVol;activeScene=''}
  if(name===activeScene&&ambience&&!ambience.paused)return;
  activeScene=name;
  var src=ambientFiles[name];
  if(ambience){pause(ambience);ambience=null}
  ambience=audio(src,true);ambience.dataset.src=src;ambience.volume=ambVol;playSafe(ambience);
 }
 function startCut(kind){
  activeCut=kind;
  if(!unlocked)return;
  if(ambience){pause(ambience);ambience=null}
  if(cut){pause(cut);cut=null}
  var src=cutFiles[kind];if(!src)return;
  cut=audio(src,false);cut.volume=cutVol;playSafe(cut);
  if(music){music.volume=musicVol*.18;playSafe(music)}
  cut.onended=function(){stopCut()};
 }
 function stopCut(){
  activeCut='';
  if(cut){pause(cut);cut=null}
  if(music&&unlocked){music.volume=musicVol;playSafe(music)}
  updateScene();
 }
 function unlock(){
  if(!unlocked){
   unlocked=true;
   setStatus('🔊 เปิดเสียงแล้ว');
   var b=$('audioUnlock');if(b)b.classList.add('ready');
  }
  // Must be called directly inside a real click/tap/key gesture for browser autoplay policies.
  if(music){music.volume=activeCut?musicVol*.18:musicVol;playSafe(music)}
  if(activeCut)startCut(activeCut);else updateScene();
  if(ambience)ambience.volume=ambVol;
 }
 function step(){
  if(!unlocked||!foot)return;
  var now=performance.now();if(now-lastStep<310)return;lastStep=now;
  try{foot.currentTime=0;foot.volume=footVol;playSafe(foot)}catch(e){}
 }
 function addControls(){
  var pane=$('sysPane');if(!pane||$('audioSettings'))return;
  var card=document.createElement('div');card.className='c';card.id='audioSettings';
  card.innerHTML='<b>🎧 ระบบเสียง</b>'+
   '<div class="sh" style="align-items:center"><label for="vMusic">🎵 เพลงพื้นหลัง</label><input id="vMusic" type="range" min="0" max="35" value="25" style="flex:1;min-width:90px"><b id="vMusicTxt">25%</b></div>'+
   '<div class="sh" style="align-items:center"><label for="vAmb">🌊 บรรยากาศฉาก</label><input id="vAmb" type="range" min="0" max="60" value="7" style="flex:1;min-width:90px"><b id="vAmbTxt">7%</b></div>'+
   '<div class="sh" style="align-items:center"><label for="vCut">🎬 เสียงคัตซีน</label><input id="vCut" type="range" min="0" max="70" value="18" style="flex:1;min-width:90px"><b id="vCutTxt">18%</b></div>'+
   '<div class="sh"><button class="btn" id="testSound">▶ ทดสอบเสียง</button><button class="btn" id="muteAll">🔇 ปิดเสียงทั้งหมด</button></div>'+
   '<small>เพลงพื้นหลังดังเด่นกว่าเสียงบรรยากาศ · เสียงทั้งหมดฝังอยู่ในไฟล์ HTML นี้แล้ว · หากยังไม่ได้ยิน ให้กดปุ่ม “แตะเพื่อเปิดเสียงเกม” มุมขวาบนหนึ่งครั้ง</small>';
  pane.appendChild(card);
  function range(id,txt,fn){$(id).addEventListener('input',function(){var v=Number(this.value)/100;$(txt).textContent=this.value+'%';fn(v)})}
  range('vMusic','vMusicTxt',function(v){musicVol=v;if(music)music.volume=activeCut?v*.18:v});
  range('vAmb','vAmbTxt',function(v){ambVol=v;if(ambience)ambience.volume=v});
  range('vCut','vCutTxt',function(v){cutVol=v;if(cut)cut.volume=v});
  $('testSound').onclick=function(){unlock();step()};
  $('muteAll').onclick=function(){musicVol=ambVol=cutVol=footVol=0;if(music)music.volume=0;if(ambience)ambience.volume=0;if(cut)cut.volume=0;
   ['vMusic','vAmb','vCut'].forEach(function(id){$(id).value=0});
   ['vMusicTxt','vAmbTxt','vCutTxt'].forEach(function(id){$(id).textContent='0%'})};
 }
 function wrapGlobal(name,kind){
  var original=window[name];if(typeof original!=='function'||original.__audioWrapped)return;
  var wrapped=function(){
   if(!window.CUT||!CUT.on){startCut(kind)}
   var result=original.apply(this,arguments);
   if(!unlocked){} 
   return result;
  };
  wrapped.__audioWrapped=true;window[name]=wrapped;
 }
 function watchCutsceneRemoval(){
  var root=document.body;
  if(!root||!window.MutationObserver)return;
  var mo=new MutationObserver(function(){
   if(activeCut&&['intro','arrival','mystery'].indexOf(activeCut)>=0&&!$('teeCut'))stopCut();
   if(activeCut==='badending'&&!$('badEndingCut'))stopCut();
  });
  mo.observe(root,{childList:true,subtree:true});
 }
 function init(){
  var btn=$('audioUnlock');
  if(btn)btn.addEventListener('click',function(e){e.preventDefault();unlock()});
  // Any first click/tap/keypress can unlock audio, not only the tiny sound button.
  document.addEventListener('pointerdown',unlock,true);
  var joy=$('joy');if(joy)joy.addEventListener('pointerdown',step,{passive:true});
  document.addEventListener('keydown',function(e){
   if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D'].indexOf(e.key)>=0)step();
   unlock();
  },true);
  wrapGlobal('playIntro','intro');
  wrapGlobal('playTeeCutscene','arrival');
  wrapGlobal('playMysteryCutscene','mystery');
  if(window.BAD&&typeof BAD.play==='function'){
   var bp=BAD.play,be=BAD.end;
   BAD.play=function(){startCut('badending');var before=Array.prototype.slice.call(document.body.children);var r=bp.apply(this,arguments);var added=Array.prototype.slice.call(document.body.children).filter(function(n){return before.indexOf(n)<0});if(added.length)added[added.length-1].id='badEndingCut';return r};
   BAD.end=function(){var r=be.apply(this,arguments);stopCut();return r};
  }
  watchCutsceneRemoval();
  // Attempt title-screen audio immediately; if the browser blocks autoplay,
  // the existing pointer/key gesture handlers above retry it on first interaction.
  try{unlock()}catch(e){}
  var tick=0;
  setInterval(function(){
   addControls();
   if(!activeCut&&unlocked)updateScene();
   // Footsteps in office from real player displacement.
   try{
    var sc=$('ceoScene'),isOutside=sc&&sc.classList.contains('show');
    if(!isOutside&&window.S&&S.pl){
     var p=S.pl;
     if(lastPos){var d=Math.hypot(p.x-lastPos.x,p.y-lastPos.y);if(d>1.0)step()}
     lastPos={x:p.x,y:p.y};
    }else lastPos=null;
   }catch(e){}
   tick++;
  },180);
  // If a cutscene is active before the first click, retain its soundtrack selection.
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
 window.TycoonAudio={unlock:unlock,cutscene:startCut,stopCut:stopCut,step:step};
})();
