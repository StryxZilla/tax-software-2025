import { describe, it, expect } from 'vitest'
import { WizardStep, isStepOptional } from '../../types/tax-types'

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

/** A step is "passed" if completed OR skipped. */
function isStepPassed(
  stepId: WizardStep,
  completedSteps: Set<WizardStep>,
  skippedSteps: Set<WizardStep>,
): boolean {
  return completedSteps.has(stepId) || skippedSteps.has(stepId)
}

/** Returns whether a step at `index` is accessible given currentStep, completedSteps, and skippedSteps. */
function isStepAccessible(
  index: number,
  currentStep: WizardStep,
  completedSteps: Set<WizardStep>,
  skippedSteps: Set<WizardStep> = new Set(),
): boolean {
  const step = STEP_ORDER[index]
  const isActive = step === currentStep
  const isCompleted = completedSteps.has(step)
  const isSkipped = skippedSteps.has(step) && !isCompleted
  const prevPassed = index > 0 && isStepPassed(STEP_ORDER[index - 1], completedSteps, skippedSteps)
  return isActive || isCompleted || isSkipped || prevPassed
}

describe('Wizard step accessibility', () => {
  it('first step is accessible when no steps completed (initial state)', () => {
    expect(isStepAccessible(0, 'personal-info', new Set())).toBe(true)
  })

  it('second step is not accessible when no steps are completed', () => {
    expect(isStepAccessible(1, 'personal-info', new Set())).toBe(false)
  })

  it('completed steps remain accessible after navigating back', () => {
    const completed = new Set<WizardStep>([
      'personal-info',
      'dependents',
      'income-w2',
      'income-interest',
    ])
    const currentStep: WizardStep = 'dependents'

    expect(isStepAccessible(0, currentStep, completed)).toBe(true)
    expect(isStepAccessible(1, currentStep, completed)).toBe(true)
    expect(isStepAccessible(2, currentStep, completed)).toBe(true)
    expect(isStepAccessible(3, currentStep, completed)).toBe(true)
    expect(isStepAccessible(4, currentStep, completed)).toBe(true)
    expect(isStepAccessible(5, currentStep, completed)).toBe(false)
    expect(isStepAccessible(6, currentStep, completed)).toBe(false)
  })

  it('never allows skipping into steps that were never completed', () => {
    const completed = new Set<WizardStep>(['personal-info', 'dependents'])
    const currentStep: WizardStep = 'personal-info'

    expect(isStepAccessible(3, currentStep, completed)).toBe(false)
    expect(isStepAccessible(10, currentStep, completed)).toBe(false)
  })

  it('editing a completed step does not lock navigation', () => {
    const completed = new Set<WizardStep>(STEP_ORDER.slice(0, -1))
    const currentStep: WizardStep = 'income-w2'

    for (let i = 0; i < STEP_ORDER.length - 1; i++) {
      expect(isStepAccessible(i, currentStep, completed)).toBe(true)
    }
    expect(isStepAccessible(10, currentStep, completed)).toBe(true)
  })

  it('marking a step completed unlocks the next step', () => {
    const completed = new Set<WizardStep>(['personal-info'])
    expect(isStepAccessible(1, 'dependents', completed)).toBe(true)
    expect(isStepAccessible(2, 'dependents', completed)).toBe(false)
  })
})

describe('Skipped (optional) step accessibility', () => {
  it('skipping a step unlocks the next step', () => {
    const completed = new Set<WizardStep>(['personal-info'])
    const skipped = new Set<WizardStep>(['dependents'])

    // dependents is skipped → income-w2 should be accessible
    expect(isStepAccessible(2, 'income-w2', completed, skipped)).toBe(true)
  })

  it('skipped steps remain accessible (revisitable)', () => {
    const completed = new Set<WizardStep>(['personal-info'])
    const skipped = new Set<WizardStep>(['dependents'])

    expect(isStepAccessible(1, 'income-w2', completed, skipped)).toBe(true)
  })

  it('multiple consecutive skipped steps all unlock forward progress', () => {
    const completed = new Set<WizardStep>(['personal-info'])
    const skipped = new Set<WizardStep>(['dependents', 'income-w2', 'income-interest'])

    // Should be able to reach income-capital-gains (index 4)
    expect(isStepAccessible(4, 'income-capital-gains', completed, skipped)).toBe(true)
    // But not income-self-employment (index 5) since capital-gains isn't passed
    expect(isStepAccessible(5, 'income-capital-gains', completed, skipped)).toBe(false)
  })

  it('completing a previously skipped step is treated as completed', () => {
    // User skipped dependents, then went back and completed it
    const completed = new Set<WizardStep>(['personal-info', 'dependents'])
    const skipped = new Set<WizardStep>(['dependents']) // still in skipped set

    // isStepAccessible treats completed as higher priority (isSkipped = skipped && !completed)
    expect(isStepAccessible(1, 'income-w2', completed, skipped)).toBe(true)
    expect(isStepAccessible(2, 'income-w2', completed, skipped)).toBe(true)
  })

  it('skipping does not bypass locked future steps', () => {
    const completed = new Set<WizardStep>(['personal-info'])
    const skipped = new Set<WizardStep>(['dependents'])

    // income-rental (index 6) should still be locked
    expect(isStepAccessible(6, 'income-w2', completed, skipped)).toBe(false)
  })
})

describe('Step optionality metadata', () => {
  it('personal-info is required', () => {
    expect(isStepOptional('personal-info')).toBe(false)
  })

  it('review is required', () => {
    expect(isStepOptional('review')).toBe(false)
  })

  it('dependents is optional', () => {
    expect(isStepOptional('dependents')).toBe(true)
  })

  it('all income steps are optional', () => {
    expect(isStepOptional('income-w2')).toBe(true)
    expect(isStepOptional('income-interest')).toBe(true)
    expect(isStepOptional('income-capital-gains')).toBe(true)
    expect(isStepOptional('income-self-employment')).toBe(true)
    expect(isStepOptional('income-rental')).toBe(true)
  })

  it('deductions and credits are optional', () => {
    expect(isStepOptional('deductions')).toBe(true)
    expect(isStepOptional('credits')).toBe(true)
  })

  it('retirement-accounts is optional', () => {
    expect(isStepOptional('retirement-accounts')).toBe(true)
  })
})
