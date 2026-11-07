'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const pages=fs.readFileSync('.github/workflows/pages-deploy.yml','utf8');
const core=fs.readFileSync('.github/workflows/core-workflow-regression.yml','utf8');
const names=[...pages.matchAll(/^      - name: (.+)$/gm)].map(x=>x[1]);
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
assert.equal(allNames.length,22,'22 intentional pages workflow steps');

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
assert(verify.trimEnd().endsWith('exit 1'),'Pages verification must end after explicit failure');
const regressionCalls=[...core.matchAll(/^\s+node (tests\/[^\s]+\.cjs)$/gm)].map(m=>m[1]);
assert.equal(regressionCalls.length,new Set(regressionCalls).size,'core regression scripts must not repeat');
assert(regressionCalls.includes('tests/pages-workflow-structure-smoke.cjs'),'this deployment structure smoke must be included in core CI');
console.log('Pages deployment workflow: 22 unique steps; one upload/deploy/verify; assets verified');
