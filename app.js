const rawData=[
{no:1,type:'정리',item:'불필요한 치공구·대차 등 작업 방해요소가 없는가?',issue:'RGV 레일 주변 이물질 및 불필요 자재 적치',action:'분진 제거 및 불필요 자재 폐기',status:'완료'},
{no:2,type:'정돈',item:'최대·최소량과 품명이 명확히 표시되어 있는가?',issue:'최대·최소 수량 미표기',action:'라벨 및 위치표준 적용',status:'미결'},
{no:3,type:'청소',item:'기계 청소와 점검이 주기적으로 되고 있는가?',issue:'청소주기 및 담당 불명확',action:'주간 체크리스트 재정의',status:'완료'},
{no:4,type:'시각화',item:'표준·정상·이상 상태가 즉시 구분되는가?',issue:'공구 위치표시 불명확',action:'쉐도우보드 및 위치 라벨 적용',status:'완료'},
{no:5,type:'위험구역관리',item:'위험구역 경계·표지·출입기준이 명확한가?',issue:'위험구역 경계 표시 보완 필요',action:'경계선 및 위험표지 정비',status:'미결'},
{no:6,type:'5S고도화',item:'우수 5S 활동이 표준화·수평전개되는가?',issue:'우수사례 표준 전개 미흡',action:'표준화 및 타 팀 수평전개',status:'완료'}];

const standards=[
['1','정리','1','미사용 자재 적치로 공간 낭비요소는 없는가?','조립부','사용','SYSTEM','2026-01-19'],
['2','정돈','1','가용품 보관구역·수량·방법이 결정되어 있는가?','조립부','사용','SYSTEM','2026-01-19'],
['3','청소','1','바닥에 먼지·기름·쓰레기 없이 깨끗한가?','','사용','SYSTEM','2026-01-19'],
['4','시각화','1','표준/정상/이상 상태가 시각적으로 구분되는가?','','사용','SYSTEM','2026-01-19'],
['5','위험구역관리','1','위험구역 경계·표지·출입기준이 관리되는가?','','사용','SYSTEM','2026-01-19'],
['6','5S고도화','1','우수사례가 표준화되어 유지·수평전개되는가?','','사용','SYSTEM','2026-01-19']];

const audits=[
['1','정리','불필요한 것을 필요한 것과 구분','불필요한 치공구·대차가 없는가?','4 / 5','로케이터 적치 문제','전용 보관대 설치','완료'],
['2','정돈','필요한 것을 쉽게 꺼내고 누구나 알 수 있게','최대·최소량과 품명이 표시되어 있는가?','3 / 5','최대최소량 미표기','라벨링 표준 적용','미결'],
['3','청소','항상 깨끗하게 유지','기계 청소와 점검이 주기적인가?','4 / 5','청소주기 미흡','체크리스트 개정','완료'],
['4','시각화','표준·정상·이상을 즉시 구분','표준과 이상을 즉시 구분할 수 있는가?','5 / 5','공구 위치 표시 불량','쉐도우보드 적용','완료']];

