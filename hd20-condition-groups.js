/* ③ 고도화·표준화 > 3조건 분석: 총 건수가 아니라 "어느 라인·작업장이 3대 조건 중 몇 개를 충족했고 무엇이 부족한지"를 보여줌.
   데이터는 maturity-condition-analysis.js의 summary()(행별 충족 여부·팀·라인·작업장)를 그대로 사용(읽기 전용). */
(()=>{'use strict';
const ID='hd20ConditionGroups',SHORT=['① 시각화·형적관리','② Green Zone','③ 정량축소·정위치'],SHOW=8;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function css(){if(document.getElementById(ID+'Style'))return;const s=document.createElement('style');s.id=ID+'Style';s.textContent=`
#${ID}{display:none;background:#fff;border:1px solid #dfe6ec;border-radius:14px;padding:18px 20px;margin:0 0 14px;box-shadow:0 1px 3px rgba(20,48,76,.06)}
#performanceConversionAnalysis[data-subview="analysis"] #${ID}{display:block}
#${ID} h2{margin:2px 0 4px;font-size:22px;color:#14304c}#${ID} .cgTop small{color:#5c6b7a;font-weight:800}#${ID} .cgTop p{margin:0;color:#22303f;font-size:14.5px;font-weight:700;line-height:1.55}
#${ID} .cgBar{display:flex;height:34px;border-radius:9px;overflow:hidden;margin-top:12px;background:#eef2f5}
#${ID} .cgBar div{display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:900;min-width:0;white-space:nowrap}
#${ID} .g1{background:#d0862b}#${ID} .g2{background:#4d86ad}#${ID} .g3{background:#2f7a4d}
#${ID} .cgLegend{display:flex;gap:16px;flex-wrap:wrap;margin-top:7px;font-size:12px;color:#5c6b7a;font-weight:800}#${ID} .cgLegend i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:5px;vertical-align:-1px}
#${ID} .cgGroup{margin-top:16px;border:1px solid #e3eaf0;border-radius:12px;overflow:hidden}
#${ID} .cgHead{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:11px 14px;border-left:6px solid}
#${ID} .cgHead.g1{border-color:#d0862b;background:#fdf6ea}#${ID} .cgHead.g2{border-color:#4d86ad;background:#edf4f9}#${ID} .cgHead.g3{border-color:#2f7a4d;background:#eaf5ee}
#${ID} .cgHead b{font-size:16px;color:#14304c}#${ID} .cgHead span{font-size:12.5px;color:#5c6b7a;font-weight:800}
#${ID} .cgGap{display:flex;gap:8px;flex-wrap:wrap;padding:9px 14px 0;font-size:12.5px;color:#5c6b7a;font-weight:800}
#${ID} .cgGap em{font-style:normal;background:#fdecea;color:#b03a2e;border-radius:999px;padding:3px 10px}
#${ID} table{width:100%;border-collapse:collapse;font-size:13.5px}#${ID} th{position:static;text-align:left;background:#f4f7f9;color:#5c6b7a;font-size:12px;padding:8px 10px}
#${ID} td{padding:8px 10px;border-top:1px solid #edf1f4;color:#22303f}#${ID} td b{color:#14304c}
#${ID} .dot{display:inline-block;min-width:74px;text-align:center;border-radius:999px;padding:3px 8px;font-size:11.5px;font-weight:850}
#${ID} .dot.on{background:#dff1e6;color:#2f7a4d}#${ID} .dot.off{background:#f1f3f5;color:#a0adb8}
#${ID} .jd{font-size:12px;font-weight:850;color:#5c6b7a}#${ID} .jd.ok{color:#2f7a4d}
#${ID} .cgMoreBtn{display:block;width:100%;border:0;border-top:1px solid #edf1f4;background:#fafbfc;color:#14304c;font-weight:850;padding:10px;cursor:pointer}
#${ID} .cgEmpty{padding:14px;color:#7a8a97;font-size:13px}
#${ID} .cgNote{margin:12px 2px 0;font-size:12px;color:#7a8a97}
#performanceConversionAnalysis[data-subview="analysis"]>.pcHeader,#performanceConversionAnalysis[data-subview="detail"]>.pcHeader{display:none!important}
#performanceConversionAnalysis[data-subview="analysis"] #hd20MaturityConditionAnalysis .mcaLevelRail,#performanceConversionAnalysis[data-subview="analysis"] #hd20MaturityConditionAnalysis .mcaBodyGrid{display:none!important}
/* 3조건 분석 탭: 집계 기준이 다른 건수 카드와 내용 없는 접힌 제목 막대는 숨김(아래 목록·비율 막대가 같은 기준의 값) */
.app[data-hd-view="advancement.analysis"] #hd20OpsMetrics{display:none!important}
#performanceConversionAnalysis[data-subview="analysis"] .pcGrid{display:none!important}
#${ID} tbody[hidden]{display:none!important}
@media(max-width:760px){#${ID} table,#${ID} thead,#${ID} tbody,#${ID} tr,#${ID} th,#${ID} td{display:block}#${ID} thead{display:none}#${ID} tr{padding:8px 10px;border-top:1px solid #edf1f4}#${ID} td{border:0;padding:2px 0}#${ID} td:nth-child(-n+3){display:inline-block;margin-right:6px}#${ID} td:nth-child(-n+2)::after{content:' ·';color:#a0adb8}#${ID} td:nth-child(3){display:block}#${ID} td:nth-child(n+4){display:inline-block;margin-right:4px}#${ID} .dot{min-width:0;margin:2px 4px 2px 0}}`;document.head.appendChild(s)}
function uniq(rows){const m=new Map();rows.forEach(x=>{const u=x._unit,k=`${u.team}|${u.line}|${u.workplace||u.name}`;if(!m.has(k))m.set(k,x)});return[...m.values()].sort((a,b)=>{const A=a._unit,B=b._unit;return (A.team||'').localeCompare(B.team||'','ko')||(A.line||'').localeCompare(B.line||'','ko')||(A.workplace||'').localeCompare(B.workplace||'','ko')})}
function tableRows(list){return list.map(x=>{const u=x._unit,v=x._criteria.values,j=x._judge;return `<tr><td>${esc(u.team||'-')}</td><td>${esc(u.line||'-')}</td><td><b>${esc(u.workplace||u.name)}</b></td>${v.map((ok,i)=>`<td><span class="dot ${ok?'on':'off'}" title="${esc(SHORT[i])}">${'①②③'[i]} ${ok?'충족':'미충족'}</span></td>`).join('')}<td><span class="jd ${j==='확정'?'ok':''}">${esc(j||'판정 전')}</span></td></tr>`}).join('')}
function group(n,rows,cfg,total){
  const list=uniq(rows),lines=new Set(list.filter(x=>x._unit.line).map(x=>x._unit.team+'|'+x._unit.line)).size,pct=total?Math.round(list.length/total*100):0;
  const miss=SHORT.map((label,i)=>({label,c:list.filter(x=>!x._criteria.values[i]).length})).filter(x=>x.c).sort((a,b)=>b.c-a.c);
  const gap=n<3&&list.length?`<div class="cgGap"><span>부족한 조건:</span>${miss.map(m=>`<em>${esc(m.label)} 부족 ${m.c}곳</em>`).join('')}</div>`:'';
  const head=`<div class="cgHead g${n}"><div><b>${cfg.title}</b> <span>· ${cfg.hint}</span></div><span>작업장 ${list.length}곳 · 라인 ${lines}개 · 전체의 ${pct}%</span></div>`;
  if(!list.length)return `<div class="cgGroup">${head}<div class="cgEmpty">해당하는 작업장·라인이 없습니다.</div></div>`;
  const first=list.slice(0,SHOW),rest=list.slice(SHOW),th=`<thead><tr><th>생산팀</th><th>라인</th><th>작업장</th>${SHORT.map(s=>`<th>${s}</th>`).join('')}<th>공식판정</th></tr></thead>`;
  return `<div class="cgGroup" data-cg="${n}">${head}${gap}<table>${th}<tbody>${tableRows(first)}</tbody>${rest.length?`<tbody class="cgRest" hidden>${tableRows(rest)}</tbody>`:''}</table>${rest.length?`<button type="button" class="cgMoreBtn" data-cg-more>나머지 ${rest.length}곳 더 보기 ▾</button>`:''}</div>`}
function render(box){
  const A=window.HD20MaturityConditionAnalysis;if(!A?.summary)return;let s;try{s=A.summary()}catch(e){return}
  const g1=uniq(s.one),g2=uniq(s.two),g3=uniq(s.three),total=g1.length+g2.length+g3.length,p=n=>total?Math.round(n/total*100):0;
  const cfg={1:{title:'1개 조건만 충족',hint:'다음 조건 확장이 필요한 곳'},2:{title:'2개 조건 충족',hint:'한 가지만 더 하면 3조건 완성'},3:{title:'3개 조건 모두 충족',hint:'공식 판정·수평전개 검토 대상'}};
  box.innerHTML=`<div class="cgTop"><small>3조건 분석 · 조건 충족 현황</small><h2>어느 라인·작업장이 몇 개를 충족했나요?</h2><p>건수보다 <b>어디가 부족한지</b>를 봅니다. 1개·2개 충족 작업장이 우선 개선 대상이고, 조건 충족은 공식판정과 별개입니다.</p></div>
<div class="cgBar" title="충족 조건 수별 작업장 비율"><div class="g1" style="flex:${g1.length||0.0001}">${p(g1.length)?(p(g1.length)>=15?`1개 ${p(g1.length)}%`:`${p(g1.length)}%`):''}</div><div class="g2" style="flex:${g2.length||0.0001}">${p(g2.length)?(p(g2.length)>=15?`2개 ${p(g2.length)}%`:`${p(g2.length)}%`):''}</div><div class="g3" style="flex:${g3.length||0.0001}">${p(g3.length)?(p(g3.length)>=15?`3개 ${p(g3.length)}%`:`${p(g3.length)}%`):''}</div></div>
<div class="cgLegend"><span><i class="g1"></i>1개 충족</span><span><i class="g2"></i>2개 충족</span><span><i class="g3"></i>3개 모두 충족</span><span>· 조건 확인 작업장 ${total}곳 기준 비율</span></div>
${group(1,s.one,cfg[1],total)}${group(2,s.two,cfg[2],total)}${group(3,s.three,cfg[3],total)}
<p class="cgNote">※ 라인은 원천데이터의 명시 필드만 사용하며 없으면 "-"로 표시합니다. 0개 충족은 제외합니다. 목록은 팀 → 라인 → 작업장 순입니다.</p>`;
  box.querySelectorAll('[data-cg-more]').forEach(b=>b.onclick=()=>{const body=b.parentElement.querySelector('.cgRest');const open=body.hidden;body.hidden=!open;b.textContent=open?'접기 ▴':`나머지 ${body.rows.length}곳 더 보기 ▾`});
}
function ensure(){
  const host=document.getElementById('hd20MaturityConditionAnalysis');if(!host||!window.HD20MaturityConditionAnalysis?.summary)return false;
  css();let box=document.getElementById(ID);if(!box){box=document.createElement('section');box.id=ID;host.insertAdjacentElement('beforebegin',box)}render(box);return true}
let tries=0;(function boot(){if(!ensure()&&tries++<80)setTimeout(boot,150)})();
['hd20-kpi-source-updated','hd20-gmes-5s-imported','hd20-gmes-5s-judged'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(()=>{const b=document.getElementById(ID);if(b)render(b);else ensure()},80)));
})();
