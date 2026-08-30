(()=>{'use strict';
/* HD-20 demo data seed (2026-08-28).
 * Per explicit user instruction, this populates the canonical stores with
 * realistic sample data so every screen/tab has something to show instead
 * of blank "—" placeholders.
 *
 * Safety rules, so this can never silently corrupt or hide real data:
 *  - Runs ONLY if the target key is completely absent or an empty array.
 *    Any existing real data (even a single row) is left untouched.
 *  - Sets window.HD20_DEMO_DATA_ACTIVE = true and stamps
 *    localStorage['hd20DemoDataSeedV1']='1' whenever seed data is present,
 *    so the UI can show a visible "샘플 데이터" badge — this is sample
 *    data, and nothing here pretends otherwise.
 *  - Does not touch action-demo-seed.js's explicit disable flag for its
 *    own separate legacy seeding mechanism; this is a distinct, opt-in-by-
 *    absence mechanism scoped to the three canonical stores below.
 */
const TEAMS=['대형메인팀','휠로더Front팀','대형Att.팀','휠로더리어팀','중형상부1팀','중형메인팀','중형Att팀','대형상부팀','프레임제작팀','휠로더메인팀','중형상부2팀','중형하부팀','Boom제작팀','초대형조립팀','성능팀','트러블슈팅팀'];
const CATS=['정리','정돈','청소','시각화','위험구역관리','5S 고도화'];
const WORKPLACE_SUFFIX=['Main Line','Sub Line','Frame구역','조립라인','검사구역','Att. Line'];
const PROBLEMS=['공구 정위치 미준수','통로 적치물 발생','라벨 훼손','정량기준 초과','안전동선 침범','형적판 훼손'];
const LEADER_NAMES=['김현대','박기장','이선임','최반장','정책임','강대리','윤과장','오주임'];

function seedRand(seed){let s=seed;return()=>{s=(s*9301+49297)%233280;return s/233280}}
const rnd=seedRand(20260828);
const pick=arr=>arr[Math.floor(rnd()*arr.length)];
function dateStr(daysAgo){const d=new Date();d.setDate(d.getDate()-daysAgo);return d.toISOString().slice(0,10)}
function isEmpty(key){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v===null||(Array.isArray(v)&&v.length===0)}catch{return true}}
function leadersAreBlank(v){return !Array.isArray(v)||!v.length||v.every(x=>!x||(x.leader==='미지정'&&!x.email))}

function buildActivityRows(){
  const JUDGE=['확정','확정','확정','보완요청','미확정','판정대기'];
  const rows=[];
  for(let i=0;i<120;i++){
    const team=pick(TEAMS),type=pick(CATS);
    const regDaysAgo=1+Math.floor(rnd()*150);
    const date=dateStr(regDaysAgo);
    const judgeState=pick(JUDGE);
    const isCandidate=judgeState!=='판정대기'?true:rnd()>0.4;
    const confirmed=judgeState==='확정';
    const judgeLagDays=(confirmed||judgeState==='보완요청'||judgeState==='미확정')?3+Math.floor(rnd()*30):null;
    const judgedAt=judgeLagDays!=null?dateStr(Math.max(0,regDaysAgo-judgeLagDays)):null;
    const level=confirmed?1+Math.floor(rnd()*5):null;
    const sixResults=['적합','유지','부적합','완료'];
    const audit6Result=confirmed&&rnd()>0.3?pick(sixResults):null;
    const maintainStates=['유지','유지','유지','조건부','중지'];
    rows.push({
      id:'DEMO-ACT-'+(1000+i),
      team,type,
      workplace:team+' '+pick(WORKPLACE_SUFFIX),
      title:type+' 개선활동',
      problem:pick(PROBLEMS),
      improvement:type+' 기준 재정비 및 현장 적용',
      date,regDate:date,createdAt:date+'T09:00:00.000Z',
      candidate:isCandidate,isCandidate,
      judgeState,confirmed,
      judgedAt:judgedAt?judgedAt+'T09:00:00.000Z':null,
      judgeOwner:(confirmed||judgeState==='보완요청')?'생산혁신팀 메인 담당자':null,
      judgeReason:confirmed?'3대 판정기준 충족 확인':null,
      level,maturityLevel:level,
      maintainState:confirmed?pick(maintainStates):null,
      auditState:confirmed?pick(maintainStates):null,
      audit6Result,
      valid:confirmed?rnd()>0.15:null,
      status:judgeState,
      source:'demo-seed'
    });
  }
  return rows;
}

function buildTeamLeaders(){
  return TEAMS.map((team,i)=>({team,leader:LEADER_NAMES[i%LEADER_NAMES.length]+String(i+1),email:`leader${i+1}@hd-hyundai-demo.co.kr`}));
}

function buildActionCases(leaders){
  const out=[];
  for(let i=0;i<26;i++){
    const team=pick(TEAMS);
    const regDaysAgo=Math.floor(rnd()*65);
    const startDate=dateStr(regDaysAgo);
    const dueDaysAfter=7+Math.floor(rnd()*35);
    const due=dateStr(regDaysAgo-dueDaysAfter);
    const done=rnd()>0.35;
    const doneDate=done?dateStr(Math.max(0,regDaysAgo-dueDaysAfter+Math.floor(rnd()*6-2))):null;
    const leader=leaders.find(t=>t.team===team);
    out.push({
      id:'DEMO-IMP-'+(2000+i),
      date:startDate,startDate,team,
      workplace:team+' '+pick(WORKPLACE_SUFFIX),
      leader:leader?.leader||'미지정',
      email:leader?.email||'',
      problem:pick(PROBLEMS),
      due,targetDate:due,
      status:done?'완료':pick(['조치대기','진행']),
      doneDate,completedDate:doneDate,
      doneStatus:done?'완료':null,
      actionText:done?'현장 확인 후 기준 재정비 및 재발방지 조치 완료':null,
      recurrence:rnd()>0.85?'예':'아니오',
      created:startDate+'T09:00:00.000Z',
      source:'demo-seed'
    });
  }
  return out;
}

function badge(){
  if(document.getElementById('hd20DemoBadge'))return;
  const s=document.createElement('style');
  s.id='hd20DemoBadgeStyle';
  s.textContent=`#hd20DemoBadge{position:sticky;top:0;z-index:99998;display:flex;align-items:center;justify-content:center;gap:6px;background:#8a5a00;color:#fff;font:800 11px Arial;padding:6px 10px}`;
  document.head.appendChild(s);
  const b=document.createElement('div');
  b.id='hd20DemoBadge';
  b.textContent='⚠ 샘플 데이터 표시 중 (실운영 데이터 아님)';
  document.body.insertAdjacentElement('afterbegin',b);
}

function run(){
  const ACT_KEY='hd20GMES5SAutoImproveRawV1',LEAD_KEY='hd20TeamLeaderMasterV1',ACTION_KEY='hd20ActionCasesV2';
  let seeded=false;
  let leaders;
  try{leaders=JSON.parse(localStorage.getItem(LEAD_KEY)||'null')}catch{leaders=null}
  if(isEmpty(LEAD_KEY)||leadersAreBlank(leaders)){leaders=buildTeamLeaders();localStorage.setItem(LEAD_KEY,JSON.stringify(leaders));seeded=true}
  if(isEmpty(ACT_KEY)){localStorage.setItem(ACT_KEY,JSON.stringify(buildActivityRows()));seeded=true}
  if(isEmpty(ACTION_KEY)){localStorage.setItem(ACTION_KEY,JSON.stringify(buildActionCases(leaders||buildTeamLeaders())));seeded=true}
  if(seeded||localStorage.getItem('hd20DemoDataSeedV1')==='1'){
    localStorage.setItem('hd20DemoDataSeedV1','1');
    window.HD20_DEMO_DATA_ACTIVE=true;
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',badge,{once:true});else badge();
    if(seeded)window.dispatchEvent(new CustomEvent('hd20-gmes-5s-imported',{detail:{source:'demo-seed'}}));
  }
}
run();
})();
