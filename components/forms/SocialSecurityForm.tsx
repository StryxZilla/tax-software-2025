'use client';

import React from 'react';
import { SocialSecurityBenefits } from '../../types/tax-types';
import { Landmark, DollarSign, TrendingUp, Info, AlertCircle } from 'lucide-react';
import { validateSocialSecurity } from '../../lib/validation/form-validation';
import ValidationError from '../common/ValidationError';
import CurrencyInput from '../common/CurrencyInput';

function getDefaultSocialSecurity(): SocialSecurityBenefits {
  return {
    benefitsReceived: 0,
    taxableBenefits: 0,
    federalTaxWithheld: 0,
  };
}

interface SocialSecurityFormProps {
  values: SocialSecurityBenefits[];
  onChange: (values: SocialSecurityBenefits[]) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export default function SocialSecurityForm({ values = [], onChange, onValidationChange }: SocialSecurityFormProps) {
  const [showAllErrors, setShowAllErrors] = React.useState(false);
  const [touchedFields, setTouchedFields] = React.useState<Set<string>>(new Set());

  // Only allow one SSN entry (you can only have one SSN)
  const ssn = values.length > 0 ? values[0] : getDefaultSocialSecurity();
  const hasSSN = values.length > 0;

  // Validate all social security data
  const allErrors = hasSSN ? validateSocialSecurity(ssn, 0) : [];
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

  const addSocialSecurity = () => {
    if (values.length === 0) {
      onChange([getDefaultSocialSecurity()]);
    }
  };

  const updateSocialSecurity = (updates: Partial<SocialSecurityBenefits>) => {
    if (values.length === 0) {
      onChange([{ ...getDefaultSocialSecurity(), ...updates }]);
    } else {
      onChange([{ ...values[0], ...updates }]);
    }
  };

  const removeSocialSecurity = () => {
    onChange([]);
  };

  const totalBenefitsReceived = ssn.benefitsReceived;
  const totalTaxableBenefits = ssn.taxableBenefits;
  const totalFederalWithheld = ssn.federalTaxWithheld;

  // Calculate provisional income for help text
  const provisionalIncome = totalBenefitsReceived * 0.5; // Simplified estimate

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-6 fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Social Security Benefits</h2>
          <p className="text-slate-600">Add Social Security benefits received during the tax year.</p>
        </div>
        {!hasSSN && (
          <button
            type="button"
            onClick={addSocialSecurity}
            aria-label="Add Social Security Benefits"
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-6 py-3 text-sm font-semibold text-white hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
          >
            <Landmark className="w-5 h-5" />
            <span>Add Social Security</span>
          </button>
        )}
      </div>

      {/* Total summary */}
      {hasSSN && (
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8" />
              <div>
                <p className="text-green-100 text-sm font-medium">Benefits Received</p>
                <p className="text-2xl font-bold">${totalBenefitsReceived.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <DollarSign className="w-8 h-8" />
              <div>
                <p className="text-green-100 text-sm font-medium">Taxable Benefits</p>
                <p className="text-2xl font-bold">${totalTaxableBenefits.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Landmark className="w-8 h-8" />
              <div>
                <p className="text-green-100 text-sm font-medium">Federal Withheld</p>
                <p className="text-2xl font-bold">${totalFederalWithheld.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation summary */}
      {showAllErrors && !isValid && hasSSN && (
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

      {!hasSSN ? (
        <div className="card-premium p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Landmark className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No Social Security Benefits Added</h3>
          <p className="text-slate-500 mb-6">Add your Social Security benefits if you receive them.</p>
          <button
            type="button"
            onClick={addSocialSecurity}
            aria-label="Add Social Security Benefits"
            className="inline-flex items-center space-x-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-all"
          >
            <Landmark className="w-5 h-5" />
            <span>Add Your Social Security</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="card-premium overflow-hidden border border-slate-200">
            {/* Card header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-3 text-white">
                <Landmark className="w-5 h-5" />
                <h3 className="text-lg font-bold">Social Security Benefits</h3>
              </div>
              <button
                type="button"
                onClick={removeSocialSecurity}
                aria-label="Remove Social Security"
                className="flex items-center space-x-2 text-red-100 hover:text-white transition-colors"
              >
                <span className="text-sm">Remove</span>
              </button>
            </div>

            {/* Card body */}
            <div className="p-6 space-y-6">
              {/* Benefits Received */}
              <div>
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span>Benefits Information</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Gross Benefits Received (Box 1) <span className="text-red-500">*</span>
                    </label>
                    <CurrencyInput
                      value={ssn.benefitsReceived}
                      onValueChange={(val) => updateSocialSecurity({ benefitsReceived: val })}
                      placeholder="0.00"
                    />
                    <ValidationError message={getFieldError('ssn-benefits')} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Taxable Benefits (Box 2)
                    </label>
                    <CurrencyInput
                      value={ssn.taxableBenefits}
                      onValueChange={(val) => updateSocialSecurity({ taxableBenefits: val })}
                      placeholder="0.00"
                    />
                    <ValidationError message={getFieldError('ssn-taxable')} />
                  </div>
                </div>
              </div>

              {/* Federal Tax Withheld */}
              <div className="border-t pt-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Federal Tax Withheld (Box 4)
                  </label>
                  <CurrencyInput
                    value={ssn.federalTaxWithheld}
                    onValueChange={(val) => updateSocialSecurity({ federalTaxWithheld: val })}
                    placeholder="0.00"
                  />
                  <ValidationError message={getFieldError('ssn-withheld')} />
                </div>
              </div>

              {/* Helpful information */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
