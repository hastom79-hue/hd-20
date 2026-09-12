(()=>{'use strict';
const KEY='hd20OperatingPolicyV1';
const DEFAULT={auditRisk:{enabled:false,weights:null,sampleCount:null},improvementDeadline:{minDays:7,maxDays:14,defaultDays:null}};
function read(){try{const raw=JSON.parse(localStorage.getItem(KEY)||'{}');return{auditRisk:{...DEFAULT.auditRisk,...(raw.auditRisk||{})},improvementDeadline:{...DEFAULT.improvementDeadline,...(raw.improvementDeadline||{})}}}catch{return structuredClone(DEFAULT)}}
function write(next){const cur=read(),v={auditRisk:{...cur.auditRisk,...(next.auditRisk||{})},improvementDeadline:{...cur.improvementDeadline,...(next.improvementDeadline||{})}};localStorage.setItem(KEY,JSON.stringify(v));window.dispatchEvent(new CustomEvent('hd20-policy-updated',{detail:v}));return v}
function deadlineDays(){const p=read().improvementDeadline,n=Number(p.defaultDays);return Number.isFinite(n)&&n>=p.minDays&&n<=p.maxDays?Math.round(n):null}
function riskWeights(){const p=read().auditRisk,w=p.weights;if(!p.enabled||!w||typeof w!=='object')return null;const keys=['previousMonth','cumulative','overdue','recurrence'],out={};for(const k of keys){const n=Number(w[k]);if(!Number.isFinite(n)||n<0)return null;out[k]=n}const weak=w.maturityWeak==null||w.maturityWeak===''?0:Number(w.maturityWeak);if(!Number.isFinite(weak)||weak<0)return null;out.maturityWeak=weak;return out}
function auditSampleCount(){const n=Number(read().auditRisk.sampleCount);return Number.isInteger(n)&&n>=1?n:null}
window.HD20PolicyConfig={KEY,DEFAULT,read,write,deadlineDays,riskWeights,auditSampleCount};
})();