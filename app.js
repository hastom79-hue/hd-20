/* =========================================================
   GMES HDPS 5S 활동관리 — Data Model & Rendering
   원본 화면설계요청서(APRISO_GMES_HDPS_5S_화면설계_요청서) 기준
   ========================================================= */

// 요청서 "5S 부서별 등록현황" 표 컬럼 기준 6개 유형 (정리·정돈·청소·시각화관리·습관화·자주보전)
const CATEGORIES = ['정리','정돈','청소','시각화관리','습관화','자주보전'];
const DEPARTMENTS = ['조립부','가공부','자재운영부','생산관리부'];

const TEAMS = [
  {id:'T1', name:'조립1팀',   dept:'조립부',     group:'A그룹', headcount:42},
  {id:'T2', name:'Rear조립팀', dept:'조립부',     group:'B그룹', headcount:36},
  {id:'T3', name:'가공1팀',   dept:'가공부',     group:'A그룹', headcount:31},
  {id:'T4', name:'자재운영팀', dept:'자재운영부', group:'A그룹', headcount:27},
  {id:'T5', name:'생산관리팀', dept:'생산관리부', group:'A그룹', headcount:24},
];

// 요청서 차트가 "04월~03월" 12개월 범위를 보여주므로 동일하게 구성
const MONTHS = ['2025-04','2025-05','2025-06','2025-07','2025-08','2025-09','2025-10','2025-11','2025-12','2026-01','2026-02','2026-03'];
function monthLabel(m){ return m.slice(5,7)+'월' }
const monthIndex = m => MONTHS.indexOf(m);
const prevMonth = m => MONTHS[Math.max(0, monthIndex(m)-1)];
const RECENT3 = MONTHS.slice(-3); // 2026-01,02,03 — 요청서 필터 기본값(등록월 2026-01~2026-03)과 동일

/* ---------- 유틸 ---------- */
const teamById = id => TEAMS.find(t=>t.id===id);
const teamsInDept = dept => TEAMS.filter(t=>t.dept===dept);
const deptHeadcount = dept => teamsInDept(dept).reduce((a,t)=>a+t.headcount,0);
function hash(str){let h=0;for(let i=0;i<str.length;i++){h=(h*31+str.charCodeAt(i))>>>0}return h}
// 2차 해시 — 1차 해시가 특정 modulus에서 값이 뭉치는 것을 방지하기 위한 재혼합
function hash2(str){ const h = hash(str); return ((h ^ (h>>>13)) * 2654435761) >>> 0; }
function toast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>t.classList.remove('show'), 1800);
}

/* =========================================================
   데이터 생성 (결정론적 mock — 서버 연동 전 목업)
   ========================================================= */

// 팀별 x 월별 x 6유형 "전체 활동건수" — HDPS42 차트3(팀별 유형별 활동현황)의 기초 데이터
const MONTHLY = {};
TEAMS.forEach((t,ti)=>{
  MONTHLY[t.id] = {};
  MONTHS.forEach((m,mi)=>{
    MONTHLY[t.id][m] = CATEGORIES.map((c,ci)=>{
      const seed = hash(t.id+c+m);
      const base = 5 + (ti%3)*2 + (5-ci)*0.6;
      const growth = mi*0.35;
      const noise = seed%4;
      return Math.max(1, Math.round(base+growth+noise));
    });
  });
});

// 부서별 x 월별 "5S 표준화(수평전개) 개선건수" — HDPS42 차트1(요청서 기능요구사항 1번)의 기초 데이터
const STD_MONTHLY = {};
DEPARTMENTS.forEach((d,di)=>{
  STD_MONTHLY[d] = {};
  MONTHS.forEach((m,mi)=>{
    const seed = hash(d+m+'std');
    STD_MONTHLY[d][m] = Math.max(1, Math.round(3+di*1.4 + mi*0.32 + seed%3));
  });
});

// 팀별 x 월별 Audit 총점 — HDPS42 차트2 및 안돈보드 기초 데이터
const AUDIT_BASE = {T1:88, T2:83, T3:76, T4:69, T5:80};
function auditScore(team, month){
  const mi = monthIndex(month);
  const seed = hash(team.id+month+'aud');
  const v = AUDIT_BASE[team.id] + mi*0.55 + (seed%7-3);
  return Math.max(55, Math.min(99, Math.round(v*10)/10));
}
function deptAuditScore(dept, month){
  const ts = teamsInDept(dept);
  return ts.reduce((a,t)=>a+auditScore(t,month),0)/ts.length;
}

