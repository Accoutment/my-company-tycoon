
(function(){
'use strict';
if(window.FARM)return;
const CLS={veg:'ผักทั่วไป',fruit:'ผลไม้ทั่วไป',rare:'พืชหายาก',spec:'พืชพิเศษ',legend:'พืชระดับตำนาน'};
const CLSI={veg:'🥕',fruit:'🍎',rare:'🐉',spec:'🔮',legend:'👑'};
const CLSO=['veg','fruit','rare','spec','legend'];
const YIELD={veg:3,fruit:2,rare:2,spec:2,legend:1};
// [id, ชื่อ, ชั้น, ราคาซื้อเมล็ด, ราคาขาย, ชั่วโมงเกมที่ใช้เติบโต]
const CROPS=[
 ['carrot','แครอท','veg',30,75,8],['tomato','มะเขือเทศ','veg',45,110,12],['potato','มันฝรั่ง','veg',40,95,10],['cabbage','กะหล่ำปลี','veg',60,140,14],['corn','ข้าวโพด','veg',70,170,16],['pumpkin','ฟักทอง','veg',90,220,20],
 ['strawberry','สตรอว์เบอร์รี','fruit',120,300,18],['orange','ส้ม','fruit',150,360,24],['apple','แอปเปิล','fruit',160,390,24],['grape','องุ่น','fruit',180,430,26],['banana','กล้วย','fruit',170,410,26],['guava','ฝรั่ง','fruit',190,450,26],['cherry','เชอร์รี','fruit',200,480,28],['blueberry','บลูเบอร์รี','fruit',210,500,28],['peach','พีช','fruit',220,530,30],['papaya','มะละกอ','fruit',230,540,30],['mango','มะม่วง','fruit',240,570,32],['pineapple','สับปะรด','fruit',260,620,34],['watermelon','แตงโม','fruit',280,660,36],
 ['lychee','ลิ้นจี่','rare',700,1700,48],['rambutan','เงาะ','rare',750,1800,48],['coconut','มะพร้าว','rare',850,2000,54],['mangosteen','มังคุด','rare',900,2200,54],['dragonfruit','แก้วมังกร','rare',1000,2400,60],['durian','ทุเรียน','rare',1300,3100,72],
 ['moonlight','ดอกไม้แสงจันทร์ (Moonlight Flower)','spec',0,4000,72],['phoenix','พริกฟีนิกซ์ (Phoenix Pepper)','spec',0,4500,72],['spirit','เห็ดวิญญาณ (Spirit Mushroom)','spec',0,4600,78],['crystal','แอปเปิลคริสตัล (Crystal Apple)','spec',0,5200,84],['blood','ผลกุหลาบโลหิต (Blood Rose Berry)','spec',0,5000,84],['ghostbell','ผลระฆังผี (Ghost Bell Berry)','spec',0,5500,90],['kitsune','ผลหน้ากากจิ้งจอก (Kitsune Mask Fruit)','spec',0,6000,96],['tengu','ผลเทงงุ (Tengu Berry)','spec',0,6500,108],
 ['slimeking','สไลม์ราชา (Slime King Berry)','legend',0,14000,120],['sakura','พีชซากุระ (Sakura Peach)','legend',0,15000,120],['bat','ผลปีกค้างคาว (Bat Wing Berry)','legend',0,16000,126],['unicorn','พลัมยูนิคอร์น (Unicorn Plum)','legend',0,18000,132],
 ['ethunder','ผลสายฟ้า (Thunder Fruit)','legend',0,20000,138],['efire','ผลเปลวไฟ (Flame Fruit)','legend',0,20000,138],['eice','ผลน้ำแข็ง (Frost Fruit)','legend',0,20000,138],['ewind','ผลวายุ (Wind Fruit)','legend',0,20000,138],
 ['dfire','มังกรเพลิง (Fire Dragon Fruit)','legend',0,22000,144],['dice','มังกรน้ำแข็ง (Ice Dragon Fruit)','legend',0,22000,144],['dshadow','มังกรเงา (Shadow Dragon Fruit)','legend',0,25000,150],['dgold','มังกรทอง (Golden Dragon Fruit)','legend',0,30000,168]
].map(a=>({id:a[0],n:a[1],cls:a[2],buy:a[3],sell:a[4],h:a[5],y:YIELD[a[2]]}));
const BY={};CROPS.forEach(c=>BY[c.id]=c);
const FERT={n:{n:'ปุ๋ยธรรมดา',sp:.5,ch:.25,buy:60,ic:'🧪'},h:{n:'ปุ๋ยคุณภาพสูง',sp:.8,ch:.5,buy:220,ic:'⚗️'},r:{n:'ปุ๋ยหายาก',sp:1.2,ch:.8,buy:0,ic:'🌟'}};
const TOOLS={can2:{n:'บัวรดน้ำเหล็ก',d:'น้ำอยู่ได้นานขึ้นเป็น 36 ชั่วโมงเกม',buy:2500,ic:'🚿'},basket:{n:'ตะกร้าไม้ไผ่',d:'โอกาสได้ผลผลิตโบนัสเพิ่ม +10%',buy:3500,ic:'🧺'},spade:{n:'พลั่วเหล็ก',d:'พืชโตเร็วขึ้น +10%',buy:4000,ic:'⛏️'},gspade:{n:'พลั่วทองคำ',d:'โตเร็ว +15% และโบนัส +10% (ได้จากภารกิจเท่านั้น)',buy:0,ic:'🏆'}};
const UPG={gr:{n:'ปุ๋ยหมักบำรุงดิน (ความเร็วโต)',d:'พืชโตเร็วขึ้น +8% ต่อเลเวล',cost:[6000,15000,40000],ic:'🌱'},fe:{n:'ห้องทดลองปุ๋ย (ประสิทธิภาพปุ๋ย)',d:'โอกาสโบนัสจากปุ๋ย +6% ต่อเลเวล',cost:[5000,12000,30000],ic:'🧪'}};
const NPLOT=12,TOOLNUM=3;
// ---------- ภารกิจ 20 ข้อ ----------
const G=(t,o)=>Object.assign({t},o);
const QUESTS=[
 {id:1,d:'ง่าย',n:'เกษตรกรมือใหม่',tx:'ปลูกผักอะไรก็ได้ 3 ต้น แล้วเก็บเกี่ยวผัก 3 ชิ้น',g:[G('plant',{cls:['veg'],n:3,lab:'ปลูกผัก (ต้น)'}),G('harvest',{cls:['veg'],n:3,lab:'เก็บเกี่ยวผัก (ชิ้น)'})],money:2000},
 {id:2,d:'ง่าย',n:'ผักสดจากสวน',tx:'เก็บเกี่ยวแครอท 5 ชิ้น',g:[G('harvest',{crop:'carrot',n:5,lab:'แครอท (ชิ้น)'})],money:2500,fert:{n:3}},
 {id:3,d:'ง่าย',n:'ผลไม้แรกของฉัน',tx:'เก็บเกี่ยวผลไม้ทั่วไป 3 ชิ้น',g:[G('harvest',{cls:['fruit'],n:3,lab:'ผลไม้ทั่วไป (ชิ้น)'})],money:3000},
 {id:4,d:'ง่าย',n:'ผู้ดูแลสวน',tx:'รดน้ำพืชทั้งหมด 5 ครั้ง',g:[G('water',{n:5,lab:'รดน้ำ (ครั้ง)'})],money:2500,fert:{n:5}},
 {id:5,d:'ง่าย',n:'พ่อค้าผัก',tx:'ขายผลผลิตให้ตลาดรวม 10 ชิ้น',g:[G('sell',{n:10,lab:'ขายผลผลิต (ชิ้น)'})],money:4000},
 {id:6,d:'ปานกลาง',n:'ฤดูกาลแห่งมะเขือเทศ',tx:'เก็บเกี่ยวมะเขือเทศ 10 ชิ้น',g:[G('harvest',{crop:'tomato',n:10,lab:'มะเขือเทศ (ชิ้น)'})],money:6000},
 {id:7,d:'ปานกลาง',n:'สวนผลไม้',tx:'เก็บเกี่ยวผลไม้ 3 ชนิด ชนิดละ 3 ชิ้น',g:[G('each',{cls:['fruit'],types:3,per:3,n:3,lab:'ผลไม้ที่ครบชนิดละ 3 ชิ้น (ชนิด)'})],money:7000,fert:{h:1}},
 {id:8,d:'ปานกลาง',n:'นักสะสมเมล็ดพันธุ์',tx:'ปลูกพืชให้ครบ 5 ชนิด',g:[G('dplant',{n:5,lab:'ปลูกพืชต่างชนิด (ชนิด)'})],money:8000,seed:{dragonfruit:3}},
 {id:9,d:'ปานกลาง',n:'ผลผลิตคุณภาพดี',tx:'เก็บเกี่ยวผลผลิตที่ได้รับโบนัสคุณภาพ 5 ชิ้น (ใช้ปุ๋ยช่วย)',g:[G('qual',{n:5,lab:'ผลผลิตโบนัสคุณภาพ (ชิ้น)'})],money:9000},
 {id:10,d:'ปานกลาง',n:'สวนที่สมบูรณ์',tx:'ทำให้พืชโตเต็มที่พร้อมเก็บเกี่ยว 8 ต้น',g:[G('mat',{n:8,lab:'พืชโตเต็มที่ (ต้น)'})],money:10000,seed:{moonlight:2}},
 {id:11,d:'ยาก',n:'พ่อค้ารายใหญ่',tx:'ขายผลผลิตรวมมูลค่า 30,000 เงิน',g:[G('sval',{n:30000,lab:'มูลค่าที่ขาย ($)'})],money:15000},
 {id:12,d:'ยาก',n:'นักเกษตรมืออาชีพ',tx:'เก็บเกี่ยวผัก 5 ชนิด ชนิดละ 5 ชิ้น',g:[G('each',{cls:['veg'],types:5,per:5,n:5,lab:'ผักที่ครบชนิดละ 5 ชิ้น (ชนิด)'})],money:18000,fert:{r:2}},
 {id:13,d:'ยาก',n:'ผลไม้แห่งความอุดมสมบูรณ์',tx:'เก็บเกี่ยวผลไม้ 30 ชิ้น',g:[G('harvest',{cls:['fruit','rare'],n:30,lab:'ผลไม้ (ชิ้น)'})],money:20000},
 {id:14,d:'ยาก',n:'สวนไม่เคยหลับ',tx:'ปลูกและเก็บเกี่ยวพืชสำเร็จ 20 ต้น',g:[G('hp',{n:20,lab:'เก็บเกี่ยวสำเร็จ (ต้น)'})],money:22000,seed:{crystal:2}},
 {id:15,d:'ยาก',n:'เจ้าของสวนตัวจริง',tx:'มีผลผลิตในกระเป๋าฟาร์มรวม 50 ชิ้น',g:[G('inv',{n:50,lab:'ผลผลิตในกระเป๋า (ชิ้น)'})],money:25000,tool:{gspade:1}},
 {id:16,d:'ตำนาน',n:'ผลไม้แห่งโชคชะตา',tx:'เก็บเกี่ยวผลไม้หายาก 5 ชิ้น',g:[G('harvest',{cls:['rare'],n:5,lab:'ผลไม้หายาก (ชิ้น)'})],money:30000,seed:{dfire:1}},
 {id:17,d:'ตำนาน',n:'นักสะสมพืชหายาก',tx:'เก็บเกี่ยวพืชหายากให้ครบ 4 ชนิด',g:[G('dh',{cls:['rare'],n:4,lab:'พืชหายากต่างชนิด (ชนิด)'})],money:40000},
 {id:18,d:'ตำนาน',n:'ตำนานแห่งสวน',tx:'เก็บเกี่ยวผลผลิตทั้งหมด 100 ชิ้น',g:[G('harvest',{n:100,lab:'ผลผลิตรวม (ชิ้น)'})],money:50000,seed:{spirit:2,blood:2,dice:1,dshadow:1}},
 {id:19,d:'ตำนาน',n:'ผู้สืบทอดพลังธรรมชาติ',tx:'เก็บเกี่ยวพืชพิเศษจากภารกิจ 3 ชนิด',g:[G('dh',{cls:['spec'],n:3,lab:'พืชพิเศษต่างชนิด (ชนิด)'})],money:60000,seed:{ghostbell:2,tengu:2}},
 {id:20,d:'ตำนาน',n:'ตำนานเกษตรกร',tx:'ปลูกพืช 10 ชนิด · เก็บเกี่ยวรวม 200 ชิ้น · ขายรวมมูลค่า 100,000 เงิน',g:[G('dplant',{n:10,lab:'ปลูกพืชต่างชนิด (ชนิด)'}),G('harvest',{n:200,lab:'ผลผลิตรวม (ชิ้น)'}),G('sval',{n:100000,lab:'มูลค่าที่ขาย ($)'})],money:100000,seed:{dgold:1}}
];
const ACH=[
 {id:'a1',n:'เจ้าแห่งผัก',tx:'เก็บเกี่ยวผักครบทุกชนิด',cls:['veg'],seed:{ewind:1}},
 {id:'a2',n:'ราชาผลไม้',tx:'เก็บเกี่ยวผลไม้ทั่วไปครบทุกชนิด',cls:['fruit'],seed:{efire:1}},
 {id:'a3',n:'นักล่าของหายาก',tx:'เก็บเกี่ยวพืชหายากครบทุกชนิด',cls:['rare'],seed:{eice:1}},
 {id:'a4',n:'ผู้รวบรวมพืชวิเศษ',tx:'เก็บเกี่ยวพืชพิเศษครบทุกชนิด',cls:['spec'],seed:{ethunder:1}},
 {id:'a5',n:'ผู้รอบรู้พืชพรรณ',tx:'เก็บเกี่ยวพืชได้ 20 ชนิดขึ้นไป',cnt:20,seed:{slimeking:1}},
 {id:'a6',n:'นักเก็บเกี่ยวมือทอง',tx:'เก็บเกี่ยวผลผลิตรวม 500 ชิ้น',hv:500,seed:{kitsune:1,phoenix:1}},
 {id:'a7',n:'เศรษฐีชาวสวน',tx:'ขายผลผลิตรวมมูลค่า 300,000',sv:300000,seed:{sakura:1,bat:1}},
 {id:'a8',n:'สมุดสะสมสมบูรณ์',tx:'เก็บเกี่ยวพืชครบทุกชนิดในเกม',all:1,seed:{unicorn:1}}
];
// ---------- สถานะ ----------
const fresh=()=>({v:1,plots:Array.from({length:NPLOT},()=>({c:null,g:0,w:0,u:0,f:'',m:0})),seeds:{},prod:{},fert:{n:2,h:0,r:0},tools:{},up:{gr:0,fe:0},q:{},book:{},ach:{},st:{pl:0,hv:0,hp:0,wa:0,so:0,sv:0,ql:0,mat:0,types:{}},seen:0});
function F(){if(typeof S==='undefined'||!S)return fresh();let f=S.farm;if(!f||typeof f!=='object'){f=S.farm=fresh()}
 if(!Array.isArray(f.plots))f.plots=[];while(f.plots.length<NPLOT)f.plots.push({c:null,g:0,w:0,u:0,f:'',m:0});
 ['seeds','prod','tools','q','book','ach'].forEach(k=>{if(!f[k]||typeof f[k]!=='object')f[k]={}});
 if(!f.fert)f.fert={n:0,h:0,r:0};if(!f.up)f.up={gr:0,fe:0};if(!f.st)f.st={pl:0,hv:0,hp:0,wa:0,so:0,sv:0,ql:0,mat:0,types:{}};if(!f.st.types)f.st.types={};return f}
const CFG={buyMul:1,sellMul:1};
const now=()=>(S.day-1)*1440+S.t;
const fmM=n=>'$'+Math.round(n).toLocaleString('en-US');
const toast_=m=>{try{toast(m)}catch(e){}};
// ---------- เวลา/น้ำ/ฝน ----------
function dayHash(d){let x=(d*2654435761)>>>0;x^=x>>>13;x=Math.imul(x,1274126177)>>>0;return x}
function rainWin(day){const se=SEASON_ORDER[Math.floor((Math.max(1,day)-1)/30)%SEASON_ORDER.length];
 if(se==='rainy')return[300,1320];const h=dayHash(day)%9;if(h===0)return[13*60,17*60];return null}
function rainOverlap(a,b){if(b<=a)return 0;let tot=0;for(let d=Math.floor(a/1440);d<=Math.floor(b/1440)&&d<a/1440+60;d++){const w=rainWin(d+1);if(!w)continue;const s=Math.max(a,d*1440+w[0]),e=Math.min(b,d*1440+w[1]);if(e>s)tot+=e-s}return tot}
function raining(){try{const w=rainWin(S.day);return !!w&&S.t>=w[0]&&S.t<w[1]}catch(e){return false}}
function waterDur(){return (F().tools.can2?36:24)*60}
function rate(p){const f=F();let r=1+f.up.gr*.08+(f.tools.spade?.1:0)+(f.tools.gspade?.15:0);if(p&&p.f&&FERT[p.f])r+=FERT[p.f].sp;return r}
function total(c){return BY[c].h*60}
function upd(i){const f=F(),p=f.plots[i],n=now();if(!p.c){p.u=n;return p}
 if(n<p.u){p.u=n;return p}
 if(p.g>=total(p.c)){p.u=n;if(!p.m){p.m=1;f.st.mat++;ev('mat',{})}return p}
 const we=Math.min(n,Math.max(p.u,p.w));let cov=we-p.u;cov+=rainOverlap(we,n);
 p.g=Math.min(total(p.c),p.g+cov*rate(p));p.u=n;
 if(p.g>=total(p.c)&&!p.m){p.m=1;f.st.mat++;ev('mat',{});toast_('🌾 '+BY[p.c].n.split(' (')[0]+' โตเต็มที่แล้ว! พร้อมเก็บเกี่ยว')}
 return p}
function syncAll(){for(let i=0;i<NPLOT;i++)upd(i)}
function stage(p){if(!p.c)return -1;const k=p.g/total(p.c);return k>=1?3:k<.25?0:k<.55?1:2}
function wetLeft(p){const n=now();let w=Math.max(0,p.w-n);return w}
function isWet(p){return wetLeft(p)>0||raining()}
const STN=['เมล็ดที่เพิ่งปลูก','เริ่มงอก','กำลังเติบโต','โตเต็มที่ พร้อมเก็บเกี่ยว'];
// ---------- สกุลเงินและของ ----------
function pay(c){if(S.money<c){toast_('เงินไม่พอ ต้องใช้ '+fmM(c));return false}S.money-=c;try{S.today.eq=(S.today.eq||0)+c}catch(e){}return true}
function earn(v){S.money+=v;try{S.today.inc+=v;S.tot.earn+=v}catch(e){}}
function bookU(id){const b=F().book;if(!b[id])b[id]={u:0,h:0};b[id].u=1}
function addSeed(id,n){const f=F();f.seeds[id]=(f.seeds[id]||0)+n;bookU(id)}
function prodTotal(){const p=F().prod;let t=0;for(const k in p)t+=p[k]||0;return t}
// ---------- ภารกิจ ----------
function qs(id){const f=F();if(!f.q[id])f.q[id]={s:0,p:[]};return f.q[id]}
function gmatch(g,id){const c=BY[id];if(g.crop&&g.crop!==id)return false;if(g.cls&&g.cls.indexOf(c.cls)<0)return false;return true}
function gval(q,g,i){const p=q.p[i];switch(g.t){case 'each':{let k=0;for(const id in(p||{}))if(p[id]>=g.per)k++;return k}
  case 'dplant':case 'dh':return p?Object.keys(p).length:0;case 'inv':return prodTotal();default:return p||0}}
function qdone(q,Q){return Q.g.every((g,i)=>gval(q,g,i)>=g.n)}
function ev(t,d){const f=F();QUESTS.forEach(Q=>{const q=qs(Q.id);if(q.s!==1)return;
  Q.g.forEach((g,i)=>{if(g.t!==t)return;
   if(t==='plant'){if(gmatch(g,d.id))q.p[i]=(q.p[i]||0)+1}
   else if(t==='dplant'){if(!q.p[i])q.p[i]={};q.p[i][d.id]=1}
   else if(t==='harvest'){if(gmatch(g,d.id))q.p[i]=(q.p[i]||0)+d.n}
   else if(t==='each'){if(gmatch(g,d.id)){if(!q.p[i])q.p[i]={};q.p[i][d.id]=(q.p[i][d.id]||0)+d.n}}
   else if(t==='dh'){if(gmatch(g,d.id)){if(!q.p[i])q.p[i]={};q.p[i][d.id]=1}}
   else if(t==='sval'){q.p[i]=(q.p[i]||0)+d.v}
   else q.p[i]=(q.p[i]||0)+(d.n||1)})});
 // เหตุการณ์ที่ใช้ชนิดเดียวกันกับเป้าหมายประเภท 'each'/'dplant'/'dh'
 if(t==='plant'){QUESTS.forEach(Q=>{const q=qs(Q.id);if(q.s!==1)return;Q.g.forEach((g,i)=>{if(g.t==='dplant'){if(!q.p[i])q.p[i]={};q.p[i][d.id]=1}})})}
 if(t==='harvest'){QUESTS.forEach(Q=>{const q=qs(Q.id);if(q.s!==1)return;Q.g.forEach((g,i)=>{if(g.t==='each'&&gmatch(g,d.id)){if(!q.p[i])q.p[i]={};q.p[i][d.id]=(q.p[i][d.id]||0)+d.n}if(g.t==='dh'&&gmatch(g,d.id)){if(!q.p[i])q.p[i]={};q.p[i][d.id]=1}})})}
 chkQ()}
// (ตัดเงื่อนไขซ้ำ: ev ด้านบนเรียกเฉพาะ t เดียวกัน ส่วนประเภทย่อยจัดการด้านล่าง)
function chkQ(){let ch=0;QUESTS.forEach(Q=>{const q=qs(Q.id);if(q.s===1&&qdone(q,Q)){q.s=2;ch=1;toast_('✅ ภารกิจเกษตร: '+Q.n+' สำเร็จแล้ว! ไปรับรางวัลที่กระดานภารกิจ')}});chkAch();try{save(1)}catch(e){}return ch}
function chkAch(){const f=F();ACH.forEach(a=>{if(f.ach[a.id])return;let ok=false;const hv=id=>f.book[id]&&f.book[id].h>0;
  if(a.cls)ok=CROPS.filter(c=>a.cls.indexOf(c.cls)>=0).every(c=>hv(c.id));
  else if(a.cnt)ok=CROPS.filter(c=>hv(c.id)).length>=a.cnt;
  else if(a.hv)ok=f.st.hv>=a.hv;else if(a.sv)ok=f.st.sv>=a.sv;else if(a.all)ok=CROPS.every(c=>hv(c.id));
  if(ok){f.ach[a.id]=1;for(const k in a.seed)addSeed(k,a.seed[k]);toast_('🏅 Achievement: '+a.n+' · ได้รับเมล็ดพันธุ์พิเศษ '+Object.keys(a.seed).map(k=>BY[k].n.split(' (')[0]).join(', '));sfx('claim')}})}
function qAccept(id){const q=qs(id);if(q.s!==0)return;q.s=1;q.p=[];chkQ();render()}
function qClaim(id){const Q=QUESTS.find(x=>x.id===id),q=qs(id);if(q.s!==2)return;q.s=3;
 earn(Q.money);const got=[fmM(Q.money)];
 if(Q.fert)for(const k in Q.fert){F().fert[k]=(F().fert[k]||0)+Q.fert[k];got.push(FERT[k].n+' ×'+Q.fert[k])}
 if(Q.seed)for(const k in Q.seed){addSeed(k,Q.seed[k]);got.push('เมล็ด '+BY[k].n.split(' (')[0]+' ×'+Q.seed[k])}
 if(Q.tool)for(const k in Q.tool){F().tools[k]=1;got.push(TOOLS[k].n)}
 log('🌾 ภารกิจเกษตร "'+Q.n+'" รับรางวัล: '+got.join(' · '));toast_('🎁 รับรางวัล: '+got.join(' · '));sfx('claim');chkAch();try{save(1)}catch(e){}render()}
// ---------- การกระทำกับแปลง ----------
let fxCb=null;
function plant(i,id){const f=F(),p=upd(i);if(p.c){return false}if(!(f.seeds[id]>0)){toast_('ไม่มีเมล็ดพันธุ์ชนิดนี้ในกระเป๋า');return false}
 f.seeds[id]--;if(!f.seeds[id])delete f.seeds[id];
 f.plots[i]={c:id,g:0,w:0,u:now(),f:'',m:0};f.st.pl++;f.st.types[id]=1;bookU(id);ev('plant',{id});ev('dplant',{id});sfx('plant');if(fxCb)fxCb('plant',i);try{save(1)}catch(e){}return true}
function water(i){const f=F(),p=upd(i);if(!p.c){toast_('แปลงนี้ยังไม่มีพืช');return false}if(p.g>=total(p.c)){toast_('พืชโตเต็มที่แล้ว ไม่ต้องรดน้ำ');return false}
 p.w=now()+waterDur();f.st.wa++;ev('water',{n:1});sfx('water');if(fxCb)fxCb('water',i);try{save(1)}catch(e){}return true}
function fertilize(i,k){const f=F(),p=upd(i);if(!p.c||p.g>=total(p.c)){toast_('ใส่ปุ๋ยได้เฉพาะพืชที่ยังโตไม่เต็มที่');return false}if(p.f){toast_('แปลงนี้ใส่ปุ๋ยไปแล้ว');return false}
 if(!(f.fert[k]>0)){toast_('ไม่มี'+FERT[k].n);return false}f.fert[k]--;p.f=k;sfx('fert');if(fxCb)fxCb('fert',i);try{save(1)}catch(e){}return true}
function harvest(i){const f=F(),p=upd(i);if(!p.c||p.g<total(p.c)){return false}
 const id=p.c,c=BY[id];let n=c.y,bonus=0;
 const ch=(p.f?FERT[p.f].ch+f.up.fe*.06:0)+(f.tools.basket?.1:0)+(f.tools.gspade?.1:0);
 if(Math.random()<ch){bonus=1;n++}
 f.prod[id]=(f.prod[id]||0)+n;f.st.hv+=n;f.st.hp++;f.st.ql+=bonus;
 const b=f.book[id]||(f.book[id]={u:1,h:0});b.u=1;b.h+=n;
 f.plots[i]={c:null,g:0,w:0,u:now(),f:'',m:0};
 ev('harvest',{id,n});ev('hp',{n:1});if(bonus)ev('qual',{n:bonus});
 sfx('harvest');if(fxCb)fxCb('harvest',i,{id,n,bonus});chkQ();return {id,n,bonus}}
// ---------- ตลาด ----------
const sellP=id=>Math.round(BY[id].sell*CFG.sellMul),buyP=id=>Math.round(BY[id].buy*CFG.buyMul);
function buySeed(id,n){const c=BY[id];if(!c||!c.buy){return false}const cost=buyP(id)*n;if(!pay(cost))return false;addSeed(id,n);sfx('coin');toast_('ซื้อเมล็ด '+c.n.split(' (')[0]+' ×'+n+' · '+fmM(cost));try{save(1)}catch(e){};return true}
function buyFert(k,n){const cost=FERT[k].buy*n;if(!FERT[k].buy)return false;if(!pay(cost))return false;F().fert[k]=(F().fert[k]||0)+n;sfx('coin');toast_('ซื้อ'+FERT[k].n+' ×'+n);try{save(1)}catch(e){};return true}
function buyTool(k){const t=TOOLS[k];if(!t.buy||F().tools[k])return false;if(!pay(t.buy))return false;F().tools[k]=1;sfx('coin');toast_('ซื้อ '+t.n+' แล้ว');try{save(1)}catch(e){};return true}
function buyUp(k){const f=F(),u=UPG[k],lv=f.up[k];if(lv>=u.cost.length){return false}if(!pay(u.cost[lv]))return false;f.up[k]++;sfx('coin');toast_('อัปเกรด '+u.n+' เป็นเลเวล '+f.up[k]);try{save(1)}catch(e){};return true}
function sell(id,n){const f=F(),have=f.prod[id]||0;n=Math.min(n,have);if(n<=0)return 0;const v=sellP(id)*n;f.prod[id]-=n;if(!f.prod[id])delete f.prod[id];
 earn(v);f.st.so+=n;f.st.sv+=v;ev('sell',{n});ev('sval',{v});sfx('coin');chkQ();return v}
function sellAll(cls){const f=F();let tot=0,pcs=0;for(const id of Object.keys(f.prod)){if(cls&&BY[id].cls!==cls)continue;const n=f.prod[id];tot+=sell(id,n);pcs+=n}return [tot,pcs]}
// ---------- เสียง ----------
let AC=null;
function tone(f,d,tp,v,t0){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();o.type=tp||'square';o.frequency.value=f;g.gain.value=0;o.connect(g);g.connect(AC.destination);const t=AC.currentTime+(t0||0);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v||.05,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.start(t);o.stop(t+d+.02)}catch(e){}}
function noise(d,v){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const n=AC.sampleRate*d,b=AC.createBuffer(1,n,AC.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*(1-i/n);const s=AC.createBufferSource(),g=AC.createGain(),fl=AC.createBiquadFilter();fl.type='highpass';fl.frequency.value=1800;g.gain.value=v||.05;s.buffer=b;s.connect(fl);fl.connect(g);g.connect(AC.destination);s.start()}catch(e){}}
function sfx(k){if(k==='plant'){tone(180,.12,'triangle',.07);tone(140,.12,'triangle',.06,.08)}else if(k==='water'){noise(.5,.05)}else if(k==='harvest'){[523,659,784,1047].forEach((f,i)=>tone(f,.14,'square',.04,i*.07))}else if(k==='coin'){tone(988,.08,'square',.04);tone(1319,.18,'square',.04,.07)}else if(k==='claim'){[659,784,988,1319].forEach((f,i)=>tone(f,.16,'triangle',.06,i*.09))}else if(k==='fert'){tone(330,.1,'sine',.06);tone(440,.15,'sine',.06,.08)}else if(k==='ui'){tone(660,.05,'square',.03)}}
// ---------- สไปรต์ ----------
const IMG={};let ready=false,vegC={};
function load(src){const i=new Image();i.src=src;return i}
const px=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
function blob(g,cx,cy,rx,ry,fill,line){for(let y=Math.floor(cy-ry-1);y<=cy+ry+1;y++)for(let x=Math.floor(cx-rx-1);x<=cx+rx+1;x++){const d=((x+.5-cx)/rx)**2+((y+.5-cy)/ry)**2;if(d<=1){g.fillStyle=d>.62?line:fill;g.fillRect(x,y,1,1)}}}
function mound(g){blob(g,16,24,13,4,'#6b4226','#2a1708');px(g,8,23,2,1,'#8a5a34');px(g,20,24,3,1,'#8a5a34');px(g,14,26,2,1,'#52321b')}
function line(g,x0,y0,x1,y1,c){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let i=0;i<=n;i++){g.fillStyle=c;g.fillRect(Math.round(x0+(x1-x0)*i/n),Math.round(y0+(y1-y0)*i/n),1,1)}}
function leaf(g,cx,cy,rx,ry,c1,c2){blob(g,cx,cy,rx,ry,c1,c2||'#1d5a22')}
function drawVeg(id,st){const cv=document.createElement('canvas');cv.width=32;cv.height=28;const g=cv.getContext('2d');mound(g);
 const G1='#4fb83c',G2='#6fd04a';
 if(st===0){px(g,13,22,2,1,'#f4e8c0');px(g,17,23,2,1,'#f4e8c0')}
 else if(st===1){line(g,16,23,16,18,'#3a8a2c');leaf(g,14,18,2.6,1.5,G1);leaf(g,18,17,2.6,1.5,G2)}
 else{
  if(id==='carrot'){for(let k=-3;k<=3;k++){line(g,16,22,16+k*2,10+Math.abs(k),'#3a9a30');leaf(g,16+k*2,10+Math.abs(k),1.4,2.2,G1)}if(st===3){blob(g,16,22,3.2,2,'#ff8a1e','#9a3d08')}}
  else if(id==='tomato'){line(g,16,23,16,10,'#3a8a2c');[[12,17],[20,16],[11,12],[21,11],[16,8]].forEach(a=>leaf(g,a[0],a[1],3,1.8,G1));[[13,19],[19,13],[17,18]].forEach((a,i)=>{if(st===3)blob(g,a[0],a[1],2.2,2.2,'#ee3a2a','#8a1008');else blob(g,a[0],a[1],1.4,1.4,'#6fd04a','#2a6a22')})}
  else if(id==='potato'){[[10,19],[22,19],[13,13],[19,13],[16,10],[16,17]].forEach(a=>leaf(g,a[0],a[1],3.2,2.2,'#4aa83a'));if(st===3){px(g,8,15,2,2,'#d8a0ff');px(g,22,14,2,2,'#d8a0ff');blob(g,11,24,2.6,1.8,'#d8b070','#7a5a20');blob(g,21,24,2.6,1.8,'#d8b070','#7a5a20')}}
  else if(id==='cabbage'){if(st===3){blob(g,16,17,8,6,'#a8e070','#2a6a22');blob(g,16,17,5,3.6,'#c8f090','#4a9a40');px(g,15,14,2,6,'#e8ffc0')}else{[[10,19],[22,19],[14,14],[18,14],[16,17]].forEach(a=>leaf(g,a[0],a[1],4,2.6,'#6fc84a'))}}
  else if(id==='corn'){line(g,16,24,16,4,'#3a8a2c');line(g,17,24,17,4,'#3a8a2c');[[11,17,0],[21,15,1],[10,10,0],[22,9,1]].forEach(a=>{leaf(g,a[0],a[1],4.5,1.4,G1)});if(st===3){blob(g,13,13,2,3.4,'#ffd84a','#8a6a08');blob(g,19,11,2,3.4,'#ffd84a','#8a6a08');px(g,12,14,1,3,'#4a9a30')}}
  else if(id==='pumpkin'){[[9,20],[23,20],[16,17]].forEach(a=>leaf(g,a[0],a[1],4.4,3,'#4aa83a'));line(g,16,24,6,16,'#3a8a2c');line(g,16,24,26,15,'#3a8a2c');if(st===3){blob(g,16,19,7,5,'#ff9a1e','#9a4a08');line(g,13,15,13,23,'#c86a0e');line(g,19,15,19,23,'#c86a0e');px(g,15,13,2,3,'#4a8a2c')}}
 }
 const o=document.createElement('canvas');o.width=128;o.height=112;const og=o.getContext('2d');og.imageSmoothingEnabled=false;og.drawImage(cv,0,0,128,112);return o}
