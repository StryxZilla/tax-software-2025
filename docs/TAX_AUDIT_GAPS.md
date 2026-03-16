# Tax Software Audit Report

**Audit Date:** March 2026  
**Tax Year:** 2025  
**Document:** FEDERAL_TAX_REQUIREMENTS_2025.md  

---

## Executive Summary

This audit compares the implemented tax software against the comprehensive federal tax requirements for tax year 2025. The software has **strong foundational coverage** for major income types, deductions, and credits, but has significant gaps in specific fields, newer "One Big Beautiful Bill" provisions, and some advanced calculations.

---

## 1. Income Sources

### 1.1 W-2 Wages (Form W-2)

| Field/Box | Status | Notes |
|----------|--------|-------|
| Box 1: Wages | ✅ Implemented | W2Form.tsx |
| Box 2: Federal tax withheld | ✅ Implemented | |
| Box 3: Social Security wages | ✅ Implemented | |
| Box 4: Social Security tax withheld | ✅ Implemented | |
| Box 5: Medicare wages | ✅ Implemented | |
| Box 6: Medicare tax withheld | ✅ Implemented | |
| Box 10: Dependent care benefits | ⚠️ Partial | Box 12 code DD captures this, but no dedicated field |
| Box 11: Nonqualified plans | ⚠️ Partial | Box 12 code Q captures this |
| Box 12: Various compensation | ✅ Implemented | Full code list supported |
| Box 13: Statutory employee/retirement plan/third-party sick pay | ❌ Missing | No dedicated field |

### 1.2 1099 Forms

| Form | Status | Fields Missing |
|------|--------|----------------|
| **1099-NEC** | ✅ Implemented | Form1099NECList.tsx - all key fields present |
| **1099-K** | ✅ Implemented | Form1099KList.tsx - Box 1a/1b covered |
| **1099-MISC** | ❌ Missing | Required for rents (Box 1), royalties (Box 2), other income (Box 3), nonemployee comp (Box 7) |
| **1099-INT** | ✅ Implemented | InterestIncomeForm.tsx - all boxes covered |
| **1099-DIV** | ✅ Implemented | DividendIncomeForm.tsx - all boxes covered |
| **1099-OID** | ❌ Missing | Original Issue Discount |
| **1099-B** | ❌ Missing | Proceeds from broker/barter exchanges |
| **1099-S** | ❌ Missing | Real estate proceeds |
| **1099-G** | ⚠️ Partial | Unemployment compensation (Box 2) - no dedicated form, state tax refund (Box 1) goes to itemized |
| **1099-R** | ❌ Missing | Retirement distributions - NO FORM EXISTS |
| **1099-C** | ❌ Missing | Cancellation of debt |

### 1.3 Capital Gains/Losses

| Item | Status | Notes |
|------|--------|-------|
| CapitalGainTransaction interface | ✅ Implemented | tax-types.ts |
| CapitalGainsForm.tsx | ✅ Implemented | Short-term and long-term |
| Schedule D support | ⚠️ Partial | Basic implementation, needs Form 8949 integration |
| Capital loss carryover | ✅ Implemented | $3,000 limit in tax-calculator.ts |

### 1.4 Business Income (Schedule C)

| Item | Status | Notes |
|------|--------|-------|
| ScheduleCForm.tsx | ✅ Implemented | Full expense categories |
| All Schedule C expenses | ✅ Implemented | 20 expense categories in ScheduleCExpenses |
| Business codes (NAICS) | ⚠️ Partial | Field exists but limited validation |

### 1.5 Rental Income (Schedule E)

| Item | Status | Notes |
|------|--------|-------|
| RentalPropertyForm.tsx | ✅ Implemented | Full expense categories |
| RentalExpenses | ✅ Implemented | 13 expense types |
| Royalties | ⚠️ Partial | Part of rental form but not separate |

### 1.6 Farm Income (Schedule F)

| Item | Status | Notes |
|------|--------|-------|
| Schedule F support | ❌ Missing | No form for farming income |

### 1.7 Retirement Income

| Item | Status | Notes |
|------|--------|-------|
| Traditional IRA | ✅ Implemented | RetirementForm.tsx |
| Roth IRA | ✅ Implemented | RetirementForm.tsx |
| Form 8606 | ✅ Implemented | Full pro-rata calculation |
| 401(k)/403(b) info | ⚠️ Partial | k401Contributions extracted from W-2 Box 12 |
| **1099-R (Distributions)** | ❌ Missing | NO FORM - critical for retirement income |
| Social Security | ❌ Missing | No form for SS benefits |
| Early withdrawal penalty | ⚠️ Partial | Not explicitly tracked |

### 1.8 Other Income

