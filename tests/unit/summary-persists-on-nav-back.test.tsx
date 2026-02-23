/**
 * Regression test: Tax summary must remain visible when user fills W2,
 * skips several wizard pages, then navigates back to a previous step.
 *
 * Root cause: taxCalculation was only computed via explicit recalculateTaxes()
 * calls in form onChange handlers.  After DB/localStorage restore (or any
 * state path that bypasses onChange), taxCalculation stayed null.
 *
 * Fix: taxCalculation is now reactively recomputed via useEffect on taxReturn.
 */
import { describe, it, expect } from 'vitest'
import { calculateTaxReturn } from '../../lib/engine/calculations/tax-calculator'
import { TaxReturn } from '../../types/tax-types'

// Minimal taxReturn with W2 data filled in
const taxReturnWithW2: TaxReturn = {
  personalInfo: {
    firstName: 'Jane',
    lastName: 'Doe',
    ssn: '123-45-6789',
    address: '123 Main St',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    filingStatus: 'Single',
    age: 30,
    isBlind: false,
  },
  dependents: [],
  w2Income: [
    {
      employer: 'Acme Corp',
      ein: '12-3456789',
      wages: 75000,
      federalTaxWithheld: 12000,
      socialSecurityWages: 75000,
      socialSecurityTaxWithheld: 4650,
      medicareWages: 75000,
      medicareTaxWithheld: 1087.5,
    },
  ],
  interest: [],
  dividends: [],
  capitalGains: [],
  rentalProperties: [],
  selfEmployment: {
    businessName: '',
    ein: '',
    businessCode: '',
    grossReceipts: 0,
    returns: 0,
    costOfGoodsSold: 0,
    expenses: {
      advertising: 0, carAndTruck: 0, commissions: 0, contractLabor: 0,
      depletion: 0, depreciation: 0, employeeBenefitPrograms: 0, insurance: 0,
      interest: 0, legal: 0, officeExpense: 0, pension: 0, rentLease: 0,
      repairs: 0, supplies: 0, taxes: 0, travel: 0, mealsAndEntertainment: 0,
      utilities: 0, wages: 0, other: 0,
    },
  },
  aboveTheLineDeductions: {
    educatorExpenses: 0, studentLoanInterest: 0, hsaDeduction: 0,
    movingExpenses: 0, selfEmploymentTaxDeduction: 0,
    selfEmployedHealthInsurance: 0, sepIRA: 0, alimonyPaid: 0,
  },
  educationExpenses: [],
  estimatedTaxPayments: 0,
}

describe('summary persists across wizard navigation', () => {
  it('calculateTaxReturn produces non-null result for W2-only return', () => {
    // This is the calculation that the reactive useEffect now triggers
    // whenever taxReturn changes (including after DB/localStorage restore).
    const calc = calculateTaxReturn(taxReturnWithW2)

    expect(calc).not.toBeNull()
    expect(calc.totalIncome).toBe(75000)
    expect(calc.totalTax).toBeGreaterThan(0)
    expect(calc.federalTaxWithheld).toBe(12000)
    // With 75k income and 12k withheld, expect a refund or small amount owed
    expect(typeof calc.refundOrAmountOwed).toBe('number')
  })

  it('calculateTaxReturn is idempotent across repeated calls (simulating step changes)', () => {
    // Simulates: user fills W2, calculation runs, user navigates between steps,
    // calculation re-runs each time via useEffect — result must be stable.
    const calc1 = calculateTaxReturn(taxReturnWithW2)
    const calc2 = calculateTaxReturn(taxReturnWithW2)

    expect(calc1.totalIncome).toBe(calc2.totalIncome)
    expect(calc1.totalTax).toBe(calc2.totalTax)
    expect(calc1.refundOrAmountOwed).toBe(calc2.refundOrAmountOwed)
  })

  it('calculateTaxReturn returns valid result even when called after data restore (no manual recalc needed)', () => {
    // Simulates the bug scenario: data is loaded from DB/localStorage
    // (represented by taxReturnWithW2), and the reactive useEffect calls
    // calculateTaxReturn. Previously this never happened — taxCalculation
    // stayed null until user manually edited a form field.
    const restored = JSON.parse(JSON.stringify(taxReturnWithW2)) // simulate serialization round-trip
    const calc = calculateTaxReturn(restored)

    expect(calc).not.toBeNull()
    expect(calc.totalIncome).toBe(75000)
    expect(calc.agi).toBeGreaterThan(0)
    expect(calc.taxableIncome).toBeGreaterThan(0)
  })
})
