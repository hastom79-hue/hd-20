(()=>{
const STYLE='hd20ExpertBotFinalStyle',ERR='hd20ExpertBotErrorsV1';

/* Per-screen fallback guidance, used when a typed question doesn't match
 * any of the keyword rules in answer() below. */
const KNOW={
  dashboard:'대시보드는 KPI 절대값보다 추이·팀 편차·고도화 수준·유지성과·조치완료의 연결관계를 함께 봐야 합니다.',
  conversion:'성과전환 분석은 활동→후보→확정→유지 4단계 전환율을 함께 봐야 합니다. 활동은 많은데 전환이 낮으면 판정 병목이나 기준 미충족을 의심하세요.',
  activity:'5S 활동은 정리·정돈·청소·시각화·위험구역관리·5S 고도화 6개 유형의 분포와 월별 추이를 함께 확인해야 합니다.',
  workplace:'고도화 사례는 현장 등록 후 생산혁신팀과 5S 모듈이 3대 기준 충족 여부를 판정하고, 확정 사례만 수준맵과 후속 1M·3M·6M 관리에 반영합니다.',
  audit:'Audit는 총점만 보지 않고 반복 부적합, 동일·유사 재발, 조치기한, 1M·3M·6M 유지성을 함께 봅니다.',
  action:'개선조치는 BEFORE→조치→AFTER→효과확인→재발 여부까지 닫혀야 완료로 봅니다.',
  master:'생산팀·팀장·목표·5S 유형·Audit 주기·판정기준 Master가 틀리면 모든 KPI와 Workflow가 왜곡됩니다.'
};

/* 주요 Q&A 탭에 상시 노출되는 아코디언 목록. 5S/고도화/Audit/개선조치 용어
 * 기준으로 작성 -- 이 프로젝트와 무관한 다른 시스템(GMES 과제관리 등)의
 * 용어(과제 등록, P/D/C/A, M+1/M+2/M+3 등)는 쓰지 않는다. */
const FAQ=[
  ['5S 개선활동은 어떻게 등록하나요?','③ 5S 활동관리 탭의 「5S 개선활동 신규 등록」 폼에서 활동일·5S 구분·생산팀·개선 전 문제점·개선내용을 입력하고 등록합니다. BEFORE/AFTER 사진도 함께 첨부할 수 있습니다.'],
  ['정리·정돈·청소로도 고도화 사례가 되나요?','아니요. 5S 고도화는 시각화·형적관리 / 인간공학적 Green Zone / 정량축소·정위치 변경, 3대 기준으로만 인정됩니다. 5S 구분을 「5S 고도화」로 등록한 건만 고도화 후보로 추천할 수 있습니다.'],
  ['고도화 후보는 어떻게 공식 확정되나요?','현장 등록은 실적이 아닙니다. 생산혁신팀·5S 모듈이 3대 기준 충족 여부를 판정해 「확정/보완요청/미확정」으로 나누고, 확정된 사례만 수준맵·KPI에 반영됩니다.'],
  ['1M·3M·6M 후속점검은 무엇인가요?','고도화 확정 이후 1개월·3개월·6개월 시점에 유지 상태를 재점검하는 Lifecycle입니다. ⑤ Audit 관리 탭에서 기한임박/경과 상태를 확인할 수 있습니다.'],
  ['Audit 부적합·조건부는 어떻게 처리하나요?','⑤ Audit 관리에서 점검항목별 1~5점과 이슈사항을 등록하면, 반복 부적합 건은 ⑥ 문제점·개선조치로 자동 연계됩니다. 재발 시 단순 재조치보다 근본원인을 먼저 확인하세요.'],
  ['개선조치가 지연되면 어떻게 되나요?','조치기한을 넘기면 자동으로 「경과」 상태가 되고, ⑥ 문제점·개선조치 탭의 현황 목록에서 확인할 수 있습니다. 팀장에게 메일 또는 Outlook으로 알림을 보낼 수 있습니다.'],
  ['KPI 숫자가 이상해 보이면 어떻게 확인하나요?','대부분의 KPI/차트/맵은 클릭하면 해당 숫자를 구성하는 원본 데이터가 팝업으로 뜹니다. 절대값보다 이 상세 Grid로 무엇이 포함됐는지 먼저 확인하세요.'],
  ['기준정보(팀·목표·이메일)는 어디서 관리하나요?','⑦ 기준정보 탭 또는 상단 「통합기준정보」 버튼에서 생산팀 표시순서·분기별 목표·팀장 이메일을 관리합니다. 이 값이 틀리면 메일 알림과 KPI가 함께 틀어집니다.']
];

function active(){const b=document.querySelector('.beginnerNav button.active');return b?.dataset.key||'dashboard'}
const NAV_LABEL={dashboard:'① 대시보드',conversion:'② 성과전환 분석',activity:'③ 5S 활동관리',workplace:'④ 고도화 작업장',audit:'⑤ Audit 관리',action:'⑥ 문제점·개선조치',master:'⑦ 기준정보'};
function activeLabel(){return NAV_LABEL[active()]||NAV_LABEL.dashboard}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function loadErr(){try{return JSON.parse(localStorage.getItem(ERR)||'[]')}catch{return[]}}
function saveErr(v){localStorage.setItem(ERR,JSON.stringify(v))}

function answer(q){
  const t=q.toLowerCase();
  if(/후보|판정|확정|고도화/.test(t))return['고도화 사례 판정','현장 등록 자체는 실적이 아닙니다. 생산혁신팀·5S 모듈이 시각화·형적관리, 인간공학적 Green Zone, 정량축소·정위치 변경의 3대 기준을 확인하고 확정한 사례만 공식 실적과 수준맵에 반영합니다.','등록→판정→확정','3대 기준','수준맵'];
  if(/audit|오디트|부적합|재발/.test(t))return['Audit 판단','총점보다 반복 미흡과 재발 여부가 중요합니다. 조건부·부적합은 개선조치 Workflow로 연결하고, 3개월 통과 후 6개월에 재발하면 유지관리 체계를 다시 봐야 합니다.','1M·3M·6M','반복부적합','재발'];
  if(/활동|유형|5s/.test(t))return['5S 활동 해석','활동량 자체가 성과는 아닙니다. 6개 활동유형의 편중, 생산팀별 편차, 월별 추이, 고도화 사례 확정으로 이어지는지를 함께 보세요.','6개 유형','팀 편차','월별 추이'];
  if(/kpi|지표|성과/.test(t))return['KPI 분석','지표 정의와 분모·분자를 먼저 확인한 뒤 상세 Grid, 팀별 Raw Data, 월별 추이, 관련 지표 순으로 원인을 좁히는 것이 좋습니다.','산식','상세 Grid','Trend'];
  if(/개선|조치|지연/.test(t))return['개선조치 관리','기한초과·반복·안전/품질 영향 건을 우선하고 BEFORE/AFTER와 근인제거 여부를 확인하세요. 완료 후 동일 유형 재발이면 임시조치였을 가능성이 큽니다.','기한','BEFORE/AFTER','근인제거'];
  const k=active();return['현재 화면 전문가 가이드',KNOW[k]||KNOW.dashboard,'HDPS','5S','운영관리'];
}

function css(){
  if(document.getElementById(STYLE))return;
  const s=document.createElement('style');s.id=STYLE;
  s.textContent=`
.hd20AiFab{position:fixed;right:20px;bottom:20px;z-index:13000;width:56px;height:56px;border:1px solid #cad9e4;border-radius:17px;background:#fff;color:#173f61;box-shadow:0 12px 30px rgba(24,61,88,.18);font-weight:950;font-size:20.5px;cursor:pointer}
.hd20AiPanel{position:fixed;right:20px;bottom:88px;z-index:13000;width:min(520px,calc(100vw - 28px));height:min(680px,calc(100vh - 120px));display:none;flex-direction:column;background:#fff;border:1px solid #cbdbe6;border-radius:17px;box-shadow:0 24px 70px rgba(31,62,88,.24);overflow:hidden}
.hd20AiPanel.on{display:flex}
.hd20AiHead{display:flex;justify-content:space-between;gap:12px;padding:16px 18px;background:linear-gradient(135deg,#12324d,#1a4d78)}
.hd20AiHead b{display:block;color:#fff;font-size:19.5px}
.hd20AiHead small{display:block;margin-top:3px;color:#c3d6e4;font-size:13.5px}
.hd20AiHead button{border:0;background:#ffffff26;color:#fff;width:28px;height:28px;border-radius:8px;font-size:19.5px;cursor:pointer}
.hd20AiTabs{display:flex;gap:6px;padding:9px 10px;border-bottom:1px solid #e5ebef;background:#f7fafc}
.hd20AiTabs button{flex:1;border:1px solid #d2e0e9;background:#fff;border-radius:9px;padding:8px 6px;font-size:14.5px;font-weight:900;color:#3d6280;cursor:pointer}
.hd20AiTabs button.on{background:#173f61;border-color:#173f61;color:#fff}
.hd20AiBody{flex:1;overflow:auto;padding:14px 16px;background:#fbfdff}
.hd20AiPane{display:none}
.hd20AiPane.on{display:block}
.hd20AiPane h4{margin:0 0 10px;font-size:17.5px;color:#173a57}
.hd20AiFaqItem{border:1px solid #dfe8ee;border-radius:10px;margin-bottom:7px;overflow:hidden;background:#fff}
.hd20AiFaqQ{display:flex;align-items:center;gap:8px;padding:10px 11px;cursor:pointer;font-size:15px;font-weight:850;color:#20415c}
.hd20AiFaqQ .arrow{transition:transform .15s;color:#7c93a4;font-size:12.5px}
.hd20AiFaqItem.open .arrow{transform:rotate(90deg)}
.hd20AiFaqA{display:none;padding:0 12px 11px 27px;font-size:14.5px;line-height:1.6;color:#48657a}
.hd20AiFaqItem.open .hd20AiFaqA{display:block}
.hd20AiAsk{margin-top:12px;border:1px solid #cbdbe6;border-radius:12px;background:#fff;padding:8px;display:grid;grid-template-columns:1fr auto;gap:8px}
.hd20AiAsk input{border:0;outline:0;font:inherit;padding:8px;color:#294b62}
.hd20AiAsk button{border:0;border-radius:9px;background:#173f61;color:#fff;font-weight:900;padding:0 16px;cursor:pointer}
.hd20AiAnswer{margin-top:10px;border:1px solid #dde7ed;border-radius:10px;padding:11px 12px;background:#fff;font-size:14.5px;line-height:1.6;color:#294b62}
.hd20AiAnswer b{display:block;margin-bottom:6px;color:#173a57;font-size:16px}
.hd20AiAnswer .tags span{display:inline-block;margin:7px 4px 0 0;padding:3px 7px;border-radius:999px;background:#eef6fb;color:#28658e;font-size:12.5px;font-weight:900}
.hd20AiReport textarea{width:100%;box-sizing:border-box;min-height:110px;border:1px solid #cad9e3;border-radius:10px;padding:10px;font:inherit;resize:vertical}
.hd20AiReport .hint{margin:8px 0 12px;font-size:13.5px;color:#7c93a4}
.hd20AiReport button{border:0;border-radius:9px;background:#173f61;color:#fff;font-weight:900;padding:10px 16px;cursor:pointer}
.hd20AiErrRow{padding:9px 0;border-bottom:1px solid #eef2f5}
.hd20AiErrRow .txt{font-size:15px;color:#294b62;font-weight:700}
.hd20AiErrRow small{display:block;margin-top:3px;color:#8798a6;font-size:13px}
.hd20AiEmpty{padding:18px 4px;text-align:center;color:#8798a6;font-size:14.5px}
.hd20AiFoot{padding:8px 16px;text-align:center;font-size:12px;color:#8798a6;background:#fff;border-top:1px solid #eef2f5}
@media(max-width:600px){.hd20AiPanel{right:10px;bottom:78px;width:calc(100vw - 20px);height:78vh}.hd20AiFab{right:12px;bottom:12px}}
`;
  document.head.appendChild(s);
}

function renderErrHistory(pane){
  const v=loadErr();
  pane.innerHTML=`<h4>오류 이력</h4>${v.length?v.slice(0,30).map(x=>`<div class="hd20AiErrRow"><div class="txt">${esc(x.text)}</div><small>${esc(x.at)} · ${esc(x.page||'')}</small></div>`).join(''):'<div class="hd20AiEmpty">접수된 오류가 없습니다.</div>'}`;
}

function build(){
  css();
  if(document.querySelector('.hd20AiFab'))return;
  const fab=document.createElement('button');
  fab.className='hd20AiFab';fab.type='button';fab.textContent='AI';fab.title='HDPS · 5S Expert AI';

  const p=document.createElement('section');
  p.className='hd20AiPanel';
  p.innerHTML=`
    <div class="hd20AiHead">
      <div><b>HDPS · 5S Expert AI</b><small>사용 가이드 · 주요 Q&A · 오류접수</small></div>
      <button type="button" class="hd20AiClose">×</button>
    </div>
    <div class="hd20AiTabs">
      <button type="button" class="on" data-tab="qa">주요 Q&A</button>
      <button type="button" data-tab="report">오류 접수</button>
      <button type="button" data-tab="history">오류 이력</button>
    </div>
    <div class="hd20AiBody">
      <div class="hd20AiPane on" data-pane="qa">
        <h4>주요 Q&A</h4>
        ${FAQ.map(([q,a],i)=>`<div class="hd20AiFaqItem" data-i="${i}"><div class="hd20AiFaqQ"><span class="arrow">▶</span>${esc(q)}</div><div class="hd20AiFaqA">${esc(a)}</div></div>`).join('')}
        <div class="hd20AiAsk"><input type="text" placeholder="사용방법을 질문하세요"><button type="button">질문</button></div>
        <div class="hd20AiAnswerHost"></div>
      </div>
      <div class="hd20AiPane" data-pane="report">
        <h4>오류 접수</h4>
        <div class="hint hd20AiCtxHint">현재 화면(<span class="hd20AiCtxLabel">${esc(activeLabel())}</span>)에서 발생한 오류 현상을 최대한 구체적으로 적어주세요. 발생 동작 / 기대결과 / 실제결과를 함께 적으면 원인 추적이 정확해집니다.</div>
        <textarea placeholder="예: 고도화 수준 Map 팝업이 열리지 않습니다."></textarea>
        <div style="text-align:right;margin-top:10px"><button type="button" class="hd20AiSubmitErr">접수</button></div>
      </div>
      <div class="hd20AiPane" data-pane="history"></div>
    </div>
    <div class="hd20AiFoot">Prototype expert assistant · 실제 OpenAI API 연동 전 UI/업무지식 시연 · 오류 접수는 이 브라우저에만 저장됩니다</div>
  `;
  document.body.append(fab,p);

  fab.onclick=()=>{p.classList.toggle('on');refreshCtxLabel()};
  p.querySelector('.hd20AiClose').onclick=()=>p.classList.remove('on');

  // Tabs
  p.querySelectorAll('.hd20AiTabs button').forEach(btn=>btn.onclick=()=>{
    p.querySelectorAll('.hd20AiTabs button').forEach(b=>b.classList.toggle('on',b===btn));
    const key=btn.dataset.tab;
    p.querySelectorAll('.hd20AiPane').forEach(pane=>pane.classList.toggle('on',pane.dataset.pane===key));
    if(key==='history')renderErrHistory(p.querySelector('[data-pane="history"]'));
    if(key==='report')refreshCtxLabel();
  });

  // The '현재 화면' hint (and the answer()/report page context) must reflect
  // whichever tab is ACTUALLY active right now, not just whatever was active
  // the moment this panel was first built. Refresh on every main-nav click,
  // and once more whenever the panel itself is opened.
  const refreshCtxLabel=()=>{const el=p.querySelector('.hd20AiCtxLabel');if(el)el.textContent=activeLabel()};
  document.addEventListener('click',e=>{if(e.target.closest('.beginnerNav button'))setTimeout(refreshCtxLabel,30)});

  // FAQ accordion
  p.querySelectorAll('.hd20AiFaqItem').forEach(item=>{
    item.querySelector('.hd20AiFaqQ').onclick=()=>item.classList.toggle('open');
  });

  // Free-text question -> reuse the keyword-matched answer() engine
  const askInput=p.querySelector('.hd20AiAsk input'),askBtn=p.querySelector('.hd20AiAsk button'),ansHost=p.querySelector('.hd20AiAnswerHost');
  const ask=()=>{
    const q=askInput.value.trim();if(!q)return;
    const a=answer(q);
    ansHost.innerHTML=`<div class="hd20AiAnswer"><b>${esc(a[0])}</b>${esc(a[1])}<div class="tags">${a.slice(2).map(x=>`<span>${esc(x)}</span>`).join('')}</div></div>`;
  };
  askBtn.onclick=ask;
  askInput.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();ask()}});

  // Error report
  const reportTa=p.querySelector('[data-pane="report"] textarea');
  p.querySelector('.hd20AiSubmitErr').onclick=()=>{
    const text=reportTa.value.trim();
    if(!text)return alert('오류 현상을 입력해 주세요.');
    const v=loadErr();
    v.unshift({text,at:new Date().toLocaleString('ko-KR'),page:active()});
    saveErr(v.slice(0,100));
    reportTa.value='';
    alert('오류가 접수되었습니다. (Prototype: 이 브라우저 LocalStorage에 저장)');
  };
}

document.readyState==='loading'?document.addEventListener('DOMContentLoaded',build,{once:true}):build();
})();
