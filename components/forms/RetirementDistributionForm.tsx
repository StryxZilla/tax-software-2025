'use client';
import React from 'react';
import { Form1099R } from '../../types/tax-types';

interface Props {
  values?: Form1099R[];
  onChange: (values: Form1099R[]) => void;
}

const DISTRIBUTION_CODES = [
  { value: '', label: 'Select code' },
  { value: '1', label: '1 – Early distribution (no known exception)' },
  { value: '2', label: '2 – Early distribution (exception applies)' },
  { value: '3', label: '3 – Disability' },
  { value: '4', label: '4 – Death' },
  { value: '5', label: '5 – Prohibited transaction' },
  { value: '6', label: '6 – Section 1035 tax-free exchange' },
  { value: '7', label: '7 – Normal distribution' },
  { value: '8', label: '8 – Excess contributions plus earnings' },
  { value: '9', label: '9 – Cost of current life insurance protection' },
  { value: 'A', label: 'A – May be eligible for 10-year tax option' },
  { value: 'B', label: 'B – Designated Roth account distribution' },
  { value: 'C', label: 'C – Reportable death benefits' },
  { value: 'D', label: 'D – Annuity payments (section 1411 taxes)' },
  { value: 'E', label: 'E – Distributions under EPCRS' },
  { value: 'F', label: 'F – Charitable gift annuity' },
  { value: 'G', label: 'G – Direct rollover to qualified plan/IRA' },
  { value: 'H', label: 'H – Direct rollover to Roth IRA' },
  { value: 'J', label: 'J – Early distribution from Roth IRA' },
  { value: 'K', label: 'K – IRA assets without readily available FMV' },
  { value: 'L', label: 'L – Loans treated as deemed distributions' },
  { value: 'M', label: 'M – Qualified plan loan offset' },
  { value: 'N', label: 'N – Recharacterized IRA contribution (2025)' },
  { value: 'P', label: 'P – Excess contributions (2024)' },
  { value: 'Q', label: 'Q – Qualified Roth IRA distribution' },
  { value: 'R', label: 'R – Recharacterized IRA (2024→2025)' },
  { value: 'S', label: 'S – Early SIMPLE IRA distribution' },
  { value: 'T', label: 'T – Roth IRA (exception applies)' },
  { value: 'U', label: 'U – ESOP dividend distribution' },
  { value: 'W', label: 'W – Long-term care insurance' },
  { value: 'Y', label: 'Y – Qualified charitable distribution (QCD)' },
];

function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseCurrency(value: string): number {
  return parseFloat(value.replace(/,/g, '')) || 0;
}

export default function RetirementDistributionForm({ values = [], onChange }: Props) {
  const addForm = () => {
    onChange([...values, { id: crypto.randomUUID(), payer: '', grossDistribution: 0, taxableAmount: 0, federalTaxWithheld: 0, employeeContributions: 0, distributionCode: '' }]);
  };

  const updateForm = (index: number, field: string, value: any) => {
    const updated = [...values];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeForm = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Retirement Distributions (1099-R)</h2>
        <button onClick={addForm} className="px-4 py-2 bg-blue-600 text-white rounded">Add 1099-R</button>
      </div>
      {values.map((form, idx) => (
        <div key={form.id} className="border p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Payer Name</label>
              <input placeholder="Payer name" value={form.payer} onChange={e => updateForm(idx, 'payer', e.target.value)} className="border p-2 rounded w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Box 7: Distribution Code</label>
              <select value={form.distributionCode} onChange={e => updateForm(idx, 'distributionCode', e.target.value)} className="border p-2 rounded w-full">
                {DISTRIBUTION_CODES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Box 1: Gross Distribution</label>
              <input type="text" placeholder="0.00" value={typeof form.grossDistribution === 'number' ? formatCurrency(form.grossDistribution) : ''} onChange={e => updateForm(idx, 'grossDistribution', parseCurrency(e.target.value))} className="border p-2 rounded w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Box 2a: Taxable Amount</label>
              <input type="text" placeholder="0.00" value={typeof form.taxableAmount === 'number' ? formatCurrency(form.taxableAmount) : ''} onChange={e => updateForm(idx, 'taxableAmount', parseCurrency(e.target.value))} className="border p-2 rounded w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Box 4: Federal Tax Withheld</label>
              <input type="text" placeholder="0.00" value={typeof form.federalTaxWithheld === 'number' ? formatCurrency(form.federalTaxWithheld) : ''} onChange={e => updateForm(idx, 'federalTaxWithheld', parseCurrency(e.target.value))} className="border p-2 rounded w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Box 5: Employee Contributions</label>
              <input type="text" placeholder="0.00" value={typeof form.employeeContributions === 'number' ? formatCurrency(form.employeeContributions) : ''} onChange={e => updateForm(idx, 'employeeContributions', parseCurrency(e.target.value))} className="border p-2 rounded w-full" />
            </div>
          </div>
          <button onClick={() => removeForm(idx)} className="text-red-600">Remove</button>
        </div>
      ))}
    </div>
  );
}
