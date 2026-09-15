# Figma Orchestrator

A private Claude Code plugin that turns a raw website or product brief into an approved, responsive, implementation-ready native Figma design.

It coordinates strategy, UX architecture, content, project-specific taste, visual direction, a native Figma design system, Figma production, independent critique, responsive design, optional purposeful shaders, and handoff QA. The workflow is intentionally gated: Claude can work autonomously between gates, but it cannot approve its own creative direction or final design.

## Requirements

- Claude Code 2.1.198 or newer
- Node.js 20 or newer
- Figma's official Claude Code plugin, authenticated to the target Figma account
- Edit access to the target Figma file

Install and authenticate the official Figma connection:

```bash
claude plugin install figma@claude-plugins-official
```

Restart Claude Code, open `/plugin`, select Figma, and authenticate.

## Run locally

Clone this repository, then load it into any client project:

```bash
claude --plugin-dir /absolute/path/to/figma-orchestrator
```

Start a project with:

```text
/figma-orchestrator:design-from-brief
```

You can also pass the brief and target directly:

```text
/figma-orchestrator:design-from-brief Brief: ./brief.md. Target Figma file: https://www.figma.com/design/FILE_KEY/Project
```

## Workflow

1. Normalize and challenge the brief.
2. Define positioning, audience, goals, and evidence.
3. Build the sitemap, flows, page anatomy, and conversion hierarchy.
4. Draft content matched to the approved structure.
5. Build a project-specific taste profile, research and filter relevant current influences, then define visual direction and design-system foundations.
6. Create native Figma variables, styles, components, variants, and states using the even 2/4/8-based token system.
7. Create focused concepts in native Figma.
8. Critique and revise the selected concept.
9. Build full desktop screens from component instances.
10. Design responsive variants and states.
11. Audit accessibility, consistency, completeness, and handoff quality.

Spatial values use an even 2/4/8-derived scale. One-pixel hairline strokes are the only default odd-value exception. Decorative gradients and generic glow effects are prohibited. Figma shaders are supported only when the approved direction gives them a specific role, fallback, and implementation plan.

Four gates require explicit human approval: structure, direction, desktop, and final.

## Deterministic workflow state

The plugin stores state and artifacts in `.figma-orchestrator/` inside the client project. The state CLI prevents skipped stages and self-approval.

```bash
node /path/to/figma-orchestrator/scripts/orchestrator.mjs init --name "Client Website" --figma-url "https://www.figma.com/design/..."
node /path/to/figma-orchestrator/scripts/orchestrator.mjs status
node /path/to/figma-orchestrator/scripts/orchestrator.mjs complete --stage brief --artifact .figma-orchestrator/artifacts/brief.md
node /path/to/figma-orchestrator/scripts/orchestrator.mjs approve --gate structure --by Denny
node /path/to/figma-orchestrator/scripts/orchestrator.mjs validate
```

Set `FIGMA_ORCHESTRATOR_WORKSPACE` to use a different workflow directory.

## Repository structure

- `skills/`: the main orchestrator and focused reusable procedures
- `agents/`: isolated specialist roles used by the orchestrator
- `scripts/`: deterministic state management and plugin validation
- `schemas/`: machine-readable project and state contracts
- `templates/`: input and deliverable templates
- `examples/`: a safe example project without client data

## Security and client safety

- No Figma access token is stored in this repository.
- OAuth is handled by the official Figma plugin.
- Existing canvas content is read-only unless the user identifies an approved target area.
- Destructive or broad canvas operations require explicit confirmation.
- Client briefs and generated workflow artifacts are ignored by this repository's Git configuration when created locally.

## Development

```bash
npm run check
```
