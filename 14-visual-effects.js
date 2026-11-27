// Visual particle effects module.
(function(){
  function decorate(card){
    if(!card || card.querySelector(':scope > .rm-neon-binary-layer')) return;
    const layer=document.createElement('div'); layer.className='rm-neon-binary-layer';
    const positions=[[9,18],[24,13],[43,20],[65,14],[86,19],[15,39],[34,34],[56,42],[76,36],[92,44],[8,63],[27,70],[47,60],[68,72],[87,65],[18,86],[40,82],[61,89],[79,84],[51,28],[32,51],[72,55],[12,78],[94,28]];
    positions.forEach((pos,i)=>{const d=document.createElement('span');d.className='rm-neon-binary-digit';d.textContent=i%2?'1':'0';d.style.left=pos[0]+'%';d.style.top=pos[1]+'%';d.style.animationDelay=((i%6)*.13)+'s';layer.appendChild(d);});
    card.insertBefore(layer,card.firstChild);
    const digits=layer.children; let flip=false;
    const timer=setInterval(()=>{if(!card.isConnected){clearInterval(timer);return;}flip=!flip;for(let i=0;i<digits.length;i++) digits[i].textContent=((i%2) ^ (flip?1:0))?'1':'0';},650);
  }
  function scan(){document.querySelectorAll('.member-card.decor-neon-matrix,.card-box.decor-neon-matrix').forEach(decorate);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan);else scan();
  new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true});
})();
