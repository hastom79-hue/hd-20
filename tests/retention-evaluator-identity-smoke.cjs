'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('hd20-subtabs.js','utf8');
const start=src.indexOf(" if(!canInspect()){window.alert('등록된 5S모듈 담당자");
const end=src.indexOf(" const rows=load('hd20RetentionRandomChecksV1')",start);
assert(start>=0&&end>start,'retention verdict authorization check');
const run=new Function('canInspect','evaluator','result','window',src.slice(start,end)+'return true;');
function scenario(name,permitted,email,result,expected){
 const alerts=[];
 const value=run(()=>permitted,email,result,{alert:x=>alerts.push(x)});
 assert.equal(value===true,expected,name);
 assert.equal(alerts.length,expected?0:1,name+' warning count');
}
scenario('master with verified identity',true,'master@hd.com','적합',true);
scenario('5S member with identity',true,'member@hd.com','부적합',true);
scenario('no session identity',true,'','적합',false);
scenario('invalid identity',true,'invalid-email','부적합',false);
scenario('external account',true,'external@example.com','적합',false);
scenario('unauthorized HD account',false,'other@hd.com','적합',false);
scenario('no verdict selected',true,'member@hd.com','',false);
assert(src.includes('자동 발송이 아닙니다.'),'draft notification must not imply automatic dispatch');
console.log('Retention evaluator identity and notification disclosure: 8/8');
