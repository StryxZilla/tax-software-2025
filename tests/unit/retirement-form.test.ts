/**
 * Unit tests for retirement form calculations and validation
 * Covers: basic contributions, Backdoor Roth, Mega Backdoor Roth
 */

import { describe, it, expect } from 'vitest';
import { calculateForm8606, validateMegaBackdoorRoth, calculateConversionStrategy } from '../../lib/engine/forms/form-8606';
import { validateRetirement } from '../../lib/validation/form-validation';
import type { Form8606Data } from '../../types/tax-types';

/* ─── Form 8606 Calculations ─── */
describe('calculateForm8606', () => {
  it('computes a clean backdoor Roth (no existing IRA balance)', () => {
    const data: Form8606Data = {
      nondeductibleContributions: 7000,
      priorYearBasis: 0,
      conversionsToRoth: 7000,
      endOfYearTraditionalIRABalance: 0,
      distributionsFromTraditionalIRA: 0,
    };
    const result = calculateForm8606(data);
    expect(result.line3_totalBasis).toBe(7000);
    expect(result.line9_basisPercentage).toBe(1); // 100%
    expect(result.line17_nontaxablePortion).toBe(7000);
    expect(result.line18_taxablePortion).toBe(0);
    expect(result.remainingBasis).toBe(0);
  });

  it('applies pro-rata rule when pre-tax IRA money exists', () => {
    const data: Form8606Data = {
      nondeductibleContributions: 7000,
      priorYearBasis: 0,
      conversionsToRoth: 7000,
      endOfYearTraditionalIRABalance: 93000, // $100k total pool
      distributionsFromTraditionalIRA: 0,
    };
    const result = calculateForm8606(data);
    // basis% = 7000 / (7000 + 93000) = 7%
    expect(result.line9_basisPercentage).toBeCloseTo(0.07, 2);
    expect(result.line17_nontaxablePortion).toBe(490); // 7000 * 0.07 = 490
    expect(result.line18_taxablePortion).toBe(6510);
  });

  it('handles partial conversion', () => {
    const data: Form8606Data = {
      nondeductibleContributions: 7000,
      priorYearBasis: 3000,
      conversionsToRoth: 5000,
      endOfYearTraditionalIRABalance: 5000,
      distributionsFromTraditionalIRA: 0,
    };
    const result = calculateForm8606(data);
    expect(result.line3_totalBasis).toBe(10000);
    expect(result.line6_totalConversionsAndDistributions).toBe(5000);
    expect(result.line8_totalIRABalancePlusDistributions).toBe(10000);
    expect(result.line9_basisPercentage).toBe(1); // 10000/10000
    expect(result.line18_taxablePortion).toBe(0);
  });

  it('handles zero conversions gracefully', () => {
    const data: Form8606Data = {
      nondeductibleContributions: 7000,
      priorYearBasis: 0,
      conversionsToRoth: 0,
      endOfYearTraditionalIRABalance: 7000,
      distributionsFromTraditionalIRA: 0,
    };
    const result = calculateForm8606(data);
    expect(result.line16_amountConverted).toBe(0);
    expect(result.line17_nontaxablePortion).toBe(0);
    expect(result.line18_taxablePortion).toBe(0);
  });

  it('includes distributions in pro-rata pool', () => {
    const data: Form8606Data = {
      nondeductibleContributions: 7000,
      priorYearBasis: 0,
      conversionsToRoth: 7000,
      endOfYearTraditionalIRABalance: 0,
      distributionsFromTraditionalIRA: 93000,
    };
    const result = calculateForm8606(data);
    // pool = 7000 + 0 + 93000 = 100000
    expect(result.line8_totalIRABalancePlusDistributions).toBe(100000);
    expect(result.line9_basisPercentage).toBeCloseTo(0.07, 2);
  });
});

/* ─── Backdoor Roth Validation ─── */
describe('validateMegaBackdoorRoth', () => {
  it('returns clean for zero-balance conversion', () => {
    const data: Form8606Data = {
      nondeductibleContributions: 7000,
      priorYearBasis: 0,
      conversionsToRoth: 7000,
      endOfYearTraditionalIRABalance: 0,
      distributionsFromTraditionalIRA: 0,
    };
    const result = validateMegaBackdoorRoth(data);
    expect(result.isClean).toBe(true);
    expect(result.warnings).toHaveLength(0);
    expect(result.recommendations.length).toBeGreaterThan(0); // "Perfect execution"
  });

  it('warns about pro-rata rule when IRA balance exists', () => {
    const data: Form8606Data = {
      nondeductibleContributions: 7000,
      priorYearBasis: 0,
      conversionsToRoth: 7000,
      endOfYearTraditionalIRABalance: 100000,
      distributionsFromTraditionalIRA: 0,
    };
    const result = validateMegaBackdoorRoth(data);
    expect(result.isClean).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('pro-rata');
  });
});

/* ─── Conversion Strategy ─── */
describe('calculateConversionStrategy', () => {
  it('recommends optimal when no existing IRA', () => {
    const result = calculateConversionStrategy(7000, 0, 0, 7000);
    expect(result.taxableAmount).toBe(0);
    expect(result.effectiveTaxRate).toBe(0);
    expect(result.recommendation).toContain('Optimal');
  });

  it('warns when mostly taxable', () => {
    const result = calculateConversionStrategy(7000, 200000, 0, 7000);
    expect(result.effectiveTaxRate).toBeGreaterThan(0.5);
    expect(result.recommendation).toContain('Not optimal');
  });
});

/* ─── Retirement Validation ─── */
describe('validateRetirement', () => {
  it('accepts valid basic contributions', () => {
    const errors = validateRetirement(
      { amount: 7000, isDeductible: true },
      { amount: 0 },
      undefined,
    );
    expect(errors).toHaveLength(0);
  });

  it('rejects negative amounts', () => {
    const errors = validateRetirement(
      { amount: -100, isDeductible: false },
      undefined,
      undefined,
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toContain('negative');
  });

  it('rejects amounts over catch-up limit', () => {
    const errors = validateRetirement(
      { amount: 9000, isDeductible: false },
      undefined,
      undefined,
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toContain('exceed');
  });

  it('rejects combined IRA over limit', () => {
    const errors = validateRetirement(
      { amount: 5000, isDeductible: false },
      { amount: 5000 },
      undefined,
    );
    // Combined = 10000 > 8000 catch-up limit
    const combinedError = errors.find(e => e.field === 'retirement-combined-limit');
    expect(combinedError).toBeDefined();
  });

  it('passes with zero amounts', () => {
    const errors = validateRetirement(
      { amount: 0, isDeductible: false },
      { amount: 0 },
      undefined,
    );
    expect(errors).toHaveLength(0);
  });
});
