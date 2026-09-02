(()=>{
function ensure(){
  let m=document.querySelector('.rgModal');
  if(m)return true;
  m=document.createElement('div');
  m.className='rgModal';
  m.setAttribute('role','dialog');
  m.setAttribute('aria-modal','true');
  m.setAttribute('aria-label','상세 Grid');
  m.innerHTML='<div class="rgBox"><div class="rgHead"><b>상세 Grid</b><button type="button" aria-label="닫기">×</button></div><div class="rgBody"></div></div>';
  document.body.appendChild(m);
  const close=()=>m.classList.remove('on');
  m.querySelector('.rgHead button').onclick=close;
  m.addEventListener('click',e=>{if(e.target===m)close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&m.classList.contains('on'))close()});
  return true;
}
function boot(){ensure();let n=0;const t=setInterval(()=>{ensure();if(++n>20)clearInterval(t)},250)}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();