// 5s_standard_item — HDPS32 점검항목 기준정보
const STANDARDS = [
  {id:'STD-001', category:'정리',       seq:1, q:'불필요한 부품, 재료, 기계등으로 공간의 낭비요소는 없는가?', note:'',                     use:true,  editor:'SYSTEM', date:'2026-01-19', modBy:'SYSTEM', modDate:'2026-01-19'},
  {id:'STD-002', category:'정리',       seq:2, q:'불필요한 치공구, 대차등으로 작업의 방해요소는 없는가?',      note:'',                     use:true,  editor:'SYSTEM', date:'2026-01-19', modBy:'김도현', modDate:'2026-02-10'},
  {id:'STD-003', category:'정리',       seq:3, q:'여분의 재고로 관리·품질·정리물류이동의 낭비 요소는 없는가?', note:'',                     use:true,  editor:'SYSTEM', date:'2026-01-19', modBy:'SYSTEM', modDate:'2026-01-19'},
  {id:'STD-004', category:'정돈',       seq:1, q:'필요한 것과 불필요한 것이 구분되지 않고 혼재되어 있지 않은가?', note:'',                   use:true,  editor:'SYSTEM', date:'2026-01-19', modBy:'SYSTEM', modDate:'2026-01-19'},
  {id:'STD-005', category:'정돈',       seq:2, q:'가용재, 불용재 기준이 정해져 있는가?',                       note:'',                     use:true,  editor:'SYSTEM', date:'2026-01-19', modBy:'박지연', modDate:'2026-02-15'},
  {id:'STD-006', category:'정돈',       seq:3, q:'최대·최소량과 품명이 명확히 표시되어 있는가?',               note:'라벨 표준 부착',        use:true,  editor:'SYSTEM', date:'2026-01-19', modBy:'SYSTEM', modDate:'2026-01-19'},
  {id:'STD-007', category:'청소',       seq:1, q:'바닥에 먼지·기름·쓰레기 없이 깨끗한가?',                     note:'',                     use:true,  editor:'SYSTEM', date:'2026-01-19', modBy:'SYSTEM', modDate:'2026-01-19'},
  {id:'STD-008', category:'청소',       seq:2, q:'기계 청소와 점검이 주기적으로 되고 있는가?',                 note:'주간 체크리스트 기준',   use:true,  editor:'SYSTEM', date:'2026-01-19', modBy:'SYSTEM', modDate:'2026-01-19'},
  {id:'STD-009', category:'시각화관리', seq:1, q:'표준·정상·이상 상태가 즉시 구분되는가?',                     note:'쉐도우보드 적용 여부',   use:true,  editor:'SYSTEM', date:'2026-02-02', modBy:'이수현', modDate:'2026-02-02'},
  {id:'STD-010', category:'시각화관리', seq:2, q:'각종 게시물이 최신본으로 빠짐없이 매하게 관리되고 있는가?',   note:'',                     use:true,  editor:'SYSTEM', date:'2026-01-19', modBy:'SYSTEM', modDate:'2026-01-19'},
  {id:'STD-011', category:'습관화',     seq:1, q:'정리·정돈·청소를 유지 개선하는 활동이 습관화되어 있는가?',    note:'',                     use:true,  editor:'SYSTEM', date:'2026-01-19', modBy:'SYSTEM', modDate:'2026-01-19'},
  {id:'STD-012', category:'자주보전',   seq:1, q:'설비 자주보전(일상점검) 항목이 정해진 주기로 실시되는가?',    note:'',                     use:true,  editor:'SYSTEM', date:'2026-01-19', modBy:'SYSTEM', modDate:'2026-01-19'},
  {id:'STD-013', category:'자주보전',   seq:2, q:'RGV 이동경로 내 협착 위험요소가 없는가?',                    note:'가공부 특화항목',       use:false, editor:'이수현', date:'2025-12-04', modBy:'이수현', modDate:'2025-12-04'},
];

