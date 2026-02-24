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

describe('SaveStatusIndicator rendered unconditionally in AppShell', () => {
  it('page.tsx always renders SaveStatusIndicator (not gated by isWelcome)', async () => {
    const { readFileSync } = await import('fs')
    const { resolve } = await import('path')
    const src = readFileSync(resolve(__dirname, '../../app/page.tsx'), 'utf-8')

    // SaveStatusIndicator must NOT be inside a `!isWelcome &&` conditional
    // Regex: ensure SaveStatusIndicator appears outside any isWelcome guard
    expect(src).toContain('SaveStatusIndicator')

    // The old broken pattern: {!isWelcome && (...<SaveStatusIndicator...)
    // Ensure SaveStatusIndicator is NOT preceded by `!isWelcome &&` on nearby lines
    const lines = src.split('\n')
    const saveIdx = lines.findIndex(l => l.includes('SaveStatusIndicator'))
    expect(saveIdx).toBeGreaterThan(-1)

    // Check the 5 lines before SaveStatusIndicator for `!isWelcome &&` guard
    const preceding = lines.slice(Math.max(0, saveIdx - 5), saveIdx).join('\n')
    expect(preceding).not.toMatch(/!isWelcome\s*&&/)
  })

  it('page.tsx header uses ZoeyImage (not raw <img>) for mascot', async () => {
    const { readFileSync } = await import('fs')
    const { resolve } = await import('path')
    const src = readFileSync(resolve(__dirname, '../../app/page.tsx'), 'utf-8')

    // Should import ZoeyImage
    expect(src).toMatch(/import\s+ZoeyImage\s+from/)

    // The header mascot should use <ZoeyImage not <img for zoey-neutral
    expect(src).toContain('<ZoeyImage src="/brand/zoey-neutral.png"')
    // Should NOT have a raw <img> with zoey src
    expect(src).not.toMatch(/<img[^>]*zoey-neutral/)
  })
})
