'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  TraditionalIRAContribution,
  RothIRAContribution,
  Form8606Data,
  EmployerPlanContribution,
  RetirementStrategy,
} from '../../types/tax-types';
import { calculateForm8606, validateMegaBackdoorRoth } from '../../lib/engine/forms/form-8606';
import { validateRetirement } from '../../lib/validation/form-validation';
import { AlertCircle, ChevronDown, ChevronUp, HelpCircle, CheckCircle, Info } from 'lucide-react';
import ValidationError from '../common/ValidationError';

/* ─── Constants ─── */
const IRA_LIMIT_2025 = 7000;
const IRA_CATCHUP_2025 = 8000;
const EMPLOYEE_401K_LIMIT_2025 = 23500;
const EMPLOYEE_401K_CATCHUP_2025 = 31000;
const TOTAL_415_LIMIT_2025 = 70000;

/* ─── Props ─── */
interface RetirementFormProps {
  traditionalIRA?: TraditionalIRAContribution;
  rothIRA?: RothIRAContribution;
  form8606?: Form8606Data;
  employerPlan?: EmployerPlanContribution;
  retirementStrategy?: RetirementStrategy;
  onUpdate: (updates: {
    traditionalIRA?: TraditionalIRAContribution;
    rothIRA?: RothIRAContribution;
    form8606?: Form8606Data;
    employerPlan?: EmployerPlanContribution;
    retirementStrategy?: RetirementStrategy;
  }) => void;
  onValidationChange?: (isValid: boolean) => void;
}

/* ─── Collapsible Section ─── */
function Section({
  title, subtitle, icon, defaultOpen = false, badge, children,
}: {
  title: string; subtitle?: string; icon?: React.ReactNode;
  defaultOpen?: boolean; badge?: React.ReactNode; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card-premium overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {badge}
          {open ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
      </button>
      {open && <div className="px-5 pb-6 pt-2 border-t border-slate-100">{children}</div>}
    </div>
  );
}

/* ─── Tooltip ─── */
function Tip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-block ml-1">
      <HelpCircle className="w-4 h-4 text-slate-400 cursor-help inline"
        onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} onClick={() => setShow(!show)} />
      {show && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-lg bg-slate-800 text-white text-xs p-3 shadow-lg">
          {text}
        </span>
      )}
    </span>
  );
}

