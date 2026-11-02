'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const fs=require('node:fs');
fs.mkdirSync('artifacts',{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true});
 let page;
 try{
  page=await browser.newPage({viewport:{width:1440,height:900}});
  await page.goto('http://127.0.0.1:4173/index.html?area=audit',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.HD20_NAV?.ready?.()&&document.querySelector('.beginnerNav button[data-key="audit"]'),null,{timeout:25000});
  await page.evaluate(()=>{document.getElementById('hd20Launcher')?.remove();window.HD20_NAV?.openAuditSection?.('audit')});
  await page.waitForFunction(()=>document.querySelector('.beginnerNav button[data-key="audit"]')?.classList.contains('active'),null,{timeout:15000});
  const audit=await page.evaluate(()=>{
   const banner=document.querySelector('#hd20PurposePanel[data-contract="audit.draw"]');
   const hero=document.querySelector('#awAudit>.awHero');
   return {bannerVisible:banner?getComputedStyle(banner).display!=='none':false,heroVisible:hero?getComputedStyle(hero).display!=='none':false};
  });
  assert.equal(audit.bannerVisible,false,'redundant Audit banner hidden');
  assert.equal(audit.heroVisible,false,'redundant Audit hero hidden');
  await page.waitForFunction(()=>!!document.querySelector('#awAudit .audit6m table')&&!!document.querySelector('#awAudit .auditClosedLoop .awHead'),null,{timeout:20000});
  const compact=await page.evaluate(()=>{
    const panel=document.querySelector('#awAudit .audit6m');
    const registration=document.querySelector('#awAudit .auditClosedLoop');
    return {
      lifecycleDiagramCount:document.querySelectorAll('#awAudit .audit6mFlow').length,
      registrationHeading:registration?.querySelector('.awHead')?.textContent?.trim()||'',
      sixMonthTableCount:panel?.querySelectorAll('table').length||0
    };
  });
  assert.equal(compact.lifecycleDiagramCount,0,'redundant six-month workflow diagram removed');
  assert.equal(compact.registrationHeading,'Audit 결과 등록','Audit form heading simplified');
  assert.ok(compact.sixMonthTableCount>=1,'six-month monitoring table preserved');
  // Canonical first workspace: selection guide -> execution buttons -> selected
  // teams -> result form. Both history views must start collapsed.
  const layout=await page.evaluate(()=>{
    const root=document.querySelector('#awAudit'),draw=root?.querySelector('.auditDraw'),closed=root?.querySelector('.auditClosedLoop');
    const hint=draw?.querySelector('.auditDrawHint'),buttons=draw?.querySelector('.auditDrawBtns'),results=draw?.querySelector('.auditDrawResult');
    const precedes=(a,b)=>!!a&&!!b&&!!(a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING);
    const visible=e=>!!e&&getComputedStyle(e).display!=='none'&&e.getClientRects().length>0;
    return {drawBeforeEntry:precedes(draw,closed),guideBeforeButtons:precedes(hint,buttons),
      buttonsBeforeResults:precedes(buttons,results),drawVisible:visible(draw),entryVisible:visible(closed),
      batchHistoryCollapsed:!draw?.querySelector('.auditDrawHistoryPanel')?.open,
      resultHistoryCollapsed:!closed?.querySelector('.auditCLHistoryFold')?.open};
  });
  assert.deepEqual(layout,{drawBeforeEntry:true,guideBeforeButtons:true,buttonsBeforeResults:true,
    drawVisible:true,entryVisible:true,batchHistoryCollapsed:true,resultHistoryCollapsed:true},
    'Audit first tab must display execution in order and collapse historical detail');
  // Tab ① must not reveal arbitrary legacy cards or checklist/closure cards.
  const executionCards=await page.evaluate(()=>{
    const root=document.getElementById('awAudit');
    return [...root.querySelectorAll('.awCard')].filter(el=>{
      const st=getComputedStyle(el);
      return st.display!=='none'&&el.getClientRects().length>0;
    }).map(el=>({
      cls:el.className,id:el.id,
      execution:!!(el.matches('.auditDraw,.auditClosedLoop,#hd20AuditBatchExecution')||
        el.querySelector('.auditDraw,.auditClosedLoop,#hd20AuditBatchExecution')||
        el.closest('.auditDraw,.auditClosedLoop,#hd20AuditBatchExecution'))
    }));
  });
  assert.ok(executionCards.every(x=>x.execution),
    'first Audit subtab must not show unrelated legacy cards: '+JSON.stringify(executionCards));
  await page.screenshot({path:'artifacts/audit-compact.png',fullPage:false});
  // Each subtab must exclusively show its own operational cards, never the other two.
  const assertAuditSubtab=async(sub)=>{
    await page.evaluate(s=>window.HD20_SUBNAV.select('audit',s),sub);
    await page.waitForTimeout(200);
    const result=await page.evaluate(()=>{
      const visible=selector=>{const el=document.querySelector('#awAudit '+selector);return !!el&&!el.classList.contains('hd20SubHidden')&&getComputedStyle(el).display!=='none'&&el.getClientRects().length>0};
      const root=document.getElementById('awAudit');
      return {sub:root?.dataset.subview,draw:visible('.auditDraw'),actions:visible('#hd20AuditActionMonitor'),sampling:visible('#hd20RetentionSampling'),closure:visible('#hd20AuditCloseEvaluation'),checklist:visible('.acWrap')};
    });
    assert.equal(result.sub,sub,'Audit subview must match selected tab');
    assert.equal(result.draw,sub==='draw','Audit execution content only in draw tab');
    assert.equal(result.actions,sub==='action','Audit corrective worklist only in its own tab');
    assert.equal(result.checklist,sub==='checklist','Audit checklist only in fifth tab');
    assert.equal(result.sampling,sub==='ongoing','Retention sampling only in ongoing tab');
    assert.equal(result.closure,sub==='retention','Closure and corrective action only in retention tab');
    if(sub==='retention')assert.ok(await page.locator('#hd20AuditCloseEvaluation, #hd20RetentionActionTrace').count(),'Closure content should be mounted');
  };
  await assertAuditSubtab('action');
  await assertAuditSubtab('checklist');
  const checklistFilter=await page.evaluate(()=>{
    const panel=document.querySelector('#awAudit .acWrap'),trs=[...panel?.querySelectorAll('.acTable tbody tr')||[]];
    const query=panel?.querySelector('[data-ac-filter-text]'),category=panel?.querySelector('[data-ac-filter-cat]'),status=panel?.querySelector('[data-ac-filter-status]');
    const first=trs[0],firstCat=first?.querySelector('[data-f="cat"]')?.value||'',firstText=first?.querySelector('[data-f="item"]')?.value||'',firstStatus=first?.querySelector('.acJudge')?.textContent||'N/A';
    if(category){category.value=firstCat;category.dispatchEvent(new Event('input',{bubbles:true}))}
    if(status){status.value=firstStatus;status.dispatchEvent(new Event('input',{bubbles:true}))}
    if(query){query.value=firstText;query.dispatchEvent(new Event('input',{bubbles:true}))}
    const filtered=trs.filter(tr=>!tr.hidden).length;
    panel?.querySelector('[data-ac-filter-reset]')?.click();
    return {count:trs.length,filtered,reset:trs.filter(tr=>!tr.hidden).length,summaryCollapsed:panel?.querySelector('.acSummaryFold')?.open===false,filtersPresent:!!query&&!!category&&!!status};
  });
  assert.ok(checklistFilter.count>0,'Audit checklist must preserve current evaluation rows');
  assert.equal(checklistFilter.filtersPresent,true,'Audit checklist needs category, status and text filters');
  assert.ok(checklistFilter.filtered>0&&checklistFilter.filtered<=checklistFilter.count,'combined checklist filter must show matching items');
  assert.equal(checklistFilter.reset,checklistFilter.count,'reset must restore full checklist');
  assert.equal(checklistFilter.summaryCollapsed,true,'duplicate evaluation summary remains collapsed initially');
  await assertAuditSubtab('ongoing');
  // Retention workspace must keep actionable checks above completed cases.
  await page.evaluate(()=>{
    const key='hd20RetentionRandomChecksV1',rows=JSON.parse(localStorage.getItem(key)||'[]');
    rows.push(
      {id:'E2E-RET-PENDING',kind:'자율개선',caseId:'E2E-PENDING',team:'검증팀',result:'점검대기',drawDate:'2026-11-01'},
      {id:'E2E-RET-RECHECK',kind:'개선요청',caseId:'E2E-RECHECK',team:'검증팀',result:'부적합',drawDate:'2026-10-01'},
      {id:'E2E-RET-CLOSED',kind:'자율개선',caseId:'E2E-CLOSED',team:'검증팀',result:'적합',evaluatedAt:'2026-11-02',drawDate:'2026-10-01'}
    );
    localStorage.setItem(key,JSON.stringify(rows));
    window.HD20_SUBNAV.select('audit','ongoing');
  });
  const retention=page.locator('#hd20RetentionSampling');
  assert.equal(await retention.locator('.hd20RsActive [data-rs-id]').count(),2,'only pending and unresolved cases appear in actionable queue');
  assert.equal(await retention.locator('.hd20RsActive [data-rs-id="E2E-RET-PENDING"]').count(),1,'pending check remains actionable');
  assert.equal(await retention.locator('.hd20RsActive [data-rs-id="E2E-RET-RECHECK"]').count(),1,'failed check remains actionable');
  assert.equal(await retention.locator('.hd20RsHistoryFold [data-rs-id="E2E-RET-CLOSED"]').count(),1,'completed cases remain in history');
  assert.equal(await retention.locator('.hd20RsHistoryFold').evaluate(el=>el.open),false,'completed history is collapsed initially');
  await retention.locator('.hd20RsHistoryFold summary').click();
  assert.equal(await retention.locator('.hd20RsHistoryFold [data-rs-id="E2E-RET-CLOSED"]').isVisible(),true,'completed history opens on request');
  await page.evaluate(()=>{
    const key='hd20RetentionRandomChecksV1';
    localStorage.setItem(key,JSON.stringify(JSON.parse(localStorage.getItem(key)||'[]').filter(x=>!['E2E-RET-PENDING','E2E-RET-RECHECK','E2E-RET-CLOSED'].includes(x.id))));
    window.HD20_SUBNAV.select('audit','ongoing');
  });
  await assertAuditSubtab('ongoing');

  await assertAuditSubtab('retention');
  // Closure workspace: final-evaluation pending and unresolved rework precede collapsed histories.
  await page.evaluate(()=>{
    const load=key=>JSON.parse(localStorage.getItem(key)||'[]');
    const audits=load('hd20AuditRandomDrawsV1'),checks=load('hd20RetentionRandomChecksV1');
    audits.push(
      {id:'E2E-AUDIT-FINAL-PENDING',team:'검증팀',workplace:'검증라인',auditDate:'2026-11-02',initialAuditor:'검증점검자'},
      {id:'E2E-AUDIT-FINAL-DONE',team:'검증팀',workplace:'검증라인',auditDate:'2026-11-01',finalEvaluation:'종결'}
    );
    checks.push(
      {id:'E2E-REWORK-PENDING',kind:'자율개선',caseId:'E2E-REWORK',team:'검증팀',result:'부적합',evaluator:'최초 점검자'},
      {id:'E2E-REWORK-CLOSED',kind:'자율개선',caseId:'E2E-CLOSED',team:'검증팀',result:'부적합',recheckResult:'적합',recheckedAt:'2026-11-02'}
    );
    localStorage.setItem('hd20AuditRandomDrawsV1',JSON.stringify(audits));
    localStorage.setItem('hd20RetentionRandomChecksV1',JSON.stringify(checks));
    window.HD20_SUBNAV.select('audit','retention');
  });
  const closure=page.locator('#hd20AuditCloseEvaluation, #hd20RetentionActionTrace');
  assert.ok(await closure.locator('[data-close-rework]').getByText('E2E-REWORK-PENDING').count(),'unresolved rework must be in primary queue');
  assert.equal(await closure.locator('[data-close-rework]').getByText('E2E-REWORK-CLOSED').count(),0,'closed rework must not be mixed into active queue');
  assert.ok(await closure.locator('.hd20CloseHistory').getByText('E2E-REWORK-CLOSED').count(),'closed rework stays in history');
  assert.equal(await closure.locator('.hd20CloseHistory').first().evaluate(el=>el.open),false,'closure history starts collapsed');
  if(await page.locator('#hd20AuditCloseEvaluation').getAttribute('data-hd20-fallback')==='true'){
    assert.ok(await closure.locator('[data-close-final-pending]').getByText('E2E-AUDIT-FINAL-PENDING').count(),'unjudged Audit must be in first queue');
    assert.ok(await closure.locator('.hd20CloseHistory').getByText('E2E-AUDIT-FINAL-DONE').count(),'evaluated Audit remains in history');
  }
  await page.evaluate(()=>{
    for(const [key,ids] of [
      ['hd20AuditRandomDrawsV1',['E2E-AUDIT-FINAL-PENDING','E2E-AUDIT-FINAL-DONE']],
      ['hd20RetentionRandomChecksV1',['E2E-REWORK-PENDING','E2E-REWORK-CLOSED']]
    ]){
      localStorage.setItem(key,JSON.stringify(JSON.parse(localStorage.getItem(key)||'[]').filter(x=>!ids.includes(x.id))));
    }
    window.HD20_SUBNAV.select('audit','retention');
  });
  // The fourth tab must expose exact-source retention failures and linked corrective actions.
  await page.evaluate(()=>{
    const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'[]')}catch{return[]}};
    const checks=read('hd20RetentionRandomChecksV1');
    const actions=read('hd20ActionCasesV2');
    checks.push({id:'E2E-RET-TRACE-1',caseId:'E2E-ORIGINAL-1',kind:'자율개선',team:'E2E 점검팀',result:'부적합',evaluator:'E2E 평가자',actionId:'E2E-ACTION-TRACE-1'});
    actions.push({id:'E2E-ACTION-TRACE-1',status:'조치대기'});
    localStorage.setItem('hd20RetentionRandomChecksV1',JSON.stringify(checks));
    localStorage.setItem('hd20ActionCasesV2',JSON.stringify(actions));
    window.HD20_SUBNAV.select('audit','retention');
  });
  assert.ok(await page.locator('#hd20AuditCloseEvaluation, #hd20RetentionActionTrace').getByText('E2E-RET-TRACE-1').count(),'third tab must show retention failure case reference');
  assert.ok(await page.locator('#hd20AuditCloseEvaluation, #hd20RetentionActionTrace').getByText('E2E-ACTION-TRACE-1').count(),'third tab must show linked corrective action');
  assert.equal(await page.locator('#hd20RetentionActionTrace').count()<=1,true,'only one retention trace panel may exist');
  await page.evaluate(()=>{
    const checks=JSON.parse(localStorage.getItem('hd20RetentionRandomChecksV1')||'[]');
    const actions=JSON.parse(localStorage.getItem('hd20ActionCasesV2')||'[]');
    const row=checks.find(x=>x.id==='E2E-RET-TRACE-1');
    row.recheckResult='부적합';row.recheckedAt=new Date().toISOString();row.followupActionId='E2E-ACTION-TRACE-2';
    actions.push({id:'E2E-ACTION-TRACE-2',sourceStage:'RETENTION-RECHECK',sourceCaseId:row.id,previousActionId:'E2E-ACTION-TRACE-1',status:'조치대기'});
    localStorage.setItem('hd20RetentionRandomChecksV1',JSON.stringify(checks));
    localStorage.setItem('hd20ActionCasesV2',JSON.stringify(actions));
    window.HD20_SUBNAV.select('audit','retention');
  });
  const latestTrace=await page.locator('#hd20AuditCloseEvaluation, #hd20RetentionActionTrace').getByText('E2E-ACTION-TRACE-2').count();
  assert.ok(latestTrace,'recheck failure must show latest followup corrective action ID');

  await page.evaluate(()=>{
    for(const [key,id] of [['hd20RetentionRandomChecksV1','E2E-RET-TRACE-1'],['hd20ActionCasesV2','E2E-ACTION-TRACE-1'],['hd20ActionCasesV2','E2E-ACTION-TRACE-2']]){
      const rows=JSON.parse(localStorage.getItem(key)||'[]');
      localStorage.setItem(key,JSON.stringify(rows.filter(x=>x.id!==id)));
    }
    window.HD20_SUBNAV.select('audit','retention');
  });
  // New Audit data may re-render the same DOM. The active view must remain isolated.
  await page.evaluate(()=>window.dispatchEvent(new Event('hd20-audit-updated')));
  await page.waitForTimeout(180);
  await assertAuditSubtab('retention');
  await assertAuditSubtab('draw');


  // The theme sub-section must remain accessible and must not be hidden by the Audit-only rule.
  await page.evaluate(()=>window.HD20_NAV?.openAuditSection?.('theme'));
  await page.waitForFunction(()=>window.HD20_NAV?.active?.()==='theme',null,{timeout:15000});
  const theme=await page.evaluate(()=>{
   const host=document.getElementById('awTheme');
   return {visible:!!host&&!host.hidden&&getComputedStyle(host).display!=='none'&&host.getClientRects().length>0,active:document.querySelector('.beginnerNav button[data-key="theme"]')?.classList.contains('active')};
  });
  assert.equal(theme.visible,true,'theme workspace must remain visible');
  assert.equal(theme.active,true,'Theme main navigation selected independently');
  await page.screenshot({path:'artifacts/audit-theme.png',fullPage:false});
  // Switching back must not resurrect duplicate Audit headers or lose retention content.
  await page.evaluate(()=>window.HD20_NAV?.openAuditSection?.('audit'));
  await page.waitForFunction(()=>window.HD20_NAV?.active?.()==='audit',null,{timeout:15000});
  const returned=await page.evaluate(()=>{
    const visible=el=>!!el&&!el.hidden&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden'&&el.getClientRects().length>0;
    return {
      duplicateBanner:visible(document.querySelector('#hd20PurposePanel[data-contract="audit.draw"]')),
      duplicateHero:visible(document.querySelector('#awAudit>.awHero')),
      sixMonthTable:!!document.querySelector('#awAudit .audit6m table')
    };
  });
  assert.equal(returned.duplicateBanner,false,'Audit duplicate banner must remain hidden after theme return');
  assert.equal(returned.duplicateHero,false,'Audit duplicate hero must remain hidden after theme return');
  assert.ok(returned.sixMonthTable,'Audit six-month table must remain mounted after theme return');
  await page.screenshot({path:'artifacts/audit-return.png',fullPage:false});
  await page.evaluate(()=>window.HD20_NAV?.go?.('dashboard'));
  await page.waitForFunction(()=>document.querySelector('.beginnerNav button[data-key="dashboard"]')?.classList.contains('active'),null,{timeout:15000});
  console.log('AUDIT DUPLICATE HEADER BROWSER PASS');
 }catch(error){if(page)await page.screenshot({path:'artifacts/audit-failure.png',fullPage:false}).catch(()=>{});throw error}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
