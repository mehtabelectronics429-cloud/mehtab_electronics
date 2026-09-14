import { Schema, type Model, type Types } from "mongoose";
import { registerModel } from "@/lib/db/registerModel";

export type ExpenseMethod = "cash" | "bank" | "card" | "other";

export interface IExpense {
  _id: Types.ObjectId;
  category: string;
  amount: number;
  date: Date;
  paidTo: string;
  method: ExpenseMethod;
  note: string;
  /** Optional link to the employee who incurred / handled the expense. */
  employeeId: Types.ObjectId | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IExpense>(
  {
    category: { type: String, required: true, trim: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, index: true },
    paidTo: { type: String, default: "", trim: true },
    method: {
      type: String,
      enum: ["cash", "bank", "card", "other"],
      default: "cash",
      index: true,
    },
    note: { type: String, default: "" },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
      index: true,
    },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
);

schema.index({ category: "text", paidTo: "text", note: "text" });

export const Expense: Model<IExpense> = registerModel<IExpense>(
  "Expense",
  schema,
);