| Income Type | Status | Notes |
|-------------|--------|-------|
| Alimony (pre-2019) | ✅ Implemented | AboveTheLineDeductionsForm.tsx |
| Unemployment | ⚠️ Partial | No dedicated form (1099-G Box 2) |
| Gambling winnings | ❌ Missing | No form |
| Hobby income | ⚠️ Partial | Could use Schedule C |
| Scholarships | ❌ Missing | No form |
| Cancellation of debt | ❌ Missing | No 1099-C form |
| **Tip income (NEW)** | ❌ Missing | **NEW 2025-2028 deduction requires tracking** |
| **Overtime pay (NEW)** | ❌ Missing | **NEW 2025-2028 deduction requires tracking** |

---

## 2. Above-the-Line Deductions

| Deduction | Status | Notes |
|-----------|--------|-------|
| Traditional IRA contributions | ✅ Implemented | With phase-out logic in calculations |
| Student loan interest | ✅ Implemented | AboveTheLineDeductionsForm.tsx |
| HSA contributions | ✅ Implemented | Both employee and employer |
| Self-employment tax deduction | ✅ Implemented | 50% SE tax |
| Self-employment health insurance | ✅ Implemented | |
| SEP-IRA / SIMPLE IRA | ✅ Implemented | |
| Educator expenses | ✅ Implemented | $300 limit |
| Alimony paid | ✅ Implemented | Pre-2019 divorce |
| Moving expenses | ✅ Implemented | (Note: now only for active duty military) |
| **Tip Income Deduction (NEW)** | ❌ Missing | Up to $25,000 for 2025-2028 |
| **Overtime Deduction (NEW)** | ❌ Missing | Up to $12,500/$25,000 for 2025-2028 |
| **Car Loan Interest (NEW)** | ❌ Missing | Up to $10,000 for 2025-2028 |
| **Senior Deduction (NEW)** | ❌ Missing | $6,000/$12,000 for 65+ for 2025-2028 |

---

## 3. Deductions (Standard vs Itemized)

### 3.1 Standard Deduction

| Item | Status | Notes |
|------|--------|-------|
| Basic standard deduction | ✅ Implemented | 2025 values in tax-constants.ts |
| Age 65+ additional | ✅ Implemented | |
| Blind additional | ✅ Implemented | |
| Dependent limitations | ✅ Implemented | |

⚠️ **ISSUES FOUND:**
- Standard deduction values in tax-constants.ts are **OUTDATED**:
  - `Single: $15,000` → Should be **$15,750**
  - `Married Filing Jointly: $30,000` → Should be **$31,500**
  - `Head of Household: $22,500` → Should be **$23,625**

### 3.2 Itemized Deductions (Schedule A)

| Item | Status | Notes |
|------|--------|-------|
| Medical expenses | ✅ Implemented | 7.5% threshold |
| State/local taxes (SALT) | ✅ Implemented | $10,000 cap |
| **SALT cap increase to $40,000** | ❌ Missing | **2025 One Big Beautiful Bill change** |
| **SALT phase-out for high earners** | ❌ Missing | 30% phase-out above $500K MAGI |
| Real estate taxes | ✅ Implemented | |
| Personal property taxes | ✅ Implemented | |
| Mortgage interest | ✅ Implemented | |
| Investment interest | ✅ Implemented | |
| Charitable contributions | ✅ Implemented | Cash and non-cash |
| Casualty/theft losses | ✅ Implemented | Presidentially declared disasters |
| Miscellaneous itemized | ⚠️ Partial | Still collected but note it's going away |

---

## 4. Tax Credits

### 4.1 Refundable Credits

| Credit | Status | Notes |
|--------|--------|-------|
| Earned Income Tax Credit (EITC) | ✅ Implemented | Full calculation in tax-calculator.ts |
| Child Tax Credit (CTC) | ✅ Implemented | $2,000 per child |
| Additional Child Tax Credit (ACTC) | ⚠️ Partial | Refundable portion not fully separated |
| American Opportunity Credit | ✅ Implemented | |
| Lifetime Learning Credit | ✅ Implemented | |
| Premium Tax Credit (PTC) | ❌ Missing | Health insurance marketplace |
| Child and Dependent Care Credit | ✅ Implemented | |
| Adoption Credit | ❌ Missing | |

### 4.2 Non-Refundable Credits

| Credit | Status | Notes |
|--------|--------|-------|
| Saver's Credit | ✅ Implemented | |
| Clean Vehicle Credit (new) | ✅ Implemented | |
| Used Clean Vehicle Credit | ✅ Implemented | |
| Residential Energy Credit | ✅ Implemented | |
| Foreign Tax Credit | ❌ Missing | Form 1116 |

---

## 5. Tax Calculations

### 5.1 Ordinary Income Tax Brackets

⚠️ **CRITICAL ISSUE:** Tax brackets in tax-constants.ts are **INCORRECT**:

