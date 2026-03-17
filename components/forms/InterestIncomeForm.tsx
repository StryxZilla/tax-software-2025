'use client';

import React from 'react';
import { Interest1099INT } from '../../types/tax-types';
import { Plus, Trash2, Landmark, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { validateInterest } from '../../lib/validation/form-validation';
import ValidationError from '../common/ValidationError';
import DocumentUpload from '../ocr/DocumentUpload';
import { extract1099INTData } from '../../lib/ocr/extractors/1099-int-extractor';
import CurrencyInput from '../common/CurrencyInput';

function build1099IntExtractionReport(data: Partial<Interest1099INT>) {
  const expectedFields: Array<{ key: keyof Interest1099INT; label: string }> = [
    { key: 'payer', label: 'Payer name' },
    { key: 'amount', label: 'Interest income (Box 1)' },
    { key: 'earlyWithdrawalPenalty', label: 'Early withdrawal penalty (Box 2)' },
    { key: 'usSavingsBondInterest', label: 'US Savings Bonds/Treasury (Box 3)' },
    { key: 'taxExemptInterest', label: 'Tax-exempt interest (Box 4)' },
    { key: 'investmentExpenses', label: 'Investment expenses (Box 5)' },
    { key: 'foreignTaxPaid', label: 'Foreign tax paid (Box 6)' },
  ];

  const foundFields = expectedFields
    .filter(({ key }) => {
      const value = data[key];
      return typeof value === 'number' ? value > 0 : Boolean(value);
    })
    .map(({ label }) => label);

  const missingFields = expectedFields
    .filter(({ key }) => {
      const value = data[key];
      return typeof value === 'number' ? value <= 0 : !value;
    })
    .map(({ label }) => label);

  const warnings: string[] = [];
  if (!data.amount) warnings.push('Box 1 interest income was not detected or parsed as 0.');

  return {
    documentType: '1099-INT',
    expectedFields: expectedFields.map((f) => f.label),
    foundFields,
    missingFields,
    warnings,
    guidance: [
      'Retake the photo in bright, even lighting and avoid glare.',
      'Crop tightly so payer name and Box 1 are clearly visible.',
      'Increase contrast and ensure text is in focus.',
      'If available, upload a clean PDF copy or screenshot the PDF at high resolution.',
    ],
  };
}

interface InterestIncomeFormProps {
  values: Interest1099INT[];
  onChange: (values: Interest1099INT[]) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export default function InterestIncomeForm({ values, onChange, onValidationChange }: InterestIncomeFormProps) {
  const [showAllErrors, setShowAllErrors] = React.useState(false);
  const [touchedFields, setTouchedFields] = React.useState<Set<string>>(new Set());

  // Validate all interest income
  const allErrors = values.flatMap((item, index) => validateInterest(item, index));
  const isValid = allErrors.length === 0;

  // Notify parent
  React.useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);

  const touchField = (fieldName: string) => {
    setTouchedFields(prev => new Set([...prev, fieldName]));
  };

  const getFieldError = (fieldName: string): string | undefined => {
    if (!touchedFields.has(fieldName) && !showAllErrors) return undefined;
    const error = allErrors.find(e => e.field === fieldName);
    return error?.message;
  };

  const getInputClassName = (fieldName: string) => {
    const hasError = getFieldError(fieldName);
    return `block w-full rounded-lg shadow-sm ${
      hasError
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-slate-300 focus:border-green-600 focus:ring-green-600'
    }`;
  };
  const addInterest = () => {
    onChange([...values, {
      payer: '',
      amount: 0,
      earlyWithdrawalPenalty: 0,
      usSavingsBondInterest: 0,
      backupWithholding: 0,
      investmentExpenses: 0,
      foreignTaxPaid: 0,
      foreignCountry: '',
      taxExemptInterest: 0,
    }]);
  };

  const updateInterest = (index: number, updates: Partial<Interest1099INT>) => {
    const newValues = [...values];
    newValues[index] = { ...newValues[index], ...updates };
    onChange(newValues);
  };

  const removeInterest = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const totalInterest = values.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-6 fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Interest Income (1099-INT)</h2>
          <p className="text-slate-600">Add all interest income from banks, credit unions, and other financial institutions.</p>
        </div>
        <button
          type="button"
          onClick={addInterest}
          aria-label="Add 1099-INT"
          className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-6 py-3 text-sm font-semibold text-white hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Add 1099-INT</span>
        </button>
      </div>

      {/* OCR Upload */}
      <div className="card-premium p-6">
        {process.env.NEXT_PUBLIC_FEATURE_OCR_UPLOAD === 'true' && (
          <>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Upload 1099-INT Image</h3>
            <p className="text-sm text-slate-600 mb-4">
              Take a photo of your 1099-INT form or upload a PDF, and we'll automatically extract the data.
            </p>
            <DocumentUpload
              onExtract={extract1099INTData}
              buildReport={build1099IntExtractionReport}
              onDataExtracted={(data) => {
                addInterest();
                const newIndex = values.length;
                updateInterest(newIndex, data);
              }}
              label="Upload 1099-INT Document"
            />
          </>
        )}
      </div>

      {/* Total summary */}
      {values.length > 0 && (
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8" />
              <div>
                <p className="text-green-100 text-sm font-medium">Total Interest Income</p>
                <p className="text-3xl font-bold">${totalInterest.toFixed(2)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-green-100 text-sm">{values.length} {values.length === 1 ? 'Source' : 'Sources'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Validation summary */}
      {showAllErrors && !isValid && values.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-red-800 mb-2">
                Please fix the following errors:
              </h3>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {allErrors.map((error, idx) => (
                  <li key={idx}>{error.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {values.length === 0 ? (
        <div className="card-premium p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Landmark className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No Interest Income Added Yet</h3>
          <p className="text-slate-500 mb-6">Add Form 1099-INT from banks, credit unions, and savings accounts.</p>
          <button
            type="button"
            onClick={addInterest}
            aria-label="Add first 1099-INT"
            className="inline-flex items-center space-x-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add Your First 1099-INT</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {values.map((interest, index) => (
            <div key={index} className="card-premium overflow-hidden border border-slate-200">
              {/* Card header */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-3 text-white">
                  <Landmark className="w-5 h-5" />
                  <h3 className="text-lg font-bold">1099-INT #{index + 1}</h3>
                  {interest.payer && <span className="text-green-100">• {interest.payer}</span>}
                </div>
                <button
                  type="button"
                  onClick={() => removeInterest(index)}
                  aria-label={`Remove 1099-INT ${index + 1}`}
                  className="flex items-center space-x-2 text-red-100 hover:text-white transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="sr-only">Remove</span>
                </button>
              </div>

              {/* Card body */}
              <div className="p-6 space-y-6">
                {/* Payer Information */}
                <div>
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center space-x-2">
                    <Landmark className="w-4 h-4 text-green-600" />
                    <span>Payer Information</span>
                  </h4>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Bank or Financial Institution Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={interest.payer}
                      onChange={(e) => updateInterest(index, { payer: e.target.value })}
                      onBlur={() => touchField(`interest-${index}-payer`)}
                      placeholder="e.g., Chase Bank, Ally Bank, etc."
                      className={getInputClassName(`interest-${index}-payer`)}
                    />
                    <ValidationError message={getFieldError(`interest-${index}-payer`)} />
                    {!getFieldError(`interest-${index}-payer`) && (
                      <p className="mt-1 text-xs text-slate-500 italic">Find this in the top section of your 1099-INT form</p>
                    )}
                  </div>
                </div>

                {/* Interest Amount */}
                <div className="border-t pt-6">
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span>Interest Income</span>
                  </h4>
                  <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Interest Income (Box 1) <span className="text-red-500">*</span>
                    </label>
                    <CurrencyInput
                      value={interest.amount}
                      onValueChange={(val) => updateInterest(index, { amount: val })}
                      onBlur={() => touchField(`interest-${index}-amount`)}
                      placeholder="0.00"
                      inputClassName="text-2xl font-bold py-4"
                    />
                    <ValidationError message={getFieldError(`interest-${index}-amount`)} />
                    {!getFieldError(`interest-${index}-amount`) && (
                      <p className="mt-3 text-xs text-slate-600">This is the total interest income shown in Box 1 of your 1099-INT</p>
                    )}
                  </div>
                </div>

                {/* Additional 1099-INT Boxes */}
                <div className="border-t pt-6 space-y-4">
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span>Additional Boxes (if applicable)</span>
                  </h4>

                  {/* Box 2: Early Withdrawal Penalty */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Early Withdrawal Penalty (Box 2)
                      </label>
                      <CurrencyInput
                        value={interest.earlyWithdrawalPenalty}
                        onValueChange={(val) => updateInterest(index, { earlyWithdrawalPenalty: val })}
                        placeholder="0.00"
                      />
                      <p className="mt-1 text-xs text-slate-500">Penalty for early withdrawal of funds</p>
                    </div>

                    {/* Box 3: US Savings Bonds Interest */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        US Savings Bonds / Treasury Interest (Box 3)
                      </label>
                      <CurrencyInput
                        value={interest.usSavingsBondInterest}
                        onValueChange={(val) => updateInterest(index, { usSavingsBondInterest: val })}
                        placeholder="0.00"
                      />
                      <p className="mt-1 text-xs text-slate-500">Interest from US Savings Bonds/Treasury obligations</p>
                    </div>

                    {/* Box 4: Tax-Exempt Interest */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Tax-Exempt Interest (Box 4)
                      </label>
                      <CurrencyInput
                        value={interest.taxExemptInterest}
                        onValueChange={(val) => updateInterest(index, { taxExemptInterest: val })}
                        placeholder="0.00"
                      />
                      <p className="mt-1 text-xs text-slate-500">Tax-exempt municipal bond interest</p>
                    </div>

                    {/* Box 5: Investment Expenses */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Investment Expenses (Box 5)
                      </label>
                      <CurrencyInput
                        value={interest.investmentExpenses}
                        onValueChange={(val) => updateInterest(index, { investmentExpenses: val })}
                        placeholder="0.00"
                      />
                      <p className="mt-1 text-xs text-slate-500">Deductible investment expenses</p>
                    </div>

                    {/* Box 6: Foreign Tax Paid */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Foreign Tax Paid (Box 6)
                      </label>
                      <CurrencyInput
                        value={interest.foreignTaxPaid}
                        onValueChange={(val) => updateInterest(index, { foreignTaxPaid: val })}
                        placeholder="0.00"
                      />
                      <p className="mt-1 text-xs text-slate-500">Foreign taxes paid (may be deductible)</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
