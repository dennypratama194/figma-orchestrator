# Workflow v2: evidence and revisions

The plugin runs in an interactive Claude Code session. It is not an unattended service or a Figma API adapter. The host's connected Figma tools perform canvas inspection and mutation. Local validation verifies recorded evidence and content hashes; it cannot authenticate remote Figma state or the identity of a human independently.

## Completion evidence

Each `complete --stage NAME --artifact evidence.json` call accepts a JSON manifest, not a Markdown report. Required for every stage:

- `stage`: exact stage name
- `summary`: nonempty outcome summary
- `files`: nonempty list of deliverables relative to the manifest

Each listed file must exist and be nonempty. All file contents and the manifest are hashed. Editing or removing one invalidates state validation and blocks further completion or approval until `revise --stage NAME` invalidates that stage and its dependents.

For `system`, `concept`, `desktop`, `responsive`, `qa`, and `handoff`, also provide:

- `figmaUrl`: target file URL
- `nodes`: inspected `{id, type}` entries
- `inspectedAt`, `inspectedBy`: inspection time and agent
- `inspectionFile`: a file in `files` containing the actual MCP response

For `system`, include VARIABLE and COMPONENT inventory entries plus `tokenFile` in `files`. Numeric tokens are validated automatically. Color variables and semantic bindings are inspected through Figma and recorded in the design-system report; the numeric token validator does not validate colors.

For `concept`, `desktop`, `responsive`, and `qa`, include `screens`: `{nodeId, width, screenshot}` entries, with screenshot paths in `files`. Inspect the screenshot visually; recording it alone does not prove quality.

For `concept`, `desktop`, and `qa`, include `producedBy` and `review`: `{reviewer, verdict, findings}`. The reviewer must differ from the producer. Verdict must be `pass` or `pass-with-notes`; no finding may have `severity: blocker` without `resolved: true`.

Before completion, the orchestrator must compare the inventory to the approved screen/breakpoint scope, check live node properties, variable bindings, component instances and states, and record missing coverage. Local hashes cannot detect subsequent changes to the remote canvas: reinspect Figma before each visual approval and final handoff.

## Approvals

Run `review --gate NAME` and show the user the actual artifacts/screens for its fingerprint. After the explicit decision, record:

```bash
node scripts/orchestrator.mjs approve --gate concept --by Denny --fingerprint REVIEW_HASH --statement 'Exact user approval' --source 'conversation message reference'
```

The source must identify the actual user message or review record. Never invent it. This provides traceability and revision binding, not authentication: an agent with filesystem access could forge local records. Host permissions and human supervision remain required. Do not advertise this CLI as a security boundary.

Rejection uses the same provenance plus `--reason`. It clears downstream work. Use `revise --stage NAME` before editing any completed deliverable. This clears that stage and every dependent approval. Previous events remain in history.

## Gates and design workflow

Structure → direction → minimum native foundations/components → visual concepts → **concept approval** → full desktop and system expansion → desktop approval → responsive → QA → final approval → handoff.

Build minimum useful foundations first. Expand components with real screen needs after concept approval. Never treat two text-only direction descriptions as visual concept approval.

## Recovery

All normal writes use a lock, atomic replacement and revision conflict check. Do not blindly retry a conflict: reload state and re-evaluate the action. After a crash, inspect `state.lock`; remove it only after establishing there is no active writer. Do not automatically clear locks based solely on elapsed time.

For legacy v1 state, stop all writers and run `migrate`. It saves a non-overwriting `state.v1.backup.json`, retains artifacts, and resets completions and approvals because v1 evidence was not verified. Revalidate those artifacts using manifests and collect fresh approvals. Migration is an explicit maintenance action, not an automatic silent upgrade.

Numeric tokens use bounded, nonnegative even integers; sizes and typography must be positive. A 1px stroke is the sole odd exception. Unknown groups, empty groups and fractional values are rejected. The numeric file has a flat group format; do not use DTCG aliases or nested groups in this validator.
