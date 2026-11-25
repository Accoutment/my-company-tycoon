
/* ===== v39 THIEF NIGHT EVENT (00:00-05:00): random burglary / guard-catch cutscenes ===== */
(function(){
'use strict';
var TH_IMG=new Image();TH_IMG.src='assets/img/c401222102d0.png';
var TH_PORT=new Image();TH_PORT.src='assets/img/a410062bfde6.jpg';
var VW=800,VH=450,FONT="'Noto Sans Thai','Sarabun',system-ui,sans-serif";
/* ---- tuning ---- */
var CHANCE_OPEN=.12;      // โอกาส/คืน เมื่อไม่มี รปภ.+กล้อง  (โจรเข้า -> ถูกขโมย)
var CHANCE_GUARDED=.09;   // โอกาส/คืน เมื่อมี รปภ.+กล้อง     (โจรเข้า -> รปภ.จับได้)
var COOLDOWN=3;           // ห่างจากเหตุการณ์ก่อนหน้าอย่างน้อย (วัน)
var START_DAY=11;         // เริ่มเกิดตั้งแต่วันที่ (ตรงกับเหตุการณ์สุ่มอื่นๆ)

function hasGuard(){return (S.kitchenStaff||[]).some(function(e){return e.charId==='security-guard'})}
function hasCam(){return (S.f||[]).some(function(f){return f.t==='cctv'})}
function guarded(){return hasGuard()&&hasCam()}

/* ---------- random scheduling ---------- */
function roll(){
  var th=S.thf;
  if(th&&th.day===S.day)return;
  S.thf={day:S.day,at:-1,done:0};
  if(S.day<START_DAY||S.day===60||S.day===MYS_DAY)return;
  if(S.t>720)return;
  try{if(window.YZ&&YZ.protects())return}catch(e){}
  if(S.day-(S.thfLast||-99)<COOLDOWN)return;
  if(Math.random()<(guarded()?CHANCE_GUARDED:CHANCE_OPEN))S.thf.at=rnd(20,290);
}
function tick(){
  if(typeof S==='undefined'||!S||S.over||!S.today)return;
  roll();
  var th=S.thf;if(!th||th.at<0||th.done||S.t<th.at)return;
  if(S.t>720){th.done=1;return}
  try{if(window.YZ&&YZ.protects()){th.done=1;return}}catch(e){}
  var lm=document.getElementById('loanModal');
  if(CUT.on||S.paused||document.getElementById('evModal')||(lm&&!lm.hidden))return;
  th.done=1;S.thfLast=S.day;
  play(guarded()?'catch':'theft',th.at);
}

/* ---------- game effects ---------- */
function calcLoss(){
  var m=Math.max(0,Math.round(S.money));
  var total=Math.min(m,Math.max(400,Math.min(20000,Math.round(m*rnd(6,12)/100/10)*10)));
  var lap=Math.round(total*.35/10)*10,cash=Math.round(total*.5/10)*10;
  return {total:total,lap:lap,cash:cash,misc:total-lap-cash};
}
function applyTheft(L){
  S.money-=L.total;S.today.eq+=L.total;S.rep=Math.max(0,S.rep-2);
  S.emp.forEach(function(e){e.ha=cl(e.ha-3)});
  S.tot.thefts=(S.tot.thefts||0)+1;
  log('🦹 โจรขึ้นบริษัทตอนกลางคืน! ถูกขโมยเงินและอุปกรณ์ '+M(L.total)+' · ชื่อเสียง -2'+(guarded()?'':' (จ้าง รปภ. + ติดตั้งกล้องวงจรปิด เพื่อจับโจร)'));
  try{save(1);hud();show()}catch(e){}
}
function applyCatch(){
  S.rep+=3;S.emp.forEach(function(e){e.ha=cl(e.ha+2)});
  S.tot.thiefCaught=(S.tot.thiefCaught||0)+1;
  log('🛡️ รปภ. เห็นโจรจากกล้องวงจรปิดและจับได้ทัน! ไม่มีของเสียหาย · ชื่อเสียง +3');
  try{save(1);hud();show()}catch(e){}
}

/* ---------- tiny helpers ---------- */
function c1(v){return Math.max(0,Math.min(1,v))}
function ez(v){v=c1(v);return v*v*(3-2*v)}
function rr(n){var x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function lerp(a,b,k){return a+(b-a)*k}
function seg(t,a,b){return c1((t-a)/(b-a))}
function pad(n){return String(n).padStart(2,'0')}
function hhmm(m){m=Math.max(0,Math.round(m));return pad(Math.floor(m/60)%24)+':'+pad(m%60)}
function glow(g,x,y,r,rgb,a){var q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,'rgba('+rgb+','+a+')');q.addColorStop(1,'rgba('+rgb+',0)');g.fillStyle=q;g.fillRect(x-r,y-r,2*r,2*r)}
function add(g,f){g.save();g.globalCompositeOperation='lighter';f();g.restore()}
function rrect(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function txt(g,s,x,y,font,col,al){g.font=font;g.fillStyle=col;g.textAlign=al||'left';g.fillText(s,x,y)}

/* วาดเฟรมตัวละคร: who 't' = โจร (แผ่นสไปรต์ของเรา)  'g' = รปภ. (สไปรต์เดิมของเกม)
   row 0=หน้า 1=หลัง 2=ซ้าย 3=ขวา · (x,fy)=จุดเท้า */
function fig(g,who,row,col,x,fy,sc,o){
  o=o||{};var im=null,sx=0,sy=0;
  if(who==='t'){im=TH_IMG;sx=col*64;sy=row*80}
  else{var a=(typeof CHAR_IMAGES!=='undefined')&&CHAR_IMAGES['security-guard'];im=a&&a.frames[row]&&a.frames[row][col]}
  if(!im||!im.complete||!im.naturalWidth)return;
  g.save();g.imageSmoothingEnabled=false;
  if(who==='t'&&o.rim!==0)add(g,function(){glow(g,x,fy-62*sc*.5,52*sc,'120,150,255',.2*(o.al==null?1:o.al))});
  if(o.al!=null)g.globalAlpha=o.al;
  g.translate(x,fy);if(o.rot)g.rotate(o.rot);g.scale(o.flip?-1:1,o.sy||1);
  g.drawImage(im,sx,sy,64,80,-32*sc,-72*sc,64*sc,80*sc);
  g.restore();
}
function bubble(g,x,y,s,o){
  o=o||{};var fs=o.fs||18,k=o.k==null?1:o.k;if(k<=0)return;
  g.save();g.translate(x,y);g.scale(k,k);g.font='700 '+fs+'px '+FONT;
  var w=g.measureText(s).width+24,h=fs+16,bx=-w/2,by=-h-14;
  g.lineWidth=2.5;g.strokeStyle=o.bd||'#10131c';g.fillStyle=o.bg||'#fff';
  rrect(g,bx,by,w,h,10);g.fill();g.stroke();
  g.beginPath();g.moveTo(-7,by+h-1);g.lineTo(0,0);g.lineTo(7,by+h-1);g.closePath();g.fill();g.stroke();
  g.fillStyle=o.bg||'#fff';g.fillRect(-6,by+h-3,12,4);
  g.fillStyle=o.c||'#10131c';g.textAlign='center';g.textBaseline='middle';g.fillText(s,0,by+h/2+1);
  g.restore();
}
function pop(t,a,dur){return t<a?0:t>a+dur?1:1+.25*Math.sin(c1((t-a)/dur)*Math.PI)}

/* ---------- sound (WebAudio, sound-effects only — no external files) ---------- */
var AC=null;
function ac(){try{if(!AC){var C=window.AudioContext||window.webkitAudioContext;if(C)AC=new C()}if(AC&&AC.state==='suspended')AC.resume()}catch(e){}return AC}
function vol(){var el=document.getElementById('vCut'),v=el?parseFloat(el.value):18;if(!(v>=0))v=18;return Math.min(.6,v/100*1.6)}
function tone(f0,f1,dur,type,gain,delay){
  var a=ac();if(!a)return;
  try{var t0=a.currentTime+(delay||0),o=a.createOscillator(),g=a.createGain(),v=vol()*(gain||1);
   o.type=type||'sine';o.frequency.setValueAtTime(f0,t0);if(f1&&f1!==f0)o.frequency.exponentialRampToValueAtTime(f1,t0+dur);
   g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(Math.max(.0002,v),t0+.012);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
   o.connect(g);g.connect(a.destination);o.start(t0);o.stop(t0+dur+.03)}catch(e){}
}
function noise(dur,gain,hp,delay){
  var a=ac();if(!a)return;
  try{var n=Math.max(1,Math.floor(a.sampleRate*dur)),b=a.createBuffer(1,n,a.sampleRate),d=b.getChannelData(0);
   for(var i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
   var s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain(),t0=a.currentTime+(delay||0);
   f.type='highpass';f.frequency.value=hp||1500;g.gain.value=vol()*(gain||1);
   s.buffer=b;s.connect(f);f.connect(g);g.connect(a.destination);s.start(t0)}catch(e){}
}
var SFX={
 step:function(){tone(110,55,.08,'triangle',.55)},
 run:function(){tone(130,60,.06,'triangle',.7)},
 click:function(){noise(.035,.8,3500)},
 door:function(){noise(.35,.45,500);tone(180,90,.3,'sawtooth',.25)},
 beep:function(){tone(1000,1000,.14,'square',.4)},
 alert:function(){tone(880,880,.11,'square',.45);tone(1318,1318,.16,'square',.45,.13)},
 gasp:function(){tone(420,900,.16,'sawtooth',.3)},
 pop:function(){tone(500,1100,.09,'sine',.5)},
 cash:function(){tone(1568,1568,.07,'square',.3);tone(2093,2093,.22,'square',.3,.08)},
 whistle:function(){tone(2100,2600,.14,'sine',.5);tone(2100,2600,.3,'sine',.5,.18)},
 thud:function(){tone(140,40,.3,'sine',1);noise(.12,.5,300)},
 siren:function(){for(var i=0;i<4;i++){tone(700,1000,.38,'sawtooth',.28,i*.4)}},
 lose:function(){tone(330,160,.5,'sawtooth',.4);tone(247,110,.7,'sawtooth',.4,.3)},
 win:function(){tone(523,523,.14,'square',.35);tone(659,659,.14,'square',.35,.14);tone(784,784,.3,'square',.35,.28)}
};

/* ---------- scenery ---------- */
var DOORX=570,GROUND=402;
function drawExterior(g,t,o){
  var q=g.createLinearGradient(0,0,0,400);q.addColorStop(0,'#050914');q.addColorStop(1,'#1a2542');g.fillStyle=q;g.fillRect(0,0,VW,VH);
  for(var i=0;i<46;i++){g.fillStyle='rgba(255,255,255,'+(.2+.5*Math.abs(Math.sin(t*1.7+i)))+')';g.fillRect((rr(i)*VW)|0,(rr(i+50)*190)|0,2,2)}
  add(g,function(){glow(g,150,86,78,'170,200,255',.22)});
  g.fillStyle='#e9f0ff';g.beginPath();g.arc(150,86,20,0,7);g.fill();g.fillStyle='rgba(150,165,205,.45)';g.beginPath();g.arc(143,80,5,0,7);g.arc(158,93,4,0,7);g.fill();
  for(i=0;i<14;i++){var h=60+rr(i+9)*120,x=i*62-12;g.fillStyle='#0b1226';g.fillRect(x,395-h,50,h);
    for(var k=0;k<7;k++)if(rr(i*9+k)>.8){g.fillStyle='rgba(255,217,138,.55)';g.fillRect(x+6+(k%3)*14,395-h+10+((k/3)|0)*18,6,8)}}
  /* facade */
  g.fillStyle='#1b2236';g.fillRect(250,0,VW-250,396);g.fillStyle='#2b3552';g.fillRect(250,0,6,396);g.fillStyle='#131827';g.fillRect(250,380,VW-250,16);
  g.fillStyle='#0c1020';g.fillRect(390,92,360,44);g.strokeStyle='#e0a82e';g.lineWidth=2;g.strokeRect(390,92,360,44);
  var fl=.82+.18*Math.sin(t*9)*(rr(Math.floor(t*6))>.8?1:0)+.0;
  g.save();g.shadowColor='#e0a82e';g.shadowBlur=14;txt(g,'MY COMPANY',570,126,'700 30px '+FONT,'rgba(255,212,90,'+fl+')','center');g.restore();
  for(i=0;i<6;i++){var wx=270+i*90;g.fillStyle='#0a0f1e';g.fillRect(wx,148,70,46);g.fillStyle='#16233f';g.fillRect(wx+3,151,64,40);
    g.fillStyle='rgba(150,180,255,.09)';g.beginPath();g.moveTo(wx+8,191);g.lineTo(wx+30,151);g.lineTo(wx+44,151);g.lineTo(wx+22,191);g.fill();
    g.fillStyle='#0a0f1e';g.fillRect(wx+33,148,4,46)}
  [[275,250,170,95],[690,250,100,95]].forEach(function(w){g.fillStyle='#0a0f1e';g.fillRect(w[0],w[1],w[2],w[3]);g.fillStyle='#142038';g.fillRect(w[0]+3,w[1]+3,w[2]-6,w[3]-6);
    g.fillStyle='rgba(150,180,255,.07)';g.beginPath();g.moveTo(w[0]+10,w[1]+w[3]-3);g.lineTo(w[0]+40,w[1]+3);g.lineTo(w[0]+62,w[1]+3);g.lineTo(w[0]+32,w[1]+w[3]-3);g.fill()});
  /* door */
  var open=o.door||0;
  g.fillStyle='#07090f';g.fillRect(DOORX-56,212,112,184);
  g.fillStyle=open>0?'#0a0d18':'#16202e';g.fillRect(DOORX-50,218,100,178);
  if(open>0){g.fillStyle='#05070d';g.fillRect(DOORX-50,218,100,178);var q2=g.createLinearGradient(DOORX-50,0,DOORX+50,0);q2.addColorStop(0,'rgba(60,80,120,.35)');q2.addColorStop(1,'rgba(20,30,50,0)');g.fillStyle=q2;g.fillRect(DOORX-50,218,100,178)}
  var dw=100*(1-open*.86);g.fillStyle='#16202e';g.fillRect(DOORX-50,218,dw,178);
  g.fillStyle='#223149';g.fillRect(DOORX-42,228,Math.max(0,dw-16),82);
  g.fillStyle='rgba(150,180,255,.1)';if(dw>30){g.beginPath();g.moveTo(DOORX-40,308);g.lineTo(DOORX-20,228);g.lineTo(DOORX,228);g.lineTo(DOORX-20,308);g.fill()}
  g.fillStyle='#caa24a';if(open<.3)g.fillRect(DOORX+30*(1-open*.86),322,6,22);
  g.fillStyle='#7a2a2a';g.fillRect(DOORX-72,196,144,20);g.fillStyle='#e8e1d0';for(i=0;i<6;i++)g.fillRect(DOORX-72+i*24,196,12,20);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(DOORX-72,196,144,20);
  if(o.cam){g.save();g.translate(660,238);g.fillStyle='#4a5160';g.fillRect(-4,-14,8,14);g.rotate(.22);g.fillStyle='#222733';g.fillRect(-16,-6,32,14);g.fillStyle='#3a4050';g.fillRect(-16,-6,32,3);g.fillStyle='#0d0f14';g.fillRect(-20,-2,6,8);
    if(Math.floor(t*2)%2===0){g.fillStyle='#ff3b3b';g.fillRect(8,0,4,4);g.restore();add(g,function(){glow(g,668,239,16,'255,60,60',.55)})}else g.restore()}
  /* street */
  g.fillStyle='#262d42';g.fillRect(0,396,VW,20);g.fillStyle='#3a4260';g.fillRect(0,396,VW,2);g.fillStyle='#1a1f30';g.fillRect(0,414,VW,4);
  g.fillStyle='#0e111a';g.fillRect(0,418,VW,VH-418);g.fillStyle='#8a7a3a';for(var x2=-((t*30)%80);x2<VW;x2+=80)g.fillRect(x2,436,40,3);
  /* lamp */
  g.fillStyle='#1c2236';g.fillRect(137,150,7,248);g.fillRect(137,150,48,5);g.fillStyle='#ffe2a0';g.fillRect(165,155,24,5);
  var lf=.92+.08*Math.sin(t*23)*(rr(Math.floor(t*4))>.85?1:0);
  add(g,function(){glow(g,178,162,150,'255,190,100',.34*lf);g.save();g.translate(170,408);g.scale(1,.12);glow(g,0,0,190,'255,190,100',.45*lf);g.restore()});
}

function laptop(g,x,y,s,al){g.save();g.globalAlpha=al==null?1:al;g.translate(x,y);g.scale(s,s);g.fillStyle='#2b303c';g.fillRect(-22,0,44,5);g.fillStyle='#1a1e28';g.fillRect(-17,-30,34,30);g.fillStyle='#3a78c8';g.fillRect(-14,-27,28,24);g.fillStyle='#a8d0ff';g.fillRect(-14,-27,28,3);g.restore()}
function bill(g,x,y,rot,s){g.save();g.translate(x,y);g.rotate(rot);g.scale(s,s);g.fillStyle='#3e9a52';g.fillRect(-14,-7,28,14);g.fillStyle='#bfeec9';g.fillRect(-12,-5,24,10);g.fillStyle='#3e9a52';g.beginPath();g.arc(0,0,4,0,7);g.fill();g.restore()}
function coffee(g,x,y,s){g.save();g.translate(x,y);g.scale(s,s);g.fillStyle='#7a2a2a';g.fillRect(-20,-44,40,44);g.fillStyle='#4e1717';g.fillRect(-20,-44,40,7);g.fillStyle='#14161c';g.fillRect(-12,-30,24,17);g.fillStyle='#d8d0c0';g.fillRect(-6,-12,12,10);g.fillStyle='#4ade80';g.fillRect(12,-36,4,4);g.restore()}

function drawInterior(g,t,o){
  var q=g.createLinearGradient(0,0,0,392);q.addColorStop(0,'#0e1426');q.addColorStop(1,'#1a2136');g.fillStyle=q;g.fillRect(0,0,VW,VH);
  g.fillStyle='#10162a';g.fillRect(0,0,VW,30);
  g.fillStyle='#0b0f1c';g.fillRect(0,380,VW,12);
  g.fillStyle='#1f2539';g.fillRect(0,392,VW,VH-392);for(var x=0;x<VW;x+=64){g.fillStyle='rgba(255,255,255,.035)';g.fillRect(x,392,2,VH-392)}
  /* windows with moon rays */
  [[300,64],[560,64]].forEach(function(w){g.fillStyle='#0a1124';g.fillRect(w[0],w[1],86,112);g.fillStyle='#17294a';g.fillRect(w[0]+4,w[1]+4,78,104);g.fillStyle='#0a1124';g.fillRect(w[0]+41,w[1],4,112);g.fillRect(w[0],w[1]+54,86,4);
    add(g,function(){g.fillStyle='rgba(140,170,255,.055)';g.beginPath();g.moveTo(w[0],w[1]+112);g.lineTo(w[0]+86,w[1]+112);g.lineTo(w[0]+150,392);g.lineTo(w[0]+40,392);g.fill()})});
  /* wall clock */
  var cx=440,cy=100;g.fillStyle='#d8d2c0';g.beginPath();g.arc(cx,cy,19,0,7);g.fill();g.fillStyle='#10131c';g.beginPath();g.arc(cx,cy,16,0,7);g.fill();g.strokeStyle='#e8e1d0';g.lineWidth=2;
  var hm=o.at||0,ha=(hm/60%12)/12*Math.PI*2-Math.PI/2,ma=(hm%60)/60*Math.PI*2-Math.PI/2;
  g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(ha)*9,cy+Math.sin(ha)*9);g.stroke();g.lineWidth=1.5;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(ma)*13,cy+Math.sin(ma)*13);g.stroke();
  /* entrance door (left) */
  g.fillStyle='#07090f';g.fillRect(18,208,84,186);g.fillStyle='#0f1424';g.fillRect(22,212,76,182);
  if(o.doorLight>0)add(g,function(){var gr=g.createLinearGradient(22,0,330,0);gr.addColorStop(0,'rgba(120,150,230,'+(.2*o.doorLight)+')');gr.addColorStop(1,'rgba(120,150,230,0)');g.fillStyle=gr;g.beginPath();g.moveTo(22,212);g.lineTo(22,394);g.lineTo(330,394);g.lineTo(260,330);g.fill()});
  /* exit door (right) */
  g.fillStyle='#07090f';g.fillRect(668,208,84,186);g.fillStyle='#0f1424';g.fillRect(672,212,76,182);
  g.fillStyle='#0a2a18';g.fillRect(692,184,36,18);add(g,function(){glow(g,710,193,42,'60,255,140',.35)});txt(g,'EXIT',710,198,'700 12px sans-serif','#7dffae','center');
  /* desk A + monitor */
  g.fillStyle='#2a2018';g.fillRect(96,340,150,9);g.fillStyle='#1d1610';g.fillRect(104,349,8,43);g.fillRect(232,349,8,43);g.fillRect(190,349,40,40);
  g.fillStyle='#111621';g.fillRect(176,296,50,36);var pul=.5+.5*Math.sin(t*1.8);g.fillStyle='rgba(60,120,200,'+(.45+.2*pul)+')';g.fillRect(179,299,44,30);
  add(g,function(){glow(g,201,314,60,'60,120,220',.14)});
  if(o.lap)laptop(g,146,339,1);
  /* cabinet + plant */
  g.fillStyle='#262c3d';g.fillRect(262,290,40,102);g.fillStyle='#1c2130';for(var d=0;d<3;d++){g.fillRect(266,296+d*32,32,26);g.fillStyle='#8a93a5';g.fillRect(278,306+d*32,8,3);g.fillStyle='#1c2130'}
  g.fillStyle='#3b2c20';g.fillRect(640,366,22,26);g.fillStyle='#1f5a35';g.beginPath();g.ellipse(651,352,20,18,0,0,7);g.fill();g.fillStyle='#2a7a48';g.beginPath();g.ellipse(646,346,10,12,-.4,0,7);g.fill();
  /* safe */
  var sx=332,sOpen=o.safe||0;
  g.fillStyle='#252a36';g.fillRect(sx-46,298,92,94);g.fillStyle='#3b4150';g.fillRect(sx-42,302,84,86);
  if(sOpen>0){g.fillStyle='#08090d';g.fillRect(sx-36,308,72,74);if(o.cashIn){g.fillStyle='#3e9a52';for(var b=0;b<3;b++)g.fillRect(sx-30+b*22,340,18,26);g.fillStyle='#bfeec9';for(b=0;b<3;b++)g.fillRect(sx-28+b*22,343,14,4)}}
  var dwid=72*(1-sOpen);g.fillStyle='#4a5266';g.fillRect(sx-36,308,dwid,74);
  if(sOpen<.7){var da=o.dial||0;g.save();g.translate(sx-36+dwid/2,345);g.fillStyle='#1b1f2a';g.beginPath();g.arc(0,0,14,0,7);g.fill();g.fillStyle='#aeb6c6';g.beginPath();g.arc(0,0,11,0,7);g.fill();g.rotate(da);g.strokeStyle='#222';g.lineWidth=2;for(var k=0;k<8;k++){g.rotate(Math.PI/4);g.beginPath();g.moveTo(0,-11);g.lineTo(0,-7);g.stroke()}g.fillStyle='#c0392b';g.fillRect(-1.5,-10,3,10);g.restore();g.fillStyle='#8a93a5';g.fillRect(sx-36+dwid/2+16,342,6,16)}
  /* coffee counter */
  g.fillStyle='#2e3447';g.fillRect(450,352,120,40);g.fillStyle='#4a5268';g.fillRect(446,346,128,8);g.fillStyle='#1c2130';g.fillRect(458,360,50,28);
  if(o.coffee)coffee(g,485,346,1);g.fillStyle='#d8d0c0';g.fillRect(540,332,12,14);g.fillStyle='#6a4a30';g.fillRect(541,334,10,4);
}

function drawRoom(g,t,o){
  var q=g.createLinearGradient(0,0,0,392);q.addColorStop(0,'#0d1324');q.addColorStop(1,'#192034');g.fillStyle=q;g.fillRect(0,0,VW,VH);
  g.fillStyle='#10162a';g.fillRect(0,0,VW,30);g.fillStyle='#0b0f1c';g.fillRect(0,380,VW,12);g.fillStyle='#1d2235';g.fillRect(0,392,VW,VH-392);
  /* door */
  g.fillStyle='#07090f';g.fillRect(18,208,84,186);g.fillStyle='#0f1424';g.fillRect(22,212,76,182);
  g.fillStyle='#0a2a18';g.fillRect(28,180,64,20);txt(g,'ห้อง รปภ.',60,195,'700 12px '+FONT,'#7dffae','center');
  if(o.doorLight>0)add(g,function(){var gr=g.createLinearGradient(22,0,260,0);gr.addColorStop(0,'rgba(255,200,120,'+(.3*o.doorLight)+')');gr.addColorStop(1,'rgba(255,200,120,0)');g.fillStyle=gr;g.fillRect(22,212,240,182)});
  /* clock */
  var cx=190,cy=100;g.fillStyle='#d8d2c0';g.beginPath();g.arc(cx,cy,19,0,7);g.fill();g.fillStyle='#10131c';g.beginPath();g.arc(cx,cy,16,0,7);g.fill();g.strokeStyle='#e8e1d0';g.lineWidth=2;
  var hm=(o.at||0)+t/60*0,ha=(hm/60%12)/12*Math.PI*2-Math.PI/2,ma=(hm%60)/60*Math.PI*2-Math.PI/2;
  g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(ha)*9,cy+Math.sin(ha)*9);g.stroke();g.lineWidth=1.5;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(ma)*13,cy+Math.sin(ma)*13);g.stroke();
  /* console */
  g.fillStyle='#2c3347';g.fillRect(300,300,500,10);g.fillStyle='#1e2434';g.fillRect(300,310,500,82);g.fillStyle='#161b29';g.fillRect(312,322,476,6);
  g.fillStyle='#10131c';g.fillRect(330,292,120,8);for(var i=0;i<18;i++){g.fillStyle=rr(i)>.5?'#2e3447':'#3a4258';g.fillRect(334+i*6.4,293,5,5)}
  g.fillStyle='#d8d0c0';g.fillRect(250,282,16,18);g.fillStyle='#6a4a30';g.fillRect(252,284,12,4);
  for(i=0;i<3;i++){var py=270-((t*14+i*9)%26);g.fillStyle='rgba(235,240,255,'+(.3*(1-((t*14+i*9)%26)/26))+')';g.fillRect(256+Math.sin(t*3+i)*2,py,3,3)}
  g.fillStyle='#8a93a5';g.fillRect(700,282,14,20);g.fillStyle='#10131c';g.fillRect(703,270,8,12);
  /* monitors */
  var mons=[[330,92,'CAM 01 · หน้าบริษัท'],[542,92,'CAM 02 · ล็อบบี้'],[330,192,'CAM 03 · ทางเดิน'],[542,192,'CAM 04 · ที่จอดรถ']];
  mons.forEach(function(m,k){
    var mx=m[0],my=m[1],mw=200,mh=88;
    g.fillStyle='#07090f';g.fillRect(mx-6,my-6,mw+12,mh+12);
    g.save();g.beginPath();g.rect(mx,my,mw,mh);g.clip();
    g.fillStyle='#0a1a12';g.fillRect(mx,my,mw,mh);
    if(k===0){g.fillStyle='#12291d';g.fillRect(mx+60,my,mw-60,mh-10);g.fillStyle='#0a1a12';g.fillRect(mx+120,my+22,34,mh-32);g.fillStyle='#1f4a32';g.fillRect(mx,my+mh-14,mw,14);
      if(o.feed>0){var fx,fs=1;if(o.feed===1)fx=mx+10+(o.feedK||0)*118;else fx=mx+137;
        g.imageSmoothingEnabled=false;
        if(TH_IMG.complete&&TH_IMG.naturalWidth){var cc=Math.floor(t*7)%4;g.save();g.translate(fx,my+mh-6);if(o.feed===2)g.scale(1,.8);g.drawImage(TH_IMG,cc*64,(o.feed===1?3:1)*80,64,80,-16,-36,32,40);g.restore()}
        g.fillStyle='rgba(60,255,140,.22)';g.fillRect(mx,my,mw,mh)}}
    else if(k===1){g.fillStyle='#12291d';g.fillRect(mx+20,my+40,50,40);g.fillRect(mx+90,my+34,56,46);g.fillStyle='#1f4a32';g.fillRect(mx+150,my+28,40,52)}
    else if(k===2){g.fillStyle='#12291d';g.beginPath();g.moveTo(mx,my);g.lineTo(mx+70,my+30);g.lineTo(mx+130,my+30);g.lineTo(mx+mw,my);g.lineTo(mx+mw,my+mh);g.lineTo(mx+130,my+60);g.lineTo(mx+70,my+60);g.lineTo(mx,my+mh);g.fill()}
    else{g.fillStyle='#12291d';g.fillRect(mx+30,my+48,92,26);g.fillRect(mx+50,my+34,52,18);g.fillStyle='#1f4a32';g.fillRect(mx+150,my+10,6,70)}
    g.fillStyle='rgba(0,0,0,.18)';for(var y=my;y<my+mh;y+=3)g.fillRect(mx,y,mw,1);
    var nz=Math.floor(t*18);g.fillStyle='rgba(160,255,190,.18)';for(var n=0;n<26;n++)g.fillRect(mx+rr(nz*3+n+k*7)*mw,my+rr(nz*5+n+k)*mh,2,1);
    g.restore();
    txt(g,m[2],mx+6,my+13,'600 10px '+FONT,'#8cffb4');
    if(Math.floor(t*1.6)%2===0){g.fillStyle='#ff4444';g.beginPath();g.arc(mx+mw-12,my+10,3.5,0,7);g.fill();txt(g,'REC',mx+mw-20,my+13,'700 9px sans-serif','#ff7a7a','right')}
    var sec=Math.floor((o.at||0)*60+t);txt(g,pad(Math.floor(sec/3600)%24)+':'+pad(Math.floor(sec/60)%60)+':'+pad(sec%60),mx+mw-6,my+mh-6,'600 9px monospace','#8cffb4','right');
    if(k===0&&o.motion){var bl=Math.floor(t*5)%2===0;g.lineWidth=3;g.strokeStyle=bl?'#ff2a2a':'#7a1010';g.strokeRect(mx-3,my-3,mw+6,mh+6);if(bl)txt(g,'MOTION DETECTED',mx+mw/2,my+mh-18,'700 12px sans-serif','#ff5a5a','center')}
  });
  if(o.motion)add(g,function(){g.fillStyle='rgba(255,40,40,'+(.05+.05*Math.sin(t*14))+')';g.fillRect(0,0,VW,VH)});
}

