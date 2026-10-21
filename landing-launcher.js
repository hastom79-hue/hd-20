/* 사용자 지시: "웹 들어가면 바로 팝업창이 뜨면서 좌측에는 자율개선 등록 버튼 우측에는 개선요청 버튼
   이렇게 타고 동시에 타고 들어갈 수 있도록 팝업창 뒤에는 전체 조회 화면 뜨도록" —
   페이지 로드 시(세션당 1회) 두 개의 큰 선택 버튼을 가진 런처 팝업을 자동으로 띄운다. 배경은 평소
   기본 랜딩 화면(대시보드)이 그대로 보이고, 그 위에 반투명 오버레이로 얹힌다. 각 버튼은 기존 등록
   버튼을 그대로 재사용(클릭 시뮬레이션)해, 등록 로직 자체는 전혀 새로 만들지 않고 100% 재사용한다. */
(()=>{'use strict';
const SEEN_KEY='hd20LandingLauncherSeenV1';
function css(){
  if(document.getElementById('hd20LauncherStyle'))return;
  const s=document.createElement('style');
  s.id='hd20LauncherStyle';
  s.textContent=`
  #hd20Launcher{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(15,30,45,.55);backdrop-filter:blur(2px)}
  #hd20Launcher .hd20LnBox{width:min(720px,92vw);background:#fff;border-radius:16px;box-shadow:0 18px 50px rgba(10,30,50,.35);padding:28px 28px 22px;box-sizing:border-box}
  #hd20Launcher .hd20LnHead{text-align:center;margin-bottom:20px}
  #hd20Launcher .hd20LnHead b{display:block;font-size:19px;color:#0f2d4a;font-weight:900}
  #hd20Launcher .hd20LnHead span{display:block;margin-top:6px;font-size:13px;color:#5c7489}
  #hd20Launcher .hd20LnRow{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  #hd20Launcher .hd20LnCard{border:1.5px solid #dfe8ee;border-radius:13px;padding:22px 16px;text-align:center;cursor:pointer;background:#f8fbfd;transition:transform .12s,box-shadow .12s,border-color .12s}
  #hd20Launcher .hd20LnCard:hover{transform:translateY(-2px);box-shadow:0 10px 22px rgba(20,60,100,.14);border-color:#2c5f8a}
  #hd20Launcher .hd20LnCard .ic{font-size:30px;margin-bottom:8px}
  #hd20Launcher .hd20LnCard b{display:block;font-size:16px;color:#0f2d4a;font-weight:900;margin-bottom:4px}
  #hd20Launcher .hd20LnCard small{display:block;font-size:12.5px;color:#64798d;line-height:1.5}
  #hd20Launcher .hd20LnCard.left{border-color:#2c5f8a1a}
  #hd20Launcher .hd20LnCard.right{border-color:#c984161a}
  #hd20Launcher .hd20LnFoot{text-align:center;margin-top:18px}
  #hd20Launcher .hd20LnFoot button{border:0;background:transparent;color:#7c92a5;font-size:12.5px;cursor:pointer;text-decoration:underline}
  @media(max-width:560px){#hd20Launcher .hd20LnRow{grid-template-columns:1fr}}
  `;
  document.head.appendChild(s);
}
function close(){document.getElementById('hd20Launcher')?.remove();try{sessionStorage.setItem(SEEN_KEY,'1')}catch{}}
function clickWhenReady(findFn,tries){
  tries=tries||0;
  const el=findFn();
  if(el){el.click();return true}
  if(tries>40)return false;
  setTimeout(()=>clickWhenReady(findFn,tries+1),75);
  return null;
}
function goActivityRegister(){
  close();
  const tabBtn=()=>[...document.querySelectorAll('.beginnerNav button')].find(x=>x.textContent.includes('현장활동'));
  const b=tabBtn();if(b)b.click();
  setTimeout(()=>{
    clickWhenReady(()=>[...document.querySelectorAll('button')].find(x=>x.textContent.includes('5S 신규등록')));
  },350);
}
function goActionRegister(){
  close();
  const tabBtn=()=>[...document.querySelectorAll('.beginnerNav button')].find(x=>x.textContent.includes('개선조치'));
  const b=tabBtn();if(b)b.click();
  setTimeout(()=>{
    clickWhenReady(()=>[...document.querySelectorAll('button')].find(x=>x.textContent.includes('개선요청 등록')));
  },350);
}
function open(){
  if(document.getElementById('hd20Launcher'))return;
  css();
  const el=document.createElement('div');
  el.id='hd20Launcher';
  el.innerHTML=`<div class="hd20LnBox" role="dialog" aria-modal="true" aria-label="빠른 등록 선택">
    <div class="hd20LnHead"><b>오늘 등록할 내용을 선택하세요</b><span>선택 후 바로 해당 등록 화면으로 이동합니다 · 배경은 전체 조회 화면입니다</span></div>
    <div class="hd20LnRow">
      <div class="hd20LnCard left" data-ln="activity"><div class="ic">🧹</div><b>자율개선 등록</b><small>현장팀에서 자체적으로 개선한<br>활동을 등록하는 창구입니다</small></div>
      <div class="hd20LnCard right" data-ln="action"><div class="ic">📨</div><b>개선요청 등록</b><small>4개의 발굴 경로를 통해 3개 요청그룹에서<br>현장팀으로 개선조치 요청사항을 등록하는 창구입니다</small></div>
    </div>
    <div class="hd20LnFoot"><button type="button" data-ln="skip">건너뛰고 전체 조회 화면 바로 보기</button></div>
  </div>`;
  document.body.appendChild(el);
  el.querySelector('[data-ln="activity"]').addEventListener('click',goActivityRegister);
  el.querySelector('[data-ln="action"]').addEventListener('click',goActionRegister);
  el.querySelector('[data-ln="skip"]').addEventListener('click',close);
  el.addEventListener('click',e=>{if(e.target===el)close()});
  document.addEventListener('keydown',function esc(e){if(e.key==='Escape'){close();document.removeEventListener('keydown',esc)}});
}
function boot(){
  let seen=false;try{seen=sessionStorage.getItem(SEEN_KEY)==='1'}catch{}
  if(seen)return;
  // 메인 네비게이션이 그려질 때까지 대기한 뒤(배경이 "전체 조회 화면"으로 먼저 자리잡은 상태) 팝업을 띄움
  const tryOpen=(n)=>{
    n=n||0;
    if(document.querySelector('.beginnerNav button')){open();return}
    if(n>60)return;
    setTimeout(()=>tryOpen(n+1),100);
  };
  tryOpen();
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
