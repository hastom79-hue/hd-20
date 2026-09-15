(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
function classify(el){
  if(!el)return'';
  if(el.id==='hd20ActionVerifyStatus')return'verify';
  if(el.matches('.amSummary,.amGrid,.amMaster,.amRecentList,.amCasesScroll'))return'manage';
  const text=(el.querySelector('.amHead,.amHead2,.awHead,h2,h3,b')?.textContent||el.textContent||'').trim().slice(0,160);
  if(/효과검증|효과·재발|재발관리|재발확인/.test(text))return'verify';
  if(/개선요청|개선조치|생산팀장 기준정보|조치기한|등록된 개선/.test(text))return'manage';
  return'';
}
function apply(detail){
  if(detail?.area!=='action')return;
  const root=$('#awAction');if(!root)return;
  const verify=detail.sub==='verify';
  root.dataset.canonicalSubview=verify?'effect-recurrence':'action-management';
  $$(':scope > .amSummary,:scope > .amGrid,:scope > .amMaster,:scope > .amRecentList,:scope > .amCasesScroll,:scope > .amCard,:scope > section',root).forEach(el=>{
    if(el.classList.contains('awHero'))return;
    const role=classify(el);if(!role)return;
    el.classList.toggle('hd20SubHidden',verify?role==='manage':role==='verify');
  });
  const verifyHost=$('#hd20ActionVerifyStatus');if(verifyHost)verifyHost.classList.toggle('hd20SubHidden',!verify);
}
window.addEventListener('hd20-subtab-changed',e=>setTimeout(()=>apply(e.detail),0));
function sync(){const s=window.HD20_SUBNAV?.state?.();if(s)apply(s)}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(sync,500),{once:true}):setTimeout(sync,500);
['hd20-action-updated','hd20-audit-updated','hd20-refresh-requested'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(sync,30)));
})();