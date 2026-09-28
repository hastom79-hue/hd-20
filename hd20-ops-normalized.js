/* 상단 지표 카드에 '총 건수' 옆 보조값(인당 건수·비율)을 함께 표시.
   총 건수만으로는 효율을 알 수 없어, 화면에 표시된 숫자를 분모/분자로 사용(기존 건수·산식은 변경하지 않음).
   인당 = 팀 인원 마스터(HD20KPIData.headcount) 합계 기준. 규칙은 화면(data-contract)별로 정의. */
(()=>{'use strict';
const pc=(a,b)=>b>0?`${(a/b*100).toFixed(1)}%`:'-',f2=(a,b)=>b>0?(a/b).toFixed(2):'-',f1=(a,b)=>b>0?(a/b).toFixed(1):'-';
const R={
 'dashboard.summary':[(v,H)=>H?`인당 ${f2(v[0],H)}건`:'',null,null,null],
 'activity.manage':[(v,H)=>H?`인당 ${f2(v[0],H)}건 · ${H}명 기준`:'',v=>`완료율 ${pc(v[1],v[0])}`,v=>`진행 비중 ${pc(v[2],v[0])}`,v=>`고도화 확정률 ${pc(v[3],v[0])}`],
 'activity.analysis':[(v,H)=>H?`인당 ${f2(v[0],H)}건`:'',v=>`팀당 평균 ${f1(v[0],v[1])}건`,v=>`활동 대비 확정률 ${pc(v[2],v[0])}`,(v,H)=>H?`최근 30일 인당 ${f2(v[3],H)}건`:''],
 'advancement.judge':[null,v=>`후보 대비 ${pc(v[1],v[0])}`,v=>`확정률 ${pc(v[2],v[0])}`,v=>`3조건 충족률 ${pc(v[3],v[0])}`],
 'advancement.detail':[null,null,v=>`작업장 대비 확정 ${pc(v[2],v[1])}`,null],
 'advancement.standard':[null,v=>`유지율 ${pc(v[1],v[0])}`,v=>`미흡률 ${pc(v[2],v[0])}`,v=>`수평전개율 ${pc(v[3],v[0])}`],
 'audit.draw':[null,v=>`실시 대기 ${pc(v[1],v[0])}`,v=>`실시율 ${pc(v[2],v[0])}`,v=>`부적합률 ${pc(v[3],v[2])} (완료 대비)`],
 'audit.inspect':[null,v=>`입력 대기 ${pc(v[1],v[0])}`,null,null],
 'audit.ongoing':[null,v=>`재발 징후 ${pc(v[1],v[0])}`,v=>`관리 1건당 Action ${f1(v[2],v[0])}건`,v=>`월별 확인률 ${pc(v[3],v[0])}`],
 'audit.retention':[null,v=>`종료평가 진행 ${pc(v[1],v[0])}`,v=>`종료평가 대비 ${pc(v[2],v[1])}`,null],
 'action.manage':[(v,H)=>H?`인당 ${f2(v[0],H)}건 · ${H}명 기준`:'',v=>`전체의 ${pc(v[1],v[0])}`,v=>`완료율 ${pc(v[2],v[0])}`,v=>`진행 중 ${pc(v[3],v[1])}가 기한경과`],
 'action.leadtime':[v=>`지연 ${pc(v[0],v[0]+v[1]+v[3])}`,v=>`조기 ${pc(v[1],v[0]+v[1]+v[3])}`,v=>`지연 중 ${pc(v[2],v[0])}가 7일↑`,v=>`정시 ${pc(v[3],v[0]+v[1]+v[3])}`],
 'action.master':[null,v=>`등록률 ${pc(v[1],v[0])}`,v=>`지정률 ${pc(v[2],v[0])}`,v=>`미지정 ${pc(v[3],v[0])}`],
 'action.verify':[null,v=>`검증률 ${pc(v[1],v[0])}`,v=>`검증 대기 ${pc(v[2],v[0])}`,v=>`재발률 ${pc(v[3],v[1])} (검증완료 대비)`]
};
function css(){if(document.getElementById('hd20OpsNormStyle'))return;const s=document.createElement('style');s.id='hd20OpsNormStyle';s.textContent='.opsSub{display:block;margin-top:4px;font-size:12.5px;font-weight:850;color:#2c5f8a;line-height:1.35}#hd20OpsMetrics button b{display:block}';document.head.appendChild(s)}
function annotate(){
  const box=document.getElementById('hd20OpsMetrics');if(!box)return;const key=box.dataset.contract,rules=R[key];if(!rules)return;
  css();const H=window.HD20KPIData?.headcount?.(window.HD20KPIData?.snapshot?.()?.rows)||null;
  const btns=[...box.querySelectorAll('button[data-metric]')];const v=btns.map(b=>{const t=(b.querySelector('b')?.firstChild?.textContent||'').replace(/[^0-9.\-]/g,'');return t===''?NaN:Number(t)});
  btns.forEach((b,i)=>{const fn=rules[i];let txt='';if(fn&&v.every(Number.isFinite)||(fn&&Number.isFinite(v[i]))){try{txt=fn(v,H)||''}catch(e){txt=''}}
    let el=b.querySelector('.opsSub');if(!txt){el?.remove();return}
    if(!el){el=document.createElement('span');el.className='opsSub';b.appendChild(el)}if(el.textContent!==txt)el.textContent=txt});
}
setInterval(annotate,700);
['hd20-subtab-changed','hd20-kpi-source-updated','hd20-nav-area-changed'].forEach(e=>window.addEventListener(e,()=>{setTimeout(annotate,120);setTimeout(annotate,600)}));
window.HD20_OPS_NORMALIZED={annotate,rules:R};
})();
