/*
 * HD-20 웹 검증 픽스처 v6 (drop-in: web-validation-fixture.js 교체용)
 *
 * 사용법 (URL 파라미터)
 *   ?validation=1                 검증 데이터 모드 (기본: 활동 960 / Audit 320 / Action 640)
 *   ?validation=1&scale=3         물량 ×3 (최대 5, 로컬스토리지 용량 초과 시 배너에 오류 표시)
 *   ?validation=1&edge=1          위 데이터 + 오류/경계 케이스 (XSS, 잘못된 날짜, 중복 ID, 미등록 팀 등)
 *   ?validation=reset             원본 데이터 복구 후 일반 모드로 이동
 *
 * 안전장치
 *   - 검증 모드에서는 Supabase 동기화가 꺼져 있음 (supabase-sync.js 의 isolation).
 *   - 시드 직전에 원본 localStorage 값을 백업한다. 일반 접속에서는 자동 복구하지 않고 fixture 행만 정리한다.
 *   - 원본 복구는 richer-backup 검증과 복구 전 safety backup을 거친 명시적 복구만 허용한다.
 *   - 모든 행은 source='web-validation-fixture' + id 접두사 VALID- 로 표시됨.
 *   - 팀장 마스터(이메일)는 건드리지 않음.
 */
(()=>{'use strict';
const V=11,SRC='web-validation-fixture';
const P=new URL(location.href).searchParams;
const MODE=P.get('validation'),EDGE=P.get('edge')==='1';
const SCALE=Math.min(5,Math.max(1,parseInt(P.get('scale')||'1',10)||1));
const K={a:'hd20GMES5SAutoImproveRawV1',u:'hd20AuditRandomDrawsV1',x:'hd20ActionCasesV2',t:'gmes5s_quarter_perperson_targets'};
const META='hd20ValidationFixtureMetaV2',BACKUP='hd20ValidationBackupV1';
const ls=localStorage;
const ROW_KEYS=[K.a,K.u,K.x];
function parseRecoveryRows(v){try{const x=typeof v==='string'?JSON.parse(v):v;return Array.isArray(x)?x:[]}catch{return[]}}
function recoveryKind(row){const id=String(row?.id||''),src=String(row?.source||'');if(src==='web-validation-fixture'||id.startsWith('VALID-'))return'fixture';if(src==='demo-seed'||id.startsWith('DEMO-'))return'demo';return'production'}
function recoverySummary(v){const rows=parseRecoveryRows(v),out={total:rows.length,production:0,fixture:0,demo:0};rows.forEach(r=>out[recoveryKind(r)]++);return out}
function recoveryStatus(){
  let backup=null;try{backup=JSON.parse(ls.getItem(BACKUP)||'null')}catch{}
  const current={},saved={};ROW_KEYS.forEach(k=>{current[k]=recoverySummary(ls.getItem(k));saved[k]=recoverySummary(backup?.values?.[k])});
  const totals=(x)=>Object.values(x||{}).reduce((a,n)=>({total:a.total+(n.total||0),production:a.production+(n.production||0),fixture:a.fixture+(n.fixture||0),demo:a.demo+(n.demo||0)}),{total:0,production:0,fixture:0,demo:0});
  const activityRows=parseRecoveryRows(ls.getItem(K.a));
  const activityExcel=activityRows.filter(r=>recoveryKind(r)==='production'&&String(r?.source||'')==='excel-import'&&String(r?.id||'').startsWith('IMP-')).length;
  return{hasBackup:!!backup?.values,backupAt:backup?.at||'',current,saved,currentTotals:totals(current),savedTotals:totals(saved),currentExcelImport:activityExcel};
}
function recoverFromBackup(){
  let b=null;try{b=JSON.parse(ls.getItem(BACKUP)||'null')}catch{}
  if(!b?.values)return{ok:false,reason:'backup-missing'};
  const savedProd=ROW_KEYS.reduce((n,k)=>n+recoverySummary(b.values[k]).production,0),currentProd=ROW_KEYS.reduce((n,k)=>n+recoverySummary(ls.getItem(k)).production,0);
  if(savedProd===0)return{ok:false,reason:'backup-has-no-production-data',savedProd,currentProd};
  if(savedProd<=currentProd)return{ok:false,reason:'backup-not-richer-production',savedProd,currentProd};
  const safetyKey='hd20PreRecoverySafetyBackupV1';
  if(!ls.getItem(safetyKey)){const values={};Object.values(K).forEach(k=>values[k]=ls.getItem(k));ls.setItem(safetyKey,JSON.stringify({at:new Date().toISOString(),values}))}
  ROW_KEYS.forEach(k=>{const rows=parseRecoveryRows(b.values[k]).filter(r=>recoveryKind(r)==='production');if(rows.length)ls.setItem(k,JSON.stringify(rows));else ls.removeItem(k)});
  if(b.values[K.t]!==undefined){const v=b.values[K.t];v===null?ls.removeItem(K.t):ls.setItem(K.t,v)}
  ls.setItem('hd20DataRecoveryMetaV1',JSON.stringify({at:new Date().toISOString(),source:BACKUP,savedProduction:savedProd,currentProduction:currentProd,nonProductionExcluded:true}));
  return{ok:true,savedProduction:savedProd,currentProduction:currentProd,safetyKey};
}
function exportRecoveryEvidence(){
  const s=recoveryStatus(),keys=[...ROW_KEYS,K.t,BACKUP,'hd20PreRecoverySafetyBackupV1','hd20DataRecoveryMetaV1'],values={};
  keys.forEach(k=>values[k]=ls.getItem(k));
  const payload={exportedAt:new Date().toISOString(),page:location.origin+location.pathname,status:{backup:s.hasBackup,backupAt:s.backupAt,current:s.current,saved:s.saved,currentTotals:s.currentTotals,savedTotals:s.savedTotals,currentExcelImport:s.currentExcelImport},values};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download='HD20_recovery_evidence_'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  return payload.status;
}
window.HD20_DATA_RECOVERY={status:recoveryStatus,backupKey:BACKUP,recover:recoverFromBackup,exportEvidence:exportRecoveryEvidence,diagnose:()=>{const s=recoveryStatus();return{backup:s.hasBackup,backupAt:s.backupAt,currentProduction:s.currentTotals?.production||0,savedProduction:s.savedTotals?.production||0,currentExcelImport:s.currentExcelImport||0,current:s.current,saved:s.saved}}};
function installRecoveryNotice(){
  if(window.HD20_DEFAULT_FIXTURE_FALLBACK===true)return;
  const s=recoveryStatus(),cur=Object.values(s.current||{}).reduce((a,n)=>a+(n.production||0),0),saved=Object.values(s.saved||{}).reduce((a,n)=>a+(n.production||0),0);
  if(cur!==0)return;
  const top=document.querySelector('.top'),app=document.querySelector('.app')||document.body;if(!app||document.getElementById('hd20DataRecoveryNotice'))return;const host=document.createElement('div');host.id='hd20DataRecoveryNoticeHost';host.style.cssText='display:block;width:100%;box-sizing:border-box;margin:0';const nav=document.querySelector('.beginnerNav');if(nav&&nav.parentNode)nav.insertAdjacentElement('afterend',host);else if(top&&top.parentNode)top.insertAdjacentElement('afterend',host);else app.prepend(host);
  const box=document.createElement('div');box.id='hd20DataRecoveryNotice';box.setAttribute('role','alert');
  box.style.cssText='width:100%;box-sizing:border-box;min-height:30px;padding:5px 12px;border:0;border-top:1px solid #d9a441;background:#fff8e8;font-size:11px;line-height:18px;display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:nowrap';
  const msg=document.createElement('span');const at=s.backupAt?new Date(s.backupAt).toLocaleString():'없음';const excel=s.currentExcelImport||0;const savedA=s.saved?.[K.a]?.production||0,savedU=s.saved?.[K.u]?.production||0,savedX=s.saved?.[K.x]?.production||0;msg.textContent=saved>0?'데이터 복구 진단 · 현재 실운영 '+cur+'건 · 보존 원본 '+saved+'건 (Activity '+savedA+' / Audit '+savedU+' / Action '+savedX+') · 현재 Excel Import 원본 '+excel+'건 · 백업시각 '+at:'데이터 복구 진단 · 현재 실운영 '+cur+'건 · 보존 원본 0건 · 현재 Excel Import 원본 '+excel+'건 · 이 브라우저에는 복구 가능한 보존 원본이 확인되지 않습니다.';
  const actions=document.createElement('span');actions.style.cssText='display:flex;gap:6px;white-space:nowrap';
  const exp=document.createElement('button');exp.type='button';exp.textContent='복구 증거 Export';exp.style.cssText='padding:3px 8px;font-size:11px;font-weight:700;white-space:nowrap';exp.addEventListener('click',exportRecoveryEvidence);
  const btn=document.createElement('button');btn.type='button';btn.textContent=saved>cur?'원본 백업 복구':'복구 원본 없음';btn.disabled=!(saved>cur);btn.style.cssText='padding:3px 8px;font-size:11px;font-weight:700;white-space:nowrap';
  btn.addEventListener('click',()=>{if(!confirm('먼저 복구 증거 Export를 보관했는지 확인하십시오. 현재 상태를 안전 백업한 뒤 보존된 원본 데이터를 복구하시겠습니까?'))return;const r=recoverFromBackup();if(!r.ok){alert('복구 조건을 충족하지 못했습니다: '+r.reason);return}location.reload()});
  actions.append(exp,btn);box.append(msg,actions);host.appendChild(box);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installRecoveryNotice,{once:true});else installRecoveryNotice();

/* ---------- 백업 / 복구 ---------- */
function strip(k,raw){
  if(raw===null||!ROW_KEYS.includes(k))return raw;
  try{const v=JSON.parse(raw);if(!Array.isArray(v))return raw;const f=v.filter(x=>x?.source!==SRC);return f.length?JSON.stringify(f):null}catch{return raw}
}
function backup(){
  if(ls.getItem(BACKUP))return;
  const values={};Object.values(K).forEach(k=>{values[k]=strip(k,ls.getItem(k))});
  ls.setItem(BACKUP,JSON.stringify({at:new Date().toISOString(),values}));
}
function restore(){
  let b=null;try{b=JSON.parse(ls.getItem(BACKUP)||'null')}catch{}
  if(b&&b.values){Object.keys(b.values).forEach(k=>{const v=b.values[k];v===null?ls.removeItem(k):ls.setItem(k,v)})}
  else{ROW_KEYS.forEach(k=>{const s=strip(k,ls.getItem(k));s===null?ls.removeItem(k):ls.setItem(k,s)});ls.removeItem(K.t)}
  ls.removeItem(BACKUP);ls.removeItem(META);
}
function cleanUrl(extra){const u=new URL(location.href);['validation','edge','scale'].forEach(p=>u.searchParams.delete(p));Object.entries(extra||{}).forEach(([k,v])=>u.searchParams.set(k,v));return u.toString()}

if(MODE==='reset'){try{restore()}catch(e){console.error('[validation-fixture] restore failed',e)}location.replace(cleanUrl({validation:'0'}));return}
/* Production-safe default fallback:
   - ?validation=1: explicit fixture mode.
   - ?validation=0/off: fixture disabled.
   - no parameter: real production rows win. If a richer production backup exists, keep recovery path visible.
     Only when both current production and saved production are 0 do we seed the team-master fixture so an empty site is testable. */
const bootRecovery=recoveryStatus();
/* Validation fixture is explicit-only. Normal empty deployments are seeded by development-demo-mode.js from the canonical team master. */
const DEFAULT_FALLBACK=false;
const ACTIVE=MODE==='1';
window.HD20_DEFAULT_FIXTURE_FALLBACK=DEFAULT_FALLBACK;
if(!ACTIVE){try{
  /* Production safety: 일반 접속에서는 fixture 행만 제거한다.
     과거 BACKUP을 현재 정상 데이터 위에 자동 덮어쓰지 않는다. 명시적 validation=reset에서만 backup restore 허용. */
  ROW_KEYS.forEach(k=>{const raw=ls.getItem(k);if(raw===null)return;const clean=strip(k,raw);if(clean===null)ls.removeItem(k);else if(clean!==raw)ls.setItem(k,clean)});
  ls.removeItem(META);
}catch(e){console.error('[validation-fixture] production cleanup failed',e)}return}

window.HD20_VALIDATION_MODE=true;window.HD20_VALIDATION_ISOLATED=true;

/* ---------- 도우미 ---------- */
/* app.js 팀 마스터(표시 순서 + 소속)와 동일하게 유지할 것 */
const TEAM_DEFS=[['대형Att.팀','조립1팀'],['대형메인팀','조립1팀'],['대형상부팀','조립1팀'],['프레임제작팀','조립2팀'],['Boom제작팀','조립2팀'],['중형상부1팀','조립1팀'],['중형상부2팀','조립1팀'],['중형하부팀','조립1팀'],['중형Att팀','조립1팀'],['중형메인팀','조립1팀'],['휠로더Front팀','조립2팀'],['휠로더리어팀','조립2팀'],['휠로더메인팀','조립2팀'],['초대형조립팀','조립2팀'],['성능팀','조립1팀'],['트러블슈팅팀','조립1팀']];
const TEAMS=TEAM_DEFS.map(d=>d[0]),GROUP=new Map(TEAM_DEFS);
const TYPES=['정리','정돈','청소','시각화','위험구역관리'];
const AREAS=['A라인','B라인','자재창고','공구실','검사대','도장부스','용접구역','조립1구역','조립2구역','물류통로','포장구역','정비실'];
const PROB=['공구 위치 불명확','바닥 오일 누유','통로 적치물','라벨 미부착','불필요 자재 방치','조명 불량','작업대 정리 미흡','폐기물 분리 불량','안전 표지 훼손','재고 수량 불일치'];
const IMP=['형적관리 도입','섀도우보드 설치','정위치 표기','Green Zone 표시','불용품 폐기','수량 정량화','바닥 마킹','보관함 재배치','시각화 보드 설치','동선 재배치'];
const CRIT=['시각화·형적관리','인간공학적 Green Zone','정량축소·정위치 변경을 통한 공간 활용'];
const LINES=['A라인','B라인','C라인'];
const NAMES=['김민수','이서준','박지훈','최유진','정하늘','강도현','조수빈','윤재원','한지우','오세린'];
const IMG='?auto=format&fit=crop&w=400&q=60';
const PHOTOS=['https://images.unsplash.com/photo-1565793298595-6a879b1d9492','https://images.unsplash.com/photo-1581092160562-40aa08e78837','https://images.unsplash.com/photo-1581092918056-0c4c3acd3789'].map(u=>u+IMG);
const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'});
const TODAY=fmt.format(new Date()),Y=+TODAY.slice(0,4);
const dayNum=s=>{const[y,m,d]=s.split('-').map(Number);return Date.UTC(y,m-1,d)/86400000};
const fromDay=n=>new Date(n*86400000).toISOString().slice(0,10);
const T0=dayNum(TODAY),Y0=dayNum(`${Y}-01-01`);
function addMonths(s,n){const[y,m,d]=s.split('-').map(Number),t=y*12+(m-1)+n,ny=Math.floor(t/12),nm=t%12+1,last=new Date(Date.UTC(ny,nm,0)).getUTCDate();return`${ny}-${String(nm).padStart(2,'0')}-${String(Math.min(d,last)).padStart(2,'0')}`}
function rng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
const R=rng(20260921);
const ri=(a,b)=>a+Math.floor(R()*(b-a+1)),pick=a=>a[Math.floor(R()*a.length)],chance=p=>R()<p;
/* 요청출처(5S모듈/생산혁신팀 HDPS파트/리더십) 실제 필드를 현실적 비율로 직접 부여.
   현장 자체 등록(5S모듈)이 다수, Audit을 운영하는 생산혁신팀 HDPS파트가 그다음, 경영진·팀장(리더십)이 소수지만 0은 아니게. */
const pickSource=()=>{const r=R();return r<.55?'5S모듈':r<.85?'생산혁신팀 HDPS파트':'리더십'};
/* 고정 횟수만 난수를 소비하는 셔플 (sort(()=>R()-.5)는 엔진마다 호출 횟수가 달라 재현성이 깨짐) */
const shuffle=arr=>{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const pad=(n,w)=>String(n).padStart(w,'0');
const minDay=(a,b)=>Math.min(a,b);

/* ---------- 활동 (Activity) ---------- */
function makeActivities(){
  const per=60*SCALE,out=[];let seq=0;
  /* 현장 운영 현실 반영: 설비 선진화에 따른 외관상 수준과 실제 5S/OS 실행량을 분리한다. */
  const profile=team=>/^중형/.test(team)?{activity:.58,confirm:.17,loss:.52}:/^(대형|휠로더|초대형)/.test(team)?{activity:1.18,confirm:.34,loss:.27}:/^(프레임|Boom)/.test(team)?{activity:1.30,confirm:.39,loss:.22}:/^(성능|트러블슈팅)/.test(team)?{activity:.48,confirm:.14,loss:.58}:{activity:1,confirm:.30,loss:.32};
  TEAMS.forEach((team,ti)=>{
    const pf=profile(team),teamPer=Math.max(8,Math.round(per*pf.activity));
    for(let j=0;j<teamPer;j++){
      seq++;
      const prev=chance(.08),regDay=prev?dayNum(`${Y-1}-01-01`)+ri(0,364):Y0+ri(0,Math.max(0,T0-Y0)),date=fromDay(regDay);
      const advanced=j%5===4,slot=Math.floor(j/5);
      const row={id:'VALID-A-'+pad(seq,5),date,regDate:date,createdAt:date+'T09:00:00+09:00',team,group:GROUP.get(team),workplace:`${AREAS[j%AREAS.length]} ${1+Math.floor(j/AREAS.length)}`,owner:pick(NAMES),problem:`${pick(PROB)} (검증 ${seq})`,improvement:`${pick(IMP)} (검증 ${seq})`,before:pick(PHOTOS),after:pick(PHOTOS),headcount:20+ti*3,source:SRC};
      if(!advanced){
        row.type=pick(TYPES);row.candidate=false;row.judgeState='';row.status=chance(.75)?'완료':'진행중';
      }else{
        row.type='5S 고도화';
        row.line=pick(LINES);
        {const missBias=/^중형/.test(team)?.72:/^(성능|트러블슈팅)/.test(team)?.80:/^(프레임|Boom)/.test(team)?.30:/^(대형|휠로더|초대형)/.test(team)?.38:.48;const n=R()<.08?0:(R()<missBias?ri(1,2):3);row.criteriaMatched=shuffle(CRIT).slice(0,n);const hit=new Set(row.criteriaMatched);row.criteriaVisual=hit.has(CRIT[0])?'Y':'N';row.criteriaGreen=hit.has(CRIT[1])?'Y':'N';row.criteriaSpace=hit.has(CRIT[2])?'Y':'N'}
        /* 팀마다 초기 3개 고도화 행도 팀별 profile(confirm)을 반영하되 데이터 공백은 피하도록 단계별 deterministic bias만 적용 */
        /* missBias는 확정 전 3조건 준비도에만 사용하고, 확정 Case는 아래에서 3/3으로 고정한다. 확정 후 이탈은 pf.loss만 사용해 두 단계를 독립 유지한다. */
        /* 초기 Case도 일반 Case와 동일한 확률표본을 사용한다. 특정 slot을 강제/보정하면 팀별 공식확정률이 왜곡된다. */
        const r=R();
        const judgedDay=minDay(T0,regDay+ri(1,30));
        if(r<pf.confirm){
          row.criteriaMatched=[...CRIT];row.criteriaVisual='Y';row.criteriaGreen='Y';row.criteriaSpace='Y';Object.assign(row,{candidate:true,isCandidate:true,judgeState:'확정',confirmed:true,status:chance(.1)?'유지관리':'확정',judgedAt:fromDay(judgedDay),confirmedAt:fromDay(judgedDay),level:ri(1,5)});
          const weak=chance(pf.loss);row.maintainState=weak?pick(['미흡','중지']):'정상';row.valid=!weak;
          if(weak){row.attrition=true;row.attritionReason=pick(['3대 요건 유지 미흡','정위치·정량 기준 이탈','Green Zone 유지 미흡','시각화·형적관리 유지 미흡']);row.attritionAt=fromDay(minDay(T0,judgedDay+ri(30,180)))}
          if(chance(.45)){row.horizontalRollout=true;row.rolloutState=pick(['수평전개중','수평전개 완료'])}
        }else{const pendingCut=Math.min(.62,pf.confirm+.24),supplementCut=Math.min(.74,pendingCut+.14),unconfirmedCut=Math.min(.84,supplementCut+.10),closedCut=Math.min(.92,unconfirmedCut+.08);
          if(r<pendingCut)Object.assign(row,{candidate:true,isCandidate:true,judgeState:'판정대기',status:'판정대기'});
          else if(r<supplementCut)Object.assign(row,{candidate:true,isCandidate:true,judgeState:'보완요청',status:'보완요청',judgedAt:fromDay(minDay(T0,regDay+ri(1,20)))});
          else if(r<unconfirmedCut)Object.assign(row,{candidate:true,isCandidate:true,judgeState:'미확정',status:'판정대기',judgedAt:fromDay(minDay(T0,regDay+ri(1,20)))});
          else if(r<closedCut)Object.assign(row,{candidate:false,judgeState:'',status:'완료'});
          else Object.assign(row,{candidate:true,isCandidate:true,judgeState:pick(['후보','검토중']),status:'검토중'});
        }
      }
      out.push(row);
    }
  });
  return out;
}

/* ---------- Audit ---------- */
function makeAudits(){
  const per=20*SCALE,out=[];let seq=0;
  TEAMS.forEach((team,ti)=>{
    for(let k=0;k<per;k++){
      seq++;
      const row={id:'VALID-U-'+pad(seq,5),team,group:GROUP.get(team),workplace:`Audit 구역 ${1+k%AREAS.length} (${AREAS[k%AREAS.length]})`,leader:NAMES[ti%NAMES.length],batchSize:1,source:SRC};
      const wait=k%12===0;
      const off=wait?0:ri(0,330),auditDate=wait?'':fromDay(T0-off);
      row.date=wait?fromDay(T0-ri(0,30)):auditDate;row.auditDate=auditDate;
      row.auditResult=chance(.2)?'미흡':'적합';
      if(wait){row.status='실시대기';row.finalEvaluation=''}
      else{
        const closed=addMonths(auditDate,6)<TODAY;
        if(!closed){row.status='6개월 관리중';row.finalEvaluation=''}
        else if(chance(.65)){row.finalEvaluation=chance(.25)?'미흡':'적합';row.finalEvaluatedAt=addMonths(auditDate,6);row.status='종료'}
        else{row.finalEvaluation='';row.status='종료평가대기'}
      }
      out.push(row);
    }
  });
  return out;
}

/* ---------- Action ---------- */
function makeActions(audits){
  const per=40*SCALE,out=[];let seq=0;
  const byTeam=new Map(TEAMS.map(t=>[t,audits.filter(a=>a.team===t&&a.auditDate)]));
  TEAMS.forEach(team=>{
    for(let m=0;m<per;m++){
      seq++;
      const linkedAudit=chance(.85)&&byTeam.get(team).length?pick(byTeam.get(team)):null;
      let regDay=linkedAudit?minDay(T0,dayNum(linkedAudit.auditDate)+ri(0,20)):Y0+ri(0,Math.max(0,T0-Y0));
      const reg=fromDay(regDay);
      const row={id:'VALID-C-'+pad(seq,5),registeredAt:reg,date:reg,team,group:GROUP.get(team),workplace:`조치 구역 ${1+m%AREAS.length} (${AREAS[m%AREAS.length]})`,owner:pick(NAMES),problem:`${pick(PROB)} 개선요청 (검증 ${seq})`,before:pick(PHOTOS),auditDrawId:linkedAudit?linkedAudit.id:'',requestSource:pickSource(),source:SRC};
      if(chance(.62)){
        const due=regDay+ri(7,40),done=minDay(T0,regDay+ri(1,45)),verified=chance(.8),rr=R();
        Object.assign(row,{action:`${pick(IMP)} 완료 (검증 ${seq})`,status:'완료',due:fromDay(due),targetDate:fromDay(due),doneDate:fromDay(done),after:pick(PHOTOS),effectVerified:verified,effectState:verified?'유효':pick(['미검증','효과확인대기'])});
        if(verified){if(rr<.12){row.recurrence=true;row.recurrenceState='재발'}else if(rr<.55){row.recurrence=false;row.recurrenceState='미발생'}}
      }else{
        const rr=R();
        Object.assign(row,{action:'',status:pick(['조치대기','진행중']),doneDate:'',after:'',effectVerified:false,effectState:'미검증'});
        const due=rr<.35?fromDay(T0-ri(1,60)):rr<.9?fromDay(T0+ri(1,60)):'';
        row.due=due;row.targetDate=due;
      }
      out.push(row);
    }
  });
  return out;
}

/* ---------- 오류/경계 케이스 (edge=1) ---------- */
function edgeActivities(){
  const b={date:TODAY,regDate:TODAY,team:'대형메인팀',type:'정리',workplace:'EDGE',problem:'edge',improvement:'edge',status:'완료',source:SRC};
  const A=(id,o)=>Object.assign({},b,{id:'VALID-A-EDGE-'+id},o);
  const adv={type:'5S 고도화',candidate:true,isCandidate:true};
  return[
    A('01',{workplace:'"><img src=x onerror=alert(1)>',problem:'<script>alert("xss")</script>',improvement:"'; DROP TABLE x;--  &amp; <b>bold</b>"}),
    A('02',{workplace:'가'.repeat(400),problem:'A'.repeat(3000),improvement:'긴 문장 '.repeat(300)}),
    A('03',{team:' 대형메인팀 '}),
    A('04',{team:'존재하지않는팀'}),
    A('05',{team:null}),
    A('06',{team:''}),
    A('07',{date:'not-a-date',regDate:'not-a-date'}),
    A('08',{date:`${Y}/09/03`,regDate:`${Y}/09/03`}),
    A('09',{date:`${Y}-13-45`,regDate:`${Y}-13-45`}),
    A('10',{date:`${Y+1}-01-05`,regDate:`${Y+1}-01-05`}),
    A('11',{date:'',regDate:''}),
    A('DUP',{workplace:'중복 ID #1'}),A('DUP',{workplace:'중복 ID #2'}),
    A('13',Object.assign({},adv,{type:'고도화',judgeState:'확정',confirmed:false,workplace:'확정인데 confirmed=false'})),
    A('14',Object.assign({},adv,{type:' 5S고도화 ',judgeState:'미확정',confirmed:true,workplace:'confirmed=true인데 미확정'})),
    A('15',Object.assign({},adv,{judgeState:'확정',confirmed:true,maintainState:'중지',level:'Lv.3',judgedAt:TODAY})),
    A('16',Object.assign({},adv,{judgeState:'확정',confirmed:true,level:3,judgedAt:TODAY})),
    A('17',Object.assign({},adv,{judgeState:'확정',confirmed:true,level:'L6',judgedAt:TODAY})),
    A('18',Object.assign({},adv,{judgeState:'확정',confirmed:true,level:0,judgedAt:'invalid',valid:false})),
    A('19',{before:undefined,after:null}),
    A('20',{before:'https://invalid.invalid/broken.jpg',after:'not a url'}),
    A('21',{problem:'🔧 정리 ✅ 테스트 ⚠️ العربية עברית'}),
    A('22',{id:undefined}),
    A('23',{type:'기타'}),
    {source:SRC,id:'VALID-A-EDGE-24'}
  ];
}
function edgeAudits(){
  const b={team:'대형메인팀',workplace:'EDGE',auditDate:TODAY,date:TODAY,status:'6개월 관리중',source:SRC};
  const U=(id,o)=>Object.assign({},b,{id:'VALID-U-EDGE-'+id},o);
  return[
    U('01',{workplace:'"><script>alert(1)</script>'}),
    U('02',{id:undefined}),
    U('03',{auditDate:'invalid-date'}),
    U('04',{auditDate:fromDay(T0+30)}),
    U('05',{team:''}),U('06',{team:'존재하지않는팀'}),
    U('07',{finalEvaluation:'부적합',auditDate:fromDay(T0-300)}),
    U('08',{auditDate:addMonths(TODAY,-6)}),
    U('09',{auditDate:fromDay(dayNum(addMonths(TODAY,-6))+1)}),
    U('10',{auditDate:fromDay(dayNum(addMonths(TODAY,-6))-1),finalEvaluation:''}),
    U('DUP',{workplace:'중복 #1'}),U('DUP',{workplace:'중복 #2'}),
    U('13',{auditDate:'',finalEvaluation:'적합'})
  ];
}
function edgeActions(){
  const b={registeredAt:TODAY,date:TODAY,team:'대형메인팀',workplace:'EDGE',problem:'edge',action:'edge',status:'진행중',due:fromDay(T0+10),source:SRC};
  const C=(id,o)=>Object.assign({},b,{id:'VALID-C-EDGE-'+id},o);
  const done={status:'완료',doneDate:TODAY,after:PHOTOS[0]};
  return[
    C('01',{problem:'<img src=x onerror=alert(1)>',action:'"><script>alert(2)</script>'}),
    C('02',{problem:'B'.repeat(3000),action:'긴 조치 '.repeat(400)}),
    C('03',{due:'invalid'}),
    C('04',{due:fromDay(T0-1)}),C('05',{due:TODAY}),C('06',{due:fromDay(T0+1)}),
    C('07',Object.assign({},done,{registeredAt:fromDay(T0-10),doneDate:fromDay(T0-20),due:fromDay(T0-5)})),
    C('08',Object.assign({},done,{status:'완료 '})),
    C('09',Object.assign({},done,{effectState:'유효 ',recurrenceState:'Y'})),
    C('10',Object.assign({},done,{effectVerified:true,recurrence:true,auditDrawId:'VALID-U-99999'})),
    C('11',{action:'조치문은 있으나 doneDate 없음',doneDate:'',after:PHOTOS[1]}),
    C('12',{team:'존재하지않는팀'}),C('13',{team:null}),
    C('14',{due:''}),
    C('DUP',{workplace:'중복 #1'}),C('DUP',{workplace:'중복 #2'}),
    C('16',Object.assign({},done,{effectVerified:true,recurrenceState:'미발생',due:fromDay(T0-40),doneDate:fromDay(T0-2)}))
  ];
}

/* ---------- 시드 ---------- */
const summary={version:V,scale:SCALE,edge:EDGE,today:TODAY,counts:{},seeded:false,error:null};
function seed(){
  const sig=[V,SCALE,EDGE,TODAY].join('|');
  let meta=null;try{meta=JSON.parse(ls.getItem(META)||'null')}catch{}
  if(meta&&meta.sig===sig){summary.counts=meta.counts||{};return}
  try{
    backup();
    const a=makeActivities(),u=makeAudits(),x=makeActions(u);
    if(EDGE){a.push(...edgeActivities());u.push(...edgeAudits());x.push(...edgeActions())}
    const strip2=arr=>arr.map(r=>{const o={};Object.keys(r).forEach(k=>{if(r[k]!==undefined)o[k]=r[k]});return o});
    ls.setItem(K.a,JSON.stringify(strip2(a)));
    ls.setItem(K.u,JSON.stringify(strip2(u)));
    ls.setItem(K.x,JSON.stringify(strip2(x)));
    ls.setItem(K.t,JSON.stringify({Q1:2,Q2:3,Q3:4,Q4:5}));
    summary.counts={activity:a.length,audit:u.length,action:x.length};
    ls.setItem(META,JSON.stringify({sig,counts:summary.counts,at:new Date().toISOString()}));
    summary.seeded=true;
  }catch(e){
    summary.error=String(e&&e.name||e);console.error('[validation-fixture] seed failed → 원본으로 롤백',e);
    try{restore()}catch(e2){console.error('[validation-fixture] rollback failed',e2)}
  }
}
/* 인당 KPI 분모: localStorage 원본 마스터가 없을 때만 쓰이는 폴백 (저장소 미변경) */
window.HD20_HEADCOUNT_MASTER=TEAMS.map((team,i)=>({team,headcount:20+i*3}));
seed();

/* ---------- 콘솔 도우미 ---------- */
window.HD20_VALIDATION_FIXTURE={version:V,summary,reset:()=>{location.href=cleanUrl({validation:'reset'})},url:(o)=>cleanUrl(Object.assign({validation:'1'},o||{}))};

/* ---------- 배너 ---------- */
function banner(){
  const b=document.createElement('div');b.id='hd20ValidationBanner';
  const c=summary.counts||{},bad=!!summary.error;
  b.style.cssText='position:sticky;top:0;z-index:10050;padding:7px 12px;text-align:center;border-bottom:1px solid '+(bad?'#d98a80':'#e3c66a')+';background:'+(bad?'#fde8e4':'#fff3cd')+';color:'+(bad?'#8c2a1c':'#664d03')+';font:800 12px/1.5 sans-serif';
  const txt=document.createElement('span');
  txt.textContent=bad?`검증 데이터 저장 실패(${summary.error}) · 물량을 줄이거나 원본 복구 후 다시 시도`:`${DEFAULT_FALLBACK?'빈 데이터 자동 검증 모드':'검증 데이터 모드'} v${V} · Activity ${c.activity} / Audit ${c.audit} / Action ${c.action}${EDGE?' · 엣지 케이스 포함':''}${SCALE>1?' · ×'+SCALE:''} · 브라우저 로컬 전용`;
  b.append(txt);
  const link=(label,href)=>{const a=document.createElement('a');a.textContent=label;a.href=href;a.style.cssText='margin-left:10px;color:inherit;text-decoration:underline';b.append(a)};
  link(EDGE?'엣지 끄기':'엣지 켜기',cleanUrl({validation:'1',...(EDGE?{}:{edge:'1'}),...(SCALE>1?{scale:SCALE}:{})}));
  if(SCALE===1)link('×3',cleanUrl({validation:'1',scale:'3',...(EDGE?{edge:'1'}:{})}));
  else link('×1',cleanUrl({validation:'1',...(EDGE?{edge:'1'}:{})}));
  link('가상데이터 끄기(원본 복구)',cleanUrl({validation:'reset'}));
  document.body.prepend(b);
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',banner,{once:true}):banner();
})();
