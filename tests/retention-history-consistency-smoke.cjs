'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('hd20-subtabs.js','utf8');
const begin=src.indexOf(' const recheckHistory=rows[n].recheckHistory;');
const end=src.indexOf(' const sequence=a=>',begin);
assert(begin>=0&&end>begin,'recheck history/action count guard located');
const snippet=src.slice(begin,end);
function scenario(label,history,followups,shouldBlock){
 const rows=[{recheckHistory:history}];const n=0,historyActions=Array.from({length:followups},(_,i)=>({id:'F'+(i+1)}));
 const box={dataset:{rsSaving:'1'},querySelectorAll:()=>[{disabled:true}]};
 const alerts=[];
 const fn=new Function('rows','n','historyActions','box','window',snippet+';return true;');
 const actual=fn(rows,n,historyActions,box,{alert:x=>alerts.push(x)});
 assert.equal(actual===undefined,shouldBlock,label);
 assert.equal(alerts.length,shouldBlock?1:0,label+' warning');
 if(shouldBlock)assert.equal(box.dataset.rsSaving,'',label+' unlock');
}
scenario('first recheck, no history',undefined,0,false);
scenario('first recheck, empty history',[],0,false);
scenario('one paired failed recheck',[{}],1,false);
scenario('two paired failed rechecks',[{},{}],2,false);
scenario('orphan followup',[],1,true);
scenario('missing followup',[{}],0,true);
scenario('corrupt object history',{length:1},1,true);
scenario('corrupt string history','invalid',0,true);
console.log('Retention history-action consistency 8/8 scenarios passed');
