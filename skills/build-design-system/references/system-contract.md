# Native Figma system contract

## Foundations

Create and document:

- semantic and primitive color variables, including foreground/background roles and interaction states;
- spacing variables based on the 2/4/8 scale;
- sizing, radius, border, elevation, opacity, and motion tokens actually used by the project;
- text styles or variables for every approved role, with even sizes and line heights by default;
- desktop and responsive grid/container rules;
- imagery, icon, illustration, and shader usage rules when relevant.

Use semantic aliases where themes or modes exist. Variables should explain intent such as `color/action/primary`, not only raw appearance such as `blue/500`.

## Spatial scale

Default values:

`0, 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 128`

This is a controlled 2/4/8-derived scale: 2 handles fine adjustment, 4 handles compact rhythm, and 8 is the primary layout unit. Extend only with even values that preserve the established rhythm and are justified by real content or component needs.

Do not use odd gaps, padding, margins, radii, control heights, icon boxes, or arbitrary frame geometry. One-pixel hairline strokes are permitted. Do not use odd numbers merely to make a rendered screenshot appear closer by eye; correct the parent layout or typography instead.

## Components

Create only applicable families, including their real states and properties:

- buttons, links, icon buttons, and CTA groups;
- inputs, selectors, checkboxes, radios, toggles, validation, and helper text;
- navigation, tabs, breadcrumbs, pagination, and mobile navigation;
- cards or list items only when the content relationship actually calls for them;
- badges, alerts, tooltips, modals, drawers, tables, empty states, or loaders required by the flow;
- project-specific marketing modules that repeat and benefit from controlled variation.

Each family records anatomy, variants, sizes, states, content behavior, icon behavior, responsive behavior, and accessibility intent. Use nested instances carefully and keep properties understandable to another designer.

## Acceptance

- No required screen depends on detached copies for a reusable UI family.
- No recurring visual decision exists only as an unexplained raw value.
- Components survive realistic short and long content.
- States cover the actual flow, not a generic design-system checklist.
- Foundations and components match the approved taste profile instead of drifting toward a generic UI kit.
