import { test as base, expect } from '@playwright/test'

const ALLOWED_CONSOLE_PATTERNS: RegExp[] = [
  /Download the React DevTools/i,
]

export const test = base.extend<{
  runtimeErrors: string[]
}>({
  runtimeErrors: async ({ page }, useRuntimeErrors) => {
    const runtimeErrors: string[] = []

    page.on('pageerror', (error) => {
      runtimeErrors.push(`[pageerror] ${error.message}`)
    })

    page.on('console', (msg) => {
      if (msg.type() !== 'error') return
      const text = msg.text()
      if (ALLOWED_CONSOLE_PATTERNS.some((pattern) => pattern.test(text))) return
      runtimeErrors.push(`[console.error] ${text}`)
    })

    await useRuntimeErrors(runtimeErrors)

    expect.soft(runtimeErrors, runtimeErrors.join('\n')).toEqual([])
  },
})

export { expect }
