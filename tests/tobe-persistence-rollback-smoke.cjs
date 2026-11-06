'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('audit-as-is-to-be-manager.js','utf8');
const begin=src.indexOf("try{localStorage.setItem(KEY,JSON.stringify(data));let savedMatches=");
const end=src.indexOf("window.dispatchEvent(new CustomEvent('hd20-action-updated'",begin);
assert.ok(begin>=0&&end>begin,'TO-BE persisted save+rollback block');
const execute=new Function('localStorage','KEY','data','rows','key','id','p','complete','old','err','console',src.slice(begin,end)+'return {ok:true};');
function test(name,initial,writeBehavior,readBehavior,expected){
 const KEY='hd20ActionCasesV2',storage=new Map(initial===null?[]:[[KEY,initial]]);
 let writeCount=0;
 const localStorage={getItem:k=>storage.get(k)??null,removeItem:k=>storage.delete(k),setItem:(k,v)=>{writeCount++;if(writeBehavior==='fail'&&writeCount===1)throw Error('storage full');storage.set(k,v)}};
 const row={id:'T1',toBePlan:'작업완료',status:'완료',doneStatus:'완료'};
 const rows=()=>readBehavior==='wrongStatus'?[{...row,status:'진행중'}]:readBehavior==='duplicate'?[row,row]:JSON.parse(storage.get(KEY)||'[]');
 const err={textContent:''};
 const returned=execute(localStorage,KEY,[row],rows,x=>String(x.id),'T1','작업완료',true,initial,err,{error:()=>{}});
 assert.equal(storage.get(KEY)??null,expected.store,name+' storage');
 assert.equal(!!returned?.ok,expected.success,name+' outcome');
 if(!expected.success)assert.ok(err.textContent.includes('복원'),name+' rollback message');
 console.log('PASS '+name);
}
const prior=JSON.stringify([{id:'T1',toBePlan:'이전정보',status:'진행중'}]);
test('normal complete save',prior,'none','normal',{success:true,store:JSON.stringify([{id:'T1',toBePlan:'작업완료',status:'완료',doneStatus:'완료'}])});
test('storage write exception restores prior value',prior,'fail','normal',{success:false,store:prior});
test('missing key is removed after failed verification',null,'none','wrongStatus',{success:false,store:null});
test('duplicate persisted IDs restore prior value',prior,'none','duplicate',{success:false,store:prior});
test('status mismatch restores prior value',prior,'none','wrongStatus',{success:false,store:prior});
console.log('TO-BE persistence & rollback: 5/5 passed');
