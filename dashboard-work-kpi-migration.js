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
 const root=ensure();
 if(!root)return;
 /* Summary container controls visibility; never forcibly unhide this node in another tab. */
 root.innerHTML='<div class="hd20DwmHead"><div><h2>운영 종합진단 · 업무별 핵심지표</h2><p>Audit·유지점검 / 개선조치·완료관리 / 고도화·표준화의 원천 근거 기준 건수입니다. 카드를 누르면 동일한 상세 근거를 조회합니다.</p></div></div><div class="hd20DwmGroups">'+AREAS.map(a=>{
  const options=subOptions(a);
  if(!options.some(([sub])=>sub===selected[a.key]))selected[a.key]=options[0][0];
  const sub=selected[a.key],rows=checkedMetrics(a.key,sub);
  return '<section class="hd20DwmGroup" data-dwm-area="'+a.key+'"><div class="hd20DwmGroupHead"><div><h3>'+a.title+'</h3><small>'+a.note+'</small></div><label><span class="hd20SrOnly">지표 구분</span><select data-dwm-select="'+a.key+'" aria-label="'+a.title+' 지표 구분">'+options.map(([v,n])=>'<option value="'+esc(v)+'"'+(v===sub?' selected':'')+'>'+esc(n)+'</option>').join('')+'</select></label></div><div class="hd20DwmTiles">'+(rows?rows.map(([label,value,unit],i)=>'<button type="button" class="hd20DwmTile" data-dwm-detail="'+a.key+'" data-dwm-index="'+i+'" title="'+esc(a.title+' · '+label+' 상세 근거 보기')+'"><span>'+esc(label)+'</span><strong>'+esc(value)+'<small>'+esc(unit)+'</small></strong></button>').join(''):'<p class="hd20DwmContractError" role="alert">이 영역의 지표 연결을 확인해야 합니다. 잘못된 대시보드 공통값을 대신 표시하지 않습니다.</p>')+'</div></section>';
 }).join('')+'</div>';
 root.querySelectorAll('[data-dwm-select]').forEach(el=>el.addEventListener('change',()=>{const a=el.dataset.dwmSelect;selected[a]=el.value;render()}));
 root.querySelectorAll('[data-dwm-detail]').forEach(el=>el.addEventListener('click',()=>{const a=el.dataset.dwmDetail;openEvidence(a,selected[a],Number(el.dataset.dwmIndex))}));

}
let scheduled=false;
function schedule(){
 if(scheduled)return;
 scheduled=true;
 requestAnimationFrame(()=>{scheduled=false;render()});
}
function boot(){
 render();
 ['hd20-nav-area-changed','hd20-subtab-changed','hd20-dashboard-section-changed','hd20-kpi-source-updated','hd20-ops-production-filter-ready','hd20-gmes-5s-imported','hd20-gmes-5s-judged','hd20-audit-updated','hd20-action-updated','hd20-refresh-requested','storage'].forEach(e=>window.addEventListener(e,schedule));
 window.addEventListener('pageshow',schedule);
 setTimeout(schedule,350);setTimeout(schedule,1500);
}
window.HD20_DASHBOARD_WORK_METRICS={render,schedule,selected};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
