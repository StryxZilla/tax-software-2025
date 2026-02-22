import { describe, expect, it } from 'vitest'
import {
  validatePersonalInfo,
  validateDependent,
  validateTaxReturn,
  validateW2,
  validateCapitalGain,
  validateInterest,
  validateEducationExpense,
  validateScheduleC,
  validateRentalProperty,
} from '../../lib/validation/form-validation'
import type { Dependent, EducationExpenses, PersonalInfo, TaxReturn, W2Income } from '../../types/tax-types'

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

  it('accepts valid SSN values with surrounding whitespace', () => {
    const errors = validatePersonalInfo({ ...createBasePersonalInfo(), ssn: ' 123-45-6789 ' })
    expect(errors.some((e) => e.field === 'ssn')).toBe(false)
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

  it('rejects non-finite 1099-INT amounts (NaN/Infinity)', () => {
    const nanErrors = validateInterest({ payer: 'Bank', amount: Number.NaN }, 0)
    const infinityErrors = validateInterest({ payer: 'Bank', amount: Number.POSITIVE_INFINITY }, 0)

    expect(nanErrors.some((e) => e.field === 'interest-0-amount')).toBe(true)
    expect(infinityErrors.some((e) => e.field === 'interest-0-amount')).toBe(true)
  })

  it('rejects non-finite education tuition amounts (NaN/Infinity)', () => {
    const baseExpense: EducationExpenses = {
      studentName: 'Student Doe',
      ssn: '234-56-7890',
      institution: 'State University',
      tuitionAndFees: 1000,
      isFirstFourYears: true,
    }

    const nanErrors = validateEducationExpense({ ...baseExpense, tuitionAndFees: Number.NaN }, 0)
    const infinityErrors = validateEducationExpense({ ...baseExpense, tuitionAndFees: Number.POSITIVE_INFINITY }, 0)

    expect(nanErrors.some((e) => e.field === 'education-0-tuition')).toBe(true)
    expect(infinityErrors.some((e) => e.field === 'education-0-tuition')).toBe(true)
    expect(nanErrors.some((e) => e.message.includes('cannot be negative'))).toBe(false)
  })

  it('rejects non-finite W-2 numeric values (NaN/Infinity)', () => {
    const w2 = {
      ...createBaseW2(),
      wages: Number.NaN,
      federalTaxWithheld: Number.POSITIVE_INFINITY,
    }

    const errors = validateW2(w2, 0)

    expect(errors.some((e) => e.field === 'w2-0-wages')).toBe(true)
    expect(errors.some((e) => e.field === 'w2-0-federalTax')).toBe(true)
  })

  it('rejects non-finite Schedule C numeric values', () => {
    const errors = validateScheduleC({
      businessName: 'Side Gig LLC',
      ein: '12-3456789',
      grossReceipts: Number.NaN,
      returns: Number.POSITIVE_INFINITY,
      costOfGoodsSold: Number.NaN,
    })

    expect(errors.some((e) => e.field === 'scheduleC-grossReceipts')).toBe(true)
    expect(errors.some((e) => e.field === 'scheduleC-returns')).toBe(true)
    expect(errors.some((e) => e.field === 'scheduleC-cogs')).toBe(true)
  })

  it('rejects non-finite rental property day and income fields', () => {
    const errors = validateRentalProperty(
      {
        address: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        daysRented: Number.NaN,
        daysPersonalUse: Number.POSITIVE_INFINITY,
        rentalIncome: Number.NaN,
        expenses: {},
      },
      0,
    )

    expect(errors.some((e) => e.field === 'rental-0-daysRented')).toBe(true)
    expect(errors.some((e) => e.field === 'rental-0-daysPersonalUse')).toBe(true)
    expect(errors.some((e) => e.field === 'rental-0-rentalIncome')).toBe(true)
  })

  it('does not report withholding exceeds wages when wages is invalid', () => {
    const w2 = {
      ...createBaseW2(),
      wages: Number.NaN,
      federalTaxWithheld: 999,
    }

    const errors = validateW2(w2, 0)

    expect(errors.some((e) => e.message.includes('cannot exceed wages'))).toBe(false)
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

  it('rejects impossible capital gains dates', () => {
    const errors = validateCapitalGain(
      {
        description: 'Stock sale',
        dateAcquired: '2025-02-30',
        dateSold: '2025-03-15',
        proceeds: 1000,
        costBasis: 500,
      },
      0,
    )

    expect(errors.some((e) => e.field === 'capital-0-dateAcquired')).toBe(true)
  })

  it('rejects capital gains sale dates in the future', () => {
    const nextYear = new Date().getUTCFullYear() + 1
    const errors = validateCapitalGain(
      {
        description: 'Stock sale',
        dateAcquired: '2024-01-01',
        dateSold: `${nextYear}-01-01`,
        proceeds: 1000,
        costBasis: 500,
      },
      0,
    )

    expect(errors.some((e) => e.field === 'capital-0-dateSold')).toBe(true)
  })
})
