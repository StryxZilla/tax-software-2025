import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import type { TaxReturn } from '../../types/tax-types';
import { buildFilingPacketManifest, generateFederalFilingPacket } from '../../lib/engine/pdf/filing-packet';

function createBaseReturn(): TaxReturn {
  return {
    personalInfo: {
      firstName: 'Taylor',
      lastName: 'Example',
      ssn: '123-45-6789',
      address: '123 Main St',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      filingStatus: 'Single',
      age: 35,
      isBlind: false,
    },
    dependents: [],
    w2Income: [
      {
        employer: 'Acme Corp',
        ein: '12-3456789',
        wages: 90000,
        federalTaxWithheld: 14000,
        socialSecurityWages: 90000,
        socialSecurityTaxWithheld: 5580,
        medicareWages: 90000,
        medicareTaxWithheld: 1305,
      },
    ],
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
  };
}

describe('federal filing packet', () => {
  it('builds a manifest that only includes supported forms for entered data', () => {
    const tr = createBaseReturn();
    tr.interest = [{ payer: 'Bank', amount: 250 }];
    tr.selfEmployment = {
      businessName: 'Example Consulting',
      businessCode: '541611',
      grossReceipts: 12000,
      returns: 0,
      costOfGoodsSold: 0,
      expenses: {
        advertising: 300,
        carAndTruck: 0,
        commissions: 0,
        contractLabor: 0,
        depletion: 0,
        depreciation: 0,
        employeeBenefitPrograms: 0,
        insurance: 0,
        interest: 0,
        legal: 0,
        officeExpense: 500,
        pension: 0,
        rentLease: 0,
        repairs: 0,
        supplies: 100,
        taxes: 0,
        travel: 200,
        mealsAndEntertainment: 0,
        utilities: 0,
        wages: 0,
        other: 0,
      },
    };

    const manifest = buildFilingPacketManifest(tr);

    expect(manifest.includedForms).toContain('Form 1040');
    expect(manifest.includedForms).toContain('Schedule B');
    expect(manifest.includedForms).toContain('Schedule C');
    expect(manifest.includedForms).toContain('Schedule SE');
    expect(manifest.includedForms).not.toContain('Schedule D');
    expect(manifest.unsupportedOrManualForms.some((n) => n.includes('W-2'))).toBe(true);
  });

  it('generates a merged filing packet PDF with cover page and included forms', async () => {
    const tr = createBaseReturn();
    tr.interest = [{ payer: 'Bank', amount: 100 }];

    const bytes = await generateFederalFilingPacket(tr);
    const doc = await PDFDocument.load(bytes);

    // Cover + 1040 + S1 + S2 + S3 + Schedule B
    expect(doc.getPages().length).toBe(6);
  });
});
