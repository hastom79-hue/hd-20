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
const ws=document.createElement('section');ws.id='hd20MasterWorkspace';ws.innerHTML='<div class="hmTitle"><div><span class="hmEyebrow">HD-20 · 기준정보 관리</span><h2>통합기준정보</h2><p>관리 항목을 선택해 수정하세요. 기존 저장·권한·데이터 연계 기능을 그대로 사용합니다.</p></div><div class="hmCounters"><span data-hm-count>기준정보 불러오는 중</span><button type="button" data-hm-close aria-label="통합기준정보 닫기">닫기 ×</button></div></div><div class="hmToolbar"><label for="hmSearch">기준정보 검색</label><input id="hmSearch" type="search" placeholder="팀, 작업장, Audit, 권한, 메일 등 검색" autocomplete="off"><button type="button" data-hm-reset>전체 보기</button></div><div class="hmGroups" data-hm-groups></div><div class="hmCurrent" aria-live="polite"><strong data-hm-current>관리 항목을 선택하세요</strong><span>아래에서 기존 기준정보를 직접 편집·저장합니다.</span></div><section class="hmAudit" aria-label="기준정보·타 탭 연동점검"><div class="hmAuditTop"><div><strong>업무별 기준정보 연동점검</strong><p>Audit · 테마점검 · 개선요청 · TO-BE · 유지점검 · 알림의 참조설정을 확인합니다. 조회 전용이며 기준정보를 자동 변경하지 않습니다.</p></div><div class="hmAuditActions"><span data-hm-audit-summary>점검 준비</span><button type="button" data-hm-audit-refresh>다시 점검</button></div></div><details class="hmAuditDetails"><summary>항목별 연동 상태 상세보기</summary><div class="hmAuditRows" data-hm-audit-rows></div></details></section>';
box.insertBefore(ws,tabs);
// Keep a working close control even when legacy .modalHead is hidden by layout CSS.
ws.querySelector('[data-hm-close]').addEventListener('click',()=>{const close=root.querySelector('#closeMaster');if(close)close.click();else{root.classList.remove('on');root.setAttribute('aria-hidden','true')}});


/* Integrity checks only read canonical sources. Missing contact/service is
   reported, never silently replaced by demo data or a fake success status. */
const auditRows=ws.querySelector('[data-hm-audit-rows]');
const auditSummary=ws.querySelector('[data-hm-audit-summary]');
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
ws.querySelector('[data-hm-audit-refresh]').addEventListener('click',auditMaster);
['hd20-policy-updated','hd20-theme-master-updated','hd20-master-factors-updated','hd20-action-updated','hd20-team-master-updated','hd20-mailing-updated'].forEach(name=>window.addEventListener(name,()=>{if(root.classList.contains('on'))auditMaster()}));
root.addEventListener('click',e=>{if(e.target.closest('[data-hm-close],#openMaster'))return;requestAnimationFrame(auditMaster)});
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
function activateGroup(section,open){for(const g of grid.children){const on=g===section;g.classList.toggle('hmActive',on);g.querySelector('h3')?.setAttribute('aria-selected',on?'true':'false')}if(open){const cur=section.querySelector('[data-hm-target].on:not([hidden])');if(!cur)section.querySelector('[data-hm-target]:not([hidden])')?.click()}}
for(const g of grid.children){const h=g.querySelector('h3');h.addEventListener('click',()=>activateGroup(g,true));h.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activateGroup(g,true)}else if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const list=[...grid.children].filter(x=>!x.hidden);const i=list.indexOf(g),n=list[(i+(e.key==='ArrowRight'?1:-1)+list.length)%list.length];n?.querySelector('h3')?.focus()}})}
function select(key){all.forEach(b=>{const yes=b.dataset.hmTarget===key;b.classList.toggle('on',yes);b.setAttribute('aria-pressed',yes?'true':'false')});const b=all.find(b=>b.dataset.hmTarget===key);ws.querySelector('[data-hm-current]').textContent=b?b.querySelector('strong').textContent:'기준정보';if(b)activateGroup(b.closest('.hmGroup'),false)}
const search=ws.querySelector('#hmSearch');function filter(){const q=search.value.trim().toLocaleLowerCase();let count=0;for(const btn of all){const show=!q||btn.textContent.toLocaleLowerCase().includes(q);btn.hidden=!show;if(show)count++}for(const group of grid.children)group.hidden=![...group.querySelectorAll('[data-hm-target]')].some(b=>!b.hidden);ws.querySelector('[data-hm-count]').textContent=count+'개 관리 항목'+(q?' 검색됨':'');ws.classList.toggle('hmSearching',!!q)}search.addEventListener('input',filter);ws.querySelector('[data-hm-reset]').onclick=()=>{search.value='';filter();search.focus()};filter();
tabs.addEventListener('click',e=>{const b=e.target.closest('[data-master-tab]');if(b)select(b.dataset.masterTab)});
const selected=tabs.querySelector('[data-master-tab].on:not([hidden])');
/* 실제 버그: 원본 탭에 이미 .on 이 붙어 있으면 하이라이트(select)만 하고 패널 렌더를 호출하지 않아, 통합기준정보에 처음 들어오면 조직·팀 표가 0행·'0 / 0' 빈 화면으로 남았다(다른 메뉴를 눌렀다 돌아와야 19행이 표시됨).
   .on 은 마스터 모듈이 선택 상태만 먼저 세팅한 것일 수 있으므로, 이미 선택된 탭도 한 번 눌러 해당 화면을 확실히 렌더한다. */
if(selected){select(selected.dataset.masterTab);const mine=all.find(b=>b.dataset.hmTarget===selected.dataset.masterTab);setTimeout(()=>{(mine?mine:all[0])?.click()},0)}
else if(all.length)all[0].click();
// The original menu must remain operable unless the entire replacement interface is ready.
if(all.length<10){ws.remove();box.classList.remove('hd20MasterWorkspaceReady');return false}
box.classList.add('hd20MasterWorkspaceReady');
return true}
function boot(){let n=0;const go=()=>{if(init())return;if(++n<80)setTimeout(go,180)};go()}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
