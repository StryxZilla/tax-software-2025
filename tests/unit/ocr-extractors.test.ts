import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/ocr/ocr-engine', async () => {
  const actual = await vi.importActual<typeof import('@/lib/ocr/ocr-engine')>('@/lib/ocr/ocr-engine');
  return {
    ...actual,
    extractText: vi.fn(),
  };
});

import { extractText, OCRExtractionError } from '@/lib/ocr/ocr-engine';
import { extractW2Data } from '@/lib/ocr/extractors/w2-extractor';
import { extract1099INTData } from '@/lib/ocr/extractors/1099-int-extractor';

const mockedExtractText = vi.mocked(extractText);
const sampleImage = new File(['fake'], 'w2.png', { type: 'image/png' });

describe('OCR extractors', () => {
  beforeEach(() => {
    mockedExtractText.mockReset();
  });

  it('extracts key W-2 fields from representative OCR text', async () => {
    mockedExtractText.mockResolvedValue({
      text: `Employer's name ACME CORPORATION Employer identification number 12-3456789
      1 Wages, tips, other compensation 56,123.45
      2 Federal income tax withheld 6,789.10
      3 Social security wages 56,123.45
      4 Social security tax withheld 3,479.65
      5 Medicare wages and tips 56,123.45
      6 Medicare tax withheld 813.79`,
      confidence: 91,
    });

    const result = await extractW2Data(sampleImage);

    expect(result.employer).toContain('ACME CORPORATION');
    expect(result.ein).toBe('12-3456789');
    expect(result.wages).toBe(56123.45);
    expect(result.federalTaxWithheld).toBe(6789.1);
  });

  it('returns actionable error when W-2 fields cannot be found', async () => {
    mockedExtractText.mockResolvedValue({ text: 'random unrelated text', confidence: 40 });

    await expect(extractW2Data(sampleImage)).rejects.toThrow(OCRExtractionError);
    await expect(extractW2Data(sampleImage)).rejects.toThrow(/could not find W-2 fields/i);
  });

  it('extracts 1099-INT payer and amount', async () => {
    mockedExtractText.mockResolvedValue({
      text: `1099-INT PAYER'S name FIRST NATIONAL BANK
      1 Interest income 245.18`,
      confidence: 88,
    });

    const result = await extract1099INTData(sampleImage);

    expect(result.payer).toContain('FIRST NATIONAL BANK');
    expect(result.amount).toBe(245.18);
  });
});
