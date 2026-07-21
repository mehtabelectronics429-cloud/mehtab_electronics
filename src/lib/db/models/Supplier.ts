import { Schema, type Model, type Types } from "mongoose";
import { registerModel } from "@/lib/db/registerModel";

export interface ISupplier {
  _id: Types.ObjectId;
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  /** What we owe the supplier (payables). Positive = we owe them. */
  balance: number;
  notes: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<ISupplier>(
  {
    name: { type: String, required: true, trim: true, index: true },
    company: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    email: { type: String, default: "", lowercase: true, trim: true },
    address: { type: String, default: "" },
    balance: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

export const Supplier: Model<ISupplier> = registerModel<ISupplier>("Supplier", schema);
