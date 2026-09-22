function variants(schema) {
  const branch = schema.allOf?.find(item => Array.isArray(item.oneOf) && item.oneOf.some(value => value.properties?.event_type?.const));
  return new Map((branch?.oneOf ?? []).map(value => [value.properties.event_type.const, value]));
}

function definition(schema, reference) {
  const prefix = '#/definitions/';
  if (typeof reference !== 'string' || !reference.startsWith(prefix)) return undefined;
  return schema.definitions?.[reference.slice(prefix.length)];
}

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}

function compareProperty(eventType, name, previous, current, errors) {
  if (!current) {
    errors.push(`${eventType}: removed payload field ${name}`);
    return;
  }
  if (previous.enum && current.enum) {
    const removed = previous.enum.filter(value => !current.enum.some(candidate => stable(candidate) === stable(value)));
    if (removed.length) errors.push(`${eventType}.${name}: narrowed enum by removing ${removed.join(', ')}`);
    const previousWithoutEnum = { ...previous }; delete previousWithoutEnum.enum;
    const currentWithoutEnum = { ...current }; delete currentWithoutEnum.enum;
    if (stable(previousWithoutEnum) !== stable(currentWithoutEnum)) errors.push(`${eventType}.${name}: changed schema`);
    return;
  }
  if (stable(previous) !== stable(current)) errors.push(`${eventType}.${name}: changed schema`);
}

export function eventCompatibilityErrors(previousSchema, currentSchema) {
  const errors = [];
  if (previousSchema.properties?.schema_version?.const !== currentSchema.properties?.schema_version?.const) {
    errors.push('changed schema_version');
  }
  if (stable(previousSchema.required ?? []) !== stable(currentSchema.required ?? [])) {
    errors.push('changed envelope required fields');
  }
  const previousVariants = variants(previousSchema);
  const currentVariants = variants(currentSchema);
  for (const eventType of previousVariants.keys()) {
    if (!currentVariants.has(eventType)) errors.push(`${eventType}: removed event`);
  }
  for (const eventType of currentVariants.keys()) {
    if (!previousVariants.has(eventType)) errors.push(`${eventType}: added event within existing schema version`);
  }
  for (const [eventType, previousVariant] of previousVariants) {
    const currentVariant = currentVariants.get(eventType);
    if (!currentVariant) continue;
    for (const key of ['producer', 'aggregate_type']) {
      if (stable(previousVariant.properties?.[key]) !== stable(currentVariant.properties?.[key])) {
        errors.push(`${eventType}: changed ${key}`);
      }
    }
    const previousPayload = definition(previousSchema, previousVariant.properties?.payload?.$ref);
    const currentPayload = definition(currentSchema, currentVariant.properties?.payload?.$ref);
    if (!previousPayload || !currentPayload) {
      errors.push(`${eventType}: payload schema cannot be resolved`);
      continue;
    }
    if (stable(previousPayload.required ?? []) !== stable(currentPayload.required ?? [])) {
      errors.push(`${eventType}: changed required payload fields`);
    }
    for (const [name, property] of Object.entries(previousPayload.properties ?? {})) {
      compareProperty(eventType, name, property, currentPayload.properties?.[name], errors);
    }
    for (const name of Object.keys(currentPayload.properties ?? {})) {
      if (!(name in (previousPayload.properties ?? {})) && (currentPayload.required ?? []).includes(name)) {
        errors.push(`${eventType}.${name}: added field is required`);
      }
    }
  }
  return errors;
}
