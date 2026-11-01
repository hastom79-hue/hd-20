'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  page.on('dialog',d=>d.dismiss());
  await page.addInitScript(()=>{
   const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit'}).formatToParts(new Date());
   const month=parts.find(x=>x.type==='year').value+'-'+parts.find(x=>x.type==='month').value;
   const previous=new Date(Date.UTC(Number(parts.find(x=>x.type==='year').value),Number(parts.find(x=>x.type==='month').value)-3,1)).toISOString().slice(0,7);
   const next=new Date(Date.UTC(Number(parts.find(x=>x.type==='year').value),Number(parts.find(x=>x.type==='month').value),1)).toISOString().slice(0,7);
   const actions=[
    {id:'LINKED-MIDDLE',source:'테마Audit',auditMonth:previous,lastAuditMonth:next,workplace:'중간월라인',team:'팀A',themeCategory:'정리',problem:'중간월 재점검',status:'진행중',relatedAuditRecordIds:['AUD-MIDDLE']},
    {id:'NOT-LINKED',source:'테마Audit',auditMonth:previous,lastAuditMonth:next,workplace:'다른라인',team:'팀B',themeCategory:'청소',problem:'다른 이력',status:'진행중',relatedAuditRecordIds:['AUD-OTHER']}
   ];
   if(!sessionStorage.getItem('hd20MonthLinkSeeded')){
    localStorage.setItem('hd20ActionCasesV2',JSON.stringify(actions));
    localStorage.setItem('hd20ThemeAuditChecksV1',JSON.stringify([{id:'AUD-MIDDLE',month,line:'중간월라인',team:'팀A',states:{}}]));
    sessionStorage.setItem('hd20MonthLinkSeeded','1');
   }
  });
  await page.goto('http://127.0.0.1:4173/index.html?area=audit&sub=theme',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.HD20_NAV?.ready?.()&&document.querySelector('#awTheme [data-theme-view="actions"]'),null,{timeout:25000});
  await page.evaluate(()=>{document.querySelector('[data-ln="skip"]')?.click();document.getElementById('hd20Launcher')?.remove();document.querySelector('#awTheme [data-theme-view="actions"]')?.click()});
  await page.waitForSelector('#themeActionTableBody tr',{timeout:15000});
  assert.equal(await page.locator('#themeActionTableBody tr').count(),1,'only linked intermediate-month action visible');
  assert.match(await page.locator('#themeActionTableBody').textContent(),/LINKED-MIDDLE/);
  assert.doesNotMatch(await page.locator('#themeActionTableBody').textContent(),/NOT-LINKED/);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.HD20_NAV?.ready?.()&&document.querySelector('#awTheme [data-theme-view="actions"]'),null,{timeout:25000});
  await page.evaluate(()=>{document.querySelector('[data-ln="skip"]')?.click();document.getElementById('hd20Launcher')?.remove();document.querySelector('#awTheme [data-theme-view="actions"]')?.click()});
  await page.waitForSelector('#themeActionTableBody tr',{timeout:15000});
  assert.equal(await page.locator('#themeActionTableBody tr').count(),1,'intermediate-month link persists after reload');
  console.log('THEME INTERMEDIATE MONTH BROWSER PASS');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
