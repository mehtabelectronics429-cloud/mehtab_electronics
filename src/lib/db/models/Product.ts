import { Schema, type Model, type Types } from "mongoose";
import { registerModel } from "@/lib/db/registerModel";

export interface IProduct {
  _id: Types.ObjectId;
  category: string;
  brand: string;
  model: string;
  sku: string;
  purchasePrice: number;
  sellingPrice: number;
  warranty: string;
  stock: number;
  description: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IProduct>(
  {
    category: { type: String, required: true, trim: true, index: true },
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true, unique: true },
    purchasePrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    warranty: { type: String, default: "" },
    stock: { type: Number, default: 0, min: 0 },
    description: { type: String, default: "" },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

schema.index({ brand: "text", model: "text", sku: "text", category: "text" });

export const Product: Model<IProduct> = registerModel<IProduct>("Product", schema);
