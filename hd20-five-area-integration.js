(()=>{'use strict';
const ID='hd20-five-area-integration';
if(window[ID])return;window[ID]=true;
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]));
function addAreaHeader(el,kicker,title,desc){if(!el||el.querySelector(':scope > .hd20AreaHeader'))return;const h=document.createElement('div');h.className='hd20AreaHeader';h.innerHTML=`<div><small>${esc(kicker)}</small><h2>${esc(title)}</h2><p>${esc(desc)}</p></div>`;el.prepend(h)}
function markOperationalScreens(){
  const activity=document.getElementById('awActivity');
  const audit=document.getElementById('awAudit');
  const action=document.getElementById('awAction');
  addAreaHeader(activity,'FIELD EXECUTION','5S 활동','6개 5S 유형의 현장 활동 등록·증빙·실행현황을 관리합니다. 현장 등록은 공식 고도화 확정과 분리됩니다.');
  addAreaHeader(audit,'SUSTAINABILITY','유지·Audit','Risk 가중 랜덤 대상 추출부터 실제 Audit 실시일 기준 6개월 지속관리·종료평가까지 관리합니다.');
  addAreaHeader(action,'CLOSED LOOP ACTION','개선조치','부적합·기한경과부터 BEFORE/AFTER, 효과검증, 재발관리까지 하나의 Case로 추적합니다.');
  if(activity)activity.dataset.area='activity';if(audit)audit.dataset.area='audit';if(action)action.dataset.area='action';
}
function integrateAdvancement(){
  const conversion=document.getElementById('performanceConversionAnalysis');
  const workplace=document.getElementById('awWorkplace');
  if(!conversion)return;
  addAreaHeader(conversion,'ADVANCEMENT CONTROL','고도화·판정','성과전환 분석, 고도화 후보, GMES 원천데이터, 공식판정, 확정사례와 고도화 수준을 하나의 화면으로 연결합니다.');
  conversion.dataset.area='advancement';
  let host=conversion.querySelector('.hd20AdvancementIntegrated');
  if(!host){host=document.createElement('section');host.className='hd20AdvancementIntegrated';conversion.appendChild(host)}
  if(workplace&&workplace.parentElement!==host){host.appendChild(workplace);workplace.classList.add('hd20IntegratedSubscreen');workplace.dataset.area='advancement'}
  if(workplace)workplace.classList.add('on');
}
function masterUtility(){
  const btn=document.getElementById('openMaster');if(btn){btn.textContent='⚙ 통합기준정보';btn.title='생산팀·목표·운영정책·6개 5S 유형·3대 판정기준'}
}
function normalizeLabels(){document.querySelectorAll('#performanceConversionAnalysis').forEach(root=>{root.querySelectorAll('*').forEach(el=>{if(el.children.length===0&&el.textContent?.includes('5S고도화'))el.textContent=el.textContent.replaceAll('5S고도화','5S 고도화')})})}
function refresh(){markOperationalScreens();masterUtility();integrateAdvancement();normalizeLabels()}
['hd20-open-performance-conversion','hd20-kpi-source-updated','hd20-gmes-5s-imported','hd20-gmes-5s-judged','hd20-action-updated'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(refresh,0)));
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>{refresh();setTimeout(refresh,250)},{once:true}):(()=>{refresh();setTimeout(refresh,250)})();
window.HD20_FIVE_AREA={refresh,areas:['dashboard','activity','advancement','audit','action']};
})();