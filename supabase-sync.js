(()=>{'use strict';
const KEYS=['hd20GMES5SAutoImproveRawV1','hd20ActionCasesV2','hd20AuditRandomDrawsV1','hd20OperatingPolicyV1','hd20AuditChecklistV1','hd20TeamLeaderMasterV1'];
const ROW='canonical_v1';let client=null,user=null,ready=false,applying=false,timer=null;
const parse=(v)=>{try{return JSON.parse(v)}catch{return v}};
function snapshot(){const payload={};KEYS.forEach(k=>{const v=localStorage.getItem(k);if(v!==null)payload[k]=parse(v)});return payload}
function apply(payload){if(!payload||typeof payload!=='object')return;applying=true;try{KEYS.forEach(k=>{if(Object.prototype.hasOwnProperty.call(payload,k))localStorage.setItem(k,typeof payload[k]==='string'?payload[k]:JSON.stringify(payload[k]))})}finally{applying=false}window.dispatchEvent(new CustomEvent('hd20-db-synced',{detail:{source:'supabase'}}))}
async function pull(){if(!client||!user)return false;const {data,error}=await client.from('hd20_app_state').select('payload,updated_at').eq('id',ROW).maybeSingle();if(error){console.error('[HD20 DB] pull',error);return false}if(data?.payload){apply(data.payload);return true}return false}
async function push(){if(!client||!user||applying)return;const payload=snapshot();const {error}=await client.from('hd20_app_state').upsert({id:ROW,payload,updated_by:user.id,updated_at:new Date().toISOString()},{onConflict:'id'});if(error)console.error('[HD20 DB] push',error)}
function queue(){if(!ready||applying)return;clearTimeout(timer);timer=setTimeout(push,450)}
function patchStorage(){const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){original.call(this,k,v);if(this===localStorage&&KEYS.includes(k))queue()}}
async function boot(){client=window.HD20_SUPABASE;if(!client){setTimeout(boot,120);return}const {data}=await client.auth.getSession();user=data?.session?.user||null;if(!user)return;patchStorage();const remote=await pull();ready=true;if(!remote)await push();window.HD20_DB_SYNC={pull,push,keys:[...KEYS],ready:()=>ready};}
window.addEventListener('hd20-auth-ready',e=>{user=e.detail?.user||user;boot()},{once:true});document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,150),{once:true}):setTimeout(boot,150);
})();