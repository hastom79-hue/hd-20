'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('audit-as-is-to-be-manager.js','utf8');
const beginning=src.indexOf('const close=(afterSave=false)=>{');
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
// A browser onclick callback receives an event as its first argument; never pass
// that event into close(afterSave), where truthiness would bypass the busy guard.
const closeButtonBinding="overlay.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>close());";
assert(src.includes(closeButtonBinding),'close buttons must discard click event rather than forwarding it as afterSave');
{
 let removed=0;
 const overlay={querySelector:()=>null,remove:()=>removed++};
 const close=getClose(overlay,true);
 const buttons=[{},{}];
 const bind=new Function('overlay','close',closeButtonBinding);
 bind({querySelectorAll:()=>buttons},close);
 for(const button of buttons)button.onclick({type:'click'});
 assert.equal(removed,0,'click events must not bypass the pending-save close guard');
 console.log('PASS close button click events preserve saving guard');
}
assert(src.includes("window.dispatchEvent(new CustomEvent('hd20-action-updated',{detail:{source:'audit-tobe',id}}));close(true)"),'successful save explicitly uses forced close');
const guard='if(!overlay.isConnected||document.getElementById(MID)!==overlay)return;let registrationDateTime=';
assert(src.includes(guard),'pending file-read continuation must stop if modal is replaced or detached');
const photoRead=src.indexOf('photo=await new Promise(');
const guardPos=src.indexOf(guard);
const writePos=src.indexOf('localStorage.setItem(KEY,JSON.stringify(data))',guardPos);
assert(photoRead>=0&&photoRead<guardPos&&guardPos<writePos,'modal lifecycle verified between async file read and storage write');
console.log('PASS modal replacement cannot continue after file read');
const switchStart=src.indexOf('const c=matches[0];const currentOverlay=');
const switchEnd=src.indexOf('currentOverlay?.remove();',switchStart);
assert(switchStart>=0&&switchEnd>switchStart,'case-switch save guard source exists');
const switchFragment=src.slice(switchStart,switchEnd+'currentOverlay?.remove();'.length);
function attemptSwitch(isBusy){
 let removed=0,notices=[];
 const oldOverlay={querySelector:()=>isBusy?{disabled:true}:null,remove:()=>removed++};
 const document={getElementById:()=>oldOverlay};
 const window={alert:message=>notices.push(message)};
 new Function('matches','document','MID','window',switchFragment+';return true;')([{id:'A1'}],document,'tobeDialog',window);
 return {removed,notices};
}
let waiting=attemptSwitch(true);
assert.equal(waiting.removed,0,'switch while saving must not remove old modal');
assert.equal(waiting.notices.length,1,'switch while saving explains blocking');
console.log('PASS switching TO-BE case while save is active');
let idle=attemptSwitch(false);
assert.equal(idle.removed,1,'switch after save must remove previous modal');
assert.equal(idle.notices.length,0,'idle case switch has no warning');
console.log('PASS switching TO-BE case after save');
const crossTabHook="window.addEventListener('storage',e=>{if(e.key!==KEY)return;if(window.HD20_NAV?.active?.()==='activity'&&document.getElementById('awActivity')?.dataset.subview==='tobe')render()})";
assert(src.includes(crossTabHook),'cross-tab action updates must refresh only the active TO-BE view');
console.log('PASS active TO-BE view cross-tab storage refresh is scoped to action records');
console.log('TO-BE modal lifecycle 9/9 scenarios covered');
