import { useState, useEffect } from 'react';
import { ValidationError } from '../validation/form-validation';

/**
 * Custom hook for managing form validation state
 * @param validationFn - Function that returns ValidationError[]
 * @param dependencies - Dependencies array to trigger re-validation
 */
export function useFormValidation(
  validationFn: () => ValidationError[],
  dependencies: any[]
) {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [showAllErrors, setShowAllErrors] = useState(false);

  // Re-validate when dependencies change
  useEffect(() => {
    const validationErrors = validationFn();
    setErrors(validationErrors);
  }, dependencies);

  // Mark a field as touched
  const touchField = (fieldName: string) => {
    setTouched(prev => new Set([...prev, fieldName]));
  };

  // Get error for a specific field (only if touched or showAllErrors)
  const getFieldError = (fieldName: string): string | undefined => {
    if (!touched.has(fieldName) && !showAllErrors) return undefined;
    const error = errors.find(e => e.field === fieldName);
    return error?.message;
  };

  // Check if form is valid
  const isValid = errors.length === 0;

  // Attempt to submit - shows all errors if invalid
  const validateForSubmit = (): boolean => {
    setShowAllErrors(true);
    return isValid;
  };

  return {
    errors,
    isValid,
    getFieldError,
    touchField,
    validateForSubmit,
    showAllErrors,
  };
}
