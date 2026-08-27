(()=>{'use strict';

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const GMES_KEY='hd20GMES5SAutoImproveRawV1';

function textOf(el){return (el?.textContent||'').replace(/\s+/g,' ').trim();}
function load(){
  try{
    const v=JSON.parse(localStorage.getItem(GMES_KEY)||'[]');
    return Array.isArray(v)?v:[];
  }catch{return [];}
}
function esc(v){
  return String(v??'').replace(/[&<>"']/g,m=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}
function dateOnly(v){
  if(!v)return '—';
  const d=new Date(v);
  return Number.isNaN(d.getTime())?'—':d.toISOString().slice(0,10);
}
function levelOf(x){
  const v=String(x?.level||x?.maturityLevel||x?.lv||'').match(/[1-5]/);
  return v?+v[0]:null;
}
function ensureOverrides(){
  if(document.getElementById('hd20ApprovedLandingRuntimeFix'))return;
  const s=document.createElement('style');
  s.id='hd20ApprovedLandingRuntimeFix';
  s.textContent=`
    .hd20ALKpi[role="button"]{cursor:pointer}
    .hd20ALKpi[role="button"]:focus{outline:2px solid #2b78bd;outline-offset:2px}
    .hd20TrendChart.no-data:before,.hd20TrendChart.no-data:after{display:none!important}
    .hd20TrendChart.no-data{display:grid;place-items:center;border:1px dashed #dce4eb!important;color:#8091a0}
    .hd20TrendChart.no-data span{font-size:8px;font-weight:800}
    .hd20ALKpi .spark.no-data:after{display:none!important}
  `;
  document.head.appendChild(s);
}
function snap(){
  if(window.HD20KPIData?.snapshot)return window.HD20KPIData.snapshot();
  const rows=load();
  const confirmed=rows.filter(x=>x?.confirmed===true&&x.judgeState==='확정');
  const maintained=confirmed.filter(x=>
    !/중지|부적합|해제|실패/.test(String(x.maintainState||x.auditState||x.status||'')) &&
    x.valid!==false
  );
  return {
    rows,
    activities:rows,
    candidates:rows.filter(x=>x.judgeState&&x.judgeState!=='미확정'),
    newSecured:confirmed,
    confirmed,
    maintained,
    headcount:null,
    perPerson:null,
    year:new Date().getFullYear()
  };
}
function fmtValue(v,unit){
  if(v===null||v===undefined)return '—';
  return `${v}${unit?`<em>${unit}</em>`:''}`;
}
function renderKpis(host){
  const s=snap();
  const vals=[
    s.perPerson==null?null:s.perPerson.toFixed(2),
    s.candidates.length,
    s.newSecured.length,
    s.confirmed.length,
    s.maintained.length
  ];
  const units=['건/인','건','곳','곳','곳'];

  $$('.hd20ALKpi',host).forEach((c,i)=>{
    const strong=$('strong',c);
    const delta=$('.delta',c);
    if(strong)strong.innerHTML=fmtValue(vals[i],vals[i]==null?'':units[i]);
    if(delta)delta.textContent=i===0&&!s.headcount?'인원 Master 미연결':'GMES 판정 원천 기준';
  });

  const metrics=$$('.hd20ALMetric',host);
  const candidate=s.candidates.length;
  const confirmed=s.confirmed.length;
  const maintained=s.maintained.length;
  const conversion=candidate?maintained/candidate*100:null;
  const set=(i,v,u='')=>{
    const strong=metrics[i]&&$('strong',metrics[i]);
    if(strong)strong.textContent=v==null?'—':`${v}${u}`;
  };
  set(0,candidate,'건');
  set(1,confirmed,'곳');
  set(2,maintained,'곳');
  set(3,conversion==null?null:conversion.toFixed(1),'%');
  set(4,null);
  host.dataset.kpiRows=String(s.rows.length);
}
function renderLive(host){
  const s=snap();
  const rows=s.confirmed||[];
  renderKpis(host);

  const recent=[...rows]
    .sort((a,b)=>new Date(b.judgedAt||0)-new Date(a.judgedAt||0))
    .slice(0,5);
  const recentBox=$('.hd20Recent',host);
  if(recentBox){
    recentBox.innerHTML=recent.length
      ? recent.map(x=>`<div class="hd20RecentRow"><span class="badge">${levelOf(x)?'Lv.'+levelOf(x):'확정'}</span><b>${esc(x.workplace||x.title||'미지정')}</b><span>${esc(x.team||'미지정')}</span><span>${dateOnly(x.judgedAt)}</span></div>`).join('')
      : '<div class="hd20RecentRow"><span>공식확정 데이터 없음</span></div>';
  }

  const levels=[1,2,3,4,5].map(n=>rows.filter(x=>levelOf(x)===n).length);
  const known=levels.reduce((a,b)=>a+b,0);
  $$('.hd20Level',host).forEach((el,i)=>{
    const strong=$('strong',el);
    const small=$('small',el);
    if(strong)strong.textContent=known?`${levels[i]}곳`:'—';
    if(small)small.textContent=known?`${Math.round(levels[i]/known*100)}%`:'—';
  });

  const sum=window.HD20MaturityFollowup?.summary?.();
  const due=(sum?.three||[])
    .filter(x=>x.state==='기한임박')
    .sort((a,b)=>a.diff-b.diff);
  const dueBox=$('.hd20Due',host);
  if(dueBox){
    dueBox.innerHTML=due.length
      ? due.slice(0,5).map(x=>`<div class="hd20DueRow"><strong>${Math.max(0,x.diff)}일 남음</strong><b>${esc(x.workplace||x.title||'미지정')}</b><span>${esc(x.team||'미지정')}</span><span>${dateOnly(x.date)}</span></div>`).join('')
      : `<div class="hd20DueRow"><span>${sum?'기한임박 3개월 AUDIT 대상 없음':'Lifecycle 산식 초기화 중'}</span></div>`;
  }
  const metrics=$$('.hd20ALMetric',host);
  const dueStrong=metrics[5]&&$('strong',metrics[5]);
  if(dueStrong)dueStrong.textContent=sum?`${due.length}곳`:'—';

  host.dataset.liveSource=GMES_KEY;
  host.dataset.liveRows=String(rows.length);
}
function openGrid(i){
  const card=$$('.cards .kpi')[i];
  if(card)card.click();
}
function navClick(key){
  document.querySelector(`.beginnerNav [data-key="${key}"]`)?.click();
}
function build(){
  ensureOverrides();

  const existing=$('.hd20ApprovedLanding');
  if(existing){
    renderLive(existing);
    return true;
  }

  const nav=$('.beginnerNav');
  if(!nav)return false;

  const labels=$$('.cards .kpi small').slice(0,5).map(textOf);
  if(labels.length<5)return false;

  document.body.classList.add('hd20-approved-landing');

  const host=document.createElement('section');
  host.className='hd20ApprovedLanding';
  host.setAttribute('aria-label','승인 대시보드 첫 화면');
  host.innerHTML=`
    <div class="hd20ALNotice">
      <span>◀</span><b>알림</b>
      <span>5S 정기 Audit 및 고도화 후보 판정 일정을 확인하세요.</span>
      <button class="more" data-go="audit">더보기 +</button>
    </div>
    <div class="hd20ALKpis">
      ${labels.map((x,i)=>`
        <article class="hd20ALKpi ${['blue','orange','green','cyan','purple'][i]}" data-kpi="${i}" role="button" tabindex="0">
          <div class="kIcon">${['♙','⌕','✓','▤','♢'][i]}</div>
          <small>${x}</small><strong>—</strong>
          <div class="delta">GMES 판정 원천 기준</div>
          <div class="spark no-data"></div>
        </article>`).join('')}
    </div>
    <div class="hd20ALMetrics">
      <div class="hd20ALMetric"><b>고도화 후보</b><strong>—</strong><small>GMES 판정 원천</small></div>
      <div class="hd20ALMetric"><b>누적 확보</b><strong>—</strong><small>공식확정 누적</small></div>
      <div class="hd20ALMetric"><b>현재 유지</b><strong>—</strong><small>공식확정 중 유효</small></div>
      <div class="hd20ALMetric"><b>전환율(후보→유지)</b><strong>—</strong><small>동일 원천 산식</small></div>
      <div class="hd20ALMetric"><b>AUDIT 6개월 유지율</b><strong>—</strong><small>완료 Audit 원천 연계 필요</small></div>
      <div class="hd20ALMetric"><b>기한임박(3개월 AUDIT)</b><strong>—</strong><small>실제 Lifecycle</small></div>
    </div>
    <div class="hd20ALGrid">
      <article class="hd20ALPanel">
        <h3>고도화 작업장 3대 인정기준</h3>
        <div class="hd20Criteria">
          <div class="hd20Criterion"><div class="ci">◉</div><div><b>시각화·형적관리</b><p>핵심 정보의 시각화 및 형적관리 체계가 구현된 작업장</p></div><button data-criterion="0">상세 설명</button></div>
          <div class="hd20Criterion"><div class="ci">♙</div><div><b>인간공학적 Green Zone</b><p>작업자 안전·편의·효율을 고려한 인간공학적 작업공간 구현</p></div><button data-criterion="1">상세 설명</button></div>
          <div class="hd20Criterion"><div class="ci">↗</div><div><b>정량축소·정위치 변경을 통한 공간 활용</b><p>정량 축소 및 정위치 변경을 통해 작업공간을 효율적으로 활용</p></div><button data-criterion="2">상세 설명</button></div>
        </div>
      </article>
      <article class="hd20ALPanel">
        <h3>5S 고도화 수준 Map <small>(기존 판정 Level 기준)</small></h3>
        <div class="hd20LevelMap">
          ${[['Lv.1','기본'],['Lv.2','관리'],['Lv.3','체계'],['Lv.4','최적'],['Lv.5','선도']].map(x=>`<div class="hd20Level"><div class="lv">${x[0]}</div><div class="name">${x[1]}</div><div class="bar">${x[1]}</div><strong>—</strong><small>—</small></div>`).join('')}
        </div>
      </article>
      <article class="hd20ALPanel"><h3>최근 고도화 작업장 <small>(공식확정)</small></h3><div class="hd20Recent"></div></article>
    </div>
    <div class="hd20ALBottom">
      <article class="hd20ALPanel">
        <h3>월별 추이</h3>
        <div class="hd20Trends">
          ${[['orange','고도화 후보 발굴'],['green','고도화 작업장 신규 확보'],['blue','누적 고도화 작업장 확보'],['purple','현재 유지 작업장'],['navy','AUDIT 6개월 유지율']].map(x=>`<div class="hd20Trend ${x[0]}"><b>${x[1]}</b><div class="hd20TrendChart no-data"><span>시계열 원천 연동 전</span></div></div>`).join('')}
        </div>
      </article>
      <article class="hd20ALPanel"><h3>기한임박 점검 대상 <small>(3개월 AUDIT)</small></h3><div class="hd20Due"></div></article>
    </div>
    <div class="hd20ALFooter">
      <span>※ 데이터 기준 : 시스템 현재 데이터</span>
      <span>울산캠퍼스 5S 활동관리 시스템</span>
      <span>문의 : 생산혁신팀(5S 모듈)</span>
    </div>`;

  const anchor=nav.nextElementSibling?.classList.contains('beginnerHint')?nav.nextElementSibling:nav;
  anchor.insertAdjacentElement('afterend',host);

  host.addEventListener('click',e=>{
    const k=e.target.closest('[data-kpi]');
    if(k)openGrid(+k.dataset.kpi);
    const go=e.target.closest('[data-go]');
    if(go)navClick(go.dataset.go);
    const c=e.target.closest('[data-criterion]');
    if(c){
      const idx=+c.dataset.criterion;
      if(typeof window.openCriteriaFinal==='function')window.openCriteriaFinal(idx+1);
      else $$('.crit')[idx]?.click();
    }
  });
  host.addEventListener('keydown',e=>{
    const k=e.target.closest('[data-kpi]');
    if(k&&(e.key==='Enter'||e.key===' ')){
      e.preventDefault();
      openGrid(+k.dataset.kpi);
    }
  });

  renderLive(host);
  ['hd20-followup-updated','hd20-kpi-source-updated','hd20-gmes-5s-judged','hd20-gmes-5s-imported']
    .forEach(ev=>window.addEventListener(ev,()=>renderLive(host)));

  const audit={
    created:true,
    navCount:$$('.beginnerNav button').length,
    kpiCount:$$('.hd20ALKpi',host).length,
    metricCount:$$('.hd20ALMetric',host).length,
    criteriaCount:$$('.hd20Criterion',host).length,
    levelCount:$$('.hd20Level',host).length,
    trendCount:$$('.hd20Trend',host).length,
    source:host.dataset.liveSource
  };
  audit.valid=
    audit.navCount===7 &&
    audit.kpiCount===5 &&
    audit.criteriaCount===3 &&
    audit.levelCount===5 &&
    audit.trendCount===5 &&
    audit.source===GMES_KEY;
  window.HD20_APPROVED_LANDING_AUDIT=audit;
  document.documentElement.dataset.hd20ApprovedLanding=audit.valid?'1':'partial';
  return true;
}

function boot(){
  if(build())return;
  let n=0;
  const retry=()=>{
    if(build())return;
    if(++n<30)setTimeout(retry,60);
  };
  retry();
}

document.readyState==='loading'
  ? document.addEventListener('DOMContentLoaded',boot,{once:true})
  : boot();
})();
