import mongoose, { Schema, model, models } from "mongoose";
import {
  ACCESSIBILITY,
  CONDITIONS,
  DEPTHS,
  JURISDICTIONS,
  RISK_FACTORS,
  RISK_LEVELS,
  STATUSES,
  WATER_PRESENT,
  WELL_TYPES,
} from "@/lib/constants";

const PointSchema = new Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  { _id: false }
);

const PhotoSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: String,
    width: Number,
    height: Number,
  },
  { _id: false }
);

const AddressSchema = new Schema(
  {
    district: String,
    taluka: String,
    village: String,
    landmark: String,
    road: String,
    surveyNumber: String,
    pin: String,
  },
  { _id: false }
);

const ResponsibleSchema = new Schema(
  {
    ownerName: String,
    ownerKnown: Boolean,
    jurisdiction: { type: String, enum: JURISDICTIONS },
    responsiblePerson: String,
  },
  { _id: false }
);

const AuthoritySchema = new Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    contact: String,
  },
  { _id: false }
);

const StatusEventSchema = new Schema(
  {
    status: { type: String, enum: STATUSES, required: true },
    note: String,
    at: { type: Date, default: Date.now },
    by: String,
  },
  { _id: false }
);

const ReportSchema = new Schema(
  {
    reportId: { type: String, required: true, unique: true, index: true },
    location: { type: PointSchema, required: true },
    accuracyMeters: Number,
    address: { type: AddressSchema, default: {} },
    photos: { type: [PhotoSchema], default: [] },
    description: String,
    wellType: { type: String, enum: WELL_TYPES },
    condition: { type: String, enum: CONDITIONS },
    depth: { type: String, enum: DEPTHS },
    waterPresent: { type: String, enum: WATER_PRESENT },
    accessibility: { type: String, enum: ACCESSIBILITY },
    riskFactors: { type: [String], enum: RISK_FACTORS, default: [] },
    riskLevel: { type: String, enum: RISK_LEVELS, default: "Medium" },
    responsible: { type: ResponsibleSchema, default: {} },
    suggestedAuthorities: { type: [AuthoritySchema], default: [] },
    reporter: {
      type: new Schema(
        { name: String, phone: String },
        { _id: false }
      ),
      default: {},
    },
    status: { type: String, enum: STATUSES, default: "Reported", index: true },
    statusHistory: { type: [StatusEventSchema], default: [] },
    supports: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Geospatial index powers the public map and the 20m duplicate check.
ReportSchema.index({ location: "2dsphere" });
ReportSchema.index({ "address.district": 1 });

export const Report =
  (models.Report as mongoose.Model<any>) || model("Report", ReportSchema);
