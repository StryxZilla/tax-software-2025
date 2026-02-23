import { describe, it, expect } from 'vitest'
import { WizardStep } from '../../types/tax-types'

/**
 * Pure-logic tests for wizard step accessibility rules.
 * Mirrors the logic in WizardNavigation.tsx without needing React rendering.
 */

const STEP_ORDER: WizardStep[] = [
  'personal-info',
  'dependents',
  'income-w2',
  'income-interest',
  'income-capital-gains',
  'income-self-employment',
  'income-rental',
  'retirement-accounts',
  'deductions',
  'credits',
  'review',
]

/** Returns whether a step at `index` is accessible given currentStep and completedSteps. */
function isStepAccessible(
  index: number,
  currentStep: WizardStep,
  completedSteps: Set<WizardStep>,
): boolean {
  const step = STEP_ORDER[index]
  const isActive = step === currentStep
  const isCompleted = completedSteps.has(step)
  const prevCompleted = index > 0 && completedSteps.has(STEP_ORDER[index - 1])
  return isActive || isCompleted || prevCompleted
}

describe('Wizard step accessibility', () => {
  it('first step is accessible when no steps completed (initial state)', () => {
    expect(isStepAccessible(0, 'personal-info', new Set())).toBe(true)
  })

  it('second step is not accessible when no steps are completed', () => {
    expect(isStepAccessible(1, 'personal-info', new Set())).toBe(false)
  })

  it('completed steps remain accessible after navigating back', () => {
    // User completed steps 0-4, now on step 1
    const completed = new Set<WizardStep>([
      'personal-info',
      'dependents',
      'income-w2',
      'income-interest',
    ])
    const currentStep: WizardStep = 'dependents'

    // All completed steps should be accessible
    expect(isStepAccessible(0, currentStep, completed)).toBe(true) // personal-info (completed)
    expect(isStepAccessible(1, currentStep, completed)).toBe(true) // dependents (active)
    expect(isStepAccessible(2, currentStep, completed)).toBe(true) // income-w2 (completed)
    expect(isStepAccessible(3, currentStep, completed)).toBe(true) // income-interest (completed)
    // Next uncompleted step after last completed should be accessible
    expect(isStepAccessible(4, currentStep, completed)).toBe(true) // income-capital-gains (prev completed)
    // Steps beyond that should NOT be accessible
    expect(isStepAccessible(5, currentStep, completed)).toBe(false)
    expect(isStepAccessible(6, currentStep, completed)).toBe(false)
  })

  it('never allows skipping into steps that were never completed', () => {
    const completed = new Set<WizardStep>(['personal-info', 'dependents'])
    const currentStep: WizardStep = 'personal-info'

    // Step 3 (income-interest) was never completed and prev not completed
    expect(isStepAccessible(3, currentStep, completed)).toBe(false)
    // Last step should not be accessible
    expect(isStepAccessible(10, currentStep, completed)).toBe(false)
  })

  it('editing a completed step does not lock navigation', () => {
    // User completed all steps, went back to step 2
    const completed = new Set<WizardStep>(STEP_ORDER.slice(0, -1)) // all except review
    const currentStep: WizardStep = 'income-w2'

    // All completed steps remain accessible
    for (let i = 0; i < STEP_ORDER.length - 1; i++) {
      expect(isStepAccessible(i, currentStep, completed)).toBe(true)
    }
    // Review (last step, not completed) should be accessible because prev is completed
    expect(isStepAccessible(10, currentStep, completed)).toBe(true)
  })

  it('marking a step completed unlocks the next step', () => {
    const completed = new Set<WizardStep>(['personal-info'])
    expect(isStepAccessible(1, 'dependents', completed)).toBe(true) // prev completed
    expect(isStepAccessible(2, 'dependents', completed)).toBe(false) // prev not completed
  })
})
