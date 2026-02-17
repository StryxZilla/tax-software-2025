'use client';

import React from 'react';
import { W2Income } from '../../types/tax-types';
import { Plus, Trash2, Briefcase, Building2, DollarSign, AlertCircle } from 'lucide-react';
import { validateW2 } from '../../lib/validation/form-validation';
import ValidationError from '../common/ValidationError';

interface W2FormProps {
  values: W2Income[];
  onChange: (values: W2Income[]) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export default function W2Form({ values, onChange, onValidationChange }: W2FormProps) {
  const [showAllErrors, setShowAllErrors] = React.useState(false);
  const [touchedFields, setTouchedFields] = React.useState<Set<string>>(new Set());

  // Validate all W-2s
  const allErrors = values.flatMap((w2, index) => validateW2(w2, index));
  const isValid = allErrors.length === 0;

  // Notify parent of validation state
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
        : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600'
    }`;
  };

  const addW2 = () => {
    onChange([...values, {
      employer: '',
      ein: '',
      wages: 0,
      federalTaxWithheld: 0,
      socialSecurityWages: 0,
      socialSecurityTaxWithheld: 0,
      medicareWages: 0,
      medicareTaxWithheld: 0,
    }]);
  };

  const updateW2 = (index: number, updates: Partial<W2Income>) => {
    const newValues = [...values];
    newValues[index] = { ...newValues[index], ...updates };
    onChange(newValues);
  };

  const removeW2 = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-6 fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">W-2 Income</h2>
          <p className="text-slate-600">Add all W-2 forms you received from employers in 2025.</p>
        </div>
        <button
          type="button"
          onClick={addW2}
          className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-sm font-semibold text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Add W-2</span>
        </button>
      </div>

      {/* Validation summary */}
      {showAllErrors && !isValid && (
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Briefcase className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No W-2s Added Yet</h3>
          <p className="text-slate-500 mb-6">Click "Add W-2" to begin entering your wage information.</p>
          <button
            type="button"
            onClick={addW2}
            className="inline-flex items-center space-x-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add Your First W-2</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {values.map((w2, index) => (
            <div key={index} className="card-premium overflow-hidden border border-slate-200">
              {/* Card header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-3 text-white">
                  <Building2 className="w-5 h-5" />
                  <h3 className="text-lg font-bold">W-2 #{index + 1}</h3>
                  {w2.employer && <span className="text-blue-100">• {w2.employer}</span>}
                </div>
                <button
                  type="button"
                  onClick={() => removeW2(index)}
                  className="flex items-center space-x-2 text-red-100 hover:text-white transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Remove</span>
                </button>
              </div>

              {/* Card body */}
              <div className="p-6 space-y-6">
                {/* Employer Information */}
                <div>
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Employer Information</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Employer Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={w2.employer}
                        onChange={(e) => updateW2(index, { employer: e.target.value })}
                        onBlur={() => touchField(`w2-${index}-employer`)}
                        placeholder="Company name"
                        className={getInputClassName(`w2-${index}-employer`)}
                      />
                      <ValidationError message={getFieldError(`w2-${index}-employer`)} />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Employer EIN <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={w2.ein}
                        onChange={(e) => updateW2(index, { ein: e.target.value })}
                        onBlur={() => touchField(`w2-${index}-ein`)}
                        placeholder="XX-XXXXXXX"
                        className={getInputClassName(`w2-${index}-ein`)}
                      />
                      <ValidationError message={getFieldError(`w2-${index}-ein`)} />
                      {!getFieldError(`w2-${index}-ein`) && (
                        <p className="mt-1 text-xs text-slate-500">Found on box b of your W-2</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Income and Withholding */}
                <div>
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span>Income and Withholding</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Wages (Box 1) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">$</span>
                        <input
                          type="number"
                          value={w2.wages || ''}
                          onChange={(e) => updateW2(index, { wages: parseFloat(e.target.value) || 0 })}
                          onBlur={() => touchField(`w2-${index}-wages`)}
                          placeholder="0.00"
                          className={`pl-7 ${getInputClassName(`w2-${index}-wages`)}`}
                        />
                      </div>
                      <ValidationError message={getFieldError(`w2-${index}-wages`)} />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Federal Tax Withheld (Box 2)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">$</span>
                        <input
                          type="number"
                          value={w2.federalTaxWithheld || ''}
                          onChange={(e) => updateW2(index, { federalTaxWithheld: parseFloat(e.target.value) || 0 })}
                          onBlur={() => touchField(`w2-${index}-federalTax`)}
                          placeholder="0.00"
                          className={`pl-7 ${getInputClassName(`w2-${index}-federalTax`)}`}
                        />
                      </div>
                      <ValidationError message={getFieldError(`w2-${index}-federalTax`)} />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Social Security Wages (Box 3)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">$</span>
                        <input
                          type="number"
                          value={w2.socialSecurityWages || ''}
                          onChange={(e) => updateW2(index, { socialSecurityWages: parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                          className="pl-7 block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Social Security Tax Withheld (Box 4)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">$</span>
                        <input
                          type="number"
                          value={w2.socialSecurityTaxWithheld || ''}
                          onChange={(e) => updateW2(index, { socialSecurityTaxWithheld: parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                          className="pl-7 block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Medicare Wages (Box 5)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">$</span>
                        <input
                          type="number"
                          value={w2.medicareWages || ''}
                          onChange={(e) => updateW2(index, { medicareWages: parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                          className="pl-7 block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Medicare Tax Withheld (Box 6)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">$</span>
                        <input
                          type="number"
                          value={w2.medicareTaxWithheld || ''}
                          onChange={(e) => updateW2(index, { medicareTaxWithheld: parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                          className="pl-7 block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                        />
                      </div>
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
