# 2025 Tax Preparation Software

A comprehensive tax preparation software for the 2025 tax year built with Next.js 15, React 19, TypeScript, and Tailwind CSS.

## Features

- Complete coverage of common personal tax scenarios:
  - W-2 wage income
  - Self-employment (Schedule C, SE)
  - Rental property (Schedule E)
  - Capital gains (Schedule D, Form 8949)
  - Retirement accounts including mega backdoor Roth (Form 8606)
  - HSA contributions (Form 8889)
  - Itemized/standard deductions (Schedule A)
  - All major tax credits
  - Alternative Minimum Tax (Form 6251)

- Smart wizard interface with conditional logic
- Comprehensive tax calculation engine using 2025 tax law
- Mobile-responsive design
- Local storage for data persistence

## Installation

1. Clone the repository:
\`\`\`bash
git clone [repository-url]
cd tax-software
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to use the application.

## Usage

1. Navigate through the tax preparation wizard using the top navigation bar.
2. Fill out each section with your tax information:
   - Personal information and filing status
   - Income from various sources
   - Deductions and credits
   - Retirement account contributions
   - And more

3. Review your tax calculation in the final step.
4. Your progress is automatically saved to local storage.

## Key Components

- **/components/wizard/** - Wizard navigation and step management
- **/components/forms/** - Form components for different tax scenarios
- **/lib/engine/calculations/** - Tax calculation engine
- **/lib/engine/forms/** - Form-specific calculations (e.g., Form 8606)
- **/types/** - TypeScript type definitions
- **/data/** - Tax constants and rates for 2025

## Tax Calculation Features

- Accurate implementation of 2025 tax brackets
- Alternative Minimum Tax (AMT) calculation
- Self-employment tax calculation
- Capital gains categorization and calculation
- Form 8606 mega backdoor Roth calculations with pro-rata rule
- Standard vs. itemized deduction optimization
- Tax credit calculations and phaseouts

## Development

### File Structure

\`\`\`
tax-software/
├── app/               # Next.js app router
├── components/        # React components
│   ├── forms/        # Tax form components
│   ├── wizard/       # Wizard navigation
│   └── review/       # Summary components
├── lib/              # Core logic
│   ├── engine/       # Tax calculations
│   └── context/      # React context
├── types/            # TypeScript types
└── data/             # Tax constants
\`\`\`

### Key Technologies

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- pdf-lib (for PDF generation)
- Zod (for validation)

## Testing

Run tests with:
\`\`\`bash
npm test
\`\`\`

Tests cover:
- Tax calculation accuracy
- Form 8606 pro-rata calculations
- AMT triggers and calculations
- Credit phaseout calculations

## Future Enhancements

- PDF generation for all IRS forms
- E-filing integration
- Multi-year comparison
- State tax return support
- Financial institution import