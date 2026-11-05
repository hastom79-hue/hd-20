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
const baseA={id:'A1',sourceCaseId:'RET-AUDIT-R1',sourceStage:'RETENTION-RANDOM',originCaseId:'CASE-1',team:'조립팀'};
const baseD={id:'RET-AUDIT-R1',sourceCaseId:'CASE-1',sourceStage:'RETENTION-RANDOM'};
function scenario(label,actions,draws,expected){
 const load=k=>k==='hd20ActionCasesV2'?actions:draws;
 const result=run(load,{actionId:'A1',caseId:'CASE-1',team:'조립팀'},baseD);
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
console.log('Persisted retention linkage 8/8 scenarios passed');
