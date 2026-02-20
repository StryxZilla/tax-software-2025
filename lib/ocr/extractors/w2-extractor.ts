// W-2 Form Data Extractor
import { extractText } from '../ocr-engine';
import type { W2Income } from '@/types/tax-types';

/**
 * Extract W-2 data from an image
 */
export async function extractW2Data(imageFile: File): Promise<Partial<W2Income>> {
  const { text } = await extractText(imageFile);
  
  // Clean up text
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  return {
    employer: extractEmployer(cleanText),
    ein: extractEIN(cleanText),
    wages: extractWages(cleanText),
    federalTaxWithheld: extractFederalWithholding(cleanText),
    socialSecurityWages: extractSocialSecurityWages(cleanText),
    socialSecurityTaxWithheld: extractSocialSecurityWithholding(cleanText),
    medicareWages: extractMedicareWages(cleanText),
    medicareTaxWithheld: extractMedicareWithholding(cleanText),
  };
}

function extractEmployer(text: string): string {
  // Look for employer name (usually after "Employer's name" or box c)
  const patterns = [
    /Employer'?s?\s+name[:\s]+([A-Za-z0-9\s,\.&-]+?)(?=\s+Employer|$)/i,
    /(?:Box\s+)?c[:\s]+([A-Za-z0-9\s,\.&-]+?)(?=\s+(?:Box\s+)?d|EIN)/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return '';
}

function extractEIN(text: string): string {
  // EIN format: XX-XXXXXXX
  const einPattern = /\b(\d{2}[-\s]?\d{7})\b/;
  const match = text.match(einPattern);
  
  if (match) {
    // Normalize format to XX-XXXXXXX
    return match[1].replace(/[\s-]/g, '').replace(/^(\d{2})(\d{7})$/, '$1-$2');
  }
  
  return '';
}

function extractWages(text: string): number {
  // Box 1: Wages, tips, other compensation
  return extractDollarAmount(text, /(?:Box\s+)?1[:\s]+\$?\s*([\d,]+\.?\d*)/i);
}

function extractFederalWithholding(text: string): number {
  // Box 2: Federal income tax withheld
  return extractDollarAmount(text, /(?:Box\s+)?2[:\s]+\$?\s*([\d,]+\.?\d*)/i);
}

function extractSocialSecurityWages(text: string): number {
  // Box 3: Social security wages
  return extractDollarAmount(text, /(?:Box\s+)?3[:\s]+\$?\s*([\d,]+\.?\d*)/i);
}

function extractSocialSecurityWithholding(text: string): number {
  // Box 4: Social security tax withheld
  return extractDollarAmount(text, /(?:Box\s+)?4[:\s]+\$?\s*([\d,]+\.?\d*)/i);
}

function extractMedicareWages(text: string): number {
  // Box 5: Medicare wages and tips
  return extractDollarAmount(text, /(?:Box\s+)?5[:\s]+\$?\s*([\d,]+\.?\d*)/i);
}

function extractMedicareWithholding(text: string): number {
  // Box 6: Medicare tax withheld
  return extractDollarAmount(text, /(?:Box\s+)?6[:\s]+\$?\s*([\d,]+\.?\d*)/i);
}

function extractDollarAmount(text: string, pattern: RegExp): number {
  const match = text.match(pattern);
  if (match && match[1]) {
    // Remove commas and parse as float
    const amount = parseFloat(match[1].replace(/,/g, ''));
    return isNaN(amount) ? 0 : amount;
  }
  return 0;
}
