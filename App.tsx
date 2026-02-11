import React, { useState, useMemo } from 'react';
import { LoanInput, LoanEvent } from './types';
import { calculateAmortizationSchedule } from './utils/calculations';
import { Input } from './components/ui/Input';
import { Button } from './components/ui/Button';
import { SummaryCards } from './components/SummaryCards';
import { EventSection } from './components/EventSection';
import { AmortizationChart } from './components/AmortizationChart';
import { AmortizationTable } from './components/AmortizationTable';
import { Calculator, IndianRupee, Percent, Calendar, RotateCcw } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [inputs, setInputs] = useState<LoanInput>({
    principal: 1000000,
    annualRate: 8.5,
    tenureMonths: 120,
  });

  const [events, setEvents] = useState<LoanEvent[]>([]);

  // Derived State (Calculations)
  const result = useMemo(() => {
    return calculateAmortizationSchedule(inputs, events);
  }, [inputs, events]);

  // Handlers
  const handleInputChange = (field: keyof LoanInput, value: string) => {
    setInputs(prev => ({
      ...prev,
      [field]: Number(value)
    }));
  };

  const handleAddEvent = (event: LoanEvent) => {
    setEvents(prev => [...prev, event]);
  };

  const handleRemoveEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const handleReset = () => {
    setInputs({
      principal: 1000000,
      annualRate: 8.5,
      tenureMonths: 120,
    });
    setEvents([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <Calculator size={24} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Smart EMI Planner</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs & Controls */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Basic Inputs Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Loan Details</h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleReset} 
                  icon={<RotateCcw size={14} />}
                  className="text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
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
                  />
                  <input 
                    type="range" 
                    min="10000" 
                    max="10000000" 
                    step="10000"
                    value={inputs.principal}
                    onChange={(e) => handleInputChange('principal', e.target.value)}
                    className="w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
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
                  />
                  <input 
                    type="range" 
                    min="1" 
                    max="30" 
                    step="0.1"
                    value={inputs.annualRate}
                    onChange={(e) => handleInputChange('annualRate', e.target.value)}
                    className="w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-secondary"
                  />
                </div>

                <div>
                  <Input 
                    label="Tenure (Months)" 
                    type="number"
                    icon={<Calendar size={16} />}
                    value={inputs.tenureMonths}
                    onChange={(e) => handleInputChange('tenureMonths', e.target.value)}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
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
                    className="w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent"
                  />
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
    </div>
  );
};

export default App;