const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 page.on('dialog',d=>d.accept());
 page.on('pageerror',e=>console.error('[pageerror]',String(e)));
 await page.route('**/*',route=>{
  const req=route.request(),u=new URL(req.url());
  if(['127.0.0.1','localhost'].includes(u.hostname))return route.continue();
  if(req.resourceType()==='script')return route.fulfill({status:200,contentType:'application/javascript',body:'/* external stub */'});
  return route.abort('blockedbyclient');
 });
 const assertMaster=async label=>{
  const state=await page.evaluate(()=>{
   const modal=document.getElementById('masterModal');
   const adv=document.getElementById('performanceConversionAnalysis');
   const app=document.querySelector('.app');
   const visible=el=>!!el&&getComputedStyle(el).display!=='none'&&el.getClientRects().length>0;
   return {selected:document.querySelector('.beginnerNav button.active')?.dataset.key,
    modalParent:modal?.parentElement===app,modalVisible:visible(modal),
    masterEditorVisible:visible(document.getElementById('hd20IntegratedMasterFactors'))||visible(document.getElementById('hd20OperatingPolicyPanel')),
    advancementVisible:visible(adv),workplaceVisible:visible(document.getElementById('awWorkplace')),
    sub:new URLSearchParams(location.search).get('sub'),
    subnavArea:window.HD20_SUBNAV?.state?.().area,
    view:app?.dataset.hdView};
  });
  console.log(label,state);
  if(state.selected!=='master'||!state.modalParent||!state.modalVisible||!state.masterEditorVisible||state.advancementVisible||state.workplaceVisible||state.sub||state.subnavArea!=='master'||state.view!=='master')
   throw new Error(label+': master screen isolation failed: '+JSON.stringify(state));
 };
 try{
  await page.goto('http://127.0.0.1:4173/index.html?area=master&sub=judge',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.HD20_NAV?.ready?.()&&!!document.getElementById('hd20IntegratedMasterFactors'),{},{timeout:25000});
  await page.waitForTimeout(2000);
  await assertMaster('deep link with stale advancement sub');
  await page.evaluate(()=>{window.HD20_NAV.go('advancement');window.HD20_NAV.go('master')});
  await page.waitForTimeout(2000);
  await assertMaster('rapid advancement to master');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2000);
  await assertMaster('master refresh');
  // Regression from user screenshot: activity selected but standardization panel remained visible.
  await page.evaluate(()=>{
    window.HD20_NAV.go('advancement');
    window.HD20_SUBNAV.select('advancement','standard');
    window.HD20_NAV.go('activity');
  });
  await page.waitForTimeout(2100);
  const activityState=await page.evaluate(()=>{
    const el=document.getElementById('performanceConversionAnalysis');
    const activity=document.getElementById('awActivity');
    const visible=x=>!!x&&getComputedStyle(x).display!=='none'&&x.getClientRects().length>0;
    return {selected:document.querySelector('.beginnerNav button.active')?.dataset.key,
      advancementVisible:visible(el),activityVisible:visible(activity),
      standardSticky:el?.classList.contains('hd20AdvancementStandard'),
      forcedHidden:el?.style.getPropertyValue('display')==='none'&&el?.style.getPropertyPriority('display')==='important',
      area:window.HD20_SUBNAV?.state?.().area};
  });
  console.log('advancement standard to activity',activityState);
  if(activityState.selected!=='activity'||activityState.advancementVisible||!activityState.activityVisible||activityState.standardSticky||!activityState.forcedHidden||activityState.area!=='activity')
    throw new Error('activity/advancement screen leakage: '+JSON.stringify(activityState));
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(1600);
  const activityRefresh=await page.evaluate(()=>({
    area:window.HD20_NAV?.active?.(),
    advancementVisible:(()=>{const el=document.getElementById('performanceConversionAnalysis');return !!el&&getComputedStyle(el).display!=='none'&&el.getClientRects().length>0})()
  }));
  if(activityRefresh.area!=='activity'||activityRefresh.advancementVisible)
    throw new Error('activity refresh leakage: '+JSON.stringify(activityRefresh));
  await page.evaluate(()=>window.HD20_NAV.go('dashboard'));
  await page.waitForTimeout(250);
  const dashboard=await page.evaluate(()=>document.querySelector('.beginnerNav button.active')?.dataset.key==='dashboard');
  if(!dashboard)throw new Error('dashboard return navigation broken');
  console.log('MASTER_REFRESH_SMOKE_PASS');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
