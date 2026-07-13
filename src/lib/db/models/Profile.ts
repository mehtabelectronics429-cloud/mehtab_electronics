import { Schema, type Model, type Types } from "mongoose";
import { registerModel } from "@/lib/db/registerModel";

export interface IProfile {
  _id: Types.ObjectId;
  email: string;
  name: string;
  role: "admin" | "employee";
  employeeId: Types.ObjectId | null;
  passwordHash: string | null;
  googleId: string | null;
  avatar: string;
  title: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IProfile>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ["admin", "employee"], required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", default: null, index: true },
    passwordHash: { type: String, default: null },
    googleId: { type: String, default: null, index: true },
    avatar: { type: String, default: "" },
    title: { type: String, default: "" },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

export const Profile: Model<IProfile> = registerModel<IProfile>("Profile", schema);
