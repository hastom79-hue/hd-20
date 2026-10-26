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
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function subOptions(area){
 const m=window.HD20_SUBNAV?.map?.[area.key];
 return Array.isArray(m)&&m.length?m:[[area.defaultSub,area.title]];
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
 root.innerHTML='<div class="hd20DwmHead"><div><h2>업무별 통합 운영지표</h2><p>Audit · 개선조치 · 고도화의 업무 KPI를 대시보드에서 통합 조회합니다. 수치 선택 시 상세 근거를 확인할 수 있습니다.</p></div></div><div class="hd20DwmGroups">'+AREAS.map(a=>{
  const options=subOptions(a);
  if(!options.some(([sub])=>sub===selected[a.key]))selected[a.key]=options[0][0];
  const sub=selected[a.key],rows=source(a.key,sub);
  return '<section class="hd20DwmGroup" data-dwm-area="'+a.key+'"><div class="hd20DwmGroupHead"><div><h3>'+a.title+'</h3><small>'+a.note+'</small></div><label><span class="hd20SrOnly">지표 구분</span><select data-dwm-select="'+a.key+'" aria-label="'+a.title+' 지표 구분">'+options.map(([v,n])=>'<option value="'+esc(v)+'"'+(v===sub?' selected':'')+'>'+esc(n)+'</option>').join('')+'</select></label></div><div class="hd20DwmTiles">'+rows.map(([label,value,unit],i)=>'<button type="button" class="hd20DwmTile" data-dwm-detail="'+a.key+'" data-dwm-index="'+i+'" title="'+esc(a.title+' · '+label+' 상세 근거 보기')+'"><span>'+esc(label)+'</span><strong>'+esc(value)+'<small>'+esc(unit)+'</small></strong></button>').join('')+'</div></section>';
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
 ['hd20-nav-area-changed','hd20-subtab-changed','hd20-kpi-source-updated','hd20-gmes-5s-imported','hd20-gmes-5s-judged','hd20-audit-updated','hd20-action-updated','hd20-refresh-requested','storage'].forEach(e=>window.addEventListener(e,schedule));
 window.addEventListener('pageshow',schedule);
 setTimeout(schedule,350);setTimeout(schedule,1500);
}
window.HD20_DASHBOARD_WORK_METRICS={render,schedule,selected};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
