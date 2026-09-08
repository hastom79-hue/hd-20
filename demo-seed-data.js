(()=>{'use strict';
const VERSION='20260908-1',MARK='hd20DemoSeedVersion';
const ACT='hd20GMES5SAutoImproveRawV1',AUD='hd20AuditRandomDrawsV1',ACTION='hd20ActionCasesV2',HEAD='hd20TeamHeadcountMasterV1';
const teams=['대형메인팀','휠로더Front팀','대형Att.팀','휠로더리어팀','중형상부1팀','중형메인팀','중형Att팀','대형상부팀','프레임제작팀','휠로더메인팀','중형상부2팀','중형하부팀','Boom제작팀','초대형조립팀','성능팀','트러블슈팅팀'];
const lines=['대형조립 1라인','휠로더 조립라인','ATT 조립라인','휠로더 후방라인','중형상부 1라인','중형 메인라인','중형 ATT라인','대형상부라인','프레임 제작라인','휠로더 메인라인','중형상부 2라인','중형하부라인','Boom 제작라인','초대형 조립라인','성능시험라인','트러블슈팅 존'];
const work=['메인 조립 작업장','Front 조립 작업장','Attachment 준비 작업장','Rear 조립 작업장','상부체 조립 작업장','중형 메인 작업장','중형 ATT 작업장','대형 상부체 작업장','프레임 취부 작업장','휠로더 메인 작업장','중형상부 2 작업장','하부체 조립 작업장','Boom 용접 작업장','초대형 조립 작업장','성능검사 작업장','품질 트러블 대응 작업장'];
const types=['정리','정돈','청소','시각화','위험구역관리'];
const pad=n=>String(n).padStart(2,'0');
const date=(m,d)=>`2026-${pad(m)}-${pad(d)}`;
const emptyArray=k=>{try{const v=JSON.parse(localStorage.getItem(k)||'[]');return !Array.isArray(v)||v.length===0}catch{return true}};
function activityRows(){const rows=[];let id=1;teams.forEach((team,i)=>{
  const m=6+(i%3),d=3+(i*3)%24,type=types[i%types.length];
  rows.push({id:`DEMO-ACT-${pad(id++)}`,date:date(m,d),regDate:date(m,d),createdAt:`${date(m,d)}T08:30:00+09:00`,type,team,line:lines[i],workplace:work[i],problem:`${work[i]} 내 불필요 물품·표시 불명확으로 찾는 시간과 이동 낭비 발생`,improvement:`불필요품 제거, 정위치 라벨링 및 사용빈도 기준 재배치 완료`,activityStatus:i%4===0?'진행':'완료',status:i%4===0?'진행':'완료',candidate:false,isCandidate:false,judgeState:'미확정',confirmed:false,source:'demo-seed',isDemo:true});
  if(i<12){const mm=7+(i%2),dd=5+(i*2)%22,c=i%3+1,confirmed=i<6,judge=confirmed?'확정':i<9?'보완요청':'판정대기';rows.push({id:`DEMO-ADV-${pad(id++)}`,date:date(mm,dd),regDate:date(mm,dd),createdAt:`${date(mm,dd)}T09:00:00+09:00`,type:'5S 고도화',team,line:lines[i],workplace:work[i],title:`${work[i]} 5S 고도화`,problem:'공구·자재 정위치와 시각관리 기준이 작업자별로 달라 반복 탐색 발생',improvement:'형적관리·Green Zone·정량축소 기준을 적용하여 표준 배치로 전환',candidate:true,isCandidate:true,criteriaMatched:c===1?['시각화·형적관리']:c===2?['시각화·형적관리','인간공학적 Green Zone']:['시각화·형적관리','인간공학적 Green Zone','정량축소·정위치 변경을 통한 공간 활용'],criterionVisual:true,criterionGreen:c>=2,criterionSpace:c>=3,judgeState:judge,confirmed,judgedAt:confirmed?date(8,12+i):i<9?date(8,20+i):'',confirmedAt:confirmed?date(8,12+i):'',judgeOwner:confirmed?'생산혁신팀 · 5S 모듈':'',judgeReason:confirmed?'3대 조건 적용성과 및 현장 유지상태 확인 후 공식 확정':i<9?'추가 시각표준 및 정량기준 보완 필요':'공식 판정 대기',level:c,maintainState:confirmed?(i===5?'유지 미흡':'정상 유지'):'',status:confirmed?'확정':judge,source:'demo-seed',isDemo:true});}
 });return rows}
function auditRows(){return[
 {id:'DEMO-AUD-001',batchId:'DEMO-BATCH-01',batchIndex:1,batchSize:3,date:'2026-09-01T09:10:00+09:00',team:'대형메인팀',riskPrev:2,riskCumulative:5,riskOverdue:1,riskRecurrence:0,riskWeight:2.4,riskPolicyApplied:true,auditDate:'2026-09-04',auditor:'생산혁신팀',status:'6개월 관리중',finalEvaluation:'',isDemo:true},
 {id:'DEMO-AUD-002',batchId:'DEMO-BATCH-01',batchIndex:2,batchSize:3,date:'2026-09-01T09:10:00+09:00',team:'프레임제작팀',riskPrev:1,riskCumulative:4,riskOverdue:1,riskRecurrence:1,riskWeight:2.2,riskPolicyApplied:true,auditDate:'2026-09-05',auditor:'5S 모듈',status:'6개월 관리중',finalEvaluation:'',isDemo:true},
 {id:'DEMO-AUD-003',batchId:'DEMO-BATCH-01',batchIndex:3,batchSize:3,date:'2026-09-01T09:10:00+09:00',team:'중형메인팀',riskPrev:1,riskCumulative:3,riskOverdue:0,riskRecurrence:0,riskWeight:1.6,riskPolicyApplied:true,auditDate:'',status:'Audit 실시 대기',finalEvaluation:'',isDemo:true},
 {id:'DEMO-AUD-004',batchId:'DEMO-BATCH-00',batchIndex:1,batchSize:3,date:'2026-02-02T09:00:00+09:00',team:'휠로더Front팀',riskPrev:1,riskCumulative:2,riskOverdue:0,riskRecurrence:0,riskWeight:1.3,riskPolicyApplied:true,auditDate:'2026-02-05',auditor:'생산혁신팀',status:'종료',finalEvaluation:'적합',isDemo:true},
 {id:'DEMO-AUD-005',batchId:'DEMO-BATCH-00',batchIndex:2,batchSize:3,date:'2026-02-02T09:00:00+09:00',team:'대형Att.팀',riskPrev:2,riskCumulative:4,riskOverdue:1,riskRecurrence:0,riskWeight:2.0,riskPolicyApplied:true,auditDate:'2026-02-06',auditor:'5S 모듈',status:'종료',finalEvaluation:'적합',isDemo:true},
 {id:'DEMO-AUD-006',batchId:'DEMO-BATCH-00',batchIndex:3,batchSize:3,date:'2026-02-02T09:00:00+09:00',team:'중형상부1팀',riskPrev:2,riskCumulative:6,riskOverdue:2,riskRecurrence:1,riskWeight:3.1,riskPolicyApplied:true,auditDate:'2026-02-10',auditor:'생산혁신팀',status:'종료',finalEvaluation:'미흡',isDemo:true}
]}
function actionRows(){return[
 {id:'DEMO-IMP-001',date:'2026-08-25',registeredAt:'2026-08-25',created:'2026-08-25',team:'대형메인팀',workplace:'메인 조립 작업장',problem:'공구 정위치 표식 훼손 및 일부 공구 혼재',action:'형적보드 재정비 및 일일 확인체크 적용',due:'2026-09-10',targetDate:'2026-09-10',status:'조치중',auditDrawId:'DEMO-AUD-001',recurrence:false,recurrenceState:'미발생',email:'',isDemo:true},
 {id:'DEMO-IMP-002',date:'2026-08-20',registeredAt:'2026-08-20',created:'2026-08-20',team:'프레임제작팀',workplace:'프레임 취부 작업장',problem:'자재 적치선 이탈과 빈 용기 장기 방치',action:'정량 적치 기준 및 Empty Box 회수주기 재설정',due:'2026-09-02',targetDate:'2026-09-02',status:'조치대기',auditDrawId:'DEMO-AUD-002',recurrence:true,recurrenceState:'재발',email:'',isDemo:true},
 {id:'DEMO-IMP-003',date:'2026-07-18',registeredAt:'2026-07-18',created:'2026-07-18',team:'휠로더Front팀',workplace:'Front 조립 작업장',problem:'부품 위치표시 가독성 저하',action:'라인 시야각 기준으로 표준 라벨 위치 변경',due:'2026-07-31',targetDate:'2026-07-31',status:'완료',doneDate:'2026-07-29',completedDate:'2026-07-29',recurrence:false,recurrenceState:'미발생',email:'',isDemo:true},
 {id:'DEMO-IMP-004',date:'2026-07-22',registeredAt:'2026-07-22',created:'2026-07-22',team:'대형Att.팀',workplace:'Attachment 준비 작업장',problem:'공용 치공구 구역 혼재',action:'치공구별 전용 위치 및 최대수량 표준 지정',due:'2026-08-05',targetDate:'2026-08-05',status:'완료',doneDate:'2026-08-04',completedDate:'2026-08-04',recurrence:false,recurrenceState:'미발생',email:'',isDemo:true},
 {id:'DEMO-IMP-005',date:'2026-06-10',registeredAt:'2026-06-10',created:'2026-06-10',team:'중형상부1팀',workplace:'상부체 조립 작업장',problem:'부품 박스 정량 초과 적치',action:'1회 공급량 축소와 공급주기 단축',due:'2026-06-24',targetDate:'2026-06-24',status:'완료',doneDate:'2026-06-27',completedDate:'2026-06-27',recurrence:true,recurrenceState:'재발',email:'',isDemo:true},
 {id:'DEMO-IMP-006',date:'2026-08-30',registeredAt:'2026-08-30',created:'2026-08-30',team:'중형메인팀',workplace:'중형 메인 작업장',problem:'청소점검 사각구역 발생',action:'설비 하부 점검구역 시각화 및 담당구역 재배치',due:'2026-09-12',targetDate:'2026-09-12',status:'조치중',recurrence:false,recurrenceState:'미발생',email:'',isDemo:true}
]}
function seed(reason='boot'){
 if(localStorage.getItem(MARK)===VERSION)return false;
 const changed=[];
 if(emptyArray(ACT)){localStorage.setItem(ACT,JSON.stringify(activityRows()));changed.push(ACT)}
 if(emptyArray(AUD)){localStorage.setItem(AUD,JSON.stringify(auditRows()));changed.push(AUD)}
 if(emptyArray(ACTION)){localStorage.setItem(ACTION,JSON.stringify(actionRows()));changed.push(ACTION)}
 if(!localStorage.getItem(HEAD)){const master=teams.map((team,i)=>({team,headcount:18+(i%5)*2}));localStorage.setItem(HEAD,JSON.stringify(master));changed.push(HEAD)}
 localStorage.setItem(MARK,VERSION);
 if(changed.length){setTimeout(()=>{['hd20-gmes-5s-imported','hd20-gmes-5s-judged','hd20-audit-updated','hd20-action-updated','hd20-kpi-source-updated'].forEach(name=>window.dispatchEvent(new CustomEvent(name,{detail:{source:'demo-seed',reason,stores:changed}})));window.HD20KPIData?.signal?.()},0);console.info('[HD20] demo seed applied',changed)}
 return changed.length>0
}
seed();
window.addEventListener('hd20-db-status',e=>{if(e.detail?.state==='ready'&&localStorage.getItem(MARK)!==VERSION)seed('db-ready')});
window.HD20_DEMO_SEED={version:VERSION,seed,isDemoRecord:x=>x?.isDemo===true};
})();