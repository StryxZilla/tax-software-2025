/**
 * Regression tests: ZoeyImage render-loop safety.
 * @vitest-environment happy-dom
 */
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ZoeyImage from '../../components/brand/ZoeyImage'

describe('ZoeyImage render loop regression', () => {
  it('renders with default fallback chain without hitting maximum update depth', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<ZoeyImage src="/brand/zoey-pointing.png" alt="Zoey" data-testid="zoey" />)

    expect(screen.getByTestId('zoey')).toBeTruthy()
    expect(errorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('Maximum update depth exceeded'),
    )

    errorSpy.mockRestore()
  })

  it('remains stable across rerenders when fallbackChain prop is omitted', () => {
    const { rerender } = render(
      <ZoeyImage src="/brand/zoey-pointing.png" alt="Zoey" data-testid="zoey" />,
    )

    rerender(<ZoeyImage src="/brand/zoey-pointing.png" alt="Zoey" data-testid="zoey" />)
    rerender(<ZoeyImage src="/brand/zoey-pointing.png" alt="Zoey" data-testid="zoey" />)

    expect(screen.getByTestId('zoey').getAttribute('src')).toBe('/brand/zoey-pointing.png')
  })
})
