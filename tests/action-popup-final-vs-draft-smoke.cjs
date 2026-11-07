'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('action-register-modal.js','utf8');
const begin=src.indexOf("window.addEventListener('hd20-action-register-success'");
const end=src.indexOf(";window.addEventListener('hd20-audit-to-action'",begin);
assert(begin>=0&&end>begin,'registration completion listener not found');
for(const [label,via,expected] of [['temporary',false,0],['final',true,1],['default',undefined,1]]){
  let handler,removed=0,closed=0;
  const window={addEventListener:(event,callback)=>{assert.equal(event,'hd20-action-register-success');handler=callback}};
  const localStorage={removeItem:key=>{assert.equal(key,'hd20ActionPopupDraftV1');removed++}};
  const modal={classList:{contains:()=>true}};
  new Function('window','localStorage','modal','close',src.slice(begin,end+1))(window,localStorage,modal,()=>closed++);
  assert.equal(typeof handler,'function','completion listener must register');
  handler({detail:{via}});
  assert.equal(removed,expected,label+' draft removal');
  assert.equal(closed,expected,label+' modal close');
}
const mailWorkflow=fs.readFileSync('action-mail-workflow.js','utf8');
const entry=fs.readFileSync('index.html','utf8');
assert(mailWorkflow.includes("});$$('[data-del]',body).forEach"),'delete buttons must use querySelectorAll');
assert(!mailWorkflow.includes("});$('[data-del]',body).forEach"),'single query crashes on null.forEach');
assert(entry.includes('action-mail-workflow.js?v=20261108-null-foreach-fix-v17'),'action list startup repair cache key must be current');
console.log('PASS: temporary saves retain draft and modal; final registration clears and closes');
