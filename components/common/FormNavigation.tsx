'use client';

import React from 'react';
import { WizardStep } from '../../types/tax-types';

interface FormNavigationProps {
  currentStep: WizardStep;
  onNext?: () => void;
  onPrevious?: () => void;
  canProceed?: boolean;
}

const STEP_ORDER: WizardStep[] = [
  'personal-info',
  'dependents',
  'income-w2',
  'income-interest',
  'income-capital-gains',
  'income-self-employment',
  'income-rental',
  'retirement-accounts',
  'deductions',
  'credits',
  'review',
];

export default function FormNavigation({ currentStep, onNext, onPrevious, canProceed = true }: FormNavigationProps) {
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === STEP_ORDER.length - 1;

  return (
    <div className="flex justify-between items-center pt-6 border-t mt-8">
      {!isFirst ? (
        <button
          onClick={onPrevious}
          className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          ← Previous
        </button>
      ) : (
        <div />
      )}

      {!isLast && (
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
            canProceed
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Next →
        </button>
      )}
    </div>
  );
}
