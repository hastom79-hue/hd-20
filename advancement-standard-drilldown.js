/* 사용자 지시: "고도화/표준화 탭은 ② 대시보드 드릴다운으로 흡수" — 메인탭에서 "고도화·표준화"를
   완전히 제거하고, 이 탭에 유일하게 남아 있던 "확정사례 관리"(표준화·적용범위·수평전개·유지상태
   추적)를 대시보드 "고도화 맵" 섹션의 드릴다운 버튼으로 이동.

   window.HD20_SUBNAV.select('advancement','standard')를 그대로 재사용하지 않은 이유: 그 함수는
   내부에서 window.HD20_NAV.active()==='advancement'일 때만 동작하는 가드를 갖고 있어, 메인탭
   자체를 지우면(활성화될 수 없으므로) 영구히 작동하지 않게 됨. 대신 hd20-subtabs.js의 판정 로직
   (advancementConfirmed·advScope·advStandardState·advRolloutState·advLine 등)을 window.HD20KPIData
   우선순위까지 동일하게 복제해, 독립적인 모달로 안전하게 재구현. */
(()=>{'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const txt=v=>String(v??'').trim();
function readStore(k){try{const v=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function advCriteriaCount(x){if(Array.isArray(x?.criteriaMatched))return Math.max(0,Math.min(3,x.criteriaMatched.length));const n=Number(x?.criteriaMatched);if(Number.isFinite(n))return Math.max(0,Math.min(3,n));const a=[x?.visualization??x?.criteriaVisual,x?.greenZone??x?.criteriaGreen,x?.spaceUtilization??x?.criteriaSpace];return a.filter(v=>v===true||/^(Y|YES|충족|적합)$/i.test(txt(v))).length}
function advancementType(x){return !!x&&advCriteriaCount(x)>=1}
function advancementConfirmed(x){return window.HD20KPIData?.isConfirmed?.(x) ?? (!!x&&advancementType(x)&&x.confirmed===true&&txt(x.judgeState)==='확정')}
function advancementMaintained(x){const api=window.HD20KPIData;if(api?.isMaintained)return api.isMaintained(x);return advancementConfirmed(x)&&x?.attrition!==true&&x?.valid!==false&&!/중지|미흡|이탈|재점검|부적합|해제|실패/i.test(txt(x?.maintainState||x?.auditState||x?.status))}
function advancementAttrition(x){return advancementConfirmed(x)&&!advancementMaintained(x)}
function advLine(x){return txt(x?.line||x?.lineName||x?.productionLine||x?.area||x?.['라인'])||'미분류/라인 매핑 필요'}
function advScope(x){return txt(x?.rolloutScope||x?.applyScope||x?.scope||x?.horizontalDeployment||x?.['적용범위'])||'미설정'}
function advStandardState(x){return txt(x?.standardState||x?.standardizationState||x?.standardized||x?.['표준화상태'])||'미설정'}
function advRolloutState(x){return txt(x?.rolloutState||x?.deploymentState||x?.['수평전개상태'])||'미설정'}
function caseLabel(x){const base=esc(txt(x.workplace||x.title||x.problem)||'—');const shortId=esc(String(x.id||'').replace(/^DEMO-A-(ADV-REAL-|JUDGE-QUEUE-)?/,'#'));return shortId&&shortId!=='#'?`${base} <small style="color:#9aabb6">${shortId}</small>`:base}

function close(){document.getElementById('hd20AdvStandardDrilldown')?.remove()}
function open(){
 const all=readStore('hd20GMES5SAutoImproveRawV1');
 const rows=all.filter(advancementConfirmed);
 const lostSet=new Set(rows.filter(advancementAttrition));
 const body=rows.slice().sort((a,b)=>Number(lostSet.has(b))-Number(lostSet.has(a))||String(txt(a.team)||'').localeCompare(String(txt(b.team)||''),'ko')).map(x=>{
  const isLost=lostSet.has(x);
  return `<tr><td>${esc(txt(x.team)||'—')}</td><td>${esc(advLine(x))}</td><td>${caseLabel(x)}</td><td>${esc(advStandardState(x))}</td><td>${esc(advScope(x))}</td><td>${esc(advRolloutState(x))}</td><td style="color:${isLost?'#c0392b':'#1a8754'}">${isLost?'유지 이탈':'유지'}</td></tr>`;
 }).join('');
 const maintained=rows.length-lostSet.size;
 const maintainRate=rows.length?Math.round(maintained/rows.length*100):0;

 let overlay=document.getElementById('hd20AdvStandardDrilldown');
 if(!overlay){
  overlay=document.createElement('div');
  overlay.id='hd20AdvStandardDrilldown';
  overlay.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(12,27,42,.68);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  document.body.appendChild(overlay);
  overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
  document.addEventListener('keydown',function escHandler(e){if(e.key==='Escape'){close();document.removeEventListener('keydown',escHandler)}});
 }
 overlay.innerHTML=`<section role="dialog" aria-modal="true" aria-label="확정·표준화·수평전개 현황" style="background:#fff;border-radius:12px;max-width:1080px;width:100%;max-height:90vh;overflow:auto;padding:22px;box-shadow:0 12px 40px #0004;color:#263e51;box-sizing:border-box">
  <header style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start">
    <div><b style="font-size:18px">확정·표준화·수평전개 현황</b><p style="font-size:12.5px;color:#667b8b;margin:6px 0">공식 확정된 고도화 사례를 표준화하고 유사 라인·작업장으로 재사용할 수 있게 관리합니다.</p></div>
    <button type="button" id="hd20AdvStdClose" style="padding:8px 13px;border:1px solid #cddae4;border-radius:8px;background:#fff;cursor:pointer;flex-shrink:0">닫기 ×</button>
  </header>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin:16px 0">
    <div style="border:1px solid #e3eaef;border-radius:10px;padding:12px 14px"><small style="color:#6b7f90">공식확정</small><b style="display:block;font-size:22px;margin-top:4px">${rows.length}건</b></div>
    <div style="border:1px solid #e3eaef;border-radius:10px;padding:12px 14px"><small style="color:#6b7f90">현재 유지</small><b style="display:block;font-size:22px;margin-top:4px;color:#1a8754">${maintained}건</b></div>
    <div style="border:1px solid #e3eaef;border-radius:10px;padding:12px 14px"><small style="color:#6b7f90">유지 이탈</small><b style="display:block;font-size:22px;margin-top:4px;color:${lostSet.size?'#c0392b':'#1d3b52'}">${lostSet.size}건</b></div>
    <div style="border:1px solid #e3eaef;border-radius:10px;padding:12px 14px"><small style="color:#6b7f90">유지율</small><b style="display:block;font-size:22px;margin-top:4px">${maintainRate}%</b></div>
  </div>
  <div style="overflow:auto;max-height:55vh;border:1px solid #e3eaef;border-radius:10px">
    <table style="width:100%;border-collapse:collapse;font-size:12.5px">
      <thead style="position:sticky;top:0;background:#eef4f8"><tr>
        <th style="padding:9px 10px;text-align:left">생산팀</th><th style="padding:9px 10px;text-align:left">라인</th><th style="padding:9px 10px;text-align:left">확정 Case</th><th style="padding:9px 10px;text-align:left">표준화</th><th style="padding:9px 10px;text-align:left">적용범위</th><th style="padding:9px 10px;text-align:left">수평전개</th><th style="padding:9px 10px;text-align:left">유지상태</th>
      </tr></thead>
      <tbody>${body||'<tr><td colspan="7" style="text-align:center;color:#8093a2;padding:20px">공식 확정된 고도화 사례가 없습니다.</td></tr>'}</tbody>
    </table>
  </div>
 </section>`;
 document.getElementById('hd20AdvStdClose').onclick=close;
}
function ensureButton(){
 if(document.getElementById('hd20AdvStdDrillBtn'))return;
 const anchor=[...document.querySelectorAll('h2,h3,b')].find(x=>x.textContent?.trim()==='고도화 맵');
 if(!anchor)return;
 const btn=document.createElement('button');
 btn.type='button';btn.id='hd20AdvStdDrillBtn';btn.textContent='📋 확정·표준화·수평전개 현황 보기';
 btn.style.cssText='margin-left:12px;padding:6px 13px;border:1px solid #2c72bb;border-radius:8px;background:#eef4fb;color:#1d5a92;font-size:12.5px;font-weight:600;cursor:pointer';
 btn.addEventListener('click',open);
 anchor.insertAdjacentElement('afterend',btn);
}
function boot(){
 let n=0;const run=()=>{ensureButton();if(++n<80)setTimeout(run,250)};run();
 document.addEventListener('click',()=>setTimeout(ensureButton,300),true);
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
window.HD20AdvStandardDrilldown={open,close};
})();
