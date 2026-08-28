(()=>{
const GMES_KEY='hd20GMES5SAutoImproveRawV1',ACTION_KEY='hd20ActionCasesV2',STYLE='auditActionAutoLinkStyle';
function load(k){try{return JSON.parse(localStorage.getItem(k)||'[]')}catch{return[]}}function save(k,v){localStorage.setItem(k,JSON.stringify(v))}
function norm(v){return String(v??'').trim()}
function addMonths(iso,m){const d=new Date(iso);if(Number.isNaN(d.getTime()))return null;const x=new Date(d);x.setMonth(x.getMonth()+m);return x}
function ymd(d){return d?d.toISOString().slice(0,10):''}
function dueStatus(d){if(!d)return'예정';const t=new Date();t.setHours(0,0,0,0);const x=new Date(d);x.setHours(0,0,0,0);const diff=Math.round((x-t)/86400000);return diff<0?'경과':diff<=7?'기한임박':'예정'}
function actionId(srcId,stage){return `AUTO-${String(srcId).replace(/[^a-zA-Z0-9가-힣_-]/g,'').slice(-24)}-${stage}`}
function candidates(){const g=load(GMES_KEY).filter(x=>x.confirmed===true&&x.judgeState==='확정'&&x.judgedAt);const out=[];for(const x of g){for(const [stage,months,label] of [['1M',1,'1개월 정기점검'],['3M',3,'3개월 유효성 AUDIT'],['6M',6,'6개월 유효성 AUDIT']]){const due=addMonths(x.judgedAt,months),status=dueStatus(due);if(status==='경과')out.push({x,stage,label,due,status,reason:`${label} 예정일이 경과했습니다. 현장 유지상태 확인 및 필요 시 개선조치가 필요합니다.`})}if(x.auditResult==='부적합'||x.maintainState==='부적합'){out.push({x,stage:'NC',label:'Audit 부적합',due:new Date(),status:'부적합',reason:x.auditIssue||x.auditReason||'Audit 부적합 사례로 개선조치가 필요합니다.'})}}return out}
function sync(){const acts=load(ACTION_KEY),idx=new Set(acts.map(a=>a.id));let added=0;for(const c of candidates()){const id=actionId(c.x.id,c.stage);if(idx.has(id))continue;acts.unshift({id,date:new Date().toISOString().slice(0,10),team:norm(c.x.team)||'미지정',workplace:norm(c.x.workplace||c.x.title)||'미지정',leader:'자동연결',email:'',problem:`[${c.label}] ${c.reason}`,due:ymd(c.due),before:'',evidence:'',status:'조치대기',created:new Date().toISOString(),source:'5S 고도화 자동연결',sourceCaseId:String(c.x.id),sourceStage:c.stage,autoCreated:true});idx.add(id);added++}if(added)save(ACTION_KEY,acts);updateBadge(added);return added}
/* Per explicit request: no numeric badge on the nav bar. The underlying
 * auto-linking logic (creating an action case when a confirmed 고도화
 * 사례's 1M/3M/6M follow-up lapses, or an Audit comes back 부적합) is
 * unaffected -- only the always-visible count badge on the menu button
 * is removed. */
function updateBadge(added){document.querySelector('.hd20AutoActionBadge')?.remove()}
function css(){if(document.getElementById(STYLE))return;const s=document.createElement('style');s.id=STYLE;s.textContent=`.hd20AutoActionBadge{margin-left:6px;min-width:17px;height:17px;padding:0 5px;border-radius:999px;align-items:center;justify-content:center;background:#fff1e8;color:#b55d25;font-size:9px;font-weight:950;vertical-align:middle}.amCases tr[data-auto='1'] td:first-child:after{content:'AUTO';margin-left:5px;padding:1px 4px;border-radius:5px;background:#eef6fb;color:#47718d;font-size:7px;font-weight:950}`;document.head.appendChild(s)}
function markActionRows(){document.querySelectorAll('#amCaseRows tr').forEach(tr=>{const id=tr.querySelector('[data-id]')?.dataset.id;if(!id)return;const a=load(ACTION_KEY).find(x=>x.id===id);if(a?.autoCreated)tr.dataset.auto='1'})}
function boot(){css();sync();setTimeout(markActionRows,300);let timer=0;new MutationObserver(m=>{if(!m.some(x=>x.addedNodes.length))return;clearTimeout(timer);timer=setTimeout(markActionRows,120)}).observe(document.body,{childList:true,subtree:true})}
['hd20-gmes-5s-judged','hd20-gmes-5s-imported'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(sync,80)));
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();