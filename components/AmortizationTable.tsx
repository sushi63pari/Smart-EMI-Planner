import React from 'react';
import { ScheduleItem } from '../types';
import { formatCurrency } from '../utils/calculations';
import { AppTranslations } from '../utils/translations';
import { Milestone, ArrowDownRight, Wallet, Percent } from 'lucide-react';

interface AmortizationTableProps {
  schedule: ScheduleItem[];
  currencyCode: string;
  currencyLocale: string;
  translations?: AppTranslations;
  language?: string;
}

const getMidpointStringsByLanguage = (lang: string) => {
  switch (lang) {
    case 'hi': // Hindi
      return {
        midpointTitle: "मध्यबिंदु मील का पत्थर",
        midpointDesc: "सक्रिय ऋण अवधि के ठीक मध्य बिंदु पर संचित मूल्य",
        totalPrincipalPaid: "कुल चुकाया गया मूलधन",
        totalInterestPaid: "कुल भुगतान किया गया ब्याज",
        remainingBalance: "बकाया ऋण राशि",
        timelineProgress: "समयरेखा प्रगति",
        atMonth: "महीना"
      };
    case 'ml': // Malayalam
      return {
        midpointTitle: "മധ്യബിന്ദു പുരോഗതി",
        midpointDesc: "വായ്പ കാലാവധിയുടെ പകുതിയിലെത്തുമ്പോൾ ഉള്ള കണക്കുകൾ",
        totalPrincipalPaid: "ആകെ അടച്ച അസ്സൽ",
        totalInterestPaid: "ആകെ അടച്ച പലിശ",
        remainingBalance: "ബാക്കി വായ്പ തുക",
        timelineProgress: "സമയരേഖ",
        atMonth: "മാസം"
      };
    case 'kn': // Kannada
      return {
        midpointTitle: "ಮಧ್ಯಬಿಂದು ಮೈಲಿಗಲ್ಲು",
        midpointDesc: "ಸಕ್ರಿಯ ಸಾಲದ ಅವಧಿಯ ಸರಿಯಾದ ಅರ್ಧದಲ್ಲಿದ್ದಾಗ ಇರುವ ವಿವರಗಳು",
        totalPrincipalPaid: "ಒಟ್ಟು ಪಾವತಿಸಿದ ಅಸಲು",
        totalInterestPaid: "ಒಟ್ಟು ಪಾವತಿಸಿದ ಬಡ್ಡಿ",
        remainingBalance: "ಬಾಕಿ ಇರುವ ಸಾಲ",
        timelineProgress: "ಸಮಯರೇಖೆ ಪ್ರಗತಿ",
        atMonth: "ತಿಂಗಳು"
      };
    case 'pa': // Punjabi
      return {
        midpointTitle: "ਮੱਧ-ਬਿੰਦੂ ਮੀਲ ਪੱਥਰ",
        midpointDesc: "ਸਰਗਰਮ ਲੋਨ ਦੀ ਮਿਆਦ ਦੇ ਬਿਲਕੁਲ ਅੱਧੇ ਪੜਾਅ 'ਤੇ ਅਨੁਮਾਨਿਤ ਮੁੱਲ",
        totalPrincipalPaid: "ਕੁੱਲ ਭੁਗਤਾਨ ਕੀਤਾ ਮੂਲਧਨ",
        totalInterestPaid: "ਕੁੱਲ ਭੁਗਤਾਨ ਕੀਤਾ ਵਿਆਜ",
        remainingBalance: "ਬਾਕੀ ਬਚੀ ਲੋਨ ਰਾਸ਼ी",
        timelineProgress: "ਟਾਈਮਲਾਈਨ ਪ੍ਰਗਤੀ",
        atMonth: "ਮਹੀਨਾ"
      };
    case 'ta': // Tamil
      return {
        midpointTitle: "நடுப்பகுதி மைல்கல்",
        midpointDesc: "கடன் காலத்தின் சரியான நடுப்பகுதியில் கணக்கிடப்பட்ட மதிப்புகள்",
        totalPrincipalPaid: "மொத்தம் செலுத்திய அசல்",
        totalInterestPaid: "மொத்தம் செலுத்திய வட்டி",
        remainingBalance: "மீதமுள்ள கடன் தொகை",
        timelineProgress: "காலக்கோடு முன்னேற்றம்",
        atMonth: "மாதம்"
      };
    case 'te': // Telugu
      return {
        midpointTitle: "మధ్యబిందువు మైలురాయి",
        midpointDesc: "క్రియాశీల రుణ కాలపరిమితి యొక్క ఖచ్చితమైన సగం వద్ద లెక్కించబడిన విలువలు",
        totalPrincipalPaid: "మొత్తం చెల్లించిన అసలు",
        totalInterestPaid: "మొత్తం చెల్లించిన వడ్డి",
        remainingBalance: "మిగిలిన రుణ బ్యాలెన్స్",
        timelineProgress: "టైమ్‌లైన్ పురోగతి",
        atMonth: "నెల"
      };
    case 'bn': // Bengali
      return {
        midpointTitle: "মধ্যবিন্দু মাইলফলক",
        midpointDesc: "ঋণের মেয়াদের ঠিক অর্ধেক সময়ে পুঞ্জীভূত হিসাব",
        totalPrincipalPaid: "মোট পরিশোধিত আসল",
        totalInterestPaid: "মোট পরিশোধিত সুদ",
        remainingBalance: "অবশিষ্ট ঋণের পরিমাণ",
        timelineProgress: "সময়রেখার অগ্রগতি",
        atMonth: "মাস"
      };
    case 'mr': // Marathi
      return {
        midpointTitle: "मध्यबिंदू प्रगती",
        midpointDesc: "सक्रिय कर्ज कालावधीच्या अगदी मध्यभागी संचित मूल्ये",
        totalPrincipalPaid: "एकूण भरलेले मुद्दल",
        totalInterestPaid: "एकूण भरलेले व्याज",
        remainingBalance: "उर्वरित कर्ज रक्कम",
        timelineProgress: "टाईमलाईन प्रगती",
        atMonth: "महिना"
      };
    case 'fr': // French
      return {
        midpointTitle: "Étape à mi-parcours",
        midpointDesc: "Valeurs cumulées calculées exactement à la moitié de la durée du prêt",
        totalPrincipalPaid: "Principal total remboursé",
        totalInterestPaid: "Intérêt total payé",
        remainingBalance: "Solde restant dû",
        timelineProgress: "Progression temporelle",
        atMonth: "Mois"
      };
    case 'de': // German
      return {
        midpointTitle: "Halbzeit-Meilenstein",
        midpointDesc: "Kumulierte Werte genau zur Hälfte der aktiven Kreditlaufzeit",
        totalPrincipalPaid: "Gezahlte Tilgung (gesamt)",
        totalInterestPaid: "Gezahlte Zinsen (gesamt)",
        remainingBalance: "Restschuld",
        timelineProgress: "Zeitlicher Fortschritt",
        atMonth: "Monat"
      };
    case 'es': // Spanish
      return {
        midpointTitle: "Hito a mitad de plazo",
        midpointDesc: "Valores acumulados calculados exactamente a la mitad del plazo activo del préstamo",
        totalPrincipalPaid: "Principal total pagado",
        totalInterestPaid: "Interés total pagado",
        remainingBalance: "Saldo pendiente",
        timelineProgress: "Progreso temporal",
        atMonth: "Mes"
      };
    default: // English
      return {
        midpointTitle: "Midpoint Milestone",
        midpointDesc: "Cumulative values and outstanding balance calculated exactly at the halfway point of your active loan term.",
        totalPrincipalPaid: "Cumulative Principal Paid",
        totalInterestPaid: "Cumulative Interest Paid",
        remainingBalance: "Outstanding Balance",
        timelineProgress: "Timeline Progress",
        atMonth: "Month"
      };
  }
};

