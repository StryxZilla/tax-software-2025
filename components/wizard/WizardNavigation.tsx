'use client';

import React, { useState } from 'react';
import { WizardStep } from '../../types/tax-types';
import { Check, List, X, ChevronRight } from 'lucide-react';

const steps: Array<{ id: WizardStep; label: string; shortLabel?: string; description: string }> = [
  { id: 'personal-info',          label: 'Personal Information',       shortLabel: 'Personal',   description: 'Name, address, SSN, filing status' },
  { id: 'dependents',             label: 'Dependents',                 shortLabel: 'Depend.',    description: 'Children & qualifying relatives' },
  { id: 'income-w2',              label: 'W-2 Income',                 shortLabel: 'W-2',        description: 'Wages from employers' },
  { id: 'income-interest',        label: 'Interest Income',            shortLabel: 'Interest',   description: '1099-INT from banks & savings' },
  { id: 'income-capital-gains',   label: 'Capital Gains',              shortLabel: 'Cap. Gains', description: 'Schedule D — stocks, crypto' },
  { id: 'income-self-employment', label: 'Self-Employment',            shortLabel: 'Self-Emp.',  description: 'Schedule C — freelance & business' },
  { id: 'income-rental',          label: 'Rental Property',            shortLabel: 'Rental',     description: 'Schedule E — rental income' },
  { id: 'retirement-accounts',    label: 'Retirement Accounts',        shortLabel: 'Retire.',    description: 'IRA contributions & distributions' },
  { id: 'deductions',             label: 'Itemized Deductions',        shortLabel: 'Deduct.',    description: 'Schedule A — mortgage, charity' },
  { id: 'credits',                label: 'Tax Credits',                shortLabel: 'Credits',    description: 'Child credit, education & more' },
  { id: 'review',                 label: 'Review & Download',          shortLabel: 'Review',     description: 'Summary, PDF & final review' },
];

interface WizardNavigationProps {
  currentStep: WizardStep;
  onStepChange: (step: WizardStep) => void;
}

