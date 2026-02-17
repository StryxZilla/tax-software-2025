'use client';

import React from 'react';
import { TaxReturnProvider } from '../lib/context/TaxReturnContext';
import WizardNavigation from '../components/wizard/WizardNavigation';
import PersonalInfoForm from '../components/forms/PersonalInfoForm';
import DependentsForm from '../components/forms/DependentsForm';
import W2Form from '../components/forms/W2Form';
import InterestIncomeForm from '../components/forms/InterestIncomeForm';
import CapitalGainsForm from '../components/forms/CapitalGainsForm';
import ScheduleCForm from '../components/forms/ScheduleCForm';
import RentalPropertyForm from '../components/forms/RentalPropertyForm';
import RetirementForm from '../components/forms/RetirementForm';
import ItemizedDeductionsForm from '../components/forms/ItemizedDeductionsForm';
import CreditsForm from '../components/forms/CreditsForm';
import TaxSummarySidebar from '../components/review/TaxSummarySidebar';
import PdfDownloadButton from '../components/review/PdfDownloadButton';
import { useTaxReturn } from '../lib/context/TaxReturnContext';
import { calculateAGI } from '../lib/engine/calculations/tax-calculator';
import FormNavigation from '../components/common/FormNavigation';
import { WizardStep } from '../types/tax-types';

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

