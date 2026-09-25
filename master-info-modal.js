(()=>{'use strict';
const html = `<div id="masterModal" class="masterModal"><div class="modalBox"><div class="modalHead"><b>통합기준정보</b><span>생산팀 표시순서 · 분기별 인당 목표 · 운영정책</span><button type="button" id="closeMaster" aria-label="닫기">×</button></div><div class="masterTabs"><button type="button" data-master-tab="order" class="on">표시순서</button><button type="button" data-master-tab="target">인당 목표</button></div><div id="masterOrderPanel"><p class="masterHint">▲▼ 버튼으로 대시보드 팀별 차트에 표시되는 생산팀 순서를 조정합니다.</p><div id="orderList" class="orderList"></div></div><div id="masterTargetPanel" style="display:none"><p class="masterHint">분기별 인당 5S 개선활동 목표 건수를 설정합니다. 대시보드 상단 차트에 기준선으로 표시됩니다.</p><div class="targetGrid"><label>Q1 목표(건/인)<input type="number" id="q1Target" min="0" step="0.1" placeholder="미설정"></label><label>Q2 목표(건/인)<input type="number" id="q2Target" min="0" step="0.1" placeholder="미설정"></label><label>Q3 목표(건/인)<input type="number" id="q3Target" min="0" step="0.1" placeholder="미설정"></label><label>Q4 목표(건/인)<input type="number" id="q4Target" min="0" step="0.1" placeholder="미설정"></label></div></div><div class="modalFoot"><button type="button" id="cancelOrder">취소</button><button type="button" id="saveOrder" class="primary">저장</button></div></div></div>`;

const style=document.createElement('style');
style.id='masterModalStyle';
style.textContent=`.masterModal{position:fixed;inset:0;z-index:99985;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(12,35,51,.48);backdrop-filter:blur(3px)}
.masterModal.on{display:flex}
.masterModal .modalBox{width:min(640px,96vw);max-height:88vh;overflow:auto;border-radius:16px;background:#fff;box-shadow:0 28px 80px rgba(6,31,49,.28);border:1px solid #dbe5eb;display:flex;flex-direction:column}
.masterModal .modalHead{display:flex;align-items:center;gap:10px;padding:16px 18px;border-bottom:1px solid #e5edf2}
.masterModal .modalHead b{font-size:17px;color:#17394f;white-space:nowrap}
.masterModal .modalHead span{flex:1;font-size:11px;color:#7890a0}
.masterModal .modalHead button{width:30px;height:30px;flex:0 0 auto;border:1px solid #d7e2e8;border-radius:8px;background:#fff;color:#5d7484;font-size:18px;line-height:1;cursor:pointer}
.masterModal .masterTabs{display:flex;gap:6px;padding:10px 18px 0;flex-wrap:wrap}
.masterModal .masterTabs button{padding:8px 14px;border:1px solid #d7e2e8;border-radius:9px 9px 0 0;background:#f3f7f9;color:#546b7a;cursor:pointer;font-size:12.5px}
.masterModal .masterTabs button.on{background:#0b5b83;color:#fff;border-color:#0b5b83}
.masterModal .masterHint{margin:14px 18px 8px;font-size:12px;color:#7890a0}
.masterModal .orderList{margin:0 18px 14px;display:flex;flex-direction:column;gap:6px}
.masterModal .orderRow{display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid #e5edf2;border-radius:9px}
.masterModal .orderNo{width:22px;height:22px;flex:0 0 auto;display:grid;place-items:center;background:#eef4f7;border-radius:6px;font-size:11px;color:#546b7a}
.masterModal .orderName{flex:1;font-size:13px;color:#17394f}
.masterModal .orderBtns{display:flex;gap:4px}
.masterModal .orderBtns button{width:26px;height:26px;border:1px solid #d7e2e8;border-radius:7px;background:#fff;cursor:pointer}
.masterModal .targetGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:0 18px 14px}
.masterModal .targetGrid label{display:flex;flex-direction:column;gap:5px;font-size:12px;color:#546b7a}
.masterModal .targetGrid input{padding:8px 10px;border:1px solid #d7e2e8;border-radius:8px;font-size:13px}
.masterModal .modalFoot{display:flex;justify-content:flex-end;gap:8px;padding:14px 18px;border-top:1px solid #e5edf2;margin-top:auto}
.masterModal .modalFoot button{padding:9px 16px;border-radius:9px;border:1px solid #d7e2e8;background:#fff;color:#546b7a;cursor:pointer;font-size:13px}
.masterModal .modalFoot button.primary{background:#0b5b83;color:#fff;border-color:#0b5b83}
.hd20MasterContext{margin:14px 18px;padding:12px;background:#f8fbfd;border:1px solid #dce6ed;border-radius:12px}
.hd20MasterContextHead{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px}
.hd20MasterContextHead b{font-size:13px;color:#17394f}
.hd20MasterContextHead span{font-size:10.5px;color:#7890a0}
.hd20MasterContextGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
.hd20MasterContextCard{padding:8px;background:#fff;border:1px solid #e5edf2;border-radius:9px}
.hd20MasterContextCard b{display:block;font-size:11.5px;color:#0b5b83;margin-bottom:3px}
.hd20MasterContextCard span,.hd20MasterContextCard small{display:block;font-size:11px;color:#546b7a;line-height:1.5}
.hd20MasterTags{display:flex;flex-wrap:wrap;gap:4px}
.hd20MasterTags i{font-style:normal;padding:2px 7px;background:#eef4f7;border-radius:20px;font-size:10.5px;color:#0b5b83}
@media(max-width:700px){.masterModal .targetGrid{grid-template-columns:1fr}.hd20MasterContextGrid{grid-template-columns:1fr}}`;

document.head.appendChild(style);
document.body.insertAdjacentHTML('beforeend',html);
})();
