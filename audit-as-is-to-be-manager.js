(()=>{'use strict';
const KEY='hd20ActionCasesV2',ID='hd20AsIsToBeManager',MID='hd20ToBeModal';
const E=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rows=()=>{try{let x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x:[]}catch{return[]}};
const done=x=>x.completed===true||['완료','개선완료','조치완료','종결','확정완료','종료','종결완료'].includes(String(x.status||''));
const key=x=>String(x.id||x.caseId||x.improvementNo||'');
const plan=x=>String(x.toBePlan||x.actionText||x.action||x.improvement||'');
const due=x=>String(x.due||x.targetDate||x.dueDate||'').slice(0,10);
const after=x=>x.after||x.afterEvidence||x.afterImage||'';
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const phase=x=>done(x)?'완료':due(x)&&due(x)<today()?'기한경과':plan(x)?'조치중':'조치계획 대기';
const demo=x=>x.isDemo||x.isTest||['demo-seed','e2e-fixture','web-validation-fixture'].includes(String(x.source||''));
let filt={team:'',status:'',text:''};
let page=1;
const PAGE_SIZE=50;
function bootStyle(){if(document.getElementById('hd20ToBeStyle'))return;let s=document.createElement('style');s.id='hd20ToBeStyle';
s.textContent=' #awActivity[data-subview]:not([data-subview="tobe"]) #'+ID+'{display:none!important} #awAudit #hd20AuditActionMonitor{display:none!important}#'+ID+'{margin:12px 0;background:#fff;border:1px solid #d5e2eb;border-radius:12px;padding:18px;min-width:0}#'+ID+' .tgtitle{font-size:18px;font-weight:850;color:#1b455f}#'+ID+' .tgflow{background:#eef6fa;border-radius:8px;padding:12px;margin:12px 0;color:#315a73;font-size:13px;font-weight:700}#'+ID+' .tgfilter{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}#'+ID+' input,#'+ID+' select{padding:9px;border-radius:7px;border:1px solid #c5d8e5;min-width:130px}#'+ID+' .tgpanel{border:1px solid #dce6ed;border-radius:10px;margin:15px 0;overflow:hidden}#'+ID+' .tghead{padding:13px;background:#f1f7fa;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px}#'+ID+' .tgscroll{overflow-x:auto}#'+ID+' table{border-collapse:collapse;min-width:840px;width:100%;font-size:12.5px}#'+ID+' th{background:#eaf2f8;text-align:left;padding:10px}#'+ID+' td{border-top:1px solid #e3edf3;padding:10px;vertical-align:top}#'+ID+' button,.tobemodal button{border:1px solid #b8cedd;padding:9px 12px;background:white;border-radius:7px;color:#245775;font-weight:750;cursor:pointer}#'+ID+' button.primary,.tobemodal button.primary{background:#176896;border-color:#176896;color:#fff}.tobeoverlay{position:fixed;inset:0;z-index:2147483405;background:#0c2439a6;display:grid;place-items:center;padding:16px}.tobemodal{width:min(800px,98vw);max-height:92vh;overflow:auto;background:#fff;color:#27465c;border-radius:14px;padding:20px;box-shadow:0 20px 55px #10253555}.tobemodal header,.tobemodal footer{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:15px}.tobemodal footer{justify-content:flex-end;margin:16px 0 0}.tobemodal .origin{background:#edf6fa;padding:13px;border-radius:8px;white-space:pre-wrap;line-height:1.7;font-size:13px}.tobemodal .fields{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:15px}.tobemodal label{display:flex;flex-direction:column;gap:5px;font-size:13px;font-weight:700}.tobemodal .wide{grid-column:1/-1}.tobemodal input,.tobemodal textarea{box-sizing:border-box;width:100%;border:1px solid #c6d8e4;border-radius:7px;padding:10px;font:inherit}.tobemodal textarea{min-height:95px}.tobemodal .error{color:#af3333;font-size:12px}#hd20ActionRegisterModal #amResponse,#awAction #amResponse{display:none!important}@media(max-width:700px){.tobemodal .fields{grid-template-columns:1fr}}';s.textContent+=`
.tobeoverlay{padding:14px}
.tobemodal{width:min(1280px,98vw);padding:0;max-height:95vh;display:flex;flex-direction:column;overflow:hidden}
.tobemodal>header{flex:none;position:relative;z-index:1;margin:0;padding:16px 22px;border-bottom:1px solid #dce6ee;background:#fff}
.tobemodal>header strong{font-size:18px;color:#173d57}
.tobemodal .hd20TobeSideBySide{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.08fr);gap:0;min-height:0;overflow:auto;flex:1;background:#f7f9fb}
.tobemodal .hd20TobeAsIsPane,.tobemodal .hd20TobeToBePane{padding:20px 22px;min-width:0;box-sizing:border-box}
.tobemodal .hd20TobeAsIsPane{background:#f4f7f9;border-right:1px solid #dce6ed}
.tobemodal .hd20TobeToBePane{background:#fff}
.tobemodal .hd20TobePaneTitle{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-bottom:14px}
.tobemodal .hd20TobePaneTitle strong{font-size:16px;color:#173d57}
.tobemodal .hd20TobePaneTitle small{margin-left:auto;color:#718695;font-size:11px}
.tobemodal .hd20TobePaneBadge{background:#43596b;color:white;border-radius:6px;padding:6px 9px;font-size:11px;font-weight:900;letter-spacing:.3px}
.tobemodal .hd20TobePaneBadge.tobe{background:#176896}
.tobemodal .origin{background:#fff;border:1px solid #dce6ee;padding:15px;border-radius:10px;white-space:normal}
.tobemodal .origin>div:nth-child(2){display:grid!important;grid-template-columns:1fr!important;gap:14px!important}
.tobemodal .origin img{max-height:260px!important;height:auto!important;min-height:170px;object-fit:contain}
.tobemodal [data-tobe-leadtime]{margin:0 0 14px!important;border-left:4px solid #247cad!important;padding:13px!important}
.tobemodal .fields{margin:0;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:13px}
.tobemodal .fields label{font-size:12px;color:#36566b}
.tobemodal .fields textarea{min-height:86px}
.tobemodal>.error{margin:0;padding:0 22px;background:white}
.tobemodal>footer{flex:none;position:sticky;bottom:0;z-index:1;background:#fff;border-top:1px solid #dce6ee;padding:14px 22px;margin:0;box-shadow:0 -5px 16px #132b4010}
.tobemodal>footer button{min-width:98px}
@media(max-width:850px){.tobemodal .hd20TobeSideBySide{grid-template-columns:1fr}.tobemodal .hd20TobeAsIsPane{border-right:0;border-bottom:1px solid #dce6ee}.tobemodal .hd20TobeAsIsPane,.tobemodal .hd20TobeToBePane{padding:14px}.tobemodal .fields{grid-template-columns:1fr 1fr}}
@media(max-width:520px){.tobemodal .fields{grid-template-columns:1fr}.tobemodal .hd20TobePaneTitle small{margin-left:0}}

#hd20AsIsToBeManager .tgTop{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap}
#hd20AsIsToBeManager .tgIntro{margin:6px 0 0;font-size:12px;color:#637f93;line-height:1.5}
#hd20AsIsToBeManager .tgPending{background:#eff5f9;border:1px solid #d5e5ef;border-radius:9px;display:flex;align-items:center;gap:8px;padding:10px 14px;color:#245a7c}
#hd20AsIsToBeManager .tgPending strong{font-size:20px;font-variant-numeric:tabular-nums}
#hd20AsIsToBeManager .tgPending span{font-size:12px;font-weight:800}
#hd20AsIsToBeManager .tgRegister{white-space:nowrap;min-width:108px}
#hd20AsIsToBeManager .tgpanel{margin-bottom:0}
#hd20AsIsToBeManager td{line-height:1.5}
#hd20AsIsToBeManager .tgPagination{display:flex;justify-content:flex-end;align-items:center;flex-wrap:wrap;gap:12px;padding:12px 4px 2px;font-size:12px;color:#506b7d}
#hd20AsIsToBeManager .tgPagination button:disabled{opacity:.42;cursor:not-allowed}
`;document.head.appendChild(s)}
let searchDebounce=null;
function render(){let root=document.getElementById('awActivity');if(!root)return;bootStyle();let host=document.getElementById(ID);if(!host){host=document.createElement('section');host.id=ID;host.className='awCard';root.prepend(host)}if(host.parentElement!==root)root.prepend(host);
let all=rows().filter(x=>key(x)),view=all.filter(x=>(!filt.team||x.team===filt.team)&&(!filt.status||phase(x)===filt.status)&&(!filt.text||[key(x),x.team,x.workplace,x.problem,x.improvementRequest,plan(x)].some(z=>String(z||'').toLowerCase().includes(filt.text.toLowerCase()))));
const pageCount=Math.max(1,Math.ceil(view.length/PAGE_SIZE));
page=Math.min(Math.max(1,page),pageCount);
const visible=view.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE);
let teams=[...new Set(all.map(x=>x.team).filter(Boolean))].sort();
let table=(headers,body)=>'<div class="tgscroll"><table><thead><tr>'+headers.map(x=>'<th>'+x+'</th>').join('')+'</tr></thead><tbody>'+body+'</tbody></table></div>';
let to=visible.map(x=>'<tr><td><strong>'+E(key(x))+'</strong>'+(demo(x)?'<small style="display:block;color:#a16526">가상 검증자료</small>':'')+'<small style="display:block;color:#68849a">'+E(x.date||x.registeredAt||'—')+'</small></td><td>'+E(x.team||'—')+'<small style="display:block;color:#68849a">'+E(x.workplace||'—')+'</small></td><td>'+E(x.problem||x.improvementRequest||'—')+'</td><td>'+E(plan(x)||'조치내역 미등록')+'</td><td>'+E(x.assignee||x.actionOwner||'미지정')+'</td><td>'+E(due(x)||'—')+'</td><td>'+E(phase(x))+'</td><td><button class="primary tgRegister" data-tobe-open="'+E(key(x))+'">'+(done(x)?'조치결과 보기':plan(x)?'조치내역 수정':'조치내역 등록')+'</button></td></tr>').join('');
const pending=view.filter(x=>!done(x)&&!plan(x)).length;
host.innerHTML='<div class="tgTop"><div><div class="tgtitle">조치내역 등록·관리</div><p class="tgIntro">개선요청이 등록된 사례를 선택해 TO-BE 조치내역을 입력합니다. AS-IS 사진과 원본 요청내용은 조치등록 팝업에서 확인할 수 있습니다.</p></div><div class="tgPending"><strong>'+pending+'</strong><span>조치내역 미등록</span></div></div><div class="tgfilter"><select data-tobe-team><option value="">전체 생산팀</option>'+teams.map(x=>'<option>'+E(x)+'</option>').join('')+'</select><select data-tobe-status><option value="">전체 상태</option>'+['조치계획 대기','조치중','기한경과','완료'].map(x=>'<option>'+x+'</option>').join('')+'</select><input data-tobe-search placeholder="관리번호·팀·요청내용 검색"><button data-tobe-reset>초기화</button><span>조회 '+view.length+' / '+all.length+'건</span></div><section class="tgpanel"><div class="tghead"><b>개선요청별 TO-BE 조치내역</b><small>우측 [조치내역 등록]을 선택하여 내용을 입력하세요</small></div>'+table(['관리번호·요청일','생산팀·작업장','원본 개선요청','TO-BE 조치내역','조치담당자','조치기한','상태','조치등록·확인'],to||'<tr><td colspan="8" style="padding:26px;text-align:center;color:#718595">조회 가능한 개선요청이 없습니다.</td></tr>')+'</section><div class="tgPagination"><button type="button" data-tobe-prev '+(page<=1?'disabled':'')+'>이전</button><span>'+page+' / '+pageCount+' 페이지 · 페이지당 '+PAGE_SIZE+'건</span><button type="button" data-tobe-next '+(page>=pageCount?'disabled':'')+'>다음</button></div>';
host.querySelector('[data-tobe-team]').value=filt.team;host.querySelector('[data-tobe-status]').value=filt.status;host.querySelector('[data-tobe-search]').value=filt.text;
const flushSearch=()=>{if(searchDebounce!==null){clearTimeout(searchDebounce);searchDebounce=null;filt.text=host.querySelector('[data-tobe-search]')?.value||''}};
host.querySelector('[data-tobe-team]').onchange=e=>{flushSearch();filt.team=e.target.value;page=1;render()};
host.querySelector('[data-tobe-status]').onchange=e=>{flushSearch();filt.status=e.target.value;page=1;render()};
const search=host.querySelector('[data-tobe-search]');
search.oninput=e=>{
 const next=e.target.value;
 clearTimeout(searchDebounce);
 searchDebounce=setTimeout(()=>{
  searchDebounce=null;
  if(!host.isConnected||document.getElementById(ID)!==host||window.HD20_NAV?.active?.()!=='activity'||document.getElementById('awActivity')?.dataset.subview!=='tobe')return;
  filt.text=next;page=1;render();
  const restored=host.querySelector('[data-tobe-search]');
  if(restored){restored.focus({preventScroll:true});restored.setSelectionRange(next.length,next.length)}
 },180);
};
host.querySelector('[data-tobe-reset]').onclick=()=>{if(searchDebounce!==null){clearTimeout(searchDebounce);searchDebounce=null}filt={team:'',status:'',text:''};page=1;render()};
host.querySelector('[data-tobe-prev]').onclick=()=>{if(page>1){page--;render()}};
host.querySelector('[data-tobe-next]').onclick=()=>{if(page<pageCount){page++;render()}};
host.querySelectorAll('[data-tobe-open]').forEach(b=>b.onclick=()=>open(b.dataset.tobeOpen));host.hidden=root.dataset.subview!=='tobe'}
function open(id){const matches=rows().filter(x=>key(x)===String(id||''));if(!String(id||'').trim()||matches.length!==1)return alert(matches.length>1?'동일 관리번호의 개선요청이 중복되어 조치등록을 중단했습니다. 관리자에게 원본 확인을 요청하세요.':'원본 개선조치 없음');const c=matches[0];const currentOverlay=document.getElementById(MID);if(currentOverlay?.querySelector('[aria-busy="true"]')){window.alert('다른 개선조치로 이동하기 전에 현재 조치내역 저장이 완료되어야 합니다.');return}currentOverlay?.remove();
let overlay=document.createElement('div');overlay.className='tobeoverlay';overlay.id=MID;let locked=done(c);
const imageSrc=v=>typeof v==='string'&&(v.trim().startsWith('data:image/')||v.trim().startsWith('https://'))?v.trim():'';
const beforePhoto=[c.before,c.beforeImage,c.beforePhoto,c.beforeImageUrl,c.asIsPhoto,c.evidence].map(imageSrc).find(Boolean)||'';
const beforeContent=String(c.problem||c.beforeText||c.issue||c.description||c.improvementRequest||'원본 문제내용 미등록');
const requestContent=String(c.improvementRequest||c.requestDetails||c.problem||'개선요청 내용 미등록');
const baseDay=String(c.registeredAt||c.date||c.startDate||c.created||'').slice(0,10);
const calendarGap=(from,to)=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(from)||!/^\d{4}-\d{2}-\d{2}$/.test(to))return null;const diff=Math.round((Date.parse(to+'T00:00:00Z')-Date.parse(from+'T00:00:00Z'))/86400000);return diff<0?null:diff};
const leadDays=calendarGap(baseDay,today());
const leadText=leadDays===null?'요청일 미확인 · 산출 불가':leadDays+'일 / '+(leadDays/30).toFixed(2)+'개월 (30일=1개월)';

