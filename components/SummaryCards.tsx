import React from 'react';
import { formatCurrency } from '../utils/calculations';
import { CalendarClock, Coins, Wallet } from 'lucide-react';

interface SummaryCardsProps {
  totalInterest: number;
  totalPayment: number;
  monthlyEMI: number;
  finalTenure: number;
  originalTenure: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ 
  totalInterest, 
  totalPayment, 
  monthlyEMI,
  finalTenure,
  originalTenure
}) => {
  const tenureSaved = originalTenure - finalTenure;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Monthly EMI */}
      <div className="bg-gradient-to-br from-primary to-indigo-700 rounded-xl p-6 text-white shadow-lg shadow-indigo-200">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-indigo-100 text-sm font-medium mb-1">Current EMI</p>
            <h3 className="text-3xl font-bold tracking-tight">{formatCurrency(monthlyEMI)}</h3>
            <p className="text-xs text-indigo-200 mt-2 opacity-80">Monthly Instalment</p>
          </div>
          <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
            <Wallet size={24} className="text-white" />
          </div>
        </div>
      </div>

      {/* Total Interest */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Total Interest</p>
            <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(totalInterest)}</h3>
            <p className="text-xs text-gray-400 mt-2">
              {(totalInterest / (totalPayment - totalInterest || 1) * 100).toFixed(1)}% of Principal
            </p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg text-orange-500">
            <Coins size={24} />
          </div>
        </div>
      </div>

      {/* Tenure Info */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Duration</p>
            <h3 className="text-2xl font-bold text-gray-900">{finalTenure} <span className="text-sm font-normal text-gray-500">Months</span></h3>
            {tenureSaved > 0 ? (
               <p className="text-xs text-green-600 font-semibold mt-2">Saved {tenureSaved} months!</p>
            ) : (
               <p className="text-xs text-gray-400 mt-2">Full tenure</p>
            )}
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-blue-500">
            <CalendarClock size={24} />
          </div>
        </div>
      </div>
    </div>
  );
};