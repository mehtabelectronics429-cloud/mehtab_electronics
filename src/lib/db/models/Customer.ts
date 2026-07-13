import { Schema, type Model, type Types } from "mongoose";
import { registerModel } from "@/lib/db/registerModel";

export interface ICustomer {
  _id: Types.ObjectId;
  name: string;
  phone: string;
  whatsapp: string;
  address: string;
  mapUrl: string;
  notes: string;
  balance: number;
  installations: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<ICustomer>(
  {
    name: { type: String, required: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },
    whatsapp: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    mapUrl: { type: String, default: "" },
    notes: { type: String, default: "" },
    balance: { type: Number, default: 0 },
    installations: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

schema.index({ name: "text", phone: "text", whatsapp: "text", address: "text" });

export const Customer: Model<ICustomer> = registerModel<ICustomer>("Customer", schema);
