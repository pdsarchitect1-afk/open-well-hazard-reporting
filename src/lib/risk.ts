import type {
  Condition,
  Depth,
  RiskFactor,
  RiskLevel,
  WaterPresent,
} from "./constants";

export interface RiskInput {
  condition?: Condition;
  depth?: Depth;
  waterPresent?: WaterPresent;
  riskFactors?: RiskFactor[];
  hasAccident?: boolean;
}

const CONDITION_SCORE: Record<Condition, number> = {
  "Completely open": 3,
  "Damaged cover": 2,
  "Unsafe boundary wall": 2,
  "No warning signs": 1,
  "Partially covered": 1,
};

const DEPTH_SCORE: Record<Depth, number> = {
  ">50 ft": 3,
  "25-50 ft": 2,
  "10-25 ft": 1,
  "<10 ft": 0,
  Unknown: 1,
};

const HIGH_PROXIMITY: RiskFactor[] = [
  "Near road",
  "Near school",
  "Near playground",
  "Near residential area",
  "Near highway",
  "Near tourist area",
];

/**
 * Compute a weighted hazard score and bucket it into a risk level.
 * Conservative by design: unknown / sparse data still yields at least "Medium"
 * because an unverified open well is inherently dangerous.
 */
export function calculateRisk(input: RiskInput): RiskLevel {
  // No hazard signals provided (the form may omit these fields): treat an
  // unverified open well as Medium rather than Low — it is inherently risky.
  const hasSignal =
    Boolean(input.condition) ||
    Boolean(input.depth) ||
    input.waterPresent === "Yes" ||
    (input.riskFactors?.length ?? 0) > 0 ||
    Boolean(input.hasAccident);
  if (!hasSignal) return "Medium";

  let score = 0;

  if (input.condition) score += CONDITION_SCORE[input.condition] ?? 0;
  if (input.depth) score += DEPTH_SCORE[input.depth] ?? 0;
  if (input.waterPresent === "Yes") score += 2;

  const factors = input.riskFactors ?? [];
  for (const f of factors) {
    if (HIGH_PROXIMITY.includes(f)) score += 2;
    else score += 1; // near farm / near temple
  }

  // Hard overrides → always Critical.
  const completelyOpen = input.condition === "Completely open";
  const nearPeople =
    factors.includes("Near school") ||
    factors.includes("Near road") ||
    factors.includes("Near playground") ||
    factors.includes("Near residential area");

  if (input.hasAccident) return "Critical";
  if (completelyOpen && nearPeople) return "Critical";

  if (score >= 8) return "Critical";
  if (score >= 5) return "High";
  if (score >= 2) return "Medium";
  return "Low";
}

export function riskColor(level: RiskLevel, isResolved = false): string {
  if (isResolved) return "#16a34a";
  switch (level) {
    case "Critical":
      return "#dc2626";
    case "High":
      return "#f97316";
    case "Medium":
      return "#eab308";
    case "Low":
    default:
      return "#16a34a";
  }
}
