/* 사용자 지시: "웹 들어가면 바로 팝업창이 뜨면서 좌측에는 자율개선 등록 버튼 우측에는 개선요청 버튼
   이렇게 타고 동시에 타고 들어갈 수 있도록 팝업창 뒤에는 전체 조회 화면 뜨도록" —
   페이지 로드 시(세션당 1회) 두 개의 큰 선택 버튼을 가진 런처 팝업을 자동으로 띄운다. 배경은 평소
   기본 랜딩 화면(대시보드)이 그대로 보이고, 그 위에 반투명 오버레이로 얹힌다. 각 버튼은 기존 등록
   버튼을 그대로 재사용(클릭 시뮬레이션)해, 등록 로직 자체는 전혀 새로 만들지 않고 100% 재사용한다. */
(()=>{'use strict';
const SEEN_KEY='hd20LandingLauncherSeenV1';
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
  #hd20Launcher .hd20LnRoute{display:block;margin-top:9px;font-size:12px;line-height:1.65;color:#526b80;font-weight:500}\n  #hd20Launcher .hd20LnCard{display:flex;flex-direction:column;justify-content:space-between;gap:20px;min-height:210px;cursor:default}\n  #hd20Launcher .hd20LnCardContent{flex:1;display:flex;flex-direction:column;justify-content:flex-start;padding-top:4px}\n  #hd20Launcher .hd20LnRegisterBtn{display:block;width:100%;padding:13px 10px;border:0;border-radius:8px;background:#1769e8;color:white;font-size:14px;font-weight:800;cursor:pointer}\n  #hd20Launcher .hd20LnRegisterBtn:hover{background:#0f53bf}\n  #hd20Launcher .hd20LnTypes{display:block;text-align:left;margin-top:12px;padding:10px 12px;border-radius:8px;background:#eaf2fc;color:#435b70;font-size:11px;line-height:1.65}\n  #hd20Launcher .hd20LnTypes strong{display:block;margin-bottom:5px;color:#1769e8;font-size:12px}\n  #hd20Launcher .hd20LnTypes span{display:block}\n  #hd20Launcher .hd20LnRow{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  #hd20Launcher .hd20LnCard{border:1.5px solid #dfe8ee;border-radius:13px;padding:22px 16px;text-align:center;cursor:pointer;background:#f8fbfd;transition:transform .12s,box-shadow .12s,border-color .12s}
  #hd20Launcher .hd20LnCard:hover{transform:translateY(-2px);box-shadow:0 10px 22px rgba(20,60,100,.14);border-color:#2c5f8a}
  #hd20Launcher .hd20LnCard .ic{font-size:30px;margin-bottom:8px}
  #hd20Launcher .hd20LnCard b{display:block;font-size:16px;color:#0f2d4a;font-weight:900;margin-bottom:4px}
  #hd20Launcher .hd20LnCard small{display:block;font-size:12.5px;color:#64798d;line-height:1.5}
  #hd20Launcher .hd20LnCard.left{border-color:#2c5f8a1a}
  #hd20Launcher .hd20LnCard.right{border-color:#c984161a}
  #hd20Launcher .hd20LnFoot{text-align:center;margin-top:18px}
  #hd20Launcher .hd20LnFoot button{border:0;background:transparent;color:#7c92a5;font-size:12.5px;cursor:pointer;text-decoration:underline}
  @media(max-width:560px){#hd20Launcher .hd20LnRow{grid-template-columns:1fr}}
  `;
  s.textContent+=`#hd20LauncherOverview{margin:12px 0;padding:16px;border:1px solid #dce6ed;border-radius:12px;background:#fff;color:#17394f}#hd20LauncherOverview .hd20LnOverviewHead{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}#hd20LauncherOverview .hd20LnOverviewHead b{font-size:16px}#hd20LauncherOverview .hd20LnOverviewHead small{color:#637c8c}#hd20LauncherOverview .hd20LnOverviewGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}#hd20LauncherOverview .hd20LnOverviewCol{min-width:0;border:1px solid #e2ebf0;border-radius:9px;padding:12px}#hd20LauncherOverview .hd20LnOverviewTop{display:flex;justify-content:space-between;margin-bottom:8px}#hd20LauncherOverview table{width:100%;border-collapse:collapse;font-size:12px}#hd20LauncherOverview th,#hd20LauncherOverview td{padding:6px 4px;border-bottom:1px solid #eef2f5;text-align:left}#hd20LauncherOverview button{margin-top:10px;padding:7px 12px;border:1px solid #b6d3dc;border-radius:7px;background:#f3f9fb;cursor:pointer;color:#174765}body:has(.app.awFocused) #hd20LauncherOverview:not(.hd20LnVisible){display:none}@media(max-width:760px){#hd20LauncherOverview .hd20LnOverviewGrid{grid-template-columns:1fr}#hd20LauncherOverview .hd20LnOverviewHead{display:block}}`;
  s.textContent+=`#hd20LauncherOverview .hd20LnGridTools{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin:12px 0}#hd20LauncherOverview .hd20LnCounts,#hd20LauncherOverview .hd20LnFilters{display:flex;align-items:center;gap:9px;flex-wrap:wrap}#hd20LauncherOverview .hd20LnCounts span{padding:7px 10px;background:#f1f6f9;border-radius:7px;font-size:12px}#hd20LauncherOverview .hd20LnFilters input,#hd20LauncherOverview .hd20LnFilters select{height:34px;padding:5px 9px;border:1px solid #cbd9e2;border-radius:6px;background:white}#hd20LauncherOverview .hd20LnTableScroll{width:100%;overflow-x:auto}#hd20LauncherOverview .hd20LnDataTable{width:100%;border-collapse:collapse;font-size:12px;white-space:nowrap}#hd20LauncherOverview .hd20LnDataTable th{background:#eaf1f5;color:#24445c}#hd20LauncherOverview .hd20LnDataTable th,#hd20LauncherOverview .hd20LnDataTable td{padding:10px 9px;border-bottom:1px solid #e5edf2;text-align:left}#hd20LauncherOverview .hd20LnDataTable td:nth-child(5){max-width:330px;overflow:hidden;text-overflow:ellipsis}#hd20LauncherOverview .hd20LnEmpty{text-align:center!important;padding:26px!important}#hd20LauncherOverview .hd20LnPager{display:flex;justify-content:space-between;align-items:center;margin-top:12px;font-size:12px;color:#60788b}#hd20LauncherOverview .hd20LnPager button:disabled{opacity:.35;cursor:default}`;
  s.textContent+=`#hd20LauncherOverview .hd20LnThreeTabs{display:flex;gap:0;border-bottom:2px solid #cddce6;margin:0 0 22px;position:sticky;top:0;background:#fff;z-index:2}#hd20LauncherOverview .hd20LnThreeTabs button{flex:1;padding:15px 12px;background:#f7fafc;border:0;border-bottom:3px solid transparent;font-size:15px;font-weight:700;color:#567086;cursor:pointer}#hd20LauncherOverview .hd20LnThreeTabs button.on{color:#125889;border-bottom-color:#1773b5;background:white}#hd20Launcher{backdrop-filter:none}#hd20Launcher .hd20LnBox{width:min(850px,94vw)}#hd20LauncherOverview{scroll-margin-top:14px}`;
  /* 긴급 복구: 전체 앱을 숨기거나 고정 오버레이로 덮는 CSS 제거 */
  s.textContent+=`#hd20LauncherOverview{display:none}#hd20LauncherOverview.hd20LnVisible{display:block;position:relative;z-index:auto;max-width:1500px;margin:20px auto;padding:20px;background:white}#hd20LauncherOverview .hd20LnTableScroll{overflow:auto;max-height:70vh}#hd20LauncherOverview [data-ln-exit-grid]{background:#173a57;color:white}`;
  document.head.appendChild(s);
}
function close(){document.getElementById('hd20Launcher')?.remove();try{sessionStorage.setItem(SEEN_KEY,'1')}catch{}}
function clickWhenReady(findFn,tries=0){
 const el=findFn();if(el){el.click();return true}
 if(tries>=50){console.warn('[HD20 launcher] 등록 화면을 찾지 못했습니다');return false}
 setTimeout(()=>clickWhenReady(findFn,tries+1),100);return null;
}
function navigate(area){
 document.body.classList.remove('hd20UnifiedLanding');
 document.getElementById('hd20LauncherOverview')?.classList.remove('hd20LnVisible');
 if(window.HD20_NAV?.go)window.HD20_NAV.go(area);
 else document.querySelector('.beginnerNav button[data-key="'+area+'"]')?.click();
}
function goActivityRegister(){
 close();navigate('activity');window.HD20_SUBNAV?.select?.('activity','manage');
 setTimeout(()=>clickWhenReady(()=>document.querySelector('#awActivity [data-aw="new"]')),120);
}
function goActionRegister(){
 close();navigate('action');
 setTimeout(()=>clickWhenReady(()=>document.getElementById('hd20ActionRegisterBtn')),120);
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
function rowDate(x){return String(x?.date||x?.regDate||x?.createdAt||x?.registeredAt||'').slice(0,10)}
function rowTeam(x){return String(x?.team||x?.teamName||x?.ownerTeam||x?.department||'팀 미지정')}
function rowStatus(x){return String(x?.activityStatus||x?.status||x?.auditState||'등록')}
let GRID={route:'all',query:'',page:1,size:20};
function renderOverview(){
 const root=document.getElementById('hd20LauncherOverview');if(!root)return;
 const {activities,actions}=sourceRows();
 const records=[...activities.map(x=>({...x,__route:'자율개선',__area:'activity'})),...actions.map(x=>({...x,__route:'개선요청',__area:'action'}))];
 const filtered=records.filter(x=>(GRID.route==='all'||x.__area===GRID.route)&&(!GRID.query||[x.__route,rowDate(x),rowTeam(x),rowStatus(x),x.title,x.subject,x.description,x.content,x.issue,x.id].some(v=>String(v??'').toLowerCase().includes(GRID.query.toLowerCase())))).sort((a,b)=>rowDate(b).localeCompare(rowDate(a)));
 const pages=Math.max(1,Math.ceil(filtered.length/GRID.size));GRID.page=Math.min(GRID.page,pages);
 const shown=filtered.slice((GRID.page-1)*GRID.size,GRID.page*GRID.size);
 const cell=(v)=>'<td>'+escapeText(v||'—')+'</td>';
 root.innerHTML='<nav class="hd20LnThreeTabs" aria-label="개선활동 등록 이력 조회"><button type="button" data-ln-tab="all" class="'+(GRID.route==='all'?'on':'')+'">① 총괄조회</button><button type="button" data-ln-tab="activity" class="'+(GRID.route==='activity'?'on':'')+'">② 자체개선 조회</button><button type="button" data-ln-tab="action" class="'+(GRID.route==='action'?'on':'')+'">③ 개선요청 조회</button></nav><div class="hd20LnOverviewHead"><b>자율개선 · 개선요청 통합 데이터 조회</b><div><button type="button" data-ln-exit-grid>통합조회 닫기 · 기존 메뉴로 돌아가기</button> <small>원천 등록 이력 통합 · 전체 '+records.length+'건</small></div></div>'+
 '<div class="hd20LnGridTools"><div class="hd20LnCounts"><span>전체 <b>'+records.length+'</b></span><span>자율개선 <b>'+activities.length+'</b></span><span>개선요청 <b>'+actions.length+'</b></span></div><div class="hd20LnFilters"><select aria-label="등록 구분" data-ln-filter><option value="all">전체 구분</option><option value="activity">자율개선</option><option value="action">개선요청</option></select><input aria-label="통합 검색" data-ln-search placeholder="등록일·팀·상태·내용 검색" value="'+escapeText(GRID.query)+'"><button type="button" data-ln-search-btn>검색</button><button type="button" data-ln-reset>초기화</button></div></div>'+
 '<div class="hd20LnTableScroll"><table class="hd20LnDataTable"><thead><tr><th>번호</th><th>등록 구분</th><th>등록일</th><th>담당 팀</th><th>등록 내용</th><th>상태</th><th>조회</th></tr></thead><tbody>'+ (shown.map((x,i)=>'<tr>'+cell((GRID.page-1)*GRID.size+i+1)+cell(x.__route)+cell(rowDate(x))+cell(rowTeam(x))+cell(x.title||x.subject||x.description||x.content||x.issue||x.activityName||x.item||'내용 미입력')+cell(rowStatus(x))+'<td><button type="button" data-ln-route="'+x.__area+'">열기</button></td></tr>').join('')||'<tr><td colspan="7" class="hd20LnEmpty">조회된 데이터가 없습니다.</td></tr>')+'</tbody></table></div>'+
 '<div class="hd20LnPager"><span>조회 '+filtered.length+'건 · '+GRID.page+' / '+pages+' 페이지</span><div><button type="button" data-ln-prev '+(GRID.page<=1?'disabled':'')+'>이전</button><button type="button" data-ln-next '+(GRID.page>=pages?'disabled':'')+'>다음</button></div></div>';
 root.querySelector('[data-ln-exit-grid]')?.addEventListener('click',()=>{document.body.classList.remove('hd20UnifiedLanding');root.classList.remove('hd20LnVisible');root.style.removeProperty('display');root.style.removeProperty('visibility');navigate('dashboard');try{const u=new URL(location.href);u.searchParams.delete('sub');history.replaceState(null,'',u)}catch{}});
 root.querySelectorAll('[data-ln-tab]').forEach(btn=>btn.onclick=()=>{GRID.route=btn.dataset.lnTab;GRID.query='';GRID.page=1;renderOverview()});
 root.querySelector('[data-ln-filter]').value=GRID.route;
 root.querySelector('[data-ln-filter]').onchange=e=>{GRID.route=e.target.value;GRID.page=1;renderOverview()};
 root.querySelector('[data-ln-search-btn]').onclick=()=>{GRID.query=root.querySelector('[data-ln-search]').value.trim();GRID.page=1;renderOverview()};
 root.querySelector('[data-ln-search]').onkeydown=e=>{if(e.key==='Enter'){GRID.query=e.target.value.trim();GRID.page=1;renderOverview()}};
 root.querySelector('[data-ln-reset]').onclick=()=>{GRID={route:'all',query:'',page:1,size:20};renderOverview()};
 root.querySelector('[data-ln-prev]').onclick=()=>{GRID.page--;renderOverview()};
 root.querySelector('[data-ln-next]').onclick=()=>{GRID.page++;renderOverview()};
 root.querySelectorAll('[data-ln-route]').forEach(btn=>btn.onclick=()=>navigate(btn.dataset.lnRoute));
}
function ensureOverview(){
 css();if(document.getElementById('hd20LauncherOverview'))return;
 const el=document.createElement('section');el.id='hd20LauncherOverview';el.setAttribute('aria-label','자율개선과 개선요청 통합 조회');(document.querySelector('.beginnerNav')||document.querySelector('.top'))?.insertAdjacentElement('afterend',el) || document.body.appendChild(el);
 el.addEventListener('click',e=>{if(e.target.closest('[data-ln-route]'))return});
 renderOverview();
}
function openOverview(){close();window.HD20_NAV?.go?.('activity');try{const u=new URL(location.href);if(u.searchParams.get('sub')==='unified'){u.searchParams.delete('sub');history.replaceState(null,'',u)}}catch{}ensureOverview();document.body.classList.remove('hd20UnifiedLanding');const grid=document.getElementById('hd20LauncherOverview');grid?.classList.add('hd20LnVisible');renderOverview();if(grid){grid.style.setProperty('display','block','important');grid.style.setProperty('visibility','visible','important');document.querySelector('.app')?.classList.remove('awFocused');document.getElementById('awActivity')?.classList.remove('on');document.getElementById('awAction')?.classList.remove('on');grid.scrollTop=0;grid.scrollIntoView({block:'start',behavior:'instant'})}}
function open(){
  if(document.getElementById('hd20Launcher'))return;
  ensureOverview();document.body.classList.remove('hd20UnifiedLanding');document.getElementById('hd20LauncherOverview')?.classList.add('hd20LnVisible');GRID.route='all';GRID.page=1;renderOverview();
  css();
  const el=document.createElement('div');
  el.id='hd20Launcher';
  el.innerHTML=`<div class="hd20LnBox" role="dialog" aria-modal="true" aria-label="빠른 등록 선택">
    <div class="hd20LnHead"><b>개선활동 등록</b><span>등록 유형을 선택하면 해당 화면으로 이동합니다.</span></div>
    <div class="hd20LnRow">
      <div class="hd20LnCard left"><div class="hd20LnCardContent"><small>현장팀이 작업환경 개선과 낭비 제거를 위해<br>자율적으로 발굴·실행한 5S 개선활동을 등록합니다.<span class="hd20LnTypes"><strong>주요 활동 유형</strong><span>정리 · 불용품·불급품 제거</span><span>정돈 · 정량·정위치 관리 및 동선·공간 개선</span><span>시각화관리 · 정량·정위치 표시, 단순 도색</span><span>위험구역 관리 · 출입통제 및 안전표식 개선</span><span>청소 · 작업장·주변시설·부대시설·Pallet 등</span><span>자주보전 · 설비 마모·파손 예방 및 자체 보전</span></span></small></div><button type="button" class="hd20LnRegisterBtn" data-ln="activity">자율개선 등록하기 →</button></div>
      <div class="hd20LnCard right"><div class="hd20LnCardContent"><small>공장장·5S 모듈조직·혁신팀 등의 점검 및 피드백으로<br>발굴된 개선조치 요청사항을 현장팀에 등록합니다.<span class="hd20LnTypes"><strong>주요 개선요청 발생 경로</strong><span>현장 패트롤 점검</span><span>자율 5S Audit</span><span>혁신팀 자율점검</span><span>5S 자율개선 활동 피드백</span></span></small></div><button type="button" class="hd20LnRegisterBtn" data-ln="action">개선요청 등록하기 →</button></div>
    </div>
    <div class="hd20LnFoot"><button type="button" data-ln="skip">전체 개선활동 조회하기</button></div>
  </div>`;
  document.body.appendChild(el);
  el.querySelector('[data-ln="activity"]').addEventListener('click',goActivityRegister);
  el.querySelector('[data-ln="action"]').addEventListener('click',goActionRegister);
  el.querySelector('[data-ln="skip"]').addEventListener('click',openOverview);
  /* 사용자 지시: "이 팝업창이 닫히면 바로 뒤에 전체 자율개선 등록조회 탭과 개선요청 등록 조회탭이
     연동되어 보여져야 한다" — 다른 세션이 "건너뛰기" 버튼에만 openOverview()(통합 조회 패널)를
     연결해 뒀고, 배경(오버레이) 클릭·ESC로 닫을 때는 close()만 호출해 통합 조회 없이 그냥 원래
     화면(대시보드)으로 남아 있었음. 카드 선택(자율개선/개선요청)은 그 등록 화면으로 바로 이동하는
     게 원래 의도이므로 그대로 두고, 배경 클릭·ESC는 "건너뛰기"와 동일하게 통합 조회가 뜨도록 통일. */
  el.addEventListener('click',e=>{if(e.target===el)openOverview()});
  document.addEventListener('keydown',function esc(e){if(e.key==='Escape'){openOverview();document.removeEventListener('keydown',esc)}});
}
window.HD20_LAUNCHER={openOverview,openRegister:open,renderOverview};
function boot(){
  window.addEventListener('hd20-nav-area-changed',e=>{if(e.detail?.area!=='dashboard'){document.body.classList.remove('hd20UnifiedLanding');document.getElementById('hd20LauncherOverview')?.classList.remove('hd20LnVisible')}});
  ['hd20-kpi-source-updated','hd20-action-updated','hd20-activity-updated','hd20-dashboard-ready','hd20-nav-area-changed'].forEach(e=>window.addEventListener(e,()=>{ensureOverview();renderOverview()}));
  window.addEventListener('storage',renderOverview);
  setInterval(()=>{if(window.HD20_NAV?.active?.()==='dashboard'&&!document.activeElement?.matches?.('#hd20LauncherOverview input'))renderOverview()},5000);
  setTimeout(()=>{ensureOverview();renderOverview()},1800);
  let seen=false;try{seen=sessionStorage.getItem(SEEN_KEY)==='1'}catch{}
  // 새로고침 때도 팝업을 표시합니다.
  /* 사용자 지적: "로그인 후 런처 팝업이 안 떠요" — 원인 발견: supabase-auth.js는 로그인 화면
     (<html class="hd20-auth-pending">)을 띄워 둔 채로도 .beginnerNav 버튼을 DOM에 미리 그려 놓고
     CSS로만 숨겨 두는데, 이 런처는 "버튼이 DOM에 있는지"만 폴링해서 로그인 완료 전(로그인 화면이
     아직 떠 있는 상태)에 먼저 열려버렸음. 그 열린 런처는 로그인 게이트 뒤에 가려 사용자 눈엔 전혀
     안 보인 채로 조용히 떠 있었던 것 — 로그인 완료 시 supabase-auth.js가 쏘는 'hd20-auth-bypass'
     이벤트(또는 이미 로그인/로컬 환경이라 window.HD20_AUTH_BYPASS가 true인 경우)를 먼저 기다렸다가
     그 이후에만 열리도록 게이트를 추가. */
  const afterAuth=(fn)=>{
    if(window.HD20_AUTH_BYPASS===true){fn();return}
    const onAuth=()=>{window.removeEventListener('hd20-auth-bypass',onAuth);fn()};
    window.addEventListener('hd20-auth-bypass',onAuth);
    setTimeout(()=>{window.removeEventListener('hd20-auth-bypass',onAuth);fn()},15000);
  };
  // 메인 네비게이션이 그려질 때까지 대기한 뒤(배경이 "전체 조회 화면"으로 먼저 자리잡은 상태) 팝업을 띄움
  const tryOpen=(n)=>{
    n=n||0;
    if(document.querySelector('.beginnerNav button')){ensureOverview();renderOverview();open();return}
    if(n>60)return;
    setTimeout(()=>tryOpen(n+1),100);
  };
  afterAuth(()=>tryOpen());
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
