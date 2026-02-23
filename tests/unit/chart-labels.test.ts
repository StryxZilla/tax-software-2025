import { describe, it, expect } from 'vitest'
import { safeChartLabel, formatPieSliceLabel, CHART_LABEL_FALLBACK } from '../../lib/utils/chart-labels'

describe('safeChartLabel', () => {
  it('returns valid label unchanged', () => {
    expect(safeChartLabel('W-2 Wages')).toBe('W-2 Wages')
  })

  it('returns fallback for empty string', () => {
    expect(safeChartLabel('')).toBe(CHART_LABEL_FALLBACK)
  })

  it('returns fallback for whitespace-only', () => {
    expect(safeChartLabel('   ')).toBe(CHART_LABEL_FALLBACK)
  })

  it('returns fallback for undefined', () => {
    expect(safeChartLabel(undefined)).toBe(CHART_LABEL_FALLBACK)
  })

  it('returns fallback for null', () => {
    expect(safeChartLabel(null)).toBe(CHART_LABEL_FALLBACK)
  })

  it('accepts custom fallback', () => {
    expect(safeChartLabel('', 'Unknown')).toBe('Unknown')
  })

  it('never returns blank — invariant', () => {
    const inputs = ['', ' ', '\t', '\n', undefined, null]
    for (const input of inputs) {
      const result = safeChartLabel(input)
      expect(result.trim().length).toBeGreaterThan(0)
    }
  })
})

describe('formatPieSliceLabel', () => {
  it('formats name and percent', () => {
    expect(formatPieSliceLabel({ name: 'Interest', percent: 0.25 })).toBe('Interest: 25%')
  })

  it('handles 100%', () => {
    expect(formatPieSliceLabel({ name: 'Wages', percent: 1 })).toBe('Wages: 100%')
  })

  it('falls back on empty name', () => {
    expect(formatPieSliceLabel({ name: '', percent: 0.5 })).toBe('Other: 50%')
  })

  it('falls back on undefined name', () => {
    expect(formatPieSliceLabel({ percent: 0.5 })).toBe('Other: 50%')
  })

  it('handles zero percent', () => {
    expect(formatPieSliceLabel({ name: 'Test', percent: 0 })).toBe('Test: 0%')
  })
})
