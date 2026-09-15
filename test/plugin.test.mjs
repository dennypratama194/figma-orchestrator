import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {spawnSync} from 'node:child_process';
test('malformed YAML is rejected by shipped validator',t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'figo-plugin-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 for(const folder of ['scripts','skills','agents','schemas','.claude-plugin','templates'])fs.cpSync(folder,path.join(dir,folder),{recursive:true});
 fs.writeFileSync(path.join(dir,'package.json'),'{"type":"module"}');
 fs.symlinkSync(path.resolve('node_modules'),path.join(dir,'node_modules'),process.platform==='win32'?'junction':'dir');
 fs.writeFileSync(path.join(dir,'skills/analyze-brief/SKILL.md'),'---\nname: analyze-brief\ndescription: [broken\n---\nTest\n');
 const result=spawnSync(process.execPath,[path.join(dir,'scripts/validate-plugin.mjs')],{encoding:'utf8'});
 assert.notEqual(result.status,0);assert.match(result.stderr,/Invalid YAML/);
});
