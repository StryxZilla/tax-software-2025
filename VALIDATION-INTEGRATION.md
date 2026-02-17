# Validation Integration Guide

## ✅ Completed Components

### 1. Core Validation Infrastructure
- **File:** `lib/hooks/useFormValidation.ts` - Custom hook for validation state management
- **File:** `components/common/ValidationError.tsx` - Reusable error display component
- **File:** `lib/validation/form-validation.ts` - Already existed, contains all validation functions

### 2. Forms with Validation Integrated
- ✅ **PersonalInfoForm** - Full validation UI with error messages
- ✅ **W2Form** - Array-based validation with per-item error tracking
- ✅ **page.tsx** - Updated to track validation state and pass to FormNavigation

## 🔄 Pattern for Remaining Forms

### For Array-Based Forms (Dependents, Interest, Credits)

```tsx
import { validateDependent } from '../../lib/validation/form-validation';
import ValidationError from '../common/ValidationError';

interface DependentsFormProps {
  values: Dependent[];
  onChange: (values: Dependent[]) => void;
  onValidationChange?: (isValid: boolean) => void; // ADD THIS
}

export default function DependentsForm({ values, onChange, onValidationChange }: DependentsFormProps) {
  const [showAllErrors, setShowAllErrors] = React.useState(false);
  const [touchedFields, setTouchedFields] = React.useState<Set<string>>(new Set());

  // Validate all items
  const allErrors = values.flatMap((item, index) => validateDependent(item, index));
  const isValid = allErrors.length === 0;

  // Notify parent
  React.useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);

  const touchField = (fieldName: string) => {
    setTouchedFields(prev => new Set([...prev, fieldName]));
  };

  const getFieldError = (fieldName: string): string | undefined => {
    if (!touchedFields.has(fieldName) && !showAllErrors) return undefined;
    const error = allErrors.find(e => e.field === fieldName);
    return error?.message;
  };

  const getInputClassName = (fieldName: string) => {
    const hasError = getFieldError(fieldName);
    return `block w-full rounded-lg shadow-sm ${
      hasError
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600'
    }`;
  };

  // In JSX:
  // 1. Add validation summary at top
  // 2. Add onBlur={() => touchField('field-name')} to inputs
  // 3. Add className={getInputClassName('field-name')}
  // 4. Add <ValidationError message={getFieldError('field-name')} /> below inputs
}
```

### In page.tsx for Each Form

```tsx
case 'dependents':
  return (
    <>
      <DependentsForm
        values={taxReturn.dependents}
        onChange={(dependents) => {
          updateTaxReturn({ dependents });
          recalculateTaxes();
        }}
        onValidationChange={setIsCurrentFormValid}  // ADD THIS
      />
      <FormNavigation
        currentStep={currentStep}
        onNext={handleNext}
        onPrevious={handlePrevious}
        canProceed={isCurrentFormValid}  // ADD THIS
      />
    </>
  );
```

## 📋 TODO List

- [ ] DependentsForm - Add validation UI
- [ ] InterestIncomeForm - Add validation UI
- [ ] CreditsForm - Add validation UI
- [ ] Update page.tsx for dependents, income-interest, and credits cases
- [ ] Test all forms end-to-end
- [ ] Verify error messages display correctly
- [ ] Verify Next button blocks when invalid

## 🎯 Key Features

1. **Inline Validation** - Errors show below each field after blur
2. **Visual Feedback** - Red border on invalid fields
3. **Validation Summary** - List of all errors at top when user tries to proceed
4. **Block Navigation** - Next button disabled when form is invalid
5. **Touch Tracking** - Only show errors for fields user has interacted with
6. **Clear Error Messages** - Specific, actionable error messages

## 🧪 Testing Checklist

- [ ] Leave required field empty → see error on blur
- [ ] Enter invalid SSN format → see format error
- [ ] Try to click Next with errors → button disabled
- [ ] Fix all errors → Next button enabled
- [ ] Navigate to next form successfully
- [ ] Return to previous form → validation state preserved
