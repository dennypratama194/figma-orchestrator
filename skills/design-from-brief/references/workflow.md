# Workflow and gates

Use `.figma-orchestrator/artifacts/` in the active client project. Do not store client artifacts in the plugin repository.

| Stage | Primary specialist | Required evidence | Gate after stage |
|---|---|---|---|
| brief | `brief-strategist` | `brief.md` | none |
| strategy | `brief-strategist` | `strategy.md` | none |
| ux | `ux-architect` | `ux.md` | none |
| content | `content-designer` | `content.md` | structure |
| direction | `taste-curator`, then `visual-director` | `taste.md` and `direction.md` | direction |
| system | `design-system-architect`, then `figma-builder` | `design-system.md`, `tokens.json`, and Figma node links | none |
| concept | `figma-builder`, then `taste-curator` and `design-critic` | `concept.md` with Figma node links and critique | none |
| desktop | `figma-builder`, then `design-critic` | `desktop.md` with frame inventory | desktop |
| responsive | `responsive-reviewer`, then `figma-builder` | `responsive.md` | none |
| qa | `handoff-auditor` | `qa.md` | final |
| handoff | orchestrator | `handoff.md` | none |

## Gate rules

- `structure`: the user approves positioning, sitemap, flows, section anatomy, and content direction.
- `direction`: the user approves one visual direction and the concept plan.
- `desktop`: the user approves full desktop screens before responsive expansion.
- `final`: the user approves the audited responsive design for implementation handoff.

Only record approval after an explicit user statement. A request to revise is rejection with the user's reason. Discussion, silence, or positive sentiment without a clear decision is not approval.

Record decisions with:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/orchestrator.mjs" approve --gate <gate> --by "<human>"
node "${CLAUDE_PLUGIN_ROOT}/scripts/orchestrator.mjs" reject --gate <gate> --by "<human>" --reason "<reason>"
```

After rejection, revise the upstream artifact, preserve a concise decision log, rerun the relevant independent review, and request the gate again.

## Figma page convention

Use existing project conventions when present. Otherwise create:

1. `00 Cover`
2. `01 Foundations`
3. `02 Components`
4. `03 Concepts`
5. `04 Desktop`
6. `05 Responsive`
7. `06 Archive`

Archive superseded concepts instead of deleting them unless the user explicitly requests deletion.

The `system` stage must be complete before concept production. Foundations and components may evolve after real screen use exposes a missing variant, but screen-level values may not silently bypass tokens or detach from reusable components.
