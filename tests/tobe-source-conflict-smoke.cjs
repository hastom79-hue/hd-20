'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync('audit-as-is-to-be-manager.js','utf8');
const start=source.indexOf('let ix=indices[0];');
const end=source.indexOf('if(complete&&!photo',start);
assert(start>=0&&end>start,'latest-record protection guard exists');
const part=source.slice(start,end);
function verify(opened,latest){
 const err={textContent:''};
 const data=[latest],indices=[0],c=opened;
 const done=x=>x.status==='완료';
 const run=new Function('data','indices','c','err','done',part+';return true;');
 const allowed=run(data,indices,c,err,done)===true;
 return {allowed,error:err.textContent};
}
const base={id:'REQ-1',team:'대형 메인',workplace:'라인 A',problem:'기존',status:'진행중'};
const checks=[
 ['unchanged original',base,true],
 ['changed request text',{...base,problem:'변경된 원본'},false],
 ['changed team',{...base,team:'중형 메인'},false],
 ['changed workplace',{...base,workplace:'라인 B'},false],
 ['changed status',{...base,status:'완료'},false],
 ['changed TO-BE plan',{...base,toBePlan:'타 탭 신규 조치'},false]
];
for(const [name,latest,expected] of checks){
 const x=verify(base,latest);
 assert.equal(x.allowed,expected,name);
 if(!expected)assert(x.error.length>0,name+' error feedback');
}
assert(part.includes('JSON.stringify(data[ix])!==JSON.stringify(c)'),'original snapshot is compared with latest stored record');
console.log('TO-BE optimistic record conflict: 6/6 scenarios passed');
