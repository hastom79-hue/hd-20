/* 사용자 지시: "테마 점검이란 월별로 라인별 취약점을 5S 테마로 세분화하여 설정해서 5S모듈 조직을
   주관으로 테마 활동 오디트를 통해서 개선요청 등록을 하면 소속 팀에서 조치를 통해서 개선조치
   등록관리가 활성화되는 방향으로 운영하는 것을 말한다" — 고도화·표준화 탭은 유지하고, 이 신규
   "테마 점검" 탭을 별도로 추가.

   화면 구성:
   1) 월 선택(기본값: 이번 달)
   2) "작업장(라인) × 5S 테마" 매트릭스 — 선택한 월에 각 작업장·테마 조합에서 등록된 자율개선 건수를
      보여줘, 어느 라인의 어느 5S 테마가 취약한지 한눈에 파악(건수가 많을수록 더 진하게 강조)
   3) 셀 클릭 → 해당 라인·테마의 상세 건 목록
   4) "개선요청 등록" 버튼 → 기존 action-mail-workflow.js 등록 폼을 작업장·5S테마가 미리 채워진
      채로 열어, 발굴된 취약점을 즉시 개선요청으로 연결(소속 생산팀이 조치하도록 개선조치 등록관리로
      이어짐 — 기존 "개선조치·완료관리" 탭과 100% 같은 데이터를 공유). */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const ACT_KEY='hd20GMES5SAutoImproveRawV1';
