(function(){var dn=null,dt=0;
addEventListener('pointerdown',function(e){dn=e.target;dt=Date.now()},true);
addEventListener('click',function(e){var t=e.target;
 if(!dn||Date.now()-dt>2500||t===dn||!t||t===document.body||t===document.documentElement)return;
 try{var c=getComputedStyle(t);
  if(c.position==='fixed'&&t.offsetWidth>=innerWidth*.95&&t.offsetHeight>=innerHeight*.95&&dn instanceof Node&&!t.contains(dn)){e.stopImmediatePropagation();e.preventDefault()}}catch(_){}
},true)})();