// Wizard step components
function WizardStepContent() {
  const { 
    taxReturn, 
    updateTaxReturn,
    currentStep,
    setCurrentStep,
    taxCalculation,
    recalculateTaxes 
  } = useTaxReturn();

  // Track validation state for current form
  const [isCurrentFormValid, setIsCurrentFormValid] = React.useState(true);

  const currentIndex = STEP_ORDER.indexOf(currentStep);
  const handleNext = () => {
    if (currentIndex < STEP_ORDER.length - 1) {
      setCurrentStep(STEP_ORDER[currentIndex + 1]);
    }
  };
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentStep(STEP_ORDER[currentIndex - 1]);
    }
  };

  switch (currentStep) {
    case 'personal-info':
      return (
        <>
          <PersonalInfoForm 
            value={taxReturn.personalInfo}
            onChange={(updates) => {
              updateTaxReturn({ personalInfo: { ...taxReturn.personalInfo, ...updates } });
            }}
            onValidationChange={setIsCurrentFormValid}
          />
          <FormNavigation
            currentStep={currentStep}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canProceed={isCurrentFormValid}
          />
        </>
      );

    case 'dependents':
      return (
        <>
          <DependentsForm
            values={taxReturn.dependents}
            onChange={(dependents) => {
              updateTaxReturn({ dependents });
              recalculateTaxes();
            }}
            onValidationChange={setIsCurrentFormValid}
          />
          <FormNavigation
            currentStep={currentStep}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canProceed={isCurrentFormValid}
          />
        </>
      );

    case 'income-w2':
      return (
        <>
          <W2Form
            values={taxReturn.w2Income}
            onChange={(w2s) => {
              updateTaxReturn({ w2Income: w2s });
              recalculateTaxes();
            }}
            onValidationChange={setIsCurrentFormValid}
          />
          <FormNavigation
            currentStep={currentStep}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canProceed={isCurrentFormValid}
          />
        </>
      );

    case 'income-interest':
      return (
        <>
          <InterestIncomeForm
            values={taxReturn.interest}
            onChange={(interest) => {
              updateTaxReturn({ interest });
              recalculateTaxes();
            }}
            onValidationChange={setIsCurrentFormValid}
          />
          <FormNavigation
            currentStep={currentStep}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canProceed={isCurrentFormValid}
          />
        </>
      );

    case 'income-capital-gains':
      return (
        <>
          <CapitalGainsForm
            values={taxReturn.capitalGains}
            onChange={(capitalGains) => {
              updateTaxReturn({ capitalGains });
              recalculateTaxes();
            }}
            onValidationChange={setIsCurrentFormValid}
          />
          <FormNavigation
            currentStep={currentStep}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canProceed={isCurrentFormValid}
          />
        </>
      );

    case 'income-self-employment':
      return (
        <>
          <ScheduleCForm
            value={taxReturn.selfEmployment}
            onChange={(selfEmployment) => {
              updateTaxReturn({ selfEmployment });
              recalculateTaxes();
            }}
            onValidationChange={setIsCurrentFormValid}
          />
          <FormNavigation
            currentStep={currentStep}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canProceed={isCurrentFormValid}
          />
        </>
      );

    case 'income-rental':
      return (
        <>
          <RentalPropertyForm
            values={taxReturn.rentalProperties}
            onChange={(rentalProperties) => {
              updateTaxReturn({ rentalProperties });
              recalculateTaxes();
            }}
            onValidationChange={setIsCurrentFormValid}
          />
          <FormNavigation
            currentStep={currentStep}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canProceed={isCurrentFormValid}
          />
        </>
      );

    case 'retirement-accounts':
      return (
        <>
          <RetirementForm
            traditionalIRA={taxReturn.traditionalIRAContribution}
            rothIRA={taxReturn.rothIRAContribution}
            form8606={taxReturn.form8606}
            onUpdate={(updates) => {
              updateTaxReturn(updates);
              recalculateTaxes();
            }}
          />
          <FormNavigation
            currentStep={currentStep}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        </>
      );

    case 'deductions':
      const agi = calculateAGI(taxReturn);
      return (
        <>
          <ItemizedDeductionsForm
            values={taxReturn.itemizedDeductions}
            onChange={(itemizedDeductions) => {
              updateTaxReturn({ itemizedDeductions });
              recalculateTaxes();
            }}
            agi={agi}
            filingStatus={taxReturn.personalInfo.filingStatus}
          />
          <FormNavigation
            currentStep={currentStep}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        </>
      );

    case 'credits':
      return (
        <>
          <CreditsForm
            educationExpenses={taxReturn.educationExpenses}
            onEducationExpensesChange={(educationExpenses) => {
              updateTaxReturn({ educationExpenses });
              recalculateTaxes();
            }}
            onValidationChange={setIsCurrentFormValid}
          />
          <FormNavigation
            currentStep={currentStep}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canProceed={isCurrentFormValid}
          />
        </>
      );

    case 'review':
      return (
        <div className="max-w-5xl mx-auto space-y-8 px-4 py-6 fade-in">
          {/* Hero Header */}
          <div className="text-center space-y-3">
            <h2 className="text-4xl font-bold text-slate-900">Tax Return Summary</h2>
            <p className="text-slate-600 text-lg">Review your complete 2025 tax return</p>
          </div>
          
          {taxCalculation ? (
            <>
              {/* Main Refund/Owed Card - Most Prominent */}
              <div className={`
                card-premium overflow-hidden border-2
                ${taxCalculation.refundOrAmountOwed > 0 
                  ? 'bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 border-green-300' 
                  : 'bg-gradient-to-br from-red-50 via-orange-50 to-red-50 border-red-300'
                }
              `}>
                <div className="p-8 text-center">
                  <div className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">
                    {taxCalculation.refundOrAmountOwed > 0 ? '✨ Expected Refund' : '⚠️ Amount Owed'}
                  </div>
                  <div className={`
                    text-7xl font-bold number-emphasis mb-4
                    ${taxCalculation.refundOrAmountOwed > 0 ? 'text-green-600' : 'text-red-600'}
                  `}>
                    ${Math.abs(taxCalculation.refundOrAmountOwed).toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600">
                    {taxCalculation.refundOrAmountOwed > 0 
                      ? 'Congratulations! You\'re getting money back.'
                      : 'Please ensure payment is made by the tax deadline.'
                    }
                  </div>
                </div>
              </div>

              {/* PDF Download Button - Prominent */}
              <div className="flex justify-center">
                <PdfDownloadButton taxReturn={taxReturn} />
              </div>

              {/* Income Section */}
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-blue-100">
                  💰 Income & Adjustments
                </h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                    <dt className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">Total Income</dt>
                    <dd className="text-4xl font-bold text-slate-900 currency">
                      ${taxCalculation.totalIncome.toLocaleString()}
                    </dd>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
                    <dt className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">Adjustments</dt>
                    <dd className="text-4xl font-bold text-purple-700 currency">
                      -${taxCalculation.adjustments.toLocaleString()}
                    </dd>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-5 border border-green-200 md:col-span-2">
                    <dt className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                      Adjusted Gross Income (AGI)
                    </dt>
                    <dd className="text-5xl font-bold text-green-700 currency">
                      ${taxCalculation.agi.toLocaleString()}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Deductions & Taxable Income */}
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-blue-100">
                  📊 Deductions & Taxable Income
                </h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100">
                    <dt className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                      Standard/Itemized Deduction
                    </dt>
                    <dd className="text-4xl font-bold text-amber-700 currency">
                      -${taxCalculation.standardOrItemizedDeduction.toLocaleString()}
                    </dd>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-200">
                    <dt className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                      Taxable Income
                    </dt>
                    <dd className="text-4xl font-bold text-blue-700 currency">
                      ${taxCalculation.taxableIncome.toLocaleString()}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Tax Calculation */}
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-blue-100">
                  🧮 Tax Calculation
                </h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-5 border border-slate-200">
                    <dt className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">Regular Tax</dt>
                    <dd className="text-4xl font-bold text-slate-900 currency">
                      ${taxCalculation.regularTax.toLocaleString()}
                    </dd>
                  </div>

                  {taxCalculation.amt > 0 && (
                    <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-5 border border-red-200">
                      <dt className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                        Alternative Minimum Tax
                      </dt>
                      <dd className="text-4xl font-bold text-red-600 currency">
                        +${taxCalculation.amt.toLocaleString()}
                      </dd>
                    </div>
                  )}

                  {taxCalculation.selfEmploymentTax > 0 && (
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-200">
                      <dt className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                        Self-Employment Tax
                      </dt>
                      <dd className="text-4xl font-bold text-orange-700 currency">
                        ${taxCalculation.selfEmploymentTax.toLocaleString()}
                      </dd>
                    </div>
                  )}

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                    <dt className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                      Tax Credits
                    </dt>
                    <dd className="text-4xl font-bold text-green-600 currency">
                      -${taxCalculation.totalCredits.toLocaleString()}
                    </dd>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-blue-100 rounded-xl p-6 border-2 border-indigo-300 md:col-span-2">
                    <dt className="text-base font-bold text-slate-700 uppercase tracking-wide mb-3">
                      Total Tax Liability
                    </dt>
                    <dd className="text-5xl font-bold text-indigo-700 currency">
                      ${taxCalculation.totalTax.toLocaleString()}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Payments */}
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-blue-100">
                  💳 Payments & Withholding
                </h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-5 border border-teal-100">
                    <dt className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                      Federal Tax Withheld
                    </dt>
                    <dd className="text-4xl font-bold text-teal-700 currency">
                      ${taxCalculation.federalTaxWithheld.toLocaleString()}
                    </dd>
                  </div>

                  <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-5 border border-sky-100">
                    <dt className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                      Estimated Tax Payments
                    </dt>
                    <dd className="text-4xl font-bold text-sky-700 currency">
                      ${taxCalculation.estimatedTaxPayments.toLocaleString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </>
          ) : (
            <div className="card-premium p-12 text-center">
              <p className="text-slate-500 text-lg">No tax calculation available. Please complete the required forms.</p>
            </div>
          )}
        </div>
      );

    default:
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">This section is under development.</p>
        </div>
      );
  }
}

// Main page component
export default function Home() {
  return (
    <TaxReturnProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              2025 Tax Return Preparation
            </h1>
          </div>
        </header>

        <main>
          <MainContent />
        </main>
      </div>
    </TaxReturnProvider>
  );
}

// Use client-side access to context
function MainContent() {
  const { currentStep, setCurrentStep } = useTaxReturn();
  
  return (
    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-8">
      <div className="lg:grid lg:grid-cols-[1fr_350px] lg:gap-8">
        {/* Main Content Area */}
        <div className="space-y-8 pb-80 lg:pb-8">
          <WizardNavigation
            currentStep={currentStep}
            onStepChange={setCurrentStep}
          />
          
          <div className="bg-white shadow-sm rounded-lg p-8">
            <WizardStepContent />
          </div>
        </div>

        {/* Sidebar - Sticky on desktop, bottom sheet on mobile */}
        <TaxSummarySidebar />
      </div>
    </div>
  );
}