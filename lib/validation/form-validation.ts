// Form Validation Utilities
// Provides validation functions for all tax forms

import { PersonalInfo, W2Income, Dependent, Interest1099INT, EducationExpenses, TraditionalIRAContribution, RothIRAContribution, Form8606Data, ItemizedDeductions } from '../../types/tax-types';

export interface ValidationError {
  field: string;
  message: string;
}

// SSN validation
export function validateSSN(ssn: string): boolean {
  const ssnPattern = /^\d{3}-\d{2}-\d{4}$/;
  return ssnPattern.test(ssn);
}

// EIN validation
export function validateEIN(ein: string): boolean {
  const einPattern = /^\d{2}-\d{7}$/;
  return einPattern.test(ein);
}

// Zip code validation
export function validateZipCode(zip: string): boolean {
  const zipPattern = /^\d{5}(-\d{4})?$/;
  return zipPattern.test(zip);
}

// Personal Info Validation
export function validatePersonalInfo(info: PersonalInfo): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required fields
  if (!info.firstName?.trim()) {
    errors.push({ field: 'firstName', message: 'First name is required' });
  }
  if (!info.lastName?.trim()) {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  }
  if (!info.address?.trim()) {
    errors.push({ field: 'address', message: 'Address is required' });
  }
  if (!info.city?.trim()) {
    errors.push({ field: 'city', message: 'City is required' });
  }
  if (!info.state?.trim()) {
    errors.push({ field: 'state', message: 'State is required' });
  }

  // SSN format validation
  if (!info.ssn?.trim()) {
    errors.push({ field: 'ssn', message: 'Social Security Number is required' });
  } else if (!validateSSN(info.ssn)) {
    errors.push({ field: 'ssn', message: 'SSN must be in format XXX-XX-XXXX' });
  }

  // Zip code validation
  if (!info.zipCode?.trim()) {
    errors.push({ field: 'zipCode', message: 'ZIP code is required' });
  } else if (!validateZipCode(info.zipCode)) {
    errors.push({ field: 'zipCode', message: 'ZIP code must be in format XXXXX or XXXXX-XXXX' });
  }

  // Age validation
  if (info.age < 0 || info.age > 120) {
    errors.push({ field: 'age', message: 'Age must be between 0 and 120' });
  }
  if (info.age === 0) {
    errors.push({ field: 'age', message: 'Age is required' });
  }

  // Spouse validation for Married Filing Jointly
  if (info.filingStatus === 'Married Filing Jointly') {
    if (!info.spouseInfo?.firstName?.trim()) {
      errors.push({ field: 'spouseFirstName', message: 'Spouse first name is required when filing jointly' });
    }
    if (!info.spouseInfo?.lastName?.trim()) {
      errors.push({ field: 'spouseLastName', message: 'Spouse last name is required when filing jointly' });
    }
    if (!info.spouseInfo?.ssn?.trim()) {
      errors.push({ field: 'spouseSSN', message: 'Spouse SSN is required when filing jointly' });
    } else if (!validateSSN(info.spouseInfo.ssn)) {
      errors.push({ field: 'spouseSSN', message: 'Spouse SSN must be in format XXX-XX-XXXX' });
    } else if (info.spouseInfo.ssn === info.ssn) {
      errors.push({ field: 'spouseSSN', message: 'Spouse SSN must be different from your SSN' });
    }
    if (!info.spouseInfo?.age || info.spouseInfo.age === 0) {
      errors.push({ field: 'spouseAge', message: 'Spouse age is required when filing jointly' });
    } else if (info.spouseInfo.age < 0 || info.spouseInfo.age > 120) {
      errors.push({ field: 'spouseAge', message: 'Spouse age must be between 0 and 120' });
    }
  }

  return errors;
}