function drawVegIcon(id){const cv=document.createElement('canvas');cv.width=32;cv.height=32;const g=cv.getContext('2d');px(g,1,1,30,30,'#2a1c0e');px(g,2,2,28,28,'#f6d8a8');px(g,3,3,26,1,'#fff0cc');
 if(id==='carrot'){for(let i=0;i<14;i++)blob(g,9+i*1.15,24-i*1.15,Math.max(1.2,3.6-i*.22),Math.max(1.2,3.6-i*.22),'#ff8a1e','#9a3d08');leaf(g,22,8,2,3.4,'#4fb83c');leaf(g,26,10,3.4,2,'#4fb83c');leaf(g,19,6,1.8,3,'#6fd04a')}
 else if(id==='tomato'){blob(g,16,18,9,8,'#ee3a2a','#8a1008');px(g,10,14,4,2,'#ff9a8a');leaf(g,16,9,4.4,2,'#4fb83c');px(g,15,7,2,3,'#2a6a22')}
 else if(id==='potato'){blob(g,16,17,10,7,'#d8b070','#7a5a20');px(g,11,15,2,1,'#8a6a30');px(g,19,19,2,1,'#8a6a30');px(g,15,13,2,1,'#8a6a30')}
 else if(id==='cabbage'){blob(g,16,17,10,9,'#a8e070','#2a6a22');blob(g,16,17,6,5.4,'#c8f090','#4a9a40');px(g,15,10,2,14,'#e8ffc0')}
 else if(id==='corn'){blob(g,16,16,5,10,'#ffd84a','#8a6a08');for(let r=0;r<5;r++)for(let c=0;c<3;c++)px(g,13+c*2,9+r*3,1,2,'#c8a008');leaf(g,10,18,2.4,8,'#4fb83c');leaf(g,22,18,2.4,8,'#4fb83c')}
 else if(id==='pumpkin'){blob(g,16,19,11,8,'#ff9a1e','#9a4a08');line(g,12,12,12,26,'#c86a0e');line(g,20,12,20,26,'#c86a0e');px(g,15,9,2,4,'#4a8a2c')}
 const o=document.createElement('canvas');o.width=64;o.height=64;const og=o.getContext('2d');og.imageSmoothingEnabled=false;og.drawImage(cv,0,0,64,64);return o}
