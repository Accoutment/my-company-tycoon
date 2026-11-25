
(function(){
 const root=document.documentElement;
 const intro=document.getElementById('mctIntro');
 if(!intro){root.classList.remove('mct-booting');return;}
 const video=document.getElementById('mctIntroVideo');
 const sound=document.getElementById('mctIntroSound');
 // Existing direct-entry flow remains supported, but never leave the boot curtain active.
 try{if(sessionStorage.getItem('mct_skip_lobby')==='1'){intro.remove();root.classList.remove('mct-booting');return;}}catch(e){}
 let finished=false,started=false;
 function finish(){
  if(finished)return;finished=true;
  try{video.pause();}catch(e){}
  intro.classList.add('mctIntroOut');
  setTimeout(()=>{intro.remove();root.classList.remove('mct-booting');},560);
 }
 function startFromBeginning(){
  if(finished||started)return;
  started=true;
  try{video.currentTime=0;}catch(e){}
  video.classList.add('mct-video-ready');
  video.muted=false;video.volume=1;
  const p=video.play();
  if(p&&p.catch)p.catch(function(){
   if(finished)return;
   video.muted=true;
   const mutedPlay=video.play();
   sound.hidden=false;
   if(mutedPlay&&mutedPlay.catch)mutedPlay.catch(finish);
  });
 }
 document.getElementById('mctIntroSkip').addEventListener('click',finish);
 video.addEventListener('ended',finish,{once:true});
 video.addEventListener('error',finish,{once:true});
 sound.addEventListener('click',function(){
  video.muted=false;video.volume=1;
  const p=video.play();if(p&&p.catch)p.catch(()=>{});
  sound.hidden=true;
 });
 // Never rely on autoplay timing or a remembered playback position: wait for decoded data,
 // explicitly rewind, then start the splash while the game remains covered in black.
 video.pause();
 video.addEventListener('loadeddata',startFromBeginning,{once:true});
 video.addEventListener('canplay',startFromBeginning,{once:true});
 try{video.load();}catch(e){}
 if(video.readyState>=2)startFromBeginning();
 // Keep keyboard skip behavior local to the splash only.
 intro.addEventListener('keydown',function(e){if(e.key==='Escape')finish();});
})();
