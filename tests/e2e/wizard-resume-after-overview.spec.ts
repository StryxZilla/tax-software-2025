import { test, expect } from './fixtures'
import { nextButton } from './selectors'

test('resume draft survives Back to Overview navigation', async ({ page }) => {
  test.setTimeout(60_000)

  await page.goto('/auth/login')
  await page.getByPlaceholder('you@example.com').fill('john.sample@testmail.com')
  await page.getByPlaceholder('••••••••').first().fill('testpassword123')
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page).toHaveURL('/', { timeout: 15000 })
  await page.getByTestId('start-return-btn').click()

  await page.getByPlaceholder('Enter first name').fill('QA')
  await page.getByPlaceholder('Enter last name').fill('User')
  await page.getByPlaceholder('XXX-XX-XXXX').first().fill('123-45-6789')
  await page.getByPlaceholder('Your age').fill('30')
  await page.getByPlaceholder('123 Main Street').fill('123 Main St')
  await page.getByPlaceholder('City name').fill('Austin')
  await page.getByPlaceholder('TX').fill('TX')
  await page.getByPlaceholder('12345').fill('73301')

  await nextButton(page).click()
  await expect(page.getByRole('heading', { name: 'Dependents', exact: true })).toBeVisible()

  await page.getByRole('button', { name: '← Back to Overview' }).click()

  await expect(page.getByText('Welcome back!')).toBeVisible()
  await expect(page.getByTestId('resume-draft-btn')).toBeVisible()

  const currentStep = await page.evaluate(() => localStorage.getItem('currentStep'))
  const resumeStep = await page.evaluate(() => localStorage.getItem('resumeStep'))
  expect(currentStep).toBe('welcome')
  expect(resumeStep).toBe('dependents')

  await page.getByTestId('resume-draft-btn').click()
  await expect(page.getByRole('heading', { name: 'Dependents', exact: true })).toBeVisible()
})

