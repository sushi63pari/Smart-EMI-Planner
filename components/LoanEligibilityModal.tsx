import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, Check, Award, ShieldAlert, Sparkles, Sliders } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { formatCurrency } from '../utils/calculations';
import { AppTranslations } from '../utils/translations';

interface LoanEligibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyIncome: number;
  annualRate: number;
  tenureMonths: number;
  currencySymbol: string;
  currencyCode: string;
  currencyLocale: string;
  onApplyPrincipal: (amount: number) => void;
  translations?: AppTranslations;
}

export const LoanEligibilityModal: React.FC<LoanEligibilityModalProps> = ({
  isOpen,
  onClose,
  monthlyIncome: initialMonthlyIncome,
  annualRate,
  tenureMonths,
  currencySymbol,
  currencyCode,
  currencyLocale,
  onApplyPrincipal,
  translations,
}) => {
  const [modalIncome, setModalIncome] = useState<number>(initialMonthlyIncome || 100000);
  const [multiplier, setMultiplier] = useState<number>(75);
  const [foirPct, setFoirPct] = useState<number>(40); // Standard 40% EMI-to-income ratio

  // Recalculate if initialMonthlyIncome changes when reopened
  React.useEffect(() => {
    if (isOpen) {
      setModalIncome(initialMonthlyIncome || 100000);
    }
  }, [isOpen, initialMonthlyIncome]);

  // Calculations
  const calculatedByMultiplier = useMemo(() => {
    return modalIncome * multiplier;
  }, [modalIncome, multiplier]);

  const calculatedByFOIR = useMemo(() => {
    const maxEMIAllowed = (modalIncome * foirPct) / 100;
    const r = annualRate / 12 / 100;
    const n = tenureMonths;

    if (r === 0) {
      return maxEMIAllowed * n;
    }
    // P = EMI * ((1+r)^n - 1) / (r * (1+r)^n)
    const maxPrincipal = maxEMIAllowed * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
    return Math.floor(maxPrincipal);
  }, [modalIncome, foirPct, annualRate, tenureMonths]);

  const handleApply = (amount: number) => {
    onApplyPrincipal(amount);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          {/* Modal Backdrop click */}
          <div className="absolute inset-0" onClick={onClose} />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white dark:bg-silver-gray rounded-2xl shadow-xl max-w-2xl w-full p-6 sm:p-8 border border-gray-100 dark:border-davys-gray max-h-[90vh] overflow-y-auto custom-scrollbar no-print"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-davys-gray/40 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Award className="text-secondary" size={24} />
                  {translations?.eligibilityHeader || "Loan Eligibility Estimator"}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {translations?.eligibilitySubtitle || "Adjust parameters to view your borrowing potential based on net income metrics."}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 bg-gray-50 dark:bg-davys-gray/20 rounded-full"
                aria-label={translations?.closeLabel || "Close"}
              >
                <X size={18} />
              </button>
            </div>

            {/* Income Config */}
            <div className="bg-gray-50 dark:bg-smoke-gray/40 p-4 sm:p-5 rounded-xl border border-gray-100 dark:border-davys-gray/30 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    {translations?.netMonthlyIncomeLabel || "Net Monthly Income"}
                  </h4>
                  <div className="relative">
                    <input
                      type="number"
                      value={modalIncome || ''}
                      onChange={(e) => {
                        const val = Math.max(0, Number(e.target.value));
                        setModalIncome(val);
                      }}
                      className="w-full bg-white dark:bg-silver-gray border border-gray-200 dark:border-davys-gray rounded-lg pl-8 pr-3 py-2 text-sm text-gray-900 dark:text-davys-gray font-bold focus:outline-none focus:ring-2 focus:ring-primary h-10 transition-all"
                    />
                    <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-semibold text-gray-500 dark:text-davys-gray">
                      {currencySymbol}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500 dark:text-silver-gray mb-1 flex justify-between">
                    <span>{translations?.tweakIncomeLabel || "Tweak Income Fast"}</span>
                    <span className="font-bold text-primary">{formatCurrency(modalIncome, currencyCode, currencyLocale)}</span>
                  </label>
                  <input
                    type="range"
                    min="10000"
                    max="1000000"
                    step="5000"
                    value={modalIncome}
                    onChange={(e) => setModalIncome(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-davys-gray rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>
            </div>

            {/* Methods Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              
              {/* Method A: Multiplier Rule */}
              <div className="border border-gray-100 dark:border-davys-gray rounded-xl p-5 bg-white dark:bg-silver-gray flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-3 border-b border-gray-50 dark:border-davys-gray/20 pb-2">
                    <span className="text-[11px] font-bold text-secondary dark:text-teal-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles size={12} />
                      {translations?.multiplierRuleLabel || "Multiplier Rule"}
                    </span>
                    <span className="text-xs font-semibold text-gray-400">{translations?.ruleOfThumbLabel || "Rule of Thumb"}</span>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-davys-gray mb-4 leading-normal">
                    {translations?.multiplierExplanation || "Banks often approve home/personal loans equal to a fixed multiple (60x to 75x) of your stable net salary."}
                  </p>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Sliders size={12} /> {translations?.multiplierLimitLabel || "Multiplier Limit:"}
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white bg-slate-100 dark:bg-davys-gray px-2 py-0.5 rounded">
                        {multiplier}x {translations?.netMonthlyIncomeLabel || "Net Income"}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="100"
                      step="5"
                      value={multiplier}
                      onChange={(e) => setMultiplier(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 dark:bg-davys-gray rounded-lg appearance-none cursor-pointer accent-secondary"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-davys-gray/40">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{translations?.checkEligibilityBtn || "Eligible Loan Amount"}</div>
                  <div className="text-2xl font-black text-secondary tracking-tight">
                    {formatCurrency(calculatedByMultiplier, currencyCode, currencyLocale)}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full mt-4 font-bold text-xs rounded-lg h-9"
                    onClick={() => handleApply(calculatedByMultiplier)}
                  >
                    {translations?.usableMultiplierPlanBtn || "Use Multiplier Plan"}
                  </Button>
                </div>
              </div>

              {/* Method B: Net EMI Power (FOIR Rule) */}
              <div className="border border-gray-100 dark:border-davys-gray rounded-xl p-5 bg-white dark:bg-silver-gray flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-3 border-b border-gray-50 dark:border-davys-gray/20 pb-2">
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                      <ShieldAlert size={12} />
                      {translations?.foirModelLabel || "FOIR / EMI Model"}
                    </span>
                    <span className="text-xs font-semibold text-gray-400">{translations?.strictCapacityLabel || "Strict Capacity"}</span>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-davys-gray mb-4 leading-normal">
                    {translations?.foirExplanation || "Limits your maximum monthly EMI instalment to a safe percentage (e.g. 40% to 50%) of your stable income."}
                  </p>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Sliders size={12} /> {translations?.maxEmiCapLabel || "Max EMI % Cap:"}
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white bg-slate-100 dark:bg-davys-gray px-2 py-0.5 rounded">
                        {foirPct}% ({translations?.currentEMILabel || "Max EMI"}: {formatCurrency((modalIncome * foirPct) / 100, currencyCode, currencyLocale)})
                      </span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="60"
                      step="5"
                      value={foirPct}
                      onChange={(e) => setFoirPct(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 dark:bg-davys-gray rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-davys-gray/40">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                    {translations?.checkEligibilityBtn || "Eligible Loan"} ({annualRate}% {translations?.interestRateLabel || "rate"} & {tenureMonths}{translations?.monthSuffix || "m"} {translations?.tenureMonthsLabel || "tenure"})
                  </div>
                  <div className="text-2xl font-black text-primary tracking-tight dark:text-indigo-400">
                    {formatCurrency(calculatedByFOIR, currencyCode, currencyLocale)}
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full mt-4 font-bold text-xs rounded-lg h-9 bg-primary dark:bg-indigo-600"
                    onClick={() => handleApply(calculatedByFOIR)}
                  >
                    {translations?.usableFoirPlanBtn || "Use FOIR Capacity Plan"}
                  </Button>
                </div>
              </div>

            </div>

            {/* Note Panel */}
            <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/15 flex gap-3 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
              <HelpCircle size={18} className="flex-shrink-0 text-amber-500 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 dark:text-amber-200 mb-1">{translations?.safetyGuidelinesLabel || "Financial Safety Guidelines:"}</p>
                <p>
                  {translations?.safetyGuidelinesText || "While a 75x Net Income multiplier is widely used by banks to estimate absolute eligibility boundaries, the FOIR / EMI Model represents a more durable financial limit. It ensures that your remaining income easily covers standard operational living costs, and emergency financial events."}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
