// lib/pipeline.test.ts
import { describe, it, expect } from 'vitest'
import { validateSecret } from './pipeline'

describe('validateSecret', () => {
  it('returns true when secrets match', () => {
    expect(validateSecret('abc123', 'abc123')).toBe(true)
  })

  it('returns false when secrets do not match', () => {
    expect(validateSecret('abc123', 'wrong')).toBe(false)
  })

  it('returns false when provided secret is empty string', () => {
    expect(validateSecret('abc123', '')).toBe(false)
  })

  it('returns false when provided secret is null', () => {
    expect(validateSecret('abc123', null)).toBe(false)
  })
})
