import { describe, it, expect, vi, beforeEach } from 'vitest';

const { recognize } = vi.hoisted(() => ({
  recognize: vi.fn(),
}));

vi.mock('tesseract.js', () => ({
  default: {
    recognize,
    createWorker: vi.fn(),
  },
}));

import { extractText } from '@/lib/ocr/ocr-engine';

describe('ocr-engine', () => {
  beforeEach(() => {
    recognize.mockReset();
  });

  it('returns clear error for PDF uploads', async () => {
    const pdfFile = new File(['%PDF'], 'w2.pdf', { type: 'application/pdf' });

    await expect(extractText(pdfFile)).rejects.toMatchObject({
      name: 'OCRExtractionError',
      code: 'PDF_NOT_SUPPORTED',
    });
  });

  it('returns clear error for unsupported file types', async () => {
    const txtFile = new File(['x'], 'notes.txt', { type: 'text/plain' });

    await expect(extractText(txtFile)).rejects.toMatchObject({
      name: 'OCRExtractionError',
      code: 'UNSUPPORTED_FILE_TYPE',
    });
  });

  it('maps OCR worker/language load failures to actionable error', async () => {
    recognize.mockRejectedValueOnce(new Error('Failed to fetch traineddata from worker'));
    const imageFile = new File(['x'], 'w2.png', { type: 'image/png' });

    await expect(extractText(imageFile)).rejects.toMatchObject({
      name: 'OCRExtractionError',
      code: 'OCR_ASSET_LOAD_FAILED',
    });
  });

  it('extracts text for valid image files', async () => {
    recognize.mockResolvedValueOnce({ data: { text: 'ok', confidence: 99 } });
    const imageFile = new File(['x'], 'w2.png', { type: 'image/png' });

    const result = await extractText(imageFile);
    expect(result).toEqual({ text: 'ok', confidence: 99 });
  });
});
