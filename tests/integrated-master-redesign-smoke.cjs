/* 통합기준정보는 "대분류 탭 → 하위 칩" 2단 구성: 칩은 선택된 분류 안에서만 보이므로, 사용자와 같은 순서로 먼저 해당 분류 탭을 연다. */
const HM_GROUP={'integrated-team':'조직·목표','integrated-target':'조직·목표','integrated-source':'등록·분류','integrated-discovery':'등록·분류','integrated-factor':'등록·분류','integrated-workplace':'현장·점검','integrated-theme':'현장·점검','policy':'현장·점검','integrated-mail':'시스템','integrated-admins':'시스템'};
async function openMaster(page,key){const g=HM_GROUP[key];if(g)await page.locator('#hd20MasterWorkspace .hmGroup>h3',{hasText:g}).click();await page.locator('#hd20MasterWorkspace [data-hm-target="'+key+'"]').click();}
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 page.on('dialog',d=>d.accept());
 await page.route('**/*',route=>{
  const u=new URL(route.request().url());
  if(['127.0.0.1','localhost'].includes(u.hostname))return route.continue();
  if(route.request().resourceType()==='script')return route.fulfill({status:200,contentType:'application/javascript',body:'/* external dependency stub */'});
  return route.abort('blockedbyclient');
 });
 try{
  await page.goto('http://127.0.0.1:4173/index.html?area=master',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.HD20IntegratedMaster&&!!document.querySelector('[data-master-tab="integrated-factor"]'),null,{timeout:25000});
  await page.evaluate(()=>{document.querySelector('[data-ln="skip"]')?.click()||document.getElementById('hd20Launcher')?.remove()}); /* 랜딩 런처가 클릭을 가로채므로 닫는다 */
  await page.evaluate(()=>window.HD20_NAV?.go?.('master'));
  await page.waitForSelector('#hd20MasterWorkspace [data-hm-target="integrated-factor"]',{state:'attached',timeout:25000});
  await openMaster(page,'integrated-factor');
  await page.waitForSelector('#imfFactorAddForm');
  const init=await page.evaluate(()=>({
   categories:document.querySelectorAll('.imfFactorCategory').length,
   visible:!!document.querySelector('.imfFactorWorkspace'),
   textareaCount:document.querySelectorAll('.imfFactorWorkspace textarea').length,
   sourceCount:window.HD20IntegratedMaster.factors().업무유형.length
  }));
  if(init.categories!==9||!init.visible||init.textareaCount!==0)throw Error('initial structured editor failed '+JSON.stringify(init));
  await page.locator('#imfFactorNew').fill('회귀검증 임시항목');
  await page.locator('.imfFactorAddBtn').click();
  if(await page.locator('.imfFactorRow').count()!==init.sourceCount+1)throw Error('add failed');
  await page.locator('.imfFactorSave').click();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('gmes5s_work_factor_master_v1')||'{}').업무유형||[]);
  if(!saved.includes('회귀검증 임시항목'))throw Error('save failed');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!document.querySelector('[data-master-tab="integrated-factor"]'),null,{timeout:25000});
  await page.evaluate(()=>{document.querySelector('[data-ln="skip"]')?.click()||document.getElementById('hd20Launcher')?.remove()}); /* 랜딩 런처가 클릭을 가로채므로 닫는다 */
  await page.evaluate(()=>window.HD20_NAV?.go?.('master'));
  await page.waitForSelector('#hd20MasterWorkspace [data-hm-target="integrated-factor"]',{state:'attached',timeout:25000});
  await openMaster(page,'integrated-factor');
  await page.waitForSelector('.imfFactorRow');
  const after=await page.locator('.imfFactorRow input').evaluateAll(xs=>xs.map(x=>x.value));
  if(!after.includes('회귀검증 임시항목'))throw Error('reload persistence failed');
  const row=page.locator('.imfFactorRow').last();
  await row.locator('button[title="항목 삭제"]').click();
  await page.locator('.imfFactorSave').click();
  const final=await page.evaluate(()=>JSON.parse(localStorage.getItem('gmes5s_work_factor_master_v1')||'{}').업무유형||[]);
  if(final.includes('회귀검증 임시항목'))throw Error('delete failed');
  console.log('INTEGRATED_MASTER_REDESIGN_SMOKE_PASS');
  if(errors.length)console.log('Page errors (review separately):',errors.slice(0,10));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