const activityCategories=['정리','정돈','청소','시각화','위험구역관리','5S고도화'];
const activityTeamSnapshot={
'조립1팀':[5,4,3,2,1,2],
'Rear조립팀':[4,2,2,3,1,1],
'가공1팀':[2,3,4,1,2,2],
'자재운영팀':[1,2,1,2,1,3],
'생산관리팀':[2,1,2,3,2,2]};
const activityMonthly={
'조립1팀':[['04월',2,2,1,1,0,1],['05월',3,2,2,1,1,1],['06월',3,3,2,1,1,1],['07월',4,3,2,2,1,1],['08월',4,4,2,2,1,1],['09월',5,3,3,2,1,1],['10월',5,4,3,2,1,2],['11월',6,4,3,3,1,2],['12월',5,4,4,2,1,2],['01월',4,4,3,2,1,2],['02월',5,4,3,2,1,2],['03월',5,4,3,2,1,2]],
'Rear조립팀':[['04월',2,1,1,1,0,1],['05월',2,2,1,1,1,1],['06월',3,2,2,1,1,1],['07월',3,2,2,2,1,1],['08월',4,2,2,2,1,1],['09월',4,2,2,3,1,1],['10월',4,3,2,3,1,1],['11월',5,3,2,3,1,2],['12월',4,3,3,3,1,1],['01월',4,2,2,3,1,1],['02월',4,2,2,3,1,1],['03월',4,2,2,3,1,1]],
'가공1팀':[['04월',1,2,2,1,1,1],['05월',2,2,2,1,1,1],['06월',2,2,3,1,1,1],['07월',2,3,3,1,1,1],['08월',2,3,4,1,1,1],['09월',2,3,4,1,2,1],['10월',3,3,4,1,2,1],['11월',3,4,4,1,2,2],['12월',2,3,4,2,2,2],['01월',2,3,3,1,2,2],['02월',2,3,4,1,2,2],['03월',2,3,4,1,2,2]],
'자재운영팀':[['04월',1,1,1,1,0,1],['05월',1,1,1,1,1,1],['06월',1,2,1,1,1,1],['07월',1,2,1,2,1,1],['08월',1,2,1,2,1,2],['09월',1,2,1,2,1,2],['10월',2,2,1,2,1,2],['11월',2,3,1,2,1,3],['12월',1,2,2,2,1,3],['01월',1,2,1,2,1,2],['02월',1,2,1,2,1,3],['03월',1,2,1,2,1,3]],
'생산관리팀':[['04월',1,1,1,1,1,1],['05월',1,1,1,2,1,1],['06월',1,1,2,2,1,1],['07월',2,1,2,2,1,1],['08월',2,1,2,2,1,2],['09월',2,1,2,3,1,2],['10월',2,2,2,3,1,2],['11월',3,2,2,3,2,2],['12월',2,2,3,3,2,2],['01월',2,1,2,3,2,2],['02월',2,1,2,3,2,2],['03월',2,1,2,3,2,2]]};

const perCapita=[['조립1팀',3.2],['Rear조립팀',2.7],['가공1팀',2.5],['자재운영팀',2.1],['생산관리팀',1.9]];
const standardPerCapita=[['조립1팀',1.8],['Rear조립팀',1.5],['가공1팀',1.4],['자재운영팀',1.1],['생산관리팀',0.9]];

