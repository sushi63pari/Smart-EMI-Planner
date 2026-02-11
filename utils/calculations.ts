import { LoanInput, LoanEvent, ScheduleItem, CalculationResult, EventType, PartPaymentStrategy } from '../types';

export const calculatePMT = (principal: number, monthlyRate: number, months: number): number => {
  if (monthlyRate === 0) return principal / months;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
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
  const MAX_MONTHS = inputs.tenureMonths * 3; 
  let month = 1;

  while (currentPrincipal > 1 && month <= MAX_MONTHS) { // threshold > 1 to avoid floating point issues near 0
    // 1. Check for events occurring at the start of this month
    const monthEvents = sortedEvents.filter(e => e.month === month);
    let prepaymentThisMonth = 0;

    for (const event of monthEvents) {
      if (event.type === EventType.RATE_CHANGE) {
        currentRate = event.value;
        currentMonthlyRate = currentRate / 12 / 100;
        // Recalculate EMI based on new rate and remaining tenure (approx)
        // Note: For rate changes, banks usually keep tenure same and increase EMI, 
        // OR keep EMI same and increase tenure. Here we assume we recalculate EMI to fit remaining original tenure logic
        // unless specified otherwise. Standard practice: Recalculate EMI to finish in remaining original time (unless extended).
        // However, to keep it consistent with "Reduce EMI" vs "Reduce Tenure" logic generally:
        // A simple approach: Recalculate EMI required to clear balance in remaining scheduled months.
        const remainingMonthsIdeally = Math.max(1, inputs.tenureMonths - month + 1);
        
        // If we previously reduced tenure, our target remaining might be different. 
        // Let's stick to: Recalculate EMI to clear debt over currently projected remaining months.
        // Actually, easiest way: Recalculate EMI for remaining schedule.
        currentEMI = calculatePMT(currentPrincipal, currentMonthlyRate, currentTenureRemaining);
      } 
      else if (event.type === EventType.PART_PAYMENT) {
        const paymentAmount = event.value;
        prepaymentThisMonth += paymentAmount;
        currentPrincipal -= paymentAmount;
        totalPrepayment += paymentAmount;

        if (currentPrincipal <= 0) {
          currentPrincipal = 0;
          break; // Loop will handle exit
        }

        if (event.strategy === PartPaymentStrategy.REDUCE_EMI) {
           // Recalculate EMI for same remaining tenure
           currentEMI = calculatePMT(currentPrincipal, currentMonthlyRate, currentTenureRemaining);
        } else {
           // REDUCE_TENURE: Keep EMI same (do nothing to currentEMI), tenure will naturally shorten
           // Exception: If currentEMI is now > currentPrincipal + interest, it will finish next month.
        }
      }
    }

    if (currentPrincipal <= 0) {
       // Paid off by prepayment
       break;
    }

    const openingBalance = currentPrincipal;
    const interest = openingBalance * currentMonthlyRate;
    
    // Calculate Principal Component
    // If it's the last payment or EMI is huge, cap it.
    let principalComponent = currentEMI - interest;
    
    // Adjust for final month
    let paidEMI = currentEMI;
    
    if (openingBalance + interest <= currentEMI) {
        // Final payment
        paidEMI = openingBalance + interest;
        principalComponent = openingBalance;
    } else {
        // If principal component is negative (interest > EMI), we have a problem (negative amortization).
        // In a real app, we'd warn the user or force a higher EMI. 
        // Here, we'll let it grow but typically EMI > Interest.
    }

    const closingBalance = openingBalance - principalComponent;

    schedule.push({
      month,
      openingBalance,
      emi: paidEMI,
      interestComponent: interest,
      principalComponent,
      closingBalance: closingBalance < 0.1 ? 0 : closingBalance, // Round near zero
      prepayment: prepaymentThisMonth,
      rate: currentRate
    });

    totalInterest += interest;
    currentPrincipal = closingBalance;
    
    if (currentPrincipal < 0.1) currentPrincipal = 0; // Snap to zero

    month++;
    currentTenureRemaining--;
    if(currentTenureRemaining < 1) currentTenureRemaining = 1; // Safety for recalc
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