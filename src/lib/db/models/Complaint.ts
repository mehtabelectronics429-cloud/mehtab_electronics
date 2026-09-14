import { Schema, type Model, type Types } from "mongoose";
import { registerModel } from "@/lib/db/registerModel";

export type ComplaintStatus = "open" | "assigned" | "resolved" | "cancelled";

/** A product replaced / used while resolving a complaint. */
export interface IComplaintItem {
  productId?: Types.ObjectId | null;
  description: string;
  qty: number;
  unitPrice: number;
}

export interface IComplaint {
  _id: Types.ObjectId;
  number: string;
  customerId: Types.ObjectId | null;
  customerName: string;
  phone: string;
  address: string;
  complaint: string;
  status: ComplaintStatus;
  /** Employee who went to site and resolved it. */
  resolvedById: Types.ObjectId | null;
  resolvedByName: string;
  resolvedAt: Date | null;
  /** Labour / service charge received for the visit. */
  serviceCharge: number;
  /** Products replaced or used on site. */
  items: IComplaintItem[];
  /** Invoice generated on resolve (revenue + stock + ledger). */
  invoiceId: Types.ObjectId | null;
  date: Date;
  notes: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IComplaint>(
  {
    number: { type: String, required: true, unique: true, index: true },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
      index: true,
    },
    customerName: { type: String, required: true, trim: true, index: true },
    phone: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
    complaint: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["open", "assigned", "resolved", "cancelled"],
      default: "open",
      index: true,
    },
    resolvedById: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
      index: true,
    },
    resolvedByName: { type: String, default: "" },
    resolvedAt: { type: Date, default: null },
    serviceCharge: { type: Number, default: 0, min: 0 },
    items: {
      type: [
        new Schema<IComplaintItem>(
          {
            productId: {
              type: Schema.Types.ObjectId,
              ref: "Product",
              default: null,
            },
            description: { type: String, required: true, trim: true },
            qty: { type: Number, default: 1, min: 0 },
            unitPrice: { type: Number, default: 0, min: 0 },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
      default: null,
    },
    date: { type: Date, required: true, index: true },
    notes: { type: String, default: "" },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
);

schema.index({ customerName: "text", phone: "text", address: "text", complaint: "text" });

export const Complaint: Model<IComplaint> = registerModel<IComplaint>(
  "Complaint",
  schema,
);
