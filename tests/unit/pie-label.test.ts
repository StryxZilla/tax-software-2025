import { describe, it, expect } from 'vitest'
import { formatPieLabel } from '../../components/review/TaxSummarySidebar'

describe('formatPieLabel', () => {
  it('renders name and percentage from payload', () => {
    expect(formatPieLabel({ payload: { name: 'W-2 Wages' }, percent: 0.75 })).toBe('W-2 Wages: 75%')
  })

  it('falls back to "Other" when payload.name is missing', () => {
    expect(formatPieLabel({ payload: {}, percent: 0.5 })).toBe('Other: 50%')
  })

  it('falls back to "Other" when payload is undefined', () => {
    expect(formatPieLabel({ payload: undefined, percent: 0.5 })).toBe('Other: 50%')
  })

  it('falls back to "Other" when name is empty string', () => {
    expect(formatPieLabel({ payload: { name: '' }, percent: 1 })).toBe('Other: 100%')
  })

  it('handles single source at 100%', () => {
    expect(formatPieLabel({ payload: { name: 'Interest' }, percent: 1 })).toBe('Interest: 100%')
  })

  it('handles zero percent', () => {
    expect(formatPieLabel({ payload: { name: 'Dividends' }, percent: 0 })).toBe('Dividends: 0%')
  })

  it('handles undefined percent', () => {
    expect(formatPieLabel({ payload: { name: 'Gains' }, percent: undefined })).toBe('Gains: 0%')
  })

  it('rounds to nearest integer', () => {
    expect(formatPieLabel({ payload: { name: 'Test' }, percent: 0.3333 })).toBe('Test: 33%')
  })
})
