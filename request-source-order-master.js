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
#${ID} .soRow{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px;border:1px solid #e5edf2;border-radius:9px;margin-bottom:6px;background:#f8fbfd}
#${ID} .soNumWrap{display:flex;align-items:center;gap:6px;font-size:11.5px;color:#546b7a;font-weight:800;flex:0 0 auto}
#${ID} .soName{flex:1;font-size:13px;color:#17394f;font-weight:800}
#${ID} .soNumInput{width:50px;height:28px;border:1px solid #d7e2e8;border-radius:7px;text-align:center;font-size:13px;color:#17394f}#${ID} 
#${ID} .soSave{margin-top:10px;display:flex;justify-content:flex-end}#${ID} .soSave button{border:0;border-radius:8px;background:#1268a8;color:#fff;padding:9px 14px;font-weight:900;cursor:pointer}`;document.head.appendChild(s)}
function renderList(panel){const n=cur.length;
  panel.querySelector('.soRows').innerHTML=cur.map((t,i)=>`<div class="soRow"><div class="soName">${t}</div><label class="soNumWrap">순서<input type="number" class="soNumInput" data-src="${t}" min="1" max="${n}" step="1" value="${i+1}"></label></div>`).join('');
  panel.querySelectorAll('.soNumInput').forEach(inp=>{
    const apply=()=>{
      const raw=[...panel.querySelectorAll('.soNumInput')].map(x=>({src:x.dataset.src,v:Number(x.value)||0}));
      cur=raw.map((r,i)=>({...r,i})).sort((a,b)=>(a.v-b.v)||(a.i-b.i)).map(r=>r.src);
      renderList(panel)
    };
    inp.onchange=apply;inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();inp.blur()}})
  })}
function ensure(){
  const modal=document.querySelector('#masterModal .modalBox'),tabs=modal?.querySelector('.masterTabs');if(!modal||!tabs)return false;
  let btn=tabs.querySelector('[data-master-tab="sourceOrder"]');
  if(!btn){btn=document.createElement('button');btn.type='button';btn.dataset.masterTab='sourceOrder';btn.textContent='요청출처 순서';tabs.appendChild(btn)}
  let panel=document.getElementById(ID);
  if(!panel){panel=document.createElement('div');panel.id=ID;panel.innerHTML=`<p>5S 개선요청 종합 대시보드의 '요청출처별 등록 및 진행현황' 차트에서 요청출처가 표시되는 순서입니다. 순서 칸에 숫자를 입력하면 그 번호대로 정렬됩니다(같은 번호를 입력하면 기존 순서를 유지).</p><div class="soRows"></div><div class="soSave"><button type="button" data-so-save>순서 저장</button></div>`;tabs.insertAdjacentElement('afterend',panel)}
  function show(name){panel.style.display=name==='sourceOrder'?'block':'none'}
  tabs.addEventListener('click',e=>{const b=e.target.closest('[data-master-tab]');if(!b)return;show(b.dataset.masterTab);if(b.dataset.masterTab==='sourceOrder'){cur=order();renderList(panel)}},true);
  btn.addEventListener('click',()=>{tabs.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===btn));document.getElementById('masterOrderPanel')?.style.setProperty('display','none');document.getElementById('masterTargetPanel')?.style.setProperty('display','none');document.getElementById('hd20OperatingPolicyPanel')?.style.setProperty('display','none');show('sourceOrder')});
  panel.querySelector('[data-so-save]').onclick=()=>{localStorage.setItem(KEY,JSON.stringify(cur));window.dispatchEvent(new CustomEvent('hd20-policy-updated',{detail:{requestSourceOrder:cur}}));alert('요청출처 순서를 저장했습니다.')};
  renderList(panel);return true}
function boot(){css();let n=0;const run=()=>{if(ensure())return;if(++n<40)setTimeout(run,150)};run()}
window.HD20_REQUEST_SOURCE_ORDER={get:order};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
