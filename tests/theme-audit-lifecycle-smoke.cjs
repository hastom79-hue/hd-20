'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  page.on('dialog',d=>d.dismiss());
  await page.addInitScript(()=>{
   if(sessionStorage.getItem('themeLifecycleSeeded'))return;
   const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit'}).formatToParts(new Date());
   const month=p.find(x=>x.type==='year').value+'-'+p.find(x=>x.type==='month').value;
   localStorage.setItem('hd20ThemeAuditPlansV1',JSON.stringify([{month,line:'TEST-LINE',themes:['정리']}]));
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
  await page.waitForSelector('#awTheme .themeCheckRow',{timeout:15000});
  const photo={name:'audit.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/qN8AAAAASUVORK5CYII=','base64')};
  const submit=async()=>{
   await page.locator('#themeBulkAllOk').click();
   await page.locator('#awTheme .themeCheckRow').first().locator('[data-v="미흡"]').click();
   await page.locator('#themeAuditAuditor').fill('E2E 점검자');
   await page.locator('#themeAuditPhoto').setInputFiles(photo);
   await page.locator('#themeSaveBtn').click();
   await page.waitForFunction(()=>document.querySelector('#themeSaveResult')?.textContent?.includes('점검 이력 저장 완료'),null,{timeout:15000});
  };
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
  console.log('THEME AUDIT ACTION LIFECYCLE BROWSER PASS');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