// W-2 Validation
export function validateW2(w2: W2Income, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const prefix = `W-2 #${index + 1}`;

  if (!w2.employer?.trim()) {
    errors.push({ field: `w2-${index}-employer`, message: `${prefix}: Employer name is required` });
  }
  if (!w2.ein?.trim()) {
    errors.push({ field: `w2-${index}-ein`, message: `${prefix}: Employer EIN is required` });
  } else if (!validateEIN(w2.ein)) {
    errors.push({ field: `w2-${index}-ein`, message: `${prefix}: EIN must be in format XX-XXXXXXX` });
  }
  if (w2.wages < 0) {
    errors.push({ field: `w2-${index}-wages`, message: `${prefix}: Wages cannot be negative` });
  }
  if (w2.wages === 0) {
    errors.push({ field: `w2-${index}-wages`, message: `${prefix}: Wages are required` });
  }
  if (w2.federalTaxWithheld < 0) {
    errors.push({ field: `w2-${index}-federalTax`, message: `${prefix}: Federal tax withheld cannot be negative` });
  }

  return errors;
}

// Dependent Validation
export function validateDependent(dependent: Dependent, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const prefix = `Dependent #${index + 1}`;

  if (!dependent.firstName?.trim()) {
    errors.push({ field: `dependent-${index}-firstName`, message: `${prefix}: First name is required` });
  }
  if (!dependent.lastName?.trim()) {
    errors.push({ field: `dependent-${index}-lastName`, message: `${prefix}: Last name is required` });
  }
  if (!dependent.ssn?.trim()) {
    errors.push({ field: `dependent-${index}-ssn`, message: `${prefix}: SSN is required` });
  } else if (!validateSSN(dependent.ssn)) {
    errors.push({ field: `dependent-${index}-ssn`, message: `${prefix}: SSN must be in format XXX-XX-XXXX` });
  }
  if (!dependent.relationshipToTaxpayer?.trim()) {
    errors.push({ field: `dependent-${index}-relationship`, message: `${prefix}: Relationship is required` });
  }
  if (!dependent.birthDate?.trim()) {
    errors.push({ field: `dependent-${index}-birthDate`, message: `${prefix}: Birth date is required` });
  } else {
    // Validate birth date is not in the future
    const birthDate = new Date(dependent.birthDate);
    const today = new Date();
    if (birthDate > today) {
      errors.push({ field: `dependent-${index}-birthDate`, message: `${prefix}: Birth date cannot be in the future` });
    }
  }
  if (dependent.monthsLivedWithTaxpayer < 0 || dependent.monthsLivedWithTaxpayer > 12) {
    errors.push({ field: `dependent-${index}-months`, message: `${prefix}: Months lived with you must be between 0 and 12` });
  }

  return errors;
}

// Interest Income Validation
export function validateInterest(interest: Interest1099INT, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const prefix = `1099-INT #${index + 1}`;

  if (!interest.payer?.trim()) {
    errors.push({ field: `interest-${index}-payer`, message: `${prefix}: Payer name is required` });
  }
  if (interest.amount < 0) {
    errors.push({ field: `interest-${index}-amount`, message: `${prefix}: Interest amount cannot be negative` });
  }
  if (interest.amount === 0) {
    errors.push({ field: `interest-${index}-amount`, message: `${prefix}: Interest amount is required` });
  }

  return errors;
}

// Education Expenses Validation
export function validateEducationExpense(expense: EducationExpenses, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const prefix = `Student #${index + 1}`;

  if (!expense.studentName?.trim()) {
    errors.push({ field: `education-${index}-name`, message: `${prefix}: Student name is required` });
  }
  if (!expense.ssn?.trim()) {
    errors.push({ field: `education-${index}-ssn`, message: `${prefix}: Student SSN is required` });
  } else if (!validateSSN(expense.ssn)) {
    errors.push({ field: `education-${index}-ssn`, message: `${prefix}: SSN must be in format XXX-XX-XXXX` });
  }
  if (!expense.institution?.trim()) {
    errors.push({ field: `education-${index}-institution`, message: `${prefix}: Institution name is required` });
  }
  if (expense.tuitionAndFees < 0) {
    errors.push({ field: `education-${index}-tuition`, message: `${prefix}: Tuition cannot be negative` });
  }
  if (expense.tuitionAndFees === 0) {
    errors.push({ field: `education-${index}-tuition`, message: `${prefix}: Tuition amount is required` });
  }

  return errors;
}

