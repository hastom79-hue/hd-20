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

/* Unified restrained dashboard visual system: one typography and spacing scale. */
#${ID}{max-width:100%;box-sizing:border-box;padding:20px 22px;border-color:#dbe4eb;border-radius:12px;box-shadow:0 2px 10px rgba(24,49,69,.035)}
#${ID} .ibTitle{align-items:center;gap:8px 16px;padding-bottom:12px;border-bottom:1px solid #e9eef2}
#${ID} h2{font-size:19px;letter-spacing:-.035em;line-height:1.35;font-weight:850}
#${ID} .ibNote{font-size:12px;line-height:1.5;font-weight:600;color:#64788a;margin:7px 0 12px}
#${ID} .ibBar{gap:8px 14px;padding:12px 14px;background:#f8fafc;border-color:#e5ebf0;border-radius:8px}
#${ID} .ibBar label{font-size:12px;font-weight:700;color:#455d70}
#${ID} .ibBar select,#${ID} .ibBar input{min-width:0;max-width:100%;height:34px;border-color:#d7e0e8;border-radius:6px;font-size:12px}
#${ID} .ibBar button{height:34px;font-size:12px;font-weight:750;border-radius:6px}
#${ID} .ibRow{gap:12px;margin-top:12px}
#${ID} .ibPanel{min-width:0;border-color:#e0e8ee;border-radius:9px;box-shadow:none}
#${ID} .ibHead{min-height:38px;box-sizing:border-box;padding:9px 13px;background:#f7f9fb;border-bottom-color:#e5ebf0;font-size:13px;line-height:1.35;font-weight:800}
#${ID} .ibHead em{font-size:11px;font-weight:650;color:#718494}
#${ID} .ibBody{padding:12px;min-width:0}
#${ID} .ibLeg{gap:8px 14px;font-size:11px;font-weight:650;color:#718494}
#${ID} .ibFoot{font-size:11px;line-height:1.6;color:#81909e}
#${ID} .ibKpis,#${ID} .rqKpis{gap:10px;margin:12px 0}
#${ID} .ibKpi,#${ID} .rqKpi{min-width:0;padding:12px 14px;border-color:#e2e9ef;border-radius:8px;background:#fcfdfe}
#${ID} .ibKpi small,#${ID} .rqKpi small{font-size:11px;font-weight:650;line-height:1.4}
#${ID} .ibKpi b,#${ID} .rqKpi b{font-size:22px;font-weight:800;letter-spacing:-.03em;font-variant-numeric:tabular-nums}
#${ID} .rqGrid{font-size:12px}
#${ID} .rqGrid th{padding:9px 10px;font-weight:750;background:#f5f8fa}
#${ID} .rqGrid td{padding:9px 10px}
#${ID} .rqGrid tbody tr:hover td{background:#f8fafc}
#${ID} .rqCaveat{background:#fffaf0;border-color:#f0e7d1;color:#786b51;font-size:11px}
@media(max-width:700px){#${ID}{padding:12px;border-radius:9px}#${ID} .ibTitle{align-items:flex-start}#${ID} h2{font-size:17px}#${ID} .ibBar{padding:10px;gap:8px}#${ID} .ibBar label{flex:1 1 135px;justify-content:space-between}#${ID} .ibBar select{max-width:65%}#${ID} .ibBar .sp{display:none}#${ID} .ibBar button{flex:1 1 auto}#${ID} .ibBody{padding:8px}#${ID} .ibHead{padding:8px 10px}}


#${ID} .rqV2Kpis{grid-template-columns:repeat(6,minmax(0,1fr));gap:9px}
#${ID} .rqKpiHint{display:block;margin-top:5px;color:#7b8d9b;font-size:10px;line-height:1.4}
#${ID} .rqStatus{display:grid;gap:16px;padding:10px 6px}
#${ID} .rqStatus>div{display:grid;grid-template-columns:1fr auto;gap:7px;font-size:12px;color:#4a6072}
#${ID} .rqStatus strong{font-variant-numeric:tabular-nums;color:#233d51}
#${ID} .rqTrack{grid-column:1/-1;background:#eef2f5;height:9px;border-radius:5px;overflow:hidden}
#${ID} .rqTrack i{display:block;height:100%;border-radius:5px}
#${ID} .rqBands{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:12px}
#${ID} .rqBands>div{padding:13px;background:#f8fafc;border:1px solid #e7edf1;border-radius:8px;text-align:center}
#${ID} .rqBands small{display:block;color:#718494;font-size:11px}
#${ID} .rqBands b{display:block;margin-top:5px;color:#a95045;font-size:20px}
#${ID} .rqEmpty{padding:24px;text-align:center;color:#8092a0}
#${ID} .ibHead{flex-wrap:wrap}
#${ID} .ibHead .ibEv{margin-left:auto}
@media(max-width:1100px){#${ID} .rqV2Kpis{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:600px){#${ID} .rqV2Kpis{grid-template-columns:repeat(2,minmax(0,1fr))}}


#${ID} .rqMatrixScroll,#${ID} .rqRiskScroll{overflow:auto;max-height:520px}
#${ID} .rqMatrix,#${ID} .rqRiskTable{width:100%;border-collapse:collapse;font-size:12px}
#${ID} .rqMatrix th,#${ID} .rqRiskTable th{position:sticky;top:0;background:#f5f8fa;padding:9px;text-align:left;white-space:nowrap}
#${ID} .rqMatrix td,#${ID} .rqRiskTable td{border-top:1px solid #e9eef2;padding:7px 9px}
#${ID} .rqMatrix td:nth-child(2){width:60%}#${ID} .rqMatrix td:last-child,#${ID} .rqRiskTable td:not(:first-child){text-align:center}
#${ID} .rqStack{height:15px;display:flex;background:#edf1f4;border-radius:4px;overflow:hidden;min-width:160px}
#${ID} .rqStack span{display:block;height:100%}#${ID} .rqStackDone{background:#26847f}#${ID} .rqStackOpen{background:#e5b668}#${ID} .rqStackLate{background:#c45143}
#${ID} .rqLegend{display:flex;gap:15px;flex-wrap:wrap;margin-top:12px;font-size:11px}#${ID} .rqLegend span:first-child{color:#26847f}#${ID} .rqLegend span:nth-child(2){color:#ad812f}#${ID} .rqLegend span:last-child{color:#c45143}
#${ID} .rqHeat{display:block;border-radius:5px;padding:9px;min-width:42px;text-align:center}#${ID} .rqHeatHigh{background:#b9473b;color:#fff}#${ID} .rqHeatMid{background:#db8e72;color:#fff}#${ID} .rqHeatLow{background:#f4d7c6;color:#713e30}#${ID} .rqHeatZero{background:#f4f6f8;color:#758899}
#${ID} .rqDelayStack{display:flex;height:17px;overflow:hidden;border-radius:5px;margin:3px 0 16px;background:#edf1f4}#${ID} .rqDelayBand{display:block;height:100%}#${ID} .rqDelayBand0{background:#e6ba73}#${ID} .rqDelayBand1{background:#d98454}#${ID} .rqDelayBand2{background:#b9473b}
#${ID} .rqBars{display:grid;gap:16px;padding:10px 5px}
#${ID} .rqBarItem{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px 12px;align-items:center;font-size:12px;color:#465c6d}
#${ID} .rqBarItem strong{font-variant-numeric:tabular-nums;font-weight:800;color:#28465b}
#${ID} .rqBarItem .rqTrack{grid-column:1/-1;height:11px}
#${ID} .rqBarItem small{font-size:10px;color:#8495a3;font-weight:500}
#${ID} .rqDonutWrap{display:grid;grid-template-columns:minmax(130px,180px) minmax(0,1fr);gap:18px;align-items:center;padding:10px}
#${ID} .rqDonutWrap svg{width:100%;max-width:180px}
#${ID} .rqDonutLegend{display:grid;gap:13px}
#${ID} .rqDonutLegend>div{display:grid;grid-template-columns:10px 1fr auto;align-items:center;gap:8px;font-size:11px;color:#526779}
#${ID} .rqDonutLegend i{height:10px;border-radius:2px}
#${ID} .rqDonutLegend b{color:#244258;font-variant-numeric:tabular-nums}
@media(max-width:550px){#${ID} .rqDonutWrap{grid-template-columns:1fr;justify-items:center}#${ID} .rqDonutLegend{width:100%}}
.app.awFocused #${ID}{display:none!important}
@media print{#${ID} .ibBar{display:none}}
@media(max-width:1100px){#${ID} .r1,#${ID} .rqManageRow{grid-template-columns:1fr}}`;document.head.appendChild(s)}
function data(){
  const K=window.HD20KPIData,rawCases=K?.actionCases?.()||[],cases=rawCases.map(c=>({...c,date:c.date||c.createdAt||c.regDate||'',due:c.due||c.dueDate||'',doneDate:c.doneDate||c.completedAt||''})),M=window.HD20ProductionTeamMaster,masterTeams=M?.teamNames?.()||[],teams=[...new Set([...masterTeams,...cases.map(c=>c.team).filter(Boolean)])];
  const years=[...new Set(cases.map(c=>String(c.date||'').slice(0,4)))].filter(y=>/^\d{4}$/.test(y)).sort();
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
  const KIT=window.HD20_BOARD_KIT;if(!KIT||!window.HD20KPIData?.actionCases){box.innerHTML='<h2>5S 개선요청 종합 대시보드</h2><p role="status">데이터 조회 모듈을 연결 중입니다.</p>';return}const {chart,leg,openRows}=KIT,D=data();
  if(!S.year||!D.years.includes(S.year))S.year=D.years.includes(String(new Date().getFullYear()))?String(new Date().getFullYear()):(D.years[D.years.length-1]||String(new Date().getFullYear()));
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
  // 현재 기한초과 집중관리: 완료건의 과거 지연은 제외하고, 지금 미완료이면서 기한을 넘긴 건만 집계.
  const delayRows=teamsAll.map(t=>{const a=rowsM.filter(c=>c.team===t&&!isDone(c)&&isOverdue(c,D.today)).map(c=>delayDays(c,D.today)).filter(v=>v!==null);
    return{team:t,n:a.length,avg:a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length*10)/10:0,max:a.length?Math.max(...a):0}}).filter(r=>r.n>0).sort((a,b)=>b.n-a.n||b.avg-a.avg);
  const delayChart=delayRows.length?'<div class="rqRiskScroll"><table class="rqRiskTable"><thead><tr><th>조치대응팀</th><th>1~7일</th><th>8~14일</th><th>15일+</th><th>총 초과</th></tr></thead><tbody>'+delayRows.map(r=>{const c=rowsM.filter(x=>x.team===r.team&&isOverdue(x,D.today));const v=[c.filter(x=>delayDays(x,D.today)<=7).length,c.filter(x=>delayDays(x,D.today)>=8&&delayDays(x,D.today)<=14).length,c.filter(x=>delayDays(x,D.today)>=15).length];return{team:r.team,v,total:r.n}}).sort((a,b)=>b.v[2]-a.v[2]||b.total-a.total).map(r=>'<tr><td>'+esc(r.team)+'</td>'+r.v.map(n=>'<td><span class="rqHeat '+(n>=7?'rqHeatHigh':n>=4?'rqHeatMid':n?'rqHeatLow':'rqHeatZero')+'">'+n+'</span></td>').join('')+'<td><strong>'+r.total+'</strong></td></tr>').join('')+'</tbody></table></div>':null;
  const activeOverdue=rowsM.filter(c=>teamsAll.includes(c.team)&&isOverdue(c,D.today));
  const delayOverallAvg=activeOverdue.length?Math.round(activeOverdue.reduce((a,c)=>a+(delayDays(c,D.today)||0),0)/activeOverdue.length*10)/10:0;
  const sum={total:teamRows.reduce((a,r)=>a+r.total,0),done:teamRows.reduce((a,r)=>a+r.done,0),open:teamRows.reduce((a,r)=>a+r.open,0),over:teamRows.reduce((a,r)=>a+r.over,0)}; // open=기한내 미완료, 전체 미완료=open+over
  const pctS=n=>sum.total?Math.round(n/sum.total*1000)/10:0;
  if(!S.selTeam||!teamRows.some(r=>r.team===S.selTeam))S.selTeam=teamRows[0]?.team||'';
  /* 팀별 미조치 현황은 현재 backlog 총량을 보여주고, 별도 기한초과 패널에서 그중 지연 Risk의 심각도를 본다. */
  const backlogRows=[...teamRows].filter(r=>r.open+r.over>0).sort((a,b)=>(b.open+b.over)-(a.open+a.over)||b.over-a.over||orderIdx(a.team)-orderIdx(b.team));
  const backlogExtra=backlogRows.map(r=>({text:`미조치 ${r.open+r.over} · 초과 ${r.over}`,color:r.over?'#c0392b':'#526b7a'}));
  const teamChart=chart({w:box.clientWidth-40,h:280,cats:backlogRows.map(r=>r.team),rotate:true,minSlot:72,topExtra:backlogExtra,
    series:[{name:'미조치 잔량',vals:backlogRows.map(r=>r.open+r.over),color:'#6f8797'}]});
  const selRows=D.cases.filter(c=>c.team===S.selTeam&&(!S.source||sourceOf(c)===S.source)),selYearRows=selRows.filter(c=>String(c.date||'').slice(0,4)===S.year);
  const selRegM=Array.from({length:12},(_,i)=>selYearRows.filter(c=>mo(c)===i+1).length),selDoneM=Array.from({length:12},(_,i)=>selYearRows.filter(c=>mo(c)===i+1&&isDone(c)).length);
  const teamTrend=chart({w:box.clientWidth-40,h:230,cats:ML,per:false,series:[{name:'등록',vals:selRegM,color:'#8fa3b3'},{name:'완료',vals:selDoneM,color:'#1f6f6b'}]});
  const gridRow=r=>`<tr><td>${esc(r.team)}</td><td>${r.total}</td><td>${r.done}건 (${sum.total?Math.round(r.done/(r.total||1)*1000)/10:0}%)</td><td>${r.open}건</td><td>${r.over}건</td></tr>`;
  const teamGrid=`<table class="rqGrid"><thead><tr><th>조치대응부서</th><th>합계</th><th>개선완료</th><th>기한내 미완료</th><th>기한초과</th></tr></thead><tbody>
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

  // V2: Monthly completions use actual completion dates; backlog carries open cases from earlier periods.
  const monthlyDone=Array.from({length:12},(_,i)=>filt(D,{ignoreYear:true,ignoreMonth:true}).filter(x=>teamsAll.includes(x.team)&&isDone(x)&&String(x.doneDate||'').slice(0,7)===S.year+'-'+String(i+1).padStart(2,'0')).length);
  const monthlyTrend=chart({w:Math.max(440,box.clientWidth-85),cats:ML,minSlot:58,series:[{name:'신규 요청',vals:regM,color:'#829db5'},{name:'완료',vals:monthlyDone,color:'#247c83'}]});
  const teamCompletion=chart({w:Math.max(440,box.clientWidth-85),h:260,cats:teamRows.map(r=>r.team),rotate:true,minSlot:64,series:[{name:'완료',vals:teamRows.map(r=>r.done),color:'#247c83'},{name:'미완료',vals:teamRows.map(r=>r.open+r.over),color:'#c69a65'}]});
  // Approved V2: three fixed source categories, proportional horizontal bars.
  const sourceTotal=rowsM.length;
  const sourceBars='<div class="rqBars">'+SOURCES.map(s=>{const n=rowsM.filter(c=>sourceOf(c)===s).length;return '<div class="rqBarItem"><span>'+esc(s)+'</span><strong>'+n+'건</strong><div class="rqTrack"><i style="width:'+(sourceTotal?100*n/sourceTotal:0)+'%;background:#668da7"></i></div></div>'}).join('')+'</div>';
  // Approved V2: donut summarizes the same mutually exclusive status groups as KPI cards.
  const statusParts=[{label:'완료',n:sum.done,color:'#247c83'},{label:'진행 중·미착수',n:sum.open,color:'#c69a65'},{label:'기한초과',n:sum.over,color:'#b85e52'}];
  let ringOffset=0;const ring=statusParts.map(x=>{const len=sum.total?x.n/sum.total*100:0;const s='<circle cx="75" cy="75" r="54" fill="none" stroke="'+x.color+'" stroke-width="19" pathLength="100" stroke-dasharray="'+len+' '+(100-len)+'" stroke-dashoffset="'+(-ringOffset)+'" transform="rotate(-90 75 75)"/>';ringOffset+=len;return s}).join('');
  const statusDonut='<div class="rqDonutWrap"><svg viewBox="0 0 150 150" role="img" aria-label="조치 진행상태 도넛 차트"><circle cx="75" cy="75" r="54" fill="none" stroke="#edf1f4" stroke-width="19"/>'+ring+'<text x="75" y="70" text-anchor="middle" font-size="11" fill="#64788a">총 요청</text><text x="75" y="91" text-anchor="middle" font-size="22" font-weight="800" fill="#173a57">'+sum.total+'</text></svg><div class="rqDonutLegend">'+statusParts.map(x=>'<div><i style="background:'+x.color+'"></i><span>'+x.label+'</span><b>'+x.n+'건</b></div>').join('')+'</div></div>';
  const teamRateBars='<div class="rqMatrixScroll"><table class="rqMatrix"><thead><tr><th>조치대응팀</th><th>조치 구성 비교</th><th>완료율</th></tr></thead><tbody>'+[...teamRows].sort((a,b)=>(a.done/a.total)-(b.done/b.total)).map(r=>{const rate=r.total?Math.round(r.done/r.total*1000)/10:0;return '<tr><td>'+esc(r.team)+'</td><td><div class="rqStack" title="완료 '+r.done+'건 / 기한 내 미완료 '+r.open+'건 / 기한초과 '+r.over+'건"><span class="rqStackDone" style="width:'+(r.total?100*r.done/r.total:0)+'%"></span><span class="rqStackOpen" style="width:'+(r.total?100*r.open/r.total:0)+'%"></span><span class="rqStackLate" style="width:'+(r.total?100*r.over/r.total:0)+'%"></span></div></td><td>'+rate+'%</td></tr>'}).join('')+'</tbody></table><div class="rqLegend"><span>■ 완료</span><span>■ 기한 내 미완료</span><span>■ 기한초과</span></div></div>';
  const overCases=rowsM.filter(c=>isOverdue(c,D.today));
  const delayBands=[overCases.filter(c=>delayDays(c,D.today)<=7).length,overCases.filter(c=>delayDays(c,D.today)>=8&&delayDays(c,D.today)<=14).length,overCases.filter(c=>delayDays(c,D.today)>=15).length];
  const kpi=(label,value,detail,risk=false)=>'<div class="rqKpi'+(risk?' risk':'')+'"><small>'+label+'</small><b>'+value+'</b><span class="rqKpiHint">'+detail+'</span></div>';
  const section=(title,meta,content,key)=>'<section class="ibPanel"><div class="ibHead"><span>'+title+'</span><em>'+meta+'</em>'+(key?'<button type="button" class="ibEv" data-evk="'+key+'">근거 데이터</button>':'')+'</div><div class="ibBody">'+content+'</div></section>';
  const filters='<div class="ibBar"><label>연도 <select data-f="year">'+D.years.map(y=>'<option'+(y===S.year?' selected':'')+'>'+y+'</option>').join('')+'</select></label><label>월 <select data-f="month"><option value="">전체</option>'+Array.from({length:12},(_,i)=>{const v=String(i+1).padStart(2,'0');return '<option value="'+v+'"'+(v===S.month?' selected':'')+'>'+(i+1)+'월</option>'}).join('')+'</select></label><label>요청출처 <select data-f="source">'+opt(SOURCES,S.source)+'</select></label><label>조치대응팀 <select data-f="team">'+opt(D.teams,S.team)+'</select></label><label>진행상태 <select data-f="status">'+opt(['조치대기','진행중','완료','기한초과'],S.status)+'</select></label><label>재발 <select data-f="roll"><option value="">전체</option><option value="Y"'+(S.roll==='Y'?' selected':'')+'>있음</option><option value="N"'+(S.roll==='N'?' selected':'')+'>없음</option></select></label><button type="button" data-rq="go">조회</button><button type="button" class="alt" data-rq="reset">초기화</button><span class="sp"></span><button type="button" class="alt" data-rq="print">인쇄</button><button type="button" class="alt" data-rq="csv">엑셀 다운로드</button></div>';
  box.innerHTML='<div class="ibTitle"><h2>개선요청 종합현황</h2></div><p class="ibNote">요청 발생 · 조치 이행 · 지연 위험 · 팀별 대응력</p>'
    +filters
    +'<div class="rqKpis rqV2Kpis">'
    +kpi('총 개선요청',sum.total+'건','조회조건 전체')
    +kpi('완료',sum.done+'건','조치 완료')
    +kpi('미완료',(sum.open+sum.over)+'건','기한내 미완료 포함')
    +kpi('완료율',pctS(sum.done)+'%','완료 / 전체')
    +kpi('기한초과',sum.over+'건','미완료 중 기한경과',true)
    +kpi('평균 지연일',delayOverallAvg+'일','현재 기한초과 건 기준',true)
    +'</div>'
    +'<div class="ibRow">'+section('01. 월별 요청·완료 추이','완료일 기준 · 신규 요청과 별도 집계',monthlyTrend+leg([['신규 요청','#829db5'],['완료','#247c83']]),'b')+'</div>'
    +'<div class="ibRow rqManageRow">'
    +section('02. 요청출처별 현황','요청 / 미완료',sourceBars,'a')
    +section('03. 조치 진행상태','완료 · 기한내 미완료 · 기한초과',statusDonut,'c')
    +'</div>'
    +'<div class="ibRow">'+section('04. 조치대응팀별 이행성과','완료 / 미완료 · 팀별 건수',teamRateBars+'<details class="rqTeamDetail"><summary>팀별 상세 실적 펼치기</summary><div class="rqScroll">'+teamGrid+'</div></details>','c')+'</div>'
    +'<div class="ibRow">'+section('05. 기한초과 집중관리','현재 미완료 기준 · 지연기간별 분포','<div class="rqBands">'+['1~7일','8~14일','15일 이상'].map((x,i)=>'<div><small>'+x+'</small><b>'+delayBands[i]+'건</b></div>').join('')+'</div>'+'<div class="rqDelayStack">'+delayBands.map((n,i)=>'<span class="rqDelayBand rqDelayBand'+i+'" style="width:'+(overCases.length?100*n/overCases.length:0)+'%"></span>').join('')+'</div>'+(delayChart||'<p class="rqEmpty">현재 기한초과 대상이 없습니다.</p>'),'d')+'</div>'
    +'<div class="ibRow">'+section('06. 개선요청 상세 관리','기한초과·미완료 우선 · 미리보기 '+detailRows.length+' / '+actionAll.length,'<div class="rqScroll">'+detail+'</div>','f')+'</div>'
    +'<p class="rqCaveat">※ 요청출처는 5S모듈·생산혁신팀 HDPS파트·리더십 3종입니다. 원천에 출처 필드가 없는 경우 일부 출처는 등록자 및 Audit 연계 정보로 추정됩니다. 완료일이 없는 완료 건은 월별 완료 추이에서 제외되며 총 완료 건수에는 포함됩니다.</p>';

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
  box.querySelector('[data-rq="reset"]').onclick=()=>{Object.assign(S,{year:null,month:'',source:'',team:'',status:'',roll:'',selTeam:''});render(box)};box.querySelector('[data-rq="go"]').onclick=()=>render(box);box.querySelector('[data-rq="print"]').onclick=()=>window.print();
  box.querySelector('[data-rq="csv"]').onclick=()=>{
    const out=[['5S 개선요청 종합 대시보드',S.year+'년',S.month?S.month+'월':'연간누적'],[],['요청번호','요청출처','조치대응부서','작업장','진행현황','요청일','완료예정일','완료일']];
    rowsM.forEach(c=>out.push([c.id,sourceOf(c),c.team,c.workplace||'',isOverdue(c,D.today)?'기한초과':c.status,c.date||'',c.due||'',c.doneDate||'']));
    const text='\ufeff'+out.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n'),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'}));a.download=`5S_개선요청종합_${S.year}${S.month||''}.csv`;document.body.appendChild(a);a.click();a.remove()};
}
function safeRender(box){if(!box)return;try{render(box)}catch(error){console.error('HD20 request board render error',error);box.textContent='5S 개선요청 종합 대시보드 표시 오류: '+String(error?.message||error)}}
function ensure(){
  css();let box=document.getElementById(ID);
  if(!box){const anchor=document.getElementById('hd20ImproveBoard')||document.getElementById('hd20DashboardPriority')||document.querySelector('.cards')||document.getElementById('hd20DashboardSectionTabs');if(!anchor)return false;box=document.createElement('section');box.id=ID;anchor.insertAdjacentElement('afterend',box);
    const T=window.HD20_DASHBOARD_TABS;if(T?.apply)T.apply(T.active?.()||'summary',{scroll:false})}
  safeRender(box);return true}
let tries=0;(function boot(){if(!ensure()&&tries++<80)setTimeout(boot,150)})();window.addEventListener('hd20-dashboard-ready',()=>ensure());window.addEventListener('hd20-kpi-source-updated',()=>{if(!document.getElementById(ID))ensure()});document.addEventListener('DOMContentLoaded',()=>ensure(),{once:true});window.addEventListener('load',()=>ensure(),{once:true});
document.addEventListener('click',e=>{if(e.target.closest?.('#hd20DashboardSectionTabs button[data-dashboard-section="request"]'))setTimeout(()=>{const b=document.getElementById(ID);if(b)safeRender(b)},80)},true);
['hd20-kpi-source-updated','hd20-action-updated','hd20-policy-updated'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(()=>{const b=document.getElementById(ID);if(b)safeRender(b)},80)));
let rz;window.addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{const b=document.getElementById(ID);if(b&&b.offsetParent!==null)safeRender(b)},250)});
window.HD20_REQUEST_BOARD={render:()=>{const b=document.getElementById(ID);if(b)safeRender(b)},state:S};
})();
