/* HD-20 register dialog layout V2. Structure only; never duplicate inputs or reset values. */
(()=>{'use strict';
const forms=[
 {modal:'awRegisterModal',form:'.awForm',team:'awTeam',theme:'awType',date:'awDate',type:'자율개선 등록'},
 {modal:'hd20ActionRegisterModal',form:'.amForm',team:'amTeam',theme:'amType',date:'amDate',type:'개선요청 등록'}
];
function groupForm(form){
 if(form.dataset.hd20LayoutV2==='1')return;
 const heads=[...form.children].filter(el=>el.classList.contains('hd20PopupSectionTitle'));
 if(heads.length<3)return;
 const children=[...form.children],groups=[];
 let group=null;
 for(const el of children){
   if(el.classList.contains('hd20PopupSectionTitle')){
     group=document.createElement('section');
     group.className='hd20RegGroup hd20RegGroup'+(groups.length+1);
     const body=document.createElement('div');body.className='hd20RegGroupGrid';
     group.append(el,body);
     groups.push(group);
   }else if(group){
     group.querySelector('.hd20RegGroupGrid').appendChild(el);
   }
 }
 if(groups.length<3)return;
 const grid=document.createElement('div');grid.className='hd20RegLayout';
 for(const g of groups)grid.appendChild(g);
 form.appendChild(grid);
 form.dataset.hd20LayoutV2='1';
}
function addSummary(conf,modal,form){
 const body=modal.querySelector(conf.modal==='awRegisterModal'?'.awRegisterContent':'.armBody');
 if(!body||body.querySelector('.hd20RegSummary'))return;
 const summary=document.createElement('div');summary.className='hd20RegSummary';
 summary.innerHTML='<span class="hd20RegSummaryLead"></span><span class="hd20RegSummaryCell"><small>생산팀</small><b data-reg-value="team"></b></span><span class="hd20RegSummaryCell"><small>5S 테마</small><b data-reg-value="theme"></b></span><span class="hd20RegSummaryCell"><small>활동 / 요청일</small><b data-reg-value="date"></b></span>';
 summary.querySelector('.hd20RegSummaryLead').textContent=conf.type;
 const update=()=>{
   const value=(id)=>{const el=form.querySelector('#'+id);return el?.selectedOptions?.[0]?.textContent?.trim()||el?.value?.trim()||'미선택'};
   for(const [key,id] of [['team',conf.team],['theme',conf.theme],['date',conf.date]]){
     const b=summary.querySelector('[data-reg-value="'+key+'"]');if(b)b.textContent=value(id)
   }
 };
 form.addEventListener('input',update);
 form.addEventListener('change',update);
 modal.addEventListener('click',e=>{if(e.target.closest('[data-modal-clear]'))queueMicrotask(update)});
 if(conf.modal==='hd20ActionRegisterModal'){
   const recent=body.querySelector('.hd20ActionRecentFirst');
   if(recent)body.insertBefore(summary,recent);
   else body.prepend(summary);
 }else body.prepend(summary);
 update();
 modal.addEventListener('transitionend',update);
 modal.addEventListener('focusin',update);
}
/* Keep one instruction notice directly below the modal header, one compact
   team/theme/date context strip, and recent cases beneath the input form. */
function organizeActionModal(modal,form){
 const body=modal.querySelector('.armBody');
 if(!body)return;
 // The input form already exposes team, 5S theme and request date.
 // Do not repeat those values in a static 3-column summary.
 body.querySelectorAll('.hd20RegSummary').forEach(el=>el.remove());
 const note=modal.querySelector('.amRegisterNote');
 if(note){
   note.classList.add('hd20ActionIntroTop');
   if(note.parentNode!==body||body.firstElementChild!==note)body.prepend(note);
   body.querySelectorAll('.amRegisterNote').forEach(el=>{if(el!==note)el.remove()});
 }
 // Mailing mode is an actual functional input: keep it accessible, below the
 // notice and above the form, without a large dedicated blank row.
 const send=body.querySelector('.amSendMethod');
 if(send){
   send.classList.add('hd20ActionSendCompact');
   if(note)note.insertAdjacentElement('afterend',send);
   else body.prepend(send);
 }
 const recent=body.querySelector('.hd20ActionRecentFirst');
 if(recent){
   let fold=body.querySelector('.hd20ActionRecentFold');
   if(!fold){
     fold=document.createElement('details');
     fold.className='hd20ActionRecentFold';
     const caption=document.createElement('summary');
     caption.textContent='최근 완료된 개선조치 · 선택 팀 3건 보기';
     fold.appendChild(caption);
   }
   fold.appendChild(recent); // preserve the original live-list node
   const formCard=form.closest('.amRegisterFormCard');
   if(formCard&&formCard.parentNode===body)formCard.insertAdjacentElement('afterend',fold);
   else body.appendChild(fold);
 }
}
function apply(conf){
 const modal=document.getElementById(conf.modal);
 const form=modal?.querySelector(conf.form);
 if(!form)return false;
 if(!form.dataset.hd20LayoutV2)groupForm(form);
 if(form.dataset.hd20LayoutV2==='1'&&conf.modal!=='hd20ActionRegisterModal')addSummary(conf,modal,form);
 if(conf.modal==='hd20ActionRegisterModal')organizeActionModal(modal,form);
 return form.dataset.hd20LayoutV2==='1';
}
let count=0;function boot(){
 const complete=forms.map(apply).every(Boolean);
 if(!complete&&++count<70)setTimeout(boot,100);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();