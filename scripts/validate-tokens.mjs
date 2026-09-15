#!/usr/bin/env node
import fs from 'node:fs';
import {validateTokens} from './lib/tokens.mjs';
try {
 const errors=validateTokens(JSON.parse(fs.readFileSync(process.argv[2]||'.figma-orchestrator/artifacts/tokens.json','utf8')));
 if(errors.length) throw new Error(errors.join('\n'));
 console.log('Token validation passed');
} catch(e) {console.error(e.message);process.exitCode=1;}
