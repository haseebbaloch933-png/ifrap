'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ur';

export interface TranslationDictionary {
  nav: {
    overview: string;
    webgis: string;
    telemetry: string;
    fiduciary: string;
    grm: string;
    admin: string;
    systemOnline: string;
    appTitle: string;
    appSubtitle: string;
    skipToContent: string;
  };
  map: {
    title: string;
    subtitle: string;
    layerControl: string;
    technocratic: string;
    decolonial: string;
    center: string;
    zoomLevel: string;
    activeLayer: string;
    selectedDetails: string;
    customaryRights: string;
    reactMapGl: string;
  };
  telemetry: {
    title: string;
    titleAccent: string;
    subtitle: string;
    badge: string;
    totalPopulation: string;
    populationSub: string;
    activeKarez: string;
    rehabilitatedSub: string;
    avgMPI: string;
    mpiFormulaSub: string;
    beneficiaryHH: string;
    waterAllocSub: string;
    selectDistrict: string;
    selectDistrictSub: string;
    exportCSV: string;
    exportJSON: string;
    downloadReport: string;
    mpiScore: string;
    deprivationIndex: string;
    headcountRatio: string;
    povertyIntensity: string;
    formulaExplanation: string;
    mirabCouncil: string;
    capabilityBreakdown: string;
    capabilityBreakdownSub: string;
    deprivation: string;
    ifrapMetrics: string;
    ifrapMetricsSub: string;
    filterAll: string;
    fieldObservations: string;
    fieldObsSub: string;
    districtCoordinates: string;
    beneficiaryPopulation: string;
    waterMasterCouncil: string;
    target: string;
  };
  usufruct: {
    title: string;
    subtitle: string;
    badge: string;
    beneficiaryLabel: string;
    beneficiaryPlaceholder: string;
    districtLabel: string;
    parcelIdLabel: string;
    parcelIdPlaceholder: string;
    areaLabel: string;
    rightsTypeLabel: string;
    generateCertButton: string;
    generatingCertButton: string;
    issuedTitle: string;
    complianceLedger: string;
    docId: string;
    beneficiary: string;
    districtParcel: string;
    area: string;
    rightsType: string;
    entriesCount: string;
    noActivity: string;
    accessRestricted: string;
  };
  accessibility: {
    title: string;
    highContrast: string;
    highContrastToggle: string;
    textSize: string;
    normal: string;
    large: string;
    xlarge: string;
    highContrastOn: string;
    highContrastOff: string;
    langToggle: string;
  };
  roles: {
    enumerator: string;
    officer: string;
    director: string;
    currentRole: string;
    accessRestrictedMessage: string;
  };
  grm: {
    title: string;
    subtitle: string;
    totalTickets: string;
    openEscalated: string;
    slaCompliance: string;
    ledgerTitle: string;
  };
  admin: {
    title: string;
    subtitle: string;
    userManagement: string;
    dataSync: string;
  };
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    nav: {
      overview: 'Overview',
      webgis: 'WebGIS Map',
      telemetry: 'Telemetry Dashboard',
      fiduciary: 'Fiduciary Shield',
      grm: 'GRM Ledger',
      admin: 'Admin Console',
      systemOnline: 'System Online',
      appTitle: 'MIRAB',
      appSubtitle: 'IFRAP Component 3 Platform',
      skipToContent: 'Skip to main content',
    },
    map: {
      title: 'Decolonial Spatial Layer Control',
      subtitle: 'Balochistan Karez Systems & Indigenous Water Management',
      layerControl: 'Layer View Mode',
      technocratic: 'Technocratic Standard',
      decolonial: 'Decolonial ITK Layer',
      center: 'Center',
      zoomLevel: 'Zoom Level',
      activeLayer: 'Active Layer',
      selectedDetails: 'Selected Feature Details',
      customaryRights: 'Customary Rights / Notes',
      reactMapGl: 'react-map-gl',
    },
    telemetry: {
      title: 'Senian Multidimensional Poverty Index &',
      titleAccent: 'Telemetry Dashboard',
      subtitle: 'Quantitative M&E monitoring of Balochistan Karez Rehabilitation & Community Water Management (IFRAP Component 3). Evaluates capability deprivation (MPI = H × A) across water infrastructure, customary governance, climate resilience, and economic sustainability.',
      badge: 'IFRAP Component 3 • M&E Telemetry Engine',
      totalPopulation: 'Total Population',
      populationSub: '6 Balochistan Districts',
      activeKarez: 'Active Karez Systems',
      rehabilitatedSub: 'Rehabilitated & Tracked',
      avgMPI: 'Average Senian MPI',
      mpiFormulaSub: 'H = Headcount | A = Intensity',
      beneficiaryHH: 'Beneficiary Households',
      waterAllocSub: 'Customary Water Allocation',
      selectDistrict: 'Select IFRAP District',
      selectDistrictSub: 'Choose a district to analyze Senian MPI capability score and metrics',
      exportCSV: 'Export CSV',
      exportJSON: 'Export JSON',
      downloadReport: 'Download Report',
      mpiScore: 'MPI Score',
      deprivationIndex: 'Capability Deprivation Index',
      headcountRatio: 'Headcount Ratio (H)',
      povertyIntensity: 'Poverty Intensity (A)',
      formulaExplanation: 'Proportion of population multidimensionally poor multiplied by average proportion of capability deprivations experienced.',
      mirabCouncil: 'Mirab Council',
      capabilityBreakdown: '4-Dimension Capability Breakdown',
      capabilityBreakdownSub: 'Evaluated capability scores across key IFRAP water governance dimensions (0% = Full Deprivation, 100% = Full Capability)',
      deprivation: 'Deprivation',
      ifrapMetrics: 'IFRAP Component 3 Capability Metrics',
      ifrapMetricsSub: 'Real-time progress bars bound to Balochistan Karez rehabilitation field indicators',
      filterAll: 'All',
      fieldObservations: 'Applied Anthropology Field Observations',
      fieldObsSub: 'Customary Water Allocation & Usufruct Rights Assessment',
      districtCoordinates: 'District Coordinates',
      beneficiaryPopulation: 'Beneficiary Population',
      waterMasterCouncil: 'Water Master Council',
      target: 'Target',
    },
    usufruct: {
      title: 'Customary Legal Rights Generator',
      subtitle: 'Register and issue legally bound customary land usufruct certificates for Balochistan Karez communities.',
      badge: 'Fiduciary Shield • Usufruct Generator',
      beneficiaryLabel: 'Beneficiary / Clan Name *',
      beneficiaryPlaceholder: 'e.g. Marri-Bugti Alliance / Kakar Tribal Federation',
      districtLabel: 'Balochistan District',
      parcelIdLabel: 'Land Parcel ID',
      parcelIdPlaceholder: 'e.g. BAL-KAREZ-99',
      areaLabel: 'Area (Hectares) *',
      rightsTypeLabel: 'Customary Rights Type',
      generateCertButton: 'Generate Customary Usufruct Certificate',
      generatingCertButton: 'Registering Certificate...',
      issuedTitle: 'Issued Usufruct Certificate',
      complianceLedger: 'Compliance Audit Ledger Logs',
      docId: 'Doc ID:',
      beneficiary: 'Beneficiary:',
      districtParcel: 'District / Parcel:',
      area: 'Area:',
      rightsType: 'Rights Type:',
      entriesCount: 'Entries',
      noActivity: 'No ledger activity recorded yet.',
      accessRestricted: 'RESTRICTED VIEW: Access requires Provincial PIU Officer or FPMU Director role.',
    },
    accessibility: {
      title: 'Accessibility Controls',
      highContrast: 'High Contrast Mode',
      highContrastToggle: 'Toggle High Contrast Styling Mode',
      textSize: 'Text Size',
      normal: 'Normal',
      large: 'Large',
      xlarge: 'Extra Large',
      highContrastOn: 'High Contrast ON',
      highContrastOff: 'High Contrast OFF',
      langToggle: 'Switch to Urdu (اردو)',
    },
    roles: {
      enumerator: 'Field Enumerator',
      officer: 'Provincial PIU Officer',
      director: 'FPMU Director',
      currentRole: 'Current Role',
      accessRestrictedMessage: 'ACCESS RESTRICTED: This section contains sensitive fiduciary/financial data accessible only to authorized roles.',
    },
    grm: {
      title: 'Grievance Redressal Mechanism (GRM)',
      subtitle: 'IFRAP Component 3 • Complaint Tracking & Resolution Ledger',
      totalTickets: 'Total Tickets',
      openEscalated: 'Open / Escalated',
      slaCompliance: 'SLA Compliance',
      ledgerTitle: 'Active GRM Ledger',
    },
    admin: {
      title: 'System Admin Dashboard',
      subtitle: 'IFRAP Component 3 • FPMU Director Overview',
      userManagement: 'User Management',
      dataSync: 'Data Source Sync',
    },
  },
  ur: {
    nav: {
      overview: 'جائزہ',
      webgis: 'ویب جی آئی ایس نقشہ',
      telemetry: 'ٹیلی میٹری ڈیش بورڈ',
      fiduciary: 'فڈیوشری شیلڈ',
      grm: 'شکایات کا ازالہ (GRM)',
      admin: 'ایڈمن پینل',
      systemOnline: 'سسٹم آن لائن',
      appTitle: 'میراب',
      appSubtitle: 'آئی ایف آر اے پی کمپوننٹ 3 پلیٹ فارم',
      skipToContent: 'بنیادی مواد پر جائیں',
    },
    map: {
      title: 'ڈی کولونئیل جغرافیائی لیئر کنٹرول',
      subtitle: 'بلوچستان کاریز کا نظام اور مقامی پانی کا انتظام',
      layerControl: 'لیئر کا انداز',
      technocratic: 'ٹیکنو کریٹک معیاری',
      decolonial: 'ڈی کولونئیل (آبائی علم) لیئر',
      center: 'مرکز',
      zoomLevel: 'زوم لیول',
      activeLayer: 'فعال لیئر',
      selectedDetails: 'منتخب کردہ خصوصیات کی تفصیلات',
      customaryRights: 'روایتی حقوق / نوٹس',
      reactMapGl: 'ری ایکٹ میپ جی ایل',
    },
    telemetry: {
      title: 'سینیئن کثیر جہتی غربت کا انڈیکس اور',
      titleAccent: 'ٹیلی میٹری ڈیش بورڈ',
      subtitle: 'بلوچستان کاریز کی بحالی اور کمیونٹی واٹر مینجمنٹ کی مقدار کے لحاظ سے نگرانی (IFRAP جزو 3)۔ واٹر انفراسٹرکچر، روایتی حکمرانی، موسمیاتی لچک، اور معاشی پائیداری کا جائزہ (MPI = H × A)۔',
      badge: 'IFRAP جزو 3 • ایم اینڈ ای ٹیلی میٹری انجن',
      totalPopulation: 'کل آبادی',
      populationSub: 'بلوچستان کے 6 اضلاع',
      activeKarez: 'فعال کاریز سسٹمز',
      rehabilitatedSub: 'بحال شدہ اور مانیٹر شدہ',
      avgMPI: 'اوسط سینیئن ایم پی آئی',
      mpiFormulaSub: 'H = ہیڈ کاؤنٹ | A = شدت',
      beneficiaryHH: 'مستفید کنندہ خاندان',
      waterAllocSub: 'روایتی پانی کی تقسیم',
      selectDistrict: 'IFRAP ضلع منتخب کریں',
      selectDistrictSub: 'سینیئن ایم پی آئی صلاحیت کا اسکور اور میٹرکس چیک کرنے کے لیے ضلع کا انتخاب کریں',
      exportCSV: 'ایکسپورٹ CSV',
      exportJSON: 'ایکسپورٹ JSON',
      downloadReport: 'رپورٹ ڈاؤن لوڈ کریں',
      mpiScore: 'ایم پی آئی اسکور',
      deprivationIndex: 'صلاحیت کی محرومی کا انڈیکس',
      headcountRatio: 'ہیڈ کاؤنٹ تناسب (H)',
      povertyIntensity: 'غربت کی شدت (A)',
      formulaExplanation: 'کثیر جہتی غربت کا شکار آبادی کا تناسب برائے اوسط محرومی کی شدت۔',
      mirabCouncil: 'میراب کونسل',
      capabilityBreakdown: '4-جہتی صلاحیت کی تفصیل',
      capabilityBreakdownSub: 'پانی کی حکمرانی کی اہم جہتوں میں صلاحیت کا اسکور (0% = مکمل محرومی، 100% = مکمل صلاحیت)',
      deprivation: 'محرومی',
      ifrapMetrics: 'IFRAP جزو 3 کی صلاحیت کے میٹرکس',
      ifrapMetricsSub: 'بلوچستان کاریز کی بحالی کے فیلڈ اشارے کے ساتھ اصل وقت کے اشاریے',
      filterAll: 'تمام',
      fieldObservations: 'عملی علمِ انسان (ایپلائیڈ اینتھروپولوجی) فیلڈ مشاہدات',
      fieldObsSub: 'روایتی پانی کی تقسیم اور حقِ انتفاع کا جائزہ',
      districtCoordinates: 'ضلعی احداثیات',
      beneficiaryPopulation: 'مستفید آبادی',
      waterMasterCouncil: 'میراب واٹر کونسل',
      target: 'ہدف',
    },
    usufruct: {
      title: 'روایتی قانونی حقوق کا سرٹیفکیٹ جنریٹر',
      subtitle: 'بلوچستان کاریز برادریوں کے لیے قانونی طور پر پابند روایتی زمین کے استعمال کا سرٹیفکیٹ جاری کریں۔',
      badge: 'فڈیوشری شیلڈ • حقِ انتفاع جنریٹر',
      beneficiaryLabel: 'مستفید کنندہ / قبیلے کا نام *',
      beneficiaryPlaceholder: 'مثلاً مری-بگٹی اتحاد / کاکڑ قبائلی فیڈریشن',
      districtLabel: 'بلوچستان کا ضلع',
      parcelIdLabel: 'زمین کا پارسل آئی ڈی',
      parcelIdPlaceholder: 'مثلاً BAL-KAREZ-99',
      areaLabel: 'رقبہ (ہیکٹر) *',
      rightsTypeLabel: 'روایتی حقوق کی قسم',
      generateCertButton: 'روایتی حقِ انتفاع سرٹیفکیٹ جاری کریں',
      generatingCertButton: 'سرٹیفکیٹ جاری ہو رہا ہے...',
      issuedTitle: 'جاری شدہ حقِ انتفاع سرٹیفکیٹ',
      complianceLedger: 'تعمیل آڈٹ لیجر لاگز',
      docId: 'دستاویز آئی ڈی:',
      beneficiary: 'مستفید کنندہ:',
      districtParcel: 'ضلع / پارسل:',
      area: 'رقبہ:',
      rightsType: 'حقوق کی قسم:',
      entriesCount: 'اندراجات',
      noActivity: 'ابھی تک کوئی لاگ سرگرمی ریکارڈ نہیں ہوئی ہے۔',
      accessRestricted: 'ممنوعہ منظر: رسائی کے لیے صوبائی پی آئی یو آفیسر یا ایف پی ایم یو ڈائریکٹر کا عہدہ ضروری ہے۔',
    },
    accessibility: {
      title: 'قابلیتِ رسائی کے کنٹرولز',
      highContrast: 'ہائی کنٹراسٹ موڈ',
      highContrastToggle: 'ہائی کنٹراسٹ موڈ کو فعال یا غیر فعال کریں',
      textSize: 'متن کا سائز',
      normal: 'نارمل',
      large: 'بڑا',
      xlarge: 'بہت بڑا',
      highContrastOn: 'ہائی کنٹراسٹ فعال',
      highContrastOff: 'ہائی کنٹراسٹ غیر فعال',
      langToggle: 'Switch to English (انگریزی)',
    },
    roles: {
      enumerator: 'فیلڈ شمار کنندہ',
      officer: 'صوبائی پی آئی یو آفیسر',
      director: 'ایف پی ایم یو ڈائریکٹر',
      currentRole: 'موجودہ عہدہ',
      accessRestrictedMessage: 'رسائی محدود ہے: یہ حصہ صرف مجاز عہدیداروں کے لیے ہے۔',
    },
    grm: {
      title: 'شکایات کے ازالے کا طریقہ کار (GRM)',
      subtitle: 'IFRAP جزو 3 • شکایات سے باخبر رہنے کا لیجر',
      totalTickets: 'کل ٹکٹ',
      openEscalated: 'زیر التوا / بڑھائی گئی',
      slaCompliance: 'ایس ایل اے کی تعمیل',
      ledgerTitle: 'فعال GRM لیجر',
    },
    admin: {
      title: 'سسٹم ایڈمن ڈیش بورڈ',
      subtitle: 'IFRAP جزو 3 • ایف پی ایم یو ڈائریکٹر کا جائزہ',
      userManagement: 'صارف کا انتظام',
      dataSync: 'ڈیٹا ہم آہنگی',
    },
  },
};

export interface I18nContextType {
  language: Language;
  dir: 'ltr' | 'rtl';
  t: TranslationDictionary;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const I18nContext = createContext<I18nContextType>({
  language: 'en',
  dir: 'ltr',
  t: translations.en,
  setLanguage: () => {},
  toggleLanguage: () => {},
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('app_language') as Language;
    if (saved === 'en' || saved === 'ur') {
      setLanguageState(saved);
      document.documentElement.lang = saved;
      document.documentElement.dir = saved === 'ur' ? 'rtl' : 'ltr';
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
    document.documentElement.lang = lang; // lang="ur" when Urdu
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr'; // dir="rtl" when Urdu
  };

  const toggleLanguage = () => {
    const nextLang: Language = language === 'en' ? 'ur' : 'en';
    setLanguage(nextLang);
  };

  const dir = language === 'ur' ? 'rtl' : 'ltr';
  const t = translations[language];

  return (
    <I18nContext.Provider value={{ language, dir, t, setLanguage, toggleLanguage }}>
      <div dir={dir} className={language === 'ur' ? 'font-urdu leading-relaxed' : ''}>
        {children}
      </div>
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
