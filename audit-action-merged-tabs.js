(()=>{'use strict';
/* 2026-11-02: Audit and Theme inspection have separate canonical top-level tabs.
   Remove only the obsolete merged subnav; never touch source data or work history. */
function unmerge(){
 document.querySelectorAll('#awAudit [data-merged-audit-tabs],#awTheme [data-merged-audit-tabs]').forEach(el=>el.remove());
 const old=document.getElementById('hd20MergedAuditSingleNavStyle');if(old)old.remove();
 const nav=document.getElementById('hd20Subnav');
 if(nav){nav.removeAttribute('aria-hidden');if(window.HD20_NAV?.active?.()==='audit')nav.style.setProperty('display','flex','important');else nav.style.removeProperty('display')}
}
window.addEventListener('hd20-nav-area-changed',unmerge);
window.addEventListener('hd20-subtab-changed',unmerge);
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',unmerge,{once:true}):unmerge();
})();
