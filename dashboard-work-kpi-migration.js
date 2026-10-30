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
function render(){
 const root=ensure();if(!root)return;
 if(!document.getElementById('hd20DwmCompactStyle')){
  const style=document.createElement('style');style.id='hd20DwmCompactStyle';
  style.textContent='#hd20DashboardWorkMetrics .hd20DwmGroups{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}#hd20DashboardWorkMetrics .hd20DwmGroup{min-width:0;padding:14px 16px;border:1px solid #dfe8ef;border-radius:13px;background:#fff}#hd20DashboardWorkMetrics .hd20DwmGroupHead{display:flex;justify-content:space-between;gap:8px;align-items:center}#hd20DashboardWorkMetrics .hd20DwmGroupHead h3{margin:0;font-size:14px}#hd20DashboardWorkMetrics .hd20DwmGroupHead small{display:none}#hd20DashboardWorkMetrics .hd20DwmHead{margin-bottom:10px}#hd20DashboardWorkMetrics .hd20DwmHead p{display:none}#hd20DashboardWorkMetrics .hd20DwmMiniValue{font-size:25px;font-weight:800;color:#123452;margin:9px 0 0}#hd20DashboardWorkMetrics .hd20DwmMiniMeta{font-size:11px;color:#74899d}#hd20DashboardWorkMetrics .hd20DwmMiniBars{height:68px;display:flex;align-items:flex-end;gap:5px;margin-top:9px;border-bottom:1px solid #e4eaf0}#hd20DashboardWorkMetrics .hd20DwmMiniBar{flex:1;min-width:0;position:relative;background:#b7c7d5;border-radius:3px 3px 0 0}#hd20DashboardWorkMetrics .hd20DwmMiniBar:last-child{background:#173452}#hd20DashboardWorkMetrics .hd20DwmMiniMonths{display:flex;justify-content:space-between;font-size:10px;color:#90a2b4;margin-top:4px}#hd20DashboardWorkMetrics .hd20DwmMiniFoot{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:9px;font-size:11px;color:#74899d}#hd20DashboardWorkMetrics .hd20DwmMiniFoot button{border:1px solid #d1dfeb;background:white;border-radius:9px;padding:6px 9px;color:#173452;font-weight:700;cursor:pointer;white-space:nowrap}@media(max-width:850px){#hd20DashboardWorkMetrics .hd20DwmGroups{grid-template-columns:1fr}}';
  style.textContent+=' #hd20DashboardWorkMetrics .hd20DwmMiniBars{height:86px;padding-top:16px;overflow:visible}#hd20DashboardWorkMetrics .hd20DwmMiniBar{overflow:visible}#hd20DashboardWorkMetrics .hd20DwmBarLabel{position:absolute;bottom:100%;left:50%;transform:translateX(-50%);font-size:9px;font-weight:700;line-height:13px;white-space:nowrap;color:#526e89}#hd20DashboardWorkMetrics .hd20DwmMiniBar:last-child .hd20DwmBarLabel{color:#173452}';
  document.head.appendChild(style);
 }
 const specs=[
  {area:'audit',sub:'retention',index:2,title:'재발·미흡',hint:'Audit 후 재점검 또는 재조치 대상'},
  {area:'action',sub:'manage',index:3,title:'기한경과',hint:'기한 초과 개선조치 확인 대상'},
  {area:'advancement',sub:'standard',index:2,title:'유지 미흡',hint:'고도화 유지기준 이탈·보완 대상'}
 ];
 root.innerHTML='<div class="hd20DwmHead"><div><h2>운영 종합진단 · 후속 조치 필요 현황</h2><p style="display:block;margin:5px 0 0;color:#74899d;font-size:12px">상단 성과율과 중복하지 않고 실제 확인·조치가 필요한 사례만 표시합니다.</p></div></div><div class="hd20DwmGroups">'+specs.map(spec=>{
  const area=AREAS.find(a=>a.key===spec.area),expected=CONTRACTS[spec.area][spec.sub]?.[spec.index];
  let evidence=null;
  try{evidence=window.HD20_KPI_EVIDENCE?.evidence?.(spec.area,spec.sub,spec.index)}catch(e){console.warn('[HD20] 후속조치 근거 조회 실패',spec.area,e)}
  const valid=evidence?.title===expected&&Array.isArray(evidence.rows);
  const count=valid?evidence.rows.length:null;
  return '<section class="hd20DwmGroup"><div class="hd20DwmGroupHead"><h3>'+esc(area.title)+'</h3></div><div class="hd20DwmMiniValue">'+(count===null?'—':count+'건')+'</div><div class="hd20DwmMiniMeta">'+esc(spec.title)+'</div><p style="font-size:12px;color:#74899d;min-height:34px;margin:12px 0 8px">'+esc(spec.hint)+'</p><div class="hd20DwmMiniFoot"><span>'+(valid?'원천 사례 기준':'원천 집계 확인 필요')+'</span><button type="button" data-dwm-detail="'+spec.area+'" data-dwm-sub="'+spec.sub+'" data-dwm-index="'+spec.index+'">사례 확인 →</button></div></section>';
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
