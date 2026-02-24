/**
 * Regression test: Save button must always be visible and clickable.
 * Bug: "save button is not visible" — no explicit save CTA existed.
 */
import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import SaveStatusIndicator from '@/components/common/SaveStatusIndicator'

function render(props: Record<string, unknown>): string {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(SaveStatusIndicator, props as any)
  )
}

describe('SaveStatusIndicator — save button visibility', () => {
  const onSave = () => vi.fn().mockResolvedValue(undefined)

  it('renders a visible save button with data-testid="save-button"', () => {
    const html = render({ lastSaved: null, onSave: onSave() })
    expect(html).toContain('data-testid="save-button"')
    expect(html).toContain('Save')
  })

  it('renders save button even when lastSaved is null (first visit)', () => {
    const html = render({ lastSaved: null, onSave: onSave() })
    expect(html).toContain('save-button')
  })

  it('renders save button alongside saved status when lastSaved is set', () => {
    const html = render({ lastSaved: new Date(), onSave: onSave() })
    expect(html).toContain('save-button')
    expect(html).toContain('Saved')
  })

  it('save button is not disabled under normal conditions', () => {
    const html = render({ lastSaved: null, onSave: onSave() })
    // Should NOT have disabled attribute on the save button
    expect(html).not.toMatch(/data-testid="save-button"[^>]*disabled/)
  })

  it('save button shows disabled state when isCalculating', () => {
    const html = render({ lastSaved: null, isCalculating: true, onSave: onSave() })
    expect(html).toContain('save-button')
    expect(html).toContain('disabled')
  })
})