export const AmortizationTable: React.FC<AmortizationTableProps> = ({ 
  schedule,
  currencyCode,
  currencyLocale,
  translations,
  language = 'en'
}) => {
  const [showDates, setShowDates] = React.useState(true);

  if (!schedule || schedule.length === 0) {
    return null;
  }

  const midStrings = getMidpointStringsByLanguage(language);

  // Midpoint Calculations
  const totalMonths = schedule.length;
  const midpointIndex = Math.floor((totalMonths - 1) / 2);
  const midpointItem = schedule[midpointIndex];

  let totalPrincipalUpToMidpoint = 0;
  let totalInterestUpToMidpoint = 0;

  for (let i = 0; i <= midpointIndex; i++) {
    const item = schedule[i];
    totalPrincipalUpToMidpoint += (item.principalComponent + item.prepayment);
    totalInterestUpToMidpoint += item.interestComponent;
  }

  const remainingBalanceAtMidpoint = midpointItem.closingBalance;
  const midpointMonthNumber = midpointItem.month;
  const midpointLabel = showDates && midpointItem.date ? midpointItem.date : `${midStrings.atMonth} ${midpointMonthNumber}`;

  // Read original loan principal from the first item
  const originalPrincipal = schedule[0]?.openingBalance || 1;

  return (
    <div className="bg-white dark:bg-silver-gray rounded-xl shadow-sm border border-gray-100 dark:border-davys-gray overflow-hidden transition-colors duration-300">
      <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-davys-gray flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-davys-gray">{translations?.amortizationScheduleHeader || "Amortization Schedule"}</h3>
        <button 
          onClick={() => setShowDates(!showDates)}
          className="text-sm font-medium text-primary hover:underline"
        >
          {showDates ? (translations?.showMonthNumLabel || 'Show Month #') : (translations?.showDatesLabel || 'Show Dates')}
        </button>
      </div>

      {/* Midpoint Summary Block */}
      <div className="p-4 sm:p-5 bg-slate-50/50 dark:bg-[#1a202c]/30 border-b border-gray-100 dark:border-davys-gray/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Milestone size={18} className="animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                {midStrings.midpointTitle}
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-900/30">
                  {midpointLabel}
                </span>
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-davys-gray mt-0.5 leading-relaxed">
                {midStrings.midpointDesc}
              </p>
            </div>
          </div>
          
          {/* Subtle Progress Bar */}
          <div className="flex flex-col gap-1.5 w-full sm:w-48">
            <div className="flex justify-between text-[10px] font-bold text-gray-400 dark:text-davys-gray/70">
              <span>0%</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">{midStrings.atMonth} {midpointMonthNumber}/{totalMonths}</span>
              <span>100%</span>
            </div>
            <div className="relative h-2 w-full bg-gray-200 dark:bg-zinc-850 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.round((midpointMonthNumber / totalMonths) * 100)}%` }}
              />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white dark:bg-black shadow border border-indigo-600 dark:border-indigo-400"
                style={{ left: `calc(${Math.round((midpointMonthNumber / totalMonths) * 100)}% - 4px)` }}
              />
            </div>
          </div>
        </div>

        {/* 3-Column Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Col 1: Total Principal Paid */}
          <div className="bg-white dark:bg-silver-gray/50 rounded-xl p-3.5 border border-gray-100 dark:border-davys-gray/40 shadow-sm flex items-start gap-3 transition-all hover:shadow-md hover:border-emerald-150 dark:hover:border-emerald-900/20">
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-500 flex-shrink-0">
              <ArrowDownRight size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-gray-400 dark:text-davys-gray/70">
                {midStrings.totalPrincipalPaid}
              </p>
              <p className="text-sm sm:text-base font-extrabold text-emerald-650 dark:text-emerald-400 mt-1 truncate">
                {formatCurrency(totalPrincipalUpToMidpoint, currencyCode, currencyLocale)}
              </p>
              <div className="flex items-center gap-1 mt-1 font-mono text-[9px] text-gray-500 dark:text-davys-gray/60">
                <span>{Math.round((totalPrincipalUpToMidpoint / originalPrincipal) * 100)}% of total debt cleared</span>
              </div>
            </div>
          </div>

          {/* Col 2: Total Interest Paid */}
          <div className="bg-white dark:bg-silver-gray/50 rounded-xl p-3.5 border border-gray-100 dark:border-davys-gray/40 shadow-sm flex items-start gap-3 transition-all hover:shadow-md hover:border-orange-150 dark:hover:border-orange-900/20">
            <div className="p-2.5 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-orange-500 dark:text-orange-500 flex-shrink-0">
              <Percent size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-gray-400 dark:text-davys-gray/70">
                {midStrings.totalInterestPaid}
              </p>
              <p className="text-sm sm:text-base font-extrabold text-orange-550 dark:text-orange-400 mt-1 truncate">
                {formatCurrency(totalInterestUpToMidpoint, currencyCode, currencyLocale)}
              </p>
              <div className="flex items-center gap-1 mt-1 font-mono text-[9px] text-gray-500 dark:text-davys-gray/60">
                <span>{Math.round((totalInterestUpToMidpoint / (totalPrincipalUpToMidpoint || 1)) * 100)}% interest-to-principal ratio</span>
              </div>
            </div>
          </div>

          {/* Col 3: Remaining Balance */}
          <div className="bg-white dark:bg-silver-gray/50 rounded-xl p-3.5 border border-gray-100 dark:border-davys-gray/40 shadow-sm flex items-start gap-3 transition-all hover:shadow-md hover:border-indigo-150 dark:hover:border-indigo-900/20">
            <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-500 flex-shrink-0">
              <Wallet size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-gray-400 dark:text-davys-gray/70">
                {midStrings.remainingBalance}
              </p>
              <p className="text-sm sm:text-base font-extrabold text-indigo-650 dark:text-indigo-400 mt-1 truncate">
                {formatCurrency(remainingBalanceAtMidpoint, currencyCode, currencyLocale)}
              </p>
              <div className="flex items-center gap-1 mt-1 font-mono text-[9px] text-gray-500 dark:text-davys-gray/60">
                <span>{Math.round((remainingBalanceAtMidpoint / originalPrincipal) * 100)}% principal remaining</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto overflow-y-auto max-h-[500px] sm:max-h-[600px] custom-scrollbar relative border-t border-gray-100 dark:border-davys-gray/50">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-davys-gray">
          <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-[#cdd2da] shadow-sm">
            <tr>
              <th scope="col" className="sticky top-0 bg-gray-50 dark:bg-[#cdd2da] z-10 px-3 sm:px-6 py-2 sm:py-3 text-left text-[9px] sm:text-xs font-semibold text-gray-500 dark:text-gray-700 uppercase tracking-wider">
                {showDates ? (translations?.tableColDate || 'Date') : (translations?.tableColMonth || 'Month')}
              </th>
              <th scope="col" className="sticky top-0 bg-gray-50 dark:bg-[#cdd2da] z-10 px-3 sm:px-6 py-2 sm:py-3 text-right text-[9px] sm:text-xs font-semibold text-gray-500 dark:text-gray-700 uppercase tracking-wider">{translations?.tableColOpening || 'Opening'}</th>
              <th scope="col" className="sticky top-0 bg-gray-50 dark:bg-[#cdd2da] z-10 px-3 sm:px-6 py-2 sm:py-3 text-right text-[9px] sm:text-xs font-semibold text-gray-500 dark:text-gray-700 uppercase tracking-wider">{translations?.tableColEmi || 'EMI'}</th>
              <th scope="col" className="sticky top-0 bg-gray-50 dark:bg-[#cdd2da] z-10 px-3 sm:px-6 py-2 sm:py-3 text-right text-[9px] sm:text-xs font-semibold text-gray-500 dark:text-gray-700 uppercase tracking-wider">{translations?.tableColPrincipal || 'Principal'}</th>
              <th scope="col" className="sticky top-0 bg-gray-50 dark:bg-[#cdd2da] z-10 px-3 sm:px-6 py-2 sm:py-3 text-right text-[9px] sm:text-xs font-semibold text-gray-500 dark:text-gray-700 uppercase tracking-wider">{translations?.tableColInterest || 'Interest'}</th>
              <th scope="col" className="sticky top-0 bg-gray-50 dark:bg-[#cdd2da] z-10 px-3 sm:px-6 py-2 sm:py-3 text-right text-[9px] sm:text-xs font-semibold text-gray-500 dark:text-gray-700 uppercase tracking-wider">{translations?.tableColExtraPaid || 'Extra Paid'}</th>
              <th scope="col" className="sticky top-0 bg-gray-50 dark:bg-[#cdd2da] z-10 px-3 sm:px-6 py-2 sm:py-3 text-right text-[9px] sm:text-xs font-semibold text-gray-500 dark:text-gray-700 uppercase tracking-wider">{translations?.tableColClosing || 'Closing'}</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-silver-gray divide-y divide-gray-200 dark:divide-davys-gray">
            {schedule.map((row) => (
              <tr key={row.month} className="hover:bg-gray-50 dark:hover:bg-davys-gray/5 transition-colors">
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-[10px] sm:text-sm font-medium text-gray-900 dark:text-davys-gray">
                  {showDates ? row.date : row.month}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-[10px] sm:text-sm text-right text-gray-500 dark:text-davys-gray">
                  {formatCurrency(row.openingBalance, currencyCode, currencyLocale)}
                </td>
                <td className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-[10px] sm:text-sm text-right font-medium transition-colors ${row.emiChanged ? 'text-indigo-600 dark:text-indigo-400' : 'text-primary dark:text-davys-gray'}`}>
                  {formatCurrency(row.emi, currencyCode, currencyLocale)}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-[10px] sm:text-sm text-right text-green-600 dark:text-green-700">
                  {formatCurrency(row.principalComponent, currencyCode, currencyLocale)}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-[10px] sm:text-sm text-right text-orange-500 dark:text-orange-700">
                  {formatCurrency(row.interestComponent, currencyCode, currencyLocale)}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-[10px] sm:text-sm text-right text-gray-500 dark:text-davys-gray">
                  {row.prepayment > 0 ? (
                    <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-xs font-medium bg-green-100 dark:bg-green-900/10 text-green-800 dark:text-green-700">
                      +{formatCurrency(row.prepayment, currencyCode, currencyLocale)}
                    </span>
                  ) : '-'}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-[10px] sm:text-sm text-right text-gray-900 dark:text-davys-gray font-medium">
                  {formatCurrency(row.closingBalance, currencyCode, currencyLocale)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
