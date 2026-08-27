(()=>{'use strict';
const APPROVED_VERSION='20260827-reference2-canonical-4';
if(!document.querySelector('link[data-hd20-approved-landing]')){
  const l=document.createElement('link');
  l.rel='stylesheet';
  l.href=`approved-landing-v2.css?v=${APPROVED_VERSION}`;
  l.dataset.hd20ApprovedLanding='1';
  document.head.appendChild(l);
}
if(!document.querySelector('script[data-hd20-approved-landing]')){
  const s=document.createElement('script');
  s.src=`approved-landing-v2.js?v=${APPROVED_VERSION}`;
  s.dataset.hd20ApprovedLanding='1';
  document.head.appendChild(s);
}
})();

(()=>{'use strict';
const STYLE_ID='beginnerNavStyle';
function css(){
  document.getElementById(STYLE_ID)?.remove();
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`.gmesNav,.legacyNav,.legacy-tabs,.topTabs,.tabbar,.tab-bar{display:none!important}.beginnerNav{position:relative;z-index:45;margin:10px 0 12px;padding:7px;border:1px solid #d7e3ec;border-radius:13px;background:#fff;box-shadow:0 5px 16px rgba(20,52,76,.06);display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}.beginnerNav button{position:relative;min-width:0;border:1px solid transparent;border-radius:10px;background:transparent;padding:9px 8px;text-align:left;cursor:pointer;min-height:56px}.beginnerNav button:hover{background:#f2f7fb;border-color:#d7e5ef}.beginnerNav button.active{background:#12324d;color:#fff;border-color:#12324d}.beginnerNav .navTop{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:900;white-space:nowrap;overflow:hidden}.beginnerNav .navIcon{width:22px;height:22px;border-radius:7px;display:grid;place-items:center;background:#edf4f9;color:#215b84;font-size:10px;font-weight:900;flex:0 0 auto}.beginnerNav button.active .navIcon{background:#fff;color:#12324d}.beginnerNav small{display:block;margin-top:4px;font-size:8.5px;font-weight:700;line-height:1.25;color:#667f92;white-space:normal}.beginnerNav button.active small{color:#dce8f1}.beginnerNav .badge{position:absolute;right:6px;top:5px;min-width:17px;height:17px;padding:0 4px;border-radius:9px;background:#fff1d8;color:#a96a00;display:grid;place-items:center;font-size:8px;font-weight:900}.beginnerNav .badge.zero{background:#edf2f6;color:#6f8190}.beginnerHint{margin:-3px 0 11px;padding:7px 10px;border-radius:8px;background:#f7fafc;border:1px solid #e3e8ef;color:#667085;font-size:9.5px;font-weight:700}.beginnerHint b{color:#12324d}.navAnchor,.awScreen{scroll-margin-top:18px}@media(max-width:1100px){.beginnerNav{grid-template-columns:repeat(4,minmax(0,1fr))}}@media(max-width:700px){.beginnerNav{grid-template-columns:repeat(2,minmax(0,1fr))}}`;
  document.head.appendChild(s);
}
function hideDuplicates(){
  document.querySelectorAll('nav').forEach(el=>{
    if(el.classList.contains('beginnerNav'))return;
    const t=(el.textContent||'').replace(/\s+/g,' ');
    if(t.includes('5S 고도화 성과')||t.includes('5S 활동현황'))el.style.setProperty('display','none','important');
  });
}
function allScreens(){return [...document.querySelectorAll('.awScreen')];}
function closeScreens(){
  allScreens().forEach(x=>x.classList.remove('on'));
  document.querySelector('.app')?.classList.remove('awFocused');
  document.body.classList.remove('navModeActivity');
}
function openScreen(id){
  const el=document.getElementById(id);
  if(!el)return false;
  closeScreens();
  document.querySelector('.app')?.classList.add('awFocused');
  el.classList.add('on');
  requestAnimationFrame(()=>el.scrollIntoView({block:'start'}));
  return true;
}
function go(key){
  if(key==='dashboard'){
    closeScreens();
    document.querySelector('.hd20ApprovedLanding,.cards,.approvedFramework')?.scrollIntoView({block:'start'});
    return;
  }
  if(key==='conversion'){
    if(openScreen('performanceConversionAnalysis'))return;
    document.dispatchEvent(new CustomEvent('hd20-open-performance-conversion'));
    return;
  }
  if(key==='activity'&&openScreen('awActivity'))return;
  if(key==='workplace'&&openScreen('awWorkplace'))return;
  if(key==='audit'&&openScreen('awAudit'))return;
  if(key==='action'&&openScreen('awAction'))return;
  if(key==='master'){
    if(openScreen('awRegister'))return;
    document.getElementById('openMaster')?.click();
  }
}
function updateBadges(){
  const nav=document.querySelector('.beginnerNav');
  if(!nav)return;
  const snap=window.HD20KPIData?.snapshot?.();
  const follow=window.HD20MaturityFollowup?.summary?.();
  const set=(key,value)=>{
    const badge=nav.querySelector(`[data-key="${key}"] .badge`);
    if(!badge)return;
    const v=Number.isFinite(Number(value))?Number(value):0;
    badge.textContent=String(v);
    badge.classList.toggle('zero',v===0);
  };
  set('workplace',snap?.candidates?.length||0);
  set('audit',follow?.due?.length||0);
}
function init(){
  css();
  hideDuplicates();
  document.querySelector('.beginnerNav')?.remove();
  document.querySelector('.beginnerHint')?.remove();

  const nav=document.createElement('nav');
  nav.className='beginnerNav';
  nav.setAttribute('aria-label','5S 통합관리 메뉴');
  nav.innerHTML=`<button class="active" data-key="dashboard"><span class="navTop"><span class="navIcon">▦</span>① 대시보드</span><small>전체 현황·성과 한눈에 보기</small></button><button data-key="conversion"><span class="navTop"><span class="navIcon">↗</span>② 성과전환 분석</span><small>활동→후보→확정→유지 분석</small></button><button data-key="activity"><span class="navTop"><span class="navIcon">✓</span>③ 5S 활동관리</span><small>6개 유형 활동·월별 추이</small></button><button data-key="workplace"><span class="navTop"><span class="navIcon">◆</span>④ 고도화 작업장</span><small>후보·판정·확정·유지 관리</small><span class="badge zero">0</span></button><button data-key="audit"><span class="navTop"><span class="navIcon">◎</span>⑤ Audit 관리</span><small>1·3·6개월 점검·유지 확인</small><span class="badge zero">0</span></button><button data-key="action"><span class="navTop"><span class="navIcon">!</span>⑥ 문제점·개선조치</span><small>부적합·기한경과·후속조치</small></button><button data-key="master"><span class="navTop"><span class="navIcon">⚙</span>⑦ 기준정보</span><small>팀·목표·유형·판정기준</small></button>`;
  document.querySelector('.top')?.insertAdjacentElement('afterend',nav);

  const hint=document.createElement('div');
  hint.className='beginnerHint';
  hint.innerHTML='<b>통합 업무 메뉴</b> · 최초 접속은 종합 대시보드이며 성과전환 분석은 별도 화면으로 운영합니다.';
  nav.insertAdjacentElement('afterend',hint);

  nav.querySelectorAll('button').forEach(btn=>btn.onclick=()=>{
    nav.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===btn));
    go(btn.dataset.key);
  });
  updateBadges();
  hideDuplicates();
}
['hd20-kpi-source-updated','hd20-followup-updated','hd20-gmes-5s-imported','hd20-gmes-5s-judged'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(updateBadges,0)));
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})();