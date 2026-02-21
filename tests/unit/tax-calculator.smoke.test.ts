import { describe, expect, it } from 'vitest'
import {
  calculateTotalIncome,
  calculateStandardDeduction,
  calculateRegularTax,
} from '../../lib/engine/calculations/tax-calculator'
import type { TaxReturn } from '../../types/tax-types'

function createSmokeReturn(): TaxReturn {
  return {
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      ssn: '123-45-6789',
      address: '123 Main St',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      filingStatus: 'Married Filing Jointly',
      age: 40,
      isBlind: false,
      spouseInfo: {
        firstName: 'Jane',
        lastName: 'Doe',
        ssn: '987-65-4321',
        age: 39,
        isBlind: false,
      },
    },
    dependents: [],
    w2Income: [
      {
        employer: 'Employer A',
        ein: '11-1111111',
        wages: 100000,
        federalTaxWithheld: 10000,
        socialSecurityWages: 100000,
        socialSecurityTaxWithheld: 6200,
        medicareWages: 100000,
        medicareTaxWithheld: 1450,
      },
    ],
    interest: [{ payer: 'Bank', amount: 500 }],
    dividends: [{ payer: 'Broker', ordinaryDividends: 1000, qualifiedDividends: 500 }],
    capitalGains: [
      {
        description: 'AAPL',
        dateAcquired: '2024-01-01',
        dateSold: '2025-01-01',
        proceeds: 5000,
        costBasis: 3000,
        isLongTerm: true,
      },
    ],
    rentalProperties: [],
    aboveTheLineDeductions: {
      educatorExpenses: 0,
      studentLoanInterest: 0,
      hsaDeduction: 0,
      movingExpenses: 0,
      selfEmploymentTaxDeduction: 0,
      selfEmployedHealthInsurance: 0,
      sepIRA: 0,
      alimonyPaid: 0,
    },
    educationExpenses: [],
    estimatedTaxPayments: 0,
  }
}

describe('tax calculator smoke', () => {
  it('calculates total income from core buckets', () => {
    const taxReturn = createSmokeReturn()
    expect(calculateTotalIncome(taxReturn)).toBe(103500)
  })

  it('returns standard deduction baseline for MFJ', () => {
    const taxReturn = createSmokeReturn()
    expect(calculateStandardDeduction(taxReturn)).toBe(30000)
  })

  it('calculates positive regular tax for representative income', () => {
    expect(calculateRegularTax(100000, 'Married Filing Jointly')).toBeGreaterThan(0)
  })
})
