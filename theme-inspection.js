/* v3 전면 개선 — 사용자 지적: "테마점검 탭을 이따위로 만들어놓고 다 했다고 하는거냐"

   v2까지의 문제점과 조치:
   1) 처음 들어왔을 때 매트릭스가 텅 비어 있어 "뭘 해야 하는지" 전혀 안내가 없었음
      → 요약 카드 4개(실시 라인·미흡 발견·자동 등록·적합률) 추가, 매트릭스가 비어 있을 때도
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
const ACT_KEY='hd20ActionCasesV2',TEAM_KEY='hd20TeamLeaderMasterV1',CHECK_KEY='hd20ThemeAuditChecksV1';
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const FALLBACK_TEAMS=['대형Att.팀','대형메인팀','대형상부팀','프레임제작팀','Boom제작팀','중형상부1팀','중형상부2팀','중형하부팀','중형Att팀','중형메인팀','휠로더Front팀','휠로더리어팀','휠로더메인팀','초대형조립팀','성능팀','트러블슈팅팀','옵션조립팀','출하팀','자재물류팀'];
const LINES=['조립라인','자재구역','공구실','검사대'];
/* 라인별 대표 담당팀(자재/검사 공용구역은 자재물류팀, 공구실은 트러블슈팅팀, 조립라인은 첫 조립팀을
   기본값으로 — 실제로는 현장에서 변경 가능하도록 드롭다운은 그대로 열어 둠). */
