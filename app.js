/* =========================================================
   GMES HDPS 5S 활동관리 — Data Model & Rendering
   기준 문서: APRISO GMES HDPS 5S 화면설계 요청서(260312, 서지철)
             + ARCHITECTURE.md 4~5장 업무 로직
   ========================================================= */

const CATEGORIES = ['정리','정돈','청소','시각화관리','습관화','자주보전'];
// 그룹(부서) 결합 추이차트용 8색 팔레트
const DEPT_COLORS = ['#1a4262','#3d6c8f','#6f95ac','#c9922f','#8a6a9e','#5c8a5a','#b5563f','#5a6b7c'];

// 실데이터 출처: 울산캠퍼스_26년_2분기_소그룹활동_과제_평가(배포용).xlsx — 등장하는 생산현장팀 16개 전원 반영
// auditScore는 해당 xlsx의 "평가결과"(S/A/B/C) 등급을 S=97/A=92/B=85/C=76로 환산한 팀별 평균값(실데이터 기반)
// headcount는 원본 파일에 없어 부여한 가정치입니다 — 실제 인원 마스터 연동 시 교체 필요
function hash(str){let h=0;for(let i=0;i<str.length;i++){h=(h*31+str.charCodeAt(i))>>>0}return h}
function stdRatioFor(auditScore){
  const v = 0.20 + Math.max(0, Math.min(1, (auditScore-76)/21)) * 0.35;
  return Math.round(v*100)/100;
}
const TEAM_DEFS = [
  {id:'T1',  name:'대형Att.팀',    site:'대형조립부',    headcount:28, auditScore:76.0},
  {id:'T2',  name:'대형메인팀',    site:'대형조립부',    headcount:34, auditScore:76.0},
  {id:'T3',  name:'대형상부팀',    site:'대형조립부',    headcount:31, auditScore:80.5},
  {id:'T4',  name:'프레임제작팀',  site:'프레임제작부',  headcount:26, auditScore:88.5},
  {id:'T5',  name:'Boom제작팀',    site:'Boom제작부',    headcount:22, auditScore:97.0},
  {id:'T6',  name:'중형상부1팀',   site:'중형조립부',    headcount:24, auditScore:85.0},
  {id:'T7',  name:'중형상부2팀',   site:'중형조립부',    headcount:27, auditScore:85.0},
  {id:'T8',  name:'중형하부팀',    site:'중형조립부',    headcount:30, auditScore:79.0},
  {id:'T9',  name:'중형Att팀',     site:'중형조립부',    headcount:25, auditScore:82.0},
  {id:'T10', name:'중형메인팀',    site:'중형조립부',    headcount:29, auditScore:82.0},
  {id:'T11', name:'휠로더Front팀', site:'휠로더조립부',  headcount:23, auditScore:85.0},
  {id:'T12', name:'휠로더리어팀',  site:'휠로더조립부',  headcount:21, auditScore:97.0},
  {id:'T13', name:'휠로더메인팀',  site:'휠로더조립부',  headcount:26, auditScore:85.0},
  {id:'T14', name:'초대형조립팀',  site:'초대형조립부',  headcount:19, auditScore:80.5},
  {id:'T15', name:'성능팀',       site:'성능시험부',    headcount:16, auditScore:85.0},
  {id:'T16', name:'트러블슈팅팀',  site:'트러블슈팅부',  headcount:14, auditScore:76.0},
];
const TEAMS = TEAM_DEFS.map(t=>({...t, stdRatio: stdRatioFor(t.auditScore)}));
const DEPTS = [...new Set(TEAMS.map(t=>t.site))];

const MONTHS = ['2026-01','2026-02','2026-03','2026-04','2026-05','2026-06'];
const MONTH_LABEL = {'2026-01':'01월','2026-02':'02월','2026-03':'03월','2026-04':'04월','2026-05':'05월','2026-06':'06월'};