function init(){if(ready)return true;const A=window.FARM_ASSETS;if(!A)return false;
 for(const id in A.crops){const a=A.crops[id];IMG[id]={i:a.i,s:a.s.map(load),z:a.z}}
 CROPS.filter(c=>c.cls==='veg').forEach(c=>{const s=[0,1,2,3].map(k=>drawVeg(c.id,k));IMG[c.id]={i:drawVegIcon(c.id).toDataURL(),s,z:s.map(x=>[x.width,x.height])}});
 IMG.farmer={};for(const d in A.farmer)IMG.farmer[d]=A.farmer[d].map(a=>{const i=load(a[0]);i.w=a[1];i.h=a[2];return i});
 IMG.portrait=A.portrait;IMG.bg=load(A.bg);ready=true;return true}
const icon=id=>{init();return IMG[id]?IMG[id].i:''};
function spr(id,s){init();const a=IMG[id];return a?a.s[s]:null}
// ---------- UI ----------
let lockFn=null,openCb=null,mode=null,arg=null,tick=null;
function css(){if(document.getElementById('fmCss'))return;const c=document.createElement('style');c.id='fmCss';c.textContent=
'#fmx{position:fixed;inset:0;z-index:99993;background:rgba(10,18,8,.72);display:flex;align-items:center;justify-content:center;padding:8px;font-family:inherit}#fmx[hidden]{display:none}'+
'#fmx .fmP{width:min(640px,100%);max-height:calc(100dvh - 16px);display:flex;flex-direction:column;background:linear-gradient(180deg,#3a2a18,#241a0e);border:3px solid #c9a24a;border-radius:12px;box-shadow:0 0 0 2px #5a3d1a inset,0 14px 50px rgba(0,0,0,.65);color:#f3ead2}'+
'#fmx .fmH{display:flex;align-items:center;gap:8px;padding:9px 12px;background:linear-gradient(180deg,#4f7a2a,#33541c);border-bottom:2px solid #c9a24a;border-radius:8px 8px 0 0;font-weight:800;font-size:16px}#fmx .fmH span{flex:1}'+
'#fmx .fmB{overflow:auto;padding:10px 12px;flex:1}#fmx .fmT{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px}'+
'#fmx button{font:inherit;cursor:pointer;min-height:38px;padding:6px 12px;border-radius:8px;border:2px solid #7a5a2a;background:#5a4222;color:#fff;font-weight:700;font-size:14px}#fmx button:hover:not(:disabled){background:#7a5a2c}#fmx button:disabled{opacity:.4;cursor:not-allowed}'+
'#fmx button.on{background:#5a8a2a;border-color:#a8d860}#fmx button.gold{background:linear-gradient(180deg,#ffd45a,#d99e22);color:#2a1c06;border-color:#fff0a8}#fmx button.x{min-height:32px;padding:4px 10px}'+
'#fmx .row{display:flex;align-items:center;gap:8px;padding:6px;border-bottom:1px dashed #5a4426}#fmx .row img{width:44px;height:44px;object-fit:contain;image-rendering:pixelated;flex:none}#fmx .row .nm{flex:1;min-width:0;font-size:14px;line-height:1.35}#fmx .row small{color:#cbb98e;display:block;font-size:12px}'+
'#fmx .bar{height:10px;background:#1a1208;border:1px solid #6a4a1a;border-radius:6px;overflow:hidden;margin:3px 0}#fmx .bar i{display:block;height:100%;background:linear-gradient(90deg,#6fd04a,#c8f060)}#fmx .bar.w i{background:linear-gradient(90deg,#3a9ae8,#8ad4ff)}'+
'#fmx .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:8px}#fmx .card{background:#2e2112;border:2px solid #6a4a1a;border-radius:10px;padding:6px;text-align:center;font-size:12px;line-height:1.35}#fmx .card img{width:56px;height:56px;object-fit:contain;image-rendering:pixelated}#fmx .card.lock img{filter:brightness(0) opacity(.5)}#fmx .card b{display:block;font-size:13px}'+
'#fmx .tag{display:inline-block;padding:1px 6px;border-radius:6px;font-size:11px;font-weight:800;background:#445;color:#fff}#fmx .t0{background:#2a7a3a}#fmx .t1{background:#3a6ac8}#fmx .t2{background:#c88a1a}#fmx .t3{background:#7a7a7a}#fmx .tq{background:#a83a8a}'+
'#fmx .qty{display:inline-flex;gap:4px;align-items:center}#fmx .tx{font-size:13px;line-height:1.55;margin:6px 0}#fmx .money{color:#ffe08a;font-weight:800}'+
'#fmHud{position:fixed;left:8px;top:112px;z-index:9000;display:flex;flex-direction:column;gap:6px}#fmHud[hidden]{display:none}#fmHud button{width:48px;height:48px;border-radius:12px;border:2px solid #c9a24a;background:linear-gradient(180deg,#5a8a2a,#33541c);color:#fff;font-size:22px;cursor:pointer;padding:0;box-shadow:0 3px 8px rgba(0,0,0,.4)}#fmHud small{display:block;font-size:9px;line-height:1}'+
'@media(max-width:560px){#fmx .fmH{font-size:14px}#fmx .grid{grid-template-columns:repeat(auto-fill,minmax(96px,1fr))}}';
 document.head.appendChild(c)}
