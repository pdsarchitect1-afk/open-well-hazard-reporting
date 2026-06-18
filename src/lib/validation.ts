import { z } from "zod";
import {
  ACCESSIBILITY,
  CONDITIONS,
  DEPTHS,
  JURISDICTIONS,
  RISK_FACTORS,
  STATUSES,
  WATER_PRESENT,
  WELL_TYPES,
} from "./constants";

export const createReportSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracyMeters: z.number().optional(),
  photos: z
    .array(
      z.object({
        url: z.string().url(),
        publicId: z.string().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
      })
    )
    .min(1, "किमान एक फोटो आवश्यक आहे"),
  address: z
    .object({
      district: z.string().optional(),
      taluka: z.string().optional(),
      village: z.string().optional(),
      landmark: z.string().optional(),
      road: z.string().optional(),
      surveyNumber: z.string().optional(),
      pin: z.string().optional(),
    })
    .optional(),
  description: z.string().max(2000).optional(),
  wellType: z.enum(WELL_TYPES).optional(),
  condition: z.enum(CONDITIONS).optional(),
  depth: z.enum(DEPTHS).optional(),
  waterPresent: z.enum(WATER_PRESENT).optional(),
  accessibility: z.enum(ACCESSIBILITY).optional(),
  riskFactors: z.array(z.enum(RISK_FACTORS)).optional(),
  responsible: z
    .object({
      ownerName: z.string().optional(),
      ownerKnown: z.boolean().optional(),
      jurisdiction: z.enum(JURISDICTIONS).optional(),
      responsiblePerson: z.string().optional(),
    })
    .optional(),
  reporter: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
    })
    .optional(),
  force: z.boolean().optional(), // skip duplicate check when user insists
});

export type CreateReportInput = z.infer<typeof createReportSchema>;

export const patchReportSchema = z.object({
  status: z.enum(STATUSES).optional(),
  note: z.string().max(2000).optional(),
  by: z.string().optional(),
  assignedAuthority: z
    .object({
      name: z.string(),
      role: z.string(),
      contact: z.string().optional(),
    })
    .optional(),
});