// Utility function to check if there are any errors
export function hasErrors(errors: ValidationError[]): boolean {
  return errors.length > 0;
}

// Utility function to get error messages as a single string
export function getErrorMessages(errors: ValidationError[]): string[] {
  return errors.map(e => e.message);
}

// Capital Gains Validation
export function validateCapitalGain(gain: any, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const prefix = `Transaction #${index + 1}`;

  if (!gain.description?.trim()) {
    errors.push({ field: `capital-${index}-description`, message: `${prefix}: Description is required` });
  }
  if (!gain.dateAcquired?.trim()) {
    errors.push({ field: `capital-${index}-dateAcquired`, message: `${prefix}: Acquisition date is required` });
  }
  if (!gain.dateSold?.trim()) {
    errors.push({ field: `capital-${index}-dateSold`, message: `${prefix}: Sale date is required` });
  } else if (gain.dateAcquired && gain.dateSold) {
    // Validate sale date is after acquisition date
    const acquired = new Date(gain.dateAcquired);
    const sold = new Date(gain.dateSold);
    if (sold < acquired) {
      errors.push({ field: `capital-${index}-dateSold`, message: `${prefix}: Sale date cannot be before acquisition date` });
    }
  }
  if (gain.proceeds < 0) {
    errors.push({ field: `capital-${index}-proceeds`, message: `${prefix}: Proceeds cannot be negative` });
  }
  if (gain.proceeds === 0) {
    errors.push({ field: `capital-${index}-proceeds`, message: `${prefix}: Proceeds amount is required` });
  }
  if (gain.costBasis < 0) {
    errors.push({ field: `capital-${index}-costBasis`, message: `${prefix}: Cost basis cannot be negative` });
  }

  return errors;
}

// Schedule C (Self-Employment) Validation
export function validateScheduleC(scheduleC: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!scheduleC.businessName?.trim()) {
    errors.push({ field: 'scheduleC-businessName', message: 'Business name is required' });
  }
  if (scheduleC.ein && !validateEIN(scheduleC.ein)) {
    errors.push({ field: 'scheduleC-ein', message: 'EIN must be in format XX-XXXXXXX' });
  }
  if (scheduleC.grossReceipts < 0) {
    errors.push({ field: 'scheduleC-grossReceipts', message: 'Gross receipts cannot be negative' });
  }
  if (scheduleC.returns < 0) {
    errors.push({ field: 'scheduleC-returns', message: 'Returns cannot be negative' });
  }
  if (scheduleC.costOfGoodsSold < 0) {
    errors.push({ field: 'scheduleC-cogs', message: 'Cost of goods sold cannot be negative' });
  }

  return errors;
}

// Rental Property Validation
export function validateRentalProperty(rental: any, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const prefix = `Property #${index + 1}`;

  if (!rental.address?.trim()) {
    errors.push({ field: `rental-${index}-address`, message: `${prefix}: Address is required` });
  }
  if (!rental.city?.trim()) {
    errors.push({ field: `rental-${index}-city`, message: `${prefix}: City is required` });
  }
  if (!rental.state?.trim()) {
    errors.push({ field: `rental-${index}-state`, message: `${prefix}: State is required` });
  }
  if (!rental.zipCode?.trim()) {
    errors.push({ field: `rental-${index}-zipCode`, message: `${prefix}: ZIP code is required` });
  } else if (!validateZipCode(rental.zipCode)) {
    errors.push({ field: `rental-${index}-zipCode`, message: `${prefix}: ZIP code must be in format XXXXX or XXXXX-XXXX` });
  }
  if (rental.daysRented < 0 || rental.daysRented > 365) {
    errors.push({ field: `rental-${index}-daysRented`, message: `${prefix}: Days rented must be between 0 and 365` });
  }
  if (rental.daysPersonalUse < 0 || rental.daysPersonalUse > 365) {
    errors.push({ field: `rental-${index}-daysPersonalUse`, message: `${prefix}: Days of personal use must be between 0 and 365` });
  }
  if (rental.daysRented + rental.daysPersonalUse > 365) {
    errors.push({ field: `rental-${index}-daysRented`, message: `${prefix}: Total days (rented + personal) cannot exceed 365` });
  }
  if (rental.rentalIncome < 0) {
    errors.push({ field: `rental-${index}-rentalIncome`, message: `${prefix}: Rental income cannot be negative` });
  }

  return errors;
}