function cone(g,x0,y0,x1,y1,half,a){
  var dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;
  add(g,function(){var q=g.createLinearGradient(x0,y0,x1,y1);q.addColorStop(0,'rgba(255,246,210,'+a+')');q.addColorStop(1,'rgba(255,246,210,'+(a*.25)+')');
    g.fillStyle=q;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1+nx*half,y1+ny*half);g.lineTo(x1-nx*half,y1-ny*half);g.closePath();g.fill();
    glow(g,x1,y1,half*1.1,'255,240,200',a*.8);glow(g,x0,y0,14,'255,250,225',.7)});
}
function tint(g,a){g.fillStyle='rgba(8,12,34,'+a+')';g.fillRect(0,0,VW,VH)}
function sparks(g,t,x,y){add(g,function(){for(var i=0;i<5;i++){var p=(t*5+i*.37)%1;if(rr(Math.floor(t*5+i*3))>.45){g.fillStyle='rgba(255,220,120,'+(1-p)+')';g.fillRect(x+(rr(i+Math.floor(t*5))-.5)*22,y-p*16,2,2)}}glow(g,x,y,12,'255,210,110',.4*(.5+.5*Math.sin(t*40)))})}

/* ---------- timeline ---------- */
var TW0=1.8,TW1=4.9,TL1=5.9,TT1=6.4,TP1=8.0,TO1=8.9,TI0=9.1,TY0=19.4,ET=24.8;   // theft
var CB0=7.6,CY0=15.6,EC=20.8;                                                   // guard catch
var LAPX=135,SAFEX=332,COFX=485;

