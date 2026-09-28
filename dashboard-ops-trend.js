/* 대시보드 6번 탭 '성과·운영분석': 종합현황의 6개 운영 건전성 지표를 최근 6개월 추이로 보여줌.
   (종합현황=현재 값, 이 화면=변화 추이 → 서로 다른 목적) 읽기 전용, HD20KPIData.monthlyOperational() 사용. */
(()=>{'use strict';
const ID='hd20OpsTrend',N=6;
const M=[
 {k:'judgmentRate',t:'공식 판정 완료율',u:'%',good:'up',max:100,route:'advancement',note:'그 달에 등록된 후보 중 판정까지 끝난 비율'},
 {k:'avgLead',t:'평균 판정 Lead Time',u:'일',good:'down',route:'advancement',note:'그 달에 판정된 건의 등록→판정 평균 소요일'},
 {k:'maturity',t:'고도화 수준 (평균 Lv.)',u:'',good:'up',max:5,route:'advancement',note:'그 달 공식 확정된 사례의 평균 Level'},
 {k:'sixRetention',t:'Audit 후 6개월 유지율',u:'%',good:'up',max:100,route:'audit',note:'6개월이 끝난 달 기준, 유지에 성공한 비율'},
 {k:'recurrence',t:'Audit 부적합 재발률',u:'%',good:'down',max:100,route:'action',note:'조치 완료·효과검증된 건 중 재발한 비율'},
 {k:'actionOnTime',t:'기한 내 개선조치 완료율',u:'%',good:'up',max:100,route:'action',note:'그 달 완료된 조치 중 기한 내 완료 비율'}];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function css(){if(document.getElementById(ID+'Style'))return;const s=document.createElement('style');s.id=ID+'Style';s.textContent=`
#${ID}{background:#fff;border:1px solid #dfe6ec;border-radius:14px;padding:18px 20px;box-shadow:0 1px 3px rgba(20,48,76,.06)}
#${ID} .otHead h2{margin:2px 0 4px;font-size:22px;color:#14304c}#${ID} .otHead small{color:#5c6b7a;font-weight:800}#${ID} .otHead p{margin:0;color:#22303f;font-size:14.5px;font-weight:700;line-height:1.55}
#${ID} .otSum{display:inline-flex;align-items:center;gap:8px;margin-top:10px;padding:7px 12px;border-radius:999px;font-size:13px;font-weight:850}
#${ID} .otSum.bad{background:#fdecea;color:#b03a2e}#${ID} .otSum.ok{background:#eaf5ee;color:#2f7a4d}
#${ID} .otGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:14px}
#${ID} .otCard{border:1px solid #e3eaf0;border-radius:12px;padding:14px 15px;background:#fbfcfd}
#${ID} .otCard h3{margin:0;font-size:14px;color:#22303f}#${ID} .otBig{display:flex;align-items:baseline;gap:8px;margin:6px 0 2px}
#${ID} .otBig b{font-size:30px;color:#14304c;letter-spacing:-.02em}#${ID} .otBig em{font-style:normal;font-size:13px;color:#5c6b7a;font-weight:800}
#${ID} .otDelta{font-size:12.5px;font-weight:850}#${ID} .otDelta.up{color:#2f7a4d}#${ID} .otDelta.down{color:#c0392b}#${ID} .otDelta.flat{color:#7a8a97}
#${ID} .otBars{display:grid;grid-template-columns:repeat(${N},1fr);gap:6px;align-items:end;height:92px;margin-top:10px;border-bottom:1px solid #dde5eb}
#${ID} .otCol{display:flex;flex-direction:column;justify-content:flex-end;align-items:center;height:100%;gap:3px}
#${ID} .otCol i{display:block;width:62%;border-radius:3px 3px 0 0;background:#b7c6d4;min-height:2px}#${ID} .otCol.last i{background:#14304c}
#${ID} .otCol span{font-size:11px;color:#5c6b7a;font-weight:800}#${ID} .otCol.last span{color:#14304c}
#${ID} .otMon{display:grid;grid-template-columns:repeat(${N},1fr);gap:6px;margin-top:4px;text-align:center;font-size:10.5px;color:#7a8a97}
#${ID} .otMon small{display:block;color:#a0adb8;font-size:9.5px}
#${ID} .otFoot{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:10px}#${ID} .otFoot span{font-size:11.5px;color:#7a8a97;line-height:1.4}
#${ID} .otFoot button{flex:0 0 auto;border:1px solid #cfd9e2;background:#fff;color:#14304c;border-radius:9px;padding:6px 10px;font-weight:850;font-size:12px;cursor:pointer}
#${ID} .otNote{margin:12px 2px 0;font-size:12px;color:#7a8a97}
@media(max-width:1100px){#${ID} .otGrid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:700px){#${ID} .otGrid{grid-template-columns:1fr}}`;document.head.appendChild(s)}
const fmt=(v,u)=>v===null||v===undefined?'-':(u==='일'?v.toFixed(1):(u==='%'?v.toFixed(1):v.toFixed(1)));
function card(m,data,overall){
  const arr=data[m.k]||[],vals=arr.map(x=>x.v),known=vals.map((v,i)=>v===null?null:i).filter(i=>i!==null);
  const li=known.length?known[known.length-1]:-1,pi=known.length>1?known[known.length-2]:-1;
  const cur=li>=0?vals[li]:null,prev=pi>=0?vals[pi]:null;
  let delta='<span class="otDelta flat">비교할 이전 값 없음</span>',bad=false;
  if(cur!==null&&prev!==null){const d=Math.round((cur-prev)*10)/10;if(d===0)delta='<span class="otDelta flat">전월과 같음</span>';else{const better=m.good==='up'?d>0:d<0;bad=!better;delta=`<span class="otDelta ${better?'up':'down'}">${d>0?'▲':'▼'} ${Math.abs(d).toFixed(1)}${esc(m.u)} 전월 대비 ${better?'개선':'악화'}</span>`}}
  const mx=m.max||Math.max(1,...vals.filter(v=>v!==null));
  const bars=arr.map((x,i)=>{const h=x.v===null?0:Math.max(2,Math.round(x.v/mx*72));return `<div class="otCol${i===arr.length-1?' last':''}" title="${esc(data.months[i])}: ${x.v===null?'표본 없음':fmt(x.v,m.u)+esc(m.u)} (표본 ${x.n}건)"><span>${x.v===null?'-':fmt(x.v,m.u)}</span><i style="height:${h}px"></i></div>`}).join('');
  const mon=data.months.map((mm,i)=>`<div>${+mm.slice(5)}월<small>n=${arr[i].n}</small></div>`).join('');
  const ov=overall?.[m.k];
  return {bad,html:`<div class="otCard"><h3>${esc(m.t)}</h3><div class="otBig"><b>${cur===null?'-':fmt(cur,m.u)}</b><em>${esc(m.u)} ${li>=0?'· '+(+data.months[li].slice(5))+'월':''}</em></div>${delta}<div class="otBars">${bars}</div><div class="otMon">${mon}</div><div class="otFoot"><span>${esc(m.note)}${ov!==null&&ov!==undefined?`<br>전체 누적 ${fmt(ov,m.u)}${esc(m.u)}`:''}</span><button type="button" data-ot-route="${m.route}">원인 확인 →</button></div></div>`}}
function render(box){
  const K=window.HD20KPIData;if(!K?.monthlyOperational)return;
  let data,overall;try{data=K.monthlyOperational(N);overall=K.operational?.(K.snapshot?.())}catch(e){box.innerHTML='<p class="otNote">추이 데이터를 계산하지 못했습니다.</p>';return}
  const cards=M.map(m=>card(m,data,overall)),badN=cards.filter(c=>c.bad).length;
  box.innerHTML=`<div class="otHead"><small>성과·운영분석 · 월별 추이</small><h2>운영 건전성, 좋아지고 있나요?</h2><p>종합현황의 6개 지표가 최근 ${N}개월 동안 어떻게 변했는지 봅니다. 나빠진 지표는 오른쪽 아래 <b>원인 확인</b>으로 해당 업무 화면에서 조치하세요.</p><div class="otSum ${badN?'bad':'ok'}">${badN?`⚠ 전월 대비 악화된 지표 ${badN}개`:'✓ 전월 대비 악화된 지표 없음'}</div></div><div class="otGrid">${cards.map(c=>c.html).join('')}</div><p class="otNote">※ 월별 표본(n)이 적은 달은 값이 크게 흔들릴 수 있어 막대 아래에 표본 수를 함께 표시했습니다. 표본이 없는 달은 "-"입니다.</p>`;
  box.querySelectorAll('[data-ot-route]').forEach(b=>b.onclick=()=>window.HD20_NAV?.go?.(b.dataset.otRoute));
}
function ensure(){
  if(!window.HD20KPIData?.monthlyOperational||!window.HD20KPIData?.snapshot)return false;
  css();let box=document.getElementById(ID);
  if(!box){const anchor=document.getElementById('hd20DashboardPriority')||document.querySelector('.cards');if(!anchor)return false;box=document.createElement('section');box.id=ID;anchor.insertAdjacentElement('afterend',box);
    const T=window.HD20_DASHBOARD_TABS;if(T?.apply)T.apply(T.active?.()||'summary',{scroll:false});}
  render(box);return true}
let tries=0;(function boot(){if(!ensure()&&tries++<80)setTimeout(boot,150)})();
['hd20-kpi-source-updated','hd20-audit-updated','hd20-action-updated','hd20-gmes-5s-judged'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(()=>{const b=document.getElementById(ID);if(b)render(b)},60)));
document.addEventListener('click',e=>{if(e.target.closest?.('#hd20DashboardSectionTabs button[data-dashboard-section="analysis"]'))setTimeout(()=>{const b=document.getElementById(ID);if(b)render(b)},80)},true);
window.HD20_OPS_TREND={render:()=>{const b=document.getElementById(ID);if(b)render(b)}};
})();
