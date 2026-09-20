(()=>{'use strict';
const Q='validation';
const teams=['대형메인팀','휠로더Front팀','대형Att.팀','휠로더리어팀','중형상부1팀','중형메인팀','중형Att팀','대형상부팀','프레임제작팀','휠로더메인팀','중형상부2팀','중형하부팀','Boom제작팀','초대형조립팀','성능팀','트러블슈팅팀'];
const cats=['정리','정돈','청소','청결','습관화','5S 고도화'];
const photos=['https://images.unsplash.com/photo-1565793298595-6a879b1d9492','https://images.unsplash.com/photo-1581092160562-40aa08e78837','https://images.unsplash.com/photo-1581092918056-0c4c3acd3789'];
const key={a:'hd20GMES5SAutoImproveRawV1',u:'hd20AuditRandomDrawsV1',x:'hd20ActionCasesV2'};
function enabled(){return new URL(location.href).searchParams.get(Q)==='1'}
function seed(){
 if(!enabled())return false;
 const a=Array.from({length:192},(_,i)=>{const advanced=i%6===5,candidate=advanced&&i%3!==0,confirmed=advanced&&i%4===1,d=`2026-${String(1+i%9).padStart(2,'0')}-${String(1+i%27).padStart(2,'0')}`;return{id:'VALID-A-'+String(i+1).padStart(3,'0'),date:d,regDate:d,type:cats[i%cats.length],team:teams[i%teams.length],workplace:`검증 작업장 ${1+i%48}`,problem:`검증용 현상 ${i+1}`,improvement:`검증용 개선 ${i+1}`,candidate,isCandidate:candidate,judgeState:confirmed?'확정':candidate?(i%5===0?'보완요청':'판정대기'):'미확정',confirmed,status:confirmed?(i%10===1?'유지관리':'확정'):(candidate?'판정대기':'완료'),maintainState:confirmed&&i%10===1?'미흡':'정상',valid:!(confirmed&&i%10===1),before:photos[i%photos.length],after:photos[(i+1)%photos.length],source:'web-validation-fixture'}});
 const u=Array.from({length:96},(_,i)=>{const d=`2026-${String(1+i%9).padStart(2,'0')}-${String(1+i%27).padStart(2,'0')}`;return{id:'VALID-U-'+String(i+1).padStart(3,'0'),date:d,auditDate:d,team:teams[i%teams.length],workplace:`검증 Audit 구역 ${1+i%32}`,auditResult:i%7===0?'미흡':'적합',finalEvaluation:i%11===0?'미흡':'적합',status:i%7===0?'개선요청':'6개월 관리중',source:'web-validation-fixture'}});
 const x=Array.from({length:128},(_,i)=>{const done=i%4!==0,overdue=!done&&i%3===0,d=`2026-${String(1+i%9).padStart(2,'0')}-${String(1+i%27).padStart(2,'0')}`;return{id:'VALID-C-'+String(i+1).padStart(3,'0'),registeredAt:d,date:d,team:teams[i%teams.length],workplace:`검증 조치 구역 ${1+i%40}`,problem:`검증 개선요청 ${i+1}`,action:done?`검증 완료조치 ${i+1}`:'',status:done?'완료':'조치대기',due:overdue?'2026-01-15':'2026-12-15',doneDate:done?'2026-09-12':'',effectVerified:done&&i%6!==0,effectState:done&&i%6!==0?'유효':'미검증',recurrence:done&&i%17===0,before:photos[(i+1)%photos.length],after:done?photos[(i+2)%photos.length]:'',source:'web-validation-fixture'}});
 const current={a:JSON.parse(localStorage.getItem(key.a)||'[]'),u:JSON.parse(localStorage.getItem(key.u)||'[]'),x:JSON.parse(localStorage.getItem(key.x)||'[]')};
 const ready=current.a.length===192&&current.u.length===96&&current.x.length===128&&current.a.every(v=>String(v.id||'').startsWith('VALID-A-'))&&current.u.every(v=>String(v.id||'').startsWith('VALID-U-'))&&current.x.every(v=>String(v.id||'').startsWith('VALID-C-'));
 if(ready)return false;
 localStorage.setItem(key.a,JSON.stringify(a));localStorage.setItem(key.u,JSON.stringify(u));localStorage.setItem(key.x,JSON.stringify(x));return true;
}
function banner(){if(!enabled())return;const b=document.createElement('div');b.id='hd20ValidationBanner';b.textContent='검증 데이터 모드 · Activity 192 / Audit 96 / Action 128 · 브라우저 로컬 전용';b.style.cssText='position:sticky;top:0;z-index:10050;padding:7px 12px;text-align:center;background:#fff3cd;border-bottom:1px solid #e3c66a;color:#664d03;font:800 12px/1.3 sans-serif';document.body.prepend(b)}
seed();if(enabled()){window.HD20_VALIDATION_MODE=true;if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',banner,{once:true});else banner()}
})();