const teamsOriginal=["대형메인팀","휠로더Front팀","대형Att.팀","휠로더리어팀","중형상부1팀","중형메인팀","중형Att팀","대형상부팀","프레임제작팀","휠로더메인팀","중형상부2팀","중형하부팀","Boom제작팀","초대형조립팀","성능팀","트러블슈팅팀"];
const improve=[62,58,54,52,50,48,47,44,43,41,38,36,34,32,28,20];
const candidate=[2,2,1,1,1,1,1,1,1,1,1,1,0,0,0,0];
const secured=[1,1,1,0,0,1,0,0,1,0,0,0,0,0,0,0];
let teamOrder=[...teamsOriginal];
let targetMaster={Q1:45,Q2:50,Q3:55,Q4:60};
const dataMap={};
teamsOriginal.forEach((t,i)=>dataMap[t]={improve:improve[i],candidate:candidate[i],secured:secured[i]});

function getQuarter(month){if(month<=3)return "Q1";if(month<=6)return "Q2";if(month<=9)return "Q3";return "Q4";}
function getActiveMonth(){return 8;}
function renderTargetLine(){
  const q=getQuarter(getActiveMonth());
  const val=Number(targetMaster[q]||0),max=80;
  const line=document.getElementById("targetLine"),label=document.getElementById("targetLabel");
  if(!line||!label)return;
  line.style.top=Math.max(0,Math.min(100,(1-val/max)*100))+"%";
  label.textContent=`${q} 목표 ${val}`;
}
function renderChart(){
  const root=document.getElementById("cols"),max=80,h=235;
  if(!root)return;
  root.innerHTML="";
  teamOrder.forEach(t=>{
    const d=dataMap[t],g=document.createElement("div");
    g.className="grp";
    const bh=d.improve/max*h,ch=Math.max(4,d.candidate/12*92),sh=Math.max(4,d.secured/7*76);
    g.innerHTML=`<div class="bar blue" style="height:${bh}px"><em>${d.improve}</em></div><div class="bar orange" style="height:${ch}px"><em>${d.candidate}</em></div><div class="bar green" style="height:${sh}px"><em>${d.secured}</em></div><label>${t}</label>`;
    root.appendChild(g);
  });
  renderTargetLine();
}
function renderOrderEditor(){
  const list=document.getElementById("orderList"),preview=document.getElementById("orderPreview");
  if(!list||!preview)return;
  list.innerHTML="";preview.innerHTML="";
  teamOrder.forEach((t,i)=>{
    const row=document.createElement("div");row.className="orderRow";
    row.innerHTML=`<div class="orderNo">${i+1}</div><div class="orderName">${t}</div><div class="orderBtns"><button data-act="up" data-i="${i}" ${i===0?"disabled":""}>▲</button><button data-act="down" data-i="${i}" ${i===teamOrder.length-1?"disabled":""}>▼</button></div>`;
    list.appendChild(row);
    const chip=document.createElement("span");chip.textContent=`${i+1}. ${t}`;preview.appendChild(chip);
  });
  list.querySelectorAll("button[data-act]").forEach(btn=>btn.onclick=()=>{
    const i=Number(btn.dataset.i),act=btn.dataset.act;
    if(act==="up"&&i>0)[teamOrder[i-1],teamOrder[i]]=[teamOrder[i],teamOrder[i-1]];
    if(act==="down"&&i<teamOrder.length-1)[teamOrder[i+1],teamOrder[i]]=[teamOrder[i],teamOrder[i+1]];
    renderOrderEditor();
  });
}
function loadTargetInputs(){
  ["Q1","Q2","Q3","Q4"].forEach((q,i)=>{const el=document.getElementById(`q${i+1}Target`);if(el)el.value=targetMaster[q]});
  renderTargetPreview();
}
function renderTargetPreview(){
  const vals={Q1:Number(document.getElementById("q1Target")?.value||0),Q2:Number(document.getElementById("q2Target")?.value||0),Q3:Number(document.getElementById("q3Target")?.value||0),Q4:Number(document.getElementById("q4Target")?.value||0)};
  const box=document.getElementById("targetPreviewChips");
  if(box)box.innerHTML=Object.entries(vals).map(([q,v])=>`<span>${q} ${v}</span>`).join("");
}

