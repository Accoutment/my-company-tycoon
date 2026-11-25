(function(){
var css=document.createElement('style');css.textContent='#projHud{position:fixed;left:8px;top:236px;z-index:30;width:196px;max-width:42vw;pointer-events:none;display:none;font:600 11px/1.25 "Noto Sans Thai",system-ui,sans-serif;color:#e8f0ff;text-shadow:0 1px 2px #000}#projHud .ph{background:rgba(13,21,48,.82);border:2px solid #3a5a9a;border-radius:8px;padding:4px 6px 5px;box-shadow:0 2px 0 #0a1230}#projHud .pt{font-size:10px;color:#9fc4ff;letter-spacing:.3px;margin-bottom:2px}#projHud .pr{margin-top:3px}#projHud .pn{display:flex;justify-content:space-between;gap:6px}#projHud .pn b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:700}#projHud .pn i{font-style:normal;color:#8fd0ff;white-space:nowrap}#projHud .bx{height:8px;background:#0a1230;border:1px solid #2c4a86;border-radius:5px;overflow:hidden;margin-top:2px}#projHud .bx>div{height:100%;background:linear-gradient(#7fd0ff,#2f8cff);box-shadow:0 0 6px #2f8cff;transition:width .4s}@media (max-height:460px){#projHud{top:170px;width:170px}}';
document.head.appendChild(css);
function inOffice(){try{return S&&Array.isArray(S.emp)&&S.emp.some(function(e){return e&&e.st!=='home'&&e.st!=='errandWait'})}catch(_){return false}}
function upd(){var d=document.getElementById('projHud');
 if(!d){if(!document.body)return;d=document.createElement('div');d.id='projHud';document.body.appendChild(d)}
 var show=false;try{
  var lobby=document.getElementById('lobby'),sc=document.getElementById('ceoScene');
  show=typeof S!=='undefined'&&S&&!S.over&&inOffice()&&!(lobby&&lobby.style.display!=='none'&&lobby.offsetParent!==null)&&!(sc&&sc.classList.contains('show'))&&!(typeof CUT!=='undefined'&&CUT.on)
 }catch(_){}
 if(!show){d.style.display='none';return}
 var P=S.projects||[],h='<div class="ph"><div class="pt">📊 โปรเจกต์ที่กำลังทำ</div>';
 if(!P.length)h+='<div class="pr"><div class="pn"><b>ยังไม่มีโปรเจกต์</b></div><div class="bx"><div style="width:0%"></div></div></div>';
 P.slice(0,3).forEach(function(p){var tot=0,dn=0;for(var k in p.need){tot+=p.need[k];dn+=Math.min(p.done[k]||0,p.need[k])}
  var pc=tot?Math.max(0,Math.min(100,Math.round(dn/tot*100))):0;
  h+='<div class="pr"><div class="pn"><b>'+String(p.n).replace(/[<>&]/g,'')+'</b><i>'+pc+'%</i></div><div class="bx"><div style="width:'+pc+'%"></div></div></div>'});
 if(P.length>3)h+='<div class="pr pt">+'+(P.length-3)+'</div>';
 h+='</div>';if(d.__h!==h){d.innerHTML=h;d.__h=h}d.style.display='block'}
setInterval(upd,400)})();