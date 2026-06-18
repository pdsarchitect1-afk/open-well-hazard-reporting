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
} from "./constants";

export interface Photo {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
}

export interface Address {
  district?: string;
  taluka?: string;
  village?: string;
  landmark?: string;
  road?: string;
  surveyNumber?: string;
  pin?: string;
}

export interface Responsible {
  ownerName?: string;
  ownerKnown?: boolean;
  jurisdiction?: Jurisdiction;
  responsiblePerson?: string;
}

export interface Authority {
  name: string;
  role: string;
  contact?: string;
}

export interface StatusEvent {
  status: Status;
  note?: string;
  at: string; // ISO date
  by?: string;
}

export interface ReportDTO {
  _id: string;
  reportId: string;
  location: { type: "Point"; coordinates: [number, number] }; // [lng, lat]
  accuracyMeters?: number;
  address: Address;
  photos: Photo[];
  description?: string;
  wellType?: WellType;
  condition?: Condition;
  depth?: Depth;
  waterPresent?: WaterPresent;
  accessibility?: Accessibility;
  riskFactors: RiskFactor[];
  riskLevel: RiskLevel;
  responsible?: Responsible;
  suggestedAuthorities: Authority[];
  reporter?: { name?: string; phone?: string };
  status: Status;
  statusHistory: StatusEvent[];
  supports: number;
  createdAt: string;
  updatedAt: string;
}
