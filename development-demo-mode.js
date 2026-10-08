(()=>{'use strict';
/* Visible demo data for an empty web workspace. Local-only: never sync to Supabase. */
if(window.HD20_VALIDATION_MODE)return;
const P=new URL(location.href).searchParams;if(P.get('demo')==='0'||P.get('validation')==='0')return;
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
if(P.get('demo')!=='1'&&(canonicalProduction()||hasRecoverableProductionBackup())){
  window.HD20_DEMO_SUPPRESSED_REASON=canonicalProduction()?'production-data-present':'production-backup-present';
  const explain=()=>{if(document.getElementById('hd20DemoSuppressedNotice'))return;const nav=document.querySelector('.beginnerNav');if(!nav)return;const el=document.createElement('div');el.id='hd20DemoSuppressedNotice';el.setAttribute('role','status');el.style.cssText='padding:7px 12px;background:#fff4df;border-bottom:1px solid #e9ca8c;color:#66440d;font-size:12px;font-weight:700';const counts=Object.fromEntries(Object.entries(K).map(([name,key])=>[name,{total:parse(key).length,production:parse(key).filter(isProduction).length,demo:parse(key).filter(isDemo).length}]));window.HD20_DEMO_SUPPRESSION_COUNTS=counts;el.textContent=(window.HD20_DEMO_SUPPRESSED_REASON==='production-data-present'?'데이터 보호 모드 · 기존 운영데이터 감지':'데이터 보호 모드 · 복구 백업 감지')+` · Activity ${counts.a.total}건(운영 ${counts.a.production}) / Audit ${counts.u.total}건(운영 ${counts.u.production}) / Action ${counts.x.total}건(운영 ${counts.x.production}) · 원본 보존 · 가상데이터 자동생성 중단`;const btn=document.createElement('button');btn.type='button';btn.textContent='가상 검증데이터 보기';btn.style.cssText='margin-left:12px;padding:5px 10px;border:1px solid #b17b26;border-radius:6px;background:white;color:#66440d;font-weight:800;cursor:pointer';btn.addEventListener('click',()=>{const url=new URL(location.href);url.searchParams.set('demo','1');url.searchParams.delete('validation');location.assign(url.href)});el.appendChild(btn);nav.insertAdjacentElement('afterend',el)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',explain,{once:true});else explain();
  return;
}
/* A stale session reload marker must not prevent a fresh demo after storage reset. */
if(!parse(K.a).some(isDemo))sessionStorage.removeItem('hd20DemoSeedReloaded');
function boot(){
 const master=window.HD20ProductionTeamMaster,teams=master?.teamNames?.()||[];
 if(!teams.length){setTimeout(boot,80);return}
 const groupOf=team=>master?.groupOf?.(team)||'';
 window.HD20_DEMO_MODE=true;window.HD20_VALIDATION_ISOLATED=true;
 const now=new Date(),ymd=d=>d.toISOString().slice(0,10),days=n=>{const d=new Date(now);d.setDate(d.getDate()-n);return ymd(d)};
 const weak=team=>/중형|성능|트러블/.test(team),strong=team=>/프레임|Boom/.test(team);
 const activity=[];teams.forEach((team,ti)=>{const count=weak(team)?12:strong(team)?26:24;for(let i=0;i<count;i++){const advancement=i%4===0;const criteria=weak(team)?(i%3)+1:((i+ti)%4===0?3:2);const approved=advancement&&criteria===3&&!weak(team)&&i%8===0;const dropped=(advancement&&weak(team)&&i%8===0)||(approved&&i%16===0);activity.push({id:`DEMO-A-${ti}-${i}`,source:SRC,team,group:groupOf(team),date:days((i*3+ti)%120),type:advancement?'5S 고도화':['정리','정돈','청소','시각화','위험구역관리'][i%5],area:['조립라인','자재구역','공구실','검사대'][i%4],problem:['공구 위치 불명확','통로 적치','라벨 미흡','불용품 방치'][i%4],improvement:['형적관리','Green Zone','정위치 표기','정량축소'][i%4],status:approved?'완료':dropped?'이탈':advancement?'판정대기':i%7===0?'보완':'완료',candidate:advancement&&!approved,judgeState:approved?'확정':advancement?'판정대기':'',confirmed:approved,judgedAt:approved?days((i*3+ti)%100):'',criteriaCount:criteria,criteriaMatched:criteria,maintainState:dropped?'이탈':approved?'유지':'',attrition:dropped,visualization:criteria>=1,greenZone:criteria>=2,spaceUtilization:criteria>=3});}});
 const audit=[];teams.forEach((team,ti)=>{for(let i=0;i<8;i++)audit.push({id:`DEMO-U-${ti}-${i}`,source:SRC,team,group:groupOf(team),date:days((i*7+ti)%150),auditDate:days(210+(i*7+ti)%150),finalEvaluation:i%5===0?'미흡':'적합',status:i%5===0?'재발':i%3===0?'관리중':'완료',result:i%5===0?'부적합':'적합',score:72+((ti*3+i*5)%27)});});
 const action=[];teams.forEach((team,ti)=>{for(let i=0;i<10;i++)action.push({id:`DEMO-X-${ti}-${i}`,source:SRC,team,group:groupOf(team),createdAt:days((i*5+ti)%100),dueDate:days(Math.max(0,(i*5+ti)%100-14)),status:i%6===0?'기한초과':i%3===0?'진행중':'완료',doneDate:i%6===0||i%3===0?'':days(Math.max(0,(i*5+ti)%100-18)),action:'현장 5S 개선조치 시행',after:'',effectVerified:i%6!==0&&i%3!==0,recurrenceState:i%5===0?'재발':'미발생',title:['정위치 보완','표준표기 개선','통로 적치 제거','Audit 재발 방지'][i%4]});});
 const preserve=k=>parse(k).filter(r=>!isDemo(r));localStorage.setItem(K.a,JSON.stringify([...preserve(K.a),...activity]));localStorage.setItem(K.u,JSON.stringify([...preserve(K.u),...audit]));localStorage.setItem(K.x,JSON.stringify([...preserve(K.x),...action]));localStorage.setItem(MARK,JSON.stringify({at:new Date().toISOString(),teams:teams.length,activity:activity.length,audit:audit.length,action:action.length,isolated:true,master:'HD20ProductionTeamMaster'}));
 const flag=()=>{if(document.getElementById('hd20DemoFlag'))return;const nav=document.querySelector('.beginnerNav');if(!nav)return;const el=document.createElement('div');el.id='hd20DemoFlag';el.textContent=`가상 검증데이터 · 팀 마스터 ${teams.length}개 팀 · Activity ${activity.length} / Audit ${audit.length} / Action ${action.length} · 운영DB 미저장`;el.style.cssText='padding:5px 12px;background:#eef7ff;border-bottom:1px solid #b9d9ef;color:#174e70;font-size:11px;font-weight:800';nav.insertAdjacentElement('afterend',el)};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',flag,{once:true});else flag();
 window.dispatchEvent(new CustomEvent('hd20-gmes-5s-imported'));
 window.dispatchEvent(new CustomEvent('hd20-kpi-source-updated'));
 if(!sessionStorage.getItem('hd20DemoSeedReloaded')){sessionStorage.setItem('hd20DemoSeedReloaded','1');location.reload()}
}
boot();
})();