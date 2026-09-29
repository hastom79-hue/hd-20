/* 통합기준정보에 '요청출처 순서' 탭 추가: 5S 개선요청 종합 대시보드 ①번 차트의 가로축(요청출처) 표시 순서를
   관리자가 직접 정할 수 있게 함. 기본값은 리더십 > 5S모듈 > 생산혁신팀 HDPS파트. operating-policy-master.js와
   같은 방식(기존 masterModal에 탭·패널을 동적으로 덧붙임)으로 구현. */
(()=>{'use strict';
const ID='hd20SourceOrderPanel',STYLE='hd20SourceOrderStyle',KEY='gmes5s_request_source_order';
const DEFAULT=['리더십','5S모듈','생산혁신팀 HDPS파트'];
function order(){try{const v=JSON.parse(localStorage.getItem(KEY)||'null');return Array.isArray(v)&&v.length===DEFAULT.length&&DEFAULT.every(s=>v.includes(s))?v:[...DEFAULT]}catch{return[...DEFAULT]}}
let cur=order();
function css(){if(document.getElementById(STYLE))return;const s=document.createElement('style');s.id=STYLE;s.textContent=`#${ID}{display:none;padding:4px 0 8px}
#${ID} p{margin:0 0 10px;color:#6a8192;font-size:13px}
#${ID} .soRow{display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid #e5edf2;border-radius:9px;margin-bottom:6px;background:#f8fbfd}
#${ID} .soNo{width:22px;height:22px;flex:0 0 auto;display:grid;place-items:center;background:#eef4f7;border-radius:6px;font-size:11px;color:#546b7a}
#${ID} .soName{flex:1;font-size:13px;color:#17394f;font-weight:800}
#${ID} .soBtns{display:flex;gap:4px}#${ID} .soBtns button{width:26px;height:26px;border:1px solid #d7e2e8;border-radius:7px;background:#fff;cursor:pointer}
#${ID} .soSave{margin-top:10px;display:flex;justify-content:flex-end}#${ID} .soSave button{border:0;border-radius:8px;background:#1268a8;color:#fff;padding:9px 14px;font-weight:900;cursor:pointer}`;document.head.appendChild(s)}
function renderList(panel){panel.querySelector('.soRows').innerHTML=cur.map((t,i)=>`<div class="soRow"><div class="soNo">${i+1}</div><div class="soName">${t}</div><div class="soBtns"><button type="button" data-act="up" data-i="${i}">▲</button><button type="button" data-act="down" data-i="${i}">▼</button></div></div>`).join('');
  panel.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;if(b.dataset.act==='up'&&i>0)[cur[i-1],cur[i]]=[cur[i],cur[i-1]];if(b.dataset.act==='down'&&i<cur.length-1)[cur[i+1],cur[i]]=[cur[i],cur[i+1]];renderList(panel)})}
function ensure(){
  const modal=document.querySelector('#masterModal .modalBox'),tabs=modal?.querySelector('.masterTabs');if(!modal||!tabs)return false;
  let btn=tabs.querySelector('[data-master-tab="sourceOrder"]');
  if(!btn){btn=document.createElement('button');btn.type='button';btn.dataset.masterTab='sourceOrder';btn.textContent='요청출처 순서';tabs.appendChild(btn)}
  let panel=document.getElementById(ID);
  if(!panel){panel=document.createElement('div');panel.id=ID;panel.innerHTML=`<p>5S 개선요청 종합 대시보드의 '요청출처별 등록 및 진행현황' 차트에서 요청출처가 표시되는 순서입니다. ▲▼로 순서를 바꾸세요.</p><div class="soRows"></div><div class="soSave"><button type="button" data-so-save>순서 저장</button></div>`;tabs.insertAdjacentElement('afterend',panel)}
  function show(name){panel.style.display=name==='sourceOrder'?'block':'none'}
  tabs.addEventListener('click',e=>{const b=e.target.closest('[data-master-tab]');if(!b)return;show(b.dataset.masterTab);if(b.dataset.masterTab==='sourceOrder'){cur=order();renderList(panel)}},true);
  btn.addEventListener('click',()=>{tabs.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===btn));document.getElementById('masterOrderPanel')?.style.setProperty('display','none');document.getElementById('masterTargetPanel')?.style.setProperty('display','none');document.getElementById('hd20OperatingPolicyPanel')?.style.setProperty('display','none');show('sourceOrder')});
  panel.querySelector('[data-so-save]').onclick=()=>{localStorage.setItem(KEY,JSON.stringify(cur));window.dispatchEvent(new CustomEvent('hd20-policy-updated',{detail:{requestSourceOrder:cur}}));alert('요청출처 순서를 저장했습니다.')};
  renderList(panel);return true}
function boot(){css();let n=0;const run=()=>{if(ensure())return;if(++n<40)setTimeout(run,150)};run()}
window.HD20_REQUEST_SOURCE_ORDER={get:order};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
