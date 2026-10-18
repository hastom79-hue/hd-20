/* 5S 개선요청 종합 대시보드: 개선요청 등록 팝업의 4대 발굴 출처와 동일한 기준으로 집계한다.
   출처가 없는 과거 기록은 추정하지 않고 '출처 미분류'로 집계한다. */
(()=>{'use strict';
const ID='hd20RequestBoard';
/* 사용자 지시: "요청그룹은 리더십(공장장), 5S모듈, 생산혁신팀(HDPS파트)로 표현한다" — 표기와 순서를
   사용자 지정대로 맞춤. sourceOf()의 반환 문자열도 반드시 이 배열과 동일하게 맞춰야 SOURCES.includes()
   매칭과 sourceOf(c)===s 집계가 깨지지 않음(아래 sourceOf() 함께 수정).
   병합 메모: 다른 세션이 같은 지점을 완전히 다른 4+1종 분류(현장 패트롤 점검 등)로 변경했으나, 이
   커밋 시점 사용자의 명시적 지시("리더십(공장장)·5S모듈·생산혁신팀(HDPS파트)")를 우선 반영. */
const SOURCES=['현장 패트롤 점검','자율 5S Audit','혁신팀 자율 점검','5S 자율개선활동 피드백','출처 미분류'];
const S={year:null,month:'',source:'',team:'',status:'',roll:'',selTeam:''};
const TEAM_ORDER_KEY='hd20:master:improvement-request-team-order:v1';
let draftTeamOrder=null;
function getTeamOrder(masterTeams){
  let saved=[];try{const raw=JSON.parse(localStorage.getItem(TEAM_ORDER_KEY)||'[]');if(Array.isArray(raw))saved=raw.filter(x=>typeof x==='string')}catch(e){}
  const base=Array.isArray(draftTeamOrder)?draftTeamOrder:saved;
  return [...new Set([...base.filter(t=>masterTeams.includes(t)),...masterTeams])];
}
function orderedTeams(rows,masterTeams){const order=getTeamOrder(masterTeams);return [...rows].sort((a,b)=>order.indexOf(a.team)-order.indexOf(b.team))}
function saveTeamOrder(masterTeams){const order=getTeamOrder(masterTeams);try{localStorage.setItem(TEAM_ORDER_KEY,JSON.stringify(order))}catch(e){return false}draftTeamOrder=null;window.dispatchEvent(new CustomEvent('hd20-team-master-order-updated',{detail:{teams:order,source:'improvement-request'}}));return true}
function moveTeam(from,to,masterTeams){const order=getTeamOrder(masterTeams),a=order.indexOf(from),b=order.indexOf(to);if(a<0||b<0||a===b)return false;order.splice(b,0,order.splice(a,1)[0]);draftTeamOrder=order;return true}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
/* 사용자 지적: "04"가 "눈에도 안들어오고... 초록색과 빨간색 색상뿐이다" — CSS만으로 그린 단색 진행
   막대는 격자·눈금·깊이감이 전혀 없어 정보가 아니라 색 띠로만 보임. 04(완료율 비교)·05(지연일 분포)
   둘 다 격자선·눈금·순위가 있는 진짜 SVG 가로 막대 차트로 교체해 실제 "차트"처럼 정보 밀도를 줌. */
function hBarChart({w,rows,barH=26,gap=10,maxV=100,unit='%',showRank=false}){
  const m={l:118,r:52,t:6,b:22},iw=Math.max(160,w-m.l-m.r),n=rows.length,h=m.t+m.b+n*(barH+gap)-gap;
  const x=v=>m.l+Math.max(0,Math.min(1,v/maxV))*iw;
  const ticks=[0,.25,.5,.75,1].map(f=>Math.round(maxV*f));
  const grid=ticks.map(t=>`<line x1="${x(t)}" x2="${x(t)}" y1="${m.t}" y2="${h-m.b+4}" stroke="#eef2f5"/><text x="${x(t)}" y="${h-m.b+16}" text-anchor="middle" font-size="9.5" fill="#9aa8b3">${t}${unit==='%'?'%':''}</text>`).join('');
  const bars=rows.map((r,i)=>{
    const cy=m.t+i*(barH+gap),bw=Math.max(2,x(r.v)-m.l);
    return `<text x="${m.l-10}" y="${cy+barH*.65}" text-anchor="end" font-size="11.5" fill="#22303f">${showRank?'<tspan font-weight=\"900\" fill=\"#5c6b7a\">'+(i+1)+'위 </tspan>':''}${esc(r.label)}</text>`+
      `<rect x="${m.l}" y="${cy}" width="${iw}" height="${barH}" rx="4" fill="#f1f4f6"/>`+
      `<rect x="${m.l}" y="${cy}" width="${bw}" height="${barH}" rx="4" fill="${r.color}"/>`+
      `<text x="${m.l+bw+8}" y="${cy+barH*.65}" font-size="12" font-weight="900" fill="${r.color}">${r.v}${unit}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="가로 막대 비교 차트">${grid}${bars}</svg>`;
}
function hStackChart({w,rows,segColors,barH=24,gap=10}){
  const m={l:118,r:14,t:6,b:0},n=rows.length,maxTot=Math.max(1,...rows.map(r=>r.segs.reduce((a,b)=>a+b,0))),iw=Math.max(160,w-m.l-m.r),h=m.t+m.b+n*(barH+gap)-gap;
  const bars=rows.map((r,i)=>{
    const cy=m.t+i*(barH+gap),tot=r.segs.reduce((a,b)=>a+b,0);let acc=0;
    const segs=r.segs.map((v,si)=>{if(v<=0)return'';const sw=v/maxTot*iw,sx=m.l+acc/maxTot*iw;acc+=v;
      return `<rect x="${sx}" y="${cy}" width="${sw}" height="${barH}" fill="${segColors[si]}"><title>${esc(r.label)} · ${['1~7일','8~14일','15일+'][si]}: ${v}건</title></rect>`+(v>=2?`<text x="${sx+sw/2}" y="${cy+barH*.68}" text-anchor="middle" font-size="10.5" font-weight="800" fill="#fff">${v}</text>`:'');
    }).join('');
    return `<text x="${m.l-10}" y="${cy+barH*.68}" text-anchor="end" font-size="11.5" fill="#22303f">${esc(r.label)}</text>`+
      `<rect x="${m.l}" y="${cy}" width="${iw}" height="${barH}" rx="4" fill="#f1f4f6"/>`+segs+
      `<text x="${m.l+iw+8}" y="${cy+barH*.68}" font-size="12" font-weight="900" fill="#9b3a2e">${tot}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${w+40} ${h}" width="${w+40}" height="${h}" role="img" aria-label="팀별 기한초과 지연일 분포">${bars}</svg>`;
}
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
function confirmedSource(c){
  const raw=String(c?.requestSource||c?.sourceDetail||c?.discoverySource||'').trim();
  return SOURCES.includes(raw)&&raw!=='출처 미분류'?raw:'';
}
// Deterministic provisional attribution for dashboard testing only. Never write it to raw records.
function sourceOf(c){
  const verified=confirmedSource(c);if(verified)return verified;
  const key=String(c?.id||c?.caseId||c?.requestId||[c?.date,c?.team,c?.title,c?.description].join('|'));
  let hash=2166136261;for(let i=0;i<key.length;i++)hash=Math.imul(hash^key.charCodeAt(i),16777619)>>>0;
  return SOURCES[hash%4];
}
function css(){const prior=document.getElementById(ID+'Style');if(prior)prior.remove();const s=document.createElement('style');s.id=ID+'Style';s.textContent=`
#${ID} .rqSplit4060 .ibPanel:nth-child(2) svg{max-width:100%;height:auto;display:block}\n#${ID}{background:#fff;border:1px solid #dfe6ec;border-radius:14px;padding:16px 18px;box-shadow:0 1px 3px rgba(20,48,76,.06)}
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
#${ID} .ibRow{display:grid;gap:10px;margin-top:10px}#${ID} .r1{grid-template-columns:minmax(0,3fr) minmax(0,7fr)}#${ID} .rqManageRow{grid-template-columns:minmax(0,1fr)!important}
#${ID} .rqManageRow{grid-template-columns:minmax(0,1fr)}
#${ID} .rqManageRow>.ibPanel{width:100%;min-width:0}
#${ID} .rqManageRow .rqTeamVerticalScroll,#${ID} .rqManageRow .rqDelayVerticalScroll{overflow-x:hidden}
#${ID} .rqManageRow .rqTeamVertical,#${ID} .rqManageRow .rqDelayVertical{min-width:0;width:100%}
#${ID} .rqManageRow .rqTeamVerticalCols,#${ID} .rqManageRow .rqDelayVerticalCols{grid-template-columns:repeat(var(--rq-team-count),minmax(0,1fr));gap:4px}
#${ID} .rqManageRow .rqTeamVerticalCol>span,#${ID} .rqManageRow .rqDelayVerticalCol>span{font-size:10px;overflow-wrap:anywhere}
#${ID} .rqManageRow .rqTeamVerticalCol,#${ID} .rqManageRow .rqDelayVerticalCol{min-width:0}
#${ID} .rqManageRow .rqTeamVerticalCols{gap:8px}
#${ID} .rqManageRow .rqTeamVerticalCol{gap:0;overflow:visible}
#${ID} .rqManageRow .rqTeamVerticalTrack{height:210px;width:min(48px,72%);border-bottom:1px solid #b9cbd8;background:repeating-linear-gradient(to top,transparent 0,transparent calc(25% - 1px),#e6edf2 calc(25% - 1px),#e6edf2 25%)}
#${ID} .rqManageRow .rqTeamVerticalCol>span{display:block;align-self:center;white-space:nowrap;overflow-wrap:normal;min-height:68px;width:100%;font-size:11px;color:#2467a0;font-weight:800;text-align:center;transform:rotate(-48deg);transform-origin:top center;margin-top:10px;line-height:1.15}
#${ID} .rqManageRow .rqTeamVerticalCol>small{margin-top:4px;font-size:10px;color:#647b8b}
#${ID} .rqTeamChartLegend{display:flex;justify-content:center;gap:16px;flex-wrap:wrap;padding:12px 0 5px;font-size:11px;color:#3c5b70;font-weight:750}
#${ID} .rqTeamChartLegend i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:5px}
#${ID} .rqManageRow .rqTeamVerticalCol>span{color:#2467a0!important;transform:rotate(-48deg)!important;white-space:nowrap!important;overflow-wrap:normal!important;min-height:68px!important}
#${ID} .rqManageRow .rqTeamVerticalTrack{background:repeating-linear-gradient(to top,transparent 0,transparent calc(25% - 1px),#e6edf2 calc(25% - 1px),#e6edf2 25%)!important}




#${ID} .rqManageRow .rqTeamChart03Cols{position:relative;gap:4px;padding:12px 0 0;background:repeating-linear-gradient(to top,transparent 0,transparent 51px,#e7edf2 52px,#e7edf2 53px,transparent 54px);background-size:100% 210px;background-repeat:no-repeat}
#${ID} .rqManageRow .rqTeamChart03Cols .rqTeamVerticalCol{display:grid;grid-template-rows:210px 86px 20px;justify-items:center;align-items:start;gap:0;min-width:0;overflow:visible}
#${ID} .rqManageRow .rqTeamChart03Cols .rqTeamVerticalTrack{height:210px;width:min(32px,55%);background:transparent!important;border-bottom:1px solid #b9cbd8}
#${ID} .rqManageRow .rqTeamChart03Cols .rqTeamVerticalCol>span{box-sizing:border-box;display:block;width:100%;height:86px;min-height:86px!important;margin:0;padding:10px 0 0 50%;font-size:10px;line-height:1.1;color:#2467a0!important;white-space:nowrap!important;overflow:visible;overflow-wrap:normal!important;text-align:left;transform:none!important;writing-mode:initial}
#${ID} .rqManageRow .rqTeamChart03Cols .rqTeamVerticalCol>span{transform:translateX(0)!important}
#${ID} .rqManageRow .rqTeamChart03Cols .rqTeamVerticalCol>span{font-style:normal}
#${ID} .rqManageRow .rqTeamChart03Cols .rqTeamVerticalCol>small{margin:0;font-size:10px}
#${ID} .rqManageRow .rqTeamChart03Cols .rqTeamBarValue{font-size:11px}
#${ID} .rqManageRow .rqTeamChart03Cols .rqTeamVerticalCol>span{position:relative;padding:0!important;transform:none!important}
#${ID} .rqManageRow .rqTeamChart03Cols .rqTeamVerticalCol>span em{position:absolute;top:13px;left:50%;font-style:normal;white-space:nowrap;transform:rotate(-47deg);transform-origin:left top;font-weight:800;color:#2467a0}

#${ID} .rqManageRow .rqTeamVertical{position:relative;padding-left:43px;box-sizing:border-box}
#${ID} .rqManageRow .rqTeamAxisTicks{position:absolute;left:0;top:12px;height:172px;width:39px;font-size:10px;color:#71879a}
#${ID} .rqManageRow .rqTeamAxisTicks span{position:absolute;right:5px;transform:translateY(50%);white-space:nowrap}
#${ID} .rqManageRow .rqTeamChart03Cols{padding-top:12px;background-size:100% 172px;background-image:repeating-linear-gradient(to top,transparent 0,transparent calc(25% - 1px),#e7edf2 calc(25% - 1px),#e7edf2 25%)}
#${ID} .rqManageRow .rqTeamChart03Cols .rqTeamVerticalCol{grid-template-rows:172px 72px 18px}
#${ID} .rqManageRow .rqTeamChart03Cols .rqTeamVerticalTrack{height:172px}
#${ID} .rqManageRow .rqTeamChart03Cols .rqTeamVerticalCol>span{height:72px;min-height:72px!important}
#${ID} .rqManageRow .rqTeamChart03Cols .rqTeamVerticalCol>span em{top:9px}
#${ID} .rqManageRow .rqTeamChart03Cols .rqTeamBarValue{font-size:11px}
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
#${ID} .rqOrderTools{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:8px 0 12px;font-size:12px;color:#476177}
#${ID} .rqOrderTools button{border:1px solid #c8d5df;background:#f5f8fa;border-radius:6px;padding:5px 8px;font-size:12px;font-weight:700;color:#264761}
#${ID} [data-team-axis]{cursor:grab}
#${ID} .rqAxisMove{display:flex;gap:4px}
#${ID} .rqAxisMove button{font-size:10px;border:1px solid #d4dfe7;border-radius:5px;background:#fff;padding:3px 6px;color:#38536b}
#${ID} .rqTeamVerticalScroll{max-width:100%;overflow-x:auto;overflow-y:hidden;padding:8px 2px 12px}
#${ID} .rqTeamVertical{min-width:max(100%,calc(var(--rq-team-count)*100px))}
#${ID} .rqTeamVerticalCols{display:grid;grid-template-columns:repeat(var(--rq-team-count),minmax(90px,1fr));gap:10px;align-items:end}
#${ID} .rqTeamVerticalCol{display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;min-width:0}
#${ID} .rqTeamBarValue{position:absolute;left:50%;transform:translateX(-50%);font-size:13px;font-weight:800;color:#29435a;white-space:nowrap;line-height:1.2;z-index:1}
#${ID} .rqTeamVerticalTrack{position:relative;height:220px;width:58px;display:flex;align-items:flex-end;border-bottom:1px solid #bfcbd4;background:linear-gradient(to top,#f4f7f9,#fff)}
#${ID} .rqTeamVerticalTrack>span{display:block;width:100%;border-radius:4px 4px 0 0}
#${ID} .rqTeamVerticalTrack.rqAxisCut{position:relative}
#${ID} .rqTeamVerticalTrack.rqAxisCut:after{content:'//';position:absolute;left:-15px;bottom:-8px;color:#526a7a;font-size:15px;font-weight:900;letter-spacing:-3px;background:#fff;padding:0 3px;transform:rotate(-20deg)}
#${ID} .rqTeamVerticalCol>span{font-size:11px;font-weight:750;line-height:1.3;overflow-wrap:anywhere;min-height:30px;color:#344e63}
#${ID} .rqTeamVerticalCol>small{font-size:10px;color:#647b8b}
#${ID} .rqDelayVerticalScroll{max-width:100%;overflow-x:auto;overflow-y:hidden;padding:8px 2px 12px;overscroll-behavior-x:contain}
#${ID} .rqDelayVertical{min-width:max(100%,calc(var(--rq-team-count)*116px))}
#${ID} .rqDelayVerticalLegend{display:flex;flex-wrap:wrap;gap:8px 16px;font-size:12px;font-weight:800;margin:4px 0 14px;padding:4px 2px;position:relative;max-width:100%}
#${ID} .rqDelayVerticalCols{display:grid;grid-template-columns:repeat(var(--rq-team-count),minmax(106px,1fr));gap:10px;align-items:end}
#${ID} .rqDelayVerticalCol{min-width:0;display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center}
#${ID} .rqDelayVerticalGroup{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;width:100%;align-items:end}
#${ID} .rqDelayVerticalBarCell{min-width:0;display:flex;flex-direction:column;align-items:stretch;gap:4px}
#${ID} .rqDelayVerticalValue{position:absolute;left:50%;transform:translateX(-50%);font-size:11px;font-weight:800;color:#29435a;line-height:1.2;white-space:nowrap}
#${ID} .rqDelayVerticalBarTrack{position:relative;height:210px;display:flex;align-items:flex-end;border-bottom:1px solid #bfcbd4;background:linear-gradient(to top,#f4f7f9,#fff)}
#${ID} .rqDelayVerticalSingleBar{display:block;width:100%;min-height:0;border-radius:3px 3px 0 0}
#${ID} .rqDelayVerticalTeam{font-size:11px;line-height:1.3;font-weight:700;overflow-wrap:anywhere;min-height:28px;color:#344e63}
#${ID} .rqDelayVerticalCol>small{font-size:10px;color:#667d8c}
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
#${ID} .rqDetailOpenBtn{display:block;width:100%;padding:14px;border:1px solid #cfd9e2;border-radius:10px;background:#fff;color:#14304c;font-size:13.5px;font-weight:850;cursor:pointer;text-align:center}
#${ID} .rqDetailOpenBtn:hover{background:#f4f8fb;border-color:#9fb4c2}
#${ID} .rqChartScroll{overflow-x:auto}#${ID} .rqChartScroll svg{display:block;margin:6px 0}
#${ID} .rqDelayLegend{display:flex;gap:14px;font-size:11px;font-weight:850;margin-bottom:4px}
#${ID} .rqMoreChart[hidden]{display:none}
#${ID} .rqSplit4060{grid-template-columns:2fr 3fr}
@media(max-width:900px){#${ID} .rqSplit4060{grid-template-columns:1fr}}
#${ID} .rqLegend{display:flex;gap:15px;flex-wrap:wrap;margin-top:12px;font-size:11px}#${ID} .rqLegend span:first-child{color:#26847f}#${ID} .rqLegend span:nth-child(2){color:#ad812f}#${ID} .rqLegend span:last-child{color:#c45143}
#${ID} .rqMoreBtn{display:block;width:100%;margin-top:8px;padding:8px;border:1px dashed #cdd9e2;border-radius:8px;background:#f8fafb;color:#49657b;font-size:12px;font-weight:850;cursor:pointer}#${ID} .rqMoreBtn:hover{background:#eef3f6;border-color:#9fb4c2}
#${ID} .rqHeat{display:block;border-radius:5px;padding:9px;min-width:42px;text-align:center}#${ID} .rqHeatHigh{background:#b9473b;color:#fff}#${ID} .rqHeatMid{background:#db8e72;color:#fff}#${ID} .rqHeatLow{background:#f4d7c6;color:#713e30}#${ID} .rqHeatZero{background:#f4f6f8;color:#758899}
#${ID} .rqDelayStack{display:flex;height:17px;overflow:hidden;border-radius:5px;margin:3px 0 16px;background:#edf1f4}#${ID} .rqDelayBand{display:block;height:100%}#${ID} .rqDelayBand0{background:#e6ba73}#${ID} .rqDelayBand1{background:#d98454}#${ID} .rqDelayBand2{background:#b9473b}

/* Screenshot regression: align both panels to content rather than stretching the
   left card to the chart's height; constrain SVG to its own column. */
#${ID} .rqSplit4060{grid-template-columns:minmax(0,2fr) minmax(0,3fr);align-items:start;gap:14px}
#${ID} .rqSplit4060>.ibPanel{min-width:0;width:100%;box-sizing:border-box}
#${ID} .rqSplit4060>.ibPanel .ibBody{height:auto;min-width:0;box-sizing:border-box;overflow-x:hidden}
#${ID} .rqSplit4060 svg{max-width:100%;height:auto}
#${ID} .rqSplit4060 .rqSourcePanel{height:auto;min-height:0;gap:12px}
#${ID} .rqSplit4060 .rqSourceFoot{margin-top:12px}
#${ID} .rqSourceV3{gap:12px}
#${ID} .rqSourceV3 .rqSourceLegend{display:flex;flex-direction:row;flex-wrap:wrap;gap:7px 15px}
#${ID} .rqSourceColumns{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;padding:16px 4px 8px;border-bottom:1px solid #e5edf3}
#${ID} .rqSourceColumn{min-width:0;text-align:center;display:flex;flex-direction:column;align-items:center;gap:4px}
#${ID} .rqSourceColPlot{width:100%;height:132px;display:flex;align-items:flex-end;justify-content:center;gap:5px;border-bottom:1px solid #ccd8e2;padding:20px 0 0;box-sizing:border-box}
#${ID} .rqSourceColBar{position:relative;width:min(24px,38%);min-height:2px;border-radius:4px 4px 0 0}

#${ID} .rqSourceV3 .rqSourceColBar.done{width:min(32px,44%)}
#${ID} .rqSourceV3 .rqSourceColBar.done b{display:flex;flex-direction:column;align-items:center;gap:1px;white-space:nowrap;line-height:1.15}
#${ID} .rqSourceV3 .rqSourceColBar.done b small{font-size:9px;font-weight:750;color:#338a79}
#${ID} .rqSourceV3 .rqSourceColPlot{padding-top:36px}
#${ID} .rqSourceV3 .rqSourceAxisLabel{font-size:10px;line-height:1.35;color:#27455d;overflow-wrap:anywhere;min-height:30px;max-width:100%}
#${ID} .rqSourceColBar.request{background:#6089a6}
#${ID} .rqSourceColBar.done{background:#279586}
#${ID} .rqSourceColBar b{position:absolute;bottom:calc(100% + 3px);left:50%;transform:translateX(-50%);font-size:10px;color:#24465e}
#${ID} .rqSourceColumn>strong{font-size:11px;color:#1c415e}
#${ID} .rqSourceColumn>small{font-size:10px;color:#6a8192}
#${ID} .rqSourceHelp{text-align:right;margin-top:8px}#${ID} .rqSourceHelpButton{border:1px solid #cbdbe6;background:#f5f9fc;color:#21445d;border-radius:7px;padding:7px 11px;cursor:pointer;font-size:12px;font-weight:700}#${ID} .rqSourceLegendDialog{width:min(460px,calc(100vw - 32px));max-height:80vh;border:1px solid #dce6ed;border-radius:12px;padding:16px;background:#fff;color:#21445d;box-shadow:0 18px 50px #102f4660}#${ID} .rqSourceLegendDialog::backdrop{background:#122b4380}#${ID} .rqSourceLegendDialogHead{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}#${ID} .rqSourceLegendDialogHead button{border:0;background:#edf3f7;border-radius:6px;padding:6px 10px;cursor:pointer} #${ID} .rqSourceFactorLegend{display:grid;gap:8px;border:1px solid #e3ebf1;border-radius:9px;padding:11px 12px}
#${ID} .rqSourceFactorLegend>b{font-size:12px;color:#21445d;margin-bottom:2px}
#${ID} .rqSourceFactorLegend>div{display:flex;align-items:flex-start;gap:9px}
#${ID} .rqFactorIndex{background:#eaf2f8;color:#2b6385;padding:3px 5px;border-radius:5px;font-size:10px;font-weight:800}
#${ID} .rqSourceFactorLegend strong{display:block;font-size:11px;color:#26465d}
#${ID} .rqSourceFactorLegend small{display:block;font-size:10px;line-height:1.5;color:#6a8192}
#${ID} .rqSourceUnclassified{margin:0;font-size:10px;color:#708393}

@media(max-width:900px){#${ID} .rqSplit4060{grid-template-columns:minmax(0,1fr)}}


#${ID} .rqSourceLegend{display:flex;flex-direction:column;align-items:flex-start;gap:6px;padding:9px 12px;border:1px solid #e4ebef;border-radius:8px;font-size:11px;color:#516c7c}
#${ID} .rqSourceLegend span{display:flex;align-items:center;gap:7px}
#${ID} .rqSourceLegend i{width:16px;height:8px;border-radius:3px;display:inline-block}
#${ID} .rqSourcePair{display:grid;gap:6px}
#${ID} .rqSourcePairBars{display:grid;gap:4px}
#${ID} .rqSourcePairBars .rqTrack{height:8px}
#${ID} .rqSourcePanel{display:flex;flex-direction:column;gap:16px;min-height:310px;height:100%;padding:4px 2px 0}
#${ID} .rqSourceTop{display:grid;grid-template-columns:1fr 1fr;gap:10px}
#${ID} .rqSourceTop>div{padding:12px 14px;background:#f2f7fa;border:1px solid #e2ebf0;border-radius:10px}
#${ID} .rqSourceTop small{display:block;font-size:11px;color:#617587;font-weight:700;margin-bottom:5px}
#${ID} .rqSourceTop strong{font-size:22px;line-height:1.2;color:#193d59;font-weight:850}
#${ID} .rqSourceTop em{font-size:12px;font-style:normal;font-weight:700;margin-left:3px;color:#617587}
#${ID} .rqSourcePanel .rqBars{gap:14px;padding:0}
#${ID} .rqSourcePanel .rqBarItem{display:block;opacity:1}
#${ID} .rqSourcePanel .rqBarItem.zero{opacity:.68}
#${ID} .rqSourceLabel{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px;font-size:12px}
#${ID} .rqSourceLabel>span{display:flex;align-items:center;gap:7px;min-width:0}
#${ID} .rqSourceIndex{font-size:10px;color:#7293a6;font-weight:850}
#${ID} .rqSourceLabel strong{white-space:nowrap;color:#254b66}
#${ID} .rqSourceLabel small{margin-left:5px;color:#6b8798;font-weight:650}
#${ID} .rqSourcePanel .rqTrack{height:10px;border-radius:6px}
#${ID} .rqSourceFoot{margin-top:auto;padding:13px 14px;background:#f7f9fb;border:1px solid #e8edf1;border-radius:10px;color:#344e62}
#${ID} .rqSourceFoot b{font-size:12px}
#${ID} .rqSourceFoot p{margin:6px 0 8px;font-size:12px;line-height:1.5}
#${ID} .rqSourceFoot span{font-size:10.5px;color:#718797}
@media(max-width:900px){#${ID} .rqSourcePanel{min-height:0}}
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
  const periodLabel=S.year+'년 '+(S.month?Number(S.month)+'월':'연간 누적');
  const allEver=D.cases.filter(c=>teamsAll.includes(c.team)),doneEver=allEver.filter(isDone),openRate=allEver.length?Math.round(doneEver.length/allEver.length*1000)/10:0;
  const doneYear=rowsY.filter(isDone),yearRate=rowsY.length?Math.round(doneYear.length/rowsY.length*1000)/10:0;
  // ① 요청출처별 — 표시 순서는 통합기준정보('요청출처 순서')에서 관리, 기본값 리더십>5S모듈>생산혁신팀 HDPS파트
  const storedSourceOrder=window.HD20_REQUEST_SOURCE_ORDER?.get?.()||[];
  const srcCats=[...SOURCES.slice(0,4).filter(x=>storedSourceOrder.includes(x)),...SOURCES.slice(0,4).filter(x=>!storedSourceOrder.includes(x)),'출처 미분류'],srcReg=srcCats.map(s=>rowsM.filter(c=>sourceOf(c)===s).length),srcOpen=srcCats.map(s=>rowsM.filter(c=>sourceOf(c)===s&&!isDone(c)).length);
  const srcOpenPct=srcCats.map((s,i)=>srcReg[i]?Math.round(srcOpen[i]/srcReg[i]*1000)/10:null);
  const A=chart({w:Math.floor((box.clientWidth-36)*.3)-8,cats:srcCats,minSlot:78,series:[{name:'요청',vals:srcReg,color:'#5c6b7a'},{name:'미완료',vals:srcOpen,color:'#e0b03c',widthScale:1.5,pct:srcOpenPct}]});
  // ② 월별
  const ML=Array.from({length:12},(_,i)=>String(i+1).padStart(2,'0')+'월');
  const regM=Array.from({length:12},(_,i)=>rowsM.filter(c=>mo(c)===i+1).length);
  const openM=Array.from({length:12},(_,i)=>rowsM.filter(c=>mo(c)===i+1&&!isDone(c)).length);
  const doneM=Array.from({length:12},(_,i)=>rowsM.filter(c=>mo(c)===i+1&&isDone(c)).length);
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
  let delayRowsSorted=delayRows.length?delayRows.map(r=>{const c=rowsM.filter(x=>x.team===r.team&&isOverdue(x,D.today));const v=[c.filter(x=>delayDays(x,D.today)<=7).length,c.filter(x=>delayDays(x,D.today)>=8&&delayDays(x,D.today)<=14).length,c.filter(x=>delayDays(x,D.today)>=15).length];return{team:r.team,v,total:r.n}}).sort((a,b)=>b.v[2]-a.v[2]||b.total-a.total):[];
  delayRowsSorted=orderedTeams(delayRowsSorted,D.teams);
  // Three grouped bars per team, one for each overdue band; never stack.
  const delaySegColors=['#508a9a','#df9b48','#a94d49'];
  const delayObservedMax=Math.max(0,...delayRowsSorted.flatMap(r=>r.v).filter(v=>Number.isFinite(v)&&v>0));
  const delayStep=delayObservedMax<=5?1:delayObservedMax<=20?2:delayObservedMax<=50?5:10;
  const delayMax=Math.max(1,Math.ceil((delayObservedMax+Math.max(1,delayObservedMax*.12))/delayStep)*delayStep);
  const delayChart=delayRowsSorted.length?'<div class="rqDelayVerticalLegend" aria-label="기한초과 지연기간별 범례"><span style="color:'+delaySegColors[0]+'">■ 1~7일</span><span style="color:'+delaySegColors[1]+'">■ 8~14일</span><span style="color:'+delaySegColors[2]+'">■ 15일 이상</span></div><div class="rqDelayVerticalScroll"><div class="rqDelayVertical" style="--rq-team-count:'+delayRowsSorted.length+'"><div class="rqDelayVerticalCols">'+delayRowsSorted.map(r=>'<div class="rqDelayVerticalCol" draggable="true" data-team-axis="'+esc(r.team)+'" title="'+esc(r.team)+' · 총 '+r.total+'건"><div class="rqDelayVerticalGroup">'+r.v.map((count,i)=>'<div class="rqDelayVerticalBarCell"><div class="rqDelayVerticalBarTrack">'+(Number.isFinite(count)&&count>0?'<strong class="rqDelayVerticalValue" style="bottom:calc('+(100*count/delayMax)+'% + 5px)">'+count+'</strong><span class="rqDelayVerticalSingleBar" style="height:'+(100*count/delayMax)+'%;background:'+delaySegColors[i]+'"></span>':'')+'</div></div>').join('')+'</div><span class="rqDelayVerticalTeam">'+esc(r.team)+'</span><small>합계 '+r.total+'건</small></div>').join('')+'</div></div></div>':null;
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
  const selPeriodRows=S.month?selYearRows.filter(c=>mo(c)===+S.month):selYearRows;
  const selRegM=Array.from({length:12},(_,i)=>selPeriodRows.filter(c=>mo(c)===i+1).length),selDoneM=Array.from({length:12},(_,i)=>selPeriodRows.filter(c=>mo(c)===i+1&&isDone(c)).length);
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
  const monthlyDone=Array.from({length:12},(_,i)=>filt(D,{ignoreYear:true,ignoreMonth:true}).filter(x=>teamsAll.includes(x.team)&&isDone(x)&&String(x.doneDate||'').slice(0,7)===S.year+'-'+String(i+1).padStart(2,'0')&&(!S.month||i+1===+S.month)).length);
  /* 사용자 지시: "두번쨰 세로막대 너비를 조금 넓혀서 값 다음 줄바꿈을 해서 %까지 같이 표기해라" —
     '완료' 막대에 그 달 완료 건 중 기한 내 완료 비율(%)을 숫자 아래 줄바꿈으로 병기. */
  const monthlyDonePct=Array.from({length:12},(_,i)=>{
    const done=filt(D,{ignoreYear:true,ignoreMonth:true}).filter(x=>teamsAll.includes(x.team)&&isDone(x)&&String(x.doneDate||'').slice(0,7)===S.year+'-'+String(i+1).padStart(2,'0')&&(!S.month||i+1===+S.month));
    const withDue=done.filter(x=>x.due);
    return withDue.length?Math.round(withDue.filter(x=>x.doneDate<=x.due).length/withDue.length*100):null;
  });
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
  const monthlyPanelWidth=box.querySelector('.rqSplit4060 .ibPanel:nth-child(2)')?.getBoundingClientRect().width||0;
  const monthlyTrend=chart({w:Math.max(380,Math.floor(monthlyPanelWidth||box.clientWidth*.6)-32),cats:ML,minSlot:30,series:[{name:'신규 요청',vals:regM,color:'#829db5'},{name:'완료',vals:monthlyDone,color:'#247c83',widthScale:1.3,pct:monthlyDonePct}]});
  const teamCompletion=chart({w:Math.max(440,box.clientWidth-85),h:260,cats:teamRows.map(r=>r.team),rotate:true,minSlot:64,series:[{name:'완료',vals:teamRows.map(r=>r.done),color:'#247c83'},{name:'미완료',vals:teamRows.map(r=>r.open+r.over),color:'#c69a65'}]});
  // Approved V2: three fixed source categories, proportional horizontal bars.
  const sourceTotal=rowsM.length,provisionalCount=rowsM.filter(c=>!confirmedSource(c)).length;
  /* 요청출처 3개 카테고리 중 보통 1개에만 건수가 몰리고 나머지는 0건인 경우가 흔한데, 0건도 진한
     글자·막대 트랙으로 똑같이 강조돼 "요청출처별 현황"이라는 제목과 달리 사실상 비교할 게 없어 보임
     (전면 재검토 연장) — 0건 항목은 흐리게 처리해 "실제로 비중 있는 출처가 뭔지" 한눈에 들어오게 함. */
  const sourceOrder=window.HD20_REQUEST_SOURCE_ORDER?.get?.()||[];
  const orderedSources=[...SOURCES.slice(0,4).filter(x=>sourceOrder.includes(x)),...SOURCES.slice(0,4).filter(x=>!sourceOrder.includes(x)),'출처 미분류'];
  const sourceStats=orderedSources.map(name=>{const items=rowsM.filter(c=>sourceOf(c)===name);return {name,count:items.length,done:items.filter(isDone).length}});
  const activeSources=sourceStats.slice(0,4).filter(x=>x.count>0).length;
  const sourceCountCheck=sourceStats.slice(0,4).reduce((n,x)=>n+x.count,0);
  if(sourceCountCheck!==sourceTotal)console.warn('HD20 request source totals mismatch',sourceCountCheck,sourceTotal);
  /* 좌측 패널: 가로막대 금지. 발굴 리소스는 범례와 정의로 설명하고,
     요청·완료 건수는 출처별 세로 2열 막대로 비교한다. */
  const sourceMax=Math.max(1,...sourceStats.map(x=>x.count));
  const sourceDefinitions=[
    ['현장 패트롤 점검','현장 순회·패트롤 과정에서 확인된 5S 미흡사항'],
    ['자율 5S Audit','생산팀 자체 5S Audit 평가에서 확인된 개선 필요사항'],
    ['혁신팀 자율 점검','생산혁신팀의 독립 현장점검에서 발굴된 개선 필요사항'],
    ['5S 자율개선활동 피드백','현장 자율개선활동 결과 검토·피드백 과정에서 도출된 후속 요청']
  ];
  const sourceBars='<div class="rqSourcePanel rqSourceV3">'
    +'<div class="rqSourceColumns" role="img" aria-label="4대 발굴 출처별 개선요청 및 완료 건수 비교, 임시 배정 포함">'+sourceStats.slice(0,4).map((x,i)=>'<div class="rqSourceColumn"><div class="rqSourceColPlot"><div class="rqSourceColBar request" style="height:'+Math.max(0,x.count/sourceMax*100)+'%"><b>'+x.count+'</b></div><div class="rqSourceColBar done" style="height:'+Math.max(0,x.done/sourceMax*100)+'%"><b>'+x.done+'<small>'+(x.count?'('+Math.round(100*x.done/x.count)+'%)':'(—)')+'</small></b></div></div><strong class="rqSourceAxisLabel">'+esc(x.name)+'</strong></div>').join('')+'</div>'
    +'<div class="rqSourceLegend"><span><i style="background:#6089a6"></i>개선요청 건수 (건)</span><span><i style="background:#279586"></i>완료 건수 (건)</span><span>완료율 = 완료 건수 ÷ 개선요청 건수 × 100</span></div>'
    +'<div class="rqSourceHelp"><button type="button" class="rqSourceHelpButton" onclick="document.getElementById(\'hd20SourceLegendDialog\').showModal()">발굴 리소스 · 범례 정의 보기 ↗</button></div><dialog id="hd20SourceLegendDialog" class="rqSourceLegendDialog" onclick="if(event.target===this)this.close()"><div class="rqSourceLegendDialogHead"><b>발굴 리소스 · 범례 정의</b><button type="button" onclick="this.closest(\'dialog\').close()" aria-label="닫기">✕</button></div><div class="rqSourceFactorLegend">'+sourceDefinitions.map((x,i)=>'<div><span class="rqFactorIndex">'+String(i+1).padStart(2,'0')+'</span><span><strong>'+esc(x[0])+'</strong><small>'+esc(x[1])+'</small></span></div>').join('')+'</div></dialog>'
    +'<p class="rqSourceUnclassified">검증용 임시 출처 배정 '+provisionalCount+'건 · 4개 출처 합계 '+sourceCountCheck+'건 · 원본 출처가 확인되지 않은 건은 ID 기반으로 4개 출처에 임시 배정했습니다. 실제 발굴 출처가 아니며 원본은 수정하지 않습니다.</p></div>';
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
  let teamRateSorted=[...teamRowsAllTeams].sort((a,b)=>(a.total?a.done/a.total:0)-(b.total?b.done/b.total:0)||b.total-a.total);
  teamRateSorted=orderedTeams(teamRateSorted,D.teams);
  const teamRateRow=(r,hidden)=>{const rate=r.total?Math.round(r.done/r.total*1000)/10:0,mine=teamHighlight&&r.team===teamHighlight;return '<tr'+(mine?' class="rqMyTeam"':hidden?' class="rqRowMore" hidden':'')+'><td>'+(mine?'<b>▶ ':'')+esc(r.team)+(mine?' <span class="rqMyTeamTag">내 팀</span></b>':'')+'</td><td><div class="rqStack" title="완료 '+r.done+'건 / 기한 내 미완료 '+r.open+'건 / 기한초과 '+r.over+'건"><span class="rqStackDone" style="width:'+(r.total?100*r.done/r.total:0)+'%"></span><span class="rqStackOpen" style="width:'+(r.total?100*r.open/r.total:0)+'%"></span><span class="rqStackLate" style="width:'+(r.total?100*r.over/r.total:0)+'%"></span></div></td><td class="'+rateCls(rate)+'">'+rate+'%</td></tr>'};
  // Section 04: all teams in vertical columns, with no hidden six-team limit.
  const rates0=teamRateSorted.filter(r=>r.total>0).map(r=>Math.round(r.done/r.total*1000)/10);
  const allSameRate=rates0.length>1&&rates0.every(v=>v===rates0[0]);
  // Dynamic but honest axis: clipped baselines are explicitly marked, and the exact rate remains visible.
  const rateMin=rates0.length?Math.min(...rates0):0,rateMax=rates0.length?Math.max(...rates0):100;
  const rateSpread=rateMax-rateMin;
  const rateAxisLow=rateSpread>0&&rateMin>=40?Math.max(0,Math.floor((rateMin-Math.max(2,rateSpread*.3))/5)*5):0;
  const rateAxisHigh=Math.min(100,Math.max(rateAxisLow+5,Math.ceil((rateMax+Math.max(2,rateSpread*.3))/5)*5));
  const rateAxisSpan=Math.max(1,rateAxisHigh-rateAxisLow);
  const teamRateNote='<p class="rqTeamNote">세로축 '+rateAxisLow+'~'+rateAxisHigh+'%'+(rateAxisLow>0?' · 0%부터 시작하지 않는 확대축(축 절단 표시)':'')+(allSameRate?' · 현재 팀별 완료율이 동일합니다.':'')+'</p>';
  const teamOrderControl='<div class="rqOrderTools"><span>기준정보 팀 순서 · 드래그 또는 ◀ ▶ 이동</span><button type="button" data-team-order-save>정렬순서 저장</button><button type="button" data-team-order-reset>기준정보 순서 복원</button></div>';
  const teamRateBars='<div class="rqTeamVerticalScroll">'+teamRateNote+'<div class="rqTeamVertical" style="--rq-team-count:'+Math.max(1,teamRateSorted.length)+'"><div class="rqTeamAxisTicks">'+[0,1,2,3,4].map(i=>'<span style="bottom:'+i*25+'%">'+(rateAxisLow+rateAxisSpan*i/4).toFixed(rateAxisSpan%4?1:0)+'%</span>').join('')+'</div><div class="rqTeamVerticalCols rqTeamChart03Cols">'+teamRateSorted.map(r=>{const pct=r.total?Math.round(r.done/r.total*1000)/10:0;const color=pct>=80?'#21756e':'#e1af37';const h=r.total?Math.max(0,Math.min(100,(pct-rateAxisLow)/rateAxisSpan*100)):0;return '<div class="rqTeamVerticalCol" draggable="true" data-team-axis="'+esc(r.team)+'" title="'+esc(r.team)+' · 완료 '+r.done+'/'+r.total+'건"><div class="rqTeamVerticalTrack'+(rateAxisLow>0?' rqAxisCut':'')+'">'+(r.total>0&&pct>0?'<strong class="rqTeamBarValue" style="bottom:calc('+h+'% + 5px)">'+pct+'%</strong>':'')+'<span style="height:'+h+'%;background:'+color+'"></span></div><span><em>'+esc(r.team)+(teamHighlight===r.team?' ★':'')+'</em></span><small>'+r.done+'/'+r.total+'건</small></div>'}).join('')+'</div></div><div class="rqTeamChartLegend"><span><i style="background:#e1af37"></i>80% 미만</span><span><i style="background:#21756e"></i>80% 이상</span></div></div>';
  const overCases=rowsM.filter(c=>teamsAll.includes(c.team)&&isOverdue(c,D.today));
  const delayBands=[overCases.filter(c=>delayDays(c,D.today)<=7).length,overCases.filter(c=>delayDays(c,D.today)>=8&&delayDays(c,D.today)<=14).length,overCases.filter(c=>delayDays(c,D.today)>=15).length];
  const kpi=(label,value,detail,risk=false)=>'<div class="rqKpi'+(risk?' risk':'')+'"><small>'+label+'</small><b>'+value+'</b><span class="rqKpiHint">'+detail+'</span></div>';
  const section=(title,meta,content,key)=>'<section class="ibPanel"><div class="ibHead"><span>'+title+'</span><em>'+meta+'</em>'+(key?'<button type="button" class="ibEv" data-evk="'+key+'">근거 데이터</button>':'')+'</div><div class="ibBody">'+content+'</div></section>';
  const filters='<div class="ibBar"><label>연도 <select data-f="year">'+D.years.map(y=>'<option'+(y===S.year?' selected':'')+'>'+y+'</option>').join('')+'</select></label><label>월 <input data-f="month" type="number" min="1" max="12" step="1" inputmode="numeric" placeholder="전체" aria-label="조회 월 직접 입력 (1~12, 공란은 연간 전체)" title="1~12 입력 · 공란은 연간 전체" value="'+(S.month?Number(S.month):'')+'" style="width:66px;min-width:66px;box-sizing:border-box;text-align:center"></label><label>요청출처 <select data-f="source">'+opt(SOURCES,S.source)+'</select></label><label>조치대응팀 <select data-f="team">'+opt(D.teams,S.team)+'</select></label><label>진행상태 <select data-f="status">'+opt(['조치대기','진행중','완료','기한초과'],S.status)+'</select></label><label>재발 <select data-f="roll"><option value="">전체</option><option value="Y"'+(S.roll==='Y'?' selected':'')+'>있음</option><option value="N"'+(S.roll==='N'?' selected':'')+'>없음</option></select></label><button type="button" data-rq="go">조회</button><button type="button" class="alt" data-rq="reset">초기화</button><span class="sp"></span><button type="button" class="alt" data-rq="print">인쇄</button><button type="button" class="alt" data-rq="csv">엑셀 다운로드</button></div>';
  box.innerHTML='<div class="ibTitle"><h2>개선요청 종합현황</h2></div><p class="ibNote">'+esc(periodLabel)+' · 요청 발생 · 조치 이행 · 지연 위험 · 팀별 대응력</p>'
    +filters
    +'<div class="rqKpis rqV2Kpis">'
    +kpi('총 개선요청',sum.total+'건',periodLabel)
    +kpi('완료',sum.done+'건','조치 완료')
    +kpi('미완료',(sum.open+sum.over)+'건','기한내 미완료 포함')
    +kpi('완료율',pctS(sum.done)+'%','완료 / 전체')
    +kpi('기한초과',sum.over+'건','미완료 중 기한경과',true)
    +kpi('평균 지연일',delayOverallAvg+'일','현재 기한초과 건 기준',true)
    +'</div>'
    /* 레이아웃 추가 조정(사용자 지시 경과):
       1) "01 월별 요청·완료 추이"를 "이게 가장 처음에 레이아웃 상 배치되어야 한다"는 지시로 KPI
          바로 다음 최상단으로 이동(기존엔 04·05보다 아래, 보조 정보 취급이었음).
       2) "03 조치 진행상태"(도넛)는 "눈에 전혀 안들어오고 목적도 모르겠다"는 지적 — 실제로 상단
          KPI(완료 96건·기한초과 64건)와 숫자가 100% 중복되고, '진행 중·미착수'는 구조적으로 항상
          0건이라 새 정보가 전혀 없었음. 섹션 자체를 제거.
       3) "06 개선요청 상세 관리"는 "가짜 데이터인게 너무 티나고... 팝업형태로 추출할 그리드로
          보여진다"는 지적 — 47·46·45...일처럼 1씩 정확히 줄어드는 가상데이터 패턴이 상시 노출된
          표로 보이면 바로 티가 남. 표를 상시 노출하지 않고, 이미 있던 '근거 데이터' 팝업 패턴
          (EV.f→openRows)과 동일하게 버튼 클릭 시에만 그리드로 열리도록 전환. */
    /* 사용자 지시: "점유비율을 60%로 우측배치하고 좌측에 40%는 요청그룹기준의 차트를 배치한다" —
       01(월별 요청·완료 추이)을 우측 60%, 요청출처(요청그룹) 기준 막대 차트를 좌측 40%에 배치.
       기존에 한 줄 요약 문장(sourceSummary)으로 축소했던 '요청출처' 정보를 다시 작은 막대 차트
       (sourceBars, 이미 정의돼 있던 걸 재사용)로 복원해 좌측에 둠. */
    +'<div class="ibRow rqSplit4060">'
    +section('01. 요청출처별 현황','요청 그룹 기준',sourceBars,'a')
    +section('02. 월별 요청·완료 추이',periodLabel+' · 완료일 기준',monthlyTrend+leg([['신규 요청','#829db5'],['완료','#247c83']]),'b')
    +'</div>'
    /* 사용자 지시: "좌우 병합배치로" — 04·05가 각자 전체 폭을 차지하며 세로로 길게 쌓여 있던 걸,
       둘을 한 줄(rqManageRow, 2열)에 나란히 배치. 그 안의 SVG 차트 폭(hBarChart·hStackChart)도
       절반 폭 기준으로 미리 줄여서 생성했어야 하므로, 아래 teamChartTop 등의 w 인자를 이 블록
       이전에 좁은 폭으로 재계산해서 넘김(바로 아래 참조). */
    +'<div class="ibRow rqManageRow rqTeamCompare" style="grid-template-columns:minmax(0,1fr)">'
    +section('03. 조치대응팀별 이행성과','완료 / 미완료 · 팀별 건수',teamOrderControl+teamRateBars+'<details class="rqTeamDetail"><summary>팀별 상세 실적 펼치기</summary><div class="rqScroll">'+teamGrid+'</div></details>','c2')
    +section('04. 기한초과 집중관리','현재 미완료 기준 · 지연기간별 분포','<div class="rqBands">'+['1~7일','8~14일','15일 이상'].map((x,i)=>'<div><small>'+x+'</small><b>'+delayBands[i]+'건</b></div>').join('')+'</div>'+'<div class="rqDelayStack">'+delayBands.map((n,i)=>'<span class="rqDelayBand rqDelayBand'+i+'" style="width:'+(overCases.length?100*n/overCases.length:0)+'%"></span>').join('')+'</div>'+(delayChart||'<p class="rqEmpty">현재 기한초과 대상이 없습니다.</p>'),'d')
    +'</div>'
    +'<div class="ibRow rqPrintSkip"><button type="button" class="rqDetailOpenBtn" data-open-detail="1">📋 개선요청 상세 목록 열기 (전체 '+actionAll.length+'건)</button></div>'
    +'<p class="rqCaveat">※ 요청출처는 리더십(공장장)·5S모듈·생산혁신팀(HDPS파트) 3종입니다. 원천에 출처 필드가 없는 경우 일부 출처는 등록자 및 Audit 연계 정보로 추정됩니다. 완료일이 없는 완료 건은 월별 완료 추이에서 제외되며 총 완료 건수에는 포함됩니다.</p>';

  const evCols=['요청번호','요청출처(검증용 포함)','출처확인상태','조치대응부서','작업장','진행현황','요청일','완료예정일','완료일'],
    evMapR=c=>[c.id,sourceOf(c),c.team,c.workplace||'—',c.status,c.date,c.due||'—',c.doneDate||'—'],
    evDelayCols=[...evCols,'지연일수'],evDelayMapR=c=>[...evMapR(c),delayDays(c,D.today)??''];
  const EV={
    a:['요청출처별 근거 데이터 ('+(S.month?+S.month+'월':'연간누적')+')',rowsM,evCols,evMapR],
    b:['월별 요청·완료 근거 데이터 ('+periodLabel+')',[...rowsM,...filt(D,{ignoreYear:true,ignoreMonth:true}).filter(c=>teamsAll.includes(c.team)&&isDone(c)&&String(c.doneDate||'').startsWith(S.year+'-')&&(!S.month||String(c.doneDate||'').slice(5,7)===S.month)&&!rowsM.includes(c))],evCols,evMapR],
    c:['조치대응부서 근거 데이터 ('+(S.month?+S.month+'월':'연간누적')+')',rowsM,evCols,evMapR],
    c2:['조치대응팀별 이행성과 근거 데이터 ('+(S.month?+S.month+'월':'연간누적')+')',rowsM,evCols,evMapR],
    d:['현재 기한초과 근거 데이터 ('+(S.month?+S.month+'월':'연간누적')+')',rowsM.filter(c=>teamsAll.includes(c.team)&&isOverdue(c,D.today)),evDelayCols,evDelayMapR],
    f:['즉시조치 대상 전체 보기 ('+(S.month?+S.month+'월':'연간누적')+')',actionAll,evCols,evMapR],
  };
  const downloadEvidence=(cols,rows,file)=>{const csv='\ufeff'+[cols,...rows].map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=file+'.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)};
  box.querySelectorAll('[data-evk]').forEach(b=>{const dl=document.createElement('button');dl.type='button';dl.className='ibEv';dl.textContent='엑셀 추출';dl.style.marginLeft='6px';dl.addEventListener('click',()=>{const key=b.dataset.evk;const [title,rows,columns,mapR]=EV[key];downloadEvidence(columns,rows.map(mapR),'5S_개선요청_차트_'+key);});b.insertAdjacentElement('afterend',dl)});
  box.querySelectorAll('[data-evk]').forEach(b=>{b.onclick=()=>{const [t,rows,cols,mapR]=EV[b.dataset.evk];openRows({title:t,cols,rows:rows.map(mapR),file:'5S_개선요청_근거_'+b.dataset.evk})}});
  box.querySelector('[data-open-detail]')?.addEventListener('click',()=>{const [t,rows,cols,mapR]=EV.f;openRows({title:t,cols,rows:rows.map(mapR),file:'5S_개선요청_상세'})});
  // Both sections use the same team-master ordering; changes are previews until explicitly saved.
  box.querySelectorAll('[data-team-step]').forEach(btn=>btn.onclick=()=>{const order=getTeamOrder(D.teams),i=order.indexOf(btn.dataset.team),j=i+Number(btn.dataset.teamStep);if(j<0||j>=order.length)return;moveTeam(btn.dataset.team,order[j],D.teams);render(box)});
  let draggedTeam='';
  box.querySelectorAll('[data-team-axis]').forEach(col=>{
    col.addEventListener('dragstart',e=>{draggedTeam=col.dataset.teamAxis;e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',draggedTeam)});
    col.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='move'});
    col.addEventListener('drop',e=>{e.preventDefault();const from=draggedTeam||e.dataTransfer.getData('text/plain');if(moveTeam(from,col.dataset.teamAxis,D.teams))render(box)});
  });
  const saveOrder=box.querySelector('[data-team-order-save]');if(saveOrder)saveOrder.onclick=()=>{if(saveTeamOrder(D.teams))render(box);else alert('이 브라우저에 정렬순서를 저장할 수 없습니다.')};
  const resetOrder=box.querySelector('[data-team-order-reset]');if(resetOrder)resetOrder.onclick=()=>{draftTeamOrder=[...D.teams];render(box)};
  box.querySelectorAll('[data-f]').forEach(el=>{el.onchange=()=>{if(el.dataset.f==='month'){const raw=el.value.trim();if(raw!==''&&(!/^\\d{1,2}$/.test(raw)||Number(raw)<1||Number(raw)>12)){el.setCustomValidity('월은 1~12 사이의 숫자로 입력해 주세요.');el.reportValidity();return;}el.setCustomValidity('');S.month=raw?String(Number(raw)).padStart(2,'0'):'';}else S[el.dataset.f]=el.value;render(box)};if(el.dataset.f==='month')el.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();el.blur()}})});
  box.querySelector('[data-rq="reset"]').onclick=()=>{Object.assign(S,{year:null,month:'',source:'',team:'',status:'',roll:'',selTeam:''});render(box)};box.querySelector('[data-rq="go"]').onclick=()=>render(box);box.querySelector('[data-rq="print"]').onclick=()=>window.print();
  box.querySelectorAll('.rqMoreBtn').forEach(btn=>btn.onclick=()=>{const prev=btn.previousElementSibling;if(!prev)return;if(prev.classList.contains('rqMoreChart')){prev.hidden=false}else{prev.querySelectorAll('tr.rqRowMore').forEach(tr=>tr.hidden=false)}btn.remove()});
  box.querySelector('[data-rq="csv"]').onclick=()=>{
    const out=[['5S 개선요청 종합 대시보드',S.year+'년',S.month?S.month+'월':'연간누적'],[],['요청번호','요청출처','조치대응부서','작업장','진행현황','요청일','완료예정일','완료일']];
    rowsM.forEach(c=>out.push([c.id,sourceOf(c),confirmedSource(c)?'원본 확인':'검증용 임시 배정',c.team,c.workplace||'',isOverdue(c,D.today)?'기한초과':c.status,c.date||'',c.due||'',c.doneDate||'']));
    const text='\ufeff'+out.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n'),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'}));a.download=`5S_개선요청종합_${S.year}${S.month||''}.csv`;document.body.appendChild(a);a.click();a.remove()};
}
function safeRender(box){if(!box)return;try{render(box)}catch(error){console.error('HD20 request board render error',error);box.textContent='5S 개선요청 종합 대시보드 표시 오류: '+String(error?.message||error)}}
function ensure(){
  css();let box=document.getElementById(ID);
  if(!box){const anchor=document.getElementById('hd20ImproveBoard')||document.getElementById('hd20DashboardPriority')||document.querySelector('.cards')||document.getElementById('hd20DashboardSectionTabs');if(!anchor)return false;box=document.createElement('section');box.id=ID;anchor.insertAdjacentElement('afterend',box);
    const T=window.HD20_DASHBOARD_TABS;if(T?.apply)T.apply(T.active?.()||'summary',{scroll:false})}
  safeRender(box);return true}
let tries=0;(function boot(){if(!ensure()&&tries++<80)setTimeout(boot,150)})();window.addEventListener('hd20-dashboard-ready',()=>ensure());window.addEventListener('hd20-kpi-source-updated',()=>{if(!document.getElementById(ID))ensure()});document.addEventListener('DOMContentLoaded',()=>ensure(),{once:true});window.addEventListener('load',()=>ensure(),{once:true});window.addEventListener('pageshow',()=>{const b=document.getElementById(ID);if(b)safeRender(b)});
document.addEventListener('click',e=>{if(e.target.closest?.('#hd20DashboardSectionTabs button[data-dashboard-section="request"]'))setTimeout(()=>{const b=document.getElementById(ID);if(b)safeRender(b)},80)},true);
['hd20-kpi-source-updated','hd20-action-updated','hd20-policy-updated'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(()=>{const b=document.getElementById(ID);if(b)safeRender(b)},80)));
let requestPanelLastWidth=0,requestPanelResizeTimer;
if(typeof ResizeObserver!=='undefined'){
 const panelObserver=new ResizeObserver(()=>{const b=document.getElementById(ID),p=b?.querySelector('.rqSplit4060 .ibPanel:nth-child(2)');if(!p||b.offsetParent===null)return;const w=Math.round(p.getBoundingClientRect().width);if(w>250&&Math.abs(w-requestPanelLastWidth)>3){requestPanelLastWidth=w;clearTimeout(requestPanelResizeTimer);requestPanelResizeTimer=setTimeout(()=>{safeRender(b);observePanel()},90)}});
 const observePanel=()=>{const p=document.querySelector('#'+ID+' .rqSplit4060 .ibPanel:nth-child(2)');if(p){panelObserver.disconnect();panelObserver.observe(p)}};
 document.addEventListener('click',e=>{if(e.target.closest?.('#hd20DashboardSectionTabs button'))setTimeout(observePanel,120)},true);
 window.addEventListener('load',observePanel);setTimeout(observePanel,650);
}
let rz;window.addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{const b=document.getElementById(ID);if(b&&b.offsetParent!==null)safeRender(b)},250)});
window.HD20_REQUEST_BOARD={ensure,render:()=>{const b=document.getElementById(ID);if(b)safeRender(b);else ensure()},state:S};
})();
