import { Schema, type Model, type Types } from "mongoose";
import { registerModel } from "@/lib/db/registerModel";

export type InstallationStatus =
  | "pending"
  | "assigned"
  | "in_progress"
  | "submitted"
  | "approved"
  | "rejected"
  | "completed";

export interface IInstallationMaterial {
  materialId: Types.ObjectId;
  qty: number;
  used: number;
}

export interface IInstallation {
  _id: Types.ObjectId;
  ref: string;
  customerId: Types.ObjectId;
  /** @deprecated prefer employeeIds — kept as lead technician for older records */
  employeeId: Types.ObjectId | null;
  employeeIds: Types.ObjectId[];
  invoiceId: Types.ObjectId | null;
  type: string;
  status: InstallationStatus;
  date: Date;
  amount: number;
  notes: string;
  materials: IInstallationMaterial[];
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const materialLine = new Schema<IInstallationMaterial>(
  {
    materialId: { type: Schema.Types.ObjectId, ref: "Material", required: true },
    qty: { type: Number, default: 0, min: 0 },
    used: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const schema = new Schema<IInstallation>(
  {
    ref: { type: String, required: true, unique: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", default: null, index: true },
    employeeIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "Employee" }],
      default: [],
      index: true,
    },
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice", default: null, index: true },
    type: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "assigned", "in_progress", "submitted", "approved", "rejected", "completed"],
      default: "pending",
      index: true,
    },
    date: { type: Date, required: true, index: true },
    amount: { type: Number, default: 0, min: 0 },
    notes: { type: String, default: "" },
    materials: { type: [materialLine], default: [] },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

export const Installation: Model<IInstallation> = registerModel<IInstallation>(
  "Installation",
  schema
);
