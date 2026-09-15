#!/usr/bin/env node
import * as w from './lib/workflow.mjs';
import fs from 'node:fs';
const [command,...args]=process.argv.slice(2);
try {
 const v={};for(let i=0;i<args.length;i+=2){if(!args[i].startsWith('--')||!args[i+1]||args[i+1].startsWith('--'))throw new Error('Options require values');v[args[i].slice(2)]=args[i+1];}
 const dir=w.workspacePath();let s;
 if(!command||command==='help'){console.log('init --name NAME [--figma-url URL]\nstatus | validate | migrate\ncomplete --stage STAGE --artifact EVIDENCE.json\nrevise --stage STAGE\nreview --gate GATE\napprove/reject --gate GATE --by NAME --fingerprint HASH --statement TEXT --source REFERENCE [--reason TEXT]');}
 else if(command==='init'){if(fs.existsSync(w.statePath(dir)))throw new Error('Already initialized');s=w.createInitialState({name:v.name,figmaUrl:v['figma-url'],workspace:dir});w.writeState(dir,s);console.log(JSON.stringify(s,null,2));}
 else if(command==='migrate'){console.log(JSON.stringify(w.migrateState(dir),null,2));}
 else {
  s=w.readState(dir);
  if(command==='status'||command==='validate'){const errors=w.validateState(s);console.log(JSON.stringify({state:s,errors},null,2));if(errors.length)process.exitCode=1;}
  else if(command==='review')console.log(JSON.stringify(w.reviewGate(s,v.gate),null,2));
  else {
   if(command==='complete')w.completeStage(s,v.stage,v.artifact);
   else if(command==='revise')w.invalidateFrom(s,v.stage);
   else if(command==='approve'||command==='reject')w.decideGate(s,v.gate,command==='approve'?'approved':'rejected',v.by,v.reason,{fingerprint:v.fingerprint,statement:v.statement,source:v.source});
   else throw new Error('Unknown command');
   w.writeState(dir,s);console.log(JSON.stringify({revision:s.revision,status:s.status,currentStage:s.currentStage},null,2));
  }
 }
}catch(e){console.error(e.message);process.exitCode=1;}
