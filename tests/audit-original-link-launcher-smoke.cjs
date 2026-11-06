'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:950}});
  page.on('dialog',d=>d.dismiss());
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.addInitScript(()=>{
   if(sessionStorage.getItem('hd20AuditOriginalLinkSeeded'))return;
   localStorage.setItem('hd20AuditRandomDrawsV1',JSON.stringify([{
     id:'AUDIT-LINK-E2E-01',team:'테스트팀',workplace:'테스트라인',
     date:'2025-01-02',auditDate:'2025-01-02',initialAuditor:'검증점검자',
     auditResult:'부적합',improvementRequest:'원본 연결 검증',improvementPhoto:'data:image/png;base64,iVBORw0KGgo='
   }]));
   localStorage.setItem('hd20ActionCasesV2',JSON.stringify([{
     id:'ACTION-LINK-E2E-01',sourceStage:'AUDIT-REQUEST',
     auditDrawId:'AUDIT-LINK-E2E-01',sourceCaseId:'AUDIT-LINK-E2E-01',
     team:'테스트팀',workplace:'테스트라인',problem:'원본 연결 검증',
     auditDate:'2025-01-02',status:'진행중',registeredAt:'2025-01-02'
   }]));
   sessionStorage.setItem('hd20AuditOriginalLinkSeeded','1');
  });
  await page.goto('http://127.0.0.1:4173/index.html?area=dashboard',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.HD20_NAV?.ready?.()&&window.HD20_AUTH_BYPASS===true,null,{timeout:25000});
  await page.waitForSelector('#hd20Launcher',{timeout:15000, state:'visible'});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.HD20_NAV?.ready?.()&&window.HD20_AUTH_BYPASS===true,null,{timeout:25000});
  await page.waitForSelector('#hd20Launcher',{timeout:15000,state:'visible'});
  // Initial navigation restores (including deep links) must not dismiss the
  // launcher before a user explicitly chooses a registration route or closes it.
  await page.evaluate(()=>{
    window.dispatchEvent(new CustomEvent('hd20-nav-area-changed',
      {detail:{area:'audit'}}));
    window.dispatchEvent(new CustomEvent('hd20-nav-area-changed',
      {detail:{area:'activity'}}));
  });
  assert.equal(await page.locator('#hd20Launcher').isVisible(),true,
    'programmatic navigation during startup must not close the launcher');
  // Re-enter on a deep-linked Audit workspace and check the same guarantee.
  await page.goto('http://127.0.0.1:4173/index.html?area=audit&sub=checklist',
    {waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.HD20_NAV?.ready?.()&&window.HD20_AUTH_BYPASS===true,
    null,{timeout:25000});
  await page.waitForSelector('#hd20Launcher',{state:'visible',timeout:15000});
  assert.equal(await page.locator('#hd20Launcher').isVisible(),true,
    'Audit deep link still opens registration launcher first');
  console.log('PASS: registration launcher reopens after refresh');
  await page.evaluate(()=>{document.querySelector('#hd20Launcher [data-ln-close]')?.click();window.HD20_NAV.go('audit')});
  await page.waitForFunction(()=>window.HD20_NAV?.active?.()==='audit'&&!!window.HD20_SUBNAV?.select,null,{timeout:15000});
  await page.evaluate(()=>window.HD20_SUBNAV.select('audit','ongoing'));
  await page.waitForFunction(()=>window.HD20_SUBNAV?.state?.().sub==='ongoing',null,{timeout:10000});
  const link=page.locator('#awAudit #hd20AuditCloseEvaluation [data-had-open-audit="AUDIT-LINK-E2E-01"]');
  await link.waitFor({state:'visible',timeout:15000});
  await link.click();
  const modal=page.locator('#hd20AuditOriginalPopup [role="dialog"]');
  await modal.waitFor({state:'visible',timeout:10000});
  const body=await modal.innerText();
  for(const expected of ['AUDIT-LINK-E2E-01','검증점검자','테스트라인','ACTION-LINK-E2E-01'])assert.ok(body.includes(expected),'missing linked original field: '+expected);
  assert.ok(body.includes('부적합'),'original Audit judgment is present');
  assert.ok(body.includes('원본 연결 검증'),'original improvement request is present');
  assert.equal(await modal.locator('[data-had-photo] img').count(),1,'original evidence photo remains linked');
  assert.ok(body.includes('미접수'),'linked action status is visible');
  await modal.locator('[data-had-close]').first().click();
  assert.equal(await page.locator('#hd20AuditOriginalPopup').count(),0,'detail popup closes');
  // Current integrity rules require one canonical action per Audit source.
  // A second, different Audit source must resolve to its own exact action.
  await page.evaluate(()=>{
    const auditsKey='hd20AuditRandomDrawsV1';
    const audits=JSON.parse(localStorage.getItem(auditsKey)||'[]');
    audits.push({id:'AUDIT-LINK-E2E-02',team:'검증팀2',workplace:'검증라인2',
      date:'2025-01-02',auditDate:'2025-01-02',initialAuditor:'두번째점검자',
      auditResult:'부적합',improvementRequest:'별도 원본 연결 검증'});
    localStorage.setItem(auditsKey,JSON.stringify(audits));
    const actionsKey='hd20ActionCasesV2';
    const actions=JSON.parse(localStorage.getItem(actionsKey)||'[]');
    actions.push({id:'ACTION-LINK-E2E-02',sourceStage:'AUDIT-REQUEST',
      auditDrawId:'AUDIT-LINK-E2E-02',sourceCaseId:'AUDIT-LINK-E2E-02',
      team:'검증팀2',workplace:'검증라인2',problem:'별도 원본 연결 검증',
      status:'진행중',registeredAt:'2025-01-02'});
    localStorage.setItem(actionsKey,JSON.stringify(actions));
    window.dispatchEvent(new CustomEvent('hd20-action-updated'));
  });
  // The retired Audit action table is intentionally hidden. Exercise the real
  // document-level exact-action-ID handler with an isolated test-only control.
  await page.evaluate(()=>{
    const control=document.createElement('button');
    control.type='button';
    control.dataset.hadOpenAudit='AUDIT-LINK-E2E-02';
    control.dataset.hadActionId='ACTION-LINK-E2E-02';
    document.body.appendChild(control);
    control.click();
    control.remove();
  });
  await modal.waitFor({state:'visible',timeout:10000});
  const secondBody=await modal.innerText();
  assert.match(secondBody,/AUDIT-LINK-E2E-02/,'second Audit source resolved');
  assert.match(secondBody,/ACTION-LINK-E2E-02/,'second Audit action resolved');
  assert.ok(!secondBody.includes('ACTION-LINK-E2E-01'),'unrelated Audit action must not appear');
  await modal.locator('[data-had-close]').first().click();
  await page.evaluate(()=>{
    const a='hd20AuditRandomDrawsV1',b='hd20ActionCasesV2';
    localStorage.setItem(a,JSON.stringify(JSON.parse(localStorage.getItem(a)||'[]').filter(x=>x.id!=='AUDIT-LINK-E2E-02')));
    localStorage.setItem(b,JSON.stringify(JSON.parse(localStorage.getItem(b)||'[]').filter(x=>x.id!=='ACTION-LINK-E2E-02')));
    window.dispatchEvent(new CustomEvent('hd20-action-updated'));
  });
  // The former Audit action queue is not a visible work surface in current IA.
  // Avoid reporting UI filter coverage for a panel removed from navigation.
  assert.equal(await page.locator('#awAudit #hd20AuditActionMonitor').isVisible(),false,
    'retired Audit action queue must remain hidden');
  console.log('PASS: hidden legacy Audit queue was not reintroduced');
  assert.deepEqual(errors.filter(s=>/TypeError|ReferenceError/.test(s)),[],'browser errors');
  console.log('PASS: Audit number opens original detail with exact linked action and closes');
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
