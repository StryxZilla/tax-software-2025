// OCR Engine using Tesseract.js
import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
}

/**
 * Extract text from an image or PDF using Tesseract OCR
 */
export async function extractText(imageFile: File): Promise<OCRResult> {
  try {
    const result = await Tesseract.recognize(imageFile, 'eng', {
      logger: (m) => console.log(m), // Progress logging
    });

    return {
      text: result.data.text,
      confidence: result.data.confidence,
    };
  } catch (error) {
    console.error('OCR extraction failed:', error);
    throw new Error('Failed to extract text from image');
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
    throw new Error('Failed to extract text from image region');
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
}