function root(){css();let m=document.getElementById('fmx');if(!m){m=document.createElement('div');m.id='fmx';m.hidden=true;document.body.appendChild(m);m.addEventListener('click',e=>{if(e.target===m)closeUI()})}return m}
function isOpen(){const m=document.getElementById('fmx');return !!m&&!m.hidden}
function closeUI(){const m=document.getElementById('fmx');if(m)m.hidden=true;mode=null;arg=null;clearInterval(tick);if(lockFn)lockFn(false);try{save(1)}catch(e){}}
function openUI(md,a){init();root();mode=md;arg=a;if(lockFn)lockFn(true);document.getElementById('fmx').hidden=false;render();clearInterval(tick);tick=setInterval(()=>{if(mode==='plot')render()},1000)}
addEventListener('keydown',e=>{if(isOpen()&&e.key==='Escape'){e.stopPropagation();e.preventDefault();if(mode==='plot'||mode==='bag'||mode==='book'||mode==='quest'||mode==='market'||mode==='farmer')closeUI()}},true);
const nm=id=>BY[id].n;const sn=id=>BY[id].n.split(' (')[0];
const img=id=>'<img alt="" src="'+icon(id)+'">';
const hdr=(t)=>'<div class="fmH"><span>'+t+'</span><button class="x" onclick="FARM.close()">ปิด ✕</button></div>';
function bag(){const f=F();const sd=Object.keys(f.seeds).filter(k=>f.seeds[k]>0),pr=Object.keys(f.prod).filter(k=>f.prod[k]>0);
 let h='<div class="fmP">'+hdr('🧺 กระเป๋าฟาร์ม')+'<div class="fmB"><div class="tx">เงินสด <span class="money">'+fmM(S.money)+'</span></div>';
 h+='<b>🌱 เมล็ดพันธุ์</b>'+(sd.length?sd.sort((a,b)=>CLSO.indexOf(BY[a].cls)-CLSO.indexOf(BY[b].cls)).map(k=>'<div class="row">'+img(k)+'<div class="nm">'+sn(k)+'<small>'+CLS[BY[k].cls]+' · โต '+BY[k].h+' ชม.เกม</small></div><b>×'+f.seeds[k]+'</b></div>').join(''):'<div class="tx">ยังไม่มีเมล็ดพันธุ์ · ซื้อได้ที่ตลาด (คุยกับลุงสมศักดิ์)</div>');
 h+='<br><b>🧺 ผลผลิต ('+prodTotal()+' ชิ้น)</b>'+(pr.length?pr.sort((a,b)=>CLSO.indexOf(BY[a].cls)-CLSO.indexOf(BY[b].cls)).map(k=>'<div class="row">'+img(k)+'<div class="nm">'+sn(k)+'<small>ขายได้ '+fmM(sellP(k))+' / ชิ้น</small></div><b>×'+f.prod[k]+'</b></div>').join(''):'<div class="tx">ยังไม่มีผลผลิต</div>');
 h+='<br><b>🧪 ปุ๋ยและอุปกรณ์</b>'+Object.keys(FERT).map(k=>'<div class="row"><div style="font-size:30px;width:44px;text-align:center">'+FERT[k].ic+'</div><div class="nm">'+FERT[k].n+'<small>โตเร็ว +'+Math.round(FERT[k].sp*100)+'% · โอกาสโบนัส '+Math.round(FERT[k].ch*100)+'%</small></div><b>×'+(f.fert[k]||0)+'</b></div>').join('')+
  Object.keys(TOOLS).filter(k=>f.tools[k]).map(k=>'<div class="row"><div style="font-size:30px;width:44px;text-align:center">'+TOOLS[k].ic+'</div><div class="nm">'+TOOLS[k].n+'<small>'+TOOLS[k].d+'</small></div><b>✔</b></div>').join('');
 return h+'</div></div>'}
