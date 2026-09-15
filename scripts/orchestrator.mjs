#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import {
  completeStage,
  createInitialState,
  decideGate,
  readState,
  statePath,
  validateState,
  workspacePath
} from "./lib/workflow.mjs";

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const values = {};
  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (!token.startsWith("--")) throw new Error(`Unexpected argument: ${token}`);
    const key = token.slice(2);
    const value = rest[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for --${key}`);
    values[key] = value;
    index += 1;
  }
  return { command, values };
}

function usage() {
  return `Usage:
  orchestrator.mjs init --name <name> [--figma-url <url>]
  orchestrator.mjs status
  orchestrator.mjs complete --stage <stage> --artifact <file>
  orchestrator.mjs approve --gate <gate> --by <human>
  orchestrator.mjs reject --gate <gate> --by <human> --reason <reason>
  orchestrator.mjs validate`;
}

function summarize(state) {
  return {
    project: state.project.name,
    status: state.status,
    currentStage: state.currentStage,
    stages: Object.fromEntries(Object.entries(state.stages).map(([name, value]) => [name, value.status])),
    gates: Object.fromEntries(Object.entries(state.gates).map(([name, value]) => [name, value.status]))
  };
}

try {
  const { command, values } = parseArgs(process.argv.slice(2));
  const workspace = workspacePath();

  if (!command || command === "help") {
    console.log(usage());
    process.exit(0);
  }

  if (command === "init") {
    if (!values.name) throw new Error("--name is required");
    if (fs.existsSync(statePath(workspace))) throw new Error(`Workflow already initialized: ${workspace}`);
    fs.mkdirSync(path.join(workspace, "artifacts"), { recursive: true });
    const state = createInitialState({ name: values.name, figmaUrl: values["figma-url"] || null, workspace });
    fs.writeFileSync(statePath(workspace), `${JSON.stringify(state, null, 2)}\n`);
    console.log(JSON.stringify(summarize(state), null, 2));
    process.exit(0);
  }

  const state = readState(workspace);
  if (command === "status") {
    console.log(JSON.stringify(summarize(state), null, 2));
  } else if (command === "complete") {
    if (!values.stage || !values.artifact) throw new Error("--stage and --artifact are required");
    completeStage(state, values.stage, values.artifact);
    fs.writeFileSync(statePath(workspace), `${JSON.stringify(state, null, 2)}\n`);
    console.log(JSON.stringify(summarize(state), null, 2));
  } else if (command === "approve" || command === "reject") {
    if (!values.gate || !values.by) throw new Error("--gate and --by are required");
    decideGate(state, values.gate, command === "approve" ? "approved" : "rejected", values.by, values.reason || null);
    fs.writeFileSync(statePath(workspace), `${JSON.stringify(state, null, 2)}\n`);
    console.log(JSON.stringify(summarize(state), null, 2));
  } else if (command === "validate") {
    const errors = validateState(state);
    if (errors.length) throw new Error(errors.join("\n"));
    console.log(`Valid workflow state: ${workspace}`);
  } else {
    throw new Error(`Unknown command: ${command}\n${usage()}`);
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
