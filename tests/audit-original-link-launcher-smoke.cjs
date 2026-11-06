'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:950}});
  page.on('dialog',d=>d.dismiss());
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.addInitScript(()=>{
   if(sessionStorage.getItem('hd20AuditOriginalLinkSeeded'))return;
   localStorage.setItem('hd20AuditRandomDrawsV1',JSON.stringify([{
     id:'AUDIT-LINK-E2E-01',team:'테스트팀',workplace:'테스트라인',
     date:'2026-11-02',auditDate:'2026-11-02',initialAuditor:'검증점검자',
     auditResult:'부적합',improvementRequest:'원본 연결 검증',improvementPhoto:'data:image/png;base64,iVBORw0KGgo='
   }]));
   localStorage.setItem('hd20ActionCasesV2',JSON.stringify([{
     id:'ACTION-LINK-E2E-01',sourceStage:'AUDIT-REQUEST',
     auditDrawId:'AUDIT-LINK-E2E-01',sourceCaseId:'AUDIT-LINK-E2E-01',
     team:'테스트팀',workplace:'테스트라인',problem:'원본 연결 검증',
     auditDate:'2026-11-02',status:'진행중',registeredAt:'2026-11-02'
   }]));
   sessionStorage.setItem('hd20AuditOriginalLinkSeeded','1');
  });
  await page.goto('http://127.0.0.1:4173/index.html?area=dashboard',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.HD20_NAV?.ready?.()&&window.HD20_AUTH_BYPASS===true,null,{timeout:25000});
  await page.waitForSelector('#hd20Launcher',{timeout:15000, state:'visible'});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.HD20_NAV?.ready?.()&&window.HD20_AUTH_BYPASS===true,null,{timeout:25000});
  await page.waitForSelector('#hd20Launcher',{timeout:15000,state:'visible'});
  // Initial navigation restores (including deep links) must not dismiss the
  // launcher before a user explicitly chooses a registration route or closes it.
  await page.evaluate(()=>{
    window.dispatchEvent(new CustomEvent('hd20-nav-area-changed',
      {detail:{area:'audit'}}));
    window.dispatchEvent(new CustomEvent('hd20-nav-area-changed',
      {detail:{area:'activity'}}));
  });
  assert.equal(await page.locator('#hd20Launcher').isVisible(),true,
    'programmatic navigation during startup must not close the launcher');
  // Re-enter on a deep-linked Audit workspace and check the same guarantee.
  await page.goto('http://127.0.0.1:4173/index.html?area=audit&sub=checklist',
    {waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.HD20_NAV?.ready?.()&&window.HD20_AUTH_BYPASS===true,
    null,{timeout:25000});
  await page.waitForSelector('#hd20Launcher',{state:'visible',timeout:15000});
  assert.equal(await page.locator('#hd20Launcher').isVisible(),true,
    'Audit deep link still opens registration launcher first');
  console.log('PASS: registration launcher reopens after refresh');
  await page.evaluate(()=>{document.querySelector('#hd20Launcher [data-ln-close]')?.click();window.HD20_NAV.go('audit')});
  await page.waitForFunction(()=>window.HD20_NAV?.active?.()==='audit'&&!!window.HD20_SUBNAV?.select,null,{timeout:15000});
  await page.evaluate(()=>window.HD20_SUBNAV.select('audit','ongoing'));
  await page.waitForFunction(()=>window.HD20_SUBNAV?.state?.().sub==='ongoing',null,{timeout:10000});
  const link=page.locator('#awAudit [data-close-final-pending] [data-had-open-audit="AUDIT-LINK-E2E-01"]');
  await link.waitFor({state:'visible',timeout:15000});
  await link.click();
  const modal=page.locator('#hd20AuditOriginalPopup [role="dialog"]');
  await modal.waitFor({state:'visible',timeout:10000});
  const body=await modal.innerText();
  for(const expected of ['AUDIT-LINK-E2E-01','검증점검자','테스트라인','ACTION-LINK-E2E-01'])assert.ok(body.includes(expected),'missing linked original field: '+expected);
  assert.ok(body.includes('부적합'),'original Audit judgment is present');
  assert.ok(body.includes('원본 연결 검증'),'original improvement request is present');
  assert.equal(await modal.locator('[data-had-photo] img').count(),1,'original evidence photo remains linked');
  assert.ok(body.includes('미접수'),'linked action status is visible');
  await modal.locator('[data-had-close]').first().click();
  assert.equal(await page.locator('#hd20AuditOriginalPopup').count(),0,'detail popup closes');
  // Two corrective cases may share one Audit ID. Clicking the second row must
  // display the exact action, not whichever matching case is stored first.
  await page.evaluate(()=>{
    const key='hd20ActionCasesV2',cases=JSON.parse(localStorage.getItem(key)||'[]');
    cases.push({id:'ACTION-LINK-E2E-02',sourceStage:'AUDIT-REQUEST',
      auditDrawId:'AUDIT-LINK-E2E-01',sourceCaseId:'AUDIT-LINK-E2E-01',
      team:'테스트팀',workplace:'테스트라인',problem:'두 번째 조치 연결 검증',
      status:'진행중',registeredAt:'2026-11-02'});
    localStorage.setItem(key,JSON.stringify(cases));
    window.dispatchEvent(new CustomEvent('hd20-action-updated'));
  });
  const secondLink=page.locator('#awAudit #hd20AuditActionMonitor [data-had-action-id="ACTION-LINK-E2E-02"]');
  await secondLink.waitFor({state:'attached',timeout:10000});
  // Legacy Audit corrective monitor is deliberately hidden; verify the delegated
  // exact-action-id handler without suggesting its button is publicly visible.
  await secondLink.evaluate(element=>element.click());
  await modal.waitFor({state:'visible',timeout:10000});
  assert.match(await modal.innerText(),/ACTION-LINK-E2E-02/,'second linked action opens exactly');
  await modal.locator('[data-had-close]').first().click();
  await page.evaluate(()=>{
    const key='hd20ActionCasesV2';
    localStorage.setItem(key,JSON.stringify(JSON.parse(localStorage.getItem(key)||'[]').filter(x=>x.id!=='ACTION-LINK-E2E-02')));
    window.dispatchEvent(new CustomEvent('hd20-action-updated'));
  });
  // Exercise Audit-only corrective queue: overdue first and combined filters, without
  // changing any original Audit or theme case outside this isolated browser profile.
  await page.evaluate(()=>{
   const key='hd20ActionCasesV2',cases=JSON.parse(localStorage.getItem(key)||'[]');
   cases.push(
    {id:'ACTION-OVERDUE-E2E',sourceStage:'AUDIT-REQUEST',auditDrawId:'AUDIT-LINK-E2E-01',
     team:'테스트팀',workplace:'테스트라인',problem:'긴급 기한경과',status:'진행중',receivedAt:'2025-01-01',due:'2025-01-02',registeredAt:'2025-01-01'},
    {id:'ACTION-COMPLETE-E2E',sourceStage:'AUDIT-REQUEST',auditDrawId:'AUDIT-LINK-E2E-01',
     team:'타팀',workplace:'타라인',problem:'완료 사례',status:'완료',completedAt:'2025-02-02',registeredAt:'2025-01-01'}
   );
   localStorage.setItem(key,JSON.stringify(cases));
   window.dispatchEvent(new CustomEvent('hd20-action-updated',{detail:{source:'audit-priority-e2e'}}));
  });
  await page.waitForTimeout(700);
  const queueResult=await page.evaluate(()=>{
    const root=document.getElementById('hd20AuditActionMonitor');
    if(!root)return {error:'Audit monitor not mounted'};
    const summary=root.querySelector('.hadNumbers')?.textContent||'';
    const rows=()=>[...root.querySelectorAll('[data-had-table] tbody tr')].map(tr=>tr.innerText);
    const before=rows();
    const set=(name,val)=>{
      const el=root.querySelector('[data-had-filter-'+name+']');
      if(!el)throw Error('Missing filter '+name);
      el.value=val;
      el.dispatchEvent(new Event('input',{bubbles:true}));
    };
    set('team','테스트팀');
    set('workplace','테스트라인');
    set('due','overdue');
    set('text','긴급 기한경과');
    const combined=rows();
    root.querySelector('[data-had-filter-reset]')?.click();
    const reset=rows();
    return {summary,before,combined,reset};
  });
  assert.match(queueResult.summary,/기한경과 1건/,'past-due Audit action must be counted');
  assert.match(queueResult.before[0]||'',/ACTION-OVERDUE-E2E/,'overdue action must appear first');
  assert.equal(queueResult.combined.length,1,'combined Audit filters must narrow to one');
  assert.match(queueResult.combined[0]||'',/ACTION-OVERDUE-E2E/,'filtered result must be the overdue case');
  assert.equal(queueResult.reset.length,3,'reset restores all Audit actions');
  console.log('PASS: Audit overdue priority, combined filters and reset');
  assert.deepEqual(errors.filter(s=>/TypeError|ReferenceError/.test(s)),[],'browser errors');
  console.log('PASS: Audit number opens original detail with exact linked action and closes');
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
