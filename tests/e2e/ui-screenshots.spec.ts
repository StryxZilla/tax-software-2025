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

    const zoeyImg = page.locator('img[alt="Zoey mascot"]').first()
    await expect(zoeyImg).toBeVisible()
    await expect(zoeyImg).toHaveAttribute('src', /zoey-celebrate\.png/)
    await expect.poll(async () => {
      return await zoeyImg.evaluate((img) => (img as HTMLImageElement).naturalWidth)
    }).toBeGreaterThan(0)

    await page.screenshot({ path: path.join(screenshotDir, '01-login.png'), fullPage: true })
    console.log(`Screenshots saved to: ${screenshotDir}`)
  })
})