function drawTheft(C){
  var g=C.g,t=C.t,E=C.E,x,fy,sc=2,row=3,col=0,sy=1,al=1,rot=0;
  if(t<TI0){
    var dOpen=ez(seg(t,TP1,TP1+.5))*(1-ez(seg(t,TO1+.1,TO1+.45)));
    drawExterior(g,t,{cam:E.cam,door:dOpen});
    x=-400;fy=GROUND;
    if(t>=TW0&&t<TW1){x=lerp(-50,545,seg(t,TW0,TW1));col=Math.floor((t-TW0)*7)%4;sy=.94;fy-=Math.abs(Math.sin((t-TW0)*Math.PI*3.5))*3;C.step(3.5,1)}
    else if(t>=TW1&&t<TL1){x=545;var ix=Math.floor((t-TW1)/.3)%4;row=ix%2?2:3;col=0}
    else if(t>=TL1&&t<TT1){x=lerp(545,DOORX,seg(t,TL1,TT1));row=1;col=Math.floor(t*7)%4;sy=.94;C.step(3.5,1)}
    else if(t>=TT1&&t<TP1){x=DOORX;row=1;col=0;sy=1-.2*ez(seg(t,TT1,TT1+.3));C.fire('ck'+Math.floor((t-TT1)/.32),0,SFX.click,1)}
    else if(t>=TP1&&t<TO1){var k=seg(t,TP1+.5,TO1);x=DOORX;row=1;col=Math.floor(t*7)%4;sy=1-.2*(1-ez(seg(t,TP1,TP1+.45)));fy=GROUND-18*ez(k);sc=2-.25*ez(k);al=1-ez(seg(k,.3,1));C.fire('door',TP1+.1,SFX.door)}
    if(x>-300&&t<TO1+.01)fig(g,'t',row,col,x,fy,sc,{sy:sy,al:al,rot:rot});
    tint(g,.2);
    if(t>=TT1&&t<TP1)sparks(g,t,DOORX+34,334);
    if(t>=TP1&&t<TO1+.3)add(g,function(){glow(g,DOORX,320,120,'120,150,230',.12*dOpen)});
  }else{
    var tb=t-TI0;fy=410;x=60;
    var o={at:E.at,lap:tb<1.3,safe:ez(seg(tb,5.2,5.6)),cashIn:tb<6.2,dial:0,coffee:tb<7.7,doorLight:1-ez(seg(tb,.6,1.2))},tgt=null,vis=1,cr=0;
    if(tb<1.0){x=lerp(60,LAPX,seg(tb,0,1));col=Math.floor(tb*8)%4;al=ez(seg(tb,0,.3));sy=.94;C.step(4,1)}
    else if(tb<2.5){x=LAPX;row=1;col=0;cr=ez(seg(tb,1.0,1.3))*(1-ez(seg(tb,2.1,2.5)));tgt=[150,322];C.fire('pop1',1.6+TI0,SFX.pop)}
    else if(tb<3.5){x=lerp(LAPX,SAFEX,seg(tb,2.5,3.5));col=Math.floor(tb*8)%4;sy=.94;C.step(4,1)}
    else if(tb<6.4){x=SAFEX;row=1;col=0;cr=ez(seg(tb,3.5,3.8))*(1-ez(seg(tb,6.0,6.4)));tgt=[SAFEX,345];
      if(tb>=3.8&&tb<5.3)o.dial=Math.sin((tb-3.8)*3.2)*2.4;else if(tb>=5.3)o.dial=Math.sin(1.5*3.2)*2.4;
      C.fire('d1',TI0+4.2,SFX.click);C.fire('d2',TI0+4.6,SFX.click);C.fire('d3',TI0+5.0,SFX.click);C.fire('so',TI0+5.25,SFX.door);
      C.fire('c1',TI0+5.5,SFX.cash);C.fire('c2',TI0+5.75,SFX.cash);C.fire('c3',TI0+6.0,SFX.cash)}
    else if(tb<7.4){x=lerp(SAFEX,COFX,seg(tb,6.4,7.4));col=Math.floor(tb*8)%4;sy=.94;C.step(4,1)}
    else if(tb<8.6){x=COFX;row=1;col=0;cr=ez(seg(tb,7.4,7.7))*(1-ez(seg(tb,8.3,8.6)));tgt=[COFX,320];C.fire('pop2',TI0+7.9,SFX.pop)}
    else{x=lerp(COFX,880,seg(tb,8.6,10.0));col=Math.floor(tb*13)%4;C.step(6.5,1,SFX.run);if(x>840)vis=0}
    if(cr)sy=1-.2*cr;
    drawInterior(g,t,o);
    var py=fy-44*sy;
    var k=seg(tb,1.3,2.1);if(k>0&&k<1)laptop(g,lerp(150,x,k),lerp(339,py,k)-Math.sin(k*Math.PI)*46,1-.5*k);
    for(var i=0;i<5;i++){k=seg(tb,5.5+.14*i,6.0+.14*i);if(k>0&&k<1)bill(g,lerp(SAFEX-24+i*12,x,k),lerp(345,py,k)-Math.sin(k*Math.PI)*40,k*4+i,1-.4*k)}
    k=seg(tb,7.7,8.4);if(k>0&&k<1)coffee(g,lerp(COFX,x,k),lerp(346,py+22,k)-Math.sin(k*Math.PI)*50,1-.45*k);
    if(vis)fig(g,'t',row,col,x,fy,sc,{sy:sy,al:al,rot:rot});
    tint(g,.25);
    if(vis){var hy=fy-58*sy;
      if(tgt)cone(g,x,hy,tgt[0],tgt[1],42,.34);
      else if(row===3)cone(g,x+36,hy,x+36+240,hy+26,48,.3)}
    if(tb>=6.4&&tb<7.3)bubble(g,x,fy-142*sy,'ฮึๆ...',{k:pop(tb,6.4,.25)});
  }
}

