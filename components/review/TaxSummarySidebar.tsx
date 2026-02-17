'use client';

import React, { useState, useEffect } from 'react';
import { useTaxReturn } from '@/lib/context/TaxReturnContext';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';

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
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 shadow-xl rounded-2xl p-8 border border-slate-200">
        <div className="flex items-center space-x-3 mb-4">
          <DollarSign className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-slate-900">Tax Summary</h2>
        </div>
        <div className="bg-white rounded-lg p-6 text-center">
          <p className="text-slate-500">Fill out your tax information to see live calculations.</p>
        </div>
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
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 shadow-xl rounded-2xl overflow-hidden border border-slate-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-7 h-7" />
              <h2 className="text-2xl font-bold">Tax Summary</h2>
            </div>
            <p className="text-blue-100 text-sm mt-1">Live calculation</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Key Metrics */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Total Income</div>
                <div className="text-2xl font-bold text-slate-900 currency">
                  ${taxCalculation.totalIncome.toLocaleString()}
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Adjusted Gross Income</div>
                <div className="text-2xl font-bold text-slate-900 currency">
                  ${taxCalculation.agi.toLocaleString()}
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Taxable Income</div>
                <div className="text-2xl font-bold text-slate-900 currency">
                  ${taxCalculation.taxableIncome.toLocaleString()}
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Total Tax</div>
                <div className="text-2xl font-bold text-slate-900 currency">
                  ${taxCalculation.totalTax.toLocaleString()}
                </div>
              </div>

              {/* Refund/Owed - Highlighted */}
              <div className={`
                rounded-xl p-5 shadow-lg border-2
                ${isRefund 
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
                  : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'
                }
              `}>
                <div className="flex items-center space-x-2 mb-2">
                  {isRefund ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  )}
                  <div className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    {isRefund ? 'Expected Refund' : 'Amount Owed'}
                  </div>
                </div>
                <div className={`text-4xl font-bold number-emphasis ${isRefund ? 'text-green-600' : 'text-red-600'}`}>
                  ${Math.abs(taxCalculation.refundOrAmountOwed).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Tax Rates */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center space-x-2 mb-4">
                <Percent className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Tax Rates</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Effective Rate</span>
                  <span className="text-lg font-bold text-blue-600">{effectiveRate.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Marginal Rate</span>
                  <span className="text-lg font-bold text-blue-600">{marginalRate}%</span>
                </div>
              </div>
            </div>

            {/* Tax Bracket Breakdown */}
            {bracketBreakdown.length > 0 && (
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Tax by Bracket</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={bracketBreakdown}>
                    <XAxis 
                      dataKey="bracket" 
                      tick={{ fontSize: 12 }}
                      stroke="#94a3b8"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="#94a3b8"
                    />
                    <Tooltip 
                      formatter={(value) => `$${(value || 0).toLocaleString()}`}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="tax" 
                      fill="url(#colorGradient)" 
                      radius={[6, 6, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#1e40af" stopOpacity={1}/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Income Sources Pie Chart */}
            {incomeSources.length > 0 && (
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Income Sources</h3>
                <ResponsiveContainer width="100%" height={180}>
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
                    <Tooltip 
                      formatter={(value) => `$${(value || 0).toLocaleString()}`}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet - Collapsible */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t-2 border-blue-600 z-50 rounded-t-2xl">
        <button
          onClick={toggleCollapsed}
          className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <DollarSign className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Tax Summary</h2>
          </div>
          {isCollapsed ? (
            <ChevronUp className="w-6 h-6 text-slate-600" />
          ) : (
            <ChevronDown className="w-6 h-6 text-slate-600" />
          )}
        </button>

        {!isCollapsed && (
          <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4 bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Total Income</div>
                <div className="text-lg font-bold text-slate-900 currency">
                  ${taxCalculation.totalIncome.toLocaleString()}
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">AGI</div>
                <div className="text-lg font-bold text-slate-900 currency">
                  ${taxCalculation.agi.toLocaleString()}
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Taxable</div>
                <div className="text-lg font-bold text-slate-900 currency">
                  ${taxCalculation.taxableIncome.toLocaleString()}
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Total Tax</div>
                <div className="text-lg font-bold text-slate-900 currency">
                  ${taxCalculation.totalTax.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Refund/Owed - Highlighted */}
            <div className={`
              rounded-xl p-4 shadow-lg border-2
              ${isRefund 
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
                : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'
              }
            `}>
              <div className="text-sm font-semibold text-slate-700 text-center mb-2">
                {isRefund ? 'Expected Refund' : 'Amount Owed'}
              </div>
              <div className={`text-4xl font-bold text-center number-emphasis ${isRefund ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(taxCalculation.refundOrAmountOwed).toLocaleString()}
              </div>
            </div>

            {/* Tax Bracket Breakdown */}
            {bracketBreakdown.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Tax by Bracket</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={bracketBreakdown}>
                    <XAxis dataKey="bracket" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip 
                      formatter={(value) => `$${(value || 0).toLocaleString()}`}
                    />
                    <Bar dataKey="tax" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Income Sources */}
            {incomeSources.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Income Sources</h3>
                <ResponsiveContainer width="100%" height={180}>
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
