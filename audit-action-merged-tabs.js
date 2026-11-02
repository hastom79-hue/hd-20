(()=>{'use strict';
/* One four-tab navigation replaces the duplicated Audit/Theme + Audit steps bars. */
const SECTIONS=[['draw','① Audit 실시'],['ongoing','② 유지점검'],['retention','③ 결과·재조치'],['theme','④ 5S 테마점검']];
const $=(s,r=document)=>r.querySelector(s);
function active(){
 if(new URLSearchParams(location.search).get('sub')==='theme'&&window.HD20_NAV?.active?.()==='audit')return'theme';
 const state=window.HD20_SUBNAV?.state?.();
 return state?.area==='audit'&&SECTIONS.some(x=>x[0]===state.sub)?state.sub:'draw';
}
function change(key){
 if(key==='theme'){window.HD20_NAV?.openAuditSection?.('theme');return}
 if($('#awTheme')?.classList.contains('on')||new URLSearchParams(location.search).get('sub')==='theme'){
   window.HD20_NAV?.openAuditSection?.('audit');
   requestAnimationFrame(()=>window.HD20_SUBNAV?.select?.('audit',key));
 }else window.HD20_SUBNAV?.select?.('audit',key);
 refresh();
}
function ensureStyle(){
 if(document.getElementById('hd20MergedAuditSingleNavStyle'))return;
 const el=document.createElement('style');
 el.id='hd20MergedAuditSingleNavStyle';
 el.textContent=[
  'body:has(.beginnerNav button[data-key="audit"].active) #hd20Subnav{display:none!important}',
  '#awAudit [data-merged-audit-tabs],#awTheme [data-merged-audit-tabs]{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px!important;margin:10px 0 14px!important;padding:8px!important;border:1px solid #d7e3ee;background:#f5f9fc;border-radius:11px}',
  '#awAudit [data-merged-audit-tabs] button,#awTheme [data-merged-audit-tabs] button{min-width:0;min-height:42px;padding:9px 12px;border:1px solid #c8d9e6;border-radius:8px;font-size:13px;font-weight:800;cursor:pointer;background:#fff;color:#244a65;white-space:normal;word-break:keep-all}',
  '#awAudit [data-merged-audit-tabs] button[aria-current="page"],#awTheme [data-merged-audit-tabs] button[aria-current="page"]{background:#176ba8!important;color:#fff!important;border-color:#176ba8!important}',
  '@media(max-width:760px){#awAudit [data-merged-audit-tabs],#awTheme [data-merged-audit-tabs]{grid-template-columns:repeat(2,minmax(0,1fr))}}'
 ].join('\n');
 document.head.appendChild(el);
}
function install(){
 ensureStyle();
 for(const id of ['awAudit','awTheme']){
  const host=document.getElementById(id);if(!host)continue;
  let bar=$('[data-merged-audit-tabs]',host);
  if(!bar){bar=document.createElement('nav');bar.dataset.mergedAuditTabs='';bar.setAttribute('aria-label','5S 점검관리 하위 메뉴');host.insertBefore(bar,host.firstChild)}
  const existing=[...bar.querySelectorAll('button[data-merged-sub]')].map(b=>b.dataset.mergedSub);
  if(existing.join('|')!==SECTIONS.map(x=>x[0]).join('|')){
   bar.replaceChildren();
   for(const [key,label] of SECTIONS){
    const btn=document.createElement('button');
    btn.type='button';btn.dataset.mergedSub=key;
    btn.dataset.mergedSection=key==='theme'?'theme':'audit';
    btn.textContent=label;
    btn.addEventListener('click',()=>change(key));
    bar.appendChild(btn);
   }
  }
  const selected=active();
  bar.querySelectorAll('button[data-merged-sub]').forEach(btn=>btn.setAttribute('aria-current',btn.dataset.mergedSub===selected?'page':'false'));
 }
}
let queued=false;
function refresh(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;install()})}
window.addEventListener('hd20-audit-merged-section',refresh);
window.addEventListener('hd20-subtab-changed',e=>{if(e.detail?.area==='audit')refresh()});
window.addEventListener('hd20-nav-area-changed',e=>{if(e.detail?.area==='audit')refresh()});
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',refresh,{once:true}):refresh();
})();