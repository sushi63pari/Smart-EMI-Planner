import React, { useState, useMemo, useEffect, useRef } from 'react';
import { LoanInput, LoanEvent } from './types';
import { calculateAmortizationSchedule } from './utils/calculations';
import { Input } from './components/ui/Input';
import { Button } from './components/ui/Button';
import { SummaryCards } from './components/SummaryCards';
import { EventSection } from './components/EventSection';
import { AmortizationChart } from './components/AmortizationChart';
import { AmortizationTable } from './components/AmortizationTable';
import { Calculator, IndianRupee, Percent, Calendar, RotateCcw, Printer, Sun, Moon, Download, Loader2, AlertTriangle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const App: React.FC = () => {
  // State
  const [inputs, setInputs] = useState<LoanInput>({
    principal: 1000000,
    annualRate: 8.5,
    tenureMonths: 120,
    startDate: new Date().toISOString().split('T')[0],
  });

  const [events, setEvents] = useState<LoanEvent[]>([]);
  const [errors, setErrors] = useState<{ [key in keyof LoanInput]?: string }>({});
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
        if (numValue < 1000) error = 'Minimum loan amount is ₹1,000';
        if (numValue > 1000000000) error = 'Maximum loan amount is ₹100 Cr';
      } else if (field === 'annualRate') {
        if (numValue <= 0) error = 'Interest rate must be greater than 0';
        if (numValue > 100) error = 'Interest rate cannot exceed 100%';
      } else if (field === 'tenureMonths') {
        if (numValue < 1) error = 'Tenure must be at least 1 month';
        if (numValue > 600) error = 'Tenure cannot exceed 600 months (50 years)';
      }
    }

    setErrors(prev => ({ ...prev, [field]: error }));

    setInputs(prev => ({
      ...prev,
      [field]: field === 'startDate' ? value : (isNaN(numValue) ? 0 : numValue)
    }));
  };

  const handleAddEvent = (event: LoanEvent) => {
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
            <h1 className="text-base sm:text-xl font-bold text-gray-900 dark:text-davys-gray tracking-tight">Smart EMI Planner</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDarkMode}
              icon={isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              className="text-gray-500 dark:text-davys-gray border-gray-200 dark:border-davys-gray hover:bg-gray-100 dark:hover:bg-davys-gray/10"
            />
            <Button 
              onClick={handleExportPDF}
              disabled={isGeneratingPDF}
              icon={isGeneratingPDF ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              className="bg-dark hover:bg-slate-700 text-white dark:bg-primary dark:hover:bg-indigo-700"
            >
              {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
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
                <h2 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-davys-gray">Loan Details</h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleReset} 
                  icon={<RotateCcw size={14} />}
                  className="text-gray-500 dark:text-davys-gray border-gray-200 dark:border-davys-gray hover:border-gray-300 dark:hover:border-davys-gray hover:text-gray-700 dark:hover:text-davys-gray"
                >
                  Reset
                </Button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <Input 
                    label="Loan Amount (Principal)" 
                    type="number"
                    icon={<IndianRupee size={16} />}
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
                    label="Interest Rate (% P.A.)" 
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
                    label="Tenure (Months)" 
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
                    label="Start Date" 
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
              </div>
            </div>

            {/* Advanced Events Manager */}
            <EventSection 
              events={events} 
              onAddEvent={handleAddEvent} 
              onRemoveEvent={handleRemoveEvent}
              maxMonths={inputs.tenureMonths}
            />
          </div>

          {/* Right Column: Visualization & Results */}
          <div className="lg:col-span-8">
            <SummaryCards 
              monthlyEMI={result.schedule[0]?.emi || 0}
              totalInterest={result.totalInterest}
              totalPayment={result.totalPayment}
              finalTenure={result.finalTenure}
              originalTenure={inputs.tenureMonths}
              startDate={inputs.startDate}
              endDate={result.schedule[result.schedule.length - 1]?.date}
            />

            <AmortizationChart 
              data={result.schedule} 
              principal={inputs.principal} 
              totalInterest={result.totalInterest}
            />

            <AmortizationTable schedule={result.schedule} />
          </div>
        </div>
      </main>

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
    </div>
  );
};

export default App;