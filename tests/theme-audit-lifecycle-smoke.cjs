'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  const dialogs=[];page.on('dialog',d=>{dialogs.push(d.message());d.dismiss()});
  await page.addInitScript(()=>{
   if(sessionStorage.getItem('themeLifecycleSeeded'))return;
   const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit'}).formatToParts(new Date());
   const month=p.find(x=>x.type==='year').value+'-'+p.find(x=>x.type==='month').value;
   localStorage.setItem('hd20ThemeAuditPlansV1',JSON.stringify([{month,line:'TEST-LINE',themes:['불용품·폐자재 정리']}]));
   sessionStorage.setItem('themeLifecycleSeeded','1');
  });
  await page.goto('http://127.0.0.1:4173/index.html?area=audit&sub=theme',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.HD20_NAV?.ready?.()&&document.querySelector('#awTheme [data-theme-view="audit"]'),null,{timeout:25000});
  await page.evaluate(()=>{
   document.querySelector('[data-ln="skip"]')?.click();document.getElementById('hd20Launcher')?.remove();
   const host=document.getElementById('awTheme');
   const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit'}).formatToParts(new Date());
   host.dataset.month=p.find(x=>x.type==='year').value+'-'+p.find(x=>x.type==='month').value;
   host.dataset.line='TEST-LINE';host.dataset.team='TEST-TEAM';
   host.querySelector('[data-theme-view="audit"]').click();
  });
  // The plan is injected for an isolated test line. No production master data is modified.
  await page.waitForSelector('#awTheme .themeCheckRow',{timeout:15000}).catch(async error=>{const diagnostic=await page.evaluate(()=>({line:document.getElementById('awTheme')?.dataset.line,month:document.getElementById('awTheme')?.dataset.month,view:document.getElementById('awTheme')?.dataset.view,plan:JSON.parse(localStorage.getItem('hd20ThemeAuditPlansV1')||'[]'),master:window.HD20ThemeMaster?.checklist?.().slice(0,4),note:document.getElementById('themeChecklistWrap')?.innerText?.slice(0,500)}));throw new Error(error.message+' '+JSON.stringify(diagnostic))});
  const photo={name:'audit.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/qN8AAAAASUVORK5CYII=','base64')};
  const submit=async()=>{
   const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('hd20ThemeAuditChecksV1')||'[]').filter(x=>x.line==='TEST-LINE').length);
   await page.locator('#themeBulkAllOk').click();
   await page.locator('#awTheme .themeCheckRow').first().locator('[data-v="미흡"]').click();
   await page.locator('#themeAuditAuditor').fill('E2E 점검자');
   await page.locator('#themeAuditPhoto').setInputFiles(photo);
   await page.locator('#themeSaveBtn').click();
   await page.waitForFunction(expected=>JSON.parse(localStorage.getItem('hd20ThemeAuditChecksV1')||'[]').filter(x=>x.line==='TEST-LINE').length===expected,before+1,{timeout:15000}).catch(async err=>{const details=await page.evaluate(()=>{const host=document.getElementById('awTheme'),r=document.getElementById('themeSaveResult');return {view:host?.dataset.view,line:host?.dataset.line,team:host?.dataset.team,month:host?.dataset.month,checks:JSON.parse(localStorage.getItem('hd20ThemeAuditChecksV1')||'[]').filter(x=>x.line==='TEST-LINE').length,actions:JSON.parse(localStorage.getItem('hd20ActionCasesV2')||'[]').filter(x=>x.workplace==='TEST-LINE').length,rows:document.querySelectorAll('#awTheme .themeCheckRow').length,ng:document.querySelectorAll('#awTheme .themeCheckRow [data-v="미흡"].active').length,button:document.getElementById('themeSaveBtn')?.disabled,result:r?.textContent,planned:JSON.parse(localStorage.getItem('hd20ThemeAuditPlansV1')||'[]')}});throw new Error('THEME_SAVE_DIAGNOSTIC '+JSON.stringify({expected:before+1,before,details,dialogs})+' '+err.message)});
   await page.waitForFunction(()=>document.querySelector('#themeSaveResult')?.textContent?.includes('점검 이력 저장 완료'),null,{timeout:15000}).catch(async err=>{const details=await page.evaluate(()=>{const h=document.getElementById('awTheme'),el=document.getElementById('themeSaveResult');const checks=JSON.parse(localStorage.getItem('hd20ThemeAuditChecksV1')||'[]').filter(x=>x.line==='TEST-LINE');const actions=JSON.parse(localStorage.getItem('hd20ActionCasesV2')||'[]').filter(x=>x.workplace==='TEST-LINE');return {view:h?.dataset.view,context:h?.dataset.themeSaveContext,message:h?.dataset.themeSaveResult,result:el?.textContent,checkCount:checks.length,lastCheck:checks.at(-1)?.id,linked:checks.at(-1)?.linkedActionIds,actions:actions.map(x=>({id:x.id,status:x.status})),saveButton:document.getElementById('themeSaveBtn')?.disabled}});throw new Error('THEME_ACK_DIAGNOSTIC '+JSON.stringify({details,dialogs})+' '+err.message)});
  };
  // Reject NG without photo: neither audit history nor action cases may be written.
  await page.locator('#themeBulkAllOk').click();
  await page.locator('#awTheme .themeCheckRow').first().locator('[data-v="미흡"]').click();
  await page.locator('#themeAuditAuditor').fill('E2E 점검자');
  await page.locator('#themeSaveBtn').click();
  await page.waitForFunction(()=>document.querySelector('#themeSaveBtn')?.disabled===false,null,{timeout:15000});
  // The rejected submission must finish its async handler before the next upload and save.
  await page.waitForTimeout(150);
  const rejected=await page.evaluate(()=>({
   audits:JSON.parse(localStorage.getItem('hd20ThemeAuditChecksV1')||'[]').filter(x=>x.line==='TEST-LINE').length,
   actions:JSON.parse(localStorage.getItem('hd20ActionCasesV2')||'[]').filter(x=>x.source==='테마Audit'&&x.workplace==='TEST-LINE').length
  }));
  assert.deepEqual(rejected,{audits:0,actions:0},'NG without photo must not persist any data');
  await submit();
  let state=await page.evaluate(()=>({actions:JSON.parse(localStorage.getItem('hd20ActionCasesV2')||'[]').filter(x=>x.source==='테마Audit'&&x.workplace==='TEST-LINE'),audits:JSON.parse(localStorage.getItem('hd20ThemeAuditChecksV1')||'[]').filter(x=>x.line==='TEST-LINE')}));
  assert.equal(state.actions.length,1,'first NG creates one action');
  assert.equal(state.audits.length,1);
  assert.equal(state.actions[0].initialAuditor,'E2E 점검자');
  assert.equal(state.actions[0].relatedAuditRecordIds.length,1);
  await submit();
  state=await page.evaluate(()=>({actions:JSON.parse(localStorage.getItem('hd20ActionCasesV2')||'[]').filter(x=>x.source==='테마Audit'&&x.workplace==='TEST-LINE'),audits:JSON.parse(localStorage.getItem('hd20ThemeAuditChecksV1')||'[]').filter(x=>x.line==='TEST-LINE')}));
  assert.equal(state.actions.length,1,'repeat NG reuses existing action');
  assert.equal(state.actions[0].relatedAuditRecordIds.length,2);
  assert.equal(state.audits.length,2);
  await page.evaluate(()=>{const k='hd20ActionCasesV2',a=JSON.parse(localStorage.getItem(k));a.find(x=>x.source==='테마Audit'&&x.workplace==='TEST-LINE').status='완료';localStorage.setItem(k,JSON.stringify(a))});
  await submit();
  state=await page.evaluate(()=>({actions:JSON.parse(localStorage.getItem('hd20ActionCasesV2')||'[]').filter(x=>x.source==='테마Audit'&&x.workplace==='TEST-LINE'),audits:JSON.parse(localStorage.getItem('hd20ThemeAuditChecksV1')||'[]').filter(x=>x.line==='TEST-LINE')}));
  assert.equal(state.actions.length,2,'completed issue recurrence creates new action');
  const recurring=state.actions.find(x=>x.recurrence===true);
  assert.ok(recurring,'recurrence flag');
  assert.equal(recurring.recurrenceOfActionId,state.actions.find(x=>x.status==='완료').id);
  assert.equal(state.audits.length,3);
  // Bidirectional linkage: every audit references its action, and every action references its audits.
  const verifyLinks=(data)=>{
   const actionById=new Map(data.actions.map(a=>[a.id,a]));
   const auditById=new Map(data.audits.map(a=>[a.id,a]));
   for(const audit of data.audits){
    assert.equal(audit.linkedActionIds.length,1,'each NG audit links exactly one action');
    const action=actionById.get(audit.linkedActionIds[0]);
    assert.ok(action,'audit references an existing action');
    assert.ok(action.relatedAuditRecordIds.includes(audit.id),'action links back to audit');
    assert.equal(action.initialAuditor,'E2E 점검자','original auditor preserved');
   }
   for(const action of data.actions){
    for(const auditId of action.relatedAuditRecordIds){
     assert.ok(auditById.has(auditId),'action references an existing audit');
     assert.ok(auditById.get(auditId).linkedActionIds.includes(action.id),'audit links back to action');
    }
   }
  };
  verifyLinks(state);
  assert.equal(state.audits.filter(x=>x.createdActionIds.length===1).length,2,'first and recurrent audits create actions');
  assert.equal(state.audits.filter(x=>x.reusedActionIds.length===1).length,1,'second audit reuses action');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.HD20_NAV?.ready?.()&&document.querySelector('#awTheme [data-theme-view="audit"]'),null,{timeout:25000});
  state=await page.evaluate(()=>({actions:JSON.parse(localStorage.getItem('hd20ActionCasesV2')||'[]').filter(x=>x.source==='테마Audit'&&x.workplace==='TEST-LINE'),audits:JSON.parse(localStorage.getItem('hd20ThemeAuditChecksV1')||'[]').filter(x=>x.line==='TEST-LINE')}));
  assert.equal(state.actions.length,2,'two actions persist after refresh');
  assert.equal(state.audits.length,3,'three audit records persist after refresh');
  verifyLinks(state);
  console.log('THEME AUDIT ACTION LIFECYCLE BROWSER PASS');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
