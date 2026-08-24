/* =========================================================
   GMES HDPS 5S 활동관리 — Data Model & Rendering
   기준 문서: APRISO GMES HDPS 5S 화면설계 요청서(260312, 서지철)
             + ARCHITECTURE.md 4~5장 업무 로직
   ========================================================= */

const CATEGORIES = ['정리','정돈','청소','시각화관리','습관화','자주보전'];
const TEAM_COLORS = ['#1a4262','#3d6c8f','#6f95ac','#c9922f','#8a6a9e'];

const TEAMS = [
  {id:'T1', name:'조립1팀',   site:'조립부',     headcount:42, auditScore:92.4, stdRatio:0.43},
  {id:'T2', name:'Rear조립팀', site:'조립부',     headcount:36, auditScore:88.1, stdRatio:0.29},
  {id:'T3', name:'가공1팀',   site:'가공부',     headcount:31, auditScore:79.3, stdRatio:0.35},
  {id:'T4', name:'자재운영팀', site:'자재운영부', headcount:27, auditScore:71.8, stdRatio:0.30},
  {id:'T5', name:'생산관리팀', site:'생산관리부', headcount:24, auditScore:84.6, stdRatio:0.32},
];

const MONTHS = ['2025-10','2025-11','2025-12','2026-01','2026-02','2026-03'];
const MONTH_LABEL = {'2025-10':'10월','2025-11':'11월','2025-12':'12월','2026-01':'01월','2026-02':'02월','2026-03':'03월'};

// 월별 x 팀별 x 6개 유형 개선건수 (정리,정돈,청소,시각화관리,습관화,자주보전 순)
const MONTHLY = {
  T1: {'2025-10':[24,18,13,10,6,9], '2025-11':[25,20,15,12,7,11], '2025-12':[26,20,17,12,7,11], '2026-01':[23,19,15,11,6,10], '2026-02':[24,20,15,12,7,11], '2026-03':[25,20,16,12,7,12]},
  T2: {'2025-10':[16,12,10,8,4,6], '2025-11':[17,13,11,9,5,7],  '2025-12':[18,13,12,9,5,7],  '2026-01':[17,12,10,9,4,6],  '2026-02':[17,12,11,9,5,7],  '2026-03':[18,13,11,10,5,7]},
  T3: {'2025-10':[11,12,14,5,6,6], '2025-11':[12,13,15,6,7,7],  '2025-12':[12,13,15,7,7,8],  '2026-01':[11,12,13,6,6,7],  '2026-02':[12,13,14,6,7,8],  '2026-03':[12,13,15,6,7,8]},
  T4: {'2025-10':[8,9,7,6,4,6],   '2025-11':[9,10,8,7,5,7],    '2025-12':[9,10,9,7,5,8],    '2026-01':[8,9,8,6,4,7],    '2026-02':[8,10,8,7,5,8],    '2026-03':[9,10,8,7,5,8]},
  T5: {'2025-10':[8,8,9,7,4,6],   '2025-11':[9,9,10,8,5,7],    '2025-12':[9,9,11,8,5,7],    '2026-01':[8,8,9,7,4,6],    '2026-02':[8,9,9,7,5,7],    '2026-03':[9,9,10,8,5,7]},
};

// 팀별 월별 Audit 총점 이력
const AUDIT_MONTHLY = {
  T1: [88.1,89.0,90.2,91.0,91.8,92.4],
  T2: [85.0,85.9,86.7,87.2,87.6,88.1],
  T3: [76.0,76.8,77.5,78.0,78.7,79.3],
  T4: [74.5,73.9,73.0,72.5,72.0,71.8],
  T5: [81.0,81.8,82.6,83.3,84.0,84.6],
};

// 월별 전체 반복지적률(%) / TOP5는 실데이터 기반 계산 — computeRepeatStats() 참고 (2개월 이상 연속 지적 기준)

