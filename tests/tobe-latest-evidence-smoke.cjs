'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('audit-as-is-to-be-manager.js','utf8');
const start=src.indexOf('let ix=indices[0];if(JSON.stringify(data[ix])');
const end=src.indexOf('let old=localStorage.getItem(KEY)',start);
assert.ok(start>=0&&end>start,'latest-origin evidence gate must exist');
const snippet=src.slice(start,end);
const verify=new Function('indices','data','c','complete','photo','err','done','after',snippet+'return true;');
function scenario(name,record,complete,photo,expected,expectedMessage){
 const err={textContent:''};
 const result=verify([0],[record],record,complete,photo,err,x=>x.status==='완료',x=>x.after||x.afterEvidence||x.afterImage||'');
 assert.equal(result,expected,name+' permission');
 assert.equal(err.textContent.includes(expectedMessage),true,name+' message');
 console.log('PASS '+name);
}
scenario('latest evidence removed blocks completion',{status:'진행중'},true,'',undefined,'AFTER 사진 필수');
scenario('latest AFTER evidence permits completion',{status:'진행중',after:'data:image/png;base64,current'},true,'',true,'');
scenario('new uploaded photo permits completion',{status:'진행중'},true,'data:image/png;base64,new',true,'');
scenario('in-progress draft permits missing AFTER',{status:'진행중'},false,'',true,'');
scenario('concurrent completed record blocks stale save',{status:'완료',after:'data:image/png;base64,current'},true,'',undefined,'원본 상태가 변경됨');
console.log('TO-BE latest evidence regression: 5/5 passed');
