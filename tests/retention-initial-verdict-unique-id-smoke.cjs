'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('hd20-subtabs.js','utf8');
const start=src.indexOf("const rows=load('hd20RetentionRandomChecksV1'),matching=rows.map((x,i)=>");
const end=src.indexOf("box.dataset.rsSaving='1';btn.disabled=true;",start);
assert(start>=0&&end>start,'initial retention verdict unique-ID guard exists');
const snippet=src.slice(start,end);
const run=new Function('id','load','window',snippet+'return n;');
function scenario(name,records,id,expected,alertsExpected){
 const alerts=[];
 const result=run(id,()=>records,{alert:x=>alerts.push(x)});
 assert.equal(result,expected,name+' result');
 assert.equal(alerts.length,alertsExpected,name+' alert count');
 console.log('PASS '+name);
}
scenario('single pending record',[{id:'RET-1',result:'점검대기'}],'RET-1',0,0);
scenario('duplicate pending records',[{id:'RET-1',result:'점검대기'},{id:'RET-1',result:'점검대기'}],'RET-1',undefined,1);
scenario('unknown ID',[{id:'RET-2',result:'점검대기'}],'RET-1',undefined,1);
scenario('empty ID',[{id:'RET-1',result:'점검대기'}],'',undefined,1);
scenario('already evaluated',[{id:'RET-1',result:'적합'}],'RET-1',undefined,0);
console.log('Initial retention verdict guards: 5 passed');
