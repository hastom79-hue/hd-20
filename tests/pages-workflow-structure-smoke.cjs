'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const pages=fs.readFileSync('.github/workflows/pages-deploy.yml','utf8');
const core=fs.readFileSync('.github/workflows/core-workflow-regression.yml','utf8');
const {spawnSync}=require('node:child_process');
const lines=pages.split('\n');
let checked=0;
for(let i=0;i<lines.length;i++){
  if(lines[i].trim()!=="node <<'NODE'")continue;
  const start=i+1;
  let end=start;
  while(end<lines.length&&lines[end].trim()!=='NODE')end++;
  assert(end<lines.length,'unterminated Node heredoc at workflow line '+(i+1));
  const source=lines.slice(start,end).map(line=>line.replace(/^          /,'')).join('\n');
  const result=spawnSync(process.execPath,['--check','-'],{input:source,encoding:'utf8'});
  assert.equal(result.status,0,'invalid inline Node test at workflow line '+(i+1)+': '+result.stderr);
  checked++;
  i=end;
}
assert(checked>0,'Pages workflow must contain executable inline Node tests');
const names=[...pages.matchAll(/^      - name: (.+)$/gm)].map(x=>x[1]);
assert.equal(names[0],'Checkout HD-20','Pages must checkout before tests');
assert.equal(names[1],'Validate deployment workflow test scripts','Pages must validate workflow before source checks');
assert(pages.includes('run: node tests/pages-workflow-structure-smoke.cjs'),'Pages deployment must execute workflow syntax gate');
const ordered=['Configure GitHub Pages','Upload static site','Deploy to GitHub Pages','Verify published Pages revision and critical scripts'];
assert.equal(names.length,new Set(names).size,'Pages workflow must not repeat named deployment or validation steps');
for(const name of ordered)assert.equal(names.filter(x=>x===name).length,1,name+' must run exactly once');
assert.deepEqual(names.slice(-4),ordered,'Pages deployment must follow all source and regression checks');
assert.equal((pages.match(/^name: HD-20 GitHub Pages deploy$/gm)||[]).length,1,'single Pages workflow definition');
assert.equal((pages.match(/^jobs:$/gm)||[]).length,1,'single jobs definition');
for(const [action,label] of [
 ['actions/configure-pages@v5','configure'],
 ['actions/upload-pages-artifact@v4','upload'],
 ['actions/deploy-pages@v4','deploy']
])assert.equal(pages.split(action).length-1,1,label+' actual GitHub action exactly once');
const allNames=[...pages.matchAll(/^      - name: (.+)$/gm)].map(m=>m[1]);
assert(allNames.length>=4,'Pages workflow must include deployment stages');

const verify=pages.slice(pages.lastIndexOf('      - name: Verify published Pages revision and critical scripts'));
for(const key of ['expected_subtabs=','expected_audit=','expected_tobe=','expected_theme=','expected_retention=',
 'grep -Fq \'completed:complete\'','grep -Fq \'Verify persisted bi-directional references\'',
 'grep -Fq \'TO-BE 완료일·최초 요청일\''])
 assert(verify.includes(key),'published Pages verification missing '+key);
for(const [asset,proof] of [
 ['hd20-subtabs.js','최초 평가자를 확인할 수 없습니다'],
 ['audit-closed-loop-workflow.js','previousAudit=localStorage.getItem'],
 ['audit-as-is-to-be-manager.js','completed:complete'],
 ['theme-inspection.js','Verify persisted bi-directional references'],
 ['retention-draw-integrity-guard.js','TO-BE 완료일·최초 요청일']
]){
 assert(verify.includes('\"$base/'+asset+'\"'),'published '+asset+' download missing');
 assert(verify.includes(proof),'published '+asset+' evidence missing');
}
for(const [source,published] of [
 ['hd20-subtabs.js','subtabs'],
 ['audit-closed-loop-workflow.js','audit'],
 ['audit-as-is-to-be-manager.js','tobe'],
 ['theme-inspection.js','theme'],
 ['retention-draw-integrity-guard.js','retention']
]){
 assert(verify.includes('cmp -s '+source+' /tmp/hd20-published-'+published+'.js'),'published file must match source bytes: '+source);
}
assert(verify.trimEnd().endsWith('exit 1'),'Pages verification must end after explicit failure');
const regressionCalls=[...core.matchAll(/^\s+node (tests\/[^\s]+\.cjs)$/gm)].map(m=>m[1]);
assert.equal(regressionCalls.length,new Set(regressionCalls).size,'core regression scripts must not repeat');
assert(regressionCalls.includes('tests/pages-workflow-structure-smoke.cjs'),'this deployment structure smoke must be included in core CI');
console.log('Pages deployment workflow: unique steps; one upload/deploy/verify; assets verified');
