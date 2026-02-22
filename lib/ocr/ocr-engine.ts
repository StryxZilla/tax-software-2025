// OCR Engine using Tesseract.js
import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
}

export class OCRExtractionError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'UNSUPPORTED_FILE_TYPE'
      | 'PDF_NOT_SUPPORTED'
      | 'OCR_ASSET_LOAD_FAILED'
      | 'OCR_PROCESSING_FAILED'
  ) {
    super(message);
    this.name = 'OCRExtractionError';
  }
}

function getFriendlyOCRError(error: unknown): OCRExtractionError {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  if (lower.includes('worker') || lower.includes('traineddata') || lower.includes('fetch')) {
    return new OCRExtractionError(
      'Could not load OCR language assets. Please refresh and try again. If it keeps failing, upload a clear JPG/PNG screenshot of your form instead of a PDF.',
      'OCR_ASSET_LOAD_FAILED'
    );
  }

  return new OCRExtractionError(
    'Could not read text from this file. Try a sharper, well-lit JPG or PNG where all form boxes are visible.',
    'OCR_PROCESSING_FAILED'
  );
}

/**
 * Extract text from an image using Tesseract OCR
 */
export async function extractText(file: File): Promise<OCRResult> {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const isImage = file.type.startsWith('image/');

  if (isPdf) {
    throw new OCRExtractionError(
      'PDF upload is not supported by the current OCR engine. Please upload a JPG or PNG image of page 1 (screenshot or phone photo).',
      'PDF_NOT_SUPPORTED'
    );
  }

  if (!isImage) {
    throw new OCRExtractionError(
      `Unsupported file type: ${file.type || 'unknown'}. Please upload a JPG or PNG image.`,
      'UNSUPPORTED_FILE_TYPE'
    );
  }

  try {
    const result = await Tesseract.recognize(file, 'eng', {
      logger: (m) => console.log(m),
    });

    return {
      text: result.data.text,
      confidence: result.data.confidence,
    };
  } catch (error) {
    console.error('OCR extraction failed:', error);
    throw getFriendlyOCRError(error);
  }
}

/**
 * Extract text from a specific region of an image
 * Useful for targeting specific fields on a form
 */
export async function extractTextFromRegion(
  imageFile: File,
  region: { left: number; top: number; width: number; height: number }
): Promise<OCRResult> {
  let worker: Awaited<ReturnType<typeof Tesseract.createWorker>> | undefined;

  try {
    worker = await Tesseract.createWorker('eng', undefined, {
      logger: (m) => console.log(m),
    });

    const result = await worker.recognize(imageFile, {
      rectangle: region,
    });

    return {
      text: result.data.text,
      confidence: result.data.confidence,
    };
  } catch (error) {
    console.error('OCR extraction failed:', error);
    throw getFriendlyOCRError(error);
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
}
