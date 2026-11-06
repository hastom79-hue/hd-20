'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('hd20-subtabs.js','utf8');
const begin=src.indexOf('const at=new Date().toISOString(),actionDay=seoulDay()');
const end=src.indexOf('if(createdFollowupId)window.dispatchEvent',begin);
assert.ok(begin>=0&&end>begin,'recheck transaction source extraction');
const execute=new Function('rows','n','result','comment','action','seoulDay','currentEmail','localStorage','load','save','box','window','console',src.slice(begin,end)+'return {createdFollowupId,rows};');
function scenario(label,failAt,result,expectedActions,expectedHistory){
 const source=[{id:'R1',caseId:'CASE1',kind:'자율개선',team:'조립',workplace:'라인',evaluator:'auditor',result:'부적합',actionId:'A1',recheckHistory:[]}];
 const actions=[{id:'A1',status:'완료',sourceStage:'RETENTION-RANDOM',sourceCaseId:'RET-AUDIT-R1'}];
 const mem=new Map([['hd20RetentionRandomChecksV1',JSON.stringify(source)],['hd20ActionCasesV2',JSON.stringify(actions)]]);
 const before=Object.fromEntries(mem);
 const localStorage={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,v),removeItem:k=>mem.delete(k)};
 const load=k=>JSON.parse(mem.get(k)||'[]');
 let injected=false;
 const save=(k,v)=>{localStorage.setItem(k,JSON.stringify(v));if(k===failAt&&!injected){injected=true;throw Error('injected write error')}};
 const alerts=[];
 const box={dataset:{rsSaving:'1'},querySelectorAll:()=>[{disabled:true}],isConnected:true};
 const returned=execute(source,0,result,'현장 재점검 의견',actions[0],()=> '2026-11-06',()=> 'auditor',localStorage,load,save,box,{alert:m=>alerts.push(m)},{error:()=>{}});
 assert.equal(load('hd20ActionCasesV2').length,expectedActions,label+' action count');
 assert.equal(load('hd20RetentionRandomChecksV1')[0].recheckHistory.length,expectedHistory,label+' recheck history count');
 if(failAt){
  assert.equal(mem.get('hd20ActionCasesV2'),before.hd20ActionCasesV2,label+' actions rolled back');
  assert.equal(mem.get('hd20RetentionRandomChecksV1'),before.hd20RetentionRandomChecksV1,label+' retention rolled back');
  assert.equal(alerts.length,1,label+' visible failure notice');
  assert.equal(returned,undefined,label+' transaction abort');
 }else{
  assert.equal(alerts.length,0,label+' no false failure notice');
  assert.equal(returned.createdFollowupId,result==='부적합'?'AUTO-RETENTION-RECHECK-R1-1':'',label+' followup ID');
  const saved=load('hd20RetentionRandomChecksV1')[0];
  assert.equal(Boolean(saved.closedAt),result==='적합',label+' closure state');
  assert.equal(saved.recheckResult,result,label+' stored final verdict');
  assert.equal(saved.recheckHistory.at(-1)?.result,result,label+' final verdict history');
  assert.equal(saved.recheckHistory.at(-1)?.actionId,'A1',label+' inspected action');
  assert.equal(saved.recheckHistory.at(-1)?.evaluator,'auditor',label+' retained evaluator');
  assert.equal(saved.recheckedAt,saved.recheckHistory.at(-1)?.at,label+' stored recheck timestamp');
  if(result==='부적합')assert.equal(saved.followupActionId,returned.createdFollowupId,label+' new followup linkage');
 }
 console.log('PASS '+label);
}
scenario('action write failure restores both stores','hd20ActionCasesV2','부적합',1,0);
scenario('retention write failure removes newly created followup','hd20RetentionRandomChecksV1','부적합',1,0);
scenario('normal failed recheck creates one followup','','부적합',2,1);
scenario('normal passing recheck closes without followup','','적합',1,1);
scenario('closure write failure preserves open case','hd20RetentionRandomChecksV1','적합',1,0);
console.log('Retention recheck transactional rollback: 5/5 passed');
