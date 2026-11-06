'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync('theme-inspection.js','utf8');
assert(!source.includes('if(!dup.initialAuditor)dup.initialAuditor='),'original inspector may not be overwritten');
const a=source.indexOf(' // Verify persisted bi-directional references');
const b=source.indexOf(" window.dispatchEvent(new CustomEvent('hd20-action-updated'",a);
assert(a>=0&&b>a,'persistence verification before success event');
const verify=new Function('loadChecks','load','rec','localStorage','ACT_KEY','originalActions','saveChecks','checks','console','alert',source.slice(a,b)+'return true;');
const rec={id:'AUD-2',initialAuditor:'later',linkedActionIds:['ACT-1']};
const origin={id:'AUD-1',initialAuditor:'first'};
const action={id:'ACT-1',sourceStage:'THEME-AUDIT',sourceCaseId:'AUD-1',auditRecordId:'AUD-1',initialAuditor:'first',lastAuditRecordId:'AUD-2',lastAuditAuditor:'later',relatedAuditRecordIds:['AUD-1','AUD-2']};
function scenario(name,changeAction,changeRecord,blocked){
 const actions=[{...action,...changeAction}],checks=[origin,{...rec,...changeRecord}],alerts=[],mutations=[];
 const result=verify(()=>checks,()=>actions,rec,{setItem:(...args)=>mutations.push(args)},'actions','old',()=>true,checks,{error:()=>{}},x=>alerts.push(x));
 assert.equal(result===undefined,blocked,name);
 assert.equal(alerts.length,blocked?1:0,name+' alert');
 if(blocked)assert.equal(mutations.length,1,name+' rollback');
}
scenario('valid relink',{},null,false);
scenario('inspector overwritten',{initialAuditor:'later'},null,true);
scenario('foreign final auditor',{lastAuditAuditor:'foreign'},null,true);
scenario('related audit missing',{relatedAuditRecordIds:['AUD-1']},null,true);
scenario('source id corrupted',{sourceCaseId:'OTHER'},null,true);
scenario('saved audit list missing',{}, {linkedActionIds:[]},true);
scenario('saved audit inspector overwritten',{}, {initialAuditor:'foreign'},true);
console.log('Theme persistence relink provenance 7/7');