function drawCatch(C){
  var g=C.g,t=C.t,E=C.E;
  if(t<CB0){
    var o={at:E.at,doorLight:ez(seg(t,6.3,6.7)),motion:t>=3.0&&t<6.6,feed:0,feedK:0};
    if(t>=3.0){if(t<4.4){o.feed=1;o.feedK=seg(t,3.0,4.4)}else o.feed=2}
    drawRoom(g,t,o);
    var x=235,fy=410,sc=2,row=3,col=0,sy=1,rot=0;
    if(t<4.4){rot=.03+.035*Math.sin(t*1.7);sy=1+.012*Math.sin(t*1.7);
      for(var i=0;i<3;i++){var p=((t*.7)+i*.33)%1;g.globalAlpha=1-p;txt(g,'Z',x+38+p*30+i*8,fy-150-p*40-i*8,'700 '+(16+i*6)+'px sans-serif','#cfe0ff');g.globalAlpha=1}
      if(t>=3.0){var bi=Math.floor((t-3.0)/.45);C.fire('bp'+bi,0,SFX.beep,1)}}
    else if(t<5.0){fy-=38*Math.sin(Math.PI*seg(t,4.4,4.8));C.fire('al',4.4,SFX.alert)}
    else if(t<6.0){row=2}
    else{x=lerp(235,-130,seg(t,6.0,7.3));row=2;col=Math.floor(t*13)%4;C.step(6.5,1,SFX.run)}
    fig(g,'g',row,col,x,fy,sc,{sy:sy,rot:rot});
    tint(g,.16);
    if(t>=4.4&&t<5.9)bubble(g,x,fy-150,'!',{k:pop(t,4.4,.25),bg:'#ffe1e1',bd:'#8a1010',c:'#c0151b',fs:26});
    if(t>=5.1&&t<6.9)bubble(g,Math.max(150,x),fy-150,'มีคนงัดประตูหน้าบริษัท!',{k:pop(t,5.1,.25),fs:17});
    if(o.motion)add(g,function(){glow(g,x+40,fy-60,170,'255,60,60',.05)});
  }else{
    var tb=t-CB0;
    drawExterior(g,t,{cam:true,door:0});
    var tx=DOORX,tfy=GROUND,tr=1,tc=0,tsy=1,trot=0,gx=-300,gfy=GROUND,gr=3,gc=0,gsy=1;
    if(tb<3.6){tr=1;tsy=.8;C.fire('ck'+Math.floor(tb/.32),0,SFX.click,1)}
    else if(tb<4.1){tr=0;tfy-=26*Math.sin(Math.PI*seg(tb,3.6,3.95));C.fire('gasp',CB0+3.6,SFX.gasp)}
    else if(tb<4.7){tx=lerp(DOORX,702,seg(tb,4.1,4.7));tr=3;tc=Math.floor(tb*13)%4;C.step(6.5,1,SFX.run)}
    else{var d=1-seg(tb,4.7,6.0);tx=702+Math.sin(tb*38)*3*d;tr=0;tsy=1+.03*Math.sin(tb*26)*d;trot=-.05;C.fire('thud',CB0+4.7,SFX.thud)}
    if(tb>=.6&&tb<3.2){gx=lerp(-70,500,seg(tb,.6,3.2));gc=Math.floor(tb*6)%4;gsy=.95;C.step(3,1)}
    else if(tb>=3.2&&tb<4.1){gx=500;C.fire('whs',CB0+3.3,SFX.whistle)}
    else if(tb>=4.1&&tb<4.7){gx=lerp(500,616,seg(tb,4.1,4.7));gc=Math.floor(tb*14)%4;C.step(7,1,SFX.run)}
    else if(tb>=4.7)gx=616;
    fig(g,'t',tr,tc,tx,tfy,2,{sy:tsy,rot:trot});
    if(gx>-250)fig(g,'g',gr,gc,gx,gfy,2,{sy:gsy});
    if(tb>=4.7){g.save();g.lineCap='round';g.strokeStyle='#8c95aa';g.lineWidth=11;g.beginPath();g.moveTo(gx+26,gfy-88);g.lineTo(tx-22,tfy-112);g.stroke();
      g.fillStyle='#f0b896';g.beginPath();g.arc(tx-22,tfy-112,6,0,7);g.fill();g.restore()}
    tint(g,.2);
    if(tb>=.6&&gx>-100){var fx=tb<3.2?gx+36+200:(tb<4.1?DOORX:tx),fyy=tb<3.2?gfy-40:gfy-62;
      cone(g,gx+34,gfy-62,fx,fyy,tb<3.2?44:36,tb<3.2?.22:(tb<4.7?.45:.25));
      if(tb>=3.2&&tb<4.7)add(g,function(){glow(g,tx,tfy-60,90,'255,250,230',.4)})}
    if(tb>=3.4&&tb<5.2)bubble(g,gx,gfy-148,'หยุดนะ!!',{k:pop(tb,3.4,.25),fs:20});
    if(tb>=3.6&&tb<4.6)bubble(g,tx,tfy-142,'!!',{k:pop(tb,3.6,.2),bg:'#ffe1e1',bd:'#8a1010',c:'#c0151b',fs:24});
    if(tb>=5.0&&tb<7.3)bubble(g,gx-50,gfy-148,'จับได้แล้ว! ไปโรงพักกัน!',{k:pop(tb,5.0,.25),fs:17});
    if(tb>=5.9&&tb<7.6)bubble(g,tx+40,tfy-190,'โธ่เว้ย...',{k:pop(tb,5.9,.25),fs:16});
    if(tb>=6.2){C.fire('sir',CB0+6.2,SFX.siren);var ph=Math.floor((tb-6.2)*5)%2;
      add(g,function(){var q=g.createLinearGradient(ph?0:VW,0,ph?260:VW-260,0);q.addColorStop(0,ph?'rgba(255,40,40,.42)':'rgba(60,110,255,.42)');q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.fillRect(0,0,VW,VH);
        g.fillStyle=ph?'rgba(255,40,40,.07)':'rgba(60,110,255,.07)';g.fillRect(0,0,VW,VH)})}
  }
}

function drawCard(g,t,t0,E){
  var k=ez((t-t0)/.6);if(k<=0)return;
  var theft=E.kind==='theft',w=540,h=272,x=(VW-w)/2,y=(VH-h)/2+(1-k)*18;
  g.save();g.globalAlpha=k;g.fillStyle='rgba(4,6,14,.62)';g.fillRect(0,0,VW,VH);
  g.fillStyle='#10162a';rrect(g,x,y,w,h,14);g.fill();g.lineWidth=2;g.strokeStyle=theft?'#c0392b':'#4ade80';g.stroke();
  g.fillStyle='#0b0f1c';g.fillRect(x+16,y+16,104,172);g.strokeStyle='#52627a';g.lineWidth=2;g.strokeRect(x+16,y+16,104,172);
  if(TH_PORT.complete&&TH_PORT.naturalWidth)g.drawImage(TH_PORT,x+18,y+18,100,168);
  if(!theft){g.strokeStyle='#e8e1d0';g.lineWidth=3;for(var i=0;i<5;i++){g.beginPath();g.moveTo(x+30+i*18,y+18);g.lineTo(x+30+i*18,y+186);g.stroke()}}
  txt(g,'โจรขโมย',x+68,y+208,'700 15px '+FONT,'#e8e1d0','center');
  txt(g,theft?'หลบหนีไปแล้ว':'ถูกส่งตัวให้ตำรวจ',x+68,y+228,'500 12px '+FONT,theft?'#ff9a8a':'#8cffb4','center');
  var X=x+144;
  if(theft){
    txt(g,'บริษัทถูกขโมยของ!',X,y+42,'700 26px '+FONT,'#ff6b5a');
    var L=E.L,rows=[['โน้ตบุ๊กและอุปกรณ์',L.lap],['เงินสดในตู้เซฟ',L.cash],['เครื่องชงกาแฟและของใช้',L.misc]];
    rows.forEach(function(r,i){txt(g,r[0],X,y+82+i*30,'500 17px '+FONT,'#d6dcec');txt(g,'-'+M(r[1]),x+w-24,y+82+i*30,'700 17px '+FONT,'#ffb4a8','right')});
    g.fillStyle='#3a4258';g.fillRect(X,y+168,w-168,2);
    txt(g,'รวมเสียหาย',X,y+200,'700 19px '+FONT,'#fff');txt(g,'-'+M(L.total),x+w-24,y+201,'700 25px '+FONT,'#ff5a4a','right');
    txt(g,'ชื่อเสียง -2 · ขวัญกำลังใจพนักงาน -3',X,y+230,'500 13px '+FONT,'#9aa6c0');
    txt(g,E.hint,X,y+254,'600 12px '+FONT,'#e0a82e');
  }else{
    txt(g,'จับโจรได้ทัน!',X,y+42,'700 28px '+FONT,'#6ef09a');
    var rs=[['ทรัพย์สินที่เสียหาย','$0','#d6dcec'],['ชื่อเสียงบริษัท','+3','#6ef09a'],['ขวัญกำลังใจพนักงาน','+2','#6ef09a']];
    rs.forEach(function(r,i){txt(g,r[0],X,y+88+i*34,'500 18px '+FONT,'#d6dcec');txt(g,r[1],x+w-24,y+88+i*34,'700 19px '+FONT,r[2],'right')});
    g.fillStyle='#3a4258';g.fillRect(X,y+200,w-168,2);
    txt(g,'รปภ. + กล้องวงจรปิด ปกป้องบริษัทของคุณไว้ได้',X,y+232,'600 13px '+FONT,'#e0a82e');
  }
  g.restore();
}

