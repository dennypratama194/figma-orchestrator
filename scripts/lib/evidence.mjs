import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {validateTokens} from './tokens.mjs';
export const hash = data => createHash('sha256').update(data).digest('hex');
export function readEvidence(file,stage) {
 const raw=fs.readFileSync(file); const e=JSON.parse(raw);
 if(e.stage!==stage || typeof e.summary!=='string' || !e.summary.trim()) throw new Error('Evidence needs matching stage and summary');
 if(!Array.isArray(e.files)||!e.files.length) throw new Error('Evidence needs deliverable files');
 const files=e.files.map(p=>{
  if(typeof p!=='string') throw new Error('File path must be a string');
  const full=path.resolve(path.dirname(file),p); const bytes=fs.readFileSync(full);
  if(!bytes.toString().trim()) throw new Error('Empty deliverable');
  return {path:full,hash:hash(bytes)};
 });
 const visual=['system','concept','desktop','responsive','qa','handoff'].includes(stage);
 if(visual) {
  if(!/^https:\/\/(www\.)?figma\.com\/(design|file)\//.test(e.figmaUrl||'')) throw new Error('Figma file URL required');
  if(!Array.isArray(e.nodes)||!e.nodes.length||e.nodes.some(n=>!n.id||!n.type)) throw new Error('Inspected node inventory required');
  if(!e.inspectedAt||!Number.isFinite(Date.parse(e.inspectedAt))||!e.inspectedBy) throw new Error('Inspection provenance required');
  if(!e.inspectionFile||!e.files.includes(e.inspectionFile)) throw new Error('Include MCP inspection response in files');
 }
 if(stage==='system') {
  for(const type of ['VARIABLE','COMPONENT']) if(!e.nodes.some(n=>n.type===type)) throw new Error(`Missing ${type} evidence`);
  if(!e.tokenFile||!e.files.includes(e.tokenFile)) throw new Error('Token file must be tracked');
  const errors=validateTokens(JSON.parse(fs.readFileSync(path.resolve(path.dirname(file),e.tokenFile),'utf8')));
  if(errors.length) throw new Error(errors.join('\n'));
 }
 if(['concept','desktop','responsive','qa'].includes(stage)) {
  if(!Array.isArray(e.screens)||!e.screens.length||e.screens.some(s=>!s.nodeId||!Number.isInteger(s.width)||s.width<=0||!s.screenshot||!e.files.includes(s.screenshot))) throw new Error('Screen inventory with tracked screenshots required');
 }
 if(['concept','desktop','qa'].includes(stage)) {
  if(!e.review||!e.producedBy||!e.review.reviewer||e.review.reviewer===e.producedBy||!['pass','pass-with-notes'].includes(e.review.verdict)||!Array.isArray(e.review.findings)||e.review.findings.some(f=>f.severity==='blocker'&&f.resolved!==true)) throw new Error('Independent passing review with no unresolved blockers required');
 }
 return {artifact:path.resolve(file),hash:hash(raw),files};
}
export function evidenceFresh(record) {
 try {return hash(fs.readFileSync(record.artifact))===record.hash && record.files.every(f=>hash(fs.readFileSync(f.path))===f.hash);} catch{return false;}
}
