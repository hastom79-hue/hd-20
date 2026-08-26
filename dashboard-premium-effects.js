(()=>{
const TRENDS=[
 {delta:'↑ 0.18',labels:['25Q1','25Q2','25Q3','25Q4','26Q1','26Q2'],values:[1.92,2.08,2.01,2.24,2.18,2.36]},
 {delta:'↑ 3건',labels:['25Q1','25Q2','25Q3','25Q4','26Q1','26Q2'],values:[8,11,9,13,11,14]},
 {delta:'↑ 2곳',labels:['25Q1','25Q2','25Q3','25Q4','26Q1','26Q2'],values:[2,4,3,6,3,5]},
 {delta:'↑ 4곳',labels:['25Q1','25Q2','25Q3','25Q4','26Q1','26Q2'],values:[12,15,17,19,20,24]},
 {delta:'↑ 2곳',labels:['25Q1','25Q2','25Q3','25Q4','26Q1','26Q2'],values:[14,17,16,19,18,20]}
];
function points(values){const min=Math.min(...values),max=Math.max(...values),span=max-min||1;return values.map((v,i)=>{const x=(i/(values.length-1))*100,y=15-((v-min)/span)*11;return `${x.toFixed(1)},${y.toFixed(1)}`}).join(' ')}
function trends(){document.querySelectorAll('.cards .kpi').forEach((el,i)=>{if(el.querySelector('.kpiTrend'))return;const d=TRENDS[i]||TRENDS[0],t=document.createElement('div');t.className='kpiTrend';const title=d.labels.map((q,j)=>`${q}: ${d.values[j]}`).join(' / ');t.innerHTML=`<strong>${d.delta}</strong><span>전분기 대비</span><svg class="kpiSpark" viewBox="0 0 100 18" preserveAspectRatio="none" role="img" aria-label="최근 6개 분기 추이"><title>${title}</title><polyline points="${points(d.values)}"></polyline></svg>`;el.appendChild(t)})}
function wire(){trends();document.querySelectorAll('.cards .kpi,.approvedSummary .asCard,.afCard').forEach(el=>{if(el.dataset.pfx)return;el.dataset.pfx='1';el.addEventListener('pointerdown',e=>{const r=el.getBoundingClientRect(),p=document.createElement('i');p.className='premiumPulse';p.style.left=(e.clientX-r.left)+'px';p.style.top=(e.clientY-r.top)+'px';el.appendChild(p);setTimeout(()=>p.remove(),600)})})}
function boot(){wire();let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;wire()})}).observe(document.body,{childList:true,subtree:true})}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot()})();