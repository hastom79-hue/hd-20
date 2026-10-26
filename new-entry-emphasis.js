(()=>{'use strict';
/* Visual-only enhancer: keep all existing button events, IDs, and workflow logic unchanged. */
const SELECTOR='button,a,[role="button"]';
const isNewEntry=el=>/^\\?\+?\s*신규\s*등록\s*$/.test((el.textContent||'').replace(/\s+/g,' ').trim());
function enhance(root=document){
 if(root.nodeType!==1&&root.nodeType!==9)return;
 const candidates=[];
 if(root.nodeType===1&&root.matches?.(SELECTOR))candidates.push(root);
 root.querySelectorAll?.(SELECTOR).forEach(el=>candidates.push(el));
 for(const el of candidates)el.classList.toggle('hd20NewEntryEmphasis',isNewEntry(el));
}
function boot(){
 enhance();
 let pending=false;
 const observer=new MutationObserver(records=>{
  if(pending)return;
  if(!records.some(r=>r.type==='childList'||r.type==='characterData'))return;
  pending=true;
  requestAnimationFrame(()=>{pending=false;enhance()});
 });
 observer.observe(document.body,{subtree:true,childList:true,characterData:true});
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();