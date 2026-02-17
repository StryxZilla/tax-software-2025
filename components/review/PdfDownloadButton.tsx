'use client';

import React, { useState } from 'react';
import { Download, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Main Download Button - Premium Design */}
      <div className="card-premium overflow-hidden">
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className={`
            w-full flex items-center justify-center gap-4 px-8 py-6 font-bold text-xl
            transition-all duration-300 relative overflow-hidden
            ${isGenerating 
              ? 'bg-gradient-to-r from-slate-400 to-slate-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white shadow-lg hover:shadow-2xl active:scale-[0.98]'
            }
          `}
        >
          {/* Animated background shimmer (only when not generating) */}
          {!isGenerating && (
            <div className="absolute inset-0 opacity-30">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse" />
            </div>
          )}
          
          <div className="relative flex items-center gap-4">
            {isGenerating ? (
              <>
                <Loader2 className="w-7 h-7 animate-spin" />
                <span>Generating Your Tax Forms...</span>
              </>
            ) : (
              <>
                <Download className="w-7 h-7" />
                <span>Download Complete Tax Return (PDF)</span>
              </>
            )}
          </div>
        </button>
      </div>

      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 mb-1">Error Generating PDF</p>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer - Professional */}
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-6 shadow-sm">
        <div className="flex gap-4">
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="font-bold text-amber-900 text-sm uppercase tracking-wide">
              Important Disclaimer
            </p>
            <p className="text-sm text-amber-800 leading-relaxed">
              This PDF is generated <strong>for informational purposes only</strong>. 
              Please verify all data before filing with the IRS. This software does not constitute 
              tax advice. Consult with a qualified tax professional if you have questions.
            </p>
          </div>
        </div>
      </div>

      {/* What's Included - Premium Info Box */}
      <div className="card-premium p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
        <div className="flex items-start gap-4">
          <div className="bg-blue-600 rounded-lg p-2">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-blue-900 mb-3 text-lg">
              📋 What&apos;s Included in Your Download
            </p>
            <p className="text-sm text-blue-800 mb-4">
              Your PDF package contains Form 1040 and all applicable schedules based on your tax situation:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-blue-900">Form 1040 - Individual Tax Return</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-blue-900">Schedule 1 - Additional Income</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-blue-900">Schedule 2 - Additional Taxes</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-blue-900">Schedule 3 - Credits & Payments</span>
              </div>
              {taxReturn.itemizedDeductions && (
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-blue-900">Schedule A - Itemized Deductions</span>
                </div>
              )}
              {taxReturn.selfEmployment && (
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-blue-900">Schedule C - Business Income</span>
                </div>
              )}
              {taxReturn.capitalGains.length > 0 && (
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-blue-900">Schedule D - Capital Gains</span>
                </div>
              )}
              {taxReturn.rentalProperties.length > 0 && (
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-blue-900">Schedule E - Rental Income</span>
                </div>
              )}
              {taxReturn.form8606 && (
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-blue-900">Form 8606 - Nondeductible IRAs</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
