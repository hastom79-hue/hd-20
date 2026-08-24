const rawData = [
 {no:1,type:"정리",item:"불필요한 치공구, 대차 등으로 작업의 방해요소는 없는가?",issue:"로봇 RGV 레일에 세라믹 등 이물질이 많아 청소 필요",action:"RGV 주변 분진 제거 및 불필요 자재 폐기",status:"완료"},
 {no:2,type:"정돈",item:"보관장소에는 최대·최소량을 알 수 있도록 되어 있으며 쉽게 내용을 확인할 수 있는가?",issue:"품명만 되어 있고 작업자 로테이션 시 유지관리 어려움",action:"품명/최대최소 수량 라벨 부착 및 위치표준 등록",status:"미결"},
 {no:3,type:"청소",item:"기계 청소와 점검이 주기적으로 되고 있는가?",issue:"자주보전이 제대로 되고 있지 않음",action:"주간 자주보전 체크리스트 재정의",status:"완료"},
 {no:4,type:"시각화",item:"표준과 이상상태를 누구나 즉시 구분할 수 있는가?",issue:"공구 위치 표시 불명확",action:"쉐도우보드 및 위치 라벨 적용",status:"완료"},
 {no:5,type:"위험구역관리",item:"위험구역의 경계·표지·출입기준이 명확하게 관리되고 있는가?",issue:"위험구역 경계 표시 보완 필요",action:"경계선 및 위험표지 정비",status:"미결"},
 {no:6,type:"5S고도화",item:"5S 활동이 표준화되고 지속적으로 개선·유지되고 있는가?",issue:"팀별 우수사례의 표준 전개 미흡",action:"우수사례 표준화 및 수평전개",status:"완료"}
];
const standards = [
 ["1","정리","1","01. 미사용 자재 적치로 공간의 낭비요소는 없는가?","내자물류팀","사용","SYSTEM","2026-01-19"],
 ["2","정리","2","01. 불필요한 부품, 재료, 기계 등으로 공간의 낭비요소는 없는가?","가공부","사용","SYSTEM","2026-01-19"],
 ["3","정돈","1","01. 가용품의 보관구역과 보관수량 보관방법이 결정되어 있는가?","조립부","사용","SYSTEM","2026-01-19"],
 ["4","청소","1","01. 바닥에 먼지, 기름, 물, 쓰레기 등이 없이 깨끗한가?","","사용","SYSTEM","2026-01-19"],
 ["5","시각화","1","01. 표준/정상/이상 상태가 시각적으로 구분되는가?","","사용","SYSTEM","2026-01-19"],
 ["6","위험구역관리","1","01. 위험구역의 경계·표지·출입기준이 명확하게 관리되는가?","","사용","SYSTEM","2026-01-19"],
 ["7","5S고도화","1","01. 5S 우수사례가 표준화되어 유지·수평전개되고 있는가?","","사용","SYSTEM","2026-01-19"]
];
const audits = [
 ["1","정리","불필요한 것을 필요한 것과 구분","불필요한 치공구, 대차 등으로 작업의 방해요소는 없는가?","4 / 5","가공1팀 로케이터 적치 문제","전용 보관대 설치 및 위치표시","완료"],
 ["2","정돈","필요한 것을 쉽게 꺼내고 누구나 알 수 있게","보관장소의 최대·최소량과 품명이 표시되어 있는가?","3 / 5","최대최소량 미표기","라벨링 표준 적용","미결"],
 ["3","청소","항상 깨끗하게 하는 것","기계 청소와 점검이 주기적으로 되고 있는가?","4 / 5","가공부 청소주기 미흡","자주보전표 개정","완료"],
 ["4","시각화","표준·정상·이상을 즉시 구분","표준과 이상을 즉시 구분할 수 있는가?","5 / 5","공구 위치 표시 불량","쉐도우보드 적용","완료"],
 ["5","위험구역관리","위험구역을 명확히 식별하고 관리","위험구역 경계와 표지가 적정하게 유지되는가?","4 / 5","위험구역 표시 일부 훼손","경계·표지 재정비","미결"],
 ["6","5S고도화","5S 표준화·유지·수평전개","우수 5S 활동이 표준화되어 확산되는가?","4 / 5","우수사례 전개 미흡","표준화 및 수평전개","완료"]
];

