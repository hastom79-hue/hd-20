'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('audit-as-is-to-be-manager.js','utf8');
const beginning=src.indexOf('const close=()=>{');
const ending=src.indexOf(';overlay.querySelectorAll',beginning);
assert(beginning>=0&&ending>beginning,'real modal close guard exists');
const closeExpression=src.slice(beginning,ending);
const getClose=new Function('overlay','saving',closeExpression+';return close;');
function caseOf(name,busy,ariaBusy,expectedRemoved){
 let removed=0;
 const overlay={querySelector:()=>ariaBusy?{}:null,remove:()=>removed++};
 getClose(overlay,busy)();
 assert.equal(removed,expectedRemoved,name);
 console.log('PASS '+name);
}
caseOf('normal close',false,false,1);
caseOf('saving in progress',true,false,0);
caseOf('aria-busy control',false,true,0);
{
 let removed=0;
 const overlay={querySelector:()=>({}),remove:()=>removed++};
 getClose(overlay,true)(true);
 assert.equal(removed,1,'successful save must close busy modal');
 console.log('PASS successful save closes modal');
}
assert(src.includes("window.dispatchEvent(new CustomEvent('hd20-action-updated',{detail:{source:'audit-tobe',id}}));close(true)"),'successful save explicitly uses forced close');
const guard='if(!overlay.isConnected||document.getElementById(MID)!==overlay)return;let registrationDateTime=';
assert(src.includes(guard),'pending file-read continuation must stop if modal is replaced or detached');
const photoRead=src.indexOf('photo=await new Promise(');
const guardPos=src.indexOf(guard);
const writePos=src.indexOf('localStorage.setItem(KEY,JSON.stringify(data))',guardPos);
assert(photoRead>=0&&photoRead<guardPos&&guardPos<writePos,'modal lifecycle verified between async file read and storage write');
console.log('PASS modal replacement cannot continue after file read');
console.log('TO-BE modal lifecycle 5/5 scenarios passed');
