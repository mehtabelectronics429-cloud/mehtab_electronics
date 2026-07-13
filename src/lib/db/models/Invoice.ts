import { Schema, type Model, type Types } from "mongoose";
import { registerModel } from "@/lib/db/registerModel";

export type InvoiceStatus = "draft" | "pending" | "approved" | "rejected";

export interface IInvoice {
  _id: Types.ObjectId;
  number: string;
  customerId: Types.ObjectId;
  employeeId: Types.ObjectId | null;
  installationId: Types.ObjectId | null;
  amount: number;
  paid: number;
  status: InvoiceStatus;
  date: Date;
  notes: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IInvoice>(
  {
    number: { type: String, required: true, unique: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", default: null, index: true },
    installationId: { type: Schema.Types.ObjectId, ref: "Installation", default: null },
    amount: { type: Number, required: true, min: 0 },
    paid: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ["draft", "pending", "approved", "rejected"], default: "draft", index: true },
    date: { type: Date, required: true, index: true },
    notes: { type: String, default: "" },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

export const Invoice: Model<IInvoice> = registerModel<IInvoice>("Invoice", schema);
