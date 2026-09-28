/* 5S 자율개선 종합 대시보드 (기존 MES 'VTB 자율개선 종합 대시보드' 구성을 5S에 맞게 재구성)
   조회 조건 바 → 유형별/월별 현황 → 팀별 인당 개선건수(+당월 참여율) → 선택 팀의 월별 인당 실적.
   읽기 전용: HD20KPIData.snapshot().rows(활동 원천), HD20_HEADCOUNT_MASTER(팀 인원), HD20ProductionTeamMaster(팀·그룹). */
(()=>{'use strict';
const ID='hd20ImproveBoard',TYPES=['정리','정돈','청소','시각화','위험구역관리','5S 고도화'],DONE=['완료','확정'];
const C={dark:'#1f6f6b',amber:'#e0b03c',light:'#a8c7c4',grey:'#8fa3b3',ink:'#22303f',soft:'#5c6b7a',grid:'#e6ecf0'};
const S={year:null,month:'',metric:'per',group:'',type:'',roll:'',team:''};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fx=(v,per)=>per?(v>=10?v.toFixed(1):v.toFixed(2)):String(Math.round(v));
function css(){if(document.getElementById(ID+'Style'))return;const s=document.createElement('style');s.id=ID+'Style';s.textContent=`
#${ID}{background:#fff;border:1px solid #dfe6ec;border-radius:14px;padding:16px 18px;box-shadow:0 1px 3px rgba(20,48,76,.06)}
#${ID} .ibTitle{display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap}#${ID} h2{margin:0;font-size:21px;color:#14304c}
#${ID} .ibNote{margin:4px 0 12px;font-size:13px;font-weight:800;color:#22303f}
#${ID} .ibBar{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;padding:10px 12px;background:#f4f7f9;border:1px solid #e3eaf0;border-radius:10px}
#${ID} .ibBar label{display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:850;color:#3b5163}
#${ID} .ibBar select,#${ID} .ibBar input{height:32px;border:1px solid #cfd9e2;border-radius:7px;background:#fff;padding:0 8px;font-size:13px;color:#22303f}
#${ID} .ibBar input{width:70px}#${ID} .ibBar .sp{flex:1}
#${ID} .ibBar button{height:32px;border-radius:7px;border:1px solid #14304c;background:#14304c;color:#fff;font-weight:850;font-size:13px;padding:0 14px;cursor:pointer}
#${ID} .ibBar button.alt{background:#2c5f8a;border-color:#2c5f8a}
#${ID} .ibRow{display:grid;gap:12px;margin-top:12px}#${ID} .r1{grid-template-columns:minmax(0,4fr) minmax(0,6fr)}#${ID} .r3{grid-template-columns:repeat(2,minmax(0,1fr))}
#${ID} .ibPanel{border:1px solid #e3eaf0;border-radius:10px;background:#fff;overflow:hidden}
#${ID} .ibHead{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 12px;background:#f1f5f8;border-bottom:1px solid #e3eaf0;font-size:13.5px;font-weight:900;color:#22303f}
#${ID} .ibHead em{font-style:normal;font-size:12.5px;color:#14304c}#${ID} .ibHead em.pt{color:#1f6f6b}
#${ID} .ibBody{padding:8px 8px 4px;overflow-x:auto}
#${ID} .ibLeg{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;font-size:11.5px;color:#5c6b7a;font-weight:800;padding:2px 0 6px}#${ID} .ibLeg i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:5px;vertical-align:-1px}
#${ID} svg text{font-family:inherit}#${ID} .hit{cursor:pointer}#${ID} .hit:hover{opacity:.85}
#${ID} .ibFoot{margin:10px 2px 0;font-size:12px;color:#7a8a97}
@media(max-width:1100px){#${ID} .r1,#${ID} .r3{grid-template-columns:1fr}}
.app.awFocused #${ID}{display:none!important}
@media print{#${ID} .ibBar{display:none}}`;document.head.appendChild(s)}
function data(){
  const K=window.HD20KPIData,snap=K?.snapshot?.()||{},rows=snap.rows||[],M=window.HD20ProductionTeamMaster,teams=M?.teamNames?.()||[],HC=window.HD20_HEADCOUNT_MASTER||[];
  const hcOf=t=>{const v=Number(HC.find(h=>h.team===t)?.headcount);return Number.isFinite(v)&&v>0?v:0};
  const groupOf=t=>M?.groupOf?.(t)||'';
  const years=[...new Set(rows.map(r=>String(r.date||r.regDate||'').slice(0,4)).filter(Boolean))].sort();
  return{rows,teams,hcOf,groupOf,groups:M?.groupNames?.()||[],years,snapYear:String(snap.year||years[years.length-1]||new Date().getFullYear())};
}
function filt(D,{ignoreMonth=false}={}){
  return D.rows.filter(r=>{const d=String(r.date||r.regDate||'');if(d.slice(0,4)!==S.year)return false;if(!ignoreMonth&&S.month&&d.slice(5,7)!==S.month)return false;
    if(S.type&&r.type!==S.type)return false;if(S.group&&D.groupOf(r.team)!==S.group)return false;
    if(S.roll==='Y'&&r.horizontalRollout!==true)return false;if(S.roll==='N'&&r.horizontalRollout===true)return false;return true})}
const monthOf=r=>+String(r.date||r.regDate||'').slice(5,7);
function axis(v){const raw=v/4,p=Math.pow(10,Math.floor(Math.log10(raw))),f=raw/p,n=f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10,step=n*p;return{step,max:Math.ceil(v/step-1e-9)*step}}
const tk=v=>String(Number(v.toFixed(3)));
function chart({w,h=240,cats,series,stack=false,per=false,rotate=false,sel=null,colorOf=null,minSlot=36}){
  const W0=Math.max(w,cats.length*minSlot+56),slot0=(W0-56)/Math.max(1,cats.length);rotate=rotate||(slot0<58&&cats.some(c=>String(c).length>3));
  const m={l:46,r:10,t:20,b:rotate?84:30},W=W0,iw=W-m.l-m.r,ih=h-m.t-m.b;
  const tot=cats.map((_,i)=>stack?series.reduce((a,s)=>a+(s.vals[i]||0),0):Math.max(...series.map(s=>s.vals[i]||0)));
  const ax=axis(Math.max(0.0001,...tot)),max=ax.max,yv=v=>m.t+ih-(v/max)*ih,slot=iw/Math.max(1,cats.length);
  let g='';for(let i=0;i<=Math.round(max/ax.step);i++){const v=ax.step*i,y=yv(v);g+=`<line x1="${m.l}" x2="${W-m.r}" y1="${y}" y2="${y}" stroke="${C.grid}"/><text x="${m.l-6}" y="${y+4}" text-anchor="end" font-size="11" fill="${C.soft}">${tk(v)}</text>`}
  let b='';cats.forEach((c,i)=>{const cx=m.l+slot*i+slot/2,n=series.length,bw=stack?Math.min(40,slot*.6):Math.min(24,slot*.72/n);
    let acc=0;series.forEach((s,k)=>{const v=s.vals[i]||0;if(v<=0)return;const hh=Math.max(2,(v/max)*ih);const x=stack?cx-bw/2:cx-(bw*n)/2+bw*k;const y=stack?yv(acc+v):yv(v);const col=colorOf?colorOf(c,i,k):s.color;
      b+=`<rect ${(sel!==null&&c===sel)?'stroke="#14304c" stroke-width="2"':''} x="${x}" y="${y}" width="${bw}" height="${hh}" rx="2" fill="${col}" class="hit" data-cat="${esc(c)}"><title>${esc(c)} · ${esc(s.name)}: ${fx(v,per)}</title></rect>`;
      if(!stack)b+=`<text x="${x+bw/2}" y="${y-4}" text-anchor="middle" font-size="10.5" font-weight="800" fill="${C.ink}">${fx(v,per)}</text>`;acc+=v});
    if(stack&&tot[i]>0)b+=`<text x="${cx}" y="${yv(tot[i])-4}" text-anchor="middle" font-size="10.5" font-weight="800" fill="${C.ink}">${fx(tot[i],per)}</text>`;
    const ly=m.t+ih+15;b+=rotate?`<text transform="translate(${cx+4},${ly}) rotate(-45)" text-anchor="end" font-size="11" fill="${(sel!==null&&c===sel)?'#14304c':C.soft}" font-weight="${(sel!==null&&c===sel)?900:600}">${esc(c)}</text>`:`<text x="${cx}" y="${ly}" text-anchor="middle" font-size="11.5" fill="${C.soft}">${esc(c)}</text>`});
  return `<svg width="${W}" height="${h}" viewBox="0 0 ${W} ${h}" role="img">${g}<line x1="${m.l}" x2="${W-m.r}" y1="${m.t+ih}" y2="${m.t+ih}" stroke="#b7c6d1"/>${b}</svg>`}
const leg=a=>`<div class="ibLeg">${a.map(x=>`<span><i style="background:${x[1]}"></i>${esc(x[0])}</span>`).join('')}</div>`;
function render(box){
  const D=data();if(!D.rows.length&&!window.HD20KPIData)return;
  if(!S.year)S.year=D.snapYear;const per=S.metric==='per',unit=per?'건/인':'건',mm=S.month?+S.month:(+S.year===new Date().getFullYear()?new Date().getMonth()+1:12);
  const teamsAll=D.teams.filter(t=>!S.group||D.groupOf(t)===S.group),hcAll=teamsAll.reduce((a,t)=>a+D.hcOf(t),0)||1,inTeams=r=>teamsAll.includes(r.team);
  const rowsM=filt(D).filter(inTeams),rowsY=filt(D,{ignoreMonth:true}).filter(inTeams),W=Math.max(320,(box.clientWidth||900)-36);
  const div=v=>per?v/hcAll:v;
  // a) 유형별 등록·진행
  const doneT=TYPES.map(t=>rowsM.filter(r=>r.type===t&&DONE.includes(r.status)).length),allT=TYPES.map(t=>rowsM.filter(r=>r.type===t).length);
  const A=chart({w:Math.floor(W*.4)-8,cats:TYPES,stack:true,per,series:[{name:'완료·확정',vals:doneT.map(div),color:C.dark},{name:'진행·등록',vals:allT.map((v,i)=>div(v-doneT[i])),color:C.light}]});
  // b) 월별
  const mo=(pred)=>Array.from({length:12},(_,i)=>div(rowsY.filter(r=>monthOf(r)===i+1&&pred(r)).length)),ML=Array.from({length:12},(_,i)=>String(i+1).padStart(2,'0')+'월');
  const B=chart({w:Math.floor(W*.6)-8,cats:ML,per,series:[{name:'5S 활동 완료건수',vals:mo(r=>DONE.includes(r.status)),color:C.dark},{name:'고도화 후보 건수',vals:mo(r=>r.candidate===true),color:C.amber},{name:'수평전개 적용대상건수',vals:mo(r=>r.horizontalRollout===true),color:C.grey}]});
  // c) 팀별 인당
  const tv=teamsAll.map(t=>{const c=rowsM.filter(r=>r.team===t).length,h=D.hcOf(t);return{t,c,h,v:per?(h?c/h:0):c}}).sort((a,b)=>b.v-a.v);
  if(!S.team||!tv.some(x=>x.t===S.team))S.team=tv[0]?.t||'';
  const totC=tv.reduce((a,x)=>a+x.c,0),avg=per?totC/hcAll:totC/Math.max(1,tv.length);
  const Cc=chart({w:W-8,h:290,cats:tv.map(x=>x.t),per,rotate:true,sel:S.team,minSlot:46,series:[{name:per?'5S 활동/총원':'5S 활동 건수',vals:tv.map(x=>x.v),color:C.dark}],colorOf:(c,i)=>tv[i].v>=avg?C.dark:C.amber});
  const owners=new Set(D.rows.filter(r=>String(r.date||r.regDate||'').slice(0,4)===S.year&&monthOf(r)===mm&&teamsAll.includes(r.team)&&(!S.type||r.type===S.type)).map(r=>r.owner).filter(Boolean)).size,part=(owners/hcAll*100);
  // d,e) 선택 팀 월별
  const th=D.hcOf(S.team)||1,tr=rowsY.filter(r=>r.team===S.team),tm=(pred)=>Array.from({length:12},(_,i)=>{const c=tr.filter(r=>monthOf(r)===i+1&&pred(r)).length;return per?c/th:c});
  const dVals=tm(()=>true),dCum=dVals.reduce((a,b)=>a+b,0);
  const Dd=chart({w:Math.floor(W/2)-8,cats:ML,per,series:[{name:per?'5S 활동/총원':'5S 활동 건수',vals:dVals,color:C.dark}]});
  const E=chart({w:Math.floor(W/2)-8,cats:ML,per,series:[{name:'수평전개 적용대상',vals:tm(r=>r.horizontalRollout===true),color:C.dark},{name:'고도화 후보',vals:tm(r=>r.candidate===true),color:C.amber}]});
  const opt=(a,cur,all='ALL')=>`<option value="">${all}</option>`+a.map(x=>`<option value="${esc(x)}"${x===cur?' selected':''}>${esc(x)}</option>`).join('');
  box.innerHTML=`<div class="ibTitle"><h2>5S 자율개선 종합 대시보드</h2></div><p class="ibNote">기본 조회조건은 당해년도 연간누적 데이터입니다 (월간 데이터 조회 시, 해당 월을 선택하세요)</p>
<div class="ibBar"><label>공장 <select disabled><option>[울산] 울산캠퍼스</option></select></label><label>년 <select data-f="year">${D.years.map(y=>`<option${y===S.year?' selected':''}>${y}</option>`).join('')}</select></label>
<label>월 <select data-f="month"><option value="">전체</option>${Array.from({length:12},(_,i)=>{const v=String(i+1).padStart(2,'0');return `<option value="${v}"${v===S.month?' selected':''}>${i+1}월</option>`}).join('')}</select></label><button type="button" data-ib="go">조회</button>
<label>차트집계 <select data-f="metric"><option value="per"${per?' selected':''}>5S 활동/총원 (인당)</option><option value="total"${!per?' selected':''}>총 건수</option></select></label>
<label>부서 <select data-f="group">${opt(D.groups,S.group)}</select></label><label>5S 유형 <select data-f="type">${opt(TYPES,S.type)}</select></label>
<label>수평전개 <select data-f="roll"><option value="">ALL</option><option value="Y"${S.roll==='Y'?' selected':''}>적용대상</option><option value="N"${S.roll==='N'?' selected':''}>비대상</option></select></label>
<span class="sp"></span><button type="button" class="alt" data-ib="print">프린트</button><button type="button" class="alt" data-ib="csv">엑셀다운로드</button></div>
<div class="ibRow r1"><div class="ibPanel"><div class="ibHead">5S 유형별 등록 및 진행현황<em>${S.month?S.month.replace(/^0/,'')+'월':'연간누적'} · ${unit}</em></div><div class="ibBody">${A}${leg([['완료·확정',C.dark],['진행·등록',C.light]])}</div></div>
<div class="ibPanel"><div class="ibHead">월별 등록 및 진행현황<em>${S.year}년 · ${unit}</em></div><div class="ibBody">${B}${leg([['5S 활동 완료건수',C.dark],['고도화 후보 건수',C.amber],['수평전개 적용대상건수',C.grey]])}</div></div></div>
<div class="ibRow"><div class="ibPanel"><div class="ibHead">현장조직 팀에 대한 개선활동 현황${per?'(인당 개선건수)':'(총 건수)'}<em class="pt">당월(${String(mm).padStart(2,'0')}월) 현재 참여율 ${part.toFixed(1)}% (등록자 ${owners}명 / 총원 ${hcAll}명)</em></div><div class="ibBody">${Cc}${leg([[per?'전체 평균 이상 (평균 '+avg.toFixed(2)+'건/인)':'평균 이상',C.dark],['평균 미만',C.amber]])}</div></div></div>
<div class="ibRow r3"><div class="ibPanel"><div class="ibHead">단일 팀에 대한 연간/월별 누적 활동 실적${per?'(인당 개선건수)':''}<em>[ ${esc(S.team)} ] 연간 ${fx(dCum,per)}${unit}</em></div><div class="ibBody">${Dd}</div></div>
<div class="ibPanel"><div class="ibHead">단일 팀에 대한 수평전개/고도화 후보 ${per?'인당 개선건수':'건수'}<em>[ ${esc(S.team)} ]</em></div><div class="ibBody">${E}${leg([['수평전개 적용대상',C.dark],['고도화 후보',C.amber]])}</div></div></div>
<p class="ibFoot">※ 5S 활동 = GMES 원천 5S 활동 등록(상단 지표와 같은 데이터). 완료·확정 = 상태가 완료 또는 확정. 인당 = 건수 ÷ 팀 인원(팀 인원 마스터). 참여율 = 당월 5S 활동을 1건 이상 등록한 사람 수 ÷ 총원(${hcAll}명). 팀 막대를 누르면 아래 두 그래프가 그 팀으로 바뀝니다.</p>`;
  box.querySelectorAll('[data-f]').forEach(el=>el.onchange=()=>{S[el.dataset.f]=el.value;if(el.dataset.f==='group')S.team='';render(box)});
  box.querySelector('[data-ib="go"]').onclick=()=>render(box);box.querySelector('[data-ib="print"]').onclick=()=>window.print();
  box.querySelector('[data-ib="csv"]').onclick=()=>exportCsv({D,S,tv,A:{TYPES,allT,doneT},ML,dVals,per,hcAll});
  box.querySelectorAll('svg')[2]?.querySelectorAll('.hit').forEach(el=>el.onclick=()=>{S.team=el.dataset.cat;render(box)});
}
function exportCsv({S,tv,A,ML,dVals,per}){
  const out=[['5S 자율개선 종합 대시보드',`${S.year}년`,S.month?S.month+'월':'연간누적','집계',per?'인당(건/인)':'총 건수']],q=x=>'"'+String(x??'').replace(/"/g,'""')+'"';
  out.push([],['[5S 유형별]','등록','완료·확정']);A.TYPES.forEach((t,i)=>out.push([t,A.allT[i],A.doneT[i]]));
  out.push([],['[팀별]','건수','팀 인원',per?'인당 개선건수':'건수']);tv.forEach(x=>out.push([x.t,x.c,x.h,per?(x.h?(x.c/x.h).toFixed(3):''):x.c]));
  out.push([],[`[단일 팀: ${S.team}] 월별`,'값']);ML.forEach((m,i)=>out.push([m,dVals[i].toFixed(3)]));
  const text='\ufeff'+out.map(r=>r.map(q).join(',')).join('\r\n'),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'}));a.download=`5S_자율개선종합_${S.year}${S.month||''}.csv`;document.body.appendChild(a);a.click();a.remove()}
function ensure(){
  if(!window.HD20KPIData?.snapshot||!window.HD20ProductionTeamMaster)return false;
  css();let box=document.getElementById(ID);
  if(!box){const anchor=document.getElementById('hd20DashboardPriority')||document.querySelector('.cards');if(!anchor)return false;box=document.createElement('section');box.id=ID;anchor.insertAdjacentElement('afterend',box);
    const T=window.HD20_DASHBOARD_TABS;if(T?.apply)T.apply(T.active?.()||'summary',{scroll:false})}
  render(box);return true}
let tries=0;(function boot(){if(!ensure()&&tries++<80)setTimeout(boot,150)})();
document.addEventListener('click',e=>{if(e.target.closest?.('#hd20DashboardSectionTabs button[data-dashboard-section="improve"]'))setTimeout(()=>{const b=document.getElementById(ID);if(b)render(b)},80)},true);
['hd20-kpi-source-updated','hd20-gmes-5s-imported','hd20-gmes-5s-judged'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(()=>{const b=document.getElementById(ID);if(b&&b.offsetParent!==null)render(b)},80)));
let rz;window.addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{const b=document.getElementById(ID);if(b&&b.offsetParent!==null)render(b)},250)});
window.HD20_IMPROVE_BOARD={render:()=>{const b=document.getElementById(ID);if(b)render(b)},state:S};
})();
