(()=>{
const STYLE_ID='rgModalBootstrapStyle';
function ensureStyle(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
  .rgModal{position:fixed!important;inset:0!important;z-index:99999!important;display:none!important;align-items:center!important;justify-content:center!important;padding:28px!important;background:rgba(18,38,58,.28)!important;backdrop-filter:blur(4px)!important}
  .rgModal.on{display:flex!important}
  .rgBox{width:min(1180px,96vw)!important;max-height:88vh!important;display:flex!important;flex-direction:column!important;overflow:hidden!important;border:1px solid #c9d8e4!important;border-radius:16px!important;background:#ffffff!important;box-shadow:0 24px 70px rgba(31,62,88,.22)!important;color:#18364f!important}
  .rgHead{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:16px!important;padding:18px 20px!important;border-bottom:1px solid #d8e4ec!important;background:linear-gradient(135deg,#f7fbff,#edf5fb)!important}
  .rgHead b{font-size:19px!important;font-weight:950!important;letter-spacing:-.3px!important;color:#173a57!important}
  .rgHead button{width:34px!important;height:34px!important;border:1px solid #bfd0dd!important;border-radius:9px!important;background:#fff!important;color:#315d7c!important;font-size:22px!important;line-height:1!important;cursor:pointer!important}
  .rgHead button:hover{background:#edf5fb!important;border-color:#9fb8cb!important}
  .rgBody{overflow:auto!important;padding:16px 18px 20px!important;background:#f8fbfe!important}
  .rgTools{display:flex!important;justify-content:flex-end!important;margin:0 0 12px!important}
  .rgExport{padding:9px 13px!important;border:1px solid #aac5d8!important;border-radius:9px!important;background:#ffffff!important;color:#245d84!important;font-size:12px!important;font-weight:900!important;cursor:pointer!important;box-shadow:0 2px 6px rgba(29,72,104,.06)!important}
  .rgExport:hover{background:#eef6fb!important;border-color:#89abc2!important}
  .rgTable{width:100%!important;border-collapse:separate!important;border-spacing:0!important;min-width:760px!important;font-size:12.5px!important;color:#31495d!important;background:#ffffff!important;border:1px solid #d8e3eb!important;border-radius:10px!important;overflow:hidden!important}
  .rgTable thead th{position:sticky!important;top:0!important;z-index:2!important;padding:11px 12px!important;text-align:left!important;white-space:nowrap!important;background:#eaf2f7!important;color:#294a61!important;border-bottom:1px solid #cbd9e3!important;font-weight:950!important}
  .rgTable tbody td{padding:10px 12px!important;border-bottom:1px solid #e4ebf0!important;color:#31495d!important;background:#ffffff!important;vertical-align:middle!important}
  .rgTable tbody tr:nth-child(even) td{background:#f7fafc!important}
  .rgTable tbody tr:hover td{background:#eef6fb!important}
  .rgTable tbody tr:last-child td{border-bottom:0!important}
  .rgTable td b{color:#173a57!important;font-weight:950!important}
  .rgBadge{background:#e8f5eb!important;color:#2f7b45!important;border:1px solid #cde6d4!important}
  .rgBadge.wait{background:#fff4df!important;color:#9d6707!important;border-color:#efd9ab!important}
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