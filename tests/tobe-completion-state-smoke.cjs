'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const js=fs.readFileSync('audit-as-is-to-be-manager.js','utf8');
const start=js.indexOf('let old=localStorage.getItem(KEY),next=');
const end=js.indexOf('data[ix]=next;',start);
assert(start>=0&&end>start,'TO-BE update payload');
const build=new Function('localStorage','KEY','data','ix','overlay','p','owner','registrationDateTime','leadAtSave','complete','dt','photo','after',js.slice(start,end)+';return next;');
const original={id:'R1',status:'진행중',completed:false,toBeRegisteredAt:'2026-11-01T00:00:00Z'};
function scenario(complete){
 const store={getItem:()=>JSON.stringify([original])};
 const inputs={'[data-due]':{value:'2026-11-09'},'[data-comment]':{value:'field verified'}};
 const overlay={querySelector:key=>inputs[key]};
 const next=build(store,'key',[original],0,overlay,'corrective action','engineer','2026-11-07T00:00:00Z',4,complete,'2026-11-07','data:image/png;base64,a',x=>x.after||'');
 assert.equal(next.completed,complete,'completed boolean synchronizes with status');
 assert.equal(next.status,complete?'완료':'진행중','display status');
 if(complete){
  assert.equal(next.doneStatus,'완료','completion status');
  assert.equal(next.doneDate,'2026-11-07','date');
  assert.equal(next.completedAt,'2026-11-07','completion timestamp');
 }else{assert.equal(next.doneStatus,undefined,'draft does not invent completed status')}
}
scenario(true);scenario(false);
assert(js.includes('savedMatches[0].completed!==complete'),'saved status flag verified');
assert(js.includes('savedMatches[0].completedAt!==dt'),'saved completion date verified');
assert(js.includes('!after(savedMatches[0])'),'saved evidence verified');
console.log('TO-BE completion-state consistency: 5/5 checks passed');
