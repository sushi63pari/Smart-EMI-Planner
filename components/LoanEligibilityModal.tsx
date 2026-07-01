import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, Check, Award, ShieldAlert, Sparkles, Sliders } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { formatCurrency } from '../utils/calculations';
import { AppTranslations } from '../utils/translations';

interface LoanEligibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyIncome: number;
  annualRate: number;
  tenureMonths: number;
  currencySymbol: string;
  currencyCode: string;
  currencyLocale: string;
  onApplyPrincipal: (amount: number) => void;
  translations?: AppTranslations;
  language?: string;
}

const getEligibilityLocalStrings = (lang: string) => {
  switch (lang) {
    case 'hi':
      return {
        applicantDetailsHeader: "आवेदक का विवरण",
        applicantAgeLabel: "मुख्य आवेदक की आयु (वर्ष)",
        hasCoApplicantLabel: "सह-आवेदक शामिल करें?",
        coApplicantAgeLabel: "सह-आवेदक की आयु (वर्ष)",
        existingLoansHeader: "चल रहे ऋण की मासिक ईएमआई (बकाया देनदारियां)",
        homeLoanEmiLabel: "गृह ऋण ईएमआई",
        carLoanEmiLabel: "कार ऋण ईएमआई",
        jewelLoanEmiLabel: "स्वर्ण ऋण ईएमआई",
        mortgageLoanEmiLabel: "बंधक ऋण ईएमआई",
        otherLoanEmiLabel: "अन्य लंबित ईएमआई",
        ageImpactWarning: "आयु सीमा (65 वर्ष सेवानिवृत्ति) के कारण अधिकतम ऋण अवधि %LIMIT% महीनों तक सीमित है।",
        existingEmiImpact: "आपकी ऋण क्षमता में %EMI% (चल रहे कुल ईएमआई) की कटौती की गई है।",
        zeroEligibilityWarning: "चेतावनी: आपके चल रहे ऋणों की कुल ईएमआई आपकी स्वीकृत सीमा से अधिक है!",
        totalObligationsLabel: "कुल मासिक देनदारियां",
        netEligibleIncomeLabel: "प्रभावी मासिक आय"
      };
    case 'ml':
      return {
        applicantDetailsHeader: "അപേക്ഷകന്റെ വിവരങ്ങൾ",
        applicantAgeLabel: "പ്രധാന അപേക്ഷകന്റെ പ്രായം (വർഷം)",
        hasCoApplicantLabel: "സഹ-അപേക്ഷകനെ ഉൾപ്പെടുത്തണോ?",
        coApplicantAgeLabel: "സഹ-അപേക്ഷകന്റെ പ്രായം (വർഷം)",
        existingLoansHeader: "നിലവിലുള്ള പ്രതിമാസ ഇഎംഐ ബാധ്യതകൾ",
        homeLoanEmiLabel: "ഭവന വായ്പ ഇഎംഐ",
        carLoanEmiLabel: "കാർ വായ്പ ഇഎംഐ",
        jewelLoanEmiLabel: "സ്വർണ്ണ വായ്പ ഇഎംഐ",
        mortgageLoanEmiLabel: "മോർട്ട്ഗേജ് വായ്പ ഇഎംഐ",
        otherLoanEmiLabel: "മറ്റ് ഇഎംഐ ബാധ്യതകൾ",
        ageImpactWarning: "പ്രായം കണക്കിലെടുത്ത് വായ്പാ കാലാവധി %LIMIT% മാസങ്ങളായി പരിമിതപ്പെടുത്തിയിരിക്കുന്നു (വിരമിക്കൽ പ്രായം 65).",
        existingEmiImpact: "നിലവിലുള്ള ഇഎംഐകൾ കാരണം നിങ്ങളുടെ വായ്പാ ശേഷിയിൽ %EMI% കുറവ് വന്നിട്ടുണ്ട്.",
        zeroEligibilityWarning: "മുന്നറിയിപ്പ്: നിലവിലുള്ള ഇഎംഐകൾ അനുവദനീയമായ പരിധിയേക്കാൾ കൂടുതലാണ്!",
        totalObligationsLabel: "ആകെ മാസബാധ്യതകൾ",
        netEligibleIncomeLabel: "ഫലപ്രദമായ പ്രതിമാസ വരുമാനം"
      };
    case 'kn':
      return {
        applicantDetailsHeader: "ಅರ್ಜಿದಾರರ ವಿವರಗಳು",
        applicantAgeLabel: "ಮುಖ್ಯ ಅರ್ಜಿದಾರರ ವಯಸ್ಸು (ವರ್ಷಗಳು)",
        hasCoApplicantLabel: "ಸಹ-ಅರ್ಜಿದಾರರನ್ನು ಸೇರಿಸಬೇಕೆ?",
        coApplicantAgeLabel: "ಸಹ-ಅರ್ಜಿದಾರರ ವಯಸ್ಸು (ವರ್ಷಗಳು)",
        existingLoansHeader: "ಪ್ರಸ್ತುत ಚಾಲ್ತಿಯಲ್ಲಿರುವ ಸಾಲಗಳ ಮಾಸಿಕ ಇಎಂಐ",
        homeLoanEmiLabel: "ಗೃಹ ಸಾಲದ ಇಎಂಐ",
        carLoanEmiLabel: "ಕಾರು ಸಾಲದ ಇಎಂಐ",
        jewelLoanEmiLabel: "ಚಿನ್ನದ ಸಾಲದ ಇಎಂಐ",
        mortgageLoanEmiLabel: "ಅಡಮಾನ ಸಾಲದ ಇಎಂಐ",
        otherLoanEmiLabel: "ಇತರ ಬಾಕಿ ಇರುವ ಇಎಂಐಗಳು",
        ageImpactWarning: "ನಿವೃತ್ತಿ ವಯಸ್ಸಿನ (65) ಮಿತಿಯಿಂದಾಗಿ ಸಾಲದ ಅವಧಿಯನ್ನು %LIMIT% ತಿಂಗಳುಗಳಿಗೆ ಸೀಮಿತಗೊಳಿಸಲಾಗಿದೆ.",
        existingEmiImpact: "ಚಾಲ್ತಿಯಲ್ಲಿರುವ ಒಟ್ಟು ಇಎಂಐಗಳಿಂದ ನಿಮ್ಮ ಸಾಲದ ಸಾಮರ್ಥ್ಯವು %EMI% ನಷ್ಟು ಕಡಿಮೆಯಾಗಿದೆ.",
        zeroEligibilityWarning: "ಎಚ್ಚರಿಕೆ: ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಸಾಲಗಳ ಇಎಂಐ ಮೊತ್ತವು ಗರಿಷ್ಠ ಮಿತಿಗಿಂತ ಹೆಚ್ಚಾಗಿದೆ!",
        totalObligationsLabel: "ಒಟ್ಟು ಮಾಸಿಕ ಸಾಲಗಳು",
        netEligibleIncomeLabel: "ನಿವ್ವಳ ಅರ್ಹ ಆದಾಯ"
      };
    case 'ta':
      return {
        applicantDetailsHeader: "விண்ணப்பதாரர் விவரங்கள்",
        applicantAgeLabel: "முன்மை விண்ணப்பதாரர் வயது (ஆண்டுகள்)",
        hasCoApplicantLabel: "உடன் விண்ணப்பதாரரை சேர்க்கவா?",
        coApplicantAgeLabel: "உடன் விண்ணப்பதாரர் வயது (ஆண்டுகள்)",
        existingLoansHeader: "தற்போதுள்ள மாதாந்திர இஎம்ஐ கடன்கள்",
        homeLoanEmiLabel: "வீட்டுக்கடன் இஎம்ஐ",
        carLoanEmiLabel: "வாகனக்கடன் இஎம்ஐ",
        jewelLoanEmiLabel: "நகைக்கடன் இஎம்ஐ",
        mortgageLoanEmiLabel: "அடமானக் கடன் இஎம்ஐ",
        otherLoanEmiLabel: "இதர இஎம்ஐ கடன்கள்",
        ageImpactWarning: "விண்ணப்பதாரர் ஓய்வுபெறும் வயது (65) காரணமாக கடன் காலம் %LIMIT% மாதங்களாகக் குறைக்கப்பட்டுள்ளது.",
        existingEmiImpact: "தற்போதுள்ள கடன்களின் இஎம்ஐ தொகையால் உங்களின் கடன் தகுதி %EMI% குறைக்கப்பட்டுள்ளது.",
        zeroEligibilityWarning: "எச்சரிக்கை: உங்களின் தற்போதைய இஎம்ஐ அனுமதிக்கப்பட்ட அதிகபட்ச அளவைத் தாண்டியுள்ளது!",
        totalObligationsLabel: "மொத்த மாதாந்திர இஎம்ஐ",
        netEligibleIncomeLabel: "நிகர தகுதியான வருமானம்"
      };
    case 'te':
      return {
        applicantDetailsHeader: "దరఖాస్తుదారు వివరాలు",
        applicantAgeLabel: "ప్రధాన దరఖాస్తుదారు వయస్సు (సంవత్సరాలు)",
        hasCoApplicantLabel: "సహ-దరఖాస్తుదారుని చేర్చాలా?",
        coApplicantAgeLabel: "సహ-దరఖాస్తుదారుని వయస్సు (సంవత్సరాలు)",
        existingLoansHeader: "ప్రస్తుతం ఉన్న రుణాల నెలవారీ ఈఎంఐలు",
        homeLoanEmiLabel: "ఇంటి రుణం ఈఎంఐ",
        carLoanEmiLabel: "కారు రుణం ఈఎంఐ",
        jewelLoanEmiLabel: "బంగారు రుణం ఈఎంఐ",
        mortgageLoanEmiLabel: "మార్టిగేజ్ రుణం ఈఎంఐ",
        otherLoanEmiLabel: "ఇతర ఈఎంఐలు",
        ageImpactWarning: "రిటైర్మెంట్ వయస్సు (65) దృష్ట్యా మీ గరిష్ట రుణ కాలపరిమితి %LIMIT% నెలలకు పరిమితం చేయబడింది.",
        existingEmiImpact: "ప్రస్తుతం ఉన్న ఈఎంఐల వలన మీ కొత్త రుణ అర్హత %EMI% తగ్గించబడింది.",
        zeroEligibilityWarning: "హెచ్చరిక: ప్రస్తుతం ఉన్న మీ ఈఎంఐల మొత్తం గరిష్ట పరిమితిని మించిపోయింది!",
        totalObligationsLabel: "మొత్తం నెలవారీ ఈఎంఐలు",
        netEligibleIncomeLabel: "నికర దరఖాస్తు ఆదాయం"
      };
    case 'pa':
      return {
        applicantDetailsHeader: "ਬਿਨੈਕਾਰ ਦੇ ਵੇਰਵੇ",
        applicantAgeLabel: "ਮੁੱਖ ਬਿਨੈਕਾਰ ਦੀ ਉਮਰ (ਸਾਲ)",
        hasCoApplicantLabel: "ਸਹਿ-ਬਿਨੈਕਾਰ ਸ਼ਾਮਲ ਕਰੋ?",
        coApplicantAgeLabel: "ਸਹਿ-ਬਿਨੈਕਾਰ ਦੀ ਉਮਰ (ਸਾਲ)",
        existingLoansHeader: "ਮੌਜੂਦਾ ਮਾਸਿਕ EMI ਦੇਣਦਾਰੀਆਂ",
        homeLoanEmiLabel: "ਹੋਮ ਲੋਨ EMI",
        carLoanEmiLabel: "ਕਾਰ ਲੋਨ EMI",
        jewelLoanEmiLabel: "ਜਿਊਲਰੀ ਲੋਨ EMI",
        mortgageLoanEmiLabel: "ਮੋਰਟਗੇਜ ਲੋਨ EMI",
        otherLoanEmiLabel: "ਹੋਰ ਬਕਾਇਆ EMIs",
        ageImpactWarning: "ਉਮਰ ਸੀਮਾ (65 ਸਾਲ ਰਿਟਾਇਰਮੈਂਟ) ਕਾਰਨ ਕਰਜ਼ੇ ਦੀ ਮਿਆਦ %LIMIT% ਮਹੀਨਿਆਂ ਤੱਕ ਸੀਮਤ ਹੈ।",
        existingEmiImpact: "ਤੁਹਾਡੀ ਕਰਜ਼ਾ ਯੋਗਤਾ ਵਿੱਚ %EMI% (ਮੌਜੂਦਾ EMIs) ਦੀ ਕਟੌਤੀ ਕੀਤੀ ਗਈ ਹੈ।",
        zeroEligibilityWarning: "ਚੇਤਾਵਨੀ: ਤੁਹਾਡੀਆਂ ਮੌਜੂਦਾ EMIs ਦੀ ਕੁੱਲ ਰਕਮ ਮਨਜ਼ੂਰਸ਼ੁਦਾ ਸੀਮਾ ਤੋਂ ਵੱਧ ਹੈ!",
        totalObligationsLabel: "ਕੁੱਲ ਮਾਸਿਕ ਦੇਣਦਾਰੀਆਂ",
        netEligibleIncomeLabel: "ਪ੍ਰਭਾਵੀ ਮਾਸਿਕ ਆਮਦਨ"
      };
    case 'bn':
      return {
        applicantDetailsHeader: "আবেদনকারীর বিবরণ",
        applicantAgeLabel: "প্রধান আবেদনকারীর বয়স (বছর)",
        hasCoApplicantLabel: "সহ-আবেদনকারী যুক্ত করবেন?",
        coApplicantAgeLabel: "সহ-আবেদনকারীর বয়স (বছর)",
        existingLoansHeader: "বিদ্যমান মাসিক ইএমআই (বকেয়া ঋণসমূহ)",
        homeLoanEmiLabel: "গৃহ ঋণ ইএমআই",
        carLoanEmiLabel: "গাড়ি ঋণ ইএমআই",
        jewelLoanEmiLabel: "স্বর্ণ ঋণ ইএমআই",
        mortgageLoanEmiLabel: "মর্টগেজ ঋণ ইএমআই",
        otherLoanEmiLabel: "অন্যান্য চলমান ইএমআই",
        ageImpactWarning: "আবেদনকারীর বয়সসীমা (৬৫ বছর অবসর) বিবেচনায় ঋণের মেয়াদ %LIMIT% মাসের মধ্যে সীমাবদ্ধ করা হয়েছে।",
        existingEmiImpact: "আপনার বিদ্যমান ঋণ ইএমআই-এর কারণে নতুন ঋণযোগ্যতা %EMI% হ্রাস পেয়েছে।",
        zeroEligibilityWarning: "সতর্কতা: আপনার বিদ্যমান ঋণের মোট ইএমআই সর্বোচ্চ অনুমোদিত সীমার চেয়ে বেশি!",
        totalObligationsLabel: "মোট মাসিক ইএমআই",
        netEligibleIncomeLabel: "কার্যকর মাসিক আয়"
      };
    case 'mr':
      return {
        applicantDetailsHeader: "अर्जदाराचा तपशील",
        applicantAgeLabel: "मुख्य अर्जदाराचे वय (वर्षे)",
        hasCoApplicantLabel: "सह-अर्जदार समाविष्ट करायचा?",
        coApplicantAgeLabel: "सह-अर्जदाराचे वय (वर्षे)",
        existingLoansHeader: "चालू कर्जांचे मासिक ईएमआय (थकीत देणी)",
        homeLoanEmiLabel: "गृह कर्ज ईएमआय",
        carLoanEmiLabel: "कार कर्ज ईएमआय",
        jewelLoanEmiLabel: "सुवर्ण कर्ज ईएमआय",
        mortgageLoanEmiLabel: "तारण कर्ज ईएमआय",
        otherLoanEmiLabel: "इतर चालू ईएमआय",
        ageImpactWarning: "अर्जदाराच्या वयोमर्यादेमुळे (६५ वर्षे सेवानिवृत्ती) कर्जाचा कालावधी %LIMIT% महिन्यांपर्यंत मर्यादित केला आहे.",
        existingEmiImpact: "चालू ईएमआयमुळे आपल्या कर्ज पात्रतेत %EMI% घट झाली आहे.",
        zeroEligibilityWarning: "इशारा: आपली चालू कर्जांची एकूण मासिक ईएमआय रक्कम कमाल मर्यादेपेक्षा जास्त आहे!",
        totalObligationsLabel: "एकूण मासिक देणी",
        netEligibleIncomeLabel: "प्रभावी मासिक उत्पन्न"
      };
    case 'fr':
      return {
        applicantDetailsHeader: "Informations des co-emprunteurs",
        applicantAgeLabel: "Âge de l'emprunteur principal (ans)",
        hasCoApplicantLabel: "Ajouter un co-emprunteur ?",
        coApplicantAgeLabel: "Âge du co-emprunteur (ans)",
        existingLoansHeader: "Échéances mensuelles actuelles (engagements en cours)",
        homeLoanEmiLabel: "Échéance prêt immobilier",
        carLoanEmiLabel: "Échéance prêt auto",
        jewelLoanEmiLabel: "Échéance prêt sur gage / bijoux",
        mortgageLoanEmiLabel: "Échéance prêt hypothécaire",
        otherLoanEmiLabel: "Autres crédits en cours",
        ageImpactWarning: "La durée du prêt est limitée à %LIMIT% mois selon l'âge limite (retraite à 65 ans).",
        existingEmiImpact: "Votre capacité d'emprunt est réduite de %EMI% par vos charges d'emprunt existantes.",
        zeroEligibilityWarning: "Attention: Vos mensualités en cours dépassent votre capacité d'endettement maximale !",
        totalObligationsLabel: "Total charges mensuelles",
        netEligibleIncomeLabel: "Revenu mensuel effectif"
      };
    case 'de':
      return {
        applicantDetailsHeader: "Angaben zu den Antragstellern",
        applicantAgeLabel: "Alter des Hauptantragstellers (Jahre)",
        hasCoApplicantLabel: "Mitantragsteller hinzufügen?",
        coApplicantAgeLabel: "Alter des Mitantragstellers (Jahre)",
        existingLoansHeader: "Bestehende monatliche Raten (Verbindlichkeiten)",
        homeLoanEmiLabel: "Rate für Immobilienkredit",
        carLoanEmiLabel: "Rate für Autokredit",
        jewelLoanEmiLabel: "Rate für Schmuckkredit",
        mortgageLoanEmiLabel: "Rate für Hypothekendarlehen",
        otherLoanEmiLabel: "Sonstige laufende Kredite",
        ageImpactWarning: "Die Kreditlaufzeit ist altersbedingt auf %LIMIT% Monate begrenzt (Rentenalter 65).",
        existingEmiImpact: "Ihre Tragbarkeit verringert sich durch bestehende Kredite um %EMI%.",
        zeroEligibilityWarning: "Warnung: Ihre bestehenden Kreditraten überschreiten die zulässige Höchstgrenze!",
        totalObligationsLabel: "Gesamte monatliche Raten",
        netEligibleIncomeLabel: "Effektives monatliches Einkommen"
      };
    case 'es':
      return {
        applicantDetailsHeader: "Detalles del Solicitante",
        applicantAgeLabel: "Edad del solicitante principal (años)",
        hasCoApplicantLabel: "¿Incluir co-solicitante?",
        coApplicantAgeLabel: "Edad del co-solicitante (años)",
        existingLoansHeader: "Cuotas de préstamos existentes (obligaciones mensuales)",
        homeLoanEmiLabel: "Cuota préstamo hipotecario",
        carLoanEmiLabel: "Cuota préstamo automotriz",
        jewelLoanEmiLabel: "Cuota préstamo pignoraticio",
        mortgageLoanEmiLabel: "Cuota de hipoteca / otros bienes",
        otherLoanEmiLabel: "Otras cuotas pendientes",
        ageImpactWarning: "El plazo del préstamo se ha limitado a %LIMIT% meses según el límite de jubilación (65 años).",
        existingEmiImpact: "Su capacidad de préstamo se reduce en %EMI% por deudas existentes.",
        zeroEligibilityWarning: "Advertencia: ¡Sus cuotas mensuales existentes superan el límite de seguridad permitido!",
        totalObligationsLabel: "Total obligaciones mensuales",
        netEligibleIncomeLabel: "Ingreso mensual efectivo"
      };
    default:
      return {
        applicantDetailsHeader: "Applicant Details",
        applicantAgeLabel: "Primary Applicant Age (Years)",
        hasCoApplicantLabel: "Include Co-Applicant?",
        coApplicantAgeLabel: "Co-Applicant Age (Years)",
        existingLoansHeader: "Existing Monthly EMIs (Pending Obligations)",
        homeLoanEmiLabel: "Home Loan EMI",
        carLoanEmiLabel: "Car Loan EMI",
        jewelLoanEmiLabel: "Jewel Loan EMI",
        mortgageLoanEmiLabel: "Mortgage / LAP EMI",
        otherLoanEmiLabel: "Other Pending EMIs",
        ageImpactWarning: "Loan tenure capped at %LIMIT% months due to applicant(s) reaching maturity limit (65 years).",
        existingEmiImpact: "Your loan capacity is reduced by %EMI% of existing monthly obligations.",
        zeroEligibilityWarning: "Warning: Your existing monthly loan EMIs exceed your maximum safe EMI threshold!",
        totalObligationsLabel: "Total Monthly Obligations",
        netEligibleIncomeLabel: "Effective Monthly Income"
      };
  }
};

