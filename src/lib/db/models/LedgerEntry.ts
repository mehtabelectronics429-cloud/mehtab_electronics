import { Schema, type Model, type Types } from "mongoose";
import { registerModel } from "@/lib/db/registerModel";

export interface ILedgerEntry {
  _id: Types.ObjectId;
  customerId: Types.ObjectId;
  employeeId: Types.ObjectId | null;
  invoiceId: Types.ObjectId | null;
  installationId: Types.ObjectId | null;
  type: "invoice" | "payment" | "credit" | "debit" | "adjustment";
  amount: number;
  status: "pending" | "approved";
  date: Date;
  note: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<ILedgerEntry>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", default: null, index: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice", default: null },
    installationId: { type: Schema.Types.ObjectId, ref: "Installation", default: null, index: true },
    type: {
      type: String,
      enum: ["invoice", "payment", "credit", "debit", "adjustment"],
      required: true,
      index: true,
    },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "approved"], default: "pending", index: true },
    date: { type: Date, required: true, index: true },
    note: { type: String, default: "" },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

export const LedgerEntry: Model<ILedgerEntry> = registerModel<ILedgerEntry>("LedgerEntry", schema);
