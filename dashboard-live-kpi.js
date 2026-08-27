(()=>{'use strict';
const KEY='hd20GMES5SAutoImproveRawV1';
const load=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
const confirmed=()=>load().filter(x=>x&&x.confirmed===true&&x.judgeState==='확정');
function setText(el,v){if(el)el.textContent=v}
function update(){const rows=confirmed(),follow=window.HD20MaturityFollowup?.summary?.();
 const cards=[...document.querySelectorAll('.cards .kpi')];const byLabel=l=>cards.find(c=>(c.querySelector('small')?.textContent||'').includes(l));
 const cumulative=rows.length;const current=rows.filter(x=>x.maintainState!=='해제'&&x.valid!==false).length;
 const cum=byLabel('누적 고도화 작업장 확보')?.querySelector('b');const cur=byLabel('현재 유지 작업장')?.querySelector('b');if(cum)cum.innerHTML=`${cumulative}<span class="unit">곳</span>`;if(cur)cur.innerHTML=`${current}<span class="unit">곳</span>`;
 const auditTitle=[...document.querySelectorAll('.cardHead h2')].find(x=>x.textContent.includes('고도화 유지상태'));if(auditTitle){const sm=auditTitle.querySelector('small');setText(sm,`(누적 ${cumulative}곳)`)}
 const drows=[...document.querySelectorAll('.dlist .drow')];const counts={six:follow?.six?.length??0,three:follow?.three?.length??0,one:follow?.one?.length??0};[['6개월',counts.six],['3개월',counts.three],['1개월',counts.one]].forEach(([label,n])=>{const r=drows.find(x=>x.textContent.includes(label));const b=r?.querySelector('b');if(b)setText(b,`${n}곳${cumulative?` (${(n/cumulative*100).toFixed(1)}%)`:''}`)});
 const action=[...document.querySelectorAll('.actionList .actionRow')];const pending=load().filter(x=>x&&!x.confirmed&&x.judgeState!=='확정').length;[['판정 대기',`${pending}건`],['1개월 정기점검 대상',`${counts.one}곳`],['3개월 AUDIT 대상',`${counts.three}곳`],['6개월 AUDIT 대상',`${counts.six}곳`]].forEach(([label,v])=>{const r=action.find(x=>x.textContent.includes(label));setText(r?.querySelector('b'),v)});
 document.documentElement.dataset.hd20LiveKpi='1';window.HD20DashboardLiveKPI={source:KEY,cumulative,current,pending,...counts};return true}
 function boot(){update();requestAnimationFrame(update);['hd20-followup-updated','hd20-gmes-5s-judged','hd20-gmes-5s-imported'].forEach(e=>window.addEventListener(e,update));window.addEventListener('storage',e=>{if(e.key===KEY)update()})}document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();})();