/* Regression: dashboard KPI labels and counts must match click-through evidence for every workflow subtab. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const raw={
 hd20GMES5SAutoImproveRawV1:[
  {id:'5S-1',type:'5S 고도화',candidate:true,confirmed:true,judgeState:'확정',status:'확정',team:'조립'},
  {id:'5S-2',type:'5S 고도화',candidate:true,judgeState:'판정대기',status:'판정대기',team:'용접'},
  {id:'DEMO-5S-3',type:'5S 고도화',candidate:true,judgeState:'판정대기',isDemo:true}
 ],
 hd20AuditRandomDrawsV1:[
  {id:'AUD-1',team:'조립'},
  {id:'AUD-2',team:'용접',auditDate:'2026-10-27',auditResult:'부적합'},
  {id:'DEMO-AUD-3',isDemo:true}
 ],
 hd20ActionCasesV2:[
  {id:'ACTION-1',status:'진행',auditDrawId:'AUD-2'},
  {id:'ACTION-2',status:'완료',dueDate:'2026-10-20',doneDate:'2026-10-22',effectVerified:true},
  {id:'DEMO-ACTION-3',isDemo:true}
 ]
};
const before=JSON.stringify(raw);
const document={readyState:'loading',addEventListener(){}};
const localStorage={getItem(k){return JSON.stringify(raw[k]||[])}};
const window={
 HD20KPIData:{
  snapshot:()=>({activities:raw.hd20GMES5SAutoImproveRawV1.filter(x=>!x.isDemo)}),
  isNonProdRow:x=>x.isDemo===true||String(x.id||'').startsWith('DEMO-'),
  isCandidate:x=>!!x.candidate,
  isConfirmed:x=>!!x.confirmed
 }
};
const context=vm.createContext({window,document,localStorage,console,setTimeout(){}});
for(const file of ['hd20-kpi-evidence-drill.js','dashboard-work-kpi-migration.js']){
 vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
}
const groups={audit:['draw','ongoing','retention'],action:['manage','leadtime','verify'],advancement:['judge','standard']};
let count=0;
for(const [area,subs] of Object.entries(groups)){
 for(const sub of subs){
  const cards=window.HD20_DASHBOARD_WORK_METRICS.rows(area,sub);
  assert.ok(cards&&cards.length===4,'4 KPI cards expected: '+area+'.'+sub);
  for(let i=0;i<4;i++){
   const evidence=window.HD20_KPI_EVIDENCE.evidence(area,sub,i);
   assert.equal(cards[i][0],evidence.title,'title mismatch: '+area+'.'+sub+'.'+i);
   assert.equal(cards[i][1],evidence.rows.length,'count mismatch: '+area+'.'+sub+'.'+i);
   assert.equal(cards[i][2],'건','unit mismatch: '+area+'.'+sub+'.'+i);
   count++;
  }
 }
}
assert.equal(count,32);
assert.equal(window.HD20_DASHBOARD_WORK_METRICS.rows('dashboard','summary'),null);
assert.equal(JSON.stringify(raw),before,'KPI must not mutate operational source records');
console.log('DASHBOARD_KPI_EVIDENCE_CONTRACT_PASS '+count+' indicators across 8 subtabs');
