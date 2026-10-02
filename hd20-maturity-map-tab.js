(()=>{'use strict';
const ID='hd20MaturityMapTab',STYLE='hd20MaturityMapTabStyle';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],txt=v=>String(v??'').trim(),esc=v=>txt(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function api(){return window.HD20KPIData||null}
const FALLBACK_LEGACY_TEST_IDS=new Set('DRAW-1788010755791,DRAW-1788010759290,DRAW-1788010760070,DRAW-1788010760500,DRAW-1788010760921,DRAW-1788010761360,DRAW-1788011635587,DRAW-1788011636106,DRAW-1788011636356,DRAW-1788011636538,DRAW-1788011636773,DRAW-1788011636931,DRAW-1788011637126,DRAW-1788011637396,DRAW-1788011637597,DRAW-1788011637788,DRAW-1788011637966,DRAW-1788011638138,DRAW-1788011638487,DRAW-1788011638656,DRAW-1788011638846'.split(','));
function fallbackValidationMode(){const v=new URL(location.href).searchParams.get('validation');return v!=='0'&&v!=='off'}
function fallbackNonProd(x){if(!x||typeof x!=='object')return false;const source=txt(x.source).toLowerCase(),id=txt(x.id).toUpperCase(),sourceCaseId=txt(x.sourceCaseId).toUpperCase(),email=txt(x.email).toLowerCase();return x.isDemo===true||x.isTest===true||source==='demo-seed'||source==='e2e-fixture'||source==='web-validation-fixture'||id.startsWith('DEMO-')||id.startsWith('E2E-')||id.startsWith('VALID-')||id.includes('AUTO-DEMO-')||sourceCaseId.startsWith('DEMO-')||sourceCaseId.startsWith('E2E-')||sourceCaseId.startsWith('VALID-')||email.endsWith('@hd-hyundai-demo.co.kr')||/^teamlead\d+@example\.com$/i.test(email)||FALLBACK_LEGACY_TEST_IDS.has(id)}
function fallbackLoad(){try{const v=JSON.parse(localStorage.getItem('hd20GMES5SAutoImproveRawV1')||'[]');if(!Array.isArray(v))return[];return fallbackValidationMode()?v.filter(x=>x?.source==='web-validation-fixture'):v.filter(x=>!fallbackNonProd(x))}catch{return[]}}
function fallbackType(x){const v=txt(x?.type||x?.category||x?.sType||x?.['5S구분']||x?.['활동유형']);return v==='5S 고도화'||v==='고도화'||v==='5S고도화'}
function fallbackCandidate(x){if(!x||!fallbackType(x))return false;if(x.candidate===true||x.isCandidate===true)return true;const judge=txt(x.judgeState),status=txt(x.status);if(!judge&&!status)return false;if(judge==='미확정')return /판정대기|보완요청|후보|검토|대기/.test(status);return /판정대기|보완요청|확정|후보|검토|대기/.test(judge||status)}
function fallbackConfirmed(x){return !!x&&fallbackType(x)&&x.confirmed===true&&txt(x.judgeState)==='확정'}
function fallbackMaintained(x){return fallbackConfirmed(x)&&x?.attrition!==true&&x?.valid!==false&&!/중지|미흡|이탈|재점검|부적합|해제|실패/i.test(txt(x?.maintainState||x?.auditState||x?.status))}
function data(){const a=api(),load=a?.load||fallbackLoad,isType=a?.isAdvancementType||fallbackType,isCandidate=a?.isCandidate||fallbackCandidate,isConfirmed=a?.isConfirmed||fallbackConfirmed,isMaintained=a?.isMaintained||fallbackMaintained;const rows=load().filter(isType),candidates=rows.filter(isCandidate),confirmed=rows.filter(isConfirmed),maintained=confirmed.filter(isMaintained),teams=[...new Set(rows.map(x=>txt(x.team)).filter(Boolean))];return{rows,candidates,confirmed,maintained,teams}}
function teamStats(d){return d.teams.map(team=>{const same=x=>txt(x.team)===team,c=d.candidates.filter(same),f=d.confirmed.filter(same),m=d.maintained.filter(same),rate=f.length?Math.round(m.length/f.length*1000)/10:null;return{team,candidates:c.length,confirmed:f.length,maintained:m.length,rate,cases:f}}).sort((a,b)=>(b.maintained-a.maintained)||(b.confirmed-a.confirmed)||(b.candidates-a.candidates)||a.team.localeCompare(b.team,'ko'))}
function css(){if(document.getElementById(STYLE))return;const s=document.createElement('style');s.id=STYLE;s.textContent=`#${ID}{display:none;margin:0 0 18px}#${ID}.on{display:block}.mmtHero{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin:0 0 12px;padding:18px;border:1px solid #d6e2ea;border-radius:14px;background:linear-gradient(135deg,#f9fcfd,#eef6fa)}.mmtHero small{display:block;color:#0e6d9d;font-size:10px;font-weight:900;letter-spacing:.12em}.mmtHero h2{margin:4px 0 3px;color:#153247;font-size:22px}.mmtHero p{margin:0;color:#6c8292;font-size:12px}.mmtKpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-bottom:12px}.mmtKpi{padding:12px 13px;border:1px solid #dce6ec;border-radius:10px;background:#fff}.mmtKpi small{display:block;color:#6e8392;font-size:11px;font-weight:850}.mmtKpi b{display:block;margin-top:4px;color:#173a57;font-size:23px}.mmtWrap{display:grid;grid-template-columns:1fr;gap:12px}.mmtCaseCard{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap}.mmtMapCard,.mmtCaseCard{min-width:0;border:1px solid #dce6ec;border-radius:12px;background:#fff;overflow:hidden}.mmtHead{display:flex;justify-content:space-between;gap:12px;padding:11px 13px;border-bottom:1px solid #e4ebef;background:#fafcfd}.mmtHead b{color:#173a57;font-size:13px}.mmtHead span{color:#768b99;font-size:10.5px}.mmtBars{padding:10px 13px}
.mmtTreeSvg{display:block;border-radius:8px;overflow:hidden}
.mmtMapCard{position:relative}.mmtBars{padding:14px 342px 12px 62px;min-height:560px}.mmtMatrixWrap{position:relative}.mmtMatrix{position:relative;height:480px;border-left:1px solid #91a5b3;border-bottom:1px solid #91a5b3;background:#fff;overflow:visible}.mmtQuad{position:absolute;width:50%;height:50%;box-sizing:border-box;pointer-events:none}.mmtQuad b{position:absolute;left:50%;transform:translateX(-50%);display:block;width:max-content;padding:5px 10px;border-radius:8px;font-size:15px}.qStable b,.qExcellent b{top:14px}.qImprove b,.qFocus b{bottom:14px}.mmtQuad small{display:block;margin-top:5px;color:#657b8a;font-weight:750}.qStable{left:0;top:0;background:linear-gradient(135deg,#effbf6,#f9fdfb)}.qStable b{background:#d9f5e8;color:#087c56}.qExcellent{right:0;top:0;background:linear-gradient(135deg,#f3f8ff,#eef6ff)}.qExcellent b{background:#dcecff;color:#0866c5}.qImprove{left:0;bottom:0;background:linear-gradient(135deg,#fffaf0,#fffdf8)}.qImprove b{background:#fff0c7;color:#9b6b00}.qFocus{right:0;bottom:0;background:linear-gradient(135deg,#fff8f8,#fff0f0)}.qFocus b{background:#ffe0e0;color:#b51f2c}.mmtHLine,.mmtVLine{position:absolute;z-index:2;pointer-events:none;border-color:#9db0bc;border-style:dashed;opacity:.8}.mmtHLine{left:0;right:0;top:40%;border-width:1px 0 0}.mmtVLine{top:0;bottom:0;left:50%;border-width:0 0 0 1px}.mmtBubble{position:absolute;z-index:5;transform:translate(-50%,50%);display:flex;align-items:center;gap:7px;border:0;background:transparent;cursor:pointer;text-align:left;white-space:nowrap}.mmtBubble i{width:22px;height:22px;border-radius:50%;background:var(--mmt-color);border:3px solid #fff;box-shadow:0 1px 5px #6c849955}.mmtBubble span{max-width:145px;display:flex;flex-direction:column;transform:translateY(var(--label-shift,0));background:rgba(255,255,255,.86);padding:2px 4px;border-radius:5px;box-shadow:0 1px 2px #7891a51c}.mmtBubble b{font-size:11px;color:#173a57}.mmtBubble small{font-size:9.5px;color:#4f6879;font-weight:800}.mmtBubble.on i{outline:3px solid #173a57}.mmtMatrixY{position:absolute;left:-54px;top:0;width:50px;color:#173a57;font-size:11px;font-weight:900}.mmtMatrixY small{display:block;font-size:8px;color:#6f8391}.mmtMatrixX{text-align:right;margin-top:18px;color:#173a57;font-size:11px;font-weight:900}.mmtTicksX i,.mmtTicksY i{position:absolute;font-style:normal;font-size:8px;color:#718695;font-weight:700;pointer-events:none}.mmtTicksX i{bottom:-15px;transform:translateX(-50%)}.mmtTicksY i{left:-34px;transform:translateY(50%)}.mmtRank{position:absolute;right:12px;top:54px;width:312px;height:480px;overflow:hidden;border:1px solid #dce6ec;border-radius:10px;background:#fff;padding:10px;box-sizing:border-box}.mmtRank>b{display:block;margin-bottom:10px;color:#173a57;font-size:16px}.mmtRank>b small{color:#718695;font-size:12.5px}.mmtRankHead,.mmtRankRow{display:grid;grid-template-columns:1fr 58px 52px 50px;gap:5px;align-items:center;font-size:12px}.mmtRankHead{padding:5px 0;color:#708491;font-weight:900;border-bottom:1px solid #e6edf1}.mmtRankRow{position:relative;padding:4px 0 4px 22px;border-bottom:1px solid #edf2f5}.mmtRankRow em{position:absolute;left:0;width:17px;height:17px;border-radius:50%;display:grid;place-items:center;background:#edf3f7;color:#34566d;font-style:normal;font-size:11px;font-weight:900}.mmtRankRow strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#173a57}.mmtRankRow span{text-align:right;color:#4d687a;font-weight:800}
.mmtTreeCell{cursor:pointer}
.mmtTreeCell rect{stroke:#fff;stroke-width:2;transition:opacity .12s}
.mmtTreeCell:hover rect{opacity:.85}
.mmtTreeCell.on rect{stroke:#14304c;stroke-width:3}
.mmtTreeCell text{pointer-events:none}.mmtTreeLeg{display:flex;gap:14px;flex-wrap:wrap;padding:8px 13px 12px;font-size:11px;color:#5c6b7a;font-weight:800}.mmtTreeLeg span{display:flex;align-items:center;gap:5px}.mmtTreeLeg i{width:10px;height:10px;border-radius:3px;display:inline-block}.mmtLegendDetail{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;border-top:1px solid #e6edf1;background:#fafcfd;padding-top:6px;padding-bottom:6px}.mmtLegendDetail span{display:grid;grid-template-columns:10px auto;column-gap:6px;align-items:center}.mmtLegendDetail small{grid-column:2;color:#657d8e;font-size:11.5px;font-weight:750;line-height:1.45}.mmtLegendDetail b{color:#314f64;font-size:13px}.mmtBarRow{display:grid;grid-template-columns:110px 1fr 64px 52px;align-items:center;gap:10px;width:100%;padding:8px 6px;border:0;border-bottom:1px solid #eef2f5;background:#fff;text-align:left;cursor:pointer}
.mmtBarRow:hover{background:#f7fbff}
.mmtBarRow.on{background:#eef7fd}
.mmtBarName{font-size:12.5px;font-weight:850;color:#17394f;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mmtBarTrack{position:relative;height:16px;background:#eef2f5;border-radius:4px;overflow:hidden;display:flex}
.mmtBarKeep{display:block;height:100%;background:#2f8f63}
.mmtBarLost{display:block;height:100%;background:#d7dee3}
.mmtBarRow.none .mmtBarTrack{background:repeating-linear-gradient(45deg,#eef2f5,#eef2f5 4px,#f5f7f8 4px,#f5f7f8 8px)}
.mmtBarNum{font-size:11.5px;font-weight:850;color:#3d5a6c;text-align:right;white-space:nowrap}
.mmtBarPct{font-size:12px;font-weight:900;color:#153a55;text-align:right}
.mmtBarRow.maintained .mmtBarPct{color:#2f8f63}.mmtBarRow.warn .mmtBarKeep{background:#c0392b}.mmtBarRow.warn .mmtBarPct{color:#c0392b}#mmtCasePopup{position:fixed;inset:0;z-index:99990;display:none;align-items:center;justify-content:center;background:rgba(12,35,51,.5);padding:16px}
#mmtCasePopup.on{display:flex}
#mmtCasePopup .mcpBox{width:min(640px,96vw);max-height:86vh;background:#fff;border-radius:14px;display:flex;flex-direction:column;box-shadow:0 24px 70px rgba(6,31,49,.35);overflow:hidden}
#mmtCasePopup .mcpHead{display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid #e3eaf0}
#mmtCasePopup .mcpHead b{font-size:16px;color:#14304c}
#mmtCasePopup .mcpHead span{font-size:12.5px;color:#5c6b7a;font-weight:800}
#mmtCasePopup .mcpHead button{margin-left:auto;width:30px;height:30px;border:1px solid #d7e2e8;border-radius:8px;background:#fff;color:#5d7484;font-size:16px;cursor:pointer}
#mmtCasePopup .mcpBody{overflow:auto;padding:10px}.mmtCases{max-height:548px;overflow:auto;padding:10px}.mmtTeam{display:grid;grid-template-columns:1fr repeat(4,70px);gap:6px;align-items:center;width:100%;padding:8px 9px;border:0;border-bottom:1px solid #edf2f5;background:#fff;text-align:left;cursor:pointer}.mmtTeam.on{background:#edf7ff}.mmtTeam b{color:#173a57;font-size:12px}.mmtTeam span{color:#536f82;font-size:11px;text-align:right}.mmtCase{margin-top:8px;padding:9px;border:1px solid #e1e9ee;border-radius:8px;background:#fbfcfd}.mmtCase button{width:100%;padding:0;border:0;background:transparent;text-align:left;cursor:pointer}.mmtCase b{display:block;color:#173a57;font-size:12px}.mmtCase small{display:block;margin-top:3px;color:#748997;font-size:10.5px}.mmtEmpty{display:grid;place-items:center;min-height:250px;padding:20px;color:#7a8e9c;text-align:center}.mmtDetail{position:fixed;inset:0;z-index:100700;display:none;place-items:center;padding:20px;background:rgba(16,43,67,.36)}.mmtDetail.on{display:grid}.mmtDetailBox{width:min(760px,94vw);max-height:86vh;overflow:auto;border-radius:14px;background:#fff;box-shadow:0 24px 70px rgba(8,30,49,.24)}.mmtDetailHead{display:flex;justify-content:space-between;gap:12px;padding:13px 15px;border-bottom:1px solid #e1e9ef}.mmtDetailHead button{width:32px;height:32px;border:1px solid #d5dee7;border-radius:8px;background:#fff;cursor:pointer}.mmtDetailGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:14px}.mmtField{padding:9px;border:1px solid #e4ebef;border-radius:8px}.mmtField small{display:block;color:#7b8d99;font-size:10px}.mmtField b{display:block;margin-top:3px;color:#25475d;font-size:12px;word-break:break-word}@media(max-width:1100px){.mmtWrap{grid-template-columns:1fr}.mmtKpis{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:700px){.mmtHero{align-items:flex-start;flex-direction:column}.mmtKpis{grid-template-columns:1fr 1fr}.mmtTeam{grid-template-columns:1fr repeat(4,52px);padding:8px 6px}.mmtDetailGrid{grid-template-columns:1fr}}`;document.head.appendChild(s)}
function ensurePopup(){let m=document.getElementById('mmtCasePopup');if(m)return m;m=document.createElement('div');m.id='mmtCasePopup';m.innerHTML='<div class="mcpBox"><div class="mcpHead"><b></b><span></span><button type="button" data-mcp="close">×</button></div><div class="mcpBody"></div></div>';document.body.appendChild(m);
  m.addEventListener('click',e=>{if(e.target===m||e.target.closest('[data-mcp="close"]'))m.classList.remove('on')});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&m.classList.contains('on'))m.classList.remove('on')});
  return m}
