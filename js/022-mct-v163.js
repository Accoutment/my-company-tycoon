(function(){
var css=document.createElement('style');css.textContent='#sceneMenuBtn{display:none;position:fixed;z-index:190;min-height:34px;padding:3px 12px;background:#e0a82e;color:#1a1a22;border:2px solid #ffd45a;border-radius:8px;font:700 14px inherit;font-family:inherit;cursor:pointer;touch-action:manipulation;box-shadow:0 2px 0 #8a6414}#sceneMenuBtn:active{transform:translateY(1px)}';
document.head.appendChild(css);
function init(){var sc=document.getElementById('ceoScene');if(!sc||!document.getElementById('ceoSceneBackBtn'))return false;
 if(document.getElementById('sceneMenuBtn'))return true;
 var b=document.createElement('button');b.id='sceneMenuBtn';b.type='button';b.textContent='☰ เมนู';
 b.addEventListener('click',function(e){e.stopPropagation();try{UI.menu(1)}catch(_){}});document.body.appendChild(b);return true}
function place(){var b=document.getElementById('sceneMenuBtn'),bb=document.getElementById('ceoSceneBackBtn'),sc=document.getElementById('ceoScene');if(!b||!bb||!sc)return;
 var on=sc.classList.contains('show'),ch=document.getElementById('ceoSceneChoices'),m=document.getElementById('menu');
 if(m)m.style.zIndex=on?'200':'';
 if(!on||(ch&&!ch.hidden)||(m&&!m.hidden)){b.style.display='none';return}
 var r=bb.getBoundingClientRect();if(!r.width){b.style.display='none';return}
 b.style.display='block';b.style.left=(r.right+8)+'px';b.style.top=r.top+'px';b.style.height=r.height+'px'}
var t=setInterval(function(){if(init()){clearInterval(t);setInterval(place,250)}},300)})();