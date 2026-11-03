'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  page.on('dialog',dialog=>dialog.dismiss());
  await page.route('**/*',route=>{
   const req=route.request(),url=new URL(req.url());
   if(['127.0.0.1','localhost'].includes(url.hostname))return route.continue();
   if(req.resourceType()==='script')return route.fulfill({status:200,contentType:'application/javascript',body:'/* CI external script stub */'});
   return route.abort('blockedbyclient');
  });
  await page.goto('http://127.0.0.1:4173/index.html?area=dashboard&section=map',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.HD20_NAV&&window.HD20_DASHBOARD_TABS&&window.HD20_MATURITY_MAP_TAB,null,{timeout:30000});
  await page.evaluate(()=>document.getElementById('hd20Launcher')?.remove());
  await page.evaluate(()=>window.HD20_DASHBOARD_TABS.apply('map',{scroll:false}));
  await page.waitForFunction(()=>document.body.classList.contains('hd20MaturityDashboardMode')&&!!document.getElementById('hd20MaturityMapTab'),null,{timeout:15000});
  for(let attempt=0;attempt<3;attempt++){
   await page.evaluate(()=>{
    window.HD20_MATURITY_MAP_TAB.render();
    window.dispatchEvent(new CustomEvent('hd20-maturity-map-opened'));
   });
   await page.waitForTimeout(350);
   const state=await page.evaluate(()=>{
    const map=document.getElementById('hd20MaturityMapTab');
    return {visible:!!map&&getComputedStyle(map).display!=='none',
      rawHost:map?.querySelectorAll('.maturityMapBody').length||0,
      uploader:map?.querySelectorAll('.gmesImport,.gmesImportHost').length||0,
      judge:map?.querySelectorAll('.gmesJudge,.gmesJudgeUI').length||0};
   });
   assert.deepEqual(state,{visible:true,rawHost:0,uploader:0,judge:0},'GMES workspace leaked into map on iteration '+attempt);
  }
  await page.evaluate(()=>window.HD20_DASHBOARD_TABS.apply('summary',{scroll:false}));
  await page.evaluate(()=>window.HD20_DASHBOARD_TABS.apply('map',{scroll:false}));
  const count=await page.locator('#hd20MaturityMapTab .gmesImport,#hd20MaturityMapTab .gmesImportHost').count();
  assert.equal(count,0,'GMES upload must remain absent after switching dashboard sections');
  console.log('MATURITY_GMES_ISOLATION_PASS');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