// 5s_improvement — HDPS34 등록 + HDPS21 단건조회 + HDPS42 "5S 상세내역" 원천 데이터 (최근 3개월)
let REQUESTS = [
  {id:'IMP-2026-0301', date:'2026-03-24', team:'T1', category:'정리',       title:'RGV 레일 이물질 정리',       location:'RGV 레일 주변', issue:'RGV 레일 주변 이물질 및 불필요 자재 적치',    action:'분진 제거 및 불필요 자재 폐기',      status:'close',      standardized:true,  before:true, after:true},
  {id:'IMP-2026-0298', date:'2026-03-22', team:'T2', category:'정돈',       title:'부품 라벨 표준화',           location:'부품 보관대',   issue:'최대·최소 수량 미표기로 재고 과부족 반복',    action:'라벨 및 위치표준 적용',              status:'verify',     standardized:true,  before:true, after:true},
  {id:'IMP-2026-0294', date:'2026-03-20', team:'T3', category:'청소',       title:'절삭유 비산구역 청소주기 재정의', location:'가공 2라인',  issue:'절삭유 비산구역 청소주기·담당 불명확',       action:'주간 체크리스트 재정의',             status:'done',       standardized:false, before:true, after:false},
  {id:'IMP-2026-0289', date:'2026-03-18', team:'T1', category:'시각화관리', title:'공구 쉐도우보드 적용',       location:'조립1라인 공구대', issue:'공구 위치표시 불명확으로 반납 지연 발생',   action:'쉐도우보드 및 위치 라벨 적용',        status:'inprogress', standardized:true,  before:true, after:false},
  {id:'IMP-2026-0281', date:'2026-03-11', team:'T4', category:'자주보전',   title:'입고구역 경계표지 재도색',   location:'입고 대기구역', issue:'위험구역 경계 표시 퇴색으로 식별 곤란',      action:'경계선 및 위험표지 재도색',           status:'registered', standardized:false, before:true, after:false},
  {id:'IMP-2026-0276', date:'2026-03-05', team:'T5', category:'습관화',     title:'우수사례 게시판 연동',       location:'생산관리 게시판', issue:'우수 5S 활동이 타 팀에 공유되지 않음',      action:'표준화 자료 작성 후 수평전개 예정',    status:'draft',      standardized:true,  before:false,after:false},
  {id:'IMP-2026-0212', date:'2026-02-26', team:'T3', category:'정돈',       title:'가공유 보관대 표준화',       location:'가공유 보관소', issue:'가공유 보관 위치 미표준',                   action:'전용 보관대 및 라벨 적용',           status:'close',      standardized:true,  before:true, after:true},
  {id:'IMP-2026-0205', date:'2026-02-19', team:'T4', category:'정리',       title:'입고 대기구역 라인마킹',     location:'입고 통로',     issue:'입고 대기 파렛트가 통로를 침범',            action:'대기구역 라인마킹 재정비',           status:'close',      standardized:false, before:true, after:true},
  {id:'IMP-2026-0198', date:'2026-02-14', team:'T2', category:'청소',       title:'컨베이어 하부 청소주기 단축', location:'조립2라인 하부', issue:'컨베이어 하부 분진 누적',                  action:'하부 청소 주기 단축(월1→주1)',       status:'close',      standardized:true,  before:true, after:true},
  {id:'IMP-2026-0161', date:'2026-01-28', team:'T5', category:'시각화관리', title:'게시판 자동 연동',           location:'생산관리 게시판', issue:'게시판 최신 데이터 미반영',                action:'게시판 자동 연동 스크립트 적용',      status:'verify',     standardized:false, before:false,after:false},
  {id:'IMP-2026-0154', date:'2026-01-20', team:'T1', category:'자주보전',   title:'지게차 이동경로 표지 보수',  location:'조립1라인 통로', issue:'지게차 이동경로 표지 훼손',                action:'경계선 재도색 및 반사테이프 부착',    status:'close',      standardized:false, before:true, after:true},
  {id:'IMP-2026-0140', date:'2026-01-09', team:'T3', category:'습관화',     title:'표준 재교육 및 현장 게시',   location:'가공1라인',     issue:'표준 미준수 재발(2회차)',                  action:'표준서 재교육 및 현장 게시',          status:'inprogress', standardized:true,  before:true, after:false},
  {id:'IMP-2026-0231', date:'2026-02-08', team:'T1', category:'정돈',       title:'공구 반납위치 재공지',       location:'조립1라인 공구대', issue:'도구 반납위치 미준수 반복',                action:'반납위치 표준 재공지 및 순회점검',    status:'registered', standardized:false, before:false,after:false},
  {id:'IMP-2026-0225', date:'2026-02-03', team:'T5', category:'청소',       title:'사무구역 청소당번 재배치',   location:'생산관리 사무실', issue:'사무구역 청소상태 저하',                   action:'청소당번표 재배치',                  status:'inprogress', standardized:false, before:true, after:false},
];

const STATUS_LABEL = {draft:'Draft', registered:'요청등록', inprogress:'생산팀 조치중', done:'조치완료', verify:'5S모듈 검증', close:'Close'};

function andonState(score){
  if(score>=90) return 'g';
  if(score>=75) return 'a';
  return 'r';
}

/* =========================================================
   업무 로직
   ========================================================= */
// 인당 표준화 개선건수 = 부서 표준화 개선건수 ÷ 부서 인원 (요청서 기능요구사항 1번)
function deptStdPerCapita(dept, month){ return STD_MONTHLY[dept][month] / deptHeadcount(dept); }
function orgStdPerCapita(month){
  const totalStd = DEPARTMENTS.reduce((a,d)=>a+STD_MONTHLY[d][month],0);
  const totalHc = DEPARTMENTS.reduce((a,d)=>a+deptHeadcount(d),0);
  return totalStd/totalHc;
}
function orgAuditAvg(month){
  return TEAMS.reduce((a,t)=>a+auditScore(t,month),0)/TEAMS.length;
}
// 개선조치율 = 전월 지적건수(요청등록 이상) 중 완료 비율 — HDPS33 완료체크 기준
function actionRate(month){
  const pm = prevMonth(month);
  const items = REQUESTS.filter(r => r.date.slice(0,7)===pm && r.status!=='draft');
  if(!items.length) return null;
  const doneCnt = items.filter(r=>['done','verify','close'].includes(r.status)).length;
  return {rate: doneCnt/items.length*100, done:doneCnt, total:items.length, month:pm};
}

