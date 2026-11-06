'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('audit-as-is-to-be-manager.js','utf8');
const begin=src.indexOf("if(complete&&dt>today())");
const end=src.indexOf("let photo='';",begin);
assert(begin>=0&&end>begin,'TO-BE completed-date guard region present');
const fragment=src.slice(begin,end);
function check(complete,dt,baseDay,todayValue){
 const err={textContent:''};let wasRejected=false;
 const execute=new Function('complete','dt','baseDay','today','err',fragment+'return false;');
 wasRejected=execute(complete,dt,baseDay,()=>todayValue,err);
 return {rejected:wasRejected===undefined,message:err.textContent};
}
const cases=[
 ['completed before request',true,'2026-11-01','2026-11-02','2026-11-07',true],
 ['completed on request',true,'2026-11-02','2026-11-02','2026-11-07',false],
 ['completed after request',true,'2026-11-03','2026-11-02','2026-11-07',false],
 ['completed in future',true,'2026-11-08','2026-11-02','2026-11-07',true],
 ['draft earlier date allowed',false,'2026-11-01','2026-11-02','2026-11-07',false],
 ['unknown original date',true,'2026-11-01','','2026-11-07',false]
];
for(const [name,complete,dt,baseDay,todayValue,expected] of cases){
 const out=check(complete,dt,baseDay,todayValue);
 assert.equal(out.rejected,expected,name+': '+out.message);
}
console.log('TO-BE completed-date chronology: 6/6 scenarios passed');
