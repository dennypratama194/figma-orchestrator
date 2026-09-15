import fs from 'node:fs';
import path from 'node:path';
import {readEvidence,evidenceFresh,hash} from './evidence.mjs';
export const STAGES=['brief','strategy','ux','content','direction','system','concept','desktop','responsive','qa','handoff'];
export const GATES={structure:{after:'content',unlocks:'direction'},direction:{after:'direction',unlocks:'system'},concept:{after:'concept',unlocks:'desktop'},desktop:{after:'desktop',unlocks:'responsive'},final:{after:'qa',unlocks:'handoff'}};
const pending=()=>({status:'pending'});
export const workspacePath=(cwd=process.cwd(),env=process.env)=>path.resolve(env.FIGMA_ORCHESTRATOR_WORKSPACE||path.join(cwd,'.figma-orchestrator'));
export const statePath=w=>path.join(w,'state.json');
export function createInitialState({name,figmaUrl=null,workspace}) {
 if(!name?.trim()) throw new Error('Project name required');
 const now=new Date().toISOString();
 return {version:2,revision:0,project:{name,figmaUrl},workspace,currentStage:'brief',status:'active',stages:Object.fromEntries(STAGES.map(s=>[s,pending()])),gates:Object.fromEntries(Object.keys(GATES).map(g=>[g,pending()])),history:[],createdAt:now,updatedAt:now};
}
function refresh(s){
 s.currentStage=STAGES.find(k=>s.stages[k].status!=='complete')||'complete';
 const blocked=Object.entries(GATES).some(([key,gate]) => STAGES.indexOf(gate.unlocks)<=STAGES.indexOf(s.currentStage) && s.gates[key].status!=='approved');
 s.status=s.currentStage==='complete'?'complete':blocked?'blocked':'active';
}
const fingerprint=(s,gate)=>hash(JSON.stringify(STAGES.slice(0,STAGES.indexOf(GATES[gate].after)+1).map(k=>s.stages[k])));
export function validateState(s){
 const errors=[];
 if(!s||s.version!==2) return ['Unsupported state version; run migrate for v1'];
 if(!Number.isInteger(s.revision)||s.revision<0||!s.project?.name?.trim()||!Array.isArray(s.history)) errors.push('Invalid state metadata');
 if(!['active','blocked','complete'].includes(s.status)||![...STAGES,'complete'].includes(s.currentStage)) errors.push('Invalid workflow status');
 for(const k of STAGES){
  const v=s.stages?.[k];
  if(!v||!['pending','complete'].includes(v.status)){errors.push(`Invalid stage: ${k}`);continue;}
  if(v.status==='complete') {
   if(!v.artifact||!v.hash||!Array.isArray(v.files)||!evidenceFresh(v)) errors.push(`Stale or missing evidence: ${k}`);
   for(const prev of STAGES.slice(0,STAGES.indexOf(k))) if(s.stages?.[prev]?.status!=='complete') errors.push(`Missing predecessor: ${prev}`);
   for(const [g,c] of Object.entries(GATES)) if(STAGES.indexOf(c.unlocks)<=STAGES.indexOf(k)&&s.gates?.[g]?.status!=='approved') errors.push(`Unapproved gate: ${g}`);
  }
 }
 for(const [g] of Object.entries(GATES)){
  const v=s.gates?.[g];
  if(!v||!['pending','approved','rejected'].includes(v.status)){errors.push(`Invalid gate: ${g}`);continue;}
  if(v.status!=='pending'&&(!v.decidedBy||!v.statement||!v.source||!v.decidedAt)) errors.push(`Missing decision provenance: ${g}`);
  if(v.status==='approved'&&(s.stages?.[GATES[g].after]?.status!=='complete'||v.fingerprint!==fingerprint(s,g))) errors.push(`Stale approval: ${g}`);
 }
 if(!errors.length){const copy=structuredClone(s);refresh(copy);if(copy.status!==s.status||copy.currentStage!==s.currentStage)errors.push('Inconsistent workflow position');}
 return errors;
}
function assertValid(s){const errors=validateState(s);if(errors.length)throw new Error(errors.join('\n'));}
export function readState(w){const s=JSON.parse(fs.readFileSync(statePath(w),'utf8'));return s;}
export function invalidateFrom(s,stage){
 const index=STAGES.indexOf(stage);if(index<0)throw new Error('Unknown stage');
 for(const k of STAGES.slice(index))s.stages[k]=pending();
 for(const [g,c] of Object.entries(GATES))if(STAGES.indexOf(c.after)>=index)s.gates[g]=pending();
 s.history.push({event:'invalidated',stage,at:new Date().toISOString()});refresh(s);return s;
}
export function completeStage(s,stage,artifact,baseDir=process.cwd()){
 assertValid(s);const i=STAGES.indexOf(stage);if(i<0)throw new Error('Unknown stage');
 for(const k of STAGES.slice(0,i))if(s.stages[k].status!=='complete')throw new Error(`Incomplete predecessor: ${k}`);
 for(const [g,c] of Object.entries(GATES))if(STAGES.indexOf(c.unlocks)<=i&&s.gates[g].status!=='approved')throw new Error(`Unapproved gate: ${g}`);
 const evidence=readEvidence(path.resolve(baseDir,artifact),stage);
 if(s.project.figmaUrl&&i>=STAGES.indexOf('system')){
  const actual=JSON.parse(fs.readFileSync(evidence.artifact,'utf8')).figmaUrl;
  const key=u=>new URL(u).pathname.split('/')[2];
  if(key(actual)!==key(s.project.figmaUrl))throw new Error('Evidence belongs to another Figma file');
 }
 invalidateFrom(s,stage);s.stages[stage]={status:'complete',...evidence,completedAt:new Date().toISOString()};refresh(s);s.history.push({event:'completed',stage,hash:evidence.hash,at:new Date().toISOString()});return s;
}
export function decideGate(s,gate,decision,by,reason=null,provenance={}){
 assertValid(s);if(!GATES[gate])throw new Error('Unknown gate');
 if(s.stages[GATES[gate].after].status!=='complete')throw new Error('Gate deliverables incomplete');
 if(!['approved','rejected'].includes(decision)||!by?.trim())throw new Error('Decision and reviewer required');
 if(!provenance.statement?.trim()||!provenance.source?.trim()||provenance.fingerprint!==fingerprint(s,gate))throw new Error('Decision statement, source and current review fingerprint required');
 if(decision==='rejected'&&!reason?.trim())throw new Error('Rejection reason required');
 if(decision==='rejected')invalidateFrom(s,GATES[gate].unlocks);
 s.gates[gate]={status:decision,decidedBy:by,reason,...provenance,decidedAt:new Date().toISOString()};refresh(s);s.history.push({event:'decision',gate,...s.gates[gate]});return s;
}
export function reviewGate(s,gate){assertValid(s);if(!GATES[gate]||s.stages[GATES[gate].after].status!=='complete')throw new Error('Gate not ready');return {gate,fingerprint:fingerprint(s,gate),artifacts:STAGES.slice(0,STAGES.indexOf(GATES[gate].after)+1).map(k=>({stage:k,artifact:s.stages[k].artifact}))};}
export function writeState(w,s){
 assertValid(s);fs.mkdirSync(w,{recursive:true});const lock=path.join(w,'state.lock');let fd;
 try{fd=fs.openSync(lock,'wx');}catch{throw new Error('Workflow is locked; do not retry until the active writer finishes');}
 const tmp=path.join(w,`state.${process.pid}.tmp`);
 try{
  const existing=fs.existsSync(statePath(w))?readState(w):null;
  if(existing&&existing.revision!==s.revision)throw new Error('State revision conflict; reload before retrying');
  const next={...s,revision:s.revision+1,updatedAt:new Date().toISOString()};
  const out=fs.openSync(tmp,'wx');try{fs.writeFileSync(out,JSON.stringify(next,null,2)+'\n');fs.fsyncSync(out);}finally{fs.closeSync(out);}
  fs.renameSync(tmp,statePath(w));Object.assign(s,next);
 }finally{if(fs.existsSync(tmp))fs.unlinkSync(tmp);fs.closeSync(fd);fs.unlinkSync(lock);}
}
export function migrateState(w){
 const old=readState(w);if(old.version!==1)throw new Error('Only v1 migration supported');
 const backup=path.join(w,'state.v1.backup.json');fs.writeFileSync(backup,JSON.stringify(old,null,2),{encoding:'utf8',flag:'wx'});
 const s=createInitialState({name:old.project.name,figmaUrl:old.project.figmaUrl,workspace:w});s.history=[{event:'migrated',backup,reason:'Legacy evidence and approvals require revalidation',at:new Date().toISOString()}];
 // Migration is explicit and requires an idle workspace. Existing artifacts are retained.
 const lock=path.join(w,'state.lock');const fd=fs.openSync(lock,'wx');
 try {const tmp=path.join(w,'migration.tmp');fs.writeFileSync(tmp,JSON.stringify(s,null,2));fs.renameSync(tmp,statePath(w));}finally{fs.closeSync(fd);fs.unlinkSync(lock);}return s;
}
