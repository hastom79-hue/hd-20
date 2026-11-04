/* v3 전면 개선 — 사용자 지적: "테마점검 탭을 이따위로 만들어놓고 다 했다고 하는거냐"

   v2까지의 문제점과 조치:
   1) 처음 들어왔을 때 매트릭스가 텅 비어 있어 "뭘 해야 하는지" 전혀 안내가 없었음
      → 요약 카드 4개(실시 라인·최신 점검 미흡·자동 등록·점검 적합률) 추가, 매트릭스가 비어 있을 때도
        "아직 점검 실시 전입니다 — 아래에서 라인을 선택해 Audit을 시작하세요" 안내 추가.
   2) 매트릭스와 체크리스트가 완전히 분리되어 있어 셀을 클릭해도 아무 반응이 없었음
      → 매트릭스 셀 클릭 시 해당 라인으로 체크리스트가 자동 전환되고 그 섹션으로 스크롤.
   3) 23개 항목을 전부 하나하나 클릭해야 해서 비현실적으로 번거로웠음
      → "전체 적합으로 일괄 설정" 버튼 추가(미흡만 개별로 바꾸면 되도록), 대분류별로도 일괄 설정
        가능.
   4) 다른 탭 대비 디자인이 리스트+버튼 수준으로 빈약했음
      → 카드형 레이아웃·그림자·강조색 등 다른 탭과 통일된 디자인으로 전면 교체. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const ACT_KEY='hd20ActionCasesV2',TEAM_KEY='hd20TeamLeaderMasterV1',CHECK_KEY='hd20ThemeAuditChecksV1',PLAN_KEY='hd20ThemeAuditPlansV1';
const THEME_OWNERS=Object.freeze({module:'5S모듈 주관',team:'생산팀장 자율'});
const ownerOf=x=>x?.inspectionOwner==='team'?'team':'module'; // legacy records remain 5S module-owned
const ownerTitle=x=>THEME_OWNERS[x]||THEME_OWNERS.module;
const selectedOwner=()=>document.getElementById('awTheme')?.dataset.inspectionOwner==='team'?'team':'module';
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const FALLBACK_TEAMS=['대형Att.팀','대형메인팀','대형상부팀','프레임제작팀','Boom제작팀','중형상부1팀','중형상부2팀','중형하부팀','중형Att팀','중형메인팀','휠로더Front팀','휠로더리어팀','휠로더메인팀','초대형조립팀','성능팀','트러블슈팅팀','옵션조립팀','출하팀','자재물류팀'];
const LINES=(()=>{const master=window.HD20WorkplaceMaster?.active?.()||[];const names=master.map(x=>String(x.name||x).replace(/^\[울산\]\s*/,''));const old=[...loadPlans().map(x=>x.line),...loadChecks().map(x=>x.line),...load().filter(x=>x.source==='테마Audit').map(x=>x.workplace)].filter(Boolean);return [...new Set([...(names.length?names:['중형라인','대형라인','통합서브라인','중형라인 ARM KIT 라인','중형라인 BOOM KIT 라인','대형라인 ARM KIT 라인','대형라인 BOOM KIT 라인','휠로더 라인','초대형 라인','프레임 상부 ASSY','프레임 하부 ASSY','붐 라인','부품도장라인','중대형휠로더검사라인','출하장','비정규 라인(구.Pilot장)','원자재 창고','기타구역(옥외,시설물)']),...old])];})();
/* 라인별 대표 담당팀(자재/검사 공용구역은 자재물류팀, 공구실은 트러블슈팅팀, 조립라인은 첫 조립팀을
   기본값으로 — 실제로는 현장에서 변경 가능하도록 드롭다운은 그대로 열어 둠). */
