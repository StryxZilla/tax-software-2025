import { PDFDocument, rgb, StandardFonts, type PDFPage } from 'pdf-lib';
import type { TaxReturn } from '../../../types/tax-types';
import {
  calculateScheduleCProfit,
  calculateSelfEmploymentTax,
  calculateTaxReturn,
} from '../calculations/tax-calculator';
import {
  generateForm1040,
  generateForm8606,
  generateFormW2,
  generateForm8863,
  generateForm8889,
  generateForm8880,
  generateSchedule1,
  generateSchedule2,
  generateSchedule3,
  generateScheduleA,
  generateScheduleC,
  generateScheduleD,
  generateScheduleE,
} from './pdf-generator';

export interface FilingPacketManifest {
  includedForms: string[];
  unsupportedOrManualForms: string[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatSSN(ssn: string): string {
  const digits = ssn.replace(/\D/g, '');
  if (digits.length !== 9) return ssn;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

function hasScheduleBData(taxReturn: TaxReturn): boolean {
  return taxReturn.interest.some((i) => i.amount !== 0) || taxReturn.dividends.some((d) => d.ordinaryDividends !== 0 || d.qualifiedDividends !== 0);
}

function hasScheduleSEData(taxReturn: TaxReturn): boolean {
  if (!taxReturn.selfEmployment) return false;
  return calculateScheduleCProfit(taxReturn.selfEmployment) > 400;
}

export function buildFilingPacketManifest(taxReturn: TaxReturn): FilingPacketManifest {
  const includedForms = ['Form 1040', 'Schedule 1', 'Schedule 2', 'Schedule 3'];

  if (hasScheduleBData(taxReturn)) includedForms.push('Schedule B');
  if (taxReturn.itemizedDeductions) includedForms.push('Schedule A');
  if (taxReturn.selfEmployment) includedForms.push('Schedule C');
  if (taxReturn.capitalGains.length > 0) includedForms.push('Schedule D');
  if (taxReturn.rentalProperties.length > 0) includedForms.push('Schedule E');
  if (hasScheduleSEData(taxReturn)) includedForms.push('Schedule SE');
  if (taxReturn.form8606) includedForms.push('Form 8606');
  if (taxReturn.w2Income.length > 0) includedForms.push('Form W-2');
  if (taxReturn.educationExpenses.length > 0) includedForms.push('Form 8863');
  if (taxReturn.hsaData) includedForms.push('Form 8889');
  if (taxReturn.traditionalIRAContribution || taxReturn.rothIRAContribution) includedForms.push('Form 8880');

  const unsupportedOrManualForms: string[] = [];

  unsupportedOrManualForms.push('State tax return forms are not included.');

  return { includedForms, unsupportedOrManualForms };
}

async function appendPdfBytes(mainPdf: PDFDocument, bytes: Uint8Array | null): Promise<void> {
  if (!bytes) return;
  const source = await PDFDocument.load(bytes);
  const pages = await mainPdf.copyPages(source, source.getPageIndices());
  pages.forEach((p: PDFPage) => mainPdf.addPage(p));
}

async function generateScheduleB(taxReturn: TaxReturn): Promise<Uint8Array | null> {
  if (!hasScheduleBData(taxReturn)) return null;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = height - 50;
  page.drawText('Schedule B (Form 1040) - Interest and Ordinary Dividends', { x: 40, y, size: 13, font: boldFont });
  y -= 18;
  page.drawText('Tax Year 2025', { x: 40, y, size: 10, font });
  y -= 18;
  page.drawText(`${taxReturn.personalInfo.firstName} ${taxReturn.personalInfo.lastName}    SSN: ${formatSSN(taxReturn.personalInfo.ssn)}`, { x: 40, y, size: 10, font });

  y -= 28;
  page.drawText('Part I - Interest', { x: 40, y, size: 11, font: boldFont });
  y -= 16;

  const interestRows = taxReturn.interest.filter((i) => i.amount !== 0);
  if (interestRows.length === 0) {
    page.drawText('No taxable interest reported', { x: 55, y, size: 9, font });
    y -= 14;
  } else {
    for (const row of interestRows.slice(0, 18)) {
      page.drawText(row.payer || '(payer not provided)', { x: 55, y, size: 9, font });
      page.drawText(formatCurrency(row.amount), { x: 460, y, size: 9, font });
      y -= 14;
    }
  }

  const totalInterest = taxReturn.interest.reduce((sum, i) => sum + i.amount, 0);
  y -= 6;
  page.drawText('2. Taxable interest total', { x: 40, y, size: 9, font: boldFont });
  page.drawText(formatCurrency(totalInterest), { x: 460, y, size: 9, font: boldFont });

  y -= 26;
  page.drawText('Part II - Ordinary Dividends', { x: 40, y, size: 11, font: boldFont });
  y -= 16;

  const dividendRows = taxReturn.dividends.filter((d) => d.ordinaryDividends !== 0 || d.qualifiedDividends !== 0);
  if (dividendRows.length === 0) {
    page.drawText('No ordinary dividends reported', { x: 55, y, size: 9, font });
    y -= 14;
  } else {
    for (const row of dividendRows.slice(0, 18)) {
      page.drawText(row.payer || '(payer not provided)', { x: 55, y, size: 9, font });
      page.drawText(formatCurrency(row.ordinaryDividends), { x: 460, y, size: 9, font });
      y -= 14;
    }
  }

  const totalDividends = taxReturn.dividends.reduce((sum, d) => sum + d.ordinaryDividends, 0);
  y -= 6;
  page.drawText('6. Ordinary dividends total', { x: 40, y, size: 9, font: boldFont });
  page.drawText(formatCurrency(totalDividends), { x: 460, y, size: 9, font: boldFont });

  page.drawText('Print/Mail note: if you have foreign accounts/trusts, complete the official Part III questions manually.', {
    x: 40,
    y: 30,
    size: 8,
    font,
    color: rgb(0.45, 0.2, 0),
  });

  return pdfDoc.save();
}

async function generateScheduleSE(taxReturn: TaxReturn): Promise<Uint8Array | null> {
  if (!taxReturn.selfEmployment) return null;

  const netProfit = calculateScheduleCProfit(taxReturn.selfEmployment);
  if (netProfit <= 400) return null;

  const seTax = calculateSelfEmploymentTax(netProfit);
  const taxableSeIncome = netProfit * 0.9235;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const { height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = height - 50;
  page.drawText('Schedule SE (Form 1040) - Self-Employment Tax', { x: 40, y, size: 13, font: boldFont });
  y -= 18;
  page.drawText('Tax Year 2025', { x: 40, y, size: 10, font });
  y -= 18;
  page.drawText(`${taxReturn.personalInfo.firstName} ${taxReturn.personalInfo.lastName}    SSN: ${formatSSN(taxReturn.personalInfo.ssn)}`, { x: 40, y, size: 10, font });

  y -= 28;
  page.drawText('Section A - Net Earnings and Tax', { x: 40, y, size: 11, font: boldFont });
  y -= 18;

  const rows: Array<[string, number]> = [
    ['2. Net profit from Schedule C', netProfit],
    ['4a. Net earnings subject to SE tax (92.35%)', taxableSeIncome],
    ['6. Self-employment tax', seTax],
    ['13. Deduction for one-half of self-employment tax', seTax * 0.5],
  ];

  for (const [label, value] of rows) {
    page.drawText(label, { x: 40, y, size: 10, font });
    page.drawText(formatCurrency(value), { x: 430, y, size: 10, font: boldFont });
    y -= 18;
  }

  page.drawText('Calculated from current app Schedule C logic; review against official IRS Schedule SE instructions before filing.', {
    x: 40,
    y: 30,
    size: 8,
    font,
    color: rgb(0.45, 0.2, 0),
  });

  return pdfDoc.save();
}

async function generateCoverPage(taxReturn: TaxReturn, manifest: FilingPacketManifest): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const { height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = height - 56;
  page.drawText('Federal Print/Mail Filing Packet (Tax Year 2025)', { x: 40, y, size: 16, font: boldFont });
  y -= 22;
  page.drawText(`${taxReturn.personalInfo.firstName} ${taxReturn.personalInfo.lastName}  |  SSN: ${formatSSN(taxReturn.personalInfo.ssn)}`, { x: 40, y, size: 10, font });
  y -= 14;
  page.drawText(`Generated ${new Date().toLocaleString('en-US')}`, { x: 40, y, size: 9, font, color: rgb(0.25, 0.25, 0.25) });

  y -= 28;
  page.drawText('Included in this packet', { x: 40, y, size: 12, font: boldFont });
  y -= 18;
  for (const form of manifest.includedForms) {
    page.drawText(`• ${form}`, { x: 52, y, size: 10, font });
    y -= 14;
  }

  y -= 16;
  page.drawText('Missing / manual items to check before mailing', { x: 40, y, size: 12, font: boldFont });
  y -= 18;
  for (const note of manifest.unsupportedOrManualForms) {
    page.drawText(`• ${note}`, { x: 52, y, size: 9, font });
    y -= 13;
  }

  y -= 20;
  page.drawText('Print & Mail checklist', { x: 40, y, size: 12, font: boldFont });
  y -= 18;
  const checklist = [
    'Review each page against source tax documents.',
    'Sign and date Form 1040 (and spouse signature if filing jointly).',
    'Attach W-2/1099 forms and any other IRS-required statements.',
    'Include payment voucher/check if tax is owed, then mail to correct IRS address for your state.',
  ];

  for (const item of checklist) {
    page.drawText(`[ ] ${item}`, { x: 52, y, size: 9, font });
    y -= 13;
  }

  page.drawText('This packet is designed for practical print/mail filing prep and is not IRS e-file XML.', {
    x: 40,
    y: 24,
    size: 8,
    font,
    color: rgb(0.5, 0, 0),
  });

  return pdfDoc.save();
}

export async function generateFederalFilingPacket(taxReturn: TaxReturn): Promise<Uint8Array> {
  if (!taxReturn.taxCalculation) {
    taxReturn.taxCalculation = calculateTaxReturn(taxReturn);
  }

  const manifest = buildFilingPacketManifest(taxReturn);
  const mainPdf = await PDFDocument.create();

  await appendPdfBytes(mainPdf, await generateCoverPage(taxReturn, manifest));
  await appendPdfBytes(mainPdf, await generateForm1040(taxReturn));
  await appendPdfBytes(mainPdf, await generateSchedule1(taxReturn));
  await appendPdfBytes(mainPdf, await generateSchedule2(taxReturn));
  await appendPdfBytes(mainPdf, await generateSchedule3(taxReturn));
  await appendPdfBytes(mainPdf, await generateScheduleB(taxReturn));
  await appendPdfBytes(mainPdf, await generateScheduleA(taxReturn));
  await appendPdfBytes(mainPdf, await generateScheduleC(taxReturn));
  await appendPdfBytes(mainPdf, await generateScheduleD(taxReturn));
  await appendPdfBytes(mainPdf, await generateScheduleE(taxReturn));
  await appendPdfBytes(mainPdf, await generateScheduleSE(taxReturn));
  await appendPdfBytes(mainPdf, await generateForm8606(taxReturn));

  return mainPdf.save();
}
