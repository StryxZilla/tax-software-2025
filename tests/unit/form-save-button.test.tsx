/**
 * Regression test: Save button must be visible in-form (FormNavigation),
 * not just in the header. Bug: users couldn't find save CTA.
 */
import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import FormNavigation from '@/components/common/FormNavigation'

function render(props: Record<string, unknown>): string {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(FormNavigation, props as any)
  )
}

describe('FormNavigation — in-form save button', () => {
  const onSave = vi.fn().mockResolvedValue(undefined)

  it('renders save button with data-testid="form-save-button" when onSave provided', () => {
    const html = render({ currentStep: 'personal-info', onSave })
    expect(html).toContain('data-testid="form-save-button"')
    expect(html).toContain('Save progress')
  })

  it('does NOT render save row when onSave is omitted (backward compat)', () => {
    const html = render({ currentStep: 'personal-info' })
    expect(html).not.toContain('form-save-button')
    expect(html).not.toContain('form-save-row')
  })

  it('shows saving state when isSaving is true', () => {
    const html = render({ currentStep: 'personal-info', onSave, isSaving: true })
    expect(html).toContain('Saving')
    expect(html).toContain('disabled')
  })

  it('shows "Saved" timestamp when lastSaved is set', () => {
    const html = render({ currentStep: 'personal-info', onSave, lastSaved: new Date() })
    expect(html).toContain('Saved')
    expect(html).toContain('form-save-button')
  })

  it('save button visible on every wizard step', () => {
    for (const step of ['personal-info', 'income-w2', 'deductions', 'review']) {
      const html = render({ currentStep: step, onSave })
      expect(html).toContain('form-save-button')
    }
  })
})

describe('FormNavigation — page.tsx wires onSave to all steps', () => {
  it('every FormNavigation in page.tsx includes onSave={handleSave}', async () => {
    const { readFileSync } = await import('fs')
    const { resolve } = await import('path')
    const src = readFileSync(resolve(__dirname, '../../app/page.tsx'), 'utf-8')

    const formNavCount = (src.match(/<FormNavigation/g) || []).length
    const onSaveCount = (src.match(/onSave=\{handleSave\}/g) || []).length

    expect(formNavCount).toBeGreaterThan(0)
    expect(onSaveCount).toBe(formNavCount)
  })
})
