import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitCompare, 
  ArrowLeftRight, 
  RotateCcw, 
  Trash2, 
  Check, 
  TrendingDown, 
  TrendingUp, 
  Sparkles, 
  Clock, 
  ShieldAlert,
  Save,
  HelpCircle
} from 'lucide-react';
import { Button } from './ui/Button';
import { LoanInput, LoanEvent, CalculationResult, ComparisonSnapshot } from '../types';
import { formatCurrency } from '../utils/calculations';
import { AppTranslations } from '../utils/translations';

interface LoanCompareDashboardProps {
  currentInputs: LoanInput;
  currentEvents: LoanEvent[];
  currentResult: CalculationResult;
  currentSavedMonths: number;
  currencySymbol: string;
  currencyCode: string;
  currencyLocale: string;
  onRestoreSnapshot: (inputs: LoanInput, events: LoanEvent[]) => void;
  onSwapSnapshot: (inputs: LoanInput, events: LoanEvent[]) => void;
  translations?: AppTranslations;
  snapshot?: ComparisonSnapshot | null;
  onSnapshotChange?: (snapshot: ComparisonSnapshot | null) => void;
}

export const LoanCompareDashboard: React.FC<LoanCompareDashboardProps> = ({
  currentInputs,
  currentEvents,
  currentResult,
  currentSavedMonths,
  currencySymbol,
  currencyCode,
  currencyLocale,
  onRestoreSnapshot,
  onSwapSnapshot,
  translations,
  snapshot: propSnapshot,
  onSnapshotChange,
}) => {
  const [localSnapshot, setLocalSnapshot] = useState<ComparisonSnapshot | null>(null);
  const snapshot = propSnapshot !== undefined ? propSnapshot : localSnapshot;
  const setSnapshot = (snap: ComparisonSnapshot | null) => {
    if (onSnapshotChange) {
      onSnapshotChange(snap);
    } else {
      setLocalSnapshot(snap);
    }
  };

  const [snapshotName, setSnapshotName] = useState<string>('');
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  const captureSnapshot = () => {
    const defaultName = `${translations?.compareBaselineLabel || "Baseline"} (${formatCurrency(currentInputs.principal, currencyCode, currencyLocale)} @ ${currentInputs.annualRate}%)`;
    
    setSnapshot({
      id: Math.random().toString(36).substring(2, 9),
      name: defaultName,
      inputs: JSON.parse(JSON.stringify(currentInputs)),
      events: JSON.parse(JSON.stringify(currentEvents)),
      result: JSON.parse(JSON.stringify(currentResult)),
      partPaymentMonthsSaved: currentSavedMonths,
    });
    setSnapshotName(defaultName);
    setIsEditingName(false);
    triggerNotification(translations?.compareToastSaved || 'Snapshot saved! Tweak current inputs to compare side-by-side.');
  };

  const triggerNotification = (message: string) => {
    setShowNotification(message);
    setTimeout(() => {
      setShowNotification(null);
    }, 4000);
  };

  const handleUpdateName = () => {
    if (snapshot && snapshotName.trim()) {
      setSnapshot({
        ...snapshot,
        name: snapshotName.trim()
      });
      setIsEditingName(false);
      triggerNotification(translations?.compareToastNameUpdated || 'Snapshot name updated!');
    }
  };

  const clearSnapshot = () => {
    setSnapshot(null);
    setIsEditingName(false);
    triggerNotification(translations?.compareToastCleared || 'Snapshot cleared.');
  };

  const overwriteSnapshot = () => {
    if (!snapshot) return;
    captureSnapshot();
  };

  const handleRestore = () => {
    if (!snapshot) return;
    onRestoreSnapshot(snapshot.inputs, snapshot.events);
    triggerNotification(translations?.compareToastRestored || 'Restored to saved snapshot inputs.');
  };

  const handleSwap = () => {
    if (!snapshot) return;
    onSwapSnapshot(snapshot.inputs, snapshot.events);
    
    // Swap the state directly in local snapshot
    setSnapshot({
      ...snapshot,
      inputs: JSON.parse(JSON.stringify(currentInputs)),
      events: JSON.parse(JSON.stringify(currentEvents)),
      result: JSON.parse(JSON.stringify(currentResult)),
      partPaymentMonthsSaved: currentSavedMonths,
    });
    setSnapshotName(snapshot.name);
    triggerNotification(translations?.compareToastSwapped || 'Swapped active inputs with snapshot.');
  };

  const formatDelta = (activeVal: number, snapVal: number, formatType: 'currency' | 'percent' | 'months') => {
    const diff = activeVal - snapVal;
    if (Math.abs(diff) < 0.01) {
      return { text: 'No difference', color: 'text-gray-500 dark:text-silver-gray', icon: null, isPositive: null };
    }

    const isFavorableLower = ['interest', 'payment', 'emi', 'tenure'].some(word => formatType !== 'percent'); // For loan calculations, lower is usually better!
    // Except for direct income/savings metrics.
    const isWorse = diff > 0; // If active is larger, and lower is better: active is worse
    const isFavorable = !isWorse;

    let formattedDiff = '';
    if (formatType === 'currency') {
      formattedDiff = `${diff < 0 ? '-' : '+'}${formatCurrency(Math.abs(diff), currencyCode, currencyLocale)}`;
    } else if (formatType === 'percent') {
      formattedDiff = `${diff < 0 ? '-' : '+'}${Math.abs(diff).toFixed(2)}%`;
    } else {
      const yrs = Math.floor(Math.abs(diff) / 12);
      const mths = Math.abs(diff) % 12;
      const yrText = yrs > 0 ? `${yrs}y ` : '';
      const mthText = mths > 0 ? `${mths}m` : '';
      formattedDiff = `${diff < 0 ? '-' : '+'}${yrText}${mthText}`;
    }

    if (isFavorable) {
      return {
        text: `${formattedDiff} (${formatType === 'months' ? 'Shorter' : 'Saved'})`,
        color: 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded text-xs',
        icon: <TrendingDown size={14} className="text-emerald-500" />,
        isPositive: true
      };
    } else {
      return {
        text: `${formattedDiff} (${formatType === 'months' ? 'Longer' : 'Extra Cost'})`,
        color: 'text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded text-xs',
        icon: <TrendingUp size={14} className="text-red-500" />,
        isPositive: false
      };
    }
  };

  // Extract variables for snapshot vs active comparison
  const snapResult = snapshot?.result;
  const snapInputs = snapshot?.inputs;

  const compareMetrics = snapshot ? [
    {
      label: translations?.loanAmountLabel || 'Loan Principal',
      snapshotStr: formatCurrency(snapInputs?.principal || 0, currencyCode, currencyLocale),
      activeStr: formatCurrency(currentInputs.principal, currencyCode, currencyLocale),
      delta: formatDelta(currentInputs.principal, snapInputs?.principal || 0, 'currency')
    },
    {
      label: translations?.interestRateLabel || 'Interest Rate P.A.',
      snapshotStr: `${snapInputs?.annualRate || 0}%`,
      activeStr: `${currentInputs.annualRate}%`,
      delta: formatDelta(currentInputs.annualRate, snapInputs?.annualRate || 0, 'percent')
    },
    {
      label: translations?.tenureMonthsLabel || 'Target Tenure',
      snapshotStr: `${snapInputs?.tenureMonths || 0} ${translations?.monthsLabel ? translations.monthsLabel.toLowerCase() : "months" }`,
      activeStr: `${currentInputs.tenureMonths} ${translations?.monthsLabel ? translations.monthsLabel.toLowerCase() : "months" }`,
      delta: formatDelta(currentInputs.tenureMonths, snapInputs?.tenureMonths || 0, 'months')
    },
    {
      label: translations?.currentEMILabel || 'Initial Monthly EMI',
      snapshotStr: formatCurrency(snapResult?.schedule[0]?.emi || 0, currencyCode, currencyLocale),
      activeStr: formatCurrency(currentResult.schedule[0]?.emi || 0, currencyCode, currencyLocale),
      delta: formatDelta(currentResult.schedule[0]?.emi || 0, snapResult?.schedule[0]?.emi || 0, 'currency')
    },
    {
      label: translations?.durationLabel || 'Actual Tenure (with payments)',
      snapshotStr: `${snapResult?.finalTenure || 0} ${translations?.monthsLabel ? translations.monthsLabel.toLowerCase() : "months" }`,
      activeStr: `${currentResult.finalTenure} ${translations?.monthsLabel ? translations.monthsLabel.toLowerCase() : "months" }`,
      delta: formatDelta(currentResult.finalTenure, snapResult?.finalTenure || 0, 'months')
    },
    {
      label: translations?.totalInterestLabel || 'Total Interest Paid',
      snapshotStr: formatCurrency(snapResult?.totalInterest || 0, currencyCode, currencyLocale),
      activeStr: formatCurrency(currentResult.totalInterest, currencyCode, currencyLocale),
      delta: formatDelta(currentResult.totalInterest, snapResult?.totalInterest || 0, 'currency')
    },
    {
      label: translations?.totalOutgoingsLabel || 'Total Outgoings',
      snapshotStr: formatCurrency(snapResult?.totalPayment || 0, currencyCode, currencyLocale),
      activeStr: formatCurrency(currentResult.totalPayment, currencyCode, currencyLocale),
      delta: formatDelta(currentResult.totalPayment, snapResult?.totalPayment || 0, 'currency')
    },
    {
      label: translations?.netTenureSavedLabel || 'Prepay Tenure Saved',
      snapshotStr: `${snapshot.partPaymentMonthsSaved} ${translations?.monthsLabel ? translations.monthsLabel.toLowerCase() : "months" }`,
      activeStr: `${currentSavedMonths} ${translations?.monthsLabel ? translations.monthsLabel.toLowerCase() : "months" }`,
      // For months saved, HIGHER is better, so swap the arguments to delta calculation
      delta: formatDelta(snapshot.partPaymentMonthsSaved, currentSavedMonths, 'months') // This shows delta
    }
  ] : [];

  return (
    <div id="compare-dashboard-section" className="bg-white dark:bg-silver-gray rounded-xl shadow-sm border border-gray-100 dark:border-davys-gray/60 p-4 sm:p-6 mb-6 transition-all duration-300 no-print">
      
      {/* Alert Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-2 bg-indigo-50 dark:bg-zinc-800 text-indigo-700 dark:text-indigo-300 text-xs text-center border border-indigo-100 dark:border-zinc-700 font-medium rounded-lg flex items-center justify-center gap-1.5"
          >
            <Check size={14} className="text-indigo-500" />
            <span>{showNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {!snapshot ? (
        // Snapshot onboarding card
        <div className="text-center py-4 flex flex-col items-center">
          <div className="bg-gradient-to-tr from-indigo-50 to-indigo-100/60 dark:from-zinc-800 dark:to-zinc-800/40 p-3 rounded-full text-primary dark:text-indigo-400 mb-3">
            <GitCompare size={24} className="animate-pulse" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{translations?.compareTitle || "Active Scenario Comparator"}</h2>
          <p className="max-w-md text-xs text-gray-500 dark:text-silver-gray leading-normal mt-1 mb-5">
            {translations?.compareSubtitle || "Want to test a different interest rate, pre-payments, or tenure side-by-side? Store your current configuration and easily evaluate differences in real-time."}
          </p>
          <Button
            onClick={captureSnapshot}
            variant="outline"
            icon={<Save size={14} className="text-primary dark:text-indigo-400" />}
            className="font-bold text-xs h-9 text-primary border-primary/20 hover:bg-indigo-50/50 dark:border-indigo-400/20"
          >
            {translations?.onboardingBaselineBtn || "Snap Current as Baseline Case"}
          </Button>
        </div>
      ) : (
        // Active Comparison Mode Dashboard
        <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 dark:border-davys-gray/40 pb-4 mb-4 gap-3">
            <div className="flex-1">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-primary dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-zinc-855 px-2 py-0.5 rounded-full mb-1">
                <Sparkles size={10} />
                {translations?.monthText ? (translations.appTitle === "स्मार्ट ईएमआई प्लानर" ? "तुलना सक्रिय" : "Comparison Engine Active") : "Comparison Engine Active"}
              </span>
              
              {isEditingName ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={snapshotName}
                    onChange={(e) => setSnapshotName(e.target.value)}
                    className="bg-white dark:bg-smoke-gray border border-gray-300 dark:border-davys-gray rounded-lg px-2.5 py-1 text-sm text-gray-900 dark:text-white font-bold focus:outline-none focus:ring-1 focus:ring-primary h-8 max-w-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdateName();
                    }}
                  />
                  <Button size="sm" variant="secondary" className="h-8 font-bold" onClick={handleUpdateName}>
                    {translations?.monthText ? (translations.appTitle === "स्मार्ट ईएमआई प्लानर" ? "नाम बदलें" : "Rename") : "Rename"}
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 font-bold" onClick={() => setIsEditingName(false)}>
                    {translations?.resetConfirmCancel || "Cancel"}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-0.5">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    {translations?.compareBaselineLabel || "Baseline:"} <span className="text-indigo-600 dark:text-indigo-400 underline decoration-indigo-400/40 decoration-dashed underline-offset-4 cursor-pointer" onClick={() => { setSnapshotName(snapshot.name); setIsEditingName(true); }}>{snapshot.name}</span>
                  </h3>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSwap}
                icon={<ArrowLeftRight size={14} />}
                title="Swaps active configuration and saved snapshot setup side-by-side"
                className="text-[11px] font-bold h-8 flex-1 sm:flex-initial"
              >
                {translations?.compareBtnSwap || "Swap Plans"}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRestore}
                icon={<RotateCcw size={14} />}
                title="Restore all loan values back to this saved baseline snapshot"
                className="text-[11px] font-bold h-8 flex-1 sm:flex-initial"
              >
                {translations?.compareBtnRestore || "Restore"}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={overwriteSnapshot}
                icon={<Save size={14} />}
                title="Overwrite the saved snapshot with current configurations"
                className="text-[11px] font-bold h-8 flex-1 sm:flex-initial text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/20"
              >
                {translations?.compareBtnOverwrite || "Overwrite"}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearSnapshot}
                icon={<Trash2 size={14} />}
                title="Clear snapshot"
                className="text-[11px] font-bold h-8 py-0 bg-transparent text-red-500 hover:text-red-600 border-red-100 dark:border-red-950/20"
              >
                {translations?.compareBtnClear || "Clear"}
              </Button>
            </div>
          </div>

          {/* Quick Real-time Outcome Card */}
          {(() => {
            const outgoingsDiff = currentResult.totalPayment - (snapResult?.totalPayment || 0);
            const interestDiff = currentResult.totalInterest - (snapResult?.totalInterest || 0);
            const timeDiff = currentResult.finalTenure - (snapResult?.finalTenure || 0);

            let alertStyle = '';
            let sentence = '';
            if (outgoingsDiff < -1) {
              alertStyle = 'bg-emerald-50 dark:bg-emerald-950/15 border-emerald-150 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-350';
              sentence = translations?.compareOutcomeCheaper 
                ? `${translations.compareOutcomeCheaper} ${formatCurrency(Math.abs(outgoingsDiff), currencyCode, currencyLocale)}`
                : `✓ This active scenario is overall CHEAPER! You save ${formatCurrency(Math.abs(outgoingsDiff), currencyCode, currencyLocale)} in total cost, reduces interest by ${formatCurrency(Math.abs(interestDiff), currencyCode, currencyLocale)}, and closes your loan ${timeDiff < 0 ? `${Math.abs(timeDiff)} months faster` : 'at the same time'}.`;
            } else if (outgoingsDiff > 1) {
              alertStyle = 'bg-red-50 dark:bg-red-950/15 border-red-150 dark:border-red-900/30 text-red-800 dark:text-red-350';
              sentence = translations?.compareOutcomeExpensive 
                ? `${translations.compareOutcomeExpensive} ${formatCurrency(Math.abs(outgoingsDiff), currencyCode, currencyLocale)}`
                : `⚠ Active scenario is MORE EXPENSIVE. Adding this configuration results in ${formatCurrency(Math.abs(outgoingsDiff), currencyCode, currencyLocale)} extra cost (+${formatCurrency(Math.abs(interestDiff), currencyCode, currencyLocale)} supplementary interest) compared to the saved Plan.`;
            } else {
              alertStyle = 'bg-gray-50 dark:bg-zinc-800/60 border-gray-150 dark:border-zinc-700 text-gray-800 dark:text-silver-gray';
              sentence = translations?.compareOutcomeEqual || `The current active scenario matches the saved snapshot baseline perfectly. Adjust any parameters on the left to see instant comparative deltas!`;
            }

            return (
              <div className={`p-3 sm:p-4 rounded-xl border text-xs leading-normal mb-5 flex gap-3 ${alertStyle}`}>
                <HelpCircle size={18} className="flex-shrink-0 mt-0.5 opacity-80" />
                <span className="font-medium font-sans">{sentence}</span>
              </div>
            );
          })()}

          {/* Side-by-Side Comparison Grid Table */}
          <div className="overflow-x-auto border border-gray-150 dark:border-davys-gray/40 rounded-xl">
            <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-smoke-gray/45 border-b border-gray-150 dark:border-davys-gray/40 text-gray-500 dark:text-silver-gray font-bold text-[10px] sm:text-xs uppercase tracking-wider">
                  <th className="px-3 sm:px-4 py-2.5">{translations?.compareTableMetric || "Evaluation Metric"}</th>
                  <th className="px-3 sm:px-4 py-2.5 text-right font-bold text-indigo-600 dark:text-indigo-400">{translations?.compareTableSaved || "Saved Snapshot"}</th>
                  <th className="px-3 sm:px-4 py-2.5 text-right font-bold text-gray-900 dark:text-white">{translations?.compareTableActive || "Active Scenario"}</th>
                  <th className="px-3 sm:px-4 py-2.5 text-right">{translations?.compareTableDelta || "Instant Gain / Loss Delta"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 dark:divide-davys-gray/40">
                {compareMetrics.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-davys-gray/5 transition-colors">
                    <td className="px-3 sm:px-4 py-3 font-semibold text-gray-700 dark:text-silver-gray">
                      {row.label}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-right text-indigo-650 dark:text-indigo-350 font-medium">
                      {row.snapshotStr}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-right text-gray-900 dark:text-davys-gray font-bold">
                      {row.activeStr}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-right font-medium">
                      <div className="inline-flex items-center gap-1 justify-end w-full">
                        {row.delta.icon}
                        <span className={row.delta.color}>{row.delta.text}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
};