// 5s_standard_item — 요청서 2p 표 헤더 기준 (No,5S구분,순서,점검항목명,비고,사용여부,등록자,등록일,수정자,수정일)
const STANDARDS = [
  {no:1, category:'정리',       seq:1, q:'불필요한 치공구·대차 등 작업 방해요소가 없는가?', note:'라인 통로 1m 이상 확보', use:true,  reg:'SYSTEM', regDate:'2026-01-19', mod:'SYSTEM', modDate:'2026-01-19'},
  {no:2, category:'정돈',       seq:1, q:'최대·최소량과 품명이 명확히 표시되어 있는가?',     note:'',                       use:true,  reg:'SYSTEM', regDate:'2026-01-19', mod:'SYSTEM', modDate:'2026-01-19'},
  {no:3, category:'청소',       seq:1, q:'기계 청소와 점검이 주기적으로 되고 있는가?',       note:'주간 체크리스트 기준',   use:true,  reg:'SYSTEM', regDate:'2026-01-19', mod:'SYSTEM', modDate:'2026-01-19'},
  {no:4, category:'시각화관리', seq:1, q:'표준·정상·이상 상태가 즉시 구분되는가?',           note:'쉐도우보드 적용 여부',   use:true,  reg:'SYSTEM', regDate:'2026-01-19', mod:'김도현', modDate:'2026-02-02'},
  {no:5, category:'습관화',     seq:1, q:'정리·정돈·청소 활동이 자율적으로 유지되는가?',     note:'',                       use:true,  reg:'SYSTEM', regDate:'2026-01-19', mod:'SYSTEM', modDate:'2026-01-19'},
  {no:6, category:'자주보전',   seq:1, q:'설비 누유·누수·이상소음 점검이 정례화되어 있는가?', note:'일일점검 기준',          use:true,  reg:'SYSTEM', regDate:'2026-01-19', mod:'SYSTEM', modDate:'2026-01-19'},
  {no:7, category:'정리',       seq:2, q:'절삭유·칩 비산구역 정리상태가 양호한가?',         note:'가공부 특화항목',        use:true,  reg:'김도현', regDate:'2026-02-10', mod:'김도현', modDate:'2026-02-10'},
  {no:8, category:'정돈',       seq:2, q:'입고자재 로케이션 표시가 실물과 일치하는가?',      note:'자재운영부 특화항목',    use:true,  reg:'박지연', regDate:'2026-02-15', mod:'박지연', modDate:'2026-02-15'},
  {no:9, category:'자주보전',   seq:2, q:'RGV 설비 정기점검 항목이 누락 없이 수행되는가?',   note:'',                       use:false, reg:'이수현', regDate:'2025-12-04', mod:'이수현', modDate:'2025-12-04'},
  {no:10,category:'습관화',     seq:2, q:'우수사례 게시판이 최신화되어 있는가?',            note:'',                       use:true,  reg:'SYSTEM', regDate:'2026-01-19', mod:'SYSTEM', modDate:'2026-01-19'},
];

// 5s_improvement — std:true 는 "5S 개선표준화(수평전개)" 플래그
let REQUESTS = [
  {id:'IMP-2026-0301', date:'2026-03-24', team:'T1', category:'정리',       location:'RGV 레일 주변', title:'RGV 레일 이물질 정리', issue:'RGV 레일 주변 이물질 및 불필요 자재 적치',        action:'분진 제거 및 불필요 자재 폐기',      status:'close',      before:true, after:true,  std:true},
  {id:'IMP-2026-0298', date:'2026-03-22', team:'T2', category:'정돈',       location:'부품 보관대', title:'최대·최소량 라벨 정비', issue:'최대·최소 수량 미표기로 재고 과부족 반복',        action:'라벨 및 위치표준 적용',              status:'verify',     before:true, after:true,  std:false},
  {id:'IMP-2026-0294', date:'2026-03-20', team:'T3', category:'청소',       location:'절삭유 비산구역', title:'청소주기 재정의', issue:'절삭유 비산구역 청소주기·담당 불명확',           action:'주간 체크리스트 재정의',             status:'done',       before:true, after:false, std:false},
  {id:'IMP-2026-0289', date:'2026-03-18', team:'T1', category:'시각화관리', location:'공구 보관함', title:'쉐도우보드 적용', issue:'공구 위치표시 불명확으로 반납 지연 발생',        action:'쉐도우보드 및 위치 라벨 적용',        status:'inprogress', before:true, after:false, std:true},
  {id:'IMP-2026-0281', date:'2026-03-11', team:'T4', category:'자주보전',   location:'지게차 점검구역', title:'누유 점검주기 준수', issue:'설비 누유 점검주기 미준수',                     action:'일일점검표 재배포 및 서명관리',       status:'registered', before:true, after:false, std:false},
  {id:'IMP-2026-0276', date:'2026-03-05', team:'T5', category:'습관화',     location:'사무구역 게시판', title:'우수사례 수평전개', issue:'우수 5S 활동이 타 팀에 공유되지 않음',           action:'표준화 자료 작성 후 수평전개 예정',    status:'draft',      before:false,after:false, std:true},
  {id:'IMP-2026-0212', date:'2026-02-26', team:'T3', category:'정돈',       location:'가공유 보관대', title:'가공유 보관 표준화', issue:'가공유 보관 위치 미표준',                       action:'전용 보관대 및 라벨 적용',            status:'close',      before:true, after:true,  std:true},
  {id:'IMP-2026-0205', date:'2026-02-19', team:'T4', category:'정리',       location:'입고 대기구역', title:'통로 침범 파렛트 정리', issue:'입고 대기 파렛트가 통로를 침범',                action:'대기구역 라인마킹 재정비',            status:'close',      before:true, after:true,  std:false},
  {id:'IMP-2026-0198', date:'2026-02-14', team:'T2', category:'청소',       location:'컨베이어 하부', title:'분진 청소주기 단축', issue:'컨베이어 하부 분진 누적',                       action:'하부 청소 주기 단축(월1→주1)',        status:'close',      before:true, after:true,  std:false},
  {id:'IMP-2026-0161', date:'2026-01-28', team:'T5', category:'시각화관리', location:'현황 게시판', title:'게시판 자동연동', issue:'게시판 최신 데이터 미반영',                     action:'게시판 자동 연동 스크립트 적용',      status:'verify',     before:false,after:false, std:false},
  {id:'IMP-2026-0154', date:'2026-01-20', team:'T1', category:'자주보전',   location:'지게차 점검대', title:'점검표 서명관리', issue:'지게차 점검표 미작성 누락 발생',                action:'점검표 서명관리 및 게시',            status:'close',      before:true, after:true,  std:true},
  {id:'IMP-2026-0140', date:'2026-01-09', team:'T3', category:'습관화',     location:'현장 게시판', title:'표준 재교육', issue:'표준 미준수 재발(2회차)',                       action:'표준서 재교육 및 현장 게시',          status:'inprogress', before:true, after:false, std:false},
  {id:'IMP-2026-0231', date:'2026-02-08', team:'T1', category:'정돈',       location:'공구 반납대', title:'반납위치 재공지', issue:'도구 반납위치 미준수 반복',                     action:'반납위치 표준 재공지 및 순회점검',    status:'registered', before:false,after:false, std:false},
  {id:'IMP-2026-0225', date:'2026-02-03', team:'T5', category:'청소',       location:'사무구역', title:'청소당번표 재배치', issue:'사무구역 청소상태 저하',                        action:'청소당번표 재배치',                  status:'inprogress', before:true, after:false, std:false},
];

