'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync('theme-inspection.js','utf8');
const begin=source.indexOf(" $$('.themeCheckRow',wrap).forEach(row=>{",source.indexOf('function renderChecklist('));
const end=source.indexOf(" $$('[data-cat-ok]',wrap).forEach",begin);
assert(begin>=0&&end>begin,'real checklist row click bindings exist');
const snippet=source.slice(begin,end);
const elements=[];
function row(){
 const r={dataset:{key:'CASE-'+elements.length},buttons:[]};
 for(const value of ['적합','미흡']){
  const listeners={};
  const btn={dataset:{v:value},listeners,marks:new Set(),
   classList:{add(...parts){parts.forEach(p=>btn.marks.add(p))},remove(...parts){parts.forEach(p=>btn.marks.delete(p))}},
   addEventListener:(type,handler)=>{listeners[type]=handler}};
  r.buttons.push(btn);
 }
 elements.push(r);return r;
}
row();row();row();
const $=(selector,scope)=>{
 if(selector==='.themeCheckRow')return elements;
 if(selector==='button'&&scope?.buttons)return scope.buttons;
 throw Error('unknown simulated selector '+selector);
};
const host={dataset:{themeAuditDirty:'0'}};
let progress=0;
new Function('wrap','$$','host','updateProgress',snippet)({},$$,host,()=>progress++);
for(const r of elements)for(const b of r.buttons)assert.equal(typeof b.listeners.click,'function','each row has click handler');
elements[1].buttons[0].listeners.click();
assert(elements[1].buttons[0].marks.has('active'),'initial OK active');
elements[1].buttons[1].listeners.click();
assert(!elements[1].buttons[0].marks.has('active'),'prior OK cleared');
assert(elements[1].buttons[1].marks.has('active'),'NG registered');
assert(elements[1].buttons[1].marks.has('ng'),'NG visual class registered');
assert.equal(host.dataset.themeAuditDirty,'1','changes marked unsaved');
assert.equal(progress,2,'progress updated on each click');
assert.equal(elements[0].buttons[0].marks.has('active'),false,'other checklist row untouched');
console.log('PASS theme checklist click handler on all 3 rows, OK-to-NG toggle, dirty/progress');
