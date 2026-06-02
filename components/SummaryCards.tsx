import React from 'react';
import { formatCurrency } from '../utils/calculations';
import { CalendarClock, Coins, Wallet, Info, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppTranslations } from '../utils/translations';

interface SummaryCardsProps {
  totalInterest: number;
  totalPayment: number;
  monthlyEMI: number;
  finalTenure: number;
  originalTenure: number;
  startDate?: string;
  endDate?: string;
  partPaymentMonthsSaved?: number;
  monthlyIncome?: number;
  currencySymbol: string;
  currencyCode: string;
  currencyLocale: string;
  translations?: AppTranslations;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ 
  totalInterest, 
  totalPayment, 
  monthlyEMI,
  finalTenure,
  originalTenure,
  startDate,
  endDate,
  partPaymentMonthsSaved,
  monthlyIncome,
  currencySymbol,
  currencyCode,
  currencyLocale,
  translations
}) => {
  const tenureSaved = originalTenure - finalTenure;
  const principal = Math.max(0, totalPayment - totalInterest);
  const principalPct = totalPayment > 0 ? (principal / totalPayment * 100).toFixed(1) : '0';
  const interestPct = totalPayment > 0 ? (totalInterest / totalPayment * 100).toFixed(1) : '0';
  const costPerHundred = principal > 0 ? ((totalInterest / principal) * 100).toFixed(0) : '0';

  const emiPct = monthlyIncome && monthlyIncome > 0 ? (monthlyEMI / monthlyIncome) * 100 : 0;
  const emiExceedsLimit = emiPct > 40;

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: "easeOut"
      }
    })
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Monthly EMI */}
      <motion.div 
        custom={0}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        key={`emi-${monthlyEMI}-${currencyCode}`}
        className={`rounded-xl p-4 sm:p-6 text-white shadow-lg transition-all duration-300 ${
          emiExceedsLimit
            ? 'bg-gradient-to-br from-amber-600 to-red-700 shadow-red-100 dark:shadow-none'
            : 'bg-gradient-to-br from-primary to-indigo-700 shadow-indigo-200 dark:shadow-none'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-indigo-100 text-[10px] sm:text-sm font-medium mb-1 flex items-center flex-wrap gap-1">
              {translations?.currentEMILabel || "Current EMI"} {emiExceedsLimit && <span className="text-[10px] bg-red-500/30 text-red-100 px-1.5 py-0.5 rounded-full font-bold">{translations?.riskWarningLabel || "Risk Warning"}</span>}
            </p>
            <h3 className="text-xl sm:text-3xl font-bold tracking-tight">{formatCurrency(monthlyEMI, currencyCode, currencyLocale)}</h3>
            <p className="text-[10px] sm:text-xs text-indigo-200 mt-2 opacity-80">{translations?.monthlyInstalmentLabel || "Monthly Instalment"}</p>
            
            {monthlyIncome && monthlyIncome > 0 && (
              <div className="mt-4 pt-3 border-t border-white/20">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-indigo-200">{translations?.netIncomePercentageLabel || "% of Net Monthly Income:"}</span>
                  <span className={emiExceedsLimit ? "text-amber-200 font-bold" : "text-green-300 font-bold"}>
                    {emiPct.toFixed(1)}%
                  </span>
                </div>
                {emiExceedsLimit ? (
                  <div className="mt-2 flex items-start gap-1.5 bg-black/20 border border-amber-500/20 rounded p-2 text-[10px] text-amber-100 leading-normal font-sans">
                    <AlertTriangle size={12} className="flex-shrink-0 text-amber-300 mt-0.5" />
                    <span>
                      {translations?.criticalIncomeMessage || "Critical stress alert: EMI exceeds 40% of your monthly income. This may impact your financial health and loan eligibility."}
                    </span>
                  </div>
                ) : (
                  <div className="mt-2 text-[10px] text-green-200 font-medium font-sans">
                    {translations?.safeIncomeMessage || "✓ Your EMI is within the safe 40% threshold of your income."}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="p-2 sm:p-3 bg-white/10 rounded-lg backdrop-blur-sm ml-2">
            <Wallet size={20} className="text-white sm:w-6 sm:h-6" />
          </div>
        </div>
      </motion.div>

      {/* Total Interest */}
      <motion.div 
        custom={1}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        key={`interest-${totalInterest}-${currencyCode}`}
        className="bg-white dark:bg-silver-gray rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-davys-gray shadow-sm transition-colors duration-300"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1 relative">
              <span className="text-gray-500 dark:text-davys-gray text-[10px] sm:text-sm font-medium">{translations?.totalInterestLabel || "Total Interest"}</span>
              <div className="relative group/interest inline-block">
                <span className="cursor-help text-gray-400 hover:text-orange-500 dark:text-davys-gray/50 dark:hover:text-amber-500 transition-colors">
                  <Info size={14} />
                </span>
                {/* Tooltip Popup */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 p-3 bg-gray-900 dark:bg-zinc-900 border border-gray-850 dark:border-zinc-850 rounded-xl shadow-xl opacity-0 scale-95 group-hover/interest:opacity-100 group-hover/interest:scale-100 transition-all duration-200 pointer-events-none z-30 font-sans text-white text-left">
                  <div className="text-[12px] font-bold text-orange-400 border-b border-gray-800 dark:border-zinc-800 pb-1.5 mb-2 flex items-center gap-1">
                    <Coins size={12} />
                    <span>{translations?.realCostOfLoanLabel || "Real cost of your loan"}</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] font-medium text-gray-200">
                    <div className="flex justify-between">
                      <span className="text-gray-400">{translations?.principalPaidLabel || "Principal Paid:"}</span>
                      <span>{formatCurrency(principal, currencyCode, currencyLocale)} <span className="text-gray-400 text-[10px]">({principalPct}%)</span></span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{translations?.interestPaidLabel || "Interest Paid:"}</span>
                      <span className="text-orange-400">{formatCurrency(totalInterest, currencyCode, currencyLocale)} <span className="text-gray-400 text-[10px]">({interestPct}%)</span></span>
                    </div>
                    <div className="border-t border-gray-850 dark:border-zinc-800 pt-1.5 mt-1.5 flex justify-between font-bold text-gray-100">
                      <span>{translations?.totalOutgoingsLabel || "Total Outgoings:"}</span>
                      <span>{formatCurrency(totalPayment, currencyCode, currencyLocale)}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 leading-relaxed pt-1.5 border-t border-gray-850 dark:border-zinc-800">
                      {translations?.supplementaryCostMessage ? (
                        <span>{translations.supplementaryCostMessage} <span className="text-white font-semibold">{currencySymbol}100</span>: <span className="text-orange-400 font-semibold">{currencySymbol}{costPerHundred}</span></span>
                      ) : (
                        <span>For every <span className="text-white font-semibold">{currencySymbol}100</span> of principal repaid, you pay supplementary interest of <span className="text-orange-400 font-semibold">{currencySymbol}{costPerHundred}</span>.</span>
                      )}
                    </div>
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-zinc-900"></div>
                </div>
              </div>
            </div>
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-davys-gray">{formatCurrency(totalInterest, currencyCode, currencyLocale)}</h3>
            <p className="text-[10px] sm:text-xs text-gray-400 dark:text-davys-gray mt-2">
              {(totalInterest / (totalPayment - totalInterest || 1) * 100).toFixed(1)}% {translations?.ofPrincipalLabel || "of Principal"}
            </p>
          </div>
          <div className="p-2 sm:p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg text-orange-500">
            <Coins size={20} className="sm:w-6 sm:h-6" />
          </div>
        </div>
      </motion.div>

      {/* Tenure Info */}
      <motion.div 
        custom={2}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        key={`tenure-${finalTenure}`}
        className="bg-white dark:bg-silver-gray rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-davys-gray shadow-sm transition-colors duration-300"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-500 dark:text-davys-gray text-[10px] sm:text-sm font-medium mb-1">{translations?.durationLabel || "Duration"}</p>
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-davys-gray">{finalTenure} <span className="text-xs sm:text-sm font-normal text-gray-500 dark:text-davys-gray">{translations?.monthsLabel || "Months"}</span></h3>
            <div className="mt-2 space-y-1">
              {startDate && (
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-davys-gray">
                  {translations?.startLabel || "Start:"} <span className="font-medium">{new Date(startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                </p>
              )}
              {endDate && (
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-davys-gray">
                  {translations?.endLabel || "End:"} <span className="font-medium">{endDate}</span>
                </p>
              )}
            </div>
            {(tenureSaved > 0 || (partPaymentMonthsSaved && partPaymentMonthsSaved > 0)) ? (
               <div className="mt-3 space-y-1 bg-green-50/50 dark:bg-green-950/10 p-2 rounded-lg border border-green-100/50 dark:border-green-900/20">
                 {tenureSaved > 0 && (
                   <p className="text-[10px] sm:text-xs text-green-700 dark:text-green-400 font-semibold flex justify-between gap-2">
                     <span>{translations?.netTenureSavedLabel || "Net Tenure Saved:"}</span>
                     <span>{tenureSaved} {translations?.monthsLabel ? translations.monthsLabel.toLowerCase() : "months"}</span>
                   </p>
                 )}
                 {partPaymentMonthsSaved !== undefined && partPaymentMonthsSaved > 0 && (
                   <p className="text-[10px] sm:text-xs text-indigo-700 dark:text-indigo-400 font-semibold flex justify-between gap-2 border-t border-green-100/30 dark:border-green-900/10 pt-1">
                     <span>{translations?.savedByPartPaymentsLabel || "Saved by Part-Payments:"}</span>
                     <span>{partPaymentMonthsSaved} {partPaymentMonthsSaved === 1 ? (translations?.monthsLabel ? translations.monthsLabel.toLowerCase() : "month") : (translations?.monthsLabel ? translations.monthsLabel.toLowerCase() : "months")}</span>
                   </p>
                 )}
               </div>
            ) : (
               <p className="text-[10px] sm:text-xs text-gray-400 dark:text-davys-gray mt-2">{translations?.fullTenureLabel || "Full tenure"}</p>
            )}
          </div>
          <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg text-blue-500">
            <CalendarClock size={20} className="sm:w-6 sm:h-6" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
