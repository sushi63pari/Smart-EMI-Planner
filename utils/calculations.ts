import { LoanInput, LoanEvent, ScheduleItem, CalculationResult, EventType, PartPaymentStrategy } from '../types';

export const calculatePMT = (principal: number, monthlyRate: number, months: number): number => {
  if (monthlyRate === 0) return principal / months;
  if (months <= 0) return principal;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
};

export const calculateNPER = (principal: number, monthlyRate: number, emi: number): number => {
  if (monthlyRate === 0) return principal / emi;
  const interest = principal * monthlyRate;
  if (emi <= interest + 0.01) return 600; // Cap at 50 years if EMI doesn't cover interest
  const val = 1 - (interest / emi);
  return -Math.log(val) / Math.log(1 + monthlyRate);
};

export const calculateAmortizationSchedule = (
  inputs: LoanInput,
  events: LoanEvent[]
): CalculationResult => {
  const schedule: ScheduleItem[] = [];
  let currentPrincipal = inputs.principal;
  let currentRate = inputs.annualRate;
  let currentMonthlyRate = currentRate / 12 / 100;
  
  // Sort events by month to process them in order
  const sortedEvents = [...events].sort((a, b) => a.month - b.month);
  
  // We need to determine the EMI dynamically.
  // Initially, we calculate the base EMI.
  let currentTenureRemaining = inputs.tenureMonths;
  let currentEMI = calculatePMT(currentPrincipal, currentMonthlyRate, currentTenureRemaining);

  let totalInterest = 0;
  let totalPrepayment = 0;

  // We loop until principal is zero or we reach a safety limit (to prevent infinite loops)
  const MAX_MONTHS = 600; // 50 years max
  let month = 1;

  const start = inputs.startDate ? new Date(inputs.startDate) : new Date();

  while (currentPrincipal > 0.1 && month <= MAX_MONTHS) {
    // Calculate date for this month
    const currentDate = new Date(start);
    currentDate.setMonth(start.getMonth() + month - 1);
    const dateStr = currentDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

    // 1. Check for events occurring at the start of this month
    const monthEvents = sortedEvents.filter(e => e.month === month);
    let prepaymentThisMonth = 0;
    let emiChangedThisMonth = false;
    const previousEMI = currentEMI;

    for (const event of monthEvents) {
      if (event.type === EventType.RATE_CHANGE) {
        currentRate = event.value;
        currentMonthlyRate = currentRate / 12 / 100;
        // Recalculate EMI based on new rate and currently tracked remaining tenure
        // This ensures that if tenure was previously reduced, we keep that reduced tenure.
        currentEMI = calculatePMT(currentPrincipal, currentMonthlyRate, currentTenureRemaining);
        if (Math.abs(currentEMI - previousEMI) > 0.1) {
          emiChangedThisMonth = true;
        }
      } 
      else if (event.type === EventType.PART_PAYMENT) {
        const paymentAmount = event.value;
        prepaymentThisMonth += paymentAmount;
        currentPrincipal -= paymentAmount;
        totalPrepayment += paymentAmount;

        if (currentPrincipal <= 0.1) {
          currentPrincipal = 0;
          break;
        }

        if (event.strategy === PartPaymentStrategy.REDUCE_EMI) {
           // Recalculate EMI for same remaining tenure
           currentEMI = calculatePMT(currentPrincipal, currentMonthlyRate, currentTenureRemaining);
           if (Math.abs(currentEMI - previousEMI) > 0.1) {
             emiChangedThisMonth = true;
           }
        } else {
           // REDUCE_TENURE: Keep EMI same, but update our tracking of remaining tenure 
           // so future events (like rate changes) respect this shorter duration.
           if (currentPrincipal > 0 && currentEMI > 0) {
             const nper = calculateNPER(currentPrincipal, currentMonthlyRate, currentEMI);
             currentTenureRemaining = Math.max(1, Math.ceil(nper));
           }
        }
      }
    }

    if (currentPrincipal <= 0.1) break;

    const openingBalance = currentPrincipal;
    const interest = openingBalance * currentMonthlyRate;
    
    let principalComponent = currentEMI - interest;
    let paidEMI = currentEMI;
    
    if (openingBalance + interest <= currentEMI) {
        paidEMI = openingBalance + interest;
        principalComponent = openingBalance;
    }

    const closingBalance = openingBalance - principalComponent;

    schedule.push({
      month,
      date: dateStr,
      openingBalance,
      emi: paidEMI,
      interestComponent: interest,
      principalComponent,
      closingBalance: closingBalance < 0.1 ? 0 : closingBalance,
      prepayment: prepaymentThisMonth,
      rate: currentRate,
      emiChanged: emiChangedThisMonth
    });

    totalInterest += interest;
    currentPrincipal = closingBalance;
    
    if (currentPrincipal < 0.1) currentPrincipal = 0;

    month++;
    // Decrement our tracked remaining tenure
    currentTenureRemaining = Math.max(0, currentTenureRemaining - 1);
  }

  return {
    schedule,
    totalInterest,
    totalPayment: inputs.principal + totalInterest, // This is technically Principal + Interest. Actual cash flow includes prepayments.
    finalTenure: schedule.length
  };
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR', // Using INR as context implies EMI usually, but fits generic $ too if locale changed
    maximumFractionDigits: 0
  }).format(value);
};