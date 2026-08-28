(()=>{'use strict';
/* awRegister (⑦ 기준정보) previously rendered only a one-line stub pointing
 * users at the settings modal, with no data of its own to view/export.
 * This fills it with the actual team/leader/target master data so the
 * tab has real content and the CSV-export/print toolbar has something
 * to export. */
const LEAD_KEY='hd20TeamLeaderMasterV1';
const ORDER_KEY='gmes5s_team_display_order';
const TARGET_KEY='gmes5s_quarter_targets';
const CATS=['정리','정돈','청소','시각화','위험구역관리','5S 고도화'];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function leaders(){try{const v=JSON.parse(localStorage.getItem(LEAD_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function order(){try{const v=JSON.parse(localStorage.getItem(ORDER_KEY)||'null');return Array.isArray(v)?v:null}catch{return null}}
function targets(){try{const v=JSON.parse(localStorage.getItem(TARGET_KEY)||'null');return v&&typeof v==='object'?v:{Q1:45,Q2:50,Q3:55,Q4:60}}catch{return{Q1:45,Q2:50,Q3:55,Q4:60}}}
function render(){
  const host=document.getElementById('awRegister');
  if(!host||host.dataset.registerFilled==='1')return false;
  const data=leaders(),ord=order(),tg=targets();
  if(!data.length)return false;
  host.dataset.registerFilled='1';
  const rows=(ord&&ord.length?ord:data.map(x=>x.team)).map((team,i)=>{
    const x=data.find(d=>d.team===team)||{team,leader:'미지정',email:''};
    return `<tr><td>${i+1}</td><td>${esc(x.team)}</td><td>${esc(x.leader||'미지정')}</td><td>${esc(x.email||'—')}</td></tr>`;
  }).join('');
  const targetRows=['Q1','Q2','Q3','Q4'].map(q=>`<tr><td>${q}</td><td>${esc(tg[q])}건</td></tr>`).join('');
  const catRows=CATS.map((c,i)=>`<tr><td>${i+1}</td><td>${esc(c)}</td></tr>`).join('');
  host.insertAdjacentHTML('beforeend',`<div class="awGrid">
    ${`<div class="awCard"><div class="awHead">생산팀 · 팀장 · 이메일 (표시순서 기준)</div><div class="awBody"><table class="awTable"><thead><tr><th>#</th><th>생산팀</th><th>팀장</th><th>이메일</th></tr></thead><tbody>${rows}</tbody></table></div></div>`}
    ${`<div class="awCard"><div class="awHead">분기별 목표 · 5S 활동유형</div><div class="awBody"><table class="awTable"><thead><tr><th>분기</th><th>목표</th></tr></thead><tbody>${targetRows}</tbody></table><table class="awTable" style="margin-top:10px"><thead><tr><th>#</th><th>5S 활동유형</th></tr></thead><tbody>${catRows}</tbody></table></div></div>`}
  </div><p class="awHint" style="margin-top:10px">팀 표시순서·목표·팀장 정보 수정은 상단 <b>⚙ 통합기준정보</b> 버튼에서 진행합니다. 이 화면은 현재 설정값의 조회·추출용입니다.</p>`);
  return true;
}
function boot(){let n=0;const run=()=>{if(render())return;if(++n<50)setTimeout(run,150)};run();['hd20-team-master-updated'].forEach(ev=>window.addEventListener(ev,()=>{const h=document.getElementById('awRegister');if(h){h.dataset.registerFilled='';[...h.querySelectorAll('.awGrid,.awHint')].forEach(x=>x.remove());render()}}))}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
