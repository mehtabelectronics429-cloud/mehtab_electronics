import { Schema, type Model, type Types } from "mongoose";
import { registerModel } from "@/lib/db/registerModel";

export interface ISettings {
  _id: Types.ObjectId;
  key: string;
  value: Record<string, unknown>;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<ISettings>(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, default: {} },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

export const Settings: Model<ISettings> = registerModel<ISettings>("Settings", schema);
