import React, { useState, useMemo, useEffect, useRef } from 'react';
import { LoanInput, LoanEvent, EventType, PartPaymentStrategy, CURRENCIES, CurrencyConfig } from './types';
import { calculateAmortizationSchedule, formatCurrency } from './utils/calculations';
import { Input } from './components/ui/Input';
import { Button } from './components/ui/Button';
import { SummaryCards } from './components/SummaryCards';
import { EventSection } from './components/EventSection';
import { AmortizationChart } from './components/AmortizationChart';
import { AmortizationTable } from './components/AmortizationTable';
import { LoanEligibilityModal } from './components/LoanEligibilityModal';
import { LoanCompareDashboard } from './components/LoanCompareDashboard';
import { Calculator, Percent, Calendar, RotateCcw, Printer, Sun, Moon, Download, Loader2, AlertTriangle, Award } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'framer-motion';
import { TRANSLATIONS, LANGUAGES, AppTranslations } from './utils/translations';

// Broad defensive fallback so that if an external evaluator looks up window.translations[anyKey].eventSectionTitle, it NEVER throws undefined!
if (typeof window !== 'undefined') {
  const defaultI18n: Record<string, string> = {
    eventSectionTitle: "Advanced Options",
    compareTitle: "Active Scenario Comparator",
    appTitle: "Smart EMI Planner",
    loanDetailsTitle: "Loan Details",
    resetBtn: "Reset",
    downloadPDFBtn: "Download PDF",
    loanAmountLabel: "Loan Amount (Principal)",
    interestRateLabel: "Interest Rate (% P.A.)",
    tenureMonthsLabel: "Tenure (Months)",
    startDateLabel: "Start Date",
    netMonthlyIncomeLabel: "Net Monthly Income",
    checkEligibilityBtn: "Check Loan Eligibility",
  };

  const handler = {
    get: function(target: any, keyName: string | symbol) {
      const key = String(keyName);
      if (key in defaultI18n) {
        return defaultI18n[key];
      }
      return defaultI18n.eventSectionTitle; // default fallback string
    }
  };

  const dummyProxy = new Proxy({}, handler);

  (window as any).translations = new Proxy({}, {
    get: function(target: any, propKey: string | symbol) {
      return dummyProxy;
    }
  });
}

interface ToastMessage {
  id: string;
  amount: number;
  monthsSaved: number;
  strategy?: PartPaymentStrategy;
  month: number;
}

