import { useCallback, useState, useEffect } from 'react';

/**
 * Hook for currency input formatting.
 * Displays value with 2 decimal places on blur, raw value on focus.
 *
 * Usage:
 *   const currency = useCurrencyFormat(value, onChange);
 *   <input {...currency.inputProps} />
 */
export function useCurrencyFormat(
  value: number | undefined,
  onChange: (value: number) => void,
) {
  const [displayValue, setDisplayValue] = useState<string>(() =>
    formatForDisplay(value),
  );
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatForDisplay(value));
    }
  }, [value, isFocused]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setDisplayValue(raw);
      const parsed = parseFloat(raw);
      onChange(isNaN(parsed) ? 0 : parsed);
    },
    [onChange],
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (value && value !== 0) {
      setDisplayValue(String(value));
    }
  }, [value]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const parsed = parseFloat(displayValue);
    if (!isNaN(parsed) && parsed !== 0) {
      setDisplayValue(parsed.toFixed(2));
      onChange(parsed);
    } else {
      setDisplayValue('');
      onChange(0);
    }
  }, [displayValue, onChange]);

  return {
    displayValue,
    inputProps: {
      value: displayValue,
      onChange: handleChange,
      onFocus: handleFocus,
      onBlur: handleBlur,
    },
  };
}

function formatForDisplay(value: number | undefined | null): string {
  if (value === undefined || value === null || value === 0) return '';
  return value.toFixed(2);
}

export default useCurrencyFormat;
