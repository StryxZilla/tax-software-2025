'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { TaxReturn, WizardStep, TaxCalculation } from '../../types/tax-types'
import { calculateTaxReturn } from '../engine/calculations/tax-calculator'

interface TaxReturnContextType {
  taxReturn: TaxReturn
  updateTaxReturn: (updates: Partial<TaxReturn>) => void
  currentStep: WizardStep
  setCurrentStep: (step: WizardStep) => void
  taxCalculation: TaxCalculation | null
  isCalculating: boolean
  lastSaved: Date | null
  recalculateTaxes: () => Promise<void>
  saveToLocalStorage: () => void
  loadFromLocalStorage: () => void
  resetTaxReturn: () => void
  importFromLocalStorage: () => Promise<void>
}

const TaxReturnContext = createContext<TaxReturnContextType | undefined>(undefined)

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
    },
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
}

export function TaxReturnProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [taxReturn, setTaxReturn] = useState<TaxReturn>(initialTaxReturn)
  const [currentStep, setCurrentStep] = useState<WizardStep>('welcome')
  const [taxCalculation, setTaxCalculation] = useState<TaxCalculation | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [dbLoaded, setDbLoaded] = useState(false)
  const [saveTimeout, setSaveTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)

  const isAuthenticated = status === 'authenticated'

  // Load data on auth state change
  useEffect(() => {
    if (status === 'authenticated' && !dbLoaded) {
      loadFromDb()
    } else if (status === 'unauthenticated') {
      loadFromLocalStorage()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  // Auto-save: localStorage always, DB when authenticated (debounced)
  useEffect(() => {
    if (status === 'loading') return

    // Always save to localStorage as fallback
    saveToLocalStorage()

    // Debounced save to DB when authenticated
    if (isAuthenticated && dbLoaded) {
      if (saveTimeout) clearTimeout(saveTimeout)
      const t = setTimeout(() => {
        saveToDb()
      }, 1500)
      setSaveTimeout(t)
    }

    return () => {
      if (saveTimeout) clearTimeout(saveTimeout)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taxReturn])

  const loadFromDb = async () => {
    try {
      const res = await fetch('/api/tax-return')
      if (!res.ok) return
      const { data } = await res.json()
      if (data) {
        setTaxReturn(data)
      }
      setDbLoaded(true)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading from DB:', error)
      }
      setDbLoaded(true)
    }
  }

  const saveToDb = useCallback(async () => {
    try {
      const res = await fetch('/api/tax-return', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: taxReturn }),
      })
      if (res.ok) {
        setLastSaved(new Date())
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving to DB:', error)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taxReturn])

  const updateTaxReturn = (updates: Partial<TaxReturn>) => {
    setTaxReturn(prev => ({ ...prev, ...updates }))
  }

  const recalculateTaxes = async () => {
    setIsCalculating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 0))
      const calculation = calculateTaxReturn(taxReturn)
      setTaxCalculation(calculation)
    } finally {
      setIsCalculating(false)
    }
  }

  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('taxReturn2025', JSON.stringify(taxReturn))
      localStorage.setItem('currentStep', currentStep)
      if (!isAuthenticated) {
        setLastSaved(new Date())
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving to localStorage:', error)
      }
    }
  }

  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('taxReturn2025')
      const savedStep = localStorage.getItem('currentStep')
      if (saved) {
        setTaxReturn(JSON.parse(saved))
      }
      if (savedStep) {
        setCurrentStep(savedStep as WizardStep)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading from localStorage:', error)
      }
    }
  }

  // Import localStorage data into DB (called after login if user wants to migrate)
  const importFromLocalStorage = async () => {
    try {
      const saved = localStorage.getItem('taxReturn2025')
      if (!saved) return
      const data = JSON.parse(saved)
      await fetch('/api/tax-return', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      })
      setTaxReturn(data)
      setLastSaved(new Date())
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error importing from localStorage:', error)
      }
    }
  }

  const resetTaxReturn = () => {
    if (!window.confirm('Are you sure you want to clear all tax data? This cannot be undone.')) {
      return
    }
    setTaxReturn(initialTaxReturn)
    setCurrentStep('personal-info')
    setTaxCalculation(null)
    localStorage.removeItem('taxReturn2025')
    localStorage.removeItem('currentStep')
    setLastSaved(null)

    // Clear from DB too if authenticated
    if (isAuthenticated) {
      fetch('/api/tax-return', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: initialTaxReturn }),
      }).catch(() => {})
    }
  }

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
        importFromLocalStorage,
      }}
    >
      {children}
    </TaxReturnContext.Provider>
  )
}

export function useTaxReturn() {
  const context = useContext(TaxReturnContext)
  if (!context) {
    throw new Error('useTaxReturn must be used within a TaxReturnProvider')
  }
  return context
}

// Export session user info helper
export function useAuthUser() {
  const { data: session } = useSession()
  return session?.user ?? null
}
