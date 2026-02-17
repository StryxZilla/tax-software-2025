'use client';

import React from 'react';
import { W2Income } from '../../types/tax-types';
import { Plus, Trash2, Briefcase, Building2, DollarSign } from 'lucide-react';

interface W2FormProps {
  values: W2Income[];
  onChange: (values: W2Income[]) => void;
}

export default function W2Form({ values, onChange }: W2FormProps) {
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
                        placeholder="Company Name Inc."
                        className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Employer EIN <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={w2.ein}
                        onChange={(e) => updateW2(index, { ein: e.target.value })}
                        placeholder="XX-XXXXXXX"
                        className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                      />
                      <p className="mt-1 text-xs text-slate-500">Find this on your W-2 form</p>
                    </div>
                  </div>
                </div>

                {/* Wages & Withholding */}
                <div className="border-t pt-6">
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span>Wages & Federal Withholding</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Wages (Box 1) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-slate-500 font-semibold">$</span>
                        </div>
                        <input
                          type="number"
                          value={w2.wages || ''}
                          onChange={(e) => updateW2(index, { wages: parseFloat(e.target.value) || 0 })}
                          className="block w-full rounded-lg border-green-300 pl-8 focus:border-green-600 focus:ring-green-600 font-semibold text-lg"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Federal Tax Withheld (Box 2)
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-slate-500 font-semibold">$</span>
                        </div>
                        <input
                          type="number"
                          value={w2.federalTaxWithheld || ''}
                          onChange={(e) => updateW2(index, { federalTaxWithheld: parseFloat(e.target.value) || 0 })}
                          className="block w-full rounded-lg border-blue-300 pl-8 focus:border-blue-600 focus:ring-blue-600 font-semibold text-lg"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Security */}
                <div className="border-t pt-6">
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">
                    Social Security (Boxes 3-4)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Social Security Wages (Box 3)
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-slate-500 font-semibold">$</span>
                        </div>
                        <input
                          type="number"
                          value={w2.socialSecurityWages || ''}
                          onChange={(e) => updateW2(index, { socialSecurityWages: parseFloat(e.target.value) || 0 })}
                          className="block w-full rounded-lg border-slate-300 pl-8 focus:border-blue-600 focus:ring-blue-600"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Social Security Tax Withheld (Box 4)
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-slate-500 font-semibold">$</span>
                        </div>
                        <input
                          type="number"
                          value={w2.socialSecurityTaxWithheld || ''}
                          onChange={(e) => updateW2(index, { socialSecurityTaxWithheld: parseFloat(e.target.value) || 0 })}
                          className="block w-full rounded-lg border-slate-300 pl-8 focus:border-blue-600 focus:ring-blue-600"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medicare */}
                <div className="border-t pt-6">
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">
                    Medicare (Boxes 5-6)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Medicare Wages (Box 5)
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-slate-500 font-semibold">$</span>
                        </div>
                        <input
                          type="number"
                          value={w2.medicareWages || ''}
                          onChange={(e) => updateW2(index, { medicareWages: parseFloat(e.target.value) || 0 })}
                          className="block w-full rounded-lg border-slate-300 pl-8 focus:border-blue-600 focus:ring-blue-600"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Medicare Tax Withheld (Box 6)
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-slate-500 font-semibold">$</span>
                        </div>
                        <input
                          type="number"
                          value={w2.medicareTaxWithheld || ''}
                          onChange={(e) => updateW2(index, { medicareTaxWithheld: parseFloat(e.target.value) || 0 })}
                          className="block w-full rounded-lg border-slate-300 pl-8 focus:border-blue-600 focus:ring-blue-600"
                          placeholder="0.00"
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
