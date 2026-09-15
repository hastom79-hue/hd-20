(()=>{'use strict';
function dashboardActive(){return window.HD20_NAV?.active?.()==='dashboard'}
function canonicalRefresh(){const api=window.HD20_DASHBOARD_TABS;if(!api)return;const key=api.active?.()||'summary';api.apply?.(key,{scroll:false})}
function sync(){const dashboard=dashboardActive(),sub=document.getElementById('hd20Subnav'),purpose=document.getElementById('hd20PurposePanel'),tabs=document.getElementById('hd20DashboardSectionTabs');if(dashboard){sub?.remove();purpose?.remove();canonicalRefresh()}if(tabs)tabs.hidden=!dashboard}
function css(){if(document.getElementById('hd20DashboardSingleOwnerStyle'))return;const s=document.createElement('style');s.id='hd20DashboardSingleOwnerStyle';s.textContent='#hd20DashboardSectionTabs[hidden]{display:none!important}';document.head.appendChild(s)}
function boot(){css();sync();document.addEventListener('click',e=>{if(e.target.closest?.('.beginnerNav button[data-key]'))setTimeout(sync,80)},true);window.addEventListener('hd20-subtab-changed',()=>setTimeout(sync,0));window.addEventListener('pageshow',()=>setTimeout(sync,0));const mo=new MutationObserver(()=>sync());mo.observe(document.body,{childList:true,subtree:true})}
window.HD20_DASHBOARD_SINGLE_OWNER={sync,canonicalRefresh};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();