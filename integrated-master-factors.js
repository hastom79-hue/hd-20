(()=>{'use strict';
const ID='hd20IntegratedMasterFactors',STYLE='hd20IntegratedMasterFactorsStyle';
const TEAM_KEY='gmes5s_team_org_master_v1',TARGET_KEY='gmes5s_team_targets_v1',HIST_KEY='gmes5s_team_target_history_v1',FACTOR_KEY='gmes5s_work_factor_master_v1',MAIL_KEY='gmes5s_mailing_master_v1';
/* 딥 리서치 전수 검증: "운영기준 ② 팀별 인당목표" 표가 완전히 비어 있던 결함 — TEAMS가 스크립트
   로드 시점에 단 한 번만 평가되는 const였는데, 그 시점엔 window.HD20ProductionTeamMaster가 아직
   준비되지 않아 빈 배열로 영구 고정됐을 가능성이 높음(실제로 현재 시점에 teamNames()를 호출하면
   19개가 정상 반환됨). 상수를 함수로 바꿔 호출마다 최신 팀 목록을 가져오도록 수정. */
const TEAMS=()=>window.HD20ProductionTeamMaster?.teamNames?.()||[];
const GROUP_OF=t=>window.HD20ProductionTeamMaster?.groupOf?.(t)||'미분류';
/* 딥 리서치 전수 검증: "운영기준 ③ 요청출처" 기준정보 관리 화면의 라벨이 탭3(hd20-request-board.js)
   에서 사용자가 확정한 표기("요청그룹은 리더십(공장장), 5S모듈, 생산혁신팀(HDPS파트)로 표현한다")와
   괄호 유무가 달라 불일치했음(운영기준: '리더십'·'생산혁신팀 HDPS파트' vs 탭3: '리더십(공장장)'·
   '생산혁신팀(HDPS파트)') — 동일 표기로 통일. */
const SOURCES=['리더십(공장장)','5S모듈','생산혁신팀(HDPS파트)'];
/* 탭3(hd20-request-board.js)·request-source-order-master.js와 동일한 4종 + 고정 "출처 미분류".
   저장 키(DISCOVERY_KEY)도 request-source-order-master.js와 동일하게 유지해 그 파일이 만드는
   구버전 숨김 패널과 이 신버전 탭이 같은 데이터를 공유함(둘 중 하나만 써도 됨, 중복 저장소 아님). */
const DISCOVERY_SOURCES=['현장 패트롤 점검','자율 5S Audit','혁신팀 자율 점검','5S 자율개선활동 피드백'],DISCOVERY_KEY='gmes5s_request_source_order';
/* 사용자 지시: "작업장과 세부위치, 등록자 등 정보는 기준정보와 연동되어 등록자가 편의성을 갖도록"
   — 기존 "④ 업무/팩터"(키:구분자(|) 목록 저장, 어디서도 안 읽히던 죽은 설정이었음)와 동일한 패턴을
   그대로 재사용해 "작업장"·"세부위치" 두 항목을 추가. 이번엔 activity-workflow.js(자율개선 등록)·
   action-mail-workflow.js(개선요청 등록) 두 팝업이 실제로 이 목록을 읽어 드롭다운으로 쓰도록 연결해
   "죽은 설정"을 "살아있는 설정"으로 전환. */
const FACTORS={업무유형:['5S 활동','고도화','개선요청','Audit','개선조치','기타'],요청출처:SOURCES,업무단계:['요청','검토','실행','검증','완료','재발관리'],업무상태:['미착수','진행','완료','보류','수행불가','미확인'],우선순위:['긴급','높음','보통','낮음'],리스크:['높음','중간','낮음','미평가'],진척판정:['0% 미착수','1~49% 진행','50~99% 진행','100% 완료','수행불가','미확인'],작업장:['조립라인 A','조립라인 B','용접라인','도장라인','자재창고','출하장'],세부위치:['1구역','2구역','3구역','통로','작업대','보관랙']};
const MAIL=Array.from({length:7},(_,i)=>({id:String(i+1).padStart(2,'0'),cadence:'미설정',recipient:'',cc:'',target:'',condition:'미설정',enabled:false}));
const read=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?d:v}catch{return d}};const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
function leaders(){const a=read('hd20TeamLeaderMasterV1',[]);return Object.fromEntries((Array.isArray(a)?a:[]).map(x=>[x.team,{leader:x.leader||'미지정',email:x.email||''}]))}
function teamRows(){const L=leaders(),S=read(TEAM_KEY,{});return TEAMS().map((team,i)=>({team,org:GROUP_OF(team),active:S[team]?.active!==false,order:Number(S[team]?.order)||i+1,leader:S[team]?.leader??L[team]?.leader??'미지정',email:S[team]?.email??L[team]?.email??'',headcount:S[team]?.headcount??''}))}
function targets(){const v=read(TARGET_KEY,{});return Object.fromEntries(TEAMS().map(t=>[t,{Q1:v[t]?.Q1??null,Q2:v[t]?.Q2??null,Q3:v[t]?.Q3??null,Q4:v[t]?.Q4??null}]))}
function css(){if(document.getElementById(STYLE))return;const s=document.createElement('style');s.id=STYLE;s.textContent='.imfPanel{display:none;padding:4px 0 10px}.imfIntro{margin:10px 18px;padding:11px 13px;border:1px solid #dbe7ee;border-radius:10px;background:#f7fbfd;color:#5c7484;font-size:12px;line-height:1.55}.imfSec{margin:0 18px 14px;border:1px solid #dce6ed;border-radius:11px;background:#fff;overflow:hidden}.imfSec h4{margin:0;padding:11px 13px;background:#f6fafc;color:#173f59;font-size:14px;border-bottom:1px solid #e2ebf0}.imfNote{padding:8px 13px;color:#718797;font-size:11px;line-height:1.5}.imfTbl{width:100%;border-collapse:collapse;font-size:11.5px}.imfTbl th,.imfTbl td{border-bottom:1px solid #e7eef2;padding:7px 8px;text-align:left}.imfTbl th{background:#eef5f9;color:#476174;font-weight:900}.imfTbl input,.imfTbl select{width:100%;box-sizing:border-box;border:1px solid #cbdbe4;border-radius:6px;padding:6px 7px;font-size:11.5px}.imfChk{width:auto!important}.imfGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;padding:12px}.imfBox{border:1px solid #dfe9ef;border-radius:9px;padding:10px;background:#fbfdfe}.imfBox h5{margin:0 0 7px;color:#1d4964;font-size:12px}.imfBox input{width:100%;box-sizing:border-box;padding:7px;border:1px solid #cbdbe4;border-radius:6px}.imfFoot{display:flex;justify-content:flex-end;padding:10px 13px}.imfBtn{border:0;border-radius:7px;background:#1268a8;color:#fff;padding:8px 13px;font-weight:900;cursor:pointer}.imfHist{max-height:160px;overflow:auto}.imfMail{overflow:auto}@media(max-width:900px){.imfGrid{grid-template-columns:1fr}.imfTbl{min-width:760px}}';s.textContent += "\n/* 2026-10-26 통합기준정보 재개편: 기존 데이터/저장 핸들러 변경 없이 시각 계층만 단일화 */\n#masterModal .masterInfoBox{width:min(1200px,calc(100vw - 36px))!important;max-width:1200px!important;max-height:calc(100vh - 40px)!important;overflow:auto!important;box-sizing:border-box!important}\n#masterModal .masterTabs{display:grid!important;grid-template-columns:repeat(7,minmax(0,1fr))!important;gap:5px!important;align-items:stretch!important;margin:12px 18px 14px!important;padding:6px!important;border:1px solid #dce6ee!important;border-radius:12px!important;background:#f3f7fa!important;overflow:visible!important}\n#masterModal .masterTabs [data-master-group-heading]{display:none!important}\n#masterModal .masterTabs button[data-master-tab^=\"integrated-\"],#masterModal .masterTabs button[data-master-tab=\"policy\"]{display:flex!important;align-items:center!important;justify-content:center!important;min-width:0!important;min-height:48px!important;padding:10px 6px!important;border:0!important;border-bottom:3px solid transparent!important;border-radius:8px!important;background:transparent!important;color:#536b7d!important;box-shadow:none!important;font-size:13px!important;font-weight:750!important;line-height:1.35!important;text-align:center!important;white-space:normal!important;cursor:pointer!important}\n#masterModal .masterTabs button.on[data-master-tab^=\"integrated-\"],#masterModal .masterTabs button.on[data-master-tab=\"policy\"]{background:#fff!important;color:#0965a8!important;border-bottom-color:#1684d8!important;box-shadow:0 1px 5px rgba(20,55,80,.09)!important}\n#masterModal .masterTabs button[data-master-tab^=\"integrated-\"]:hover:not(.on),#masterModal .masterTabs button[data-master-tab=\"policy\"]:hover:not(.on){background:#e8f1f7!important}\n#masterModal .hd20MasterContext{display:none!important}\n#masterModal .imfPanel{padding:0 0 16px!important}\n#masterModal .imfIntro{display:flex!important;align-items:center!important;flex-wrap:wrap!important;gap:6px 16px!important;margin:0 18px 16px!important;padding:13px 16px!important;border:1px solid #dce7ef!important;border-radius:10px!important;background:#f7fafc!important;font-size:13px!important;color:#597387!important}\n#masterModal .imfIntro b{font-size:16px!important;color:#173e59!important}\n#masterModal .imfIntro span{font-weight:700!important}\n#masterModal .imfIntro small{width:100%!important;font-size:12px!important;color:#71899a!important}\n#masterModal .imfSec{margin:0 18px 14px!important;border:1px solid #dce5ed!important;border-radius:12px!important;box-shadow:0 2px 8px rgba(29,60,80,.035)!important}\n#masterModal .imfSec h4{padding:15px 18px!important;background:#fff!important;font-size:16px!important;border-bottom:1px solid #e6edf2!important}\n#masterModal .imfNote{padding:10px 18px!important;font-size:12.5px!important;line-height:1.55!important;color:#657e90!important}\n#masterModal .imfTbl{font-size:13px!important}\n#masterModal .imfTbl th{position:sticky!important;top:0!important;z-index:1!important;background:#f0f5f8!important;color:#35576d!important}\n#masterModal .imfTbl td,#masterModal .imfTbl th{padding:11px 12px!important}\n#masterModal .imfTbl tbody tr:nth-child(even){background:#fbfdfe!important}\n#masterModal .imfTbl input,#masterModal .imfTbl select{font-size:13px!important;min-height:36px!important;padding:7px 9px!important}\n#masterModal .imfGrid{gap:12px!important;padding:16px!important}\n#masterModal .imfBox{padding:14px!important;background:#fbfdff!important}\n#masterModal .imfBox h5{font-size:13px!important}\n#masterModal .imfFoot{padding:14px 18px!important;border-top:1px solid #e9eef2!important}\n#masterModal .imfBtn,#masterModal .opSave button{min-height:40px!important;padding:10px 18px!important;font-size:13px!important;border-radius:8px!important}\n#masterModal #hd20OperatingPolicyPanel{margin:0 18px 18px!important}\n#masterModal #hd20OperatingPolicyPanel .opCard{background:#fff!important;padding:18px!important;border-radius:12px!important}\n#masterModal #hd20OperatingPolicyPanel .opCard h4{font-size:16px!important}\n#masterModal #hd20OperatingPolicyPanel .opGrid{gap:12px!important}\n@media(max-width:1100px){#masterModal .masterTabs{grid-template-columns:repeat(4,minmax(0,1fr))!important}}\n@media(max-width:700px){#masterModal .masterInfoBox{width:calc(100vw - 12px)!important;max-height:calc(100vh - 12px)!important}#masterModal .masterTabs{grid-template-columns:repeat(2,minmax(0,1fr))!important;margin:10px!important}#masterModal .imfIntro,#masterModal .imfSec{margin-left:10px!important;margin-right:10px!important}#masterModal .imfTbl{min-width:650px!important}#masterModal #hd20OperatingPolicyPanel{margin:0 10px 14px!important}}\n";s.textContent += "\n/* Master information: grouped navigation and calm, compact editor hierarchy */\n#masterModal .masterInfoBox{width:min(1320px,calc(100vw - 32px))!important;max-width:1320px!important;margin:16px auto!important;border:1px solid #d8e3ec!important;border-radius:14px!important;box-shadow:0 12px 38px rgba(25,53,74,.09)!important}\n#masterModal .modalHead{padding:19px 24px!important;gap:14px!important;background:#fff!important}\n#masterModal .modalHead b{font-size:20px!important;letter-spacing:-.5px!important}\n#masterModal .modalHead span{font-size:12px!important}\n#masterModal .masterTabs{display:grid!important;grid-template-columns:1.05fr 1.5fr 1fr .8fr!important;gap:10px!important;margin:16px 22px!important;padding:0!important;border:0!important;background:transparent!important}\n#masterModal .imfNavGroup{display:flex;flex-direction:column;gap:5px;min-width:0;padding:10px!important;background:#f7f9fb;border:1px solid #dfe7ee;border-radius:11px}\n#masterModal .imfNavHead{display:flex;flex-wrap:wrap;justify-content:space-between;gap:2px 7px;align-items:baseline;padding:3px 6px 7px;border-bottom:1px solid #e1e9ef;margin-bottom:2px}\n#masterModal .imfNavHead strong{font-size:12.5px;color:#254c68}\n#masterModal .imfNavHead small{font-size:10px;color:#8195a4}\n#masterModal .masterTabs .imfNavGroup button[data-master-tab]{display:flex!important;justify-content:flex-start!important;align-items:center!important;text-align:left!important;min-height:33px!important;padding:7px 11px!important;font-size:12.5px!important;line-height:1.25!important;font-weight:650!important;border:1px solid transparent!important;border-radius:7px!important;background:transparent!important;color:#557084!important;box-shadow:none!important}\n#masterModal .masterTabs .imfNavGroup button.on[data-master-tab]{background:#e7f2fb!important;color:#075c96!important;border-color:#bad7eb!important;box-shadow:none!important;font-weight:850!important}\n#masterModal .masterTabs .imfNavGroup button[data-master-tab]:hover:not(.on){background:#edf3f7!important}\n#masterModal .imfIntro{margin:0 22px 13px!important;padding:12px 16px!important;background:#f8fafc!important}\n#masterModal .imfIntro b{font-size:14px!important}\n#masterModal .imfIntro small{font-size:11.5px!important}\n#masterModal .imfSec{margin:0 22px 14px!important;box-shadow:none!important}\n#masterModal .imfSec h4{padding:14px 16px!important;font-size:15px!important}\n#masterModal .imfNote{padding:9px 16px!important}\n#masterModal .imfTbl td,#masterModal .imfTbl th{padding:8px 10px!important}\n#masterModal .imfTbl input,#masterModal .imfTbl select{min-height:33px!important}\n#masterModal .imfFilterBar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 15px;border-top:1px solid #e6edf2;background:#fcfdfe}\n#masterModal .imfFilterBar input{width:min(340px,100%);min-height:35px;padding:7px 12px;border:1px solid #cbdbe5;border-radius:8px;background:#fff;color:#274c66;font-size:12.5px}\n#masterModal .imfFilterCount{color:#647e90;font-size:12px;white-space:nowrap}\n#masterModal .imfTbl tr[hidden]{display:none!important}\n#masterModal #hd20OperatingPolicyPanel{margin:0 22px 18px!important}\n#masterModal #hd20OperatingPolicyPanel .opGrid{grid-template-columns:repeat(2,minmax(0,1fr))!important}\n#masterModal .imfFoot{position:sticky;bottom:0;background:#fff;z-index:2}\n#imfSaveToast{position:fixed;right:24px;bottom:24px;z-index:2147483600;max-width:min(380px,calc(100vw - 32px));padding:13px 18px;border-radius:10px;background:#163f59;color:#fff;font:700 13px sans-serif;box-shadow:0 10px 30px #183c5940;opacity:0;pointer-events:none;transform:translateY(12px);transition:opacity .18s,transform .18s}\n#imfSaveToast.on{opacity:1;transform:translateY(0)}\n@media(max-width:950px){#masterModal .masterTabs{grid-template-columns:repeat(2,minmax(0,1fr))!important}#masterModal #hd20OperatingPolicyPanel .opGrid{grid-template-columns:1fr!important}}\n@media(max-width:620px){#masterModal .masterTabs{grid-template-columns:1fr!important;margin:10px!important}#masterModal .imfNavGroup{padding:7px!important}#masterModal .imfIntro,#masterModal .imfSec{margin-left:10px!important;margin-right:10px!important}#masterModal .imfFilterBar{flex-wrap:wrap}#masterModal #hd20OperatingPolicyPanel{margin:0 10px 12px!important}}\n";s.textContent += "\n/* 2026-10-26 V6: real two-pane master editor, no overview cards */\n#masterModal .masterInfoBox{\n display:grid!important;\n grid-template-columns:220px minmax(0,1fr)!important;\n grid-template-rows:auto minmax(0,1fr)!important;\n gap:0!important;\n width:min(1400px,calc(100vw - 32px))!important;\n max-width:1400px!important;\n min-height:530px!important;\n max-height:calc(100vh - 110px)!important;\n margin:16px auto!important;\n padding:0!important;\n overflow:hidden!important;\n border:1px solid #dce5ed!important;\n border-radius:13px!important;\n background:#fff!important;\n box-shadow:0 6px 18px rgba(23,52,73,.05)!important;\n}\n#masterModal .masterInfoBox>.modalHead{\n grid-column:1/-1!important;\n grid-row:1!important;\n margin:0!important;\n min-height:58px!important;\n padding:12px 20px!important;\n border-bottom:1px solid #dce5ed!important;\n}\n#masterModal .masterInfoBox>.modalHead b{font-size:19px!important}\n#masterModal .masterInfoBox>.modalHead span{font-size:12px!important}\n#masterModal .masterInfoBox>.masterTabs{\n grid-column:1!important;\n grid-row:2!important;\n display:flex!important;\n flex-direction:column!important;\n flex-wrap:nowrap!important;\n gap:0!important;\n min-width:0!important;\n height:100%!important;\n max-height:calc(100vh - 168px)!important;\n overflow-y:auto!important;\n margin:0!important;\n padding:16px 10px!important;\n background:#f6f8fa!important;\n border:0!important;\n border-right:1px solid #e1e9ef!important;\n border-radius:0!important;\n box-sizing:border-box!important;\n}\n#masterModal .masterTabs .imfNavGroup{\n display:flex!important;\n flex-direction:column!important;\n gap:2px!important;\n margin:0 0 12px!important;\n padding:0 0 10px!important;\n border:0!important;\n border-bottom:1px solid #e2e9ee!important;\n border-radius:0!important;\n background:transparent!important;\n}\n#masterModal .masterTabs .imfNavGroup:last-child{border-bottom:0!important}\n#masterModal .masterTabs .imfNavHead{\n display:block!important;\n padding:0 11px 7px!important;\n margin:0!important;\n border:0!important;\n}\n#masterModal .masterTabs .imfNavHead strong{\n font-size:11.5px!important;\n letter-spacing:.1px!important;\n color:#8295a3!important;\n font-weight:800!important;\n}\n#masterModal .masterTabs .imfNavGroup button[data-master-tab]{\n display:block!important;\n width:100%!important;\n min-height:36px!important;\n padding:8px 12px!important;\n border:0!important;\n border-radius:7px!important;\n border-left:3px solid transparent!important;\n background:transparent!important;\n color:#395b71!important;\n font-size:13px!important;\n font-weight:650!important;\n line-height:1.35!important;\n text-align:left!important;\n white-space:normal!important;\n box-shadow:none!important;\n}\n#masterModal .masterTabs .imfNavGroup button.on[data-master-tab]{\n background:#e6f0f7!important;\n color:#075e96!important;\n border-left-color:#167bb8!important;\n font-weight:850!important;\n box-shadow:none!important;\n}\n#masterModal .masterTabs .imfNavGroup button[data-master-tab]:hover:not(.on){background:#ebf1f5!important}\n#masterModal .masterInfoBox>#hd20IntegratedMasterFactors,\n#masterModal .masterInfoBox>#hd20OperatingPolicyPanel{\n grid-column:2!important;\n grid-row:2!important;\n min-width:0!important;\n min-height:0!important;\n height:100%!important;\n max-height:calc(100vh - 168px)!important;\n overflow-y:auto!important;\n overflow-x:hidden!important;\n margin:0!important;\n padding:18px 20px 26px!important;\n box-sizing:border-box!important;\n background:#fff!important;\n}\n#masterModal .masterInfoBox>#hd20IntegratedMasterFactors[style*=\"display: none\"],\n#masterModal .masterInfoBox>#hd20OperatingPolicyPanel[style*=\"display: none\"]{display:none!important}\n#masterModal .hd20MasterContext,\n#masterModal .imfIntro,\n#masterModal .masterInfoBox>.modalFoot{display:none!important}\n#masterModal .imfSec{margin:0 0 14px!important;border:1px solid #e0e8ee!important;border-radius:9px!important;box-shadow:none!important}\n#masterModal .imfSec h4{padding:14px 16px!important;font-size:15px!important;background:#fff!important}\n#masterModal .imfNote{padding:8px 16px!important;font-size:12px!important;line-height:1.5!important}\n#masterModal .imfTbl th,#masterModal .imfTbl td{padding:9px 10px!important}\n#masterModal .imfFilterBar{padding:10px 16px!important}\n#masterModal .imfGrid{gap:10px!important;padding:14px!important}\n#masterModal .imfBox{background:#fff!important}\n#masterModal .imfFoot{position:sticky!important;bottom:0!important;background:#fff!important;padding:12px 16px!important}\n#masterModal .masterInfoBox>#hd20OperatingPolicyPanel .opGrid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:12px!important}\n#masterModal .masterInfoBox>#hd20OperatingPolicyPanel .opCard{padding:15px!important;border-radius:9px!important}\n@media(max-width:760px){\n #masterModal .masterInfoBox{grid-template-columns:1fr!important;grid-template-rows:auto auto minmax(0,1fr)!important;width:calc(100vw - 14px)!important;max-height:calc(100vh - 20px)!important;min-height:0!important;margin:8px auto!important}\n #masterModal .masterInfoBox>.masterTabs{grid-column:1!important;grid-row:2!important;display:flex!important;flex-direction:row!important;gap:8px!important;height:auto!important;max-height:170px!important;overflow-x:auto!important;overflow-y:auto!important;padding:10px!important;border-right:0!important;border-bottom:1px solid #e1e9ef!important}\n #masterModal .masterTabs .imfNavGroup{min-width:150px!important;flex:0 0 auto!important;margin:0!important;padding:0 6px!important;border:0!important}\n #masterModal .masterInfoBox>#hd20IntegratedMasterFactors,#masterModal .masterInfoBox>#hd20OperatingPolicyPanel{grid-column:1!important;grid-row:3!important;height:auto!important;max-height:calc(100vh - 255px)!important;padding:12px!important}\n #masterModal .masterInfoBox>#hd20OperatingPolicyPanel .opGrid{grid-template-columns:1fr!important}\n}\n";s.textContent += "\n#masterModal .imfFactorGrid{grid-template-columns:repeat(2,minmax(0,1fr))!important}\n#masterModal .imfFactorBox{display:block!important;margin:0!important}\n#masterModal .imfFactorBox textarea{display:block;box-sizing:border-box;width:100%;min-height:92px;max-height:210px;resize:vertical;border:1px solid #d2dfe7;border-radius:7px;background:#fff;padding:10px 11px;font:500 12.5px/1.65 Pretendard,Arial,sans-serif;color:#294c62}\n#masterModal .imfFactorBox textarea:focus,#masterModal .imfSortField input:focus{outline:2px solid #91c9ed;outline-offset:1px}\n#masterModal .imfSortList{padding:6px 16px 16px;max-width:680px}\n#masterModal .imfSortRow{display:flex;justify-content:space-between;align-items:center;gap:12px;min-height:51px;padding:7px 10px;border-bottom:1px solid #e7edf1;font-size:13px;color:#26485f}\n#masterModal .imfSortField{display:flex;align-items:center;gap:12px;font-size:11.5px;color:#758c9d}\n#masterModal .imfSortField input{box-sizing:border-box;width:68px!important;height:33px;text-align:center;border:1px solid #ccdce5;border-radius:7px;background:#fff;color:#244b65;font-size:13px}\n#masterModal .imfSortFixed{color:#8b9ba6;background:#f8fafb}\n#masterModal .imfSortFixed span:last-child{font-size:11.5px}\n#masterModal .imfSec .imfNote{max-width:100%;color:#7890a0!important}\n@media(max-width:800px){#masterModal .imfFactorGrid{grid-template-columns:1fr!important}}\n";document.head.appendChild(s)}
function panel(){let p=document.getElementById(ID),m=document.querySelector('#masterModal .masterInfoBox'),tabs=m?.querySelector('.masterTabs');if(p||!m||!tabs)return p||null;p=document.createElement('div');p.id=ID;p.className='imfPanel';p.innerHTML='<div id="imfBody"></div>';tabs.insertAdjacentElement('afterend',p);return p}
function hide(){['masterOrderPanel','masterTargetPanel','hd20OperatingPolicyPanel','hd20SourceOrderPanel','hd20TeamLeaderMasterPanel'].forEach(id=>document.getElementById(id)?.style.setProperty('display','none'));document.querySelector('#masterModal .modalFoot')?.style.setProperty('display','none')}
function saveTeams(p){const out={};TEAMS().forEach((t,i)=>{const q=CSS.escape(t);out[t]={active:p.querySelector('[data-a="'+q+'"]').checked,order:Number(p.querySelector('[data-o="'+q+'"]').value)||i+1,leader:p.querySelector('[data-l="'+q+'"]').value.trim()||'미지정',email:p.querySelector('[data-e="'+q+'"]').value.trim(),headcount:Number(p.querySelector('[data-h="'+q+'"]').value)||null}});write(TEAM_KEY,out);write('hd20TeamLeaderMasterV1',TEAMS().map(t=>({team:t,leader:out[t].leader,email:out[t].email})));write('gmes5s_team_display_order',TEAMS().slice().sort((a,b)=>out[a].order-out[b].order));window.dispatchEvent(new CustomEvent('hd20-team-master-updated',{detail:out}));toast('조직·팀 기준정보를 저장했습니다.')}
function toast(message){
 let el=document.getElementById('imfSaveToast');
 if(!el){el=document.createElement('div');el.id='imfSaveToast';el.setAttribute('role','status');el.setAttribute('aria-live','polite');document.body.appendChild(el)}
 el.textContent=message;el.classList.add('on');clearTimeout(toast._timer);toast._timer=setTimeout(()=>el.classList.remove('on'),3200);
}
function attachFilter(p,name){
 if(!['team','target'].includes(name))return;
 const sec=p.querySelector('.imfSec'),table=sec?.querySelector('.imfTbl'),tbody=table?.querySelector('tbody');if(!tbody)return;
 const toolbar=document.createElement('div');toolbar.className='imfFilterBar';
 const input=document.createElement('input');input.type='search';input.placeholder='팀명 · 조직 · 담당자 검색';input.setAttribute('aria-label','기준정보 검색');
 const count=document.createElement('span');count.className='imfFilterCount';
 toolbar.append(input,count);table.parentElement.before(toolbar);
 const rows=[...tbody.querySelectorAll('tr')];
 const update=()=>{const term=input.value.trim().toLocaleLowerCase('ko-KR');let shown=0;rows.forEach(row=>{const matched=!term||row.textContent.toLocaleLowerCase('ko-KR').includes(term)||[...row.querySelectorAll('input')].some(el=>String(el.value).toLocaleLowerCase('ko-KR').includes(term));row.hidden=!matched;if(matched)shown++});count.textContent=shown+' / '+rows.length+'개 팀'};
 input.addEventListener('input',update);update();
}
function renderTeam(){const p=panel();if(!p)return;hide();p.style.display='block';const rows=teamRows();p.querySelector('#imfBody').innerHTML='<section class="imfSec"><h4>조직·팀 기준정보</h4><div class="imfNote">Canonical 생산팀 Master의 팀명·상위조직은 기준으로 유지하고, 사용 여부·정렬순서·담당자 연결·기준인원을 관리합니다.</div><div style="overflow:auto"><table class="imfTbl"><thead><tr><th>팀명</th><th>상위조직</th><th>사용</th><th>정렬</th><th>담당자</th><th>이메일</th><th>기준인원</th></tr></thead><tbody>'+rows.map(x=>'<tr><td>'+x.team+'</td><td>'+x.org+'</td><td><input class="imfChk" type="checkbox" data-a="'+x.team+'" '+(x.active?'checked':'')+'></td><td><input type="number" min="1" data-o="'+x.team+'" value="'+x.order+'"></td><td><input data-l="'+x.team+'" value="'+x.leader+'"></td><td><input data-e="'+x.team+'" value="'+x.email+'"></td><td><input type="number" min="0" data-h="'+x.team+'" value="'+x.headcount+'"></td></tr>').join('')+'</tbody></table></div><div class="imfFoot"><button class="imfBtn" data-save-team>저장</button></div></section>';p.querySelector('[data-save-team]').onclick=()=>saveTeams(p)}
function renderTarget(){const p=panel();if(!p)return;hide();p.style.display='block';const v=targets(),hist=read(HIST_KEY,[]);p.querySelector('#imfBody').innerHTML='<section class="imfSec"><h4>인당 개선목표</h4><div class="imfNote">Q1~Q4 건/인 목표와 생산성 기준값을 팀별로 관리합니다. 미설정은 미설정 그대로 유지하며 임의 달성/미달 판정을 만들지 않습니다.</div><div style="overflow:auto"><table class="imfTbl"><thead><tr><th>팀명</th><th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th></tr></thead><tbody>'+TEAMS().map(t=>'<tr><td>'+t+'</td>'+['Q1','Q2','Q3','Q4'].map(q=>'<td><input type="number" min="0" step="0.1" data-t="'+t+'" data-q="'+q+'" value="'+(v[t][q]??'')+'" placeholder="미설정"></td>').join('')+'</tr>').join('')+'</tbody></table></div><div class="imfFoot"><button class="imfBtn" data-save-target>저장 + 변경이력</button></div></section><section class="imfSec"><h4>목표 변경 이력</h4><div class="imfHist"><table class="imfTbl"><thead><tr><th>시각</th><th>팀</th><th>변경</th></tr></thead><tbody>'+((hist.slice(-30).reverse().map(h=>'<tr><td>'+new Date(h.at).toLocaleString('ko-KR')+'</td><td>'+h.team+'</td><td>'+h.changes.map(c=>c.q+': '+(c.before??'미설정')+' → '+(c.after??'미설정')).join(', ')+'</td></tr>').join(''))||'<tr><td colspan="3">변경 이력 없음</td></tr>')+'</tbody></table></div></section>';p.querySelector('[data-save-target]').onclick=()=>{const old=targets(),next={};TEAMS().forEach(t=>{next[t]={};['Q1','Q2','Q3','Q4'].forEach(q=>{const n=Number(p.querySelector('[data-t="'+CSS.escape(t)+'"][data-q="'+q+'"]').value);next[t][q]=Number.isFinite(n)&&n>0?n:null})});const h=hist;TEAMS().forEach(t=>{const changes=['Q1','Q2','Q3','Q4'].filter(q=>old[t][q]!==next[t][q]).map(q=>({q,before:old[t][q],after:next[t][q]}));if(changes.length)h.push({at:new Date().toISOString(),team:t,changes})});write(TARGET_KEY,next);write(HIST_KEY,h.slice(-200));window.dispatchEvent(new CustomEvent('hd20-team-targets-updated',{detail:next}));renderTarget();attachFilter(p,'target');toast('인당 목표와 변경이력을 저장했습니다.')}}
function renderSource(){
 const p=panel();if(!p)return;hide();p.style.display='block';
 const cur=read('gmes5s_request_group_order',SOURCES);
 p.querySelector('#imfBody').innerHTML='<section class="imfSec"><h4>요청그룹</h4><div class="imfNote">표시순서를 지정하면 개선요청 분석과 필터에 동일하게 적용됩니다.</div><div class="imfSortList">'+SOURCES.map((v,i)=>'<label class="imfSortRow"><span>'+v+'</span><span class="imfSortField">순서 <input type="number" min="1" max="3" data-so="'+v+'" value="'+(cur.indexOf(v)+1)+'"></span></label>').join('')+'</div><div class="imfFoot"><button type="button" class="imfBtn" data-save-source>변경사항 저장</button></div></section>';
 p.querySelector('[data-save-source]').onclick=()=>{const a=SOURCES.map((v,i)=>({s:v,v:Number(p.querySelector('[data-so="'+v+'"]').value)||i+1,i})).sort((x,y)=>x.v-y.v||x.i-y.i).map(x=>x.s);write('gmes5s_request_group_order',a);window.dispatchEvent(new CustomEvent('hd20-policy-updated',{detail:{requestSourceOrder:a}}));renderSource();toast('요청그룹 순서를 저장했습니다.')}
}

