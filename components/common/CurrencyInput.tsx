'use client';

import React, { forwardRef } from 'react';

/**
 * Centralized currency input with $ prefix.
 * Ensures consistent spacing/styling across all forms.
 *
 * CSS contract:
 * - Wrapper uses `currency-input` class (testable token)
 * - Prefix uses `currency-input-prefix` class
 * - Input gets `pl-8` for prefix spacing
 */

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Extra className for the <input> element */
  inputClassName?: string;
  /** Error state — adds red ring */
  hasError?: boolean;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ inputClassName = '', hasError, className, ...inputProps }, ref) => {
    const baseInput = `block w-full rounded-lg shadow-sm pl-8 ${
      hasError
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600'
    }`;

    return (
      <div className={`currency-input relative ${className ?? ''}`}>
        <span className="currency-input-prefix absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none select-none">
          $
        </span>
        <input
          ref={ref}
          type="number"
          className={`${baseInput} ${inputClassName}`}
          {...inputProps}
        />
      </div>
    );
  },
);

CurrencyInput.displayName = 'CurrencyInput';
export default CurrencyInput;