const STATUS_LABEL = {draft:'Draft', registered:'요청등록', inprogress:'생산팀 조치중', done:'조치완료', verify:'5S모듈 검증', close:'Close'};

/* ---------- 유틸 ---------- */
const teamById = id => TEAMS.find(t=>t.id===id);
const monthIndex = m => MONTHS.indexOf(m);
const prevMonth = m => MONTHS[Math.max(0, monthIndex(m)-1)];
function hash(str){let h=0;for(let i=0;i<str.length;i++){h=(h*31+str.charCodeAt(i))>>>0}return h}
function toast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>t.classList.remove('show'), 1800);
}

/* =========================================================
   업무 로직
   ========================================================= */
function monthTotal(team, month){ return MONTHLY[team.id][month].reduce((a,b)=>a+b,0); }
function perCapita(team, month){ return monthTotal(team,month) / team.headcount; }
function stdPerCapita(team, month){ return (monthTotal(team,month) * team.stdRatio) / team.headcount; }
function orgStdPerCapita(month){
  let sum=0, hc=0; TEAMS.forEach(t=>{ sum+=monthTotal(t,month)*t.stdRatio; hc+=t.headcount; }); return sum/hc;
}
function actionRateFor(month, teamId){
  const pm = prevMonth(month);
  const items = REQUESTS.filter(r => r.date.slice(0,7)===pm && r.status!=='draft' && (!teamId || r.team===teamId));
  if(!items.length) return null;
  const doneCnt = items.filter(r=>['done','verify','close'].includes(r.status)).length;
  return {rate: doneCnt/items.length*100, done:doneCnt, total:items.length, month:pm};
}
function auditAvg(){ return TEAMS.reduce((a,t)=>a+t.auditScore,0)/TEAMS.length; }
function andonState(score){ if(score>=90) return 'g'; if(score>=75) return 'a'; return 'r'; }
function grade(score){ if(score>=93) return 'S'; if(score>=90) return 'A'; if(score>=80) return 'B'; if(score>=75) return 'C'; return 'D'; }

// 팀×유형별 "지적 발생" 시계열 — 2상태(정상/지적) 전이 모델
// newProb: 정상 상태에서 새로 지적이 발생할 확률, persist: 지적 상태가 다음달까지 이어질(=반복) 확률
// 팀 등급이 낮을수록(Audit 점수가 낮을수록) 두 확률 모두 높게 설정 — Audit 결과와 반복지적 경향을 연결
const TEAM_REPEAT_PARAMS = {
  T1: {newProb:0.20, persist:0.25},
  T2: {newProb:0.28, persist:0.30},
  T3: {newProb:0.40, persist:0.38},
  T4: {newProb:0.48, persist:0.45},
  T5: {newProb:0.32, persist:0.32},
};
function issueSeries(teamId, cat){
  const params = TEAM_REPEAT_PARAMS[teamId];
  let state = false;
  return MONTHS.map(m=>{
    const r = (hash(teamId+cat+m+'salt1310') % 1000)/1000;
    const issued = state ? (r < params.persist) : (r < params.newProb);
    state = issued;
    return issued;
  });
}

// 반복지적률 = 당월 지적 건 중, 전월에도 동일 팀×유형이 지적되었던(=2개월 이상 연속) 건의 비율
// 첫 번째 월은 비교할 전월 데이터가 없어 산정에서 제외 (최근 5개월 유효)
function computeRepeatStats(){
  const series = {};
  TEAMS.forEach(t=>{ series[t.id]={}; CATEGORIES.forEach(c=>{ series[t.id][c] = issueSeries(t.id, c); }); });

  const monthlyRates = MONTHS.map((m,i)=>{
    if(i===0) return null;
    let total=0, rep=0;
    TEAMS.forEach(t=>CATEGORIES.forEach(c=>{
      const s = series[t.id][c];
      if(s[i]){ total++; if(s[i-1]) rep++; }
    }));
    return total ? rep/total*100 : 0;
  });

  const teamStats = TEAMS.map(t=>{
    let total=0, rep=0; const catRepeat={};
    CATEGORIES.forEach(c=>{
      const s = series[t.id][c];
      s.forEach((issued,i)=>{
        if(i===0) return;
        if(issued){
          total++;
          if(s[i-1]){ rep++; catRepeat[c]=(catRepeat[c]||0)+1; }
        }
      });
    });
    const topCats = Object.entries(catRepeat).sort((a,b)=>b[1]-a[1]).slice(0,2).map(e=>e[0]);
    return {team:t.id, rate: total?rep/total*100:0, repeat:rep, total, types: topCats.length?topCats:['해당없음']};
  }).sort((a,b)=>b.rate-a.rate);

  return {monthlyRates, teamStats};
}

