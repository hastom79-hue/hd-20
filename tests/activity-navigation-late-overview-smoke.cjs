'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('beginner-navigation.js','utf8');
const start=src.indexOf('function bind(nav){'),end=src.indexOf('function normalizeDeepLink(',start);
assert(start>=0&&end>start,'navigation bind code exists');
const bindSource=src.slice(start,end);
function scenario({leaveTab,launcherReady}){
  const delayed=[];
  let opened=0;
  const launcher={openOverview(){opened++}};
  const win={HD20_LAUNCHER:launcherReady?launcher:null};
  const harness=new Function('window','setTimeout',`let activeKey='dashboard';function go(key){activeKey=key};${bindSource};return {bind,go,active:()=>activeKey};`)(win,fn=>{delayed.push(fn);});
  const button={dataset:{key:'activity'},onclick:null};
  const nav={querySelectorAll:()=>[button]};
  harness.bind(nav);
  button.onclick();
  if(leaveTab)harness.go('audit');
  if(!launcherReady)win.HD20_LAUNCHER=launcher;
  for(const fn of delayed)fn();
  return {opened,active:harness.active(),delayed:delayed.length};
}
assert.equal(scenario({leaveTab:true,launcherReady:false}).opened,0,'late launcher must not reopen activity after leaving');
assert.equal(scenario({leaveTab:false,launcherReady:false}).opened,1,'launcher opens while activity remains selected');
assert.equal(scenario({leaveTab:true,launcherReady:true}).opened,1,'ready launcher opens synchronously');
console.log('PASS activity navigation delayed-overview race: 3 scenarios');
