(()=>{'use strict';
const KEYS={activity:'hd20GMES5SAutoImproveRawV1',audit:'hd20AuditRandomDrawsV1',action:'hd20ActionCasesV2'};
const txt=v=>String(v??'').trim();
function nonProd(x){return window.HD20KPIData?.isNonProdRow?.(x)===true}
function read(k){try{const v=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(v)?v.filter(x=>!nonProd(x)):[]}catch{return[]}}
function status(x){return txt(x?.status||x?.activityStatus||x?.judgeState||x?.auditState)}
function done(x){return /완료|확정|종료|종결|close|done/i.test(status(x))}
function candidate(x){return window.HD20KPIData?.isCandidate?.(x)??false}
function confirmed(x){return window.HD20KPIData?.isConfirmed?.(x)??false}
function maintained(x){return window.HD20KPIData?.isMaintained?.(x)??false}
function weakMaintain(x){return confirmed(x)&&(/미흡|부적합|중지|해제|실패/.test(txt(x.maintainState||x.auditState||x.status))||x.valid===false)}
/* 딥 리서치 전수 검증: 동일 버그(due만 보고 실제 필드명 dueDate를 안 봄)가 이 파일에도 중복돼 있었음
   — "① 개선요청·실행" 화면이 실제로 소비하는 action.manage 정의가 hd20-ops-v2.js가 아니라 이 파일
   (production-filter-guard, 운영 데이터 필터링 레이어로 더 나중에 적용되는 쪽)이었기 때문에, 앞서
   hd20-ops-v2.js만 고쳤을 때는 화면에 반영되지 않았음. */
function overdue(x){const d=txt(x?.dueDate||x?.due||x?.targetDate||x?.deadline).slice(0,10),today=window.HD20KPIData?.seoulDateKey?.()||new Date().toISOString().slice(0,10);return !!d&&!done(x)&&d<today}
function effect(x){return window.HD20KPIData?.effectVerified?.(x)??false}
function recur(x){return window.HD20KPIData?.recurrenceState?.(x)??false}
function closedRecur(x){return done(x)&&effect(x)&&recur(x)}
function auditId(x){return txt(x?.id||x?.drawId||x?.auditDrawId)}
function actionAuditId(x){return txt(x?.auditDrawId||x?.sourceCaseId)}
/* 딥 리서치 전수 검증: hd20-ops-v2.js에 "activity.manage" 정의를 먼저 수정했으나 화면이 그대로였음
   — 같은 키가 이 파일(production-filter-guard, 실제 소비처)에도 독립 정의돼 있어 연도 필터 없는
   read(KEYS.activity)를 그대로 쓰고 있었기 때문. 대시보드·목록이 쓰는 연도 필터(snapshot().activities)
   로 통일. */
function metrics(area,sub){
 const acts=(window.HD20KPIData?.snapshot?.()?.activities)||read(KEYS.activity),audits=read(KEYS.audit),actions=read(KEYS.action),candidates=acts.filter(candidate),confirmedRows=acts.filter(confirmed),doneActions=actions.filter(done);
 const linked=actions.filter(a=>{const id=actionAuditId(a);return !!id&&audits.some(d=>auditId(d)===id)});
 const retentionRisk=audits.filter(d=>{const fs=txt(d.finalEvaluation||d.auditFinalState),id=auditId(d);return /미흡|부적합|실패|해제|중지/.test(fs)||(!!id&&actions.some(a=>actionAuditId(a)===id&&closedRecur(a)))});
 const map={
 'dashboard.summary':[['5S 활동',acts.length,'건'],['고도화 후보',candidates.length,'건'],['Audit 대기',audits.filter(x=>!x.auditDate).length,'건'],['기한경과',actions.filter(overdue).length,'건']],
 'dashboard.analysis':[['완료 활동',acts.filter(done).length,'건'],['공식확정',confirmedRows.length,'건'],['6개월 관리',audits.filter(x=>x.auditDate&&!x.finalEvaluation).length,'건'],['재발',actions.filter(closedRecur).length,'건']],
 'activity.manage':[['전체 활동',acts.length,'건'],['완료/확정',acts.filter(done).length,'건'],['진행/등록',acts.filter(x=>!done(x)).length,'건'],['고도화 후보',candidates.length,'건']],
 'activity.analysis':[['전체 활동',acts.length,'건'],['생산팀',new Set(acts.map(x=>txt(x.team)).filter(Boolean)).size,'팀'],['고도화 전환',candidates.length,'건'],['최근 30일',acts.filter(x=>{const d=new Date(x.date||x.regDate||x.createdAt||0);return Number.isFinite(d.getTime())&&Date.now()-d.getTime()<=2592e6}).length,'건']],
 'advancement.judge':[['후보',candidates.length,'건'],['판정대기',candidates.filter(x=>!confirmed(x)).length,'건'],['공식확정',confirmedRows.length,'건'],['3조건 충족',candidates.filter(x=>window.HD20MaturityConditionAnalysis?.criteriaState?.(x)?.count===3).length,'건']],
 'advancement.standard':[['공식확정',confirmedRows.length,'건'],['현재 유지',confirmedRows.filter(maintained).length,'건'],['유지 미흡',confirmedRows.filter(weakMaintain).length,'건'],['수평전개',confirmedRows.filter(x=>x.horizontalRollout||/전개/.test(txt(x.rolloutState))).length,'건']],
 'audit.draw':[['Audit 원천',audits.length,'건'],['실시 대기',audits.filter(x=>!x.auditDate).length,'건'],['Audit 완료',audits.filter(x=>x.auditDate).length,'건'],['부적합',audits.filter(x=>/부적합|미흡|NG|fail/i.test(txt(x.auditResult||x.result||x.status))).length,'건']],
 'audit.retention':[['관리중',audits.filter(x=>x.auditDate&&!x.finalEvaluation).length,'건'],['종료평가',audits.filter(x=>x.finalEvaluation).length,'건'],['재발/미흡',retentionRisk.length,'건'],['Action 연계',linked.length,'건']],
 'action.manage':[['전체 개선요청',actions.length,'건'],['진행/대기',actions.filter(x=>!done(x)).length,'건'],['완료',doneActions.length,'건'],['기한경과',actions.filter(overdue).length,'건']],
 'action.verify':[['검증 대상',doneActions.length,'건'],['효과검증 완료',doneActions.filter(effect).length,'건'],['검증대기',doneActions.filter(x=>!effect(x)).length,'건'],['재발',doneActions.filter(x=>effect(x)&&recur(x)).length,'건']]};
 if(area==='audit'&&sub==='ongoing')return [['관리중',audits.filter(x=>x.auditDate&&!x.finalEvaluation).length,'건'],['재발 징후',retentionRisk.filter(x=>!txt(x.finalEvaluation||x.auditFinalState)).length,'건'],['Action 연계',linked.length,'건'],['월별 확인',audits.filter(x=>x.auditDate&&!x.finalEvaluation&&txt(x.auditDate).slice(0,7)===(window.HD20KPIData?.seoulDateKey?.()||new Date().toISOString().slice(0,10)).slice(0,7)).length,'건']];
 if(area==='action'&&sub==='leadtime'){const due=x=>txt(x.dueDate||x.due||x.targetDate).slice(0,10),finished=x=>txt(x.doneDate).slice(0,10);return [['계획대비 지연',actions.filter(x=>due(x)&&finished(x)&&finished(x)>due(x)).length,'건'],['계획대비 조기완료',actions.filter(x=>due(x)&&finished(x)&&finished(x)<due(x)).length,'건'],['7일 이상 지연',actions.filter(x=>due(x)&&finished(x)&&(new Date(finished(x))-new Date(due(x)))/86400000>=7).length,'건'],['정시완료(당일)',actions.filter(x=>due(x)&&finished(x)&&finished(x)===due(x)).length,'건']]}
 return map[`${area}.${sub}`]||(area==='dashboard'?map['dashboard.summary']:[]);
}
function restoreParity(api){if(api.__evidenceParityPatched)delete api.__evidenceParityPatched;const parity=window.HD20_KPI_PARITY_GUARD;if(parity?.patchApi){parity.patchApi();parity.schedule?.()}}
function patch(){const api=window.HD20_OPS_V2;if(!api)return false;if(api.metrics!==metrics){api.metrics=metrics;restoreParity(api)}api.__productionFilterGuard=true;window.dispatchEvent(new CustomEvent('hd20-ops-production-filter-ready'));return true}
function boot(){let n=0;const run=()=>{if(patch())return;if(++n<80)setTimeout(run,50)};run();setTimeout(patch,1200)}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
['hd20-kpi-source-updated','hd20-gmes-5s-imported','hd20-gmes-5s-judged','hd20-audit-updated','hd20-action-updated'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(patch,0)));
})();