/* =========================================================
   HDPS42 — 통합 대시보드
   ========================================================= */
function renderAndon(){
  document.getElementById('andonStrip').innerHTML = TEAMS.map(t=>{
    const s = andonState(t.auditScore);
    return `<div class="andon-cell ${s}">
      <span class="andon-team">${t.name}</span>
      <strong class="andon-score mono">${t.auditScore.toFixed(1)}</strong>
      <span class="andon-tag">${grade(t.auditScore)}등급 · ${s==='g'?'정상':s==='a'?'주의':'즉시조치'}</span>
    </div>`;
  }).join('');
}

function renderDashKPIs(month){
  document.getElementById('kpiPerCapita').textContent = orgStdPerCapita(month).toFixed(2);
  document.getElementById('kpiAuditAvg').textContent = auditAvg().toFixed(1);
  const ar = actionRateFor(month);
  document.getElementById('kpiActionRate').textContent = ar ? ar.rate.toFixed(1)+'%' : '–';
  document.getElementById('kpiActionRateSub').textContent = ar ? `${MONTH_LABEL[ar.month]} 지적 ${ar.total}건 중 ${ar.done}건 완료` : '전월 데이터 없음';
  const recentMonths = MONTHS.slice(-3);
  document.getElementById('kpiTotalReq').textContent = REQUESTS.filter(r=>recentMonths.includes(r.date.slice(0,7))).length;
  const { monthlyRates } = computeRepeatStats();
  const valid = monthlyRates.filter(v=>v!==null);
  const curRepeat = valid[valid.length-1];
  const prevRepeat = valid[valid.length-2];
  const delta = curRepeat - prevRepeat;
  document.getElementById('kpiRepeatRate').textContent = curRepeat.toFixed(1)+'%';
  document.getElementById('kpiRepeatRateSub').textContent = `전월 대비 ${delta<=0?'▼':'▲'}${Math.abs(delta).toFixed(1)}%p ${delta<=0?'개선':'악화'}`;
}

// 월별 반복지적률 추이 (2개월 이상 연속 지적 기준, 최초 월은 비교 대상 없어 제외)
function renderRepeatTrend(){
  const { monthlyRates } = computeRepeatStats();
  const valid = monthlyRates.map((v,i)=>({v,i})).filter(x=>x.v!==null);
  const max = Math.max(...valid.map(x=>x.v)) * 1.15 || 10;
  document.getElementById('repeatTrendChart').innerHTML = valid.map(({v,i})=>{
    const m = MONTHS[i];
    return `<div class="rate-col">
      <span class="rate-val mono">${v.toFixed(1)}%</span>
      <div class="rate-bar repeat" style="height:${Math.max(6, v/max*150)}px" title="${MONTH_LABEL[m]} 반복지적률 ${v.toFixed(1)}%"></div>
      <span class="rate-name">${MONTH_LABEL[m]}</span>
    </div>`;
  }).join('');
}

// 반복지적 집중 작업장 TOP5 (2개월 이상 연속 지적 기준)
function renderRepeatTop5(){
  const { teamStats } = computeRepeatStats();
  document.getElementById('repeatTop5Body').innerHTML = teamStats.map((r,i)=>{
    const team = teamById(r.team);
    return `<tr>
      <td><span class="rank-badge ${i<3?'top':''}">${i+1}</span></td>
      <td><b>${team.name}</b></td>
      <td><span class="status ${r.rate>=25?'open':'done'} mono">${r.rate.toFixed(1)}%</span></td>
      <td class="mono">${r.repeat} / ${r.total}</td>
      <td>${r.types.map(c=>`<span class="cat-tag">${c}</span>`).join('')}</td>
    </tr>`;
  }).join('');
}

