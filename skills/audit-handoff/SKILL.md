---
name: audit-handoff
description: Audit a completed responsive Figma design for consistency, accessibility, state coverage, content truth, and implementation readiness. Use before final approval or Figma-to-code handoff.
---

# Audit handoff

Remain read-only. Use `apply-design-taste` and inspect actual Figma pages, frames, components, variables, and annotations plus all approved workflow artifacts.

Produce `.figma-orchestrator/artifacts/qa.md` using `${CLAUDE_PLUGIN_ROOT}/templates/qa-report.md`. Check every required page and breakpoint, not a sample that could hide missing work.

A blocker includes missing required frames, broken hierarchy, inaccessible contrast or interaction, unresolved placeholder content presented as final, detached or inconsistent components, absent critical states, ambiguous responsive behavior, or a mismatch with an approved upstream decision.

Also flag production drift that erased the approved brand distinction or signature idea, and trend treatments added without evidence in the taste profile.

Do not pass the audit with unresolved blockers. Minor findings may pass with notes only when they do not create implementation ambiguity or user harm.
