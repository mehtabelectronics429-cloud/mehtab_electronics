import { Schema, type Model, type Types } from "mongoose";
import { registerModel } from "@/lib/db/registerModel";

export interface IEmployee {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  title: string;
  /** Permission category — mirrored to the login Profile.role. */
  role: "admin" | "manager" | "cashier" | "technician";
  active: boolean;
  assigned: number;
  completed: number;
  rating: number;
  joinedAt: Date;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IEmployee>(
  {
    name: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    phone: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    role: { type: String, enum: ["admin", "manager", "cashier", "technician"], default: "technician", index: true },
    active: { type: Boolean, default: true, index: true },
    assigned: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    rating: { type: Number, default: 5 },
    joinedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

export const Employee: Model<IEmployee> = registerModel<IEmployee>("Employee", schema);
