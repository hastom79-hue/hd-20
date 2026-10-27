(()=>{'use strict';
const KEY='hd20MasterAdminEmailsV1',LOG='hd20MasterAdminAuditV1',OWNER='hastom@hd.com';
const clean=v=>String(v||'').trim().toLowerCase(),valid=v=>/^[^@\s]+@hd\.com$/.test(clean(v));
function admins(){try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return [...new Set([OWNER,...(Array.isArray(v)?v:[]).filter(valid).map(clean)])]}catch{return[OWNER]}}
function email(){try{const s=JSON.parse(localStorage.getItem('hd20_company_session_v1')||'null');return s&&Number(s.expiresAt)>Date.now()&&valid(s.email)?clean(s.email):''}catch{return''}}
function isMaster(){return !!email()&&admins().includes(email())}
function log(action,target){try{const x=JSON.parse(localStorage.getItem(LOG)||'[]');x.unshift({at:new Date().toISOString(),actor:email(),action,target});localStorage.setItem(LOG,JSON.stringify(x.slice(0,100)))}catch{}}
function save(next){if(!isMaster())throw Error('마스터관리자만 관리자 명단을 변경할 수 있습니다.');const list=[...new Set([OWNER,...next.map(clean).filter(valid)])];localStorage.setItem(KEY,JSON.stringify(list));window.dispatchEvent(new CustomEvent('hd20-master-access-updated'));return list}
function sync(root=document){root.querySelectorAll('.hd20EvalAdopt').forEach(el=>{el.hidden=!isMaster();el.style.setProperty('display',isMaster()?'flex':'none','important');const cb=el.querySelector('input');if(cb&&!isMaster()){cb.checked=false;cb.disabled=true}else if(cb)cb.disabled=false})}
function render(host){if(!host)return;const esc=v=>String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;'}[m]));const can=isMaster(),list=admins();host.innerHTML='<section class="imfSec"><h4>마스터관리자 관리</h4><div class="imfNote">초기 관리자: '+OWNER+' · 채택 판정은 마스터관리자 전용입니다. 일반 사용자는 발굴만 입력할 수 있습니다.</div><p style="color:#b45309;font-size:12px">주의: 현재 회사 이메일 입력 방식은 신원 인증이 아니며, 브라우저 저장소 기반 권한은 보안 통제가 아닙니다. 실제 승인 권한 보호에는 서버 인증·RLS가 필요합니다.</p><div style="overflow:auto"><table class="imfTbl"><thead><tr><th>관리자 이메일</th><th>관리</th></tr></thead><tbody>'+list.map(x=>'<tr><td>'+esc(x)+'</td><td>'+(x===OWNER?'초기 관리자 (고정)':can?'<button type="button" data-remove="'+esc(x)+'">지정 해제</button>':'관리자')+'</td></tr>').join('')+'</tbody></table></div>'+(can?'<div style="display:flex;gap:8px;align-items:center;margin-top:12px"><input type="email" data-admin-email placeholder="추가할 관리자 @hd.com" style="flex:1;min-width:180px;padding:9px"><button type="button" class="imfBtn" data-admin-add>관리자 지정</button></div>':'<p>현재 계정은 관리자 지정·해제 권한이 없습니다.</p>')+'</section>';
 host.querySelector('[data-admin-add]')?.addEventListener('click',()=>{const v=clean(host.querySelector('[data-admin-email]').value);if(!valid(v))return alert('@hd.com 회사 이메일을 입력하세요.');if(list.includes(v))return alert('이미 지정된 관리자입니다.');try{save([...list,v]);log('지정',v);render(host)}catch(e){alert(e.message)}});
 host.querySelectorAll('[data-remove]').forEach(b=>b.addEventListener('click',()=>{const v=b.dataset.remove;if(!confirm(v+' 관리자 지정을 해제하시겠습니까?'))return;try{save(list.filter(x=>x!==v));log('해제',v);render(host)}catch(e){alert(e.message)}}));
}
window.HD20MasterAccess={isMaster,email,admins,sync,render,owner:OWNER};
window.addEventListener('hd20-master-access-updated',()=>sync());
window.addEventListener('hd20-auth-bypass',()=>sync());
document.addEventListener('DOMContentLoaded',()=>sync());
})();