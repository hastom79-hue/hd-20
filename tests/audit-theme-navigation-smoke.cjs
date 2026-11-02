'use strict';
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 page.on('dialog',d=>d.dismiss());
 try{
  await page.goto('http://127.0.0.1:4173/index.html?area=audit&sub=theme',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.HD20_NAV?.ready?.()&&document.getElementById('awTheme'),null,{timeout:25000});
  const state=()=>page.evaluate(()=>{
   const visible=id=>{const x=document.getElementById(id);return !!x&&x.classList.contains('on')&&getComputedStyle(x).display!=='none'&&x.getClientRects().length>0};
   const nav=[...document.querySelectorAll('.beginnerNav button[data-key]')];
   const btn=key=>nav.find(b=>b.dataset.key===key);
   return {area:window.HD20_NAV?.active?.(),audit:visible('awAudit'),theme:visible('awTheme'),action:visible('awAction'),auditTab:!!btn('audit')&&getComputedStyle(btn('audit')).display!=='none',themeTab:!!btn('theme')&&getComputedStyle(btn('theme')).display!=='none',auditLabel:btn('audit')?.innerText?.trim(),themeLabel:btn('theme')?.innerText?.trim(),merged:document.querySelectorAll('[data-merged-audit-tabs]').length,subnav:[...document.querySelectorAll('#hd20Subnav button')].map(b=>b.textContent.trim())}
  });
  await page.waitForTimeout(1800);
  let v=await state();
  if(v.area!=='theme'||!v.theme||v.audit||!v.themeTab||!v.auditTab||v.merged)throw Error('Independent theme deep link '+JSON.stringify(v));
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(1700);
  v=await state();if(v.area!=='theme'||!v.theme||v.audit)throw Error('Theme reload '+JSON.stringify(v));
  await page.evaluate(()=>window.HD20_NAV.go('audit'));
  await page.waitForTimeout(700);
  v=await state();
  if(v.area!=='audit'||!v.audit||v.theme||v.merged||!v.subnav.some(s=>s.includes('유지점검')))throw Error('Standalone Audit '+JSON.stringify(v));
  await page.evaluate(()=>window.HD20_SUBNAV.select('audit','ongoing'));
  await page.waitForTimeout(400);
  if((await page.evaluate(()=>window.HD20_SUBNAV.state().sub))!=='ongoing')throw Error('Audit retention subtab missing');
  await page.evaluate(()=>window.HD20_NAV.go('theme'));
  await page.waitForTimeout(700);
  v=await state();if(v.area!=='theme'||!v.theme||v.audit)throw Error('Return Theme '+JSON.stringify(v));
  await page.evaluate(()=>window.HD20_NAV.go('action'));
  await page.waitForTimeout(500);
  v=await state();if(v.area!=='action'||!v.action||v.audit||v.theme)throw Error('Standalone Action '+JSON.stringify(v));
  console.log('AUDIT THEME SEPARATE NAVIGATION PASS');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
