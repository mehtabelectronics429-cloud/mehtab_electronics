import { Schema, type Model, type Types } from "mongoose";
import { registerModel } from "@/lib/db/registerModel";

export type JobType = "whatsapp.send" | "report.export" | "stock.recalc";
export type JobStatus = "pending" | "processing" | "completed" | "failed";

export interface IJob {
  _id: Types.ObjectId;
  type: JobType;
  payload: Record<string, unknown>;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  error: string;
  scheduledAt: Date;
  processedAt: Date | null;
  result: Record<string, unknown> | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IJob>(
  {
    type: {
      type: String,
      enum: ["whatsapp.send", "report.export", "stock.recalc"],
      required: true,
      index: true,
    },
    payload: { type: Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
      index: true,
    },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    error: { type: String, default: "" },
    scheduledAt: { type: Date, default: Date.now, index: true },
    processedAt: { type: Date, default: null },
    result: { type: Schema.Types.Mixed, default: null },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

export const Job: Model<IJob> = registerModel<IJob>("Job", schema);
