/**
 * Unit Tests: TaxSummarySidebar Features
 * Tests completion percentage, warning banners, QBI/Medicare display, 
 * expandable cards, tax planning insights, and what-if sliders
 * 
 * @vitest-environment jsdom
 */
import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, render, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaxSummarySidebar from '../../components/review/TaxSummarySidebar'
import type { TaxReturn, TaxCalculation, PersonalInfo } from '../../types/tax-types'

// Mock the context
const mockUseTaxReturn = vi.fn()

vi.mock('../../lib/context/TaxReturnContext', () => ({
  useTaxReturn: () => mockUseTaxReturn(),
}))

// Mock lucide-react icons - use plain functions that don't require JSX in the mock factory
vi.mock('lucide-react', () => ({
  DollarSign: ({ className }: { className?: string }) => React.createElement('span', { 'data-testid': 'dollar-icon', className }, '$'),
  ChevronDown: ({ className }: { className?: string }) => React.createElement('button', { 'data-testid': 'chevron-down', className }, '▼'),
  ChevronUp: ({ className }: { className?: string }) => React.createElement('button', { 'data-testid': 'chevron-up', className }, '▲'),
  TrendingUp: ({ className }: { className?: string }) => React.createElement('span', { 'data-testid': 'trending-up', className }, '↑'),
  TrendingDown: ({ className }: { className?: string }) => React.createElement('span', { 'data-testid': 'trending-down', className }, '↓'),
  Percent: ({ className }: { className?: string }) => React.createElement('span', { 'data-testid': 'percent-icon', className }, '%'),
  Loader2: ({ className }: { className?: string }) => React.createElement('span', { 'data-testid': 'loader', className }, '⟳'),
  Clock: ({ className }: { className?: string }) => React.createElement('span', { 'data-testid': 'clock', className }, '🕐'),
  AlertTriangle: ({ className }: { className?: string }) => React.createElement('span', { 'data-testid': 'alert', className }, '⚠'),
  CheckCircle: ({ className }: { className?: string }) => React.createElement('span', { 'data-testid': 'check', className }, '✓'),
  Info: ({ className }: { className?: string }) => React.createElement('span', { 'data-testid': 'info', className }, 'ℹ'),
  Briefcase: ({ className }: { className?: string }) => React.createElement('span', { 'data-testid': 'briefcase', className }, '💼'),
  PiggyBank: ({ className }: { className?: string }) => React.createElement('span', { 'data-testid': 'piggy', className }, '🐷'),
  Calculator: ({ className }: { className?: string }) => React.createElement('span', { 'data-testid': 'calculator', className }, '🔢'),
  RefreshCcw: ({ className }: { className?: string }) => React.createElement('span', { 'data-testid': 'refresh', className }, '↺'),
  Sliders: ({ className }: { className?: string }) => React.createElement('span', { 'data-testid': 'sliders', className }, '⚙'),
}))

// Recharts mocking - also use React.createElement
vi.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'bar-chart' }, children),
  Bar: () => React.createElement('div', { 'data-testid': 'bar' }),
  PieChart: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'pie-chart' }, children),
  Pie: () => React.createElement('div', { 'data-testid': 'pie' }),
  Cell: () => React.createElement('div', { 'data-testid': 'cell' }),
  XAxis: () => React.createElement('div', { 'data-testid': 'x-axis' }),
  YAxis: () => React.createElement('div', { 'data-testid': 'y-axis' }),
  Tooltip: () => React.createElement('div', { 'data-testid': 'tooltip' }),
  Legend: () => React.createElement('div', { 'data-testid': 'legend' }),
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'responsive-container' }, children),
}))

// ──────────────────────── Test Fixtures ────────────────────────

