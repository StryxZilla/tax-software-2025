'use client';

import { useEffect } from 'react';

/**
 * Global effect that formats all currency number inputs to 2 decimal places on blur.
 * 
 * This attaches a delegated blur listener to the document. When a `<input type="number">`
 * loses focus, it formats the displayed value to 2 decimal places (e.g., "50000" → "50000.00").
 * 
 * The value attribute is updated in-place, which triggers React's change detection
 * via a synthetic input event so form state stays in sync.
 * 
 * Mount this once at the layout level.
 */
export default function CurrencyFormatEffect() {
  useEffect(() => {
    function handleBlur(e: Event) {
      const target = e.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (target.type !== 'number') return;
      
      // Identify currency fields by step="0.01" or placeholder="0.00"
      const hasStep = target.step === '0.01';
      const hasDecimalPlaceholder = (target.placeholder || '').includes('0.00');
      
      if (hasStep || hasDecimalPlaceholder) {
        const raw = target.value;
        if (raw === '' || raw === undefined) return;
        
        const parsed = parseFloat(raw);
        if (isNaN(parsed) || parsed === 0) return;
        
        const formatted = parsed.toFixed(2);
        if (raw !== formatted) {
          // Use nativeInputValueSetter to update value and trigger React's onChange
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 'value'
          )?.set;
          
          if (nativeInputValueSetter) {
            nativeInputValueSetter.call(target, formatted);
            target.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
      }
    }

    // Use capture phase for blur since it doesn't bubble
    document.addEventListener('blur', handleBlur, true);
    return () => document.removeEventListener('blur', handleBlur, true);
  }, []);

  return null;
}
