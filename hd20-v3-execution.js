(()=>{'use strict';
const ID='hd20V3Execution',metrics=[
 ['onTime','기한 내 조치 완료율','기한 도래 과제 중 기한 내 완료 비율','%'],
 ['pendingEffect','효과검증 미완료','완료 후 효과검증 대기 과제','건'],
 ['sixRetention','6개월 유지율','6개월 유지 검증 대상 중 유지 적합 비율','%'],
 ['recurrenceCount','부적합 재발 건수','재발 판정된 개선조치','건']
];
function style(){if(document.getElementById(ID+'Style'))return;const s=document.createElement('style');s.id=ID+'Style';s.textContent=`#${ID}{color:#183b55;margin:14px 0 26px;font-family:inherit}#${ID} *{box-sizing:border-box}#${ID} .v3exHead{padding:18px 22px;background:#183b55;color:#fff;border-radius:12px}#${ID} .v3exHead h2{font-size:19px;margin:0 0 5px}#${ID} .v3exHead p{margin:0;font-size:12px;color:#d5e4eb}#${ID} .v3exKpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:11px;margin:14px 0}#${ID} .v3exCard,#${ID} .v3exPanel{background:#fff;border:1px solid #dce5ee;border-radius:11px;padding:16px;min-width:0}#${ID} .v3exCard small{display:block;color:#627687;font-size:12px}#${ID} .v3exCard strong{display:block;font-size:25px;margin:8px 0}#${ID} .v3exCard p{font-size:11px;color:#657987;margin:0}#${ID} .v3exFlow{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}#${ID} .v3exStep{background:#eef5f6;border-left:3px solid #287f80;padding:12px;border-radius:6px;font-size:13px}#${ID} .v3exStep small{display:block;color:#627687;margin-top:5px}#${ID} .v3exGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:12px 0}#${ID} h3{font-size:14px;margin:0 0 12px}#${ID} .v3exEmpty{min-height:115px;display:flex;align-items:center;justify-content:center;background:#f7fafb;border:1px dashed #cbd9e2;border-radius:7px;text-align:center;color:#657987;font-size:12px;padding:15px}#${ID} .v3exNote{font-size:12px;color:#657987;line-height:1.65;margin:8px 0 0}#${ID} table{width:100%;border-collapse:collapse;font-size:12px}#${ID} th,#${ID} td{padding:10px;text-align:left;border-bottom:1px solid #e8eef2}#${ID} th{background:#f3f7f9}@media(max-width:760px){#${ID} .v3exKpis{grid-template-columns:repeat(2,minmax(0,1fr))}#${ID} .v3exGrid{grid-template-columns:1fr}#${ID} .v3exFlow{grid-template-columns:repeat(2,minmax(0,1fr))}}`;s.textContent+=' #'+ID+' .v3exFormulaGuide{margin:12px 0 15px;border:1px solid #dce5ee;border-radius:10px;background:#f7fafc;color:#38556c}#'+ID+' .v3exFormulaGuide summary{padding:11px 14px;cursor:pointer;font-size:12px;font-weight:800}#'+ID+' .v3exFormulaGuide table{width:100%;font-size:12px}#'+ID+' .v3exFormulaGuide td{padding:9px 12px}#'+ID+' .v3exFormulaGuide p{padding:0 12px 12px;margin:0;font-size:11px;line-height:1.6}';s.textContent+=' #'+ID+' .v3exBars{display:grid;gap:10px}#'+ID+' .v3exBar{display:grid;grid-template-columns:minmax(75px,1fr) minmax(80px,3fr) 40px;gap:9px;align-items:center;font-size:12px}#'+ID+' .v3exBar>div{height:11px;background:#eaf0f3;border-radius:6px;overflow:hidden}#'+ID+' .v3exBar i{display:block;height:100%;background:#287f80;border-radius:6px}#'+ID+' .v3exBar strong{text-align:right;font-variant-numeric:tabular-nums}';s.textContent+=' #'+ID+' .v3exTwoCharts{margin:12px 0;align-items:start}.v3exTwoCharts>.v3exPanel{min-width:0}.v3exFullTrend{margin:0}.v3exGrid{align-items:start}.v3exAnnualWrap{width:100%;max-width:100%;overflow-x:hidden}.v3exAnnualSvg{display:block;width:100%;min-width:0;height:208px}#'+ID+' .v3exPanel{overflow:hidden}';s.textContent+='  #'+ID+' .v3exStages{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:12px 0}#'+ID+' .v3exStage{padding:15px;background:#f3f8f8;border:1px solid #dce9e8;border-radius:10px}#'+ID+' .v3exStage b{font-size:13px}#'+ID+' .v3exStage p{font-size:11px;color:#627687;margin:7px 0 0}#'+ID+' .v3exTrend{width:100%;height:180px;display:block}#'+ID+' .v3exLegend{font-size:11px;color:#627687;margin-top:6px}#'+ID+' .v3exFocus{margin-top:14px}#'+ID+' .v3exPanel .v3exEmpty{min-height:160px}@media(max-width:760px){#'+ID+' .v3exStages{grid-template-columns:repeat(2,minmax(0,1fr))}}';document.head.appendChild(s)}
function ensure(){style();let el=document.getElementById(ID);if(el)return el;const anchor=document.getElementById('hd20DashboardPriority')||document.querySelector('.cards');if(!anchor)return null;el=document.createElement('section');el.id=ID;el.setAttribute('aria-label','실행·유지 V3 종합관제');el.innerHTML='<header class="v3exHead"><h2>실행·유지 성과관제</h2><p>실행 이행 → 효과 입증 → 유지 검증 → 재발 방지</p></header><div class="v3exKpis"></div><div class="v3exGrid v3exTwoCharts"><section class="v3exPanel v3exFullTrend"></section><section class="v3exPanel v3exRetentionTrend"></section></div><section class="v3exPanel v3exFocus"><h3>관리 개입 필요 과제</h3><table><thead><tr><th>우선순위</th><th>담당 팀</th><th>개입 사유</th><th>조치기한</th><th>검증 상태</th></tr></thead><tbody><tr><td colspan="5">원천 조치 데이터 연결 후 표시</td></tr></tbody></table></section>';anchor.insertAdjacentElement('beforebegin',el);return el}
function rows(key){try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function str(v){return String(v??'').trim()}
function isDone(x){const status=str(x.status||x.activityStatus||x.actionStatus||x.judgeState||x.auditState);return !/미완료|미확정|미종료|미종결|완료대기|완료예정|진행|대기|보완|반려|취소/i.test(status)&&/완료|확정|종료|종결|close|done/i.test(status)}
function date(x){return str(x.targetDate||x.due||x.dueDate||x.deadline).slice(0,10)}
function recurrence(x){return x.recurrence===true||/^(재발|발생|true|1|Y|yes)$/i.test(str(x.recurrenceState??x.recurrent??x['재발여부']))}
function verified(x){return x.effectVerified===true||/^(유효|적합|검증완료|효과확인|효과확인완료|완료|true|1|Y)$/i.test(str(x.effectState??x.effectResult))}
function team(x){return str(x.team||x.teamName||x.ownerTeam||x.department||x['팀명'])||'팀 미지정'}
/* 정규식에 이스케이프가 이중으로 들어가(파일 상 '\\d', 즉 "리터럴 백슬래시 + d") 있어 어떤 날짜
   문자열과도 영원히 매치되지 않고 있었음 — month()가 항상 null을 반환해 'B. 월별 Audit·조치 기록
   추이' 패널이 데이터가 있어도 항상 "해당 분석에 필요한 유효한 원천데이터가 없습니다"로 고정 표시
   되던 진짜 원인. 정상적인 단일 이스케이프(\d)로 수정. */
function month(x){const d=str(x.auditDate||x.completedAt||x.completionDate||x.createdAt||x.date||x.registeredAt);const m=d.match(/^(20\d{2})[-/.](0?[1-9]|1[0-2])/);return m?m[1]+'-'+m[2].padStart(2,'0'):null}
function normalizedDate(v){const m=str(v).match(/^(20\d{2})[-/.](0?[1-9]|1[0-2])[-/.](3[01]|[12]\d|0?[1-9])(?=$|[^0-9])/);return m?m[1]+'-'+m[2].padStart(2,'0')+'-'+m[3].padStart(2,'0'):''}
function completedDate(x){return normalizedDate(x.doneDate||x.completedDate||x.finishDate||x.completedAt||x.completionDate)}
function registeredDate(x){return normalizedDate(x.createdAt||x.regDate||x.registeredAt||x.date)}
function annualChart(actions,year){
 const now=new Date(),currentYear=now.getFullYear(),currentMonth=now.getMonth()+1;
 const months=Array.from({length:12},(_,i)=>i+1);
 const completed=months.map(m=>actions.filter(x=>isDone(x)&&completedDate(x).startsWith(year+'-'+String(m).padStart(2,'0'))).length);
 const validEffects=actions.filter(x=>verified(x)&&(x.effectVerifiedAt||x.effectDate||x.verifiedAt));
 const effect=months.map(m=>validEffects.filter(x=>month({completedAt:x.effectVerifiedAt||x.effectDate||x.verifiedAt})===year+'-'+String(m).padStart(2,'0')).length);
 const trend=completed.map((_,i)=>{const from=Math.max(0,i-2);return completed.slice(from,i+1).reduce((a,b)=>a+b,0)/(i-from+1)});const max=Math.max(1,...completed,...trend)*1.18;
 const w=960,h=236,left=34,right=12,top=16,bottom=36,plotW=w-left-right,plotH=h-top-bottom;
 const x=i=>left+(i+.5)*plotW/12,y=v=>top+plotH*(1-v/max);
 const grid=[0,.25,.5,.75,1].map(f=>'<line x1="'+left+'" x2="'+(w-right)+'" y1="'+(top+plotH*f)+'" y2="'+(top+plotH*f)+'" stroke="#e8eef2"/>').join('');
 const isFuture=i=>year>currentYear||(year===currentYear&&i+1>currentMonth);
 const path=values=>{let d='',active=false;values.forEach((v,i)=>{if(isFuture(i)){active=false;return}d+=(active?' L':' M')+x(i).toFixed(1)+' '+y(v).toFixed(1);active=true});return d};
 const dots=(values,color)=>values.map((v,i)=>isFuture(i)?'':'<circle cx="'+x(i)+'" cy="'+y(v)+'" r="3" fill="'+color+'"/>').join('');
 const labels=months.map((m,i)=>'<text x="'+x(i)+'" y="'+(h-10)+'" font-size="12" text-anchor="middle" fill="'+(isFuture(i)?'#9aaab4':'#546b7b')+'">'+m+'월</text>').join('');
 const future=months.map((m,i)=>isFuture(i)?'<rect x="'+(x(i)-plotW/24)+'" y="'+top+'" width="'+(plotW/12)+'" height="'+plotH+'" fill="#f5f7f9" opacity=".7"/>':'').join('');
 const bars=completed.map((v,i)=>isFuture(i)?'':'<rect x="'+(x(i)-plotW/48)+'" y="'+y(v)+'" width="'+plotW/24+'" height="'+(top+plotH-y(v))+'" rx="2" fill="#6ca5a2"/><text x="'+x(i)+'" y="'+(y(v)+14)+'" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">'+v+'</text>').join('');const trendLine='<path d="'+path(trend)+'" fill="none" stroke="#d69d31" stroke-width="2.5" vector-effect="non-scaling-stroke"/>'+dots(trend,'#d69d31');
 return '<h3>'+year+'년 월별 실행 완료 건수 및 3개월 이동평균</h3><div class="v3exAnnualWrap"><svg class="v3exAnnualSvg" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none" role="img" aria-label="'+year+'년 1월부터 12월까지 실행 완료 막대와 이동평균 추세선">'+grid+future+bars+trendLine+labels+'</svg></div><p class="v3exNote"><span style="color:#6ca5a2">■</span> 실행 완료 건수(완료일 기준) · <span style="color:#d69d31">●</span> 최근 최대 3개월 이동평균(완료 건수) · 미래 월 미집계 · 당월 진행 중</p>';
}
function monthlyComboChart(actions,year){
 const now=new Date(), months=Array.from({length:12},(_,i)=>i+1),w=960,h=236,l=42,r=15,t=18,b=38,pw=w-l-r,ph=h-t-b;
 const created=registeredDate;
 const finished=completedDate;
 const registration=months.map(m=>actions.filter(x=>created(x).startsWith(year+'-'+String(m).padStart(2,'0'))).length);
 const completion=months.map(m=>actions.filter(x=>isDone(x)&&finished(x).startsWith(year+'-'+String(m).padStart(2,'0'))).length);
 const backlog=months.map(m=>{const monthEnd=year+'-'+String(m).padStart(2,'0')+'-'+String(new Date(year,m,0).getDate()).padStart(2,'0');const end=(year===now.getFullYear()&&m===now.getMonth()+1)?[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-'):monthEnd;return actions.filter(x=>{const c=created(x),f=finished(x);return c&&c<=end&&(f?f>end:!isDone(x))}).length});
 const future=i=>year>now.getFullYear()||(year===now.getFullYear()&&i+1>now.getMonth()+1);
 const max=Math.max(1,...registration,...completion,...backlog.filter((_,i)=>!future(i)))*1.2;
 const x=i=>l+(i+.5)*pw/12,y=v=>t+ph*(1-v/max);
 const grids=[0,.25,.5,.75,1].map(f=>'<line x1="'+l+'" x2="'+(w-r)+'" y1="'+(t+ph*f)+'" y2="'+(t+ph*f)+'" stroke="#e8eef2"/>').join('');
 const bars=months.map((m,i)=>{if(future(i))return '<rect x="'+(x(i)-pw/24)+'" y="'+t+'" width="'+pw/12+'" height="'+ph+'" fill="#f5f7f9"/>';const bw=pw/12*.25;return '<rect x="'+(x(i)-bw-2)+'" y="'+y(registration[i])+'" width="'+bw+'" height="'+(t+ph-y(registration[i]))+'" fill="#a6c5ce" rx="2"/><text x="'+(x(i)-bw/2-2)+'" y="'+Math.max(12,y(registration[i])-5)+'" text-anchor="middle" font-size="11" font-weight="600" fill="#567b89">'+registration[i]+'</text><rect x="'+(x(i)+2)+'" y="'+y(completion[i])+'" width="'+bw+'" height="'+(t+ph-y(completion[i]))+'" fill="#247a73" rx="2"/><text x="'+(x(i)+2+bw/2)+'" y="'+Math.max(12,y(completion[i])-5)+'" text-anchor="middle" font-size="11" font-weight="600" fill="#247a73">'+completion[i]+'</text>'}).join('');
 let path='',active=false;months.forEach((m,i)=>{if(future(i)){active=false;return}path+=(active?' L':' M')+x(i)+' '+y(backlog[i]);active=true});
 const dots=months.map((m,i)=>future(i)?'':'<circle cx="'+x(i)+'" cy="'+y(backlog[i])+'" r="3.5" fill="#d69d31"/>').join('');
 const labels=months.map((m,i)=>'<text x="'+x(i)+'" y="'+(h-10)+'" font-size="12" text-anchor="middle" fill="'+(future(i)?'#9aaab4':'#546b7b')+'">'+m+'월</text>').join('');
 return '<h3>'+year+'년 월별 개선조치 등록·완료 및 미완료 잔량</h3><div class="v3exAnnualWrap"><svg class="v3exAnnualSvg" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none" role="img" aria-label="월별 등록 완료 건수와 월말 미완료 잔량">'+grids+bars+'<path d="'+path+'" fill="none" stroke="#d69d31" stroke-width="2.5" vector-effect="non-scaling-stroke"/>'+dots+labels+'</svg></div><p class="v3exNote"><span style="color:#729eae">■</span> 등록(등록일) · <span style="color:#247a73">■</span> 완료(완료일) · <span style="color:#d69d31">●</span> 미완료 잔량(과거 월말·당월 현재 기준) · 완료일 누락된 완료과제는 잔량에서 제외 · 미래 월 미집계</p>';
}
function recurrenceChart(actions,year){
 const now=new Date(),months=Array.from({length:12},(_,i)=>i+1),w=720,h=208,l=28,r=12,t=14,b=32;
 const recorded=actions.filter(x=>recurrence(x)&&(x.recurrenceDate||x.recurredAt||x.recurrenceAt));
 const counts=months.map(m=>recorded.filter(x=>month({date:x.recurrenceDate||x.recurredAt||x.recurrenceAt})===year+'-'+String(m).padStart(2,'0')).length);
 const max=Math.max(1,...counts),pw=w-l-r,ph=h-t-b;
 const future=i=>year>now.getFullYear()||(year===now.getFullYear()&&i+1>now.getMonth()+1);
 const x=i=>l+(i+.5)*pw/12,y=v=>t+ph*(1-v/max);
 const labels=months.map((m,i)=>'<text x="'+x(i)+'" y="'+(h-8)+'" font-size="11" text-anchor="middle" fill="'+(future(i)?'#9aaab4':'#546b7b')+'">'+m+'월</text>').join('');
 const grid=[0,.25,.5,.75,1].map(f=>'<line x1="'+l+'" x2="'+(w-r)+'" y1="'+(t+ph*f)+'" y2="'+(t+ph*f)+'" stroke="#e8eef2"/>').join('');
 let path='';counts.forEach((v,i)=>{if(!future(i))path+=(i?' L':' M')+x(i)+' '+y(v)});
 const content=recorded.length?'<path d="'+path+'" stroke="#e1af37" fill="none" stroke-width="2.5" vector-effect="non-scaling-stroke"/>'+counts.map((v,i)=>future(i)?'':'<circle cx="'+x(i)+'" cy="'+y(v)+'" r="3" fill="#e1af37"/>').join(''):'';
 if(!recorded.length){const yes=actions.filter(recurrence).length;const no=actions.filter(x=>!recurrence(x)&&/^(미발생|없음|N|no|false|0)$/i.test(str(x.recurrenceState??x.recurrent??x['재발여부']))).length;const unknown=actions.length-yes-no;const total=Math.max(1,yes+no);return '<h3>재발 판정 현황</h3><div class="v3exStages" style="grid-template-columns:repeat(3,minmax(0,1fr));margin:12px 0"><div class="v3exStage"><b>재발 '+yes+'건</b><p>재발 판정</p></div><div class="v3exStage"><b>미발생 '+no+'건</b><p>재발 없음</p></div><div class="v3exStage"><b>미판정 '+unknown+'건</b><p>확인 필요</p></div></div><div style="height:16px;background:#eaf0f3;border-radius:8px;overflow:hidden;display:flex"><span style="width:'+(yes/total*100)+'%;background:#e1af37"></span><span style="width:'+(no/total*100)+'%;background:#21756e"></span></div><p class="v3exNote">재발 발생일이 없어 월별 추세 대신 현재 판정 현황을 표시합니다. 위 건수는 원천 개선조치의 재발 여부 필드 기준입니다.</p>';}return '<h3>'+year+'년 월별 재발 추이</h3><div class="v3exAnnualWrap"><svg class="v3exAnnualSvg" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none" role="img" aria-label="'+year+'년 1월부터 12월까지 재발 추이">'+grid+content+labels+'</svg></div><p class="v3exNote">재발 발생일 기준 · 미래 월 미집계</p>'
}
function barPanel(title,items,caption){return '<h3>'+title+'</h3>'+(items.length?'<div class="v3exBars">'+items.map(([name,value,max])=>'<div class="v3exBar"><span>'+escapeHtml(name)+'</span><div><i style="width:'+Math.max(0,Math.min(100,max?100*value/max:0))+'%"></i></div><strong>'+value+'</strong></div>').join('')+'</div>':'<div class="v3exEmpty">해당 분석에 필요한 유효한 원천데이터가 없습니다.</div>')+'<p class="v3exNote">'+caption+'</p>'}
function escapeHtml(v){return str(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]))}
function syncExecutionVisibility(){const el=document.getElementById(ID);if(!el)return;const active=document.body.classList.contains('hd20DashboardExecutionActive')&&window.HD20_NAV?.active?.()==='dashboard';el.hidden=!active;el.setAttribute('aria-hidden',active?'false':'true');el.style.setProperty('display',active?'':'none',active?'':'important')}
function suppressLegacy(){const active=document.body.classList.contains('hd20DashboardExecutionActive');const legacy=document.querySelector('.mainGrid');if(legacy)legacy.style.setProperty('display',active?'none':'','important');const bridge=document.getElementById('hd20OperationalBridge');if(bridge)bridge.style.setProperty('display',active?'none':'','important')}
function sourceActions(){const canonical=window.HD20KPIData;if(typeof canonical?.actionCases==='function'){try{const primary=canonical.actionCases();if(Array.isArray(primary))return primary}catch(e){console.warn('[HD20 실행유지] 공식 데이터 조회 실패',e)}}return rows('hd20ActionCasesV2')}
function render(){const el=ensure();if(!el)return;syncExecutionVisibility();suppressLegacy();const op=window.HD20KPIData?.operational?.(window.HD20KPIData?.snapshot?.())||{};const audits=rows('hd20AuditRandomDrawsV1'),actions=sourceActions(),today=(window.HD20KPIData?.seoulDateKey?.()||new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()));const canonical=window.HD20KPIData;const done=actions.filter(isDone),late=actions.filter(x=>date(x)&&date(x)<today&&!isDone(x)),recur=actions.filter(x=>canonical?.recurrenceState?canonical.recurrenceState(x):recurrence(x)),effect=actions.filter(x=>canonical?.effectVerified?canonical.effectVerified(x):verified(x));
const completionDate=completedDate;
const dueActions=actions.filter(x=>date(x)&&date(x)<=today);
const onTimeCount=dueActions.filter(x=>isDone(x)&&completionDate(x)&&completionDate(x)<=date(x)).length;
const judgedDone=done.filter(x=>typeof x.effectVerified==='boolean'||str(x.effectState??x.effectResult));
const pendingEffect=done.filter(x=>!(canonical?.effectVerified?canonical.effectVerified(x):verified(x))).length;
const onTime=op.actionOnTime??null;
const cards=[
 ['onTime','기한 내 조치 완료율',onTime===null?'—':onTime+'%',onTime===null?'기한 도래 대상 없음':'중앙 KPI B기준 · 완료일·조치·증빙 확인'],
 ['pendingEffect','효과검증 미완료',pendingEffect+'건','완료 '+done.length+'건 중 검증 미완료'],
 ['sixRetention','6개월 유지율',op.sixRetention==null?'—':op.sixRetention+'%','공식 유지 검증 기준'],
 ['recurrenceCount','부적합 재발 건수',recur.length+'건','재발 여부 판정 기록 기준']
];
el.querySelector('.v3exKpis').innerHTML=cards.map(([key,title,value,note])=>'<article class="v3exCard" data-execution-kpi="'+key+'"><small>'+title+'</small><strong>'+value+'</strong><p>'+note+'</p></article>').join('');
let guide=el.querySelector('.v3exFormulaGuide');if(!guide){guide=document.createElement('details');guide.className='v3exFormulaGuide';el.querySelector('.v3exKpis').insertAdjacentElement('afterend',guide)}
guide=el.querySelector('.v3exFormulaGuide');if(guide){guide.innerHTML='<summary>계산식 · 집계기준 안내 (핵심 KPI 4개)</summary><div style="overflow-x:auto"><table><tbody>'+metrics.map(m=>'<tr><td><b>'+escapeHtml(m[1])+'</b></td><td>'+escapeHtml(m[2])+'</td></tr>').join('')+'</tbody></table></div><p>기한 내 조치 완료율은 기한 도래 과제 전체를 분모로 하며, 완료 상태·기한 내 완료일·조치내용·개선 후 증빙이 모두 확인된 건만 분자로 인정합니다. 효과검증 미완료는 완료 건 중 명시적인 효과 입증 기록이 없는 건입니다. 6개월 유지율은 기존 공식 KPI 기준을 따릅니다. 재발 건수는 개선조치 원천 재발 판정 기록을 집계합니다.</p>';}
const selectedYear=Number(document.querySelector('[data-year]')?.value)||Number(window.HD20KPIData?.snapshot?.()?.year)||new Date().getFullYear();
el.querySelector('.v3exFullTrend').innerHTML=annualChart(actions,selectedYear);
el.querySelector('.v3exRetentionTrend').innerHTML=monthlyComboChart(actions,selectedYear);
const tbody=el.querySelector('.v3exFocus tbody');
const priority=actions.filter(x=>late.includes(x)||recurrence(x)||(isDone(x)&&!verified(x))).sort((a,b)=>Number(recurrence(b))-Number(recurrence(a))||Number(late.includes(b))-Number(late.includes(a))||str(date(a)).localeCompare(str(date(b)))).slice(0,5);
tbody.innerHTML=priority.length?priority.map((x,i)=>'<tr><td>'+(i+1)+'</td><td>'+escapeHtml(team(x))+'</td><td>'+(recurrence(x)?'재발':late.includes(x)?'기한 초과':'효과검증 미기록')+'</td><td>'+escapeHtml(date(x)||'기한 미지정')+'</td><td>'+escapeHtml(verified(x)?'효과 확인':'확인 필요')+'</td></tr>').join(''):'<tr><td colspan="5">근거가 확인된 개입 필요 과제가 없습니다.</td></tr>';
 window.dispatchEvent(new Event('hd20-execution-kpi-rendered'));
}
/* development-demo-mode.js가 이 스크립트보다 먼저 로드·boot()되어 데이터 시드 직후 동기적으로
   'hd20-kpi-source-updated' 등을 dispatchEvent하는데, 이 스크립트의 리스너는 그보다 늦게(스크립트
   로드 순서상 나중에) 등록되어 그 이벤트를 영원히 놓치고 있었음 — 그 결과 'B. 월별 Audit·조치 기록
   추이' 패널이 최초의 빈 데이터 상태로 render()된 뒤 다시는 갱신되지 않아 "해당 분석에 필요한 유효한
   원천데이터가 없습니다"로 굳어 있던 것(표시 로직의 타이밍 결함이지 실제 데이터 부재가 아니었음).
   리스너를 먼저 등록하고, 최초 render()는 한 틱 지연시켜 다른 스크립트의 동기 초기화가 끝난 뒤
   실행되도록 보강. */
function boot(){['hd20-dashboard-ready','hd20-kpi-source-updated','hd20-audit-updated','hd20-action-updated'].forEach(ev=>window.addEventListener(ev,render));document.addEventListener('click',ev=>{if(!ev.target.closest?.('#hd20DashboardSectionTabs [data-dashboard-section="execution"]'))return;requestAnimationFrame(()=>{syncExecutionVisibility();render()})});const watch=new MutationObserver(()=>{syncExecutionVisibility();suppressLegacy()});watch.observe(document.body,{attributes:true,attributeFilter:['class']});setTimeout(render,0);setTimeout(render,900);setTimeout(render,2500)}
window.HD20V3Execution={render};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();