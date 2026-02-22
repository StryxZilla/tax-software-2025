import { describe, expect, it } from 'vitest'
import {
  validatePersonalInfo,
  validateDependent,
  validateTaxReturn,
  validateW2,
} from '../../lib/validation/form-validation'
import type { Dependent, PersonalInfo, TaxReturn, W2Income } from '../../types/tax-types'

function createBasePersonalInfo(): PersonalInfo {
  return {
    firstName: 'Jane',
    lastName: 'Doe',
    ssn: '123-45-6789',
    address: '123 Main St',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    filingStatus: 'Single',
    age: 35,
    isBlind: false,
  }
}

function createBaseW2(): W2Income {
  return {
    employer: 'Acme Inc',
    ein: '12-3456789',
    wages: 50000,
    federalTaxWithheld: 5000,
    socialSecurityWages: 50000,
    socialSecurityTaxWithheld: 3100,
    medicareWages: 50000,
    medicareTaxWithheld: 725,
  }
}

function createBaseTaxReturn(): TaxReturn {
  return {
    personalInfo: createBasePersonalInfo(),
    dependents: [],
    w2Income: [createBaseW2()],
    interest: [],
    dividends: [],
    capitalGains: [],
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

describe('form validation hardening', () => {
  it('rejects invalid US state abbreviations in personal info', () => {
    const errors = validatePersonalInfo({ ...createBasePersonalInfo(), state: 'XX' })
    expect(errors.some((e) => e.field === 'state')).toBe(true)
  })

  it('rejects impossible SSNs that match pattern but are IRS-invalid', () => {
    const errors = validatePersonalInfo({ ...createBasePersonalInfo(), ssn: '000-12-3456' })
    expect(errors.some((e) => e.field === 'ssn')).toBe(true)
  })

  it('rejects invalid dependent birth date values', () => {
    const dependent: Dependent = {
      firstName: 'Kid',
      lastName: 'Doe',
      ssn: '234-56-7890',
      relationshipToTaxpayer: 'Daughter',
      birthDate: 'not-a-date',
      isQualifyingChildForCTC: false,
      monthsLivedWithTaxpayer: 12,
    }

    const errors = validateDependent(dependent, 0)
    expect(errors.some((e) => e.field === 'dependent-0-birthDate')).toBe(true)
  })

  it('rejects impossible calendar dates for dependent birth date', () => {
    const dependent: Dependent = {
      firstName: 'Kid',
      lastName: 'Doe',
      ssn: '234-56-7890',
      relationshipToTaxpayer: 'Daughter',
      birthDate: '2025-02-30',
      isQualifyingChildForCTC: false,
      monthsLivedWithTaxpayer: 12,
    }

    const errors = validateDependent(dependent, 0)
    expect(errors.some((e) => e.field === 'dependent-0-birthDate')).toBe(true)
  })

  it('rejects W-2 withholding greater than wages', () => {
    const w2 = { ...createBaseW2(), federalTaxWithheld: 51000 }
    const errors = validateW2(w2, 0)
    expect(errors.some((e) => e.field === 'w2-0-federalTax')).toBe(true)
  })

  it('rejects duplicate SSNs across taxpayer and dependents', () => {
    const taxReturn = createBaseTaxReturn()
    taxReturn.dependents = [
      {
        firstName: 'Kid',
        lastName: 'Doe',
        ssn: '123-45-6789',
        relationshipToTaxpayer: 'Son',
        birthDate: '2018-05-01',
        isQualifyingChildForCTC: true,
        monthsLivedWithTaxpayer: 12,
      },
    ]

    const errors = validateTaxReturn(taxReturn)
    expect(errors.some((e) => e.field === 'dependent-0-ssn')).toBe(true)
  })
})