function openTeamPopup(t){const m=ensurePopup();m.querySelector('.mcpHead b').textContent=t.team;m.querySelector('.mcpHead span').textContent=`확정 ${t.confirmed} · 유지 ${t.maintained} · 유지율 ${t.rate===null?'—':t.rate+'%'}`;
  const body=m.querySelector('.mcpBody');
  body.innerHTML=t.cases.length?t.cases.map((x,ci)=>`<div class="mmtCase"><button type="button" data-mcp-case="${ci}"><b>${esc(x.workplace||x.title||x.id||'공식확정 Case')}</b><small>${esc(txt(x.judgedAt||x.confirmedAt||x.judgeDate||x.date).slice(0,10)||'—')} · ${esc(x.maintainState||x.auditState||x.status||'유지상태 미기재')}</small></button></div>`).join(''):'<div class="mmtEmpty">공식 확정 Case 없음</div>';
  body.querySelectorAll('[data-mcp-case]').forEach((b,ci)=>b.onclick=()=>openCase(t.cases[ci]));
  m.classList.add('on')}
function ensure(){let el=document.getElementById(ID);if(el)return el;el=document.createElement('section');el.id=ID;el.dataset.dashboardSection='maturity';const anchor=document.querySelector('.beginnerHint')||document.querySelector('.beginnerNav');anchor?.insertAdjacentElement('afterend',el);return el}
function detailModal(){let m=$('.mmtDetail');if(m)return m;m=document.createElement('div');m.className='mmtDetail';m.innerHTML='<div class="mmtDetailBox"><div class="mmtDetailHead"><div><small>OFFICIAL ADVANCEMENT CASE</small><b>고도화 공식확정 Case</b></div><button type="button">×</button></div><div class="mmtDetailGrid"></div></div>';document.body.appendChild(m);const close=()=>m.classList.remove('on');m.querySelector('button').onclick=close;m.onclick=e=>{if(e.target===m)close()};return m}
function openCase(x){const m=detailModal(),g=$('.mmtDetailGrid',m),fields=[['Activity ID',x.id||x.activityId],['생산팀',x.team],['작업장/사례',x.workplace||x.title],['고도화 유형',x.type||x.category],['현장 등록일',txt(x.date||x.importedAt).slice(0,10)],['판정일',txt(x.judgedAt||x.confirmedAt||x.judgeDate).slice(0,10)],['판정자',x.judgeOwner||x.judgeBy||x.confirmedBy],['공식판정',x.judgeState],['유지상태',x.maintainState||x.auditState||x.status||'—'],['확정사유',x.judgeReason||'—']];g.innerHTML=fields.map(([k,v])=>`<div class="mmtField"><small>${esc(k)}</small><b>${esc(v||'—')}</b></div>`).join('');m.classList.add('on')}
function render(){css();const el=ensure(),d=data();
  /* 'Case 필터'(전체/유지미흡/재점검 필요)가 예전엔 화면에 상시 펼쳐져 있던 우측 Case 카드 목록만
     제어했는데, 그 목록을 팝업으로 옮기면서 필터를 눌러도 메인 화면(팀별 막대)엔 아무 변화가 없어
     사실상 죽은 버튼이 돼 있던 것을 발견 → 메인 막대 자체가 이 필터를 반영하도록 재연결.
     '유지미흡'/'재점검 필요' 선택 시: 팀별 막대를 '그 조건에 해당하는 Case 수' 기준으로 다시 계산하고,
     해당 건이 0건인 팀은 목록에서 제외(= 그 문제가 있는 팀만 바로 눈에 띔). */
  const filterMode=document.getElementById(ID)?.dataset.mmtFilter||'all',
    G=window.HD20_MATURITY_MAP_OPERATIONAL_GUARD,
    matchCase=x=>{if(filterMode==='all')return true;if(!G?.stateOf)return true;const st=G.stateOf(x);return filterMode==='weak'?st.performance==='유지미흡':filterMode==='review'?!!st.attention:true};
  let teams=teamStats(d);
  if(filterMode!=='all'){
    teams=teams.map(t=>{const matched=t.cases.filter(matchCase);return{...t,maintained:matched.length,confirmed:t.cases.length,rate:t.cases.length?Math.round(matched.length/t.cases.length*1000)/10:null,cases:matched}}).filter(t=>t.maintained>0).sort((a,b)=>b.maintained-a.maintained||a.team.localeCompare(b.team,'ko'));
  }
  const sumC=d.candidates.length,sumF=d.confirmed.length,sumM=d.maintained.length,rate=sumF?Math.round(sumM/sumF*1000)/10:null,newSecuredRows=window.HD20KPIData?.snapshot?.().newSecured||[],newF=newSecuredRows.length,maxMaintained=Math.max(1,...teams.map(x=>x.maintained),1);el.innerHTML=`<div class="mmtHero"><div><small>고도화 현황</small><h2>고도화 맵</h2><p>공식확정 · 현재 유지상태를 생산팀별로 비교하고 공식 확정 Case까지 Drill-down합니다. (후보는 성과가 아니므로 제외)</p></div><div><small>판정기준</small><b>KPI Canonical 동일판정 · 공식확정만 성과 반영</b></div></div><div class="mmtKpis"><button type="button" class="mmtKpi" data-mmtk="new"><small>올해 신규 공식확정</small><b>${newF}</b></button><button type="button" class="mmtKpi" data-mmtk="conf"><small>누적 공식확정</small><b>${sumF}</b></button><button type="button" class="mmtKpi" data-mmtk="keep"><small>현재 유지</small><b>${sumM}</b></button><div class="mmtKpi"><small>유지율 (현재 유지 ÷ 공식확정)</small><b>${rate===null?'—':rate+'%'}</b></div></div><div class="mmtWrap"><section class="mmtMapCard"><div class="mmtHead"><b>팀별 고도화 Portfolio Map</b><span>Y축=고도화 실행수준(유지55%+Case축적20%+확정전환10%+후보활동량15%) · X축=기존 대비 이탈도(Gap) · 색상=4개 관리영역</span></div><div class="mmtBars"></div><div class="mmtTreeLeg mmtLegendDetail"><span><i style="background:#df3e3e"></i><b>집중 고도화</b><small>고도화 수준 낮음 · 이탈도 높음 → 이탈 원인 확인 및 재고도화 우선</small></span><span><i style="background:#d8a20b"></i><b>보완 필요</b><small>이탈은 낮으나 고도화 수준 낮음 → 실행·Case 축적 중심 보완</small></span><span><i style="background:#15966a"></i><b>안정 운영</b><small>고도화 수준 높음 · 이탈도 낮음 → 현 수준 유지 및 일상관리 강화</small></span><span><i style="background:#1688c9"></i><b>우수 유지</b><small>고도화 수준 높으나 이탈 신호 존재 → 이탈 항목 집중 점검</small></span></div></section><section class="mmtCaseCard"><div class="mmtHead"><b>팀별 공식확정 Case</b><span>팀 선택 → Case 상세</span></div><div class="mmtCases"></div></section></div>`;const bars=$('.mmtBars',el),cases=$('.mmtCases',el);if(!teams.length){bars.innerHTML='<div class="mmtEmpty">고도화 공식확정 원천데이터가 없습니다.</div>';cases.innerHTML='<div class="mmtEmpty">공식 확정 Case가 없습니다.</div>';return el}
  /* Portfolio Map: actual Gap on X, composite maturity score on Y. */
  const maxConfirmed=Math.max(1,...teams.map(t=>t.confirmed));
  const maxCandidates=Math.max(1,...teams.map(t=>t.candidates));
  const enriched=teams.map(t=>{
    const retention=t.rate===null?0:t.rate;
    const volume=Math.min(100,t.confirmed/maxConfirmed*100);
    const conversion=t.candidates?Math.min(100,t.confirmed/t.candidates*100):retention;
    // 고도화 수준은 단순 유지율의 복제가 아니라 유지성과 중심의 복합지수.
    // 실행수준은 유지성과뿐 아니라 실제 후보 발굴량을 함께 반영한다. 설비가 선진화되어 보여도 활동량이 적으면 과대평가하지 않는다.
    const activity=Math.min(100,t.candidates/maxCandidates*100);
    // 후보량과 후보→확정 전환율은 같은 후보 모집단을 공유하므로 합산 시 후보활동을 이중 반영할 수 있다.
    // 실행수준은 유지성과를 중심으로 두되 실제 활동량은 독립 15%만 반영하고 전환율은 10%로 제한한다.
    const level=Math.round((retention*.55+volume*.20+conversion*.10+activity*.15)*10)/10;
    const attrition=t.confirmed?Math.round((t.confirmed-t.maintained)/t.confirmed*1000)/10:0;
    // 이탈은 3대 고도화 요건을 현재 유지하지 못하는 공식확정 Case의 실제 비율이다. 설비 선진화 수준 자체를 활동 실행성과로 대체하지 않는다.
    return {...t,attrition,level,retention,volume:Math.round(volume*10)/10,conversion:Math.round(conversion*10)/10,activity:Math.round(activity*10)/10};
  });
  const mapWrap=document.createElement('div');mapWrap.className='mmtMatrixWrap';
  mapWrap.innerHTML='<div class="mmtMatrixY">고도화 실행수준<small>(유지·Case·전환·활동량)</small></div><div class="mmtMatrix"><div class="mmtQuad qStable"><b>안정 운영</b></div><div class="mmtQuad qExcellent"><b>우수 유지</b></div><div class="mmtQuad qImprove"><b>보완 필요</b></div><div class="mmtQuad qFocus"><b>집중 고도화 대상</b></div><div class="mmtHLine"></div><div class="mmtVLine"></div><div class="mmtTicksX"></div><div class="mmtTicksY"></div></div><div class="mmtMatrixX">기존 대비 이탈도 (Gap) →</div>';
  bars.innerHTML='';bars.appendChild(mapWrap);
  const matrix=$('.mmtMatrix',mapWrap),tx=$('.mmtTicksX',matrix),ty=$('.mmtTicksY',matrix);
  for(let n=0;n<=100;n+=10){tx.insertAdjacentHTML('beforeend','<i style="left:'+n+'%">'+n+'%</i>')}
  for(let n=0;n<=100;n+=20){ty.insertAdjacentHTML('beforeend','<i style="bottom:'+n+'%">'+n+'%</i>')}
  const rowFrag=document.createDocumentFragment();
  const colorOf=t=>t.level>=60?(t.attrition<50?'#188b59':'#247bb5'):(t.attrition<50?'#d9a11b':'#d9473f');
  const coordSeen={},placed=[],displayByTeam=new Map();
  const quadrants=[
    {left:true,upper:true,x0:8,x1:46,y0:64,y1:93},
    {left:false,upper:true,x0:54,x1:94,y0:64,y1:93},
    {left:true,upper:false,x0:8,x1:46,y0:10,y1:55},
    {left:false,upper:false,x0:54,x1:94,y0:10,y1:55}
  ];
  quadrants.forEach(q=>{
    const list=enriched.filter(t=>(t.attrition<50)===q.left&&(t.level>=60)===q.upper)
      .sort((a,b)=>(a.attrition-b.attrition)||(b.level-a.level)||a.team.localeCompare(b.team,'ko'));
    if(!list.length)return;
    const cols=Math.min(4,Math.max(1,Math.ceil(Math.sqrt(list.length*1.35)))),rows=Math.ceil(list.length/cols);
    list.forEach((t,i)=>{
      const col=i%cols,row=Math.floor(i/cols),fx=cols===1?.5:col/(cols-1),fy=rows===1?.5:row/(rows-1);
      const slotX=q.x0+(q.x1-q.x0)*fx,slotY=q.y1-(q.y1-q.y0)*fy;
      // actual coordinates remain the primary signal; slot packing only prevents unreadable overlap.
      const actualX=Math.max(q.x0,Math.min(q.x1,t.attrition)),actualY=Math.max(q.y0,Math.min(q.y1,t.level));
      displayByTeam.set(t.team,{x:actualX*.72+slotX*.28,y:actualY*.72+slotY*.28});
    });
  });
  const displayPoint=t=>{
    const p=displayByTeam.get(t.team)||{x:t.attrition,y:t.level};
    const bx=t.attrition<50?[3,48]:[52,97],by=t.level>=60?[62,96]:[5,58];
    let x=Math.max(bx[0],Math.min(bx[1],p.x)),y=Math.max(by[0],Math.min(by[1],p.y));
    for(let pass=0;pass<12;pass++){
      if(!placed.some(v=>Math.abs(v.x-x)<7&&Math.abs(v.y-y)<5))break;
      x+=t.attrition<50?2:-2;y+=(pass%2?2:-2);
      x=Math.max(bx[0],Math.min(bx[1],x));y=Math.max(by[0],Math.min(by[1],y));
    }
    placed.push({x,y});return{x,y};
  };
  enriched.forEach((t,i)=>{
    const pt=displayPoint(t),px=pt.x,py=pt.y,key=Math.round(px)+'|'+Math.round(py),dup=coordSeen[key]||0;coordSeen[key]=dup+1;
    const dot=document.createElement('button');dot.type='button';dot.className='mmtBubble';dot.style.left=px+'%';dot.style.bottom=py+'%';dot.style.setProperty('--mmt-color',colorOf(t));dot.style.setProperty('--label-shift',dup?((dup%2?1:-1)*(Math.floor(dup/2)+1)*18+'px'):'0px');dot.dataset.actualX=t.attrition;dot.dataset.actualY=t.level;
    dot.innerHTML='<i></i><span><b>'+esc(t.team)+'</b><small>'+t.maintained+'/'+t.confirmed+' · '+(t.rate===null?'—':t.rate+'%')+'</small></span>';
    dot.title=t.team+' · 이탈도 '+t.attrition+'% · 고도화 실행수준 '+t.level+'% (유지 '+t.retention+'% · Case축적 '+t.volume+'% · 전환 '+t.conversion+'% · 활동량 '+t.activity+'%)';matrix.appendChild(dot);
    const row=document.createElement('div');row.innerHTML=`<button type="button" class="mmtTeam"><b>${esc(t.team)}</b><span>확정 ${t.confirmed}</span><span>유지 ${t.maintained}</span><span>${t.rate===null?'—':t.rate+'%'}</span></button><div class="mmtTeamCases" hidden>${t.cases.length?t.cases.map((x,ci)=>`<div class="mmtCase"><button type="button" data-mmt-case="${ci}"><b>${esc(x.workplace||x.title||x.id||'공식확정 Case')}</b><small>${esc(txt(x.judgedAt||x.confirmedAt||x.judgeDate||x.date).slice(0,10)||'—')} · ${esc(x.maintainState||x.auditState||x.status||'유지상태 미기재')}</small></button></div>`).join(''):'<div class="mmtEmpty">공식 확정 Case 없음</div>'}</div>`;rowFrag.appendChild(row);
    const teamBtn=$('.mmtTeam',row),list=$('.mmtTeamCases',row),activate=()=>{$$('.mmtBubble',bars).forEach(v=>v.classList.remove('on'));$$('.mmtTeam',cases).forEach(v=>v.classList.remove('on'));$$('.mmtTeamCases',cases).forEach(v=>v.hidden=true);dot.classList.add('on');teamBtn.classList.add('on');list.hidden=false};
    dot.onclick=()=>{activate();openTeamPopup(t)};teamBtn.onclick=activate;$$('[data-mmt-case]',row).forEach((b,ci)=>b.onclick=()=>openCase(t.cases[ci]));if(i===0)activate();
  });cases.appendChild(rowFrag);
  const side=document.createElement('aside');side.className='mmtRank';side.innerHTML='<b>팀별 현황 <small>(유지요건 이탈 높은 순)</small></b><div class="mmtRankHead"><span>팀명</span><span>달성/전체</span><span>실행률</span><span>이탈도</span></div>'+[...enriched].sort((a,b)=>b.attrition-a.attrition||b.confirmed-a.confirmed).slice(0,10).map((t,i)=>'<div class="mmtRankRow"><em>'+(i+1)+'</em><strong>'+esc(t.team)+'</strong><span>'+t.maintained+'/'+t.confirmed+'</span><span>'+(t.rate===null?'—':t.rate+'%')+'</span><span>'+t.attrition+'%</span></div>').join('');
  $('.mmtMapCard',el).appendChild(side);
  const kpiCols=['생산팀','작업장/사례','등록일','판정일','판정상태'],kpiMapR=x=>[x.team||'—',x.workplace||x.title||x.id||'—',txt(x.date||x.regDate||x.createdAt).slice(0,10)||'—',txt(x.judgedAt||x.confirmedAt||x.judgeDate).slice(0,10)||'—',x.judgeState||'—'];
  const KPI_EV={new:['올해 신규 공식확정 근거',newSecuredRows],conf:['누적 공식확정 근거',d.confirmed],keep:['현재 유지 근거',d.maintained]};
  $$('[data-mmtk]',el).forEach(b=>b.onclick=()=>{const [t,rows]=KPI_EV[b.dataset.mmtk];window.HD20_BOARD_KIT?.openRows?.({title:t,cols:kpiCols,rows:rows.map(kpiMapR),file:'고도화맵_'+b.dataset.mmtk})});
  return el}
