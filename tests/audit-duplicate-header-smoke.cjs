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

  // The theme sub-section must remain accessible and must not be hidden by the Audit-only rule.
  await page.evaluate(()=>window.HD20_NAV?.openAuditSection?.('theme'));
  await page.waitForFunction(()=>new URLSearchParams(location.search).get('sub')==='theme',null,{timeout:15000});
  const theme=await page.evaluate(()=>{
   const host=document.getElementById('awTheme');
   return {visible:!!host&&getComputedStyle(host).display!=='none',active:document.querySelector('.beginnerNav button[data-key="audit"]')?.classList.contains('active')};
  });
  assert.equal(theme.visible,true,'theme workspace must remain visible');
  assert.equal(theme.active,true,'Audit main navigation remains selected');
  await page.screenshot({path:'artifacts/audit-theme.png',fullPage:false});
  // Switching back must not resurrect duplicate Audit headers or lose retention content.
  await page.evaluate(()=>window.HD20_NAV?.openAuditSection?.('audit'));
  await page.waitForFunction(()=>new URLSearchParams(location.search).get('sub')==='audit',null,{timeout:15000});
  const returned=await page.evaluate(()=>{
    const visible=el=>!!el&&getComputedStyle(el).display!=='none';
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
