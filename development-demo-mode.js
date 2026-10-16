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
 const weak=team=>/중형|성능|트러블/.test(team),strong=team=>/프레임|Boom/.test(team);
 const activity=[];teams.forEach((team,ti)=>{const count=weak(team)?20:strong(team)?32:28;for(let i=0;i<count;i++){const advancement=i%4===0;const criteria=advancement?(i===0||((Math.floor(i/4)+ti)%3===0)?3:2):(weak(team)?(i%3)+1:2);const approved=advancement&&criteria===3&&(i===0||(!weak(team)&&((Math.floor(i/4)+ti)%2===0)));const dropped=(advancement&&weak(team)&&i%8===0)||(approved&&i%16===0);activity.push({id:`DEMO-A-${ti}-${i}`,source:SRC,team,owner:`검증작업자-${String(ti+1).padStart(2,'0')}-${String(i%8+1).padStart(2,'0')}`,group:groupOf(team),date:days((i*3+ti)%120),type:advancement?'5S 고도화':['정리','정돈','청소','시각화','위험구역관리','설비 자주보전'][i%6],area:['조립라인','자재구역','공구실','검사대'][i%4],problem:['공구 위치 불명확','통로 적치','라벨 미흡','불용품 방치'][i%4],improvement:['형적관리','Green Zone','정위치 표기','정량축소'][i%4],status:approved?'완료':dropped?'이탈':advancement?'판정대기':i%7===0?'보완':'완료',candidate:advancement&&!approved,judgeState:approved?'확정':advancement?'판정대기':'',confirmed:approved,judgedAt:approved?days(Math.max(0,((i*3+ti)%120)-(9+(i*7+ti)%18))):'',criteriaCount:criteria,criteriaMatched:criteria,maintainState:dropped?'이탈':approved?'유지':'',attrition:dropped,visualization:criteria>=1,greenZone:criteria>=2,spaceUtilization:criteria>=3});}});
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
 const action=[];teams.forEach((team,ti)=>{for(let i=0;i<10;i++){const isDone=!(i%6===0||i%3===0),pendingVerify=isDone&&i%9===0;action.push({id:`DEMO-X-${ti}-${i}`,source:SRC,team,group:groupOf(team),createdAt:days((i*5+ti)%100),dueDate:days(Math.max(0,(i*5+ti)%100-14)),status:i%6===0?'기한초과':i%3===0?'진행중':'완료',doneDate:i%6===0||i%3===0?'':days(Math.max(0,(i*5+ti)%100-18)),action:'현장 5S 개선조치 시행',after:isDone?'개선 후 정위치·형적관리 적용 완료(현장 사진 첨부)':'',afterEvidence:'',evidenceNote:isDone?'개선 후 정위치·형적관리 적용 완료 (사진 증빙은 미첨부)':'',effectVerified:isDone&&!pendingVerify,recurrenceState:pendingVerify?'':i%5===0?'재발':'미발생',title:['정위치 보완','표준표기 개선','통로 적치 제거','Audit 재발 방지'][i%4]})}});
 const preserve=k=>parse(k).filter(r=>!isDemo(r));localStorage.setItem(K.a,JSON.stringify([...preserve(K.a),...activity]));localStorage.setItem(K.u,JSON.stringify([...preserve(K.u),...audit]));localStorage.setItem(K.x,JSON.stringify([...preserve(K.x),...action]));localStorage.setItem(MARK,JSON.stringify({at:new Date().toISOString(),teams:teams.length,activity:activity.length,audit:audit.length,action:action.length,isolated:true,master:'HD20ProductionTeamMaster'}));
 const flag=()=>{if(document.getElementById('hd20DemoFlag'))return;const nav=document.querySelector('.beginnerNav');if(!nav)return;const el=document.createElement('div');el.id='hd20DemoFlag';el.textContent=`가상 검증데이터 · 팀 마스터 ${teams.length}개 팀 · Activity ${activity.length} / Audit ${audit.length} / Action ${action.length} · 운영DB 미저장`;el.style.cssText='padding:5px 12px;background:#eef7ff;border-bottom:1px solid #b9d9ef;color:#174e70;font-size:11px;font-weight:800';nav.insertAdjacentElement('afterend',el)};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',flag,{once:true});else flag();
 window.dispatchEvent(new CustomEvent('hd20-gmes-5s-imported'));
 window.dispatchEvent(new CustomEvent('hd20-kpi-source-updated'));
 if(!sessionStorage.getItem('hd20DemoSeedReloaded')){sessionStorage.setItem('hd20DemoSeedReloaded','1');location.reload()}
}
boot();
})();