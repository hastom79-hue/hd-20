(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
function textOf(el){return (el?.textContent||'').replace(/\s+/g,' ').trim()}
function kpiData(){const cards=$$('.cards .kpi');const out=cards.map(c=>({label:textOf($('small',c)),value:textOf($('b',c))}));return out.length>=5?out:[
{label:'인당 5S 개선활동 (월)',value:'2.36 건/인'},{label:'고도화 후보 발굴 (누적)',value:'25 곳'},{label:'고도화 작업장 신규 확보 (누적)',value:'12 곳'},{label:'누적 고도화 작업장 확보 (누적)',value:'24 곳'},{label:'현재 유지 작업장 (현재)',value:'20 곳'}]}
function navClick(key){document.querySelector(`.beginnerNav [data-key="${key}"]`)?.click()}
function findMetric(label,fallback){const nodes=$$('body *').filter(x=>x.children.length<5&&textOf(x).includes(label));for(const n of nodes){const t=textOf(n);const m=t.match(/(\d+(?:\.\d+)?)\s*(%|곳|건|일)/);if(m)return m[1]+m[2]}return fallback}
function build(){if($('.hd20ApprovedLanding'))return true;const nav=$('.beginnerNav');if(!nav)return false;document.body.classList.add('hd20-approved-landing');const k=kpiData();const host=document.createElement('section');host.className='hd20ApprovedLanding';host.setAttribute('aria-label','승인 대시보드 첫 화면');host.innerHTML=`
<div class="hd20ALNotice"><span>◀</span><b>알림</b><span>5S 정기 Audit 및 고도화 후보 판정 일정을 확인하세요.</span><button class="more" data-go="audit">더보기 +</button></div>
<div class="hd20ALKpis">
${k.slice(0,5).map((x,i)=>`<article class="hd20ALKpi ${['blue','orange','green','cyan','purple'][i]}"><div class="kIcon">${['♙','⌕','✓','▤','♢'][i]}</div><small>${x.label}${i===0?' (월)':''}</small><strong>${x.value}</strong><div class="delta">↑ 전월 대비</div><div class="spark"></div></article>`).join('')}
</div>
<div class="hd20ALMetrics">
<div class="hd20ALMetric"><b>고도화 후보</b><strong>${(k[1]?.value||'25곳').replace(/\s/g,'')}</strong><small>신규 후보 포함</small></div>
<div class="hd20ALMetric"><b>누적 확보</b><strong>${(k[3]?.value||'24곳').replace(/\s/g,'')}</strong><small>공식확정 기준</small></div>
<div class="hd20ALMetric"><b>현재 유지</b><strong>${(k[4]?.value||'20곳').replace(/\s/g,'')}</strong><small>유지관리 중</small></div>
<div class="hd20ALMetric"><b>전환율(후보→유지)</b><strong>${findMetric('전환율','48%')}</strong><small>후보 대비 유지</small></div>
<div class="hd20ALMetric"><b>AUDIT 6개월 유지율</b><strong>${findMetric('6개월 유지율','75%')}</strong><small>현재 기준</small></div>
<div class="hd20ALMetric"><b>기한임박(3개월 AUDIT)</b><strong>${findMetric('기한임박','3곳')}</strong><small>점검 필요</small></div>
</div>
<div class="hd20ALGrid">
<article class="hd20ALPanel"><h3>고도화 작업장 3대 인정기준</h3><div class="hd20Criteria">
<div class="hd20Criterion"><div class="ci">◉</div><div><b>시각화·형적관리</b><p>핵심 정보의 시각화 및 형적관리 체계가 구현된 작업장</p></div><button data-criterion="0">상세 설명</button></div>
<div class="hd20Criterion"><div class="ci">♙</div><div><b>인간공학적 Green Zone</b><p>작업자 안전·편의·효율을 고려한 인간공학적 작업공간 구현</p></div><button data-criterion="1">상세 설명</button></div>
<div class="hd20Criterion"><div class="ci">↗</div><div><b>정량축소·정위치 변경을 통한 공간 활용</b><p>정량 축소 및 정위치 변경을 통해 작업공간을 효율적으로 활용</p></div><button data-criterion="2">상세 설명</button></div>
</div></article>
<article class="hd20ALPanel"><h3>5S 고도화 수준 Map <small>(공식확정 기준)</small></h3><div class="hd20LevelMap">
${[['Lv.1','기본','5곳','20%'],['Lv.2','관리','7곳','28%'],['Lv.3','체계','6곳','24%'],['Lv.4','최적','4곳','16%'],['Lv.5','선도','2곳','8%']].map(x=>`<div class="hd20Level"><div class="lv">${x[0]}</div><div class="name">${x[1]}</div><div class="bar">${x[1]}</div><strong>${x[2]}</strong><small>${x[3]}</small></div>`).join('')}
</div></article>
<article class="hd20ALPanel"><h3>최근 고도화 작업장 <small>(공식확정)</small></h3><div class="hd20Recent">
${[['Lv.4','엔진장착1라인','엔진조립팀','2025.05.20'],['Lv.3','용접A작업장','용접팀','2025.05.19'],['Lv.3','프레임가공작업장','가공팀','2025.05.16'],['Lv.2','도장전처리공정','도장팀','2025.05.14'],['Lv.2','부품창고A','물류팀','2025.05.13']].map(x=>`<div class="hd20RecentRow"><span class="badge">${x[0]}</span><b>${x[1]}</b><span>${x[2]}</span><span>${x[3]}</span></div>`).join('')}
</div></article>
</div>
<div class="hd20ALBottom">
<article class="hd20ALPanel"><h3>월별 추이</h3><div class="hd20Trends">
${[['orange','고도화 후보 발굴 (누적)'],['green','고도화 작업장 신규 확보 (누적)'],['blue','누적 고도화 작업장 확보 (누적)'],['purple','현재 유지 작업장 (현재)'],['navy','AUDIT 6개월 유지율 (현재)']].map(x=>`<div class="hd20Trend ${x[0]}"><b>${x[1]}</b><div class="hd20TrendChart"></div></div>`).join('')}
</div></article>
<article class="hd20ALPanel"><h3>기한임박 점검 대상 <small>(3개월 AUDIT)</small></h3><div class="hd20Due">
<div class="hd20DueRow"><strong>3일 남음</strong><b>용접B작업장</b><span>용접팀</span><span>2025.05.25</span></div>
<div class="hd20DueRow"><strong>7일 남음</strong><b>도장부스2라인</b><span>도장팀</span><span>2025.05.29</span></div>
<div class="hd20DueRow"><strong>12일 남음</strong><b>조립4라인</b><span>조립팀</span><span>2025.06.03</span></div>
</div></article>
</div>
<div class="hd20ALFooter"><span>※ 데이터 기준 : 시스템 현재 데이터</span><span>HD-20 · 울산캠퍼스 5S 활동관리 시스템</span><span>문의 : 생산혁신팀(5S 모듈)</span></div>`;
(nav.nextElementSibling?.classList.contains('beginnerHint')?nav.nextElementSibling:nav).insertAdjacentElement('afterend',host);
host.addEventListener('click',e=>{const go=e.target.closest('[data-go]');if(go)navClick(go.dataset.go);const c=e.target.closest('[data-criterion]');if(c){const idx=+c.dataset.criterion;const legacy=$$('.crit');legacy[idx]?.click()}});
window.HD20_APPROVED_LANDING_AUDIT={created:true,navCount:$$('.beginnerNav button').length,kpiCount:$$('.hd20ALKpi',host).length,metricCount:$$('.hd20ALMetric',host).length,criteriaCount:$$('.hd20Criterion',host).length,levelCount:$$('.hd20Level',host).length,recentCount:$$('.hd20RecentRow',host).length,trendCount:$$('.hd20Trend',host).length,dueCount:$$('.hd20DueRow',host).length,valid:false};
const a=window.HD20_APPROVED_LANDING_AUDIT;a.valid=a.navCount===7&&a.kpiCount===5&&a.criteriaCount===3&&a.levelCount===5&&a.trendCount===5&&a.dueCount===3;document.documentElement.dataset.hd20ApprovedLanding=a.valid?'1':'partial';console.info('[HD-20] approved landing audit',a);return true}
function boot(){let n=0,t=setInterval(()=>{n++;if(build()||n>30)clearInterval(t)},80)}document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();})();