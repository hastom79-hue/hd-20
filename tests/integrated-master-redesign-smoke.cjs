const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 page.on('dialog',d=>d.accept());
 await page.route('**/*',route=>{
  const u=new URL(route.request().url);
  if(['127.0.0.1','localhost'].includes(u.hostname))return route.continue();
  if(route.request().resourceType()==='script')return route.fulfill({status:200,contentType:'application/javascript',body:'/* external dependency stub */'});
  return route.abort('blockedbyclient');
 });
 try{
  await page.goto('http://127.0.0.1:4173/index.html?area=master',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.HD20IntegratedMaster&&!!document.querySelector('[data-master-tab="integrated-factor"]'),null,{timeout:25000});
  await page.evaluate(()=>window.HD20_NAV?.go?.('master'));
  await page.locator('[data-master-tab="integrated-factor"]').click({force:true});
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
  await page.evaluate(()=>window.HD20_NAV?.go?.('master'));
  await page.locator('[data-master-tab="integrated-factor"]').click({force:true});
  await page.waitForSelector('.imfFactorRow');
  const after=await page.locator('.imfFactorRow input').evaluateAll(xs=>xs.map(x=>x.value));
  if(!after.includes('회귀검증 임시항목'))throw Error('reload persistence failed');
  const row=page.locator('.imfFactorRow').filter({has:page.locator('input[value="회귀검증 임시항목"]')});
  await row.locator('button[title="항목 삭제"]').click();
  await page.locator('.imfFactorSave').click();
  const final=await page.evaluate(()=>JSON.parse(localStorage.getItem('gmes5s_work_factor_master_v1')||'{}').업무유형||[]);
  if(final.includes('회귀검증 임시항목'))throw Error('delete failed');
  console.log('INTEGRATED_MASTER_REDESIGN_SMOKE_PASS');
  if(errors.length)console.log('Page errors (review separately):',errors.slice(0,10));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