function book(){const f=F();const cat=arg&&arg.cat||'veg';
 const hv=id=>f.book[id]&&f.book[id].h>0,un=id=>f.book[id]&&f.book[id].u;
 const got=CROPS.filter(c=>hv(c.id)).length;
 let h='<div class="fmP">'+hdr('📖 สมุดสะสมพืช ('+got+'/'+CROPS.length+')')+'<div class="fmB"><div class="fmT">'+CLSO.map(k=>'<button class="'+(k===cat?'on':'')+'" onclick="FARM.bookCat(\''+k+'\')">'+CLSI[k]+' '+CLS[k]+' '+CROPS.filter(c=>c.cls===k&&hv(c.id)).length+'/'+CROPS.filter(c=>c.cls===k).length+'</button>').join('')+'</div><div class="grid">';
 CROPS.filter(c=>c.cls===cat).forEach(c=>{const u=un(c.id),hh=hv(c.id);h+='<div class="card '+(u?'':'lock')+'">'+img(c.id)+'<b>'+(u?sn(c.id):'???')+'</b>'+(u?'<span class="tag '+(hh?'t0':'t1')+'">'+(hh?'เก็บเกี่ยวแล้ว':'ปลดล็อกแล้ว')+'</span><br>ขาย '+fmM(c.sell)+'<br>โต '+c.h+' ชม.เกม<br>เก็บเกี่ยว '+(f.book[c.id]?f.book[c.id].h:0)+' ชิ้น':'<span class="tag">ล็อก</span><br>'+(c.buy?'ซื้อเมล็ดที่ตลาดเพื่อปลดล็อก':'ได้จากภารกิจ/Achievement เท่านั้น'))+'</div>'});
 h+='</div><br><b>🏅 Achievement</b>'+ACH.map(a=>'<div class="row"><div style="font-size:26px;width:44px;text-align:center">'+(f.ach[a.id]?'🏅':'🔒')+'</div><div class="nm">'+a.n+'<small>'+a.tx+' · รางวัล: เมล็ด '+Object.keys(a.seed).map(k=>sn(k)).join(', ')+'</small></div></div>').join('');
 return h+'</div></div>'}