// 월별 x 팀별 x 6개 유형 개선건수 — 팀 규모(headcount)와 Audit 점수에 연동한 결정적 생성 (수동 하드코딩 대신 규칙 기반 산출)
function buildMonthly(team){
  const weights = CATEGORIES.map(c => 0.6 + (hash(team.id+c+'w')%1000)/1000*1.4);
  const wsum = weights.reduce((a,b)=>a+b,0);
  const norm = weights.map(w=>w/wsum);
  const baseTotal = team.headcount * 2.0;
  const out = {};
  MONTHS.forEach((m,mi)=>{
    const growth = 1 + (mi-2.5)*0.015;
    const monthNoise = 0.9 + (hash(team.id+m+'n')%1000)/1000*0.2;
    const total = baseTotal*growth*monthNoise;
    out[m] = norm.map((w,i)=>{
      const catNoise = 0.85 + (hash(team.id+CATEGORIES[i]+m+'c')%1000)/1000*0.3;
      return Math.max(1, Math.round(total*w*catNoise));
    });
  });
  return out;
}
// 팀별 월별 Audit 총점 이력 — 최종월 값은 xlsx 평가결과 환산 점수와 일치, 이전 달은 등급 추세를 반영한 결정적 보간
function buildAuditMonthly(team){
  const trendDir = team.auditScore>=85 ? 1 : (team.auditScore<80 ? -1 : 0.3);
  const arr = MONTHS.map((m,i)=>{
    const stepsFromEnd = MONTHS.length-1-i;
    const drift = -trendDir*stepsFromEnd*0.9;
    const noise = ((hash(team.id+m+'audit')%1000)/1000 - 0.5)*2.4;
    return Math.max(55, Math.min(99, team.auditScore + drift + noise));
  });
  arr[arr.length-1] = team.auditScore;
  return arr.map(v=>Math.round(v*10)/10);
}
const MONTHLY = {};
const AUDIT_MONTHLY = {};
TEAMS.forEach(t=>{ MONTHLY[t.id] = buildMonthly(t); AUDIT_MONTHLY[t.id] = buildAuditMonthly(t); });

// 월별 전체 반복지적률(%) / TOP5는 실데이터 기반 계산 — computeRepeatStats() 참고 (2개월 이상 연속 지적 기준)

// 5s_standard_item — 요청서 2p 표 헤더 기준 (No,5S구분,순서,점검항목명,비고,사용여부,등록자,등록일,수정자,수정일)
const STANDARDS = [
  {no:1, category:'정리',       seq:1, q:'불필요한 치공구·대차 등 작업 방해요소가 없는가?', note:'라인 통로 1m 이상 확보', use:true,  reg:'SYSTEM', regDate:'2026-01-19', mod:'SYSTEM', modDate:'2026-01-19'},
  {no:2, category:'정돈',       seq:1, q:'최대·최소량과 품명이 명확히 표시되어 있는가?',     note:'',                       use:true,  reg:'SYSTEM', regDate:'2026-01-19', mod:'SYSTEM', modDate:'2026-01-19'},
  {no:3, category:'청소',       seq:1, q:'기계 청소와 점검이 주기적으로 되고 있는가?',       note:'주간 체크리스트 기준',   use:true,  reg:'SYSTEM', regDate:'2026-01-19', mod:'SYSTEM', modDate:'2026-01-19'},
  {no:4, category:'시각화관리', seq:1, q:'표준·정상·이상 상태가 즉시 구분되는가?',           note:'쉐도우보드 적용 여부',   use:true,  reg:'SYSTEM', regDate:'2026-01-19', mod:'김도현', modDate:'2026-02-02'},
  {no:5, category:'습관화',     seq:1, q:'정리·정돈·청소 활동이 자율적으로 유지되는가?',     note:'',                       use:true,  reg:'SYSTEM', regDate:'2026-01-19', mod:'SYSTEM', modDate:'2026-01-19'},
  {no:6, category:'자주보전',   seq:1, q:'설비 누유·누수·이상소음 점검이 정례화되어 있는가?', note:'일일점검 기준',          use:true,  reg:'SYSTEM', regDate:'2026-01-19', mod:'SYSTEM', modDate:'2026-01-19'},
  {no:7, category:'정리',       seq:2, q:'로봇 용접 주변 스패터·이물질 정리상태가 양호한가?', note:'중형조립부 특화항목',    use:true,  reg:'김도현', regDate:'2026-02-10', mod:'김도현', modDate:'2026-02-10'},
  {no:8, category:'정돈',       seq:2, q:'AGV/RGV 이동경로 자재 적치가 없는가?',            note:'휠로더조립부 특화항목',  use:true,  reg:'박지연', regDate:'2026-02-15', mod:'박지연', modDate:'2026-02-15'},
  {no:9, category:'자주보전',   seq:2, q:'권상 지그·전용 치공구 정기점검이 수행되는가?',     note:'',                       use:false, reg:'이수현', regDate:'2025-12-04', mod:'이수현', modDate:'2025-12-04'},
  {no:10,category:'습관화',     seq:2, q:'우수사례 게시판이 최신화되어 있는가?',            note:'',                       use:true,  reg:'SYSTEM', regDate:'2026-01-19', mod:'SYSTEM', modDate:'2026-01-19'},
];

