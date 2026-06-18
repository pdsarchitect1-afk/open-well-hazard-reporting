// All citizen-facing strings in Marathi.
// Structured as a single object so Hindi/English can be added later
// (e.g. src/lib/i18n/hi.ts) and selected via a toggle without code changes.

import type {
  Accessibility,
  Condition,
  Depth,
  Jurisdiction,
  RiskFactor,
  RiskLevel,
  Status,
  WaterPresent,
  WellType,
} from "@/lib/constants";

export const mr = {
  appName: "विहीर सुरक्षा",
  tagline: "धोकादायक उघड्या विहिरींची तक्रार करा — अपघात टाळा",

  nav: {
    report: "तक्रार नोंदवा",
    map: "नकाशा",
    home: "मुख्यपृष्ठ",
  },

  home: {
    heroTitle: "उघडी विहीर दिसली का?",
    heroSubtitle:
      "फक्त एक फोटो आणि ठिकाण द्या. लॉगिन नको, नोंदणी नको. ३० सेकंदात तक्रार पूर्ण.",
    reportCta: "धोकादायक विहीर नोंदवा",
    viewMap: "सर्व विहिरी नकाशावर पहा",
    howTitle: "हे कसे काम करते?",
    step1Title: "१. फोटो काढा",
    step1Desc: "विहिरीचा फोटो काढा किंवा गॅलरीतून निवडा.",
    step2Title: "२. ठिकाण द्या",
    step2Desc: "तुमचे GPS ठिकाण आपोआप घेतले जाते. नकाशावर पिन हलवून बरोबर करा.",
    step3Title: "३. नोंदवा",
    step3Desc: "तक्रार संबंधित अधिकाऱ्यांकडे पाठवली जाते व नकाशावर दिसते.",
    safetyNote:
      "धोका: उघड्या विहिरीजवळ जाऊ नका. लहान मुलांना दूर ठेवा. तातडीच्या मदतीसाठी १०८ वर कॉल करा.",
  },

  form: {
    title: "धोकादायक विहीर नोंदवा",
    subtitle: "फक्त फोटो आणि ठिकाण आवश्यक आहे. बाकी सर्व माहिती ऐच्छिक आहे.",

    photoLabel: "फोटो काढा / जोडा",
    photoHint: "विहिरीचा स्पष्ट फोटो जोडा (आवश्यक)",
    photoAdd: "फोटो जोडा",
    photoUploading: "फोटो अपलोड होत आहे...",
    photoAnother: "आणखी फोटो जोडा",

    locationLabel: "ठिकाण",
    locationHint: "तुमचे ठिकाण आपोआप घेतले जात आहे...",
    locationGet: "माझे ठिकाण घ्या",
    locationDrag: "पिन हलवून अचूक ठिकाण निवडा",
    locationSearchPh: "गाव / शहर / खूण शोधा...",
    locationSearchNone: "काही सापडले नाही",
    locationDenied:
      "ठिकाणाची परवानगी मिळाली नाही. कृपया नकाशावर पिन हलवून ठिकाण निवडा.",
    locating: "ठिकाण शोधत आहे...",

    moreDetails: "अधिक माहिती (ऐच्छिक)",
    moreDetailsHint: "अधिक माहिती दिल्यास अधिकाऱ्यांना मदत होते — पण आवश्यक नाही.",

    description: "थोडक्यात माहिती",
    descriptionPh: "उदा. शाळेजवळ उघडी विहीर, झाकण नाही",
    wellType: "विहिरीचा प्रकार",
    condition: "स्थिती",
    depth: "अंदाजे खोली",
    waterPresent: "पाणी आहे का?",
    accessibility: "जाण्याची सोय",
    riskFactors: "जवळपासचे धोके",

    landmark: "जवळची खूण",
    road: "रस्त्याचे नाव",
    surveyNumber: "सर्व्हे / गट नंबर",
    pin: "पिन कोड",
    district: "जिल्हा",
    taluka: "तालुका",
    village: "गाव",

    responsibleTitle: "जबाबदार व्यक्ती / विभाग",
    ownerName: "मालकाचे नाव",
    jurisdiction: "शासकीय विभाग",
    sarpanch: "सरपंच",
    gramSevak: "ग्रामसेवक",
    corporator: "नगरसेवक",
    mla: "आमदार",
    mp: "खासदार",

    reporterTitle: "तुमची माहिती (ऐच्छिक)",
    reporterHint: "अपडेट्ससाठी — कोणालाही दिसणार नाही.",
    reporterName: "तुमचे नाव",
    reporterPhone: "मोबाईल नंबर",

    submit: "तक्रार नोंदवा",
    submitting: "नोंदवत आहे...",
    needPhotoLocation: "कृपया फोटो आणि ठिकाण द्या",

    duplicateTitle: "ही विहीर आधीच नोंदवली आहे",
    duplicateBody:
      "जवळच एक तक्रार आधीच नोंदवलेली आहे. तीच विहीर असल्यास तुम्ही त्या तक्रारीला समर्थन देऊ शकता.",
    duplicateSupport: "या तक्रारीला समर्थन द्या",
    duplicateView: "तक्रार पहा",
    duplicateNew: "तरीही नवीन तक्रार नोंदवा",
  },

  success: {
    title: "तुमची तक्रार नोंदवली गेली आहे!",
    body: "धन्यवाद. तुमच्या तक्रारीचा क्रमांक खाली आहे. हा क्रमांक जपून ठेवा.",
    yourId: "तक्रार क्रमांक",
    viewReport: "तक्रार पहा",
    reportAnother: "आणखी एक नोंदवा",
    qrHint: "हा QR कोड स्कॅन करून तक्रारीची स्थिती पाहता येईल.",
  },

  detail: {
    status: "स्थिती",
    risk: "धोका पातळी",
    reportedOn: "नोंदवले",
    location: "ठिकाण",
    photos: "फोटो",
    supports: "समर्थन",
    support: "मी पण ही विहीर पाहिली (समर्थन द्या)",
    supported: "तुमचे समर्थन नोंदवले!",
    authorities: "संबंधित अधिकारी",
    timeline: "प्रगती",
    notFound: "तक्रार सापडली नाही.",
    openInMaps: "Google Maps मध्ये उघडा",
  },

  map: {
    title: "नोंदवलेल्या विहिरी",
    legend: "रंगांचा अर्थ",
    filterRisk: "धोका",
    filterStatus: "स्थिती",
    filterDistrict: "जिल्हा",
    all: "सर्व",
    loading: "नकाशा लोड होत आहे...",
    count: (n: number) => `${n} विहिरी`,
  },

  common: {
    optional: "ऐच्छिक",
    required: "आवश्यक",
    select: "निवडा",
    yes: "होय",
    no: "नाही",
    unknown: "माहीत नाही",
    back: "मागे",
    loading: "लोड होत आहे...",
    error: "काहीतरी चूक झाली. पुन्हा प्रयत्न करा.",
    offlineSaved: "इंटरनेट नाही — तक्रार जतन केली, नेट आल्यावर पाठवली जाईल.",
  },
};

