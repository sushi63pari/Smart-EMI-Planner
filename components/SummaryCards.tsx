import React from 'react';
import { formatCurrency } from '../utils/calculations';
import { CalendarClock, Coins, Wallet, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface SummaryCardsProps {
  totalInterest: number;
  totalPayment: number;
  monthlyEMI: number;
  finalTenure: number;
  originalTenure: number;
  startDate?: string;
  endDate?: string;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ 
  totalInterest, 
  totalPayment, 
  monthlyEMI,
  finalTenure,
  originalTenure,
  startDate,
  endDate
}) => {
  const tenureSaved = originalTenure - finalTenure;
  const principal = Math.max(0, totalPayment - totalInterest);
  const principalPct = totalPayment > 0 ? (principal / totalPayment * 100).toFixed(1) : '0';
  const interestPct = totalPayment > 0 ? (totalInterest / totalPayment * 100).toFixed(1) : '0';
  const costPerHundred = principal > 0 ? ((totalInterest / principal) * 100).toFixed(0) : '0';

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
        key={`emi-${monthlyEMI}`}
        className="bg-gradient-to-br from-primary to-indigo-700 rounded-xl p-4 sm:p-6 text-white shadow-lg shadow-indigo-200"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-indigo-100 text-[10px] sm:text-sm font-medium mb-1">Current EMI</p>
            <h3 className="text-xl sm:text-3xl font-bold tracking-tight">{formatCurrency(monthlyEMI)}</h3>
            <p className="text-[10px] sm:text-xs text-indigo-200 mt-2 opacity-80">Monthly Instalment</p>
          </div>
          <div className="p-2 sm:p-3 bg-white/10 rounded-lg backdrop-blur-sm">
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
        key={`interest-${totalInterest}`}
        className="bg-white dark:bg-silver-gray rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-davys-gray shadow-sm transition-colors duration-300"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1 relative">
              <span className="text-gray-500 dark:text-davys-gray text-[10px] sm:text-sm font-medium">Total Interest</span>
              <div className="relative group/interest inline-block">
                <span className="cursor-help text-gray-400 hover:text-orange-500 dark:text-davys-gray/50 dark:hover:text-amber-500 transition-colors">
                  <Info size={14} />
                </span>
                {/* Tooltip Popup */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 p-3 bg-gray-900 dark:bg-zinc-900 border border-gray-850 dark:border-zinc-850 rounded-xl shadow-xl opacity-0 scale-95 group-hover/interest:opacity-100 group-hover/interest:scale-100 transition-all duration-200 pointer-events-none z-30 font-sans text-white text-left">
                  <div className="text-[12px] font-bold text-orange-400 border-b border-gray-800 dark:border-zinc-800 pb-1.5 mb-2 flex items-center gap-1">
                    <Coins size={12} />
                    <span>Real cost of your loan</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] font-medium text-gray-200">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Principal Paid:</span>
                      <span>{formatCurrency(principal)} <span className="text-gray-400 text-[10px]">({principalPct}%)</span></span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Interest Paid:</span>
                      <span className="text-orange-400">{formatCurrency(totalInterest)} <span className="text-gray-400 text-[10px]">({interestPct}%)</span></span>
                    </div>
                    <div className="border-t border-gray-850 dark:border-zinc-800 pt-1.5 mt-1.5 flex justify-between font-bold text-gray-100">
                      <span>Total Outgoings:</span>
                      <span>{formatCurrency(totalPayment)}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 leading-relaxed pt-1.5 border-t border-gray-850 dark:border-zinc-800">
                      For every <span className="text-white font-semibold">₹100</span> of principal repaid, you pay supplementary interest of <span className="text-orange-400 font-semibold">₹{costPerHundred}</span>.
                    </div>
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-zinc-900"></div>
                </div>
              </div>
            </div>
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-davys-gray">{formatCurrency(totalInterest)}</h3>
            <p className="text-[10px] sm:text-xs text-gray-400 dark:text-davys-gray mt-2">
              {(totalInterest / (totalPayment - totalInterest || 1) * 100).toFixed(1)}% of Principal
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
            <p className="text-gray-500 dark:text-davys-gray text-[10px] sm:text-sm font-medium mb-1">Duration</p>
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-davys-gray">{finalTenure} <span className="text-xs sm:text-sm font-normal text-gray-500 dark:text-davys-gray">Months</span></h3>
            <div className="mt-2 space-y-1">
              {startDate && (
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-davys-gray">
                  Start: <span className="font-medium">{new Date(startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                </p>
              )}
              {endDate && (
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-davys-gray">
                  End: <span className="font-medium">{endDate}</span>
                </p>
              )}
            </div>
            {tenureSaved > 0 ? (
               <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-700 font-semibold mt-2">Saved {tenureSaved} months!</p>
            ) : (
               <p className="text-[10px] sm:text-xs text-gray-400 dark:text-davys-gray mt-2">Full tenure</p>
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
