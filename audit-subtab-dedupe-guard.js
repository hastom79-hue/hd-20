(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
function classify(el){
  if(!el)return'';
  if(el.matches('.auditDraw,.auditClosedLoop,#hd20AuditBatchExecution'))return'audit';
  if(el.matches('.audit6m,#hd20AuditCloseEvaluation'))return'retention';
  const text=(el.querySelector('.awHead,h2,h3,b')?.textContent||'').trim();
  if(/종료평가|6개월.*유지|유지관리/.test(text))return'retention';
  if(/대상.*추출|Audit 실시|실시결과|체크리스트/.test(text))return'audit';
  return'';
}
function apply(detail){
  if(detail?.area!=='audit')return;
  const root=$('#awAudit');if(!root)return;
  const retention=detail.sub==='retention';
  root.dataset.canonicalSubview=retention?'retention-six-month':'audit-execution';
  const lane=root.querySelector(':scope > .awAuditLane');
  if(lane)lane.classList.toggle('hd20SubHidden',!retention);
  $$(':scope > .awCard,:scope > .auditDraw,:scope > .auditClosedLoop,:scope > .audit6m,:scope > section',root).forEach(el=>{
    if(el.classList.contains('awHero')||el.classList.contains('awAuditLane'))return;
    const role=classify(el);if(!role)return;
    el.classList.toggle('hd20SubHidden',retention?role==='audit':role==='retention');
  });
}
window.addEventListener('hd20-subtab-changed',e=>setTimeout(()=>apply(e.detail),0));
function sync(){const s=window.HD20_SUBNAV?.state?.();if(s)apply(s)}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(sync,450),{once:true}):setTimeout(sync,450);
['hd20-audit-draw','hd20-audit-updated','hd20-action-updated'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(sync,30)));
})();