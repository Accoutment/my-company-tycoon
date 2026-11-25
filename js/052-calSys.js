/* ===== v96 ระบบปฏิทิน · วันเกิด · Contact · โทรอวยพร (ผูกกับ S.day / พนักงาน / ตัวละครพิเศษ / ลูกค้า / คอม Manager เดิม) ===== */
const CAL=(()=>{
 const V={k:0,tab:'cal',sel:0,open:false,busy:false,pp:0,info:null,call:null,seeded:false};
 const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const ok=()=>typeof S!=='undefined'&&S&&Number.isFinite(S.day)&&Array.isArray(S.emp);
 const clp=v=>Math.max(0,Math.min(100,v));
 const el=id=>document.getElementById(id);
 function st(){
  if(!ok())return null;let c=S.cal;
  if(!c||typeof c!=='object')c=S.cal={v:1,bd:{},rel:{},hp:{},greet:{},calls:[],ev:{},contacts:{},bless:{},nd:0};
  ['bd','rel','hp','greet','ev','contacts','bless'].forEach(k=>{if(!c[k]||typeof c[k]!=='object'||Array.isArray(c[k]))c[k]={}});
  if(!Array.isArray(c.calls))c.calls=[];return c;
 }
 const di=d=>{d=Math.max(1,d|0);const k=Math.floor((d-1)/30);return{k,yr:Math.floor(k/12)+1,mo:k%12+1,dm:(d-1)%30+1,wd:(d-1)%7}};
 const dayOf=(k,dm)=>k*30+dm;
 const seaOf=k=>{const o=(typeof SEASON_ORDER!=='undefined'&&SEASON_ORDER.length)?SEASON_ORDER:['spring','summer','rainy','autumn'];return SEASON_INFO[o[k%o.length]]||{name:'',icon:'📅'}};
 const DAYF=['จันทร์','อังคาร','พุธ','พฤหัสฯ','ศุกร์','เสาร์','อาทิตย์'];
 const dateTx=d=>{const x=di(d);return 'วัน'+DAYF[x.wd]+' ที่ '+x.dm+' เดือน '+x.mo+' ปี '+x.yr};
 const bdTx=b=>'วันที่ '+b.d+' เดือน '+b.m;
 /* ---------- ทะเบียนตัวละคร (เชื่อมกับของเดิมทั้งหมด ไม่สร้าง NPC ใหม่) ---------- */
 function kidPort(id){try{return CEOScene.kidPort(id)||''}catch(e){return ''}}
 function ryuHas(){try{return window.LOAN&&typeof LOAN.contactApp==='function'&&!/ยังไม่มีรายชื่อ/.test(LOAN.contactApp())}catch(e){return false}}
 function people(){
  const c=st();if(!c)return[];const L=[];
  (S.emp||[]).forEach(e=>{const a=(typeof CHAR_IMAGES!=='undefined')&&CHAR_IMAGES[charIdOf(e)];
   L.push({key:'e'+e.id,t:'emp',name:e.name,role:(e.rank==='mgr'||e.charId==='manager-white')?'ผู้จัดการ':(e.role||'พนักงาน'),img:a&&a.portrait?a.portrait.src:'',ref:e})});
  [['uncle-chai','ลุงชัย','ผู้ช่วยเตรียมวัตถุดิบ'],['aunt-phen','ป้าเพ็ญ','แม่ครัวประจำบริษัท'],['security-guard','รปภ.','เจ้าหน้าที่รักษาความปลอดภัย']].forEach(([id,n,r])=>{
   const a=(typeof CHAR_IMAGES!=='undefined')&&CHAR_IMAGES[id];
   L.push({key:'s:'+id,t:'staff',name:n,role:r+' (ตัวละครพิเศษ)',img:a&&a.portrait?a.portrait.src:'',owned:(S.kitchenStaff||[]).some(x=>x.charId===id)})});
  [['bu','ใบบัว'],['phum','ภูมิ'],['mint','มินท์']].forEach(([id,n])=>L.push({key:'k:'+id,t:'kid',name:n,role:'เด็กน้อยประจำถนนคนเดิน (ตัวละครพิเศษ)',img:kidPort(id),kid:id}));
  const ct=typeof CUSTOMER_DEFS!=='undefined'?CUSTOMER_DEFS:{};
  Object.keys(ct).forEach(t=>L.push({key:'c:'+t,t:'cust',type:t,name:ct[t].name,role:ct[t].role||'ลูกค้า',img:(typeof CUSTOMER_PORTRAITS!=='undefined'&&CUSTOMER_PORTRAITS[t])||''}));
  Object.keys(c.contacts).forEach(k=>{if(!L.some(p=>p.key===k)){const x=c.contacts[k];L.push({key:k,t:'cust',type:k.slice(2),name:x.name||k,role:x.role||'ลูกค้า',img:x.img||''})}});
  L.push({key:'x:ryuji',t:'boss',name:'ริวจิ',role:'ยากูซ่า (เจ้าหนี้)',img:(typeof LOAN_PORT!=='undefined'&&LOAN_PORT.boss)||'',has:ryuHas()});
  let dirty=false;L.forEach(p=>{if(!c.bd[p.key]){bdaySet(c,p.key);dirty=true}p.bd=c.bd[p.key]});
  if(dirty)V.dirty=true;return L;
 }
 function bdaySet(c,key){const used=new Set(Object.keys(c.bd).map(k=>c.bd[k].m*100+c.bd[k].d));let m,d,n=0;do{m=1+Math.floor(Math.random()*12);d=1+Math.floor(Math.random()*30)}while(used.has(m*100+d)&&++n<3000);c.bd[key]={m,d}}
 const isBd=(p,x)=>p.bd&&p.bd.m===x.mo&&p.bd.d===x.dm;
 const greeted=(c,key,yr)=>!!(c.greet[key]&&c.greet[key][yr]);
 const relOf=(c,p)=>c.rel[p.key]!=null?c.rel[p.key]:(p.t==='cust'&&c.contacts[p.key]?10:p.t==='emp'?15:5);
 const hpOf=(c,p)=>p.t==='emp'?clp(p.ref.ha):(c.hp[p.key]!=null?c.hp[p.key]:50);
 const RELN=[[80,'เพื่อนสนิท 💖'],[60,'สนิทสนม 💛'],[40,'เพื่อน 🙂'],[20,'คุ้นเคย'],[0,'คนรู้จัก']];
 const relName=v=>(RELN.find(r=>v>=r[0])||RELN[4])[1];
 function ev(day,o){const c=st();if(!c)return;const a=c.ev[day]=c.ev[day]||[];a.push(o);if(a.length>12)a.shift();
  const ks=Object.keys(c.ev);if(ks.length>760){ks.map(Number).sort((a,b)=>a-b).slice(0,ks.length-720).forEach(k=>delete c.ev[k])}}
 /* ---------- ลูกค้า → Contact อัตโนมัติ (ไม่ซ้ำ) ---------- */
 function ctOf(c,cust){const key='c:'+cust.type;let x=c.contacts[key];if(!x){x=c.contacts[key]={since:S.day,name:cust.name,role:cust.role,img:cust.portrait||'',visits:[],jobs:[]};c.rel[key]=c.rel[key]!=null?c.rel[key]:10;c.hp[key]=c.hp[key]!=null?c.hp[key]:50;x._new=1}return[key,x]}
 function onSpawn(cust){
  const c=st();if(!c||!cust)return;const key='c:'+cust.type,x=c.contacts[key];
  if(x){if(x.visits[x.visits.length-1]!==S.day)x.visits.push(S.day);if(x.visits.length>60)x.visits.shift();ev(S.day,{k:'visit',key,t:'🚪 '+cust.name+' มาติดต่อบริษัท'})}
  const b=c.bless[key];
  if(b&&S.day<=b.until){ // โบนัสจากคำอวยพรวันเกิด: ไม่รับประกัน — สุ่มตามความสนิท และใช้ครั้งเดียว
   delete c.bless[key];const rel=c.rel[key]||10;
   if(Math.random()<Math.min(.85,.45+rel/200)&&cust.job&&cust.job.reward){
    const old=cust.job.reward,nw=Math.max(old,Math.round(old*(1+b.mult)/50)*50);
    if(nw>old){cust.job.reward=nw;cust.bdBonus=nw-old;cust.speech=(cust.speech||'')+' ...และขอบคุณที่โทรมาอวยพรวันเกิดนะ ครั้งนี้ขอเพิ่มค่าตอบแทนให้เป็นพิเศษ!';toast('🎁 '+cust.name+' ใจดีเสนอค่าตอบแทนเพิ่ม '+M(nw-old)+' (ขอบคุณคำอวยพร)')}
   }
  }
 }
 function onAccept(cust,proj){
  const c=st();if(!c||!cust||!proj)return;const[key,x]=ctOf(c,cust);
  if(x._new){delete x._new;toast('📇 เพิ่ม '+cust.name+' ลงรายชื่อติดต่อ (Contact) แล้ว');ev(S.day,{k:'contact',key,t:'📇 เพิ่ม '+cust.name+' ลงรายชื่อติดต่อ'})}
  if(x.visits[x.visits.length-1]!==S.day)x.visits.push(S.day);
  x.jobs.push({day:S.day,n:proj.n,reward:proj.reward,st:'รับงานแล้ว',id:proj.id});if(x.jobs.length>40)x.jobs.shift();
  c.rel[key]=clp((c.rel[key]||10)+3);c.hp[key]=clp((c.hp[key]!=null?c.hp[key]:50)+4);
  if((c.rel[key]||0)>=60&&Math.random()<.25){proj.bdBonus2=Math.round(proj.reward*.12/50)*50;if(proj.bdBonus2>0)toast('✨ '+cust.name+' สนิทกับคุณมาก — มีโบนัสพิเศษรอเมื่อส่งงานสำเร็จ')}
  ev(S.day,{k:'job',key,t:'📋 รับงาน '+proj.n+' จาก '+cust.name+' ('+M(proj.reward)+')'});
 }
 function onDone(p){
  const c=st();if(!c||!p||!p.clientId)return;const key='c:'+p.clientId,x=c.contacts[key];if(!x)return;
  const j=x.jobs.find(q=>q.id===p.id)||x.jobs.slice().reverse().find(q=>q.n===p.n&&q.st==='รับงานแล้ว');
  if(j)j.st='ส่งงานสำเร็จ';
  c.rel[key]=clp((c.rel[key]||10)+5);c.hp[key]=clp((c.hp[key]!=null?c.hp[key]:50)+5);
  if(p.bdBonus2){S.money+=p.bdBonus2;S.today&&(S.today.inc+=p.bdBonus2);S.tot&&(S.tot.earn+=p.bdBonus2);toast('🎁 โบนัสพิเศษจาก '+x.name+' +'+M(p.bdBonus2));if(j)j.bonus=p.bdBonus2}
  ev(S.day,{k:'done',key,t:'✅ ส่งงาน '+p.n+' ให้ '+x.name+' สำเร็จ'});
 }
 /* ---------- โทรอวยพรวันเกิด ---------- */
 function can(c,p){
  const d=di(S.day);
  if(!isBd(p,d))return{ok:0,why:'โทรอวยพรได้เฉพาะวันเกิดจริงตามปฏิทินเกม'};
  if(greeted(c,p.key,d.yr))return{ok:0,done:1,why:'อวยพร '+p.name+' ในปีนี้แล้ว'};
  if(p.t==='cust'&&!c.contacts[p.key])return{ok:0,why:'ยังไม่มี '+p.name+' ในรายชื่อติดต่อ (ต้องรับงานจากลูกค้าก่อน)'};
  if(p.t==='staff'&&!p.owned)return{ok:0,why:p.name+' ยังไม่ได้ร่วมทีมบริษัท'};
  if(p.t==='boss'&&!p.has)return{ok:0,why:'ยังไม่มีคอนแท็คริวจิ'};
  return{ok:1};
 }
 const LN={
  emp:[['สุขสันต์วันเกิดนะ {n}! ขอบคุณที่ทำงานหนักมาตลอดเลย','ฮือ… คุณ CEO จำวันเกิดผมได้ด้วยเหรอครับ ดีใจมากเลย! จะตั้งใจทำงานให้เต็มที่เลยครับ'],['{n} วันนี้วันเกิดใช่มั้ย? สุขสันต์วันเกิดนะ พักผ่อนเยอะ ๆ ด้วย','ว้าว ขอบคุณค่ะ/ครับ! วันนี้เป็นวันเกิดที่ดีที่สุดเลย']],
  staff:[['สุขสันต์วันเกิดนะ {n}! ขอบคุณที่ดูแลทุกคนในบริษัทเสมอมา','โอ๊ย… คุณ CEO ใจดีจริง ๆ ขอบใจนะ วันนี้จะทำของอร่อย ๆ ให้ทุกคนเลย!']],
  kid:[['สุขสันต์วันเกิดนะ {n}! อยากได้ของขวัญอะไรบอกพี่ได้เลย','หูย! พี่ CEO จำวันเกิดหนูได้ด้วย! ขอบคุณค่ะ/ครับ รักพี่ที่สุดเลย!']],
  cust:{mei:['สุขสันต์วันเกิดค่ะคุณเมย์! ขอให้คอนเทนต์ปังทุกคลิปเลยนะคะ','กรี๊ด ขอบคุณมากค่ะ! ไม่คิดว่า CEO จะจำได้ ไว้เจอกันงานหน้านะคะ!'],tee:['สุขสันต์วันเกิดครับคุณตี๋ ขอให้ธุรกิจเจริญรุ่งเรือง','ขอบคุณครับ ไม่คิดว่าคุณจะใส่ใจขนาดนี้ ผมจะจำไว้ครับ'],phak:['สุขสันต์วันเกิดครับคุณภาค ขอให้สัตว์ในฟาร์มแข็งแรงทุกตัว','อ้าว… ขอบใจนะ ไม่ค่อยมีใครโทรมาแบบนี้ ดีใจจริง ๆ'],ton:['สุขสันต์วันเกิดครับคุณต้น ขอให้มีงานเข้าเยอะ ๆ','โห ขอบคุณครับ! ผมประทับใจมากเลย ไว้มีงานจะมาหาที่บริษัทแน่นอน'],praw:['สุขสันต์วันเกิดค่ะคุณพราว ขอให้ร้านเดรสขายดีเป็นเทน้ำเทท่า','ขอบคุณค่ะ! น่ารักที่สุดเลย ไว้ฝากงานดี ๆ ให้อีกนะคะ'],pink:['สุขสันต์วันเกิดค่ะคุณพิงค์ ขอให้ยอดสตรีมพุ่งทะลุเป้า','ว้ายยย ขอบคุณค่ะ! แฟน ๆ ยังไม่รู้เลยว่า CEO ใจดีขนาดนี้ 💕'],_:['สุขสันต์วันเกิดนะคะ/ครับ {n}','ขอบคุณมากค่ะ/ครับ ประทับใจจริง ๆ']},
  boss:[['…สุขสันต์วันเกิดนะริวจิ','ฮึ… ไม่นึกว่าจะมีคนโทรมาอวยพรผม ขอบใจ (ทำเสียงเขิน) เอ้อ… อย่าเข้าใจผิดนะ']]
 };
 function apply(c,p){
  const o={rel:0,hp:0,x:[]};const bump=(v)=>{const b=relOf(c,p);c.rel[p.key]=clp(b+v);o.rel=c.rel[p.key]-b};
  if(p.t==='emp'){const e=p.ref,h0=e.ha;e.ha=cl(e.ha+14);e.sr=cl((e.sr||0)-10);o.hp=Math.round(e.ha-h0);bump(8);o.x.push('ความเครียดลดลง · ขวัญกำลังใจดีขึ้น')}
  else if(p.t==='staff'){bump(8);(S.emp||[]).forEach(e=>{e.ha=cl(e.ha+2)});o.x.push('ทีมงานทั้งบริษัทมีความสุขขึ้นเล็กน้อย (+2)')}
  else if(p.t==='kid'){bump(6);try{S.kids=S.kids||{};S.kids.aff=S.kids.aff||{};S.kids.aff[p.kid]=(S.kids.aff[p.kid]||0)+6;o.x.push('สายสัมพันธ์กับเด็ก ๆ เพิ่มขึ้น (+6)')}catch(e){}}
  else if(p.t==='cust'){const h0=hpOf(c,p);c.hp[p.key]=clp(h0+12);o.hp=c.hp[p.key]-h0;bump(10);
   c.bless[p.key]={mult:.06+Math.random()*.1,until:S.day+120};o.x.push('โอกาสได้ข้อเสนองานที่ดีขึ้นในการติดต่อครั้งถัดไป (ไม่รับประกัน)')}
  else{bump(3)}
  if(p.t!=='emp'&&p.t!=='cust'){const h0=hpOf(c,p);c.hp[p.key]=clp(h0+10);o.hp=c.hp[p.key]-h0}
  return o;
 }
 function call(key){
  if(V.busy||V.call)return;const c=st();if(!c)return;const p=people().find(x=>x.key===key);if(!p)return;
  const r=can(c,p);if(!r.ok)return toast(r.why);
  V.busy=true;const d=di(S.day);(c.greet[key]=c.greet[key]||{})[d.yr]=S.day; // ล็อกสถานะ "อวยพรแล้ว" ทันที กันกดซ้ำรับโบนัส
  const fx=apply(c,p);
  c.calls.unshift({day:S.day,key,name:p.name,fx:'ความสัมพันธ์ +'+fx.rel+(fx.hp?' · ความสุข +'+fx.hp:'')});c.calls.length=Math.min(c.calls.length,300);
  ev(S.day,{k:'call',key,t:'📞 โทรอวยพรวันเกิด '+p.name});
  try{save(1)}catch(e){}try{hud()}catch(e){}
  const pool=p.t==='cust'?(LN.cust[p.type]?[LN.cust[p.type]]:[LN.cust._]):LN[p.t==='emp'?'emp':p.t];
  const ln=pool[Math.floor(Math.random()*pool.length)];
  V.call={p,steps:[{w:'ring'},{w:'ceo',t:ln[0].replace('{n}',p.name)},{w:'npc',t:ln[1].replace('{n}',p.name)},{w:'fx',fx}],i:0};
  renderCall();refresh();
 }
 function renderCall(){
  let m=el('calCall');if(!m){m=document.createElement('div');m.id='calCall';document.body.appendChild(m)}
  const C=V.call;if(!C){m.hidden=true;return}
  const s=C.steps[C.i],p=C.p;let tx='',emo='';
  if(s.w==='ring')tx='📞 กำลังโทรหา '+esc(p.name)+' ...<br><small>ตื๊ด… ตื๊ด…</small>';
  else if(s.w==='ceo')tx='<b>CEO:</b> “'+esc(s.t)+'”';
  else if(s.w==='npc'){tx='<b>'+esc(p.name)+':</b> “'+esc(s.t)+'”';emo='🥰'}
  else{const f=s.fx;tx='<span class="callEmo">🎉</span> '+esc(p.name)+' ดีใจมากที่ได้รับคำอวยพร!<div class="callFx">❤ ความสัมพันธ์ +'+f.rel+(f.hp?' · 😊 ความสุข +'+f.hp:'')+'<br>'+f.x.map(esc).join('<br>')+'</div>'}
  const last=C.i===C.steps.length-1;
  m.hidden=false;m.innerHTML='<div class="callBox"><div class="callHd"><img src="'+esc(p.img)+'" alt=""><div><b style="font-size:18px">'+esc(p.name)+'</b><div class="st">'+(s.w==='ring'?'กำลังโทร…':'🟢 สายติดแล้ว')+' '+emo+'</div><small>'+esc(p.role)+'</small></div></div><div class="callTx">'+tx+'</div><div class="callAct">'+(last?'':'<button class="callNext" onclick="CAL.next()">ต่อไป ▶</button>')+'<button class="callEnd" onclick="CAL.hang()">'+(last?'วางสาย':'วางสายเลย')+'</button></div></div>';
 }
 function next(){const C=V.call;if(!C)return;if(C.i<C.steps.length-1){C.i++;renderCall()}}
 function hang(){V.call=null;V.busy=false;renderCall();refresh();try{if(window.OS&&OS.on)OS.render()}catch(e){}}
 /* ---------- ปฏิทิน UI ---------- */
 function heads(list,c,yr){
  const sh=list.slice(0,3).map(p=>(p.img?'<img class="'+(greeted(c,p.key,yr)?'done':'')+'" src="'+esc(p.img)+'" alt="" title="'+esc(p.name)+'">':'<i>'+esc(p.name.slice(0,1))+'</i>')).join('');
  return sh+(list.length>3?'<i class="more">+'+(list.length-3)+'</i>':'');
 }
 const visitDay=d=>d>=5&&(d-5)%7===0&&d!==60&&(typeof MYS_DAY==='undefined'||d!==MYS_DAY);
 function monthHTML(c,P){
  const k=V.k,off=(k*30)%7,today=S.day,td=di(today),mo=k%12+1;
  let h='<div class="calGrid">'+DAY.map((n,i)=>'<div class="calDow'+(i>4?' we':'')+'">'+n.replace('.','')+'</div>').join('');
  for(let i=0;i<off;i++)h+='<div class="calCell empty"></div>';
  for(let dm=1;dm<=30;dm++){
   const d=dayOf(k,dm),wd=(d-1)%7,bs=P.filter(p=>p.bd.m===mo&&p.bd.d===dm),cls='calCell'+(wd>4?' we':'')+(d===today?' today':'')+(d===V.sel?' sel':'');
   const hasEv=c.ev[d]&&c.ev[d].length;
   h+='<div class="'+cls+'" onclick="CAL.pick('+d+')" title="'+esc(bs.map(p=>'🎂 '+p.name).join(', '))+'"><span class="n">'+dm+'</span>'+(bs.length?'<div class="calHeads">'+heads(bs,c,Math.floor(k/12)+1)+'</div>':'')+(window.REL&&REL.cellIcon?REL.cellIcon(d):'')+(visitDay(d)?'<span class="calFlag" title="คาดว่ามีลูกค้ามาติดต่อ">🚩</span>':hasEv&&!bs.length?'<span class="calCake" title="มีกิจกรรมบันทึกไว้">•</span>':'')+'</div>';
  }
  const tot=off+30,rest=(7-tot%7)%7;for(let i=0;i<rest;i++)h+='<div class="calCell empty"></div>';
  return h+'</div>';
 }
 function dayHTML(c,P){
  const d=V.sel||S.day,x=di(d),bs=P.filter(p=>isBd(p,x)),evs=c.ev[d]||[];
  let h='<div class="calDet"><h3>📖 '+dateTx(d)+(d===S.day?' · <span style="color:#e8344a">วันนี้</span>':d<S.day?' · ผ่านมาแล้ว':' · ยังไม่ถึง')+' '+seaOf(x.k).icon+'</h3>';
  if(!bs.length&&!evs.length&&!visitDay(d)&&d!==60&&!(window.REL&&REL.hasDay&&REL.hasDay(d)))h+='<div class="calEv">ไม่มีกิจกรรมพิเศษในวันนี้</div>';
  bs.forEach(p=>{const r=can(c,p),gr=greeted(c,p.key,x.yr);
   h+='<div class="calEv"><img src="'+esc(p.img)+'" alt="" onclick="CAL.showInfo(\''+esc(p.key)+'\')"><span>🎂 วันเกิด <a onclick="CAL.showInfo(\''+esc(p.key)+'\')">'+esc(p.name)+'</a> <small>('+esc(p.role)+')</small></span><span class="gr">'+(gr?'<span class="calOk">✓ อวยพรแล้ว</span>':d===S.day?'<button class="calCallBtn" '+(r.ok?'':'disabled title="'+esc(r.why)+'"')+' onclick="CAL.call(\''+esc(p.key)+'\')">📞 โทรอวยพร</button>':d<S.day?'<small>ไม่ได้อวยพร</small>':'<small>รอถึงวันเกิด</small>')+'</span></div>'});
  if(visitDay(d))h+='<div class="calEv">🚩 คาดว่ามีลูกค้ามาติดต่อบริษัท (รอบลูกค้าประจำ)</div>';
  if(d===60)h+='<div class="calEv">🚩 วันสำคัญ: ลูกค้าพิเศษจะมาที่บริษัท</div>';
  try{if(window.REL&&REL.dayHTML)h+=REL.dayHTML(d)}catch(e){}
  evs.forEach(e=>{h+='<div class="calEv">'+esc(e.t)+'</div>'});
  return h+'</div>';
 }
 function phoneHTML(){
  const c=st();if(!c)return'';const P=people(),x=di(S.day),bs=P.filter(p=>isBd(p,x));
  let h='<div class="calPhone"><div class="calBox"><h3>🎂 วันเกิดวันนี้ ('+bs.length+')</h3>';
  if(!bs.length)h+='<div class="calRow">วันนี้ไม่มีใครวันเกิด</div>';
  bs.forEach(p=>{const r=can(c,p),gr=greeted(c,p.key,x.yr);h+='<div class="calRow"><img src="'+esc(p.img)+'" alt="" onclick="CAL.showInfo(\''+esc(p.key)+'\')"><span><b>'+esc(p.name)+'</b><br><small>'+esc(p.role)+'</small></span><span class="gr">'+(gr?'<span class="calOk">✓ อวยพรแล้ว</span>':'<button class="calCallBtn" '+(r.ok?'':'disabled title="'+esc(r.why)+'"')+' onclick="CAL.call(\''+esc(p.key)+'\')">📞 โทร</button>')+'</span></div>'});
  h+='</div><div class="calBox"><h3>📇 Contact ลูกค้า</h3>';
  const cs=P.filter(p=>p.t==='cust'&&c.contacts[p.key]);
  if(!cs.length)h+='<div class="calRow"><small>ยังไม่มีลูกค้าในรายชื่อ — รับงานจากลูกค้าที่มาติดต่อสำเร็จก่อน ระบบจะเพิ่มให้อัตโนมัติ</small></div>';
  cs.forEach(p=>{const r=relOf(c,p),hp=hpOf(c,p);h+='<div class="calRow" style="cursor:pointer" onclick="CAL.showInfo(\''+esc(p.key)+'\')"><img src="'+esc(p.img)+'" alt=""><span><b>'+esc(p.name)+'</b><br><small>'+relName(r)+' · 🎂 '+bdTx(p.bd)+'</small></span><span class="gr"><small>❤</small><span class="calBar"><u style="width:'+r+'%;background:#e8566a"></u></span> <small>😊</small><span class="calBar"><u style="width:'+hp+'%;background:#e0a82e"></u></span></span></div>'});
  h+='</div></div><div class="calBox" style="margin-top:8px"><h3>🕘 ประวัติการโทรอวยพร</h3>';
  if(!c.calls.length)h+='<div class="calRow"><small>ยังไม่เคยโทรอวยพร</small></div>';
  c.calls.slice(0,8).forEach(q=>{h+='<div class="calRow"><span>📞 <b>'+esc(q.name)+'</b> <small>'+dateTx(q.day)+'</small></span><span class="gr"><small>'+esc(q.fx)+'</small></span></div>'});
  return h+'</div>';
 }
 function infoHTML(){
  const c=st(),p=people().find(x=>x.key===V.info);if(!c||!p)return'';
  const x=di(S.day),r=relOf(c,p),hp=hpOf(c,p),ct=c.contacts[p.key],gy=c.greet[p.key]||{};
  let h='<div class="calInfo" onclick="if(event.target===this)CAL.hideInfo()"><div class="calInfoBox"><div class="hd"><img src="'+esc(p.img)+'" alt=""><div><b>'+esc(p.name)+'</b><div class="ln">'+esc(p.role)+'</div><div class="ln">🎂 วันเกิด: '+bdTx(p.bd)+'</div></div><button class="calX" style="margin-left:auto" onclick="CAL.hideInfo()">✕</button></div>'+
   '<div class="ln">❤ ความสัมพันธ์: <b>'+relName(r)+'</b> <span class="calBar"><u style="width:'+r+'%;background:#e8566a"></u></span> '+Math.round(r)+'/100</div>'+
   '<div class="ln">😊 ความสุข: <span class="calBar"><u style="width:'+hp+'%;background:#e0a82e"></u></span> '+Math.round(hp)+'/100</div>'+
   '<div class="ln">🎁 สถานะอวยพรปีนี้: '+(gy[x.yr]?'<span class="calOk">✓ อวยพรแล้ว ('+dateTx(gy[x.yr])+')</span>':isBd(p,x)?'ยังไม่ได้อวยพร — วันนี้วันเกิด!':'ยังไม่ได้อวยพร')+'</div>';
  if(p.t==='cust'){h+='<div class="ln">📇 Contact: '+(ct?'บันทึกแล้ว (ตั้งแต่ '+dateTx(ct.since)+')':'ยังไม่อยู่ในรายชื่อ — รับงานจากลูกค้าคนนี้เพื่อเพิ่มอัตโนมัติ')+'</div>';
   if(ct){h+='<div class="ln"><b>ประวัติการติดต่อ</b> ('+ct.visits.length+' ครั้ง): '+(ct.visits.slice(-6).map(d=>'วันที่ '+d).join(', ')||'-')+'</div><div class="ln"><b>ประวัติการรับงาน</b></div>'+(ct.jobs.length?ct.jobs.slice(-6).reverse().map(j=>'<div class="ln">• วันที่ '+j.day+' · '+esc(j.n)+' · '+M(j.reward)+' · '+j.st+(j.bonus?' (+โบนัส '+M(j.bonus)+')':'')+'</div>').join(''):'<div class="ln">-</div>')}}
  const cc=c.calls.filter(q=>q.key===p.key).slice(0,4);
  if(cc.length)h+='<div class="ln"><b>ประวัติการโทร</b></div>'+cc.map(q=>'<div class="ln">• '+dateTx(q.day)+' · '+esc(q.fx)+'</div>').join('');
  return h+'</div></div>';
 }
 function render(){
  const m=el('calModal');if(!m||!V.open||!ok())return;const c=st(),P=people(),k=V.k,x=seaOf(k);
  const ban=x.name?x.icon+' '+x.name:'📅';
  m.innerHTML='<div class="calWin"><div class="calTop"><div class="calTabs"><button class="calTab'+(V.tab==='cal'?' on':'')+'" onclick="CAL.tab(\'cal\')">📅 ปฏิทิน</button><button class="calTab'+(V.tab==='phone'?' on':'')+'" onclick="CAL.tab(\'phone\')">📱 โทรศัพท์ · Contact'+(pending(P)?' 🔴':'')+'</button></div><button class="calX" onclick="CAL.close()">ปิด ✕</button></div>'+
   (V.tab==='cal'?'<div class="calHead"><button class="calNav" onclick="CAL.mv(-12)" title="ย้อนหลัง 1 ปี">«</button><button class="calNav" onclick="CAL.mv(-1)">◀</button><div class="calBanner">'+ban+'<small>เดือน '+(k%12+1)+' · ปี '+(Math.floor(k/12)+1)+'</small></div><button class="calNav" onclick="CAL.mv(1)">▶</button><button class="calNav" onclick="CAL.mv(12)" title="ล่วงหน้า 1 ปี">»</button><button class="calBtn2" onclick="CAL.goToday()">วันนี้</button></div>'+monthHTML(c,P)+dayHTML(c,P):phoneHTML())+
   (V.info?infoHTML():'')+'</div>';
 }
 const pending=P=>{const c=st();if(!c)return 0;const x=di(S.day);return P.filter(p=>isBd(p,x)&&!greeted(c,p.key,x.yr)&&can(c,p).ok).length};
 function badge(){const b=el('calBadge');if(!b||!ok())return;const n=pending(people());b.hidden=!n;b.textContent=n}
 function refresh(){render();badge()}
 /* ---------- แจ้งเตือนเริ่มวันใหม่ ---------- */
 function notify(){
  const c=st();if(!c)return;const P=people(),x=di(S.day),l=P.filter(p=>isBd(p,x)&&!greeted(c,p.key,x.yr)&&can(c,p).ok);
  c.nd=S.day;if(!l.length)return;
  let n=el('calNote');if(!n){n=document.createElement('div');n.id='calNote';document.body.appendChild(n)}
  n.hidden=false;n.innerHTML='<div class="hd">🎂 วันนี้มีวันเกิด! ('+l.length+')</div><div class="pp">'+l.slice(0,5).map(p=>'<span style="display:inline-flex;align-items:center;gap:4px"><img src="'+esc(p.img)+'" alt="">'+esc(p.name)+'</span>').join('')+(l.length>5?'<span>+'+(l.length-5)+'</span>':'')+'</div><div class="ac"><button class="calBtn2" onclick="CAL.openPhone()">📅 เปิดปฏิทิน</button><button class="calX" onclick="document.getElementById(\'calNote\').hidden=true">✕</button></div>';
  clearTimeout(V.nt);V.nt=setTimeout(()=>{const q=el('calNote');if(q)q.hidden=true},14000);
  try{toast('🎂 วันนี้วันเกิด '+l.slice(0,3).map(p=>p.name).join(', ')+(l.length>3?' และอีก '+(l.length-3)+' คน':''))}catch(e){}
 }
 function tick(){
  if(!ok())return;const lob=document.getElementById('lobby');if(lob&&getComputedStyle(lob).display!=='none')return;const c=st();people();
  if(V.dirty){V.dirty=false;try{if(!V.seeded){V.seeded=true}save(1)}catch(e){}}
  if(c.nd!==S.day&&!(window.CUT&&CUT.on)){notify()}
  badge();if(V.open&&!V.call&&V.lastDay!==S.day){V.lastDay=S.day;render()}
 }
 /* ---------- เปิด/ปิด ---------- */
 function open(tab){
  if(!ok())return;if(V.open){if(tab)V.tab=tab;return refresh()}
  let m=el('calModal');if(!m){m=document.createElement('div');m.id='calModal';m.hidden=true;document.body.appendChild(m);m.addEventListener('pointerdown',e=>{if(e.target===m)close()})}
  V.open=true;V.tab=tab||'cal';V.k=di(S.day).k;V.sel=S.day;V.info=null;V.lastDay=S.day;V.pp=S.paused;S.paused=1;try{K={}}catch(e){}
  m.hidden=false;const n=el('calNote');if(n)n.hidden=true;render();
 }
 function close(){if(!V.open)return;if(V.call)return;V.open=false;V.info=null;const m=el('calModal');if(m)m.hidden=true;if(ok())S.paused=V.pp;}
 window.addEventListener('keydown',e=>{if(V.open&&e.key==='Escape'){e.stopPropagation();e.preventDefault();if(V.call)return;if(V.info){V.info=null;render()}else close()}},true);
 setInterval(tick,700);
 return{
  open:()=>open(),openPhone:()=>open('phone'),close,call,next,hang,
  tab:t=>{V.tab=t;render()},mv:n=>{V.k=Math.max(0,V.k+n);render()},goToday:()=>{V.k=di(S.day).k;V.sel=S.day;render()},
  pick:d=>{V.sel=d;render()},showInfo:k=>{V.info=k;render()},hideInfo:()=>{V.info=null;render()},
  onSpawn,onAccept,onDone,
  osIcon:()=>'<button class="osIco" onclick="OS.close();CAL.open()"><i><img alt="ปฏิทิน" src="'+(window.CAL_ICON_SRC||'')+'"></i>ปฏิทิน'+'<b id="calOsBadge" style="'+(pending(people())?'':'display:none;')+'position:absolute;right:6px;top:2px;background:#e32636;color:#fff;border-radius:50%;padding:0 6px;font-size:16px">!</b></button>',
  phoneHTML,
  dbg:()=>({V,st,people,di,can,pending,tick,notify})
 };
})();
