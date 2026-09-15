---
name: build-design-system
description: Define and create a project-specific Figma design system with variables, styles, components, variants, states, and a strict even-numbered 2/4/8 spatial scale. Use after visual-direction approval and before full screen production.
---

# Build design system

Read [system-contract.md](references/system-contract.md). Use the approved brief, taste profile, visual direction, content, and UX artifact. Produce `.figma-orchestrator/artifacts/tokens.json` from `${CLAUDE_PLUGIN_ROOT}/templates/design-tokens.json`, validate it, then build the system as native Figma content on `01 Foundations` and `02 Components`.

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/validate-tokens.mjs" .figma-orchestrator/artifacts/tokens.json
```

Produce `.figma-orchestrator/artifacts/design-system.md` with links or node identifiers for every foundation and component family. A text specification without native Figma variables and components does not complete the stage.

## Hard constraints

- Start the spatial system with 2, 4, and 8. Use the approved scale for gaps, padding, margins, insets, radii, control heights, icon boxes, and layout dimensions.
- Do not introduce odd spatial or component-geometry values. A 1px hairline stroke is allowed because it is stroke thickness, not spatial rhythm.
- Use even font sizes and line heights by default. The numeric validator does not accept font-metric exceptions; request an explicit rule change if a project requires one.
- Use variables or styles for recurring decisions. Do not scatter raw values through screens.
- Create components for repeated UI and every interaction family requiring states. Prefer variants and properties over duplicated detached frames.
- Keep the system project-specific. Do not manufacture components the approved screens do not need.

Full concept and screen production remains blocked until the token validation passes and the Figma system can be inspected.

Use the system-stage JSON evidence manifest from `${CLAUDE_PLUGIN_ROOT}/docs/workflow-v2.md`. Start with representative components; expand them as the approved concept develops.
