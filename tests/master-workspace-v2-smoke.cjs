'use strict';
const {chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1440,height:900}});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));
page.on('dialog',d=>d.dismiss());
try{
 await page.goto('http://127.0.0.1:4173/index.html?area=master',{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForSelector('#hd20MasterWorkspace [data-hm-target="integrated-team"]',{timeout:25000});
 const buttons=page.locator('#hd20MasterWorkspace [data-hm-target]');
 if(await buttons.count()<10)throw Error('Master groups missing editors');
 await page.locator('#hmSearch').fill('Audit');
 if(await page.locator('#hd20MasterWorkspace [data-hm-target]:visible').count()!==1)throw Error('Master search filter failed');
 await page.locator('[data-hm-reset]').click();
 await page.locator('[data-hm-target="integrated-theme"]').click();
 if(await page.locator('#hd20ThemeCatalogPanel').isVisible()!==true)throw Error('5S theme master editor not visible');
 await page.locator('[data-hm-target="integrated-workplace"]').click();
 if(await page.locator('[data-hm-target="integrated-workplace"]').getAttribute('aria-pressed')!=='true')throw Error('Workspace selection failed');
 if(await page.locator('#hd20IntegratedMasterFactors').count()===0)throw Error('Canonical master editor missing');
 const masterLayout=await page.evaluate(()=>{
   const panel=document.querySelector('#masterModal .masterInfoBox');
   const style=getComputedStyle(panel);
   return {height:panel.getBoundingClientRect().height,viewport:innerHeight,overflowY:style.overflowY,scrollHeight:panel.scrollHeight};
 });
 if(masterLayout.height>masterLayout.viewport||!['auto','scroll'].includes(masterLayout.overflowY))
   throw Error('Integrated master panel exceeds viewport '+JSON.stringify(masterLayout));
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForSelector('#hd20MasterWorkspace [data-hm-target="integrated-team"]',{timeout:25000});
 if(await page.locator('#hd20MasterWorkspace [data-hm-target]').count()<10)throw Error('Master missing after refresh');
 console.log('MASTER WORKSPACE V2 SMOKE PASS');
 if(errors.length)console.warn('Page errors:',errors.slice(0,5));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