/* ---------- cutscene runner ---------- */
function play(kind,atMin,opts){
  opts=opts||{};
  if(CUT.on)return;CUT.on=1;
  var wasPaused=S.paused;S.paused=1;
  var theft=kind==='theft',end=theft?ET:EC,cardT=theft?TY0:CY0;
  var E={kind:kind,at:atMin==null?rnd(60,280):atMin,cam:hasCam(),guard:hasGuard(),L:theft?calcLoss():null,applied:0,preview:!!opts.preview};
  E.hint=!E.guard&&!E.cam?'ป้องกันได้: จ้าง รปภ. + ติดตั้งกล้องวงจรปิด (CCTV)':!E.guard?'มีกล้องแล้ว แต่ยังไม่มี รปภ. คอยเฝ้าดูจอ — จ้าง รปภ. เพิ่ม':'มี รปภ. แล้ว แต่ยังไม่มีกล้องวงจรปิด — ติดตั้ง CCTV เพิ่ม';
  var dd=(S.day-1)%30+1,mo=Math.floor((S.day-1)/30)+1,flash=!opts.preview&&S.t>=360;
  var ov=document.createElement('div');ov.id='teeCut';
  ov.innerHTML='<canvas width="800" height="450"></canvas><button class="btn" id="teeSkip">ข้าม ▶▶</button>';
  document.body.appendChild(ov);
  var g=ov.querySelector('canvas').getContext('2d');
  var vg=document.createElement('canvas');vg.width=VW;vg.height=VH;{var q=vg.getContext('2d'),r=q.createRadialGradient(VW/2,VH/2,150,VW/2,VH/2,470);r.addColorStop(0,'rgba(0,0,0,0)');r.addColorStop(1,'rgba(0,0,8,.62)');q.fillStyle=r;q.fillRect(0,0,VW,VH)}
  var t=opts.t0||0,last=0,raf=0,done=0,fired={},lastStep=-1;
  try{if(window.TycoonAudio)TycoonAudio.cutscene('thief')}catch(e){}
  var C={g:g,E:E,t:0,
    fire:function(key,tm,fn,now){if(fired[key])return;if(now||t>=tm){fired[key]=1;fn()}},
    step:function(rate,on,fn){if(!on)return;var i=Math.floor(t*rate);if(i!==lastStep){lastStep=i;(fn||SFX.step)()}}};
  var caps=theft?[
    [2.3,5.7,'เงาดำย่องเข้ามาหน้าบริษัทกลางดึก...'],
    [6.0,8.0,!E.guard&&!E.cam?'ไม่มี รปภ. และไม่มีกล้องวงจรปิด... บริษัทจึงไร้การป้องกัน':!E.guard?'มีกล้องวงจรปิด แต่ไม่มี รปภ. คอยเฝ้าดูจอ...':'มี รปภ. แต่ไม่มีกล้องวงจรปิด... ไม่มีใครรู้ว่ามีคนแอบเข้ามา'],
    [TI0+1.0,TI0+3.2,'โน้ตบุ๊กบนโต๊ะทำงานหายเข้าไปในกระเป๋า...'],
    [TI0+3.6,TI0+6.2,'หมุนตู้เซฟฟังเสียงคลิก... แล้วกวาดเงินสดเรียบ'],
    [TI0+7.0,TI0+9.8,'เครื่องชงกาแฟก็ไม่เว้น แล้วหายเข้าไปในความมืด']
  ]:[
    [2.4,4.4,'ห้อง รปภ. ยามดึก... จอกล้องวงจรปิดเปิดตลอดคืน'],
    [4.5,7.3,'กล้องจับความเคลื่อนไหวหน้าบริษัท! รปภ. คว้าไฟฉายแล้ววิ่งออกไป'],
    [CB0+.4,CB0+3.0,'โจรกำลังงัดประตู โดยไม่รู้ว่าถูกกล้องจับตาดูอยู่'],
    [CB0+4.9,CB0+7.9,'รปภ. จับโจรได้ทัน! ทรัพย์สินปลอดภัยทั้งหมด']
  ];
  var cuts=[theft?TI0:CB0];
  function applyOnce(){
    if(E.applied||E.preview)return;E.applied=1;
    if(theft)applyTheft(E.L);else applyCatch();
  }
  function finish(){
    if(done)return;done=1;cancelAnimationFrame(raf);removeEventListener('keydown',kd,true);ov.remove();
    applyOnce();
    CUT.on=0;S.paused=wasPaused;
    try{if(window.TycoonAudio)TycoonAudio.stopCut()}catch(e){}
  }
  function frame(ts){
    if(done)return;
    var dt=Math.min(.1,(ts-(last||ts))/1000);last=ts;if(!opts.freeze)t+=dt;C.t=t;
    g.globalCompositeOperation='source-over';g.globalAlpha=1;g.textAlign='left';g.textBaseline='alphabetic';
    if(theft)drawTheft(C);else drawCatch(C);
    if(t>=cardT){drawCard(g,t,cardT,E);C.fire('end',cardT,function(){applyOnce();(theft?SFX.lose:SFX.win)()},1)}
    g.drawImage(vg,0,0);
    if(t<cardT)caps.forEach(function(c){if(t>=c[0]&&t<c[1]){var n=Math.floor((t-c[0])*30),s=c[2].slice(0,n);g.font='600 19px '+FONT;var w=g.measureText(c[2]).width+34;
      g.fillStyle='rgba(8,10,18,.74)';g.fillRect(VW/2-w/2,40,w,38);g.strokeStyle='#e0a82e';g.lineWidth=1.5;g.strokeRect(VW/2-w/2,40,w,38);g.fillStyle='#fff';g.textAlign='left';g.fillText(s,VW/2-w/2+17,65)}});
    if(t<2.3){var dim=t<1.5?.82:.82*(1-ez((t-1.5)/.8)),a=ez(t/.6)*(1-ez((t-1.6)/.7));
      g.fillStyle='rgba(0,0,0,'+dim+')';g.fillRect(0,0,VW,VH);g.textAlign='center';
      g.fillStyle='rgba(255,212,90,'+a+')';g.font='700 34px '+FONT;g.fillText((flash?'เมื่อคืนวันที่ ':'คืนวันที่ ')+dd+' · เดือน '+mo,VW/2,VH/2-10);
      g.fillStyle='rgba(235,240,255,'+a+')';g.font='500 19px '+FONT;g.fillText(hhmm(E.at)+' น. · ดึกสงัด'+(theft?'':' · รปภ. เข้าเวร'),VW/2,VH/2+24);
      if(flash){g.fillStyle='rgba(160,175,205,'+a*.8+')';g.font='500 14px '+FONT;g.fillText('(ย้อนดูเหตุการณ์ที่เกิดขึ้นระหว่างคุณหลับ)',VW/2,VH/2+50)}}
    g.fillStyle='#000';g.fillRect(0,0,VW,24);g.fillRect(0,VH-24,VW,24);
    var fo=t<.5?1-t/.5:t>end-.7?c1((t-(end-.7))/.7):0;
    cuts.forEach(function(ct){var d=Math.abs(t-ct);if(d<.25)fo=Math.max(fo,1-d/.25)});
    if(fo>0){g.fillStyle='rgba(0,0,0,'+fo+')';g.fillRect(0,0,VW,VH)}
    if(t>=end)return finish();
    raf=requestAnimationFrame(frame);
  }
  var kd=function(e){if(e.key===' '||e.key==='Enter'||e.key==='Escape'){e.preventDefault();e.stopPropagation();finish()}};
  addEventListener('keydown',kd,true);
  document.getElementById('teeSkip').onclick=finish;
  raf=requestAnimationFrame(frame);
}


