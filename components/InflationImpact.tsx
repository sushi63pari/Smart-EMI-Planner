import React, { useMemo } from 'react';
import { ScheduleItem } from '../types';
import { motion } from 'framer-motion';
import { formatCurrency } from '../utils/calculations';
import { TrendingDown, HelpCircle, Flame, ArrowDownRight, Sparkles, DollarSign } from 'lucide-react';
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, Legend } from 'recharts';

interface InflationImpactProps {
  schedule: ScheduleItem[];
  principal: number;
  totalInterest: number;
  totalPayment: number;
  monthlyEMI: number;
  finalTenure: number;
  inflationRate: number;
  setInflationRate: (rate: number) => void;
  currencySymbol: string;
  currencyCode: string;
  currencyLocale: string;
  language: string;
}

const getInflationTranslationsByLang = (lang: string) => {
  switch (lang) {
    case 'hi':
      return {
        title: "मुद्रास्फीति प्रभाव (Inflation Impact)",
        desc: "मुद्रास्फीति समय के साथ धन के मूल्य को कम करती है। चूंकि आपका मासिक EMI स्थिर रहता है, समय बीतने के साथ इसका 'वास्तविक बोझ' काफी कम हो जाता है।",
        inflationRateLabel: "अनुमानित वार्षिक मुद्रास्फीति",
        nominalTotalLabel: "कुल अंकित भुगतान",
        realTotalLabel: "वास्तविक भुगतान (आज के मूल्य में)",
        interestCostRealLabel: "वास्तविक ब्याज लागत",
        erosionTitle: "ईएमआई क्रय शक्ति में गिरावट",
        initialEmiLabel: "शुरुआती ईएमआई बोझ",
        endingEmiLabel: "अंतिम ईएमआई 'वास्तविक' बोझ",
        savingValueLabel: "मुद्रास्फीति से गुप्त बचत",
        explanationTitle: "यह खरीदार के लिए कैसे काम करता है?",
        explanationDesc: "दशकों लंबे ऋण में, मुद्रास्फीति आपका अदृश्य मित्र है। यदि वार्षिक मुद्रास्फीति {rate}% है, तो आज का {symbol}10,000 भुगतान {years} साल बाद केवल {symbol}{feel} मूल्य महसूस होगा। आप आज के महंगे धन से घर खरीदते हैं लेकिन उसका भुगतान कल की कमजोर मुद्रा से करते हैं!",
        realCostLowMsg: "बधाई हो! आपकी वास्तविक ब्याज लागत अंकित ब्याज की तुलना में बहुत कम है।",
        chartTitle: "ईएमआई का घटता हुआ वास्तविक बोझ",
        nominalEmiLabel: "अंकित ईएमआई (Nominal EMI)",
        realEmiLabel: "वास्तविक ईएमआई (Real EMI)",
        monthLabel: "महीना"
      };
    case 'ta':
      return {
        title: "பணவீக்கத்தின் தாக்கம் (Inflation Impact)",
        desc: "பணவீக்கம் காலப்போக்கில் பணத்தின் மதிப்பை குறைக்கிறது. உங்கள் மாத இஎம்ஐ மாறாமல் இருப்பதால், அதன் 'உண்மையான சுமை' காலப்போக்கில் கணிசமாகக் குறைகிறது.",
        inflationRateLabel: "மதிப்பிடப்பட்ட ஆண்டு பணவீக்கம்",
        nominalTotalLabel: "பெயரளவு மொத்தக் கட்டணம்",
        realTotalLabel: "உண்மையான கட்டணம் (இன்றைய மதிப்பில்)",
        interestCostRealLabel: "உண்மையான வட்டிச் செலவு",
        erosionTitle: "இஎம்ஐ வாங்கும் திறன் வீழ்ச்சி",
        initialEmiLabel: "ஆரம்ப இஎம்ஐ சுமை",
        endingEmiLabel: "இறுதி இஎம்ஐ 'உண்மையான' சுமை",
        savingValueLabel: "பணவீக்கத்தால் மறைமுக சேમીப்பு",
        explanationTitle: "இது கடன் வாங்குபவருக்கு எவ்வாறு உதவுகிறது?",
        explanationDesc: "பல வருடக் கடன்களில், பணவீக்கம் உங்களின் கண்ணுக்குத் தெரியாத நண்பர். வருடாந்திர பணவீக்கம் {rate}% ஆக இருந்தால், இன்றைய {symbol}10,000 கட்டணம் {years} ஆண்டுகளுக்குப் பிறகு வெறும் {symbol}{feel}-ஆகவே உணரப்படும். இன்றைய அதிக மதிப்புள்ள பணத்தில் வாங்கும் வீட்டிற்கு, நாளைய குறைந்த மதிப்புள்ள பணத்தில் தவணை செலுத்துகிறீர்கள்!",
        realCostLowMsg: "வாழ்த்துக்கள்! உங்கள் உண்மையான வட்டிச் செலவு பெயரளவு வட்டியைக் காட்டிலும் மிகக் குறைவு.",
        chartTitle: "மாத இஎம்ஐ-யின் சுருங்கும் உண்மையான சுமை",
        nominalEmiLabel: "பெயரளவு இஎம்ஐ",
        realEmiLabel: "உண்மையான இഎംഐ",
        monthLabel: "மாதம்"
      };
    case 'te':
      return {
        title: "ద్రవ్యోల్బణం ప్రభావం (Inflation Impact)",
        desc: "ద్రవ్యోల్బణం కాలక్రమేణా డబ్బు విలువను తగ్గిస్తుంది. మీ నెలవారీ ఈఎంఐ స్థిరంగా ఉన్నందున, దాని 'నిజమైన భారం' క్రమంగా తగ్గుతుంది.",
        inflationRateLabel: "అంచనా వేసిన వార్షిక ద్రవ్యోల్బణం",
        nominalTotalLabel: "మొత్తం నామమాత్రపు చెల్లింపు",
        realTotalLabel: "నిజమైన చెల్లింపు (నేటి విలువలో)",
        interestCostRealLabel: "నిజమైన వడ్ディー ఖర్చు",
        erosionTitle: "ఈఎంఐ కొనుగోలు శక్తి క్షీణత",
        initialEmiLabel: "ప్రారంభ ఈఎంఐ భారం",
        endingEmiLabel: "చివరి ఈఎంఐ 'నిజమైన' భారం",
        savingValueLabel: "ద్రవ్యోల్బణంతో గుప్త పొదుపు",
        explanationTitle: "ఇది రుణగ్రహీతకు ఎలా సహాయపడుతుంది?",
        explanationDesc: "దశాబ్దాల సుదీర్ఘ రుణంలో, ద్రవ్యోల్బణం మీ అదృశ్య మిత్రుడు. వార్షిక ద్రవ్యోల్బణం {rate}% ఉంటే, నేటి {symbol}10,000 చెల్లింపు {years} సంవత్సరాల తర్వాత కేవలం {symbol}{feel} విలువగా అనిపిస్తుంది. మీరు నేటి ఖరీదైన డబ్బుతో ఆస్తి కొని, రేపటి బలహీనమైన డబ్బుతో తిరిగి చెల్లిస్తున్నారు!",
        realCostLowMsg: "అభినందనలు! మీ నిజమైన వడ్డీ ఖర్చు నామమాత్రపు వడ్డీ కంటే చాలా తక్కువగా ఉంది.",
        chartTitle: "ఈఎంఐ తగ్గుతున్న నిజమైన భారం",
        nominalEmiLabel: "నామమాత్రపు ఈఎంఐ",
        realEmiLabel: "నిజమైన ఈఎంఐ",
        monthLabel: "నెల"
      };
    case 'ml':
      return {
        title: "പണപ്പെരുപ്പത്തിന്റെ സ്വാധീനം (Inflation Impact)",
        desc: "പണപ്പെരുപ്പം കാലക്രമേണ പണത്തിന്റെ മൂല്യം കുറയ്ക്കുന്നു. നിങ്ങളുടെ പ്രതിമാസ ഇഎംഐ സ്ഥിരമായിരിക്കുന്നതിനാൽ, അതിന്റെ 'യഥാർത്ഥ ഭാരം' ക്രമേണ കുറയുന്നു.",
        inflationRateLabel: "പ്രതീക്ഷിക്കുന്ന വാർഷിക പണപ്പെരുപ്പം",
        nominalTotalLabel: "നാമമാത്രമായ ആകെ തിരിച്ചടവ്",
        realTotalLabel: "യഥാർത്ഥ തിരിച്ചടവ് (ഇന്നത്തെ മൂല്യത്തിൽ)",
        interestCostRealLabel: "യഥാർത്ഥ പലിശ ചിലവ്",
        erosionTitle: "ഇഎംഐ വാങ്ങൽ ശേഷിയിലെ ഇടിവ്",
        initialEmiLabel: "ആദ്യ ഇഎംഐ ഭാരം",
        endingEmiLabel: "അവസാന ഇഎംഐ 'യഥാർത്ഥ' ഭാരം",
        savingValueLabel: "പണപ്പെരുപ്പം മൂലമുള്ള ലാഭം",
        explanationTitle: "ഇത് കടം വാങ്ങുന്നയാൾക്ക് എങ്ങനെ ഗുണകരമാകുന്നു?",
        explanationDesc: "വർഷങ്ങളോളം നീളുന്ന ലോണുകളിൽ, പണപ്പെരുപ്പം നിങ്ങളുടെ അദൃശ്യ സുഹൃത്താണ്. വാർഷിക പണപ്പെരുപ്പം {rate}% ആണെങ്കിൽ, ഇന്നത്തെ {symbol}10,000 അടവ് {years} വർഷങ്ങൾക്ക് ശേഷം വെറും {symbol}{feel} മൂല്യമേ വരൂ. ഇന്നത്തെ കൂടിയ മൂല്യമുള്ള പണവുമായി വീട് വാങ്ങുമ്പോൾ, നാളത്തെ കുറഞ്ഞ മൂല്യമുള്ള പണത്തിലാണ് നിങ്ങൾ അടവ് തീർക്കുന്നത്!",
        realCostLowMsg: "അഭിനന്ദനങ്ങൾ! നിങ്ങളുടെ യഥാർത്ഥ പലിശ ചിലവ് നാമമാത്ര പലിശയേക്കാൾ വളരെ കുറവാണ്.",
        chartTitle: "ഇഎംഐയുടെ കുറയുന്ന യഥാർത്ഥ ഭാരം",
        nominalEmiLabel: "നാമമാത്ര ഇഎംഐ",
        realEmiLabel: "യഥാർത്ഥ ഇഎംഐ",
        monthLabel: "മാസം"
      };
    case 'kn':
      return {
        title: "ಹಣದುಬ್ಬರದ ಪ್ರಭಾವ (Inflation Impact)",
        desc: "ಹಣದುಬ್ಬರವು ಕಾಲಾನಂತರದಲ್ಲಿ ಹಣದ ಮೌಲ್ಯವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ. ನಿಮ್ಮ ಮಾಸಿಕ ಇಎಂಐ ಸ್ಥಿರವಾಗಿರುವುದರಿಂದ, ಅದರ 'ನಿಜವಾದ ಹೊರೆ' ಕ್ರಮೇಣ ಕಡಿಮೆಯಾಗುತ್ತದೆ.",
        inflationRateLabel: "ಅಂದಾಜು ವಾರ್ಷಿಕ ಹಣದುಬ್ಬರ",
        nominalTotalLabel: "ನಾಮಮಾತ್ರದ ಒಟ್ಟು ಪಾವತಿ",
        realTotalLabel: "ನಿಜವಾದ ಪಾವತಿ (ಇಂದಿನ ಮೌಲ್ಯದಲ್ಲಿ)",
        interestCostRealLabel: "ನಿಜವಾದ ಬಡ್ಡಿ ವೆಚ್ಚ",
        erosionTitle: "ಇಎಂಐ ಖರೀದಿ ಸಾಮರ್ಥ್ಯ ಕುಸಿತ",
        initialEmiLabel: "ಆರಂಭದ ಇಎಂಐ ಹೊರೆ",
        endingEmiLabel: "ಕೊನೆಯ ಇಎಂಐ 'ನಿಜವಾದ' ಹೊರೆ",
        savingValueLabel: "ಹಣದುಬ್ಬರದಿಂದಾದ ಗುಪ್ತ ಉಳಿತಾಯ",
        explanationTitle: "ಇದು ಸಾಲಗಾರನಿಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ?",
        explanationDesc: "ದಶಕಗಳ ಸಾಲದಲ್ಲಿ, ಹಣದುಬ್ಬರವು ನಿಮ್ಮ ಅದೃಶ್ಯ ಸ್ನೇಹಿತ. ವಾರ್ಷಿಕ ಹಣದುಬ್ಬರ {rate}% ಆಗಿದ್ದರೆ, ಇಂದಿನ {symbol}10,000 ಪಾವತಿಯು {years} ವರ್ಷಗಳ ನಂತರ ಕೇವಲ {symbol}{feel} ಮೌಲ್ಯದಷ್ಟಿರುತ್ತದೆ. ನೀವು ಇಂದು ಬೆಲೆಬಾಳುವ ಹಣದಲ್ಲಿ ಮನೆ ಖರೀದಿಸಿ, ನಾಳೆ ದಿನಗಳಲ್ಲಿ ದುರ್ಬಲಗೊಳ್ಳುವ ಹಣದಲ್ಲಿ ಮರುಪಾವತಿಸುತ್ತಿದ್ದೀರಿ!",
        realCostLowMsg: "ಅಭಿನಂದನೆಗಳು! ನಿಮ್ಮ ನಿಜವಾದ ಬಡ್ಡಿ ವೆಚ್ಚವು ನಾಮಮಾತ್ರದ ಬಡ್ಡಿಗಿಂತ ಗಣನೀಯವಾಗಿ ಕಡಿಮೆಯಾಗಿದೆ.",
        chartTitle: "ಇಎಂಐ ಸಾಲದ ನಿಜ ಹೊರೆ ಕುಸಿತ",
        nominalEmiLabel: "ನಾಮಮಾತ್ರ ಇಎಂಐ",
        realEmiLabel: "ನಿಜವಾದ ಇಎಂಐ",
        monthLabel: "ತಿಂಗಳು"
      };
    case 'pa':
      return {
        title: "ਭੂਤਕਾਲ / ਮੁਦਰਾਸਫੀਤੀ ਦਾ ਅਸਰ (Inflation Impact)",
        desc: "ਮੁਦਰਾਸਫੀਤੀ ਸਮੇਂ ਦੇ ਨਾਲ ਪੈਸੇ ਦੀ ਕੀਮਤ ਘਟਾਉਂਦੀ ਹੈ। ਕਿਉਂਕਿ ਤੁਹਾਡੀ ਮਾਸਿਕ ਈਐਮਆਈ ਸਥਿਰ ਰਹਿੰਦੀ ਹੈ, ਸਮੇਂ ਦੇ ਨਾਲ ਇਸਦਾ 'ਅਸਲ ਬੋਝ' ਕਾਫ਼ੀ ਘੱਟ ਜਾਂਦਾ ਹੈ।",
        inflationRateLabel: "ਅਨੁਮਾਨਿਤ ਸਾਲਾਨਾ ਮੁਦਰਾਸਫੀਤੀ",
        nominalTotalLabel: "ਕੁੱਲ ਨਾਮਾਤਰ ਭੁਗਤਾਨ",
        realTotalLabel: "ਅਸਲ ਭੁਗਤਾਨ (ਅੱਜ ਦੇ ਮੁੱਲ ਵਿੱਚ)",
        interestCostRealLabel: "ਅਸਲ ਵਿਆਜ ਲਾਗਤ",
        erosionTitle: "ਈਐਮਆਈ ਖਰੀਦ ਸ਼ਕਤੀ ਵਿੱਚ ਗਿਰਾਵट",
        initialEmiLabel: "ਸ਼ੁਰੂਆਤੀ ਈਐਮਆਈ ਬੋਝ",
        endingEmiLabel: "ਆਖਰੀ ਈਐਮਆਈ 'ਅਸਲ' ਬੋਝ",
        savingValueLabel: "ਮੁਦਰਾਸਫੀਤੀ ਕਰਕੇ ਗੁਪਤ ਬਚਤ",
        explanationTitle: "ਇਹ ਕਰਜ਼ਦਾਰ ਲਈ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ?",
        explanationDesc: "ਲੰਬੇ ਸਮੇਂ ਦੇ ਕਰਜ਼ੇ ਵਿੱਚ, ਮੁਦਰਾਸਫੀਤੀ ਤੁਹਾਡਾ ਅਦ੍ਰਿਸ਼ਟ ਦੋਸਤ ਹੈ। ਜੇਕਰ ਸਾਲਾਨਾ ਦਰ {rate}% ਹੈ, ਤਾਂ ਅੱਜ ਦਾ {symbol}10,000 ਭੁਗਤਾਨ {years} ਸਾਲਾਂ ਬਾਅਦ ਸਿਰਫ {symbol}{feel} ਮਹਿਸੂਸ ਹੋਵੇਗਾ। ਤੁਸੀਂ ਅੱਜ ਦੇ ਮਹਿੰਗੇ ਪੈਸੇ ਨਾਲ ਘਰ ਖਰੀਦ ਰਹੇ ਹੋ ਤੇ ਕੱਲ੍ਹ ਦੇ ਕਮਜ਼ੋਰ ਪੈਸੇ ਨਾਲ ਭੁਗਤਾਨ ਕਰ ਰਹੇ ਹੋ!",
        realCostLowMsg: "ਵਧਾਈਆਂ! ਤੁਹਾਡੀ ਅਸਲ ਵਿਆਜ ਲਾਗਤ ਨਾਮਾਤਰ ਵਿਆਜ ਤੋਂ ਬਹੁਤ ਘੱਟ ਹੈ।",
        chartTitle: "ਈਐਮਆਈ ਦਾ ਘਟਦਾ ਅਸਲ ਬੋਝ",
        nominalEmiLabel: "ਨਾਮਾਤਰ ਈਐਮਆਈ",
        realEmiLabel: "ਅਸਲ ਈਐਮਆਈ",
        monthLabel: "ਮਹੀਨਾ"
      };
    case 'es':
      return {
        title: "Impacto de la Inflación",
        desc: "La inflación reduce el poder adquisitivo del dinero con el tiempo. Dado que su cuota mensual (EMI) es fija, su carga real disminuye notablemente año tras año.",
        inflationRateLabel: "Tasa de inflación anual estimada",
        nominalTotalLabel: "Total de pagos nominales",
        realTotalLabel: "Total en valor real actual",
        interestCostRealLabel: "Costo de interés en valor real",
        erosionTitle: "Erosión del valor de su cuota fija",
        initialEmiLabel: "Carga de cuota inicial",
        endingEmiLabel: "Carga 'real' de cuota final",
        savingValueLabel: "Ahorro oculto por inflación",
        explanationTitle: "¿Cómo beneficia esto al prestatario?",
        explanationDesc: "En préstamos a largo plazo, la inflación actúa como un aliado invisible. Si la inflación es del {rate}%, un pago de {symbol}10,000 hoy se sentirá como solo {symbol}{feel} de hoy en {years} años. Compra un activo con dinero valioso y lo paga con dinero depreciado.",
        realCostLowMsg: "¡Enhorabuena! El costo real de los intereses es sustancialmente menor que el nominal.",
        chartTitle: "Evolución de la Cuota Real vs Cuota Nominal",
        nominalEmiLabel: "Cuota Nominal",
        realEmiLabel: "Cuota Ajustada por Inflación (Poder Adquisitivo)",
        monthLabel: "Mes"
      };
    case 'fr':
      return {
        title: "Impact de l'Inflation",
        desc: "L'inflation réduit le pouvoir d'achat de la monnaie au fil du temps. Comme votre mensualité (EMI) est fixe, sa charge réelle diminue de manière significative chaque année.",
        inflationRateLabel: "Taux d'inflation annuel estimé",
        nominalTotalLabel: "Total des paiements nominaux",
        realTotalLabel: "Total en valeur réelle d'aujourd'hui",
        interestCostRealLabel: "Coût réel des intérêts",
        erosionTitle: "Érosion du pouvoir d'achat de la mensualité",
        initialEmiLabel: "Charge de la mensualité initiale",
        endingEmiLabel: "Mensualité finale en pouvoir d'achat réel",
        savingValueLabel: "Épargne invisible due à l'inflation",
        explanationTitle: "Comment cela favorise-t-il l'emprunteur ?",
        explanationDesc: "Sur de longs prêts, l'inflation est votre alliée invisible. Si l'inflation annuelle est de {rate}%, une mensualité de {symbol}10 000 aujourd'hui équivaudra à seulement {symbol}{feel} d'aujourd'hui dans {years} ans. Vous achetez un actif avec de l'argent fort et le remboursez avec de l'argent faible.",
        realCostLowMsg: "Félicitations ! Le coût d'intérêt réel est nettement inférieur au coût d'intérêt nominal.",
        chartTitle: "Mensualité Réelle vs Mensualité Nominale",
        nominalEmiLabel: "Mensualité Nominale",
        realEmiLabel: "Mensualité Réelle (Ajustée)",
        monthLabel: "Mois"
      };
    case 'de':
      return {
        title: "Einfluss der Inflation",
        desc: "Die Inflation verringert die Kaufkraft des Geldes im Laufe der Zeit. Da Ihre monatliche Rate (EMI) fix ist, sinkt ihre reale Belastung von Jahr zu Jahr erheblich.",
        inflationRateLabel: "Geschätzte jährliche Inflationsrate",
        nominalTotalLabel: "Summe aller nominalen Zahlungen",
        realTotalLabel: "Überzahlungsbetrag in heutiger Kaufkraft",
        interestCostRealLabel: "Realer Zinsaufwand",
        erosionTitle: "Kaufkraftverlust der Ratenzahlung",
        initialEmiLabel: "Anfängliche Ratenbelastung",
        endingEmiLabel: "Letzte Rate in heutiger Kaufkraft",
        savingValueLabel: "Stiller Inflationsvorteil (Ersparnis)",
        explanationTitle: "Wie hilft die Inflation dem Kreditnehmer?",
        explanationDesc: "Bei jahrzehntelangen Krediten ist die Inflation Ihr unsichtbarer Freund. Wenn die Inflationsrate bei {rate}% liegt, fühlt sich eine Rate von {symbol}10.000 heute in {years} Jahren wie nur {symbol}{feel} an. Sie kaufen eine Immobilie mit heutigem, starken Geld und zahlen sie morgen mit entwertetem Geld zurück.",
        realCostLowMsg: "Glückwunsch! Ihre reale Zinsbelastung ist deutlich niedriger als der nominale Zins.",
        chartTitle: "Kaufkraftverlauf Ratenbelastung",
        nominalEmiLabel: "Nominale Rate",
        realEmiLabel: "Reale Rate (Inflationsbereinigt)",
        monthLabel: "Monat"
      };
    default:
      return {
        title: "Inflation Impact Analyzer",
        desc: "Inflation reduces the purchasing power of money over time. Since your monthly EMI remains fixed, its 'real burden' shrinks significantly over the years.",
        inflationRateLabel: "Estimated Annual Inflation Rate",
        nominalTotalLabel: "Nominal Total Repaid",
        realTotalLabel: "Real Repayment (Today's Value)",
        interestCostRealLabel: "Real Interest Paid (Inflation Adjusted)",
        erosionTitle: "Erosion of Fixed EMI Burden",
        initialEmiLabel: "Starting EMI Value",
        endingEmiLabel: "Final EMI 'Real' Burden",
        savingValueLabel: "Secret Inflation Advantage",
        explanationTitle: "How does inflation work to your advantage?",
        explanationDesc: "On decade-long loans, inflation is your invisible friend. If annual inflation is over {rate}%, a {symbol}10,000 monthly payment today will only feel like {symbol}{feel} in today's purchasing power in {years} years. You lock in a property with expensive, strong money and pay it back using future, cheaper cash!",
        realCostLowMsg: "Excellent! Your inflation-adjusted interest outgoings are significantly lower than your nominal interest.",
        chartTitle: "Shrinking Burden of Fixed Monthly EMI",
        nominalEmiLabel: "Nominal EMI",
        realEmiLabel: "Real EMI (Today's Purchasing Power)",
        monthLabel: "Month"
      };
  }
};

