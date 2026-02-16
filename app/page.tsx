'use client';

import React from 'react';
import { TaxReturnProvider } from '../lib/context/TaxReturnContext';
import WizardNavigation from '../components/wizard/WizardNavigation';
import PersonalInfoForm from '../components/forms/PersonalInfoForm';
import W2Form from '../components/forms/W2Form';
import CapitalGainsForm from '../components/forms/CapitalGainsForm';
import ScheduleCForm from '../components/forms/ScheduleCForm';
import RentalPropertyForm from '../components/forms/RentalPropertyForm';
import RetirementForm from '../components/forms/RetirementForm';
import TaxSummarySidebar from '../components/review/TaxSummarySidebar';
import { useTaxReturn } from '../lib/context/TaxReturnContext';

// Wizard step components
function WizardStepContent() {
  const { 
    taxReturn, 
    updateTaxReturn,
    currentStep,
    taxCalculation,
    recalculateTaxes 
  } = useTaxReturn();

  switch (currentStep) {
    case 'personal-info':
      return (
        <PersonalInfoForm 
          value={taxReturn.personalInfo}
          onChange={(updates) => {
            updateTaxReturn({ personalInfo: { ...taxReturn.personalInfo, ...updates } });
          }}
        />
      );

    case 'income-w2':
      return (
        <W2Form
          values={taxReturn.w2Income}
          onChange={(w2s) => {
            updateTaxReturn({ w2Income: w2s });
            recalculateTaxes();
          }}
        />
      );

    case 'income-capital-gains':
      return (
        <CapitalGainsForm
          values={taxReturn.capitalGains}
          onChange={(capitalGains) => {
            updateTaxReturn({ capitalGains });
            recalculateTaxes();
          }}
        />
      );

    case 'income-self-employment':
      return (
        <ScheduleCForm
          value={taxReturn.selfEmployment}
          onChange={(selfEmployment) => {
            updateTaxReturn({ selfEmployment });
            recalculateTaxes();
          }}
        />
      );

    case 'income-rental':
      return (
        <RentalPropertyForm
          values={taxReturn.rentalProperties}
          onChange={(rentalProperties) => {
            updateTaxReturn({ rentalProperties });
            recalculateTaxes();
          }}
        />
      );

    case 'retirement-accounts':
      return (
        <RetirementForm
          traditionalIRA={taxReturn.traditionalIRAContribution}
          rothIRA={taxReturn.rothIRAContribution}
          form8606={taxReturn.form8606}
          onUpdate={(updates) => {
            updateTaxReturn(updates);
            recalculateTaxes();
          }}
        />
      );

    case 'review':
      return (
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-2xl font-bold">Tax Return Summary</h2>
          
          {taxCalculation ? (
            <div className="bg-white shadow rounded-lg p-6">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <dt className="text-sm font-medium text-gray-600">Total Income</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    ${taxCalculation.totalIncome.toLocaleString()}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-600">Adjustments to Income</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    ${taxCalculation.adjustments.toLocaleString()}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-600">Adjusted Gross Income (AGI)</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    ${taxCalculation.agi.toLocaleString()}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-600">Standard/Itemized Deduction</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    ${taxCalculation.standardOrItemizedDeduction.toLocaleString()}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-600">Taxable Income</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    ${taxCalculation.taxableIncome.toLocaleString()}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-600">Regular Tax</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    ${taxCalculation.regularTax.toLocaleString()}
                  </dd>
                </div>

                {taxCalculation.amt > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Alternative Minimum Tax</dt>
                    <dd className="mt-1 text-3xl font-semibold text-red-600">
                      +${taxCalculation.amt.toLocaleString()}
                    </dd>
                  </div>
                )}

                <div>
                  <dt className="text-sm font-medium text-gray-600">Total Tax Credits</dt>
                  <dd className="mt-1 text-3xl font-semibold text-green-600">
                    -${taxCalculation.totalCredits.toLocaleString()}
                  </dd>
                </div>

                {taxCalculation.selfEmploymentTax > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Self-Employment Tax</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      ${taxCalculation.selfEmploymentTax.toLocaleString()}
                    </dd>
                  </div>
                )}

                <div className="col-span-2 border-t pt-6">
                  <dt className="text-sm font-medium text-gray-600">Total Tax</dt>
                  <dd className="mt-1 text-4xl font-bold text-gray-900">
                    ${taxCalculation.totalTax.toLocaleString()}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-600">Tax Withheld</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    ${taxCalculation.federalTaxWithheld.toLocaleString()}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-600">Estimated Tax Payments</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    ${taxCalculation.estimatedTaxPayments.toLocaleString()}
                  </dd>
                </div>

                <div className="col-span-2 border-t pt-6">
                  <dt className="text-lg font-semibold text-gray-900">
                    {taxCalculation.refundOrAmountOwed > 0 ? 'Refund Amount' : 'Tax Owed'}
                  </dt>
                  <dd className={`mt-1 text-5xl font-bold ${
                    taxCalculation.refundOrAmountOwed > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${Math.abs(taxCalculation.refundOrAmountOwed).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No tax calculation available.</p>
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