(()=>{'use strict';
const STYLE_ID='hd20NavScrollStabilityStyle',NAV='.beginnerNav button[data-key]';
if(window.HD20NavScrollStability)return;
if(!document.getElementById(STYLE_ID)){
  const s=document.createElement('style');s.id=STYLE_ID;
  s.textContent='html.hd20-nav-switching{scroll-behavior:auto!important}';
  document.head.appendChild(s);
}
let token=0;
function clearHash(){
  if(!location.hash)return;
  try{history.replaceState(history.state,'',location.pathname+location.search)}catch{}
}
function resetTop(id){
  if(id!==token)return;
  const active=document.activeElement;
  if(active&&active!==document.body&&typeof active.blur==='function')active.blur();
  clearHash();
  window.scrollTo(0,0);
  document.documentElement.scrollTop=0;
  if(document.body)document.body.scrollTop=0;
}
function stabilize(){
  const id=++token;
  document.documentElement.classList.add('hd20-nav-switching');
  resetTop(id);
  requestAnimationFrame(()=>requestAnimationFrame(()=>resetTop(id)));
  setTimeout(()=>resetTop(id),40);
  setTimeout(()=>resetTop(id),140);
  setTimeout(()=>resetTop(id),320);
  setTimeout(()=>resetTop(id),520);
  setTimeout(()=>{resetTop(id);if(id===token)document.documentElement.classList.remove('hd20-nav-switching')},760);
}
function onNav(e){
  const b=e.target.closest?.(NAV);if(!b)return;
  stabilize();
}
try{history.scrollRestoration='manual'}catch{}
document.addEventListener('click',onNav,true);
window.HD20NavScrollStability={stabilize,resetTop:()=>{const id=++token;resetTop(id)},selector:NAV};
})();
