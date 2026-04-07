import React from 'react';
import { formatCurrency } from '../utils/calculations';
import { CalendarClock, Coins, Wallet } from 'lucide-react';
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
            <p className="text-gray-500 dark:text-davys-gray text-[10px] sm:text-sm font-medium mb-1">Total Interest</p>
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