function renderDiscovery(){
 const p=panel();if(!p)return;hide();p.style.display='block';
 const cur=read(DISCOVERY_KEY,DISCOVERY_SOURCES);
 p.querySelector('#imfBody').innerHTML='<section class="imfSec"><h4>문제 발굴출처</h4><div class="imfNote">발굴 경로의 표시순서를 관리합니다. 출처 미분류는 마지막에 고정됩니다.</div><div class="imfSortList">'+DISCOVERY_SOURCES.map((v,i)=>'<label class="imfSortRow"><span>'+v+'</span><span class="imfSortField">순서 <input type="number" min="1" max="4" data-do="'+v+'" value="'+(cur.indexOf(v)+1)+'"></span></label>').join('')+'<div class="imfSortRow imfSortFixed"><span>출처 미분류</span><span>마지막 고정</span></div></div><div class="imfFoot"><button type="button" class="imfBtn" data-save-discovery>변경사항 저장</button></div></section>';
 p.querySelector('[data-save-discovery]').onclick=()=>{const a=DISCOVERY_SOURCES.map((v,i)=>({s:v,v:Number(p.querySelector('[data-do="'+v+'"]').value)||i+1,i})).sort((x,y)=>x.v-y.v||x.i-y.i).map(x=>x.s);write(DISCOVERY_KEY,a);window.dispatchEvent(new CustomEvent('hd20-policy-updated',{detail:{requestDiscoveryOrder:a}}));renderDiscovery();toast('문제 발굴출처 순서를 저장했습니다.')}
}


