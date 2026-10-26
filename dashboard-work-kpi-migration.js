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
/* Explicit label contracts: prevent metrics()'s generic dashboard.summary fallback from masquerading as an Audit/Action/Advancement KPI. */
const CONTRACTS={
 audit:{draw:'Audit 원천',ongoing:'관리중',retention:'관리중'},
 action:{manage:'전체 개선요청',leadtime:'계획대비 지연',verify:'검증 대상'},
 advancement:{judge:'후보',standard:'공식확정'}
};
function checkedMetrics(area,sub){
 const expected=CONTRACTS[area]?.[sub];
 if(!expected)return null;
 const rows=window.HD20_OPS_V2?.metrics?.(area,sub);
 if(!Array.isArray(rows)||rows.length!==4||rows[0]?.[0]!==expected||rows.some(r=>!Array.isArray(r)||r.length<3||!Number.isFinite(Number(r[1])))){
  console.error('[HD20 KPI] Invalid area/sub KPI contract; refusing dashboard.summary fallback',area,sub,rows);
  return null;
 }
 return rows;
}

const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function subOptions(area){
 const m=window.HD20_SUBNAV?.map?.[area.key];
 return Array.isArray(m)&&m.length?m.filter(([sub])=>Object.hasOwn(CONTRACTS[area.key]||{},sub)):[[area.defaultSub,area.title]];
}
function ensure(){
 const app=document.querySelector('.app'),anchor=document.getElementById('hd20DashboardPriority')||app?.querySelector('.cards');
 if(!app||!anchor)return null;
 let el=document.getElementById(ID);
 if(!el){el=document.createElement('section');el.id=ID;el.className='hd20DashboardWorkMetrics';el.setAttribute('aria-label','업무별 통합 운영지표')}
 if(el.parentElement!==app||el.previousElementSibling!==anchor)anchor.insertAdjacentElement('afterend',el);
 return el;
}
function openEvidence(area,sub,index){
 try{if(window.HD20_KPI_EVIDENCE?.openEvidence?.(area,sub,index))return}catch(e){console.warn('[HD20 KPI] 근거 조회 실패, 업무화면으로 이동',e)}
 window.HD20_OPS_V2?.go?.(area,sub,{openGrid:true});
}
function render(){
 const root=ensure(),source=window.HD20_OPS_V2?.metrics;
 if(!root||typeof source!=='function')return;
 root.classList.toggle('hd20DashboardSectionHidden',window.HD20_DASHBOARD_TABS?.active?.()!=='summary');
 root.innerHTML='<div class="hd20DwmHead"><div><h2>업무별 통합 운영지표</h2><p>Audit · 개선조치 · 고도화의 업무 KPI를 대시보드에서 통합 조회합니다. 수치 선택 시 상세 근거를 확인할 수 있습니다.</p></div></div><div class="hd20DwmGroups">'+AREAS.map(a=>{
  const options=subOptions(a);
  if(!options.some(([sub])=>sub===selected[a.key]))selected[a.key]=options[0][0];
  const sub=selected[a.key],rows=checkedMetrics(a.key,sub);
  return '<section class="hd20DwmGroup" data-dwm-area="'+a.key+'"><div class="hd20DwmGroupHead"><div><h3>'+a.title+'</h3><small>'+a.note+'</small></div><label><span class="hd20SrOnly">지표 구분</span><select data-dwm-select="'+a.key+'" aria-label="'+a.title+' 지표 구분">'+options.map(([v,n])=>'<option value="'+esc(v)+'"'+(v===sub?' selected':'')+'>'+esc(n)+'</option>').join('')+'</select></label></div><div class="hd20DwmTiles">'+(rows?rows.map(([label,value,unit],i)=>'<button type="button" class="hd20DwmTile" data-dwm-detail="'+a.key+'" data-dwm-index="'+i+'" title="'+esc(a.title+' · '+label+' 상세 근거 보기')+'"><span>'+esc(label)+'</span><strong>'+esc(value)+'<small>'+esc(unit)+'</small></strong></button>').join(''):'<p class="hd20DwmContractError" role="alert">이 영역의 지표 연결을 확인해야 합니다. 잘못된 대시보드 공통값을 대신 표시하지 않습니다.</p>')+'</div></section>';
 }).join('')+'</div>';
 root.querySelectorAll('[data-dwm-select]').forEach(el=>el.addEventListener('change',()=>{const a=el.dataset.dwmSelect;selected[a]=el.value;render()}));
 root.querySelectorAll('[data-dwm-detail]').forEach(el=>el.addEventListener('click',()=>{const a=el.dataset.dwmDetail;openEvidence(a,selected[a],Number(el.dataset.dwmIndex))}));
 /* Tab owner may have initialized after this panel. Reconcile once without recursively rendering. */
 if(window.HD20_DASHBOARD_TABS?.active?.()==='summary')root.classList.remove('hd20DashboardSectionHidden');
}
let scheduled=false;
function schedule(){
 if(scheduled)return;
 scheduled=true;
 requestAnimationFrame(()=>{scheduled=false;render()});
}
function boot(){
 render();
 ['hd20-nav-area-changed','hd20-subtab-changed','hd20-kpi-source-updated','hd20-gmes-5s-imported','hd20-gmes-5s-judged','hd20-audit-updated','hd20-action-updated','hd20-refresh-requested','storage'].forEach(e=>window.addEventListener(e,schedule));
 window.addEventListener('pageshow',schedule);
 setTimeout(schedule,350);setTimeout(schedule,1500);
}
window.HD20_DASHBOARD_WORK_METRICS={render,schedule,selected};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
