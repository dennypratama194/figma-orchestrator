# Shader admission and quality policy

## Admit only with evidence

The approved direction must answer:

- What content, product behavior, or brand quality does the shader express?
- Why are native layout, photography, illustration, typography, or a static texture insufficient?
- Where is attention supposed to move, and what must remain readable?
- What happens when motion, WebGPU, or the shader runtime is unavailable?
- Is its visual value worth implementation and runtime cost?

Reject a shader whose purpose is merely “make it modern,” “add wow,” fill empty space, or rescue a weak composition.

## No gradient slop

- Do not create generic aurora, mesh-gradient, blue-purple glow, blurry orb, liquid chrome, or animated-noise backgrounds by default.
- Color interpolation may exist inside a shader only as part of a stronger authored behavior tied to the concept.
- Keep the palette controlled by semantic design tokens and preserve text contrast in every state.
- Use one dominant shader idea sparingly. Do not layer several shader effects or repeat the same effect behind every section.

## Controls and behavior

Expose only values a designer is likely to tune per layer. Keep ranges bounded and defaults presentation-ready. Name controls by visible intent rather than implementation math. Test extremes for clipping, flashing, unreadable contrast, and visual noise.

Effects intentionally sample an input raster. Fills must not assume one exists. Follow the official Figma shader skill for module shape, WebGPU lifecycle, parameter schema, and alpha behavior.

## Fallback and handoff

Create a static, on-brand fallback that preserves composition and contrast without pretending to reproduce the effect. Record whether motion is essential or decorative. The implementation handoff must require the Figma-exported shader runtime for supported React work and a deliberate translation for other frameworks.
