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
  recalculateTaxes: () => void;
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

  const recalculateTaxes = () => {
    const calculation = calculateTaxReturn(taxReturn);
    setTaxCalculation(calculation);
  };

  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('taxReturn2025', JSON.stringify(taxReturn));
      localStorage.setItem('currentStep', currentStep);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
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
      console.error('Error loading from localStorage:', error);
    }
  };

  const resetTaxReturn = () => {
    setTaxReturn(initialTaxReturn);
    setCurrentStep('personal-info');
    setTaxCalculation(null);
    localStorage.removeItem('taxReturn2025');
    localStorage.removeItem('currentStep');
  };

  return (
    <TaxReturnContext.Provider
      value={{
        taxReturn,
        updateTaxReturn,
        currentStep,
        setCurrentStep,
        taxCalculation,
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
