import React from 'react'
import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import CurrencyInput from '../../components/common/CurrencyInput'

describe('CurrencyInput invariants', () => {
  it('renders with currency-input wrapper class', () => {
    const html = renderToString(<CurrencyInput placeholder="0.00" />)
    expect(html).toContain('currency-input')
  })

  it('renders with currency-input-prefix class on $ span', () => {
    const html = renderToString(<CurrencyInput placeholder="0.00" />)
    expect(html).toContain('currency-input-prefix')
    expect(html).toContain('$')
  })

  it('input has pl-8 spacing class for prefix clearance', () => {
    const html = renderToString(<CurrencyInput placeholder="0.00" />)
    expect(html).toContain('pl-8')
  })

  it('renders as type="number"', () => {
    const html = renderToString(<CurrencyInput />)
    expect(html).toContain('type="number"')
  })

  it('applies error styling when hasError is true', () => {
    const html = renderToString(<CurrencyInput hasError />)
    expect(html).toContain('border-red-300')
  })

  it('applies normal styling when hasError is false', () => {
    const html = renderToString(<CurrencyInput hasError={false} />)
    expect(html).toContain('border-slate-300')
  })
})
