import { test, expect } from './fixtures'
import { startReturnButton, nextButton } from './selectors'

async function expectStep(
  page: import('@playwright/test').Page,
  index: number,
  heading: string | RegExp,
  bubble: RegExp,
) {
  await expect(page.getByText(new RegExp(`Step ${index} of 11`, 'i'))).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: heading })).toBeVisible()
  await expect(page.locator('nav').first().getByRole('button', { name: bubble })).toBeVisible()
}

async function advance(page: import('@playwright/test').Page) {
  const next = nextButton(page)
  if (await next.isEnabled()) {
    await next.click()
    return
  }

  const skip = page.getByRole('button', { name: /Skip for now/i })
  await expect(skip).toBeVisible()
  await skip.click()
}

test('core wizard flow sweep: render/nav/validation/progress end-to-end @critical-smoke', async ({ page }) => {
  test.setTimeout(120_000)

  const unique = Date.now()
  const email = `coreflow+${unique}@example.com`
  const password = `TaxCore!${unique}`

  await page.goto('/auth/register')
  await page.getByPlaceholder('Jane Smith').fill('Core Flow User')
  await page.getByPlaceholder('you@example.com').fill(email)
  await page.getByPlaceholder('Min. 8 characters').fill(password)
  await page.getByPlaceholder('••••••••').last().fill(password)
  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page).toHaveURL('/', { timeout: 15000 })
  await startReturnButton(page).click()

  const next = nextButton(page)
  await expectStep(page, 1, /Personal Information/i, /Personal/i)
  await expect(page.getByRole('button', { name: /Previous/i })).toHaveCount(0)

  const ssnInput = page.getByPlaceholder('XXX-XX-XXXX').first()
  await ssnInput.fill('12345')
  await expect(page.getByText('Keep typing: 5\/9 digits entered')).toBeVisible()
  await expect(next).toBeDisabled()

  await page.getByPlaceholder('Enter first name').fill('Core')
  await page.getByPlaceholder('Enter last name').fill('Flow')
  await ssnInput.fill('123456789')
  await page.getByPlaceholder('Your age').fill('33')
  await page.getByPlaceholder('123 Main Street').fill('500 Main St')
  await page.getByPlaceholder('City name').fill('Austin')
  await page.getByPlaceholder('TX').fill('TX')
  await page.getByPlaceholder('12345').fill('73301')

  await expect(next).toBeEnabled()
  await next.click()

  await expectStep(page, 2, /Dependents/i, /Depend/i)
  await page.getByRole('button', { name: /Previous/i }).click()
  await expectStep(page, 1, /Personal Information/i, /Personal/i)
  await next.click()
  await expectStep(page, 2, /Dependents/i, /Depend/i)

  await next.click()
  await expectStep(page, 3, /W-2 Income/i, /W-2/i)

  await page.getByRole('button', { name: /Previous/i }).click()
  await expectStep(page, 2, /Dependents/i, /Depend/i)
  await next.click()
  await expectStep(page, 3, /W-2 Income/i, /W-2/i)

  await page.getByRole('button', { name: /Add W-2/i }).first().click()
  await expect(next).toBeDisabled()
  await expectStep(page, 3, /W-2 Income/i, /W-2/i)

  await page.getByPlaceholder('Company name').fill('Acme Corp')
  await page.getByPlaceholder('XX-XXXXXXX').fill('12-3456789')
  await page.locator('input[placeholder="0.00"]').first().fill('55000')

  await next.click()
  await expectStep(page, 4, /Interest Income/i, /Interest/i)

  await next.click()
  await expectStep(page, 5, /Schedule D - Capital Gains and Losses/i, /Cap/i)

  await advance(page)
  await expectStep(page, 6, /Schedule C - Self-Employment Income/i, /Self/i)

  await advance(page)
  await expectStep(page, 7, /Schedule E - Rental Real Estate Income/i, /Rental/i)

  await advance(page)
  await expectStep(page, 8, /Retirement Accounts/i, /Retire/i)

  await page.getByRole('button', { name: /Previous/i }).click()
  await expectStep(page, 7, /Schedule E - Rental Real Estate Income/i, /Rental/i)
  await advance(page)
  await expectStep(page, 8, /Retirement Accounts/i, /Retire/i)

  await advance(page)
  await expectStep(page, 9, /Schedule A - Itemized Deductions/i, /Deduct/i)

  await advance(page)
  await expectStep(page, 10, /Tax Credits/i, /Credits/i)

  await advance(page)
  await expect(page.getByText(/Step 11 of 11/i)).toBeVisible()
  await expect(page.getByRole('heading', { name: /Zoey's Return Summary/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /Review/i })).toBeVisible()

  await expect(page.locator('nav').first().getByRole('button', { name: /Credits/i })).toBeVisible()
})
