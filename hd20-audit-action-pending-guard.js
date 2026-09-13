(()=>{'use strict';
function api(){return window.HD20ActionAuditLinkage}
function clear(){api()?.clearPending?.()}
function modal(){return document.getElementById('hd20ActionRegisterModal')}
function bind(){document.addEventListener('click',e=>{const manual=e.target?.closest?.('#hd20ActionRegisterBtn');if(manual){clear();return}const m=modal();if(!m||!m.classList.contains('on'))return;if(e.target===m||e.target?.closest?.('.armClose'))setTimeout(clear,0)},true);document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal()?.classList.contains('on'))setTimeout(clear,0)},true);window.addEventListener('hd20-subtab-changed',()=>{const m=modal();if(!m?.classList.contains('on')&&api()?.readPending?.())clear()})}
window.HD20_AUDIT_ACTION_PENDING_GUARD={clear};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',bind,{once:true}):bind();
})();