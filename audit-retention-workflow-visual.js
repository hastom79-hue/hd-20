/* HD-20 유지점검 업무흐름: 개선조치 원천 → 시스템 랜덤 추출 → 유지점검 → 판정/재조치.
 * 표현 전용. 기존 사례·점검 이력·추출 엔진은 수정하지 않음. */
(()=>{'use strict';
const ID='hd20RetentionWorkflowVisual';
function css(){
 if(document.getElementById(ID+'Style'))return;
 const st=document.createElement('style');st.id=ID+'Style';
 st.textContent=`
 #${ID}{padding:18px 20px;margin:12px 0 18px;background:#fff;border:1px solid #dce5ec;border-radius:14px;box-shadow:0 2px 8px #16394a0b;color:#20394b}
 #${ID} .rwTop{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-bottom:16px}
 #${ID} .rwTop strong{font-size:17px;color:#183448}
 #${ID} .rwTop small{color:#63798b;font-size:12px}
 #${ID} .rwSteps{display:grid;grid-template-columns:minmax(0,1fr) 22px minmax(0,1fr) 22px minmax(0,1fr) 22px minmax(0,1fr);gap:9px;align-items:stretch}
 #${ID} .rwStep{border:1px solid #d6e2ea;background:#f6f9fb;border-radius:10px;padding:14px 12px;min-width:0}
 #${ID} .rwStep b{display:block;font-size:14px;line-height:1.5;margin-bottom:6px;color:#203e54}
 #${ID} .rwStep span{display:block;font-size:12px;line-height:1.65;color:#5c7180}
 #${ID} .rwStep.rwSystem{background:#eaf4f6;border-color:#b8d7dc}
 #${ID} .rwStep.rwSystem b{color:#17616a}
 #${ID} .rwArrow{display:flex;align-items:center;justify-content:center;color:#8ba0af;font-size:21px}
 #${ID} .rwOutcomes{display:flex;justify-content:flex-end;gap:12px;margin-top:12px;flex-wrap:wrap}
 #${ID} .rwOutcome{border-radius:7px;background:#edf7f1;border:1px solid #c6e4d2;padding:8px 12px;font-size:12px;color:#245d42}
 #${ID} .rwOutcome.rwFail{background:#fff4f1;border-color:#f0d4ca;color:#944334}
 #${ID} .rwNote{border-top:1px solid #e3ebf0;padding-top:11px;margin-top:14px;color:#5d7383;font-size:12px;line-height:1.65}
 #awAudit[data-subview]:not([data-subview="ongoing"]) #${ID}{display:none!important}
 @media(max-width:900px){#${ID} .rwSteps{grid-template-columns:1fr;gap:7px}#${ID} .rwArrow{transform:rotate(90deg);height:20px}#${ID} .rwOutcomes{justify-content:stretch}#${ID} .rwOutcome{flex:1}}
 `;document.head.appendChild(st);
}
function render(){
 const root=document.getElementById('awAudit');if(!root)return;
 css();let el=document.getElementById(ID);
 if(!el){el=document.createElement('section');el.id=ID;el.setAttribute('aria-label','유지점검 자동 추출 및 조치 흐름');el.innerHTML=`
 <div class="rwTop"><strong>유지점검 운영 흐름</strong><small>별도 유지점검 등록 없이 개선조치 원천 사례를 활용</small></div>
 <div class="rwSteps">
 <div class="rwStep"><b>① 개선조치 등록·완료</b><span>기존 개선조치 사례와 원본 증빙·등록정보 보존</span></div>
 <div class="rwArrow" aria-hidden="true">→</div>
 <div class="rwStep rwSystem"><b>② 시스템 자동 랜덤 추출</b><span>통합기준정보의 점검주기·선정조건에 따라 대상 선정</span></div>
 <div class="rwArrow" aria-hidden="true">→</div>
 <div class="rwStep"><b>③ 유지점검 실시</b><span>추출 사례의 개선상태 유지·재발 여부·현장증빙 확인</span></div>
 <div class="rwArrow" aria-hidden="true">→</div>
 <div class="rwStep"><b>④ 결과 판정·이력관리</b><span>원본 개선조치 ID에 점검결과 연결, 중복 등록 방지</span></div>
 </div>
 <div class="rwOutcomes"><span class="rwOutcome">✓ 적합 → 유지확인 · 이력 보존</span><span class="rwOutcome rwFail">↺ 부적합·재발 → 개선조치 재연계 · 후속점검</span></div>
 <div class="rwNote">유지점검은 독립 Audit이 아닙니다. 기존 개선조치등록 사례가 점검 모수이며, 추출·점검·판정 이력은 원본 사례와 연결합니다. 자동 추출 실행 여부 및 실제 대상 건수는 하단 원천 목록에서 확인합니다.</div>`;
 }
 if(el.parentNode!==root)root.prepend(el);
 else if(root.firstElementChild!==el)root.prepend(el);
 el.hidden=root.dataset.subview!=='ongoing';
}
window.addEventListener('hd20-subtab-changed',e=>{if(e.detail?.area==='audit')render()});
window.addEventListener('hd20-audit-updated',()=>{if(document.getElementById('awAudit')?.dataset.subview==='ongoing')render()});
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',render,{once:true}):render();
window.addEventListener('load',render,{once:true});
})();