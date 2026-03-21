import { test, expect } from './fixtures'
import path from 'node:path'
import fs from 'node:fs/promises'
import { startReturnButton, nextButton } from './selectors'

const stamp = new Date().toISOString().replace(/[.:]/g, '-')
const screenshotDir = path.join(process.cwd(), 'artifacts', 'ui-debug', 'screenshots', stamp)

test.describe('UI debug kit screenshots @ui-screenshot', () => {
  test.beforeAll(async () => {
    await fs.mkdir(screenshotDir, { recursive: true })
  })

  test('capture key auth + overview screens', async ({ page }) => {
    await page.goto('/auth/login', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
    await page.screenshot({ path: path.join(screenshotDir, '01-login.png'), fullPage: true })

    await page.goto('/auth/register', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()
    await page.screenshot({ path: path.join(screenshotDir, '02-register.png'), fullPage: true })

    const unique = Date.now()
    const email = `ui-shot+${unique}@example.com`
    const password = `UiShot!${unique}`

    await page.getByPlaceholder('Jane Smith').fill('UI Shot')
    await page.getByPlaceholder('you@example.com').fill(email)
    await page.getByPlaceholder('Min. 8 characters').fill(password)
    await page.getByPlaceholder('••••••••').last().fill(password)
    await page.getByRole('button', { name: 'Create account' }).click()

    await expect(page).toHaveURL('/', { timeout: 15000 })
    await expect(page.getByRole('heading', { name: /Welcome to Zoey/i })).toBeVisible()
    await page.screenshot({ path: path.join(screenshotDir, '03-welcome.png'), fullPage: true })

    await expect(startReturnButton(page)).toBeVisible()
    await page.screenshot({ path: path.join(screenshotDir, '04-overview-start.png'), fullPage: true })
  })

  test('capture return-state overview after navigating back', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByPlaceholder('you@example.com').fill('john.sample@testmail.com')
    await page.getByPlaceholder('••••••••').first().fill('testpassword123')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page).toHaveURL('/', { timeout: 15000 })
    await startReturnButton(page).click()

    await page.getByPlaceholder('Enter first name').fill('Visual')
    await page.getByPlaceholder('Enter last name').fill('Check')
    await page.getByPlaceholder('XXX-XX-XXXX').first().fill('123-45-6789')
    await page.getByPlaceholder('Your age').fill('30')
    await page.getByPlaceholder('123 Main Street').fill('123 Main St')
    await page.getByPlaceholder('City name').fill('Austin')
    await page.getByPlaceholder('TX').fill('TX')
    await page.getByPlaceholder('12345').fill('73301')

    await nextButton(page).click()
    await expect(page.getByRole('heading', { name: /Dependents \(Schedule 8812\)/i })).toBeVisible()

    await page.getByRole('button', { name: /Back to Overview/i }).click()
    await expect(page).toHaveURL('/', { timeout: 10000 })

    const resumeButton = page.getByTestId('resume-draft-btn')
    const startButton = startReturnButton(page)
    await expect(resumeButton.or(startButton)).toBeVisible()

    await page.screenshot({ path: path.join(screenshotDir, '05-welcome-back.png'), fullPage: true })

    console.log(`Screenshots saved to: ${screenshotDir}`)
  })
})


