---
name: design-from-brief
description: Orchestrate a raw website or product brief into an approved, responsive, implementation-ready native Figma design. Use for end-to-end brief-to-Figma work; use focused skills for isolated stages.
---

# Design from brief

Own the workflow, not every specialist decision. Establish state, route each stage to the appropriate specialist, collect evidence, enforce gates, and keep the user oriented.

Read [workflow.md](references/workflow.md) before starting. Read [artifact-contracts.md](references/artifact-contracts.md) when producing or accepting an artifact. Use the `apply-design-taste` skill before visual direction and during every visual critique. Read [figma-safety.md](references/figma-safety.md) before the first Figma mutation.

Read `${CLAUDE_PLUGIN_ROOT}/docs/workflow-v2.md` before calling the state CLI. Completion requires a JSON evidence manifest with tracked deliverables, not merely a Markdown file.

## Start

1. Resolve the brief, project type, required screens, approval owner, target Figma file or permission to create one, brand assets, and hard constraints. Infer ordinary defaults; ask only about ambiguity that materially changes the result.
2. Confirm that Figma's remote MCP is connected and exposes native write-to-canvas capability. If it does not, stop before design production and provide the exact connection blocker. Strategy work may continue.
3. Initialize state if absent:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/orchestrator.mjs" init --name "<project name>" --figma-url "<figma URL>"
```

4. Never reinitialize or overwrite an existing workflow. Resume from `status`.
5. After direction approval, use `build-design-system` and complete the native Figma foundations and components before creating full concepts or screens.

## Coordination

- Use specialist agents for bounded work where an independent context improves quality. Give them the approved upstream artifacts, constraints, and exact output contract.
- The orchestrator remains accountable for contradictions, missing evidence, state transitions, and user communication.
- Do not allow a producing specialist to approve or audit its own work. Use `taste-curator` to establish project taste, `design-critic` after visual work, and `handoff-auditor` for final QA.
- Parallelize only independent research. UX structure, content, direction, and canvas production remain sequential because each depends on approved upstream decisions.
- Record every completed stage with the deterministic CLI and its artifact path.
- Treat agent output as a proposal until it satisfies the artifact contract.

## Completion

Completion means the design system, variables, components, variants, and all required frames exist as native editable Figma content; responsive behavior and important states are covered; QA blockers are resolved or explicitly accepted; final approval is recorded; and the handoff artifact links decisions to Figma locations. If a shader is used, completion also requires its source/version record, static fallback, and implementation notes.

Do not call a concept, screenshot, HTML prototype, or partial homepage a completed Figma project.

## Review and revision discipline

Inspect rendered screenshots and live node properties. Compare every required page, breakpoint and interaction state to the approved scope. Record the MCP inspection response, screenshots, token validation and reviewer findings in the evidence manifest.

Collect concept approval before full desktop production. Use at most two focused revision rounds per concept. If the same blocker remains, return the specific unresolved decision to the user instead of cycling agents indefinitely.

For reference calibration, collect user-approved and rejected visual examples with concrete annotations. Do not invent approval or cite an image the reviewer has not seen. Use the evaluation scenarios in `${CLAUDE_PLUGIN_ROOT}/docs/design-evaluation.md` before claiming reliable design quality.
