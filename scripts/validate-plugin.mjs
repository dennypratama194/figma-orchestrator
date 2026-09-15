#!/usr/bin/env node
import fs from "node:fs";
import { parseDocument } from "yaml";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function parseFrontmatter(file) {
  const content = fs.readFileSync(file, "utf8");
  if (!content.startsWith("---\n")) return null;
  const end = content.indexOf("\n---\n", 4);
  if (end === -1) return null;
  const doc = parseDocument(content.slice(4, end), { uniqueKeys: true });
  if (doc.errors.length) { errors.push(`Invalid YAML: ${file}: ${doc.errors[0].message}`); return null; }
  const value = doc.toJS();
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

const manifestFile = path.join(root, ".claude-plugin", "plugin.json");
try {
  const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
  if (manifest.name !== "figma-orchestrator") errors.push("Manifest name must be figma-orchestrator");
  if (!/^\d+\.\d+\.\d+$/.test(manifest.version || "")) errors.push("Manifest version must be semver");
} catch (error) {
  errors.push(`Invalid manifest: ${error.message}`);
}

for (const directory of ["skills", "agents", "scripts", "schemas", "templates"]) {
  if (!fs.existsSync(path.join(root, directory))) errors.push(`Missing directory: ${directory}`);
}

const skillFiles = walk(path.join(root, "skills")).filter((file) => file.endsWith("SKILL.md"));
if (skillFiles.length < 2) errors.push("Expected an orchestrator plus specialist skills");
for (const file of skillFiles) {
  const metadata = parseFrontmatter(file);
  if (!metadata?.name || !metadata?.description) errors.push(`Invalid skill frontmatter: ${path.relative(root, file)}`);
  if (metadata?.name && !/^[a-z0-9-]+$/.test(metadata.name)) errors.push(`Invalid skill name: ${metadata.name}`);
  const content = fs.readFileSync(file, "utf8");
  if (/TODO|PLACEHOLDER|\[Insert/.test(content)) errors.push(`Unfinished scaffold text: ${path.relative(root, file)}`);
}

const agentFiles = walk(path.join(root, "agents")).filter((file) => file.endsWith(".md"));
const agentNames = new Set();
for (const file of agentFiles) {
  const metadata = parseFrontmatter(file);
  if (!metadata?.name || !metadata?.description) errors.push(`Invalid agent frontmatter: ${path.relative(root, file)}`);
  if (metadata?.name && agentNames.has(metadata.name)) errors.push(`Duplicate agent name: ${metadata.name}`);
  if (metadata?.name) agentNames.add(metadata.name);
}

for (const file of walk(path.join(root, "schemas")).filter((item) => item.endsWith(".json"))) {
  try { JSON.parse(fs.readFileSync(file, "utf8")); } catch (error) { errors.push(`Invalid JSON ${path.relative(root, file)}: ${error.message}`); }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Plugin valid: ${skillFiles.length} skills and ${agentFiles.length} agents checked`);
