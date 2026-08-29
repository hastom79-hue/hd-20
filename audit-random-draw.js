(()=>{'use strict';
/* ⑤ Audit 관리: 랜덤 Audit 대상 추첨. 감사 대상 팀을 사전에 정해두면
 * 미리 대비할 수 있어 실효성이 떨어지므로, 클릭 한 번으로 16개 생산팀 중
 * 하나를 무작위로 뽑고 즉시 해당 팀장에게 알림을 보낸다. 최근 추첨된
 * 팀은 일정 기간 제외해 특정 팀만 반복 추첨되지 않도록 한다. */
const STYLE='auditRandomDrawStyle';
const DRAW_KEY='hd20AuditRandomDrawsV1';
const TEAM_KEY='hd20TeamLeaderMasterV1';
const TEAMS=['대형메인팀','휠로더Front팀','대형Att.팀','휠로더리어팀','중형상부1팀','중형메인팀','중형Att팀','대형상부팀','프레임제작팀','휠로더메인팀','중형상부2팀','중형하부팀','Boom제작팀','초대형조립팀','성능팀','트러블슈팅팀'];
const EXCLUDE_RECENT=4; // 최근 N회 추첨된 팀은 이번 추첨 대상에서 제외

function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function loadDraws(){try{const v=JSON.parse(localStorage.getItem(DRAW_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function saveDraws(v){localStorage.setItem(DRAW_KEY,JSON.stringify(v))}
function leaders(){try{const v=JSON.parse(localStorage.getItem(TEAM_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function leaderFor(team){return leaders().find(x=>x.team===team)||{team,leader:'미지정',email:''}}

function pickTeam(){
  const draws=loadDraws();
  const recent=new Set(draws.slice(0,EXCLUDE_RECENT).map(d=>d.team));
  let pool=TEAMS.filter(t=>!recent.has(t));
  if(!pool.length)pool=[...TEAMS]; // 전체 팀이 다 최근 추첨 대상이면(팀 수가 적을 때) 제한 해제
  return pool[Math.floor(Math.random()*pool.length)];
}

function mailFields(team,x){
  const subject=`[5S Audit 안내] ${team} 랜덤 점검 대상 선정`;
  const body=`${x.leader||'팀장'}님,\n\n5S 정기 Audit 랜덤 추첨 결과 ${team}이(가) 이번 점검 대상으로 선정되었습니다.\n\n- 선정일시: ${new Date().toLocaleString('ko-KR')}\n- 점검 방식: 사전 예고 없는 랜덤 추첨 (공정성을 위해 특정 팀에 편중되지 않도록 운영)\n\n담당자 안내에 따라 점검 일정에 협조해 주시기 바랍니다.\n\n울산캠퍼스 5S 활동관리 시스템`;
  return{subject,body};
}
function openMail(team,x){if(!x.email)return alert('해당 팀장의 실제 이메일이 기준정보에 등록되지 않았습니다.');const{subject,body}=mailFields(team,x);location.href=`mailto:${encodeURIComponent(x.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
function openOutlookWeb(team,x){if(!x.email)return alert('해당 팀장의 실제 이메일이 기준정보에 등록되지 않았습니다.');const{subject,body}=mailFields(team,x);window.open(`https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(x.email)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,'_blank','noopener')}
async function sendAutoMail(team,x,btn,draw){
  if(!x.email)return alert('해당 팀장의 실제 이메일이 기준정보에 등록되지 않았습니다.');
  const cfg=window.HD20_EMAILJS_CONFIG;
  if(!window.emailjs||!cfg)return alert('메일 자동발송 모듈을 아직 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
  const{subject,body}=mailFields(team,x);
  if(!confirm(`${x.email} 주소로 실제 메일을 지금 바로 발송합니다.\n\n제목: ${subject}\n\n계속할까요?`))return;
  const original=btn?btn.textContent:'';
  if(btn){btn.disabled=true;btn.textContent='발송 중…'}
  try{
    await emailjs.send(cfg.serviceId,cfg.templateId,{to_email:x.email,subject,message:body,name:'5S 활동관리 시스템'});
    if(btn){btn.textContent='✓ 발송완료';btn.classList.add('sent')}
    if(draw){draw.notifiedAt=new Date().toISOString();draw.notifyMethod='auto';const all=loadDraws();const idx=all.findIndex(d=>d.id===draw.id);if(idx>-1){all[idx]=draw;saveDraws(all)}renderHistory(document.getElementById('awAudit'))}
  }catch(err){
    console.error('[EmailJS] send failed',err);
    alert('메일 발송에 실패했습니다: '+(err?.text||err?.message||'알 수 없는 오류'));
    if(btn){btn.disabled=false;btn.textContent=original}
  }
}

function css(){
  if(document.getElementById(STYLE))return;
  const s=document.createElement('style');s.id=STYLE;
  s.textContent=`
.auditDraw{margin:12px 0}
.auditDrawBody{display:flex;flex-wrap:wrap;gap:16px;align-items:center}
.auditDrawResult{flex:1;min-width:220px}
.auditDrawResult .team{font-size:22px;font-weight:950;color:#123e5d}
.auditDrawResult .leader{margin-top:4px;font-size:11px;color:#5f7c92}
.auditDrawEmpty{color:#8a99a6;font-size:11px}
.auditDrawBtns{display:flex;gap:7px;flex-wrap:wrap}
.auditDrawBtns button{border:1px solid #c8d9e5;border-radius:8px;background:#fff;padding:9px 13px;font-size:11px;font-weight:900;cursor:pointer}
.auditDrawBtns .primary{background:#1268a8;color:#fff;border-color:#1268a8}
.auditDrawBtns .outlook{background:#0f6cbd;color:#fff;border-color:#0f6cbd}
.auditDrawBtns .auto{background:#7a5af8;color:#fff;border-color:#7a5af8}
.auditDrawBtns .auto:disabled{opacity:.6;cursor:wait}
.auditDrawBtns .auto.sent{background:#27ae60;border-color:#27ae60}
.auditDrawHint{margin-top:9px;padding:9px 11px;background:#eef7fd;border-radius:8px;font-size:10px;color:#43677f}
.auditDrawHistory{margin-top:12px;font-size:11px}
.auditDrawHistory table{width:100%;border-collapse:collapse}
.auditDrawHistory th{text-align:left;padding:7px;background:#edf4f8}
.auditDrawHistory td{padding:7px;border-top:1px solid #e4ebf0}
.auditDrawNotified{color:#2e7c43;font-weight:900}
.auditDrawPending{color:#a36a00;font-weight:900}
`;
  document.head.appendChild(s);
}

function renderResult(host,draw){
  const box=host.querySelector('.auditDrawResult');
  if(!draw){box.innerHTML='<div class="auditDrawEmpty">아직 추첨하지 않았습니다. "추첨하기"를 눌러 이번 점검 대상을 무작위로 선정하세요.</div>';return}
  const x=leaderFor(draw.team);
  box.innerHTML=`<div class="team">🎯 ${esc(draw.team)}</div><div class="leader">팀장 ${esc(x.leader||'미지정')} · ${esc(x.email||'이메일 미등록')} · ${esc(new Date(draw.date).toLocaleString('ko-KR'))} 추첨</div>`;
}

function renderHistory(host){
  const wrap=host.querySelector('.auditDrawHistory');
  const draws=loadDraws().slice(0,10);
  wrap.innerHTML=`<table><thead><tr><th>추첨일시</th><th>선정팀</th><th>팀장</th><th>알림 상태</th></tr></thead><tbody>${draws.length?draws.map(d=>{const x=leaderFor(d.team);return `<tr><td>${esc(new Date(d.date).toLocaleString('ko-KR'))}</td><td>${esc(d.team)}</td><td>${esc(x.leader||'미지정')}</td><td>${d.notifiedAt?`<span class="auditDrawNotified">✓ 발송(${d.notifyMethod||'-'})</span>`:'<span class="auditDrawPending">미발송</span>'}</td></tr>`}).join(''):'<tr><td colspan="4" style="text-align:center;color:#8a99a6">추첨 이력이 없습니다.</td></tr>'}</tbody></table>`;
}

function render(){
  const a=document.getElementById('awAudit');
  if(!a)return false;
  let host=a.querySelector('.auditDraw');
  if(!host){
    host=document.createElement('div');
    host.className='awCard auditDraw';
    host.innerHTML=`<div class="awHead">랜덤 Audit 대상 추첨</div><div class="awBody">
      <div class="auditDrawBody">
        <div class="auditDrawResult"></div>
        <div class="auditDrawBtns">
          <button type="button" class="primary" data-draw="pick">🎲 추첨하기</button>
          <button type="button" class="outlook" data-draw="mail" disabled>메일</button>
          <button type="button" class="outlook" data-draw="outlook" disabled>Outlook</button>
          <button type="button" class="auto" data-draw="auto" disabled>⚡자동발송</button>
        </div>
      </div>
      <div class="auditDrawHint">사전 예고 없이 공정하게 대상을 정하기 위해 랜덤으로 추첨합니다. 최근 ${EXCLUDE_RECENT}회 이내 추첨된 팀은 이번 추첨에서 제외됩니다.</div>
      <div class="auditDrawHistory"></div>
    </div>`;
    const auditHero=a.querySelector('.awHero');
    (auditHero||a.firstElementChild).insertAdjacentElement('afterend',host);
  }
  let current=null;
  const btns={
    mail:host.querySelector('[data-draw="mail"]'),
    outlook:host.querySelector('[data-draw="outlook"]'),
    auto:host.querySelector('[data-draw="auto"]')
  };
  function setEnabled(on){Object.values(btns).forEach(b=>{b.disabled=!on;if(!on){b.classList.remove('sent');b.textContent=b.dataset.draw==='mail'?'메일':b.dataset.draw==='outlook'?'Outlook':'⚡자동발송'}})}
  host.querySelector('[data-draw="pick"]').onclick=()=>{
    const team=pickTeam();
    const draw={id:'DRAW-'+Date.now(),date:new Date().toISOString(),team,notifiedAt:null,notifyMethod:null};
    const all=loadDraws();all.unshift(draw);saveDraws(all);
    current=draw;
    renderResult(host,draw);
    renderHistory(host);
    setEnabled(true);
  };
  btns.mail.onclick=()=>{if(current)openMail(current.team,leaderFor(current.team))};
  btns.outlook.onclick=()=>{if(current)openOutlookWeb(current.team,leaderFor(current.team))};
  btns.auto.onclick=()=>{if(current)sendAutoMail(current.team,leaderFor(current.team),btns.auto,current)};
  renderResult(host,loadDraws()[0]||null);
  renderHistory(host);
  return true;
}

function boot(){css();let n=0;const run=()=>{if(render())return;if(++n<50)setTimeout(run,150)};run()}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
