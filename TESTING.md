# Tax Software Testing Guide

## Quick Test

### 1. Start the Dev Server
```bash
cd C:\Users\Stryx\tax-software
npm run dev
```

Open http://localhost:3000

### 2. Test Data Location
See `test-data.json` for a complete test scenario with expected results.

## Test Scenario: Sample Family

**Profile:** Married couple (John & Jane Sample), 2 kids, dual W-2 income, some investments, mortgage

### Input Data

#### Personal Info
- **Filing Status:** Married Filing Jointly
- **Names:** John Sample (SSN: 123-45-6789), Jane Sample (SSN: 987-65-4321)
- **Address:** 123 Test Street, Austin, TX 78701
- **DOB:** John (06/15/1985), Jane (03/22/1987)

#### Income
1. **W-2 #1 (John)**
   - Employer: Tech Corp Inc (EIN: 12-3456789)
   - Wages: $95,000
   - Federal withholding: $14,250
   - SS wages/withholding: $95,000 / $5,890
   - Medicare wages/withholding: $95,000 / $1,378

2. **W-2 #2 (Jane)**
   - Employer: Healthcare Partners LLC (EIN: 98-7654321)
   - Wages: $72,000
   - Federal withholding: $10,800
   - SS wages/withholding: $72,000 / $4,464
   - Medicare wages/withholding: $72,000 / $1,044

3. **Interest Income**
   - Payer: First National Bank
   - Amount: $425

4. **Capital Gains**
   - **Long-term:** AAPL Stock (acquired 03/15/2020, sold 06/20/2025)
     - Sales price: $18,500
     - Cost basis: $15,300
     - **Gain: $3,200**
   - **Short-term:** MSFT Stock (acquired 11/10/2024, sold 04/05/2025)
     - Sales price: $9,800
     - Cost basis: $9,000
     - **Gain: $800**

#### Dependents
1. **Emma Sample**
   - SSN: 111-22-3333
   - Relationship: Daughter
   - DOB: 04/10/2017
   - Months lived with taxpayer: 12

2. **Noah Sample**
   - SSN: 444-55-6666
   - Relationship: Son
   - DOB: 09/18/2014
   - Months lived with taxpayer: 12

#### Itemized Deductions
- Mortgage interest: $12,500
- State taxes paid: $8,500
- Local taxes paid: $1,500 (SALT total: $10,000 - capped)
- Charitable cash donations: $3,500
- Medical expenses: $2,800 (only ~$300 deductible after 7.5% AGI threshold)

## Expected Results

### Income Calculation
| Item | Amount |
|------|--------|
| W-2 Wages (John) | $95,000 |
| W-2 Wages (Jane) | $72,000 |
| Interest Income | $425 |
| Long-term Capital Gain | $3,200 |
| Short-term Capital Gain | $800 |
| **Total Income** | **$171,125** |

### Deductions
| Item | Amount |
|------|--------|
| Standard Deduction (MFJ 2025) | $30,000 |
| Itemized Total | $26,300 |

**Decision:** Should take **Standard Deduction** ($30,000 > $26,300)

**Why itemized is only $26,300:**
- Mortgage interest: $12,500
- SALT (capped): $10,000 *(not $10,000 - the $8,500 + $1,500 is capped at $10K)*
- Charitable: $3,500
- Medical: $300 *(only amount over 7.5% of AGI = $171,125 × 0.075 = $12,834, so $2,800 - $12,834 = $0... wait, this doesn't work)*

**Actually:** Medical expenses must exceed 7.5% of AGI to be deductible. 7.5% of $171,125 = $12,844. Since medical expenses are only $2,800, **nothing is deductible**. So itemized total is actually:
- $12,500 + $10,000 + $3,500 = **$26,000**

### Tax Calculation
| Item | Amount |
|------|--------|
| Adjusted Gross Income | $171,125 |
| Standard Deduction | -$30,000 |
| **Taxable Income** | **$141,125** |

### 2025 Tax Brackets (MFJ)
| Bracket | Income Range | Tax |
|---------|--------------|-----|
| 10% | $0 - $23,850 | $2,385 |
| 12% | $23,851 - $96,950 | $8,772 |
| 22% | $96,951 - $141,125 | $9,718 |
| **Total Tax** | | **$20,875** |

### Credits
| Credit | Amount |
|--------|--------|
| Child Tax Credit (2 kids × $2,000) | -$4,000 |
| **Tax After Credits** | **$16,875** |

### Refund Calculation
| Item | Amount |
|------|--------|
| Total Tax Liability | $16,875 |
| Federal Withholding | -$25,050 |
| **Refund** | **$8,175** |

## Verification Checklist

When running through the app, verify:

- [ ] Total income calculates to $171,125
- [ ] Taxable income is $141,125 (after standard deduction)
- [ ] Standard deduction is recommended over itemized
- [ ] Child Tax Credit applies ($4,000 for 2 kids)
- [ ] Tax liability calculates to ~$16,875
- [ ] Refund shows as ~$8,175
- [ ] Effective tax rate shows as ~9.9% ($16,875 / $171,125)
- [ ] Marginal tax rate shows as 22%
- [ ] PDF generates successfully
- [ ] PDF contains all entered data
- [ ] Form 1040 calculations match expectations

## Common Issues to Watch For

1. **SALT Cap:** Make sure state + local taxes are capped at $10,000
2. **Medical Expenses:** Should be $0 deductible (under 7.5% AGI threshold)
3. **Child Tax Credit:** Both kids qualify (under 17 at end of year)
4. **Capital Gains:** Long-term should be taxed at 15% (based on income level)
5. **Pro-rata Rule:** Not applicable in this scenario (no IRA conversions)

## PDF Output

After completing the wizard, the app should generate a PDF with:
- Form 1040 (main return)
- Schedule 1 (if capital gains reported there)
- Schedule D (capital gains)
- All data properly populated
- Calculations matching expected results

Save to: `test-output/sample-return.pdf`

## Automation Testing (Future)

For automated testing, consider:
- Playwright tests for form navigation
- Jest tests for tax calculation engine
- Snapshot tests for PDF output
- Multiple test scenarios (single, HOH, different income levels)

## Known Edge Cases

This test scenario covers:
- ✅ Dual W-2 income
- ✅ Dependents (Child Tax Credit)
- ✅ Itemized vs Standard deduction decision
- ✅ SALT cap application
- ✅ Capital gains (both short and long-term)
- ✅ Interest income
- ✅ Medical expense threshold

Does NOT cover:
- ❌ Self-employment income (Schedule C)
- ❌ Rental property (Schedule E)
- ❌ IRA contributions / Form 8606
- ❌ Alternative Minimum Tax scenarios
- ❌ Education credits
- ❌ Retirement savings contributions credit

## Next Steps

1. Run through the test manually
2. Document any calculation discrepancies
3. Fix bugs found
4. Create additional test scenarios for edge cases
5. Consider automated testing framework
