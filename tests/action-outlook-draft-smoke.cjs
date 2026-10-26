const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('action-mail-workflow.js','utf8');
const from=source.indexOf('function deepLink(id){');
const to=source.indexOf('/* 실제 자동발송:',from);
assert(from>=0&&to>from,'mail draft helpers must exist');
const script=source.slice(from,to);
const windows=[];
const context={
 URL,encodeURIComponent,
 location:{href:'https://hastom79-hue.github.io/hd-20/?area=action'},
 window:{open:(url,target,features)=>windows.push({url,target,features})},
 localStorage:{getItem:k=>k==='gmes5s_mailing_master_v1'?JSON.stringify([{enabled:true,cc:'reviewer@example.com'}]):null},
 alert:()=>{throw Error('unexpected missing recipient')}
};
vm.createContext(context);
vm.runInContext(script,context);
const record={id:'IMP-20261026-293',team:'대형 Att.팀',workplace:'조립라인 A',requestSource:'자율 5S Audit',problem:'불용, 불급품 과잉 장기 보관 중',due:'2026-10-29',email:'team01@example.com'};
context.openOutlookWeb(record);
assert.equal(windows.length,1);
const u=new URL(windows[0].url);
assert.equal(u.hostname,'outlook.office.com');
assert.equal(u.pathname,'/mail/deeplink/compose');
assert.equal(u.searchParams.get('to'),record.email);
assert.equal(u.searchParams.get('cc'),'reviewer@example.com');
assert.match(u.searchParams.get('subject'),/IMP-20261026-293/);
const body=u.searchParams.get('body');
for(const value of [record.requestSource,record.team,record.workplace,record.problem,record.due,'actionId=IMP-20261026-293','#action-response'])assert(body.includes(value),'missing email body field: '+value);
assert(source.includes('<option value="outlook" selected>Outlook 메일 초안 자동 생성 (기본)</option>'));
assert(source.includes("$('#amRegister',a).onclick=()=>register(a,$('#amSendVia',a)?.value||'outlook')"));
console.log('ACTION_OUTLOOK_DRAFT_SMOKE_PASS');