function questView(){const f=F();
 let h='<div class="fmP">'+hdr('📋 กระดานภารกิจเกษตร')+'<div class="fmB"><div class="tx">ภารกิจเสริมทั้งหมด 20 ข้อ · ไม่ล็อกเนื้อเรื่องหลักหรือระบบบริษัท · ทำเมื่อไหร่ก็ได้ · เสร็จแล้วต้องกดรับรางวัลเอง</div>';
 const S_=['พร้อมรับ','กำลังทำ','สำเร็จ · รอรับรางวัล','รับรางวัลแล้ว'],C_=['t0','t1','t2','t3'];
 QUESTS.forEach(Q=>{const q=qs(Q.id);
  const rw=[fmM(Q.money)].concat(Q.fert?Object.keys(Q.fert).map(k=>FERT[k].n+' ×'+Q.fert[k]):[]).concat(Q.seed?Object.keys(Q.seed).map(k=>'เมล็ด'+sn(k)+' ×'+Q.seed[k]):[]).concat(Q.tool?Object.keys(Q.tool).map(k=>TOOLS[k].n):[]);
  h+='<div class="row" style="align-items:flex-start;flex-wrap:wrap"><div class="nm"><b>#'+String(Q.id).padStart(2,'0')+' '+Q.n+'</b> <span class="tag '+C_[q.s]+'">'+S_[q.s]+'</span> <span class="tag">'+Q.d+'</span><small>'+Q.tx+'</small>'+
   Q.g.map((g,i)=>{const v=Math.min(g.n,gval(q,g,i)),pc=q.s===0?0:Math.round(v/g.n*100);return '<small>'+g.lab+': '+(q.s===0?'-':v.toLocaleString('en-US'))+' / '+g.n.toLocaleString('en-US')+'</small><div class="bar"><i style="width:'+(q.s>=2?100:pc)+'%"></i></div>'}).join('')+
   '<small>🎁 '+rw.join(' · ')+'</small></div>'+
   (q.s===0?'<button class="gold" onclick="FARM.qAccept('+Q.id+')">รับภารกิจ</button>':q.s===2?'<button class="gold" onclick="FARM.qClaim('+Q.id+')">🎁 รับรางวัล</button>':'')+'</div>'});
 return h+'</div></div>'}