// IRA / Retirement Validation (2025 limits)
const IRA_LIMIT_2025 = 7000;
const IRA_CATCHUP_LIMIT_2025 = 8000; // 50+ years old

export function validateRetirement(
  traditionalIRA: TraditionalIRAContribution | undefined,
  rothIRA: RothIRAContribution | undefined,
  form8606: Form8606Data | undefined
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (traditionalIRA) {
    if (traditionalIRA.amount < 0) {
      errors.push({ field: 'retirement-traditional-amount', message: 'Traditional IRA contribution cannot be negative' });
    }
    if (traditionalIRA.amount > IRA_CATCHUP_LIMIT_2025) {
      errors.push({
        field: 'retirement-traditional-amount',
        message: `Traditional IRA contribution cannot exceed $${IRA_CATCHUP_LIMIT_2025.toLocaleString()} (2025 limit)`,
      });
    }
  }

  if (rothIRA) {
    if (rothIRA.amount < 0) {
      errors.push({ field: 'retirement-roth-amount', message: 'Roth IRA contribution cannot be negative' });
    }
    if (rothIRA.amount > IRA_CATCHUP_LIMIT_2025) {
      errors.push({
        field: 'retirement-roth-amount',
        message: `Roth IRA contribution cannot exceed $${IRA_CATCHUP_LIMIT_2025.toLocaleString()} (2025 limit)`,
      });
    }
  }

  // Combined traditional + Roth cannot exceed the annual limit
  const totalIRA = (traditionalIRA?.amount || 0) + (rothIRA?.amount || 0);
  if (totalIRA > IRA_CATCHUP_LIMIT_2025) {
    errors.push({
      field: 'retirement-combined-limit',
      message: `Combined IRA contributions ($${totalIRA.toLocaleString()}) exceed the 2025 annual limit of $${IRA_CATCHUP_LIMIT_2025.toLocaleString()}`,
    });
  }

  if (form8606) {
    if (form8606.nondeductibleContributions < 0) {
      errors.push({ field: 'retirement-8606-nondeductible', message: 'Nondeductible contributions cannot be negative' });
    }
    if (form8606.priorYearBasis < 0) {
      errors.push({ field: 'retirement-8606-priorBasis', message: 'Prior year basis cannot be negative' });
    }
    if (form8606.conversionsToRoth < 0) {
      errors.push({ field: 'retirement-8606-conversions', message: 'Roth conversion amount cannot be negative' });
    }
    if (form8606.endOfYearTraditionalIRABalance < 0) {
      errors.push({ field: 'retirement-8606-balance', message: 'End-of-year IRA balance cannot be negative' });
    }
  }

  return errors;
}

// Itemized Deductions Validation
export function validateItemizedDeductions(deductions: ItemizedDeductions | undefined): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!deductions) return errors;

  const fields: Array<[keyof ItemizedDeductions, string]> = [
    ['medicalExpenses', 'Medical expenses'],
    ['stateTaxesPaid', 'State taxes paid'],
    ['localTaxesPaid', 'Local taxes paid'],
    ['realEstateTaxes', 'Real estate taxes'],
    ['personalPropertyTaxes', 'Personal property taxes'],
    ['homeMortgageInterest', 'Home mortgage interest'],
    ['investmentInterest', 'Investment interest'],
    ['charitableCash', 'Charitable cash contributions'],
    ['charitableNonCash', 'Charitable non-cash contributions'],
    ['casualtyLosses', 'Casualty and theft losses'],
    ['otherDeductions', 'Other deductions'],
  ];

  for (const [field, label] of fields) {
    const value = deductions[field];
    if (typeof value === 'number' && value < 0) {
      errors.push({
        field: `itemized-${field}`,
        message: `${label} cannot be negative`,
      });
    }
  }

  return errors;
}
