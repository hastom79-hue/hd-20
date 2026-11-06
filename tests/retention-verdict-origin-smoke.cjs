'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const src=fs.readFileSync('hd20-subtabs.js','utf8');
const a=src.indexOf(' const originalRows=rows[n].kind==='),b=src.indexOf(" box.dataset.rsSaving='1';",a);
assert(a>=0&&b>a,'original completion verification precedes retention verdict persistence');
const check=new Function('rows','n','load','keyOf','excluded','done','window',src.slice(a,b)+'return true;');
const rec={kind:'개선요청',caseId:'A1',team:'조립',workplace:'A라인',result:'점검대기'};
const action={id:'A1',status:'완료',team:'조립',workplace:'A라인'};
function scenario(name,originals,expected){
 const alerts=[],res=check([rec],0,k=>k==='hd20ActionCasesV2'?originals:[],x=>String(x.id||''),()=>false,x=>x.status==='완료',{alert:m=>alerts.push(m)});
 assert.equal(res===true,expected,name);
 assert.equal(alerts.length,expected?0:1,name+' alert');
}
scenario('one unchanged completed original',[action],true);
scenario('deleted source',[],false);
scenario('duplicated ID',[action,action],false);
scenario('original reopened',[{...action,status:'진행중'}],false);
scenario('team changed',[{...action,team:'다른팀'}],false);
scenario('workplace changed',[{...action,workplace:'B라인'}],false);
console.log('Retention verdict original source 6/6 scenarios passed');