// HDPS33 감사 상세: 전월 점검결과(고정)/개선내역/조치완료/당월 점검결과
const AUDIT_TEMPLATES = {
  '정리':      {prevIssue:'통로 및 작업구역 내 불필요 자재 적치', note:'주간 정리 담당자 지정 및 순회점검', curIssue:'전월 대비 개선 확인, 재발 없음'},
  '정돈':      {prevIssue:'최대·최소량 표시 누락 구간 잔존',      note:'표시 라벨 전수 재부착',              curIssue:'일부 구간 라벨 탈락 재발'},
  '청소':      {prevIssue:'설비 하부 분진 누적',                 note:'청소 체크리스트 주기 단축',          curIssue:'청소주기 준수 확인'},
  '시각화관리': {prevIssue:'공구 위치표시 일부 훼손',              note:'쉐도우보드 재제작',                  curIssue:'쉐도우보드 정상 적용 확인'},
  '습관화':    {prevIssue:'점검·정리 활동이 담당자별로 편차 큼',   note:'주간 점검표 게시 및 상호 점검',       curIssue:'점검표 게시 확인, 습관화 진행중'},
  '자주보전':  {prevIssue:'설비 일상점검 누락 구간 존재',          note:'점검주기 알림 및 체크시트 개정',      curIssue:'점검주기 준수, 누락 없음'},
};
const auditState = {}; // key: teamId+month -> array of {done:boolean} overrides
function auditDetailFor(team, month){
  const base = auditScore(team, month);
  const key = team.id+month;
  if(!auditState[key]) auditState[key] = CATEGORIES.map(()=>null);
  return CATEGORIES.map((c,i)=>{
    const seed = hash(team.id+c+month);
    const seed2 = hash2(team.id+c+month);
    const quality = (base-70)/30; // 팀 Audit 총점 기준 -0.5 ~ 0.97
    const score = Math.max(0, Math.min(4, Math.round(2 + quality*2 + (seed%3-1))));
    const doneProb = 45 + quality*35; // 총점이 높은 팀일수록 조치완료 확률↑
    const defaultDone = (seed2 % 100) < doneProb;
    const done = auditState[key][i]===null ? defaultDone : auditState[key][i];
    const tpl = AUDIT_TEMPLATES[c];
    const standard = STANDARDS.find(s=>s.category===c) || {q:`${c} 점검항목`};
    return {category:c, catIndex:i, standard:standard.q, score, prevIssue:tpl.prevIssue, note:tpl.note, curIssue:tpl.curIssue, done};
  });
}
function toggleAuditDone(teamId, month, catIndex){
  const key = teamId+month;
  if(!auditState[key]) auditState[key] = CATEGORIES.map(()=>null);
  const current = auditDetailFor(teamById(teamId), month)[catIndex].done;
  auditState[key][catIndex] = !current;
}

// 팀별 문제점 현황 (HDPS42 하단 패널) — 최근 3개월 중 점수 낮은(문제) 건 카운트
function problemCount(team, category){
  let cnt=0;
  RECENT3.forEach(m=>{
    const d = auditDetailFor(team, m).find(x=>x.category===category);
    if(d.score<=2) cnt++;
  });
  return cnt;
}
// 팀별 개선조치율(%) — 최근 3개월 x 6유형 조치완료 비율
function teamActionRate(team){
  let done=0, total=0;
  RECENT3.forEach(m=>{
    auditDetailFor(team, m).forEach(d=>{ total++; if(d.done) done++; });
  });
  return total ? Math.round(done/total*100) : 0;
}

/* =========================================================
   HDPS42 — 5S 활동 종합 대시보드
   ========================================================= */
function renderAndon(){
  const el = document.getElementById('andonStrip');
  const month = document.getElementById('scopePeriod').value;
  el.innerHTML = TEAMS.map(t=>{
    const score = auditScore(t, month);
    const s = andonState(score);
    return `<div class="andon-cell ${s}">
      <span class="andon-team">${t.name}</span>
      <strong class="andon-score mono">${score.toFixed(1)}</strong>
      <span class="andon-tag">${s==='g'?'정상':s==='a'?'주의':'즉시조치'}</span>
    </div>`;
  }).join('');
}

function renderDashKPIs(month){
  document.getElementById('kpiPerCapita').textContent = orgStdPerCapita(month).toFixed(2);
  document.getElementById('kpiAuditAvg').textContent = orgAuditAvg(month).toFixed(1);
  const ar = actionRate(month);
  document.getElementById('kpiActionRate').textContent = ar ? ar.rate.toFixed(1)+'%' : '–';
  document.getElementById('kpiActionRateSub').textContent = ar ? `${monthLabel(ar.month)} 지적 ${ar.total}건 중 ${ar.done}건 완료` : '전월 데이터 없음';
  document.getElementById('kpiTotalReq').textContent = REQUESTS.length;
}

const DEPT_COLORS = ['s1','s2','s3','s4'];
function renderLegend(elId){
  document.getElementById(elId).innerHTML = DEPARTMENTS.map((d,i)=>`<span><i class="ddot ${DEPT_COLORS[i]}"></i>${d}</span>`).join('');
}

