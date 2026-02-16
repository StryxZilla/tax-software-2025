'use client';

import React, { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { TaxReturn } from '../../types/tax-types';
import { generateAllForms } from '../../lib/engine/pdf/pdf-generator';

interface PdfDownloadButtonProps {
  taxReturn: TaxReturn;
}

export default function PdfDownloadButton({ taxReturn }: PdfDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Generate the PDF
      const pdfBytes = await generateAllForms(taxReturn);

      // Create a blob from the PDF bytes
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });

      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Create filename with taxpayer name and year
      const fileName = `Tax_Return_2025_${taxReturn.personalInfo.lastName}_${taxReturn.personalInfo.firstName}.pdf`;
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleDownload}
        disabled={isGenerating}
        className={`
          w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-semibold text-lg
          transition-all duration-200 shadow-md hover:shadow-lg
          ${isGenerating 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
          }
        `}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            Generating PDF...
          </>
        ) : (
          <>
            <Download className="w-6 h-6" />
            Download Tax Forms (PDF)
          </>
        )}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex gap-3">
          <FileText className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-semibold mb-1">Important Disclaimer</p>
            <p>
              This PDF is generated <strong>for informational purposes only</strong>. 
              Please verify all data before filing with the IRS. This software does not constitute 
              tax advice. Consult with a qualified tax professional if you have questions.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>What&apos;s included:</strong> Your PDF package will contain Form 1040 and all 
          applicable schedules based on your tax situation:
        </p>
        <ul className="mt-2 ml-5 list-disc text-sm text-blue-800 space-y-1">
          <li>Form 1040 - U.S. Individual Income Tax Return</li>
          <li>Schedule 1 - Additional Income and Adjustments</li>
          <li>Schedule 2 - Additional Taxes</li>
          <li>Schedule 3 - Additional Credits and Payments</li>
          {taxReturn.itemizedDeductions && <li>Schedule A - Itemized Deductions</li>}
          {taxReturn.selfEmployment && <li>Schedule C - Business Profit or Loss</li>}
          {taxReturn.capitalGains.length > 0 && <li>Schedule D - Capital Gains and Losses</li>}
          {taxReturn.rentalProperties.length > 0 && <li>Schedule E - Rental Income and Expenses</li>}
          {taxReturn.form8606 && <li>Form 8606 - Nondeductible IRAs</li>}
        </ul>
      </div>
    </div>
  );
}
