
/* ===== BAD ENDING : ฉากล้มละลาย (20 วินาที) ===== */
(function(){
var DUR=20,W=640,H=360,ATLAS_SRC='assets/img/923424c1265b.png',META={"car": {"w": 200, "h": 85, "y": 0, "n": 4}, "front": {"w": 60, "h": 96, "y": 87, "n": 4}, "right": {"w": 60, "h": 96, "y": 185, "n": 4}, "smoke": {"w": 101, "h": 57, "y": 283, "n": 1}};
var img=new Image();img.src=ATLAS_SRC;
var st={on:0,raf:0,t0:0,last:0,ov:null,cv:null,cx:null,parts:[],rain:[],aud:null,t:0};
var clamp=function(v,a,b){return v<a?a:v>b?b:v},lerp=function(a,b,p){return a+(b-a)*p};
var seed=7;function rr(){seed=(seed*16807)%2147483647;return seed/2147483647}
/* skyline แบบสุ่มคงที่ */
var B=[];(function(){seed=11;var x=-10;while(x<W){var w=28+Math.floor(rr()*44),h=70+Math.floor(rr()*120);var win=[];for(var yy=h-8;yy>10;yy-=11)for(var xx=5;xx<w-8;xx+=9)win.push([xx,yy,rr()<.45?1:0,rr()]);B.push({x:x,w:w,h:h,win:win});x+=w+Math.floor(rr()*6)}})();
for(var i=0;i<70;i++)st.rain.push({x:Math.random()*W,y:Math.random()*H,v:260+Math.random()*160});
var FONT='"Sarabun","Noto Sans Thai",Tahoma,sans-serif';
/* ซับไตเติล */
function subs(){var c=(S&&S.ceo)||'CEO';return [
 [0.9,4.2,'เงินของบริษัทติดลบเกิน '+M(-10000)+' ...'],
 [4.4,7.4,'เจ้าหนี้ยึดทุกอย่าง ไม่เหลือใครอยู่เคียงข้าง'],
 [7.5,11.2,c+' เดินออกจากบริษัทที่สร้างมากับมือเป็นครั้งสุดท้าย'],
 [11.4,14.6,'ไม่มีใครเรียกกลับ... เหลือเพียงรถคันเดียวที่พาเขาไป']]}
/* เสียง (WebAudio เบา ๆ) */
function audStart(){try{var A=window.AudioContext||window.webkitAudioContext;if(!A)return;var c=new A(),o=c.createOscillator(),o2=c.createOscillator(),f=c.createBiquadFilter(),g=c.createGain();o.type='sawtooth';o2.type='square';f.type='lowpass';f.frequency.value=380;g.gain.value=0;o.connect(f);o2.connect(f);f.connect(g);g.connect(c.destination);o.start();o2.start();st.aud={c:c,o:o,o2:o2,g:g,f:f}}catch(e){}}
function audSet(t){var a=st.aud;if(!a)return;var fr,v;
 if(t<4)v=0,fr=50;else if(t<6.8){var p=(t-4)/2.8;v=.05*p;fr=lerp(95,60,p)}
 else if(t<12.5){v=.035;fr=52+Math.sin(t*9)*3}
 else if(t<15.8){var q=(t-12.5)/3.3;v=.07*(1-q*.6);fr=lerp(60,330,q*q)}
 else{v=Math.max(0,.03*(1-(t-15.8)/1.2));fr=330}
 var n=a.c.currentTime;a.o.frequency.setTargetAtTime(fr,n,.05);a.o2.frequency.setTargetAtTime(fr*.5,n,.05);a.f.frequency.setTargetAtTime(250+fr*3,n,.05);a.g.gain.setTargetAtTime(v,n,.08)}
function audStop(){var a=st.aud;if(!a)return;try{a.g.gain.setTargetAtTime(0,a.c.currentTime,.05);setTimeout(function(){try{a.o.stop();a.o2.stop();a.c.close()}catch(e){}},400)}catch(e){}st.aud=null}
/* ตำแหน่งตัวละคร */
function carX(t){if(t<4)return -240;if(t<6.8){var p=(t-4)/2.8;return -240+570*(1-Math.pow(1-p,2.2))}if(t<12.5)return 330;var p2=clamp((t-12.5)/3.1,0,1);return 330+620*Math.pow(p2,2.2)}
function spawn(x,y,s,vx,vy,life){st.parts.push({x:x,y:y,s:s,vx:vx,vy:vy,life:life,age:0})}
function sprite(k,i,x,y,al,sc){var m=META[k];if(!img.complete)return;sc=sc||1;var c=st.cx;c.save();c.globalAlpha=al==null?1:al;c.drawImage(img,i*m.w,m.y,m.w,m.h,Math.round(x-m.w*sc/2),Math.round(y-m.h*sc),Math.round(m.w*sc),Math.round(m.h*sc));c.restore()}
function glow(x,y,r,col,a){var c=st.cx,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col.replace('A',a));g.addColorStop(1,col.replace('A',0));c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)}
function txt(s,x,y,size,col,w,stroke,al){var c=st.cx;c.save();c.globalAlpha=al==null?1:al;c.font=(w||'600')+' '+size+'px '+FONT;c.textAlign='center';c.textBaseline='middle';if(stroke){c.lineWidth=stroke;c.strokeStyle='#000';c.lineJoin='round';c.strokeText(s,x,y)}c.fillStyle=col;c.fillText(s,x,y);c.restore()}
/* ฉากหลัง */
function drawBG(t){var c=st.cx;
 var g=c.createLinearGradient(0,0,0,235);g.addColorStop(0,'#150a2e');g.addColorStop(.6,'#3a1a55');g.addColorStop(1,'#6b2a6e');c.fillStyle=g;c.fillRect(0,0,W,235);
 c.fillStyle='#fff';for(var i=0;i<40;i++){var a=.3+.5*Math.abs(Math.sin(t*1.3+i));c.globalAlpha=a*.6;c.fillRect((i*97)%W,(i*53)%110,1,1)}c.globalAlpha=1;
 B.forEach(function(b){c.fillStyle='#120a22';c.fillRect(b.x,232-b.h,b.w,b.h);b.win.forEach(function(w){if(!w[2])return;var fl=w[3]>.93&&Math.sin(t*8+w[3]*50)>0?0:1;c.fillStyle=fl?(w[3]>.6?'#ffcf6a':'#ff7ac8'):'#120a22';c.fillRect(b.x+w[0],232-w[1],4,5)})});
 /* บริษัท (ปิดไฟแล้ว) */
 var bx=18,bw=240,bt=64;c.fillStyle='#2a2540';c.fillRect(bx,bt,bw,232-bt);c.fillStyle='#1c1830';c.fillRect(bx,bt,bw,10);
 for(var yy=bt+22;yy<190;yy+=30)for(var xx=bx+14;xx<bx+bw-24;xx+=36){c.fillStyle='#14102a';c.fillRect(xx,yy,24,18);c.fillStyle='rgba(120,140,220,.12)';c.fillRect(xx,yy,24,4)}
 c.fillStyle='#0d0a1c';c.fillRect(bx+bw/2-18,186,36,46);c.fillStyle='rgba(255,255,255,.08)';c.fillRect(bx+bw/2-18,186,16,46);
 /* ป้าย */
 c.fillStyle='#3b1a1f';c.fillRect(bx+36,38,168,24);c.strokeStyle='#7c2d35';c.strokeRect(bx+36.5,38.5,167,23);
 var nm=(S&&S.name)||'My Company';txt(nm,bx+120,50,13,'#ffd7d7','800');
 var sw=Math.sin(t*2.2)*.04;c.save();c.translate(bx+bw/2,172);c.rotate(sw);c.fillStyle='#e8e0cf';c.fillRect(-34,0,68,22);c.fillStyle='#b91c1c';c.fillRect(-34,0,68,5);c.restore();
 txt('ปิดกิจการ',bx+bw/2,185+Math.sin(sw)*0,11,'#7f1d1d','800');
 /* ทางเท้า + ถนน */
 c.fillStyle='#3a3350';c.fillRect(0,232,W,34);c.fillStyle='#2b2540';c.fillRect(0,264,W,4);
 c.fillStyle='#1b1626';c.fillRect(0,268,W,H-268);
 c.fillStyle='rgba(255,255,255,.28)';var off=(t*(t>12.5?220:30))%64;for(var x=-64;x<W+64;x+=64)c.fillRect(x-off,345,34,3);
 /* เสาไฟ */
 c.fillStyle='#14101e';c.fillRect(578,150,4,84);c.fillRect(570,148,22,4);glow(581,154,70,'rgba(255,200,120,A)',.55+.1*Math.sin(t*20)*(t>3&&t<3.6?1:0));
 c.fillStyle='rgba(255,210,140,.10)';c.beginPath();c.moveTo(574,152);c.lineTo(588,152);c.lineTo(640,240);c.lineTo(520,240);c.fill();
}
function drawRain(dt){var c=st.cx;c.strokeStyle='rgba(180,190,255,.28)';c.lineWidth=1;c.beginPath();st.rain.forEach(function(d){d.y+=d.v*dt;d.x-=d.v*dt*.18;if(d.y>H){d.y=-10;d.x=Math.random()*(W+60)}c.moveTo(d.x,d.y);c.lineTo(d.x-2,d.y+8)});c.stroke()}
function drawParts(dt){var c=st.cx,m=META.smoke;st.parts=st.parts.filter(function(p){p.age+=dt;return p.age<p.life});st.parts.forEach(function(p){p.x+=p.vx*dt;p.y+=p.vy*dt;var k=p.age/p.life,sc=p.s*(.5+k*.9);c.save();c.globalAlpha=.75*(1-k);if(img.complete)c.drawImage(img,0,m.y,m.w,m.h,Math.round(p.x-m.w*sc/2),Math.round(p.y-m.h*sc/2),Math.round(m.w*sc),Math.round(m.h*sc));c.restore()})}
/* วาดเฟรมตามเวลา t */
function frame(now){if(!st.on)return;st.raf=requestAnimationFrame(frame);
 if(!st.t0){st.t0=now;st.last=now}var t=Math.min(DUR,(now-st.t0)/1000),dt=Math.min(.05,(now-st.last)/1000);st.last=now;st.t=t;
 var c=st.cx;c.save();
 /* กล้องสั่นตอนออกตัว/ชื่อเรื่อง */
 var sh=0;if(t>12.5&&t<14.2)sh=2*Math.sin(t*90)*(1-(t-12.5)/1.7);if(t>15.4&&t<15.9)sh+=4*Math.sin(t*120)*(1-(t-15.4)/.5);
 c.translate(Math.round(sh),Math.round(sh*.5));
 drawBG(t);
 /* CEO */
 var cex=200,cey=250,cf='front',ci=0,ca=1,cs=1;
 if(t>=7&&t<9.4){var p=(t-7)/2.4;cex=lerp(200,425,p);cf='right';ci=Math.floor(t*7)%4}
 else if(t>=9.4){cex=425}
 if(t>=10&&t<10.9){cey=lerp(250,296,(t-10)/.9);ci=Math.floor(t*7)%4}
 if(t>=10.9){cey=296;var q=clamp((t-10.9)/.4,0,1);ca=1-q;cs=1-q*.5}
 if(t<7||(t>=9.4&&t<10)) ci=0;
 var bob=(t<7||(t>=9.4&&t<10))?Math.round(Math.sin(t*2.4)*1):0;
 /* รถ */
 var cx_=carX(t),cy_=330+(t>6.8&&t<12.5?Math.round(Math.sin(t*26)*.6):0);
 if(t<4){st.parts=st.parts.filter(function(p){return p.age<p.life})}
 /* ไฟหน้า (ใต้ตัวรถ) */
 var carVis=cx_>-230&&cx_<650;
 if(carVis&&t<15.8){var hx=cx_+196,hy=cy_-42;c.save();c.globalCompositeOperation='lighter';var gr=c.createLinearGradient(hx,0,hx+210,0);gr.addColorStop(0,'rgba(255,245,200,.5)');gr.addColorStop(1,'rgba(255,245,200,0)');c.fillStyle=gr;c.beginPath();c.moveTo(hx,hy-4);c.lineTo(hx+210,hy-34);c.lineTo(hx+210,hy+44);c.lineTo(hx,hy+8);c.fill();c.restore()}
 /* วาด CEO (หลังรถ) แล้วค่อยวาดรถ */
 if(ca>0.01){(function(){var mv=(t>=7&&t<9.4)||(t>=10&&t<10.9),row=cf==='right'?3:0,col=mv?1+Math.floor(t*28)%12:0,dh=101*cs,dw=dh*CEO_DW/CEO_DH;c.save();c.globalAlpha=ca;c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(cex,cey+bob,dw*.28,dh*.04,0,0,7);c.fill();CEOIMG(c,col,row,Math.round(cex-dw/2),Math.round(cey+bob-dh),Math.round(dw),Math.round(dh));c.restore()})()}
 if(carVis){
  /* เงารถ */
  c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(cx_+100,cy_-3,92,6,0,0,7);c.fill();
  sprite('car',0,cx_+100,cy_,1,1);
  /* ไฟท้าย */
  var br=(t>6.2&&t<7.4)||(t>12.2&&t<12.9)?1:.35;glow(cx_+10,cy_-44,22,'rgba(255,40,40,A)',.55*br+(t>10.9&&t<12.5?.2:0));
  /* ไฟหน้าเรือง */
  glow(cx_+192,cy_-42,16,'rgba(255,250,215,A)',.8);
 }
 /* อนุภาคควัน */
 if(t>5.9&&t<6.9&&Math.random()<.5)spawn(cx_+60+Math.random()*90,cy_-6,.45,-12,-8,.8);
 if(t>10.9&&t<12.5&&Math.random()<.18)spawn(cx_-2,cy_-14,.28,-26,-14,1.1);
 if(t>12.3&&t<14.6&&Math.random()<.9)spawn(cx_+30,cy_-10,.55+Math.random()*.4,-60,-14,.9);
 drawParts(dt);
 /* เส้นสปีดตอนพุ่งออกไป */
 if(t>13.2&&t<15.6){c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=1;c.beginPath();for(var i=0;i<14;i++){var yy=282+((i*37+Math.floor(t*30)*11)%70),xx=((i*113+t*900)%W);c.moveTo(xx,yy);c.lineTo(xx-40-(i%3)*18,yy)}c.stroke()}
 drawRain(dt);
 /* โทนกลางคืน + วิกเนต */
 c.fillStyle='rgba(8,4,28,.22)';c.fillRect(0,0,W,H);
 var vg=c.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,W*.62);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.6)');c.fillStyle=vg;c.fillRect(0,0,W,H);
 c.restore();
 /* ซับไตเติล */
 subs().forEach(function(s){if(t>=s[0]&&t<=s[1]){var a=clamp(Math.min(t-s[0],s[1]-t)/.35,0,1);var tw=Math.min(1,(t-s[0])/.9);var shown=s[2].slice(0,Math.ceil(s[2].length*tw));c.save();c.globalAlpha=a*.6;c.fillStyle='#000';c.fillRect(0,26,W,26);c.restore();txt(shown,W/2,39,15,'#fff','600',0,a)}});
 /* BAD ENDING */
 if(t>=15.4){var k=clamp((t-15.4)/.4,0,1),sc=lerp(1.9,1,1-Math.pow(1-k,3)),c2=st.cx;
  c2.save();c2.fillStyle='rgba(0,0,0,'+(.45*clamp((t-15.4)/.8,0,1))+')';c2.fillRect(0,0,W,H);
  c2.translate(W/2,150);c2.scale(sc,sc);c2.globalAlpha=k;
  c2.font='900 64px Impact,"Arial Black",'+FONT;c2.textAlign='center';c2.textBaseline='middle';c2.lineWidth=7;c2.lineJoin='round';c2.strokeStyle='#000';c2.strokeText('BAD ENDING',0,0);
  var gg=c2.createLinearGradient(0,-30,0,30);gg.addColorStop(0,'#ff5a5a');gg.addColorStop(1,'#a80f1e');c2.fillStyle=gg;
  if(t<16.1&&Math.random()<.5){c2.fillStyle='#fff'}
  c2.fillText('BAD ENDING',0,0);c2.restore();
  var a2=clamp((t-16.3)/.6,0,1);
  txt('บริษัท '+((S&&S.name)||'My Company')+' ล้มละลาย',W/2,205,17,'#ffe1e1','700',3,a2);
  var a3=clamp((t-17.0)/.6,0,1);
  var day=(S&&S.day)||1,done=(S&&S.tot&&S.tot.done)||0,earn=(S&&S.tot&&S.tot.earn)||0;
  txt('ดำเนินกิจการ '+day+' วัน · งานสำเร็จ '+done+' งาน · รายได้รวม '+M(earn),W/2,232,12,'#e5d9f5','600',3,a3);
 }
 /* แถบหนังสั้น + เฟด */
 c.fillStyle='#000';c.fillRect(0,0,W,22);c.fillRect(0,H-22,W,22);
 var fa=0;if(t<1)fa=1-t;if(t>19)fa=clamp((t-19)/1,0,1);if(fa>0){c.fillStyle='rgba(0,0,0,'+fa+')';c.fillRect(0,0,W,H)}
 audSet(t);
 if(t>=DUR)end();
}
function end(){if(!st.on)return;st.on=0;cancelAnimationFrame(st.raf);audStop();removeEventListener('keydown',kd,true);if(st.ov&&st.ov.parentNode)st.ov.parentNode.removeChild(st.ov);st.ov=null;try{if(!st.pv&&S&&S.over){S.badSeen=1;save(1)}}catch(e){}try{show()}catch(e){}}
function kd(e){e.stopPropagation();if(e.key==='Escape'||e.key===' '||e.key==='Enter'){e.preventDefault();end()}}
function play(pv){if(st.on)return;st.pv=!!pv;st.on=1;st.t0=0;st.parts=[];
 var ov=document.createElement('div');ov.style.cssText='position:fixed;inset:0;z-index:200;background:#000;display:flex;align-items:center;justify-content:center';
 var cv=document.createElement('canvas');cv.width=W;cv.height=H;cv.style.cssText='width:min(100vw,177.78vh);height:auto;aspect-ratio:16/9;image-rendering:pixelated;image-rendering:crisp-edges;background:#000';
 var sk=document.createElement('button');sk.textContent='ข้าม ▸';sk.style.cssText='position:absolute;right:12px;top:10px;z-index:2;background:rgba(0,0,0,.55);color:#fff;border:1px solid rgba(255,255,255,.35);border-radius:6px;padding:6px 12px;font:600 13px '+FONT+';cursor:pointer';sk.onclick=end;
 ov.appendChild(cv);ov.appendChild(sk);document.body.appendChild(ov);st.ov=ov;st.cv=cv;st.cx=cv.getContext('2d');st.cx.imageSmoothingEnabled=false;
 addEventListener('keydown',kd,true);audStart();st.raf=requestAnimationFrame(frame)}
window.BAD={play:play,end:end,hold:function(){return !!(S&&S.over&&!S.badSeen)},check:function(){if(S&&S.over&&!S.badSeen&&!st.on)play()}};
})();

