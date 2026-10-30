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
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const FALLBACK_TEAMS=['대형Att.팀','대형메인팀','대형상부팀','프레임제작팀','Boom제작팀','중형상부1팀','중형상부2팀','중형하부팀','중형Att팀','중형메인팀','휠로더Front팀','휠로더리어팀','휠로더메인팀','초대형조립팀','성능팀','트러블슈팅팀','옵션조립팀','출하팀','자재물류팀'];
const LINES=(()=>{const master=window.HD20WorkplaceMaster?.active?.()||[];const names=master.map(x=>String(x.name||x).replace(/^\[울산\]\s*/,''));const old=[...loadChecks().map(x=>x.line),...load().filter(x=>x.source==='테마Audit').map(x=>x.workplace)].filter(Boolean);return [...new Set([...(names.length?names:['중형라인','대형라인','통합서브라인','중형라인 ARM KIT 라인','중형라인 BOOM KIT 라인','대형라인 ARM KIT 라인','대형라인 BOOM KIT 라인','휠로더 라인','초대형 라인','프레임 상부 ASSY','프레임 하부 ASSY','붐 라인','부품도장라인','중대형휠로더검사라인','출하장','비정규 라인(구.Pilot장)','원자재 창고','기타구역(옥외,시설물)']),...old])];})();
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
const CHECKLIST=[...(window.HD20ThemeMaster?.checklist?.()||[]),...LEGACY_CHECKLIST.filter(x=>loadChecks().some(r=>r.states&&Object.prototype.hasOwnProperty.call(r.states,x.cat+'::'+x.item)))];
const THEMES=[...new Set((window.HD20ThemeMaster?.checklist?.()||CHECKLIST).map(c=>c.cat))];
function load(){try{const v=JSON.parse(localStorage.getItem(ACT_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function save(rows){try{localStorage.setItem(ACT_KEY,JSON.stringify(rows));return true}catch(e){console.error('[HD20 Theme] action save failed',e);return false}}
function loadChecks(){try{const v=JSON.parse(localStorage.getItem(CHECK_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function saveChecks(rows){try{localStorage.setItem(CHECK_KEY,JSON.stringify(rows));return true}catch(e){console.error('[HD20 Theme] audit history save failed',e);return false}}
function loadPlans(){try{const v=JSON.parse(localStorage.getItem(PLAN_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function savePlans(rows){try{localStorage.setItem(PLAN_KEY,JSON.stringify(rows));return true}catch(e){console.error('[HD20 Theme] plan save failed',e);return false}}
function plannedThemes(month,line){
 const p=loadPlans().find(x=>x.month===month&&x.line===line);
 if(p&&Array.isArray(p.themes))return THEMES.filter(t=>p.themes.includes(t));
 const prior=loadChecks().filter(x=>x.line===line&&monthKey(x.month||x.auditedAt)===month).sort((a,b)=>String(b.auditedAt||'').localeCompare(String(a.auditedAt||'')))[0];
 if(prior?.states)return THEMES.filter(t=>CHECKLIST.some(item=>item.cat===t&&Object.prototype.hasOwnProperty.call(prior.states,item.cat+'::'+item.item)));
 return [];
}
function actionTable(month){
 const rows=load().filter(x=>x.source==='테마Audit'&&(monthKey(x.auditMonth||x.createdAt||x.date)===month||monthKey(x.lastAuditMonth||x.lastAuditedAt)===month)).sort((a,b)=>String(b.lastAuditedAt||b.createdAt||'').localeCompare(String(a.lastAuditedAt||a.createdAt||'')));
 if(!rows.length)return '<div class="themeEmptyNote">선택 월에 연결된 테마점검 개선조치가 없습니다.</div>';
 const statuses=[...new Set(rows.map(a=>String(a.status||'미분류')))].sort();
 const tableRows=rows.map(a=>{
  const status=String(a.status||'미분류'),line=String(a.workplace||''),team=String(a.team||''),theme=String(a.themeCategory||a.type||''),problem=String(a.problem||''),id=String(a.id||'');
  const search=[line,team,theme,problem,status,id].join(' ');
  return '<tr data-status="'+esc(status)+'" data-search="'+esc(search.toLocaleLowerCase())+'"><td>'+esc(line||'—')+'</td><td>'+esc(team||'—')+'</td><td>'+esc(theme||'—')+'</td><td>'+esc(problem||'—')+'</td><td><span class="themeStatusTag">'+esc(status)+'</span></td><td>'+esc(a.dueDate||a.targetDate||'—')+'</td><td class="num">'+(Number(a.recheckCount)||0)+'</td><td>'+esc(id||'—')+'</td></tr>';
 }).join('');
 return '<div class="themeHistoryMeta">총 '+rows.length+'건 · 최초 발생 월과 최근 재점검 월 모두에서 조회 · 동일 미흡사항의 미완료 조치는 중복 생성하지 않고 재점검 이력을 연결합니다.</div><div class="themeActionFilters"><label>빠른 검색 <input id="themeActionSearch" type="search" placeholder="라인·팀·테마·미흡내용·조치 ID"></label><label>조치 상태 <select id="themeActionStatus"><option value="">전체 상태</option>'+statuses.map(s=>'<option value="'+esc(s)+'">'+esc(s)+'</option>').join('')+'</select></label><span id="themeActionCount" aria-live="polite">표시 '+rows.length+'/'+rows.length+'건</span></div><div class="themeHistoryWrap"><table class="themeHistoryTable"><thead><tr><th>라인/구역</th><th>담당팀</th><th>취약 테마</th><th>미흡사항</th><th>조치 상태</th><th>조치기한</th><th>재점검</th><th>조치 ID</th></tr></thead><tbody id="themeActionTableBody">'+tableRows+'</tbody></table><div id="themeActionNoResults" class="themeEmptyNote" hidden>검색 조건에 맞는 조치가 없습니다.</div></div>';
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
 #awTheme{padding-bottom:20px}
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
 const actionMonths=load().filter(x=>x.source==='테마Audit').map(x=>monthKey(x.auditMonth||x.createdAt||x.date));
 const auditMonths=loadChecks().map(x=>monthKey(x.month||x.auditedAt));
 const planMonths=loadPlans().map(x=>monthKey(x.month));
 const set=new Set([...actionMonths,...auditMonths,...planMonths].filter(Boolean));
 set.add(thisMonth());
 return[...set].sort().reverse();
}
function matrixData(month){
 const audits=loadChecks().filter(x=>monthKey(x.month||x.auditedAt)===month);
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
 const allChecks=loadChecks().filter(x=>monthKey(x.month||x.auditedAt)===month);
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
 const all=loadChecks().filter(x=>monthKey(x.month||x.auditedAt)===month).sort((a,b)=>String(b.auditedAt||'').localeCompare(String(a.auditedAt||'')));
 if(!all.length)return '<div class="themeEmptyNote">이번 달 점검 이력이 없습니다. 점검 결과를 저장하면 회차별 이력이 여기에 누적됩니다.</div>';
 const actions=load();
 const body=all.slice(0,8).map(rec=>{
   const values=Object.values(rec.states||{}),ok=values.filter(v=>v==='적합').length,ng=values.filter(v=>v==='미흡').length,total=ok+ng;
   const linked=Array.isArray(rec.linkedActionIds)&&rec.linkedActionIds.length?rec.linkedActionIds:actions.filter(a=>a.source==='테마Audit'&&(a.auditRecordId===rec.id||(Array.isArray(a.relatedAuditRecordIds)&&a.relatedAuditRecordIds.includes(rec.id)))).map(a=>a.id);
   return '<tr><td>'+esc(formatAuditDate(rec.auditedAt))+'</td><td>'+esc(rec.line||'—')+'</td><td>'+esc(rec.team||'—')+'</td><td class="num">'+ng+'</td><td class="num">'+(total?Math.round(ok/total*100)+'%':'—')+'</td><td class="num">'+linked.length+'</td><td>'+esc(String(rec.memo||'').slice(0,70)||'—')+'</td></tr>';
 }).join('');
 return '<div class="themeHistoryMeta">총 '+all.length+'회 · 최신 '+Math.min(all.length,8)+'회 표시 · 재점검 기록은 이전 회차를 덮어쓰지 않습니다.</div><div class="themeHistoryWrap"><table class="themeHistoryTable"><thead><tr><th>점검 일시</th><th>라인</th><th>담당 생산팀</th><th>미흡</th><th>적합률</th><th>연계 조치</th><th>현장 관찰 메모</th></tr></thead><tbody>'+body+'</tbody></table></div>';
}
function render(){
 const host=document.getElementById('awTheme');if(!host)return;
 const month=host.dataset.month||thisMonth();host.dataset.month=month;
 const line=host.dataset.line||LINES[0];host.dataset.line=line;
 const team=host.dataset.team||LINE_DEFAULT_TEAM[line]||teamOptions()[0]||'';host.dataset.team=team;
 const monthOpts=monthOptions();
 const view=host.dataset.view||'plan';host.dataset.view=view;
 const planThemes=plannedThemes(month,line);
 const auditRows=loadChecks().filter(x=>monthKey(x.month||x.auditedAt)===month);
 const latestAuditByLine=new Map();
 auditRows.forEach(rec=>{const prev=latestAuditByLine.get(rec.line);if(!prev||String(rec.auditedAt||'').localeCompare(String(prev.auditedAt||''))>=0)latestAuditByLine.set(rec.line,rec)});
 const monthActions=load().filter(x=>x.source==='테마Audit'&&(monthKey(x.auditMonth||x.createdAt||x.date)===month||monthKey(x.lastAuditMonth||x.lastAuditedAt)===month));
 const lineSummaryRows=LINES.map(ln=>{
   const themes=plannedThemes(month,ln),rec=latestAuditByLine.get(ln),states=Object.values(rec?.states||{});
   const ng=states.filter(v=>v==='미흡').length;
   const actionCount=monthActions.filter(a=>a.workplace===ln).length;
   const themeChips=themes.length?themes.map(t=>'<span class="themeLineChip">'+esc(t)+'</span>').join(''):'<span class="themePlanMissing">계획 미설정</span>';
   return '<div class="themeLineSummaryRow '+(ln===line?'isSelected':'')+'"><div class="themeLineName">'+esc(ln)+'</div><div><div class="themeLineChips">'+themeChips+'</div></div><div class="themeLineDate">'+(rec?esc(formatAuditDate(rec.auditedAt)):'<span class="themeMuted">미실시</span>')+'</div><div><span class="themeCountPill '+(ng?'hasFinding':'')+'">'+ng+'건</span></div><div><span class="themeCountPill">'+actionCount+'건</span></div><div><button type="button" class="themeLineAction" data-pick-line="'+esc(ln)+'">현장점검 열기</button></div></div>';
 }).join('');
 host.innerHTML=`<div class="awHero">
   <div><h2>테마점검 운영센터</h2><div class="themeSubtitle">라인별 5S 취약점을 동일 기준으로 점검하고, 미흡 항목을 개선조치·완료관리와 연결합니다. 재점검 이력은 누적 보존됩니다.</div><span class="themeOwner">5S모듈 주관</span></div>
   <div class="themeControls"><label>조회 월 <select id="themeMonthSel">${monthOpts.map(m=>`<option${m===month?' selected':''}>${m}</option>`).join('')}</select></label></div>
 </div>
 <div class="themeWorkflowRail" aria-label="테마점검 업무 흐름">
   <div class="themeWorkflowStep"><span>01</span><div><b>점검계획</b><small>5S 모듈이 월별 취약 테마 지정</small></div></div><div class="themeWorkflowConnector"></div>
   <div class="themeWorkflowStep"><span>02</span><div><b>현장 Audit</b><small>계획된 항목 전수 판정</small></div></div><div class="themeWorkflowConnector"></div>
   <div class="themeWorkflowStep"><span>03</span><div><b>개선조치</b><small>미흡사항을 원본 조치와 연결</small></div></div><div class="themeWorkflowConnector"></div>
   <div class="themeWorkflowStep"><span>04</span><div><b>재점검</b><small>완료·재발 여부와 이력 누적</small></div></div>
 </div>
 <nav class="themeTabNav" aria-label="테마점검 작업영역">
   <button type="button" data-theme-view="plan" class="${view==='plan'?'active':''}">점검계획·취약현황</button>
   <button type="button" data-theme-view="audit" class="${view==='audit'?'active':''}">현장점검 실시</button>
   <button type="button" data-theme-view="actions" class="${view==='actions'?'active':''}">미흡·개선조치 추적</button>
   <button type="button" data-theme-view="history" class="${view==='history'?'active':''}">재점검·이력</button>
 </nav>
 <section class="themePanel" data-theme-panel="plan" ${view==='plan'?'':'hidden'}>
 <div class="themePlanBox"><div class="themeSectionHead"><h3>월별·라인별 취약 테마 계획</h3><small>5S 모듈이 해당 월에 중점 점검할 테마를 지정합니다.</small></div>
 <div class="themeControls"><label>계획 라인/구역 <select id="themePlanLineSel">${LINES.map(l=>`<option${l===line?' selected':''}>${esc(l)}</option>`).join('')}</select></label><span class="themePlanHint">체크한 테마만 현장 점검표에 표시됩니다. 기존 점검 이력은 보존됩니다.</span></div>
 <div class="themePlanChoices">${THEMES.map(t=>`<label><input type="checkbox" name="themePlanTheme" value="${esc(t)}" ${planThemes.includes(t)?'checked':''}><span>${esc(t)}</span></label>`).join('')}</div>
 <div class="themePlanFooter"><span>선택 테마 <b id="themePlanCount">${planThemes.length}</b> / ${THEMES.length} · <b class="themePlanState">${planThemes.length?'계획 설정됨':'계획 미설정'}</b></span><button type="button" class="themePlanSave" id="themeSavePlanBtn">계획 저장</button></div>${planThemes.length?'':'<div class="themeEmptyNote themePlanEmpty">이 라인의 해당 월 점검 테마가 아직 지정되지 않았습니다. 5S 모듈에서 취약 테마를 선택한 후 저장해야 현장점검을 시작할 수 있습니다.</div>'}</div>
 <div class="themeSectionHead"><h3>라인별 점검 준비·실행 현황</h3><small>계획 테마 · 최근 Audit · 미흡 건 · 연결 조치를 한 행에서 확인</small></div>
 <div class="themeLineSummary">
   <div class="themeLineSummaryHead"><span>라인 / 구역</span><span>계획된 취약 테마</span><span>최근 점검</span><span>미흡</span><span>연계 조치</span><span></span></div>
   <div class="themeLineSummaryBody">${lineSummaryRows}</div>
 </div>
 <div class="themeSummaryFoot">라인을 선택하면 해당 라인의 현장점검 화면으로 이동합니다. 점검계획이 없는 라인은 먼저 계획을 저장해야 Audit 결과를 등록할 수 있습니다.</div> </section>
 <section class="themePanel" data-theme-panel="history" ${view==='history'?'':'hidden'}><div class="themeHistoryBox"><div class="themeSectionHead" style="margin-top:0"><h3>최근 점검 이력</h3><small>선택 월의 점검 회차·미흡 건수·연계 조치를 확인합니다</small></div>${historyTable(month)}</div></section>
 <section class="themePanel" data-theme-panel="audit" ${view==='audit'?'':'hidden'}><div class="themeAuditBox" id="themeAuditBox">
   <div class="themeSectionHead" style="margin-top:0"><h3>테마 Audit 실시 — <span id="themeAuditLineLabel">${esc(line)}</span></h3></div>
   <div class="themeControls">
     <label>라인 <select id="themeLineSel">${LINES.map(l=>`<option${l===line?' selected':''}>${esc(l)}</option>`).join('')}</select></label>
     <label>담당 생산팀 <select id="themeTeamSel">${teamOptions().map(t=>`<option${t===team?' selected':''}>${esc(t)}</option>`).join('')}</select></label>
   </div>
   <div class="themeBulkRow"><span class="themeWorkflowNote">점검 흐름　① 라인 선택 → ② 전 항목 판정 → ③ 결과 저장 → ④ 개선조치 확인</span>
     <button type="button" class="themeBulkBtn" id="themeBulkAllOk">전체 적합으로 일괄 설정</button>
     <button type="button" class="themeBulkBtn" id="themeLoadPrevious">직전 결과 참고</button>
     <button type="button" class="themeBulkBtn" id="themeBulkClear">전체 초기화</button>
     <span id="themePreviousNote" class="themePreviousNote" aria-live="polite"></span>
   </div>
   <div class="themeAuditMeta"><label>현장 관찰 메모 <textarea id="themeAuditMemo" rows="2" placeholder="현장 특이사항, 즉시조치, 재발 위험 등을 기록"></textarea></label><div id="themeProgress" aria-live="polite"></div></div><div id="themeChecklistWrap"></div>
   <button type="button" class="themeSaveBtn" id="themeSaveBtn">점검 결과 저장 · 미흡 항목 자동 등록</button>
   <div class="themeSaveResult" id="themeSaveResult"></div>
 </div></section>
 <section class="themePanel" data-theme-panel="actions" ${view==='actions'?'':'hidden'}><div class="themeHistoryBox"><div class="themeSectionHead" style="margin-top:0"><h3>테마점검 미흡사항 · 개선조치 추적</h3><small>개선조치·완료관리와 같은 원본 조치 레코드를 조회합니다</small></div>${actionTable(month)}</div></section>`;
 $('#themeMonthSel',host).addEventListener('change',e=>{host.dataset.month=e.target.value;render()});
  const actionSearch=$('#themeActionSearch',host),actionStatus=$('#themeActionStatus',host);
  const filterActions=()=>{const query=(actionSearch?.value||'').trim().toLocaleLowerCase(),status=actionStatus?.value||'',rows=$('#themeActionTableBody tr',host);let shown=0;rows.forEach(row=>{const visible=(!query||(row.dataset.search||'').includes(query))&&(!status||row.dataset.status===status);row.hidden=!visible;if(visible)shown++});const count=$('#themeActionCount',host);if(count)count.textContent='표시 '+shown+'/'+rows.length+'건';const empty=$('#themeActionNoResults',host);if(empty)empty.hidden=shown>0};
  actionSearch?.addEventListener('input',filterActions);actionStatus?.addEventListener('change',filterActions);
 Array.from(host.querySelectorAll('[data-theme-view]')).forEach(btn=>btn.addEventListener('click',()=>{host.dataset.view=btn.dataset.themeView;render()}));
 $('#themePlanLineSel',host).addEventListener('change',e=>{host.dataset.line=e.target.value;host.dataset.team=LINE_DEFAULT_TEAM[e.target.value]||host.dataset.team;render()});
 Array.from(host.querySelectorAll('input[name="themePlanTheme"]')).forEach(box=>box.addEventListener('change',()=>{const n=host.querySelectorAll('input[name="themePlanTheme"]:checked').length;const count=$('#themePlanCount',host);if(count)count.textContent=n}));
 $('#themeSavePlanBtn',host).addEventListener('click',()=>{const selected=Array.from(host.querySelectorAll('input[name="themePlanTheme"]:checked')).map(x=>x.value);if(!selected.length){alert('최소 1개 이상의 취약 테마를 선택해 주세요.');return}const plans=loadPlans(),entry={month,line:host.dataset.line,themes:selected,updatedAt:new Date().toISOString()};const i=plans.findIndex(x=>x.month===month&&x.line===host.dataset.line);if(i>=0)plans[i]=entry;else plans.push(entry);if(!savePlans(plans)){alert('점검계획 저장에 실패했습니다. 저장공간을 확인해 주세요.');return}render()});
 $('#themeLineSel',host).addEventListener('change',e=>{host.dataset.line=e.target.value;host.dataset.team=LINE_DEFAULT_TEAM[e.target.value]||host.dataset.team;render()});
 $('#themeTeamSel',host).addEventListener('change',e=>{host.dataset.team=e.target.value});
 $('#themeSaveBtn',host).addEventListener('click',saveAudit);
 $('#themeBulkAllOk',host).addEventListener('click',()=>bulkSet('적합'));
 $('#themeLoadPrevious',host).addEventListener('click',loadPreviousJudgements);
  $('#themeBulkClear',host).addEventListener('click',()=>{bulkSet('');const note=$('#themePreviousNote',host);if(note)note.textContent='새 회차 입력 상태로 초기화했습니다.'});
 Array.from(host.querySelectorAll('[data-pick-line]')).forEach(el=>el.addEventListener('click',()=>{
   const ln=el.getAttribute('data-pick-line');
   host.dataset.line=ln;host.dataset.team=LINE_DEFAULT_TEAM[ln]||host.dataset.team;host.dataset.view='audit';render();
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
 const rec=loadChecks().filter(x=>x.line===line&&monthKey(x.month||x.auditedAt)===month).sort((a,b)=>String(b.auditedAt||'').localeCompare(String(a.auditedAt||'')))[0];
 if(!rec){alert('선택한 라인·월에 참고할 이전 점검 결과가 없습니다.');return}
 const wrap=$('#themeChecklistWrap',host);
 $$('.themeCheckRow',wrap).forEach(row=>{
  const value=rec.states?.[row.dataset.key]||'';
  $$('button',row).forEach(btn=>{btn.classList.remove('active','ok','ng');if(btn.dataset.v===value)btn.classList.add('active',value==='적합'?'ok':'ng')});
 });
 const memo=$('#themeAuditMemo',host);if(memo)memo.value='';
 updateProgress();
 const note=$('#themePreviousNote',host);
 if(note)note.textContent='직전 회차 결과를 참고용으로 불러왔습니다. 현장 확인 후 수정하고 새 회차로 저장하세요.';
}
function updateProgress(){
 const host=document.getElementById('awTheme');if(!host)return;
 const rows=$$('.themeCheckRow',host),done=rows.filter(row=>row.querySelector('button.active')).length,ng=rows.filter(row=>row.querySelector('button.active[data-v="미흡"]')).length;
 const el=$('#themeProgress',host);if(el)el.textContent='판정 '+done+'/'+rows.length+'개 · 미흡 '+ng+'건';
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
   return `<div class="themeChecklistGroup"><div class="catHead"><span>${esc(cat)}</span><button type="button" data-cat-ok="${esc(cat)}">이 분류만 적합으로</button></div>${rows}</div>`;
 }).join('');
 wrap.innerHTML=groups;
 $$('.themeCheckRow',wrap).forEach(row=>{
   $$('button',row).forEach(btn=>btn.addEventListener('click',()=>{
     $$('button',row).forEach(b=>b.classList.remove('active','ok','ng'));
     btn.classList.add('active',btn.dataset.v==='적합'?'ok':'ng');
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
   updateProgress();
 }));
 updateProgress();
}
/* "전체 적합으로 일괄 설정" / "전체 초기화" — 23개를 매번 하나씩 클릭해야 했던 번거로움 해소.
   일괄 적합 처리 후에도 실제 미흡 항목만 개별로 "미흡" 버튼을 눌러 바꾸면 되는 흐름. */
function bulkSet(value){
 const host=document.getElementById('awTheme');
 $$('.themeCheckRow',host).forEach(row=>{
   $$('button',row).forEach(b=>b.classList.remove('active','ok','ng'));
   if(!value)return;
   const btn=[...row.querySelectorAll('button')].find(b=>b.dataset.v===value);
   btn?.classList.add('active',value==='적합'?'ok':'ng');
 });
 updateProgress();
}
function saveAudit(){
 const host=document.getElementById('awTheme');if(!host)return;
 const line=host.dataset.line,team=host.dataset.team,month=host.dataset.month;
 const rows=$$('.themeCheckRow',host),states={};
 rows.forEach(row=>{const active=row.querySelector('button.active');if(active)states[row.dataset.key]=active.dataset.v});
 const applicable=CHECKLIST.filter(item=>plannedThemes(month,line).includes(item.cat));
 if(!applicable.length){alert('먼저 [점검계획·취약현황]에서 해당 월·라인의 점검 테마를 지정하고 저장해 주세요.');host.dataset.view='plan';render();return}
  if(Object.keys(states).length<applicable.length){const missing=applicable.length-Object.keys(states).length;alert('미판정 항목 '+missing+'건이 있습니다. 모든 항목을 판정한 뒤 저장해 주세요.');return}
 const checks=loadChecks(),memo=$('#themeAuditMemo',host)?.value.trim()||'';
 const rec={id:newId('THEME-AUDIT'),line,team,month,states,memo,auditedAt:new Date().toISOString(),checklistVersion:4,linkedActionIds:[],createdActionIds:[],reusedActionIds:[],ngCount:rows.filter(row=>states[row.dataset.key]==='미흡').length};
 checks.push(rec);
 if(!saveChecks(checks)){alert('점검 결과를 저장하지 못했습니다. 브라우저 저장공간을 확인한 뒤 다시 시도해 주세요.');return}
 const ngItems=rows.filter(row=>states[row.dataset.key]==='미흡'),actions=load();
 const activeStatuses=['조치대기','미착수','진행중','진행 중','기한경과','보완요청','조치중','조치 진행중','효과검증 대기'];
 const linkedActionIds=[],createdActionIds=[],reusedActionIds=[];
 ngItems.forEach(row=>{
   const cat=row.dataset.cat,item=row.dataset.item,problem='[테마 점검] '+line+' · '+item;
   const dup=actions.find(a=>a.source==='테마Audit'&&a.workplace===line&&a.themeCategory===cat&&a.problem===problem&&activeStatuses.includes(String(a.status||'')));
   if(dup){
     const related=Array.isArray(dup.relatedAuditRecordIds)?dup.relatedAuditRecordIds.slice():[dup.auditRecordId].filter(Boolean);
     if(!related.includes(rec.id))related.push(rec.id);
     dup.relatedAuditRecordIds=related;
     dup.lastAuditRecordId=rec.id;
     dup.lastAuditMonth=month;
     dup.lastAuditedAt=rec.auditedAt;
     dup.lastAuditMemo=memo;
     dup.recheckCount=(Number(dup.recheckCount)||0)+1;
     linkedActionIds.push(dup.id);reusedActionIds.push(dup.id);
     return;
   }
   const actionId=newId('THEME');
   actions.unshift({
     id:actionId,source:'테마Audit',team,auditMonth:month,workplace:line,themeCategory:cat,type:cat,problem,
     createdAt:today(),date:today(),dueDate:addDaysStr(today(),14),targetDate:addDaysStr(today(),14),status:'조치대기',
     requestSource:'테마 Audit(5S모듈 주관)',auditRecordId:rec.id,relatedAuditRecordIds:[rec.id],lastAuditRecordId:rec.id,lastAuditedAt:rec.auditedAt,auditMemo:memo
   });
   linkedActionIds.push(actionId);createdActionIds.push(actionId);
 });
 rec.linkedActionIds=[...new Set(linkedActionIds)];
 rec.createdActionIds=createdActionIds;
 rec.reusedActionIds=reusedActionIds;
 rec.linkedAt=new Date().toISOString();
 if(!save(actions)){
   alert('점검 이력은 저장되었지만 개선조치 데이터 저장에 실패했습니다. 화면을 닫지 말고 저장공간/DB 상태를 확인해 주세요.');
   render();return;
 }
 const savedChecks=loadChecks(),savedRec=savedChecks.find(x=>x.id===rec.id);
 if(savedRec){Object.assign(savedRec,{linkedActionIds:rec.linkedActionIds,createdActionIds:createdActionIds,reusedActionIds:reusedActionIds,linkedAt:rec.linkedAt,ngCount:rec.ngCount});if(!saveChecks(savedChecks))console.error('[HD20 Theme] audit-to-action link metadata could not be saved',rec.id)}
 window.dispatchEvent(new CustomEvent('hd20-activity-updated',{detail:{source:'테마Audit',auditRecordId:rec.id}}));
 window.dispatchEvent(new CustomEvent('hd20-theme-audit-updated',{detail:{auditRecordId:rec.id,line,month}}));
 const msg='점검 이력 저장 완료 · 미흡 '+ngItems.length+'건 · 신규 개선조치 '+createdActionIds.length+'건 · 기존 미완료 조치 재연계 '+reusedActionIds.length+'건';
 render();
 const resultBox=document.getElementById('themeSaveResult');
 if(resultBox){resultBox.classList.add('on');resultBox.textContent=msg}
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
 document.addEventListener('click',e=>{if(e.target?.closest?.('.beginnerNav [data-key="theme"]'))setTimeout(render,50)},true);
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
