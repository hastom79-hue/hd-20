(()=>{'use strict';
const MAP={
 dashboard:[['summary','종합현황'],['analysis','성과·운영분석']],
 activity:[['manage','활동관리'],['analysis','실적분석']],
 advancement:[['judge','후보·판정'],['standard','확정·수평전개']],
 audit:[['audit','Audit 관리'],['retention','유지관리']],
 action:[['manage','개선조치'],['verify','효과·재발관리']]
};
let state={area:'dashboard',sub:'summary'};
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
function ensure(){let bar=$('#hd20Subnav');if(!bar){bar=document.createElement('nav');bar.id='hd20Subnav';bar.className='hd20Subnav';bar.setAttribute('aria-label','세부 업무 메뉴');const anchor=$('.beginnerHint')||$('.beginnerNav');anchor?.insertAdjacentElement('afterend',bar)}return bar}
function render(area){const bar=ensure(),items=MAP[area]||[];state.area=area;if(!items.some(x=>x[0]===state.sub))state.sub=items[0]?.[0]||'';bar.innerHTML=items.map(([k,n])=>`<button type="button" data-sub="${k}" class="${k===state.sub?'on':''}">${n}</button>`).join('');$$('button',bar).forEach(b=>b.onclick=()=>select(area,b.dataset.sub));apply(area,state.sub)}
function show(el,on){if(el)el.classList.toggle('hd20SubHidden',!on)}
function showAll(root,sel='.awCard'){if(root)$$(sel,root).forEach(el=>show(el,true))}
function applyDashboard(sub){const cards=$('.cards'),main=$('.mainGrid'),bottom=$('.bottomGrid'),priority=$('#hd20DashboardPriority'),bridge=$('#hd20OperationalBridge');if(sub==='summary'){show(cards,true);show(main,true);show(priority,true);show(bridge,false);show(bottom,false);if(main){show(main.children?.[0],true);show($('.sideStack',main),true)}}else{show(cards,false);show(main,true);show(priority,true);show(bridge,true);show(bottom,true);if(main){show(main.children?.[0],false);show($('.sideStack',main),true)}}}
function applyActivity(sub){const root=$('#awActivity');if(!root)return;root.dataset.subview=sub;showAll(root);show($('.awFlow',root),true);show($('.awGrid',root),true);const form=$('.awRegisterFormCard',root);if(form)show(form,true)}
function applyAdvancement(sub){const conversion=$('#performanceConversionAnalysis'),work=$('#awWorkplace');document.querySelector('.app')?.classList.add('awFocused');if(conversion){conversion.classList.add('on');show(conversion,true);conversion.classList.toggle('hd20AdvancementStandard',sub==='standard');conversion.dataset.subview=sub}if(work){work.classList.add('on');show(work,true);work.dataset.subview=sub;showAll(work);show($('.awFlow',work),true);show($('.awGrid',work),true)}}
function applyAudit(sub){const root=$('#awAudit');if(!root)return;root.dataset.subview=sub;showAll(root);show($('.awFlow',root),true);show($('.awAuditLane',root),true);const draw=$('.auditDraw',root),batch=$('#hd20AuditBatchExecution',root),closed=$('.auditClosedLoop',root),retention=$('.audit6m',root);if(sub==='audit'){show(draw,true);show(batch,true);show(closed,true);show(retention,false)}else{show(draw,false);show(batch,false);show(closed,true);show(retention,true)}}
function applyAction(sub){const root=$('#awAction');if(!root)return;root.dataset.subview=sub;showAll(root);show($('.awFlow',root),true);show($('.awKpis',root),true);const form=$('.amRegisterFormCard',root);if(form)show(form,true)}
function apply(area,sub){if(area==='dashboard')applyDashboard(sub);else if(area==='activity')applyActivity(sub);else if(area==='advancement')applyAdvancement(sub);else if(area==='audit')applyAudit(sub);else if(area==='action')applyAction(sub);window.dispatchEvent(new CustomEvent('hd20-subtab-changed',{detail:{area,sub}}))}
function select(area,sub){state={area,sub};$$('button',ensure()).forEach(b=>b.classList.toggle('on',b.dataset.sub===sub));apply(area,sub)}
function bindMain(){const nav=$('.beginnerNav');if(!nav)return;nav.addEventListener('click',e=>{const b=e.target.closest('button[data-key]');if(!b)return;setTimeout(()=>{state.sub=(MAP[b.dataset.key]||[])[0]?.[0]||'';render(b.dataset.key)},60)})}
function boot(){ensure();bindMain();setTimeout(()=>render(window.HD20_NAV?.active?.()||'dashboard'),120)}
window.HD20_SUBNAV={render,select,state:()=>({...state}),map:MAP};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();