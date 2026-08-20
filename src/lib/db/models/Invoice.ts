import { Schema, type Model, type Types } from "mongoose";
import { registerModel } from "@/lib/db/registerModel";

export type InvoiceStatus = "draft" | "pending" | "approved" | "rejected";

export interface IInvoiceItem {
  description: string;
  qty: number;
  unitPrice: number;
  /** Catalogue product this line was sold from — enables restock on return. */
  productId?: Types.ObjectId | null;
}

/** A single returned line inside a return / credit note. */
export interface IInvoiceReturnItem {
  /** Index of the original line in `Invoice.items` this return applies to. */
  index: number;
  description: string;
  qty: number;
  unitPrice: number;
  /** Whether the returned unit was resalable and added back to stock. */
  restock: boolean;
  productId?: Types.ObjectId | null;
}

/** A customer return against this sale — a credit note with a cash refund. */
export interface IInvoiceReturn {
  /** Credit-note number, e.g. "INV-2001/R1". */
  number: string;
  date: Date;
  reason: string;
  note: string;
  /** Cash refunded to the customer. */
  refund: number;
  /** COGS reversed for the units that went back into stock. */
  restockedCost: number;
  employeeId: Types.ObjectId | null;
  items: IInvoiceReturnItem[];
}

export interface IInvoice {
  _id: Types.ObjectId;
  number: string;
  customerId: Types.ObjectId;
  employeeId: Types.ObjectId | null;
  installationId: Types.ObjectId | null;
  /** Where the invoice originated. */
  source: "installation" | "pos" | "manual";
  /** Line items shown on the printed invoice. */
  items: IInvoiceItem[];
  discount: number;
  taxRate: number; // percent
  shipping: number;
  /** Total / balance due = subtotal - discount + tax + shipping. */
  amount: number;
  /** Cost of goods / materials for this job  used for accurate profit (profit = amount - cost). */
  cost: number;
  paid: number;
  status: InvoiceStatus;
  /** Customer returns recorded against this sale (audit trail). */
  returns: IInvoiceReturn[];
  /** Running total of cash refunded via returns (reverses revenue + collected). */
  returnedAmount: number;
  /** Running total of COGS reversed by restocked returns. */
  returnedCost: number;
  date: Date;
  notes: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IInvoice>(
  {
    number: { type: String, required: true, unique: true, index: true },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
      index: true,
    },
    installationId: {
      type: Schema.Types.ObjectId,
      ref: "Installation",
      default: null,
    },
    source: {
      type: String,
      enum: ["installation", "pos", "manual"],
      default: "manual",
      index: true,
    },
    items: {
      type: [
        new Schema<IInvoiceItem>(
          {
            description: { type: String, required: true, trim: true },
            qty: { type: Number, default: 1, min: 0 },
            unitPrice: { type: Number, default: 0, min: 0 },
            productId: { type: Schema.Types.ObjectId, ref: "Product", default: null },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    discount: { type: Number, default: 0, min: 0 },
    taxRate: { type: Number, default: 0, min: 0 },
    shipping: { type: Number, default: 0, min: 0 },
    amount: { type: Number, required: true, min: 0 },
    cost: { type: Number, default: 0, min: 0 },
    paid: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected"],
      default: "draft",
      index: true,
    },
    returns: {
      type: [
        new Schema<IInvoiceReturn>(
          {
            number: { type: String, required: true },
            date: { type: Date, required: true },
            reason: { type: String, default: "" },
            note: { type: String, default: "" },
            refund: { type: Number, default: 0, min: 0 },
            restockedCost: { type: Number, default: 0, min: 0 },
            employeeId: {
              type: Schema.Types.ObjectId,
              ref: "Employee",
              default: null,
            },
            items: {
              type: [
                new Schema<IInvoiceReturnItem>(
                  {
                    index: { type: Number, required: true, min: 0 },
                    description: { type: String, default: "" },
                    qty: { type: Number, required: true, min: 0 },
                    unitPrice: { type: Number, default: 0, min: 0 },
                    restock: { type: Boolean, default: true },
                    productId: {
                      type: Schema.Types.ObjectId,
                      ref: "Product",
                      default: null,
                    },
                  },
                  { _id: false },
                ),
              ],
              default: [],
            },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    returnedAmount: { type: Number, default: 0, min: 0 },
    returnedCost: { type: Number, default: 0, min: 0 },
    date: { type: Date, required: true, index: true },
    notes: { type: String, default: "" },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
);

export const Invoice: Model<IInvoice> = registerModel<IInvoice>(
  "Invoice",
  schema,
);
