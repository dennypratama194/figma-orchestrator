# Figma production safety

## Before writing

- Verify the authenticated account can access the exact file.
- Inspect existing pages, local variables, components, styles, naming conventions, and target area.
- Resolve whether work belongs in a new file, new pages, or explicitly named frames.
- State the planned mutation scope before the first write.

## Write boundaries

- Create new pages or clearly namespaced frames by default.
- Never modify library components, published styles, shared variables, approved frames, or unrelated content without explicit authorization.
- Avoid broad selections and giant write operations. Build foundations and representative frames first, inspect the result, then continue in bounded batches.
- Preserve native editability. Use Auto Layout, variables, components, variants, text styles, constraints, and semantic layer names where appropriate.
- Do not flatten editable UI into images. Use raster content only for actual imagery.
- Do not expose or store tokens, cookies, credentials, private file contents, or OAuth material.

## Failure handling

- On a partial write, inspect what was actually created before retrying.
- Retry an idempotent bounded operation at most twice. Then stop, report the exact failed scope, and preserve completed work.
- If native write tools are unavailable, do not claim success and do not silently substitute generated code, SVG, screenshots, or a Figma Make file.
- Archive abandoned work. Delete only when the user names the exact target and requests deletion.
