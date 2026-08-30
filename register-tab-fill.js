(()=>{'use strict';
/* awRegister (⑦ 기준정보) previously rendered only a one-line stub pointing
 * users at the settings modal, with no data of its own to view/export.
 * This fills it with the actual team/leader/target master data so the
 * tab has real content and the CSV-export/print toolbar has something
 * to export. */
const LEAD_KEY='hd20TeamLeaderMasterV1';
const ORDER_KEY='gmes5s_team_display_order';
const PP_TARGET_KEY='gmes5s_quarter_perperson_targets';
const ADV_TARGET_KEY='gmes5s_quarter_advancement_targets';
const CATS=['정리','정돈','청소','시각화','위험구역관리','5S 고도화'];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function css(){if(document.getElementById('registerTabFillStyle'))return;const s=document.createElement('style');s.id='registerTabFillStyle';s.textContent='.awAdvRate{display:inline-block;padding:3px 8px;border-radius:999px;background:#eef2f6;color:#5f7c92;font-weight:900;font-size:13.5px}.awAdvRate.mid{background:#fff0d6;color:#a36a00}.awAdvRate.good{background:#e3f3e7;color:#2e7c43}.mrOverview{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-bottom:14px}.mrStat{padding:11px 13px;border-radius:10px;background:#fff;border:1px solid #e1e8ee;border-top:3px solid #2f80ed}.mrStat.mr-c2{border-top-color:#27ae60}.mrStat.mr-c3{border-top-color:#7a5af8}.mrStat.mr-c4{border-top-color:#e45757}.mrStat span{display:block;font-size:13px;color:#5f7c92;font-weight:800}.mrStat b{display:block;margin-top:4px;font-size:20px;color:#173a57}.mrCard.mr-c1{border-top:3px solid #2f80ed}.mrCard.mr-c2{border-top:3px solid #27ae60}.mrCard.mr-gold{border-top:3px solid #f2a93b;background:linear-gradient(180deg,#fffdf7,#fff)}.mrCard.mr-gold .awHead{color:#8a6a00}';document.head.appendChild(s)}
function leaders(){try{const v=JSON.parse(localStorage.getItem(LEAD_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function order(){try{const v=JSON.parse(localStorage.getItem(ORDER_KEY)||'null');return Array.isArray(v)?v:null}catch{return null}}
/* 5S 개선활동 목표는 인당 개선건수 기준이다 — 팀 규모가 다른 생산팀을
 * 동일 기준으로 비교하려면 총 활동건수(팀이 크면 무조건 높게 나옴)는
 * 의미가 없고, 인당 개선건수만 의미가 있다. 반대로 5S 고도화 확정은
 * 난이도가 높아 애초에 인원 규모와 무관하게 절대 건수로 관리한다. */
function ppTargets(){try{const v=JSON.parse(localStorage.getItem(PP_TARGET_KEY)||'null');return v&&typeof v==='object'?v:{Q1:0.5,Q2:0.6,Q3:0.6,Q4:0.7}}catch{return{Q1:0.5,Q2:0.6,Q3:0.6,Q4:0.7}}}
function activityQuarterOf(x){const d=new Date(x.date||x.regDate||x.createdAt);if(Number.isNaN(d.getTime()))return null;return 'Q'+(Math.floor(d.getMonth()/3)+1)}
function perPersonByQuarter(){const s=window.HD20KPIData?.snapshot?.(),rows=s?.activities||[],people=s?.headcount;const cnt={Q1:0,Q2:0,Q3:0,Q4:0};rows.forEach(x=>{const q=activityQuarterOf(x);if(q&&cnt[q]!==undefined)cnt[q]++});if(!people)return{people:null,value:{Q1:null,Q2:null,Q3:null,Q4:null}};const value={};['Q1','Q2','Q3','Q4'].forEach(q=>value[q]=Math.round(cnt[q]/people*100)/100);return{people,value}}
/* 5S 고도화 확정은 3대 기준(시각화·형적관리/인간공학적 Green Zone/정량축소·
 * 정위치 변경)을 모두 충족해야 하는, 난이도가 높은 확정 절차다. 고도화 확정과는 완전히 별개 지표이므로, 확정 사례 전용의
 * 훨씬 낮고 현실적인 절대건수 목표를 별도로 둔다 (5S 활동 목표는 인당
 * 개선건수 기준으로 아래 ppTargets()에서 관리, 고도화 확정은 절대 건수). */
function advTargets(){try{const v=JSON.parse(localStorage.getItem(ADV_TARGET_KEY)||'null');return v&&typeof v==='object'?v:{Q1:2,Q2:3,Q3:3,Q4:4}}catch{return{Q1:2,Q2:3,Q3:3,Q4:4}}}
function quarterOf(dateStr){const d=new Date(dateStr);if(Number.isNaN(d.getTime()))return null;return 'Q'+(Math.floor(d.getMonth()/3)+1)}
function confirmedByQuarter(){const s=window.HD20KPIData?.snapshot?.(),confirmed=s?.confirmed||[],out={Q1:0,Q2:0,Q3:0,Q4:0};confirmed.forEach(x=>{const q=quarterOf(x.judgedAt||x.judgeDate||x.confirmedAt);if(q&&out[q]!==undefined)out[q]++});return out}
function render(){
  const host=document.getElementById('awRegister');
  if(!host||host.dataset.registerFilled==='1')return false;
  const data=leaders(),ord=order(),ptg=ppTargets(),atg=advTargets(),conf=confirmedByQuarter(),pp=perPersonByQuarter();
  if(!data.length)return false;
  host.dataset.registerFilled='1';
  const withLeader=data.filter(x=>x.leader&&x.leader!=='미지정').length;
  const withEmail=data.filter(x=>x.email).length;
  const rows=(ord&&ord.length?ord:data.map(x=>x.team)).map((team,i)=>{
    const x=data.find(d=>d.team===team)||{team,leader:'미지정',email:''};
    return `<tr><td>${i+1}</td><td>${esc(x.team)}</td><td>${esc(x.leader||'미지정')}</td><td>${esc(x.email||'—')}</td></tr>`;
  }).join('');
  const ppRows=['Q1','Q2','Q3','Q4'].map(q=>{const t=Number(ptg[q])||0,v=pp.value[q];const rate=(t&&v!=null)?Math.round(v/t*100):null;return `<tr><td>${q}</td><td>${t}건/인</td><td>${v!=null?v+'건/인':'—'}</td><td>${rate!=null?`<span class="awAdvRate ${rate>=100?'good':rate>=50?'mid':''}">${rate}%</span>`:'—'}</td></tr>`}).join('');
  const advRows=['Q1','Q2','Q3','Q4'].map(q=>{const t=Number(atg[q])||0,c=conf[q]||0,rate=t?Math.round(c/t*100):0;return `<tr><td>${q}</td><td>${t}건</td><td>${c}건</td><td><span class="awAdvRate ${rate>=100?'good':rate>=50?'mid':''}">${t?rate+'%':'—'}</span></td></tr>`}).join('');
  const catRows=CATS.map((c,i)=>`<tr><td>${i+1}</td><td>${esc(c)}</td></tr>`).join('');
  host.insertAdjacentHTML('beforeend',`
  <div class="mrOverview">
    <div class="mrStat mr-c1"><span>👥 등록된 생산팀</span><b>${data.length}개</b></div>
    <div class="mrStat mr-c2"><span>✅ 팀장 지정 완료</span><b>${withLeader}/${data.length}</b></div>
    <div class="mrStat mr-c3"><span>✉️ 이메일 등록 완료</span><b>${withEmail}/${data.length}</b></div>
    <div class="mrStat mr-c4"><span>📊 인원 Master</span><b>${pp.people?pp.people+'명 연결됨':'미연결'}</b></div>
  </div>
  <div class="awGrid">
    ${`<div class="awCard mrCard mr-c1"><div class="awHead">👥 생산팀 · 팀장 · 이메일 (표시순서 기준)</div><div class="awBody"><table class="awTable"><thead><tr><th>#</th><th>생산팀</th><th>팀장</th><th>이메일</th></tr></thead><tbody>${rows}</tbody></table></div></div>`}
    ${`<div class="awCard mrCard mr-c2"><div class="awHead">📈 5S 개선활동 목표 (분기, 인당 개선건수 기준) · 활동유형</div><div class="awBody">
      <p class="awHint" style="margin:0 0 10px">팀마다 인원 규모가 달라 총 활동건수는 팀 간 비교에 의미가 없습니다. 인당 개선건수(활동건수 ÷ 인원)만 목표·달성률 기준으로 사용합니다.${pp.people?` 현재 인원 Master 기준 총 ${pp.people}명.`:' 인원 Master가 아직 연결되지 않아 실제 인당 값은 — 로 표시됩니다.'}</p>
      <table class="awTable"><thead><tr><th>분기</th><th>목표(건/인)</th><th>실제(건/인)</th><th>달성률</th></tr></thead><tbody>${ppRows}</tbody></table>
      <table class="awTable" style="margin-top:10px"><thead><tr><th>#</th><th>5S 활동유형</th></tr></thead><tbody>${catRows}</tbody></table>
    </div></div>`}
  </div>
  <div class="awCard mrCard mr-gold" style="margin-top:12px"><div class="awHead">🏆 5S 고도화 확정 목표 (분기, 3대 기준 충족 사례 기준 · 절대 건수)</div><div class="awBody">
    <p class="awHint" style="margin:0 0 10px">고도화 확정은 시각화·형적관리 / 인간공학적 Green Zone / 정량축소·정위치 변경 3대 기준을 모두 충족해야 하는 난이도 높은 절차이며, 위 개선활동 목표와 달리 인원 규모와 무관하게 절대 건수로 관리합니다.</p>
    <table class="awTable"><thead><tr><th>분기</th><th>확정 목표</th><th>실제 확정</th><th>달성률</th></tr></thead><tbody>${advRows}</tbody></table>
  </div></div>
  <p class="awHint" style="margin-top:10px">팀 표시순서·목표·팀장 정보 수정은 상단 <b>⚙ 통합기준정보</b> 버튼에서 진행합니다. 이 화면은 현재 설정값의 조회·추출용입니다.</p>`);
  return true;
}
function boot(){css();let n=0;const run=()=>{if(render())return;if(++n<50)setTimeout(run,150)};run();['hd20-team-master-updated'].forEach(ev=>window.addEventListener(ev,()=>{const h=document.getElementById('awRegister');if(h){h.dataset.registerFilled='';[...h.querySelectorAll('.awGrid,.awHint,.awCard')].forEach(x=>x.remove());render()}}))}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
