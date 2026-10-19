/* 딥 리서치 전수 검증 — 최종 원인: 이 가드가 CATS를 6종으로 고정하고, MutationObserver로 DOM을
   지속 감시하며 select의 옵션·값을 매번 6종으로 강제 재작성하고 있었음. norm()이 '자주보전'이라는
   값을 '위험구역관리'로 강제 치환하는 레거시 로직까지 있어, audit-checklist-master.js·
   audit-checklist-enhance.js를 7종(설비 자주보전 포함)으로 고쳐도 이 가드가 화면에서 계속 6종으로
   되돌리고 있었음 — 그래서 "정리"가 12개로 늘어나는 것처럼 보였던 것(실제로는 '설비 자주보전' 6건이
   이 가드에 의해 실시간으로 "위험구역관리"→불일치 재귀 끝에 기본값 '정리'로 강제 변경됨). CATS에
   '설비 자주보전'을 추가하고, norm()의 레거시 치환을 "자주보전"→'설비 자주보전'으로 정정(더 이상
   다른 카테고리로 숨기지 않음). */
(()=>{const CATS=['정리','정돈','청소','시각화','위험구역관리','설비 자주보전','5S 고도화'];function norm(v){v=String(v||'').trim();if(v==='자주보전'||v==='설비보전')return'설비 자주보전';if(v==='습관화')return'위험구역관리';if(v==='고도화')return'5S 고도화';if(v==='시각화관리')return'시각화';return CATS.includes(v)?v:'정리'}
// HD-20 fix (2026-08-28): fix() previously rewrote select.innerHTML on every call,
// which is itself a childList mutation on document.body's subtree — re-triggering
// this file's own MutationObserver forever and pegging the render thread at ~90% CPU.
// optionsMatch() makes the write idempotent: skip the DOM write entirely once the
// select already reflects CATS + the correct selection, so the observer loop settles.
function optionsMatch(sel,cur){const opts=[...sel.options];if(opts.length!==CATS.length)return false;for(let i=0;i<CATS.length;i++){if(opts[i].textContent!==CATS[i])return false}return sel.value===cur}
function fix(){const root=document.getElementById('awAudit');if(!root)return false;root.querySelectorAll('.acTable select[data-f="cat"]').forEach(sel=>{const cur=norm(sel.value);if(optionsMatch(sel,cur))return;sel.innerHTML=CATS.map(c=>`<option${c===cur?' selected':''}>${c}</option>`).join('');sel.value=cur});root.querySelectorAll('.acFootNote').forEach(n=>{if(!n.dataset.taxGuard){n.dataset.taxGuard='1';n.textContent='AUDIT는 점검항목별 1~5 평가·판정·미흡사항을 관리하며, 5S 구분은 정리·정돈·청소·시각화·위험구역관리·설비 자주보전·5S 고도화 7개 기준으로 통일합니다.'}});return true}function boot(){fix();new MutationObserver(()=>fix()).observe(document.body,{childList:true,subtree:true});let n=0,t=setInterval(()=>{if(fix()||++n>50)clearInterval(t)},120)}document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot):boot()})();