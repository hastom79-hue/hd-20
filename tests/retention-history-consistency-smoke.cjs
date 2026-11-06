'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('hd20-subtabs.js','utf8');
const begin=src.indexOf(' const recheckHistory=rows[n].recheckHistory;');
const end=src.indexOf(' const sequence=a=>',begin);
assert(begin>=0&&end>begin,'recheck history chain guard located');
const snippet=src.slice(begin,end);
const record={id:'R1',caseId:'CASE-1',team:'조립팀',workplace:'A라인',evaluator:'auditor@hd.com',actionId:'A1'};
const followup=(i,previous)=>({
 id:'AUTO-RETENTION-RECHECK-R1-'+i,sourceStage:'RETENTION-RECHECK',sourceCaseId:'R1',
 previousActionId:previous,originCaseId:'CASE-1',team:'조립팀',workplace:'A라인',
 initialAuditor:'auditor@hd.com'
});
const first=followup(1,'A1'),second=followup(2,first.id);
const hist1={result:'부적합',actionId:'A1'},hist2={result:'부적합',actionId:first.id};
function scenario(label,history,actions,blocked){
 const rows=[{...record,recheckHistory:history}],n=0,historyActions=actions;
 const controls=[{disabled:true}],box={dataset:{rsSaving:'1'},querySelectorAll:()=>controls};
 const alerts=[];
 const check=new Function('rows','n','historyActions','box','window',snippet+';return true;');
 const result=check(rows,n,historyActions,box,{alert:message=>alerts.push(message)});
 assert.equal(result===undefined,blocked,label);
 assert.equal(alerts.length,blocked?1:0,label+' warning');
 if(blocked){assert.equal(box.dataset.rsSaving,'',label+' unlock');assert.equal(controls[0].disabled,false,label+' enable')}
}
scenario('first recheck uninitialized history',undefined,[],false);
scenario('first recheck empty history',[],[],false);
scenario('first failed recheck paired',[hist1],[first],false);
scenario('two failed rechecks paired',[hist1,hist2],[first,second],false);
scenario('orphan followup',[],[first],true);
scenario('missing followup',[hist1],[],true);
scenario('corrupt history object',{length:1},[first],true);
scenario('wrong history previous action',[{...hist1,actionId:'FOREIGN'}],[first],true);
scenario('wrong followup predecessor',[hist1],[{...first,previousActionId:'FOREIGN'}],true);
scenario('skipped followup sequence',[hist1],[{...first,id:'AUTO-RETENTION-RECHECK-R1-2'}],true);
scenario('foreign source case',[hist1],[{...first,originCaseId:'OTHER'}],true);
scenario('foreign workplace',[hist1],[{...first,workplace:'B라인'}],true);
scenario('foreign original auditor',[hist1],[{...first,initialAuditor:'other@hd.com'}],true);
scenario('history says suitable',[{...hist1,result:'적합'}],[first],true);
console.log('Retention recheck history chain: 14/14 cases passed');
