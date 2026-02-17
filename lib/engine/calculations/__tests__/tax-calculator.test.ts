import { calculateTotalIncome, calculateTaxReturn } from '../tax-calculator';
import { TaxReturn } from '../../../../types/tax-types';

describe('Tax Calculator', () => {
  describe('calculateTotalIncome', () => {
    it('should correctly calculate total income including self-employment', () => {
      const mockTaxReturn: TaxReturn = {
        w2Income: [{ wages: 75000, federalTaxWithheld: 15000 }],
        selfEmployment: {
          businessName: 'Test Business',
          grossReceipts: 30000,
          returns: 2000,
          costOfGoodsSold: 3000,
          expenses: {
            advertising: 1000,
            carAndTruck: 2000,
            // ... other expenses with 0 values
          }
        },
        // ... other required fields with default values
        personalInfo: {
          firstName: 'Test',
          lastName: 'User',
          ssn: '123456789',
          address: '123 Test St',
          city: 'TestCity',
          state: 'TX',
          zipCode: '12345',
          filingStatus: 'Single',
          age: 30,
          isBlind: false
        },
        dependents: [],
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
          alimonyPaid: 0
        },
        educationExpenses: [],
        estimatedTaxPayments: 0
      };

      const totalIncome = calculateTotalIncome(mockTaxReturn);
      expect(totalIncome).toBe(100000); // 75000 W2 + 25000 SE (30000 - 2000 - 3000)
    });

    it('should not include self-employment expenses in total income calculation', () => {
      const mockTaxReturn: TaxReturn = {
        w2Income: [{ wages: 50000, federalTaxWithheld: 10000 }],
        selfEmployment: {
          businessName: 'Test Business',
          grossReceipts: 20000,
          returns: 1000,
          costOfGoodsSold: 2000,
          expenses: {
            advertising: 2000,
            carAndTruck: 3000,
            // High expenses that shouldn't affect gross income
          }
        },
        // ... other required fields
        personalInfo: {
          firstName: 'Test',
          lastName: 'User',
          ssn: '123456789',
          address: '123 Test St',
          city: 'TestCity',
          state: 'TX',
          zipCode: '12345',
          filingStatus: 'Single',
          age: 30,
          isBlind: false
        },
        dependents: [],
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
          alimonyPaid: 0
        },
        educationExpenses: [],
        estimatedTaxPayments: 0
      };

      const totalIncome = calculateTotalIncome(mockTaxReturn);
      // Should be 50000 (W2) + 17000 (SE: 20000 - 1000 - 2000)
      expect(totalIncome).toBe(67000);
    });
  });

  describe('calculateTaxReturn', () => {
    it('should properly include self-employment income in final calculations', () => {
      const mockTaxReturn: TaxReturn = {
        w2Income: [{ wages: 75000, federalTaxWithheld: 15000 }],
        selfEmployment: {
          businessName: 'Test Business',
          grossReceipts: 30000,
          returns: 2000,
          costOfGoodsSold: 3000,
          expenses: {
            advertising: 1000,
            carAndTruck: 2000,
            // ... other expenses
          }
        },
        // ... other required fields
        personalInfo: {
          firstName: 'Test',
          lastName: 'User',
          ssn: '123456789',
          address: '123 Test St',
          city: 'TestCity',
          state: 'TX',
          zipCode: '12345',
          filingStatus: 'Single',
          age: 30,
          isBlind: false
        },
        dependents: [],
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
          alimonyPaid: 0
        },
        educationExpenses: [],
        estimatedTaxPayments: 0
      };

      const result = calculateTaxReturn(mockTaxReturn);
      
      expect(result.totalIncome).toBe(100000); // 75000 + 25000
      expect(result.selfEmploymentTax).toBeGreaterThan(0); // Should have SE tax
      expect(result.totalTax).toBeGreaterThan(result.regularTax); // Total should include SE tax
    });
  });
});