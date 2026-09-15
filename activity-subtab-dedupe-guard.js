(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s);
function apply(detail){
  if(detail?.area!=='activity')return;
  const root=$('#awActivity');if(!root)return;
  const history=$('[data-live-activity]',root)?.closest('.awCard');
  if(!history)return;
  const table=$('[data-live-activity]',history)?.closest('table');
  const legacyNote=$('[data-hd20-activity-analysis-note]',history);
  legacyNote?.remove();
  if(table)table.classList.toggle('hd20SubHidden',detail.sub==='analysis');
}
window.addEventListener('hd20-subtab-changed',e=>apply(e.detail));
function sync(){const s=window.HD20_SUBNAV?.state?.();if(s)apply(s)}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(sync,250),{once:true}):setTimeout(sync,250);
})();