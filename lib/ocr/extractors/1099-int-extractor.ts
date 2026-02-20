// 1099-INT Form Data Extractor
import { extractText } from '../ocr-engine';
import type { Interest1099INT } from '@/types/tax-types';

/**
 * Extract 1099-INT data from an image
 */
export async function extract1099INTData(imageFile: File): Promise<Partial<Interest1099INT>> {
  const { text } = await extractText(imageFile);
  
  // Clean up text
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  return {
    payer: extractPayer(cleanText),
    amount: extractInterestIncome(cleanText),
  };
}

function extractPayer(text: string): string {
  // Look for payer name (usually at top or after "PAYER'S name")
  const patterns = [
    /PAYER'?S?\s+name[:\s]+([A-Za-z0-9\s,\.&-]+?)(?=\s+PAYER|Street|$)/i,
    /(?:CORRECTED|VOID)?\s+1099-INT[:\s]+([A-Za-z0-9\s,\.&-]+?)(?=\s+Street|Address|$)/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return '';
}

function extractInterestIncome(text: string): number {
  // Box 1: Interest income
  const patterns = [
    /(?:Box\s+)?1[:\s]+Interest\s+income[:\s]+\$?\s*([\d,]+\.?\d*)/i,
    /Interest\s+income[:\s]+\$?\s*([\d,]+\.?\d*)/i,
    /(?:Box\s+)?1[:\s]+\$?\s*([\d,]+\.?\d*)/i,
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