function injectAuditDynamicStyles(){
  if(document.getElementById("auditDynamicStyles"))return;
  const style=document.createElement("style");
  style.id="auditDynamicStyles";
  style.textContent=`
  .auditDynamicHead{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%}
  .auditDynamicHead h2{margin:0;font-size:19px;font-weight:900;color:#071d35;line-height:1.2}
  .auditDynamicHead small{display:block;margin-top:4px;font-size:10px;color:#718397;font-weight:700}
  .auditDueBadge{display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:14px;background:#fff4e6;color:#9b6100;font-size:9px;font-weight:900;white-space:nowrap}
  .auditPulse{width:7px;height:7px;border-radius:50%;background:#f0a321;box-shadow:0 0 0 0 rgba(240,163,33,.45);animation:auditPulse 1.8s infinite}
  @keyframes auditPulse{70%{box-shadow:0 0 0 7px rgba(240,163,33,0)}100%{box-shadow:0 0 0 0 rgba(240,163,33,0)}}
  .auditDynamic{padding:12px 13px 13px!important}
  .auditHero{display:grid;grid-template-columns:142px 1fr;gap:12px;align-items:center}
  .auditGauge{--auditValue:0;position:relative;width:132px;height:132px;border-radius:50%;background:conic-gradient(#5fa86b calc(var(--auditValue)*1%),#e7edf1 0);display:grid;place-items:center;margin:auto;transition:filter .2s ease;box-shadow:inset 0 0 0 1px rgba(44,76,98,.03)}
  .auditGauge:before{content:"";width:92px;height:92px;border-radius:50%;background:#fff;box-shadow:0 2px 10px rgba(28,57,78,.08)}
  .auditGaugeCenter{position:absolute;inset:0;display:grid;place-content:center;text-align:center;pointer-events:none}
  .auditGaugeCenter span{font-size:9px;color:#6d8092;font-weight:800}
  .auditGaugeCenter strong{font-size:25px;line-height:1;color:#123653;margin:4px 0 3px}
  .auditGaugeCenter em{font-size:9px;color:#4c7d58;font-style:normal;font-weight:900}
  .auditMiniStats{display:grid;grid-template-columns:1fr 1fr;gap:6px}
  .auditMini{border:1px solid #e2e9ee;border-radius:8px;padding:8px 9px;background:#fbfcfd}
  .auditMini span{display:block;font-size:8px;color:#728497;font-weight:700}
  .auditMini b{display:block;font-size:16px;margin-top:3px;color:#143750}
  .auditMini.warn b{color:#d58400}.auditMini.bad b{color:#c84f47}
  .auditStageGrid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:10px}
  .auditStage{appearance:none;text-align:left;border:1px solid #e1e8ed;border-radius:9px;background:#fff;padding:8px 9px;cursor:pointer;transition:.18s ease;color:#173047}
  .auditStage:hover{transform:translateY(-1px);border-color:#b9cbd8;box-shadow:0 4px 12px rgba(27,60,84,.08)}
  .auditStage.active{border-color:var(--stage);background:color-mix(in srgb,var(--stage) 7%,white);box-shadow:0 0 0 2px color-mix(in srgb,var(--stage) 15%,transparent)}
  .auditStageTop{display:flex;align-items:center;justify-content:space-between;gap:8px}
  .auditStageLabel{display:flex;align-items:center;gap:6px;font-size:9px;font-weight:900;color:#445d70}
  .auditDot{width:8px;height:8px;border-radius:50%;background:var(--stage);flex:0 0 auto}
  .auditStageTop b{font-size:15px;color:#112f47}
  .auditStageMeta{display:flex;justify-content:space-between;margin-top:4px;font-size:8px;color:#718397;font-weight:700}
  .auditStageBar{height:4px;border-radius:4px;background:#edf2f5;margin-top:6px;overflow:hidden}
  .auditStageBar i{display:block;height:100%;width:0;background:var(--stage);border-radius:4px;transition:width .55s ease}
  .auditFocus{margin-top:9px;border-radius:8px;background:#f4f8fb;border:1px solid #e0e8ee;padding:8px 10px;display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center}
  .auditFocus b{display:block;font-size:10px;color:#173b56;margin-bottom:2px}.auditFocus p{margin:0;font-size:8.5px;color:#657b8d;line-height:1.35}
  .auditFocus button{height:28px;border:1px solid #cbd9e3;border-radius:6px;background:#fff;color:#2e72af;font-size:9px;font-weight:900;padding:0 8px;cursor:pointer}
  @media(max-width:1250px){.auditHero{grid-template-columns:120px 1fr}.auditGauge{width:116px;height:116px}.auditGauge:before{width:80px;height:80px}.auditGaugeCenter strong{font-size:22px}}
  `;
  document.head.appendChild(style);
}

