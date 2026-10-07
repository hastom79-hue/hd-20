(()=>{'use strict';
const OWNERS={judge:'hd20AdvJudgeOperational',analysis:'hd20AdvAnalysisOperational',detail:'hd20AdvDetailOperational',process:'hd20AdvProcessOperational',standard:'hd20AdvStandardOperational',map:'hd20MaturityMapTab'};
let applying=false;
function current(){try{return window.HD20_SUBNAV?.state?.()||{}}catch{return {}}}
function visible(el,on){if(!el)return;el.hidden=!on;el.classList.toggle('hd20SubHidden',!on);el.classList.toggle('hd20AdvOwnerHidden',!on);if(on){el.style.setProperty('display','block','important');el.style.setProperty('visibility','visible','important')}else{el.style.setProperty('display','none','important')}}
function enforce(){if(applying)return;const s=current();if(s.area!=='advancement')return;applying=true;try{Object.entries(OWNERS).forEach(([key,id])=>visible(document.getElementById(id),key===s.sub));const legacy=document.getElementById('awWorkplace');if(legacy)visible(legacy,false)}finally{applying=false}}
function settle(){enforce();queueMicrotask(enforce);requestAnimationFrame(enforce);setTimeout(enforce,40);setTimeout(enforce,180)}
function hook(){const api=window.HD20_SUBNAV;if(api?.select&&!api.select.__hd20OwnerGuard){const original=api.select.bind(api);const wrapped=function(...args){const out=original(...args);settle();return out};wrapped.__hd20OwnerGuard=true;api.select=wrapped}settle()}
const observer=new MutationObserver(muts=>{if(applying)return;const s=current();if(s.area!=='advancement')return;if(muts.some(m=>m.type==='attributes'&&m.target?.id&&Object.values(OWNERS).includes(m.target.id)))queueMicrotask(enforce)});
function start(){hook();observer.observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['class','style','hidden']});document.addEventListener('hd20:subnav-change',settle);document.addEventListener('hd20:kpi-refresh',settle);setTimeout(hook,250)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
