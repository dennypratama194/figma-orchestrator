---
name: build-in-figma
description: Create or revise approved website and product designs as native editable Figma content through the remote Figma MCP. Use only after the relevant structure or direction gate is approved.
---

# Build in Figma

Before writing, read `../design-from-brief/references/figma-safety.md`, use `apply-design-taste` and `build-design-system`, and inspect the approved brief, taste profile, visual direction, tokens, variables, and component inventory.

Use the connected remote Figma MCP's native canvas tools. Do not generate production code unless code-to-canvas is explicitly chosen for an existing live interface. Do not substitute images or SVG exports for native layout.

Build in bounded passes:

1. Inspect existing file conventions and reusable foundations.
2. Create or reuse the approved variables and styles without changing shared assets outside scope.
3. Create and validate base components and variants before screen production.
4. Build representative concept frames.
5. Inspect returned nodes and compare them with the direction artifact.
6. After approval, build full desktop screens in consistent named sections.
7. Record exact page, frame, and node references in the stage artifact.

Use semantic layer names, Auto Layout, real text, deliberate constraints, component instances, and variables. Avoid absolute positioning where Auto Layout expresses the intended relationship. Preserve content at realistic lengths.

Use only approved even values from the 2/4/8-derived spatial and component-geometry scale. Do not detach instances to solve local layout problems. Extend the system deliberately when a real screen exposes a missing token or variant.

Use `create-figma-shader` only when the approved direction explicitly admits a shader. Decorative gradients, blue-purple glow, blurry mesh backgrounds, and shader effects added merely to make the work feel modern are prohibited.

Protect the approved signature idea through production. Do not normalize unusual but intentional composition into generic reusable sections. Conversely, do not add trendy treatments that are absent from the approved taste profile.

Stop if the target is ambiguous, write capability is unavailable, authorization fails, or a mutation would affect existing approved/shared content.
