'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('retention-recheck-integrity-guard.js','utf8');
const begin=src.indexOf('function verify('),end=src.indexOf("document.addEventListener(",begin);
assert(begin>=0&&end>begin,'recheck integrity guard source');
const verify=new Function('norm',src.slice(begin,end)+'return verify;')(x=>String(x??'').trim());
const r={id:'R1',result:'부적합',team:'조립',workplace:'라인A',evaluator:'inspector@hd.com',actionId:'A1'};
const a={id:'A1',sourceStage:'RETENTION-RANDOM',sourceCaseId:'RET-AUDIT-R1',team:'조립',workplace:'라인A',initialAuditor:'inspector@hd.com'};
const cases=[
 ['valid',[r],[a],true],
 ['duplicate action',[r],[a,a],false],
 ['missing action',[r],[],false],
 ['foreign team',[r],[{...a,team:'기타'}],false],
 ['foreign workplace',[r],[{...a,workplace:'라인B'}],false],
 ['foreign auditor',[r],[{...a,initialAuditor:'other@hd.com'}],false],
 ['duplicate retention',[r,r],[a],false],
 ['closed retention',[{...r,closedAt:'2026-11-06'}],[a],false],
 ['not eligible',[{...r,result:'점검대기'}],[a],false],
 ['duplicate followup ID',[{...r,followupActionId:'F1'}],[a,{id:'F1',sourceStage:'RETENTION-RECHECK',sourceCaseId:'R1',originCaseId:'CASE-1',previousActionId:'A1',team:'조립',workplace:'라인A',initialAuditor:'inspector@hd.com'},{id:'F1',sourceStage:'RETENTION-RECHECK',sourceCaseId:'R1',originCaseId:'CASE-1',previousActionId:'A1',team:'조립',workplace:'라인A',initialAuditor:'inspector@hd.com'}],false],
 ['invalid followup origin',[{...r,followupActionId:'F1'}],[a,{id:'F1',sourceStage:'RETENTION-RECHECK',sourceCaseId:'R1',originCaseId:'OTHER',previousActionId:'A1',team:'조립',workplace:'라인A',initialAuditor:'inspector@hd.com'}],false],
 ['missing preceding action',[{...r,followupActionId:'F1'}],[a,{id:'F1',sourceStage:'RETENTION-RECHECK',sourceCaseId:'R1',originCaseId:'CASE-1',previousActionId:'',team:'조립',workplace:'라인A',initialAuditor:'inspector@hd.com'}],false],
 ['valid followup',[{...r,caseId:'CASE-1',followupActionId:'F1'}],[a,{id:'F1',sourceStage:'RETENTION-RECHECK',sourceCaseId:'R1',originCaseId:'CASE-1',previousActionId:'A1',team:'조립',workplace:'라인A',initialAuditor:'inspector@hd.com'}],true],
 ['wrong previous case',[{...r,caseId:'CASE-1',followupActionId:'F1'}],[a,{id:'F1',sourceStage:'RETENTION-RECHECK',sourceCaseId:'R1',originCaseId:'CASE-1',previousActionId:'FOREIGN',team:'조립',workplace:'라인A',initialAuditor:'inspector@hd.com'}],false],
 ['missing sequence one',[{...r,caseId:'CASE-1',followupActionId:'F2'}],[a,{id:'F2',sourceStage:'RETENTION-RECHECK',sourceCaseId:'R1',originCaseId:'CASE-1',previousActionId:'A1',team:'조립',workplace:'라인A',initialAuditor:'inspector@hd.com'}],false],
 ['second recheck points to first action',[{...r,caseId:'CASE-1',followupActionId:'F2'}],[a,{id:'F1',sourceStage:'RETENTION-RECHECK',sourceCaseId:'R1',originCaseId:'CASE-1',previousActionId:'A1',team:'조립',workplace:'라인A',initialAuditor:'inspector@hd.com'},{id:'F2',sourceStage:'RETENTION-RECHECK',sourceCaseId:'R1',originCaseId:'CASE-1',previousActionId:'A1',team:'조립',workplace:'라인A',initialAuditor:'inspector@hd.com'}],false],
 ['valid two rechecks',[{...r,caseId:'CASE-1',followupActionId:'F2'}],[a,{id:'F1',sourceStage:'RETENTION-RECHECK',sourceCaseId:'R1',originCaseId:'CASE-1',previousActionId:'A1',team:'조립',workplace:'라인A',initialAuditor:'inspector@hd.com'},{id:'F2',sourceStage:'RETENTION-RECHECK',sourceCaseId:'R1',originCaseId:'CASE-1',previousActionId:'F1',team:'조립',workplace:'라인A',initialAuditor:'inspector@hd.com'}],true],
];
for(const [name,rs,as,expected] of cases){assert.equal(verify('R1',rs,as),expected,name);console.log('PASS '+name)}
assert(src.includes("e.stopImmediatePropagation()"),'invalid click stops underlying handler');
console.log('Retention recheck integrity: 17/17 passed');
