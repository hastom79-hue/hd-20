(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const GMES_KEY='hd20GMES5SAutoImproveRawV1';
const ACTION_KEY='hd20ActionCasesV2';
function textOf(el){return (el?.textContent||'').replace(/\s+/g,' ').trim()}
function json(key,fallback=[]){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v??fallback}catch{return fallback}}
function load(){const v=json(GMES_KEY,[]);return Array.isArray(v)?v:[]}
function actions(){const v=json(ACTION_KEY,[]);return Array.isArray(v)?v:[]}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]))}
function asDate(v){if(!v)return null;const d=new Date(v);return Number.isNaN(d.getTime())?null:d}
function dateOnly(v){const d=asDate(v);return d?d.toISOString().slice(0,10):'—'}
function levelOf(x){const v=String(x?.level||x?.maturityLevel||x?.lv||'').match(/[1-5]/);return v?+v[0]:null}
function daysBetween(a,b){a=asDate(a);b=asDate(b);return a&&b?Math.max(0,Math.round((b-a)/86400000)):null}
function pick(x,keys){for(const k of keys){if(x?.[k]!==undefined&&x[k]!==null&&x[k]!=='')return x[k]}return null}
function pct(n,d){return d?Math.round(n/d*1000)/10:null}
function ensureOverrides(){
 if(document.getElementById('hd20ApprovedLandingRuntimeFix'))return;
 const s=document.createElement('style');s.id='hd20ApprovedLandingRuntimeFix';s.textContent=`
 .hd20ALKpi[role="button"]{cursor:pointer}.hd20ALKpi[role="button"]:focus{outline:2px solid #2b78bd;outline-offset:2px}
 .hd20TrendChart.no-data:before,.hd20TrendChart.no-data:after{display:none!important}.hd20TrendChart.no-data{display:grid;place-items:center;border:1px dashed #dce4eb!important;color:#8091a0}.hd20TrendChart.no-data span{font-size:8px;font-weight:800}.hd20ALKpi .spark.no-data:after{display:none!important}`;document.head.appendChild(s)
}
function snap(){
 if(window.HD20KPIData?.snapshot)return window.HD20KPIData.snapshot();
 const rows=load(),confirmed=rows.filter(x=>x?.confirmed===true&&x.judgeState==='확정');
 const maintained=confirmed.filter(x=>!/중지|부적합|해제|실패/.test(String(x.maintainState||x.auditState||x.status||''))&&x.valid!==false);
 return{rows,activities:rows,candidates:rows.filter(x=>x.judgeState&&x.judgeState!=='미확정'),newSecured:confirmed,confirmed,maintained,headcount:null,perPerson:null,year:new Date().getFullYear()}
}
function operational(s){
 const rows=s.rows||[];
 const judgmentScope=rows.filter(x=>x.candidate===true||x.isCandidate===true||String(x.judgeState||'').trim());
 const judged=judgmentScope.filter(x=>['확정','보완요청','미확정'].includes(String(x.judgeState||'').trim())&&pick(x,['judgedAt','judgeDate','confirmedAt']));
 const lead=judged.map(x=>daysBetween(pick(x,['createdAt','regDate','date','importedAt']),pick(x,['judgedAt','judgeDate','confirmedAt']))).filter(Number.isFinite);
 const levels=(s.confirmed||[]).map(levelOf).filter(Number.isFinite);
 const sixResults=(s.confirmed||[]).map(x=>String(pick(x,['audit6Result','audit6mResult','sixMonthAuditResult','audit6State','sixMonthState'])||'').trim()).filter(Boolean);
 const sixPass=sixResults.filter(v=>/적합|유효|유지|완료|pass|ok/i.test(v)&&!/부적합|실패|해제|중지/i.test(v)).length;
 const act=actions();
 const recRows=act.filter(x=>pick(x,['recurrence','recurrent','recurrenceState','재발여부'])!==null);
 const recurred=recRows.filter(x=>/true|1|yes|재발|발생/i.test(String(pick(x,['recurrence','recurrent','recurrenceState','재발여부'])))).length;
 const completed=act.filter(x=>pick(x,['doneDate','completedDate','finishDate']));
 const ontime=completed.filter(x=>{const done=asDate(pick(x,['doneDate','completedDate','finishDate'])),due=asDate(pick(x,['targetDate','due','dueDate']));return done&&due&&done<=due}).length;
 return{
  judgmentRate:pct(judged.length,judgmentScope.length),
  avgLead:lead.length?Math.round(lead.reduce((a,b)=>a+b,0)/lead.length*10)/10:null,
  maturity:levels.length?Math.round(levels.reduce((a,b)=>a+b,0)/levels.length*10)/10:null,
  sixRetention:pct(sixPass,sixResults.length),
  recurrence:pct(recurred,recRows.length),
  actionOnTime:pct(ontime,completed.filter(x=>pick(x,['targetDate','due','dueDate'])).length)
 }
}
function fmtValue(v,unit){if(v===null||v===undefined)return'—';return`${v}${unit?`<em>${unit}</em>`:''}`}
function renderKpis(host){
 const s=snap(),vals=[s.perPerson==null?null:s.perPerson.toFixed(2),s.candidates.length,s.newSecured.length,s.confirmed.length,s.maintained.length],units=['건/인','건','곳','곳','곳'];
 $$('.hd20ALKpi',host).forEach((c,i)=>{const strong=$('strong',c),delta=$('.delta',c);if(strong)strong.innerHTML=fmtValue(vals[i],vals[i]==null?'':units[i]);if(delta)delta.textContent=i===0&&!s.headcount?'인원 Master 미연결':'GMES 공식 판정 원천 기준'});
 const m=operational(s),metrics=$$('.hd20ALMetric',host),set=(i,v,u='')=>{const strong=metrics[i]&&$('strong',metrics[i]);if(strong)strong.textContent=v==null?'—':`${v}${u}`};
 set(0,m.judgmentRate,'%');set(1,m.avgLead,'일');set(2,m.maturity,' Lv');set(3,m.sixRetention,'%');set(4,m.recurrence,'%');set(5,m.actionOnTime,'%');
 host.dataset.kpiRows=String(s.rows.length)
}
function renderLive(host){
 const s=snap(),rows=s.confirmed||[];renderKpis(host);
 const recent=[...rows].sort((a,b)=>new Date(b.judgedAt||0)-new Date(a.judgedAt||0)).slice(0,5),recentBox=$('.hd20Recent',host);
 if(recentBox)recentBox.innerHTML=recent.length?recent.map((x,i)=>`<div class="hd20RecentRow${i===0?' hd20RecentTop':''}">${i===0?'<span class="hd20TrophyBadge">🏆 최신 확정</span>':''}<span class="badge">${levelOf(x)?'Lv.'+levelOf(x):'확정'}</span><b>${esc(x.workplace||x.title||'미지정')}</b><span>${esc(x.team||'미지정')}</span><span>${dateOnly(x.judgedAt)}</span></div>`).join(''):'<div class="hd20RecentRow"><span>3대 기준을 모두 충족한 공식확정 사례가 아직 없습니다 — 고도화 확정은 원래 쉽게 나오지 않는 성과입니다.</span></div>';
 const levels=[1,2,3,4,5].map(n=>rows.filter(x=>levelOf(x)===n).length),known=levels.reduce((a,b)=>a+b,0),maxLv=Math.max(1,...levels);
 $$('.hd20Level',host).forEach((el,i)=>{const strong=$('strong',el),small=$('small',el),fill=$('.hd20LevelFill',el);if(strong)strong.textContent=known?`${levels[i]}곳`:'—';if(small)small.textContent=known?`${Math.round(levels[i]/known*100)}%`:'—';if(fill)fill.style.width=known?`${Math.max(4,Math.round(levels[i]/maxLv*100))}%`:'2%'});
 const sum=window.HD20MaturityFollowup?.summary?.(),due=(sum?.three||[]).filter(x=>x.state==='기한임박').sort((a,b)=>a.diff-b.diff),dueBox=$('.hd20Due',host);
 if(dueBox)dueBox.innerHTML=due.length?due.slice(0,5).map(x=>`<div class="hd20DueRow"><strong>${Math.max(0,x.diff)}일 남음</strong><b>${esc(x.workplace||x.title||'미지정')}</b><span>${esc(x.team||'미지정')}</span><span>${dateOnly(x.date)}</span></div>`).join(''):`<div class="hd20DueRow"><span>${sum?'기한임박 3개월 AUDIT 대상 없음':'Lifecycle 산식 초기화 중'}</span></div>`;
 host.dataset.liveSource=GMES_KEY;host.dataset.liveRows=String(rows.length)
}
function openGrid(i){const card=$$('.cards .kpi')[i];if(card)card.click()}
function navClick(key){document.querySelector(`.beginnerNav [data-key="${key}"]`)?.click()}
function build(){
 ensureOverrides();const existing=$('.hd20ApprovedLanding');if(existing){renderLive(existing);return true}
 const nav=$('.beginnerNav');if(!nav)return false;const labels=$$('.cards .kpi small').slice(0,5).map(textOf);if(labels.length<5)return false;
 document.body.classList.add('hd20-approved-landing');const host=document.createElement('section');host.className='hd20ApprovedLanding';host.setAttribute('aria-label','승인 대시보드 첫 화면');
 host.innerHTML=`<div class="hd20ALNotice"><span>◀</span><b>알림</b><span>5S 정기 Audit 및 고도화 후보 판정 일정을 확인하세요.</span><button class="more" data-go="audit">더보기 +</button></div>
 <div class="hd20ALKpis">${labels.map((x,i)=>`<article class="hd20ALKpi ${['blue','orange','green','cyan','purple'][i]}" data-kpi="${i}" role="button" tabindex="0"><div class="kIcon">${['♙','⌕','✓','▤','♢'][i]}</div><small>${x}</small><strong>—</strong><div class="delta">GMES 공식 판정 원천 기준</div><div class="spark no-data"></div></article>`).join('')}</div>
 <div class="hd20ALMetrics">
  <div class="hd20ALMetric"><b>공식 판정 완료율</b><strong>—</strong><small>판정대상 대비 판정완료</small></div>
  <div class="hd20ALMetric"><b>평균 판정 Lead Time</b><strong>—</strong><small>등록일→판정일</small></div>
  <div class="hd20ALMetric"><b>고도화 수준</b><strong>—</strong><small>공식확정 Level 평균</small></div>
  <div class="hd20ALMetric"><b>6개월 유지율</b><strong>—</strong><small>실제 6개월 Audit 결과</small></div>
  <div class="hd20ALMetric"><b>Audit 부적합 재발률</b><strong>—</strong><small>실제 재발 이력 기준</small></div>
  <div class="hd20ALMetric"><b>기한 내 개선조치 완료율</b><strong>—</strong><small>실제 완료일·목표일 기준</small></div>
 </div>
 <div class="hd20ALGrid"><article class="hd20ALPanel"><h3>고도화 작업장 3대 판정기준</h3><div class="hd20Criteria">
  <div class="hd20Criterion"><div class="ci">◉</div><div><b>시각화·형적관리</b><p>핵심 정보의 시각화 및 형적관리 체계가 구현된 작업장</p></div><button data-criterion="0">상세 설명</button></div>
  <div class="hd20Criterion"><div class="ci">♙</div><div><b>인간공학적 Green Zone</b><p>작업자 안전·편의·효율을 고려한 인간공학적 작업공간 구현</p></div><button data-criterion="1">상세 설명</button></div>
  <div class="hd20Criterion"><div class="ci">↗</div><div><b>정량축소·정위치 변경을 통한 공간 활용</b><p>정량 축소 및 정위치 변경을 통해 작업공간을 효율적으로 활용</p></div><button data-criterion="2">상세 설명</button></div>
 </div></article>
 <article class="hd20ALPanel"><h3>5S 고도화 수준 Map <small>(기존 판정 Level 기준)</small></h3><div class="hd20LevelMap">${[['Lv.1','기본'],['Lv.2','관리'],['Lv.3','체계'],['Lv.4','최적'],['Lv.5','선도']].map(x=>`<div class="hd20Level"><div class="hd20LevelLabel"><b>${x[0]}</b><span>${x[1]}</span></div><div class="hd20LevelTrack"><div class="hd20LevelFill"></div></div><div class="hd20LevelStat"><strong>—</strong><small>—</small></div></div>`).join('')}</div></article>
 <article class="hd20ALPanel hd20AchievementPanel"><h3>🏆 최근 공식 확정 사례 <small>(3대 기준 모두 충족 · 어렵게 확보한 성과)</small></h3><div class="hd20Recent"></div></article></div>
 <div class="hd20ALBottom"><article class="hd20ALPanel"><h3>월별 추이</h3><div class="hd20Trends">${[['orange','고도화 후보 발굴'],['green','고도화 작업장 신규 확보'],['blue','누적 고도화 작업장 확보'],['purple','현재 유지 작업장'],['navy','AUDIT 6개월 유지율']].map(x=>`<div class="hd20Trend ${x[0]}"><b>${x[1]}</b><div class="hd20TrendChart no-data"><span>실제 시계열 데이터 없음</span></div></div>`).join('')}</div></article><article class="hd20ALPanel"><h3>기한임박 점검 대상 <small>(3개월 AUDIT)</small></h3><div class="hd20Due"></div></article></div>
 <div class="hd20ALFooter"><span>※ 데이터 기준 : 시스템 현재 데이터</span><span>울산캠퍼스 5S 활동관리 시스템</span><span>문의 : 생산혁신팀(5S 모듈)</span></div>`;
 const anchor=nav.nextElementSibling?.classList.contains('beginnerHint')?nav.nextElementSibling:nav;anchor.insertAdjacentElement('afterend',host);
 host.addEventListener('click',e=>{const k=e.target.closest('[data-kpi]');if(k)openGrid(+k.dataset.kpi);const go=e.target.closest('[data-go]');if(go)navClick(go.dataset.go);const c=e.target.closest('[data-criterion]');if(c){const idx=+c.dataset.criterion;if(typeof window.openCriteriaFinal==='function')window.openCriteriaFinal(idx+1);else $$('.crit')[idx]?.click()}});
 host.addEventListener('keydown',e=>{const k=e.target.closest('[data-kpi]');if(k&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openGrid(+k.dataset.kpi)}});
 renderLive(host);['hd20-followup-updated','hd20-kpi-source-updated','hd20-gmes-5s-judged','hd20-gmes-5s-imported','hd20-action-updated'].forEach(ev=>window.addEventListener(ev,()=>renderLive(host)));
 const audit={created:true,navCount:$$('.beginnerNav button').length,kpiCount:$$('.hd20ALKpi',host).length,metricCount:$$('.hd20ALMetric',host).length,criteriaCount:$$('.hd20Criterion',host).length,levelCount:$$('.hd20Level',host).length,trendCount:$$('.hd20Trend',host).length,source:host.dataset.liveSource};
 audit.valid=audit.navCount===7&&audit.kpiCount===5&&audit.metricCount===6&&audit.criteriaCount===3&&audit.levelCount===5&&audit.trendCount===5&&audit.source===GMES_KEY;window.HD20_APPROVED_LANDING_AUDIT=audit;document.documentElement.dataset.hd20ApprovedLanding=audit.valid?'1':'partial';return true
}
function boot(){if(build())return;let n=0;const retry=()=>{if(build())return;if(++n<30)setTimeout(retry,60)};retry()}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();