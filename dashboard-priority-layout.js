(()=>{'use strict';
const ID='hd20DashboardPriority';
const GROUPS=[
  {key:'advancement',step:'03',label:'고도화·판정',summary:'등록된 사례를 공식 판정과 고도화 수준으로 확인'},
  {key:'audit',step:'04',label:'유지·Audit',summary:'Audit 이후 6개월 유지와 부적합 재발을 확인'},
  {key:'action',step:'05',label:'개선조치',summary:'완료기한이 지정된 개선조치의 실행상태를 확인'}
];
const KPI=[
  {key:'judgmentRate',label:'공식 판정 완료율',unit:'%',tab:'advancement',hint:'판정대상 중 공식 판정 완료 비율'},
  {key:'avgLead',label:'평균 판정 Lead Time',unit:'일',tab:'advancement',hint:'등록부터 공식 판정까지 평균 소요일'},
  {key:'maturity',label:'고도화 수준',prefix:'Lv.',tab:'advancement',hint:'공식 확정 사례의 현재 평균 Level'},
  {key:'sixRetention',label:'Audit 후 6개월 유지율',unit:'%',tab:'audit',hint:'6개월 관리 종료 사례의 유지 비율'},
  {key:'recurrence',label:'Audit 부적합 재발률',unit:'%',tab:'audit',hint:'재발여부가 기록된 개선조치 중 재발 비율'},
  {key:'actionOnTime',label:'기한 내 개선조치 완료율',unit:'%',tab:'action',hint:'완료기한이 있는 완료 Case의 기한 내 완료 비율'}
];
function fmt(v,k){if(v===null||v===undefined||Number.isNaN(v))return '—';const def=KPI.find(x=>x.key===k)||{};return `${def.prefix||''}${v}${def.unit||''}`}
function gotoTab(key){document.querySelector(`.beginnerNav button[data-key="${key}"]`)?.click()}
function ensure(){
  const cards=document.querySelector('.cards');if(!cards)return null;
  /* 지표 최우선 배치: 헤드라인 KPI(.cards)를 먼저 보여주고, 상세 운영
     건전성 KPI(OPERATION HEALTH)는 그 다음에 오도록 순서를 바꿈. */
  if(!cards.previousElementSibling?.classList.contains('hd20DashboardSectionLabel')){
    const label=document.createElement('div');label.className='hd20DashboardSectionLabel';label.innerHTML='<div><small>PERFORMANCE FLOW</small><b>5S 활동 → 고도화 성과 흐름</b></div><span>활동량과 고도화 전환현황을 핵심지표로 확인</span>';cards.insertAdjacentElement('beforebegin',label);
  }
  let root=document.getElementById(ID);
  if(!root){
    root=document.createElement('section');root.id=ID;root.className='hd20DashboardPriority';
    root.innerHTML=`<div class="hd20DashboardPriorityHead"><div><small>OPERATION HEALTH</small><h2>운영 건전성 KPI</h2><p>현재 상태를 확인하고 판정·유지·개선조치 화면으로 바로 이동합니다.</p></div><div class="hd20DashboardPriorityGuide"><span>현재 상태</span><i>→</i><span>판단</span><i>→</i><span>다음 행동</span></div></div><div class="hd20DashboardPriorityGroups"></div>`;
    cards.insertAdjacentElement('afterend',root);
  }
  const main=document.querySelector('.mainGrid');if(main&&!main.previousElementSibling?.classList.contains('hd20DashboardSectionLabel')){const label=document.createElement('div');label.className='hd20DashboardSectionLabel';label.innerHTML='<div><small>EXECUTION & SUSTAIN</small><b>팀별 실행 · Audit 유지관리</b></div><span>팀별 활동에서 Audit·개선조치까지 연결 확인</span>';main.insertAdjacentElement('beforebegin',label)}
  const bottom=document.querySelector('.bottomGrid');if(bottom&&!bottom.previousElementSibling?.classList.contains('hd20DashboardSectionLabel')){const label=document.createElement('div');label.className='hd20DashboardSectionLabel';label.innerHTML='<div><small>STANDARD & TREND</small><b>판정기준 · 고도화 추이</b></div><span>3대 기준과 시간축 변화를 함께 확인</span>';bottom.insertAdjacentElement('beforebegin',label)}
  return root;
}
function card(x,i,op){return `<article class="hd20HealthKpi" data-kpi="${x.key}" data-tab="${x.tab}"><div class="hd20HealthKpiIndex">0${i+1}</div><div class="hd20HealthKpiBody"><small>${x.label}</small><strong>${fmt(op[x.key],x.key)}</strong><p>${x.hint}</p></div></article>`}
function render(){
  const root=ensure();if(!root)return;
  const snap=window.HD20KPIData?.snapshot?.();const op=window.HD20KPIData?.operational?.(snap)||{};
  const groups=root.querySelector('.hd20DashboardPriorityGroups');
  groups.innerHTML=GROUPS.map(g=>{const items=KPI.filter(x=>x.tab===g.key);return `<section class="hd20HealthGroup" data-domain="${g.key}"><header><div><small>STEP ${g.step}</small><b>${g.label}</b><p>${g.summary}</p></div><button type="button" data-group-tab="${g.key}">업무화면 →</button></header><div class="hd20HealthGroupGrid">${items.map(x=>card(x,KPI.indexOf(x),op)).join('')}</div></section>`}).join('');
  groups.querySelectorAll('[data-group-tab]').forEach(btn=>btn.addEventListener('click',()=>gotoTab(btn.dataset.groupTab)));
}
function boot(){render();['hd20-kpi-source-updated','hd20-gmes-5s-imported','hd20-gmes-5s-judged','hd20-audit-updated','hd20-action-updated'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(render,0)))}
window.HD20DashboardPriority={render,KPI,GROUPS};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();