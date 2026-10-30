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
 /* 랜딩 런처 팝업을 닫아야 이후 클릭이 가로막히지 않음 */
 await page.evaluate(()=>{document.querySelector('[data-ln="skip"]')?.click()||document.getElementById('hd20Launcher')?.remove()});
 const evidence={};
 /* 등록 진입 경로: 02 탭 통합조회 화면의 "+ 신규등록" → 런처의 "자율개선/개선요청 등록하기 →" 선택 → 각 등록 모달.
    (예전의 [data-aw="new"] / #hd20ActionRegisterBtn 직접 진입 버튼은 통합조회 개편으로 더 이상 보이지 않음) */
 async function openRegister(ln){
   await page.evaluate(()=>window.HD20_NAV.go('activity'));
   const entry=page.locator('#hd20LauncherOverview button:visible',{hasText:'신규등록'}).first();
   await entry.waitFor({state:'visible',timeout:20000});
   await entry.click({timeout:20000});
   const choose=page.locator('.hd20LnRegisterBtn[data-ln="'+ln+'"]');
   await choose.waitFor({state:'visible',timeout:10000});
   await choose.click({timeout:10000});
 }
 /* 사진 가이드는 "평가자료 · 사진 가이드 상세 보기" 단일 트리거 → 3개 요건 탭(요건 1·2·3)을 가진 팝업(div#hd20AdvPhotoGuidePopup)으로 통합됨 */
 async function verify(ln,modalSelector){
   await openRegister(ln);
   await page.locator(modalSelector+'.on').waitFor({state:'visible',timeout:10000});
   const triggers=page.locator(modalSelector+' [data-hd20-photo-guide]');
   assert.equal(await triggers.count(),1,ln+' must expose one unified photo-guide trigger');
   await triggers.first().click({timeout:10000});
   const dialog=page.locator('#hd20AdvPhotoGuidePopup');
   await dialog.waitFor({state:'visible',timeout:10000});
   assert.equal(await dialog.locator('[data-guide-tab]').count(),3,'guide must expose three requirement tabs');
   assert.equal(await dialog.getByText('BEFORE 사진 가이드').count(),1);
   assert.equal(await dialog.getByText('AFTER 사진 가이드').count(),1);
   for(let i=0;i<3;i++){
     await dialog.locator('[data-guide-tab="'+i+'"]').click();
     assert.match(await dialog.locator('h3').innerText(),new RegExp('^'+(i+1)+'\\.'),'tab '+i+' title');
   }
   await dialog.locator('[data-guide-close]').click();
   await dialog.waitFor({state:'hidden',timeout:10000});
   assert.equal(await page.locator(modalSelector+'.on').count(),1,'registration modal must remain open after guide closes');
   evidence[ln]={triggers:1,tabsSwitched:3,closed:true,registerStillOpen:true};
 }
 await verify('activity','#awRegisterModal');
 await page.locator('#awRegisterModal .awRegisterClose').click();
 await verify('action','#hd20ActionRegisterModal');
 await page.locator('#hd20ActionRegisterModal .armClose').click();
 assert.deepEqual(errors,[],'no uncaught browser errors');
 console.log('HD20_ADV_GUIDE_E2E_PASS',JSON.stringify(evidence));
 await browser.close();
})().catch(e=>{console.error('HD20_ADV_GUIDE_E2E_FAIL',e.stack||String(e));process.exit(1)});
