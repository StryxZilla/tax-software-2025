'use client';

import React, { useEffect, useState } from 'react';
import { TraditionalIRAContribution, RothIRAContribution, Form8606Data } from '../../types/tax-types';
import { calculateForm8606, validateMegaBackdoorRoth } from '../../lib/engine/forms/form-8606';
import { validateRetirement } from '../../lib/validation/form-validation';
import { AlertCircle } from 'lucide-react';
import ValidationError from '../common/ValidationError';

interface RetirementFormProps {
  traditionalIRA?: TraditionalIRAContribution;
  rothIRA?: RothIRAContribution;
  form8606?: Form8606Data;
  onUpdate: (updates: {
    traditionalIRA?: TraditionalIRAContribution;
    rothIRA?: RothIRAContribution;
    form8606?: Form8606Data;
  }) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export default function RetirementForm({ 
  traditionalIRA,
  rothIRA,
  form8606,
  onUpdate,
  onValidationChange,
}: RetirementFormProps) {
  const [showMegaBackdoorHelp, setShowMegaBackdoorHelp] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Validation
  const errors = validateRetirement(traditionalIRA, rothIRA, form8606);
  const isValid = errors.length === 0;

  // Notify parent of validation state
  useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);

  // Update Form 8606 analysis when data changes
  useEffect(() => {
    if (form8606) {
      const analysis = validateMegaBackdoorRoth(form8606);
      setWarnings(analysis.warnings);
      setRecommendations(analysis.recommendations);
    }
  }, [form8606]);

  const touchField = (fieldName: string) => {
    setTouchedFields(prev => new Set([...prev, fieldName]));
  };

  const getFieldError = (fieldName: string): string | undefined => {
    if (!touchedFields.has(fieldName) && !showAllErrors) return undefined;
    const error = errors.find(e => e.field === fieldName);
    return error?.message;
  };

  const getInputClassName = (fieldName: string) => {
    const hasError = getFieldError(fieldName);
    return `block w-full rounded-md shadow-sm ${
      hasError
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
    }`;
  };

  const handleTraditionalIRAChange = (updates: Partial<TraditionalIRAContribution>) => {
    onUpdate({
      traditionalIRA: {
        ...traditionalIRA,
        ...updates,
      } as TraditionalIRAContribution,
      rothIRA,
      form8606,
    });
  };

  const handleRothIRAChange = (updates: Partial<RothIRAContribution>) => {
    onUpdate({
      traditionalIRA,
      rothIRA: {
        ...rothIRA,
        ...updates,
      } as RothIRAContribution,
      form8606,
    });
  };

