// W-2 Form Data Extractor
import { extractText, OCRExtractionError } from '../ocr-engine';
import type { W2Income } from '@/types/tax-types';

/**
 * Extract W-2 data from an image
 */
export async function extractW2Data(imageFile: File): Promise<Partial<W2Income>> {
  const { text } = await extractText(imageFile);

  // Clean up text
  const cleanText = text.replace(/\s+/g, ' ').trim();

  const extracted: Partial<W2Income> = {
    employer: extractEmployer(cleanText),
    ein: extractEIN(cleanText),
    wages: extractWages(cleanText),
    federalTaxWithheld: extractFederalWithholding(cleanText),
    socialSecurityWages: extractSocialSecurityWages(cleanText),
    socialSecurityTaxWithheld: extractSocialSecurityWithholding(cleanText),
    medicareWages: extractMedicareWages(cleanText),
    medicareTaxWithheld: extractMedicareWithholding(cleanText),
  };

  const hasUsefulData = Boolean(
    extracted.employer ||
      extracted.ein ||
      extracted.wages ||
      extracted.federalTaxWithheld ||
      extracted.socialSecurityWages ||
      extracted.socialSecurityTaxWithheld ||
      extracted.medicareWages ||
      extracted.medicareTaxWithheld
  );

  if (!hasUsefulData) {
    throw new OCRExtractionError(
      'We could read the file but could not find W-2 fields (boxes 1-6/EIN). Please upload a clearer image focused on the form or enter values manually.',
      'OCR_PROCESSING_FAILED'
    );
  }

  return extracted;
}

function extractEmployer(text: string): string {
  const patterns = [
    /Employer'?s?\s+name[:\s]+([A-Za-z0-9\s,\.&-]+?)(?=\s+Employer|$)/i,
    /(?:Box\s+)?c[:\s]+([A-Za-z0-9\s,\.&-]+?)(?=\s+(?:Box\s+)?d|EIN)/i,
    /\bc\s+Employer[’']?s?\s+name[\s:]+([A-Za-z0-9\s,\.&-]{3,}?)(?=\s+d\s+Control|\s+b\s+Employer|$)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }

  return '';
}

function extractEIN(text: string): string {
  const einPattern = /\b(\d{2}[-\s]?\d{7})\b/;
  const match = text.match(einPattern);

  if (match) {
    return match[1].replace(/[\s-]/g, '').replace(/^(\d{2})(\d{7})$/, '$1-$2');
  }

  return '';
}

function extractWages(text: string): number {
  return extractDollarAmount(text, [
    /(?:Box\s+)?1[:\s]+\$?\s*([\d,]+\.?\d*)/i,
    /1\s+Wages,\s+tips,\s+other\s+comp(?:ensation)?[:\s]+\$?\s*([\d,]+\.?\d*)/i,
  ]);
}

function extractFederalWithholding(text: string): number {
  return extractDollarAmount(text, [
    /(?:Box\s+)?2[:\s]+\$?\s*([\d,]+\.?\d*)/i,
    /2\s+Federal\s+income\s+tax\s+withheld[:\s]+\$?\s*([\d,]+\.?\d*)/i,
  ]);
}

function extractSocialSecurityWages(text: string): number {
  return extractDollarAmount(text, [
    /(?:Box\s+)?3[:\s]+\$?\s*([\d,]+\.?\d*)/i,
    /3\s+Social\s+security\s+wages[:\s]+\$?\s*([\d,]+\.?\d*)/i,
  ]);
}

function extractSocialSecurityWithholding(text: string): number {
  return extractDollarAmount(text, [
    /(?:Box\s+)?4[:\s]+\$?\s*([\d,]+\.?\d*)/i,
    /4\s+Social\s+security\s+tax\s+withheld[:\s]+\$?\s*([\d,]+\.?\d*)/i,
  ]);
}

function extractMedicareWages(text: string): number {
  return extractDollarAmount(text, [
    /(?:Box\s+)?5[:\s]+\$?\s*([\d,]+\.?\d*)/i,
    /5\s+Medicare\s+wages\s+and\s+tips[:\s]+\$?\s*([\d,]+\.?\d*)/i,
  ]);
}

function extractMedicareWithholding(text: string): number {
  return extractDollarAmount(text, [
    /(?:Box\s+)?6[:\s]+\$?\s*([\d,]+\.?\d*)/i,
    /6\s+Medicare\s+tax\s+withheld[:\s]+\$?\s*([\d,]+\.?\d*)/i,
  ]);
}

function extractDollarAmount(text: string, patterns: RegExp[]): number {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (!Number.isNaN(amount)) return amount;
    }
  }
  return 0;
}
