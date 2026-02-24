'use client';

import React from 'react';
import { WizardStep, isStepOptional } from '../../types/tax-types';

interface FormNavigationProps {
  currentStep: WizardStep;
  onNext?: () => void;
  onPrevious?: () => void;
  onSkip?: () => void;
  onSave?: () => Promise<void>;
  canProceed?: boolean;
  onBlockedNext?: () => void;
  isSaving?: boolean;
  lastSaved?: Date | null;
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

export default function FormNavigation({ currentStep, onNext, onPrevious, onSkip, onSave, canProceed = true, onBlockedNext, isSaving, lastSaved }: FormNavigationProps) {
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === STEP_ORDER.length - 1;
  const optional = isStepOptional(currentStep);

  const formatTime = (d: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    if (diffMs < 60_000) return 'just now';
    if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)}m ago`;
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="pt-6 border-t mt-8 space-y-4">
      {/* Save row — always visible when onSave is provided */}
      {onSave && (
        <div className="flex items-center justify-center gap-3" data-testid="form-save-row">
          <button
            onClick={onSave}
            disabled={isSaving}
            data-testid="form-save-button"
            className={`
              inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold
              transition-colors duration-150 shadow-sm
              ${isSaving
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800'
              }
            `}
          >
            {isSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              <>💾 Save progress</>
            )}
          </button>
          {lastSaved && !isSaving && (
            <span className="text-xs text-green-600 font-medium">
              ✓ Saved {formatTime(lastSaved)}
            </span>
          )}
        </div>
      )}

      {/* Navigation row */}
      <div className="flex justify-between items-center">
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

        <div className="flex items-center gap-3">
          {optional && !isLast && onSkip && (
            <button
              onClick={onSkip}
              className="px-5 py-2.5 rounded-lg font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors text-sm"
            >
              Skip for now
            </button>
          )}

          {!isLast && (
            <button
              onClick={() => {
                if (canProceed) {
                  onNext?.()
                  return
                }

                onBlockedNext?.()
              }}
              aria-disabled={!canProceed}
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
      </div>
    </div>
  );
}