const activityCategories=["정리","정돈","청소","시각화","위험구역관리","5S고도화"];
const activityTeamSnapshot={
 "조립1팀":[5,4,3,2,1,2],
 "Rear조립팀":[4,2,2,3,1,1],
 "가공1팀":[2,3,4,1,2,2],
 "자재운영팀":[1,2,1,2,1,3],
 "생산관리팀":[2,1,2,3,2,2]
};
const activityMonthly={
 "조립1팀":[["04월",2,2,1,1,0,1],["05월",3,2,2,1,1,1],["06월",3,3,2,1,1,1],["07월",4,3,2,2,1,1],["08월",4,4,2,2,1,1],["09월",5,3,3,2,1,1],["10월",5,4,3,2,1,2],["11월",6,4,3,3,1,2],["12월",5,4,4,2,1,2],["01월",4,4,3,2,1,2],["02월",5,4,3,2,1,2],["03월",5,4,3,2,1,2]],
 "Rear조립팀":[["04월",2,1,1,1,0,1],["05월",2,2,1,1,1,1],["06월",3,2,2,1,1,1],["07월",3,2,2,2,1,1],["08월",4,2,2,2,1,1],["09월",4,2,2,3,1,1],["10월",4,3,2,3,1,1],["11월",5,3,2,3,1,2],["12월",4,3,3,3,1,1],["01월",4,2,2,3,1,1],["02월",4,2,2,3,1,1],["03월",4,2,2,3,1,1]],
 "가공1팀":[["04월",1,2,2,1,1,1],["05월",2,2,2,1,1,1],["06월",2,2,3,1,1,1],["07월",2,3,3,1,1,1],["08월",2,3,4,1,1,1],["09월",2,3,4,1,2,1],["10월",3,3,4,1,2,1],["11월",3,4,4,1,2,2],["12월",2,3,4,2,2,2],["01월",2,3,3,1,2,2],["02월",2,3,4,1,2,2],["03월",2,3,4,1,2,2]],
 "자재운영팀":[["04월",1,1,1,1,0,1],["05월",1,1,1,1,1,1],["06월",1,2,1,1,1,1],["07월",1,2,1,2,1,1],["08월",1,2,1,2,1,2],["09월",1,2,1,2,1,2],["10월",2,2,1,2,1,2],["11월",2,3,1,2,1,3],["12월",1,2,2,2,1,3],["01월",1,2,1,2,1,2],["02월",1,2,1,2,1,3],["03월",1,2,1,2,1,3]],
 "생산관리팀":[["04월",1,1,1,1,1,1],["05월",1,1,1,2,1,1],["06월",1,1,2,2,1,1],["07월",2,1,2,2,1,1],["08월",2,1,2,2,1,2],["09월",2,1,2,3,1,2],["10월",2,2,2,3,1,2],["11월",3,2,2,3,2,2],["12월",2,2,3,3,2,2],["01월",2,1,2,3,2,2],["02월",2,1,2,3,2,2],["03월",2,1,2,3,2,2]]
};

