(()=>{
const REPLACE=new Map([
 ['후보→인정 전환율','후보→고도화 확보 전환율'],
 ['평균 인정 Lead Time','평균 고도화 확보 Lead Time'],
 ['1차 인정 합격률','1차 고도화 심사 합격률'],
 ['인정완료 12곳','확보완료 12곳'],
 ['인정여부','고도화 확보여부'],
 ['인정일','확보일']
]);
function patchText(root){
 if(!root)return;
 const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];while(w.nextNode())nodes.push(w.currentNode);
 nodes.forEach(n=>{const v=(n.nodeValue||'').trim();if(REPLACE.has(v))n.nodeValue=n.nodeValue.replace(v,REPLACE.get(v))});
}
function patchCards(){
 const cards=[...document.querySelectorAll('.approvedSummary .asCard')];if(!cards.length)return false;
 patchText(document.querySelector('.approvedSummary'));
 return true;
}
function watchModal(){
 const m=document.querySelector('.rgModal');if(!m)return false;
 patchText(m);
 if(m.dataset.healthTermWatch==='1')return true;
 m.dataset.healthTermWatch='1';
 new MutationObserver(()=>patchText(m)).observe(m,{subtree:true,childList:true,characterData:true});
 return true;
}
function boot(){let n=0;const run=()=>{const a=patchCards(),b=watchModal();if(a&&b)return;if(++n<40)setTimeout(run,120)};run()}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();