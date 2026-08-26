(()=>{
const TRENDS=[
 {delta:'↑ 0.18',labels:['25Q1','25Q2','25Q3','25Q4','26Q1','26Q2'],values:[1.74,2.10,1.82,2.31,2.18,2.36]},
 {delta:'↑ 3건',labels:['25Q1','25Q2','25Q3','25Q4','26Q1','26Q2'],values:[7,12,9,16,11,14]},
 {delta:'↑ 2곳',labels:['25Q1','25Q2','25Q3','25Q4','26Q1','26Q2'],values:[1,4,2,6,3,5]},
 {delta:'↑ 4곳',labels:['25Q1','25Q2','25Q3','25Q4','26Q1','26Q2'],values:[10,16,14,21,20,24]},
 {delta:'↑ 2곳',labels:['25Q1','25Q2','25Q3','25Q4','26Q1','26Q2'],values:[12,18,15,21,18,20]}
];
function points(values){const min=Math.min(...values),max=Math.max(...values),span=max-min||1;return values.map((v,i)=>{const x=2+(i/(values.length-1))*96,y=20-((v-min)/span)*17;return `${x.toFixed(1)},${y.toFixed(1)}`}).join(' ')}
function trendMarkup(d){const title=d.labels.map((q,j)=>`${q}: ${d.values[j]}`).join(' / ');return `<strong>${d.delta}</strong><span>전분기 대비</span><svg class="kpiSpark" viewBox="0 0 100 24" preserveAspectRatio="none" role="img" aria-label="최근 6개 분기 추이"><title>${title}</title><polyline points="${points(d.values)}"></polyline></svg>`}
function trends(){document.querySelectorAll('.cards .kpi').forEach((el,i)=>{const d=TRENDS[i]||TRENDS[0];let t=el.querySelector('.kpiTrend');if(!t){t=document.createElement('div');t.className='kpiTrend';el.appendChild(t)}t.innerHTML=trendMarkup(d)})}
function wire(){trends();document.querySelectorAll('.cards .kpi,.approvedSummary .asCard,.afCard').forEach(el=>{if(el.dataset.pfx)return;el.dataset.pfx='1';el.addEventListener('pointerdown',e=>{const r=el.getBoundingClientRect(),p=document.createElement('i');p.className='premiumPulse';p.style.left=(e.clientX-r.left)+'px';p.style.top=(e.clientY-r.top)+'px';el.appendChild(p);setTimeout(()=>p.remove(),600)})})}
function boot(){wire();let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;wire()})}).observe(document.body,{childList:true,subtree:true})}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot()})();