  const handleForm8606Change = (updates: Partial<Form8606Data>) => {
    onUpdate({
      traditionalIRA,
      rothIRA,
      form8606: {
        ...form8606,
        ...updates,
      } as Form8606Data,
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Retirement Accounts</h2>
        <button
          type="button"
          onClick={() => setShowMegaBackdoorHelp(!showMegaBackdoorHelp)}
          className="text-blue-600 hover:text-blue-500"
        >
          {showMegaBackdoorHelp ? 'Hide Help' : 'Mega Backdoor Help'}
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
                {errors.map((error, idx) => (
                  <li key={idx}>{error.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {showMegaBackdoorHelp && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Mega Backdoor Roth Strategy</h3>
          <div className="prose prose-blue max-w-none">
            <p>The mega backdoor Roth strategy allows you to contribute additional after-tax money to your retirement accounts. Here's how it works:</p>
            <ol>
              <li>Make after-tax contributions to your traditional IRA</li>
              <li>Convert these contributions to a Roth IRA (usually immediately)</li>
              <li>The conversion is tax-free if you have no pre-tax money in any traditional IRAs</li>
            </ol>
            <p className="font-semibold">Important: Having pre-tax money in any traditional IRA will trigger the pro-rata rule, making part of your conversion taxable.</p>
          </div>
        </div>
      )}

      {/* Traditional IRA Section */}
      <div className="border rounded-lg p-6 space-y-6 bg-white shadow-sm">
        <h3 className="text-lg font-semibold">Traditional IRA</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contribution Amount
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                value={traditionalIRA?.amount || 0}
                onChange={(e) => handleTraditionalIRAChange({ amount: parseFloat(e.target.value) || 0 })}
                onBlur={() => touchField('retirement-traditional-amount')}
                min="0"
                max="8000"
                className={`pl-7 ${getInputClassName('retirement-traditional-amount')}`}
              />
            </div>
            <ValidationError message={getFieldError('retirement-traditional-amount')} />
            {!getFieldError('retirement-traditional-amount') && (
              <p className="mt-1 text-xs text-gray-500">2025 limit: $7,000 ($8,000 if age 50+)</p>
            )}
          </div>

          <div className="flex items-center space-x-2 pt-6">
            <input
              type="checkbox"
              id="isDeductible"
              checked={traditionalIRA?.isDeductible || false}
              onChange={(e) => handleTraditionalIRAChange({ isDeductible: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isDeductible" className="text-sm font-medium text-gray-700">
              Contribution is deductible
            </label>
          </div>
        </div>
      </div>

      {/* Roth IRA Section */}
      <div className="border rounded-lg p-6 space-y-6 bg-white shadow-sm">
        <h3 className="text-lg font-semibold">Roth IRA</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Contribution Amount
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              value={rothIRA?.amount || 0}
              onChange={(e) => handleRothIRAChange({ amount: parseFloat(e.target.value) || 0 })}
              onBlur={() => touchField('retirement-roth-amount')}
              min="0"
              max="8000"
              className={`pl-7 ${getInputClassName('retirement-roth-amount')}`}
            />
          </div>
          <ValidationError message={getFieldError('retirement-roth-amount')} />
          {!getFieldError('retirement-roth-amount') && (
            <p className="mt-1 text-xs text-gray-500">2025 limit: $7,000 ($8,000 if age 50+)</p>
          )}
        </div>

        {/* Combined limit warning */}
        {getFieldError('retirement-combined-limit') && (
          <ValidationError message={getFieldError('retirement-combined-limit')} />
        )}
      </div>

      {/* Form 8606 Section (Mega Backdoor Roth) */}
      <div className="border rounded-lg p-6 space-y-6 bg-white shadow-sm">
        <h3 className="text-lg font-semibold">Form 8606 - Nondeductible IRAs</h3>
        <p className="text-sm text-gray-600 mb-4">
          Use this section if you made nondeductible (after-tax) contributions or did a Roth conversion.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nondeductible Contributions (Current Year)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                value={form8606?.nondeductibleContributions || 0}
                onChange={(e) => handleForm8606Change({ nondeductibleContributions: parseFloat(e.target.value) || 0 })}
                onBlur={() => touchField('retirement-8606-nondeductible')}
                min="0"
                className={`pl-7 ${getInputClassName('retirement-8606-nondeductible')}`}
              />
            </div>
            <ValidationError message={getFieldError('retirement-8606-nondeductible')} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Prior Year Basis
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                value={form8606?.priorYearBasis || 0}
                onChange={(e) => handleForm8606Change({ priorYearBasis: parseFloat(e.target.value) || 0 })}
                onBlur={() => touchField('retirement-8606-priorBasis')}
                min="0"
                className={`pl-7 ${getInputClassName('retirement-8606-priorBasis')}`}
              />
            </div>
            <ValidationError message={getFieldError('retirement-8606-priorBasis')} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount Converted to Roth
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                value={form8606?.conversionsToRoth || 0}
                onChange={(e) => handleForm8606Change({ conversionsToRoth: parseFloat(e.target.value) || 0 })}
                onBlur={() => touchField('retirement-8606-conversions')}
                min="0"
                className={`pl-7 ${getInputClassName('retirement-8606-conversions')}`}
              />
            </div>
            <ValidationError message={getFieldError('retirement-8606-conversions')} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Traditional IRA Balance (End of Year)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                value={form8606?.endOfYearTraditionalIRABalance || 0}
                onChange={(e) => handleForm8606Change({ endOfYearTraditionalIRABalance: parseFloat(e.target.value) || 0 })}
                onBlur={() => touchField('retirement-8606-balance')}
                min="0"
                className={`pl-7 ${getInputClassName('retirement-8606-balance')}`}
              />
            </div>
            <ValidationError message={getFieldError('retirement-8606-balance')} />
          </div>
        </div>

        {/* Form 8606 Analysis */}
        {form8606 && (form8606.conversionsToRoth > 0 || form8606.nondeductibleContributions > 0) && (
          <div className="mt-8 space-y-4">
            <h4 className="font-semibold">Analysis</h4>
            
            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h5 className="text-yellow-800 font-medium mb-2">Warnings</h5>
                <ul className="list-disc list-inside text-yellow-700 space-y-1">
                  {warnings.map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <h5 className="text-green-800 font-medium mb-2">Recommendations</h5>
                <ul className="list-disc list-inside text-green-700 space-y-1">
                  {recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Calculation Results */}
            {form8606 && (form8606.conversionsToRoth > 0) && (
              <div className="bg-white border rounded-md p-4">
                <h5 className="font-medium mb-2">Conversion Results</h5>
                {(() => {
                  const results = calculateForm8606(form8606);
                  return (
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm text-gray-600">Total Converted</dt>
                        <dd className="text-lg font-medium">${results.line16_amountConverted.toLocaleString()}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-600">Nontaxable Amount</dt>
                        <dd className="text-lg font-medium text-green-600">${results.line17_nontaxablePortion.toLocaleString()}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-600">Taxable Amount</dt>
                        <dd className="text-lg font-medium text-red-600">${results.line18_taxablePortion.toLocaleString()}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-600">Remaining Basis</dt>
                        <dd className="text-lg font-medium">${results.remainingBasis.toLocaleString()}</dd>
                      </div>
                    </dl>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
