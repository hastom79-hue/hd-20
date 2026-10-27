(()=>{'use strict';
const criteria=['CriteriaVisual','CriteriaGreen','CriteriaSpace'];
function evaluate(root,prefix){const flags=criteria.map(k=>!!root.querySelector('#'+prefix+k)?.checked);const count=flags.filter(Boolean).length;const yes=count>=1;return{criteriaVisual:flags[0],criteriaGreen:flags[1],criteriaSpace:flags[2],visualization:flags[0],greenZone:flags[1],spaceUtilization:flags[2],criteriaMatched:count,judgeState:yes?'충족':'미충족',confirmed:yes,judgedAt:new Date().toISOString(),judgementBasis:'5S 고도화 3대 요건 중 1개 이상 충족'}}
function bind(root,prefix){const inputs=criteria.map(k=>root.querySelector('#'+prefix+k)).filter(Boolean),out=root.querySelector('#'+prefix+'CriteriaResult');const update=()=>{const n=inputs.filter(x=>x.checked).length;if(out)out.textContent=(n?'충족':'미충족')+' ('+n+'/3)'};inputs.forEach(x=>x.addEventListener('change',update));update()}
window.HD20DirectCriteria={evaluate,bind};
})();