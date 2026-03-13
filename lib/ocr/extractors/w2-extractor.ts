// W-2 Form Data Extractor
import { extractText, OCRExtractionError } from '../ocr-engine';
import type { W2Income } from '@/types/tax-types';

interface ExtractionContext {
  rawText: string;
  normalizedText: string;
  lines: string[];
}

/**
 * Extract W-2 data from an image
 */
export async function extractW2Data(imageFile: File): Promise<Partial<W2Income>> {
  const { text } = await extractText(imageFile);
  const context = createContext(text);

  const extracted: Partial<W2Income> = {
    employer: extractEmployer(context.normalizedText),
    ein: extractEIN(context),
    wages: extractBoxAmount(context, 1, ['wages', 'tips', 'other compensation']),
    federalTaxWithheld: extractBoxAmount(context, 2, ['federal', 'income', 'tax', 'withheld']),
    socialSecurityWages: extractBoxAmount(context, 3, ['social', 'security', 'wages']),
    socialSecurityTaxWithheld: extractBoxAmount(context, 4, ['social', 'security', 'tax', 'withheld']),
    medicareWages: extractBoxAmount(context, 5, ['medicare', 'wages', 'tips']),
    medicareTaxWithheld: extractBoxAmount(context, 6, ['medicare', 'tax', 'withheld']),
  };

  const hasUsefulData = Boolean(
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

function createContext(text: string): ExtractionContext {
  const rawText = text.replace(/\u0000/g, ' ').trim();
  const normalizedText = rawText.replace(/\s+/g, ' ').trim();
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  return { rawText, normalizedText, lines };
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

function extractEIN(context: ExtractionContext): string {
  const { normalizedText } = context;

  const labeledPatterns = [
    /Employer\s+identification\s+number\s*\(?EIN\)?[^\d]{0,20}(\d{2}[-\s]?\d{7})/i,
    /\bb\b[^\d]{0,20}(\d{2}[-\s]?\d{7})/i,
    /\bEIN\b[^\d]{0,20}(\d{2}[-\s]?\d{7})/i,
  ];

  for (const pattern of labeledPatterns) {
    const match = normalizedText.match(pattern);
    if (match?.[1]) {
      return normalizeEin(match[1]);
    }
  }

  const anyEinLike = normalizedText.match(/\b(\d{2}[-\s]?\d{7})\b/);
  if (anyEinLike?.[1]) {
    return normalizeEin(anyEinLike[1]);
  }

  return '';
}

function normalizeEin(ein: string): string {
  return ein.replace(/[\s-]/g, '').replace(/^(\d{2})(\d{7})$/, '$1-$2');
}

function extractBoxAmount(context: ExtractionContext, boxNumber: number, keywords: string[]): number {
  // 1) Per-line extraction (works well when OCR keeps row structure)
  for (const line of context.lines) {
    if (!lineLikelyForBox(line, boxNumber, keywords)) continue;

    const boxScopedLineSegment = getBoxSegment(line, boxNumber);
    if (boxScopedLineSegment) {
      const amount = getFirstPlausibleAmount(boxScopedLineSegment);
      if (amount > 0) return amount;
    }

    const amount = getFirstPlausibleAmount(line);
    if (amount > 0) return amount;
  }

  // 2) Segment extraction between this box and the next one (handles single-line OCR)
  const segment = getBoxSegment(context.normalizedText, boxNumber);
  if (segment) {
    const amount = getFirstPlausibleAmount(segment);
    if (amount > 0) return amount;
  }

  // 3) Label-first fallback in normalized text (handles OCR punctuation loss)
  const flexibleLabelRegex = new RegExp(
    `(?:^|\\s)(?:box\\s*)?${boxNumber}(?=\\s|:|-)[\\s\\S]{0,60}?(?:${keywords.join('\\W*')})?[\\s\\S]{0,30}?(\\$?\\s*[0-9][0-9,]*(?:\\.[0-9]{1,2})?)`,
    'i'
  );
  const fallbackMatch = context.normalizedText.match(flexibleLabelRegex);
  if (fallbackMatch?.[1]) {
    const parsed = parseAmount(fallbackMatch[1]);
    if (parsed > 0) return parsed;
  }

  return 0;
}

function lineLikelyForBox(line: string, boxNumber: number, keywords: string[]): boolean {
  const normalizedLower = line.toLowerCase();

  const hasBoxNumber = new RegExp(`(?:^|\\s)(?:box\\s*)?${boxNumber}(?:\\s|:|$)`, 'i').test(line);
  const keywordHits = keywords.filter((k) => normalizedLower.includes(k.toLowerCase())).length;
  const keywordThreshold = Math.max(2, keywords.length - 1);
  const hasPrimaryKeyword = normalizedLower.includes(keywords[0].toLowerCase());

  return hasBoxNumber || (hasPrimaryKeyword && keywordHits >= keywordThreshold);
}

function getBoxSegment(text: string, boxNumber: number): string {
  const startRegex = new RegExp(`(?:^|\\s)(?:box\\s*)?${boxNumber}(?=\\s|:|-)`, 'i');
  const startMatch = startRegex.exec(text);
  if (!startMatch || startMatch.index < 0) return '';

  const startIndex = startMatch.index;

  const possibleNextBoxes = boxNumber === 6 ? [7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] : [boxNumber + 1];

  let endIndex = text.length;
  for (const nextBox of possibleNextBoxes) {
    const nextRegex = new RegExp(`(?:^|\\s)(?:box\\s*)?${nextBox}(?=\\s|:|-)`, 'i');
    const tail = text.slice(startIndex + 1);
    const nextMatch = nextRegex.exec(tail);
    if (nextMatch && nextMatch.index >= 0) {
      endIndex = Math.min(endIndex, startIndex + 1 + nextMatch.index);
    }
  }

  return text.slice(startIndex, Math.max(startIndex, endIndex));
}

function getFirstPlausibleAmount(text: string): number {
  const matches = [...text.matchAll(/\$?\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/g)];

  for (const match of matches) {
    const value = parseAmount(match[1]);
    if (value >= 10) {
      return value;
    }
  }

  return 0;
}

function parseAmount(raw: string): number {
  const amount = parseFloat(raw.replace(/[$,\s]/g, ''));
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return amount;
}