// 막대 + 추이선(SVG overlay) 콤보차트 — 요청서 "추이선 추가요청" 반영
function renderLineBarChart(wrapId, valueFn){
  const el = document.getElementById(wrapId);
  const H = 190;
  let max = 0;
  DEPARTMENTS.forEach(d=> MONTHS.forEach(m=> { max = Math.max(max, valueFn(d,m)); }));
  max = max || 1;

  const bars = MONTHS.map(m=>{
    const cells = DEPARTMENTS.map((d,di)=>{
      const v = valueFn(d,m);
      const h = Math.max(3, v/max*H);
      return `<div class="lb-bar ${DEPT_COLORS[di]}" style="height:${h}px" title="${d} · ${monthLabel(m)} · ${v.toFixed ? v.toFixed(2) : v}"></div>`;
    }).join('');
    return `<div class="lb-month"><div class="lb-bars">${cells}</div><span class="lb-mlabel">${monthLabel(m)}</span></div>`;
  }).join('');

  const slot = 100/MONTHS.length;
  const lineColors = ['#1a4262','#3d6c8f','#c9922f','#8a6a9e'];
  const polylines = DEPARTMENTS.map((d,di)=>{
    const pts = MONTHS.map((m,mi)=>{
      const v = valueFn(d,m);
      const x = (mi+0.5)*slot;
      const y = 100 - (v/max*92);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ');
    return `<polyline points="${pts}" fill="none" stroke="${lineColors[di]}" stroke-width="0.6" vector-effect="non-scaling-stroke" opacity="0.85"/>`;
  }).join('');

  el.innerHTML = `<div class="lb-bars-row" style="height:${H}px">${bars}</div>
    <svg class="lb-svg" viewBox="0 0 100 100" preserveAspectRatio="none">${polylines}</svg>`;
}

function renderTypeLegend(){
  document.getElementById('typeLegend').innerHTML = CATEGORIES.map((c,i)=>`<span><i class="tdot s${i+1}"></i>${c}</span>`).join('');
  document.getElementById('problemLegend').innerHTML = CATEGORIES.map((c,i)=>`<span><i class="tdot s${i+1}"></i>${c}</span>`).join('');
}

function renderChartControls(){
  document.getElementById('chartCategory').innerHTML = CATEGORIES.map(c=>`<option>${c}</option>`).join('');
  document.getElementById('chartTeam').innerHTML = TEAMS.map(t=>`<option value="${t.id}">${t.name}</option>`).join('');
}
function renderTeamTypeChart(){
  const mode = document.getElementById('chartMode').value;
  const el = document.getElementById('teamTypeChart');
  document.getElementById('chartCategory').style.display = mode==='type' ? '' : 'none';
  document.getElementById('chartTeam').style.display = mode==='trend' ? '' : 'none';

  if(mode==='trend'){
    const teamId = document.getElementById('chartTeam').value || TEAMS[0].id;
    const team = teamById(teamId);
    const max = Math.max(...MONTHS.map(m=>Math.max(...MONTHLY[team.id][m])));
    el.className = 'type-chart trend-mode';
    el.innerHTML = MONTHS.map(m=>{
      const vals = MONTHLY[team.id][m];
      return `<div class="team-bar-group">
        <div class="team-bars">${vals.map((v,i)=>`<div class="mini-bar-wrap"><span class="mini-value">${v}</span><div class="mini-bar s${i+1}" style="height:${Math.max(6,v/max*150)}px" title="${team.name} · ${CATEGORIES[i]} · ${monthLabel(m)} · ${v}건"></div></div>`).join('')}</div>
        <strong class="team-name">${monthLabel(m)}</strong>
      </div>`;
    }).join('');
  } else {
    const cat = document.getElementById('chartCategory').value || CATEGORIES[0];
    const ci = CATEGORIES.indexOf(cat);
    const month = document.getElementById('scopePeriod').value;
    const max = Math.max(...TEAMS.map(t=>MONTHLY[t.id][month][ci]));
    el.className = 'type-chart';
    el.innerHTML = TEAMS.map(t=>{
      const v = MONTHLY[t.id][month][ci];
      return `<div class="team-bar-group">
        <div class="team-bars"><div class="mini-bar-wrap"><span class="mini-value">${v}</span><div class="mini-bar s${ci+1}" style="height:${Math.max(8,v/max*150)}px"></div></div></div>
        <strong class="team-name">${t.name}</strong>
      </div>`;
    }).join('');
  }
}

function renderProblemChart(){
  const el = document.getElementById('problemChart');
  const data = TEAMS.map(t=> CATEGORIES.map(c=>problemCount(t,c)));
  const max = Math.max(1, ...data.flat());
  el.innerHTML = TEAMS.map((t,ti)=>{
    const vals = data[ti];
    return `<div class="team-bar-group">
      <div class="team-bars">${vals.map((v,i)=>`<div class="mini-bar-wrap"><span class="mini-value">${v}</span><div class="mini-bar s${i+1}" style="height:${Math.max(6,v/max*150)}px" title="${t.name} · ${CATEGORIES[i]} · 문제 ${v}건(최근3개월)"></div></div>`).join('')}</div>
      <strong class="team-name">${t.name}</strong>
    </div>`;
  }).join('');
}
function renderRateChart(){
  const el = document.getElementById('rateChart');
  el.innerHTML = TEAMS.map(t=>{
    const r = teamActionRate(t);
    return `<div class="rate-col">
      <span class="rate-val mono">${r}%</span>
      <div class="rate-bar" style="height:${Math.max(6,r/100*150)}px"></div>
      <span class="rate-name">${t.name}</span>
    </div>`;
  }).join('');
}

let rawStatusFilter = 'all';
function renderRawTable(){
  const rows = REQUESTS.filter(r=>{
    if(rawStatusFilter==='완료') return ['done','verify','close'].includes(r.status);
    if(rawStatusFilter==='미결') return ['draft','registered','inprogress'].includes(r.status);
    return true;
  });
  document.getElementById('rawTableBody').innerHTML = rows.map((r,i)=>{
    const done = ['done','verify','close'].includes(r.status);
    return `<tr>
      <td>${i+1}</td><td>${r.category}</td><td>${teamById(r.team).name}</td>
      <td>${r.issue}</td><td>${r.action||'—'}</td>
      <td><span class="status ${done?'done':'open'}">${done?'완료':'미결'}</span></td>
    </tr>`;
  }).join('');
}

function renderDeptRegisterTable(){
  document.getElementById('regRangeLabel').textContent = `${RECENT3[0]} ~ ${RECENT3[2]}`;
  document.getElementById('deptRegisterBody').innerHTML = TEAMS.map(t=>{
    const sums = [0,0,0,0,0,0];
    RECENT3.forEach(m=> MONTHLY[t.id][m].forEach((v,i)=> sums[i]+=v));
    const total = sums.reduce((a,b)=>a+b,0);
    const stdCnt = RECENT3.reduce((a,m)=> a + Math.round(STD_MONTHLY[t.dept][m]/teamsInDept(t.dept).length), 0);
    return `<tr><td><b>${t.name}</b></td><td class="mono">${stdCnt}</td><td class="mono">${total}</td>${sums.map(v=>`<td class="mono">${v}</td>`).join('')}</tr>`;
  }).join('');
}

function renderDetailTable(){
  document.getElementById('detailTableBody').innerHTML = REQUESTS.map(r=>{
    const t = teamById(r.team);
    return `<tr>
      <td class="mono">${r.id}</td><td class="mono">${r.date.slice(0,4)}</td>
      <td><span class="status ${r.standardized?'done':'open'}">${r.standardized?'Y':'N'}</span></td>
      <td class="mono">${monthLabel(r.date.slice(0,7))}</td>
      <td>${r.title}</td><td>${t.dept}</td><td>${t.group}</td><td>${r.location}</td>
      <td>${r.issue}</td><td>${r.action||'—'}</td><td class="mono">${r.date}</td>
    </tr>`;
  }).join('');
}

function renderDashboard(){
  const month = document.getElementById('scopePeriod').value;
  renderAndon();
  renderDashKPIs(month);
  renderLegend('stdLegend');
  renderLegend('auditLegend');
  renderLineBarChart('stdChartWrap', (d,m)=>deptStdPerCapita(d,m));
  renderLineBarChart('auditChartWrap', (d,m)=>deptAuditScore(d,m));
  renderTeamTypeChart();
  renderProblemChart();
  renderRateChart();
  renderRawTable();
  renderDeptRegisterTable();
  renderDetailTable();
}

/* =========================================================
   HDPS32 — 팀별 5S 점검항목관리
   ========================================================= */
function renderStandardFilters(){
  document.getElementById('stdFilterCategory').innerHTML = '<option value="all">전체</option>' + CATEGORIES.map(c=>`<option>${c}</option>`).join('');
}
function renderStandardTable(){
  const cat = document.getElementById('stdFilterCategory').value;
  const rows = STANDARDS.filter(s=> cat==='all' || s.category===cat);
  document.getElementById('standardTableBody').innerHTML = rows.map((s,i)=>`<tr>
    <td>${i+1}</td><td>${s.category}</td><td class="mono">${s.seq}</td>
    <td>${s.q}</td><td class="muted">${s.note||'—'}</td>
    <td><select class="inline-select" data-std="${s.id}"><option value="y" ${s.use?'selected':''}>사용</option><option value="n" ${!s.use?'selected':''}>미사용</option></select></td>
    <td>${s.editor}</td><td class="mono">${s.date}</td><td>${s.modBy}</td><td class="mono">${s.modDate}</td>
  </tr>`).join('');
  document.querySelectorAll('[data-std]').forEach(sel=>{
    sel.addEventListener('change', e=>{
      const std = STANDARDS.find(x=>x.id===e.target.dataset.std);
      std.use = e.target.value==='y';
      toast(`${std.id} 사용여부가 '${std.use?'사용':'미사용'}'으로 변경되었습니다.`);
    });
  });
}

/* =========================================================
   HDPS33 — 팀별 5S Audit 실적
   ========================================================= */
function renderAuditFilters(){
  document.getElementById('auditFilterMonth').innerHTML = MONTHS.slice().reverse().map(m=>`<option value="${m}">${m}</option>`).join('');
  document.getElementById('auditFilterTeam').innerHTML = TEAMS.map(t=>`<option value="${t.id}">${t.name}</option>`).join('');
}
function renderAuditView(){
  const month = document.getElementById('auditFilterMonth').value;
  const teamId = document.getElementById('auditFilterTeam').value || TEAMS[0].id;
  const team = teamById(teamId);
  const details = auditDetailFor(team, month);
  const avgScore = Math.round(details.reduce((a,d)=>a+d.score,0)/details.length*25);

  document.getElementById('auditHeaderCard').innerHTML = `
    <div class="ah-cell"><span>대상팀</span><strong>${team.name}</strong></div>
    <div class="ah-cell"><span>평가월</span><strong class="mono">${month}</strong></div>
    <div class="ah-cell"><span>평가자</span><strong>5S 모듈리더</strong></div>
    <div class="ah-cell"><span>총점(환산)</span><strong class="mono ${andonState(avgScore)==='r'?'bad':andonState(avgScore)==='a'?'warn':'good'}">${avgScore}</strong></div>`;

  document.getElementById('auditDetailBody').innerHTML = details.map(d=>`<tr>
    <td>${d.standard}</td>
    <td class="mono">${d.score} / 4</td>
    <td class="col-prev">${d.prevIssue}</td>
    <td class="col-note">${d.note}</td>
    <td><button class="btn-check ${d.done?'on':''}" data-team="${team.id}" data-month="${month}" data-cat="${d.catIndex}">${d.done?'완료':'미결'}</button></td>
    <td class="col-cur">${d.curIssue}</td>
  </tr>`).join('');

  document.querySelectorAll('.btn-check').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const b = e.currentTarget;
      toggleAuditDone(b.dataset.team, b.dataset.month, +b.dataset.cat);
      renderAuditView();
    });
  });
}

