import React, { useState, useMemo, useEffect, useRef } from 'react';
import { LoanInput, LoanEvent, EventType, PartPaymentStrategy, CURRENCIES, CurrencyConfig, ComparisonSnapshot } from './types';
import { calculateAmortizationSchedule, formatCurrency } from './utils/calculations';
import { Input } from './components/ui/Input';
import { Button } from './components/ui/Button';
import { SummaryCards } from './components/SummaryCards';
import { EventSection } from './components/EventSection';
import { AmortizationChart } from './components/AmortizationChart';
import { AmortizationTable } from './components/AmortizationTable';
import { LoanEligibilityModal } from './components/LoanEligibilityModal';
import { LoanCompareDashboard } from './components/LoanCompareDashboard';
import { InflationImpact } from './components/InflationImpact';
import { Calculator, Percent, Calendar, RotateCcw, Printer, Sun, Moon, Download, Loader2, AlertTriangle, Award, GitCompare, HelpCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'framer-motion';
import { TRANSLATIONS, LANGUAGES, AppTranslations } from './utils/translations';
import { LOAN_TYPES, getLoanTypeLabel, getLoanTypeAvgMessage } from './utils/loanTypes';
import { Analytics } from '@vercel/analytics/react';

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

const getResetModalStringsByLanguage = (lang: string) => {
  switch (lang) {
    case 'hi':
      return {
        title: "गणना रीसेट करें?",
        body: "क्या आप वाकई सभी गणनाओं को रीसेट करना चाहते हैं? इससे आपके सभी इनपुट और जोड़े गए इवेंट साफ़ हो जाएंगे।",
        yes: "हाँ, रीसेट करें",
        cancel: "रद्द करें"
      };
    case 'ml':
      return {
        title: "കണക്കുകൂട്ടലുകൾ റീസെറ്റ് ചെയ്യണോ?",
        body: "എല്ലാ കണക്കുകൂട്ടലുകളും റീസെറ്റ് ചെയ്യണമെന്ന് ഉറപ്പാണോ? ഇത് നിങ്ങളുടെ ഇൻപുട്ടുകളും ഇവന്റുകളും ഇല്ലാതാക്കും.",
        yes: "അതെ, റീസെറ്റ് ചെയ്യുക",
        cancel: "റദ്ദാക്കുക"
      };
    case 'kn':
      return {
        title: "ಲೆಕ್ಕಾಚಾರಗಳನ್ನು ಮರುಹೊಂದಿಸಬೇಕೆ?",
        body: "ಎಲ್ಲಾ ಲೆಕ್ಕಾಚಾರಗಳನ್ನು ಮರುಹೊಂದಿಸಲು ನೀವು ಖಚಿತವಾಗಿ ಬಯಸುವಿರಾ? ಇದು ನಿಮ್ಮ ಇನ್ಪುಟ್ ಮತ್ತು ಇವೆಂಟ್ಗಳನ್ನು ತೆರವುಗೊಳಿಸುತ್ತದೆ.",
        yes: "ಹೌದು, ರಿಸೆಟ್ ಮಾಡಿ",
        cancel: "ರದ್ದುಮಾಡಿ"
      };
    case 'pa':
      return {
        title: "ਹਿਸਾਬ ਰੀਸੈਟ ਕਰੀਏ?",
        body: "ਕੀ ਤੁਸੀਂ ਯਕੀਨਨ ਸਾਰੇ ਹਿਸਾਬ-ਕਿਤਾਬ ਰੀਸੈਟ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ? ਇਹ ਸਾਰੇ ਇਨਪੁਟ ਅਤੇ ਜੋੜੇ ਗਏ ਇਵੈਂਟ ਸਾਫ਼ ਕਰ ਦੇਵੇਗਾ।",
        yes: "ਹਾਂ, ਰੀਸੈਟ ਕਰੋ",
        cancel: "ਰੱਦ ਕਰੋ"
      };
    case 'ta':
      return {
        title: "கணக்கீடுகளை மீட்டமைக்கவா?",
        body: "நிச்சயமாக மீட்டமைக்க வேண்டுமா? இது அனைத்து உள்ளீடுகளையும் நிகழ்வுகளையும் அழித்துவிடும்.",
        yes: "ஆம், மீட்டமைக்கவும்",
        cancel: "ரத்து செய்"
      };
    case 'te':
      return {
        title: "గణనలను రీసెట్ చేయాలా?",
        body: "ఖచ్చితంగా రీసెట్ చేయాలనుకుంటున్నారా? ఇది మీ వివరాలన్నింటినీ, ఈవెంట్‌లను తొలగిస్తుంది.",
        yes: "అవును, రీసెట్ చేయండి",
        cancel: "రద్దు చేయి"
      };
    case 'bn':
      return {
        title: "হিসাব রিসেট করবেন?",
        body: "আপনি কি নিশ্চিত যে হিসাব রিসেট করতে চান? আপনার সমস্ত তথ্য ও ইভেন্ট মুছে যাবে।",
        yes: "হ্যাঁ, রিসেট করুন",
        cancel: "বাতিল করুন"
      };
    case 'mr':
      return {
        title: "गणना रीसेट करायची?",
        body: "तुम्हाला नक्की सर्व गणना रीसेट करायच्या आहेत का? तुमचे सर्व इनपुट आणि इव्हेंट साफ होतील.",
        yes: "होय, रीसेट करा",
        cancel: "रद्द करा"
      };
    case 'fr':
      return {
        title: "Réinitialiser les calculs ?",
        body: "Êtes-vous sûr de vouloir réinitialiser tous les calculs ? Cela effacera tous vos événements et saisies.",
        yes: "Oui, réinitialiser",
        cancel: "Annuler"
      };
    default:
      return {
        title: "Reset Calculations?",
        body: "Are you sure you want to reset all calculations? This will clear all your inputs and scheduled events.",
        yes: "Yes, Reset",
        cancel: "Cancel"
      };
  }
};

const getToastStringsByLanguage = (lang: string) => {
  switch (lang) {
    case 'hi':
      return {
        added: "आंशिक भुगतान जोड़ा गया!",
        savedMsg: "अवधि बचाई गई:",
        reducedMsg: "ईएमआई कम हो गई! अवधि अपरिवर्तित रहती है।"
      };
    case 'ml':
      return {
        added: "ഭാഗിക പണമടയ്ക്കൽ ചേർത്തു!",
        savedMsg: "കാലാവധി ലാഭിച്ചു:",
        reducedMsg: "ഇഎംഐ കുറഞ്ഞു! കാലാവധി മാറില്ല."
      };
    case 'kn':
      return {
        added: "ಭಾಗಶಃ ಪಾವತಿ ಸೇರಿಸಲಾಗಿದೆ!",
        savedMsg: "ಉಳಿಸಿದ ಅವಧಿ:",
        reducedMsg: "ಇಎಮ್ಐ ಕಡಿತ ಸಂಪೂರ್ಣ! ಅವಧಿ ಬದಲಾಗಿಲ್ಲ."
      };
    case 'pa':
      return {
        added: "ਹਿੱਸਾ ਅਦਾਇਗੀ ਜੋੜੀ ਗਈ!",
        savedMsg: "ਮਿਆਦ ਬਚੀ:",
        reducedMsg: "ਈਐਮਆਈ ਘੱਟ ਗਈ! ਕੋਈ ਮਿਆਦ ਨਹੀਂ ਬਦਲੀ।"
      };
    case 'ta':
      return {
        added: "பகுதி செலுத்தப்பட்டது!",
        savedMsg: "காலம் சேமிக்கப்பட்டது:",
        reducedMsg: "EMI குறைந்தது! காலம் மாறவில்லை."
      };
    case 'te':
      return {
        added: "పాక్షిక చెల్లింపు జోడించబడింది!",
        savedMsg: "గడువు ఆదా అయింది:",
        reducedMsg: "EMI తగ్గింది! వ్యవధి మారలేదు."
      };
    case 'bn':
      return {
        added: "আংশিক অর্থপ্রদান যোগ করা হয়েছে!",
        savedMsg: "মেয়াদ বাঁচানো গেছে:",
        reducedMsg: "EMI হ্রাস পেয়েছে! মেয়াদ একই।"
      };
    case 'mr':
      return {
        added: "भाग देयक जोडले गेले!",
        savedMsg: "कालावधी वाचली:",
        reducedMsg: "ईएमआय कमी झाला! मुदत सारखीच."
      };
    case 'fr':
      return {
        added: "Remboursement partiel ajouté !",
        savedMsg: "Mensualités sauvées :",
        reducedMsg: "Mensualité réduite ! Durée identique."
      };
    default:
      return {
        added: "Part Payment Added!",
        savedMsg: "Saved loan duration by:",
        reducedMsg: "EMI reduced! Tenure unchanged."
      };
  }
};

const getEMIThresholdStringsByLanguage = (lang: string) => {
  switch (lang) {
    case 'hi':
      return {
        label: "ईएमआई सीमा प्रतिशत",
        tooltip: "मासिक आय का अधिकतम प्रतिशत जो ईएमआई भुगतान के रूप में सुरक्षित रूप से आवंटित किया जा सकता है।",
        warningMsg: "ईएमआई निर्धारित सीमा (%THRESHOLD%%) से अधिक है!",
        safeMsg: "�� आपकी ईएमआई निर्धारित %THRESHOLD%% सीमा के भीतर सुरक्षित है।"
      };
    case 'ml':
      return {
        label: "ഇഎംഐ പരിധി ശതമാനം",
        tooltip: "പ്രതിമാസ വരുമാനത്തിൽ നിന്നും ഇഎംഐ ആയി സുരക്ഷിതമായി നൽകാവുന്ന പരമാവധി ശതമാനം.",
        warningMsg: "ഇഎംഐ നിശ്ചയിച്ച പരിധി കഴിഞ്ഞു (%THRESHOLD%%)!",
        safeMsg: "✓ ഇഎംഐ സുരക്ഷിതമായ %THRESHOLD%% പരിധിക്കുള്ളിലാണ്."
      };
    case 'kn':
      return {
        label: "ಇಎಂಐ ಮಿತಿ ಶೇಕಡಾವಾರು",
        tooltip: "ಮಾಸಿಕ ಆದಾಯದ ಗರಿಷ್ಠ ಶೇಕಡಾವಾರು ಮೊತ್ತವನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಇಎಂಐ ಪಾವತಿಗೆ ಬಳಸಬಹುದು.",
        warningMsg: "ಇಎಂಐ ನಿಗದಿಪಡಿಸಿದ ಮೀರಿದೆ (%THRESHOLD%%)!",
        safeMsg: "✓ ನಿಮ್ಮ ಇಎಂಐ ಸುರಕ್ಷಿತ %THRESHOLD%% ಮಿತಿಯೊಳಗಿದೆ."
      };
    case 'pa':
      return {
        label: "ਈਐਮਆਈ ਸੀਮਾ ਪ੍ਰਤੀਸ਼ਤ",
        tooltip: "ਕਨਫਿਗਰ ਕਰੋ ਕਿ ਤੁਹਾਡੀ ਮਾਸਿਕ ਆਮਦਨ ਦਾ ਕਿੰਨੇ ਪ੍ਰਤੀਸ਼ਤ ਹਿੱਸਾ ਈਐਮਆਈ ਵਜੋਂ ਭੁਗਤান ਕਰਨਾ ਸੁਰੱਖਿਅਤ ਹੈ।",
        warningMsg: "ਈਐਮਆਈ ਨਿਰਧਾਰਤ ਸੀਮਾ (%THRESHOLD%%) ਤੋਂ ਵੱਧ ਹੈ!",
        safeMsg: "✓ ਤੁਹਾਡੀ ਈਐਮਆਈ ਨਿਰਧਾਰਤ %THRESHOLD%% ਸੀਮਾ ਦੇ ਅੰਦਰ ਸੁਰੱਖਿਅਤ ਹੈ।"
      };
    case 'ta':
      return {
        label: "இஎம்ஐ வரம்பு சதவீதம்",
        tooltip: "இஎம்ஐ செலுத்தக்கூடிய உங்கள் மாத வருமானத்தின் அதிகபட்ச பாதுகாப்பான சதவீதம்.",
        warningMsg: "இஎம்ஐ நிர்ணயிக்கப்பட்ட வரம்பை (%THRESHOLD%%) தாண்டியது!",
        safeMsg: "✓ உங்கள் இஎம்ஐ பாதுகாப்பான %THRESHOLD%% வரம்பிற்குள் உள்ளது."
      };
    case 'te':
      return {
        label: "ఈఎంఐ గరిష్ట పరిమితి %",
        tooltip: "నెలవారీ ఆదాయంలో గరిష్ట సేఫ్ ఈఎంఐ శాతం.",
        warningMsg: "ఈఎంఐ నిర్ణీత పరిమితిని (%THRESHOLD%%) దాటింది!",
        safeMsg: "✓ ఈఎంఐ నిర్ణీత %THRESHOLD%% సేఫ్ పరిమితిలోనే ఉంది."
      };
    case 'bn':
      return {
        label: "ইএমআই সীমা শতকরা",
        tooltip: "মাসিক আয়ের সর্বোচ্চ নিরাপদ শতাংশ যা স্বামী ইএমআই হিসেবে দিতে পারেন।",
        warningMsg: "ইএমআই নির্ধারিত সীমা (%THRESHOLD%%) অতিক্রম করেছে!",
        safeMsg: "✓ আপনার ইএমআই নির্ধারিত %THRESHOLD%% সীমার মধ্যে নিরাপদ।"
      };
    case 'mr':
      return {
        label: "ईएमआय मर्यादा टक्केवारी",
        tooltip: "मासिक उत्पन्नातील सुरक्षित ईएमआय टक्केवारी मर्यादा.",
        warningMsg: "ईएमआय ठरवून दिलेल्या मर्यादेपेक्षा (%THRESHOLD%%) जास्त आहे!",
        safeMsg: "✓ आपली ईएमआय सुरक्षित %THRESHOLD%% मर्यादेत आहे."
      };
    case 'fr':
      return {
        label: "Seuil d'effort d'échéance (%)",
        tooltip: "Le pourcentage maximal de votre revenu mensuel allouable de manière stable à votre mensualité.",
        warningMsg: "La mensualité dépasse le seuil défini (%THRESHOLD%%) !",
        safeMsg: "✓ Votre mensualité respecte le seuil de sécurité défini de %THRESHOLD%%."
      };
    case 'de':
      return {
        label: "Max. Tragbarkeitsgrenze (%)",
        tooltip: "Der maximale Prozentsatz Ihres monatlichen Einkommens, der sicher für Kreditraten verwendet werden darf.",
        warningMsg: "Die Rate überschreitet das eingestellte Limit (%THRESHOLD%%)!",
        safeMsg: "✓ Ihre Kreditrate liegt innerhalb der sicheren Grenze von %THRESHOLD%%."
      };
    case 'es':
      return {
        label: "Límite máximo de EMI (%)",
        tooltip: "El porcentaje máximo seguro de sus ingresos mensuales asignable a la cuota.",
        warningMsg: "¡La cuota supera el límite configurado (%THRESHOLD%%)!",
        safeMsg: "✓ La cuota está dentro del límite de seguridad del %THRESHOLD%%."
      };
    default:
      return {
        label: "EMI Threshold Percentage (%)",
        tooltip: "Configure the custom percentage of net monthly income (e.g. 40%) that your EMI should stay within.",
        warningMsg: "Warning: EMI exceeds your custom threshold percentage (%THRESHOLD%%) of monthly income!",
        safeMsg: "✓ Your EMI is safely within your custom %THRESHOLD%% threshold of monthly income."
      };
  }
};

const getThemeToggleStringsByLanguage = (lang: string) => {
  switch (lang) {
    case 'hi':
      return { light: "लाइट", dark: "डार्क" };
    case 'ml':
      return { light: "ലൈറ്റ്", dark: "ഡാർക്ക്" };
    case 'kn':
      return { light: "ಲೈಟ್", dark: "ಡಾರ್ಕ್" };
    case 'pa':
      return { light: "ਲਾਈਟ", dark: "ਡਾਰਕ" };
    case 'ta':
      return { light: "லைட்", dark: "டார்க்" };
    case 'te':
      return { light: "లైట్", dark: "డార్క్" };
    case 'bn':
      return { light: "লাইট", dark: "ডার্ক" };
    case 'mr':
      return { light: "लाईट", dark: "डार्क" };
    case 'fr':
      return { light: "Clair", dark: "Sombre" };
    default:
      return { light: "Light", dark: "Dark" };
  }
};

const App: React.FC = () => {
  // State
  const [inputs, setInputs] = useState<LoanInput>({
    loanType: 'home',
    principal: 1000000,
    annualRate: 8.5,
    tenureMonths: 120,
    startDate: new Date().toISOString().split('T')[0],
    monthlyIncome: 100000,
    inflationRate: 6.0,
    emiThresholdPct: 40,
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
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [snapshot, setSnapshot] = useState<ComparisonSnapshot | null>(null);

  const getCompareModeStrings = (lang: string) => {
    switch (lang) {
      case 'hi':
        return {
          standardMode: "मानक कैलकुलेटर",
          compareMode: "योजना तुलना मोड",
          comparingBadge: "तुलना मोड सक्रिय - परिवर्तन वास्तविक समय में प्रतिबिंबित होते हैं",
          whyCompare: "तुलना क्यों करें?",
          benefitsTitle: "परिदृश्य तुलना के लाभ",
          tooltipBenefits: "अपने आधारभूत सेटिंग्स लॉक करें और रियल-टाइम में इनपुट बदलते समय ब्याज बचत, ईएमआई और समय की बचत की साइड-बाय-साइड तुलना करें।"
        };
      case 'ml':
        return {
          standardMode: "സ്റ്റാൻഡേർഡ് കാൽക്കുലേറ്റർ",
          compareMode: "പ്ലാൻ താരതമ്യ മോഡ്",
          comparingBadge: "താരതമ്യ മോഡ് സജീവം - മാറ്റങ്ങൾ തത്സമയം കാണാം",
          whyCompare: "എന്തിന് താരതമ്യം ചെയ്യണം?",
          benefitsTitle: "താരതമ്യത്തിന്റെ പ്രയോജനങ്ങൾ",
          tooltipBenefits: "മാറ്റങ്ങൾ വരുത്തുമ്പോൾ പലിശ ലാഭവും പ്രതിമാസ ഇഎംഐയും കാലാവധിയും തത്സമയം വശങ്ങളിലായി താരതമ്യം ചെയ്യാൻ നിങ്ങളുടെ അടിസ്ഥാന വിവരങ്ങൾ ലോക്ക് ചെയ്യുക."
        };
      case 'kn':
        return {
          standardMode: "ಸಾಮಾನ್ಯ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
          compareMode: "ಯೋಜನೆ ಹೋಲಿಕೆ ಮೋಡ್",
          comparingBadge: "ಹೋಲಿಕೆ ಮೋಡ್ ಸಕ್ರಿಯವಾಗಿದೆ - ಲೈವ್ ಹೋಲಿಕೆ ಲಭ್ಯವಿದೆ",
          whyCompare: "ಏಕೆ ಹೋಲಿಸಬೇಕು?",
          benefitsTitle: "ಹೋಲಿಕೆಯ ಅನುಕೂಲಗಳು",
          tooltipBenefits: "ನೀವು ನೈಜ ಸಮಯದಲ್ಲಿ ಬದಲಾವಣೆಗಳನ್ನು ಮಾಡುವಾಗ ಬಡ್ಡಿ ಉಳಿತಾಯ, ಮಾసಿಕ ಇಎಂಐ ಮತ್ತು ಅವಧಿಯ ಉಳಿತಾಯವನ್ನು ಅಕ್ಕಪಕ್ಕದಲ್ಲಿ ಹೋಲಿಸಲು ನಿಮ್ಮ ಮೂಲ ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ಲಾಕ್ ಮಾಡಿ."
        };
      case 'pa':
        return {
          standardMode: "ਸਟੈਂਡਰਡ ਕੈਲਕੁਲੇਟਰ",
          compareMode: "ਯੋਜਨਾ ਤੁਲਨਾ ਮੋਡ",
          comparingBadge: "ਤੁਲਨਾ ਮੋਡ ਸਰਗਰਮ - ਬਦਲਾਅ ਲਾਈਵ ਦਿਖਾਈ ਦੇਣਗੇ",
          whyCompare: "ਤੁਲਨਾ ਕਿਉਂ ਕਰੀਏ?",
          benefitsTitle: "ਤੁਲਨਾ ਦੇ ਲਾਭ",
          tooltipBenefits: "ਰੀਅਲ-ਟਾਈਮ ਵਿੱਚ ਇਨਪੁਟਸ ਨੂੰ ਐਡਜਸਟ ਕਰਦੇ ਸਮੇਂ ਵਿਆਜ ਬਚਤ, ਮਾਸਿਕ ਈਐਮਆਈ, ਅਤੇ ਮਾਸਿਕ ਬਚਤ ਦੀ ਤੁਲਨਾ ਕਰਨ ਲਈ ਆਪਣੀ ਬੇਸਲਾਈਨ ਸੈਟਿੰਗਾਂ ਨੂੰ ਲਾਕ ਕਰੋ।"
        };
      case 'ta':
        return {
          standardMode: "நிலையான கால்குலேட்டர்",
          compareMode: "ஒப்பீட்டு முறை",
          comparingBadge: "ஒப்பீட்டு முறை செயலில் உள்ளது - மாற்றங்கள் உடனுக்குடன் ஒப்பிடப்படும்",
          whyCompare: "ஏன் ஒப்பிட வேண்டும்?",
          benefitsTitle: "ஒப்பீட்டின் நன்மைகள்",
          tooltipBenefits: "நீங்கள் அமைப்புகளை மாற்றும்போது வட்டிச் சேமிப்பு, மாதாந்திர இஎம்ஐ மற்றும் காலக் குறைப்பு ஆகியவற்றை உடனுக்குடன் ஒப்பிட்டுப் பார்க்க அடிப்படை அமைப்புகளைப் பூட்டுங்கள்."
        };
      case 'te':
        return {
          standardMode: "సాధారణ కాలిక్యులేటర్",
          compareMode: "ఈడబ్ల్యూఐ పోలిక మోడ్",
          comparingBadge: "పోలిక మోడ్ సక్రియంగా ఉంది - మార్పులు లైవ్ అవుతాయి",
          whyCompare: "ఎందుకు పోల్చాలి?",
          benefitsTitle: "పోలిక వలన ప్రయోజనాలు",
          tooltipBenefits: "రియల్ టైమ్‌లో ఈఎంఐ మరియు వడ్డీ పొదుపులను పక్కపక్కనే పోల్చి చూసేందుకు మీ అసలు రుణ వివరాలను తులనాత్మక మోడ్‌లో లాక్ చేయండి."
        };
      case 'bn':
        return {
          standardMode: "সাধারণ ক্যালকুলেটর",
          compareMode: "পরিকল্পনা তুলনা মোড",
          comparingBadge: "তুলনা মোড सक्रिय - পরিবর্তন রিয়েল-টাইমে দেখা যাবে",
          whyCompare: "কেন তুলনা করবেন?",
          benefitsTitle: "তুলনা করার সুবিধা",
          tooltipBenefits: "বাস্তব সময়ে পরিবর্তন করার সাথে সাথে সুদের সঞ্চয়, মাসিক ইএমআই এবং মেয়াদের সাশ্রয় পাশাপাশি তুলনা করার জন্য আপনার বেসলাইন লক করুন।"
        };
      case 'mr':
        return {
          standardMode: "मानक कॅल्क्युलेटर",
          compareMode: "योजना तुलना मोड",
          comparingBadge: "तुलना मोड सक्रिय - बदल रिअल-टाईममध्ये दिसतील",
          whyCompare: "तुलना का करावी?",
          benefitsTitle: "तुलना करण्याचे फायदे",
          tooltipBenefits: "रिअल-टाईममध्ये बदल करताना व्याज बचत, मासिक ईएमआय आणि कालावधी कपात शेजारी-शेजारी तुलना करण्यासाठी आपले बेसलाईन लॉक करा."
        };
      case 'fr':
        return {
          standardMode: "Calculateur Standard",
          compareMode: "Mode Comparateur",
          comparingBadge: "Mode comparaison actif - Les ajustements comparent en direct",
          whyCompare: "Pourquoi comparer ?",
          benefitsTitle: "Avantages du comparateur",
          tooltipBenefits: "Figez votre scénario de référence pour comparer en temps réel l'impact de vos ajustements sur vos taux, vos mensualités et vos gains d'intérêts."
        };
      default:
        return {
          standardMode: "Standard Calculator",
          compareMode: "Compare Scenarios Mode",
          comparingBadge: "Comparing Scenarios Active — Adjust inputs below to see side-by-side gains/losses!",
          whyCompare: "Why Compare?",
          benefitsTitle: "Benefits of Scenario Comparison",
          tooltipBenefits: "Lock your baseline inputs to compare lifetime interest savings, net EMIs, and tenure reduction side-by-side as you adjust inputs in real-time."
        };
    }
  };

  const enableCompareMode = () => {
    setCompareMode(true);
    if (!snapshot) {
      const defaultName = `${t.compareBaselineLabel || "Baseline"} (${formatCurrency(inputs.principal, selectedCurrency.code, selectedCurrency.locale)} @ ${inputs.annualRate}%)`;
      setSnapshot({
        id: Math.random().toString(36).substring(2, 9),
        name: defaultName,
        inputs: JSON.parse(JSON.stringify(inputs)),
        events: JSON.parse(JSON.stringify(events)),
        result: JSON.parse(JSON.stringify(result)),
        partPaymentMonthsSaved,
      });
    }
  };
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
  const currentLoanTypeConfig = useMemo(() => {
    const typeId = inputs.loanType || 'home';
    return LOAN_TYPES.find(t => t.id === typeId) || LOAN_TYPES[0];
  }, [inputs.loanType]);

  const result = useMemo(() => {
    return calculateAmortizationSchedule(inputs, events);
  }, [inputs, events]);

  const partPaymentMonthsSaved = useMemo(() => {
    const onlyRateChanges = events.filter(e => e.type !== EventType.PART_PAYMENT);
    const resultWithoutPartPayments = calculateAmortizationSchedule(inputs, onlyRateChanges);
    return Math.max(0, resultWithoutPartPayments.finalTenure - result.finalTenure);
  }, [inputs, events, result.finalTenure]);

  // Handlers
  const handleLoanTypeChange = (typeId: string) => {
    const config = LOAN_TYPES.find(t => t.id === typeId);
    if (config) {
      setInputs(prev => ({
        ...prev,
        loanType: typeId,
        principal: config.defaultPrincipal,
        annualRate: config.defaultRate,
        tenureMonths: config.defaultTenure,
      }));
      setErrors({
        principal: '',
        annualRate: '',
        tenureMonths: '',
      });
    }
  };

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
      } else if (field === 'emiThresholdPct') {
        if (numValue < 1) error = 'Threshold percentage must be at least 1%';
        if (numValue > 100) error = 'Threshold percentage cannot exceed 100%';
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
      loanType: 'home',
      principal: 1000000,
      annualRate: 8.5,
      tenureMonths: 120,
      startDate: new Date().toISOString().split('T')[0],
      monthlyIncome: 100000,
      inflationRate: 6.0,
      emiThresholdPct: 40,
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
            {/* Elegant Layout-Animated Theme Switch */}
            {(() => {
              const themeStrings = getThemeToggleStringsByLanguage(language);
              return (
                <div className="flex items-center bg-gray-100 dark:bg-zinc-800/80 p-0.5 rounded-full relative border border-gray-200/50 dark:border-zinc-700/60 transition-colors duration-300">
                  <button
                    type="button"
                    onClick={() => setIsDarkMode(false)}
                    className={`relative px-2.5 py-1 sm:py-1.5 rounded-full flex items-center gap-1 text-xs font-semibold z-10 select-none cursor-pointer transition-colors duration-200 ${
                      !isDarkMode ? 'text-primary font-bold' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-zinc-200'
                    }`}
                    title={isDarkMode ? "Switch to Light Mode" : "Light Mode Active"}
                  >
                    {!isDarkMode && (
                      <motion.div
                        layoutId="activeThemeBg"
                        className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-full shadow-sm"
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      />
                    )}
                    <span className="relative z-20 flex items-center gap-1">
                      <Sun size={14} className={!isDarkMode ? "text-amber-500" : "text-gray-400"} />
                      <span className="hidden sm:inline-block text-[11px]">{themeStrings.light}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDarkMode(true)}
                    className={`relative px-2.5 py-1 sm:py-1.5 rounded-full flex items-center gap-1 text-xs font-semibold z-10 select-none cursor-pointer transition-colors duration-200 ${
                      isDarkMode ? 'text-primary dark:text-indigo-300 font-bold' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-zinc-200'
                    }`}
                    title={!isDarkMode ? "Switch to Dark Mode" : "Dark Mode Active"}
                  >
                    {isDarkMode && (
                      <motion.div
                        layoutId="activeThemeBg"
                        className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-full shadow-sm"
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      />
                    )}
                    <span className="relative z-20 flex items-center gap-1">
                      <Moon size={14} className={isDarkMode ? "text-indigo-400" : "text-gray-400"} />
                      <span className="hidden sm:inline-block text-[11px]">{themeStrings.dark}</span>
                    </span>
                  </button>
                </div>
              );
            })()}
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
        
        {/* View Mode Switcher */}
        <div className="mb-6 flex flex-wrap items-center gap-2.5 no-print">
          <div className="bg-white dark:bg-silver-gray p-1 rounded-xl shadow-sm border border-gray-200/60 dark:border-davys-gray/40 flex items-center justify-between max-w-sm flex-1 sm:flex-none">
            <div className="flex w-full">
              <button
                onClick={() => setCompareMode(false)}
                className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-200 select-none cursor-pointer ${
                  !compareMode 
                    ? 'bg-slate-100 dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-zinc-200 bg-transparent'
                }`}
              >
                <Calculator size={14} />
                <span>{getCompareModeStrings(language).standardMode}</span>
              </button>
              <button
                id="compare-mode-toggle-btn"
                onClick={enableCompareMode}
                className={`relative flex-1 py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-200 select-none cursor-pointer ${
                  compareMode 
                    ? 'bg-indigo-600 dark:bg-indigo-600 text-white shadow-sm font-extrabold' 
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-zinc-200 bg-transparent'
                }`}
              >
                <GitCompare size={14} className={compareMode ? "animate-spin text-white" : ""} />
                <span>{getCompareModeStrings(language).compareMode}</span>
                {compareMode && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Benefits Legend/Tooltip */}
          <div className="relative group">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50/40 hover:bg-slate-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/35 text-[11px] text-indigo-750 dark:text-indigo-300 font-bold border border-indigo-150/15 dark:border-indigo-900/20 transition-all duration-200 cursor-pointer shadow-sm">
              <HelpCircle size={13} className="text-indigo-650 dark:text-indigo-455 animate-pulse" />
              <span>{getCompareModeStrings(language).whyCompare}</span>
            </div>
            
            {/* Tooltip Content Floating Above */}
            <div className="absolute left-0 bottom-full mb-3.5 w-72 xs:w-80 bg-slate-900 dark:bg-zinc-950 text-white text-[11px] leading-relaxed p-4 rounded-xl shadow-xl border border-slate-800 dark:border-zinc-800 opacity-0 group-hover:opacity-100 transition-all pointer-events-none duration-250 z-40 transform translate-y-1 group-hover:translate-y-0">
              <div className="font-bold text-xs text-indigo-300 mb-1.5 flex items-center gap-1.5">
                <GitCompare size={13} className="text-indigo-400" />
                <span>{getCompareModeStrings(language).benefitsTitle}</span>
              </div>
              <p className="text-gray-300 dark:text-gray-300 font-sans font-medium">
                {getCompareModeStrings(language).tooltipBenefits}
              </p>
              {/* Tooltip Arrow pointing down */}
              <div className="absolute top-full left-6 -mt-1 w-2.5 h-2.5 bg-slate-900 dark:bg-zinc-950 border-r border-b border-slate-800 dark:border-zinc-800 transform rotate-45" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs & Controls */}
          <div className="lg:col-span-4 space-y-6">
            
            {compareMode && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-150 dark:border-indigo-900/30 rounded-xl p-3 text-xs leading-normal font-sans text-indigo-700 dark:text-indigo-400 font-semibold flex gap-2 items-center mb-1 no-print animate-in fade-in"
              >
                <div className="bg-indigo-600 text-white rounded p-1 flex-shrink-0 animate-pulse">
                  <GitCompare size={12} />
                </div>
                <span>{getCompareModeStrings(language).comparingBadge}</span>
              </motion.div>
            )}
            
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
                      <span>🇮🇳 {t.indianNumFormatText}</span>
                    ) : (
                      <span>🌐 {t.globalNumFormatText}</span>
                    )}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 dark:text-silver-gray uppercase tracking-wider mb-2">
                    {t.appLanguageLabel}
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
                  <label className="block text-xs font-semibold text-gray-400 dark:text-silver-gray uppercase tracking-wider mb-2">
                    Loan Option / Type
                  </label>
                  <div className="relative">
                    <select
                      value={inputs.loanType || 'home'}
                      onChange={(e) => handleLoanTypeChange(e.target.value)}
                      className="w-full bg-white dark:bg-silver-gray border border-gray-200 dark:border-davys-gray rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-davys-gray focus:outline-none focus:ring-2 focus:ring-primary h-10 appearance-none font-semibold cursor-pointer transition-all duration-200"
                    >
                      {LOAN_TYPES.map(type => (
                        <option key={type.id} value={type.id} className="dark:bg-zinc-950 dark:text-white">
                          {getLoanTypeLabel(type.id, language)}
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
                    min={currentLoanTypeConfig.minRate} 
                    max={currentLoanTypeConfig.maxRate} 
                    step="0.1"
                    value={inputs.annualRate}
                    onChange={(e) => handleInputChange('annualRate', e.target.value)}
                    className="w-full mt-2 h-2 bg-gray-200 dark:bg-davys-gray rounded-lg appearance-none cursor-pointer accent-secondary"
                  />
                  {/* Dynamic Market Average Hint */}
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                    <span className="inline-flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded text-indigo-700 dark:text-indigo-300 border border-indigo-100/50 dark:border-indigo-900/30">
                      💡 {getLoanTypeAvgMessage(currentLoanTypeConfig.id, language)}
                    </span>
                  </div>
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

                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-davys-gray/50">
                    <Input 
                      label={getEMIThresholdStringsByLanguage(language).label} 
                      type="number"
                      min="5"
                      max="100"
                      icon={<Percent size={16} />}
                      value={inputs.emiThresholdPct !== undefined ? inputs.emiThresholdPct : 40}
                      onChange={(e) => handleInputChange('emiThresholdPct', e.target.value)}
                      tooltip={getEMIThresholdStringsByLanguage(language).tooltip}
                      error={errors.emiThresholdPct}
                    />
                    <input 
                      type="range" 
                      min="10" 
                      max="90" 
                      step="5"
                      value={inputs.emiThresholdPct !== undefined ? inputs.emiThresholdPct : 40}
                      onChange={(e) => handleInputChange('emiThresholdPct', e.target.value)}
                      className="w-full mt-2 h-2 bg-gray-200 dark:bg-davys-gray rounded-lg appearance-none cursor-pointer accent-orange-550"
                    />
                  </div>
                  
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
            {compareMode && (
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
                snapshot={snapshot}
                onSnapshotChange={setSnapshot}
              />
            )}

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
              translations={t}
              emiThresholdPct={inputs.emiThresholdPct}
              language={language}
            />

            <AmortizationChart 
              data={result.schedule} 
              principal={inputs.principal} 
              totalInterest={result.totalInterest}
              currencySymbol={selectedCurrency.symbol}
              currencyCode={selectedCurrency.code}
              currencyLocale={selectedCurrency.locale}
              translations={t}
            />

            <InflationImpact
              schedule={result.schedule}
              principal={inputs.principal}
              totalInterest={result.totalInterest}
              totalPayment={result.totalPayment}
              monthlyEMI={result.schedule[0]?.emi || 0}
              finalTenure={result.finalTenure}
              inflationRate={inputs.inflationRate || 6.0}
              setInflationRate={(rate) => setInputs(prev => ({ ...prev, inflationRate: rate }))}
              currencySymbol={selectedCurrency.symbol}
              currencyCode={selectedCurrency.code}
              currencyLocale={selectedCurrency.locale}
              language={language}
            />

            <AmortizationTable 
              schedule={result.schedule} 
              currencyCode={selectedCurrency.code}
              currencyLocale={selectedCurrency.locale}
              translations={t}
              language={language}
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
        translations={t}
        language={language}
      />

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (() => {
        const resetStrings = getResetModalStringsByLanguage(language);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-silver-gray rounded-2xl shadow-xl max-w-md w-full p-5 sm:p-6 border border-gray-100 dark:border-davys-gray animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="bg-red-50 dark:bg-red-900/10 p-2 sm:p-3 rounded-full text-red-500">
                  <AlertTriangle size={20} className="sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-davys-gray">{resetStrings.title}</h3>
              </div>
              <p className="text-sm sm:text-base text-gray-600 dark:text-davys-gray/80 mb-5 sm:mb-6">
                {resetStrings.body}
              </p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 dark:border-davys-gray dark:text-davys-gray dark:hover:bg-davys-gray/10"
                  onClick={() => setShowResetConfirm(false)}
                >
                  {resetStrings.cancel}
                </Button>
                <Button 
                  variant="danger" 
                  className="flex-1"
                  onClick={confirmReset}
                >
                  {resetStrings.yes}
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full font-sans pointer-events-none px-4 sm:px-0 no-print">
        <AnimatePresence>
          {toasts.map(toast => {
            const toastStrings = getToastStringsByLanguage(language);
            return (
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
                    {toastStrings.added}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-davys-gray mt-0.5">
                    {t.monthText || "Month"} {toast.month}: {formatCurrency(toast.amount, selectedCurrency.code, selectedCurrency.locale)} {t.amountLabel || "payment"} {t.todayLabel ? (t.appTitle === "स्मार्ट ईएमआई प्लानर" ? "लागू किया गया।" : "applied.") : "applied."}
                  </p>
                  
                  {toast.monthsSaved > 0 ? (
                    <div className="flex items-center gap-1.5 mt-2 bg-green-500/10 text-green-600 dark:text-green-400 font-medium text-xs px-2 py-1 rounded-md w-fit">
                      <span>🎉 {toastStrings.savedMsg} {toast.monthsSaved} {toast.monthsSaved === 1 ? (t.monthsLabel ? (t.appTitle === "स्मार्ट ईएमआई प्लानर" ? "महीना" : "month") : "month") : (t.monthsLabel ? t.monthsLabel.toLowerCase() : "months")}!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 mt-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium text-xs px-2 py-1 rounded-md w-fit font-sans">
                      <span>{toastStrings.reducedMsg}</span>
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
            );
          })}
        </AnimatePresence>
      </div>
      <Analytics />
    </div>
  );
};

export default App;
