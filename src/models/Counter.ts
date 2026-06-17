import mongoose, { Schema, model, models } from "mongoose";

export interface CounterDoc {
  _id: string; // e.g. "PUN-2026"
  seq: number;
}

const CounterSchema = new Schema<CounterDoc>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export const Counter =
  (models.Counter as mongoose.Model<CounterDoc>) ||
  model<CounterDoc>("Counter", CounterSchema);
