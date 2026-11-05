'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('hd20-action-notification-routing.js','utf8');
async function scenario(name,rows,expectedEmails,expectedBlocked,stage='REQUEST'){
 const store=new Map([['hd20ActionCasesV2',JSON.stringify(rows)]]);
 const events=[];const emails=[];const sms=[];
 class CustomEvent {constructor(type,options={}){this.type=type;this.detail=options.detail}}
 const handlers=new Map();
 const localStorage={getItem:key=>store.get(key)||null,setItem:(key,value)=>{store.set(key,value)}};
 const window={
  HD20_EMAILJS_CONFIG:{serviceId:'test',templateId:'test'},
  emailjs:{send:async (...args)=>{emails.push(args);return {status:200}}},
  HD20_SMS_GATEWAY:{send:async args=>{sms.push(args);return {success:true}}},
  addEventListener:(type,fn)=>handlers.set(type,fn),
  dispatchEvent:event=>events.push(event)
 };
 vm.runInNewContext(source,{window,localStorage,CustomEvent,console,Date,Set,Promise});
 window.HD20_ACTION_NOTIFIER.sendOnce('A1',stage);
 for(let i=0;i<8;i++)await new Promise(resolve=>setImmediate(resolve));
 assert.equal(emails.length,expectedEmails,name+' email count');
 assert.equal(events.filter(x=>x.type==='hd20-notification-blocked').length,expectedBlocked,name+' blocked count');
 const after=JSON.parse(store.get('hd20ActionCasesV2'));
 if(expectedBlocked)assert.ok(after.every(x=>!x.notificationAudit),name+' no writes when blocked');
 if(expectedEmails)assert.equal(after[0].notificationAudit[stage].email.status,'sent',name+' persisted email status');
 console.log('PASS '+name);
}
(async()=>{
 const base={id:'A1',team:'조립',email:'team@example.com',teamPhone:'01000001111',requesterEmail:'requester@example.com',requesterPhone:'01000002222'};
 await scenario('unique request',[base],1,0);
 await scenario('duplicate ID blocked',[base,{...base,email:'other@example.com'}],0,1);
 await scenario('missing ID blocked',[{...base,id:'A2'}],0,1);
 await scenario('empty store blocked',[],0,1);
 await scenario('unique TOBE',[base],1,0,'TOBE');
 console.log('Notification routing smoke tests: 5 passed');
})().catch(error=>{console.error(error);process.exitCode=1});
