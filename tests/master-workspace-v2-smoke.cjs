'use strict';
/* 통합기준정보는 "대분류 탭 → 하위 칩" 2단 구성: 칩은 선택된 분류 안에서만 보이므로, 사용자와 같은 순서로 먼저 해당 분류 탭을 연다. */
const HM_GROUP={'integrated-team':'조직·목표','integrated-target':'조직·목표','integrated-source':'등록·분류','integrated-discovery':'등록·분류','integrated-factor':'등록·분류','integrated-workplace':'현장·점검','integrated-theme':'현장·점검','policy':'현장·점검','integrated-mail':'시스템','integrated-admins':'시스템'};
async function openMaster(page,key){const g=HM_GROUP[key];if(g)await page.locator('#hd20MasterWorkspace .hmGroup>h3',{hasText:g}).click();await page.locator('#hd20MasterWorkspace [data-hm-target="'+key+'"]').click();}
const {chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1440,height:900}});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));
page.on('dialog',d=>d.dismiss());
try{
 await page.goto('http://127.0.0.1:4173/index.html?area=master',{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForSelector('#hd20MasterWorkspace [data-hm-target="integrated-team"]',{timeout:25000});
 await page.evaluate(()=>{document.querySelector('[data-ln="skip"]')?.click();document.getElementById('hd20Launcher')?.remove()});
 const buttons=page.locator('#hd20MasterWorkspace [data-hm-target]');
 if(await buttons.count()<10)throw Error('Master groups missing editors');
 // Verify users can actually open editors, not just see ten decorative tiles.
 const checks=['integrated-team','integrated-target','integrated-factor','integrated-workplace','integrated-theme','policy','integrated-admins','integrated-mail'];
 for(const key of checks){
   await openMaster(page,key);
   await page.waitForTimeout(160);
   const state=await page.evaluate(k=>{
     const root=document.querySelector('#masterModal'),box=root?.querySelector('.masterInfoBox');
     const t=root?.querySelector('[data-master-tab="'+k+'"]');
     const editor=k==='policy'?document.querySelector('#hd20OperatingPolicyPanel'):k==='integrated-theme'?document.querySelector('#hd20ThemeCatalogPanel'):document.querySelector('#hd20IntegratedMasterFactors');
     const visible=el=>!!el&&getComputedStyle(el).display!=='none'&&el.getClientRects().length>0;
     return {ready:box?.classList.contains('hd20MasterWorkspaceReady'),navVisible:visible(root?.querySelector('#hd20MasterWorkspace')),tabActive:t?.classList.contains('on'),editorVisible:visible(editor),editorText:editor?.innerText?.trim().length||0};
   },key);
   if(!state.ready||!state.navVisible||!state.tabActive||!state.editorVisible||state.editorText<8)throw Error('Master editor malfunction '+key+': '+JSON.stringify(state));
 }

 // Rapid master-editor changes must keep only the newest selection active.
 await openMaster(page,'integrated-team');
 await page.evaluate(()=>{
   const team=document.querySelector('#hd20MasterWorkspace [data-hm-target="integrated-team"]');
   const theme=document.querySelector('#hd20MasterWorkspace [data-hm-target="integrated-theme"]');
   team?.click();theme?.click();
 });
 await page.waitForTimeout(100);
 const rapid=await page.evaluate(()=>({
   active:document.querySelector('#masterModal .masterTabs [data-master-tab].on')?.dataset.masterTab,
   pressed:document.querySelector('#hd20MasterWorkspace [data-hm-target][aria-pressed="true"]')?.dataset.hmTarget,
   themeVisible:!!document.querySelector('#hd20ThemeCatalogPanel')?.getClientRects().length
 }));
 if(rapid.active!=='integrated-theme'||rapid.pressed!=='integrated-theme'||!rapid.themeVisible)
   throw Error('Master quick switching lost latest editor '+JSON.stringify(rapid));
 // A user selection before the initial deferred default must take precedence.
 const initSelection=await page.evaluate(async()=>{
   const team=document.querySelector('#hd20MasterWorkspace [data-hm-target="integrated-team"]');
   const theme=document.querySelector('#hd20MasterWorkspace [data-hm-target="integrated-theme"]');
   theme?.click();
   await new Promise(resolve=>setTimeout(resolve,10));
   return {pressed:document.querySelector('#hd20MasterWorkspace [data-hm-target][aria-pressed="true"]')?.dataset.hmTarget,
           active:document.querySelector('#masterModal .masterTabs [data-master-tab].on')?.dataset.masterTab};
 });
 if(initSelection.pressed!=='integrated-theme'||initSelection.active!=='integrated-theme')
   throw Error('Master deferred initializer replaced user selection '+JSON.stringify(initSelection));
 // Canonical close and re-entry must restore the selected master editor.
 await openMaster(page,'integrated-theme');
 await page.locator('#hd20MasterWorkspace [data-hm-close]').click();
 await page.waitForFunction(()=>window.HD20_NAV?.active?.()==='dashboard');
 await page.locator('.beginnerNav button[data-key="master"]').click();
 await page.waitForFunction(()=>window.HD20_NAV?.active?.()==='master');
 await page.waitForTimeout(100);
 const reopen=await page.evaluate(()=>({
   active:document.querySelector('#masterModal .masterTabs [data-master-tab].on')?.dataset.masterTab,
   selected:document.querySelector('#hd20MasterWorkspace [data-hm-target][aria-pressed="true"]')?.dataset.hmTarget,
   visible:!!document.querySelector('#hd20ThemeCatalogPanel')?.getClientRects().length
 }));
 if(reopen.active!=='integrated-theme'||reopen.selected!=='integrated-theme'||!reopen.visible)
   throw Error('Master re-entry failed to restore selected editor '+JSON.stringify(reopen));
 await page.locator('#hmSearch').fill('Audit');
 if(await page.locator('#hd20MasterWorkspace [data-hm-target]:visible').count()!==1)throw Error('Master search filter failed');
 await page.locator('[data-hm-reset]').click();
 await openMaster(page,'integrated-theme');
 if(await page.locator('#hd20ThemeCatalogPanel').isVisible()!==true)throw Error('5S theme master editor not visible');
 await openMaster(page,'integrated-workplace');
 if(await page.locator('[data-hm-target="integrated-workplace"]').getAttribute('aria-pressed')!=='true')throw Error('Workspace selection failed');
 if(await page.locator('#hd20IntegratedMasterFactors').count()===0)throw Error('Canonical master editor missing');
 const scrollContract=await page.evaluate(async()=>{
   const modal=document.querySelector('#masterModal .masterInfoBox');
   const target=document.querySelector('[data-hm-target="integrated-theme"]');
   const before=window.scrollY;
   target?.click();
   await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
   return {pageBefore:before,pageAfter:window.scrollY,overflowY:modal?getComputedStyle(modal).overflowY:'MISSING',modalScrollOwner:!!modal&&['auto','scroll'].includes(getComputedStyle(modal).overflowY)};
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

 // Diagnostics cross-tab navigation must not select a stale subtab after a new area is active.
 const masterSource=require('node:fs').readFileSync('master-workspace-v2.js','utf8');
 const diagnosticSection=masterSource.slice(masterSource.indexOf('function auditMaster()'),masterSource.indexOf('registry.querySelector(\'[data-hm-audit-refresh]\')'));
 if(!diagnosticSection.includes("window.HD20_NAV?.active?.()===x.targetArea"))
   throw Error('Master diagnostic links lack active-area guard for delayed subtab selection');
 console.log('MASTER WORKSPACE V2 SMOKE PASS');
 if(errors.length)console.warn('Page errors:',errors.slice(0,5));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
