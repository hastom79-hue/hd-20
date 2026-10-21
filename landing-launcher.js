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
  #hd20Launcher .hd20LnRow{display:grid;grid-template-columns:1fr 1fr;gap:16px}
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
  s.textContent+=`#hd20LauncherOverview{margin:12px 0;padding:16px;border:1px solid #dce6ed;border-radius:12px;background:#fff;color:#17394f}#hd20LauncherOverview .hd20LnOverviewHead{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}#hd20LauncherOverview .hd20LnOverviewHead b{font-size:16px}#hd20LauncherOverview .hd20LnOverviewHead small{color:#637c8c}#hd20LauncherOverview .hd20LnOverviewGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}#hd20LauncherOverview .hd20LnOverviewCol{min-width:0;border:1px solid #e2ebf0;border-radius:9px;padding:12px}#hd20LauncherOverview .hd20LnOverviewTop{display:flex;justify-content:space-between;margin-bottom:8px}#hd20LauncherOverview table{width:100%;border-collapse:collapse;font-size:12px}#hd20LauncherOverview th,#hd20LauncherOverview td{padding:6px 4px;border-bottom:1px solid #eef2f5;text-align:left}#hd20LauncherOverview button{margin-top:10px;padding:7px 12px;border:1px solid #b6d3dc;border-radius:7px;background:#f3f9fb;cursor:pointer;color:#174765}body:has(.app.awFocused) #hd20LauncherOverview{display:none}@media(max-width:760px){#hd20LauncherOverview .hd20LnOverviewGrid{grid-template-columns:1fr}#hd20LauncherOverview .hd20LnOverviewHead{display:block}}`;
  document.head.appendChild(s);
}
function close(){document.getElementById('hd20Launcher')?.remove();try{sessionStorage.setItem(SEEN_KEY,'1')}catch{}}
function clickWhenReady(findFn,tries=0){
 const el=findFn();if(el){el.click();return true}
 if(tries>=50){console.warn('[HD20 launcher] 등록 화면을 찾지 못했습니다');return false}
 setTimeout(()=>clickWhenReady(findFn,tries+1),100);return null;
}
function navigate(area){
 if(window.HD20_NAV?.go)window.HD20_NAV.go(area);
 else document.querySelector('.beginnerNav button[data-key="'+area+'"]')?.click();
}
function goActivityRegister(){
 close();navigate('activity');
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
function renderOverview(){
 const root=document.getElementById('hd20LauncherOverview');if(!root)return;
 const {activities,actions}=sourceRows();
 const column=(title,rows,area)=>'<section class="hd20LnOverviewCol"><div class="hd20LnOverviewTop"><b>'+title+'</b><strong>'+rows.length+'건</strong></div><table><thead><tr><th>등록일</th><th>담당 팀</th><th>상태</th></tr></thead><tbody>'+([...rows].sort((a,b)=>rowDate(b).localeCompare(rowDate(a))).slice(0,5).map(x=>'<tr><td>'+escapeText(rowDate(x)||'—')+'</td><td>'+escapeText(rowTeam(x))+'</td><td>'+escapeText(rowStatus(x))+'</td></tr>').join('')||'<tr><td colspan="3">등록된 데이터 없음</td></tr>')+'</tbody></table><button type="button" data-ln-route="'+area+'">해당 루트 전체 조회 →</button></section>';
 root.innerHTML='<div class="hd20LnOverviewHead"><b>자율개선 · 개선요청 통합 조회</b><small>두 등록 루트의 원천 데이터를 한 화면에서 조회합니다. 최근 등록 각 5건</small></div><div class="hd20LnOverviewGrid">'+column('자율개선',activities,'activity')+column('개선요청',actions,'action')+'</div>';
 root.querySelectorAll('[data-ln-route]').forEach(btn=>btn.onclick=()=>navigate(btn.dataset.lnRoute));
}
function ensureOverview(){
 if(document.getElementById('hd20LauncherOverview'))return;
 const nav=document.querySelector('.beginnerNav');if(!nav)return;
 const el=document.createElement('section');el.id='hd20LauncherOverview';el.setAttribute('aria-label','자율개선과 개선요청 통합 조회');nav.insertAdjacentElement('afterend',el);
 el.addEventListener('click',e=>{if(e.target.closest('[data-ln-route]'))return});
 renderOverview();
}
function openOverview(){close();navigate('dashboard');ensureOverview();renderOverview();document.getElementById('hd20LauncherOverview')?.scrollIntoView({block:'start',behavior:'smooth'})}
function open(){
  if(document.getElementById('hd20Launcher'))return;
  css();
  const el=document.createElement('div');
  el.id='hd20Launcher';
  el.innerHTML=`<div class="hd20LnBox" role="dialog" aria-modal="true" aria-label="빠른 등록 선택">
    <div class="hd20LnHead"><b>오늘 등록할 내용을 선택하세요</b><span>선택 후 바로 해당 등록 화면으로 이동합니다 · 배경은 전체 조회 화면입니다</span></div>
    <div class="hd20LnRow">
      <div class="hd20LnCard left" data-ln="activity"><div class="ic">🧹</div><b>자율개선 등록</b><small>현장팀에서 자체적으로 개선한<br>활동을 등록하는 창구입니다</small></div>
      <div class="hd20LnCard right" data-ln="action"><div class="ic">📨</div><b>개선요청 등록</b><small>공장장·5S모듈조직·혁신팀으로부터 현장 패트롤<br>점검·자율 5S Audit·혁신팀 자율 점검·5S 자율개선<br>활동 피드백 등 다양한 루트로 도출된 개선조치<br>요청사항을 현장팀에 등록하는 창구입니다</small></div>
    </div>
    <div class="hd20LnFoot"><button type="button" data-ln="skip">건너뛰고 전체 조회 화면 바로 보기</button></div>
  </div>`;
  document.body.appendChild(el);
  el.querySelector('[data-ln="activity"]').addEventListener('click',goActivityRegister);
  el.querySelector('[data-ln="action"]').addEventListener('click',goActionRegister);
  el.querySelector('[data-ln="skip"]').addEventListener('click',openOverview);
  el.addEventListener('click',e=>{if(e.target===el)close()});
  document.addEventListener('keydown',function esc(e){if(e.key==='Escape'){close();document.removeEventListener('keydown',esc)}});
}
function boot(){
  ['hd20-kpi-source-updated','hd20-action-updated','hd20-activity-updated','hd20-dashboard-ready','hd20-nav-area-changed'].forEach(e=>window.addEventListener(e,()=>{ensureOverview();renderOverview()}));
  window.addEventListener('storage',renderOverview);
  setTimeout(()=>{ensureOverview();renderOverview()},1800);
  let seen=false;try{seen=sessionStorage.getItem(SEEN_KEY)==='1'}catch{}
  if(seen){setTimeout(()=>{ensureOverview();renderOverview()},250);return;}
  // 메인 네비게이션이 그려질 때까지 대기한 뒤(배경이 "전체 조회 화면"으로 먼저 자리잡은 상태) 팝업을 띄움
  const tryOpen=(n)=>{
    n=n||0;
    if(document.querySelector('.beginnerNav button')){ensureOverview();renderOverview();open();return}
    if(n>60)return;
    setTimeout(()=>tryOpen(n+1),100);
  };
  tryOpen();
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
