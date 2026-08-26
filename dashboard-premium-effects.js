(()=>{
const TRENDS=[
 {delta:'↑ 0.18',labels:['25Q1','25Q2','25Q3','25Q4','26Q1','26Q2'],values:[1.74,2.10,1.82,2.31,2.18,2.36]},
 {delta:'↑ 3건',labels:['25Q1','25Q2','25Q3','25Q4','26Q1','26Q2'],values:[7,12,9,16,11,14]},
 {delta:'↑ 2곳',labels:['25Q1','25Q2','25Q3','25Q4','26Q1','26Q2'],values:[1,4,2,6,3,5]},
 {delta:'↑ 4곳',labels:['25Q1','25Q2','25Q3','25Q4','26Q1','26Q2'],values:[10,16,14,21,20,24]},
 {delta:'↑ 2곳',labels:['25Q1','25Q2','25Q3','25Q4','26Q1','26Q2'],values:[12,18,15,21,18,20]}
];
function coords(values){const min=Math.min(...values),max=Math.max(...values),span=max-min||1;return values.map((v,i)=>({x:4+(i/(values.length-1))*92,y:25-((v-min)/span)*18,v}))}
function trendMarkup(d){const pts=coords(d.values),title=d.labels.map((q,j)=>`${q}: ${d.values[j]}`).join(' / '),dots=pts.map((p,j)=>`<circle cx="${p.x}" cy="${p.y}" r="1.8"></circle><text x="${p.x}" y="${Math.max(6,p.y-3)}" text-anchor="middle">${d.values[j]}</text>`).join(''),quarters=d.labels.map((q,j)=>`<span>${q}</span>`).join('');return `<div class="kpiTrendTop"><strong>${d.delta}</strong><span>전분기 대비</span></div><svg class="kpiSpark" viewBox="0 0 100 32" preserveAspectRatio="none" role="img" aria-label="최근 6개 분기 추이"><title>${title}</title><polyline points="${pts.map(p=>`${p.x},${p.y}`).join(' ')}"></polyline>${dots}</svg><div class="kpiQuarterLabels">${quarters}</div>`}
function trends(){document.querySelectorAll('.cards .kpi').forEach((el,i)=>{const d=TRENDS[i]||TRENDS[0];let t=el.querySelector('.kpiTrend');if(!t){t=document.createElement('div');t.className='kpiTrend';el.appendChild(t)}t.innerHTML=trendMarkup(d)})}
function wire(){trends();document.querySelectorAll('.cards .kpi,.approvedSummary .asCard,.afCard').forEach(el=>{if(el.dataset.pfx)return;el.dataset.pfx='1';el.addEventListener('pointerdown',e=>{const r=el.getBoundingClientRect(),p=document.createElement('i');p.className='premiumPulse';p.style.left=(e.clientX-r.left)+'px';p.style.top=(e.clientY-r.top)+'px';el.appendChild(p);setTimeout(()=>p.remove(),600)})})}
function boot(){wire();let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;wire()})}).observe(document.body,{childList:true,subtree:true})}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot()})();