/* ===== v61 POLICE RESPONSE SYSTEM ===== */
(function(){
 const PSTATE=()=>{if(!S.policeResponse)S.policeResponse={status:'none',theftDay:0,loss:0,arrivalDay:0,recoveryDay:0,callCost:1500};return S.policeResponse};
 const oldApplyTheft=applyTheft;
 applyTheft=function(L){
   oldApplyTheft(L);
   const p=PSTATE();p.status='pending';p.theftDay=S.day;p.loss=L.total;p.arrivalDay=0;p.recoveryDay=0;p.called=0;
   try{contactAdd();save(1);if(typeof OS!=='undefined'&&OS.render)OS.render()}catch(e){}
 };
 function hasAssets(){
   const guard=!!(typeof hasGuard==='function'&&hasGuard());
   const cam=!!(typeof hasCam==='function'&&hasCam());
   return {guard:guard,cam:cam,days:guard&&cam?1:guard?7:cam?3:10};
 }
 function callPolice(){
   const p=PSTATE();
   if(p.status!=='pending')return toast(p.status==='scheduled'||p.status==='arrived'?'เจ้าหน้าที่รับแจ้งเหตุแล้ว กำลังดำเนินการ':'ยังไม่มีเหตุปล้นที่รอแจ้งความ');
   if(S.money<1500)return toast('เงินสดไม่เพียงพอ ต้องใช้ '+M(1500));
   S.money-=1500;p.callCost=1500;p.called=1;p.status='scheduled';p.arrivalDay=S.day+1;
   const a=hasAssets();p.recoveryDay=p.arrivalDay+a.days;
   p.assetDays=a.days;
   log('📞 แจ้งความเหตุโจรกรรมแล้ว จ่ายค่าดำเนินการ '+M(1500)+' · ตำรวจ 3 นายจะเดินทางมาที่บริษัทในเช้าวันพรุ่งนี้');
   try{save(1);hud();show();if(typeof OS!=='undefined'&&OS.render)OS.render()}catch(e){}
   toast('ตำรวจรับแจ้งความแล้ว จะมาถึงบริษัทในเช้าวันพรุ่งนี้');
 }
 function contactAdd(){
   if(!window.LOAN||typeof LOAN.contactApp!=='function')return;
   const old=LOAN.contactApp;
   if(old._policeWrapped)return;
   const wrapped=function(){
     let html=old.apply(this,arguments);
     const p=PSTATE();
     let msg=p.status==='pending'?'มีเหตุโจรกรรมล่าสุด · สามารถแจ้งความและเรียกตำรวจได้':p.status==='scheduled'?'รับแจ้งเหตุแล้ว · ตำรวจจะมาถึงเช้าวันที่ '+p.arrivalDay:p.status==='arrived'?'ตำรวจเข้าตรวจสอบแล้ว · คาดว่าจะติดตามทรัพย์สินคืนได้ใน '+p.assetDays+' วัน':p.status==='done'?'ปิดคดีแล้ว · ติดตามทรัพย์สินคืนเรียบร้อย':'ยังไม่มีเหตุโจรกรรมที่ต้องแจ้งความ';
     const disabled=p.status!=='pending';
     html+='<div style="margin-top:14px;padding:12px;border:1px solid #d6a63b;border-radius:10px;background:linear-gradient(145deg,#202b40,#111827)">'+
       '<div style="display:flex;align-items:center;gap:10px"><div style="font-size:30px">🚔</div><div style="flex:1"><b style="color:#f5c65b">สถานีตำรวจ · แจ้งเหตุโจรกรรม</b><br><small>ชุดสืบสวน 3 นาย · หัวหน้าชุด 1 นาย</small></div></div>'+
       '<div style="margin:9px 0;padding:8px;background:#111827;border-radius:7px;color:#d8e0ef;font-size:13px">'+msg+'</div>'+
       '<button class="btn osAct" style="width:100%;background:'+(disabled?'#485266':'#a72e3a')+';color:#fff" '+(disabled?'disabled':'')+' onclick="POLICE.call()">📞 โทรแจ้งตำรวจ · '+M(1500)+'</button>'+
       '<small style="display:block;margin-top:7px;color:#aebbd0">ค่าดำเนินการ 1,500 บาท · เจ้าหน้าที่เดินทางด้วยรถตำรวจและเข้าตรวจสอบบริษัท</small></div>';
     return html;
   };
   wrapped._policeWrapped=true;LOAN.contactApp=wrapped;
 }
 contactAdd();
 window.POLICE={call:callPolice,status:()=>JSON.parse(JSON.stringify(PSTATE()))};
 /* ===== v64 POLICE VISIT: in-world car + officers walk in, stand and talk (like the yakuza) ===== */
 const PSRC={
   spr:{cop1:'assets/img/215fd96540bb.png',chief:'assets/img/a5403c03e53a.png',cop2:'assets/img/e8948d4dfa44.png'},
   port:{cop1:'assets/img/5a93429dd7f0.png',chief:'assets/img/c6b38a378b42.png',cop2:'assets/img/2a31f564a97b.png'},
   car:'assets/img/ff27d32b32ba.png'
 };
 const PSPR={},PPORT={};
 Object.keys(PSRC.spr).forEach(function(k){let i=new Image();i.src=PSRC.spr[k];PSPR[k]=i;let j=new Image();j.src=PSRC.port[k];PPORT[k]=j});
 const PCAR=new Image();PCAR.src=PSRC.car;
 window.__PSPR=PSPR;window.__PCAR=PCAR; // shared with the street scene (PSPR is private to this module)
 const PWHO={
   chief:{name:'พ.ต.ต. ศักดิ์ชัย',tag:'ตำรวจ · หัวหน้าชุดสืบสวน',role:'หัวหน้าชุดสืบสวน 3 นาย'},
   cop1:{name:'ร.ต.อ. ธนา',tag:'ตำรวจ · เจ้าหน้าที่สืบสวน',role:'ตรวจที่เกิดเหตุ'},
   cop2:{name:'ร.ต.ต.หญิง นภา',tag:'ตำรวจ · เจ้าหน้าที่สืบสวน',role:'พยานหลักฐาน / ภาพวงจรปิด'}
 };
 const PT=32,ROAD_Y=15,CAR_PARK_X=178,CAR_SCALE=.46,PWAIT=80;
 const pnow=()=>performance.now()/1000;
 const pez=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v)};
 let V=null; // transient visit state (not saved)
 function pTile(a){return [a.x/PT|0,a.y/PT|0]}
 function pTargets(){
   const taken=[];
   try{const L=S.loan;if(L&&L.actors)L.actors.forEach(function(a){taken.push(pTile(a).join(','))})}catch(e){}
   try{const c=S.customer&&S.customer.active;if(c&&c.state!=='gone')taken.push(pTile(c).join(','))}catch(e){}
   const cand=(window.OFC&&OFC.floor&&S.ofc)?OFC.visitTiles():[[3,12],[2,13],[4,13],[2,12],[4,12],[3,13],[1,12],[1,13]],out=[];
   for(let i=0;i<cand.length&&out.length<3;i++){
     const x=cand[i][0],y=cand[i][1];
     if(taken.indexOf(x+','+y)>=0||blk(x,y))continue;
     const p=bfs(OX.ent()[0],OX.ent()[1],function(a,b){return a===x&&b===y});
     if(!p||!p.length)continue;
     out.push({x:x,y:y,path:p});
   }
   while(out.length<3)out.push({x:4+out.length,y:13,path:[[3,14],[3,13],[4,13]]});
   return out;
 }
 function pLines(){
   const p=PSTATE(),a=hasAssets(),loss=Math.round(p.loss||0);
   const ls=[
     {who:'chief',t:'สวัสดีครับ ผมหัวหน้าชุดสืบสวน รับแจ้งเหตุโจรกรรมของบริษัทไว้แล้ว ทีมของผมจะเข้าตรวจสอบที่เกิดเหตุทันที'},
     {who:'cop1',t:'ตรวจสอบจุดเกิดเหตุและร่องรอยเบื้องต้นแล้วครับ ทรัพย์สินที่สูญหายมูลค่าประมาณ '+M(loss)+' ผมจะบันทึกทั้งหมดเข้าสำนวน'},
     {who:'cop2',t:a.cam?'บริษัทมีกล้องวงจรปิด ดิฉันขอดึงภาพเหตุการณ์ไปประกอบคดีนะคะ ช่วยให้ตามตัวคนร้ายได้เร็วขึ้นมากค่ะ':'บริษัทไม่มีกล้องวงจรปิด ทำให้ตามรอยคนร้ายได้ยากขึ้นค่ะ แนะนำให้ติดตั้งไว้ในอนาคตนะคะ'},
     {who:'cop1',t:a.guard?'ขอบคุณ รปภ. ของบริษัทที่ให้ปากคำ ข้อมูลช่วยให้เราจำกัดวงผู้ต้องสงสัยได้เร็วครับ':'ไม่มี รปภ. ยืนยันเหตุการณ์ในคืนนั้น เราต้องใช้เวลาสืบสวนเพิ่มขึ้นครับ'},
     {who:'chief',t:'คาดว่าจะติดตามทรัพย์สินคืนได้ภายใน '+(p.assetDays||a.days)+' วัน (ราววันที่ '+(p.recoveryDay||S.day+a.days)+') ขอให้บริษัทร่วมมือเต็มที่ ถ้ามีความคืบหน้าเราจะแจ้งทันที'}
   ];
   return ls;
 }
 function pStart(){
   if(V)return;
   const car={x:Math.max(vw(),16)*PT+120,y:ROAD_Y*PT+31,state:'in',t0:pnow()};
   V={stage:'car',t0:pnow(),car:car,actors:[],spawned:0,page:0,modal:false,talked:0,waitT:0,tg:pTargets()};
   try{log('🚔 รถตำรวจมาถึงหน้าบริษัท ตำรวจ 3 นายลงจากรถ หัวหน้าชุดเป็นผู้นำเข้าตรวจสอบ')}catch(e){}
   pFx();
 }
 function pSpawn(role,tg,delay){
   const sx=CAR_PARK_X-30;
   const a={role:role,x:sx,y:ROAD_Y*PT+16,d:1,f:0,state:'entering',path:[[3,15]].concat(tg.path.map(function(q){return q.slice()})),tx:tg.x,ty:tg.y,walkDelay:delay||0,seed:Math.random()*6,look:0,arrive:pnow(),hidden:1};
   V.actors.push(a);return a;
 }
 function pLeaveAll(){
   if(!V||V.stage==='leave'||V.stage==='out')return;
   V.stage='leave';V.leaveT=pnow();closeP();
   V.actors.forEach(function(a,i){
     if(a.state==='gone')return;
     const t=pTile(a);let route=bfs(t[0],t[1],function(x,y){return x===3&&y===14});
     if(!route)route=[];
     route=route.concat([[3,15],[4,15]]);
     a.path=route;a.state='leaving';a.walkDelay=i*.8;a.hidden=0;
   });
 }
 function pStep(dr){
   if(!V)return;
   const t=pnow(),c=V.car;
   if(V.stage==='car'){
     const k=(t-c.t0)/3.6;c.x=lerp2(Math.max(vw(),16)*PT+120,CAR_PARK_X,pez(k));
     if(k>=1){c.x=CAR_PARK_X;c.state='park';V.stage='unload';V.t1=t}
   }
   if(V.stage==='unload'){
     const u=t-V.t1,roles=['cop1','cop2','chief'],ts=[V.tg[1],V.tg[2],V.tg[0]];
     while(V.spawned<3&&u>=.5+V.spawned*.9){pSpawn(roles[V.spawned],ts[V.spawned],0);V.spawned++}
     if(V.spawned>=3){V.stage='walk'}
   }
   V.actors.forEach(function(a){
     if(a.state==='entering'){
       a.hidden=0;
       if(mvE(a,dr)){a.state='waiting';a.x=a.tx*PT+16;a.y=a.ty*PT+16;a.f=0;a.d=0;a.arrive=pnow()}
     }else if(a.state==='leaving'){
       if(mvE(a,dr)){a.state='gone'}
     }
   });
   if(V.stage==='walk'&&V.actors.every(function(a){return a.state==='waiting'})){V.stage='talk';V.waitT=0;
     try{toast('🚔 ตำรวจรอพบอยู่ในออฟฟิศ — เดินไปคุยกับหัวหน้าชุด')}catch(e){}}
   if(V.stage==='talk'&&!V.modal){V.waitT+=dr;if(V.waitT>PWAIT&&!V.talked){try{log('🚔 ตำรวจรอพบเจ้าของบริษัทนานแล้วจึงขอตัวกลับไปก่อน แต่ยังเดินเรื่องคดีต่อ')}catch(e){}pLeaveAll()}}
   if(V.stage==='leave'&&V.actors.every(function(a){return a.state==='gone'})){V.stage='out';c.state='out';c.t0=t;c.x0=c.x}
   if(V.stage==='out'){
     const k=(t-c.t0)/3.4;c.x=lerp2(c.x0,-160,pez(k*k*.6+k*.4));
     if(k>=1){V=null;return}
   }
 }
 function lerp2(a,b,k){return a+(b-a)*k}
 /* ---- draw ---- */
 function pDrawActor(g,a,t){
   if(a.state==='gone'||a.hidden)return;
   const img=PSPR[a.role];if(!img||!img.complete||!img.naturalWidth)return;
   const walking=a.state==='entering'||a.state==='leaving';
   let d=a.d||0;
   if(a.state==='waiting'){
     const dx=S.pl.x-a.x,dy=S.pl.y-a.y;
     if(Math.hypot(dx,dy)<170){const w=Math.abs(dx)>=Math.abs(dy)?(dx<0?1:3):(dy<0?2:0);if(w!==a.look&&(a.lookAt==null||t-a.lookAt>.35)){a.look=w;a.lookAt=t}d=a.look}else d=0;
   }
   const row=[0,2,1,3][d],fr=walking&&!(a.walkDelay>0)?Math.floor(a.f||0)%4:0;
   const x=Math.round(a.x),y=Math.round(a.y),k=.56,w=64*k,hh=96*k;
   const bob=walking?0:Math.sin(t*2.2+(a.seed||0))*.9;
   const ad=a.arrive?t-a.arrive:-1,grow=(ad>=0&&ad<.5)?1+.08*Math.sin(ad*Math.PI/.5):1;
   g.save();g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
   g.translate(x,y+9);g.scale(grow,grow);
   g.drawImage(img,fr*64,row*96,64,96,-w/2,-93*k+bob,w,hh);
   g.restore();g.imageSmoothingEnabled=false;
   if(a.state==='waiting'&&V&&!V.talked&&a.role==='chief'){
     const pulse=1+.12*Math.sin(t*5+(a.seed||0)),by=y-52;
     g.save();g.translate(x,by);g.scale(pulse,pulse);
     g.fillStyle='rgba(10,24,60,.94)';g.fillRect(-9,-8,18,15);g.strokeStyle='#6fb0ff';g.lineWidth=1;g.strokeRect(-8.5,-7.5,17,14);
     g.fillStyle='#9cc8ff';g.font='bold 12px sans-serif';g.textAlign='center';g.fillText('!',0,4);g.restore();
   }
 }
 function pDrawCar(g,t){
   if(!V||!PCAR.complete||!PCAR.naturalWidth)return;
   const c=V.car,moving=c.state==='in'||c.state==='out',fr=Math.floor(t*6)%4,row=0; // row 0 = facing left
   const fw=216,fh=136,w=fw*CAR_SCALE,h=fh*CAR_SCALE;
   const bounce=moving?Math.sin(t*28)*.5:0;
   g.save();g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
   g.drawImage(PCAR,fr*fw,row*fh,fw,fh,Math.round(c.x-w/2),Math.round(c.y-h+bounce),w,h);
   g.restore();g.imageSmoothingEnabled=false;
   // siren glow, alternating red/blue
   const red=Math.floor(t*5)%2===0,gx=c.x-4,gy=c.y-h+9;
   g.save();g.globalCompositeOperation='lighter';
   const gr=g.createRadialGradient(gx,gy,2,gx,gy,46);
   gr.addColorStop(0,red?'rgba(255,40,50,.55)':'rgba(60,110,255,.55)');gr.addColorStop(1,'rgba(0,0,0,0)');
   g.fillStyle=gr;g.fillRect(gx-48,gy-48,96,96);g.restore();
 }
 /* ---- dialog ---- */
 function closeP(){if(V)V.modal=false;const m=document.getElementById('policeModal');if(m)m.hidden=true}
 function renderP(){
   if(!V)return;
   let m=document.getElementById('policeModal');
   if(!m){m=document.createElement('div');m.id='policeModal';m.hidden=true;
     m.style.cssText='position:fixed;inset:0;z-index:46;background:rgba(4,7,14,.78);display:flex;align-items:center;justify-content:center;padding:14px;overflow:auto';
     document.body.appendChild(m)}
   const ls=pLines(),idx=Math.min(V.page,ls.length-1),ln=ls[idx],last=idx>=ls.length-1,W=PWHO[ln.who];
   const thumbs=['chief','cop1','cop2'].filter(function(k){return k!==ln.who}).map(function(k){return '<img class="loanThumb" src="'+PSRC.port[k]+'" alt="">'}).join('');
   const acts=last?'<button class="btn clientAccept" style="grid-column:1/-1" onclick="POLICE.finish()">🚔 ขอบคุณครับ ฝากด้วยนะครับ</button>':'<button class="btn clientAccept" style="grid-column:1/-1" onclick="POLICE.next()">ถัดไป ▶</button>';
   const esc2=function(s){return String(s).replace(/[&<>"]/g,'')};
   m.innerHTML='<div class="clientDialog loanDlg" style="border-color:#4f7fd1;background:linear-gradient(145deg,#16213a,#0b1020);box-shadow:0 18px 60px #000b,0 0 28px rgba(80,130,255,.4)"><div class="clientHead"><img class="loanPortImg" src="'+PSRC.port[ln.who]+'" alt=""><div><div class="clientTag" style="background:#1f3f7a;color:#d6e6ff">'+W.tag+'</div><h2>'+W.name+'</h2><small>'+W.role+'</small><div class="clientStars">🚔 ชุดสืบสวนคดีโจรกรรม</div></div><div class="loanThumbs">'+thumbs+'</div><button class="btn clientClose" onclick="POLICE.close()">✕</button></div>'+
     '<div class="clientSpeech" style="background:#e9eefb;border-color:#a9bde6">“'+esc2(ln.t)+'”</div><div class="clientActions">'+acts+'</div></div>';
   m.hidden=false;V.modal=true;
 }
 function pTalk(){
   if(!V||V.stage!=='talk')return false;
   const p=S.pl,near=V.actors.some(function(a){return a.state==='waiting'&&Math.hypot(a.x-p.x,a.y-p.y)<=96});
   if(near){renderP();return true}
   toast('เดินไปคุยกับตำรวจ');return true;
 }
 function pLabel(){return V&&V.stage==='talk'?'คุยกับตำรวจ':''}
 function pFinish(){
   closeP();if(!V)return;V.talked=1;
   try{log('🚔 ตำรวจบันทึกคำให้การและตรวจสอบที่เกิดเหตุเสร็จแล้ว กำลังเดินทางกลับไปติดตามคนร้าย');const p=PSTATE();p.interviewed=1;save(1)}catch(e){}
   pLeaveAll();
 }
 /* ---- arrival cinematic overlay: letterbox + siren tint + caption (does not block play) ---- */
 function pFx(){
   if(document.getElementById('policeArrivalFx'))return;
   const ov=document.createElement('canvas');ov.id='policeArrivalFx';ov.width=800;ov.height=450;
   ov.style.cssText='position:fixed;left:0;top:0;width:100vw;height:100vh;max-width:none;max-height:none;aspect-ratio:auto;margin:0;z-index:45;pointer-events:none;background:transparent!important;border:0!important;box-shadow:none!important;border-radius:0!important;image-rendering:auto';
   document.body.appendChild(ov);const g=ov.getContext('2d'),s0=pnow();
   (function fr(){
     const t=pnow()-s0;g.clearRect(0,0,800,450);
     if(!V||t>8.5){ov.remove();return}
     const a=Math.min(1,t/.6)*Math.min(1,(8.5-t)/.8);
     const red=Math.floor(t*4)%2===0;
     g.fillStyle=red?'rgba(255,30,50,'+(.13*a)+')':'rgba(40,90,255,'+(.13*a)+')';g.fillRect(0,0,800,450);
     g.fillStyle='rgba(0,0,0,'+.82*a+')';g.fillRect(0,0,800,64*a);
     g.font='bold 20px sans-serif';g.textAlign='center';g.fillStyle='rgba(255,255,255,'+a+')';
     g.fillText(t<3.8?'🚨 รถตำรวจเดินทางมาถึงบริษัท':t<6.4?'ตำรวจ 3 นายลงจากรถ · หัวหน้าชุดนำเข้าตรวจสอบ':'ชุดสืบสวนกำลังเข้าตรวจสอบบริษัท',400,100*a-12);
     requestAnimationFrame(fr);
   })();
 }
 const _oPush=LOAN.pushDraw;
 LOAN.pushDraw=function(list,g,t){
   _oPush.apply(this,arguments);
   if(V){
     list.push([ROAD_Y*PT+20,function(){pDrawCar(g,t)}]);
     V.actors.forEach(function(a){list.push([a.y+12,function(){pDrawActor(g,a,t)}])});
   }
 };
 const _oTalk=LOAN.talk;LOAN.talk=function(){if(pTalk())return true;return _oTalk.apply(this,arguments)};
 const _oLabel=LOAN.label;LOAN.label=function(){return pLabel()||_oLabel.apply(this,arguments)};
 const POL={start:pStart,step:pStep,active:function(){return !!V},state:function(){return V}};
 Object.assign(window.POLICE,{
   next:function(){if(V){V.page++;renderP()}},
   close:closeP,finish:pFinish,start:pStart,
   test:function(){const p=PSTATE();if(p.status==='none'||p.status==='done'){p.status='arrived';p.loss=p.loss||50000;p.assetDays=p.assetDays||3;p.recoveryDay=S.day+3}pStart()},
   active:function(){return !!V},
   camFocus:function(){
     if(!V||V.modal)return null;
     if(V.stage==='car')return {x:Math.min(V.car.x,CAR_PARK_X+90),y:ROAD_Y*PT-30};
     if(V.stage==='unload')return {x:CAR_PARK_X-20,y:ROAD_Y*PT-40};
     if(V.stage==='walk'){const ch=V.actors.find(function(a){return a.role==='chief'})||V.actors[0];return ch?{x:ch.x,y:ch.y-20}:{x:CAR_PARK_X,y:ROAD_Y*PT-40}}
     if(V.stage==='leave')return {x:3*PT+30,y:ROAD_Y*PT-40};
     if(V.stage==='out')return {x:Math.max(40,V.car.x),y:ROAD_Y*PT-30};
     return null;
   }
 });

 function policeTick(){
   const p=PSTATE();if(!p||p.status==='none'||p.status==='pending'||p.status==='done')return;
   if(p.status==='scheduled'&&S.day>=p.arrivalDay&&S.t>=600){
     // Police only arrive while the CEO is physically at the company. If the CEO is away at the condo/beach, reschedule for 10:00 the next day.
     if(typeof CEOScene!=='undefined'&&typeof CEOScene.atCompany==='function'&&!CEOScene.atCompany()){p.arrivalDay=S.day+1;try{save(1)}catch(e){}return}
     if(POL.active())return;
     p.status='arrived';p.arrivedDay=S.day;
     log('🚔 รถตำรวจคันที่ 4 มาถึงบริษัทแล้ว · ตำรวจ 3 นายลงจากรถ โดยหัวหน้าชุดเป็นผู้ควบคุมการตรวจสอบ');
     try{save(1);hud();show()}catch(e){}
     POL.start();
   }
   if(p.status==='arrived'&&S.day>=p.recoveryDay&&S.t>=360){
     S.money+=Math.max(0,Math.round(p.loss||0));p.status='done';p.recoveredDay=S.day;
     log('✅ ตำรวจติดตามจับกุมคนร้ายสำเร็จ และนำทรัพย์สินมูลค่า '+M(p.loss||0)+' กลับคืนบริษัทแล้ว');
     try{save(1);hud();show();toast('ตำรวจคืนทรัพย์สินที่ถูกขโมยให้บริษัทแล้ว')}catch(e){}
   }
 }
 try{contactAdd()}catch(e){}
 const oldTick=tick;
 tick=function(dm,dr){const r=oldTick.apply(this,arguments);try{policeTick()}catch(e){}try{POL.step(dr)}catch(e){}return r};
})();
window.THIEF={tick:tick,play:play,roll:roll,chance:function(){return {open:CHANCE_OPEN,guarded:CHANCE_GUARDED,cooldown:COOLDOWN}},guarded:guarded};
if(typeof A!=='undefined'){
  A.testThiefCutscene=function(){play('theft',rnd(60,280),{preview:true})};
  A.testGuardCutscene=function(){play('catch',rnd(60,280),{preview:true})};
  A.testPolice=function(){POLICE.test()};
  A.testThiefTonight=function(){S.t=100;S.thf={day:S.day,at:105,done:0};S.thfLast=-99;hud();toast('โจรจะมาในอีกไม่กี่นาที (เกิดจริง · '+(guarded()?'รปภ.จับได้':'ถูกขโมย')+')')};
}
})();