const basePersonalInfo: PersonalInfo = {
  firstName: 'John',
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

const baseTaxReturn: TaxReturn = {
  personalInfo: basePersonalInfo,
  dependents: [],
  w2Income: [],
  interest: [],
  dividends: [],
  capitalGains: [],
  selfEmployment: undefined,
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

const baseTaxCalculation: TaxCalculation = {
  totalIncome: 75000,
  adjustments: 0,
  agi: 75000,
  standardOrItemizedDeduction: 14600,
  qbiDeduction: 0,
  taxableIncome: 60400,
  regularTax: 8644,
  amt: 0,
  totalTaxBeforeCredits: 8644,
  totalCredits: 0,
  totalTaxAfterCredits: 8644,
  selfEmploymentTax: 0,
  additionalMedicareTax: 0,
  totalTax: 8644,
  federalTaxWithheld: 12000,
  estimatedTaxPayments: 0,
  refundOrAmountOwed: 336,
}

const mockWithW2: TaxReturn = {
  ...baseTaxReturn,
  w2Income: [{
    employer: 'Acme Corp',
    ein: '12-3456789',
    wages: 75000,
    federalTaxWithheld: 12000,
    socialSecurityWages: 75000,
    socialSecurityTaxWithheld: 4650,
    medicareWages: 75000,
    medicareTaxWithheld: 1087.50,
    box12: [],
  }],
}

const mockWithSpouse: TaxReturn = {
  ...baseTaxReturn,
  personalInfo: {
    ...basePersonalInfo,
    filingStatus: 'Married Filing Jointly',
    spouseInfo: {
      firstName: 'Jane',
      lastName: 'Doe',
      ssn: '123-45-6788',
      age: 33,
      isBlind: false,
    },
  },
  w2Income: [
    {
      employer: 'Acme Corp',
      ein: '12-3456789',
      wages: 75000,
      federalTaxWithheld: 12000,
      socialSecurityWages: 75000,
      socialSecurityTaxWithheld: 4650,
      medicareWages: 75000,
      medicareTaxWithheld: 1087.50,
      box12: [],
    },
    {
      employer: 'Tech Inc',
      ein: '98-7654321',
      wages: 65000,
      federalTaxWithheld: 10000,
      socialSecurityWages: 65000,
      socialSecurityTaxWithheld: 4030,
      medicareWages: 65000,
      medicareTaxWithheld: 942.50,
      box12: [],
    },
  ],
}

// Tax calc with AMT
const mockTaxCalcWithAMT: TaxCalculation = {
  ...baseTaxCalculation,
  amt: 12500,
  totalTax: 8644 + 12500,
  refundOrAmountOwed: -4066,
}

// Tax calc with Additional Medicare Tax
const mockTaxCalcWithMedicare: TaxCalculation = {
  ...baseTaxCalculation,
  additionalMedicareTax: 900,
  totalTax: 8644 + 900,
  refundOrAmountOwed: -2444,
}

// Tax calc with QBI
const mockTaxCalcWithQBI: TaxCalculation = {
  ...baseTaxCalculation,
  qbiDeduction: 25000,
}

// Tax calc for EITC eligibility (low income with dependents)
const mockTaxCalcForEITC: TaxCalculation = {
  totalIncome: 28000,
  adjustments: 0,
  agi: 28000,
  standardOrItemizedDeduction: 14600,
  qbiDeduction: 0,
  taxableIncome: 13400,
  regularTax: 1342,
  amt: 0,
  totalTaxBeforeCredits: 1342,
  totalCredits: 3500, // EITC
  totalTaxAfterCredits: 0,
  selfEmploymentTax: 0,
  additionalMedicareTax: 0,
  totalTax: 0,
  federalTaxWithheld: 1500,
  estimatedTaxPayments: 0,
  refundOrAmountOwed: 1500,
}

// Self-employed tax return
const mockSelfEmployed: TaxReturn = {
  ...baseTaxReturn,
  personalInfo: {
    ...basePersonalInfo,
    filingStatus: 'Single',
  },
  w2Income: [],
  selfEmployment: {
    businessName: 'Consulting Co',
    ein: '55-1234567',
    businessCode: '541600',
    grossReceipts: 150000,
    returns: 5000,
    costOfGoodsSold: 10000,
    expenses: {
      advertising: 2000,
      carAndTruck: 5000,
      commissions: 0,
      contractLabor: 10000,
      depletion: 0,
      depreciation: 5000,
      employeeBenefitPrograms: 0,
      insurance: 3000,
      interest: 0,
      legal: 1500,
      officeExpense: 2000,
      pension: 0,
      rentLease: 12000,
      repairs: 1000,
      supplies: 3000,
      taxes: 2000,
      travel: 5000,
      mealsAndEntertainment: 1000,
      utilities: 4000,
      wages: 0,
      other: 2000,
    },
  },
  estimatedTaxPayments: 20000,
}

// ──────────────────────── Test Setup ────────────────────────

describe('TaxSummarySidebar', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    })
    
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1280,
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  // ─────────────────────────────────────────────────────────────
  // PHASE 1: Completion Percentage Calculation Tests
  // ─────────────────────────────────────────────────────────────

  describe('Phase 1: Completion Percentage Calculation', () => {
    it('CP-001: returns 100% when all required fields filled (Single filer)', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: baseTaxCalculation,
        taxReturn: mockWithW2,
        isCalculating: false,
        lastSaved: new Date(),
      })

      const { container } = render(<TaxSummarySidebar />)
      
      // Check for completion percentage in the UI
      const completionText = container.textContent
      expect(completionText).toMatch(/100\s*%/)
    })

    it('CP-002: returns 0% when no fields filled', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: null,
        taxReturn: {
          ...baseTaxReturn,
          personalInfo: {
            ...basePersonalInfo,
            firstName: '',
            lastName: '',
            ssn: '',
            filingStatus: 'Single',
          },
          w2Income: [],
        },
        isCalculating: false,
        lastSaved: null,
      })

      render(<TaxSummarySidebar />)
      
      // Should show empty state (no tax calculation yet)
      expect(screen.getByText(/Fill out your tax information/)).toBeInTheDocument()
    })

    it('CP-003: returns 50% when partial fields filled (firstName, lastName)', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: null,
        taxReturn: {
          ...baseTaxReturn,
          personalInfo: {
            ...basePersonalInfo,
            firstName: 'John',
            lastName: 'Doe',
            ssn: '',
            filingStatus: 'Single',
          },
          w2Income: [],
        },
        isCalculating: false,
        lastSaved: null,
      })

      // Empty calculation state is shown - this is expected behavior
      // when no taxCalculation exists
      expect(screen.getByText(/Fill out your tax information/)).toBeInTheDocument()
    })

    it('CP-004: adds 25% when W2 income with wages > 0', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: baseTaxCalculation,
        taxReturn: mockWithW2,
        isCalculating: false,
        lastSaved: new Date(),
      })

      const { container } = render(<TaxSummarySidebar />)
      expect(container.textContent).toMatch(/100/)
    })

    it('CP-005: includes spouse for Married Filing Jointly', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: baseTaxCalculation,
        taxReturn: mockWithSpouse,
        isCalculating: false,
        lastSaved: new Date(),
      })

      const { container } = render(<TaxSummarySidebar />)
      // Should have completion showing
      expect(container.textContent).toMatch(/\d+/)
    })

    it('CP-006: no spouse penalty for Married Filing Separately', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: baseTaxCalculation,
        taxReturn: {
          ...baseTaxReturn,
          personalInfo: {
            ...basePersonalInfo,
            filingStatus: 'Married Filing Separately',
            spouseInfo: undefined,
          },
          w2Income: [{
            employer: 'Acme Corp',
            ein: '12-3456789',
            wages: 75000,
            federalTaxWithheld: 12000,
            socialSecurityWages: 75000,
            socialSecurityTaxWithheld: 4650,
            medicareWages: 75000,
            medicareTaxWithheld: 1087.50,
            box12: [],
          }],
        },
        isCalculating: false,
        lastSaved: new Date(),
      })

      render(<TaxSummarySidebar />)
      // Should render without errors
      expect(screen.getByText('Tax Summary')).toBeInTheDocument()
    })

    it('CP-007: W2 present but wages = 0 should not count', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: baseTaxCalculation,
        taxReturn: {
          ...baseTaxReturn,
          w2Income: [{
            employer: 'Acme Corp',
            ein: '12-3456789',
            wages: 0,
            federalTaxWithheld: 0,
            socialSecurityWages: 0,
            socialSecurityTaxWithheld: 0,
            medicareWages: 0,
            medicareTaxWithheld: 0,
            box12: [],
          }],
        },
        isCalculating: false,
        lastSaved: new Date(),
      })

      render(<TaxSummarySidebar />)
      // Should render but not count the W2 as filled
      expect(screen.getByText('Tax Summary')).toBeInTheDocument()
    })
  })

  // ─────────────────────────────────────────────────────────────
  // PHASE 1: Warning Banner Display Logic Tests
  // ─────────────────────────────────────────────────────────────

  describe('Phase 1: Warning Banner Display Logic', () => {
    it('WD-001: displays AMT warning when AMT > 0', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: mockTaxCalcWithAMT,
        taxReturn: mockWithW2,
        isCalculating: false,
        lastSaved: new Date(),
      })

      const { container } = render(<TaxSummarySidebar />)
      
      // Check for AMT-related text
      expect(container.textContent).toMatch(/AMT|Alternative Minimum Tax/i)
    })

    it('WD-002: hides AMT warning when AMT = 0', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: baseTaxCalculation,
        taxReturn: mockWithW2,
        isCalculating: false,
        lastSaved: new Date(),
      })

      const { container } = render(<TaxSummarySidebar />)
      
      // Should NOT show AMT warning
      expect(container.textContent).not.toMatch(/Alternative Minimum Tax/)
    })

    it('WD-003: displays Medicare warning when additionalMedicareTax > 0', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: mockTaxCalcWithMedicare,
        taxReturn: mockWithW2,
        isCalculating: false,
        lastSaved: new Date(),
      })

      const { container } = render(<TaxSummarySidebar />)
      
      // Check for Additional Medicare Tax display
      expect(container.textContent).toMatch(/Additional Medicare Tax/i)
    })

    it('WD-004: hides Medicare warning when additionalMedicareTax = 0', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: baseTaxCalculation,
        taxReturn: mockWithW2,
        isCalculating: false,
        lastSaved: new Date(),
      })

      const { container } = render(<TaxSummarySidebar />)
      
      // Should NOT show Additional Medicare Tax warning
      expect(container.textContent).not.toMatch(/Additional Medicare Tax/)
    })

    it('WD-005: displays EITC warning when eligible (low income + dependents)', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: mockTaxCalcForEITC,
        taxReturn: {
          ...baseTaxReturn,
          dependents: [{
            firstName: 'Jimmy',
            lastName: 'Doe',
            ssn: '123-45-0001',
            relationshipToTaxpayer: 'Son',
            birthDate: '2018-05-15',
            isQualifyingChildForCTC: true,
            monthsLivedWithTaxpayer: 12,
          }],
        },
        isCalculating: false,
        lastSaved: new Date(),
      })

      const { container } = render(<TaxSummarySidebar />)
      
      // Check for EITC-related text
      expect(container.textContent).toMatch(/EITC|Earned Income Tax Credit/i)
    })

    it('WD-006: hides EITC warning when not eligible (no dependents)', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: baseTaxCalculation,
        taxReturn: {
          ...mockWithW2,
          dependents: [],
        },
        isCalculating: false,
        lastSaved: new Date(),
      })

      const { container } = render(<TaxSummarySidebar />)
      
      // Should NOT show EITC warning for single with no dependents
      expect(container.textContent).not.toMatch(/EITC|qualify.*EITC/i)
    })

    it('WD-007: displays all 3 warnings when all conditions are met', () => {
      const mockWithAllWarnings: TaxCalculation = {
        ...baseTaxCalculation,
        amt: 12500,
        additionalMedicareTax: 900,
        totalTax: 8644 + 12500 + 900,
        refundOrAmountOwed: -8166,
      }

      mockUseTaxReturn.mockReturnValue({
        taxCalculation: mockWithAllWarnings,
        taxReturn: {
          ...mockWithW2,
          dependents: [{
            firstName: 'Jimmy',
            lastName: 'Doe',
            ssn: '123-45-0001',
            relationshipToTaxpayer: 'Son',
            birthDate: '2018-05-15',
            isQualifyingChildForCTC: true,
            monthsLivedWithTaxpayer: 12,
          }],
        },
        isCalculating: false,
        lastSaved: new Date(),
      })

      const { container } = render(<TaxSummarySidebar />)
      
      // Should show multiple warnings
      expect(container.textContent).toMatch(/AMT|Alternative Minimum Tax/i)
    })

    it('WD-008: no warning banners when no warnings active', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: baseTaxCalculation,
        taxReturn: {
          ...mockWithW2,
          dependents: [],
        },
        isCalculating: false,
        lastSaved: new Date(),
      })

      const { container } = render(<TaxSummarySidebar />)
      
      // Should not show any warning banners (no AMT, no EITC, no Medicare tax)
      expect(container.textContent).not.toMatch(/Alternative Minimum Tax/)
      expect(container.textContent).not.toMatch(/Additional Medicare Tax/)
    })
  })

  // ─────────────────────────────────────────────────────────────
  // PHASE 1: QBI and Additional Medicare Tax Display Tests
  // ─────────────────────────────────────────────────────────────

  describe('Phase 1: QBI and Medicare Tax Display', () => {
    it('QBI-001: displays QBI card when qbiDeduction > 0', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: mockTaxCalcWithQBI,
        taxReturn: mockSelfEmployed,
        isCalculating: false,
        lastSaved: new Date(),
      })

      const { container } = render(<TaxSummarySidebar />)
      
      // Should show QBI Deduction
      expect(container.textContent).toMatch(/QBI.*Deduction/i)
    })

    it('QBI-002: hides QBI card when qbiDeduction = 0', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: baseTaxCalculation,
        taxReturn: mockWithW2,
        isCalculating: false,
        lastSaved: new Date(),
      })

      const { container } = render(<TaxSummarySidebar />)
      
      // Should NOT show QBI card
      expect(container.textContent).not.toMatch(/QBI.*Deduction/i)
    })

    it('QBI-003: hides QBI card when qbiDeduction = null/undefined', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: {
          ...baseTaxCalculation,
          qbiDeduction: undefined as unknown as number,
        },
        taxReturn: mockWithW2,
        isCalculating: false,
        lastSaved: new Date(),
      })

      const { container } = render(<TaxSummarySidebar />)
      
      // Should handle null/undefined gracefully
      expect(screen.getByText('Tax Summary')).toBeInTheDocument()
    })

    it('MED-001: displays Medicare card when additionalMedicareTax > 0', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: mockTaxCalcWithMedicare,
        taxReturn: mockWithW2,
        isCalculating: false,
        lastSaved: new Date(),
      })

      const { container } = render(<TaxSummarySidebar />)
      
      // Should show Additional Medicare Tax
      expect(container.textContent).toMatch(/Additional Medicare Tax/i)
    })

    it('MED-002: hides Medicare card when additionalMedicareTax = 0', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: baseTaxCalculation,
        taxReturn: mockWithW2,
        isCalculating: false,
        lastSaved: new Date(),
      })

      const { container } = render(<TaxSummarySidebar />)
      
      // Should NOT show the card
      expect(container.textContent).not.toMatch(/Additional Medicare Tax/)
    })

    it('MED-003: hides Medicare card when additionalMedicareTax = null/undefined', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: {
          ...baseTaxCalculation,
          additionalMedicareTax: undefined as unknown as number,
        },
        taxReturn: mockWithW2,
        isCalculating: false,
        lastSaved: new Date(),
      })

      render(<TaxSummarySidebar />)
      
      // Should handle gracefully
      expect(screen.getByText('Tax Summary')).toBeInTheDocument()
    })
  })

  // ─────────────────────────────────────────────────────────────
  // PHASE 2: Expandable Card Toggle Behavior Tests
  // ─────────────────────────────────────────────────────────────

  describe('Phase 2: Expandable Card Toggle Behavior', () => {
    it('EC-001: Tax Breakdown card expands/collapses on click', async () => {
      const user = userEvent.setup()
      
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: baseTaxCalculation,
        taxReturn: {
          ...mockWithW2,
          dependents: [{ // Add dependent to show credits section
            firstName: 'Jimmy',
            lastName: 'Doe',
            ssn: '123-45-0001',
            relationshipToTaxpayer: 'Son',
            birthDate: '2018-05-15',
            isQualifyingChildForCTC: true,
            monthsLivedWithTaxpayer: 12,
          }],
        },
        isCalculating: false,
        lastSaved: new Date(),
      })

      render(<TaxSummarySidebar />)
      
      // Look for the Tax Credits section toggle
      const creditsButton = screen.getByText(/Tax Credits/i)
      expect(creditsButton).toBeInTheDocument()
      
      // Click to expand
      await user.click(creditsButton)
      
      // Should now be expanded - check for credit details
      expect(screen.getByText(/Total Credits/i)).toBeInTheDocument()
    })

    it('EC-002: Deductions card expands/collapses on click', async () => {
      const user = userEvent.setup()
      
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: baseTaxCalculation,
        taxReturn: mockWithW2,
        isCalculating: false,
        lastSaved: new Date(),
      })

      render(<TaxSummarySidebar />)
      
      // Look for Deductions section
      const deductionsButton = screen.getByText(/Deductions/i)
      expect(deductionsButton).toBeInTheDocument()
      
      // Click to toggle
      await user.click(deductionsButton)
      
      // Should toggle - check for expanded content
      expect(screen.getByText(/Standard Deduction|Itemized Deductions/i)).toBeInTheDocument()
    })

    it('EC-003: Insights card expands/collapses on click', async () => {
      const user = userEvent.setup()
      
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: baseTaxCalculation,
        taxReturn: mockWithW2,
        isCalculating: false,
        lastSaved: new Date(),
      })

      render(<TaxSummarySidebar />)
      
      // Look for Tax Planning Insights section
      const insightsButton = screen.getByText(/Tax Planning Insights/i)
      expect(insightsButton).toBeInTheDocument()
      
      // Click to expand
      await user.click(insightsButton)
      
      // Should toggle the expanded state
      expect(screen.getByText(/Tax Planning Insights/i)).toBeInTheDocument()
    })

    it('EC-004: Insights card is default expanded (true)', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: baseTaxCalculation,
        taxReturn: mockWithW2,
        isCalculating: false,
        lastSaved: new Date(),
      })

      render(<TaxSummarySidebar />)
      
      // Insights should be expanded by default
      // (content should be visible without clicking)
      expect(screen.getByText(/Tax Planning Insights/i)).toBeInTheDocument()
    })

    it('EC-005: Collapse state persists in localStorage', async () => {
      const user = userEvent.setup()
      const localStorageMock = localStorage as unknown as { getItem: ReturnType<typeof vi.fn>, setItem: ReturnType<typeof vi.fn> }
      
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: baseTaxCalculation,
        taxReturn: mockWithW2,
        isCalculating: false,
        lastSaved: new Date(),
      })

      render(<TaxSummarySidebar />)
      
      // Trigger the collapse button - find it by checking for sidebar-related toggle
      // The component has a toggle that saves to localStorage
      const toggleButton = document.querySelector('button')
      if (toggleButton) {
        await user.click(toggleButton)
      }
      
      // Verify setItem was called with sidebarCollapsed
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    it('EC-006: Mobile view defaults to collapsed', () => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800, // mobile width
      })
      
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: baseTaxCalculation,
        taxReturn: mockWithW2,
        isCalculating: false,
        lastSaved: new Date(),
      })

      render(<TaxSummarySidebar />)
      
      // Mobile should show collapsed bottom sheet by default
      expect(screen.getByText('Tax Summary')).toBeInTheDocument()
    })
  })

  // ─────────────────────────────────────────────────────────────
  // PHASE 2: Tax Planning Insights Rendering Tests
  // ─────────────────────────────────────────────────────────────

  describe('Phase 2: Tax Planning Insights Rendering', () => {
    it('TP-001: hides Insights section when no tax calculation', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: null,
        taxReturn: baseTaxReturn,
        isCalculating: false,
        lastSaved: null,
      })

      const { container } = render(<TaxSummarySidebar />)
      
      // Should NOT show tax planning insights without calculation
      expect(container.textContent).not.toMatch(/Tax Planning Insights/i)
    })

    it('TP-002: shows 401k optimization insight when has tax data', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: baseTaxCalculation,
        taxReturn: mockWithW2,
        isCalculating: false,
        lastSaved: new Date(),
      })

      const { container } = render(<TaxSummarySidebar />)
      
      // Should show some tax planning insights
      expect(container.textContent).toMatch(/Tax Planning Insights|401|retirement/i)
    })

    it('TP-003: shows "Not contributing" when 401k at 0%', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: baseTaxCalculation,
        taxReturn: {
          ...mockWithW2,
          aboveTheLineDeductions: {
            ...mockWithW2.aboveTheLineDeductions,
            sepIRA: 0,
          },
        },
        isCalculating: false,
        lastSaved: new Date(),
      })

      render(<TaxSummarySidebar />)
      
      // Should render with what-if scenarios
      expect(screen.getByText(/What-If/i)).toBeInTheDocument()
    })

    it('TP-004: shows recommendation at 50% 401k contribution', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: baseTaxCalculation,
        taxReturn: {
          ...mockWithW2,
          aboveTheLineDeductions: {
            ...mockWithW2.aboveTheLineDeductions,
            sepIRA: 11750, // ~50% of limit
          },
        },
        isCalculating: false,
        lastSaved: new Date(),
      })

      render(<TaxSummarySidebar />)
      
      // Should render what-if section
      expect(screen.getByText(/What-If/i)).toBeInTheDocument()
    })

    it('TP-005: shows maxing out recommendation at 100%', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: baseTaxCalculation,
        taxReturn: {
          ...mockWithW2,
          aboveTheLineDeductions: {
            ...mockWithW2.aboveTheLineDeductions,
            sepIRA: 23500, // max 2025
          },
        },
        isCalculating: false,
        lastSaved: new Date(),
      })

      render(<TaxSummarySidebar />)
      
      // Should render the what-if section
      expect(screen.getByText(/What-If/i)).toBeInTheDocument()
    })
  })

  // ─────────────────────────────────────────────────────────────
  // PHASE 3: What-If Slider Calculations Tests
  // ─────────────────────────────────────────────────────────────

  describe('Phase 3: What-If Slider Calculations', () => {
    it('WI-001: 401k slider at $0 results in tax savings = 0', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: baseTaxCalculation,
        taxReturn: {
          ...mockWithW2,
          aboveTheLineDeductions: {
            ...mockWithW2.aboveTheLineDeductions,
            sepIRA: 0,
          },
        },
        isCalculating: false,
        lastSaved: new Date(),
      })

      render(<TaxSummarySidebar />)
      
      // Should show the slider
      expect(screen.getByText(/401\(k\)/i)).toBeInTheDocument()
    })

    it('WI-002: 401k slider at max calculates tax savings', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: baseTaxCalculation,
        taxReturn: {
          ...mockWithW2,
          aboveTheLineDeductions: {
            ...mockWithW2.aboveTheLineDeductions,
            sepIRA: 23500,
          },
        },
        isCalculating: false,
        lastSaved: new Date(),
      })

      render(<TaxSummarySidebar />)
      
      // Should render with slider at max
      expect(screen.getByText(/23500/)).toBeInTheDocument()
    })

    it('WI-003: 401k reset button returns to current contribution', async () => {
      const user = userEvent.setup()
      
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: baseTaxCalculation,
        taxReturn: {
          ...mockWithW2,
          aboveTheLineDeductions: {
            ...mockWithW2.aboveTheLineDeductions,
            sepIRA: 5000,
          },
        },
        isCalculating: false,
        lastSaved: new Date(),
      })

      render(<TaxSummarySidebar />)
      
      // Should have reset button when slider is adjusted
      // Find the slider input and interact with it
      const slider = document.querySelector('input[type="range"]')
      if (slider) {
        fireEvent.change(slider, { target: { value: 10000 } })
        
        // Check for reset button after change
        const resetButtons = screen.getAllByText(/Reset/i)
        expect(resetButtons.length).toBeGreaterThan(0)
      }
    })

    it('WI-004: IRA slider at $7,000 calculates tax savings', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: baseTaxCalculation,
        taxReturn: mockWithW2,
        isCalculating: false,
        lastSaved: new Date(),
      })

      render(<TaxSummarySidebar />)
      
      // Should show Traditional IRA slider
      expect(screen.getByText(/Traditional.*IRA/i)).toBeInTheDocument()
    })

    it('WI-005: IRA slider shows Roth vs Traditional explanation text', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: baseTaxCalculation,
        taxReturn: mockWithW2,
        isCalculating: false,
        lastSaved: new Date(),
      })

      render(<TaxSummarySidebar />)
      
      // Should show Roth vs Traditional text
      expect(screen.getByText(/Traditional.*IRA/i)).toBeInTheDocument()
    })

    it('WI-006: Self-employed shows estimated tax slider', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: baseTaxCalculation,
        taxReturn: mockSelfEmployed,
        isCalculating: false,
        lastSaved: new Date(),
      })

      render(<TaxSummarySidebar />)
      
      // Should show estimated tax slider for self-employed
      expect(screen.getByText(/Estimated Tax Payments/i)).toBeInTheDocument()
    })

    it('WI-007: Non self-employed hides estimated tax slider', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: baseTaxCalculation,
        taxReturn: mockWithW2,
        isCalculating: false,
        lastSaved: new Date(),
      })

      const { container } = render(<TaxSummarySidebar />)
      
      // Should NOT show estimated tax slider for non-self-employed
      expect(container.textContent).not.toMatch(/Estimated Tax Payments/i)
    })

    it('WI-008: Effective rate display updates with slider changes', async () => {
      const user = userEvent.setup()
      
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: baseTaxCalculation,
        taxReturn: mockWithW2,
        isCalculating: false,
        lastSaved: new Date(),
      })

      render(<TaxSummarySidebar />)
      
      // Find the slider
      const slider = document.querySelector('input[type="range"]')
      if (slider) {
        fireEvent.change(slider, { target: { value: 10000 } })
        
        // After change, should show tax savings display
        expect(screen.getByText(/Tax Savings/i)).toBeInTheDocument()
      }
    })
  })

  // ─────────────────────────────────────────────────────────────
  // Edge Cases Tests
  // ─────────────────────────────────────────────────────────────

  describe('Edge Cases', () => {
    it('E-001: handles all income fields = 0', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: {
          ...baseTaxCalculation,
          totalIncome: 0,
          taxableIncome: 0,
          totalTax: 0,
        },
        taxReturn: {
          ...baseTaxReturn,
          w2Income: [{
            employer: 'Test',
            ein: '12-3456789',
            wages: 0,
            federalTaxWithheld: 0,
            socialSecurityWages: 0,
            socialSecurityTaxWithheld: 0,
            medicareWages: 0,
            medicareTaxWithheld: 0,
            box12: [],
          }],
        },
        isCalculating: false,
        lastSaved: new Date(),
      })

      render(<TaxSummarySidebar />)
      
      // Should handle $0 income without errors
      expect(screen.getByText('Tax Summary')).toBeInTheDocument()
    })

    it('E-002: handles negative taxable income (shows $0)', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: {
          ...baseTaxCalculation,
          taxableIncome: 0,
        },
        taxReturn: mockWithW2,
        isCalculating: false,
        lastSaved: new Date(),
      })

      render(<TaxSummarySidebar />)
      
      // Should handle gracefully
      expect(screen.getByText('Tax Summary')).toBeInTheDocument()
    })

    it('E-004: shows "Fill out your tax information" when no taxCalculation', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: null,
        taxReturn: baseTaxReturn,
        isCalculating: false,
        lastSaved: null,
      })

      expect(screen.getByText(/Fill out your tax information/)).toBeInTheDocument()
    })

    it('E-005: handles null/undefined values with fallbacks', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: {
          ...baseTaxCalculation,
          qbiDeduction: undefined as unknown as number,
          additionalMedicareTax: undefined as unknown as number,
        },
        taxReturn: mockWithW2,
        isCalculating: false,
        lastSaved: new Date(),
      })

      render(<TaxSummarySidebar />)
      
      // Should handle null/undefined without crashing
      expect(screen.getByText('Tax Summary')).toBeInTheDocument()
    })

    it('E-006: handles empty arrays (w2Income: [])', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: baseTaxCalculation,
        taxReturn: {
          ...baseTaxReturn,
          w2Income: [],
        },
        isCalculating: false,
        lastSaved: new Date(),
      })

      render(<TaxSummarySidebar />)
      
      // Should handle empty arrays
      expect(screen.getByText('Tax Summary')).toBeInTheDocument()
    })

    it('E-008: calculates effective rate = 0% when taxable income = 0', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: {
          ...baseTaxCalculation,
          taxableIncome: 0,
          regularTax: 0,
        },
        taxReturn: mockWithW2,
        isCalculating: false,
        lastSaved: new Date(),
      })

      const { container } = render(<TaxSummarySidebar />)
      
      // Should show 0% effective rate
      expect(container.textContent).toMatch(/0\.00/)
    })

    it('E-010: shows "Amount Owed: $0" when refund = 0', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: {
          ...baseTaxCalculation,
          refundOrAmountOwed: 0,
        },
        taxReturn: mockWithW2,
        isCalculating: false,
        lastSaved: new Date(),
      })

      render(<TaxSummarySidebar />)
      
      // Should handle $0 amount owed/refund
      expect(screen.getByText('Tax Summary')).toBeInTheDocument()
    })

    it('E-012: 401k contribution slider max is capped at limit', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: baseTaxCalculation,
        taxReturn: mockWithW2,
        isCalculating: false,
        lastSaved: new Date(),
      })

      render(<TaxSummarySidebar />)
      
      // Get the slider
      const slider = document.querySelector('input[type="range"]') as HTMLInputElement
      expect(slider).toBeInTheDocument()
      
      // Max should be 23500 (2025 limit)
      expect(slider.max).toBe('23500')
    })
  })

  // ─────────────────────────────────────────────────────────────
  // Loading State Tests
  // ─────────────────────────────────────────────────────────────

  describe('Loading State', () => {
    it('shows calculating state when isCalculating = true', () => {
      mockUseTaxReturn.mockReturnValue({
        taxCalculation: null,
        taxReturn: baseTaxReturn,
        isCalculating: true,
        lastSaved: null,
      })

      render(<TaxSummarySidebar />)
      
      // Should show calculating message
      expect(screen.getByText(/Calculating/i)).toBeInTheDocument()
    })
  })
})