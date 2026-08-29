(()=>{'use strict';
/* awRegister (⑦ 기준정보) previously rendered only a one-line stub pointing
 * users at the settings modal, with no data of its own to view/export.
 * This fills it with the actual team/leader/target master data so the
 * tab has real content and the CSV-export/print toolbar has something
 * to export. */
const LEAD_KEY='hd20TeamLeaderMasterV1';
const ORDER_KEY='gmes5s_team_display_order';
const TARGET_KEY='gmes5s_quarter_targets';
const ADV_TARGET_KEY='gmes5s_quarter_advancement_targets';
const CATS=['정리','정돈','청소','시각화','위험구역관리','5S 고도화'];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function css(){if(document.getElementById('registerTabFillStyle'))return;const s=document.createElement('style');s.id='registerTabFillStyle';s.textContent='.awAdvRate{display:inline-block;padding:3px 8px;border-radius:999px;background:#eef2f6;color:#5f7c92;font-weight:900;font-size:10px}.awAdvRate.mid{background:#fff0d6;color:#a36a00}.awAdvRate.good{background:#e3f3e7;color:#2e7c43}';document.head.appendChild(s)}
function leaders(){try{const v=JSON.parse(localStorage.getItem(LEAD_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function order(){try{const v=JSON.parse(localStorage.getItem(ORDER_KEY)||'null');return Array.isArray(v)?v:null}catch{return null}}
function targets(){try{const v=JSON.parse(localStorage.getItem(TARGET_KEY)||'null');return v&&typeof v==='object'?v:{Q1:45,Q2:50,Q3:55,Q4:60}}catch{return{Q1:45,Q2:50,Q3:55,Q4:60}}}
/* 5S 고도화 확정은 3대 기준(시각화·형적관리/인간공학적 Green Zone/정량축소·
 * 정위치 변경)을 모두 충족해야 하는, 난이도가 높은 확정 절차다. 기존
 * gmes5s_quarter_targets(45~60건/분기)는 전체 5S 활동 등록량 기준 레거시
 * 목표이며 고도화 확정과는 별개 지표이므로, 확정 사례 전용의 훨씬 낮고
 * 현실적인 목표를 별도로 둔다. */
function advTargets(){try{const v=JSON.parse(localStorage.getItem(ADV_TARGET_KEY)||'null');return v&&typeof v==='object'?v:{Q1:2,Q2:3,Q3:3,Q4:4}}catch{return{Q1:2,Q2:3,Q3:3,Q4:4}}}
function quarterOf(dateStr){const d=new Date(dateStr);if(Number.isNaN(d.getTime()))return null;return 'Q'+(Math.floor(d.getMonth()/3)+1)}
function confirmedByQuarter(){const s=window.HD20KPIData?.snapshot?.(),confirmed=s?.confirmed||[],out={Q1:0,Q2:0,Q3:0,Q4:0};confirmed.forEach(x=>{const q=quarterOf(x.judgedAt||x.judgeDate||x.confirmedAt);if(q&&out[q]!==undefined)out[q]++});return out}
function render(){
  const host=document.getElementById('awRegister');
  if(!host||host.dataset.registerFilled==='1')return false;
  const data=leaders(),ord=order(),tg=targets(),atg=advTargets(),conf=confirmedByQuarter();
  if(!data.length)return false;
  host.dataset.registerFilled='1';
  const rows=(ord&&ord.length?ord:data.map(x=>x.team)).map((team,i)=>{
    const x=data.find(d=>d.team===team)||{team,leader:'미지정',email:''};
    return `<tr><td>${i+1}</td><td>${esc(x.team)}</td><td>${esc(x.leader||'미지정')}</td><td>${esc(x.email||'—')}</td></tr>`;
  }).join('');
  const targetRows=['Q1','Q2','Q3','Q4'].map(q=>`<tr><td>${q}</td><td>${esc(tg[q])}건</td></tr>`).join('');
  const advRows=['Q1','Q2','Q3','Q4'].map(q=>{const t=Number(atg[q])||0,c=conf[q]||0,rate=t?Math.round(c/t*100):0;return `<tr><td>${q}</td><td>${t}건</td><td>${c}건</td><td><span class="awAdvRate ${rate>=100?'good':rate>=50?'mid':''}">${t?rate+'%':'—'}</span></td></tr>`}).join('');
  const catRows=CATS.map((c,i)=>`<tr><td>${i+1}</td><td>${esc(c)}</td></tr>`).join('');
  host.insertAdjacentHTML('beforeend',`<div class="awGrid">
    ${`<div class="awCard"><div class="awHead">생산팀 · 팀장 · 이메일 (표시순서 기준)</div><div class="awBody"><table class="awTable"><thead><tr><th>#</th><th>생산팀</th><th>팀장</th><th>이메일</th></tr></thead><tbody>${rows}</tbody></table></div></div>`}
    ${`<div class="awCard"><div class="awHead">5S 활동 등록 목표(분기, 전체 활동 기준) · 활동유형</div><div class="awBody"><table class="awTable"><thead><tr><th>분기</th><th>목표</th></tr></thead><tbody>${targetRows}</tbody></table><table class="awTable" style="margin-top:10px"><thead><tr><th>#</th><th>5S 활동유형</th></tr></thead><tbody>${catRows}</tbody></table></div></div>`}
  </div>
  <div class="awCard" style="margin-top:12px"><div class="awHead">5S 고도화 확정 목표 (분기, 3대 기준 충족 사례 기준)</div><div class="awBody">
    <p class="awHint" style="margin:0 0 10px">고도화 확정은 시각화·형적관리 / 인간공학적 Green Zone / 정량축소·정위치 변경 3대 기준을 모두 충족해야 하는 난이도 높은 절차입니다. 위 활동 등록 목표와 전혀 다른, 훨씬 적고 현실적인 목표입니다.</p>
    <table class="awTable"><thead><tr><th>분기</th><th>확정 목표</th><th>실제 확정</th><th>달성률</th></tr></thead><tbody>${advRows}</tbody></table>
  </div></div>
  <p class="awHint" style="margin-top:10px">팀 표시순서·목표·팀장 정보 수정은 상단 <b>⚙ 통합기준정보</b> 버튼에서 진행합니다. 이 화면은 현재 설정값의 조회·추출용입니다.</p>`);
  return true;
}
function boot(){css();let n=0;const run=()=>{if(render())return;if(++n<50)setTimeout(run,150)};run();['hd20-team-master-updated'].forEach(ev=>window.addEventListener(ev,()=>{const h=document.getElementById('awRegister');if(h){h.dataset.registerFilled='';[...h.querySelectorAll('.awGrid,.awHint,.awCard')].forEach(x=>x.remove());render()}}))}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
