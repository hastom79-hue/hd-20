(()=>{
const ID='hd20HealthContextFinal';
function patchText(root=document){
 const reps=[['후보→인정 전환율','공식 판정 완료율'],['평균 인정 Lead Time','평균 판정 Lead Time'],['인정완료','판정완료'],['인정여부','판정결과'],['인정일','판정일'],['신규 인정 대기','판정 대기']];
 root.querySelectorAll('*').forEach(el=>{if(el.children.length===0&&el.textContent){let t=el.textContent;for(const [a,b] of reps)t=t.replaceAll(a,b);if(t!==el.textContent)el.textContent=t;}});
}
function apply(){
 const cards=[...document.querySelectorAll('.approvedSummary .asCard')];
 if(cards.length<6)return false;
 const set=(i,title,value,sub)=>{const c=cards[i];if(!c)return;const s=c.querySelector('small'),b=c.querySelector('b'),sp=c.querySelector('span');if(s)s.textContent=title;if(value&&b)b.textContent=value;if(sub&&sp)sp.textContent=sub;};
 set(0,'공식 판정 완료율','48%','12 / 25건 · 등록→판정');
 set(1,'평균 판정 Lead Time','21.8일','등록→판정완료 평균');
 // 3번째 카드는 maturity-map-drilldown.js가 고도화 수준으로 관리
 set(3,'6개월 유지율',null,'확정 사례 장기 유지');
 set(4,'Audit 부적합 재발률',null,'동일·유사 부적합 재발');
 set(5,'기한 내 개선조치 완료율',null,'목표기한 내 Close');
 [0,1,3,4,5].forEach(i=>{const c=cards[i];if(c?.dataset.healthContextBound==='1')return;c.dataset.healthContextBound='1';c?.addEventListener('click',()=>setTimeout(()=>patchText(document),30));});
 patchText(document);
 return true;
}
function boot(){let n=0;const run=()=>{if(apply())return;if(++n<40)setTimeout(run,120)};run()}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();