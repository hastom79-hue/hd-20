'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=p=>fs.readFileSync(p,'utf8');
function extract(s,name){const start=s.indexOf('function '+name+'(');assert(start>=0,'Missing '+name);let brace=s.indexOf('{',start),depth=0,quote='',escape=false;for(let i=brace;i<s.length;i++){const c=s[i];if(quote){if(escape)escape=false;else if(c==='\\')escape=true;else if(c===quote)quote='';continue}if(c==='"'||c==="'"||c==='`'){quote=c;continue}if(c==='{')depth++;else if(c==='}'&&!--depth)return s.slice(start,i+1)}throw Error('Unclosed '+name)}
function run(s,names,extra=''){const code=names.map(n=>extract(s,n)).join('\n')+'\n'+extra;return vm.runInNewContext(code,{Intl,Date,Number,String,RegExp,Math});}
const close=source('audit-close-evaluation.js'),six=source('audit-six-month-control.js'),kpi=source('dashboard-kpi-source.js');
const add6=run(close,['seoulKey','add6'],'add6');
assert.equal(add6('2026-05-01'),'2026-11-01');
assert.equal(add6('2024-08-31'),'2025-02-28');
assert.equal(add6('2023-08-31'),'2024-02-29');
assert.match(close,/end<=today/,'6-month evaluation must be eligible on maturity date');
assert.match(close,/end>seoulKey\(\)/,'6-month evaluation must not block on maturity date');
const txt=v=>String(v??'').trim();
const cv=vm.runInNewContext(extract(close,'recurrenceValue')+';recurrenceValue',{txt});
const sr=vm.runInNewContext(extract(six,'recurrenceState')+';recurrenceState',{txt});
const sk=vm.runInNewContext(extract(six,'recurrenceKnown')+';recurrenceKnown',{txt});
const kr=vm.runInNewContext(extract(kpi,'recurrenceState')+';recurrenceState',{txt});
const ko=vm.runInNewContext(extract(kpi,'recurrenceObserved')+';recurrenceObserved',{txt});
for(const [record,known,recurred] of [
 [{recurrence:null},false,false],
 [{recurrence:false,recurrenceState:'미확인'},false,false],
 [{recurrence:true,recurrenceState:'미확인'},false,false],
 [{recurrence:false,recurrenceState:'재발'},true,true],
 [{recurrence:true,recurrenceState:'미발생'},true,false],
 [{recurrence:null,recurrenceState:'yes'},true,true],
 [{recurrence:null,recurrenceState:'no'},true,false],
 [{recurrence:false},true,false]
]){const result=cv(record);assert.equal(result.known,known,JSON.stringify(record));assert.equal(result.recurred,recurred,JSON.stringify(record));assert.equal(sk(record),known,JSON.stringify(record));assert.equal(sr(record),recurred,JSON.stringify(record));assert.equal(ko(record),known,JSON.stringify(record));assert.equal(kr(record),recurred,JSON.stringify(record))}
const closedLoop=source('audit-closed-loop-workflow.js'),linkage=source('action-audit-linkage.js');
assert.match(closedLoop,/effectVerified:false,recurrence:null/,'new Audit-linked Action must begin with unconfirmed recurrence');
assert.match(close,/effectVerified:false,recurrence:null/,'new follow-up Action must begin with unconfirmed recurrence');
assert.match(linkage,/const REGISTER_IDS=new Set\(\['amRegister','amRegisterOutlook','amRegisterAuto'\]\)/,'draft save must not consume pending Audit registration linkage');
assert.doesNotMatch(linkage,/const REGISTER_IDS=new Set\([^\n]*'amDraft'/,'draft must not be a formal registration action');
console.log('Audit six-month boundary and recurrence module contract PASS');
