import { test, expect } from './fixtures'
import type { Page } from '@playwright/test'
import { startReturnButton, nextButton } from './selectors'

type ViewportCase = { name: string; width: number; height: number }

const VIEWPORTS: ViewportCase[] = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]

async function registerAndOpenWelcome(page: Page, suffix: string) {
  const unique = `${Date.now()}-${suffix}`
  const email = `pass5+${unique}@example.com`
  const password = `Pass5!${unique}`

  await page.goto('/auth/register')
  await page.getByPlaceholder('Jane Smith').fill('Pass Five')
  await page.getByPlaceholder('you@example.com').fill(email)
  await page.getByPlaceholder('Min. 8 characters').fill(password)
  await page.getByPlaceholder('••••••••').last().fill(password)
  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page).toHaveURL('/', { timeout: 15000 })
  await expect(page.getByRole('heading', { name: /Welcome/ })).toBeVisible()
}

async function fillPersonalInfo(page: Page) {
  await page.getByPlaceholder('Enter first name').fill('Pass')
  await page.getByPlaceholder('Enter last name').fill('Five')
  await page.getByPlaceholder('XXX-XX-XXXX').first().fill('123-45-6789')
  await page.getByPlaceholder('Your age').fill('31')
  await page.getByPlaceholder('123 Main Street').fill('123 Main St')
  await page.getByPlaceholder('City name').fill('Austin')
  await page.getByPlaceholder('TX').fill('TX')
  await page.getByPlaceholder('12345').fill('73301')
}

async function assertNoHorizontalOverflow(page: Page) {
  const metrics = await page.evaluate(() => {
    const root = document.documentElement
    return {
      innerWidth: window.innerWidth,
      bodyScrollWidth: document.body.scrollWidth,
      rootScrollWidth: root.scrollWidth,
    }
  })

  expect(metrics.bodyScrollWidth, `Body overflows viewport: ${JSON.stringify(metrics)}`).toBeLessThanOrEqual(metrics.innerWidth + 2)
  expect(metrics.rootScrollWidth, `Root overflows viewport: ${JSON.stringify(metrics)}`).toBeLessThanOrEqual(metrics.innerWidth + 2)
}

test.describe('Pass 5 responsive + visual sanity @pass5', () => {
  for (const viewport of VIEWPORTS) {
    test(`${viewport.name}: welcome, progress, key forms, and review layout`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })

      await registerAndOpenWelcome(page, viewport.name)
      await assertNoHorizontalOverflow(page)
      await page.screenshot({ path: testInfo.outputPath(`01-${viewport.name}-welcome.png`), fullPage: true })

      await startReturnButton(page).click()
      await expect(page.getByRole('heading', { name: 'Personal Information' })).toBeVisible()
      await assertNoHorizontalOverflow(page)
      await page.screenshot({ path: testInfo.outputPath(`02-${viewport.name}-personal-info.png`), fullPage: true })

      const stepsButton = page.getByRole('button', { name: 'Steps' })
      await expect(stepsButton).toBeVisible()
      await stepsButton.click()
      await expect(page.locator('[aria-current="step"]')).toBeVisible()
      await page.screenshot({ path: testInfo.outputPath(`03-${viewport.name}-status-bubbles.png`), fullPage: true })
      await stepsButton.click()

      await fillPersonalInfo(page)
      await nextButton(page).click()
      await expect(page.getByRole('heading', { name: 'Dependents', exact: true })).toBeVisible()
      await assertNoHorizontalOverflow(page)

      await nextButton(page).click()
      await expect(page.getByRole('heading', { name: 'W-2 Income' })).toBeVisible()
      await assertNoHorizontalOverflow(page)
      await page.screenshot({ path: testInfo.outputPath(`04-${viewport.name}-w2.png`), fullPage: true })

      for (let i = 0; i < 12; i++) {
        if (await page.getByRole('heading', { name: /Return Summary/ }).isVisible().catch(() => false)) break

        const skipButton = page.getByRole('button', { name: 'Skip for now' })
        if (await skipButton.isVisible().catch(() => false)) {
          await skipButton.click()
          continue
        }

        const next = nextButton(page)
        if (await next.isEnabled()) {
          await next.click()
          continue
        }

        break
      }

      await expect(page.getByRole('heading', { name: /Return Summary/ })).toBeVisible()
      await assertNoHorizontalOverflow(page)
      await page.screenshot({ path: testInfo.outputPath(`05-${viewport.name}-review-summary.png`), fullPage: true })

      const navButtons = page.locator('button:visible', {
        hasText: /Next|Previous|Start your return|Resume where you left off/
      })
      const navCount = await navButtons.count()
      for (let i = 0; i < navCount; i++) {
        const box = await navButtons.nth(i).boundingBox()
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(44)
          expect(box.height).toBeGreaterThanOrEqual(32)
        }
      }
    })
  }
})
