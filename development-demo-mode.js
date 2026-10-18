(()=>{'use strict';
/* Visible demo data for an empty web workspace. Local-only: never sync to Supabase. */
if(window.HD20_VALIDATION_MODE)return;
const P=new URL(location.href).searchParams;if(P.get('demo')==='0'||P.get('validation')==='0')return;
/* Expose data visibility diagnostics without changing or overwriting production records. */
window.HD20_DATA_DIAGNOSTICS=()=>{const keys={activity:'hd20GMES5SAutoImproveRawV1',audit:'hd20AuditRandomDrawsV1',action:'hd20ActionCasesV2'};const read=k=>{try{const v=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};return Object.fromEntries(Object.entries(keys).map(([area,key])=>{const rows=read(key);return [area,{total:rows.length,demo:rows.filter(r=>r?.source==='demo-seed'||String(r?.id||'').startsWith('DEMO-')).length,production:rows.filter(r=>r?.source!=='demo-seed'&&!String(r?.id||'').startsWith('DEMO-')).length}]}))};
const SRC='demo-seed',MARK='hd20VisibleDemoSeedV1',BACKUP='hd20ValidationBackupV1';
const K={a:'hd20GMES5SAutoImproveRawV1',u:'hd20AuditRandomDrawsV1',x:'hd20ActionCasesV2'};
const parseRaw=raw=>{try{const v=JSON.parse(raw||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
const parse=k=>parseRaw(localStorage.getItem(k));
const isDemo=r=>r?.source===SRC||String(r?.id||'').startsWith('DEMO-');
const isFixture=r=>r?.source==='web-validation-fixture'||String(r?.id||'').startsWith('VALID-');
const isMeaningful=r=>r&&typeof r==='object'&&(String(r.team||'').trim()||String(r.title||r.problem||r.area||'').trim());
const isProduction=r=>isMeaningful(r)&&!isDemo(r)&&!isFixture(r);
const prodRows=()=>Object.values(K).flatMap(k=>parse(k).filter(isProduction));
const prodCount=()=>prodRows().length;
const canonicalProduction=()=>{const rows=prodRows();if(!rows.length)return false;const teams=window.HD20ProductionTeamMaster?.teamNames?.()||[];return rows.some(r=>teams.includes(String(r.team||'').trim())&&(String(r.id||'').trim()||String(r.date||r.createdAt||'').trim()));};
function hasRecoverableProductionBackup(){try{const b=JSON.parse(localStorage.getItem(BACKUP)||'null');if(!b?.values||typeof b.values!=='object')return false;return Object.values(K).some(k=>parseRaw(b.values[k]).some(isProduction))}catch{return false}}
/* Only protect identifiable canonical production data. Empty/stale placeholders must not keep the deployed UI at zero forever. */
/* User-approved: show the same validation rows in normal and ?demo=1 views.
   Keep source=demo-seed and never sync synthetic rows to the operational DB.
   Existing production rows are preserved by preserve() below. */
window.HD20_DEMO_VISIBLE_IN_NORMAL_MODE=true;
/* A stale session reload marker must not prevent a fresh demo after storage reset. */
if(!parse(K.a).some(isDemo))sessionStorage.removeItem('hd20DemoSeedReloaded');
function boot(){
 /* CI load fixtures must remain untouched for contract and capacity checks. */
 if(Object.values(K).some(k=>parse(k).some(r=>r?.source==='ci-load-fixture')))return;
 const master=window.HD20ProductionTeamMaster,teams=master?.teamNames?.()||[];
 if(!teams.length){setTimeout(boot,80);return}
 const groupOf=team=>master?.groupOf?.(team)||'';
 window.HD20_DEMO_MODE=true;window.HD20_VALIDATION_ISOLATED=true;
 /* 가상 데이터가 activity/audit/action은 채우면서 팀별 인원수(headcount)는 전혀 설정하지 않아,
    '인당 5S 개선활동' 등 인당 계산이 필요한 지표가 항상 '—'로 비어 보이던 결함을 발견해 보강.
    이미 저장된(실제 운영) 인원 마스터가 있으면 절대 덮어쓰지 않음. */
 try{
   const HC_KEY='hd20TeamHeadcountMasterV1';
   let hc=[];try{const parsed=JSON.parse(localStorage.getItem(HC_KEY)||'[]');if(Array.isArray(parsed))hc=parsed}catch{}
   const known=new Set(hc.map(x=>String(x.team||'').trim()));
   const missing=teams.filter(team=>!known.has(team));
   if(missing.length){localStorage.setItem(HC_KEY,JSON.stringify([...hc,...missing.map(team=>({team,headcount:20+(teams.indexOf(team)%6)*3,source:SRC,isDemo:true}))]));}
   window.HD20_DEMO_HEADCOUNT_STATUS={masterTeams:teams.length,existing:hc.length,filled:missing.length};
 }catch{}
 const now=new Date(),ymd=d=>d.toISOString().slice(0,10),days=n=>{const d=new Date(now);d.setDate(d.getDate()-n);return ymd(d)};
 /* 사용자 지적: "한달에 요청사항이 96건이 될 수가 없다 현실적으로 데이터값 보정하라" — 기존
    date:days((i*3+ti)%120)은 "오늘로부터 0~119일 전" 좁은 구간(약 4개월)에만 몰려 특정 달(9월)에
    96건까지 쏠리고, 그보다 이전 달(1~7월)은 통째로 비어 있었음. 11·12월이 비는 건 '아직 안 온 미래
    달'이라 정상이지만, 1~7월이 비는 건 비정상(이미 지난 달인데 활동이 0건일 수 없음).
    사용자 가이드: "최대 팀마스터에 정의된 팀수 정도로... 팀당 2건이 최대라고 설정해보자"(엄격한 상한은
    아니지만 규모 가늠용) — 팀마다 연초(1월)~이번 달까지 활동을 거의 고르게 나눠 배정해, 팀당 월
    평균 2~3건(16개 팀 기준 공장 전체 월 30~50건 안팎)이 되도록 날짜를 재분산. */
 const elapsedMonths=now.getMonth()+1; // 1월=1 ... 현재월까지(올해 경과 개월 수)
 const spreadDate=(i,ti,seedA=7,seedB=11)=>{const mi=(i+ti*3)%elapsedMonths;const day=3+((i*seedA+ti*seedB)%24);const d=new Date(now.getFullYear(),mi,day);return d>now?ymd(now):ymd(d)};
 const addDaysStr=(dateStr,n)=>{const d=new Date(dateStr+'T00:00:00');d.setDate(d.getDate()+n);return d>now?ymd(now):ymd(d)};
 const weak=team=>/중형|성능|트러블/.test(team),strong=team=>/프레임|Boom/.test(team);
 const activity=[];teams.forEach((team,ti)=>{const count=weak(team)?20:strong(team)?32:28;for(let i=0;i<count;i++){const advancement=i%4===0;const criteria=advancement?(i===0||((Math.floor(i/4)+ti)%3===0)?3:2):(weak(team)?(i%3)+1:2);const approved=advancement&&criteria===3&&(i===0||(!weak(team)&&((Math.floor(i/4)+ti)%2===0)));const dropped=(advancement&&weak(team)&&i%8===0)||(approved&&i%16===0);activity.push({id:`DEMO-A-${ti}-${i}`,source:SRC,team,owner:`검증작업자-${String(ti+1).padStart(2,'0')}-${String(i%8+1).padStart(2,'0')}`,group:groupOf(team),date:spreadDate(i,ti),type:advancement?'5S 고도화':['정리','정돈','청소','시각화','위험구역관리','설비 자주보전'][i%6],area:['조립라인','자재구역','공구실','검사대'][i%4],problem:['공구 위치 불명확','통로 적치','라벨 미흡','불용품 방치'][i%4],improvement:['형적관리','Green Zone','정위치 표기','정량축소'][i%4],status:approved?'완료':dropped?'이탈':advancement?'판정대기':i%7===0?'보완':'완료',candidate:advancement&&!approved,judgeState:approved?'확정':advancement?'판정대기':'',confirmed:approved,judgedAt:approved?days(Math.max(0,((i*3+ti)%120)-(9+(i*7+ti)%18))):'',criteriaCount:criteria,criteriaMatched:criteria,maintainState:dropped?'이탈':approved?'유지':'',attrition:dropped,visualization:criteria>=1,greenZone:criteria>=2,spaceUtilization:criteria>=3});}});
 /* Approved realistic advancement fixture: 28 confirmed, 11 attrited, 17 retained.
    Preserve ordinary 5S activity counts and headcount; only normalize synthetic advancement cases. */
 const existingAdv=activity.filter(r=>r.type==='5S 고도화');
 existingAdv.forEach(r=>{r.confirmed=false;r.judgeState='판정대기';r.candidate=true;r.status='판정대기';r.attrition=false;r.maintainState='';r.judgedAt='';});
 const totalApproved=28,attrited=11;
 for(let i=0;i<totalApproved;i++){
   const ti=(i*7)%teams.length,team=teams[ti];
   const month=i>=totalApproved-3?now.getMonth()+1:1+(i%Math.max(1,now.getMonth()));
   const day=3+((i*5)%20);
   const confirmedDate=now.getFullYear()+'-'+String(month).padStart(2,'0')+'-'+String(Math.min(day,month===now.getMonth()+1?now.getDate():28)).padStart(2,'0');
   const lost=i<attrited;
   activity.push({id:'DEMO-A-ADV-REAL-'+i,source:SRC,team,group:groupOf(team),owner:'검증작업자-'+String(ti+1).padStart(2,'0'),date:confirmedDate,type:'5S 고도화',area:['조립라인','자재구역','검사대'][i%3],problem:'5S 고도화 3대 요건 확인',improvement:'시각화·Green Zone·공간활용 개선',status:'완료',candidate:false,judgeState:'확정',confirmed:true,judgedAt:confirmedDate,criteriaCount:3,criteriaMatched:3,maintainState:lost?'이탈':'유지',attrition:lost,visualization:true,greenZone:true,spaceUtilization:true});
 }
 /* Complete the current-year monthly chart with explicitly synthetic activity cases.
    Never invent future months; retain original records and never sync demo rows. */
 const year=now.getFullYear(),lastMonth=now.getMonth()+1;
 const monthCount=Array.from({length:lastMonth},()=>0);
 activity.forEach(r=>{const d=String(r.date||'');if(d.startsWith(year+'-')){const m=Number(d.slice(5,7));if(m>=1&&m<=lastMonth&&r.type!=='5S 고도화'&&r.status==='완료')monthCount[m-1]++}});
 for(let m=1;m<=lastMonth;m++){
   const target=12+((m*7)%11);
   for(let n=monthCount[m-1];n<target;n++){
     const ti=(m*5+n*3)%teams.length,team=teams[ti],kind=['정리','정돈','청소','시각화','위험구역관리','설비 자주보전'][(m+n)%6];
     activity.push({id:`DEMO-A-MONTH-${year}-${String(m).padStart(2,'0')}-${n}`,source:SRC,team,group:groupOf(team),owner:`검증작업자-${String(ti+1).padStart(2,'0')}-${n%8+1}`,date:`${year}-${String(m).padStart(2,'0')}-${String(Math.min(now.getDate(),2+(n*3)%25)).padStart(2,'0')}`,type:kind,area:['조립라인','자재구역','검사대','공구실'][(m+n)%4],problem:['불용품 잔존','공구 정위치 미준수','통로 적치','시각표기 누락'][(m+n)%4],improvement:['불용품 제거','형적관리 보완','통로 구획','표준 라벨 부착'][(m+n)%4],status:'완료',horizontalRollout:(m+n)%4===0,confirmed:false,judgeState:'',evidenceNote:'월별 차트 공백 보완용 가상 검증 사례 · 운영실적 아님'});
   }
 }
 /* Synthetic monthly rollout counts: non-monotonic, never exceeding eligible completions. */
 const rolloutByMonth=[9,14,7,12,10,19,13,24,17,21,0,0];
 for(let month=1;month<=lastMonth;month++){
   const key=year+'-'+String(month).padStart(2,'0');
   const eligible=activity.filter(row=>row.source===SRC&&row.status==='완료'&&row.type!=='5S 고도화'&&String(row.date||'').startsWith(key));
   eligible.forEach(row=>{row.horizontalRollout=false;row.rolloutApplied=false;row.rolloutState='';});
   const target=Math.min(eligible.length,rolloutByMonth[month-1]);
   eligible.sort((a,b)=>String(a.id).localeCompare(String(b.id)));
   for(let i=0;i<target;i++){eligible[i].horizontalRollout=true;eligible[i].rolloutApplied=true;eligible[i].rolloutState='수평전개 완료';}
 }
 const audit=[];teams.forEach((team,ti)=>{for(let i=0;i<8;i++)audit.push({id:`DEMO-U-${ti}-${i}`,source:SRC,team,group:groupOf(team),date:days((i*7+ti)%150),auditDate:days(210+(i*7+ti)%150),finalEvaluation:i%5===0?'미흡':'적합',status:i%5===0?'재발':i%3===0?'관리중':'완료',result:i%5===0?'부적합':'적합',score:72+((ti*3+i*5)%27)});});
 /* actionCompleted()는 doneDate·action·(after 또는 afterEvidence)가 모두 있어야 '완료'로 인정하는데,
    이 데모 데이터가 after를 항상 빈 문자열로만 만들어 '기한 내 개선조치 완료율' 등 완료 기준 지표가
    데모 모드에서는 영원히 계산 불가능(분모 0)이던 결함을 발견해 완료 건에는 after도 채우도록 보강. */
 /* 병합 메모: 다른 세션도 같은 결함(actionCompleted가 doneDate·action·(after|afterEvidence)를 요구하는데
    after가 항상 빈 문자열)을 독자적으로 발견해 afterEvidence/evidenceNote 필드를 추가했으나, 그 수정은
    after와 afterEvidence를 둘 다 비워둬 actionCompleted()가 여전히 통과하지 못하는 상태였음(결함 재발
    위험). 이쪽 after를 채우는 수정(완료 기준 지표 정상화)과 저쪽이 추가한 afterEvidence/evidenceNote
    필드를 모두 유지해 병합. '완료'된 조치 건 중 일부(i%9===0)는 아직 효과검증 전(effectVerified:false)
    으로 남겨 '검증대기' 큐도 실제로 보이게 함. */
 /* createdAt도 기존엔 days((i*5+ti)%100)으로 좁은 구간(최근 ~100일)에만 몰려 월별 완료 추이가
   편중됐음 — spreadDate()로 1월~이번 달까지 고르게 분산시키고, dueDate·doneDate는 그 등록일
   기준 +14일/+18일 뒤로 자연스럽게 파생(기존 간격은 유지, 분포만 보정). */
/* '기한초과'·'진행중'(=아직 미완료) 건까지 1~10월 전체에 분산시키면, 1월에 등록된 채 10월까지도
   안 끝난 것처럼 보여 평균 지연일이 100일을 넘는 비현실적인 값이 나왔음(완료 건은 과거 아무 때나
   등록돼 이미 끝났어도 괜찮지만, 미완료 건은 '최근에 발생한 지연'이어야 현실적) — 미완료 상태만
   최근 60일 이내로 등록일을 제한, 완료 건은 기존대로 1~10월 전체 분산 유지. */
const action=[];teams.forEach((team,ti)=>{for(let i=0;i<10;i++){const isDone=!(i%6===0||i%3===0),pendingVerify=isDone&&i%9===0,isLate=i%6===0,isProgress=i%3===0,createdAt=isDone?spreadDate(i,ti,5,9):days(14+((i*7+ti*5)%46));action.push({id:`DEMO-X-${ti}-${i}`,source:SRC,team,group:groupOf(team),createdAt,dueDate:addDaysStr(createdAt,14),status:isLate?'기한초과':isProgress?'진행중':'완료',doneDate:!isDone?'':addDaysStr(createdAt,11+((ti*3+i*7)%11)),action:'현장 5S 개선조치 시행',after:isDone?'개선 후 정위치·형적관리 적용 완료(현장 사진 첨부)':'',afterEvidence:'',evidenceNote:isDone?'개선 후 정위치·형적관리 적용 완료 (사진 증빙은 미첨부)':'',effectVerified:isDone&&!pendingVerify,recurrenceState:pendingVerify?'':i%5===0?'재발':'미발생',title:['정위치 보완','표준표기 개선','통로 적치 제거','Audit 재발 방지'][i%4]})}});
 /* Month-balanced completed action cases for trend validation (demo only). */
 for(let m=1;m<=now.getMonth()+1;m++){
   for(let j=0;j<8;j++){
     const ti=(m*5+j)%teams.length,team=teams[ti];
     const day=Math.min(4+j*2,m===now.getMonth()+1?now.getDate():28);
     const done=now.getFullYear()+'-'+String(m).padStart(2,'0')+'-'+String(day).padStart(2,'0');
     const start=addDaysStr(done,-(7+j%5));
     const due=addDaysStr(done,(j+m)%4===0?-2-(j%3):2+(j%3));
     action.push({id:'DEMO-X-MONTH-'+m+'-'+j,source:SRC,team,group:groupOf(team),createdAt:start,date:start,dueDate:due,targetDate:due,doneDate:done,status:'완료',action:'현장 정위치 및 표준표기 개선',after:'개선 후 현장 확인 완료',afterEvidence:'개선결과 확인',effectVerified:true,recurrenceState:j%6===0?'재발':'미발생',title:'월별 개선조치 검증',evidenceNote:'가상 검증 데이터 · 실제 운영실적 아님'});
   }
 }
 /* Populate month-scoped validation samples without inflating confirmed-case totals. */
 const localDate=(m,d)=>now.getFullYear()+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0');
 activity.filter(r=>String(r.id||'').startsWith('DEMO-A-ADV-REAL-')).forEach((r,i)=>{
   const judged=new Date(String(r.judgedAt)+'T12:00:00');
   judged.setDate(judged.getDate()-(3+i%8));
   r.date=ymd(judged);r.createdAt=r.date;r.regDate=r.date;
 });
 for(let m=1;m<=now.getMonth()+1;m++){
   for(let j=0;j<2;j++){
     const ti=(m*3+j)%teams.length,team=teams[ti];
     activity.push({id:'DEMO-A-JUDGE-QUEUE-'+m+'-'+j,source:SRC,team,group:groupOf(team),date:localDate(m,Math.min(3+j*5,now.getDate())),createdAt:localDate(m,Math.min(3+j*5,now.getDate())),type:'5S 고도화',candidate:true,confirmed:false,judgeState:'판정대기',status:'판정대기',criteriaMatched:2});
   }
 }
 /* Audit dates are at least six months before the relevant maintenance outcome. */
 audit.forEach((r,i)=>{
   const month=1+(i%Math.max(1,now.getMonth()+1));
   const end=new Date(now.getFullYear(),month-1,12);
   const start=new Date(end);start.setMonth(start.getMonth()-6);
   r.auditDate=ymd(start);r.date=ymd(end);
 });
 /* Keep one canonical synthetic advancement population for all summary widgets. */
 for(let i=activity.length-1;i>=0;i--){
   const row=activity[i];
   if(row.type==='5S 고도화'&&!String(row.id||'').startsWith('DEMO-A-ADV-REAL-')&&!String(row.id||'').startsWith('DEMO-A-JUDGE-QUEUE-'))activity.splice(i,1);
 }
 /* Team-level demo continuity: reserve months already occupied by confirmed cases,
    then distribute all non-confirmed synthetic activity into the same selected months.
    This prevents candidate/ordinary rows from filling every month again. */
 const demoContinuityAudit=[];
 teams.forEach((team,ti)=>{
   const rows=activity.filter(r=>r.source===SRC&&r.team===team);
   const fixed=rows.filter(r=>r.confirmed===true);
   const monthOf=r=>Number(String(r.date||'').slice(5,7));
   const occupied=new Set(fixed.map(monthOf).filter(m=>m>=1&&m<=elapsedMonths));
   const sparseTeam=/성능|트러블슈팅|자재운영/.test(team);
   const requestedMonths=/성능/.test(team)?1:/트러블슈팅|자재운영/.test(team)?2:null;
   const wheelLarge=/휠로더.*대형|대형.*휠로더/.test(team);
   const activeMain=/초대형|중형하부|중형메인/.test(team)||(/대형/.test(team)&&/메인/.test(team)&&!/휠로더/.test(team));
   const optionTeam=/옵션조립|옵션.*조립/.test(team);
   const target=requestedMonths?Math.min(elapsedMonths,requestedMonths):optionTeam?Math.min(elapsedMonths,5):wheelLarge?elapsedMonths:activeMain?Math.max(1,elapsedMonths-1):Math.min(elapsedMonths,Math.max(5,elapsedMonths-1-(ti%4)));
   const preference=Array.from({length:elapsedMonths},(_,i)=>i+1)
     .sort((a,b)=>((a*7+ti*11)%17)-((b*7+ti*11)%17)||a-b);
   if(sparseTeam||optionTeam)occupied.clear();
   for(const month of (sparseTeam?[1,Math.min(6,elapsedMonths)]:preference)){if(occupied.size>=target)break;occupied.add(month);}
   const chosen=[...occupied].sort((a,b)=>a-b);
   rows.filter(r=>sparseTeam||optionTeam||r.confirmed!==true).forEach((r,i)=>{
     const month=chosen[i%chosen.length];
     const day=Math.min(3+((i*5+ti*3)%23),month===elapsedMonths?now.getDate():28);
     const date=now.getFullYear()+'-'+String(month).padStart(2,'0')+'-'+String(day).padStart(2,'0');
     r.date=date;
     if(r.createdAt)r.createdAt=date;
     if(r.regDate)r.regDate=date;
   });
   const actual=new Set(rows.map(monthOf).filter(m=>m>=1&&m<=elapsedMonths));
   demoContinuityAudit.push({team,activeMonths:actual.size,elapsedMonths,activityCount:rows.length,months:[...actual].sort((a,b)=>a-b)});
 });
 window.HD20_DEMO_TEAM_CONTINUITY_AUDIT=demoContinuityAudit;
 /* Keep retention/attrition coherent with actual demo team activity continuity.
    Preserve the approved 28 confirmed / 11 attrited / 17 maintained totals. */
 const continuityByTeam=new Map(demoContinuityAudit.map(r=>[r.team,r.activeMonths]));
 const approvedPopulation=activity.filter(r=>r.source===SRC&&r.confirmed===true&&r.judgeState==='확정');
 const attritionPriority=[...approvedPopulation].sort((a,b)=>{
   const am=continuityByTeam.get(a.team)??elapsedMonths,bm=continuityByTeam.get(b.team)??elapsedMonths;
   return am-bm||String(a.id).localeCompare(String(b.id));
 });
 const attritedIds=new Set(attritionPriority.slice(0,11).map(r=>r.id));
 approvedPopulation.forEach(r=>{
   const lost=attritedIds.has(r.id);
   r.attrition=lost;
   r.maintainState=lost?'이탈':'유지';
   r.auditState=lost?'이탈':'유지';
   r.status=lost?'이탈':'완료';
 });
 window.HD20_DEMO_RETENTION_CONTINUITY_AUDIT=demoContinuityAudit.map(x=>{
   const confirmed=approvedPopulation.filter(r=>r.team===x.team);
   return {...x,confirmed:confirmed.length,attrited:confirmed.filter(r=>r.attrition===true).length,maintained:confirmed.filter(r=>r.attrition!==true).length};
 });
 const approvedCases=activity.filter(r=>r.type==='5S 고도화'&&r.confirmed===true&&r.judgeState==='확정');
 const lostCases=approvedCases.filter(r=>r.attrition===true);
 const keptCases=approvedCases.filter(r=>r.attrition!==true);
 const currentKey=String(now.getFullYear())+'-'+String(now.getMonth()+1).padStart(2,'0');
 const thisMonthCases=approvedCases.filter(r=>String(r.judgedAt||'').startsWith(currentKey));
 window.HD20_DEMO_ADVANCEMENT_AUDIT={confirmed:approvedCases.length,attrited:lostCases.length,retained:keptCases.length,currentMonth:thisMonthCases.length};
 if(approvedCases.length!==28||lostCases.length!==11||keptCases.length!==17||thisMonthCases.length!==3)console.warn('HD20 demo advancement totals differ from approved fixture',window.HD20_DEMO_ADVANCEMENT_AUDIT);
 const preserve=k=>parse(k).filter(r=>!isDemo(r));localStorage.setItem(K.a,JSON.stringify([...preserve(K.a),...activity]));localStorage.setItem(K.u,JSON.stringify([...preserve(K.u),...audit]));localStorage.setItem(K.x,JSON.stringify([...preserve(K.x),...action]));localStorage.setItem(MARK,JSON.stringify({at:new Date().toISOString(),teams:teams.length,activity:activity.length,audit:audit.length,action:action.length,isolated:true,master:'HD20ProductionTeamMaster'}));
 const flag=()=>{if(document.getElementById('hd20DemoFlag'))return;const nav=document.querySelector('.beginnerNav');if(!nav)return;const el=document.createElement('div');el.id='hd20DemoFlag';el.textContent=`가상 검증데이터 · 팀 마스터 ${teams.length}개 팀 · Activity ${activity.length} / Audit ${audit.length} / Action ${action.length} · 운영DB 미저장`;el.style.cssText='padding:5px 12px;background:#eef7ff;border-bottom:1px solid #b9d9ef;color:#174e70;font-size:11px;font-weight:800';nav.insertAdjacentElement('afterend',el)};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',flag,{once:true});else flag();
 window.dispatchEvent(new CustomEvent('hd20-gmes-5s-imported'));
 window.dispatchEvent(new CustomEvent('hd20-kpi-source-updated'));
 /* Re-notify after downstream dashboard listeners are registered (script loads before KPI modules). */
 const notifyAfterLoad=()=>{window.dispatchEvent(new CustomEvent('hd20-gmes-5s-imported'));window.dispatchEvent(new CustomEvent('hd20-kpi-source-updated'));window.HD20KPIData?.signal?.();};
 if(document.readyState==='complete')setTimeout(notifyAfterLoad,0);else window.addEventListener('load',notifyAfterLoad,{once:true});
 if(!sessionStorage.getItem('hd20DemoSeedReloaded')){sessionStorage.setItem('hd20DemoSeedReloaded','1');location.reload()}
}
boot();
})();