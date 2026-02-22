import { test, expect } from './fixtures'

test('app smoke: root redirect/auth pages/basic nav @critical-smoke', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveURL(/\/auth\/login/)
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()

  await page.getByRole('link', { name: 'Create one free' }).click()
  await expect(page).toHaveURL(/\/auth\/register/)
  await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()

  await page.getByRole('link', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/auth\/login/)
})

test('critical user journey: register and progress wizard to review @critical-smoke', async ({ page }) => {
  const unique = Date.now()
  const email = `qa+${unique}@example.com`
  const password = `TaxQa!${unique}`

  await page.goto('/auth/register')
  await page.getByPlaceholder('Jane Smith').fill('QA User')
  await page.getByPlaceholder('you@example.com').fill(email)
  await page.getByPlaceholder('Min. 8 characters').fill(password)
  await page.getByPlaceholder('••••••••').last().fill(password)
  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page).toHaveURL('/', { timeout: 15000 })
  await expect(page.getByText("Welcome to", { exact: false })).toBeVisible({ timeout: 10000 })

  await page.getByRole('button', { name: "Let's Get Started" }).first().click()
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
    const nextButton = page.getByRole('button', { name: 'Next →' })
    if (!(await nextButton.isVisible().catch(() => false))) break
    if (!(await nextButton.isEnabled())) break
    await nextButton.click()
    await page.waitForTimeout(300)
  }

  await expect(page.getByRole('heading', { name: "Zoey's Return Summary" })).toBeVisible({ timeout: 10000 })
})
