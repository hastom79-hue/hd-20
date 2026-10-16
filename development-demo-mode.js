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
   const raw=localStorage.getItem(HC_KEY);
   let existing=[];try{const v=JSON.parse(raw||'[]');if(Array.isArray(v))existing=v}catch{}
   // Preserve every existing headcount row. Fill only teams without a master entry,
   // and mark synthetic additions explicitly for safe review/removal.
   const known=new Set(existing.map(r=>String(r.team||'').trim()));
   const missing=teams.filter(t=>!known.has(t));
   if(missing.length){const hc=missing.map((team,i)=>({team,headcount:20+(teams.indexOf(team)%6)*3,source:SRC,isDemo:true}));localStorage.setItem(HC_KEY,JSON.stringify([...existing,...hc]));}
   window.HD20_DEMO_HEADCOUNT_STATUS={masterTeams:teams.length,existing:existing.length,filled:missing.length};
 }catch{}
 const now=new Date(),ymd=d=>d.toISOString().slice(0,10),days=n=>{const d=new Date(now);d.setDate(d.getDate()-n);return ymd(d)};
 const weak=team=>/중형|성능|트러블/.test(team),strong=team=>/프레임|Boom/.test(team);
 const activity=[];teams.forEach((team,ti)=>{const count=weak(team)?20:strong(team)?32:28;for(let i=0;i<count;i++){const advancement=i%4===0;const criteria=advancement?(i===0||((Math.floor(i/4)+ti)%3===0)?3:2):(weak(team)?(i%3)+1:2);const approved=advancement&&criteria===3&&(i===0||(!weak(team)&&((Math.floor(i/4)+ti)%2===0)));const dropped=(advancement&&weak(team)&&i%8===0)||(approved&&i%16===0);activity.push({id:`DEMO-A-${ti}-${i}`,source:SRC,team,owner:`검증작업자-${String(ti+1).padStart(2,'0')}-${String(i%8+1).padStart(2,'0')}`,group:groupOf(team),date:days((i*3+ti)%120),type:advancement?'5S 고도화':['정리','정돈','청소','시각화','위험구역관리'][i%5],area:['조립라인','자재구역','공구실','검사대'][i%4],problem:['공구 위치 불명확','통로 적치','라벨 미흡','불용품 방치'][i%4],improvement:['형적관리','Green Zone','정위치 표기','정량축소'][i%4],status:approved?'완료':dropped?'이탈':advancement?'판정대기':i%7===0?'보완':'완료',candidate:advancement&&!approved,judgeState:approved?'확정':advancement?'판정대기':'',confirmed:approved,judgedAt:approved?days(Math.max(0,((i*3+ti)%120)-(9+(i*7+ti)%18))):'',criteriaCount:criteria,criteriaMatched:criteria,maintainState:dropped?'이탈':approved?'유지':'',attrition:dropped,visualization:criteria>=1,greenZone:criteria>=2,spaceUtilization:criteria>=3});}});
 // Demo-only: each team gets a distinct confirmed-case volume and a distinct retention rate.
 // Keep the canonical KPI predicates: advancement type, confirmed=true, judgeState='확정', and attrition state.
 teams.forEach((team,ti)=>{
   const own=activity.filter(r=>r.team===team&&r.type==='5S 고도화'&&r.confirmed===true&&r.judgeState==='확정');
   const target=11+ti;
   const retainedTarget=ti+1;
   own.forEach(r=>{r.attrition=true;r.maintainState='이탈'});
   for(let j=0;j<target-own.length;j++){
     activity.push({id:`DEMO-A-UNIQUE-${ti}-${j}`,source:SRC,team,owner:`검증작업자-${String(ti+1).padStart(2,'0')}`,group:groupOf(team),date:days((j*7+ti)%120),type:'5S 고도화',area:['조립라인','자재구역','검사대'][j%3],problem:'고도화 유지요건 점검',improvement:'3대 요건 보완 및 유지관리',status:'완료',candidate:false,judgeState:'확정',confirmed:true,judgedAt:days((j*7+ti)%120),criteriaCount:3,criteriaMatched:3,maintainState:'이탈',attrition:true,visualization:true,greenZone:true,spaceUtilization:true});
   }
   const confirmed=activity.filter(r=>r.team===team&&r.type==='5S 고도화'&&r.confirmed===true&&r.judgeState==='확정');
   confirmed.slice(0,retainedTarget).forEach(r=>{r.attrition=false;r.maintainState='유지'});
 });
 const audit=[];teams.forEach((team,ti)=>{for(let i=0;i<8;i++)audit.push({id:`DEMO-U-${ti}-${i}`,source:SRC,team,group:groupOf(team),date:days((i*7+ti)%150),auditDate:days(210+(i*7+ti)%150),finalEvaluation:i%5===0?'미흡':'적합',status:i%5===0?'재발':i%3===0?'관리중':'완료',result:i%5===0?'부적합':'적합',score:72+((ti*3+i*5)%27)});});
 /* actionCompleted()는 doneDate·action·(after 또는 afterEvidence)가 모두 있어야 '완료'로 인정하는데,
    이 데모 데이터가 after를 항상 빈 문자열로만 만들어 '기한 내 개선조치 완료율' 등 완료 기준 지표가
    데모 모드에서는 영원히 계산 불가능(분모 0)이던 결함을 발견해 완료 건에는 after도 채우도록 보강. */
 const action=[];
 const scenarios=[
  ['조립라인 A','유압호스 정리 및 누유 흔적 제거','호스 클램프 위치 수정·누유 점검','호스 간섭 제거 및 누유 점검표 확인'],
  ['제관 작업장','용접 지그 주변 불용품 적치','불용 지그 분류·보관구획 재설정','불용품 반출 및 지정구획 표시 완료'],
  ['부품 피킹존','자재 라벨과 현물 위치 불일치','랙 주소 재배치·피킹 라벨 교체','주소 일치 여부 샘플 확인'],
  ['도장 전처리','화학물질 보관구역 경계 표시 미흡','경계선 재도색·점검표 갱신','안전표시와 보관 상태 현장 확인'],
  ['최종검사장','검사공구 반납 위치 혼선','공구별 형적판·반납 표준 게시','검사 종료 후 정위치 확인'],
  ['Boom 조립라인','체결공구 케이블 통로 간섭','케이블 상부 배선·고정 클립 설치','작업자 동선 간섭 제거 확인'],
  ['프레임 제작장','절단 잔재물 분리배출 미흡','잔재물 전용함·수거 주기 지정','작업 종료 후 잔재물 분리 상태 확인'],
  ['자재 대기구역','선입선출 표기 및 구획 불명확','입고일 표지·FIFO 구획 정비','표지 부착 및 선입선출 점검'],
  ['품질 확인대','부적합품 격리구역 혼재','격리 태그·보관구획 분리','부적합품과 양품 구분 확인'],
  ['공용 공구실','공용 공구 수량 기준 불명확','정량표·반납 체크시트 정비','공구 정량과 재고 일치 확인']
 ];
 teams.forEach((team,ti)=>{
  const count=7+(ti*7%9);
  const completeCount=Math.max(2,Math.round(count*(0.38+(ti*13%43)/100)));
  for(let i=0;i<count;i++){
   const scenario=scenarios[(ti*3+i)%scenarios.length];
   const age=5+((ti*17+i*11)%88);
   const isDone=i<completeCount;
   const overdue=!isDone&&((ti+i*2)%4!==0);
   const lateDays=overdue?3+((ti*5+i*7)%34):0;
   const dueAge=overdue?lateDays:-1*((ti+i)%15+2);
   const createdAge=Math.max(age,dueAge+9);
   const dueDate=days(dueAge);
   const finishedAge=Math.max(0,dueAge+1+((ti+i)%6));
   const recur=isDone&&((ti*3+i)%13===0);
   action.push({id:`DEMO-X-${ti}-${i}`,source:SRC,isDemo:true,team,group:groupOf(team),
    createdAt:days(createdAge),dueDate,status:isDone?'완료':overdue?'기한초과':'진행중',
    doneDate:isDone?days(finishedAge):'',action:isDone?scenario[2]:overdue?scenario[2]+' (조치 진행 중)':scenario[2]+' (착수 예정)',
    after:isDone?scenario[3]:'',afterEvidence:'',evidenceNote:isDone?'가상 검증기록: '+scenario[3]+' (실제 사진 미첨부)':'',
    effectVerified:isDone&&!recur&&((ti+i)%5!==0),recurrenceState:recur?'재발':'미발생',
    title:scenario[1],problem:scenario[1],area:scenario[0],workplace:scenario[0],location:scenario[0],
    owner:`가상담당-${String((ti+i)%9+1).padStart(2,'0')}`,priority:overdue&&lateDays>20?'High':overdue?'Medium':'Low'
   });
  }
 });
 const preserve=k=>parse(k).filter(r=>!isDemo(r));localStorage.setItem(K.a,JSON.stringify([...preserve(K.a),...activity]));localStorage.setItem(K.u,JSON.stringify([...preserve(K.u),...audit]));localStorage.setItem(K.x,JSON.stringify([...preserve(K.x),...action]));localStorage.setItem(MARK,JSON.stringify({at:new Date().toISOString(),teams:teams.length,activity:activity.length,audit:audit.length,action:action.length,isolated:true,master:'HD20ProductionTeamMaster'}));
 const flag=()=>{if(document.getElementById('hd20DemoFlag'))return;const nav=document.querySelector('.beginnerNav');if(!nav)return;const el=document.createElement('div');el.id='hd20DemoFlag';el.textContent=`가상 검증데이터 · 팀 마스터 ${teams.length}개 팀 · Activity ${activity.length} / Audit ${audit.length} / Action ${action.length} · 운영DB 미저장`;el.style.cssText='padding:5px 12px;background:#eef7ff;border-bottom:1px solid #b9d9ef;color:#174e70;font-size:11px;font-weight:800';nav.insertAdjacentElement('afterend',el)};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',flag,{once:true});else flag();
 window.dispatchEvent(new CustomEvent('hd20-gmes-5s-imported'));
 window.dispatchEvent(new CustomEvent('hd20-kpi-source-updated'));
 if(!sessionStorage.getItem('hd20DemoSeedReloaded')){sessionStorage.setItem('hd20DemoSeedReloaded','1');location.reload()}
}
boot();
})();