/* ---- 선+막대 결합 추이 차트 (부서별 5개 시리즈 × 6개월) ---- */
function renderLineBar(wrapId, legendId, valueFn, maxVal, unitFmt){
  document.getElementById(legendId).innerHTML = TEAMS.map((t,i)=>`<span><i class="ddot s${i+1}"></i>${t.name}</span>`).join('');
  const barsHtml = MONTHS.map(m=>{
    const bars = TEAMS.map((t,i)=>{
      const v = valueFn(t,m);
      const h = Math.max(4, v/maxVal*150);
      return `<div class="lb-bar s${i+1}" style="height:${h}px" title="${t.name} · ${MONTH_LABEL[m]} · ${unitFmt(v)}"></div>`;
    }).join('');
    return `<div class="lb-month"><div class="lb-bars">${bars}</div><span class="lb-mlabel">${MONTH_LABEL[m]}</span></div>`;
  }).join('');
  const polylines = TEAMS.map((t,i)=>{
    const pts = MONTHS.map((m,mi)=>{
      const x = (mi+0.5)/MONTHS.length*100;
      const y = 100 - Math.min(100, valueFn(t,m)/maxVal*100);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    return `<polyline points="${pts}" fill="none" stroke="${TEAM_COLORS[i]}" stroke-width="1.6" vector-effect="non-scaling-stroke" opacity="0.85"/>`;
  }).join('');
  document.getElementById(wrapId).innerHTML = `
    <div class="lb-bars-row" style="height:170px">${barsHtml}</div>
    <svg class="lb-svg" viewBox="0 0 100 100" preserveAspectRatio="none" style="height:150px;top:6px">${polylines}</svg>`;
}
function renderStdTrendChart(){
  const max = Math.max(...TEAMS.map(t=>Math.max(...MONTHS.map(m=>stdPerCapita(t,m)))));
  renderLineBar('stdChartWrap','stdLegend', stdPerCapita, max, v=>v.toFixed(2)+'건/인');
}
function renderAuditTrendChart(){
  renderLineBar('auditChartWrap','auditLegend', (t,m)=>AUDIT_MONTHLY[t.id][monthIndex(m)], 100, v=>v.toFixed(1)+'점');
}

/* ---- 팀별 5S 유형별 활동 현황: 차트구분/5S유형/팀선택 동적 전환 (기존 MES 차트 재현) ---- */
function renderTypeLegend(){
  document.getElementById('typeLegend').innerHTML = CATEGORIES.map((c,i)=>`<span><i class="tdot s${i+1}"></i>${c}</span>`).join('');
}
function renderTeamTypeByCategory(month, catFilter){
  const el = document.getElementById('teamTypeChart');
  el.className = 'type-chart';
  if(catFilter==='all'){
    const max = Math.max(...TEAMS.flatMap(t=>MONTHLY[t.id][month]));
    el.innerHTML = TEAMS.map(t=>{
      const vals = MONTHLY[t.id][month];
      return `<div class="team-bar-group">
        <div class="team-bars">${vals.map((v,i)=>`<div class="mini-bar-wrap"><span class="mini-value">${v}</span><div class="mini-bar s${i+1}" style="height:${Math.max(8,v/max*150)}px" title="${t.name} · ${CATEGORIES[i]} · ${v}건"></div></div>`).join('')}</div>
        <strong class="team-name">${t.name}</strong>
      </div>`;
    }).join('');
  } else {
    const ci = CATEGORIES.indexOf(catFilter);
    const vals = TEAMS.map(t=>MONTHLY[t.id][month][ci]);
    const max = Math.max(...vals);
    el.innerHTML = TEAMS.map((t,i)=>{
      const v = vals[i];
      return `<div class="team-bar-group">
        <div class="team-bars"><div class="mini-bar-wrap" style="max-width:44px"><span class="mini-value">${v}</span><div class="mini-bar s${(ci%6)+1}" style="height:${Math.max(8,v/max*150)}px" title="${t.name} · ${catFilter} · ${v}건"></div></div></div>
        <strong class="team-name">${t.name}</strong>
      </div>`;
    }).join('');
  }
}
function renderTeamTypeTrend(teamId){
  const team = teamById(teamId);
  const el = document.getElementById('teamTypeChart');
  el.className = 'monthly-stack-chart';
  const perCapRows = MONTHS.map(m=>MONTHLY[team.id][m].map(v=>v/team.headcount));
  const totals = perCapRows.map(r=>r.reduce((a,b)=>a+b,0));
  const max = Math.max(...totals, 0.1);
  el.innerHTML = MONTHS.map((m,idx)=>{
    const vals = perCapRows[idx], total = totals[idx];
    return `<div class="month-stack-group">
      <span class="month-total mono">${total.toFixed(2)}</span>
      <div class="month-stack" style="height:${Math.max(30,total/max*200)}px">${vals.map((v,i)=>`<span class="month-seg s${i+1}" style="height:${total?v/total*100:0}%" title="${CATEGORIES[i]} ${v.toFixed(2)}건/인"></span>`).join('')}</div>
      <span class="month-label">${MONTH_LABEL[m]}</span>
    </div>`;
  }).join('');
}
function renderTeamTypeChart(){
  const mode = document.getElementById('chartMode').value; // 'type' | 'trend'
  const catSel = document.getElementById('chartCategory');
  const teamSel = document.getElementById('chartTeam');
  const month = document.getElementById('scopePeriod').value;
  if(mode==='trend'){
    catSel.disabled = true;
    teamSel.disabled = false;
    renderTeamTypeTrend(teamSel.value || TEAMS[0].id);
  } else {
    catSel.disabled = false;
    teamSel.disabled = true;
    renderTeamTypeByCategory(month, catSel.value);
  }
}

// 팀별 문제점 현황 (HDPS33 전월 문제점 입력건 · 팀×유형)
function renderProblemChart(month){
  document.getElementById('problemLegend').innerHTML = CATEGORIES.map((c,i)=>`<span><i class="tdot s${i+1}"></i>${c}</span>`).join('');
  const el = document.getElementById('problemChart');
  const data = TEAMS.map(t=> CATEGORIES.map(c=> 1 + (hash(t.id+c+month+'p') % 6)));
  const max = Math.max(...data.flat());
  el.innerHTML = TEAMS.map((t,ti)=>{
    const vals = data[ti];
    return `<div class="team-bar-group">
      <div class="team-bars">${vals.map((v,i)=>`<div class="mini-bar-wrap"><span class="mini-value">${v}</span><div class="mini-bar s${i+1}" style="height:${Math.max(8,v/max*150)}px" title="${t.name} · ${CATEGORIES[i]} · ${v}건"></div></div>`).join('')}</div>
      <strong class="team-name">${t.name}</strong>
    </div>`;
  }).join('');
}

// 팀별 문제점 개선조치율
function renderRateChart(month){
  const el = document.getElementById('rateChart');
  el.innerHTML = TEAMS.map(t=>{
    const ar = actionRateFor(month, t.id);
    const rate = ar ? Math.round(ar.rate) : 0;
    return `<div class="rate-col">
      <span class="rate-val mono">${ar?rate+'%':'–'}</span>
      <div class="rate-bar" style="height:${Math.max(6, rate/100*150)}px"></div>
      <span class="rate-name">${t.name}</span>
    </div>`;
  }).join('');
}

// 5S 부서별 등록현황 (누적)
function renderDeptRegisterTable(){
  document.getElementById('regRangeLabel').textContent = `${MONTHS[0]} ~ ${MONTHS[MONTHS.length-1]}`;
  document.getElementById('deptRegisterBody').innerHTML = TEAMS.map(t=>{
    const totals = CATEGORIES.map((_,i)=> MONTHS.reduce((s,m)=> s+MONTHLY[t.id][m][i], 0));
    const sum = totals.reduce((a,b)=>a+b,0);
    const std = Math.round(sum * t.stdRatio);
    return `<tr>
      <td><b>${t.name}</b></td>
      <td class="mono">${std}</td>
      <td class="mono"><b>${sum}</b></td>
      ${totals.map(v=>`<td class="mono">${v}</td>`).join('')}
    </tr>`;
  }).join('');
}

// 5S 상세내역 (요청서 1p 하단 표 재현)
function renderDetailTable(){
  document.getElementById('detailTableBody').innerHTML = REQUESTS.slice(0,14).map(r=>{
    const team = teamById(r.team);
    return `<tr>
      <td class="mono">${r.id}</td>
      <td class="mono">${r.date.slice(0,4)}</td>
      <td>${r.std?'<span class="std-flag">Y</span>':'N'}</td>
      <td class="mono">${r.date.slice(5,7)}월</td>
      <td>${r.title||r.category}</td>
      <td>${team.site}</td>
      <td>${team.name}</td>
      <td>${r.location||'—'}</td>
      <td>${r.issue}</td>
      <td>${r.action||'—'}</td>
      <td class="mono">${r.date}</td>
    </tr>`;
  }).join('');
}

let rawStatusFilter = 'all';
function renderRawTable(){
  const rows = REQUESTS.filter(r=>{
    if(rawStatusFilter==='완료') return ['done','verify','close'].includes(r.status);
    if(rawStatusFilter==='미결') return ['draft','registered','inprogress'].includes(r.status);
    return true;
  }).slice(0,12);
  document.getElementById('rawTableBody').innerHTML = rows.map((r,i)=>{
    const done = ['done','verify','close'].includes(r.status);
    return `<tr>
      <td>${i+1}</td><td>${r.category}</td><td>${teamById(r.team).name}</td>
      <td>${r.issue}</td><td>${r.action||'—'}</td>
      <td><span class="status ${done?'done':'open'}">${done?'완료':'미결'}</span></td>
    </tr>`;
  }).join('');
}

function renderDashboard(){
  const month = document.getElementById('scopePeriod').value;
  renderAndon();
  renderDashKPIs(month);
  renderStdTrendChart();
  renderAuditTrendChart();
  renderTypeLegend();
  renderTeamTypeChart();
  renderProblemChart(month);
  renderRateChart(month);
  renderRepeatTrend();
  renderRepeatTop5();
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
  document.getElementById('standardTableBody').innerHTML = rows.map(s=>`<tr>
    <td class="mono">${s.no}</td><td>${s.category}</td><td class="mono">${s.seq}</td>
    <td>${s.q}</td><td class="muted">${s.note||'—'}</td>
    <td><span class="status ${s.use?'done':'open'}">${s.use?'사용':'미사용'}</span></td>
    <td>${s.reg}</td><td class="mono">${s.regDate}</td><td>${s.mod}</td><td class="mono">${s.modDate}</td>
  </tr>`).join('');
}

/* =========================================================
   HDPS33 — 팀별 Audit 실적
   ========================================================= */
const AUDIT_TEMPLATES = {
  '정리':      {prev:'전월 지적 없음', note:'—', issue:'통로 및 작업구역 내 불필요 자재 적치'},
  '정돈':      {prev:'라벨링 표준 미흡으로 전월 지적', note:'표시 라벨 1차 재부착 완료', issue:'최대·최소량 표시 누락 구간 잔존'},
  '청소':      {prev:'청소주기 미준수로 전월 지적', note:'체크리스트 개정안 배포', issue:'설비 하부 분진 누적'},
  '시각화관리': {prev:'전월 지적 없음', note:'—', issue:'공구 위치표시 일부 훼손'},
  '습관화':    {prev:'게시물 최신화 미흡으로 전월 지적', note:'담당자 지정 및 1차 게시', issue:'우수사례 공유 체계 부재'},
  '자주보전':  {prev:'점검주기 미준수로 전월 지적', note:'점검표 서명관리 개시', issue:'설비 이상소음 점검 누락'},
};
let AUDIT_CHECK = {};
function auditDetailFor(team, month){
  const base = team.auditScore;
  return CATEGORIES.map((c)=>{
    const seed = hash(team.id+c+month);
    const delta = (seed % 9) - 4;
    const score = Math.max(60, Math.min(100, Math.round(base + delta)));
    const key = team.id+'_'+month+'_'+c;
    if(!(key in AUDIT_CHECK)) AUDIT_CHECK[key] = (seed % 3) !== 0;
    const tpl = AUDIT_TEMPLATES[c];
    const std = STANDARDS.find(s=>s.category===c);
    return {key, category:c, standard: std ? std.q : `${c} 점검항목`, score, prev:tpl.prev, note:tpl.note, issue:tpl.issue};
  });
}
function renderAuditMonthOptions(){
  document.getElementById('auditFilterMonth').innerHTML = MONTHS.map(m=>`<option value="${m}" ${m===MONTHS[MONTHS.length-1]?'selected':''}>${m.slice(0,4)}년 ${MONTH_LABEL[m]}</option>`).join('');
}
function renderAuditTeamOptions(){
  document.getElementById('auditFilterTeam').innerHTML = TEAMS.map(t=>`<option value="${t.id}">${t.name}</option>`).join('');
}
function renderAuditView(){
  const month = document.getElementById('auditFilterMonth').value || MONTHS[MONTHS.length-1];
  const teamId = document.getElementById('auditFilterTeam').value || TEAMS[0].id;
  const team = teamById(teamId);
  const details = auditDetailFor(team, month);
  const avg = Math.round(details.reduce((a,d)=>a+d.score,0)/details.length);
  const st = andonState(avg);

  document.getElementById('auditHeaderCard').innerHTML = `
    <div class="ah-cell"><span>대상팀</span><strong>${team.name}</strong></div>
    <div class="ah-cell"><span>평가월</span><strong class="mono">${MONTH_LABEL[month]||month}</strong></div>
    <div class="ah-cell"><span>평가자</span><strong>5S 모듈리더</strong></div>
    <div class="ah-cell"><span>총점</span><strong class="mono ${st==='r'?'bad':st==='a'?'warn':'good'}">${avg} <small>(${grade(avg)}등급)</small></strong></div>`;

  document.getElementById('auditDetailBody').innerHTML = details.map(d=>`<tr>
    <td>${d.standard}</td>
    <td class="mono">${d.score}</td>
    <td class="col-prev">${d.prev}</td>
    <td class="col-note">${d.note}</td>
    <td><button class="btn-check ${AUDIT_CHECK[d.key]?'on':''}" data-key="${d.key}">${AUDIT_CHECK[d.key]?'완료':'미결'}</button></td>
    <td class="col-cur">${d.issue}</td>
  </tr>`).join('');

  document.querySelectorAll('#auditDetailBody .btn-check').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const key = btn.dataset.key;
      AUDIT_CHECK[key] = !AUDIT_CHECK[key];
      btn.classList.toggle('on', AUDIT_CHECK[key]);
      btn.textContent = AUDIT_CHECK[key] ? '완료' : '미결';
    });
  });
}

