'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('theme-inspection.js','utf8');
const start=source.indexOf('const THEME_COMPLETED_STATUSES=');
const end=source.indexOf('function actionTable(month)',start);
assert.ok(start>=0&&end>start,'theme status classification helpers must exist');
const context=vm.createContext({});
vm.runInContext(source.slice(start,end)+'\nthis.classify=(value)=>({completed:THEME_COMPLETED_STATUSES.has(normalizeThemeStatus(value)),active:THEME_ACTIVE_STATUSES.has(normalizeThemeStatus(value))});',context,{timeout:1000});
for(const value of ['완료','조치완료','개선완료','종결','종료','유지점검 완료','효과검증 완료','  효과검증  완료  ']){
 const result=context.classify(value);assert.equal(result.completed,true,value);assert.equal(result.active,false,value);
}
for(const value of ['조치대기','미착수','진행중','진행 중','기한경과','보완요청','조치중','조치 진행중','효과검증 대기']){
 const result=context.classify(value);assert.equal(result.active,true,value);assert.equal(result.completed,false,value);
}
for(const value of ['','미분류','보류','완료 예정']){
 const result=context.classify(value);assert.equal(result.active,false,value);assert.equal(result.completed,false,value);
}
console.log('Theme status normalization and classification PASS');