function renderBars(id,vals,cls=''){const el=document.getElementById(id);if(!el)return;el.innerHTML='';vals.forEach(v=>{const c=document.createElement('div');c.className='bar-col';c.innerHTML=`<span class="bar-val">${v.v}</span><div class="bar ${cls}" style="height:${v.h}%"></div><span class="bar-label">${v.m}</span>`;el.appendChild(c)})}
function renderActivityLegend(){const el=document.getElementById('activityLegend');if(el)el.innerHTML=activityCategories.map((c,i)=>`<span><i class="legend-dot s${i+1}"></i>${c}</span>`).join('')}
function renderActivityByType(){const el=document.getElementById('issueChart');if(!el)return;el.className='grouped-vertical-chart';el.innerHTML='';const max=Math.max(...Object.values(activityTeamSnapshot).flat());Object.entries(activityTeamSnapshot).forEach(([team,values])=>{const g=document.createElement('div');g.className='team-bar-group';g.innerHTML=`<div class="team-bars">${values.map((v,i)=>`<div class="mini-bar-wrap"><span class="mini-value">${v}</span><div class="mini-bar s${i+1}" style="height:${Math.max(10,v/max*225)}px" title="${team} · ${activityCategories[i]} ${v}건"></div></div>`).join('')}</div><strong class="team-name">${team}</strong>`;el.appendChild(g)})}
function renderActivityTrend(team){const rows=activityMonthly[team]||activityMonthly['조립1팀'];const totals=rows.map(r=>r.slice(1).reduce((a,b)=>a+b,0));const max=Math.max(...totals);const el=document.getElementById('issueChart');el.className='monthly-stack-chart';el.innerHTML='';rows.forEach((r,idx)=>{const vals=r.slice(1),total=totals[idx];const g=document.createElement('div');g.className='month-stack-group';g.innerHTML=`<span class="month-total">${total}</span><div class="month-stack" style="height:${Math.max(30,total/max*225)}px">${vals.map((v,i)=>`<span class="month-seg s${i+1}" style="height:${total?v/total*100:0}%" title="${activityCategories[i]} ${v}건"></span>`).join('')}</div><span class="month-label">${r[0]}</span>`;el.appendChild(g)})}
function renderActivityChart(){const mode=document.getElementById('activityViewMode')?.value||'type';const teamSel=document.getElementById('activityTeamSelect');const title=document.getElementById('activityChartTitle');const sub=document.getElementById('activityChartSub');if(mode==='trend'){teamSel.disabled=false;const team=teamSel.value;title.textContent=`${team} 월별 5S 활동추이`;sub.textContent='최근 12개월 · 6개 활동유형 구성 및 총 활동건수';renderActivityTrend(team)}else{teamSel.disabled=true;title.textContent='생산현장 팀별 5S 유형별 활동 현황';sub.textContent='팀별 6개 활동유형을 독립 세로막대로 비교';renderActivityByType()}}
function renderMetricChart(id,data,standard=false){const el=document.getElementById(id);if(!el)return;const max=Math.max(...data.map(d=>d[1]));el.innerHTML=data.map(([name,val])=>`<div class="metric-bar-group"><div class="metric-bar-area"><div class="metric-bar ${standard?'standard':''}" style="height:${Math.max(12,val/max*185)}px" title="${name} ${val.toFixed(1)}건/인"></div></div><span class="metric-value">${val.toFixed(1)}</span><span class="metric-label">${name}</span></div>`).join('')}
function renderProgress(){const d=[['조립1팀',88],['Rear조립팀',84],['가공1팀',91],['자재운영팀',76],['생산관리팀',72]];document.getElementById('progressList').innerHTML=d.map(x=>`<div class="prog"><b>${x[0]}</b><div class="prog-track"><div class="prog-fill" style="width:${x[1]}%"></div></div><strong>${x[1]}%</strong></div>`).join('')}
function renderRaw(filter='all'){const rows=rawData.filter(r=>filter==='all'||r.status===filter);document.getElementById('rawTable').innerHTML=rows.map(r=>`<tr><td>${r.no}</td><td>${r.type}</td><td>${r.item}</td><td>${r.issue}</td><td>${r.action}</td><td><span class="status ${r.status==='완료'?'done':'open'}">${r.status}</span></td></tr>`).join('')}
function renderStandards(){document.getElementById('standardTable').innerHTML=standards.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}
function renderAudits(){document.getElementById('auditTable').innerHTML=audits.map(r=>`<tr>${r.map((c,i)=>`<td>${i===7?`<span class="status ${c==='완료'?'done':'open'}">${c}</span>`:c}</td>`).join('')}</tr>`).join('')}
function switchView(id){document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===id));document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.view===id));window.scrollTo({top:0,behavior:'smooth'})}
document.querySelectorAll('[data-view],[data-view-target]').forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.view||b.dataset.viewTarget)));
document.querySelectorAll('.chip').forEach(c=>c.addEventListener('click',()=>{document.querySelectorAll('.chip').forEach(x=>x.classList.remove('active'));c.classList.add('active');renderRaw(c.dataset.status)}));
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1600)}
document.getElementById('searchBtn')?.addEventListener('click',()=>{renderActivityChart();toast('조회 조건을 반영했습니다.')});document.getElementById('exportBtn')?.addEventListener('click',()=>window.print());document.getElementById('saveBtn')?.addEventListener('click',()=>toast('5S 개선요청이 저장되었습니다.'));document.getElementById('activityViewMode')?.addEventListener('change',renderActivityChart);document.getElementById('activityTeamSelect')?.addEventListener('change',renderActivityChart);
renderActivityLegend();renderActivityChart();renderMetricChart('perCapitaChart',perCapita);renderMetricChart('standardPerCapitaChart',standardPerCapita,true);renderBars('auditChart',[{m:'10월',v:'96',h:82},{m:'11월',v:'96',h:82},{m:'12월',v:'95',h:77},{m:'01월',v:'95',h:77},{m:'02월',v:'94',h:72},{m:'03월',v:'94.6',h:75}],'audit');renderProgress();renderRaw();renderStandards();renderAudits();