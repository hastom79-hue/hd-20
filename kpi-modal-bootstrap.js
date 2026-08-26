(()=>{
const STYLE_ID='rgModalBootstrapStyle';
function ensureStyle(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
  .rgModal{position:fixed!important;inset:0!important;z-index:99999!important;display:none!important;align-items:center!important;justify-content:center!important;padding:28px!important;background:rgba(2,12,24,.72)!important;backdrop-filter:blur(5px)!important}
  .rgModal.on{display:flex!important}
  .rgBox{width:min(1180px,96vw)!important;max-height:88vh!important;display:flex!important;flex-direction:column!important;overflow:hidden!important;border:1px solid #315a7d!important;border-radius:16px!important;background:linear-gradient(180deg,#0d223a 0%,#081a2f 100%)!important;box-shadow:0 24px 70px rgba(0,0,0,.5)!important;color:#eef7ff!important}
  .rgHead{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:16px!important;padding:18px 20px!important;border-bottom:1px solid #294b67!important;background:linear-gradient(135deg,#102c4a,#0b2139)!important}
  .rgHead b{font-size:19px!important;font-weight:950!important;letter-spacing:-.3px!important;color:#fff!important}
  .rgHead button{width:34px!important;height:34px!important;border:1px solid #436985!important;border-radius:9px!important;background:#132b43!important;color:#fff!important;font-size:22px!important;line-height:1!important;cursor:pointer!important}
  .rgHead button:hover{background:#1a3b5c!important}
  .rgBody{overflow:auto!important;padding:16px 18px 20px!important;background:#091b2e!important}
  .rgTools{display:flex!important;justify-content:flex-end!important;margin:0 0 12px!important}
  .rgExport{padding:9px 13px!important;border:1px solid #3e6f95!important;border-radius:9px!important;background:#123d65!important;color:#fff!important;font-size:12px!important;font-weight:900!important;cursor:pointer!important}
  .rgExport:hover{background:#185183!important}
  .rgTable{width:100%!important;border-collapse:separate!important;border-spacing:0!important;min-width:760px!important;font-size:12.5px!important;color:#dcebf7!important;background:#0b2036!important;border:1px solid #294d6a!important;border-radius:10px!important;overflow:hidden!important}
  .rgTable thead th{position:sticky!important;top:0!important;z-index:2!important;padding:11px 12px!important;text-align:left!important;white-space:nowrap!important;background:#123452!important;color:#fff!important;border-bottom:1px solid #3a607d!important;font-weight:950!important}
  .rgTable tbody td{padding:10px 12px!important;border-bottom:1px solid #1d3b54!important;color:#d5e4f0!important;background:#0c2238!important;vertical-align:middle!important}
  .rgTable tbody tr:nth-child(even) td{background:#0a1e32!important}
  .rgTable tbody tr:hover td{background:#12304c!important}
  .rgTable tbody tr:last-child td{border-bottom:0!important}
  .rgTable td b{color:#fff!important;font-weight:950!important}
  @media(max-width:760px){.rgModal{padding:12px!important}.rgBox{width:98vw!important;max-height:92vh!important}.rgHead{padding:14px!important}.rgBody{padding:12px!important}}
  `;
  document.head.appendChild(s);
}
function ensure(){
  ensureStyle();
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