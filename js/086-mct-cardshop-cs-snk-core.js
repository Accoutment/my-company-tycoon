
/* ============================================================================
 * SNOOKER CLUB — CORE: ฟิสิกส์ลูก 22 ลูก · กติกาสนุกเกอร์มาตรฐาน · AI 7 ระดับ · ข้อมูลเซฟ
 * หน่วย: มิลลิเมตร / วินาที · แกน y ชี้ขึ้น · baulk อยู่ซ้าย (x=0) · ขอบ top (สีดำ) อยู่ขวา (x=L)
 * ไม่มีการสุ่มผลแพ้ชนะ/คะแนน — ทุกอย่างมาจากการจำลองฟิสิกส์ของลูกจริง
 * ========================================================================== */
(function(root){
'use strict';
const SN={};
/* ---------- ค่าคงที่โต๊ะ/ลูก ---------- */
const R=26.25, L=3569, WD=1778, MID=WD/2;
const G=9810, MUS=0.2, MUR=0.061, MUBB=0.05, EBB=0.94, EW=0.72, MUW=0.16, WZDEC=0.55;
const VMAX=5200;                  // ความเร็วสูงสุดของลูกขาว (mm/s)
const BAULK=737, DR=292;          // เส้น baulk / รัศมี D
const SPOT={Y:[BAULK,MID-DR],G:[BAULK,MID+DR],N:[BAULK,MID],B:[L/2,MID],P:[(L/2+L)/2,MID],K:[L-324,MID]};
const VAL={R:1,Y:2,G:3,N:4,B:5,P:6,K:7};
const SEQ=['Y','G','N','B','P','K'];
const CORNER_GAP=82, MID_GAP=64;
/* ตะเข็บขอบยาง (inward normal) */
const SEGS=[
 {x1:CORNER_GAP,y1:0,x2:L/2-MID_GAP,y2:0,nx:0,ny:1},{x1:L/2+MID_GAP,y1:0,x2:L-CORNER_GAP,y2:0,nx:0,ny:1},
 {x1:CORNER_GAP,y1:WD,x2:L/2-MID_GAP,y2:WD,nx:0,ny:-1},{x1:L/2+MID_GAP,y1:WD,x2:L-CORNER_GAP,y2:WD,nx:0,ny:-1},
 {x1:0,y1:CORNER_GAP,x2:0,y2:WD-CORNER_GAP,nx:1,ny:0},{x1:L,y1:CORNER_GAP,x2:L,y2:WD-CORNER_GAP,nx:-1,ny:0}];
const POCKETS=[ // หลุม 6 หลุม (ศูนย์กลาง, รัศมีดูดลูก)
 {x:-14,y:-14,r:72,k:'c'},{x:L+14,y:-14,r:72,k:'c'},{x:-14,y:WD+14,r:72,k:'c'},{x:L+14,y:WD+14,r:72,k:'c'},
 {x:L/2,y:-28,r:62,k:'m'},{x:L/2,y:WD+28,r:62,k:'m'}];
SN.K={R,L,WD,MID,BAULK,DR,SPOT,VAL,SEQ,SEGS,POCKETS,VMAX,G};

/* ---------- RNG (กำหนด seed ได้ เพื่อทดสอบซ้ำ) ---------- */
function mkRng(seed){let s=(seed>>>0)||123456789;return function(){s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296}}
function gauss(r){let u=0,v=0;while(!u)u=r();v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
SN.mkRng=mkRng;

/* ---------- สร้างลูก 22 ลูก ---------- */
function mkBall(id,type,x,y){return {id,type,v:type==='cue'?0:VAL[id[0]==='R'?'R':id],x,y,vx:0,vy:0,wx:0,wy:0,wz:0,out:false}}
function rackBalls(){
 const B=[];
 B.push(mkBall('W','cue',BAULK-DR*0.5,MID));
 const apex=SPOT.P[0]+2*R+0.4,dx=Math.sqrt(3)*R+0.3;let n=1;
 for(let row=0;row<5;row++)for(let j=0;j<=row;j++){B.push(mkBall('R'+(n++),'red',apex+row*dx,MID+(j-row/2)*(2*R+0.4)))}
 SEQ.forEach(c=>B.push(mkBall(c,'colour',SPOT[c][0],SPOT[c][1])));
 return B;
}
SN.rackBalls=rackBalls;
const byId=(B,id)=>{for(let i=0;i<B.length;i++)if(B[i].id===id)return B[i];return null};
SN.byId=byId;

/* ---------- ฟิสิกส์ ---------- */
function newSim(balls){return {balls,t:0,ev:{first:null,cushionAfter:false,potted:[],cueCush:0,hits:0,snd:[]},rec:null}}
SN.newSim=newSim;
function snd(sim,type,v,x,y){if(sim.ev.snd.length<400)sim.ev.snd.push({t:type,v:v,x:x,y:y})}
function advance(b,dt){
 // 1) แรงเสียดทานผ้า: ลื่น (sliding) → กลิ้ง (rolling)
 let rem=dt,guard=0;
 while(rem>1e-9&&guard++<4){
  const ux=b.vx-R*b.wy,uy=b.vy+R*b.wx,us=Math.hypot(ux,uy);
  if(us>6){
   const tr=us/(3.5*MUS*G),h=Math.min(rem,tr),ax=-MUS*G*ux/us,ay=-MUS*G*uy/us,k=5*MUS*G/(2*R);
   b.x+=b.vx*h+0.5*ax*h*h;b.y+=b.vy*h+0.5*ay*h*h;
   b.vx+=ax*h;b.vy+=ay*h;b.wx+=-k*uy/us*h;b.wy+=k*ux/us*h;rem-=h;
   if(h>=tr-1e-12){b.wy=b.vx/R;b.wx=-b.vy/R}
  }else{
   const sp=Math.hypot(b.vx,b.vy);
   if(sp<=MUR*G*rem+1e-9){ // หยุด
    const t=sp/(MUR*G+1e-9);b.x+=b.vx*t*0.5;b.y+=b.vy*t*0.5;b.vx=b.vy=0;b.wx=b.wy=0;rem=0;break}
   const a=MUR*G,ax=-b.vx/sp*a,ay=-b.vy/sp*a;
   b.x+=b.vx*rem+0.5*ax*rem*rem;b.y+=b.vy*rem+0.5*ay*rem*rem;b.vx+=ax*rem;b.vy+=ay*rem;
   b.wy=b.vx/R;b.wx=-b.vy/R;rem=0}
 }
 // สปินด้านข้าง (english) ค่อย ๆ ลดลง
 if(b.wz!==0){const d=WZDEC*dt*(G/R*0.03)+b.wz*0;const a=Math.abs(b.wz);b.wz=a<=d*2?0:(b.wz>0?1:-1)*(a-d*2)*Math.exp(-0.35*dt)}
}
function ballBall(sim,a,b){
 const dx=b.x-a.x,dy=b.y-a.y,d2=dx*dx+dy*dy,m=2*R;
 if(d2>=m*m)return;
 const d=Math.sqrt(d2)||1e-6,nx=dx/d,ny=dy/d,tx=-ny,ty=nx;
 const ov=m-d;a.x-=nx*ov*0.5;a.y-=ny*ov*0.5;b.x+=nx*ov*0.5;b.y+=ny*ov*0.5;
 const vn=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;
 if(vn<=0)return; // แยกกันอยู่แล้ว
 const J=(1+EBB)*vn/2;
 a.vx-=J*nx;a.vy-=J*ny;b.vx+=J*nx;b.vy+=J*ny;
 // แรงเสียดทานระหว่างลูก (ทำให้เกิด throw / ถ่ายโอนสปิน)
 const vt=(a.vx-b.vx)*tx+(a.vy-b.vy)*ty+R*(a.wz+b.wz);
 if(Math.abs(vt)>1e-6){
  const jt=-Math.sign(vt)*Math.min(MUBB*J,Math.abs(vt)/7);
  a.vx+=jt*tx;a.vy+=jt*ty;b.vx-=jt*tx;b.vy-=jt*ty;a.wz+=2.5*jt/R;b.wz+=2.5*jt/R}
 const ev=sim.ev;
 if(ev.first===null&&(a.type==='cue'||b.type==='cue')){ev.first=(a.type==='cue'?b:a).id}
 ev.hits++;snd(sim,'hit',vn,(a.x+b.x)/2,(a.y+b.y)/2);
 if(a.type==='cue'||b.type==='cue'){ /* บันทึกการกระทบครั้งแรก */ }
}
function cushion(sim,b){
 for(let i=0;i<SEGS.length;i++){
  const s=SEGS[i];
  const sx=s.x2-s.x1,sy=s.y2-s.y1,l2=sx*sx+sy*sy;
  let t=((b.x-s.x1)*sx+(b.y-s.y1)*sy)/l2;t=t<0?0:t>1?1:t;
  const cx=s.x1+sx*t,cy=s.y1+sy*t,dx=b.x-cx,dy=b.y-cy,d2=dx*dx+dy*dy;
  if(d2>=R*R)continue;
  const d=Math.sqrt(d2);let nx,ny;
  if(d<1e-6){nx=s.nx;ny=s.ny}else{nx=dx/d;ny=dy/d}
  // ปลายขอบยาง (jaw) ต้องทิศชี้ไปทางผิวหน้า ไม่ใช้ normal กลับด้าน
  const vn=b.vx*nx+b.vy*ny;
  b.x=cx+nx*(R+0.01);b.y=cy+ny*(R+0.01);
  if(vn>=0)continue;
  const vin=-vn,tx=-ny,ty=nx;
  const e=EW*(vin>3000?0.88:1);
  const Jn=(1+e)*vin;
  b.vx+=Jn*nx;b.vy+=Jn*ny;
  const vtc=b.vx*tx+b.vy*ty-R*b.wz;
  if(Math.abs(vtc)>1e-6){
   const jt=-Math.sign(vtc)*Math.min(MUW*Jn,Math.abs(vtc)/3.5);
   b.vx+=jt*tx;b.vy+=jt*ty;b.wz+=-2.5*jt/R}
  b.wy=b.vx/R;b.wx=-b.vy/R;
  if(sim.ev.first!==null)sim.ev.cushionAfter=true;
  if(b.type==='cue')sim.ev.cueCush++;
  snd(sim,'cush',vin,b.x,b.y);
 }
}
function pockets(sim,b){
 for(let i=0;i<POCKETS.length;i++){
  const p=POCKETS[i],dx=b.x-p.x,dy=b.y-p.y;
  if(dx*dx+dy*dy<p.r*p.r){b.out=true;b.vx=b.vy=b.wx=b.wy=b.wz=0;b.pocket=i;sim.ev.potted.push(b.id);snd(sim,'pot',1,p.x,p.y);return true}
 }
 return false;
}
function failsafe(b){ // กันลูกหลุดนอกโต๊ะ (ไม่ควรเกิด)
 if(b.x<-2*R||b.x>L+2*R||b.y<-2*R||b.y>WD+2*R){b.x=Math.min(L-R,Math.max(R,b.x));b.y=Math.min(WD-R,Math.max(R,b.y));b.vx=b.vy=0}
}
function step(sim,dt){
 const B=sim.balls,n=B.length;
 for(let i=0;i<n;i++){const b=B[i];if(b.out)continue;if(b.vx!==0||b.vy!==0||b.wz!==0||b.wx!==0||b.wy!==0)advance(b,dt)}
 for(let i=0;i<n;i++){const a=B[i];if(a.out)continue;
  for(let j=i+1;j<n;j++){const b=B[j];if(b.out)continue;
   if(a.vx===0&&a.vy===0&&b.vx===0&&b.vy===0)continue;
   const dx=b.x-a.x;if(dx>2*R||dx<-2*R)continue;const dy=b.y-a.y;if(dy>2*R||dy<-2*R)continue;
   ballBall(sim,a,b)}}
 for(let i=0;i<n;i++){const b=B[i];if(b.out)continue;
  if(b.vx!==0||b.vy!==0){cushion(sim,b);if(pockets(sim,b))continue}
  else if(b.x<R||b.x>L-R||b.y<R||b.y>WD-R){pockets(sim,b)}
  failsafe(b)}
 sim.t+=dt;
}
function moving(B){for(let i=0;i<B.length;i++){const b=B[i];if(!b.out&&(b.vx!==0||b.vy!==0))return true}return false}
function maxSpeed(B){let m=0;for(let i=0;i<B.length;i++){const b=B[i];if(!b.out){const s=b.vx*b.vx+b.vy*b.vy;if(s>m)m=s}}return Math.sqrt(m)}
SN.moving=moving;
/* เดินฟิสิกส์ไปข้างหน้า `adv` วินาที (คืนค่า true เมื่อทุกลูกหยุดแล้ว) */
function run(sim,adv){
 let left=adv,g=0;
 while(left>1e-9&&g++<200000){
  const vm=maxSpeed(sim.balls);
  if(vm===0)return true;
  const dt=Math.min(left,1/200,Math.max(1/4000,6/vm));
  step(sim,dt);left-=dt;
  if(!moving(sim.balls)){settle(sim.balls);return true}
 }
 return !moving(sim.balls);
}
function settle(B){for(const b of B){if(!b.out){b.vx=b.vy=0;b.wx=b.wy=0;b.wz=0}}}
function runToEnd(sim,maxT){
 maxT=maxT||40;let g=0;
 while(sim.t<maxT&&g++<100){if(run(sim,0.5))return true}
 settle(sim.balls);return false;
}
SN.run=run;SN.runToEnd=runToEnd;
function cloneBalls(B){return B.map(b=>Object.assign({},b))}
SN.cloneBalls=cloneBalls;
/* ลงมือแทง: ang เรเดียน (y ขึ้น), power 0..1, ox/oy จุดสัมผัส -1..1 (ox ขวาของทิศแทง, oy บน=follow ล่าง=draw) */
function strike(sim,ang,power,ox,oy){
 const c=byId(sim.balls,'W');if(!c||c.out)return null;
 power=Math.max(0.02,Math.min(1,power));ox=ox||0;oy=oy||0;
 const m=Math.hypot(ox,oy);if(m>1){ox/=m;oy/=m}
 const v=VMAX*power,dx=Math.cos(ang),dy=Math.sin(ang);
 c.vx=dx*v;c.vy=dy*v;
 const a=ox*0.46*R,b=oy*0.46*R,k=5*v/(2*R*R);
 // topspin/backspin: เวกเตอร์ ω แนวนอน = k*b * (ẑ × d)
 c.wx=k*b*(-dy);c.wy=k*b*dx;
 c.wz=k*a;
 sim.ev.struck=true;
 return c;
}
SN.strike=strike;

/* ---------- เรขาคณิตช่วย (เส้นเล็ง/AI) ---------- */
function segDist(px,py,x1,y1,x2,y2){const sx=x2-x1,sy=y2-y1,l2=sx*sx+sy*sy;let t=l2?((px-x1)*sx+(py-y1)*sy)/l2:0;t=t<0?0:t>1?1:t;const cx=x1+sx*t,cy=y1+sy*t;return Math.hypot(px-cx,py-cy)}
function pathClear(B,x1,y1,x2,y2,skip,gap){
 gap=gap||2*R-1;
 for(const b of B){if(b.out||(skip&&skip.indexOf(b.id)>=0))continue;if(segDist(b.x,b.y,x1,y1,x2,y2)<gap)return false}
 return true}
/* ยิงรังสีจากลูกขาว: ลูกแรกที่ชน + ทิศหลังชน + เส้นสะท้อนขอบ (ใช้เป็นเส้นช่วยเล็ง ไม่ใช่การบังคับ) */
function predict(B,ang,spin){
 const c=byId(B,'W');if(!c||c.out)return null;
 const dx=Math.cos(ang),dy=Math.sin(ang);let best=null,bt=1e9;
 for(const b of B){if(b.out||b.id==='W')continue;
  const fx=b.x-c.x,fy=b.y-c.y,pr=fx*dx+fy*dy;if(pr<=0)continue;
  const d2=fx*fx+fy*fy-pr*pr;if(d2>=4*R*R)continue;
  const t=pr-Math.sqrt(4*R*R-d2);if(t>0&&t<bt){bt=t;best=b}}
 // ระยะถึงขอบ
 let tw=1e9;
 if(dx>1e-9)tw=Math.min(tw,(L-R-c.x)/dx);if(dx<-1e-9)tw=Math.min(tw,(R-c.x)/dx);
 if(dy>1e-9)tw=Math.min(tw,(WD-R-c.y)/dy);if(dy<-1e-9)tw=Math.min(tw,(R-c.y)/dy);
 const out={path:[[c.x,c.y]],target:null};
 if(best&&bt<tw){
  const gx=c.x+dx*bt,gy=c.y+dy*bt;out.path.push([gx,gy]);out.target=best.id;out.ghost=[gx,gy];
  const nx=(best.x-gx)/(2*R),ny=(best.y-gy)/(2*R);
  out.objDir=[nx,ny];out.obj=[[best.x,best.y],[best.x+nx*900,best.y+ny*900]];
  // ลูกขาวหลังชน (แนวสัมผัส) ทิศ ⟂ n
  let tx=dx-(dx*nx+dy*ny)*nx,ty=dy-(dy*ny+dx*nx)*ny;const tl=Math.hypot(tx,ty);
  if(tl>1e-3){out.cue2=[[gx,gy],[gx+tx/tl*Math.min(700,tl*900),gy+ty/tl*Math.min(700,tl*900)]]}
 }else{
  const wx=c.x+dx*tw,wy=c.y+dy*tw;out.path.push([wx,wy]);
  // สะท้อนขอบ 1 ครั้ง
  let rx=dx,ry=dy;if(wx<=R+0.5||wx>=L-R-0.5)rx=-rx;if(wy<=R+0.5||wy>=WD-R-0.5)ry=-ry;
  out.bounce=[[wx,wy],[wx+rx*700,wy+ry*700]];
 }
 return out;
}
SN.predict=predict;

/* ---------- กติกา: เฟรม ---------- */
function newFrame(starter){
 return {balls:rackBalls(),turn:starter,scores:[0,0],brk:0,on:'red',redsLeft:15,freeBall:false,inHand:true,over:false,winner:null,
  tieBlack:false,log:[],shots:0,lastFoul:null,highBrk:[0,0],brkCount:[0,0],starter:starter,fouls:[0,0]};
}
SN.newFrame=newFrame;
function onBalls(F,ids){ // ลูกที่สามารถแทงได้ (ball on)
 const B=F.balls,o=[];
 for(const b of B){if(b.out||b.type==='cue')continue;
  if(F.on==='red'){if(b.type==='red')o.push(b)}
  else if(F.on==='colour'){if(b.type==='colour')o.push(b)}
  else if(b.id===F.on)o.push(b)}
 return o}
SN.onBalls=onBalls;
function legalFirst(F,b){ // ลูกแรกที่โดนถือว่าถูกกติกาหรือไม่
 if(F.on==='red')return b.type==='red';
 if(F.on==='colour')return b.type==='colour';
 return b.id===F.on}
function onValue(F){return F.on==='red'?1:F.on==='colour'?4:VAL[F.on]}
function canSee(B,c,t){ // ลูกขาวมองเห็นลูก t โดยตรงหรือไม่ (มีมุมที่ไม่ถูกขวางอย่างน้อยหนึ่งมุม)
 const dx=t.x-c.x,dy=t.y-c.y,d=Math.hypot(dx,dy);if(d<2*R)return true;
 const base=Math.atan2(dy,dx);
 for(let k=-8;k<=8;k++){
  const a=base+k*0.085;const gx=t.x-Math.cos(a)*2*R,gy=t.y-Math.sin(a)*2*R; // ghost: ลูกขาวสัมผัสลูกเป้าจากทิศ a
  // ghost ต้องอยู่บนด้านที่เห็น (มุมกระทบไม่เกิน ~85°)
  if(Math.abs(k*0.085)>1.45)continue;
  if(gx<R||gx>L-R||gy<R||gy>WD-R)continue;
  const g2x=gx-c.x,g2y=gy-c.y;if(g2x*dx+g2y*dy<=0&&d>3*R)continue;
  if(pathClear(B,c.x,c.y,gx,gy,['W',t.id],2*R-0.8))return true}
 return false}
function isSnookered(F){ // ผู้เล่นที่จะแทงถูกบัง (มองไม่เห็นลูกที่แทงได้เลย)
 const c=byId(F.balls,'W');if(!c||c.out)return false;
 const ons=onBalls(F);if(!ons.length)return false;
 for(const t of ons)if(canSee(F.balls,c,t))return false;
 return true}
SN.isSnookered=isSnookered;SN.canSee=canSee;
/* วางลูกสีกลับจุด (respot) */
function free(B,x,y,skip){for(const b of B){if(b.out||b===skip)continue;if(Math.hypot(b.x-x,b.y-y)<2*R+0.5)return false}return x>=R&&x<=L-R&&y>=R&&y<=WD-R}
function respot(F,b){
 const B=F.balls;b.vx=b.vy=b.wx=b.wy=b.wz=0;b.out=false;
 if(b.type==='red'){ // red free ball: วางใกล้จุด pink ทางด้าน baulk
  const [sx,sy]=SPOT.B;for(let d=0;d<2000;d+=4){for(const o of [0,1,-1,2,-2]){const x=sx-d,y=sy+o*d*0.3;if(free(B,x,y,b)){b.x=x;b.y=y;return}}}
  b.x=sx;b.y=sy;return}
 const order=[b.id].concat(['K','P','B','N','G','Y'].filter(k=>k!==b.id));
 for(const k of order){const [x,y]=SPOT[k];if(free(B,x,y,b)){b.x=x;b.y=y;return}}
 const [sx,sy]=SPOT[b.id];for(let d=0;d<L;d+=4){const x=sx+d;if(free(B,x,sy,b)){b.x=x;b.y=sy;return}}
 b.x=sx;b.y=sy}
SN.respot=respot;
function nextSeq(F){ // ลูกถัดไปในลำดับสีหลังแดงหมด
 for(const k of SEQ){const b=byId(F.balls,k);if(b&&!b.out)return k}return null}
/* ตัดสินผลการแทง 1 ครั้ง (ev = sim.ev) → คืนสรุป และเปลี่ยนสถานะเฟรม */
function judge(F,ev){
 const sh=F.turn,op=1-sh,B=F.balls,res={shooter:sh,foul:false,fv:0,reason:'',pts:0,potted:ev.potted.slice()};
 const potted=ev.potted.map(id=>byId(B,id)),cueOut=ev.potted.indexOf('W')>=0;
 const others=potted.filter(b=>b.id!=='W');
 const first=ev.first?byId(B,ev.first):null;
 const wasBlackFinal=(F.on==='K'&&onlyBlack(F));
 const prevOn=F.on;
 let foul=false,fv=4,reason='',nominated=null;
 const mark=(why,val)=>{foul=true;if(!reason)reason=why;fv=Math.max(fv,val||0)};
 if(!first){mark('ไม่โดนลูกใดเลย (Miss)',prevOn!=='red'&&prevOn!=='colour'?VAL[prevOn]:0)}
 else if(!legalFirst(F,first)){
  if(F.freeBall){nominated=first}
  else mark('แทงลูกผิด ('+nameOf(first)+') ก่อน',first.v)}
 let pts=0,redCount=0;
 if(first&&(!foul||nominated)){
  if(nominated){
   if(others.some(b=>b.id===nominated.id)){pts=prevOn==='red'?1:(prevOn==='colour'?nominated.v:VAL[prevOn]);res.freeBallPotted=true}
  }else{
   let colourCount=0,bad=null;
   for(const b of others){
    if(prevOn==='red'){if(b.type==='red')redCount++;else bad=bad||b}
    else if(prevOn==='colour'){if(b.type==='colour'){colourCount++;if(colourCount>1)bad=bad||b}else bad=bad||b}
    else{if(b.id!==prevOn)bad=bad||b}}
   if(bad)mark('ลงหลุมลูกที่ไม่ใช่ลูกเป้า ('+nameOf(bad)+')',bad.v);
   else pts=redCount+others.filter(b=>b.type==='colour').reduce((a,b)=>a+b.v,0)}
 }
 if(cueOut)mark('ลูกขาวตกหลุม',0);
 if(!foul&&first&&!others.length&&!ev.cushionAfter)mark('ไม่มีลูกใดกระทบขอบยางหลังชน',0);
 const dropOthers=()=>{for(const b of others){if(b.type==='red'&&!(nominated&&b.id===nominated.id)){b.removed=true;F.redsLeft=Math.max(0,F.redsLeft-1)}else respot(F,b)}};
 // ----- ฟาวล์ -----
 if(foul){
  F.scores[op]+=fv;F.fouls[sh]++;F.brk=0;F.lastFoul={by:sh,pts:fv,reason};
  res.foul=true;res.fv=fv;res.reason=reason;
  dropOthers();
  if(cueOut){const c=byId(B,'W');c.out=true;c.vx=c.vy=0;c.x=-9999;c.y=-9999;F.inHand=true}else F.inHand=false;
  F.turn=op;F.freeBall=false;
  // ลูกเป้าของผู้เล่นคนต่อไป
  if(prevOn==='red'||prevOn==='colour'){
   if(F.redsLeft>0)F.on='red';
   else F.on=(prevOn==='red')?'colour':'Y'}
  else F.on=prevOn;
  if(F.on!=='red'&&F.on!=='colour'){const t=byId(B,F.on);if(!t||t.out||t.removed)F.on=nextSeq(F)||'K'}
  if(F.redsLeft>0&&F.on==='colour')F.on='red';
  if(wasBlackFinal){finish(F)}
  else if(!F.inHand&&isSnookered(F)){F.freeBall=true}
  F.shots++;return res}
 // ----- ถูกกติกา -----
 F.inHand=false;
 let cont=false;
 if(nominated){
  dropOthers();
  if(res.freeBallPotted){
   F.scores[sh]+=pts;F.brk+=pts;cont=true;
   if(prevOn==='red')F.on=F.redsLeft===0?'colour':'colour';
   else if(prevOn==='colour')F.on=F.redsLeft>0?'red':'Y';
   else{const t=byId(B,prevOn);F.on=nextSeq(F)||'K'}
   if(prevOn!=='red'&&prevOn!=='colour'){const nb=byId(B,F.on);if(!nb||nb.out)F.on=nextSeq(F)||'K'}}
 }else if(pts>0){
  F.scores[sh]+=pts;F.brk+=pts;cont=true;
  if(prevOn==='red'){dropOthers();F.on='colour'}
  else if(prevOn==='colour'){dropOthers();F.on=F.redsLeft>0?'red':'Y'}
  else{const b=others[0];b.removed=true;F.on=(b.id==='K')?null:(nextSeq(F)||'K')
   if(F.on!==null){const nb=byId(B,F.on);if(!nb||nb.out||nb.removed){const nx=SEQ.find(k=>{const q=byId(B,k);return q&&!q.out&&!q.removed});F.on=nx||'K'}}}
 }
 res.pts=pts;
 if(F.brk>F.highBrk[sh])F.highBrk[sh]=F.brk;
 if(F.on===null)finish(F);
 if(!F.over){
  if(!cont){
   F.brk=0;F.turn=op;F.freeBall=false;
   if(F.on==='colour')F.on=F.redsLeft>0?'red':'Y';
  }else F.freeBall=false;
 }
 F.shots++;
 return res;
}
function blackLeft(F){const k=byId(F.balls,'K');return k&&!k.out}
function onlyBlack(F){return F.balls.filter(b=>!b.out&&b.type!=='cue').length===1}
function finish(F){
 if(F.over)return;
 const s=F.scores;
 if(s[0]===s[1]){ // เสมอ → respotted black
  F.tieBlack=true;const k=byId(F.balls,'K');if(k){k.removed=false;k.out=false;respot(F,k)}
  for(const b of F.balls)if(b.type!=='cue'&&b.id!=='K'){b.out=true}
  F.on='K';F.redsLeft=0;F.inHand=true;
  const c=byId(F.balls,'W');c.out=true;c.x=-9999;c.y=-9999;F.brk=0;F.freeBall=false;
  F.turn=1-F.turn;F.tieBreak=true;return}
 F.over=true;F.winner=s[0]>s[1]?0:1;F.on=null}
function nameOf(b){return b.type==='red'?'แดง':({Y:'เหลือง',G:'เขียว',N:'น้ำตาล',B:'น้ำเงิน',P:'ชมพู',K:'ดำ',W:'ขาว'})[b.id]||b.id}
SN.nameOf=nameOf;
/* หลังตัดสิน: ลูกที่ถูกลงหลุมถาวร (เป็น out) / สีที่ respot กลับมา ต้องสะท้อนใน balls */
function syncAfter(F){
 for(const b of F.balls){if(b.removed){b.out=true;b.removed=false}}
}
SN.judge=function(F,ev){const r=judge(F,ev);syncAfter(F);return r};
function remainingPoints(F){
 let r=0;const reds=F.balls.filter(b=>b.type==='red'&&!b.out).length;
 if(reds>0){r+=reds*8;if(F.on==='colour')r+=0}
 for(const k of SEQ){const b=byId(F.balls,k);if(b&&!b.out)r+=VAL[k]}
 return r}
SN.remaining=remainingPoints;
/* วางลูกขาวใน D (ใช้ตอนเริ่มเฟรม / หลังลูกขาวตกหลุม) */
function dOk(F,x,y){
 if(x>BAULK-0.1||Math.hypot(x-BAULK,y-MID)>DR-R*0.3&&false)return false;
 if(x>BAULK)return false;if(Math.hypot(x-BAULK,y-MID)>DR)return false;
 if(x<R||y<R||y>WD-R)return false;
 for(const b of F.balls){if(b.out||b.type==='cue')continue;if(Math.hypot(b.x-x,b.y-y)<2*R+0.5)return false}return true}
SN.dOk=dOk;
SN.placeCue=function(F,x,y){
 if(!F.inHand||!dOk(F,x,y))return false;
 const c=byId(F.balls,'W');c.x=x;c.y=y;c.vx=c.vy=0;c.out=false;F.inHand=false;
 if(F.freeBall===false&&!F.over&&isSnookered(F)&&F.lastFoul&&F.lastFoul.by!==F.turn&&F.lastFoul.cueOutPending)F.freeBall=true;
 return true};
function afterPlaceFree(F){}

/* ---------- AI ---------- */
const LEVELS=[
 null,
 {name:'Beginner',th:'มือใหม่',sa:0.060,sp:0.24,so:0.18,cands:3,sims:0,pos:0,safety:0,spin:0,thresh:0.02,plan:0},
 {name:'Amateur',th:'สมัครเล่น',sa:0.034,sp:0.15,so:0.12,cands:4,sims:0,pos:0,safety:0,spin:0,thresh:0.06,plan:0},
 {name:'Intermediate',th:'ระดับกลาง',sa:0.0185,sp:0.095,so:0.08,cands:6,sims:2,pos:1,safety:1,spin:0,thresh:0.14,plan:1},
 {name:'Professional',th:'มืออาชีพ',sa:0.0095,sp:0.055,so:0.05,cands:8,sims:3,pos:1,safety:2,spin:1,thresh:0.22,plan:1},
 {name:'Expert',th:'ผู้เชี่ยวชาญ',sa:0.0052,sp:0.034,so:0.03,cands:10,sims:4,pos:2,safety:3,spin:2,thresh:0.28,plan:2},
 {name:'Master',th:'ปรมาจารย์',sa:0.0028,sp:0.02,so:0.018,cands:12,sims:5,pos:2,safety:4,spin:2,thresh:0.33,plan:2},
 {name:'Grand Master',th:'ยอดฝีมือสูงสุด',sa:0.0014,sp:0.011,so:0.01,cands:16,sims:6,pos:3,safety:5,spin:3,thresh:0.38,plan:3}];
SN.LEVELS=LEVELS;
const SPIN_SET=[[0,0],[0,0.55],[0,-0.55],[0.5,0],[-0.5,0],[0,0.9],[0,-0.9]];
function pocketAim(p,T){ // จุดเล็งภายในหลุม (เลื่อนเข้าหาศูนย์กลางปากหลุมเพื่อกันชนขอบ)
 if(p.k==='m')return [p.x,p.y+(p.y<0?22:-22)];
 const sx=p.x<0?1:-1,sy=p.y<0?1:-1;return [p.x+sx*10,p.y+sy*10]}
/* ผู้สมัครการลงหลุมแบบเรขาคณิต: คืนรายการ {t,pk,ghost,ang,d1,d2,cut,diff} */
function potCandidates(B,targets,cue){
 const out=[];
 for(const t of targets){
  for(let pi=0;pi<POCKETS.length;pi++){
   const pk=POCKETS[pi],[px,py]=pocketAim(pk,t);
   const ux=px-t.x,uy=py-t.y,d2=Math.hypot(ux,uy);if(d2<1)continue;
   const nx=ux/d2,ny=uy/d2,gx=t.x-nx*2*R,gy=t.y-ny*2*R;
   if(gx<R*0.9||gx>L-R*0.9||gy<R*0.9||gy>WD-R*0.9)continue;
   const cx=gx-cue.x,cy=gy-cue.y,d1=Math.hypot(cx,cy);if(d1<1)continue;
   const cos=(cx*nx+cy*ny)/d1;if(cos<0.18)continue; // มุมตัด > ~80°
   const cut=Math.acos(Math.min(1,cos));
   if(!pathClear(B,cue.x,cue.y,gx,gy,['W',t.id],2*R-1))continue;
   if(!pathClear(B,t.x,t.y,px,py,['W',t.id],2*R-1.5))continue;
   // ยากแค่ไหน (ยิ่งต่ำยิ่งง่าย): ระยะรวม + มุมตัด
   const pw=pk.k==='m'?1.25:1;
   const diff=(d1*0.55+d2*1.0)/1000*(1+2.6*Math.pow(Math.sin(cut),1.4))*pw;
   out.push({t,pk:pi,ghost:[gx,gy],ang:Math.atan2(cy,cx),d1,d2,cut,diff,aim:[px,py]});
  }}
 out.sort((a,b)=>a.diff-b.diff);return out}
SN.potCandidates=potCandidates;
function trail(v0,dist){ // ความเร็วหลังเดินทาง dist (ลูกไม่มีสปิน: ลื่นแล้วกลิ้ง)
 const ts=2*v0/(7*MUS*G),ss=v0*ts-0.5*MUS*G*ts*ts;
 if(dist<=ss){const d=v0*v0-2*MUS*G*dist;return d>0?Math.sqrt(d):0}
 const vr=5*v0/7,d=vr*vr-2*MUR*G*(dist-ss);return d>0?Math.sqrt(d):0}
function speedFor(d1,d2,cut){ // กำลังแทงโดยประมาณ (ผ่านการจำลองลื่น→กลิ้ง)
 const vObj=Math.sqrt((d2+260)/5.5e-4);                 // ความเร็วเริ่มต้นของลูกเป้า
 const vc=vObj/Math.max(0.3,Math.cos(cut)*0.95);         // ลูกขาวต้องมีความเร็วขนาดนี้ตอนชน
 let lo=vc,hi=VMAX*1.1;for(let i=0;i<26;i++){const m=(lo+hi)/2;if(trail(m,d1)<vc)lo=m;else hi=m}
 return Math.max(0.05,Math.min(1,hi/VMAX))}
/* ประเมินตำแหน่งลูกขาวหลังช็อต: ง่ายที่จะลงหลุมต่อหรือไม่ (คืนค่า 0..1, สูง=ดี) */
function posQuality(F2,onKind){
 const B=F2.balls,c=byId(B,'W');if(!c||c.out)return 0;
 const tg=onBalls(F2);if(!tg.length)return 0.5;
 const cs=potCandidates(B,tg,c);if(!cs.length)return 0.05;
 const d=cs[0].diff;return 1/(1+d*1.1)}
function cloneF(F){return {balls:cloneBalls(F.balls),turn:F.turn,scores:F.scores.slice(),brk:F.brk,on:F.on,redsLeft:F.redsLeft,freeBall:F.freeBall,inHand:F.inHand,over:F.over,winner:F.winner,tieBlack:F.tieBlack,log:[],shots:F.shots,lastFoul:null,highBrk:F.highBrk.slice(),brkCount:F.brkCount.slice(),starter:F.starter,fouls:F.fouls.slice()}}
SN.cloneF=cloneF;
function simShot(F,ang,power,ox,oy,maxT){
 const F2=cloneF(F),sim=newSim(F2.balls);strike(sim,ang,power,ox,oy);runToEnd(sim,maxT||30);
 const r=SN.judge(F2,sim.ev);return {F:F2,ev:sim.ev,res:r}}
SN.simShot=simShot;
function opponentThreat(F2){ // ภัยคุกคามของฝ่ายตรงข้ามหลังช็อตเรา: ต่ำ=ปลอดภัย
 if(F2.over)return 1;
 const cF=byId(F2.balls,'W');if(!cF||cF.out)return 0.5;
 const tg=onBalls(F2);if(!tg.length)return 0.5;
 if(F2.inHand)return 0.9;
 const sn=isSnookered(F2);
 const cs=potCandidates(F2.balls,tg,cF);
 let th=cs.length?1/(1+cs[0].diff*1.2):0.04;
 if(sn)th*=0.25;
 return th}
/* ตรวจว่ามีเส้นเล็งให้ลงหลุมจริงหรือไม่ (ผู้สมัคร) แล้วจัดอันดับ */
SN.ai=function(F,level,rng,budget){
 const lv=LEVELS[level],B=F.balls,cue=byId(B,'W');
 rng=rng||Math.random;
 const targets=F.freeBall?B.filter(b=>!b.out&&b.type!=='cue'):onBalls(F);
 const noise=(a,p,o)=>({ang:a+gauss(rng)*lv.sa,power:Math.max(0.03,Math.min(1,p*(1+gauss(rng)*lv.sp))),ox:o[0]+gauss(rng)*lv.so,oy:o[1]+gauss(rng)*lv.so});
 const plan={kind:'none',score:0,info:''};
 let best=null;
 const nSims=(budget&&budget.sims)||40+lv.sims*10;
 let used=0;
 const cands=potCandidates(B,targets,cue).slice(0,lv.cands);
 // ----- ตัวเลือกลงหลุม -----
 for(const c of cands){
  const spins=lv.spin===0?[[0,0]]:(lv.spin===1?[[0,0],[0,0.55],[0,-0.55]]:lv.spin===2?SPIN_SET.slice(0,5):SPIN_SET);
  const base=speedFor(c.d1,c.d2,c.cut);
  const powers=lv.pos===0?[base]:[base,Math.min(1,base*1.28),Math.max(0.05,base*0.8)];
  for(const sp of spins){for(const pw of powers){
   let score,info;
   if(lv.sims===0){ // ระดับต้น: ประเมินเชิงเรขาคณิตเท่านั้น
    score=1/(1+c.diff*1.4)*(F.on==='red'?1:(c.t.v/4+0.5));info='geo';
    if(!best||score>best.score)best={kind:'pot',ang:c.ang,power:pw,spin:sp,score,cand:c,info};
    continue}
   if(used>=nSims)break;used++;
   const r=simShot(F,c.ang,pw,sp[0],sp[1],25);
   if(r.res.foul||!r.res.pts)continue;
   const pq=lv.pos?posQuality(r.F,r.F.on):0.3;
   const val=r.res.pts*(F.on==='red'?1:0.6);
   score=val*0.12+ (1/(1+c.diff*1.1))*0.5+pq*0.4*(lv.pos>=2?1:0.7)+(r.F.over?1:0);
   if(lv.pos>=2&&!r.F.over){ // วางแผน 2 จังหวะ: ดูว่ามีช็อตต่อไปที่ง่ายจริงหรือไม่
    const c2=byId(r.F.balls,'W');const t2=onBalls(r.F);
    if(c2&&!c2.out&&t2.length){const cs2=potCandidates(r.F.balls,t2,c2);if(cs2.length){score+=0.25/(1+cs2[0].diff);if(lv.pos>=3&&cs2[1])score+=0.05/(1+cs2[1].diff)}}}
   if(!best||score>best.score)best={kind:'pot',ang:c.ang,power:pw,spin:sp,score,cand:c,info:'sim pos='+pq.toFixed(2)};
  }}
 }
 if(best)best.cutoffOK=true;
 // ----- ตรวจความคุ้มค่า: ถ้าช็อตลงหลุมยากเกินไปสำหรับระดับนี้ → เล่นเซฟ -----
 let doSafety=false;
 if(!best)doSafety=true;
 else if(lv.safety>0){
  const diff=best.cand.diff;
  const risk=(diff*(1+lv.sa*60)*(lv.pos>=2?0.8:1));
  // ต้นเกม/ไกลมาก/มุมยาก → เซฟ ถ้า (ความน่าจะเป็นลงหลุมโดยประมาณ) ต่ำกว่าเกณฑ์ ที่ขึ้นกับคะแนนตามหลัง
  const pPot=Math.exp(-lv.sa*(best.cand.d1+best.cand.d2)/38)*Math.exp(-diff*0.18);
  const behind=F.scores[1-F.turn]-F.scores[F.turn];
  const need=lv.thresh*(behind>remainingPoints(F)*0.6?0.4:1);
  if(pPot<need)doSafety=true}
 if(!best&&targets.length===0)return fallback();
 let pick=best;
 if(doSafety&&lv.safety>0){
  const sf=safetyShot(F,level,rng,targets,lv.safety*14,F.freeBall);
  if(sf&&(!best||sf.score>=0)){pick=sf;pick.kind='safety'}
 }else if(!best&&lv.safety===0){pick=null}
 if(!pick){
  // ระดับต้น/ไม่มีเส้น: ตีลูกเป้าที่ใกล้ที่สุดด้วยแรงปานกลาง (ผิดพลาดได้ตามระดับ)
  let t=targets.slice().sort((a,b)=>Math.hypot(a.x-cue.x,a.y-cue.y)-Math.hypot(b.x-cue.x,b.y-cue.y))[0];
  if(!t)return fallback();
  const ang=Math.atan2(t.y-cue.y,t.x-cue.x);
  pick={kind:'hit',ang,power:Math.min(0.5,0.18+Math.hypot(t.x-cue.x,t.y-cue.y)/L*0.7),spin:[0,0],score:0};
  // ถูกบัง: ลองหามุมที่เห็นลูกเป้าจริง
  if(!canSee(B,cue,t)){const esc=escapeShot(F,level,rng,targets,lv.safety*18+30);if(esc)pick=esc}
 }
 const nz=noise(pick.ang,pick.power,pick.spin);
 return {ang:nz.ang,power:nz.power,ox:nz.ox,oy:nz.oy,kind:pick.kind,plan:pick,exact:{ang:pick.ang,power:pick.power}};
 function fallback(){
  const t=B.find(b=>!b.out&&b.type!=='cue');
  const ang=t?Math.atan2(t.y-cue.y,t.x-cue.x):0;
  return {ang,power:0.3,ox:0,oy:0,kind:'fallback',plan:{kind:'fallback'}}}
};
/* ตำแหน่งเซฟ: ตีลูกที่ถูกต้องเบา ๆ ให้ลูกขาวหยุดยากต่อการโจมตีของอีกฝ่าย หรือสนุกเกอร์ */
function safetyShot(F,level,rng,targets,nsim,free){
 const lv=LEVELS[level],B=F.balls,cue=byId(B,'W');let best=null;
 const tgts=free?B.filter(b=>!b.out&&b.type!=='cue'&&b.id!=='W'):targets;
 const jobs=[];
 for(const t of tgts){
  const base=Math.atan2(t.y-cue.y,t.x-cue.x),d=Math.hypot(t.x-cue.x,t.y-cue.y);
  const offs=lv.safety>=3?[-0.9,-0.6,-0.3,0,0.3,0.6,0.9]:[-0.5,0,0.5];
  for(const o of offs){
   // เปลี่ยนความหนา: เลื่อนจุด ghost ไปด้านข้างของลูกเป้า
   const gx=t.x-Math.cos(base)*2*R*0+0,gy=0;
   const nx=-Math.sin(base),ny=Math.cos(base);
   const tx=t.x+nx*o*R*1.9,ty=t.y+ny*o*R*1.9;
   const ang=Math.atan2(ty-cue.y,tx-cue.x);
   for(const pw of [0.17,0.26,0.38,0.52])jobs.push({ang,pw});
  }}
 // สุ่มลำดับตามระดับ แต่ทดสอบไม่เกิน nsim ครั้ง (ใช้ rng เฉพาะเรียงลำดับ ไม่ใช่ผลลัพธ์)
 jobs.sort((a,b)=>(((a.ang*131+a.pw*977)%7)-((b.ang*131+b.pw*977)%7)));
 let k=0;
 for(const j of jobs){
  if(k++>=nsim)break;
  const r=simShot(F,j.ang,j.pw,0,0,20);
  if(r.res.foul&&!free)continue;
  if(r.res.foul)continue;
  const th=opponentThreat(r.F);
  let s=-th;
  if(!r.F.over&&isSnookered(r.F))s+=0.35;       // ทำให้อีกฝ่ายถูกบัง
  // ลูกขาวห่างลูกสีสูง/ใกล้ขอบด้านหลังลูกเป้า → ดี
  const c2=byId(r.F.balls,'W');if(c2&&c2.x<900)s+=0.02;
  if(r.res.pts>0)s+=0.15;
  if(!best||s>best.score)best={kind:'safety',ang:j.ang,power:j.pw,spin:[0,0],score:s,threat:th}}
 return best}
function escapeShot(F,level,rng,targets,nsim){ // หาทางออกจากสนุกเกอร์ (kick / ผ่านขอบ)
 const lv=LEVELS[level];let best=null,k=0;
 const step=lv.safety>=3?0.03:0.05,pws=[0.3,0.45,0.62,0.8];
 const cands=[];
 for(let a=-Math.PI;a<Math.PI;a+=step)for(const pw of pws)cands.push({a,pw});
 // เรียงให้กระจายทิศ (ไม่ใช้สุ่มผลลัพธ์)
 cands.sort((x,y)=>(Math.sin(x.a*53+x.pw*7)-Math.sin(y.a*53+y.pw*7)));
 for(const c of cands){
  if(k++>=nsim)break;
  const r=simShot(F,c.a,c.pw,0,0,20);
  if(r.res.foul)continue;
  const th=opponentThreat(r.F);let s=-th+(r.res.pts>0?0.4:0);
  if(!best||s>best.score)best={kind:'escape',ang:c.a,power:c.pw,spin:[0,0],score:s}}
 return best}
SN.escape=escapeShot;
/* เลือกตำแหน่งวางลูกขาวใน D สำหรับ AI */
SN.aiPlace=function(F,level,rng){
 const lv=LEVELS[level];let best=null;
 const tg=F.freeBall?F.balls.filter(b=>!b.out&&b.type!=='cue'):onBalls(F);
 const cue=byId(F.balls,'W');
 const step=lv.pos>=2?28:lv.pos>=1?50:90;
 for(let x=R+4;x<=BAULK;x+=step)for(let y=MID-DR;y<=MID+DR;y+=step){
  if(!dOk(F,x,y))continue;
  const old=[cue.x,cue.y];cue.x=x;cue.y=y;cue.out=false;
  const cs=potCandidates(F.balls,tg,cue);cue.x=old[0];cue.y=old[1];
  const q=cs.length?1/(1+cs[0].diff):0;
  if(!best||q>best.q)best={x,y,q}}
 if(!best){for(let x=R+4;x<=BAULK;x+=20)for(let y=MID-DR;y<=MID+DR;y+=20){if(dOk(F,x,y))return {x,y}}return {x:BAULK-60,y:MID}}
 return best};
/* AI ยอมแพ้เฟรมเมื่อเสียเปรียบจนไม่มีทางไล่ทัน */
SN.aiConcede=function(F,who){
 const me=F.scores[who],op=F.scores[1-who],rem=remainingPoints(F);
 return !F.over&&op-me>rem+4&&F.balls.filter(b=>!b.out&&b.type==='red').length===0};

/* ---------- ข้อมูลผู้เล่น NPC ---------- */
SN.NPCS=[
 {id:'s_tom',name:'น้องต้น',title:'นักศึกษา มือใหม่หัดเล่น',level:1,sprite:'pink',av:'🧑‍🎓',color:'#9bd17f',persona:'ตื่นเต้นง่าย ชอบแทงแรงเกินไป',stake:200,
  lines:['ผมเพิ่งหัดเล่นนะครับ อย่าเอาแรง!','โอ๊ะ! ลงหลุมเหรอเนี่ย','เล่นอีกตา ผมยังไม่ยอมแพ้!']},
 {id:'s_pim',name:'พี่พิมพ์',title:'พนักงานออฟฟิศ เล่นหลังเลิกงาน',level:2,sprite:'bun',av:'👩‍💼',color:'#ffa6c9',persona:'ใจเย็น เล็งดี แต่มุมยากยังพลาด',stake:500,
  lines:['ฉันเล่นสนุกเกอร์ทุกวันศุกร์ค่ะ','มุมนี้ยากหน่อยนะ','เกมที่ดี!']},
 {id:'s_chai',name:'ลุงชัย',title:'ผู้เล่นประจำของร้าน',level:3,sprite:'coat',av:'👴',color:'#8fc3ff',persona:'เล่นต่อเนื่อง คิดตำแหน่งลูกขาว',stake:1500,
  lines:['ลุงเล่นมาสามสิบปีแล้ว','ตำแหน่งลูกขาวสำคัญนะหลาน','ดีมาก ไม่ธรรมดา']},
 {id:'s_arm',name:'คุณอาร์ม',title:'แชมป์สโมสร',level:4,sprite:'leo',av:'😎',color:'#ffd35a',persona:'ทำ Break ต่อเนื่องและเล่นเซฟเก่ง',stake:4000,
  lines:['ผมเป็นแชมป์สโมสรปีที่แล้ว','เซฟตรงนี้ละกัน','น่าประทับใจ']},
 {id:'s_nok',name:'ครูนก',title:'โค้ชสนุกเกอร์',level:5,sprite:'teal',av:'🎓',color:'#6fd6c8',persona:'ใช้สปินเก่ง วางสนุกเกอร์ได้แม่น',stake:10000,
  lines:['สปินคือหัวใจของเกมนี้','เจอสนุกเกอร์ซะแล้ว','ฝีมือไม่เลว']},
 {id:'s_mas',name:'มาสเตอร์เหมา',title:'อดีตนักกีฬาทีมชาติ',level:6,sprite:'fur',av:'🏆',color:'#ff9f45',persona:'วางแผนหลายจังหวะ แก้สนุกเกอร์เก่ง',stake:25000,
  lines:['ผมเคยแข่งระดับเอเชีย','ทุกลูกมีแผนเสมอ','ยอดเยี่ยม']},
 {id:'s_gm',name:'เจ้าพ่อเอกราช',title:'Grand Master · ผู้ท้าชิงสูงสุด',level:7,sprite:'goth',av:'👑',color:'#ff5f5f',persona:'แม่นยำสูงสุด ทั้งรุกและรับ',stake:60000,
  lines:['ไม่มีใครชนะผมได้ง่าย ๆ','ถึงตาผมแล้ว','เก่งมาก… แต่ยังไม่พอ']},
 {id:'s_may',name:'น้องเมย์',title:'สาวนักสนุกเกอร์ฝีมือกลาง',level:3,sprite:'mei',av:'👩',color:'#ff9fd0',persona:'เล่นสนุก ชอบแทงลูกสีเสี่ยง',stake:1500,lines:['เล่นกันสนุก ๆ นะคะ','อุ๊ย เกือบแล้ว','เยี่ยมมาก']},
 {id:'s_jak',name:'พี่จักร',title:'ช่างซ่อมรถ นักเล่นสมัครเล่น',level:2,sprite:'goth',av:'🔧',color:'#b69cff',persona:'แทงแรง ตรงตรง ไม่ค่อยวางแผน',stake:500,lines:['แทงตรง ๆ นี่แหละ','พลาดอีกแล้ว','ไว้แก้มือนะ']}];
SN.NPC_BY_ID={};SN.NPCS.forEach(n=>SN.NPC_BY_ID[n.id]=n);
/* เงิน: ค่าโต๊ะ / ค่าท้า / รางวัล */
SN.fees=function(npc,bestOf){
 const lv=npc.level,tableFee=Math.round(60+lv*40)*(bestOf>1?bestOf:1)/ (bestOf>1?1:1);
 const stake=npc.stake*bestOf;
 return {table:Math.round(60+lv*40)*Math.max(1,Math.ceil(bestOf/2)),stake,prize:Math.round(stake*1.8),bonus:0}};

/* ---------- ข้อมูลเซฟ ---------- */
let ENV={getS:()=>null,save:()=>{},day:()=>1};
SN.setEnv=function(e){ENV=Object.assign(ENV,e)};
SN.state=function(){
 const S=ENV.getS();if(!S)return null;
 if(!S.snooker||typeof S.snooker!=='object')S.snooker={};
 const s=S.snooker;
 if(s.v!==1){s.v=1;s.stats=s.stats||{games:0,wins:0,losses:0,fw:0,fl:0,highBrk:0,totalBrk:0,potted:0,fouls:0,spent:0,won:0,tableFees:0,drinks:0};s.hist=s.hist||[];s.npcs=s.npcs||{};s.match=s.match||null;s.opened=s.opened||0}
 const st=s.stats;['games','wins','losses','fw','fl','highBrk','totalBrk','potted','fouls','spent','won','tableFees','drinks'].forEach(k=>{if(typeof st[k]!=='number'||!isFinite(st[k]))st[k]=0});
 if(!Array.isArray(s.hist))s.hist=[];if(!s.npcs||typeof s.npcs!=='object')s.npcs={};
 for(const n of SN.NPCS){const r=s.npcs[n.id]||(s.npcs[n.id]={});['played','won','lost','high','fw','fl'].forEach(k=>{if(typeof r[k]!=='number'||!isFinite(r[k]))r[k]=0});if(typeof r.skill!=='number')r.skill=n.level}
 return s};
SN.money=()=>{const S=ENV.getS();return S?S.money||0:0};
SN.addMoney=d=>{const S=ENV.getS();if(S){S.money=Math.max(0,Math.round((S.money||0)+d))}};
SN.save=()=>ENV.save();
SN.day=()=>ENV.day();
/* เปิด/ปิดร้าน: เวลาในเกม (ชั่วโมง) */
SN.hours={open:10,close:24};
SN.isOpen=function(){const S=ENV.getS();if(!S)return true;let h=null;try{if(ENV.hour)h=ENV.hour()}catch(e){}if(h==null)h=typeof S.hour==='number'?S.hour:(S.time&&typeof S.time.h==='number'?S.time.h:null);if(h==null)return true;return h>=SN.hours.open&&h<SN.hours.close};
/* ซีเรียลไลซ์สถานะแมตช์ (ใช้บันทึกกลางแมตช์) */
SN.packFrame=function(F){return JSON.parse(JSON.stringify(F))};
/* เริ่มแมตช์: หักเงิน (ค่าโต๊ะ+ค่าท้า) ครั้งเดียวและเก็บสถานะ */
SN.startMatch=function(npcId,bestOf,table){
 const s=SN.state();if(!s)return {ok:false,err:'no state'};if(s.match&&!s.match.settled)return {ok:false,err:'มีแมตช์ค้างอยู่'};
 const npc=SN.NPC_BY_ID[npcId];if(!npc)return {ok:false,err:'ไม่พบคู่แข่ง'};
 if(!SN.isOpen())return {ok:false,err:'ร้านปิดอยู่ (เปิด 10:00–24:00)'};
 if([1,3,5].indexOf(bestOf)<0)return {ok:false,err:'จำนวนเฟรมไม่ถูกต้อง'};
 const f=SN.fees(npc,bestOf),total=f.table+f.stake;
 if(SN.money()<total)return {ok:false,err:'เงินไม่พอ (ต้องมี ฿'+total.toLocaleString()+')'};
 SN.addMoney(-total);
 s.stats.spent+=total;s.stats.tableFees+=f.table;
 const seed=((Date.now()&0xffffff)^(SN.day()*7919)^npc.level*104729)>>>0;
 s.match={npc:npcId,level:npc.level,bestOf,table:table||1,fee:f.table,stake:f.stake,prize:f.prize,frames:[0,0],frameNo:1,seed,
  F:null,start:SN.day(),settled:false,hi:[0,0],pot:0,fouls:0,fr:[]};
 s.match.F=newFrame(0);
 SN.save();return {ok:true,match:s.match,fees:f}};
/* จบแมตช์ → จ่ายรางวัลครั้งเดียว + บันทึกสถิติ/ประวัติ */
SN.settleMatch=function(result){ // result: 'win'|'loss'|'quit'
 const s=SN.state();if(!s||!s.match||s.match.settled)return null;
 const m=s.match,npc=SN.NPC_BY_ID[m.npc],st=s.stats,nr=s.npcs[m.npc];
 const win=result==='win';
 const prize=win?m.prize:0;
 if(prize)SN.addMoney(prize);
 st.games++;if(win){st.wins++;st.won+=prize}else st.losses++;
 st.fw+=m.frames[0];st.fl+=m.frames[1];
 st.highBrk=Math.max(st.highBrk,m.hi[0]);st.totalBrk+=m.totBrk||0;st.potted+=m.pot||0;st.fouls+=m.fouls||0;
 nr.played++;if(win)nr.lost++;else nr.won++;nr.high=Math.max(nr.high,m.hi[1]);nr.fw+=m.frames[1];nr.fl+=m.frames[0];
 m.settled=true;m.result=result;
 const rec={day:SN.day(),npc:m.npc,name:npc.name,level:m.level,bestOf:m.bestOf,res:result,frames:m.frames.slice(),fee:m.fee,stake:m.stake,prize:prize,net:prize-(m.fee+m.stake),hi:m.hi[0]};
 s.hist.push(rec);if(s.hist.length>200)s.hist.splice(0,s.hist.length-200);
 SN.save();return rec};
root.SNOOKER=SN;
if(typeof module!=='undefined')module.exports=SN;
})(typeof window!=='undefined'?window:globalThis);

