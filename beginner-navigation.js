(()=>{'use strict';
const NAV_HTML=`<button class="active" data-key="dashboard"><span class="navTop"><span class="navNumber">01</span><span class="navLabel">대시보드</span></span></button><button data-key="activity"><span class="navTop"><span class="navNumber">02</span><span class="navLabel">자율개선등록 / 개선조치등록</span></span></button><button data-key="audit"><span class="navTop"><span class="navNumber">03</span><span class="navLabel">Audit·유지점검</span></span></button><button data-key="action"><span class="navTop"><span class="navNumber">04</span><span class="navLabel">개선조치·완료관리</span></span></button><button data-key="advancement"><span class="navTop"><span class="navNumber">05</span><span class="navLabel">고도화·표준화</span></span></button><button data-key="master"><span class="navTop"><span class="navNumber">06</span><span class="navLabel">통합기준정보</span></span></button><button data-key="theme"><span class="navTop"><span class="navNumber">07</span><span class="navLabel">테마 점검</span></span></button>`;
const SCREEN_BY_KEY={activity:'awActivity',audit:'awAudit',action:'awAction',master:'masterModal',theme:'awTheme'};
let activeKey='dashboard',initialized=false,navGeneration=0;
function allScreens(){return [...document.querySelectorAll('.awScreen')];}
function closeScreens(){
 allScreens().forEach(x=>x.classList.remove('on'));
 document.querySelector('.app')?.classList.remove('awFocused');
 document.body?.classList.remove('navModeActivity');
 const conversion=document.getElementById('performanceConversionAnalysis');
 if(conversion){conversion.classList.remove('on','hd20AdvancementStandard');conversion.classList.add('hd20SubHidden')}
 document.getElementById('awWorkplace')?.classList.remove('on');
}
/* Single source of truth for visible top-level content.
   Legacy standardization CSS can keep its container visible after a top-tab switch.
   Inline important takes precedence over those legacy author stylesheet rules. */
function reconcileVisibleArea(){
 const nav=document.querySelector('.beginnerNav');
 const selected=nav?.querySelector('button[data-key].active')?.dataset.key;
 if(!selected)return;
 const app=document.querySelector('.app');
 const conversion=document.getElementById('performanceConversionAnalysis');
 if(conversion){
   if(selected==='advancement'){
     conversion.style.removeProperty('display');
   }else{
     conversion.classList.remove('on','hd20AdvancementStandard');
     conversion.classList.add('hd20SubHidden');
     conversion.style.setProperty('display','none','important');
   }
 }
 const screens={activity:'awActivity',audit:'awAudit',action:'awAction',master:'masterModal',theme:'awTheme'};
 Object.entries(screens).forEach(([area,id])=>{
   const el=document.getElementById(id);if(!el)return;
   if(selected===area){el.style.removeProperty('display')}
   else{el.classList.remove('on');el.style.setProperty('display','none','important')}
 });
 if(selected!=='advancement')document.getElementById('awWorkplace')?.classList.remove('on');
 if(selected!=='dashboard'&&app&&!app.classList.contains('awFocused')&&selected!=='activity')app.classList.add('awFocused');
 if(selected==='master')reconcileMasterView();
}
function scheduleAreaReconcile(){
 reconcileVisibleArea();
 requestAnimationFrame(reconcileVisibleArea);
 setTimeout(reconcileVisibleArea,80);
 setTimeout(reconcileVisibleArea,450);
 setTimeout(reconcileVisibleArea,1800);
}
function syncNav(nav,key){activeKey=key;navGeneration++;nav.querySelectorAll('button[data-key]').forEach(b=>b.classList.toggle('active',b.dataset.key===key));window.dispatchEvent(new CustomEvent('hd20-nav-area-changed',{detail:{area:key}}));scheduleAreaReconcile()}
function syncMergedSwitch(key){}
function openScreen(id){
 const el=document.getElementById(id);if(!el)return false;
 closeScreens();window.dispatchEvent(new CustomEvent('hd20-close-maturity-map-tab'));
 document.querySelector('.app')?.classList.add('awFocused');
 el.classList.add('on');
 requestAnimationFrame(()=>{window.scrollTo(0,0);document.documentElement.scrollTop=0;if(document.body)document.body.scrollTop=0});
 return true
}
function openAdvancement(nav){syncMergedSwitch('advancement');closeScreens();window.dispatchEvent(new CustomEvent('hd20-close-maturity-map-tab'));syncNav(nav,'advancement');const generation=navGeneration;document.dispatchEvent(new CustomEvent('hd20-open-performance-conversion'));setTimeout(()=>{if(activeKey!=='advancement'||generation!==navGeneration)return;const conversion=document.getElementById('performanceConversionAnalysis');const workplace=document.getElementById('awWorkplace');document.querySelector('.app')?.classList.add('awFocused');if(conversion){conversion.classList.add('on');conversion.dataset.integratedArea='advancement'}if(workplace){workplace.classList.add('on');workplace.dataset.integratedArea='advancement'}},0)}
function goDashboard(nav,section){syncMergedSwitch('dashboard');closeScreens();window.dispatchEvent(new CustomEvent('hd20-close-maturity-map-tab'));syncNav(nav,'dashboard');try{const u=new URL(location.href);u.searchParams.set('area','dashboard');if(section)u.searchParams.set('section',section);else u.searchParams.delete('section');u.searchParams.delete('sub');history.replaceState(null,'',u)}catch{}(function tryApply(n){if(activeKey!=='dashboard')return;if(window.HD20_DASHBOARD_TABS){if(section==='map')window.HD20_DASHBOARD_TABS?.apply?.('map',{scroll:false});else if(section)window.HD20_DASHBOARD_TABS.apply(section);else window.HD20_DASHBOARD_TABS.reset?.();return}if(n<60)setTimeout(()=>tryApply(n+1),100)})(0);if(!section)requestAnimationFrame(()=>{window.scrollTo(0,0);document.documentElement.scrollTop=0;if(document.body)document.body.scrollTop=0})}
function go(key,nav,opts={}){syncMergedSwitch(key);if(key==='dashboard'){goDashboard(nav);return}
  try{const u=new URL(location.href);u.searchParams.set('area',key);u.searchParams.delete('section');if(!opts.preserveSub||key==='master')u.searchParams.delete('sub');history.replaceState(null,'',u)}catch{}
  syncNav(nav,key);if(key==='advancement'){openAdvancement(nav);return}const id=SCREEN_BY_KEY[key];if(id){
  const opened=openScreen(id);
  if(key==='master'){
    if(opened)window.dispatchEvent(new CustomEvent('hd20-open-master'));
    reconcileMasterView();
    requestAnimationFrame(reconcileMasterView);
    setTimeout(reconcileMasterView,350);
    setTimeout(reconcileMasterView,1800);
  }
  return
}}
/* Refresh/deep-link repair: top-nav state and visible screen must never diverge.
   A late dashboard initializer can clear awFocused or .on after master was selected. */
function reconcileMasterView(){
 const nav=document.querySelector('.beginnerNav');
 if(!nav||activeKey!=='master'||!nav.querySelector('button[data-key="master"].active'))return;
 const modal=document.getElementById('masterModal');
 if(!modal)return;
 const app=document.querySelector('.app');
 if(app&&modal.parentElement!==app)app.appendChild(modal);
 app?.classList.add('awFocused');
 if(!modal.classList.contains('on'))modal.classList.add('on');
 document.querySelectorAll('.awScreen.on').forEach(el=>{if(el!==modal)el.classList.remove('on')});
 document.getElementById('performanceConversionAnalysis')?.classList.remove('on');
 document.getElementById('awWorkplace')?.classList.remove('on');
}
function installMasterViewGuard(){
 if(document.documentElement.dataset.hd20MasterViewGuard)return;
 document.documentElement.dataset.hd20MasterViewGuard='1';
 const css=document.createElement('style');css.id='hd20MasterViewGuardCss';
 css.textContent=`/* Guard against dashboard bleeding into the master view after reload */
body:has(.beginnerNav button[data-key="master"].active) .app>.cards,
body:has(.beginnerNav button[data-key="master"].active) .app>.mainGrid,
body:has(.beginnerNav button[data-key="master"].active) .app>.bottomGrid,
body:has(.beginnerNav button[data-key="master"].active) .app>#hd20DashboardPriority,
body:has(.beginnerNav button[data-key="master"].active) .app>.hd20DashboardSectionLabel,
body:has(.beginnerNav button[data-key="master"].active) .app>#hd20OperationalBridge,
body:has(.beginnerNav button[data-key="master"].active) #hd20DashboardSectionTabs,
body:has(.beginnerNav button[data-key="master"].active) #performanceConversionAnalysis,
body:has(.beginnerNav button[data-key="master"].active) #awWorkplace,
body:has(.beginnerNav button[data-key="master"].active) #hd20AdvancementDecisionGuide,
body:has(.beginnerNav button[data-key="master"].active) #hd20MaturityConditionAnalysis,
body:has(.beginnerNav button[data-key="master"].active) #hd20AdvancementIntegrated,
body:has(.beginnerNav button[data-key="master"].active) #hd20AdvancementDecisionTable{display:none!important}
/* Canonical six-area isolation. A legacy advancement style forces display:block!important
   for .hd20AdvancementStandard, even when another top tab is selected. */
html body:has(.beginnerNav button[data-key="dashboard"].active) #performanceConversionAnalysis,
html body:has(.beginnerNav button[data-key="activity"].active) #performanceConversionAnalysis,
html body:has(.beginnerNav button[data-key="audit"].active) #performanceConversionAnalysis,
html body:has(.beginnerNav button[data-key="action"].active) #performanceConversionAnalysis,
html body:has(.beginnerNav button[data-key="master"].active) #performanceConversionAnalysis,
html body:has(.beginnerNav button:not([data-key="advancement"]).active) #awWorkplace,
html body:has(.beginnerNav button:not([data-key="advancement"]).active) #hd20MaturityMapTab,
html body:has(.beginnerNav button:not([data-key="advancement"]).active) #hd20AdvancementDecisionGuide,
html body:has(.beginnerNav button:not([data-key="advancement"]).active) #hd20MaturityConditionAnalysis,
html body:has(.beginnerNav button:not([data-key="advancement"]).active) #hd20AdvancementIntegrated,
html body:has(.beginnerNav button:not([data-key="advancement"]).active) #hd20AdvancementDecisionTable,
html body:has(.beginnerNav button:not([data-key="activity"]).active) #awActivity,
html body:has(.beginnerNav button:not([data-key="audit"]).active) #awAudit,
html body:has(.beginnerNav button:not([data-key="action"]).active) #awAction,
html body:has(.beginnerNav button:not([data-key="master"]).active) #masterModal,
html body:has(.beginnerNav button:not([data-key="theme"]).active) #awTheme{display:none!important}
/* The master editor is an app-level screen. Dashboard widgets must not coexist. */
.app.awFocused:has(> #masterModal.on) > :not(.top):not(.beginnerNav):not(#masterModal):not(script):not(style){display:none!important}
.app.awFocused:has(> #masterModal.on) > #masterModal{display:block!important}
`;
 document.head.appendChild(css);
 const nav=document.querySelector('.beginnerNav');
 if(nav)new MutationObserver(()=>{if(activeKey==='master')reconcileMasterView()}).observe(nav,{subtree:true,attributes:true,attributeFilter:['class']});
 window.addEventListener('pageshow',reconcileMasterView);
 window.addEventListener('load',reconcileMasterView,{once:true});
 window.addEventListener('hd20-nav-area-changed',()=>{if(activeKey==='master')reconcileMasterView()});
 window.addEventListener('pageshow',scheduleAreaReconcile);
 window.addEventListener('load',scheduleAreaReconcile,{once:true});
}
function ensureNav(){let nav=document.querySelector('.beginnerNav');if(!nav){nav=document.createElement('nav');nav.className='beginnerNav';nav.setAttribute('aria-label','5S 통합관리 메뉴');document.querySelector('.top')?.insertAdjacentElement('afterend',nav)}nav.innerHTML=NAV_HTML;nav.dataset.controller='canonical-five-area-v10-early-boot';return nav}
function ensureHint(nav){document.querySelector('.beginnerHint')?.remove()}
function bind(nav){nav.querySelectorAll('button[data-key]').forEach(btn=>btn.onclick=()=>{if(btn.dataset.key==='activity'){go('activity',nav);if(window.HD20_LAUNCHER?.openOverview)window.HD20_LAUNCHER.openOverview();else setTimeout(()=>window.HD20_LAUNCHER?.openOverview?.(),150)}else go(btn.dataset.key,nav)})}
function normalizeDeepLink(k){return ({conversion:'advancement',workplace:'advancement'})[k]||k}
function init(){if(initialized)return;const nav=document.querySelector('.beginnerNav');if(!nav)return;initialized=true;ensureNav();ensureHint(nav);bind(nav);installMasterViewGuard();
  const q=new URLSearchParams(location.search),raw=q.get('tab'),area=q.get('area'),section=q.get('section'),sub=q.get('sub');
  /* canonical area/sub가 있으면 legacy tab보다 우선한다. restore sub는 go() 전에 예약해
     subnav 초기화 race에서 기본 첫 탭으로 되돌아가는 것을 막는다. */
  const AREAS=['dashboard','activity','audit','action','advancement','master'];
  if(area&&AREAS.includes(area)){
    if(sub&&area!=='master')window.__HD20_RESTORE_SUB=sub;
    if(area==='dashboard')goDashboard(nav,section||((sub==='map')?'map':''));else if(area==='advancement'&&sub==='map')goDashboard(nav,'map');else go(area,nav,{preserveSub:!!sub&&area!=='master'});
    /* 안전망: 다른 스크립트들이 각자 타이밍에 기본값(요약/종합현황)으로 되돌리는 경합이 있어, 페이지가
       완전히 안정된 뒤(1.6초) URL을 다시 확인해 최종적으로 한 번 더 강제 적용 — 그 사이 값이 바뀌지
       않았다면(사용자가 이미 다른 곳으로 이동한 게 아니라면) 그대로 재적용 */
    setTimeout(()=>{
      const q2=new URLSearchParams(location.search);
      if(q2.get('area')!==area)return; // 이미 사용자가 다른 화면으로 이동함 — 건드리지 않음
      if(area==='dashboard'){
        const cur=document.querySelector('#hd20DashboardSectionTabs button.active')?.dataset.dashboardSection;
        const target=section||((sub==='map')?'map':'summary');if(target!==(cur||'summary'))window.HD20_DASHBOARD_TABS?.apply?.(target);
      }else{
        if(sub&&window.HD20_SUBNAV?.select&&window.HD20_NAV?.active?.()===area&&window.HD20_SUBNAV.state?.().sub!==sub)window.HD20_SUBNAV.select(area,sub);
      }
    },1600);
    return;
  }
  if(['maturitymap','map','maturity'].includes(raw)){goDashboard(nav,'map');return}
  const legacyArea=normalizeDeepLink(raw);
  if(raw&&AREAS.includes(legacyArea)){if(sub&&legacyArea!=='master')window.__HD20_RESTORE_SUB=sub;if(legacyArea==='dashboard')goDashboard(nav,section||'');else go(legacyArea,nav,{preserveSub:!!sub&&legacyArea!=='master'});return}
  go('dashboard',nav)}
window.HD20_NAV={go:key=>{const nav=document.querySelector('.beginnerNav');if(!nav)return;const k=normalizeDeepLink(key);if(['maturitymap','map','maturity'].includes(k)){goDashboard(nav,'map');return}go(k,nav)},active:()=>activeKey,areas:['dashboard','activity','audit','action','advancement','master'],ready:()=>initialized};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else setTimeout(init,0);
})();