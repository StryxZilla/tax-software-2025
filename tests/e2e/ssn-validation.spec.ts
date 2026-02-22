import { test, expect } from './fixtures'

test('ssn live validation blocks progress until valid format @critical-ssn', async ({ page }) => {
  await page.goto('/auth/login')
  await page.getByRole('link', { name: 'Create one free' }).click()

  const unique = Date.now()
  const email = `ssn+${unique}@example.com`
  const password = `TaxQa!${unique}`

  await page.getByPlaceholder('Jane Smith').fill('SSN Tester')
  await page.getByPlaceholder('you@example.com').fill(email)
  await page.getByPlaceholder('Min. 8 characters').fill(password)
  await page.getByPlaceholder('••••••••').last().fill(password)
  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page).toHaveURL('/', { timeout: 15000 })
  await page.getByRole('button', { name: "Let's Get Started" }).first().click()

  const ssnInput = page.getByPlaceholder('XXX-XX-XXXX').first()
  const nextButton = page.getByRole('button', { name: 'Next →' })

  await ssnInput.fill('1')
  await expect(page.getByText('Keep typing: 1/9 digits entered')).toBeVisible()
  await expect(nextButton).toBeDisabled()

  await ssnInput.fill('12345')
  await expect(page.getByText('Keep typing: 5/9 digits entered')).toBeVisible()
  await expect(nextButton).toBeDisabled()

  await ssnInput.fill('123456789')
  await expect(ssnInput).toHaveValue('123-45-6789')

  await page.getByPlaceholder('Enter first name').fill('Ssn')
  await page.getByPlaceholder('Enter last name').fill('Tester')
  await page.getByPlaceholder('Your age').fill('29')
  await page.getByPlaceholder('123 Main Street').fill('123 Test Rd')
  await page.getByPlaceholder('City name').fill('Austin')
  await page.getByPlaceholder('TX').fill('TX')
  await page.getByPlaceholder('12345').fill('73301')

  await expect(nextButton).toBeEnabled()
  await nextButton.click()
  await expect(page.getByRole('heading', { name: 'Dependents', exact: true })).toBeVisible()
})
