import { describe, expect, it } from 'vitest'
import { formatPhone, fromE164, isValidPhone, toE164 } from './phone'

describe('phone helpers', () => {
  it('formats mobile and landline numbers', () => {
    expect(formatPhone('11999998888')).toBe('(11) 99999-8888')
    expect(formatPhone('1133334444')).toBe('(11) 3333-4444')
    expect(formatPhone('119')).toBe('(11) 9')
  })

  it('validates DDD + 8 or 9 digits', () => {
    expect(isValidPhone('(11) 99999-8888')).toBe(true)
    expect(isValidPhone('(11) 9999')).toBe(false)
  })

  it('converts to and from E.164', () => {
    expect(toE164('(11) 99999-8888')).toBe('+5511999998888')
    expect(fromE164('+5511999998888')).toBe('(11) 99999-8888')
  })
})
