'use client';

import React from 'react';
import { W2Income } from '../../types/tax-types';

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
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">W-2 Income</h2>
        <button
          type="button"
          onClick={addW2}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Add W-2
        </button>
      </div>

      {values.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No W-2s added yet. Click "Add W-2" to begin.</p>
        </div>
      ) : (
        values.map((w2, index) => (
          <div key={index} className="border rounded-lg p-6 space-y-6 bg-white shadow-sm">
            <div className="flex justify-between">
              <h3 className="text-lg font-semibold">W-2 #{index + 1}</h3>
              <button
                type="button"
                onClick={() => removeW2(index)}
                className="text-red-600 hover:text-red-500"
              >
                Remove
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Employer Name
                </label>
                <input
                  type="text"
                  value={w2.employer}
                  onChange={(e) => updateW2(index, { employer: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Employer EIN
                </label>
                <input
                  type="text"
                  value={w2.ein}
                  onChange={(e) => updateW2(index, { ein: e.target.value })}
                  placeholder="XX-XXXXXXX"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Wages (Box 1)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={w2.wages}
                    onChange={(e) => updateW2(index, { wages: parseFloat(e.target.value) })}
                    className="block w-full rounded-md border-gray-300 pl-7 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Federal Tax Withheld (Box 2)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={w2.federalTaxWithheld}
                    onChange={(e) => updateW2(index, { federalTaxWithheld: parseFloat(e.target.value) })}
                    className="block w-full rounded-md border-gray-300 pl-7 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Social Security Wages (Box 3)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={w2.socialSecurityWages}
                    onChange={(e) => updateW2(index, { socialSecurityWages: parseFloat(e.target.value) })}
                    className="block w-full rounded-md border-gray-300 pl-7 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Social Security Tax Withheld (Box 4)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={w2.socialSecurityTaxWithheld}
                    onChange={(e) => updateW2(index, { socialSecurityTaxWithheld: parseFloat(e.target.value) })}
                    className="block w-full rounded-md border-gray-300 pl-7 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Medicare Wages (Box 5)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={w2.medicareWages}
                    onChange={(e) => updateW2(index, { medicareWages: parseFloat(e.target.value) })}
                    className="block w-full rounded-md border-gray-300 pl-7 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Medicare Tax Withheld (Box 6)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={w2.medicareTaxWithheld}
                    onChange={(e) => updateW2(index, { medicareTaxWithheld: parseFloat(e.target.value) })}
                    className="block w-full rounded-md border-gray-300 pl-7 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}