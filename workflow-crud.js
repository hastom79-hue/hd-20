(()=>{'use strict';
const STYLE='workflowCrudStyle';
const CANONICAL=new Set(['awActivity','awWorkplace','awAudit','awAction','awRegister','performanceConversionAnalysis']);
function css(){if(document.getElementById(STYLE))return;const s=document.createElement('style');s.id=STYLE;s.textContent=`.wfToolbar{display:flex;gap:7px;flex-wrap:wrap;align-items:center}.wfToolbar button{border:1px solid #cbdbe6;border-radius:8px;background:#fff;padding:8px 11px;font-size:14.5px;font-weight:900;color:#234c69;cursor:pointer}.wfToolbar button:hover{background:#eef6fb}.wfCanonicalNote{padding:5px 8px;border-radius:10px;background:#edf4f8;color:#48657a;font-size:13.5px;font-weight:900}`;document.head.appendChild(s)}
function csv(screen){const out=[];screen.querySelectorAll('.awTable,table').forEach((table,i)=>{const heads=[...table.querySelectorAll('thead th')].map(x=>x.textContent.trim());out.push(['TABLE '+(i+1)]);out.push(heads);table.querySelectorAll('tbody tr').forEach(tr=>out.push([...tr.children].map(td=>td.innerText.trim())));out.push([])});if(!out.length){alert('추출 가능한 표 형식 데이터가 없습니다. 인쇄(⎙) 기능을 이용해 주세요.');return}const text='\ufeff'+out.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n'),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'}));a.download=((screen.querySelector('.awHero h2,.pcHeader h2')?.textContent||screen.id)+'_RawData').replace(/\s+/g,'_')+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
function toolbar(screen){if(!screen||screen.querySelector('.wfToolbar'))return;const hero=screen.querySelector('.awHero')||screen.querySelector('.pcHeader');if(!hero)return;let actions=hero.querySelector('.awActions');if(!actions){actions=document.createElement('div');actions.className='awActions';actions.style.cssText='margin-top:8px';hero.appendChild(actions)}const bar=document.createElement('div');bar.className='wfToolbar';bar.innerHTML='<button data-wf="export">⇩ 현재 Grid 추출</button><button data-wf="print">⎙ 출력</button><span class="wfCanonicalNote">Canonical Source</span>';actions.appendChild(bar);bar.querySelector('[data-wf=export]').onclick=()=>csv(screen);bar.querySelector('[data-wf=print]').onclick=()=>window.print()}
function enhance(){const screens=[...document.querySelectorAll('.awScreen')];if(!screens.length)return false;screens.filter(s=>CANONICAL.has(s.id)).forEach(toolbar);window.HD20_WORKFLOW_CRUD={splitStoreDisabled:true,canonicalScreens:[...CANONICAL]};return true}
function boot(){css();let n=0;const run=()=>{if(enhance())return;if(++n<40)setTimeout(run,100)};run();document.addEventListener('click',e=>{if(e.target.closest('.beginnerNav'))setTimeout(enhance,20)},true);
  /* 일부 탭(예: ⑥ 문제점·개선조치)은 다른 스크립트가 먼저 placeholder
   * 섹션을 만든 뒤, 자기 스크립트가 나중에 innerHTML을 통째로 다시 써서
   * 완성하는 2단계 구조를 쓴다. 이 경우 여기서 이미 붙여둔 .wfToolbar가
   * 그 통째 교체 때 같이 사라질 수 있다. 딥링크(?tab=)로 곧장 진입하면
   * beginnerNav 클릭이 한 번도 없어 위 클릭 리스너가 구제해주지 못하므로,
   * DOM 변화를 직접 감시해 놓치는 경우가 없도록 한다. */
  let mo;const scheduleRescan=(()=>{let t=null;return()=>{clearTimeout(t);t=setTimeout(enhance,150)}})();
  mo=new MutationObserver(muts=>{if(muts.some(m=>m.type==='childList'&&(m.addedNodes.length||m.removedNodes.length)))scheduleRescan()});
  mo.observe(document.body,{childList:true,subtree:true});
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();