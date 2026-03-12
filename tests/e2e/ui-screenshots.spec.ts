import { test, expect } from './fixtures'
import path from 'node:path'
import fs from 'node:fs/promises'

const stamp = new Date().toISOString().replace(/[.:]/g, '-')
const screenshotDir = path.join(process.cwd(), 'artifacts', 'ui-debug', 'screenshots', stamp)

test.describe('UI debug kit screenshots @ui-screenshot', () => {
  test.beforeAll(async () => {
    await fs.mkdir(screenshotDir, { recursive: true })
  })

  test('capture login screen', async ({ page }) => {
    await page.goto('/auth/login', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
    await page.screenshot({ path: path.join(screenshotDir, '01-login.png'), fullPage: true })
    console.log(`Screenshots saved to: ${screenshotDir}`)
  })
})
