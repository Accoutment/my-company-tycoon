
/* =====================================================================
   v24 — คัตซีนเปิดเรื่อง (20 วินาที): ก่อนจะมาเป็นเจ้าของบริษัท
   ใช้สไปรต์ CEO จากชีตตัวละคร (แถว: 0=หน้า 1=หลัง 2=ซ้าย 3=ขวา · 4 เฟรมเดิน)
   ===================================================================== */
var INTRO_SPR=new Image();INTRO_SPR.src=window.__CEO_ART.introSpr;
var INTRO_PORT=new Image();INTRO_PORT.src=window.__CEO_ART.introCard;
function playIntro(){
 if(CUT.on)return;CUT.on=1;
 const VW=800,VH=450,DUR=20,SC=[0,5.2,10.4,15.2,20],F="'Noto Sans Thai','Sarabun',system-ui,sans-serif";
 const ov=document.createElement('div');ov.id='teeCut';
 ov.innerHTML='<canvas width="800" height="450"></canvas><button class="btn" id="teeSkip">ข้าม ▶▶</button>';
 document.body.appendChild(ov);
 const g=ov.querySelector('canvas').getContext('2d');
 const c1=v=>Math.max(0,Math.min(1,v)),ez=v=>{v=c1(v);return v*v*(3-2*v)},lerp=(a,b,k)=>a+(b-a)*k;
 const rr=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
 const mix=(a,b,k)=>'rgb('+a.map((v,i)=>Math.round(lerp(v,b[i],k))).join(',')+')';
 const walk=t=>1+Math.floor(t*11)%6;
 function spr(row,fr,x,fy,s,al){g.save();g.globalAlpha=al==null?1:al;g.imageSmoothingEnabled=true;g.drawImage((window.CEOG?CEOG.introSpr():INTRO_SPR),fr*100,row*150,100,150,x-50*s,fy-150*s,100*s,150*s);g.restore()}
 function grad(y0,y1,a,b){const k=g.createLinearGradient(0,y0,0,y1);k.addColorStop(0,a);k.addColorStop(1,b);g.fillStyle=k;g.fillRect(0,y0,VW,y1-y0)}
 function glow(x,y,r,col){const k=g.createRadialGradient(x,y,0,x,y,r);k.addColorStop(0,col);k.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=k;g.fillRect(x-r,y-r,r*2,r*2)}
 function skyline(seed,base,mn,mx,col,lit,t){let x=-10,i=0;while(x<VW){const w=34+rr(seed+i)*50,h=mn+rr(seed+i+50)*(mx-mn);g.fillStyle=col;g.fillRect(x,base-h,w,h+2);
  if(lit)for(let wy=base-h+8;wy<base-8;wy+=13)for(let wx=x+6;wx<x+w-8;wx+=11){const q=rr(seed+wx*7+wy*3);if(q>.55){g.fillStyle=(q>.92&&Math.sin(t*3+wx)>0)?'#fff2a8':'rgba(255,214,110,'+(.3+q*.4)+')';g.fillRect(wx,wy,5,7)}}
  x+=w+2;i++}}
 function rain(t,n,al){g.strokeStyle='rgba(180,200,255,'+al+')';g.lineWidth=1;g.beginPath();for(let i=0;i<n;i++){const x=(((rr(i)*900-t*(70+rr(i+9)*60))%900)+900)%900,y=(rr(i+3)*500+t*(520+rr(i+7)*200))%470;g.moveTo(x,y);g.lineTo(x-4,y+14)}g.stroke()}
 function txt(s,x,y,size,col,al,w){g.save();g.globalAlpha=al==null?1:al;g.font=(w||'700')+' '+size+'px '+F;g.textAlign='center';g.fillStyle=col;g.fillText(s,x,y);g.restore()}

 /* ---- ฉาก 1: เมืองยามค่ำฝนพรำ ---- */
 function sceneA(lt){
  grad(0,360,'#070b18','#1d2b4d');
  glow(640,90,90,'rgba(200,215,255,.22)');g.fillStyle='rgba(225,235,255,.6)';g.beginPath();g.arc(640,90,22,0,7);g.fill();
  skyline(1,335,60,190,'#0e1527',1,lt);skyline(40,352,40,120,'#141d33',1,lt);
  // ตึกบริษัทเดิม
  g.fillStyle='#1b2540';g.fillRect(575,115,190,245);
  for(let wy=130;wy<330;wy+=24)for(let wx=590;wx<750;wx+=22){g.fillStyle=rr(wx+wy)>.35?'rgba(255,225,140,.75)':'#10172b';g.fillRect(wx,wy,12,14)}
  g.fillStyle='#0f1730';g.fillRect(630,318,70,42);g.fillStyle='rgba(255,225,140,.5)';g.fillRect(636,322,26,38);g.fillRect(668,322,26,38);
  g.fillStyle='#0a1022';g.fillRect(590,92,160,24);txt('TECH CORP.',670,110,15,'#8fb4ff',.95,'800');
  // ถนน
  g.fillStyle='#262e41';g.fillRect(0,352,VW,28);g.fillStyle='#0f131d';g.fillRect(0,380,VW,70);
  g.fillStyle='rgba(120,150,220,.12)';for(let i=0;i<9;i++)g.fillRect(i*100-((lt*60)%100),425,48,3);
  // เสาไฟ
  g.fillStyle='#10141f';g.fillRect(246,215,6,140);g.fillRect(236,212,26,5);glow(249,222,140,'rgba(255,220,150,.38)');
  // ตัวละครเดินจากซ้ายไปขวา
  const k=lt/4.7,x=lerp(60,470,ez(k)),mv=k<1;
  g.fillStyle='rgba(0,0,0,.3)';spr(3,mv?walk(lt):0,x,402,1.45);
  g.save();g.globalAlpha=.16;g.translate(0,806);g.scale(1,-1);spr(3,mv?walk(lt):0,x,402,1.45);g.restore();
  rain(lt,120,.38);
 }
 /* ---- ฉาก 2: ทำงานดึก / โดนปฏิเสธ ---- */
 function sceneB(lt){
  let sx=0,sy=0;if(lt>2.2&&lt<2.6){sx=(Math.random()-.5)*8;sy=(Math.random()-.5)*8}
  g.save();g.translate(sx,sy);
  g.fillStyle='#161b29';g.fillRect(-10,-10,VW+20,VH+20);g.fillStyle='#0d1018';g.fillRect(-10,342,VW+20,120);g.fillStyle='#232a3d';g.fillRect(-10,338,VW+20,5);
  // หน้าต่าง
  g.save();g.beginPath();g.rect(50,70,190,180);g.clip();grad(70,250,'#0a1124','#1b2a4a');skyline(7,250,30,110,'#0e1527',1,lt);rain(lt,60,.55);g.restore();
  g.strokeStyle='#2c3550';g.lineWidth=6;g.strokeRect(50,70,190,180);g.lineWidth=3;g.beginPath();g.moveTo(145,70);g.lineTo(145,250);g.moveTo(50,160);g.lineTo(240,160);g.stroke();
  // นาฬิกาเดินเร็ว
  const mins=(23*60+40+Math.floor(lt*60))%1440,hh=String(Math.floor(mins/60)).padStart(2,'0'),mm=String(mins%60).padStart(2,'0');
  g.fillStyle='#0a0d16';g.fillRect(300,56,92,36);g.strokeStyle='#3a4560';g.lineWidth=2;g.strokeRect(300,56,92,36);txt(hh+':'+mm,346,83,24,'#ff7b6b',1,'700');
  // โต๊ะทำงาน + กองกระดาษ + โคมไฟ + กาแฟ
  g.fillStyle='#4a3524';g.fillRect(40,318,300,16);g.fillStyle='#2f2217';g.fillRect(52,334,12,64);g.fillRect(316,334,12,64);
  for(let i=0;i<7;i++){g.fillStyle=i%2?'#e8e4d8':'#f5f1e6';g.fillRect(70+(i%3)*2,314-i*6,60,6)}
  g.fillStyle='#e8e4d8';g.fillRect(150,312,40,5);
  g.fillStyle='#3d4660';g.fillRect(290,262,6,56);g.fillRect(262,258,38,7);glow(268,270,110,'rgba(255,215,140,.28)');
  g.fillStyle='#eee';g.fillRect(212,300,16,18);g.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<3;i++){g.fillRect(216+Math.sin(lt*3+i)*3,288-i*9-((lt*10)%9),3,6)}
  // จอใหญ่ติดผนัง (อีเมล)
  g.fillStyle='#05070d';g.fillRect(530,92,230,176);g.strokeStyle='#394564';g.lineWidth=4;g.strokeRect(530,92,230,176);
  grad(98,262,'#10234a','#0a1530');
  txt('📧 กล่องข้อความ',645,116,13,'#9cc4ff',1,'600');
  g.textAlign='left';g.font='11px '+F;g.fillStyle='#b9c6e0';
  const L=['จาก: ผู้จัดการ','เรื่อง: ข้อเสนอธุรกิจของคุณ','ขออภัย ไอเดียนี้ยังไม่เหมาะ','กับทิศทางของบริษัทในตอนนี้'];
  L.forEach((s,i)=>{if(lt>.5+i*.45){g.globalAlpha=c1((lt-.5-i*.45)/.3);g.fillText(s,544,142+i*20)}});g.globalAlpha=1;
  glow(645,180,260,'rgba(80,140,255,.16)');
  if(lt>2.2){const p=ez((lt-2.2)/.25),s=lerp(2.4,1,p);g.save();g.translate(646,215);g.rotate(-.16);g.scale(s,s);g.globalAlpha=p;g.strokeStyle='#ff4d5e';g.lineWidth=4;g.strokeRect(-76,-26,152,52);g.font='800 34px '+F;g.textAlign='center';g.fillStyle='#ff4d5e';g.fillText('ไม่ผ่าน',0,12);g.restore()}
  // ตัวละคร (หันขวา มองจอ) ไหล่ตกหลังโดนปฏิเสธ
  const bob=lt>2.6?Math.sin(lt*2)*1.2:0;
  spr(3,0,430,392+bob,1.55);
  g.fillStyle='rgba(0,0,0,.28)';g.fillRect(-10,-10,0,0);
  g.restore();
 }
 /* ---- ฉาก 3: ดาดฟ้า ตัดสินใจ ---- */
 function sceneC(lt){
  const p=c1(lt/4.8);
  g.save();const z=1+p*.09;g.translate(VW/2,VH/2);g.scale(z,z);g.translate(-VW/2,-VH/2);
  grad(0,370,mix([12,16,42],[70,120,200],p),mix([34,28,64],[255,176,96],p));
  glow(400,lerp(390,270,ez(p)),260,'rgba(255,190,120,'+(.15+p*.5)+')');
  g.fillStyle=mix([255,210,140],[255,244,200],p);g.beginPath();g.arc(400,lerp(400,275,ez(p)),44,0,7);g.fill();
  for(let i=0;i<6;i++){g.fillStyle='rgba(255,255,255,'+(.05+p*.12)+')';g.beginPath();g.ellipse(((rr(i)*900+lt*8*(1+rr(i+3)))%900)-50,70+i*34,90,12,0,0,7);g.fill()}
  skyline(3,372,70,200,mix([10,15,32],[58,48,78],p),p<.55,lt);skyline(60,385,40,120,mix([8,11,24],[34,28,50],p),0,lt);
  // ดาดฟ้า + ราวกัน
  g.fillStyle='#090c13';g.fillRect(0,388,VW,70);g.fillStyle='#161b28';g.fillRect(0,384,VW,6);
  g.strokeStyle='#1d2335';g.lineWidth=3;g.beginPath();g.moveTo(0,352);g.lineTo(VW,352);g.stroke();for(let x=0;x<VW;x+=50){g.beginPath();g.moveTo(x,352);g.lineTo(x,386);g.stroke()}
  // ตัวละครมองเมืองจากด้านหลัง
  spr(1,(Math.floor(lt/.7)%2)*2,400,420,1.8);
  // ใบลาออกปลิวไป
  if(lt>1.8){const u=(lt-1.8)/3;g.save();g.translate(lerp(440,860,u),340-u*150+Math.sin(lt*6)*16);g.rotate(lt*4);g.fillStyle='#fff';g.fillRect(-9,-12,18,24);g.fillStyle='#9aa4b8';for(let i=0;i<4;i++)g.fillRect(-6,-8+i*5,12,2);g.restore()}
  g.restore();
  g.fillStyle='rgba(0,0,0,'+(.35*(1-p))+')';g.fillRect(0,0,VW,VH);
 }
 /* ---- ฉาก 4: เช้าวันใหม่ หน้าออฟฟิศของตัวเอง + ไตเติล ---- */
 function sceneD(lt){
  grad(0,360,'#8fc7ff','#ffe9c4');glow(120,70,200,'rgba(255,240,190,.7)');
  skyline(9,350,50,130,'#b9c6dc',0,lt);skyline(77,360,30,80,'#9aa9c4',0,lt);
  g.fillStyle='#c9c2b4';g.fillRect(0,352,VW,30);g.fillStyle='#6b7280';g.fillRect(0,382,VW,70);g.fillStyle='#e8e2c8';for(let i=0;i<8;i++)g.fillRect(i*110-((lt*20)%110),414,56,4);
  // ร้าน/ออฟฟิศเล็ก ๆ
  g.fillStyle='#e8d9c0';g.fillRect(390,140,280,214);g.fillStyle='#8a5a33';g.fillRect(380,130,300,16);
  g.fillStyle='#9fd0ee';g.fillRect(410,250,70,70);g.fillRect(590,250,60,70);g.strokeStyle='#8a5a33';g.lineWidth=4;g.strokeRect(410,250,70,70);g.strokeRect(590,250,60,70);
  g.fillStyle='#6b4528';g.fillRect(505,262,62,92);g.fillStyle='#9fd0ee';g.fillRect(512,270,48,44);
  g.fillStyle='#3a3f4b';g.fillRect(420,172,240,50);g.strokeStyle='#8a5a33';g.lineWidth=4;g.strokeRect(420,172,240,50);
  if(lt<1.7){g.save();g.translate(445,285);g.rotate(Math.max(0,(lt-1.4))*3);g.globalAlpha=lt<1.4?1:c1(1-(lt-1.4)*3);g.fillStyle='#fff';g.fillRect(-24,-18,48,36);g.font='700 13px '+F;g.textAlign='center';g.fillStyle='#d33';g.fillText('ให้เช่า',0,5);g.restore()}
  else{const a=ez((lt-1.9)/.5);g.save();g.shadowColor='#ffd45a';g.shadowBlur=24*a;g.globalAlpha=Math.max(.0,a);g.font='800 30px '+F;g.textAlign='center';g.fillStyle='#ffd45a';g.fillText('MY COMPANY',540,208);g.restore()}
  // ตัวละครเดินมาหยุดหน้าร้าน แล้วหันหน้าเข้าหากล้อง
  const k=ez(lt/2.6),x=lerp(60,330,k),mv=lt<2.6;
  if(mv)spr(3,walk(lt),x,404,1.55);else spr(0,0,x,404,1.55);
  // การ์ดไตเติล
  if(lt>2.7){const a=ez((lt-2.7)/.6);g.fillStyle='rgba(6,9,16,'+(.66*a)+')';g.fillRect(0,0,VW,VH);
   const px=lerp(-200,100,a);g.save();g.globalAlpha=a;g.fillStyle='#e0a82e';g.fillRect(px-6,76,143*1.3+12,225*1.3+12);g.drawImage((window.CEOG?CEOG.introCard():INTRO_PORT),px,82,143*1.3,225*1.3);g.restore();
   g.save();g.globalAlpha=a;g.textAlign='left';g.shadowColor='#e0a82e';g.shadowBlur=18;g.font='800 56px '+F;g.fillStyle='#ffd45a';g.fillText('MY COMPANY',330,170);g.shadowBlur=0;g.font='700 40px '+F;g.fillStyle='#fff';g.fillText('T Y C O O N',334,222);
   g.fillStyle='#e0a82e';g.fillRect(332,240,300,3);g.font='600 18px '+F;g.fillStyle='#e8ebf2';g.fillText('เงินทุนตั้งต้น $30,000 · ความฝันหนึ่งอย่าง',332,276);g.fillStyle='#9aa3b2';g.font='15px '+F;g.fillText('ถึงเวลาสร้างบริษัทของคุณ',332,304);g.restore()}
 }
 const CAP=[[.5,4.9,'สามปีก่อน… เขาเป็นแค่พนักงานออฟฟิศธรรมดาคนหนึ่ง'],[5.7,8.1,'ทุกคืนเขาทุ่มเทให้ไอเดียของตัวเอง…'],[8.3,10.2,'แต่คำตอบที่ได้ยินเสมอ คือ “ยังไม่ใช่ตอนนี้”'],[10.9,14.9,'คืนนั้นเขาตัดสินใจ… วางทุกอย่างลง แล้วสร้างบริษัทของตัวเอง'],[15.5,17.7,'เงินเก็บ $30,000 กับความฝันหนึ่งอย่าง']];
 function draw(t){
  const i=t<SC[1]?0:t<SC[2]?1:t<SC[3]?2:3,lt=t-SC[i];
  g.fillStyle='#000';g.fillRect(0,0,VW,VH);
  [sceneA,sceneB,sceneC,sceneD][i](lt);
  // แถบหนังกับคำบรรยาย
  g.fillStyle='#000';g.fillRect(0,0,VW,38);g.fillRect(0,VH-44,VW,44);
  CAP.forEach(c=>{if(t>=c[0]&&t<=c[1])txt(c[2],VW/2,VH-15,18,'#fff',c3(Math.min((t-c[0])/.5,(c[1]-t)/.4)))});
  let a=0;SC.slice(1,4).forEach(b=>{a=Math.max(a,c1(1-Math.abs(t-b)/.3))});
  if(t<.7)a=Math.max(a,1-t/.7);if(t>DUR-.6)a=Math.max(a,(t-(DUR-.6))/.6);
  if(a>0){g.fillStyle='rgba(0,0,0,'+a+')';g.fillRect(0,0,VW,VH)}
 }
 const c3=v=>c1(v);
 let t0=null,raf=0,done=0;
 function frame(ts){if(done)return;if(t0===null)t0=ts;const t=(ts-t0)/1000;if(t>=DUR)return end();draw(t);raf=requestAnimationFrame(frame)}
 function end(){if(done)return;done=1;cancelAnimationFrame(raf);removeEventListener('keydown',kd,true);ov.remove();CUT.on=0;try{S.introSeen=1;save(1)}catch(e){}}
 const kd=e=>{if(e.key===' '||e.key==='Enter'||e.key==='Escape'){e.preventDefault();e.stopPropagation();end()}};
 addEventListener('keydown',kd,true);$('teeSkip').onclick=end;raf=requestAnimationFrame(frame);
}
/* เล่นอัตโนมัติเมื่อเริ่มเกมใหม่ (และเมื่อกด "เริ่มเกมใหม่") */
(function(){var _n=newS;newS=function(){var r=_n.apply(this,arguments);setTimeout(function(){try{if(S&&!S.introSeen&&S.day<=1)playIntro()}catch(e){}},400);return r}})();