export default function WizardNavigation({ currentStep, onStepChange }: WizardNavigationProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStep);
  const [showPanel, setShowPanel] = useState(false);

  // Safety: if step not found (e.g. 'welcome'), treat as -1
  const safeIndex = currentIndex === -1 ? 0 : currentIndex;
  const progressPct = Math.round(((safeIndex + 1) / steps.length) * 100);

  return (
    <div className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Progress header row */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="text-sm font-medium text-slate-600">
            Step {safeIndex + 1} of {steps.length}
            <span className="ml-2 font-semibold text-slate-800">
              — {steps[safeIndex]?.label ?? ''}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-slate-600">
              {progressPct}% Complete
            </div>
            {/* Steps panel toggle */}
            <button
              onClick={() => setShowPanel(v => !v)}
              className="
                inline-flex items-center gap-1.5 text-xs font-semibold
                px-3 py-1.5 rounded-full border
                bg-slate-50 text-slate-600 border-slate-200
                hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200
                transition-colors duration-150
              "
              title="View all steps"
            >
              <List className="w-3.5 h-3.5" />
              Steps
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-600 to-primary-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Steps panel — full list dropdown */}
        {showPanel && (
          <div className="mb-6 brand-surface-warm border border-accent-200 rounded-2xl overflow-hidden shadow-lg">
            <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-accent-100">
              <span className="text-sm font-bold text-slate-700">All Steps</span>
              <button
                onClick={() => setShowPanel(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
              {steps.map((step, index) => {
                const isActive = step.id === currentStep;
                const isCompleted = index < safeIndex;
                const isAccessible = index <= safeIndex;

                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      if (isAccessible) {
                        onStepChange(step.id);
                        setShowPanel(false);
                      }
                    }}
                    disabled={!isAccessible}
                    className={`
                      flex items-center gap-3 px-5 py-3.5 text-left border-b border-r border-accent-100
                      transition-colors duration-150
                      ${isActive
                        ? 'bg-primary-50 border-l-2 border-l-primary-500'
                        : isCompleted
                        ? 'hover:bg-success-50 cursor-pointer'
                        : isAccessible
                        ? 'hover:bg-slate-100 cursor-pointer'
                        : 'opacity-40 cursor-not-allowed'
                      }
                    `}
                  >
                    {/* Status indicator */}
                    <div className={`
                      flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                      ${isActive
                        ? 'bg-primary-600 text-white ring-2 ring-primary-200'
                        : isCompleted
                        ? 'bg-success text-white'
                        : 'bg-slate-200 text-slate-500'
                      }
                    `}>
                      {isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold truncate ${isActive ? 'text-primary-700' : isCompleted ? 'text-success-800' : 'text-slate-700'}`}>
                        {step.label}
                      </div>
                      <div className="text-xs text-slate-400 truncate">{step.description}</div>
                    </div>

                    {isActive && <ChevronRight className="w-4 h-4 text-primary-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Desktop stepper with connecting lines */}
        <nav className="hidden lg:flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = index < safeIndex;
            const isAccessible = index <= safeIndex;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center relative group">
                  <button
                    onClick={() => isAccessible && onStepChange(step.id)}
                    disabled={!isAccessible}
                    className={`
                      flex flex-col items-center
                      ${isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
                    `}
                  >
                    {/* Step circle */}
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                        transition-all duration-200 ease-in-out
                        ${isActive
                          ? 'bg-primary-600 text-white ring-4 ring-primary-100 scale-110'
                          : isCompleted
                          ? 'bg-success text-white hover:bg-success-600'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }
                      `}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>

                    {/* Step short label */}
                    <span
                      className={`
                        mt-2 text-xs font-medium text-center max-w-[80px]
                        ${isActive
                          ? 'text-primary-700 font-semibold'
                          : isCompleted
                          ? 'text-success-700'
                          : 'text-slate-600'
                        }
                      `}
                    >
                      {step.shortLabel || step.label}
                    </span>
                  </button>

                  {/* Tooltip on hover */}
                  <div className="
                    absolute bottom-full mb-2 left-1/2 -translate-x-1/2
                    bg-slate-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap
                    opacity-0 group-hover:opacity-100
                    pointer-events-none transition-opacity duration-150 z-50
                    shadow-lg
                    before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2
                    before:border-4 before:border-transparent before:border-t-slate-800
                  ">
                    <div className="font-semibold">{step.label}</div>
                    <div className="text-slate-300 text-[10px] mt-0.5">{step.description}</div>
                  </div>
                </div>

                {/* Connecting line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 relative" style={{ top: '-20px' }}>
                    <div className="absolute inset-0 bg-slate-200" />
                    <div
                      className={`
                        absolute inset-0 transition-all duration-500 ease-out
                        ${index < safeIndex ? 'bg-success' : 'bg-slate-200'}
                      `}
                      style={{
                        width: index < safeIndex ? '100%' : '0%'
                      }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </nav>

        {/* Mobile/Tablet horizontal scroll */}
        <nav className="lg:hidden flex space-x-3 overflow-x-auto pb-2 -mx-4 px-4">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = index < safeIndex;
            const isAccessible = index <= safeIndex;

            return (
              <button
                key={step.id}
                onClick={() => isAccessible && onStepChange(step.id)}
                disabled={!isAccessible}
                className={`
                  flex items-center space-x-2 px-4 py-2.5 rounded-lg whitespace-nowrap
                  transition-all duration-200 ease-in-out flex-shrink-0
                  ${isActive
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 scale-105'
                    : isCompleted
                    ? 'bg-success-50 text-success-800 border border-success-200 hover:bg-success-100'
                    : isAccessible
                    ? 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                    : 'bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed'
                  }
                `}
              >
                <div
                  className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${isActive
                      ? 'bg-white/20 text-white'
                      : isCompleted
                      ? 'bg-success text-white'
                      : 'bg-slate-300 text-slate-600'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span className="text-sm font-medium">{step.shortLabel || step.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}