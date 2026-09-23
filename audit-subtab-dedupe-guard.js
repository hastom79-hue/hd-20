(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
function classify(el){
  if(!el)return'';
  if(el.matches('.auditDraw,#hd20AuditBatchExecution'))return'draw';
  if(el.matches('.auditClosedLoop'))return'inspect';
  if(el.matches('.audit6m'))return'ongoing';
  if(el.matches('#hd20AuditCloseEvaluation'))return'retention';
  const text=(el.querySelector('.awHead,h2,h3,b')?.textContent||'').trim();
  if(/종료평가/.test(text))return'retention';
  if(/6개월.*유지|유지관리|관리중/.test(text))return'ongoing';
  if(/체크리스트|점검항목|실시결과/.test(text))return'inspect';
  if(/대상.*추출|Risk.*추출/.test(text))return'draw';
  return'';
}
function apply(detail){
  if(detail?.area!=='audit')return;
  const root=$('#awAudit');if(!root)return;
  const sub=['draw','inspect','ongoing','retention'].includes(detail.sub)?detail.sub:'draw';
  root.dataset.canonicalSubview=sub==='retention'?'retention-closure':sub==='ongoing'?'retention-ongoing':sub==='inspect'?'audit-inspect':'audit-draw';
  const lane=root.querySelector(':scope > .awAuditLane');
  if(lane)lane.classList.toggle('hd20SubHidden',sub!=='ongoing');
  $$(':scope > .awCard,:scope > .auditDraw,:scope > .auditClosedLoop,:scope > .audit6m,:scope > section',root).forEach(el=>{
    if(el.classList.contains('awHero')||el.classList.contains('awAuditLane'))return;
    const role=classify(el);if(!role)return;
    el.classList.toggle('hd20SubHidden',role!==sub);
  });
}
window.addEventListener('hd20-subtab-changed',e=>Promise.resolve().then(()=>apply(e.detail)));
function sync(){const s=window.HD20_SUBNAV?.state?.();if(s)apply(s)}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(sync,450),{once:true}):setTimeout(sync,450);
['hd20-audit-draw','hd20-audit-updated','hd20-action-updated'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(sync,30)));
})();
