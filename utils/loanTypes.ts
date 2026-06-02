export interface LoanTypeConfig {
  id: string;
  defaultRate: number;
  minRate: number;
  maxRate: number;
  defaultPrincipal: number;
  defaultTenure: number;
  names: Record<string, string>;
  avgMessage: Record<string, string>;
}

export const LOAN_TYPES: LoanTypeConfig[] = [
  {
    id: 'home',
    defaultRate: 8.5,
    minRate: 4.0,
    maxRate: 15.0,
    defaultPrincipal: 5000000,
    defaultTenure: 240, // 20 years
    names: {
      en: "Home Loan",
      hi: "गृह ऋण (Home Loan)",
      ta: "வீட்டுக் கடன் (Home Loan)",
      te: "ఇంటి రుణం (Home Loan)",
      ml: "ഭവന വായ്പ (Home Loan)",
      kn: "ಗೃಹ ಸಾಲ (Home Loan)",
      pa: "ਹੋਮ ਲੋਨ (Home Loan)",
      es: "Préstamo Hipotecario",
      fr: "Prêt Immobilier",
      de: "Immobilienkredit"
    },
    avgMessage: {
      en: "Market avg: ~8.5% (Typical range: 8.0% - 10.0%)",
      hi: "बाजार औसत: ~8.5% (सामान्य सीमा: 8.0% - 10.0%)",
      ta: "சந்தை சராசரி: ~8.5% (வழக்கமான வரம்பு: 8.0% - 10.0%)",
      te: "మార్కెట్ సగటు: ~8.5% (సాధారణ పరిమితి: 8.0% - 10.0%)",
      ml: "മാർക്കറ്റ് ശരാശരി: ~8.5% (സാധാരണ പരിധി: 8.0% - 10.0%)",
      kn: "ಮಾರುಕಟ್ಟೆ ಸರಾಸರಿ: ~8.5% (ಸಾಮಾನ್ಯವಾಗಿ: 8.0% - 10.0%)",
      pa: "ਮਾਰਕੀਟ ਔਸਤ: ~8.5% (ਆਮ ਤੌਰ 'ਤੇ: 8.0% - 10.0%)",
      es: "Promedio del mercado: ~8.5% (Rango típico: 8.0% - 10.0%)",
      fr: "Moyenne du marché : ~8,5% (Plage typique : 8,0% - 10,0%)",
      de: "Marktdurchschnitt: ~8.5% (Üblicher Bereich: 8.0% - 10.0%)"
    }
  },
  {
    id: 'mortgage',
    defaultRate: 10.0,
    minRate: 6.0,
    maxRate: 18.0,
    defaultPrincipal: 3000000,
    defaultTenure: 180, // 15 years
    names: {
      en: "Mortgage Loan",
      hi: "बंधक ऋण (Mortgage Loan)",
      ta: "அடமானக் கடன் (Mortgage Loan)",
      te: "తాకట్టు రుణం (Mortgage Loan)",
      ml: "പണയ വായ്പ (Mortgage Loan)",
      kn: "ಅಡಮಾನ ಸಾಲ (Mortgage Loan)",
      pa: "ਮੋਰਟਗੇਜ ਲੋਨ (Mortgage Loan)",
      es: "Préstamo con Garantía",
      fr: "Prêt Hypothécaire",
      de: "Hypothekendarlehen"
    },
    avgMessage: {
      en: "Market avg: ~10.0% (Typical range: 9.0% - 12.0%)",
      hi: "बाजार औसत: ~10.0% (सामान्य सीमा: 9.0% - 12.0%)",
      ta: "சந்தை சராசரி: ~10.0% (வழக்கமான வரம்பு: 9.0% - 12.0%)",
      te: "మార్కెట్ సగటు: ~10.0% (సాధారణ పరిమితి: 9.0% - 12.0%)",
      ml: "മാർക്കറ്റ് ശരാശരി: ~10.0% (സാധാരണ പരിധി: 9.0% - 12.0%)",
      kn: "ಮಾರುಕಟ್ಟೆ ಸರಾಸರಿ: ~10.0% (ಸಾಮಾನ್ಯವಾಗಿ: 9.0% - 12.0%)",
      pa: "ਮਾਰਕੀਟ ਔਸਤ: ~10.0% (ਆਮ ਤੌਰ 'ਤੇ: 9.0% - 12.0%)",
      es: "Promedio del mercado: ~10.0% (Rango típico: 9.0% - 12.0%)",
      fr: "Moyenne du marché : ~10,0% (Plage typique : 9,0% - 12,0%)",
      de: "Marktdurchschnitt: ~10.0% (Üblicher Bereich: 9.0% - 12.0%)"
    }
  },
  {
    id: 'car',
    defaultRate: 9.2,
    minRate: 5.0,
    maxRate: 16.0,
    defaultPrincipal: 800000,
    defaultTenure: 84, // 7 years
    names: {
      en: "Car Loan",
      hi: "कार ऋण (Car Loan)",
      ta: "வாகனக் கடன் (Car Loan)",
      te: "కార్ రుణం (Car Loan)",
      ml: "വാഹന വായ്പ (Car Loan)",
      kn: "ಕಾರು ಸಾಲ (Car Loan)",
      pa: "ਕਾਰ ਲੋਨ (Car Loan)",
      es: "Préstamo Automotriz",
      fr: "Prêt Auto",
      de: "Autokredit"
    },
    avgMessage: {
      en: "Market avg: ~9.2% (Typical range: 8.5% - 11.0%)",
      hi: "बाजार औसत: ~9.2% (सामान्य सीमा: 8.5% - 11.0%)",
      ta: "சந்தை சராசரி: ~9.2% (வழக்கமான வரம்பு: 8.5% - 11.0%)",
      te: "మార్కెట్ సగటు: ~9.2% (సాధారణ పరిమితి: 8.5% - 11.0%)",
      ml: "മാർക്കറ്റ് ശരാശരി: ~9.2% (സാധാരണ പരിധി: 8.5% - 11.0%)",
      kn: "ಮಾರುಕಟ್ಟೆ ಸರಾಸರಿ: ~9.2% (ಸಾಮಾನ್ಯವಾಗಿ: 8.5% - 11.0%)",
      pa: "ਮਾਰਕੀਟ ਔਸਤ: ~9.2% (ਆਮ ਤੌਰ 'ਤੇ: 8.5% - 11.0%)",
      es: "Promedio del mercado: ~9.2% (Rango típico: 8.5% - 11.0%)",
      fr: "Moyenne du marché : ~9,2% (Plage typique : 8,5% - 11,0%)",
      de: "Marktdurchschnitt: ~9.2% (Üblicher Bereich: 8.5% - 11.0%)"
    }
  },
  {
    id: 'jewell',
    defaultRate: 11.0,
    minRate: 6.0,
    maxRate: 20.0,
    defaultPrincipal: 300000,
    defaultTenure: 12, // 1 year
    names: {
      en: "Jewel Loan",
      hi: "स्वर्ण ऋण (Jewel Loan)",
      ta: "நகைக்கடன் (Jewel Loan)",
      te: "బంగారు రుణం (Jewel Loan)",
      ml: "സ്വർണ്ണ വായ്പ (Jewel Loan)",
      kn: "ಚಿನ್ನದ ಸಾಲ (Jewel Loan)",
      pa: "ਗਹਿਣੇ ਲੋਨ (Jewel Loan)",
      es: "Préstamo de Joyería",
      fr: "Prêt sur Gage",
      de: "Schmuckkredit"
    },
    avgMessage: {
      en: "Market avg: ~11.0% (Typical range: 9.0% - 14.0%)",
      hi: "बाजार औसत: ~11.0% (सामान्य सीमा: 9.0% - 14.0%)",
      ta: "சந்தை சராசரி: ~11.0% (வழக்கமான வரம்பு: 9.0% - 14.0%)",
      te: "మార్కెట్ సగటు: ~11.0% (సాధారణ పరిమితి: 9.0% - 14.0%)",
      ml: "മാർക്കറ്റ് ശരാശരി: ~11.0% (സാധാരണ പരിധി: 9.0% - 14.0%)",
      kn: "ಮಾರುಕಟ್ಟೆ ಸರಾಸರಿ: ~11.0% (ಸಾಮಾನ್ಯವಾಗಿ: 9.0% - 14.0%)",
      pa: "ਮਾਰਕੀਟ ਔਸਤ: ~11.0% (ਆਮ ਤੌਰ 'ਤੇ: 9.0% - 14.0%)",
      es: "Promedio del mercado: ~11.0% (Rango típico: 9.0% - 14.0%)",
      fr: "Moyenne du marché : ~11,0% (Plage typique : 9,0% - 14,0%)",
      de: "Marktdurchschnitt: ~11.0% (Üblicher Bereich: 9.0% - 14.0%)"
    }
  },
  {
    id: 'personal',
    defaultRate: 13.5,
    minRate: 8.0,
    maxRate: 25.0,
    defaultPrincipal: 500000,
    defaultTenure: 36, // 3 years
    names: {
      en: "Personal Loan",
      hi: "व्यक्तिगत ऋण (Personal Loan)",
      ta: "தனிநபர் கடன் (Personal Loan)",
      te: "వ్యక్తిగత రుణం (Personal Loan)",
      ml: "വ്യക്തിഗത വായ്പ (Personal Loan)",
      kn: "ವೈಯಕ್ತಿಕ ಸಾಲ (Personal Loan)",
      pa: "ਪਰਸਨल ਲੋਨ (Personal Loan)",
      es: "Préstamo Personal",
      fr: "Prêt Personnel",
      de: "Ratenkredit"
    },
    avgMessage: {
      en: "Market avg: ~13.5% (Typical range: 11.0% - 18.0%)",
      hi: "बाजार औसत: ~13.5% (सामान्य सीमा: 11.0% - 18.0%)",
      ta: "சந்தை சராசரி: ~13.5% (வழக்கமான வரம்பு: 11.0% - 18.0%)",
      te: "మార్కెట్ సగటు: ~13.5% (సాధారణ పరిమితి: 11.0% - 18.0%)",
      ml: "മാർക്കറ്റ് ശരാശരി: ~13.5% (സാധാരണ പരിധി: 11.0% - 18.0%)",
      kn: "ಮಾರುకಟ್ಟೆ ಸರಾಸರಿ: ~13.5% (ಸಾಮಾನ್ಯವಾಗಿ: 11.0% - 18.0%)",
      pa: "ਮਾਰਕੀਟ ਔਸਤ: ~13.5% (ਆਮ ਤੌਰ 'ਤੇ: 11.0% - 18.0%)",
      es: "Promedio del mercado: ~13.5% (Rango típico: 11.0% - 18.0%)",
      fr: "Moyenne du marché : ~13,5% (Plage typique : 11,0% - 18,0%)",
      de: "Marktdurchschnitt: ~13.5% (Üblicher Bereich: 11.0% - 18.0%)"
    }
  },
  {
    id: 'business',
    defaultRate: 15.0,
    minRate: 8.0,
    maxRate: 28.0,
    defaultPrincipal: 1500000,
    defaultTenure: 60, // 5 years
    names: {
      en: "Business Loan",
      hi: "व्यवसाय ऋण (Business Loan)",
      ta: "தொழில் கடன் (Business Loan)",
      te: "వ్యాపార రుణం (Business Loan)",
      ml: "ബിസിനസ് വായ്പ (Business Loan)",
      kn: "ವ್ಯವಹಾರ ಸಾಲ (Business Loan)",
      pa: "ਬਿਜ਼ਨਸ ਲੋਨ (Business Loan)",
      es: "Préstamo Comercial",
      fr: "Prêt Professionnel",
      de: "Geschäftskredit"
    },
    avgMessage: {
      en: "Market avg: ~15.0% (Typical range: 12.0% - 20.0%)",
      hi: "बाजार औसत: ~15.0% (सामान्य सीमा: 12.0% - 20.0%)",
      ta: "சந்தை சராசரி: ~15.0% (வழக்கமான வரம்பு: 12.0% - 20.0%)",
      te: "మార్కెట్ సగటు: ~15.0% (సాధారణ పరిమితి: 12.0% - 20.0%)",
      ml: "മാർക്കറ്റ് ശരാശരി: ~15.0% (സാധാരണ പരിധി: 12.0% - 20.0%)",
      kn: "ಮಾರುکಟ್ಟೆ ಸರಾಸರಿ: ~15.0% (ಸಾಮಾನ್ಯವಾಗಿ: 12.0% - 20.0%)",
      pa: "ਮਾਰਕੀਟ ਔਸਤ: ~15.0% (ਆਮ ਤੌਰ 'ਤੇ: 12.0% - 20.0%)",
      es: "Promedio del mercado: ~15.0% (Rango típico: 12.0% - 20.0%)",
      fr: "Moyenne du marché : ~15,0% (Plage typique : 12,0% - 20,0%)",
      de: "Marktdurchschnitt: ~15.0% (Üblicher Bereich: 12.0% - 20.0%)"
    }
  }
];

export const getLoanTypeLabel = (id: string, lang: string): string => {
  const type = LOAN_TYPES.find(t => t.id === id);
  if (!type) return id;
  return type.names[lang] || type.names.en || id;
};

export const getLoanTypeAvgMessage = (id: string, lang: string): string => {
  const type = LOAN_TYPES.find(t => t.id === id);
  if (!type) return '';
  return type.avgMessage[lang] || type.avgMessage.en || '';
};
