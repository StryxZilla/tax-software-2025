// 1099-DIV Form Data Extractor
import { extractText } from '../ocr-engine';
import type { Dividend1099DIV } from '@/types/tax-types';

/**
 * Extract 1099-DIV data from an image
 */
export async function extract1099DIVData(imageFile: File): Promise<Partial<Dividend1099DIV>> {
  const { text } = await extractText(imageFile);
  
  // Clean up text
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  return {
    payer: extractPayer(cleanText),
    ordinaryDividends: extractOrdinaryDividends(cleanText),
    qualifiedDividends: extractQualifiedDividends(cleanText),
  };
}

function extractPayer(text: string): string {
  // Look for payer name (usually at top or after "PAYER'S name")
  const patterns = [
    /PAYER'?S?\s+name[:\s]+([A-Za-z0-9\s,\.&-]+?)(?=\s+PAYER|Street|$)/i,
    /(?:CORRECTED|VOID)?\s+1099-DIV[:\s]+([A-Za-z0-9\s,\.&-]+?)(?=\s+Street|Address|$)/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return '';
}

function extractOrdinaryDividends(text: string): number {
  // Box 1a: Total ordinary dividends
  const patterns = [
    /(?:Box\s+)?1a[:\s]+(?:Total\s+)?ordinary\s+dividends[:\s]+\$?\s*([\d,]+\.?\d*)/i,
    /(?:Total\s+)?ordinary\s+dividends[:\s]+\$?\s*([\d,]+\.?\d*)/i,
    /(?:Box\s+)?1a[:\s]+\$?\s*([\d,]+\.?\d*)/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(amount)) {
        return amount;
      }
    }
  }
  
  return 0;
}

function extractQualifiedDividends(text: string): number {
  // Box 1b: Qualified dividends
  const patterns = [
    /(?:Box\s+)?1b[:\s]+Qualified\s+dividends[:\s]+\$?\s*([\d,]+\.?\d*)/i,
    /Qualified\s+dividends[:\s]+\$?\s*([\d,]+\.?\d*)/i,
    /(?:Box\s+)?1b[:\s]+\$?\s*([\d,]+\.?\d*)/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(amount)) {
        return amount;
      }
    }
  }
  
  return 0;
}
