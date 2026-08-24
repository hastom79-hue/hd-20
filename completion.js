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