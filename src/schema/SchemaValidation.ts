import { Schema } from "./Schema"
import { SchemaSpec } from "./SchemaSpec"
import { ValidationResult } from "./ValidationResult"
import { ValidationRule } from "./ValidationRule"

export function oneOf(coll: any[]): ValidationRule {
  return {
    validate: (value: any) => coll.includes(value),
    message: `must be one of: ${coll.join(', ')}`
  }
}

export function maxLength(max: number): ValidationRule {
  return {
    validate: (v: any) => v.length <= max,
    message: `must be ${max} characters or less`
  }
}

export function validateSchema(
  schema: Schema,
  input: Record<string, any>
) {
  const result = { errors: {}, data: {} }
  for (const fieldSpec of Object.entries(schema))
    validateEntry(result, fieldSpec, input)
  return Object.keys(result.errors).length
    ? result
    : { data: result.data }
}

function validateEntry(
  validationResult: ValidationResult,
  fieldSpec: [string, SchemaSpec],
  input: Record<string, any>
) {
  const { errors, data } = validationResult
  const [field, spec] = fieldSpec
  const raw = input[field]

  if (raw == null) {
    if (spec.required)
      errors[field] = 'is required'
    return
  }

  const coerced = coercers[spec.type]?.(raw)

  if (coerced === undefined) {
    errors[field] = 'is invalid'
    return
  }

  if (coerced === null) {
    if (spec.required)
      errors[field] = 'is required'
    return
  }

  let value = coerced
  if (spec.coerce) {
    const result = spec.coerce(coerced)
    if (result == null) {
      errors[field] = 'is invalid'
      return
    }
    value = result
  }

  for (const validation of spec.validations || [])
    if (!validation.validate(value)) {
      errors[field] = validation.message
      break
    }

  if (!errors[field])
    data[field] = value
}

const coercers = {
  string(value: any) {
    if (typeof value !== 'object')
      return String(value).trim() || null
  },
  number(value: any) {
    if (isBlank(value)) return
    const n = Number(value)
    if (!Number.isNaN(n)) return n
  },
  boolean(value: any) {
    return Boolean(value)
  }
}

function isBlank(value: any) {
  return typeof value === 'string' && value.trim() === ''
}