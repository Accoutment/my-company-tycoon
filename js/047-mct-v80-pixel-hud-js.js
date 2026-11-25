
(function(){
 'use strict';
 var root=document.getElementById('mctHud');if(!root)return;
 var q=function(s){return root.querySelector(s)};
 var E={d1:q('.d1'),d2:q('.d2'),cal:q('.cal'),tm:q('.tm'),tp:q('.tp'),w1:q('.w1'),w2:q('.w2'),sun:q('.sun'),svg:q('.wsvg'),mv:q('.mv'),delta:q('.mdelta'),coin:q('.coin'),tab:document.getElementById('mctHudTab')};
 var tiles={};[].forEach.call(root.querySelectorAll('.tile'),function(t){tiles[t.dataset.s]=t});
 // ภาพวงกลมบรรยากาศ สลับตามฤดูจริง
 var SCN={"summer": "assets/img/909e56ece25c.webp", "rainy": "assets/img/cb7ded0e7b87.webp", "spring": "assets/img/a4a0c02e593c.webp", "autumn": "assets/img/7ea37cbe5ae3.webp"};
 var scW=q('.scnw'),scI=q('.scn');
 function setScene(se){if(!scW||!scI)return;var k=SCN[se]?se:'summer';if(scW.dataset.s!==k){scW.dataset.s=k;scI.src=SCN[k]}}
 // ช่องไอคอนฤดูหนาวเดิมถูกนำกลับมาใช้เป็นฤดูฝน พร้อมภาพเมฆและหยดฝนใหม่
 if(tiles.wi){var rainTile='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 135"><rect width="144" height="135" rx="10" fill="#263d5b"/><path d="M35 55a24 24 0 0 1 46-9 19 19 0 0 1 28 17H35a15 15 0 0 1 0-8Z" fill="#d9e7f5" stroke="#526b88" stroke-width="5"/><g stroke="#65baff" stroke-width="7" stroke-linecap="round"><path d="M48 82l-8 20M76 82l-8 20M104 82l-8 20"/></g><path d="M15 119h114" stroke="#6f91ad" stroke-width="4"/></svg>';tiles.wi.style.backgroundImage='url(\"data:image/svg+xml;charset=utf-8,'+encodeURIComponent(rainTile)+'\")';tiles.wi.style.backgroundSize='cover';}
 // ---- pixel art ไอคอนสภาพอากาศ (วาดเป็นพิกเซล 16x14) ----
 var PAL={o:'#3d4a66',g:'#9fb3d4',w:'#e8f0fb',b:'#2f7de1',n:'#59b4ff',s:'#ffffff'};
 var CLOUD=['................','......oooo......','....ooggggoo....','...oggwwwwggoo..','..oggwwwwwwggo..','.ooggwwwwwwwggo.','.ogwwwwwwwwwwgo.','.ogwwwwwwwwwwgo.','.oggggggggggggo.','..oooooooooooo..'];
 var RAIN=['...b..b..b..b...','..b..b..b..b....','...b..b..b..b...'];
 var SNOW=['..n...n...n...n.','....n...n...n...','..n...n...n...n.'];
 function rects(rows,y0){var s='';rows.forEach(function(r,y){for(var x=0;x<r.length;x++){var c=r[x];if(c!=='.')s+='<rect x="'+x+'" y="'+(y+y0)+'" width="1" height="1" fill="'+PAL[c]+'"/>'}});return s}
 var ICON={
  rain:'<g>'+rects(CLOUD,0)+'</g><g class="drops">'+rects(RAIN,10)+'</g>',
  leaf:'<g>'+rects(CLOUD,0)+'</g><g fill="#d98b36"><path d="M5 11 Q7 8 11 10 Q10 14 5 15 Q3 13 5 11Z"/><path d="M6 14 L10 10" stroke="#8b4a20" stroke-width=".7"/></g>',
  petal:'<g>'+rects(CLOUD,0)+'</g><g fill="#f2a8c4"><circle cx="5" cy="12" r="1.7"/><circle cx="8" cy="11" r="1.7"/><circle cx="11" cy="12" r="1.7"/><circle cx="8" cy="14" r="1.7"/></g><circle cx="8" cy="12.5" r="1" fill="#ffe08a"/>'
 }
 var WX={summer:['sun','แดดจัด'],rainy:['rain','ฝนตก'],autumn:['leaf','ลมพัด ใบไม้ร่วง'],spring:['petal','อบอุ่น ดอกไม้บาน']};
 function slot(k){k=String(k||'').toLowerCase();if(k==='spring')return'sp';if(k==='summer')return'su';if(k==='rainy')return'wi';if(k==='autumn'||k==='fall')return'au';return'su'}
 var TIPS={sp:'ฤดูใบไม้ผลิ (Spring)',su:'ฤดูร้อน (Summer)',au:'ฤดูใบไม้ร่วง (Autumn)',wi:'ฤดูฝน (Rainy)'};
 // ---- สถานะที่แคชไว้ เพื่ออัปเดตเฉพาะตอนค่าเปลี่ยน ----
 var last={day:null,tm:null,wx:null,season:null};
 var shown=null,target=null,raf=0,fmtM=function(n){try{return M(n)}catch(e){return '$'+Math.round(n).toLocaleString('en-US')}};
 function setText(el,t){if(el.textContent!==t)el.textContent=t}
 function drawMoney(v){var t=fmtM(v);setText(E.mv,t);E.mv.classList.toggle('long',t.length>10);E.mv.classList.toggle('neg',v<0)}
 function tweenTo(v){
  var from=shown,to=v,t0=performance.now(),dur=650;cancelAnimationFrame(raf);
  (function step(now){var k=Math.min(1,(now-t0)/dur),e=1-Math.pow(1-k,3);shown=from+(to-from)*e;drawMoney(shown);if(k<1)raf=requestAnimationFrame(step);else{shown=to;drawMoney(to)}})(t0);
 }
 function popDelta(d){
  if(!d)return;var a=Math.abs(Math.round(d));if(!a)return;
  E.delta.textContent=(d>0?'+':'-')+fmtM(a);E.delta.className='mdelta '+(d>0?'up':'dn');void E.delta.offsetWidth;E.delta.classList.add('go');
  E.coin.classList.remove('pop');void E.coin.offsetWidth;E.coin.classList.add('pop');
 }
 function sync(){
  var s;try{s=S}catch(e){return}
  if(!s||typeof s.day!=='number')return;
  // วันที่ (ใช้สูตรเดียวกับ hud() เดิม: ปี=360 วัน, เดือน=30 วัน)
  if(last.day!==s.day){
   var yd=(typeof YEAR_DAYS==='number'?YEAR_DAYS:360),yr=Math.floor((s.day-1)/yd)+1,mo=Math.floor(((s.day-1)%yd)/30)+1,dm=((s.day-1)%30)+1,wd=(s.day-1)%7;
   var dn=(typeof DAY!=='undefined'&&DAY[wd])||'';
   setText(E.d1,'วันที่ '+dm);setText(E.d2,dn+' · ด.'+mo+' · ปี '+yr+(wd>4?' ★':''));
   E.cal.title='วัน '+s.day+' · ปี '+yr+' เดือน '+mo+' วันที่ '+dm+(wd>4?' (วันหยุด)':'');
   if(last.day!==null){E.cal.classList.remove('flash');void E.cal.offsetWidth;E.cal.classList.add('flash')}
   last.day=s.day;
  }
  // เวลา
  var hh=Math.floor(s.t/60)%24,mm=Math.floor(s.t%60),tk=hh*60+mm;
  if(last.tm!==tk){last.tm=tk;setText(E.tm,String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0'));setText(E.tp,hh<5?'ดึก':hh<12?'เช้า':hh<17?'บ่าย':hh<20?'เย็น':'ค่ำ')}
  // ฤดูกาล + สภาพอากาศ (อ่านจาก currentSeason() ของเกม รวมโหมดทดสอบฤดูกาล)
  var se;try{se=currentSeason()}catch(e){se='summer'}
  if(last.season!==se){
   last.season=se;try{setScene(se)}catch(e){}var sl=slot(se),nm=(typeof SEASON_INFO!=='undefined'&&SEASON_INFO[se]&&SEASON_INFO[se].name)||se;
   for(var k in tiles){tiles[k].classList.toggle('on',k===sl);tiles[k].title=TIPS[k]+(k===sl?' — ฤดูปัจจุบัน: '+nm:'')}
   var w=WX[se]||WX.summer;setText(E.w1,w[1]);setText(E.w2,nm);
   if(w[0]==='sun'){E.sun.removeAttribute('hidden');E.svg.setAttribute('hidden','')}else{E.sun.setAttribute('hidden','');E.svg.removeAttribute('hidden');E.svg.innerHTML=ICON[w[0]]}
  }
  // เงิน
  var mny=Math.round(s.money);if(!isFinite(mny))return;
  if(target===null){shown=target=mny;drawMoney(mny)}
  else if(mny!==target){popDelta(mny-target);target=mny;tweenTo(mny)}
 }
 // ---- ซ่อน/แสดง ----
 function setOff(off,save){root.classList.toggle('off',off);E.tab.textContent=off?'‹':'›';if(save){try{localStorage.setItem('mctHudOff',off?'1':'0')}catch(e){}}}
 E.tab.addEventListener('click',function(ev){ev.stopPropagation();setOff(!root.classList.contains('off'),true)});
 try{E.cal.style.cursor='pointer';E.cal.title='เปิดปฏิทิน · วันเกิด';E.cal.addEventListener('click',function(ev){ev.stopPropagation();try{CAL.open()}catch(e){}})}catch(e){}
 // ---- จัดตำแหน่งใต้แถบด้านบน ----
 function layout(){
  var scene=document.getElementById('ceoScene'),inScene=!!(scene&&scene.classList.contains('show')&&!scene.classList.contains('choosing'));
  var wrap=inScene?document.getElementById('ceoSceneCanvasWrap'):null;
  var t=document.getElementById('top'),cv=inScene?(document.getElementById('ceoSceneCanvas')||wrap):document.getElementById('cv');if(!cv)return;
  var r=cv.getBoundingClientRect();if(r.width<50||r.height<50)return;
  var tb=inScene?r.top-1:(t?t.getBoundingClientRect().bottom:0);
  var w=Math.max(124,Math.min(210,r.width*.19,Math.max(124,(r.height-16)*.62*.914)));if(innerHeight<=560)w=Math.min(w,Math.max(124,Math.round(innerHeight*.37)));
  var top=Math.max(r.top+8,tb+6);
  // Keep the shared HUD on the right in every scene, matching the company HUD.
  // The scene canvas now fills its wrapper, so the right edge is playable artwork.
  var left=r.right-w-8;
  root.style.width=w+'px';root.style.left=Math.round(left)+'px';root.style.top=Math.round(top)+'px';root.style.right='auto';
  root.classList.toggle('sceneMode',inScene);
  root.style.display=(scene&&scene.classList.contains('show')&&scene.classList.contains('choosing'))?'none':'';
 }
 layout();window.addEventListener('resize',layout);window.addEventListener('orientationchange',layout);window.addEventListener('scroll',layout,{passive:true});
 if(window.MutationObserver){try{var mo=new MutationObserver(layout);var sc=document.getElementById('ceoScene');if(sc)mo.observe(sc,{attributes:true,attributeFilter:['class']})}catch(e){}}
 if(window.ResizeObserver){try{var ro=new ResizeObserver(layout);ro.observe(document.getElementById('top'));ro.observe(document.getElementById('cv'));var sw=document.getElementById('ceoSceneCanvasWrap');if(sw)ro.observe(sw)}catch(e){}}
 var off=false;try{off=localStorage.getItem('mctHudOff')==='1'}catch(e){}
 root.hidden=false;setOff(off,false);
 // ---- เชื่อมกับ hud() เดิม (ถูกเรียกทุกเฟรม/ทุกครั้งที่เงิน-วัน-เวลาเปลี่ยน) + สำรองด้วย interval ----
 var orig=window.hud;
 if(typeof orig==='function'){window.hud=function(){var r=orig.apply(this,arguments);try{sync()}catch(e){}return r}}
 setInterval(function(){try{sync();layout()}catch(e){}},300);
 try{sync()}catch(e){}
 window.MCT_HUD={sync:sync,toggle:function(){setOff(!root.classList.contains('off'),true)}};
})();
