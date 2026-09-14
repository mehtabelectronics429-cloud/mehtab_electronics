import { Schema, type Model, type Types } from "mongoose";
import { registerModel } from "@/lib/db/registerModel";

export type PaymentType =
  | "daily"
  | "weekly"
  | "monthly"
  | "frequent"
  | "random"
  | "bonus"
  | "advance";

export type PaymentMethod = "cash" | "bank" | "card" | "other";

export interface IEmployeePayment {
  _id: Types.ObjectId;
  employeeId: Types.ObjectId;
  employeeName: string;
  amount: number;
  type: PaymentType;
  method: PaymentMethod;
  date: Date;
  note: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IEmployeePayment>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    employeeName: { type: String, default: "", trim: true },
    amount: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      enum: [
        "daily",
        "weekly",
        "monthly",
        "frequent",
        "random",
        "bonus",
        "advance",
      ],
      default: "monthly",
      index: true,
    },
    method: {
      type: String,
      enum: ["cash", "bank", "card", "other"],
      default: "cash",
    },
    date: { type: Date, required: true, index: true },
    note: { type: String, default: "" },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
);

export const EmployeePayment: Model<IEmployeePayment> =
  registerModel<IEmployeePayment>("EmployeePayment", schema);
