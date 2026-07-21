import { Schema, type Model, type Types } from "mongoose";
import { registerModel } from "@/lib/db/registerModel";

export type PurchaseStatus = "unpaid" | "partial" | "paid";

export interface IPurchaseItem {
  productId: Types.ObjectId | null;
  name: string;
  qty: number;
  unitCost: number;
}

export interface IPurchase {
  _id: Types.ObjectId;
  ref: string;
  supplierId: Types.ObjectId;
  /** The supplier's own invoice/bill number. */
  supplierInvoiceNo: string;
  items: IPurchaseItem[];
  discount: number;
  taxRate: number;
  shipping: number;
  /** Grand total of the purchase. */
  amount: number;
  paid: number;
  status: PurchaseStatus;
  date: Date;
  notes: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const itemLine = new Schema<IPurchaseItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", default: null },
    name: { type: String, required: true, trim: true },
    qty: { type: Number, default: 1, min: 0 },
    unitCost: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const schema = new Schema<IPurchase>(
  {
    ref: { type: String, required: true, unique: true, index: true },
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier", required: true, index: true },
    supplierInvoiceNo: { type: String, default: "" },
    items: { type: [itemLine], default: [] },
    discount: { type: Number, default: 0, min: 0 },
    taxRate: { type: Number, default: 0, min: 0 },
    shipping: { type: Number, default: 0, min: 0 },
    amount: { type: Number, required: true, min: 0 },
    paid: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ["unpaid", "partial", "paid"], default: "unpaid", index: true },
    date: { type: Date, required: true, index: true },
    notes: { type: String, default: "" },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

export const Purchase: Model<IPurchase> = registerModel<IPurchase>("Purchase", schema);
