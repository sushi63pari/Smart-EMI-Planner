import React from 'react';
import { ScheduleItem } from '../types';
import { formatCurrency } from '../utils/calculations';

interface AmortizationTableProps {
  schedule: ScheduleItem[];
}

export const AmortizationTable: React.FC<AmortizationTableProps> = ({ schedule }) => {
  const [showDates, setShowDates] = React.useState(true);

  return (
    <div className="bg-white dark:bg-silver-gray rounded-xl shadow-sm border border-gray-100 dark:border-davys-gray overflow-hidden transition-colors duration-300">
      <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-davys-gray flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-davys-gray">Amortization Schedule</h3>
        <button 
          onClick={() => setShowDates(!showDates)}
          className="text-sm font-medium text-primary hover:underline"
        >
          {showDates ? 'Show Month #' : 'Show Dates'}
        </button>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-davys-gray">
          <thead className="bg-gray-50 dark:bg-davys-gray/10">
            <tr>
              <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[9px] sm:text-xs font-medium text-gray-500 dark:text-davys-gray uppercase tracking-wider">
                {showDates ? 'Date' : 'Month'}
              </th>
              <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-right text-[9px] sm:text-xs font-medium text-gray-500 dark:text-davys-gray uppercase tracking-wider">Opening</th>
              <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-right text-[9px] sm:text-xs font-medium text-gray-500 dark:text-davys-gray uppercase tracking-wider">EMI</th>
              <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-right text-[9px] sm:text-xs font-medium text-gray-500 dark:text-davys-gray uppercase tracking-wider">Principal</th>
              <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-right text-[9px] sm:text-xs font-medium text-gray-500 dark:text-davys-gray uppercase tracking-wider">Interest</th>
              <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-right text-[9px] sm:text-xs font-medium text-gray-500 dark:text-davys-gray uppercase tracking-wider">Extra Paid</th>
              <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-right text-[9px] sm:text-xs font-medium text-gray-500 dark:text-davys-gray uppercase tracking-wider">Closing</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-silver-gray divide-y divide-gray-200 dark:divide-davys-gray">
            {schedule.map((row) => (
              <tr key={row.month} className="hover:bg-gray-50 dark:hover:bg-davys-gray/5 transition-colors">
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-[10px] sm:text-sm font-medium text-gray-900 dark:text-davys-gray">
                  {showDates ? row.date : row.month}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-[10px] sm:text-sm text-right text-gray-500 dark:text-davys-gray">{formatCurrency(row.openingBalance)}</td>
                <td className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-[10px] sm:text-sm text-right font-medium transition-colors ${row.emiChanged ? 'text-indigo-600 dark:text-indigo-400' : 'text-primary dark:text-davys-gray'}`}>
                  {formatCurrency(row.emi)}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-[10px] sm:text-sm text-right text-green-600 dark:text-green-700">{formatCurrency(row.principalComponent)}</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-[10px] sm:text-sm text-right text-orange-500 dark:text-orange-700">{formatCurrency(row.interestComponent)}</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-[10px] sm:text-sm text-right text-gray-500 dark:text-davys-gray">
                  {row.prepayment > 0 ? (
                    <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-xs font-medium bg-green-100 dark:bg-green-900/10 text-green-800 dark:text-green-700">
                      +{formatCurrency(row.prepayment)}
                    </span>
                  ) : '-'}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-[10px] sm:text-sm text-right text-gray-900 dark:text-davys-gray font-medium">{formatCurrency(row.closingBalance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
