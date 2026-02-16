'use client';

import React from 'react';
import { WizardStep } from '../../types/tax-types';

const steps: Array<{ id: WizardStep; label: string }> = [
  { id: 'personal-info', label: 'Personal Info' },
  { id: 'dependents', label: 'Dependents' },
  { id: 'income-w2', label: 'W-2 Income' },
  { id: 'income-interest', label: 'Interest' },
  { id: 'income-capital-gains', label: 'Capital Gains' },
  { id: 'income-self-employment', label: 'Self-Employment' },
  { id: 'retirement-accounts', label: 'Retirement' },
  { id: 'deductions', label: 'Deductions' },
  { id: 'credits', label: 'Credits' },
  { id: 'review', label: 'Review' },
];

interface WizardNavigationProps {
  currentStep: WizardStep;
  onStepChange: (step: WizardStep) => void;
}

export default function WizardNavigation({ currentStep, onStepChange }: WizardNavigationProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8 py-4 overflow-x-auto">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = index < currentIndex;
            
            return (
              <button
                key={step.id}
                onClick={() => onStepChange(step.id)}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors
                  ${isActive 
                    ? 'bg-blue-600 text-white' 
                    : isCompleted
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                <span className="font-semibold">{index + 1}</span>
                <span>{step.label}</span>
                {isCompleted && <span>✓</span>}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
