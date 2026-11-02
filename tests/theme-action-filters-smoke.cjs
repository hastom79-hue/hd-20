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
   const rows=[
    {id:'FILTER-1',source:'테마Audit',auditMonth:month,workplace:'라인A',team:'팀A',themeCategory:'정리',problem:'불용품',status:'진행중',recurrence:false},
    {id:'FILTER-2',source:'테마Audit',auditMonth:month,workplace:'라인B',team:'팀B',themeCategory:'청소',problem:'누유',status:'완료',recurrence:true,recurrenceOfActionId:'OLDER'},
    {id:'FILTER-3',source:'테마Audit',auditMonth:month,workplace:'라인C',team:'팀C',themeCategory:'정돈',problem:'공구',status:'진행중',recurrence:true,recurrenceOfActionId:'OLDER2'}
   ];
   if(!sessionStorage.getItem('hd20ThemeFilterSeeded')){localStorage.setItem('hd20ActionCasesV2',JSON.stringify(rows));sessionStorage.setItem('hd20ThemeFilterSeeded','1')}
  });
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('http://127.0.0.1:4173/index.html?area=audit&sub=theme',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.HD20_NAV?.ready?.()&&!!document.querySelector('#awTheme [data-theme-view="actions"]'),null,{timeout:25000});
  await page.evaluate(()=>{document.querySelector('[data-ln="skip"]')?.click();document.getElementById('hd20Launcher')?.remove();document.querySelector('#awTheme [data-theme-view="actions"]')?.click();document.querySelector('#awTheme [data-theme-panel="actions"] details.themeHistoryBox')?.setAttribute('open','')});
  await page.waitForSelector('#themeActionTableBody tr',{timeout:15000});
  const count=async()=>page.locator('#themeActionTableBody tr:visible').count();
  assert.equal(await count(),3,'all rows');
  await page.locator('#themeActionStatus').selectOption('진행중');
  assert.equal(await count(),2,'status filter');
  await page.locator('#themeActionRecurrence').selectOption('yes');
  assert.equal(await count(),1,'combined status + recurrence');
  await page.locator('#themeActionSearch').fill('라인A');
  assert.equal(await count(),0,'three filters combined no match');
  assert.equal(await page.locator('#themeActionNoResults').isVisible(),true,'empty-state visible');
  await page.locator('#themeActionSearch').fill('라인C');
  assert.equal(await count(),1,'three filters combined matching');
  assert.equal(await page.locator('#themeActionCount').textContent(),'표시 1/3건');
  assert.deepEqual(errors.filter(x=>x.includes('forEach')||x.includes('rows')),[],'no table filter JS error');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.HD20_NAV?.ready?.()&&!!document.querySelector('#awTheme [data-theme-view="actions"]'),null,{timeout:25000});
  await page.evaluate(()=>{document.querySelector('[data-ln="skip"]')?.click();document.getElementById('hd20Launcher')?.remove();document.querySelector('#awTheme [data-theme-view="actions"]')?.click();document.querySelector('#awTheme [data-theme-panel="actions"] details.themeHistoryBox')?.setAttribute('open','')});
  await page.waitForSelector('#themeActionTableBody tr',{timeout:15000});
  assert.equal(await count(),3,'all persisted rows visible after refresh');
  await page.locator('#themeActionStatus').selectOption('완료');
  await page.locator('#themeActionRecurrence').selectOption('yes');
  assert.equal(await count(),1,'completed recurrence filter works after refresh');
  console.log('THEME ACTION FILTERS BROWSER PASS');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
