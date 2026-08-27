(()=>{'use strict';
const KEY='hd20TeamLeaderMasterV1';
const TEAMS=['중형상부1팀','중형상부2팀','중형하부팀','중형메인팀','중형Att팀','대형상부팀','대형메인팀','대형Att.팀','휠로더Front팀','휠로더메인팀','휠로더리어팀','초대형조립팀','프레임제작팀','Boom제작팀','성능팀','트리블슈팅팀'];
const blank=team=>({team,leader:'미지정',email:''});
function load(){try{const v=JSON.parse(localStorage.getItem(KEY)||'null');return Array.isArray(v)?v:null}catch{return null}}
function sanitize(rows){let changed=false;const byTeam=new Map();(rows||[]).forEach(r=>{if(!r||!r.team)return;const x={...r};if(/^teamlead\d+@example\.com$/i.test(String(x.email||'').trim())){x.email='';x.leader='미지정';changed=true}byTeam.set(String(x.team),x)});TEAMS.forEach(team=>{if(!byTeam.has(team)){byTeam.set(team,blank(team));changed=true}});return{rows:[...byTeam.values()],changed}}
function run(){const cur=load();if(!cur){localStorage.setItem(KEY,JSON.stringify(TEAMS.map(blank)));window.HD20_TEAM_MASTER_SAFE=true;return}const out=sanitize(cur);if(out.changed)localStorage.setItem(KEY,JSON.stringify(out.rows));window.HD20_TEAM_MASTER_SAFE=true}
run();
})();