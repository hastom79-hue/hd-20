'use strict';
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 page.on('dialog',d=>d.dismiss());
 try{
  await page.goto('http://127.0.0.1:4173/index.html?area=audit&sub=theme',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.HD20_NAV?.ready?.()&&!!document.getElementById('awTheme'),null,{timeout:25000});
  const state=()=>page.evaluate(()=>{const el=id=>document.getElementById(id);const visible=id=>{const x=el(id);return !!x&&x.classList.contains('on')&&getComputedStyle(x).display!=='none'};return{area:window.HD20_NAV?.active?.(),audit:visible('awAudit'),theme:visible('awTheme'),action:visible('awAction'),sub:new URLSearchParams(location.search).get('sub')}});
  await page.waitForTimeout(2100);
  let v=await state();if(v.area!=='audit'||!v.theme||v.audit||v.action||v.sub!=='theme')throw Error('Theme deep link '+JSON.stringify(v));
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2200);v=await state();if(v.area!=='audit'||!v.theme||v.audit||v.action)throw Error('Theme refresh '+JSON.stringify(v));
  const themeHost=page.locator('#awTheme');if(!await themeHost.isVisible())throw Error('Theme screen not visible after refresh');
  await page.locator('[data-merged-audit-tabs] [data-merged-section="audit"]').first().click();
  await page.waitForTimeout(500);v=await state();if(v.area!=='audit'||!v.audit||v.theme||v.action)throw Error('Audit switch '+JSON.stringify(v));
  await page.evaluate(()=>window.HD20_NAV.go('action'));
  await page.waitForTimeout(500);v=await state();if(v.area!=='action'||!v.action||v.audit||v.theme)throw Error('Standalone Action '+JSON.stringify(v));
  await page.evaluate(()=>window.HD20_NAV.go('audit'));
  await page.waitForTimeout(500);v=await state();if(v.area!=='audit'||!v.audit||v.action||v.theme)throw Error('Return to Audit '+JSON.stringify(v));
  console.log('AUDIT THEME NAVIGATION PASS');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