// 5s_improvement — std:true 는 "5S 개선표준화(수평전개)" 플래그
// (참고: 이 목업 항목들은 별도의 예시 데이터이며, 업로드된 소그룹활동 과제평가 xlsx의 과제 내용을 그대로 옮긴 것은 아닙니다.
//  xlsx는 팀 목록·Audit 점수 산정에만 반영했습니다.)
let REQUESTS = [
  {id:'IMP-2026-0301', date:'2026-06-24', team:'T1',  category:'정리',       location:'작업표준서 게시대', title:'작업표준서 정리 표준화', issue:'대형Att.팀 작업표준서가 공정별로 정리되지 않음', action:'표준서 공정별 분류 및 QR 코드 부착', status:'close',      before:true, after:true,  std:true},
  {id:'IMP-2026-0298', date:'2026-06-20', team:'T2',  category:'정돈',       location:'스윙베어링 권상구역', title:'권상 지그 정돈', issue:'권상 지그·가이드핀 보관위치 미표준', action:'전용 거치대 및 라벨 적용', status:'verify',     before:true, after:true,  std:false},
  {id:'IMP-2026-0294', date:'2026-06-15', team:'T3',  category:'청소',       location:'엔진 석션 파이프 공정', title:'조립부 이물질 청소', issue:'석션 파이프 조립부 절삭분 누적', action:'공정 종료 후 청소 체크리스트 추가', status:'done',       before:true, after:false, std:false},
  {id:'IMP-2026-0289', date:'2026-06-08', team:'T4',  category:'시각화관리', location:'상부가접 검사대',   title:'평면도 기준 시각화', issue:'상부가접 평면도 수치 기준 미게시', action:'기준 수치 스티커 부착 및 게시', status:'inprogress', before:true, after:false, std:true},
  {id:'IMP-2026-0281', date:'2026-05-30', team:'T5',  category:'자주보전',   location:'로봇 용접 라인',    title:'용접로봇 자주보전', issue:'로봇 용접조건 점검주기 미준수', action:'일일점검표 서명관리 도입', status:'close',      before:true, after:true,  std:true},
  {id:'IMP-2026-0276', date:'2026-05-24', team:'T6',  category:'습관화',     location:'AGV 콜버튼 구역',   title:'대기시간 개선 수평전개', issue:'AGV CALL BUTTON 활용 미흡 팀 존재', action:'우수사례 표준화 자료 작성 및 수평전개', status:'draft',      before:false,after:false, std:true},
  {id:'IMP-2026-0212', date:'2026-05-19', team:'T7',  category:'정돈',       location:'엔진후드 권상구역', title:'권상지그 보관 표준화', issue:'엔진후드 권상 지그 보관위치 미표준', action:'전용 보관대 및 라벨 적용', status:'close',      before:true, after:true,  std:true},
  {id:'IMP-2026-0205', date:'2026-05-12', team:'T8',  category:'정리',       location:'중형 하부 라인',    title:'재공 라인 정리', issue:'중형 하부 라인 재공 과다로 통로 침범', action:'재공 축소 및 라인마킹 재정비', status:'close',      before:true, after:true,  std:false},
  {id:'IMP-2026-0198', date:'2026-05-06', team:'T9',  category:'청소',       location:'ARM SUB1 공정',    title:'품질 이물질 청소', issue:'ARM SUB1 공정 이물질 혼입 우려', action:'공정 청소주기 단축 및 표준화', status:'close',      before:true, after:true,  std:false},
  {id:'IMP-2026-0161', date:'2026-04-28', team:'T10', category:'시각화관리', location:'MCV 조립 라인',    title:'이동동선 표시', issue:'MCV 고압호스 조립 이동동선 표시 미흡', action:'바닥 동선 라인마킹 적용', status:'verify',     before:false,after:false, std:false},
  {id:'IMP-2026-0154', date:'2026-04-20', team:'T11', category:'자주보전',   location:'드라이브샤프트 권상구역', title:'권상지그 점검관리', issue:'대형모델 권상지그 점검표 미작성', action:'점검표 서명관리 및 게시', status:'close',      before:true, after:true,  std:true},
  {id:'IMP-2026-0140', date:'2026-04-13', team:'T12', category:'습관화',     location:'엑슬 보호커버 회수구역', title:'AGV 활동 표준화', issue:'엑슬 보호커버 수동 회수로 반복 재발생', action:'전용 소형 AGV 표준화 및 타 팀 전개', status:'inprogress', before:true, after:false, std:true},
  {id:'IMP-2026-0231', date:'2026-06-02', team:'T13', category:'정돈',       location:'CWT 램프 조정구역', title:'조정지그 정돈', issue:'CWT 램프 갭 조정지그 보관 미표준', action:'조정지그 전용 거치대 도입', status:'registered', before:false,after:false, std:false},
  {id:'IMP-2026-0225', date:'2026-06-11', team:'T14', category:'청소',       location:'병행생산 CWT 구역', title:'데미지 저감 청소관리', issue:'병행생산 CWT 작업 시 데미지 발생', action:'작업 전후 점검·청소 체크리스트 도입', status:'inprogress', before:true, after:false, std:false},
  {id:'IMP-2026-0219', date:'2026-06-17', team:'T15', category:'자주보전',   location:'주행 측정설비',    title:'설비 우천 대응 보전', issue:'주행 측정설비 우천시 작동불량 반복', action:'설비 방수 커버 및 점검주기 재설정', status:'done',       before:true, after:false, std:false},
  {id:'IMP-2026-0210', date:'2026-04-06', team:'T16', category:'정리',       location:'작동유 드레인 구역', title:'드레인 지그 정리', issue:'작동유 드레인 지그 주변 유출물 정리 미흡', action:'드레인 지그 개선 및 받이 정비', status:'registered', before:true, after:false, std:false},
];

