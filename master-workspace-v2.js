(()=>{'use strict';
const GROUPS=[['조직·목표','integrated-team','integrated-target'],['등록·분류','integrated-source','integrated-discovery','integrated-factor'],['현장·점검','integrated-workplace','integrated-theme','policy'],['시스템','integrated-mail','integrated-admins']];
const NOTES={'integrated-team':'팀 구성·인원·책임자','integrated-target':'팀별 목표 및 분기 기준','integrated-source':'개선요청 출처','integrated-discovery':'발굴 유형과 표시 순서','integrated-factor':'업무분류·상태·우선순위','integrated-workplace':'작업장·세부위치','integrated-theme':'5대 상위테마·하위 세부테마·점검항목','policy':'Audit 표본·기한·운영기준','integrated-admins':'마스터 관리자 권한','integrated-mail':'메일링 수신·운영'};
function init(){const root=document.getElementById('masterModal'),box=root?.querySelector('.masterInfoBox'),tabs=box?.querySelector('.masterTabs');if(!box||!tabs)return false;
if(root.querySelector('#hd20MasterWorkspace')){
 const existing=root.querySelector('#hd20MasterWorkspace');
 const links=existing?.querySelectorAll('[data-hm-target]')?.length||0;
 box.classList.toggle('hd20MasterWorkspaceReady',links>=10);
 return links>=10;
}const required=['integrated-team','integrated-target','integrated-source','integrated-discovery','integrated-factor','integrated-workplace','integrated-theme','policy','integrated-admins','integrated-mail'];if(!required.every(k=>tabs.querySelector('[data-master-tab="'+k+'"]')))return false;
const ws=document.createElement('section');ws.id='hd20MasterWorkspace';ws.innerHTML='<div class="hmTitle"><div><span class="hmEyebrow">HD-20 · MASTER DATA</span><h2>통합기준정보</h2><p>공통 기준정보는 이곳에서 관리하고, 모든 업무탭은 동일 원천을 사용합니다.</p></div><div class="hmCounters"><button type="button" class="hmIntegrityButton" data-hm-open-registry>연동·누락 점검</button><button type="button" data-hm-close aria-label="통합기준정보 닫기">닫기 ×</button></div></div><div class="hmToolbar"><label for="hmSearch">기준정보 찾기</label><input id="hmSearch" type="search" placeholder="생산팀·목표·작업장·5S 테마·Audit·권한·메일" autocomplete="off"><button type="button" data-hm-reset>초기화</button></div><div class="hmGroups" data-hm-groups role="navigation" aria-label="기준정보 관리 분류"></div><div class="hmCurrent" aria-live="polite"><div><small>선택된 기준정보</small><strong data-hm-current>관리 항목을 선택하세요</strong><span data-hm-current-desc>관리 항목을 선택하면 원본 기준정보 편집 화면이 표시됩니다.</span></div><span data-hm-count></span></div><details class="hmAudit" aria-label="기준정보·타 탭 연동점검"><summary class="hmAuditSummary">연동진단 <span data-hm-audit-summary>점검 준비</span></summary><div class="hmAuditTop"><div><strong>업무별 기준정보 연동 점검</strong><p>정보 원천을 수정하지 않고 연결만 진단합니다.</p></div><div class="hmAuditActions"><button type="button" data-hm-audit-refresh>다시 점검</button></div></div><div class="hmAuditDetails"><div class="hmAuditRows" data-hm-audit-rows></div></div></details>';
box.insertBefore(ws,tabs);
/* Unified ownership inventory: existing canonical editors are reused, never duplicated.
   Every operational tab's sources are discoverable from the master workspace. */
const SOURCE_MAP=[
 {area:'종합 대시보드',name:'자율개선·생산팀 실적 원천',key:'hd20GMES5SAutoImproveRawV1',targetArea:'dashboard',note:'확정 대시보드는 원천 데이터를 읽기 전용으로 집계'},
 {area:'종합 대시보드',name:'개선조치·완료 실적 원천',key:'hd20ActionCasesV2',targetArea:'dashboard',note:'개선조치 원본과 동일 데이터를 참조; 기준정보로 재저장 금지'},
 {area:'고도화·표준화',name:'생산팀별 고도화 대상 실적',key:'hd20GMES5SAutoImproveRawV1',targetArea:'advancement',note:'고도화 3대요건 적용 및 판정 결과는 원본에서 관리'},
 {area:'고도화·표준화',name:'3대요건 공통 판정 규칙',api:'HD20DirectCriteria',targetArea:'advancement',note:'고도화 판정에 필요한 단일 규칙 모듈'},
 {area:'자율개선조회',name:'생산팀·인원·팀장',key:'gmes5s_team_org_master_v1',editor:'integrated-team',api:'HD20ProductionTeamMaster'},
 {area:'자율개선조회',name:'팀별 개선목표',key:'gmes5s_team_targets_v1',editor:'integrated-target'},
 {area:'자율개선조회',name:'발굴유형·업무분류',key:'gmes5s_work_factor_master_v1',editor:'integrated-factor'},
 {area:'개선요청조회',name:'요청출처·발굴유형',key:'gmes5s_request_source_order',editor:'integrated-discovery'},
 {area:'개선요청조회',name:'작업장·세부위치',key:'hd20UlsanWorkplaceMasterV1',editor:'integrated-workplace',api:'HD20WorkplaceMaster'},
 {area:'개선조치·완료관리',name:'운영단계·상태·우선순위',key:'gmes5s_work_factor_master_v1',editor:'integrated-factor'},
 {area:'개선조치·완료관리',name:'조치기한·재점검 정책',key:'hd20OperatingPolicyV1',editor:'policy',api:'HD20PolicyConfig'},
 {area:'Audit점검',name:'Audit 점검항목 원천',key:'hd20AuditChecklistV1',api:'HD20_GLOBAL_AUDIT_MASTER',targetArea:'audit',targetSub:'checklist',note:'Audit ③ 점검항목 편집기와 연결'},
 {area:'Audit점검',name:'점검·표본 운영기준',key:'hd20OperatingPolicyV1',editor:'policy',api:'HD20PolicyConfig'},
 {area:'테마점검',name:'5S 상위·세부테마·판정항목',key:'hd20ThemeCatalogMasterV1',editor:'integrated-theme',api:'HD20ThemeMaster'},
 {area:'테마점검',name:'5S모듈·생산팀장 점검계획',key:'hd20ThemeAuditPlansV1',targetArea:'theme',note:'점검 주체·팀·라인·월별 계획'},
 {area:'테마점검',name:'점검 주체·생산팀장 이메일',key:'hd20TeamLeaderMasterV1',editor:'integrated-team'},
 {area:'유지점검',name:'유지점검 주기·표본·기한',key:'hd20OperatingPolicyV1',editor:'policy',api:'HD20PolicyConfig'},
 {area:'유지점검',name:'5S모듈 점검 수신자',key:'hd20Retention5SModuleRecipientsV1',targetArea:'audit',note:'유지점검 관리화면에서 운영'},
 {area:'고도화',name:'고도화 3대요건 판정기준',api:'HD20DirectCriteria',targetArea:'advancement',note:'공통 판정 모듈을 사용; 별도 중복 마스터 생성 금지'},
 {area:'고도화',name:'생산팀 기준정보·인당 실적',key:'gmes5s_team_org_master_v1',editor:'integrated-team'},
 {area:'공통·시스템',name:'마스터 관리자',key:'hd20MasterAdminEmailsV1',editor:'integrated-admins',api:'HD20MasterAccess'},
 {area:'공통·시스템',name:'메일링 운영정보',key:'gmes5s_mailing_master_v1',editor:'integrated-mail'}
];
const registry=document.createElement('details');registry.className='hmSourceRegistry';
registry.innerHTML='<summary>전체 업무탭 기준정보 연결 맵 <span data-hm-source-total></span><small>원천 저장소·관리 위치·연동 여부 확인</small></summary><div class="hmSourceBody"><p>각 업무탭의 기준정보는 원본 저장소를 공통 참조합니다. 이 화면에서 관리 가능한 항목은 해당 편집기로 이동하며, 업무 중 생성되는 계획·점검·개선 이력은 원래 업무탭에서 관리합니다.</p><div class="hmSourceFilters"><label>업무영역 <select data-hm-source-area><option value="">전체 업무탭</option></select></label><label>기준정보 검색 <input type="search" data-hm-source-query placeholder="원천·업무명·기준정보"></label><button type="button" data-hm-source-refresh>연결 확인</button></div><div data-hm-source-rows class="hmSourceRows"></div><div data-hm-source-result aria-live="polite"></div><div data-hm-source-issues class="hmSourceIssues" aria-label="기준정보 참조 불일치 점검"></div></div>';
box.appendChild(registry);
 const diagnostics=ws.querySelector('.hmAudit');
 if(diagnostics)registry.querySelector('.hmSourceBody').appendChild(diagnostics);
 ws.querySelector('[data-hm-open-registry]').addEventListener('click',()=>{
   registry.open=true;
   refreshSourceRegistry();
   requestAnimationFrame(()=>registry.scrollIntoView({block:'start',behavior:'smooth'}));
 });
const areaSelect=registry.querySelector('[data-hm-source-area]');
[...new Set(SOURCE_MAP.map(x=>x.area))].forEach(area=>{const opt=document.createElement('option');opt.value=area;opt.textContent=area;areaSelect.appendChild(opt)});
const SOURCE_KINDS=Object.freeze({
 hd20AuditChecklistV1:'array',hd20ThemeCatalogMasterV1:'array',hd20ThemeAuditPlansV1:'array',
 hd20TeamLeaderMasterV1:'array',hd20ActionCasesV2:'array',
 gmes5s_team_org_master_v1:'object',gmes5s_team_targets_v1:'object',
 gmes5s_work_factor_master_v1:'object',gmes5s_mailing_master_v1:'array'
});
function sourceReady(item){
 let saved=false,valid=true,records=null;
 try{
  const raw=item.key?localStorage.getItem(item.key):null;
  saved=raw!==null;
  if(saved){
   const value=JSON.parse(raw);
   const kind=SOURCE_KINDS[item.key];
   if(kind==='array'&&!Array.isArray(value))valid=false;
   if(kind==='object'&&(!value||Array.isArray(value)||typeof value!=='object'))valid=false;
   if(Array.isArray(value))records=value.length;
   else if(value&&typeof value==='object')records=Object.keys(value).length;
   else if(value===null)valid=false;
  }
 }catch(error){valid=false}
 const api=!!(item.api&&window[item.api]!=null);
 // Loaded JS module does not prove successful field synchronization.
 return {saved,valid,records,api};
}
function sourceReadJson(key,fallback){
 try{const raw=localStorage.getItem(key);return raw===null?fallback:JSON.parse(raw)}
 catch{return fallback}
}
function sourceIntegrityWarnings(){
 const problems=[];
 const catalog=window.HD20ThemeMaster?.checklist?.()||[];
 const validThemeNames=new Set(catalog.map(x=>String(x.cat||'')));
 const plans=sourceReadJson('hd20ThemeAuditPlansV1',[]);
 if(Array.isArray(plans)){
  const missing=plans.filter(p=>Array.isArray(p?.themes)&&p.themes.some(name=>!validThemeNames.has(String(name))));
  if(catalog.length&&missing.length)problems.push({area:'테마점검',text:'저장된 계획 '+missing.length+'건에서 현재 사용 중인 세부테마와 이름이 일치하지 않습니다.',target:'integrated-theme'});
 }else problems.push({area:'테마점검',text:'점검계획 저장 형식이 배열이 아닙니다.',target:'integrated-theme'});
 const leaders=sourceReadJson('hd20TeamLeaderMasterV1',[]);
 if(Array.isArray(leaders)){
  const known=new Set(window.HD20ProductionTeamMaster?.teamNames?.()||[]);
  const unknown=leaders.filter(x=>x?.team&&known.size&&!known.has(String(x.team)));
  if(unknown.length)problems.push({area:'조직·목표',text:'팀장 마스터 '+unknown.length+'건이 생산팀 기준정보와 일치하지 않습니다.',target:'integrated-team'});
  const emails=leaders.map(x=>String(x?.email||'').trim().toLowerCase()).filter(Boolean);
  const duplicates=[...new Set(emails.filter((mail,i)=>emails.indexOf(mail)!==i))];
  if(duplicates.length)problems.push({area:'조직·목표',text:'동일 팀장 이메일이 '+duplicates.length+'개 중복되어 자율점검 담당팀 자동 지정이 불명확합니다.',target:'integrated-team'});
 }else problems.push({area:'조직·목표',text:'팀장 마스터 저장 형식이 배열이 아닙니다.',target:'integrated-team'});
 const org=sourceReadJson('gmes5s_team_org_master_v1',{});
 if(org&&typeof org==='object'&&!Array.isArray(org)){
  const known=new Set(window.HD20ProductionTeamMaster?.teamNames?.()||[]);
  const extra=Object.keys(org).filter(x=>known.size&&!known.has(x));
  if(extra.length)problems.push({area:'조직·목표',text:'팀 조직정보 '+extra.length+'개 팀명이 생산팀 기준정보와 일치하지 않습니다.',target:'integrated-team'});
 }
 return problems;
}
function refreshSourceRegistry(){
 const query=(registry.querySelector('[data-hm-source-query]').value||'').trim().toLocaleLowerCase(),area=areaSelect.value;
 const list=SOURCE_MAP.filter(x=>(!area||x.area===area)&&(!query||[x.area,x.name,x.key,x.note].join(' ').toLocaleLowerCase().includes(query)));
 const wrap=registry.querySelector('[data-hm-source-rows]');wrap.replaceChildren();
 let ready=0,errors=0;
 for(const item of list){
  const state=sourceReady(item);const present=state.valid&&((state.saved&&state.valid)||state.api);
  if(present)ready++;
  if(!state.valid)errors++;
  const row=document.createElement('div');row.className='hmSourceRow';
  const info=document.createElement('div');info.className='hmSourceInfo';
  const title=document.createElement('strong');title.textContent=item.name;
  const desc=document.createElement('small');desc.textContent=item.area+' · '+(item.key||item.api)+' · '+(item.note||'공통 기준정보 원천');
  info.append(title,desc);
  const status=document.createElement('span');
 status.className=state.valid?(present?'hmSourceReady':'hmSourceVerify'):'hmSourceVerify';
 status.textContent=!state.valid?'저장 데이터 오류':state.saved?'저장 구조 확인'+(state.records!==null?' · '+state.records+'항목':''):state.api?'공통모듈 로드':'미설정·원천 확인';
 status.title='실제 업무탭 필드 동기화는 별도 검증 대상입니다.';
  const btn=document.createElement('button');btn.type='button';btn.textContent=item.editor?'기준정보 편집':'업무탭 열기';
  btn.addEventListener('click',()=>{if(item.editor){openMasterTarget(item.editor)}else if(window.HD20_NAV?.go){document.querySelector('#masterModal [data-hm-close]')?.click();window.HD20_NAV.go(item.targetArea);if(item.targetSub)setTimeout(()=>{if(window.HD20_NAV?.active?.()===item.targetArea)window.HD20_SUBNAV?.select?.(item.targetArea,item.targetSub)},160)}else alert('해당 업무탭을 직접 선택하여 확인해 주세요.')});
  row.append(info,status,btn);wrap.appendChild(row);
 }
 const warnings=sourceIntegrityWarnings();
 const badKeys=[...new Set(list.filter(item=>item.key&&!sourceReady(item).valid).map(item=>item.key))];
 for(const key of badKeys){const source=SOURCE_MAP.find(item=>item.key===key&&item.editor);warnings.push({area:'저장정보 검증',text:'저장 원천 '+key+'의 JSON 형식·데이터 구조를 확인할 수 없습니다. 기존 데이터를 덮어쓰지 마세요.',target:source?.editor||'',key});}
 const result=registry.querySelector('[data-hm-source-result]');
 const issueList=registry.querySelector('[data-hm-source-issues]');
 if(issueList){issueList.replaceChildren();for(const warning of warnings){
  const item=document.createElement('div');item.className='hmSourceIssue';
  const txt=document.createElement('span');txt.textContent=warning.area+' · '+warning.text;
  const btn=document.createElement('button');btn.type='button';btn.textContent='기준정보 확인';if(warning.target){btn.addEventListener('click',()=>openMasterTarget(warning.target));item.append(txt,btn)}else item.append(txt);issueList.appendChild(item);
 }}
 registry.querySelector('[data-hm-source-total]').textContent=SOURCE_MAP.length+'개 연결 항목';
 result.textContent='표시 '+list.length+'개 · 저장정보/모듈 확인 '+ready+'개 · 확인 필요 '+(list.length-ready)+'개'+(errors?' · 손상 가능 데이터 '+errors+'개':'')+' · 참조 불일치 의심 '+warnings.length+'개. 저장소 유무만으로 모든 탭의 필드 동기화가 검증되지는 않습니다.';
}
areaSelect.addEventListener('change',refreshSourceRegistry);
registry.querySelector('[data-hm-source-query]').addEventListener('input',refreshSourceRegistry);
registry.querySelector('[data-hm-source-refresh]').addEventListener('click',()=>{auditMaster();refreshSourceRegistry()});
registry.addEventListener('toggle',()=>{if(registry.open)refreshSourceRegistry()});
['hd20-team-master-updated','hd20-team-targets-updated','hd20-theme-master-updated','hd20-theme-audit-updated','hd20-audit-checklist-master-updated','hd20-policy-updated','hd20-master-factors-updated','hd20-workplace-verified','hd20-action-updated','hd20-activity-updated','hd20-audit-updated','hd20-mailing-master-updated','hd20-master-access-updated','hd20-refresh-requested'].forEach(event=>window.addEventListener(event,()=>{if(registry.open)refreshSourceRegistry()}));
window.addEventListener('storage',()=>{if(registry.open)refreshSourceRegistry()});
refreshSourceRegistry();
// Keep a working close control even when legacy .modalHead is hidden by layout CSS.
ws.querySelector('[data-hm-close]').addEventListener('click',()=>{const close=root.querySelector('#closeMaster');if(close)close.click();else{root.classList.remove('on');root.setAttribute('aria-hidden','true')}});


/* Integrity checks only read canonical sources. Missing contact/service is
   reported, never silently replaced by demo data or a fake success status. */
const auditRows=registry.querySelector('[data-hm-audit-rows]');
const auditSummary=registry.querySelector('[data-hm-audit-summary]');
const readJson=(key,fallback)=>{try{const value=JSON.parse(localStorage.getItem(key)||'null');return value===null?fallback:value}catch{return fallback}};
const distinct=arr=>[...new Set(arr.filter(Boolean))];
const validEmail=v=>/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(v||'').trim())&&!/hd-hyundai-demo|example\.(?:com|org|net)/i.test(String(v||''));
const safeCount=n=>Number(n||0).toLocaleString('ko-KR');
function auditMaster(){
 const teamNames=window.HD20ProductionTeamMaster?.teamNames?.()||[];
 const leaders=readJson('hd20TeamLeaderMasterV1',[]);
 const leaderRecords=Array.isArray(leaders)?leaders:[];
 const org=readJson('gmes5s_team_org_master_v1',{});
 const orgRows=org&&typeof org==='object'&&!Array.isArray(org)?org:{};
 const teamEmail=name=>String(orgRows[name]?.email||leaderRecords.find(x=>x?.team===name)?.email||'').trim();
 const teamMissing=teamNames.filter(name=>!validEmail(teamEmail(name)));
 const masterFactors=readJson('gmes5s_work_factor_master_v1',{});
 const policy=window.HD20PolicyConfig?.read?.()||null;
 const retained=readJson('hd20Retention5SModuleRecipientsV1',[]);
 const retentionEmails=Array.isArray(retained)?retained.filter(validEmail):[];
 const actions=readJson('hd20ActionCasesV2',[]);
 const realActions=Array.isArray(actions)?actions.filter(x=>x&&x.id&&x.isDemo!==true&&x.isTest!==true&&!String(x.id).startsWith('DEMO-')):[];
 const tobeDone=realActions.filter(x=>x.toBeRegisteredAt||x.toBePlan||x.actionText);
 const requesterMissing=tobeDone.filter(x=>!validEmail(x.requesterEmail||x.requestEmail));
 const smsOn=typeof window.HD20_SMS_GATEWAY?.send==='function';
 const emailOn=!!(window.emailjs&&window.HD20_EMAILJS_CONFIG?.serviceId&&window.HD20_EMAILJS_CONFIG?.templateId);
 const themeSaved=Array.isArray(readJson('hd20ThemeCatalogMasterV1',null));
 const inspect=[
  {name:'생산팀·조직 마스터',area:'자율개선 · Audit · 개선조치',ok:teamNames.length>0,msg:teamNames.length?safeCount(teamNames.length)+'개 팀 연결':'생산팀 마스터를 불러오지 못함',target:'integrated-team'},
  {name:'팀별 통보 이메일',area:'개선요청 등록 → 해당 팀 알림',ok:teamNames.length>0&&!teamMissing.length,msg:teamNames.length?(teamMissing.length?safeCount(teamMissing.length)+'개 팀 이메일 미설정':'전체 생산팀 이메일 형식 확인'):'팀 정보 확인 필요',target:'integrated-team'},
  {name:'작업장·업무분류',area:'자율개선 · 테마점검 · Audit',ok:!!window.HD20WorkplaceMaster||Object.keys(masterFactors||{}).length>0,msg:window.HD20WorkplaceMaster?'작업장 원천 연결됨':Object.keys(masterFactors||{}).length?'등록 분류 정보 존재 · 작업장 연동 확인 필요':'작업장 기준정보 미확인',target:'integrated-workplace'},
  {name:'5S 세부테마',area:'테마점검 · 점검항목',ok:themeSaved||!!document.querySelector('#hd20ThemeCatalogPanel'),msg:themeSaved?'테마 저장정보 연결됨':'테마 관리화면 확인 · 별도 저장 여부 확인',target:'integrated-theme'},
  {name:'Audit 점검항목 별도 원천',area:'④ Audit 점검항목 · 테마점검 항목 연계',ok:false,msg:'Audit 원천 '+safeCount((readJson('hd20AuditChecklistV1',[])||[]).length)+'개 · 통합기준정보 편집 체계 별도 정비 필요',target:'integrated-theme'},
  {name:'Audit·유지점검 운영정책',area:'Audit 추출 · 재점검 주기 · 기한',ok:!!policy&&Number(policy.retentionCheck?.intervalDays)>0&&Number(policy.retentionCheck?.sampleCount)>0,msg:policy?'유지점검 '+(policy.retentionCheck?.intervalDays||'—')+'일 / 표본 '+(policy.retentionCheck?.sampleCount||'—')+'건':'운영정책 로드 실패',target:'policy'},
  {name:'유지점검 평가자·수신자',area:'③ 유지점검 담당자 통보',ok:retentionEmails.length>0,msg:retentionEmails.length?safeCount(retentionEmails.length)+'개 등록 이메일 확인':'5S 모듈 수신자 미등록',target:'policy'},
  {name:'TO-BE 최초 요청자 주소',area:'TO-BE 조치등록 → 최초 요청자 회신',ok:tobeDone.length===0||requesterMissing.length===0,msg:tobeDone.length?safeCount(tobeDone.length)+'건 중 '+safeCount(requesterMissing.length)+'건 요청자 이메일 누락':'현재 브라우저에 TO-BE 등록 이력 없음',target:'integrated-team'},
  {name:'메일 자동발송',area:'개선요청 · TO-BE 결과 통보',ok:emailOn,msg:emailOn?'EmailJS 모듈 및 설정 연결':'발송 모듈/설정 미확인 · 실발송 미검증',target:'integrated-mail'},
  {name:'SMS 자동발송',area:'개선요청 · TO-BE 결과 통보',ok:smsOn,msg:smsOn?'발송 게이트웨이 연결 · 실제 성공 별도검증':'SMS 게이트웨이 미연결 · 자동발송 불가',target:'integrated-mail'},
  {name:'마스터 권한체계',area:'최종채택 · 기준정보 변경 · 유지점검',ok:!!document.querySelector('#masterModal [data-master-tab="integrated-admins"]'),msg:'관리자 지정·권한은 기존 권한마스터에서 관리 · 실제 접근권한 별도 검증',target:'integrated-admins'}
 ];
 let issues=0;
 auditRows.replaceChildren();
 for(const x of inspect){
  if(!x.ok)issues++;
  const row=document.createElement('div');row.className='hmAuditRow';
  const badge=document.createElement('span');badge.className=x.ok?'hmAuditGood':'hmAuditWarn';badge.textContent=x.ok?'확인':'점검 필요';
  const info=document.createElement('div');info.className='hmAuditInfo';
  const name=document.createElement('strong');name.textContent=x.name;
  const desc=document.createElement('small');desc.textContent=x.area+' · '+x.msg;
  info.append(name,desc);
  const btn=document.createElement('button');btn.type='button';btn.textContent='관리 항목 열기';
  btn.addEventListener('click',()=>openMasterTarget(x.target));
  row.append(badge,info,btn);auditRows.append(row);
 }
 auditSummary.textContent=inspect.length+'개 점검 · '+issues+'개 확인 필요';
 ws.dataset.hmAuditIssues=String(issues);
}
registry.querySelector('[data-hm-audit-refresh]').addEventListener('click',auditMaster);
registry.querySelector('.hmAudit')?.addEventListener('toggle',e=>{if(e.target.open)auditMaster()});
['hd20-policy-updated','hd20-theme-master-updated','hd20-master-factors-updated','hd20-action-updated','hd20-team-master-updated','hd20-mailing-updated'].forEach(name=>window.addEventListener(name,()=>{if(root.classList.contains('on'))auditMaster()}));
// Do not rerun all linkage diagnostics after every master-panel click; explicit refresh and source-update events remain available.
auditMaster();

const grid=ws.querySelector('[data-hm-groups]');const all=[];
for(const [group,...keys] of GROUPS){const section=document.createElement('div');section.className='hmGroup';section.dataset.hmGroup=group;const heading=document.createElement('h3');heading.textContent=group;heading.setAttribute('role','tab');heading.tabIndex=0;heading.setAttribute('aria-selected','false');section.appendChild(heading);const wrap=document.createElement('div');wrap.className='hmLinks';wrap.setAttribute('role','group');wrap.setAttribute('aria-label',group+' 항목');for(const key of keys){const original=tabs.querySelector('[data-master-tab="'+key+'"]');if(!original||original.hidden)continue;const btn=document.createElement('button');btn.type='button';btn.dataset.hmTarget=key;btn.title=NOTES[key]||group;btn.innerHTML='<strong></strong><small></small>';btn.querySelector('strong').textContent=original.textContent.trim();btn.querySelector('small').textContent=NOTES[key]||group;btn.addEventListener('click',()=>openMasterTarget(key));wrap.appendChild(btn);all.push(btn)}section.appendChild(wrap);if(wrap.children.length)grid.appendChild(section)}
/* 대분류 탭: 눌렀을 때 해당 그룹의 칩만 보이게 하고, 그 그룹에서 지금 열려 있는 항목이 없으면 첫 항목을 연다(사용자가 빈 분류를 보지 않도록). */
function openMasterTarget(key){
 const b=all.find(x=>x.dataset.hmTarget===key);
 const original=tabs.querySelector('[data-master-tab="'+key+'"]');
 if(!b||!original){auditSummary.textContent='해당 설정 메뉴를 불러오지 못했습니다';return false}
 // A previous search may hide the destination. Restore all menu entries first.
 const searchBox=ws.querySelector('#hmSearch');
 if(searchBox?.value){searchBox.value='';filter()}
 const group=b.closest('.hmGroup');
 if(group){group.hidden=false;activateGroup(group,false)}
 original.click();
 select(key);
 // Bring the functional settings section into view, not the button which launched it.
 requestAnimationFrame(()=>{
   const candidates=key==='integrated-theme'?['#hd20ThemeCatalogPanel']:
    key==='policy'?['#hd20OperatingPolicyPanel']:
    key==='integrated-admins'||key.startsWith('integrated-')?['#hd20IntegratedMasterFactors']:
    ['#masterOrderPanel','#masterTargetPanel'];
   let destination=null;
   for(const selector of candidates){
     for(const el of box.querySelectorAll(selector)){
       if(el.getClientRects().length&&getComputedStyle(el).display!=='none'){destination=el;break}
     }
     if(destination)break;
   }
   // The active legacy tab is always available as a fallback.
   destination=destination||b;
   const viewport=box.getBoundingClientRect(),rect=destination.getBoundingClientRect();
   const next=Math.max(0,box.scrollTop+rect.top-viewport.top-12);
   box.scrollTo({top:next,behavior:'auto'});
 });
 return true
}
function activateGroup(section,open){
 for(const g of grid.children){
  const on=g===section;g.classList.toggle('hmActive',on);
  g.querySelector('h3')?.setAttribute('aria-selected',on?'true':'false');
  g.querySelector('h3')?.setAttribute('aria-expanded',on?'true':'false');
 }
 if(open){const cur=section.querySelector('[data-hm-target].on:not([hidden])');if(!cur)section.querySelector('[data-hm-target]:not([hidden])')?.click()}
}
for(const g of grid.children){const h=g.querySelector('h3');h.addEventListener('click',()=>activateGroup(g,true));h.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activateGroup(g,true)}else if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const list=[...grid.children].filter(x=>!x.hidden);const i=list.indexOf(g),n=list[(i+(e.key==='ArrowRight'?1:-1)+list.length)%list.length];n?.querySelector('h3')?.focus()}})}
function select(key){all.forEach(b=>{const yes=b.dataset.hmTarget===key;b.classList.toggle('on',yes);b.setAttribute('aria-pressed',yes?'true':'false')});const b=all.find(b=>b.dataset.hmTarget===key);ws.querySelector('[data-hm-current]').textContent=b?b.querySelector('strong').textContent:'기준정보';ws.querySelector('[data-hm-current-desc]').textContent=b?(NOTES[key]||'기준정보 원본 편집 및 저장'):'관리 항목을 선택해 주세요.';if(b)activateGroup(b.closest('.hmGroup'),false)}
const search=ws.querySelector('#hmSearch');const searchEmpty=document.createElement('p');searchEmpty.className='hmSearchEmpty';searchEmpty.hidden=true;searchEmpty.textContent='일치하는 관리 항목이 없습니다. 검색어를 변경하거나 [전체 보기]를 선택해 주세요.';grid.insertAdjacentElement('afterend',searchEmpty);function filter(){const q=search.value.trim().toLocaleLowerCase();let count=0;for(const btn of all){const show=!q||btn.textContent.toLocaleLowerCase().includes(q);btn.hidden=!show;if(show)count++}for(const group of grid.children)group.hidden=![...group.querySelectorAll('[data-hm-target]')].some(b=>!b.hidden);ws.querySelector('[data-hm-count]').textContent=count+'개 관리 항목'+(q?' 검색됨':'');ws.classList.toggle('hmSearching',!!q);searchEmpty.hidden=count!==0;if(!q){const selected=all.find(b=>b.classList.contains('on'));activateGroup(selected?.closest('.hmGroup')||grid.firstElementChild,false)}else{const first=[...grid.children].find(g=>!g.hidden);if(first)activateGroup(first,false)}}search.addEventListener('input',filter);ws.querySelector('[data-hm-reset]').onclick=()=>{search.value='';filter();search.focus()};filter();
tabs.addEventListener('click',e=>{const b=e.target.closest('[data-master-tab]');if(b)select(b.dataset.masterTab)});
const selected=tabs.querySelector('[data-master-tab].on:not([hidden])');
/* 실제 버그: 원본 탭에 이미 .on 이 붙어 있으면 하이라이트(select)만 하고 패널 렌더를 호출하지 않아, 통합기준정보에 처음 들어오면 조직·팀 표가 0행·'0 / 0' 빈 화면으로 남았다(다른 메뉴를 눌렀다 돌아와야 19행이 표시됨).
   .on 은 마스터 모듈이 선택 상태만 먼저 세팅한 것일 수 있으므로, 이미 선택된 탭도 한 번 눌러 해당 화면을 확실히 렌더한다. */
if(selected){select(selected.dataset.masterTab);const mine=all.find(b=>b.dataset.hmTarget===selected.dataset.masterTab);setTimeout(()=>{(mine?mine:all[0])?.click()},0)}
else if(all.length)all[0].click();
// The original menu must remain operable unless the entire replacement interface is ready.
if(all.length<10){registry.remove();ws.remove();box.classList.remove('hd20MasterWorkspaceReady');return false}
box.classList.add('hd20MasterWorkspaceReady');
return true}
function boot(){let n=0;const go=()=>{if(init())return;if(++n<80)setTimeout(go,180)};go()}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
