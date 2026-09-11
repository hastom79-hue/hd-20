(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s);
function closeTop(){const targets=['#hd20ExactCaseDetail.on','#hd20RowDetail.on','#hd20ExactTraceModal.on','#hd20TraceModal.on'];for(const sel of targets){const el=$(sel);if(el){el.classList.remove('on');return true}}return false}
function bind(){document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if(closeTop()){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()}},true)}
window.HD20_MODAL_LAYER_GUARD={closeTop};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',bind,{once:true}):bind();
})();