// ---- Enum label maps (English value -> Marathi label) ----

export const RISK_LABELS: Record<RiskLevel, string> = {
  Low: "कमी",
  Medium: "मध्यम",
  High: "जास्त",
  Critical: "अति गंभीर",
};

export const STATUS_LABELS: Record<Status, string> = {
  Reported: "नोंदवले",
  "Under Review": "तपासणीत",
  Assigned: "जबाबदारी दिली",
  "Work Scheduled": "काम नियोजित",
  "In Progress": "काम सुरू",
  Resolved: "सोडवले",
  Reopened: "पुन्हा उघडले",
};

export const WELL_TYPE_LABELS: Record<WellType, string> = {
  "Open well": "उघडी विहीर",
  Borewell: "बोअरवेल",
  "Abandoned well": "बंद / सोडलेली विहीर",
  "Agricultural well": "शेतातील विहीर",
  "Irrigation well": "सिंचन विहीर",
  "Construction pit": "बांधकामाचा खड्डा",
  "Water storage pit": "पाणी साठवण खड्डा",
};

export const CONDITION_LABELS: Record<Condition, string> = {
  "Completely open": "पूर्ण उघडी",
  "Partially covered": "अर्धवट झाकलेली",
  "Damaged cover": "तुटलेले झाकण",
  "Unsafe boundary wall": "असुरक्षित कठडा",
  "No warning signs": "इशारा फलक नाही",
};

export const DEPTH_LABELS: Record<Depth, string> = {
  "<10 ft": "१० फूटांपेक्षा कमी",
  "10-25 ft": "१० – २५ फूट",
  "25-50 ft": "२५ – ५० फूट",
  ">50 ft": "५० फूटांपेक्षा जास्त",
  Unknown: "माहीत नाही",
};

export const WATER_LABELS: Record<WaterPresent, string> = {
  Yes: "होय",
  No: "नाही",
  Unknown: "माहीत नाही",
};

export const ACCESS_LABELS: Record<Accessibility, string> = {
  "Directly accessible": "थेट पोहोचता येते",
  "Behind fence": "कुंपणाच्या आत",
  "Inside private property": "खाजगी जागेत",
  "Near public road": "सार्वजनिक रस्त्याजवळ",
};

export const RISK_FACTOR_LABELS: Record<RiskFactor, string> = {
  "Near road": "रस्त्याजवळ",
  "Near school": "शाळेजवळ",
  "Near playground": "खेळाच्या मैदानाजवळ",
  "Near farm": "शेताजवळ",
  "Near residential area": "वस्तीजवळ",
  "Near highway": "महामार्गाजवळ",
  "Near temple": "मंदिराजवळ",
  "Near tourist area": "पर्यटनस्थळाजवळ",
};

export const JURISDICTION_LABELS: Record<Jurisdiction, string> = {
  "Gram Panchayat": "ग्रामपंचायत",
  Municipality: "नगरपालिका",
  MIDC: "एमआयडीसी",
  PWD: "सार्वजनिक बांधकाम विभाग",
  "Forest Department": "वन विभाग",
  "Revenue Department": "महसूल विभाग",
};