function renderBars(id, vals, cls=""){
 const el=document.getElementById(id); el.innerHTML="";
 vals.forEach(v=>{const c=document.createElement("div");c.className="bar-col";c.innerHTML=`<span class="bar-val">${v.v}</span><div class="bar ${cls}" style="height:${v.h}%"></div><span class="bar-label">${v.m}</span>`;el.appendChild(c)})
}
function renderActivityLegend(){
 const legend=document.getElementById("activityLegend");
 if(legend) legend.innerHTML=activityCategories.map((c,i)=>`<span><i class="legend-dot s${i+1}"></i>${c}</span>`).join("");
}
function renderActivityByType(){
 const el=document.getElementById("issueChart");
 el.className="grouped-vertical-chart";
 el.innerHTML="";
 const max=Math.max(...Object.values(activityTeamSnapshot).flat(),1);
 Object.entries(activityTeamSnapshot).forEach(([team,values])=>{
   const group=document.createElement("div");
   group.className="team-bar-group";
   group.innerHTML=`<div class="team-bars">${values.map((v,i)=>`<div class="mini-bar-wrap"><span class="mini-value">${v}</span><div class="mini-bar s${i+1}" style="height:${Math.max(8,v/max*180)}px" title="${team} · ${activityCategories[i]} ${v}건"></div></div>`).join("")}</div><strong class="team-name">${team}</strong>`;
   el.appendChild(group);
 });
}
function renderActivityTrend(team){
 const rows=activityMonthly[team] || activityMonthly["조립1팀"];
 const totals=rows.map(r=>r.slice(1).reduce((a,b)=>a+b,0));
 const max=Math.max(...totals,1);
 const el=document.getElementById("issueChart");
 el.className="monthly-stack-chart";
 el.innerHTML="";
 rows.forEach((r,idx)=>{
   const values=r.slice(1), total=totals[idx];
   const bar=document.createElement("div");
   bar.className="month-stack-group";
   bar.innerHTML=`<span class="month-total">${total}</span><div class="month-stack" style="height:${Math.max(28,total/max*190)}px" aria-label="${team} ${r[0]} 총 ${total}건">${values.map((v,i)=>`<span class="month-seg s${i+1}" style="height:${total ? v/total*100 : 0}%" title="${activityCategories[i]} ${v}건"></span>`).join("")}</div><span class="month-label">${r[0]}</span>`;
   el.appendChild(bar);
 });
}
function renderActivityChart(){
 const mode=document.getElementById("activityViewMode")?.value || "type";
 const teamSelect=document.getElementById("activityTeamSelect");
 const title=document.getElementById("activityChartTitle");
 const sub=document.getElementById("activityChartSub");
 if(mode==="trend"){
   teamSelect.disabled=false;
   const team=teamSelect.value;
   title.textContent=`${team} 월별 5S 활동추이`;
   sub.textContent="최근 12개월 · 6개 5S 활동유형 누적 활동건수";
   renderActivityTrend(team);
 }else{
   teamSelect.disabled=true;
   title.textContent="생산현장 팀별 5S 유형별 활동 현황";
   sub.textContent="팀별 6개 활동유형을 세로막대로 비교 · 정리 · 정돈 · 청소 · 시각화 · 위험구역관리 · 5S고도화";
   renderActivityByType();
 }
}
function renderProgress(){
 const d=[["조립부",70],["가공부",91.4],["자재운영부",60],["생산관리부",25]];
 document.getElementById("progressList").innerHTML=d.map(x=>`<div class="prog"><b>${x[0]}</b><div class="prog-track"><div class="prog-fill" style="width:${x[1]}%"></div></div><strong>${x[1]}%</strong></div>`).join("")
}
function renderRaw(filter="all"){
 const rows=rawData.filter(r=>filter==="all"||r.status===filter);
 document.getElementById("rawTable").innerHTML=rows.map(r=>`<tr><td>${r.no}</td><td>${r.type}</td><td>${r.item}</td><td>${r.issue}</td><td>${r.action}</td><td><span class="status ${r.status==="완료"?"done":"open"}">${r.status}</span></td></tr>`).join("")
}
function renderStandards(){document.getElementById("standardTable").innerHTML=standards.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")}
function renderAudits(){document.getElementById("auditTable").innerHTML=audits.map(r=>`<tr>${r.map((c,i)=>`<td>${i===7?`<span class="status ${c==="완료"?"done":"open"}">${c}</span>`:c}</td>`).join("")}</tr>`).join("")}
function switchView(id){
 document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===id));
 document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.view===id));
 window.scrollTo({top:0,behavior:"smooth"});
}
document.querySelectorAll("[data-view], [data-view-target]").forEach(b=>b.addEventListener("click",()=>switchView(b.dataset.view||b.dataset.viewTarget)));
document.querySelectorAll(".chip").forEach(c=>c.addEventListener("click",()=>{document.querySelectorAll(".chip").forEach(x=>x.classList.remove("active"));c.classList.add("active");renderRaw(c.dataset.status)}));
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1800)}
document.getElementById("searchBtn").addEventListener("click",()=>{renderActivityChart();toast("조회 조건을 반영했습니다.")});
document.getElementById("exportBtn").addEventListener("click",()=>window.print());
document.getElementById("saveBtn").addEventListener("click",()=>toast("5S 개선요청이 저장되었습니다. 생산팀 알림 대상입니다."));
document.getElementById("activityViewMode")?.addEventListener("change",renderActivityChart);
document.getElementById("activityTeamSelect")?.addEventListener("change",renderActivityChart);

renderBars("standardChart",[{m:"04월",v:"1.2",h:35},{m:"05월",v:"1.5",h:42},{m:"06월",v:"1.7",h:50},{m:"07월",v:"2.3",h:68},{m:"08월",v:"2.5",h:72},{m:"09월",v:"2.4",h:69},{m:"10월",v:"2.8",h:82},{m:"11월",v:"3.0",h:88},{m:"12월",v:"2.9",h:85},{m:"01월",v:"2.6",h:76},{m:"02월",v:"2.7",h:79},{m:"03월",v:"2.8",h:82}]);
renderBars("auditChart",[{m:"07월",v:"97",h:97},{m:"08월",v:"97",h:97},{m:"09월",v:"97",h:97},{m:"10월",v:"96",h:96},{m:"11월",v:"96",h:96},{m:"12월",v:"96",h:96},{m:"01월",v:"95",h:95},{m:"02월",v:"94",h:94},{m:"03월",v:"95",h:95}],"audit");
renderActivityLegend(); renderActivityChart(); renderProgress(); renderRaw(); renderStandards(); renderAudits();
