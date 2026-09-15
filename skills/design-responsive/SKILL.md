---
name: design-responsive
description: Define and produce responsive variants, component behavior, and interaction states for an approved desktop Figma design. Use after the desktop approval gate.
---

# Design responsive

Responsive work is redesign under constraint, not proportional shrinking.

Read the project taste profile. Preserve the hierarchy, signature idea, and brand character at smaller sizes instead of collapsing the work into a generic stacked layout.

For every screen define container behavior, grid changes, reflow order, wrapping, collapse or replacement patterns, minimum touch targets, content priority, image behavior, navigation behavior, and relevant states. Test realistic long and short content.

Create the approved breakpoint frames as native Figma content using the same variables and component system. Add intermediate frames only where behavior cannot be explained reliably through annotations.

Record decisions and node links in `.figma-orchestrator/artifacts/responsive.md`. Flag desktop assumptions that fail on small screens rather than hiding content without rationale.
