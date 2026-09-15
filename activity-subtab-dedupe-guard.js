(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s);
function apply(detail){
  if(detail?.area!=='activity')return;
  const root=$('#awActivity');if(!root)return;
  const history=$('[data-live-activity]',root)?.closest('.awCard');
  if(!history)return;
  const table=$('[data-live-activity]',history)?.closest('table');
  let note=$('[data-hd20-activity-analysis-note]',history);
  if(!note){note=document.createElement('div');note.dataset.hd20ActivityAnalysisNote='1';note.className='awHint';note.innerHTML='<b>실적분석</b>은 집계 KPI와 추이 판단에 집중합니다. 개별 원천 활동은 「활동관리」 또는 「상세 데이터 그리드」에서 확인합니다.';table?.insertAdjacentElement('beforebegin',note)}
  const analysis=detail.sub==='analysis';
  if(table)table.classList.toggle('hd20SubHidden',analysis);
  if(note)note.classList.toggle('hd20SubHidden',!analysis);
}
window.addEventListener('hd20-subtab-changed',e=>apply(e.detail));
function sync(){const s=window.HD20_SUBNAV?.state?.();if(s)apply(s)}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(sync,250),{once:true}):setTimeout(sync,250);
})();