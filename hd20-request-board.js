/* 5S 개선요청 종합 대시보드 — 사용자가 첨부한 'VTB 개선요청 종합 대시보드'(HD-HiHR/DELMIA Apriso) 구성을 5S 데이터에 맞게 재구성.
   VTB와의 차이(사용자 지시): 개선요청부서 그리드는 따로 두지 않고 '조치대응부서'에 집중. 개선요청 출처는 5S모듈·생산혁신팀 HDPS파트·리더십 3종만 존재.
   데이터: HD20KPIData.actionCases()/seoulDateKey(), HD20ProductionTeamMaster, HD20_HEADCOUNT_MASTER. 차트 엔진은 HD20_BOARD_KIT(hd20-improve-board.js) 재사용.
   주의(데이터 한계, 화면에도 안내): 현재 원천에는 '요청출처' 실제 필드가 없어 auditDrawId 유무로 5S모듈/생산혁신팀 HDPS파트를 추정 표기(리더십 항목은 실제 필드 연결 전까지 0). */
(()=>{'use strict';
const ID='hd20RequestBoard';
const SOURCES=['5S모듈','생산혁신팀 HDPS파트','리더십'];
const S={year:null,month:'',source:'',team:'',status:'',roll:'',selTeam:''};
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
/* "01 월별 요청·완료 추이" 전용 선 그래프. 공용 chart()(막대 전용, 다른 탭·섹션에서도 널리 재사용)는
   건드리지 않고 이 섹션만 별도로 흐름(추이) 표현에 맞는 꺾은선으로 그림. */
function lineChart({w,h=200,cats,series}){
  const m={l:34,r:14,t:14,b:24},iw=Math.max(80,w-m.l-m.r),ih=h-m.t-m.b;
  const maxV=Math.max(1,...series.flatMap(s=>s.vals.map(v=>v||0)));
  const niceMax=(()=>{const step=Math.pow(10,Math.floor(Math.log10(maxV||1)));const n=Math.ceil((maxV||1)/step)*step;return n<=0?1:n})();
  const x=i=>m.l+(cats.length>1?i/(cats.length-1)*iw:iw/2);
  const y=v=>m.t+ih-(v/niceMax)*ih;
  const ticks=[0,.25,.5,.75,1].map(f=>Math.round(niceMax*f));
  const grid=ticks.map(t=>`<line x1="${m.l}" y1="${y(t)}" x2="${m.l+iw}" y2="${y(t)}" stroke="#eef2f5"/><text x="${m.l-6}" y="${y(t)+3}" text-anchor="end" font-size="9.5" fill="#9aa8b3">${t}</text>`).join('');
  const xl=cats.map((c,i)=>`<text x="${x(i)}" y="${m.t+ih+15}" text-anchor="middle" font-size="9.5" fill="#9aa8b3">${esc(c)}</text>`).join('');
  const lines=series.map(s=>{
    const pts=s.vals.map((v,i)=>`${x(i)},${y(v||0)}`).join(' ');
    const dots=s.vals.map((v,i)=>`<circle cx="${x(i)}" cy="${y(v||0)}" r="3" fill="${s.color}"><title>${esc(cats[i])} · ${esc(s.name)}: ${v||0}건</title></circle>`).join('');
    return `<polyline points="${pts}" fill="none" stroke="${s.color}" stroke-width="2.3" stroke-linejoin="round" stroke-linecap="round"/>${dots}`;
  }).join('');
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="월별 요청·완료 추이 선 그래프">${grid}${xl}${lines}</svg>`;
}
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
#${ID} .rqRateBad{color:#b03a2e;font-weight:900}#${ID} .rqRateWarn{color:#9b6500;font-weight:900}#${ID} .rqRateOk{color:#2f7a4d;font-weight:900}
#${ID} .rqMyTeam{background:#eaf4fb!important;outline:2px solid #2c80bd;outline-offset:-2px}
#${ID} .rqMyTeamTag{display:inline-block;margin-left:6px;padding:2px 7px;border-radius:999px;background:#2c80bd;color:#fff;font-size:10px;font-weight:900;vertical-align:middle}
#${ID} .rqTeamNote{margin:0 0 10px;padding:8px 12px;background:#f4f8fb;border:1px solid #dce7ee;border-radius:8px;font-size:12px;color:#49657b}
#${ID} .rqColEmph{background:#fdf4f0}#${ID} th.rqColEmph{color:#9b3a2e;font-weight:900}
#${ID} .rqLegend{display:flex;gap:15px;flex-wrap:wrap;margin-top:12px;font-size:11px}#${ID} .rqLegend span:first-child{color:#26847f}#${ID} .rqLegend span:nth-child(2){color:#ad812f}#${ID} .rqLegend span:last-child{color:#c45143}
#${ID} .rqMoreBtn{display:block;width:100%;margin-top:8px;padding:8px;border:1px dashed #cdd9e2;border-radius:8px;background:#f8fafb;color:#49657b;font-size:12px;font-weight:850;cursor:pointer}#${ID} .rqMoreBtn:hover{background:#eef3f6;border-color:#9fb4c2}
#${ID} .rqHeat{display:block;border-radius:5px;padding:9px;min-width:42px;text-align:center}#${ID} .rqHeatHigh{background:#b9473b;color:#fff}#${ID} .rqHeatMid{background:#db8e72;color:#fff}#${ID} .rqHeatLow{background:#f4d7c6;color:#713e30}#${ID} .rqHeatZero{background:#f4f6f8;color:#758899}
#${ID} .rqDelayStack{display:flex;height:17px;overflow:hidden;border-radius:5px;margin:3px 0 16px;background:#edf1f4}#${ID} .rqDelayBand{display:block;height:100%}#${ID} .rqDelayBand0{background:#e6ba73}#${ID} .rqDelayBand1{background:#d98454}#${ID} .rqDelayBand2{background:#b9473b}
#${ID} .rqBars{display:grid;gap:16px;padding:10px 5px}
#${ID} .rqBarItem.zero{opacity:.4}
#${ID} .rqSourceSummary{margin:10px 0 0;padding-top:10px;border-top:1px solid #edf1f4;font-size:12px;color:#5c6b7a}#${ID} .rqSourceSummary b{color:#2c5f8a}
#${ID} .rqSecondary{opacity:.92}#${ID} .rqSecondary .ibHead{font-size:12.5px}
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
  /* 사용자 지적 경과: "현장 게시판에 팀별로 게시한다고 생각해봐라 끔찍하지 않냐" → Claude가 "포스터
     모드"(팀 선택 시 다른 모든 섹션을 숨기고 그 팀 혼자만 보여줌)를 만들었으나, 사용자가 다시 지적:
     "개선요청 종합 탭에서는 공장의 현황, 타팀과 내팀의 현황 모두가 같이 다 보여져야 한다" — 즉 내 팀만
     떼어 보여주는 게 아니라 "공장 전체 맥락 속에서 내 팀이 어디 있는지"가 항상 함께 보여야 함. 포스터
     모드(화면을 통째로 교체)는 삭제하고, 대신 "04 조치대응팀별 이행성과" 표가 필터와 무관하게 항상
     전체 16개 팀을 다 보여주면서, 조치대응팀 드롭다운에서 선택한 팀의 행만 강조 표시하는 방식으로
     전환 — 공장 현황(KPI)·전체 팀 비교(04)·내 팀 강조가 한 화면/한 인쇄물에 같이 보임. */
  const teamHighlight=S.team||null;
  // 현재 기한초과 집중관리: 완료건의 과거 지연은 제외하고, 지금 미완료이면서 기한을 넘긴 건만 집계.
  const delayRows=teamsAll.map(t=>{const a=rowsM.filter(c=>c.team===t&&!isDone(c)&&isOverdue(c,D.today)).map(c=>delayDays(c,D.today)).filter(v=>v!==null);
    return{team:t,n:a.length,avg:a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length*10)/10:0,max:a.length?Math.max(...a):0}}).filter(r=>r.n>0).sort((a,b)=>b.n-a.n||b.avg-a.avg);
  const delayRowsSorted=delayRows.length?delayRows.map(r=>{const c=rowsM.filter(x=>x.team===r.team&&isOverdue(x,D.today));const v=[c.filter(x=>delayDays(x,D.today)<=7).length,c.filter(x=>delayDays(x,D.today)>=8&&delayDays(x,D.today)<=14).length,c.filter(x=>delayDays(x,D.today)>=15).length];return{team:r.team,v,total:r.n}}).sort((a,b)=>b.v[2]-a.v[2]||b.total-a.total):[];
  const DELAY_SHOW=6;
  /* "05"도 "총 초과" 합계만 보면 여러 팀이 같은 숫자(예: 4건)로 반복돼 단조로워 보이지만, 실제로는
     1~7일·8~14일·15일+ 구간별 분포가 팀마다 다름(합계가 같아도 '얼마나 급한 지연인지'는 다름) —
     데이터는 그대로 두고, 가장 심각한 구간(15일+)을 표에서 시각적으로 강조해 "합계는 같아도 내용은
     다르다"를 바로 보이게 함. 분포가 전부 똑같은지도 계산해 다르면 안내 문구로 알려줌. */
  const delayAllSame=delayRowsSorted.length>1&&delayRowsSorted.every(r=>r.v[0]===delayRowsSorted[0].v[0]&&r.v[1]===delayRowsSorted[0].v[1]&&r.v[2]===delayRowsSorted[0].v[2]);
  const delayNote=delayRowsSorted.length?(delayAllSame?'':'<p class="rqTeamNote">총 초과 건수가 같은 팀도 있지만, <b>15일 이상 장기 지연</b> 건수는 팀마다 다릅니다. 그 칸을 우선 확인하세요.</p>'):'';
  const delayChart=delayRowsSorted.length?'<div class="rqRiskScroll">'+delayNote+'<table class="rqRiskTable"><thead><tr><th>조치대응팀</th><th>1~7일</th><th>8~14일</th><th class="rqColEmph">15일+</th><th>총 초과</th></tr></thead><tbody>'+delayRowsSorted.map((r,i)=>'<tr'+(i>=DELAY_SHOW?' class="rqRowMore" hidden':'')+'><td>'+esc(r.team)+'</td>'+r.v.map((n,ci)=>'<td'+(ci===2?' class="rqColEmph"':'')+'><span class="rqHeat '+(n>=7?'rqHeatHigh':n>=4?'rqHeatMid':n?'rqHeatLow':'rqHeatZero')+'">'+n+'</span></td>').join('')+'<td><strong>'+r.total+'</strong></td></tr>').join('')+'</tbody></table>'+(delayRowsSorted.length>DELAY_SHOW?'<button type="button" class="rqMoreBtn" data-more="delay">나머지 '+(delayRowsSorted.length-DELAY_SHOW)+'개 팀 더보기 ▾</button>':'')+'</div>':null;
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
  /* '06 개선요청 상세 관리'는 미완료 건만 보여주는 구조라(사용자 데이터 특성상) 거의 모든 행의
     현재상태가 '기한초과' 빨강 배지로 도배돼 단조로워 보임(전면 재검토 연장) — 데이터·필터 기준은
     그대로 두고, '초과일' 숫자에 "05 기한초과 집중관리"와 같은 심각도 색상 체계(rqHeat)를 적용해
     같은 '기한초과' 상태 안에서도 얼마나 심각한지 한눈에 구분되게 함. */
  const overdueCls=d=>d===null||d===undefined?'':d>=15?'rqHeatHigh':d>=8?'rqHeatMid':d>0?'rqHeatLow':'';
  const detail=`<table class="rqGrid rqDetail"><thead><tr><th>우선</th><th>요청번호</th><th>조치대응부서</th><th>작업장</th><th>현재상태</th><th>초과일</th><th>완료예정일</th></tr></thead><tbody>
    ${detailRows.length?detailRows.map((c,i)=>{const d=delayDays(c,D.today);return `<tr><td>${i+1}</td><td>${esc(c.id)}</td><td>${esc(c.team)}</td><td>${esc(c.workplace||'—')}</td><td>${isOverdue(c,D.today)?'<b style="color:#c0392b">기한초과</b>':esc(c.status)}</td><td>${d!==null&&d!==undefined?'<span class="rqHeat '+overdueCls(d)+'">'+d+'일</span>':'—'}</td><td>${esc(c.due||'—')}</td></tr>`}).join(''):`<tr><td colspan="7" style="text-align:center;color:#8a99a6;padding:16px">조건에 해당하는 개선요청이 없습니다.</td></tr>`}
    </tbody></table>`;
  const opt=(a,cur,all='ALL')=>`<option value="">${all}</option>`+a.map(x=>`<option value="${esc(x)}"${x===cur?' selected':''}>${esc(x)}</option>`).join('');

  // V2: Monthly completions use actual completion dates; backlog carries open cases from earlier periods.
  const monthlyDone=Array.from({length:12},(_,i)=>filt(D,{ignoreYear:true,ignoreMonth:true}).filter(x=>teamsAll.includes(x.team)&&isDone(x)&&String(x.doneDate||'').slice(0,7)===S.year+'-'+String(i+1).padStart(2,'0')).length);
  /* "01 월별 요청·완료 추이"는 제목이 '추이'(흐름)인데 실제 표현은 막대그래프였음 — 6~10월에만
     값이 있고 나머지 7개월은 빈 축이라, 막대보다 선으로 이어 그리면 어디서 늘고 줄었는지 흐름이 더
     잘 보임(차트 종류 재검토 요청). 신규 요청·완료 두 선을 겹쳐 그려 간격(backlog)이 벌어지는지도
     함께 보이게 함. 기존 공용 chart()(막대 전용)는 다른 화면에서도 쓰이므로 건드리지 않고, 이 섹션
     전용 lineChart()를 새로 작성. */
  /* 사용자 피드백: "선이 문제가 아니라 왜 선으로 표현하냐는 소리다" — 월별 '건수'는 드문드문
     0인 달이 섞인 이산적 데이터라, 선으로 이으면 0인 달들 사이를 가로질러 억지로 '추세'처럼 보이는
     뾰족한 스파이크 모양이 되어 오히려 왜곡된 인상을 줌(사용자: "이게 머냐 개판이다"). 막대그래프로
     되돌림 — 같은 달에 등록/완료된 '건수'를 비교하는 데는 막대가 더 정직한 표현. */
  /* 사용자 지적: "데이터 비어 있게 하지마라" — 실제로는 09·10월 등에 값이 있었는데, 전면 개편 때
     "01"을 "03"과 나란히 2열(rqManageRow)로 옮기면서 차지하는 폭이 절반으로 줄었음에도 차트 SVG
     너비 계산은 그대로 전체 탭 폭(box.clientWidth) 기준으로 남아 있어, 차트가 패널보다 거의 2배
     넓게 그려지고 overflow-x:auto로 가로 스크롤이 생겨 07~12월이 스크롤 밖에 가려져 있었음(겉보기엔
     "01~06월만 있고 다 비어 있는" 것처럼 보였던 진짜 원인) — 패널의 실제 폭(절반) 기준으로 수정. */
  const monthlyTrend=chart({w:Math.max(380,Math.floor(box.clientWidth/2)-55),cats:ML,minSlot:36,series:[{name:'신규 요청',vals:regM,color:'#829db5'},{name:'완료',vals:monthlyDone,color:'#247c83'}]});
  const teamCompletion=chart({w:Math.max(440,box.clientWidth-85),h:260,cats:teamRows.map(r=>r.team),rotate:true,minSlot:64,series:[{name:'완료',vals:teamRows.map(r=>r.done),color:'#247c83'},{name:'미완료',vals:teamRows.map(r=>r.open+r.over),color:'#c69a65'}]});
  // Approved V2: three fixed source categories, proportional horizontal bars.
  const sourceTotal=rowsM.length;
  /* 요청출처 3개 카테고리 중 보통 1개에만 건수가 몰리고 나머지는 0건인 경우가 흔한데, 0건도 진한
     글자·막대 트랙으로 똑같이 강조돼 "요청출처별 현황"이라는 제목과 달리 사실상 비교할 게 없어 보임
     (전면 재검토 연장) — 0건 항목은 흐리게 처리해 "실제로 비중 있는 출처가 뭔지" 한눈에 들어오게 함. */
  const sourceBars='<div class="rqBars">'+SOURCES.map(s=>{const n=rowsM.filter(c=>sourceOf(c)===s).length;return '<div class="rqBarItem'+(n===0?' zero':'')+'"><span>'+esc(s)+'</span><strong>'+n+'건</strong><div class="rqTrack"><i style="width:'+(sourceTotal?100*n/sourceTotal:0)+'%;background:#668da7"></i></div></div>'}).join('')+'</div>';
  /* 전면 개편(사용자 확정: "이대로"): 3개 출처 중 보통 1개에만 건수가 몰려 별도 섹션(가로막대 3개)을
     차지할 정도의 정보량이 아니라고 판단, 보조 정보 영역 안에서 한 줄 요약 문장으로 축소. */
  const sourceCounts=SOURCES.map(s=>({s,n:rowsM.filter(c=>sourceOf(c)===s).length})).sort((a,b)=>b.n-a.n);
  const sourceSummary=sourceTotal&&sourceCounts[0]?'<p class="rqSourceSummary">요청출처: <b>'+esc(sourceCounts[0].s)+'</b>에서 '+sourceCounts[0].n+'건('+Math.round(sourceCounts[0].n/sourceTotal*100)+'%)'+(sourceCounts[1]&&sourceCounts[1].n?' · 그 외 '+sourceCounts.slice(1).filter(x=>x.n).map(x=>esc(x.s)+' '+x.n+'건').join(' · '):'')+'</p>':'<p class="rqSourceSummary">요청출처 데이터 없음</p>';
  // Approved V2: donut summarizes the same mutually exclusive status groups as KPI cards.
  const statusParts=[{label:'완료',n:sum.done,color:'#247c83'},{label:'진행 중·미착수',n:sum.open,color:'#c69a65'},{label:'기한초과',n:sum.over,color:'#b85e52'}];
  let ringOffset=0;const ring=statusParts.map(x=>{const len=sum.total?x.n/sum.total*100:0;const s='<circle cx="75" cy="75" r="54" fill="none" stroke="'+x.color+'" stroke-width="19" pathLength="100" stroke-dasharray="'+len+' '+(100-len)+'" stroke-dashoffset="'+(-ringOffset)+'" transform="rotate(-90 75 75)"/>';ringOffset+=len;return s}).join('');
  const statusDonut='<div class="rqDonutWrap"><svg viewBox="0 0 150 150" role="img" aria-label="조치 진행상태 도넛 차트"><circle cx="75" cy="75" r="54" fill="none" stroke="#edf1f4" stroke-width="19"/>'+ring+'<text x="75" y="70" text-anchor="middle" font-size="11" fill="#64788a">총 요청</text><text x="75" y="91" text-anchor="middle" font-size="22" font-weight="800" fill="#173a57">'+sum.total+'</text></svg><div class="rqDonutLegend">'+statusParts.map(x=>'<div><i style="background:'+x.color+'"></i><span>'+x.label+'</span><b>'+x.n+'건</b></div>').join('')+'</div></div>';
  /* 완료율이 이미 오름차순(주의 필요한 팀 우선)으로 정렬돼 있었지만, 16개 팀이 숫자만 평이하게 나열돼
     있어 어느 팀이 실제로 주의가 필요한지 한눈에 들어오지 않았음(사용자 지적 연장: 표현 방법 개선).
     데이터·정렬 기준은 그대로 두고, 완료율 구간별로 색을 입혀 위험 수준이 시각적으로 바로 구분되게 함. */
  const rateCls=rate=>rate<50?'rqRateBad':rate<80?'rqRateWarn':'rqRateOk';
  /* 사용자 지시: "탭3를 전면 뜯어고쳐라" — 16개 팀 전부를 항상 펼쳐서 보여주다 보니 이 표 하나만으로도
     화면이 크게 길어지고, 다른 표(05 기한초과 집중관리)까지 같은 패턴이 반복돼 전체 탭 스크롤이 과도
     하게 길어지는 게 "전면 재검토"가 필요했던 핵심 원인 중 하나였음 — 완료율이 가장 낮은(주의 필요)
     상위 6개 팀만 기본으로 보이고, 나머지는 "더보기" 클릭 시에만 펼치도록 축소. */
  /* "04 조치대응팀별 이행성과"는 teamRows(이미 S.team 필터가 걸려 있어 팀 선택 시 1줄만 남음) 대신
     팀 필터를 우회한 전체 데이터를 써서, 조치대응팀을 선택해도 공장 전체 16개 팀 비교가 그대로
     유지되도록 함(연도·월·출처·상태 필터는 유지). */
  const yearOk04=c=>String(c.date||'').slice(0,4)===S.year,monthOk04=c=>!S.month||mo(c)===+S.month,
    srcOk04=c=>!S.source||sourceOf(c)===S.source,statusOk04=c=>!S.status||(S.status==='기한초과'?isOverdue(c,D.today):c.status===S.status),
    rollOk04=c=>!(S.roll==='Y'&&!c.recurrence)&&!(S.roll==='N'&&c.recurrence);
  const casesAllTeams04=D.cases.filter(c=>yearOk04(c)&&monthOk04(c)&&srcOk04(c)&&statusOk04(c)&&rollOk04(c));
  const teamRowsAllTeams=D.teams.map(t=>{const a=casesAllTeams04.filter(c=>c.team===t),done=a.filter(isDone).length,over=a.filter(c=>isOverdue(c,D.today)).length,open=a.length-done-over;
    return{team:t,total:a.length,done,open,over}}).filter(r=>r.total>0);
  const teamRateSorted=[...teamRowsAllTeams].sort((a,b)=>(a.total?a.done/a.total:0)-(b.total?b.done/b.total:0)||b.total-a.total);
  const teamRateRow=(r,hidden)=>{const rate=r.total?Math.round(r.done/r.total*1000)/10:0,mine=teamHighlight&&r.team===teamHighlight;return '<tr'+(mine?' class="rqMyTeam"':hidden?' class="rqRowMore" hidden':'')+'><td>'+(mine?'<b>▶ ':'')+esc(r.team)+(mine?' <span class="rqMyTeamTag">내 팀</span></b>':'')+'</td><td><div class="rqStack" title="완료 '+r.done+'건 / 기한 내 미완료 '+r.open+'건 / 기한초과 '+r.over+'건"><span class="rqStackDone" style="width:'+(r.total?100*r.done/r.total:0)+'%"></span><span class="rqStackOpen" style="width:'+(r.total?100*r.open/r.total:0)+'%"></span><span class="rqStackLate" style="width:'+(r.total?100*r.over/r.total:0)+'%"></span></div></td><td class="'+rateCls(rate)+'">'+rate+'%</td></tr>'};
  const TEAM_SHOW=6;
  /* 사용자 지적: "여기가 가장 문제다" — (1) 범례가 '완료/기한 내 미완료/기한초과' 3색인데, 실제로는
     전체 16개 팀 전부 open(기한 내 미완료)이 항상 0건이라 노란색이 한 번도 나타나지 않음(3색을
     약속해놓고 2색만 쓰는 거짓 범례). (2) 16개 팀 전부 완료율이 정확히 같아(60%) "비교" 표인데
     비교할 차이가 없어 보임. 데이터 값은 그대로 두고(사용자 확정), 실제 쓰이는 색만 범례에 남기고,
     "전부 동일하다"는 사실 자체를 숨기지 않고 먼저 알려주는 요약 문구를 추가해 혼란 대신 바로
     이해되게 함. */
  const openSum=teamRateSorted.reduce((s,r)=>s+r.open,0);
  const rates0=teamRateSorted.map(r=>r.total?Math.round(r.done/r.total*1000)/10:0);
  const allSameRate=rates0.length>1&&rates0.every(v=>v===rates0[0]);
  const teamRateNote=allSameRate?'<p class="rqTeamNote">현재 조건에서는 '+teamRateSorted.length+'개 팀 전부 완료율이 '+rates0[0]+'%로 동일합니다. 팀별 실질 차이는 아래 05(기한초과 지연일 분포)에서 확인하세요.</p>':'';
  const teamRateBars='<div class="rqMatrixScroll">'+teamRateNote+'<table class="rqMatrix"><thead><tr><th>조치대응팀</th><th>조치 구성 비교</th><th>완료율</th></tr></thead><tbody>'+teamRateSorted.map((r,i)=>teamRateRow(r,i>=TEAM_SHOW)).join('')+'</tbody></table>'+(teamRateSorted.length>TEAM_SHOW?'<button type="button" class="rqMoreBtn" data-more="team">나머지 '+(teamRateSorted.length-TEAM_SHOW)+'개 팀 더보기 ▾</button>':'')+'<div class="rqLegend"><span>■ 완료</span>'+(openSum>0?'<span>■ 기한 내 미완료</span>':'')+'<span>■ 기한초과</span></div></div>';
  const overCases=rowsM.filter(c=>teamsAll.includes(c.team)&&isOverdue(c,D.today));
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
    /* 전면 개편(사용자 확정: "이대로") — 이 탭의 실제 목적(사용자 지시: "공장의 타팀의 현황과
       내팀의 현황이 비교해서 보여지는 대시보드여야함")에 맞춰, '04 조치대응팀별 이행성과'(팀 비교)를
       KPI 요약 바로 다음 최상단으로 올리고, 그와 짝을 이루는 '05 기한초과 집중관리'(어느 팀이 왜
       급한지)를 바로 이어 배치. 의사결정에 직접 쓰이지 않는 보조 정보(01 월별추이·02 출처별·03
       진행상태)는 그 아래로 내리고, 02는 별도 섹션 대신 한 줄 요약 문장으로 축소. */
    +'<div class="ibRow rqTeamCompare">'+section('04. 조치대응팀별 이행성과','완료 / 미완료 · 팀별 건수',teamRateBars+'<details class="rqTeamDetail"><summary>팀별 상세 실적 펼치기</summary><div class="rqScroll">'+teamGrid+'</div></details>','c2')+'</div>'
    +'<div class="ibRow">'+section('05. 기한초과 집중관리','현재 미완료 기준 · 지연기간별 분포','<div class="rqBands">'+['1~7일','8~14일','15일 이상'].map((x,i)=>'<div><small>'+x+'</small><b>'+delayBands[i]+'건</b></div>').join('')+'</div>'+'<div class="rqDelayStack">'+delayBands.map((n,i)=>'<span class="rqDelayBand rqDelayBand'+i+'" style="width:'+(overCases.length?100*n/overCases.length:0)+'%"></span>').join('')+'</div>'+(delayChart||'<p class="rqEmpty">현재 기한초과 대상이 없습니다.</p>'),'d')+'</div>'
    +'<div class="ibRow rqManageRow rqSecondary">'
    +section('01. 월별 요청·완료 추이','완료일 기준 · 신규 요청과 별도 집계',monthlyTrend+leg([['신규 요청','#829db5'],['완료','#247c83']])+sourceSummary,'b')
    +section('03. 조치 진행상태','완료 · 기한내 미완료 · 기한초과',statusDonut,'c')
    +'</div>'
    +'<div class="ibRow rqPrintSkip">'+section('06. 개선요청 상세 관리','기한초과·미완료 우선 · 미리보기 '+detailRows.length+' / '+actionAll.length,'<div class="rqScroll">'+detail+'</div>','f')+'</div>'
    +'<p class="rqCaveat">※ 요청출처는 5S모듈·생산혁신팀 HDPS파트·리더십 3종입니다. 원천에 출처 필드가 없는 경우 일부 출처는 등록자 및 Audit 연계 정보로 추정됩니다. 완료일이 없는 완료 건은 월별 완료 추이에서 제외되며 총 완료 건수에는 포함됩니다.</p>';

  const evCols=['요청번호','요청출처','조치대응부서','작업장','진행현황','요청일','완료예정일','완료일'],
    evMapR=c=>[c.id,sourceOf(c),c.team,c.workplace||'—',c.status,c.date,c.due||'—',c.doneDate||'—'],
    evDelayCols=[...evCols,'지연일수'],evDelayMapR=c=>[...evMapR(c),delayDays(c,D.today)??''];
  const EV={
    a:['요청출처별 근거 데이터 ('+(S.month?+S.month+'월':'연간누적')+')',rowsM,evCols,evMapR],
    b:['월별 요청·완료 근거 데이터 ('+S.year+'년)',[...rowsY,...filt(D,{ignoreYear:true,ignoreMonth:true}).filter(c=>teamsAll.includes(c.team)&&isDone(c)&&String(c.doneDate||'').startsWith(S.year+'-')&&!rowsY.includes(c))],evCols,evMapR],
    c:['조치대응부서 근거 데이터 ('+(S.month?+S.month+'월':'연간누적')+')',rowsM,evCols,evMapR],
    c2:['조치대응팀별 이행성과 근거 데이터 ('+(S.month?+S.month+'월':'연간누적')+')',rowsM,evCols,evMapR],
    d:['현재 기한초과 근거 데이터 ('+(S.month?+S.month+'월':'연간누적')+')',rowsM.filter(c=>teamsAll.includes(c.team)&&isOverdue(c,D.today)),evDelayCols,evDelayMapR],
    f:['즉시조치 대상 전체 보기 ('+(S.month?+S.month+'월':'연간누적')+')',actionAll,evCols,evMapR],
  };
  const downloadEvidence=(cols,rows,file)=>{const csv='\ufeff'+[cols,...rows].map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=file+'.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)};
  box.querySelectorAll('[data-evk]').forEach(b=>{const dl=document.createElement('button');dl.type='button';dl.className='ibEv';dl.textContent='엑셀 추출';dl.style.marginLeft='6px';dl.addEventListener('click',()=>{const key=b.dataset.evk;const [title,rows,columns,mapR]=EV[key];downloadEvidence(columns,rows.map(mapR),'5S_개선요청_차트_'+key);});b.insertAdjacentElement('afterend',dl)});
  box.querySelectorAll('[data-evk]').forEach(b=>{b.onclick=()=>{const [t,rows,cols,mapR]=EV[b.dataset.evk];openRows({title:t,cols,rows:rows.map(mapR),file:'5S_개선요청_근거_'+b.dataset.evk})}});
  box.querySelectorAll('[data-f]').forEach(el=>el.onchange=()=>{S[el.dataset.f]=el.value;render(box)});
  box.querySelector('[data-rq="reset"]').onclick=()=>{Object.assign(S,{year:null,month:'',source:'',team:'',status:'',roll:'',selTeam:''});render(box)};box.querySelector('[data-rq="go"]').onclick=()=>render(box);box.querySelector('[data-rq="print"]').onclick=()=>window.print();
  box.querySelectorAll('.rqMoreBtn').forEach(btn=>btn.onclick=()=>{const table=btn.previousElementSibling;table?.querySelectorAll('tr.rqRowMore').forEach(tr=>tr.hidden=false);btn.remove()});
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
window.HD20_REQUEST_BOARD={ensure,render:()=>{const b=document.getElementById(ID);if(b)safeRender(b);else ensure()},state:S};
})();
