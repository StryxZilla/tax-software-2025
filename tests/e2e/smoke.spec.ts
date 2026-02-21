import { test, expect } from '@playwright/test'

test('app smoke: root redirect/auth pages/basic nav', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveURL(/\/auth\/login/)
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()

  await page.getByRole('link', { name: 'Create one free' }).click()
  await expect(page).toHaveURL(/\/auth\/register/)
  await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()

  await page.getByRole('link', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/auth\/login/)
})