const THEMES=['정리','정돈','청소','시각화','위험구역관리','설비 자주보전','5S 고도화'];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function load(){try{const v=JSON.parse(localStorage.getItem(ACT_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
/* 실제 자율개선(activity) 레코드는 라인/구역 정보를 area 필드(조립라인·자재구역·공구실·검사대)에
   저장함(통합기준정보 ④업무/팩터의 "작업장" 6종과는 다른 값 체계) — 매트릭스 행은 실제 데이터와
   일치하는 area 값 기준으로 구성해야 매트릭스가 실제로 채워짐. */
function lineOf(x){return x.area||x.workplace||''}
function lines(){return['조립라인','자재구역','공구실','검사대']}
function css(){if(document.getElementById('hd20ThemeStyle'))return;const s=document.createElement('style');s.id='hd20ThemeStyle';
 s.textContent=`
 #awTheme .awHero{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;flex-wrap:wrap}
 #awTheme .themeSubtitle{color:#5c7489;font-size:13px;margin-top:4px}
 #awTheme .themeOwner{display:inline-block;margin-top:6px;padding:3px 10px;border-radius:999px;background:#eef4fb;color:#2c5f8a;font-size:12px;font-weight:700}
 #awTheme .themeControls{display:flex;gap:10px;align-items:center;margin:14px 0}
 #awTheme .themeControls select{padding:7px 10px;border:1px solid #c8d9e5;border-radius:8px;font-size:13px}
 #awTheme table.themeMatrix{width:100%;border-collapse:collapse;font-size:13px}
 #awTheme table.themeMatrix th,#awTheme table.themeMatrix td{border:1px solid #e3eaef;padding:0;text-align:center}
 #awTheme table.themeMatrix th{background:#eef4f8;color:#2c4a63;padding:8px 6px;font-weight:700}
 #awTheme table.themeMatrix td.rowHead{background:#f7fafc;font-weight:700;text-align:left;padding:8px 10px;color:#2c4a63}
 #awTheme table.themeMatrix td.cell button{width:100%;height:46px;border:0;background:transparent;cursor:pointer;font-weight:800;font-size:14px;color:#24445c}
 #awTheme table.themeMatrix td.cell button:hover{outline:2px solid #2c72bb;outline-offset:-2px}
 #awTheme .themeDetail{margin-top:16px;border:1px solid #dce5eb;border-radius:10px;padding:14px;display:none}
 #awTheme .themeDetail.on{display:block}
 #awTheme .themeDetail table{width:100%;border-collapse:collapse;font-size:12.5px;margin-top:8px}
 #awTheme .themeDetail th,#awTheme .themeDetail td{border-bottom:1px solid #e8edf0;padding:7px 8px;text-align:left}
 #awTheme .themeRegisterBtn{margin-top:10px;padding:8px 14px;border:0;border-radius:8px;background:#2c72bb;color:#fff;font-weight:700;cursor:pointer}
 `;document.head.appendChild(s);
}
function monthKey(d){return String(d||'').slice(0,7)}
function thisMonth(){return new Date().toISOString().slice(0,7)}
function monthOptions(){
 const rows=load(),set=new Set(rows.map(x=>monthKey(x.date||x.createdAt)).filter(Boolean));
 set.add(thisMonth());
 return[...set].sort().reverse();
}
function matrixData(month){
 const rows=load().filter(x=>monthKey(x.date||x.createdAt)===month);
 const wps=lines();
 const grid=wps.map(wp=>THEMES.map(th=>rows.filter(x=>lineOf(x)===wp&&(x.type||'')===th)));
 return{wps,grid,rows};
}
function cellColor(n){if(n<=0)return'#ffffff';if(n===1)return'#fff3d6';if(n===2)return'#ffe2a8';if(n<=4)return'#ffc877';return'#ff9d52'}
function render(){
 const host=document.getElementById('awTheme');if(!host)return;
 const month=host.dataset.month||thisMonth();host.dataset.month=month;
 const{wps,grid}=matrixData(month);
 const monthOpts=monthOptions();
 const head='<tr><th>작업장 \\ 5S 테마</th>'+THEMES.map(t=>`<th>${esc(t)}</th>`).join('')+'</tr>';
 const body=wps.map((wp,ri)=>'<tr><td class="rowHead">'+esc(wp)+'</td>'+THEMES.map((th,ci)=>{
   const n=grid[ri][ci].length;
   return `<td class="cell" style="background:${cellColor(n)}"><button type="button" data-wp="${esc(wp)}" data-th="${esc(th)}">${n||''}</button></td>`;
 }).join('')+'</tr>').join('');
 host.innerHTML=`<div class="awHero">
   <div><h2>⑦ 테마 점검</h2><div class="themeSubtitle">월별·라인(작업장)별 5S 테마 취약점을 세분화해 확인하고, 발굴된 취약점을 바로 개선요청으로 등록합니다.</div><span class="themeOwner">5S모듈 주관</span></div>
   <div class="themeControls"><label>점검 월 <select id="themeMonthSel">${monthOpts.map(m=>`<option${m===month?' selected':''}>${m}</option>`).join('')}</select></label></div>
 </div>
 <div class="awRegisterNote" style="margin-top:10px;padding:9px 11px;background:#f1f6fa;border-radius:8px;font-size:12.5px;color:#4d6478;line-height:1.6">
   📋 <b>테마 점검 흐름</b> — 월별·라인별 취약점을 5S 테마로 세분화 설정 → 5S모듈 조직 주관으로 테마 활동 Audit 실시 → 발굴 결과에 따라 개선요청 등록 → 소속 생산팀이 조치 → 개선조치 등록관리(④ 개선조치·완료관리 탭)로 연결.
 </div>
 <div style="overflow:auto;margin-top:12px"><table class="themeMatrix">${head}${body}</table></div>
 <div class="themeDetail" id="themeDetailBox"></div>`;
 $('#themeMonthSel',host).addEventListener('change',e=>{host.dataset.month=e.target.value;render()});
 $$('td.cell button',host).forEach(btn=>btn.addEventListener('click',()=>showDetail(btn.dataset.wp,btn.dataset.th,month)));
}
function showDetail(wp,th,month){
 const box=document.getElementById('themeDetailBox');if(!box)return;
 const rows=load().filter(x=>monthKey(x.date||x.createdAt)===month&&lineOf(x)===wp&&(x.type||'')===th);
 box.classList.add('on');
 const rowsHtml=rows.length?rows.map(x=>`<tr><td>${esc(x.date||'')}</td><td>${esc(x.team||'—')}</td><td>${esc(x.problem||'—')}</td><td>${esc(x.status||'—')}</td></tr>`).join(''):'<tr><td colspan="4" style="text-align:center;color:#8093a2">해당 월·라인·테마에 등록된 건이 없습니다.</td></tr>';
 box.innerHTML=`<b>${esc(wp)} · ${esc(th)} · ${esc(month)}</b> <span style="color:#8093a2;font-size:12.5px">(${rows.length}건)</span>
   <table><thead><tr><th>등록일</th><th>생산팀</th><th>내용</th><th>상태</th></tr></thead><tbody>${rowsHtml}</tbody></table>
   <button type="button" class="themeRegisterBtn" id="themeRegisterBtn">+ 이 취약점으로 개선요청 등록</button>`;
 $('#themeRegisterBtn',box).onclick=()=>goRegister(wp,th,rows[0]?.team);
}
/* "개선요청 등록" 팝업을 작업장·5S테마가 미리 채워진 채로 연다 — 런처의 goActionRegister 흐름을
   재사용(탭 전환 후 등록 버튼 클릭)하고, 폼이 열린 직후 작업장·테마 값을 주입. */
function goRegister(wp,th,team){
 const navBtn=[...document.querySelectorAll('.beginnerNav button')].find(b=>b.textContent.includes('개선조치·완료'));
 navBtn?.click();
 const tryOpen=(n)=>{
   n=n||0;
   const openBtn=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('개선요청 등록'));
   if(openBtn){openBtn.click();setTimeout(()=>prefill(wp,th,team),300);return}
   if(n>40)return;
   setTimeout(()=>tryOpen(n+1),75);
 };
 setTimeout(()=>tryOpen(),300);
}
function prefill(wp,th,team){
 const wSel=document.getElementById('amWorkplace'),tSel=document.getElementById('amType'),teamSel=document.getElementById('amTeam');
 if(wSel&&[...wSel.options].some(o=>o.value===wp))wSel.value=wp;
 if(tSel&&[...tSel.options].some(o=>o.value===th))tSel.value=th;
 if(teamSel&&team&&[...teamSel.options].some(o=>o.value===team))teamSel.value=team;
}
function build(){
 if(document.getElementById('awTheme'))return true;
 const host=document.querySelector('.beginnerHint')||document.querySelector('.beginnerNav');
 if(!host)return false;
 css();
 const section=document.createElement('section');
 section.id='awTheme';section.className='awScreen';
 host.insertAdjacentElement('afterend',section);
 render();
 return true;
}
function boot(){
 let n=0;const run=()=>{if(build())return;if(++n<60)setTimeout(run,100)};run();
 document.addEventListener('click',e=>{if(e.target?.closest?.('.beginnerNav [data-key="theme"]'))setTimeout(render,50)},true);
 window.addEventListener('hd20-activity-updated',()=>{if(document.getElementById('awTheme'))render()});
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
