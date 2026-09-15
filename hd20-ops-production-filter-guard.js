(()=>{'use strict';
const KEYS={activity:'hd20GMES5SAutoImproveRawV1',audit:'hd20AuditRandomDrawsV1',action:'hd20ActionCasesV2'};
const txt=v=>String(v??'').trim();
function nonProd(x){return window.HD20KPIData?.isNonProdRow?.(x)===true}
function read(k){try{const v=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(v)?v.filter(x=>!nonProd(x)):[]}catch{return[]}}
function status(x){return txt(x?.status||x?.activityStatus||x?.judgeState||x?.auditState)}
function done(x){return /완료|확정|종료|종결|close|done/i.test(status(x))}
function advType(x){return window.HD20KPIData?.isAdvancementType?.(x)??['5S 고도화','고도화','5S고도화'].includes(txt(x?.type||x?.category||x?.sType||x?.['5S구분']||x?.['활동유형']))}
function candidate(x){return window.HD20KPIData?.isCandidate?.(x)??false}
function confirmed(x){return window.HD20KPIData?.isConfirmed?.(x)??false}
function maintained(x){return window.HD20KPIData?.isMaintained?.(x)??false}
function overdue(x){const d=txt(x?.due||x?.targetDate||x?.deadline).slice(0,10),today=window.HD20KPIData?.seoulDateKey?.()||new Date().toISOString().slice(0,10);return !!d&&!done(x)&&d<today}
function effect(x){return window.HD20KPIData?.effectVerified?.(x)??false}
function recur(x){return window.HD20KPIData?.recurrenceState?.(x)??false}
function closedRecur(x){return done(x)&&effect(x)&&recur(x)}
function auditId(x){return txt(x?.id||x?.drawId||x?.auditDrawId)}
function actionAuditId(x){return txt(x?.auditDrawId||x?.sourceCaseId)}
function metrics(area,sub){
 const acts=read(KEYS.activity),audits=read(KEYS.audit),actions=read(KEYS.action),candidates=acts.filter(candidate),confirmedRows=acts.filter(confirmed),doneActions=actions.filter(done);
 const linked=actions.filter(a=>{const id=actionAuditId(a);return !!id&&audits.some(d=>auditId(d)===id)});
 const retentionRisk=audits.filter(d=>{const fs=txt(d.finalEvaluation||d.auditFinalState),id=auditId(d);return /미흡|부적합|실패|해제|중지/.test(fs)||(!!id&&actions.some(a=>actionAuditId(a)===id&&closedRecur(a)))});
 const map={
 'dashboard.summary':[['5S 활동',acts.length,'건'],['고도화 후보',candidates.length,'건'],['Audit 대기',audits.filter(x=>!x.auditDate).length,'건'],['기한경과',actions.filter(overdue).length,'건']],
 'dashboard.analysis':[['완료 활동',acts.filter(done).length,'건'],['공식확정',confirmedRows.length,'건'],['6개월 관리',audits.filter(x=>x.auditDate&&!x.finalEvaluation).length,'건'],['재발',actions.filter(closedRecur).length,'건']],
 'activity.manage':[['전체 활동',acts.length,'건'],['완료/확정',acts.filter(done).length,'건'],['진행/등록',acts.filter(x=>!done(x)).length,'건'],['고도화 후보',candidates.length,'건']],
 'activity.analysis':[['전체 활동',acts.length,'건'],['생산팀',new Set(acts.map(x=>txt(x.team)).filter(Boolean)).size,'팀'],['고도화 전환',candidates.length,'건'],['최근 30일',acts.filter(x=>{const d=new Date(x.date||x.regDate||x.createdAt||0);return Number.isFinite(d.getTime())&&Date.now()-d.getTime()<=2592e6}).length,'건']],
 'advancement.judge':[['후보',candidates.length,'건'],['판정대기',candidates.filter(x=>!confirmed(x)).length,'건'],['공식확정',confirmedRows.length,'건'],['3조건 충족',candidates.filter(x=>window.HD20MaturityConditionAnalysis?.criteriaState?.(x)?.count===3).length,'건']],
 'advancement.standard':[['공식확정',confirmedRows.length,'건'],['현재 유지',confirmedRows.filter(maintained).length,'건'],['유지 미흡',confirmedRows.filter(x=>!maintained(x)).length,'건'],['수평전개',confirmedRows.filter(x=>x.horizontalRollout||/전개/.test(txt(x.rolloutState))).length,'건']],
 'audit.audit':[['Audit 원천',audits.length,'건'],['실시 대기',audits.filter(x=>!x.auditDate).length,'건'],['Audit 완료',audits.filter(x=>x.auditDate).length,'건'],['부적합',audits.filter(x=>/부적합|미흡|NG|fail/i.test(txt(x.auditResult||x.result||x.status))).length,'건']],
 'audit.retention':[['관리중',audits.filter(x=>x.auditDate&&!x.finalEvaluation).length,'건'],['종료평가',audits.filter(x=>x.finalEvaluation).length,'건'],['재발/미흡',retentionRisk.length,'건'],['Action 연계',linked.length,'건']],
 'action.manage':[['전체 개선요청',actions.length,'건'],['진행/대기',actions.filter(x=>!done(x)).length,'건'],['완료',doneActions.length,'건'],['기한경과',actions.filter(overdue).length,'건']],
 'action.verify':[['검증 대상',doneActions.length,'건'],['효과검증 완료',doneActions.filter(effect).length,'건'],['검증대기',doneActions.filter(x=>!effect(x)).length,'건'],['재발',doneActions.filter(x=>effect(x)&&recur(x)).length,'건']]};
 return map[`${area}.${sub}`]||map['dashboard.summary'];
}
function patch(){const api=window.HD20_OPS_V2;if(!api||api.__productionFilterGuard)return false;api.metrics=metrics;api.__productionFilterGuard=true;window.dispatchEvent(new CustomEvent('hd20-ops-production-filter-ready'));return true}
function boot(){let n=0;const run=()=>{if(patch())return;if(++n<80)setTimeout(run,50)};run()}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
['hd20-kpi-source-updated','hd20-gmes-5s-imported','hd20-gmes-5s-judged','hd20-audit-updated','hd20-action-updated'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(patch,0)));
})();