function market(){const f=F();const tab=arg&&arg.tab||'shop',sub=arg&&arg.sub||'veg',qn=arg&&arg.qn||1;
 let h='<div class="fmP">'+hdr('🏪 ตลาดเกษตร')+'<div class="fmB"><div class="tx">เงินสด <span class="money">'+fmM(S.money)+'</span></div><div class="fmT"><button class="'+(tab==='shop'?'on':'')+'" onclick="FARM.mk({tab:\'shop\'})">🛒 ร้านค้า</button><button class="'+(tab==='sell'?'on':'')+'" onclick="FARM.mk({tab:\'sell\'})">💰 ตลาดรับซื้อ</button><button class="'+(tab==='up'?'on':'')+'" onclick="FARM.mk({tab:\'up\'})">⬆️ อัปเกรดสวน</button></div>';
 if(tab==='shop'){
  h+='<div class="fmT"><span class="tx">จำนวนที่ซื้อ:</span>'+[1,5,10].map(n=>'<button class="'+(qn===n?'on':'')+'" onclick="FARM.mk({tab:\'shop\',sub:\''+sub+'\',qn:'+n+'})">×'+n+'</button>').join('')+'</div>';
  h+='<div class="fmT">'+[['veg','🥕 เมล็ดผัก'],['fruit','🍎 เมล็ดผลไม้'],['rare','🐉 เมล็ดหายาก'],['fert','🧪 ปุ๋ย'],['tool','⛏️ อุปกรณ์']].map(a=>'<button class="'+(sub===a[0]?'on':'')+'" onclick="FARM.mk({tab:\'shop\',sub:\''+a[0]+'\',qn:'+qn+'})">'+a[1]+'</button>').join('')+'</div>';
  if(CLSO.indexOf(sub)>=0)h+=CROPS.filter(c=>c.cls===sub).map(c=>'<div class="row">'+img(c.id)+'<div class="nm">'+sn(c.id)+'<small>เมล็ด '+fmM(buyP(c.id))+' · โต '+c.h+' ชม.เกม · ขาย '+fmM(sellP(c.id))+' · ได้ '+c.y+'+ ชิ้น · มีอยู่ '+(f.seeds[c.id]||0)+'</small></div><button onclick="FARM.buy(\''+c.id+'\','+qn+')">'+fmM(buyP(c.id)*qn)+'</button></div>').join('');
  else if(sub==='fert')h+=['n','h'].map(k=>'<div class="row"><div style="font-size:30px;width:44px;text-align:center">'+FERT[k].ic+'</div><div class="nm">'+FERT[k].n+'<small>โตเร็ว +'+Math.round(FERT[k].sp*100)+'% · โอกาสโบนัส '+Math.round(FERT[k].ch*100)+'% · มีอยู่ '+(f.fert[k]||0)+'</small></div><button onclick="FARM.buyF(\''+k+'\','+qn+')">'+fmM(FERT[k].buy*qn)+'</button></div>').join('')+'<div class="tx">🌟 ปุ๋ยหายากไม่มีขายในร้าน ได้จากภารกิจเท่านั้น</div>';
  else h+=['can2','basket','spade'].map(k=>'<div class="row"><div style="font-size:30px;width:44px;text-align:center">'+TOOLS[k].ic+'</div><div class="nm">'+TOOLS[k].n+'<small>'+TOOLS[k].d+'</small></div>'+(f.tools[k]?'<b>✔ มีแล้ว</b>':'<button onclick="FARM.buyT(\''+k+'\')">'+fmM(TOOLS[k].buy)+'</button>')+'</div>').join('');
 }else if(tab==='sell'){
  const ids=Object.keys(f.prod).filter(k=>f.prod[k]>0);let all=0;ids.forEach(k=>all+=sellP(k)*f.prod[k]);
  h+=ids.length?ids.sort((a,b)=>CLSO.indexOf(BY[a].cls)-CLSO.indexOf(BY[b].cls)).map(k=>'<div class="row">'+img(k)+'<div class="nm">'+sn(k)+' <span class="tag">'+CLS[BY[k].cls]+'</span><small>มี '+f.prod[k]+' ชิ้น · ราคา '+fmM(sellP(k))+' / ชิ้น · รวม '+fmM(sellP(k)*f.prod[k])+'</small></div><button onclick="FARM.sell(\''+k+'\',1)">ขาย 1</button><button class="gold" onclick="FARM.ask(\''+k+'\')">ขายทั้งหมด</button></div>').join('')+'<div class="row" style="border:0"><div class="nm"><b>ผลผลิตทั้งหมดในกระเป๋า: '+prodTotal()+' ชิ้น · มูลค่า '+fmM(all)+'</b></div><button class="gold" onclick="FARM.ask(\'*\')">💰 ขายทุกอย่าง</button></div>':'<div class="tx">ยังไม่มีผลผลิตให้ขาย · ไปเก็บเกี่ยวที่แปลงก่อนนะ</div>';
  if(arg&&arg.cf!=null){const k=arg.cf,all1=k==='*'?all:sellP(k)*(f.prod[k]||0),pc=k==='*'?prodTotal():(f.prod[k]||0);
   h+='<div class="row" style="background:#4a2a12;border:2px solid #ffd45a;border-radius:10px;margin-top:8px"><div class="nm"><b>⚠️ ยืนยันการขาย</b><small>ขาย '+(k==='*'?'ผลผลิตทั้งหมด':sn(k)+' ทั้งหมด')+' '+pc+' ชิ้น รวมได้ '+fmM(all1)+' ?</small></div><button class="gold" onclick="FARM.confirmSell()">ยืนยัน</button><button onclick="FARM.mk({cf:null})">ยกเลิก</button></div>'}
 }else{
  h+=Object.keys(UPG).map(k=>{const u=UPG[k],lv=f.up[k];return '<div class="row"><div style="font-size:30px;width:44px;text-align:center">'+u.ic+'</div><div class="nm">'+u.n+' · เลเวล '+lv+'/'+u.cost.length+'<small>'+u.d+'</small></div>'+(lv>=u.cost.length?'<b>MAX</b>':'<button onclick="FARM.buyU(\''+k+'\')">'+fmM(u.cost[lv])+'</button>')+'</div>'}).join('')+'<div class="tx">🚧 แผนในอนาคต: ขยายแปลงปลูกเพิ่ม 12 แปลง · โรงเรือน · พื้นที่ปลูกพืชพิเศษ (ยังไม่เปิดใช้)</div>';
 }
 return h+'</div></div>'}
