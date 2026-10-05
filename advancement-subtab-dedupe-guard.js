(()=>{'use strict';
/* RC ownership guard: hd20-subtabs.js is the single source of truth for advancement
   panel visibility. This guard only prevents legacy workplace content from being
   resurrected by older refresh/update paths. */
function apply(detail){
  if(detail?.area!=='advancement')return;
  const work=document.getElementById('awWorkplace');
  if(work){work.classList.remove('on');work.classList.add('hd20SubHidden')}
}
window.addEventListener('hd20-subtab-changed',e=>apply(e.detail));
window.addEventListener('hd20-kpi-source-updated',()=>{const s=window.HD20_SUBNAV?.state?.();if(s)setTimeout(()=>apply(s),0)});
function sync(){const s=window.HD20_SUBNAV?.state?.();if(s)apply(s)}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(sync,300),{once:true}):setTimeout(sync,300);
})();
