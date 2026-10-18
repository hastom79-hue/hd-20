(()=>{'use strict';
const ID='hd20DashboardPriority';
/* step:'03'/'04'/'05'가 바로 위 '업무 흐름' 배너(5S 활동 등록→...→Audit·유지관리, 8단계)와는 전혀
   다른, 이 카드 그룹 자체만의 번호 체계였음(실제로는 3개 그룹뿐인데 번호가 3부터 시작) — "왜 STEP
   01·02가 없지?"라는 혼란을 주고 있었음(사용자 지적: "전면 재검토"). 업무 흐름 배너와 번호 체계가
   섞이지 않도록 이 카드들은 숫자 대신 단순한 그룹 순번(①②③)으로 표기해 혼동을 없앰. */
const GROUPS=[
  {key:'advancement',step:'①',label:'고도화 유지·이탈',summary:'확정된 사례의 유지와 이탈을 확인'},
  {key:'audit',step:'②',label:'Audit 지속·재발',summary:'Audit 이후 6개월 유지와 부적합 재발을 확인'},
  {key:'action',step:'③',label:'개선조치 적시성',summary:'완료기한이 지정된 개선조치의 실행상태를 확인'}
];
/* good(추세가 '개선'으로 판정되는 방향)·max(미니 막대그래프 축 상한)는 5번 탭(dashboard-ops-trend.js
   의 M 배열)과 동일한 값을 그대로 맞춤 — 같은 6개 지표를 다른 화면에서 다르게 해석하면 안 되므로. */
const KPI=[
  {key:'advRetention',label:'고도화 확정 사례의 유지율',unit:'%',tab:'advancement',hint:'확정 성과 유지 · 공식 확정 사례 중 현재 유지 중인 비율',good:'up',max:100},
  {key:'advAttrition',label:'고도화 확정 후 이탈률',unit:'%',tab:'advancement',hint:'유지기준 이탈 · 공식 확정 사례 중 유지기준 이탈 비율',good:'down',max:100},
  {key:'sixRetention',label:'Audit 후 6개월 유지율',unit:'%',tab:'audit',hint:'지속성 검증 · 6개월 관리 종료 사례의 유지 비율',good:'up',max:100},
  {key:'recurrence',label:'Audit 부적합 재발률',unit:'%',tab:'audit',hint:'동일 문제 재발 · 동일 문제의 반복 발생 여부',good:'down',max:100},
  {key:'actionOnTime',label:'기한 내 개선조치 완료율',unit:'%',tab:'action',hint:'문제 발생 후 조치 · 개선조치 실행의 적시성',good:'up',max:100}
];
function fmt(v,k){if(v===null||v===undefined||Number.isNaN(v))return '—';const def=KPI.find(x=>x.key===k)||{};const num=def.prefix?v:(Number.isInteger(v)?v:Math.round(v*10)/10);return `${def.prefix||''}${num}${def.unit||''}`}
function gotoTab(key){document.querySelector(`.beginnerNav button[data-key="${key}"]`)?.click()}
function ensure(){
  const cards=document.querySelector('.cards');if(!cards)return null;
  /* 지표 최우선 배치: 헤드라인 KPI(.cards)를 먼저 보여주고, 상세 운영
     건전성 KPI(OPERATION HEALTH)는 그 다음에 오도록 순서를 바꿈. */
  if(!cards.previousElementSibling?.classList.contains('hd20DashboardSectionLabel')){
    const label=document.createElement('div');label.className='hd20DashboardSectionLabel';label.innerHTML='<div><small>핵심 지표</small><b>5S 활동 → 고도화 성과 흐름</b></div><span>활동량과 고도화 전환현황을 핵심지표로 확인</span>';cards.insertAdjacentElement('beforebegin',label);
  }
  let root=document.getElementById(ID);
  if(!root){
    root=document.createElement('section');root.id=ID;root.className='hd20DashboardPriority';
    root.innerHTML=`<div class="hd20DashboardPriorityHead"><div><small>운영 상태</small><h2>운영 건전성 KPI</h2><p>현재 상태를 확인하고 판정·유지·개선조치 화면으로 바로 이동합니다.</p></div><div class="hd20DashboardPriorityGuide"><span>현재 상태</span><i>→</i><span>판단</span><i>→</i><span>다음 행동</span></div></div><div class="hd20V3Readiness" aria-live="polite"></div><div class="hd20DashboardPriorityGroups"></div>`;
    cards.insertAdjacentElement('afterend',root);
  }
  /* .mainGrid 자체는 레거시로 CSS에서 display:none 처리돼 안 보이지만, 그 앞에 삽입하던 이 라벨
     ('EXECUTION & SUSTAIN · 팀별 실행 · Audit 유지관리')만 숨김 대상이 아니라서, 대시보드 모든
     하위탭 하단에 맥락 없이 걸려 있는 상태였음(사용자 지적: 업로드 스크린샷 기준 삭제 요청) — 라벨
     생성 자체를 제거. 기존에 이미 꽂혀 있는 라벨을 치우는 정리 로직(아래 두 줄)은 유지. */
  document.querySelectorAll('.mainGrid').forEach(main=>{if(main.previousElementSibling?.classList.contains('hd20DashboardSectionLabel'))main.previousElementSibling.remove()});
  const bottom=document.querySelector('.bottomGrid');
  if(bottom?.previousElementSibling?.classList.contains('hd20DashboardSectionLabel'))bottom.previousElementSibling.remove();
  return root;
}
/* 사용자 지시: "1번 탭은 5번 탭처럼 바꿔주고" — 탭1·탭5가 같은 6개 지표를 다루고 있으므로, 5번 탭
   (dashboard-ops-trend.js)의 '카드 제목 + 큰 숫자 + 추세 화살표 + 월별 미니 막대그래프 + 캡션 +
   원인 확인 버튼' 구성을 탭1의 카드에도 그대로 적용. 기존 .hd20HealthKpi(다른 화면에서도 참조될 수
   있어 유지)와 별도로 .hd20HealthTrendCard라는 새 클래스로 구현해 기존 스타일과 충돌시키지 않음. */
function trendCss(){if(document.getElementById(ID+'TrendStyle'))return;const s=document.createElement('style');s.id=ID+'TrendStyle';s.textContent=`
#${ID} .hd20HealthTrendCard{border:1px solid #e3eaf0;border-radius:12px;padding:14px 15px;background:#fbfcfd}
#${ID} .hd20HealthTrendCard h4{margin:0;font-size:13px;color:#22303f;font-weight:850}#${ID} .httFlow{font-size:11px;color:#667b8e;margin-top:4px;font-weight:750}
#${ID} .httBig{display:flex;align-items:baseline;gap:7px;margin:6px 0 2px}
#${ID} .httBig b{font-size:26px;color:#14304c;letter-spacing:-.02em}#${ID} .httBig em{font-style:normal;font-size:12px;color:#5c6b7a;font-weight:800}
#${ID} .httDelta{font-size:11.5px;font-weight:850}#${ID} .httDelta.up{color:#2f7a4d}#${ID} .httDelta.down{color:#c0392b}#${ID} .httDelta.flat{color:#7a8a97}
#${ID} .httBars{display:grid;grid-template-columns:repeat(var(--htt-months,12),minmax(0,1fr));gap:5px;align-items:end;height:80px;overflow:hidden;margin-top:9px;border-bottom:1px solid #dde5eb}
#${ID} .httCol{display:flex;flex-direction:column;justify-content:flex-end;align-items:center;height:100%;min-width:0;gap:2px}
#${ID} .httCol i{display:block;width:60%;border-radius:3px 3px 0 0;background:#b7c6d4;min-height:2px}#${ID} .httCol.last i{background:#14304c}
#${ID} .httMon{display:grid;grid-template-columns:repeat(var(--htt-months,12),minmax(0,1fr));gap:5px;margin-top:3px;text-align:center;font-size:9.5px;color:#a0adb8}
#${ID} .httFoot{display:flex;justify-content:space-between;align-items:flex-end;gap:8px;margin-top:9px}
#${ID} .httFoot p{margin:0;font-size:11px;color:#7a8a97;line-height:1.5}
#${ID} .httFoot button{flex:0 0 auto;border:1px solid #cfd9e2;background:#fff;color:#14304c;border-radius:9px;padding:5px 9px;font-weight:850;font-size:11.5px;cursor:pointer}
`;document.head.appendChild(s)}
function card(x,i,op,monthly){
  trendCss();
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const arr=monthly?(monthly[x.key]||[]):[],vals=arr.map(v=>v.v),known=vals.map((v,i2)=>v===null?null:i2).filter(i2=>i2!==null);
  const li=known.length?known[known.length-1]:-1,pi=known.length>1?known[known.length-2]:-1;
  const cur=op[x.key],prev=pi>=0?vals[pi]:null;
  let delta='<span class="httDelta flat">비교할 이전 값 없음</span>';
  if(cur!==null&&cur!==undefined&&prev!==null&&prev!==undefined){const d=Math.round((cur-prev)*10)/10;if(d===0)delta='<span class="httDelta flat">전월과 같음</span>';else{const better=x.good==='up'?d>0:d<0;delta=`<span class="httDelta ${better?'up':'down'}">${d>0?'▲':'▼'} ${Math.abs(d).toFixed(1)}${esc(x.unit||'')} 전월 대비 ${better?'개선':'악화'}</span>`}}
  const mx=x.max||Math.max(1,...vals.filter(v=>v!==null));
  // Show January through the current month; never display future months.
  const now=new Date(),currentKey=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');
  const visibleIndices=(monthly?.months||[]).map((m,i)=>({m,i})).filter(x=>x.m.slice(0,4)===currentKey.slice(0,4)&&x.m<=currentKey);
  const visible=visibleIndices.map(x=>arr[x.i]).filter(Boolean),visibleMonths=visibleIndices.map(x=>x.m);
  const bars=visible.length?visible.map((v,i2)=>{const n=Number(v.v);const h=v.v===null||!Number.isFinite(n)?0:Math.max(2,Math.min(74,Math.round(n/mx*74)));return `<div class="httCol${i2===visible.length-1?' last':''}" title="${esc(visibleMonths[i2]||'')}: ${v.v===null?'표본 없음':fmt(v.v,x.key)} (표본 ${v.n}건)"><i style="height:${h}px"></i></div>`}).join(''):'';
  const mon=visibleMonths.map(mm=>`<div>${+String(mm).slice(5)}월</div>`).join('');
  const g=GROUPS.find(gg=>gg.key===x.tab);
  return `<article class="hd20HealthTrendCard" data-kpi="${x.key}" data-tab="${x.tab}"><div class="httGroupTag">${g?g.step+' '+g.label:''}</div><h4>${x.label}</h4><div class="httFlow">${esc(x.hint.split(" · ")[0])}</div><div class="httBig"><b>${fmt(op[x.key],x.key)}</b></div>${delta}${bars?`<div class="httBars" style="--htt-months:${visible.length}">${bars}</div><div class="httMon" style="--htt-months:${visible.length}">${mon}</div>`:''}<div class="httFoot"><p>${x.hint}</p><button type="button" data-group-tab="${x.tab}">원인 확인 →</button></div></article>`}
function removeRetiredStandardTrendLabel(){const bottom=document.querySelector('.bottomGrid');if(bottom?.previousElementSibling?.classList.contains('hd20DashboardSectionLabel'))bottom.previousElementSibling.remove()}
function render(){
  removeRetiredStandardTrendLabel();
  const root=ensure();if(!root)return;
  const snap=window.HD20KPIData?.snapshot?.();const op=window.HD20KPIData?.operational?.(snap)||{};
  let monthly=null;try{monthly=window.HD20KPIData?.monthlyOperational?.(12)||null}catch(e){monthly=null}
  // V3 data readiness is derived exclusively from the existing operational KPI snapshot.
  // Missing data is never presented as zero or as a calculated risk score.
  const ready=KPI.filter(x=>op[x.key]!==null&&op[x.key]!==undefined&&Number.isFinite(Number(op[x.key])));
  const missing=KPI.filter(x=>!ready.includes(x));
  const readiness=root.querySelector('.hd20V3Readiness');
  if(readiness){
    /* 6개 지표가 전부 정상 연결된 평상시에도 매번 초록 포인트 바가 있는 독립된 박스로 눈에 띄게
       보여, 바로 아래 핵심 KPI 카드들보다 이 "데이터 상태 점검" 안내가 먼저 시선을 끄는 역전 현상이
       있었음(사용자 지적: "전면 재검토") — 정상(6/6 연결)일 때는 작은 한 줄 안내로 축소하고, 실제로
       누락된 지표가 있을 때만(missing.length>0) 원래의 강조된 박스로 표시해 "이상 있을 때만 눈에
       띄는" 방식으로 전환. */
    readiness.classList.toggle('ok',!missing.length);
    readiness.innerHTML=missing.length
      ?'<div class="hd20V3ReadinessMain"><strong>운영지표 데이터 상태</strong><span>'+ready.length+' / '+KPI.length+'개 연결 확인</span></div><p>확인 필요: '+missing.map(x=>x.label).join(' · ')+'</p>'
      :'<p class="hd20V3ReadinessOk">운영지표 '+KPI.length+'개 전부 정상 연결됨 · 실제 업무 성과 판정은 별도 확인이 필요합니다.</p>';
  }
  /* 사용자 지적: "2열로 3개씩 맞추라고" — 카드 개수가 3:2:1로 다른 3개 그룹을 각자 박스로 나눠
     3열로 배치하면(이전 방식) 카드 적은 그룹의 열이 항상 휑해 보이는 문제가 구조적으로 반복됨.
     그룹별 박스 구분 자체를 없애고, 6개 지표 카드를 하나의 평평한 2열×3행 그리드로 배치. 소속
     확인 영역은 각 카드 좌상단의 작은 태그(색상 그룹 범례와 동일한 라벨)로만 표시. */
  const groups=root.querySelector('.hd20DashboardPriorityGroups');
  groups.innerHTML=`<div class="httLegend">${GROUPS.map(g=>`<span data-legend="${g.key}">${g.step} ${g.label}</span>`).join('')}</div><div class="httGrid">${KPI.map(x=>card(x,KPI.indexOf(x),op,monthly)).join('')}</div>`;
  groups.querySelectorAll('[data-group-tab]').forEach(btn=>btn.addEventListener('click',()=>gotoTab(btn.dataset.groupTab)));
}
function boot(){removeRetiredStandardTrendLabel();render();setTimeout(removeRetiredStandardTrendLabel,500);setTimeout(removeRetiredStandardTrendLabel,1800);['hd20-kpi-source-updated','hd20-gmes-5s-imported','hd20-gmes-5s-judged','hd20-audit-updated','hd20-action-updated'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(render,0)))}
window.HD20DashboardPriority={render,KPI,GROUPS};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();