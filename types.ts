export interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  locale: string;
}

export const CURRENCIES: CurrencyConfig[] = [
  { code: 'INR', name: '🇮🇳 Indian Rupee (₹)', symbol: '₹', locale: 'en-IN' },
  { code: 'USD', name: '🇺🇸 US Dollar ($)', symbol: '$', locale: 'en-US' },
  { code: 'SGD', name: '🇸🇬 Singapore Dollar (S$)', symbol: 'S$', locale: 'en-SG' },
  { code: 'EUR', name: '🇪🇺 Euro (€)', symbol: '€', locale: 'de-DE' },
  { code: 'GBP', name: '🇬🇧 British Pound (£)', symbol: '£', locale: 'en-GB' },
  { code: 'CAD', name: '🇨🇦 Canadian Dollar (C$)', symbol: 'C$', locale: 'en-CA' },
  { code: 'AUD', name: '🇦🇺 Australian Dollar (A$)', symbol: 'A$', locale: 'en-AU' },
  { code: 'AED', name: '🇦🇪 UAE Dirham (AED)', symbol: 'Dh', locale: 'en-AE' },
  { code: 'JPY', name: '🇯🇵 Japanese Yen (¥)', symbol: '¥', locale: 'ja-JP' },
  { code: 'CHF', name: '🇨🇭 Swiss Franc (CHF)', symbol: 'CHF', locale: 'de-CH' },
];

export interface LoanInput {
  principal: number;
  annualRate: number;
  tenureMonths: number;
  startDate?: string; // ISO date string
  monthlyIncome?: number; // Hypothetical monthly income for EMI stress testing
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
  date?: string; // Formatted date string (e.g., "Apr 2026")
  openingBalance: number;
  emi: number;
  interestComponent: number;
  principalComponent: number;
  closingBalance: number;
  prepayment: number;
  rate: number; // The rate applied this month
  emiChanged?: boolean; // Flag to indicate if EMI changed this month due to a rate change
}

export interface CalculationResult {
  schedule: ScheduleItem[];
  totalInterest: number;
  totalPayment: number;
  finalTenure: number; // Actual months taken to close
}