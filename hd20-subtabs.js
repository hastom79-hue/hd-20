(()=>{'use strict';
const MAP={
 dashboard:[['summary','종합현황'],['trend','성과추이'],['health','운영건전성']],
 activity:[['status','활동현황'],['register','활동등록'],['analysis','팀·월별 분석']],
 advancement:[['candidate','후보 발굴'],['judge','공식 판정'],['confirmed','확정 작업장'],['standard','수평전개']],
 audit:[['target','Audit 대상'],['execute','Audit 실행'],['retention','6개월 유지관리']],
 action:[['target','조치대상'],['execute','개선조치'],['verify','효과검증'],['recurrence','재발관리']]
};
let state={area:'dashboard',sub:'summary'};
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
function ensure(){let bar=$('#hd20Subnav');if(!bar){bar=document.createElement('nav');bar.id='hd20Subnav';bar.className='hd20Subnav';bar.setAttribute('aria-label','세부 업무 메뉴');const anchor=$('.beginnerHint')||$('.beginnerNav');anchor?.insertAdjacentElement('afterend',bar)}return bar}
function render(area){const bar=ensure(),items=MAP[area]||[];state.area=area;if(!items.some(x=>x[0]===state.sub))state.sub=items[0]?.[0]||'';bar.innerHTML=items.map(([k,n])=>`<button type="button" data-sub="${k}" class="${k===state.sub?'on':''}">${n}</button>`).join('');$$('button',bar).forEach(b=>b.onclick=()=>select(area,b.dataset.sub));apply(area,state.sub)}
function show(el,on){if(!el)return;el.classList.toggle('hd20SubHidden',!on)}
function applyDashboard(sub){const cards=$('.cards'),main=$('.mainGrid'),bottom=$('.bottomGrid'),priority=$('#hd20DashboardPriority'),bridge=$('#hd20OperationalBridge');show(cards,sub==='summary');show(main,sub==='summary'||sub==='health');show(priority,sub==='summary'||sub==='health');show(bridge,sub==='health');show(bottom,sub==='trend');if(main){const side=$('.sideStack',main),hero=main.children?.[0];show(hero,sub==='summary');show(side,sub==='health')}}
function applyActivity(sub){const root=$('#awActivity');if(!root)return;const flow=$('.awFlow',root),grid=$('.awGrid',root),cards=$$('.awCard',root);show(flow,sub==='status');show(grid,true);if(cards.length){show(cards[0],sub==='register');show(cards[1],sub==='status'||sub==='analysis')}root.dataset.subview=sub}
function applyAdvancement(sub){const conversion=$('#performanceConversionAnalysis'),work=$('#awWorkplace');show(conversion,sub==='candidate'||sub==='judge');show(work,sub==='candidate'||sub==='confirmed'||sub==='standard');if(work)work.dataset.subview=sub;if(conversion)conversion.dataset.subview=sub}
function applyAudit(sub){const root=$('#awAudit');if(!root)return;root.dataset.subview=sub;const cards=$$('.awCard',root);cards.forEach((c,i)=>show(c,sub==='target'?i===0:sub==='execute'?i<=1:i>=1));show($('.awFlow',root),sub==='target'||sub==='execute');show($('.awAuditLane',root),sub==='retention'||sub==='target')}
function applyAction(sub){const root=$('#awAction');if(!root)return;root.dataset.subview=sub;const cards=$$('.awCard',root);cards.forEach((c,i)=>show(c,sub==='target'?i===0:sub==='execute'?i<=1:sub==='verify'?i>=1:i>=1));show($('.awFlow',root),sub==='execute'||sub==='verify');show($('.awKpis',root),sub==='target'||sub==='recurrence')}
function apply(area,sub){if(area==='dashboard')applyDashboard(sub);else if(area==='activity')applyActivity(sub);else if(area==='advancement')applyAdvancement(sub);else if(area==='audit')applyAudit(sub);else if(area==='action')applyAction(sub);window.dispatchEvent(new CustomEvent('hd20-subtab-changed',{detail:{area,sub}}))}
function select(area,sub){state={area,sub};const bar=ensure();$$('button',bar).forEach(b=>b.classList.toggle('on',b.dataset.sub===sub));apply(area,sub)}
function bindMain(){const nav=$('.beginnerNav');if(!nav)return;nav.addEventListener('click',e=>{const b=e.target.closest('button[data-key]');if(!b)return;setTimeout(()=>{state.sub=(MAP[b.dataset.key]||[])[0]?.[0]||'';render(b.dataset.key)},60)})}
function boot(){ensure();bindMain();setTimeout(()=>render(window.HD20_NAV?.active?.()||'dashboard'),120)}
window.HD20_SUBNAV={render,select,state:()=>({...state}),map:MAP};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();