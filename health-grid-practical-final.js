(()=>{
const ID='hd20HealthGridPractical';
const MAP={
 '공식 판정 완료율':{note:'현장 등록 사례 중 생산혁신팀·5S 모듈의 공식 판정이 완료된 비율',heads:['생산팀','작업장·사례','현장 등록일','판정결과','판정일','현재상태']},
 '평균 판정 Lead Time':{note:'현장 등록일부터 공식 판정 완료일까지의 평균 소요일',heads:['생산팀','작업장·사례','현장 등록일','판정일','Lead Time(일)','판정상태']},
 '6개월 유지율':{note:'Audit 실시 후 6개월간 지속관리된 대상 중 종료평가에서 요구수준을 유지한 비율',heads:['생산팀','Audit 실시일','6개월 관리종료일','개선요청','기한경과·재발','종료평가']},
 'Audit 부적합 재발률':{note:'조치 완료된 부적합 중 동일·유사 문제가 다시 발생한 비율',heads:['생산팀','작업장·사례','최초 부적합','조치완료일','재발여부','재발일','유형']},
 '기한 내 개선조치 완료율':{note:'Audit 개선요청을 등록일 기준 자동 지정된 D+7~D+14 완료기한 안에 Close한 비율',heads:['생산팀','개선조치','등록일','자동 완료기한','완료일','기한준수','상태']}
};
function norm(t=''){return t.replace(/\s+/g,' ').trim()}
function patchModal(){
 const modals=[...document.querySelectorAll('.modal,.kpiModal,[role="dialog"]')].filter(x=>getComputedStyle(x).display!=='none'||x.classList.contains('show')||x.classList.contains('open'));
 for(const m of modals){const txt=norm(m.innerText);const hit=Object.entries(MAP).find(([k])=>txt.includes(k));if(!hit)continue;const [,cfg]=hit;
  let note=m.querySelector('.hd20DecisionNote');if(!note){note=document.createElement('div');note.className='hd20DecisionNote';const anchor=m.querySelector('.modalHead,.kpiModalHead,.modal-header,h2,h3');(anchor?.parentNode||m).insertBefore(note,anchor?.nextSibling||m.firstChild)}note.textContent=cfg.note;
  const th=[...m.querySelectorAll('table thead th')];if(th.length){cfg.heads.forEach((h,i)=>{if(th[i])th[i].textContent=h})}
 }
}
function style(){if(document.getElementById(ID))return;const s=document.createElement('style');s.id=ID;s.textContent=`.hd20DecisionNote{margin:8px 14px 10px;padding:8px 10px;border:1px solid #dbe7ef;border-radius:8px;background:#f7fbfd;color:#526f82;font-size:14.5px;line-height:1.45}.kpiModal table,.modal table{font-size:14.5px}.kpiModal thead th,.modal thead th{white-space:nowrap;background:#f4f8fb;color:#274e68}.kpiModal tbody td,.modal tbody td{vertical-align:middle}`;document.head.appendChild(s)}
function boot(){style();document.addEventListener('click',()=>setTimeout(patchModal,40),true);patchModal()}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();