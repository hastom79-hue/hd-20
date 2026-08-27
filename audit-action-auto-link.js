(()=>{
/* Design 2: improvement actions are created from actual Audit nonconformity only.
 * Calendar due dates remain reminders; a missed 1M/3M/6M date is not itself
 * an improvement problem and must not silently create an action case.
 */
const GMES_KEY='hd20GMES5SAutoImproveRawV1',ACTION_KEY='hd20ActionCasesV2',STYLE='auditActionAutoLinkStyle';
function load(k){try{return JSON.parse(localStorage.getItem(k)||'[]')}catch{return[]}}function save(k,v){localStorage.setItem(k,JSON.stringify(v))}
function norm(v){return String(v??'').trim()}
function actionId(srcId){return `AUDIT-NC-${String(srcId).replace(/[^a-zA-Z0-9가-힣_-]/g,'').slice(-24)}`}
function candidates(){return load(GMES_KEY).filter(x=>x.confirmed===true&&x.judgeState==='확정'&&(x.auditResult==='부적합'||x.maintainState==='부적합')).map(x=>({x: x,label:'Audit 부적합',reason:x.auditIssue||x.auditReason||'Audit에서 유지상태 부적합이 확인되어 개선조치가 필요합니다.'}))}
function sync(){const acts=load(ACTION_KEY),idx=new Set(acts.map(a=>a.id));let added=0;for(const c of candidates()){const id=actionId(c.x.id);if(idx.has(id))continue;acts.unshift({id,date:new Date().toISOString().slice(0,10),team:norm(c.x.team)||'미지정',workplace:norm(c.x.workplace||c.x.title)||'미지정',leader:'자동연결',email:'',problem:`[${c.label}] ${c.reason}`,due:'',before:'',evidence:'',status:'조치대기',created:new Date().toISOString(),source:'5S Audit 부적합 자동연결',sourceCaseId:String(c.x.id),sourceStage:'NC',autoCreated:true});idx.add(id);added++}if(added)save(ACTION_KEY,acts);updateBadge(added);return added}
function updateBadge(added){let b=document.querySelector('.hd20AutoActionBadge');const nav=[...document.querySelectorAll('[data-nav="action"],button')].find(x=>x.textContent.includes('문제점')&&x.textContent.includes('개선조치'));if(!nav)return;const pending=load(ACTION_KEY).filter(x=>x.status!=='완료').length;if(!b){b=document.createElement('span');b.className='hd20AutoActionBadge';nav.appendChild(b)}b.textContent=pending?String(pending):'';b.style.display=pending?'inline-flex':'none';if(added>0)b.title=`Audit 부적합 ${added}건이 개선조치에 자동 연계됨`}
function css(){if(document.getElementById(STYLE))return;const s=document.createElement('style');s.id=STYLE;s.textContent='.hd20AutoActionBadge{margin-left:6px;min-width:17px;height:17px;padding:0 5px;border-radius:999px;align-items:center;justify-content:center;background:#fff1e8;color:#b55d25;font-size:9px;font-weight:950;vertical-align:middle}.amCases tr[data-auto="1"] td:first-child:after{content:"AUTO";margin-left:5px;padding:1px 4px;border-radius:5px;background:#eef6fb;color:#47718d;font-size:7px;font-weight:950}';document.head.appendChild(s)}
function markActionRows(){const actions=load(ACTION_KEY);document.querySelectorAll('#amCaseRows tr').forEach(tr=>{const id=tr.querySelector('[data-id]')?.dataset.id;if(id&&actions.find(x=>x.id===id)?.autoCreated)tr.dataset.auto='1'})}
function boot(){css();sync();setTimeout(markActionRows,300)}
['hd20-gmes-5s-judged','hd20-gmes-5s-imported'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(sync,80)));
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();