export const LoanEligibilityModal: React.FC<LoanEligibilityModalProps> = ({
  isOpen,
  onClose,
  monthlyIncome: initialMonthlyIncome,
  annualRate,
  tenureMonths,
  currencySymbol,
  currencyCode,
  currencyLocale,
  onApplyPrincipal,
  translations,
  language = 'en',
}) => {
  const [modalIncome, setModalIncome] = useState<number>(initialMonthlyIncome || 100000);
  const [multiplier, setMultiplier] = useState<number>(75);
  const [foirPct, setFoirPct] = useState<number>(40); // Standard 40% EMI-to-income ratio

  // New states for age criteria
  const [applicantAge, setApplicantAge] = useState<number>(30);
  const [hasCoApplicant, setHasCoApplicant] = useState<boolean>(false);
  const [coApplicantAge, setCoApplicantAge] = useState<number>(28);

  // New states for existing pending loans EMIs
  const [existingHomeEMI, setExistingHomeEMI] = useState<number>(0);
  const [existingCarEMI, setExistingCarEMI] = useState<number>(0);
  const [existingJewelEMI, setExistingJewelEMI] = useState<number>(0);
  const [existingMortgageEMI, setExistingMortgageEMI] = useState<number>(0);
  const [existingOtherEMI, setExistingOtherEMI] = useState<number>(0);

  // Recalculate if initialMonthlyIncome changes when reopened
  React.useEffect(() => {
    if (isOpen) {
      setModalIncome(initialMonthlyIncome || 100000);
    }
  }, [isOpen, initialMonthlyIncome]);

  const localStrings = getEligibilityLocalStrings(language);

  const totalExistingEMI = useMemo(() => {
    return existingHomeEMI + existingCarEMI + existingJewelEMI + existingMortgageEMI + existingOtherEMI;
  }, [existingHomeEMI, existingCarEMI, existingJewelEMI, existingMortgageEMI, existingOtherEMI]);

  const maxTenureAllowedMonths = useMemo(() => {
    const effectiveAge = hasCoApplicant ? Math.min(applicantAge, coApplicantAge) : applicantAge;
    // Banks cap tenure up to retirement/maturity age of 65 years
    return Math.max(12, (65 - effectiveAge) * 12);
  }, [applicantAge, hasCoApplicant, coApplicantAge]);

  // Calculations
  const calculatedByMultiplier = useMemo(() => {
    const effectiveIncome = Math.max(0, modalIncome - totalExistingEMI);
    return effectiveIncome * multiplier;
  }, [modalIncome, multiplier, totalExistingEMI]);

  const calculatedByFOIR = useMemo(() => {
    const maxEMIAllowed = (modalIncome * foirPct) / 100;
    const effectiveMaxEMIAllowed = Math.max(0, maxEMIAllowed - totalExistingEMI);
    const effectiveTenureMonths = Math.min(tenureMonths, maxTenureAllowedMonths);
    const r = annualRate / 12 / 100;
    const n = effectiveTenureMonths;

    if (r === 0) {
      return effectiveMaxEMIAllowed * n;
    }
    // P = EMI * ((1+r)^n - 1) / (r * (1+r)^n)
    const maxPrincipal = effectiveMaxEMIAllowed * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
    return Math.max(0, Math.floor(maxPrincipal));
  }, [modalIncome, foirPct, annualRate, tenureMonths, totalExistingEMI, maxTenureAllowedMonths]);

  const handleApply = (amount: number) => {
    onApplyPrincipal(amount);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          {/* Modal Backdrop click */}
          <div className="absolute inset-0" onClick={onClose} />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white dark:bg-silver-gray rounded-2xl shadow-xl max-w-2xl w-full p-6 sm:p-8 border border-gray-100 dark:border-davys-gray max-h-[90vh] overflow-y-auto custom-scrollbar no-print"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-davys-gray/40 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Award className="text-secondary" size={24} />
                  {translations?.eligibilityHeader || "Loan Eligibility Estimator"}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {translations?.eligibilitySubtitle || "Adjust parameters to view your borrowing potential based on net income metrics."}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 bg-gray-50 dark:bg-davys-gray/20 rounded-full"
                aria-label={translations?.closeLabel || "Close"}
              >
                <X size={18} />
              </button>
            </div>

            {/* Income Config */}
            <div className="bg-gray-50 dark:bg-smoke-gray/40 p-4 sm:p-5 rounded-xl border border-gray-100 dark:border-davys-gray/30 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    {translations?.netMonthlyIncomeLabel || "Net Monthly Income"}
                  </h4>
                  <div className="relative">
                    <input
                      type="number"
                      value={modalIncome || ''}
                      onChange={(e) => {
                        const val = Math.max(0, Number(e.target.value));
                        setModalIncome(val);
                      }}
                      className="w-full bg-white dark:bg-silver-gray border border-gray-200 dark:border-davys-gray rounded-lg pl-8 pr-3 py-2 text-sm text-gray-900 dark:text-davys-gray font-bold focus:outline-none focus:ring-2 focus:ring-primary h-10 transition-all"
                    />
                    <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-semibold text-gray-500 dark:text-davys-gray">
                      {currencySymbol}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500 dark:text-silver-gray mb-1 flex justify-between">
                    <span>{translations?.tweakIncomeLabel || "Tweak Income Fast"}</span>
                    <span className="font-bold text-primary">{formatCurrency(modalIncome, currencyCode, currencyLocale)}</span>
                  </label>
                  <input
                    type="range"
                    min="10000"
                    max="1000000"
                    step="5000"
                    value={modalIncome}
                    onChange={(e) => setModalIncome(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-davys-gray rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>
            </div>

            {/* New Criteria Section (Age & Existing Loans) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Left Column: Applicant & Co-Applicant Ages */}
              <div className="bg-slate-50/50 dark:bg-zinc-900/40 p-5 rounded-xl border border-gray-100 dark:border-davys-gray/30 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 dark:text-silver-gray uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <Sliders size={14} className="text-primary" />
                    {localStrings.applicantDetailsHeader}
                  </h4>

                  {/* Applicant Age */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 dark:text-silver-gray font-medium">
                        {localStrings.applicantAgeLabel}
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded">
                        {applicantAge}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="18"
                      max="75"
                      step="1"
                      value={applicantAge}
                      onChange={(e) => setApplicantAge(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 dark:bg-davys-gray rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  {/* Co-Applicant Toggle */}
                  <div className="flex items-center justify-between mb-4 mt-5 bg-white dark:bg-silver-gray/10 p-2.5 rounded-lg border border-gray-100 dark:border-davys-gray/20">
                    <label className="text-xs font-bold text-gray-750 dark:text-gray-300 cursor-pointer select-none" htmlFor="coapplicant-toggle">
                      {localStrings.hasCoApplicantLabel}
                    </label>
                    <input
                      id="coapplicant-toggle"
                      type="checkbox"
                      checked={hasCoApplicant}
                      onChange={(e) => setHasCoApplicant(e.target.checked)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer accent-primary"
                    />
                  </div>

                  {/* Co-Applicant Age */}
                  {hasCoApplicant && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 dark:text-silver-gray font-medium">
                          {localStrings.coApplicantAgeLabel}
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded">
                          {coApplicantAge}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="18"
                        max="75"
                        step="1"
                        value={coApplicantAge}
                        onChange={(e) => setCoApplicantAge(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 dark:bg-davys-gray rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </motion.div>
                  )}
                </div>

                {/* Tenure Cap Indicator */}
                {tenureMonths > maxTenureAllowedMonths && (
                  <div className="mt-4 p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-lg text-[10.5px] text-indigo-850 dark:text-indigo-300 font-sans leading-relaxed">
                    💡 {localStrings.ageImpactWarning.replace('%LIMIT%', String(maxTenureAllowedMonths))}
                  </div>
                )}
              </div>

              {/* Right Column: Existing EMIs */}
              <div className="bg-slate-50/50 dark:bg-zinc-900/40 p-5 rounded-xl border border-gray-100 dark:border-davys-gray/30">
                <h4 className="text-xs font-bold text-gray-400 dark:text-silver-gray uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-amber-500" />
                  {localStrings.existingLoansHeader}
                </h4>

                <div className="space-y-2.5">
                  {/* Home Loan EMI */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-gray-500 dark:text-silver-gray w-24 flex-shrink-0">
                      {localStrings.homeLoanEmiLabel}
                    </span>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="0"
                        value={existingHomeEMI || ''}
                        onChange={(e) => setExistingHomeEMI(Math.max(0, Number(e.target.value)))}
                        placeholder="0"
                        className="w-full bg-white dark:bg-silver-gray border border-gray-200 dark:border-davys-gray rounded-lg pl-7 pr-3 py-1 text-xs text-gray-900 dark:text-davys-gray font-semibold focus:outline-none focus:ring-1 focus:ring-primary h-8 transition-all"
                      />
                      <div className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-xs font-semibold text-gray-500 dark:text-davys-gray">
                        {currencySymbol}
                      </div>
                    </div>
                  </div>

                  {/* Car Loan EMI */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-gray-500 dark:text-silver-gray w-24 flex-shrink-0">
                      {localStrings.carLoanEmiLabel}
                    </span>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="0"
                        value={existingCarEMI || ''}
                        onChange={(e) => setExistingCarEMI(Math.max(0, Number(e.target.value)))}
                        placeholder="0"
                        className="w-full bg-white dark:bg-silver-gray border border-gray-200 dark:border-davys-gray rounded-lg pl-7 pr-3 py-1 text-xs text-gray-900 dark:text-davys-gray font-semibold focus:outline-none focus:ring-1 focus:ring-primary h-8 transition-all"
                      />
                      <div className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-xs font-semibold text-gray-500 dark:text-davys-gray">
                        {currencySymbol}
                      </div>
                    </div>
                  </div>

                  {/* Jewel Loan EMI */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-gray-500 dark:text-silver-gray w-24 flex-shrink-0">
                      {localStrings.jewelLoanEmiLabel}
                    </span>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="0"
                        value={existingJewelEMI || ''}
                        onChange={(e) => setExistingJewelEMI(Math.max(0, Number(e.target.value)))}
                        placeholder="0"
                        className="w-full bg-white dark:bg-silver-gray border border-gray-200 dark:border-davys-gray rounded-lg pl-7 pr-3 py-1 text-xs text-gray-900 dark:text-davys-gray font-semibold focus:outline-none focus:ring-1 focus:ring-primary h-8 transition-all"
                      />
                      <div className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-xs font-semibold text-gray-500 dark:text-davys-gray">
                        {currencySymbol}
                      </div>
                    </div>
                  </div>

                  {/* Mortgage Loan EMI */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-gray-500 dark:text-silver-gray w-24 flex-shrink-0">
                      {localStrings.mortgageLoanEmiLabel}
                    </span>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="0"
                        value={existingMortgageEMI || ''}
                        onChange={(e) => setExistingMortgageEMI(Math.max(0, Number(e.target.value)))}
                        placeholder="0"
                        className="w-full bg-white dark:bg-silver-gray border border-gray-200 dark:border-davys-gray rounded-lg pl-7 pr-3 py-1 text-xs text-gray-900 dark:text-davys-gray font-semibold focus:outline-none focus:ring-1 focus:ring-primary h-8 transition-all"
                      />
                      <div className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-xs font-semibold text-gray-500 dark:text-davys-gray">
                        {currencySymbol}
                      </div>
                    </div>
                  </div>

                  {/* Other Loan EMI */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-gray-500 dark:text-silver-gray w-24 flex-shrink-0">
                      {localStrings.otherLoanEmiLabel}
                    </span>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="0"
                        value={existingOtherEMI || ''}
                        onChange={(e) => setExistingOtherEMI(Math.max(0, Number(e.target.value)))}
                        placeholder="0"
                        className="w-full bg-white dark:bg-silver-gray border border-gray-200 dark:border-davys-gray rounded-lg pl-7 pr-3 py-1 text-xs text-gray-900 dark:text-davys-gray font-semibold focus:outline-none focus:ring-1 focus:ring-primary h-8 transition-all"
                      />
                      <div className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-xs font-semibold text-gray-500 dark:text-davys-gray">
                        {currencySymbol}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Obligations Indicator */}
                {totalExistingEMI > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-150 dark:border-davys-gray/40 flex justify-between items-center text-xs">
                    <span className="text-gray-500 dark:text-silver-gray font-bold">
                      {localStrings.totalObligationsLabel}:
                    </span>
                    <span className="font-extrabold text-red-500 dark:text-red-400">
                      {formatCurrency(totalExistingEMI, currencyCode, currencyLocale)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Live Impact/Warnings Display */}
            {totalExistingEMI >= (modalIncome * foirPct / 100) && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-150 dark:border-red-900/30 rounded-xl text-xs text-red-800 dark:text-red-300 font-bold flex items-center gap-2 animate-pulse">
                ⚠️ {localStrings.zeroEligibilityWarning}
              </div>
            )}

            {totalExistingEMI > 0 && totalExistingEMI < (modalIncome * foirPct / 100) && (
              <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-150 dark:border-amber-900/30 rounded-xl text-xs text-amber-850 dark:text-amber-300 font-medium leading-relaxed">
                ℹ️ {localStrings.existingEmiImpact.replace('%EMI%', formatCurrency(totalExistingEMI, currencyCode, currencyLocale))}
              </div>
            )}

            {/* Methods Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              
              {/* Method A: Multiplier Rule */}
              <div className="border border-gray-100 dark:border-davys-gray rounded-xl p-5 bg-white dark:bg-silver-gray flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-3 border-b border-gray-50 dark:border-davys-gray/20 pb-2">
                    <span className="text-[11px] font-bold text-secondary dark:text-teal-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles size={12} />
                      {translations?.multiplierRuleLabel || "Multiplier Rule"}
                    </span>
                    <span className="text-xs font-semibold text-gray-400">{translations?.ruleOfThumbLabel || "Rule of Thumb"}</span>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-davys-gray mb-4 leading-normal">
                    {translations?.multiplierExplanation || "Banks often approve home/personal loans equal to a fixed multiple (60x to 75x) of your stable net salary."}
                  </p>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Sliders size={12} /> {translations?.multiplierLimitLabel || "Multiplier Limit:"}
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white bg-slate-100 dark:bg-davys-gray px-2 py-0.5 rounded">
                        {multiplier}x {translations?.netMonthlyIncomeLabel || "Net Income"}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="100"
                      step="5"
                      value={multiplier}
                      onChange={(e) => setMultiplier(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 dark:bg-davys-gray rounded-lg appearance-none cursor-pointer accent-secondary"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-davys-gray/40">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{translations?.checkEligibilityBtn || "Eligible Loan Amount"}</div>
                  <div className="text-2xl font-black text-secondary tracking-tight">
                    {formatCurrency(calculatedByMultiplier, currencyCode, currencyLocale)}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full mt-4 font-bold text-xs rounded-lg h-9"
                    onClick={() => handleApply(calculatedByMultiplier)}
                  >
                    {translations?.usableMultiplierPlanBtn || "Use Multiplier Plan"}
                  </Button>
                </div>
              </div>

              {/* Method B: Net EMI Power (FOIR Rule) */}
              <div className="border border-gray-100 dark:border-davys-gray rounded-xl p-5 bg-white dark:bg-silver-gray flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-3 border-b border-gray-50 dark:border-davys-gray/20 pb-2">
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                      <ShieldAlert size={12} />
                      {translations?.foirModelLabel || "FOIR / EMI Model"}
                    </span>
                    <span className="text-xs font-semibold text-gray-400">{translations?.strictCapacityLabel || "Strict Capacity"}</span>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-davys-gray mb-4 leading-normal">
                    {translations?.foirExplanation || "Limits your maximum monthly EMI instalment to a safe percentage (e.g. 40% to 50%) of your stable income."}
                  </p>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Sliders size={12} /> {translations?.maxEmiCapLabel || "Max EMI % Cap:"}
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white bg-slate-100 dark:bg-davys-gray px-2 py-0.5 rounded">
                        {foirPct}% ({translations?.currentEMILabel || "Max EMI"}: {formatCurrency((modalIncome * foirPct) / 100, currencyCode, currencyLocale)})
                      </span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="60"
                      step="5"
                      value={foirPct}
                      onChange={(e) => setFoirPct(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 dark:bg-davys-gray rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-davys-gray/40">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                    {translations?.checkEligibilityBtn || "Eligible Loan"} ({annualRate}% {translations?.interestRateLabel || "rate"} & {tenureMonths}{translations?.monthSuffix || "m"} {translations?.tenureMonthsLabel || "tenure"})
                  </div>
                  <div className="text-2xl font-black text-primary tracking-tight dark:text-indigo-400">
                    {formatCurrency(calculatedByFOIR, currencyCode, currencyLocale)}
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full mt-4 font-bold text-xs rounded-lg h-9 bg-primary dark:bg-indigo-600"
                    onClick={() => handleApply(calculatedByFOIR)}
                  >
                    {translations?.usableFoirPlanBtn || "Use FOIR Capacity Plan"}
                  </Button>
                </div>
              </div>

            </div>

            {/* Note Panel */}
            <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/15 flex gap-3 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
              <HelpCircle size={18} className="flex-shrink-0 text-amber-500 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 dark:text-amber-200 mb-1">{translations?.safetyGuidelinesLabel || "Financial Safety Guidelines:"}</p>
                <p>
                  {translations?.safetyGuidelinesText || "While a 75x Net Income multiplier is widely used by banks to estimate absolute eligibility boundaries, the FOIR / EMI Model represents a more durable financial limit. It ensures that your remaining income easily covers standard operational living costs, and emergency financial events."}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
