'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  await page.goto('http://127.0.0.1:4173/index.html?area=audit',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.HD20_NAV?.ready?.()&&document.querySelector('.beginnerNav button[data-key="audit"]'),null,{timeout:25000});
  await page.evaluate(()=>{document.getElementById('hd20Launcher')?.remove();window.HD20_NAV?.open?.('audit')});
  await page.waitForFunction(()=>document.querySelector('.beginnerNav button[data-key="audit"]')?.classList.contains('active'),null,{timeout:15000});
  const audit=await page.evaluate(()=>{
   const banner=document.querySelector('#hd20PurposePanel[data-contract="audit.draw"]');
   const hero=document.querySelector('#awAudit>.awHero');
   return {bannerVisible:banner?getComputedStyle(banner).display!=='none':false,heroVisible:hero?getComputedStyle(hero).display!=='none':false};
  });
  assert.equal(audit.bannerVisible,false,'redundant Audit banner hidden');
  assert.equal(audit.heroVisible,false,'redundant Audit hero hidden');
  await page.evaluate(()=>window.HD20_NAV?.open?.('dashboard'));
  await page.waitForFunction(()=>document.querySelector('.beginnerNav button[data-key="dashboard"]')?.classList.contains('active'),null,{timeout:15000});
  console.log('AUDIT DUPLICATE HEADER BROWSER PASS');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
