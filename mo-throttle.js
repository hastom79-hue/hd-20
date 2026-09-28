/* 전체 문서(document/body)를 감시하는 MutationObserver의 콜백을 80ms 단위로 묶어 실행.
   여러 보호(guard) 스크립트가 DOM 변경마다 같은 검사를 수천 번 반복하고, 그 검사가 다시
   DOM을 바꿔 연쇄가 생겨 화면 전환이 13~30초 걸리던 문제를 줄이기 위한 공통 방어막.
   좁은 범위(특정 요소)만 감시하는 observer는 그대로 즉시 실행. 반드시 다른 스크립트보다 먼저 로드. */
(()=>{'use strict';
const Orig=window.MutationObserver;if(!Orig||Orig.__h20Throttled)return;
function T(cb){
  let broad=false,pending=[],timer=0;
  const real=new Orig(function(recs,obs){
    if(!broad)return cb.call(real,recs,obs);
    for(let i=0;i<recs.length;i++)pending.push(recs[i]);
    if(pending.length>4000)pending=pending.slice(-4000);
    if(timer)return;
    timer=setTimeout(()=>{timer=0;const r=pending;pending=[];cb.call(real,r,obs)},80);
  });
  const ob=real.observe.bind(real),tk=real.takeRecords.bind(real),dc=real.disconnect.bind(real);
  real.observe=function(t,o){if(t===document.body||t===document.documentElement||t===document)broad=true;return ob(t,o)};
  real.takeRecords=function(){const a=pending.concat(tk());pending=[];return a};
  real.disconnect=function(){clearTimeout(timer);timer=0;pending=[];return dc()};
  return real;
}
T.prototype=Orig.prototype;T.__h20Throttled=true;window.MutationObserver=T;
})();