/* Structured master editor. All changes remain in memory until explicit Save. */
let factorDraft=null,factorActiveCategory='업무유형',factorDirty=false,factorSearch='';
function factorSaved(){
 const stored=read(FACTOR_KEY,{});
 return Object.fromEntries(Object.keys(FACTORS).map(k=>[k,Array.isArray(stored?.[k])&&stored[k].length?stored[k].map(x=>String(x)):FACTORS[k].slice()]));
}
function renderFactors(){
 const p=panel();if(!p)return;hide();p.style.display='block';
 if(!factorDraft)factorDraft=factorSaved();
 const keys=Object.keys(FACTORS),body=p.querySelector('#imfBody');
 if(!keys.includes(factorActiveCategory))factorActiveCategory=keys[0];
 body.innerHTML='<section class="imfSec imfFactorWorkspace"><div class="imfFactorHeader"><div><div class="imfEyebrow">MASTER DATA / REGISTRATION FIELDS</div><h4>업무·등록항목 관리</h4><p>등록 화면에서 사용하는 선택 항목을 분류별로 관리합니다. 추가·수정·삭제·표시순서 변경 후 저장하세요.</p></div><div class="imfFactorHeaderSide"><span class="imfFactorTotal"></span><span class="imfFactorDirty" role="status" aria-live="polite"></span></div></div><div class="imfFactorLayout"><nav class="imfFactorCategories" aria-label="등록항목 분류"></nav><div class="imfFactorEditor"><div class="imfFactorToolbar"><div><h5 id="imfFactorCurrentTitle"></h5><p id="imfFactorCurrentHelp">위에서 아래 순서대로 등록 화면에 표시됩니다.</p></div><label class="imfFactorSearchLabel"><span>항목 검색</span><input type="search" id="imfFactorSearch" placeholder="항목명 검색" autocomplete="off"></label></div><div class="imfFactorTableHead"><span>순서</span><span>선택 항목명</span><span>관리</span></div><div class="imfFactorRows" role="list" aria-label="선택 항목 목록"></div><form class="imfFactorAdd" id="imfFactorAddForm"><label for="imfFactorNew">신규 항목</label><input id="imfFactorNew" autocomplete="off" placeholder="추가할 항목명을 입력하세요" maxlength="120"><button type="submit" class="imfFactorAddBtn">+ 항목 추가</button></form><p class="imfFactorHint">항목을 수정하거나 순서를 바꾸면 연결된 등록 화면의 선택값에 저장 후 반영됩니다. 기존 기록은 변경되지 않습니다.</p></div></div><div class="imfFactorActions"><span class="imfFactorSaveStatus" role="status" aria-live="polite"></span><button type="button" class="imfFactorCancel">변경 취소</button><button type="button" class="imfBtn imfFactorSave">변경사항 저장</button></div></section>';
 const categoryNav=body.querySelector('.imfFactorCategories'),rowsEl=body.querySelector('.imfFactorRows');
 const search=body.querySelector('#imfFactorSearch'),addForm=body.querySelector('#imfFactorAddForm');
 const newInput=body.querySelector('#imfFactorNew'),saveBtn=body.querySelector('.imfFactorSave');
 const cancelBtn=body.querySelector('.imfFactorCancel'),saveStatus=body.querySelector('.imfFactorSaveStatus');
 function markDirty(){factorDirty=true;updateStatus()}
 function updateStatus(){
  const total=keys.reduce((n,k)=>n+factorDraft[k].length,0);
  body.querySelector('.imfFactorTotal').textContent=keys.length+'개 분류 · '+total+'개 항목';
  const tag=body.querySelector('.imfFactorDirty');
  tag.textContent=factorDirty?'● 저장하지 않은 변경사항':'✓ 저장된 기준정보';
  tag.classList.toggle('dirty',factorDirty);
  saveBtn.disabled=!factorDirty;
  saveStatus.textContent=factorDirty?'변경사항을 저장해야 등록 화면에 반영됩니다.':'현재 저장된 기준정보를 표시하고 있습니다.';
 }
 function drawCategories(){
  categoryNav.replaceChildren();
  keys.forEach(k=>{
   const btn=document.createElement('button');btn.type='button';btn.className='imfFactorCategory'+(k===factorActiveCategory?' active':'');
   btn.setAttribute('aria-current',k===factorActiveCategory?'true':'false');
   const name=document.createElement('span');name.textContent=k;
   const count=document.createElement('b');count.textContent=String(factorDraft[k].length);
   btn.append(name,count);
   btn.addEventListener('click',()=>{factorActiveCategory=k;factorSearch='';search.value='';draw()});
   categoryNav.appendChild(btn);
  });
 }
 function drawRows(){
  rowsEl.replaceChildren();
  const items=factorDraft[factorActiveCategory],term=factorSearch.trim().toLocaleLowerCase('ko-KR');
  let visible=0;
  items.forEach((value,index)=>{
   if(term&&!value.toLocaleLowerCase('ko-KR').includes(term))return;
   visible++;
   const row=document.createElement('div');row.className='imfFactorRow';row.setAttribute('role','listitem');
   const order=document.createElement('span');order.className='imfFactorOrder';order.textContent=String(index+1).padStart(2,'0');
   const input=document.createElement('input');input.type='text';input.value=value;input.maxLength=120;
   input.setAttribute('aria-label',factorActiveCategory+' '+(index+1)+'번째 항목명');
   input.addEventListener('change',()=>{
    const next=input.value.trim();
    if(!next){toast('항목명은 비워둘 수 없습니다.');input.value=items[index];return}
    if(items.some((v,i)=>i!==index&&v.toLocaleLowerCase('ko-KR')===next.toLocaleLowerCase('ko-KR'))){toast('동일한 항목명이 이미 존재합니다.');input.value=items[index];return}
    if(next!==items[index]){items[index]=next;markDirty();drawCategories()}
   });
   const actions=document.createElement('div');actions.className='imfFactorRowActions';
   const button=(label,title,disabled,handler)=>{
    const el=document.createElement('button');el.type='button';el.textContent=label;el.title=title;el.setAttribute('aria-label',title);
    el.disabled=disabled;el.addEventListener('click',handler);return el;
   };
   actions.append(
    button('↑','위로 이동',index===0||!!term,()=>{[items[index-1],items[index]]=[items[index],items[index-1]];markDirty();draw()}),
    button('↓','아래로 이동',index===items.length-1||!!term,()=>{[items[index+1],items[index]]=[items[index],items[index+1]];markDirty();draw()}),
    button('삭제','항목 삭제',items.length<=1,()=>{items.splice(index,1);markDirty();draw()})
   );
   row.append(order,input,actions);rowsEl.appendChild(row);
  });
  if(!visible){const empty=document.createElement('p');empty.className='imfFactorEmpty';empty.textContent='검색 결과가 없습니다. 검색어를 변경하세요.';rowsEl.appendChild(empty)}
 }
 function draw(){
  body.querySelector('#imfFactorCurrentTitle').textContent=factorActiveCategory;
  drawCategories();drawRows();updateStatus();
 }
 search.addEventListener('input',()=>{factorSearch=search.value;drawRows()});
 addForm.addEventListener('submit',e=>{
  e.preventDefault();const v=newInput.value.trim(),items=factorDraft[factorActiveCategory];
  if(!v){newInput.focus();return}
  if(items.some(x=>x.toLocaleLowerCase('ko-KR')===v.toLocaleLowerCase('ko-KR'))){toast('동일한 항목명이 이미 존재합니다.');newInput.select();return}
  items.push(v);newInput.value='';factorSearch='';search.value='';markDirty();draw();newInput.focus();
 });
 cancelBtn.addEventListener('click',()=>{
  if(!factorDirty)return;
  if(!window.confirm('저장하지 않은 변경사항을 취소하고 마지막 저장 상태로 되돌리시겠습니까?'))return;
  factorDraft=factorSaved();factorDirty=false;factorSearch='';search.value='';draw();toast('저장된 기준정보로 되돌렸습니다.');
 });
 saveBtn.addEventListener('click',()=>{
  const next={...read(FACTOR_KEY,{})};
  for(const k of keys){
   const items=factorDraft[k].map(v=>String(v).trim());
   if(!items.length||items.some(v=>!v)||new Set(items.map(v=>v.toLocaleLowerCase('ko-KR'))).size!==items.length){
    toast(k+'의 빈 항목 또는 중복 항목을 확인하세요.');factorActiveCategory=k;draw();return;
   }
   next[k]=items;
  }
  try{write(FACTOR_KEY,next)}
  catch(e){toast('저장에 실패했습니다. 브라우저 저장공간을 확인하세요.');return}
  factorDraft=factorSaved();factorDirty=false;
  window.dispatchEvent(new CustomEvent('hd20-master-factors-updated',{detail:next}));
  draw();toast('업무·등록항목 '+keys.length+'개 분류를 저장했습니다.');
 });
 draw();
}

