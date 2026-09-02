(()=>{'use strict';
const KEY='hd20TeamLeaderMasterV1';
const TEAMS=window.HD20ProductionTeamMaster?.teamNames?.()||[];
const blank=team=>({team,leader:'미지정',email:''});
function load(){try{const v=JSON.parse(localStorage.getItem(KEY)||'null');return Array.isArray(v)?v:null}catch{return null}}
function sanitize(rows){let changed=false;const byTeam=new Map();(rows||[]).forEach(r=>{if(!r||!r.team)return;const x={...r};if(/^teamlead\d+@example\.com$/i.test(String(x.email||'').trim())){x.email='';x.leader='미지정';changed=true}byTeam.set(String(x.team),x)});TEAMS.forEach(team=>{if(!byTeam.has(team)){byTeam.set(team,blank(team));changed=true}});return{rows:[...byTeam.values()],changed}}
function run(){if(!TEAMS.length){console.error('[HD20] Canonical production team master is unavailable.');window.HD20_TEAM_MASTER_SAFE=false;return}const cur=load();if(!cur){localStorage.setItem(KEY,JSON.stringify(TEAMS.map(blank)));window.HD20_TEAM_MASTER_SAFE=true;return}const out=sanitize(cur);if(out.changed)localStorage.setItem(KEY,JSON.stringify(out.rows));window.HD20_TEAM_MASTER_SAFE=true}
run();
})();