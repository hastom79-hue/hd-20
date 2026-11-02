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
     date:'2026-11-02',auditDate:'2026-11-02',initialAuditor:'검증점검자',
     auditResult:'부적합',improvementRequest:'원본 연결 검증'
   }]));
   localStorage.setItem('hd20ActionCasesV2',JSON.stringify([{
     id:'ACTION-LINK-E2E-01',sourceStage:'AUDIT-REQUEST',
     auditDrawId:'AUDIT-LINK-E2E-01',sourceCaseId:'AUDIT-LINK-E2E-01',
     team:'테스트팀',workplace:'테스트라인',problem:'원본 연결 검증',
     auditDate:'2026-11-02',status:'진행중',registeredAt:'2026-11-02'
   }]));
   sessionStorage.setItem('hd20AuditOriginalLinkSeeded','1');
  });
  await page.goto('http://127.0.0.1:4173/index.html?area=dashboard',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.HD20_NAV?.ready?.()&&window.HD20_AUTH_BYPASS===true,null,{timeout:25000});
  await page.waitForSelector('#hd20Launcher',{timeout:15000, state:'visible'});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.HD20_NAV?.ready?.()&&window.HD20_AUTH_BYPASS===true,null,{timeout:25000});
  await page.waitForSelector('#hd20Launcher',{timeout:15000,state:'visible'});
  console.log('PASS: registration launcher reopens after refresh');
  await page.evaluate(()=>{document.querySelector('[data-ln="skip"]')?.click();document.getElementById('hd20Launcher')?.remove();window.HD20_NAV.go('audit')});
  await page.waitForFunction(()=>window.HD20_NAV?.active?.()==='audit'&&!!window.HD20_SUBNAV?.select,null,{timeout:15000});
  await page.evaluate(()=>window.HD20_SUBNAV.select('audit','action'));
  await page.waitForFunction(()=>window.HD20_SUBNAV?.state?.().sub==='action',null,{timeout:10000});
  const link=page.locator('#awAudit #hd20AuditActionMonitor [data-had-open-audit="AUDIT-LINK-E2E-01"]');
  await link.waitFor({state:'visible',timeout:15000});
  await link.click();
  const modal=page.locator('#hd20AuditOriginalPopup [role="dialog"]');
  await modal.waitFor({state:'visible',timeout:10000});
  const body=await modal.innerText();
  for(const expected of ['AUDIT-LINK-E2E-01','검증점검자','테스트라인','ACTION-LINK-E2E-01'])assert.ok(body.includes(expected),'missing linked original field: '+expected);
  await modal.locator('[data-had-close]').first().click();
  assert.equal(await page.locator('#hd20AuditOriginalPopup').count(),0,'detail popup closes');
  assert.deepEqual(errors.filter(s=>/TypeError|ReferenceError/.test(s)),[],'browser errors');
  console.log('PASS: Audit number opens original detail with exact linked action and closes');
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
