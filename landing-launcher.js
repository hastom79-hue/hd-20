/* 사용자 지시: "웹 들어가면 바로 팝업창이 뜨면서 좌측에는 자율개선 등록 버튼 우측에는 개선요청 버튼
   이렇게 타고 동시에 타고 들어갈 수 있도록 팝업창 뒤에는 전체 조회 화면 뜨도록" —
   페이지 로드 시(세션당 1회) 두 개의 큰 선택 버튼을 가진 런처 팝업을 자동으로 띄운다. 배경은 평소
   기본 랜딩 화면(대시보드)이 그대로 보이고, 그 위에 반투명 오버레이로 얹힌다. 각 버튼은 기존 등록
   버튼을 그대로 재사용(클릭 시뮬레이션)해, 등록 로직 자체는 전혀 새로 만들지 않고 100% 재사용한다. */
(()=>{'use strict';
const SEEN_KEY='hd20LandingLauncherSeenV1';
let internalRegistrationNavigation=false;
let overviewOpening=false;
function css(){
  if(document.getElementById('hd20LauncherStyle'))return;
  const s=document.createElement('style');
  s.id='hd20LauncherStyle';
  s.textContent=`
  #hd20Launcher{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(15,30,45,.55);backdrop-filter:blur(2px)}
  #hd20Launcher .hd20LnBox{width:min(720px,92vw);background:#fff;border-radius:16px;box-shadow:0 18px 50px rgba(10,30,50,.35);padding:28px 28px 22px;box-sizing:border-box}
  #hd20Launcher .hd20LnHead{text-align:center;margin-bottom:20px}
  #hd20Launcher .hd20LnHead b{display:block;font-size:19px;color:#0f2d4a;font-weight:900}
  #hd20Launcher .hd20LnHead span{display:block;margin-top:6px;font-size:13px;color:#5c7489}
  #hd20Launcher .hd20LnRoute{display:block;margin-top:9px;font-size:12px;line-height:1.65;color:#526b80;font-weight:500}\n  #hd20Launcher .hd20LnCard{display:flex;flex-direction:column;justify-content:space-between;gap:20px;min-height:210px;cursor:default}\n  #hd20Launcher .hd20LnCardContent{flex:1;display:flex;flex-direction:column;justify-content:flex-start;padding-top:4px}\n  #hd20Launcher .hd20LnRegisterBtn{display:block;width:100%;padding:13px 10px;border:0;border-radius:8px;background:#1769e8;color:white;font-size:14px;font-weight:800;cursor:pointer}\n  #hd20Launcher .hd20LnRegisterBtn:hover{background:#0f53bf}
  #hd20Launcher .hd20LnCard .hd20LnIntro{display:block!important;min-height:48px;margin:0 0 12px;text-align:center;font-size:16px!important;font-weight:800!important;line-height:1.5;color:#0f2d4a;word-break:keep-all}#hd20Launcher .hd20LnActionFooter{display:flex!important;flex-direction:column!important;gap:10px!important;width:100%;flex-shrink:0;margin-top:auto}#hd20Launcher .hd20LnActionFooter .hd20LnActionNote{display:block!important;visibility:visible!important;opacity:1!important;position:static!important;margin:0!important;padding:10px 8px!important;text-align:center!important;font-size:16px!important;font-weight:800!important;line-height:1.45!important;color:#0f2d4a!important;background:#eaf2fc;border-radius:7px;white-space:normal;word-break:keep-all}\n  #hd20Launcher .hd20LnTypes{display:block;text-align:left;margin-top:12px;padding:14px 15px;border-radius:8px;background:#eaf2fc;color:#435b70;font-size:14px;line-height:1.8}\n  #hd20Launcher .hd20LnTypes strong{display:block;margin-bottom:8px;color:#1769e8;font-size:15px}\n  #hd20Launcher .hd20LnTypes span{display:block}\n  #hd20Launcher .hd20LnDefinition{display:block;line-height:1.7;text-align:center;color:#354d62}\n  #hd20Launcher .hd20LnBox{padding-top:22px}\n  #hd20Launcher .hd20LnCardContent{padding-top:0}\n  #hd20Launcher .hd20LnCard small .hd20LnDefinition{display:block;font-size:16px;font-weight:800;line-height:1.55;color:#0f2d4a;text-align:center;margin:0 0 18px}\n  #hd20Launcher .hd20LnCard .hd20LnTypes{margin-top:0}\n  #hd20Launcher .hd20LnRow{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  #hd20Launcher .hd20LnCard{border:1.5px solid #dfe8ee;border-radius:13px;padding:22px 16px;text-align:center;cursor:pointer;background:#f8fbfd;transition:transform .12s,box-shadow .12s,border-color .12s}
  #hd20Launcher .hd20LnCard:hover{transform:translateY(-2px);box-shadow:0 10px 22px rgba(20,60,100,.14);border-color:#2c5f8a}
  #hd20Launcher .hd20LnCard .ic{font-size:30px;margin-bottom:8px}
  #hd20Launcher .hd20LnCard b{display:block;font-size:16px;color:#0f2d4a;font-weight:900;margin-bottom:4px}
  #hd20Launcher .hd20LnCard small{display:block;font-size:12.5px;color:#64798d;line-height:1.5}
  #hd20Launcher .hd20LnCard.left{border-color:#2c5f8a1a}
  #hd20Launcher .hd20LnCard.right{border-color:#c984161a}
  #hd20Launcher .hd20LnFoot{text-align:center;margin-top:18px}
  #hd20Launcher .hd20LnFoot button{border:0;background:transparent;color:#7c92a5;font-size:12.5px;cursor:pointer;text-decoration:underline}
  #hd20Launcher .hd20LnBox{position:relative;width:min(1060px,96vw);max-height:90vh;overflow-y:auto;padding:36px 28px 24px}\n  #hd20Launcher .hd20LnRow{gap:18px;align-items:stretch}\n  #hd20Launcher .hd20LnCard{min-width:0;min-height:390px;padding:22px 20px 18px}\n  #hd20Launcher .hd20LnClose{position:absolute;top:7px;right:12px;width:30px;height:30px;border:0;border-radius:6px;background:transparent;color:#60788b;font-size:25px;line-height:1;cursor:pointer;z-index:1}\n  #hd20Launcher .hd20LnClose:hover{background:#eaf2fc;color:#173b5b}
  #hd20Launcher .hd20LnDefinition{min-height:50px;white-space:nowrap;word-break:keep-all;overflow-wrap:normal}
  #hd20Launcher .hd20LnCard small .hd20LnDefinition{font-size:16px;line-height:1.55}
  @media(max-width:900px){#hd20Launcher .hd20LnDefinition{white-space:normal}#hd20Launcher .hd20LnCard small .hd20LnDefinition{font-size:14px}}
  @media(prefers-reduced-motion:reduce){#hd20Launcher .hd20LnCard{transition:none}}\n  /* Popup typography is fixed: later global small/font rules must not shrink descriptions. */
  #hd20Launcher .hd20LnCard .hd20LnCardContent > small{font-size:16px!important;line-height:1.55!important}
  #hd20Launcher .hd20LnCard .hd20LnCardContent > small > .hd20LnDefinition{font-size:16px!important;font-weight:800!important;line-height:1.55!important;white-space:normal!important;word-break:keep-all!important;overflow-wrap:normal!important;min-height:50px!important}
  @media(max-width:650px){#hd20Launcher .hd20LnBox{width:96vw;max-height:94vh;padding:38px 14px 14px}#hd20Launcher .hd20LnRow{grid-template-columns:1fr;gap:12px}#hd20Launcher .hd20LnCard{min-height:0;padding:16px}#hd20Launcher .hd20LnCard small .hd20LnDefinition{font-size:14px}#hd20Launcher .hd20LnTypes{font-size:13px}}\n  @media(max-width:560px){#hd20Launcher .hd20LnRow{grid-template-columns:1fr}}
  `;
  s.textContent+=`#hd20LauncherOverview{margin:12px 0;padding:16px;border:1px solid #dce6ed;border-radius:12px;background:#fff;color:#17394f}#hd20LauncherOverview .hd20LnOverviewHead{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}#hd20LauncherOverview .hd20LnOverviewHead b{font-size:16px}#hd20LauncherOverview .hd20LnOverviewHead small{color:#637c8c}#hd20LauncherOverview .hd20LnOverviewGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}#hd20LauncherOverview .hd20LnOverviewCol{min-width:0;border:1px solid #e2ebf0;border-radius:9px;padding:12px}#hd20LauncherOverview .hd20LnOverviewTop{display:flex;justify-content:space-between;margin-bottom:8px}#hd20LauncherOverview table{width:100%;border-collapse:collapse;font-size:12px}#hd20LauncherOverview th,#hd20LauncherOverview td{padding:6px 4px;border-bottom:1px solid #eef2f5;text-align:left}#hd20LauncherOverview button{margin-top:10px;padding:7px 12px;border:1px solid #b6d3dc;border-radius:7px;background:#f3f9fb;cursor:pointer;color:#174765}body:has(.app.awFocused) #hd20LauncherOverview:not(.hd20LnVisible){display:none}@media(max-width:760px){#hd20LauncherOverview .hd20LnOverviewGrid{grid-template-columns:1fr}#hd20LauncherOverview .hd20LnOverviewHead{display:block}}`;
  s.textContent+=`#hd20LauncherOverview .hd20LnGridTools{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin:12px 0}#hd20LauncherOverview .hd20LnCounts,#hd20LauncherOverview .hd20LnFilters{display:flex;align-items:center;gap:9px;flex-wrap:wrap}#hd20LauncherOverview .hd20LnCounts span{padding:7px 10px;background:#f1f6f9;border-radius:7px;font-size:12px}#hd20LauncherOverview .hd20LnFilters input,#hd20LauncherOverview .hd20LnFilters select{height:34px;padding:5px 9px;border:1px solid #cbd9e2;border-radius:6px;background:white}#hd20LauncherOverview .hd20LnTableScroll{width:100%;overflow-x:auto}#hd20LauncherOverview .hd20LnDataTable{width:100%;border-collapse:collapse;font-size:12px;white-space:nowrap}#hd20LauncherOverview .hd20LnDataTable th{background:#eaf1f5;color:#24445c}#hd20LauncherOverview .hd20LnDataTable th,#hd20LauncherOverview .hd20LnDataTable td{padding:10px 9px;border-bottom:1px solid #e5edf2;text-align:left}#hd20LauncherOverview .hd20LnDataTable td:nth-child(5){max-width:330px;overflow:hidden;text-overflow:ellipsis}#hd20LauncherOverview .hd20LnEmpty{text-align:center!important;padding:26px!important}#hd20LauncherOverview .hd20LnPager{display:flex;justify-content:space-between;align-items:center;margin-top:12px;font-size:12px;color:#60788b}#hd20LauncherOverview .hd20LnPager button:disabled{opacity:.35;cursor:default}`;
  s.textContent+=`#hd20LauncherOverview .hd20LnThreeTabs{display:flex;gap:0;border-bottom:2px solid #cddce6;margin:0 0 22px;position:sticky;top:0;background:#fff;z-index:2}#hd20LauncherOverview .hd20LnThreeTabs button{flex:1;padding:15px 12px;background:#f7fafc;border:0;border-bottom:3px solid transparent;font-size:15px;font-weight:700;color:#567086;cursor:pointer}#hd20LauncherOverview .hd20LnThreeTabs button.on{color:#125889;border-bottom-color:#1773b5;background:white}#hd20Launcher{backdrop-filter:none}#hd20Launcher .hd20LnBox{width:min(850px,94vw)}#hd20LauncherOverview{scroll-margin-top:14px}`;
  /* 긴급 복구: 전체 앱을 숨기거나 고정 오버레이로 덮는 CSS 제거 */
  s.textContent+=`body #hd20LauncherOverview{display:none}#hd20LauncherOverview.hd20LnVisible{display:block;position:relative;z-index:auto;max-width:1500px;margin:20px auto;padding:20px;background:white}#hd20LauncherOverview .hd20LnTableScroll{overflow:auto;max-height:70vh}#hd20LauncherOverview [data-ln-exit-grid]{background:#173a57;color:white}`;
  s.textContent+=`body.hd20InquiryActive #hd20LauncherOverview.hd20LnVisible{display:block}body.hd20InquiryActive .app{display:block!important}body.hd20InquiryActive .app > :not(.top):not(.beginnerNav):not(#hd20LauncherOverview):not(script):not(style){display:none!important}body.hd20InquiryActive .app > #hd20LauncherOverview.hd20LnVisible{display:block!important;width:100%;box-sizing:border-box}body.hd20InquiryActive .app #hd20LauncherOverview.hd20LnVisible{display:block!important;position:relative;z-index:2}body.hd20InquiryActive .app > .awScreen,body.hd20InquiryActive .app > .awArea{display:none!important}body.hd20InquiryActive #hd20LauncherOverview{margin-bottom:24px}`;
  document.head.appendChild(s);
}
function close(){document.getElementById('hd20Launcher')?.remove();try{sessionStorage.setItem(SEEN_KEY,'1')}catch{}}
function clickWhenReady(findFn,tries=0){
 const el=findFn();if(el){el.click();return true}
 if(tries>=50){console.warn('[HD20 launcher] 등록 화면을 찾지 못했습니다');return false}
 setTimeout(()=>clickWhenReady(findFn,tries+1),100);return null;
}
function hideOverview(){document.body.classList.remove('hd20InquiryActive');const grid=document.getElementById('hd20LauncherOverview');if(!grid)return;grid.classList.remove('hd20LnVisible');grid.style.removeProperty('display');grid.style.removeProperty('visibility');document.body.classList.remove('hd20UnifiedLanding')}
function navigate(area){
 if(area==='activity'||area==='action')internalRegistrationNavigation=true;
 hideOverview();
 if(window.HD20_NAV?.go)window.HD20_NAV.go(area);
 else document.querySelector('.beginnerNav button[data-key="'+area+'"]')?.click();
}
function goActivityRegister(){
 close();navigate('activity');window.HD20_SUBNAV?.select?.('activity','manage');
 setTimeout(()=>{clickWhenReady(()=>document.querySelector('#awActivity [data-aw="new"]'));internalRegistrationNavigation=false},120);
}
function goActionRegister(){
 close();navigate('action');
 setTimeout(()=>{clickWhenReady(()=>document.getElementById('hd20ActionRegisterBtn'));internalRegistrationNavigation=false},120);
}
function getRows(key){try{const a=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(a)?a:[]}catch{return[]}}
function sourceRows(){
 let snap={},actions=[];try{snap=window.HD20KPIData?.snapshot?.()||{}}catch{}
 try{actions=window.HD20KPIData?.actionCases?.()||[]}catch{}
 const activities=Array.isArray(snap.activities)&&snap.activities.length?snap.activities:getRows('hd20GMES5SAutoImproveRawV1');
 if(!Array.isArray(actions)||!actions.length)actions=getRows('hd20ActionCasesV2');
 return {activities,actions};
}
function escapeText(x){return String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function improvementId(x){return String(x?.improvementNo||x?.improvementNumber||x?.caseNo||x?.caseId||x?.activityId||x?.id||'').trim()}
function rowDate(x){return String(x?.date||x?.regDate||x?.createdAt||x?.registeredAt||'').slice(0,10)}
function rowTeam(x){return String(x?.team||x?.teamName||x?.ownerTeam||x?.department||'팀 미지정')}
function rowStatus(x){return String(x?.activityStatus||x?.status||x?.auditState||'등록')}
let GRID={route:'all',query:'',team:'all',status:'all',source:'all',registrar:'',textFilter:'',from:'',to:'',page:1,size:20};
function auditSource(x){if(x.__area!=='action')return '자율개선';if(x.sourceCaseId||x.auditDrawId||/audit/i.test(String(x.source||''))||/audit/i.test(String(x.requestSource||'')))return 'Audit 연계';return '일반 개선요청'}
function registrar(x){return String(x.owner||x.registeredBy||x.registrant||x.auditor||x.requester||'').trim()}
function textMatch(x,q){const needle=String(q||'').trim().replace(/\s+/g,' ').toLocaleLowerCase();if(!needle)return true;return [x.title,x.subject,x.description,x.content,x.issue,x.problem,x.activityName,x.item,x.actionText,x.improvementRequest,x.before,x.after,x.evidence,x.afterEvidence].some(v=>typeof v==='string'&&v.replace(/\s+/g,' ').toLocaleLowerCase().includes(needle))}
function renderOverview(){
 const root=document.getElementById('hd20LauncherOverview');if(!root)return;
 const {activities,actions}=sourceRows();
 const records=[...activities.map(x=>({...x,__route:'자율개선',__area:'activity'})),...actions.map(x=>({...x,__route:'개선요청',__area:'action'}))];
 const filtered=records.filter(x=>(GRID.route==='all'||x.__area===GRID.route)&&(GRID.team==='all'||rowTeam(x)===GRID.team)&&(GRID.status==='all'||rowStatus(x)===GRID.status)&&(GRID.source==='all'||auditSource(x)===GRID.source)&&(!GRID.registrar||registrar(x).toLowerCase().includes(GRID.registrar.toLowerCase()))&&textMatch(x,GRID.textFilter)&&(!GRID.from||rowDate(x)>=GRID.from)&&(!GRID.to||rowDate(x)<=GRID.to)&&(!GRID.query||[x.__route,rowDate(x),rowTeam(x),rowStatus(x),x.title,x.subject,x.description,x.content,x.issue,x.problem,x.workplace,registrar(x),x.sourceCaseId,x.id].some(v=>String(v??'').toLowerCase().includes(GRID.query.toLowerCase())))).sort((a,b)=>rowDate(b).localeCompare(rowDate(a)));
 const teams=[...new Set(records.map(rowTeam))].sort();const statuses=[...new Set(records.map(rowStatus))].sort();
 const option=(value,label,selected)=>'<option value="'+escapeText(value)+'"'+(selected?' selected':'')+'>'+escapeText(label)+'</option>';
 const pages=Math.max(1,Math.ceil(filtered.length/GRID.size));GRID.page=Math.min(GRID.page,pages);
 const shown=filtered.slice((GRID.page-1)*GRID.size,GRID.page*GRID.size);
 const cell=(v)=>'<td>'+escapeText(v||'—')+'</td>';
 root.innerHTML='<div class="hd20LnInquiryTitle"><b>자율개선 · 개선요청 통합조회</b><span>등록 이력 검색 및 개선조치 진행현황 관리</span></div><nav class="hd20LnThreeTabs" aria-label="개선활동 등록 이력 조회"><button type="button" data-ln-tab="all" class="'+(GRID.route==='all'?'on':'')+'">① 총괄조회</button><button type="button" data-ln-tab="activity" class="'+(GRID.route==='activity'?'on':'')+'">② 자체개선 조회</button><button type="button" data-ln-tab="action" class="'+(GRID.route==='action'?'on':'')+'">③ 개선요청 조회</button></nav><div class="hd20LnActionBar"><button type="button" data-ln-new-register>+ 신규등록</button></div>'+
 '<div class="hd20LnGridTools"><div class="hd20LnFilters"><label>등록 구분 <select aria-label="등록 구분" data-ln-filter>'+option('all','전체 구분',GRID.route==='all')+option('activity','자율개선',GRID.route==='activity')+option('action','개선요청',GRID.route==='action')+'</select></label><label>팀 <select aria-label="팀" data-ln-team>'+option('all','전체 팀',GRID.team==='all')+teams.map(t=>option(t,t,GRID.team===t)).join('')+'</select></label><label>진행 상태 <select aria-label="진행 상태" data-ln-status>'+option('all','전체 상태',GRID.status==='all')+statuses.map(t=>option(t,t,GRID.status===t)).join('')+'</select></label><label>요청 출처 <select aria-label="요청 출처" data-ln-source>'+option('all','전체 출처',GRID.source==='all')+['자율개선','Audit 연계','일반 개선요청'].map(v=>option(v,v,GRID.source===v)).join('')+'</select></label><label>등록자 <input data-ln-registrar placeholder="이름 검색" value="'+escapeText(GRID.registrar)+'"></label><label>내용 텍스트 필터 <input aria-label="내용 텍스트 필터" data-ln-text placeholder="개선내용·문제점·조치내용" value="'+escapeText(GRID.textFilter)+'"></label><label>시작일 <input type="date" data-ln-from value="'+escapeText(GRID.from)+'"></label><label>종료일 <input type="date" data-ln-to value="'+escapeText(GRID.to)+'"></label><input aria-label="통합 검색" data-ln-search placeholder="등록일·팀·상태·내용 검색" value="'+escapeText(GRID.query)+'"><button type="button" data-ln-search-btn>조회</button><button type="button" data-ln-reset>초기화</button></div></div>'+
 '<div class="hd20LnResultHeading">조회 결과 · '+filtered.length+'건</div>'+
 '<div class="hd20LnTableScroll"><table class="hd20LnDataTable"><thead><tr><th>번호</th><th>개선번호</th><th>등록 구분</th><th>등록일</th><th>담당 팀</th><th>등록 내용</th><th>상태</th><th>조회</th></tr></thead><tbody>'+ (shown.map((x,i)=>'<tr>'+cell((GRID.page-1)*GRID.size+i+1)+'<td><button type="button" class="hd20LnIdLink" data-ln-detail="'+i+'">'+escapeText(improvementId(x)||'미부여')+'</button></td>'+cell(x.__route)+cell(rowDate(x))+cell(rowTeam(x))+cell(x.title||x.subject||x.description||x.content||x.issue||x.activityName||x.item||'내용 미입력')+cell(rowStatus(x))+'<td><button type="button" data-ln-detail="'+i+'">열기</button></td></tr>').join('')||'<tr><td colspan="8" class="hd20LnEmpty">조회된 데이터가 없습니다.</td></tr>')+'</tbody></table></div>'+
 '<div class="hd20LnPager"><span>조회 '+filtered.length+'건 · '+GRID.page+' / '+pages+' 페이지</span><div><button type="button" data-ln-prev '+(GRID.page<=1?'disabled':'')+'>이전</button><button type="button" data-ln-next '+(GRID.page>=pages?'disabled':'')+'>다음</button></div></div>';
 root.querySelector('[data-ln-new-register]')?.addEventListener('click',open);
 
 root.querySelectorAll('[data-ln-tab]').forEach(btn=>btn.onclick=()=>{GRID.route=btn.dataset.lnTab;GRID.page=1;renderOverview()});
 root.querySelector('[data-ln-filter]').value=GRID.route;
 root.querySelector('[data-ln-filter]').onchange=e=>{GRID.route=e.target.value;GRID.page=1;renderOverview()};
 root.querySelector('[data-ln-search-btn]').onclick=()=>{GRID.query=root.querySelector('[data-ln-search]').value.trim();GRID.team=root.querySelector('[data-ln-team]').value;GRID.status=root.querySelector('[data-ln-status]').value;GRID.source=root.querySelector('[data-ln-source]').value;GRID.registrar=root.querySelector('[data-ln-registrar]').value.trim();GRID.textFilter=root.querySelector('[data-ln-text]').value.trim();GRID.from=root.querySelector('[data-ln-from]').value;GRID.to=root.querySelector('[data-ln-to]').value;if(GRID.from&&GRID.to&&GRID.from>GRID.to){alert('조회 시작일은 종료일보다 늦을 수 없습니다.');return}GRID.page=1;renderOverview()};
 root.querySelector('[data-ln-registrar]').onkeydown=e=>{if(e.key==='Enter')root.querySelector('[data-ln-search-btn]').click()};
 root.querySelector('[data-ln-text]').onkeydown=e=>{if(e.key==='Enter')root.querySelector('[data-ln-search-btn]').click()};
 root.querySelector('[data-ln-search]').onkeydown=e=>{if(e.key==='Enter'){root.querySelector('[data-ln-search-btn]').click()}};
 root.querySelector('[data-ln-reset]').onclick=()=>{GRID={route:'all',query:'',team:'all',status:'all',source:'all',registrar:'',textFilter:'',from:'',to:'',page:1,size:20};renderOverview()};
 root.querySelector('[data-ln-prev]').onclick=()=>{GRID.page--;renderOverview()};
 root.querySelector('[data-ln-next]').onclick=()=>{GRID.page++;renderOverview()};
 root.querySelectorAll('[data-ln-detail]').forEach(btn=>btn.onclick=()=>{const x=shown[Number(btn.dataset.lnDetail)];if(!x)return;let modal=document.getElementById('hd20LnDetailModal');if(!modal){modal=document.createElement('div');modal.id='hd20LnDetailModal';document.body.appendChild(modal)}const fields=[['개선번호',improvementId(x)||'미부여'],['등록 구분',x.__route],['등록일',rowDate(x)],['담당 팀',rowTeam(x)],['상태',rowStatus(x)],['등록 내용',x.title||x.subject||x.description||x.content||x.issue||x.problem||x.activityName||x.item||'내용 미입력'],['등록자',registrar(x)||'미입력'],['작업장',x.workplace||'미입력'],['요청 출처',auditSource(x)],['원본 Audit ID',x.sourceCaseId||x.auditDrawId||'—']];modal.innerHTML='<div class="hd20LnDetailShade" data-ln-close></div><section class="hd20LnDetailPanel" role="dialog" aria-modal="true" aria-label="개선 상세조회"><header><b>개선 상세조회</b><button type="button" data-ln-close>닫기 ×</button></header><div class="hd20LnDetailFields">'+fields.map(f=>'<div><strong>'+escapeText(f[0])+'</strong><span>'+escapeText(f[1])+'</span></div>').join('')+'</div></section>';modal.querySelectorAll('[data-ln-close]').forEach(b=>b.onclick=()=>modal.remove())});
}
function ensureOverview(deferRender=false){
 css();if(document.getElementById('hd20LauncherOverview'))return;
 const el=document.createElement('section');el.id='hd20LauncherOverview';el.setAttribute('aria-label','자율개선과 개선요청 통합 조회');(document.querySelector('.app > .beginnerNav')||document.querySelector('.beginnerNav')||document.querySelector('.top'))?.insertAdjacentElement('afterend',el) || document.body.appendChild(el);
 el.addEventListener('click',e=>{if(e.target.closest('[data-ln-route]'))return});
 if(!deferRender)renderOverview();
}
function openOverview(){if(overviewOpening)return;overviewOpening=true;try{close();if(window.HD20_NAV?.active?.()!=='activity')window.HD20_NAV?.go?.('activity');try{const u=new URL(location.href);if(u.searchParams.get('sub')==='unified'){u.searchParams.delete('sub');history.replaceState(null,'',u)}}catch{}ensureOverview(true);document.body.classList.remove('hd20UnifiedLanding');const grid=document.getElementById('hd20LauncherOverview');grid?.classList.add('hd20LnVisible');document.body.classList.add('hd20InquiryActive');renderOverview();if(grid){grid.style.removeProperty('display');grid.style.removeProperty('visibility');document.querySelector('.app')?.classList.remove('awFocused');document.getElementById('awActivity')?.classList.remove('on');document.getElementById('awAction')?.classList.remove('on');grid.scrollTop=0;window.scrollTo(0,0)}}finally{overviewOpening=false}}
function open(){
  if(document.getElementById('hd20Launcher'))return;
  ensureOverview(true);document.body.classList.remove('hd20UnifiedLanding');document.getElementById('hd20LauncherOverview')?.classList.add('hd20LnVisible');document.body.classList.add('hd20InquiryActive');GRID.route='all';GRID.page=1;
  css();
  const el=document.createElement('div');
  el.id='hd20Launcher';
  el.innerHTML=`<div class="hd20LnBox" role="dialog" aria-modal="true" aria-label="빠른 등록 선택">
    <button type="button" class="hd20LnClose" data-ln-close aria-label="등록 선택창 닫기">×</button>
    <div class="hd20LnRow">
      <div class="hd20LnCard left"><div class="hd20LnCardContent"><small><span class="hd20LnIntro">현장팀이 직접 발굴·실행한 5S 개선활동을 등록합니다.</span><span class="hd20LnTypes"><strong>주요 활동 유형</strong><span>정리 · 불용품·불급품 제거</span><span>정돈 · 정량·정위치 관리 및 동선·공간 개선</span><span>시각화관리 · 정량·정위치 표시, 단순 도색</span><span>위험구역 관리 · 출입통제 및 안전표식 개선</span><span>청소 · 작업장·주변시설·부대시설·Pallet 등</span><span>자주보전 · 설비 마모·파손 예방 및 자체 보전</span></span></small></div><div class="hd20LnActionFooter"><div class="hd20LnActionNote">자율개선 출처 : 현장팀</div><button type="button" class="hd20LnRegisterBtn" data-ln="activity">자율개선 등록하기 →</button></div></div>
      <div class="hd20LnCard right"><div class="hd20LnCardContent"><small><span class="hd20LnIntro">현장점검·피드백에서 도출된 개선요청을 등록합니다.</span><span class="hd20LnTypes"><strong>주요 개선요청 발생 경로</strong><span>① 현장 패트롤 점검</span><span>② 자율 5S Audit</span><span>③ 혁신팀 자율점검</span><span>④ 5S 자율개선 활동 피드백</span></span></small></div><div class="hd20LnActionFooter"><div class="hd20LnActionNote">개선요청 출처 : 공장장 · 5S 모듈조직 · 혁신팀</div><button type="button" class="hd20LnRegisterBtn" data-ln="action">개선요청 등록하기 →</button></div></div>
    </div>
  </div>`;
  document.body.appendChild(el);
  // 팝업을 먼저 표시하고 대량 통합조회 데이터 구성은 다음 작업으로 미룬다.
  // 팝업 표시 중에는 통합조회 대량 테이블을 렌더링하지 않는다. 닫을 때만 조회한다.
  el.querySelector('[data-ln="activity"]').addEventListener('click',goActivityRegister);
  el.querySelector('[data-ln="action"]').addEventListener('click',goActionRegister);
  el.querySelector('[data-ln-close]').addEventListener('click',openOverview);
  /* 사용자 지시: "이 팝업창이 닫히면 바로 뒤에 전체 자율개선 등록조회 탭과 개선요청 등록 조회탭이
     연동되어 보여져야 한다" — 다른 세션이 "건너뛰기" 버튼에만 openOverview()(통합 조회 패널)를
     연결해 뒀고, 배경(오버레이) 클릭·ESC로 닫을 때는 close()만 호출해 통합 조회 없이 그냥 원래
     화면(대시보드)으로 남아 있었음. 카드 선택(자율개선/개선요청)은 그 등록 화면으로 바로 이동하는
     게 원래 의도이므로 그대로 두고, 배경 클릭·ESC는 "건너뛰기"와 동일하게 통합 조회가 뜨도록 통일. */
  el.addEventListener('click',e=>{if(e.target===el)openOverview()});
  document.addEventListener('keydown',function esc(e){if(e.key!=='Escape')return;if(!document.getElementById('hd20Launcher')){document.removeEventListener('keydown',esc);return}document.removeEventListener('keydown',esc);openOverview()});
}
window.HD20_LAUNCHER={openOverview,openRegister:open,renderOverview};
function boot(){
  // 상위 '자율개선등록 / 개선조치등록' 메뉴 클릭은 기존 업무관리 패널이 아니라 통합조회로 진입.
  // 등록 팝업 내부 버튼 및 HD20_NAV.go('activity') 내부 호출에는 개입하지 않는다.
  document.addEventListener('click',e=>{
    const tab=e.target?.closest?.('.beginnerNav button[data-key="activity"]');
    if(!tab)return;
    setTimeout(()=>{if(!internalRegistrationNavigation&&window.HD20_NAV?.active?.()==='activity'&&!document.getElementById('hd20Launcher')){try{openOverview()}catch(err){console.error('[HD20 inquiry]',err);hideOverview()}}},0);
  },true);
  window.addEventListener('hd20-nav-area-changed',e=>{
    if(e.detail?.area!=='activity'){hideOverview();return}
    if(internalRegistrationNavigation||document.getElementById('hd20Launcher'))return;
    setTimeout(()=>{
      if(internalRegistrationNavigation||document.getElementById('hd20Launcher'))return;
      if(window.HD20_NAV?.active?.()==='activity'&&!document.body.classList.contains('hd20InquiryActive')){
        try{openOverview()}catch(err){console.error('[HD20 inquiry]',err);hideOverview()}
      }
    },30);
  });
  ['hd20-kpi-source-updated','hd20-action-updated','hd20-activity-updated'].forEach(e=>window.addEventListener(e,()=>{if(document.body.classList.contains('hd20InquiryActive'))renderOverview()}));
  window.addEventListener('storage',()=>{if(document.body.classList.contains('hd20InquiryActive'))renderOverview()});

  // Initial launcher: only once after authenticated app becomes visible.
  let launchScheduled=false;
  function showInitialLauncher(){
    if(launchScheduled)return;
    if(document.documentElement.classList.contains('hd20-auth-pending'))return;
    if(document.querySelector('.hd20AuthGate.on'))return;
    if(document.getElementById('hd20Launcher'))return;
    launchScheduled=true;
    setTimeout(()=>{try{open()}catch(err){console.error('[HD20 launcher]',err);hideOverview()}},0);
  }
  window.addEventListener('hd20-auth-bypass',showInitialLauncher,{once:true});
  window.addEventListener('hd20-auth-success',showInitialLauncher,{once:true});
  // 인증 완료가 스크립트 초기화보다 먼저 발생한 경우에도 즉시 팝업을 요청한다.
  if(window.HD20_AUTH_BYPASS&&!document.documentElement.classList.contains('hd20-auth-pending'))showInitialLauncher();
  setTimeout(showInitialLauncher,250);
  // 복구 우선: 초기 로드에서 통합조회 자동 생성/화면 은닉을 하지 않는다.
  // 메뉴 클릭 후에만 조회를 생성하며, 조회 렌더 오류가 나도 기본 앱은 남는다.
  // 팝업은 사용자가 명시적으로 신규등록을 선택했을 때만 연다.
  // 로그인/새로고침에서 자동 팝업을 열지 않아 조회 탭과 화면 충돌을 방지한다.

}
boot();
})();
