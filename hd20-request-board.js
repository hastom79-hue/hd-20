/* 5S 개선요청 종합 대시보드 — 사용자가 첨부한 'VTB 개선요청 종합 대시보드'(HD-HiHR/DELMIA Apriso) 구성을 5S 데이터에 맞게 재구성.
   VTB와의 차이(사용자 지시): 개선요청부서 그리드는 따로 두지 않고 '조치대응부서'에 집중. 개선요청 출처는 5S모듈·생산혁신팀 HDPS파트·리더십 3종만 존재.
   데이터: HD20KPIData.actionCases()/seoulDateKey(), HD20ProductionTeamMaster, HD20_HEADCOUNT_MASTER. 차트 엔진은 HD20_BOARD_KIT(hd20-improve-board.js) 재사용.
   주의(데이터 한계, 화면에도 안내): 현재 원천에는 '요청출처' 실제 필드가 없어 auditDrawId 유무로 5S모듈/생산혁신팀 HDPS파트를 추정 표기(리더십 항목은 실제 필드 연결 전까지 0). */
(()=>{'use strict';
const ID='hd20RequestBoard';
const SOURCES=['5S모듈','생산혁신팀 HDPS파트','리더십'];
const S={year:null,month:'',source:'',team:'',status:'',roll:'',selTeam:''};
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
let LEADER_NAMES=null;
function leaderNames(){
  if(LEADER_NAMES)return LEADER_NAMES;
  const set=new Set();
  try{const v=JSON.parse(localStorage.getItem('hd20TeamLeaderMasterV1')||'[]');(Array.isArray(v)?v:[]).forEach(x=>{if(x.leader&&x.leader!=='미지정')set.add(x.leader)})}catch{}
  try{const v=JSON.parse(localStorage.getItem('gmes5s_leadership_names')||'[]');(Array.isArray(v)?v:[]).forEach(n=>{if(n)set.add(n)})}catch{}
  LEADER_NAMES=set;return LEADER_NAMES;
}
function sourceOf(c){
  if(c.requestSource&&SOURCES.includes(c.requestSource))return c.requestSource; // 실제 필드가 들어오면 그대로 사용
  // 리더십 = 경영진·팀장(부서장). 등록자(owner)가 생산팀장 기준정보에 등록된 팀장 이름과 일치하면 리더십으로 분류.
  if(c.owner&&leaderNames().has(c.owner))return '리더십'; // 팀장 기준정보 + 통합기준정보(운영정책)에 등록된 경영진·공장장 명단
  return c.auditDrawId?'생산혁신팀 HDPS파트':'5S모듈'; // 그 외엔 감사 연계=생산혁신팀, 현장 자체 등록=5S모듈로 추정
}
function css(){if(document.getElementById(ID+'Style'))return;const s=document.createElement('style');s.id=ID+'Style';s.textContent=`
#${ID}{background:#fff;border:1px solid #dfe6ec;border-radius:14px;padding:16px 18px;box-shadow:0 1px 3px rgba(20,48,76,.06)}
#${ID} .ibTitle{display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap}#${ID} h2{margin:0;font-size:21px;color:#14304c}
#${ID} .ibNote{margin:4px 0 12px;font-size:13px;font-weight:800;color:#22303f}
#${ID} .rqCaveat{margin:10px 0 0;padding:8px 12px;background:#fdf6e3;border:1px solid #f0dfae;border-radius:8px;color:#8a6d1f;font-size:12.5px;line-height:1.55}
#${ID} .rqKpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin:10px 0 12px}#${ID} .rqKpi{padding:11px 12px;border:1px solid #dce6ec;border-radius:9px;background:#fff}#${ID} .rqKpi small{display:block;font-size:11px;font-weight:850;color:#6e8392}#${ID} .rqKpi b{display:block;margin-top:3px;font-size:21px;color:#173a57}#${ID} .rqKpi.risk b{color:#b33b31}@media(max-width:900px){#${ID} .rqKpis{grid-template-columns:repeat(2,minmax(0,1fr))}}
#${ID} .ibBar{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;padding:10px 12px;background:#f4f7f9;border:1px solid #e3eaf0;border-radius:10px}
#${ID} .ibBar label{display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:850;color:#3b5163}
#${ID} .ibBar select,#${ID} .ibBar input{height:32px;border:1px solid #cfd9e2;border-radius:7px;background:#fff;padding:0 8px;font-size:13px;color:#22303f}
#${ID} .ibBar .sp{flex:1}
#${ID} .ibBar button{height:32px;border-radius:7px;border:1px solid #14304c;background:#14304c;color:#fff;font-weight:850;font-size:13px;padding:0 14px;cursor:pointer}
#${ID} .ibBar button.alt{background:#2c5f8a;border-color:#2c5f8a}
#${ID} .ibRow{display:grid;gap:10px;margin-top:10px}#${ID} .r1{grid-template-columns:minmax(0,3fr) minmax(0,7fr)}#${ID} .rqManageRow{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
#${ID} .ibPanel{border:1px solid #e3eaf0;border-radius:10px;background:#fff;overflow:hidden}
#${ID} .ibHead{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 12px;background:#f1f5f8;border-bottom:1px solid #e3eaf0;font-size:13.5px;font-weight:900;color:#22303f}
#${ID} .ibHead em{font-style:normal;font-size:12.5px;color:#14304c}
#${ID} .ibBody{padding:6px 8px 3px;overflow-x:auto}
#${ID} .ibLeg{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;font-size:11.5px;color:#5c6b7a;font-weight:800;padding:2px 0 6px}#${ID} .ibLeg i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:5px;vertical-align:-1px}
#${ID} .rqGrid{width:100%;border-collapse:collapse;font-size:13px}#${ID} .rqGrid th{position:sticky;top:0;background:#edf4f8;text-align:center;padding:8px;font-size:12px;color:#3b5163;white-space:nowrap}
#${ID} .rqGrid td{padding:7px 8px;border-top:1px solid #edf1f4;text-align:center;color:#22303f;white-space:nowrap}
#${ID} .rqGrid tbody tr:first-child td{font-weight:900;background:#f8fafb}#${ID} .rqGrid tbody tr:first-child td:first-child{text-align:left}
#${ID} .rqGrid td:first-child{text-align:left;font-weight:800}
#${ID} .rqScroll{overflow:auto;border:1px solid #edf1f4;border-radius:8px}#${ID} .ibPanel:has(.rqDetail) .rqScroll{max-height:420px}#${ID} .ibPanel:has(.rqGrid:not(.rqDetail)) .rqScroll{max-height:340px}
#${ID} .rqTeamDetail{margin-top:10px;border-top:1px solid #edf1f4;padding-top:8px}#${ID} .rqTeamDetail summary{cursor:pointer;font-size:12px;font-weight:850;color:#49657b}#${ID} .rqDetail th{white-space:nowrap}#${ID} .rqDetail td{white-space:nowrap;text-align:left}
#${ID} .ibFoot{margin:10px 2px 0;font-size:12px;color:#7a8a97}
.app.awFocused #${ID}{display:none!important}
@media print{#${ID} .ibBar{display:none}}
@media(max-width:1100px){#${ID} .r1,#${ID} .rqManageRow{grid-template-columns:1fr}}`;document.head.appendChild(s)}
function data(){
  const K=window.HD20KPIData,cases=K?.actionCases?.()||[],M=window.HD20ProductionTeamMaster,teams=M?.teamNames?.()||[];
  const years=[...new Set(cases.map(c=>String(c.date||'').slice(0,4)))].filter(Boolean).sort();
  return{cases,teams,years,today:K?.seoulDateKey?.()||new Date().toISOString().slice(0,10)};
}
const mo=c=>+String(c.date||'').slice(5,7),isOverdue=(c,today)=>c.status!=='완료'&&c.due&&c.due<today,isDone=c=>c.status==='완료';
const dayDiff=(a,b)=>Math.round((new Date(b)-new Date(a))/86400000);
function delayDays(c,today){if(!c.due)return null;if(isDone(c)){if(!c.doneDate)return null;const d=dayDiff(c.due,c.doneDate);return d>0?d:null}if(isOverdue(c,today))return dayDiff(c.due,today);return null}
function filt(D,{ignoreYear=false,ignoreMonth=false}={}){
  return D.cases.filter(c=>{if(!ignoreYear&&String(c.date||'').slice(0,4)!==S.year)return false;if(!ignoreMonth&&S.month&&mo(c)!==+S.month)return false;
    if(S.source&&sourceOf(c)!==S.source)return false;if(S.team&&c.team!==S.team)return false;
    if(S.status&&(S.status==='기한초과'?!isOverdue(c,D.today):c.status!==S.status))return false;
    if(S.roll==='Y'&&!c.recurrence)return false;if(S.roll==='N'&&c.recurrence)return false;return true})}
function render(box){
  LEADER_NAMES=null;
  const KIT=window.HD20_BOARD_KIT;if(!KIT||!window.HD20KPIData?.actionCases)return;const {chart,leg,openRows}=KIT,D=data();
  if(!S.year)S.year=D.years.includes(String(new Date().getFullYear()))?String(new Date().getFullYear()):(D.years[D.years.length-1]||String(new Date().getFullYear()));
  const teamsAll=D.teams.filter(t=>!S.team||t===S.team),rowsY=filt(D,{ignoreMonth:true}).filter(c=>teamsAll.includes(c.team)),rowsM=S.month?rowsY.filter(c=>mo(c)===+S.month):rowsY;
  const allEver=D.cases.filter(c=>teamsAll.includes(c.team)),doneEver=allEver.filter(isDone),openRate=allEver.length?Math.round(doneEver.length/allEver.length*1000)/10:0;
  const doneYear=rowsY.filter(isDone),yearRate=rowsY.length?Math.round(doneYear.length/rowsY.length*1000)/10:0;
  // ① 요청출처별 — 표시 순서는 통합기준정보('요청출처 순서')에서 관리, 기본값 리더십>5S모듈>생산혁신팀 HDPS파트
  const srcCats=window.HD20_REQUEST_SOURCE_ORDER?.get?.()||SOURCES,srcReg=srcCats.map(s=>rowsM.filter(c=>sourceOf(c)===s).length),srcOpen=srcCats.map(s=>rowsM.filter(c=>sourceOf(c)===s&&!isDone(c)).length);
  const srcOpenPct=srcCats.map((s,i)=>srcReg[i]?Math.round(srcOpen[i]/srcReg[i]*1000)/10:null);
  const A=chart({w:Math.floor((box.clientWidth-36)*.3)-8,cats:srcCats,minSlot:78,series:[{name:'요청',vals:srcReg,color:'#5c6b7a'},{name:'미완료',vals:srcOpen,color:'#e0b03c',widthScale:1.5,pct:srcOpenPct}]});
  // ② 월별
  const ML=Array.from({length:12},(_,i)=>String(i+1).padStart(2,'0')+'월');
  const regM=Array.from({length:12},(_,i)=>rowsY.filter(c=>mo(c)===i+1).length);
  const openM=Array.from({length:12},(_,i)=>rowsY.filter(c=>mo(c)===i+1&&!isDone(c)).length);
  const doneM=Array.from({length:12},(_,i)=>rowsY.filter(c=>mo(c)===i+1&&isDone(c)).length);
  const donePct=doneM.map((v,i)=>regM[i]?Math.round(v/regM[i]*100):null);
  const B=chart({w:Math.floor((box.clientWidth-36)*.7)-20,cats:ML,minSlot:60,series:[{name:'요청',vals:regM,color:'#8fa3b3'},{name:'미완료',vals:openM,color:'#e0b03c',widthScale:1.5,pct:openM.map((v,i)=>regM[i]?Math.round(v/regM[i]*100):null)}]});
  // ③ 조치대응부서 진행현황
  /* 가로축 정렬: 통합기준정보(표시순서)에서 관리하는 생산팀 순서를 그대로 따름(값 기준 정렬 안 함) */
  const teamOrder=(()=>{try{const v=JSON.parse(localStorage.getItem('gmes5s_team_display_order')||'null');if(Array.isArray(v)&&v.length)return v}catch{}return window.HD20ProductionTeamMaster?.teamNames?.()||null})();
  const orderIdx=t=>{const i=teamOrder?teamOrder.indexOf(t):-1;return i<0?999:i};
  const teamRows=teamsAll.map(t=>{const a=rowsM.filter(c=>c.team===t),done=a.filter(isDone).length,over=a.filter(c=>isOverdue(c,D.today)).length,open=a.length-done-over,pct=n=>a.length?Math.round(n/a.length*1000)/10:0;
    return{team:t,total:a.length,done,open,over,pct}}).filter(r=>r.total>0).sort((a,b)=>orderIdx(a.team)-orderIdx(b.team)||a.team.localeCompare(b.team,'ko'));
  // 조치 지연 리드타임: 완료 늦은 건 + 진행 중 기한경과 건을 모두 포함해 팀별 평균 지연일수를 계산(지연이 없으면 표에서 제외).
  const delayRows=teamsAll.map(t=>{const a=rowsM.filter(c=>c.team===t).map(c=>delayDays(c,D.today)).filter(v=>v!==null);
    return{team:t,n:a.length,avg:a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length*10)/10:0,max:a.length?Math.max(...a):0}}).filter(r=>r.n>0).sort((a,b)=>b.n-a.n||b.avg-a.avg);
  const delayChart=delayRows.length?chart({w:box.clientWidth-40,h:260,cats:delayRows.map(r=>r.team),rotate:true,linkX:true,sel:S.selTeam,minSlot:64,
    topExtra:delayRows.map(r=>({text:`평균 ${r.avg}일 · 최대 ${r.max}일`,color:'#c0392b'})),
    series:[{name:'기한초과 건수',vals:delayRows.map(r=>r.n),color:'#c0392b'}],
    colorOf:()=>'#c0392b'}):null;
  const delayOverallAvg=delayRows.length?Math.round(delayRows.reduce((a,r)=>a+r.avg*r.n,0)/delayRows.reduce((a,r)=>a+r.n,0)*10)/10:0;
  const sum={total:teamRows.reduce((a,r)=>a+r.total,0),done:teamRows.reduce((a,r)=>a+r.done,0),open:teamRows.reduce((a,r)=>a+r.open,0),over:teamRows.reduce((a,r)=>a+r.over,0)}; // open=기한내 미완료, 전체 미완료=open+over
  const pctS=n=>sum.total?Math.round(n/sum.total*1000)/10:0;
  if(!S.selTeam||!teamRows.some(r=>r.team===S.selTeam))S.selTeam=teamRows[0]?.team||'';
  /* 누적 막대는 맨 아래(완료) 칸만 팀 간 비교가 쉽고, 맨 위 칸(기한경과)은 시작 높이가 팀마다 달라 눈으로
     비교하기 어려움 — 막대 순서는 그대로 두되, 가장 중요한 위험 신호인 기한경과 건수를 막대 위에 빨간 글자로
     따로 병기해 굳이 칸 높이를 비교하지 않아도 바로 보이게 함(0건인 팀은 표시 생략). */
  const backlogRows=[...teamRows].filter(r=>r.open+r.over>0).sort((a,b)=>(b.open+b.over)-(a.open+a.over)||b.over-a.over||orderIdx(a.team)-orderIdx(b.team));
  const backlogExtra=backlogRows.map(r=>({text:`미조치 ${r.open+r.over} · 초과 ${r.over}`,color:r.over?'#c0392b':'#526b7a'}));
  const teamChart=chart({w:box.clientWidth-40,h:280,cats:backlogRows.map(r=>r.team),rotate:true,minSlot:72,topExtra:backlogExtra,
    series:[{name:'미조치 잔량',vals:backlogRows.map(r=>r.open+r.over),color:'#6f8797'}]});
  const selRows=D.cases.filter(c=>c.team===S.selTeam&&(!S.source||sourceOf(c)===S.source)),selYearRows=selRows.filter(c=>String(c.date||'').slice(0,4)===S.year);
  const selRegM=Array.from({length:12},(_,i)=>selYearRows.filter(c=>mo(c)===i+1).length),selDoneM=Array.from({length:12},(_,i)=>selYearRows.filter(c=>mo(c)===i+1&&isDone(c)).length);
  const teamTrend=chart({w:box.clientWidth-40,h:230,cats:ML,per:false,series:[{name:'등록',vals:selRegM,color:'#8fa3b3'},{name:'완료',vals:selDoneM,color:'#1f6f6b'}]});
  const gridRow=r=>`<tr><td>${esc(r.team)}</td><td>${r.total}</td><td>${r.done}건 (${sum.total?Math.round(r.done/(r.total||1)*1000)/10:0}%)</td><td>${r.open}건</td><td>${r.over}건</td></tr>`;
  const teamGrid=`<table class="rqGrid"><thead><tr><th>조치대응부서</th><th>합계</th><th>개선완료</th><th>개선진행/대기</th><th>기한경과</th></tr></thead><tbody>
    <tr><td>합계</td><td>${sum.total}</td><td>${sum.done}건 (${pctS(sum.done)}%)</td><td>${sum.open}건 (${pctS(sum.open)}%)</td><td>${sum.over}건 (${pctS(sum.over)}%)</td></tr>
    ${teamRows.map(gridRow).join('')}</tbody></table>`;
  // ④ 상세내용
  const priorityRank=x=>isOverdue(x,D.today)?0:!isDone(x)?1:2;
  const detailAll=[...rowsM].sort((a,b)=>priorityRank(a)-priorityRank(b)||(delayDays(b,D.today)||0)-(delayDays(a,D.today)||0)||String(a.due||'9999-12-31').localeCompare(String(b.due||'9999-12-31'))||String(b.date).localeCompare(String(a.date)));
  const actionAll=detailAll.filter(x=>!isDone(x)),detailRows=actionAll.slice(0,15);
  const detail=`<table class="rqGrid rqDetail"><thead><tr><th>우선</th><th>요청번호</th><th>조치대응부서</th><th>작업장</th><th>현재상태</th><th>초과일</th><th>완료예정일</th></tr></thead><tbody>
    ${detailRows.length?detailRows.map((c,i)=>`<tr><td>${i+1}</td><td>${esc(c.id)}</td><td>${esc(c.team)}</td><td>${esc(c.workplace||'—')}</td><td>${isOverdue(c,D.today)?'<b style="color:#c0392b">기한초과</b>':esc(c.status)}</td><td>${delayDays(c,D.today)??'—'}</td><td>${esc(c.due||'—')}</td></tr>`).join(''):`<tr><td colspan="7" style="text-align:center;color:#8a99a6;padding:16px">조건에 해당하는 개선요청이 없습니다.</td></tr>`}
    </tbody></table>`;
  const opt=(a,cur,all='ALL')=>`<option value="">${all}</option>`+a.map(x=>`<option value="${esc(x)}"${x===cur?' selected':''}>${esc(x)}</option>`).join('');
  box.innerHTML=`<div class="ibTitle"><h2>5S 개선요청 종합 대시보드</h2></div><p class="ibNote">개선요청 발생 → 처리 → 미조치·기한초과 → 즉시조치 대상을 한 화면에서 관리합니다.</p>
<div class="rqKpis"><div class="rqKpi"><small>개선요청</small><b>${sum.total}건</b></div><div class="rqKpi"><small>개선완료</small><b>${sum.done}건 · ${pctS(sum.done)}%</b></div><div class="rqKpi"><small>미완료</small><b>${sum.open+sum.over}건 · ${pctS(sum.open+sum.over)}%</b></div><div class="rqKpi risk"><small>기한초과</small><b>${sum.over}건 · ${pctS(sum.over)}%</b></div><div class="rqKpi risk"><small>평균 초과일</small><b>${delayOverallAvg}일</b></div></div>
<div class="ibBar"><label>공장 <select disabled><option>[울산] 울산캠퍼스</option></select></label><label>년 <select data-f="year">${D.years.map(y=>`<option${y===S.year?' selected':''}>${y}</option>`).join('')}</select></label>
<label>월 <select data-f="month"><option value="">전체</option>${Array.from({length:12},(_,i)=>{const v=String(i+1).padStart(2,'0');return `<option value="${v}"${v===S.month?' selected':''}>${i+1}월</option>`}).join('')}</select></label><button type="button" data-rq="go">조회</button>
<label>요청출처 <select data-f="source">${opt(SOURCES,S.source)}</select></label><label>조치대응부서 <select data-f="team">${opt(D.teams,S.team)}</select></label>
<label>처리상태 <select data-f="status"><option value="">ALL</option><option>조치대기</option><option>진행중</option><option>완료</option><option>기한초과</option></select></label>
<label>재발 <select data-f="roll"><option value="">ALL</option><option value="Y">재발 있음</option><option value="N">재발 없음</option></select></label>
<span class="sp"></span><button type="button" class="alt" data-rq="print">프린트</button><button type="button" class="alt" data-rq="csv">엑셀다운로드(상세내용)</button></div>
<div class="ibRow r1"><div class="ibPanel"><div class="ibHead">개선요청 발생현황<button type="button" class="ibEv" data-evk="a">근거 데이터</button><em>${S.month?+S.month+'월':'연간누적'} · 요청출처별 · 미완료율 함께 표시</em></div><div class="ibBody">${A}${leg([['요청','#5c6b7a'],['미완료','#e0b03c']])}</div></div>
<div class="ibPanel"><div class="ibHead">월별 요청·미완료 추이<button type="button" class="ibEv" data-evk="b">근거 데이터</button><em>누적완료율 ${openRate}% · ${S.year}년 완료율 ${yearRate}%</em></div><div class="ibBody">${B}${leg([['요청','#8fa3b3'],['미완료','#e0b03c']])}</div></div></div>
<div class="ibRow rqManageRow"><div class="ibPanel"><div class="ibHead">팀별 미조치 현황<button type="button" class="ibEv" data-evk="c">근거 데이터</button><em>미조치 잔량이 많은 팀 순 · 표기=미조치 총량·기한초과</em></div><div class="ibBody">${teamChart}${leg([['미조치 잔량','#6f8797']])}<details class="rqTeamDetail"><summary>팀별 수치 상세보기</summary><div class="rqScroll" style="margin-top:10px">${teamGrid}</div></details></div></div><div class="ibPanel"><div class="ibHead">기한초과 집중관리<button type="button" class="ibEv" data-evk="d">근거 데이터</button><em>기한초과 ${delayRows.reduce((a,r)=>a+r.n,0)}건 · 평균 초과 ${delayOverallAvg}일 · 막대=건수 / 표기=평균·최대 초과일</em></div><div class="ibBody">${delayChart||'<p style="padding:20px;color:#8a99a6;text-align:center">현재 기한초과 대상이 없습니다.</p>'}${delayChart?leg([['기한초과 건수','#c0392b']]):''}</div></div></div>
<div class="ibRow"><div class="ibPanel"><div class="ibHead">즉시조치 대상<button type="button" class="ibEv" data-evk="f">전체 보기</button><em>기한초과·미완료 우선 · 미리보기 ${detailRows.length}건 / 미완료 ${actionAll.length}건</em></div><div class="ibBody"><div class="rqScroll">${detail}</div></div></div></div>
<p class="rqCaveat">※ 요청출처는 5S모듈·생산혁신팀 HDPS파트·리더십 3종입니다. 현재 원천에 출처 필드가 없어 등록자와 Audit 연계 여부로 일부 출처를 추정합니다. 팀별 수치 Grid는 메인 판단 흐름을 방해하지 않도록 상세보기로 접었습니다.</p><p class="ibFoot">※ 관리순서: 요청 발생 확인 → 미완료 팀 식별 → 기한초과 집중관리 → 실제 조치 대상 확인. 상세 전체보기와 엑셀다운로드는 현재 조회조건을 그대로 사용합니다.</p>`
  const evCols=['요청번호','요청출처','조치대응부서','작업장','진행현황','요청일','완료예정일','완료일'],
    evMapR=c=>[esc(c.id),sourceOf(c),c.team,c.workplace||'—',c.status,c.date,c.due||'—',c.doneDate||'—'],
    evDelayCols=[...evCols,'지연일수'],evDelayMapR=c=>[...evMapR(c),delayDays(c,D.today)??''];
  const EV={
    a:['요청출처별 근거 데이터 ('+(S.month?+S.month+'월':'연간누적')+')',rowsM,evCols,evMapR],
    b:['월별 근거 데이터 ('+S.year+'년)',rowsY,evCols,evMapR],
    c:['조치대응부서 근거 데이터 ('+(S.month?+S.month+'월':'연간누적')+')',rowsM,evCols,evMapR],
    d:['조치 지연 근거 데이터 ('+(S.month?+S.month+'월':'연간누적')+')',rowsM.filter(c=>delayDays(c,D.today)!==null),evDelayCols,evDelayMapR],
    f:['즉시조치 대상 전체 보기 ('+(S.month?+S.month+'월':'연간누적')+')',actionAll,evCols,evMapR],
  };
  box.querySelectorAll('[data-evk]').forEach(b=>{b.onclick=()=>{const [t,rows,cols,mapR]=EV[b.dataset.evk];openRows({title:t,cols,rows:rows.map(mapR),file:'5S_개선요청_근거_'+b.dataset.evk})}});
  box.querySelectorAll('[data-f]').forEach(el=>el.onchange=()=>{S[el.dataset.f]=el.value;render(box)});
  box.querySelector('[data-rq="go"]').onclick=()=>render(box);box.querySelector('[data-rq="print"]').onclick=()=>window.print();
  box.querySelector('[data-rq="csv"]').onclick=()=>{
    const out=[['5S 개선요청 종합 대시보드',S.year+'년',S.month?S.month+'월':'연간누적'],[],['요청번호','요청출처','조치대응부서','작업장','진행현황','요청일','완료예정일','완료일']];
    rowsM.forEach(c=>out.push([c.id,sourceOf(c),c.team,c.workplace||'',isOverdue(c,D.today)?'기한경과':c.status,c.date||'',c.due||'',c.doneDate||'']));
    const text='\ufeff'+out.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n'),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'}));a.download=`5S_개선요청종합_${S.year}${S.month||''}.csv`;document.body.appendChild(a);a.click();a.remove()};
}
function ensure(){
  if(!window.HD20_BOARD_KIT||!window.HD20KPIData?.actionCases||!window.HD20ProductionTeamMaster)return false;
  css();let box=document.getElementById(ID);
  if(!box){const anchor=document.getElementById('hd20ImproveBoard')||document.getElementById('hd20DashboardPriority')||document.querySelector('.cards');if(!anchor)return false;box=document.createElement('section');box.id=ID;anchor.insertAdjacentElement('afterend',box);
    const T=window.HD20_DASHBOARD_TABS;if(T?.apply)T.apply(T.active?.()||'summary',{scroll:false})}
  render(box);return true}
let tries=0;(function boot(){if(!ensure()&&tries++<80)setTimeout(boot,150)})();
document.addEventListener('click',e=>{if(e.target.closest?.('#hd20DashboardSectionTabs button[data-dashboard-section="request"]'))setTimeout(()=>{const b=document.getElementById(ID);if(b)render(b)},80)},true);
['hd20-kpi-source-updated','hd20-action-updated','hd20-policy-updated'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(()=>{const b=document.getElementById(ID);if(b&&b.offsetParent!==null)render(b)},80)));
let rz;window.addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{const b=document.getElementById(ID);if(b&&b.offsetParent!==null)render(b)},250)});
window.HD20_REQUEST_BOARD={render:()=>{const b=document.getElementById(ID);if(b)render(b)},state:S};
})();
