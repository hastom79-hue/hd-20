'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1840,height:1000}});
  page.on('dialog',d=>d.dismiss());
  await page.route('**/*',route=>{
   const req=route.request(),u=new URL(req.url());
   if(['127.0.0.1','localhost'].includes(u.hostname))return route.continue();
   if(req.resourceType()==='script')return route.fulfill({status:200,contentType:'application/javascript',body:'/* CI external script stub */'});
   return route.abort('blockedbyclient');
  });
  await page.goto('http://127.0.0.1:4173/index.html?area=dashboard',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.HD20_DASHBOARD_WORK_METRICS&&!!document.getElementById('hd20DashboardPriority'),null,{timeout:30000});
  await page.evaluate(()=>{
   document.getElementById('hd20Launcher')?.remove();
   window.HD20_DASHBOARD_TABS?.apply?.('summary',{scroll:false});
   const year=Number(window.HD20KPIData?.selectedYear?.()||2026);
   const defs={
    'audit:draw:0':['Audit 원천',14],
    'audit:draw:2':['Audit 완료',13],
    'action:manage:0':['전체 개선요청',20],
    'action:manage:2':['완료',16],
    'advancement:judge:0':['고도화 후보',3],
    'advancement:standard:0':['공식확정',2]
   };
   const evidence=(area,sub,index)=>{
    const key=area+':'+sub+':'+index,def=defs[key];if(!def)return null;
    const rows=[];
    for(let month=1;month<=11;month++){
     const n=area==='action'&&month===10?(index===0?72:27):def[1];
     for(let i=0;i<n;i++)rows.push({date:year+'-'+String(month).padStart(2,'0')+'-03',auditDate:year+'-'+String(month).padStart(2,'0')+'-03',완료일:year+'-'+String(month).padStart(2,'0')+'-03',확정일:year+'-'+String(month).padStart(2,'0')+'-03',Audit일:year+'-'+String(month).padStart(2,'0')+'-03'});
    }
    return {title:def[0],rows,headers:[]};
   };
   window.HD20_KPI_EVIDENCE={...window.HD20_KPI_EVIDENCE,evidence};
   window.HD20_DASHBOARD_WORK_METRICS.render();
  });
  for(const viewport of [{width:1840,height:1000},{width:1366,height:900},{width:820,height:900},{width:560,height:900}]){
   await page.setViewportSize(viewport);
   const data=await page.evaluate(()=>{
    const root=document.getElementById('hd20DashboardWorkMetrics');
    const cards=[...root.querySelectorAll('.hd20DwmGroup')];
    const overlaps=[],tooWide=[];
    for(const card of cards){
     const cardRect=card.getBoundingClientRect();
     if(card.scrollWidth>card.clientWidth+2)tooWide.push('card '+card.scrollWidth+'/'+card.clientWidth);
     const months=[...card.querySelectorAll('.hd20DwmMonth')];
     if(months.length!==12)throw Error('Missing month '+months.length);
     for(let i=0;i<months.length;i++){
      const label=months[i].querySelector('.hd20DwmMonthValues');
      if(!label)continue;
      const rect=label.getBoundingClientRect(),monthRect=months[i].getBoundingClientRect();
      if(rect.top<monthRect.top-1)overlaps.push('value above month '+i);
      for(let j=i+1;j<months.length;j++){
       const other=months[j].querySelector('.hd20DwmMonthValues');if(!other)continue;
       const o=other.getBoundingClientRect();
       if(rect.left<o.right-1&&rect.right>o.left+1&&rect.top<o.bottom-1&&rect.bottom>o.top+1)overlaps.push(i+' overlapping '+j);
      }
     }
    }
    return {cards:cards.length,labels:root.querySelectorAll('.hd20DwmMonthValues').length,
      cardWidths:cards.map(c=>Math.round(c.getBoundingClientRect().width)),
      layoutColumns:getComputedStyle(root.querySelector('.hd20DwmGroups')).gridTemplateColumns.split(' ').length,
      evidenceCollapsed:[...root.querySelectorAll('.hd20DwmEvidenceDetails')].every(x=>!x.open),overlaps,tooWide};
   });
   assert.equal(data.cards,3,'show three comparison cards');
   assert.equal(data.layoutColumns,1,'each chart must use its own full-width row at '+viewport.width);
   assert.ok(data.cardWidths.every(w=>w>viewport.width*.70),'each plot must occupy most of the dashboard width');
   assert.ok(data.labels>=30,'show paired values for all available months');
   assert.equal(data.evidenceCollapsed,true,'evidence details start collapsed');
   assert.deepEqual(data.overlaps,[],'labels do not overlap at '+viewport.width);
   assert.deepEqual(data.tooWide,[],'cards do not overflow at '+viewport.width);
   console.log('MONTHLY_CHART_LAYOUT',viewport.width,JSON.stringify(data));
  }
  console.log('DASHBOARD_MONTHLY_VISIBILITY_PASS');
 }finally{await browser.close()}
})().catch(err=>{console.error(err);process.exit(1)});
