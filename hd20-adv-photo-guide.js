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

// The reference panel displays actual, traceable case evidence only.
// The active unsaved draft takes precedence; otherwise select a registered
// case satisfying the currently viewed criterion. Never substitute examples.
// Reference guide images are independent from improvement-case evidence.
// All six examples need authorized, real source photos; none are fabricated.
const evidenceRoot=overlay.querySelector('section');
const GUIDE_KEY='hd20AdvGuideReferencePhotosV1';
const loadGuide=()=>{try{const x=JSON.parse(localStorage.getItem(GUIDE_KEY)||'{}');return x&&typeof x==='object'?x:{}}catch{return{}}};
const guideImages=loadGuide();
const guideUploader=document.createElement('section');
guideUploader.id='hd20AdvGuidePhotoReference';
guideUploader.style.cssText='margin:15px 0;padding:14px;background:#f4f8fc;border:1px solid #d0dfeb;border-radius:10px';
const guideTitle=document.createElement('strong');
guideTitle.textContent='BEFORE · AFTER 평가 사진 가이드';
guideUploader.appendChild(guideTitle);
const guideHint=document.createElement('p');
guideHint.textContent='현장 촬영 예시 원본을 등록하여 사용하는 영역입니다. 아래 실제 개선사례 증빙사진과 구분합니다.';
guideHint.style.cssText='margin:5px 0 12px;font-size:12px;color:#536c7d;line-height:1.6';
guideUploader.appendChild(guideHint);
const guideGrid=document.createElement('div');
guideGrid.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px';
const isMaster=!!window.HD20MasterAccess?.isMaster?.();
for(const kind of ['before','after']){
 const key='criterion'+(n+1)+'_'+kind;
 const photo=guideImages[key];
 const cell=document.createElement('div');
 cell.style.cssText='padding:12px;background:white;border:1px solid #d5e1eb;border-radius:9px;min-height:170px';
 const title=document.createElement('b');title.textContent=kind.toUpperCase()+' 가이드 원본';
 cell.appendChild(title);
 if(typeof photo==='string'&&/^data:image\/(png|jpeg|webp);base64,/i.test(photo)){
  const img=document.createElement('img');img.src=photo;img.alt=(n+1)+'번 요건 '+kind.toUpperCase()+' 평가 참고사진';
  img.style.cssText='display:block;width:100%;max-height:300px;object-fit:contain;margin:9px auto;border-radius:6px;background:#f8fafb';
  cell.appendChild(img);
 }else{
  const missing=document.createElement('p');
  missing.textContent='평가용 원본 사진 미등록';
  missing.style.cssText='min-height:90px;display:flex;align-items:center;justify-content:center;text-align:center;color:#677e91;background:#f7f9fb;border:1px dashed #cbd9e4;border-radius:7px;font-size:13px';
  cell.appendChild(missing);
 }
 if(isMaster){
   const wrap=document.createElement('label');
   wrap.style.cssText='display:block;font-size:12px;font-weight:700;color:#145a81;cursor:pointer;margin-top:9px';
   wrap.textContent='현장 원본 사진 '+(photo?'교체':'등록')+' (마스터)';
   const input=document.createElement('input');input.type='file';input.accept='image/jpeg,image/png,image/webp';
   input.style.cssText='display:block;width:100%;margin-top:7px;font-size:11px';
   input.onchange=async()=>{
     const file=input.files?.[0];if(!file)return;
     if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>600000){
       alert('가이드 사진은 JPG/PNG/WEBP, 600KB 이하로 등록해 주세요.');input.value='';return;
     }
     const data=await new Promise((resolve,reject)=>{const rd=new FileReader();rd.onload=()=>resolve(rd.result);rd.onerror=reject;rd.readAsDataURL(file)});
     const next=loadGuide();next[key]=data;
     try{localStorage.setItem(GUIDE_KEY,JSON.stringify(next))}
     catch(e){alert('브라우저 저장공간 부족으로 등록하지 못했습니다.');return}
     open(n);
   };
   wrap.appendChild(input);cell.appendChild(wrap);
 }
 guideGrid.appendChild(cell);
}
guideUploader.appendChild(guideGrid);
const sourceNotice=document.createElement('p');
sourceNotice.style.cssText='margin:10px 0 0;font-size:11px;color:#856129;line-height:1.6';
sourceNotice.textContent='현재 가이드 사진은 등록한 브라우저에만 저장됩니다. 전체 사용자 공유에는 별도 공용 저장소 연동이 필요합니다.';
guideUploader.appendChild(sourceNotice);
const guideTextBoxes=evidenceRoot.querySelectorAll('div');
const guideTextAnchor=[...guideTextBoxes].find(el=>el.textContent?.trim().startsWith('BEFORE 사진 가이드'));
if(guideTextAnchor?.parentElement)guideTextAnchor.parentElement.before(guideUploader);
else evidenceRoot.appendChild(guideUploader);

