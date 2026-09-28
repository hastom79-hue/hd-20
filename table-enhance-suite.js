(()=>{'use strict';
/* Applies to every .awTable across 5S 활동관리 / 고도화 작업장 / Audit 관리 /
 * 문제점·개선조치: a search box, click-to-sort headers, client-side
 * "더 보기" pagination, and click-a-row-for-detail popup. Styling lives in
 * the canonical HD20 design layer; this module owns behavior only. */
const PAGE_SIZE=25,VMIN=60;
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function rowModal(){
  let m=document.querySelector('.teRowModal');
  if(m)return m;
  m=document.createElement('div');m.className='teRowModal';
  m.innerHTML='<div class="teRowBox"><div class="teRowHead"><b>상세 정보</b><button type="button" aria-label="닫기">×</button></div><div class="teRowBody teRowGrid"></div></div>';
  document.body.appendChild(m);
  const close=()=>m.classList.remove('on');
  m.querySelector('.teRowHead button').onclick=close;
  m.addEventListener('click',e=>{if(e.target===m)close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  return m;
}
function openRowDetail(tr,headers){
  const m=rowModal(),cells=[...tr.children].map(td=>td.innerText.trim());
  m.querySelector('.teRowHead b').textContent=cells[0]||'상세 정보';
  m.querySelector('.teRowBody').innerHTML=headers.map((h,i)=>`<b>${esc(h)}</b><span>${esc(cells[i]||'—')}</span>`).join('');m.classList.add('on');
}
function enhanceTable(table){
  if(table.dataset.teEnhanced==='1'||table.closest('.acTable,.rgTable,.hpGridTable'))return;
  table.dataset.teEnhanced='1';
  const headers=[...table.querySelectorAll('thead th')].map(th=>th.textContent.trim());if(!headers.length)return;
  const tbody=table.querySelector('tbody'),wrap=table.closest('.awBody')||table.parentElement;
  const toolbar=document.createElement('div');toolbar.className='teToolbar';toolbar.innerHTML='<input class="teSearch" type="text" placeholder="검색 (전체 컬럼)"><span class="teCount"></span>';
  const scrollWrap=table.closest('.acScroll')||table;scrollWrap.parentElement.insertBefore(toolbar,scrollWrap);
  let pageSize=PAGE_SIZE,moreBar=null,store=null,mo=null;const noVirtual=!!table.closest('.gmesImport,.hd20CaseTrace,.hd20ExactTable,[id$="Modal"],.modalBox');const countEl=toolbar.querySelector('.teCount'),searchEl=toolbar.querySelector('.teSearch');
  function domRows(){return [...tbody.querySelectorAll('tr')].filter(tr=>!tr.querySelector('.awEmpty')&&!(tr.children.length===1&&tr.querySelector('td[colspan]')))}
  function allRows(){return store||domRows()}
  function updateMore(totalMatch){if(totalMatch>pageSize){if(!moreBar||!moreBar.isConnected){moreBar=document.createElement('div');moreBar.className='teMore';moreBar.innerHTML='<button type="button">더 보기 ▾</button>';scrollWrap.insertAdjacentElement('afterend',moreBar);moreBar.querySelector('button').onclick=()=>{pageSize+=PAGE_SIZE;apply()}}moreBar.style.display=''}else if(moreBar)moreBar.style.display='none'}
  function apply(){
    const q=searchEl.value.trim().toLowerCase(),rows=allRows();
    if(!noVirtual&&(store||rows.length>VMIN)){
      if(!store){store=rows.slice();table.__teStore=store}
      const txt=tr=>tr.__teT??(tr.__teT=(tr.textContent||'').toLowerCase()),matched=q?store.filter(tr=>txt(tr).includes(q)):store,shown=matched.slice(0,pageSize);
      shown.forEach(tr=>tr.classList.remove('teHidden'));tbody.replaceChildren(...shown);
      countEl.textContent=q?`검색결과 ${shown.length}/${matched.length}건`:`표시 ${shown.length}/${store.length}건`;updateMore(matched.length);
      if(mo)mo.takeRecords();return}
    let visible=0;
    rows.forEach(tr=>{const matches=!q||tr.innerText.toLowerCase().includes(q),withinPage=matches&&visible<pageSize;tr.classList.toggle('teHidden',!matches||!withinPage);if(matches)visible++});
    const totalMatch=rows.filter(tr=>!q||tr.innerText.toLowerCase().includes(q)).length;
    countEl.textContent=q?`검색결과 ${Math.min(pageSize,totalMatch)}/${totalMatch}건`:`표시 ${Math.min(pageSize,rows.length)}/${rows.length}건`;
    if(totalMatch>pageSize){if(!moreBar||!moreBar.isConnected){moreBar=document.createElement('div');moreBar.className='teMore';moreBar.innerHTML='<button type="button">더 보기 ▾</button>';scrollWrap.insertAdjacentElement('afterend',moreBar);moreBar.querySelector('button').onclick=()=>{pageSize+=PAGE_SIZE;apply()}}moreBar.style.display=''}else if(moreBar)moreBar.style.display='none';
  }
  searchEl.addEventListener('input',()=>{pageSize=PAGE_SIZE;apply()});
  const ths=[...table.querySelectorAll('thead th')];ths.forEach((th,ci)=>{if(th.textContent.trim()==='선택')return;let dir=0;th.addEventListener('click',()=>{ths.forEach(x=>x.classList.remove('teSortAsc','teSortDesc'));dir=dir===1?-1:1;th.classList.add(dir===1?'teSortAsc':'teSortDesc');const rows=allRows();rows.sort((a,b)=>{const av=a.children[ci]?.innerText.trim()||'',bv=b.children[ci]?.innerText.trim()||'',an=parseFloat(av.replace(/[^0-9.\-]/g,'')),bn=parseFloat(bv.replace(/[^0-9.\-]/g,''));if(!isNaN(an)&&!isNaN(bn)&&/^[-0-9.,%건일곳년월Lv]*$/.test(av))return dir*(an-bn);return dir*av.localeCompare(bv,'ko')});if(!store)rows.forEach(r=>tbody.appendChild(r));apply()})});
  if(!table.classList.contains('amCases'))tbody.addEventListener('click',e=>{const tr=e.target.closest('tr');if(!tr||tr.querySelector('.awEmpty')||e.target.closest('input,select,button,a,textarea,label,[class*=Link]'))return;openRowDetail(tr,headers)});
  apply();mo=new MutationObserver(recs=>{if(table.dataset.teReflow==='1')return;table.dataset.teReflow='1';
    if(store){const removed=new Set();recs.forEach(r=>r.removedNodes.forEach(n=>removed.add(n)));const cur=domRows(),curSet=new Set(cur),inStore=new Set(store),news=cur.filter(r=>!inStore.has(r));
      if(news.length&&news.length===cur.length){store=null;table.__teStore=null}else{store=store.filter(r=>!(removed.has(r)&&!curSet.has(r))).concat(news);table.__teStore=store}}
    pageSize=Math.max(pageSize,PAGE_SIZE);apply();table.dataset.teReflow='0'});mo.observe(tbody,{childList:true});
}
window.HD20_TABLE_ROWS={all:t=>t&&t.__teStore?t.__teStore:[...(t?.querySelectorAll('tbody tr')||[])]};
function scan(){document.querySelectorAll('.awTable, .amCases').forEach(enhanceTable)}
function boot(){scan();['hd20-gmes-5s-imported','hd20-gmes-5s-judged','hd20-followup-updated','hd20-action-updated'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(scan,150)));document.addEventListener('click',e=>{if(e.target.closest('.beginnerNav'))setTimeout(scan,200)})}
window.addEventListener('hd20-subtab-changed',()=>{setTimeout(scan,0);setTimeout(scan,60);setTimeout(scan,250)});
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();