'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('audit-as-is-to-be-manager.js','utf8');
const start=src.indexOf('const flushSearch=()=>');
const end=src.indexOf("host.querySelector('[data-tobe-prev]').onclick",start);
assert(start>=0&&end>start,'actual filter event handlers present');
const install=new Function('host','filt','render','setTimeout','clearTimeout','window','document','ID','state',`
let searchDebounce=null,page=1;
${src.slice(start,end)}
state.inspect=()=>({filt:{...filt},page,pending:searchDebounce!==null});
`);
function harness(){
 const events={},pending=new Map(),calls=[],state={},filt={team:'',status:'',text:''};
 let sequence=0;
 const el=key=>events[key]||(events[key]={value:'',onchange:null,oninput:null,onclick:null,focus(){},setSelectionRange(){}});
 const host={isConnected:true,querySelector:el};
 const timers={set:(callback)=>{const id=++sequence;pending.set(id,callback);return id},clear:id=>{pending.delete(id)}};
 let renderCount=0;
 const render=()=>{renderCount++;calls.push({...filt});el('[data-tobe-search]').value=filt.text};
 install(host,filt,render,timers.set,timers.clear,{HD20_NAV:{active:()=> 'activity'}},{getElementById:id=>id==='hd20AsIsToBeManager'?host:{dataset:{subview:'tobe'}}},'hd20AsIsToBeManager',state);
 return {el,pending,calls,state,getRenderCount:()=>renderCount,advance(){for(const [id,fn] of [...pending]){pending.delete(id);fn()}}};
}
{
 const h=harness();h.el('[data-tobe-search]').oninput({target:{value:'first'}});
 assert.equal(h.pending.size,1,'search debounce pending');
 h.el('[data-tobe-reset]').onclick();
 assert.equal(h.pending.size,0,'reset cancels old debounce');
 assert.deepEqual(h.state.inspect().filt,{team:'',status:'',text:''},'reset clears filter');
 const count=h.getRenderCount();h.advance();assert.equal(h.getRenderCount(),count,'stale search does not rerender after reset');
 console.log('PASS rapid typing then reset');
}
{
 const h=harness();h.el('[data-tobe-search]').value='ABC';
 h.el('[data-tobe-search]').oninput({target:{value:'ABC'}});
 h.el('[data-tobe-team]').onchange({target:{value:'조립'}});
 assert.equal(h.pending.size,0,'team change cancels search debounce');
 assert.equal(h.state.inspect().filt.text,'ABC','team change flushes current search');
 assert.equal(h.state.inspect().filt.team,'조립','team filter remains selected');
 const count=h.getRenderCount();h.advance();assert.equal(h.getRenderCount(),count,'no stale team rerender');
 console.log('PASS rapid typing then team filter');
}
{
 const h=harness();h.el('[data-tobe-search]').value='LOT42';
 h.el('[data-tobe-search]').oninput({target:{value:'LOT42'}});
 h.el('[data-tobe-status]').onchange({target:{value:'완료'}});
 assert.equal(h.pending.size,0,'status change cancels pending search');
 assert.equal(h.state.inspect().filt.text,'LOT42','status change preserves text');
 assert.equal(h.state.inspect().filt.status,'완료','status change preserved');
 console.log('PASS rapid typing then status filter');
}
{
 const h=harness();h.el('[data-tobe-search]').value='FIRST';
 h.el('[data-tobe-search]').oninput({target:{value:'FIRST'}});
 h.el('[data-tobe-search]').value='LATEST';
 h.el('[data-tobe-search]').oninput({target:{value:'LATEST'}});
 assert.equal(h.pending.size,1,'only last debounce retained');
 h.advance();
 assert.equal(h.state.inspect().filt.text,'LATEST','latest search committed');
 assert.equal(h.getRenderCount(),1,'only one search render');
 console.log('PASS fast consecutive keystrokes');
}
console.log('TO-BE filter-debounce interactions 4/4 passed');
