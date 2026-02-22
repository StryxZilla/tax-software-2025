import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderToString } from 'react-dom/server'
import TaxSummarySidebar from '../../components/review/TaxSummarySidebar'

const mockUseTaxReturn = vi.fn()

vi.mock('../../lib/context/TaxReturnContext', () => ({
  useTaxReturn: () => mockUseTaxReturn(),
}))

describe('TaxSummarySidebar stability', () => {
  const originalError = console.error
  const hookWarning = /Rendered fewer hooks than expected|Rendered more hooks than during the previous render|Rules of Hooks/i

  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    })
  })

  afterEach(() => {
    console.error = originalError
    vi.unstubAllGlobals()
  })

  it('renders empty and populated states without hook-order warnings @critical-sidebar', () => {
    const errors: string[] = []
    console.error = ((...args: unknown[]) => {
      errors.push(args.map(String).join(' '))
      originalError(...args)
    }) as typeof console.error

    const baseReturn = {
      personalInfo: { filingStatus: 'Single' },
      w2Income: [],
      interest: [],
      dividends: [],
      capitalGains: [],
      selfEmployment: null,
    }

    mockUseTaxReturn.mockReturnValue({
      taxCalculation: null,
      taxReturn: baseReturn,
      isCalculating: false,
      lastSaved: null,
    })
    const emptyHtml = renderToString(<TaxSummarySidebar />)

    mockUseTaxReturn.mockReturnValue({
      taxCalculation: {
        taxableIncome: 50000,
        regularTax: 6000,
        refundOrAmountOwed: 200,
        totalIncome: 70000,
        agi: 68000,
        totalTax: 6200,
      },
      taxReturn: {
        ...baseReturn,
        w2Income: [{ wages: 70000 }],
      },
      isCalculating: false,
      lastSaved: new Date(),
    })
    const populatedHtml = renderToString(<TaxSummarySidebar />)

    expect(emptyHtml).toContain('Tax Summary')
    expect(populatedHtml).toContain('Live calculation')
    expect(errors.filter((entry) => hookWarning.test(entry))).toEqual([])
  })
})
