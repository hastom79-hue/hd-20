'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('hd20-subtabs.js','utf8');
const start=src.indexOf("const persistedActions=load('hd20ActionCasesV2').filter(");
const ifPos=src.indexOf("if(!r.actionId||persistedActions.length!==1",start);
const end=src.indexOf("){",ifPos);
assert(start>=0&&ifPos>start&&end>ifPos,'persisted retention linkage guard located');
const code=src.slice(start,ifPos)+'return ('+src.slice(ifPos+3,end)+');';
const run=new Function('load','r','draw',code);
const baseA={id:'A1',sourceCaseId:'RET-AUDIT-R1',sourceStage:'RETENTION-RANDOM',originCaseId:'CASE-1',team:'조립팀',workplace:'라인A',initialAuditor:'auditor@hd.com'};
const baseD={id:'RET-AUDIT-R1',sourceCaseId:'CASE-1',sourceStage:'RETENTION-RANDOM',team:'조립팀',workplace:'라인A',initialAuditor:'auditor@hd.com'};
function scenario(label,actions,draws,expected){
 const load=k=>k==='hd20ActionCasesV2'?actions:draws;
 const result=run(load,{actionId:'A1',caseId:'CASE-1',team:'조립팀',workplace:'라인A',evaluator:'auditor@hd.com'},baseD);
 assert.equal(result,expected,label);
 console.log('PASS '+label);
}
scenario('valid linkage',[baseA],[baseD],false);
scenario('missing action',[],[baseD],true);
scenario('duplicate actions',[baseA,baseA],[baseD],true);
scenario('missing audit',[baseA],[],true);
scenario('duplicate audits',[baseA],[baseD,baseD],true);
scenario('wrong origin',[{...baseA,originCaseId:'OTHER'}],[baseD],true);
scenario('wrong team',[{...baseA,team:'OTHER'}],[baseD],true);
scenario('wrong audit provenance',[baseA],[{...baseD,sourceCaseId:'OTHER'}],true);
scenario('wrong action workplace',[{...baseA,workplace:'라인B'}],[baseD],true);
scenario('missing action workplace',[{...baseA,workplace:''}],[baseD],true);
scenario('wrong action initial auditor',[{...baseA,initialAuditor:'other@hd.com'}],[baseD],true);
scenario('wrong audit team',[baseA],[{...baseD,team:'다른팀'}],true);
scenario('wrong audit workplace',[baseA],[{...baseD,workplace:'라인B'}],true);
scenario('missing audit auditor',[baseA],[{...baseD,initialAuditor:''} ],true);
scenario('wrong audit auditor',[baseA],[{...baseD,initialAuditor:'other@hd.com'}],true);
console.log('Persisted retention linkage 15/15 scenarios passed');

// Existing corrective actions must carry their own immutable provenance;
// blank fields must not match via fallback to the inspection record.
const guardStart=src.indexOf("if(action&&(String(action.sourceCaseId||'')!==draw.id");
const guardEnd=src.indexOf(")){throw new Error('유지점검 개선조치",guardStart);
assert(guardStart>=0&&guardEnd>guardStart,'existing correction provenance guard located');
const actionConflict=new Function('action','draw','evaluator','r','return '+src.slice(guardStart+3,guardEnd+2)+';');
const sourceR={caseId:'CASE-1',team:'조립팀',workplace:'라인A'};
const sourceAction={id:'A1',sourceStage:'RETENTION-RANDOM',sourceCaseId:'RET-AUDIT-R1',originCaseId:'CASE-1',team:'조립팀',workplace:'라인A',initialAuditor:'auditor@hd.com'};
const actionDraw={id:'RET-AUDIT-R1'};
assert.equal(actionConflict(sourceAction,actionDraw,'auditor@hd.com',sourceR),false,'matching provenance accepted');
for(const [label,change] of [
 ['missing auditor',{initialAuditor:''}],
 ['foreign auditor',{initialAuditor:'other@hd.com'}],
 ['missing origin',{originCaseId:''}],
 ['missing team',{team:''}],
 ['missing workplace',{workplace:''}],
 ['foreign workplace',{workplace:'라인B'}],
]){
 assert.equal(actionConflict({...sourceAction,...change},actionDraw,'auditor@hd.com',sourceR),true,label+' blocked');
 console.log('PASS corrective provenance '+label);
}
assert.equal(actionConflict(sourceAction,actionDraw,'',{...sourceR}),true,'missing evaluator blocked');

