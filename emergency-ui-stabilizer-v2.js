(()=>{
const STYLE='hd20EmergencyStableStyleV2';
const CRITERIA=[
 ['시각화·형적관리','핵심 정보와 정상·이상 상태를 한눈에 식별할 수 있도록 시각화·형적관리 체계를 구현'],
 ['인간공학적 Green Zone','작업자 안전·편의·효율을 고려해 불필요한 동작과 이동을 최소화한 작업공간 구현'],
 ['정량축소·정위치 변경을 통한 공간 활용','불필요한 재고를 줄이고 정위치를 재설계하여 작업공간과 이동공간을 확보']
];
const STEPS=[
 ['1','후보 발굴','현장 등록','START',4,29],
 ['2','판정·확정','생산혁신팀·5S 모듈 공식 판정','판정일',17,36],
 ['3','1개월 점검','초기 정착·유지 확인','+1M',31,41],
 ['4','3개월 AUDIT','유효성·지속성 평가','+3M',45,46],
 ['5','6개월 AUDIT','장기 유지성 검증','+6M',59,37],
 ['6','수평전개','확정 우수사례 표준화·확산','EXPAND',73,23]
];
function style(){if(document.getElementById(STYLE))return;const s=document.createElement('style');s.id=STYLE;s.textContent=`
body:not(.navModeActivity) .top .controls{display:flex!important;visibility:visible!important;opacity:1!important}
body:not(.navModeActivity) .beginnerNav{display:grid!important;grid-template-columns:repeat(6,minmax(0,1fr))!important;visibility:visible!important;opacity:1!important}
body:not(.navModeActivity) .beginnerNav button{display:block!important;visibility:visible!important;opacity:1!important}
body:not(.navModeActivity) .approvedFramework{background:#fff!important;color:#173a57!important;border:1px solid #d5e2eb!important;box-shadow:0 8px 22px rgba(10,39,61,.08)!important}
body:not(.navModeActivity) .approvedFramework:before,.approvedFramework .afTitle{display:none!important}
.approvedFramework .afGrid{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;align-items:stretch!important}
.approvedFramework .afCriteria,.approvedFramework .afProcess{padding:11px 14px 9px!important;background:#fff!important}
.approvedFramework .afCriteria{border-right:1px solid #dfe8ee!important}
.approvedFramework .afSub{margin:0 0 8px!important;color:#173a57!important;font-size:14px!important;font-weight:950!important}
.approvedFramework .afCards{display:grid!important;grid-template-columns:1fr!important;gap:6px!important}
.approvedFramework .afCard{display:grid!important;grid-template-columns:34px minmax(0,1fr)!important;column-gap:9px!important;min-height:0!important;height:auto!important;padding:8px 10px!important;background:#fbfdff!important;border:1px solid #dbe6ed!important;box-shadow:none!important;overflow:visible!important}
.approvedFramework .afIcon{width:30px!important;height:30px!important;margin:0!important;border-radius:8px!important}
.approvedFramework .afCard b{font-size:12.3px!important;line-height:1.25!important;color:#173a57!important;white-space:normal!important;word-break:keep-all!important}
.approvedFramework .afCard p{margin:2px 0 0!important;font-size:10.3px!important;line-height:1.35!important;color:#667f90!important;white-space:normal!important;word-break:keep-all!important}
.approvedFramework .afCard:after{content:'상세 조건·사진 보기 →'!important;grid-column:2!important;position:static!important;display:block!important;margin-top:3px!important;font-size:9px!important;font-weight:900!important;color:#3174a8!important}
.approvedFramework .afRule{margin:6px 0 0!important;padding:5px 7px!important;font-size:9.4px!important;line-height:1.25!important;background:#eef6fb!important;color:#316987!important;border:1px solid #d4e5ef!important}
.approvedFramework .afSteps{display:none!important}.approvedFramework .seqTrackWrap{display:block!important;margin:0!important;padding:0!important;border:0!important;background:#fff!important}.approvedFramework .seqTrackTitle{display:none!important}
.approvedFramework .seqGantt{display:grid!important;grid-template-columns:116px minmax(0,1fr)!important;gap:2px 8px!important}
.approvedFramework .seqRow{display:contents!important}.approvedFramework .seqLabel{min-height:37px!important;display:flex!important;align-items:center!important;gap:6px!important;padding:1px 0!important}.approvedFramework .seqNum{width:21px!important;height:21px!important;flex:0 0 21px!important;border-radius:50%!important;display:grid!important;place-items:center!important;font-size:9.5px!important;font-weight:950!important}.approvedFramework .seqLabelText b{display:block!important;font-size:10.8px!important;line-height:1.15!important;color:#173a57!important}.approvedFramework .seqLabelText small{display:block!important;margin-top:1px!important;font-size:8px!important;line-height:1.15!important;color:#748a99!important}
.approvedFramework .seqLane{position:relative!important;min-height:37px!important;border:1px solid #edf2f6!important;border-radius:7px!important;background:#fbfdff!important;overflow:hidden!important}.approvedFramework .seqBar{position:absolute!important;top:5px!important;height:25px!important;border-radius:7px!important;display:flex!important;align-items:center!important;gap:5px!important;padding:0 7px!important;border:1px solid #bdd5e7!important;background:linear-gradient(90deg,#e9f4fc,#dceef9)!important;color:#173a57!important;white-space:nowrap!important}.approvedFramework .seqRow:nth-child(even) .seqBar{background:linear-gradient(90deg,#edf8f0,#def1e4)!important;border-color:#bfddc8!important}.approvedFramework .seqTime{padding:2px 5px!important;border-radius:999px!important;background:#fff!important;border:1px solid rgba(80,120,145,.2)!important;font-size:7.8px!important;font-weight:900!important}.approvedFramework .seqBarTitle{font-size:9.8px!important;font-weight:900!important;overflow:hidden!important;text-overflow:ellipsis!important}.approvedFramework .seqBar:after{display:none!important}
@media(max-width:1100px){body:not(.navModeActivity) .beginnerNav{grid-template-columns:repeat(3,1fr)!important}.approvedFramework .afGrid{grid-template-columns:1fr!important}.approvedFramework .afCriteria{border-right:0!important;border-bottom:1px solid #dfe8ee!important}}
`;document.head.appendChild(s)}
function controls(){const top=document.querySelector('.top');if(!top)return false;let c=top.querySelector('.controls');if(!c){c=document.createElement('div');c.className='controls';top.appendChild(c)}if(!c.children.length)c.innerHTML='<select><option>2026년 01월 ~ 현재 누계</option></select><select><option>전체 공장</option></select><button class="apply">적용</button><button id="openMaster">⚙ 통합기준정보</button><button>⇩ 다운로드</button>';return true}
function nav(){let n=document.querySelector('.beginnerNav');if(!n){n=document.createElement('nav');n.className='beginnerNav';document.querySelector('.top')?.insertAdjacentElement('afterend',n)}if(n.querySelectorAll('button').length<6)n.innerHTML='<button class="active" data-key="dashboard">① 대시보드<small>전체 현황·성과</small></button><button data-key="activity">② 5S 활동관리<small>개선활동 분석</small></button><button data-key="workplace">③ 고도화 작업장<small>기준·후보·판정·유지</small></button><button data-key="audit">④ Audit 관리<small>1·3·6개월 점검</small></button><button data-key="action">⑤ 문제점·개선조치<small>후속조치 관리</small></button><button data-key="master">⑥ 기준정보<small>팀·목표·판정기준</small></button>';
 n.querySelectorAll('button').forEach(b=>{if(b.dataset.stableBound==='1')return;b.dataset.stableBound='1';b.addEventListener('click',()=>{n.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));const k=b.dataset.key;if(k==='master'){document.getElementById('openMaster')?.click();return}const target=k==='dashboard'?document.querySelector('.cards'):k==='workplace'?document.querySelector('.approvedFramework'):k==='activity'?document.querySelector('.approvedAnalysis,.mainGrid'):k==='audit'?[...document.querySelectorAll('.card')].find(x=>x.textContent.includes('AUDIT')):document.querySelector('.workplaceDetailRecovery,.approvedRaw');target?.scrollIntoView({behavior:'smooth',block:'start'})})});return true}
