(()=>{'use strict';
/* Applies to every .awTable across 5S 활동관리 / 고도화 작업장 / Audit 관리 /
 * 문제점·개선조치: a search box, click-to-sort headers, client-side
 * "더 보기" pagination, and click-a-row-for-detail popup. Purely additive —
 * doesn't touch each tab's own render logic, so it can't break the
 * Canonical Source data flow those already have. */
const STYLE='tableEnhanceSuiteStyle';
const PAGE_SIZE=25;

function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

function css(){
  if(document.getElementById(STYLE))return;
  const s=document.createElement('style');s.id=STYLE;
  s.textContent=`
  .teToolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 9px}
  .teSearch{flex:1;min-width:160px;max-width:280px;border:1px solid #cbdbe5;border-radius:8px;padding:8px 11px;font-size:15px}
  .teCount{font-size:14px;color:#6d8394;font-weight:800}
  .teMore{margin:10px 0 2px;text-align:center}
  .teMore button{border:1px solid #cbdbe5;border-radius:8px;background:#fff;padding:8px 16px;font-size:14.5px;font-weight:900;color:#234c69;cursor:pointer}
  .teMore button:hover{background:#f0f6fa}
  .awTable thead th{cursor:pointer;user-select:none;position:relative}
  .awTable thead th:hover{background:#e3edf3}
  .awTable thead th.teSortAsc:after{content:' ▲';font-size:12.5px}
  .awTable thead th.teSortDesc:after{content:' ▼';font-size:12.5px}
  .awTable tbody tr{cursor:pointer;transition:background .12s}
  .awTable tbody tr:hover{background:#f2f8fc!important}
  .awTable tbody tr.teHidden{display:none}
  .awCard{transition:box-shadow .18s ease,transform .18s ease}
  .awCard:hover{box-shadow:0 8px 22px rgba(18,42,60,.09)}
  @keyframes teFadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
  .awTable tbody{animation:teFadeIn .25s ease both}
  .teRowModal{position:fixed;inset:0;z-index:100200;display:none;align-items:center;justify-content:center;padding:24px;background:rgba(12,34,51,.4);backdrop-filter:blur(2px)}
  .teRowModal.on{display:flex}
  .teRowBox{width:min(640px,94vw);max-height:86vh;overflow:auto;background:#fff;border-radius:14px;box-shadow:0 26px 70px rgba(8,30,49,.28)}
  .teRowHead{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:15px 18px;background:linear-gradient(90deg,#12324d,#1a4d78);color:#fff;border-radius:14px 14px 0 0}
  .teRowHead b{font-size:18.5px}
  .teRowHead button{border:0;background:#ffffff26;color:#fff;border-radius:8px;width:30px;height:30px;font-size:20.5px;cursor:pointer}
  .teRowBody{padding:16px 18px}
  .teRowGrid{display:grid;grid-template-columns:120px 1fr;gap:9px 12px;font-size:16px}
  .teRowGrid b{color:#3e5a70;font-weight:900}
  .teRowGrid span{color:#1c2f40;word-break:break-word}
  `;
  document.head.appendChild(s);
}

function rowModal(){
  let m=document.querySelector('.teRowModal');
  if(m)return m;
  m=document.createElement('div');
  m.className='teRowModal';
  m.innerHTML='<div class="teRowBox"><div class="teRowHead"><b>상세 정보</b><button type="button" aria-label="닫기">×</button></div><div class="teRowBody teRowGrid"></div></div>';
  document.body.appendChild(m);
  const close=()=>m.classList.remove('on');
  m.querySelector('.teRowHead button').onclick=close;
  m.addEventListener('click',e=>{if(e.target===m)close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  return m;
}
function openRowDetail(tr,headers){
  const m=rowModal();
  const cells=[...tr.children].map(td=>td.innerText.trim());
  m.querySelector('.teRowHead b').textContent=cells[0]||'상세 정보';
  m.querySelector('.teRowBody').innerHTML=headers.map((h,i)=>`<b>${esc(h)}</b><span>${esc(cells[i]||'—')}</span>`).join('');
  m.classList.add('on');
}

function enhanceTable(table){
  if(table.dataset.teEnhanced==='1')return;
  if(table.closest('.acTable,.rgTable,.hpGridTable'))return; // leave input-editable / already-modal tables alone
  table.dataset.teEnhanced='1';
  const headers=[...table.querySelectorAll('thead th')].map(th=>th.textContent.trim());
  if(!headers.length)return;
  const tbody=table.querySelector('tbody');
  const wrap=table.closest('.awBody')||table.parentElement;

  // Toolbar
  const toolbar=document.createElement('div');
  toolbar.className='teToolbar';
  toolbar.innerHTML=`<input class="teSearch" type="text" placeholder="검색 (전체 컬럼)"><span class="teCount"></span>`;
  const scrollWrap=table.closest('.acScroll')||table;
  scrollWrap.parentElement.insertBefore(toolbar,scrollWrap);

  let pageSize=PAGE_SIZE;
  const countEl=toolbar.querySelector('.teCount');
  const searchEl=toolbar.querySelector('.teSearch');
  let moreBar=null;

  function allRows(){return [...tbody.querySelectorAll('tr')].filter(tr=>!tr.querySelector('.awEmpty')&&!(tr.children.length===1&&tr.querySelector('td[colspan]')))}
  function apply(){
    const q=searchEl.value.trim().toLowerCase();
    const rows=allRows();
    let visible=0;
    rows.forEach((tr,i)=>{
      const text=tr.innerText.toLowerCase();
      const matches=!q||text.includes(q);
      const withinPage=matches&&visible<pageSize;
      tr.classList.toggle('teHidden',!matches||!withinPage);
      if(matches)visible++;
    });
    const totalMatch=rows.filter(tr=>!q||tr.innerText.toLowerCase().includes(q)).length;
    countEl.textContent=q?`검색결과 ${Math.min(pageSize,totalMatch)}/${totalMatch}건`:`표시 ${Math.min(pageSize,rows.length)}/${rows.length}건`;
    if(totalMatch>pageSize){
      if(!moreBar||!moreBar.isConnected){moreBar=document.createElement('div');moreBar.className='teMore';moreBar.innerHTML='<button type="button">더 보기 ▾</button>';scrollWrap.insertAdjacentElement('afterend',moreBar);moreBar.querySelector('button').onclick=()=>{pageSize+=PAGE_SIZE;apply()}}
      moreBar.style.display='';
    }else if(moreBar)moreBar.style.display='none';
  }
  searchEl.addEventListener('input',()=>{pageSize=PAGE_SIZE;apply()});

  // Sortable headers
  const ths=[...table.querySelectorAll('thead th')];
  ths.forEach((th,ci)=>{
    if(th.textContent.trim()==='선택')return;
    let dir=0;
    th.addEventListener('click',()=>{
      ths.forEach(x=>x.classList.remove('teSortAsc','teSortDesc'));
      dir=dir===1?-1:1;
      th.classList.add(dir===1?'teSortAsc':'teSortDesc');
      const rows=allRows();
      rows.sort((a,b)=>{
        const av=a.children[ci]?.innerText.trim()||'',bv=b.children[ci]?.innerText.trim()||'';
        const an=parseFloat(av.replace(/[^0-9.\-]/g,'')),bn=parseFloat(bv.replace(/[^0-9.\-]/g,''));
        if(!isNaN(an)&&!isNaN(bn)&&/^[-0-9.,%건일곳년월Lv]*$/.test(av))return dir*(an-bn);
        return dir*av.localeCompare(bv,'ko');
      });
      rows.forEach(r=>tbody.appendChild(r));
      apply();
    });
  });

  // Row click -> detail (skip tables that already have their own
  // row-click behavior, e.g. amCases opens a response panel on ID click)
  if(!table.classList.contains('amCases')){
    tbody.addEventListener('click',e=>{
      const tr=e.target.closest('tr');
      if(!tr||tr.querySelector('.awEmpty')||e.target.closest('input,select,button,a,textarea,label,[class*=Link]'))return;
      openRowDetail(tr,headers);
    });
  }

  apply();
  // Re-apply whenever the tbody is re-rendered by its owning script
  new MutationObserver(muts=>{
    if(table.dataset.teReflow==='1')return;
    table.dataset.teReflow='1';
    pageSize=Math.max(pageSize,PAGE_SIZE);
    apply();
    table.dataset.teReflow='0';
  }).observe(tbody,{childList:true});
}

function scan(){
  css();
  document.querySelectorAll('.awTable, .amCases').forEach(enhanceTable);
}

function boot(){
  let n=0;
  const run=()=>{scan();if(++n<40)setTimeout(run,300)};
  run();
  ['hd20-gmes-5s-imported','hd20-gmes-5s-judged','hd20-followup-updated','hd20-action-updated'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(scan,150)));
  document.addEventListener('click',e=>{if(e.target.closest('.beginnerNav'))setTimeout(scan,200)});
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
