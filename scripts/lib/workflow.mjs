import fs from "node:fs";
import path from "node:path";

export const STAGES = [
  "brief",
  "strategy",
  "ux",
  "content",
  "direction",
  "system",
  "concept",
  "desktop",
  "responsive",
  "qa",
  "handoff"
];

export const GATES = {
  structure: { after: "content", unlocks: "direction" },
  direction: { after: "direction", unlocks: "system" },
  desktop: { after: "desktop", unlocks: "responsive" },
  final: { after: "qa", unlocks: "handoff" }
};

export function workspacePath(cwd = process.cwd(), env = process.env) {
  return path.resolve(env.FIGMA_ORCHESTRATOR_WORKSPACE || path.join(cwd, ".figma-orchestrator"));
}

export function statePath(workspace) {
  return path.join(workspace, "state.json");
}

export function createInitialState({ name, figmaUrl = null, workspace }) {
  const now = new Date().toISOString();
  return {
    version: 1,
    project: { name, figmaUrl },
    workspace,
    currentStage: "brief",
    status: "active",
    stages: Object.fromEntries(STAGES.map((stage) => [stage, { status: "pending", artifact: null, completedAt: null }])),
    gates: Object.fromEntries(Object.keys(GATES).map((gate) => [gate, { status: "pending", decidedBy: null, decidedAt: null, reason: null }])),
    history: [{ event: "initialized", at: now }],
    createdAt: now,
    updatedAt: now
  };
}

export function readState(workspace) {
  const file = statePath(workspace);
  if (!fs.existsSync(file)) throw new Error(`Workflow not initialized: ${file}`);
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function writeState(workspace, state) {
  fs.mkdirSync(workspace, { recursive: true });
  state.updatedAt = new Date().toISOString();
  fs.writeFileSync(statePath(workspace), `${JSON.stringify(state, null, 2)}\n`);
}

export function requiredGateForStage(stage) {
  return Object.entries(GATES).find(([, config]) => config.unlocks === stage)?.[0] || null;
}

export function completeStage(state, stage, artifact, baseDir = process.cwd()) {
  if (!STAGES.includes(stage)) throw new Error(`Unknown stage: ${stage}`);
  const index = STAGES.indexOf(stage);
  const prior = STAGES.slice(0, index);
  const incomplete = prior.find((item) => state.stages[item].status !== "complete");
  if (incomplete) throw new Error(`Cannot complete ${stage}; prior stage ${incomplete} is incomplete`);

  const gate = requiredGateForStage(stage);
  if (gate && state.gates[gate].status !== "approved") {
    throw new Error(`Cannot start ${stage}; ${gate} gate is not approved`);
  }

  const artifactPath = path.resolve(baseDir, artifact);
  if (!fs.existsSync(artifactPath) || !fs.statSync(artifactPath).isFile()) {
    throw new Error(`Artifact does not exist: ${artifactPath}`);
  }

  const now = new Date().toISOString();
  state.stages[stage] = { status: "complete", artifact: artifactPath, completedAt: now };
  const next = STAGES[index + 1];
  state.currentStage = next || "complete";
  if (!next) state.status = "complete";
  state.history.push({ event: "stage_completed", stage, artifact: artifactPath, at: now });
  return state;
}

export function decideGate(state, gate, decision, by, reason = null) {
  if (!GATES[gate]) throw new Error(`Unknown gate: ${gate}`);
  if (!by?.trim()) throw new Error("A human decision maker is required");
  if (/^(claude|ai|agent|orchestrator|assistant)$/i.test(by.trim())) {
    throw new Error("Approval must come from a human decision maker, not the producing agent");
  }
  if (!['approved', 'rejected'].includes(decision)) throw new Error(`Invalid decision: ${decision}`);
  if (state.stages[GATES[gate].after].status !== "complete") {
    throw new Error(`Cannot decide ${gate}; ${GATES[gate].after} is incomplete`);
  }
  if (decision === "rejected" && !reason?.trim()) throw new Error("A rejection reason is required");

  const now = new Date().toISOString();
  state.gates[gate] = { status: decision, decidedBy: by.trim(), decidedAt: now, reason };
  state.history.push({ event: `gate_${decision}`, gate, by: by.trim(), reason, at: now });
  if (decision === "rejected") state.currentStage = GATES[gate].after;
  return state;
}

export function validateState(state) {
  const errors = [];
  if (state.version !== 1) errors.push("Unsupported state version");
  if (!state.project?.name) errors.push("Missing project name");
  for (const stage of STAGES) {
    if (!state.stages?.[stage]) errors.push(`Missing stage: ${stage}`);
    if (state.stages?.[stage]?.status === "complete" && !state.stages[stage].artifact) errors.push(`Completed stage lacks artifact: ${stage}`);
  }
  for (const gate of Object.keys(GATES)) {
    const value = state.gates?.[gate];
    if (!value) errors.push(`Missing gate: ${gate}`);
    if (value?.status === "approved" && !value.decidedBy) errors.push(`Approved gate lacks decision maker: ${gate}`);
  }
  return errors;
}
