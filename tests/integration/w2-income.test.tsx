/**
 * Integration tests: W2Form — add/remove W-2s, field entry, validation.
 * @vitest-environment happy-dom
 */
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@testing-library/react'
import W2Form from '../../components/forms/W2Form'
import { VALID_W2 } from './helpers'
import type { W2Income } from '../../types/tax-types'

// Mock OCR modules that aren't needed in integration tests
vi.mock('../../lib/ocr/extractors/w2-extractor', () => ({
  extractW2Data: vi.fn(),
}))
vi.mock('../../components/ocr/DocumentUpload', () => ({
  default: () => <div data-testid="mock-doc-upload">Upload Mock</div>,
}))

function renderForm(
  values: W2Income[] = [],
  onChange = vi.fn(),
  onValidationChange = vi.fn(),
) {
  return render(
    <W2Form
      values={values}
      onChange={onChange}
      onValidationChange={onValidationChange}
    />,
  )
}

describe('W2Form — empty state', () => {
  it('shows empty state message', () => {
    renderForm()
    expect(screen.getByText(/No W-2s Added Yet/i)).toBeInTheDocument()
  })

  it('has Add W-2 button in header', () => {
    renderForm()
    // There should be at least one Add W-2 button
    const buttons = screen.getAllByRole('button', { name: /Add W-2/i })
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })

  it('reports valid when no W-2s (optional step)', () => {
    const onValidationChange = vi.fn()
    renderForm([], vi.fn(), onValidationChange)
    expect(onValidationChange).toHaveBeenCalledWith(true)
  })
})

describe('W2Form — adding W-2', () => {
  it('calls onChange with new blank W-2 when Add is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderForm([], onChange)

    const addButtons = screen.getAllByRole('button', { name: /Add W-2/i })
    await user.click(addButtons[0])
    expect(onChange).toHaveBeenCalledOnce()
    const newW2s = onChange.mock.calls[0][0]
    expect(newW2s).toHaveLength(1)
    expect(newW2s[0].employer).toBe('')
    expect(newW2s[0].wages).toBe(0)
  })
})

describe('W2Form — displaying existing W-2', () => {
  it('renders W-2 card with employer name', () => {
    renderForm([VALID_W2])
    expect(screen.getByText(/W-2 #1/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue('Acme Corp')).toBeInTheDocument()
  })

  it('renders EIN field with value', () => {
    renderForm([VALID_W2])
    expect(screen.getByDisplayValue('12-3456789')).toBeInTheDocument()
  })
})

describe('W2Form — removing W-2', () => {
  it('calls onChange without the removed W-2', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const w2s = [VALID_W2, { ...VALID_W2, employer: 'Other Inc' }]
    renderForm(w2s, onChange)

    const removeButtons = screen.getAllByRole('button', { name: /Remove/i })
    await user.click(removeButtons[0])
    expect(onChange).toHaveBeenCalledOnce()
    expect(onChange.mock.calls[0][0]).toHaveLength(1)
    expect(onChange.mock.calls[0][0][0].employer).toBe('Other Inc')
  })
})

describe('W2Form — editing employer name', () => {
  it('calls onChange with updated employer', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const w2 = { ...VALID_W2, employer: '' }
    renderForm([w2], onChange)

    await user.type(screen.getByPlaceholderText('Company name'), 'X')
    expect(onChange).toHaveBeenCalled()
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0]
    expect(lastCall[0].employer).toBe('X')
  })
})
