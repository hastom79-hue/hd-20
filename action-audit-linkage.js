(()=>{'use strict';
const CASE_KEY='hd20ActionCasesV2',POLICY_KEY='hd20OperatingPolicyV1',PENDING_KEY='hd20ActionAuditLinkPendingV1',LEGACY_PENDING_KEY='hd20AuditToActionPending';
const REGISTER_IDS=new Set(['amRegister','amRegisterOutlook','amRegisterAuto']);
let pendingSource=null,registerAttempt=null;
function loadCases(){try{const v=JSON.parse(localStorage.getItem(CASE_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function saveCases(v){localStorage.setItem(CASE_KEY,JSON.stringify(v))}
function seoulDate(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
function deadlineDays(){const fromApi=window.HD20PolicyConfig?.deadlineDays?.();if(fromApi!=null)return fromApi;try{const p=JSON.parse(localStorage.getItem(POLICY_KEY)||'{}').improvementDeadline||{},raw=p.defaultDays,n=raw==null||raw===''?NaN:Number(raw);return Number.isInteger(n)&&n>=7&&n<=14?n:null}catch{return null}}
function addDays(v,n){const m=String(v||'').trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!m||!Number.isFinite(n))return'';const ms=Date.UTC(+m[1],+m[2]-1,+m[3])+Math.round(n)*86400000;return new Date(ms).toISOString().slice(0,10)}
function readPending(){if(pendingSource)return pendingSource;try{const v=JSON.parse(sessionStorage.getItem(PENDING_KEY)||'null');return v&&typeof v==='object'?v:null}catch{return null}}
function setPending(p){if(!p||typeof p!=='object')return;pendingSource={auditDrawId:String(p.auditDrawId||p.sourceCaseId||'').trim(),sourceStage:String(p.sourceStage||'AUDIT-CHECKLIST').trim(),team:String(p.team||'').trim(),workplace:String(p.workplace||'').trim(),problem:String(p.problem||'').trim(),auditDate:String(p.auditDate||'').trim(),initialAuditor:String(p.initialAuditor||p.auditor||p.registeredBy||'').trim()};if(!pendingSource.auditDrawId)return;sessionStorage.setItem(PENDING_KEY,JSON.stringify(pendingSource))}
function originalAuditor(source){const id=String(source?.auditDrawId||'').trim();let draw=null;try{const rows=JSON.parse(localStorage.getItem('hd20AuditRandomDrawsV1')||'[]');if(Array.isArray(rows))draw=rows.find(d=>String(d.id||'')===id)}catch{}return String(draw?.initialAuditor||draw?.auditor||source?.initialAuditor||source?.auditor||source?.registeredBy||'').trim()}
function clearPending(){pendingSource=null;sessionStorage.removeItem(PENDING_KEY);sessionStorage.removeItem(LEGACY_PENDING_KEY)}
function autoDue(form){const date=form?.querySelector('#amDate')?.value,due=form?.querySelector('#amDue'),days=deadlineDays();if(!due||days===null||!date)return'';const value=addDays(date,days);if(value&&!due.value){due.value=value;due.dataset.hd20AutoDue='1'}return value}
function patchCreated(beforeIds,sourceSnapshot,manualDue,createdId='',replacedId='',trustedReplacement=false){const all=loadCases(),exactId=String(createdId||'').trim(),oldId=String(replacedId||'').trim(),unseen=all.filter(c=>!beforeIds.has(String(c.id))),exactMatches=exactId?all.filter(c=>String(c.id)===exactId):[],unseenExact=exactId?unseen.filter(c=>String(c.id)===exactId):[],created=exactId?(unseenExact.length===1?unseenExact[0]:(trustedReplacement&&oldId&&beforeIds.has(oldId)&&exactMatches.length===1?exactMatches[0]:null)):(unseen.length===1?unseen[0]:null);if(!created)return false;const days=deadlineDays();if(sourceSnapshot?.auditDrawId){created.sourceCaseId=sourceSnapshot.auditDrawId;created.auditDrawId=sourceSnapshot.auditDrawId;created.sourceStage=sourceSnapshot.sourceStage||'AUDIT-CHECKLIST';created.source=created.source||'5S Audit 점검항목';created.sourceAuditDate=sourceSnapshot.auditDate||created.sourceAuditDate||'';const first=originalAuditor(sourceSnapshot);if(first){created.initialAuditor=first;created.auditor=first;created.registeredBy=first;created.registrant=first}}
created.registeredAt=created.registeredAt||created.startDate||created.date||seoulDate();
if(!created.due&&!manualDue&&days!==null){created.due=addDays(created.registeredAt,days);created.targetDate=created.due}
if(manualDue){created.autoDueDays=null;created.autoDueAssigned=false;created.autoDuePolicyState='수동지정'}else if(created.due&&days!==null&&created.due===addDays(created.registeredAt,days)){created.autoDueDays=days;created.autoDueAssigned=true;created.autoDuePolicyState='자동지정'}else if(created.due){created.autoDueDays=null;created.autoDueAssigned=false;created.autoDuePolicyState='수동지정'}else{created.autoDueDays=null;created.autoDueAssigned=false;created.autoDuePolicyState='정책미설정'}
saveCases(all);window.dispatchEvent(new CustomEvent('hd20-action-updated',{detail:{source:'audit-action-linkage',id:created.id,sourceCaseId:created.sourceCaseId||''}}));if(sourceSnapshot?.auditDrawId)clearPending();return true}
function captureRegister(e){const btn=e.target?.closest?.('button');if(!btn||!REGISTER_IDS.has(btn.id))return;const form=document.getElementById('awAction');if(!form)return;const due=form.querySelector('#amDue'),manualDue=!!(due?.value&&due.dataset.hd20AutoDue!=='1');autoDue(form);const attempt={beforeIds:new Set(loadCases().map(c=>String(c.id))),sourceSnapshot:readPending()?{...readPending()}:null,manualDue,done:false};registerAttempt=attempt;setTimeout(()=>{if(registerAttempt!==attempt||attempt.done)return;if(patchCreated(attempt.beforeIds,attempt.sourceSnapshot,attempt.manualDue))attempt.done=true;if(registerAttempt===attempt)registerAttempt=null},0)}

/* Audit 원본 ↔ 개선조치 실행 모니터링. 기존 원천/이력 스키마는 보존한다. */
const AUDIT_KEY='hd20AuditRandomDrawsV1',TEAM_KEY='hd20TeamLeaderMasterV1';
const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;'}[c]));
const txt=v=>String(v??'').trim();
function audits(){try{const x=JSON.parse(localStorage.getItem(AUDIT_KEY)||'[]');return Array.isArray(x)?x:[]}catch{return[]}}
function sessionEmail(){try{const x=JSON.parse(localStorage.getItem('hd20_company_session_v1')||'null');return x&&Number(x.expiresAt)>Date.now()?txt(x.email).toLowerCase():''}catch{return''}}
function teamRecipient(team){try{const a=JSON.parse(localStorage.getItem(TEAM_KEY)||'[]');const x=Array.isArray(a)?a.find(v=>txt(v.team)===txt(team)):null;return /^[^@\s]+@hd\.com$/i.test(txt(x?.email))?txt(x.email):''}catch{return''}}
function auditActions(){return loadCases().filter(a=>a.sourceStage==='AUDIT-REQUEST'&&txt(a.auditDrawId||a.sourceCaseId)).sort((a,b)=>txt(b.registeredAt||b.date||b.created).localeCompare(txt(a.registeredAt||a.date||a.created)))}
function themeActions(){return loadCases().filter(a=>a.sourceStage==='THEME-AUDIT'||a.source==='테마Audit').sort((a,b)=>txt(b.registeredAt||b.date||b.created).localeCompare(txt(a.registeredAt||a.date||a.created)))}
function workflowAction(id){return loadCases().find(a=>txt(a.id)===txt(id)&&(a.sourceStage==='AUDIT-REQUEST'||a.sourceStage==='THEME-AUDIT'||a.source==='테마Audit'))}
function actionDone(a){const x=txt(a.status||a.actionStatus);return /완료|종료|종결/.test(x)&&!/미완료|대기|예정|진행/.test(x)}
function progress(a){return actionDone(a)?'조치완료':a.receivedAt?'조치중':'미접수'}
function updateAuditAction(id,change){const rows=loadCases(),index=rows.findIndex(x=>txt(x.id)===txt(id)&&(x.sourceStage==='AUDIT-REQUEST'||x.sourceStage==='THEME-AUDIT'||x.source==='테마Audit'));if(index<0)throw Error('Audit 연계 개선조치를 찾을 수 없습니다.');const original=rows[index];if(actionDone(original))throw Error('이미 완료된 개선조치는 수정할 수 없습니다.');rows[index]={...original,...change};const serialized=JSON.stringify(rows);localStorage.setItem(CASE_KEY,serialized);if(localStorage.getItem(CASE_KEY)!==serialized)throw Error('개선조치 저장 검증 실패');window.dispatchEvent(new CustomEvent('hd20-action-updated',{detail:{source:'audit-team-workflow',id}}));return rows[index]}
function canHandleTeam(a){const user=sessionEmail(),to=teamRecipient(a.team).toLowerCase();return !!user&&(user===to||window.HD20MasterAccess?.isMaster?.()===true)}
async function autoNotifyAuditAction(draw){const id=txt(draw?.id);if(!id)return;const a=auditActions().find(x=>txt(x.auditDrawId||x.sourceCaseId)===id);if(!a||a.noticeSentAt||a.notificationState==='발송중')return;const to=teamRecipient(a.team),cfg=window.HD20_EMAILJS_CONFIG;if(!to||!window.emailjs||!cfg?.serviceId||!cfg?.templateId)return;
 const rows=loadCases(),index=rows.findIndex(x=>txt(x.id)===txt(a.id));if(index<0)return;
 rows[index]={...rows[index],notificationState:'발송중',notificationRecipient:to};try{saveCases(rows)}catch{return}
 const subject='[5S Audit 개선조치 통보] '+a.team+' / '+a.id,body='Audit 개선조치 대상입니다.\n\n팀: '+a.team+'\nAudit ID: '+id+'\n개선조치 ID: '+a.id+'\n요청내용: '+a.problem+'\n\n5S 활동관리시스템에서 접수 및 완료 처리 바랍니다.';
 try{await window.emailjs.send(cfg.serviceId,cfg.templateId,{to_email:to,subject,message:body,name:'5S 활동관리시스템'});
  const current=loadCases(),i=current.findIndex(x=>txt(x.id)===txt(a.id));if(i>=0){current[i]={...current[i],noticeSentAt:new Date().toISOString(),notificationState:'발송완료',notificationRecipient:to};saveCases(current)}
 }catch(error){console.error('[HD20 Audit 해당팀 자동통보 실패]',error);const current=loadCases(),i=current.findIndex(x=>txt(x.id)===txt(a.id));if(i>=0&&!current[i].noticeSentAt){current[i]={...current[i],notificationState:'발송실패'};saveCases(current)}}
 window.dispatchEvent(new CustomEvent('hd20-action-updated',{detail:{source:'audit-team-notification',id:a.id}}))
}
function statusBadge(a){const v=progress(a);return '<span class="hadStatus '+(v==='조치완료'?'done':v==='조치중'?'doing':'waiting')+'">'+v+'</span>'}
function tableHtml(area,items){const byAudit=new Map(audits().map(x=>[txt(x.id||x.drawId||x.auditDrawId),x]));return '<div class="hadTableWrap"><table class="hadTable"><thead><tr><th>Audit 번호·점검일</th><th>생산팀 / 작업장</th><th>점검결과</th><th>통보</th><th>접수</th><th>개선조치</th><th>완료일</th><th>업무</th></tr></thead><tbody>'+items.map(a=>{const audit=byAudit.get(txt(a.auditDrawId||a.sourceCaseId))||{},id=txt(a.id),done=actionDone(a),received=!!a.receivedAt;return '<tr><td><button class="hadAuditLink" type="button" data-had-open-audit="'+safe(a.auditDrawId||a.sourceCaseId||a.auditRecordId)+'" data-had-action-id="'+safe(id)+'">'+safe(audit.id||a.auditDrawId||a.sourceCaseId||a.auditRecordId)+'</button><small>'+safe(audit.auditDate||a.auditDate||'—')+'</small><small>'+safe(id)+'</small></td><td>'+safe(a.team||'—')+'<small>'+safe(a.workplace||'—')+'</small></td><td>'+safe(audit.auditResult||'개선요청')+'<small>'+safe(a.problem||audit.improvementRequest||'')+'</small></td><td>'+safe(a.noticeSentAt?'발송확인':'발송 미확인')+'</td><td>'+safe(received?String(a.receivedAt).slice(0,10)+' · '+(a.receivedBy||''):'미접수')+'</td><td>'+statusBadge(a)+(a.sourceStage==='AUDIT-REQUEST'&&auditDueDate(a)?'<small class="hadDue '+(auditIsOverdue(a)?'late':'')+'">'+(auditIsOverdue(a)?'기한경과 · ':'조치기한 · ')+safe(auditDueDate(a))+'</small>':'')+'</td><td>'+safe(a.completedAt?String(a.completedAt).slice(0,10):'—')+'</td><td>'+(!done&&area==='action'?(!received?'<button type="button" data-had-receive="'+safe(id)+'">접수</button>':'<button type="button" data-had-complete="'+safe(id)+'">완료등록</button>'):'')+(!a.noticeSentAt?'<button type="button" data-had-notify="'+safe(id)+'">팀 통보메일</button>':'')+'</td></tr>'}).join('')+'</tbody></table></div>'}
function auditDueDate(a){
 return txt(a.due||a.dueDate||a.targetDate||a.deadline||a.deadlineDate).slice(0,10);
}
function auditIsOverdue(a){
 const due=auditDueDate(a);
 return !actionDone(a)&&/^\d{4}-\d{2}-\d{2}$/.test(due)&&due<seoulDate();
}
function auditActionPriority(a){
 return auditIsOverdue(a)?0:!actionDone(a)&&!a.receivedAt?1:!actionDone(a)?2:3;
}
function renderAuditMonitor(){
 const root=document.getElementById('awAudit');if(!root)return;
 let box=root.querySelector('#hd20AuditActionMonitor');
 if(!box){box=document.createElement('section');box.id='hd20AuditActionMonitor';box.className='hadPanel awCard'}
 // The Audit-specific worklist follows the toolbar. Theme actions remain separate.
 const anchor=root.querySelector(':scope > .awActions')||root.querySelector(':scope > .awHero');
 if(anchor&&anchor.parentElement===root){
   if(anchor.nextElementSibling!==box)anchor.insertAdjacentElement('afterend',box);
 }else if(box.parentElement!==root||root.firstElementChild!==box){root.prepend(box)}
 // This renderer also runs after async action/storage events. Do not reveal its
 // card in tab ①, ③, ④ or ⑤ simply because it was re-created after subnav apply.
 box.classList.toggle('hd20SubHidden',root.dataset.subview!=='action');
 const last={
   team:box.querySelector('[data-had-filter-team]')?.value||'',
   workplace:box.querySelector('[data-had-filter-workplace]')?.value||'',
   state:box.querySelector('[data-had-filter-state]')?.value||'',
   due:box.querySelector('[data-had-filter-due]')?.value||'',
   query:box.querySelector('[data-had-filter-text]')?.value||''
 };
 const items=auditActions(),open=items.filter(a=>!actionDone(a)),pending=open.filter(a=>!a.receivedAt),overdue=open.filter(auditIsOverdue);
 const options=(field)=>[...new Set(items.map(a=>txt(a[field])).filter(Boolean))].sort().map(x=>'<option value="'+safe(x)+'">'+safe(x)+'</option>').join('');
 box.innerHTML='<div class="hadHeading"><div><b>Audit 개선조치 · 접수·완료관리</b><small>기한경과 → 미접수 → 진행 → 완료 순서 · Audit 원본번호 연결</small></div></div>'+
 '<div class="hadFilter"><label>생산팀 <select data-had-filter-team><option value="">전체</option>'+options('team')+'</select></label>'+
 '<label>작업장 <select data-had-filter-workplace><option value="">전체</option>'+options('workplace')+'</select></label>'+
 '<label>조치상태 <select data-had-filter-state><option value="">전체</option><option>미접수</option><option>조치중</option><option>조치완료</option></select></label>'+
 '<label>기한 <select data-had-filter-due><option value="">전체</option><option value="overdue">기한경과</option><option value="undated">기한 미지정</option></select></label>'+
 '<label>관리번호·내용 <input data-had-filter-text placeholder="Audit·개선조치 번호, 내용 검색"></label>'+
 '<button type="button" data-had-filter-reset>초기화</button></div>'+
 '<div class="hadNumbers" aria-label="Audit 개선조치 현황"><span>기한경과 '+overdue.length+'건</span><span>미접수 '+pending.length+'건</span><span>조치중 '+(open.length-pending.length)+'건</span><span>완료 '+(items.length-open.length)+'건</span></div>'+
 '<div class="hadListHead"><b>Audit 개선조치 목록</b><small data-had-filter-count></small></div><div data-had-table></div>';
 for(const [key,value] of Object.entries(last)){
   const field=box.querySelector('[data-had-filter-'+(key==='query'?'text':key)+']');
   if(field&&[...field.options||[]].some(x=>x.value===value)||field&&key==='query')field.value=value;
 }
 const apply=()=>{
   const team=box.querySelector('[data-had-filter-team]').value;
   const workplace=box.querySelector('[data-had-filter-workplace]').value;
   const state=box.querySelector('[data-had-filter-state]').value;
   const due=box.querySelector('[data-had-filter-due]').value;
   const query=txt(box.querySelector('[data-had-filter-text]').value).toLowerCase();
   const filtered=items.filter(a=>(!team||a.team===team)&&(!workplace||a.workplace===workplace)&&(!state||progress(a)===state)&&(!due||(due==='overdue'?auditIsOverdue(a):!auditDueDate(a)))&&(!query||[a.id,a.auditDrawId,a.sourceCaseId,a.problem,a.team,a.workplace].some(v=>txt(v).toLowerCase().includes(query))));
   filtered.sort((a,b)=>auditActionPriority(a)-auditActionPriority(b)||auditDueDate(a).localeCompare(auditDueDate(b))||txt(b.registeredAt||b.date).localeCompare(txt(a.registeredAt||a.date)));
   box.querySelector('[data-had-filter-count]').textContent='조회 '+filtered.length+' / '+items.length+'건';
   box.querySelector('[data-had-table]').innerHTML=filtered.length?tableHtml('action',filtered):'<p class="hadEmpty">조건에 해당하는 Audit 개선조치 내역이 없습니다.</p>';
 };
 box.querySelectorAll('.hadFilter select,.hadFilter input').forEach(el=>el.addEventListener('input',apply));
 box.querySelector('[data-had-filter-reset]').addEventListener('click',()=>{box.querySelectorAll('.hadFilter select,.hadFilter input').forEach(el=>el.value='');apply()});
 apply();
}
function renderTeamQueue(){const root=document.getElementById('awTheme');if(!root)return;const panel=root.querySelector('[data-theme-panel="actions"]');if(!panel)return;let box=panel.querySelector('#hd20ThemeActionQueue');if(!box){box=document.createElement('section');box.id='hd20ThemeActionQueue';box.className='hadPanel';panel.prepend(box)}const list=themeActions(),pending=list.filter(a=>!actionDone(a));box.innerHTML='<div class="hadHeading"><div><b>테마점검 개선조치 · 접수·완료관리</b><small>점검 미흡사항 → 해당팀 접수 → AFTER 근거 → 개선조치 완료 → 재점검</small></div><div class="hadNumbers"><span>미접수 '+pending.filter(a=>!a.receivedAt).length+'</span><span>조치중 '+pending.filter(a=>a.receivedAt).length+'</span><span>완료 '+(list.length-pending.length)+'</span></div></div>'+(list.length?tableHtml('action',list):'<p class="hadEmpty">등록된 테마점검 개선조치가 없습니다.</p>')}

function openAuditOriginal(id, actionId){
 const key=txt(id),original=audits().find(d=>txt(d.id||d.drawId||d.auditDrawId)===key);
 const action=loadCases().find(a=>txt(a.id)===txt(actionId)&&txt(a.auditDrawId||a.sourceCaseId||a.auditRecordId)===key)||loadCases().find(a=>txt(a.auditDrawId||a.sourceCaseId||a.auditRecordId)===key);
 if(!original&&!action){alert('연결된 Audit 원본이 없습니다. 관리번호를 확인해 주세요.');return}
 document.getElementById('hd20AuditOriginalPopup')?.remove();
 const outer=document.createElement('div');outer.id='hd20AuditOriginalPopup';outer.className='hadAuditOverlay';
 const field=(k,v)=>'<dt>'+safe(k)+'</dt><dd>'+safe(v??'—')+'</dd>';
 const rows=[
  ['Audit 번호',original?.id||key],['대상팀',original?.team||action?.team],['작업장',original?.workplace||action?.workplace],
  ['대상 선정일',original?.date],['점검일',original?.auditDate||action?.auditDate],
  ['점검자',original?.initialAuditor||original?.auditor||action?.initialAuditor],
  ['Audit 판정',original?.auditResult||action?.auditResult],['점검 지적사항',original?.improvementRequest||action?.problem],
  ['개선조치 번호',action?.id],['조치 상태',action?progress(action):'연계 없음'],
  ['접수자 / 접수일',action?.receivedAt?(txt(action.receivedBy)+' / '+txt(action.receivedAt)):'미접수'],
  ['개선조치 내용',action?.action||action?.improvement],['완료일',action?.completedAt||action?.doneDate]
 ];
 outer.innerHTML='<section role="dialog" aria-modal="true" aria-label="Audit 원본 상세" class="hadAuditDialog"><header><b>Audit 원본 점검 상세</b><button type="button" data-had-close>✕ 닫기</button></header><dl>'+rows.map(([k,v])=>field(k,v)).join('')+'</dl><div data-had-photo></div><footer><button type="button" data-had-close>닫기</button></footer></section>';
 const photo=txt(original?.improvementPhoto||action?.before);
 if(/^data:image\/(png|jpeg|webp|gif);base64,/i.test(photo)||/^https:\/\/[^\s]+$/i.test(photo)){
  const img=document.createElement('img');img.src=photo;img.alt='Audit 개선 전 현장 사진';img.referrerPolicy='no-referrer';outer.querySelector('[data-had-photo]').appendChild(img);
 }
 document.body.appendChild(outer);
 const close=()=>outer.remove();outer.querySelectorAll('[data-had-close]').forEach(btn=>btn.addEventListener('click',close));
 outer.addEventListener('click',e=>{if(e.target===outer)close()});
 outer.querySelector('[data-had-close]')?.focus();
}
function notifyDraft(id){const a=workflowAction(id);if(!a)return;const to=teamRecipient(a.team);if(!to){alert('해당팀의 메일 주소가 팀 마스터에 등록되지 않았습니다. 통합기준정보에서 확인해 주세요.');return}const subject='[5S Audit 개선조치 접수요청] '+a.team+' / '+a.id;const body='Audit 점검 개선요청이 등록되었습니다.\n\n대상팀: '+a.team+'\nAudit 번호: '+(a.auditDrawId||a.sourceCaseId)+'\n개선조치 번호: '+a.id+'\n점검일: '+(a.auditDate||'')+'\n개선요청: '+a.problem+'\n\nHD-20 > 개선조치등록에서 접수 후 조치 완료처리 바랍니다.\n※ 메일 프로그램에서 실제 보내기를 실행해야 발송됩니다.';location.href='mailto:'+encodeURIComponent(to)+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body)}
async function completeAction(id){const a=workflowAction(id);if(!a||!a.receivedAt)return alert('접수 후 완료할 수 있습니다.');if(!canHandleTeam(a))return alert('해당팀 담당자 또는 마스터 관리자만 조치 완료할 수 있습니다.');const detail=prompt('개선조치 완료내용을 입력해 주세요.');if(detail===null)return;if(!txt(detail))return alert('조치내용은 필수입니다.');const evidence=prompt('AFTER 사진 URL 또는 증빙 링크를 입력해 주세요. (없으면 취소)');if(evidence===null)return;if(!/^https?:\/\/\S+$/i.test(txt(evidence))&&!/^data:image\//i.test(txt(evidence)))return alert('유효한 AFTER 이미지/증빙 URL이 필요합니다.');try{updateAuditAction(id,{status:'완료',action:txt(detail),improvement:txt(detail),after:txt(evidence),completedAt:new Date().toISOString(),completedBy:sessionEmail()||'미인증 사용자',doneDate:seoulDate()})}catch(e){alert(e.message)}}
function bindWorkflow(){document.addEventListener('click',e=>{const originalLink=e.target.closest?.('[data-had-open-audit]');if(originalLink){openAuditOriginal(originalLink.dataset.hadOpenAudit,originalLink.dataset.hadActionId);return}const b=e.target.closest?.('[data-had-notify],[data-had-receive],[data-had-complete]');if(!b)return;const id=b.dataset.hadNotify||b.dataset.hadReceive||b.dataset.hadComplete;if(b.dataset.hadNotify){notifyDraft(id);return}if(b.dataset.hadReceive){const action=workflowAction(id);if(!action||!canHandleTeam(action))return alert('해당팀 담당자 또는 마스터 관리자만 접수할 수 있습니다.');const actor=sessionEmail();try{updateAuditAction(id,{receivedAt:new Date().toISOString(),receivedBy:actor,status:'진행중'})}catch(err){alert(err.message)}return}if(b.dataset.hadComplete)completeAction(id)});window.addEventListener('hd20-audit-updated',e=>{if(e.detail?.actionId&&e.detail?.draw)autoNotifyAuditAction(e.detail.draw)});const refresh=()=>{renderAuditMonitor();renderTeamQueue()};document.addEventListener('click',e=>{if(e.target.closest?.('#awTheme [data-theme-view="actions"]'))setTimeout(refresh,100)},true);['hd20-audit-updated','hd20-theme-audit-updated','hd20-action-updated','hd20-nav-area-changed','hd20-subtab-changed','hd20-refresh-requested'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(refresh,35)));window.addEventListener('storage',e=>{if([CASE_KEY,AUDIT_KEY,TEAM_KEY].includes(e.key))refresh()});setTimeout(refresh,180);setTimeout(refresh,950)}
function injectWorkflowStyle(){if(document.getElementById('hd20AuditTeamWorkflowStyle'))return;const st=document.createElement('style');st.id='hd20AuditTeamWorkflowStyle';st.textContent='.hadPanel{margin:14px 0;padding:16px;border:1px solid #d9e5ed;border-radius:12px;background:#fff;box-sizing:border-box}.hadHeading{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.hadHeading b{font-size:16px;color:#173c58}.hadHeading small,.hadTable td small{display:block;font-size:12px;color:#697f90;margin-top:3px}.hadNumbers{display:flex;gap:7px;flex-wrap:wrap}.hadNumbers span{padding:5px 9px;border-radius:6px;background:#edf5f9;color:#28546c;font-size:12px;font-weight:750}.hadFilter{display:flex;gap:9px;flex-wrap:wrap;margin:12px 0}.hadFilter label{display:flex;align-items:center;gap:6px;font-size:12px;color:#4c6a7d}.hadFilter select,.hadFilter input{padding:7px 9px;max-width:210px;border:1px solid #cbdbe5;border-radius:7px}.hadTableWrap{width:100%;overflow-x:auto}.hadTable{width:100%;border-collapse:collapse;font-size:12.5px;min-width:910px}.hadTable th{padding:10px 7px;text-align:left;background:#f1f6fa;color:#365a70;white-space:nowrap}.hadTable td{padding:9px 7px;vertical-align:top;border-bottom:1px solid #e4ecf1;overflow-wrap:anywhere}.hadTable td button{display:block;width:100%;min-width:70px;margin:0 0 5px;padding:7px;border:1px solid #bed0dc;border-radius:6px;background:#f8fbfe;color:#185980;cursor:pointer}.hadStatus{font-weight:800}.hadStatus.done{color:#177a43}.hadStatus.doing{color:#135f99}.hadStatus.waiting{color:#ae6b13}.hadEmpty{font-size:13px;color:#698093;padding:12px}@media(max-width:720px){.hadPanel{padding:10px}.hadHeading{display:block}.hadNumbers{margin-top:8px}}.hadAuditLink{border:0;background:transparent;color:#126a99;font:inherit;font-weight:800;text-decoration:underline;text-underline-offset:3px;cursor:pointer;padding:0;text-align:left}.hadAuditOverlay{position:fixed;inset:0;z-index:2147483400;background:#091e388e;display:grid;place-items:center;padding:16px}.hadAuditDialog{width:min(760px,96vw);max-height:92vh;overflow:auto;background:#fff;border-radius:12px;box-shadow:0 22px 60px #10263d55}.hadAuditDialog header,.hadAuditDialog footer{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #dce6ed}.hadAuditDialog header b{font-size:17px;color:#173e5b}.hadAuditDialog footer{justify-content:flex-end;border-top:1px solid #dce6ed;border-bottom:0}.hadAuditDialog button{border:1px solid #bfd2dd;border-radius:7px;padding:7px 12px;background:#fff;cursor:pointer}.hadAuditDialog dl{display:grid;grid-template-columns:155px 1fr;padding:12px 20px;margin:0}.hadAuditDialog dt,.hadAuditDialog dd{border-bottom:1px solid #eaf0f3;margin:0;padding:9px 4px;font-size:13px;white-space:pre-wrap;overflow-wrap:anywhere}.hadAuditDialog dt{font-weight:800;color:#52738a}.hadAuditDialog dd{color:#1f455c}.hadAuditDialog [data-had-photo]{padding:0 20px}.hadAuditDialog img{max-width:100%;max-height:280px;object-fit:contain}';document.head.appendChild(st)}

function bind(){injectWorkflowStyle();bindWorkflow();window.addEventListener('hd20-audit-to-action',e=>setPending(e.detail));window.addEventListener('hd20-action-updated',e=>{const a=registerAttempt,id=String(e.detail?.id||'').trim(),replacedId=String(e.detail?.replacedId||'').trim(),source=String(e.detail?.source||'').trim();if(!a||a.done||!id||source==='audit-action-linkage')return;const trustedReplacement=source==='action-id-integrity-guard';if(patchCreated(a.beforeIds,a.sourceSnapshot,a.manualDue,id,replacedId,trustedReplacement)){a.done=true;if(registerAttempt===a)registerAttempt=null}});document.addEventListener('click',captureRegister,true);document.addEventListener('change',e=>{if(e.target?.id!=='amDate')return;const form=document.getElementById('awAction'),due=form?.querySelector('#amDue');if(due?.dataset.hd20AutoDue==='1')due.value='';autoDue(form)},true);document.addEventListener('input',e=>{if(e.target?.id==='amDue'&&e.isTrusted)e.target.dataset.hd20AutoDue='0'},true);window.addEventListener('hd20-policy-updated',()=>{const form=document.getElementById('awAction');if(form)autoDue(form)});try{const old=JSON.parse(sessionStorage.getItem(LEGACY_PENDING_KEY)||'null');if(old)setPending(old);sessionStorage.removeItem(LEGACY_PENDING_KEY)}catch{}}
window.HD20ActionAuditLinkage={deadlineDays,addDays,readPending,setPending,clearPending,patchCreated,autoDue,seoulDate};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',bind,{once:true}):bind();
})();