import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { completeStage, createInitialState, decideGate, validateState } from "../scripts/lib/workflow.mjs";

function artifact(directory, name) {
  const file = path.join(directory, name);
  fs.writeFileSync(file, "evidence\n");
  return file;
}

test("initial state is valid and starts at brief", () => {
  const state = createInitialState({ name: "Test", workspace: "/tmp/test" });
  assert.equal(state.currentStage, "brief");
  assert.deepEqual(validateState(state), []);
});

test("stages cannot be skipped", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "figo-"));
  const state = createInitialState({ name: "Test", workspace: directory });
  assert.throws(() => completeStage(state, "strategy", artifact(directory, "strategy.md")), /prior stage brief/);
});

test("a gate requires its prior stage and a named human", () => {
  const state = createInitialState({ name: "Test", workspace: "/tmp/test" });
  assert.throws(() => decideGate(state, "structure", "approved", "Denny"), /content is incomplete/);
});

test("an agent cannot approve its own work", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "figo-"));
  const state = createInitialState({ name: "Test", workspace: directory });
  for (const stage of ["brief", "strategy", "ux", "content"]) {
    completeStage(state, stage, artifact(directory, `${stage}.md`));
  }
  assert.throws(() => decideGate(state, "structure", "approved", "Claude"), /human decision maker/);
});

test("direction remains locked until structure approval", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "figo-"));
  const state = createInitialState({ name: "Test", workspace: directory });
  for (const stage of ["brief", "strategy", "ux", "content"]) {
    completeStage(state, stage, artifact(directory, `${stage}.md`));
  }
  assert.throws(() => completeStage(state, "direction", artifact(directory, "direction.md")), /structure gate/);
  decideGate(state, "structure", "approved", "Denny");
  completeStage(state, "direction", artifact(directory, "direction.md"));
  assert.equal(state.stages.direction.status, "complete");
});

test("rejection requires a reason and does not unlock work", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "figo-"));
  const state = createInitialState({ name: "Test", workspace: directory });
  for (const stage of ["brief", "strategy", "ux", "content"]) {
    completeStage(state, stage, artifact(directory, `${stage}.md`));
  }
  assert.throws(() => decideGate(state, "structure", "rejected", "Denny"), /rejection reason/);
  decideGate(state, "structure", "rejected", "Denny", "Simplify the flow");
  assert.equal(state.gates.structure.status, "rejected");
  assert.equal(state.currentStage, "content");
});