const STATUS_LABEL = {draft:'Draft', registered:'요청등록', inprogress:'생산팀 조치중', done:'조치완료', verify:'5S모듈 검증', close:'Close'};

/* ---------- 유틸 ---------- */
const teamById = id => TEAMS.find(t=>t.id===id);
const monthIndex = m => MONTHS.indexOf(m);
const prevMonth = m => MONTHS[Math.max(0, monthIndex(m)-1)];
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
// 팀 Audit 점수가 낮을수록 두 확률 모두 높게 산출 — Audit 결과와 반복지적 경향을 연결 (팀 수와 무관하게 동작)
function repeatParamsFor(team){
  const t = Math.max(0, Math.min(1, (97 - team.auditScore) / 21));
  return { newProb: 0.15 + t*0.35, persist: 0.18 + t*0.32 };
}
function issueSeries(teamId, cat){
  const params = repeatParamsFor(teamById(teamId));
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
function repeatState(rate, hasData){
  if(!hasData) return 'g';
  if(rate>=30) return 'r';
  if(rate>=15) return 'a';
  return 'g';
}
function renderAndon(){
  const { teamStats } = computeRepeatStats();
  const byTeam = {};
  teamStats.forEach(s=>{ byTeam[s.team] = s; });
  document.getElementById('andonStrip').innerHTML = TEAMS.map(t=>{
    const s = byTeam[t.id] || {rate:0, total:0};
    const state = repeatState(s.rate, s.total>0);
    return `<div class="andon-cell ${state}">
      <span class="andon-team">${t.name}</span>
      <strong class="andon-score mono">${s.total ? s.rate.toFixed(1)+'%' : '–'}</strong>
      <span class="andon-tag">${state==='g'?'정상':state==='a'?'주의':'즉시조치'}</span>
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
  document.getElementById('repeatTop5Body').innerHTML = teamStats.slice(0,5).map((r,i)=>{
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

/* ---- 부서별 추이: 스파크라인 행 (8개 부서 × 6개월) ---- */
function deptTeams(dept){ return TEAMS.filter(t=>t.site===dept); }
function renderDeptTrendRows(wrapId, valueFn, unitFmt){
  document.getElementById(wrapId).innerHTML = DEPTS.map(d=>{
    const vals = MONTHS.map(m=>valueFn(d,m));
    const max = Math.max(...vals, 0.001);
    const bars = vals.map((v,i)=>{
      const h = Math.max(6, v/max*54);
      const cur = i===MONTHS.length-1 ? ' cur' : '';
      return `<div class="spark-bar${cur}" style="height:${h}px" title="${d} · ${MONTH_LABEL[MONTHS[i]]} · ${unitFmt(v)}"></div>`;
    }).join('');
    return `<div class="trend-row">
      <span class="trend-name">${d}</span>
      <div class="trend-spark">${bars}</div>
      <span class="trend-cur mono">${unitFmt(vals[vals.length-1])}</span>
    </div>`;
  }).join('');
}
function deptStdPerCapita(dept, m){
  const members = deptTeams(dept);
  const sum = members.reduce((a,t)=>a+stdPerCapita(t,m)*t.headcount,0);
  const hc = members.reduce((a,t)=>a+t.headcount,0);
  return hc? sum/hc : 0;
}
function deptAuditAvg(dept, m){
  const members = deptTeams(dept);
  const mi = monthIndex(m);
  const sum = members.reduce((a,t)=>a+AUDIT_MONTHLY[t.id][mi],0);
  return members.length? sum/members.length : 0;
}
function renderStdTrendChart(){
  renderDeptTrendRows('stdChartWrap', deptStdPerCapita, v=>v.toFixed(2));
}
function renderAuditTrendChart(){
  renderDeptTrendRows('auditChartWrap', deptAuditAvg, v=>v.toFixed(1));
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
  document.getElementById('detailTableBody').innerHTML = REQUESTS.slice(0,20).map(r=>{
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
  }).slice(0,20);
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
  renderWeakestByCategory(month);
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
function auditCategoryScore(team, cat, month){
  const seed = hash(team.id+cat+month);
  const delta = (seed % 9) - 4;
  return Math.max(60, Math.min(100, Math.round(team.auditScore + delta)));
}
function auditDetailFor(team, month){
  return CATEGORIES.map((c)=>{
    const seed = hash(team.id+c+month);
    const score = auditCategoryScore(team, c, month);
    const key = team.id+'_'+month+'_'+c;
    if(!(key in AUDIT_CHECK)) AUDIT_CHECK[key] = (seed % 3) !== 0;
    const tpl = AUDIT_TEMPLATES[c];
    const std = STANDARDS.find(s=>s.category===c);
    return {key, category:c, standard: std ? std.q : `${c} 점검항목`, score, prev:tpl.prev, note:tpl.note, issue:tpl.issue};
  });
}

// 5S 유형별 최취약 작업장 — 유형(카테고리)마다 점수가 가장 낮은 팀을 찾음
function computeWeakestByCategory(month){
  return CATEGORIES.map(cat=>{
    let worst = null;
    TEAMS.forEach(t=>{
      const score = auditCategoryScore(t, cat, month);
      if(!worst || score < worst.score) worst = {team:t, score};
    });
    return {category:cat, team:worst.team, score:worst.score};
  });
}
function renderWeakestByCategory(month){
  const rows = computeWeakestByCategory(month);
  document.getElementById('weakestByCategory').innerHTML = rows.map(r=>{
    const s = andonState(r.score);
    return `<div class="andon-cell ${s}">
      <span class="andon-team">${r.category}</span>
      <strong class="andon-score mono">${r.score}</strong>
      <span class="andon-tag">${r.team.name} · ${r.team.site}</span>
    </div>`;
  }).join('');
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
   신규 확장화면 — 5S 고도화 활동사례 현황 (당월/누적)
   "5S 개선표준화(수평전개)" 플래그(std)가 켜져 있고, 조치완료 이상(done/verify/close)으로
   확정된 개선요청을 "확보된 5S 고도화 사례"로 정의합니다.
   ========================================================= */
function securedCases(){
  return REQUESTS.filter(r => r.std && ['done','verify','close'].includes(r.status));
}
function renderCaseFilters(){
  document.getElementById('caseFilterMonth').innerHTML = MONTHS.map(m=>`<option value="${m}" ${m===MONTHS[MONTHS.length-1]?'selected':''}>${m.slice(0,4)}년 ${MONTH_LABEL[m]}</option>`).join('');
  document.getElementById('caseFilterSite').innerHTML = '<option value="all">전체</option>' + DEPTS.map(d=>`<option>${d}</option>`).join('');
}
function renderCaseKPIs(month){
  const cases = securedCases();
  const mi = monthIndex(month);
  const monthCases = cases.filter(c=>c.date.slice(0,7)===month);
  const cumCases = cases.filter(c=>monthIndex(c.date.slice(0,7))<=mi);
  const monthTeams = new Set(monthCases.map(c=>c.team));
  const cumTeams = new Set(cumCases.map(c=>c.team));
  document.getElementById('kpiCaseMonthCnt').textContent = monthCases.length;
  document.getElementById('kpiCaseCumCnt').textContent = cumCases.length;
  document.getElementById('kpiCaseCumCnt').nextElementSibling.textContent = `건 · 01월~${MONTH_LABEL[month]}`;
  document.getElementById('kpiCaseMonthRate').textContent = `${(monthTeams.size/TEAMS.length*100).toFixed(1)}%`;
  document.getElementById('kpiCaseMonthRateSub').textContent = `전체 ${TEAMS.length}개 팀 중 ${monthTeams.size}개 팀`;
  document.getElementById('kpiCaseCumRate').textContent = `${(cumTeams.size/TEAMS.length*100).toFixed(1)}%`;
  document.getElementById('kpiCaseCumRateSub').textContent = `전체 ${TEAMS.length}개 팀 중 ${cumTeams.size}개 팀`;
}
function renderCaseTrendChart(){
  const cases = securedCases();
  const monthCounts = MONTHS.map(m=>cases.filter(c=>c.date.slice(0,7)===m).length);
  let running = 0;
  const cum = monthCounts.map(v=>{ running+=v; return running; });
  const max = Math.max(...monthCounts, 1) * 1.3;
  document.getElementById('caseTrendChart').innerHTML = MONTHS.map((m,i)=>`
    <div class="rate-col">
      <span class="rate-val mono">${monthCounts[i]}</span>
      <div class="rate-bar case" style="height:${Math.max(6, monthCounts[i]/max*150)}px" title="${MONTH_LABEL[m]} 신규 ${monthCounts[i]}건 · 누적 ${cum[i]}건"></div>
      <span class="rate-name">${MONTH_LABEL[m]}<br><span class="case-cum-label mono">누적 ${cum[i]}</span></span>
    </div>`).join('');
}
function renderCaseTeamTable(month, siteFilter){
  const cases = securedCases();
  const mi = monthIndex(month);
  const rows = TEAMS.filter(t=>siteFilter==='all' || t.site===siteFilter).map(t=>{
    const teamCumCases = cases.filter(c=>c.team===t.id && monthIndex(c.date.slice(0,7))<=mi).sort((a,b)=>a.date<b.date?1:-1);
    const hasMonth = teamCumCases.some(c=>c.date.slice(0,7)===month);
    const latest = teamCumCases[0];
    return `<tr>
      <td>${t.site}</td>
      <td><b>${t.name}</b></td>
      <td><span class="status ${hasMonth?'done':'open'}">${hasMonth?'확보':'미확보'}</span></td>
      <td class="mono">${teamCumCases.length}</td>
      <td>${latest ? (latest.title||latest.category) : '—'}</td>
      <td class="mono">${latest ? latest.date : '—'}</td>
    </tr>`;
  }).join('');
  document.getElementById('caseTeamBody').innerHTML = rows || `<tr><td colspan="6" class="muted">해당 작업장에 확보된 사례가 없습니다.</td></tr>`;
}
function renderCaseList(siteFilter){
  const cases = securedCases()
    .filter(c=>siteFilter==='all' || teamById(c.team).site===siteFilter)
    .sort((a,b)=> a.date<b.date?1:-1);
  document.getElementById('caseListBody').innerHTML = cases.map(c=>{
    const team = teamById(c.team);
    return `<tr>
      <td class="mono">${c.id}</td>
      <td>${team.site}</td>
      <td>${team.name}</td>
      <td>${c.title||c.category}</td>
      <td class="mono">${c.date.slice(5,7)}월</td>
      <td class="mono">${c.date}</td>
    </tr>`;
  }).join('') || `<tr><td colspan="6" class="muted">조건에 해당하는 확보 사례가 없습니다.</td></tr>`;
}
function renderCaseView(){
  const month = document.getElementById('caseFilterMonth').value || MONTHS[MONTHS.length-1];
  const site = document.getElementById('caseFilterSite').value || 'all';
  renderCaseKPIs(month);
  renderCaseTrendChart();
  renderCaseTeamTable(month, site);
  renderCaseList(site);
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

document.getElementById('execDetailToggle').addEventListener('click', e=>{
  const b = e.target.closest('.chip'); if(!b) return;
  document.querySelectorAll('#execDetailToggle .chip').forEach(c=>c.classList.remove('active'));
  b.classList.add('active');
  const showRegister = b.dataset.tab==='register';
  document.getElementById('execRegisterWrap').style.display = showRegister ? '' : 'none';
  document.getElementById('execDetailWrap').style.display = showRegister ? 'none' : '';
  document.getElementById('execDetailTitle').textContent = showRegister ? '5S 부서별 등록현황' : '5S 상세내역';
  document.getElementById('execDetailSub').innerHTML = showRegister
    ? `조회기간 <span class="mono" id="regRangeLabel">${MONTHS[0]} ~ ${MONTHS[MONTHS.length-1]}</span> 누계`
    : '개선번호별 원시 데이터 · HDPS21 등록 이력';
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

document.getElementById('caseFilterApply').addEventListener('click', renderCaseView);
document.getElementById('caseFilterMonth').addEventListener('change', renderCaseView);
document.getElementById('caseFilterSite').addEventListener('change', renderCaseView);

function init(){
  document.getElementById('scopePeriod').innerHTML = MONTHS.map(m=>`<option value="${m}" ${m===MONTHS[MONTHS.length-1]?'selected':''}>${m.slice(0,4)}년 ${MONTH_LABEL[m]}</option>`).join('');
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
  renderCaseFilters();
  renderCaseView();
}
init();
