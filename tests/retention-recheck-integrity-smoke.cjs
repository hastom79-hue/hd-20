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
];
for(const [name,rs,as,expected] of cases){assert.equal(verify('R1',rs,as),expected,name);console.log('PASS '+name)}
assert(src.includes("e.stopImmediatePropagation()"),'invalid click stops underlying handler');
console.log('Retention recheck integrity: 9/9 passed');
