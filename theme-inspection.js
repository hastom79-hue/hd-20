/* 사용자 지시(2차 정교화): "테마는 단순히 정리·정돈·청소·설비자주보전·고도화가 아니라, 정리면 어떤
   정리, 정돈이면 어떤 것에 대한 정돈(정량·정위치·품목)까지 아주 디테일하게 구성되어야 한다. 테마
   점검 오디트를 하면 자동으로 개선조치 등록이 되어야 하고, 개별 건으로 선순환 구조가 되어야 한다.
   자율개선 등록이 아니라 개선조치 등록으로 연결한다. 투트랙 구조 — ①기존 수동 발굴출처별 개선조치
   등록, ②테마 Audit 결과에 따라 자동으로 개별 건이 등록되는 개선조치 등록."

   v2 설계:
   1) 7개 대분류 밑에 라인별 취약점을 반영한 세부 체크항목(정리: 불용지그 방치 / 정돈: 정위치 미준수,
      정량기준 초과, 품목 혼재 등)을 정의 — 총 23개 세부 항목.
   2) "테마 Audit 실시": 라인+담당팀+월을 선택하면 해당 라인의 세부 체크항목 전체가 표시되고, 각
      항목을 적합/미흡으로 평가.
   3) 저장 시 "미흡"으로 표시된 항목만 자동으로 개별 개선조치(hd20ActionCasesV2) 레코드를 생성 —
      사람이 "등록" 버튼을 다시 누를 필요 없이 자동. source를 '테마Audit'으로 구분해 기존 수동
      발굴출처 기반 등록(①트랙)과 완전히 분리된 ②트랙임을 표시.
   4) 매트릭스(월별 개요)는 이 자동 등록된 테마Audit 기원 건수를 라인×테마로 집계해 취약점을 강조. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const ACT_KEY='hd20ActionCasesV2',TEAM_KEY='hd20TeamLeaderMasterV1',CHECK_KEY='hd20ThemeAuditChecksV1';
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const FALLBACK_TEAMS=['대형Att.팀','대형메인팀','대형상부팀','프레임제작팀','Boom제작팀','중형상부1팀','중형상부2팀','중형하부팀','중형Att팀','중형메인팀','휠로더Front팀','휠로더리어팀','휠로더메인팀','초대형조립팀','성능팀','트러블슈팅팀','옵션조립팀','출하팀','자재물류팀'];
const LINES=['조립라인','자재구역','공구실','검사대'];
/* 세분화된 테마 체크리스트: 대분류(category) × 세부항목(item). 각 항목은 특정 품목/기준까지 명시. */
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
 #awTheme .awHero{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;flex-wrap:wrap}
 #awTheme .themeSubtitle{color:#5c7489;font-size:13px;margin-top:4px}
 #awTheme .themeOwner{display:inline-block;margin-top:6px;padding:3px 10px;border-radius:999px;background:#eef4fb;color:#2c5f8a;font-size:12px;font-weight:700}
 #awTheme .themeTwoTrack{display:flex;gap:10px;margin-top:10px;flex-wrap:wrap}
 #awTheme .themeTrackCard{flex:1;min-width:220px;border:1px solid #dce5eb;border-radius:8px;padding:10px 12px;font-size:12.5px;color:#4d6478}
 #awTheme .themeTrackCard b{display:block;color:#24445c;margin-bottom:3px}
 #awTheme .themeControls{display:flex;gap:10px;align-items:center;margin:14px 0;flex-wrap:wrap}
 #awTheme .themeControls select{padding:7px 10px;border:1px solid #c8d9e5;border-radius:8px;font-size:13px}
 #awTheme table.themeMatrix{width:100%;border-collapse:collapse;font-size:13px}
 #awTheme table.themeMatrix th,#awTheme table.themeMatrix td{border:1px solid #e3eaef;padding:0;text-align:center}
 #awTheme table.themeMatrix th{background:#eef4f8;color:#2c4a63;padding:8px 6px;font-weight:700}
 #awTheme table.themeMatrix td.rowHead{background:#f7fafc;font-weight:700;text-align:left;padding:8px 10px;color:#2c4a63}
 #awTheme table.themeMatrix td.cell{height:44px;font-weight:800;font-size:14px;color:#24445c}
 #awTheme .themeAuditBox{margin-top:18px;border:1px solid #dce5eb;border-radius:10px;padding:14px}
 #awTheme .themeChecklistGroup{margin-top:10px}
 #awTheme .themeChecklistGroup>b{display:block;color:#24445c;font-size:13px;margin:10px 0 4px;padding-top:8px;border-top:1px solid #eef2f5}
 #awTheme .themeCheckRow{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 2px;font-size:13px}
 #awTheme .themeCheckRow .itemText{flex:1}
 #awTheme .themeCheckRow .themeToggle{display:flex;gap:6px}
 #awTheme .themeCheckRow button{padding:4px 12px;border-radius:999px;border:1px solid #c8d9e5;background:#fff;cursor:pointer;font-size:12px}
 #awTheme .themeCheckRow button.active.ok{background:#1a8754;border-color:#1a8754;color:#fff}
 #awTheme .themeCheckRow button.active.ng{background:#c0392b;border-color:#c0392b;color:#fff}
 #awTheme .themeSaveBtn{margin-top:14px;padding:9px 16px;border:0;border-radius:8px;background:#2c72bb;color:#fff;font-weight:700;cursor:pointer}
 #awTheme .themeSaveResult{margin-top:10px;padding:9px 11px;border-radius:8px;font-size:12.5px;display:none}
 #awTheme .themeSaveResult.on{display:block;background:#eef8f0;color:#1a6b3c}
 `;document.head.appendChild(s);
}
function monthOptions(){
 const rows=load(),set=new Set(rows.filter(x=>x.source==='테마Audit').map(x=>monthKey(x.createdAt||x.date)).filter(Boolean));
 set.add(thisMonth());
 return[...set].sort().reverse();
}
/* 매트릭스: 테마Audit으로 "자동 등록"된 개선조치 건을 라인×테마대분류로 집계(수동 등록분은 제외 —
   이 매트릭스는 어디까지나 "테마 Audit 결과"를 보여주는 화면이므로 투트랙을 명확히 구분). */
function matrixData(month){
 const rows=load().filter(x=>x.source==='테마Audit'&&monthKey(x.createdAt||x.date)===month);
 const grid=LINES.map(ln=>THEMES.map(th=>rows.filter(x=>x.workplace===ln&&x.themeCategory===th)));
 return{grid,rows};
}
function cellColor(n){if(n<=0)return'#ffffff';if(n===1)return'#fff3d6';if(n===2)return'#ffe2a8';if(n<=4)return'#ffc877';return'#ff9d52'}
function render(){
 const host=document.getElementById('awTheme');if(!host)return;
 const month=host.dataset.month||thisMonth();host.dataset.month=month;
 const line=host.dataset.line||LINES[0];host.dataset.line=line;
 const team=host.dataset.team||teamOptions()[0]||'';host.dataset.team=team;
 const{grid}=matrixData(month);
 const monthOpts=monthOptions();
 const head='<tr><th>라인 \\ 5S 테마</th>'+THEMES.map(t=>`<th>${esc(t)}</th>`).join('')+'</tr>';
 const body=LINES.map((ln,ri)=>'<tr><td class="rowHead">'+esc(ln)+'</td>'+THEMES.map((th,ci)=>{
   const n=grid[ri][ci].length;
   return `<td class="cell" style="background:${cellColor(n)}">${n||''}</td>`;
 }).join('')+'</tr>').join('');
 host.innerHTML=`<div class="awHero">
   <div><h2>⑦ 테마 점검</h2><div class="themeSubtitle">라인별 취약점을 품목·기준 단위 세부 테마로 점검하고, 미흡 항목은 자동으로 개선조치가 등록됩니다.</div><span class="themeOwner">5S모듈 주관</span></div>
   <div class="themeControls"><label>개요 월 <select id="themeMonthSel">${monthOpts.map(m=>`<option${m===month?' selected':''}>${m}</option>`).join('')}</select></label></div>
 </div>
 <div class="themeTwoTrack">
   <div class="themeTrackCard"><b>① 수동 발굴출처 트랙</b>현장 패트롤·자율 5S Audit 등 발굴 출처를 선택해 개선조치·완료관리 탭에서 직접 등록합니다.</div>
   <div class="themeTrackCard"><b>② 테마 Audit 자동 트랙(이 화면)</b>아래 체크리스트에서 "미흡"으로 평가하면, 저장 즉시 개별 개선조치 건이 자동 등록됩니다(발굴출처: 테마Audit).</div>
 </div>
 <div style="overflow:auto;margin-top:14px"><table class="themeMatrix">${head}${body}</table></div>
 <div class="themeAuditBox">
   <b>테마 Audit 실시</b>
   <div class="themeControls">
     <label>라인 <select id="themeLineSel">${LINES.map(l=>`<option${l===line?' selected':''}>${esc(l)}</option>`).join('')}</select></label>
     <label>담당 생산팀 <select id="themeTeamSel">${teamOptions().map(t=>`<option${t===team?' selected':''}>${esc(t)}</option>`).join('')}</select></label>
   </div>
   <div id="themeChecklistWrap"></div>
   <button type="button" class="themeSaveBtn" id="themeSaveBtn">점검 결과 저장 · 미흡 항목 자동 등록</button>
   <div class="themeSaveResult" id="themeSaveResult"></div>
 </div>`;
 $('#themeMonthSel',host).addEventListener('change',e=>{host.dataset.month=e.target.value;render()});
 $('#themeLineSel',host).addEventListener('change',e=>{host.dataset.line=e.target.value;renderChecklist()});
 $('#themeTeamSel',host).addEventListener('change',e=>{host.dataset.team=e.target.value});
 $('#themeSaveBtn',host).addEventListener('click',saveAudit);
 renderChecklist();
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
   const rows=items.map((it,i)=>{
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
   return `<div class="themeChecklistGroup"><b>${esc(cat)}</b>${rows}</div>`;
 }).join('');
 wrap.innerHTML=groups;
 $$('.themeCheckRow',wrap).forEach(row=>{
   $$('button',row).forEach(btn=>btn.addEventListener('click',()=>{
     $$('button',row).forEach(b=>b.classList.remove('active','ok','ng'));
     btn.classList.add('active',btn.dataset.v==='적합'?'ok':'ng');
   }));
 });
}
/* 핵심: 저장 시 "미흡"으로 평가된 항목만 자동으로 개별 개선조치 레코드를 생성 — 사람이 별도로
   "등록" 버튼을 누를 필요 없는 자동 등록 트랙. */
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
 /* render()가 host.innerHTML 전체를 다시 쓰기 때문에, 저장 직후 render()보다 먼저 결과 메시지를
    넣으면 즉시 지워져 사용자에게 전혀 안 보이는 버그가 있었음 — render()를 먼저 호출하고, 그 뒤에
    새로 생긴 DOM에 메시지를 설정하도록 순서를 바꿈. */
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