/* =========================================================
   HDPS34+21 — 개선요청 등록/조회
   ========================================================= */
function renderDeptAuditSummary(){
  const month = document.getElementById('scopePeriod').value;
  const depts = [...new Set(TEAMS.map(t=>t.site))];
  document.getElementById('deptAuditSummaryBody').innerHTML = depts.map(site=>{
    const teamIds = TEAMS.filter(t=>t.site===site).map(t=>t.id);
    const cum = REQUESTS.filter(r=>teamIds.includes(r.team) && r.status!=='draft');
    const cumDone = cum.filter(r=>['done','verify','close'].includes(r.status)).length;
    const cur = cum.filter(r=>r.date.slice(0,7)===month);
    const curDone = cur.filter(r=>['done','verify','close'].includes(r.status)).length;
    const rate = cum.length ? (cumDone/cum.length*100) : 0;
    return `<tr>
      <td><b>${site}</b></td>
      <td><span class="status ${rate>=80?'done':'open'} mono">${cum.length?rate.toFixed(1)+'%':'–'}</span></td>
      <td class="mono">${cum.length}</td>
      <td class="mono">${cumDone}</td>
      <td class="mono">${cur.length}</td>
      <td class="mono">${curDone}</td>
    </tr>`;
  }).join('');
}
function renderRequestTeamOptions(){
  document.getElementById('reqFilterTeam').innerHTML = '<option value="all">전체 팀</option>' + TEAMS.map(t=>`<option value="${t.id}">${t.name}</option>`).join('');
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
      <p class="rc-title">${r.title||r.category}</p>
      <p class="rc-issue">${r.issue}</p>
      <div class="rc-meta">
        <span>${teamById(r.team).name}</span><span>·</span><span>${r.category}</span><span>·</span><span class="mono">${r.date}</span>
        ${r.std?'<span class="std-flag">표준화</span>':''}
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
  document.getElementById('fTeam').innerHTML = TEAMS.map(t=>`<option value="${t.id}">${t.name}</option>`).join('');
  document.getElementById('fCategory').innerHTML = CATEGORIES.map(c=>`<option>${c}</option>`).join('');
}
function mailNote(status){
  if(status==='draft') return '메일링 대상 아님 (Draft 상태에서는 발송되지 않습니다)';
  if(['registered','inprogress'].includes(status)) return 'TO 담당 생산팀 팀장/반장 — 개선요청 등록 알림이 자동 발송되었습니다.';
  return 'TO 5S 모듈리더 — 개선완료 회신 알림이 자동 발송되었습니다. CC 부서 책임자';
}
function openRequestModal(id){
  editingId = id || null;
  const r = id ? REQUESTS.find(x=>x.id===id) : null;
  document.getElementById('reqModalTitle').textContent = r ? '개선요청 상세' : '신규 개선요청';
  document.getElementById('reqModalId').textContent = r ? r.id : '등록 시 자동 채번';
  document.getElementById('fMonth').value = r ? r.date.slice(0,7) : document.getElementById('scopePeriod').value;
  document.getElementById('fTeam').value = r ? r.team : TEAMS[0].id;
  document.getElementById('fCategory').value = r ? r.category : CATEGORIES[0];
  document.getElementById('fLocation').value = r ? (r.location||'') : '';
  document.getElementById('fTitle').value = r ? (r.title||'') : '';
  document.getElementById('fStandardized').checked = r ? !!r.std : false;
  document.getElementById('fStatus').value = r ? r.status : 'draft';
  document.getElementById('fIssue').value = r ? r.issue : '';
  document.getElementById('fAction').value = r ? r.action : '';
  document.getElementById('beforePhoto').textContent = r && r.before ? '사진 첨부됨' : '사진 없음';
  document.getElementById('beforePhoto').classList.toggle('filled', !!(r&&r.before));
  document.getElementById('afterPhoto').textContent = r && r.after ? '사진 첨부됨' : '사진 없음';
  document.getElementById('afterPhoto').classList.toggle('filled', !!(r&&r.after));
  document.getElementById('mailPreview').textContent = mailNote(r?r.status:'draft');
  document.getElementById('reqOwnerLine').textContent = r ? `담당팀: ${teamById(r.team).name}` : '';
  document.getElementById('fStatus').onchange = e=> document.getElementById('mailPreview').textContent = mailNote(e.target.value);
  document.getElementById('reqModalBackdrop').classList.add('show');
}
function closeRequestModal(){ document.getElementById('reqModalBackdrop').classList.remove('show'); }
function saveRequest(){
  const team = document.getElementById('fTeam').value;
  const category = document.getElementById('fCategory').value;
  const status = document.getElementById('fStatus').value;
  const issue = document.getElementById('fIssue').value.trim();
  const action = document.getElementById('fAction').value.trim();
  const location = document.getElementById('fLocation').value.trim();
  const title = document.getElementById('fTitle').value.trim();
  const std = document.getElementById('fStandardized').checked;
  const month = document.getElementById('fMonth').value || '2026-03';
  if(!issue){ toast('지적사항(Before)을 입력해 주세요.'); return; }
  if(editingId){
    const r = REQUESTS.find(x=>x.id===editingId);
    Object.assign(r, {team, category, status, issue, action, location, title, std});
    toast(`${r.id} 변경사항이 저장되었습니다.`);
  } else {
    const newId = 'IMP-2026-' + String(1000 + REQUESTS.length).slice(-4);
    REQUESTS.unshift({id:newId, date: month+'-'+String(new Date().getDate()).padStart(2,'0'), team, category, issue, action, location, title, status, before:false, after:false, std});
    toast(`${newId} 개선요청이 등록되었습니다.`);
  }
  closeRequestModal();
  renderRequestGrid();
  renderDashboard();
  renderDeptAuditSummary();
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
document.getElementById('scopeSite').addEventListener('change', ()=> toast('현재 프로토타입 데이터는 [CE01] 울산공장 기준입니다.'));
document.getElementById('dashExport').addEventListener('click', ()=> toast('CSV 내보내기는 실연동 시 서버 API와 연결됩니다.'));

document.getElementById('chartMode').addEventListener('change', renderTeamTypeChart);
document.getElementById('chartCategory').addEventListener('change', renderTeamTypeChart);
document.getElementById('chartTeam').addEventListener('change', renderTeamTypeChart);

document.getElementById('rawFilter').addEventListener('click', e=>{
  const b = e.target.closest('.chip'); if(!b) return;
  document.querySelectorAll('#rawFilter .chip').forEach(c=>c.classList.remove('active'));
  b.classList.add('active');
  rawStatusFilter = b.dataset.status;
  renderRawTable();
});

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
  document.getElementById('chartCategory').innerHTML = '<option value="all">전체 유형</option>' + CATEGORIES.map(c=>`<option>${c}</option>`).join('');
  document.getElementById('chartTeam').innerHTML = TEAMS.map(t=>`<option value="${t.id}">${t.name}</option>`).join('');
  renderAuditMonthOptions();
  renderDashboard();
  renderStandardFilters();
  renderStandardTable();
  renderAuditTeamOptions();
  renderAuditView();
  fillSelectOptions();
  renderRequestTeamOptions();
  renderRequestGrid();
  renderDeptAuditSummary();
}
init();