/* =========================================================
   HDPS34+21 — 개선요청 등록/조회
   ========================================================= */
function renderRequestTeamOptions(){
  document.getElementById('reqFilterTeam').innerHTML = '<option value="all">전체 팀</option>' + TEAMS.map(t=>`<option value="${t.id}">${t.name}</option>`).join('');
}
function renderDeptAuditSummary(){
  const month = document.getElementById('scopePeriod').value;
  document.getElementById('deptAuditSummaryBody').innerHTML = DEPARTMENTS.map(d=>{
    const all = REQUESTS.filter(r=> teamById(r.team).dept===d && r.status!=='draft');
    const cur = all.filter(r=> r.date.slice(0,7)===month);
    const doneAll = all.filter(r=>['done','verify','close'].includes(r.status)).length;
    const doneCur = cur.filter(r=>['done','verify','close'].includes(r.status)).length;
    const rate = all.length ? (doneAll/all.length*100).toFixed(1) : '0.0';
    return `<tr><td><b>${d}</b></td><td class="mono">${rate}%</td><td class="mono">${all.length}</td><td class="mono">${doneAll}</td><td class="mono">${cur.length}</td><td class="mono">${doneCur}</td></tr>`;
  }).join('');
}
function renderRequestGrid(){
  const teamFilter = document.getElementById('reqFilterTeam').value;
  const statusFilter = document.getElementById('reqFilterStatus').value;
  const rows = REQUESTS.filter(r=>{
    if(teamFilter!=='all' && r.team!==teamFilter) return false;
    if(statusFilter!=='all' && r.status!==statusFilter) return false;
    return true;
  });
  document.getElementById('requestGrid').innerHTML = rows.map(r=>`
    <div class="request-card" data-id="${r.id}">
      <div class="rc-top">
        <span class="rc-id mono">${r.id}</span>
        <span class="pill st-${r.status}">${STATUS_LABEL[r.status]}</span>
      </div>
      <p class="rc-title">${r.title}${r.standardized?'<span class="std-flag">표준화</span>':''}</p>
      <p class="rc-issue">${r.issue}</p>
      <div class="rc-meta">
        <span>${teamById(r.team).name}</span><span>·</span><span>${r.category}</span><span>·</span><span class="mono">${r.date}</span>
      </div>
      <div class="rc-ba">
        <span class="ba-flag ${r.before?'on':''}">Before</span>
        <span class="ba-flag ${r.after?'on':''}">After</span>
      </div>
    </div>`).join('') || `<p class="empty-note">조건에 해당하는 개선요청이 없습니다.</p>`;

  document.querySelectorAll('.request-card').forEach(card=>{
    card.addEventListener('click', ()=> openRequestModal(card.dataset.id));
  });
}

