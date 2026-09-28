/* 5S 개선요청 종합 대시보드 — '5S 자율개선 종합'과 같은 뼈대(조회 조건 바 → 단계별/월별 현황 → 팀별 현황 → 선택 팀 상세)로
   개선요청(Action) 데이터를 보여줌. 읽기 전용: HD20KPIData.actionCases()/seoulDateKey(), HD20_HEADCOUNT_MASTER, HD20ProductionTeamMaster.
   차트 엔진은 hd20-improve-board.js의 HD20_BOARD_KIT 재사용. */
(()=>{'use strict';
const ID='hd20RequestBoard';
const S={year:null,month:'',metric:'total',group:'',status:'',src:'',team:''};
function num(v){return Number.isFinite(v)?v:0}
function prep(){
  const K=window.HD20KPIData,M=window.HD20ProductionTeamMaster,HC=window.HD20_HEADCOUNT_MASTER||[],today=K.seoulDateKey();
  const hcOf=t=>{const v=Number(HC.find(h=>h.team===t)?.headcount);return Number.isFinite(v)&&v>0?v:0};
  const rows=(K.actionCases()||[]).map(c=>{const reg=String(c.date||c.registeredAt||'').slice(0,10),due=String(c.targetDate||c.due||'').slice(0,10),dn=String(c.doneDate||'').slice(0,10),done=c.status==='완료';
    return{c,team:c.team,reg,due,dn,done,status:c.status||'',overdue:!done&&!!due&&due<today,late:done&&!!due&&!!dn&&dn>due,ontime:done&&!!due&&!!dn&&dn<=due,verified:c.effectVerified===true,audit:!!c.auditDrawId,
      days:(done&&reg&&dn)?Math.max(0,Math.round((new Date(dn)-new Date(reg))/86400000)):null}});
  const years=[...new Set(rows.map(r=>r.reg.slice(0,4)).filter(Boolean))].sort();
  return{rows,years,today,hcOf,groupOf:t=>M?.groupOf?.(t)||'',groups:M?.groupNames?.()||[],teams:M?.teamNames?.()||[]};
}
const mo=d=>+String(d||'').slice(5,7);
function render(box){
  const KIT=window.HD20_BOARD_KIT;if(!KIT||!window.HD20KPIData?.actionCases)return;const {chart,leg,esc,fx,C,openRows}=KIT,D=prep();
  if(!S.year)S.year=D.years.includes(String(new Date().getFullYear()))?String(new Date().getFullYear()):(D.years[D.years.length-1]||String(new Date().getFullYear()));
  const per=S.metric==='per',unit=per?'건/인':'건',mm=S.month?+S.month:(+S.year===new Date().getFullYear()?new Date().getMonth()+1:12);
  const teamsAll=D.teams.filter(t=>!S.group||D.groupOf(t)===S.group),hcAll=teamsAll.reduce((a,t)=>a+D.hcOf(t),0)||1,div=v=>per?v/hcAll:v;
  const base=D.rows.filter(r=>r.reg.slice(0,4)===S.year&&teamsAll.includes(r.team)&&(!S.status||(S.status==='진행중'?r.status==='진행중':r.status===S.status))&&(!S.src||(S.src==='audit'?r.audit:!r.audit)));
  const rowsM=S.month?base.filter(r=>mo(r.reg)===+S.month):base,rowsY=base,W=Math.max(320,(box.clientWidth||900)-36);
  const cnt=(a,f)=>a.filter(f).length;
  // ① 처리 단계별
  const cats=['등록 합계','조치대기','진행중','기한경과(미완료)','완료','효과검증 완료'],val=[rowsM.length,cnt(rowsM,r=>r.status==='조치대기'),cnt(rowsM,r=>r.status==='진행중'),cnt(rowsM,r=>r.overdue),cnt(rowsM,r=>r.done),cnt(rowsM,r=>r.done&&r.verified)];
  const colorCat=['#8fa3b3','#c4d3dc','#a8c7c4',C.amber,C.dark,'#134f4c'];
  const A=chart({w:Math.floor(W*.4)-8,cats,per,series:[{name:'건수',vals:val.map(div),color:C.dark}],colorOf:(c,i)=>colorCat[i],minSlot:52});
  // ② 월별
  const ML=Array.from({length:12},(_,i)=>String(i+1).padStart(2,'0')+'월'),by=(f)=>Array.from({length:12},(_,i)=>div(rowsY.filter(r=>f(r,i+1)).length));
  const yr=d=>String(d||'').slice(0,4)===S.year;
  const B=chart({w:Math.floor(W*.6)-8,cats:ML,per,series:[{name:'등록 건수',vals:by((r,m)=>mo(r.reg)===m),color:'#8fa3b3'},{name:'완료 건수',vals:Array.from({length:12},(_,i)=>div(D.rows.filter(r=>r.done&&yr(r.dn)&&mo(r.dn)===i+1&&teamsAll.includes(r.team)&&(!S.src||(S.src==='audit'?r.audit:!r.audit))).length)),color:C.dark},{name:'기한경과(미완료)',vals:by((r,m)=>r.overdue&&yr(r.due)&&mo(r.due)===m),color:C.amber}]});
  // ③ 팀별(누적 막대: 완료 / 진행·대기 / 기한경과)
  const tv=teamsAll.map(t=>{const a=rowsM.filter(r=>r.team===t),h=D.hcOf(t),dn=a.filter(r=>r.done).length,od=a.filter(r=>r.overdue).length,op=a.length-dn-od;return{t,n:a.length,dn,od,op,h,v:per?(h?a.length/h:0):a.length}}).sort((x,y)=>y.v-x.v);
  if(!S.team||!tv.some(x=>x.t===S.team))S.team=tv[0]?.t||'';
  const dv=x=>per?(x.h?x.dn/x.h:0):x.dn,ov=x=>per?(x.h?x.od/x.h:0):x.od,pv=x=>per?(x.h?x.op/x.h:0):x.op;
  const Cc=chart({w:W-8,h:290,cats:tv.map(x=>x.t),per,stack:true,rotate:true,sel:S.team,minSlot:46,series:[{name:'완료',vals:tv.map(dv),color:C.dark},{name:'진행·대기',vals:tv.map(pv),color:C.light},{name:'기한경과(미완료)',vals:tv.map(ov),color:C.amber}]});
  const totN=rowsM.length,totDone=cnt(rowsM,r=>r.done),totOd=cnt(rowsM,r=>r.overdue),rate=totN?totDone/totN*100:0;
  // ④ 선택 팀 월별 등록·완료, ⑤ 처리일수
  const th=D.hcOf(S.team)||1,tr=D.rows.filter(r=>r.team===S.team&&(!S.src||(S.src==='audit'?r.audit:!r.audit))),tdiv=v=>per?v/th:v;
  const Dd=chart({w:Math.floor(W/2)-8,cats:ML,per,series:[{name:'등록',vals:Array.from({length:12},(_,i)=>tdiv(tr.filter(r=>yr(r.reg)&&mo(r.reg)===i+1).length)),color:'#8fa3b3'},{name:'완료',vals:Array.from({length:12},(_,i)=>tdiv(tr.filter(r=>r.done&&yr(r.dn)&&mo(r.dn)===i+1).length)),color:C.dark}]});
  const dAvg=Array.from({length:12},(_,i)=>{const a=tr.filter(r=>r.days!==null&&yr(r.dn)&&mo(r.dn)===i+1).map(r=>r.days);return a.length?a.reduce((x,y)=>x+y,0)/a.length:0});
  const tDone=tr.filter(r=>r.done&&yr(r.dn)),tOn=tDone.filter(r=>r.ontime).length,tTimed=tDone.filter(r=>r.due).length;
  const E=chart({w:Math.floor(W/2)-8,cats:ML,per:true,fmt:v=>v.toFixed(1),series:[{name:'평균 처리일수',vals:dAvg,color:C.dark}]});
  const opt=(a,cur,all='ALL')=>`<option value="">${all}</option>`+a.map(x=>`<option value="${esc(x)}"${x===cur?' selected':''}>${esc(x)}</option>`).join('');
  box.innerHTML=`<div class="ibTitle"><h2>5S 개선요청 종합 대시보드</h2></div><p class="ibNote">기본 조회조건은 당해년도 연간누적 데이터입니다 (월간 데이터 조회 시, 해당 월을 선택하세요)</p>
<div class="ibBar"><label>공장 <select disabled><option>[울산] 울산캠퍼스</option></select></label><label>년 <select data-f="year">${D.years.map(y=>`<option${y===S.year?' selected':''}>${y}</option>`).join('')}</select></label>
<label>월 <select data-f="month"><option value="">전체</option>${Array.from({length:12},(_,i)=>{const v=String(i+1).padStart(2,'0');return `<option value="${v}"${v===S.month?' selected':''}>${i+1}월</option>`}).join('')}</select></label><button type="button" data-ib="go">조회</button>
<label>차트집계 <select data-f="metric"><option value="total"${!per?' selected':''}>개선요청 건수</option><option value="per"${per?' selected':''}>개선요청/총원 (인당)</option></select></label>
<label>부서 <select data-f="group">${opt(D.groups,S.group)}</select></label>
<label>처리상태 <select data-f="status"><option value="">ALL</option>${['조치대기','진행중','완료'].map(x=>`<option${S.status===x?' selected':''}>${x}</option>`).join('')}</select></label>
<label>등록경로 <select data-f="src"><option value="">ALL</option><option value="audit"${S.src==='audit'?' selected':''}>Audit 연계</option><option value="field"${S.src==='field'?' selected':''}>현장 직접 등록</option></select></label>
<span class="sp"></span><button type="button" class="alt" data-ib="print">프린트</button><button type="button" class="alt" data-ib="csv">엑셀다운로드</button></div>
<div class="ibRow r1"><div class="ibPanel"><div class="ibHead">처리 단계별 등록 및 진행현황<button type="button" class="ibEv" data-evk="a">근거 데이터</button><em>${S.month?+S.month+'월':'연간누적'} · ${unit}</em></div><div class="ibBody">${A}<div class="ibLeg"><span>※ 기한경과는 진행중·조치대기 건 중 기한이 지난 건(진행중·조치대기에 포함)</span></div></div></div>
<div class="ibPanel"><div class="ibHead">월별 등록 및 진행현황<button type="button" class="ibEv" data-evk="b">근거 데이터</button><em>${S.year}년 · ${unit}</em></div><div class="ibBody">${B}${leg([['등록 건수','#8fa3b3'],['완료 건수',C.dark],['기한경과(미완료)',C.amber]])}</div></div></div>
<div class="ibRow"><div class="ibPanel"><div class="ibHead">현장조직 팀에 대한 개선요청 처리 현황${per?'(인당 개선요청)':'(건수)'}<button type="button" class="ibEv" data-evk="c">근거 데이터</button><em class="pt">${S.month?+S.month+'월':'누적'} 완료율 ${rate.toFixed(1)}% (완료 ${totDone} / 등록 ${totN}) · 기한경과 ${totOd}건</em></div><div class="ibBody">${Cc}${leg([['완료',C.dark],['진행·대기',C.light],['기한경과(미완료)',C.amber]])}</div></div></div>
<div class="ibRow r3"><div class="ibPanel"><div class="ibHead">단일 팀에 대한 연간/월별 개선요청 등록·완료 실적${per?'(인당)':''}<button type="button" class="ibEv" data-evk="d">근거 데이터</button><em>[ ${esc(S.team)} ]</em></div><div class="ibBody">${Dd}${leg([['등록','#8fa3b3'],['완료',C.dark]])}</div></div>
<div class="ibPanel"><div class="ibHead">단일 팀에 대한 월별 평균 처리일수 (등록→완료)<button type="button" class="ibEv" data-evk="e">근거 데이터</button><em>[ ${esc(S.team)} ] 기한 내 완료율 ${tTimed?(tOn/tTimed*100).toFixed(1)+'%':'-'} (${tOn}/${tTimed})</em></div><div class="ibBody">${E}</div></div></div>
<p class="ibFoot">※ 개선요청 = Audit 부적합 등에서 발생해 담당 팀에 배정된 조치 건(조치 목록과 같은 데이터). 완료 = 상태 '완료', 기한경과 = 미완료이면서 조치기한이 오늘 이전. 처리일수 = 완료일 − 등록일(완료월 기준). 인당 = 건수 ÷ 팀 인원(총원 ${hcAll}명). 팀 막대를 누르면 아래 두 그래프가 그 팀으로 바뀝니다.</p>`;
  const cols=['요청번호','등록일','팀','작업장','문제점','상태','조치기한','완료일','처리일수','기한경과','효과검증','Audit 연계'],mapR=r=>[r.c.id,r.reg,r.team,r.c.workplace,r.c.problem,r.status,r.due,r.dn,r.days===null?'':r.days,r.overdue?'기한경과':'',r.verified?'완료':'',r.audit?'연계':''],sortT=a=>[...a].sort((x,y)=>String(x.team).localeCompare(String(y.team),'ko')||String(y.reg).localeCompare(String(x.reg)));
  const EV={a:['처리 단계별 근거 데이터 ('+(S.month?+S.month+'월':'연간누적')+')',rowsM],b:['월별 근거 데이터 ('+S.year+'년)',rowsY],c:['팀별 근거 데이터 ('+(S.month?+S.month+'월':'연간누적')+')',sortT(rowsM)],d:['선택 팀 근거 데이터 · '+S.team,tr.filter(r=>yr(r.reg)||yr(r.dn))],e:['선택 팀 처리일수 근거 · '+S.team,tr.filter(r=>r.days!==null&&yr(r.dn))]};
  box.querySelectorAll('[data-evk]').forEach(b=>b.onclick=()=>{const [t,a]=EV[b.dataset.evk];openRows({title:t,cols,rows:a.map(mapR),file:'5S_개선요청_근거_'+b.dataset.evk})});
  box.querySelectorAll('[data-f]').forEach(el=>el.onchange=()=>{S[el.dataset.f]=el.value;if(el.dataset.f==='group')S.team='';render(box)});
  box.querySelector('[data-ib="go"]').onclick=()=>render(box);box.querySelector('[data-ib="print"]').onclick=()=>window.print();
  box.querySelector('[data-ib="csv"]').onclick=()=>{const out=[['5S 개선요청 종합 대시보드',S.year+'년',S.month?S.month+'월':'연간누적'],[],['[처리 단계별]','건수']];cats.forEach((c,i)=>out.push([c,val[i]]));
    out.push([],['[팀별]','등록','완료','진행·대기','기한경과','팀 인원','인당 등록']);tv.forEach(x=>out.push([x.t,x.n,x.dn,x.op,x.od,x.h,x.h?(x.n/x.h).toFixed(3):'']));
    out.push([],[`[단일 팀: ${S.team}] 월별`,'평균 처리일수']);ML.forEach((m,i)=>out.push([m,dAvg[i].toFixed(1)]));
    const text='\ufeff'+out.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n'),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'}));a.download=`5S_개선요청종합_${S.year}${S.month||''}.csv`;document.body.appendChild(a);a.click();a.remove()};
  box.querySelectorAll('svg')[2]?.querySelectorAll('.hit').forEach(el=>el.onclick=()=>{S.team=el.dataset.cat;render(box)});
}
function ensure(){
  if(!window.HD20_BOARD_KIT||!window.HD20KPIData?.actionCases||!window.HD20ProductionTeamMaster)return false;
  let box=document.getElementById(ID);
  if(!box){const anchor=document.getElementById('hd20ImproveBoard')||document.getElementById('hd20DashboardPriority')||document.querySelector('.cards');if(!anchor)return false;
    const st=document.getElementById('hd20ImproveBoardStyle');if(st&&!document.getElementById(ID+'Style')){const s=document.createElement('style');s.id=ID+'Style';s.textContent=st.textContent.replace(/hd20ImproveBoard/g,ID);document.head.appendChild(s)}
    box=document.createElement('section');box.id=ID;anchor.insertAdjacentElement('afterend',box);const T=window.HD20_DASHBOARD_TABS;if(T?.apply)T.apply(T.active?.()||'summary',{scroll:false})}
  render(box);return true}
let tries=0;(function boot(){if(!ensure()&&tries++<80)setTimeout(boot,150)})();
document.addEventListener('click',e=>{if(e.target.closest?.('#hd20DashboardSectionTabs button[data-dashboard-section="request"]'))setTimeout(()=>{const b=document.getElementById(ID);if(b)render(b)},80)},true);
['hd20-kpi-source-updated','hd20-action-updated'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(()=>{const b=document.getElementById(ID);if(b&&b.offsetParent!==null)render(b)},80)));
let rz;window.addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{const b=document.getElementById(ID);if(b&&b.offsetParent!==null)render(b)},250)});
window.HD20_REQUEST_BOARD={render:()=>{const b=document.getElementById(ID);if(b)render(b)},state:S};
})();
