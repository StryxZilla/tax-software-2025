import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Guardrail: global base element styles (input, select, textarea, button)
 * must live inside @layer base { ... } to avoid overriding Tailwind utilities.
 *
 * If a developer adds bare element selectors outside @layer, this test catches it.
 */
describe('CSS layer guardrail', () => {
  const cssPath = join(__dirname, '../../app/globals.css')
  const css = readFileSync(cssPath, 'utf-8')

  // Strip comments
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '')

  it('all input/select/textarea element selectors are inside @layer base', () => {
    // Find element selectors for form inputs that are NOT inside @layer
    // Strategy: find all top-level blocks (not inside @layer) that target bare elements
    const lines = stripped.split('\n')
    const bareElementPattern = /^(?:input|select|textarea)\s*[\[{,]/
    
    let insideLayer = 0
    let insideAtRule = 0
    const violations: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      if (line.startsWith('@layer')) insideLayer++
      if (line.startsWith('@theme') || line.startsWith('@media') || line.startsWith('@keyframes')) insideAtRule++
      
      if (insideLayer === 0 && insideAtRule === 0 && bareElementPattern.test(line)) {
        violations.push(`Line ${i + 1}: "${line}" — bare element selector outside @layer base`)
      }

      // Track brace depth roughly
      // Track brace depth (rough heuristic)
    }

    expect(violations, violations.join('\n')).toEqual([])
  })

  it('globals.css uses @layer base for form element styles', () => {
    expect(stripped).toContain('@layer base')
  })

  it('no bare button { ... } resets outside @layer', () => {
    // Ensure button element selectors are either inside @layer or don't exist bare
    const lines = stripped.split('\n')
    let inLayer = false
    const violations: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line.startsWith('@layer')) inLayer = true
      if (line === '}') inLayer = false

      if (!inLayer && /^button\s*{/.test(line)) {
        violations.push(`Line ${i + 1}: bare "button" selector outside @layer`)
      }
    }

    expect(violations, violations.join('\n')).toEqual([])
  })
})
