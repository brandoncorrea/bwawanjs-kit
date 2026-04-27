const coercers = {
  string(value) {
    if (typeof value !== 'object')
      return String(value).trim() || null
  },
  number(value) {
    if (isBlank(value)) return
    const n = Number(value)
    if (!Number.isNaN(n)) return n
  },
  boolean(value) {
    return Boolean(value)
  }
}

function isBlank(value) {
  return typeof value === 'string' && value.trim() === ''
}

export function oneOf(coll) {
  return {
    validate: v => coll.includes(v),
    message: `must be one of: ${coll.join(', ')}`
  }
}

export function maxLength(max) {
  return {
    validate: v => v.length <= max,
    message: `must be ${max} characters or less`
  }
}

export function validate(schema, input) {
  const errors = {}
  const data = {}

  for (const [field, def] of Object.entries(schema)) {
    const raw = input[field]
    const coerce = coercers[def.type]

    if (raw === undefined || raw === null) {
      if (def.required) errors[field] = 'is required'
      continue
    }

    const coerced = coerce?.(raw)

    if (coerced === undefined) {
      errors[field] = 'is invalid'
      continue
    }

    if (coerced === null) {
      if (def.required) errors[field] = 'is required'
      continue
    }

    let value = coerced
    if (def.coerce) {
      const result = def.coerce(coerced)
      if (result === null || result === undefined) {
        errors[field] = 'is invalid'
        continue
      }
      value = result
    }

    for (const validation of def.validations || []) {
      if (!validation.validate(value)) {
        errors[field] = validation.message
        break
      }
    }

    if (!errors[field]) data[field] = value
  }

  return Object.keys(errors).length ? { errors } : { data }
}
