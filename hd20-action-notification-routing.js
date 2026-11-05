/* Corrective notification routing: request registered -> production team;
 * TO-BE action submitted -> original requester. No invented phone/email. */
(()=>{'use strict';
const KEY='hd20ActionCasesV2';
function records(){try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x:[]}catch{return[]}}
function setNotice(id,stage,channel,patch){const r=records(),matches=r.map((x,i)=>String(x.id||'')===String(id||'')?i:-1).filter(i=>i>=0);if(matches.length!==1){console.error('[HD20 알림 이력 저장 차단] 개선조치 ID 누락·중복',{id,matched:matches.length});return;}const i=matches[0];const n={...(r[i].notificationAudit||{})};n[stage]={...(n[stage]||{}),[channel]:{...(n[stage]?.[channel]||{}),...patch}};r[i]={...r[i],notificationAudit:n};try{localStorage.setItem(KEY,JSON.stringify(r))}catch(e){console.error('[HD20 알림 이력 기록 실패]',e)}}
const emailOkay=x=>/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(x||''));
function recipient(record,stage){
 if(stage==='REQUEST'){const email=String(record.email||'').trim();return {email,phone:String(record.teamPhone||'').trim()}}
 // The original requester is not necessarily the actor completing TO-BE.
 return {email:String(record.requesterEmail||record.requestEmail||'').trim(),phone:String(record.requesterPhone||'').trim()};
}
async function notify(id,stage){
 const matches=records().filter(x=>String(x.id||'')===String(id||''));
 if(!String(id||'').trim()||matches.length!==1){
  console.error('[HD20 알림 차단] 개선조치 ID 누락·중복 또는 원본 없음', {id,matched:matches.length});
  window.dispatchEvent(new CustomEvent('hd20-notification-blocked',{detail:{id,stage,reason:'non-unique-action-id',matched:matches.length}}));
  return;
 }
 const record=matches[0];
 const dest=recipient(record,stage);
 const title=stage==='REQUEST'?'개선조치 요청 등록':'TO-BE 조치등록 결과';
 const subject='[5S 활동관리] '+title+' / '+id;
 const body=stage==='REQUEST'?
  '개선조치 요청이 등록되었습니다.\n생산팀: '+String(record.team||'')+'\n관리번호: '+id+'\n요청사항: '+String(record.problem||'')+'\n\nHD-20 시스템에서 조치계획을 확인해 주세요.':
  '요청하신 개선조치의 TO-BE 조치내용이 등록되었습니다.\n관리번호: '+id+'\n생산팀: '+String(record.team||'')+'\n조치내용: '+String(record.toBePlan||record.actionText||'')+'\n조치상태: '+String(record.status||'')+'\n\nHD-20 시스템에서 결과를 확인해 주세요.';
 const current=record.notificationAudit?.[stage]||{};
 if(current.email?.status!=='sent'){
  const cfg=window.HD20_EMAILJS_CONFIG;
  if(!emailOkay(dest.email))setNotice(id,stage,'email',{status:'missing-recipient',updatedAt:new Date().toISOString()});
  else if(!window.emailjs||!cfg?.serviceId||!cfg?.templateId)setNotice(id,stage,'email',{status:'not-configured',updatedAt:new Date().toISOString()});
  else{
   try{
    setNotice(id,stage,'email',{status:'sending',updatedAt:new Date().toISOString()});
    await window.emailjs.send(cfg.serviceId,cfg.templateId,{to_email:dest.email,subject,message:body,name:'5S 활동관리시스템'});
    setNotice(id,stage,'email',{status:'sent',recipient:dest.email,sentAt:new Date().toISOString()});
   }catch(e){console.error('[HD20 자동메일 실패]',e);setNotice(id,stage,'email',{status:'failed',updatedAt:new Date().toISOString(),reason:String(e?.text||e?.message||'send failed').slice(0,200)})}
  }
 }
 if(current.sms?.status!=='sent'){
  // SMS requires a real registered server-side provider, never claim transmission from UI.
  const provider=window.HD20_SMS_GATEWAY;
  if(!dest.phone)setNotice(id,stage,'sms',{status:'missing-recipient',updatedAt:new Date().toISOString()});
  else if(!provider||typeof provider.send!=='function')setNotice(id,stage,'sms',{status:'not-configured',updatedAt:new Date().toISOString()});
  else{
   try{
    setNotice(id,stage,'sms',{status:'sending',updatedAt:new Date().toISOString()});
    const result=await provider.send({to:dest.phone,message:subject+'\n'+body,idempotencyKey:'HD20:'+stage+':'+id});
    if(!result||result.success!==true)throw Error('SMS provider did not confirm transmission');
    setNotice(id,stage,'sms',{status:'sent',sentAt:new Date().toISOString()});
   }catch(e){console.error('[HD20 SMS 실패]',e);setNotice(id,stage,'sms',{status:'failed',updatedAt:new Date().toISOString()})}
  }
 }
 window.dispatchEvent(new CustomEvent('hd20-notification-updated',{detail:{id,stage}}));
}
const inflight=new Set();
function sendOnce(id,stage){const k=id+':'+stage;if(inflight.has(k))return;inflight.add(k);notify(id,stage).finally(()=>inflight.delete(k))}
window.HD20_ACTION_NOTIFIER={sendOnce};
window.addEventListener('hd20-action-updated',e=>{
 const source=e.detail?.source,id=e.detail?.id;if(!id)return;
 if(source==='action-mail-register'&&e.detail?.via!==false)sendOnce(String(id),'REQUEST');
 if(source==='audit-tobe')sendOnce(String(id),'TOBE');
});
})();