/* HD-20 KPI consolidation: audit, action, advancement indicators live on the dashboard.
   Source formulas and records are reused from HD20_OPS_V2; no data is copied or rewritten. */
(()=>{'use strict';
const ID='hd20DashboardWorkMetrics';
const AREAS=[
 {key:'audit',title:'Audit·유지점검',defaultSub:'draw',note:'점검·유지·재조치'},
 {key:'action',title:'개선조치·완료관리',defaultSub:'manage',note:'실행·기한·효과검증'},
 {key:'advancement',title:'고도화·표준화',defaultSub:'standard',note:'후보·판정·유지·전개'}
];
const selected=Object.fromEntries(AREAS.map(a=>[a.key,a.defaultSub]));
/* Canonical card contract = exact evidence title + evidence row count.
   The dashboard summary does not reuse mutable metrics() wrappers or fall back to dashboard.summary. */
const CONTRACTS={
 audit:{
  draw:['Audit 원천','Audit 실시 대기','Audit 완료','Audit 부적합'],
  ongoing:['6개월 관리중','재발 징후','Audit 연계 Action','월별 확인 대상'],
  retention:['6개월 관리중','종료평가','재발/미흡','Audit 연계 Action']
 },
 action:{
  manage:['전체 개선요청','진행/대기','완료','기한경과'],
  leadtime:['계획대비 지연','계획대비 조기완료','7일 이상 지연','정시완료(당일)'],
  verify:['효과검증 대상','효과검증 완료','효과검증 대기','폐쇄루프 재발']
 },
 advancement:{
  judge:['고도화 후보','판정대기','공식확정','3조건 충족'],
  standard:['공식확정','현재 유지','유지 미흡','수평전개']
 }
};
function checkedMetrics(area,sub){
 const expected=CONTRACTS[area]?.[sub];
 const evidence=window.HD20_KPI_EVIDENCE?.evidence;
 if(!expected||typeof evidence!=='function')return null;
 const rows=[];
 for(let i=0;i<expected.length;i++){
  let ev;
  try{ev=evidence(area,sub,i)}catch(error){console.error('[HD20 KPI] 근거 계산 오류',area,sub,i,error);return null}
  if(!ev||ev.title!==expected[i]||!Array.isArray(ev.rows)){
   console.error('[HD20 KPI] 카드-상세근거 계약 불일치',area,sub,i,ev?.title,expected[i]);
   return null;
  }
  rows.push([ev.title,ev.rows.length,'건']);
 }
 return rows;
}

const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function subOptions(area){
 const m=window.HD20_SUBNAV?.map?.[area.key];
 const filtered=Array.isArray(m)?m.filter(([sub])=>Object.hasOwn(CONTRACTS[area.key]||{},sub)):[];
 return filtered.length?filtered:[[area.defaultSub,area.title]];
}
function ensure(){
 /* Physical ownership: this element must be a CHILD of the summary-only target.
    Hiding #hd20DashboardPriority therefore hides every KPI card without depending on a CSS class race. */
 const anchor=document.getElementById('hd20DashboardPriority');
 if(!anchor)return null;
 let el=document.getElementById(ID);
 if(!el){el=document.createElement('section');el.id=ID;el.className='hd20DashboardWorkMetrics';el.setAttribute('aria-label','운영 종합진단 · 업무별 핵심지표')}
 if(el.parentElement!==anchor)anchor.appendChild(el);
 return el;
}
function openEvidence(area,sub,index){
 try{if(window.HD20_KPI_EVIDENCE?.openEvidence?.(area,sub,index))return}catch(e){console.warn('[HD20 KPI] 근거 조회 실패, 업무화면으로 이동',e)}
 window.HD20_OPS_V2?.go?.(area,sub,{openGrid:true});
}
function rowMonth(row,headers){
 if(Array.isArray(row)){
  const labels=Array.isArray(headers)?headers:[];
  const dateColumns=labels.map((h,i)=>/일자|일시|날짜|등록일|선정일|점검일|Audit일|확정일|판정일|요청일|완료일|기한/i.test(String(h))?i:-1).filter(i=>i>=0);
  for(const i of dateColumns){const found=rowMonth({date:row[i]});if(found)return found}
  return null;
 }

 const fields=['occurredAt','eventDate','inspectionDate','auditDate','requestDate','createdAt','registeredAt','updatedAt','date','month','점검일','등록일','발생일','요청일','판정일','완료일'];
 for(const key of fields){
  const value=row?.[key];if(value===null||value===undefined||value==='')continue;
  const raw=String(value).trim();
  const match=raw.match(/^(20\d{2})[-./년 ]+(0?[1-9]|1[0-2])(?:\D|$)/);
  if(match)return {year:Number(match[1]),month:Number(match[2])};
  if(/^20\d{4}$/.test(raw))return {year:Number(raw.slice(0,4)),month:Number(raw.slice(4,6))};
 }
 return null;
}
function monthlyEvidence(rows,year,headers){
 const values=Array(12).fill(0),known=Array(12).fill(false);
 for(const row of rows){const m=rowMonth(row,headers);if(m&&m.year===year){values[m.month-1]++;known[m.month-1]=true}}
 return {values,dated:rows.length===0||known.some(Boolean),undated:rows.length>0&&!known.some(Boolean)};
}
function render(){
 const root=ensure();if(!root)return;
 if(!document.getElementById('hd20DwmCompactStyle')){
  const style=document.createElement('style');style.id='hd20DwmCompactStyle';
  style.textContent='#hd20DashboardWorkMetrics .hd20DwmGroups{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}#hd20DashboardWorkMetrics .hd20DwmGroup{min-width:0;padding:14px 16px;border:1px solid #dfe8ef;border-radius:13px;background:#fff}#hd20DashboardWorkMetrics .hd20DwmGroupHead{display:flex;justify-content:space-between;gap:8px;align-items:center}#hd20DashboardWorkMetrics .hd20DwmGroupHead h3{margin:0;font-size:14px}#hd20DashboardWorkMetrics .hd20DwmGroupHead small{display:none}#hd20DashboardWorkMetrics .hd20DwmHead{margin-bottom:10px}#hd20DashboardWorkMetrics .hd20DwmHead p{display:none}#hd20DashboardWorkMetrics .hd20DwmMiniValue{font-size:25px;font-weight:800;color:#123452;margin:9px 0 0}#hd20DashboardWorkMetrics .hd20DwmMiniMeta{font-size:11px;color:#74899d}#hd20DashboardWorkMetrics .hd20DwmMiniBars{height:68px;display:flex;align-items:flex-end;gap:5px;margin-top:9px;border-bottom:1px solid #e4eaf0}#hd20DashboardWorkMetrics .hd20DwmMiniBar{flex:1;min-width:0;position:relative;background:#b7c7d5;border-radius:3px 3px 0 0}#hd20DashboardWorkMetrics .hd20DwmMiniBar:last-child{background:#173452}#hd20DashboardWorkMetrics .hd20DwmMiniMonths{display:flex;justify-content:space-between;font-size:10px;color:#90a2b4;margin-top:4px}#hd20DashboardWorkMetrics .hd20DwmMiniFoot{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:9px;font-size:11px;color:#74899d}#hd20DashboardWorkMetrics .hd20DwmMiniFoot button{border:1px solid #d1dfeb;background:white;border-radius:9px;padding:6px 9px;color:#173452;font-weight:700;cursor:pointer;white-space:nowrap}@media(max-width:850px){#hd20DashboardWorkMetrics .hd20DwmGroups{grid-template-columns:1fr}}';
  style.textContent+=' #hd20DashboardWorkMetrics .hd20DwmMiniBars{height:86px;padding-top:16px;overflow:visible}#hd20DashboardWorkMetrics .hd20DwmMiniBar{overflow:visible}#hd20DashboardWorkMetrics .hd20DwmBarLabel{position:absolute;bottom:100%;left:50%;transform:translateX(-50%);font-size:9px;font-weight:700;line-height:13px;white-space:nowrap;color:#526e89}#hd20DashboardWorkMetrics .hd20DwmMiniBar:last-child .hd20DwmBarLabel{color:#173452}';
  style.textContent+='#hd20DashboardWorkMetrics .hd20DwmGroup{padding:14px 15px!important}#hd20DashboardWorkMetrics .hd20DwmDescription{font-size:11px;line-height:1.4;color:#74899d;margin:5px 0 12px;min-height:0}#hd20DashboardWorkMetrics .hd20DwmFocusRows{display:grid;gap:6px}#hd20DashboardWorkMetrics .hd20DwmFocusRow{width:100%;display:flex;align-items:center;gap:8px;text-align:left;padding:10px 11px;border:1px solid #e1e8ef;border-radius:8px;background:#f8fafc;color:#254158;font-size:12px;cursor:pointer}#hd20DashboardWorkMetrics .hd20DwmFocusRow:hover,#hd20DashboardWorkMetrics .hd20DwmFocusRow:focus-visible{background:#edf4fa;border-color:#a9c3d7}#hd20DashboardWorkMetrics .hd20DwmFocusRow strong{font-size:17px;color:#163752;margin-left:auto;font-variant-numeric:tabular-nums}#hd20DashboardWorkMetrics .hd20DwmFocusArrow{color:#8094a6;font-size:20px}#hd20DashboardWorkMetrics .hd20DwmFocusNote{margin-top:9px;font-size:10.5px;color:#7c8e9f}';
  style.textContent+='#hd20DashboardWorkMetrics .hd20DwmChart{height:112px;display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:3px;border-bottom:1px solid #dce6ee;align-items:end;margin:12px 0 9px}#hd20DashboardWorkMetrics .hd20DwmMonth{height:100%;display:flex;flex-direction:column;justify-content:flex-end;min-width:0;align-items:center}#hd20DashboardWorkMetrics .hd20DwmMonth small{font-size:9px;color:#8294a5;height:17px}#hd20DashboardWorkMetrics .hd20DwmBarPair{height:82px;width:100%;display:flex;gap:2px;align-items:flex-end;justify-content:center}#hd20DashboardWorkMetrics .hd20DwmChartBar{position:relative;flex:1;max-width:13px;border-radius:3px 3px 0 0}#hd20DashboardWorkMetrics .hd20DwmChartBar.primary,#hd20DashboardWorkMetrics .hd20DwmLegend i.primary{background:#244966}#hd20DashboardWorkMetrics .hd20DwmChartBar.secondary,#hd20DashboardWorkMetrics .hd20DwmLegend i.secondary{background:#8aabc4}#hd20DashboardWorkMetrics .hd20DwmChartBar span{position:absolute;bottom:100%;left:50%;transform:translateX(-50%);font-size:9px;font-weight:700;color:#405b71}#hd20DashboardWorkMetrics .hd20DwmLegend{display:flex;flex-wrap:wrap;gap:6px}#hd20DashboardWorkMetrics .hd20DwmLegend button{border:1px solid #dce5ec;background:#fff;border-radius:7px;padding:5px 7px;font-size:10px;display:flex;align-items:center;gap:5px;color:#405b71;cursor:pointer}#hd20DashboardWorkMetrics .hd20DwmLegend strong{color:#173452}#hd20DashboardWorkMetrics .hd20DwmLegend i{width:8px;height:8px;border-radius:2px}#hd20DashboardWorkMetrics .hd20DwmNoData{grid-column:1/-1;align-self:center;text-align:center;color:#8a9aaa;font-size:12px}';
  document.head.appendChild(style);
 }
 const specs=[
  {area:'audit',title:'Audit·유지점검',metrics:[['draw',0,'Audit 등록'],['draw',2,'Audit 완료']]},
  {area:'action',title:'개선조치·완료관리',metrics:[['manage',0,'개선요청'],['manage',2,'조치완료']]},
  {area:'advancement',title:'고도화·표준화',metrics:[['judge',0,'고도화 후보'],['standard',0,'공식확정']]}
 ];
 const year=Number(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Seoul',year:'numeric'}).format(new Date()));
 root.innerHTML='<div class="hd20DwmHead"><div><h2>운영 종합진단 · 집중관리 추이</h2><p style="display:block!important;margin:5px 0 0;color:#74899d;font-size:12px">월별 관리대상 발생 추이 · 단위 건 · '+year+'년</p></div></div><div class="hd20DwmGroups">'+specs.map(spec=>{
  const metrics=spec.metrics.map(([sub,index,label])=>{
   const expected=CONTRACTS[spec.area]?.[sub]?.[index];let ev=null;
   try{ev=window.HD20_KPI_EVIDENCE?.evidence?.(spec.area,sub,index)}catch(e){console.warn('[HD20] 월별 근거 조회 실패',spec.area,sub,e)}
   const valid=ev?.title===expected&&Array.isArray(ev.rows);
   return {sub,index,label,count:valid?ev.rows.length:null,series:valid?monthlyEvidence(ev.rows,year,ev.headers):null};
  });
  const anyDated=metrics.some(m=>m.series?.dated&&m.series?.values.some(v=>v>0));
  const missing=metrics.filter(m=>!m.series?.dated&&m.count>0).map(m=>m.label);
  const diagnostics=metrics.map(m=>m.label+': 근거 '+(m.count===null?'연결 실패':m.count+'건')+', '+year+'년 '+(m.series?m.series.values.reduce((a,b)=>a+b,0):0)+'건').join(' / ');
  const max=Math.max(1,...metrics.flatMap(m=>m.series?.values||[]));
  const bars=Array.from({length:12},(_,i)=>'<div class="hd20DwmMonth"><div class="hd20DwmBarPair">'+metrics.map((m,j)=>{
   const val=m.series?.values[i]??0;
   const usable=!!m.series?.dated;
   const height=usable&&val>0?Math.max(3,Math.round(val/max*70)):0;
   return '<div class="hd20DwmChartBar '+(j?'secondary':'primary')+'" style="height:'+height+'px" title="'+esc(m.label)+' '+(i+1)+'월: '+(usable?val+'건':'월별 자료 없음')+'">'+(usable&&val>0?'<span>'+val+'</span>':'')+'</div>';
  }).join('')+'</div><small>'+(i+1)+'월</small></div>').join('');
  return '<section class="hd20DwmGroup"><div class="hd20DwmGroupHead"><h3>'+esc(spec.title)+'</h3></div><div class="hd20DwmChart">'+(anyDated?bars:'<div class="hd20DwmNoData">해당 연도 월별 발생 기록 없음 · 날짜 근거 확인 필요</div>')+'</div><div class="hd20DwmLegend">'+metrics.map((m,j)=>'<button type="button" data-dwm-detail="'+spec.area+'" data-dwm-sub="'+m.sub+'" data-dwm-index="'+m.index+'"><i class="'+(j?'secondary':'primary')+'"></i>'+esc(m.label)+' <strong>'+(m.count===null?'—':m.count+'건')+'</strong></button>').join('')+'</div><div class="hd20DwmFocusNote">'+(missing.length?'날짜 미확인: '+esc(missing.join(', '))+' · ':'')+esc(diagnostics)+'</div></section>';
 }).join('')+'</div>';
 root.querySelectorAll('[data-dwm-detail]').forEach(el=>el.addEventListener('click',()=>openEvidence(el.dataset.dwmDetail,el.dataset.dwmSub,Number(el.dataset.dwmIndex))));

}

let scheduled=false;
function schedule(){
 if(scheduled)return;
 scheduled=true;
 requestAnimationFrame(()=>{scheduled=false;render()});
}
function boot(){
 render();
 /* The priority board may redraw its children; restore only this summary-owned node if it is removed. */
 const summaryAnchor=document.getElementById('hd20DashboardPriority');
 if(summaryAnchor)new MutationObserver(()=>{if(!summaryAnchor.contains(document.getElementById(ID)))schedule()}).observe(summaryAnchor,{childList:true});
 ['hd20-nav-area-changed','hd20-subtab-changed','hd20-dashboard-section-changed','hd20-kpi-source-updated','hd20-ops-production-filter-ready','hd20-gmes-5s-imported','hd20-gmes-5s-judged','hd20-audit-updated','hd20-action-updated','hd20-refresh-requested','storage'].forEach(e=>window.addEventListener(e,schedule));
 window.addEventListener('pageshow',schedule);
 setTimeout(schedule,350);setTimeout(schedule,1500);
}
window.HD20_DASHBOARD_WORK_METRICS={render,schedule,selected,rows:checkedMetrics};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
