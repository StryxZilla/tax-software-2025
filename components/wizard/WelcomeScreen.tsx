'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import ZoeyGuideCard from '../brand/ZoeyGuideCard';

const WIZARD_STEPS = [
  { number: 1, label: 'Personal Information', description: 'Name, address, SSN, filing status' },
  { number: 2, label: 'Dependents', description: 'Children and qualifying relatives' },
  { number: 3, label: 'W-2 Income', description: 'Wages from employers' },
  { number: 4, label: 'Interest Income', description: '1099-INT from banks & savings' },
  { number: 5, label: 'Capital Gains', description: 'Schedule D — stocks, crypto, assets' },
  { number: 6, label: 'Self-Employment', description: 'Schedule C — freelance & business income' },
  { number: 7, label: 'Rental Property', description: 'Schedule E — rental income & expenses' },
  { number: 8, label: 'Retirement Accounts', description: 'IRA contributions & distributions' },
  { number: 9, label: 'Itemized Deductions', description: 'Schedule A — mortgage, charity, medical' },
  { number: 10, label: 'Tax Credits', description: 'Child tax credit, education credits & more' },
  { number: 11, label: 'Review & Download', description: 'Summary, PDF generation, final review' },
];

const DOCUMENTS_CHECKLIST = [
  {
    category: 'Income',
    items: [
      'W-2 form(s) from each employer',
      '1099-INT (bank interest)',
      '1099-DIV (dividends)',
      '1099-B (stock sales)',
      '1099-NEC / 1099-MISC (freelance income)',
      'K-1 forms (partnerships, S-corps)',
    ],
  },
  {
    category: 'Deductions',
    items: [
      'Mortgage interest statement (Form 1098)',
      'Property tax records',
      'Charitable donation receipts',
      'Medical expense receipts',
      'Student loan interest (Form 1098-E)',
    ],
  },
  {
    category: 'Personal Info',
    items: [
      'Social Security Numbers (you, spouse, dependents)',
      'Date of birth for all dependents',
      "Last year's tax return (for reference)",
      'Bank account & routing number (for direct deposit)',
    ],
  },
];

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <section className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-sm">
          <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 text-sm font-semibold px-3 py-1 rounded-full mb-4 border border-slate-200">
            <span>2025 Tax Year</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
            Welcome to Zoey&apos;s Tax Advisory
          </h1>
          <p className="text-lg text-slate-600 mt-3 max-w-2xl">
            A clear, step-by-step filing flow with fewer surprises and fast progress tracking.
          </p>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr] items-start">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2">
              <div className="aspect-[3/2] w-full overflow-hidden rounded-xl bg-slate-100">
                <img
                  src="/brand/zoey-hero-wide.png"
                  alt="Zoey welcoming you to start your return"
                  className="h-full w-full object-cover object-center"
                />
              </div>
            </div>
            <ZoeyGuideCard
              variant="tip"
              title="Quick mission plan"
              message="11 steps, save-as-you-go, and no chaos. Finish each clean section and Zoey mentally awards herself a tiny treat."
              className="w-full text-left"
            />
          </div>

          <div className="mt-8">
            <button
              onClick={onStart}
              className="inline-flex items-center gap-2.5 px-8 py-4 text-lg font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Start your return
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-bold text-slate-900">What we&apos;ll cover</h2>
            <p className="text-sm text-slate-600 mt-1">11 guided steps from intake to final review.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {WIZARD_STEPS.map((step) => (
              <div key={step.number} className="flex items-start gap-3 px-5 py-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                  {step.number}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-800">{step.label}</div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-bold text-slate-900">Documents to have handy</h2>
            <p className="text-sm text-slate-600 mt-1">Gather these first to reduce backtracking later.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {DOCUMENTS_CHECKLIST.map((section) => (
              <div key={section.category} className="px-5 py-5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">{section.category}</h3>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
