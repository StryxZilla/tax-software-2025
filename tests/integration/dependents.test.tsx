/**
 * Integration tests: DependentsForm — add/remove dependents, validation.
 * @vitest-environment happy-dom
 */
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@testing-library/react'
import DependentsForm from '../../components/forms/DependentsForm'
import { VALID_DEPENDENT } from './helpers'
import type { Dependent } from '../../types/tax-types'

function renderForm(
  values: Dependent[] = [],
  onChange = vi.fn(),
  onValidationChange = vi.fn(),
) {
  return render(
    <DependentsForm
      values={values}
      onChange={onChange}
      onValidationChange={onValidationChange}
    />,
  )
}

describe('DependentsForm — empty state', () => {
  it('shows empty state message', () => {
    renderForm()
    expect(screen.getByText(/No Dependents Added Yet/i)).toBeInTheDocument()
  })

  it('shows Add Your First Dependent button', () => {
    renderForm()
    expect(screen.getByRole('button', { name: /Add.*First Dependent/i })).toBeInTheDocument()
  })

  it('reports valid when no dependents (optional step)', () => {
    const onValidationChange = vi.fn()
    renderForm([], vi.fn(), onValidationChange)
    expect(onValidationChange).toHaveBeenCalledWith(true)
  })
})

describe('DependentsForm — adding dependents', () => {
  it('calls onChange with new blank dependent when Add is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderForm([], onChange)

    await user.click(screen.getByRole('button', { name: /Add.*First Dependent/i }))
    expect(onChange).toHaveBeenCalledOnce()
    const newDeps = onChange.mock.calls[0][0]
    expect(newDeps).toHaveLength(1)
    expect(newDeps[0].firstName).toBe('')
  })

  it('renders dependent card with fields when one exists', () => {
    renderForm([VALID_DEPENDENT])
    expect(screen.getByText(/Dependent #1/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue('Jimmy')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument()
  })

  it('shows CTC eligibility badge for qualifying child', () => {
    renderForm([VALID_DEPENDENT])
    expect(screen.getByText(/Qualifies for Child Tax Credit/i)).toBeInTheDocument()
  })
})

describe('DependentsForm — removing dependents', () => {
  it('calls onChange without the removed dependent', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const deps = [VALID_DEPENDENT, { ...VALID_DEPENDENT, firstName: 'Sally' }]
    renderForm(deps, onChange)

    // Click first remove button
    const removeButtons = screen.getAllByRole('button', { name: /Remove dependent/i })
    await user.click(removeButtons[0])

    expect(onChange).toHaveBeenCalledOnce()
    const result = onChange.mock.calls[0][0]
    expect(result).toHaveLength(1)
    expect(result[0].firstName).toBe('Sally')
  })
})

describe('DependentsForm — editing', () => {
  it('calls onChange with updated first name', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const dep = { ...VALID_DEPENDENT, firstName: '' }
    renderForm([dep], onChange)

    const firstNameInput = screen.getByPlaceholderText('First name')
    await user.type(firstNameInput, 'A')
    expect(onChange).toHaveBeenCalled()
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0]
    expect(lastCall[0].firstName).toBe('A')
  })
})
