(()=>{'use strict';
const items=[
{title:'시각화를 통한 찾는 낭비의 삭제(형적관리 등)',definition:'물품·공구·자재의 위치와 수량 및 정상·이상 상태를 한눈에 파악하도록 시각화·형적관리를 적용하여 찾는 시간과 탐색 동작을 제거한 개선사례.',checks:['누구나 필요한 물품의 위치를 즉시 식별할 수 있는가','형적·표시·정위치·정량 정보가 실제 현물과 일치하는가','찾는 시간 또는 탐색 동작이 실제로 줄어들었는가'],before:'찾아야 하는 물품·공구, 위치가 불명확한 배치, 탐색 동작이나 소요시간이 드러나는 전체 사진',after:'형적표시·정위치·정량표시와 실제 현물을 함께 촬영. 개선 전후 탐색시간 비교자료가 있으면 함께 제시',fail:'표시만 추가하고 실제 찾는 낭비가 개선되지 않았거나 표시와 현물이 불일치하는 사례'},
{title:'인간공학적 그린존 적용을 통한 안전 및 동선의 최소화',definition:'작업자가 자주 사용하는 공구·부품·자재를 인체에 부담이 적고 접근하기 쉬운 Green Zone에 배치하여 불필요한 동작·이동을 최소화하고 안전성과 작업 편의성을 높인 개선사례.',checks:['개선 전 과도한 굽힘·뻗기·회전·이동 문제가 확인되는가','사용 빈도와 작업 자세를 고려하여 Green Zone 내 배치했는가','동선·작업부담 또는 안전 위험이 실질적으로 감소했는가'],before:'작업자 자세, 불편한 작업 높이·거리, 반복 이동경로가 보이도록 촬영',after:'개선된 배치 높이·거리, Green Zone 범위, 작업자 자세 및 단축된 동선을 같은 관점에서 촬영',fail:'Green Zone이라는 명칭만 부여하고 인체공학적 배치나 동선 개선 효과가 없는 사례'},
{title:'정량축소/정위치 변경을 통한 공간 활용 확장',definition:'불필요한 보유량을 정량 축소하거나 보관·적치 정위치를 변경하여 점유공간을 줄이고 확보한 공간을 통로·작업·보관 등 필요한 용도로 실질적으로 활용한 개선사례.',checks:['정량 축소 또는 정위치 변경 전후 차이가 명확한가','점유면적·통로·작업공간의 실제 개선이 확인되는가','확보한 공간의 활용과 유지상태를 확인할 수 있는가'],before:'적치량·보관 위치·점유면적·통로 폭이 드러나는 전체 사진. 가능하면 수량·면적을 표기',after:'동일 위치·각도에서 축소된 적치량과 변경된 정위치, 확보 공간의 실제 활용 모습을 촬영',fail:'물품만 임시 이동하거나 정량을 줄이지 않고 공간 확보·활용 효과가 확인되지 않는 사례'}
];
/* 사용자 지적(1차): "고도화 요건 b,c 판정가이드 팝업사진 부적절" — 요건2·3(및 요건1)의 참고사진이
   전부 울산캠퍼스 5S 활동과 무관한 외부 사이트에서 무단으로 가져온 깨진 이미지였음. 외부 이미지
   참조를 제거하고 텍스트 가이드만으로 구성(이전 커밋에서 완료).

   사용자 지적(2차): "평가자료 · 사진 가이드 상세 보기 팝업창이 생성되지 않음" — 원인은 네이티브
   <dialog> + showModal()에 의존하던 구조였기 때문. showModal()이 실패하는 조건(중첩된 모달 환경
   에서의 포커스 트랩 충돌 등)에서는 ::backdrop이 생성되지 않고 open 속성만 붙어 화면에 사실상
   보이지 않는 상태가 될 수 있었음. 이 코드베이스의 다른 모든 모달(awRegisterModal 등)이 쓰는 것과
   동일한, 더 안정적인 패턴(일반 div + 수동 backdrop + 매우 높은 z-index)으로 전면 교체해 실패
   가능성 자체를 제거. */
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function close(){const overlay=document.getElementById('hd20AdvPhotoGuidePopup');if(overlay)overlay.remove()}
function open(index=0){
 const n=Math.max(0,Math.min(2,Number(index)||0));
 let overlay=document.getElementById('hd20AdvPhotoGuidePopup');
 if(!overlay){
  overlay=document.createElement('div');
  overlay.id='hd20AdvPhotoGuidePopup';
  overlay.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(12,27,42,.68);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  document.body.appendChild(overlay);
  overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
  document.addEventListener('keydown',function escHandler(e){if(e.key==='Escape'){close();document.removeEventListener('keydown',escHandler)}});
 }
 const d=items[n];
 overlay.innerHTML='<section role="dialog" aria-modal="true" aria-label="5S 고도화 3대 요건 평가자료·사진 가이드" style="background:#fff;border-radius:12px;max-width:920px;width:100%;max-height:92vh;overflow:auto;padding:22px;box-shadow:0 12px 40px #0004;color:#263e51;box-sizing:border-box"><header style="display:flex;justify-content:space-between;gap:12px;align-items:center"><div><b style="font-size:18px">5S 고도화 3대 요건 · 평가자료 및 사진 가이드</b><p style="font-size:12px;color:#667b8b;margin:6px 0">개별 개선사례 기준 · 3대 요건 중 1개 이상 충족 시 요건 충족 · 최종 채택은 마스터관리자</p></div><button type="button" data-guide-close style="padding:8px 13px;border:1px solid #cddae4;border-radius:8px;background:#fff;cursor:pointer">닫기 ×</button></header><nav style="display:flex;gap:7px;flex-wrap:wrap;margin:16px 0">'+items.map((x,i)=>'<button type="button" data-guide-tab="'+i+'" style="padding:9px 12px;border:1px solid #a6bfd1;border-radius:8px;cursor:pointer;background:'+(i===n?'#1b5d92':'#fff')+';color:'+(i===n?'#fff':'#24455f')+'">요건 '+(i+1)+'</button>').join('')+'</nav><h3 style="font-size:17px;margin:12px 0">'+(n+1)+'. '+esc(d.title)+'</h3><p style="line-height:1.8;background:#f3f8fc;padding:12px;border-radius:8px">'+esc(d.definition)+'</p><h4>현장 평가 체크포인트</h4><ul style="line-height:1.9">'+d.checks.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px"><div style="border:1px solid #d8e3eb;border-radius:9px;padding:13px"><b>BEFORE 사진 가이드</b><p style="line-height:1.8;font-size:13px">'+esc(d.before)+'</p></div><div style="border:1px solid #d8e3eb;border-radius:9px;padding:13px"><b>AFTER 사진 가이드</b><p style="line-height:1.8;font-size:13px">'+esc(d.after)+'</p></div></div><h4>인정 곤란 사례</h4><p style="line-height:1.8">'+esc(d.fail)+'</p><p style="font-size:12px;color:#687e8e">※ 실제 현장 참고사진은 등록된 BEFORE·AFTER 원본을 사용합니다. 임의 생성 사진을 평가 근거로 사용하지 않습니다.</p></section>';

// Render actual registered BEFORE/AFTER evidence when supplied by the registration form.
// Never replace missing evidence with fabricated photographs.
const evidenceRoot=overlay.querySelector('section');
const evidence=document.createElement('div');
evidence.id='hd20AdvGuideEvidence';
evidence.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin:16px 0';
/* 사용자 지적: "사진은 어디에도 반영되어 있지 않다" — 원인은 이 함수가 찾던 속성명(beforeImage,
   afterPhoto 등)이 실제 등록 폼과 전혀 달랐기 때문. 실제 구조를 확인한 결과: 자율개선 등록 폼은
   #awBefore/#awAfter, 개선요청 등록 폼은 #amBefore/#amEvidence라는 ID를 가진 요소의
   dataset.data(Base64 또는 URL 문자열)에 사진이 저장됨(activity-workflow.js·action-mail-workflow.js
   의 register() 함수가 바로 이 속성을 읽어 레코드에 저장하는 것과 동일한 경로). */
const findPhoto=(kind)=>{
 /* 가시성 체크를 getClientRects/display 기반에서 ".on" 클래스 기반으로 교체 — 두 등록 모달
    (activity-register-modal.js·action-register-modal.js) 모두 open()/hide()에서 overlay 자체가
    아니라 overlay.classList의 "on" 토글로 열림·닫힘을 표시하는데, 바깥 wrapper의 display 계산값이
    항상 'none'이 아니어서(내부 레이아웃 방식) 이전 체크가 "열려 있어도 안 보인다"고 오판했음. */
 const active=[...document.querySelectorAll('#awRegisterModal.on,#hd20ActionRegisterModal.on')][0];
 if(!active)return '';
 const ids=kind==='before'?['awBefore','amBefore']:['awAfter','amEvidence'];
 for(const id of ids){
   const el=active.querySelector('#'+id);
   const value=el?.dataset?.data;
   if(typeof value==='string'&&value)return value;
 }
 return '';
};
['before','after'].forEach(kind=>{
 const cell=document.createElement('div');cell.style.cssText='border:1px solid #d8e3eb;border-radius:9px;padding:12px;min-height:175px';
 const label=document.createElement('b');label.textContent=kind.toUpperCase()+' 실제 등록 사진';cell.appendChild(label);
 const src=findPhoto(kind);
 if(src){
  const img=document.createElement('img');img.src=src;img.alt=kind.toUpperCase()+' 원본 사진';img.style.cssText='display:block;max-width:100%;max-height:300px;object-fit:contain;margin:12px auto;cursor:zoom-in';
  img.onclick=()=>window.open(img.src,'_blank','noopener,noreferrer');cell.appendChild(img);
 }else{
  const missing=document.createElement('p');missing.textContent='등록된 원본 사진 없음 · 해당 사례의 사진 첨부 후 확인';missing.style.cssText='color:#758595;padding:30px 5px;text-align:center;font-size:13px';cell.appendChild(missing);
 }
 evidence.appendChild(cell);
});
evidenceRoot.appendChild(evidence);
overlay.querySelector('[data-guide-close]').onclick=close;
overlay.querySelectorAll('[data-guide-tab]').forEach(b=>b.onclick=()=>open(Number(b.dataset.guideTab)));
overlay.querySelector('[data-guide-close]')?.focus();
}
window.HD20AdvPhotoGuide={open,close,items};
function guideClick(e){
 const btn=e.target?.closest?.('[data-hd20-photo-guide]');
 if(!btn)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.();
 open(Number(btn.getAttribute('data-hd20-photo-guide')));
}
window.addEventListener('click',guideClick,true);
})();