/* ─── Dollar Input ─── */
function DollarInput({
  value, onChange, onBlur, label, tip, hint, error, max, placeholder = '0.00',
}: {
  value: number; onChange: (v: number) => void; onBlur?: () => void;
  label: string; tip?: string; hint?: string; error?: string; max?: number; placeholder?: string;
}) {
  const cls = `block w-full rounded-lg shadow-sm pl-8 ${
    error ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
          : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600'
  }`;
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}{tip && <Tip text={tip} />}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
        <input type="number" step="0.01" min="0" max={max} value={value || ''} placeholder={placeholder}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)} onBlur={onBlur} className={cls} />
      </div>
      {error && <ValidationError message={error} />}
      {!error && hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN FORM
   ═══════════════════════════════════════════════════════════ */
export default function RetirementForm({
  traditionalIRA, rothIRA, form8606, employerPlan, retirementStrategy, onUpdate, onValidationChange,
}: RetirementFormProps) {
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const strategy = retirementStrategy || 'none';

  const errors = validateRetirement(traditionalIRA, rothIRA, form8606);
  const isValid = errors.length === 0;
  useEffect(() => { onValidationChange?.(isValid); }, [isValid, onValidationChange]);

  const analysis = useMemo(() => {
    if (!form8606) return { warnings: [] as string[], recommendations: [] as string[] };
    return validateMegaBackdoorRoth(form8606);
  }, [form8606]);

  const touchField = (name: string) => setTouchedFields((prev) => new Set([...prev, name]));
  const getError = (name: string) => {
    if (!touchedFields.has(name)) return undefined;
    return errors.find((e) => e.field === name)?.message;
  };

  const emit = (partial: Partial<{
    traditionalIRA: TraditionalIRAContribution;
    rothIRA: RothIRAContribution;
    form8606: Form8606Data;
    employerPlan: EmployerPlanContribution;
    retirementStrategy: RetirementStrategy;
  }>) => onUpdate({
    traditionalIRA, rothIRA, form8606, employerPlan, retirementStrategy: strategy,
    ...partial,
  });

  const setTraditionalIRA = (u: Partial<TraditionalIRAContribution>) =>
    emit({ traditionalIRA: { ...traditionalIRA, ...u } as TraditionalIRAContribution });
  const setRothIRA = (u: Partial<RothIRAContribution>) =>
    emit({ rothIRA: { ...rothIRA, ...u } as RothIRAContribution });
  const setForm8606 = (u: Partial<Form8606Data>) =>
    emit({ form8606: { ...form8606, ...u } as Form8606Data });
  const setEmployerPlan = (u: Partial<EmployerPlanContribution>) =>
    emit({
      employerPlan: {
        planType: '401k', employeePreTax: 0, employeeRoth: 0, employerMatch: 0,
        afterTaxNonRoth: 0, afterTaxRolloverToRoth: 0, hasInPlanRothRollover: false,
        ...employerPlan, ...u,
      },
    });
  const setStrategy = (s: RetirementStrategy) => emit({ retirementStrategy: s });

  const form8606Results = useMemo(
    () => (form8606 && form8606.conversionsToRoth > 0 ? calculateForm8606(form8606) : null),
    [form8606],
  );

  const totalEmployeeDeferrals = (employerPlan?.employeePreTax || 0) + (employerPlan?.employeeRoth || 0);
  const total415 = totalEmployeeDeferrals + (employerPlan?.employerMatch || 0) + (employerPlan?.afterTaxNonRoth || 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-6 fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Retirement Accounts</h2>
        <p className="text-slate-600">Tell us about your retirement contributions and any Roth conversions for 2025.</p>
      </div>

      {/* Strategy Selector */}
      <div className="card-premium p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-1">What did you do in 2025?</h3>
        <p className="text-sm text-slate-500 mb-4">Pick the option that best describes your situation. We&apos;ll show only the fields you need.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {([
            { id: 'none' as const, label: 'No retirement activity', desc: "I didn't contribute to any retirement accounts this year." },
            { id: 'basic' as const, label: 'Basic contributions', desc: 'I contributed to a Traditional or Roth IRA and/or a 401(k).' },
            { id: 'backdoor-roth' as const, label: 'Backdoor Roth', desc: 'I contributed after-tax to a Traditional IRA, then converted to Roth.' },
            { id: 'mega-backdoor-roth' as const, label: 'Mega Backdoor Roth', desc: 'I made after-tax 401(k) contributions, then rolled them to Roth.' },
          ]).map((opt) => (
            <button key={opt.id} type="button" onClick={() => setStrategy(opt.id)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                strategy === opt.id ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}>
              <span className="font-semibold text-slate-900 text-sm">{opt.label}</span>
              <span className="block text-xs text-slate-500 mt-1">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* No Activity */}
      {strategy === 'none' && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
          <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
          <p className="text-slate-700 font-medium">No retirement contributions to report.</p>
          <p className="text-sm text-slate-500 mt-1">You can move on to the next step.</p>
        </div>
      )}

      {/* ═══ BASIC / BACKDOOR / MEGA — IRA Section ═══ */}
      {strategy !== 'none' && (
        <>
          <Section title="IRA Contributions" subtitle="Traditional and Roth IRA contributions for 2025"
            icon={<span className="text-2xl">🏦</span>} defaultOpen>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <DollarInput label="Traditional IRA Contribution" value={traditionalIRA?.amount || 0}
                onChange={(v) => setTraditionalIRA({ amount: v })} onBlur={() => touchField('retirement-traditional-amount')}
                error={getError('retirement-traditional-amount')}
                hint={`2025 limit: $${IRA_LIMIT_2025.toLocaleString()} ($${IRA_CATCHUP_2025.toLocaleString()} if 50+). Found on Form 5498.`}
                max={IRA_CATCHUP_2025}
                tip="Contributions to a Traditional IRA. May be tax-deductible depending on your income and workplace plan coverage." />
              <DollarInput label="Roth IRA Contribution" value={rothIRA?.amount || 0}
                onChange={(v) => setRothIRA({ amount: v })} onBlur={() => touchField('retirement-roth-amount')}
                error={getError('retirement-roth-amount')}
                hint={`2025 limit: $${IRA_LIMIT_2025.toLocaleString()} ($${IRA_CATCHUP_2025.toLocaleString()} if 50+). Phase-out starts at $150K (single) / $236K (MFJ).`}
                max={IRA_CATCHUP_2025}
                tip="Direct Roth IRA contributions. Income limits apply. If over the limit, use the Backdoor Roth strategy." />
            </div>
            {getError('retirement-combined-limit') && (
              <div className="mt-4"><ValidationError message={getError('retirement-combined-limit')} /></div>
            )}
            {(traditionalIRA?.amount || 0) > 0 && (
              <div className="mt-4 flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                <input type="checkbox" id="isDeductible" checked={traditionalIRA?.isDeductible || false}
                  onChange={(e) => setTraditionalIRA({ isDeductible: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
                <label htmlFor="isDeductible" className="text-sm text-slate-700">
                  <span className="font-semibold">This contribution is tax-deductible</span>
                  <span className="block text-xs text-slate-500 mt-0.5">
                    Depends on income and workplace plan coverage. For Backdoor Roth, leave <strong>unchecked</strong>.
                  </span>
                </label>
              </div>
            )}
          </Section>

          {/* 401(k) Section */}
          <Section title="401(k) / 403(b) / 457 Contributions"
            subtitle="Employer-sponsored plan (shown on your W-2, box 12)"
            icon={<span className="text-2xl">🏢</span>}
            defaultOpen={strategy === 'mega-backdoor-roth'}
            badge={totalEmployeeDeferrals > 0 ? (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                ${totalEmployeeDeferrals.toLocaleString()} contributed
              </span>
            ) : null}>
            <div className="mt-4 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Plan Type</label>
                <select value={employerPlan?.planType || '401k'}
                  onChange={(e) => setEmployerPlan({ planType: e.target.value as EmployerPlanContribution['planType'] })}
                  className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-600 focus:ring-blue-600">
                  <option value="401k">401(k)</option>
                  <option value="403b">403(b)</option>
                  <option value="457b">457(b)</option>
                  <option value="tsp">TSP (Federal)</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DollarInput label="Pre-Tax (Traditional) Deferrals" value={employerPlan?.employeePreTax || 0}
                  onChange={(v) => setEmployerPlan({ employeePreTax: v })}
                  hint={`W-2 Box 12 code D. 2025 limit: $${EMPLOYEE_401K_LIMIT_2025.toLocaleString()} ($${EMPLOYEE_401K_CATCHUP_2025.toLocaleString()} if 50+).`}
                  tip="Pre-tax contributions from your paycheck. Reduces taxable income." />
                <DollarInput label="Roth (Designated Roth) Deferrals" value={employerPlan?.employeeRoth || 0}
                  onChange={(v) => setEmployerPlan({ employeeRoth: v })}
                  hint="W-2 Box 12 code AA. Same combined limit as pre-tax."
                  tip="Roth 401(k) contributions from after-tax pay. Grows tax-free." />
                <DollarInput label="Employer Match" value={employerPlan?.employerMatch || 0}
                  onChange={(v) => setEmployerPlan({ employerMatch: v })}
                  hint="Your employer's matching contributions. Found on plan statement."
                  tip="Employer contributions on your behalf. Always pre-tax." />
              </div>
              {totalEmployeeDeferrals > EMPLOYEE_401K_CATCHUP_2025 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    Combined deferrals (${totalEmployeeDeferrals.toLocaleString()}) exceed the 2025 catch-up limit of ${EMPLOYEE_401K_CATCHUP_2025.toLocaleString()}.
                  </p>
                </div>
              )}
              {total415 > TOTAL_415_LIMIT_2025 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">
                    Total annual additions (${total415.toLocaleString()}) exceed the 2025 §415(c) limit of ${TOTAL_415_LIMIT_2025.toLocaleString()}.
                  </p>
                </div>
              )}
            </div>
          </Section>
        </>
      )}

      {/* ═══ BACKDOOR ROTH ═══ */}
      {strategy === 'backdoor-roth' && (
        <Section title="Backdoor Roth Conversion"
          subtitle="Track your nondeductible Traditional IRA → Roth IRA conversion"
          icon={<span className="text-2xl">🚪</span>} defaultOpen>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mt-3 mb-6">
            <h4 className="font-semibold text-blue-900 mb-3">How the Backdoor Roth works</h4>
            <ol className="space-y-2 text-sm text-blue-800">
              {[
                ['1', <>Contribute to a <strong>Traditional IRA</strong> (nondeductible — leave &quot;deductible&quot; unchecked above)</>],
                ['2', <><strong>Convert</strong> the Traditional IRA balance to a Roth IRA (ideally right away)</>],
                ['3', <>If you have <strong>no other pre-tax IRA money</strong>, the conversion is tax-free ✅</>],
              ].map(([n, text]) => (
                <li key={String(n)} className="flex items-start gap-2">
                  <span className="bg-blue-200 text-blue-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{n}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-amber-800 mb-1">⚠️ Pro-Rata Rule</p>
            <p className="text-xs text-amber-700">
              If you have <em>any</em> pre-tax money in Traditional, SEP, or SIMPLE IRAs, a portion of the conversion becomes taxable. Roll pre-tax IRA balances into your 401(k) first to avoid this.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DollarInput label="Nondeductible IRA Contributions (this year)" value={form8606?.nondeductibleContributions || 0}
              onChange={(v) => setForm8606({ nondeductibleContributions: v })} onBlur={() => touchField('retirement-8606-nondeductible')}
              error={getError('retirement-8606-nondeductible')}
              hint="After-tax contributions to Traditional IRA in 2025. (Form 8606, Line 1)"
              tip="Amount contributed to Traditional IRA that you chose NOT to deduct." />
            <DollarInput label="Prior-Year Basis (carry-forward)" value={form8606?.priorYearBasis || 0}
              onChange={(v) => setForm8606({ priorYearBasis: v })} onBlur={() => touchField('retirement-8606-priorBasis')}
              error={getError('retirement-8606-priorBasis')}
              hint="Total nondeductible contributions from prior years. (Form 8606, Line 2)"
              tip="Found on prior year Form 8606, Line 14. First year? Enter 0." />
            <DollarInput label="Amount Converted to Roth IRA" value={form8606?.conversionsToRoth || 0}
              onChange={(v) => setForm8606({ conversionsToRoth: v })} onBlur={() => touchField('retirement-8606-conversions')}
              error={getError('retirement-8606-conversions')}
              hint="Amount moved from Traditional to Roth IRA in 2025. (Form 8606, Line 4)"
              tip="From your 1099-R (distribution code 02 or 07)." />
            <DollarInput label="Distributions from Traditional IRA" value={form8606?.distributionsFromTraditionalIRA || 0}
              onChange={(v) => setForm8606({ distributionsFromTraditionalIRA: v })} onBlur={() => touchField('retirement-8606-distributions')}
              error={getError('retirement-8606-distributions')}
              hint="Regular withdrawals (not conversions). (Form 8606, Line 5)"
              tip="Only non-conversion distributions. Conversions go above." />
            <DollarInput label="All Traditional IRA Balances at Dec 31, 2025" value={form8606?.endOfYearTraditionalIRABalance || 0}
              onChange={(v) => setForm8606({ endOfYearTraditionalIRABalance: v })} onBlur={() => touchField('retirement-8606-balance')}
              error={getError('retirement-8606-balance')}
              hint="Combined year-end value of ALL Traditional, SEP & SIMPLE IRAs. (Form 8606, Line 7)"
              tip="Critical for pro-rata. If $0, your conversion is fully tax-free!" />
          </div>

          {/* Warnings & Recommendations */}
          {analysis.warnings.length > 0 && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h5 className="text-yellow-800 font-semibold mb-2">⚠️ Heads Up</h5>
              <ul className="list-disc list-inside text-yellow-700 space-y-1 text-sm">
                {analysis.warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}
          {analysis.recommendations.length > 0 && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="text-green-800 font-semibold mb-2">✅ Recommendations</h5>
              <ul className="list-disc list-inside text-green-700 space-y-1 text-sm">
                {analysis.recommendations.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}

          {/* Conversion Breakdown */}
          {form8606Results && (
            <div className="mt-6 bg-slate-50 border border-slate-200 rounded-lg p-5">
              <h5 className="font-semibold text-slate-800 mb-4">Conversion Tax Breakdown</h5>
              <div className="space-y-3">
                <div className="flex justify-between text-sm py-2 border-b border-slate-200">
                  <span className="text-slate-600">Your total after-tax basis</span>
                  <span className="font-semibold">${form8606Results.line3_totalBasis.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-slate-200">
                  <span className="text-slate-600">Total IRA pool (pro-rata denominator)</span>
                  <span className="font-semibold">${form8606Results.line8_totalIRABalancePlusDistributions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-slate-200">
                  <span className="text-slate-600">Tax-free percentage</span>
                  <span className="font-semibold text-blue-600">{(form8606Results.line9_basisPercentage * 100).toFixed(1)}%</span>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-3">
                  <div className="bg-white rounded-lg p-3 border text-center">
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Converted</div>
                    <div className="text-lg font-bold text-slate-800 mt-1">${form8606Results.line16_amountConverted.toLocaleString()}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200 text-center">
                    <div className="text-xs text-green-700 uppercase tracking-wide">Tax-Free</div>
                    <div className="text-lg font-bold text-green-600 mt-1">${form8606Results.line17_nontaxablePortion.toLocaleString()}</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 border border-red-200 text-center">
                    <div className="text-xs text-red-700 uppercase tracking-wide">Taxable</div>
                    <div className="text-lg font-bold text-red-600 mt-1">${form8606Results.line18_taxablePortion.toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-slate-600">Basis carried forward to 2026</span>
                  <span className="font-semibold">${form8606Results.remainingBasis.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </Section>
      )}

      {/* ═══ MEGA BACKDOOR ROTH ═══ */}
      {strategy === 'mega-backdoor-roth' && (
        <Section title="Mega Backdoor Roth"
          subtitle="After-tax 401(k) contributions rolled to Roth"
          icon={<span className="text-2xl">🚀</span>} defaultOpen>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 mt-3 mb-6">
            <h4 className="font-semibold text-purple-900 mb-3">How the Mega Backdoor Roth works</h4>
            <ol className="space-y-2 text-sm text-purple-800">
              {[
                ['1', 'Max out your regular 401(k) contributions ($23,500 in 2025)'],
                ['2', <>Make additional <strong>after-tax (non-Roth)</strong> contributions up to the §415(c) limit of $70,000 total</>],
                ['3', <>Roll those after-tax dollars into a <strong>Roth IRA</strong> or do an <strong>in-plan Roth conversion</strong></>],
              ].map(([n, text]) => (
                <li key={String(n)} className="flex items-start gap-2">
                  <span className="bg-purple-200 text-purple-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{n}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ol>
            <p className="text-xs text-purple-700 mt-3">
              <strong>Not all plans support this.</strong> Your plan must allow after-tax contributions and either in-service distributions or in-plan Roth rollovers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DollarInput label="After-Tax (Non-Roth) 401(k) Contributions" value={employerPlan?.afterTaxNonRoth || 0}
              onChange={(v) => setEmployerPlan({ afterTaxNonRoth: v })}
              hint="Additional after-tax contributions beyond elective deferrals."
              tip="Extra after-tax money for the Mega Backdoor strategy. Different from Roth 401(k) deferrals." />
            <DollarInput label="Amount Rolled to Roth" value={employerPlan?.afterTaxRolloverToRoth || 0}
              onChange={(v) => setEmployerPlan({ afterTaxRolloverToRoth: v })}
              hint="How much of the after-tax balance you converted/rolled to Roth."
              tip="In-plan Roth rollover or rollover to Roth IRA. After-tax portion is tax-free; earnings are taxable." />
          </div>

          <div className="mt-4 flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
            <input type="checkbox" id="hasInPlanRothRollover" checked={employerPlan?.hasInPlanRothRollover || false}
              onChange={(e) => setEmployerPlan({ hasInPlanRothRollover: e.target.checked })}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
            <label htmlFor="hasInPlanRothRollover" className="text-sm text-slate-700">
              <span className="font-semibold">My plan supports in-plan Roth rollovers</span>
              <span className="block text-xs text-slate-500 mt-0.5">
                If checked, after-tax money was converted to Roth within the plan. Otherwise, rolled to a Roth IRA.
              </span>
            </label>
          </div>

          {(employerPlan?.afterTaxRolloverToRoth || 0) > 0 && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-5">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-green-900">Mega Backdoor Roth Summary</h5>
                  <p className="text-sm text-green-800 mt-1">
                    You rolled <strong>${(employerPlan?.afterTaxRolloverToRoth || 0).toLocaleString()}</strong> of after-tax 401(k) money into Roth.
                    The contribution portion converts tax-free. Any <em>earnings</em> before conversion are taxable.
                  </p>
                  <p className="text-xs text-green-700 mt-2">
                    Reported on Form 1099-R from your plan administrator. Code G (direct rollover) or H (rollover to Roth IRA).
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold">Did you also do a regular Backdoor Roth (IRA-level)?</p>
                <p className="mt-1">If you made a nondeductible Traditional IRA contribution and converted to Roth, switch to <strong>&quot;Backdoor Roth&quot;</strong> above to fill out Form 8606.</p>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Validation Summary */}
      {!isValid && touchedFields.size > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-red-800 mb-2">Please fix these issues:</h3>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {errors.map((e, i) => <li key={i}>{e.message}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
