/* 5S 자율개선 종합 대시보드 (기존 MES 'VTB 자율개선 종합 대시보드' 구성을 5S에 맞게 재구성)
   조회 조건 바 → 유형별/월별 현황 → 팀별 인당 개선건수(+당월 참여율) → 선택 팀의 월별 인당 실적.
   읽기 전용: HD20KPIData.snapshot().rows(활동 원천), HD20_HEADCOUNT_MASTER(팀 인원), HD20ProductionTeamMaster(팀·그룹). */
(()=>{'use strict';
const ID='hd20ImproveBoard',TYPES=['정리','정돈','청소','시각화','위험구역관리','설비 자주보전','5S 고도화'],DONE=['완료','확정'];
const C={dark:'#1f6f6b',amber:'#e0b03c',light:'#a8c7c4',grey:'#8fa3b3',ink:'#22303f',soft:'#5c6b7a',grid:'#e6ecf0'};
const S={year:null,month:'',metric:'per',group:'',type:'',roll:'',judge:'',team:''};
const TEAM_CHART_ORDER_KEY='hd20_improve_team_chart_order_v1';
let teamChartLocalOrder=null,teamChartOrderDirty=false; // Unsaved drag order; save writes shared reference order.
// Reference-information team order remains authoritative on page load.
const JUDGES=['확정','판정대기','보완요청','후보','검토중','미확정'];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fx=(v,per)=>per?(v>=10?v.toFixed(1):v.toFixed(2)):String(Math.round(v));
function css(){if(document.getElementById(ID+'Style'))return;const s=document.createElement('style');s.id=ID+'Style';s.textContent=`
#${ID}{background:#fff;border:1px solid #dfe6ec;border-radius:14px;padding:16px 18px;box-shadow:0 1px 3px rgba(20,48,76,.06)}
#${ID} .ibTitle{display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap}#${ID} h2{margin:0;font-size:21px;color:#14304c}
#${ID} .ibNote{margin:4px 0 12px;font-size:13px;font-weight:800;color:#22303f}
#${ID} .ibKpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:10px 0 12px}#${ID} .ibKpi{padding:11px 12px;border:1px solid #dce6ec;border-radius:9px;background:#fff}#${ID} .ibKpi small{display:block;font-size:11px;font-weight:850;color:#6e8392}#${ID} .ibKpi b{display:block;margin-top:3px;font-size:21px;color:#173a57}#${ID} .ibKpi.risk b{color:#b33b31}@media(max-width:900px){#${ID} .ibKpis{grid-template-columns:repeat(2,minmax(0,1fr))}}
#${ID} .ibMonthlyCompact{display:flex;flex-direction:column;gap:0}
#${ID} .ibMonthlyCompact>svg{display:block;width:100%;height:auto;max-height:284px}
#${ID} .ibMonthlyCompact>.ibLeg{justify-content:center;margin:-1px 0 0;padding:0 0 4px;gap:8px 16px;line-height:1.2}
#${ID} .ibMonthlyCompact+.ibMonthlyTrend{margin-top:7px}
#${ID} .ibMonthlyTrend{margin-top:14px;padding:13px;border:1px solid #dce3e9;border-radius:9px;background:#fafbfc;color:#26384a}
#${ID} .ibTrendTitle{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;flex-wrap:wrap}
#${ID} .ibTrendTitle strong{font-size:12px;color:#173a57}
#${ID} .ibTrendTitle span{font-size:11px;color:#718091}
#${ID} .ibTrendCards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
#${ID} .ibTrendCard{padding:10px;min-width:0;background:#fff;border:1px solid #e1e6eb;border-radius:7px}
#${ID} .ibTrendLabel{font-size:11px;color:#536779;font-weight:700}
#${ID} .ibTrendMain{font-size:23px;font-weight:850;color:#21384e;margin:6px 0 3px;white-space:nowrap}
#${ID} .ibTrendDelta{font-size:11px;font-weight:750;color:#43586c}
#${ID} .ibTrendCompare{font-size:10px;color:#788695;border-top:1px solid #e9edf1;padding-top:7px;margin-top:8px;line-height:1.4}
#${ID} .ibTrendSummary{display:flex;gap:12px;align-items:baseline;margin-top:9px;padding:9px 10px;background:#f1f4f6;border-radius:6px;font-size:11px;line-height:1.5}
#${ID} .ibTrendSummary strong{flex-shrink:0;color:#34485a}
#${ID} .ibTrendSummary span{color:#526579}
#${ID} .ibTrendEmpty{margin-top:14px;padding:12px;background:#f6f8fa;border-radius:7px;color:#667788;font-size:12px}
@media(max-width:680px){#${ID} .ibTrendCards{grid-template-columns:1fr}#${ID} .ibTrendSummary{display:block}}
#${ID} .ibTypeDefs{padding:12px;border:1px solid #dce6ec;border-radius:9px;background:#f8fafc;margin:0 0 10px}#${ID} .ibTypeDefs strong{display:block;font-size:12px;color:#173a57;margin-bottom:8px}#${ID} .ibTypeDefs dl{margin:0;display:grid;gap:6px}#${ID} .ibTypeDefs dl>div{display:grid;grid-template-columns:85px minmax(0,1fr);gap:8px;align-items:start}#${ID} .ibTypeDefs dt{font-weight:800;font-size:11px;color:#285c70}#${ID} .ibTypeDefs dd{margin:0;font-size:11px;color:#405669;line-height:1.5}#${ID} .ibTypeDefs small{color:#9b6b26}
#${ID} .ibAdvBadge{display:flex;align-items:baseline;gap:9px;flex-wrap:wrap;margin:0 0 10px;padding:9px 12px;border:1px solid #f0dfae;border-radius:9px;background:#fdf9ee}
#${ID} .ibAdvBadge b{font-size:16px;color:#8a5a00}#${ID} .ibAdvBadge span{font-size:11.5px;color:#8a7850;line-height:1.5}
#${ID} .ibBar{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;padding:10px 12px;background:#f4f7f9;border:1px solid #e3eaf0;border-radius:10px}
#${ID} .ibBar label{display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:850;color:#3b5163}
#${ID} .ibBar select,#${ID} .ibBar input{height:32px;border:1px solid #cfd9e2;border-radius:7px;background:#fff;padding:0 8px;font-size:13px;color:#22303f}
#${ID} .ibBar input{width:70px}#${ID} .ibBar .sp{flex:1}
#${ID} .ibBar button{height:32px;border-radius:7px;border:1px solid #14304c;background:#14304c;color:#fff;font-weight:850;font-size:13px;padding:0 14px;cursor:pointer}
#${ID} .ibBar button.alt{background:#2c5f8a;border-color:#2c5f8a}
#${ID} .ibRow{display:grid;gap:12px;margin-top:12px;align-items:start}
/* r1(5S 유형별 등록 현황 · 월별 등록 및 진행현황)이 3:7로 치우쳐 있어, 카테고리 5개뿐인 왼쪽은 좁게
   눌리고 12개월 중 실제 값 있는 달이 5~6개뿐인 오른쪽은 빈 축 공간이 커 보여 두 패널 사이 여백이
   불균형해 보였음(사용자 지적, 업로드 스크린샷 기준) — 1:1에 가깝게 재조정. */
#${ID} .r1{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
#${ID} .r1{width:100%;grid-template-columns:minmax(0,2fr) minmax(0,3fr)!important;align-items:stretch}#${ID} .r1>.ibPanel{width:100%;min-width:0;box-sizing:border-box}#${ID} .r1 .ibBody>svg{aspect-ratio:auto;width:100%!important;height:330px!important;max-height:none!important}
#${ID} .r1>.ibPanel{min-width:0;height:100%}#${ID} .r1 .ibBody{display:flex;flex-direction:column;min-width:0}#${ID} .r1 .ibBody>svg{flex:none;width:100%!important}#${ID} .r1 .ibAdvBadge{margin:8px 0 0;padding:7px 10px}#${ID} .r1 .ibLeg{margin-top:8px}#${ID} .r3{grid-template-columns:repeat(2,minmax(0,1fr))}
#${ID} .ibPanel{border:1px solid #e3eaf0;border-radius:10px;background:#fff;overflow:hidden}
#${ID} .ibHead{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 12px;background:#f1f5f8;border-bottom:1px solid #e3eaf0;font-size:13.5px;font-weight:900;color:#22303f}
#${ID} .ibHead .ibEv{margin-left:auto;height:26px;border:1px solid #cfd9e2;border-radius:6px;background:#fff;color:#2c5f8a;font-size:12px;font-weight:850;padding:0 9px;cursor:pointer}#${ID} .ibHead .ibEv+em{margin-left:0}#${ID} .ibHead em{font-style:normal;font-size:12.5px;color:#14304c}#${ID} .ibHead em.pt{color:#1f6f6b}
#${ID} .ibBody{padding:8px 8px 4px;overflow-x:auto}
#${ID} .ibLeg{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;font-size:11.5px;color:#5c6b7a;font-weight:800;padding:2px 0 6px}#${ID} .ibLossWrap{margin-top:8px;padding:8px 10px 4px;background:#fbfafa;border:1px solid #f0e4e4;border-radius:8px}
#${ID} .ibLossLabel{display:flex;justify-content:space-between;font-size:11px;font-weight:850;color:#a0453a;margin-bottom:4px}#${ID} .ibLossLabel em{font-style:normal;color:#7a8a97;font-weight:800}#${ID} .ibSampleBanner{text-align:center;color:#9c5710;background:#fff4de;border:1px solid #efd29b;border-radius:5px;padding:5px 8px;font-size:11px;font-weight:850;margin:4px 0 8px}
#${ID} .ibActivityAnalysis{margin-top:10px;border:1px solid #dce6ec;border-radius:9px;padding:12px;background:#fafbfc}#${ID} .ibActivityTitle{display:flex;justify-content:space-between;gap:8px;align-items:center;margin:2px 0 9px;color:#173a57;font-size:12px}#${ID} .ibActivityTitle span{font-size:10.5px;color:#718091}#${ID} .ibActivityCards,#${ID} .ibActivityDistribution{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}#${ID} .ibActivityCards{margin-bottom:14px}#${ID} .ibActivityCard{min-width:0;background:white;border:1px solid #e1e8ed;border-radius:7px;padding:10px 8px;display:flex;flex-direction:column;gap:5px}#${ID} .ibActivityCard small{font-size:10.5px;color:#65798a;font-weight:700}#${ID} .ibActivityCard b{font-size:19px;color:#173a57;overflow-wrap:anywhere}#${ID} .ibActivityCard span{font-size:10px;line-height:1.4;color:#758695}@media(max-width:600px){#${ID} .ibActivityCards,#${ID} .ibActivityDistribution{grid-template-columns:repeat(2,minmax(0,1fr))}}
#${ID} .ibActivityAnalysis .ibActivityCards{grid-template-columns:repeat(3,minmax(0,1fr));flex:1;align-items:stretch;margin-bottom:8px}#${ID} .ibActivityAnalysis .ibActivityCard{justify-content:center;min-height:94px}#${ID} .ibActivityFoot{font-size:10.5px;color:#758695;line-height:1.5;padding-top:6px}@media(max-width:600px){#${ID} .ibActivityAnalysis .ibActivityCards{grid-template-columns:1fr}}
#${ID} .ibLossWrap .ibLossLegend{margin-top:-3px}#${ID} .ibLossWrap .ibLossLegend .ibLeg{justify-content:center;padding:0 0 3px;gap:6px 16px;line-height:1.15}#${ID} .ibLossFormula{display:flex;flex-wrap:wrap;justify-content:center;gap:3px 16px;border-top:1px solid #e9e3e3;padding:6px 2px 2px;font-size:10.5px;line-height:1.45;color:#657487}#${ID} .ibLossFormula b{color:#42566a}#${ID} .r3{align-items:stretch}#${ID} .r3>.ibPanel{display:flex;flex-direction:column;min-width:0}#${ID} .r3>.ibPanel>.ibBody{flex:1;display:flex;flex-direction:column}#${ID} .r3>.ibPanel:first-child .ibActivityAnalysis{flex:1;display:flex;flex-direction:column;min-height:0}#${ID} .r3>.ibPanel:first-child .ibActivityCards,#${ID} .r3>.ibPanel:first-child .ibActivityDistribution{flex:1;align-items:stretch}#${ID} .r3>.ibPanel:first-child .ibActivityCard{justify-content:center}#${ID} .r3 .ibLossWrap{flex:1;display:flex;flex-direction:column;background:#fafbfc;border-color:#dce6ec;margin-top:10px;padding:12px}#${ID} .r3 .ibLossWrap .ibLossLegend{margin-top:8px;align-self:stretch}#${ID} .r3 .ibLossWrap .ibLossLegend .ibLeg{justify-content:center;align-items:center;padding:7px 0;margin:0;gap:8px 20px;border-top:1px solid #e5ebf0;border-bottom:1px solid #e5ebf0}#${ID} .r3 .ibLossWrap .ibLossLegend .ibLeg i{vertical-align:-1px}#${ID} .r3 .ibLossFormula{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:auto;padding:12px 0 0;border-top:0}#${ID} .r3 .ibLossFormula>div{min-width:0;background:#fff;border:1px solid #e1e8ed;border-radius:7px;padding:10px 8px;display:flex;flex-direction:column;gap:6px}#${ID} .r3 .ibLossFormula b{font-size:11px;color:#173a57}#${ID} .r3 .ibLossFormula span{font-size:10.5px;line-height:1.5;color:#657487}#${ID} .r3 .ibLossLabel{color:#173a57;margin-bottom:8px}@media(max-width:600px){#${ID} .r3 .ibLossFormula{grid-template-columns:1fr}}
#${ID} .ibLossWrap>div[style*="padding:28px"]{padding:12px 10px!important;margin-top:4px!important}
#${ID} .ibLossRow{display:flex;align-items:flex-end;gap:3px;height:38px}
#${ID} .ibLossCol{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:2px;min-width:0}
#${ID} .ibLossBar{width:60%;background:#c0392b;border-radius:2px 2px 0 0;min-height:2px}
#${ID} .ibLossCol b{font-size:10px;color:#a0453a;font-weight:850;height:12px}#${ID} .ibLeg i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:5px;vertical-align:-1px}
#${ID} svg text{font-family:inherit}#${ID} .hit{cursor:pointer}#${ID} .hit:hover{opacity:.85}
#${ID} .ibFoot{margin:10px 2px 0;font-size:12px;color:#7a8a97}
/* Fit both chart canvases to their panels instead of creating horizontal scrollbars. */
#${ID} .ibBody{overflow-x:hidden!important;max-width:100%;min-width:0}
#${ID} .ibBody svg{display:block;width:100%!important;max-width:100%!important;height:auto!important;min-width:0;overflow:visible}
#${ID} .ibRow,#${ID} .ibPanel{min-width:0;max-width:100%}
@media(max-width:1100px){#${ID} .r1,#${ID} .r3{grid-template-columns:1fr!important}}

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

.app.awFocused #${ID}{display:none!important}
@media print{#${ID} .ibBar,#${ID} .ibEv{display:none!important}#${ID} .ibBody{overflow:visible!important}#${ID} svg{width:100%!important;height:auto!important;max-width:100%}#${ID} .ibPanel{break-inside:avoid;page-break-inside:avoid}#${ID} .ibRow{grid-template-columns:1fr!important}}`;document.head.appendChild(s)}
function data(){
  const K=window.HD20KPIData,snap=K?.snapshot?.()||{},rows=snap.rows||[],M=window.HD20ProductionTeamMaster,teams=[...new Set([...(M?.teamNames?.()||[]),...rows.map(r=>r.team).filter(Boolean)])],HC=(()=>{let stored=[];try{const v=JSON.parse(localStorage.getItem('hd20TeamHeadcountMasterV1')||'[]');if(Array.isArray(v))stored=v}catch{}const canonical=window.HD20_HEADCOUNT_MASTER||[];const byTeam=new Map(stored.map(x=>[x.team,x]));canonical.forEach(x=>{if(Number(x.headcount)>0)byTeam.set(x.team,x)});return [...byTeam.values()]})();
  const hcOf=t=>{const v=Number(HC.find(h=>h.team===t)?.headcount);return Number.isFinite(v)&&v>0?v:0};
  const groupOf=t=>M?.groupOf?.(t)||'';
  const years=[...new Set(rows.map(r=>String(r.date||r.regDate||'').slice(0,4)).filter(Boolean))].sort();
  return{rows,teams,hcOf,groupOf,groups:M?.groupNames?.()||[],years,snapYear:String(snap.year||years[years.length-1]||new Date().getFullYear())};
}
const cdOf=r=>String((window.HD20KPIData?.confirmedDate?.(r))||r.confirmedAt||r.judgedAt||r.date||'').slice(0,10);
function filt(D,{ignoreMonth=false,ignoreYear=false}={}){
  return D.rows.filter(r=>{const d=String(r.date||r.regDate||'');if(!ignoreYear&&d.slice(0,4)!==S.year)return false;if(!ignoreMonth&&S.month&&d.slice(5,7)!==S.month)return false;
    if(S.judge==='Y'&&r.judgeState!=='확정')return false;if(S.judge==='N'&&r.judgeState==='확정')return false;if(S.type&&r.type!==S.type)return false;if(S.group&&D.groupOf(r.team)!==S.group)return false;
    if(S.roll==='Y'&&r.horizontalRollout!==true)return false;if(S.roll==='N'&&r.horizontalRollout===true)return false;return true})}
const monthOf=r=>+String(r.date||r.regDate||'').slice(5,7);
function axis(v,{integer=false,tight=false}={}){if(!Number.isFinite(v)||v<=0)return{step:1,max:4};const raw=Math.max(integer?1:0.0001,v/(tight?5:4)),p=Math.pow(10,Math.floor(Math.log10(raw))),f=raw/p,n=f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10,step=Math.max(integer?1:0,n*p);return{step,max:Math.max((tight?1:4)*step,Math.ceil(v/step-1e-9)*step)}}
const tk=v=>String(Number(v.toFixed(3)));
function chart({w,h=240,cats,series,stack=false,per=false,rotate=false,sel=null,colorOf=null,minSlot=36,fmt=null,hline=null,linkX=false,topPct=null,topExtra=null,axisHeadroom=0,raisePlot=false,plotBottom=null,tightAxis=false,labelTotals=null}){
  const F=v=>fmt?fmt(v):fx(v,per);
  const W0=Math.max(320,w),slot0=(W0-56)/Math.max(1,cats.length);rotate=rotate||(slot0<58&&cats.some(c=>String(c).length>3));
  const m={l:46,r:10,t:Array.isArray(labelTotals)?32:(raisePlot?12:20),b:plotBottom??(rotate?84:(raisePlot?24:30))},W=W0,iw=W-m.l-m.r,ih=h-m.t-m.b;
  const tot=cats.map((_,i)=>stack?series.reduce((a,s)=>a+(s.vals[i]||0),0):Math.max(...series.map(s=>s.vals[i]||0)));
  const dataMax=Math.max(0.0001,...tot,hline?hline.value*1.05:0),integerAxis=!per&&tot.every(v=>Number.isInteger(v))&&(!hline||Number.isInteger(hline.value)),ax=axis(tot.every(v=>v===0)&&!hline?0:dataMax*(1+Math.max(axisHeadroom,integerAxis?0.12:0)),{integer:integerAxis,tight:tightAxis}),max=ax.max,yv=v=>m.t+ih-(v/max)*ih,slot=iw/Math.max(1,cats.length);
  let g='';for(let i=0;i<=Math.round(max/ax.step);i++){const v=ax.step*i,y=yv(v);g+=`<line x1="${m.l}" x2="${W-m.r}" y1="${y}" y2="${y}" stroke="${C.grid}"/><text x="${m.l-6}" y="${y+4}" text-anchor="end" font-size="11" fill="${C.soft}">${tk(v)}</text>`}
  let b='';const n0=series.length,bw0=stack?Math.min(40,slot*.6):Math.min(24,slot*.72/n0);
  const scales=series.map(s=>s.widthScale||1),bws=scales.map(sc=>bw0*sc),gap=stack?0:Math.max(1,bw0*.08),groupW=bws.reduce((a,w)=>a+w,0)+gap*(n0-1);
  cats.forEach((c,i)=>{const cx=m.l+slot*i+slot/2,n=n0,bw=bw0;let startX=cx-groupW/2,acc=0;
    series.forEach((s,k)=>{const v=s.vals[i]||0;const bwK=bws[k];if(v<=0){startX+=bwK+gap;return}const hh=Math.max(2,(v/max)*ih);const x=stack?cx-bwK/2:startX;const y=stack?yv(acc+v):yv(v);const col=colorOf?colorOf(c,i,k):s.color;
      b+=`<rect ${(sel!==null&&c===sel)?'stroke="#14304c" stroke-width="2"':''} x="${x}" y="${y}" width="${bwK}" height="${hh}" rx="2" fill="${col}" class="hit" data-cat="${esc(c)}"><title>${esc(c)} · ${esc(s.name)}: ${F(v)}</title></rect>`;
      if(!stack){const hasPct=s.pct&&Number.isFinite(s.pct[i]),totalsForSeries=Array.isArray(s.labelTotals)?s.labelTotals:labelTotals,hasTotal=Array.isArray(totalsForSeries)&&Number.isFinite(totalsForSeries[i]);const pctTxt=hasPct?` (${s.pct[i]}%)`:'';
        b+=hasTotal?`<text x="${x+bwK/2}" y="${y-18}" text-anchor="middle" font-size="11.5" font-weight="800" fill="${C.ink}">${F(v)}<tspan x="${x+bwK/2}" dy="14" font-size="10.5" font-weight="700">(${Math.round(totalsForSeries[i])}건)</tspan></text>`:hasPct?`<text x="${x+bwK/2}" y="${y-18}" text-anchor="middle" font-size="10.5" font-weight="800" fill="${C.ink}">${F(v)}<tspan x="${x+bwK/2}" dy="12" font-size="9">${pctTxt.trim()}</tspan></text>`:`<text x="${x+bwK/2}" y="${y-4}" text-anchor="middle" font-size="10.5" font-weight="800" fill="${C.ink}">${F(v)}</text>`}
      acc+=v;startX+=bwK+gap});
    if(stack&&tot[i]>0){const tp=topPct&&Number.isFinite(topPct[i])?topPct[i]:null,tx=topExtra&&topExtra[i]?topExtra[i]:null;
      b+=Array.isArray(labelTotals)&&Number.isFinite(labelTotals[i])?`<text x="${cx}" y="${yv(tot[i])-18}" text-anchor="middle" font-size="10.5" font-weight="800" fill="${C.ink}">${F(tot[i])}<tspan x="${cx}" dy="12" font-size="9.5">(${Math.round(labelTotals[i])}건)</tspan></text>`:`<text x="${cx}" y="${yv(tot[i])-4}" text-anchor="middle" font-size="10.5" font-weight="800" fill="${C.ink}">${F(tot[i])}</text>`;
      if(tp!==null)b+=`<text x="${cx}" y="${yv(tot[i])-17}" text-anchor="middle" font-size="9.5" font-weight="800" fill="${tp<70?'#c0392b':'#2f7a4d'}">완료 ${tp}%</text>`;
      if(tx)b+=`<text x="${cx}" y="${yv(tot[i])-19}" text-anchor="middle" font-size="9.5" font-weight="850" fill="${tx.color}">${esc(tx.text)}</text>`}
    /* linkX(클릭해서 아래 두 차트를 그 팀으로 바꾸는 드릴다운)인 x축 라벨 전부에 밑줄을 상시 표시해,
       16개 팀명이 한꺼번에 파란 밑줄 링크처럼 보여 차트 하단이 산만했음(표현 방법 개선: 클릭 가능함은
       hover 시 밑줄로 여전히 알 수 있게 하되 평상시엔 깔끔하게). 선택된 팀(isSel)은 강조를 위해 밑줄 유지. */
    const ly=m.t+ih+15,isSel=sel!==null&&c===sel,lblCls=linkX?' class="hit xlbl"':'',lblAttr=linkX?` data-cat="${esc(c)}"`:'',lblFill=linkX?'#1764b5':(isSel?'#14304c':C.soft),lblDeco=linkX?' text-decoration="underline"':'';
    b+=rotate?`<text transform="translate(${cx+4},${ly}) rotate(-45)"${lblCls}${lblAttr} text-anchor="end" font-size="11" fill="${lblFill}"${lblDeco} font-weight="${isSel?900:600}">${esc(c)}</text>`:`<text x="${cx}" y="${ly}"${lblCls}${lblAttr} text-anchor="middle" font-size="11.5" fill="${lblFill}"${lblDeco}>${esc(c)}</text>`});
  return `<svg width="${W}" height="${h}" viewBox="0 0 ${W} ${h}" role="img">${g}<line x1="${m.l}" x2="${W-m.r}" y1="${m.t+ih}" y2="${m.t+ih}" stroke="#b7c6d1"/>${b}${hline?`<line x1="${m.l}" x2="${W-m.r}" y1="${yv(hline.value)}" y2="${yv(hline.value)}" stroke="#c0392b" stroke-width="1.6" stroke-dasharray="6 4"/><text x="${W-m.r}" y="${yv(hline.value)-5}" text-anchor="end" font-size="11" font-weight="800" fill="#c0392b">${esc(hline.label)}</text>`:''}</svg>`}
const leg=a=>`<div class="ibLeg">${a.map(x=>`<span><i style="background:${x[1]}"></i>${esc(x[0])}</span>`).join('')}</div>`;
function render(box){
  const D=data();if(!D.rows.length&&!window.HD20KPIData)return;
  if(!S.year)S.year=D.snapYear;const per=S.metric==='per',unit=per?'건/인':'건',mm=S.month?+S.month:(+S.year===new Date().getFullYear()?new Date().getMonth()+1:12);
  const teamsAll=D.teams.filter(t=>!S.group||D.groupOf(t)===S.group),hcAll=teamsAll.reduce((a,t)=>a+D.hcOf(t),0)||1,inTeams=r=>teamsAll.includes(r.team);
  const rowsM=filt(D).filter(inTeams),rowsY=filt(D,{ignoreMonth:true}).filter(inTeams),W=window.__hd20BoardPrint?680:Math.max(320,(box.clientWidth||900)-36);
  const div=v=>per?v/hcAll:v;
  // a) 유형별 등록·진행 — 건수로 고정 표시(인당/총 건수 선택과 무관)
  const doneT=TYPES.map(t=>rowsM.filter(r=>r.type===t&&DONE.includes(r.status)).length),allT=TYPES.map(t=>rowsM.filter(r=>r.type===t).length);
  /* 자율개선 사례는 이미 완료된 건만 등록하는 것이 원칙이라(등록 시점=완료 시점), '완료 vs 진행'으로 나누는 것은
     맞지 않음(검증 데이터에는 진행중 등 상태가 섞여 있으나 이는 실제 운영 규칙과 다른 시험 데이터의 한계).
     유형별 등록 건수(=완료된 사례 수) 하나만 표시.
     '5S 고도화'는 판정을 거치는 특수 유형이라 건수가 다른 5개 기본 유형보다 수 배 많아지는 경우가 흔한데,
     6개를 같은 선형 축 막대그래프에 함께 넣으면 '5S 고도화' 막대만 크게 솟고 나머지 5개는 거의 평평하게
     찌그러져 보여 비교가 안 되는 문제가 있었음(사용자 지적: "차트가 지저분하고 조잡하다"). 데이터 값은
     그대로 두고 표현만 바꿔 해결: '5S 고도화'는 축 비교가 아닌 강조 숫자 배지로 분리 표시하고, 차트는
     서로 자릿수가 비슷한 나머지 5개 기본 유형만으로 그려 막대 높이 차이가 실제 비교에 의미 있게 함. */
  const BASIC_TYPES=TYPES.filter(t=>t!=='5S 고도화'),basicAllT=BASIC_TYPES.map(t=>rowsM.filter(r=>r.type===t).length),advIdx=TYPES.indexOf('5S 고도화'),advCnt=allT[advIdx]||0,advPct=allT.reduce((a,b)=>a+b,0)?Math.round(advCnt/allT.reduce((a,b)=>a+b,0)*1000)/10:0;
  const A=(()=>{
    const width=window.__hd20BoardPrint?W-8:Math.max(320,Math.floor(W*.4)-10);
    const denom=teamsAll.reduce((sum,t)=>sum+D.hcOf(t),0);
    const rates=basicAllT.map(n=>denom>0?n/denom:0);
    const maxCount=Math.max(1,...basicAllT)*1.2;
    const x=i=>46+(width-74)*(i+.5)/BASIC_TYPES.length, y=v=>290-v/maxCount*260;
    /* 사용자 지시: "84밑에 줄바꿈으로 인당 건수를 같이 표현할 수 있게 수정해줘 따로 저렇게 표현하지
       말고" — 막대 위 건수(84)와 그 아래 별도 주황 배지(0.20)로 떨어져 있던 걸, 건수 바로 아래 같은
       라벨 안에 줄바꿈으로 붙여 하나의 표기로 합침. 배지(둥근 사각형)는 제거. */
    const bars=BASIC_TYPES.map((name,i)=>{
      const cx=x(i),c=basicAllT[i],cy=y(c),r=rates[i];
      return '<rect x="'+(cx-12)+'" y="'+cy+'" width="24" height="'+(290-cy)+'" rx="2" fill="#20746f"/>'+
        '<text x="'+cx+'" y="'+(cy-19)+'" text-anchor="middle" font-size="11" font-weight="700" fill="#173a57">'+c+'</text>'+
        '<text x="'+cx+'" y="'+(cy-6)+'" text-anchor="middle" font-size="10" font-weight="700" fill="#a55f10">('+(denom>0?r.toFixed(2):'—')+')</text>'+
        '<text x="'+cx+'" y="309" text-anchor="middle" font-size="10">'+name+'</text>';
    }).join('');
    const ticks=[0,.25,.5,.75,1].map(k=>'<line x1="46" x2="'+(width-28)+'" y1="'+(290-k*260)+'" y2="'+(290-k*260)+'" stroke="#e2e6e9"/><text x="37" y="'+(294-k*260)+'" text-anchor="end" font-size="10">'+Math.round(maxCount*k)+'</text>').join('');
    return '<svg width="'+width+'" height="330" viewBox="0 0 '+width+' 330" role="img" aria-label="5S 유형별 등록건수 막대 및 인당 개선건수 수치 배지">'+ticks+bars+'</svg>';
  })();
  // b) 월별 — 건수로 고정 표시. 수평전개 적용대상건수는 그 달 5S 활동 완료건수 대비 비율(%)을 값 옆에 병기하고 막대를 넓혀 값이 겹치지 않게 함
  const mo=(pred)=>Array.from({length:12},(_,i)=>rowsY.filter(r=>monthOf(r)===i+1&&pred(r)).length),rowsC=filt(D,{ignoreYear:true,ignoreMonth:true}).filter(inTeams),cy=r=>cdOf(r).slice(0,4),cm=r=>+cdOf(r).slice(5,7),confM=(a)=>Array.from({length:12},(_,i)=>a.filter(r=>r.judgeState==='확정'&&r.valid!==false&&r.attrition!==true&&cy(r)===S.year&&cm(r)===i+1).length),ML=Array.from({length:12},(_,i)=>String(i+1).padStart(2,'0')+'월');
  const isRollout=r=>{const v=r.horizontalRollout??r.isHorizontalRollout??r.rolloutApplied??r.horizontalDeployment;const flag=v===true||v===1||['Y','YES','TRUE','1','적용','완료'].includes(String(v??'').trim().toUpperCase());const state=String(r.rolloutState||r.horizontalRolloutState||'').trim();return flag||['수평전개중','수평전개 완료','적용완료','완료'].includes(state)};
  const doneM=mo(r=>DONE.includes(r.status)),rollM=mo(r=>isRollout(r)),rollPct=rollM.map((v,i)=>doneM[i]?Math.round(v/doneM[i]*1000)/10:null);
  const B=chart({w:(window.__hd20BoardPrint?W-8:Math.floor(W*.6)-10),h:284,cats:ML,per:false,minSlot:0,axisHeadroom:0.08,raisePlot:true,plotBottom:34,tightAxis:true,series:[{name:'5S 활동 완료건수',vals:doneM,color:C.dark},{name:'고도화 확정 건수',vals:confM(rowsC),color:C.amber},{name:'수평전개 적용대상건수',vals:rollM,color:C.grey,widthScale:1.5,pct:rollPct}]});
  // 월별 추이 분석: 완료된 최근 두 달을 비교하며, 모든 값은 차트와 동일한 원천 배열에서 산출
  const upgradeM=confM(rowsC);
  const trendNow=new Date(),currentYear=String(trendNow.getFullYear());
  const lastClosed=S.year===currentYear?trendNow.getMonth():12;
  const validMonths=Array.from({length:Math.max(0,lastClosed)},(_,i)=>i).filter(i=>doneM[i]>0||upgradeM[i]>0||rollM[i]>0);
  const latest=validMonths.length?validMonths[validMonths.length-1]:-1;
  const prev=latest>0?latest-1:-1;
  const pct=(n,d)=>d>0?n/d*100:null;
  const fmtP=v=>v===null?'산정 불가':v.toFixed(1)+'%';
  const delta=(a,b,unit)=>{if(b===null||a===null)return '비교 불가';const v=a-b;return (v>0?'+':'')+v.toFixed(unit==='건'?0:1)+unit};
  const trendCard=(name,cur,old,unit,detail)=>'<div class="ibTrendCard"><div class="ibTrendLabel">'+name+'</div><div class="ibTrendMain">'+(cur===null?'산정 불가':(unit==='건'?cur.toLocaleString()+'건':fmtP(cur)))+'</div><div class="ibTrendDelta">전월 대비 '+delta(cur,old,unit==='건'?'건':'%p')+(unit==='건'&&old>0?' ('+delta(pct(cur-old,old),0,'%')+')':'')+'</div><div class="ibTrendCompare">'+detail+'</div></div>';
  const monthLabel=i=>(i+1)+'월';
  const trendPanel=latest<0?'<div class="ibTrendEmpty">비교 가능한 월별 실적이 없습니다.</div>':(()=>{
    const base=prev>=0,done=doneM[latest],up=upgradeM[latest],rate=pct(rollM[latest],done),oldRate=base?pct(rollM[prev],doneM[prev]):null;
    const pair=(oldV,newV,u)=>base?monthLabel(prev)+' '+oldV+u+' → '+monthLabel(latest)+' '+newV+u:'전월 비교 데이터 없음';
    const ratePair=base?monthLabel(prev)+' '+fmtP(oldRate)+' → '+monthLabel(latest)+' '+fmtP(rate):'전월 비교 데이터 없음';
    const movement=(cur,old)=>!base?'비교 불가':cur>old?'증가':cur<old?'감소':'동일';
    const interpretation=base?'활동 완료 '+delta(done,doneM[prev],'건')+' · 고도화 확정 '+delta(up,upgradeM[prev],'건')+' · 수평전개 적용률 '+delta(rate,oldRate,'%p')+' (전월 대비)':'전월 비교 가능한 실적이 없어 증감 분석을 표시하지 않습니다.';
    return '<div class="ibMonthlyTrend"><div class="ibTrendTitle"><strong>월별 실적 추이 분석</strong><span>'+S.year+'년 '+monthLabel(latest)+' 기준'+(base?' · 전월 비교':'')+'</span></div><div class="ibTrendCards">'+trendCard('5S 활동 완료',done,base?doneM[prev]:null,'건',pair(base?doneM[prev]:0,done,'건'))+trendCard('고도화 확정',up,base?upgradeM[prev]:null,'건',pair(base?upgradeM[prev]:0,up,'건'))+trendCard('수평전개 적용률',rate,oldRate,'%',ratePair)+'</div><div class="ibTrendSummary"><strong>종합 추이 해석</strong><span>'+interpretation+'</span></div></div>';
  })();
  // c) 팀별 인당
  /* 가로축 정렬: 값(인당 건수) 기준 정렬을 쓰지 않고, 통합기준정보(표시순서) 탭에서 관리하는 생산팀 표시순서를 그대로 따름 */
  const teamOrder=(()=>{try{const v=JSON.parse(localStorage.getItem('gmes5s_team_display_order')||'null');if(Array.isArray(v)&&v.length)return v}catch{}return window.HD20ProductionTeamMaster?.teamNames?.()||null})();
  const orderIdx=t=>{const i=teamOrder?teamOrder.indexOf(t):-1;return i<0?999:i};
  const masterSorted=teamsAll.map(t=>{const c=rowsM.filter(r=>r.team===t).length,h=D.hcOf(t);return{t,c,h,v:per?(h?c/h:0):c}}).sort((a,b)=>orderIdx(a.t)-orderIdx(b.t)||a.t.localeCompare(b.t,'ko'));
  const tv=teamChartLocalOrder?masterSorted.slice().sort((a,b)=>{const ia=teamChartLocalOrder.indexOf(a.t),ib=teamChartLocalOrder.indexOf(b.t);return (ia<0?999:ia)-(ib<0?999:ib)||orderIdx(a.t)-orderIdx(b.t)}):masterSorted;
  if(!S.team||!tv.some(x=>x.t===S.team))S.team=tv[0]?.t||'';
  const totC=tv.reduce((a,x)=>a+x.c,0),avg=per?totC/hcAll:totC/Math.max(1,tv.length);
  /* snapshot()은 매번 원본을 새로 파싱해 매 호출마다 새 객체를 만들므로 참조 비교(Set.has)가 항상 실패함 — id로 비교 */
  const keepSet=new Set((window.HD20KPIData?.snapshot?.()?.maintained||[]).map(r=>r.id));
  /* 규칙(대시보드 공통): 목표선이 아니라 '현재 표시된 팀들의 평균' 기준으로 막대 색을 두 가지로만 나눔.
     진한색=평균 이상, 황색=평균 미만. 분기 목표는 활동 수준이 낮아 아직 기준으로 쓰지 않음(목표선 표시 안 함). */
  const Cc=chart({w:W-8,h:290,cats:tv.map(x=>x.t),per,rotate:true,sel:S.team,minSlot:46,linkX:true,labelTotals:per?tv.map(x=>x.c):null,series:[{name:per?'5S 활동/총원':'5S 활동 건수',vals:tv.map(x=>x.v),color:C.dark}],colorOf:(c,i)=>tv[i].v>=avg?C.dark:C.amber});
  const owners=new Set(D.rows.filter(r=>String(r.date||r.regDate||'').slice(0,4)===S.year&&monthOf(r)===mm&&teamsAll.includes(r.team)&&(!S.type||r.type===S.type)).map(r=>r.owner).filter(Boolean)).size,part=(owners/hcAll*100);
  // d,e) 선택 팀 월별
  const th=D.hcOf(S.team)||1,tr=rowsY.filter(r=>r.team===S.team),tm=(pred)=>Array.from({length:12},(_,i)=>{const c=tr.filter(r=>monthOf(r)===i+1&&pred(r)).length;return per?c/th:c});
  const dTotals=Array.from({length:12},(_,i)=>tr.filter(r=>monthOf(r)===i+1).length);
  const dVals=per?dTotals.map(c=>c/th):dTotals;
  const dCum=dVals.reduce((a,b)=>a+b,0);
  // Show original monthly activity counts beneath per-person values; never infer
  // counts by multiplying rounded per-person labels.
  // Monthly per-person trend: actual counts remain a separate second-line label.
  // Future months are not plotted; no source records or KPI aggregates are changed.
  const lineNow=new Date(),lineLast=Number(S.year)<lineNow.getFullYear()?12:Number(S.year)===lineNow.getFullYear()?lineNow.getMonth()+1:0;
  const lineW=Math.max(320,(window.__hd20BoardPrint?W-8:Math.floor(W/2)-8)),lineH=240;
  const lineM={l:46,r:12,t:37,b:30},lineIW=lineW-lineM.l-lineM.r,lineIH=lineH-lineM.t-lineM.b;
  const lineValues=dVals.slice(0,lineLast),lineMax=Math.max(0.01,...lineValues)*1.2;
  const lineAxis=axis(lineMax,{integer:!per,tight:true}),lineY=v=>lineM.t+lineIH-v/lineAxis.max*lineIH;
  const lineX=i=>lineM.l+lineIW*(i+.5)/12;
  const lineTicks=Array.from({length:Math.round(lineAxis.max/lineAxis.step)+1},(_,i)=>{const v=i*lineAxis.step,y=lineY(v);return '<line x1="'+lineM.l+'" x2="'+(lineW-lineM.r)+'" y1="'+y+'" y2="'+y+'" stroke="'+C.grid+'"/><text x="'+(lineM.l-7)+'" y="'+(y+4)+'" text-anchor="end" font-size="11" fill="'+C.soft+'">'+tk(v)+'</text>'}).join('');
  const linePath=lineValues.map((v,i)=>(i?'L':'M')+lineX(i).toFixed(1)+' '+lineY(v).toFixed(1)).join(' ');
  const lineDots=lineValues.map((v,i)=>{const x=lineX(i),y=lineY(v),label=fx(v,per),count=dTotals[i];return '<circle cx="'+x+'" cy="'+y+'" r="4.5" fill="'+C.dark+'" stroke="#fff" stroke-width="1.5"><title>'+ML[i]+' · '+label+(per?'건/인':'건')+' · '+count+'건</title></circle><text x="'+x+'" y="'+(y-20)+'" text-anchor="middle" font-size="11.5" font-weight="800" fill="'+C.ink+'">'+label+(per?'<tspan x="'+x+'" dy="14" font-size="10.5" font-weight="700">('+count+'건)</tspan>':'')+'</text>'}).join('');
  const lineMonths=ML.map((m,i)=>'<text x="'+lineX(i)+'" y="'+(lineH-9)+'" text-anchor="middle" font-size="11" fill="'+C.soft+'">'+m+'</text>').join('');
  const Dd='<svg width="'+lineW+'" height="'+lineH+'" viewBox="0 0 '+lineW+' '+lineH+'" role="img" aria-label="선택팀 월별 인당 개선건수 꺾은선 추세 차트">'+lineTicks+(linePath?'<path d="'+linePath+'" fill="none" stroke="'+C.dark+'" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>':'')+lineDots+lineMonths+'</svg>';
  // Selected-team activity diagnostics: completed months only; current month remains provisional.
  const analysisNow=new Date(),analysisYear=Number(S.year);
  const closedCount=analysisYear<analysisNow.getFullYear()?12:analysisYear===analysisNow.getFullYear()?analysisNow.getMonth():0;
  const visibleCount=analysisYear<analysisNow.getFullYear()?12:analysisYear===analysisNow.getFullYear()?analysisNow.getMonth()+1:0;
  const closedCounts=dTotals.slice(0,closedCount),visibleCounts=dTotals.slice(0,visibleCount);
  const visibleTotal=visibleCounts.reduce((a,b)=>a+b,0),closedTotal=closedCounts.reduce((a,b)=>a+b,0);
  const closedAvg=closedCount?closedTotal/closedCount:null,activeMonths=closedCounts.filter(v=>v>0).length;
  const prevClosedCount=closedCount>=1?closedCounts[closedCount-1]:null,priorClosedCount=closedCount>=2?closedCounts[closedCount-2]:null;
  const closedChange=priorClosedCount===null?'산정 불가':(prevClosedCount-priorClosedCount>0?'+':'')+(prevClosedCount-priorClosedCount)+'건';
  const peakClosedCount=closedCounts.length?Math.max(...closedCounts):null;
  const concentration=closedTotal>0&&peakClosedCount!==null?(peakClosedCount/closedTotal*100).toFixed(1)+'%':'산정 불가';
  const emptyMonths=closedCount-activeMonths;
  const metricCard=(label,value,desc)=>'<div class="ibActivityCard"><small>'+label+'</small><b>'+value+'</b><span>'+desc+'</span></div>';
  const activityDiagnostics='<div class="ibActivityAnalysis"><div class="ibActivityTitle"><b>선택팀 활동 실적 분석</b><span>마감월 기준 · '+closedCount+'개월</span></div><div class="ibActivityCards">'+
    metricCard('활동 규모',visibleTotal+'건','연간 누적 · '+visibleCount+'개월'+(visibleCount>closedCount?' (당월 잠정 포함)':''))+
    metricCard('활동 지속성',closedCount?activeMonths+'/'+closedCount+'개월':'산정 불가','활동 발생 '+activeMonths+'개월 · 공백 '+(closedCount-activeMonths)+'개월')+
    metricCard('최근 마감월 변화',closedChange,priorClosedCount===null?'비교 가능한 마감월 부족':String(closedCount-1).padStart(2,'0')+'월 '+priorClosedCount+'건 → '+String(closedCount).padStart(2,'0')+'월 '+prevClosedCount+'건')+
    metricCard('활동 편중',concentration,'최다 실적월 건수 ÷ 마감월 누적 건수')+
    metricCard('월평균 활동',closedAvg===null?'산정 불가':closedAvg.toFixed(1)+'건','마감월 누적 건수 ÷ '+closedCount+'개월')+
    metricCard('활동 공백월',closedCount?emptyMonths+'개월':'산정 불가','마감월 중 활동 등록 0건인 월')+
    '</div><div class="ibActivityFoot">활동 건수와 지속성의 참고 지표이며, 활동 품질 또는 목표 달성을 의미하지 않습니다.</div></div>';

/* 팀별 고도화 유지·이탈: 기록된 날짜만 사용하고 미기록 이탈일은 추정하지 않음. */
  const teamConf=rowsC.filter(r=>r.team===S.team&&r.judgeState==='확정'),now=new Date(),nowIdx=now.getFullYear()*12+now.getMonth();
  const asDate=v=>{const m=String(v||'').match(/^(20\d{2})-(\d{2})-(\d{2})/);if(!m)return null;const d=new Date(+m[1],+m[2]-1,+m[3]);return d.getFullYear()===+m[1]&&d.getMonth()+1===+m[2]&&d.getDate()===+m[3]?d:null};
  const monthIdx=d=>d.getFullYear()*12+d.getMonth();
  const placeOf=r=>String(r.workplaceId||r.workplace||r.workArea||r.area||'').trim();
  const teamRows=teamConf.map(r=>{const c=asDate(cdOf(r)),l=asDate(r.maintainLostAt||r.maintainEndedAt||r.maintainStoppedAt||r.lostAt||r.invalidatedAt||r.attritionAt);return{w:placeOf(r),ci:c?monthIdx(c):null,li:l?monthIdx(l):null,maintaining:keepSet.has(r.id)};}).filter(r=>r.ci!==null);
  const est=teamRows.filter(r=>!r.maintaining&&r.li===null).length;
  const cyy=+S.year,exArr=[],nwArr=[],lossArr=[],declineArr=[],pendingArr=[];
  const unknownRows=teamRows.filter(r=>!r.maintaining&&r.li===null);
  const datedLossRows=teamRows.filter(r=>r.li!==null);
  const workplaceRows=teamRows.filter(r=>r.w);
  const knownWorkplaces=[...new Set(workplaceRows.map(r=>r.w))].length;
  const lastMonth=cyy<now.getFullYear()?12:cyy===now.getFullYear()?now.getMonth()+1:0;
  for(let m=0;m<12;m++){
    const mi=cyy*12+m;
    if(m>=lastMonth){exArr.push(null);nwArr.push(null);lossArr.push(null);declineArr.push(null);pendingArr.push(null);continue}
    const active=r=>r.li===null?r.maintaining:r.li>mi;
    exArr.push(teamRows.filter(r=>r.ci<mi&&active(r)).length);
    nwArr.push(teamRows.filter(r=>r.ci===mi&&active(r)).length);
    pendingArr.push(teamRows.filter(r=>r.ci<=mi&&!r.maintaining&&r.li===null).length);
    lossArr.push(teamRows.filter(r=>r.li===mi&&r.ci<=mi).length);
    if(m===0){declineArr.push(null);continue}
    const ratio=(w,at)=>{const cohort=teamRows.filter(r=>r.w===w&&r.ci<=at);if(!cohort.length||cohort.some(r=>!r.maintaining&&r.li===null))return null;return cohort.filter(r=>r.li===null||r.li>at).length/cohort.length};
    let compared=0,declined=0;
    for(const w of new Set(workplaceRows.map(r=>r.w))){const prev=ratio(w,mi-1),curr=ratio(w,mi);if(prev===null||curr===null)continue;compared++;if(curr<prev)declined++}
    declineArr.push(compared?declined:null)
  }
  const divE=v=>v===null?null:(per?v/th:v),curKeep=teamConf.filter(r=>keepSet.has(r.id)).length;
  // Demo only for missing Jan-Aug history. Actual months and source KPIs are unchanged.
  const earlyMonths=Math.min(8,lastMonth),missingEarly=earlyMonths>0&&exArr.slice(0,earlyMonths).every(v=>!v)&&nwArr.slice(0,earlyMonths).every(v=>!v);
  const sampleExisting=[0,1,1,2,2,3,3,4],sampleNew=[1,1,2,1,2,1,2,1];
  const displayExisting=exArr.map((v,i)=>missingEarly&&i<earlyMonths?sampleExisting[i]:v);
  const displayNew=nwArr.map((v,i)=>missingEarly&&i<earlyMonths?sampleNew[i]:v);
  const E=(missingEarly?'<div class="ibSampleBanner">1~8월 예시 데이터 · 차트 검증용 (실적 미반영)</div>':'')+chart({w:(window.__hd20BoardPrint?W-8:Math.floor(W/2)-8),cats:ML,per:false,stack:false,series:[{name:'기존 유지(현상태 기준)',vals:displayExisting,color:'#a8c7c4'},{name:'신규 확정',vals:displayNew,color:C.dark}]});
  const knownLoss=lossArr.some(v=>Number.isFinite(v)&&v>0),declineMonths=declineArr.filter(Number.isFinite).length;
  const lossTot=lossArr.reduce((a,b)=>a+(Number.isFinite(b)?b:0),0);
  const declineTot=declineArr.reduce((a,b)=>a+(Number.isFinite(b)?b:0),0);
  // UI-only fixture when source lacks dated attrition / workplace history.
  // Never mutate source records, KPI totals, evidence exports or production metrics.
  const showSample=!knownLoss&&!declineMonths;
  const demoLoss=[0,1,0,1,0,1,0,1,0,1,0,0].map((v,i)=>i<lastMonth?v:null);
  const demoDecline=[null,0,1,0,1,0,1,1,0,1,0,0].map((v,i)=>i<lastMonth?v:null);
  const lossBar=showSample
    ?'<div class="ibSampleBanner">예시 데이터 · 화면 디자인 검증용 (실적 미반영)</div>'+chart({w:(window.__hd20BoardPrint?W-8:Math.floor(W/2)-8),h:185,cats:ML,tightAxis:true,axisHeadroom:0,series:[{name:'작업사례 이탈 (예시)',vals:demoLoss,color:'#c13f36'},{name:'작업장 유지수준 하락 (예시)',vals:demoDecline,color:'#d89a35'}]})
    :chart({w:(window.__hd20BoardPrint?W-8:Math.floor(W/2)-8),h:185,cats:ML,tightAxis:true,axisHeadroom:0,series:[{name:'작업사례 이탈',vals:knownLoss?lossArr:Array(12).fill(null),color:'#c13f36'},{name:'작업장 유지수준 하락',vals:declineMonths?declineArr:Array(12).fill(null),color:'#d89a35'}]});
  const lossChart=`<div class="ibLossWrap"><div class="ibLossLabel">작업사례 이탈 · 작업장 유지수준 하락<em>이탈 ${knownLoss?lossTot+'건':'자료 없음'} · 유지수준 하락 ${declineMonths?declineTot+'곳':'자료 없음'}</em></div>${lossBar}<div class="ibLossLegend">${leg([['작업사례 이탈','#c13f36'],['작업장 유지수준 하락','#d89a35']])}</div><div class="ibLossFormula"><div><b>작업사례 이탈(건)</b><span>해당 월 실제 이탈일이 기록된 확정 사례 수</span></div><div><b>유지수준 하락(곳)</b><span>전월보다 유지율이 낮아진 작업장 수</span></div><div><b>작업장 유지율(%)</b><span>유지 사례 수 ÷ 누적 확정 사례 수 × 100</span></div></div></div>`;
  const opt=(a,cur,all='ALL')=>`<option value="">${all}</option>`+a.map(x=>`<option value="${esc(x)}"${x===cur?' selected':''}>${esc(x)}</option>`).join('');
  box.innerHTML=`<div class="ibTitle"><h2>5S 자율개선 종합 대시보드</h2></div><p class="ibNote">기본 조회조건은 당해년도 연간누적 데이터입니다 (월간 데이터 조회 시, 해당 월을 선택하세요)</p>
<div class="ibKpis"><div class="ibKpi"><small>5S 활동</small><b>${totC}건</b></div><div class="ibKpi"><small>${per?'인당 활동':'팀 평균 활동'}</small><b>${avg.toFixed(2)}${per?'건/인':'건'}</b></div><div class="ibKpi"><small>당월 참여율</small><b>${part.toFixed(1)}%</b></div></div>
<div class="ibBar"><label>공장 <select disabled><option>[울산] 울산캠퍼스</option></select></label><label>년 <select data-f="year">${D.years.map(y=>`<option${y===S.year?' selected':''}>${y}</option>`).join('')}</select></label>
<label>월 <select data-f="month"><option value="">전체</option>${Array.from({length:12},(_,i)=>{const v=String(i+1).padStart(2,'0');return `<option value="${v}"${v===S.month?' selected':''}>${i+1}월</option>`}).join('')}</select></label><button type="button" data-ib="go">조회</button>
<label>차트집계 <select data-f="metric"><option value="per"${per?' selected':''}>5S 활동/총원 (인당)</option><option value="total"${!per?' selected':''}>총 건수</option></select></label>
<label>부서 <select data-f="group">${opt(D.groups,S.group)}</select></label><label>5S 유형 <select data-f="type">${opt(TYPES,S.type)}</select></label>
<label>고도화 확정 <select data-f="judge"><option value="">ALL</option><option value="Y"${S.judge==='Y'?' selected':''}>확정 결과만</option><option value="N"${S.judge==='N'?' selected':''}>확정 외</option></select></label><label>수평전개 <select data-f="roll"><option value="">ALL</option><option value="Y"${S.roll==='Y'?' selected':''}>적용대상</option><option value="N"${S.roll==='N'?' selected':''}>비대상</option></select></label>
<span class="sp"></span><button type="button" class="alt" data-ib="print">프린트</button><button type="button" class="alt" data-ib="csv">엑셀다운로드</button></div>
<div class="ibRow r1"><div class="ibPanel"><div class="ibHead">5S 유형별 등록건수 및 인당 개선건수<button type="button" class="ibEv" data-evk="a">근거 데이터</button><em>${S.month?S.month.replace(/^0/,'')+'월':'연간누적'} · 건</em></div><div class="ibBody">${A}<div class="ibTypeDefs"><strong>5S 유형별 활동 정의</strong><dl><div><dt>정리</dt><dd>불용·불급·잉여품 제거활동</dd></div><div><dt>정돈</dt><dd>정량·정위치 준수활동</dd></div><div><dt>청소</dt><dd>작업장 청소, 작업장 외(설비, 부대물, 유틸리티 등) 청소</dd></div><div><dt>시각화관리</dt><dd>정량·정위치 준수를 위한 표식관리, 설비·지그·작업장 등의 도색작업</dd></div><div><dt>위험구역관리</dt><dd>출입통제, 타이거마크 표식관리</dd></div><div><dt>설비 자주보전</dt><dd>설비 자주보전 활동 (세부 기준 별도 확정)</dd></div></dl></div></div></div>
<div class="ibPanel"><div class="ibHead">월별 등록 및 진행현황<button type="button" class="ibEv" data-evk="b">근거 데이터</button><em>${S.year}년 · 건 · 수평전개=그 달 완료건수 대비 %</em></div><div class="ibBody"><div class="ibMonthlyCompact">${B}${leg([['5S 활동 완료건수',C.dark],['고도화 확정 건수',C.amber],['수평전개 적용대상건수',C.grey]])}</div>${trendPanel}</div></div></div>
<div class="ibRow"><div class="ibPanel"><div class="ibHead">현장조직 팀에 대한 개선활동 현황${per?'(인당 개선건수)':'(총 건수)'}<button type="button" class="ibEv" data-ib="saveTeamOrder" title="현재 차트 팀 순서를 기준정보 표시순서에 저장">${teamChartOrderDirty?'순서 저장 *':'순서 저장'}</button><button type="button" class="ibEv" data-ib="resetTeamOrder" title="기준정보 기본 정렬로 복원">기본순서 복원</button><button type="button" class="ibEv" data-evk="c">근거 데이터</button><em class="pt">당월(${String(mm).padStart(2,'0')}월) 현재 참여율 ${part.toFixed(1)}% (등록자 ${owners}명 / 총원 ${hcAll}명)</em></div><div class="ibBody"><div style="font-size:11px;color:#63768a;margin:0 0 6px">팀명 또는 막대를 좌우로 드래그해 화면 순서 변경 · 순서 저장 시 통합기준정보 표시순서에 즉시 반영</div><div data-team-chart="true">${Cc}</div>${leg([['평균 이상 (평균 '+avg.toFixed(2)+(per?'건/인)':'건)'),C.dark],['평균 미만',C.amber]])}</div></div></div>
<div class="ibRow r3"><div class="ibPanel"><div class="ibHead">단일 팀에 대한 연간/월별 누적 활동 실적${per?'(인당 개선건수)':''}<button type="button" class="ibEv" data-evk="d">근거 데이터</button><em>[ ${esc(S.team)} ] 연간 ${fx(dCum,per)}${unit}</em></div><div class="ibBody">${Dd}${activityDiagnostics}</div></div>
<div class="ibPanel"><div class="ibHead">선택팀 고도화 유지·이탈 Drill-down<button type="button" class="ibEv" data-evk="e">근거 데이터</button><em>[ ${esc(S.team)} ] 유지 ${curKeep}건 · 이탈 ${knownLoss?lossTot+'건':'자료 없음'}</em></div><div class="ibBody">${E}${leg([['기존 유지','#a8c7c4'],['신규 확정',C.dark]])}${lossChart}</div></div></div>
<p class="ibFoot">※ 5S 활동 = GMES 원천 5S 활동 등록(상단 지표와 같은 데이터). 완료·확정 = 상태가 완료 또는 확정. 고도화 확정 = 5S 고도화 공식 판정이 '확정'인 건(확정일 기준, 상단 '신규 확보'와 같은 기준). 인당 = 건수 ÷ 팀 인원(팀 인원 마스터). 참여율 = 당월 5S 활동을 1건 이상 등록한 사람 수 ÷ 총원(${hcAll}명). 팀 막대를 누르면 아래 두 그래프가 그 팀으로 바뀝니다.</p>`;
  const cols=['등록일','팀','5S 유형','등록자','문제점','개선내용','상태','고도화 판정','확정일','수평전개'],mapR=r=>[String(r.date||r.regDate||'').slice(0,10),r.team,r.type,r.owner,r.problem,r.improvement,r.status,r.judgeState||'',r.judgeState==='확정'?cdOf(r):'',r.horizontalRollout===true?'대상':''],sortT=a=>[...a].sort((x,y)=>String(x.team).localeCompare(String(y.team),'ko')||String(y.date).localeCompare(String(x.date)));
  const EV={a:['5S 유형별 근거 데이터 ('+(S.month?+S.month+'월':'연간누적')+')',rowsM],b:['월별 근거 데이터 ('+S.year+'년)',rowsY],c:['팀별 근거 데이터 ('+(S.month?+S.month+'월':'연간누적')+')',sortT(rowsM)],d:['선택 팀 근거 데이터 · '+S.team,tr],e:['선택 팀 고도화 확정·수평전개 근거 · '+S.team,teamConf.filter(r=>cy(r)===S.year)]};
  const downloadEvidence=(cols,rows,file)=>{const csv='\ufeff'+[cols,...rows].map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=file+'.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)};
  box.querySelectorAll('[data-evk]').forEach(b=>{const dl=document.createElement('button');dl.type='button';dl.className='ibEv';dl.textContent='엑셀 추출';dl.style.marginLeft='6px';dl.addEventListener('click',()=>{const key=b.dataset.evk;const [title,rows]=EV[key];downloadEvidence(cols,rows.map(mapR),'5S_자율개선_차트_'+key);});b.insertAdjacentElement('afterend',dl)});
  box.querySelectorAll('[data-evk]').forEach(b=>b.onclick=()=>{const [t,a]=EV[b.dataset.evk];openRows({title:t,cols,rows:a.map(mapR),file:'5S_자율개선_근거_'+b.dataset.evk})});
  box.querySelectorAll('[data-f]').forEach(el=>el.onchange=()=>{S[el.dataset.f]=el.value;if(el.dataset.f==='group')S.team='';render(box)});
  box.querySelector('[data-ib="go"]').onclick=()=>render(box);box.querySelector('[data-ib="print"]').onclick=()=>window.print();
  box.querySelector('[data-ib="csv"]').onclick=()=>exportCsv({D,S,tv,A:{TYPES,allT},ML,dVals,per,hcAll});
  box.querySelector('[data-ib="saveTeamOrder"]').onclick=()=>{
    try{
      const base=teamOrder||window.HD20ProductionTeamMaster?.teamNames?.()||[];
      const all=[...new Set([...base,...D.teams])];
      const visible=tv.map(x=>x.t),visibleSet=new Set(visible);
      let pos=0;
      const merged=all.map(t=>visibleSet.has(t)?visible[pos++]:t);
      for(const t of visible)if(!merged.includes(t))merged.push(t);
      localStorage.setItem('gmes5s_team_display_order',JSON.stringify(merged));
      localStorage.removeItem(TEAM_CHART_ORDER_KEY);
      teamChartLocalOrder=null;teamChartOrderDirty=false;
      window.dispatchEvent(new CustomEvent('gmes5s-team-display-order-changed',{detail:{order:merged,source:'hd20-improve-board'}}));
      render(box);
    }catch(e){window.alert('기준정보 정렬순서를 저장하지 못했습니다.')}
  };
  box.querySelector('[data-ib="resetTeamOrder"]').onclick=()=>{teamChartLocalOrder=null;teamChartOrderDirty=false;render(box)};
  const teamSvg=box.querySelector('[data-team-chart] svg');
  if(teamSvg){
    let drag=null;
    teamSvg.style.touchAction='pan-y';
    teamSvg.style.userSelect='none';
    const move=e=>{
      if(!drag||e.pointerId!==drag.pointerId)return;
      if(Math.abs(e.clientX-drag.startX)>6||Math.abs(e.clientY-drag.startY)>6)drag.moved=true;
      if(drag.moved){e.preventDefault();teamSvg.style.cursor='grabbing'}
    };
    const finish=(e,cancel=false)=>{
      if(!drag||e.pointerId!==drag.pointerId)return;
      const d=drag;drag=null;teamSvg.style.cursor='';
      window.removeEventListener('pointermove',move);
      window.removeEventListener('pointerup',up);
      window.removeEventListener('pointercancel',abort);
      if(cancel)return;
      if(!d.moved){S.team=d.team;render(box);return}
      const rect=teamSvg.getBoundingClientRect();
      const view=teamSvg.viewBox.baseVal;
      const x=(e.clientX-rect.left)/rect.width*view.width;
      const fraction=Math.max(0,Math.min(.999999,(x-46)/(view.width-46-10)));
      const dest=Math.min(tv.length-1,Math.floor(fraction*tv.length));
      const names=tv.map(x=>x.t),from=names.indexOf(d.team);
      if(from<0||from===dest)return;
      names.splice(from,1);names.splice(dest,0,d.team);
      teamChartLocalOrder=names;
      teamChartOrderDirty=true;
      render(box);
    };
    const up=e=>finish(e,false),abort=e=>finish(e,true);
    teamSvg.querySelectorAll('.hit').forEach(el=>{
      el.style.cursor='grab';
      el.style.userSelect='none';
      el.addEventListener('dragstart',e=>e.preventDefault());
      el.addEventListener('pointerdown',e=>{
        if(e.button!==0||drag)return;
        e.preventDefault();
        drag={team:el.dataset.cat,startX:e.clientX,startY:e.clientY,pointerId:e.pointerId,moved:false};
        window.addEventListener('pointermove',move,{passive:false});
        window.addEventListener('pointerup',up);
        window.addEventListener('pointercancel',abort);
      });
    });
  }
}
function exportCsv({S,tv,A,ML,dVals,per}){
  const out=[['5S 자율개선 종합 대시보드',`${S.year}년`,S.month?S.month+'월':'연간누적','집계',per?'인당(건/인)':'총 건수']],q=x=>'"'+String(x??'').replace(/"/g,'""')+'"';
  out.push([],['[5S 유형별]','등록(=완료 사례 수)']);A.TYPES.forEach((t,i)=>out.push([t,A.allT[i]]));
  out.push([],['[팀별]','건수','팀 인원',per?'인당 개선건수':'건수']);tv.forEach(x=>out.push([x.t,x.c,x.h,per?(x.h?(x.c/x.h).toFixed(3):''):x.c]));
  out.push([],[`[단일 팀: ${S.team}] 월별`,'값']);ML.forEach((m,i)=>out.push([m,dVals[i].toFixed(3)]));
  const text='\ufeff'+out.map(r=>r.map(q).join(',')).join('\r\n'),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'}));a.download=`5S_자율개선종합_${S.year}${S.month||''}.csv`;document.body.appendChild(a);a.click();a.remove()}
function safeRender(box){if(!box)return;try{render(box)}catch(error){console.error('HD20 improve board render error',error);box.textContent='5S 자율개선 종합 대시보드 표시 오류: '+String(error?.message||error)}}
function ensure(){
  if(!window.HD20KPIData?.snapshot)return false;
  css();let box=document.getElementById(ID);
  if(!box){const anchor=document.getElementById('hd20DashboardPriority')||document.querySelector('.cards');if(!anchor)return false;box=document.createElement('section');box.id=ID;anchor.insertAdjacentElement('afterend',box);
    const T=window.HD20_DASHBOARD_TABS;if(T?.apply)T.apply(T.active?.()||'summary',{scroll:false})}
  safeRender(box);return true}
let tries=0;(function boot(){if(!ensure()&&tries++<80)setTimeout(boot,150)})();
document.addEventListener('click',e=>{if(e.target.closest?.('#hd20DashboardSectionTabs button[data-dashboard-section="improve"]'))setTimeout(()=>{const b=document.getElementById(ID);if(b)safeRender(b)},80)},true);
['hd20-kpi-source-updated','hd20-gmes-5s-imported','hd20-gmes-5s-judged'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(()=>{const b=document.getElementById(ID);if(b)safeRender(b)},80)));
const rerender=()=>{const b=document.getElementById('hd20ImproveBoard');if(b)safeRender(b)};window.addEventListener('beforeprint',()=>{window.__hd20BoardPrint=true;rerender()});window.addEventListener('afterprint',()=>{window.__hd20BoardPrint=false;rerender()});
let rz;window.addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{const b=document.getElementById(ID);if(b)safeRender(b)},250)});

/* 통합기준정보의 분기별 인당 목표(해당 분기까지의 누적 인당 목표로 해석). 미설정이면 v=null */
function quarterTarget(){try{const t=JSON.parse(localStorage.getItem('gmes5s_quarter_perperson_targets')||'{}'),q='Q'+(Math.floor(new Date().getMonth()/3)+1),v=Number(t[q]);return{q,v:Number.isFinite(v)&&v>0?v:null}}catch{return{q:'Q'+(Math.floor(new Date().getMonth()/3)+1),v:null}}}
/* 차트가 쓴 원천 행을 그대로 보여주는 공용 '근거 데이터' 창(검색·CSV) */
function openRows({title,cols,rows,file}){
  const ID2='hd20BoardEvidence';let m=document.getElementById(ID2);
  if(!document.getElementById(ID2+'Style')){const st=document.createElement('style');st.id=ID2+'Style';st.textContent=`#${ID2}{position:fixed;inset:0;z-index:99991;display:none;align-items:center;justify-content:center;background:rgba(12,35,51,.5);padding:16px}#${ID2}.on{display:flex}
#${ID2} .evBox{width:min(1180px,96vw);max-height:88vh;background:#fff;border-radius:14px;display:flex;flex-direction:column;box-shadow:0 24px 70px rgba(6,31,49,.35);overflow:hidden}
#${ID2} .evHead{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:12px 16px;border-bottom:1px solid #e3eaf0}#${ID2} .evHead b{font-size:16px;color:#14304c}#${ID2} .evHead span{font-size:12.5px;color:#5c6b7a;font-weight:800}
#${ID2} .evHead input{margin-left:auto;height:32px;border:1px solid #cfd9e2;border-radius:7px;padding:0 10px;width:220px;font-size:13px}#${ID2} .evHead button{height:32px;border-radius:7px;border:1px solid #cfd9e2;background:#fff;color:#14304c;font-weight:850;padding:0 12px;cursor:pointer}#${ID2} .evHead button.pr{background:#14304c;color:#fff;border-color:#14304c}
#${ID2} .evBody{overflow:auto}#${ID2} table{width:100%;border-collapse:collapse;font-size:13px}#${ID2} th{position:sticky;top:0;background:#f1f5f8;color:#3b5163;text-align:left;padding:8px 10px;font-size:12px;white-space:nowrap}#${ID2} td{padding:7px 10px;border-top:1px solid #edf1f4;color:#22303f;vertical-align:top}
#${ID2} .evMore{display:block;width:100%;border:0;border-top:1px solid #e3eaf0;background:#fafbfc;color:#14304c;font-weight:850;padding:10px;cursor:pointer}
@media print{#${ID2}{display:none!important}}`;document.head.appendChild(st)}
  if(!m){m=document.createElement('div');m.id=ID2;m.innerHTML='<div class="evBox"><div class="evHead"><b></b><span></span><input type="search" placeholder="검색 (전체 컬럼)"><button type="button" class="pr" data-ev="csv">CSV 내려받기</button><button type="button" data-ev="close">닫기</button></div><div class="evBody"></div></div>';document.body.appendChild(m);
    m.addEventListener('click',e=>{if(e.target===m||e.target.closest('[data-ev="close"]'))m.classList.remove('on')});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&m.classList.contains('on'))m.classList.remove('on')})}
  const body=m.querySelector('.evBody'),head=m.querySelector('.evHead'),inp=head.querySelector('input');let limit=200,q='';
  const txt=r=>r.map(v=>String(v??'')).join(' ').toLowerCase(),view=()=>q?rows.filter(r=>txt(r).includes(q)):rows;
  const draw=()=>{const v=view(),shown=v.slice(0,limit);head.querySelector('b').textContent=title;head.querySelector('span').textContent=`${v.length.toLocaleString()}건${q?` (전체 ${rows.length.toLocaleString()}건 중 검색)`:''}`;
    body.innerHTML=`<table><thead><tr>${cols.map(c=>`<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${shown.map(r=>`<tr>${r.map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')||`<tr><td colspan="${cols.length}" style="color:#7a8a97;padding:18px">조건에 해당하는 데이터가 없습니다.</td></tr>`}</tbody></table>${v.length>limit?`<button type="button" class="evMore">나머지 ${(v.length-limit).toLocaleString()}건 더 보기 ▾</button>`:''}`;
    body.querySelector('.evMore')?.addEventListener('click',()=>{limit+=300;draw()})};
  inp.value='';inp.oninput=()=>{q=inp.value.trim().toLowerCase();limit=200;draw()};
  head.querySelector('[data-ev="csv"]').onclick=()=>{const v=view(),t='\ufeff'+[cols,...v].map(r=>r.map(x=>'"'+String(x??'').replace(/"/g,'""')+'"').join(',')).join('\r\n'),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'text/csv;charset=utf-8'}));a.download=(file||title)+'.csv';document.body.appendChild(a);a.click();a.remove()};
  draw();m.classList.add('on')}
window.HD20_BOARD_KIT={chart,leg,esc,fx,C,axis,quarterTarget,openRows};
window.HD20_IMPROVE_BOARD={ensure,render:()=>{const b=document.getElementById(ID);if(b)safeRender(b);else ensure()},state:S};
})();