function farmerMenu(){return '<div class="fmP">'+hdr('👨‍🌾 ลุงสมศักดิ์ · เจ้าของไร่')+'<div class="fmB"><div style="display:flex;gap:12px;align-items:flex-start"><img alt="" src="'+IMG.portrait+'" style="width:86px;height:auto;border-radius:8px;flex:none"><div class="tx">“'+(arg&&arg.say||'ยินดีต้อนรับสู่ไร่ MY COMPANY ครับท่าน CEO! จะปลูกอะไร ขายอะไร ก็เลือกได้เลย ไม่ต้องรีบ ไร่นี้เป็นกิจกรรมเสริม เนื้อเรื่องหลักไม่เกี่ยวกัน')+'”</div></div><div class="fmT" style="margin-top:8px"><button onclick="FARM.open(\'market\',{tab:\'shop\'})">🏪 ตลาด / ซื้อเมล็ดพันธุ์</button><button onclick="FARM.open(\'market\',{tab:\'sell\'})">💰 ขายผลผลิต</button><button onclick="FARM.open(\'quest\')">📋 กระดานภารกิจ</button><button onclick="FARM.open(\'book\')">📖 สมุดสะสมพืช</button><button onclick="FARM.open(\'bag\')">🧺 กระเป๋าฟาร์ม</button><button onclick="FARM.tips()">💡 ขอคำแนะนำ</button></div></div></div>'}
function plotView(){const i=arg.i,f=F(),p=upd(i),sel=arg.sel;
 let h='<div class="fmP">'+hdr('🌱 แปลงที่ '+(i+1))+'<div class="fmB">';
 if(!p.c){
  const sd=Object.keys(f.seeds).filter(k=>f.seeds[k]>0).sort((a,b)=>CLSO.indexOf(BY[a].cls)-CLSO.indexOf(BY[b].cls));
  h+='<div class="tx">แปลงว่างเปล่า · เลือกเมล็ดพันธุ์จากกระเป๋าเพื่อปลูก '+(raining()?'· 🌧️ ฝนตกอยู่ พืชจะได้น้ำเอง':'')+'</div>'+(sd.length?sd.map(k=>'<div class="row">'+img(k)+'<div class="nm">'+sn(k)+' <span class="tag">'+CLS[BY[k].cls]+'</span><small>โต '+BY[k].h+' ชม.เกม · ขาย '+fmM(sellP(k))+' · มี '+f.seeds[k]+' เมล็ด</small></div><button class="gold" onclick="FARM.doPlant('+i+',\''+k+'\')">🌱 ปลูก</button></div>').join(''):'<div class="tx">ไม่มีเมล็ดพันธุ์ในกระเป๋า · ไปซื้อที่ตลาด (คุยกับลุงสมศักดิ์) ห้ามปลูกถ้าไม่มีเมล็ด</div>');
 }else{
  const c=BY[p.c],st=stage(p),tot=total(p.c),pct=Math.min(100,Math.floor(p.g/tot*100)),leftMin=Math.max(0,(tot-p.g)/rate(p)),wl=wetLeft(p),wet=isWet(p);
  h+='<div class="row">'+img(p.c)+'<div class="nm"><b>'+sn(p.c)+'</b> <span class="tag t'+(st>=3?0:1)+'">'+STN[st]+'</span><small>ระยะ '+(st+1)+'/4 · เติบโต '+pct+'%'+(st<3?' · เหลือประมาณ '+fmHM(leftMin)+' เวลาเกม (ถ้ามีน้ำตลอด)':'')+'</small><div class="bar"><i style="width:'+pct+'%"></i></div>'+
   '<small>💧 น้ำ: '+(raining()?'ฝนตก พืชได้รับน้ำอัตโนมัติ':wl>0?'ชุ่มชื้น เหลือ '+fmHM(wl):'<b style="color:#ff9a7a">แห้ง · พืชหยุดโตชั่วคราว</b>')+'</small>'+(wl>0&&!raining()?'<div class="bar w"><i style="width:'+Math.min(100,wl/waterDur()*100)+'%"></i></div>':'')+
   '<small>🧪 ปุ๋ย: '+(p.f?FERT[p.f].n+' (โตเร็ว +'+Math.round(FERT[p.f].sp*100)+'%)':'ยังไม่ได้ใส่')+'</small></div></div>';
  if(st>=3)h+='<div class="fmT"><button class="gold" onclick="FARM.doHarvest('+i+')">🧺 เก็บเกี่ยว (ได้ '+c.y+'+ ชิ้น)</button></div>';
  else{h+='<div class="fmT"><button '+(wet&&!raining()&&wl>waterDur()*.85?'disabled':'')+' onclick="FARM.doWater('+i+')">🚿 รดน้ำ ('+(F().tools.can2?36:24)+' ชม.เกม)</button></div>';
   if(!p.f)h+='<div class="fmT">'+Object.keys(FERT).map(k=>'<button '+((f.fert[k]||0)>0?'':'disabled')+' onclick="FARM.doFert('+i+',\''+k+'\')">'+FERT[k].ic+' '+FERT[k].n+' ×'+(f.fert[k]||0)+'</button>').join('')+'</div>'}
 }
 return h+'</div></div>'}
function fmHM(m){m=Math.max(0,Math.round(m));const h=Math.floor(m/60);return (h?h+' ชม. ':'')+(m%60)+' น.'}
function render(){const m=document.getElementById('fmx');if(!m||m.hidden)return;syncAll();
 const v={plot:plotView,bag,book,quest:questView,market,farmer:farmerMenu}[mode];if(!v)return;
 const bodyOld=m.querySelector('.fmB'),sc=bodyOld?bodyOld.scrollTop:0;m.innerHTML=v();const b=m.querySelector('.fmB');if(b)b.scrollTop=sc}
// ---------- API ----------
const API={CROPS,BY,CLS,CFG,FERT,QUESTS,ACH,TOOLS,UPG,NPLOT,F,init,icon,spr,IMG:()=>IMG,stage,upd,syncAll,isWet,raining,total,rate,now,sfx,fmM,
 plant,water,fertilize,harvest,sell,sellAll,
 setHooks(o){lockFn=o.lock;fxCb=o.fx},
 open:openUI,close:closeUI,isOpen,render,
 bookCat(c){arg={cat:c};render()},mk(a){arg=Object.assign({},arg,a);render()},
 qAccept,qClaim,
 buy(id,n){buySeed(id,n);render()},buyF(k,n){buyFert(k,n);render()},buyT(k){buyTool(k);render()},buyU(k){buyUp(k);render()},
 sell(id,n){const v=sell(id,n);if(v)toast_('ขาย '+sn(id)+' ได้ '+fmM(v));render()},
 ask(k){arg=Object.assign({},arg,{cf:k});render()},
 confirmSell(){const k=arg&&arg.cf;arg=Object.assign({},arg,{cf:null});if(k==='*'){const r=sellAll();if(r[1])toast_('ขายผลผลิต '+r[1]+' ชิ้น ได้ '+fmM(r[0]))}else if(k){const v=sell(k,99999);if(v)toast_('ขาย '+sn(k)+' ได้ '+fmM(v))}render()},
 doPlant(i,k){if(plant(i,k)){arg={i};render()}},doWater(i){if(water(i))render()},doFert(i,k){if(fertilize(i,k))render()},doHarvest(i){const r=harvest(i);if(r){toast_('🧺 เก็บเกี่ยว '+sn(r.id)+' ×'+r.n+(r.bonus?' (โบนัสคุณภาพ ✨)':''));closeUI()}},
 tips(){arg={say:'เคล็ดลับนะครับ: 1) รดน้ำวันละครั้งก็พอ น้ำอยู่ได้ 24 ชั่วโมงเกม ฝนตกพืชได้น้ำเอง 2) ใส่ปุ๋ยตอนเพิ่งปลูกได้ผลดีที่สุด 3) พืชหายากและพืชพิเศษขายได้ราคาสูงมาก ภารกิจบนกระดานให้เมล็ดพิเศษนะครับ 4) ไม่ต้องกังวล พืชไม่ตายครับ แค่หยุดโตเมื่อแห้ง'};render()},
 test:{reset(){S.farm=fresh();render()},give(){const f=F();CROPS.forEach(c=>{f.seeds[c.id]=(f.seeds[c.id]||0)+5;bookU(c.id)});f.fert={n:20,h:10,r:5};S.money+=50000},grow(i,m){const p=F().plots[i];if(p&&p.c)p.g=Math.min(total(p.c),p.g+(m||99999));upd(i)}}};
window.FARM=API;
})();
