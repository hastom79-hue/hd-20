(()=>{'use strict';
/* 생산팀 마스터 (표시 순서 = 배열 순서, 소속 = 조립1팀/조립2팀) */
const TEAM_DEFS=Object.freeze([
['대형Att.팀','조립1팀'],['대형메인팀','조립1팀'],['대형상부팀','조립1팀'],
['프레임제작팀','조립2팀'],['Boom제작팀','조립2팀'],
['중형상부1팀','조립1팀'],['중형상부2팀','조립1팀'],['중형하부팀','조립1팀'],['중형Att팀','조립1팀'],['중형메인팀','조립1팀'],
['휠로더Front팀','조립2팀'],['휠로더리어팀','조립2팀'],['휠로더메인팀','조립2팀'],['초대형조립팀','조립2팀'],
['성능팀','조립1팀'],['트러블슈팅팀','조립1팀']
]);
const CANONICAL_TEAMS=TEAM_DEFS.map(d=>d[0]);
const TEAM_GROUP=new Map(TEAM_DEFS);
const TEAM_GROUPS=[...new Set(TEAM_DEFS.map(d=>d[1]))];
const TEAM_MASTER=window.HD20ProductionTeamMaster||Object.freeze({teamNames:()=>[...CANONICAL_TEAMS],has:team=>CANONICAL_TEAMS.includes(String(team||'').trim()),count:()=>CANONICAL_TEAMS.length,groupNames:()=>[...TEAM_GROUPS],groupOf:team=>TEAM_GROUP.get(String(team||'').trim())||null,teamsOf:group=>TEAM_DEFS.filter(d=>d[1]===group).map(d=>d[0])});
window.HD20ProductionTeamMaster=TEAM_MASTER;
const TEAMS=TEAM_MASTER.teamNames();
const ORDER_KEY='gmes5s_team_display_order',TARGET_KEY='gmes5s_quarter_perperson_targets';
let teamOrder=[...TEAMS],targetMaster={Q1:null,Q2:null,Q3:null,Q4:null};
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
function loadSettings(){try{const SIG_KEY='gmes5s_team_master_sig',sig=TEAMS.join('|');if(localStorage.getItem(SIG_KEY)!==sig){localStorage.removeItem(ORDER_KEY);localStorage.setItem(SIG_KEY,sig)}}catch{}try{const v=JSON.parse(localStorage.getItem(ORDER_KEY)||'null');if(Array.isArray(v)&&v.length===TEAMS.length&&TEAMS.every(t=>v.includes(t)))teamOrder=v}catch{}try{const v=JSON.parse(localStorage.getItem(TARGET_KEY)||'null');if(v&&typeof v==='object'){['Q1','Q2','Q3','Q4'].forEach(q=>{const n=Number(v[q]);targetMaster[q]=Number.isFinite(n)&&n>0?n:null})}}catch{}}
function snapshot(){if(window.HD20KPIData?.snapshot)return window.HD20KPIData.snapshot();try{const rows=JSON.parse(localStorage.getItem('hd20GMES5SAutoImproveRawV1')||'[]');return{activities:Array.isArray(rows)?rows:[],candidates:[],newSecured:[]}}catch{return{activities:[],candidates:[],newSecured:[]}}}
function teamOf(x){return String(x?.team||'').trim()}
function counts(){const s=snapshot(),out=new Map(TEAMS.map(t=>[t,{activity:0,candidate:0,secured:0}]));(s.activities||[]).forEach(x=>{const d=out.get(teamOf(x));if(d)d.activity++});(s.candidates||[]).forEach(x=>{const d=out.get(teamOf(x));if(d)d.candidate++});(s.newSecured||[]).forEach(x=>{const d=out.get(teamOf(x));if(d)d.secured++});return out}
function quarter(){const m=new Date().getMonth()+1;return m<=3?'Q1':m<=6?'Q2':m<=9?'Q3':'Q4'}
function renderTargetInfo(){const q=quarter(),v=targetMaster[q],line=$('#targetLine'),label=$('#targetLabel');if(line){line.style.display='none';line.removeAttribute('data-target-value')}if(label){label.textContent=v==null?`${q} 인당 목표 미설정`:`${q} 인당 목표 ${v}건/인`;label.style.display='inline-flex'} }
function renderChart(){const root=$('#cols');if(!root)return;const map=counts(),vals=teamOrder.map(t=>map.get(t)||{activity:0,candidate:0,secured:0}),maxA=Math.max(1,...vals.map(x=>x.activity)),maxC=Math.max(1,...vals.map(x=>x.candidate)),maxS=Math.max(1,...vals.map(x=>x.secured));root.innerHTML=teamOrder.map((t,i)=>{const d=vals[i];return`<div class="grp"><div class="bar blue" style="height:${Math.max(d.activity?4:0,d.activity/maxA*235)}px"><em>${d.activity}</em></div><div class="bar orange" style="height:${Math.max(d.candidate?4:0,d.candidate/maxC*92)}px"><em>${d.candidate}</em></div><div class="bar green" style="height:${Math.max(d.secured?4:0,d.secured/maxS*76)}px"><em>${d.secured}</em></div><label>${t}</label></div>`}).join('');renderTargetInfo()}
function renderOrderEditor(){const list=$('#orderList');if(!list)return;const n=teamOrder.length;
  list.innerHTML=teamOrder.map((t,i)=>`<div class="orderRow"><div class="orderName">${t}</div><label class="orderNumWrap">순서<input type="number" class="orderNumInput" data-team="${t}" min="1" max="${n}" step="1" value="${i+1}"></label></div>`).join('');
  $$('.orderNumInput',list).forEach(inp=>{
    const apply=()=>{
      const raw=$$('.orderNumInput',list).map(x=>({team:x.dataset.team,v:Number(x.value)||0}));
      /* 같은 번호를 입력했거나 비웠을 때도 안전하게: 값 기준으로 안정 정렬(동률은 기존 순서 유지) 후 전체를 1..n으로 재배치 */
      const order=raw.map((r,i)=>({...r,i})).sort((a,b)=>(a.v-b.v)||(a.i-b.i)).map(r=>r.team);
      teamOrder=order;renderOrderEditor();renderChart()
    };
    inp.onchange=apply;inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();inp.blur()}})
  })
}
function loadTargets(){['Q1','Q2','Q3','Q4'].forEach((q,i)=>{const e=$(`#q${i+1}Target`);if(e)e.value=targetMaster[q]??''})}
function readTargetInput(id){const raw=String($(id)?.value??'').trim();if(!raw)return null;const n=Number(raw);return Number.isFinite(n)&&n>0?n:null}
function initMaster(){const modal=$('#masterModal');const close=$('#closeMaster'),cancel=$('#cancelOrder'),save=$('#saveOrder'),tabs=$$('[data-master-tab]');let tab='order';const setTab=t=>{tab=t;tabs.forEach(b=>b.classList.toggle('on',b.dataset.masterTab===t));const order=$('#masterOrderPanel'),target=$('#masterTargetPanel');if(order)order.style.display=t==='order'?'block':'none';if(target)target.style.display=t==='target'?'block':'none';if(t==='order')renderOrderEditor();else loadTargets()};
  /* 모달(오버레이)에서 '⑥ 통합기준정보' 탭(일반 화면 섹션)으로 전환 — 열기 버튼은 없어지고 상단 나비게이션이
     대신 이 화면을 보여줌·숨김. hd20-open-master 이벤트가 탭 진입 시점을 알려줌(기본 탭으로 재설정). */
  window.addEventListener('hd20-open-master',()=>setTab('order'));
  if(close)close.onclick=()=>window.HD20_NAV?.go?.('dashboard');
  if(cancel)cancel.onclick=()=>{loadSettings();setTab(tab)};
  tabs.forEach(b=>b.onclick=()=>setTab(b.dataset.masterTab));
  if(save)save.onclick=()=>{if(tab==='order')localStorage.setItem(ORDER_KEY,JSON.stringify(teamOrder));else{targetMaster={Q1:readTargetInput('#q1Target'),Q2:readTargetInput('#q2Target'),Q3:readTargetInput('#q3Target'),Q4:readTargetInput('#q4Target')};localStorage.setItem(TARGET_KEY,JSON.stringify(targetMaster))}renderChart();alert('저장했습니다.')}}
function boot(){loadSettings();renderChart();initMaster()}
window.renderChart=renderChart;window.HD20DashboardCore={renderChart,counts,teamOrder:()=>[...teamOrder],targets:()=>({...targetMaster})};
['hd20-kpi-source-updated','hd20-gmes-5s-imported','hd20-gmes-5s-judged'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(renderChart,0)));
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();