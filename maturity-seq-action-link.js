(()=>{
/* Design 2: follow-up schedule is a data/service layer only.
 * Do not append panels into approvedFramework or rewrite Action Summary.
 */
const KEY='hd20GMES5SAutoImproveRawV1';
function load(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}}
function addMonths(d,n){const x=new Date(d);if(Number.isNaN(x.getTime()))return null;const day=x.getDate();x.setMonth(x.getMonth()+n);if(x.getDate()<day)x.setDate(0);return x}
function days(a,b){return Math.ceil((a-b)/86400000)}
function calc(){const now=new Date();return load().filter(x=>x.confirmed===true&&x.judgeState==='확정'&&x.judgedAt).map(x=>{const base=new Date(x.judgedAt);const mk=(d,label)=>{const diff=days(d,now);return{label,date:d,diff,state:diff<0?'경과':diff<=14?'기한임박':'예정'}};return{...x,follow:[mk(addMonths(base,1),'1개월 점검'),mk(addMonths(base,3),'3개월 AUDIT'),mk(addMonths(base,6),'6개월 AUDIT')]}})}
function summary(){const all=calc(),flat=all.flatMap(x=>x.follow.map(f=>({...f,team:x.team,workplace:x.workplace,title:x.title,id:x.id})));return{all,flat,one:flat.filter(x=>x.label==='1개월 점검'&&x.state!=='경과'),three:flat.filter(x=>x.label==='3개월 AUDIT'&&x.state!=='경과'),six:flat.filter(x=>x.label==='6개월 AUDIT'&&x.state!=='경과'),due:flat.filter(x=>x.state==='기한임박'),over:flat.filter(x=>x.state==='경과')}}
window.HD20MaturityFollowup={calc,summary};
function notify(){window.dispatchEvent(new CustomEvent('hd20-followup-updated',{detail:summary()}))}
['hd20-gmes-5s-judged','hd20-gmes-5s-imported'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(notify,80)));
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',notify,{once:true}):notify();
})();