export const InflationImpact: React.FC<InflationImpactProps> = ({
  schedule,
  principal,
  totalInterest,
  totalPayment,
  monthlyEMI,
  finalTenure,
  inflationRate,
  setInflationRate,
  currencySymbol,
  currencyCode,
  currencyLocale,
  language
}) => {
  const t = useMemo(() => getInflationTranslationsByLang(language), [language]);

  // Calculate inflation adjusted statistics
  const metrics = useMemo(() => {
    if (schedule.length === 0) {
      return {
        realTotalPaid: principal,
        realInterestExpense: 0,
        endingRealEmi: monthlyEMI,
        emiReductionPercent: 0,
        inflationBenefit: 0,
        chartData: []
      };
    }

    const monthlyInflation = Math.pow(1 + inflationRate / 100, 1 / 12) - 1;
    let realTotalPaid = 0;
    let nominalTotalCalculated = 0;

    const chartData: any[] = [];
    const samplingInterval = Math.max(1, Math.floor(schedule.length / 15));

    schedule.forEach((item, index) => {
      const monthIndex = item.month;
      const discountFactor = Math.pow(1 + monthlyInflation, monthIndex);
      
      const totalOutflowThisMonth = item.emi + item.prepayment;
      const realOutflowThisMonth = totalOutflowThisMonth / discountFactor;
      const realEmiValue = item.emi / discountFactor;

      realTotalPaid += realOutflowThisMonth;
      nominalTotalCalculated += totalOutflowThisMonth;

      // Sample data for recharts to stay concise and highly readable
      if (index === 0 || index === schedule.length - 1 || monthIndex % samplingInterval === 0) {
        chartData.push({
          month: monthIndex,
          [t.nominalEmiLabel]: Math.round(item.emi),
          [t.realEmiLabel]: Math.round(realEmiValue)
        });
      }
    });

    const realInterestExpense = Math.max(0, realTotalPaid - principal);
    const endingDiscountFactor = Math.pow(1 + monthlyInflation, finalTenure);
    const endingRealEmi = monthlyEMI / endingDiscountFactor;
    const emiReductionPercent = ((monthlyEMI - endingRealEmi) / monthlyEMI) * 100;
    const inflationBenefit = Math.max(0, nominalTotalCalculated - realTotalPaid);

    return {
      realTotalPaid,
      realInterestExpense,
      endingRealEmi,
      emiReductionPercent,
      inflationBenefit,
      chartData
    };
  }, [schedule, principal, monthlyEMI, finalTenure, inflationRate, t]);

  // Dynamic values for help snippet
  const yearsEquivalent = Math.min(15, Math.max(5, Math.round(finalTenure / 12)));
  const discountFactorForSnippet = Math.pow(1 + inflationRate / 100, yearsEquivalent);
  const what10000FeelsLike = Math.round(10000 / discountFactorForSnippet);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-silver-gray p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-150 dark:border-davys-gray mt-6 transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="bg-orange-50 dark:bg-orange-950/20 p-2 rounded-xl text-orange-600 dark:text-orange-400">
            <Flame size={20} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-zinc-200">
              {t.title}
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-400/80 mt-0.5">
              How inflation makes your fixed long-term debt cheaper over time
            </p>
          </div>
        </div>

        {/* Inflation rate interactive widget */}
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/50 dark:border-zinc-700/50 px-3.5 py-1.5 rounded-xl min-w-[210px] sm:min-w-0">
          <div className="flex-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 dark:text-zinc-400">
              <span>{t.inflationRateLabel}</span>
              <span className="text-orange-600 dark:text-orange-400 text-xs font-bold">{inflationRate.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="15.0"
              step="0.5"
              value={inflationRate}
              onChange={(e) => setInflationRate(parseFloat(e.target.value))}
              className="w-28 sm:w-32 h-1 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-orange-500 mt-1"
            />
          </div>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-350 leading-relaxed mb-6">
        {t.desc}
      </p>

      {/* Main KPI Stats Block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        
        {/* Nominal Card */}
        <div className="bg-slate-50/60 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/80 p-4 rounded-xl relative overflow-hidden transition-all duration-300">
          <span className="absolute -top-1 -right-1 opacity-5 text-gray-600 scale-150">
            <DollarSign size={80} />
          </span>
          <span className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block">
            {t.nominalTotalLabel}
          </span>
          <span className="text-xl font-bold text-gray-700 dark:text-zinc-300 mt-1.5 block">
            {formatCurrency(totalPayment, currencyCode, currencyLocale)}
          </span>
          <div className="text-[11px] text-gray-400 mt-1.5 font-medium">
            Principal + Nominal Interest outgoings
          </div>
        </div>

        {/* Real Cost Card (Inflation Adjusted) */}
        <div className="bg-indigo-50/40 dark:bg-indigo-950/10 border border-indigo-150/40 dark:border-indigo-900/30 p-4 rounded-xl relative overflow-hidden transition-all duration-300">
          <span className="absolute -top-1 -right-1 opacity-5 text-indigo-500 scale-150">
            <Sparkles size={80} />
          </span>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
            {t.realTotalLabel}
          </span>
          <span className="text-xl font-bold text-indigo-850 dark:text-indigo-300 mt-1.5 block">
            {formatCurrency(metrics.realTotalPaid, currencyCode, currencyLocale)}
          </span>
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400/80 mt-1.5 font-medium flex items-center gap-1">
            <TrendingDown size={12} />
            Value adjusted for {inflationRate}% compounding inflation
          </div>
        </div>

        {/* Secret Saving / Value Shield Card */}
        <div className="bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-150/40 dark:border-emerald-900/30 p-4 rounded-xl relative overflow-hidden transition-all duration-300">
          <span className="absolute -top-1 -right-1 opacity-5 text-emerald-500 scale-150">
            <TrendingDown size={80} />
          </span>
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
            {t.savingValueLabel}
          </span>
          <span className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mt-1.5 block">
            {formatCurrency(metrics.inflationBenefit, currencyCode, currencyLocale)}
          </span>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400/80 mt-1.5 font-medium">
            Repayment burden absorbed by inflation
          </div>
        </div>

      </div>

      {/* Grid of details: EMI Erosion, Real Interest cost */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: EMI purchasing power decline timeline */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-gray-50/55 dark:bg-zinc-800/20 p-4 rounded-xl border border-gray-100 dark:border-zinc-800">
            <h4 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-zinc-200 mb-3 flex items-center gap-1.5">
              <ArrowDownRight size={15} className="text-orange-500" />
              {t.erosionTitle}
            </h4>
            
            <div className="space-y-3.5">
              {/* Initial EMI */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 dark:text-zinc-400">{t.initialEmiLabel}:</span>
                <span className="font-bold text-gray-800 dark:text-zinc-200">
                  {formatCurrency(monthlyEMI, currencyCode, currencyLocale)}
                </span>
              </div>

              {/* Progress bar representing erosion */}
              <div>
                <div className="h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.max(15, 100 - metrics.emiReductionPercent)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 dark:text-zinc-500 mt-1 font-medium">
                  <span>Month 1: 100% burden</span>
                  <span>End Month: {Math.max(0, 100 - metrics.emiReductionPercent).toFixed(0)}% real burden</span>
                </div>
              </div>

              {/* Ending EMI real feel */}
              <div className="flex justify-between items-end pt-1">
                <span className="text-xs text-gray-500 dark:text-zinc-400">{t.endingEmiLabel}:</span>
                <div className="text-right">
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400 block line-through decoration-1 text-[11px] opacity-70">
                    {formatCurrency(monthlyEMI, currencyCode, currencyLocale)}
                  </span>
                  <span className="text-base font-extrabold text-orange-700 dark:text-orange-300 block -mt-0.5 animate-pulse">
                    {formatCurrency(metrics.endingRealEmi, currencyCode, currencyLocale)}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-orange-50/50 dark:bg-orange-950/15 text-[11px] text-orange-850 dark:text-orange-300 leading-normal border border-orange-100/40 dark:border-orange-900/10">
                ⭐ The purchasing power of your EMI drops by <strong>{metrics.emiReductionPercent.toFixed(0)}%</strong>. Your last EMI feels <strong>{Math.floor(metrics.emiReductionPercent)}% cheaper</strong> than your first one.
              </div>
            </div>
          </div>

          {/* Real Interest Paid calculation */}
          <div className="bg-gray-50/55 dark:bg-zinc-800/20 p-4 rounded-xl border border-gray-100 dark:border-zinc-800">
            <h4 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-zinc-200 mb-3 flex items-center gap-1.5">
              <Sparkles size={14} className="text-indigo-500" />
              {t.interestCostRealLabel}
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Nominal Interest Paid:</span>
                <span className="font-semibold text-gray-700 dark:text-zinc-300">
                  {formatCurrency(totalInterest, currencyCode, currencyLocale)}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-zinc-800 pb-2">
                <span className="text-gray-500">Compounded Inflation:</span>
                <span className="font-semibold text-orange-600 dark:text-orange-400">-{formatCurrency(metrics.inflationBenefit, currencyCode, currencyLocale)}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="font-medium text-gray-850 dark:text-zinc-200">Real Interest Expense:</span>
                <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-300">
                  {formatCurrency(metrics.realInterestExpense, currencyCode, currencyLocale)}
                </span>
              </div>

              {metrics.realInterestExpense === 0 && (
                <div className="p-2.5 rounded bg-emerald-50/40 dark:bg-emerald-950/15 text-[10.5px] text-emerald-800 dark:text-emerald-300 border border-emerald-100/40 dark:border-emerald-900/10 leading-relaxed mt-2">
                  🎉 inflation is higher than your real rate of debt. This means you are borrowing money for a <strong>negative real interest cost</strong>!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Recharts area chart of shrinking EMI over time */}
        <div className="lg:col-span-7 flex flex-col justify-between h-full bg-slate-50/30 dark:bg-zinc-800/10 border border-gray-100 dark:border-zinc-800 rounded-xl p-4">
          <div className="mb-4">
            <h4 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-zinc-200 flex items-center gap-1.5">
              <TrendingDown size={15} className="text-indigo-500" />
              {t.chartTitle}
            </h4>
          </div>

          <div className="h-44 sm:h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={metrics.chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorNominal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-grid)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--chart-grid)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                <XAxis 
                  dataKey="month" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{fontSize: 10, fill: 'var(--chart-text)'}} 
                  tickFormatter={(val) => `${t.monthLabel} ${val}`}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{fontSize: 10, fill: 'var(--chart-text)'}} 
                />
                <Tooltip
                  formatter={(val) => [formatCurrency(val as number, currencyCode, currencyLocale), ""]}
                  contentStyle={{ backgroundColor: 'var(--bg-popover)', borderColor: 'var(--border-popover)', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area 
                  type="monotone" 
                  dataKey={t.nominalEmiLabel} 
                  stroke="#94a3b8" 
                  fillOpacity={1} 
                  fill="url(#colorNominal)" 
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
                <Area 
                  type="monotone" 
                  dataKey={t.realEmiLabel} 
                  stroke="#f97316" 
                  fillOpacity={1} 
                  fill="url(#colorReal)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex gap-2 items-start mt-4 pt-4 border-t border-gray-150/50 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/20 p-2.5 rounded-lg border border-gray-150/40">
            <HelpCircle size={16} className="text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
            <span className="text-[10.5px] text-gray-500 dark:text-zinc-400 leading-normal">
              {t.explanationDesc
                .replace("{rate}", inflationRate.toString())
                .replace("{symbol}", currencySymbol)
                .replace("{years}", yearsEquivalent.toString())
                .replace("{symbol}", currencySymbol)
                .replace("{feel}", formatCurrency(what10000FeelsLike, currencyCode, currencyLocale))
              }
            </span>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
