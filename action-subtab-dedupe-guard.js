(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
function classify(el){
  if(!el)return'';
  if(el.id==='hd20ActionVerifyStatus')return'verify';
  if(el.matches('.amMaster'))return'master';
  if(el.matches('.hd20LtWrap'))return'leadtime';
  if(el.matches('.amSummary,.amGrid,.amRecentList,.amCasesScroll'))return'manage';
  const text=(el.querySelector('.amHead,.amHead2,.awHead,h2,h3,b')?.textContent||el.textContent||'').trim().slice(0,180);
  if(/효과검증|효과·재발|재발관리|재발확인|검증대기|폐쇄루프/.test(text))return'verify';
  if(/생산팀장 기준정보/.test(text))return'master';
  if(/Lead Time/.test(text))return'leadtime';
  if(/개선요청|개선조치|조치기한|등록된 개선|Action Case|개선실행/.test(text))return'manage';
  return'';
}
function apply(detail){
  if(detail?.area!=='action')return;
  const root=$('#awAction');if(!root)return;
  const sub=['leadtime','master','verify'].includes(detail.sub)?detail.sub:'manage';
  root.dataset.canonicalSubview=sub==='verify'?'effect-recurrence':sub==='master'?'team-leader-master':sub==='leadtime'?'leadtime-analysis':'action-management';
  $$(':scope > .amSummary,:scope > .amGrid,:scope > .amMaster,:scope > .amRecentList,:scope > .amCasesScroll,:scope > .amCard,:scope > .hd20LtWrap,:scope > section',root).forEach(el=>{
    if(el.classList.contains('awHero'))return;
    const role=classify(el);if(!role)return;
    el.classList.toggle('hd20SubHidden',role!==sub);
  });
  const verifyHost=$('#hd20ActionVerifyStatus');if(verifyHost)verifyHost.classList.toggle('hd20SubHidden',sub!=='verify');
  const manageForm=$('.amRegisterFormCard',root);if(manageForm)manageForm.classList.toggle('hd20SubHidden',sub!=='manage');
  const nativeSummary=$(':scope > .amSummary',root);if(nativeSummary)nativeSummary.classList.toggle('hd20SubHidden',sub!=='manage');
  const nativeGrid=$(':scope > .amGrid',root);if(nativeGrid)nativeGrid.classList.toggle('hd20SubHidden',sub!=='manage');
  const nativeMaster=$(':scope > .amMaster',root);if(nativeMaster)nativeMaster.classList.toggle('hd20SubHidden',sub!=='master');
  const nativeLt=$(':scope > .hd20LtWrap',root);if(nativeLt)nativeLt.classList.toggle('hd20SubHidden',sub!=='leadtime');
  const nativeRecent=$(':scope > .amRecentList',root);if(nativeRecent)nativeRecent.classList.toggle('hd20SubHidden',sub!=='manage');
  const nativeCases=$(':scope > .amCasesScroll',root);if(nativeCases)nativeCases.classList.toggle('hd20SubHidden',sub!=='manage');
}
window.addEventListener('hd20-subtab-changed',e=>Promise.resolve().then(()=>apply(e.detail)));
function sync(){const s=window.HD20_SUBNAV?.state?.();if(s)apply(s)}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(sync,500),{once:true}):setTimeout(sync,500);
['hd20-action-updated','hd20-audit-updated','hd20-refresh-requested'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(sync,30)));
})();
