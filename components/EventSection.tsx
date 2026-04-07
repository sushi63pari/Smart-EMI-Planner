import React, { useState } from 'react';
import { Plus, Trash2, IndianRupee, Percent, Calendar } from 'lucide-react';
import { LoanEvent, EventType, PartPaymentStrategy } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { formatCurrency } from '../utils/calculations';

interface EventSectionProps {
  events: LoanEvent[];
  onAddEvent: (event: LoanEvent) => void;
  onRemoveEvent: (id: string) => void;
  maxMonths: number;
}

export const EventSection: React.FC<EventSectionProps> = ({ events, onAddEvent, onRemoveEvent, maxMonths }) => {
  const [eventType, setEventType] = useState<EventType>(EventType.PART_PAYMENT);
  const [month, setMonth] = useState<number>(12);
  const [value, setValue] = useState<number>(10000);
  const [strategy, setStrategy] = useState<PartPaymentStrategy>(PartPaymentStrategy.REDUCE_TENURE);

  const handleAdd = () => {
    if (month < 1 || month > maxMonths) return;
    if (value <= 0) return;

    const newEvent: LoanEvent = {
      id: Math.random().toString(36).substr(2, 9),
      month,
      type: eventType,
      value: Number(value),
      strategy: eventType === EventType.PART_PAYMENT ? strategy : undefined
    };
    onAddEvent(newEvent);
  };

  return (
    <div className="bg-white dark:bg-silver-gray rounded-xl shadow-sm border border-gray-100 dark:border-davys-gray p-4 sm:p-6 transition-colors duration-300">
      <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-davys-gray mb-4 flex items-center gap-2">
        <span className="bg-accent/10 dark:bg-amber-900/10 text-accent p-1.5 rounded-lg">
          <Calendar size={18} />
        </span>
        Advanced Options
      </h3>

      <div className="space-y-4">
        {/* Type Selection */}
        <div className="flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setEventType(EventType.PART_PAYMENT)}
            className={`flex-1 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium border rounded-l-lg transition-colors ${
              eventType === EventType.PART_PAYMENT 
                ? 'bg-secondary/10 dark:bg-emerald-900/10 text-secondary dark:text-emerald-700 border-secondary dark:border-emerald-700' 
                : 'bg-white dark:bg-silver-gray text-gray-700 dark:text-davys-gray border-gray-200 dark:border-davys-gray hover:bg-gray-50 dark:hover:bg-davys-gray/10'
            }`}
          >
            Part Payment
          </button>
          <button
            type="button"
            onClick={() => setEventType(EventType.RATE_CHANGE)}
            className={`flex-1 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium border-t border-b border-r rounded-r-lg transition-colors ${
              eventType === EventType.RATE_CHANGE 
                ? 'bg-accent/10 dark:bg-amber-900/10 text-accent dark:text-amber-700 border-accent dark:border-amber-700' 
                : 'bg-white dark:bg-silver-gray text-gray-700 dark:text-davys-gray border-gray-200 dark:border-davys-gray hover:bg-gray-50 dark:hover:bg-davys-gray/10'
            }`}
          >
            Rate Change
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="After Month" 
            type="number" 
            min={1} 
            max={maxMonths}
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            suffix="th Month"
            tooltip="The month number after which this change will take effect"
          />
          
          <Input 
            label={eventType === EventType.PART_PAYMENT ? "Amount" : "New Interest Rate"}
            type="number"
            min={0}
            step={eventType === EventType.RATE_CHANGE ? 0.1 : 1000}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            icon={eventType === EventType.PART_PAYMENT ? <IndianRupee size={14} /> : undefined}
            suffix={eventType === EventType.RATE_CHANGE ? "%" : undefined}
            tooltip={eventType === EventType.PART_PAYMENT ? "Enter the part payment amount" : "Enter the new annual interest rate"}
          />
        </div>

        {eventType === EventType.PART_PAYMENT && (
          <div className="p-3 bg-gray-50 dark:bg-davys-gray/10 rounded-lg space-y-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-davys-gray uppercase tracking-wider">Effect</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="strategy" 
                  checked={strategy === PartPaymentStrategy.REDUCE_TENURE}
                  onChange={() => setStrategy(PartPaymentStrategy.REDUCE_TENURE)}
                  className="text-primary focus:ring-primary dark:bg-davys-gray dark:border-davys-gray"
                />
                <span className="text-xs sm:text-sm text-gray-700 dark:text-davys-gray">Reduce Tenure</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="strategy" 
                  checked={strategy === PartPaymentStrategy.REDUCE_EMI}
                  onChange={() => setStrategy(PartPaymentStrategy.REDUCE_EMI)}
                  className="text-primary focus:ring-primary dark:bg-davys-gray dark:border-davys-gray"
                />
                <span className="text-xs sm:text-sm text-gray-700 dark:text-davys-gray">Reduce EMI</span>
              </label>
            </div>
          </div>
        )}

        <Button onClick={handleAdd} className="w-full" icon={<Plus size={18} />}>
          Add Event
        </Button>
      </div>

      {/* Event List */}
      {events.length > 0 && (
        <div className="mt-6 border-t dark:border-davys-gray pt-4">
          <h4 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-davys-gray mb-3">Scheduled Events</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
            {events.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-white dark:bg-silver-gray border border-gray-100 dark:border-davys-gray rounded-lg shadow-sm text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${event.type === EventType.PART_PAYMENT ? 'bg-green-100 dark:bg-green-900/10 text-green-600 dark:text-green-700' : 'bg-amber-100 dark:bg-amber-900/10 text-amber-600 dark:text-amber-700'}`}>
                    {event.type === EventType.PART_PAYMENT ? <IndianRupee size={14} /> : <Percent size={14} />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-davys-gray">
                      Month {event.month}: {event.type === EventType.PART_PAYMENT ? 'Part Payment' : 'Rate Change'}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-davys-gray">
                      {event.type === EventType.PART_PAYMENT 
                        ? `${formatCurrency(event.value)} (${event.strategy === PartPaymentStrategy.REDUCE_EMI ? 'Reduce EMI' : 'Reduce Tenure'})` 
                        : `New Rate: ${event.value}%`}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => onRemoveEvent(event.id)}
                  className="text-gray-400 hover:text-red-500 dark:hover:text-red-700 transition-colors p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
