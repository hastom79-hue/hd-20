(()=>{'use strict';
const TAB='maturitymap',ROOT='#hd20MaturityMapTab';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
function active(){return window.HD20_NAV?.active?.()===TAB||new URL(location.href).searchParams.get('tab')===TAB}
function ensureOpen(){let n=0;const tick=()=>{if(!active())return;const api=window.HD20_MATURITY_MAP_TAB,root=$(ROOT);if(api?.open&&root){if(!root.classList.contains('on'))api.open();sortCases();return}if(++n<30)setTimeout(tick,50)};tick()}
function dateKey(card){const t=card.querySelector('small')?.textContent||'';const m=t.match(/\d{4}-\d{2}-\d{2}/);return m?.[0]||''}
function sortCases(){const root=$(ROOT);if(!root)return false;$$('.mmtTeamCases',root).forEach(box=>{const rows=$$('.mmtCase',box);rows.sort((a,b)=>dateKey(b).localeCompare(dateKey(a))).forEach(x=>box.appendChild(x))});const hint=$('.mmtCaseCard .mmtHead span',root);if(hint)hint.textContent='팀 선택 → 최신 판정순 Case 상세';return true}
function validate(){const nav=$$('.beginnerNav button[data-key]'),root=$(ROOT);return{navCount:nav.length,hasMapNav:!!$('.beginnerNav button[data-key="maturitymap"]'),mapReady:!!window.HD20_MATURITY_MAP_TAB,mapVisible:!!root?.classList.contains('on'),sorted:!!root&&$$('.mmtTeamCases',root).every(box=>{const keys=$$('.mmtCase',box).map(dateKey).filter(Boolean);return keys.every((v,i)=>i===0||keys[i-1]>=v)})}}
document.addEventListener('click',e=>{if(e.target.closest?.('.beginnerNav button[data-key="maturitymap"]'))setTimeout(ensureOpen,0)},true);
window.addEventListener('hd20-open-maturity-map-tab',()=>setTimeout(ensureOpen,0));
['hd20-kpi-source-updated','hd20-gmes-5s-imported','hd20-gmes-5s-judged','hd20-refresh-requested'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(sortCases,60)));
new MutationObserver(rs=>{if(rs.some(r=>[...r.addedNodes].some(n=>n?.nodeType===1&&(n.matches?.(ROOT)||n.querySelector?.(ROOT)||n.matches?.('.mmtCase')||n.querySelector?.('.mmtCase')))))setTimeout(sortCases,0)}).observe(document.documentElement,{childList:true,subtree:true});
window.HD20_MATURITY_MAP_OPERATIONAL_GUARD={ensureOpen,sortCases,validate};
const boot=()=>{if(active())ensureOpen();setTimeout(sortCases,100)};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();