(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
function apply(detail){
  if(detail?.area!=='advancement')return;
  const root=$('#performanceConversionAnalysis');if(!root)return;
  const standard=detail.sub==='standard';
  root.dataset.canonicalSubview=standard?'confirmed-rollout':'candidate-judge';
  const stages=$$('.pcStage',root),types=$('.pcTypes',root),criteria=$('.pcCriteriaBanner',root),insight=$('#pcInsight',root);
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
function sync(){const s=window.HD20_SUBNAV?.state?.();if(s)apply(s)}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(sync,300),{once:true}):setTimeout(sync,300);
})();