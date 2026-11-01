'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  page.on('dialog',d=>d.dismiss());
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('http://127.0.0.1:4173/index.html?area=audit&sub=theme',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.HD20_NAV?.ready?.()&&document.querySelector('#awTheme [data-theme-view="plan"]'),null,{timeout:25000});
  await page.evaluate(()=>{document.getElementById('hd20Launcher')?.remove();document.querySelector('#awTheme [data-theme-view="plan"]')?.click()});
  const metrics=async()=>page.evaluate(()=>{
   const host=document.querySelector('#awTheme');
   const panels=[...host.querySelectorAll('.themePanel')];
   return {pageHeight:document.documentElement.scrollHeight,hostHeight:host.getBoundingClientRect().height,
    rows:host.querySelectorAll('.themeLineSummaryRow').length,
    visiblePanels:panels.filter(x=>getComputedStyle(x).display!=='none').length,
    page:host.querySelector('.themePageControls span')?.textContent||'',
    next:!host.querySelector('[data-theme-page="1"]')?.disabled};
  });
  const first=await metrics();
  assert.ok(first.rows>0&&first.rows<=10,'first page contains at most ten lines');
  assert.equal(first.visiblePanels,1,'only the active panel may occupy layout');
  assert.ok(first.hostHeight<5000,'first tab must not grow indefinitely');
  assert.ok(first.pageHeight<12000,'page height bounded for ordinary viewport');
  if(first.next){
   await page.locator('#awTheme [data-theme-page="1"]').click();
   const second=await metrics();
   assert.ok(second.rows>0&&second.rows<=10,'next page bounded');
   assert.notEqual(second.page,first.page,'pagination changes page');
   await page.locator('#awTheme [data-theme-page="-1"]').click();
   assert.equal((await metrics()).page,first.page,'previous page returns to first');
  }
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.HD20_NAV?.ready?.()&&document.querySelector('#awTheme [data-theme-view="plan"]'),null,{timeout:25000});
  await page.evaluate(()=>{document.getElementById('hd20Launcher')?.remove();document.querySelector('#awTheme [data-theme-view="plan"]')?.click()});
  const refreshed=await metrics();
  assert.ok(refreshed.rows<=10&&refreshed.hostHeight<5000,'refresh keeps bounded first-tab layout');
  assert.deepEqual(errors,[],'no page JS errors');
  console.log('THEME FIRST TAB HEIGHT AND PAGINATION BROWSER PASS');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
