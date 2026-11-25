
/* ============================================================================
 * SNOOKER CLUB — SCENE  (snkst ถนนหน้าร้าน · snkin ภายในร้าน)
 * ใช้ st.place / enter() / st.trans / walkTo / setFade ของเกมเดิมผ่าน __CEO_CTX
 * ภาพฉาก = ภาพที่ผู้ใช้แนบ (street/interior) + ชั้นโค้ด: ป้าย OPEN/CLOSED, NPC เดินเข้า-ออก, ผู้เล่นนั่งโซฟา, ฯลฯ
 * ========================================================================== */
(function(root){
'use strict';
const SN=root.SNOOKER,U=root.CS_UI,A=root.SNK_ASSETS||{};
if(!SN||!U)return;
const X=()=>root.__CEO_CTX;
const IMG={st:new Image(),in:new Image()};IMG.st.src=A.street||'';IMG.in.src=A.interior||'';

/* ---------- ถนน ---------- */
const ST={doorX:486,doorY:300,x0:42,x1:918,y0:312,y1:500};
const ST_SOL=[[186,319,129,37],[657,319,125,37],[370,322,14,30],[582,322,14,30],[114,335,20,16],[854,335,20,16],[790,412,180,100]];
/* ---------- ภายใน ---------- */
const IN={x0:55,x1:925,y0:112,y1:568,exitX:485,exitY:548,hallY:455,dx0:385,dx1:585};
const IN_SOL=[[0,0,760,155],[905,0,55,155],[760,0,145,112],[0,155,55,445],[925,0,35,600],[55,160,150,295],
 [745,190,165,142],[738,366,172,86],[880,330,30,34],[706,398,32,36],[208,398,28,34],[283,412,42,40],[710,254,26,26],
 [415,392,135,58],[285,183,172,86],[505,183,178,86],[285,297,172,82],[505,297,178,82],
 [0,455,385,145],[585,455,375,145]];
const TABLES=[{id:1,x:370,y:283,r:[285,183,172,86]},{id:2,x:592,y:283,r:[505,183,178,86]},{id:3,x:370,y:392,r:[285,297,172,82]},{id:4,x:592,y:392,r:[505,297,178,82]}];
const SOFA=[{id:'s1',x:150,y:252,ax:228,ay:252},{id:'s2',x:146,y:330,ax:228,ay:332},{id:'s3',x:152,y:418,ax:254,ay:420}];
const HS=[
 {id:'counter',x:480,y:468,rx:92,ry:22,msg:'🧾 กด E ที่เคาน์เตอร์: ท้าประลอง · ค่าบริการ · สถิติ'},
 {id:'t1',x:370,y:283,rx:58,ry:16,t:1,msg:'🎱 กด E เล่นที่โต๊ะ 1'},{id:'t2',x:592,y:283,rx:58,ry:16,t:2,msg:'🎱 กด E เล่นที่โต๊ะ 2'},
 {id:'t3',x:370,y:394,rx:58,ry:16,t:3,msg:'🎱 กด E เล่นที่โต๊ะ 3'},{id:'t4',x:592,y:394,rx:58,ry:16,t:4,msg:'🎱 กด E เล่นที่โต๊ะ 4'},
 {id:'bar',x:822,y:352,rx:70,ry:16,msg:'🥤 กด E ซื้อเครื่องดื่มที่บาร์ (฿80)'},
 {id:'skin',x:722,y:296,rx:26,ry:18,msg:'🎨 กด E เปิด SKIN SHOP — สกินลูกสนุกเกอร์ ฿4,000/ชุด'},
 {id:'trophy',x:480,y:164,rx:75,ry:14,msg:'🏆 กด E ดูถ้วยรางวัล · สถิติของคุณ'},
 {id:'rack1',x:312,y:166,rx:44,ry:14,msg:'🎱 ชั้นวางไม้คิว (กด E)'},{id:'rack2',x:652,y:166,rx:44,ry:14,msg:'🎱 ชั้นวางไม้คิว (กด E)'},
 {id:'wcm',x:797,y:134,rx:30,ry:14,msg:'🚹 ห้องน้ำชาย (กด E)'},{id:'wcf',x:860,y:134,rx:30,ry:14,msg:'🚺 ห้องน้ำหญิง (กด E)'},
 {id:'sofa1',x:228,y:252,rx:26,ry:18,sofa:0,msg:'🛋 กด E นั่งโซฟาพักดูเกม'},{id:'sofa2',x:228,y:332,rx:26,ry:18,sofa:1,msg:'🛋 กด E นั่งโซฟาพักดูเกม'},{id:'sofa3',x:254,y:420,rx:26,ry:18,sofa:2,msg:'🛋 กด E นั่งโซฟาพักดูเกม'}];
/* จุดยืนรอบโต๊ะ / บาร์ สำหรับ NPC */
const SPOTS=[[262,222],[470,222],[335,283],[405,283],[560,283],[630,283],[700,222],[700,336],[262,336],[322,394],[362,394],[610,394],[650,394],[270,262],[698,282],[780,352],[866,352],[480,300],[480,250],[480,360],[250,178],[700,178],[420,178],[560,178]];
const SC={ct:0,door:0,vis:[],ped:[],pedT:3,hour:null,sitting:null,sit:0,grid:null,ent:0,closed:false,hs:null};
const SK=()=>root;
const rects=(L,x,y)=>{for(const r of L)if(x>r[0]&&x<r[0]+r[2]&&y>r[1]&&y<r[1]+r[3])return true;return false};
const inFloor=(x,y)=>x>=IN.x0&&x<=IN.x1&&y>=IN.y0&&y<=IN.y1&&(y<=IN.hallY||(x>=IN.dx0&&x<=IN.dx1))&&!rects(IN_SOL,x,y);
function canStand(x,y){
 const s=X().st;
 if(s.place==='snkst')return x>=ST.x0&&x<=ST.x1&&y>=ST.y0&&y<=ST.y1&&!rects(ST_SOL,x,y);
 if(SC.sitting)return false;
 return inFloor(x,y);
}
/* ---------- เวลา/ตารางลูกค้า ---------- */
function hour(){try{const h=X().hour&&X().hour();return typeof h==='number'?h:14}catch(e){return 14}}
function targetCount(h){return h<10?0:h<12?2:h<17?3:h<22?6:h<24?4:0}
function rosterFor(day,n){const L=SN.NPCS.slice(),k=((day||1)*3)%L.length;const R=L.slice(k).concat(L.slice(0,k));return R.slice(0,n)}
/* ---------- เส้นทาง (BFS บนกริด 10px) ---------- */
function gridInit(){if(SC.grid)return SC.grid;const w=96,h=60,ok=new Uint8Array(w*h);for(let j=0;j<h;j++)for(let i=0;i<w;i++){const x=i*10+5,y=j*10+5;ok[j*w+i]=(inFloor(x,y)&&inFloor(x-6,y)&&inFloor(x+6,y)&&inFloor(x,y-4)&&inFloor(x,y+4))?1:0}SC.grid={w,h,ok};return SC.grid}
function nearestOk(G,i,j){if(i>=0&&j>=0&&i<G.w&&j<G.h&&G.ok[j*G.w+i])return[i,j];for(let r=1;r<9;r++)for(let dj=-r;dj<=r;dj++)for(let di=-r;di<=r;di++){const a=i+di,b=j+dj;if(a>=0&&b>=0&&a<G.w&&b<G.h&&G.ok[b*G.w+a])return[a,b]}return null}
function path(x0,y0,x1,y1){
 const G=gridInit();const s=nearestOk(G,Math.floor(x0/10),Math.floor(y0/10)),e=nearestOk(G,Math.floor(x1/10),Math.floor(y1/10));if(!s||!e)return null;
 const N=G.w*G.h,prev=new Int32Array(N).fill(-2),q=[s[1]*G.w+s[0]];prev[q[0]]=-1;const goal=e[1]*G.w+e[0];
 for(let h=0;h<q.length;h++){const c=q[h];if(c===goal)break;const ci=c%G.w,cj=(c/G.w)|0;
  for(const[di,dj]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const a=ci+di,b=cj+dj;if(a<0||b<0||a>=G.w||b>=G.h)continue;const n=b*G.w+a;if(prev[n]!==-2||!G.ok[n])continue;
   if(di&&dj&&(!G.ok[cj*G.w+a]||!G.ok[b*G.w+ci]))continue;prev[n]=c;q.push(n)}}
 if(prev[goal]===-2)return null;
 const P=[];for(let c=goal;c!==-1;c=prev[c])P.push([(c%G.w)*10+5,((c/G.w)|0)*10+5]);P.reverse();
 P.push([x1,y1]);return P}
function mkNpc(n,x,y){return{id:n.id,npc:n,sprite:n.sprite,x,y,d:0,f:Math.random()*4,mv:0,path:null,pi:0,wait:1+Math.random()*3,spot:-1,mode:'idle',sit:null,stuck:0,alpha:1}}
function freeSpot(self){const used=new Set(SC.vis.filter(a=>a!==self&&a.spot>=0).map(a=>a.spot));const free=[];for(let i=0;i<SPOTS.length;i++)if(!used.has(i)&&inFloor(SPOTS[i][0],SPOTS[i][1]))free.push(i);return free.length?free[Math.floor(Math.random()*free.length)]:-1}
function goTo(a,x,y){const p=path(a.x,a.y,x,y);if(p){a.path=p;a.pi=0;a.mode='walk';return true}return false}
function populate(instant){
 const h=hour(),day=(()=>{try{return SN.day()}catch(e){return 1}})(),want=rosterFor(day,targetCount(h));SC.hour=h;
 const have=new Set(SC.vis.map(a=>a.id));
 for(const n of want){if(have.has(n.id))continue;
  const a=mkNpc(n,instant?IN.exitX:IN.exitX+((SC.vis.length%5)-2)*30,IN.exitY);
  if(instant){const sp=freeSpot(a);if(sp>=0){a.x=SPOTS[sp][0];a.y=SPOTS[sp][1];a.spot=sp;a.d=Math.random()<.5?1:3}else{a.x=480;a.y=300}}
  else{a.alpha=0;a.delay=(SC.vis.filter(o=>o.delay!=null&&o.alpha<1).length)*1.8;const sp=freeSpot(a);if(sp>=0){a.spot=sp;goTo(a,SPOTS[sp][0],SPOTS[sp][1]);a.mode='enter'}}
  SC.vis.push(a)}
 // ผู้ที่ไม่อยู่ในรายชื่อแล้ว → เดินออก
 const keep=new Set(want.map(n=>n.id));
 for(const a of SC.vis)if(!keep.has(a.id)&&a.mode!=='leave'){a.sit=null;a.spot=-1;if(goTo(a,IN.exitX,IN.exitY-6))a.mode='leave';else a.mode='leave'}
}
function stepNpc(a,dt){
 if(a.delay>0){a.delay-=dt;return}
 if(a.mode==='enter'&&a.alpha<1)a.alpha=Math.min(1,a.alpha+dt*2.5);
 if(a.mode==='walk'||a.mode==='enter'||a.mode==='leave'){
  if(!a.path||a.pi>=a.path.length){
   if(a.mode==='leave'){a.dead=true;return}
   a.mode='idle';a.mv=0;a.wait=3+Math.random()*7;return}
  const tg=a.path[a.pi],dx=tg[0]-a.x,dy=tg[1]-a.y,d=Math.hypot(dx,dy),v=a.mode==='leave'?48:40;
  if(d<2.5){a.pi++;return}
  // ไม่เดินทะลุผู้เล่น/NPC อื่น
  const nx=a.x+dx/d*v*dt,ny=a.y+dy/d*v*dt;let blocked=false;const s=X().st;
  if(s.place==='snkin'&&!s.hidden&&Math.hypot(nx-s.x,ny-s.y)<15&&Math.hypot(a.x-s.x,a.y-s.y)>=Math.hypot(nx-s.x,ny-s.y)-.01)blocked=true;
  for(const o of SC.vis)if(o!==a&&!o.dead&&!(o.delay>0)&&Math.hypot(nx-o.x,ny-o.y)<14&&Math.hypot(a.x-o.x,a.y-o.y)>Math.hypot(nx-o.x,ny-o.y)){blocked=true;break}
  if(blocked){a.mv=0;a.stuck+=dt;
   // หลบข้าง (เดินอ้อมผู้เล่น/NPC คนอื่น) แทนการยืนติด
   const px=-dy/d,py=dx/d;let moved=false;
   for(const sg of(a.stuck>1?[-1,1]:[1,-1])){const sx=a.x+px*sg*v*dt*1.3,sy=a.y+py*sg*v*dt*1.3;
    if(!inFloor(sx,sy))continue;let hit=false;const s2=X().st;
    if(s2.place==='snkin'&&!s2.hidden&&Math.hypot(sx-s2.x,sy-s2.y)<13)hit=true;
    for(const o of SC.vis)if(o!==a&&!o.dead&&Math.hypot(sx-o.x,sy-o.y)<12){hit=true;break}
    if(!hit){a.x=sx;a.y=sy;a.mv=1;a.f+=dt*5;a.d=Math.abs(px)>Math.abs(py)?(px*sg<0?1:3):(py*sg<0?2:0);moved=true;break}}
   if(!moved&&a.stuck>2.5){a.stuck=0;if(a.mode!=='leave'){const sp=freeSpot(a);if(sp>=0){a.spot=sp;goTo(a,SPOTS[sp][0],SPOTS[sp][1])}}else if(a.pi<a.path.length-1)a.pi++}
   return}
  a.stuck=0;a.x=nx;a.y=ny;a.mv=1;a.f+=dt*5;a.d=Math.abs(dx)>Math.abs(dy)?(dx<0?1:3):(dy<0?2:0);return}
 if(a.mode==='sit'){a.mv=0;a.wait-=dt;if(a.wait<=0){a.mode='idle';a.sit=null;a.y+=0;a.wait=1}return}
 // idle
 a.mv=0;a.wait-=dt;
 if(a.wait<=0){
  const r=Math.random();
  if(r<.2){ // นั่งโซฟาดูเกม
   const used=new Set(SC.vis.filter(o=>o!==a&&o.sit!=null).map(o=>o.sit));const free=SOFA.map((_,i)=>i).filter(i=>!used.has(i)&&!(SC.sitting&&SC.sitting.i===i));
   if(free.length){const i=free[Math.floor(Math.random()*free.length)];const sf=SOFA[i];if(goTo(a,sf.ax,sf.ay)){a.sit=i;a.mode='walk';a.onArrive='sit';a.spot=-1;return}}}
  const sp=freeSpot(a);if(sp>=0&&goTo(a,SPOTS[sp][0],SPOTS[sp][1])){a.spot=sp;a.onArrive=null}else a.wait=2}
}
function arrive(a){ // เมื่อถึงปลายทาง
 if(a.onArrive==='sit'&&a.sit!=null){const sf=SOFA[a.sit];a.x=sf.x;a.y=sf.y;a.d=3;a.mode='sit';a.wait=10+Math.random()*16;a.onArrive=null;return true}
 return false}
function npcDraw(g,a,t){X().drawStreetNPC(g,{kind:'customer',id:a.sprite,x:a.x,y:a.y,d:a.d,f:(a.f|0)%4,mv:a.mv},t)}

/* ---------- ฮอตสปอต ---------- */
function hotspot(){
 const s=X().st;let best=null,bd=1e9;
 for(const h of HS){const dx=Math.abs(s.x-h.x),dy=Math.abs(s.y-h.y);if(dx<h.rx&&dy<h.ry){const d=dx/h.rx+dy/h.ry;if(d<bd){bd=d;best=h}}}
 return best}
function nearNpc(){
 const s=X().st;if(s.place!=='snkin')return null;let b=null,bd=34;
 for(const a of SC.vis){if(a.dead||a.mode==='leave'||a.alpha<1)continue;const d=Math.hypot(a.x-s.x,a.y-s.y);if(d<bd){bd=d;b=a}}return b}
function lock(on){const s=X().st;s.keys={};s.moving=0;try{if(root.JOY){JOY.x=0;JOY.y=0}}catch(e){}if(on)s.talk={snk:1,acts:[]};else if(!SC.sitting)s.talk=null}
function open(){return SN.isOpen()}
function prompt(){
 const x=X(),s=x.st;if(s.sleep||s.trans||s.mode!=='scene'||s.talk)return'';
 if(s.place==='snkst'){
  if(Math.abs(s.x-ST.doorX)<95&&s.y<ST.y0+60)return open()?'🚪 ENTER SNOOKER CLUB — กด E / ปุ่มโต้ตอบ':'🔒 SNOOKER CLUB ปิดอยู่ (เปิด 10:00–24:00)';
  if(s.x<=150)return'⬅ เดินต่อไปทางซ้ายสุดเพื่อกลับไปถนนหน้าโชว์รูมรถ';
  if(s.x>=x.W-150)return'➡ เดินต่อไปทางขวาสุดเพื่อไปอควาเรียม';
  return''}
 if(SC.sitting)return'🛋 กด E / ปุ่มกลับ เพื่อลุกขึ้น';
 const n=nearNpc();if(n)return'💬 กด E คุยกับ '+n.npc.name+' · '+n.npc.title+' (Lv.'+n.npc.level+')';
 const h=hotspot();if(h)return h.msg;
 if(s.y>=IN.hallY+60&&Math.abs(s.x-IN.exitX)<90)return'🚪 เดินลง / กด E เพื่อออกจากร้าน';
 return''}
function hud(g){
 const x=X(),W=x.W,H=x.H,s=x.st;const pm=prompt();
 if(pm){g.fillStyle='rgba(16,24,39,.86)';g.fillRect(W/2-290,H-146,580,30);g.fillStyle='#3ddc84';g.fillRect(W/2-290,H-146,580,2);g.fillStyle='#ffe39b';g.font='bold 15px sans-serif';g.textAlign='center';g.fillText(pm,W/2,H-125)}
 if(s.place==='snkin'){ // ป้ายเวลาเปิด
  g.save();g.font='bold 11px sans-serif';g.textAlign='left';const t='🎱 SNOOKER CLUB · '+(open()?'เปิด':'ปิด')+' 10:00–24:00 · ลูกค้าในร้าน '+SC.vis.filter(a=>!a.dead).length;const w=g.measureText(t).width+14;g.fillStyle='rgba(10,8,6,.78)';g.fillRect(8,8,w,20);g.fillStyle=open()?'#7be39a':'#ff8a7a';g.fillText(t,15,22);g.restore()}
}

/* ---------- init ---------- */
function init(place,from){
 const x=X(),s=x.st;s.hidden=false;SC.sitting=null;SC.sit=0;SC.door=0;
 try{const m=SN.state();if(m&&m.match&&!m.match.settled&&place==='snkin')setTimeout(()=>{if(X().st.place==='snkin')U.toast('🎱 มีแมตช์ค้างอยู่ — เล่นต่อได้ที่เคาน์เตอร์')},1200)}catch(e){}
 if(place==='snkst'){
  SC.ped=[];SC.pedT=2;SC.ct=0;
  if(from==='carst'){s.x=-26;s.y=372;s.dir=3;s.trans={type:'arrive',t:0,toX:96,toY:372};x.setFade(1)}
  else if(from==='snkin'){s.x=ST.doorX;s.y=ST.doorY+2;s.dir=0;s.trans={type:'arrive',t:0,toX:ST.doorX,toY:338};x.setFade(1);SC.door=1}
  else if(from==='aqst'){s.x=x.W+26;s.y=372;s.dir=1;s.trans={type:'arrive',t:0,toX:864,toY:372};x.setFade(1)}
  else{s.x=ST.doorX;s.y=350;s.dir=2}
 }else{
  SC.vis=[];SC.ct=0;populate(true);
  s.x=IN.exitX;s.y=IN.exitY+22;s.dir=2;s.trans={type:'arrive',t:0,toX:IN.exitX,toY:518};x.setFade(1);
  if(!open())setTimeout(()=>{},0)}
}
/* ---------- วาดถนน ---------- */
function drawSt(g,t){
 const x=X(),s=x.st,W=x.W,H=x.H,dt=Math.min(.05,Math.max(0,(t-(SC.ct||t))/1000));SC.ct=t;
 g.fillStyle='#262a33';g.fillRect(0,0,W,H);
 if(IMG.st.complete&&IMG.st.naturalWidth)g.drawImage(IMG.st,-120,0,1200,600);
 // คนเดินถนน: ผ่านไปมา / เดินเข้าร้าน / เดินออกจากร้าน
 SC.pedT-=dt;
 if(SC.pedT<=0&&SC.ped.length<7){SC.pedT=3+Math.random()*6;
  const ids=SN.NPCS.map(n=>n.sprite);const sp=ids[Math.floor(Math.random()*ids.length)],r=Math.random(),isOpen=open();
  if(r<.34&&isOpen)SC.ped.push({sprite:sp,mode:'in',x:Math.random()<.5?-20:W+20,y:338+Math.random()*6,d:3,f:0,mv:1,v:44,al:1});
  else if(r<.62&&isOpen)SC.ped.push({sprite:sp,mode:'out',x:ST.doorX,y:ST.doorY+14,d:0,f:0,mv:1,v:44,al:0,dirx:Math.random()<.5?-1:1});
  else{const dir=Math.random()<.5?1:-1;SC.ped.push({sprite:sp,mode:'pass',x:dir>0?-20:W+20,y:[352,364,376][Math.floor(Math.random()*3)],d:dir>0?3:1,f:0,mv:1,v:34+Math.random()*14,al:1,dirx:dir})}}
 for(const a of SC.ped){a.f+=dt*5;
  if(a.mode==='pass'){a.x+=a.dirx*a.v*dt;if(a.x<-40||a.x>W+40)a.dead=true}
  else if(a.mode==='in'){const dx=ST.doorX-a.x;if(Math.abs(dx)>3&&a.y>=ST.doorY+30){a.x+=Math.sign(dx)*a.v*dt;a.d=dx>0?3:1}else{a.x=ST.doorX;a.y-=a.v*dt*.8;a.d=2;a.al=Math.max(0,(a.y-(ST.doorY+4))/22);SC.door=Math.max(SC.door,.8);if(a.y<=ST.doorY+4)a.dead=true}
   if(Math.abs(dx)<=3&&a.y>ST.doorY+30)a.y-=a.v*dt*.8}
  else if(a.mode==='out'){a.y+=a.v*dt*.7;a.al=Math.min(1,a.al+dt*3);if(a.y>ST.doorY+34){a.x+=a.dirx*a.v*dt;a.d=a.dirx>0?3:1;a.y=Math.min(a.y,338)}if(a.x<-40||a.x>W+40)a.dead=true;if(a.y<ST.doorY+34)SC.door=Math.max(SC.door,.8)}}
 SC.ped=SC.ped.filter(a=>!a.dead);
 const objs=[];
 SC.ped.forEach(a=>objs.push({y:a.y,draw:()=>{g.save();g.globalAlpha=a.al;X().drawStreetNPC(g,{kind:'customer',id:a.sprite,x:a.x,y:a.y,d:a.d,f:(a.f|0)%4,mv:a.mv},t);g.restore()}}));
 if(!s.hidden)objs.push({y:s.y,draw:()=>x.drawCEO(g)});
 objs.sort((a,b)=>a.y-b.y);objs.forEach(o=>o.draw());
 // ป้าย OPEN/CLOSED ที่ประตู + แสงเปิดประตู
 const op=open();g.save();g.font='bold 10px sans-serif';g.textAlign='center';g.fillStyle='rgba(8,6,4,.85)';g.fillRect(ST.doorX-28,266,56,15);g.strokeStyle=op?'#3ddc84':'#ff5a4d';g.lineWidth=1.5;g.strokeRect(ST.doorX-28,266,56,15);g.fillStyle=op?'#7be39a':'#ff8a7a';g.fillText(op?'● OPEN':'● CLOSED',ST.doorX,277);g.restore();
 const tr=s.trans,near=(Math.abs(s.x-ST.doorX)<120&&s.y<ST.y0+70&&op)||(tr&&tr.type==='skIn');
 SC.dk=(SC.dk||0)+((near?1:0)-(SC.dk||0))*Math.min(1,dt*6);SC.door=Math.max(0,SC.door-dt*1.6);
 const k=Math.max(SC.dk,SC.door);
 if(k>.02&&op){const gr=g.createLinearGradient(0,190,0,300);gr.addColorStop(0,'rgba(255,236,170,'+(.12*k)+')');gr.addColorStop(1,'rgba(255,214,120,'+(.34*k)+')');g.fillStyle=gr;g.fillRect(ST.doorX-48,190,96,110)}
 const dl=x.sceneDaylight();if(dl<1){g.fillStyle='rgba(6,10,34,'+((1-dl)*.26).toFixed(3)+')';g.fillRect(0,0,W,H)}
}
/* ---------- วาดภายใน ---------- */
function drawSeatedP(g){
 const x=X(),s=x.st,sf=SC.sitting,k=Math.min(1,SC.sit);const ox=s.x,oy=s.y,od=s.dir;
 s.dir=3;s.x=sf.x;s.y=sf.y+k*6;s.moving=0;s.frame=0;
 g.save();g.beginPath();g.rect(0,0,960,sf.y+4);g.clip();x.drawCEO(g);g.restore();s.x=ox;s.y=oy;s.dir=od}
function drawKiosk(g,t){ // แท่นโชว์ SKIN SHOP (วาดด้วยโค้ด) แสดงลูกของสกินที่ติดตั้ง/สกินแรกของร้าน
 const K=SN.SKIN;let d=K&&K.equipped();if(!d&&K)d=K.list().find(x=>x.available&&x.hasSprites);
 const x=723,y=280;g.save();
 g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x,y+2,17,5,0,0,7);g.fill();
 g.fillStyle='#3a2410';g.fillRect(x-11,y-18,22,20);g.fillStyle='#5c3a1c';g.fillRect(x-11,y-18,22,4);g.fillStyle='#c9a24a';g.fillRect(x-13,y-21,26,3);
 if(d&&d.hasSprites){const k=d.id+'_kiosk';SC._ki=SC._ki||{};if(!SC._ki[k]){const i=new Image();i.src=d.sprites[d.preview];SC._ki[k]=i}const i2=SC._ki[k];
  if(i2.complete&&i2.naturalWidth){const yy=y-34+Math.sin(t/500)*1.5;g.save();g.translate(x,yy);g.rotate(t/2400);g.drawImage(i2,-12,-12,24,24);g.restore()}}
 g.font='bold 8px sans-serif';g.textAlign='center';g.fillStyle='#ffd96b';g.fillText('SKIN SHOP',x,y-52);
 g.restore()}
function drawIn(g,t){
 const x=X(),s=x.st,W=x.W,H=x.H,dt=Math.min(.05,Math.max(0,(t-(SC.ct||t))/1000));SC.ct=t;
 g.fillStyle='#120c10';g.fillRect(0,0,W,H);
 if(IMG.in.complete&&IMG.in.naturalWidth)g.drawImage(IMG.in,30,0,900,600);
 // ปรับจำนวนลูกค้าตามเวลา (เข้า-ออกทางประตู)
 const h=hour();if(Math.floor(h*2)!==SC.hour2){SC.hour2=Math.floor(h*2);populate(false)}
 for(const a of SC.vis){stepNpc(a,dt);if(a.mode==='idle'&&a.onArrive==='sit'&&a.sit!=null)arrive(a);
  if((a.mode==='walk')&&(!a.path||a.pi>=a.path.length)&&a.onArrive==='sit')arrive(a)}
 SC.vis=SC.vis.filter(a=>!a.dead);
 drawKiosk(g,t);
 const objs=[];
 SC.vis.forEach(a=>objs.push({y:a.y,draw:()=>{g.save();g.globalAlpha=a.alpha;
  if(a.mode==='sit'){g.beginPath();g.rect(0,0,960,a.y+3);g.clip()}
  npcDraw(g,a,t);g.restore();
  if(a.mode==='sit'&&0){}}}));
 if(!s.hidden){if(SC.sitting)objs.push({y:SC.sitting.y+3,draw:()=>drawSeatedP(g)});else objs.push({y:s.y,draw:()=>x.drawCEO(g)})}
 objs.sort((a,b)=>a.y-b.y);objs.forEach(o=>o.draw());
 // ป้ายชื่อเมื่ออยู่ใกล้
 const nn=nearNpc();if(nn&&!s.talk){g.save();g.font='bold 11px sans-serif';g.textAlign='center';const w=g.measureText(nn.npc.name).width+14;g.fillStyle='rgba(10,8,6,.85)';g.fillRect(nn.x-w/2,nn.y-62,w,16);g.fillStyle=nn.npc.color;g.fillRect(nn.x-w/2,nn.y-62,w,2);g.fillStyle='#fff';g.fillText(nn.npc.name+' · Lv.'+nn.npc.level,nn.x,nn.y-50);g.restore()}
 // ร้านปิด → ออกจากร้าน
 if(!open()&&!s.trans&&!s.talk&&!SC.sitting&&!SC.closeWarned){SC.closeWarned=true;x.toast('🕛 SNOOKER CLUB ปิดแล้ว — เชิญออกจากร้าน');outBegin()}
 if(open())SC.closeWarned=false;
}
function draw(g,t){const s=X().st;if(s.place==='snkst')drawSt(g,t);else drawIn(g,t)}

/* ---------- ขอบฉาก ---------- */
function edges(dx,dy){
 const s=X().st;if(s.trans||s.talk)return;
 if(s.place==='snkst'){if(dx<0&&s.x<=ST.x0+6)leave(-1);else if(dx>0&&s.x>=ST.x1-6)leave(1);return}
 if(s.place==='snkin'&&!SC.sitting&&dy>0&&s.y>=IN.hallY+82&&Math.abs(s.x-IN.exitX)<95)outBegin();
}
function leave(side){const x=X(),s=x.st;if(s.place!=='snkst'||!x.transLock())return;s.trans={type:'skLeave',side,t:0};x.toast(side<0?'⬅ เดินกลับไปถนนหน้าโชว์รูมรถ':'➡ เดินต่อไปอควาเรียม')}
function inBegin(){const x=X(),s=x.st;if(s.place!=='snkst'||!x.transLock())return;if(!open()){x.toast('🔒 SNOOKER CLUB ปิดอยู่ — เปิด 10:00–24:00');return}s.trans={type:'skIn',t:0,ph:0}}
function outBegin(){const x=X(),s=x.st;if(s.place!=='snkin'||SC.sitting||!x.transLock())return;s.trans={type:'skOut',t:0,ph:0}}
function sitBegin(i){const x=X(),s=x.st;if(s.place!=='snkin'||SC.sitting||!x.transLock())return;const used=SC.vis.some(a=>a.sit===i);if(used){x.toast('มีคนนั่งโซฟาตัวนี้อยู่แล้ว');return}s.trans={type:'skSit',t:0,ph:0,i}}
function standUp(){const x=X(),s=x.st;if(!SC.sitting||s.trans)return;s.talk=null;s.trans={type:'skStand',t:0}}
function trans(tr,dt){
 const x=X(),s=x.st;
 if(tr.type==='skIn'){
  if(tr.ph===0){if(x.walkTo(ST.doorX,ST.doorY+4,130,dt)){tr.ph=1;tr.t=0}}
  else{const k=Math.min(1,tr.t/1.1);s.y=ST.doorY+4-k*30;s.dir=2;s.moving=1;s.frame=(s.frame+dt*7)%4;x.setFade(Math.max(0,(k-.45)/.55));if(k>=1){s.moving=0;s.trans=null;x.enter('snkin',{from:'snkst'})}}
  return true}
 if(tr.type==='skOut'){
  if(tr.ph===0){if(x.walkTo(IN.exitX,IN.exitY-4,130,dt)){tr.ph=1;tr.t=0}}
  else{const k=Math.min(1,tr.t/.8);s.y=IN.exitY-4+k*30;s.dir=0;s.moving=1;s.frame=(s.frame+dt*7)%4;x.setFade(k);if(k>=1){s.moving=0;s.trans=null;x.enter('snkst',{from:'snkin'})}}
  return true}
 if(tr.type==='skLeave'){
  s.x+=tr.side*135*dt;s.dir=tr.side<0?1:3;s.moving=1;s.frame=(s.frame+135*dt/15)%4;x.setFade(Math.min(1,Math.max(0,(tr.t-.1)/.6)));
  if(tr.t>=.8){s.moving=0;s.trans=null;if(tr.side<0)x.enter('carst',{from:'snkst'});else x.enter('aqst',{from:'carst'})}
  return true}
 if(tr.type==='skSit'){
  const sf=SOFA[tr.i];
  if(tr.ph===0){if(x.walkTo(sf.ax,sf.ay,110,dt)){tr.ph=1;tr.t=0;s.dir=1;s.moving=0}}
  else{SC.sitting={i:tr.i,x:sf.x,y:sf.y};SC.sit=Math.min(1,tr.t/.5);s.moving=0;s.dir=3;if(tr.t>=.6){s.trans=null;SC.sit=1;s.x=sf.x;s.y=sf.y}}
  return true}
 if(tr.type==='skStand'){
  if(tr.t>=.4){const sf=SOFA[SC.sitting.i];SC.sitting=null;SC.sit=0;s.x=sf.ax;s.y=sf.ay;s.dir=3;s.moving=0;s.trans=null;lock(false)}
  return true}
 return false}
/* ---------- โต้ตอบ ---------- */
const SAY=['“เจอกันที่โต๊ะนะ ขอแบบยุติธรรม”','“วันนี้ฟอร์มกำลังมา”','“ท้าได้เลย ผมไม่ถอย”','“เล่นสนุกเกอร์ต้องใจเย็น ๆ”'];
function talkNpc(a){
 const n=a.npc;const r=SN.state().npcs[n.id];
 const l=(n.lines&&n.lines[Math.floor(Math.random()*n.lines.length)])||SAY[Math.floor(Math.random()*SAY.length)];
 X().toast(n.av+' '+n.name+' (Lv.'+n.level+'): '+l);
 lock(true);U.openSnookerClub(n.id,null,1)}
function interact(){
 const x=X(),s=x.st;if(s.trans||s.talk||s.sleep)return;
 if(s.place==='snkst'){
  if(Math.abs(s.x-ST.doorX)<95&&s.y<ST.y0+60){inBegin();return}
  x.toast('🎱 SNOOKER CLUB อยู่ตรงหน้า · เดินไปที่ประตูกลางร้านแล้วกด E');return}
 if(SC.sitting){standUp();return}
 const n=nearNpc();if(n){talkNpc(n);return}
 const h=hotspot();
 if(h){
  if(h.sofa!=null){sitBegin(h.sofa);return}
  if(h.t){lock(true);U.openSnookerClub(null,null,h.t);return}
  if(h.id==='counter'){x.toast('🧾 พนักงาน: “ยินดีต้อนรับค่ะ เลือกคู่แข่งและโต๊ะได้เลย”');lock(true);U.openSnookerClub(null,null,1);return}
  if(h.id==='bar'){U.snookerDrink();return}
  if(h.id==='skin'){lock(true);U.openSkinShop();return}
  if(h.id==='trophy'){lock(true);U.snookerStats();return}
  if(h.id==='rack1'||h.id==='rack2'){x.toast('🎱 ชั้นไม้คิวของร้าน — ทุกโต๊ะมีไม้คิวให้ใช้ ไม่ต้องจ่ายเพิ่ม');return}
  if(h.id==='wcm'||h.id==='wcf'){x.toast(h.id==='wcm'?'🚹 ห้องน้ำชาย: สะอาดเรียบร้อย':'🚺 ห้องน้ำหญิง: สะอาดเรียบร้อย');return}}
 if(s.y>=IN.hallY+60&&Math.abs(s.x-IN.exitX)<90){outBegin();return}
 x.toast('🎱 SNOOKER CLUB · เคาน์เตอร์/โต๊ะ=ท้าประลอง · บาร์=เครื่องดื่ม · ถ้วยรางวัล=สถิติ · โซฟา=นั่งพัก')}
function back(){const x=X(),s=x.st;if(s.trans||s.talk||s.sleep)return;
 if(s.place==='snkst'){leave(-1);return}
 if(SC.sitting){standUp();return}
 outBegin()}
function reset(){SC.sitting=null;SC.sit=0}

root.SNOOKER_SCENE={canStand,draw,hud,edges,trans,interact,back,init,prompt,reset,SC,HS,IN,ST,TABLES,SOFA,SPOTS,inFloor,path,hotspot,nearNpc,hour,targetCount,rosterFor,populate,IN_SOL,ST_SOL,standUp};

/* ---------- ผูกฐานข้อมูล/เซฟ ---------- */
SN.setEnv({getS:()=>{try{return typeof S!=='undefined'?S:null}catch(e){return null}},save:()=>{try{save(1)}catch(e){}},day:()=>{try{return S.day||1}catch(e){return 1}},hour:()=>hour()});
})(typeof window!=='undefined'?window:globalThis);

