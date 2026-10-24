(()=>{'use strict';
// In-memory event bridge: refresh views, never rewrite saved production data.
let queued=false;
const changes=['hd20-action-updated','hd20-audit-updated','hd20-audit-draw','hd20-activity-updated','hd20-kpi-source-updated','hd20-gmes-5s-imported','hd20-gmes-5s-judged','hd20-team-master-updated','hd20-team-targets-updated','hd20-master-factors-updated','hd20-policy-updated','hd20-mailing-master-updated'];
function refresh(){
 if(queued)return;
 queued=true;
 setTimeout(()=>{
  queued=false;
  window.dispatchEvent(new CustomEvent('hd20-refresh-requested',{detail:{origin:'cross-tab-sync'}}));
  if(document.body.classList.contains('hd20InquiryActive')&&!document.getElementById('hd20Launcher')){
   try{window.HD20_LAUNCHER?.renderOverview?.()}catch(err){console.warn('[HD20 sync overview]',err)}
  }
 },90);
}
changes.forEach(name=>window.addEventListener(name,refresh));
window.addEventListener('storage',e=>{if(e.storageArea===localStorage)refresh()});
window.HD20_CROSS_TAB_SYNC={requestRefresh:refresh,events:changes.slice()};
})();