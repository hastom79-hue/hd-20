(()=>{'use strict';
const criteria=['CriteriaVisual','CriteriaGreen','CriteriaSpace'];
function evaluate(root,prefix){
 const flags=criteria.map(k=>!!root.querySelector('#'+prefix+k)?.checked),count=flags.filter(Boolean).length;
 const master=!!window.HD20MasterAccess?.isMaster();
 const adopted=master&&count>=1&&!!root.querySelector('#'+prefix+'FinalAdopted')?.checked;
 return {criteriaVisual:flags[0],criteriaGreen:flags[1],criteriaSpace:flags[2],
 visualization:flags[0],greenZone:flags[1],spaceUtilization:flags[2],
 criteriaMatched:count,judgeState:count>=1?'충족':'미충족',
 criteriaSatisfied:count>=1,finalAdopted:adopted,advancementAdopted:adopted,confirmed:adopted,
 adoptedBy:adopted?(window.HD20MasterAccess?.email?.()||''):null,
 adoptedAt:adopted?new Date().toISOString():null,
 judgedAt:new Date().toISOString(),judgementBasis:'5S 고도화 3대 요건 중 1개 이상 충족'};
}
function bind(root,prefix){
 const inputs=criteria.map(k=>root.querySelector('#'+prefix+k)).filter(Boolean);
 const out=root.querySelector('#'+prefix+'CriteriaResult'),panel=root.querySelector('#'+prefix+'FinalAdoptionRow');
 const cb=root.querySelector('#'+prefix+'FinalAdopted');
 const update=()=>{
  const n=inputs.filter(x=>x.checked).length,master=!!window.HD20MasterAccess?.isMaster();
  if(out)out.textContent=(n?'충족':'미충족')+' ('+n+'/3)';
  if(panel){panel.hidden=!master;panel.style.display=master?'flex':'none'}
  if(cb){cb.disabled=!master||n===0;cb.checked=master&&n>=1}
 };
 inputs.forEach(x=>x.addEventListener('change',update));
 if(cb)cb.addEventListener('change',update);
 window.addEventListener('hd20-master-access-updated',update);
 update();
}
window.HD20DirectCriteria={evaluate,bind};
})();