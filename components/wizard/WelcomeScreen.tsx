'use client';

import React from 'react';
import {
  FileText,
  Users,
  Briefcase,
  TrendingUp,
  Home,
  PiggyBank,
  List,
  Award,
  CheckSquare,
  ChevronRight,
  ClipboardList,
} from 'lucide-react';

const WIZARD_STEPS = [
  {
    number: 1,
    label: 'Personal Information',
    icon: <FileText className="w-5 h-5" />,
    description: 'Name, address, SSN, filing status',
  },
  {
    number: 2,
    label: 'Dependents',
    icon: <Users className="w-5 h-5" />,
    description: 'Children and qualifying relatives',
  },
  {
    number: 3,
    label: 'W-2 Income',
    icon: <Briefcase className="w-5 h-5" />,
    description: 'Wages from employers',
  },
  {
    number: 4,
    label: 'Interest Income',
    icon: <TrendingUp className="w-5 h-5" />,
    description: '1099-INT from banks & savings',
  },
  {
    number: 5,
    label: 'Capital Gains',
    icon: <TrendingUp className="w-5 h-5" />,
    description: 'Schedule D — stocks, crypto, assets',
  },
  {
    number: 6,
    label: 'Self-Employment',
    icon: <ClipboardList className="w-5 h-5" />,
    description: 'Schedule C — freelance & business income',
  },
  {
    number: 7,
    label: 'Rental Property',
    icon: <Home className="w-5 h-5" />,
    description: 'Schedule E — rental income & expenses',
  },
  {
    number: 8,
    label: 'Retirement Accounts',
    icon: <PiggyBank className="w-5 h-5" />,
    description: 'IRA contributions & distributions',
  },
  {
    number: 9,
    label: 'Itemized Deductions',
    icon: <List className="w-5 h-5" />,
    description: 'Schedule A — mortgage, charity, medical',
  },
  {
    number: 10,
    label: 'Tax Credits',
    icon: <Award className="w-5 h-5" />,
    description: 'Child tax credit, education credits & more',
  },
  {
    number: 11,
    label: 'Review & Download',
    icon: <CheckSquare className="w-5 h-5" />,
    description: 'Summary, PDF generation, final review',
  },
];

const DOCUMENTS_CHECKLIST = [
  { category: 'Income', items: ['W-2 form(s) from each employer', '1099-INT (bank interest)', '1099-DIV (dividends)', '1099-B (stock sales)', '1099-NEC / 1099-MISC (freelance income)', 'K-1 forms (partnerships, S-corps)'] },
  { category: 'Deductions', items: ['Mortgage interest statement (Form 1098)', 'Property tax records', 'Charitable donation receipts', 'Medical expense receipts', 'Student loan interest (Form 1098-E)'] },
  { category: 'Personal Info', items: ['Social Security Numbers (you, spouse, dependents)', 'Date of birth for all dependents', 'Last year\'s tax return (for reference)', 'Bank account & routing number (for direct deposit)'] },
];

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 border border-blue-200">
          <span>🇺🇸</span>
          <span>2025 Tax Year</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 mb-4 leading-tight">
          Let's file your{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            2025 taxes
          </span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Walk through 11 simple steps at your own pace. Your progress is saved automatically — pick up right where you left off.
        </p>

        {/* CTA Button */}
        <button
          onClick={onStart}
          className="
            inline-flex items-center gap-3 px-10 py-5 text-xl font-bold
            bg-gradient-to-r from-blue-600 to-indigo-600
            text-white rounded-2xl shadow-xl shadow-blue-200
            hover:from-blue-700 hover:to-indigo-700
            hover:shadow-2xl hover:shadow-blue-300
            hover:-translate-y-0.5
            active:translate-y-0
            transition-all duration-200 ease-out
          "
        >
          Let's Get Started
          <ChevronRight className="w-6 h-6" />
        </button>

        <p className="mt-4 text-sm text-slate-400">Free • No account required • Data stays on your device</p>
      </div>

      {/* Steps Overview */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-5">
            <h2 className="text-xl font-bold text-white">📋 What we'll cover</h2>
            <p className="text-blue-100 text-sm mt-1">11 steps — skip any that don't apply to you</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {WIZARD_STEPS.map((step, i) => (
              <div
                key={step.number}
                className={`
                  flex items-start gap-4 px-6 py-5
                  ${i % 3 !== 2 ? 'lg:border-r border-slate-100' : ''}
                  ${i >= 3 ? 'border-t border-slate-100' : ''}
                  hover:bg-blue-50/40 transition-colors duration-150
                `}
              >
                {/* Step number bubble */}
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                  {step.number}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-sm">
                    <span className="text-blue-500">{step.icon}</span>
                    {step.label}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Documents Checklist */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-5">
            <h2 className="text-xl font-bold text-white">📁 Documents to have handy</h2>
            <p className="text-emerald-100 text-sm mt-1">Gather these before you start — it'll go much faster</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {DOCUMENTS_CHECKLIST.map((section) => (
              <div key={section.category} className="px-6 py-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                  {section.category}
                </h3>
                <ul className="space-y-2.5">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <span className="flex-shrink-0 w-4 h-4 mt-0.5 text-emerald-500">
                        <svg viewBox="0 0 16 16" fill="currentColor">
                          <path d="M6.5 12.5a1 1 0 01-.707-.293l-3-3a1 1 0 011.414-1.414L6.5 10.086l5.793-5.793a1 1 0 011.414 1.414l-6.5 6.5A1 1 0 016.5 12.5z" />
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-10">
          <button
            onClick={onStart}
            className="
              inline-flex items-center gap-3 px-10 py-5 text-xl font-bold
              bg-gradient-to-r from-blue-600 to-indigo-600
              text-white rounded-2xl shadow-xl shadow-blue-200
              hover:from-blue-700 hover:to-indigo-700
              hover:shadow-2xl hover:shadow-blue-300
              hover:-translate-y-0.5
              active:translate-y-0
              transition-all duration-200 ease-out
            "
          >
            Let's Get Started
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
