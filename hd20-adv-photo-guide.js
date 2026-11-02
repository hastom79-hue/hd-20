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

// Approved examples are editorial references, never editable case evidence.
// Show only the exact sources approved by the reviewer. The composite for item 3
// is the SAME photo supplied in chat, independently matched to its publisher URL.
// Do not imply that external photos are first-party inspection records.
const evidenceRoot=overlay.querySelector('section');
const sourceCases=[
 {name:'승인 대안 · 제조현장 공구·자재 정위치 및 형적관리 개선',url:'https://www.lagerundwerkstatt.de/',detail:'승인된 BEFORE·AFTER 한 장 원본. BEFORE: 공구·케이블·부품이 혼재된 작업대. AFTER: 형적관리형 공구 정위치와 정돈된 작업대로 전환. 개선시간·정량효과는 사진만으로 확정하지 않습니다.',image:'https://www.lagerundwerkstatt.de/galerie/blog/die-5s-methode-ordnung-in-der-werkstatt-als-voraussetzun_305.webp'},
 {name:'승인 원본 · 작업높이 개선을 통한 인간공학적 자세 개선',url:'https://kyodonewsprwire.jp/prwfile/release/M101579/201902012813/_prw_PI1lg_0ovR24Er.jpg',detail:'사용자가 재확인한 실제 승인 이미지. BEFORE: 허리를 굽힌 작업 자세 / AFTER: 작업높이 조정으로 정상 작업 자세 확보. 동선 감소 정량 효과는 확인되지 않았습니다.',image:'https://kyodonewsprwire.jp/prwfile/release/M101579/201902012813/_prw_PI1lg_0ovR24Er.jpg'},
 {name:'동성 농기계 제조공장 · 승인된 컬러 BEFORE / AFTER',url:'https://bizn.donga.com/3/all/20170724/85506925/2',detail:'승인한 원본 한 장의 상단은 BEFORE, 하단은 AFTER입니다. 출처: 동아일보 비즈N(2017.07.24). 사진만으로 정량축소의 절대 수치가 입증되지는 않습니다.',image:'https://dimg.donga.com/wps/ECONOMY/IMAGE/2017/07/24/85506918.2.jpg'}
];
const approved=sourceCases[n];
const guideUploader=document.createElement('section');
guideUploader.id='hd20AdvGuidePhotoReference';
guideUploader.style.cssText='margin:15px 0;padding:14px;background:#f4f8fc;border:1px solid #d0dfeb;border-radius:10px';
const hd=document.createElement('h4');hd.textContent='승인된 BEFORE · AFTER 사진 가이드';
hd.style.cssText='margin:0 0 8px;color:#154869';guideUploader.appendChild(hd);
const desc=document.createElement('p');desc.textContent=approved.name+' · '+approved.detail;
desc.style.cssText='font-size:12px;color:#425e72;line-height:1.7;margin:0 0 10px';
guideUploader.appendChild(desc);
if(approved.image||approved.beforeImage){
 const images=n===2
  ?[{src:approved.image,alt:'BEFORE · 승인된 원본 상단',half:'top'},{src:approved.image,alt:'AFTER · 승인된 원본 하단',half:'bottom'}]
  :n===1?[{src:approved.image,alt:'BEFORE · 허리를 굽힌 작업 자세',half:'left'},{src:approved.image,alt:'AFTER · 높이 조정 후 정상 자세',half:'right'}]
  :approved.image?[{src:approved.image,alt:'BEFORE · 공구 및 자재 혼재',half:'left'},{src:approved.image,alt:'AFTER · 공구 정위치 및 형적관리',half:'right'}]
  :[{src:approved.beforeImage,alt:'EPA Figure 7 BEFORE 원본'},{src:approved.afterImage,alt:'EPA Figure 8 AFTER 원본'}];
 const imageGrid=document.createElement('div');
 imageGrid.style.cssText='display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;align-items:stretch';
 images.forEach(item=>{
  const figure=document.createElement('figure');
  figure.style.cssText='margin:0;background:#fff;border:1px solid #d3e0e9;border-radius:8px;overflow:hidden';
  const img=document.createElement('img');img.src=item.src;img.alt=item.alt;img.loading='eager';
  img.style.cssText='display:block;width:100%;height:auto;'+(n===0?'max-height:650px':'max-height:530px')+';object-fit:contain;margin:auto';
  img.onerror=()=>{img.remove();const msg=document.createElement('p');msg.textContent='원본 이미지가 열리지 않습니다. 아래 원문에서 사진을 확인해 주세요.';msg.style.cssText='padding:14px;font-size:12px;color:#6a788a';figure.appendChild(msg)};
  const caption=document.createElement('figcaption');caption.textContent=(item.half==='top'||item.half==='left'||item.alt.startsWith('BEFORE'))?'BEFORE':'AFTER';caption.style.cssText='padding:11px 8px;font-size:15px;font-weight:900;letter-spacing:1px;text-align:center;color:'+(caption.textContent==='BEFORE'?'#a44923':'#08754d')+';background:#f8fbfd;border-top:1px solid #dce7ee';
  if(item.half){
   // Present the exact same approved composite source in paired views, without changing the source.
   // Clip halves visually without replacing, resampling or modifying source pixels.
   const crop=document.createElement('div');
   crop.style.cssText='position:relative;width:100%;'+((item.half==='left'||item.half==='right')?(n===0?'aspect-ratio:1/1.1':'max-width:270px;margin:auto;aspect-ratio:1/2'):'aspect-ratio:440/330')+';overflow:hidden;background:#f3f6f8';
   img.style.cssText=(item.half==='left'||item.half==='right')?'position:absolute;top:0;height:auto;max-height:none;width:200%;max-width:none;'+(item.half==='right'?'right:0':'left:0'):'position:absolute;'+(item.half==='bottom'?'bottom:0;':'top:0;')+'left:-22.5%;width:145%;height:auto;max-height:none;max-width:none;object-fit:initial;';
   crop.appendChild(img);
   figure.appendChild(crop);
  }else figure.appendChild(img);
  figure.appendChild(caption);imageGrid.appendChild(figure);
 });
 guideUploader.appendChild(imageGrid);
}else{
 const label=document.createElement('p');
 label.textContent='승인 원본 사진을 불러올 수 없습니다. 아래 출처 링크에서 확인해 주세요.';
 label.style.cssText='padding:12px;background:#fff;border:1px solid #d3e1eb;border-radius:8px;font-size:12px;line-height:1.65;color:#536a7e';
 guideUploader.appendChild(label);
}
const sourceLink=document.createElement('a');sourceLink.href=approved.url;sourceLink.target='_blank';sourceLink.rel='noopener noreferrer';
sourceLink.textContent='사례 원문 및 사진 확인 ↗';
sourceLink.style.cssText='display:inline-block;color:#11629e;font-size:13px;font-weight:700;text-decoration:underline;margin:4px 0';
guideUploader.appendChild(sourceLink);
const negativeExamples=[
 ['공구함의 위치 표시만 추가했지만 공구가 여전히 뒤섞여 있으며 실제 탐색시간·탐색동작이 줄지 않은 경우','사진촬영 직전에만 형적판에 공구를 맞춰놓고 평상시 사용·반납 기준이 지켜지지 않는 경우','정위치 표시와 현물의 규격·수량이 서로 달라 신규 작업자가 공구를 다시 찾아야 하는 경우'],
 ['작업대에 Green Zone 선만 그려놓고 고빈도 부품이 여전히 팔을 과도하게 뻗어야 닿는 곳에 있는 경우','한 작업자에게만 맞춘 배치로 다른 작업자가 반복 굽힘·비틀기 동작을 계속 수행하는 경우','공구 위치만 이동했을 뿐 동작·동선·위험도 개선 전후 근거가 없거나 안전 위험이 증가한 경우'],
 ['보관랙의 외관만 정돈했을 뿐 정량기준·보유수량·점유면적에 실질적인 변화가 없는 경우','사진 촬영을 위해 다른 구역에 자재를 잠시 이동하여 빈 공간을 만들었으나 작업 후 원상복귀되는 경우','정위치만 바꿔 다른 통로를 점유하거나 확보한 공간의 실제 활용·유지 상태를 확인할 수 없는 경우']
];
const rejectBox=document.createElement('section');rejectBox.id='hd20AdvGuideRejectedSamples';
rejectBox.style.cssText='margin:16px 0;padding:13px;border:1px solid #efc7c7;background:#fffafa;border-radius:9px';
const rejectTitle=document.createElement('b');rejectTitle.textContent='인정 곤란 사례 · 현장 판정 예시';rejectBox.appendChild(rejectTitle);
const rejectList=document.createElement('ul');rejectList.style.cssText='margin:10px 0 0;padding-left:20px;line-height:1.85;font-size:13px';
negativeExamples[n].forEach(t=>{const li=document.createElement('li');li.textContent=t;rejectList.appendChild(li)});
rejectBox.appendChild(rejectList);
const recognitionHeading=[...evidenceRoot.querySelectorAll('h4')].find(el=>el.textContent?.includes('인정 곤란 사례'));
if(recognitionHeading){recognitionHeading.parentNode.insertBefore(guideUploader,recognitionHeading);recognitionHeading.before(rejectBox);recognitionHeading.remove();}
else{evidenceRoot.appendChild(guideUploader);evidenceRoot.appendChild(rejectBox)}
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
