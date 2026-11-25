
/* =====================================================================
   v91 · GHOST NIGHT — ผีหลอกบริษัท + ไล่ล่า CEO (ทำงานเฉพาะตอน CEO อยู่ในบริษัท)
   ใช้ระบบเวลา S.t / ฉาก CEOScene / Save (localStorage 'mct2') / ชื่อเสียง S.rep เดิมของเกม
   ===================================================================== */
(function(){
'use strict';
var SPR_SRC='assets/img/b961fd13b6df.png',CARD_SRC='assets/img/ba1ee05346c0.jpg',FACE_SRC='assets/img/b7f04ed23660.jpg';
var spr=new Image(),card=new Image(),face=new Image();
spr.src=SPR_SRC;card.src=CARD_SRC;face.src=FACE_SRC;
var LINES=['ยังไม่กลับอีกเหรอ...','ที่นี่... ไม่ใช่ที่ของคนเป็น','คืนนี้แกต้องอยู่กับฉัน!','ฉันรอแกมานานแล้ว...','หนีไปก็ไม่มีประโยชน์...'];
/* v97 · ผี 3 ตัว (โอกาสสุ่มเท่ากัน · 1 คืน = 1 ตัว): ผีเดิม · ผีสาวชุดกิโมโน (ลอยทะลุผนัง) · ผีซอมบี้ชาย (เดินไล่ ไม่บิน ไม่ทะลุกำแพง) */
function mkImg(u){var i=new Image();i.src=u;return i}
var GKINDS={
 classic:{key:'classic',spr:spr,card:card,face:face,pix:true,cw:100,ch:150,dh:72,rows:{0:0,1:3,2:1,3:2},walk:false,glow:true,lines:LINES},
 girl:{key:'girl',spr:mkImg('assets/img/1f90110bd3ce.png'),card:mkImg('assets/img/e76ded9a73e0.jpg'),face:mkImg('assets/img/5d011b3a0bff.jpg'),pix:false,cw:120,ch:155,dh:80,rows:{0:0,1:2,2:1,3:3},walk:false,glow:true,
  lines:['คุณมาที่นี่ทำไม... ฉันเหงามานานแล้ว','อยู่เป็นเพื่อนฉันสิ... อยู่ตรงนี้ด้วยกันนะ','ดอกไม้นี้... ใครบางคนเคยให้ฉันไว้','ทำไมต้องหนีล่ะ... ฉันแค่อยากให้คุณอยู่ด้วย','ได้ยินไหม... เสียงเพลงจากที่ไกล ๆ','ตรงนี้ไม่หนาวหรอก... เดี๋ยวก็ชิน']},
 zombie:{key:'zombie',spr:mkImg('assets/img/50d15ae21159.png'),card:mkImg('assets/img/f3b2ff8e6a01.jpg'),face:mkImg('assets/img/b7a85f4703d2.jpg'),pix:true,cw:120,ch:155,dh:80,rows:{0:0,1:2,2:1,3:3},walk:true,glow:false,
  lines:['งาน... งานยังไม่เสร็จ...','ทำไมแกได้กลับบ้าน... ทำไมฉันไม่ได้กลับ','ฉันเดินมาทั้งคืน... เพื่อตามหาแก','โอที... ไม่มีวันจบ...','อย่าวิ่งนะ... ฉันตามทันเสมอ','เงินเดือน... ฉันยังไม่ได้เลย...']}
};
var GKEYS=['classic','girl','zombie'];
function gk(){return GKINDS[G.kind]||GKINDS.classic}
var T_FLICKER=21*60,T_GHOST=22*60,T_DEADLINE=23*60;   // 21:00 ไฟกะพริบ · 22:00 ผีมา · หลัง 23:00 ถือว่าพ้นเวลาเหตุการณ์
var CEO_SPEED=130;                                     // ความเร็ว CEO ใน movePl()
var GHOST_SPEED0=76,GHOST_SPEED1=94;                   // ผีช้ากว่า CEO เสมอ (58% → 72%)
var CATCH_R=24,ESCAPE_DIST=340,ESCAPE_TIME=6;
var G={phase:'idle',t:0,runNight:null,x:0,y:0,vx:0,vy:0,dir:3,anim:0,alpha:0,vis:false,trail:[],trT:0,wp:0,freeze:false,
 kind:'classic',lines:[],li:0,typed:0,sub:'type',subT:0,chaseT:0,farT:0,grace:0,
 lr:[],dim:0,burst:0,nextBurst:3,flipT:0,flickOn:false,wasAt:true,inPMB:false,
 sc:0,blackT:0,wakeT:0,fadeT:0,shakeAmp:0,nextCreak:5,amb:null,lastBuzz:0,fainted:false,lvl:0};
var $g=function(id){return document.getElementById(id)};
function gs(){if(!S.ghost||typeof S.ghost!=='object')S.ghost={};return S.ghost}
function nightOf(){return S.t<360?S.day-1:S.day}
function atCo(){try{return CEOScene.atCompany()}catch(e){return true}}
function extBlockedBy(){
 if(!S||S.over)return 'game-over';if(S.paused)return 'paused';
 try{if(window.CUT&&CUT.on)return 'cutscene'}catch(e){}
 var ids=['daySum','aqModal','clientModal','loanModal','osModal','testModal','menu','ceoBag','ceoProf','ceoWork','evModal','teeCut','policeModal','spyModal'];
 for(var i=0;i<ids.length;i++){var el=document.getElementById(ids[i]);if(!el||el.hidden)continue;
  try{var cs=getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden'||!el.getClientRects().length)continue}catch(e){}
  return ids[i]}
 return '';
}
function extBlocked(){return !!extBlockedBy()}
function why(){var m=S.t,n=nightOf(),q=gs(),at=atCo();return {phase:G.phase,night:n,time:Math.round(m),savedNight:q.night||null,atCompany:at,blockedBy:extBlockedBy()||null,
 reason:(q.night===n?'คืนนี้ผีมาแล้ว (1 คืน = 1 ครั้ง)':!(m>=T_GHOST||m<240)?'ยังไม่ถึงเวลา (22:00–04:00)':!at?'ผู้เล่นไม่ได้อยู่ในออฟฟิศ':extBlockedBy()?'มีหน้าต่าง/คัตซีนค้าง: '+extBlockedBy():G.phase!=='idle'?'ผีกำลังทำงาน: '+G.phase:'พร้อม — ผีจะมาเอง')}}
function freezePlayer(){if(G.inPMB)return false;var p=G.phase;return(p==='fly'&&G.freeze)||p==='talk'||p==='caught'||p==='black'}

/* ---------------- เสียง: รองรับไฟล์ภายหลัง + เสียงสังเคราะห์สำรอง (ไม่มีไฟล์ = ไม่โหลดอะไร ไม่เกิด error) ---------------- */
var FILES={flicker:'',ambient:'',appear:'',voice:'',jumpscare:''};   // ใส่ URL / data:audio ภายหลังได้ด้วย GHOST.setSound('jumpscare','file.mp3')
var fileEls={},AC=null,noiseBuf=null;
function sOn(){try{return localStorage.getItem('mct_sound')!=='0'}catch(e){return true}}
function vol(){try{var v=localStorage.getItem('mct_vol');return v==null?.8:Math.max(0,Math.min(1,(+v)/100))}catch(e){return .8}}
function actx(){if(!sOn())return null;try{if(!AC){var C=window.AudioContext||window.webkitAudioContext;if(!C)return null;AC=new C()}if(AC.state==='suspended')AC.resume();return AC}catch(e){return null}}
function playFile(k,loop){var u=FILES[k];if(!u||!sOn())return false;try{var a=fileEls[k];if(!a||a.getAttribute('data-u')!==u){a=fileEls[k]=new Audio(u);a.setAttribute('data-u',u)}a.loop=!!loop;a.currentTime=0;a.volume=vol();var p=a.play();if(p&&p.catch)p.catch(function(){});return true}catch(e){return false}}
function nbuf(c){if(noiseBuf)return noiseBuf;var n=c.sampleRate*2,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(var i=0;i<n;i++)d[i]=Math.random()*2-1;return noiseBuf=b}
function noise(c,t,dur,gain,type,f1,f2,q){var s=c.createBufferSource();s.buffer=nbuf(c);s.loop=true;var f=c.createBiquadFilter();f.type=type||'bandpass';f.frequency.setValueAtTime(f1||1000,t);if(f2)f.frequency.exponentialRampToValueAtTime(f2,t+dur);f.Q.value=q||1;var g=c.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(gain,t+Math.min(.05,dur/4));g.gain.exponentialRampToValueAtTime(.0006,t+dur);s.connect(f);f.connect(g);g.connect(c.destination);s.start(t,Math.random());s.stop(t+dur+.05)}
function osc(c,t,dur,type,f1,f2,gain,lp){var o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f1,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(gain,t+Math.min(.04,dur/4));g.gain.exponentialRampToValueAtTime(.0006,t+dur);var out=g;if(lp){var f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=lp;o.connect(f);f.connect(g)}else o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+dur+.05)}
function sfxBuzz(){if(playFile('flicker'))return;var c=actx();if(!c)return;var t=c.currentTime,v=vol();osc(c,t,.35,'sawtooth',120,55,.10*v,1400);noise(c,t,.28,.16*v,'bandpass',2600,900,1.4);noise(c,t+.12,.12,.12*v,'highpass',3000,3000,1)}
function sfxAppear(){if(playFile('appear'))return;var c=actx();if(!c)return;var t=c.currentTime,v=vol();osc(c,t,1.6,'sine',260,48,.22*v);osc(c,t,1.6,'triangle',131,40,.12*v,500);noise(c,t,1.8,.10*v,'bandpass',400,1500,.8)}
function sfxCreak(){var c=actx();if(!c)return;var t=c.currentTime,v=vol();osc(c,t,.9,'sawtooth',150,88,.05*v,420);noise(c,t,.7,.04*v,'bandpass',700,300,3)}
function sfxWind(){var c=actx();if(!c)return;var t=c.currentTime,v=vol();noise(c,t,2.6,.06*v,'lowpass',260,520,.7)}
function sfxVoice(){if(playFile('voice'))return;var c=actx();if(!c)return;var t=c.currentTime,v=vol();osc(c,t,.07,'triangle',85+Math.random()*50,70,.07*v,700)}
function sfxScare(){if(playFile('jumpscare'))return;var c=actx();if(!c)return;var t=c.currentTime,v=vol();noise(c,t,1.1,.5*v,'bandpass',1800,600,.6);osc(c,t,1.0,'sawtooth',520,980,.22*v);osc(c,t,1.0,'sawtooth',554,1040,.2*v);osc(c,t,1.2,'square',70,40,.25*v,300)}
function ambStart(){if(G.amb)return;if(playFile('ambient',true)){G.amb={file:1};return}var c=actx();if(!c)return;try{var g=c.createGain();g.gain.value=0;g.gain.linearRampToValueAtTime(.05*vol(),c.currentTime+2);var o1=c.createOscillator(),o2=c.createOscillator();o1.type='sine';o2.type='sine';o1.frequency.value=47;o2.frequency.value=50.5;var s=c.createBufferSource();s.buffer=nbuf(c);s.loop=true;var f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=240;var ng=c.createGain();ng.gain.value=.55;s.connect(f);f.connect(ng);ng.connect(g);o1.connect(g);o2.connect(g);g.connect(c.destination);o1.start();o2.start();s.start();G.amb={g:g,o1:o1,o2:o2,s:s,c:c}}catch(e){G.amb=null}}
function ambStop(){var a=G.amb;if(!a)return;G.amb=null;try{if(a.file){var e=fileEls.ambient;if(e)e.pause();return}var t=a.c.currentTime;a.g.gain.cancelScheduledValues(t);a.g.gain.setValueAtTime(a.g.gain.value,t);a.g.gain.linearRampToValueAtTime(0,t+1.2);a.o1.stop(t+1.3);a.o2.stop(t+1.3);a.s.stop(t+1.3)}catch(e){}}

/* ---------------- DOM: กล่องบทพูด + ฉาก Jump Scare ---------------- */
var dom=null;
function ensureDom(){
 if(dom)return dom;
 var st=document.createElement('style');st.id='ghostCss';
 st.textContent='#ghostDlg{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 28px);transform:translateX(-50%);width:min(680px,94vw);z-index:9000;display:none;align-items:center;gap:14px;box-sizing:border-box;padding:12px 16px;background:linear-gradient(180deg,rgba(18,8,26,.94),rgba(8,4,14,.96));border:2px solid #7d2f4a;border-radius:10px;box-shadow:0 0 28px rgba(150,30,70,.55),inset 0 0 22px rgba(0,0,0,.6);color:#ece3f4;cursor:pointer;user-select:none;-webkit-user-select:none}'
 +'#ghostDlg img{width:74px;height:84px;object-fit:cover;object-position:50% 50%;border:2px solid #4a2a46;border-radius:6px;image-rendering:pixelated;background:#050208;flex:none}'
 +'#ghostDlg .gdN{font-size:12px;letter-spacing:.18em;color:#c2587c;margin-bottom:4px;text-transform:uppercase}'
 +'#ghostDlg .gdT{font-size:clamp(17px,2.6vw,23px);line-height:1.45;min-height:1.5em;text-shadow:0 0 8px rgba(190,60,110,.6)}'
 +'#ghostDlg .gdH{position:absolute;right:12px;bottom:6px;font-size:11px;color:#8d6a86}'
 +'@keyframes gdJit{0%,100%{transform:translateX(-50%)}25%{transform:translateX(calc(-50% + 1px))}75%{transform:translateX(calc(-50% - 1px))}}'
 +'#ghostDlg.on{display:flex;animation:gdJit .18s steps(2) infinite}'
 +'#ghostScare{position:fixed;inset:0;z-index:99990;display:none;background:#000;overflow:hidden;pointer-events:all}'
 +'#ghostScare img{position:absolute;left:50%;top:50%;height:100vh;width:auto;max-width:none;transform:translate(-50%,-50%) scale(.3);image-rendering:pixelated;opacity:0}'
 +'#ghostScare .gsF{position:absolute;inset:0;background:#fff;opacity:0}'
 +'#ghostScare .gsT{position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);text-align:center;font-size:clamp(26px,5vw,46px);letter-spacing:.14em;color:#d9d0e8;opacity:0;text-shadow:0 0 18px rgba(160,60,120,.8)}';
 document.head.appendChild(st);
 var d=document.createElement('div');d.id='ghostDlg';d.innerHTML='<img alt="" src="'+FACE_SRC+'"><div><div class="gdN">???</div><div class="gdT"></div></div><div class="gdH">แตะ / E เพื่อข้าม</div>';
 d.addEventListener('pointerdown',function(e){e.preventDefault();skipTalk()});
 document.body.appendChild(d);
 var s=document.createElement('div');s.id='ghostScare';s.innerHTML='<img alt="" src="'+CARD_SRC+'"><div class="gsF"></div><div class="gsT">คุณหมดสติ...</div>';
 document.body.appendChild(s);
 dom={dlg:d,txt:d.querySelector('.gdT'),sc:s,img:s.querySelector('img'),fl:s.querySelector('.gsF'),tx:s.querySelector('.gsT')};
 return dom;
}
addEventListener('keydown',function(e){if(G.phase!=='talk')return;var k=(e.key||'').toLowerCase();if(k==='e'||k==='enter'||k===' '){e.preventDefault();e.stopImmediatePropagation();skipTalk()}},true);
function setShake(a){G.shakeAmp=a;var cv=$g('cv');if(!cv)return;if(a<=.01){cv.style.translate='';return}cv.style.translate=((Math.random()*2-1)*a).toFixed(1)+'px '+((Math.random()*2-1)*a).toFixed(1)+'px'}

/* ---------------- ไฟในบริษัท: กะพริบ / ดับบางห้อง ---------------- */
function roomRects(){var r=[];try{for(var i=0;i<RM.length;i++){var q=RM[i];r.push([q[0]*T,q[1]*T,(q[2]-q[0]+1)*T,(q[3]-q[1]+1)*T])}}catch(e){}return r}
function lights(dt,level){
 // level 0 ปกติ · 1 ก่อนผีมา (21:00) · 2 ผีกำลังจะมา · 3 ผีอยู่ในบริษัท
 var rooms=roomRects(),n=rooms.length;while(G.lr.length<n)G.lr.push(0);
 var tgtDim=0;
 if(level===1)tgtDim=.05+.16*Math.max(0,Math.min(1,(S.t-T_FLICKER)/60));else if(level===2)tgtDim=.30;else if(level===3)tgtDim=.28;
 G.dim+=(tgtDim-G.dim)*(1-Math.exp(-dt*2.5));
 if(level>0){
  G.nextBurst-=dt;
  if(G.burst<=0&&G.nextBurst<=0){G.burst=level===2?1.8:(.45+Math.random()*.7);G.nextBurst=level===1?3+Math.random()*4:level===2?.2:4+Math.random()*5;sfxBuzz()}
 }
 var allOut=false;
 if(G.burst>0){G.burst-=dt;G.flipT-=dt;if(G.flipT<=0){G.flipT=.06+Math.random()*.08;for(var i=0;i<n;i++)G.lr[i]=Math.random()<(level===2?.65:.45)?.88:0;allOut=level===2&&Math.random()<.18;if(allOut)for(i=0;i<n;i++)G.lr[i]=.9}}
 else{for(var j=0;j<n;j++)G.lr[j]*=Math.exp(-dt*9)}
}
function drawLights(g,w,h){
 if(G.dim<.01){var any=false;for(var k=0;k<G.lr.length;k++)if(G.lr[k]>.02){any=true;break}if(!any)return}
 g.save();
 if(G.dim>.01){g.fillStyle='rgba(5,7,26,'+G.dim.toFixed(3)+')';g.fillRect(0,0,w,h)}
 var rooms=roomRects();
 for(var i=0;i<rooms.length&&i<G.lr.length;i++){var a=G.lr[i]-G.dim;if(a>.02){g.fillStyle='rgba(2,3,14,'+a.toFixed(3)+')';var r=rooms[i];if(r[0]>=w)continue;g.fillRect(r[0],r[1],r[2],r[3])}}
 g.restore();
}

/* ---------------- ตัวผี ---------------- */
function updDir(){var ax=Math.abs(G.vx),ay=Math.abs(G.vy);if(ax<1&&ay<1)return;
 if(ax>ay*1.25)G.dir=G.vx<0?1:3;else if(ay>ax*1.25)G.dir=G.vy<0?2:0}
function moveGhost(dt,tx,ty,sp,acc){
 var dx=tx-G.x,dy=ty-G.y,d=Math.hypot(dx,dy)||1,vx=dx/d*sp,vy=dy/d*sp,k=1-Math.exp(-dt*acc);
 G.vx+=(vx-G.vx)*k;G.vy+=(vy-G.vy)*k;G.x+=G.vx*dt;G.y+=G.vy*dt;updDir();return d}
function tileFree(x,y){try{return !blk(x,y)}catch(e){return true}}
function ghostLOS(ax,ay,bx,by){var d=Math.hypot(bx-ax,by-ay),n=Math.max(1,Math.ceil(d/6));for(var i=1;i<=n;i++){var x=ax+(bx-ax)*i/n,y=ay+(by-ay)*i/n;try{if(pb(x,y))return false}catch(e){}}return true}
// BFS บนตารางไทล์ (เดินได้เฉพาะช่องว่าง · ไม่ตัดมุมกำแพง) → รายการจุดกึ่งกลางไทล์
function findPath(sx,sy,tx,ty){
 var cols=24,rows=16,s0=[sx/T|0,sy/T|0],g0=[tx/T|0,ty/T|0];
 function ok(x,y){return x>=0&&y>=0&&x<cols&&y<rows&&tileFree(x,y)}
 if(!ok(g0[0],g0[1])){var best=null,bd=1e9;for(var yy=0;yy<rows;yy++)for(var xx=0;xx<cols;xx++)if(ok(xx,yy)){var dd=Math.abs(xx-g0[0])+Math.abs(yy-g0[1]);if(dd<bd){bd=dd;best=[xx,yy]}}if(!best)return null;g0=best}
 var prev={},q=[s0],k0=s0[1]*cols+s0[0];prev[k0]=-1;
 var dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
 for(var h=0;h<q.length;h++){
  var c=q[h];if(c[0]===g0[0]&&c[1]===g0[1])break;
  for(var i=0;i<8;i++){var nx=c[0]+dirs[i][0],ny=c[1]+dirs[i][1];if(!ok(nx,ny))continue;
   if(i>=4&&(!ok(c[0]+dirs[i][0],c[1])||!ok(c[0],c[1]+dirs[i][1])))continue;
   var kk=ny*cols+nx;if(prev[kk]!==undefined)continue;prev[kk]=c[1]*cols+c[0];q.push([nx,ny])}
 }
 var gk0=g0[1]*cols+g0[0];if(prev[gk0]===undefined)return null;
 var out=[],cur=gk0;while(cur!==-1){out.push([(cur%cols)*T+T/2,((cur/cols)|0)*T+T/2]);cur=prev[cur]}
 return out.reverse();
}
// ผีเดินพื้น: ชนกำแพง/เฟอร์นิเจอร์เหมือนผู้เล่น (ไม่ทะลุ ไม่บิน) · มองเห็นผู้เล่นตรง ๆ = เดินเข้าหา · ไม่เห็น = เดินตามเส้นทางอ้อมกำแพง
function walkGhost(dt,px,py,sp){
 var tx=px,ty=py;
 if(!ghostLOS(G.x,G.y,px,py)){
  G.pathT=(G.pathT||0)-dt;
  if(G.pathT<=0||!G.path){G.pathT=.25;G.path=findPath(G.x,G.y,px,py);G.pi=1}
  var P=G.path;
  if(P&&P.length){
   while(G.pi<P.length-1&&Math.hypot(P[G.pi][0]-G.x,P[G.pi][1]-G.y)<7)G.pi++;
   var w=P[Math.min(G.pi,P.length-1)];tx=w[0];ty=w[1];
  }
 }else G.path=null;
 var dx=tx-G.x,dy=ty-G.y,d=Math.hypot(dx,dy)||1,k=1-Math.exp(-dt*7);
 G.vx+=(dx/d*sp-G.vx)*k;G.vy+=(dy/d*sp-G.vy)*k;
 var nx=G.x+G.vx*dt,ny=G.y+G.vy*dt;
 if(pb(nx,G.y)){G.vx=0}else G.x=nx;
 if(pb(G.x,ny)){G.vy=0}else G.y=ny;
 updDir();G.anim+=Math.hypot(G.vx,G.vy)*dt/13;
}
function faceGhost(){var p=S.pl,dx=G.x-p.x,dy=G.y-p.y;p.d=Math.abs(dx)>=Math.abs(dy)?(dx<0?1:3):(dy<0?2:0);p.mv=false}
function drawGhost(g,t){
 var K=gk(),im=K.spr;
 if(!G.vis||G.alpha<=.01||!im.complete||!im.naturalWidth)return;
 var dh=K.dh,dw=dh*K.cw/K.ch,still=K.walk&&Math.hypot(G.vx,G.vy)<6,fr=still?0:Math.floor(G.anim)%4,row=K.rows[G.dir]||0;
 var bob=K.walk?(still?0:-Math.abs(Math.sin(G.anim*Math.PI))*1.5):Math.sin(t*3.1)*3-10;
 g.save();g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
 if(!K.walk)for(var i=0;i<G.trail.length;i++){var q=G.trail[i];g.globalAlpha=G.alpha*.10*((i+1)/G.trail.length);g.drawImage(im,fr*K.cw,row*K.ch,K.cw,K.ch,q[0]-dw/2,q[1]+9-dh+bob,dw,dh)}
 var fl=K.walk?1:.9+.1*Math.sin(t*23);g.globalAlpha=Math.min(1,G.alpha*fl*(K.walk?1.05:1));
 g.drawImage(im,fr*K.cw,row*K.ch,K.cw,K.ch,G.x-dw/2,G.y+9-dh+bob,dw,dh);
 if(K.glow){g.globalCompositeOperation='lighter';var gr=g.createRadialGradient(G.x,G.y-30+bob,3,G.x,G.y-30+bob,54);gr.addColorStop(0,'rgba(150,120,255,'+(.20*G.alpha).toFixed(3)+')');gr.addColorStop(1,'rgba(150,120,255,0)');g.fillStyle=gr;g.fillRect(G.x-54,G.y-84+bob,108,108)}
 g.restore();
}

/* ---------------- วงจรเหตุการณ์ ---------------- */
function start(night){
 var q=gs();q.night=night;G.runNight=night;G.kind=GKEYS[Math.floor(Math.random()*GKEYS.length)];if(window.__ghostForce&&GKINDS[window.__ghostForce])G.kind=window.__ghostForce;q.kind=G.kind;G.path=null;G.phase='shake';G.t=0;G.freeze=false;G.vis=false;G.alpha=0;G.vx=G.vy=0;G.trail=[];G.fainted=false;G.nextBurst=0;G.burst=0;G.lvl=2;
 try{save(1)}catch(e){}
}
function hardEnd(){ // ยกเลิกทันที (CEO ออกจากบริษัท / ขึ้นวันใหม่ / รีเซ็ต)
 hideDlg();setShake(0);G.vis=false;G.alpha=0;G.freeze=false;G.phase='idle';G.runNight=null;G.lvl=0;G.trail=[];G.burst=0;
 var d=ensureDom();if(d.sc.style.display!=='none'){d.sc.style.display='none'}
}
function softEnd(msg){G.phase='fade';G.fadeT=0;G.freeze=false;hideDlg();if(msg){try{toast(msg)}catch(e){}}}
function showDlg(){var d=ensureDom();var k=gk();var im=d.dlg.querySelector('img');if(im){var u=(k.face||k.card).src;if(im.getAttribute('src')!==u)im.setAttribute('src',u)}var nm=d.dlg.querySelector('.gdN');if(nm)nm.textContent='???';d.dlg.classList.add('on')}
function hideDlg(){if(!dom)return;dom.dlg.classList.remove('on');dom.txt.textContent=''}
function skipTalk(){if(G.phase!=='talk')return;if(G.sub==='type'){G.typed=1e6}else if(G.sub==='hold'){G.subT=99}}
function pickLines(){var a=gk().lines.slice(),o=[];while(o.length<3&&a.length){o.push(a.splice(Math.floor(Math.random()*a.length),1)[0])}return o}
function beginTalk(){G.phase='talk';G.lines=pickLines();G.li=0;G.typed=0;G.sub='type';G.subT=0;G.t=0;faceGhost();showDlg();dom.txt.textContent=''}
function talkStep(dt){
 var line=G.lines[G.li]||'';
 if(G.sub==='type'){var before=Math.floor(G.typed);G.typed+=dt*22;var now=Math.min(line.length,Math.floor(G.typed));if(now!==before&&(now%2===0))sfxVoice();dom.txt.textContent=line.slice(0,now);if(G.typed>=line.length){dom.txt.textContent=line;G.sub='hold';G.subT=0}}
 else if(G.sub==='hold'){G.subT+=dt;if(G.subT>=1.15){G.li++;if(G.li>=G.lines.length){G.sub='end';G.subT=0}else{G.sub='gap';G.subT=0;dom.txt.textContent=''}}}
 else if(G.sub==='gap'){G.subT+=dt;if(G.subT>=.35){G.typed=0;G.sub='type'}}
 else if(G.sub==='end'){G.subT+=dt;if(G.subT>=.3){hideDlg();G.phase='chase';G.chaseT=0;G.farT=0;G.grace=1.4;G.freeze=false;G.lvl=3}}
}
function beginCaught(){
 if(G.phase!=='caught'){try{window.HXE&&HXE.onCaught(G.kind)}catch(e){console.error('[horror]',e)}}   // HORROR ENDING: นับการจับสำเร็จ 1 ครั้งต่อเหตุการณ์
 G.phase='caught';G.sc=0;G.freeze=true;G.vis=true;hideDlg();var p=S.pl;p.mv=false;try{clearPlayerInput()}catch(e){}
 var d=ensureDom(),k=gk();d.img.setAttribute('src',k.card.src);d.img.style.imageRendering=k.pix?'pixelated':'auto';
 d.sc.style.display='block';d.sc.style.background='transparent';d.sc.style.transform='';d.img.style.opacity='0';d.fl.style.opacity='0';d.tx.style.opacity='0';
 G.scared=false;G.slam=false;
}
/* v98 · Jump Scare ใหม่: จอสั่นก่อน → ภาพผีกระแทกเต็มจอ + สั่นแรง/เอียง/แฟลช → สั่นค่อยๆ เบาลงแล้วดับ */
function caughtStep(dt){
 var d=ensureDom(),sc=G.sc+=dt;
 var r=function(a){return(Math.random()*2-1)*a};
 var put=function(sc2,amp,rot){d.img.style.transform='translate(-50%,-50%) translate('+r(amp).toFixed(1)+'px,'+r(amp).toFixed(1)+'px) rotate('+r(rot).toFixed(2)+'deg) scale('+sc2.toFixed(3)+')'};
 if(sc<.45){                                   // ช่วงจอสั่นก่อนผีโผล่ (เห็นฉากเกม สั่นแรงขึ้นเรื่อย ๆ)
  var k0=sc/.45;setShake(6+18*k0);
  d.fl.style.background='#a00000';d.fl.style.opacity=(Math.floor(sc/.05)%2?(.12+.25*k0).toFixed(2):'0');
  if(!G.vib){G.vib=true;try{navigator.vibrate&&navigator.vibrate([60,40,80,40,120])}catch(e){}}
 }else{
  if(!G.scared){G.scared=true;G.slam=true;sfxScare();d.sc.style.background='#000';try{navigator.vibrate&&navigator.vibrate([250,60,250])}catch(e){}}
  var t=sc-.45;
  if(t<.75){                                    // ภาพกระแทกเข้าหน้าจอ
   var k=t/.75,e=1-Math.pow(1-k,3);
   d.img.style.opacity='1';put(.55+1.35*e,34,3);setShake(24);
   d.fl.style.background=(Math.floor(t/.06)%2?'#fff':'#a00000');d.fl.style.opacity=(Math.floor(t/.05)%2?'.6':'0');
  }else if(t<1.95){                             // ค้างหน้าจอ สั่นแรงแล้วค่อย ๆ เบา
   var k2=(t-.75)/1.2,amp=36*(1-.65*k2);
   d.img.style.opacity='1';put(1.9+.3*k2,amp,2.2*(1-.5*k2));setShake(18*(1-k2));
   d.fl.style.background='#fff';d.fl.style.opacity=(Math.floor(t/.08)%2&&k2<.7?'.28':'0');
  }else if(t<2.35){                             // เฟดดับ
   var k3=(t-1.95)/.4;d.img.style.opacity=(1-k3).toFixed(3);put(2.2,10*(1-k3),.6);d.fl.style.opacity='0';setShake(0);
  }else{d.img.style.opacity='0';d.img.style.transform='';d.sc.style.transform='';setShake(0);G.vib=false;G.phase='black';G.blackT=0;G.vis=false;G.alpha=0;G.fainted=false}
 }
}
function performFaint(){
 var q=gs();if(q.faint===G.runNight)return;q.faint=G.runNight;
 if(q.rep!==G.runNight){q.rep=G.runNight;S.rep=Math.max(0,(S.rep||0)-2)}   // ลดชื่อเสียงครั้งเดียว · ไม่หักเงิน/พนักงาน/เฟอร์นิเจอร์
 try{hud()}catch(e){}
 var ok=false;try{ok=CEOScene.faint()}catch(e){console.error('[ghost] faint',e)}
 if(!ok){try{if(S.t>=360){S.t=1440;endDay()}S.t=360;hud()}catch(e){}}
 try{save(1)}catch(e){}
}
function blackStep(dt){
 var d=ensureDom(),b=G.blackT+=dt;
 d.tx.style.opacity=String(Math.max(0,Math.min(1,b/.7))*(b>2.5?Math.max(0,1-(b-2.5)/.5):1));
 if(b>=.5&&!G.fainted){G.fainted=true;performFaint()}
 if(b>=3.0){d.sc.style.transition='opacity 1.2s ease';d.sc.style.opacity='0';G.phase='wake';G.wakeT=0;try{toast('😱 คุณหมดสติ… ชื่อเสียงบริษัทลดลง 2 คะแนน')}catch(e){}}
}
function wakeStep(dt){G.wakeT+=dt;if(G.wakeT>=1.3){var d=ensureDom();d.sc.style.display='none';d.sc.style.opacity='1';d.sc.style.transition='';d.tx.style.opacity='0';G.phase='done';G.lvl=0}}

function step(dt){
 if(typeof S==='undefined'||!S||S.over)return;
 var m=S.t,at=atCo(),night=nightOf(),q=gs(),p=G.phase;
 // ขึ้นวันใหม่ (ผ่าน 06:00) → ปิดเหตุการณ์ของคืนก่อน · รีเซ็ตสถานะ
 if(p!=='idle'&&p!=='caught'&&p!=='black'&&p!=='wake'&&p!=='done'&&G.runNight!==null&&G.runNight!==night){hardEnd();p=G.phase}
 if(p==='done'&&G.runNight!==null&&G.runNight!==night){G.phase='idle';G.runNight=null;p='idle'}
 if(p==='done'){G.wasAt=at;lights(dt,0);return}
 if(p==='idle'){
  G.wasAt=at;
  var ok=(q.night!==night&&q.cancel!==night);
  G.flickOn=!!(ok&&at&&m>=T_FLICKER&&m<T_GHOST);
  if(ok&&(m>=T_GHOST||m<240)){                                   // รอได้ถึง 02:30 ถ้าตอน 22:00 ติดหน้าต่าง/คัตซีน/CEO กำลังทำงาน (เดิมหมดเวลา 23:00 แล้วคืนนั้นไม่มีผี)
   if(at&&!extBlocked())start(night);                             // ไม่ยกเลิกคืนนี้ถ้าออกไปข้างนอก · รอจน CEO กลับบริษัท (ภายในหน้าต่าง 22:00–02:30) แล้วผีจะมา
  }
  lights(dt,G.flickOn?1:0);
  if(G.flickOn){ambStart();G.nextCreak-=dt;if(G.nextCreak<=0){G.nextCreak=7+Math.random()*8;Math.random()<.5?sfxCreak():sfxWind()}}
  else ambStop();
  return;
 }
 G.wasAt=at;
 // CEO ออกจากบริษัทระหว่างเหตุการณ์ (ก่อนโดนจับ) → หยุดเหตุการณ์อย่างปลอดภัย
 if(!at&&(p==='shake'||p==='fly'||p==='talk'||p==='chase'||p==='fade')){
   var si0=streetInfo0();
   if(si0&&(p==='shake'||p==='fly'||p==='chase')){toStreet(si0);p=G.phase}
   else if(si0&&p==='fade'){/* ผีกำลังเลือนหายไปบนถนน ปล่อยให้เฟดจนจบ */}
   else{hardEnd();ambStop();return}
  }
 var pausedHard=!!S.paused;
 if(p==='shake'||p==='fly'||p==='chase'){if(pausedHard||extBlocked())dt=0}
 else if(pausedHard)dt=0;
 if(p==='shake'||p==='fly'||p==='talk'||p==='chase'||p==='sspawn'||p==='schase'||p==='sboard'){ambStart();G.nextCreak-=dt;if(G.nextCreak<=0){G.nextCreak=5+Math.random()*6;Math.random()<.5?sfxCreak():sfxWind()}}
 if(p==='shake'){
  G.t+=dt;lights(dt,2);setShake(Math.min(2.6,.6+G.t*1.4)*(dt>0?1:0));
  if(G.t>=1.9){G.phase='fly';G.vis=true;G.alpha=0;G.x=-60;G.y=15*T+14;G.vx=150;G.vy=0;G.dir=3;G.wp=0;G.freeze=false;sfxAppear()}
 }else if(p==='fly'){
  lights(dt,3);G.t+=dt;setShake(Math.max(0,1.2-(G.t*.6))*(dt>0?1:0));
  G.alpha=Math.min(.95,G.alpha+dt/.6);G.anim+=dt*5;
  var wp=((window.OFC&&OFC.floor&&S.ofc)?OFC.ghostWP():[[3*T+16,15*T+14],[3*T+16,12*T+16]])[G.wp];
  if(gk().walk){G.anim+=Math.hypot(G.vx,G.vy)*dt/13;moveGhost(dt,wp[0],wp[1],G.wp?70:96,6)}else moveGhost(dt,wp[0],wp[1],G.wp?120:165,6);
  if(G.y<14*T+22&&!G.freeze){G.freeze=true;try{clearPlayerInput()}catch(e){}faceGhost();sfxCreak()}   // ผีเข้าประตูแล้ว → หยุด CEO
  if(G.freeze)faceGhost();
  if(Math.hypot(wp[0]-G.x,wp[1]-G.y)<6){if(G.wp===0)G.wp=1;else{G.vx=G.vy=0;G.dir=1;if(Math.abs(S.pl.x-G.x)>Math.abs(S.pl.y-G.y)){G.dir=S.pl.x<G.x?1:3}else G.dir=S.pl.y<G.y?2:0;beginTalk()}}
 }else if(p==='talk'){
  lights(dt,3);setShake(0);G.anim+=dt*2.5;G.alpha=.95;talkStep(dt);
  var dx=S.pl.x-G.x,dy=S.pl.y-G.y;G.dir=Math.abs(dx)>=Math.abs(dy)?(dx<0?1:3):(dy<0?2:0);   // ผีหันหา CEO
  G.vx=G.vy=0;
 }else if(p==='chase'){
  lights(dt,3);G.t+=dt;setShake(0);G.chaseT+=dt;G.anim+=dt*6;G.alpha=.95;
  var pl=S.pl,dist=Math.hypot(pl.x-G.x,pl.y-G.y);
  var base=GHOST_SPEED0+(GHOST_SPEED1-GHOST_SPEED0)*Math.min(1,G.chaseT/18);
  if(G.grace>0){G.grace-=dt;base*=Math.max(.12,1-G.grace/1.4)}                 // ช่วงเริ่มไล่: ออกตัวช้า ให้ CEO ตั้งตัวได้
  // ส่ายเล็กน้อยให้ดูเป็นวิญญาณลอย แต่ยังมุ่งหา CEO ตลอด
  var wv=Math.sin(G.chaseT*2.3)*.22,ang=Math.atan2(pl.y-G.y,pl.x-G.x)+wv,tx=G.x+Math.cos(ang)*100,ty=G.y+Math.sin(ang)*100;
  if(gk().walk)walkGhost(dt,pl.x,pl.y,Math.min(base,CEO_SPEED*.74));else moveGhost(dt,tx,ty,Math.min(base,CEO_SPEED*.74),3.2);
  G.trT+=dt;if(G.trT>.07){G.trT=0;G.trail.push([G.x,G.y]);if(G.trail.length>5)G.trail.shift()}
  dist=Math.hypot(pl.x-G.x,pl.y-G.y);
  if(dist>ESCAPE_DIST)G.farT+=dt;else G.farT=Math.max(0,G.farT-dt*2);
  if(G.grace<=0&&dist<CATCH_R&&dt>0&&(!gk().walk||ghostLOS(G.x,G.y,pl.x,pl.y))){beginCaught();return}
  if(G.farT>=ESCAPE_TIME){softEnd('👻 ผีหายไปในความมืด… คุณหนีรอดมาได้');}
 }else if(p==='fade'){
  lights(dt,0);G.fadeT+=dt;G.alpha=Math.max(0,.95*(1-G.fadeT/1.4));G.anim+=dt*4;G.x+=G.vx*dt*.4;G.y+=G.vy*dt*.4;setShake(0);
  if(G.fadeT>=1.4){hardEnd();ambStop();G.phase='done';G.lvl=0}
 }else if(p==='sspawn'){
   lights(dt,0);G.t+=dt;var si1=streetInfo0();
   if(!si1){hardEnd();ambStop();return}
   if(si1.protect){hardEnd();ambStop();G.phase='done';G.lvl=0;return}
   if(G.t>=G.sd){G.phase='schase';G.vis=true;G.alpha=0;G.vx=G.vy=0;G.chaseT=0;G.grace=2.2;G.farT=0;sfxAppear();try{CEOScene.doorPulse()}catch(e){}}
  }else if(p==='schase'){
   lights(dt,0);G.t+=dt;G.chaseT+=dt;G.anim+=dt*6;G.alpha=Math.min(.95,G.alpha+dt/.7);
   var si2=streetInfo0();
   if(!si2){hardEnd();ambStop();return}
   if(si2.protect){G.phase='sboard';G.t=0;return}                      // CEO กดขึ้นรถแล้ว → ผีทำร้ายไม่ได้อีก
   var spd=GHOST_SPEED0+(GHOST_SPEED1-GHOST_SPEED0)*Math.min(1,G.chaseT/18);
   if(G.grace>0){G.grace-=dt;spd*=Math.max(.12,1-G.grace/2.2)}
   var wv2=Math.sin(G.chaseT*2.3)*.22,ang2=Math.atan2(si2.y-G.y,si2.x-G.x)+wv2,tx2=G.x+Math.cos(ang2)*100,ty2=G.y+Math.sin(ang2)*100;
   moveGhost(dt,tx2,ty2,Math.min(spd,96),3.2);if(gk().walk)G.anim+=Math.hypot(G.vx,G.vy)*dt/13-dt*6;
   G.trT+=dt;if(G.trT>.07){G.trT=0;G.trail.push([G.x,G.y]);if(G.trail.length>5)G.trail.shift()}
   var d2=Math.hypot(si2.x-G.x,si2.y-G.y);
   if(d2>ESCAPE_DIST)G.farT+=dt;else G.farT=Math.max(0,G.farT-dt*2);
   if(G.grace<=0&&d2<CATCH_R&&dt>0){beginCaught();return}              // ผีจับก่อนขึ้นรถ → Jump Scare + ตื่นบนเตียงวันถัดไป (ระบบเดิม)
   if(G.farT>=ESCAPE_TIME){softEnd('👻 ผีหายไปในความมืด… คุณหนีรอดมาได้')}
  }else if(p==='sboard'){
   // ขึ้นรถสำเร็จ: ปิดระบบจับ/Jump Scare ทั้งหมด · ผีลอยอยู่แถวป้ายเชิงภาพประกอบเท่านั้น
   lights(dt,0);G.t+=dt;G.anim+=dt*3.5;G.alpha=Math.max(.35,G.alpha-dt*.05);
   var si3=streetInfo0();
   if(!si3){hardEnd();ambStop();G.phase='done';G.lvl=0;return}
   var hx=si3.stop.x+40,hy=si3.stop.y-10,dd=Math.hypot(hx-G.x,hy-G.y);
   if(dd>70)moveGhost(dt,hx,hy,55,2);else{G.vx*=Math.exp(-dt*2);G.vy*=Math.exp(-dt*2);G.x+=G.vx*dt;G.y+=G.vy*dt}
   if(si3.phase==='depart'||si3.phase==='out'){G.phase='sfade';G.fadeT=0}   // รถเริ่มออก → หยุดไล่ล่า
  }else if(p==='sfade'){
   lights(dt,0);G.fadeT+=dt;G.alpha=Math.max(0,.95*(1-G.fadeT/1.6));G.anim+=dt*3;G.x+=G.vx*dt*.4;G.y+=G.vy*dt*.4;
   if(G.fadeT>=1.6){hardEnd();ambStop();G.phase='done';G.lvl=0}
  }
  else if(p==='caught'){caughtStep(dt);lights(dt,3)}
 else if(p==='black'){blackStep(dt);ambStop()}
 else if(p==='wake'){wakeStep(dt)}
}
/* ---------------- ผีตามออกมาถึงถนนคนเดิน (ระบบเดินทางรถเมล์) ---------------- */
function streetInfo0(){try{return CEOScene.street&&CEOScene.street()}catch(e){return null}}
function toStreet(si){
 hideDlg();setShake(0);G.phase='sspawn';G.t=0;G.sd=2.2;G.vis=false;G.alpha=0;G.x=si.door.x;G.y=si.door.y;G.vx=G.vy=0;G.dir=0;
 G.trail=[];G.freeze=false;G.grace=2.2;G.chaseT=0;G.farT=0;G.lvl=0;
 try{CEOScene.armBus(1.5)}catch(e){}                   // รถเมล์จะมาถึงป้ายภายในไม่กี่วินาที ให้ผู้เล่นมีโอกาสหนี
}
function streetBusy(){return G.phase==='sspawn'||G.phase==='schase'||G.phase==='sboard'}
function streetFreeze(){return G.phase==='caught'||G.phase==='black'}
function streetDepart(){if(G.phase==='sboard'||G.phase==='schase'||G.phase==='sspawn'){G.phase='sfade';G.fadeT=0}}
function streetEnd(){hardEnd();ambStop();G.phase='done';G.lvl=0;G.vis=false;G.alpha=0}
function streetDraw(g,t){var p=G.phase;if(p==='sspawn'||p==='schase'||p==='sboard'||p==='sfade'||(p==='fade'&&streetInfo0()))drawGhost(g,t)}
function tick(dm,dr,d0){try{step(Math.min(.1,d0||0))}catch(e){console.error('[ghost]',e);try{hardEnd();ambStop()}catch(_){}}}
function draw(t){
 try{
  var cv=$g('cv');if(!cv)return;var p=G.phase;
  if(p==='idle'&&G.dim<.01&&!G.flickOn){var any=false;for(var k=0;k<G.lr.length;k++)if(G.lr[k]>.02){any=true;break}if(!any)return}
  if(!atCo())return;
  var g=cv.getContext('2d');
  drawGhost(g,t);
  drawLights(g,cv.width,cv.height);
 }catch(e){console.error('[ghost] draw',e)}
}

/* ---------------- เครื่องมือทดสอบ (Developer Test Mode) ---------------- */
function needTest(){if(typeof DEV_TEST_MODE!=='undefined'&&!DEV_TEST_MODE){toast('กรุณาเปิด Test Mode ก่อน');return true}return false}
function testReset(){if(needTest())return;hardEnd();ambStop();G.lr=[];G.dim=0;G.phase='idle';var q=gs();delete q.night;delete q.cancel;delete q.rep;delete q.faint;toast('รีเซ็ตสถานะผีของคืนนี้แล้ว')}
function testTime(h,mm){if(needTest())return;hardEnd();ambStop();var q=gs();delete q.night;delete q.cancel;delete q.rep;delete q.faint;G.phase='idle';S.t=h*60+(mm||0);G.wasAt=atCo();try{save(1);hud()}catch(e){}toast('ตั้งเวลา '+String(h).padStart(2,'0')+':'+String(mm||0).padStart(2,'0')+' · รีเซ็ตสถานะผีแล้ว')}
function testStart(kind){if(needTest())return;window.__ghostForce=(kind&&GKINDS[kind])?kind:null;if(!atCo()){toast('ต้องอยู่ในบริษัทก่อน');return}if(G.phase!=='idle'&&G.phase!=='done'){toast('ผีกำลังทำงานอยู่');return}var q=gs();delete q.cancel;G.phase='idle';start(nightOf())}
function status(){return{phase:G.phase,kind:G.kind,night:nightOf(),state:JSON.parse(JSON.stringify(gs())),ghost:{x:Math.round(G.x),y:Math.round(G.y),alpha:+G.alpha.toFixed(2)},flickOn:G.flickOn,dim:+G.dim.toFixed(2),t:S.t}}
window.GHOST={why:why,audio:{actx:actx,osc:osc,noise:noise,vol:vol,sOn:sOn,wind:sfxWind,creak:sfxCreak,buzz:sfxBuzz,appear:sfxAppear,scare:sfxScare,ambStop:ambStop},kinds:function(){return GKINDS},tick:tick,draw:draw,freezePlayer:freezePlayer,streetBusy:streetBusy,streetFreeze:streetFreeze,streetDepart:streetDepart,streetEnd:streetEnd,streetDraw:streetDraw,testStart:testStart,testReset:testReset,testTime:testTime,status:status,
 setSound:function(k,u){if(k in FILES)FILES[k]=u||''},lines:LINES};
})();

