/* HD-20 retention random-draw integrity gate. The existing draw handler remains the owner of sampling and saving. */
(()=>{'use strict';
const ACT='hd20ActionCasesV2',SELF='hd20GMES5SAutoImproveRawV1';
const norm=value=>String(value??'').trim();
const completed=new Set(['완료','개선완료','조치완료','종결','확정완료','종료','종결완료']);
const pending=/미완료|미확정|미종료|미종결|완료대기|완료예정|진행|대기|조치중|보완|반려|취소|기한경과/i;
const key=x=>norm(x?.improvementNo||x?.improvementNumber||x?.caseId||x?.activityId||x?.id);
const excluded=x=>x?.isDemo===true||x?.isTest===true||['demo-seed','e2e-fixture','web-validation-fixture'].includes(norm(x?.source));
const read=name=>{try{const list=JSON.parse(localStorage.getItem(name)||'[]');return Array.isArray(list)?list:null}catch{return null}};
function verify(self,actions){
 if(!Array.isArray(self)||!Array.isArray(actions))return {ok:false,reason:'개선사례 저장 형식이 올바르지 않습니다.'};
 const cases=[...self.filter(x=>!excluded(x)).map(x=>({x,kind:'자율개선'})),...actions.filter(x=>!excluded(x)).map(x=>({x,kind:'개선요청'}))];
 const ids=new Set();
 for(const {x,kind} of cases){
  const status=norm(x?.status||x?.activityStatus||x?.actionStatus);
  const positive=completed.has(status);
  const conflict=(x?.completed===true&&!!status&&!positive)||(x?.completed===false&&positive)||(positive&&pending.test(status));
  if(conflict)return {ok:false,reason:kind+' '+(key(x)||'(번호 없음)')+'의 완료 여부가 상태값과 모순됩니다.'};
  if(!positive&&x?.completed!==true)continue;
  const id=key(x);
  if(!id)return {ok:false,reason:kind+' 완료 사례에 원본 관리번호가 없습니다.'};
  const unique=kind+':'+id;
  if(ids.has(unique))return {ok:false,reason:'동일 구분의 완료 개선사례 관리번호가 중복됩니다: '+unique};
  ids.add(unique);
 }
 return {ok:true,count:ids.size};
}
document.addEventListener('click',event=>{
 const button=event.target?.closest?.('[data-rs-draw]');
 if(!button)return;
 const check=verify(read(SELF),read(ACT));
 if(check.ok)return;
 event.preventDefault();event.stopImmediatePropagation();
 window.alert('유지점검 랜덤 추출 중단: '+check.reason+' 관리자에게 원본 데이터 확인을 요청하세요.');
},true);
window.HD20RetentionDrawGuard={verify};
})();