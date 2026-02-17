'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TaxReturn, WizardStep, TaxCalculation } from '../../types/tax-types';
import { calculateTaxReturn } from '../engine/calculations/tax-calculator';

interface TaxReturnContextType {
  taxReturn: TaxReturn;
  updateTaxReturn: (updates: Partial<TaxReturn>) => void;
  currentStep: WizardStep;
  setCurrentStep: (step: WizardStep) => void;
  taxCalculation: TaxCalculation | null;
  isCalculating: boolean;
  lastSaved: Date | null;
  recalculateTaxes: () => Promise<void>;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  resetTaxReturn: () => void;
}

const TaxReturnContext = createContext<TaxReturnContextType | undefined>(undefined);

const initialTaxReturn: TaxReturn = {
  personalInfo: {
    firstName: '',
    lastName: '',
    ssn: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    filingStatus: 'Single',
    age: 30,
    isBlind: false,
  },
  dependents: [],
  w2Income: [],
  interest: [],
  dividends: [],
  capitalGains: [],
  rentalProperties: [],
  selfEmployment: {
    businessName: '',
    ein: '',
    businessCode: '',
    grossReceipts: 0,
    returns: 0,
    costOfGoodsSold: 0,
    expenses: {
      advertising: 0,
      carAndTruck: 0,
      commissions: 0,
      contractLabor: 0,
      depletion: 0,
      depreciation: 0,
      employeeBenefitPrograms: 0,
      insurance: 0,
      interest: 0,
      legal: 0,
      officeExpense: 0,
      pension: 0,
      rentLease: 0,
      repairs: 0,
      supplies: 0,
      taxes: 0,
      travel: 0,
      mealsAndEntertainment: 0,
      utilities: 0,
      wages: 0,
      other: 0,
    }
  },
  aboveTheLineDeductions: {
    educatorExpenses: 0,
    studentLoanInterest: 0,
    hsaDeduction: 0,
    movingExpenses: 0,
    selfEmploymentTaxDeduction: 0,
    selfEmployedHealthInsurance: 0,
    sepIRA: 0,
    alimonyPaid: 0,
  },
  educationExpenses: [],
  estimatedTaxPayments: 0,
};

export function TaxReturnProvider({ children }: { children: ReactNode }) {
  const [taxReturn, setTaxReturn] = useState<TaxReturn>(initialTaxReturn);
  const [currentStep, setCurrentStep] = useState<WizardStep>('personal-info');
  const [taxCalculation, setTaxCalculation] = useState<TaxCalculation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  // Auto-save to localStorage whenever taxReturn changes
  useEffect(() => {
    saveToLocalStorage();
  }, [taxReturn]);

  const updateTaxReturn = (updates: Partial<TaxReturn>) => {
    setTaxReturn(prev => ({ ...prev, ...updates }));
  };

  const recalculateTaxes = async () => {
    setIsCalculating(true);
    try {
      // Defer to next frame to allow UI update (show loading spinner)
      await new Promise(resolve => setTimeout(resolve, 0));
      const calculation = calculateTaxReturn(taxReturn);
      setTaxCalculation(calculation);
    } finally {
      setIsCalculating(false);
    }
  };

  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('taxReturn2025', JSON.stringify(taxReturn));
      localStorage.setItem('currentStep', currentStep);
      setLastSaved(new Date());
    } catch (error) {
      // Only log in development mode
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving to localStorage:', error);
      }
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('taxReturn2025');
      const savedStep = localStorage.getItem('currentStep');
      
      if (saved) {
        setTaxReturn(JSON.parse(saved));
      }
      if (savedStep) {
        setCurrentStep(savedStep as WizardStep);
      }
    } catch (error) {
      // Only log in development mode
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading from localStorage:', error);
      }
    }
  };

  const resetTaxReturn = () => {
    // Confirm before clearing all data
    if (!window.confirm(
      'Are you sure you want to clear all tax data? This cannot be undone.'
    )) {
      return;
    }
    
    setTaxReturn(initialTaxReturn);
    setCurrentStep('personal-info');
    setTaxCalculation(null);
    localStorage.removeItem('taxReturn2025');
    localStorage.removeItem('currentStep');
    setLastSaved(null);
  };

  return (
    <TaxReturnContext.Provider
      value={{
        taxReturn,
        updateTaxReturn,
        currentStep,
        setCurrentStep,
        taxCalculation,
        isCalculating,
        lastSaved,
        recalculateTaxes,
        saveToLocalStorage,
        loadFromLocalStorage,
        resetTaxReturn,
      }}
    >
      {children}
    </TaxReturnContext.Provider>
  );
}

export function useTaxReturn() {
  const context = useContext(TaxReturnContext);
  if (!context) {
    throw new Error('useTaxReturn must be used within a TaxReturnProvider');
  }
  return context;
}