const evidence=document.createElement('div');
evidence.id='hd20AdvGuideEvidence';
evidence.style.cssText='margin:16px 0;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px';
const validImage=(v)=>typeof v==='string'&&(/^(data:image\/(?:png|jpeg|jpg|webp|gif);base64,)/i.test(v)||/^(https?:\/\/|blob:)/i.test(v));
const getImage=(record,keys)=>{for(const key of keys){const v=record?.[key];if(validImage(v))return v}return ''};
const fromStorage=(key)=>{
 try{const arr=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(arr)?arr:[]}catch{return[]}
};
const matchingCriterion=(record,index)=>{
 const keys=[['criteriaVisual','visualization','criterionVisual'],['criteriaGreen','greenZone','criterionGreen'],['criteriaSpace','spaceUtilization','criterionSpace']][index];
 return keys.some(key=>record?.[key]===true||record?.[key]===1||String(record?.[key]||'').toLowerCase()==='충족');
};
const active=document.querySelector('#awRegisterModal.on,#hd20ActionRegisterModal.on');
const isActivity=active?.id==='awRegisterModal';
const draftBefore=isActivity?active?.querySelector('#awBefore'):active?.querySelector('#amBefore');
const draftAfter=isActivity?active?.querySelector('#awAfter'):null;
// "Additional Evidence" in a request is NOT an AFTER photograph.
const draftPhoto=(el)=>validImage(el?.dataset?.data)?el.dataset.data:'';
const draft={before:draftPhoto(draftBefore),after:draftPhoto(draftAfter)};
const casePair=(record,source)=>{
 const before=getImage(record,['before','beforePhoto','beforeImage']);
 const after=getImage(record,['after','afterPhoto','afterImage']);
 if(!before&&!after)return null;
 return {before,after,source,id:String(record.id||record.activityId||record.improvementId||''),
   team:String(record.team||''),date:String(record.date||record.regDate||record.createdAt||'').slice(0,10)};
};
let selected=null;
if(draft.before||draft.after){
 selected={...draft,source:'현재 작성 중인 사례',id:'',team:'',date:''};
}else{
 let cases=[
  ...fromStorage('hd20GMES5SAutoImproveRawV1').map(r=>({record:r,source:'자율개선 등록'})),
  ...fromStorage('hd20ActionCasesV2').map(r=>({record:r,source:'개선조치 등록'}))
 ];
 // Cross-view KPI data is a fallback, not the canonical photograph source.
 // Some summarized KPI rows omit large before/after image payloads.
 if(!cases.some(({record})=>matchingCriterion(record,n)&&casePair(record,'')!==null)){
   try{
     const kpi=window.HD20KPIData;
     const snap=kpi?.snapshot?.();
     if(Array.isArray(snap?.activities))cases.push(...snap.activities.map(r=>({record:r,source:'자율개선 등록'})));
     const actions=kpi?.actionCases?.();
     if(Array.isArray(actions))cases.push(...actions.map(r=>({record:r,source:'개선조치 등록'})));
   }catch(err){console.warn('[HD20 photo guide] photo source fallback',err)}
 }
 const seen=new Set();
 const relevant=cases.filter(({record})=>{
   if(!record||!matchingCriterion(record,n))return false;
   const id=String(record.id||'');
   const key=id||'';
   if(key&&seen.has(key))return false;
   if(key)seen.add(key);
   return true;
 });
 relevant.sort((a,b)=>String(b.record.createdAt||b.record.created||b.record.date||'')
   .localeCompare(String(a.record.createdAt||a.record.created||a.record.date||'')));
 // Preserve photo provenance: both pictures must belong to one actual case.
 selected=relevant.map(({record,source})=>casePair(record,source))
   .find(pair=>pair&&(pair.before||pair.after))||null;
}
const evidenceHeading=document.createElement('h4');
evidenceHeading.textContent='실제 등록된 현장사진 · '+(n+1)+'번 요건';
evidenceHeading.style.cssText='grid-column:1/-1;margin:0;font-size:15px;color:#183e59';
evidence.appendChild(evidenceHeading);
const identity=document.createElement('p');
identity.style.cssText='grid-column:1/-1;margin:0;color:#56748a;font-size:12px;line-height:1.6';
identity.textContent=selected
 ?[selected.source,selected.id&&'사례 '+selected.id,selected.team&&'생산팀 '+selected.team,selected.date].filter(Boolean).join(' · ')
 :'해당 요건을 충족한 사례에서 연결 가능한 원본 사진을 찾지 못했습니다. 사진을 임의로 생성하거나 다른 사례의 사진으로 대체하지 않습니다.';
evidence.appendChild(identity);
for(const kind of ['before','after']){
 const cell=document.createElement('div');
 cell.style.cssText='border:1px solid #d8e3eb;border-radius:9px;padding:12px;min-height:175px;min-width:0';
 const title=document.createElement('b');
 title.textContent=kind.toUpperCase()+' 실제 등록 사진';cell.appendChild(title);
 const src=selected?.[kind]||'';
 if(src){
   const img=document.createElement('img');img.src=src;img.alt=kind.toUpperCase()+' 등록 원본 사진';
   img.style.cssText='display:block;max-width:100%;max-height:300px;object-fit:contain;margin:12px auto;cursor:zoom-in';
   img.onclick=()=>window.open(img.src,'_blank','noopener,noreferrer');
   img.onerror=()=>{img.remove();const p=document.createElement('p');p.textContent='등록된 사진 주소를 읽을 수 없습니다. 원본 보관 상태를 확인하세요.';cell.appendChild(p)};
   cell.appendChild(img);
 }else{
   const missing=document.createElement('p');
   missing.textContent=selected
     ?'이 사례에는 '+kind.toUpperCase()+' 원본 사진이 등록되어 있지 않습니다.'
     :'해당 요건의 실제 등록 사진이 없습니다.';
   missing.style.cssText='color:#758595;padding:30px 5px;text-align:center;font-size:13px;line-height:1.5';
   cell.appendChild(missing);
 }
 evidence.appendChild(cell);
}
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
