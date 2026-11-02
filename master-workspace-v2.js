(()=>{'use strict';
const GROUPS=[['조직·인원','integrated-team','integrated-target'],['분류·작업장','integrated-source','integrated-discovery','integrated-factor','integrated-workplace','integrated-theme'],['Audit·개선정책','policy'],['권한·메일','integrated-admins','integrated-mail']];
const NOTES={'integrated-team':'팀 구성·인원·책임자','integrated-target':'팀별 목표 및 분기 기준','integrated-source':'개선요청 출처','integrated-discovery':'발굴 유형과 표시 순서','integrated-factor':'업무분류·상태·우선순위','integrated-workplace':'작업장·세부위치','integrated-theme':'5대 상위테마·하위 세부테마·점검항목','policy':'Audit 표본·기한·운영기준','integrated-admins':'마스터 관리자 권한','integrated-mail':'메일링 수신·운영'};
function init(){const root=document.getElementById('masterModal'),box=root?.querySelector('.masterInfoBox'),tabs=box?.querySelector('.masterTabs');if(!box||!tabs)return false;
if(root.querySelector('#hd20MasterWorkspace')){
 const existing=root.querySelector('#hd20MasterWorkspace');
 const links=existing?.querySelectorAll('[data-hm-target]')?.length||0;
 box.classList.toggle('hd20MasterWorkspaceReady',links>=10);
 return links>=10;
}const required=['integrated-team','integrated-target','integrated-source','integrated-discovery','integrated-factor','integrated-workplace','integrated-theme','policy','integrated-admins','integrated-mail'];if(!required.every(k=>tabs.querySelector('[data-master-tab="'+k+'"]')))return false;
const ws=document.createElement('section');ws.id='hd20MasterWorkspace';ws.innerHTML='<div class="hmTitle"><div><span class="hmEyebrow">HD-20 · 기준정보 관리</span><h2>통합기준정보</h2><p>관리 항목을 선택해 수정하세요. 기존 저장·권한·데이터 연계 기능을 그대로 사용합니다.</p></div><div class="hmCounters"><span data-hm-count>기준정보 불러오는 중</span></div></div><div class="hmToolbar"><label for="hmSearch">기준정보 검색</label><input id="hmSearch" type="search" placeholder="팀, 작업장, Audit, 권한, 메일 등 검색" autocomplete="off"><button type="button" data-hm-reset>전체 보기</button></div><div class="hmGroups" data-hm-groups></div><div class="hmCurrent" aria-live="polite"><strong data-hm-current>관리 항목을 선택하세요</strong><span>아래에서 기존 기준정보를 직접 편집·저장합니다.</span></div>';
box.insertBefore(ws,tabs);
const grid=ws.querySelector('[data-hm-groups]');const all=[];
for(const [group,...keys] of GROUPS){const section=document.createElement('div');section.className='hmGroup';const heading=document.createElement('h3');heading.textContent=group;section.appendChild(heading);const wrap=document.createElement('div');wrap.className='hmLinks';for(const key of keys){const original=tabs.querySelector('[data-master-tab="'+key+'"]');if(!original||original.hidden)continue;const btn=document.createElement('button');btn.type='button';btn.dataset.hmTarget=key;btn.innerHTML='<strong></strong><small></small>';btn.querySelector('strong').textContent=original.textContent.trim();btn.querySelector('small').textContent=NOTES[key]||group;btn.addEventListener('click',()=>{original.click();select(key);requestAnimationFrame(()=>{const current=box.querySelector('#hd20IntegratedMasterFactors .imfPanel:not([style*="display: none"])');{const target=current||box.querySelector('#hd20IntegratedMasterFactors');if(!target)return;const viewport=box.getBoundingClientRect(),rect=target.getBoundingClientRect();const next=Math.max(0,Math.min(box.scrollHeight-box.clientHeight,box.scrollTop+rect.top-viewport.top-12));box.scrollTo({top:next,behavior:'smooth'})}})});wrap.appendChild(btn);all.push(btn)}section.appendChild(wrap);if(wrap.children.length)grid.appendChild(section)}
function select(key){all.forEach(b=>{const yes=b.dataset.hmTarget===key;b.classList.toggle('on',yes);b.setAttribute('aria-pressed',yes?'true':'false')});const b=all.find(b=>b.dataset.hmTarget===key);ws.querySelector('[data-hm-current]').textContent=b?b.querySelector('strong').textContent:'기준정보'}
const search=ws.querySelector('#hmSearch');function filter(){const q=search.value.trim().toLocaleLowerCase();let count=0;for(const btn of all){const show=!q||btn.textContent.toLocaleLowerCase().includes(q);btn.hidden=!show;if(show)count++}for(const group of grid.children)group.hidden=![...group.querySelectorAll('[data-hm-target]')].some(b=>!b.hidden);ws.querySelector('[data-hm-count]').textContent=count+'개 관리 항목'+(q?' 검색됨':'')}search.addEventListener('input',filter);ws.querySelector('[data-hm-reset]').onclick=()=>{search.value='';filter();search.focus()};filter();
tabs.addEventListener('click',e=>{const b=e.target.closest('[data-master-tab]');if(b)select(b.dataset.masterTab)});
const selected=tabs.querySelector('[data-master-tab].on:not([hidden])');
if(selected)select(selected.dataset.masterTab);
else if(all.length)all[0].click();
// The original menu must remain operable unless the entire replacement interface is ready.
if(all.length<10){ws.remove();box.classList.remove('hd20MasterWorkspaceReady');return false}
box.classList.add('hd20MasterWorkspaceReady');
return true}
function boot(){let n=0;const go=()=>{if(init())return;if(++n<80)setTimeout(go,180)};go()}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
