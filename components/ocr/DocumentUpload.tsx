'use client';

import { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2, TriangleAlert, Info } from 'lucide-react';

interface ExtractionReport {
  documentType: string;
  expectedFields: string[];
  foundFields: string[];
  missingFields: string[];
  warnings: string[];
  guidance?: string[];
}

interface DocumentUploadProps<TData = unknown> {
  onExtract: (file: File) => Promise<TData>;
  onDataExtracted: (data: TData) => void;
  buildReport?: (data: TData) => ExtractionReport;
  acceptedFormats?: string;
  label?: string;
}

export default function DocumentUpload<TData = unknown>({
  onExtract,
  onDataExtracted,
  buildReport,
  acceptedFormats = 'image/*,.pdf',
  label = 'Upload Tax Document',
}: DocumentUploadProps<TData>) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [report, setReport] = useState<ExtractionReport | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
      setReport(null);
    }
  };

  const handleExtract = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setSuccess(false);
    setReport(null);

    try {
      const extractedData = await onExtract(file);
      const nextReport = buildReport?.(extractedData) ?? null;
      onDataExtracted(extractedData);
      setReport(nextReport);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract data');
    } finally {
      setIsProcessing(false);
    }
  };

  const hasCoverageWarnings = report ? report.missingFields.length > 0 || report.warnings.length > 0 : false;
  const coveragePercent = report
    ? Math.round((report.foundFields.length / Math.max(1, report.expectedFields.length)) * 100)
    : 0;

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-center">
        <label className="flex flex-col items-center cursor-pointer">
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-xs text-gray-500 mt-1">
            JPG, PNG, or PDF
          </span>
          <input
            type="file"
            accept={acceptedFormats}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {file && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <FileText className="w-4 h-4" />
            <span className="truncate">{file.name}</span>
          </div>

          <button
            onClick={handleExtract}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Extracting data...
              </span>
            ) : (
              'Extract Data'
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Extraction failed</p>
            <p className="text-sm text-red-700">{error}</p>
            <p className="text-xs text-red-700 mt-1">You can continue by entering values manually below.</p>
          </div>
        </div>
      )}

      {success && report && hasCoverageWarnings && (
        <div className="space-y-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <TriangleAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Partial extraction completed — review required</p>
              <p className="text-sm text-amber-800">
                We found {report.foundFields.length} of {report.expectedFields.length} expected {report.documentType} fields ({coveragePercent}% coverage).
              </p>
            </div>
          </div>

          {report.missingFields.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-amber-900 uppercase tracking-wide">Missing fields</p>
              <ul className="mt-1 text-sm text-amber-800 list-disc list-inside">
                {report.missingFields.map((field) => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
            </div>
          )}

          {report.warnings.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-amber-900 uppercase tracking-wide">Issues detected</p>
              <ul className="mt-1 text-sm text-amber-800 list-disc list-inside">
                {report.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-amber-900 uppercase tracking-wide">Recommended next steps</p>
            <ul className="mt-1 text-sm text-amber-800 list-disc list-inside">
              {(report.guidance ?? [
                'Retake photo in brighter, even lighting.',
                'Crop tightly to the tax form so field labels are visible.',
                'Increase contrast and ensure text is sharp.',
                'If available, upload a clean PDF copy or screenshot the PDF at high resolution.',
              ]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {success && report && !hasCoverageWarnings && (
        <div className="space-y-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">Data extracted successfully</p>
              <p className="text-sm text-green-700">
                Found all expected {report.documentType} fields ({report.foundFields.length}/{report.expectedFields.length}, {coveragePercent}% coverage).
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-xs text-green-700">
            <Info className="w-4 h-4 mt-0.5" />
            <p>OCR confidence is estimated by field coverage and parser checks. Please still review values before submitting.</p>
          </div>
        </div>
      )}

      {success && !report && (
        <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">Data extracted successfully!</p>
            <p className="text-sm text-green-700">Review the extracted data below and make any necessary corrections.</p>
          </div>
        </div>
      )}
    </div>
  );
}
