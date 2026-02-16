'use client';

import React, { useState, useEffect } from 'react';
import { useTaxReturn } from '@/lib/context/TaxReturnContext';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronUp } from 'lucide-react';

const TAX_BRACKETS_2025 = [
  { rate: 10, min: 0, max: 11600 },
  { rate: 12, min: 11600, max: 47150 },
  { rate: 22, min: 47150, max: 100525 },
  { rate: 24, min: 100525, max: 191950 },
  { rate: 32, min: 191950, max: 243725 },
  { rate: 35, min: 243725, max: 609350 },
  { rate: 37, min: 609350, max: Infinity },
];

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444'];

export default function TaxSummarySidebar() {
  const { taxCalculation, taxReturn } = useTaxReturn();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  if (!taxCalculation) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Tax Summary</h2>
        <p className="text-gray-500">Fill out your tax information to see calculations.</p>
      </div>
    );
  }

  // Calculate tax breakdown by bracket
  const taxableIncome = taxCalculation.taxableIncome;
  const bracketBreakdown = TAX_BRACKETS_2025.map(bracket => {
    const incomeInBracket = Math.max(
      0,
      Math.min(taxableIncome, bracket.max) - bracket.min
    );
    const taxInBracket = incomeInBracket * (bracket.rate / 100);
    
    return {
      bracket: `${bracket.rate}%`,
      income: incomeInBracket,
      tax: taxInBracket,
    };
  }).filter(b => b.income > 0);

  // Calculate effective and marginal tax rates
  const effectiveRate = taxableIncome > 0 
    ? (taxCalculation.regularTax / taxableIncome) * 100 
    : 0;
  
  const marginalBracket = TAX_BRACKETS_2025.find(
    b => taxableIncome >= b.min && taxableIncome < b.max
  );
  const marginalRate = marginalBracket ? marginalBracket.rate : 37;

  const rateComparison = [
    { name: 'Effective Rate', value: Math.round(effectiveRate * 100) / 100 },
    { name: 'Marginal Rate', value: marginalRate },
  ];

  // Calculate income sources
  const incomeSources = [];
  const totalW2 = taxReturn.w2Income.reduce((sum, w2) => sum + w2.wages, 0);
  const totalInterest = taxReturn.interest.reduce((sum, int) => sum + int.amount, 0);
  const totalDividends = taxReturn.dividends.reduce((sum, div) => sum + div.ordinaryDividends, 0);
  const totalCapitalGains = taxReturn.capitalGains.reduce((sum, cg) => sum + (cg.proceeds - cg.costBasis), 0);
  
  if (totalW2 > 0) incomeSources.push({ name: 'W-2 Wages', value: totalW2 });
  if (totalInterest > 0) incomeSources.push({ name: 'Interest', value: totalInterest });
  if (totalDividends > 0) incomeSources.push({ name: 'Dividends', value: totalDividends });
  if (totalCapitalGains > 0) incomeSources.push({ name: 'Capital Gains', value: totalCapitalGains });

  const isRefund = taxCalculation.refundOrAmountOwed > 0;

  return (
    <>
      {/* Desktop Sidebar - Sticky */}
      <div className="hidden lg:block sticky top-4 h-fit">
        <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Tax Summary</h2>
          
          {/* Key Metrics */}
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600">Total Income</div>
              <div className="text-2xl font-bold text-gray-900">
                ${taxCalculation.totalIncome.toLocaleString()}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600">Adjusted Gross Income</div>
              <div className="text-2xl font-bold text-gray-900">
                ${taxCalculation.agi.toLocaleString()}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600">Taxable Income</div>
              <div className="text-2xl font-bold text-gray-900">
                ${taxCalculation.taxableIncome.toLocaleString()}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600">Total Tax</div>
              <div className="text-2xl font-bold text-gray-900">
                ${taxCalculation.totalTax.toLocaleString()}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="text-sm text-gray-600">
                {isRefund ? 'Expected Refund' : 'Amount Owed'}
              </div>
              <div className={`text-3xl font-bold ${isRefund ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(taxCalculation.refundOrAmountOwed).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Tax Bracket Breakdown */}
          {bracketBreakdown.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Tax Bracket Breakdown</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={bracketBreakdown}>
                  <XAxis dataKey="bracket" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => `$${(value || 0).toLocaleString()}`}
                  />
                  <Bar dataKey="tax" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Effective vs Marginal Rate */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Tax Rates</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Effective Rate:</span>
                <span className="font-semibold">{effectiveRate.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Marginal Rate:</span>
                <span className="font-semibold">{marginalRate}%</span>
              </div>
            </div>
          </div>

          {/* Income Sources Pie Chart */}
          {incomeSources.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Income Sources</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={incomeSources}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {incomeSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${(value || 0).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Sheet - Collapsible */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t z-50">
        <button
          onClick={toggleCollapsed}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
        >
          <h2 className="text-lg font-bold text-gray-900">Tax Summary</h2>
          {isCollapsed ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {!isCollapsed && (
          <div className="p-4 max-h-[70vh] overflow-y-auto space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-600">Total Income</div>
                <div className="text-lg font-bold text-gray-900">
                  ${taxCalculation.totalIncome.toLocaleString()}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-600">AGI</div>
                <div className="text-lg font-bold text-gray-900">
                  ${taxCalculation.agi.toLocaleString()}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-600">Taxable Income</div>
                <div className="text-lg font-bold text-gray-900">
                  ${taxCalculation.taxableIncome.toLocaleString()}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-600">Total Tax</div>
                <div className="text-lg font-bold text-gray-900">
                  ${taxCalculation.totalTax.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="text-sm text-gray-600 text-center">
                {isRefund ? 'Expected Refund' : 'Amount Owed'}
              </div>
              <div className={`text-3xl font-bold text-center ${isRefund ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(taxCalculation.refundOrAmountOwed).toLocaleString()}
              </div>
            </div>

            {/* Tax Bracket Breakdown */}
            {bracketBreakdown.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Tax Bracket Breakdown</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={bracketBreakdown}>
                    <XAxis dataKey="bracket" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => `$${(value || 0).toLocaleString()}`}
                    />
                    <Bar dataKey="tax" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Income Sources */}
            {incomeSources.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Income Sources</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={incomeSources}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {incomeSources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${(value || 0).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
