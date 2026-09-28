import { Schema, type Model, type Types } from "mongoose";
import { registerModel } from "@/lib/db/registerModel";

export type QuotationStatus = "draft" | "sent" | "accepted" | "converted";
export type QuotationLineKind = "product" | "labour" | "material" | "other";

export interface IQuotationItem {
  productId: Types.ObjectId | null;
  description: string;
  qty: number;
  unitPrice: number;
  kind: QuotationLineKind;
}

export interface IQuotation {
  _id: Types.ObjectId;
  number: string;
  customerId: Types.ObjectId | null;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  title: string;
  date: Date;
  validUntil: Date | null;
  notes: string;
  discount: number;
  shipping: number;
  taxRate: number;
  items: IQuotationItem[];
  total: number;
  status: QuotationStatus;
  /** Set once the quotation has been converted into an invoice. */
  invoiceId: Types.ObjectId | null;
  createdBy: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const itemSchema = new Schema<IQuotationItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", default: null },
    description: { type: String, required: true, trim: true },
    qty: { type: Number, required: true, min: 0 },
    unitPrice: { type: Number, required: true, min: 0 },
    kind: {
      type: String,
      enum: ["product", "labour", "material", "other"],
      default: "product",
    },
  },
  { _id: false },
);

const schema = new Schema<IQuotation>(
  {
    number: { type: String, required: true, trim: true, index: true },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
      index: true,
    },
    customerName: { type: String, default: "", trim: true },
    customerPhone: { type: String, default: "", trim: true },
    customerAddress: { type: String, default: "", trim: true },
    title: { type: String, default: "", trim: true },
    date: { type: Date, required: true, index: true },
    validUntil: { type: Date, default: null },
    notes: { type: String, default: "" },
    discount: { type: Number, default: 0, min: 0 },
    shipping: { type: Number, default: 0, min: 0 },
    taxRate: { type: Number, default: 0, min: 0 },
    items: { type: [itemSchema], default: [] },
    total: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["draft", "sent", "accepted", "converted"],
      default: "draft",
      index: true,
    },
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice", default: null },
    createdBy: { type: String, default: "" },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
);

export const Quotation: Model<IQuotation> = registerModel<IQuotation>(
  "Quotation",
  schema,
);