overlay.innerHTML='<section class="tobemodal" role="dialog" aria-modal="true" aria-label="TO-BE 조치등록"><header><strong>TO-BE 조치등록 · '+E(id)+'</strong><button data-close>닫기 ×</button></header><div class="origin"><b>AS-IS 원본 · 읽기 전용</b><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px;margin-top:12px;align-items:start"><div><strong>개선 전 사진</strong>'+(beforePhoto?'<img src="'+E(beforePhoto)+'" alt="AS-IS 원본 사진" style="display:block;margin-top:7px;width:100%;max-height:230px;object-fit:contain;background:#fff;border:1px solid #d3e0e9;border-radius:8px">':'<div style="margin-top:7px;background:#fff;padding:50px 10px;border:1px dashed #c6d7e4;border-radius:8px;text-align:center">개선 전 사진 미등록</div>')+'</div><div><strong>개선 전 문제내용</strong><div style="margin-top:7px;background:#fff;border:1px solid #d3e0e9;border-radius:8px;padding:12px;white-space:pre-wrap;overflow-wrap:anywhere">'+E(beforeContent)+'</div><strong style="display:block;margin-top:12px">개선 요청내용</strong><div style="margin-top:7px;background:#fff;border:1px solid #d3e0e9;border-radius:8px;padding:12px;white-space:pre-wrap;overflow-wrap:anywhere">'+E(requestContent)+'</div></div></div><div style="border-top:1px solid #d3e0e9;margin-top:12px;padding-top:10px">관리번호 '+E(id)+' · 생산팀 '+E(c.team||'—')+' · 작업장 '+E(c.workplace||'—')+' · 등록자 '+E(c.owner||c.registeredBy||c.auditor||'—')+'</div></div><div style="margin:12px 0;padding:12px;background:#edf5fc;border:1px solid #caddeb;border-radius:8px;font-weight:800;color:#174b70" data-tobe-leadtime>조치 리드타임 (요청등록 → 조치내역 등록): '+E(leadText)+'</div><div class="fields"><label class="wide">TO-BE 조치내용<textarea data-plan '+(locked?'readonly':'')+'>'+E(plan(c))+'</textarea></label><label>조치담당자<input data-owner '+(locked?'readonly':'')+' value="'+E(c.assignee||c.actionOwner||'')+'"></label><label>조치기한<input type="date" data-due '+(locked?'disabled':'')+' value="'+E(due(c))+'"></label><label>완료일<input type="date" data-finish '+(locked?'disabled':'')+' value="'+E(String(c.doneDate||c.completedAt||'').slice(0,10))+'"></label><label>AFTER 사진등록<input type="file" accept="image/png,image/jpeg,image/webp" data-photo '+(locked?'disabled':'')+'></label><label class="wide">조치 비고<textarea data-comment '+(locked?'readonly':'')+'>'+E(c.toBeComment||'')+'</textarea></label></div><p class="error" role="alert" data-error></p><footer><button data-close>닫기</button>'+(locked?'':'<button data-save>저장</button><button class="primary" data-complete>완료처리</button>')+'</footer></section>';document.body.appendChild(overlay);
// Two-pane execution UI: AS-IS source is read-only on the left; TO-BE work is on the right.
const dialog=overlay.querySelector('.tobemodal'),originPanel=dialog.querySelector('.origin'),leadPanel=dialog.querySelector('[data-tobe-leadtime]'),formPanel=dialog.querySelector('.fields');
const main=document.createElement('div');main.className='hd20TobeSideBySide';
const left=document.createElement('section');left.className='hd20TobeAsIsPane';left.setAttribute('aria-label','AS-IS 개선 전 원본');
const right=document.createElement('section');right.className='hd20TobeToBePane';right.setAttribute('aria-label','TO-BE 조치등록');
const asHeading=document.createElement('div');asHeading.className='hd20TobePaneTitle';asHeading.innerHTML='<span class="hd20TobePaneBadge">AS-IS</span><strong>개선 전 현황</strong><small>등록 원본 · 수정 불가</small>';
const toHeading=document.createElement('div');toHeading.className='hd20TobePaneTitle';toHeading.innerHTML='<span class="hd20TobePaneBadge tobe">TO-BE</span><strong>조치내역 등록</strong><small>조치계획 · AFTER 증빙</small>';
left.append(asHeading,originPanel);right.append(toHeading,leadPanel,formPanel);main.append(left,right);dialog.querySelector('header').insertAdjacentElement('afterend',main);
const close=(afterSave=false)=>{if(!afterSave&&(saving||overlay.querySelector('[aria-busy="true"]')))return;overlay.remove()};overlay.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>close());overlay.onclick=e=>{if(e.target===overlay)close()};
async function save(complete){let err=overlay.querySelector('[data-error]'),p=overlay.querySelector('[data-plan]').value.trim(),owner=overlay.querySelector('[data-owner]').value.trim(),dt=overlay.querySelector('[data-finish]').value,photoFile=overlay.querySelector('[data-photo]').files?.[0];if(!p){err.textContent='TO-BE 조치내용을 입력하세요';return}if(complete&&(!owner||!dt)){err.textContent='완료시 담당자·완료일 필수';return}if(complete&&dt>today()){err.textContent='미래 완료일 불가';return}if(complete&&/^\d{4}-\d{2}-\d{2}$/.test(baseDay)&&dt<baseDay){err.textContent='완료일은 최초 개선요청일보다 빠를 수 없습니다.';return}let photo='';if(photoFile){if(photoFile.size>1800000){err.textContent='사진은 1.8MB 이하';return}photo=await new Promise((resolve,reject)=>{let r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(photoFile)})}
if(!overlay.isConnected||document.getElementById(MID)!==overlay)return;let registrationDateTime=new Date().toISOString();let leadAtSave=calendarGap(baseDay,today());let data=rows(),indices=data.map((x,i)=>key(x)===id?i:-1).filter(i=>i>=0);if(indices.length!==1){err.textContent='원본 관리번호가 누락되었거나 중복되었습니다. 저장을 중단하고 관리자에게 확인을 요청하세요.';return}let ix=indices[0];if(done(data[ix])){err.textContent='원본 상태가 변경됨';return}if(complete&&!photo&&!after(data[ix])){err.textContent='완료시 AFTER 사진 필수: 최신 원본의 증빙을 확인하세요.';return}let old=localStorage.getItem(KEY),next={...data[ix],toBePlan:p,actionText:p,action:p,assignee:owner,actionOwner:owner,due:overlay.querySelector('[data-due]').value||data[ix].due,targetDate:overlay.querySelector('[data-due]').value||data[ix].targetDate,toBeComment:overlay.querySelector('[data-comment]').value,updated:registrationDateTime,toBeRegisteredAt:data[ix].toBeRegisteredAt||registrationDateTime,actionLeadTimeDays:data[ix].actionLeadTimeDays??leadAtSave,actionLeadTimeMonths:data[ix].actionLeadTimeMonths??(leadAtSave===null?null:Number((leadAtSave/30).toFixed(2))),status:complete?'완료':'진행중'};
if(photo)next.after=photo;if(complete){next.doneDate=dt;next.completedAt=dt;next.doneStatus='완료'}data[ix]=next;
try{localStorage.setItem(KEY,JSON.stringify(data));let savedMatches=rows().filter(x=>key(x)===id);if(savedMatches.length!==1||savedMatches[0].toBePlan!==p||savedMatches[0].status!==(complete?'완료':'진행중')||(complete&&savedMatches[0].doneStatus!=='완료'))throw Error('검증 실패')}catch(e){try{if(old===null)localStorage.removeItem(KEY);else localStorage.setItem(KEY,old);if(localStorage.getItem(KEY)!==old)throw Error('복원 검증 실패')}catch(rollbackError){console.error('[HD20 TO-BE rollback]',rollbackError);err.textContent='저장·복원 실패: 관리자 확인 전 다시 등록하지 마세요.';return}err.textContent='저장 실패: 이전 조치정보를 복원했습니다.';return}
window.dispatchEvent(new CustomEvent('hd20-action-updated',{detail:{source:'audit-tobe',id}}));close(true)}
let saving=false;
async function guardedSave(complete){
 if(saving||!overlay.isConnected)return;
 saving=true;
 const controls=[overlay.querySelector('[data-save]'),overlay.querySelector('[data-complete]')].filter(Boolean);
 controls.forEach(button=>{button.disabled=true;button.setAttribute('aria-busy','true')});
 try{await save(complete)}
 catch(error){const err=overlay.querySelector('[data-error]');if(err)err.textContent='저장 준비 중 오류가 발생했습니다. 사진 파일과 입력내용을 확인하고 다시 시도해 주세요.';console.error('[HD20 TO-BE save]',error)}
 finally{saving=false;if(overlay.isConnected)controls.forEach(button=>{button.disabled=false;button.removeAttribute('aria-busy')})}
}
overlay.querySelector('[data-save]')?.addEventListener('click',()=>guardedSave(false));
overlay.querySelector('[data-complete]')?.addEventListener('click',()=>guardedSave(true));
overlay.querySelector('[data-plan]').focus()}
window.HD20ToBeManager={open,render};
function init(){bootStyle();if(document.getElementById('awActivity')?.dataset.subview==='tobe')render();window.addEventListener('hd20-subtab-changed',e=>{if(e.detail?.area==='activity'&&e.detail?.sub==='tobe')render()});window.addEventListener('hd20-action-updated',()=>{if(window.HD20_NAV?.active?.()==='activity'&&document.getElementById('awActivity')?.dataset.subview==='tobe')render()});window.addEventListener('storage',e=>{if(e.key!==KEY)return;if(window.HD20_NAV?.active?.()==='activity'&&document.getElementById('awActivity')?.dataset.subview==='tobe')render()})}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init()
})();