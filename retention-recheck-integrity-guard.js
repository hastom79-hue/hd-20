(()=>{'use strict';
const norm=x=>String(x??'').trim();
const load=k=>{try{const x=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(x)?x:null}catch{return null}};
function verify(id,rs,as){
 if(!norm(id)||!Array.isArray(rs)||!Array.isArray(as))return false;
 const records=rs.filter(r=>norm(r?.id)===norm(id));if(records.length!==1)return false;
 const r=records[0];if(r.result!=='부적합'||r.closedAt||(r.recheckResult==='적합'&&r.recheckedAt))return false;
 // Blank-on-both-sides equality cannot establish provenance of the original inspection.
 if(!norm(r.caseId)||!norm(r.team)||!norm(r.workplace)||!norm(r.evaluator))return false;
 const followups=as.filter(a=>a?.sourceStage==='RETENTION-RECHECK'&&norm(a.sourceCaseId)===norm(r.id));
 const seq=a=>Number(norm(a.id).match(/(\d+)$/)?.[1]||0);
 const followupIds=followups.map(a=>norm(a.id));
 if(followupIds.some(id=>!id)||new Set(followupIds).size!==followupIds.length)return false;
 const ordered=followups.slice().sort((a,b)=>seq(a)-seq(b));
 if(ordered.some((a,i)=>!Number.isSafeInteger(seq(a))||seq(a)!==i+1||norm(a.originCaseId)!==norm(r.caseId)))return false;
 // Every recheck must follow the previous action in the same retention chain.
 if(ordered.some((a,i)=>norm(a.previousActionId)!==norm(i?ordered[i-1].id:r.actionId)))return false;
 const latest=ordered.at(-1);
 const aid=norm(latest?.id||r.followupActionId||r.actionId);
 const matches=as.filter(a=>norm(a?.id)===aid);if(!aid||matches.length!==1)return false;
 const a=matches[0],sourceOk=a.sourceStage==='RETENTION-RECHECK'?norm(a.sourceCaseId)===norm(r.id):a.sourceStage==='RETENTION-RANDOM'&&norm(a.sourceCaseId)==='RET-AUDIT-'+norm(r.id);
 return !!sourceOk&&norm(a.team)===norm(r.team)&&norm(a.workplace)===norm(r.workplace)&&norm(a.initialAuditor||a.auditor)===norm(r.evaluator)&&(!latest||norm(r.followupActionId)===norm(latest.id));
}
document.addEventListener('click',e=>{
 const button=e.target?.closest?.('[data-rs-recheck]');if(!button)return;
 const ok=verify(button.closest('[data-rs-id]')?.dataset.rsId,load('hd20RetentionRandomChecksV1'),load('hd20ActionCasesV2'));
 if(ok)return;
 e.preventDefault();e.stopImmediatePropagation();
 window.alert('원본 ID 중복 또는 최초 점검자·생산팀·작업장 불일치: 재점검·종결을 중단합니다. 관리자에게 확인해 주세요.');
},true);
window.HD20RetentionRecheckGuard={verify};
})();