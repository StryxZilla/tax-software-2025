import { describe, it, expect, beforeEach, vi } from 'vitest'
import { detectSavedDraft, type SavedDraftInfo } from '../../components/wizard/WelcomeScreen'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

describe('detectSavedDraft', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  it('returns null when no saved data exists', () => {
    expect(detectSavedDraft()).toBeNull()
  })

  it('returns null when currentStep is welcome', () => {
    localStorageMock.setItem('taxReturn2025', JSON.stringify({ personalInfo: { firstName: 'John' }, w2Income: [] }))
    localStorageMock.setItem('currentStep', 'welcome')
    expect(detectSavedDraft()).toBeNull()
  })

  it('returns null when data has no meaningful content', () => {
    localStorageMock.setItem('taxReturn2025', JSON.stringify({ personalInfo: { firstName: '' }, w2Income: [] }))
    localStorageMock.setItem('currentStep', 'income-w2')
    expect(detectSavedDraft()).toBeNull()
  })

  it('detects draft when user has entered a name', () => {
    localStorageMock.setItem('taxReturn2025', JSON.stringify({
      personalInfo: { firstName: 'Jane' },
      w2Income: [],
    }))
    localStorageMock.setItem('currentStep', 'dependents')
    localStorageMock.setItem('completedSteps', JSON.stringify(['personal-info']))

    const draft = detectSavedDraft()
    expect(draft).not.toBeNull()
    expect(draft!.currentStep).toBe('dependents')
    expect(draft!.completedCount).toBe(1)
    expect(draft!.hasData).toBe(true)
  })

  it('detects draft when user has W-2 income', () => {
    localStorageMock.setItem('taxReturn2025', JSON.stringify({
      personalInfo: { firstName: '' },
      w2Income: [{ employer: 'Acme', wages: 50000 }],
    }))
    localStorageMock.setItem('currentStep', 'income-interest')
    localStorageMock.setItem('completedSteps', JSON.stringify(['personal-info', 'dependents', 'income-w2']))

    const draft = detectSavedDraft()
    expect(draft).not.toBeNull()
    expect(draft!.completedCount).toBe(3)
  })

  it('handles corrupted localStorage gracefully', () => {
    localStorageMock.setItem('taxReturn2025', '{invalid json')
    localStorageMock.setItem('currentStep', 'income-w2')
    expect(detectSavedDraft()).toBeNull()
  })

  it('handles missing completedSteps gracefully', () => {
    localStorageMock.setItem('taxReturn2025', JSON.stringify({
      personalInfo: { firstName: 'Test' },
      w2Income: [],
    }))
    localStorageMock.setItem('currentStep', 'dependents')
    // No completedSteps set
    const draft = detectSavedDraft()
    expect(draft).not.toBeNull()
    expect(draft!.completedCount).toBe(0)
  })
})

describe('autosave localStorage keys', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  it('persists and restores step, completed, and skipped sets', () => {
    // Simulate what TaxReturnContext.saveToLocalStorage does
    const taxData = { personalInfo: { firstName: 'Andy' }, w2Income: [{ wages: 100000 }] }
    const step = 'income-capital-gains'
    const completed = ['personal-info', 'dependents', 'income-w2', 'income-interest']
    const skipped = ['dependents']

    localStorageMock.setItem('taxReturn2025', JSON.stringify(taxData))
    localStorageMock.setItem('currentStep', step)
    localStorageMock.setItem('completedSteps', JSON.stringify(completed))
    localStorageMock.setItem('skippedSteps', JSON.stringify(skipped))

    // Restore
    expect(JSON.parse(localStorageMock.getItem('taxReturn2025')!)).toEqual(taxData)
    expect(localStorageMock.getItem('currentStep')).toBe(step)
    expect(JSON.parse(localStorageMock.getItem('completedSteps')!)).toEqual(completed)
    expect(JSON.parse(localStorageMock.getItem('skippedSteps')!)).toEqual(skipped)
  })

  it('clearing localStorage removes all tax keys', () => {
    localStorageMock.setItem('taxReturn2025', '{}')
    localStorageMock.setItem('currentStep', 'review')
    localStorageMock.setItem('completedSteps', '[]')
    localStorageMock.setItem('skippedSteps', '[]')

    // Simulate resetTaxReturn clearing
    localStorageMock.removeItem('taxReturn2025')
    localStorageMock.removeItem('currentStep')
    localStorageMock.removeItem('completedSteps')
    localStorageMock.removeItem('skippedSteps')

    expect(localStorageMock.getItem('taxReturn2025')).toBeNull()
    expect(detectSavedDraft()).toBeNull()
  })
})
