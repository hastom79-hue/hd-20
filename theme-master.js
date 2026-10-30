(()=>{'use strict';
const KEY='hd20ThemeCatalogMasterV1',EVENT='hd20-theme-master-updated';
const DEFAULTS=[
 {id:'sort',name:'정리',active:true,children:[
  {id:'sort-unused',name:'불용품·폐자재 정리',active:true,items:['불용 공구·치공구 식별 및 처분','폐자재·스크랩 종류별 분리 배출','사용기한 경과 소모품 제거']},
  {id:'sort-wip',name:'재공품·잔재물 정리',active:true,items:['장기 방치 재공품 식별 및 처리','가공 잔재·포장재 즉시 정리','공정 주변 불필요 자재 제거']},
  {id:'sort-doc',name:'문서·공용품 정리',active:true,items:['현장 게시 구버전 문서 제거','개인물품과 공용품 구분','미사용 비품·치공구 정리']}
 ]},
 {id:'set',name:'정돈',active:true,children:[
  {id:'set-qty',name:'정량 관리',active:true,items:['자재·부품별 적정 보유수량 설정','최소·최대 재고 기준 표시','기준수량 초과·부족 시 보충·반출 조치','라인사이드 재고와 실제 소요량 일치']},
  {id:'set-place',name:'정위치 관리',active:true,items:['공구·치공구 지정 위치 표시','자재·재공품 보관 위치 구획','사용 후 원위치 복귀','대차·운반구 주차 위치 준수','통로·작업공간 적치금지 구역 준수']}
 ]},
 {id:'visual',name:'시각화관리',active:true,children:[
  {id:'visual-zone',name:'구역·위치 시각화',active:true,items:['구역·통로 경계선 식별 가능','보관 위치명·번호와 실제 위치 일치','작업장·설비·공정 명칭 표준화']},
  {id:'visual-id',name:'자재·재공품 식별',active:true,items:['품번·품명·수량 식별표시','양품·불량·보류품 구분표시','선입선출 방향·기준 표시']},
  {id:'visual-standard',name:'기준·현황 시각화',active:true,items:['작업·점검 표준을 작업위치에 게시','정상·이상 상태 사진 기준 게시','점검·개선 진행현황 최신화 및 실물 일치']},
  {id:'visual-safety',name:'안전·설비 표시',active:true,items:['위험·주의 표지의 위치·가시성 확보','설비 조작·점검 포인트 표시','비상구·소화전·비상정지 위치 표시']}
 ]},
 {id:'clean',name:'청소',active:true,children:[
  {id:'clean-floor',name:'바닥·통로 청소',active:true,items:['바닥 분진·이물질 제거','누유·오염 즉시 제거 및 발생원 표시','배수구·집수정 막힘·오염 관리']},
  {id:'clean-equip',name:'설비·장비 청소',active:true,items:['설비 외관·커버 표면 오염 제거','설비 하부·후면·틈새 청소 사각 관리','청소 중 발견한 누유·풀림 이상 등록']},
  {id:'clean-work',name:'작업대·공구 청소',active:true,items:['작업대·치공구 잔재물 제거','공구 사용 후 세척·건조','청소도구 지정 위치 보관 및 청결 유지']},
  {id:'clean-env',name:'환경·공용구역 청소',active:true,items:['폐기물 보관장소 청결 유지','휴게·세척·공용시설 청결 유지','분진·악취 등 오염 발생원 관리']}
 ]},
 {id:'autonomous',name:'설비자주보전',active:true,children:[
  {id:'am-inspect',name:'일상점검·청결보전',active:true,items:['설비 일상점검 항목·주기 준수','점검 중 이상징후 발견·기록','점검·청소 접근공간 확보']},
  {id:'am-lube',name:'급유·윤활 관리',active:true,items:['급유 포인트 식별표시','급유량·주기 기준 준수','누유·비산 및 오염 원인 제거']},
  {id:'am-consumable',name:'소모품·마모 관리',active:true,items:['필터·벨트 등 소모품 교체주기 관리','마모한계·교체판정 기준 표시','교체·보충 이력 기록']},
  {id:'am-basic',name:'설비 기본조건 관리',active:true,items:['체결부 풀림·누락·파손 확인','센서·커버·안전장치 정상상태 유지','설비 주변 불필요 물품 제거']}
 ]}
];
const clone=v=>JSON.parse(JSON.stringify(v));
function read(){try{const v=JSON.parse(localStorage.getItem(KEY)||'null');return Array.isArray(v)&&v.length?v:clone(DEFAULTS)}catch{return clone(DEFAULTS)}}
function clean(v){return (Array.isArray(v)?v:[]).map((g,gi)=>({id:String(g.id||'g'+gi),name:String(g.name||''),active:g.active!==false,children:(Array.isArray(g.children)?g.children:[]).map((c,ci)=>({id:String(c.id||g.id+'-'+ci),name:String(c.name||''),active:c.active!==false,items:(Array.isArray(c.items)?c.items:[]).map(String).filter(Boolean)}))}))}
function checklist(){return read().filter(g=>g.active).flatMap(g=>g.children.filter(c=>c.active).flatMap(c=>c.items.map(item=>({cat:c.name,item,group:g.name,groupId:g.id,themeId:c.id}))))}
function save(v){const d=clean(v);if(!d.some(g=>g.active&&g.children.some(c=>c.active&&c.items.length)))throw Error('사용 중인 세부 테마와 점검항목이 최소 1개 필요합니다.');localStorage.setItem(KEY,JSON.stringify(d));window.dispatchEvent(new CustomEvent(EVENT,{detail:{catalog:d,checklist:checklist()}}));return d}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function attach(){
 const tabs=document.querySelector('#masterModal .masterTabs'),box=document.querySelector('#masterModal .masterInfoBox');if(!tabs||!box)return false;
 let btn=tabs.querySelector('[data-master-tab="integrated-theme"]');if(!btn){btn=document.createElement('button');btn.type='button';btn.dataset.masterTab='integrated-theme';btn.textContent='5S 테마관리';tabs.appendChild(btn)}
 let panel=document.getElementById('hd20ThemeCatalogPanel');if(!panel){panel=document.createElement('section');panel.id='hd20ThemeCatalogPanel';panel.className='imfPanel';panel.style.display='none';panel.innerHTML='<div id="hd20ThemeCatalogBody"></div>';box.appendChild(panel)}
 btn.onclick=()=>show();tabs.addEventListener('click',e=>{const b=e.target.closest('[data-master-tab]');if(b&&b!==btn)panel.style.display='none'},true);
 return true;
}
function show(){const p=document.getElementById('hd20ThemeCatalogPanel');if(!p)return;document.querySelectorAll('#masterModal .imfPanel').forEach(x=>x.style.display='none');p.style.display='block';document.querySelectorAll('#masterModal .masterTabs button').forEach(b=>b.classList.toggle('on',b.dataset.masterTab==='integrated-theme'));draw()}
function draw(){
 const host=document.getElementById('hd20ThemeCatalogBody');if(!host)return;
 let draft=clean(read()),activeGroup=draft.find(g=>g.active)?.id||draft[0]?.id,activeChild=null;
 host.innerHTML='<section class="imfSec"><h4>5S 테마 기준정보</h4><div class="imfNote">상위 테마 5개를 기준으로 하위 세부 테마와 현장 점검항목을 관리합니다. 여기서 저장한 사용 중 항목만 테마점검의 계획·Audit 선택항목으로 연동됩니다. 기존 점검 이력은 당시 저장된 판정 데이터로 보존됩니다.</div><div class="tmLayout"><aside class="tmGroups" id="tmGroups"></aside><main class="tmMain"><div class="tmToolbar"><select id="tmChild"></select><button type="button" id="tmAddChild">+ 세부 테마 추가</button></div><div id="tmEditor"></div></main></div><div class="imfFoot"><span id="tmStatus" role="status" aria-live="polite"></span><button type="button" class="imfBtn" id="tmSave">기준정보 저장 및 테마점검 연동</button></div></section>';
 const groups=host.querySelector('#tmGroups'),childSel=host.querySelector('#tmChild'),editor=host.querySelector('#tmEditor');
 const activeG=()=>draft.find(g=>g.id===activeGroup),activeC=()=>activeG()?.children.find(c=>c.id===activeChild);
 function render(){
  groups.innerHTML=draft.map(g=>'<button type="button" data-group="'+esc(g.id)+'" class="'+(g.id===activeGroup?'on':'')+'"><span>'+esc(g.name)+'</span><small>'+g.children.filter(c=>c.active).length+'개 세부 테마</small></button>').join('');
  const g=activeG();if(!g)return;
  childSel.innerHTML=g.children.map(c=>'<option value="'+esc(c.id)+'">'+esc(c.name)+(c.active?'':' · 사용중지')+'</option>').join('');
  if(!g.children.some(c=>c.id===activeChild))activeChild=g.children[0]?.id||null;childSel.value=activeChild||'';
  const c=activeC();if(!c){editor.innerHTML='<p class="tmEmpty">세부 테마를 추가하세요.</p>';return}
  editor.innerHTML='<div class="tmEditHead"><label>상위 테마<input value="'+esc(g.name)+'" disabled></label><label>세부 테마명<input id="tmName" maxlength="80" value="'+esc(c.name)+'"></label><label class="tmActive"><input id="tmActive" type="checkbox" '+(c.active?'checked':'')+'> 사용</label></div><label class="tmItemsLabel">세부 점검항목 <small>한 줄에 하나씩 입력 · 현장에서 적합/미흡을 판정할 수 있는 구체적인 문장</small><textarea id="tmItems" rows="12">'+esc(c.items.join('\n'))+'</textarea><div class="tmActions"><button type="button" id="tmApply">편집 반영</button><button type="button" id="tmDelete">삭제</button></div>';
 }
 function apply(){const c=activeC();if(!c)return true;const name=host.querySelector('#tmName').value.trim(),items=host.querySelector('#tmItems').value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);if(!name){host.querySelector('#tmStatus').textContent='세부 테마명을 입력하세요.';return false}if(new Set(items).size!==items.length){host.querySelector('#tmStatus').textContent='중복된 점검항목이 있습니다.';return false}c.name=name;c.items=items;c.active=host.querySelector('#tmActive').checked;return true}
 groups.onclick=e=>{const b=e.target.closest('[data-group]');if(!b)return;if(!apply())return;activeGroup=b.dataset.group;activeChild=activeG()?.children[0]?.id||null;render()};
 childSel.onchange=()=>{if(!apply())return;activeChild=childSel.value;render()};
 host.querySelector('#tmAddChild').onclick=()=>{const g=activeG();if(!g)return;const id=g.id+'-'+Date.now();g.children.push({id,name:'신규 세부 테마',active:true,items:[]});activeChild=id;render();host.querySelector('#tmName')?.focus()};
 editor.onclick=e=>{if(e.target.id==='tmApply'){if(apply()){host.querySelector('#tmStatus').textContent='편집 내용이 임시 반영되었습니다. 최종 저장을 눌러야 기준정보에 저장됩니다.';render()}}if(e.target.id==='tmDelete'){const c=activeC();if(!c)return;if(!confirm('세부 테마를 삭제하시겠습니까? 기존 점검 이력은 유지됩니다.'))return;activeG().children=activeG().children.filter(x=>x.id!==c.id);activeChild=activeG().children[0]?.id||null;render()}};
 host.querySelector('#tmSave').onclick=()=>{if(!apply())return;try{save(draft);host.querySelector('#tmStatus').textContent='저장 완료 · 테마점검 계획 및 Audit에 연동되었습니다.';draw()}catch(e){host.querySelector('#tmStatus').textContent=e.message}};
 render();
}
const style=document.createElement('style');style.textContent='#hd20ThemeCatalogPanel .tmLayout{display:grid;grid-template-columns:240px minmax(0,1fr);gap:14px;padding:14px 18px}#hd20ThemeCatalogPanel .tmGroups{display:flex;flex-direction:column;gap:6px}#hd20ThemeCatalogPanel .tmGroups button{display:flex;justify-content:space-between;align-items:center;gap:8px;text-align:left;padding:11px;border:1px solid #dce6ed;border-radius:8px;background:#fff;color:#254a62;cursor:pointer}#hd20ThemeCatalogPanel .tmGroups button.on{border-color:#4385b2;background:#f0f7fb}#hd20ThemeCatalogPanel .tmGroups small{color:#718797;white-space:nowrap}#hd20ThemeCatalogPanel .tmMain{min-width:0;border:1px solid #e0e8ee;border-radius:9px;padding:14px}#hd20ThemeCatalogPanel .tmToolbar{display:flex;gap:8px;margin-bottom:14px}#hd20ThemeCatalogPanel select,#hd20ThemeCatalogPanel input:not([type=checkbox]),#hd20ThemeCatalogPanel textarea{box-sizing:border-box;border:1px solid #cbd9e2;border-radius:7px;padding:9px;font:inherit;min-width:0}#hd20ThemeCatalogPanel .tmToolbar select{flex:1}#hd20ThemeCatalogPanel .tmEditHead{display:grid;grid-template-columns:1fr 1fr auto;gap:10px;align-items:end}#hd20ThemeCatalogPanel .tmEditHead label,#hd20ThemeCatalogPanel .tmItemsLabel{display:flex;flex-direction:column;gap:6px;font-size:12px;font-weight:700;color:#4a6679}#hd20ThemeCatalogPanel .tmEditHead input{width:100%}#hd20ThemeCatalogPanel .tmItemsLabel{margin-top:16px}#hd20ThemeCatalogPanel .tmItemsLabel small{font-weight:400;color:#718797}#hd20ThemeCatalogPanel textarea{width:100%;margin-top:8px;resize:vertical}#hd20ThemeCatalogPanel .tmActions{display:flex;gap:8px;margin-top:10px}#hd20ThemeCatalogPanel button{cursor:pointer}#hd20ThemeCatalogPanel .tmActions button,#hd20ThemeCatalogPanel .tmToolbar button{border:1px solid #cbd9e2;border-radius:7px;padding:8px 12px;background:#fff;color:#35576d}#hd20ThemeCatalogPanel .tmActive{display:flex;align-items:center;gap:6px;font-size:12px;color:#4a6679}#hd20ThemeCatalogPanel .tmActive input{width:16px;height:16px}#hd20ThemeCatalogPanel .imfFoot{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px 18px}@media(max-width:760px){#hd20ThemeCatalogPanel .tmLayout{grid-template-columns:1fr}#hd20ThemeCatalogPanel .tmGroups{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}#hd20ThemeCatalogPanel .tmEditHead{grid-template-columns:1fr}}';document.head.appendChild(style);
window.HD20ThemeMaster={key:KEY,event:EVENT,catalog:read,checklist,save,defaults:()=>clone(DEFAULTS)};
let tries=0;const boot=()=>{if(attach())return;if(++tries<100)setTimeout(boot,120)};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();