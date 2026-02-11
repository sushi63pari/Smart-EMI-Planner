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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span className="bg-accent/10 text-accent p-1.5 rounded-lg">
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
            className={`flex-1 px-4 py-2 text-sm font-medium border rounded-l-lg ${
              eventType === EventType.PART_PAYMENT 
                ? 'bg-secondary/10 text-secondary border-secondary' 
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Part Payment
          </button>
          <button
            type="button"
            onClick={() => setEventType(EventType.RATE_CHANGE)}
            className={`flex-1 px-4 py-2 text-sm font-medium border-t border-b border-r rounded-r-lg ${
              eventType === EventType.RATE_CHANGE 
                ? 'bg-accent/10 text-accent border-accent' 
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
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
          />
        </div>

        {eventType === EventType.PART_PAYMENT && (
          <div className="p-3 bg-gray-50 rounded-lg space-y-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Effect</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="strategy" 
                  checked={strategy === PartPaymentStrategy.REDUCE_TENURE}
                  onChange={() => setStrategy(PartPaymentStrategy.REDUCE_TENURE)}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">Reduce Tenure</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="strategy" 
                  checked={strategy === PartPaymentStrategy.REDUCE_EMI}
                  onChange={() => setStrategy(PartPaymentStrategy.REDUCE_EMI)}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">Reduce EMI</span>
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
        <div className="mt-6 border-t pt-4">
          <h4 className="text-sm font-medium text-gray-500 mb-3">Scheduled Events</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
            {events.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm text-sm">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${event.type === EventType.PART_PAYMENT ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                    {event.type === EventType.PART_PAYMENT ? <IndianRupee size={14} /> : <Percent size={14} />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Month {event.month}: {event.type === EventType.PART_PAYMENT ? 'Part Payment' : 'Rate Change'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {event.type === EventType.PART_PAYMENT 
                        ? `${formatCurrency(event.value)} (${event.strategy === PartPaymentStrategy.REDUCE_EMI ? 'Reduce EMI' : 'Reduce Tenure'})` 
                        : `New Rate: ${event.value}%`}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => onRemoveEvent(event.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
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