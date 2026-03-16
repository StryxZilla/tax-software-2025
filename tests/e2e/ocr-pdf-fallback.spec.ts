import { test, expect } from '@playwright/test'
import { startReturnButton, nextButton } from './selectors'
import { PDFDocument } from 'pdf-lib'
import fs from 'node:fs/promises'
import path from 'node:path'

const ONE_BY_ONE_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X2ioAAAAASUVORK5CYII='

async function createImageOnlyPdf(filePath: string) {
  const pdf = await PDFDocument.create()
  const page = pdf.addPage([600, 400])
  const pngBytes = Buffer.from(ONE_BY_ONE_PNG_BASE64, 'base64')
  const img = await (pdf as any).embedPng(pngBytes)
  ;(page as any).drawImage(img, { x: 40, y: 40, width: 520, height: 320 })
  const bytes = await pdf.save()
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, bytes)
}

test('pdf OCR fallback loads language assets instead of failing on relative traineddata path', async ({ page }) => {
  test.setTimeout(120_000)

  const unique = Date.now()
  const email = `ocrpdf+${unique}@example.com`
  const password = `TaxOCR!${unique}`

  await page.goto('/auth/register')
  await page.getByPlaceholder('Jane Smith').fill('OCR User')
  await page.getByPlaceholder('you@example.com').fill(email)
  await page.getByPlaceholder('Min. 8 characters').fill(password)
  await page.getByPlaceholder('••••••••').last().fill(password)
  await page.getByRole('button', { name: 'Create account' }).click()

  await startReturnButton(page).click()

  const next = nextButton(page)
  await expect(page.getByRole('heading', { level: 2, name: /Personal Information/i })).toBeVisible()

  await page.getByPlaceholder('Enter first name').fill('OCR')
  await page.getByPlaceholder('Enter last name').fill('Tester')
  await page.getByPlaceholder('XXX-XX-XXXX').first().fill('123456789')
  await page.getByPlaceholder('Your age').fill('33')
  await page.getByPlaceholder('123 Main Street').fill('500 Main St')
  await page.getByPlaceholder('City name').fill('Austin')
  await page.getByPlaceholder('TX').fill('TX')
  await page.getByPlaceholder('12345').fill('73301')
  await expect(next).toBeEnabled()
  await next.click()
  await expect(next).toBeEnabled()
  await next.click()

  await expect(page.getByRole('heading', { level: 2, name: /W-2 Income/i })).toBeVisible()

  const samplePdfPath = path.join(process.cwd(), 'test-results', 'fixtures', `ocr-scan-${unique}.pdf`)
  await createImageOnlyPdf(samplePdfPath)

  await page.locator('input[type="file"]').first().setInputFiles(samplePdfPath)
  await page.getByRole('button', { name: /Extract Data/i }).click()

  await expect(page.getByText(/Extracting data/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /Extract Data/i })).toBeVisible({ timeout: 90_000 })

  await expect(page.getByText(/Could not load OCR language assets/i)).toHaveCount(0)
  await expect(
    page.getByText(/could not find W-2 fields|Data extracted successfully/i)
  ).toBeVisible()
})
