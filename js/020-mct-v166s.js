(function(){
function mk(){var p=document.querySelector('#menu .mPanel');if(!p)return;
 if(!document.getElementById('v166a')){var a=document.createElement('span');a.id='v166a';a.className='v166chip';a.style.left='67.9%';a.style.width='11.7%';p.appendChild(a);
  var b=document.createElement('span');b.id='v166b';b.className='v166chip';b.style.left='80.7%';b.style.width='11.5%';p.appendChild(b)}
 var x=p.querySelector('.mClose');if(x&&!x.getAttribute('aria-label'))x.setAttribute('aria-label','ปิดเมนู')}
function upd(){var m=document.getElementById('menu');if(!m||m.hidden)return;mk();
 try{var a=document.getElementById('v166a'),b=document.getElementById('v166b');
  var hh=Math.floor(S.t/60),mm=Math.floor(S.t%60);
  a.textContent='วัน '+S.day+' · '+String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0');
  b.textContent=M(S.money);b.style.color=S.money<0?'#ff7b7b':''}catch(_){}}
setInterval(upd,400);document.addEventListener('DOMContentLoaded',mk)})();