let editingId = null;
function fillSelectOptions(){
  document.getElementById('fTeam').innerHTML = TEAMS.map(t=>`<option value="${t.id}">${t.name} (${t.dept})</option>`).join('');
  document.getElementById('fCategory').innerHTML = CATEGORIES.map(c=>`<option>${c}</option>`).join('');
}
function mailNote(status){
  if(status==='draft') return '메일링 대상 아님 (Draft 상태에서는 발송되지 않습니다)';
  if(['registered','inprogress'].includes(status)) return 'TO 담당 생산팀 팀장/반장 — 문제점 등록 알림이 자동 발송되었습니다.';
  return 'TO 5S 모듈리더 — 개선완료 회신 알림이 자동 발송되었습니다.';
}
function openRequestModal(id){
  editingId = id || null;
  const r = id ? REQUESTS.find(x=>x.id===id) : null;
  document.getElementById('reqModalTitle').textContent = r ? '개선요청 상세' : '신규 개선요청';
  document.getElementById('reqModalId').textContent = r ? r.id : '등록 시 자동 채번';
  document.getElementById('fMonth').value = r ? r.date.slice(0,7) : '2026-03';
  document.getElementById('fTeam').value = r ? r.team : TEAMS[0].id;
  document.getElementById('fCategory').value = r ? r.category : CATEGORIES[0];
  document.getElementById('fLocation').value = r ? r.location : '';
  document.getElementById('fTitle').value = r ? r.title : '';
  document.getElementById('fStatus').value = r ? r.status : 'draft';
  document.getElementById('fStandardized').checked = r ? !!r.standardized : false;
  document.getElementById('fIssue').value = r ? r.issue : '';
  document.getElementById('fAction').value = r ? r.action : '';
  document.getElementById('beforePhoto').textContent = r && r.before ? 'Before 사진 첨부됨' : '사진 없음';
  document.getElementById('beforePhoto').classList.toggle('filled', !!(r&&r.before));
  document.getElementById('afterPhoto').textContent = r && r.after ? 'After 사진 첨부됨' : '사진 없음';
  document.getElementById('afterPhoto').classList.toggle('filled', !!(r&&r.after));
  document.getElementById('mailPreview').textContent = mailNote(r?r.status:'draft');
  document.getElementById('reqOwnerLine').textContent = r ? `담당팀: ${teamById(r.team).name}` : '';
  document.getElementById('fStatus').onchange = e=> document.getElementById('mailPreview').textContent = mailNote(e.target.value);
  document.getElementById('reqModalBackdrop').classList.add('show');
}
function closeRequestModal(){ document.getElementById('reqModalBackdrop').classList.remove('show'); }
function saveRequest(){
  const month = document.getElementById('fMonth').value || '2026-03';
  const team = document.getElementById('fTeam').value;
  const category = document.getElementById('fCategory').value;
  const location = document.getElementById('fLocation').value.trim();
  const title = document.getElementById('fTitle').value.trim();
  const status = document.getElementById('fStatus').value;
  const standardized = document.getElementById('fStandardized').checked;
  const issue = document.getElementById('fIssue').value.trim();
  const action = document.getElementById('fAction').value.trim();
  if(!issue){ toast('지적사항을 입력해 주세요.'); return; }
  if(editingId){
    const r = REQUESTS.find(x=>x.id===editingId);
    Object.assign(r, {team, category, location, title: title||r.title, status, standardized, issue, action});
    toast(`${r.id} 변경사항이 저장되었습니다.`);
  } else {
    const newId = 'IMP-2026-' + String(1000 + REQUESTS.length).slice(-4);
    REQUESTS.unshift({id:newId, date: month+'-'+String(new Date().getDate()).padStart(2,'0'), team, category, title: title||'(제목 미입력)', location: location||'—', issue, action, status, standardized, before:false, after:false});
    toast(`${newId} 개선요청이 등록되었습니다.`);
  }
  closeRequestModal();
  renderRequestGrid();
  renderDeptAuditSummary();
  renderDashboard();
}

