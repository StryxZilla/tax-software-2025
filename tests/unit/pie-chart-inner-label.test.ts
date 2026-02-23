import { describe, it, expect } from 'vitest'
import { renderInnerPieLabel, formatPieLabel } from '../../components/review/TaxSummarySidebar'

describe('renderInnerPieLabel', () => {
  it('returns null for tiny slices (< 5%)', () => {
    expect(renderInnerPieLabel({
      cx: 100, cy: 100, midAngle: 90,
      innerRadius: 0, outerRadius: 70, percent: 0.03,
    })).toBeNull()
  })

  it('returns null when percent is undefined', () => {
    expect(renderInnerPieLabel({
      cx: 100, cy: 100, midAngle: 90,
      innerRadius: 0, outerRadius: 70,
    })).toBeNull()
  })

  it('returns null when cx is undefined', () => {
    expect(renderInnerPieLabel({
      cy: 100, midAngle: 90,
      innerRadius: 0, outerRadius: 70, percent: 0.5,
    })).toBeNull()
  })

  it('returns a React element for normal slices', () => {
    const result = renderInnerPieLabel({
      cx: 100, cy: 100, midAngle: 90,
      innerRadius: 0, outerRadius: 70, percent: 0.5,
    })
    expect(result).not.toBeNull()
    expect(result?.props.children).toBe('50%')
  })

  it('renders 100% for full pie', () => {
    const result = renderInnerPieLabel({
      cx: 100, cy: 100, midAngle: 0,
      innerRadius: 0, outerRadius: 70, percent: 1.0,
    })
    expect(result?.props.children).toBe('100%')
  })

  it('rounds percentage to integer', () => {
    const result = renderInnerPieLabel({
      cx: 100, cy: 100, midAngle: 45,
      innerRadius: 0, outerRadius: 70, percent: 0.3333,
    })
    expect(result?.props.children).toBe('33%')
  })
})

describe('formatPieLabel (legacy, still exported)', () => {
  it('still works for backwards compat', () => {
    expect(formatPieLabel({ payload: { name: 'W-2 Wages' }, percent: 0.75 })).toBe('W-2 Wages: 75%')
  })
})
