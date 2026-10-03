(()=>{'use strict';
const NAV_HTML=`<button class="active" data-key="dashboard"><span class="navTop">① 대시보드</span><small>전체 성과와 위험을 한눈에 확인</small></button><button data-key="activity"><span class="navTop">② 활동관리</span><small>현장 5S 활동 등록·조회·실적관리</small></button><button data-key="advancement"><span class="navTop">③ 고도화·표준화</span><small>우수 작업장 판정·표준화·수평전개</small></button><button data-key="audit"><span class="navTop">④ 진단·유지</span><small>현장 진단·Audit·6개월 유지관리</small></button><button data-key="action"><span class="navTop">⑤ 개선실행</span><small>미흡사항 조치·효과검증·재발방지</small></button><button data-key="master"><span class="navTop">⑥ 통합기준정보</span><small>표시순서·목표·운영정책 관리</small></button>`;
const SCREEN_BY_KEY={activity:'awActivity',audit:'awAudit',action:'awAction',master:'masterModal'};
let activeKey='dashboard',initialized=false;
function allScreens(){return [...document.querySelectorAll('.awScreen')];}
function closeScreens(){allScreens().forEach(x=>x.classList.remove('on'));document.querySelector('.app')?.classList.remove('awFocused');document.body?.classList.remove('navModeActivity');document.getElementById('performanceConversionAnalysis')?.classList.remove('on')}
function syncNav(nav,key){activeKey=key;nav.querySelectorAll('button[data-key]').forEach(b=>b.classList.toggle('active',b.dataset.key===key));window.dispatchEvent(new CustomEvent('hd20-nav-area-changed',{detail:{area:key}}))}
function openScreen(id){const el=document.getElementById(id);if(!el)return false;closeScreens();window.dispatchEvent(new CustomEvent('hd20-close-maturity-map-tab'));document.querySelector('.app')?.classList.add('awFocused');el.classList.add('on');requestAnimationFrame(()=>{window.scrollTo(0,0);document.documentElement.scrollTop=0;if(document.body)document.body.scrollTop=0});return true}
function openAdvancement(nav){closeScreens();window.dispatchEvent(new CustomEvent('hd20-close-maturity-map-tab'));document.dispatchEvent(new CustomEvent('hd20-open-performance-conversion'));setTimeout(()=>{const conversion=document.getElementById('performanceConversionAnalysis');const workplace=document.getElementById('awWorkplace');document.querySelector('.app')?.classList.add('awFocused');if(conversion){conversion.classList.add('on');conversion.dataset.integratedArea='advancement'}if(workplace){workplace.classList.add('on');workplace.dataset.integratedArea='advancement'}},0);syncNav(nav,'advancement')}
function goDashboard(nav,section){closeScreens();window.dispatchEvent(new CustomEvent('hd20-close-maturity-map-tab'));syncNav(nav,'dashboard');try{const u=new URL(location.href);u.searchParams.set('area','dashboard');if(section)u.searchParams.set('section',section);else u.searchParams.delete('section');u.searchParams.delete('sub');history.replaceState(null,'',u)}catch{}(function tryApply(n){if(window.HD20_DASHBOARD_TABS){if(section)window.HD20_DASHBOARD_TABS.apply(section);else window.HD20_DASHBOARD_TABS.reset?.();return}if(n<60)setTimeout(()=>tryApply(n+1),100)})(0);if(!section)requestAnimationFrame(()=>{window.scrollTo(0,0);document.documentElement.scrollTop=0;if(document.body)document.body.scrollTop=0})}
function go(key,nav){if(key==='dashboard'){goDashboard(nav);return}
  try{const u=new URL(location.href);u.searchParams.set('area',key);u.searchParams.delete('section');history.replaceState(null,'',u)}catch{}
  syncNav(nav,key);if(key==='advancement'){openAdvancement(nav);return}const id=SCREEN_BY_KEY[key];if(id){openScreen(id);if(key==='master')window.dispatchEvent(new CustomEvent('hd20-open-master'));return}}
function ensureNav(){let nav=document.querySelector('.beginnerNav');if(!nav){nav=document.createElement('nav');nav.className='beginnerNav';nav.setAttribute('aria-label','5S 통합관리 메뉴');document.querySelector('.top')?.insertAdjacentElement('afterend',nav)}nav.innerHTML=NAV_HTML;nav.dataset.controller='canonical-five-area-v10-early-boot';return nav}
function ensureHint(nav){let hint=document.querySelector('.beginnerHint');if(!hint){hint=document.createElement('div');hint.className='beginnerHint';nav.insertAdjacentElement('afterend',hint)}hint.innerHTML='<b>업무 흐름</b> <span class="flowStep">활동 실행</span><i>→</i><span class="flowStep">고도화 판정·표준화</span><i>→</i><span class="flowStep">진단·Audit</span><i>→</i><span class="flowStep">개선·효과검증</span><i>→</i><span class="flowStep">표준/활동 환류</span><em>대시보드에서 전 과정 통합 모니터링</em>'}
function bind(nav){nav.querySelectorAll('button[data-key]').forEach(btn=>btn.onclick=()=>go(btn.dataset.key,nav))}
function normalizeDeepLink(k){return ({conversion:'advancement',workplace:'advancement',master:'dashboard'})[k]||k}
function init(){if(initialized)return;const nav=document.querySelector('.beginnerNav');if(!nav)return;initialized=true;ensureNav();ensureHint(nav);bind(nav);
  const q=new URLSearchParams(location.search),raw=q.get('tab'),area=q.get('area'),section=q.get('section'),sub=q.get('sub');
  if(['maturitymap','map','maturity'].includes(raw)){goDashboard(nav,'maturity');return}
  /* 새로고침 시 마지막으로 보던 화면을 복원 — area(영역)까지는 여기서, sub(서브탭)은 hd20-subtabs.js가
     스스로 부팅되면서 같은 URL을 읽어 이어서 복원함(서브탭 목록이 area 결정 후에야 만들어지므로 분리) */
  const AREAS=['dashboard','activity','advancement','audit','action','master'];
  if(area&&AREAS.includes(area)){
    if(area==='dashboard')goDashboard(nav,section||'');else go(area,nav);
    if(sub)window.__HD20_RESTORE_SUB=sub;
    /* 안전망: 다른 스크립트들이 각자 타이밍에 기본값(요약/종합현황)으로 되돌리는 경합이 있어, 페이지가
       완전히 안정된 뒤(1.6초) URL을 다시 확인해 최종적으로 한 번 더 강제 적용 — 그 사이 값이 바뀌지
       않았다면(사용자가 이미 다른 곳으로 이동한 게 아니라면) 그대로 재적용 */
    setTimeout(()=>{
      const q2=new URLSearchParams(location.search);
      if(q2.get('area')!==area)return; // 이미 사용자가 다른 화면으로 이동함 — 건드리지 않음
      if(area==='dashboard'){
        const cur=document.querySelector('#hd20DashboardSectionTabs button.active')?.dataset.dashboardSection;
        if((section||'summary')!==(cur||'summary'))window.HD20_DASHBOARD_TABS?.apply?.(section||'summary');
      }else{
        if(sub&&window.HD20_SUBNAV?.select&&window.HD20_NAV?.active?.()===area)window.HD20_SUBNAV.select(area,sub);
      }
    },1600);
    return;
  }
  go('dashboard',nav)}
window.HD20_NAV={go:key=>{const nav=document.querySelector('.beginnerNav');if(!nav)return;const k=normalizeDeepLink(key);if(['maturitymap','map','maturity'].includes(k)){goDashboard(nav,'maturity');return}go(k,nav)},active:()=>activeKey,areas:['dashboard','activity','advancement','audit','action','master'],ready:()=>initialized};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else setTimeout(init,0);
})();