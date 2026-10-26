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
  if(route.request().resourceType()==='script')return route.fulfill({status:200,contentType:'application/javascript',body:'/* external stub */'});
  return route.abort('blockedbyclient');
 });
 try{
  await page.goto('http://127.0.0.1:4173/index.html?area=dashboard',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.HD20_OPS_V2?.metrics&&!!window.HD20_DASHBOARD_TABS?.apply&&!!document.getElementById('hd20DashboardWorkMetrics'),{},{timeout:25000});
  const dashboard=await page.evaluate(()=>{
   const p=document.getElementById('hd20DashboardWorkMetrics');
   return {groups:p.querySelectorAll('.hd20DwmGroup').length,tiles:p.querySelectorAll('.hd20DwmTile').length,
    visible:p.getClientRects().length>0&&getComputedStyle(p).display!=='none',
    sourceMatch:['audit','action','advancement'].every(area=>{
      const sub=window.HD20_DASHBOARD_WORK_METRICS.selected[area];
      return p.querySelector('[data-dwm-area="'+area+'"] .hd20DwmTile strong')?.textContent?.trim()===
        window.HD20_OPS_V2.metrics(area,sub)[0].slice(1).join('');
    })};
  });
  if(dashboard.groups!==3||dashboard.tiles!==12||!dashboard.visible||!dashboard.sourceMatch)
   throw new Error('dashboard KPI consolidation failed: '+JSON.stringify(dashboard));
  const auditLabel=await page.locator('[data-dwm-area="audit"] .hd20DwmTile span').first().textContent();
  if(auditLabel!=='Audit 원천')throw new Error('Audit title/KPI mismatch: '+auditLabel);
  for(const section of ['improve','request','map']){
   await page.evaluate(section=>window.HD20_DASHBOARD_TABS.apply(section,{scroll:false}),section);
   await page.waitForTimeout(120);
   const shown=await page.locator('#hd20DashboardWorkMetrics').isVisible();
   if(shown)throw new Error('consolidated KPI duplicated on dashboard '+section);
  }
  await page.evaluate(()=>window.HD20_DASHBOARD_TABS.apply('summary',{scroll:false}));
  if(!await page.locator('#hd20DashboardWorkMetrics').isVisible())throw new Error('summary KPI panel not restored');
  await page.selectOption('[data-dwm-select="audit"]','retention');
  const updated=await page.evaluate(()=>document.querySelector('[data-dwm-area="audit"] .hd20DwmTile span')?.textContent);
  if(updated!=='관리중')throw new Error('audit KPI subtab selection failed: '+updated);
  for(const area of ['audit','action','advancement']){
   await page.evaluate(area=>window.HD20_NAV.go(area),area);
   await page.waitForTimeout(500);
   const state=await page.evaluate(()=>({
     nav:window.HD20_NAV.active(),workCards:document.querySelectorAll('#hd20OpsMetrics button').length,
     dashboardVisible:(()=>{const p=document.getElementById('hd20DashboardWorkMetrics');return !!p&&getComputedStyle(p).display!=='none'&&p.getClientRects().length>0})()
   }));
   if(state.nav!==area||state.workCards||state.dashboardVisible)
    throw new Error('KPI not removed from '+area+': '+JSON.stringify(state));
  }
  await page.evaluate(()=>window.HD20_NAV.go('dashboard'));
  await page.waitForTimeout(350);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelectorAll('#hd20DashboardWorkMetrics .hd20DwmTile').length===12,{},{timeout:25000});
  console.log('DASHBOARD_KPI_MIGRATION_SMOKE_PASS');
  if(errors.length)console.log('Page errors (review separately):',errors.slice(0,10));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
