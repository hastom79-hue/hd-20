'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('index.html','utf8');
const group=fs.readFileSync('hd20-condition-groups.js','utf8');
const provider=fs.readFileSync('maturity-condition-analysis.js','utf8');
assert(html.includes('hd20-condition-groups.js?v=20261107-summary-provider-1'),'condition group cache version missing');
assert(group.includes('window.HD20_MCA_SUMMARY_ONLY=true'),'summary only flag missing');
assert(group.includes("script.src='maturity-condition-analysis.js?v=20261107-summary-only-1'"),'summary provider loader missing');
assert(group.includes('script.onload=()=>ensure()'),'summary provider load callback missing');
assert(provider.includes('if(!window.HD20_MCA_SUMMARY_ONLY)render()'),'legacy panel must be suppressed during summary only mode');
assert(provider.includes('window.HD20MaturityConditionAnalysis={criteriaState,summary,render}'),'summary API must be exported');
assert(!html.includes('src="maturity-condition-analysis.js'),'legacy full panel must not load directly');
const vm=require('node:vm');
const listeners=[];
const context={
 window:{HD20_MCA_SUMMARY_ONLY:true},
 document:{readyState:'loading',addEventListener:(event,handler)=>listeners.push(event)},
 localStorage:{getItem:()=>null},
 console
};
vm.runInNewContext(provider,context,{filename:'maturity-condition-analysis.js'});
assert.equal(typeof context.window.HD20MaturityConditionAnalysis?.summary,'function','summary provider API must execute');
const result=context.window.HD20MaturityConditionAnalysis.summary();
assert.equal(result.rows.length,0,'empty input must return zero rows');
assert.equal(result.one.length,0,'empty input must not fabricate one-criterion cases');
const sampleRows=[
 {team:'A',line:'L1',workplace:'W1',type:'고도화',criterionVisual:true},
 {team:'A',line:'L2',workplace:'W2',type:'고도화',criterionVisual:true,criterionGreen:true},
 {team:'B',line:'L3',workplace:'W3',type:'고도화',criterionVisual:true,criterionGreen:true,criterionSpace:true},
 {team:'B',line:'L4',workplace:'W4',type:'일반개선',criterionVisual:true,criterionGreen:true,criterionSpace:true}
];
context.window.HD20KPIData={load:()=>sampleRows,isAdvancementType:r=>r.type==='고도화'};
const populated=context.window.HD20MaturityConditionAnalysis.summary();
assert.equal(populated.rows.length,3,'non-advancement activity must be excluded');
assert.equal(populated.one.length,1,'one-criterion count incorrect');
assert.equal(populated.two.length,1,'two-criterion count incorrect');
assert.equal(populated.three.length,1,'three-criterion count incorrect');
assert.equal(populated.twoPlus.length,2,'two-plus count must include three-criterion records');
assert.equal(populated.threeWp,1,'three-criterion workplace count incorrect');
assert(listeners.includes('DOMContentLoaded'),'summary provider lifecycle must register');
assert(!listeners.includes('hd20-open-performance-conversion'),'summary-only provider must not eagerly render the legacy panel');
const ensureStart=group.indexOf('function ensure(){');
const ensureEnd=group.indexOf('function loadSummaryProvider()',ensureStart);
assert(ensureStart>=0&&ensureEnd>ensureStart,'condition-group mount function missing');
const ensureCode=group.slice(ensureStart,ensureEnd);
for(const legacyPresent of [true,false]){
 let insert,rendered=0;
 const host={insertAdjacentElement:(position,element)=>{insert={position,element}}};
 const legacy=legacyPresent?host:null;
 const dom={getElementById:id=>id==='hd20MaturityConditionAnalysis'?legacy:id==='performanceConversionAnalysis'?host:null,createElement:tag=>({tag})};
 const run=new Function('document','window','ID','css','render',ensureCode+'return ensure()');
 const ok=run(dom,{HD20MaturityConditionAnalysis:{summary:()=>({})}},'hd20ConditionGroups',()=>{},()=>rendered++);
 assert.equal(ok,true,'condition-group mount must succeed without legacy panel');
 assert.equal(insert.position,legacyPresent?'beforebegin':'afterbegin','condition-group insertion target');
 assert.equal(rendered,1,'condition-group must render');
}
console.log('PASS: 3-condition groups load a summary provider without restoring legacy panel');