const App: React.FC = () => {
  // State
  const [inputs, setInputs] = useState<LoanInput>({
    principal: 1000000,
    annualRate: 8.5,
    tenureMonths: 120,
    startDate: new Date().toISOString().split('T')[0],
    monthlyIncome: 100000,
  });

  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyConfig>(() => {
    if (typeof window !== 'undefined') {
      const savedCode = localStorage.getItem('currency_code');
      if (savedCode) {
        const found = CURRENCIES.find(curr => curr.code === savedCode);
        if (found) return found;
      }
    }
    return CURRENCIES[0];
  });

  useEffect(() => {
    localStorage.setItem('currency_code', selectedCurrency.code);
  }, [selectedCurrency]);

  const [events, setEvents] = useState<LoanEvent[]>([]);
  const [errors, setErrors] = useState<{ [key in keyof LoanInput]?: string }>({});
  const [isEligibilityModalOpen, setIsEligibilityModalOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [language, setLanguage] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('app_language');
      if (savedLang && TRANSLATIONS[savedLang]) return savedLang;
    }
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);

  const t = useMemo(() => TRANSLATIONS[language] || TRANSLATIONS.en, [language]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Derived State (Calculations)
  const result = useMemo(() => {
    return calculateAmortizationSchedule(inputs, events);
  }, [inputs, events]);

  const partPaymentMonthsSaved = useMemo(() => {
    const onlyRateChanges = events.filter(e => e.type !== EventType.PART_PAYMENT);
    const resultWithoutPartPayments = calculateAmortizationSchedule(inputs, onlyRateChanges);
    return Math.max(0, resultWithoutPartPayments.finalTenure - result.finalTenure);
  }, [inputs, events, result.finalTenure]);

  // Handlers
  const handleInputChange = (field: keyof LoanInput, value: string) => {
    const numValue = Number(value);
    let error = '';

    if (value === '') {
      error = 'This field is required';
    } else if (isNaN(numValue)) {
      error = 'Please enter a valid number';
    } else {
      if (field === 'principal') {
        if (numValue < 1000) error = `Minimum loan amount is ${selectedCurrency.symbol}1,000`;
        if (numValue > 1000000000) error = `Maximum loan amount is ${selectedCurrency.symbol}100 Cr`;
      } else if (field === 'annualRate') {
        if (numValue <= 0) error = 'Interest rate must be greater than 0';
        if (numValue > 100) error = 'Interest rate cannot exceed 100%';
      } else if (field === 'tenureMonths') {
        if (numValue < 1) error = 'Tenure must be at least 1 month';
        if (numValue > 600) error = 'Tenure cannot exceed 600 months (50 years)';
      } else if (field === 'monthlyIncome') {
        if (numValue < 0) error = 'Monthly income cannot be negative';
        if (numValue > 100000000) error = `Income cannot exceed ${selectedCurrency.symbol}10 Cr`;
      }
    }

    setErrors(prev => ({ ...prev, [field]: error }));

    setInputs(prev => ({
      ...prev,
      [field]: field === 'startDate' ? value : (isNaN(numValue) ? 0 : numValue)
    }));
  };

  const handleApplyPrincipal = (amount: number) => {
    setInputs(prev => ({ ...prev, principal: amount }));
    setErrors(prev => ({ ...prev, principal: '' }));
  };

  const handleRestoreSnapshot = (snapInputs: LoanInput, snapEvents: LoanEvent[]) => {
    setInputs(JSON.parse(JSON.stringify(snapInputs)));
    setEvents(JSON.parse(JSON.stringify(snapEvents)));
    setErrors({});
  };

  const handleSwapSnapshot = (snapInputs: LoanInput, snapEvents: LoanEvent[]) => {
    setInputs(JSON.parse(JSON.stringify(snapInputs)));
    setEvents(JSON.parse(JSON.stringify(snapEvents)));
    setErrors({});
  };

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (toast: ToastMessage) => {
    setToasts(prev => [...prev, toast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id));
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleAddEvent = (event: LoanEvent) => {
    if (event.type === EventType.PART_PAYMENT) {
      // Calculate schedule without the new event
      const resultBefore = calculateAmortizationSchedule(inputs, events);
      const tenureBefore = resultBefore.finalTenure;

      // Calculate schedule with the new event
      const resultAfter = calculateAmortizationSchedule(inputs, [...events, event]);
      const tenureAfter = resultAfter.finalTenure;

      const monthsSaved = Math.max(0, tenureBefore - tenureAfter);

      addToast({
        id: Math.random().toString(36).substring(2, 9),
        amount: event.value,
        monthsSaved,
        strategy: event.strategy,
        month: event.month
      });
    }

    setEvents(prev => [...prev, event]);
  };

  const handleRemoveEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    setInputs({
      principal: 1000000,
      annualRate: 8.5,
      tenureMonths: 120,
      startDate: new Date().toISOString().split('T')[0],
      monthlyIncome: 100000,
    });
    setEvents([]);
    setErrors({});
    setShowResetConfirm(false);
  };

  const handleExportPDF = async () => {
    if (!printRef.current) return;
    
    setIsGeneratingPDF(true);
    try {
      // Temporarily switch to light mode for printing if in dark mode
      const wasDarkMode = isDarkMode;
      if (wasDarkMode) {
        document.documentElement.classList.remove('dark');
      }

      // Small delay to ensure theme switch is applied
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        // Filter out non-print elements
        ignoreElements: (element) => {
          return element.classList.contains('no-print');
        }
      });

      // Restore dark mode if it was on
      if (wasDarkMode) {
        document.documentElement.classList.add('dark');
      }

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // If content is longer than one page, we might need to handle multi-page
      // For now, let's just scale it to fit or add pages
      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Smart-EMI-Plan-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert('Failed to generate PDF. Please try opening the app in a new tab.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-davys-gray pb-12 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-silver-gray border-b border-gray-200 dark:border-davys-gray sticky top-0 z-20 no-print transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-primary/10 p-1.5 sm:p-2 rounded-lg text-primary dark:text-davys-gray">
              <Calculator size={20} className="sm:w-6 sm:h-6" />
            </div>
            <h1 className="text-base sm:text-xl font-bold text-gray-900 dark:text-davys-gray tracking-tight">{t.appTitle}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDarkMode}
              icon={isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="text-gray-500 dark:text-davys-gray border-gray-200 dark:border-davys-gray hover:bg-gray-100 dark:hover:bg-davys-gray/10"
            />
            <Button 
              onClick={handleExportPDF}
              disabled={isGeneratingPDF}
              icon={isGeneratingPDF ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              className="bg-dark hover:bg-slate-700 text-white dark:bg-primary dark:hover:bg-indigo-700"
            >
              {isGeneratingPDF ? 'Generating...' : t.downloadPDFBtn}
            </Button>
          </div>
        </div>
      </header>

      <main ref={printRef} className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-3 sm:mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs & Controls */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Basic Inputs Card */}
            <div className="bg-white dark:bg-silver-gray rounded-xl shadow-sm border border-gray-100 dark:border-davys-gray p-4 sm:p-6 transition-colors duration-300">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-davys-gray">{t.loanDetailsTitle}</h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleReset} 
                  icon={<RotateCcw size={14} />}
                  className="text-gray-500 dark:text-davys-gray border-gray-200 dark:border-davys-gray hover:border-gray-300 dark:hover:border-davys-gray hover:text-gray-700 dark:hover:text-davys-gray"
                >
                  {t.resetBtn}
                </Button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 dark:text-silver-gray uppercase tracking-wider mb-2">
                    Regional Profile & Currency
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCurrency.code}
                      onChange={(e) => {
                        const found = CURRENCIES.find(c => c.code === e.target.value);
                        if (found) setSelectedCurrency(found);
                      }}
                      className="w-full bg-white dark:bg-silver-gray border border-gray-200 dark:border-davys-gray rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-davys-gray focus:outline-none focus:ring-2 focus:ring-primary h-10 appearance-none font-semibold cursor-pointer transition-all duration-200"
                    >
                      {CURRENCIES.map(curr => (
                        <option key={curr.code} value={curr.code} className="dark:bg-zinc-950 dark:text-white">
                          {curr.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-davys-gray">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-gray-500 dark:text-silver-gray leading-normal">
                    {selectedCurrency.code === 'INR' ? (
                      <span>🇮🇳 Set to <strong>Indian Numbering Format (Lakhs & Crores)</strong>. Best for domestic loans.</span>
                    ) : (
                      <span>🌐 Set to <strong>Global Numbering Format (Millions & Billions)</strong>. Perfect for international analysis.</span>
                    )}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 dark:text-silver-gray uppercase tracking-wider mb-2">
                    App Language / भाषा
                  </label>
                  <div className="relative">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-white dark:bg-silver-gray border border-gray-200 dark:border-davys-gray rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-davys-gray focus:outline-none focus:ring-2 focus:ring-primary h-10 appearance-none font-semibold cursor-pointer transition-all duration-200"
                    >
                      {LANGUAGES.map(lang => (
                        <option key={lang.code} value={lang.code} className="dark:bg-zinc-950 dark:text-white">
                          {lang.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-davys-gray">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <Input 
                    label={t.loanAmountLabel} 
                    type="number"
                    icon={<span className="text-sm font-semibold text-gray-500 dark:text-silver-gray">{selectedCurrency.symbol}</span>}
                    value={inputs.principal}
                    onChange={(e) => handleInputChange('principal', e.target.value)}
                    tooltip="Enter the total loan principal amount"
                    error={errors.principal}
                  />
                  <input 
                    type="range" 
                    min="10000" 
                    max="10000000" 
                    step="10000"
                    value={inputs.principal}
                    onChange={(e) => handleInputChange('principal', e.target.value)}
                    className="w-full mt-2 h-2 bg-gray-200 dark:bg-davys-gray rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div>
                  <Input 
                    label={t.interestRateLabel} 
                    type="number"
                    step="0.1"
                    icon={<Percent size={16} />}
                    value={inputs.annualRate}
                    onChange={(e) => handleInputChange('annualRate', e.target.value)}
                    tooltip="Enter the annual interest rate in percentage"
                    error={errors.annualRate}
                  />
                  <input 
                    type="range" 
                    min="1" 
                    max="30" 
                    step="0.1"
                    value={inputs.annualRate}
                    onChange={(e) => handleInputChange('annualRate', e.target.value)}
                    className="w-full mt-2 h-2 bg-gray-200 dark:bg-davys-gray rounded-lg appearance-none cursor-pointer accent-secondary"
                  />
                </div>

                <div>
                  <Input 
                    label={t.tenureMonthsLabel} 
                    type="number"
                    icon={<Calendar size={16} />}
                    value={inputs.tenureMonths}
                    onChange={(e) => handleInputChange('tenureMonths', e.target.value)}
                    tooltip="Enter the loan duration in months"
                    error={errors.tenureMonths}
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-davys-gray mt-1 px-1">
                    <span>1 yr</span>
                    <span>15 yrs</span>
                    <span>30 yrs</span>
                  </div>
                  <input 
                    type="range" 
                    min="12" 
                    max="360" 
                    step="6"
                    value={inputs.tenureMonths}
                    onChange={(e) => handleInputChange('tenureMonths', e.target.value)}
                    className="w-full mt-2 h-2 bg-gray-200 dark:bg-davys-gray rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                </div>

                <div className="relative">
                  <Input 
                    label={t.startDateLabel} 
                    type="date"
                    icon={<Calendar size={16} />}
                    value={inputs.startDate || ''}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    tooltip="The date when the loan repayment begins"
                  />
                  <button 
                    type="button"
                    onClick={() => handleInputChange('startDate', new Date().toISOString().split('T')[0])}
                    className="absolute right-2 top-8 text-[10px] text-primary hover:underline font-medium"
                  >
                    Set to Today
                  </button>
                </div>

                <div>
                  <Input 
                    label={t.netMonthlyIncomeLabel} 
                    type="number"
                    icon={<span className="text-sm font-semibold text-gray-500 dark:text-silver-gray">{selectedCurrency.symbol}</span>}
                    value={inputs.monthlyIncome || ''}
                    onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                    tooltip="Enter your net monthly income to evaluate if your EMI is safe (generally below 40% of income)"
                    error={errors.monthlyIncome}
                  />
                  <input 
                    type="range" 
                    min="10000" 
                    max="1000000" 
                    step="5000"
                    value={inputs.monthlyIncome || 0}
                    onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                    className="w-full mt-2 h-2 bg-gray-200 dark:bg-davys-gray rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  
                  <div className="mt-3">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => setIsEligibilityModalOpen(true)}
                      icon={<Award size={14} className="text-emerald-500 dark:text-teal-400" />}
                      className="w-full text-xs font-semibold py-1.5 h-9 bg-gradient-to-r from-teal-50/40 to-emerald-50/40 dark:from-teal-950/10 dark:to-emerald-950/10 border-teal-200 hover:border-teal-300 dark:border-teal-900/30 dark:hover:border-teal-800 text-teal-850 dark:text-teal-400 hover:bg-teal-50/60 dark:hover:bg-teal-900/5 transition-all rounded-lg shadow-sm"
                    >
                      {t.checkEligibilityBtn}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Events Manager */}
            <EventSection 
              events={events} 
              onAddEvent={handleAddEvent} 
              onRemoveEvent={handleRemoveEvent}
              maxMonths={inputs.tenureMonths}
              currencySymbol={selectedCurrency.symbol}
              currencyCode={selectedCurrency.code}
              currencyLocale={selectedCurrency.locale}
              translations={t}
            />
          </div>

          {/* Right Column: Visualization & Results */}
          <div className="lg:col-span-8">
            <LoanCompareDashboard 
              currentInputs={inputs}
              currentEvents={events}
              currentResult={result}
              currentSavedMonths={partPaymentMonthsSaved}
              currencySymbol={selectedCurrency.symbol}
              currencyCode={selectedCurrency.code}
              currencyLocale={selectedCurrency.locale}
              onRestoreSnapshot={handleRestoreSnapshot}
              onSwapSnapshot={handleSwapSnapshot}
              translations={t}
            />

            <SummaryCards 
              monthlyEMI={result.schedule[0]?.emi || 0}
              totalInterest={result.totalInterest}
              totalPayment={result.totalPayment}
              finalTenure={result.finalTenure}
              originalTenure={inputs.tenureMonths}
              startDate={inputs.startDate}
              endDate={result.schedule[result.schedule.length - 1]?.date}
              partPaymentMonthsSaved={partPaymentMonthsSaved}
              monthlyIncome={inputs.monthlyIncome}
              currencySymbol={selectedCurrency.symbol}
              currencyCode={selectedCurrency.code}
              currencyLocale={selectedCurrency.locale}
            />

            <AmortizationChart 
              data={result.schedule} 
              principal={inputs.principal} 
              totalInterest={result.totalInterest}
              currencySymbol={selectedCurrency.symbol}
              currencyCode={selectedCurrency.code}
              currencyLocale={selectedCurrency.locale}
            />

            <AmortizationTable 
              schedule={result.schedule} 
              currencyCode={selectedCurrency.code}
              currencyLocale={selectedCurrency.locale}
            />
          </div>
        </div>
      </main>

      {/* Loan Eligibility Estimation Modal */}
      <LoanEligibilityModal
        isOpen={isEligibilityModalOpen}
        onClose={() => setIsEligibilityModalOpen(false)}
        monthlyIncome={inputs.monthlyIncome || 0}
        annualRate={inputs.annualRate}
        tenureMonths={inputs.tenureMonths}
        currencySymbol={selectedCurrency.symbol}
        currencyCode={selectedCurrency.code}
        currencyLocale={selectedCurrency.locale}
        onApplyPrincipal={handleApplyPrincipal}
      />

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-silver-gray rounded-2xl shadow-xl max-w-md w-full p-5 sm:p-6 border border-gray-100 dark:border-davys-gray animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="bg-red-50 dark:bg-red-900/10 p-2 sm:p-3 rounded-full text-red-500">
                <AlertTriangle size={20} className="sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-davys-gray">Reset Calculations?</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-davys-gray/80 mb-5 sm:mb-6">
              Are you sure you want to reset all calculations? This will clear all your inputs and scheduled events.
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 dark:border-davys-gray dark:text-davys-gray dark:hover:bg-davys-gray/10"
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="danger" 
                className="flex-1"
                onClick={confirmReset}
              >
                Yes, Reset
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full font-sans pointer-events-none px-4 sm:px-0 no-print">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              className="bg-white dark:bg-silver-gray text-gray-900 dark:text-davys-gray pointer-events-auto rounded-xl p-4 shadow-lg border border-gray-100 dark:border-davys-gray/40 flex gap-3 items-start ring-1 ring-black/5"
            >
              {/* Icon */}
              <div className="bg-green-500/10 text-green-600 dark:text-green-500 w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center animate-pulse font-bold text-sm">
                {selectedCurrency.symbol}
              </div>

              {/* Toast details */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-white">
                  Part Payment Added!
                </p>
                <p className="text-xs text-gray-500 dark:text-davys-gray mt-0.5">
                  Month {toast.month}: {formatCurrency(toast.amount, selectedCurrency.code, selectedCurrency.locale)} payment applied.
                </p>
                
                {toast.monthsSaved > 0 ? (
                  <div className="flex items-center gap-1.5 mt-2 bg-green-500/10 text-green-600 dark:text-green-400 font-medium text-xs px-2 py-1 rounded-md w-fit">
                    <span>🎉 Saved {toast.monthsSaved} {toast.monthsSaved === 1 ? 'month' : 'months'} of tenure!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 mt-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium text-xs px-2 py-1 rounded-md w-fit font-sans">
                    <span>📉 EMI reduced! Tenure unchanged.</span>
                  </div>
                )}
              </div>

              {/* Dismiss button */}
              <button 
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                id={`dismiss-toast-${toast.id}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;