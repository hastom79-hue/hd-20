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
 const scrollContract=await page.evaluate(async()=>{
   const modal=document.querySelector('#masterModal .masterInfoBox');
   const target=document.querySelector('[data-hm-target="integrated-theme"]');
   const before=window.scrollY;
   target?.click();
   await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
   return {pageBefore:before,pageAfter:window.scrollY,modalScrollOwner:!!modal&&getComputedStyle(modal).overflowY==='auto'};
 });
 if(!scrollContract.modalScrollOwner||Math.abs(scrollContract.pageAfter-scrollContract.pageBefore)>2)
   throw Error('Master selection moved the outer page '+JSON.stringify(scrollContract));
 const masterLayout=await page.evaluate(()=>{
   const panel=document.querySelector('#masterModal .masterInfoBox');
   const style=getComputedStyle(panel);
   return {height:panel.getBoundingClientRect().height,viewport:innerHeight,overflowY:style.overflowY,scrollHeight:panel.scrollHeight};
 });
 if(masterLayout.height>masterLayout.viewport||!['auto','scroll'].includes(masterLayout.overflowY))
   throw Error('Integrated master panel exceeds viewport '+JSON.stringify(masterLayout));
 // Check the actual internal scroll rather than only its CSS declaration.
 if(masterLayout.scrollHeight>masterLayout.height+2){
   const scrolled=await page.evaluate(()=>{
     const panel=document.querySelector('#masterModal .masterInfoBox');
     panel.scrollTop=Math.min(240,panel.scrollHeight-panel.clientHeight);
     return {top:panel.scrollTop,documentWidth:document.documentElement.scrollWidth,viewportWidth:innerWidth};
   });
   if(scrolled.top<=0)throw Error('Master internal scrolling is blocked '+JSON.stringify(scrolled));
 }
 // Responsive regression: master content should remain within the narrow viewport.
 await page.setViewportSize({width:375,height:812});
 const mobile=await page.evaluate(()=>{
   const panel=document.querySelector('#masterModal .masterInfoBox');
   const rect=panel.getBoundingClientRect();
   return {panelHeight:rect.height,viewportHeight:innerHeight,overflowY:getComputedStyle(panel).overflowY,
     panelWidth:rect.width,viewportWidth:innerWidth};
 });
 if(mobile.panelHeight>mobile.viewportHeight+2||mobile.panelWidth>mobile.viewportWidth+2||
    !['auto','scroll'].includes(mobile.overflowY))
   throw Error('Master mobile viewport overflow '+JSON.stringify(mobile));
 await page.setViewportSize({width:1440,height:900});
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForSelector('#hd20MasterWorkspace [data-hm-target="integrated-team"]',{timeout:25000});
 if(await page.locator('#hd20MasterWorkspace [data-hm-target]').count()<10)throw Error('Master missing after refresh');
 console.log('MASTER WORKSPACE V2 SMOKE PASS');
 if(errors.length)console.warn('Page errors:',errors.slice(0,5));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