function renderMail(){const p=panel();if(!p)return;hide();p.style.display='block';const rows=read(MAIL_KEY,MAIL);p.querySelector('#imfBody').innerHTML='<section class="imfSec"><h4>메일링 설정</h4><div class="imfNote">각 보고주기의 주기·수신/참조·보고대상·자동메일 조건을 Master화합니다. 현재 코드에서 확인되지 않은 수신자는 임의로 채우지 않습니다.</div><div class="imfMail"><table class="imfTbl"><thead><tr><th>구분</th><th>보고주기</th><th>수신자</th><th>참조자</th><th>보고대상</th><th>자동메일 조건</th><th>사용</th></tr></thead><tbody>'+rows.map((r,i)=>'<tr><td>'+r.id+'</td><td><input data-m="'+i+'" data-k="cadence" value="'+r.cadence+'"></td><td><input data-m="'+i+'" data-k="recipient" value="'+r.recipient+'"></td><td><input data-m="'+i+'" data-k="cc" value="'+r.cc+'"></td><td><input data-m="'+i+'" data-k="target" value="'+r.target+'"></td><td><input data-m="'+i+'" data-k="condition" value="'+r.condition+'"></td><td><input class="imfChk" type="checkbox" data-me="'+i+'" '+(r.enabled?'checked':'')+'></td></tr>').join('')+'</tbody></table></div><div class="imfFoot"><button class="imfBtn" data-save-mail>저장</button></div></section>';p.querySelector('[data-save-mail]').onclick=()=>{const n=rows.map((r,i)=>({...r,cadence:p.querySelector('[data-m="'+i+'"][data-k="cadence"]').value.trim(),recipient:p.querySelector('[data-m="'+i+'"][data-k="recipient"]').value.trim(),cc:p.querySelector('[data-m="'+i+'"][data-k="cc"]').value.trim(),target:p.querySelector('[data-m="'+i+'"][data-k="target"]').value.trim(),condition:p.querySelector('[data-m="'+i+'"][data-k="condition"]').value.trim(),enabled:p.querySelector('[data-me="'+i+'"]').checked}));write(MAIL_KEY,n);window.dispatchEvent(new CustomEvent('hd20-mailing-master-updated',{detail:n}));toast('메일링 기준정보를 저장했습니다.')}}
function rememberMasterTab(tab){try{sessionStorage.setItem('hd20MasterSelectedTab',tab)}catch{}}
function restoredMasterTab(){try{const value=sessionStorage.getItem('hd20MasterSelectedTab');return ['integrated-team','integrated-target','integrated-source','integrated-discovery','integrated-factor','policy','integrated-mail'].includes(value)?value:null}catch{return null}}
function show(name){rememberMasterTab('integrated-'+name);const p=panel();if(!p)return;hide();p.style.display='block';const b=document.querySelectorAll('#masterModal .masterTabs button');b.forEach(x=>x.classList.toggle('on',x.dataset.masterTab==='integrated-'+name));if(name==='team')renderTeam();if(name==='target')renderTarget();if(name==='source')renderSource();if(name==='factor')renderFactors();if(name==='mail')renderMail();if(name==='discovery')renderDiscovery();attachFilter(p,name)}
function ensure(){css();const p=panel(),tabs=document.querySelector('#masterModal .masterTabs');if(!p||!tabs)return false;
['order','target','sourceOrder','leader'].forEach(k=>{const b=tabs.querySelector('[data-master-tab="'+k+'"]');if(b){b.hidden=true;b.classList.remove('on');b.style.setProperty('display','none','important');b.style.setProperty('visibility','hidden','important')}});
['masterOrderPanel','masterTargetPanel'].forEach(id=>document.getElementById(id)?.style.setProperty('display','none'));
document.querySelector('#masterModal .modalFoot')?.style.setProperty('display','none');
const head=document.querySelector('#masterModal .modalHead span');if(head)head.textContent='조직·성과 / 등록·업무기준 / Audit 정책 / 시스템 설정';
/* 사용자 지시: "운영기준은 명칭을 통합기준정보로 변경하고 다른 탭 기준으로 필요한 모든 팩터들을
   녹여서 생성해라" — 탭3(hd20-request-board.js)와 개선요청 등록 팝업이 쓰는 "발굴 출처"(5종: 현장
   패트롤 점검·자율 5S Audit·혁신팀 자율 점검·5S 자율개선활동 피드백·출처 미분류)의 순서를 관리하는
   유일한 창구가 구버전 숨김 탭(request-source-order-master.js)뿐이었음을 발견 — "③ 요청그룹"과
   같은 패턴으로 신버전 탭으로 정식 추가. */
const map={team:'조직·팀',target:'인당 개선목표',source:'요청그룹',factor:'업무·등록항목',mail:'메일링 설정',discovery:'문제 발굴출처'};Object.entries(map).forEach(([k,n])=>{let b=tabs.querySelector('[data-master-tab="integrated-'+k+'"]');if(!b){b=document.createElement('button');b.type='button';b.dataset.masterTab='integrated-'+k;b.textContent=n;b.addEventListener('click',()=>show(k));tabs.appendChild(b)}});groupMasterNavigation();
 const selected=restoredMasterTab();
 if(selected==='policy'&&tabs.querySelector('[data-master-tab="policy"]'))tabs.querySelector('[data-master-tab="policy"]').click();
 else if(selected?.startsWith('integrated-'))show(selected.slice('integrated-'.length));
 else show('team');
 return true}
