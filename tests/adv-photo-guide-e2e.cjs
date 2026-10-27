const { chromium } = require('playwright');
const assert = require('node:assert/strict');
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
   return route.abort();
 });
 await page.goto('http://127.0.0.1:4173/index.html?validation=1',{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>!!window.HD20AdvPhotoGuide && !!window.HD20_NAV,{},{timeout:30000});
 const evidence={};
 async function verify(area,modalSelector,openerSelector){
   await page.evaluate(a=>window.HD20_NAV.go(a),area);
   await page.locator(openerSelector).waitFor({state:'attached',timeout:20000});
   await page.locator(openerSelector).click({timeout:20000});
   await page.locator(modalSelector+'.on').waitFor({state:'visible',timeout:10000});
   const triggers=page.locator(modalSelector+' [data-hd20-photo-guide]');
   assert.equal(await triggers.count(),3,area+' must expose three photo-guide triggers');
   for(let i=0;i<3;i++){
     await triggers.nth(i).click({timeout:10000});
     const dialog=page.locator('dialog#hd20AdvPhotoGuidePopup');
     await dialog.waitFor({state:'visible',timeout:10000});
     assert.equal(await dialog.evaluate(el=>el.open),true,area+' guide dialog must be open');
     const title=await dialog.locator('h3').innerText();
     assert.match(title,new RegExp('^'+(i+1)+'\\.'));
     assert.equal(await dialog.locator('[data-guide-tab]').count(),3);
     assert.equal(await dialog.getByText('BEFORE 사진 가이드').count(),1);
     assert.equal(await dialog.getByText('AFTER 사진 가이드').count(),1);
     await dialog.locator('[data-guide-tab="'+((i+1)%3)+'"]').click();
     assert.match(await dialog.locator('h3').innerText(),new RegExp('^'+(((i+1)%3)+1)+'\\.'));
     await dialog.locator('[data-guide-close]').click();
     assert.equal(await dialog.evaluate(el=>el.open),false);
     assert.equal(await page.locator(modalSelector+'.on').count(),1,'registration modal must remain open after guide closes');
   }
   evidence[area]={triggers:3,opened:3,tabsSwitched:3,closed:3,registerStillOpen:true};
 }
 await verify('activity','#awRegisterModal','[data-aw="new"]');
 await page.locator('#awRegisterModal .awRegisterClose').click();
 await verify('action','#hd20ActionRegisterModal','#hd20ActionRegisterBtn');
 await page.locator('#hd20ActionRegisterModal .armClose').click();
 assert.deepEqual(errors,[],'no uncaught browser errors');
 console.log('HD20_ADV_GUIDE_E2E_PASS',JSON.stringify(evidence));
 await browser.close();
})().catch(e=>{console.error('HD20_ADV_GUIDE_E2E_FAIL',e.stack||String(e));process.exit(1)});