/* =========================================================
   네비게이션 / 초기화
   ========================================================= */
function switchView(id){
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active', v.id==='view-'+id));
  document.querySelectorAll('.rail-btn').forEach(b=>b.classList.toggle('active', b.dataset.view===id));
  window.scrollTo({top:0, behavior:'smooth'});
}

document.getElementById('rail').addEventListener('click', e=>{
  const b = e.target.closest('[data-view]'); if(!b) return;
  switchView(b.dataset.view);
});
document.getElementById('scopePeriod').addEventListener('change', ()=>{ renderDashboard(); renderDeptAuditSummary(); });
document.getElementById('dashExport').addEventListener('click', ()=> toast('출력/CSV 내보내기는 실연동 시 서버 API와 연결됩니다.'));

document.getElementById('rawFilter').addEventListener('click', e=>{
  const b = e.target.closest('.chip'); if(!b) return;
  document.querySelectorAll('#rawFilter .chip').forEach(c=>c.classList.remove('active'));
  b.classList.add('active');
  rawStatusFilter = b.dataset.status;
  renderRawTable();
});
document.getElementById('chartMode').addEventListener('change', renderTeamTypeChart);
document.getElementById('chartCategory').addEventListener('change', renderTeamTypeChart);
document.getElementById('chartTeam').addEventListener('change', renderTeamTypeChart);

document.getElementById('standardAddBtn').addEventListener('click', ()=> toast('점검항목 신규등록 폼은 HDPS32 상세 설계 시 연결됩니다.'));
document.getElementById('stdFilterApply').addEventListener('click', renderStandardTable);

document.getElementById('auditFilterApply').addEventListener('click', renderAuditView);
document.getElementById('auditFilterMonth').addEventListener('change', renderAuditView);
document.getElementById('auditFilterTeam').addEventListener('change', renderAuditView);

document.getElementById('requestAddBtn').addEventListener('click', ()=> openRequestModal(null));
document.getElementById('reqFilterApply').addEventListener('click', renderRequestGrid);
document.getElementById('reqModalClose').addEventListener('click', closeRequestModal);
document.getElementById('reqModalCancel').addEventListener('click', closeRequestModal);
document.getElementById('reqModalSave').addEventListener('click', saveRequest);
document.getElementById('reqModalBackdrop').addEventListener('click', e=>{ if(e.target.id==='reqModalBackdrop') closeRequestModal(); });

function init(){
  renderChartControls();
  renderTypeLegend();
  renderDashboard();
  renderStandardFilters();
  renderStandardTable();
  renderAuditFilters();
  renderAuditView();
  fillSelectOptions();
  renderRequestTeamOptions();
  renderDeptAuditSummary();
  renderRequestGrid();
}
init();