function groupMasterNavigation(){
 const tabs=document.querySelector('#masterModal .masterTabs');if(!tabs)return;
 const groups=[
  {label:'조직 · 목표',keys:['integrated-team','integrated-target']},
  {label:'등록 · 분류',keys:['integrated-source','integrated-discovery','integrated-factor']},
  {label:'Audit · 조치',keys:['policy']},
  {label:'시스템',keys:['integrated-mail']}
 ];
 tabs.querySelectorAll('.imfNavGroup').forEach(g=>{[...g.querySelectorAll('button')].forEach(b=>tabs.appendChild(b));g.remove()});
 tabs.querySelectorAll('[data-master-group-heading]').forEach(x=>x.remove());
 groups.forEach(g=>{
  const box=document.createElement('div');box.className='imfNavGroup';
  const head=document.createElement('div');head.className='imfNavHead';
  const label=document.createElement('strong');label.textContent=g.label;head.appendChild(label);box.appendChild(head);
  g.keys.forEach(k=>{const b=tabs.querySelector('[data-master-tab="'+k+'"]');if(!b||b.hidden||b.style.display==='none')return;b.dataset.masterGroup=g.label;b.title=g.label+' · '+b.textContent.trim();box.appendChild(b)});
  if(box.querySelector('button'))tabs.appendChild(box);
 });
 tabs.setAttribute('aria-label','통합기준정보 세부메뉴');
}
function suppressLegacy(){const tabs=document.querySelector('#masterModal .masterTabs');if(!tabs)return;
  /* 'policy'(운영정책 — Audit 표본수·Risk 가중치·개선요청 자동지정일수·리더십 명단 설정)는 '④ 업무/팩터' 등
     새 5개 탭으로 실제 대체된 적이 없는데도 여기 묶여 숨겨져 있었음. 그 결과 Audit 표본수를 설정할 방법이
     화면 어디에도 없어 'Risk 대상선정 > 대상 일괄추출'이 "표본수가 설정되지 않았습니다" 안내만 반복하며
     영원히 진행 불가능한 상태였던 것을 발견 — 'policy'만 숨김 대상에서 제외해 복구. */
  ['order','target','sourceOrder','leader'].forEach(k=>{const b=tabs.querySelector('[data-master-tab="'+k+'"]');if(b){b.hidden=true;b.classList.remove('on');b.style.setProperty('display','none','important');b.style.setProperty('visibility','hidden','important')}})}
function boot(){let n=0;const run=()=>{if(ensure()){suppressLegacy();const tabs=document.querySelector('#masterModal .masterTabs');
 if(tabs&&!tabs.dataset.imfPersistenceBound){tabs.dataset.imfPersistenceBound='1';tabs.addEventListener('click',e=>{const btn=e.target.closest('[data-master-tab]');if(btn&&btn.dataset.masterTab==='policy')rememberMasterTab('policy')},true)}
 return}if(++n<80)setTimeout(run,150)};run()}
window.HD20IntegratedMaster={teamRows,targets,factors:()=>read(FACTOR_KEY,FACTORS),mailing:()=>read(MAIL_KEY,MAIL),getHeadcount:t=>teamRows().find(x=>x.team===t)?.headcount||null};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();})();