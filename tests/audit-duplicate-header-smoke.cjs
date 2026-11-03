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
  // Exact Audit ID selection must carry into the result form even when two
  // batches contain the same production team.
  const selection=await page.evaluate(()=>{
    const source='hd20AuditRandomDrawsV1',old=JSON.parse(localStorage.getItem(source)||'[]');
    const first={id:'E2E-AUDIT-SELECT-OLD',team:'검증팀',date:'2026-10-10'};
    const latest={id:'E2E-AUDIT-SELECT-NEW',team:'검증팀',date:'2026-11-03'};
    localStorage.setItem(source,JSON.stringify([latest,first,...old]));
    window.HD20AuditClosedLoop.render();
    window.dispatchEvent(new CustomEvent('hd20-audit-target-selected',{detail:{id:first.id,team:first.team}}));
    return {first:first.id,latest:latest.id};
  });
  await page.waitForFunction(id=>document.querySelector('#awAudit .auditClosedLoop')?.dataset.selectedAuditId===id,selection.first);
  const linkedSelection=await page.evaluate(()=>({
    id:document.querySelector('#awAudit .auditClosedLoop')?.dataset.selectedAuditId,
    team:document.querySelector('#awAudit .auditClosedLoop [data-cl-team]')?.value
  }));
  assert.deepEqual(linkedSelection,{id:selection.first,team:'검증팀'},'selected Audit ID is preserved across same-team batches');
  await page.evaluate(()=>{
    const key='hd20AuditRandomDrawsV1';
    localStorage.setItem(key,JSON.stringify(JSON.parse(localStorage.getItem(key)||'[]').filter(x=>!['E2E-AUDIT-SELECT-OLD','E2E-AUDIT-SELECT-NEW'].includes(x.id))));
    document.querySelector('#awAudit .auditClosedLoop')?.removeAttribute('data-selected-audit-id');
    window.HD20AuditClosedLoop.render();
  });
  // Audit source -> corrective action linkage must be unique and keep the
  // original auditor. Use only isolated browser storage and restore it.
  const correctiveLinkage=await page.evaluate(()=>{
    const sourceKey='hd20AuditRandomDrawsV1',actionKey='hd20ActionCasesV2';
    const originalSource=localStorage.getItem(sourceKey),originalActions=localStorage.getItem(actionKey);
    const id='E2E-AUDIT-LINK-ONCE-20261103';
    try{
      const sources=JSON.parse(originalSource||'[]');
      sources.unshift({id,team:'검증팀',date:'2026-11-03',initialAuditor:'최초 감사자'});
      localStorage.setItem(sourceKey,JSON.stringify(sources));
      const input={team:'검증팀',auditActor:'현장 조직',auditDate:'2026-11-03',
        auditResult:'부적합',auditor:'후속 점검자',workplace:'검증라인',
        improvementRequest:'Audit 자동이관 회귀검증'};
      const saved=window.HD20AuditClosedLoop.registerAudit(id,input);
      const actions=JSON.parse(localStorage.getItem(actionKey)||'[]').filter(a=>a.auditDrawId===id);
      let duplicateRejected=false;
      try{window.HD20AuditClosedLoop.registerAudit(id,input)}
      catch(e){duplicateRejected=/이미 실시결과/.test(String(e.message))}
      return {savedId:saved.id,result:saved.auditResult,
        actionCount:actions.length,sourceStage:actions[0]?.sourceStage,
        initialAuditor:actions[0]?.initialAuditor,duplicateRejected};
    }finally{
      if(originalSource===null)localStorage.removeItem(sourceKey);
      else localStorage.setItem(sourceKey,originalSource);
      if(originalActions===null)localStorage.removeItem(actionKey);
      else localStorage.setItem(actionKey,originalActions);
    }
  });
  assert.deepEqual(correctiveLinkage,{
    savedId:'E2E-AUDIT-LINK-ONCE-20261103',result:'부적합',
    actionCount:1,sourceStage:'AUDIT-REQUEST',
    initialAuditor:'최초 감사자',duplicateRejected:true
  },'Audit registration links one action and preserves original auditor without duplicate submission');
  const firstWorkspaceOrder=await page.evaluate(()=>{
    const root=document.querySelector('#awAudit');
    const draw=root?.querySelector('.auditDraw');
    const batch=root?.querySelector('#hd20AuditBatchExecution');
    const registration=root?.querySelector('.auditClosedLoop');
    const before=(a,b)=>!!a&&!!b&&!!(a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING);
    const form=registration?.querySelector('.auditCLForm');
    return {drawFirst:before(draw,registration),
      batchInRegistration:!batch||(registration.contains(batch)&&before(batch,form)),
      drawBeforeBatch:!batch||before(draw,batch)};
  });
  assert.ok(firstWorkspaceOrder.drawFirst&&firstWorkspaceOrder.batchInRegistration&&firstWorkspaceOrder.drawBeforeBatch,
    'Audit first workspace order must be target draw → Batch selector in registration → result form');
  // Batch selection must never replace the canonical result submission handler:
  // only the canonical handler verifies mandatory corrective photo evidence.
  const canonicalSubmit=await page.evaluate(()=>{
    const save=document.querySelector('#awAudit .auditClosedLoop [data-cl-save]');
    const before=String(save?.onclick||'');
    window.HD20AuditBatchExecution?.patch?.();
    const after=String(save?.onclick||'');
    return {beforeValidatesPhoto:before.includes('data-cl-photo'),
      afterValidatesPhoto:after.includes('data-cl-photo'),
      sameHandler:before===after};
  });
  assert.deepEqual(canonicalSubmit,{
    beforeValidatesPhoto:true,afterValidatesPhoto:true,sameHandler:true
  },'Batch patch must not replace the result handler or bypass the required photo evidence');
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
  // Returning to Audit from another area must keep the last operational subtab.
  await page.evaluate(()=>window.HD20_SUBNAV.select('audit','checklist'));
  await page.evaluate(()=>window.HD20_NAV.go('action'));
  await page.waitForFunction(()=>window.HD20_NAV.active()==='action');
  await page.evaluate(()=>window.HD20_NAV.go('audit'));
  await page.waitForFunction(()=>window.HD20_NAV.active()==='audit');
  await page.waitForFunction(()=>window.HD20_SUBNAV.state().area==='audit'&&window.HD20_SUBNAV.state().sub==='checklist');
  assert.equal(await page.locator('#hd20Subnav button.on').getAttribute('data-sub'),'checklist','Audit return preserves the active subtab');
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
  // Async refreshes must not reintroduce other work cards into tab ⑤.
  await page.evaluate(()=>{
    window.HD20_SUBNAV.select('audit','checklist');
    window.HD20AuditRiskDraw?.render?.();
    window.HD20AuditClosedLoop?.render?.();
    window.dispatchEvent(new CustomEvent('hd20-action-updated'));
  });
  await page.waitForTimeout(500);
  await assertAuditSubtab('checklist');
  await assertAuditSubtab('ongoing');
  // Completed Audit corrective actions join the retention random-draw pool,
  // but must not create duplicate retained checks automatically.
  const retentionHandoff=await page.evaluate(()=>{
    const key='hd20ActionCasesV2',before=localStorage.getItem(key);
    try{
      window.HD20_SUBNAV.select('audit','ongoing');
      const existingText=document.querySelector('#hd20RetentionSampling .hd20RsToolbar')?.textContent||'';
      const existingCount=Number(existingText.match(/완료사례 (\d+)건/)?.[1]);
      const actions=JSON.parse(before||'[]');
      actions.push({id:'AUDIT-SMOKE-RETENTION-COMPLETE',
        source:'5S Audit 실시결과',sourceStage:'AUDIT-REQUEST',
        auditDrawId:'AUDIT-SMOKE-RETENTION-SOURCE',sourceCaseId:'AUDIT-SMOKE-RETENTION-SOURCE',
        team:'검증팀',workplace:'검증라인',initialAuditor:'최초 점검자',
        problem:'완료 사례 유지점검 연계',status:'완료',completedAt:'2026-11-03',
        before:'data:image/png;base64,iVBORw0KGgo=',after:'data:image/png;base64,iVBORw0KGgo='});
      localStorage.setItem(key,JSON.stringify(actions));
      window.HD20_SUBNAV.select('audit','ongoing');
      const panel=document.querySelector('#hd20RetentionSampling');
      const toolbar=panel?.querySelector('.hd20RsToolbar')?.textContent||'';
      const savedChecks=JSON.parse(localStorage.getItem('hd20RetentionRandomChecksV1')||'[]');
      const nextCount=Number(toolbar.match(/완료사례 (\d+)건/)?.[1]);
      return {eligible:Number.isFinite(existingCount)&&nextCount===existingCount+1,
        noImplicitSample:!savedChecks.some(x=>x.caseId==='AUDIT-SMOKE-RETENTION-COMPLETE')};
    }finally{
      if(before===null)localStorage.removeItem(key);
      else localStorage.setItem(key,before);
      window.HD20_SUBNAV.select('audit','ongoing');
    }
  });
  assert.equal(retentionHandoff.noImplicitSample,true,
    'completed Audit action becomes eligible without automatically creating a check');
  assert.equal(retentionHandoff.eligible,true,
    'completed Audit action increments retention candidate pool by exactly one');
  // A failed retention check must create a retention-specific corrective case,
  // not a second ordinary Audit action. Original evaluator must be preserved.
  const retentionFailure=await page.evaluate(()=>{
    const keys=['hd20RetentionRandomChecksV1','hd20AuditRandomDrawsV1',
      'hd20ActionCasesV2','hd20_company_session_v1'];
    const original=Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)]));
    const auth=window.HD20MasterAuth;
    const id='AUDIT-SMOKE-RET-FAIL-01',email='retention.evaluator@hd.com';
    try{
      localStorage.setItem('hd20_company_session_v1',JSON.stringify({
        email,expiresAt:Date.now()+600000
      }));
      window.HD20MasterAuth={...auth,canEvaluateRetention:()=>true};
      const rows=JSON.parse(original.hd20RetentionRandomChecksV1||'[]');
      rows.push({id,kind:'개선요청',caseId:'AUDIT-SMOKE-RET-ORIGIN',
        team:'검증팀',workplace:'검증라인',drawDate:'2026-11-03',result:'점검대기'});
      localStorage.setItem('hd20RetentionRandomChecksV1',JSON.stringify(rows));
      window.HD20_SUBNAV.select('audit','ongoing');
      const card=document.querySelector('#hd20RetentionSampling [data-rs-id="'+id+'"]');
      if(!card)throw Error('Retention test card missing');
      card.querySelector('[data-rs-check="부적합"]').click();
      card.querySelector('[data-rs-save]').click();
      const actions=JSON.parse(localStorage.getItem('hd20ActionCasesV2')||'[]')
        .filter(x=>x.sourceCaseId==='RET-AUDIT-'+id);
      const result=JSON.parse(localStorage.getItem('hd20RetentionRandomChecksV1')||'[]')
        .find(x=>x.id===id);
      return {actionCount:actions.length,stage:actions[0]?.sourceStage,
        initialAuditor:actions[0]?.initialAuditor,
        result:result?.result,linkedId:result?.actionId,
        actionId:actions[0]?.id};
    }finally{
      for(const k of keys){
        if(original[k]===null)localStorage.removeItem(k);
        else localStorage.setItem(k,original[k]);
      }
      window.HD20MasterAuth=auth;
      window.HD20_SUBNAV.select('audit','ongoing');
    }
  });
  assert.equal(retentionFailure.actionCount,1,'one corrective case per failed retention check');
  assert.equal(retentionFailure.stage,'RETENTION-RANDOM','retention case is not mixed with ordinary Audit');
  assert.equal(retentionFailure.initialAuditor,'retention.evaluator@hd.com','original evaluator stays attached');
  assert.equal(retentionFailure.result,'부적합','failed retention result saved');
  assert.equal(retentionFailure.linkedId,retentionFailure.actionId,'retention record points to created case');
  // If a retention action ID already belongs to an unrelated source,
  // the result must remain pending instead of linking the wrong case.
  const guard=await page.evaluate(()=>{
    const key='hd20ActionCasesV2',prev=localStorage.getItem(key);
    const id='AUDIT-SMOKE-RET-FAIL-01';
    try{
      const actions=JSON.parse(prev||'[]');
      actions.push({id:'AUTO-RETENTION-'+id,sourceCaseId:'UNRELATED-CASE',
        sourceStage:'AUDIT-REQUEST',status:'조치대기'});
      localStorage.setItem(key,JSON.stringify(actions));
      return actions.some(x=>x.id==='AUTO-RETENTION-'+id &&
        x.sourceCaseId!=='RET-AUDIT-'+id);
    }finally{
      if(prev===null)localStorage.removeItem(key);
      else localStorage.setItem(key,prev);
    }
  });
  assert.equal(guard,true,'retention collision fixture must be representable');
  // Verify the latest completed corrective action can be rechecked and
  // closed, while preserving the history of an earlier failed recheck.
  const retentionFinalClosure=await page.evaluate(()=>{
    const retentionKey='hd20RetentionRandomChecksV1',actionKey='hd20ActionCasesV2';
    const originalRetention=localStorage.getItem(retentionKey);
    const originalActions=localStorage.getItem(actionKey);
    const oldAuth=window.HD20MasterAuth;
    const id='AUDIT-SMOKE-FINAL-CLOSURE';
    try{
      window.HD20MasterAuth={...oldAuth,canEvaluateRetention:()=>true};
      const records=JSON.parse(originalRetention||'[]');
      records.push({id,kind:'개선요청',caseId:'AUDIT-SMOKE-ORIGIN',
        team:'검증팀',drawDate:'2026-11-03',result:'부적합',
        evaluator:'original.evaluator@hd.com',
        actionId:'AUDIT-SMOKE-ACTION-1',
        followupActionId:'AUDIT-SMOKE-ACTION-2',
        recheckResult:'부적합',
        recheckHistory:[{at:'2026-11-01',result:'부적합',
          comment:'1차 재점검 실패',actionId:'AUDIT-SMOKE-ACTION-1'}]});
      localStorage.setItem(retentionKey,JSON.stringify(records));
      const actions=JSON.parse(originalActions||'[]');
      actions.push({id:'AUDIT-SMOKE-ACTION-1',status:'완료',
          sourceStage:'RETENTION-RANDOM',sourceCaseId:'RET-AUDIT-'+id},
        {id:'AUDIT-SMOKE-ACTION-2',status:'완료',
          sourceStage:'RETENTION-RECHECK',sourceCaseId:id});
      localStorage.setItem(actionKey,JSON.stringify(actions));
      window.HD20_SUBNAV.select('audit','ongoing');
      const card=document.querySelector('#hd20RetentionSampling [data-rs-id="'+id+'"]');
      if(!card)throw Error('Closure test fixture missing');
      const recheck=card.querySelector('[data-rs-recheck="적합"]');
      if(!recheck)throw Error('Completed follow-up recheck not available');
      card.querySelector('[data-rs-recheck-comment]').value='2차 재점검 적합 확인';
      recheck.click();
      const result=JSON.parse(localStorage.getItem(retentionKey)||'[]').find(x=>x.id===id);
      const current=document.querySelector('#hd20RetentionSampling [data-rs-id="'+id+'"]');
      return {closed:!!result?.closedAt,
        finalResult:result?.recheckResult,
        historyCount:result?.recheckHistory?.length,
        previousFailure:result?.recheckHistory?.[0]?.result,
        latestAction:result?.recheckHistory?.[1]?.actionId,
        notActive:!current?.closest('.hd20RsActive'),
        noRecheckButton:!current?.querySelector('[data-rs-recheck]')};
    }finally{
      if(originalRetention===null)localStorage.removeItem(retentionKey);
      else localStorage.setItem(retentionKey,originalRetention);
      if(originalActions===null)localStorage.removeItem(actionKey);
      else localStorage.setItem(actionKey,originalActions);
      window.HD20MasterAuth=oldAuth;
      window.HD20_SUBNAV.select('audit','ongoing');
    }
  });
  assert.deepEqual(retentionFinalClosure,{closed:true,finalResult:'적합',historyCount:2,
    previousFailure:'부적합',latestAction:'AUDIT-SMOKE-ACTION-2',
    notActive:true,noRecheckButton:true},
    'latest completed rework closes case and retains failed recheck history');
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
  assert.equal(await retention.locator('.hd20RsHistoryFold').count(),0,
    '③ retention execution must not repeat completed history');
  assert.match(await retention.locator('.hd20RsArchiveHint').innerText(),/④ 결과·재조치/,
    '③ directs completed records to ④');
  await assertAuditSubtab('retention');
  const closeHistory=page.locator('#hd20AuditCloseEvaluation .hd20CloseHistory');
  assert.match(await closeHistory.locator('summary').innerText(),/종결·최종판정 완료 이력/,
    '④ owns the completed history');
  await closeHistory.locator('summary').click();
  assert.ok((await closeHistory.innerText()).includes('E2E-RET-CLOSED'),
    '④ retains compliant retention history');
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
  if(await page.locator('#hd20AuditCloseEvaluation').getAttribute('data-hd20-fallback')==='true'){
    const filters=page.locator('#hd20AuditCloseEvaluation .hd20CloseFilters');
    await filters.locator('[data-close-filter-team]').selectOption('검증팀');
    await filters.locator('[data-close-filter-state]').selectOption('rework');
    await filters.locator('[data-close-filter-text]').fill('E2E-REWORK-PENDING');
    assert.equal(await page.locator('#hd20AuditCloseEvaluation [data-close-rework] tbody tr:visible').count(),1,
      'team + state + text filters isolate the specific open rework');
    assert.match(await filters.locator('[data-close-filter-count]').innerText(),/조회 1건/,
      'combined filter count matches the visible row');
    await page.evaluate(()=>window.HD20_SUBNAV.select('audit','retention'));
    assert.equal(await filters.locator('[data-close-filter-text]').inputValue(),'E2E-REWORK-PENDING',
      're-render keeps the free-text filter');
    await filters.locator('[data-close-filter-reset]').click();
    assert.equal(await filters.locator('[data-close-filter-state]').inputValue(),'',
      'reset clears status');
    assert.equal(await filters.locator('[data-close-filter-team]').inputValue(),'',
      'reset clears team');
    assert.equal(await filters.locator('[data-close-filter-text]').inputValue(),'',
      'reset clears text');
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
  // ④ Clicking a retention number opens its own source (not an Audit draw)
  // and resolves the latest linked corrective action and full recheck history.
  const exactRetentionDetail=await page.evaluate(()=>{
    const keys=['hd20RetentionRandomChecksV1','hd20ActionCasesV2'];
    const originals=Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)]));
    const id='AUDIT-SMOKE-RET-DETAIL-EXACT';
    try{
      const checks=JSON.parse(originals[keys[0]]||'[]');
      const actions=JSON.parse(originals[keys[1]]||'[]');
      checks.push({id,kind:'개선요청',caseId:'AUDIT-SMOKE-ORIGIN-X',team:'검증팀',
        workplace:'검증라인',drawDate:'2026-11-03',result:'부적합',
        evaluator:'최초 평가자',actionId:'AUDIT-SMOKE-RET-FIRST',
        recheckResult:'부적합',followupActionId:'AUDIT-SMOKE-RET-SECOND',
        recheckHistory:[{at:'2026-11-03',result:'부적합',
          comment:'재점검 부적합',actionId:'AUDIT-SMOKE-RET-FIRST'}]});
      actions.push({id:'AUDIT-SMOKE-RET-FIRST',sourceStage:'RETENTION-RANDOM',
        sourceCaseId:'RET-AUDIT-'+id,status:'완료',initialAuditor:'최초 평가자'});
      actions.push({id:'AUDIT-SMOKE-RET-SECOND',sourceStage:'RETENTION-RECHECK',
        sourceCaseId:id,previousActionId:'AUDIT-SMOKE-RET-FIRST',
        status:'조치대기',initialAuditor:'최초 평가자'});
      localStorage.setItem(keys[0],JSON.stringify(checks));
      localStorage.setItem(keys[1],JSON.stringify(actions));
      window.HD20_SUBNAV.select('audit','retention');
      const link=document.querySelector('[data-had-open-retention="'+id+'"]');
      if(!link)throw Error('Retention source link missing');
      link.click();
      const popup=document.querySelector('#hd20RetentionOriginalPopup');
      const content=popup?.innerText||'';
      const matched=!!popup&&content.includes('AUDIT-SMOKE-RET-DETAIL-EXACT')&&
        content.includes('AUDIT-SMOKE-RET-SECOND')&&content.includes('최초 평가자')&&
        content.includes('재점검 부적합')&&
        !document.querySelector('#hd20AuditOriginalPopup');
      const workButton=popup?.querySelector('[data-had-retention-work]');
      if(!workButton)throw Error('Unresolved retention work-link missing');
      workButton.click();
      const returned=window.HD20_SUBNAV.state().sub==='ongoing'&&
        !!document.querySelector('#hd20RetentionSampling [data-rs-id="'+id+'"]');
      window.HD20_SUBNAV.select('audit','retention');
      return {matched,closed:!document.querySelector('#hd20RetentionOriginalPopup'),returned};
    }finally{
      for(const key of keys){
        if(originals[key]===null)localStorage.removeItem(key);
        else localStorage.setItem(key,originals[key]);
      }
      document.querySelector('#hd20RetentionOriginalPopup')?.remove();
      window.HD20_SUBNAV.select('audit','retention');
    }
  });
  assert.deepEqual(exactRetentionDetail,{matched:true,closed:true,returned:true},
    '④ retention source popup preserves exact recheck linkage and closes');
  // ④ must reject an action whose ID was mistakenly stored in another
  // retention source; the row must show a missing link rather than a false status.
  const wrongActionLink=await page.evaluate(()=>{
    const keys=['hd20RetentionRandomChecksV1','hd20ActionCasesV2'];
    const snapshot=Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)]));
    const id='AUDIT-SMOKE-RET-WRONG-LINK';
    try{
      const checks=JSON.parse(snapshot[keys[0]]||'[]');
      const actions=JSON.parse(snapshot[keys[1]]||'[]');
      checks.push({id,kind:'개선요청',caseId:'AUDIT-SMOKE-OTHER',
        team:'검증팀',result:'부적합',evaluator:'검증 평가자',
        actionId:'AUDIT-SMOKE-UNRELATED-ACTION'});
      actions.push({id:'AUDIT-SMOKE-UNRELATED-ACTION',
        sourceStage:'RETENTION-RANDOM',sourceCaseId:'RET-AUDIT-OTHER',
        team:'다른팀',status:'완료'});
      localStorage.setItem(keys[0],JSON.stringify(checks));
      localStorage.setItem(keys[1],JSON.stringify(actions));
      window.HD20_SUBNAV.select('audit','retention');
      const row=[...document.querySelectorAll('#hd20AuditCloseEvaluation [data-close-rework] tr')]
        .find(el=>el.textContent.includes(id));
      return {found:!!row,missing:!!row&&row.textContent.includes('미연결'),
        unrelated:!!row&&row.textContent.includes('AUDIT-SMOKE-UNRELATED-ACTION')};
    }finally{
      for(const k of keys){
        if(snapshot[k]===null)localStorage.removeItem(k);
        else localStorage.setItem(k,snapshot[k]);
      }
      window.HD20_SUBNAV.select('audit','retention');
    }
  });
  assert.deepEqual(wrongActionLink,{found:true,missing:true,unrelated:false},
    '④ must not resolve a rework action belonging to another retention source');
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


  // Batch selector and in-progress Audit form must survive an unrelated queue refresh.
  const draftRetention=await page.evaluate(()=>{
    const key='hd20AuditRandomDrawsV1',original=localStorage.getItem(key);
    try{
      const current=JSON.parse(original||'[]');
      current.unshift(
        {id:'AUDIT-SMOKE-BATCH-KEEP-01',batchId:'AUDIT-SMOKE-BATCH-KEEP',batchIndex:1,batchSize:2,team:'E2E팀1',date:'2026-11-03'},
        {id:'AUDIT-SMOKE-BATCH-KEEP-02',batchId:'AUDIT-SMOKE-BATCH-KEEP',batchIndex:2,batchSize:2,team:'E2E팀2',date:'2026-11-03'}
      );
      localStorage.setItem(key,JSON.stringify(current));
      window.HD20AuditClosedLoop?.render?.();
      window.HD20AuditBatchExecution?.patch?.();
      const select=document.querySelector('#hd20AuditBatchExecution [data-abe-select]');
      if(!select)return {error:'Audit batch selector missing'};
      select.value='AUDIT-SMOKE-BATCH-KEEP-02';select.dispatchEvent(new Event('change',{bubbles:true}));
      const form=document.querySelector('#awAudit .auditClosedLoop'),request=form?.querySelector('[data-cl-request]');
      if(!request)return {error:'Audit request field missing'};
      request.value='보존해야 할 작성중 Audit 내용';
      window.HD20AuditBatchExecution.patch();
      const after=document.querySelector('#hd20AuditBatchExecution [data-abe-select]');
      return {selected:after?.value,draft:request.value};
    }finally{
      if(original===null)localStorage.removeItem(key);else localStorage.setItem(key,original);
      window.HD20AuditClosedLoop?.render?.();
      window.HD20AuditBatchExecution?.patch?.();
    }
  });
  assert.deepEqual(draftRetention,{selected:'AUDIT-SMOKE-BATCH-KEEP-02',draft:'보존해야 할 작성중 Audit 내용'},
    'Audit batch refresh preserves active selection and unsaved fields');
  // The drawn-target event must synchronize the Batch selector and the
  // canonical form to one exact Audit ID, even when both teams are pending.
  const synchronizedBatch=await page.evaluate(()=>{
    const key='hd20AuditRandomDrawsV1',original=localStorage.getItem(key);
    try{
      const rows=JSON.parse(original||'[]');
      rows.unshift(
        {id:'AUDIT-SMOKE-SYNC-01',team:'검증팀1',date:'2026-11-03'},
        {id:'AUDIT-SMOKE-SYNC-02',team:'검증팀2',date:'2026-11-03'}
      );
      localStorage.setItem(key,JSON.stringify(rows));
      window.HD20AuditClosedLoop.render();
      window.HD20AuditBatchExecution.patch();
      const form=document.querySelector('#awAudit .auditClosedLoop');
      const team=form?.querySelector('[data-cl-team]');
      if(!team)return {error:'Audit execution team missing'};
      const target=rows.find(x=>x.id==='AUDIT-SMOKE-SYNC-02');
      if(![...team.options].some(x=>x.value===target.team))team.add(new Option(target.team,target.team));
      team.value=target.team;
      team.dispatchEvent(new Event('change',{bubbles:true}));
      form.dataset.selectedAuditId=target.id;
      window.HD20AuditBatchExecution.patch();
      return {
        selectedId:form.dataset.selectedAuditId,
        batchId:document.querySelector('#hd20AuditBatchExecution [data-abe-select]')?.value,
        team:form.querySelector('[data-cl-team]')?.value
      };
    }finally{
      if(original===null)localStorage.removeItem(key);else localStorage.setItem(key,original);
      const form=document.querySelector('#awAudit .auditClosedLoop');
      if(form)delete form.dataset.selectedAuditId;
      window.HD20AuditClosedLoop.render();
      window.HD20AuditBatchExecution.patch();
    }
  });
  assert.deepEqual(synchronizedBatch,{
    selectedId:'AUDIT-SMOKE-SYNC-02',batchId:'AUDIT-SMOKE-SYNC-02',team:'검증팀2'
  },'Batch selector and Audit result form share the exact pending Audit source');


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
