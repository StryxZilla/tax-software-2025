// W-2 Form Data Extractor
import { extractText, extractTextFromRegion, OCRExtractionError } from '../ocr-engine';
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
  const baseExtracted = extractW2DataFromText(text);

  const needsRegionAssist = isImageFile(imageFile) && (
    !baseExtracted.ein ||
    !baseExtracted.wages ||
    !baseExtracted.federalTaxWithheld ||
    !baseExtracted.socialSecurityWages ||
    !baseExtracted.socialSecurityTaxWithheld ||
    !baseExtracted.medicareWages ||
    !baseExtracted.medicareTaxWithheld
  );

  if (!needsRegionAssist) return baseExtracted;

  try {
    const regionalText = await extractLikelyW2RegionsText(imageFile);
    if (!regionalText) return baseExtracted;

    const regionalExtracted = extractW2DataFromText(regionalText);

    return {
      employer: baseExtracted.employer || regionalExtracted.employer || '',
      ein: baseExtracted.ein || regionalExtracted.ein || '',
      wages: baseExtracted.wages || regionalExtracted.wages || 0,
      federalTaxWithheld: baseExtracted.federalTaxWithheld || regionalExtracted.federalTaxWithheld || 0,
      socialSecurityWages: baseExtracted.socialSecurityWages || regionalExtracted.socialSecurityWages || 0,
      socialSecurityTaxWithheld:
        baseExtracted.socialSecurityTaxWithheld || regionalExtracted.socialSecurityTaxWithheld || 0,
      medicareWages: baseExtracted.medicareWages || regionalExtracted.medicareWages || 0,
      medicareTaxWithheld: baseExtracted.medicareTaxWithheld || regionalExtracted.medicareTaxWithheld || 0,
    };
  } catch {
    return baseExtracted;
  }
}

export function extractW2DataFromText(text: string): Partial<W2Income> {
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
    /Employer\s+identification\s+number(?:\s*\(?EIN\)?)?[\s:]*([0-9OILSBZ]{2}[-\s]?[0-9OILSBZ]{7})/i,
    /\bb\b[\s:.-]{0,10}(?:Employer\s+identification\s+number(?:\s*\(?EIN\)?)?)?[\s:.-]{0,20}([0-9OILSBZ]{2}[-\s]?[0-9OILSBZ]{7})/i,
    /\bEIN\b[\s:.-]{0,20}([0-9OILSBZ]{2}[-\s]?[0-9OILSBZ]{7})/i,
  ];

  for (const pattern of labeledPatterns) {
    const match = normalizedText.match(pattern);
    if (match?.[1]) {
      const normalizedEin = normalizeEin(match[1]);
      if (normalizedEin) return normalizedEin;
    }
  }

  return '';
}

function normalizeEin(ein: string): string {
  const corrected = ein
    .toUpperCase()
    .replace(/[\s-]/g, '')
    .replace(/[OQD]/g, '0')
    .replace(/[IL|]/g, '1')
    .replace(/S/g, '5')
    .replace(/B/g, '8')
    .replace(/Z/g, '2')
    .replace(/[^0-9]/g, '');

  if (!/^\d{9}$/.test(corrected)) return '';
  return corrected.replace(/^(\d{2})(\d{7})$/, '$1-$2');
}

function extractBoxAmount(context: ExtractionContext, boxNumber: number, keywords: string[]): number {
  // 0) Direct detached value line: "2 6789.10"
  const detachedValueRegex = new RegExp(
    `(?:^|\\s)(?:box\\s*)?${boxNumber}(?:\\s|:|-)\\s*(\\$?\\s*[0-9][0-9,]*(?:\\.[0-9]{1,2})?)(?=\\s|$)`,
    'i'
  );
  const detachedMatch = context.rawText.match(detachedValueRegex);
  if (detachedMatch?.[1]) {
    const parsed = parseCurrencyAmount(detachedMatch[1]);
    if (parsed > 0) return parsed;
  }

  // 1) Per-line extraction (works well when OCR keeps row structure)
  for (const line of context.lines) {
    if (!lineLikelyForBox(line, boxNumber, keywords)) continue;

    const boxScopedLineSegment = getBoxSegment(line, boxNumber);
    if (boxScopedLineSegment) {
      const amount = getAmountForBox(boxScopedLineSegment, boxNumber);
      if (amount > 0) return amount;
    }

    const amount = getAmountForBox(line, boxNumber);
    if (amount > 0) return amount;
  }

  // 2) Segment extraction between this box and the next one (handles single-line OCR)
  const segment = getBoxSegment(context.normalizedText, boxNumber);
  if (segment) {
    const amount = getAmountForBox(segment, boxNumber);
    if (amount > 0) return amount;
  }

  // 3) Label-first fallback in normalized text (handles OCR punctuation loss)
  const flexibleLabelRegex = new RegExp(
    `(?:^|\\s)(?:box\\s*)?${boxNumber}(?=\\s|:|-)[\\s\\S]{0,60}?(?:${keywords.join('\\W*')})?[\\s\\S]{0,30}?(\\$?\\s*[0-9][0-9,]*(?:\\.[0-9]{1,2})?)`,
    'i'
  );
  const fallbackMatch = context.normalizedText.match(flexibleLabelRegex);
  if (fallbackMatch?.[1]) {
    const parsed = parseCurrencyAmount(fallbackMatch[1]);
    if (parsed > 0) return parsed;
  }

  return 0;
}

