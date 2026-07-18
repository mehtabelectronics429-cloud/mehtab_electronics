import { Schema, type Model, type Types } from "mongoose";
import { registerModel } from "@/lib/db/registerModel";

export interface ICategory {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  image: string;
  description: string;
  order: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, trim: true, lowercase: true, index: true },
    image: { type: String, default: "" },
    description: { type: String, default: "" },
    order: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

export const Category: Model<ICategory> = registerModel<ICategory>("Category", schema);
