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
    return {cards:cards.length,layoutColumns:getComputedStyle(root.querySelector('.hd20DwmGroups')).gridTemplateColumns.split(' ').length,barColors:[getComputedStyle(root.querySelector('.hd20DwmChartBar.primary')).backgroundColor,getComputedStyle(root.querySelector('.hd20DwmChartBar.secondary')).backgroundColor],legendColors:[getComputedStyle(root.querySelector('.hd20DwmLegend i.primary')).backgroundColor,getComputedStyle(root.querySelector('.hd20DwmLegend i.secondary')).backgroundColor],labels:root.querySelectorAll('.hd20DwmMonthValues').length,
      evidenceCollapsed:[...root.querySelectorAll('.hd20DwmEvidenceDetails')].every(x=>!x.open),overlaps,tooWide};
   });
   assert.equal(data.cards,3,'show three comparison cards');
   assert.deepEqual(data.barColors,['rgb(40, 90, 150)','rgb(219, 135, 50)'],'paired bars use approved contrasting navy/orange colors');
   assert.deepEqual(data.legendColors,data.barColors,'legend colors must match the respective chart bars');
   if(viewport.width>=1366)assert.equal(data.layoutColumns,3,'retain the approved side-by-side three-card layout at '+viewport.width);
   else assert.ok(data.layoutColumns>=1&&data.layoutColumns<=3,'retain responsive card layout at '+viewport.width);
   assert.ok(data.labels>=30,'show paired values for all available months');
   assert.equal(data.evidenceCollapsed,true,'evidence details start collapsed');
   assert.deepEqual(data.overlaps,[],'labels do not overlap at '+viewport.width);
   assert.deepEqual(data.tooWide,[],'cards do not overflow at '+viewport.width);
   console.log('MONTHLY_CHART_LAYOUT',viewport.width,JSON.stringify(data));
  }
  // The event-specific date wins over registration date; a blank event date
  // must not silently fall back to another source column.
  const monthlyDates=await page.evaluate(()=>{
    const y=Number(window.HD20KPIData?.selectedYear?.()||2026);
    const dt=m=>y+'-'+String(m).padStart(2,'0')+'-05';
    const specs={
      'audit:draw:0':['Audit 원천',['Audit ID','선정일','Audit일'],['A1',dt(1),dt(8)]],
      'audit:draw:2':['Audit 완료',['Audit ID','선정일','Audit일'],['A1',dt(1),dt(2)]],
      'action:manage:0':['전체 개선요청',['Action ID','등록일','완료일'],['X1',dt(3),dt(9)]],
      'action:manage:2':['완료',['Action ID','등록일','완료일'],['X1',dt(3),dt(4)]],
      'advancement:judge:0':['고도화 후보',['Activity ID','후보일','확정일'],['V1',dt(5),dt(9)]],
      'advancement:standard:0':['공식확정',['Activity ID','후보일','확정일'],['V1',dt(5),dt(6)]]
    };
    window.HD20_KPI_EVIDENCE={...window.HD20_KPI_EVIDENCE,evidence:(a,b,i)=>{
      const v=specs[a+':'+b+':'+i];return v?{title:v[0],headers:v[1],rows:[v[2]]}:null;
    }};
    window.HD20_DASHBOARD_WORK_METRICS.render();
    return [...document.querySelectorAll('#hd20DashboardWorkMetrics .hd20DwmGroup')].map(card=>
      [...card.querySelectorAll('.hd20DwmMonth')].map(month=>
        [...month.querySelectorAll('.hd20DwmChartBar')].map(bar=>Number((bar.title.match(/: (\d+)건/)||[])[1]||0))
      )
    );
  });

  assert.equal(monthlyDates.length,3,'all KPI categories remain present');
  const expectedMonths=[[1,2],[3,4],[5,6]];
  for(let k=0;k<3;k++){
    for(let m=0;m<12;m++){
      const expected=[m+1===expectedMonths[k][0]?1:0,m+1===expectedMonths[k][1]?1:0];
      assert.deepEqual(monthlyDates[k][m],expected,
        'KPI month '+(m+1)+' must use its own registration/completion/confirmation date in category '+k);
    }
  }
  console.log('DASHBOARD_MONTHLY_VISIBILITY_PASS');
 }finally{await browser.close()}
})().catch(err=>{console.error(err);process.exit(1)});
