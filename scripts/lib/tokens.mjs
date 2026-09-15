export function validateTokens(tokens) {
  const errors = [];
  if (!tokens || typeof tokens !== 'object' || Array.isArray(tokens)) return ['Tokens must be an object'];
  const limits = {spacing:512, radii:10000, sizes:8192, typography:512, strokes:16};
  for (const key of Object.keys(tokens)) if (!Object.hasOwn(limits,key)) errors.push(`Unknown group: ${key}`);
  for (const [group,max] of Object.entries(limits)) {
    const values=tokens[group];
    if (!values || typeof values!=='object' || Array.isArray(values) || !Object.keys(values).length) { errors.push(`Missing or empty group: ${group}`); continue; }
    for (const [name,value] of Object.entries(values)) {
      const minimum=['sizes','typography','strokes'].includes(group)?1:0;
      if (!Number.isInteger(value) || value<minimum || value>max || (value%2!==0 && !(group==='strokes' && value===1))) errors.push(`${group}.${name} must be an even integer within ${minimum}..${max} (1px strokes allowed)`);
    }
  }
  for (const v of [2,4,8]) if (!Object.values(tokens.spacing||{}).includes(v)) errors.push(`Spacing must include ${v}`);
  return errors;
}
