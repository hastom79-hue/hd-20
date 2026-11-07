'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('hd20-subtabs.js','utf8');
const start=src.indexOf(' rows[n]=r;\n try{\n  save(');
const end=src.indexOf(' }catch(err){',start);
assert(start>=0&&end>start,'retention verdict persistence verification before success');
const run=new Function('rows','n','r','save','load','evaluator','result','comment',src.slice(start,end)+' }catch(err){throw err} return true;');
const initial={id:'RET-1',caseId:'CASE-1',kind:'개선요청',team:'생산',workplace:'라인',result:'점검대기'};
function scenario(name,result,alter,shouldThrow){
 const savedResult={...initial,evaluator:'inspector@hd.com',result,comment:'field check',evaluatedAt:'2026-11-07T01:00:00Z',actionId:result==='부적합'?'AUTO-RETENTION-RET-1':''};
 const records=[{...initial}];
 let storage=null;
 const save=(key,val)=>{storage=val.map(x=>({...x}));if(alter)storage=alter(storage)};
 const load=()=>storage;
 let thrown=false;try{run(records,0,savedResult,save,load,'inspector@hd.com',result,'field check')}catch(e){thrown=true}
 assert.equal(thrown,shouldThrow,name);
}
scenario('suitable verdict persisted','적합',null,false);
scenario('defective verdict persisted','부적합',null,false);
scenario('lost saved row','적합',()=>[],true);
scenario('duplicate saved row','적합',list=>[...list,list[0]],true);
scenario('changed original case','적합',list=>[{...list[0],caseId:'OTHER'}],true);
scenario('changed evaluator','적합',list=>[{...list[0],evaluator:'OTHER'}],true);
scenario('changed verdict','부적합',list=>[{...list[0],result:'적합'}],true);
scenario('missing followup ID','부적합',list=>[{...list[0],actionId:''}],true);
scenario('changed inspection time','적합',list=>[{...list[0],evaluatedAt:''}],true);
console.log('Retention verdict persisted integrity: 9/9');
