(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
function classify(el){
  if(!el)return'';
  if(el.id==='hd20ActionVerifyStatus')return'verify';
  if(el.matches('.amSummary,.amGrid,.amMaster,.amRecentList,.amCasesScroll'))return'manage';
  const text=(el.querySelector('.amHead,.amHead2,.awHead,h2,h3,b')?.textContent||el.textContent||'').trim().slice(0,180);
  if(/효과검증|효과·재발|재발관리|재발확인|검증대기|폐쇄루프/.test(text))return'verify';
  if(/개선요청|개선조치|생산팀장 기준정보|조치기한|등록된 개선|Action Case|개선실행/.test(text))return'manage';
  return'';
}
function setVisible(el,on){if(el)el.classList.toggle('hd20SubHidden',!on)}
function apply(detail){
  if(detail?.area!=='action')return;
  const root=$('#awAction');if(!root)return;
  const verify=detail.sub==='verify';
  root.dataset.canonicalSubview=verify?'effect-recurrence':'action-management';
  $$(':scope > .amSummary,:scope > .amGrid,:scope > .amMaster,:scope > .amRecentList,:scope > .amCasesScroll,:scope > .amCard,:scope > section',root).forEach(el=>{
    if(el.classList.contains('awHero'))return;
    const role=classify(el);if(!role)return;
    setVisible(el,verify?role==='verify':role==='manage');
  });
  const verifyHost=$('#hd20ActionVerifyStatus');setVisible(verifyHost,verify);
  const manageForm=$('.amRegisterFormCard',root);setVisible(manageForm,!verify);
  const nativeSummary=$(':scope > .amSummary',root);setVisible(nativeSummary,!verify);
  const nativeGrid=$(':scope > .amGrid',root);setVisible(nativeGrid,!verify);
  const nativeMaster=$(':scope > .amMaster',root);setVisible(nativeMaster,!verify);
  const nativeRecent=$(':scope > .amRecentList',root);setVisible(nativeRecent,!verify);
  const nativeCases=$(':scope > .amCasesScroll',root);setVisible(nativeCases,!verify);
}
window.addEventListener('hd20-subtab-changed',e=>setTimeout(()=>apply(e.detail),0));
function sync(){const s=window.HD20_SUBNAV?.state?.();if(s)apply(s)}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(sync,500),{once:true}):setTimeout(sync,500);
['hd20-action-updated','hd20-audit-updated','hd20-refresh-requested'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(sync,30)));
})();