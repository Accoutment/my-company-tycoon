
/* ห้องคอนโดหลายเลเวล + ค่าเช่า (โมดูลแยก · S.condo = {lv, own:{1,2,3}, lastRent}) */
(function(){
'use strict';
const IMG={"1": "assets/img/596f8569c91e.webp", "2": "assets/img/e31e2d9ddf12.webp", "3": "assets/img/0c9a090f09dd.webp"};
const LV={1:{name:'คอนโดธาราเรสซิเดนซ์',sub:'ห้องมาตรฐาน',price:0,rent:3500},2:{name:'เซ็นทรัลซิตี้ เรสซิเดนซ์',sub:'ห้องหรู วิวเมือง',price:45000,rent:9000},3:{name:'อิมพีเรียล เรสซิเดนซ์',sub:'ห้องระดับ 10 ดาว วิวทะเล+ระเบียง',price:150000,rent:0}};
const $=id=>document.getElementById(id);
const fm=n=>{try{return M(n)}catch(e){return '$'+Number(n).toLocaleString('en-US')}};
let pend=0,pt=0;
function ok(){try{return !!S}catch(e){return false}}
function st(){
 if(!ok())return {lv:1,own:{1:1},lastRent:0};
 let c=S.condo;if(!c||typeof c!=='object')c=S.condo={lv:1,own:{1:1},lastRent:0};
 if(!c.own||typeof c.own!=='object')c.own={1:1};c.own[1]=1;
 if(!LV[c.lv]||!c.own[c.lv])c.lv=1;if(typeof c.lastRent!=='number')c.lastRent=0;
 return c;
}
function lv(){return st().lv}
function own(n){return !!st().own[n]}
function setLv(n){const c=st();if(!LV[n]||!c.own[n])return false;c.lv=n;try{save(1)}catch(e){}return true}
function rentOf(n){return LV[n||lv()].rent}
function nextDue(){const d=S.day;return d+30-((d-1)%30)}
function buy(n){
 const c=st(),L=LV[n];if(!L||c.own[n])return false;
 if(S.money<L.price){try{toast('เงินไม่พอ ต้องใช้ '+fm(L.price))}catch(e){}return false}
 S.money-=L.price;c.own[n]=1;c.lv=n;
 try{log('🏠 ปลดล็อคห้อง LV'+n+' · '+L.name+' (-'+fm(L.price)+')')}catch(e){}
 try{save(1)}catch(e){}return true;
}
// เรียกจากตอนข้ามวัน: ทุก 30 วัน (วันที่ 31, 61, ...) เก็บค่าเช่าตามห้องที่ใช้อยู่
function rentTick(force){
 if(!ok())return 0;const c=st();
 if(!force&&!((S.day-1)%30===0&&S.day>1))return 0;
 if(!force&&c.lastRent===S.day)return 0;
 c.lastRent=S.day;const r=rentOf();
 if(r>0){S.money-=r;try{log('🏠 ค่าเช่าห้อง LV'+c.lv+' ประจำเดือน -'+fm(r))}catch(e){}return r}
 try{toast('🏠 ห้อง LV3 · ไม่มีค่าเช่า (ถาวร)')}catch(e){}return 0;
}
function chipHtml(n){
 const L=LV[n],o=own(n),a=lv()===n;
 const second=o?(a?'✓ ใช้อยู่':'ใช้ห้องนี้'):(pend===n?'กดอีกครั้งเพื่อซื้อ':'🔒 '+fm(L.price));
 const rent=L.rent>0?'เช่า '+fm(L.rent)+'/เดือน':'ไม่มีค่าเช่า';
 return '<button type="button" class="lvChip'+(a?' act':'')+(o?'':' lock')+(pend===n?' pend':'')+'" data-n="'+n+'"><b>LV'+n+'</b><small>'+second+'</small><small>'+rent+'</small></button>';
}
function paint(){
 const n=lv(),L=LV[n],img=$('condoDestImg'),bd=$('condoDestBadge');
 if(img){img.src=IMG[n];img.alt='LV'+n}
 if(bd)bd.textContent='LV'+n;
 const nm=$('busDestName'),sb=$('busDestSub');
 if(nm)nm.textContent='🏠 กลับคอนโด · LV'+n+' '+L.name;
 if(sb)sb.textContent=L.sub+' · '+(L.rent>0?'ค่าเช่า '+fm(L.rent)+'/เดือน (30 วัน)':'ไม่ต้องจ่ายค่าเช่าอีกแล้ว')+' · ครั้งต่อไปวันที่ '+nextDue();
 const row=document.querySelector('#ceoSceneChoices .lvRow');
 if(row){row.querySelectorAll('.lvChip').forEach(b=>b.remove());const rn=row.querySelector('.lvRent');[1,2,3].forEach(k=>{const t=document.createElement('div');t.innerHTML=chipHtml(k);const b=t.firstChild;b.onclick=ev=>{ev.stopPropagation();choose(k)};row.insertBefore(b,rn)})}
 const rr=document.querySelector('#ceoSceneChoices .lvRent');if(rr)rr.textContent=n===3?'ห้อง LV3 ไม่มีค่าเช่า ตลอดไป':'ค่าเช่าเก็บทุก 30 วัน (วันที่ 31, 61, 91 …) · '+fm(rentOf())+' · แยกจากบิลน้ำไฟ';
}
function choose(n){
 if(own(n)){pend=0;if(setLv(n)){try{toast('🏠 เลือกห้อง LV'+n+' · '+LV[n].name)}catch(e){}}paint();return}
 if(pend!==n){pend=n;clearTimeout(pt);pt=setTimeout(()=>{pend=0;paint()},4500);paint();return}
 pend=0;clearTimeout(pt);buy(n);paint();
}
function dialog(target){
 const btn=$('busBtnDest'),cv=$('ceoDestPreview');if(!btn||!cv)return;
 let img=$('condoDestImg'),bd=$('condoDestBadge');
 if(!img){img=document.createElement('img');img.id='condoDestImg';img.className='lvImg';img.draggable=false;btn.insertBefore(img,btn.firstChild);bd=document.createElement('span');bd.id='condoDestBadge';bd.className='lvBadge';btn.appendChild(bd)}
 const grid=document.querySelector('#ceoSceneChoices .ceoDestGrid');if(grid)grid.querySelectorAll('.lvXtra').forEach(n=>n.remove());
 if(target!=='condo'){img.style.display='none';bd.style.display='none';cv.style.display='';return}
 cv.style.display='none';img.style.display='';bd.style.display='';pend=0;
 if(grid){const row=document.createElement('div');row.className='lvRow lvXtra';const rr=document.createElement('div');rr.className='lvRent';row.appendChild(rr);grid.appendChild(row)}
 paint();
}
function testWarp(n){const c=st();c.own[n]=1;c.lv=n;try{save(1)}catch(e){}try{TESTX.warp('condo')}catch(e){}}
function unlockAll(){const c=st();[1,2,3].forEach(k=>c.own[k]=1);try{save(1);toast('🔓 ปลดล็อคห้องทุกเลเวล (Test)')}catch(e){}}
function chargeNow(){const r=rentTick(true);try{toast(r?'💸 เก็บค่าเช่าแล้ว -'+fm(r):'ห้องนี้ไม่มีค่าเช่า')}catch(e){}}
window.CONDOROOM={lv,own,setLv,buy,rentOf,rentTick,dialog,testWarp,unlockAll,chargeNow,LV,nextDue,state:st};
})();
