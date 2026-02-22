'use client';

import { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

interface DocumentUploadProps {
  onExtract: (file: File) => Promise<any>;
  onDataExtracted: (data: any) => void;
  acceptedFormats?: string;
  label?: string;
}

export default function DocumentUpload({
  onExtract,
  onDataExtracted,
  acceptedFormats = 'image/*,.pdf',
  label = 'Upload Tax Document',
}: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
    }
  };

  const handleExtract = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setSuccess(false);

    try {
      const extractedData = await onExtract(file);
      onDataExtracted(extractedData);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract data');
    } finally {
      setIsProcessing(false);
    }
  };

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

      {success && (
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
