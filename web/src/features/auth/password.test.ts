import { describe, expect, it } from 'vitest'
import { isStrongPassword, passwordRules } from './password'

const failedRules = (value: string) =>
  passwordRules.filter((rule) => !rule.test(value)).map((rule) => rule.id)

describe('password rules', () => {
  it('accepts a password that meets every rule', () => {
    expect(isStrongPassword('Senha@123')).toBe(true)
  })

  it.each([
    ['Se@1', ['length']],
    ['SENHA@123', ['lowercase']],
    ['senha@123', ['uppercase']],
    ['Senha@abc', ['number']],
    ['Senha1234', ['special']],
  ])('rejects %s', (value, expected) => {
    expect(isStrongPassword(value)).toBe(false)
    expect(failedRules(value)).toEqual(expected)
  })
})
