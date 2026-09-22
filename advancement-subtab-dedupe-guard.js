(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
function apply(detail){
  if(detail?.area!=='advancement')return;
  const root=$('#performanceConversionAnalysis');if(!root)return;
  const sub=detail.sub==='analysis'||detail.sub==='standard'?detail.sub:'judge';
  root.dataset.canonicalSubview=sub==='standard'?'confirmed-rollout':sub==='analysis'?'three-criteria-analysis':'candidate-judge';
  const mca=document.getElementById('hd20MaturityConditionAnalysis');
  const work=document.getElementById('awWorkplace');
  const stages=$$('.pcStage',root),types=$('.pcTypes',root),criteria=$('.pcCriteriaBanner',root),insight=$('#pcInsight',root);
  if(mca)mca.classList.toggle('hd20SubHidden',sub!=='analysis');
  if(work)work.classList.toggle('hd20SubHidden',sub==='analysis');
  if(sub==='analysis'){
    stages.forEach(stage=>stage.classList.add('hd20SubHidden'));
    if(criteria)criteria.classList.add('hd20SubHidden');
    if(types)types.classList.add('hd20SubHidden');
    if(insight)insight.classList.add('hd20SubHidden');
    return;
  }
  const standard=sub==='standard';
  stages.forEach(stage=>{
    const key=stage.dataset.stage||'';
    const show=standard?(key==='confirmed'||key==='maintained'):true;
    stage.classList.toggle('hd20SubHidden',!show);
  });
  if(criteria)criteria.classList.toggle('hd20SubHidden',standard);
  if(types)types.classList.toggle('hd20SubHidden',standard);
  if(insight)insight.classList.toggle('hd20SubHidden',standard);
}
window.addEventListener('hd20-subtab-changed',e=>apply(e.detail));
window.addEventListener('hd20-kpi-source-updated',()=>{const s=window.HD20_SUBNAV?.state?.();if(s)setTimeout(()=>apply(s),0)});
function sync(){const s=window.HD20_SUBNAV?.state?.();if(s)apply(s)}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(sync,300),{once:true}):setTimeout(sync,300);
})();
