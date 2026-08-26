(()=>{
const STYLE_ID='maturityMapDrillStyle';
function style(){
 if(document.getElementById(STYLE_ID))return;
 const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
 .maturityMapModal{position:fixed;inset:0;z-index:100500;display:none;align-items:center;justify-content:center;padding:24px;background:rgba(20,35,48,.42);backdrop-filter:blur(4px)}
 .maturityMapModal.on{display:flex}.maturityMapBox{width:min(1260px,96vw);max-height:91vh;display:flex;flex-direction:column;overflow:hidden;border:1px solid #cbdbe6;border-radius:18px;background:#fff;box-shadow:0 24px 70px rgba(17,47,69,.25)}
 .maturityMapHead{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:16px 20px;border-bottom:1px solid #dce6ed;background:linear-gradient(135deg,#f9fcff,#eef6fb)}
 .maturityMapHead small{display:block;margin-bottom:3px;font-size:10px;font-weight:850;color:#71889a}.maturityMapHead b{display:block;font-size:21px;line-height:1.3;color:#173a57}.maturityMapClose{width:36px;height:36px;flex:0 0 36px;border:1px solid #c6d6e2;border-radius:9px;background:#fff;color:#315c79;font-size:22px;cursor:pointer}
 .maturityMapBody{overflow:auto;padding:16px 18px 20px;background:#fbfdff}.maturityMapBody .ipFinalHead{margin-bottom:10px}.maturityMapBody .ipMap{min-height:520px!important;border:1px solid #d7e3eb!important;border-radius:12px!important;background:#fff!important}.maturityMapBody .ipMap .ipTooltip{pointer-events:none}
 .approvedSummary .asCard[data-maturity-map='1']{cursor:pointer!important;position:relative!important;border-color:#b7d2e5!important;background:linear-gradient(180deg,#fff,#f6fbff)!important}.approvedSummary .asCard[data-maturity-map='1']:after{content:'수준 맵 보기 →';position:absolute;right:10px;bottom:8px;font-size:8.5px;font-weight:900;color:#2d78a8}.approvedSummary .asCard[data-maturity-map='1']:hover{box-shadow:0 6px 16px rgba(39,92,128,.12)!important;transform:translateY(-1px)}
 @media(max-width:760px){.maturityMapModal{padding:10px}.maturityMapBody{padding:10px}.maturityMapBody .ipMap{min-height:460px!important}.maturityMapHead{padding:14px}}
 `;document.head.appendChild(s);
}
function modal(){
 let m=document.querySelector('.maturityMapModal');if(m)return m;
 m=document.createElement('div');m.className='maturityMapModal';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-label','고도화 수준 맵');
 m.innerHTML='<div class="maturityMapBox"><div class="maturityMapHead"><div><small>기존 고도화 수준 Map 기준</small><b>고도화 수준 맵</b></div><button class="maturityMapClose" type="button" aria-label="닫기">×</button></div><div class="maturityMapBody"></div></div>';
 document.body.appendChild(m);
 const close=()=>m.classList.remove('on');m.querySelector('.maturityMapClose').onclick=close;m.addEventListener('click',e=>{if(e.target===m)close()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&m.classList.contains('on'))close()});return m;
}
function openMap(){
 const srcMap=document.querySelector('.ipMap');if(!srcMap)return;
 const m=modal(),body=m.querySelector('.maturityMapBody');body.innerHTML='';
 const srcHead=document.querySelector('.ipFinalHead');if(srcHead)body.appendChild(srcHead.cloneNode(true));
 const map=srcMap.cloneNode(true);map.querySelectorAll('.ipDot').forEach(dot=>{dot.addEventListener('click',()=>dot.classList.toggle('on'))});body.appendChild(map);m.classList.add('on');
}
function wire(){
 style();const cards=[...document.querySelectorAll('.approvedSummary .asCard')];const srcMap=document.querySelector('.ipMap');if(cards.length<3||!srcMap)return false;
 let card=cards[2];if(card.dataset.maturityMap==='1')return true;
 const fresh=card.cloneNode(true);card.replaceWith(fresh);card=fresh;
 const label=card.querySelector('small'),value=card.querySelector('b'),sub=card.querySelector('span');if(label)label.textContent='고도화 수준';if(value)value.textContent='수준 맵';if(sub)sub.textContent='팀별 현재 포지션 확인';
 card.dataset.maturityMap='1';card.tabIndex=0;card.setAttribute('role','button');card.setAttribute('aria-label','고도화 수준 맵 보기');
 const run=e=>{e?.preventDefault();openMap()};card.addEventListener('click',run);card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openMap()}});return true;
}
function boot(){let n=0;const run=()=>{if(wire())return;if(++n<30)setTimeout(run,120)};run()}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();