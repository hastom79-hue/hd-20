(()=>{'use strict';
function criteriaPanel(prefix){return '<div class="wide hd20DirectCriteria"><strong>5S 고도화 3대 요건 · 즉시 판정</strong><span>3대 요건의 정의와 사진 가이드를 확인하여 각 요건의 충족 여부를 선택합니다. 1개 이상 충족 시 고도화 충족, 0개면 미충족입니다.</span><div class="hd20CriteriaGuideOnly"><button type="button" class="hd20GuideOpen hd20GuideOpenUnified" data-hd20-photo-guide="0">평가자료 · 사진 가이드 상세 보기</button></div><div class="hd20CriteriaChecks"><label><input type="checkbox" id="'+prefix+'CriteriaVisual">① 시각화를 통한 찾는 낭비의 삭제(형적관리 등) 요건 충족</label><label><input type="checkbox" id="'+prefix+'CriteriaGreen">② 인간공학적 그린존 적용을 통한 안전 및 동선의 최소화 요건 충족</label><label><input type="checkbox" id="'+prefix+'CriteriaSpace">③ 정량축소/정위치 변경을 통한 공간 활용 확장 요건 충족</label></div><output id="'+prefix+'CriteriaResult" aria-live="polite">미충족 (0/3)</output><label class="hd20FinalAdoptionRow" id="'+prefix+'FinalAdoptionRow" hidden><input type="checkbox" id="'+prefix+'FinalAdopted" disabled><span><b>고도화 최종 채택</b><small>마스터관리자 전용 · 3대 요건 1개 이상 충족 시 선택 가능 · 요건 충족만으로 자동 채택되지 않습니다.</small></span></label></div>'}
const STYLE='actionMailWorkflowStyle',CASE_KEY='hd20ActionCasesV2',TEAM_KEY='hd20TeamLeaderMasterV1';
const TEAMS=()=>window.HD20ProductionTeamMaster?.teamNames?.()||[];
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
/* 사용자 지시: "작업장과 세부위치, 등록자 등 정보는 기준정보와 연동되어 등록자가 편의성을 갖도록" —
   자율개선 등록(activity-workflow.js)과 동일하게 "④ 업무/팩터"에 저장된 작업장·세부위치 목록을
   드롭다운으로 제공(자유 텍스트였던 "작업장"을 드롭다운으로 전환). */
const FACTOR_FALLBACK={작업장:['조립라인 A','조립라인 B','용접라인','도장라인','자재창고','출하장'],세부위치:['1구역','2구역','3구역','통로','작업대','보관랙'],우선순위:['긴급','높음','보통','낮음'],리스크:['높음','중간','낮음','미평가']};
function factorListAm(key){if(key==='작업장'&&window.HD20WorkplaceMaster)return window.HD20WorkplaceMaster.values();try{const f=JSON.parse(localStorage.getItem('gmes5s_work_factor_master_v1')||'null');const v=f&&f[key];if(Array.isArray(v)&&v.length)return v}catch{}return FACTOR_FALLBACK[key]||[]}
function factorOptions(key){return '<option value="">선택</option>'+factorListAm(key).map(x=>`<option>${esc(x)}</option>`).join('')}
/* 사용자 지시 정정: "개선요청등록자는 박진규상무, 5S모듈리더, 생산혁신팀" — 처음엔 ①조직/팀 팀장
   19명 전체를 옵션으로 제공했으나, 개선요청은 "3개 요청그룹(리더십·5S모듈·생산혁신팀)"으로부터
   현장팀에 등록되는 구조이므로 등록자도 19명이 아니라 이 3개 그룹을 대표하는 3개 선택지로 한정하는
   것이 맞음(③ 요청그룹과 의미상 1:1 대응: 리더십(공장장)→박진규상무, 5S모듈→5S모듈리더,
   생산혁신팀(HDPS파트)→생산혁신팀). 목록에 없는 경우를 위한 "직접입력" 옵션은 유지. */
function ownerNameList(){return['박진규상무','5S모듈리더','생산혁신팀','생산기술팀장','자재운영팀장','생산운영팀장','조립1팀장','조립2팀장']}
function ownerOptions(){return '<option value="">선택</option>'+ownerNameList().map(x=>`<option>${esc(x)}</option>`).join('')+'<option value="__other__">직접입력…</option>'}
/* 통합기준정보 "④ 업무/팩터" 저장 시 쏘는 이벤트를 받아 "개선요청 등록" 폼이 열려 있을 때도 작업장·
   세부위치 드롭다운이 실시간으로 갱신되도록 함(activity-workflow.js와 동일한 패턴). */
window.addEventListener('hd20-master-factors-updated',()=>{
  const wSel=document.getElementById('amWorkplace'),sSel=document.getElementById('amSpot'),pSel=document.getElementById('amPriority');
  if(wSel){const cur=wSel.value;wSel.innerHTML=factorOptions('작업장');if(cur&&!([...wSel.options].some(o=>o.value===cur)))wSel.add(new Option(cur+' (기존 입력값)',cur));if(cur)wSel.value=cur}
  if(sSel){const cur=sSel.value;sSel.innerHTML=factorOptions('세부위치');if(cur&&!([...sSel.options].some(o=>o.value===cur)))sSel.add(new Option(cur+' (기존 입력값)',cur));if(cur)sSel.value=cur}
  if(pSel){const cur=pSel.value;pSel.innerHTML=factorOptions('우선순위');if(cur&&!([...pSel.options].some(o=>o.value===cur)))pSel.add(new Option(cur+' (기존 입력값)',cur));if(cur)pSel.value=cur}
});
/* 등록자 드롭다운 소스(① 조직/팀 팀장 명단·운영정책 리더십 명단)가 바뀌면(두 곳 모두 저장 시
   hd20-policy-updated를 쏨) 즉시 반영되도록 함. */
window.addEventListener('hd20-policy-updated',()=>{
  const oSel=document.getElementById('amOwnerSel');
  if(oSel){const cur=oSel.value;oSel.innerHTML=ownerOptions();if([...oSel.options].some(o=>o.value===cur))oSel.value=cur}
});
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function teams(){try{const v=JSON.parse(localStorage.getItem(TEAM_KEY)||'[]');return Array.isArray(v)&&v.length?v:TEAMS().map(team=>({team,leader:'미지정',email:''}))}catch{return TEAMS().map(team=>({team,leader:'미지정',email:''}))}}
function saveTeams(v){localStorage.setItem(TEAM_KEY,JSON.stringify(v))}
function cases(){try{const v=JSON.parse(localStorage.getItem(CASE_KEY)||'[]');return Array.isArray(v)?v.map(x=>window.HD20WorkplaceMaster?.annotate(x)||x):[]}catch{return[]}}
function saveCases(v){localStorage.setItem(CASE_KEY,JSON.stringify(v))}
function leaderFor(team){return teams().find(x=>x.team===team)||{team,leader:'미지정',email:''}}
function newId(){return'IMP-'+new Date().toISOString().slice(0,10).replace(/-/g,'')+'-'+String(cases().length+1).padStart(3,'0')}
function css(){if(document.getElementById(STYLE))return;const s=document.createElement('style');s.id=STYLE;s.textContent=`.amHeroNote{margin:10px 0;padding:10px 12px;border:1px solid #d8e8f3;border-radius:9px;background:#eef7fd;color:#40667f;font-size:14.5px}.amGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.amSummary{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0}.amSummary div{padding:11px;border:1px solid #dce6ed;border-top:3px solid #2f80ed;border-radius:10px;background:#f8fbfd}.amSummary div:nth-child(2){border-top-color:#27ae60}.amSummary div:nth-child(3){border-top-color:#f2a93b}.amSummary div:nth-child(4){border-top-color:#e45757}.amSummary small{display:block;color:#718697;font-size:13.5px}.amSummary b{font-size:21.5px;color:#123e5d}.amHead2{margin:16px 0 8px;padding-top:14px;border-top:1px solid #eaeff3;font-size:15px;font-weight:900;color:#173a57}.amRecentList .row{display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-top:1px solid #f0f3f6;font-size:14px;color:#375166}.amRecentList .row:first-child{border-top:0}.amRecentList .row b{font-weight:900;color:#173a57}.amRecentList .row small{color:#8798a6}.amCard{border:1px solid #d7e3ec;border-radius:12px;background:#fff;overflow:hidden}.amHead{padding:12px 14px;background:#f7fafc;border-bottom:1px solid #e1e9ef;font-weight:950;color:#123b59}.amBody{padding:14px}.amForm{display:grid;grid-template-columns:1fr 1fr;gap:10px}.amForm label{font-size:14.5px;font-weight:900;color:#3e5c72}.amForm input,.amForm select,.amForm textarea{width:100%;box-sizing:border-box;margin-top:5px;border:1px solid #c9d9e4;border-radius:8px;padding:9px}.amForm textarea{min-height:84px}.amForm .wide{grid-column:1/-1}.amRead{background:#f3f7fa!important;color:#536d80}.amPhoto{display:grid;grid-template-columns:1fr 1fr;gap:9px}.amDrop{position:relative;min-height:105px;border:1.5px dashed #adc7d9;border-radius:9px;background:#f7fbfe;display:grid;place-items:center;text-align:center;overflow:hidden;color:#648096;font-size:13.5px}.amDrop img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.amDrop input{position:absolute;inset:0;opacity:0;cursor:pointer}.amActions{display:flex;justify-content:flex-end;align-items:center;gap:8px;margin-top:10px;flex-wrap:wrap}.amSendMethod{display:flex;flex-direction:column;gap:3px;font-size:12px;color:#5c7489;font-weight:700}.amSendMethod select{padding:7px 8px;border:1px solid #c8d9e5;border-radius:8px;font-size:13px;min-width:150px}@media(max-width:480px){.amActions{justify-content:stretch}.amActions #amDraft,.amActions .amSendMethod,.amActions #amRegister{flex:1 1 100%}.amSendMethod select{width:100%}}.amBtn{border:1px solid #c8d9e5;border-radius:8px;background:#fff;padding:8px 11px;font-size:14.5px;font-weight:900;color:#244d69;cursor:pointer}.amBtn.primary{background:#1268a8;color:#fff}.amBtn.green{background:#2e8b4b;color:#fff}.amBtn.outlook{background:#0f6cbd;color:#fff;border-color:#0f6cbd}.amBtn.auto{background:#7a5af8;color:#fff;border-color:#7a5af8}.amBtn.auto:disabled{opacity:.6;cursor:wait}.amBtn.auto.sent{background:#27ae60;border-color:#27ae60}.amMailBtns{display:flex;gap:5px;flex-wrap:wrap}.amMailBtns .amBtn{padding:6px 8px;font-size:13px;white-space:nowrap}.amCasesScroll{overflow:auto}.amCases,.amMaster table{width:100%;min-width:560px;border-collapse:collapse;font-size:14px;white-space:nowrap}.amCases th,.amMaster th{padding:8px;background:#edf4f8;text-align:left}.amCases td,.amMaster td{padding:8px;border-top:1px solid #e5ebef}.amCaseLink{color:#1268a8;font-weight:950;cursor:pointer;text-decoration:underline}.amPill{display:inline-block;padding:3px 7px;border-radius:12px;background:#fff0d9;color:#9b6500;font-weight:950}.amPill.done{background:#e2f3e7;color:#287844}.amResponse{display:none;margin-top:12px}.amResponse.on{display:block}.amInfo{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:10px}.amInfo div{padding:9px;border:1px solid #dce6ed;border-radius:8px;background:#f9fbfc}.amInfo small{display:block;color:#708697}.amInfo b{display:block;margin-top:3px;color:#143d5b}.amFilterBar{display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;padding:10px 12px;margin-bottom:10px;background:#f4f7f9;border:1px solid #e3eaf0;border-radius:9px}.amFilterBar label{display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:850;color:#3b5163}.amFilterBar select,.amFilterBar input{height:30px;border:1px solid #cfd9e2;border-radius:6px;background:#fff;padding:0 7px;font-size:12.5px;color:#22303f}.amFilterBar .amBtn{height:30px;padding:0 12px;font-size:12.5px}.amFilterCount{margin-left:auto;font-size:12px;color:#5c6b7a;font-weight:800}.amMaster{margin-top:12px}.amMaster input{width:100%;box-sizing:border-box;border:1px solid #cbdbe5;border-radius:6px;padding:6px}.amBackendNote{margin-top:9px;padding:9px 11px;border-radius:8px;background:#fff7e8;border:1px solid #f0d59f;color:#815d18;font-size:13.5px}@media(max-width:1000px){.amGrid{grid-template-columns:1fr}.amForm{grid-template-columns:1fr}.amForm .wide{grid-column:auto}}.amEvidenceDetail{margin-top:14px;padding:13px;border:1px solid #dce6ed;border-radius:9px;background:#f8fbfd}.amEvidenceDetail h3{font-size:14px;font-weight:850;margin:0 0 10px;color:#254d66}.amEvidenceGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px}.amEvidenceGrid figure{margin:0;padding:7px;border:1px solid #dae5ec;background:#fff;border-radius:8px}.amEvidenceGrid img{width:100%;height:155px;object-fit:contain;background:#f1f4f7;border-radius:5px}.amEvidenceGrid figcaption{font-size:12px;color:#4f7085;margin-top:6px;text-align:center}.amNoEvidence{margin:11px 0;padding:10px;background:#f7f9fb;border-radius:7px;color:#74879a;font-size:12px}.amEffectCheck{margin-top:14px;padding:14px;border:1px solid #dce7ef;border-radius:10px;background:#fbfdff}.amEffectFields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.amEffectFields label{display:flex;flex-direction:column;gap:6px;color:#3e637b;font-size:12px;font-weight:750}.amEffectFields label:last-child{grid-column:1/-1}.amEffectFields select,.amEffectFields textarea{padding:9px;border:1px solid #c9d9e5;border-radius:7px;min-width:0;font:inherit}.amEffectHint{font-size:11px;color:#718899;line-height:1.5}@media(max-width:640px){.amEffectFields{grid-template-columns:1fr}}`;document.head.appendChild(s)}
function filePreview(input,img){if(!input||!img)return;input.onchange=()=>{const f=input.files?.[0];if(!f)return;const r=new FileReader();r.onload=e=>{input.dataset.data=e.target.result;img.src=e.target.result;img.hidden=false};r.readAsDataURL(f)}}
function deepLink(id){const u=new URL(location.href);u.searchParams.set('actionId',id);u.hash='action-response';return u.toString()}
function mailFields(c){const subject=`[5S 개선요청] ${c.team} / ${c.workplace} / ${c.id}`,body=`생산팀장님,\n\n다음 발굴 경로에서 개선조치 요청이 등록되었습니다.\n\n- 발굴 출처: ${c.requestSource||'미분류'}\n\n- 요청번호: ${c.id}\n- 작업장: ${c.workplace}\n- 생산팀: ${c.team}\n- 미흡사항: ${c.problem}\n- 조치기한: ${c.due||'-'}\n\n아래 시스템 URL로 접속하여 개선 후 조치사항과 AFTER 사진을 등록해 주세요.\n${deepLink(c.id)}\n\n울산캠퍼스 5S 활동관리 시스템`;return{subject,body}}
/* 사용자 지시: "④ 업무/팩터, ⑤ 메일링이 죽은 설정이니 실제로 연결해라" — "⑤ 메일링" 탭에서 저장한
   참조자(CC)가 지금까지 세 발송 경로(메일 앱/Outlook 웹/자동발송) 어디에도 전혀 반영되지 않고
   있었음. "⑤ 메일링" 7개 슬롯 중 "사용" 체크된 첫 번째 행의 참조자를 공통 CC로 적용 — 7개 슬롯은
   특정 업무유형에 고정 매핑되지 않는 범용 규칙이라, 가장 안전하고 모호하지 않은 연결은 "관리자가
   켜 둔 첫 번째 규칙을 전역 CC 정책으로 쓰는 것"으로 판단. */
function mailingCc(){try{const rows=JSON.parse(localStorage.getItem('gmes5s_mailing_master_v1')||'[]');const r=Array.isArray(rows)?rows.find(x=>x?.enabled&&String(x?.cc||'').trim()):null;return r?String(r.cc).trim():''}catch{return''}}
function openMail(c){if(!c.email){alert('해당 생산팀장의 실제 이메일이 기준정보에 등록되지 않았습니다. 기준정보에서 먼저 등록해 주세요.');return}const{subject,body}=mailFields(c),cc=mailingCc();location.href=`mailto:${encodeURIComponent(c.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`+(cc?`&cc=${encodeURIComponent(cc)}`:'')}
/* Outlook Web compose deep link: opens outlook.office.com (or the desktop
 * app, if the OS has registered it for this URL) with the compose window
 * pre-filled, exactly like the mailto: path -- still requires the user to
 * review and press Send themselves. No Graph API / OAuth is used here:
 * this static site has no backend to hold a client secret, and Microsoft
 * Graph's send-mail API cannot be called safely from client-side JS alone,
 * so real auto-send is out of scope. This is the closest same-safety
 * integration achievable from a GitHub Pages-hosted static app. */
function openOutlookWeb(c){if(!c.email){alert('해당 생산팀장의 실제 이메일이 기준정보에 등록되지 않았습니다. 기준정보에서 먼저 등록해 주세요.');return}const{subject,body}=mailFields(c),cc=mailingCc();const url=`https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(c.email)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`+(cc?`&cc=${encodeURIComponent(cc)}`:'');window.open(url,'_blank','noopener')}
/* 실제 자동발송: EmailJS(사용자가 직접 연결한 Outlook 계정)를 통해 편집
 * 화면 없이 즉시 발송한다. mailto:/Outlook 딥링크와 달리 사용자가 "보내기"를
 * 다시 누를 필요가 없으므로, 실수로 대량발송되는 것을 막기 위해 발송 전
 * 확인창을 반드시 거친다. */
async function sendAutoMail(c,btn){
  if(!c.email){alert('해당 생산팀장의 실제 이메일이 기준정보에 등록되지 않았습니다. 기준정보에서 먼저 등록해 주세요.');return}
  const cfg=window.HD20_EMAILJS_CONFIG;
  if(!window.emailjs||!cfg){alert('메일 자동발송 모듈을 아직 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');return}
  const{subject,body}=mailFields(c);
  if(!confirm(`${c.email} 주소로 실제 메일을 지금 바로 발송합니다.\n\n제목: ${subject}\n\n계속할까요?`))return;
  const original=btn?btn.textContent:'';
  if(btn){btn.disabled=true;btn.textContent='발송 중…'}
  try{
    await emailjs.send(cfg.serviceId,cfg.templateId,{to_email:c.email,cc_email:mailingCc(),subject,message:body,name:'5S 활동관리 시스템'});
    if(btn){btn.textContent='✓ 발송완료';btn.classList.add('sent')}
    else alert(`${c.email} 주소로 메일을 발송했습니다.`);
  }catch(err){
    console.error('[EmailJS] send failed',err);
    alert('메일 발송에 실패했습니다: '+(err?.text||err?.message||'알 수 없는 오류')+'\n\nEmailJS 서비스 연결 상태를 확인해 주세요.');
    if(btn){btn.disabled=false;btn.textContent=original}
  }
}
const F={team:'',status:'',from:'',to:'',text:''};
function filtered(rows){return rows.filter(c=>(!F.team||c.team===F.team)&&(!F.status||(c.status||'조치대기')===F.status)&&(!F.from||String(c.date||'')>=F.from)&&(!F.to||String(c.date||'')<=F.to)&&(!F.text||[c.id,c.team,c.workplace,c.status,c.date,c.dueDate,c.due,c.targetDate,c.problem,c.title,c.action,c.improvement,c.owner,c.inspector].some(v=>String(v??'').toLocaleLowerCase('ko').includes(F.text))))}
const ACTION_RENDER_LIMIT=120;
let actionRenderScheduled=false;
function scheduleActionListRender(){
 if(actionRenderScheduled)return;
 actionRenderScheduled=true;
 requestAnimationFrame(()=>{actionRenderScheduled=false;const a=document.getElementById('awAction');if(a&&window.HD20_NAV?.active?.()==='action')renderCases(a)});
}
function renderCases(a){
 const body=$('#amCaseRows',a);if(!body)return;
 const allCases=cases(),rows=filtered(allCases),shown=rows.slice(0,ACTION_RENDER_LIMIT);
 const cnt=$('#amFilterCount',a);
 if(cnt)cnt.textContent=rows.length+'건 (전체 '+allCases.length+'건)'+(rows.length>ACTION_RENDER_LIMIT?' · 현재 '+ACTION_RENDER_LIMIT+'건 표시, 필터로 추가 조회':'');/* 딥 리서치 전수 검증(UX): "개선요청 현황" 메인 표에 삭제 기능이 전혀 없어, 잘못 등록한 개선요청을
   되돌릴 방법이 없었음. 직접 등록한 건은 newId()가 "IMP-YYYYMMDD-NNN" 형식을 쓰고 가상 데모 데이터는
   "DEMO-X-..." 형식이라 ID 접두사로 안전하게 구분 가능 — IMP- 로 시작하는 행에만 삭제 버튼을 추가. */
/* 통합기준정보 "④ 업무/팩터"의 우선순위를 실제로 보이게 함(색상 배지: 긴급=적색, 높음=주황, 보통/
   낮음=회색). 가상 데이터·기존 등록분에는 아직 값이 없을 수 있어 "—"로 안전하게 폴백. */
const prBadge=p=>{if(!p)return'<span style="color:#9aabb6">—</span>';const c=p==='긴급'?'#c0392b':p==='높음'?'#c97a16':'#60788b';return`<span style="color:${c};font-weight:700">${esc(p)}</span>`};
body.innerHTML=shown.length?shown.map(c=>`<tr><td><span class="amCaseLink" data-id="${esc(c.id)}">${esc(c.id)}</span></td><td>${esc(c.team)}</td><td>${esc(c.workplace)}</td><td>${prBadge(c.priority)}</td><td>${esc(c.type||'—')}</td><td>${esc(c.dueDate||c.due||c.targetDate||'—')}</td><td><span class="amPill ${c.status==='완료'?'done':''}">${esc(c.status||'조치대기')}</span></td><td class="amMailBtns"><!-- 2단계(전면 재설계 재평가) 발견: 270건 전체 행마다 메일/Outlook/자동발송 3개 버튼이 반복돼
     테이블이 과도하게 복잡해 보였음. 등록 팝업에서 이미 "발송 방법 1개 드롭다운 + 등록 버튼"으로
     간소화했던 것과 동일한 패턴으로 통일: 드롭다운 1개 + 발송 버튼 1개. --><select class="amSendSel" data-send-via="${esc(c.id)}" title="발송 방법"><option value="outlook" selected>Outlook 초안</option><option value="mailto">데스크톱 메일 앱</option><option value="auto">⚡자동발송</option></select><button class="amBtn" data-send="${esc(c.id)}" title="선택한 방법으로 알림 발송">발송</button>${String(c.id).startsWith('IMP-')?`<button class="amBtn amDel" data-del="${esc(c.id)}" title="이 등록 삭제">삭제</button>`:''}</td></tr>`).join(''):'<tr><td colspan="6" style="text-align:center;color:#758a99">등록된 개선요청이 없습니다.</td></tr>';$$('.amCaseLink',body).forEach(x=>{x.style.cursor='pointer';x.style.textDecoration='underline';x.onclick=()=>openActionCaseDetail(x.dataset.id)});$$('[data-send]',body).forEach(x=>x.onclick=()=>{const c=cases().find(y=>String(y.id)===x.dataset.send);if(!c)return;const via=body.querySelector('[data-send-via="'+x.dataset.send+'"]')?.value||'outlook';if(via==='outlook')openOutlookWeb(c);else if(via==='auto')sendAutoMail(c,x);else openMail(c)});$$('[data-del]',body).forEach(x=>x.onclick=()=>{if(!confirm('이 개선요청을 삭제할까요? 되돌릴 수 없습니다.'))return;saveCases(cases().filter(y=>String(y.id)!==x.dataset.del));renderCases(a)});
  const today=new Date().toISOString().slice(0,10),done=rows.filter(c=>c.status==='완료'),over=rows.filter(c=>c.status!=='완료'&&(c.dueDate||c.due||c.targetDate)&&(c.dueDate||c.due||c.targetDate)<today),wait=rows.filter(c=>c.status!=='완료'&&!over.includes(c));
  const sumEls={total:$('[data-am-sum="total"]',a),done:$('[data-am-sum="done"]',a),wait:$('[data-am-sum="wait"]',a),over:$('[data-am-sum="over"]',a)};
  if(sumEls.total){sumEls.total.textContent=rows.length+'건';sumEls.done.textContent=done.length+'건';sumEls.wait.textContent=wait.length+'건';sumEls.over.textContent=over.length+'건'}
  const recentHost=$('#amRecentDone',a);
  if(recentHost){
    const selectedTeam=String($('#amTeam',a)?.value||'').trim();
    const recentDone=selectedTeam?cases().filter(c=>String(c.team||'').trim()===selectedTeam&&c.status==='완료').sort((x,y)=>String(y.doneDate||y.completedDate||y.finishDate||'').localeCompare(String(x.doneDate||x.completedDate||x.finishDate||''))).slice(0,3):[];
    recentHost.innerHTML=!selectedTeam?'<div class="awHint">생산팀을 선택하면 해당 팀의 최근 완료된 개선조치가 표시됩니다.</div>':recentDone.length?recentDone.map(c=>{
      const completed=String(c.doneDate||c.completedDate||c.finishDate||'');
      const activityMonth=String(c.auditMonth||c.activityMonth||c.month||c.date||completed).slice(0,7);
      const theme=String(c.themeCategory||c.theme||c['5S구분']||'미분류');
      return `<div class="row"><span><b>${esc(c.id)}</b> · ${esc(c.workplace||'작업장 미지정')} · ${esc(activityMonth||'월 미상')} · ${esc(theme)}</span><small>완료 ${esc(completed||'—')}</small></div>`;
    }).join(''):'<div class="awHint">해당 팀의 최근 완료된 개선조치가 없습니다.</div>';
  }
}
function renderMaster(a){const old=$('.amMaster',a);if(old)old.remove()}
function renderRecentDone(a){const host=$('#amRecentDone',a);if(!host)return;const team=String($('#amTeam',a)?.value||'').trim();const list=team?cases().filter(c=>String(c.team||'').trim()===team&&c.status==='완료').sort((x,y)=>String(y.doneDate||y.completedDate||y.finishDate||'').localeCompare(String(x.doneDate||x.completedDate||x.finishDate||''))).slice(0,3):[];host.innerHTML=!team?'<div class="awHint">생산팀을 선택해 주세요.</div>':list.length?list.map(c=>{const done=String(c.doneDate||c.completedDate||c.finishDate||'');const month=String(c.auditMonth||c.activityMonth||c.month||c.date||done).slice(0,7);return `<div class="row"><span><b>${esc(c.id)}</b> · ${esc(c.workplace||'—')} · ${esc(month||'—')} · ${esc(c.themeCategory||c.theme||c['5S구분']||'미분류')}</span><small>${esc(done||'—')}</small></div>`}).join(''):'<div class="awHint">해당 팀의 최근 완료된 개선조치가 없습니다.</div>'}
function syncLeader(a){renderRecentDone(a);const team=$('#amTeam',a)?.value||'',x=leaderFor(team);if($('#amLeader',a))$('#amLeader',a).value=x.leader||'미지정';if($('#amEmail',a))$('#amEmail',a).value=x.email||''}
/* 사용자 지시: "팝업창 등록시 정보 누락시 저장되지 않도록 인터락 설정 필요함" — 작업장·문제점·발굴
   출처는 이미 검증되고 있었으나 "조치기한"은 비워도 그대로 저장되고 있었음. 정식 등록(메일알림/
   Outlook알림/자동발송)에서는 조치기한도 필수로 막고, "임시저장"(via===false)은 작성 중인 메모 성격
   이라 기존처럼 완화된 검증만 유지(과도한 인터락은 임시저장의 목적을 해침). */
let actionRegisterBusy=false;
function register(a,via){if(actionRegisterBusy)return;const formRoot=document.getElementById('hd20ActionRegisterModal')||a;const team=$('#amTeam',formRoot).value,x=leaderFor(team),workplace=$('#amWorkplace',formRoot).value.trim(),spot=$('#amSpot',formRoot)?.value||'',owner=$('#amOwner',formRoot)?.value.trim()||'',problem=$('#amProblem',formRoot).value.trim();if(!workplace||!problem)return alert('작업장 정보와 문제점을 입력해 주세요.');const requestSource=$('#amRequestSource',formRoot)?.value||'';if(!requestSource)return alert('개선요청 발굴 출처를 선택해 주세요.');const priority=$('#amPriority',formRoot)?.value||'',type=$('#amType',formRoot)?.value||'',startDate=$('#amDate',formRoot).value,targetDate=$('#amDue',formRoot).value;if(via!==false&&!targetDate)return alert('조치기한을 입력해 주세요.');/* Request registration only. Execution and advanced criteria become assessable after a corrective action exists. */
const c={criteriaVisual:false,criteriaGreen:false,criteriaSpace:false,visualization:false,greenZone:false,spaceUtilization:false,criteriaMatched:0,judgeState:'미평가',criteriaSatisfied:false,finalAdopted:false,advancementAdopted:false,confirmed:false,adoptedBy:null,adoptedAt:null,judgedAt:null,judgementBasis:'개선조치 등록 후 평가',horizontalDeployed:false,horizontalAdopted:false,expandApplied:false,foolproofApplied:false,foolproofAdopted:false,owner,requesterEmail:(()=>{try{const v=JSON.parse(localStorage.getItem('hd20_company_session_v1')||'null');return v&&Number(v.expiresAt)>Date.now()?String(v.email||'').toLowerCase():''}catch{return''}})(),spot,priority,type,id:newId(),date:startDate,startDate,team,workplace,workplaceCode:window.HD20WorkplaceMaster?.find(workplace)?.code||'',requestSource,leader:x.leader||'미지정',email:x.email||'',problem,due:targetDate,targetDate,before:$('#amBefore',formRoot).dataset.data||'',evidence:$('#amEvidence',formRoot).dataset.data||'',status:'조치대기',created:new Date().toISOString()};const rows=cases();if(rows.some(r=>String(r.id)===String(c.id)))c.id='IMP-'+Date.now()+'-'+Math.random().toString(36).slice(2,6);rows.unshift(c);actionRegisterBusy=true;try{saveCases(rows);if(!cases().some(r=>String(r.id)===String(c.id)))throw new Error('등록 후 저장 검증 실패')}catch(error){console.error('[HD20 개선요청 등록]',error);alert('개선요청 등록에 실패했습니다. 저장공간과 첨부사진 크기를 확인하세요.');return}finally{actionRegisterBusy=false}window.dispatchEvent(new CustomEvent('hd20-action-register-success',{detail:{id:c.id,via}}));setTimeout(()=>{if(window.HD20_NAV?.active?.()!=='action')return;try{renderCases(a)}catch(e){console.error('[HD20 개선요청 목록 갱신]',e)}},0);window.dispatchEvent(new CustomEvent('hd20-action-updated',{detail:{source:'action-mail-register',id:c.id}}));if(via===false)alert('임시저장했습니다.');/* 정상 등록 시 통보는 HD20_ACTION_NOTIFIER로 일원화: 중복 초안·이중발송 방지 */}
function actionEvaluationReady(c){return !!String(c.actionText||c.action||'').trim()}
function renderActionEvaluation(overlay,caseData){
 const region=overlay.querySelector('[data-action-evaluation]');if(!region)return;
 region.replaceChildren();
 const ready=actionEvaluationReady(caseData),master=!!window.HD20MasterAccess?.isMaster();
 const heading=document.createElement('h3');heading.textContent='개선조치 등록 후 실행·고도화 평가';heading.style.cssText='font-size:16px;margin:0 0 8px;color:#1e4762';region.append(heading);
 if(!ready){const msg=document.createElement('p');msg.textContent='개선조치 내용이 아직 등록되지 않았습니다. 먼저 [개선조치 입력·수정]에서 조치내용을 저장하면 평가 체크박스가 열립니다.';msg.style.cssText='color:#687f91;font-size:13px';region.append(msg);return}
 const guide=document.createElement('p');guide.textContent='실행·수평전개·Fool Proof 및 5S 고도화 3대 요건을 실제 조치 증빙을 근거로 평가하세요. 최종 채택은 마스터관리자만 확정합니다.';guide.style.cssText='font-size:12px;color:#607b90;margin:0 0 12px';region.append(guide);
 const items=[
  ['horizontalDeployed','수평전개 실행'],['expandApplied','확대적용 실행'],['foolproofApplied','Fool Proof 적용'],
  ['criteriaVisual','① 시각화를 통한 찾는 낭비 제거'],['criteriaGreen','② 인간공학적 그린존 적용'],['criteriaSpace','③ 정량축소·정위치 변경을 통한 공간 활용 확장']
 ];
 const grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:9px;padding:10px;border:1px solid #dce7ef;border-radius:9px;background:#f7fafc';
 for(const [key,label]of items){const field=document.createElement('label');field.style.cssText='display:flex;align-items:center;gap:9px;padding:7px 8px;background:white;border-radius:7px;color:#274962;font-size:12.5px;font-weight:650';const input=document.createElement('input');input.type='checkbox';input.dataset.evalKey=key;input.checked=!!caseData[key];field.append(input,document.createTextNode(label));grid.append(field)}
 region.append(grid);
 const masterRow=document.createElement('div');masterRow.style.cssText='display:flex;flex-wrap:wrap;gap:14px;align-items:center;margin-top:12px;padding:10px;border:1px solid #dbe7f0;border-radius:8px';
 const adopted=[
  ['horizontalAdopted','수평전개 채택'],['foolproofAdopted','Fool Proof 채택'],['finalAdopted','고도화 최종 채택']
 ];
 for(const [key,label] of adopted){const field=document.createElement('label');field.style.cssText='display:flex;align-items:center;gap:6px;font-size:12.5px;color:#264a64;font-weight:700';const input=document.createElement('input');input.type='checkbox';input.dataset.evalKey=key;input.checked=!!caseData[key];input.disabled=!master;field.append(input,document.createTextNode(label));masterRow.append(field)}
 const hint=document.createElement('small');hint.textContent=master?'마스터 권한 · 최종 채택 선택 가능':'최종 채택은 마스터관리자만 수정 가능';hint.style.cssText='color:#6c8292';masterRow.append(hint);region.append(masterRow);
 const status=document.createElement('div');status.style.cssText='font-size:12px;margin:9px 0;color:#426780';
 const update=()=>{const chosen=['criteriaVisual','criteriaGreen','criteriaSpace'].filter(k=>region.querySelector('[data-eval-key="'+k+'"]')?.checked).length;const final=region.querySelector('[data-eval-key="finalAdopted"]');if(final){final.disabled=!master||chosen===0;if(chosen===0)final.checked=false}status.textContent='고도화 3대요건 '+chosen+'/3 충족 · '+(chosen?'최종 채택 검토 가능':'고도화 요건 미충족')};
 region.append(status);region.querySelectorAll('[data-eval-key]').forEach(x=>x.addEventListener('change',update));update();
 const saveBtn=document.createElement('button');saveBtn.type='button';saveBtn.textContent='평가 체크 저장';saveBtn.style.cssText='padding:10px 15px;border:0;border-radius:8px;background:#216ba5;color:white;font-weight:800;cursor:pointer';
 saveBtn.addEventListener('click',()=>{
  const records=cases(),record=records.find(x=>String(x.id)===String(caseData.id));
  if(!record||!actionEvaluationReady(record)){alert('개선조치 등록 상태가 변경되었습니다. 다시 확인해 주세요.');return}
  const vals=Object.fromEntries([...region.querySelectorAll('[data-eval-key]')].map(x=>[x.dataset.evalKey,!!x.checked]));
  const count=['criteriaVisual','criteriaGreen','criteriaSpace'].filter(k=>vals[k]).length;
  const isMaster=!!window.HD20MasterAccess?.isMaster();
  // A non-master may log execution results, but must not undo a master's adopted evidence.
  if(!isMaster&&(
    (record.finalAdopted&&['criteriaVisual','criteriaGreen','criteriaSpace'].some(k=>!!record[k]!==!!vals[k]))||
    (record.horizontalAdopted&&!vals.horizontalDeployed)||
    (record.foolproofAdopted&&!vals.foolproofApplied)
  )){alert('이미 최종 채택된 항목의 판정 변경은 마스터관리자에게 요청해 주세요.');return}
  record.horizontalDeployed=vals.horizontalDeployed;record.expandApplied=vals.expandApplied;record.foolproofApplied=vals.foolproofApplied;
  record.criteriaVisual=vals.criteriaVisual;record.criteriaGreen=vals.criteriaGreen;record.criteriaSpace=vals.criteriaSpace;
  record.visualization=vals.criteriaVisual;record.greenZone=vals.criteriaGreen;record.spaceUtilization=vals.criteriaSpace;
  record.criteriaMatched=count;record.criteriaSatisfied=count>=1;record.judgeState=count?'충족':'미충족';
  record.judgementBasis='5S 고도화 3대요건 중 1개 이상 충족';record.judgedAt=new Date().toISOString();
  if(isMaster){record.horizontalAdopted=!!vals.horizontalAdopted&&record.horizontalDeployed;record.foolproofAdopted=!!vals.foolproofAdopted&&record.foolproofApplied;record.finalAdopted=count>=1&&!!vals.finalAdopted;record.advancementAdopted=record.finalAdopted;record.confirmed=record.finalAdopted;record.adoptedBy=record.finalAdopted?(window.HD20MasterAccess?.email?.()||''):null;record.adoptedAt=record.finalAdopted?new Date().toISOString():null}
  try{saveCases(records);if(!cases().some(x=>String(x.id)===String(record.id)&&x.judgedAt===record.judgedAt))throw Error('evaluation save verification failed')}catch(error){console.error('[HD20 action post-evaluation]',error);alert('평가 저장에 실패했습니다.');return}
  window.dispatchEvent(new CustomEvent('hd20-action-updated',{detail:{source:'post-action-evaluation',id:record.id}}));
  openActionCaseDetail(record.id);
 });
 region.append(saveBtn);
}
function renderActionEffectCheck(overlay,c){
 const region=overlay.querySelector('[data-effect-check]');if(!region)return;
 region.replaceChildren();
 const heading=document.createElement('h3');heading.textContent='개선조치 효과검증 · 재발 확인';heading.style.cssText='font-size:15px;margin:0 0 10px;color:#1e4762';region.append(heading);
 const complete=['완료','조치완료','개선완료','종결','종료','종결완료'].includes(String(c.status||'').trim());
 if(!complete){const p=document.createElement('p');p.textContent='개선조치 완료 후 효과검증과 재발 판정을 등록할 수 있습니다.';region.append(p);return}
 const master=window.HD20MasterAccess?.isMaster?.()===true||window.HD20MasterAuth?.canEvaluateRetention?.()===true;
 const fields=document.createElement('div');fields.className='amEffectFields';
 const outcome=document.createElement('label');outcome.textContent='효과검증 결과';
 const effect=document.createElement('select');effect.innerHTML='<option value="">선택</option><option value="유효">유효</option><option value="미흡">미흡</option>';effect.value=['유효','미흡'].includes(c.effectState)?c.effectState:'';outcome.append(effect);
 const recurrenceLabel=document.createElement('label');recurrenceLabel.textContent='재발 여부';
 const recurrence=document.createElement('select');recurrence.innerHTML='<option value="">선택</option><option value="미발생">미발생</option><option value="발생">재발 발생</option>';recurrence.value=c.recurrenceState==='발생'||c.recurrence===true?'발생':c.recurrenceState==='미발생'||c.recurrence===false?'미발생':'';recurrenceLabel.append(recurrence);
 const memoLabel=document.createElement('label');memoLabel.textContent='효과검증·재발 확인 근거';
 const note=document.createElement('textarea');note.rows=2;note.placeholder='현장 확인내용·잔여 미흡사항·재발 근거';note.value=String(c.effectVerificationNote||'');memoLabel.append(note);
 fields.append(outcome,recurrenceLabel,memoLabel);region.append(fields);
 const hint=document.createElement('p');hint.className='amEffectHint';hint.textContent=master?'효과 미흡 또는 재발 확인 시 동일 원본의 미완료 재조치 요청을 1건만 생성합니다.':'판정·저장은 마스터관리자 권한에서만 가능합니다.';region.append(hint);
 if(!master){[effect,recurrence,note].forEach(x=>x.disabled=true);return}
 const btn=document.createElement('button');btn.type='button';btn.className='amBtn primary';btn.textContent='효과·재발 판정 저장';region.append(btn);
 btn.onclick=()=>{
  if(!effect.value||!recurrence.value){alert('효과검증 결과와 재발 여부를 모두 선택해 주세요.');return}
  if((effect.value==='미흡'||recurrence.value==='발생')&&!note.value.trim()){alert('효과 미흡 또는 재발 발생 시 확인 근거를 입력해 주세요.');return}
  const all=cases(),original=all.find(x=>String(x.id)===String(c.id));
  if(!original||!['완료','조치완료','개선완료','종결','종료','종결완료'].includes(String(original.status||'').trim())){alert('원본 개선조치의 완료 상태를 다시 확인해 주세요.');return}
  const issue=effect.value==='미흡'||recurrence.value==='발생';
  const existing=all.find(x=>x.sourceStage==='EFFECT-RECHECK'&&String(x.sourceCaseId)===String(original.id));
  if(existing&&!issue){alert('이 조치에 연결된 재조치 이력이 있습니다. 종료 또는 판정 정정은 연결된 재조치까지 확인해야 합니다.');return}
  const at=new Date().toISOString(),evaluator=window.HD20MasterAccess?.email?.()||'마스터관리자';
  original.effectState=effect.value;
  original.effectVerified=effect.value==='유효';
  original.effectAssessed=true;
  original.effectAssessedAt=at;
  original.effectEvaluator=evaluator;
  original.effectVerificationNote=note.value.trim();
  original.recurrenceState=recurrence.value;
  original.recurrence=recurrence.value==='발생';
  original.recurrenceCheckedAt=at;
  let createdId='';
  if(issue&&!existing){
   createdId='EFFECT-'+Date.now()+'-'+Math.random().toString(36).slice(2,7);
   const policyDays=Number(window.HD20PolicyConfig?.deadlineDays?.());
   const validDays=Number.isFinite(policyDays)&&policyDays>0?Math.ceil(policyDays):null;
   const due=validDays?new Date(Date.now()+validDays*86400000).toISOString().slice(0,10):'';
   all.unshift({id:createdId,source:'효과검증·재발점검',sourceStage:'EFFECT-RECHECK',sourceCaseId:String(original.id),team:original.team||'',workplace:original.workplace||'',spot:original.spot||'',type:original.type||'',themeCategory:original.themeCategory||'',problem:'[효과검증 재조치] '+(original.problem||original.id),improvementRequest:note.value.trim(),status:'조치대기',createdAt:at,date:at.slice(0,10),dueDate:due,targetDate:due,initialAuditor:original.initialAuditor||original.auditor||original.registeredBy||'',registeredBy:evaluator,registrant:evaluator,auditor:original.initialAuditor||original.auditor||'',before:original.after||original.before||'',evidence:original.after||original.before||'',recurrenceOfActionId:String(original.id),effectOriginId:String(original.id)});
   original.effectFollowupActionId=createdId;
  }else if(existing){original.effectFollowupActionId=String(existing.id)}
  try{
   saveCases(all);
   const check=cases().find(x=>String(x.id)===String(original.id));
   if(!check||check.effectAssessedAt!==at||(createdId&&!cases().some(x=>String(x.id)===createdId)))throw Error('효과검증 저장 검증 실패');
  }catch(e){console.error('[HD20 effect verification]',e);alert('효과검증 저장에 실패했습니다. 저장 공간과 기록을 확인해 주세요.');return}
  window.dispatchEvent(new CustomEvent('hd20-action-updated',{detail:{source:'effect-verification',id:original.id,followupId:createdId||original.effectFollowupActionId||''}}));
  openActionCaseDetail(original.id);
 };
}
function openActionCaseDetail(id){
 const c=cases().find(x=>String(x.id)===String(id));if(!c)return alert('개선조치 원천 데이터를 찾을 수 없습니다.');
 let overlay=document.getElementById('hd20ActionCaseDetailOverlay');
 if(!overlay){overlay=document.createElement('div');overlay.id='hd20ActionCaseDetailOverlay';overlay.style.cssText='position:fixed;inset:0;z-index:999999;background:rgba(10,28,47,.55);display:flex;align-items:center;justify-content:center;padding:18px';overlay.innerHTML='<section role="dialog" aria-modal="true" aria-label="개선요청 건별 상세" style="width:min(820px,100%);max-height:88vh;overflow:auto;background:#fff;border-radius:12px;padding:20px"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px"><strong style="font-size:18px">개선요청 · 조치 건별 상세</strong><button type="button" data-close style="padding:8px 13px;cursor:pointer">닫기</button></div><div data-detail style="margin-top:14px"></div><section data-effect-check class="amEffectCheck"></section><section data-action-evaluation style="margin-top:14px;padding:15px;border:1px solid #dce7ef;border-radius:10px;background:#fff"></section><div style="display:flex;justify-content:flex-end;margin-top:14px"><button type="button" data-respond style="background:#24699b;color:white;border:0;border-radius:7px;padding:10px 14px;cursor:pointer">개선조치 입력·수정</button></div></section>';document.body.appendChild(overlay);overlay.querySelector('[data-close]').onclick=()=>overlay.remove();overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.remove()})}
 const fields=[['요청번호',c.id],['원천 Audit ID',c.auditDrawId||c.sourceCaseId],['요청일',c.registeredAt||c.date],['생산팀',c.team],['작업장',c.workplace],['세부위치',c.spot],['등록자·최초 점검자',c.initialAuditor||c.registeredBy||c.registrant||c.owner||c.auditor],['담당자',c.assignee],['문제점',c.problem],['개선요청 사항',c.improvementRequest],['조치내용',c.actionText||c.action],['조치기한',c.dueDate||c.due||c.targetDate],['조치완료일',c.doneDate],['진행상태',c.status],['효과검증',c.effectState||c.effectResult],['재발 여부',c.recurrenceResult||c.recurrenceState]];
 const photoSources=[['점검 당시 BEFORE',c.before||c.evidence],['최근 재점검 사진',c.lastAuditPhoto],['개선 후 AFTER',c.after]].filter((x,i,arr)=>typeof x[1]==='string'&&/^data:image\/(?:png|jpeg|webp);base64,/.test(x[1])&&arr.findIndex(y=>y[1]===x[1])===i);
 const photos=photoSources.length?'<section class="amEvidenceDetail"><h3>현장 증빙사진</h3><div class="amEvidenceGrid">'+photoSources.map(([label,src])=>'<figure><img alt="'+esc(label)+'" src="'+src+'" loading="lazy"><figcaption>'+esc(label)+'</figcaption></figure>').join('')+'</div></section>':'<p class="amNoEvidence">등록된 현장 증빙사진이 없습니다.</p>';
 overlay.querySelector('[data-detail]').innerHTML='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:9px">'+fields.map(([k,v])=>'<div style="padding:10px;border:1px solid #e0e9ef;border-radius:8px"><small style="display:block;color:#667f90;font-weight:700">'+esc(k)+'</small><div style="white-space:pre-wrap;overflow-wrap:anywhere;margin-top:5px">'+esc(String(v??'—'))+'</div></div>').join('')+'</div>'+photos;
 renderActionEffectCheck(overlay,c);
 renderActionEvaluation(overlay,c);
 overlay.querySelector('[data-respond]').onclick=()=>{overlay.remove();openResponse(document.getElementById('awAction'),id)};
 overlay.style.display='flex';
}
function openResponse(a,id){if(window.HD20ToBeManager?.open){window.HD20ToBeManager.open(String(id));return}const c=cases().find(x=>String(x.id)===String(id));if(!c)return;const r=$('#amResponse',a);r.dataset.id=c.id;r.classList.add('on');$('#amResponseInfo',a).innerHTML=`<div><small>요청번호</small><b>${esc(c.id)}</b></div><div><small>생산팀</small><b>${esc(c.team)}</b></div><div><small>작업장</small><b>${esc(c.workplace)}</b></div><div><small>${c.sourceCaseId?'등록자 / 최초 Audit 점검자':'등록자'}</small><b>${esc(c.initialAuditor||c.registeredBy||c.registrant||c.auditor||c.owner||'미입력')}</b></div>`;$('#amActionText',a).value=c.actionText||'';$('#amDoneDate',a).value=c.doneDate||new Date().toISOString().slice(0,10);$('#amDoneStatus',a).value=c.doneStatus||c.status||'완료';r.scrollIntoView({block:'start'})}
function saveResponse(a){const r=$('#amResponse',a),id=r.dataset.id;if(!id)return;const rows=cases(),c=rows.find(x=>String(x.id)===String(id));if(!c)return;const text=$('#amActionText',a).value.trim();if(!text)return alert('개선 후 조치사항을 입력해 주세요.');c.actionText=text;c.doneDate=$('#amDoneDate',a).value;c.doneStatus=$('#amDoneStatus',a).value;c.after=$('#amAfter',a).dataset.data||c.after||'';c.afterEvidence=$('#amAfterEv',a).dataset.data||c.afterEvidence||'';c.status=c.doneStatus==='완료'?'완료':c.doneStatus;c.updated=new Date().toISOString();try{saveCases(rows);const persisted=cases().find(x=>String(x.id)===String(c.id));if(!persisted||persisted.actionText!==text||persisted.status!==c.status)throw new Error('개선조치 회신 저장 검증 실패')}catch(error){console.error('[HD20 개선조치 회신]',error);alert('개선조치 저장에 실패했습니다. 저장공간 또는 첨부사진 크기를 확인하세요.');return}renderCases(a);window.dispatchEvent(new CustomEvent('hd20-action-updated',{detail:{source:'action-mail-response',id:c.id}}));alert('개선조치 회신을 저장했습니다.')}
function applyAuditPending(a,directPayload){
  try{
    let p=directPayload;
    if(!p){
      const pendingRaw=sessionStorage.getItem('hd20AuditToActionPending');
      if(!pendingRaw)return;
      p=JSON.parse(pendingRaw);
    }
    sessionStorage.removeItem('hd20AuditToActionPending');
    if(p.team&&[...$('#amTeam',a).options].some(o=>o.value===p.team||o.textContent===p.team)){$('#amTeam',a).value=p.team;syncLeader(a)}
    if(p.problem)$('#amProblem',a).value=p.problem;
    // Audit에서 직접 전달된 요청은 발굴 출처가 명확하므로 팝업 선택값을 동기화한다.
    if($('#amRequestSource',a))$('#amRequestSource',a).value='자율 5S Audit';
    $('#amWorkplace',a)?.focus();
    $('.amCard',a)?.scrollIntoView({behavior:'smooth',block:'start'});
  }catch(e){console.error('[audit->action prefill]',e)}
}
function build(){const a=document.getElementById('awAction');if(!a)return false;if(a.dataset.amReady==='2'){renderCases(a);applyAuditPending(a);return true}a.dataset.amReady='2';const today=new Date().toISOString().slice(0,10),data=teams();a.innerHTML=`<div class="awHero"><div><h2>⑤ 개선조치</h2><p>Audit/현장점검에서 발견된 문제점과 개선 전 사진을 현장팀에 요청 → 팀장 알림 → 팀장이 개선 후 정보를 입력하여 정리합니다.</p></div></div><div class="amHeroNote">④ 유지·Audit의 점검항목에서 「→ 개선요청」 버튼을 누르면 이 화면에 자동으로 연결됩니다. 생산팀장 이름과 이메일은 실제 기준정보에 등록된 값만 사용하며, 미등록 상태에서는 메일을 생성하지 않습니다.</div><div class="amGrid"><div class="amCard"><div class="amHead">개선요청 신규 등록</div><div class="amBody"><div class="amForm"><label>요청일<input id="amDate" type="date" value="${today}"></label><label>생산팀<select id="amTeam">${data.map(x=>`<option>${esc(x.team)}</option>`).join('')}</select></label><label>등록자<select id="amOwnerSel">${ownerOptions()}</select><input id="amOwner" type="hidden"><input id="amOwnerOther" placeholder="등록자 이름 입력" style="margin-top:6px;display:none"></label><label>작업장<select id="amWorkplace">${factorOptions('작업장')}</select></label><label>세부위치<select id="amSpot">${factorOptions('세부위치')}</select></label><label>개선요청 발굴 출처<select id="amRequestSource" required><option value="">발굴 출처 선택</option><option>현장 패트롤 점검</option><option>자율 5S Audit</option><option>혁신팀 자율 점검</option><option>5S 자율개선활동 피드백</option></select></label><!-- 사용자 지시: "통합기준정보 탭과 활동·조치등록 탭을 더 완벽하게 보완해줘" — 통합기준정보
     "④ 업무/팩터"의 "우선순위"(긴급·높음·보통·낮음) 항목이 어느 화면에도 연결되지 않은 죽은
     설정이었음(등록폼에 우선순위 선택 필드 자체가 없었음). 신규 추가. --><!-- 사용자 지시: "신규 등록 팝업창에 리스크 빼고 5s 테마 반영해라. 개선요청 팝업창에" — "리스크"
     드롭다운을 제거하고, 자율개선 등록 폼과 동일한 "5S 테마"(정리·정돈·청소·시각화·위험구역관리·
     설비자주보전·5S 고도화) 드롭다운으로 교체. --><label>우선순위<select id="amPriority">${factorOptions('우선순위')}</select></label><label>5S 테마<select id="amType">${[['정리','불필요품과 불용품을 구분하고 제거하여 필요한 물품만 유지'],['정돈','필요한 물품의 정위치·정량 기준을 정하고 준수'],['시각화관리','관리기준·정상상태·이상상태를 누구나 즉시 식별할 수 있도록 표시'],['청소','오염·이물을 제거하고 오염 발생원을 찾아 개선'],['설비자주보전','작업자가 설비의 청소·급유·일상점검과 이상 발견·조치를 실행']].map(([name,definition])=>`<option value="${name}">${name} — ${definition}</option>`).join('')}</select></label><label>생산팀장<input id="amLeader" class="amRead" readonly></label><label class="wide">미흡사항 / 문제점<textarea id="amProblem"></textarea></label><label>조치기한<input id="amDue" type="date"></label><label>팀장 이메일<input id="amEmail" class="amRead" readonly></label><div class="wide amPhoto"><div class="amDrop">BEFORE Evidence<img id="amBeforeImg" hidden><input id="amBefore" type="file" accept="image/*"></div><div class="amDrop">추가 Evidence<img id="amEvidenceImg" hidden><input id="amEvidence" type="file" accept="image/*"></div></div><div class="amRegisterNote" style="margin:4px 0 10px;padding:9px 11px;background:#fdf3e8;border-radius:8px;font-size:12.5px;color:#7a5a2e;line-height:1.6">📨 <b>개선요청 등록</b><br><b>공장장·5S모듈조직·혁신팀</b>으로부터 아래 "개선요청 발굴 출처"의 <b>현장 패트롤 점검·자율 5S Audit·혁신팀 자율 점검·5S 자율개선활동 피드백</b> 등 다양한 루트로 도출된 개선조치 요청사항을 현장팀에 등록하는 창구입니다.</div></div><!-- 사용자 지적(모바일 스크린샷): "버튼이 너무많다" — 기존 4개 버튼(임시저장/등록+메일알림/등록+
     Outlook알림/등록+즉시자동발송)을 "임시저장"+"등록"(발송 방법은 드롭다운 1개로 선택) 2개 버튼으로
     축소. --><div class="amActions"><button class="amBtn" id="amDraft">임시저장</button><label class="amSendMethod">발송 방법<select id="amSendVia"><option value="outlook" selected>Outlook 메일 초안 자동 생성 (기본)</option><option value="mailto">Outlook 데스크톱 / 기본 메일 앱</option><option value="auto">⚡ 즉시 자동발송 (별도 확인)</option></select></label><button class="amBtn primary" id="amRegister">등록</button></div><div class="amBackendNote" id="amSendNote">개선요청 등록 시 Outlook 메일 초안이 자동으로 열립니다. 수신자·참조·제목·본문·조치 URL이 자동 입력되며, 실제 발송은 Outlook의 보내기 버튼을 눌러야 합니다. (즉시 자동발송 선택 시 별도 확인 필요)</div><div class="amHead2">최근 완료된 개선조치</div><div id="amRecentDone" class="amRecentList"></div></div></div><div class="amCard"><div class="amHead">개선요청 현황</div><div class="amBody"><div class="amFilterBar"><label>생산팀<select id="amFTeam"><option value="">ALL</option>${data.map(x=>`<option>${esc(x.team)}</option>`).join('')}</select></label><label>상태<select id="amFStatus"><!-- 사용자 지시: "통합기준정보 탭과 활동·조치등록 탭을 더 완벽하게 보완해줘" — 상태
     필터 옵션(조치대기·진행중·완료)이 실제 레코드 상태값(진행중·완료·기한초과)과 어긋나 있어,
     상단 요약 카드에 "기한초과 58건"이 있는데도 필터로는 그 58건을 걸러볼 방법이 전혀 없었음.
     실제 쓰이는 값으로 교정. --><option value="">ALL</option><option>진행중</option><option>완료</option><option>기한초과</option></select></label><label>등록일<input id="amFFrom" type="date"> ~ <input id="amFTo" type="date"></label><label>텍스트 필터<input id="amFText" type="search" placeholder="번호·작업장·내용 등" aria-label="개선요청 텍스트 필터"></label><button type="button" class="amBtn primary" id="amFGo">조회</button><button type="button" class="amBtn" id="amFReset">초기화</button><span id="amFilterCount" class="amFilterCount"></span></div><div class="amCasesScroll"><table class="amCases"><thead><tr><th>요청번호</th><th>생산팀</th><th>작업장</th><th>우선순위</th><th>5S 테마</th><th>기한</th><th>상태</th><th>알림</th></tr></thead><tbody id="amCaseRows"></tbody></table></div></div></div></div><div id="amResponse" class="amCard amResponse"><div class="amHead">개선조치 회신 · AFTER Evidence 등록</div><div class="amBody"><div class="amInfo" id="amResponseInfo"></div><div class="amForm"><label class="wide">개선 후 조치사항<textarea id="amActionText"></textarea></label><label>조치완료일<input id="amDoneDate" type="date" value="${today}"></label><label>조치상태<select id="amDoneStatus"><option>완료</option><option>부분완료</option><option>진행</option></select></label><div class="wide amPhoto"><div class="amDrop">AFTER Evidence<img id="amAfterImg" hidden><input id="amAfter" type="file" accept="image/*"></div><div class="amDrop">추가 Evidence<img id="amAfterEvImg" hidden><input id="amAfterEv" type="file" accept="image/*"></div></div></div><div class="amActions"><button class="amBtn green" id="amSaveResponse">개선조치 저장 및 완료회신</button></div></div></div>`;$('#amTeam',a).onchange=()=>syncLeader(a);filePreview($('#amBefore',a),$('#amBeforeImg',a));filePreview($('#amEvidence',a),$('#amEvidenceImg',a));filePreview($('#amAfter',a),$('#amAfterImg',a));filePreview($('#amAfterEv',a),$('#amAfterEvImg',a));window.HD20MasterAccess?.sync(a);window.HD20DirectCriteria?.bind(a,'am');window.HD20MasterAccess?.sync(a);[['amHorizontal','amHorizontalAdopted'],['amFoolproof','amFoolproofAdopted']].forEach(([foundId,adoptId])=>{const found=$('#'+foundId,a),adopt=$('#'+adoptId,a);if(!found||!adopt)return;const sync=()=>{if(adopt.checked)found.checked=true;adopt.disabled=!window.HD20MasterAccess?.isMaster();if(!found.checked)adopt.checked=false};found.addEventListener('change',()=>{if(!found.checked)adopt.checked=false;sync()});adopt.addEventListener('change',sync);sync()});$('#amDraft',a).onclick=()=>{const data={};(document.getElementById('hd20ActionRegisterModal')||a).querySelectorAll('.amRegisterFormCard input[id],.amRegisterFormCard textarea[id],.amRegisterFormCard select[id]').forEach(el=>{if(el.type==='file')return;data[el.id]=el.type==='checkbox'?el.checked:el.value});try{localStorage.setItem('hd20ActionPopupDraftV1',JSON.stringify(data));alert('임시저장 완료: 개선요청은 등록되지 않았습니다. 사진 파일은 임시저장에 포함되지 않습니다.')}catch(e){alert('임시저장 실패: '+e.message)}};$('#amRegister',a).onclick=()=>register(a,$('#amSendVia',a)?.value||'outlook');$('#amSaveResponse',a).onclick=()=>saveResponse(a);
  {const sel=$('#amOwnerSel',a),hid=$('#amOwner',a),other=$('#amOwnerOther',a);if(sel&&hid&&other){const sync=()=>{if(sel.value==='__other__'){other.style.display='block';other.focus();hid.value=other.value.trim()}else{other.style.display='none';hid.value=sel.value}};sel.addEventListener('change',sync);other.addEventListener('input',()=>{hid.value=other.value.trim()});sync()}}
  let filterInputTimer=null;
  const go=()=>{F.team=$('#amFTeam',a).value;F.status=$('#amFStatus',a).value;F.from=$('#amFFrom',a).value;F.to=$('#amFTo',a).value;F.text=$('#amFText',a).value.trim().toLocaleLowerCase('ko');scheduleActionListRender()};
  $('#amFGo',a).onclick=go;$('#amFTeam',a).onchange=go;$('#amFStatus',a).onchange=go;$('#amFFrom',a).onchange=go;$('#amFTo',a).onchange=go;$('#amFText',a).oninput=()=>{clearTimeout(filterInputTimer);filterInputTimer=setTimeout(go,180)};
  $('#amFReset',a).onclick=()=>{$('#amFTeam',a).value='';$('#amFStatus',a).value='';$('#amFFrom',a).value='';$('#amFTo',a).value='';$('#amFText',a).value='';F.team=F.status=F.from=F.to=F.text='';renderCases(a)};
  syncLeader(a);renderCases(a);renderMaster(a);const q=new URL(location.href).searchParams.get('actionId');if(q)setTimeout(()=>openResponse(a,q),30);
  applyAuditPending(a);
  return true}
function boot(){css();window.addEventListener('hd20-open-action-detail',e=>{const id=e.detail?.id;if(id)openActionCaseDetail(id)});let n=0;const run=()=>{if(build())return;if(++n<50)setTimeout(run,100)};run();window.addEventListener('hd20-team-master-updated',()=>{const a=document.getElementById('awAction');if(a){const sel=$('#amTeam',a);if(sel){const previous=sel.value,names=teams().map(x=>x.team).filter(Boolean);sel.innerHTML=names.map(t=>`<option>${esc(t)}</option>`).join('');if(names.includes(previous))sel.value=previous}renderMaster(a);syncLeader(a)}});window.addEventListener('hd20-action-updated',scheduleActionListRender);window.addEventListener('hd20-audit-to-action',e=>{const a=document.getElementById('awAction');if(a)applyAuditPending(a,e.detail)})}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();