function show(){const el=render();el.classList.add('on');el.hidden=false;return true}
function hide(){const el=ensure();el.classList.remove('on');el.hidden=true;$('.mmtDetail')?.classList.remove('on');return true}
function open(){return show()}
function close(){return hide()}
let refreshTimer=0,lastRenderSig='';
function signature(){const d=data(),a=api();const teamSig=teamStats(d).map(t=>[t.team,t.candidates,t.confirmed,t.maintained].join('~')).join('|');const stateSig=d.confirmed.map(x=>[txt(x.id||x.activityId||x.caseId||x.workplace||x.title),(a?.isMaintained||fallbackMaintained)(x)?1:0,txt(x.maintainState||x.auditState||x.status),x.attrition===true?1:0,x.valid===false?0:1].join('~')).sort().join('|');return [d.rows.length,d.candidates.length,d.confirmed.length,d.maintained.length,teamSig,stateSig].join(':')}
function refresh(){clearTimeout(refreshTimer);refreshTimer=setTimeout(()=>{if(window.HD20_NAV?.active?.()!=='dashboard'||window.HD20_DASHBOARD_TABS?.active?.()!=='maturity')return;const sig=signature();if(sig===lastRenderSig)return;lastRenderSig=sig;show()},250)}
function openStable(){const sig=signature(),el=document.getElementById(ID);if(el&&el.dataset.renderSig===sig){el.classList.add('on');el.hidden=false;lastRenderSig=sig;return true}const ok=show(),node=document.getElementById(ID);if(node)node.dataset.renderSig=sig;lastRenderSig=sig;return ok}
window.HD20_MATURITY_MAP_TAB={show:openStable,hide,open:openStable,close,render,data,teamStats,openCase};
window.addEventListener('hd20-open-maturity-map-tab',openStable);window.addEventListener('hd20-close-maturity-map-tab',hide);['hd20-kpi-source-updated','hd20-gmes-5s-imported','hd20-gmes-5s-judged'].forEach(e=>window.addEventListener(e,refresh));document.addEventListener('keydown',e=>{if(e.key==='Escape')$('.mmtDetail.on')?.classList.remove('on')});
function boot(){css();const el=ensure();el.hidden=true}document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();