const LINE_DEFAULT_TEAM={'조립라인':'대형Att.팀','자재구역':'자재물류팀','공구실':'트러블슈팅팀','검사대':'성능팀'};
const LEGACY_CHECKLIST=[
 {cat:'정리',item:'불용 지그·공구 방치'},
 {cat:'정리',item:'폐자재·폐자재함 미분리 배출'},
 {cat:'정리',item:'사용연한 초과 소모품(장갑·걸레 등) 방치'},
 {cat:'정돈',item:'정위치 표시(바닥 라인) 미준수'},
 {cat:'정돈',item:'정량 기준 초과 부품·자재 적치'},
 {cat:'정돈',item:'볼트·너트 등 소모성 품목 혼재·미분류 보관'},
 {cat:'정돈',item:'통로 폭 침범 적치'},
 {cat:'청소',item:'설비 주변 분진·유분 잔류'},
 {cat:'청소',item:'바닥 오염·누유 방치'},
 {cat:'청소',item:'작업대 정리정돈 미흡'},
 {cat:'시각화',item:'라벨·표지판 노후·훼손'},
 {cat:'시각화',item:'라인·구역 경계선 미도색·마모'},
 {cat:'시각화',item:'재고 수량 시각화판 미게시'},
 {cat:'위험구역관리',item:'위험표지 누락·훼손'},
 {cat:'위험구역관리',item:'비상정지장치 접근로 막힘'},
 {cat:'위험구역관리',item:'안전통로 표시 미준수'},
 {cat:'설비 자주보전',item:'설비 점검표 미게시·미작성'},
 {cat:'설비 자주보전',item:'급유포인트 누유·미급유'},
 {cat:'설비 자주보전',item:'소모품 교체주기 미준수'},
 {cat:'5S 고도화',item:'표준화 자료 미게시'},
 {cat:'5S 고도화',item:'수평전개 대상 라인 누락'},
 {cat:'5S 고도화',item:'FoolProof 장치 미설치·고장 방치'},
];
let CHECKLIST=[...(window.HD20ThemeMaster?.checklist?.()||[])];
const ACTIVE_5S_GROUPS=new Set(['정리','정돈','시각화관리','시각화','청소','설비자주보전','설비 자주보전']);
const activeThemeNames=items=>[...new Set(items.filter(c=>ACTIVE_5S_GROUPS.has(c.group||c.cat)).map(c=>c.cat))];
let THEMES=activeThemeNames(window.HD20ThemeMaster?.checklist?.()||CHECKLIST);
function applyLatestThemeMaster(){
 const latest=window.HD20ThemeMaster?.checklist?.()||[];
 const host=document.getElementById('awTheme');
 if(host&&hasUnsavedThemeAudit(host)){
  host.dataset.pendingThemeMasterRefresh='1';
  const note=document.getElementById('themePreviousNote');
  if(note)note.textContent='5S 테마 기준정보가 변경되었습니다. 현재 점검내용을 저장하거나 명시적으로 폐기한 뒤 최신 점검항목이 표시됩니다.';
  return;
 }
 CHECKLIST=[...latest];
 THEMES=activeThemeNames(latest);
 if(host){delete host.dataset.pendingThemeMasterRefresh;render()}
}
window.addEventListener('hd20-theme-master-updated',applyLatestThemeMaster);
window.addEventListener('storage',e=>{if(e.key===window.HD20ThemeMaster?.key)applyLatestThemeMaster()});
function load(){try{const v=JSON.parse(localStorage.getItem(ACT_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function save(rows){try{localStorage.setItem(ACT_KEY,JSON.stringify(rows));return true}catch(e){console.error('[HD20 Theme] action save failed',e);return false}}
function loadChecks(){try{const v=JSON.parse(localStorage.getItem(CHECK_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function saveChecks(rows){try{localStorage.setItem(CHECK_KEY,JSON.stringify(rows));return true}catch(e){console.error('[HD20 Theme] audit history save failed',e);return false}}
function loadPlans(){try{const v=JSON.parse(localStorage.getItem(PLAN_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function savePlans(rows){try{localStorage.setItem(PLAN_KEY,JSON.stringify(rows));return true}catch(e){console.error('[HD20 Theme] plan save failed',e);return false}}
function obsoletePlanThemes(month,line,owner=selectedOwner(),team=document.getElementById('awTheme')?.dataset.team||''){
 const row=loadPlans().find(x=>x.month===month&&x.line===line&&ownerOf(x)===owner&&(owner!=='team'||x.team===team));
 return Array.isArray(row?.themes)?[...new Set(row.themes.map(String).filter(t=>!THEMES.includes(t)))]:[];
}
function plannedThemes(month,line,owner=selectedOwner(),team=document.getElementById('awTheme')?.dataset.team||''){
 const p=loadPlans().find(x=>x.month===month&&x.line===line&&ownerOf(x)===owner&&(owner!=='team'||x.team===team));
 if(p&&Array.isArray(p.themes))return THEMES.filter(t=>p.themes.includes(t));
 const prior=loadChecks().filter(x=>x.line===line&&ownerOf(x)===owner&&(owner!=='team'||x.team===team)&&monthKey(x.month||x.auditedAt)===month).sort((a,b)=>String(b.auditedAt||'').localeCompare(String(a.auditedAt||'')))[0];
 if(prior?.states)return THEMES.filter(t=>CHECKLIST.some(item=>item.cat===t&&Object.prototype.hasOwnProperty.call(prior.states,item.cat+'::'+item.item)));
 return [];
}
const THEME_COMPLETED_STATUSES=new Set(['완료','조치완료','개선완료','종결','종료','유지점검완료','효과검증완료']);
const THEME_ACTIVE_STATUSES=new Set(['조치대기','미착수','진행중','조치진행중','기한경과','보완요청','조치중','효과검증대기']);
const normalizeThemeStatus=v=>String(v??'').replace(/\s+/g,'').trim();
function themeSameIssue(a,line,team,cat,problem){return a.source==='테마Audit'&&a.workplace===line&&a.team===team&&a.themeCategory===cat&&a.problem===problem}
function themeFindActive(actions,line,team,cat,problem){return actions.find(a=>themeSameIssue(a,line,team,cat,problem)&&!THEME_COMPLETED_STATUSES.has(normalizeThemeStatus(a.status)))}
function themeFindPreviousCompleted(actions,line,team,cat,problem){return actions.filter(a=>themeSameIssue(a,line,team,cat,problem)&&THEME_COMPLETED_STATUSES.has(normalizeThemeStatus(a.status))).sort((a,b)=>String(b.completedAt||b.updatedAt||b.createdAt||'').localeCompare(String(a.completedAt||a.updatedAt||a.createdAt||'')))[0]}
function themeAuditIdsForMonth(checks,month){
 return new Set(checks.filter(rec=>rec?.id!=null&&String(rec.id).trim()&&monthKey(rec.month||rec.auditedAt)===month).map(rec=>String(rec.id)));
}
function themeActionLinkedToChecks(a,auditIds){return [a.auditRecordId,a.lastAuditRecordId,...(Array.isArray(a.relatedAuditRecordIds)?a.relatedAuditRecordIds:[])].some(id=>id!=null&&auditIds.has(String(id)));}
function themeActionInMonth(a,month,monthAuditIds){
 if(a.source!=='테마Audit')return false;
 if(monthKey(a.auditMonth||a.createdAt||a.date)===month||monthKey(a.lastAuditMonth||a.lastAuditedAt)===month)return true;
 const ids=[...(Array.isArray(a.relatedAuditRecordIds)?a.relatedAuditRecordIds:[]),a.auditRecordId,a.lastAuditRecordId];
 return ids.some(id=>id!=null&&monthAuditIds.has(String(id)));
}
function actionTable(month){
 const owner=selectedOwner(),team=document.getElementById('awTheme')?.dataset.team||'';const monthAuditIds=themeAuditIdsForMonth(loadChecks().filter(x=>ownerOf(x)===owner&&(owner!=='team'||x.team===team)),month);const rows=load().filter(x=>themeActionLinkedToChecks(x,monthAuditIds)).sort((a,b)=>String(b.lastAuditedAt||b.createdAt||'').localeCompare(String(a.lastAuditedAt||a.createdAt||'')));
 if(!rows.length)return '<div class="themeEmptyNote">선택 월에 연결된 테마점검 개선조치가 없습니다.</div>';
 const recurrenceCount=rows.filter(a=>a.recurrence===true).length;const recurrenceRate=rows.length?((recurrenceCount/rows.length)*100).toFixed(1):'0.0';
 const statuses=[...new Set(rows.map(a=>String(a.status||'미분류')))].sort();
 const tableRows=rows.map(a=>{
  const status=String(a.status||'미분류'),line=String(a.workplace||''),team=String(a.team||''),theme=String(a.themeCategory||a.type||''),problem=String(a.problem||''),id=String(a.id||'');
  const recurrenceLabel=a.recurrence===true?'재발':'최초';const search=[line,team,theme,problem,status,id,recurrenceLabel,a.recurrenceOfActionId||''].join(' ');
  return '<tr data-status="'+esc(status)+'" data-recurrence="'+(a.recurrence===true?'yes':'no')+'" data-search="'+esc(search.toLocaleLowerCase())+'"><td>'+esc(line||'—')+'</td><td>'+esc(team||'—')+'</td><td>'+esc(theme||'—')+'</td><td>'+esc(problem||'—')+'</td><td><span class="themeStatusTag">'+esc(status)+'</span></td><td>'+esc(a.dueDate||a.targetDate||'—')+'</td><td class="num">'+(Number(a.recheckCount)||0)+'</td><td>'+esc(recurrenceLabel)+'</td><td>'+esc(a.recurrenceOfActionId||'—')+'</td><td>'+esc(id||'—')+'</td></tr>';
 }).join('');
 return '<div class="themeHistoryMeta">총 '+rows.length+'건 · 재발 '+recurrenceCount+'건 · 재발률 '+recurrenceRate+'% (조회 개선조치 건수 대비) · 최초 발생 월과 최근 재점검 월 모두에서 조회 · 동일 미흡사항의 미완료 조치는 중복 생성하지 않고 재점검 이력을 연결합니다.</div><div class="themeActionFilters"><label>빠른 검색 <input id="themeActionSearch" type="search" placeholder="라인·팀·테마·미흡내용·조치 ID"></label><label>조치 상태 <select id="themeActionStatus"><option value="">전체 상태</option>'+statuses.map(s=>'<option value="'+esc(s)+'">'+esc(s)+'</option>').join('')+'</select></label><label>재발 구분 <select id="themeActionRecurrence"><option value="">전체</option><option value="yes">재발</option><option value="no">최초</option></select></label><span id="themeActionCount" aria-live="polite">표시 '+rows.length+'/'+rows.length+'건</span></div><div class="themeHistoryWrap"><table class="themeHistoryTable"><thead><tr><th>라인/구역</th><th>담당팀</th><th>취약 테마</th><th>미흡사항</th><th>조치 상태</th><th>조치기한</th><th>재점검</th><th>재발 구분</th><th>이전 조치 ID</th><th>조치 ID</th></tr></thead><tbody id="themeActionTableBody">'+tableRows+'</tbody></table><div id="themeActionNoResults" class="themeEmptyNote" hidden>검색 조건에 맞는 조치가 없습니다.</div></div>';
}
function sessionTeam(){
 try{
  const session=JSON.parse(localStorage.getItem('hd20_company_session_v1')||'null');
  const mail=String(session?.email||'').trim().toLowerCase();
  if(!mail||!Number.isFinite(Number(session?.expiresAt))||Number(session.expiresAt)<=Date.now())return '';
  const master=JSON.parse(localStorage.getItem(TEAM_KEY)||'[]');
  const matching=Array.isArray(master)?master.filter(x=>String(x?.email||'').trim().toLowerCase()===mail):[];
  return matching.length===1?String(matching[0].team||'').trim():'';
 }catch{return ''}
}
function teamOptions(){try{const v=JSON.parse(localStorage.getItem(TEAM_KEY)||'[]');if(Array.isArray(v)&&v.length)return v.map(x=>x.team||x)}catch{}return FALLBACK_TEAMS}
function seoulDate(date=new Date()){const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);const part=k=>(p.find(x=>x.type===k)||{}).value||'';return part('year')+'-'+part('month')+'-'+part('day')}
function addDaysStr(d,n){const x=new Date(String(d).slice(0,10)+'T12:00:00Z');x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10)}
function today(){return seoulDate()}
function monthKey(d){return String(d||'').slice(0,7)}
function thisMonth(){return today().slice(0,7)}
function newId(prefix){const id=window.crypto&&typeof window.crypto.randomUUID==='function'?window.crypto.randomUUID():Date.now()+'-'+Math.random().toString(36).slice(2,10);return prefix+'-'+id}
function formatAuditDate(value){if(!value)return'—';const d=new Date(value);if(Number.isNaN(d.getTime()))return esc(value);return new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'2-digit',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(d)}
function css(){if(document.getElementById('hd20ThemeStyle'))return;const s=document.createElement('style');s.id='hd20ThemeStyle';
 s.textContent=`
 #awTheme{padding-bottom:20px;min-height:0;max-width:100%;overflow-x:hidden}
 #awTheme .themePanel[hidden]{display:none!important}
 #awTheme .themePanel{min-height:0;max-width:100%}
 #awTheme .themeLineSummary{min-width:0;max-width:100%;max-height:560px;overflow:auto;overscroll-behavior:contain}
 #awTheme .themeLineSummaryBody{min-height:0}
 #awTheme .themeLineSummaryHead,#awTheme .themeLineSummaryRow{min-width:840px;box-sizing:border-box}
 #awTheme .themeLineSummaryRow{min-height:46px;max-height:120px;overflow:hidden}
 #awTheme .themeLineChips{display:flex;flex-wrap:wrap;gap:4px;max-height:76px;overflow:hidden}
 #awTheme .themeLineName{overflow-wrap:anywhere}
 #awTheme .themePlanBox,#awTheme .themeLineSummary,#awTheme .themeSummaryFoot{box-sizing:border-box}
 #awTheme .themePlanChoices{display:flex;flex-wrap:wrap;gap:8px;max-width:100%}
 #awTheme .themePlanChoices label{max-width:100%;overflow-wrap:anywhere}
 #awTheme .themePageControls{display:flex;align-items:center;justify-content:flex-end;gap:10px;margin:10px 0 0;color:#536d81;font-size:12px}
 #awTheme .themePageControls button{padding:6px 12px;border:1px solid #c8d9e5;border-radius:7px;background:#fff;color:#24445c;cursor:pointer}
 #awTheme .themePageControls button:disabled{opacity:.4;cursor:default}
 #awTheme .awHero{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;flex-wrap:wrap}
 #awTheme .themeSubtitle{color:#5c7489;font-size:13px;margin-top:4px}
 #awTheme .themeOwner{display:inline-block;margin-top:6px;padding:3px 10px;border-radius:999px;background:#eef4fb;color:#2c5f8a;font-size:12px;font-weight:700}
 #awTheme .themeKpiRow{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px;margin:16px 0}
 #awTheme .themeKpiCard{background:#fff;border:1px solid #e3eaef;border-radius:12px;padding:14px 16px;box-shadow:0 1px 3px rgba(20,40,60,.05)}
 #awTheme .themeKpiCard small{color:#6b7f90;font-size:12px}
 #awTheme .themeKpiCard b{display:block;font-size:26px;margin-top:4px;color:#1d3b52}
 #awTheme .themeKpiCard.warn b{color:#c0392b}
 #awTheme .themeKpiCard.good b{color:#1a8754}
 #awTheme .themeTwoTrack{display:flex;gap:10px;margin:4px 0 10px;flex-wrap:wrap}
 #awTheme .themeTrackCard{flex:1;min-width:220px;border:1px solid #dce5eb;border-radius:10px;padding:12px 14px;font-size:12.5px;color:#4d6478;background:#fff}
 #awTheme .themeTrackCard b{display:block;color:#24445c;margin-bottom:3px}
 #awTheme .themeSectionHead{display:flex;justify-content:space-between;align-items:center;margin:20px 0 10px;flex-wrap:wrap;gap:8px}
 #awTheme .themeSectionHead h3{margin:0;font-size:15px;color:#1d3b52}
 #awTheme .themeControls{display:flex;gap:10px;align-items:center;margin:4px 0;flex-wrap:wrap}
 #awTheme .themeControls select{padding:7px 10px;border:1px solid #c8d9e5;border-radius:8px;font-size:13px}
 #awTheme .themeMatrixWrap{background:#fff;border:1px solid #e3eaef;border-radius:12px;padding:14px;box-shadow:0 1px 3px rgba(20,40,60,.05)}
 #awTheme table.themeMatrix{width:100%;border-collapse:collapse;font-size:13px}
 #awTheme table.themeMatrix th,#awTheme table.themeMatrix td{border:1px solid #e3eaef;padding:0;text-align:center}
 #awTheme table.themeMatrix th{background:#eef4f8;color:#2c4a63;padding:8px 6px;font-weight:700}
 #awTheme table.themeMatrix td.rowHead{background:#f7fafc;font-weight:700;text-align:left;padding:8px 10px;color:#2c4a63;cursor:pointer}
 #awTheme table.themeMatrix td.rowHead:hover{background:#eaf1f7}
 #awTheme table.themeMatrix td.cell{height:46px;font-weight:800;font-size:14px;color:#24445c;cursor:pointer;transition:outline .1s}
 #awTheme table.themeMatrix td.cell:hover{outline:2px solid #2c72bb;outline-offset:-2px}
 #awTheme table.themeMatrix td.cell.sel{outline:2px solid #1d3b52;outline-offset:-2px}
 #awTheme .themeEmptyNote{margin-top:10px;padding:10px 12px;background:#fff8e6;border:1px solid #f0d99a;border-radius:8px;color:#8a6417;font-size:12.5px}
 #awTheme .themeHistoryBox{margin-top:16px;background:#fff;border:1px solid #e3eaef;border-radius:12px;padding:14px;box-shadow:0 1px 3px rgba(20,40,60,.05)}
 #awTheme .themeHistoryWrap{overflow:auto;border:1px solid #e3eaef;border-radius:8px}
 #awTheme table.themeHistoryTable{width:100%;min-width:780px;border-collapse:collapse;font-size:12.5px}
 #awTheme table.themeHistoryTable th,#awTheme table.themeHistoryTable td{padding:9px 10px;border-bottom:1px solid #e7eef3;text-align:left;vertical-align:top}
 #awTheme table.themeHistoryTable th{background:#f3f7fa;color:#31516a;white-space:nowrap}
 #awTheme table.themeHistoryTable td.num{text-align:center;font-variant-numeric:tabular-nums;white-space:nowrap}
 #awTheme .themeHistoryMeta{font-size:12px;color:#708598;margin-bottom:8px}
 #awTheme #themeProgress{font-size:12px;color:#557187;align-self:center}
 #awTheme .themeAuditBox{margin-top:16px;background:#fff;border:1px solid #dce5eb;border-radius:12px;padding:16px;box-shadow:0 1px 3px rgba(20,40,60,.05)}
 #awTheme .themeBulkRow{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 4px}
 #awTheme .themeBulkBtn{padding:6px 12px;border:1px solid #c8d9e5;border-radius:999px;background:#f7fafc;cursor:pointer;font-size:12.5px;color:#345369}
 #awTheme .themeBulkBtn:hover{background:#eaf1f7}
 #awTheme .themeChecklistGroup{margin-top:14px}
 #awTheme .themeChecklistGroup>.catHead{display:flex;justify-content:space-between;align-items:center;color:#24445c;font-size:13.5px;font-weight:700;margin:12px 0 6px;padding-top:10px;border-top:1px solid #eef2f5}
 #awTheme .themeChecklistGroup>.catHead button{padding:3px 9px;font-size:11.5px;border:1px solid #cfe0ea;border-radius:999px;background:#fff;cursor:pointer;color:#4a6577}
 #awTheme .themeCheckRow{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 2px;font-size:13px}
 #awTheme .themeCheckRow .itemText{flex:1}
 #awTheme .themeCheckRow .themeToggle{display:flex;gap:6px}
 #awTheme .themeCheckRow button{padding:4px 12px;border-radius:999px;border:1px solid #c8d9e5;background:#fff;cursor:pointer;font-size:12px}
 #awTheme .themeCheckRow button.active.ok{background:#1a8754;border-color:#1a8754;color:#fff}
 #awTheme .themeCheckRow button.active.ng{background:#c0392b;border-color:#c0392b;color:#fff}
 #awTheme .themeSaveBtn{margin-top:16px;padding:10px 18px;border:0;border-radius:8px;background:#2c72bb;color:#fff;font-weight:700;cursor:pointer;font-size:13.5px}
 #awTheme .themeSaveBtn:hover{background:#215a95}
 #awTheme .themeSaveResult{margin-top:10px;padding:9px 11px;border-radius:8px;font-size:12.5px;display:none}
 #awTheme .themeSaveResult.on{display:block;background:#eef8f0;color:#1a6b3c}
 `;document.head.appendChild(s);
}
function monthOptions(){
 const actionMonths=load().filter(x=>x.source==='테마Audit').flatMap(x=>[monthKey(x.auditMonth||x.createdAt||x.date),monthKey(x.lastAuditMonth||x.lastAuditedAt)]);
 const auditMonths=loadChecks().map(x=>monthKey(x.month||x.auditedAt));
 const planMonths=loadPlans().map(x=>monthKey(x.month));
 const set=new Set([...actionMonths,...auditMonths,...planMonths].filter(Boolean));
 set.add(thisMonth());
 return[...set].sort().reverse();
}
function matrixData(month){
 const audits=loadChecks().filter(x=>ownerOf(x)===selectedOwner()&&(selectedOwner()!=='team'||x.team===document.getElementById('awTheme')?.dataset.team)&&monthKey(x.month||x.auditedAt)===month);
 const latestByLine=new Map();
 audits.forEach(rec=>{const prev=latestByLine.get(rec.line);if(!prev||String(rec.auditedAt||'').localeCompare(String(prev.auditedAt||''))>=0)latestByLine.set(rec.line,rec)});
 const rows=[...latestByLine.values()];
 const grid=LINES.map(line=>THEMES.map(theme=>{
   const rec=latestByLine.get(line);
   if(!plannedThemes(month,line).includes(theme))return null;
   return rec?CHECKLIST.filter(item=>item.cat===theme&&rec.states?.[item.cat+'::'+item.item]==='미흡'):[];
 }));
 return{grid,rows};
}
function cellColor(n){if(n<=0)return'#ffffff';if(n===1)return'#fff3d6';if(n===2)return'#ffe2a8';if(n<=4)return'#ffc877';return'#ff9d52'}
function kpis(month){
 const allChecks=loadChecks().filter(x=>ownerOf(x)===selectedOwner()&&(selectedOwner()!=='team'||x.team===document.getElementById('awTheme')?.dataset.team)&&monthKey(x.month||x.auditedAt)===month);
 const latestByLine=new Map();
 allChecks.forEach(rec=>{const prev=latestByLine.get(rec.line);if(!prev||String(rec.auditedAt||'').localeCompare(String(prev.auditedAt||''))>=0)latestByLine.set(rec.line,rec)});
 const checks=[...latestByLine.values()];
 const linesAudited=checks.length;
 let ok=0,ng=0;
 checks.forEach(c=>Object.values(c.states||{}).forEach(v=>{if(v==='적합')ok++;else if(v==='미흡')ng++}));
 const total=ok+ng;
 const actionRows=load().filter(x=>x.source==='테마Audit'),linkedIds=new Set();
 checks.forEach(rec=>{
   const ids=Array.isArray(rec.linkedActionIds)&&rec.linkedActionIds.length?rec.linkedActionIds:actionRows.filter(a=>a.auditRecordId===rec.id||(Array.isArray(a.relatedAuditRecordIds)&&a.relatedAuditRecordIds.includes(rec.id))).map(a=>a.id);
   ids.forEach(id=>linkedIds.add(id));
 });
 const autoRegistered=linkedIds.size;
 const okRate=total?Math.round(ok/total*100):null;
 return{linesAudited,ng,autoRegistered,okRate};
}
function historyTable(month){
 const all=loadChecks().filter(x=>ownerOf(x)===selectedOwner()&&(selectedOwner()!=='team'||x.team===document.getElementById('awTheme')?.dataset.team)&&monthKey(x.month||x.auditedAt)===month).sort((a,b)=>String(b.auditedAt||'').localeCompare(String(a.auditedAt||'')));
 if(!all.length)return '<div class="themeEmptyNote">이번 달 점검 이력이 없습니다. 점검 결과를 저장하면 회차별 이력이 여기에 누적됩니다.</div>';
 const actions=load();
 const body=all.slice(0,8).map(rec=>{
   const values=Object.values(rec.states||{}),ok=values.filter(v=>v==='적합').length,ng=values.filter(v=>v==='미흡').length,total=ok+ng;
   const linked=Array.isArray(rec.linkedActionIds)&&rec.linkedActionIds.length?rec.linkedActionIds:actions.filter(a=>a.source==='테마Audit'&&(a.auditRecordId===rec.id||(Array.isArray(a.relatedAuditRecordIds)&&a.relatedAuditRecordIds.includes(rec.id)))).map(a=>a.id);
   return '<tr><td>'+esc(formatAuditDate(rec.auditedAt))+'</td><td>'+esc(rec.line||'—')+'</td><td>'+esc(rec.team||'—')+'</td><td class="num">'+ng+'</td><td class="num">'+(total?Math.round(ok/total*100)+'%':'—')+'</td><td class="num">'+linked.length+'</td><td>'+esc(String(rec.memo||'').slice(0,70)||'—')+'</td></tr>';
 }).join('');
 return '<div class="themeHistoryMeta">총 '+all.length+'회 · 최신 '+Math.min(all.length,8)+'회 표시 · 재점검 기록은 이전 회차를 덮어쓰지 않습니다.</div><div class="themeHistoryWrap"><table class="themeHistoryTable"><thead><tr><th>점검 일시</th><th>라인</th><th>담당 생산팀</th><th>미흡</th><th>적합률</th><th>연계 조치</th><th>현장 관찰 메모</th></tr></thead><tbody>'+body+'</tbody></table></div>';
}
function hasUnsavedThemeAudit(host){
 return host?.dataset.themeAuditDirty==='1'||
 !!host?.querySelector('#themeAuditAuditor')?.value.trim()||
 !!host?.querySelector('#themeAuditMemo')?.value.trim()||
 !!host?.querySelector('#themeAuditPhoto')?.files?.length;
}
function confirmThemeNavigation(host){
 if(!hasUnsavedThemeAudit(host))return true;
 if(!window.confirm('저장하지 않은 현장점검 판정·메모·사진이 있습니다. 이동하면 입력내용이 사라집니다. 계속하시겠습니까?'))return false;
 // Abandoning the draft must release the pending master refresh; otherwise old
 // checklist data stays loaded even after the user explicitly leaves the editor.
 host.dataset.themeAuditDirty='0';
 host._themeFindingDrafts={};
 const auditor=host.querySelector('#themeAuditAuditor'),memo=host.querySelector('#themeAuditMemo'),photo=host.querySelector('#themeAuditPhoto');
 if(auditor)auditor.value='';
 if(memo)memo.value='';
 if(photo)photo.value='';
 return true;
}
function render(){
 const host=document.getElementById('awTheme');if(!host)return;
 if(host.dataset.pendingThemeMasterRefresh==='1'&&!hasUnsavedThemeAudit(host)){
  const fresh=window.HD20ThemeMaster?.checklist?.()||[];
  CHECKLIST=[...fresh];
  THEMES=activeThemeNames(fresh);
  delete host.dataset.pendingThemeMasterRefresh;
 }
 const month=host.dataset.month||thisMonth();host.dataset.month=month;
 const line=host.dataset.line||LINES[0];host.dataset.line=line;
 const team=host.dataset.team||LINE_DEFAULT_TEAM[line]||teamOptions()[0]||'';host.dataset.team=team;
 const monthOpts=monthOptions();
 const view=host.dataset.view||'plan';host.dataset.view=view;
 const owner=selectedOwner();host.dataset.inspectionOwner=owner;
 const mappedTeam=owner==='team'?sessionTeam():'';
 if(mappedTeam&&host.dataset.team!==mappedTeam){host.dataset.team=mappedTeam;return render();}
 const planThemes=plannedThemes(month,line,owner,team);
 const obsoleteThemes=obsoletePlanThemes(month,line,owner,team);
 const obsoleteNotice=obsoleteThemes.length
  ?'<div class="themePlanStale" role="alert"><strong>기준정보 변경으로 적용할 수 없는 계획 테마 '+obsoleteThemes.length+'개</strong><span>'+obsoleteThemes.map(esc).join(' · ')+'</span><small>과거 계획·점검 이력은 보존됩니다. 최신 기준의 취약테마를 선택해 [계획 저장]으로 다시 지정하세요.</small></div>':'';

 const pageSize=10,totalPages=Math.max(1,Math.ceil(LINES.length/pageSize));
 const page=Math.min(Math.max(0,Number(host.dataset.planPage)||0),totalPages-1);host.dataset.planPage=String(page);
 const auditRows=loadChecks().filter(x=>ownerOf(x)===owner&&(owner!=='team'||x.team===team)&&monthKey(x.month||x.auditedAt)===month);
 const latestAuditByLine=new Map();
 auditRows.forEach(rec=>{const prev=latestAuditByLine.get(rec.line);if(!prev||String(rec.auditedAt||'').localeCompare(String(prev.auditedAt||''))>=0)latestAuditByLine.set(rec.line,rec)});
 const monthAuditIds=themeAuditIdsForMonth(auditRows,month);const monthActions=load().filter(x=>themeActionLinkedToChecks(x,monthAuditIds));
 const lineSummaryRows=LINES.slice(page*pageSize,(page+1)*pageSize).map(ln=>{
   const themes=plannedThemes(month,ln,owner,team),rec=latestAuditByLine.get(ln),states=Object.values(rec?.states||{});
   const ng=states.filter(v=>v==='미흡').length;
   const actionCount=monthActions.filter(a=>a.workplace===ln).length;
   const themeChips=themes.length?themes.map(t=>'<span class="themeLineChip">'+esc(t)+'</span>').join(''):'<span class="themePlanMissing">계획 미설정</span>';
   return '<div class="themeLineSummaryRow '+(ln===line?'isSelected':'')+'"><div class="themeLineName">'+esc(ln)+'</div><div><div class="themeLineChips">'+themeChips+'</div></div><div class="themeLineDate">'+(rec?esc(formatAuditDate(rec.auditedAt)):'<span class="themeMuted">미실시</span>')+'</div><div><span class="themeCountPill '+(ng?'hasFinding':'')+'">'+ng+'건</span></div><div><span class="themeCountPill">'+actionCount+'건</span></div><div><button type="button" class="themeLineAction" data-pick-line="'+esc(ln)+'">현장점검 열기</button></div></div>';
 }).join('');
 host.innerHTML=`<div class="awHero">
   <div><h2>테마점검</h2><div class="themeSubtitle">월별·라인별 취약테마 설정부터 현장점검, 개선조치 접수·완료, 재점검까지 관리합니다.</div><span class="themeOwner">${ownerTitle(owner)}</span></div>
   <div class="themeControls"><label>조회 월 <select id="themeMonthSel">${monthOpts.map(m=>`<option${m===month?' selected':''}>${m}</option>`).join('')}</select></label></div>
 </div>
 <div class="themeOwnerSwitch" role="group" aria-label="테마점검 운영 주체">
  <button type="button" data-theme-owner="module" class="${owner==='module'?'active':''}" aria-pressed="${owner==='module'}">5S모듈 주관</button>
  <button type="button" data-theme-owner="team" class="${owner==='team'?'active':''}" aria-pressed="${owner==='team'}">생산팀장 자율</button>
  <span class="themeOwnerExplanation">${owner==='module'?'5S모듈 주관으로 취약테마·대상 라인을 지정해 점검합니다.':'생산팀장이 담당 라인의 취약테마를 선정하여 자율점검합니다.'}</span>
 </div>
 <nav class="themeTabNav" aria-label="테마점검 작업영역">
   <button type="button" data-theme-view="plan" data-step="01" class="${view==='plan'?'active':''}">점검계획·취약현황</button>
   <button type="button" data-theme-view="audit" data-step="02" class="${view==='audit'?'active':''}">현장점검 실시</button>
   <button type="button" data-theme-view="actions" data-step="03" class="${view==='actions'?'active':''}">미흡·개선조치 추적</button>
   <button type="button" data-theme-view="history" data-step="04" class="${view==='history'?'active':''}">재점검·이력</button>
 </nav>
 <section class="themePanel" data-theme-panel="plan" ${view==='plan'?'':'hidden'}>
 <div class="themePlanBox">${owner==='team'?'<div class="themeSelfTeamSelector"><label>자율점검 생산팀 <select id="themeSelfPlanTeam" '+(mappedTeam?'disabled':'')+'>'+teamOptions().map(t=>'<option'+(t===team?' selected':'')+'>'+esc(t)+'</option>').join('')+'</select></label><small>'+(mappedTeam?'등록된 팀장 이메일 기준 담당 생산팀 자동 적용':'담당 생산팀이 자동 확인되지 않았습니다. 마스터의 이메일 정보를 확인해 주세요.')+'</small></div>':''}<div class="themeSectionHead"><h3>월별·라인별 취약 테마 계획</h3><small>${owner==='team'?'생산팀장이 담당 생산팀·라인의 취약테마를 직접 선정합니다.':'5S 모듈이 해당 월에 중점 점검할 테마를 지정합니다.'}</small></div>
 <div class="themeControls"><label>계획 라인/구역 <select id="themePlanLineSel">${LINES.map(l=>`<option${l===line?' selected':''}>${esc(l)}</option>`).join('')}</select></label><span class="themePlanHint">체크한 테마만 현장 점검표에 표시됩니다. 기존 점검 이력은 보존됩니다.</span></div>
 <div class="themePlanChoices">${THEMES.map(t=>`<label><input type="checkbox" name="themePlanTheme" value="${esc(t)}" ${planThemes.includes(t)?'checked':''}><span>${esc(t)}</span></label>`).join('')}</div>
 <div class="themePlanFooter"><span>선택 테마 <b id="themePlanCount">${planThemes.length}</b> / ${THEMES.length} · <b class="themePlanState">${planThemes.length?'계획 설정됨':'계획 미설정'}</b></span><button type="button" class="themePlanSave" id="themeSavePlanBtn">계획 저장</button></div>${obsoleteNotice}${planThemes.length?'':'<div class="themeEmptyNote themePlanEmpty">선택 월·라인의 취약테마가 지정되지 않았습니다. 점검 주체에 맞는 계획을 먼저 저장해 주세요.</div>'}</div>
 <div class="themeSectionHead"><h3>라인별 점검 준비·실행 현황</h3><small>계획 테마 · 최근 Audit · 미흡 건 · 연결 조치를 한 행에서 확인</small></div>
 <div class="themeLineSummary">
   <div class="themeLineSummaryHead"><span>라인 / 구역</span><span>계획된 취약 테마</span><span>최근 점검</span><span>미흡</span><span>연계 조치</span><span></span></div>
   <div class="themeLineSummaryBody">${lineSummaryRows}</div>
 </div>
 <div class="themePageControls" aria-label="라인별 점검현황 페이지"><span>전체 ${LINES.length}개 라인 · ${page+1}/${totalPages} 페이지 (페이지당 최대 ${pageSize}개)</span><button type="button" data-theme-page="-1" ${page===0?'disabled':''}>이전</button><button type="button" data-theme-page="1" ${page===totalPages-1?'disabled':''}>다음</button></div>
 <div class="themeSummaryFoot">라인을 선택하면 해당 라인의 현장점검 화면으로 이동합니다. 점검계획이 없는 라인은 먼저 계획을 저장해야 Audit 결과를 등록할 수 있습니다.</div> </section>
 <section class="themePanel" data-theme-panel="history" ${view==='history'?'':'hidden'}><div class="themeHistoryBox"><div class="themeSectionHead" style="margin-top:0"><h3>최근 점검 이력</h3><small>선택 월의 점검 회차·미흡 건수·연계 조치를 확인합니다</small></div>${historyTable(month)}</div></section>
 <section class="themePanel" data-theme-panel="audit" ${view==='audit'?'':'hidden'}><div class="themeAuditBox" id="themeAuditBox">
   <div class="themeSectionHead themeAuditTitle" style="margin-top:0"><h3>현장점검 실시 <span class="themeAuditLineBadge" id="themeAuditLineLabel">${esc(line)}</span></h3><span class="themeAuditOwnerName">${ownerTitle(owner)}</span></div>
   <div class="themeControls">
     <label>라인 <select id="themeLineSel">${LINES.map(l=>`<option${l===line?' selected':''}>${esc(l)}</option>`).join('')}</select></label>
     <label>담당 생산팀 <select id="themeTeamSel" ${owner==='team'?'disabled':''}>${teamOptions().map(t=>`<option${t===team?' selected':''}>${esc(t)}</option>`).join('')}</select></label>
   </div>
   <div class="themeAuditFlowLabel">01 · 취약테마 집중점검 <small>테마를 선택해 평가합니다. 다른 테마의 판정은 유지됩니다.</small></div>
   <div id="themeThemeTabs" class="themeThemeTabs" role="group" aria-label="점검 취약테마 선택"></div>
   <details class="themeBulkTools"><summary>일괄 평가·직전 결과 참고 (선택)</summary><div class="themeBulkRow"><span class="themeWorkflowNote">평가 보조 도구</span>
     <button type="button" class="themeBulkBtn" id="themeBulkAllOk">전체 적합으로 일괄 설정</button>
     <button type="button" class="themeBulkBtn" id="themeLoadPrevious">직전 결과 참고</button>
     <button type="button" class="themeBulkBtn" id="themeBulkClear">전체 초기화</button>
     <span id="themePreviousNote" class="themePreviousNote" aria-live="polite"></span>
   </div></details>
   <div id="themeChecklistWrap"></div>
   <div class="themeAuditFlowLabel">02 · 미흡사항·현장 증빙 <small>미흡 판정된 항목을 확인하고 현장 증빙을 입력합니다.</small></div>
   <div id="themeFindingList" class="themeFindingList" aria-live="polite"></div>
   <div class="themeAuditMeta"><label class="themeAuditAuditorField">최초 점검자 <input id="themeAuditAuditor" type="text" maxlength="80" placeholder="점검자 성명 (필수)" required></label><label class="themeAuditPhotoField">현장사진 <input id="themeAuditPhoto" type="file" accept="image/jpeg,image/png,image/webp"><small>미흡 항목 발생 시 사진 필수 · 최대 1MB</small></label><label class="themeAuditMemoField">현장 관찰 메모 <textarea id="themeAuditMemo" rows="2" placeholder="현장 특이사항, 즉시조치, 재발 위험 등을 기록"></textarea></label><div id="themeProgress" aria-live="polite"></div></div><div class="themeAuditFlowLabel">03 · 평가결과 저장 <small>전체 항목 판정을 완료한 뒤 저장합니다. 미흡은 개선조치와 연결됩니다.</small></div>
   <button type="button" class="themeSaveBtn" id="themeSaveBtn">점검 결과 저장 · 미흡 항목 자동 등록</button>
   <div class="themeSaveResult" id="themeSaveResult"></div>
 </div></section>
 <section class="themePanel" data-theme-panel="actions" ${view==='actions'?'':'hidden'}><details class="themeHistoryBox"><summary style="cursor:pointer;padding:10px 14px;font-weight:800;color:#24516f">상세 원본 점검·개선조치 이력 보기</summary><div class="themeSectionHead" style="margin-top:0"><h3>테마점검 원본 개선조치 추적</h3><small>기존 등록·완료 이력을 보존한 상세조회</small></div>${actionTable(month)}</details></section>`;
 // Preserve a confirmed save acknowledgement across event-triggered re-renders of the same audit context.
 const resultBox=$('#themeSaveResult',host);
 if(resultBox&&host.dataset.themeSaveContext===month+'|'+line+'|'+owner+'|'+team&&host.dataset.themeSaveResult){
   resultBox.classList.add('on');
   resultBox.textContent=host.dataset.themeSaveResult;
 }
 // Mount only the selected workspace. Hidden panels must never retain tall layout boxes.
 host.querySelectorAll('.themePanel[hidden]').forEach(panel=>panel.remove());
 $('#themeMonthSel',host).addEventListener('change',e=>{if(!confirmThemeNavigation(host)){e.target.value=host.dataset.month;return}host.dataset.month=e.target.value;host.dataset.focusTheme='';render()});
  const actionSearch=$('#themeActionSearch',host),actionStatus=$('#themeActionStatus',host),actionRecurrence=$('#themeActionRecurrence',host);
  const filterActions=()=>{const query=(actionSearch?.value||'').trim().toLocaleLowerCase(),status=actionStatus?.value||'',rows=Array.from(host.querySelectorAll('#themeActionTableBody tr'));let shown=0;rows.forEach(row=>{const visible=(!query||(row.dataset.search||'').includes(query))&&(!status||row.dataset.status===status)&&(!actionRecurrence?.value||row.dataset.recurrence===actionRecurrence.value);row.hidden=!visible;if(visible)shown++});const count=$('#themeActionCount',host);if(count)count.textContent='표시 '+shown+'/'+rows.length+'건';const empty=$('#themeActionNoResults',host);if(empty)empty.hidden=shown>0};
  actionSearch?.addEventListener('input',filterActions);actionStatus?.addEventListener('change',filterActions);actionRecurrence?.addEventListener('change',filterActions);
 Array.from(host.querySelectorAll('[data-theme-page]')).forEach(btn=>btn.addEventListener('click',()=>{host.dataset.planPage=String(Math.min(totalPages-1,Math.max(0,page+Number(btn.dataset.themePage))));render()}));
 Array.from(host.querySelectorAll('[data-theme-owner]')).forEach(btn=>btn.addEventListener('click',()=>{if(host.dataset.inspectionOwner===btn.dataset.themeOwner||!confirmThemeNavigation(host))return;host.dataset.inspectionOwner=btn.dataset.themeOwner;host.dataset.view='plan';host.dataset.focusTheme='';host.dataset.planPage='0';render()}));
 Array.from(host.querySelectorAll('[data-theme-view]')).forEach(btn=>btn.addEventListener('click',()=>{if(host.dataset.view===btn.dataset.themeView||!confirmThemeNavigation(host))return;host.dataset.view=btn.dataset.themeView;render()}));
 $('#themeSelfPlanTeam',host)?.addEventListener('change',e=>{host.dataset.team=e.target.value;host.dataset.planPage='0';render()});
 $('#themePlanLineSel',host)?.addEventListener('change',e=>{host.dataset.line=e.target.value;host.dataset.team=owner==='team'?host.dataset.team:(LINE_DEFAULT_TEAM[e.target.value]||host.dataset.team);render()});
 Array.from(host.querySelectorAll('input[name="themePlanTheme"]')).forEach(box=>box.addEventListener('change',()=>{const n=host.querySelectorAll('input[name="themePlanTheme"]:checked').length;const count=$('#themePlanCount',host);if(count)count.textContent=n}));
 $('#themeSavePlanBtn',host)?.addEventListener('click',()=>{const selected=Array.from(host.querySelectorAll('input[name="themePlanTheme"]:checked')).map(x=>x.value);if(!selected.length){alert('최소 1개 이상의 취약 테마를 선택해 주세요.');return}const missing=obsoletePlanThemes(month,host.dataset.line,owner,host.dataset.team);
 if(missing.length&&!window.confirm('기존 점검계획에 현재 사용하지 않는 테마 '+missing.length+'개가 있습니다.\n'+missing.join(' · ')+'\n이 항목들은 새 계획에서 제외하되 기존 이력은 보존합니다. 계속하시겠습니까?'))return;
 const plans=loadPlans(),entry={month,line:host.dataset.line,team:owner==='team'?host.dataset.team:'',themes:selected,inspectionOwner:owner,updatedAt:new Date().toISOString()};const i=plans.findIndex(x=>x.month===month&&x.line===host.dataset.line&&ownerOf(x)===owner&&(owner!=='team'||x.team===host.dataset.team));if(i>=0)plans[i]=entry;else plans.push(entry);if(!savePlans(plans)){alert('점검계획 저장에 실패했습니다. 저장공간을 확인해 주세요.');return}render()});
 $('#themeLineSel',host)?.addEventListener('change',e=>{if(!confirmThemeNavigation(host)){e.target.value=host.dataset.line;return}host.dataset.line=e.target.value;host.dataset.focusTheme='';host.dataset.team=owner==='team'?host.dataset.team:(LINE_DEFAULT_TEAM[e.target.value]||host.dataset.team);render()});
 $('#themeTeamSel',host)?.addEventListener('change',e=>{if(!confirmThemeNavigation(host)){e.target.value=host.dataset.team;return}host.dataset.team=e.target.value;render()});
 $('#themeSaveBtn',host)?.addEventListener('click',async e=>{
   const button=e.currentTarget;
   if(button.dataset.saving==='true')return;
   button.dataset.saving='true';button.disabled=true;
   try{await saveAudit()}catch(error){console.error('[HD20 Theme] unexpected audit save error',error);alert('점검 저장 중 오류가 발생했습니다. 저장 결과를 확인한 뒤 다시 시도해 주세요.')}finally{button.dataset.saving='false';button.disabled=false}
 });
 $('#themeBulkAllOk',host)?.addEventListener('click',()=>bulkSet('적합'));
 $('#themeLoadPrevious',host)?.addEventListener('click',loadPreviousJudgements);
  $('#themeBulkClear',host)?.addEventListener('click',()=>{bulkSet('');const note=$('#themePreviousNote',host);if(note)note.textContent='새 회차 입력 상태로 초기화했습니다.'});
 Array.from(host.querySelectorAll('[data-pick-line]')).forEach(el=>el.addEventListener('click',()=>{
   if(!confirmThemeNavigation(host))return;
   const ln=el.getAttribute('data-pick-line');
   host.dataset.line=ln;host.dataset.focusTheme='';host.dataset.team=owner==='team'?host.dataset.team:(LINE_DEFAULT_TEAM[ln]||host.dataset.team);host.dataset.view='audit';render();
   $('#themeAuditBox',host)?.scrollIntoView({behavior:'smooth',block:'start'});
 }));
 renderChecklist();
}
function syncLineLabel(){const host=document.getElementById('awTheme');const lab=document.getElementById('themeAuditLineLabel');if(lab)lab.textContent=host.dataset.line}
function refreshMatrixSelection(){
 const host=document.getElementById('awTheme');const line=host.dataset.line;
 $$('.themeMatrix td',host).forEach(td=>{
   const ln=td.getAttribute('data-pick-line');if(!ln)return;
   td.classList.toggle('sel',ln===line&&td.classList.contains('cell'));
 });
}
function checklistState(line){return {}}
function loadPreviousJudgements(){
 const host=document.getElementById('awTheme');if(!host)return;
 const line=host.dataset.line,month=host.dataset.month;
 const rec=loadChecks().filter(x=>x.line===line&&ownerOf(x)===selectedOwner()&&(selectedOwner()!=='team'||x.team===host.dataset.team)&&monthKey(x.month||x.auditedAt)===month).sort((a,b)=>String(b.auditedAt||'').localeCompare(String(a.auditedAt||'')))[0];
 if(!rec){alert('선택한 점검 주체·생산팀·라인·월에 참고할 이전 결과가 없습니다.');return}
 const wrap=$('#themeChecklistWrap',host);
 $$('.themeCheckRow',wrap).forEach(row=>{
  const value=rec.states?.[row.dataset.key]||'';
  $$('button',row).forEach(btn=>{btn.classList.remove('active','ok','ng');if(btn.dataset.v===value)btn.classList.add('active',value==='적합'?'ok':'ng')});
 });
 const memo=$('#themeAuditMemo',host);if(memo)memo.value='';
 host.dataset.themeAuditDirty='1';
 updateProgress();
 const note=$('#themePreviousNote',host);
 if(note)note.textContent='직전 회차 결과를 참고용으로 불러왔습니다. 현장 확인 후 수정하고 새 회차로 저장하세요.';
}
function themeFindingDraft(host,key){return host._themeFindingDrafts?.[key]||{}}
function themeFileToData(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result||''));reader.onerror=()=>reject(new Error('사진 읽기 실패'));reader.readAsDataURL(file)})}
function updateProgress(){
 const host=document.getElementById('awTheme');if(!host)return;
 const rows=$$('.themeCheckRow',host),done=rows.filter(row=>row.querySelector('button.active')).length,ng=rows.filter(row=>row.querySelector('button.active[data-v="미흡"]')).length;
 const el=$('#themeProgress',host);if(el)el.textContent='판정 '+done+'/'+rows.length+'개 · 미흡 '+ng+'건 · 미판정 '+(rows.length-done)+'건';
 const findings=$('#themeFindingList',host);
 if(findings){
  const ngRows=rows.filter(row=>row.querySelector('button.active[data-v="미흡"]'));
  const drafts=host._themeFindingDrafts||(host._themeFindingDrafts={});
  findings.innerHTML=ngRows.length?ngRows.map((r,i)=>{
   const key=r.dataset.key,d=drafts[key]||{};
   return '<div class="themeFindingItem" data-finding-key="'+esc(key)+'"><div class="themeFindingHeader"><b>'+(i+1)+'. '+esc(r.dataset.cat)+'</b><span>'+esc(r.dataset.item)+'</span></div><label>발견내용·개선요청사항 <textarea data-finding-note rows="2" placeholder="현장 미흡 상태 및 필요한 개선내용을 입력">'+esc(d.note||'')+'</textarea></label><label>해당 항목 현장사진 <input data-finding-photo type="file" accept="image/jpeg,image/png,image/webp"><small>'+(d.photoFile?'선택됨: '+esc(d.photoFile.name):'항목별 사진 미선택 시 아래 공통 현장사진을 적용')+'</small></label></div>';
  }).join(''):'<div class="themeFindingEmpty">현재 미흡 판정된 항목이 없습니다.</div>';
  findings.querySelectorAll('[data-finding-key]').forEach(box=>{
   const key=box.dataset.findingKey;
   box.querySelector('[data-finding-note]')?.addEventListener('input',e=>{(drafts[key]||(drafts[key]={})).note=e.target.value;host.dataset.themeAuditDirty='1'});
   box.querySelector('[data-finding-photo]')?.addEventListener('change',e=>{(drafts[key]||(drafts[key]={})).photoFile=e.target.files?.[0]||null;host.dataset.themeAuditDirty='1';const el=box.querySelector('small');if(el)el.textContent=drafts[key].photoFile?'선택됨: '+drafts[key].photoFile.name:'항목별 사진 미선택 시 공통 현장사진 적용'});
  });
 }
 const tabs=$$('#themeThemeTabs button[data-focus-theme]',host);
 tabs.forEach(btn=>{const related=rows.filter(r=>r.dataset.cat===btn.dataset.focusTheme);const passed=related.filter(r=>r.querySelector('button.active')).length;const failed=related.filter(r=>r.querySelector('button.active[data-v="미흡"]')).length;const count=btn.querySelector('.themeThemeTabCount');if(count)count.textContent=passed+'/'+related.length+(failed?' · 미흡 '+failed:'')});
}
function renderChecklist(){
 const host=document.getElementById('awTheme');if(!host)return;
 const wrap=document.getElementById('themeChecklistWrap');if(!wrap)return;
 const line=host.dataset.line;
 const states=checklistState(line);
 const activeThemes=plannedThemes(host.dataset.month,line);
 const groups=THEMES.filter(cat=>activeThemes.includes(cat)).map(cat=>{
   const items=CHECKLIST.filter(c=>c.cat===cat);
   const rows=items.map((it)=>{
     const key=cat+'::'+it.item;
     const s=states[key]||'';
     return `<div class="themeCheckRow" data-key="${esc(key)}" data-cat="${esc(cat)}" data-item="${esc(it.item)}">
       <span class="itemText">${esc(it.item)}</span>
       <span class="themeToggle">
         <button type="button" data-v="적합" class="${s==='적합'?'active ok':''}">적합</button>
         <button type="button" data-v="미흡" class="${s==='미흡'?'active ng':''}">미흡</button>
       </span>
     </div>`;
   }).join('');
   return `<div class="themeChecklistGroup" data-theme-cat="${esc(cat)}"><div class="catHead"><span>${esc(cat)}</span><button type="button" data-cat-ok="${esc(cat)}">이 분류만 적합으로</button></div>${rows}</div>`;
 }).join('');
 wrap.innerHTML=groups;
 const tabs=$('#themeThemeTabs',host),categories=THEMES.filter(cat=>activeThemes.includes(cat));
 if(!categories.length){wrap.innerHTML='<div class="themeEmptyNote">해당 점검 주체·생산팀·라인의 취약테마 계획이 없습니다. [점검계획·취약현황]에서 테마를 지정하고 저장해 주세요.</div>';}
 if(tabs){tabs.innerHTML=categories.map(cat=>'<button type="button" data-focus-theme="'+esc(cat)+'"><span>'+esc(cat)+'</span><small class="themeThemeTabCount"></small></button>').join('');const chosen=categories.includes(host.dataset.focusTheme)?host.dataset.focusTheme:categories[0]||'';host.dataset.focusTheme=chosen;const activate=cat=>{host.dataset.focusTheme=cat;tabs.querySelectorAll('button').forEach(btn=>{const active=btn.dataset.focusTheme===cat;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active))});wrap.querySelectorAll('.themeChecklistGroup').forEach(group=>{group.hidden=group.dataset.themeCat!==cat})};tabs.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>activate(btn.dataset.focusTheme)));activate(chosen);}
 $('.themeCheckRow',wrap).forEach(row=>{
   $$('button',row).forEach(btn=>btn.addEventListener('click',()=>{
     $$('button',row).forEach(b=>b.classList.remove('active','ok','ng'));
     btn.classList.add('active',btn.dataset.v==='적합'?'ok':'ng');
     host.dataset.themeAuditDirty='1';
     updateProgress();
   }));
 });
 $$('[data-cat-ok]',wrap).forEach(btn=>btn.addEventListener('click',()=>{
   const cat=btn.getAttribute('data-cat-ok');
   $$('.themeCheckRow',wrap).forEach(row=>{
     if(row.dataset.cat!==cat)return;
     $$('button',row).forEach(b=>b.classList.remove('active','ok','ng'));
     const okBtn=[...row.querySelectorAll('button')].find(b=>b.dataset.v==='적합');
     okBtn?.classList.add('active','ok');
   });
   host.dataset.themeAuditDirty='1';
   updateProgress();
 }));
 updateProgress();
}
/* "전체 적합으로 일괄 설정" / "전체 초기화" — 23개를 매번 하나씩 클릭해야 했던 번거로움 해소.
   일괄 적합 처리 후에도 실제 미흡 항목만 개별로 "미흡" 버튼을 눌러 바꾸면 되는 흐름. */
function bulkSet(value){
 const host=document.getElementById('awTheme');
 if(host)host.dataset.themeAuditDirty='1';
 $$('.themeCheckRow',host).forEach(row=>{
   $$('button',row).forEach(b=>b.classList.remove('active','ok','ng'));
   if(!value)return;
   const btn=[...row.querySelectorAll('button')].find(b=>b.dataset.v===value);
   btn?.classList.add('active',value==='적합'?'ok':'ng');
 });
 updateProgress();
}
async function saveAudit(){
 const host=document.getElementById('awTheme');if(!host)return;
 const line=host.dataset.line,team=host.dataset.team,month=host.dataset.month;
 if(selectedOwner()==='team'&&sessionTeam()&&sessionTeam()!==team){alert('등록된 담당 생산팀과 현재 선택팀이 일치하지 않습니다. 화면을 다시 확인해 주세요.');render();return}
 const rows=$$('.themeCheckRow',host),states={};
 rows.forEach(row=>{const active=row.querySelector('button.active');if(active)states[row.dataset.key]=active.dataset.v});
 const applicable=CHECKLIST.filter(item=>plannedThemes(month,line).includes(item.cat));
 if(!applicable.length){alert('먼저 [점검계획·취약현황]에서 선택한 점검 주체·월·라인의 취약테마를 지정해 주세요.');host.dataset.view='plan';render();return}
  if(Object.keys(states).length<applicable.length){const missing=applicable.length-Object.keys(states).length;alert('미판정 항목 '+missing+'건이 있습니다. 모든 항목을 판정한 뒤 저장해 주세요.');return}
 const auditor=$('#themeAuditAuditor',host)?.value.trim()||'';if(!auditor){alert('최초 점검자 성명을 입력해 주세요.');$('#themeAuditAuditor',host)?.focus();return}const hasNg=rows.some(row=>states[row.dataset.key]==='미흡');const photoFile=$('#themeAuditPhoto',host)?.files?.[0];if(hasNg&&!photoFile&&rows.some(row=>states[row.dataset.key]==='미흡'&&!themeFindingDraft(host,row.dataset.key).photoFile)){alert('미흡 항목별 현장사진을 선택하거나 공통 현장사진을 첨부해 주세요.');return}if(photoFile&&(!['image/jpeg','image/png','image/webp'].includes(photoFile.type)||photoFile.size>1048576)){alert('현장사진은 JPG/PNG/WEBP 형식, 1MB 이하로 선택해 주세요.');return}let improvementPhoto='';if(photoFile){try{improvementPhoto=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result||''));reader.onerror=()=>reject(new Error('사진 읽기 실패'));reader.readAsDataURL(photoFile)})}catch(error){alert('사진을 읽지 못했습니다. 다시 선택해 주세요.');return}}const checks=loadChecks(),memo=$('#themeAuditMemo',host)?.value.trim()||'';const policyDays=window.HD20PolicyConfig?.deadlineDays?.()??null;const dueDays=Number.isFinite(Number(policyDays))&&Number(policyDays)>0?Number(policyDays):null;const dueDate=dueDays===null?'':addDaysStr(today(),dueDays);
 const findingEvidence={};for(const row of rows.filter(row=>states[row.dataset.key]==='미흡')){const draft=themeFindingDraft(host,row.dataset.key);const file=draft.photoFile;if(file&&(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>1048576)){alert('항목별 현장사진은 JPG/PNG/WEBP, 1MB 이하로 선택해 주세요.');return}try{findingEvidence[row.dataset.key]={note:String(draft.note||'').trim(),photo:file?await themeFileToData(file):improvementPhoto}}catch(error){alert('미흡 항목의 사진을 읽지 못했습니다. 다시 선택해 주세요.');return}}
 const rec={id:newId('THEME-AUDIT'),line,team,month,inspectionOwner:selectedOwner(),auditor,initialAuditor:auditor,improvementPhoto,states,findingEvidence,memo,auditedAt:new Date().toISOString(),checklistVersion:4,linkedActionIds:[],createdActionIds:[],reusedActionIds:[],ngCount:rows.filter(row=>states[row.dataset.key]==='미흡').length};
 checks.push(rec);
 if(!saveChecks(checks)){alert('점검 결과를 저장하지 못했습니다. 브라우저 저장공간을 확인한 뒤 다시 시도해 주세요.');return}
 const ngItems=rows.filter(row=>states[row.dataset.key]==='미흡'),actions=load(),originalActions=JSON.stringify(actions);
 const linkedActionIds=[],createdActionIds=[],reusedActionIds=[];
 ngItems.forEach(row=>{
   const cat=row.dataset.cat,item=row.dataset.item,problem='[테마 점검] '+line+' · '+item,evidence=findingEvidence[row.dataset.key]||{},findingMemo=evidence.note||memo,findingPhoto=evidence.photo||rec.improvementPhoto||'';
   const dup=themeFindActive(actions,line,team,cat,problem);
   if(dup){
     const related=Array.isArray(dup.relatedAuditRecordIds)?dup.relatedAuditRecordIds.slice():[dup.auditRecordId].filter(Boolean);
     if(!related.includes(rec.id))related.push(rec.id);
     dup.relatedAuditRecordIds=related;
     dup.lastAuditRecordId=rec.id;
     dup.lastAuditMonth=month;
     dup.lastAuditedAt=rec.auditedAt;
     dup.lastAuditMemo=findingMemo;
     dup.lastAuditAuditor=rec.initialAuditor;
     dup.lastAuditPhoto=findingPhoto;
     if(!dup.initialAuditor)dup.initialAuditor=String(dup.auditor||dup.registeredBy||rec.initialAuditor||'');
     if(!dup.before&&findingPhoto)dup.before=findingPhoto;
     if(!dup.evidence&&findingPhoto)dup.evidence=findingPhoto;
     dup.recheckCount=(Number(dup.recheckCount)||0)+1;
     linkedActionIds.push(dup.id);reusedActionIds.push(dup.id);
     return;
   }
   const previousCompleted=themeFindPreviousCompleted(actions,line,team,cat,problem);
   const actionId=newId('THEME');
   actions.unshift({
     id:actionId,source:'테마Audit',team,auditMonth:month,workplace:line,themeCategory:cat,type:cat,problem,recurrence:!!previousCompleted,recurrenceOfActionId:previousCompleted?.id||'',recurrenceDetectedAt:previousCompleted?rec.auditedAt:'',
     createdAt:today(),date:today(),dueDate,targetDate:dueDate,autoDueDays:dueDays,autoDueAssigned:dueDays!==null,autoDuePolicyState:dueDays===null?'정책미설정':'자동지정',status:'조치대기',
     requestSource:'테마 Audit('+ownerTitle(selectedOwner())+')',inspectionOwner:selectedOwner(),sourceStage:'THEME-AUDIT',sourceCaseId:rec.id,registeredBy:rec.initialAuditor,registrant:rec.initialAuditor,auditor:rec.initialAuditor,initialAuditor:rec.initialAuditor,lastAuditAuditor:rec.initialAuditor,lastAuditPhoto:findingPhoto,before:findingPhoto,evidence:findingPhoto,after:'',auditRecordId:rec.id,relatedAuditRecordIds:[rec.id],lastAuditRecordId:rec.id,lastAuditedAt:rec.auditedAt,auditMemo:findingMemo
   });
   linkedActionIds.push(actionId);createdActionIds.push(actionId);
 });
 rec.linkedActionIds=[...new Set(linkedActionIds)];
 rec.createdActionIds=createdActionIds;
 rec.reusedActionIds=reusedActionIds;
 rec.linkedAt=new Date().toISOString();
 if(!save(actions)){
   if(!saveChecks(checks.filter(x=>x.id!==rec.id)))console.error('[HD20 Theme] failed to rollback audit history after action save failure',rec.id);
   alert('개선조치 저장에 실패하여 이번 점검 이력 등록을 취소했습니다. 저장공간을 확인하고 다시 시도해 주세요.');
   return;
 }
 const savedChecks=loadChecks(),savedRec=savedChecks.find(x=>x.id===rec.id);
 if(savedRec){Object.assign(savedRec,{linkedActionIds:rec.linkedActionIds,createdActionIds:createdActionIds,reusedActionIds:reusedActionIds,linkedAt:rec.linkedAt,ngCount:rec.ngCount});if(!saveChecks(savedChecks)){try{localStorage.setItem(ACT_KEY,originalActions)}catch(error){console.error('[HD20 Theme] action rollback failed',error)}if(!saveChecks(checks.filter(x=>x.id!==rec.id)))console.error('[HD20 Theme] audit rollback failed',rec.id);alert('점검-개선조치 연결정보 저장에 실패하여 이번 등록을 취소했습니다. 다시 시도해 주세요.');return}}
 window.dispatchEvent(new CustomEvent('hd20-action-updated',{detail:{added:createdActionIds.length,reused:reusedActionIds.length,source:'theme-audit',auditRecordId:rec.id}}));
 window.dispatchEvent(new CustomEvent('hd20-activity-updated',{detail:{source:'테마Audit',auditRecordId:rec.id}}));
 window.dispatchEvent(new CustomEvent('hd20-theme-audit-updated',{detail:{auditRecordId:rec.id,line,month,inspectionOwner:rec.inspectionOwner}}));
 const msg=ownerTitle(selectedOwner())+' · 점검 이력 저장 완료 · 미흡 '+ngItems.length+'건 · 신규 개선조치 '+createdActionIds.length+'건 · 기존 미완료 조치 재연계 '+reusedActionIds.length+'건';
 host._themeFindingDrafts={};
 host.dataset.themeAuditDirty='0';
 host.dataset.themeSaveResult=msg;
 host.dataset.themeSaveContext=month+'|'+line+'|'+selectedOwner()+'|'+team;
 if(host.dataset.pendingThemeMasterRefresh==='1'){
  const fresh=window.HD20ThemeMaster?.checklist?.()||[];
  CHECKLIST=[...fresh];
  THEMES=activeThemeNames(fresh);
  delete host.dataset.pendingThemeMasterRefresh;
 }
 render();
}

function build(){
 if(document.getElementById('awTheme'))return true;
 const host=document.querySelector('.beginnerHint')||document.querySelector('.beginnerNav');
 if(!host)return false;
 css();
 const section=document.createElement('section');
 section.id='awTheme';section.className='awScreen';
 host.insertAdjacentElement('afterend',section);
 render();
 return true;
}
function boot(){
 let n=0;const run=()=>{if(build())return;if(++n<60)setTimeout(run,100)};run();
 window.addEventListener('hd20-audit-merged-section',e=>{if(e.detail?.section==='theme')setTimeout(render,0)});
 window.addEventListener('hd20-master-factors-updated',()=>{if(window.HD20_NAV?.active?.()==='audit'&&new URLSearchParams(location.search).get('sub')==='theme')setTimeout(render,0)});
 document.addEventListener('click',e=>{if(!e.target?.closest?.('.beginnerNav [data-key="theme"]'))return;const host=document.getElementById('awTheme');if(!host||!host.hasChildNodes())setTimeout(render,50)},true);
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
