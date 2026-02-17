/**
 * Cache for tax calculations to improve performance
 */

export interface CalculationCache {
  timestamp: number;
  totalIncome?: number;
  adjustments?: number;
  agi?: number;
  itemizedDeductions?: number;
  standardDeduction?: number;
  taxableIncome?: number;
  regularTax?: number;
  amt?: number;
  selfEmploymentTax?: number;
  totalCredits?: number;
}

class TaxCalculationCache {
  private static instance: TaxCalculationCache;
  private cache: Map<string, CalculationCache> = new Map();
  private readonly CACHE_TTL = 5000; // 5 seconds

  private constructor() {}

  public static getInstance(): TaxCalculationCache {
    if (!TaxCalculationCache.instance) {
      TaxCalculationCache.instance = new TaxCalculationCache();
    }
    return TaxCalculationCache.instance;
  }

  public get(key: string): CalculationCache | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if cache is still valid
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached;
  }

  public set(key: string, value: Partial<CalculationCache>): void {
    this.cache.set(key, {
      ...value,
      timestamp: Date.now()
    });
  }

  public invalidate(key: string): void {
    this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  // Helper to generate a unique key for a tax return state
  public static generateKey(taxReturn: any): string {
    return JSON.stringify({
      w2: taxReturn.w2Income,
      se: taxReturn.selfEmployment,
      itemized: taxReturn.itemizedDeductions,
      deductions: taxReturn.aboveTheLineDeductions,
      cg: taxReturn.capitalGains.length,
      rental: taxReturn.rentalProperties.length
    });
  }
}

export const calculationCache = TaxCalculationCache.getInstance();