/* ===== v65 DETECTIVE: rival-company spy walks in to apply for a job (day 5) ===== */
/* Day 5 : walks in from the road, waits near Reception, player talks to him and accepts / declines.
   Hired  : works normally. From day 7 reputation drops 1 at a time and money leaks steadily (cause never shown).
   Day 10 : resigns on his own (polite, innocent-sounding reason). Declined = nothing lost.
   The player is never told he is a spy. */
(function(){
 const SPY_CHAR='detective-spy';
 const VISIT_DAY=5,VISIT_H=10.5,VISIT_LAST_H=16,LEAVE_H=17;   // arrives 10:30 on day 5 (fallback: day 6)
 const EFFECT_DAY=7;            // reputation / money effects start at 00:00 of this day
 const QUIT_DAY=10,QUIT_H=9;    // resigns on his own at 09:00 of this day
 const REP_EVERY=360;           // in-game minutes between reputation drops of 1 (6 hours)
 const DRAIN_PER_DAY=1000;      // money leaked per in-game day while he is employed (from EFFECT_DAY)
 const SPOTS=(window.OFC&&OFC.floor&&S.ofc)?OFC.visitTiles().slice(0,5):[[3,12],[4,13],[3,13],[2,12],[4,12]];
 const SPY=function(){if(!S.spy||typeof S.spy!=='object')S.spy={status:'none'};return S.spy};
 const now=function(){return performance.now()/1000};
 let V=null;   // transient visit state (never saved)

 function profile(sp){
  if(!sp.prof)sp.prof={name:pick(FN)+' '+pick(LN),sk:{P:5,D:3,M:6,G:6,A:5}};
  return sp.prof;
 }
 function atCompany(){
  try{if(typeof CEOScene!=='undefined'&&typeof CEOScene.atCompany==='function')return !!CEOScene.atCompany()}catch(e){}
  return true;
 }
 function pickSpot(){
  const taken=[];
  try{const c=S.customer&&S.customer.active;if(c&&c.state!=='gone')taken.push((c.x/T|0)+','+(c.y/T|0))}catch(e){}
  try{const L=S.loan;if(L&&L.actors)L.actors.forEach(function(a){taken.push((a.x/T|0)+','+(a.y/T|0))})}catch(e){}
  for(let i=0;i<SPOTS.length;i++){
   const x=SPOTS[i][0],y=SPOTS[i][1];
   if(taken.indexOf(x+','+y)>=0||blk(x,y))continue;
   const p=bfs(OX.ent()[0],OX.ent()[1],function(a,b){return a===x&&b===y});
   if(p&&p.length)return [x,y];
  }
  return [3,12];
 }
 function mkEmp(sp){
  const pf=profile(sp),sk={};KS.forEach(function(k){sk[k]=pf.sk[k]||3});
  const e={id:S.nid++,charId:SPY_CHAR,name:pf.name,g:0,role:'นักวิเคราะห์ธุรกิจ',personality:PN[0],
   ability:'วิเคราะห์ข้อมูลธุรกิจและวางแผนงาน',hair:'#2b1b17',skin:'#f1c9a5',shirt:'#8a6f55',
   pe:0,sk:sk,exp:0,hu:30,en:100,ha:80,sr:20,st:'home',x:0,y:0,path:[],d:0,f:0,tm:0,desk:0,bk:0,tr:0,cd:0};
  e.sal=salf(e);return e;
 }

 /* ---------- visit lifecycle ---------- */
 function start(){
  if(V)return;
  const sp=SPY(),pf=profile(sp),tg=pickSpot();
  sp.status='visiting';sp.visitDay=S.day;sp.sid=Math.random().toString(36).slice(2);
  V={sid:sp.sid,modal:false,mode:'apply',a:{x:vw()*T+24,y:15*T+16,d:1,f:0,state:'road',path:[],tx:tg[0],ty:tg[1],walkDelay:0,seed:Math.random()*6,look:0,lookAt:null,arrive:0}};
  try{log('🚪 มีผู้สมัครงานเดินเข้ามาติดต่อที่บริษัทด้วยตัวเอง')}catch(e){}
 }
 function leave(){
  if(!V)return;const a=V.a;
  if(a.state==='leaving'||a.state==='leavingEdge'||a.state==='gone')return;
  closeModal();
  const tx=a.x/T|0,ty=a.y/T|0;
  a.path=(a.state==='waiting'||a.state==='entering')?(pathToRoadEnd(tx,ty)||[]):[];
  a.state='leaving';a.walkDelay=0;
  if(!a.path.length){a.state='leavingEdge'}
  a.exitX=vw()*T+24;
 }
 function step(dm,dr){
  const sp=SPY(),h=S.t/60;
  if(V&&V.sid!==sp.sid)V=null;
  if(sp.status==='none'){
   if(S.day>=EFFECT_DAY)sp.status='missed';
   else if(S.day>=VISIT_DAY&&h>=VISIT_H&&h<VISIT_LAST_H&&!(typeof CUT!=='undefined'&&CUT.on)&&atCompany()&&!V){
    let busy=false;
    try{if(S.loan&&S.loan.actors&&S.loan.actors.length)busy=true}catch(e){}
    try{if(window.POLICE&&POLICE.active&&POLICE.active())busy=true}catch(e){}
    if(!busy)start();
   }
  }
  if(sp.status==='visiting'&&!V){   // game reloaded in the middle of the visit
   if(S.day===sp.visitDay&&h<LEAVE_H&&atCompany()){sp.status='none';start()}else sp.status='declined';
  }
  if(V){
   const a=V.a;
   if(a.state==='road'){
    a.x-=40*dr;a.d=1;a.f+=dr*7;
    if(a.x<=OX.entXY()[0]){a.x=OX.entXY()[0];a.path=bfs(OX.ent()[0],OX.ent()[1],function(x,y){return x===a.tx&&y===a.ty})||[];a.state='entering';a.d=2}
   }else if(a.state==='entering'){
    if(mvE(a,dr)){a.state='waiting';a.x=a.tx*T+16;a.y=a.ty*T+16;a.d=0;a.f=0;a.arrive=now();
     try{toast('🧳 มีผู้สมัครงานมารอพบอยู่ในออฟฟิศ — เดินไปคุยกับเขา')}catch(e){}}
   }else if(a.state==='waiting'){
    if(!V.modal&&(h>=LEAVE_H||S.day!==sp.visitDay)){
     try{log('🧳 ผู้สมัครงานรอพบนานแล้วจึงขอตัวกลับไปก่อน')}catch(e){}
     sp.status='declined';leave();
    }
   }else if(a.state==='leaving'){
    if(mvE(a,dr)){a.state='leavingEdge';a.exitX=vw()*T+24}
   }else if(a.state==='leavingEdge'){
    a.d=3;a.f=(a.f||0)+dr*7;a.x=Math.min(a.exitX||vw()*T+24,a.x+32*dr);
    if(a.x>=(a.exitX||vw()*T+24)){a.state='gone';V=null}
   }
  }
  effects();
 }

 /* ---------- hired: reputation / money drain, then resignation ---------- */
 function effects(){
  const sp=SPY();if(sp.status!=='hired')return;
  const e=S.emp.find(function(x){return x.id===sp.empId});
  if(!e){sp.status='gone';return}                 // fired or otherwise gone: effects stop
  const t=S.day*1440+S.t,from=EFFECT_DAY*1440,until=QUIT_DAY*1440+QUIT_H*60,end=Math.min(t,until);
  if(end>=from){
   if(sp.nextRep==null||sp.nextRep<from)sp.nextRep=from;
   let n=0;
   while(sp.nextRep<=end&&n<40){
    S.rep=Math.max(0,(S.rep||0)-1);sp.nextRep+=REP_EVERY;n++;
    if(!sp.repLogged){sp.repLogged=1;try{log('📉 ชื่อเสียงของบริษัทเริ่มลดลงโดยไม่ทราบสาเหตุ')}catch(_){}}
   }
   const last=Math.max(sp.lastDrain==null?from:sp.lastDrain,from),dt=end-last;
   if(dt>0){
    sp.acc=(sp.acc||0)+dt*DRAIN_PER_DAY/1440;sp.lastDrain=end;
    const w=Math.floor(sp.acc);
    if(w>0){
     sp.acc-=w;S.money-=w;try{S.today.eq=(S.today.eq||0)+w}catch(_){}
     if(!sp.moneyLogged){sp.moneyLogged=1;try{log('💸 พบรายจ่ายรั่วไหลของบริษัทโดยไม่ทราบสาเหตุ')}catch(_){}}
    }
   }
  }
  if(t>=until&&!sp.quitShown){
   if(V&&V.modal)return;
   if(!atCompany()){quitDone(e,true);return}
   sp.quitShown=1;renderModal('quit');
  }
 }
 function quitDone(e,silent){
  const sp=SPY();
  S.emp=S.emp.filter(function(x){return x.id!==e.id});
  try{if(typeof sel!=='undefined'&&sel==e.id)sel=0}catch(_){}
  sp.status='resigned';sp.quitDay=S.day;
  try{log('👋 '+e.name+' ขอลาออกเอง'+(silent?' (ฝากจดหมายลาออกไว้ที่โต๊ะ)':''))}catch(_){}
  try{save(1);hud();show();if(typeof OS!=='undefined'&&OS&&OS.on&&OS.app==='hr')OS.render()}catch(_){}
 }

 /* ---------- decisions ---------- */
 function accept(){
  if(!V||V.a.state!=='waiting')return;
  const sp=SPY(),e=mkEmp(sp);
  if(!freeDesk())return toast('ไม่มีโต๊ะว่าง ซื้อโต๊ะที่แท็บ Build ก่อนจึงจะรับเข้าทำงานได้');
  const f=freeDesk();
  if(!pay(hireFee(e),'eq'))return;
  e.desk=f.id;e.pd=S.day;e.x=V.a.x;e.y=V.a.y;e.d=V.a.d;e.path=[];e.walkDelay=0;
  S.emp.push(e);toDesk(e);
  sp.status='hired';sp.empId=e.id;sp.hiredDay=S.day;sp.nextRep=EFFECT_DAY*1440;sp.lastDrain=EFFECT_DAY*1440;sp.acc=0;
  closeModal();V.a.state='gone';V=null;
  try{log('จ้าง '+e.name);save(1);hud();show();if(typeof OS!=='undefined'&&OS&&OS.on&&OS.app==='hr')OS.render()}catch(_){}
 }
 function decline(){
  if(!V||V.a.state!=='waiting')return;
  const sp=SPY();sp.status='declined';
  try{log('คุณปฏิเสธผู้สมัครงานที่เดินเข้ามาสมัคร');save(1)}catch(_){}
  renderModal('declined');
 }
 function bye(){closeModal();leave()}
 function closeModal(){
  const m=document.getElementById('spyModal');if(m)m.style.display='none';
  if(V)V.modal=false;
 }
 function closeBtn(){
  const m=V&&V.mode;
  if(m==='declined'){bye();return}
  if(m==='quit'){quitOk();return}
  closeModal();
 }
 function quitOk(){
  const sp=SPY(),e=S.emp.find(function(x){return x.id===sp.empId});
  closeModal();if(V&&V.a&&V.a.state==='gone')V=null;if(e)quitDone(e,false);
 }

 /* ---------- dialog ---------- */
 function modalEl(){
  let m=document.getElementById('spyModal');
  if(!m){m=document.createElement('div');m.id='spyModal';
   m.style.cssText='position:fixed;inset:0;z-index:46;background:rgba(4,7,14,.78);display:none;align-items:center;justify-content:center;padding:14px;overflow:auto';
   document.body.appendChild(m)}
  return m;
 }
 function renderModal(mode){
  const sp=SPY(),pf=profile(sp),m=modalEl(),port=CHAR_ASSETS[SPY_CHAR].portrait;
  if(!V)V={sid:sp.sid,modal:false,mode:mode,a:{state:'gone'}};   // quit dialog can show without a visit
  V.mode=mode;
  let tag='ผู้สมัครงาน · เดินเข้ามาสมัครด้วยตนเอง',speech='',contract='',acts='';
  if(mode==='apply'){
   const tmp={sk:pf.sk,exp:0},sal=salf(tmp),fee=hireFee({sal:sal});
   const top=KS.slice().sort(function(a,b){return pf.sk[b]-pf.sk[a]}).slice(0,2).map(function(k){return KN[k]+' '+pf.sk[k]}).join(' · ');
   speech='สวัสดีครับ ผมเห็นว่าบริษัทกำลังเติบโต เลยตัดสินใจเดินเข้ามาสมัครงานด้วยตัวเองเลยครับ ผมมีประสบการณ์ด้านวิเคราะห์ข้อมูลธุรกิจและวางแผนงานมาหลายปี อยากเรียนรู้ระบบการทำงานของบริษัทให้ครบทุกส่วน ถ้าได้ร่วมงานด้วย ผมตั้งใจทำเต็มที่ครับ';
   contract='<div class="clientContract"><b>📄 ประวัติผู้สมัคร</b><h3>นักวิเคราะห์ธุรกิจ</h3><div class="clientGrid"><span>ประสบการณ์</span><b>5 ปี</b><span>ทักษะเด่น</span><b>'+top+'</b><span>เงินเดือน</span><b class="clientReward">'+M(sal)+' / เดือน</b><span>ค่าจ้างแรกเข้า</span><b>'+M(fee)+'</b></div>'+(freeDesk()?'':'<p style="color:#ffb86b;margin:8px 0 0">⚠ ตอนนี้ไม่มีโต๊ะว่าง ต้องซื้อโต๊ะเพิ่มก่อนจึงจะรับเข้าทำงานได้</p>')+'</div>';
   acts='<button class="btn clientAccept" onclick="DETECTIVE.accept()">✓ รับเข้าทำงาน</button><button class="btn clientReject" onclick="DETECTIVE.decline()">✕ ปฏิเสธ</button>';
  }else if(mode==='declined'){
   speech='เข้าใจครับ ขอบคุณที่สละเวลาให้ผมนะครับ ถ้าวันหน้าบริษัทเปิดรับอีก ผมขอสมัครใหม่นะครับ';
   acts='<button class="btn clientAccept" style="grid-column:1/-1" onclick="DETECTIVE.bye()">ตกลง</button>';
  }else{
   tag='พนักงานของคุณ · ขอลาออก';
   speech='ขอบคุณที่ให้โอกาสผมนะครับ พอดีมีธุระส่วนตัวที่ต้องรีบกลับไปจัดการ ขอลาออกตั้งแต่วันนี้เลยครับ ขอให้บริษัทเจริญรุ่งเรืองครับ';
   acts='<button class="btn clientAccept" style="grid-column:1/-1" onclick="DETECTIVE.quitOk()">👋 รับทราบ ขอให้โชคดีครับ</button>';
  }
  m.innerHTML='<div class="clientDialog"><div class="clientHead"><img src="'+port+'" alt=""><div><div class="clientTag">'+tag+'</div><h2>'+pf.name+'</h2><small>นักวิเคราะห์ธุรกิจ</small></div><button class="btn clientClose" onclick="DETECTIVE.close()">✕</button></div><div class="clientSpeech">“'+speech+'”</div>'+contract+'<div class="clientActions">'+acts+'</div></div>';
  const wasHidden=m.style.display==='none';
  m.style.display='flex';V.modal=true;
  if(wasHidden){m.style.pointerEvents='none';clearTimeout(window.__spyT);window.__spyT=setTimeout(function(){m.style.pointerEvents=''},650)}
 }
 function nearSpy(r){
  if(!V||V.a.state!=='waiting')return false;
  const p=S.pl,a=V.a;
  if(Math.hypot(a.x-p.x,a.y-p.y)>r)return false;
  try{const c=S.customer&&S.customer.active;   // a customer standing closer takes priority
   if(c&&c.state==='waiting'&&Math.hypot(c.x-p.x,c.y-p.y)<Math.hypot(a.x-p.x,a.y-p.y))return false}catch(e){}
  return true;
 }

 /* ---------- draw ---------- */
 function drawSpy(g,a,t){
  if(!a||a.state==='gone')return;
  const im0=CHAR_IMAGES[SPY_CHAR];if(!im0)return;
  const walking=a.state==='road'||a.state==='entering'||a.state==='leaving'||a.state==='leavingEdge';
  let d=a.d||0;
  if(a.state==='waiting'){
   const dx=S.pl.x-a.x,dy=S.pl.y-a.y;
   if(Math.hypot(dx,dy)<150){const w=Math.abs(dx)>=Math.abs(dy)?(dx<0?1:3):(dy<0?2:0);if(w!==a.look&&(a.lookAt==null||a.lookAt>t||t-a.lookAt>.35)){a.look=w;a.lookAt=t}d=a.look}else d=0;
  }
  const row=[0,2,1,3][d],fr=walking?Math.floor(a.f||0)%4:0;
  const im=im0.frames[row]&&(im0.frames[row][fr]||im0.frames[row][0]);
  if(!im||!im.complete||!im.naturalWidth)return;
  const x=Math.round(a.x),y=Math.round(a.y),bob=walking?0:Math.round(Math.sin(t*1.8+(a.seed||0))*1);
  g.drawImage(im,x-19,y-49+bob,38,52);
  if(a.state==='waiting'&&!(V&&V.modal)){
   const pulse=1+.12*Math.sin(t*5+(a.seed||0)),by=y-62;
   g.save();g.translate(x,by);g.scale(pulse,pulse);
   g.fillStyle='rgba(12,16,26,.92)';g.fillRect(-8,-7,16,14);
   g.strokeStyle='#ffd45a';g.lineWidth=1;g.strokeRect(-7.5,-6.5,15,13);
   g.fillStyle='#ffd45a';g.font='bold 12px sans-serif';g.textAlign='center';g.fillText('!',0,4);
   g.restore();
  }
 }
 const _oPush=LOAN.pushDraw;
 LOAN.pushDraw=function(list,g,t){
  _oPush.apply(this,arguments);
  if(V&&V.a&&V.a.state!=='gone'){const a=V.a;list.push([a.y+12,function(){drawSpy(g,a,t)}])}
 };
 const _oTalk=LOAN.talk;
 LOAN.talk=function(){if(nearSpy(96)){renderModal('apply');return true}return _oTalk.apply(this,arguments)};
 const _oLabel=LOAN.label;
 LOAN.label=function(){return nearSpy(110)?'คุยกับผู้สมัครงาน':_oLabel.apply(this,arguments)};

 /* ---------- hook into the game loop (same place the police module hooks in) ---------- */
 const _oTick=THIEF.tick;
 THIEF.tick=function(dm,dr){const r=_oTick.apply(this,arguments);try{step(dm,dr)}catch(e){console.error('detective',e)}return r};

 window.DETECTIVE={accept:accept,decline:decline,bye:bye,close:closeBtn,quitOk:quitOk,start:start,
  active:function(){return !!V},
  state:function(){return JSON.parse(JSON.stringify(SPY()))},
  test:function(){
   if(V){closeModal();V=null}
   const sp=SPY();
   if(sp.status==='hired'){toast('สายสืบถูกจ้างอยู่แล้ว');return}
   S.spy={status:'none'};start();
  }};
 if(typeof A!=='undefined'){A.testDetective=function(){DETECTIVE.test()}}
})();

