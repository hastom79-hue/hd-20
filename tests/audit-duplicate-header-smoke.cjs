'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const fs=require('node:fs');
fs.mkdirSync('artifacts',{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true});
 let page;
 try{
  page=await browser.newPage({viewport:{width:1440,height:900}});
  await page.goto('http://127.0.0.1:4173/index.html?area=audit',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.HD20_NAV?.ready?.()&&document.querySelector('.beginnerNav button[data-key="audit"]'),null,{timeout:25000});
  await page.evaluate(()=>{document.getElementById('hd20Launcher')?.remove();window.HD20_NAV?.openAuditSection?.('audit')});
  await page.waitForFunction(()=>document.querySelector('.beginnerNav button[data-key="audit"]')?.classList.contains('active'),null,{timeout:15000});
  const audit=await page.evaluate(()=>{
   const banner=document.querySelector('#hd20PurposePanel[data-contract="audit.draw"]');
   const hero=document.querySelector('#awAudit>.awHero');
   return {bannerVisible:banner?getComputedStyle(banner).display!=='none':false,heroVisible:hero?getComputedStyle(hero).display!=='none':false};
  });
  assert.equal(audit.bannerVisible,false,'redundant Audit banner hidden');
  assert.equal(audit.heroVisible,false,'redundant Audit hero hidden');
  await page.waitForFunction(()=>!!document.querySelector('#awAudit .audit6m table')&&!!document.querySelector('#awAudit .auditClosedLoop .awHead'),null,{timeout:20000});
  const compact=await page.evaluate(()=>{
    const panel=document.querySelector('#awAudit .audit6m');
    const registration=document.querySelector('#awAudit .auditClosedLoop');
    return {
      lifecycleDiagramCount:document.querySelectorAll('#awAudit .audit6mFlow').length,
      registrationHeading:registration?.querySelector('.awHead')?.textContent?.trim()||'',
      sixMonthTableCount:panel?.querySelectorAll('table').length||0
    };
  });
  assert.equal(compact.lifecycleDiagramCount,0,'redundant six-month workflow diagram removed');
  assert.equal(compact.registrationHeading,'Audit 결과 등록','Audit form heading simplified');
  assert.ok(compact.sixMonthTableCount>=1,'six-month monitoring table preserved');
  await page.screenshot({path:'artifacts/audit-compact.png',fullPage:false});
  // Each subtab must exclusively show its own operational cards, never the other two.
  const assertAuditSubtab=async(sub)=>{
    await page.evaluate(s=>window.HD20_SUBNAV.select('audit',s),sub);
    await page.waitForTimeout(200);
    const result=await page.evaluate(()=>{
      const visible=selector=>{const el=document.querySelector('#awAudit '+selector);return !!el&&!el.classList.contains('hd20SubHidden')&&getComputedStyle(el).display!=='none'&&el.getClientRects().length>0};
      const root=document.getElementById('awAudit');
      return {sub:root?.dataset.subview,draw:visible('.auditDraw'),sampling:visible('#hd20RetentionSampling'),closure:visible('#hd20AuditCloseEvaluation')};
    });
    assert.equal(result.sub,sub,'Audit subview must match selected tab');
    assert.equal(result.draw,sub==='draw','Audit execution content only in draw tab');
    assert.equal(result.sampling,sub==='ongoing','Retention sampling only in ongoing tab');
    assert.equal(result.closure,sub==='retention','Closure and corrective action only in retention tab');
  };
  await assertAuditSubtab('ongoing');
  await assertAuditSubtab('retention');
  // The third tab must expose exact-source retention failures and linked corrective actions.
  await page.evaluate(()=>{
    const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'[]')}catch{return[]}};
    const checks=read('hd20RetentionRandomChecksV1');
    const actions=read('hd20ActionCasesV2');
    checks.push({id:'E2E-RET-TRACE-1',caseId:'E2E-ORIGINAL-1',kind:'자율개선',team:'E2E 점검팀',result:'부적합',evaluator:'E2E 평가자',actionId:'E2E-ACTION-TRACE-1'});
    actions.push({id:'E2E-ACTION-TRACE-1',status:'조치대기'});
    localStorage.setItem('hd20RetentionRandomChecksV1',JSON.stringify(checks));
    localStorage.setItem('hd20ActionCasesV2',JSON.stringify(actions));
    window.HD20_SUBNAV.select('audit','retention');
  });
  assert.ok(await page.locator('#hd20AuditCloseEvaluation').getByText('E2E-RET-TRACE-1').count(),'third tab must show retention failure case reference');
  assert.ok(await page.locator('#hd20AuditCloseEvaluation').getByText('E2E-ACTION-TRACE-1').count(),'third tab must show linked corrective action');
  await page.evaluate(()=>{
    for(const [key,id] of [['hd20RetentionRandomChecksV1','E2E-RET-TRACE-1'],['hd20ActionCasesV2','E2E-ACTION-TRACE-1']]){
      const rows=JSON.parse(localStorage.getItem(key)||'[]');
      localStorage.setItem(key,JSON.stringify(rows.filter(x=>x.id!==id)));
    }
    window.HD20_SUBNAV.select('audit','retention');
  });
  // New Audit data may re-render the same DOM. The active view must remain isolated.
  await page.evaluate(()=>window.dispatchEvent(new Event('hd20-audit-updated')));
  await page.waitForTimeout(180);
  await assertAuditSubtab('retention');
  await assertAuditSubtab('draw');


  // The theme sub-section must remain accessible and must not be hidden by the Audit-only rule.
  await page.evaluate(()=>window.HD20_NAV?.openAuditSection?.('theme'));
  await page.waitForFunction(()=>new URLSearchParams(location.search).get('sub')==='theme',null,{timeout:15000});
  const theme=await page.evaluate(()=>{
   const host=document.getElementById('awTheme');
   return {visible:!!host&&!host.hidden&&getComputedStyle(host).display!=='none'&&host.getClientRects().length>0,active:document.querySelector('.beginnerNav button[data-key="audit"]')?.classList.contains('active')};
  });
  assert.equal(theme.visible,true,'theme workspace must remain visible');
  assert.equal(theme.active,true,'Audit main navigation remains selected');
  await page.screenshot({path:'artifacts/audit-theme.png',fullPage:false});
  // Switching back must not resurrect duplicate Audit headers or lose retention content.
  await page.evaluate(()=>window.HD20_NAV?.openAuditSection?.('audit'));
  await page.waitForFunction(()=>new URLSearchParams(location.search).get('sub')==='audit',null,{timeout:15000});
  const returned=await page.evaluate(()=>{
    const visible=el=>!!el&&!el.hidden&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden'&&el.getClientRects().length>0;
    return {
      duplicateBanner:visible(document.querySelector('#hd20PurposePanel[data-contract="audit.draw"]')),
      duplicateHero:visible(document.querySelector('#awAudit>.awHero')),
      sixMonthTable:!!document.querySelector('#awAudit .audit6m table')
    };
  });
  assert.equal(returned.duplicateBanner,false,'Audit duplicate banner must remain hidden after theme return');
  assert.equal(returned.duplicateHero,false,'Audit duplicate hero must remain hidden after theme return');
  assert.ok(returned.sixMonthTable,'Audit six-month table must remain mounted after theme return');
  await page.screenshot({path:'artifacts/audit-return.png',fullPage:false});
  await page.evaluate(()=>window.HD20_NAV?.go?.('dashboard'));
  await page.waitForFunction(()=>document.querySelector('.beginnerNav button[data-key="dashboard"]')?.classList.contains('active'),null,{timeout:15000});
  console.log('AUDIT DUPLICATE HEADER BROWSER PASS');
 }catch(error){if(page)await page.screenshot({path:'artifacts/audit-failure.png',fullPage:false}).catch(()=>{});throw error}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
