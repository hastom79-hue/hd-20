'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('audit-as-is-to-be-manager.js','utf8');
const a=src.indexOf('function open(id){');
const b=src.indexOf('const currentOverlay=document.getElementById(MID);',a);
assert(a>=0&&b>a,'TO-BE popup unique-ID gate exists');
const section=src.slice(a+'function open(id){'.length,b);
const openGuard=new Function('id','rows','key','alert',section+';return c');
let messages=[];
const alert=x=>{messages.push(x)};
const key=x=>String(x.id||x.caseId||x.improvementNo||'');
function verify(name,data,id,expected){
 messages=[];const record=openGuard(id,()=>data,key,alert);
 assert.equal(record?.id,expected,name+' record');
 assert.equal(messages.length,expected?0:1,name+' error notice');
 console.log('PASS '+name);
}
verify('unique TO-BE ID',[{id:'TO-001'}],'TO-001','TO-001');
verify('duplicate TO-BE ID',[{id:'TO-001'},{id:'TO-001'}],'TO-001',undefined);
verify('missing TO-BE ID',[{id:'TO-002'}],'TO-001',undefined);
verify('empty TO-BE ID',[{id:'TO-001'}],'',undefined);
assert(src.includes('if(indices.length!==1){err.textContent='),'save blocked for duplicate/missing cases');
assert(src.includes('if(savedMatches.length!==1||savedMatches[0].toBePlan!==p'),'post-save uniqueness verified');
assert(src.includes("savedMatches[0].status!==(complete?'완료':'진행중')"),'post-save status verified');
assert(src.includes("savedMatches[0].doneStatus!=='완료'"),'post-save completion verified');
assert(src.includes('if(saving||!overlay.isConnected)return'),'double-save guard preserved');
console.log('PASS unique save and post-save guards present');
