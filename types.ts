export interface LoanInput {
  principal: number;
  annualRate: number;
  tenureMonths: number;
}

export enum EventType {
  PART_PAYMENT = 'PART_PAYMENT',
  RATE_CHANGE = 'RATE_CHANGE',
}

export enum PartPaymentStrategy {
  REDUCE_EMI = 'REDUCE_EMI',
  REDUCE_TENURE = 'REDUCE_TENURE',
}

export interface LoanEvent {
  id: string;
  month: number; // 1-based index (e.g., Month 12)
  type: EventType;
  value: number; // Amount for payment, or New Rate % for rate change
  strategy?: PartPaymentStrategy; // Only for Part Payment
}

export interface ScheduleItem {
  month: number;
  openingBalance: number;
  emi: number;
  interestComponent: number;
  principalComponent: number;
  closingBalance: number;
  prepayment: number;
  rate: number; // The rate applied this month
}

export interface CalculationResult {
  schedule: ScheduleItem[];
  totalInterest: number;
  totalPayment: number;
  finalTenure: number; // Actual months taken to close
}