// Canonical English enum values stored in the DB.
// Marathi labels for the citizen UI live in src/lib/i18n/mr.ts.

export const WELL_TYPES = [
  "Open well",
  "Borewell",
  "Abandoned well",
  "Agricultural well",
  "Irrigation well",
  "Construction pit",
  "Water storage pit",
] as const;

export const CONDITIONS = [
  "Completely open",
  "Partially covered",
  "Damaged cover",
  "Unsafe boundary wall",
  "No warning signs",
] as const;

export const DEPTHS = ["<10 ft", "10-25 ft", "25-50 ft", ">50 ft", "Unknown"] as const;

export const WATER_PRESENT = ["Yes", "No", "Unknown"] as const;

export const ACCESSIBILITY = [
  "Directly accessible",
  "Behind fence",
  "Inside private property",
  "Near public road",
] as const;

export const RISK_FACTORS = [
  "Near road",
  "Near school",
  "Near playground",
  "Near farm",
  "Near residential area",
  "Near highway",
  "Near temple",
  "Near tourist area",
] as const;

export const STATUSES = [
  "Reported",
  "Under Review",
  "Assigned",
  "Work Scheduled",
  "In Progress",
  "Resolved",
  "Reopened",
] as const;

export const RISK_LEVELS = ["Low", "Medium", "High", "Critical"] as const;

export const JURISDICTIONS = [
  "Gram Panchayat",
  "Municipality",
  "MIDC",
  "PWD",
  "Forest Department",
  "Revenue Department",
] as const;

// Statuses considered "resolved" (closed) for metrics + map colour.
export const RESOLVED_STATUSES: readonly Status[] = ["Resolved"];

export type WellType = (typeof WELL_TYPES)[number];
export type Condition = (typeof CONDITIONS)[number];
export type Depth = (typeof DEPTHS)[number];
export type WaterPresent = (typeof WATER_PRESENT)[number];
export type Accessibility = (typeof ACCESSIBILITY)[number];
export type RiskFactor = (typeof RISK_FACTORS)[number];
export type Status = (typeof STATUSES)[number];
export type RiskLevel = (typeof RISK_LEVELS)[number];
export type Jurisdiction = (typeof JURISDICTIONS)[number];

// Maharashtra districts → 3-letter codes used in the human-readable report ID.
export const DISTRICT_CODES: Record<string, string> = {
  Ahmednagar: "ANR",
  Akola: "AKL",
  Amravati: "AMR",
  "Chhatrapati Sambhajinagar": "CSN",
  Aurangabad: "CSN",
  Beed: "BED",
  Bhandara: "BHN",
  Buldhana: "BLD",
  Chandrapur: "CHN",
  Dhule: "DHL",
  Gadchiroli: "GAD",
  Gondia: "GON",
  Hingoli: "HIN",
  Jalgaon: "JAL",
  Jalna: "JLN",
  Kolhapur: "KOL",
  Latur: "LAT",
  "Mumbai City": "MUM",
  "Mumbai Suburban": "MMS",
  Mumbai: "MUM",
  Nagpur: "NAG",
  Nanded: "NND",
  Nandurbar: "NDB",
  Nashik: "NAS",
  Dharashiv: "DHR",
  Osmanabad: "DHR",
  Palghar: "PLG",
  Parbhani: "PAR",
  Pune: "PUN",
  Raigad: "RAI",
  Ratnagiri: "RAT",
  Sangli: "SAN",
  Satara: "SAT",
  Sindhudurg: "SIN",
  Solapur: "SOL",
  Thane: "THA",
  Wardha: "WAR",
  Washim: "WAS",
  Yavatmal: "YAV",
};

export const DISTRICTS = Object.keys(DISTRICT_CODES).filter(
  (d, i, arr) =>
    // keep only the first (canonical) name per code for the dropdown
    arr.findIndex((x) => DISTRICT_CODES[x] === DISTRICT_CODES[d]) === i
);

// Radius (metres) within which a new report is treated as a possible duplicate.
export const DUPLICATE_RADIUS_M = 20;
