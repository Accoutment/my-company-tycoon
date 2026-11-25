window.__CEO_ART={f:{atlas:'assets/img/f2e301c81d36.webp',suit:'assets/img/75dc29b5de2a.webp',dragon:'assets/img/723410bdcb5d.webp',wsuit:'assets/img/a9066de7cac8.webp',introSpr:'assets/img/a52cd5df8e49.webp',introCard:'assets/img/287dce062aa2.webp',fish:'assets/img/e0adadae5205.webp'},fish:'assets/img/429c786f4b3d.webp',atlas:'assets/img/49389fcc9b83.webp',suit:'assets/img/5f1ec9c77d98.webp',dragon:'assets/img/3bc9df2fb1fd.webp',wsuit:'assets/img/f58983840260.webp',introSpr:'assets/img/a90de93f2cc6.webp',introCard:'assets/img/e1e4e8fa34fc.webp'};
window.CEOG=(function(){
 var ART=window.__CEO_ART,imgs={m:{},f:{},r:{}},META={m:{"cw": 192, "ch": 192, "ax": [91.7, 97.1, 83.5, 93.2], "ay": [182.7, 179.2, 178.4, 177.5], "h": [170.6, 167.1, 166.2, 168.0]},f:{"cw": 192, "ch": 192, "ax": [100.6, 92.8, 96.2, 96.6], "ay": [178.4, 176.6, 176.6, 175.8], "h": [170.6, 167.1, 164.5, 168.8]}},cur=null;
 function gnd(){try{var q=(typeof S==='object'&&S)?S.ceoGender:'m';return q==='f'?'f':(q==='r'&&window.REI&&REI.skinOk())?'r':'m'}catch(e){return 'm'}}
 function src(g,k){return g==='r'?window.REI_ART[k]:g==='f'?ART.f[k]:ART[k]}
 function im(g,k){var c=imgs[g];if(!c[k]){c[k]=new Image();c[k].src=src(g,k)}return c[k]}
 function outfit(){try{var id=S.ceoOutfitId;return id==='dragon'||id==='wsuit'?id:'suit'}catch(e){return 'suit'}}
 function apply(force){
  var g=gnd();if(g===cur&&!force)return;
  try{ if(typeof CEOI==='undefined')return;
   var s=im(g,'atlas');if(!s.complete||!s.naturalWidth){s.onload=function(){apply(true)};if(cur!==null)return}
   CEOI=s;
   var w=null;try{w=(window.WARD&&WARD.status&&WARD.status().cur)||null}catch(e){}
   CEOP=src(g,w&&src(g,w)?w:outfit());
   cur=g;
  }catch(e){}
 }
 function html(){
  var g=gnd();
  function b(k,label){return '<button type="button" class="cgBtn'+(g===k?' on':'')+'" data-g="'+k+'" aria-pressed="'+(g===k)+'"><img alt="" src="'+src(k,'suit')+'"><span>'+label+'</span></button>'}
  return '<div class="cgBox"><div class="cgT">เลือกตัวละคร</div><div class="cgRow">'+b('m','ผู้ชาย')+b('f','ผู้หญิง')+(window.REI&&REI.skinOk()?b('r','เรย์'):'')+'</div></div>'
 }
 function bind(el,redraw){
  el.querySelectorAll('.cgBtn').forEach(function(b){b.onclick=function(){try{S.ceoGender=b.dataset.g==='f'?'f':b.dataset.g==='r'?'r':'m'}catch(e){};apply();redraw()}})
 }
 setInterval(function(){apply()},150);
 return {apply:apply,html:html,bind:bind,gender:gnd,
  sheet:function(){return im(gnd(),'atlas')},card:function(id){return src(gnd(),id)},
  fishImg:function(){return im(gnd(),'fish')},fishMeta:function(){return gnd()==='r'?window.REI_META:META[gnd()]},
  introSpr:function(){return im(gnd(),'introSpr')},introCard:function(){return im(gnd(),'introCard')}}
})();
