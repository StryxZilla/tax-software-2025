'use client';

import React from 'react';
import { WizardStep } from '../../types/tax-types';
import { Check } from 'lucide-react';

const steps: Array<{ id: WizardStep; label: string; shortLabel?: string }> = [
  { id: 'personal-info', label: 'Personal Info', shortLabel: 'Personal' },
  { id: 'dependents', label: 'Dependents', shortLabel: 'Depend.' },
  { id: 'income-w2', label: 'W-2 Income', shortLabel: 'W-2' },
  { id: 'income-interest', label: 'Interest', shortLabel: 'Interest' },
  { id: 'income-capital-gains', label: 'Capital Gains', shortLabel: 'Cap. Gains' },
  { id: 'income-self-employment', label: 'Self-Employment', shortLabel: 'Self-Emp.' },
  { id: 'income-rental', label: 'Rental Property', shortLabel: 'Rental' },
  { id: 'retirement-accounts', label: 'Retirement', shortLabel: 'Retire.' },
  { id: 'deductions', label: 'Deductions', shortLabel: 'Deduct.' },
  { id: 'credits', label: 'Credits', shortLabel: 'Credits' },
  { id: 'review', label: 'Review', shortLabel: 'Review' },
];

interface WizardNavigationProps {
  currentStep: WizardStep;
  onStepChange: (step: WizardStep) => void;
}

export default function WizardNavigation({ currentStep, onStepChange }: WizardNavigationProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Progress indicator */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-medium text-slate-600">
            Step {currentIndex + 1} of {steps.length}
          </div>
          <div className="text-sm font-medium text-slate-600">
            {Math.round(((currentIndex + 1) / steps.length) * 100)}% Complete
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mb-6 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Desktop stepper with connecting lines */}
        <nav className="hidden lg:flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = index < currentIndex;
            const isAccessible = index <= currentIndex;
            
            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => isAccessible && onStepChange(step.id)}
                  disabled={!isAccessible}
                  className={`
                    flex flex-col items-center group relative
                    ${isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
                  `}
                >
                  {/* Step circle */}
                  <div 
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                      transition-all duration-200 ease-in-out
                      ${isActive 
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100 scale-110' 
                        : isCompleted
                        ? 'bg-green-500 text-white hover:bg-green-600'
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
                  
                  {/* Step label */}
                  <span 
                    className={`
                      mt-2 text-xs font-medium text-center max-w-[80px]
                      ${isActive 
                        ? 'text-blue-700 font-semibold' 
                        : isCompleted
                        ? 'text-green-700'
                        : 'text-slate-600'
                      }
                    `}
                  >
                    {step.shortLabel || step.label}
                  </span>
                </button>

                {/* Connecting line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 relative" style={{ top: '-20px' }}>
                    <div className="absolute inset-0 bg-slate-200" />
                    <div 
                      className={`
                        absolute inset-0 transition-all duration-500 ease-out
                        ${index < currentIndex ? 'bg-green-500' : 'bg-slate-200'}
                      `}
                      style={{ 
                        width: index < currentIndex ? '100%' : '0%'
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
            const isCompleted = index < currentIndex;
            const isAccessible = index <= currentIndex;
            
            return (
              <button
                key={step.id}
                onClick={() => isAccessible && onStepChange(step.id)}
                disabled={!isAccessible}
                className={`
                  flex items-center space-x-2 px-4 py-2.5 rounded-lg whitespace-nowrap 
                  transition-all duration-200 ease-in-out flex-shrink-0
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' 
                    : isCompleted
                    ? 'bg-green-50 text-green-800 border border-green-200 hover:bg-green-100'
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
                      ? 'bg-green-500 text-white'
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
