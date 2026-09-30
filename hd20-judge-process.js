/* '심사 프로세스' 서브탭: 등록된 5S 활동이 고도화 후보→판정→확정에 이르기까지 단계별로 몇 건씩 있는지
   하나의 흐름으로 보여줌. 활동관리 KPI 카드(41dec5d)와 같은 정의(candidate/judgeState 기준)를 재사용.
   읽기 전용: HD20KPIData.snapshot(). 다른 서브탭(후보 목록·3조건 분석 등) 콘텐츠는 건드리지 않고,
   .app[data-hd-view="advancement.process"]일 때만 이 화면을 보이고 나머지를 숨김. */
(()=>{'use strict';
const ID='hd20JudgeProcess';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function css(){if(document.getElementById(ID+'Style'))return;const s=document.createElement('style');s.id=ID+'Style';s.textContent=`
#${ID}{display:none;background:#fff;border:1px solid #dfe6ec;border-radius:14px;padding:18px 20px;margin:0 0 14px;box-shadow:0 1px 3px rgba(20,48,76,.06)}
.app[data-hd-view="advancement.process"] #${ID}{display:block}
.app[data-hd-view="advancement.process"] #performanceConversionAnalysis,.app[data-hd-view="advancement.process"] #awWorkplace{display:none!important}
#${ID} h2{margin:2px 0 4px;font-size:21px;color:#14304c}#${ID} .jpNote{margin:0 0 14px;font-size:13px;font-weight:800;color:#22303f}
#${ID} .jpFlow{display:flex;align-items:stretch;gap:0;overflow-x:auto;padding-bottom:6px}
#${ID} .jpStage{flex:0 0 auto;min-width:150px;border:1px solid #e3eaf0;border-radius:12px;padding:14px 14px 12px;background:#fbfcfd;position:relative}
#${ID} .jpStage b.n{display:block;font-size:28px;color:#14304c;letter-spacing:-.02em}
#${ID} .jpStage .lbl{font-size:12.5px;font-weight:850;color:#3b5163;margin-bottom:6px;display:block}
#${ID} .jpStage .pct{font-size:11.5px;color:#7a8a97;font-weight:800}
#${ID} .jpArrow{flex:0 0 auto;width:46px;display:flex;align-items:center;justify-content:center;color:#a9bacb;font-size:20px}
#${ID} .jpStage.warn{border-color:#f0dfae;background:#fdf9ee}#${ID} .jpStage.warn b.n{color:#a86a10}
#${ID} .jpStage.ok{border-color:#c9e3d1;background:#f3fbf5}#${ID} .jpStage.ok b.n{color:#2f7a4d}
#${ID} .jpSplit{display:flex;gap:8px;margin-top:8px}#${ID} .jpSplit div{flex:1;border-top:1px dashed #e3eaf0;padding-top:6px;font-size:11px;color:#5c6b7a}#${ID} .jpSplit b{display:block;font-size:15px;color:#22303f}
#${ID} .jpTeamWrap{margin-top:16px;border:1px solid #e3eaf0;border-radius:10px;overflow:hidden}
#${ID} .jpTeamHead{padding:9px 12px;background:#f1f5f8;font-size:13px;font-weight:900;color:#22303f;border-bottom:1px solid #e3eaf0}
#${ID} table{width:100%;border-collapse:collapse;font-size:13px}#${ID} th{background:#f8fafb;color:#5c6b7a;font-size:11.5px;padding:7px 9px;text-align:center}
#${ID} td{padding:7px 9px;border-top:1px solid #edf1f4;text-align:center;color:#22303f}#${ID} td:first-child{text-align:left;font-weight:800}
#${ID} .jpBadge{border-radius:999px;padding:2px 9px;font-size:11px;font-weight:850;background:#f1f3f5;color:#5c6b7a}
#${ID} .jpBadge.warn{background:#fdf3e3;color:#a86a10}
#${ID} .jpFoot{margin:12px 2px 0;font-size:12px;color:#7a8a97}
@media(max-width:760px){#${ID} .jpFlow{flex-wrap:nowrap}}`;document.head.appendChild(s)}
function data(){
  const K=window.HD20KPIData,snap=K?.snapshot?.()||{},rows=snap.rows||[],M=window.HD20ProductionTeamMaster,teams=M?.teamNames?.()||[];
  const isType=r=>{const v=String(r.type||'').trim();return v==='5S 고도화'||v==='고도화'};
  const isCandidate=r=>window.HD20KPIData?.isCandidate?.(r) ?? (!!isType(r)&&(r.candidate===true||r.isCandidate===true||(()=>{const s=String(r.judgeState||r.status||'').trim();return !!s&&s!=='미확정'&&/판정대기|보완요청|확정|후보|검토/.test(s)})()));
  const isConfirmed=r=>window.HD20KPIData?.isConfirmed?.(r) ?? (!!r&&isType(r)&&r.confirmed===true&&String(r.judgeState||'').trim()==='확정');
  const all=rows.length,candidates=rows.filter(isCandidate),confirmed=rows.filter(isConfirmed);
  const js=r=>String(r.judgeState||r.status||'').trim();
  const pending=candidates.filter(r=>!isConfirmed(r)&&/판정대기|미확정/.test(js(r))),review=candidates.filter(r=>!isConfirmed(r)&&/검토중|후보/.test(js(r))),supplement=candidates.filter(r=>!isConfirmed(r)&&/보완요청/.test(js(r)));
  const accounted=new Set([...pending,...review,...supplement,...confirmed]);
  const other=candidates.filter(r=>!accounted.has(r));
  const notCandidate=rows.filter(r=>!isCandidate(r));
  const maintained=new Set((snap.maintained||[]).map(r=>r.id));
  const keep=confirmed.filter(r=>maintained.has(r.id)).length;
  return{all,candidates,confirmed,pending,review,supplement,other,notCandidate,keep,teams,rows,isCandidate,isConfirmed};
}
function render(box){
  const D=data();if(!D.all)return;
  const pct=(n,d)=>d?Math.round(n/d*1000)/10:0;
  const stages=[
    {lbl:'전체 활동 등록',n:D.all,cls:''},
    {lbl:'고도화 후보 지정',n:D.candidates.length,cls:'',pct:pct(D.candidates.length,D.all)},
    {lbl:'판정 진행 중',n:D.pending.length+D.review.length+D.supplement.length+D.other.length,cls:'warn',pct:pct(D.pending.length+D.review.length+D.supplement.length+D.other.length,D.candidates.length)},
    {lbl:'고도화 확정',n:D.confirmed.length,cls:'ok',pct:pct(D.confirmed.length,D.candidates.length)},
  ];
  const flow=stages.map((s,i)=>`<div class="jpStage ${s.cls}"><span class="lbl">${esc(s.lbl)}</span><b class="n">${s.n}건</b>${s.pct!==undefined?`<span class="pct">${i>=2?'후보':'전체'} 대비 ${s.pct}%</span>`:''}${i===2?`<div class="jpSplit"><div><b>${D.pending.length}</b>판정대기</div><div><b>${D.review.length}</b>검토중·후보</div><div><b>${D.supplement.length}</b>보완요청</div></div>`:''}</div>${i<stages.length-1?'<div class="jpArrow">→</div>':''}`).join('');
  const teamRows=D.teams.map(t=>{
    const c=D.candidates.filter(r=>r.team===t),cf=D.confirmed.filter(r=>r.team===t),pend=D.pending.filter(r=>r.team===t).length,rev=D.review.filter(r=>r.team===t).length,sup=D.supplement.filter(r=>r.team===t).length;
    return{team:t,candidate:c.length,pend,rev,sup,confirmed:cf.length}}).filter(r=>r.candidate>0);
  const order=(()=>{try{const v=JSON.parse(localStorage.getItem('gmes5s_team_display_order')||'null');if(Array.isArray(v)&&v.length)return v}catch{}return D.teams})();
  teamRows.sort((a,b)=>order.indexOf(a.team)-order.indexOf(b.team));
  const rowsHtml=teamRows.map(r=>{const stuck=r.pend+r.rev+r.sup;return `<tr><td>${esc(r.team)}</td><td>${r.candidate}</td><td>${r.confirmed}</td><td>${stuck?`<span class="jpBadge warn">${stuck}건</span>`:'<span class="jpBadge">0건</span>'}</td></tr>`}).join('')||'<tr><td colspan="4" style="color:#8a99a6">고도화 후보로 지정된 팀이 없습니다.</td></tr>';
  box.innerHTML=`<h2>고도화 심사 프로세스</h2><p class="jpNote">등록된 5S 활동이 고도화 후보 → 판정 진행 → 확정에 이르기까지 각 단계에 몇 건씩 있는지 봅니다. 특정 단계에 건수가 쌓여 있으면(정체) 그 단계 담당자에게 처리를 요청하세요.</p>
  <div class="jpFlow">${flow}</div>
  <div class="jpTeamWrap"><div class="jpTeamHead">팀별 심사 진행 현황 (후보로 지정된 팀만 표시)</div><table><thead><tr><th>생산팀</th><th>고도화 후보</th><th>확정</th><th>판정 진행 중(정체 후보)</th></tr></thead><tbody>${rowsHtml}</tbody></table></div>
  <p class="jpFoot">※ 판정 진행 중 = 후보 중 아직 확정되지 않은 건(판정대기·검토중·보완요청). 확정 기준은 활동관리 KPI 카드(고도화 후보 지정·고도화 판정대기·고도화 확정)와 동일합니다. 현재 확정 ${D.confirmed.length}곳 중 유지 중 ${D.keep}곳입니다.</p>`;
}
function ensure(){
  const host=document.getElementById('performanceConversionAnalysis')||document.getElementById('awWorkplace');
  if(!host||!window.HD20KPIData?.snapshot||!window.HD20ProductionTeamMaster)return false;
  css();let box=document.getElementById(ID);if(!box){box=document.createElement('section');box.id=ID;host.insertAdjacentElement('beforebegin',box)}
  render(box);return true}
let tries=0;(function boot(){if(!ensure()&&tries++<80)setTimeout(boot,150)})();
document.addEventListener('click',e=>{if(e.target.closest?.('.hd20Subnav button')){setTimeout(()=>{const b=document.getElementById(ID);if(b)render(b)},80)}},true);
['hd20-kpi-source-updated','hd20-gmes-5s-imported','hd20-gmes-5s-judged','hd20-policy-updated'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(()=>{const b=document.getElementById(ID);if(b)render(b);else ensure()},80)));
})();