function openCriteria(i){const source=[...document.querySelectorAll('.criteria .crit')][i];if(source){source.click();return}const card=document.querySelectorAll('.approvedFramework .afCard')[i];card?.dispatchEvent(new CustomEvent('hd20-open-criteria',{bubbles:true,detail:{index:i}}))}
function framework(){const fw=document.querySelector('.approvedFramework');if(!fw)return false;let grid=fw.querySelector('.afGrid');if(!grid){grid=document.createElement('div');grid.className='afGrid';fw.appendChild(grid)}let left=grid.querySelector('.afCriteria'),right=grid.querySelector('.afProcess');if(!left){left=document.createElement('div');left.className='afCriteria';grid.appendChild(left)}if(!right){right=document.createElement('div');right.className='afProcess';grid.appendChild(right)}
 left.innerHTML='<div class="afSub">고도화 작업장 3대 판정기준</div><div class="afCards">'+CRITERIA.map((x,i)=>'<div class="afCard" data-i="'+i+'" tabindex="0"><div class="afIcon">◆</div><div><b>'+x[0]+'</b><p>'+x[1]+'</p></div></div>').join('')+'</div><div class="afRule">현장 등록 후 생산혁신팀·5S 모듈의 공식 판정을 거쳐 확정된 사례만 고도화 실적에 반영합니다.</div>';
 left.querySelectorAll('.afCard').forEach((c,i)=>{c.onclick=()=>openCriteria(i);c.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openCriteria(i)}}});
 right.innerHTML='<div class="afSub">고도화 사례 판정·유지 SEQ</div><div class="seqTrackWrap"><div class="seqGantt">'+STEPS.map(s=>'<div class="seqRow"><div class="seqLabel"><span class="seqNum">'+s[0]+'</span><div class="seqLabelText"><b>'+s[1]+'</b><small>'+s[2]+'</small></div></div><div class="seqLane"><div class="seqBar" style="left:'+s[4]+'%;width:'+s[5]+'%"><span class="seqTime">'+s[3]+'</span><span class="seqBarTitle">'+s[1]+'</span></div></div></div>').join('')+'</div></div>';return true}
function run(){style();controls();nav();if(!framework())return false;document.documentElement.classList.add('hd20-ready');return true}
function boot(){let n=0;const retry=()=>{if(run())return;if(++n<30)setTimeout(retry,120);else document.documentElement.classList.add('hd20-ready')};retry()}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();