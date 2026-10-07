(()=>{'use strict';
/* Visible demo data for an empty web workspace. Local-only: never sync to Supabase. */
if(window.HD20_VALIDATION_MODE)return;
const P=new URL(location.href).searchParams;if(P.get('demo')==='0')return;
const SRC='demo-seed',MARK='hd20VisibleDemoSeedV1',BACKUP='hd20ValidationBackupV1';
const K={a:'hd20GMES5SAutoImproveRawV1',u:'hd20AuditRandomDrawsV1',x:'hd20ActionCasesV2'};
const parseRaw=raw=>{try{const v=JSON.parse(raw||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
const parse=k=>parseRaw(localStorage.getItem(k));
const isDemo=r=>r?.source===SRC||String(r?.id||'').startsWith('DEMO-');
const isFixture=r=>r?.source==='web-validation-fixture'||String(r?.id||'').startsWith('VALID-');
const isProduction=r=>r&&!isDemo(r)&&!isFixture(r);
const prodCount=()=>Object.values(K).reduce((n,k)=>n+parse(k).filter(isProduction).length,0);
function hasRecoverableProductionBackup(){try{const b=JSON.parse(localStorage.getItem(BACKUP)||'null');if(!b?.values||typeof b.values!=='object')return false;return Object.values(K).some(k=>parseRaw(b.values[k]).some(isProduction))}catch{return false}}
if(prodCount()>0||hasRecoverableProductionBackup())return;
function boot(){
 const master=window.HD20ProductionTeamMaster,teams=master?.teamNames?.()||[];
 if(!teams.length){setTimeout(boot,80);return}
 const groupOf=team=>master?.groupOf?.(team)||'';
 window.HD20_DEMO_MODE=true;window.HD20_VALIDATION_ISOLATED=true;
 const now=new Date(),ymd=d=>d.toISOString().slice(0,10),days=n=>{const d=new Date(now);d.setDate(d.getDate()-n);return ymd(d)};
 const weak=team=>/중형|성능|트러블/.test(team),strong=team=>/프레임|Boom/.test(team);
 const activity=[];teams.forEach((team,ti)=>{const count=weak(team)?12:strong(team)?26:24;for(let i=0;i<count;i++)activity.push({id:`DEMO-A-${ti}-${i}`,source:SRC,team,group:groupOf(team),date:days((i*3+ti)%120),type:['정리','정돈','청소','시각화','위험구역관리'][i%5],area:['조립라인','자재구역','공구실','검사대'][i%4],problem:['공구 위치 불명확','통로 적치','라벨 미흡','불용품 방치'][i%4],improvement:['형적관리','Green Zone','정위치 표기','정량축소'][i%4],status:i%7===0?'보완':'완료',confirmed:!weak(team)&&i%4===0,criteriaCount:weak(team)?(i%3)+1:((i+ti)%4===0?3:2)});});
 const audit=[];teams.forEach((team,ti)=>{for(let i=0;i<8;i++)audit.push({id:`DEMO-U-${ti}-${i}`,source:SRC,team,group:groupOf(team),date:days((i*7+ti)%150),status:i%5===0?'재발':i%3===0?'관리중':'완료',result:i%5===0?'부적합':'적합',score:72+((ti*3+i*5)%27)});});
 const action=[];teams.forEach((team,ti)=>{for(let i=0;i<10;i++)action.push({id:`DEMO-X-${ti}-${i}`,source:SRC,team,group:groupOf(team),createdAt:days((i*5+ti)%100),dueDate:days(Math.max(0,(i*5+ti)%100-14)),status:i%6===0?'기한초과':i%3===0?'진행중':'완료',title:['정위치 보완','표준표기 개선','통로 적치 제거','Audit 재발 방지'][i%4]});});
 localStorage.setItem(K.a,JSON.stringify(activity));localStorage.setItem(K.u,JSON.stringify(audit));localStorage.setItem(K.x,JSON.stringify(action));localStorage.setItem(MARK,JSON.stringify({at:new Date().toISOString(),teams:teams.length,activity:activity.length,audit:audit.length,action:action.length,isolated:true,master:'HD20ProductionTeamMaster'}));
 const flag=()=>{if(document.getElementById('hd20DemoFlag'))return;const nav=document.querySelector('.beginnerNav');if(!nav)return;const el=document.createElement('div');el.id='hd20DemoFlag';el.textContent=`가상 검증데이터 · 팀 마스터 ${teams.length}개 팀 · Activity ${activity.length} / Audit ${audit.length} / Action ${action.length} · 운영DB 미저장`;el.style.cssText='padding:5px 12px;background:#eef7ff;border-bottom:1px solid #b9d9ef;color:#174e70;font-size:11px;font-weight:800';nav.insertAdjacentElement('afterend',el)};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',flag,{once:true});else flag();
 window.dispatchEvent(new CustomEvent('hd20-gmes-5s-imported'));
 window.dispatchEvent(new CustomEvent('hd20-kpi-source-updated'));
 if(!sessionStorage.getItem('hd20DemoSeedReloaded')){sessionStorage.setItem('hd20DemoSeedReloaded','1');location.reload()}
}
boot();
})();