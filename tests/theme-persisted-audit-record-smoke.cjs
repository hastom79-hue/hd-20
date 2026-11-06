'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('theme-inspection.js','utf8');
const begin=src.indexOf(' const savedChecks=loadChecks(),persistedMatches=');
const end=src.indexOf(' if(savedRec){Object.assign(savedRec,',begin);
assert(begin>=0&&end>begin,'persisted theme audit guard');
const check=new Function('loadChecks','rec','localStorage','ACT_KEY','originalActions','saveChecks','checks','console','alert',src.slice(begin,end)+'return true;');
function scenario(label,records,accepted){
 const state={actions:'changed',checks:'changed'},alerts=[];
 const storage={setItem:(key,val)=>state[key]=val};
 const answer=check(()=>records,{id:'AUDIT-1'},storage,'actions','original-actions',()=>{state.checks='restored';return true},[{id:'AUDIT-1'}],{error:()=>{}},message=>alerts.push(message));
 assert.equal(answer===true,accepted,label);
 assert.equal(alerts.length,accepted?0:1,label+' warning');
 if(!accepted){assert.equal(state.actions,'original-actions',label+' restored actions');assert.equal(state.checks,'restored',label+' restored checks')}
}
scenario('persisted one record',[{id:'AUDIT-1'}],true);
scenario('persisted missing',[],false);
scenario('persisted duplicate',[{id:'AUDIT-1'},{id:'AUDIT-1'}],false);
scenario('persisted foreign ID',[{id:'OTHER'}],false);
console.log('Theme saved Audit source: 4/4 scenarios passed');
