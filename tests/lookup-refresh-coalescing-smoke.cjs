'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync('landing-launcher.js','utf8');
const start=source.indexOf('  let lookupRefreshTimer=null;');
const end=source.indexOf("  window.addEventListener('storage',refreshVisibleLookup);",start);
assert(start>=0&&end>start,'lookup refresh coalescing source exists');
const snippet=source.slice(start,end);
function makeHarness(options={}){
 let pending=[],renders=[],modal=options.modal||false,active=options.active||'activity',sub=options.sub||'request';
 const window={HD20_NAV:{active:()=>active},addEventListener:()=>{}};
 const document={querySelector:()=>modal?{}:null,getElementById:id=>id==='awActivity'?{dataset:{subview:sub}}:null,body:{classList:{contains:()=>true}}};
 const refreshLookup=m=>renders.push(m);
 const setTimeout=fn=>{pending.push(fn);return pending.length};
 const fn=new Function('window','document','refreshLookup','setTimeout',snippet+';return refreshVisibleLookup');
 const refresh=fn(window,document,refreshLookup,setTimeout);
 return {refresh,flush:()=>{const copy=pending.splice(0);copy.forEach(fn=>fn())},renders,setModal:v=>modal=v,setSub:v=>sub=v,setActive:v=>active=v};
}
const a=makeHarness();a.refresh();a.refresh();a.refresh();a.flush();assert.deepEqual(a.renders,['request']);console.log('PASS coalesced triple notification');
const b=makeHarness({modal:true});b.refresh();b.flush();assert.equal(b.renders.length,0);console.log('PASS modal protected');
const c=makeHarness({active:'audit'});c.refresh();c.flush();assert.equal(c.renders.length,0);console.log('PASS inactive area protected');
const d=makeHarness({sub:'overview'});d.refresh();d.flush();assert.deepEqual(d.renders,['overview']);console.log('PASS overview refreshed');
console.log('Lookup refresh regression: 4 passed');