function lineLikelyForBox(line: string, boxNumber: number, keywords: string[]): boolean {
  const normalizedLower = line.toLowerCase();

  const hasBoxNumber = new RegExp(`(?:^|\\s)(?:box\\s*)?${boxNumber}(?:\\s|:|$)`, 'i').test(line);
  const keywordHits = keywords.filter((k) => normalizedLower.includes(k.toLowerCase())).length;
  const hasPrimaryKeyword = normalizedLower.includes(keywords[0].toLowerCase());
  const hasDistinctiveKeyword = normalizedLower.includes(keywords[keywords.length - 1].toLowerCase());

  return hasBoxNumber || (hasPrimaryKeyword && hasDistinctiveKeyword && keywordHits >= 2);
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

function getAmountForBox(text: string, boxNumber: number): number {
  // Strongest signal: amount explicitly tied to the same box number.
  const explicitRegex = new RegExp(
    `(?:^|\\s)(?:box\\s*)?${boxNumber}(?:\\s|:|-)[^0-9$]{0,20}(\\$?\\s*[0-9][0-9,]*(?:\\.[0-9]{1,2})?)`,
    'ig'
  );

  for (const match of text.matchAll(explicitRegex)) {
    const value = parseCurrencyAmount(match[1]);
    if (value >= 10) return value;
  }

  // If no explicit match, only trust a generic first amount when segment is unambiguous.
  const genericMatches = [...text.matchAll(/\$?\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/g)];
  if (genericMatches.length === 1) {
    const value = parseCurrencyAmount(genericMatches[0][1]);
    if (value >= 10) return value;
  }

  return 0;
}

function parseCurrencyAmount(raw: string): number {
  const hasCentsOrThousandsFormatting = /\.\d{2}\b/.test(raw) || /\d,\d{3}/.test(raw);
  if (!hasCentsOrThousandsFormatting) return 0;
  return parseAmount(raw);
}

function parseAmount(raw: string): number {
  const amount = parseFloat(raw.replace(/[$,\s]/g, ''));
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return amount;
}

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif)$/i.test(file.name);
}

async function extractLikelyW2RegionsText(imageFile: File): Promise<string> {
  const dimensions = await getImageDimensions(imageFile);

  const regions = [
    // Box b/c area (employer + EIN)
    { left: 0.03, top: 0.07, width: 0.7, height: 0.2 },
    // Boxes 1-2
    { left: 0.03, top: 0.28, width: 0.62, height: 0.14 },
    // Boxes 3-4
    { left: 0.03, top: 0.41, width: 0.62, height: 0.14 },
    // Boxes 5-6
    { left: 0.03, top: 0.54, width: 0.62, height: 0.14 },
  ].map((r) => ({
    left: Math.floor(dimensions.width * r.left),
    top: Math.floor(dimensions.height * r.top),
    width: Math.max(50, Math.floor(dimensions.width * r.width)),
    height: Math.max(40, Math.floor(dimensions.height * r.height)),
  }));

  const chunks = await Promise.all(
    regions.map(async (region) => {
      try {
        const { text } = await extractTextFromRegion(imageFile, region);
        return text?.trim() || '';
      } catch {
        return '';
      }
    })
  );

  return chunks.filter(Boolean).join('\n');
}

async function getImageDimensions(imageFile: File): Promise<{ width: number; height: number }> {
  if (typeof document === 'undefined') {
    throw new Error('Image dimensions require browser context');
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(imageFile);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to read image dimensions'));
    };

    img.src = url;
  });
}
