const completionMonthly={
  '2025-10':{'조립1팀':[12,10],'Rear조립팀':[10,8],'가공1팀':[11,10],'자재운영팀':[8,6],'생산관리팀':[7,5]},
  '2025-11':{'조립1팀':[14,12],'Rear조립팀':[11,9],'가공1팀':[12,11],'자재운영팀':[9,7],'생산관리팀':[8,6]},
  '2025-12':{'조립1팀':[13,11],'Rear조립팀':[12,10],'가공1팀':[13,12],'자재운영팀':[10,8],'생산관리팀':[9,7]},
  '2026-01':{'조립1팀':[14,12],'Rear조립팀':[11,9],'가공1팀':[13,12],'자재운영팀':[10,8],'생산관리팀':[9,7]},
  '2026-02':{'조립1팀':[15,13],'Rear조립팀':[12,10],'가공1팀':[14,13],'자재운영팀':[10,8],'생산관리팀':[9,7]},
  '2026-03':{'조립1팀':[16,14],'Rear조립팀':[12,10],'가공1팀':[15,14],'자재운영팀':[11,8],'생산관리팀':[10,8]}
};
const completionTeams=['조립1팀','Rear조립팀','가공1팀','자재운영팀','생산관리팀'];
function completionMonthLabel(v){const [y,m]=v.split('-');return `${y}년 ${m}월`}
function completionMonthsBetween(from,to){return Object.keys(completionMonthly).filter(m=>m>=from&&m<=to).sort()}
function aggregateCompletion(months){const result={};completionTeams.forEach(t=>result[t]=[0,0]);months.forEach(m=>{const row=completionMonthly[m]||{};completionTeams.forEach(t=>{const v=row[t]||[0,0];result[t][0]+=v[0];result[t][1]+=v[1]})});return result}
function renderCompletion(){
  const mode=document.getElementById('completionMode')?.value||'month';
  const baseMonth=document.getElementById('monthFilter')?.value||'2026-03';
  const range=document.getElementById('completionRange');
  let months=[],label='';
  if(mode==='month'){
    range?.classList.remove('show');
    months=[completionMonthly[baseMonth]?baseMonth:'2026-03'];
    label=`${completionMonthLabel(months[0])} · 당월 요청건수 대비 완료건수`;
  }else if(mode==='cumulative'){
    range?.classList.remove('show');
    months=Object.keys(completionMonthly).filter(m=>m<=baseMonth).sort();
    if(!months.length) months=[Object.keys(completionMonthly).sort()[0]];
    label=`${completionMonthLabel(months[0])} ~ ${completionMonthLabel(months[months.length-1])} · 누적 기준`;
  }else{
    range?.classList.add('show');
    const from=document.getElementById('completionFrom')?.value||'2026-01';
    const to=document.getElementById('completionTo')?.value||'2026-03';
    months=completionMonthsBetween(from,to);
    if(!months.length) months=['2026-03'];
    label=`${completionMonthLabel(from)} ~ ${completionMonthLabel(to)} · 선택기간 기준`;
  }
  const data=aggregateCompletion(months);
  const totalReq=completionTeams.reduce((s,t)=>s+data[t][0],0);
  const totalDone=completionTeams.reduce((s,t)=>s+data[t][1],0);
  const totalOpen=totalReq-totalDone;
  const rate=totalReq?totalDone/totalReq*100:0;
  document.getElementById('completionPeriodLabel').textContent=label;
  document.getElementById('completionRequested').textContent=totalReq;
  document.getElementById('completionDone').textContent=totalDone;
  document.getElementById('completionOpen').textContent=totalOpen;
  document.getElementById('completionRate').textContent=`${rate.toFixed(1)}%`;
  document.getElementById('completionFormula').textContent=`${totalDone} ÷ ${totalReq} × 100`;
  const kpi=document.getElementById('completionKpiValue');
  const meta=document.getElementById('completionKpiMeta');
  if(kpi)kpi.textContent=`${rate.toFixed(1)}%`;
  if(meta)meta.textContent=`${mode==='month'?'당월':mode==='cumulative'?'누적':'기간'} ${totalDone} / ${totalReq}건 완료`;
  const chart=document.getElementById('completionTeamChart');
  if(chart){
    chart.innerHTML=completionTeams.map(team=>{
      const [req,done]=data[team];
      const open=req-done;
      const pct=req?done/req*100:0;
      return `<div class="completion-row"><div class="completion-team"><strong>${team}</strong><span>${done}/${req}건 완료 · 미결 ${open}건</span></div><div class="completion-bar"><span class="completion-done" style="width:${pct}%"></span><span class="completion-open" style="width:${100-pct}%"></span></div><div class="completion-pct">${pct.toFixed(1)}%</div></div>`;
    }).join('');
  }
}

