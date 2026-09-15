#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const target = path.resolve(process.argv[2] || ".figma-orchestrator/artifacts/tokens.json");
const errors = [];

if (!fs.existsSync(target)) {
  console.error(`Token file not found: ${target}`);
  process.exit(1);
}

let tokens;
try {
  tokens = JSON.parse(fs.readFileSync(target, "utf8"));
} catch (error) {
  console.error(`Invalid token JSON: ${error.message}`);
  process.exit(1);
}

for (const required of [2, 4, 8]) {
  if (!Object.values(tokens.spacing || {}).includes(required)) errors.push(`Spacing scale must include ${required}`);
}

const evenGroups = ["spacing", "radii", "sizes", "typography"];
for (const group of evenGroups) {
  const values = tokens[group];
  if (!values || typeof values !== "object" || Array.isArray(values)) {
    errors.push(`Missing token group: ${group}`);
    continue;
  }
  for (const [name, value] of Object.entries(values)) {
    if (typeof value !== "number" || !Number.isFinite(value)) errors.push(`${group}.${name} must be numeric`);
    else if (!Number.isInteger(value) || Math.abs(value) % 2 !== 0) errors.push(`${group}.${name} must be an even integer, received ${value}`);
  }
}

for (const [name, value] of Object.entries(tokens.strokes || {})) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) errors.push(`strokes.${name} must be a positive number`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Valid 2/4/8 token system: ${target}`);
