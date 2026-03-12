import { test, expect } from './fixtures'
import { startReturnButton, nextButton } from './selectors'

test('app smoke: root redirect/auth pages/basic nav @critical-smoke', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveURL(/\/auth\/login/)
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Create one free' })).toHaveAttribute('href', '/auth/register')
})

test('critical user journey: sign in and progress wizard to review @critical-smoke', async ({ page }) => {
  await page.goto('/auth/login')
  await page.getByPlaceholder('you@example.com').fill('john.sample@testmail.com')
  await page.getByPlaceholder('••••••••').first().fill('testpassword123')
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page).toHaveURL('/', { timeout: 15000 })
  await expect(page.getByText("Welcome to", { exact: false })).toBeVisible({ timeout: 10000 })

  await startReturnButton(page).click()
  await expect(page.getByRole('heading', { name: 'Personal Information' })).toBeVisible()

  await page.getByPlaceholder('Enter first name').fill('QA')
  await page.getByPlaceholder('Enter last name').fill('User')
  await page.getByPlaceholder('XXX-XX-XXXX').first().fill('123-45-6789')
  await page.getByPlaceholder('Your age').fill('30')
  await page.getByPlaceholder('123 Main Street').fill('123 Main St')
  await page.getByPlaceholder('City name').fill('Austin')
  await page.getByPlaceholder('TX').fill('TX')
  await page.getByPlaceholder('12345').fill('73301')

  for (let i = 0; i < 12; i += 1) {
    const next = nextButton(page)
    if (!(await next.isVisible().catch(() => false))) break
    if (!(await next.isEnabled())) break
    await next.click()
    await page.waitForTimeout(300)
  }

  // On the review page, look for the Tax Summary heading
  await expect(page.getByRole('heading', { name: "Tax Summary" })).toBeVisible({ timeout: 10000 })
})
