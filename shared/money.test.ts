import { describe, expect, it } from 'vitest'
import { formatShekels } from './money'

describe('formatShekels', () => {
  it('leaves whole amounts plain, with thousands separators', () => {
    expect(formatShekels(4200)).toBe('4,200')
    expect(formatShekels(10962)).toBe('10,962')
  })

  it('gives fractional amounts two decimals, never one', () => {
    expect(formatShekels(8164.8)).toBe('8,164.80')
    expect(formatShekels(11546.64)).toBe('11,546.64')
  })

  it('does not print more than two decimals', () => {
    expect(formatShekels(100.005)).toMatch(/^100\.0[01]$/)
  })
})