document.getElementById('completionMode')?.addEventListener('change',renderCompletion);
document.getElementById('completionFrom')?.addEventListener('change',renderCompletion);
document.getElementById('completionTo')?.addEventListener('change',renderCompletion);
document.getElementById('monthFilter')?.addEventListener('change',renderCompletion);
document.getElementById('searchBtn')?.addEventListener('click',renderCompletion);
renderCompletion();

/* Merge the two per-capita charts into one compact comparison chart. */
function renderMergedProductivityChart(){
  const grid=document.querySelector('.metric-grid');
  if(!grid || typeof perCapita==='undefined' || typeof standardPerCapita==='undefined') return;
  const standardMap=Object.fromEntries(standardPerCapita);
  const rows=perCapita.map(([team,improve])=>[team,improve,standardMap[team]||0]);
  const max=Math.max(...rows.flatMap(r=>[r[1],r[2]]),1);
  grid.classList.add('metric-grid-merged');
  grid.innerHTML=`<article class="panel merged-productivity-panel">
    <div class="panel-head merged-productivity-head">
      <div><h2>팀별 인당 5S 개선성과</h2><p>인당 전체 5S 개선건수와 인당 표준화 개선건수를 동일 축에서 비교</p></div>
      <div class="merged-legend"><span><i class="legend-improve"></i>인당 5S 개선건수</span><span><i class="legend-standard"></i>인당 5S 표준화 개선건수</span><b>단위: 건/인</b></div>
    </div>
    <div class="merged-productivity-chart">
      ${rows.map(([team,improve,standard])=>`<div class="merged-team-group">
        <div class="merged-bars">
          <div class="merged-bar-wrap"><span>${improve.toFixed(1)}</span><div class="merged-bar improve" style="height:${Math.max(14,improve/max*205)}px" title="${team} · 인당 5S 개선건수 ${improve.toFixed(1)}건/인"></div></div>
          <div class="merged-bar-wrap"><span>${standard.toFixed(1)}</span><div class="merged-bar standard" style="height:${Math.max(14,standard/max*205)}px" title="${team} · 인당 5S 표준화 개선건수 ${standard.toFixed(1)}건/인"></div></div>
        </div>
        <strong>${team}</strong>
      </div>`).join('')}
    </div>
  </article>`;
}

(function injectMergedProductivityStyle(){
  if(document.getElementById('mergedProductivityStyle')) return;
  const style=document.createElement('style');
  style.id='mergedProductivityStyle';
  style.textContent=`
    .metric-grid-merged{display:block!important;margin-bottom:18px}
    .merged-productivity-panel{width:100%}
    .merged-productivity-head{align-items:flex-end}
    .merged-legend{display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-size:11px;color:#667085}
    .merged-legend span{display:flex;align-items:center;gap:6px}.merged-legend b{font-size:10px;border:1px solid #e1e7ee;border-radius:99px;padding:4px 8px;background:#f8fafc}
    .legend-improve,.legend-standard{display:inline-block;width:11px;height:11px;border-radius:3px}.legend-improve{background:#48779a}.legend-standard{background:#6f9d71}
    .merged-productivity-chart{height:300px;padding:26px 38px 20px;display:flex;align-items:flex-end;gap:34px;background:linear-gradient(to top,#fafbfd,#fff)}
    .merged-team-group{flex:1;min-width:115px;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center}
    .merged-bars{height:230px;width:100%;display:flex;align-items:flex-end;justify-content:center;gap:10px;border-bottom:1px solid #d5dde6;background:repeating-linear-gradient(to top,transparent 0,transparent 49px,#edf1f5 50px)}
    .merged-bar-wrap{height:100%;width:42px;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:5px}.merged-bar-wrap>span{font-size:11px;font-weight:800;color:#344054}
    .merged-bar{width:34px;border-radius:5px 5px 0 0;transition:transform .18s ease,filter .18s ease}.merged-bar:hover{transform:translateY(-2px);filter:brightness(.94)}.merged-bar.improve{background:#48779a}.merged-bar.standard{background:#6f9d71}
    .merged-team-group>strong{margin-top:10px;font-size:11px;color:#475467;white-space:nowrap}
    @media(max-width:900px){.merged-productivity-chart{overflow-x:auto;gap:20px;padding-left:20px;padding-right:20px}.merged-team-group{min-width:110px}.merged-productivity-head{align-items:flex-start;flex-direction:column}}
  `;
  document.head.appendChild(style);
})();
renderMergedProductivityChart();
