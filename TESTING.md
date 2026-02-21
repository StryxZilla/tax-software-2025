# Tax Software Testing Guide

This is the canonical functional test scenario. For Windows command examples, use [`TESTING-WINDOWS.md`](./TESTING-WINDOWS.md).

## Quick Start

1. Start the app (`npm run dev`)
2. Open http://localhost:3000
3. Enter data from `test-data.json`
4. Verify expected outputs below
5. Run QA pipeline (`npm run qa`, then `npm run qa:release-gate`)

## Test Scenario: Sample Family

**Profile:** Married couple (John & Jane Sample), 2 kids, dual W-2 income, investments, mortgage

### Personal Info
- Filing Status: Married Filing Jointly
- John Sample (SSN: 123-45-6789), DOB 06/15/1985
- Jane Sample (SSN: 987-65-4321), DOB 03/22/1987
- Address: 123 Test Street, Austin, TX 78701

### Income
- W-2 John wages: $95,000, federal withholding: $14,250
- W-2 Jane wages: $72,000, federal withholding: $10,800
- Interest income: $425
- Long-term gain: $3,200
- Short-term gain: $800

### Dependents
- Emma Sample, DOB 04/10/2017
- Noah Sample, DOB 09/18/2014

### Itemized Inputs
- Mortgage interest: $12,500
- State tax: $8,500
- Local tax: $1,500 (SALT cap applies)
- Charitable contributions: $3,500
- Medical expenses: $2,800

## Expected Results

- Total income: **$171,425**
- Itemized deduction total: **$26,000**
- Standard deduction (MFJ 2025): **$30,000**
- Taxable income: **$141,425**
- Tax before credits: **$20,942**
- Child Tax Credit: **$4,000**
- Tax after credits: **$16,942**
- Refund: **$8,108**

## Verification Checklist

- [ ] Income total matches $171,425
- [ ] Standard deduction is selected over itemized
- [ ] Taxable income matches $141,425
- [ ] Child Tax Credit applies correctly
- [ ] Refund matches $8,108
- [ ] PDF generation succeeds
- [ ] Generated PDF values match entered data

## QA Artifact Paths

After `npm run qa`, verify outputs exist in:
- `artifacts/qa/<timestamp>/summary.json`
- `artifacts/qa/<timestamp>/summary.md`
- per-check logs in same folder