| Rate | Current (WRONG) | Should Be (2025) |
|------|-----------------|------------------|
| 10% | $0 - $11,925 | $0 - $12,400 |
| 12% | $11,926 - $48,475 | $12,401 - $50,400 |
| 22% | $48,476 - $103,350 | $50,401 - $105,700 |
| 24% | $103,351 - $197,300 | $105,701 - $201,775 |
| 32% | $197,301 - $250,525 | $201,776 - $256,225 |
| 35% | $250,526 - $626,350 | $256,226 - $640,600 |
| 37% | $626,351+ | $640,601+ |

The same errors exist for Married Filing Jointly and Head of Household.

### 5.2 Capital Gains Rates

⚠️ **ISSUES:**
- Brackets are also **INCORRECT** in tax-constants.ts
- **NIIT (Net Investment Income Tax)** calculation is **MISSING** from tax-calculator.ts
  - 3.8% on lesser of NII OR (MAGI - $200K/$250K/$125K threshold)

### 5.3 Self-Employment Tax

| Item | Status | Notes |
|------|--------|-------|
| Social Security portion | ✅ Implemented | 12.4% up to $176,100 |
| Medicare portion | ✅ Implemented | 2.9% no cap |
| Additional Medicare Tax | ✅ Implemented | 0.9% above threshold |
| 92.35% adjustment | ✅ Implemented | |

### 5.4 Alternative Minimum Tax (AMT)

| Item | Status | Notes |
|------|--------|-------|
| AMT calculation | ✅ Implemented | |
| Exemption | ⚠️ Wrong values | Current: $88,100/$137,000 → Should be **$85,700/$133,300** |
| Phase-out thresholds | ⚠️ Wrong values | Current: $626,350/$1,252,700 → Should be **$609,000/$1,218,000** |

### 5.5 Tax Computation

✅ Basic flow implemented correctly:
- Gross Income → Adjustments → AGI → Deductions → Taxable Income → Tax → Credits → Final Tax

❌ **MISSING:**
- Schedule 1 integration (Additional Income and Adjustments)
- Schedule 1-A integration (NEW 2025-2028 deductions)
- Detailed NIIT calculation

---

## 6. Filing Requirements

| Item | Status | Notes |
|------|--------|-------|
| Filing status selection | ✅ Implemented | PersonalInfoForm.tsx |
| Filing threshold checks | ❌ Missing | No validation提醒 |
| Extension filing | ❌ Missing | No Form 4868 |
| Foreign account reporting (FBAR) | ❌ Missing | |

---

## Priority Gaps Summary

### 🔴 HIGH PRIORITY (Missing/Incorrect - Affects Core Calculations)

1. **Tax brackets are WRONG** - All rates need updating to 2025 values
2. **Standard deduction values are WRONG** - Need 2025 updates  
3. **NIIT (Net Investment Income Tax) is MISSING** - 3.8% calculation absent
4. **SALT cap is still $10,000** - Should be $40,000 for 2025 (One Big Beautiful Bill)
5. **1099-R is MISSING** - No form for retirement distributions
6. **Social Security income is MISSING** - No form for SS benefits
7. **NEW Schedule 1-A deductions (2025-2028) are MISSING**:
   - Tip income deduction (up to $25,000)
   - Overtime deduction (up to $12,500/$25,000)
   - Car loan interest (up to $10,000)
   - Senior deduction (up to $6,000/$12,000)

### 🟡 MEDIUM PRIORITY (Partial Implementation)

1. **1099-MISC** - No form (rents, royalties, other income)
2. **1099-OID** - No form
3. **1099-B** - No form (broker transactions)
3. **1099-S** - No form (real estate)
4. **1099-C** - No form (cancellation of debt)
5. **Form 1116 (Foreign Tax Credit)** - Missing
6. **Adoption Credit** - Missing
7. **Premium Tax Credit** - Missing (but complex)
8. **Schedule F (Farm income)** - Missing
9. **AMT values slightly off** - Need 2025 updates
10. **Capital gains brackets wrong** - Need 2025 updates

### 🟢 LOWER PRIORITY (Nice to Have)

1. Gambling winnings
2. Hobby income (could use Schedule C)
3. Scholarships
4. Form 8949 integration for detailed capital gains
5. FBAR / foreign account reporting
6. Extension filing (Form 4868)

---

## Recommendations

1. **Immediate Fixes Required:**
   - Update all 2025 tax bracket values in tax-constants.ts
   - Update standard deduction values
   - Implement NIIT calculation
   - Update SALT cap to $40,000 for 2025
   - Add 1099-R form for retirement distributions

2. **2025 Legislative Updates:**
   - Add Schedule 1-A for new 2025-2028 deductions
   - Add tip income and overtime income tracking fields

3. **Missing Forms to Add:**
   - 1099-MISC, 1099-OID, 1099-B, 1099-S, 1099-C
   - Social Security income form
   - Schedule F

---

*Report generated for tax software audit purposes.*
