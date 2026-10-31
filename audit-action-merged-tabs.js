(()=>{'use strict';
const ID='hd20MergedAuditTabs',SECTIONS=[['audit','Audit 실시·유지점검'],['action','개선조치·완료관리']];
function active(){return new URLSearchParams(location.search).get('sub')==='action'?'action':'audit'}
function install(){for(const [section,hostId] of [['audit','awAudit'],['action','awAction']]){const host=document.getElementById(hostId);if(!host)continue;let bar=host.querySelector('[data-merged-audit-tabs]');if(!bar){bar=document.createElement('nav');bar.dataset.mergedAuditTabs='';bar.setAttribute('aria-label','Audit·개선조치 통합 메뉴');bar.style.cssText='display:flex;gap:8px;flex-wrap:wrap;margin:12px 0 18px;padding:8px;border:1px solid #d7e3ee;background:#f5f9fc;border-radius:12px';for(const [key,label] of SECTIONS){const btn=document.createElement('button');btn.type='button';btn.dataset.mergedSection=key;btn.textContent=label;btn.style.cssText='padding:10px 16px;border:1px solid #c8d9e6;border-radius:9px;font-weight:800;cursor:pointer;background:white;color:#244a65';btn.addEventListener('click',()=>window.HD20_NAV?.openAuditSection?.(key));bar.appendChild(btn)}host.insertBefore(bar,host.firstChild)}for(const btn of bar.querySelectorAll('button')){const selected=btn.dataset.mergedSection===active();btn.style.background=selected?'#176ba8':'white';btn.style.color=selected?'white':'#244a65';btn.setAttribute('aria-current',selected?'page':'false')}}}
function refresh(){install()}
window.addEventListener('hd20-audit-merged-section',refresh);
window.addEventListener('hd20-nav-area-changed',e=>{if(e.detail?.area==='audit')refresh()});
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',refresh,{once:true}):refresh();
})();