function renderDynamicAuditCard(){
  const card=document.querySelector(".sideStack .card");
  if(!card)return;
  injectAuditDynamicStyles();
  const head=card.querySelector(".cardHead"),body=card.querySelector(".cardBody");
  if(!head||!body)return;
  head.innerHTML=`<div class="auditDynamicHead"><div><h2>고도화 유지상태 · 유효성 AUDIT</h2><small>정기 유지점검 + 유효성 검증 통과 기준</small></div><div class="auditDueBadge"><i class="auditPulse"></i>금월 점검 6곳</div></div>`;
  body.className="cardBody auditDynamic";
  body.innerHTML=`
    <div class="auditHero">
      <div class="auditGauge" id="auditGauge"><div class="auditGaugeCenter"><span>AUDIT 유효</span><strong id="auditRateText">83.3%</strong><em>20 / 24곳</em></div></div>
      <div class="auditMiniStats">
        <div class="auditMini"><span>유효 작업장</span><b>20곳</b></div>
        <div class="auditMini"><span>이번달 점검</span><b>6곳</b></div>
        <div class="auditMini warn"><span>기한임박</span><b>2곳</b></div>
        <div class="auditMini bad"><span>조치·중지</span><b>4곳</b></div>
      </div>
    </div>
    <div class="auditStageGrid" id="auditStageGrid">
      <button class="auditStage active" style="--stage:#6aa96b" data-key="m6"><div class="auditStageTop"><span class="auditStageLabel"><i class="auditDot"></i>6개월 AUDIT</span><b>9곳</b></div><div class="auditStageMeta"><span>유효 완료</span><span>37.5%</span></div><div class="auditStageBar"><i data-w="100"></i></div></button>
      <button class="auditStage" style="--stage:#e8a21f" data-key="m3"><div class="auditStageTop"><span class="auditStageLabel"><i class="auditDot"></i>3개월 AUDIT</span><b>7곳</b></div><div class="auditStageMeta"><span>유효 완료</span><span>29.2%</span></div><div class="auditStageBar"><i data-w="78"></i></div></button>
      <button class="auditStage" style="--stage:#ef806d" data-key="m1"><div class="auditStageTop"><span class="auditStageLabel"><i class="auditDot"></i>1개월 점검</span><b>4곳</b></div><div class="auditStageMeta"><span>초기 유지 확인</span><span>16.7%</span></div><div class="auditStageBar"><i data-w="44"></i></div></button>
      <button class="auditStage" style="--stage:#9aa9b4" data-key="pending"><div class="auditStageTop"><span class="auditStageLabel"><i class="auditDot"></i>대기·조치</span><b>4곳</b></div><div class="auditStageMeta"><span>재AUDIT 포함</span><span>16.7%</span></div><div class="auditStageBar"><i data-w="44"></i></div></button>
    </div>
    <div class="auditFocus" id="auditFocus"><div><b>6개월 AUDIT 유효 · 9곳</b><p>장기 유지효과가 검증된 작업장입니다. 이 중 2곳은 수평전개 후보입니다.</p></div><button type="button" id="auditDetailBtn">AUDIT 상세 →</button></div>`;

  const details={
    m6:{title:"6개월 AUDIT 유효 · 9곳",text:"장기 유지효과가 검증된 작업장입니다. 이 중 2곳은 수평전개 후보입니다."},
    m3:{title:"3개월 AUDIT 유효 · 7곳",text:"초기 고도화 효과가 안정화되는 구간입니다. 다음 6개월 AUDIT 일정을 관리합니다."},
    m1:{title:"1개월 유지점검 · 4곳",text:"원상복귀 여부와 현장 사용성을 먼저 확인합니다. 미흡 시 즉시 보완조치합니다."},
    pending:{title:"AUDIT 대기·조치 · 4곳",text:"기한임박, 조건부 적합, 재AUDIT 대상이 포함됩니다. 우선 관리가 필요한 작업장입니다."}
  };
  document.querySelectorAll(".auditStage").forEach(btn=>btn.addEventListener("click",()=>{
    document.querySelectorAll(".auditStage").forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    const d=details[btn.dataset.key],focus=document.getElementById("auditFocus");
    if(focus&&d)focus.querySelector("div").innerHTML=`<b>${d.title}</b><p>${d.text}</p>`;
  }));
  document.getElementById("auditDetailBtn")?.addEventListener("click",()=>document.querySelector(".auditStatus")?.scrollIntoView({behavior:"smooth",block:"start"}));
  requestAnimationFrame(()=>document.querySelectorAll(".auditStageBar i").forEach(el=>el.style.width=el.dataset.w+"%"));
  const gauge=document.getElementById("auditGauge"),target=83.3,start=performance.now(),duration=850;
  function animate(now){
    const p=Math.min(1,(now-start)/duration),eased=1-Math.pow(1-p,3),v=target*eased;
    if(gauge)gauge.style.setProperty("--auditValue",v.toFixed(1));
    const txt=document.getElementById("auditRateText");if(txt)txt.textContent=v.toFixed(1)+"%";
    if(p<1)requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

function init(){
  ["q1Target","q2Target","q3Target","q4Target"].forEach(id=>{const el=document.getElementById(id);if(el)el.addEventListener("input",renderTargetPreview)});
  const modal=document.getElementById("masterModal");let activeMasterTab="order";
  function setMasterTab(tab){
    activeMasterTab=tab;
    document.querySelectorAll("[data-master-tab]").forEach(b=>b.classList.toggle("on",b.dataset.masterTab===tab));
    const op=document.getElementById("masterOrderPanel"),tp=document.getElementById("masterTargetPanel");
    if(op)op.style.display=tab==="order"?"block":"none";if(tp)tp.style.display=tab==="target"?"block":"none";
    if(tab==="order")renderOrderEditor();if(tab==="target")loadTargetInputs();
  }
  const open=document.getElementById("openMaster");if(open&&modal)open.onclick=()=>{modal.classList.add("on");setMasterTab("order")};
  const close=document.getElementById("closeMaster"),cancel=document.getElementById("cancelOrder");if(close&&modal)close.onclick=()=>modal.classList.remove("on");if(cancel&&modal)cancel.onclick=()=>modal.classList.remove("on");
  document.querySelectorAll("[data-master-tab]").forEach(b=>b.onclick=()=>{if(b.dataset.masterTab!=="other")setMasterTab(b.dataset.masterTab)});
  const reset=document.getElementById("resetOrder");if(reset)reset.onclick=()=>{if(activeMasterTab==="order"){teamOrder=[...teamsOriginal];renderOrderEditor()}else{targetMaster={Q1:45,Q2:50,Q3:55,Q4:60};loadTargetInputs()}};
  const save=document.getElementById("saveOrder");if(save)save.onclick=()=>{
    if(activeMasterTab==="order")localStorage.setItem("gmes5s_team_display_order",JSON.stringify(teamOrder));
    else{targetMaster={Q1:Number(document.getElementById("q1Target")?.value||0),Q2:Number(document.getElementById("q2Target")?.value||0),Q3:Number(document.getElementById("q3Target")?.value||0),Q4:Number(document.getElementById("q4Target")?.value||0)};localStorage.setItem("gmes5s_quarter_targets",JSON.stringify(targetMaster));}
    renderChart();if(modal)modal.classList.remove("on");
  };
  try{const saved=JSON.parse(localStorage.getItem("gmes5s_team_display_order")||"null");if(Array.isArray(saved)&&saved.length===teamsOriginal.length&&saved.every(x=>teamsOriginal.includes(x)))teamOrder=saved}catch(e){}
  try{const savedT=JSON.parse(localStorage.getItem("gmes5s_quarter_targets")||"null");if(savedT&&["Q1","Q2","Q3","Q4"].every(q=>Number.isFinite(Number(savedT[q]))))targetMaster=savedT}catch(e){}
  renderChart();
  renderDynamicAuditCard();
}
document.addEventListener("DOMContentLoaded",init);