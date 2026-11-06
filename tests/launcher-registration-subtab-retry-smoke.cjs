'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('landing-launcher.js','utf8');
const start=src.indexOf('function clickWhenReady(');
const end=src.indexOf('function hideOverview()',start);
assert(start>=0&&end>start,'registration retry source');
const logic=src.slice(start,end);
function exercise({area='activity',sub='self',expected='self',hasButton=false}){
 const queues=[];let calls=0,internalRegistrationNavigation=true;
 const window={HD20_NAV:{active:()=>area},HD20_LAUNCHER:{refreshActive(){}}};
 const modal={classList:{contains:()=>false},getAttribute:()=>null};
 const doc={getElementById:id=>id==='awActivity'?{dataset:{subview:sub}}:null};
 const btn={isConnected:true,disabled:false,click(){calls++}};
 const findFn=()=>hasButton?btn:null;
 const api=new Function('window','document','setTimeout','console','findFn','expected',`
 let internalRegistrationNavigation=true;${logic}
 clickWhenReady(findFn,'awRegisterModal','activity',expected);
 return {active:()=>internalRegistrationNavigation};`)(window,doc,fn=>queues.push(fn),console,findFn,expected);
 return {queued:queues.length,calls,active:api.active()};
}
assert.deepEqual(exercise({sub:'request',hasButton:true}).calls,0,'wrong subtab cannot open self registration');
assert.equal(exercise({sub:'self',hasButton:true}).calls,1,'matching subtab can open registration');
assert.equal(exercise({sub:'request',hasButton:false}).queued,0,'wrong subtab stops retry timer');
assert.equal(exercise({sub:'self',hasButton:false}).queued,1,'matching subtab retries missing button');
assert(src.includes("'activity','self')")&&src.includes("'activity','request')"),'both launcher routes pass expected subtab');

const routeBegin=src.indexOf('function goActivityRegister()');
const routeEnd=src.indexOf('function getRows(',routeBegin);
assert(routeBegin>=0&&routeEnd>routeBegin,'launcher route functions');
const routeLogic=src.slice(routeBegin,routeEnd);
function runInitialRoute(fnName,area){
 const timers=[],selections=[];
 const window={HD20_NAV:{active:()=>area},HD20_SUBNAV:{select:(a,s)=>selections.push([a,s])}};
 const document={getElementById:()=>null};
 const harness=new Function('window','document','setTimeout',`
 let internalRegistrationNavigation=false;
 function close(){} function navigate(){}
 function clickWhenReady(){}
 ${routeLogic}
 return {goActivityRegister,goActionRegister,locked:()=>internalRegistrationNavigation};
 `)(window,document,fn=>timers.push(fn));
 harness[fnName]();
 timers.forEach(fn=>fn());
 return {selections,locked:harness.locked()};
}
assert.equal(runInitialRoute('goActivityRegister','audit').selections.length,0,'stale self registration cannot change tab');
assert.equal(runInitialRoute('goActionRegister','master').selections.length,0,'stale request registration cannot change tab');
assert.deepEqual(runInitialRoute('goActivityRegister','activity').selections,[['activity','self']],'current self registration routes correctly');
assert.deepEqual(runInitialRoute('goActionRegister','activity').selections,[['activity','request']],'current request registration routes correctly');

console.log('PASS launcher registration subtab retry: 9 checks');