const LINE_DEFAULT_TEAM={'조립라인':'대형Att.팀','자재구역':'자재물류팀','공구실':'트러블슈팅팀','검사대':'성능팀'};
const CHECKLIST=[
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
const THEMES=[...new Set(CHECKLIST.map(c=>c.cat))];
function load(){try{const v=JSON.parse(localStorage.getItem(ACT_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function save(rows){try{localStorage.setItem(ACT_KEY,JSON.stringify(rows))}catch{}}
function loadChecks(){try{const v=JSON.parse(localStorage.getItem(CHECK_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function saveChecks(rows){try{localStorage.setItem(CHECK_KEY,JSON.stringify(rows))}catch{}}
function teamOptions(){try{const v=JSON.parse(localStorage.getItem(TEAM_KEY)||'[]');if(Array.isArray(v)&&v.length)return v.map(x=>x.team||x)}catch{}return FALLBACK_TEAMS}
function addDaysStr(d,n){const x=new Date(String(d).slice(0,10)+'T00:00:00');x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)}
function today(){return new Date().toISOString().slice(0,10)}
function monthKey(d){return String(d||'').slice(0,7)}
function thisMonth(){return new Date().toISOString().slice(0,7)}
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
 const rows=load(),set=new Set(rows.filter(x=>x.source==='테마Audit').map(x=>monthKey(x.createdAt||x.date)).filter(Boolean));
 set.add(thisMonth());
 return[...set].sort().reverse();
}
function matrixData(month){
 const rows=load().filter(x=>x.source==='테마Audit'&&monthKey(x.createdAt||x.date)===month);
 const grid=LINES.map(ln=>THEMES.map(th=>rows.filter(x=>x.workplace===ln&&x.themeCategory===th)));
 return{grid,rows};
}
function cellColor(n){if(n<=0)return'#ffffff';if(n===1)return'#fff3d6';if(n===2)return'#ffe2a8';if(n<=4)return'#ffc877';return'#ff9d52'}
function kpis(month){
 const checks=loadChecks().filter(x=>x.month===month);
 const linesAudited=checks.length;
 let ok=0,ng=0;
 checks.forEach(c=>Object.values(c.states||{}).forEach(v=>{if(v==='적합')ok++;else if(v==='미흡')ng++}));
 const total=ok+ng;
 const autoRegistered=load().filter(x=>x.source==='테마Audit'&&monthKey(x.createdAt||x.date)===month).length;
 const okRate=total?Math.round(ok/total*100):null;
 return{linesAudited,ng,autoRegistered,okRate};
}
function render(){
 const host=document.getElementById('awTheme');if(!host)return;
 const month=host.dataset.month||thisMonth();host.dataset.month=month;
 const line=host.dataset.line||LINES[0];host.dataset.line=line;
 const team=host.dataset.team||LINE_DEFAULT_TEAM[line]||teamOptions()[0]||'';host.dataset.team=team;
 const{grid,rows:matrixRows}=matrixData(month);
 const monthOpts=monthOptions();
 const k=kpis(month);
 const head='<tr><th>라인 \\ 5S 테마</th>'+THEMES.map(t=>`<th>${esc(t)}</th>`).join('')+'</tr>';
 const body=LINES.map((ln,ri)=>'<tr><td class="rowHead" data-pick-line="'+esc(ln)+'">'+esc(ln)+'</td>'+THEMES.map((th,ci)=>{
   const n=grid[ri][ci].length;
   const isSel=ln===line;
   return `<td class="cell${isSel?' sel':''}" data-pick-line="${esc(ln)}" style="background:${cellColor(n)}">${n||''}</td>`;
 }).join('')+'</tr>').join('');
 host.innerHTML=`<div class="awHero">
   <div><h2>⑦ 테마 점검</h2><div class="themeSubtitle">라인별 취약점을 품목·기준 단위 세부 테마로 점검하고, 미흡 항목은 자동으로 개선조치가 등록됩니다.</div><span class="themeOwner">5S모듈 주관</span></div>
   <div class="themeControls"><label>조회 월 <select id="themeMonthSel">${monthOpts.map(m=>`<option${m===month?' selected':''}>${m}</option>`).join('')}</select></label></div>
 </div>
 <div class="themeKpiRow">
   <div class="themeKpiCard"><small>이번 달 Audit 실시 라인</small><b>${k.linesAudited}<span style="font-size:14px">/${LINES.length}</span></b></div>
   <div class="themeKpiCard ${k.ng?'warn':''}"><small>미흡 발견</small><b>${k.ng}건</b></div>
   <div class="themeKpiCard"><small>자동 등록된 개선조치</small><b>${k.autoRegistered}건</b></div>
   <div class="themeKpiCard ${k.okRate==null?'':k.okRate>=80?'good':'warn'}"><small>적합률</small><b>${k.okRate==null?'—':k.okRate+'%'}</b></div>
 </div>
 <div class="themeTwoTrack">
   <div class="themeTrackCard"><b>① 수동 발굴출처 트랙</b>현장 패트롤·자율 5S Audit 등 발굴 출처를 선택해 개선조치·완료관리 탭에서 직접 등록합니다.</div>
   <div class="themeTrackCard"><b>② 테마 Audit 자동 트랙(이 화면)</b>아래 체크리스트에서 "미흡"으로 평가하면, 저장 즉시 개별 개선조치 건이 자동 등록됩니다(발굴출처: 테마Audit).</div>
 </div>
 <div class="themeSectionHead"><h3>라인 × 5S 테마 취약점 개요</h3><small style="color:#8098a8">셀 또는 라인명을 클릭하면 아래 체크리스트로 바로 이동합니다</small></div>
 <div class="themeMatrixWrap">
   <table class="themeMatrix">${head}${body}</table>
   ${matrixRows.length?'':'<div class="themeEmptyNote">⚠ 이번 달에는 아직 테마 Audit을 실시한 라인이 없습니다. 아래 "테마 Audit 실시"에서 라인을 선택해 점검을 시작하세요.</div>'}
 </div>
 <div class="themeAuditBox" id="themeAuditBox">
   <div class="themeSectionHead" style="margin-top:0"><h3>테마 Audit 실시 — <span id="themeAuditLineLabel">${esc(line)}</span></h3></div>
   <div class="themeControls">
     <label>라인 <select id="themeLineSel">${LINES.map(l=>`<option${l===line?' selected':''}>${esc(l)}</option>`).join('')}</select></label>
     <label>담당 생산팀 <select id="themeTeamSel">${teamOptions().map(t=>`<option${t===team?' selected':''}>${esc(t)}</option>`).join('')}</select></label>
   </div>
   <div class="themeBulkRow">
     <button type="button" class="themeBulkBtn" id="themeBulkAllOk">전체 적합으로 일괄 설정</button>
     <button type="button" class="themeBulkBtn" id="themeBulkClear">전체 초기화</button>
   </div>
   <div id="themeChecklistWrap"></div>
   <button type="button" class="themeSaveBtn" id="themeSaveBtn">점검 결과 저장 · 미흡 항목 자동 등록</button>
   <div class="themeSaveResult" id="themeSaveResult"></div>
 </div>`;
 $('#themeMonthSel',host).addEventListener('change',e=>{host.dataset.month=e.target.value;render()});
 $('#themeLineSel',host).addEventListener('change',e=>{host.dataset.line=e.target.value;host.dataset.team=LINE_DEFAULT_TEAM[e.target.value]||host.dataset.team;syncLineLabel();renderChecklist();refreshMatrixSelection()});
 $('#themeTeamSel',host).addEventListener('change',e=>{host.dataset.team=e.target.value});
 $('#themeSaveBtn',host).addEventListener('click',saveAudit);
 $('#themeBulkAllOk',host).addEventListener('click',()=>bulkSet('적합'));
 $('#themeBulkClear',host).addEventListener('click',()=>bulkSet(''));
 $$('[data-pick-line]',host).forEach(el=>el.addEventListener('click',()=>{
   const ln=el.getAttribute('data-pick-line');
   host.dataset.line=ln;host.dataset.team=LINE_DEFAULT_TEAM[ln]||host.dataset.team;
   $('#themeLineSel',host).value=ln;$('#themeTeamSel',host).value=host.dataset.team;
   syncLineLabel();renderChecklist();refreshMatrixSelection();
   $('#themeAuditBox',host).scrollIntoView({behavior:'smooth',block:'start'});
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
function checklistState(line){
 const all=loadChecks();
 const rec=all.find(x=>x.line===line&&x.month===document.getElementById('awTheme').dataset.month)||{};
 return rec.states||{};
}
function renderChecklist(){
 const host=document.getElementById('awTheme');if(!host)return;
 const wrap=document.getElementById('themeChecklistWrap');if(!wrap)return;
 const line=host.dataset.line;
 const states=checklistState(line);
 const groups=THEMES.map(cat=>{
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
 }));
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
}
function saveAudit(){
 const host=document.getElementById('awTheme');
 const line=host.dataset.line,team=host.dataset.team,month=host.dataset.month;
 const rows=$$('.themeCheckRow',host);
 const states={};
 rows.forEach(row=>{const active=row.querySelector('button.active');if(active)states[row.dataset.key]=active.dataset.v});
 const checks=loadChecks();
 const idx=checks.findIndex(x=>x.line===line&&x.month===month);
 const rec={line,month,states,auditedAt:new Date().toISOString()};
 if(idx>=0)checks[idx]=rec;else checks.push(rec);
 saveChecks(checks);
 const ngItems=rows.filter(row=>states[row.dataset.key]==='미흡');
 const actions=load();
 let created=0;
 ngItems.forEach(row=>{
   const cat=row.dataset.cat,item=row.dataset.item;
   const dup=actions.find(a=>a.source==='테마Audit'&&a.workplace===line&&a.themeCategory===cat&&a.problem===item&&monthKey(a.createdAt)===month);
   if(dup)return;
   const createdAt=today();
   actions.unshift({
     id:'THEME-'+Date.now()+'-'+(created++),
     source:'테마Audit',
     team,
     workplace:line,
     themeCategory:cat,
     type:cat,
     problem:`[테마 점검] ${line} · ${item}`,
     createdAt,date:createdAt,
     dueDate:addDaysStr(createdAt,14),targetDate:addDaysStr(createdAt,14),
     status:'조치대기',
     requestSource:'테마 Audit(5S모듈 주관)',
   });
 });
 save(actions);
 window.dispatchEvent(new CustomEvent('hd20-activity-updated',{detail:{source:'테마Audit'}}));
 const msg=created>0?`점검 결과가 저장되었습니다. 미흡 ${ngItems.length}건 중 신규 ${created}건이 개선조치로 자동 등록되었습니다(개선조치·완료관리 탭에서 확인 가능).`:`점검 결과가 저장되었습니다. 신규로 등록된 미흡 건은 없습니다(이미 등록된 항목이거나 전부 적합).`;
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
