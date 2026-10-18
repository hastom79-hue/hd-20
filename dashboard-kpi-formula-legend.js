(()=>{'use strict';
const ID='hd20KpiFormulaLegend';
const rules=[
['고도화 확정 사례 유지율','현재 유지 중인 공식 확정 사례 ÷ 전체 공식 확정 사례 × 100','확정 사례 전체(누적)','확정월별 사례 중 현재 유지 중인 비율'],
['고도화 확정 후 이탈률','(전체 공식 확정 사례 − 현재 유지 사례) ÷ 전체 공식 확정 사례 × 100','확정 사례 전체(누적)','확정월별 사례 중 현재 이탈한 비율'],
['Audit 후 6개월 유지율','6개월 경과 Audit 중 유지기준 충족 건 ÷ 6개월 경과 Audit 전체 × 100','Audit일 + 6개월이 오늘 이전인 건','6개월 관찰 종료월 기준; 미완료 조치·재발·부적합은 미유지'],
['Audit 부적합 재발률','효과검증 완료·재발여부 확인 건 중 재발 건 ÷ 해당 확인 건 전체 × 100','조치 완료 및 효과검증·재발여부 확인 건','개선조치 완료월 기준'],
['기한 내 개선조치 완료율','완료일이 목표일 이내인 건 ÷ 목표일이 있는 완료조치 건 × 100','조치내용·완료일·사후근거가 있고 목표일이 있는 건','개선조치 완료월 기준']
];
function install(){
 const root=document.getElementById('hd20DashboardPriority');if(!root)return false;
 let el=document.getElementById(ID);if(el)return true;
 const style=document.createElement('style');style.textContent='#'+ID+'{margin:12px 0 2px;border:1px solid #dce5ed;border-radius:10px;background:#f8fafc;color:#243b50;font-size:12px}#'+ID+' summary{cursor:pointer;padding:11px 14px;font-weight:850;list-style:none}#'+ID+' summary::-webkit-details-marker{display:none}#'+ID+' summary:after{content:" ▾";color:#60788d}#'+ID+'[open] summary:after{content:" ▴"}#'+ID+' .kpiLegendBody{padding:0 14px 12px;overflow-x:auto}#'+ID+' table{width:100%;border-collapse:collapse;min-width:650px;text-align:left}#'+ID+' th,#'+ID+' td{padding:9px 8px;border-top:1px solid #e1e8ee;vertical-align:top;line-height:1.5}#'+ID+' th{color:#52697d;background:#eef3f7}#'+ID+' td:first-child{font-weight:800;min-width:130px}#'+ID+' p{margin:10px 0 0;color:#596e80;line-height:1.6}';document.head.appendChild(style);
 const esc=x=>String(x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 el=document.createElement('details');el.id=ID;
 el.innerHTML='<summary>계산식 · 집계기준 안내 (5개 운영 건전성 KPI)</summary><div class="kpiLegendBody"><table><thead><tr><th>KPI</th><th>계산식</th><th>누적 집계 대상</th><th>월별 차트 기준</th></tr></thead><tbody>'+rules.map(r=>'<tr>'+r.map(v=>'<td>'+esc(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table><p>대표값은 전체 누적 비율, 막대는 월별 대상집단의 비율입니다. 유지·이탈 막대는 확정월별 사례의 현재 상태이므로 과거 월 값도 달라질 수 있습니다. 표본이 없으면 —, 비율 차이는 %p로 표시합니다. 데이터는 기존 원본 및 산식을 변경하지 않습니다.</p></div>';
 root.appendChild(el);return true;
}
if(!install()){let tries=0;const timer=setInterval(()=>{if(install()||++tries>40)clearInterval(timer)},250)}
window.addEventListener('hd20-kpi-source-updated',install);
})();