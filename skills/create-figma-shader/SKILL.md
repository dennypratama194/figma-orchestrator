---
name: create-figma-shader
description: Create or update a purposeful Figma shader fill or effect through the remote Figma MCP, with taste, ownership, fallback, build, and handoff controls. Use only when an approved visual direction explicitly calls for a shader.
---

# Create Figma shader

Read [shader-policy.md](references/shader-policy.md). A shader is an optional expressive component, not a required sign of modern design and not permission to add gradient slop.

## Required Figma workflow

1. Use the Figma MCP `get_figma_skill` capability to load the official `figma-shaders` skill in full. This is mandatory before any shader write.
2. Confirm the approved direction identifies the shader's communication or brand role, placement, interaction, motion, fallback, and performance boundary.
3. Call `whoami`. If multiple eligible plan keys exist, ask the user which plan owns the resource.
4. For a new resource, call `create_shader` with the approved name, description, plan key, and immutable `kind` of `fill` or `effect`.
5. Read the returned scaffold and its complete `main.ts` before replacing source.
6. Call `update_shader` with complete `main.ts`, a focused commit message, and the same `kind`. Never send a diff, token, key, signed URL, or unsupported file.
7. Inspect the build result in Figma. On compiler failure, make the smallest indicated correction and retry once. Stop and report the compiler output after a second failure.
8. Record resource ID, owner, kind, version when present, controls, defaults, Figma layers using it, static fallback, and implementation guidance in `design-system.md` and the handoff artifact.

When design context exports a shader runtime, implementation must use that runtime and shader source. Do not rasterize it or approximate it with CSS gradients or blur.
