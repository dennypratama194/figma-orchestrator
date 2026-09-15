import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const validator = path.resolve("scripts/validate-tokens.mjs");

test("the default token system passes the even 2/4/8 contract", () => {
  const result = spawnSync(process.execPath, [validator, "templates/design-tokens.json"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
});

test("odd spatial values fail validation", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "figo-tokens-"));
  const target = path.join(directory, "tokens.json");
  const tokens = JSON.parse(fs.readFileSync("templates/design-tokens.json", "utf8"));
  tokens.spacing.accidental = 15;
  fs.writeFileSync(target, JSON.stringify(tokens));
  const result = spawnSync(process.execPath, [validator, target], { encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /must be an even integer/);
});
