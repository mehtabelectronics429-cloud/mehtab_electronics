import { Schema, type Model, type Types } from "mongoose";
import { registerModel } from "@/lib/db/registerModel";

export interface IMaterial {
  _id: Types.ObjectId;
  name: string;
  unit: string;
  opening: number;
  issued: number;
  used: number;
  returned: number;
  damaged: number;
  reorder: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IMaterial>(
  {
    name: { type: String, required: true, trim: true, index: true },
    unit: { type: String, required: true, trim: true },
    opening: { type: Number, default: 0 },
    issued: { type: Number, default: 0 },
    used: { type: Number, default: 0 },
    returned: { type: Number, default: 0 },
    damaged: { type: Number, default: 0 },
    reorder: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

export const Material: Model<IMaterial> = registerModel<IMaterial>("Material", schema);
