import { describe, it, expect } from 'vitest'
import { validateSchema, maxLength, oneOf } from '../src/schema/index.js'

describe('validateSchema', () => {
  describe('type coercion', () => {
    it('trims and coerces strings', () => {
      const schema = { name: { type: 'string', required: true } }
      const { data } = validateSchema(schema, { name: '  hello  ' })
      expect(data.name).toBe('hello')
    })

    it('treats empty string as null (required -> error)', () => {
      const schema = { name: { type: 'string', required: true } }
      const { errors } = validateSchema(schema, { name: '' })
      expect(errors.name).toBe('is required')
    })

    it('treats whitespace-only string as null', () => {
      const schema = { name: { type: 'string', required: true } }
      const { errors } = validateSchema(schema, { name: '   ' })
      expect(errors.name).toBe('is required')
    })

    it('rejects objects as strings', () => {
      const schema = { name: { type: 'string', required: true, validations: [maxLength(10)] } }
      const { errors } = validateSchema(schema, { name: {} })
      expect(errors.name).toBe('is invalid')
    })

    it('coerces numbers', () => {
      const schema = { count: { type: 'number', required: true } }
      const { data } = validateSchema(schema, { count: '42' })
      expect(data.count).toBe(42)
    })

    it('rejects NaN numbers', () => {
      const schema = { count: { type: 'number', required: true } }
      const { errors } = validateSchema(schema, { count: 'abc' })
      expect(errors.count).toBe('is invalid')
    })

    it('rejects empty string as invalid number', () => {
      const schema = { count: { type: 'number', required: true } }
      const { errors } = validateSchema(schema, { count: '' })
      expect(errors.count).toBe('is invalid')
    })

    it('rejects whitespace-only string as invalid number', () => {
      const schema = { count: { type: 'number', required: true } }
      const { errors } = validateSchema(schema, { count: '  ' })
      expect(errors.count).toBe('is invalid')
    })

    it('coerces a raw number without calling trim', () => {
      const schema = { count: { type: 'number', required: true } }
      const { data } = validateSchema(schema, { count: 7 })
      expect(data.count).toBe(7)
    })

    it('coerces booleans', () => {
      const schema = { active: { type: 'boolean', required: true } }
      const { data } = validateSchema(schema, { active: 1 })
      expect(data.active).toBe(true)
    })
  })

  describe('required fields', () => {
    it('errors when required field is missing', () => {
      const schema = { name: { type: 'string', required: true } }
      const { errors } = validateSchema(schema, {})
      expect(errors.name).toBe('is required')
    })

    it('errors when required field is null', () => {
      const schema = { name: { type: 'string', required: true } }
      const { errors } = validateSchema(schema, { name: null })
      expect(errors.name).toBe('is required')
    })

    it('skips optional missing fields without error', () => {
      const schema = { name: { type: 'string' } }
      const { data } = validateSchema(schema, {})
      expect(data).toEqual({})
    })

    it('skips optional empty string without error', () => {
      const schema = { name: { type: 'string' } }
      const { data } = validateSchema(schema, { name: '' })
      expect(data).toEqual({})
    })
  })

  describe('validations', () => {
    it('runs validation rules', () => {
      const schema = {
        name: { type: 'string', required: true, validations: [maxLength(3)] }
      }
      const { errors } = validateSchema(schema, { name: 'abcd' })
      expect(errors.name).toBe('must be 3 characters or less')
    })

    it('accepts value at exactly max length', () => {
      const schema = {
        name: { type: 'string', required: true, validations: [maxLength(3)] }
      }
      const { data } = validateSchema(schema, { name: 'abc' })
      expect(data.name).toBe('abc')
    })

    it('stops at first validation failure', () => {
      const fail1 = { validate: () => false, message: 'first' }
      const fail2 = { validate: () => false, message: 'second' }
      const schema = { name: { type: 'string', required: true, validations: [fail1, fail2] } }
      const { errors } = validateSchema(schema, { name: 'x' })
      expect(errors.name).toBe('first')
    })
  })

  describe('custom coerce', () => {
    it('applies custom coerce function', () => {
      const schema = {
        name: { type: 'string', required: true, coerce: v => v.toUpperCase() }
      }
      const { data } = validateSchema(schema, { name: 'hello' })
      expect(data.name).toBe('HELLO')
    })

    it('errors when custom coerce returns null', () => {
      const schema = {
        name: { type: 'string', required: true, coerce: () => null, validations: [maxLength(10)] }
      }
      const { errors } = validateSchema(schema, { name: 'hello' })
      expect(errors.name).toBe('is invalid')
    })

    it('errors when custom coerce returns undefined', () => {
      const schema = {
        name: { type: 'string', required: true, coerce: () => undefined }
      }
      const { errors } = validateSchema(schema, { name: 'hello' })
      expect(errors.name).toBe('is invalid')
    })
  })

  describe('return shape', () => {
    it('returns { data } when valid', () => {
      const schema = { name: { type: 'string', required: true } }
      const result = validateSchema(schema, { name: 'hi' })
      expect(result).toEqual({ data: { name: 'hi' } })
    })

    it('returns { errors } when invalid', () => {
      const schema = { name: { type: 'string', required: true } }
      const result = validateSchema(schema, {})
      expect(result).toEqual({ data: {}, errors: { name: 'is required' } })
    })

    it('ignores extra fields not in schema', () => {
      const schema = { name: { type: 'string', required: true } }
      const { data } = validateSchema(schema, { name: 'hi', extra: 'ignored' })
      expect(data).toEqual({ name: 'hi' })
    })
  })
})

describe('oneOf', () => {
  it('accepts valid value', () => {
    const rule = oneOf(['a', 'b'])
    expect(rule.validate('a')).toBe(true)
  })

  it('rejects invalid value', () => {
    const rule = oneOf(['a', 'b'])
    expect(rule.validate('c')).toBe(false)
    expect(rule.message).toBe('must be one of: a, b')
  })
})
